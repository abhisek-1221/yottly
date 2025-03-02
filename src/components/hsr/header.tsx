import YouTube from '@/app/icons/yt'
import React from 'react'
import { Button } from '../ui/button'
import { Undo2 } from 'lucide-react'

import { useRouter } from 'next/navigation'

const Header = () => {
    const router = useRouter()
  return (
    <div className="flex items-center space-x-2 mb-6">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <YouTube className="w-5 h-5" />
            </div>
            <span className="text-sm text-zinc-400">Yottly</span>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/dashboard")}>
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
  )
}

export default Header