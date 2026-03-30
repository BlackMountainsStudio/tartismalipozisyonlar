---
name: project-analysis
description: Multi-agent proje analizi. 12 kategoride paralel uzman agent'lar projeyi tarar + web arastirmasi yapar + master rapor olusturur.
argument-hint: "[quick] — quick verirsen kategori/model sormadan hepsini Sonnet ile yapar"
---

## /project-analysis

Projeyi birden fazla uzman agent ile paralel analiz et. Detay: `~/Projects/PROJECT_ANALYSIS.md`

## Akis

### 1. Model secimi sor

```
Analiz icin agent model tipini sec:
  1) Opus — en detayli, en pahali
  2) Sonnet — dengeli
  3) Haiku — hizli, ekonomik
  4) Karisik — her kategori icin ayri sorarim

Seciminiz (1/2/3/4):
```

Kullanici "karisik" secerse her kategoriyi gosterip yanina model sor.
`quick` argumani verildiyse sormadan hepsini Sonnet ile yap.

### 2. Kategori secimi sor (tek tek)

Her kategoriyi tek tek sor. Kullanici 1, 2 veya 3 ile yanit verir.

```
[KATEGORI_ADI] — [kisa aciklama]
1) Evet  2) Hayir  3) Kismen
```

- **1 (Evet):** Tam derinlikte analiz — max tool call, detayli rapor, web arastirmasi dahil
- **2 (Hayir):** Bu kategori atlanir
- **3 (Kismen):** Hafif analiz — sadece proje taramasi (web arastirmasi yok), kisa rapor, yarisina yakin tool call limiti. "Baksin ama cok onemli degil" seviyesi. Master raporda ayri isaretlenir (🔹 tam / 🔸 kismen).

Tum kategoriler sorulduktan sonra secilenleri ozetle ve onayla.

`quick` argumani verildiyse sormadan `all` kullan.

### 3. Agent'lari baslat

Her secilen kategori icin `Agent(run_in_background=true)` baslat.

**Agent prompt sablonu:**

```
(Model Adi)
Sen bir [KATEGORI_ADI] uzmanissin. Asagidaki projeyi bu perspektiften analiz et.

Proje koku: [CWD]
Proje tipi: [otomatik tespit — package.json/pubspec.yaml/Cargo.toml/go.mod vb.]

## ADIMLAR

### 1. PROJE TARAMASI (Read, Grep, Glob — max 15 tool call)
- Proje yapisini incele (ls, glob)
- [KATEGORI] ile ilgili dosyalari bul ve oku
- Mevcut durumu degerlendir
- Guclu yanlari ve eksikleri not et

### 2. DIS DUNYA ARASTIRMASI (WebSearch, WebFetch — max 10 tool call)
- "[KATEGORI] best practices [FRAMEWORK] 2025 2026"
- "[KATEGORI] checklist web app"
- Sektordeki trendler ve standartlar
- Rakip/benchmark ornekleri

### 3. RAPOR YONERGELERI

Raporun yalnizca icerigini duz metin olarak don — dosya yazma, dosya olusturma, kod duzenleme YAPMA. Sadece rapor metnini dondur.

Rapor formati:

# [KATEGORI_ADI] Analiz Raporu

## Mevcut Durum
- Yapilmis seyler (guclu yanlar)
- Puan: X/10

## Kritik Eksikler (hemen yapilmali)
| # | Sorun | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|

## Iyilestirme Onerileri (planli yapilmali)
| # | Oneri | Etki | Cozum Onerisi | Efor |
|---|-------|------|---------------|------|

## Kesin Olmali (industry standard, yoksa sorun)
- madde madde

## Kesin Degismeli (mevcut ama yanlis/eksik)
- madde madde

## Nice-to-Have (diferansiasyon, rekabet avantaji)
- madde madde

## Referanslar
- Web arastirma kaynaklari

---
Etki: High / Med / Low
Efor: S (1-2 saat) / M (1 gun) / L (2-5 gun) / XL (1+ hafta)

## KURALLAR
- Kod YAZMA, dosya OLUSTURMA — sadece oku, arastir, raporla
- Somut, actionable oneriler sun — soyut kalma
- Her oneri icin etki + efor belirt
- Raporu Turkce yaz
- Max 25 toplam tool call (15 proje + 10 web)
- False positive verme — emin olmadigin seyi raporlama
```

**Kategori-agent eslemesi:**

| # | description parametresi | Kategori prompt'a yazilacak |
|---|------------------------|---------------------------|
| 1 | "analysis: UI/UX" | UI/UX & Design |
| 2 | "analysis: Performance" | Performance & Core Web Vitals |
| 3 | "analysis: SEO" | SEO & Discoverability |
| 4 | "analysis: Data" | Data & Scraping Infrastructure |
| 5 | "analysis: Monetization" | Monetization & Business Model |
| 6 | "analysis: Growth" | Growth & User Engagement |
| 7 | "analysis: Security" | Security & Infrastructure |
| 8 | "analysis: Content" | Content & Editorial Strategy |
| 9 | "analysis: Analytics" | Analytics & Tracking |
| 10 | "analysis: Architecture" | Architecture & Code Quality |
| 11 | "analysis: Accessibility" | Accessibility (a11y) |
| 12 | "analysis: Competitive" | Competitive Analysis |

### 4. Agent sonuclarini topla

**Zamanlama:** Her agent baslatilmadan once `date +%s` ile baslangic zamani kaydet. Agent tamamlandiginda `date +%s` ile bitis zamani kaydet. Fark = sure (saniye → dakika).

**Token:** Agent sonucundaki metadata'dan (varsa) token bilgisi alinir. Yoksa tahmini olarak tool call sayisi x ortalama token ile hesaplanir.

Her agent tamamlandiginda donen rapor metnini `[PROJE]/analysis/[NN]_[slug].md` dosyasina yaz.

Dosya isimleri:
```
01_ui_ux_design.md
02_performance.md
03_seo.md
04_data_scraping.md
05_monetization.md
06_growth_engagement.md
07_security_infrastructure.md
08_content_strategy.md
09_analytics_tracking.md
10_architecture_code.md
11_accessibility.md
12_competitive_analysis.md
```

### 5. Master rapor (Opus agent)

Tum kategori agent'lari tamamlaninca bir **Opus** agent baslat:

```
(Opus)
Sen bir senior teknoloji danismanisin. Asagidaki kategori raporlarini tek bir master analize birlestir.

Proje: [PROJE_ADI]
Raporlar: [PROJE]/analysis/ altindaki tum md dosyalari

## GOREV

1. Her raporu oku (Read tool)
2. Master rapor olustur — icerigini duz metin olarak dondur (dosya yazma)

## MASTER RAPOR FORMATI

# [Proje Adi] — Master Analysis Report
> Generated: [tarih] | Categories: [N] | Models: [kullanilan modeller]

## Executive Summary
- Genel puan: X/10 (kategori puanlarinin agirlikli ortalamasi)
- En guclu alan: [kategori + neden]
- En zayif alan: [kategori + neden]
- Kritik aksiyon sayisi: N
- Toplam oneri sayisi: N

## Puan Karti
| Kategori | Puan | Kritik | Iyilestirme | Nice-to-Have |
|----------|------|--------|-------------|--------------|
(her kategori bir satir)

## Top 20 Oncelikli Aksiyonlar
| # | Aksiyon | Kategori | Etki | Efor | Oncelik Skoru |
|---|---------|----------|------|------|--------------|
(kategoriler arasi, etki/efor matrisine gore siralanmis — High etki + S efor = en yuksek oncelik)

## Cross-Cutting Insights
- Birden fazla kategoriyi etkileyen ortak temalar
- Sinerjiler (bir degisiklik birden fazla kategoriyi iyilestirir)
- Celiskiler (bir kategorinin onerisi digerine zarar verebilir)

## Roadmap Onerisi
### Hafta 1-2 (Quick Wins)
### Ay 1 (Foundation)
### Ay 2-3 (Growth)
### Ay 3+ (Optimization)

## Kategori Ozetleri
(her kategori icin 3-5 satirlik ozet + dosya linki)

## Methodology & Cost Report
| Kategori | Model | Baslangic | Bitis | Sure (dk) | Tool Call | Input Token | Output Token | Toplam Token | Maliyet ($) | Toplama Orani (%) |
|----------|-------|-----------|-------|-----------|-----------|-------------|--------------|--------------|-------------|-------------------|
(her agent bir satir)

- **Toplam sure:** X dk
- **Toplam token:** X (input: X, output: X)
- **Toplam tahmini maliyet:** $X
- **En pahali kategori:** ...
- **En verimli kategori (puan/token):** ...
- **Notlar:** Gelecek analizler icin hangi kategoriler Sonnet'e dusurulebilir, hangilerinde Opus fark yaratti

## KURALLAR
- Raporu Turkce yaz
- Somut, onceliklendirilmis, actionable
- Kategori raporlarindaki detaylari tekrarlama — ozetle ve referans ver
- Cross-cutting insights onemli — kategoriler arasi baglantilar bul
```

Master rapor metnini `[PROJE]/analysis/MASTER_ANALYSIS.md` dosyasina yaz.

### 6. Cikti

Kullaniciya goster:
1. Executive summary (master rapordan)
2. Puan karti tablosu
3. Top 5 kritik aksiyon
4. Dosya konumlari

---

## Kurallar

- Agent'lar birbirini BEKLEMEZ — tamamen paralel
- Her agent max 25 tool call (proje 15 + web 10)
- Agent'lar dosya YAZMAZ — rapor metni dondurur, ana oturum dosyalari olusturur
- Master rapor icin ayri Opus agent kullanilir
- `analysis/` dizini proje kokunde olusturulur
- Bu skill tum projelerde calisir (framework otomatik tespit)
