import { NextResponse } from "next/server";
import { PlaylistDetails, VideoItem, parseDuration  } from "@/lib/youtube";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;


async function fetchPlaylistVideoIds(playlistId: string): Promise<string[]> {
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;
  
    do {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/playlistItems?part=contentDetails&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&maxResults=50${
          nextPageToken ? `&pageToken=${nextPageToken}` : ""
        }`
      );
      const data = await response.json();
      videoIds.push(...data.items.map((item: any) => item.contentDetails.videoId));
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
  
    return videoIds;
  }

  async function fetchVideoDetails(videoIds: string[]): Promise<{ videos: VideoItem[]; totalDuration: number }> {
    const fetchChunk = async (chunk: string[]): Promise<{ videos: VideoItem[]; chunkDuration: number }> => {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails,snippet,statistics&id=${chunk.join(
          ","
        )}&key=${YOUTUBE_API_KEY}`
      );
  
      const data = await response.json();
      
      const chunkDuration = data.items.reduce(
        (acc: number, item: any) => acc + parseDuration(item.contentDetails.duration),
        0
      );
  
      const videos: VideoItem[] = data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount),
        likeCount: parseInt(item.statistics.likeCount),
      }));
  
      return { videos, chunkDuration };
    };
  
    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      chunks.push(videoIds.slice(i, i + 50));
    }
  
    const results = await Promise.all(chunks.map(fetchChunk));
    const allVideos = results.flatMap((result) => result.videos);
    const totalDuration = results.reduce(
      (acc, result) => acc + result.chunkDuration,
      0
    );
  
    return { videos: allVideos, totalDuration };
  }

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