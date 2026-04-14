import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/items/:id/transfer — Předat materiál oddělení
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const errors: string[] = [];
    if (!body.department?.trim()) errors.push("Oddělení je povinné.");
    if (!body.quantity || body.quantity <= 0)
      errors.push("Množství musí být kladné číslo.");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: Number(params.id) },
    });

    if (!item)
      return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
    if (item.status === "Ukončeno")
      return NextResponse.json(
        { error: "Položka je ukončená" },
        { status: 400 }
      );

    const quantity = Number(body.quantity);
    if (quantity > item.marketingQuantity) {
      return NextResponse.json(
        { errors: [`Nelze předat více než je u marketingu (${item.marketingQuantity} ks).`] },
        { status: 400 }
      );
    }

    const newMarketingQty = item.marketingQuantity - quantity;

    await prisma.transfer.create({
      data: {
        itemId: item.id,
        department: body.department.trim(),
        quantity,
      },
    });

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: {
        marketingQuantity: newMarketingQty,
        status: newMarketingQty === 0 ? "Předáno" : item.status,
        reorderFlag: newMarketingQty === 0 ? true : item.reorderFlag,
      },
      include: { transfers: { orderBy: { transferredAt: "desc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/items/[id]/transfer error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
