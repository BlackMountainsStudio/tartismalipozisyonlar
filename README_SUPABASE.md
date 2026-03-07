# 🚀 Supabase Entegrasyonu - Hızlı Başlangıç

## ✅ Kurulum Tamamlandı!

Supabase entegrasyonu için gerekli dosyalar hazırlandı.

## 📦 Paket Kurulumu

```bash
npm install @supabase/supabase-js
```

## 🔧 Environment Variables

`.env` dosyanıza şunları ekleyin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 📚 Kullanım

### 1. Supabase Client Import

```typescript
import { supabase } from '@/lib/supabase'
```

### 2. Real-time Özellikler

```typescript
// Yeni pozisyonları dinle
import { subscribeToIncidents } from '@/lib/supabase-examples'

const unsubscribe = subscribeToIncidents((incident) => {
  console.log('Yeni pozisyon:', incident)
})

// Temizle
unsubscribe()
```

### 3. Authentication

```typescript
// Giriş yap
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
})

// Session kontrolü
const { data: { session } } = await supabase.auth.getSession()
```

### 4. Storage

```typescript
// Video yükle
const file = event.target.files[0]
const url = await uploadVideo(file, matchId)
```

## 🎯 Avantajlar

✅ **Ücretsiz Tier:**
- 500MB database
- 2GB bandwidth
- 50K MAU (Monthly Active Users)
- Real-time subscriptions
- Authentication
- 1GB storage

✅ **Mevcut Kodlarınız Çalışır:**
- Prisma şemanız aynen çalışır
- Mevcut API route'larınız çalışır
- Sadece DATABASE_URL değişir

✅ **Ekstra Özellikler:**
- Real-time updates
- Built-in authentication
- File storage
- Row Level Security (RLS)

## 📖 Detaylı Dokümantasyon

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Detaylı kurulum
- [Supabase Examples](./src/lib/supabase-examples.ts) - Kullanım örnekleri
- [Supabase Docs](https://supabase.com/docs) - Resmi dokümantasyon

## 🔄 Mevcut Neon Postgres'ten Geçiş

Eğer Neon kullanıyorsanız ve Supabase'e geçmek istiyorsanız:

1. Supabase projesi oluştur
2. `.env` dosyasındaki `DATABASE_URL`'i Supabase connection string ile değiştir
3. Migration çalıştır: `npx prisma migrate deploy`
4. (Opsiyonel) Mevcut verileri taşı

**Not:** Neon'da kalabilirsiniz de! Supabase sadece ekstra özellikler (real-time, auth) için kullanılabilir.
