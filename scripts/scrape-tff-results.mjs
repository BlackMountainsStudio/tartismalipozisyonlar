import { chromium } from "playwright";

const TARGET_TEAMS = ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"];
const MAX_WEEK = 27;

const TEAM_MAP = [
  [/fenerbah[çcÇC]e/i, "Fenerbahçe"],
  [/galatasaray/i, "Galatasaray"],
  [/be[şsŞS][ıiİI]kta[şsŞS]/i, "Beşiktaş"],
  [/trabzonspor/i, "Trabzonspor"],
];

function normalizeTeam(raw) {
  const cleaned = raw.replace(/\s+A\.Ş\.?\s*$/i, "").trim();
  for (const [re, canonical] of TEAM_MAP) {
    if (re.test(cleaned)) return canonical;
  }
  return cleaned
    .replace(/^(?:TRENDYOL|RAMS|HESAP\.COM(?:\.TR)?|CORENDON|TÜMOSAN|ZECORNER|İKAS|MISIRLI\.COM\.TR|NATURA DÜNYASI)\s+/i, "")
    .replace(/\s+FUTBOL KULÜBÜ$/i, "")
    .trim();
}

function isTargetTeam(name) {
  return TARGET_TEAMS.includes(normalizeTeam(name));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.error("Loading TFF fixture page...");
  await page.goto("https://www.tff.org/Default.aspx?pageID=198&hafta=1", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  const rawMatches = await page.evaluate((maxWeek) => {
    const weekTables = document.querySelectorAll("table.softBG");
    const results = [];

    for (const wt of weekTables) {
      const header = wt.querySelector(".belirginYazi");
      if (!header) continue;
      const weekMatch = header.textContent.trim().match(/^(\d+)\./);
      if (!weekMatch) continue;
      const week = parseInt(weekMatch[1]);
      if (week > maxWeek) continue;

      const innerTable = wt.querySelector('table[cellpadding="1"]');
      if (!innerTable) continue;

      for (const row of innerTable.rows) {
        const cells = row.cells;
        if (cells.length < 3) continue;

        const homeLinks = cells[0].querySelectorAll("a");
        const scoreLinks = cells[1].querySelectorAll("a");
        const awayLinks = cells[2].querySelectorAll("a");

        const homeRaw = homeLinks.length ? homeLinks[0].textContent.trim() : cells[0].textContent.trim();
        const awayRaw = awayLinks.length ? awayLinks[0].textContent.trim() : cells[2].textContent.trim();
        const scoreRaw = scoreLinks.length ? scoreLinks[0].textContent.trim() : cells[1].textContent.trim();
        const score = scoreRaw.replace(/\s+/g, " ").replace(/\s*-\s*/, " - ");

        let macId = null;
        if (scoreLinks.length) {
          const href = scoreLinks[0].getAttribute("href") || "";
          const m = href.match(/macId=(\d+)/);
          if (m) macId = m[1];
        }

        results.push({ week, homeRaw, awayRaw, score, macId });
      }
    }
    return results;
  }, MAX_WEEK);

  console.error(`Found ${rawMatches.length} total matches for weeks 1-${MAX_WEEK}`);

  const filtered = rawMatches.filter(
    (m) => isTargetTeam(m.homeRaw) || isTargetTeam(m.awayRaw)
  );
  console.error(`Filtered to ${filtered.length} matches involving big-4 teams`);

  const results = [];
  for (let i = 0; i < filtered.length; i++) {
    const m = filtered[i];
    let date = "";

    if (m.macId) {
      try {
        const detailPage = await context.newPage();
        await detailPage.goto(
          `https://www.tff.org/Default.aspx?pageID=29&macId=${m.macId}`,
          { waitUntil: "networkidle", timeout: 20000 }
        );
        date = await detailPage.evaluate(() => {
          const text = document.body.innerText;
          const dm = text.match(/(\d{1,2}\.\d{2}\.\d{4})\s*-\s*(\d{2}:\d{2})/);
          return dm ? dm[1] : "";
        });
        await detailPage.close();
      } catch {
        console.error(`  Failed to load detail for macId=${m.macId}`);
      }
    }

    results.push({
      week: m.week,
      date,
      home: normalizeTeam(m.homeRaw),
      away: normalizeTeam(m.awayRaw),
      score: m.score,
    });

    if ((i + 1) % 10 === 0) console.error(`  Progress: ${i + 1}/${filtered.length}`);
  }

  results.sort((a, b) => a.week - b.week);

  const played = results.filter((m) => /\d+\s*-\s*\d+/.test(m.score));
  const unplayed = results.filter((m) => !/\d+\s*-\s*\d+/.test(m.score));
  if (unplayed.length) console.error(`Excluded ${unplayed.length} unplayed match(es)`);

  const stats = {};
  for (const t of TARGET_TEAMS) stats[t] = { played: 0, wins: 0, draws: 0, losses: 0, points: 0 };

  for (const m of played) {
    const parts = m.score.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!parts) continue;
    const hg = parseInt(parts[1]);
    const ag = parseInt(parts[2]);

    for (const side of ["home", "away"]) {
      const team = m[side];
      if (!stats[team]) continue;
      stats[team].played++;
      const isHome = side === "home";
      const gf = isHome ? hg : ag;
      const ga = isHome ? ag : hg;
      if (gf > ga) { stats[team].wins++; stats[team].points += 3; }
      else if (gf === ga) { stats[team].draws++; stats[team].points += 1; }
      else { stats[team].losses++; }
    }
  }

  console.log(JSON.stringify({ matches: played, standings: stats }, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
