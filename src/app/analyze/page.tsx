'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDuration } from '@/lib/youtube'
import type { PlaylistDetails, VideoItem } from '@/lib/youtube'
import { Clock, SortAsc, PlayCircle, FastForward, Calendar } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toast } from '@/components/searchbar/toast'
import { VideoCard } from '@/components/VideoCard'
import Header from '@/components/hsr/header'
import FeatureCard from '@/components/hsr/FeatureCard'

export default function PlaylistAnalyzer() {
  const [playlistUrl, setplaylistUrl] = useState('')
  const [playlistData, setPlaylistData] = useState<{
    playlistDetails: PlaylistDetails
    videos: VideoItem[]
    totalDuration: number
    totalVideos: number
  } | null>(null)
  const [rangeStart, setRangeStart] = useState('1')
  const [rangeEnd, setRangeEnd] = useState('100')
  const [sortBy, setSortBy] = useState('position')
  const [state, setState] = useState<'initial' | 'loading' | 'success'>('initial')
  const [error, setError] = useState<string | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState('1')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAnalyze = async () => {
    setState('loading')
    try {
      const response = await fetch(`/api/playlist?id=${playlistUrl}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch playlist data')
      }

      setPlaylistData(data)
      setRangeEnd(data.totalVideos.toString())
      setState('success')

      setTimeout(() => {
        setState('initial')
      }, 2000)
    } catch (error: any) {
      console.error('Error analyzing playlist:', error)
      setError(error.message)

      setTimeout(() => {
        setState('initial')
      }, 2000)
    }
  }

  const handleReset = () => {
    setState('initial')
  }

  const filteredVideos = useMemo(() => {
    if (!playlistData) return []
    const start = Number.parseInt(rangeStart) - 1
    const end = Number.parseInt(rangeEnd)
    return playlistData.videos
      .slice(start, end)
      .filter((video) => video.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [playlistData, rangeStart, rangeEnd, searchQuery])

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return b.duration - a.duration
        case 'views':
          return b.viewCount - a.viewCount
        case 'likes':
          return b.likeCount - a.likeCount
        case 'publishDate':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        default:
          return 0 // Default to original order
      }
    })
  }, [filteredVideos, sortBy])

  const totalDuration = useMemo(() => {
    return filteredVideos?.reduce((acc, video) => acc + video.duration, 0)
  }, [filteredVideos])

  const adjustedDuration = Math.round(totalDuration / Number.parseFloat(playbackSpeed))

  const rangeOptions = useMemo(() => {
    if (!playlistData) return []
    return Array.from({ length: playlistData.totalVideos }, (_, i) => (i + 1).toString())
  }, [playlistData])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl 2xl:scale-150">
        <CardContent className="p-6 flex flex-col min-h-[700px] relative">
          {/* Header - Always visible */}
          <Header />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {/* Welcome Message - Only shown initially */}
            {!playlistData && <FeatureCard type="analyze" />}

            {/* Analysis Results - Shown after data fetch */}
            {playlistData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 mb-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                    <CardContent>
                      <h3 className="text-lg font-bold mb-4">Playlist Summary</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          <span className="font-bold">
                            Total Videos: {playlistData?.totalVideos}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">
                            Total Duration: {formatDuration(adjustedDuration)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filters Card */}
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-2">Filters</h3>
                      <div className="flex items-center gap-4">
                        {/* Playback Speed */}
                        <div className="flex-1">
                          <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                            <SelectTrigger className="w-full">
                              <FastForward className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Speed" />
                            </SelectTrigger>
                            <SelectContent>
                              {['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2'].map(
                                (speed) => (
                                  <SelectItem key={speed} value={speed}>
                                    {speed}x
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort By */}
                        <div className="flex-1">
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full">
                              <SortAsc className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Position', 'Duration', 'Views', 'Likes', 'Publish Date'].map(
                                (option) => (
                                  <SelectItem key={option} value={option.toLowerCase()}>
                                    {option}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Range Selection */}
                        <div className="flex-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-200" />
                          <Select value={rangeStart} onValueChange={setRangeStart}>
                            <SelectTrigger className="w-full border-gray-600">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent className="border-gray-600">
                              {rangeOptions.map((option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                  className="text-white hover:bg-gray-600"
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-gray-400">-</span>
                          <Select value={rangeEnd} onValueChange={setRangeEnd}>
                            <SelectTrigger className="w-full border-gray-600">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent className="border-gray-600">
                              {rangeOptions.map((option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                  className="text-white hover:bg-gray-600"
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mt-4">
                        Analyzing videos {rangeStart} to {rangeEnd} at speed: {playbackSpeed}x
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search Bar */}
                <div className="flex justify-center">
                  <Input
                    className="w-full max-w-md bg-transparent border-zinc-700 rounded-full"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Video Grid */}

                <ScrollArea className="h-[350px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedVideos.map((video) => (
                      <VideoCard key={video.id} video={video} searchQuery={searchQuery} />
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </div>

          {/* Input Area - Always visible at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-zinc-800 rounded-2xl">
            <div className="flex space-x-2 w-2/3 mx-auto">
              <Input
                className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full"
                placeholder="Enter YouTube Playlist ID..."
                value={playlistUrl}
                onChange={(e) => setplaylistUrl(e.target.value)}
              />
              <Toast state={state} onSave={handleAnalyze} onReset={handleReset} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
