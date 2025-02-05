"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VideoCard } from "./VideoCard"
import { formatDuration } from "@/lib/youtube"
import type { PlaylistDetails, VideoItem } from "@/lib/youtube"
import { Clock, SortAsc, PlayCircle, AlertCircle, Search } from "lucide-react"
import FeatureSearchBar from "./featurebar"
import { Toast } from "./searchbar/toast"
import YouTube from "@/app/icons/yt"


export default function PlaylistAnalyzer() {
  const [playlistUrl, setplaylistUrl] = useState("")
  const [playlistData, setPlaylistData] = useState<{
    playlistDetails: PlaylistDetails
    videos: VideoItem[]
    totalDuration: number
    totalVideos: number
  } | null>(null)
  const [rangeStart, setRangeStart] = useState("1")
  const [rangeEnd, setRangeEnd] = useState("100")
  const [sortBy, setSortBy] = useState("position")
  const [state, setState] = useState<"initial" | "loading" | "success">("initial")
  const [error, setError] = useState<string | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState("1")
  const [searchQuery, setSearchQuery] = useState("")

  const handleAnalyze = async () => {
    setState("loading")
    try {
      const response = await fetch(`/api/playlist?id=${playlistUrl}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch playlist data")
      }
      
      setPlaylistData(data) 
      setState("success")
      
      setTimeout(() => {
        setState("initial")
      }, 2000)
    } catch (error: any) {
      console.error("Error analyzing playlist:", error)
      setError(error.message)
      
      setTimeout(() => {
        setState("initial")
      }, 2000)
    }
  }

  const handleReset = () => {
    setState("initial")
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
        case "duration":
          return b.duration - a.duration
        case "views":
          return b.viewCount - a.viewCount
        case "likes":
          return b.likeCount - a.likeCount
        case "publishDate":
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
        <div>
            <FeatureSearchBar />
        </div>
      <Card className="mb-8 overflow-hidden shadow-2xl shadow-gray-700 rounded-3xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">YouTube Playlist Analyzer</h1>
          <div className="flex gap-4 mb-6">
          <div className="relative flex-grow bg-stone-950 rounded-xl overflow-hidden text-white shadow-lg">
    <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <YouTube className="text-white w-6 h-6" />
    </div>
    <Input
        placeholder="Enter YouTube Playlist ID"
        value={playlistUrl}
        onChange={(e) => setplaylistUrl(e.target.value)}
        className="pl-10 bg-transparent text-white placeholder-stone-950 placeholder:text-lg placeholder:font-semibold focus:outline-none w-full shadow-lg shadow-stone-900"
    />
</div>
            

            <Toast
        state={state} 
        onSave={handleAnalyze} 
        onReset={handleReset}
      />
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
              <AlertCircle className="mr-2" />
              <span>Error: {error}</span>
            </div>
          )}
          {playlistData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 text-white">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-2">Playlist Summary</h2>
                    <div className="flex items-center mb-2">
                      <YouTube className="mr-8" />
                      <span>Total Videos: {playlistData.totalVideos}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2" />
                      <span>Total Duration: {formatDuration(adjustedDuration)}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">Range Selector</h3>
                    <div className="flex gap-4 mb-2">
                    
                    </div>
                    <p className="text-sm text-gray-600">
                      Analyzing videos {rangeStart} to {rangeEnd}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <SortAsc className="mr-2" /> Sorting
                    </h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="position">Position</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="likes">Likes</SelectItem>
                        <SelectItem value="publishDate">Publish Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <PlayCircle className="mr-2" /> Playback Speed
                    </h3>
                    <div className="flex flex-row gap-2 mb-2">
                          <div>
                                <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Playback Speed" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.25">0.25x</SelectItem>
                                        <SelectItem value="0.5">0.5x</SelectItem>
                                        <SelectItem value="0.75">0.75x</SelectItem>
                                        <SelectItem value="1">1x</SelectItem>
                                        <SelectItem value="1.25">1.25x</SelectItem>
                                        <SelectItem value="1.5">1.5x</SelectItem>
                                        <SelectItem value="1.75">1.75x</SelectItem>
                                        <SelectItem value="2">2x</SelectItem>
                                    </SelectContent>
                                    </Select>
                          </div>

                          <div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="position">Position</SelectItem>
                                    <SelectItem value="duration">Duration</SelectItem>
                                    <SelectItem value="views">Views</SelectItem>
                                    <SelectItem value="likes">Likes</SelectItem>
                                    <SelectItem value="publishDate">Publish Date</SelectItem>
                                </SelectContent>
                                </Select>
                          </div>

                          <div className="flex gap-4 mb-2">
                          <Select value={rangeStart} onValueChange={setRangeStart}>
                        <SelectTrigger>
                          <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent>
                          {rangeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={rangeEnd} onValueChange={setRangeEnd}>
                        <SelectTrigger>
                          <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent>
                          {rangeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                          </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">Analyzing videos {rangeStart} to {rangeEnd} at speed: {playbackSpeed}x</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Search className="mr-2" /> Search Videos
                </h3>
                <Input
                  placeholder="Search video titles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
      {sortedVideos && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 flex justify-center items-center">Video List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <VideoCard video={video} searchQuery={searchQuery} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
