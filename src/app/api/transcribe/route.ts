import { NextResponse } from 'next/server'
import { Innertube } from 'youtubei.js/web'

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json()
    
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    })

    const transcript = await fetchTranscript(youtube, videoId)
    return NextResponse.json({ transcript })

  } catch (error) {
    console.error('Error in transcript route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

function formatTimestamp(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        fullTranscript
      }
    } catch (error) {
      console.error('Error fetching transcript:', error)
      throw error
    }
  }

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}