# Security & Infrastructure Analiz Raporu (Kısmen)

**Proje:** Var Odasi — Next.js, NextAuth v5, Prisma, PostgreSQL
**Tarih:** 2026-03-30
**Mod:** Hafif tarama (max 12 tool call)

---

## Mevcut Durum — Puan: 4/10

Proje erken asamada; temel auth altyapisi kurulmus ancak ciddi secret sizintisi ve eksik yetkilendirme kontrolleri mevcut.

---

## Kritik Bulgular

### 1. `.env` dosyasinda gercek secret'lar (KRITIK)

**Dosya:** `.env`

`.gitignore` dosyasi `.env*` desenini dogru sekilde haric tutuyor, ancak `.env` dosyasinin icinde gercek uretim degerleri var:
- `DATABASE_URL` icinde Neon veritabani baglanti bilgileri (kullanici adi + sifre)
- `ADMIN_SECRET` gercek SHA-256 hash degeri
- `AUTH_SECRET` gercek base64 degeri

Ayrica dosyanin basinda "ornek" placeholder'lar, sonunda ise gercek degerler var — dosya yapisal olarak karisik.

### 2. Admin Auth mekanizmasi zayif

**Dosya:** `src/middleware.ts` ve `src/app/api/admin-auth/route.ts`

- Admin girisi statik bir `ADMIN_SECRET` token karsilastirmasina dayaniyor — rate limiting, brute-force korumasi yok
- Token cookie'ye `httpOnly` + `secure` + `sameSite: strict` olarak kaydediliyor (bu iyi), ancak token'in kendisi `ADMIN_SECRET` degerinin birebir kopyasi — hash'lenmemis
- Cookie suresiz 7 gun — revoke mekanizmasi yok

### 3. Bircok API route'ta auth kontrolu yok

Middleware sadece `PROTECTED_PATHS` ve `ADMIN_API_PATHS` listesindeki yazma islemlerini koruyor. Asagidaki route'lar **hicbir auth kontrolu olmadan** erisilebilir:

- `/api/var-events` (GET)
- `/api/statistics/*` (GET)
- `/api/search/*` (GET)
- `/api/match-videos/*` (GET/POST/PUT/DELETE)
- `/api/dev/crawler` (GET/POST)
- `/api/incidents/[id]/ai-prediction` (GET)
- Tum GET route'lari (matches, incidents, referees, commentators, opinions)

Public bir API olarak tasarlanmis olabilir, ancak `/api/dev/crawler` ve `/api/match-videos` yazma islemleri acik kaliyor.

### 4. Input validation eksik

API route'larda sistematik bir input validation katmani (zod, yup vb.) gorunmuyor. `request.json()` ile alinan veriler dogrudan isleniyor.

### 5. CORS ayari yok

Next.js varsayilan olarak CORS header'i eklemiyor — bu durumda aslinda varsayilan guvenli. Ancak mobile app veya 3. parti entegrasyon planlaniyorsa explicit CORS politikasi tanimlanmali.

### 6. Prisma raw query kullanimi yok (POZITIF)

`src/` dizininde `$queryRaw`, `$executeRaw` kullanimi yok. SQL injection riski dusuk.

---

## Ozet Tablo

| # | Bulgu | Etki | Efor | Oneri |
|---|-------|------|------|-------|
| 1 | `.env` dosyasinda gercek secret'lar | **High** | **S** | `.env` dosyasini temizle, sadece placeholder birak. Gercek degerler sadece deployment ortaminda olmali. Git history'de secret varsa rotate et. |
| 2 | Admin auth brute-force korumasiz | **High** | **M** | Rate limiting ekle (upstash/ratelimit veya basit in-memory). Token'i hash'leyerek cookie'de sakla. |
| 3 | `/api/dev/crawler` ve `/api/match-videos` yazma islemleri acik | **High** | **S** | Bu path'leri `ADMIN_API_PATHS` veya `PROTECTED_PATHS` listesine ekle. `/api/dev/*` production'da tamamen kapatilmali. |
| 4 | Input validation yok | **Med** | **M** | Zod schema'lari ile API route'larda request body/query validation ekle. |
| 5 | Session revoke mekanizmasi yok | **Med** | **M** | Admin token icin DB-backed session veya kisa sureli JWT + refresh token mekanizmasi. |
| 6 | Tum GET API'ler public | **Low** | **S** | Kasitli ise dokumante et. Degilse hassas verileri auth arkasina al. |
| 7 | Explicit CORS politikasi yok | **Low** | **S** | `next.config.ts` veya middleware'de CORS header'lari tanimla. |

---

**Oncelik sirasi:** 1 > 3 > 2 > 4 > 5 > 6 > 7

En acil is: `.env` dosyasindaki gercek secret'lari temizlemek ve eger git history'de commit edilmisse tum secret'lari rotate etmek. Ikinci olarak `/api/dev/crawler` ve `/api/match-videos` yazma endpointlerini middleware korumasina almak.
