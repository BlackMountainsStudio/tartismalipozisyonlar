# PostgreSQL Migration Rehberi

## Neon Veritabanı Kurulumu

1. https://neon.tech adresine gidin
2. GitHub hesabınızla kaydolun
3. "Create Project" tıklayın
4. Proje adı: `football-ai-platform`
5. Region seçin (Avrupa'ya yakın)
6. "Create Project" tıklayın

## Connection String Alma

1. Neon dashboard'da projenize gidin
2. "Connection Details" bölümüne tıklayın
3. Connection string'i kopyalayın (şu formatta olacak):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Vercel Environment Variable Ekleme

1. Vercel Dashboard → Projeniz → Settings → Environment Variables
2. "Add Environment Variable" tıklayın
3. **Key:** `DATABASE_URL`
4. **Value:** Neon'dan kopyaladığınız connection string
5. **Environments:** Production, Preview, Development (veya All Environments)
6. **Sensitive:** ✅ Açık
7. "Save" tıklayın

## Migration Çalıştırma

### Seçenek 1: Vercel'de (Önerilen)

Vercel dashboard'da:
1. Projenize gidin
2. "Deployments" sekmesine gidin
3. Son deployment'a tıklayın
4. "Functions" sekmesine gidin
5. Terminal açın ve şunu çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```

### Seçenek 2: Local'den (DATABASE_URL set edilmişse)

Local terminal'de:
```bash
# .env dosyanıza Neon connection string'i ekleyin
DATABASE_URL="postgresql://..."

# Migration çalıştırın
npx prisma migrate deploy
```

### Seçenek 3: Yeni Migration Oluşturma

Eğer migration'lar çalışmazsa, yeni migration oluşturun:

```bash
# Local'de .env'e Neon DATABASE_URL ekleyin
npx prisma migrate dev --name init_postgresql
```

## Kontrol

Migration başarılı olduktan sonra:
1. Vercel'de yeniden deploy edin
2. Site çalışmalı
3. API route'ları test edin: `/api/matches`
