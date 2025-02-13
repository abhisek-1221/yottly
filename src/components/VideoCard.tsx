"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDuration, formatNumber } from "@/lib/youtube"
import type { VideoItem } from "@/lib/youtube"
import { ThumbsUp, Eye, Calendar, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"

interface VideoCardProps {
  video: VideoItem
  searchQuery: string
}

export function VideoCard({ video, searchQuery }: VideoCardProps) {
  const highlightText = (text: string) => {
    if (!searchQuery) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={index} className="bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative">
          <img
            src={video.thumbnails.medium.url || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium py-1 px-2 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">{highlightText(video.title)}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center">
              <Eye className="w-3 h-3 mr-1 text-blue-500" />
              <span>{formatNumber(video.viewCount)}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <ThumbsUp className="w-3 h-3 mr-1 text-green-500" />
              <span>{formatNumber(video.likeCount)}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-red-500" />
              <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
            </Badge>
            <Button variant="secondary" className="flex items-center space-x-1 hover:bg-blue-950">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

