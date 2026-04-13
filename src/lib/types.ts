export interface Item {
  id: number;
  name: string;
  category: string;
  orderedQuantity: number;
  receptionQuantity: number;
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
}

export type ItemFormData = {
  name: string;
  category: string;
  orderedQuantity: number;
  receptionQuantity: number;
  marketingQuantity: number;
  productionLeadTimeDays: number | null;
  printOrderedAt: string;
  stockedAt: string;
  supplier: string;
  note: string;
  status?: string;
};

export const STATUSES = [
  "V tisku",
  "Skladem u marketingu",
  "Předáno recepci",
  "Ukončeno",
] as const;
