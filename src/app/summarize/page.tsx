'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FancyButton } from '@/components/ui/fancy-button'
import {
  Eye,
  ThumbsUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  CircleCheckBig,
  Cpu,
  Bot,
  Sparkles,
  Brain,
  Download,
  Copy,
  Check,
  Volume2,
  Volume,
} from 'lucide-react'
import type React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '@/components/hsr/header'
import FeatureCard from '@/components/hsr/FeatureCard'
import { formatDate, formatNumber } from '@/lib/youtube'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import { DeepSeek, Gemma, Meta, Mistral } from '@lobehub/icons'

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
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string }[]
  >([])
  const [selectedLLM, setSelectedLLM] = useState('')
  const [summary, setSummary] = useState('')
  const [hasCopied, setHasCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const streamSummary = useCallback(
    async (fullTranscript: string) => {
      setIsSummarizing(true)
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: `Summarize this transcript: ${fullTranscript}`,
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        abortControllerRef.current = new AbortController()
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [userMessage],
            model: selectedLLM,
            system:
              'You are an AI assistant that provides clear, concise summaries with key insights. Present information in a natural, conversational way while maintaining professionalism. Focus on extracting and organizing main points, themes, and notable moments. Do not write here is the summary of the transcript or the video',
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to generate summary')
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
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
              return [...prev.slice(0, -1), { ...lastMessage, content: streamedSummary }]
            } else {
              return [
                ...prev,
                { id: Date.now().toString(), role: 'assistant', content: streamedSummary },
              ]
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

        toast({
          title: 'Success',
          description: 'Summary generated successfully',
          variant: 'default',
        })
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted')
          toast({
            title: 'Info',
            description: 'Summary generation was cancelled',
            variant: 'default',
          })
        } else {
          console.error('Error:', error)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'An error occurred while generating the summary.',
            },
          ])
          toast({
            title: 'Error',
            description: error.message || 'Failed to generate summary',
            variant: 'destructive',
          })
        }
      } finally {
        setIsSummarizing(false)
      }
    },
    [selectedLLM, toast]
  )

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLLM) {
      toast({
        title: 'Warning',
        description: 'Please select an LLM model first',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      setIsSummarizing(false)
      setSummary('')
      setMessages([])

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

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      const transcriptData = await response.json()

      if (!response.ok) {
        throw new Error(transcriptData.error || 'Failed to fetch transcript')
      }

      // Add error handling for transcript
      if (!transcriptData?.transcript?.fullTranscript) {
        throw new Error('No transcript data available for this video')
      }

      const fullTranscript = transcriptData.transcript.fullTranscript
      console.log('Transcript length:', fullTranscript.length) // Debug log

      // If transcript is too long, chunk it
      if (fullTranscript.length > 70000) {
        const chunks = chunkTranscript(fullTranscript, 70000)
        setTranscriptData(chunks)

        // Summarize each chunk
        let completeSummary = ''
        for (const chunk of chunks) {
          const chunkSummary = await streamSummary(chunk)
          completeSummary += chunkSummary + '\n\n'
        }
      } else {
        setTranscriptData([fullTranscript])
        await streamSummary(fullTranscript)
      }

      setShowSuccess(true)

      await new Promise((resolve) => setTimeout(resolve, 100))

      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    } catch (error: any) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Error processing transcript. Please try again.',
        },
      ])
      toast({
        title: 'Error',
        description: error.message || 'Failed to process video',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Add this helper function to chunk large transcripts
  const chunkTranscript = (text: string, maxLength: number): string[] => {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      // Find the last period before maxLength
      let end = start + maxLength
      if (end > text.length) end = text.length

      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('. ', end)
        if (lastPeriod > start) end = lastPeriod + 1
      }

      chunks.push(text.slice(start, end).trim())
      start = end
    }

    return chunks
  }

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      // Using scrollIntoView instead of directly manipulating scrollTop
      scrollContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, summary, scrollToBottom])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([summary], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `summary-${videoDetails?.title || 'video'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: 'Success',
      description: 'Summary downloaded successfully',
      variant: 'default',
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setHasCopied(true)
    toast({
      title: 'Success',
      description: 'Summary copied to clipboard',
      variant: 'default',
    })
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleTextToSpeech = async () => {
    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
        return
      }

      toast({
        title: 'Processing',
        description: 'Converting text to speech...',
        variant: 'default',
      })

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert text to speech')
      }

      // Convert base64 to audio
      const audioContent = data.audioContent
      const audioBlob = new Blob([Buffer.from(audioContent, 'base64')], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        const audio = new Audio(audioUrl)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        audioRef.current = audio
        audio.play()
        setIsPlaying(true)
      }

      toast({
        title: 'Success',
        description: 'Audio playback started',
        variant: 'default',
      })
    } catch (error: any) {
      console.error('Text-to-Speech Error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert text to speech',
        variant: 'destructive',
      })
      setIsPlaying(false)
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
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
            {!videoDetails && <FeatureCard type="summarize" />}

            {/* Video Details and Transcript */}
            {videoDetails && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* Video Info Card */}
                <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-[1fr,2fr] gap-4">
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img
                          src={
                            videoDetails.thumbnails.maxres?.url || videoDetails.thumbnails.high?.url
                          }
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
                  <div>
                    <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Full Summary</h3>
                          {summary && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleTextToSpeech}
                                className="hover:bg-zinc-800 rounded-full"
                              >
                                {isPlaying ? (
                                  <Volume2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Volume className="h-4 w-4 text-zinc-400 hover:text-white" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopy}
                                className="hover:bg-zinc-800 rounded-full"
                              >
                                {hasCopied ? (
                                  <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Copy className="h-4 w-4 text-zinc-400 hover:text-white" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDownload}
                                className="hover:bg-zinc-800 rounded-full"
                              >
                                <Download className="h-4 w-4 text-zinc-400 hover:text-white" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <ScrollArea className="h-[400px] overflow-y-auto">
                          <div>
                            {messages.map((m) => (
                              <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'hidden' : 'justify-start'}`}
                              >
                                <div
                                  className={`
                                    max-w-[80%] rounded-lg px-4 py-2
                                    ${m.role === 'user' ? ' text-white' : ' text-white'}
                                  `}
                                >
                                  <div className="text-sm whitespace-pre-wrap">
                                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* This div will be used as a reference point to scroll to */}
                            <div ref={scrollContainerRef} />
                          </div>
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
              <div>
                <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select LLM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="gemma2-9b-it">
                        <div className="flex items-center gap-2">
                          <Gemma.Color size={20} />
                          <span>Gemma2</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="llama3-70b-8192">
                        <div className="flex items-center gap-2">
                          <Meta size={20} />
                          <span>Llama3 70B</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">
                        <div className="flex items-center gap-2">
                          <Mistral.Color size={20} />
                          <span>Mixtral 8x7B</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="deepseek-r1-distill-qwen-32b">
                        <div className="flex items-center gap-2">
                          <DeepSeek.Color size={20} />
                          <span>Deepseek R1</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">
                        <div className="flex items-center gap-2">
                          <Meta.Color size={20} />
                          <span>Llama 3.1</span>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube video URL..."
                className="flex-1 bg-transparent shadow-md shadow-gray-700 border-zinc-700 rounded-full"
              />
              <FancyButton
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmission(e)
                }}
                loading={loading}
                success={showSuccess}
                label="Get Summary"
              />
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
