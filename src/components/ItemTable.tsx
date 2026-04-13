"use client";

import { Item } from "@/lib/types";
import { formatDate, calcActualLeadDays } from "@/lib/helpers";

interface Props {
  items: Item[];
  onEdit: (item: Item) => void;
  onTransfer: (item: Item) => void;
  onArchive: (item: Item) => void;
  sort: string;
  order: string;
  onSort: (field: string) => void;
  isArchive: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  "V tisku": "bg-yellow-100 text-yellow-800",
  "Skladem u marketingu": "bg-green-100 text-green-800",
  "Předáno recepci": "bg-blue-100 text-blue-800",
  Ukončeno: "bg-gray-100 text-gray-500",
};

function SortHeader({
  label,
  field,
  sort,
  order,
  onSort,
}: {
  label: string;
  field: string;
  sort: string;
  order: string;
  onSort: (f: string) => void;
}) {
  const active = sort === field;
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      {label}
      {active && (
        <span className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}

export default function ItemTable({
  items,
  onEdit,
  onTransfer,
  onArchive,
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
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <SortHeader label="Název" field="name" sort={sort} order={order} onSort={onSort} />
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Objednáno</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Recepce</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Marketing</th>
            <SortHeader label="Zadáno" field="printOrderedAt" sort={sort} order={order} onSort={onSort} />
            <SortHeader label="Naskladněno" field="stockedAt" sort={sort} order={order} onSort={onSort} />
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Výr. lhůta</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Skutečná</th>
            <SortHeader label="Stav" field="status" sort={sort} order={order} onSort={onSort} />
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Doobj.</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poznámka</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const actualLead = calcActualLeadDays(item.printOrderedAt, item.stockedAt);
            const qtyMismatch =
              item.receptionQuantity + item.marketingQuantity !==
              item.orderedQuantity;

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-gray-600">{item.category}</td>
                <td className="px-3 py-2 text-right">
                  {item.orderedQuantity.toLocaleString("cs-CZ")}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.receptionQuantity.toLocaleString("cs-CZ")}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.marketingQuantity.toLocaleString("cs-CZ")}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(item.printOrderedAt)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(item.stockedAt)}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.productionLeadTimeDays ?? "–"}
                </td>
                <td className="px-3 py-2 text-right">
                  {actualLead !== null ? `${actualLead} d` : "–"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[item.status] || "bg-gray-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  {item.reorderFlag ? (
                    <span className="text-red-500 font-bold" title="Nutno doobjednat">!</span>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate" title={item.note}>
                  {item.note || "–"}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {qtyMismatch && (
                    <span
                      className="text-amber-500 mr-2"
                      title={`Recepce + marketing ≠ objednáno`}
                    >
                      ⚠
                    </span>
                  )}
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:underline text-xs mr-2"
                  >
                    Upravit
                  </button>
                  {!isArchive && item.status !== "Ukončeno" && (
                    <>
                      {item.marketingQuantity > 0 && (
                        <button
                          onClick={() => onTransfer(item)}
                          className="text-green-600 hover:underline text-xs mr-2"
                          title="Převést zásobu marketingu na recepci"
                        >
                          Předat
                        </button>
                      )}
                      <button
                        onClick={() => onArchive(item)}
                        className="text-gray-400 hover:text-red-500 hover:underline text-xs"
                      >
                        Ukončit
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
