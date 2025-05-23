import YouTube from '@/app/icons/yt'
import React from 'react'
import { Button } from '../ui/button'
import { Undo2 } from 'lucide-react'

import { useRouter } from 'next/navigation'

const Header = () => {
  const router = useRouter()
  return (
    <div className="flex items-center space-x-2 mb-4 sm:mb-5 md:mb-6">
      <div className="bg-zinc-800 p-1.5 sm:p-2 rounded-lg">
        <img
          className="w-4 h-4 sm:w-5 sm:h-5"
          src="https://img.icons8.com/arcade/64/youtube-play.png"
          alt="youtube-play"
        />
      </div>
      <span className="text-xs sm:text-sm text-zinc-400">Yottly</span>
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          onClick={() => router.push('/dashboard')}
        >
          <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  )
}

export default Header
