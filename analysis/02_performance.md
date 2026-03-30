# Performance & Core Web Vitals Analiz Raporu (Kısmen)

**Proje:** Var Odası — Next.js, React 19, Prisma, PostgreSQL, Tailwind CSS v4
**Tarih:** 2026-03-30
**Mod:** Kısmi (proje taraması, web araştırması yok)

---

## Mevcut Durum
**Puan: 4/10**

Proje, performans açısından ciddi iyileştirme potansiyeli tasiyan bir noktada. Ana sayfa dahil tum public sayfalar `"use client"` ile tamamen client-side rendering yapiyor, hicbir API route'unda caching stratejisi yok (tumu `no-store`), `next/image` hic kullanilmiyor, ve `dynamic()` ile code-splitting yapilmiyor. Vercel Speed Insights ve Analytics entegrasyonu gibi izleme araclari mevcut -- bu olumlu.

---

## Kritik Eksikler

| # | Sorun | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|
| 1 | **Tum public sayfalar `"use client"` — SSR/SSG/ISR sifir** | **High** — Arama motorlari bos HTML gorur (SEO felaketi), FCP/LCP cok yuksek, her ziyaretci icin API cagrilari tekrarlaniyor | Public sayfalari (`page.tsx`, `hakemler/`, `pozisyonlar/`, `yorumcular/`, anasayfa) Server Component'e cevir; veriyi `fetch()` ile sunucu tarafinda al; `revalidate` ile ISR uygula (ornegin 60-300sn) | **XL** |
| 2 | **Tum API route'lari `Cache-Control: no-store`** | **High** — Her istek DB'ye gider, CDN/browser cache sifir; trafik artisinda DB darbogazı | Public GET endpoint'lerine (`/api/matches`, `/api/incidents`, `/api/referees` vb.) uygun `Cache-Control: s-maxage=60, stale-while-revalidate=300` header'i ekle; mutasyon endpoint'leri (`POST/PUT`) no-store kalsin | **M** |
| 3 | **`next/image` hic kullanilmiyor, duz `<img>` tag** | **High** — Otomatik boyut optimizasyonu, lazy loading, WebP/AVIF donusumu, responsive srcset yok; LCP ve CLS dogrudan etkilenir | `CommentSection.tsx` ve `Navbar.tsx`'deki `<img>` etiketlerini `next/image` `Image` component'ine cevir; avatar boyutlari kucuk olsa da WebP donusumu ve lazy loading kazandirır | **S** |
| 4 | **`next/dynamic` (code-splitting) hic yok** | **Med** — 739 satirlik `MatchRadarChart.tsx`, Recharts, Heatmap gibi agir component'ler ilk yuklemede bundle'a dahil; JS bundle siser, TTI artar | `MatchRadarChart`, `IncidentHeatmap`, `CommentatorStatsChart`, `ChatInterface` gibi agir/nadir component'leri `next/dynamic(() => import(...), { ssr: false })` ile lazy load et | **M** |
| 5 | **N+1 benzeri sorgu ve gereksiz full-table scan (`/api/incidents` slug fallback)** | **Med** — `incidents/route.ts` 47-59. satirlarda slug bulunamazsa **tum maclari** (`findMany` filtersiz) cekip JS'te filtreliyor; veri buyudukce ciddi yavaslama | Slug fallback'i kaldır veya DB'de slug uzerinden dogrudan arama yap; `match.slug` alanini zorunlu hale getir; genel sorgularda `select` ile sadece gerekli alanlari cek | **M** |

---

## Iyilestirme Onerileri

| # | Oneri | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|
| 1 | **Anasayfa ve listeleme sayfalarinda ISR** | **High** — Statik HTML + periyodik revalidation; TTFB/FCP dramatik duser, CDN cache aktif olur | `app/page.tsx`, `app/hakemler/page.tsx`, `app/pozisyonlar/page.tsx` gibi sayfalari Server Component yap; `export const revalidate = 120;` veya `fetch(..., { next: { revalidate: 120 } })` kullan | **L** |
| 2 | **`next.config.ts` image optimization genisletme** | **Med** — Supabase, YouTube thumbnail gibi harici kaynaklardan da optimize goruntu sunulabilir | `images.remotePatterns`'a Supabase storage ve YouTube (`img.youtube.com`) hostname'lerini ekle; `images.formats: ['image/avif', 'image/webp']` ekle | **S** |
| 3 | **Buyuk component'leri parcala** | **Med** — `MatchRadarChart.tsx` (739 satir), `IncidentDetailTemplate.tsx` (494 satir) bakim ve bundle acisindan sorunlu | Alt component'lere bol; her biri kendi dosyasinda; chart kisimlari lazy load'a uygun hale gelir | **L** |
| 4 | **Dashboard sayfalari icin route-level code splitting** | **Low** — Dashboard yalnizca admin kullanicilara acik, ama 10+ agir sayfa var | Dashboard layout'una `loading.tsx` ekle; agir tablolari ve chart'lari `Suspense` + `dynamic` ile sar | **M** |
| 5 | **Prisma sorgularinda `select` kullanimi yayginlastir** | **Med** — `/api/matches` route'u `include` ile tum incident detaylarini cekerken sadece `id, type, status, confidenceScore, minute, description, slug, varIntervention` aliyor (iyi); ama incidents listesi route'unda `opinions` dahil tum `incident` alanlari celiniyor | Listeleme endpoint'lerinde `select` ile sadece gerekli alanlari cek; ozellikle `sources`, `refereeComments`, `relatedVideos`, `newsArticles` gibi buyuk JSON string alanlarini listeleme sorgularindan cikar | **S** |
| 6 | **Font optimizasyonu** | **Low** — Geist Sans ve Mono iki ayri Google Font; `next/font` dogru kullanilmis (olumlu) ama Mono font sadece code bloklarinda gerekli | Mono fontu lazy veya kosullu yukle; `display: 'swap'` acikca ekle (varsayilan olabilir ama garanti icin) | **S** |

---

## Kesin Olmali / Kesin Degismeli / Nice-to-Have

### Kesin Olmali
- Public sayfalar Server Component'e donusturulmeli; en azindan anasayfa, pozisyonlar, hakemler ve mac detay sayfalari SSR/ISR olmali (SEO ve performans icin hayati)
- API route'larina HTTP cache header'lari eklenmeli (en azindan read-only GET endpoint'leri)
- `<img>` etiketleri `next/image` `Image` component'ine cevrilmeli

### Kesin Degismeli
- Agir chart component'leri (`MatchRadarChart`, `IncidentHeatmap`, `CommentatorStatsChart`) `next/dynamic` ile lazy load edilmeli
- `/api/incidents` slug fallback'indeki full-table scan kaldirilmali
- Prisma sorgularinda buyuk JSON alan'lari listeleme endpoint'lerinden cikarilmali (`select` ile)

### Nice-to-Have
- Dashboard sayfalarina `loading.tsx` ve Suspense boundary eklenmesi
- Mono fontu kosullu yukleme
- `next.config.ts`'e AVIF/WebP format yapılandirmasi
- Lighthouse CI entegrasyonu (CI pipeline'ina performans regression kontrolu)

---

**Ozet:** Projenin en buyuk performans sorunu tum public sayfalarin client-side rendering ile calismasidir. Bu hem SEO'yu hem de Core Web Vitals metriklerini (LCP, FCP, TTFB) dogrudan olumsuz etkiler. Caching stratejisinin tamamen `no-store` olmasi da gereksiz DB yukune ve yavag yanit surelerine yol acar. Bu iki alan duzeltildiginde performans puani 4/10'dan 7-8/10'a cikmasi beklenir.
