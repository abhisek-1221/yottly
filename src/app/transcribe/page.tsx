"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Eye, ThumbsUp, Calendar } from "lucide-react";

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    maxres?: { url: string };
    high?: { url: string };
    medium?: { url: string };
  };
  channelTitle: string;
  publishedAt: string;
  duration: number;
  viewCount: number;
  likeCount: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch video details
      const videoResponse = await fetch("/api/videoDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const videoData = await videoResponse.json();
      if (videoData.video) {
        setVideoDetails(videoData.video);
      }

      // Fetch transcript
      const transcriptResponse = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const transcriptData = await transcriptResponse.json();
      
      if (typeof transcriptData.transcript === 'string') {
        setTranscriptData([{ 
          text: cleanTranscriptText(transcriptData.transcript), 
          offset: 0 
        }]);
      } else {
        const cleanedTranscript = transcriptData.transcript.map((entry: any) => ({
          ...entry,
          text: cleanTranscriptText(entry.text)
        }));
        setTranscriptData(cleanedTranscript);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTranscriptData([]);
    }
    setLoading(false);
  };

  const fullTranscript = transcriptData.map(entry => entry.text).join(" ");

  return (
    <main className="container mx-auto p-4 max-w-7xl">
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

      {videoDetails && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-[300px,1fr] gap-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={videoDetails.thumbnails.maxres?.url || 
                       videoDetails.thumbnails.high?.url || 
                       videoDetails.thumbnails.medium?.url}
                  alt={videoDetails.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold leading-tight">{videoDetails.title}</h2>
                <p className="text-muted-foreground">{videoDetails.channelTitle}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(videoDetails.publishedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(videoDetails.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatNumber(videoDetails.viewCount)} views
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {formatNumber(videoDetails.likeCount)} likes
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {transcriptData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-xl font-semibold">Timestamped Transcript</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 grid gap-4">
                  {transcriptData.map((entry, index) => (
                    <Card key={index} className="bg-card hover:bg-accent/50 transition-colors">
                      <CardHeader className="p-3 pb-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
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