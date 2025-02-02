import { NextResponse } from "next/server";
import { PlaylistDetails } from "@/lib/youtube";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

async function fetchPlaylistDetails(playlistId: string): Promise<PlaylistDetails> {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    
    const playlist = data.items[0];
  
    if (playlist === undefined) {
      throw new Error("Invalid playlist ID");
    }
  
    return {
      id: playlist.id,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnails: playlist.snippet.thumbnails,
    };
  }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("id");

    if (!playlistId) {
        return NextResponse.json({ error: "Missing playlist ID" }, { status: 400 });
    }   

    try {
        const playlistDetails = await fetchPlaylistDetails(playlistId);
        const videoIds = await fetchPlaylistVideoIds(playlistId);
        const { videos, totalDuration } = await fetchVideoDetails(videoIds);
    
        return NextResponse.json({
          playlistDetails,
          videos,
          totalDuration,
          totalVideos: videos.length,
        });
      } catch (error) {
        console.error('Error fetching playlist data:', error);
        if (error instanceof Error && error.message === "Invalid playlist ID") {
          return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to fetch playlist data' }, { status: 500 });
      }
    }