"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      })
      const data = await response.json()
      setTranscript(data.transcript)
    } catch (error) {
      console.error("Error fetching transcript:", error)
      setTranscript("Error fetching transcript. Please try again.")
    }
    setLoading(false)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Transcript</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Transcript"}
          </Button>
        </div>
      </form>
      {transcript && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Transcript:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{transcript}</pre>
        </div>
      )}
    </main>
  )
}

