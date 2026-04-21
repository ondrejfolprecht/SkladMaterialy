export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2013";
  return new Date(dateStr).toLocaleDateString("cs-CZ");
}

export function calcActualLeadDays(
  orderedAt: string | null,
  stockedAt: string | null
): number | null {
  if (!orderedAt || !stockedAt) return null;
  const diff =
    new Date(stockedAt).getTime() - new Date(orderedAt).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export function daysToHumanText(days: number | null): string {
  if (days === null || days < 0) return "\u2013";
  if (days === 0) return "0 dn\u00ed";
  if (days <= 7) return `~${Math.round(days)} dn\u00ed`;
  if (days <= 60) return `~${Math.round(days / 7)} t\u00fddn\u016f`;
  if (days <= 365) return `~${Math.round(days / 30)} m\u011bs\u00edc\u016f`;
  return `~${(days / 365).toFixed(1)} let`;
}
