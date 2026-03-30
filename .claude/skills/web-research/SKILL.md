---
name: web-research
description: Opus Max — Web araştırması. Rakip analizi, kullanıcı yorumları, pazar trendleri, UX best practice
---

## Ne yapar

Opus Max ile **web araştırması** yapar. Vocab learning app ekosistemini, rakipleri, kullanıcı ihtiyaçlarını, yorumları ve trendleri araştırıp detaylı rapor döner. Sonuçları Jira task önerilerine dönüştürür.

**Kapsam:**

1. **Rakip analiz** — Duolingo, Anki, Quizlet, Memrise, Drops, WordUp vb.
2. **Kullanıcı yorumları** — App Store / Play Store reviews, Reddit, forum
3. **Pazar trendleri** — vocab/language learning market, kullanıcı beklentileri
4. **UX best practice** — onboarding, gamification, retention pattern'ları
5. **Jira task önerileri** — bulgulardan actionable task'lar

**Odak verilirse** o perspektiften bakar. **Verilmezse** genel araştırma.

## Argüman

| Input | Davranış |
|-------|----------|
| `/web-research` | Genel pazar araştırması |
| `/web-research feedback UX` | Feedback ve UX odaklı |
| `/web-research monetization` | Monetizasyon stratejileri odaklı |
| Herhangi bir konu | O konu odaklı araştırma |

## Çalıştırma

**Model:** Opus Max — arka plan agent.

**Tek tur:** Döngü değil, tek seferlik derinlemesine araştırma.

Ana oturum şu agent'ı başlatır:

```python
Agent(
  prompt=<aşağıdaki şablon>,
  model="opus",
  run_in_background=True,
  description="web-research"
)
```

### Agent prompt şablonu

```
Sen bir pazar araştırma uzmanısın. Futbol AI / VAR analiz platformu ekosistemini araştır.

Proje: Var Odası (varodasi.com) — Next.js tabanlı AI destekli Türk futbol tartışma tespit ve analiz platformu
Mevcut özellikler: Maç takibi, VAR pozisyon analizi, hakem istatistikleri, fan oylama, AI tahmin, benzer pozisyon arama, heatmap, rating sistemi, maç video/transcript

ODAK: [varsa kullanıcının verdiği odak, yoksa "Genel pazar araştırması"]

## ADIMLAR

### 1. RAKIP ANALİZİ (WebSearch + WebFetch)
Şu platformları araştır:
- FotMob — maç istatistikleri, canlı skor, detaylı analiz
- SofaScore — istatistik, rating, heatmap
- WhoScored — rating, detaylı maç analizi
- Transfermarkt — transfer, piyasa değeri, istatistik
- beIN Sports — Türk futbol yayıncılığı, VAR pozisyonları
- Türk futbol forumları/platformları

Her biri için:
- Öne çıkan özellikler
- Kullanıcı tabanı
- Monetizasyon modeli
- Var Odası'nda olmayan farklılaştırıcı özellikler

### 2. KULLANICI YORUMLARI (WebSearch)
Arama terimleri:
- "football analysis platform 2025/2026"
- "VAR analysis tool"
- "futbol istatistik uygulaması"
- "referee analysis platform"
- "Turkish football controversy"
- "VAR decision tracker"

Topla:
- En sık şikayet edilen sorunlar
- En çok istenen özellikler
- Kullanıcıları mutlu eden şeyler
- Retention/churn sebepleri

### 3. PAZAR TRENDLERİ (WebSearch)
- Sports analytics market size & growth
- AI in sports analysis
- Fan engagement platforms
- Sports data visualization trends
- VAR/referee technology trends

### 4. UX BEST PRACTICE (WebSearch)
- Sports dashboard design patterns
- Data visualization for sports
- Fan engagement UX
- Real-time data presentation
- Mobile-first sports platforms

### 5. VAR ODASI İÇİN FIRSATLAR
Araştırma bulgularını Var Odası'na uygula:
- Rakiplerden öğrenilecekler
- Kullanıcı ihtiyaçlarından çıkan feature gap'ler
- Quick wins (düşük efor, yüksek etki)
- Stratejik yatırımlar (yüksek efor, yüksek etki)

### 6. RAPOR YAZ

## Rakip Analizi Özeti
| Platform | Kullanıcı Tabanı | Monetizasyon | Var Odası'nda Olmayan |
(tablo)

## Kullanıcı İçgörüleri
- En sık şikayetler (top 5)
- En çok istenen özellikler (top 5)
- Retention faktörleri

## Pazar Trendleri
- Öne çıkan trendler
- Var Odası için fırsatlar

## UX Önerileri
- Dashboard tasarımı
- Veri görselleştirme
- Fan etkileşimi

## Task Önerileri
| # | Başlık | Açıklama | Öncelik | Efor | Kaynak |
(tablo — kaynak: hangi rakip/trend/kullanıcı ihtiyacından çıktı)

## Öncelik Sırası
1. Quick win — sebep
2. Stratejik — sebep
...

## KURALLAR
- WebSearch ve WebFetch kullan — güncel bilgi topla
- Somut, actionable öneriler sun
- Her öneri için kaynak belirt (hangi rakip, trend, kullanıcı yorumu)
- Jira task formatında öner (başlık, açıklama, öncelik, efor)
- Kod yazma, dosya düzenleme YAPMA
- Raporu Türkçe yaz
- Max 30 tool call
```

## Çıktı

Agent tamamlandığında rapor döner. Ana oturum:

1. Raporu kullanıcıya gösterir
2. Task önerileri varsa **3 seçenek** sunar:

```
Ne yapalım?
  1) Jira'da task olarak aç (onaylananları WAITING FOR APPROVAL'da oluşturur)
  2) Kenara not al (docs/tavsiyeler.md'ye ekler, Jira'ya dokunmaz)
  3) Hiçbir şey yapma (sadece rapor bilgi amaçlı)
```

- **Seçenek 1:** Kullanıcının onayladığı önerileri `createJiraIssue` ile WAITING FOR APPROVAL'da oluşturur (`voc-await-propose` label)
- **Seçenek 2:** Önerileri `docs/tavsiyeler.md` dosyasına tarih ve kaynak ile ekler
- **Seçenek 3:** Hiçbir işlem yapmaz, rapor bilgi amaçlıdır

## İlgili dosyalar

- [`docs/CLAUDE_JIRA.md`](../../../docs/CLAUDE_JIRA.md) — Jira protokolü
- [`docs/tavsiyeler.md`](../../../docs/tavsiyeler.md) — Mevcut ürün fikir listesi
