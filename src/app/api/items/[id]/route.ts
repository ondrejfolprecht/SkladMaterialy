import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/items/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(params.id) },
      include: { transfers: { orderBy: { transferredAt: "desc" } } },
    });
    if (!item)
      return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/items/[id] error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}

// PUT /api/items/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Název je povinný.");
    if (body.orderedQuantity == null || body.orderedQuantity < 0)
      errors.push("Objednané množství musí být nezáporné číslo.");
    if (body.marketingQuantity != null && body.marketingQuantity < 0)
      errors.push("Množství u marketingu nesmí být záporné.");
    if (
      body.productionLeadTimeDays != null &&
      body.productionLeadTimeDays < 0
    )
      errors.push("Výrobní lhůta nesmí být záporná.");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    let status = body.status;
    if (body.stockedAt && (body.status === "V tisku" || !body.status)) {
      status = "Skladem u marketingu";
    }

    const item = await prisma.item.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name.trim(),
        category: body.category?.trim() || "",
        orderedQuantity: Number(body.orderedQuantity),
        marketingQuantity: Number(body.marketingQuantity || 0),
        productionLeadTimeDays: body.productionLeadTimeDays
          ? Number(body.productionLeadTimeDays)
          : null,
        printOrderedAt: body.printOrderedAt
          ? new Date(body.printOrderedAt)
          : null,
        stockedAt: body.stockedAt ? new Date(body.stockedAt) : null,
        status,
        supplier: body.supplier?.trim() || "",
        note: body.note?.trim() || "",
      },
      include: { transfers: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/items/[id] error:", error);
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}
