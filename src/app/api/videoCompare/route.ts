import { NextResponse } from 'next/server'
import { formatNumber, parseDuration, formatDate } from '@/lib/youtube'
import {
  YOUTUBE_API_BASE_URL,
  YOUTUBE_API_KEY,
  VideoData,
  extractVideoId,
  fetchVideoData,
  formatDurationForDisplay,
} from '@/lib/youtubeApi'

// All YouTube API related functions have been moved to youtubeApi.ts

export async function POST(req: Request) {
  try {
    const { firstVideoUrl, secondVideoUrl } = await req.json()

    if (!firstVideoUrl || !secondVideoUrl) {
      return NextResponse.json({ error: 'Both video URLs are required' }, { status: 400 })
    }

    // Extract video IDs from URLs
    const firstVideoId = extractVideoId(firstVideoUrl)
    const secondVideoId = extractVideoId(secondVideoUrl)

    if (!firstVideoId || !secondVideoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL(s)' }, { status: 400 })
    }

    // Fetch data for both videos in parallel
    const [firstVideo, secondVideo] = await Promise.all([
      fetchVideoData(firstVideoId),
      fetchVideoData(secondVideoId),
    ])

    // Prepare comparison data for charts
    const pieData = [
      {
        name: firstVideo.title,
        views: firstVideo.views,
        likes: firstVideo.likes,
        comments: firstVideo.comments,
        color: '#3B82F6', // Blue
      },
      {
        name: secondVideo.title,
        views: secondVideo.views,
        likes: secondVideo.likes,
        comments: secondVideo.comments,
        color: '#A855F7', // Purple
      },
    ]

    const barData = [
      {
        name: 'Views (millions)',
        video1: firstVideo.views / 1000000,
        video2: secondVideo.views / 1000000,
      },
      {
        name: 'Likes (millions)',
        video1: firstVideo.likes / 1000000,
        video2: secondVideo.likes / 1000000,
      },
      {
        name: 'Comments (millions)',
        video1: firstVideo.comments / 1000000,
        video2: secondVideo.comments / 1000000,
      },
    ]

    // Calculate engagement metrics
    const firstVideoEngagement = {
      likeToViewRatio: (firstVideo.likes / firstVideo.views) * 100,
      commentToViewRatio: (firstVideo.comments / firstVideo.views) * 100,
    }

    const secondVideoEngagement = {
      likeToViewRatio: (secondVideo.likes / secondVideo.views) * 100,
      commentToViewRatio: (secondVideo.comments / secondVideo.views) * 100,
    }

    return NextResponse.json({
      videos: {
        first: firstVideo,
        second: secondVideo,
      },
      chartData: {
        pieData,
        barData,
      },
      engagement: {
        first: firstVideoEngagement,
        second: secondVideoEngagement,
      },
    })
  } catch (error) {
    console.error('Error in video comparison route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compare videos' },
      { status: 500 }
    )
  }
}
