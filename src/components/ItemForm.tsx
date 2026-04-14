"use client";

import { useState, useEffect } from "react";
import { Item, ItemFormData, STATUSES } from "@/lib/types";
import { calcActualLeadDays, toInputDate } from "@/lib/helpers";

interface Props {
  item?: Item | null;
  onSave: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ItemForm({ item, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ItemFormData>({
    name: "",
    category: "",
    orderedQuantity: 0,
    marketingQuantity: 0,
    productionLeadTimeDays: null,
    printOrderedAt: "",
    stockedAt: "",
    supplier: "",
    note: "",
    status: "V tisku",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        category: item.category,
        orderedQuantity: item.orderedQuantity,
        marketingQuantity: item.marketingQuantity,
        productionLeadTimeDays: item.productionLeadTimeDays,
        printOrderedAt: toInputDate(item.printOrderedAt),
        stockedAt: toInputDate(item.stockedAt),
        supplier: item.supplier,
        note: item.note,
        status: item.status,
      });
    }
  }, [item]);

  const actualLead = calcActualLeadDays(form.printOrderedAt, form.stockedAt);

  const transferredTotal =
    item?.transfers?.reduce((sum, t) => sum + t.quantity, 0) || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Název je povinný.");
    if (form.orderedQuantity < 0)
      errs.push("Objednané množství nesmí být záporné.");
    if (form.marketingQuantity < 0)
      errs.push("Množství u marketingu nesmí být záporné.");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepodařilo se uložit.";
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  }

  function set(field: keyof ItemFormData, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-12 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold mb-4">
          {item ? "Upravit položku" : "Nová položka"}
        </h2>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Název *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategorie</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dodavatel</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => set("supplier", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Objednané množství *
            </label>
            <input
              type="number"
              min={0}
              value={form.orderedQuantity}
              onChange={(e) => set("orderedQuantity", Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Výrobní lhůta (dní)
            </label>
            <input
              type="number"
              min={0}
              value={form.productionLeadTimeDays ?? ""}
              onChange={(e) =>
                set(
                  "productionLeadTimeDays",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              U marketingu (ks)
            </label>
            <input
              type="number"
              min={0}
              value={form.marketingQuantity}
              onChange={(e) =>
                set("marketingQuantity", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {item && transferredTotal > 0 && (
            <div className="flex items-end pb-2">
              <span className="text-sm text-gray-500">
                Předáno celkem: {transferredTotal} ks
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Datum zadání do tisku
            </label>
            <input
              type="date"
              value={form.printOrderedAt}
              onChange={(e) => set("printOrderedAt", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Datum naskladnění
            </label>
            <input
              type="date"
              value={form.stockedAt}
              onChange={(e) => set("stockedAt", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {actualLead !== null && (
            <div className="col-span-2 text-sm text-gray-600">
              Skutečná doba výroby: <strong>{actualLead} dní</strong>
            </div>
          )}

          {item && (
            <div>
              <label className="block text-sm font-medium mb-1">Stav</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Poznámka</label>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit"}
          </button>
        </div>
      </form>
    </div>
  );
}
