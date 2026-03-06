import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.match.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} matches, skipping seed.`);
    return;
  }

  console.log("Seeding database with demo data...");

  const match1 = await prisma.match.create({
    data: {
      homeTeam: "Fenerbahçe",
      awayTeam: "Trabzonspor",
      league: "Süper Lig",
      week: 12,
      date: new Date("2026-03-10"),
    },
  });

  const match2 = await prisma.match.create({
    data: {
      homeTeam: "Galatasaray",
      awayTeam: "Beşiktaş",
      league: "Süper Lig",
      week: 12,
      date: new Date("2026-03-09"),
    },
  });

  const match3 = await prisma.match.create({
    data: {
      homeTeam: "Fenerbahçe",
      awayTeam: "Galatasaray",
      league: "Süper Lig",
      week: 10,
      date: new Date("2026-02-22"),
    },
  });

  const match4 = await prisma.match.create({
    data: {
      homeTeam: "Galatasaray",
      awayTeam: "Antalyaspor",
      league: "Süper Lig",
      week: 11,
      date: new Date("2026-03-01"),
    },
  });

  const match5 = await prisma.match.create({
    data: {
      homeTeam: "Başakşehir",
      awayTeam: "Fenerbahçe",
      league: "Süper Lig",
      week: 11,
      date: new Date("2026-03-02"),
    },
  });

  await prisma.incident.createMany({
    data: [
      {
        matchId: match1.id,
        minute: 34,
        type: "POSSIBLE_PENALTY",
        description:
          "Ceza sahasında belirgin el teması tespit edildi. Hakem penaltı vermedi. Reddit ve Ekşi Sözlük'te yoğun tartışma yaşandı.",
        confidenceScore: 0.87,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/fb_ts_penalty",
          "https://eksisozluk.com/fenerbahce-trabzonspor-penalti",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match1.id,
        minute: 67,
        type: "VAR_CONTROVERSY",
        description:
          "VAR incelemesi beklenen pozisyonda VAR devreye girmedi. Taraftarlar VAR kayıtlarının yayınlanmasını talep etti.",
        confidenceScore: 0.72,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/fb_ts_var",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match1.id,
        minute: 78,
        type: "MISSED_RED_CARD",
        description:
          "Arkadan yapılan sert müdahaleye sadece sarı kart gösterildi. Pozisyon kırmızı kart niteliğinde değerlendirildi.",
        confidenceScore: 0.65,
        sources: JSON.stringify([
          "https://eksisozluk.com/fenerbahce-trabzonspor-kirmizi-kart",
        ]),
        status: "PENDING",
      },
      {
        matchId: match2.id,
        minute: 23,
        type: "POSSIBLE_OFFSIDE_GOAL",
        description:
          "Gol pozisyonunda ofsayt itirazı yapıldı. Tekrarlar, oyuncunun ofsayt pozisyonunda olabileceğini gösterdi.",
        confidenceScore: 0.78,
        sources: JSON.stringify([
          "https://reddit.com/r/galatasaray/gs_bjk_offside",
          "https://eksisozluk.com/galatasaray-besiktas-ofsayt",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match2.id,
        minute: 55,
        type: "POSSIBLE_PENALTY",
        description:
          "Ceza sahasında düşürülen oyuncu için penaltı beklentisi oluştu. Hakem devam kararı verdi.",
        confidenceScore: 0.69,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/gs_bjk_penalty_55",
        ]),
        status: "PENDING",
      },
      {
        matchId: match2.id,
        minute: 89,
        type: "VAR_CONTROVERSY",
        description:
          "Son dakikada tartışmalı gol kararı. VAR uzun süre inceledi ancak golü geçerli saydı.",
        confidenceScore: 0.83,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/gs_bjk_var_89",
          "https://eksisozluk.com/galatasaray-besiktas-var-skandali",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match3.id,
        minute: 12,
        type: "POSSIBLE_PENALTY",
        description:
          "Derbi'nin erken dakikalarında tartışmalı penaltı pozisyonu. Ev sahibi taraftarlar net penaltı iddiasında.",
        confidenceScore: 0.91,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/fb_gs_derbi_penalty",
          "https://eksisozluk.com/fenerbahce-galatasaray-penalti",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match3.id,
        minute: 45,
        type: "MISSED_RED_CARD",
        description:
          "İlk yarının son dakikasında sert faul. Direk kırmızı kart beklenen pozisyonda sarı kart çıktı.",
        confidenceScore: 0.74,
        sources: JSON.stringify([
          "https://eksisozluk.com/fb-gs-kirmizi-kart",
        ]),
        status: "PENDING",
      },
      {
        matchId: match3.id,
        minute: 82,
        type: "VAR_CONTROVERSY",
        description:
          "VAR ile iptal edilen gol büyük tartışma yarattı. Ofsayt çizgisi çekimi sorgulanıyor.",
        confidenceScore: 0.88,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/fb_gs_var_goal",
          "https://eksisozluk.com/fb-gs-var-gol-iptali",
        ]),
        status: "APPROVED",
      },
      {
        matchId: match4.id,
        minute: 41,
        type: "POSSIBLE_PENALTY",
        description:
          "Defans oyuncusunun elle müdahalesi tartışıldı. VAR incelemesi sonucu penaltı verilmedi.",
        confidenceScore: 0.58,
        sources: JSON.stringify([
          "https://eksisozluk.com/gs-antalya-penalti",
        ]),
        status: "REJECTED",
      },
      {
        matchId: match5.id,
        minute: 63,
        type: "VAR_CONTROVERSY",
        description:
          "Tartışmalı pozisyonda VAR kararı büyük tepki çekti. Hakemin VAR ekranına gitmemesi eleştirildi.",
        confidenceScore: 0.76,
        sources: JSON.stringify([
          "https://reddit.com/r/superlig/basaksehir_fb_var",
          "https://eksisozluk.com/basaksehir-fenerbahce-var",
        ]),
        status: "PENDING",
      },
      {
        matchId: match5.id,
        minute: 71,
        type: "POSSIBLE_OFFSIDE_GOAL",
        description:
          "Gol ofsayt gerekçesiyle iptal edildi ancak tekrarlar net bir ofsayt göstermiyor.",
        confidenceScore: 0.67,
        sources: JSON.stringify([
          "https://eksisozluk.com/basaksehir-fb-ofsayt-gol",
        ]),
        status: "PENDING",
      },
    ],
  });

  console.log("Seed completed:");
  console.log("  - 5 matches created");
  console.log("  - 12 incidents created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
