import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/materials/:id/orders — new order
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const materialId = Number(params.id);

    const errors: string[] = [];
    if (!body.quantity || body.quantity <= 0)
      errors.push("Množství musí být kladné číslo.");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material)
      return NextResponse.json({ error: "Materiál nenalezen" }, { status: 404 });

    const order = await prisma.order.create({
      data: {
        materialId,
        quantity: Number(body.quantity),
        orderedAt: body.orderedAt ? new Date(body.orderedAt) : new Date(),
        status: "V tisku",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/materials/[id]/orders error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
