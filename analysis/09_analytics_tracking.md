# Analytics & Tracking Analiz Raporu (Kısmen)

**Proje:** Var Odası — Next.js, Vercel Analytics, React 19
**Tarih:** 2026-03-30
**Mod:** Hafif tarama (max 12 tool call)

---

## Mevcut Durum — Puan: 2/10

### Var olanlar

| Bileşen | Durum | Detay |
|---------|-------|-------|
| **Vercel Analytics** | Var | `@vercel/analytics` v1.6.1, `layout.tsx`'de `<Analytics />` komponenti aktif |
| **Vercel Speed Insights** | Var | `@vercel/speed-insights` v1.3.1, `layout.tsx`'de `<SpeedInsights />` komponenti aktif |
| **Google Analytics / GTM** | Yok | Hiçbir GA, GTM, gtag konfigürasyonu bulunamadı |
| **Custom Event Tracking** | Yok | Hiçbir `track()`, `logEvent()`, custom analytics event'i yok |
| **Conversion Tracking** | Yok | Herhangi bir conversion/funnel tanımı yok |
| **User Behavior Tracking** | Yok | Heatmap (Hotjar/Clarity), session replay, scroll tracking yok |
| **Error Tracking / Monitoring** | Yok | Sentry, Bugsnag, Datadog vb. entegrasyonu yok; `error.tsx` error boundary dosyası da yok |
| **A/B Test Altyapısı** | Yok | Feature flag, experiment, A/B test framework'u yok |
| **KPI Tanımları** | Yok | Kod tabanında tanımlanmış metrik/KPI yok |
| **Admin Dashboard Analytics** | Yok | `/dashboard` sadece incident CRUD; analytics dashboard yok |

### Mevcut Yapının Özeti

Proje sadece **Vercel'in otomatik sayfa görüntüleme (pageview) ve web vital metriklerini** topluyor. Bunun ötesinde hiçbir analytics altyapısı kurulmamış.

---

## Kritik Eksikler ve Iyilestirme Onerileri

| Oncelik | Eksik | Oneri | Etki |
|---------|-------|-------|------|
| **KESIN OLMALI** | Error boundary ve error tracking yok | `src/app/error.tsx` ve `src/app/global-error.tsx` olustur; Sentry Free (50K event/ay) entegre et (`@sentry/nextjs`) | Prod'da hata gorulmezligi ortadan kalkar |
| **KESIN OLMALI** | Custom event tracking yok | Vercel Analytics'in `track()` fonksiyonunu kullanarak temel kullanici aksiyonlarini izle: oy verme, yorum yazma, pozisyon goruntulenme, oneri gonderme | Kullanici davranisini anlamak icin zorunlu |
| **KESIN OLMALI** | Error boundary yok | Her route grubu icin `error.tsx` dosyalari olustur (en azindan root seviyede) | UX ve hata tespiti |
| **KESIN DEGISMELI** | Google Analytics / GTM yok | GA4 ekle — Vercel Analytics iyi ama sinirli; GA4 ile detayli segment, acquisition, retention analizi mumkun | Ucretsiz, derin kullanici analizi |
| **KESIN DEGISMELI** | Conversion funnel tanimsiz | Temel funnel tanimla: Ziyaret → Pozisyon goruntulenme → Oy verme → Yorum yazma → Kayit olma | Urun buyumesi icin kritik |
| **IYILESTIRME** | Session replay / heatmap yok | Microsoft Clarity (ucretsiz) veya Hotjar Free entegre et | Kullanicinin sayfada ne yaptigini gorsellestirme |
| **IYILESTIRME** | A/B test altyapisi yok | Vercel Edge Config + Feature Flags veya PostHog (ucretsiz tier) kullanilabilir | Ozellik denemesi, CTA optimizasyonu |
| **IYILESTIRME** | Admin dashboard'da analytics yok | Dashboard'a basit metrikler ekle: gunluk ziyaretci, en cok gorulen pozisyonlar, oy/yorum sayilari | Operasyonel goruntu |

### Hizli Kazanimlar (Low-effort, High-impact)

1. **`track()` ile Vercel custom events** — Zaten kutuphane yuklu, sadece `track('vote_cast', { incidentId })` seklinde cagrilar eklenmeli. Sifir yeni bagimlilik.
2. **`error.tsx` + `global-error.tsx`** — 2 dosya ile tum unhandled hatalari yakalama. 10 dakikalik is.
3. **Microsoft Clarity** — Tek bir `<script>` tag'i ile ucretsiz heatmap ve session replay.

### Sonuc

Proje su an yalnizca Vercel'in otomatik pageview ve web vitals metriklerini topluyor. Custom event tracking, error monitoring, conversion funnel ve kullanici davranis analizi tamamen eksik. Mevcut `@vercel/analytics` paketi `track()` fonksiyonu sunuyor — ek bagimlilik gerekmeden hizli ilerleme mumkun.
