---
name: jira-cancel
description: jira-run döngüsünü durdurur (stop dosyası). Ön işlemde script çalışır; ana agent meşgulse terminal fallback. b/h duyarsız.
argument-hint: "argüman yok"
disable-model-invocation: true
context: fork
agent: general-purpose
---

## Claude Code kısıtı (kullanıcıya özetle)

Ana oturum **tek sıra** işlerse `/jira-cancel` slash’i, ana agent o an üretim yapıyorsa **sıraya girer** — bu ürün davranışıdır; `run_in_background` ile tamamen aşılamaz.

**Anında iptal (ana agent beklemeden):** repo kökünde ayrı bir terminal aç:

`bash scripts/jira_run_cancel.sh`

(Bu script doğrudan `.jira-state/jira-run.stop` yazar; Claude sırasına ihtiyaç yok.)

**Not (working lock):** `/jira-run` değil, **tek task** üzerindeki implementation agent iptal / çökme sonrası kalan `.jira-state/working-VO-XX.lock` için: `bash scripts/jira_clear_working_lock.sh VO-XX` veya `--all`. Ayrıntı: `docs/CLAUDE_JIRA.md` (Lock Sistemi).

**Ajan:** Bu skill metninde **Jira iptal / stop davranışını** değiştirirsen → `docs/CLAUDE_JIRA_NOTES.md` «Ajan talimatı».

---

## Ön işleme — stop dosyası (slash işlendiği anda)

Slash yüklendiğinde aşağıdaki komut **modele gitmeden önce** çalışır; çıktı bu mesajda görünür. Çalışma dizini farklı olsa bile repo köküne göre script çağrılır:

!`bash "${CLAUDE_SKILL_DIR}/../../../scripts/jira_run_cancel.sh"`

Yukarıdaki çıktıyı kullanıcıya **olduğu gibi** ilet; sonra kısa ekle:

- `/jira-run` bir sonraki tur **başında** çıkar.
- Ana oturum hâlâ meşgulse ve bu skill geciktiyse, bir daha hatırlat: **`bash scripts/jira_run_cancel.sh`**
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace