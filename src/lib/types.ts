export interface Movement {
  id: number;
  materialId: number;
  department: string;
  quantity: number;
  movedAt: string;
}

export interface Order {
  id: number;
  materialId: number;
  quantity: number;
  orderedAt: string | null;
  stockedAt: string | null;
  actualLeadDays: number | null;
  status: string;
  note: string;
  createdAt: string;
}

export interface Material {
  id: number;
  name: string;
  category: string;
  supplier: string;
  estimatedLeadDays: number | null;
  avgActualLeadDays: number | null;
  estimatedMonthlyUsage: number | null;
  currentStock: number;
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  movements: Movement[];
  // Computed fields from API
  daysUntilEmpty: number | null;
  alertLevel: "red" | "yellow" | "green" | "none";
  realMonthlyUsage: number | null;
  effectiveDailyUsage: number | null;
  daysOfStockText: string;
}

export type MaterialFormData = {
  name: string;
  category: string;
  supplier: string;
  estimatedLeadDays: number | null;
  estimatedMonthlyUsage: number | null;
  note: string;
};

export type OrderFormData = {
  quantity: number;
  orderedAt: string;
};

export type MovementFormData = {
  department: string;
  quantity: number;
};

export const CATEGORIES = [
  "Bro\u017eura",
  "Let\u00e1k",
  "Vizitka",
  "Katalog",
  "Pou\u010den\u00ed",
  "Ostatn\u00ed",
] as const;

export const MATERIAL_STATUSES = [
  "Aktivn\u00ed",
  "Ukon\u010deno",
] as const;

export const ORDER_STATUSES = [
  "V tisku",
  "Naskladn\u011bno",
] as const;
