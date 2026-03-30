---
name: jira-run
description: VO Jira wait-and-check döngüsü. Büyük/küçük harf duyarsız. Tur sayısı + tur arası bekleme (örn. 50 1s). Durdurma /jira-cancel.
argument-hint: "[tur] [aralık] — örn. 50 1s | 10 | 10_1m | boş → 10 tur 1dk"
disable-model-invocation: true
---

## Tetikleme (büyük/küçük harf yok)

Kullanıcı **`/jira-run`**, **`/JIRA-RUN`**, **`JiraRun 50 1s`** (slash’sız, argümanlar aynı) vb. yazmış olabilir — hepsi bu skill. Menüde ad `jira-run` olsa da niyeti buna eşle.

## Çalıştırma modu (Claude vs Cursor)

**Tam döngü:** ana JQL, `iterations` kadar tur, tur başına `sleep(interval)`, Jira okuma/yazma, tur özetleri — `docs/CLAUDE_JIRA.md` protokolü ile.

| Ortam | Kural |
|--------|--------|
| **Claude Code** | **İki paralel arka plan agent başlatılır:** (1) Implementation agent — IP task'ı implement eder (kod yazar, test, commit, push, Done); (2) jira-run agent — Jira kart yönetimi (transition, edit, create, comment). **Ana oturum** (ön plan) bu iki agent'ı `Agent(run_in_background=true)` ile başlatır, kendisi başlatmaz. |
| **Cursor** | Tam döngü **mevcut sohbette** (Composer, Agent veya Chat) **çalıştırılabilir**. **Cloud / Background Agent zorunlu değil** — token veya tercih nedeniyle kullanılmayabilir. Uzun koşular için isteğe bağlı olarak ayrı oturum veya Cloud Agent tercih edilebilir. |

**Claude Code — ön planda tetiklenirse:** Ana oturum şunları yapar:
1. `rm -f .jira-state/jira-run.stop`
2. In Progress task varsa → `getJiraIssue` ile detay çek → **Implementation agent** başlat (`Agent(run_in_background=true)`)
3. **jira-run agent** başlat (`Agent(run_in_background=true)`) — yalnızca Jira kart yönetimi, kod yazmaz
4. Her iki agent paralel çalışır; ana oturum kullanıcıyla iletişime devam eder

**Cursor — ön planda tetiklenirse:** Skill’in tamamı **bu oturumda** uygulanır (`rm -f .jira-state/jira-run.stop` → döngü → özet blok ve tur sonu özetleri burada).

**Her iki ortamda yasak:** Geçersiz kısayollar tablosu (toplu sleep ile tur taklidi, protokolsüz “N tur” iddiası).

Ön planda o sırada süren başka görevi **bitirmeyi bekleme** (Claude arka plan bağlamı için). Ayrıntı: `docs/CLAUDE_JIRA.md` (wait-and-check).

### Gömülü başlatma komutu (çağrıda zorunlu — önce bunu çalıştır)

**Claude Code (arka plan)** veya **Cursor** oturumunda jira-run tetiklenince ajan, Jira MCP veya döngüye **başlamadan önce** repo kökünde **doğrudan aşağıdaki komutu** çalıştırsın (shell / terminal aracı; copy-paste ile aynısı):

```bash
rm -f .jira-state/jira-run.stop
```

Repo kökü emin değilse: workspace kökü veya `cd "$(git rev-parse --show-toplevel 2>/dev/null)"` sonrası aynı komut.

**İptal:** **`/jira-cancel`** — `docs/CLAUDE_JIRA.md` ve `jira-cancel` skill.

---

## Bilgilendirme (zorunlu)

### A) Koşu başlarken (stop dosyasını sildikten hemen sonra, döngüye girmeden önce)

**jira-run’un çalıştığı oturuma** (Claude Code arka plan / **Cursor — aktif sohbet**) **Özet blok** gönder. **Claude Code ön planda** tetiklenmişse ana sohbete özet blok **yok**, yalnızca arka plan yönlendirmesi. **Cursor**’da tetiklenmişse özet blok **bu sohbette**:

```text
[JiraRun] Başladı
- Tur sayısı: <iterations>
- Tur arası bekleme: <aralık ifadesi> (~<saniye> sn)
- İptal: /jira-cancel (bir sonraki tur başında durur)
```

Ham girdi: `$ARGUMENTS` — özette "girdi ne çözüldü"ye tek satır ekle.

### B) Döngü normal bittiğinde (cancel yok, tüm turlar tamam)

```text
[JiraRun] Bitti — <iterations> tur tamamlandı (iptal yok).
```

### C) İptalle çıkışta

Zaten var: `[JiraRun] İptal (jira-cancel / stop dosyası)`.

---

## Argümanları çöz

Ham metin: `$ARGUMENTS` — baş/son boşlukları at.

**Model:** **tur sayısı** (`iterations`, pozitif tam sayı) + **tur arası bekleme** (`interval`, saniyeye çevrilir). Toplam süre yok — sadece kaç kez döneceği ve her tur sonrası `sleep`.

### Adım 1 — Tur sayısı ve aralığı çıkar

1. **Boş:** `iterations = 10`, `interval = 1m` (60 sn).
2. **Tek token, içinde `_`:** ilk `_`den böl → **sol = tur sayısı** (yalnız rakam, ≥1), **sağ = aralık ifadesi** (Adım 2). Örnek: `50_1s`, `10_30s`, `10_1m`.
3. **İki veya daha fazla token (boşlukla):** İlk token = **tur sayısı** (tam sayı), ikinci = **aralık ifadesi**. Üçüncü ve sonrasını yok say; ana sohbete tek satır "fazla argüman yok sayıldı" de.
4. **Tek token, `_` yok:** yalnızca rakamlardan oluşuyorsa → `iterations` o değer, `interval = 1m` (varsayılan). Aksi (ör. `1h`, `43m`) → **eski süre-tabanlı çağrı değil**; uyarı + **varsayılan: 10 tur, 1m aralık**.

### Adım 2 — Aralık ifadesini saniyeye çevir

Tur arası bekleme; nokta ondalık ayırıcıdır (`,` değil).

| Örnek | Anlam |
|--------|--------|
| `5s`, `1s`, `0.5s` | saniye |
| `43m`, `1m` | dakika |
| `1.1h`, `0.25h` | ondalık saat |
| `1h30m`, `1.5h20m` | bileşik saat+dakika |
| `90m` | 90 dakika |

**Algoritma (bir ifade için):**

1. Normalize et: trim, birim harflerini küçült (`S`/`H`/`M`).
2. **Bileşik:** `^(\d+(?:\.\d+)?)h(\d+(?:\.\d+)?)m$` → `a*3600 + b*60` saniye.
3. **Tek birim:** `^(\d+(?:\.\d+)?)\s*([smh])$` → `s` değer (saniye), `m` değer×60, `h` değer×3600.

Geçersiz aralık → uyarı + **varsayılan aralık: 1m**.

### Doğrulama

- `iterations = max(1, parseInt(tur))` — en az **1** tur.
- `interval_sec` **> 0** (çok küçük değerler teknik olarak mümkün; aşırı yük uyarısı verilebilir).

---

## Döngü

**iterations** kadar tur.

### Tur arası bekleme — ne zaman?

**Doğru:** `sleep(interval)` yalnızca **o turun** Jira protokolü + **tur sonu özeti** tamamlandıktan **sonra**; **son turda sleep yok**.

**Yanlış:** Sonraki turun **başında** veya tur işine başlamadan önce bekleme — **yok**. İlk tur **öncesi** de bekleme yok.

**Sıra (her tur):** `.jira-state/jira-run.stop` kontrolü → (yoksa) protokol → tur özeti → **son tur değilse** `sleep(interval)` → bir sonraki tur.

**Her turun en başında:** `.jira-state/jira-run.stop` var mı?

- **Varsa:** sil, ana sohbete iptal mesajı (yukarı C), **çık**.
- **Yoksa:** Jira protokolünü çalıştır (`docs/CLAUDE_JIRA.md`) → tur sonu özeti at → **son tur değilse** yukarıdaki gibi **tur bittikten sonra** sleep interval.

Tur sonu özeti formatı aynı dosyada tanımlı.

### Geçersiz kısayollar (ajan yasakları)

Aşağıdakiler **gerçek jira-run sayılmaz**; kullanıcıya “N tur bitti” denmemeli:

| Yasak | Neden |
|--------|--------|
| Tek toplu `sleep((N-1)×interval)` + **bir veya iki** ana JQL ile N tur taklidi | Her tur ayrı: stop → protokol → **tur özeti** → (son tur değilse) sleep. Toplu sleep tek “tur özeti” öncesinde yapılamaz. |
| Aynı JQL’yi paralel/ardışık N kez çağırıp “N tur” demek (protokol adımları yok) | Tur = ana JQL + `docs/CLAUDE_JIRA.md` **Uygulama Sırası** (1–7) ve gerekirse boş iş hattı; yalnızca API tekrarı değil. |
| **Claude Code**’da ön planda tam N tur (arka plan olmadan) | **Claude için** tam döngü yalnızca arka plan — yukarıdaki tablo. |
| Protokolü atlayıp “N tur bitti” demek (hangi ortam) | Her tur: stop → `CLAUDE_JIRA` protokolü → tur özeti → (son tur değilse) sleep — taklit yok. |

### Tur boş geçmez (Jira yazımı)

**Kullanıcı direktifi:** `jira-run` turu **asla** hiçbir Jira yazımı olmadan kapanmaz.

- Uygulama Sırası (1–7) bu turda **transition / create / anlamlı edit** (veya tur kapanışı kapsamında **yorum**) üretmediyse → **`docs/CLAUDE_JIRA.md`** [Tur kapanışı — boş tur yok](docs/CLAUDE_JIRA.md#tur-kapanisi-bos-tur-yok): **§3** yalnız **bu turda yeni fikir** varsa (kart + Run); **aynı §3 kartına** her tur Run append **yasak**. **§4** yalnız **fikir yoksa** — *fikir bulunamadı* meta + Run / düşünülmüş append; **Yasak:** sıradan IP/To Do’ya poll; §3 fikir kartına rutin Run serisi.
- **💤** yalnızca özet satırında “routing yok” anlamındadır; **MCP ile en az bir yazım** yine de yapılmış olmalı (yukarıdaki kural).

**İzleme mantığı** (IP taze lock, To Do bekliyor vb.) aynıdır; **boş tur** yoktur.

---

## Her tur — kanon (özet)

Tam kurallar: **`docs/CLAUDE_JIRA.md`**. **Ajan:** `docs/CLAUDE_JIRA.md` veya bu skill’de **Jira protokolünü** değiştirdiysen → aynı oturumda **`docs/CLAUDE_JIRA_NOTES.md`** içindeki **«Ajan talimatı»** bölümünü uygula (tarih + yeni changelog girdisi). Kural tek kaynak: `CLAUDE_JIRA`.

### Boş iş hattı ve tur kapanışı

Adım 6’da To Do/Bug adayı yoksa → `docs/CLAUDE_JIRA.md` → **Boş iş hattı** (`#bos-is-hatti-jira`). **Tek tur:** BLOCKED → Backlog → (yalnızca kuyruk hâlâ yoksa) dedup + **§3** (yalnız **yeni** fikir → kart **WAITING** + `vo-await-idea` + [Run](docs/CLAUDE_JIRA.md#fikir-ve-meta-kart-run)) → **§4** (*fikir bulunamadı* + Run; mevcut kartta [append + üste taşıma](docs/CLAUDE_JIRA.md#fikir-karti-uste-tasima)) + `jira_loop_log`; `jira_run_cancel` → [§4 adım 4](docs/CLAUDE_JIRA.md#4-erken-çıkış--fikir-yok) (çok turlu koşuda ardışık §4 varsa **zorunlu değil**). **Adım 6’da aday varken** (ör. IP dolu) ve 1–7 yazım üretmediyse → [Tur kapanışı](docs/CLAUDE_JIRA.md#tur-kapanisi-bos-tur-yok). **Yalnız** `editJiraIssue` metin düzeltmesi fikir zorunluluğunu **tek başına** doldurmaz. IP oluşunca veya To Do’dan 21’e taşıyınca implementation agent **aynı turda** başlat. Label’lar ve JQL tam metinde.

### Jira İşlem Lock (her tur, işlem öncesi)

Birden çok agent aynı anda Jira'ya yazmasın diye **`.jira-state/jira-op.lock`** kullanılır.

- Lock yok → yaz → işlemi yap → lock sil
- Lock var + timestamp < 60s → **30 saniye bekle → tekrar kontrol** (max 5 deneme; sonra stale say, lock sil, devam et)
- Lock var + timestamp ≥ 60s → stale → lock sil → devam et
- İşlem sonrası her zaman lock sil (hata olsa bile)

### Implementation Agent — Ana Oturum Başlatır (nested agent değil)

**Sub-agent’lar `Agent` aracını çağıramaz (Claude Code kısıtı).** Bu yüzden implementation agent’ı **ana oturum** (ön plan) başlatır, jira-run agent’ı değil.

**Ana oturum `/jira-run` tetiklenince şu sırayla çalışır:**

1. `rm -f .jira-state/jira-run.stop`
2. In Progress task var mı kontrol et (`searchJiraIssuesUsingJql`)
3. **Varsa:** `getJiraIssue` ile detay çek → working lock yaz → **Implementation agent** başlat (`Agent(run_in_background=true)`)
4. **jira-run agent** başlat (`Agent(run_in_background=true)`) — yalnızca Jira kart yönetimi
5. Her iki agent **paralel** çalışır

**jira-run agent’ın görevi:** IP task görürse lock kontrol et, taze lock varsa atla. Implementation başlatmaya **çalışma** — ana oturum zaten başlattı.

### Implementation Agent — Tam Prompt Şablonu

Aşağıdaki şablonu **kelimesi kelimesine** kullan, sadece `[...]` kısımlarını doldur:

```
Sen bir Next.js/TypeScript implementation ajanısın. Aşağıdaki task’ı baştan sona implement et.

## ARAÇLARIN
Bash, Write, Edit, Read, Grep, Glob araçlarını kullanarak kodu yaz, test et ve commit et.
MCP Jira araçlarını kullanarak task’ı Done’a taşı.

## TASK
Task: [JIRA-XX] — [summary]

### Açıklama
[description tam metin — getJiraIssue’dan]

### Kabul Kriterleri
[kabul kriterleri — getJiraIssue’dan]

## ÇALIŞMA KURALLARI
- Proje kökü: /Users/musabkara/Projects/football-ai-platform
- cloudId: musabkara1990.atlassian.net
- Working lock: .jira-state/working-[JIRA-XX].lock
  - Her 10dk güncelle: date -u +”%Y-%m-%dT%H:%M:%SZ” > .jira-state/working-[JIRA-XX].lock
  - Bitince MUTLAKA sil: rm -f .jira-state/working-[JIRA-XX].lock

## SIRA (sabit)
1. Kodu yaz (Prisma schema → API route → Server component → Client component → test)
2. npm install
3. npx next lint — hata varsa düzelt
4. npm run build — hata varsa düzelt
5. git add [değişen dosyalar] && git commit -m “feat(JIRA-XX): [özet]”
6. git push
7. Jira’da Done’a taşı: transitionJiraIssue(issueIdOrKey: “JIRA-XX”, transitionId: “31”)
8. Lock sil: rm -f .jira-state/working-[JIRA-XX].lock

## HATA DURUMU
Hata/iptal/çökme’de: lock MUTLAKA sil → rm -f .jira-state/working-[JIRA-XX].lock
```

### jira-run’ın KENDİ Araç Kısıtı

**jira-run agent KESİNLİKLE şu araçları KULLANMAZ:**
- `Write`, `Edit` (lock dosyası hariç)
- `npm`, `node`, `tsx`, `git commit`, `git push`
- Herhangi bir kod yazma/değiştirme işlemi

**jira-run agent YALNIZCA şunları kullanır:**
- MCP Jira araçları (search, get, edit, create, transition, comment)
- `Bash` — yalnızca: lock dosyası yazma/silme, iptal kontrolü, `sleep 1`
- `Agent` — implementation agent başlatmak için

### In Progress Hazırlık Kontrolü (Tur 2+ için)

Tur 2 ve sonrasında JQL sonucunda In Progress task görürse:
- Lock var + timestamp < 15dk → başka agent (implementation) çalışıyor, **atla**
- Lock yok veya ≥ 15dk (stale) → lock sil → yeni implementation agent başlat (yukarıdaki şablon)

**In Progress yoksa** (routing bittikten sonra veya IP BLOCKED/WAITING ile boşaldıysa):
→ Bug sonra To Do → en yüksek priority tek task → In Progress’e taşı (21) → implementation agent başlat (yukarıdaki şablon)

**Diğer durumlar:**
- **İnsan onayı / credential / prod** → WAITING (7) + gerekçe + lock sil → adım 6
- **Saf teknik bağımlılık** → BLOCKED (6) + comment + lock sil → adım 6
- **Çok büyük** → parçala / Backlog; lock sil → adım 6

---

## Log (isteğe bağlı)

`docs/jira_loop_log.md` (en yeni üstte).
