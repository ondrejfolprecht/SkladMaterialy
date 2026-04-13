export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleDateString("cs-CZ");
}

export function calcActualLeadDays(
  printOrderedAt: string | null,
  stockedAt: string | null
): number | null {
  if (!printOrderedAt || !stockedAt) return null;
  const diff =
    new Date(stockedAt).getTime() - new Date(printOrderedAt).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}
