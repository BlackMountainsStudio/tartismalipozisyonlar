/**
 * Keyword-based content filter for Turkish football context.
 * Flags obvious spam and profanity without over-blocking legitimate discussion.
 */

// Turkish/common profanity patterns — matched against normalised (ç→c, ş→s, etc.) lowercase text
const PROFANITY_PATTERNS: RegExp[] = [
  /\bam[kq]+\b/,
  /\bospu[rs]/,
  /\bsik+\b/,
  /\bg[o0]t\b/,
  /\bpic\b/,   // piç → pic after normalise
  /\borg[i1]ya/,
  /\bkalt[a4]k\b/,
  /\bser[i1]f\b/,  // sövme kısaltması
  /\bibn[e3]\b/,
];

// Turkish football jargon abuse — match on normalised text
// These are terms that escalate match discussions to threatening language
const FOOTBALL_ABUSE_PATTERNS: RegExp[] = [
  /\bvur[a-z]* (hakem|var|ref)\b/, // "vur hakemi" tarzı tahrik
  /\b(hakem|var|ref)\w* (sats[i1]n|satl[i1]k|sat[i1]ld[i1])\b/, // "hakem satıldı"
  /\b(ol[u0]m|olum) (dilek|dilerim|istiyorum)\b/, // ölüm dilemek
];

// Spam patterns: repetitive chars, all-caps rant, excessive punctuation
const SPAM_PATTERNS: RegExp[] = [
  /(.)\1{6,}/,          // 7+ repeated chars
  /[!?]{5,}/,           // 5+ exclamation/question marks
  /(https?:\/\/\S+){2,}/, // Multiple URLs
];

// Normalise Turkish chars for comparison
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export interface FilterResult {
  ok: boolean;
  reason?: string;
}

export function filterContent(text: string): FilterResult {
  if (!text || text.trim().length === 0) {
    return { ok: false, reason: "Yorum boş olamaz" };
  }

  if (text.trim().length < 3) {
    return { ok: false, reason: "Yorum çok kısa" };
  }

  const normalised = normalise(text);

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalised)) {
      return { ok: false, reason: "Yorumunuz uygunsuz içerik barındırıyor" };
    }
  }

  for (const pattern of FOOTBALL_ABUSE_PATTERNS) {
    if (pattern.test(normalised)) {
      return { ok: false, reason: "Yorumunuz tartışma kurallarını ihlal ediyor" };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason: "Yorumunuz spam olarak algılandı" };
    }
  }

  // Ratio of uppercase to total alpha chars (>70% = potential spam/shouting)
  const alpha = text.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, "");
  if (alpha.length > 20) {
    const upperRatio = (text.match(/[A-ZĞÜŞÖÇİ]/g) ?? []).length / alpha.length;
    if (upperRatio > 0.7) {
      return { ok: false, reason: "Yorumunuz spam olarak algılandı" };
    }
  }

  return { ok: true };
}
