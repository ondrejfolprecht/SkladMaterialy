-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate existing reception_quantity data to transfers
INSERT INTO "transfers" ("item_id", "department", "quantity", "transferred_at")
SELECT "id", 'Recepce', "reception_quantity", COALESCE("stocked_at", "created_at")
FROM "items"
WHERE "reception_quantity" > 0;

-- Drop old column
ALTER TABLE "items" DROP COLUMN "reception_quantity";
