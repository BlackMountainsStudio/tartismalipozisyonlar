# Accessibility (a11y) Analiz Raporu (Kısmen)

**Proje:** Var Odası — Next.js 16, React 19, Tailwind CSS v4
**Tarih:** 2026-03-30
**Mod:** Hafif tarama (max 12 tool call)

---

## Mevcut Durum — Puan: 5/10

Proje temel HTML yapisi acisindan bazi olumlu noktalar iceriyor ancak sistematik bir a11y stratejisi uygulanmamis.

---

## Olumlu Bulgular

| Alan | Bulgu |
|------|-------|
| `lang` attribute | `<html lang="tr">` dogru sekilde tanimli |
| Semantic layout | `<main>`, `<nav>`, `<footer>`, `<section>` etiketleri kullaniliyor |
| Heading hiyerarsisi | `h1` > `h2` > `h3` sirasi ana sayfada genel olarak korunmus |
| Form label/input | `oneri/page.tsx` ve `giris/page.tsx` sayfalarindaki formlar `htmlFor`/`id` iliskisini dogru kullaniyor |
| Yorum textarea | `CommentSection.tsx` — `<label htmlFor="comment">` ile `<textarea id="comment">` eslestirilmis |
| Modal ARIA | `AuthModal.tsx` — `role="dialog"`, `aria-modal="true"`, `aria-labelledby` dogru uygulanmis |
| Mobile menu button | `Navbar.tsx` — `aria-label="Menu"` mevcut |
| Viewport | `maximumScale: 5` — zoom engellenmemis, WCAG uyumlu |

---

## Kritik Eksikler ve Iyilestirme Onerileri

| # | Alan | Sorun | Ciddiyet | Onerilen Duzeltme |
|---|------|-------|----------|-------------------|
| 1 | **Skip navigation link** | "Skip to main content" linki yok. Klavye kullanicilari her sayfada tum navbar linklerini tab ile gecmek zorunda. | Kritik | `layout.tsx` icinde `<a href="#main-content" className="sr-only focus:not-sr-only ...">Icerige atla</a>` ekle |
| 2 | **Arama input label** | Arama inputunda gorunur veya sr-only `<label>` yok. Sadece `placeholder` var. | Kritik | `<label htmlFor="search" className="sr-only">Mac ara</label>` ekle |
| 3 | **Yanit textarea label** | Yanitlama textarea'sinda `<label>` yok, sadece `placeholder` var. | Yuksek | `aria-label` veya `sr-only` label ekle |
| 4 | **Focus gostergeleri** | Tum input/button elemanlari `outline-none` kullaniyor; butonlarda hicbir focus stili tanimlanmamis. | Kritik | Her interaktif elemana `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2` ekle |
| 5 | **Renk kontrasti** | `text-zinc-600` (#52525b) koyu arka plan uzerinde ~2.3:1 (WCAG AA basarisiz). Tarihlerde, karakter sayacilarinda yaygin. | Yuksek | `text-zinc-600` → en az `text-zinc-400`'e yukseltin |
| 6 | **Dekoratif ikonlarin aria gizlenmesi** | Lucide ikonlari `aria-hidden` olmadan render ediliyor. | Orta | Dekoratif ikonlara `aria-hidden="true"` ekle |
| 7 | **Buton icerik eksikligi** | Bazi butonlarda sadece ikon var, `aria-label` yok. Sikayet butonu sadece `<Flag>` ikonu iceriyor. | Yuksek | Tum ikon-only butonlara `aria-label` ekle |
| 8 | **Mobile menu state** | Hamburger menu butonunda `aria-expanded` attribute'u yok. | Yuksek | `aria-expanded={mobileMenuOpen}` ekle |
| 9 | **Modal focus trap** | `AuthModal.tsx` — klavye focus trap'i uygulanmamis. Tab tusuna basinca focus modal disina cikabilir. | Yuksek | `useEffect` ile focus trap uygula veya `@headlessui/react` Dialog kullan |
| 10 | **Loading/spinner erisilebilirligi** | Loader ikonlari icin `role="status"` ve `aria-label` yok. | Orta | `role="status"` ve `<span className="sr-only">Yukleniyor</span>` ekle |
| 11 | **Oy butonlarinda secili state** | Oy butonlarinda `aria-pressed` yok. | Orta | `aria-pressed={isUserVote}` ekle |
| 12 | **Verdict butonlari radio grubu** | Karar butonlari gorsel olarak radio gibi calisiyor ama semantik olarak bagimsiz butonlar. | Orta | `role="radiogroup"` container, butonlara `role="radio"` + `aria-checked` ekle |
| 13 | **Responsive text sizing** | `text-[10px]` kullanimlari var. | Orta | 10px metin boyutunu en az 12px'e cikarin |

---

## Oncelik Sirasi

1. Skip navigation link ekle
2. Focus gostergeleri tum interaktif elemanlarda duzelt
3. Arama ve yanit textarea icin label ekle
4. Mobile menu `aria-expanded` ekle
5. Ikon-only butonlara `aria-label` ekle
6. Modal focus trap uygula
7. Renk kontrastlarini iyilestir
