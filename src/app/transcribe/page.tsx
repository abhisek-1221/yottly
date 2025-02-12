"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Eye, ThumbsUp, Calendar, ChevronLeft, Search, ChevronDown, ChevronUp, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useChat } from 'ai/react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


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

const cleanTranscriptText = (text: string) => {
  return text
    .replace(/&amp;#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [transcriptData, setTranscriptData] = useState<any[]>([])
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)


  const router = useRouter()

  const handleSubmissiom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Fetch video details
      const videoResponse = await fetch("/api/videoDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
      const videoData = await videoResponse.json()
      if (videoData.video) {
        setVideoDetails(videoData.video)
      }

      // Fetch transcript
      const transcriptResponse = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
      const transcriptData = await transcriptResponse.json()

      if (typeof transcriptData.transcript === "string") {
        setTranscriptData([
          {
            text: cleanTranscriptText(transcriptData.transcript),
            offset: 0,
          },
        ])
      } else if (Array.isArray(transcriptData.transcript)) {
        const cleanedTranscript = transcriptData.transcript.map((entry: any) => ({
          ...entry,
          text: cleanTranscriptText(entry.text),
        }))
        setTranscriptData(cleanedTranscript)
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

  const { messages, input,  setInput, handleInputChange, handleSubmit } = useChat();    

  const handleSummarize = async () => {
    setIsSummarizing(true);
    await handleSubmit();
    setIsSummarizing(false);
  }

  useEffect(() => {
    if (fullTranscript) {
      setInput(fullTranscript)
    }
  }, [fullTranscript, setInput])
  

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-7xl"
    >
      <Card className="mb-6 bg-gradient-to-r from-stone-900 via-transparent to-black text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push("/")} variant="ghost" className="text-white">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </motion.div>
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-3xl font-bold"
            >
              YouTube Video Transcript
            </motion.h1>
          </div>
          <form onSubmit={handleSubmissiom} className="flex gap-2">
            <motion.div initial={{ width: "100%" }} whileFocus={{ scale: 1.02 }} className="flex-grow relative">
              <Input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube video URL"
                className="w-full h-12 px-4 rounded-lg border-2 border-white focus:outline-none focus:border-yellow-300 transition-all duration-300 bg-white/20 text-white placeholder-white/70"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-6 font-semibold bg-red-900 text-white-900 hover:bg-red-500"
              >
                {loading ? "Loading..." : "Get Transcript"}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {videoDetails && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[1fr,2fr]">
                <motion.div whileHover={{ scale: 1.05 }} className="aspect-video relative overflow-hidden">
                  <img
                    src={
                      videoDetails.thumbnails.maxres?.url ||
                      videoDetails.thumbnails.high?.url ||
                      videoDetails.thumbnails.medium?.url
                    }
                    alt={videoDetails.title}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold leading-tight text-primary">{videoDetails.title}</h2>
                  <p className="text-secondary-foreground">{videoDetails.channelTitle}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {formatDate(videoDetails.publishedAt)}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full"
                    >
                      <Clock className="w-4 h-4 text-green-500" />
                      {formatTime(videoDetails.duration)}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                    >
                      <Eye className="w-4 h-4 text-purple-500" />
                      {formatNumber(videoDetails.viewCount)} views
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >
                      <ThumbsUp className="w-4 h-4 text-red-500" />
                      {formatNumber(videoDetails.likeCount)} likes
                    </motion.div>
                  </div>
                  <div>
                    <p className={`text-muted-foreground ${showFullDescription ? "" : "line-clamp-2"}`}>
                      {videoDetails.description}
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 p-0 h-auto font-semibold text-blue-500"
                    >
                      {showFullDescription ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {transcriptData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Timestamped Transcript</h2>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[500px]">
                <div className="p-4 grid gap-4">
                  {transcriptData.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-r from-stone-950 via-transparent to-stone-800 hover:from-stone-900 hover:to-gray-900 transition-colors">
                        <CardHeader className="p-3 pb-2">
                          <div className="text-sm text-blue-600 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {formatTime(entry.offset)}
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <p className="text-white font-semibold">{entry.text}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="h-[600px] bg-gradient-to-r from-stone-950 via-transparent to-stone-800">
            <CardHeader className="flex justify-center items-center">
              <h2 className="text-xl font-semibold text-primary">Full Transcript</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4">
                  <p className="text-white/90 font-medium leading-relaxed whitespace-pre-wrap">{fullTranscript}</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </motion.div>
      )}
    {transcriptData.length > 0 && (
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-4 "
  >
          <Card className="h-[600px] w-full bg-gradient-to-r from-stone-950 via-transparent to-stone-800">
                      <CardHeader className="flex justify-between items-center">
                            <h1 className="font-bold text-3xl">Summary</h1>
                      </CardHeader>
                      <CardContent className="p-0">
                        
                        <ScrollArea className="h-[500px]">
                          <div className="p-8">
                            {messages.map((message, index) => (
                              <div 
                                key={index} 
                                className={`mb-4 p-6 rounded-lg ${
                                  message.role === 'assistant' 
                                    ? 'bg-stale-950 text-white text-sm whitespace-pre-wrap p-4' 
                                    : "flex justify-center items-center font-mono text-orange-300"
                                }`}
                              >
                                  {message.role === 'assistant' ? (
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </Markdown>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-orange-300"></div>
                                  <span>Generating summary...</span>
                                </div>
                                )}

                              </div>
                            ))}

                          </div>
  
                          <form onSubmit={handleSubmit} className="flex justify-center items-center gap-4">
                    <input
                      value={input}
                      placeholder={`Enter your text here`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#f55036] hidden"
                    />
                    <button 
                      type="submit"
                      className="rounded-lg bg-[#f55036] px-4 py-1 text-white hover:bg-[#d94530] focus:outline-none focus:ring-2 focus:ring-[#f55036]"
                    >
                      Summarize
                    </button>
                  </form>
                        </ScrollArea>
                      </CardContent>
                    </Card>
  </motion.div>
      )}
      

    </motion.main>

  )
}

