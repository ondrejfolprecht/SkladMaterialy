"use client";

import { Material } from "@/lib/types";

interface Props {
  materials: Material[];
  onNavigate: (id: number) => void;
  onTransfer: (material: Material) => void;
  onOrder: (material: Material) => void;
  onUnarchive?: (material: Material) => void;
  isArchive: boolean;
}

const ROW_TINT: Record<string, string> = {
  red: "bg-red-50 hover:bg-red-100",
  yellow: "bg-amber-50 hover:bg-amber-100",
  green: "hover:bg-gray-50",
  none: "hover:bg-gray-50",
};

export default function MaterialTable({
  materials,
  onNavigate,
  onTransfer,
  onOrder,
  onUnarchive,
  isArchive,
}: Props) {
  if (materials.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        {isArchive
          ? "Žádné ukončené materiály."
          : "Žádné aktivní materiály. Přidejte první tiskovinu."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Název</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kat.</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sklad</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Spotřeba/měs</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zásoby na</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stav obj.</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {materials.map((mat) => {
            const latestOrder = mat.orders?.[0];
            const orderStatus = latestOrder?.status || "–";

            // Usage display
            const estimated = mat.estimatedMonthlyUsage;
            const real = mat.realMonthlyUsage;
            let usageDisplay = "–";
            if (estimated != null && real != null) {
              const diff = Math.abs(estimated - real) / Math.max(estimated, 1);
              if (diff > 0.2) {
                usageDisplay = `${estimated} (real: ${real})`;
              } else {
                usageDisplay = String(estimated);
              }
            } else if (estimated != null) {
              usageDisplay = String(estimated);
            } else if (real != null) {
              usageDisplay = `(real: ${real})`;
            }

            const rowTint = isArchive
              ? "hover:bg-gray-50"
              : ROW_TINT[mat.alertLevel] || "hover:bg-gray-50";

            return (
              <tr
                key={mat.id}
                className={`h-12 cursor-pointer transition-colors ${rowTint}`}
                onClick={() => onNavigate(mat.id)}
              >
                <td className="px-3 py-1.5 font-medium text-sm">
                  {mat.name}
                  {mat.note && (
                    <span className="text-gray-300 ml-1" title={mat.note}>*</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-gray-500">{mat.category || "–"}</td>
                <td className="px-2 py-1.5 text-right font-medium">
                  {mat.currentStock.toLocaleString("cs-CZ")}
                </td>
                <td className="px-2 py-1.5 text-right text-gray-600">{usageDisplay}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{mat.daysOfStockText}</td>
                <td className="px-2 py-1.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                      orderStatus === "V tisku"
                        ? "bg-yellow-100 text-yellow-800"
                        : orderStatus === "Naskladněno"
                        ? "bg-green-100 text-green-800"
                        : "text-gray-400"
                    }`}
                  >
                    {orderStatus}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right whitespace-nowrap">
                  {!isArchive && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransfer(mat);
                        }}
                        className="text-green-600 hover:underline mr-2 disabled:text-gray-300 disabled:no-underline"
                        disabled={mat.currentStock <= 0}
                      >
                        Předat
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrder(mat);
                        }}
                        className="text-purple-600 hover:underline mr-2"
                      >
                        Objednat
                      </button>
                    </>
                  )}
                  {isArchive && onUnarchive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnarchive(mat);
                      }}
                      className="text-green-600 hover:underline mr-2"
                    >
                      Obnovit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(mat.id);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
