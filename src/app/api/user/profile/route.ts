import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { UserProfilePatchSchema, parseBody } from "@/lib/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, nickname: true },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  try {
    const raw = await request.json();
    const parsed = parseBody(UserProfilePatchSchema, raw);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { name, nickname, email } = parsed.data;
    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (nickname !== undefined) data.nickname = nickname || null;
    if (email) data.email = email;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      nickname: user.nickname,
    });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}
