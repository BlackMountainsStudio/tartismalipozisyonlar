# Data & Scraping Infrastructure Analiz Raporu

**Proje:** Var Odasi — AI destekli Turk futbol tartisma tespit ve analiz platformu
**Tarih:** 2026-03-30
**Mod:** Tam analiz (proje taramasi + web arastirmasi)

---

## Mevcut Durum: 5.5/10

Platform temel veri toplama altyapisini kurmus durumda; ancak otomasyon, saglamlik, veri tutarliligi ve olceklenebilirlik acisindan ciddi iyilestirme alanlari var.

### Neler iyi?

1. **Rate limiting altyapisi mevcut** — `RateLimiter` (sliding window) ve `ConcurrencyLimiter` siniflari yazilmis
2. **Retry mekanizmasi** — `CrawlerOrchestrator` MAX_RETRIES=3, `Promise.allSettled` ile izolasyon
3. **Prisma schema detayli** — 15 model, uygun indexler, iliskiler dogru
4. **Vector DB entegrasyonu** — Qdrant + OpenAI `text-embedding-3-small` (1536 dim)
5. **YouTube transcript cikarma** — Turkce oncelikli, fallback destekli
6. **Coklu veri kaynaklari** — Reddit, Eksi Sozluk, TFF, Transfermarkt, beIN Sports, YouTube

---

## Kritik Eksikler

### KESIN OLMALI

| # | Sorun | Detay | Etki | Efor |
|---|-------|-------|------|------|
| 1 | **Zamanlanmis/otomatik scraping yok** | Tum scraper'lar manuel calistiriliyor. Cron job, queue sistemi yok. | High | M |
| 2 | **Veri dogrulama katmani eksik** | Zod/Yup sema dogrulamasi yok. JSON-as-String alanlari runtime'da parse ediliyor. | High | M |
| 3 | **JSON-as-String anti-pattern** | `sources`, `refereeComments`, `relatedVideos` alanlari `String @default("[]")`. PostgreSQL `Json`/`JsonB` kullanilmiyor. | High | L |
| 4 | **Eksi Sozluk scraper'i kirilgan** | User-agent rotasyonu yok, proxy yok, Captcha onlemi yok, sabit beklemeler var. | High | M |
| 5 | **Incremental scraping / deduplication zayif** | `visitedUrls` in-memory, yeniden baslatildiginda ayni URL'ler tekrar islenir. | High | S |
| 6 | **Admin API guvenligi yetersiz** | Import scriptleri `"dev-admin-secret"` kullaniyor. | High | S |

### KESIN DEGISMELI

| # | Sorun | Detay | Etki | Efor |
|---|-------|-------|------|------|
| 7 | **Error handling / monitoring eksik** | Hata durumlarinda bildirim yok. Dead letter queue yok. | Med | M |
| 8 | **Transfermarkt scraper regex-tabanli HTML parsing** | Son derece kirilgan; Cheerio kullanilmali. | Med | S |
| 9 | **Reddit API credential'lari non-null assertion** | Graceful degradation ve credential validation eksik. | Med | S |
| 10 | **Pagination yok (API route'lar)** | Tum sonuclar donduruluyor; veri buyudukce performans sorunu. | Med | M |
| 11 | **Veri freshness takibi yok** | Son basarili crawl tarihi, staleness mekanizmasi yok. | Med | S |
| 12 | **Vector DB'de payload filtreleme kullanilmiyor** | Hibrit arama (filtered vector search) uygulanmali. | Med | S |

### NICE-TO-HAVE

| # | Sorun | Etki | Efor |
|---|-------|------|------|
| 13 | Resmi API entegrasyonu yok (API-Football, football-data.org) | Med | M |
| 14 | Clustering algoritmasi naif (O(n) Qdrant sorgusu) | Low | L |
| 15 | Multi-file Prisma schema kullanilmiyor | Low | S |
| 16 | Statik JSON dosyalarinin versiyonlamasi yok | Low | S |
| 17 | YouTube transcript cache'lemesi yok | Low | S |
| 18 | Proxy / IP rotasyonu yok | Low | M |
| 19 | Yasal uyumluluk dokumantasyonu yok | Med | S |

---

## Mimari Oneriler

### 1. Scheduled Data Pipeline (Efor: M, Etki: High)
Vercel Cron Jobs veya BullMQ tabanli job queue. Haftalik otomatik crawl + stale data raporu.

### 2. Veri Dogrulama Katmani (Efor: M, Etki: High)
Zod semalari ile giris noktasinda dogrulama. JSON-as-String → Prisma `Json` tipine migrasyon.

### 3. Resmi API Entegrasyonu (Efor: M, Etki: Med)
API-Football veya football-data.org free tier ile primer kaynak. Scraping yalnizca community kaynaklar icin.

### 4. Monitoring ve Alerting (Efor: M, Etki: Med)
Sentry hata takibi, scraper metrikleri, Slack/Discord bildirimleri.

---

## Referanslar

- Step-by-Step Guide to Using a Football Data Scraper — tagxdata.com
- How Web Scraping is Shaping Smarter Sports Analytics in 2026 — tagxdata.com
- Top 6 Free Sports Data API Providers for 2026 — isportsapi.com
- API-Football — api-football.com
- Web Scraping Legal Issues: 2025 Enterprise Compliance Guide — groupbwt.com
- Prisma Best Practices — prisma.io
- Qdrant Filtering Guide — qdrant.tech
