import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakemler | Var Odası",
  description: "Süper Lig hakemlerinin tartışmalı karar istatistikleri, maç bazlı analiz ve karşılaştırma. Hangi hakem kaç tartışmalı pozisyon yönetti?",
  alternates: {
    canonical: "https://varodasi.com/hakemler",
  },
  openGraph: {
    title: "Hakemler — Karar İstatistikleri | Var Odası",
    description: "Süper Lig hakemlerinin tartışmalı karar istatistikleri ve performans analizi.",
    url: "https://varodasi.com/hakemler",
  },
};

export default function HakemlerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
