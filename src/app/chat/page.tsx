'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FancyButton } from '@/components/ui/fancy-button'
import {
  Send,
  Loader2,
  Youtube,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import type React from 'react'
import { Markdown } from '@/components/ui/markdown'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/hsr/header'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DeepSeek, Gemma, Meta, Mistral } from '@lobehub/icons'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function ChatPage() {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState('llama-3.1-8b-instant')
  const [hasTranscript, setHasTranscript] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a YouTube URL',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setMessages([])
    setTranscript('')
    setHasTranscript(false)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript')
      }

      if (!data?.transcript?.fullTranscript) {
        throw new Error('No transcript available for this video')
      }

      setTranscript(data.transcript.fullTranscript)
      setHasTranscript(true)

      // Add initial system message
      setMessages([
        {
          id: Date.now().toString(),
          role: 'system',
          content:
            'Transcript loaded successfully! You can now ask questions about the video content.',
        },
      ])

      toast({
        title: 'Success',
        description: 'Transcript loaded. You can now start chatting!',
        variant: 'default',
      })
    } catch (error: any) {
      console.error('Error fetching transcript:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch transcript',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !hasTranscript || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsStreaming(true)

    try {
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant helping users understand video content. You have access to the following video transcript:

${transcript}

Answer questions based on this transcript. Be conversational, helpful, and accurate. If something is not mentioned in the transcript, say so.`,
            },
            ...messages.filter((m) => m.role !== 'system'),
            userMessage,
          ],
          model: selectedLLM,
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
        setIsStreaming(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is not readable')

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

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
            const content = JSON.parse(line.slice(2))
            assistantMessage.content += content
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessage.id ? assistantMessage : m))
            )
          }
        }
      }

      if (buffer && buffer.startsWith('0:')) {
        const content = JSON.parse(buffer.slice(2))
        assistantMessage.content += content
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessage.id ? assistantMessage : m))
        )
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setIsStreaming(false)
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl bg-black backdrop-blur-md border-gray-800 shadow-2xl rounded-2xl">
          <CardContent className="p-6 flex flex-col h-[85vh]">
            {/* Header */}
            <div className="mb-6">
              <Header />
              <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400">
                <Youtube className="h-5 w-5" />
                <span className="text-sm">YouTube Transcript Chat</span>
              </div>
            </div>

            {!hasTranscript ? (
              // Initial state - Video URL input
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600/20 mb-4">
                      <MessageSquare className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Chat with YouTube Videos</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Enter a YouTube URL to start chatting about the video content. I'll help you
                      understand and explore the transcript.
                    </p>
                  </div>

                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select LLM" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-gray-700">
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

                      <Input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Enter YouTube video URL..."
                        className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                      />

                      <FancyButton
                        onClick={(e) => {
                          e.preventDefault()
                          handleVideoSubmit(e)
                        }}
                        loading={loading}
                        label="Load Video"
                      />
                    </div>
                  </form>

                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Powered by AI</span>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Chat interface
              <>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages area */}
                  <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4 pb-4">
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`flex items-start gap-3 max-w-[80%] ${
                                message.role === 'user' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  message.role === 'user'
                                    ? 'bg-blue-600'
                                    : message.role === 'system'
                                      ? 'bg-green-600'
                                      : 'bg-gray-700'
                                }`}
                              >
                                {message.role === 'user' ? (
                                  <User className="h-4 w-4 text-white" />
                                ) : message.role === 'system' ? (
                                  <AlertCircle className="h-4 w-4 text-white" />
                                ) : (
                                  <Bot className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.role === 'system'
                                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                      : 'bg-gray-800 text-gray-100'
                                }`}
                              >
                                {message.role === 'assistant' ? (
                                  <Markdown className="prose prose-sm prose-invert max-w-none">
                                    {message.content}
                                  </Markdown>
                                ) : (
                                  <p className="text-sm">{message.content}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isStreaming && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input area */}
                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about the video..."
                        className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                        disabled={isStreaming}
                      />
                      <Button
                        type="submit"
                        disabled={!inputMessage.trim() || isStreaming}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isStreaming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Using {selectedLLM}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHasTranscript(false)
                          setMessages([])
                          setTranscript('')
                          setVideoUrl('')
                        }}
                        className="text-gray-500 hover:text-gray-300"
                      >
                        Load new video
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
