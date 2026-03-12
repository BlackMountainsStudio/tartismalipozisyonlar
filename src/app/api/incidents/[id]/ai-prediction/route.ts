import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

/** AI karar tahmini - şimdilik incident type'a göre heuristik, ileride model ile değiştirilebilir */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      select: { type: true, description: true },
    });

    if (!incident) {
      return NextResponse.json({ error: "Pozisyon bulunamadı" }, { status: 404 });
    }

    // Heuristik tahmin - incident type'a göre tipik dağılım
    const predictions: Record<string, number> = {
      PENALTY: 0,
      CONTINUE: 0,
      YELLOW_CARD: 0,
      RED_CARD: 0,
    };

    switch (incident.type) {
      case "PENALTY":
      case "POSSIBLE_PENALTY":
        predictions.PENALTY = 72;
        predictions.CONTINUE = 21;
        predictions.YELLOW_CARD = 7;
        break;
      case "RED_CARD":
      case "MISSED_RED_CARD":
        predictions.RED_CARD = 75;
        predictions.YELLOW_CARD = 18;
        predictions.CONTINUE = 7;
        break;
      case "YELLOW_CARD":
      case "MISSED_YELLOW":
        predictions.YELLOW_CARD = 68;
        predictions.CONTINUE = 25;
        predictions.RED_CARD = 7;
        break;
      case "GOAL_DISALLOWED":
      case "OFFSIDE":
      case "POSSIBLE_OFFSIDE_GOAL":
        predictions.CONTINUE = 55;
        predictions.PENALTY = 0;
        break;
      case "FOUL":
      case "HANDBALL":
        predictions.PENALTY = 45;
        predictions.CONTINUE = 40;
        predictions.YELLOW_CARD = 15;
        break;
      default:
        predictions.CONTINUE = 50;
        predictions.PENALTY = 25;
        predictions.YELLOW_CARD = 15;
        predictions.RED_CARD = 10;
    }

    return NextResponse.json(
      {
        predictions: {
          PENALTY: predictions.PENALTY,
          CONTINUE: predictions.CONTINUE,
          YELLOW_CARD: predictions.YELLOW_CARD,
          RED_CARD: predictions.RED_CARD,
        },
        labels: {
          PENALTY: "Penaltı",
          CONTINUE: "Devam",
          YELLOW_CARD: "Sarı Kart",
          RED_CARD: "Kırmızı Kart",
        },
        note: "Heuristik tahmin - AI model entegrasyonu planlanıyor",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/incidents/[id]/ai-prediction error:", err);
    return NextResponse.json(
      { error: "Tahmin alınamadı" },
      { status: 500 }
    );
  }
}
