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
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 })
  const [chunkSummaries, setChunkSummaries] = useState<string[]>([])
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

        if (response.status === 429) {
          const data = await response.json()
          toast({
            title: 'Rate Limit Exceeded',
            description: `Too many requests. Please try again in ${Math.ceil((data.reset - Date.now()) / 1000)} seconds.`,
            variant: 'destructive',
          })
          setIsSummarizing(false)
          return
        }

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
      setProcessingProgress({ current: 0, total: 0 })
      setChunkSummaries([])

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

      // Handle large transcripts intelligently
      if (fullTranscript.length > 50000) {
        console.log(
          `Large transcript detected (${fullTranscript.length} chars), processing in chunks...`
        )
        toast({
          title: 'Processing Large Transcript',
          description: `Transcript is ${Math.round(fullTranscript.length / 1000)}k characters. Breaking into chunks for better processing.`,
          variant: 'default',
        })
        setTranscriptData([fullTranscript]) // Keep original for display
        await processLargeTranscript(fullTranscript)
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

  // Smart chunking with semantic boundaries and overlap
  const chunkTranscript = (text: string, maxLength: number = 50000): string[] => {
    const chunks: string[] = []
    const overlapLength = Math.floor(maxLength * 0.1) // 10% overlap

    // First, try to split by double newlines (paragraphs)
    const paragraphs = text.split('\n\n').filter((p) => p.trim())

    let currentChunk = ''
    let start = 0

    for (const paragraph of paragraphs) {
      // If single paragraph is too long, split it further
      if (paragraph.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = ''
        }

        // Split long paragraph by sentences
        const sentences = paragraph.split(/(?<=[.!?])\s+/)
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxLength) {
            if (currentChunk) {
              chunks.push(currentChunk.trim())
              // Add overlap from previous chunk
              const words = currentChunk.split(' ')
              const overlapWords = words.slice(-Math.floor(overlapLength / 5))
              currentChunk = overlapWords.join(' ') + ' '
            }
          }
          currentChunk += sentence + ' '
        }
      } else if (currentChunk.length + paragraph.length > maxLength) {
        // Current paragraph would exceed limit, save current chunk
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          // Add overlap from previous chunk
          const words = currentChunk.split(' ')
          const overlapWords = words.slice(-Math.floor(overlapLength / 5))
          currentChunk = overlapWords.join(' ') + ' ' + paragraph + '\n\n'
        } else {
          currentChunk = paragraph + '\n\n'
        }
      } else {
        currentChunk += paragraph + '\n\n'
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks.filter((chunk) => chunk.length > 100) // Filter out very small chunks
  }

  // Process multiple chunks with progress tracking
  const processLargeTranscript = async (fullTranscript: string) => {
    const chunks = chunkTranscript(fullTranscript)
    setProcessingProgress({ current: 0, total: chunks.length })
    setChunkSummaries([])

    const chunkSummaries: string[] = []

    // Process chunks with controlled concurrency (max 2 at a time to avoid rate limits)
    const processBatch = async (batchChunks: string[], startIndex: number) => {
      const promises = batchChunks.map(async (chunk, index) => {
        try {
          const chunkSummary = await summarizeChunk(chunk, startIndex + index)
          return { index: startIndex + index, summary: chunkSummary }
        } catch (error) {
          console.error(`Error processing chunk ${startIndex + index}:`, error)
          return {
            index: startIndex + index,
            summary: `Error processing chunk ${startIndex + index + 1}: ${error}`,
          }
        }
      })

      return Promise.all(promises)
    }

    // Process in batches of 2
    const batchSize = 2
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const results = await processBatch(batch, i)

      results.forEach((result) => {
        chunkSummaries[result.index] = result.summary
        setChunkSummaries([...chunkSummaries])
        setProcessingProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      })
    }

    // Now create a final synthesis
    await synthesizeFinalSummary(chunkSummaries)
  }

  // Summarize individual chunk
  const summarizeChunk = async (chunk: string, chunkIndex: number): Promise<string> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: Date.now().toString(),
            role: 'user',
            content: `Summarize this part of a video transcript (Part ${chunkIndex + 1}). Focus on key points and main themes: ${chunk}`,
          },
        ],
        model: selectedLLM,
        system:
          'You are an AI assistant that provides clear, concise summaries. Extract key points, themes, and important information from this transcript segment. Keep it focused and informative.',
      }),
    })

    if (response.status === 429) {
      const data = await response.json()
      throw new Error(`Rate limit: retry in ${Math.ceil((data.reset - Date.now()) / 1000)}s`)
    }

    if (!response.ok) {
      throw new Error('Failed to generate chunk summary')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('Response body not readable')

    let summary = ''
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('0:')) {
          summary += JSON.parse(line.slice(2))
        }
      }
    }

    if (buffer && buffer.startsWith('0:')) {
      summary += JSON.parse(buffer.slice(2))
    }

    return summary
  }

  // Create final comprehensive summary from all chunk summaries
  const synthesizeFinalSummary = async (chunkSummaries: string[]) => {
    const combinedSummaries = chunkSummaries
      .map((summary, index) => `## Part ${index + 1}\n${summary}`)
      .join('\n\n')

    setIsSummarizing(true)
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: `Create a comprehensive, cohesive summary from these individual summaries of different parts of a video: ${combinedSummaries}`,
    }
    setMessages([userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          model: selectedLLM,
          system:
            'You are an AI assistant that creates cohesive, comprehensive summaries. Synthesize the provided part summaries into one flowing, well-structured summary that captures the main themes, key points, and overall narrative of the entire video. Organize it logically and remove redundancies.',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate final summary')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body not readable')

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
            updateSummary(JSON.parse(line.slice(2)))
          }
        }
      }

      if (buffer && buffer.startsWith('0:')) {
        updateSummary(JSON.parse(buffer.slice(2)))
      }
    } catch (error: any) {
      console.error('Error synthesizing final summary:', error)
      // Fallback: just combine the chunk summaries
      const fallbackSummary = chunkSummaries.join('\n\n---\n\n')
      setSummary(fallbackSummary)
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: fallbackSummary,
        },
      ])
    } finally {
      setIsSummarizing(false)
      setProcessingProgress({ current: 0, total: 0 })

      toast({
        title: 'Success',
        description: `Comprehensive summary created from ${chunkSummaries.length} chunks`,
        variant: 'default',
      })
    }
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

      if (response.status === 429) {
        const data = await response.json()
        toast({
          title: 'Rate Limit Exceeded',
          description: `Too many requests. Please try again in ${Math.ceil((data.reset - Date.now()) / 1000)} seconds.`,
          variant: 'destructive',
        })
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to convert text to speech')
      }

      const data = await response.json()

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
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">Full Summary</h3>
                            {processingProgress.total > 0 && (
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <div className="w-24 bg-zinc-800 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${(processingProgress.current / processingProgress.total) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span>
                                  {processingProgress.current}/{processingProgress.total} chunks
                                </span>
                              </div>
                            )}
                          </div>
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
                            {/* Show intermediate chunk summaries during processing */}
                            {processingProgress.total > 0 && chunkSummaries.length > 0 && (
                              <div className="mb-4 space-y-2">
                                <h4 className="text-sm font-medium text-zinc-400 mb-2">
                                  Processing Chunks:
                                </h4>
                                {chunkSummaries.map((chunkSummary, index) => (
                                  <div
                                    key={index}
                                    className="bg-zinc-800/50 rounded-lg p-3 border-l-2 border-blue-500"
                                  >
                                    <div className="text-xs text-zinc-400 mb-1">
                                      Chunk {index + 1}
                                    </div>
                                    <div className="text-sm text-zinc-300">
                                      <Markdown remarkPlugins={[remarkGfm]}>
                                        {chunkSummary}
                                      </Markdown>
                                    </div>
                                  </div>
                                ))}
                                {processingProgress.current < processingProgress.total && (
                                  <div className="bg-zinc-800/30 rounded-lg p-3 border-l-2 border-zinc-600 animate-pulse">
                                    <div className="text-xs text-zinc-500">
                                      Processing chunk {processingProgress.current + 1}...
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Final summary */}
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
                loading={loading || isSummarizing}
                success={showSuccess}
                label={
                  processingProgress.total > 0
                    ? `Processing ${processingProgress.current}/${processingProgress.total}`
                    : 'Get Summary'
                }
              />
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
