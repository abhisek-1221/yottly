import { NextResponse } from 'next/server'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnails: any
  channelTitle: string
  publishedAt: string
  duration: number // in seconds
  viewCount: number
  likeCount: number
}

// Helper function to extract `videoId` from YouTube URL
function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:v=|\/(?:embed|shorts|v)\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\/watch\?.+&v=)([^&?/]+)/
  )
  return match ? match[1] : null
}

// Converts YouTube duration (ISO 8601) to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

// API Handler
export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json()

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing video URL' }, { status: 400 })
    }

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Fetch video details from YouTube API
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails,snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video details' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const item = data.items[0]

    const videoDetails: VideoItem = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails.duration),
      viewCount: parseInt(item.statistics.viewCount, 10),
      likeCount: parseInt(item.statistics.likeCount, 10),
    }

    return NextResponse.json({ video: videoDetails })
  } catch (error) {
    console.error('Error fetching video details:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
