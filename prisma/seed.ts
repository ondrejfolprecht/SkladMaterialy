import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Katalog A4 – skladem u marketingu
  const katalog = await prisma.item.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Katalog A4",
      category: "Katalogy",
      orderedQuantity: 1000,
      marketingQuantity: 200,
      productionLeadTimeDays: 10,
      printOrderedAt: new Date("2026-03-20"),
      stockedAt: new Date("2026-03-28"),
      status: "Skladem u marketingu",
      supplier: "Tiskárna Havel",
      note: "Standardní katalog pro recepci",
    },
  });

  // Transfer for Katalog A4
  const existingTransfer = await prisma.transfer.findFirst({
    where: { itemId: katalog.id },
  });
  if (!existingTransfer) {
    await prisma.transfer.create({
      data: {
        itemId: katalog.id,
        department: "Recepce",
        quantity: 500,
        transferredAt: new Date("2026-03-29"),
      },
    });
    await prisma.transfer.create({
      data: {
        itemId: katalog.id,
        department: "Klientský servis",
        quantity: 300,
        transferredAt: new Date("2026-04-02"),
      },
    });
  }

  // Brožura produktů – v tisku
  await prisma.item.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Brožura produktů",
      category: "Brožury",
      orderedQuantity: 500,
      marketingQuantity: 0,
      productionLeadTimeDays: 14,
      printOrderedAt: new Date("2026-04-05"),
      stockedAt: null,
      status: "V tisku",
      supplier: "PrintExpress s.r.o.",
      note: "Nový design Q2 2026",
    },
  });

  // Vizitky recepce – ukončeno
  const vizitky = await prisma.item.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Vizitky recepce",
      category: "Vizitky",
      orderedQuantity: 200,
      marketingQuantity: 0,
      productionLeadTimeDays: 5,
      printOrderedAt: new Date("2026-01-10"),
      stockedAt: new Date("2026-01-14"),
      status: "Ukončeno",
      supplier: "Tiskárna Havel",
      note: "Starý design, nahrazeno novou verzí",
    },
  });

  const existingVizitkyTransfer = await prisma.transfer.findFirst({
    where: { itemId: vizitky.id },
  });
  if (!existingVizitkyTransfer) {
    await prisma.transfer.create({
      data: {
        itemId: vizitky.id,
        department: "Recepce",
        quantity: 200,
        transferredAt: new Date("2026-01-15"),
      },
    });
  }

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
