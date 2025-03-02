"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { List, BookOpen, VideoIcon, ListVideo } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
  }
};

const features = [
  {
    id: "feature-summarize",
    header: "Summarize",
    name: "AI-Powered Video Summaries",
    description:
      "Get concise, intelligent summaries of any YouTube video in seconds. Save time by understanding key points without watching the entire video.",
    icon: VideoIcon,
    video: "https://cdn.llm.report/openai-demo.mp4",
    cta: "Try Summarizer",
    href: "/summarize",
    reverse: false,
  },
  {
    id: "feature-transcript",
    header: "Transcribe",
    name: "Accurate Video Transcriptions",
    description:
      "Generate high-quality transcripts with precise timestamps. Perfect for content creators, researchers, and anyone needing searchable text from videos.",
    icon: BookOpen,
    video: "https://cdn.llm.report/logs-demo.mp4",
    cta: "Get Transcripts",
    href: "/transcribe",
    reverse: true,
  },
  {
    id: "feature-playlist",
    header: "Analyze",
    name: "Comprehensive Playlist Analysis",
    description:
      "Extract key insights and common themes across entire YouTube playlists. Ideal for courses, tutorial series, and content research.",
    icon: ListVideo,
    video: "https://cdn.llm.report/users-demo.mp4",
    cta: "Analyze Playlist",
    href: "/playlist",
    reverse: false,
  },
];

const FeatureSections = () => {
  return (
    <>
      {features.map((feature) => {
        const sectionRef = useRef(null);
        const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
        
        return (
          <motion.section 
            id={feature.id} 
            key={feature.id}
            ref={sectionRef}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="mx-auto px-4 sm:px-6 py-6 sm:py-16 md:py-20">
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                <motion.div
                  className={cn("m-auto lg:col-span-2", {
                    "lg:order-last": feature.reverse,
                  })}
                  variants={feature.reverse ? fadeInRight : fadeInLeft}
                >
                  <h2 className="text-base font-semibold leading-7 text-red-500">
                    {feature.header}
                  </h2>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {feature.name}
                  </p>
                  <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-400">
                    {feature.description}
                  </p>
                  <Link
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        size: "lg",
                      }),
                      "mt-6 sm:mt-8"
                    )}
                    href={feature.href}
                  >
                    {feature.cta}
                  </Link>
                </motion.div>
                <motion.div
                  className="lg:col-span-3"
                  variants={fadeInUp}
                >
                  <video
                    src={feature.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="rounded-xl border m-auto w-full shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
        );
      })}
    </>
  );
};

export default FeatureSections;