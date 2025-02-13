"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Eye, ThumbsUp, Calendar, ChevronLeft, Search, ChevronDown, ChevronUp, FileText, Undo2, Loader2, Check, CircleCheckBig } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useChat } from 'ai/react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import YouTube from "../icons/yt"


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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}


export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [transcriptData, setTranscriptData] = useState<any[]>([])
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card 
        className={`w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl ${
          videoDetails && transcriptData.length > 0 ? 'scale-90' : ''
        }`}
      >
        <CardContent className="p-6 flex flex-col min-h-[700px] relative">
          {/* Header - Always visible */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <YouTube className="w-5 h-5" />
            </div>
            <span className="text-sm text-zinc-400">YouTube Video Transcript</span>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/")}>
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {/* Welcome Message - Only shown initially */}
            {!videoDetails && (
              <div className="text-center my-12">
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <YouTube className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-semibold mb-2">YouTube Video Transcript</h1>
                <h2 className="text-xl text-zinc-400 mb-4">Get timestamped transcripts with ease</h2>
                <p className="text-sm text-zinc-500 mb-8">
                  Enter your video URL below to get started with detailed transcripts<br />
                  including timestamps and full text.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-[8rem] px-10 w-3/4 ml-32">
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                    <div className="flex space-x-3 mt-2">
                      <Clock className="w-5 h-5 mb-3" />
                      <h3 className="font-medium mb-1">Timestamped</h3>
                    </div>
                    <p className="text-xs text-zinc-400">Precise timing for every segment</p>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                    <div className="flex space-x-3 mt-2">
                      <Eye className="w-5 h-5 mb-3" />
                      <h3 className="font-medium mb-1">Full Text</h3>
                    </div>
                    <p className="text-xs text-zinc-400">Complete transcript for easy reading</p>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
                    <div className="flex space-x-3 mt-2">
                      <ThumbsUp className="w-5 h-5 mb-3" />
                      <h3 className="font-medium mb-1">Video Details</h3>
                    </div>
                    <p className="text-xs text-zinc-400">Comprehensive video information</p>
                  </Card>
                </div>
              </div>
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
                        <img
                          src={videoDetails.thumbnails.maxres?.url || videoDetails.thumbnails.high?.url}
                          alt={videoDetails.title}
                          className="object-cover w-full h-full"
                        />
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
                        <h3 className="text-lg font-semibold mb-4">Timestamped Transcript</h3>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-3">
                            {transcriptData.map((entry, index) => (
                              <div key={index} className="bg-zinc-800/50 p-3 rounded-lg">
                                <div className="text-sm flex items-center gap-2 mb-1 text-blue-400">
                                  <Clock className="w-4 h-4" />
                                  {entry.startTime} - {entry.endTime}
                                </div>
                                <p className="text-sm">{entry.text}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Full Transcript */}
                    <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Full Transcript</h3>
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
  )
}