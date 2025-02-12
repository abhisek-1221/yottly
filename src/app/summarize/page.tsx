'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'

export default function TranscriptSummarizer() {
  const [summary, setSummary] = useState<string>('')
  const { messages, input, setInput , isLoading } = useChat()

  // This would be your predefined transcript
const transcript = `To live as gently as I can;
To be, no matter where, a man;To take what comes of good or illAnd cling to faith and honor still;To do my best, and let that standThe record of my brain and hand;And then, should failure come to me,Still work and hope for victory.To have no secret place whereinI stoop unseen to shame or sin;To be the same when I'm aloneAs when my every deed is known;To live undaunted, unafraidOf any step that I have made;To be without pretense or shamExactly what men think I am.To leave some simple mark behindTo keep my having lived in mind;If enmity to aught I show,To be an honest, generous foe,To play my little part, nor whineThat greater honors are not mine.This, I believe, is all I needFor my philosophy and creed.Edgar A. Guest. "My Creed."`

  const handleSummarize = () => {
    setInput(transcript)
  }

  // Update summary when new assistant message is received
  if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
    setSummary(messages[messages.length - 1].content)
  }

  return (
    <div className="w-auto mx-auto p-4 flex-grow">
      <h1 className="text-2xl font-bold mb-4">YouTube Transcript Summarizer</h1>
      <Button onClick={handleSummarize} disabled={isLoading}>
        {isLoading ? 'Summarizing...' : 'Summarize'}
      </Button>
      {summary && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  )
}