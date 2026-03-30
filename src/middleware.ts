import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// CORS configuration
const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://football-ai-platform.vercel.app",
  // Add mobile app origins and third-party integration origins here
];

const CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const CORS_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Admin-Token",
  "X-Requested-With",
];

const PROTECTED_PATHS = ["/dashboard", "/api/chat", "/api/crawler"];

const ADMIN_ONLY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const ADMIN_API_PATHS = [
  "/api/matches",
  "/api/incidents",
  "/api/suggestions", // PATCH/DELETE /api/suggestions/[id] admin only; POST /api/suggestions user auth (API'de kontrol)
  "/api/commentators",
  "/api/referees",
  "/api/opinions",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminApiWrite(pathname: string, method: string): boolean {
  // POST /api/suggestions: kullanıcı girişi (NextAuth) - API kendi auth kontrolü yapar
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
    // Allow any origin in development
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  response.headers.set("Access-Control-Allow-Methods", CORS_METHODS.join(", "));
  response.headers.set("Access-Control-Allow-Headers", CORS_HEADERS.join(", "));
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  return response;
}

function handleCorsPrelight(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, origin);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const origin = request.headers.get("origin");

  // Handle CORS preflight requests
  if (method === "OPTIONS") {
    return handleCorsPrelight(request);
  }

  const needsAuth = isProtectedPath(pathname) || isAdminApiWrite(pathname, method);

  if (!needsAuth) {
    const response = NextResponse.next();
    return setCorsHeaders(response, origin);
  }

  const tokenFromCookie = request.cookies.get("admin_token")?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  const token = tokenFromCookie || tokenFromHeader;

  if (ADMIN_SECRET && token === ADMIN_SECRET) {
    const response = NextResponse.next();
    return setCorsHeaders(response, origin);
  }

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.json({ error: "Not found" }, { status: 404 });
    return setCorsHeaders(response, origin);
  }

  const response = NextResponse.rewrite(new URL("/not-found", request.url));
  return setCorsHeaders(response, origin);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
