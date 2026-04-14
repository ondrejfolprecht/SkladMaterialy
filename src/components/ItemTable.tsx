"use client";

import { Item } from "@/lib/types";
import { formatDate, calcActualLeadDays } from "@/lib/helpers";

interface Props {
  items: Item[];
  onEdit: (item: Item) => void;
  onTransfer: (item: Item) => void;
  onStock: (item: Item) => void;
  onDelete?: (item: Item) => void;
  sort: string;
  order: string;
  onSort: (field: string) => void;
  isArchive: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  "V tisku": "bg-yellow-100 text-yellow-800",
  "Skladem u marketingu": "bg-green-100 text-green-800",
  "Předáno": "bg-blue-100 text-blue-800",
  Ukončeno: "bg-gray-100 text-gray-500",
};

function SortHeader({
  label,
  field,
  sort,
  order,
  onSort,
  className,
}: {
  label: string;
  field: string;
  sort: string;
  order: string;
  onSort: (f: string) => void;
  className?: string;
}) {
  const active = sort === field;
  return (
    <th
      className={`px-2 py-2 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 whitespace-nowrap ${className || "text-left"}`}
      onClick={() => onSort(field)}
    >
      {label}
      {active && (
        <span className="ml-0.5">{order === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}

function TransfersSummary({ item }: { item: Item }) {
  if (!item.transfers || item.transfers.length === 0) {
    return <span className="text-gray-300">–</span>;
  }

  // Group by department
  const byDept: Record<string, number> = {};
  for (const t of item.transfers) {
    byDept[t.department] = (byDept[t.department] || 0) + t.quantity;
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      {Object.entries(byDept).map(([dept, qty]) => (
        <span key={dept} className="text-xs">
          <span className="text-gray-500">{dept}:</span>{" "}
          <span className="font-medium">{qty}</span>
        </span>
      ))}
    </div>
  );
}

export default function ItemTable({
  items,
  onEdit,
  onTransfer,
  onStock,
  onDelete,
  sort,
  order,
  onSort,
  isArchive,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        {isArchive
          ? "Žádné ukončené položky."
          : "Žádné aktivní položky. Přidejte první tiskovinu."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b">
          <tr>
            <SortHeader label="Název" field="name" sort={sort} order={order} onSort={onSort} />
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kat.</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Obj.</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mktg</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Předáno</th>
            <SortHeader label="Zadáno" field="printOrderedAt" sort={sort} order={order} onSort={onSort} />
            <SortHeader label="Nasklad." field="stockedAt" sort={sort} order={order} onSort={onSort} />
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase" title="Plánovaná / skutečná výrobní lhůta">Lhůta</th>
            <SortHeader label="Stav" field="status" sort={sort} order={order} onSort={onSort} />
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const actualLead = calcActualLeadDays(
              item.printOrderedAt,
              item.stockedAt
            );
            const transferredTotal = item.transfers?.reduce(
              (sum, t) => sum + t.quantity,
              0
            ) || 0;
            const qtyMismatch =
              item.stockedAt &&
              transferredTotal + item.marketingQuantity !==
                item.orderedQuantity;

            const leadDisplay = [
              item.productionLeadTimeDays != null
                ? `${item.productionLeadTimeDays}d`
                : null,
              actualLead != null ? `${actualLead}d` : null,
            ]
              .filter(Boolean)
              .join(" / ");

            return (
              <tr key={item.id} className="hover:bg-gray-50 h-12">
                <td className="px-2 py-1.5 font-medium text-sm" title={item.note || undefined}>
                  {item.name}
                  {item.note && (
                    <span className="text-gray-300 ml-1" title={item.note}>*</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-gray-500">{item.category || "–"}</td>
                <td className="px-2 py-1.5 text-right">
                  {item.orderedQuantity.toLocaleString("cs-CZ")}
                  {qtyMismatch && item.orderedQuantity > 0 && (
                    <span
                      className="text-amber-500 ml-0.5"
                      title={`Předáno (${transferredTotal}) + marketing (${item.marketingQuantity}) ≠ objednáno (${item.orderedQuantity})`}
                    >
                      ⚠
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right">
                  {item.marketingQuantity.toLocaleString("cs-CZ")}
                </td>
                <td className="px-2 py-1.5">
                  <TransfersSummary item={item} />
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {formatDate(item.printOrderedAt)}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {formatDate(item.stockedAt)}
                </td>
                <td className="px-2 py-1.5 text-right whitespace-nowrap text-gray-500">
                  {leadDisplay || "–"}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[item.status] || "bg-gray-100"
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.reorderFlag && (
                    <span className="text-red-500 font-bold ml-1" title="Nutno doobjednat">!</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:underline mr-1.5"
                  >
                    Upravit
                  </button>
                  {!isArchive && item.status === "V tisku" && (
                    <button
                      onClick={() => onStock(item)}
                      className="text-purple-600 hover:underline mr-1.5"
                    >
                      Naskladnit
                    </button>
                  )}
                  {!isArchive && item.marketingQuantity > 0 && item.status !== "V tisku" && (
                    <button
                      onClick={() => onTransfer(item)}
                      className="text-green-600 hover:underline mr-1.5"
                    >
                      Předat
                    </button>
                  )}
                  {isArchive && onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-400 hover:text-red-600 hover:underline ml-1.5"
                    >
                      Smazat
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-4 px-3 py-2 text-[11px] text-gray-400 border-t">
        <span><span className="text-amber-500">⚠</span> Nesoulad množství (předáno + marketing ≠ objednáno)</span>
        <span><span className="text-red-500 font-bold">!</span> Nutno doobjednat</span>
        <span><span className="text-gray-300">*</span> Položka má poznámku (najeďte myší)</span>
      </div>
    </div>
  );
}
