/**
 * Harici linkler için anlamlı etiketler (görünürlük ve erişilebilirlik).
 */

export function getVideoProviderName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("beinsports.com.tr")) return "beIN Sports";
    return host;
  } catch {
    return "Kaynak";
  }
}

/** Kart veya liste için: "YouTube'da pozisyonu izle", "beIN Sports'ta izle" vb. */
export function getVideoLinkLabel(url: string): string {
  const provider = getVideoProviderName(url);
  if (provider === "YouTube") return "YouTube'da pozisyonu izle";
  if (provider === "beIN Sports") return "beIN Sports'ta izle";
  return `${provider} – Videoyu izle`;
}

/** Yeni sekmede aç linki için: "YouTube'da aç", "beIN Sports'ta aç" vb. */
export function getOpenInNewTabLabel(url: string): string {
  const provider = getVideoProviderName(url);
  if (provider === "YouTube") return "YouTube'da aç";
  if (provider === "beIN Sports") return "beIN Sports'ta aç";
  return "Videoyu yeni sekmede aç";
}

/** Kaynak listesi için anlamlı etiket (haber, video, arama). */
export function getSourceLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("beinsports.com.tr")) {
      if (u.pathname.includes("pozisyonlar") || u.pathname.includes("ozet")) return "beIN Sports – Pozisyon / maç videosu";
      return "beIN Sports";
    }
    if (host.includes("youtube.com")) {
      if (u.pathname.includes("/shorts/")) return "YouTube Shorts – Pozisyon videosu";
      if (u.pathname.includes("/results")) return "YouTube – Bu pozisyonu ara";
      return "YouTube – Video";
    }
    if (host.includes("youtu.be")) return "YouTube – Video";
    if (host.includes("hurriyet.com.tr")) return "Hürriyet – Haber / Trio yorumu";
    if (host.includes("yenicaggazetesi.com")) return "Yeni Çağ – Haber / hakem yorumu";
    if (host.includes("milliyet.com.tr")) return "Milliyet – Haber";
    if (host.includes("fanatik.com.tr")) return "Fanatik – Haber";
    if (host.includes("sporx.com")) return "Sporx – Haber";
    return host;
  } catch {
    return "Kaynak";
  }
}

/** Uzman yorumu kaynak linki: "Bu yorumun kaynağı" yerine kısa etiket. */
export function getOpinionSourceLabel(url: string): string {
  const label = getSourceLabel(url);
  return label !== "Kaynak" ? `${label} – Kaynağa git` : "Kaynağa git";
}
