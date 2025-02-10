import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    // Extract Video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Fetch transcript
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(transcriptData);
    

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json({ error: "No transcript found" }, { status: 404 });
    }

    // Return the full transcript data array
    return NextResponse.json({ transcript: transcriptData });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json({ error: "Error fetching transcript" }, { status: 500 });
  }
}

// Helper function to extract video ID from a YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}