---
name: jira-run-detailed
description: Opus Max ile Jira board'unu uzman gözüyle detaylı incele ve bakım yap — routing, kalite, öneriler, düzeltmeler hepsi tek seferde
argument-hint: "[odak konusu] — boş bırakılırsa genel audit + bakım"
disable-model-invocation: true
---

## Ne yapar

Opus Max ile **tek seferde** Jira board'unun tüm bakımını yapar. `jira-run-fast` gibi hızlı tur değil — her kartı derinlemesine okur, düzeltir, önerir.

**Kapsam (hepsi tek çalıştırmada):**

1. **Board routing & temizlik** — yanlış durumda kart varsa düzelt, stale IP temizle, BLOCKED/WAITING kontrol
2. **Kart kalite kontrolü** — description, kabul kriterleri, priority, label, duplikasyon
3. **Kart düzeltmeleri** — eksik description tamamla, yanlış priority/label düzelt, tutarsızlıkları gider
4. **WAITING/BLOCKED analizi** — neden bekliyor, çözüm önerisi, açılabilecekler
5. **Yeni task önerileri** — eksik feature, UX, teknik borç, test coverage
6. **Öncelik sıralaması** — hangi sırayla çalışılmalı önerisi

**Odak verilirse** o perspektiften bakar (ör. UX, performans, test). **Verilmezse** genel audit + bakım.

## Argüman

| Input | Davranış |
|-------|----------|
| `/jira-run-detailed` | Genel audit + bakım |
| `/jira-run-detailed UX` | UX odaklı |
| `/jira-run-detailed test coverage` | Test kapsama odaklı |
| `/jira-run-detailed teknik borç` | Teknik borç odaklı |
| `/jira-run-detailed öncelik sırası` | Önceliklendirme odaklı |

## Çalıştırma

**Model:** Opus Max — arka plan agent.

**Tek tur:** Döngü değil, tek seferlik derinlemesine analiz + bakım.

Ana oturum şu agent'ı başlatır:

```python
Agent(
  prompt=<aşağıdaki şablon>,
  model="opus",
  run_in_background=True,
  description="jira-run-detailed audit"
)
```

### Agent prompt şablonu

```
Sen bir Jira uzman danışmanısın. VO projesini derinlemesine analiz et VE bakımını yap.

cloudId: musabkara1990.atlassian.net
Proje: VO

ODAK: [varsa kullanıcının verdiği odak, yoksa "Genel audit + bakım"]

## ADIMLAR

### 1. TÜM aktif kartları çek (Done HARİÇ)
JQL sorgulari (Draft ve REFINE dahil — bunları ATLAMA):
- Draft: project = VO AND status = "Draft" AND key != VO-0
- REFINE: project = VO AND status = "REFINE" AND key != VO-0
- In Progress: project = VO AND status = "In Progress" AND key != VO-0
- To Do: project = VO AND status = "To Do" AND key != VO-0
- WAITING: project = VO AND status = "WAITING FOR APPROVAL"
- BLOCKED: project = VO AND status = "BLOCKED"
- Backlog: project = VO AND status = "Backlog"

**ÖNEMLİ:** Draft ve REFINE kartlarını da oku ve işle:
- Draft kartları: summary/description kalitesini kontrol et, eksikleri tamamla, label ekle
- REFINE kartları: detaylandırılması gereken kartlar, kabul kriterleri ve teknik notlar ekle

### 2. Her kartın DETAYINI oku (getJiraIssue)
Description, acceptance criteria, comments, labels, priority, subtask ilişkileri.

### 3. BOARD ROUTING & TEMİZLİK (hemen uygula)
- IP'de stale kart (lock yok, >1 saat) → WAITING veya To Do'ya taşı
- Yanlış durumda kart → doğru duruma taşı (transition)
- Tüm subtask'ları Done olan parent → Done'a taşı
- Duplikasyon → düşük priority olanı Backlog'a veya kapat
- Label tutarsızlığı → düzelt

### 4. KART KALİTE KONTROLÜ & DÜZELTMELERİ (hemen uygula)
Her kart için kontrol et ve gerekirse editJiraIssue ile düzelt:
- Description eksik/yetersiz → tamamla (yapılacaklar, teknik notlar)
- Kabul kriterleri yok → ekle
- Priority yanlış (ör. kritik bug Low'da) → düzelt
- Label eksik/yanlış → düzelt
- Tahmini efor çok büyük → parçalama önerisi (description'a not)

### 5. WAITING/BLOCKED ANALİZİ
- Neden bekliyor? Hala geçerli mi?
- Çözüm önerisi (comment olarak ekle)
- Açılabilecekler varsa → To Do'ya taşı

### 6. YENİ TASK ÖNERİLERİ (sadece raporla, oluşturma)
Odak perspektifinden (veya genel):
- Eksik feature'lar
- UX iyileştirmeleri
- Teknik borç
- Test coverage boşlukları
- Performans / erişilebilirlik
Her öneri: başlık, kısa açıklama, öncelik, tahmini efor

### 7. ÖNCELİK SIRASI ÖNERİSİ
Mevcut To Do kartları hangi sırayla çalışılmalı ve neden.

### 8. RAPOR YAZ (çıktı olarak)

## Board Sağlığı
- Genel durum (1 paragraf)
- Yapılan düzeltmeler listesi

## Kart Bazlı Notlar
- Sorun/düzeltme yapılan kartlar

## WAITING/BLOCKED Durumu
- Kart bazlı analiz ve öneriler

## Yeni Task Önerileri
| # | Başlık | Açıklama | Öncelik | Efor |
(tablo formatında)

## Öncelik Sırası
1. VO-XXX — sebep
2. VO-YYY — sebep
...

## KURALLAR
- Done kartlarına DOKUNMA
- Yeni task OLUŞTURMA — sadece öner (kullanıcı onaylarsa sonra oluşturulur)
- Mevcut kartlarda description/label/priority DÜZELT (editJiraIssue)
- Status transition YAPABILIRSIN (routing/temizlik için)
- Kod yazma, dosya düzenleme YAPMA
- Raporu detaylı ama okunabilir yaz
```

## Çıktı

Agent tamamlandığında rapor döner. Ana oturum:

1. Raporu kullanıcıya gösterir
2. Yapılan düzeltmeleri özetler
3. Yeni task önerileri varsa **3 seçenek** sunar:

```
Ne yapalım?
  1) Jira'da task olarak aç (onaylananları WAITING FOR APPROVAL'da oluşturur)
  2) Kenara not al (docs/tavsiyeler.md'ye ekler, Jira'ya dokunmaz)
  3) Hiçbir şey yapma (sadece rapor bilgi amaçlı)
```

- **Seçenek 1:** Kullanıcının onayladığı önerileri `createJiraIssue` ile WAITING FOR APPROVAL'da oluşturur (`vo-await-propose` label)
- **Seçenek 2:** Önerileri `docs/tavsiyeler.md` dosyasına tarih ve kaynak ile ekler
- **Seçenek 3:** Hiçbir işlem yapmaz, rapor bilgi amaçlıdır

## İlgili dosyalar

- [`docs/CLAUDE_JIRA.md`](../../../docs/CLAUDE_JIRA.md) — Jira protokolü
- [`.claude/skills/jira-run/SKILL.md`](../jira-run/SKILL.md) — Rutin jira-run (hızlı tur, farklı amaç)
- [`.claude/skills/jira-start-new-task/SKILL.md`](../jira-start-new-task/SKILL.md) — Task pipeline (kod yazma)
