-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "ordered_quantity" INTEGER NOT NULL,
    "reception_quantity" INTEGER NOT NULL DEFAULT 0,
    "marketing_quantity" INTEGER NOT NULL DEFAULT 0,
    "production_lead_time_days" INTEGER,
    "print_ordered_at" DATETIME,
    "stocked_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'V tisku',
    "reorder_flag" BOOLEAN NOT NULL DEFAULT false,
    "supplier" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
