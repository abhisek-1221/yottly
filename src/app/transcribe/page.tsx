'use client'

import { useState, useEffect, use } from 'react'
import { useToast } from '@/hooks/use-toast'

// Extend the Window interface to include onYouTubeIframeAPIReady
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
  }
}
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  Eye,
  ThumbsUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  CircleCheckBig,
  Download,
} from 'lucide-react'
import type React from 'react'
import Header from '@/components/hsr/header'
import FeatureCard from '@/components/hsr/FeatureCard'
import { formatDate, formatNumber } from '@/lib/youtube'
import { useChat } from 'ai/react'
import { FancyButton } from '@/components/ui/fancy-button'

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
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState('')
  const [transcriptData, setTranscriptData] = useState<any[]>([])
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [player, setPlayer] = useState<any>(null)
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false)

  useEffect(() => {
    // Declare the onYouTubeIframeAPIReady callback
    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiReady(true)
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  const handleSubmissiom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const videoResponse = await fetch('/api/videoDetail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })
      const videoData = await videoResponse.json()

      if (!videoResponse.ok) {
        throw new Error(videoData.error || 'Failed to fetch video details')
      }

      if (videoData.video) {
        setVideoDetails(videoData.video)
      }

      const transcriptResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      // Handle rate limit exceeded
      if (transcriptResponse.status === 429) {
        const data = await transcriptResponse.json()
        toast({
          title: 'Rate Limit Exceeded',
          description: `Too many requests. Please try again in ${Math.ceil((data.reset - Date.now()) / 1000)} seconds.`,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json()
        throw new Error(errorData.error || 'Failed to fetch transcript')
      }

      const transcriptData = await transcriptResponse.json()
      handleTranscriptData(transcriptData.transcript)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setTranscriptData([])
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch transcript',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  // Helper function to process transcript data
  const handleTranscriptData = (transcript: any) => {
    if (!transcript) return

    if (transcript.segments) {
      const formattedTranscript = transcript.segments.map((segment: any) => ({
        text: segment.text,
        startTime: segment.startTime,
        endTime: segment.endTime,
      }))
      setTranscriptData(formattedTranscript)
    } else if (transcript.fullTranscript) {
      setTranscriptData([
        {
          text: transcript.fullTranscript,
          startTime: '0:00',
          endTime: '0:00',
        },
      ])
    }
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 4000)
  }

  const fullTranscript = transcriptData.map((entry) => entry.text).join(' ')
  const filteredTranscripts = transcriptData.filter((entry) =>
    entry?.text?.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([fullTranscript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `transcript-${videoDetails?.title || 'video'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleTimestampedDownload = () => {
    const formattedTranscript = transcriptData
      .map((entry) => `[${entry.startTime} - ${entry.endTime}]\n${entry.text}\n`)
      .join('\n')

    const element = document.createElement('a')
    const file = new Blob([formattedTranscript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `timestamped-transcript-${videoDetails?.title || 'video'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSrtDownload = () => {
    const convertToSrtTime = (timeStr: string) => {
      const [minutes, seconds] = timeStr.split(':').map(Number)
      const totalSeconds = minutes * 60 + seconds
      const hours = Math.floor(totalSeconds / 3600)
      const mins = Math.floor((totalSeconds % 3600) / 60)
      const secs = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},000`
    }

    const srtContent = transcriptData
      .map((entry, index) => {
        const startTime = convertToSrtTime(entry.startTime)
        const endTime = convertToSrtTime(entry.endTime)
        return `${index + 1}\n${startTime} --> ${endTime}\n${entry.text}\n`
      })
      .join('\n')

    const element = document.createElement('a')
    const file = new Blob([srtContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `subtitles-${videoDetails?.title || 'video'}.srt`
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
      <div className="min-h-screen bg-zinc-950 text-white p-2 sm:p-4 lg:p-6 xl:p-8 flex items-center justify-center">
        <Card
          className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl bg-black border-zinc-800 shadow-xl shadow-stone-600 rounded-2xl ${
            videoDetails && transcriptData.length > 0
              ? 'lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl'
              : ''
          }`}
        >
          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] relative">
            {/* Header - Always visible */}
            <Header />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pb-20">
              {/* Welcome Message - Only shown initially */}
              {!videoDetails && <FeatureCard type="transcribe" />}

              {/* Video Details and Transcript */}
              {videoDetails && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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
                            <p
                              className={`text-zinc-400 ${showFullDescription ? '' : 'line-clamp-2'}`}
                            >
                              {videoDetails.description}
                            </p>
                            <Button
                              variant="ghost"
                              onClick={() => setShowFullDescription(!showFullDescription)}
                              className="mt-2 p-0 h-auto text-zinc-400 hover:text-white"
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

                  {/* Transcripts */}

                  {transcriptData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Timestamped Transcript */}
                      <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">Timestamped Transcript</h3>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleTimestampedDownload}
                                  className="hover:bg-zinc-800 rounded-full text-xs"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  TXT
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleSrtDownload}
                                  className="hover:bg-zinc-800 rounded-full text-xs"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  SRT
                                </Button>
                              </div>
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
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-black border-t border-zinc-800 rounded-b-2xl">
              <form
                onSubmit={handleSubmissiom}
                className="flex space-x-2 w-full sm:w-5/6 md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto"
              >
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube video URL..."
                  className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full text-sm md:text-base"
                />
                <FancyButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault()
                    handleSubmissiom(e as any)
                  }}
                  loading={loading}
                  success={showSuccess}
                  label="Get Transcript"
                />
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
