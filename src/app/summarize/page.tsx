"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, ThumbsUp, Calendar, ChevronDown, ChevronUp, Loader2, CircleCheckBig } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([])
  const [summary, setSummary] = useState("")

  const router = useRouter()
  const abortControllerRef = useRef<AbortController | null>(null)

  const streamSummary = useCallback(async (fullTranscript: string) => {
    setIsSummarizing(true)
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: `Summarize this transcript: ${fullTranscript}` }
    setMessages(prev => [...prev, userMessage])

    try {
      abortControllerRef.current = new AbortController()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch summary')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let streamedSummary = ''
      const decoder = new TextDecoder()
      let buffer = ''

      const updateSummary = (newContent: string) => {
        streamedSummary += newContent
        setSummary(streamedSummary)
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), { ...lastMessage, content: streamedSummary }]
          } else {
            return [...prev, { id: Date.now().toString(), role: 'assistant', content: streamedSummary }]
          }
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('0:')) {
            const content = JSON.parse(line.slice(2))
            updateSummary(content)
          }
        }
      }

      if (buffer) {
        const content = JSON.parse(buffer.slice(2))
        updateSummary(content)
      }

    } catch (error:any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted')
      } else {
        console.error('Error:', error)
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'An error occurred while generating the summary.' }])
      }
    } finally {
      setIsSummarizing(false)
    }
  }, [])

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsSummarizing(false)
    setSummary("")
    setMessages([])

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

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
     
      const transcriptData = await response.json()
      const fullTranscript = transcriptData.transcript.fullTranscript
      
      setTranscriptData(fullTranscript)

      setShowSuccess(true)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // I used it to Trigger summary generation
      await streamSummary(fullTranscript)

      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)

    } catch (error) {
      console.error("Error fetching data:", error)
      setTranscriptData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
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
              <FeatureCard type="summarize" />
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
                    <div>
                    <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Full Summary</h3>
                        <ScrollArea className="h-[400px]">
                                    {messages.map(m => (
                        <div 
                        key={m.id} 
                        className={`flex ${m.role === 'user' ? 'hidden' : 'justify-start'}`}
                        >
                        <div 
                            className={`
                            max-w-[80%] rounded-lg px-4 py-2
                            ${m.role === 'user' 
                                ? ' text-white' 
                                : ' text-white'}
                            `}
                        >
                            <div className="text-lg font-bold text-white mb-1">
                            {m.role === 'user' ? 'You' : 'AI Summarizer'}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                             <Markdown remarkPlugins={[remarkGfm]}>
                                {m.content}
                            </Markdown>
                            </div>
                        </div>
                        </div>
                    ))}

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
            <form onSubmit={handleSubmission} className="flex space-x-2 w-2/3 mx-auto">
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
                    Summarizing...
                  </>
                ) : showSuccess ? (
                  <>
                    <CircleCheckBig className="w-4 h-4 mr-2 text-green-400" />
                    Video Summarized
                  </>
                ) : (
                  "Summarize"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}