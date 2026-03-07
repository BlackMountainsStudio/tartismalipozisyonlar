#!/usr/bin/env node
/**
 * Tek bir incident'i ID ile günceller (videoUrl, relatedVideos, refereeComments, sources).
 * Kullanım: node scripts/update-incident-by-id.mjs <incidentId>
 * Örnek:   node scripts/update-incident-by-id.mjs cm7z1inc06
 *
 * Güncellenecek veri: week-24 Galatasaray-Alanyaspor 52' Osimhen penaltı pozisyonu.
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const OSIMHEN_52_PAYLOAD = {
  sources: [
    "https://www.yenicaggazetesi.com/bein-trio-galatasaray-alanyaspor-macini-degerlendirdi-hakem-kararlari-dogru-mu-besiktas-derbisi-oncesi-ali-sansalanin-kart-ve-ceza-kararlari-1005091h.htm",
    "https://www.youtube.com/shorts/UidFoc2Jijo",
    "https://www.youtube.com/shorts/yBQ_tsLDsLA",
    "https://www.youtube.com/results?search_query=Galatasaray+vs+Alanyaspor+osimhen+penalt%C4%B1+pozisyonu+",
  ],
  videoUrl: "https://www.youtube.com/shorts/UidFoc2Jijo",
  relatedVideos: [
    { url: "https://www.youtube.com/shorts/UidFoc2Jijo", title: "Osimhen penaltı pozisyonu (YouTube Shorts)" },
    { url: "https://www.youtube.com/shorts/yBQ_tsLDsLA", title: "Galatasaray Alanyaspor penaltı tartışması (YouTube Shorts)" },
    { url: "https://www.youtube.com/results?search_query=Galatasaray+vs+Alanyaspor+osimhen+penalt%C4%B1+pozisyonu+", title: "YouTube'da Osimhen penaltı pozisyonu araması" },
  ],
  refereeComments: [
    { author: "Deniz Çoban (beIN Trio)", text: "Penaltı verilse daha doğru olurdu." },
    { author: "Trio diğer eski hakemler (Bülent Yıldırım, Bahattin Duran)", text: "Devam kararını desteklediler; temasın penaltı gerektirmediği yönünde görüş bildirdiler." },
    { author: "Yeni Çağ / beIN Trio yorumu", text: "Galatasaray-Alanyaspor maçındaki penaltı pozisyonu Trio'da tek tek incelendi; Deniz Çoban penaltı verilmeli derken diğer iki eski hakem saha kararını doğru buldu." },
    { author: "Video ve sosyal medya yorumları", text: "Pozisyon YouTube ve sosyal medyada geniş yer buldu; taraftar ve yorumcular 'penaltı verilmeliydi' ile 'devam doğru' görüşleriyle ikiye ayrıldı." },
  ],
};

async function main() {
  const incidentId = process.argv[2];
  if (!incidentId) {
    console.error("Kullanım: node scripts/update-incident-by-id.mjs <incidentId>");
    process.exitCode = 1;
    return;
  }

  const res = await pool.query(
    `UPDATE "Incident"
     SET "sources" = $2, "videoUrl" = $3, "relatedVideos" = $4, "refereeComments" = $5, "updatedAt" = NOW()
     WHERE "id" = $1
     RETURNING "id", "minute", "type"`,
    [
      incidentId,
      JSON.stringify(OSIMHEN_52_PAYLOAD.sources),
      OSIMHEN_52_PAYLOAD.videoUrl,
      JSON.stringify(OSIMHEN_52_PAYLOAD.relatedVideos),
      JSON.stringify(OSIMHEN_52_PAYLOAD.refereeComments),
    ]
  );

  if (res.rowCount === 0) {
    console.error(`Incident bulunamadı: ${incidentId}`);
    process.exitCode = 1;
    return;
  }

  console.log("Güncellendi:", res.rows[0]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
