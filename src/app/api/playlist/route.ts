import { NextResponse } from "next/server";

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