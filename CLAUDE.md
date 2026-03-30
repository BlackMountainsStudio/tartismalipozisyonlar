# Football AI Platform (Var Odasi) — Claude Code

## AI icin hizli tarama

| Once | Kaynak | Not |
|------|--------|-----|
| 1 | Bu dosya (`CLAUDE.md`) | Davranis, Git, CI |
| 2 | `AGENTS.md` | Proje genel bakis, DB, auth, lint |

**Kesin kurallar:**
1. **Oncelik:** MCP/tool → script / mevcut kod → reasoning
2. **Commit oncesi:** `npm run lint` (ESLint 9)
3. **Dil:** Kullaniciya Turkce; kod Ingilizce; commit mesaji Ingilizce

---

## Dokuman haritasi

| Dosya | Amac |
|--------|------|
| `CLAUDE.md` (bu dosya) | Genel davranis, arac onceligi, guvenlik, Git/CI |
| `AGENTS.md` | Proje overview, DB setup, auth, lint |
| `.claude/settings.json` | Hooks ve enabledMcpjsonServers (permissions global'den devralinir) |
| `.mcp.json` | MCP sunuculari (github, git, atlassian, context7) |
| `~/.claude/skills/` (global) | Tum skill'ler — proje klasorune kopyalanmaz |

### Skills (global — `~/.claude/skills/`)

| Skill | Komut | Aciklama |
|-------|-------|----------|
| **rbg** | `/rbg` | Arka plan delegasyonu. `/btw` = aracsiz kisa soru |
| **audit** | `/audit` | Kod taramasi: security, cost, performance, cleanup, all |
| **dashboard** | `/dashboard` | Terminal dashboard cache'ten (0 token) |
| **dashboard-sync** | `/dashboard-sync` | Jira MCP'den taze veri + dashboard |
| **decide** | `/decide` | WAITING kartlari listele, kullanici hizli karar |
| **jira-run** | `/jira-run` | Wait-and-check dongusu |
| **jira-run-fast** | `/jira-run-fast` | 1s aralikli hizli dongu |
| **jira-cancel** | `/jira-cancel` | jira-run durdur |
| **jira-start-new-task** | `/jira-start-new-task` | Coklu agent pipeline |
| **agent-browser** | `/agent-browser` | Browser otomasyon CLI |
| **web-research** | `/web-research` | Genel web arastirmasi |

---

## 1. Calisma tarzi

- Varsayilan izin modu: **bypassPermissions** (`.claude/settings.json`)
- Proje kapsaminda hizli, proaktif ve kararli davran
- **Minimum soru:** kullaniciya cok zorunda kalmadikca sorma; geri alinabilir isleri onaysiz yap
- Mantikli varsayimlarla ilerle

### Ne zaman durup sor?

Yalniz: **yuksek risk** (guvenlik, KVKK/odeme, prod), **geri alinamaz veri kaybi**, veya istek **kritik olcude belirsiz** ve yanlis varsayim telafisi yoksa.

---

## 2. Tool-first ve maliyet (kritik)

**Oncelik sirasi:** (1) MCP / tool → (2) yerel script / mevcut cozum → (3) son care reasoning.

- MCP veya tool ile cozulebiliyorsa **her zaman** tool kullan
- Git → Git MCP; dosya → file tools; API/scrape → uygun tool

### Maliyet bilinci

- Tool varsa tool; kucuk iste dogrudan; buyuk isi parcala
- **Sadece** yuksek risk veya gercek belirsizlikte sor. Maliyet icin "genelde durup sorma"

---

## 3. Gorev parcalama

**Hedef:** gorev / alt gorev ≤ ~10 dakika (istisna seyrek).

- **10 dk asacaksa:** once alt goreve bol, sonra tek tek uygula
- **Kapsam:** "Sunu da yapayim" yok; refactor gorursen ayri task

**Next.js ozellik sablonu (sira):**

 Prisma schema → API route → Server component/page → Client component → test

---

## 4. Dosya sistemi ve guvenlik

**Proje ici (sormadan):** olusturma, duzenleme, refactor, gereksiz proje dosyasi silme, klasor duzeni.

**ASLA sormadan dokunma:** proje disi, kullanici kisisel dosyalari, sistem dosyalari.

**Guvenli sil:** `.next/`, `node_modules/` cache, gecici, generated. **Sormadan silme:** proje disi, kullanici verisi, emin olmadigin dosya.

---

## 5. Arac kurulumu ve bootstrap

**Izinsiz kurulabilir:** npm/pnpm, eslint/prettier/test araclari, MCP.

**Sormadan yapma:** apt/brew/choco, PATH degistirme, sistem config.

**Once sor:** Docker, DB sunucusu, harici servisler.

---

## 6. Hata yonetimi ve yedek

**Self-healing:** analiz → kok neden → duzelt → tekrar dene; **max 3**; sonra kullaniciya rapor.

**Riskli is oncesi yedek:** `.backup/<timestamp>/` — buyuk refactor, toplu silme, config degisimi.

---

## 7. Git, CI

**Commit oncesi:** `npm install` → `npm run lint`

- Domain / API / provider degistiyse ilgili testleri guncelle

**Conventional commit:** `feat:`, `fix:`, `refactor:`, `chore:`

**Dal ve PR kurallari:**

| Durum | Akis |
|-------|------|
| 1-3 dosya, tek commit | main'e direkt push |
| 4+ dosya veya birden fazla commit | feature branch → PR → CI yesil → merge |
| CI workflow tetiklenecek degisiklik | Her zaman PR |
| Mimari / buyuk refactor | Feature branch + PR + review |

**GitHub:** PR/push: `.github/workflows/` varsa CI kontrolu. Yesil CI; force push **sor**.

---

## 8. Riskli komutlar ve guvenlik

**Mutlaka sor:** `rm -rf` (tehlikeli kapsam), `git reset --hard`, `git push --force`, repo silme, mimari degisiklik, guvenlik/KVKK, odeme, secrets (`.env`), ucretli servis.

---

## 9. Model etiketi, maliyet, dil

- Yanit basinda kullanilan model: `(Model Adi)` — or. `(Opus 4.6)`
- Basit/orta is + Opus aktifken: daha ucuz modele gecmeyi **oner**; kullanici karar verir

| Model | Maliyet | Ne zaman |
|--------|---------|----------|
| Haiku 4.5 | En dusuk | Label, kucuk duzenleme, basit soru |
| Sonnet 4.6 | Orta | Kod, orta karmasiklik |
| Opus 4.6 | En yuksek | Mimari, buyuk feature, zor debug |

### Token koruma kurallari

- **Iki paralel Opus session acma** — her biri ayri limit harcar
- **Sub-agent (Agent tool):** prompt'un **ilk satiri** her zaman `(Model Adi)` olmali
- **Buyuk dosya okuma+yazma** (>20KB): Sonnet'te yap, Opus'ta yapma
- **Gereksiz exploration yok:** sadece edit edecegi veya bagimliligini anlamak zorunda oldugu dosyalari oku
- Session ortasinda is hafiflediginde model gecisi **oner**

**Dil:** kullaniciya Turkce; kod Ingilizce; commit mesaji Ingilizce.

---

## Teknoloji Stack

- **Framework:** Next.js 16 + React 19
- **Dil:** TypeScript 5
- **ORM:** Prisma 7 (PostgreSQL)
- **Auth:** NextAuth v5 (beta)
- **Stil:** Tailwind CSS v4
- **AI:** OpenAI API
- **Hosting:** Vercel
- **DB:** PostgreSQL (Supabase/Neon)
