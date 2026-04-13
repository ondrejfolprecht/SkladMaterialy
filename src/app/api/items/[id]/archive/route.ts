import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/items/:id/archive — Ukončit položku
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(params.id) },
    });

    if (!item)
      return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });

    const updated = await prisma.item.update({
      where: { id: Number(params.id) },
      data: { status: "Ukončeno" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/items/[id]/archive error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
