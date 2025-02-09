"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const cleanTranscriptText = (text: string) => {
  return text
    .replace(/&amp;#39;/g, "'")

    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

    .replace(/\s+/g, ' ')
    .trim();
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcriptData, setTranscriptData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });
      const data = await response.json();
      
      if (typeof data.transcript === 'string') {
        setTranscriptData([{ 
          text: cleanTranscriptText(data.transcript), 
          offset: 0 
        }]);
      } else {
        // Clean each transcript segment
        const cleanedTranscript = data.transcript.map((entry: any) => ({
          ...entry,
          text: cleanTranscriptText(entry.text)
        }));
        setTranscriptData(cleanedTranscript);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscriptData([]);
    }
    setLoading(false);
  };

  const fullTranscript = transcriptData.map(entry => entry.text).join(" ");

  return (
    <main className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <h1 className="text-2xl font-bold">YouTube Video Transcript</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
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
          </form>
        </CardContent>
      </Card>

      {transcriptData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Timestamped Cards */}
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-xl font-semibold">Timestamped Transcript</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 grid gap-4">
                  {transcriptData.map((entry, index) => (
                    <Card key={index} className="bg-card">
                      <CardHeader className="p-3 pb-2">
                        <div className="text-sm text-muted-foreground">
                          {formatTime(entry.offset)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-card-foreground">{entry.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Column - Full Text */}
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-xl font-semibold">Full Transcript</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4">
                  <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">
                    {fullTranscript}
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}