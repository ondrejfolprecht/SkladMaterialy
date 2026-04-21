import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/materials/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(params.id) },
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        movements: { orderBy: { movedAt: "desc" } },
      },
    });
    if (!material)
      return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
    return NextResponse.json(material);
  } catch (error) {
    console.error("GET /api/materials/[id] error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}

// PUT /api/materials/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Název je povinný.");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const material = await prisma.material.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name.trim(),
        category: body.category?.trim() || "",
        supplier: body.supplier?.trim() || "",
        estimatedLeadDays: body.estimatedLeadDays != null ? Number(body.estimatedLeadDays) : null,
        estimatedMonthlyUsage: body.estimatedMonthlyUsage != null ? Number(body.estimatedMonthlyUsage) : null,
        note: body.note?.trim() || "",
      },
      include: { orders: true, movements: true },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("PUT /api/materials/[id] error:", error);
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}

// DELETE /api/materials/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.material.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/materials/[id] error:", error);
    return NextResponse.json({ error: "Chyba při mazání." }, { status: 500 });
  }
}
