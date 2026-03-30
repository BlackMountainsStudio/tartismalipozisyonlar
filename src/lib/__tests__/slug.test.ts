import { describe, it, expect } from "vitest";
import {
  buildMatchSlug,
  buildIncidentSlug,
  getShortIdFromIncidentSlug,
} from "../slug";

describe("buildMatchSlug", () => {
  it("builds correct slug for a match", () => {
    const slug = buildMatchSlug({
      league: "Süper Lig 2025-26",
      week: 10,
      date: new Date("2025-11-15"),
      homeTeam: "Galatasaray",
      awayTeam: "Fenerbahçe",
    });
    expect(slug).toContain("galatasaray");
    expect(slug).toContain("fenerbahce");
    expect(slug).toContain("10");
  });

  it("handles special Turkish characters", () => {
    const slug = buildMatchSlug({
      league: "Süper Lig 2025-26",
      week: 5,
      date: new Date("2025-10-01"),
      homeTeam: "Beşiktaş",
      awayTeam: "Trabzonspor",
    });
    expect(slug).toMatch(/besiktas/i);
    expect(slug).not.toContain("ş");
  });

  it("produces URL-safe slug (no spaces)", () => {
    const slug = buildMatchSlug({
      league: "Süper Lig 2025-26",
      week: 1,
      date: new Date("2025-08-10"),
      homeTeam: "Alanyaspor",
      awayTeam: "Kasımpaşa",
    });
    expect(slug).not.toContain(" ");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("buildIncidentSlug", () => {
  it("includes minute in slug", () => {
    const slug = buildIncidentSlug({
      id: "aabbccdd1122334455667788",
      minute: 45,
      description: "Penaltı pozisyonu tartışmalı",
    });
    expect(slug).toContain("45");
  });

  it("includes short description words", () => {
    const slug = buildIncidentSlug({
      id: "aabbccdd1122334455667788",
      minute: 70,
      description: "Kırmızı kart kararı",
    });
    expect(slug).toContain("kirmizi");
  });

  it("ends with short ID", () => {
    const id = "aabbccdd1122334455667788";
    const slug = buildIncidentSlug({ id, minute: 30, description: "test pozisyon" });
    const shortId = getShortIdFromIncidentSlug(slug);
    expect(shortId).toHaveLength(8);
  });
});

describe("getShortIdFromIncidentSlug", () => {
  it("extracts 8-char hex from the end of slug", () => {
    const shortId = getShortIdFromIncidentSlug("45-dk-penalti-pozisyonu-a1b2c3d4");
    expect(shortId).toBe("a1b2c3d4");
  });

  it("returns empty string if no short id found", () => {
    const shortId = getShortIdFromIncidentSlug("no-short-id-here");
    expect(shortId).toBe("");
  });
});
