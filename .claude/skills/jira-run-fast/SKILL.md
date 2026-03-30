---
name: jira-run-fast
description: VO Jira wait-and-check hızlı ön ayarı — tur arası her zaman 1 saniye; tur sayısı isteğe bağlı (ör. 100 → 100 tur × 1s). /jira-run-fast ve eşanlamlıları; Claude’da tam döngü arka planda, Cursor’da mevcut sohbette (jira-run skill); docs/CLAUDE_JIRA.md.
disable-model-invocation: true
---

# jira-run-fast (N × 1s)

## Ne yapar

**Sabit:** tur arası bekleme her zaman **`1s`** (1 saniye).

**Değişken:** **tur sayısı** `N` — kullanıcı yazdıysa o sayı kadar tur; yazmadıysa **varsayılan `N = 10`**.

**Eşdeğer:** **`/jira-run <N> 1s`** (ör. `100` → `/jira-run 100 1s`).

Tam Jira döngüsü, özet blokları, iptal ve protokol: **[`.claude/skills/jira-run/SKILL.md`](../../../.claude/skills/jira-run/SKILL.md)** — bu skill yalnızca **1s sabit + tur sayısı çözümlemesi**; oradaki tüm kurallar geçerlidir (**Claude:** arka plan · **Cursor:** mevcut sohbet).

## Argümanları çöz

Ham metin: slash ve skill adından sonraki kısım — trim; boşlukla tokenlara böl.

| Girdi | `N` (tur sayısı) |
|--------|------------------|
| Boş, yalnızca `/jira-run-fast` veya `jira_run_fast` | **10** |
| Tek token, yalnız rakamlar (ör. `100`, `50`, `1`) | `max(1, parseInt(token))` — en az **1** tur |
| İlk token rakam, sonrası var (ör. `100 foo`) | `N` = ilk token; fazla token için tek satır "fazla argüman yok sayıldı" |
| İlk token rakam değil | Uyarı + **N = 10** |

`N` belirlendikten sonra jira-run ile **`<N> 1s`** olarak uygula.

## Çalıştırma

### Gömülü başlatma komutu (çağrıda zorunlu — önce bunu çalıştır)

Bu skill tetiklenince ajan, `N` çözümü ve `jira-run` uygulamasından **önce** repo kökünde **doğrudan aşağıdaki komutu** çalıştırsın (shell / terminal; [`jira-run` skill](`../../../.claude/skills/jira-run/SKILL.md`) ile aynı blok):

```bash
rm -f .jira-state/jira-run.stop
```

1. **Eşdeğer çağrı:** jira-run skill’ini **`<N> 1s`** argümanıyla uygula (ör. `/jira-run 100 1s`).
2. **Ortam:** [`jira-run` skill — Çalıştırma modu](`../../../.claude/skills/jira-run/SKILL.md`) — **Claude Code**’da tam döngü **yalnızca arka plan**; **Cursor**’da tam döngü **bu sohbette** çalıştırılabilir (Cloud / Background Agent **zorunlu değil**).

## Özet blok (jira-run’un çalıştığı oturumda)

`jira-run` skill’indeki A) şablonunu kullan:

- Tur sayısı: **N** (çözülen tur sayısı)
- Tur arası bekleme: **1s** (~1 sn)

Ham girdi notu: `jira-run-fast` / `jira_run_fast` + çözülen `N`.

## İptal

**`/jira-cancel`** — [`jira-cancel` skill](`../../../.claude/skills/jira-cancel/SKILL.md`), [`docs/CLAUDE_JIRA.md`](../../../docs/CLAUDE_JIRA.md).

## Geçersiz uygulama ve tur boş geçmez

- **Toplu sleep + tek/çift JQL** ile `N` tur taklidi **geçerli değildir** — bkz. [`jira-run` skill “Geçersiz kısayollar”](../../../.claude/skills/jira-run/SKILL.md).
- **Claude Code** ön planda “burada yap” **yok** — arka plan şart. **Cursor**’da bu kısıt yok (tam döngü mevcut sohbette).
- **Tur asla boş geçmez:** Her turda **en az bir** Jira yazımı (transition, create, edit, veya **§3/§4** kapsamı). Routing yoksa [Tur kapanışı — boş tur yok](../../../docs/CLAUDE_JIRA.md#tur-kapanisi-bos-tur-yok): **§3** yalnız **bu turda yeni fikir** varsa (aynı §3 fikir kartına her tur Run append **yok**); **§4** yalnız **fikir yoksa** — meta kart veya düşünülmüş append (robotik şablon tekrarı **yok**). Normal iş kartına rutin “izleme / poll” **yok**.
- **IP ilerletilemiyorsa:** Onay/credential → **daima WAITING (7)**; teknik bağımlılık → **BLOCKED**; [IP’de takılmama](../../../docs/CLAUDE_JIRA.md#ip-takilmama-ilerleme) — bitir / parçala / taşı, **aynı turda** sonraki To Do → IP; aynı kartta takılı kalma.
- **Yeni fikir:** [`§3`](../../../docs/CLAUDE_JIRA.md#bos-is-hatti-jira) — kart **WAITING FOR APPROVAL** (`vo-await-idea`) + [## Run](../../../docs/CLAUDE_JIRA.md#fikir-ve-meta-kart-run) **yalnız yeni kayıt için**. **Fikir yok:** [`§4`](../../../docs/CLAUDE_JIRA.md#4-erken-çıkış--fikir-yok) — *fikir bulunamadı* + Run; ardışık turlarda aynı meta’da **anlamlı** append.
