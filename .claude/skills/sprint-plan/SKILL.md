# /sprint-plan — Analiz Raporlarindan Sprint Plani + Jira Girisi

## Aciklama

Proje analiz raporlarini (`analysis/` klasoru) okuyarak sprint plani olusturur ve Jira'ya task olarak girer. Yeniden calistirildigi her seferde mevcut plani gunceller veya sifirdan olusturabilir.

## Kullanim

```
/sprint-plan                    # Tam akis: plan olustur + Jira'ya gir
/sprint-plan plan-only          # Sadece plan olustur (Jira girisi yok)
/sprint-plan jira-only          # Mevcut plani Jira'ya gir (plan zaten varsa)
/sprint-plan sync               # Jira'daki mevcut task'lari planla senkronize et
/sprint-plan add-sprint <N>     # Yeni sprint ekle (backlog'dan tasiyarak)
```

## Onkosula

- `analysis/` klasorunde en az 1 analiz raporu olmali
- `analysis/MASTER_ANALYSIS.md` varsa oncelikli kaynak olarak kullan
- Jira girisi icin Atlassian MCP aktif olmali

## Akis

### 1. Analiz Raporlarini Oku

```
analysis/*.md dosyalarini oku (MASTER_ANALYSIS.md dahil)
Her rapordan:
  - "Kesin Olmali" → P0
  - "Kesin Degismeli" → P1
  - "Nice-to-Have" → P2/P3
  - Etki (High/Med/Low) ve Efor (S/M/L/XL) bilgilerini cikar
```

### 2. Task Cikarimi

Her bulgu/oneri icin:
- **Kisa baslik** (Jira summary — max 80 karakter, Ingilizce)
- **Aciklama** (Turkce, detayli — ne yapilacak, neden, nasil)
- **Kategori** label'i (security, seo, perf, arch, ui, growth, analytics, data, content, monetization, a11y)
- **Oncelik** (P0/P1/P2/P3)
- **Efor** (S/M/L/XL → Story point: S=1, M=2, L=3, XL=5)
- **Sprint atamasi** (etki x 1/efor siralamasina gore)

### 3. Sprint Organizasyonu

| Sprint | Odak | Kapasite |
|--------|------|----------|
| 1 | Security & Quick Wins | 20-25 task |
| 2 | SSR & Performance | 20-25 task |
| 3 | SEO & Analytics | 20-25 task |
| 4 | Growth & Engagement | 20-25 task |
| 5 | Monetization & Scale | 20-25 task |

**Kurallar:**
- Her sprint 2 haftalik
- Sprint 1 daima guvenlik ve hizli kazanimlarla baslar
- SSR donusumu (en yuksek cross-cutting etki) Sprint 2'de
- Monetizasyon son sprint'te (altyapi gerektirir)
- Her sprint'in toplam story point'i ~30-40 arasi
- P0 task'lar atandigi sprint'te kesinlikle tamamlanmali

### 4. Dokuman Olustur

Cikti: `analysis/SPRINT_PLAN.md`

Icerik:
- Ozet tablosu (sprint bazli task/SP)
- Sprint detaylari (task tablosu: #, baslik, kategori, oncelik, efor, label)
- Backlog (sprint disinda kalan task'lar)
- Label haritasi
- Oncelik aciklamasi
- Sprint metrikleri hedefi

### 5. Jira Girisi (jira-only veya tam akis)

**Proje:** VO
**Issue type:** Task (veya Story)

Her sprint icin:
1. **Epic olustur:** `[Sprint N] Odak Alani` (orn: `[Sprint 1] Security & Quick Wins`)
2. **Task'lari olustur:** Her task icin Jira issue
   - Summary: Ingilizce, kisa (max 80 karakter)
   - Description: Turkce, detayli
   - Priority: P0→Highest, P1→High, P2→Medium, P3→Low
   - Labels: ilgili label'lar
   - Story Points: S=1, M=2, L=3, XL=5
   - Epic Link: ilgili sprint epic'i
   - Sprint: Jira board'daki sprint'e ata (varsa)

**Paralel calisma:** Sprint'ler arasi bagimsiz → 5 agent paralel Jira girisi yapabilir.

**Rate limit:** Atlassian MCP'de cok hizli cagri yapmamaya dikkat et. Batch halinde 5-10 task olustur, araya kisa bekleme koy.

### 6. Senkronizasyon (sync modu)

- Jira'daki mevcut VO task'larini JQL ile cek
- SPRINT_PLAN.md ile karsilastir
- Eksik task'lari olustur
- Tamamlanmis task'lari isaretle
- Rapor ver: eklenen, guncellenen, atlanan

## Ornek Jira Task

```
Summary: Clean .env secrets and add placeholder values
Description:
  ## Ne yapilacak
  .env dosyasindaki gercek secret degerleri temizle, sadece placeholder birak.

  ## Neden
  .env dosyasinda Neon DB baglanti bilgileri, ADMIN_SECRET hash degeri ve AUTH_SECRET
  gercek degerleri mevcut. Bunlar git history'de olabilir.

  ## Nasil
  1. .env dosyasini temizle — sadece VARIABLE_NAME=placeholder_here formati
  2. .env.example olustur (yoksa)
  3. Git history'de secret varsa credential rotation yap
  4. Vercel/deployment ortaminda gercek degerleri environment variables olarak ayarla

  ## Kabul Kriterleri
  - [ ] .env dosyasinda gercek deger yok
  - [ ] .env.example mevcut ve guncel
  - [ ] Deployment ortaminda env vars dogru ayarli

Priority: Highest
Labels: security
Story Points: 1
Epic: [Sprint 1] Security & Quick Wins
```

## Notlar

- Task baslik dili: **Ingilizce** (Jira convention)
- Task aciklama dili: **Turkce** (takim icin)
- Kullaniciya Turkce iletisim
- Commit: Ingilizce conventional commit
- Her sprint sonunda retrospektif icin metrik hedeflerini kontrol et
