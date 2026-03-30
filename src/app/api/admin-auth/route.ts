import { NextResponse } from "next/server";
import { hashAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { token } = await request.json();
  const secret = process.env.ADMIN_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hashedToken = await hashAdminToken(secret);
  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin_token", hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
