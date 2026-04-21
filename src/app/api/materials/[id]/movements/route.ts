import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/materials/:id/movements — new movement/transfer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const materialId = Number(params.id);

    const errors: string[] = [];
    if (!body.department?.trim()) errors.push("Oddělení je povinné.");
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

    const quantity = Number(body.quantity);
    if (quantity > material.currentStock) {
      return NextResponse.json(
        { errors: [`Nelze předat více než je na skladě (${material.currentStock} ks).`] },
        { status: 400 }
      );
    }

    await prisma.movement.create({
      data: {
        materialId,
        department: body.department.trim(),
        quantity,
      },
    });

    const updated = await prisma.material.update({
      where: { id: materialId },
      data: {
        currentStock: material.currentStock - quantity,
      },
      include: { orders: true, movements: { orderBy: { movedAt: "desc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/materials/[id]/movements error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
