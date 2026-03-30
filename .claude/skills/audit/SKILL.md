---
name: audit
description: Proje kodu taraması — güvenlik, maliyet, performans, gereksiz dosya, API tehlikeleri. Genel veya odaklı.
argument-hint: "[security|cost|performance|cleanup|all]"
---

## /audit

Proje kodunu tarayıp sorunları raporla. Jira değil, **kod** taraması.

### Odak seçenekleri

| Arg | Ne tarar |
|-----|----------|
| *(boş)* veya `all` | Hepsini tarar (genel audit) |
| `security` | Hardcoded key/secret, .env sızıntısı, SQL injection, XSS, güvensiz storage, Firebase rules, API key exposure |
| `cost` | Ücretli servis kullanımı (Firebase, AdMob, RevenueCat, API call), gereksiz network call, büyük asset |
| `performance` | Büyük widget rebuild, gereksiz setState, Hive box leak, memory leak, büyük import, cold start |
| `cleanup` | Gereksiz dosya, kullanılmayan import/dependency, dead code, TODO/FIXME, boş test, .gitignore eksikleri |

### Örnekler

```
/audit                 → genel tarama (hepsi)
/audit security        → sadece güvenlik
/audit cost            → maliyet/ücretli servis odaklı
/audit performance     → performans odaklı
/audit cleanup         → temizlik odaklı
```

---

## Uygulama

Agent tool ile arka planda çalıştır:

```python
Agent(
  prompt=<aşağıdaki şablon>,
  model="sonnet",
  run_in_background=True,
  description="project audit: <odak>"
)
```

### Agent prompt şablonu

```
Sen bir kod güvenlik ve kalite uzmanısın. Football AI Platform (Var Odası) Next.js projesini tara.

Proje kökü: /Users/musabkara/Projects/football-ai-platform
ODAK: [kullanıcının verdiği odak, yoksa "all"]

## TARAMA KURALLARI

- Sadece oku ve raporla — dosya DÜZENLEME, kod YAZMA
- Max 25 tool call — verimli çalış
- Grep/Glob ile pattern ara, şüpheli bulursan Read ile doğrula
- False positive verme — emin olmadığın şeyi raporlama

## TARAMA KONTROL LİSTESİ

### SECURITY (odak: security veya all)

1. **Hardcoded secrets:** Grep ile tara:
   - `apiKey`, `api_key`, `secret`, `password`, `token`, `credential` pattern'ları `.ts`, `.tsx`, `.js`, `.json` dosyalarında
   - `.env` dosyası .gitignore'da mı? `.env` repo'da mı?
   - `next.config.ts` içinde hassas bilgi var mı?

2. **Auth güvenliği:**
   - NextAuth konfigürasyonu doğru mu?
   - Session/token yönetimi güvenli mi?
   - Middleware route koruması yeterli mi?

3. **API güvenliği:**
   - API route'larda auth kontrolü var mı?
   - SQL injection riski (Prisma raw query kullanımı)?
   - XSS riski (dangerouslySetInnerHTML, user input rendering)?
   - CSRF koruması var mı?

4. **Network güvenliği:**
   - HTTP (HTTPS değil) endpoint var mı?
   - User input doğrudan URL/query'ye ekleniyor mu? (injection)
   - CORS ayarları doğru mu?

5. **Veri güvenliği:**
   - Hassas veri client-side'da expose ediliyor mu?
   - Server component vs client component ayrımı doğru mu?

### COST (odak: cost veya all)

1. **Ücretli servis kullanımı:**
   - OpenAI API kullanım yerleri ve token maliyeti
   - Vercel bandwidth/serverless function kullanımı
   - PostgreSQL (Supabase/Neon) sorgu yoğunluğu
   - Qdrant vector DB kullanımı

2. **Asset boyutu:**
   - `public/` klasörü toplam boyut
   - Büyük resim/font dosyaları (>500KB)
   - Kullanılmayan asset

3. **Dependency maliyeti:**
   - `package.json`'daki paketlerden ücretli olan var mı?
   - Gereksiz büyük dependency (bundle size etkisi)

### PERFORMANCE (odak: performance veya all)

1. **React render:**
   - Gereksiz re-render (useEffect dependency, state yönetimi)
   - Server vs Client component ayrımı doğru mu?
   - Zustand store optimizasyonu (selector kullanımı)

2. **Data fetching:**
   - N+1 sorgu problemi (Prisma include/select)
   - Gereksiz API çağrısı
   - Caching stratejisi (Next.js cache, revalidate)

3. **Bundle size:**
   - Kullanılmayan import
   - Dynamic import kullanımı (lazy loading)
   - next/image optimizasyonu

4. **Database:**
   - Prisma sorgu optimizasyonu
   - Index eksikleri
   - Büyük veri seti pagination

### CLEANUP (odak: cleanup veya all)

1. **Gereksiz dosyalar:**
   - `.gitignore`'da olması gerekip olmayan dosyalar
   - Build artifact, cache, generated file repo'da mı?
   - Kullanılmayan script, config

2. **Dead code:**
   - Kullanılmayan TypeScript dosyası (hiçbir yerde import edilmeyen)
   - Kullanılmayan export/function/component
   - Commented-out code blokları (>5 satır)

3. **Dependency hygiene:**
   - `package.json`'da kullanılmayan paket
   - `package-lock.json` ile `package.json` tutarlılığı

4. **Code hygiene:**
   - TODO/FIXME/HACK/XXX yorumları (listele)
   - `console.log` statement'lar (debug kalıntısı)
   - any type kullanımı (TypeScript)

## RAPOR FORMATI

Her bulgu için:

```
### [SEVİYE] Başlık
- **Dosya:** path:satır
- **Sorun:** Ne yanlış
- **Risk:** Ne olabilir
- **Çözüm:** Ne yapılmalı
```

Seviyeler:
- 🔴 **KRİTİK** — hemen düzeltilmeli (secret sızıntısı, güvenlik açığı)
- 🟠 **YÜKSEK** — yakında düzeltilmeli (maliyet riski, performans sorunu)
- 🟡 **ORTA** — planlı düzeltilmeli
- 🔵 **BİLGİ** — iyileştirme önerisi

Rapor sonunda özet tablo:

| # | Seviye | Kategori | Dosya | Başlık |
|---|--------|----------|-------|--------|

Ve genel skor (1-10): 10 = temiz, 1 = acil müdahale.
```

## Çıktı

Agent tamamlandığında raporu kullanıcıya göster. Kritik bulgular varsa vurgula.

## Kurallar

- Kod YAZMA, sadece oku ve raporla
- Jira'ya dokunma — bu kod taraması, Jira değil
- Her bulguyu dosya:satır ile referansla
- Gerçek bulgu ver, spekülatif uyarı verme
