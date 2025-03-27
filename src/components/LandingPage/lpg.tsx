"use client"

import Link from "next/link"
import { ArrowRight, VideoIcon, BookOpen, ListVideo, Brain, Play, Youtube, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import FeatureSections from "../land/feature-section"
import { ShimmerButton } from "../magicui/shimmer-button"
import { useRouter } from "next/navigation"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 px-2">
            <img className="h-5 w-5 sm:h-6 sm:w-6" src="https://img.icons8.com/arcade/64/youtube-play.png" alt="youtube-play"/>
            <span className="text-lg sm:text-xl font-bold">Yottly</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#demo" className="transition-colors hover:text-primary">
              Demo
            </Link>
            <Link href="https://github.com/abhisek-1221/yottly" className="transition-colors hover:text-primary">
              GitHub
            </Link>
          </nav>
          
          {/* Mobile Navigation Button */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block">
              <Button>Try Now</Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container py-4 flex flex-col space-y-4">
                <Link href="#features" className="px-2 py-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#demo" className="px-2 py-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Demo
                </Link>
                <Link href="https://github.com/abhisek-1221/yottly" className="px-2 py-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  GitHub
                </Link>
                <Link href="/dashboard" className="px-2">
                  <Button className="w-full">Try Now</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="container relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12">
              <motion.div 
                className="space-y-6 sm:space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter">
                    Your YouTube{" "}
                    <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                      AI Assistant
                    </span>
                  </h1>
                  <p className="max-w-[42rem] leading-normal text-muted-foreground text-base sm:text-lg md:text-xl md:leading-8">
                    Transform how you interact with YouTube content. Summarize videos, generate transcripts, 
                    and analyze playlists - all powered by advanced AI.
                  </p>
                </div>
                <div className="grid md:grid-cols-1 place-items-start">
              <ShimmerButton
                className="shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_8px_rgba(185,28,28,0.5)]"
                background="radial-gradient(ellipse 80% 70% at 50% 120%, #f59e0b, #B91C1C)"
                onClick={() => {
                    router.push("/dashboard");
                }}
              >
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-2xl">
                  Get started for free
                </span>
                <ChevronRight className="h-5 w-5 duration-300 ease-in-out transform group-hover:translate-x-1 m-auto" />
              </ShimmerButton>
            </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 md:pt-8">
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">3-in-1</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">AI Features</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">100%</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Free & Open Source</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">1-Click</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Processing</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="relative hidden sm:block lg:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-700/10 rounded-2xl blur-3xl" />
                <div className="relative bg-card rounded-2xl border p-5 sm:p-7 md:p-8 shadow-2xl max-w-xl mx-auto w-full">
                    <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">Video Analysis</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Powered by AI</p>
                      </div>
                    </div>
                    <div className="aspect-[4/2.2] rounded-lg bg-gradient-to-br from-red-500/5 via-red-700/10 to-red-500/5 overflow-hidden">
                      <div style={{ position: 'relative', paddingBottom: '75%', height: 0, overflow: 'hidden' }}>
                        <iframe
                          src="https://www.tella.tv/video/cm7r9hfdf00070bl758xld16r/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0"
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            border: 0,
                            borderRadius: '0.5rem' 
                          }}
                          allowFullScreen
                          title="Yottly Demo"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                      </div>
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
          className="py-12 sm:py-16 md:py-20 lg:py-24"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="container space-y-8 sm:space-y-12 px-7 sm:px-6">
          <FeatureSections />
          </div>
        </motion.section>


        <motion.section 
          ref={demoRef}
          id="demo" 
          className="py-12 sm:py-16 md:py-20 lg:py-24"
          initial="hidden"
          animate={demoInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="container space-y-8 sm:space-y-12 px-4 sm:px-6">
            <motion.div 
              variants={fadeIn}
              className="text-center space-y-2 sm:space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                See Yottly in Action
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[42rem] mx-auto">
                Watch how Yottly transforms your YouTube experience with AI-powered features.
              </p>
            </motion.div>
            <motion.div 
              variants={fadeIn}
              className="max-w-4xl mx-auto px-4 sm:px-0"
            >
              <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.tella.tv/video/cm7r9hfdf00070bl758xld16r/embed?b=0&title=0&a=0&loop=1&autoPlay=true&t=0&muted=1&wt=0"
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
              <Button size="lg" className="gap-2"
              onClick={() => {
                router.push("/dashboard");
              }}
              >
                <Play className="h-4 w-4" /> Try Yottly Now
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <motion.footer 
        className="border-t py-6 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground">© 2024 Yottly. All rights reserved.</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="https://github.com/abhisek-1221/yottly" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
              GitHub
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

