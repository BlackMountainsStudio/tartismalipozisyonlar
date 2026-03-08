#!/usr/bin/env node
/**
 * Auth ve üyelik sistemi kurulum scripti
 * Kullanım: node scripts/setup-auth.mjs
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  console.log("🔐 Auth kurulumu başlatılıyor...\n");

  // 1. AUTH_SECRET kontrolü
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    const crypto = await import("crypto");
    const secret = crypto.randomBytes(32).toString("base64");
    console.log("⚠️  AUTH_SECRET bulunamadı. .env dosyanıza ekleyin:");
    console.log(`   AUTH_SECRET=${secret}\n`);
  } else {
    console.log("✓ AUTH_SECRET ayarlı\n");
  }

  // 2. Supabase avatars bucket
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      const { data: buckets } = await supabase.storage.listBuckets();
      const hasAvatars = buckets?.some((b) => b.name === "avatars");

      if (hasAvatars) {
        console.log("✓ Supabase 'avatars' bucket zaten mevcut\n");
      } else {
        const { error } = await supabase.storage.createBucket("avatars", {
          public: true,
          fileSizeLimit: "2MB",
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        });
        if (error) {
          console.log("⚠️  Supabase avatars bucket oluşturulamadı:", error.message);
          console.log("   Supabase Dashboard > Storage > New bucket > 'avatars' (public) ile manuel oluşturun.\n");
        } else {
          console.log("✓ Supabase 'avatars' bucket oluşturuldu\n");
        }
      }
    } catch (err) {
      console.log("⚠️  Supabase bağlantı hatası:", err.message);
      console.log("   SUPABASE_SERVICE_ROLE_KEY ve NEXT_PUBLIC_SUPABASE_URL kontrol edin.\n");
    }
  } else {
    console.log("⚠️  Supabase env yok - profil resmi yükleme devre dışı.");
    console.log("   NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ekleyin.\n");
  }

  // 3. OAuth uyarıları
  const hasGoogle = process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET;
  const hasFacebook = process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET;

  if (!hasGoogle) console.log("⚠️  AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET ekleyin (Google OAuth)");
  else console.log("✓ Google OAuth ayarlı");

  if (!hasFacebook) console.log("⚠️  AUTH_FACEBOOK_ID / AUTH_FACEBOOK_SECRET ekleyin (Facebook OAuth)");
  else console.log("✓ Facebook OAuth ayarlı");

  console.log("\n📌 OAuth callback URL'leri:");
  console.log("   Google:   https://varodasi.com/api/auth/callback/google");
  console.log("   Facebook: https://varodasi.com/api/auth/callback/facebook");
  console.log("   Local:    http://localhost:3000/api/auth/callback/google");
  console.log("\n✅ Kurulum tamamlandı.");
}

main().catch(console.error);
