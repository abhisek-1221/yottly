"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDuration } from "@/lib/youtube"
import type { PlaylistDetails, VideoItem } from "@/lib/youtube"
import { Clock, SortAsc, PlayCircle, FastForward, Calendar, Youtube, Undo2 } from "lucide-react"
import YouTube from "@/app/icons/yt"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toast } from "@/components/searchbar/toast"
import { VideoCard } from "@/components/VideoCard"

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

  const router = useRouter();


  const handleAnalyze = async () => {
    setState("loading")
    try {
      const response = await fetch(`/api/playlist?id=${playlistUrl}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch playlist data")
      }
      
      setPlaylistData(data) 
      setRangeEnd(data.totalVideos.toString())
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
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl">
        <CardContent className="p-6 flex flex-col min-h-[700px] relative">
          {/* Header - Always visible */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <YouTube className="w-5 h-5" />
            </div>
            <span className="text-sm text-zinc-400">YouTube Playlist Analyzer</span>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/")}>
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {/* Welcome Message - Only shown initially */}
            {!playlistData && (
              <div className="text-center my-12">
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <YouTube className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-semibold mb-2">YouTube Playlist Analyzer</h1>
                <h2 className="text-xl text-zinc-400 mb-4">Analyze and filter your playlists</h2>
                <p className="text-sm text-zinc-500 mb-8">
                  Enter your playlist ID below to get started with detailed analytics<br />
                  including duration, views, and more.
                </p>
              </div>
            )}

            {/* Feature Cards - Only shown initially */}
            {!playlistData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto mb-8 px-10 w-3/4 ml-32">
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                  <div className="flex space-x-3 mt-2">
                  <Clock className="w-5 h-5 mb-3" />
                  <h3 className="font-medium mb-1">Duration Analysis</h3>
                  </div>
                  
                  <p className="text-xs text-zinc-400">Track total watching time</p>
                </Card>
                
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                <div className="flex space-x-3 mt-2">
                <SortAsc className="w-5 h-5 mb-3" />
                  <h3 className="font-medium mb-1">Smart Sorting</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Order by views, duration, or date or search query</p>
                </Card>
                
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                <div className="flex space-x-3 mt-2">
                <PlayCircle className="w-5 h-5 mb-3" />
                  <h3 className="font-medium mb-1">Playback Control</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Adjust speed and manage content</p>
                </Card>
              </div>
            )}

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
                          <span className="font-bold">Total Videos: {playlistData?.totalVideos}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">Total Duration: {formatDuration(adjustedDuration)}</span>
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
                              {["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"].map((speed) => (
                                <SelectItem key={speed} value={speed}>
                                  {speed}x
                                </SelectItem>
                              ))}
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
                              {["Position", "Duration", "Views", "Likes", "Publish Date"].map((option) => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
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
                                <SelectItem key={option} value={option} className="text-white hover:bg-gray-600">
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
                                <SelectItem key={option} value={option} className="text-white hover:bg-gray-600">
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
                <Toast
                  state={state}
                  onSave={handleAnalyze}
                  onReset={handleReset}
                />
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
