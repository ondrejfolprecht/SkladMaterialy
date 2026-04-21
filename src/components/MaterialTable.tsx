"use client";

import { Material } from "@/lib/types";

interface Props {
  materials: Material[];
  onNavigate: (id: number) => void;
  onTransfer: (material: Material) => void;
  onOrder: (material: Material) => void;
  isArchive: boolean;
}

const ALERT_DOTS: Record<string, string> = {
  red: "\uD83D\uDD34",
  yellow: "\uD83D\uDFE1",
  green: "\uD83D\uDFE2",
  none: "\u2013",
};

export default function MaterialTable({
  materials,
  onNavigate,
  onTransfer,
  onOrder,
  isArchive,
}: Props) {
  if (materials.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        {isArchive
          ? "\u017d\u00e1dn\u00e9 ukon\u010den\u00e9 materi\u00e1ly."
          : "\u017d\u00e1dn\u00e9 aktivn\u00ed materi\u00e1ly. P\u0159idejte prvn\u00ed tiskovinu."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N\u00e1zev</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kat.</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sklad</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Spot\u0159eba/m\u011bs</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Z\u00e1soby na</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stav obj.</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Alert</th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {materials.map((mat) => {
            const latestOrder = mat.orders?.[0];
            const orderStatus = latestOrder?.status || "\u2013";

            // Usage display
            const estimated = mat.estimatedMonthlyUsage;
            const real = mat.realMonthlyUsage;
            let usageDisplay = "\u2013";
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

            return (
              <tr
                key={mat.id}
                className="hover:bg-gray-50 h-12 cursor-pointer"
                onClick={() => onNavigate(mat.id)}
              >
                <td className="px-3 py-1.5 font-medium text-sm">
                  {mat.name}
                  {mat.note && (
                    <span className="text-gray-300 ml-1" title={mat.note}>*</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-gray-500">{mat.category || "\u2013"}</td>
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
                        : orderStatus === "Naskladn\u011bno"
                        ? "bg-green-100 text-green-800"
                        : "text-gray-400"
                    }`}
                  >
                    {orderStatus}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-center text-base">
                  {ALERT_DOTS[mat.alertLevel] || "\u2013"}
                </td>
                <td className="px-2 py-1.5 text-right whitespace-nowrap">
                  {!isArchive && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransfer(mat);
                        }}
                        className="text-green-600 hover:underline mr-2"
                        disabled={mat.currentStock <= 0}
                      >
                        P\u0159edat
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
