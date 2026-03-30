import { NextResponse } from "next/server";
import { adminAuthRateLimiter, getClientIP } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  // Check rate limit before processing
  const clientIP = getClientIP(request);

  if (!adminAuthRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await request.json();
  const secret = process.env.ADMIN_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
