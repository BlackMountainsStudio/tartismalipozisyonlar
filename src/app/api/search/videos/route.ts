import { NextRequest, NextResponse } from "next/server";

interface VideoResult {
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  duration?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await searchVideos(query);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Video search error:", err);
    return NextResponse.json([]);
  }
}

async function searchVideos(query: string): Promise<VideoResult[]> {
  const results: VideoResult[] = [];

  const searchQuery = encodeURIComponent(`${query} futbol pozisyon`);

  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=8&key=${youtubeApiKey}`,
        { next: { revalidate: 300 } }
      );
      if (res.ok) {
        const data = await res.json();
        for (const item of data.items ?? []) {
          results.push({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
            source: "YouTube",
          });
        }
      }
    }
  } catch {
    // YouTube API unavailable
  }

  if (results.length === 0) {
    const generated = generateSearchSuggestions(query);
    results.push(...generated);
  }

  return results;
}

function generateSearchSuggestions(query: string): VideoResult[] {
  const encodedQuery = encodeURIComponent(query);
  return [
    {
      title: `YouTube'da ara: "${query}"`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+futbol+pozisyon`,
      thumbnail: "",
      source: "YouTube",
    },
    {
      title: `Twitter/X'te ara: "${query}"`,
      url: `https://x.com/search?q=${encodedQuery}+pozisyon&f=video`,
      thumbnail: "",
      source: "Twitter/X",
    },
    {
      title: `beIN Sports ara: "${query}"`,
      url: `https://www.beinsports.com.tr/ara?q=${encodedQuery}`,
      thumbnail: "",
      source: "beIN Sports",
    },
  ];
}
