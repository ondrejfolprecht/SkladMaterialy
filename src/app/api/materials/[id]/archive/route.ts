import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/materials/:id/archive
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(params.id) },
    });

    if (!material)
      return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });

    const updated = await prisma.material.update({
      where: { id: Number(params.id) },
      data: { status: "Ukončeno" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/materials/[id]/archive error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
