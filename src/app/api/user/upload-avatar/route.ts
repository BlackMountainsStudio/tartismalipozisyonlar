import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { getSupabaseStorage } from "@/lib/supabase-storage";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const supabase = getSupabaseStorage();
  if (!supabase) {
    return NextResponse.json(
      { error: "Profil resmi yükleme şu an kullanılamıyor" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya en fazla 2MB olabilir" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG, WebP veya GIF desteklenir" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `avatars/${session.user.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = "avatars";
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Yükleme başarısız. Supabase Storage'da 'avatars' bucket'ı oluşturun." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (err) {
    console.error("POST /api/user/upload-avatar error:", err);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
