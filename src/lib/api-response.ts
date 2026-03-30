/** API yanıtlarında cache önlemek için kullanılır - güncel veri garantisi */
export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
} as const;

/** Public listeleme endpoint'leri için CDN cache (60s fresh, 300s stale-while-revalidate) */
export const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

/** Daha uzun süreli cache gerektiren statik-ish listeler (hakemler, yorumcular) */
export const LONG_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;
