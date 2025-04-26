// YouTube API constants and interfaces for reuse across the application
import { formatNumber, formatDate, parseDuration } from '@/lib/youtube'

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
export const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

// Channel related interfaces
export interface ChannelData {
  name: string
  username: string
  videosCount: number
  subscribers: number
  subscriberRank?: number
  totalViews: number
  viewsRank?: number
  thumbnails: any
  country?: string
}

export interface ViewData {
  name: string
  views: number
}

export interface RecentVideo {
  title: string
  views: number
  uploadTime: string
  thumbnail: string
  videoId: string
}

// Video related interfaces
export interface VideoData {
  id: string
  title: string
  channel: string
  channelId: string
  views: number
  viewsFormatted: string
  published: string
  description: string
  likes: number
  likesFormatted: string
  comments: number
  commentsFormatted: string
  duration: number
  durationFormatted: string
  thumbnails: any
}

// Helper functions for YouTube URL parsing
export function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:v=|\/?\/(?:embed|shorts|v)\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\/watch\?.+&v=)([^&?/\n\s]+)/
  )
  return match ? match[1] : null
}

export function extractChannelId(url: string): string | null {
  // Handle channel URLs in format: https://www.youtube.com/channel/UC...
  const channelRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([^\/\n\s]+)/
  const channelMatch = url.match(channelRegex)
  if (channelMatch) return channelMatch[1]

  // Handle custom URLs in format: https://www.youtube.com/c/ChannelName
  const customUrlRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([^\/\n\s]+)/
  const customMatch = url.match(customUrlRegex)
  if (customMatch) {
    // For custom URLs, we need to make an additional API call to get the channel ID
    return null // Will handle this in the main function
  }

  // Handle @username format
  const usernameRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^\/\n\s]+)/
  const usernameMatch = url.match(usernameRegex)
  if (usernameMatch) {
    // For usernames, we need to make an additional API call to get the channel ID
    return null // Will handle this in the main function
  }

  return null
}

export async function getChannelIdFromUsername(username: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${username}&type=channel&key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch channel ID')
    }

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId
    }

    return null
  } catch (error) {
    console.error('Error getting channel ID from username:', error)
    return null
  }
}

export async function fetchChannelData(channelId: string): Promise<ChannelData> {
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch channel data')
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found')
  }

  const channel = data.items[0]

  return {
    name: channel.snippet.title,
    username: `@${channel.snippet.customUrl || channel.snippet.title.toLowerCase().replace(/\s+/g, '')}`,
    videosCount: parseInt(channel.statistics.videoCount || '0'),
    subscribers: parseInt(channel.statistics.subscriberCount || '0'),
    totalViews: parseInt(channel.statistics.viewCount || '0'),
    thumbnails: channel.snippet.thumbnails,
    country: channel.snippet.country,
  }
}

export async function fetchRecentVideos(channelId: string, maxResults = 5): Promise<RecentVideo[]> {
  // First get the uploads playlist ID
  const channelResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch channel uploads playlist')
  }

  const channelData = await channelResponse.json()

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error('Channel not found')
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

  // Now get the recent videos from the uploads playlist
  const videosResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
  )

  if (!videosResponse.ok) {
    throw new Error('Failed to fetch recent videos')
  }

  const videosData = await videosResponse.json()

  if (!videosData.items || videosData.items.length === 0) {
    return []
  }

  // Get video IDs to fetch statistics
  const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',')

  const statsResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  )

  if (!statsResponse.ok) {
    throw new Error('Failed to fetch video statistics')
  }

  const statsData = await statsResponse.json()

  // Map video stats to video items
  return videosData.items.map((item: any) => {
    const videoId = item.snippet.resourceId.videoId
    const stats = statsData.items.find((stat: any) => stat.id === videoId)
    const publishedDate = new Date(item.snippet.publishedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let uploadTime = ''
    if (diffDays < 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      uploadTime = `First ${diffHours} hours`
    } else {
      uploadTime = `${diffDays} days ago`
    }

    return {
      title: item.snippet.title,
      views: parseInt(stats?.statistics.viewCount || '0'),
      uploadTime,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      videoId: videoId,
    }
  })
}

// to be refactored with Channel Analytics API later

export async function fetchViewsData(channelId: string, days = 6): Promise<ViewData[]> {
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch channel statistics')
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found')
  }

  const totalViews = parseInt(data.items[0].statistics.viewCount || '0')

  const avgDailyViews = Math.floor(totalViews / 365)

  const viewsData: ViewData[] = []
  for (let i = 1; i <= days; i++) {
    const randomFactor = 0.7 + Math.random() * 0.6
    const dailyViews = Math.floor(avgDailyViews * randomFactor)

    viewsData.push({
      name: i.toString(),
      views: dailyViews,
    })
  }

  return viewsData
}

// Format duration for display in hours:minutes:seconds format
export function formatDurationForDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

// Fetch video data from YouTube API
export async function fetchVideoData(videoId: string): Promise<VideoData> {
  // Fetch video details
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch video details')
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found')
  }

  const video = data.items[0]
  const channelId = video.snippet.channelId

  // Fetch channel details to get the channel name
  const channelResponse = await fetch(
    `${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch channel details')
  }

  const channelData = await channelResponse.json()
  const channelName = channelData.items?.[0]?.snippet?.title || 'Unknown Channel'

  // Parse video data
  const views = parseInt(video.statistics.viewCount || '0')
  const likes = parseInt(video.statistics.likeCount || '0')
  const comments = parseInt(video.statistics.commentCount || '0')
  const duration = parseDuration(video.contentDetails.duration)

  return {
    id: video.id,
    title: video.snippet.title,
    channel: channelName,
    channelId: channelId,
    views: views,
    viewsFormatted: `${formatNumber(views)} views`,
    published: formatDate(video.snippet.publishedAt),
    description: video.snippet.description,
    likes: likes,
    likesFormatted: formatNumber(likes),
    comments: comments,
    commentsFormatted: formatNumber(comments),
    duration: duration,
    durationFormatted: formatDurationForDisplay(duration),
    thumbnails: video.snippet.thumbnails,
  }
}
