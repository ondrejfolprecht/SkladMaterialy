import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/items/:id/transfer — Zásoba předána recepci
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await prisma.item.findUnique({
    where: { id: Number(params.id) },
  });

  if (!item) return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  if (item.status === "Ukončeno")
    return NextResponse.json({ error: "Položka je ukončená" }, { status: 400 });

  const updated = await prisma.item.update({
    where: { id: Number(params.id) },
    data: {
      receptionQuantity: item.receptionQuantity + item.marketingQuantity,
      marketingQuantity: 0,
      status: "Předáno recepci",
      reorderFlag: true,
    },
  });

  return NextResponse.json(updated);
}
