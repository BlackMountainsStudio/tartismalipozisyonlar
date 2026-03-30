# Growth & User Engagement Analiz Raporu — Var Odasi (varodasi.com)

**Tarih:** 2026-03-30
**Mod:** Tam analiz (proje taramasi + web arastirmasi)

## Mevcut Durum: 3.5/10

### Mevcut Varliklar
- Yorum sistemi (yanit + sikayet)
- Verdict oylama (Dogru/Yanlis/Emin degilim)
- Fan oylama (VoteSection)
- Profil sayfasi (avatar, nickname, yorumlarim)
- Auth altyapisi (Google OAuth + email)
- OpenGraph image
- Oneri formu
- Vercel Analytics + Speed Insights

## Kritik Eksikler

| # | Eksik | Kategori | Etki | Efor |
|---|-------|----------|------|------|
| 1 | Sosyal paylasim butonlari YOK | Viral Growth | High | S |
| 2 | Gamification sistemi YOK | Retention | High | L |
| 3 | Bildirim altyapisi YOK | Retention | High | M |
| 4 | Onboarding akisi YOK | Activation | High | M |
| 5 | UGC paylasim tesviki YOK | Viral Growth | High | S |
| 6 | Leaderboard YOK | Engagement | High | M |
| 7 | Takim bazli topluluk YOK | Community | Med | M |
| 8 | Streak mekanizmasi YOK | Retention | Med | S |
| 9 | Email marketing YOK | Retention | Med | M |
| 10 | Dinamik OG image YOK | Viral Growth | Med | S |
| 11 | Referral sistemi YOK | Acquisition | Med | M |
| 12 | Canli mac etklesimi YOK | Engagement | Med | L |
| 13 | Tahmin oyunu YOK | Gamification | High | M |

## P0 — Ilk 30 Gun

| # | Ozellik | Etki | Efor |
|---|---------|------|------|
| 1 | Sosyal Paylasim Butonlari (WhatsApp, X, Telegram) | High | S |
| 2 | Dinamik OG Image (pozisyon bazli) | High | S |
| 3 | Basit Onboarding (3 adim: takim sec, bildirim, ilk oy) | High | S |
| 4 | "Benim Kararim" Paylasilabilir Kart | High | S |

## P1 — 30-90 Gun

| # | Ozellik | Etki | Efor |
|---|---------|------|------|
| 5 | Puan + Rozet Sistemi | High | M |
| 6 | Leaderboard (haftalik/aylik/sezonluk) | High | M |
| 7 | Bildirim Sistemi (In-App + Email) | High | M |
| 8 | Tahmin Oyunu | High | M |
| 9 | Takim Profili / Favori Takim | Med | S |

## P2 — 90+ Gun

| # | Ozellik | Etki | Efor |
|---|---------|------|------|
| 10 | Referral Sistemi | Med | M |
| 11 | Canli Mac Modu (WebSocket/SSE) | Med | L |
| 12 | Sezonluk Lig / Turnuva | Med | L |
| 13 | Streak Mekanizmasi | Med | S |
| 14 | Kullanici Itibar Sistemi | Low | M |
| 15 | PWA + Mobil Bildirim | Med | M |

## Viral Loop Tasarimi

```
Oy ver → "Kararimi Paylas" karti → WhatsApp/X paylas → Arkadas tiklar
→ Pozisyonu gorur → Kayit ol → Kendi oylar → Paylas dongusu
```

## Retention Stratejisi

| Zaman | Mekanizma | Hedef |
|-------|-----------|-------|
| Gun 0 | Onboarding + ilk oy | Aktivasyon |
| Gun 1-3 | "Yorumuna yanit" bildirimi | Erken donus |
| Gun 7 | Haftalik mac ozeti email | Aliskanlik |
| Mac gunu | Push: "2 tartismali pozisyon tespit edildi" | Event-driven |
| Gun 30+ | Streak odulleri + aylik leaderboard | Uzun vade |
| 14+ gun pasif | Re-engagement email | Win-back |

## Turkiye Pazarina Ozel Notlar
1. WhatsApp oncelikli paylasim
2. Takim kimlikli tasarim (profilde takim secimi)
3. Tartisma kulturu dogal uyum
4. Mac gunu yogunlugu (Cmt-Pzr 19-21)
5. Mobil agirlikli (%80) — PWA sart

## Referanslar
- Fan Engagement Ultimate Guide 2025 — Infobip
- Gamification in Sports Marketing — Brandmovers
- Growth Engineering Sports Apps +50% Retention — SportFirst
- Viral Growth via Retention — Andrew Chen
- Turkish Football Fans Using Data — turkish-football.com
- Push Notification Best Practices Sports — iZooto
- Digital Fan Engagement — PwC
