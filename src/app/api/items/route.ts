import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/items?status=active|archived&search=...&sort=name&order=asc
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const statusFilter = params.get("status") || "active";
    const search = params.get("search") || "";
    const sort = params.get("sort") || "createdAt";
    const order = params.get("order") || "desc";

    const allowedSort = [
      "name",
      "status",
      "printOrderedAt",
      "stockedAt",
      "createdAt",
    ];
    const sortField = allowedSort.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (statusFilter === "archived") {
      where.status = "Ukončeno";
    } else {
      where.status = { not: "Ukončeno" };
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const items = await prisma.item.findMany({
      where,
      include: { transfers: { orderBy: { transferredAt: "desc" } } },
      orderBy: { [sortField]: sortOrder },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání dat." },
      { status: 500 }
    );
  }
}

// POST /api/items
export async function POST(req: NextRequest) {
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

    let status = "V tisku";
    if (
      body.stockedAt &&
      (body.marketingQuantity > 0 || body.orderedQuantity > 0)
    ) {
      status = "Skladem u marketingu";
    }

    const item = await prisma.item.create({
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/items error:", error);
    return NextResponse.json(
      { error: "Chyba při ukládání." },
      { status: 500 }
    );
  }
}
