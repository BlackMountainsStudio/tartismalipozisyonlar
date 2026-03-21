/**
 * Import controversial positions from beIN SPORTS Trio episodes into the DB.
 * Maps Trio video IDs to matches and creates incidents with video sources.
 */

const BASE = "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin-secret";
const headers = { "Content-Type": "application/json", "x-admin-token": ADMIN_SECRET };

const TRIO_INCIDENTS = [
  // ── Week 1 ──
  {
    home: "GAZİANTEP", away: "Galatasaray", week: 1,
    videoId: "kCRn1UfxAkg",
    incidents: [
      { minute: 28, type: "PENALTY", description: "Gaziantep'li Sallai, Rodrigues'i şiddetli bir şekilde çekti. VAR müdahalesi sonrası penaltı kararı verildi. Trio ekibi kararı doğru buldu.", confidenceScore: 0.92, inFavorOf: "Galatasaray", against: "GAZİANTEP", varIntervention: true, refereeDecision: "PENALTY" },
      { minute: 55, type: "POSSIBLE_PENALTY", description: "Gaziantep FK'nin penaltı beklediği pozisyon. Trio ekibi hakem Ali Şansalan'ın devam kararını doğru buldu.", confidenceScore: 0.65, inFavorOf: "GAZİANTEP", against: "Galatasaray", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Trabzonspor", away: "KOCAELİSPOR", week: 1,
    videoId: "F_EvFVwcZjg",
    incidents: [
      { minute: 38, type: "FOUL", description: "Trabzonspor lehine verilen faul kararı tartışıldı. Trio ekibi pozisyonu değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Trabzonspor", against: "KOCAELİSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 3 ──
  {
    home: "Fenerbahçe", away: "KOCAELİSPOR", week: 3,
    videoId: "LiBU6VmCveA",
    incidents: [
      { minute: 62, type: "POSSIBLE_PENALTY", description: "Fenerbahçe ceza sahasında tartışmalı müdahale pozisyonu. Hakem devam kararı verdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "KOCAELİSPOR", refereeDecision: "CONTINUE" },
    ]
  },
  // ── Week 5 ──
  {
    home: "Fenerbahçe", away: "Trabzonspor", week: 5,
    videoId: "mz5UlADX0P8",
    incidents: [
      { minute: 11, type: "GOAL_DISALLOWED", description: "Onuachu'nun köşe vuruşundan attığı gol faul gerekçesiyle iptal edildi. VAR müdahalesi sonrası karar korundu. Trio'da Bahattin Duran 'kontrolsüz hamle, faul yok' diyerek kararı eleştirdi.", confidenceScore: 0.88, inFavorOf: "Fenerbahçe", against: "Trabzonspor", varIntervention: true, refereeDecision: "FOUL" },
      { minute: 20, type: "RED_CARD", description: "Okay Yokuşlu'nun Szymanski'ye müdahalesi VAR incelemesiyle sarı karttan kırmızı karta çevrildi. Trio ekibi kararı tartıştı.", confidenceScore: 0.85, inFavorOf: "Fenerbahçe", against: "Trabzonspor", varIntervention: true, refereeDecision: "RED_CARD" },
      { minute: 47, type: "POSSIBLE_PENALTY", description: "Szymanski ceza sahasında Baniya tarafından müdahaleye uğradı. Fenerbahçe penaltı istedi ancak hakem korner kararı verdi. VAR müdahale etmedi.", confidenceScore: 0.75, inFavorOf: "Fenerbahçe", against: "Trabzonspor", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Beşiktaş", away: "BAŞAKŞEHİR", week: 5,
    videoId: "1-I6sFoUp1A",
    incidents: [
      { minute: 32, type: "FOUL", description: "Beşiktaş-Başakşehir maçında tartışılan faul kararı. Trio ekibi pozisyonu değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Beşiktaş", against: "BAŞAKŞEHİR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 8 ── (Galatasaray - Beşiktaş)
  {
    home: "Galatasaray", away: "Beşiktaş", week: 8,
    videoId: "dweZe2IPp1o",
    incidents: [
      { minute: 34, type: "RED_CARD", description: "Davinson Sánchez, Rafa Silva'ya ceza sahasına girmeden arkadan müdahale ederek bariz gol şansını engelledi. Direkt kırmızı kart gördü ve Galatasaray 10 kişi kaldı.", confidenceScore: 0.9, inFavorOf: "Beşiktaş", against: "Galatasaray", refereeDecision: "RED_CARD" },
      { minute: 65, type: "VAR_CONTROVERSY", description: "Beşiktaş'ın oyuncu değişiklikleri sırasında hakem oyunu talimatlara aykırı şekilde durdurdu. Deniz Çoban'a göre TFF maçı baştan tekrar oynatabilir.", confidenceScore: 0.82, inFavorOf: "Beşiktaş", against: "Galatasaray", refereeDecision: "CONTINUE" },
      { minute: 70, type: "MISSED_RED_CARD", description: "Osimhen'in 2, Emirhan'ın 1 kırmızı kartlık eylemi olduğu belirtildi. Hakem sarı kart vermekle yetindi. Fırat Aydınus'a göre kaçırılan kartlar.", confidenceScore: 0.78, inFavorOf: "Galatasaray", against: "Beşiktaş", refereeDecision: "YELLOW_CARD" },
    ]
  },
  // ── Week 10 ──
  {
    home: "Galatasaray", away: "GÖZTEPE", week: 10,
    videoId: "SkN50-ZGHWs",
    incidents: [
      { minute: 22, type: "POSSIBLE_PENALTY", description: "Galatasaray ceza sahasında tartışmalı müdahale. Trio ekibi pozisyonu değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "GÖZTEPE", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "GAZİANTEP", away: "Fenerbahçe", week: 10,
    videoId: "_vc2b4IFTwQ",
    incidents: [
      { minute: 55, type: "FOUL", description: "Gaziantep-Fenerbahçe maçında tartışmalı faul kararı. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "GAZİANTEP", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 11 ── (Beşiktaş - Fenerbahçe & Galatasaray - Trabzonspor)
  {
    home: "Beşiktaş", away: "Fenerbahçe", week: 11,
    videoId: "3qiXLLcEQn8",
    incidents: [
      { minute: 26, type: "RED_CARD", description: "Orkun Kökçü, Edson Alvarez'e yaptığı müdahale sonrası VAR incelemesiyle kırmızı kart gördü. Bülent Yıldırım: 'Kırmızı kart gerektiren bir ihlal, tartışacak bir şey yok.'", confidenceScore: 0.93, inFavorOf: "Fenerbahçe", against: "Beşiktaş", varIntervention: true, refereeDecision: "RED_CARD" },
      { minute: 27, type: "RED_CARD", description: "Beşiktaş Teknik Direktörü Sergen Yalçın, su şişesini tekmelediği için tribüne gönderildi. Trio ekibi kırmızı kartı doğru buldu.", confidenceScore: 0.7, inFavorOf: "Fenerbahçe", against: "Beşiktaş", refereeDecision: "RED_CARD" },
      { minute: 45, type: "POSSIBLE_PENALTY", description: "Kerem Aktürkoğlu'na Salih Uçan'ın müdahalesi. VAR penaltı kararından döndü. Bülent Yıldırım: 'Bu pozisyon penaltı, hiç tartışmam.' Trio ekibi kararı yanlış buldu.", confidenceScore: 0.88, inFavorOf: "Fenerbahçe", against: "Beşiktaş", varIntervention: true, refereeDecision: "CONTINUE" },
      { minute: 88, type: "VAR_CONTROVERSY", description: "Ederson topu 20+ saniye elinde tuttu, hakem müdahale etmedi. Trio ekibi: 'Seminerde gösterilecek kadar problemli pozisyon.'", confidenceScore: 0.72, inFavorOf: "Beşiktaş", against: "Fenerbahçe", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Galatasaray", away: "Trabzonspor", week: 11,
    videoId: "KjLuzSSa8o4",
    incidents: [
      { minute: 35, type: "POSSIBLE_PENALTY", description: "Galatasaray-Trabzonspor maçında ceza sahası içinde tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.65, inFavorOf: "Galatasaray", against: "Trabzonspor", refereeDecision: "CONTINUE" },
    ]
  },
  // ── Week 12 ──
  {
    home: "Fenerbahçe", away: "KAYSERİSPOR", week: 12,
    videoId: "Rsp2AZ1D18g",
    incidents: [
      { minute: 40, type: "FOUL", description: "Fenerbahçe-Kayserispor maçında tartışılan pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "KAYSERİSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 13 ──
  {
    home: "Galatasaray", away: "GENÇLERBİRLİĞİ", week: 13,
    videoId: "6fBbwy21N4Y",
    incidents: [
      { minute: 72, type: "POSSIBLE_PENALTY", description: "Galatasaray-Gençlerbirliği maçında ceza sahası içinde tartışmalı müdahale.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "GENÇLERBİRLİĞİ", refereeDecision: "CONTINUE" },
    ]
  },
  // ── Week 14 ── (Fenerbahçe - Galatasaray)
  {
    home: "Fenerbahçe", away: "Galatasaray", week: 14,
    videoId: "M7Nxd6hP_2E",
    incidents: [
      { minute: 44, type: "GOAL_DISALLOWED", description: "Fenerbahçe'nin golü Skriniar'ın kolunun doğal konumda olmaması nedeniyle iptal edildi. VAR müdahalesi. Trio ekibi üçü de kararı doğru buldu.", confidenceScore: 0.9, inFavorOf: "Galatasaray", against: "Fenerbahçe", varIntervention: true, refereeDecision: "HANDBALL" },
      { minute: 51, type: "POSSIBLE_PENALTY", description: "Barış Alper Yılmaz 45+6'da ceza sahasında yerde kaldı, Galatasaray penaltı istedi. Trio ekibi çok küçük bir temas olduğunu belirtip penaltı olmadığını söyledi.", confidenceScore: 0.72, inFavorOf: "Galatasaray", against: "Fenerbahçe", refereeDecision: "CONTINUE" },
      { minute: 65, type: "MISSED_YELLOW", description: "Skriniar-Sara mücadelesinde sarı kart verilmesi gerekirdi. Trio ekibi hakemin kaçırdığı en net pozisyon olarak değerlendirdi.", confidenceScore: 0.7, inFavorOf: "Galatasaray", against: "Fenerbahçe", refereeDecision: "CONTINUE" },
    ]
  },
  // ── Week 15 ──
  {
    home: "Galatasaray", away: "SAMSUNSPOR", week: 15,
    videoId: "mcnubJSizkw",
    incidents: [
      { minute: 30, type: "FOUL", description: "Galatasaray-Samsunspor maçında tartışmalı faul kararı. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "SAMSUNSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 16 ── (Trabzonspor - Beşiktaş)
  {
    home: "Trabzonspor", away: "Beşiktaş", week: 16,
    videoId: "cmW9I6UQ-HU",
    incidents: [
      { minute: 15, type: "PENALTY", description: "Trabzonspor lehine verilen penaltı kararı. Trio ekibi pozisyonu detaylı değerlendirdi.", confidenceScore: 0.8, inFavorOf: "Trabzonspor", against: "Beşiktaş", refereeDecision: "PENALTY", varIntervention: true },
      { minute: 68, type: "POSSIBLE_PENALTY", description: "Beşiktaş'ın penaltı beklediği pozisyon. Hakem devam kararı verdi.", confidenceScore: 0.7, inFavorOf: "Beşiktaş", against: "Trabzonspor", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Fenerbahçe", away: "KONYASPOR", week: 16,
    videoId: "hQugMWMdriw",
    incidents: [
      { minute: 52, type: "FOUL", description: "Fenerbahçe-Konyaspor maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "KONYASPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 18 ──
  {
    home: "Galatasaray", away: "GAZİANTEP", week: 18,
    videoId: "ukI0iZOjqvw",
    incidents: [
      { minute: 40, type: "POSSIBLE_PENALTY", description: "Galatasaray-Gaziantep maçında ceza sahası içinde tartışmalı pozisyon.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "GAZİANTEP", refereeDecision: "CONTINUE" },
    ]
  },
  // ── Week 19 ──
  {
    home: "Trabzonspor", away: "KASIMPAŞA", week: 19,
    videoId: "YwlgsBBuVII",
    incidents: [
      { minute: 25, type: "FOUL", description: "Trabzonspor-Kasımpaşa maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Trabzonspor", against: "KASIMPAŞA", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 20 ──
  {
    home: "Galatasaray", away: "KAYSERİSPOR", week: 20,
    videoId: "KFfbpLkcqtc",
    incidents: [
      { minute: 35, type: "FOUL", description: "Galatasaray-Kayserispor maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "KAYSERİSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 21 ──
  {
    home: "Fenerbahçe", away: "GENÇLERBİRLİĞİ", week: 21,
    videoId: "xiSTOLHTFMg",
    incidents: [
      { minute: 44, type: "FOUL", description: "Fenerbahçe-Gençlerbirliği maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "GENÇLERBİRLİĞİ", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 22 ── (Trabzonspor - Fenerbahçe)
  {
    home: "Trabzonspor", away: "Fenerbahçe", week: 22,
    videoId: "wlGMomPX9s0",
    incidents: [
      { minute: 14, type: "HANDBALL", description: "Fenerbahçe'nin golü öncesi İsmail'in topa elle müdahale ettiği iddia edildi. Trio ekibi (Duran, Çoban, Yıldırım) topu göğüs bölgesiyle aldığını belirterek elle oynama olmadığını söyledi.", confidenceScore: 0.82, inFavorOf: "Fenerbahçe", against: "Trabzonspor", refereeDecision: "CONTINUE" },
      { minute: 30, type: "YELLOW_CARD", description: "Talisca'ya gösterilen sarı kart. Deniz Çoban ve Bahattin Duran sarı kartın fazla olduğunu düşündü.", confidenceScore: 0.65, inFavorOf: "Trabzonspor", against: "Fenerbahçe", refereeDecision: "YELLOW_CARD" },
      { minute: 55, type: "FOUL", description: "Kerem Aktürkoğlu'nun yerde kaldığı pozisyonda faul çalınması gerektiği konusunda fikir birliği.", confidenceScore: 0.72, inFavorOf: "Fenerbahçe", against: "Trabzonspor", refereeDecision: "CONTINUE" },
      { minute: 85, type: "MISSED_YELLOW", description: "Onuachu'nun Oosterwolde'ye topsuz müdahalesi. Trio ekibi sarı kart verilmesi gerektiğini belirtti.", confidenceScore: 0.75, inFavorOf: "Fenerbahçe", against: "Trabzonspor", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Galatasaray", away: "EYÜPSPOR", week: 22,
    videoId: "Twb_N2D_skQ",
    incidents: [
      { minute: 40, type: "FOUL", description: "Galatasaray-Eyüpspor maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "EYÜPSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 23 ──
  {
    home: "KONYASPOR", away: "Galatasaray", week: 23,
    videoId: "SfPHemPPcFE",
    incidents: [
      { minute: 55, type: "POSSIBLE_PENALTY", description: "Konyaspor-Galatasaray maçında tartışmalı ceza sahası pozisyonu. Trio ekibi değerlendirdi.", confidenceScore: 0.65, inFavorOf: "Galatasaray", against: "KONYASPOR", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Fenerbahçe", away: "KASIMPAŞA", week: 23,
    videoId: "QtdHQQn4kVU",
    incidents: [
      { minute: 38, type: "FOUL", description: "Fenerbahçe-Kasımpaşa maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "KASIMPAŞA", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 24 ──
  {
    home: "Galatasaray", away: "ALANYASPOR", week: 24,
    videoId: "ohgQ3SIhUVE",
    incidents: [
      { minute: 30, type: "FOUL", description: "Galatasaray-Alanyaspor maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Galatasaray", against: "ALANYASPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 25 ── (Beşiktaş - Galatasaray)
  {
    home: "Beşiktaş", away: "Galatasaray", week: 25,
    videoId: "8w7B7yczbHk",
    incidents: [
      { minute: 42, type: "RED_CARD", description: "Leroy Sane, Rıdvan Yılmaz'a yaptığı müdahale sonrası VAR incelemesiyle direkt kırmızı kart gördü. Trio ekibi: 'Kristal netliğinde bir kırmızı kart.'", confidenceScore: 0.95, inFavorOf: "Beşiktaş", against: "Galatasaray", varIntervention: true, refereeDecision: "RED_CARD" },
      { minute: 60, type: "YELLOW_CARD", description: "Osimhen'in kaleci Ersin Destanoğlu'na müdahalesi. Sarı kart verildi. Trio ekibi net sarı kart olduğunu ancak geç gösterildiğini belirtti.", confidenceScore: 0.7, inFavorOf: "Beşiktaş", against: "Galatasaray", refereeDecision: "YELLOW_CARD" },
      { minute: 75, type: "POSSIBLE_PENALTY", description: "Barış Alper Yılmaz'ın Uduokhai ile mücadelesinde yerde kaldığı pozisyon. Galatasaray penaltı bekledi, hakem devam kararı verdi, VAR müdahale etmedi.", confidenceScore: 0.72, inFavorOf: "Galatasaray", against: "Beşiktaş", refereeDecision: "CONTINUE" },
    ]
  },
  {
    home: "Fenerbahçe", away: "SAMSUNSPOR", week: 25,
    videoId: "K6H41Qjd_9o",
    incidents: [
      { minute: 33, type: "FOUL", description: "Fenerbahçe-Samsunspor maçında tartışmalı pozisyon. Trio ekibi değerlendirdi.", confidenceScore: 0.6, inFavorOf: "Fenerbahçe", against: "SAMSUNSPOR", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 26 ──
  {
    home: "FATİH KARAGÜMRÜK", away: "Fenerbahçe", week: 26,
    videoId: "pjRPFbo-VQg",
    incidents: [
      { minute: 45, type: "FOUL", description: "Fatih Karagümrük-Fenerbahçe maçında tartışmalı pozisyon. Trio ekibi detaylı değerlendirdi.", confidenceScore: 0.65, inFavorOf: "FATİH KARAGÜMRÜK", against: "Fenerbahçe", refereeDecision: "FOUL" },
    ]
  },
  // ── Week 27 ──
  {
    home: "Fenerbahçe", away: "GAZİANTEP", week: 27,
    videoId: "IsbLTiojQ8U",
    incidents: [
      { minute: 22, type: "POSSIBLE_PENALTY", description: "Fenerbahçe-Gaziantep FK maçında tartışmalı ceza sahası pozisyonu. Trio ekibi değerlendirdi.", confidenceScore: 0.65, inFavorOf: "Fenerbahçe", against: "GAZİANTEP", refereeDecision: "CONTINUE" },
    ]
  },
];

async function findMatchId(home, away, week) {
  const res = await fetch(`${BASE}/api/matches?league=${encodeURIComponent("Süper Lig 2025-26")}`, { headers });
  const matches = await res.json();
  return matches.find(
    (m) => m.week === week && m.homeTeam === home && m.awayTeam === away
  )?.id;
}

async function main() {
  const allMatchesRes = await fetch(`${BASE}/api/matches?league=${encodeURIComponent("Süper Lig 2025-26")}`, { headers });
  const allMatches = await allMatchesRes.json();
  console.log(`Loaded ${allMatches.length} matches from DB`);

  let created = 0, failed = 0;

  for (const entry of TRIO_INCIDENTS) {
    const match = allMatches.find(
      (m) => m.week === entry.week && m.homeTeam === entry.home && m.awayTeam === entry.away
    );

    if (!match) {
      console.error(`  Match not found: Week ${entry.week} ${entry.home} vs ${entry.away}`);
      failed++;
      continue;
    }

    const videoUrl = `https://youtu.be/${entry.videoId}`;

    for (const inc of entry.incidents) {
      const body = {
        matchId: match.id,
        minute: inc.minute,
        type: inc.type,
        description: inc.description,
        confidenceScore: inc.confidenceScore,
        sources: [videoUrl],
      };

      const createRes = await fetch(`${BASE}/api/incidents`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!createRes.ok) {
        console.error(`  Failed incident: ${await createRes.text()}`);
        failed++;
        continue;
      }

      const newIncident = await createRes.json();

      // PATCH to set additional fields
      const patchBody = {
        status: "APPROVED",
        videoUrl,
        inFavorOf: inc.inFavorOf || null,
        against: inc.against || null,
      };
      if (inc.varIntervention !== undefined) {
        patchBody.refereeComments = JSON.stringify([{
          author: "beIN Trio",
          comment: inc.description,
          stance: inc.confidenceScore > 0.8 ? "AGREE" : "NEUTRAL",
        }]);
      }

      await fetch(`${BASE}/api/incidents/${newIncident.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchBody),
      });

      created++;
    }
    console.log(`  Week ${entry.week}: ${entry.home} vs ${entry.away} - ${entry.incidents.length} incidents`);
  }

  console.log(`\nDone: ${created} incidents created, ${failed} failed`);

  const verifyRes = await fetch(`${BASE}/api/incidents`, { headers });
  const allIncidents = await verifyRes.json();
  console.log(`Total incidents in DB: ${allIncidents.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
