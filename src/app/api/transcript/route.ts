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

    console.log("Fetching transcript for video ID:", videoId);

    // Fetch transcript
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json({ error: "No transcript found" }, { status: 404 });
    }

    // Format transcript text into a readable string
    const transcriptText = transcriptData.map((entry) => entry.text).join(" ");

    return NextResponse.json({ transcript: transcriptText });
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
