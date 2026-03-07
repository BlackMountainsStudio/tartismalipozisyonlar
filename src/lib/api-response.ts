/** API yanıtlarında cache önlemek için kullanılır - güncel veri garantisi */
export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
} as const;
