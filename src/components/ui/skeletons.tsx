import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from './card'
import { ScrollArea } from './scroll-area'

// Video loading skeleton component
export const VideoSkeleton = () => (
  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
    <CardContent className="p-4">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <span className="text-sm text-zinc-400 ml-2">Loading video details...</span>
        </div>
      </div>
      <div className="grid md:grid-cols-[1fr,2fr] gap-4">
        <div className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded"></div>
          <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-2/3"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full w-24"></div>
            <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full w-20"></div>
            <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded"></div>
            <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Quiz generation skeleton component
export const QuizSkeleton = ({ questionsCount = 3 }: { questionsCount?: number }) => (
  <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700">
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-32"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <span className="text-sm text-zinc-400 ml-1">Generating quiz...</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full"></div>
        </div>
      </div>

      <ScrollArea className="h-[400px] overflow-y-auto">
        <div className="space-y-6">
          {Array.from({ length: questionsCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/30"
            >
              <div className="flex items-start gap-2 mb-3">
                <div className="bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] text-transparent text-sm px-2 py-1 rounded-full font-medium w-8 h-6">
                  {index + 1}
                </div>
                <div className="h-5 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded flex-1"></div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-4"></div>
                      <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-center mt-4">
        <div className="h-10 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-32"></div>
      </div>
    </CardContent>
  </Card>
)

// Loading dots component that can be reused
export const LoadingDots = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    <div
      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.1s' }}
    ></div>
    <div
      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.2s' }}
    ></div>
    <span className="text-sm text-zinc-400 ml-2">{text}</span>
  </div>
)
