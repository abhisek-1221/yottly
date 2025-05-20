import { NextResponse } from 'next/server'
import { transcribeRateLimiter } from '@/lib/ratelimit'
import { Innertube } from 'youtubei.js/web'

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

async function fetchTranscript(youtube: any, videoId: string) {
  try {
    const info = await youtube.getInfo(videoId)
    const transcriptData = await info.getTranscript()

    const segments = transcriptData.transcript.content.body.initial_segments.map(
      (segment: any) => ({
        text: segment.snippet.text,
        startTime: formatTimestamp(parseInt(segment.start_ms)),
        endTime: formatTimestamp(parseInt(segment.end_ms)),
      })
    )

    const fullTranscript: string = segments
      .map((segment: { text: string }) => segment.text)
      .join(' ')
      .trim()

    return {
      segments,
      fullTranscript,
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'

    let rateLimitResult
    try {
      rateLimitResult = await transcribeRateLimiter.limit(ip)
    } catch (error) {
      console.error('Rate limiter error:', error)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    const { success, limit, remaining, reset } = rateLimitResult

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

    const { videoUrl } = await request.json()
    if (!videoUrl) {
      return NextResponse.json({ error: 'No videoUrl provided' }, { status: 400 })
    }

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const youtube = await Innertube.create({
      lang: 'en',
      location: 'IN',
      retrieve_player: false,
    })

    const transcript = await fetchTranscript(youtube, videoId)

    return NextResponse.json({
      transcript,
      rateLimit: {
        limit,
        remaining,
        reset,
      },
    })
  } catch (error: any) {
    console.error('Error in transcript route:', error)

    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
