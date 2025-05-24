'use client'

import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { List, BookOpen, VideoIcon, ListVideo } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
  },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
  },
}

const features = [
  {
    id: 'feature-summarize',
    header: 'Summarize',
    name: 'AI-Powered Video Summaries',
    description:
      'Get concise, intelligent summaries of any YouTube video in seconds. Save time by understanding key points without watching the entire video.',
    icon: VideoIcon,
    iframe:
      'https://www.tella.tv/video/cm7rgr3ol00000bjr8mg6hctz/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Try Summarizer',
    href: '/summarize',
    reverse: false, // First feature - Left
  },
  {
    id: 'feature-transcript',
    header: 'Transcribe',
    name: 'Accurate Video Transcriptions',
    description:
      'Generate high-quality transcripts with precise timestamps. Perfect for content creators, researchers, and anyone needing searchable text from videos.',
    icon: BookOpen,
    iframe:
      'https://www.tella.tv/video/cm7rswzd7001o0ajo8y7l2y67/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Get Transcripts',
    href: '/transcribe',
    reverse: true, // Second feature - Right
  },
  {
    id: 'feature-playlist',
    header: 'Analyze',
    name: 'Comprehensive Playlist Analysis',
    description:
      'Extract key insights and common themes across entire YouTube playlists. Ideal for courses, tutorial series, and content research.',
    icon: ListVideo,
    iframe:
      'https://www.tella.tv/video/cm7r9hfdf00070bl758xld16r/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Analyze Playlist',
    href: '/playlist',
    reverse: false, // Third feature - Left
  },
  {
    id: 'feature-compare',
    header: 'Compare Videos',
    name: 'In-Depth Video Comparison',
    description:
      'Compare multiple YouTube videos side by side. Analyze engagement metrics, view/like ratios, comment activity, and visual similarities. Make data-driven content decisions with comprehensive comparison insights.',
    icon: ListVideo,
    iframe:
      'https://www.tella.tv/video/cma27w1cx000b0clc0y8a6jn8/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Compare Videos',
    href: '/compare',
    reverse: true, // Fourth feature - Right
  },
  {
    id: 'feature-stats',
    header: 'Channel Stats',
    name: 'Channel Analytics & Insights',
    description:
      'Deep dive into YouTube channel analytics with AI-powered insights. Understand content performance, audience engagement, and growth opportunities for your channel.',
    icon: List,
    iframe:
      'https://www.tella.tv/video/cma27glga000w0bjx472zajj2/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Analyze Channel',
    href: '/stats',
    reverse: false, // Fifth feature - Left
  },
  {
    id: 'feature-quiz',
    header: 'Quiz Generator',
    name: 'AI-Powered Video Quizzes',
    description:
      'Generate quizzes from any YouTube video. Perfect for content creators, educators, students, and anyone looking to test their knowledge.',
    icon: List,
    iframe:
      'https://www.tella.tv/video/cmb0xueqv00000alc7s9y29r7/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0',
    cta: 'Generate Quizzes',
    href: '/quiz',
    reverse: true,
  },
]

const FeatureSections = () => {
  return (
    <>
      {features.map((feature) => {
        const sectionRef = useRef(null)
        const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

        return (
          <motion.section
            id={feature.id}
            key={feature.id}
            ref={sectionRef}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="mx-auto px-4 sm:px-6 py-6 sm:py-16 md:py-20">
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                <motion.div
                  className={cn('m-auto lg:col-span-2', {
                    'lg:order-last': feature.reverse,
                  })}
                  variants={feature.reverse ? fadeInRight : fadeInLeft}
                >
                  <h2 className="text-base font-semibold leading-7 text-red-500">
                    {feature.header}
                  </h2>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {feature.name}
                  </p>
                  <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-400">
                    {feature.description}
                  </p>
                  <Link
                    className={cn(
                      buttonVariants({
                        variant: 'default',
                        size: 'lg',
                      }),
                      'mt-6 sm:mt-8'
                    )}
                    href={feature.href}
                  >
                    {feature.cta}
                  </Link>
                </motion.div>
                <motion.div className="lg:col-span-3" variants={fadeInUp}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={feature.iframe}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      allowFullScreen
                      allowTransparency
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )
      })}
    </>
  )
}

export default FeatureSections
