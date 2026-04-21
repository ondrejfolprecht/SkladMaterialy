export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "–";
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
  if (days === null || days < 0) return "–";
  if (days === 0) return "0 dní";
  if (days <= 7) return `~${Math.round(days)} dní`;
  if (days <= 60) return `~${Math.round(days / 7)} týdnů`;
  if (days <= 365) return `~${Math.round(days / 30)} měsíců`;
  return `~${(days / 365).toFixed(1)} let`;
}
