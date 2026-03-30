# Content & Editorial Strategy Analiz Raporu (Kısmen)

**Proje:** Var Odasi (varodasi.com) — AI destekli Turk futbol tartisma tespit ve analiz platformu
**Tarih:** 2026-03-30
**Mod:** Hafif (proje taramasi)

---

## Mevcut Durum — Puan: 5/10

### Icerik Turleri

| Tur | Kaynak | Durum |
|-----|--------|-------|
| **Mac analizi** | Supabase DB + statik `matches.json` fallback | Var. 4 buyuk takim odakli, hafta bazli gruplama, skor, hakem bilgisi. |
| **Tartismali pozisyon (Incident)** | AI tespit (keyword + OpenAI) + admin onay (`PENDING` / `APPROVED`) | Var. Kategori, dakika, guven skoru, VAR mudahale, lehine/aleyhine takim. |
| **Uzman gorusu (ExpertOpinion)** | Manuel / admin | Var ama ince: commentator profilleri + stance. Otomatik besleme yok. |
| **Video & Transcript** | `MatchVideo` modeli, YouTube transcript cikartma | Erken asama. DB modeli var, dashboard sayfasi var. |
| **Crawler icerigi** | Eksi Sozluk (Playwright) + Reddit crawler | Var. Crawl sonuclari `CrawledContent` tablosuna yaziliyor. |
| **Hakem istatistikleri** | Referee modeli + istatistik API'lari | Var. Hakem bazli tartismali karar sayisi. |
| **Takim istatistikleri** | `/api/statistics/teams` | Var. Takim bazli tartismali olay sayisi. |
| **AI Chat** | `chatAgent.ts` + Qdrant vector search | Var. Embedding + clustering altyapisi mevcut. |
| **Kullanici yorumlari (UGC)** | Comment modeli + verdict sistemi | Var. |
| **Oneri/Sikayet** | Suggestion modeli + `/oneri` sayfasi | Var. Kullanici geri bildirim kanali. |

### Icerik Uretim Akisi

- **Yari-otomatik:** Crawlerlar (Eksi Sozluk, Reddit) tartisma icerigi topluyor → `incidentDetector` keyword + AI ile tartismali pozisyonlari tespit ediyor → Admin dashboardda onay/red (`PENDING` → `APPROVED`).
- **Manuel:** Mac verileri, hakem atamalari, uzman gorusleri, commentator profilleri, video ekleme admin tarafindan yapiliyor.
- **Statik fallback:** `matches.json` ve `bein_positions.json` dosyalari mevcut; API yokken fallback olarak kullaniliyor.

### UGC Mekanizmalari

1. **Yorum sistemi:** Giris yapan kullanicilar mac veya pozisyon bazinda yorum yapabiliyor. Yanit (reply) destegi var. 1000 karakter siniri.
2. **Verdict oylama:** Pozisyon yorumlarinda "Dogru karar / Yanlis karar / Emin degilim" oylama. Topluluk degerlendirmesi yuzdeli gosteriliyor.
3. **Fan oylama (Vote):** Ayri `Vote` modeli ile "PENALTY, CONTINUE, YELLOW_CARD, RED_CARD" gibi karar tipleri oylanabiliyor.
4. **Oneri formu:** `/oneri` sayfasi uzerinden genel geri bildirim.

### Icerik Moderasyonu

- **Admin onay:** Pozisyonlar `PENDING` → `APPROVED` akisi ile admin tarafindan onaylaniyor.
- **Sikayet sistemi:** `CommentReport` modeli + `ReportModal` UI. Kullanicilar yorumlari "sikayet et" ile raporlayabiliyor.
- **Eksik:** Otomatik moderasyon (spam filtre, kufur filtre, rate limiting) **yok**.

### Editoryal Ton ve Dil

- Tamamen Turkce icerik. UI metinleri dogal Turkce.
- Ton: Tarafsiz-analitik. Takim taraftarligina yonlendirme yok; veriye dayali (guven skoru, AI tespiti).

### Icerik Cesitliligi

- **Guclu:** Mac, pozisyon, hakem, takim, yorumcu, istatistik, video — cok katmanli.
- **Zayif:** Blog/makale formati yok. Editoryal yazi, haftalik ozet, sezon analizi gibi uzun-form icerik tureri yok.

---

## Kritik Eksikler / Iyilestirme Onerileri

| Oncelik | Alan | Bulgu | Oneri |
|---------|------|-------|-------|
| **Kesin Olmali** | Icerik moderasyonu | Otomatik spam/kufur filtresi yok. Yorumlar sadece sikayet ile raporlaniyor. | Keyword-based veya AI-based otomatik yorum filtresi ekle. Turk futbol jargonuna ozel kufur/nefret sozlugu olustur. |
| **Kesin Olmali** | Editoryal icerik | Blog/makale/haftalik ozet gibi uzun-form icerik turu yok. | Haftalik "Haftanin Tartismali Pozisyonlari" otomatik ozet makalesi olustur (AI ile). SEO ve organik trafik icin kritik. |
| **Kesin Olmali** | Icerik tazeligi | Crawler tetikleme mekanizmasi belirsiz (cron job/schedule yok). | Mac gunu otomatik crawl + tespit pipeline'i (cron veya event-driven) kur. |
| **Kesin Degismeli** | Uzman gorusleri | Commentator/ExpertOpinion verileri tamamen manuel girilmis. Olceklenemiyor. | Yorumcu tweetlerini veya yayin parcalarini otomatik cekip eslestiren bir pipeline ekle. |
| **Kesin Degismeli** | SEO / icerik derinligi | Tek statik SEO sayfasi var. Kategori, hakem, takim bazli landing page'ler yetersiz. | Her hakem, takim ve pozisyon kategorisi icin SEO-uyumlu landing sayfalar olustur. |
| **Nice-to-Have** | Bildirim | Kullanicilar yeni pozisyon/yorum hakkinda bildirim alamiyor. | Push notification veya email digest sistemi ekle. |
| **Nice-to-Have** | Icerik formati cesitliligi | Sadece metin + istatistik. Gorsel analiz yok. | Pozisyon goruntusu/GIF embedding, saha ustu pozisyon diyagrami gibi gorsel icerik tipleri ekle. |
| **Nice-to-Have** | Coklu kaynak | Reddit + Eksi Sozluk. Twitter/X, YouTube yorumlari, haber siteleri crawl edilmiyor. | Kaynak havuzunu genislet. |
| **Nice-to-Have** | Icerik arsivi | Gecmis sezon verileri icin arsiv/takvim gorunumu yok. | Sezon/hafta bazli arsiv sayfasi + pozisyon takvimi ekle. |

---

**Ozet:** Platform teknik altyapi olarak zengin (crawler, AI tespit, vektor arama, UGC, oylama). Ancak **editoryal katman zayif** — icerik tamamen yapisal veri ve kullanici yorumlarindan olusuyor, uzun-form editoryal icerik yok. Moderasyon reaktif (sikayet bazli), proaktif filtreleme eksik. En buyuk firsatlar: (1) AI ile otomatik haftalik ozet/makale uretimi, (2) otomatik moderasyon katmani, (3) crawl pipeline'inin zamanlanmasi.
