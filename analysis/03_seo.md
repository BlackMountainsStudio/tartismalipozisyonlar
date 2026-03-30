# SEO & Discoverability Analiz Raporu

**Proje:** Var Odası (varodasi.com) — AI destekli Türk futbol tartışma tespit ve analiz platformu
**Tarih:** 2026-03-30
**Mod:** Tam analiz (proje taraması + web araştırması)

---

## Mevcut Durum
**Puan: 2.5/10**

Projenin SEO altyapisi buyuk olcude eksik. Temel metadata (title, description, OG, Twitter Card) yalnizca root `layout.tsx` dosyasinda global olarak tanimli — bu iyi bir baslangic. Ancak geri kalan her sey kritik duzeyde yetersiz.

**Mevcut olumlu noktalar:**
- Root layout'ta `metadata` export'u var: title, description, OG (locale, images), Twitter Card
- `metadataBase` dogru ayarli (`https://varodasi.com`)
- `<html lang="tr">` dogru
- Vercel Speed Insights ve Analytics entegre
- OG image tanimli (1200x630)

---

## Kritik Eksikler (Hemen Yapilmali)

| # | Sorun | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|
| 1 | **Tum sayfalar `"use client"` + `useEffect` ile veri cekiyor** | **High** — Google botu bos HTML goruyor; icerik indekslenemiyor | Server Component'e gecilmeli, veri sunucu tarafinda cekilmeli. `"use client"` yalnizca interaktif alt bilesenler icin kullanilmali. | **XL** |
| 2 | **`sitemap.xml` yok** | **High** — Dinamik icerik kesfedilemez | `src/app/sitemap.ts` ile tum mac, hakem, yorumcu, pozisyon URL'leri dinamik uretilmeli. `lastmod` eklenmeli. | **M** |
| 3 | **`robots.txt` yok** | **High** — Arama motorlari taranabilirlik kurallarini bilemiyor | `src/app/robots.ts` olusturulmali. `/dashboard`, `/admin-login`, `/api/` dislanmali. | **S** |
| 4 | **Sayfa bazli metadata yok (`generateMetadata`)** | **High** — Tum sayfalar ayni baslik/aciklama kullanıyor | Her route icin ozgun title ve description uretilmeli — ozellikle dinamik route'lar icin `generateMetadata` yazilmali. | **L** |
| 5 | **Canonical URL tanimli degil** | **High** — Duplicate content sorunu | Her sayfada `alternates.canonical` tanimlanmali. | **M** |
| 6 | **Structured Data (JSON-LD) tamamen eksik** | **High** — Rich snippet imkansiz | `SportsEvent`, `Person`, `WebSite` + `Organization` JSON-LD eklenmeli. | **L** |
| 7 | **`document.title` istemci tarafinda degistiriliyor** | **Med** — Botlar goremiyor | Server-side `generateMetadata` ile yapilmali. | **M** |

---

## Iyilestirme Onerileri (Planli Yapilmali)

| # | Oneri | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|
| 8 | **`generateStaticParams` ile on-render** | **High** | Mac ve hakem sayfalari build zamaninda statik HTML uretilmeli. | **M** |
| 9 | **Image alt text'leri eksik/bos** | **Med** | Anlamsiz bos alt yerine anlamli text eklenmeli. | **S** |
| 10 | **Footer'da internal linking yetersiz** | **Med** | Hakemler, Yorumcular, Pozisyonlar gibi ana sayfa linkleri eklenmeli. | **S** |
| 11 | **Semantic HTML eksiklikleri** | **Med** | `<article>` (mac karti, pozisyon detayi) eklenmeli. | **S** |
| 12 | **URL yapisi tutarsiz: `/hakemler` vs `/commentators`** | **Med** | Tek dilde standardize edilmeli; eski URL'ler redirect ile yonlendirilmeli. | **S** |
| 13 | **`/superlig-tartismali-pozisyonlar-2025` SSR'a cevrilmeli** | **Med** | SSR'a cevirilmeli, metadata eklenmeli, her sezon icin dinamik uretilmeli. | **M** |
| 14 | **Open Graph image dinamik olmali** | **Med** | Mac ve pozisyon sayfalari icin `opengraph-image.tsx` ile dinamik OG image uretilmeli. | **L** |
| 15 | **`next.config.ts` icinde redirects yok** | **Low** | `/commentators` → `/yorumcular` gibi 301 redirect'ler eklenmeli. | **S** |

---

## Kesin Olmali
- **robots.txt** ve **sitemap.xml**
- Her sayfada ozgun metadata (`generateMetadata`)
- Canonical URL
- Public sayfalar Server Component'e donusturulmeli

## Kesin Degismeli
- `"use client"` + useEffect fetch → SSR (EN KRITIK)
- `document.title` → `generateMetadata`
- URL yapisi standardizasyonu

## Nice-to-Have
- Dinamik OG image
- JSON-LD structured data
- Breadcrumb navigasyonu
- Blog/icerik pazarlama bolumu
- Hreflang (coklu dil planlanirsa)

---

## Oncelik Sirasi

1. robots.txt + sitemap.xml olustur (S+M efor, aninda etki)
2. Ana sayfayi ve kritik sayfalari SSR'a cevir (XL efor, en yuksek etki)
3. generateMetadata ekle tum route'lara (L efor)
4. Canonical URL tanimla (M efor)
5. JSON-LD structured data ekle (L efor)
6. URL standardizasyonu + redirects (S efor)
7. Dinamik OG image, internal linking, semantic HTML (M efor)

---

## Referanslar

- Next.js Metadata and OG Images Documentation
- How to Configure SEO in Next.js 16 (the Right Way) — jsdevspace.substack.com
- SportsEvent Schema.org Type
- 'use client' SEO Impact Discussion — Next.js GitHub
- Core Web Vitals SEO Impact 2026 — White Label Coders
- Complete Next.js SEO Guide — eastondev.com
- Top Sports Websites in Turkey — Similarweb
