import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { getResolvedVideoUrl } from "@/lib/incident-api";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        match: {
          include: {
            referee: { select: { id: true, name: true, slug: true, role: true } },
            varReferee: { select: { id: true, name: true, slug: true, role: true } },
          },
        },
        opinions: {
          include: {
            commentator: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ...incident,
        sources: parseJson(incident.sources, []),
        videoUrl: await getResolvedVideoUrl(incident),
        refereeComments: parseJson(incident.refereeComments, []),
        relatedVideos: parseJson(incident.relatedVideos, []),
        newsArticles: parseJson(incident.newsArticles, []),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/incidents/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, description, minute, type, mergeWithId, videoUrl, relatedVideos, refereeComments, newsArticles, inFavorOf, against } = body;

    if (mergeWithId) {
      const sourceIncident = await prisma.incident.findUnique({
        where: { id: mergeWithId },
      });
      if (!sourceIncident) {
        return NextResponse.json(
          { error: "Source incident for merge not found" },
          { status: 404 }
        );
      }

      const targetIncident = await prisma.incident.findUnique({
        where: { id },
      });
      if (!targetIncident) {
        return NextResponse.json(
          { error: "Target incident not found" },
          { status: 404 }
        );
      }

      const targetSources = parseJson<string[]>(targetIncident.sources, []);
      const sourceSources = parseJson<string[]>(sourceIncident.sources, []);
      const mergedSources = [...targetSources, ...sourceSources];

      const updated = await prisma.incident.update({
        where: { id },
        data: {
          description: `${targetIncident.description}\n\nMerged: ${sourceIncident.description}`,
          confidenceScore: Math.max(
            targetIncident.confidenceScore,
            sourceIncident.confidenceScore
          ),
          sources: JSON.stringify(mergedSources),
        },
      });

      await prisma.incident.delete({ where: { id: mergeWithId } });

      return NextResponse.json({
        ...updated,
        sources: parseJson(updated.sources, []),
        refereeComments: parseJson(updated.refereeComments, []),
        relatedVideos: parseJson(updated.relatedVideos, []),
        newsArticles: parseJson(updated.newsArticles, []),
      });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (description) updateData.description = description;
    if (minute !== undefined) updateData.minute = minute ? parseInt(minute) : null;
    if (type) updateData.type = type;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    if (relatedVideos !== undefined) updateData.relatedVideos = typeof relatedVideos === "string" ? relatedVideos : JSON.stringify(relatedVideos);
    if (refereeComments !== undefined) updateData.refereeComments = typeof refereeComments === "string" ? refereeComments : JSON.stringify(refereeComments);
    if (newsArticles !== undefined) updateData.newsArticles = typeof newsArticles === "string" ? newsArticles : JSON.stringify(newsArticles);
    if (inFavorOf !== undefined) updateData.inFavorOf = inFavorOf || null;
    if (against !== undefined) updateData.against = against || null;

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...incident,
      sources: parseJson(incident.sources, []),
      refereeComments: parseJson(incident.refereeComments, []),
      relatedVideos: parseJson(incident.relatedVideos, []),
      newsArticles: parseJson(incident.newsArticles, []),
    });
  } catch (err) {
    console.error("PATCH /api/incidents/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.incident.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/incidents/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
