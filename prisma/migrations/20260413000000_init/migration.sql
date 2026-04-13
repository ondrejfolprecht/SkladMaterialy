-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "ordered_quantity" INTEGER NOT NULL,
    "reception_quantity" INTEGER NOT NULL DEFAULT 0,
    "marketing_quantity" INTEGER NOT NULL DEFAULT 0,
    "production_lead_time_days" INTEGER,
    "print_ordered_at" TIMESTAMP(3),
    "stocked_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'V tisku',
    "reorder_flag" BOOLEAN NOT NULL DEFAULT false,
    "supplier" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);
