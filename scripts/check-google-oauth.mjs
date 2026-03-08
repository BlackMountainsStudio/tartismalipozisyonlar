#!/usr/bin/env node
/**
 * Google OAuth kurulum kontrolü
 * Kullanım: node scripts/check-google-oauth.mjs
 *
 * Önce Google Cloud Console'da credentials oluşturun, sonra .env'e ekleyin.
 */

import "dotenv/config";

const id = process.env.AUTH_GOOGLE_ID;
const secret = process.env.AUTH_GOOGLE_SECRET;

console.log("🔐 Google OAuth kontrolü\n");

if (id && secret) {
  console.log("✅ AUTH_GOOGLE_ID ve AUTH_GOOGLE_SECRET tanımlı.");
  console.log("   Google ile giriş kullanılabilir.\n");
  process.exit(0);
}

console.log("⚠️  Google OAuth henüz ayarlı değil.\n");
console.log("Adımlar:\n");
console.log("1. Şu linke gidin (Google ile giriş yapın):");
console.log("   https://console.cloud.google.com/apis/credentials/consent?project=varodasi\n");
console.log("2. OAuth consent screen:");
console.log("   - User Type: External → Create");
console.log("   - App name, e-posta alanlarını doldurup Save and Continue\n");
console.log("3. Credentials sayfasına gidin:");
console.log("   https://console.cloud.google.com/apis/credentials?project=varodasi\n");
console.log("4. + CREATE CREDENTIALS → OAuth client ID");
console.log("   - Application type: Web application");
console.log("   - Authorized redirect URIs ekleyin:");
console.log("     • http://localhost:3000/api/auth/callback/google");
console.log("     • https://varodasi.com/api/auth/callback/google\n");
console.log("5. Create sonrası Client ID ve Client Secret'ı kopyalayın.\n");
console.log("6. Proje kökündeki .env dosyasına ekleyin:");
console.log('   AUTH_GOOGLE_ID="...client-id...apps.googleusercontent.com"');
console.log('   AUTH_GOOGLE_SECRET="...client-secret..."\n');
console.log("7. Sunucuyu yeniden başlatın: npm run dev\n");
process.exit(1);
