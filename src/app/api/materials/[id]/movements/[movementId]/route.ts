import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/materials/:id/movements/:movementId — upravit pohyb
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; movementId: string } }
) {
  try {
    const body = await req.json();
    const materialId = Number(params.id);
    const movementId = Number(params.movementId);

    const movement = await prisma.movement.findUnique({
      where: { id: movementId },
    });

    if (!movement || movement.materialId !== materialId) {
      return NextResponse.json({ error: "Pohyb nenalezen" }, { status: 404 });
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: "Materiál nenalezen" }, { status: 404 });
    }

    const errors: string[] = [];
    const newDepartment = body.department?.trim();
    const newQuantity = Number(body.quantity);
    const newMovedAt = body.movedAt ? new Date(body.movedAt) : movement.movedAt;

    if (!newDepartment) errors.push("Oddělení je povinné.");
    if (!newQuantity || newQuantity <= 0)
      errors.push("Množství musí být kladné číslo.");

    // Vrátíme původní množství zpět na sklad, pak odečteme nové
    const availableStock = material.currentStock + movement.quantity;
    const stockAfter = availableStock - newQuantity;
    if (stockAfter < 0) {
      errors.push(`Max. ${availableStock} ks (vč. vráceného množství z tohoto pohybu).`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    await prisma.movement.update({
      where: { id: movementId },
      data: {
        department: newDepartment,
        quantity: newQuantity,
        movedAt: newMovedAt,
      },
    });

    const updated = await prisma.material.update({
      where: { id: materialId },
      data: { currentStock: stockAfter },
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        movements: { orderBy: { movedAt: "desc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "PUT /api/materials/[id]/movements/[movementId] error:",
      error
    );
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}

// DELETE /api/materials/:id/movements/:movementId — smazat pohyb (vrátí množství zpět na sklad)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; movementId: string } }
) {
  try {
    const materialId = Number(params.id);
    const movementId = Number(params.movementId);

    const movement = await prisma.movement.findUnique({
      where: { id: movementId },
    });

    if (!movement || movement.materialId !== materialId) {
      return NextResponse.json({ error: "Pohyb nenalezen" }, { status: 404 });
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: "Materiál nenalezen" }, { status: 404 });
    }

    await prisma.movement.delete({ where: { id: movementId } });

    const updated = await prisma.material.update({
      where: { id: materialId },
      data: { currentStock: material.currentStock + movement.quantity },
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        movements: { orderBy: { movedAt: "desc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "DELETE /api/materials/[id]/movements/[movementId] error:",
      error
    );
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
