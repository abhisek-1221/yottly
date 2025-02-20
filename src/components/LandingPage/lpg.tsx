"use client"

import Link from "next/link"
import { ArrowRight, VideoIcon, BookOpen, ListVideo, Brain, Play, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function LandingPage() {
  const featuresRef = useRef(null)
  const demoRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const demoInView = useInView(demoRef, { once: true, margin: "-100px" })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 px-2">
            <Youtube className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">Yottly</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#demo" className="transition-colors hover:text-primary">
              Demo
            </Link>
            <Link href="https://github.com/yourusername/yottly" className="transition-colors hover:text-primary">
              GitHub
            </Link>
          </nav>
          <Link href="/dashboard">
          <Button>Try Now</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="container relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-24 px-12">
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Your YouTube{" "}
                    <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                      AI Assistant
                    </span>
                  </h1>
                  <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Transform how you interact with YouTube content. Summarize videos, generate transcripts, 
                    and analyze playlists - all powered by advanced AI.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
                  <div className="space-y-2">
                    <h4 className="text-4xl font-bold text-primary">3-in-1</h4>
                    <p className="text-sm text-muted-foreground">AI Features</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-4xl font-bold text-primary">100%</h4>
                    <p className="text-sm text-muted-foreground">Free & Open Source</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-4xl font-bold text-primary">1-Click</h4>
                    <p className="text-sm text-muted-foreground">Processing</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="relative hidden lg:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-700/10 rounded-2xl blur-3xl" />
                <div className="relative bg-card rounded-2xl border p-6 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">Video Analysis</h3>
                        <p className="text-sm text-muted-foreground">Powered by AI</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Try Now
                      </Button>
                    </div>
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-red-500/5 via-red-700/10 to-red-500/5 flex items-center justify-center">
                      <Brain className="h-24 w-24 text-red-500/40" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section 
          ref={featuresRef}
          id="features" 
          className="bg-muted/50 py-24"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="container space-y-12">
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl"
            >
              Powerful Features
            </motion.h2>
            <motion.div 
              variants={staggerContainer}
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
            >
              <motion.div variants={fadeIn}>
                <Card>
                  <CardContent className="p-6 space-y-2">
                    <VideoIcon className="h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-bold">Video Summaries</h3>
                    <p className="text-sm text-muted-foreground">
                      Get concise AI-powered summaries of any YouTube video in seconds.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Card>
                  <CardContent className="p-6 space-y-2">
                    <BookOpen className="h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-bold">Transcripts</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate accurate transcripts with timestamps for easy navigation.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Card>
                  <CardContent className="p-6 space-y-2">
                    <ListVideo className="h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-bold">Playlist Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze entire playlists to extract key insights and themes.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          ref={demoRef}
          id="demo" 
          className="py-24"
          initial="hidden"
          animate={demoInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="container space-y-12">
            <motion.div 
              variants={fadeIn}
              className="text-center space-y-4"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                See Yottly in Action
              </h2>
              <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
                Watch how Yottly transforms your YouTube experience with AI-powered features.
              </p>
            </motion.div>
            <motion.div 
              variants={fadeIn}
              className="max-w-4xl mx-auto"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/your-demo-video-id"
                  title="Yottly Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeIn}
              className="text-center"
            >
              <Button size="lg" className="gap-2">
                <Play className="w-4 h-4" /> Try Yottly Now
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <motion.footer 
        className="border-t py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 Yottly. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="https://github.com/yourusername/yottly" className="text-sm text-muted-foreground hover:text-primary">
              GitHub
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

