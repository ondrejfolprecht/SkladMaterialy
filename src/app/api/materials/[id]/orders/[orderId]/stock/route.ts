import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/materials/:id/orders/:orderId/stock — stock an order
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const materialId = Number(params.id);
    const orderId = Number(params.orderId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, materialId },
    });

    if (!order)
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });

    if (order.status === "Naskladněno")
      return NextResponse.json(
        { error: "Objednávka již byla naskladněna." },
        { status: 400 }
      );

    const stockedAt = new Date();
    let actualLeadDays: number | null = null;

    if (order.orderedAt) {
      const diff = stockedAt.getTime() - new Date(order.orderedAt).getTime();
      actualLeadDays = Math.round(diff / (1000 * 60 * 60 * 24));
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stockedAt,
        actualLeadDays,
        status: "Naskladněno",
      },
    });

    // Add quantity to material currentStock
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { orders: { where: { status: "Naskladněno", actualLeadDays: { not: null } } } },
    });

    if (!material)
      return NextResponse.json({ error: "Materiál nenalezen" }, { status: 404 });

    // Compute new avg actual lead days including this order
    const allLeadDays = material.orders
      .map((o) => o.actualLeadDays)
      .filter((d): d is number => d !== null);
    if (actualLeadDays !== null) {
      allLeadDays.push(actualLeadDays);
    }
    const avgActualLeadDays =
      allLeadDays.length > 0
        ? Math.round((allLeadDays.reduce((s, d) => s + d, 0) / allLeadDays.length) * 10) / 10
        : null;

    const updated = await prisma.material.update({
      where: { id: materialId },
      data: {
        currentStock: material.currentStock + order.quantity,
        avgActualLeadDays,
      },
      include: { orders: true, movements: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/materials/[id]/orders/[orderId]/stock error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}
