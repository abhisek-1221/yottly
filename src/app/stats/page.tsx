'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { Star, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchChannelAnalytics } from '@/lib/api'
import { ChannelData, ViewData, RecentVideo } from '@/lib/youtubeApi'
import { VideoCard } from '@/components/VideoCard'
import Header from '@/components/hsr/header'
import FeatureCard from '@/components/hsr/FeatureCard'
import { ScrollArea } from '@/components/ui/scroll-area'

const COLORS = ['#f3f4f6', '#ef4444']

// Video type data (static for now as this isn't available directly from the API)
const videoTypeData = [
  { name: 'Short Videos', value: 15.7 },
  { name: 'Long Videos', value: 5.8 },
]

export default function StatsPage() {
  const [channelUrl, setChannelUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [channelData, setChannelData] = useState<ChannelData | null>(null)
  const [viewsData, setViewsData] = useState<ViewData[]>([])
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelUrl) return

    setIsLoading(true)
    setError('')

    try {
      const data = await fetchChannelAnalytics(channelUrl)
      setChannelData(data.channelData)
      setViewsData(data.viewsData)
      setRecentVideos(data.recentVideos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channel data')
      console.error('Error fetching channel data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card
        className={`w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl 2xl:scale-150 ${
          channelData ? 'scale-90 2xl:scale-125' : ''
        }`}
      >
        <CardContent className="p-6 flex flex-col min-h-[700px] relative">
          {/* Header - Always visible */}
          <Header />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {/* Welcome Message - Only shown initially */}
            {!channelData && <FeatureCard type="stats" />}

            {/* Analysis Results - Shown after data fetch */}
            {channelData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 mb-2"
              >
                {/* Channel Info Card */}
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-yellow-500 rounded-md overflow-hidden flex items-center justify-center">
                        {channelData?.thumbnails?.default?.url ? (
                          <img
                            src={channelData.thumbnails.default.url}
                            alt={channelData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="text-4xl font-bold">{channelData?.name.charAt(0)}</div>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold">{channelData?.name}</h1>
                          {channelData?.country && (
                            <span className="text-sm text-gray-400">
                              {channelData.country === 'US' ? '🇺🇸' : channelData.country}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400">
                          {channelData?.username} • {channelData?.videosCount.toLocaleString()}{' '}
                          videos
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-gray-400">Subscribers</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">
                              {channelData && typeof channelData.subscribers === 'number'
                                ? channelData.subscribers >= 1000000
                                  ? `${(channelData.subscribers / 1000000).toFixed(1)}M`
                                  : channelData.subscribers >= 1000
                                    ? `${(channelData.subscribers / 1000).toFixed(1)}K`
                                    : channelData.subscribers.toString()
                                : '0'}
                            </span>
                            {channelData?.subscriberRank && (
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                #{channelData.subscriberRank}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400">Total Views</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">
                              {channelData && typeof channelData.totalViews === 'number'
                                ? channelData.totalViews >= 1000000000
                                  ? `${(channelData.totalViews / 1000000000).toFixed(1)}B`
                                  : channelData.totalViews >= 1000000
                                    ? `${(channelData.totalViews / 1000000).toFixed(1)}M`
                                    : channelData.totalViews >= 1000
                                      ? `${(channelData.totalViews / 1000).toFixed(1)}K`
                                      : channelData.totalViews.toString()
                                : '0'}
                            </span>
                            {channelData?.viewsRank && (
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                #{channelData.viewsRank}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading channel data...</span>
                  </div>
                ) : channelData ? (
                  <>
                    <div className="grid grid-cols-12 gap-4 mt-4">
                      <Card className="col-span-3 border-gray-700">
                        <CardContent className="p-4">
                          <h2 className="text-gray-400 text-xs mb-2">VIEWS</h2>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {viewsData.length > 0
                                ? viewsData.reduce((sum, item) => sum + item.views, 0) >= 1000000
                                  ? `${(viewsData.reduce((sum, item) => sum + item.views, 0) / 1000000).toFixed(1)}M`
                                  : viewsData.reduce((sum, item) => sum + item.views, 0) >= 1000
                                    ? `${(viewsData.reduce((sum, item) => sum + item.views, 0) / 1000).toFixed(1)}K`
                                    : viewsData
                                        .reduce((sum, item) => sum + item.views, 0)
                                        .toString()
                                : '0'}
                            </span>
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center">
                              <span>
                                {viewsData.length > 0
                                  ? viewsData[0].views >= 1000000
                                    ? `${(viewsData[0].views / 1000000).toFixed(1)}M`
                                    : viewsData[0].views >= 1000
                                      ? `${(viewsData[0].views / 1000).toFixed(1)}K`
                                      : viewsData[0].views.toString()
                                  : '0'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">LAST 7 DAYS</p>
                        </CardContent>
                      </Card>

                      <Card className="col-span-3 border-gray-700">
                        <CardContent className="p-4">
                          <h2 className="text-gray-400 text-xs mb-2">SUBS</h2>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">0</span>
                            <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center">
                              <span>--</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">LAST 7 DAYS</p>
                        </CardContent>
                      </Card>

                      <Card className="col-span-3 border-gray-700">
                        <CardContent className="p-4">
                          <h2 className="text-gray-400 text-xs mb-2">EST REV</h2>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {viewsData.length > 0
                                ? `$${((viewsData.reduce((sum, item) => sum + item.views, 0) * 0.001) / 1000).toFixed(1)}K`
                                : '$0'}
                            </span>
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center">
                              <span>
                                {viewsData.length > 0
                                  ? `$${((viewsData[0].views * 0.002) / 1000).toFixed(1)}K`
                                  : '$0'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">LAST 7 DAYS</p>
                        </CardContent>
                      </Card>

                      <Card className="col-span-3 border-gray-700 row-span-2">
                        <CardHeader>
                          <CardTitle className="text-md">Most Recent Video</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {recentVideos.length > 0 ? (
                            <>
                              <div className="aspect-video bg-gray-700 rounded mb-3 overflow-hidden">
                                <img
                                  src={recentVideos[0].thumbnail}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <h3 className="font-medium">{recentVideos[0].title}</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                {recentVideos[0].uploadTime}
                              </p>

                              <div className="mt-4">
                                <h4 className="text-sm text-gray-400">Total Views</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span>
                                    {recentVideos[0].views >= 1000000
                                      ? `${(recentVideos[0].views / 1000000).toFixed(1)}M`
                                      : recentVideos[0].views >= 1000
                                        ? `${(recentVideos[0].views / 1000).toFixed(1)}K`
                                        : recentVideos[0].views}
                                  </span>
                                </div>
                                <a
                                  href={`https://youtube.com/watch?v=${recentVideos[0].videoId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-4 text-center transition-colors"
                                >
                                  Watch Now
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-gray-400 py-4">
                              No recent videos found
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="col-span-6 border-gray-700">
                        <CardContent className="pt-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-4">
                              <h2 className="text-lg font-bold">Views</h2>
                              <span className="text-sm text-gray-400">Subscribers</span>
                            </div>
                            <button className="px-2 py-0.5 rounded bg-gray-600 text-sm">7D</button>
                          </div>
                          <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={viewsData}
                                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  stroke="#444"
                                  strokeDasharray="3 3"
                                  vertical={false}
                                />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="views"
                                  stroke="#ef4444"
                                  fillOpacity={1}
                                  fill="url(#colorViews)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="col-span-3 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-md">Longs vs Shorts Views</CardTitle>
                          <p className="text-xs text-gray-400">Last 7 Days • Estimated</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500"></div>
                                <span className="text-sm text-gray-400">Long Views</span>
                              </div>
                              <div className="text-xl font-bold">{videoTypeData[1].value}M</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300"></div>
                                <span className="text-sm text-gray-400">Short Views</span>
                              </div>
                              <div className="text-xl font-bold">{videoTypeData[0].value}M</div>
                            </div>
                          </div>

                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={videoTypeData}
                                  cx="50%"
                                  cy="50%"
                                  startAngle={0}
                                  endAngle={360}
                                  innerRadius={40}
                                  outerRadius={60}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {videoTypeData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Videos Section */}
                    <Card className="border-gray-700 mt-4">
                      <CardHeader>
                        <CardTitle className="text-md">Recent Videos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[350px] w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                            {recentVideos.map((video) => (
                              <VideoCard
                                key={video.videoId}
                                video={{
                                  id: video.videoId,
                                  title: video.title,
                                  description: '',
                                  thumbnails: {
                                    default: { url: video.thumbnail, width: 120, height: 90 },
                                    medium: { url: video.thumbnail, width: 320, height: 180 },
                                    high: { url: video.thumbnail, width: 480, height: 360 },
                                  },
                                  channelTitle: channelData?.name || '',
                                  publishedAt: new Date(
                                    Date.now() - parseInt(video.uploadTime) * 24 * 60 * 60 * 1000
                                  ).toISOString(),
                                  duration: video.duration,
                                  viewCount: video.views,
                                  likeCount: video.likeCount,
                                }}
                                searchQuery=""
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </motion.div>
            )}
          </div>

          {/* Input Area - Always visible at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-zinc-800 rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex space-x-2 w-2/3 mx-auto">
              <Input
                type="text"
                placeholder="Enter YouTube channel URL..."
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 rounded-full bg-red-700 hover:bg-red-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Analyze Channel'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
