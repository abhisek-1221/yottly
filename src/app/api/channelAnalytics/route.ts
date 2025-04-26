import { NextResponse } from 'next/server'
import {
  extractChannelId,
  getChannelIdFromUsername,
  fetchChannelData,
  fetchRecentVideos,
  fetchViewsData,
} from '@/lib/youtubeApi'

// All YouTube API related functions and interfaces have been moved to youtubeApi.ts

export async function POST(req: Request) {
  try {
    const { channelUrl } = await req.json()

    if (!channelUrl) {
      return NextResponse.json({ error: 'Missing channel URL' }, { status: 400 })
    }

    // Extract channel ID from URL
    let channelId = extractChannelId(channelUrl)

    // If we couldn't extract the channel ID directly, we tried to get it from username
    if (!channelId) {
      // Try to extract username
      const usernameMatch = channelUrl.match(
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^\/\n\s]+)/
      )
      const customUrlMatch = channelUrl.match(
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([^\/\n\s]+)/
      )

      const username = usernameMatch ? usernameMatch[1] : customUrlMatch ? customUrlMatch[1] : null

      if (username) {
        channelId = await getChannelIdFromUsername(username)
      }
    }

    if (!channelId) {
      return NextResponse.json({ error: 'Invalid YouTube channel URL' }, { status: 400 })
    }

    const channelData = await fetchChannelData(channelId)

    const recentVideos = await fetchRecentVideos(channelId)

    // Fetch views data for chart
    const viewsData = await fetchViewsData(channelId)

    return NextResponse.json({
      channelData,
      recentVideos,
      viewsData,
    })
  } catch (error) {
    console.error('Error in channel analytics route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch channel analytics' },
      { status: 500 }
    )
  }
}
