import { NextRequest, NextResponse } from "next/server";

interface RefereeCommentResult {
  source: string;
  author: string;
  comment: string;
  url: string;
  date?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await searchRefereeComments(query);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Referee comment search error:", err);
    return NextResponse.json([]);
  }
}

async function searchRefereeComments(query: string): Promise<RefereeCommentResult[]> {
  const results: RefereeCommentResult[] = [];

  const encodedQuery = encodeURIComponent(query);

  results.push(
    {
      source: "Google",
      author: "",
      comment: `"${query}" - hakem yorumları`,
      url: `https://www.google.com/search?q=${encodedQuery}+hakem+yorumu+penalt%C4%B1+ofsayt`,
      date: new Date().toISOString(),
    },
    {
      source: "Haber Ara",
      author: "",
      comment: `"${query}" - spor haberleri`,
      url: `https://www.google.com/search?q=${encodedQuery}+hakem+karar%C4%B1&tbm=nws`,
      date: new Date().toISOString(),
    },
    {
      source: "Ekşi Sözlük",
      author: "",
      comment: `"${query}" - Ekşi Sözlük`,
      url: `https://eksisozluk.com/?q=${encodedQuery}+hakem`,
      date: new Date().toISOString(),
    },
    {
      source: "Twitter/X",
      author: "",
      comment: `"${query}" - X arama`,
      url: `https://x.com/search?q=${encodedQuery}+hakem&f=live`,
      date: new Date().toISOString(),
    }
  );

  return results;
}
