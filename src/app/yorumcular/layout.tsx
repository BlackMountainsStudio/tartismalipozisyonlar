import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yorumcular | Var Odası",
  description: "Futbol yorumcularının VAR ve hakem kararları hakkındaki görüşleri ve analizi. Hangi yorumcu ne kadar tartışmalı pozisyon değerlendirdi?",
  alternates: {
    canonical: "https://varodasi.com/yorumcular",
  },
  openGraph: {
    title: "Yorumcular — Karar Değerlendirmeleri | Var Odası",
    description: "Futbol yorumcularının tartışmalı hakem kararları hakkındaki görüş ve analizleri.",
    url: "https://varodasi.com/yorumcular",
  },
};

export default function YorumcularLayout({ children }: { children: React.ReactNode }) {
  return children;
}
