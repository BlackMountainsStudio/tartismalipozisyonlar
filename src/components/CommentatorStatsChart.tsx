"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getCategoryKey } from "@/lib/incidentCategories";

const CATEGORY_LABELS: Record<string, string> = {
  penalty: "Penaltı",
  offside_goal: "Ofsayt / Gol iptali",
  card: "Kart",
  foul_handball: "Faul / El",
  other: "Diğer",
};

interface Opinion {
  id: string;
  stance: string;
  incident: { type: string };
}

interface CommentatorStatsChartProps {
  opinions: Opinion[];
  commentatorName: string;
  className?: string;
}

export default function CommentatorStatsChart({
  opinions,
  commentatorName,
  className = "",
}: CommentatorStatsChartProps) {
  const [chartType, setChartType] = useState<"grouped" | "stacked">("grouped");

  const chartData = useMemo(() => {
    const byCategory: Record<
      string,
      { doğru: number; yanlış: number; kararsız: number }
    > = {};

    for (const op of opinions) {
      const cat = getCategoryKey(op.incident.type);
      if (!byCategory[cat]) {
        byCategory[cat] = { doğru: 0, yanlış: 0, kararsız: 0 };
      }
      if (op.stance === "AGREE") byCategory[cat].doğru += 1;
      else if (op.stance === "DISAGREE") byCategory[cat].yanlış += 1;
      else byCategory[cat].kararsız += 1;
    }

    return Object.entries(byCategory)
      .map(([key, vals]) => ({
        kategori: CATEGORY_LABELS[key] ?? key,
        Doğru: vals.doğru,
        Yanlış: vals.yanlış,
        Kararsız: vals.kararsız,
      }))
      .filter((d) => d.Doğru + d.Yanlış + d.Kararsız > 0)
      .sort((a, b) => (b.Doğru + b.Yanlış + b.Kararsız) - (a.Doğru + a.Yanlış + a.Kararsız));
  }, [opinions]);

  if (opinions.length === 0 || chartData.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 ${className}`}
    >
      <h3 className="mb-4 text-sm font-semibold text-white">
        {commentatorName} — Pozisyon Tipine Göre Değerlendirmeler
      </h3>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-zinc-500">Gösterim:</span>
        <button
          type="button"
          onClick={() => setChartType("grouped")}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            chartType === "grouped"
              ? "bg-red-500/20 text-red-400"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Yan yana
        </button>
        <button
          type="button"
          onClick={() => setChartType("stacked")}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            chartType === "stacked"
              ? "bg-red-500/20 text-red-400"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Üst üste
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              type="number"
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={{ stroke: "#52525b" }}
            />
            <YAxis
              type="category"
              dataKey="kategori"
              width={70}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={{ stroke: "#52525b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [
                `${value} değerlendirme`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => (
                <span className="text-zinc-300">{value}</span>
              )}
            />
            <Bar
              dataKey="Doğru"
              stackId={chartType === "stacked" ? "stack" : undefined}
              fill="#22c55e"
              fillOpacity={0.8}
              radius={[0, 2, 2, 0]}
            />
            <Bar
              dataKey="Yanlış"
              stackId={chartType === "stacked" ? "stack" : undefined}
              fill="#ef4444"
              fillOpacity={0.8}
              radius={[0, 2, 2, 0]}
            />
            <Bar
              dataKey="Kararsız"
              stackId={chartType === "stacked" ? "stack" : undefined}
              fill="#71717a"
              fillOpacity={0.8}
              radius={[0, 2, 2, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
