import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/database/db";
import { signupRateLimiter, getClientIP } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  if (!signupRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
    const nameStr = typeof name === "string" ? name.trim().slice(0, 100) : "";
    const passwordStr = typeof password === "string" ? password : "";

    if (!emailStr || !passwordStr) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunludur" },
        { status: 400 }
      );
    }

    if (passwordStr.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: emailStr } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(passwordStr, 12);
    const nickname = nameStr || emailStr.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email: emailStr,
        name: nameStr || nickname,
        nickname,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
    });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json(
      { error: "Kayıt oluşturulamadı" },
      { status: 500 }
    );
  }
}
