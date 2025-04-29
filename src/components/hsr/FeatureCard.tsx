import YouTube from '@/app/icons/yt'
import React from 'react'
import { Card } from '../ui/card'
import {
  Clock,
  Eye,
  Zap,
  Timer,
  ScanSearch,
  Languages,
  Volleyball,
  List,
  Download,
  BarChart2,
  PieChart,
  Activity,
} from 'lucide-react'

interface FeatureCardProps {
  type: 'analyze' | 'transcribe' | 'summarize' | 'compare' | 'stats'
}

const object = {
  analyze: {
    heading: 'Playlist Analyzer',
    subheading: 'Analyze and filter your playlist',
    value: 'including duration, views, and more.',
    caption: 'Enter your playlist ID below to get started with detailed analytics',
    fh1: 'Duration Analysis',
    fc1: 'Track total watching time',
    fh2: 'Search & Filter',
    fc2: 'Filter by query, range, and more',
    fh3: 'Playback Control',
    fc3: 'Adjust playback speed',
    icons: [Clock, Eye, Zap],
  },
  transcribe: {
    heading: 'Transcript Generator',
    subheading: 'Generate transcripts from YouTube videos',
    value: 'with timestamps and more.',
    caption: 'Enter a YouTube video URL to get started with transcription',
    fh1: 'Timestamps',
    fc1: 'Get timestamps for each segment',
    fh2: 'Search & Filter',
    fc2: 'Filter timestamps by query',
    fh3: 'Export and Translate',
    fc3: 'Export to text, translate to other languages',
    icons: [Timer, ScanSearch, Languages],
  },
  summarize: {
    heading: 'Summarization Tool',
    subheading: 'Summarize text and videos',
    value: 'with multiple GenAI models.',
    caption: 'Enter YouTube video URL to get started with summarization',
    fh1: 'Summarize Video',
    fc1: 'Summarize video content',
    fh2: 'Detailed Insights',
    fc2: 'Get detailed insights on video',
    fh3: 'Export and Share',
    fc3: 'Export to text, share with others',
    icons: [Volleyball, List, Download],
  },
  compare: {
    heading: 'Video Comparison',
    subheading: 'Compare any two YouTube videos',
    value: 'with detailed analytics and insights.',
    caption: 'Enter two YouTube URLs below to start comparing',
    fh1: 'Engagement Stats',
    fc1: 'Compare views, likes, and comments',
    fh2: 'Visual Analysis',
    fc2: 'See distribution and ratios',
    fh3: 'Deep Insights',
    fc3: 'Get detailed engagement metrics',
    icons: [BarChart2, PieChart, Activity],
  },
  stats: {
    heading: 'Channel Analytics',
    subheading: 'Deep dive into channel statistics',
    value: 'with AI-powered insights and trends.',
    caption: 'Enter your YouTube channel URL below to analyze performance',
    fh1: 'Engagement Metrics',
    fc1: 'Track views, subs, and revenue',
    fh2: 'Content Analysis',
    fc2: 'Compare shorts vs long form',
    fh3: 'Growth Trends',
    fc3: 'View historical performance',
    icons: [BarChart2, PieChart, Activity],
  },
}

const FeatureCard = ({ type }: FeatureCardProps) => {
  const content = object[type]
  const [Icon1, Icon2, Icon3] = [...content.icons]

  return (
    <div className="text-center my-12">
      <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
        <img
          className="w-8 h-8"
          src="https://img.icons8.com/arcade/64/youtube-play.png"
          alt="youtube-play"
        />
      </div>
      <h1 className="text-2xl font-semibold mb-2">{content.heading}</h1>
      <h2 className="text-xl text-zinc-400 mb-4">{content.subheading}</h2>
      <p className="text-sm text-zinc-500 mb-8">
        {content.caption}
        <br />
        {content.value}
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-[8rem] px-10 w-3/4 ml-32">
        <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
          <div className="flex space-x-3 mt-2">
            <Icon1 className="w-5 h-5 mb-1" />
            <h3 className="font-medium mb-1">{content.fh1}</h3>
          </div>
          <p className="text-xs text-zinc-400">{content.fc1}</p>
        </Card>

        <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
          <div className="flex space-x-3 mt-2">
            <Icon2 className="w-5 h-5 mb-3" />
            <h3 className="font-medium mb-1">{content.fh2}</h3>
          </div>
          <p className="text-xs text-zinc-400">{content.fc2}</p>
        </Card>

        <Card className="bg-gradient-to-br from-stone-700 via-transparent to-gray-900 border-zinc-700 p-4">
          <div className="flex space-x-3 mt-2">
            <Icon3 className="w-5 h-5 mb-3" />
            <h3 className="font-medium mb-1">{content.fh3}</h3>
          </div>
          <p className="text-xs text-zinc-400">{content.fc3}</p>
        </Card>
      </div>
    </div>
  )
}

export default FeatureCard
