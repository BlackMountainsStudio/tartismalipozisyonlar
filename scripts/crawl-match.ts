#!/usr/bin/env npx tsx
/**
 * Maç Tarayıcı - Tartışmalı Pozisyonları Toplama
 *
 * Kullanım:
 *   npm run crawl:match <matchId>
 *   npm run crawl:match <evSahibiTakim> <deplasmanTakim>
 *
 * Örnek:
 *   npm run crawl:match Fenerbahçe Galatasaray
 *   npm run crawl:match clxyz123abc
 *
 * Reddit ve Ekşi Sözlük'ten maç tartışmalarını toplar,
 * AI ile tartışmalı pozisyonları tespit eder ve veritabanına kaydeder.
 */

import "dotenv/config";
import { prisma } from "@/database/db";
import { CrawlerOrchestrator } from "@/crawler";
import {
  detectIncidents,
  detectIncidentsLocal,
  mapIncidentType,
} from "@/agents/incidentDetector";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
Maç Tarayıcı - Tartışmalı Pozisyonları Toplama

Kullanım:
  npm run crawl:match <matchId>
  npm run crawl:match <evSahibiTakim> <deplasmanTakim>

Örnek:
  npm run crawl:match Fenerbahçe Galatasaray
  npm run crawl:match clxyz123abc

Gereksinimler:
  - .env dosyasında DATABASE_URL tanımlı olmalı
  - Reddit: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET (opsiyonel)
  - AI analizi: OPENAI_API_KEY (opsiyonel, yoksa keyword tabanlı tespit)
`);
    process.exit(1);
  }

  let matchId: string;
  let homeTeam: string;
  let awayTeam: string;

  if (args.length === 1) {
    matchId = args[0];
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      console.error(`Maç bulunamadı: ${matchId}`);
      process.exit(1);
    }
    homeTeam = match.homeTeam;
    awayTeam = match.awayTeam;
    console.log(`\n📋 Maç: ${homeTeam} vs ${awayTeam} (ID: ${matchId})\n`);
  } else {
    homeTeam = args[0];
    awayTeam = args[1];
    let match = await prisma.match.findFirst({
      where: { homeTeam, awayTeam },
      orderBy: { date: "desc" },
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          homeTeam,
          awayTeam,
          league: "Süper Lig",
          week: 0,
          date: new Date(),
          note: "Tarayıcı ile oluşturuldu",
        },
      });
      console.log(`\n➕ Yeni maç oluşturuldu: ${homeTeam} vs ${awayTeam}\n`);
    } else {
      console.log(`\n📋 Maç: ${homeTeam} vs ${awayTeam} (ID: ${match.id})\n`);
    }
    matchId = match.id;
  }

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  console.log(hasOpenAI ? "🤖 AI modu: OpenAI ile analiz" : "📝 Yerel mod: Keyword tabanlı tespit");
  console.log("⏳ Reddit ve Ekşi Sözlük taranıyor...\n");

  const orchestrator = new CrawlerOrchestrator(2);
  orchestrator.addJob(homeTeam, awayTeam, matchId);
  const resultsMap = await orchestrator.processQueue();
  const results = resultsMap.get(matchId) ?? [];

  const allComments: string[] = [];
  const crawlEntries: { source: string; url: string; rawContent: string }[] = [];

  for (const result of results) {
    crawlEntries.push({
      source: result.source,
      url: result.url,
      rawContent: result.content,
    });
    if (result.source === "reddit") {
      const r = result as { comments: { body: string }[] };
      allComments.push(...r.comments.map((c) => c.body));
    } else if (result.source === "eksisozluk") {
      const e = result as { entries: { body: string }[] };
      allComments.push(...e.entries.map((ent) => ent.body));
    }
  }

  console.log(`📥 ${crawlEntries.length} kaynak, ${allComments.length} yorum toplandı\n`);

  if (allComments.length === 0) {
    console.log("⚠️  Tartışma bulunamadı. Farklı arama terimleri deneyin veya maç henüz oynanmamış olabilir.");
    process.exit(0);
  }

  const matchContext = `${homeTeam} vs ${awayTeam}`;
  const detectedIncidents = hasOpenAI
    ? await detectIncidents(allComments, matchContext)
    : detectIncidentsLocal(allComments, matchContext);

  for (const incident of detectedIncidents) {
    await prisma.incident.create({
      data: {
        matchId,
        minute: incident.minute,
        type: mapIncidentType(incident.type),
        description: incident.description,
        confidenceScore: incident.confidence,
        sources: JSON.stringify(crawlEntries.map((e) => e.url)),
      },
    });
  }

  console.log(`\n✅ Tamamlandı!`);
  console.log(`   📊 ${detectedIncidents.length} tartışmalı pozisyon tespit edildi`);
  console.log(`   🔗 Kaynaklar: ${crawlEntries.length}`);
  if (detectedIncidents.length > 0) {
    console.log(`\n   Tespit edilen pozisyonlar:`);
    for (const inc of detectedIncidents) {
      const dk = inc.minute != null ? `${inc.minute}'` : "?";
      console.log(`   • ${inc.type} (${dk}): ${inc.description.slice(0, 60)}...`);
    }
  }
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
