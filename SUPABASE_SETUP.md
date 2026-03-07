# Supabase Kurulum Rehberi

## 🎯 Neden Supabase?

✅ **Tamamen Ücretsiz** - 500MB database, 2GB bandwidth, 50K MAU
✅ **PostgreSQL Tabanlı** - Mevcut Prisma şemanız çalışır
✅ **Real-time** - Canlı güncellemeler
✅ **Authentication** - Built-in auth sistemi
✅ **Storage** - Dosya depolama
✅ **Kolay Kullanım** - Dashboard ve API

## 📋 Adım 1: Supabase Hesabı Oluştur

1. https://supabase.com adresine git
2. "Start your project" tıkla
3. GitHub ile giriş yap (veya email)
4. Yeni proje oluştur:
   - Project name: `football-ai-platform`
   - Database password: Güçlü bir şifre seç
   - Region: En yakın bölgeyi seç (Avrupa önerilir)

## 📋 Adım 2: Database Connection String'i Al

1. Supabase Dashboard → Settings → Database
2. "Connection string" bölümünden "URI" formatını kopyala
3. `.env` dosyasına ekle:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## 📋 Adım 3: API Keys'i Al

1. Supabase Dashboard → Settings → API
2. Şunları kopyala:
   - `anon` key (public)
   - `service_role` key (server-side only - gizli tut!)

`.env` dosyasına ekle:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

## 📋 Adım 4: Mevcut Verileri Taşı (Opsiyonel)

Eğer Neon'dan veri taşıyacaksanız:

```bash
# Neon'dan dump al
pg_dump [NEON_CONNECTION_STRING] > backup.sql

# Supabase'e yükle
psql [SUPABASE_CONNECTION_STRING] < backup.sql
```

## 📋 Adım 5: Migration Çalıştır

```bash
npx prisma migrate deploy
# veya
npx prisma migrate dev
```

## ✅ Hazır!

Artık Supabase kullanıyorsunuz. Mevcut Prisma kodlarınız çalışmaya devam edecek.

## 🚀 Ekstra Özellikler

### Real-time Subscriptions
```typescript
import { createClient } from '@/lib/supabase'

const supabase = createClient()
supabase
  .channel('incidents')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'Incident' 
  }, (payload) => {
    console.log('Yeni pozisyon!', payload.new)
  })
  .subscribe()
```

### Authentication
```typescript
// Login
await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
})

// Session kontrolü
const { data: { session } } = await supabase.auth.getSession()
```

### Storage
```typescript
// Upload
await supabase.storage
  .from('videos')
  .upload('match-123.mp4', file)

// Download URL
const { data } = supabase.storage
  .from('videos')
  .getPublicUrl('match-123.mp4')
```
