'use client'
import React from 'react'
import { BackgroundBeams } from './ui/background-beams'
import FeatureSearchBar from './featurebar'

export function BackgroundBeamsDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <BackgroundBeams />
      <FeatureSearchBar />
    </div>
  )
}
