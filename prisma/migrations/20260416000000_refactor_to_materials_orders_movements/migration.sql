-- Create new tables
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "supplier" TEXT NOT NULL DEFAULT '',
    "estimated_lead_days" INTEGER,
    "avg_actual_lead_days" DOUBLE PRECISION,
    "estimated_monthly_usage" INTEGER,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Aktivní',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "ordered_at" TIMESTAMP(3),
    "stocked_at" TIMESTAMP(3),
    "actual_lead_days" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'V tisku',
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movements" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- Migrate items -> materials + orders
INSERT INTO "materials" ("name", "category", "supplier", "estimated_lead_days", "current_stock", "note", "status", "created_at", "updated_at")
SELECT
    "name",
    COALESCE("category", ''),
    COALESCE("supplier", ''),
    "production_lead_time_days",
    "marketing_quantity",
    COALESCE("note", ''),
    CASE WHEN "status" = 'Ukončeno' THEN 'Ukončeno' ELSE 'Aktivní' END,
    "created_at",
    "updated_at"
FROM "items";

-- Create orders from items (one order per item)
INSERT INTO "orders" ("material_id", "quantity", "ordered_at", "stocked_at", "actual_lead_days", "status", "created_at")
SELECT
    m."id",
    i."ordered_quantity",
    i."print_ordered_at",
    i."stocked_at",
    CASE
        WHEN i."print_ordered_at" IS NOT NULL AND i."stocked_at" IS NOT NULL
        THEN EXTRACT(DAY FROM (i."stocked_at" - i."print_ordered_at"))::INTEGER
        ELSE NULL
    END,
    CASE WHEN i."stocked_at" IS NOT NULL THEN 'Naskladněno' ELSE 'V tisku' END,
    i."created_at"
FROM "items" i
JOIN "materials" m ON m."name" = i."name" AND m."created_at" = i."created_at";

-- Migrate transfers -> movements
INSERT INTO "movements" ("material_id", "department", "quantity", "moved_at")
SELECT
    m."id",
    t."department",
    t."quantity",
    t."transferred_at"
FROM "transfers" t
JOIN "items" i ON i."id" = t."item_id"
JOIN "materials" m ON m."name" = i."name" AND m."created_at" = i."created_at";

-- Drop old tables
DROP TABLE "transfers";
DROP TABLE "items";

-- Add foreign keys
ALTER TABLE "orders" ADD CONSTRAINT "orders_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movements" ADD CONSTRAINT "movements_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
