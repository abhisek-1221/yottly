'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowRight, BarChart2, Layout, MessageCircle, Activity } from 'lucide-react'
import { fetchVideoComparison } from '@/lib/api'
import Header from '@/components/hsr/header'
import FeatureCard from '@/components/hsr/FeatureCard'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface PieDataEntry {
  name: string
  views: number
  likes: number
  comments: number
  color?: string
}

interface BarDataEntry {
  name: string
  video1: number
  video2: number
}

const YouTubeComparison = () => {
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [firstVideoUrl, setFirstVideoUrl] = useState('')
  const [secondVideoUrl, setSecondVideoUrl] = useState('')
  const [comparisonData, setComparisonData] = useState<any>(null)

  const handleComparison = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await fetchVideoComparison(firstVideoUrl, secondVideoUrl)
      setComparisonData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare videos')
    } finally {
      setLoading(false)
    }
  }

  const videos = comparisonData?.videos || {
    first: {
      id: '',
      title: '',
      channel: '',
      views: 0,
      viewsFormatted: '0 views',
      published: '',
      description: '',
      likes: 0,
      likesFormatted: '0',
      comments: 0,
      commentsFormatted: '0',
      thumbnails: { high: { url: '' } },
    },
    second: {
      id: '',
      title: '',
      channel: '',
      views: 0,
      viewsFormatted: '0 views',
      published: '',
      description: '',
      likes: 0,
      likesFormatted: '0',
      comments: 0,
      commentsFormatted: '0',
      thumbnails: { high: { url: '' } },
    },
  }

  const pieData = (comparisonData?.chartData?.pieData || []) as PieDataEntry[]
  const barData = (comparisonData?.chartData?.barData || []) as BarDataEntry[]
  const COLORS = ['rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)']

  const viewsRatioData = [
    {
      name: videos.first.title,
      value: videos.first.views,
      color: COLORS[0],
    },
    {
      name: videos.second.title,
      value: videos.second.views,
      color: COLORS[1],
    },
  ]

  const commentsRatioData = [
    {
      name: videos.first.title,
      value: videos.first.comments,
      color: COLORS[0],
    },
    {
      name: videos.second.title,
      value: videos.second.comments,
      color: COLORS[1],
    },
  ]

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'visual', label: 'Visual', icon: <Layout className="w-4 h-4" /> },
    { id: 'comments', label: 'Comments', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'engagement', label: 'Engagement', icon: <Activity className="w-4 h-4" /> },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm p-3 border border-gray-700 rounded-lg shadow-xl">
          <p className="font-medium text-gray-200">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || COLORS[index % COLORS.length] }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card
        className={`w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl 2xl:scale-150 ${
          comparisonData ? 'scale-90 2xl:scale-125' : ''
        }`}
      >
        <CardContent className="p-6 flex flex-col min-h-[700px] relative">
          {/* Header - Always visible */}
          <Header />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {/* Welcome Message - Only shown initially */}
            {!comparisonData && <FeatureCard type="compare" />}

            {/* Comparison Results */}
            <AnimatePresence>
              {comparisonData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[videos.first, videos.second].map((video, idx) => (
                      <Card
                        key={idx}
                        className="bg-black/50 backdrop-blur-sm border-gray-800 overflow-hidden"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={video.thumbnails?.high?.url || '/api/placeholder/640/360'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h2 className="text-lg font-bold text-white truncate">{video.title}</h2>
                            <p className="text-sm text-gray-300">
                              {video.channel} • {video.viewsFormatted}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-black/50 backdrop-blur-sm border-gray-800">
                    <div className="border-b border-gray-800">
                      <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            className={`flex items-center px-6 py-3 font-medium relative ${
                              activeTab === tab.id
                                ? 'text-blue-400'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            {tab.icon}
                            <span className="ml-2">{tab.label}</span>
                            {activeTab === tab.id && (
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                                layoutId="activeTab"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {activeTab === 'stats' && (
                        <div className="space-y-8">
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="video1" name={videos.first.title} fill="#3B82F6" />
                                <Bar dataKey="video2" name={videos.second.title} fill="#A855F7" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="h-[300px]">
                              <h3 className="text-center font-medium mb-4">Views Distribution</h3>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={viewsRatioData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    dataKey="value"
                                  >
                                    {viewsRatioData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="h-[300px]">
                              <h3 className="text-center font-medium mb-4">
                                Comments Distribution
                              </h3>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={commentsRatioData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    dataKey="value"
                                  >
                                    {commentsRatioData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pieData.map((entry, index) => (
                              <div key={index} className="h-[300px]">
                                <h3 className="text-center font-medium mb-4">{entry.name}</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { name: 'Views', value: entry.views },
                                        { name: 'Likes', value: entry.likes },
                                        { name: 'Comments', value: entry.comments },
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={80}
                                      fill={entry.color}
                                      dataKey="value"
                                    >
                                      {pieData.map((_, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'visual' && comparisonData?.engagement && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            {
                              data: videos.first,
                              color: 'blue',
                              metrics: comparisonData.engagement.first,
                            },
                            {
                              data: videos.second,
                              color: 'purple',
                              metrics: comparisonData.engagement.second,
                            },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-4">
                              <h3 className={`text-lg font-semibold text-${item.color}-400`}>
                                {item.data.title}
                              </h3>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">Engagement Score</span>
                                  <div className="flex space-x-1">
                                    {Array.from({
                                      length: Math.round(item.metrics.likeToViewRatio / 20),
                                    }).map((_, i) => (
                                      <span
                                        key={i}
                                        className={`w-6 h-2 bg-${item.color}-500 rounded`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">Interaction Rate</span>
                                  <div className="flex space-x-1">
                                    {Array.from({
                                      length: Math.round(item.metrics.commentToViewRatio / 20),
                                    }).map((_, i) => (
                                      <span
                                        key={i}
                                        className={`w-6 h-2 bg-${item.color}-500 rounded`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'engagement' && comparisonData?.engagement && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            {
                              data: videos.first,
                              color: 'blue',
                              metrics: comparisonData.engagement.first,
                            },
                            {
                              data: videos.second,
                              color: 'purple',
                              metrics: comparisonData.engagement.second,
                            },
                          ].map((item, idx) => (
                            <Card
                              key={idx}
                              className={`bg-${item.color}-500/10 border-${item.color}-500/20`}
                            >
                              <CardContent className="p-6">
                                <h3 className={`text-lg font-semibold text-${item.color}-400 mb-4`}>
                                  {item.data.title}
                                </h3>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-400 mb-1">Like-to-View Ratio</p>
                                    <div className="text-2xl font-bold">
                                      {item.metrics.likeToViewRatio.toFixed(2)}%
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400 mb-1">
                                      Comment-to-View Ratio
                                    </p>
                                    <div className="text-2xl font-bold">
                                      {item.metrics.commentToViewRatio.toFixed(2)}%
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area - Always visible at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-zinc-800 rounded-b-2xl">
            <form onSubmit={handleComparison} className="flex space-x-2 w-2/3 mx-auto">
              <Input
                type="text"
                placeholder="Enter first YouTube URL..."
                value={firstVideoUrl}
                onChange={(e) => setFirstVideoUrl(e.target.value)}
                className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full"
              />
              <Input
                type="text"
                placeholder="Enter second YouTube URL..."
                value={secondVideoUrl}
                onChange={(e) => setSecondVideoUrl(e.target.value)}
                className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full"
              />
              <Button
                type="submit"
                disabled={loading}
                className="px-6 rounded-full bg-red-700 hover:bg-red-500 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Compare Videos'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default YouTubeComparison
