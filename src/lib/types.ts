export interface Transfer {
  id: number;
  itemId: number;
  department: string;
  quantity: number;
  transferredAt: string;
}

export interface Item {
  id: number;
  name: string;
  category: string;
  orderedQuantity: number;
  marketingQuantity: number;
  productionLeadTimeDays: number | null;
  printOrderedAt: string | null;
  stockedAt: string | null;
  status: string;
  reorderFlag: boolean;
  supplier: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  transfers: Transfer[];
}

export type ItemFormData = {
  name: string;
  category: string;
  orderedQuantity: number;
  marketingQuantity: number;
  productionLeadTimeDays: number | null;
  printOrderedAt: string;
  stockedAt: string;
  supplier: string;
  note: string;
  status?: string;
};

export type TransferFormData = {
  department: string;
  quantity: number;
};

export const STATUSES = [
  "V tisku",
  "Skladem u marketingu",
  "Předáno",
  "Ukončeno",
] as const;
