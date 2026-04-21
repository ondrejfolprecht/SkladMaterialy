import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function computeAlertFields(material: {
  currentStock: number;
  estimatedMonthlyUsage: number | null;
  estimatedLeadDays: number | null;
  avgActualLeadDays: number | null;
  movements: { quantity: number; movedAt: Date }[];
}) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Real usage from movements in last 90 days
  const recentMovements = material.movements.filter(
    (m) => new Date(m.movedAt) >= ninetyDaysAgo
  );
  const totalRecentUsage = recentMovements.reduce((s, m) => s + m.quantity, 0);
  const realMonthlyUsage = totalRecentUsage > 0 ? Math.round(totalRecentUsage / 3) : null;

  const estimated = material.estimatedMonthlyUsage ?? 0;
  const real = realMonthlyUsage ?? 0;
  const effectiveMonthlyUsage = Math.max(estimated, real);
  const effectiveDailyUsage = effectiveMonthlyUsage > 0 ? effectiveMonthlyUsage / 30 : null;

  let daysUntilEmpty: number | null = null;
  if (effectiveDailyUsage && effectiveDailyUsage > 0) {
    daysUntilEmpty = material.currentStock / effectiveDailyUsage;
  }

  const leadDays = material.avgActualLeadDays ?? material.estimatedLeadDays ?? 14;

  let alertLevel: "red" | "yellow" | "green" | "none" = "none";
  if (daysUntilEmpty !== null) {
    if (daysUntilEmpty <= leadDays) {
      alertLevel = "red";
    } else if (daysUntilEmpty <= leadDays * 1.5) {
      alertLevel = "yellow";
    } else {
      alertLevel = "green";
    }
  }

  // Human readable days of stock
  let daysOfStockText = "–";
  if (daysUntilEmpty !== null) {
    if (daysUntilEmpty <= 0) daysOfStockText = "0 dní";
    else if (daysUntilEmpty <= 7) daysOfStockText = `~${Math.round(daysUntilEmpty)} dní`;
    else if (daysUntilEmpty <= 60) daysOfStockText = `~${Math.round(daysUntilEmpty / 7)} týdnů`;
    else if (daysUntilEmpty <= 365) daysOfStockText = `~${Math.round(daysUntilEmpty / 30)} měsíců`;
    else daysOfStockText = `~${(daysUntilEmpty / 365).toFixed(1)} let`;
  }

  return {
    daysUntilEmpty: daysUntilEmpty !== null ? Math.round(daysUntilEmpty * 10) / 10 : null,
    alertLevel,
    realMonthlyUsage,
    effectiveDailyUsage: effectiveDailyUsage !== null ? Math.round(effectiveDailyUsage * 10) / 10 : null,
    daysOfStockText,
  };
}

// GET /api/materials?status=active|archived&search=...
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const statusFilter = params.get("status") || "active";
    const search = params.get("search") || "";

    const where: Record<string, unknown> = {};

    if (statusFilter === "archived") {
      where.status = "Ukončeno";
    } else {
      where.status = { not: "Ukončeno" };
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        movements: { orderBy: { movedAt: "desc" } },
      },
      orderBy: { name: "asc" },
    });

    const result = materials.map((mat) => {
      const computed = computeAlertFields(mat);
      return { ...mat, ...computed };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/materials error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání dat." },
      { status: 500 }
    );
  }
}

// POST /api/materials
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Název je povinný.");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const material = await prisma.material.create({
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

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("POST /api/materials error:", error);
    return NextResponse.json(
      { error: "Chyba při ukládání." },
      { status: 500 }
    );
  }
}
