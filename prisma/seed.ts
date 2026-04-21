import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear everything
  await prisma.movement.deleteMany();
  await prisma.order.deleteMany();
  await prisma.material.deleteMany();

  // 1. Katalog A4
  const katalog = await prisma.material.create({
    data: {
      name: "Katalog A4",
      category: "Katalog",
      supplier: "Tisk\u00e1rna Havel",
      estimatedLeadDays: 45,
      avgActualLeadDays: 45,
      estimatedMonthlyUsage: 50,
      currentStock: 320,
      note: "Standardn\u00ed katalog pro recepci",
    },
  });

  await prisma.order.create({
    data: {
      materialId: katalog.id,
      quantity: 1000,
      orderedAt: new Date("2026-01-15"),
      stockedAt: new Date("2026-03-01"),
      actualLeadDays: 45,
      status: "Naskladn\u011bno",
    },
  });

  await prisma.movement.createMany({
    data: [
      {
        materialId: katalog.id,
        department: "Recepce",
        quantity: 400,
        movedAt: new Date("2026-03-05"),
      },
      {
        materialId: katalog.id,
        department: "Klientsk\u00fd servis",
        quantity: 280,
        movedAt: new Date("2026-03-20"),
      },
    ],
  });

  // 2. Vizitky recepce
  const vizitky = await prisma.material.create({
    data: {
      name: "Vizitky recepce",
      category: "Vizitka",
      supplier: "",
      estimatedLeadDays: 3,
      avgActualLeadDays: 2,
      estimatedMonthlyUsage: 80,
      currentStock: 15,
    },
  });

  await prisma.order.create({
    data: {
      materialId: vizitky.id,
      quantity: 500,
      orderedAt: new Date("2026-02-01"),
      stockedAt: new Date("2026-02-03"),
      actualLeadDays: 2,
      status: "Naskladn\u011bno",
    },
  });

  await prisma.movement.createMany({
    data: [
      {
        materialId: vizitky.id,
        department: "Recepce",
        quantity: 300,
        movedAt: new Date("2026-02-10"),
      },
      {
        materialId: vizitky.id,
        department: "PET/CT",
        quantity: 100,
        movedAt: new Date("2026-03-01"),
      },
      {
        materialId: vizitky.id,
        department: "Dokto\u0159i",
        quantity: 85,
        movedAt: new Date("2026-03-15"),
      },
    ],
  });

  // 3. Bro\u017eura produkt\u016f (in print, 0 stock)
  const brozura = await prisma.material.create({
    data: {
      name: "Bro\u017eura produkt\u016f",
      category: "Bro\u017eura",
      supplier: "PrintExpress s.r.o.",
      estimatedLeadDays: 14,
      estimatedMonthlyUsage: 30,
      currentStock: 0,
    },
  });

  await prisma.order.create({
    data: {
      materialId: brozura.id,
      quantity: 500,
      orderedAt: new Date("2026-04-05"),
      stockedAt: null,
      actualLeadDays: null,
      status: "V tisku",
    },
  });

  console.log("Seed data created (clean).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
