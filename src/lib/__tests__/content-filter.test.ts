import { describe, it, expect } from "vitest";
import { filterContent } from "../content-filter";

describe("filterContent", () => {
  it("passes clean Turkish football comment", () => {
    expect(filterContent("Penaltı kararı çok yanlıştı, hakem hata yaptı.").ok).toBe(true);
  });

  it("rejects empty string", () => {
    const result = filterContent("");
    expect(result.ok).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("rejects whitespace-only input", () => {
    expect(filterContent("   ").ok).toBe(false);
  });

  it("rejects too-short input", () => {
    expect(filterContent("ok").ok).toBe(false);
  });

  it("rejects excessive repeated characters", () => {
    expect(filterContent("AAAAAAAAAA bu çok saçma!!!").ok).toBe(false);
  });

  it("rejects excessive exclamation marks", () => {
    expect(filterContent("Bu karar yanlış!!!!!!!!").ok).toBe(false);
  });

  it("rejects all-caps rant (>70% uppercase)", () => {
    expect(filterContent("BU KARAR TAMAMEN YANLIŞ VE HAKSIZ BİR KARAR").ok).toBe(false);
  });

  it("passes mixed-case text", () => {
    expect(filterContent("Bu karar tartışmalı ama anlayışla karşılanabilir.").ok).toBe(true);
  });

  it("rejects profanity pattern (normalized)", () => {
    const result = filterContent("piç gibi bir karar");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("uygunsuz");
  });

  it("passes long clean comment", () => {
    const longComment =
      "VAR müdahalesi yerinde bir karardı çünkü topu tutma pozisyonunda ayak hareketi net görünüyordu. " +
      "Yorumcu görüşleri de bunu destekler nitelikte. Hakemin kararını destekliyorum.";
    expect(filterContent(longComment).ok).toBe(true);
  });
});
