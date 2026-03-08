#!/usr/bin/env node
/**
 * Tüm week JSON dosyalarındaki incident'lere inFavorOf ve against ekler.
 * Kullanım: node scripts/add-in-favor-of-to-incidents.mjs
 */

import fs from "node:fs";
import path from "node:path";

const weeksDir = path.join(process.cwd(), "data", "season-2025-26", "weeks");

const MAPPINGS = [
  // week-05
  { file: "week-05.json", match: ["Beşiktaş", "İstanbul Başakşehir"], incidents: [
    { minute: 89, type: "RED_CARD", inFavorOf: "Beşiktaş", against: "İstanbul Başakşehir" },
    { minute: 90, type: "RED_CARD", inFavorOf: "Beşiktaş", against: "İstanbul Başakşehir" },
  ]},
  { file: "week-05.json", match: ["Eyüpspor", "Galatasaray"], incidents: [
    { minute: 53, type: "MISSED_YELLOW", inFavorOf: "Galatasaray", against: "Eyüpspor" },
    { minute: 56, type: "GOAL_DISALLOWED", inFavorOf: "Galatasaray", against: "Eyüpspor" },
  ]},
  { file: "week-05.json", match: ["Fenerbahçe", "Trabzonspor"], incidents: [
    { minute: 11, type: "GOAL_DISALLOWED", inFavorOf: "Fenerbahçe", against: "Trabzonspor" },
    { minute: 20, type: "RED_CARD", inFavorOf: "Fenerbahçe", against: "Trabzonspor" },
  ]},
  // week-06
  { file: "week-06.json", match: ["Göztepe", "Beşiktaş"], incidents: [
    { minute: 36, type: "POSSIBLE_PENALTY", inFavorOf: "Göztepe", against: "Beşiktaş" },
  ]},
  { file: "week-06.json", match: ["Trabzonspor", "Gaziantep"], incidents: [
    { minute: 50, type: "POSSIBLE_PENALTY", inFavorOf: "Gaziantep", against: "Trabzonspor" },
  ]},
  { file: "week-06.json", match: ["Galatasaray", "Konyaspor"], incidents: [
    { minute: 84, type: "POSSIBLE_PENALTY", inFavorOf: "Galatasaray", against: "Konyaspor" },
    { minute: 34, type: "MISSED_YELLOW", inFavorOf: "Galatasaray", against: "Konyaspor" },
  ]},
  // week-07
  { file: "week-07.json", match: ["Alanyaspor", "Galatasaray"], incidents: [
    { minute: 52, type: "POSSIBLE_PENALTY", inFavorOf: "Alanyaspor", against: "Galatasaray" },
    { minute: 55, type: "FOUL", inFavorOf: "Alanyaspor", against: "Galatasaray" },
    { minute: 64, type: "MISSED_RED_CARD", inFavorOf: "Alanyaspor", against: "Galatasaray" },
    { minute: 90, type: "MISSED_RED_CARD", inFavorOf: "Alanyaspor", against: "Galatasaray" },
  ]},
  { file: "week-07.json", match: ["Fatih Karagümrük", "Trabzonspor"], incidents: [
    { minute: 45, type: "VAR_CONTROVERSY", inFavorOf: "Trabzonspor", against: "Fatih Karagümrük" },
  ]},
  // week-08 (Trabzonspor-Kayserispor - Zubkov Trabzonspor, Abdülsamet Kayseri)
  { file: "week-08.json", match: ["Trabzonspor", "Kayserispor"], incidents: [
    { minute: 7, type: "FOUL", inFavorOf: "Kayserispor", against: "Trabzonspor" },
    { minute: 59, type: "FOUL", inFavorOf: "Kayserispor", against: "Trabzonspor" },
  ]},
  { file: "week-08.json", match: ["Galatasaray", "Beşiktaş"], incidents: [
    { minute: 39, type: "MISSED_RED_CARD", inFavorOf: "Beşiktaş", against: "Galatasaray" },
    { minute: 65, type: "VAR_CONTROVERSY", inFavorOf: "Beşiktaş", against: "Galatasaray" },
  ]},
  // week-09
  { file: "week-09.json", match: ["Çaykur Rizespor", "Trabzonspor"], incidents: [
    { minute: 31, type: "POSSIBLE_PENALTY", inFavorOf: "Trabzonspor", against: "Çaykur Rizespor" },
  ]},
  { file: "week-09.json", match: ["İstanbul Başakşehir", "Galatasaray"], incidents: [
    { minute: 47, type: "GOAL_DISALLOWED", inFavorOf: "Galatasaray", against: "İstanbul Başakşehir" },
  ]},
  { file: "week-09.json", match: ["Fenerbahçe", "Fatih Karagümrük"], incidents: [
    { minute: 16, type: "POSSIBLE_PENALTY", inFavorOf: "Fatih Karagümrük", against: "Fenerbahçe" },
    { minute: 19, type: "PENALTY", inFavorOf: "Fenerbahçe", against: "Fatih Karagümrük" },
    { minute: 82, type: "RED_CARD", inFavorOf: "Fenerbahçe", against: "Fatih Karagümrük" },
  ]},
  // week-10
  { file: "week-10.json", match: ["Galatasaray", "Göztepe"], incidents: [
    { minute: 25, type: "VAR_CONTROVERSY", inFavorOf: "Göztepe", against: "Galatasaray" },
    { minute: 50, type: "POSSIBLE_PENALTY", inFavorOf: "Göztepe", against: "Galatasaray" },
    { minute: 75, type: "RED_CARD", inFavorOf: "Galatasaray", against: "Göztepe" },
  ]},
  { file: "week-10.json", match: ["Kasımpaşa", "Beşiktaş"], incidents: [
    { minute: 55, type: "VAR_CONTROVERSY", inFavorOf: "Kasımpaşa", against: "Beşiktaş" },
    { minute: 31, type: "PENALTY", inFavorOf: "Beşiktaş", against: "Kasımpaşa" },
    { minute: 35, type: "POSSIBLE_PENALTY", inFavorOf: "Beşiktaş", against: "Kasımpaşa" },
  ]},
  { file: "week-10.json", match: ["Gaziantep", "Fenerbahçe"], incidents: [
    { minute: 86, type: "RED_CARD", inFavorOf: "Fenerbahçe", against: "Gaziantep" },
  ]},
  // week-11
  { file: "week-11.json", match: ["Galatasaray", "Trabzonspor"], incidents: [
    { minute: 25, type: "VAR_CONTROVERSY", inFavorOf: "Trabzonspor", against: "Galatasaray" },
    { minute: 55, type: "POSSIBLE_PENALTY", inFavorOf: "Galatasaray", against: "Trabzonspor" },
    { minute: 70, type: "RED_CARD", inFavorOf: "Galatasaray", against: "Trabzonspor" },
  ]},
  { file: "week-11.json", match: ["Beşiktaş", "Fenerbahçe"], incidents: [
    { minute: 13, type: "FOUL", inFavorOf: "Beşiktaş", against: "Fenerbahçe" },
    { minute: 41, type: "PENALTY", inFavorOf: "Fenerbahçe", against: "Beşiktaş" },
    { minute: 94, type: "PENALTY", inFavorOf: "Fenerbahçe", against: "Beşiktaş" },
  ]},
  // week-12
  { file: "week-12.json", match: ["Antalyaspor", "Beşiktaş"], incidents: [
    { minute: 35, type: "PENALTY", inFavorOf: "Antalyaspor", against: "Beşiktaş" },
    { minute: 95, type: "PENALTY", inFavorOf: "Beşiktaş", against: "Antalyaspor" },
  ]},
  { file: "week-12.json", match: ["Trabzonspor", "Alanyaspor"], incidents: [
    { minute: 15, type: "POSSIBLE_PENALTY", inFavorOf: "Alanyaspor", against: "Trabzonspor" },
    { minute: 50, type: "POSSIBLE_PENALTY", inFavorOf: "Trabzonspor", against: "Alanyaspor" },
    { minute: 75, type: "POSSIBLE_PENALTY", inFavorOf: "Alanyaspor", against: "Trabzonspor" },
  ]},
  { file: "week-12.json", match: ["Fenerbahçe", "Kayserispor"], incidents: [
    { minute: 17, type: "FOUL", inFavorOf: "Kayserispor", against: "Fenerbahçe" },
    { minute: 55, type: "FOUL", inFavorOf: "Kayserispor", against: "Fenerbahçe" },
  ]},
  { file: "week-12.json", match: ["Kocaelispor", "Galatasaray"], incidents: [
    { minute: 83, type: "GOAL_DISALLOWED", inFavorOf: "Kocaelispor", against: "Galatasaray" },
  ]},
  // week-13
  { file: "week-13.json", match: ["Galatasaray", "Gençlerbirliği"], incidents: [
    { minute: 15, type: "MISSED_RED_CARD", inFavorOf: "Gençlerbirliği", against: "Galatasaray" },
    { minute: 45, type: "POSSIBLE_PENALTY", inFavorOf: "Gençlerbirliği", against: "Galatasaray" },
    { minute: 94, type: "RED_CARD", inFavorOf: "Gençlerbirliği", against: "Galatasaray" },
  ]},
  { file: "week-13.json", match: ["Beşiktaş", "Samsunspor"], incidents: [
    { minute: 40, type: "POSSIBLE_PENALTY", inFavorOf: "Samsunspor", against: "Beşiktaş" },
  ]},
  { file: "week-13.json", match: ["Çaykur Rizespor", "Fenerbahçe"], incidents: [
    { minute: 25, type: "FOUL", inFavorOf: "Çaykur Rizespor", against: "Fenerbahçe" },
    { minute: 55, type: "VAR_CONTROVERSY", inFavorOf: "Çaykur Rizespor", against: "Fenerbahçe" },
    { minute: 70, type: "VAR_CONTROVERSY", inFavorOf: "Çaykur Rizespor", against: "Fenerbahçe" },
  ]},
  { file: "week-13.json", match: ["İstanbul Başakşehir", "Trabzonspor"], incidents: [
    { minute: 7, type: "RED_CARD", inFavorOf: "Trabzonspor", against: "İstanbul Başakşehir" },
  ]},
  // week-14
  { file: "week-14.json", match: ["Trabzonspor", "Konyaspor"], incidents: [
    { minute: 39, type: "PENALTY", inFavorOf: "Trabzonspor", against: "Konyaspor" },
    { minute: 87, type: "GOAL_DISALLOWED", inFavorOf: "Trabzonspor", against: "Konyaspor" },
  ]},
  { file: "week-14.json", match: ["Fatih Karagümrük", "Beşiktaş"], incidents: [
    { minute: 75, type: "PENALTY", inFavorOf: "Beşiktaş", against: "Fatih Karagümrük" },
    { minute: 90, type: "GOAL_DISALLOWED", inFavorOf: "Fatih Karagümrük", against: "Beşiktaş" },
  ]},
  { file: "week-14.json", match: ["Fenerbahçe", "Galatasaray"], incidents: [
    { minute: 44, type: "GOAL_DISALLOWED", inFavorOf: "Galatasaray", against: "Fenerbahçe" },
    { minute: 45, type: "POSSIBLE_PENALTY", inFavorOf: "Fenerbahçe", against: "Galatasaray" },
    { minute: 65, type: "FOUL", inFavorOf: "Galatasaray", against: "Fenerbahçe" },
  ]},
  // week-15
  { file: "week-15.json", match: ["Galatasaray", "Samsunspor"], incidents: [
    { minute: 42, type: "FOUL", inFavorOf: "Galatasaray", against: "Samsunspor" },
    { minute: 55, type: "VAR_CONTROVERSY", inFavorOf: "Samsunspor", against: "Galatasaray" },
    { minute: 90, type: "POSSIBLE_PENALTY", inFavorOf: "Galatasaray", against: "Samsunspor" },
  ]},
  { file: "week-15.json", match: ["İstanbul Başakşehir", "Fenerbahçe"], incidents: [
    { minute: 14, type: "FOUL", inFavorOf: "Fenerbahçe", against: "İstanbul Başakşehir" },
    { minute: 73, type: "VAR_CONTROVERSY", inFavorOf: "Fenerbahçe", against: "İstanbul Başakşehir" },
  ]},
  { file: "week-15.json", match: ["Göztepe", "Trabzonspor"], incidents: [
    { minute: 78, type: "RED_CARD", inFavorOf: "Trabzonspor", against: "Göztepe" },
    { minute: 85, type: "MISSED_RED_CARD", inFavorOf: "Trabzonspor", against: "Göztepe" },
    { minute: 95, type: "PENALTY", inFavorOf: "Trabzonspor", against: "Göztepe" },
  ]},
  { file: "week-15.json", match: ["Beşiktaş", "Gaziantep"], incidents: [
    { minute: 47, type: "POSSIBLE_PENALTY", inFavorOf: "Gaziantep", against: "Beşiktaş" },
    { minute: 65, type: "PENALTY", inFavorOf: "Beşiktaş", against: "Gaziantep" },
  ]},
  // week-16
  { file: "week-16.json", match: ["Antalyaspor", "Galatasaray"], incidents: [
    { minute: 55, type: "POSSIBLE_PENALTY", inFavorOf: "Galatasaray", against: "Antalyaspor" },
    { minute: 75, type: "POSSIBLE_PENALTY", inFavorOf: "Antalyaspor", against: "Galatasaray" },
  ]},
  { file: "week-16.json", match: ["Trabzonspor", "Beşiktaş"], incidents: [
    { minute: 36, type: "RED_CARD", inFavorOf: "Beşiktaş", against: "Trabzonspor" },
    { minute: 45, type: "FOUL", inFavorOf: "Trabzonspor", against: "Beşiktaş" },
  ]},
  { file: "week-16.json", match: ["Fenerbahçe", "Konyaspor"], incidents: [
    { minute: 23, type: "PENALTY", inFavorOf: "Fenerbahçe", against: "Konyaspor" },
  ]},
  // week-17
  { file: "week-17.json", match: ["Beşiktaş", "Çaykur Rizespor"], incidents: [
    { minute: 87, type: "POSSIBLE_PENALTY", inFavorOf: "Beşiktaş", against: "Çaykur Rizespor" },
    { minute: 93, type: "POSSIBLE_OFFSIDE_GOAL", inFavorOf: "Beşiktaş", against: "Çaykur Rizespor" },
  ]},
  { file: "week-17.json", match: ["Eyüpspor", "Fenerbahçe"], incidents: [
    { minute: 35, type: "FOUL", inFavorOf: "Eyüpspor", against: "Fenerbahçe" },
    { minute: 60, type: "PENALTY", inFavorOf: "Fenerbahçe", against: "Eyüpspor" },
  ]},
  { file: "week-17.json", match: ["Galatasaray", "Kasımpaşa"], incidents: [
    { minute: 25, type: "VAR_CONTROVERSY", inFavorOf: "Galatasaray", against: "Kasımpaşa" },
    { minute: 28, type: "HANDBALL", inFavorOf: "Galatasaray", against: "Kasımpaşa" },
    { minute: 32, type: "MISSED_RED_CARD", inFavorOf: "Galatasaray", against: "Kasımpaşa" },
  ]},
  { file: "week-17.json", match: ["Gençlerbirliği", "Trabzonspor"], incidents: [
    { minute: 72, type: "GOAL_DISALLOWED", inFavorOf: "Gençlerbirliği", against: "Trabzonspor" },
  ]},
  // week-18
  { file: "week-18.json", match: ["Alanyaspor", "Fenerbahçe"], incidents: [
    { minute: 25, type: "FOUL", inFavorOf: "Alanyaspor", against: "Fenerbahçe" },
    { minute: 70, type: "MISSED_RED_CARD", inFavorOf: "Alanyaspor", against: "Fenerbahçe" },
    { minute: 88, type: "POSSIBLE_PENALTY", inFavorOf: "Alanyaspor", against: "Fenerbahçe" },
  ]},
  { file: "week-18.json", match: ["Beşiktaş", "Kayserispor"], incidents: [
    { minute: 70, type: "PENALTY", inFavorOf: "Kayserispor", against: "Beşiktaş" },
  ]},
  // week-19
  { file: "week-19.json", match: ["Eyüpspor", "Beşiktaş"], incidents: [
    { minute: 21, type: "GOAL_DISALLOWED", inFavorOf: "Beşiktaş", against: "Eyüpspor" },
  ]},
  // week-20
  { file: "week-20.json", match: ["Antalyaspor", "Trabzonspor"], incidents: [
    { minute: 51, type: "POSSIBLE_PENALTY", inFavorOf: "Trabzonspor", against: "Antalyaspor" },
    { minute: 80, type: "PENALTY", inFavorOf: "Trabzonspor", against: "Antalyaspor" },
  ]},
  { file: "week-20.json", match: ["Beşiktaş", "Konyaspor"], incidents: [
    { minute: 82, type: "RED_CARD", inFavorOf: "Konyaspor", against: "Beşiktaş" },
  ]},
  { file: "week-20.json", match: ["Galatasaray", "Kayserispor"], incidents: [
    { minute: 34, type: "FOUL", inFavorOf: "Kayserispor", against: "Galatasaray" },
    { minute: 46, type: "MISSED_RED_CARD", inFavorOf: "Galatasaray", against: "Kayserispor" },
  ]},
  // week-21
  { file: "week-21.json", match: ["Samsunspor", "Trabzonspor"], incidents: [
    { minute: 65, type: "GOAL_DISALLOWED", inFavorOf: "Samsunspor", against: "Trabzonspor" },
  ]},
  { file: "week-21.json", match: ["Beşiktaş", "Alanyaspor"], incidents: [
    { minute: 76, type: "PENALTY", inFavorOf: "Alanyaspor", against: "Beşiktaş" },
    { minute: 54, type: "POSSIBLE_OFFSIDE_GOAL", inFavorOf: "Beşiktaş", against: "Alanyaspor" },
  ]},
  // week-22
  { file: "week-22.json", match: ["Trabzonspor", "Fenerbahçe"], incidents: [
    { minute: 15, type: "HANDBALL", inFavorOf: "Fenerbahçe", against: "Trabzonspor" },
    { minute: 43, type: "FOUL", inFavorOf: "Trabzonspor", against: "Fenerbahçe" },
    { minute: 71, type: "MISSED_RED_CARD", inFavorOf: "Trabzonspor", against: "Fenerbahçe" },
  ]},
  { file: "week-22.json", match: ["İstanbul Başakşehir", "Beşiktaş"], incidents: [
    { minute: 74, type: "POSSIBLE_PENALTY", inFavorOf: "Beşiktaş", against: "İstanbul Başakşehir" },
  ]},
  // week-23
  { file: "week-23.json", match: ["Konyaspor", "Galatasaray"], incidents: [
    { minute: 50, type: "GOAL_DISALLOWED", inFavorOf: "Konyaspor", against: "Galatasaray" },
    { minute: 50, type: "FOUL", inFavorOf: "Konyaspor", against: "Galatasaray" },
  ]},
  { file: "week-23.json", match: ["Fenerbahçe", "Kasımpaşa"], incidents: [
    { minute: 58, type: "VAR_CONTROVERSY", inFavorOf: "Kasımpaşa", against: "Fenerbahçe" },
    { minute: 62, type: "POSSIBLE_PENALTY", inFavorOf: "Kasımpaşa", against: "Fenerbahçe" },
  ]},
  // week-24
  { file: "week-24.json", match: ["Trabzonspor", "Fatih Karagümrük"], incidents: [
    { minute: 35, type: "VAR_CONTROVERSY", inFavorOf: "Fatih Karagümrük", against: "Trabzonspor" },
  ]},
  { file: "week-24.json", match: ["Galatasaray", "Alanyaspor"], incidents: [
    { minute: 22, type: "GOAL_DISALLOWED", inFavorOf: "Alanyaspor", against: "Galatasaray" },
    { minute: 52, type: "POSSIBLE_PENALTY", inFavorOf: "Alanyaspor", against: "Galatasaray" },
    { minute: 93, type: "MISSED_RED_CARD", inFavorOf: "Alanyaspor", against: "Galatasaray" },
  ]},
  { file: "week-24.json", match: ["Kocaelispor", "Beşiktaş"], incidents: [
    { minute: 67, type: "POSSIBLE_PENALTY", inFavorOf: "Beşiktaş", against: "Kocaelispor" },
    { minute: 82, type: "FOUL", inFavorOf: "Beşiktaş", against: "Kocaelispor" },
  ]},
  { file: "week-24.json", match: ["Antalyaspor", "Fenerbahçe"], incidents: [
    { minute: 35, type: "FOUL", inFavorOf: "Antalyaspor", against: "Fenerbahçe" },
    { minute: 75, type: "PENALTY", inFavorOf: "Antalyaspor", against: "Fenerbahçe" },
  ]},
  // week-25
  { file: "week-25.json", match: ["Beşiktaş", "Galatasaray"], incidents: [
    { minute: 20, type: "POSSIBLE_PENALTY", inFavorOf: "Beşiktaş", against: "Galatasaray" },
    { minute: 35, type: "MISSED_RED_CARD", inFavorOf: "Galatasaray", against: "Beşiktaş" },
    { minute: 65, type: "MISSED_RED_CARD", inFavorOf: "Galatasaray", against: "Beşiktaş" },
    { minute: 68, type: "POSSIBLE_OFFSIDE_GOAL", inFavorOf: "Galatasaray", against: "Beşiktaş" },
    { minute: 72, type: "MISSED_RED_CARD", inFavorOf: "Galatasaray", against: "Beşiktaş" },
  ]},
];

function addToIncident(inc, mapping) {
  if (inc.minute === mapping.minute && inc.type === mapping.type) {
    if (!inc.inFavorOf) inc.inFavorOf = mapping.inFavorOf;
    if (!inc.against) inc.against = mapping.against;
    return true;
  }
  return false;
}

const filesToProcess = [...new Set(MAPPINGS.map((m) => m.file))];
for (const file of filesToProcess) {
  const filePath = path.join(weeksDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const mappings = MAPPINGS.filter((m) => m.file === file);

  for (const match of data.matches) {
    const mapping = mappings.find(
      (m) => m.match[0] === match.homeTeam && m.match[1] === match.awayTeam
    );
    if (!mapping || !match.incidents?.length) continue;

    for (const inc of match.incidents) {
      for (const im of mapping.incidents) {
        if (addToIncident(inc, im)) break;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${file}`);
}

console.log("Done.");
