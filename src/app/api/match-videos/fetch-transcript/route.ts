import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:watch\?v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/** YouTube videodan transcript çıkar */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "videoUrl gerekli" },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeId(videoUrl.trim());
    if (!videoId) {
      return NextResponse.json(
        { error: "Geçerli YouTube URL değil" },
        { status: 400 }
      );
    }

    const segments = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "tr", // Önce Türkçe dene
    }).catch(() =>
      YoutubeTranscript.fetchTranscript(videoId) // Fallback: mevcut dil
    );

    // Transcript metnini birleştir (timestamp ile)
    const fullTranscript = segments
      .map((s) => {
        const min = Math.floor(s.offset / 60);
        const sec = Math.floor(s.offset % 60);
        return `[${min}:${sec.toString().padStart(2, "0")}] ${s.text}`;
      })
      .join("\n");

    const totalChars = fullTranscript.length;
    const durationSec = segments.length > 0
      ? segments[segments.length - 1].offset + (segments[segments.length - 1].duration ?? 0)
      : 0;
    const durationMin = Math.round(durationSec / 60);

    return NextResponse.json({
      transcript: fullTranscript,
      videoId,
      segmentCount: segments.length,
      durationMin,
      totalChars,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("fetch-transcript error:", err);
    return NextResponse.json(
      { error: `Transcript alınamadı: ${msg}` },
      { status: 500 }
    );
  }
}
