import { NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sessionId } = body;

    // Get current session token from cookie or header
    const tokenFromCookie = request.headers.get("cookie")?.match(/admin_token=([^;]*)/)?.[1];
    const tokenFromHeader = request.headers.get("x-admin-token");
    const currentToken = tokenFromCookie || tokenFromHeader;

    if (!currentToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Verify current session is valid
    const currentSession = await prisma.adminSession.findUnique({
      where: { token: currentToken },
    });

    if (!currentSession || currentSession.expiresAt < new Date() || currentSession.revokedAt) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    switch (action) {
      case "current":
        // Revoke current session (logout)
        await prisma.adminSession.update({
          where: { id: currentSession.id },
          data: { revokedAt: new Date() },
        });

        const response = NextResponse.json({ success: true, message: "Session revoked" });

        // Clear the cookie
        response.cookies.set("admin_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 0,
        });

        return response;

      case "specific":
        // Revoke a specific session by ID
        if (!sessionId) {
          return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const targetSession = await prisma.adminSession.findUnique({
          where: { id: sessionId },
        });

        if (!targetSession) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (targetSession.revokedAt) {
          return NextResponse.json({ error: "Session already revoked" }, { status: 400 });
        }

        await prisma.adminSession.update({
          where: { id: sessionId },
          data: { revokedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: "Session revoked" });

      case "all":
        // Revoke all sessions except current one
        const revokedCount = await prisma.adminSession.updateMany({
          where: {
            id: { not: currentSession.id },
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { revokedAt: new Date() },
        });

        return NextResponse.json({
          success: true,
          message: `${revokedCount.count} sessions revoked`,
          revokedCount: revokedCount.count,
        });

      case "all_including_current":
        // Revoke all sessions including current one
        const allRevokedCount = await prisma.adminSession.updateMany({
          where: {
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { revokedAt: new Date() },
        });

        const responseAll = NextResponse.json({
          success: true,
          message: `${allRevokedCount.count} sessions revoked`,
          revokedCount: allRevokedCount.count,
        });

        // Clear the cookie since current session was also revoked
        responseAll.cookies.set("admin_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 0,
        });

        return responseAll;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint to list active sessions
export async function GET(request: Request) {
  try {
    // Get current session token from cookie or header
    const tokenFromCookie = request.headers.get("cookie")?.match(/admin_token=([^;]*)/)?.[1];
    const tokenFromHeader = request.headers.get("x-admin-token");
    const currentToken = tokenFromCookie || tokenFromHeader;

    if (!currentToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Verify current session is valid
    const currentSession = await prisma.adminSession.findUnique({
      where: { token: currentToken },
    });

    if (!currentSession || currentSession.expiresAt < new Date() || currentSession.revokedAt) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    // Get all active sessions (not expired and not revoked)
    const activeSessions = await prisma.adminSession.findMany({
      where: {
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      sessions: activeSessions,
      currentSessionId: currentSession.id,
    });
  } catch (error) {
    console.error("Failed to list sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}