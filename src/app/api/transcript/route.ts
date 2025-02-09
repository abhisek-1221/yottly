import { NextResponse } from "next/server"

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export async function POST(request: Request) {
  const { videoUrl } = await request.json()

  try {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    // First, get video details to check if captions are available
    const videoResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    )
    const videoData = await videoResponse.json()

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Get captions for the video
    const captionsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`,
    )
    const captionsData = await captionsResponse.json()
    console.log("Caption Data:", captionsData);
    

    if (!captionsData.items || captionsData.items.length === 0) {
      return NextResponse.json({ error: "No captions found for this video" }, { status: 404 })
    }

    // Get the first available caption track
    const captionTrack = captionsData.items[0]
    console.log("CapTrack:", captionTrack);
    
    // Get the actual transcript
    const transcriptResponse = await fetch(`${YOUTUBE_API_BASE_URL}/captions/${captionTrack.id}?key=${YOUTUBE_API_KEY}`)
    console.log("Transcript Response:", transcriptResponse);
    
    if (!transcriptResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 })
    }

    const transcript = await transcriptResponse.text()

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Error fetching transcript:", error)
    return NextResponse.json({ error: "Error fetching transcript" }, { status: 500 })
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

