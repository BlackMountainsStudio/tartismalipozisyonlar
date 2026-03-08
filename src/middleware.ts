import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const needsAuth = isProtectedPath(pathname) || isAdminApiWrite(pathname, method);

  if (!needsAuth) return NextResponse.next();

  const tokenFromCookie = request.cookies.get("admin_token")?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  const token = tokenFromCookie || tokenFromHeader;

  if (ADMIN_SECRET && token === ADMIN_SECRET) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
