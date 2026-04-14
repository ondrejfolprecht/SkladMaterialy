import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Vyčistit vše
  await prisma.transfer.deleteMany();
  await prisma.item.deleteMany();

  // Katalog A4 – skladem u marketingu, částečně předáno
  const katalog = await prisma.item.create({
    data: {
      name: "Katalog A4",
      category: "Katalog",
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

  await prisma.transfer.createMany({
    data: [
      {
        itemId: katalog.id,
        department: "Recepce",
        quantity: 500,
        transferredAt: new Date("2026-03-29"),
      },
      {
        itemId: katalog.id,
        department: "Klientský servis",
        quantity: 300,
        transferredAt: new Date("2026-04-02"),
      },
    ],
  });

  // Brožura produktů – v tisku
  await prisma.item.create({
    data: {
      name: "Brožura produktů",
      category: "Brožura",
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

  console.log("Seed data created (clean).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
