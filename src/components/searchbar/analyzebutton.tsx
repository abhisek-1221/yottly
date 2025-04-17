import { Button } from './button'
import React from 'react'

export default function AnalyzeButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="default"
      onClick={onClick}
      className="h-7 px-3 py-0 rounded-[99px] text-[13px] font-semibold text-white bg-gradient-to-b from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-500 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-200"
    >
      Analyze
    </Button>
  )
}
