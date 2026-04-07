import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://football-ai-platform.vercel.app",
];

const CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const CORS_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Admin-Token",
  "X-Requested-With",
];

const PROTECTED_PATHS = ["/dashboard", "/api/chat", "/api/crawler", "/api/dev/crawler"];

const ADMIN_ONLY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const ADMIN_API_PATHS = [
  "/api/matches",
  "/api/incidents",
  "/api/suggestions",
  "/api/commentators",
  "/api/referees",
  "/api/opinions",
  "/api/match-videos",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminApiWrite(pathname: string, method: string): boolean {
  if (pathname === "/api/suggestions" && method === "POST") return false;
  return (
    ADMIN_ONLY_METHODS.includes(method) &&
    ADMIN_API_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  );
}

function setCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && CORS_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
  response.headers.set("Access-Control-Allow-Methods", CORS_METHODS.join(", "));
  response.headers.set("Access-Control-Allow-Headers", CORS_HEADERS.join(", "));
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

async function validateAdminSession(token: string, requestUrl: string): Promise<boolean> {
  // Direct admin secret check (fast path, no DB needed)
  if (ADMIN_SECRET && token === ADMIN_SECRET) return true;

  // Validate session token via internal API call (Edge-compatible)
  try {
    const url = new URL("/api/admin-auth/revoke", requestUrl);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { cookie: `admin_token=${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      // If the endpoint returns sessions, the token is valid (it found active sessions)
      return Array.isArray(data) && data.length > 0;
    }
  } catch {
    // DB unreachable — fall back to secret check only
  }

  return false;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const origin = request.headers.get("origin");

  if (method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    return setCorsHeaders(response, origin);
  }

  const needsAuth = isProtectedPath(pathname) || isAdminApiWrite(pathname, method);

  if (!needsAuth) {
    const response = NextResponse.next();
    return setCorsHeaders(response, origin);
  }

  const tokenFromCookie = request.cookies.get("admin_token")?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      return setCorsHeaders(response, origin);
    }
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  const isValid = await validateAdminSession(token, request.url);

  if (isValid) {
    const response = NextResponse.next();
    return setCorsHeaders(response, origin);
  }

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.json({ error: "Not found" }, { status: 404 });
    return setCorsHeaders(response, origin);
  }

  return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
