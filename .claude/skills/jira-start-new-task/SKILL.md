---
name: jira-start-new-task
description: Sahipsiz IP veya To Do'dan N task seç, her biri için Sonnet kod + Opus review pipeline'ı başlat (branch → PR → review → merge)
argument-hint: "[N=1]"
disable-model-invocation: false
context: fork
agent: general-purpose
---

## Ne yapar

`/jira-start-new-task` veya `/jira-start-new-task N` komutu:

1. **Arguman cozme:** Sayi yoksa N=1; varsa o sayi (min 1, max 20)
2. **Oncelik 1 -- Sahipsiz IP kartlari:** In Progress'te olup working lock'i olmayan veya stale (>15dk) olan kartlari bul
3. **Oncelik 2 -- To Do:** Kalan N icin To Do'dan priority DESC sirasiyla sec, IP'ye tasi
4. **Ikisinde de is yoksa:** "Sira N'de bulamadim" mesaji
5. **Her kart icin:** `scripts/run_task_agent.sh` ile 2 adimli pipeline baslat

---

## 2 Adimli Pipeline (her task icin)

Her task icin `scripts/run_task_agent.sh` wrapper calisir:

### Adim 1 -- Kod (Sonnet)
- `feat/foot-xxx` branch olusturur (main'den)
- Kodu yazar, dosya lock kurallarina uyar
- `npm install` + `npx next lint` + `npm run build`
- `git commit` + `git push -u origin feat/vo-xxx`
- `gh pr create --base main` ile PR acar
- **Merge YAPMAZ** -- review bekler

### Adim 2 -- Review (Opus)
- PR'i bulur (`gh pr list --head feat/foot-xxx`)
- `git checkout feat/foot-xxx && git pull`
- `git diff main...feat/foot-xxx` ile tum degisiklikleri inceler
- `npx next lint` + `npm run build`
- Kod kalitesi kontrol (import, TypeScript types, React pattern, Prisma usage, test coverage)
- Sorun varsa: duzelt, commit, push, tekrar analyze+test
- Temizse: `gh pr merge --squash --delete-branch`
- `git checkout main && git pull`
- Jira'da Done (31) transition

**Model kurali:** Kod = min Sonnet, Review = Opus. Haiku asla kod yazmaz.

---

## Arguman cozumu

| Input | N |
|-------|---|
| `/jira-start-new-task` | **1** |
| `/jira-start-new-task 5` | **5** |
| `/jira-start-new-task 100` | **20** (max cap) |
| `/jira-start-new-task foo` | Uyari + **1** |
| Cok arguman | Ilk token, fazlasi ignore |

---

## Dosya lock sistemi (cakisma korumasi)

Birden fazla sub-agent ayni repo'da calisirken dosya cakismasini onlemek icin **dosya seviyesinde lock** mekanizmasi kullanilir.

### Lock dizini
`.jira-state/file-locks/` -- her dosya icin bir lock dosyasi.

### Lock formati
Dosya: `.jira-state/file-locks/<encoded-path>.lock`
Icerik: `<KEY> <TIMESTAMP>`

Encoded path: dosya yolundaki `/` -> `__` (or. `lib__domain__entities__word.dart.lock`)

### Sub-agent prompt'una eklenen kurallar

```
DOSYA LOCK KURALLARI (ZORUNLU):
1. Bir dosyayi duzenlemeden ONCE lock al:
   echo "<KEY> $(date +%s)" > .jira-state/file-locks/<encoded-path>.lock
2. Duzenleme BITINCE lock'u sil:
   rm -f .jira-state/file-locks/<encoded-path>.lock
3. Bir dosyayi duzenlemek istediginde ONCE lock kontrol et:
   - Lock yoksa -> al ve duzenle
   - Lock varsa ve baska KEY'e ait -> O DOSYAYA DOKUNMA, atla veya bekle
   - Lock varsa ve kendi KEY'ine ait -> devam et
4. Yeni dosya olustururken de lock al
5. Process bittiginde TUM lock'larini temizle:
   rm -f .jira-state/file-locks/*<KEY>* 2>/dev/null
```

---

## Calistirma sirasi

### Adim 0 -- Lock dizinini olustur
```bash
mkdir -p .jira-state/file-locks
```

### Adim 1 -- Sahipsiz IP kartlarini bul

**JQL:**
```jql
project = VO AND status = "In Progress" ORDER BY priority DESC
```

Her IP karti icin `.jira-state/working-<KEY>.lock` kontrol et:
- **Lock yok** -> sahipsiz, listeye ekle
- **Lock var ama stale (>15dk)** -> stale lock sil + dosya lock'larini temizle, listeye ekle
- **Lock var ve taze (<15dk)** -> aktif sub-agent, atla

### Adim 2 -- To Do'dan kalan N'i doldur

```jql
project = VO AND status = "To Do" ORDER BY priority DESC
```

Her kart icin: Transition 21 -> IP, lock yaz, sub-agent baslat.

### Adim 3 -- Bossa mesaj ver
```
Sira N'de bulamadim -- ne sahipsiz IP ne de To Do'da is var.
```

---

## Her kart icin islem

1. **Transition (sadece To Do kartlari)** -- `transitionJiraIssue` transition `21`
2. **Working lock olustur** -- `echo <TIMESTAMP> > .jira-state/working-<KEY>.lock`
3. **Sub-agent baslat** -- wrapper script ile:

```bash
cd /Users/musabkara/Projects/football-ai-platform && \
nohup bash scripts/run_task_agent.sh <KEY> \
  "Implementation: <SUMMARY>. <DESC ilk 200 char>. Jira key: <KEY>." \
  > /tmp/pipeline-<KEY>.log 2>&1 &
echo $! > .jira-state/pid-<KEY>
```

Wrapper (`run_task_agent.sh`) otomatik olarak:
- **git worktree** ile `.worktrees/vo-xxx/` dizininde izole calisir
- Paralel agent'lar birbirini etkilemez (her biri kendi worktree'sinde)
- Sonnet ile kod yazar (worktree icinde)
- PR acar
- Opus ile review yapar (worktree icinde)
- Merge + Jira Done transition
- Cleanup: worktree sil + lock temizligi (trap ile)

---

## Cikti

### Basari
```
N task baslatildi:
  [IP sahipsiz] VO-123 -- Task Title (lock yenilendi)
  [To Do -> IP] VO-125 -- New Task
  ...

Pipeline: Sonnet kod -> PR -> Opus review -> merge -> Done
Loglar: /tmp/impl-VO-XXX.log, /tmp/review-VO-XXX.log
```

### Hic is yok
```
Sira N'de bulamadim -- ne sahipsiz IP ne de To Do'da is var.
```

---

## Teknik notlar

- **Working lock:** `.jira-state/working-<KEY>.lock` -- task seviyesi (Jira durum)
- **File lock:** `.jira-state/file-locks/<path>.lock` -- dosya seviyesi (cakisma korumasi)
- **Stale threshold:** 15 dakika (900000 ms)
- **Cleanup:** `trap cleanup EXIT INT TERM` -- kill/crash durumunda otomatik temizlik
- **Max N:** 20 (cok paralel agent memory/CPU issue)
- **Error handling:** Jira tool basarisiz -> log + continue
- **Branch pattern:** `feat/foot-xxx` (key lowercase)
- **PR merge:** `--squash --delete-branch` (temiz git history)

---

## Ilgili dosyalar

- `scripts/run_task_agent.sh` -- 2 adimli pipeline wrapper (Sonnet kod + Opus review)
- [`docs/CLAUDE_JIRA.md`](../../../docs/CLAUDE_JIRA.md) -- Lock sistemi, IP durum gecisi
- [`.claude/skills/rbg/SKILL.md`](../rbg/SKILL.md) -- `/rbg` ile background agent
