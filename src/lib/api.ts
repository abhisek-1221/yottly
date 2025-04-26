/**
 * API utility functions for making requests to the backend API routes
 */

/**
 * Fetch channel analytics data from the API
 * @param channelUrl YouTube channel URL
 */
export async function fetchChannelAnalytics(channelUrl: string) {
  try {
    const response = await fetch('/api/channelAnalytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelUrl }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch channel analytics')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching channel analytics:', error)
    throw error
  }
}

/**
 * Fetch video comparison data from the API
 * @param firstVideoUrl First YouTube video URL
 * @param secondVideoUrl Second YouTube video URL
 */
export async function fetchVideoComparison(firstVideoUrl: string, secondVideoUrl: string) {
  try {
    const response = await fetch('/api/videoCompare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstVideoUrl, secondVideoUrl }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to compare videos')
    }

    return await response.json()
  } catch (error) {
    console.error('Error comparing videos:', error)
    throw error
  }
}
