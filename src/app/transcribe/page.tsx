"use client"

import { useState, useEffect } from "react"

// Extend the Window interface to include onYouTubeIframeAPIReady
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Eye, ThumbsUp, Calendar, ChevronDown, ChevronUp, Loader2, CircleCheckBig, Download } from "lucide-react"
import type React from "react"
import Header from "@/components/hsr/header"
import FeatureCard from "@/components/hsr/FeatureCard"
import { formatDate, formatNumber } from "@/lib/youtube"


interface VideoDetails {
  id: string
  title: string
  description: string
  thumbnails: {
    maxres?: { url: string }
    high?: { url: string }
    medium?: { url: string }
  }
  channelTitle: string
  publishedAt: string
  duration: number
  viewCount: number
  likeCount: number
}


export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [transcriptData, setTranscriptData] = useState<any[]>([])
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [player, setPlayer] = useState<any>(null)
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false)

  useEffect(() => {
    // Declare the onYouTubeIframeAPIReady callback
    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiReady(true)
    }

    // Load the YouTube IFrame API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  const handleSubmissiom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const videoResponse = await fetch("/api/videoDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
      const videoData = await videoResponse.json()
      if (videoData.video) {
        setVideoDetails(videoData.video)
      }

      const transcriptResponse = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
      const transcriptData = await transcriptResponse.json()

      if (transcriptData.transcript) {

        if (transcriptData.transcript.segments) {
          const formattedTranscript = transcriptData.transcript.segments.map((segment: any) => ({
            text: segment.text,
            startTime: segment.startTime,
            endTime: segment.endTime,
          }))
          setTranscriptData(formattedTranscript)
        } else if (transcriptData.transcript.fullTranscript) {
          setTranscriptData([
            {
              text: transcriptData.transcript.fullTranscript,
              startTime: "0:00",
              endTime: "0:00",
            },
          ])
        }
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
        }, 4000) // Reset after 4 seconds
      } else {
        setTranscriptData([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setTranscriptData([])
    }
    setLoading(false)
  }

  const fullTranscript = transcriptData.map((entry) => entry.text).join(" ")  
  const filteredTranscripts = transcriptData.filter((entry) => 
    entry?.text?.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([fullTranscript], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `transcript-${videoDetails?.title || "video"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleTimestampedDownload = () => {
    const formattedTranscript = transcriptData
      .map(entry => `[${entry.startTime} - ${entry.endTime}]\n${entry.text}\n`)
      .join('\n')
    
    const element = document.createElement("a")
    const file = new Blob([formattedTranscript], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `timestamped-transcript-${videoDetails?.title || "video"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleTimestampClick = (startTime: string) => {
    if (player) {
      // Convert timestamp (MM:SS) to seconds
      const [minutes, seconds] = startTime.split(':').map(Number)
      const timeInSeconds = minutes * 60 + seconds
      player.seekTo(timeInSeconds)
      player.playVideo()
    }
  }

  return (
    <>
      <script src="https://www.youtube.com/iframe_api" />
      <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
        <Card 
          className={`w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl 2xl:scale-150 ${
            videoDetails && transcriptData.length > 0 ? 'scale-90 2xl:scale-125' : ''
          }`}
        >
          <CardContent className="p-6 flex flex-col min-h-[700px] relative">
            {/* Header - Always visible */}
            <Header />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pb-20">
              {/* Welcome Message - Only shown initially */}
              {!videoDetails && (
                <FeatureCard type="transcribe" />
              )}

              {/* Video Details and Transcript */}
              {videoDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {/* Video Info Card */}
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-[1fr,2fr] gap-4">
                        <div className="aspect-video relative overflow-hidden rounded-lg">
                          {isYouTubeApiReady && videoDetails?.id && (
                            <iframe
                              src={`https://www.youtube.com/embed/${videoDetails.id}?enablejsapi=1`}
                              title={videoDetails.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                              onLoad={(e) => {
                                const player = new (window as any).YT.Player(e.target, {
                                  events: {
                                    onReady: (event: any) => {
                                      setPlayer(event.target)
                                    },
                                  },
                                })
                              }}
                            />
                          )}
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-xl font-bold">{videoDetails.title}</h2>
                          <p className="text-zinc-400">{videoDetails.channelTitle}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-full text-sm">
                              <Calendar className="w-4 h-4 text-yellow-600" />
                              {formatDate(videoDetails.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-full text-sm">
                              <Eye className="w-4 h-4 text-blue-400" />
                              {formatNumber(videoDetails.viewCount)} views
                            </span>
                            <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-full text-sm">
                              <ThumbsUp className="w-4 h-4 text-green-500" />
                              {formatNumber(videoDetails.likeCount)} likes
                            </span>
                          </div>
                          <div>
                            <p className={`text-zinc-400 ${showFullDescription ? "" : "line-clamp-2"}`}>
                              {videoDetails.description}
                            </p>
                            <Button
                              variant="ghost"
                              onClick={() => setShowFullDescription(!showFullDescription)}
                              className="mt-2 p-0 h-auto text-zinc-400 hover:text-white"
                            >
                              {showFullDescription ? (
                                <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
                              ) : (
                                <>Show more <ChevronDown className="w-4 h-4 ml-1" /></>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transcripts */}

                  {transcriptData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Timestamped Transcript */}
                      <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">Timestamped Transcript</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleTimestampedDownload}
                                className="hover:bg-zinc-800 rounded-full"
                              >
                                <Download className="h-4 w-4 text-zinc-400 hover:text-white" />
                              </Button>
                            </div>
                            
                            {/* Search Input */}
                            <div className="relative">
                              <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search in transcript..."
                                className="w-full bg-zinc-800/50 border-zinc-700 focus:border-zinc-600 rounded-lg"
                              />
                            </div>
                      
                            <ScrollArea className="h-[350px]">
                              <div className="space-y-3">
                                {filteredTranscripts.map((entry, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-zinc-800/50 p-3 rounded-lg cursor-pointer hover:bg-zinc-700/50 transition-colors"
                                    onClick={() => handleTimestampClick(entry.startTime)}
                                  >
                                    <div className="text-sm flex items-center gap-2 mb-1 text-blue-400">
                                      <Clock className="w-4 h-4" />
                                      {entry.startTime} - {entry.endTime}
                                    </div>
                                    <p className="text-sm">{entry.text}</p>
                                  </motion.div>
                                ))}
                                
                                {/* No results message */}
                                {filteredTranscripts.length === 0 && (
                                  <div className="text-center py-4 text-zinc-500">
                                    No matching transcripts found
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Full Transcript */}
                      <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Full Transcript</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleDownload}
                              className="hover:bg-zinc-800 rounded-full"
                            >
                              <Download className="h-4 w-4 text-zinc-400 hover:text-white" />
                            </Button>
                          </div>
                          <ScrollArea className="h-[400px]">
                            <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                              {fullTranscript}
                            </p>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>    
                    )}
                </motion.div>
              )}
            </div>

            {/* Input Area - Always visible at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-zinc-800 rounded-b-2xl">
              <form onSubmit={handleSubmissiom} className="flex space-x-2 w-2/3 mx-auto">
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube video URL..."
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
                  ) : showSuccess ? (
                    <>
                      <CircleCheckBig className="w-4 h-4 mr-2 text-green-400" />
                      Got Transcript
                    </>
                  ) : (
                    "Get Transcript"
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}