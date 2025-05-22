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

    // Check if video info was retrieved successfully
    if (!info) {
      throw new Error('Failed to retrieve video information')
    }

    const transcriptData = await info.getTranscript()

    // Check if transcript data exists
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video')
    }

    // Check if transcript content exists
    if (!transcriptData.transcript.content || !transcriptData.transcript.content.body) {
      throw new Error('Transcript content is not available')
    }

    const segments = transcriptData.transcript.content.body.initial_segments

    // Check if segments exist
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      throw new Error('No transcript segments found for this video')
    }

    const processedSegments = segments.map((segment: any) => ({
      text: segment.snippet.text,
      startTime: formatTimestamp(parseInt(segment.start_ms)),
      endTime: formatTimestamp(parseInt(segment.end_ms)),
    }))

    const fullTranscript: string = processedSegments
      .map((segment: { text: string }) => segment.text)
      .join(' ')
      .trim()

    // Check if we got actual transcript content
    if (!fullTranscript || fullTranscript.length === 0) {
      throw new Error('Transcript appears to be empty')
    }

    return {
      segments: processedSegments,
      fullTranscript,
    }
  } catch (error: any) {
    console.error('Error fetching transcript:', error)

    // Provide more specific error messages based on the error type
    if (error.message?.includes('CompositeVideoPrimaryInfo')) {
      throw new Error(
        'This video may have restricted access or the YouTube parser needs updating. Please try a different video.'
      )
    }

    if (error.message?.includes('Transcript is disabled')) {
      throw new Error('Transcripts are disabled for this video')
    }

    if (error.message?.includes('No transcript available')) {
      throw new Error(
        'No transcript is available for this video. The video may not have captions enabled.'
      )
    }

    if (error.message?.includes('Private video') || error.message?.includes('Video unavailable')) {
      throw new Error('This video is private or unavailable')
    }

    if (
      error.message?.includes('No transcript available') ||
      error.message?.includes('Transcript content is not available') ||
      error.message?.includes('No transcript segments found') ||
      error.message?.includes('Transcript appears to be empty')
    ) {
      throw error
    }

    throw new Error(`Failed to fetch transcript: ${error.message || 'Unknown error occurred'}`)
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

    // Try creating Innertube with retry logic for parsing issues
    let youtube
    let transcript
    let lastError

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        youtube = await Innertube.create({
          lang: 'en',
          location: 'IN',
          retrieve_player: false,
        })

        transcript = await fetchTranscript(youtube, videoId)
        break // Success, exit retry loop
      } catch (error: any) {
        lastError = error
        console.log(`Attempt ${attempt} failed:`, error.message)

        // If it's a CompositeVideoPrimaryInfo error and we have another attempt, wait and retry
        if (attempt < 2 && error.message?.includes('CompositeVideoPrimaryInfo')) {
          console.log('Retrying due to YouTube parser issue...')
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
          continue
        }

        throw error
      }
    }

    if (!transcript) {
      throw lastError || new Error('Failed to fetch transcript after retries')
    }

    if (!transcript || !transcript.fullTranscript) {
      throw new Error('Failed to extract transcript from video')
    }

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
