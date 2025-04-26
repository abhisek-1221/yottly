import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { extractVideoId } from '@/lib/youtubeApi'

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json()

    // Extract Video ID from URL
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Fetch transcript
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json({ error: 'No transcript found' }, { status: 404 })
    }

    // Return the full transcript data array
    return NextResponse.json({ transcript: transcriptData })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json({ error: 'Error fetching transcript' }, { status: 500 })
  }
}

// Using extractVideoId from youtubeApi.ts
