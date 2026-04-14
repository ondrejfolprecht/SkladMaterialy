import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/items/:id/stock — Naskladnit (celé množství do marketingu, datum = dnes)
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
    if (item.status !== "V tisku")
      return NextResponse.json(
        { error: "Položka není ve stavu 'V tisku'." },
        { status: 400 }
      );

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: {
        marketingQuantity: item.orderedQuantity,
        stockedAt: new Date(),
        status: "Skladem u marketingu",
      },
      include: { transfers: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/items/[id]/stock error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
