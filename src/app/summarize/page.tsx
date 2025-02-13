"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TranscriptSegment {
  text: string;
  startTime: string;
  endTime: string;
}

interface TranscriptResponse {
  segments: TranscriptSegment[];
  fullTranscript: string;
}

export default function TranscriptPage() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);



  const fetchTranscript = async () => {

    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transcript');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>YouTube Transcript Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={fetchTranscript}
              disabled={loading || !url}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                'Get Transcript'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transcript && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Full Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{transcript.fullTranscript}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamped Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transcript.segments.map((segment, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="text-sm text-muted-foreground mb-1">
                      {segment.startTime} - {segment.endTime}
                    </div>
                    <p>{segment.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}