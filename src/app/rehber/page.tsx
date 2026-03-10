import Link from "next/link";
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_IMPACT_POINTS,
  INCIDENT_TYPES,
  getIncidentImpactPoints,
} from "@/lib/incidentCategories";
import { ArrowLeft, Scale, Shield, Info } from "lucide-react";

export const metadata = {
  title: "Puanlama Rehberi - Var Odası",
  description: "Karar tiplerine göre maç etkisi puanları ve nasıl hesaplandığı.",
};

export default function RehberPage() {
  const typesWithPoints = INCIDENT_TYPES.filter((t) => INCIDENT_TYPE_LABELS[t])
    .map((type) => ({
      type,
      label: INCIDENT_TYPE_LABELS[type],
      points: getIncidentImpactPoints(type),
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfa
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          Var <span className="text-red-500">Odası</span> Puanlama Rehberi
        </h1>
        <p className="text-zinc-400">
          Karar tiplerine göre maç etkisi puanları ve nasıl hesaplandığı.
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Info className="h-5 w-5 text-amber-400" />
          Nasıl Çalışır?
        </h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Her karar tipi 1–10 arası bir puan değerine sahiptir.</li>
          <li>• Yüksek puan = maça daha kritik etki (penaltı, kırmızı kart vb.).</li>
          <li>• Yanlış kararların puanları toplanarak maç etkisi hesaplanır.</li>
          <li>• <span className="text-emerald-400">Lehine</span>: Takımın haksız yere faydalandığı kararlar.</li>
          <li>• <span className="text-red-400">Aleyhine</span>: Takımın haksızlığa uğradığı kararlar.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Scale className="h-5 w-5 text-red-400" />
          Karar Tipleri ve Puanları
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="py-3 text-left font-medium text-zinc-400">Karar Tipi</th>
                <th className="py-3 text-right font-medium text-zinc-400">Puan</th>
              </tr>
            </thead>
            <tbody>
              {typesWithPoints.map(({ type, label, points }) => (
                <tr key={type} className="border-b border-zinc-800/50">
                  <td className="py-3 text-zinc-300">{label}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-medium text-amber-400">
                      <Shield className="h-3.5 w-3.5" />
                      {points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-500">
        <p>
          Bu puanlar yalnızca <span className="text-zinc-400">yanlış</span> kararlar için hesaplanır.
          Uzmanların çoğunluğu karara katılmıyorsa karar yanlış kabul edilir.
        </p>
      </div>
    </div>
  );
}
