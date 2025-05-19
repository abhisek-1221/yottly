import { NextResponse } from 'next/server'
import { transcribeRateLimiter } from '@/lib/ratelimit'
import {
  transcribeQueue,
  transcribeQueueEvents,
  isQueueOverloaded,
  getPositionInQueue,
} from '@/lib/transcribeQueue'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'

    const { success, limit, remaining, reset } = await transcribeRateLimiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          limit,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    const overloaded = await isQueueOverloaded()
    if (overloaded) {
      return NextResponse.json(
        {
          error: 'Server is busy. Please try again later.',
          limit,
          remaining,
          reset,
        },
        {
          status: 503,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    const { videoUrl } = await request.json()
    if (!videoUrl) {
      return NextResponse.json({ error: 'No videoUrl provided' }, { status: 400 })
    }

    const job = await transcribeQueue.add('transcribe-job', { videoUrl })

    const position = await getPositionInQueue(job.id)

    if (position && position > 1) {
      return NextResponse.json(
        {
          status: 'queued',
          jobId: job.id,
          position,
          message: `Your request is in queue position ${position}. Please wait...`,
        },
        { status: 202 }
      )
    }

    const result = await job.waitUntilFinished(transcribeQueueEvents, 45000)

    if (!result) {
      return NextResponse.json(
        {
          status: 'processing',
          jobId: job.id,
          message: 'Transcript processing. Try again in a moment.',
        },
        { status: 202 }
      )
    }

    return NextResponse.json({
      transcript: result,
      rateLimit: {
        limit,
        remaining,
        reset,
      },
    })
  } catch (error: any) {
    console.error('Error in transcript route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'No jobId provided' }, { status: 400 })
  }

  const job = await transcribeQueue.getJob(jobId)

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const state = await job.getState()
  const position = state === 'waiting' ? await getPositionInQueue(jobId as string) : null

  if (state === 'completed') {
    const result = await job.getResult()
    return NextResponse.json({ status: 'completed', transcript: result })
  }

  return NextResponse.json({
    status: state,
    position,
    message: position
      ? `Your request is in queue position ${position}. Please wait...`
      : 'Job still processing. Try again in a moment.',
  })
}
