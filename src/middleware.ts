import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashAdminToken } from "@/lib/admin-auth";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

const PROTECTED_PATHS = ["/dashboard", "/api/chat", "/api/crawler", "/api/dev"];

const ADMIN_ONLY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const ADMIN_API_PATHS = [
  "/api/matches",
  "/api/incidents",
  "/api/suggestions", // PATCH/DELETE /api/suggestions/[id] admin only; POST /api/suggestions user auth (API'de kontrol)
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
  // POST /api/suggestions: kullanıcı girişi (NextAuth) - API kendi auth kontrolü yapar
  if (pathname === "/api/suggestions" && method === "POST") return false;
  return (
    ADMIN_ONLY_METHODS.includes(method) &&
    ADMIN_API_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const needsAuth = isProtectedPath(pathname) || isAdminApiWrite(pathname, method);

  if (!needsAuth) return NextResponse.next();

  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const tokenFromCookie = request.cookies.get("admin_token")?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");

  // Cookie stores hashed token; header accepts plaintext for direct API calls
  const expectedHash = await hashAdminToken(ADMIN_SECRET);
  const cookieValid = tokenFromCookie === expectedHash;
  const headerValid = tokenFromHeader === ADMIN_SECRET;

  if (cookieValid || headerValid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/crawler/:path*",
    "/api/dev/:path*",
    "/api/chat/:path*",
    "/api/matches/:path*",
    "/api/incidents/:path*",
    "/api/commentators/:path*",
    "/api/referees/:path*",
    "/api/opinions/:path*",
    "/api/match-videos/:path*",
    "/api/suggestions/:path*",
  ],
};
