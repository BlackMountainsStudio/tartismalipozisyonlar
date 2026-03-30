import { NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { adminAuthRateLimiter, getClientIP } from "@/lib/rateLimiter";
import crypto from "crypto";

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

  try {
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 hours

    const userAgent = request.headers.get("user-agent") || undefined;
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    await prisma.adminSession.create({
      data: {
        token: sessionToken,
        expiresAt,
        ipAddress: ipAddress !== "unknown" ? ipAddress : undefined,
        userAgent,
      },
    });

    const response = NextResponse.json({ ok: true });

    response.cookies.set("admin_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours to match DB session
    });

    return response;
  } catch (error) {
    console.error("Failed to create admin session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
