# Sprint Plani — Var Odasi (varodasi.com)

**Tarih:** 2026-03-30
**Kaynak:** 12 Kategori Analiz Raporu (MASTER_ANALYSIS.md)
**Toplam Task:** 120
**Sprint Sayisi:** 5 (2'ser haftalik)
**Proje:** VO (Jira)

---

## Ozet

| Sprint | Odak | Task | Hafta |
|--------|------|------|-------|
| Sprint 1 | Security & Quick Wins | 24 | Hafta 1-2 |
| Sprint 2 | SSR Migration & Performance | 24 | Hafta 3-4 |
| Sprint 3 | SEO & Analytics | 24 | Hafta 5-6 |
| Sprint 4 | Growth & Engagement | 24 | Hafta 7-8 |
| Sprint 5 | Monetization, Data & Scale | 24 | Hafta 9-10 |

---

## Sprint 1: Security & Quick Wins (Hafta 1-2)

**Hedef:** Guvenlik aciklari kapat, temel altyapi kur, hizli kazanimlar topla

| # | Task | Kategori | Oncelik | Efor | Label |
|---|------|----------|---------|------|-------|
| 1 | .env dosyasindaki gercek secret'lari temizle, sadece placeholder birak | Security | P0 | S | security |
| 2 | Git history'de commit edilmis secret varsa tum credential'lari rotate et | Security | P0 | S | security |
| 3 | /api/dev/crawler endpoint'ini admin middleware korumasina al | Security | P0 | S | security |
| 4 | /api/match-videos yazma islemlerini (POST/PUT/DELETE) middleware korumasina al | Security | P0 | S | security |
| 5 | Admin token'i hash'leyerek cookie'de sakla (plaintext token yerine) | Security | P1 | M | security |
| 6 | Admin auth endpoint'ine rate limiting ekle (upstash/ratelimit) | Security | P1 | M | security |
| 7 | Admin session revoke mekanizmasi ekle (DB-backed veya kisa sureli JWT) | Security | P2 | M | security |
| 8 | CORS politikasi tanimla (next.config.ts veya middleware) | Security | P2 | S | security |
| 9 | robots.txt olustur (src/app/robots.ts) — /dashboard, /admin-login, /api/ disla | SEO | P0 | S | seo |
| 10 | sitemap.xml olustur (src/app/sitemap.ts) — tum dinamik URL'ler + lastmod | SEO | P0 | M | seo |
| 11 | error.tsx olustur (root seviye error boundary) | Architecture | P0 | S | arch |
| 12 | global-error.tsx olustur (root seviye global error boundary) | Architecture | P0 | S | arch |
| 13 | loading.tsx olustur (root + kritik route'lar icin skeleton) | Architecture | P1 | S | arch, ui |
| 14 | CI pipeline kur: next build + eslint + tsc --noEmit (GitHub Actions) | Architecture | P0 | M | arch, ci |
| 15 | <img> etiketlerini next/image Image component'ine cevir | Performance | P0 | S | perf |
| 16 | next.config.ts image optimization: remotePatterns + formats (AVIF/WebP) | Performance | P1 | S | perf |
| 17 | Vercel Analytics track() ile custom event'ler ekle (oy, yorum, goruntulenme) | Analytics | P0 | S | analytics |
| 18 | Microsoft Clarity entegre et (ucretsiz heatmap + session replay) | Analytics | P1 | S | analytics |
| 19 | Sosyal paylasim butonlari ekle (WhatsApp, X, Telegram) — tum pozisyon sayfalari | Growth | P0 | S | growth |
| 20 | Skip navigation link ekle (layout.tsx — "Icerige atla") | Accessibility | P0 | S | a11y |
| 21 | Focus-visible gostergeleri tum interaktif elemanlara ekle (outline-none kaldir) | Accessibility | P0 | S | a11y |
| 22 | Arama input'una sr-only label ekle | Accessibility | P1 | S | a11y |
| 23 | Mobile menu butonuna aria-expanded attribute ekle | Accessibility | P1 | S | a11y |
| 24 | Zustand dependency'yi kaldir (kullanilmiyor) + playwright'i devDependencies'e tasi | Architecture | P2 | S | arch, cleanup |

---

## Sprint 2: SSR Migration & Performance (Hafta 3-4)

**Hedef:** Public sayfalari SSR/ISR'a donustur, caching stratejisi kur, code-splitting uygula

| # | Task | Kategori | Oncelik | Efor | Label |
|---|------|----------|---------|------|-------|
| 25 | Ana sayfa (app/page.tsx) SSR donusumu — "use client" kaldir, sunucu tarafinda veri cek | Performance/SEO | P0 | L | perf, seo, ssr |
| 26 | /pozisyonlar listesi sayfasi SSR donusumu | Performance/SEO | P0 | M | perf, seo, ssr |
| 27 | /hakemler listesi sayfasi SSR donusumu | Performance/SEO | P0 | M | perf, seo, ssr |
| 28 | /yorumcular listesi sayfasi SSR donusumu | Performance/SEO | P1 | M | perf, seo, ssr |
| 29 | Mac detay sayfasi SSR donusumu | Performance/SEO | P0 | L | perf, seo, ssr |
| 30 | Pozisyon detay sayfasi SSR donusumu | Performance/SEO | P0 | L | perf, seo, ssr |
| 31 | Hakem detay sayfasi SSR donusumu | Performance/SEO | P1 | M | perf, seo, ssr |
| 32 | /superlig-tartismali-pozisyonlar sayfasi SSR donusumu | Performance/SEO | P1 | M | perf, seo, ssr |
| 33 | API GET route'larina Cache-Control header'lari ekle (s-maxage + stale-while-revalidate) | Performance | P0 | M | perf, cache |
| 34 | ISR revalidate stratejisi belirle ve uygula (60-300sn arasi) | Performance | P0 | M | perf, cache |
| 35 | MatchRadarChart (739 satir) component'ini next/dynamic ile lazy load et | Performance | P1 | S | perf |
| 36 | IncidentHeatmap component'ini next/dynamic ile lazy load et | Performance | P1 | S | perf |
| 37 | CommentatorStatsChart component'ini next/dynamic ile lazy load et | Performance | P1 | S | perf |
| 38 | ChatInterface component'ini next/dynamic ile lazy load et | Performance | P1 | S | perf |
| 39 | MatchRadarChart (739 satir) alt component'lere bol | Architecture | P2 | L | arch, refactor |
| 40 | IncidentDetailTemplate (494 satir) alt component'lere bol | Architecture | P2 | M | arch, refactor |
| 41 | Prisma sorgularinda select kullan — listeleme endpoint'lerinde buyuk JSON alanlarini cikar | Performance | P1 | S | perf, data |
| 42 | /api/incidents slug fallback full-table scan duzelt (DB'de dogrudan arama) | Performance | P1 | M | perf, data |
| 43 | Zod schema'lari olustur — tum API POST/PUT route'lari icin input validation | Architecture | P0 | M | arch, security |
| 44 | API route'larinda tekrar eden boilerplate icin wrapper/middleware olustur | Architecture | P2 | M | arch, refactor |
| 45 | Dashboard sayfalarina loading.tsx + Suspense boundary ekle | UI/UX | P2 | S | ui |
| 46 | Mono fontu kosullu yukle (sadece code bloklarinda) | Performance | P3 | S | perf |
| 47 | Duplicate route yapilari duzelt ([matchSlug] vs matches/[id]) | Architecture | P2 | M | arch |
| 48 | Middleware auth pattern sorununu duzelt | Security | P1 | M | security, arch |

---

## Sprint 3: SEO & Analytics Deep Dive (Hafta 5-6)

**Hedef:** Sayfa bazli metadata, structured data, analytics derinlestirme, error tracking

| # | Task | Kategori | Oncelik | Efor | Label |
|---|------|----------|---------|------|-------|
| 49 | Ana sayfa icin generateMetadata yazilmali | SEO | P0 | S | seo |
| 50 | Pozisyon detay sayfasi icin generateMetadata (dinamik title/description) | SEO | P0 | M | seo |
| 51 | Mac detay sayfasi icin generateMetadata | SEO | P0 | M | seo |
| 52 | Hakem detay sayfasi icin generateMetadata | SEO | P1 | M | seo |
| 53 | Yorumcu detay sayfasi icin generateMetadata | SEO | P1 | S | seo |
| 54 | /hakemler listesi generateMetadata | SEO | P1 | S | seo |
| 55 | /pozisyonlar listesi generateMetadata | SEO | P1 | S | seo |
| 56 | /yorumcular listesi generateMetadata | SEO | P2 | S | seo |
| 57 | Tum sayfalarda canonical URL tanimla (alternates.canonical) | SEO | P0 | M | seo |
| 58 | Dinamik OG image olustur — pozisyon bazli (opengraph-image.tsx) | SEO/Growth | P1 | M | seo, growth |
| 59 | Dinamik OG image — mac bazli | SEO/Growth | P2 | M | seo, growth |
| 60 | JSON-LD SportsEvent structured data (mac sayfalari) | SEO | P1 | M | seo |
| 61 | JSON-LD Person structured data (hakem sayfalari) | SEO | P1 | S | seo |
| 62 | JSON-LD WebSite + Organization structured data (root layout) | SEO | P1 | S | seo |
| 63 | generateStaticParams ile kritik sayfalari build zamaninda on-render et | SEO/Performance | P2 | M | seo, perf |
| 64 | URL yapisi standardizasyonu: /commentators → /yorumcular (Turkce URL) | SEO | P2 | S | seo |
| 65 | 301 redirect'ler ekle (next.config.ts — eski URL'ler icin) | SEO | P2 | S | seo |
| 66 | Image alt text'leri duzelt — anlamli aciklamalar ekle | SEO/A11Y | P1 | S | seo, a11y |
| 67 | Footer'a internal linking ekle (hakemler, yorumcular, pozisyonlar) | SEO | P2 | S | seo |
| 68 | Semantic HTML iyilestirme — <article> etiketleri mac karti ve pozisyon detayina | SEO/A11Y | P2 | S | seo, a11y |
| 69 | GA4 entegrasyonu (Vercel Analytics yeterli degil, detayli segment analizi icin) | Analytics | P0 | M | analytics |
| 70 | Sentry error tracking entegrasyonu (@sentry/nextjs free tier) | Analytics | P0 | M | analytics |
| 71 | Conversion funnel tanimla ve izle (ziyaret → goruntulenme → oy → yorum → kayit) | Analytics | P1 | M | analytics |
| 72 | Admin dashboard'a analytics ekrani ekle (gunluk ziyaretci, oy/yorum sayilari) | Analytics | P2 | M | analytics |

---

## Sprint 4: Growth & Engagement (Hafta 7-8)

**Hedef:** Gamification, bildirim, icerik otomasyonu, UI iyilestirme

| # | Task | Kategori | Oncelik | Efor | Label |
|---|------|----------|---------|------|-------|
| 73 | "Benim Kararim" paylasibilir kart component'i olustur | Growth | P0 | S | growth, viral |
| 74 | Basit onboarding akisi (3 adim: takim sec, bildirim izni, ilk oy) | Growth | P0 | M | growth |
| 75 | Puan sistemi kur (oy verme, yorum yazma, tahmin = puan) | Growth | P1 | M | growth, gamification |
| 76 | Rozet sistemi (ilk oy, 100 oy, ilk dogru tahmin, streak rozeti) | Growth | P1 | M | growth, gamification |
| 77 | Leaderboard sayfasi (haftalik/aylik/sezonluk) | Growth | P1 | M | growth, gamification |
| 78 | In-app bildirim sistemi (yeni pozisyon, yorumuna yanit) | Growth | P0 | M | growth, notification |
| 79 | Email bildirim sistemi (haftalik ozet, yorumuna yanit) | Growth | P1 | M | growth, notification |
| 80 | Tahmin oyunu (mac oncesi karar tahmini, sonrasi karsilastirma) | Growth | P1 | M | growth, gamification |
| 81 | Takim profili / favori takim secimi (profil sayfasinda) | Growth | P2 | S | growth |
| 82 | Streak mekanizmasi (ardisik gun oylama/yorum) | Growth | P2 | S | growth, gamification |
| 83 | Otomatik spam/kufur filtresi (keyword-based + Turk futbol jargonu) | Content | P0 | M | content, moderation |
| 84 | Haftalik "Haftanin Tartismali Pozisyonlari" AI ozet makalesi otomatik uretimi | Content | P1 | M | content, ai |
| 85 | Yorumcu tweet/yayin parcasi otomatik cekme ve eslestirme pipeline'i | Content | P2 | L | content, data |
| 86 | Sezon/hafta bazli arsiv sayfasi + pozisyon takvimi | Content | P2 | M | content |
| 87 | Design token sistemi — hardcode renkler yerine semantic token'lar (@theme) | UI/UX | P1 | M | ui |
| 88 | Skeleton loading component'leri olustur (MatchCard, IncidentCard, RefereeCard) | UI/UX | P0 | M | ui |
| 89 | Toast/snackbar feedback ekle (sonner veya react-hot-toast) | UI/UX | P1 | S | ui |
| 90 | Breadcrumb navigasyon component'i + schema.org BreadcrumbList | UI/UX/SEO | P1 | S | ui, seo |
| 91 | Tooltip component'i ekle (radix-ui tooltip + metrik aciklamalari) | UI/UX | P2 | S | ui |
| 92 | Mobil menu gecis animasyonu (framer-motion slide-down) | UI/UX | P2 | S | ui |
| 93 | Zamanlanmis scraping pipeline kur (Vercel Cron Jobs) | Data | P0 | M | data, automation |
| 94 | Veri freshness takibi — son basarili crawl tarihi + staleness mekanizmasi | Data | P1 | S | data |
| 95 | Scraper hata bildirimi — basarisiz crawl'da Slack/Discord notification | Data | P2 | M | data, monitoring |
| 96 | Yanit textarea'sina sr-only label ekle | Accessibility | P1 | S | a11y |

---

## Sprint 5: Monetization, Data Pipeline & Scale (Hafta 9-10+)

**Hedef:** Gelir altyapisi, veri kalitesi, test, erisilebilirlik tamamlama, uzun vadeli ozellikler

| # | Task | Kategori | Oncelik | Efor | Label |
|---|------|----------|---------|------|-------|
| 97 | User modeline role (FREE/PREMIUM/ADMIN) + premiumUntil alani ekle (Prisma) | Monetization | P0 | S | monetization |
| 98 | Stripe veya Iyzico odeme entegrasyonu | Monetization | P0 | L | monetization |
| 99 | Premium gating middleware olustur (role kontrolu) | Monetization | P0 | M | monetization |
| 100 | AI Chat'i premium kullanicilara ac (paywall) | Monetization | P1 | S | monetization |
| 101 | AI tahmin endpoint'ini premium korumaya al | Monetization | P1 | S | monetization |
| 102 | Google AdSense entegrasyonu (free tier kullanicilar icin) | Monetization | P1 | S | monetization |
| 103 | Istatistik sayfalari derinlik kisitlamasi (free: son 3 hafta, premium: tam) | Monetization | P2 | M | monetization |
| 104 | Admin auth RBAC'a gecis (role-based access control) | Monetization/Security | P1 | M | monetization, security |
| 105 | JSON-as-String → Prisma Json tipine migrasyon (sources, refereeComments, relatedVideos) | Data | P1 | L | data, arch |
| 106 | Veri dogrulama katmani — scraper ciktilari icin Zod semalari | Data | P1 | M | data |
| 107 | Incremental scraping / deduplication (visitedUrls persistent hale getir) | Data | P1 | S | data |
| 108 | Eksi Sozluk scraper guclendirme (user-agent rotasyonu, proxy destegi) | Data | P2 | M | data |
| 109 | Transfermarkt scraper'da regex → Cheerio HTML parsing | Data | P2 | S | data |
| 110 | Reddit API credential validation + graceful degradation | Data | P2 | S | data |
| 111 | API pagination ekle (tum listeleme endpoint'leri) | Data/Architecture | P1 | M | data, arch |
| 112 | Vector DB'de payload filtreleme (hibrit arama) uygula | Data | P2 | S | data |
| 113 | Resmi futbol API entegrasyonu (API-Football free tier) | Data | P2 | M | data |
| 114 | Test altyapisi kur (Vitest + React Testing Library) | Architecture | P0 | M | arch, test |
| 115 | Ilk birim testleri yaz (API route'lar — en az 5 route) | Architecture | P1 | L | arch, test |
| 116 | Ilk component testleri yaz (kritik UI component'ler) | Architecture | P2 | L | arch, test |
| 117 | Ikon-only butonlara aria-label ekle (sikayet, paylasim, vs) | Accessibility | P1 | S | a11y |
| 118 | AuthModal focus trap uygula (focus-trap-react veya headlessui) | Accessibility | P1 | S | a11y |
| 119 | Renk kontrasti iyilestirme (text-zinc-600 → text-zinc-400) | Accessibility | P1 | S | a11y |
| 120 | Oy butonlarinda aria-pressed + verdict butonlari radio group semantigi | Accessibility | P2 | S | a11y |

---

## Backlog (Sprint Sonrasi)

Bu task'lar 5 sprint sonrasinda degerlendirilecek uzun vadeli ozellikler:

| # | Task | Kategori | Efor |
|---|------|----------|------|
| B1 | PWA + mobil push bildirim | Growth | L |
| B2 | Canli mac modu (WebSocket/SSE) | Growth | L |
| B3 | Referral sistemi | Growth | M |
| B4 | Light mode + tema gecisi (next-themes) | UI/UX | L |
| B5 | Micro-interaction ve animasyonlar (framer-motion page transition) | UI/UX | L |
| B6 | Cmd+K global arama | UI/UX | L |
| B7 | API as a Product — B2B dokumantasyon + API key yonetimi | Monetization | L |
| B8 | Coklu lig destegi (Premier League, La Liga, vs) | Competitive | L |
| B9 | Sezon sonu "Adalet Raporu" (AI destekli sezon ozeti) | Content | M |
| B10 | A/B test altyapisi (PostHog / Vercel Feature Flags) | Analytics | M |
| B11 | Karsilastirma modu (hakem vs hakem) | UI/UX | M |
| B12 | Proxy / IP rotasyonu (scraper icin) | Data | M |
| B13 | Yasal uyumluluk dokumantasyonu (scraping) | Data | S |
| B14 | Dekoratif ikonlara aria-hidden ekle | Accessibility | S |
| B15 | Loading spinner role="status" + aria-label | Accessibility | S |
| B16 | text-[10px] minimum 12px'e cikar | Accessibility | S |
| B17 | Env validation (zod ile environment variable kontrolu) | Architecture | S |
| B18 | Multi-file Prisma schema | Architecture | S |
| B19 | Barrel export ve import organizasyonu | Architecture | S |
| B20 | ESLint konfigurasyonu genislet | Architecture | S |

---

## Label Haritasi

| Label | Aciklama | Renk |
|-------|----------|------|
| security | Guvenlik ile ilgili | Kirmizi |
| seo | SEO ve kesfedilebilirlik | Yesil |
| perf | Performans iyilestirme | Turuncu |
| arch | Mimari / kod kalitesi | Mavi |
| ui | UI/UX tasarim | Mor |
| growth | Buyume ve engagement | Pembe |
| analytics | Analytics ve tracking | Sari |
| data | Veri toplama ve pipeline | Cyan |
| content | Icerik stratejisi | Gri |
| monetization | Gelir modeli | Altin |
| a11y | Erisilebilirlik | Lacivert |
| gamification | Oyunlastirma | Magenta |
| ssr | Server-side rendering donusumu | Koyu yesil |
| cache | Cache stratejisi | Acik mavi |
| ci | CI/CD pipeline | Koyu gri |
| test | Test altyapisi | Acik yesil |
| cleanup | Temizlik / gereksiz dependency | Kahverengi |
| refactor | Refactoring | Koyu mavi |
| notification | Bildirim sistemi | Kirmizi-turuncu |
| viral | Viral buyume | Pembe-kirmizi |
| moderation | Icerik moderasyonu | Koyu kirmizi |
| automation | Otomasyon | Koyu turuncu |
| monitoring | Izleme ve alerting | Sari-turuncu |

---

## Oncelik Aciklamasi

| Oncelik | Anlam |
|---------|-------|
| P0 | Kritik — sprint icinde kesinlikle tamamlanmali |
| P1 | Onemli — sprint icinde tamamlanmasi beklenir |
| P2 | Normal — sprint icinde tamamlanirsa iyi, gecebilir |
| P3 | Dusuk — zaman kalirsa |

---

## Sprint Metrikleri Hedefi

| Sprint | Hedef Puan Artisi |
|--------|-------------------|
| Sprint 1 | Security: 4→6, Analytics: 2→4 |
| Sprint 2 | Performance: 4→7, SEO: 2.5→5, Architecture: 4.5→6 |
| Sprint 3 | SEO: 5→8, Analytics: 4→7 |
| Sprint 4 | Growth: 3.5→7, UI/UX: 5.5→7, Content: 5→7 |
| Sprint 5 | Monetization: 1→6, Data: 5.5→8, A11y: 5→7 |
| **Final** | **Genel: 4.1 → 7.0+** |

---

*Bu plan 2026-03-30 tarihinde 12 kategori analiz raporundan olusturulmustur.*
