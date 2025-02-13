"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ThumbsUp, ChevronUp, ChevronDown } from "lucide-react";
import { useChat } from 'ai/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface TranscriptSegment {
  text: string;
  startTime: string;
  endTime: string;
}

interface TranscriptResponse {
  segments: TranscriptSegment[];
  fullTranscript: string;
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

export default function TranscriptPage() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { messages, input,  setInput, handleInputChange, handleSubmit } = useChat();
  useEffect(() => {
    if (transcript?.fullTranscript) {
      setInput(transcript.fullTranscript)
    }
  }, [transcript?.fullTranscript, setInput])    

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch video details
      const videoResponse = await fetch("/api/videoDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url }),
      });
      const videoData = await videoResponse.json();
      if (videoData.video) {
        setVideoDetails(videoData.video);
      }

      // Fetch transcript
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transcript');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }

  };
  

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>YouTube Video Summarizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={fetchTranscript}
              disabled={loading || !url}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                'Preview Link'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {videoDetails && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card>
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
                  <h2 className="text-2xl font-bold leading-tight">{videoDetails.title}</h2>
                  <p className="text-muted-foreground">{videoDetails.channelTitle}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {formatDate(videoDetails.publishedAt)}
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      {formatTime(videoDetails.duration)}
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      <Eye className="w-4 h-4" />
                      {formatNumber(videoDetails.viewCount)} views
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      <ThumbsUp className="w-4 h-4" />
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
        </motion.div>
      )}

      {(transcript && transcript.fullTranscript.length > 0) && (
    
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
                                          <>
                                            <Markdown remarkPlugins={[remarkGfm]}>
                                              {message.content}
                                            </Markdown>
                                            <div className="text-sm text-gray-400 mt-2">
                                              Summarized
                                            </div>
                                          </>
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

    </div>
  );
}