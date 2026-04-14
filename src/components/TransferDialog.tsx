"use client";

import { useState } from "react";
import { Item } from "@/lib/types";

interface Props {
  item: Item;
  departments: string[];
  onConfirm: (department: string, quantity: number) => Promise<void>;
  onCancel: () => void;
}

export default function TransferDialog({
  item,
  departments,
  onConfirm,
  onCancel,
}: Props) {
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState(item.marketingQuantity);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (!department.trim()) errs.push("Zadejte oddělení.");
    if (quantity <= 0) errs.push("Množství musí být kladné.");
    if (quantity > item.marketingQuantity)
      errs.push(`Max. ${item.marketingQuantity} ks.`);

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onConfirm(department.trim(), quantity);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepodařilo se předat.";
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-24 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm"
      >
        <h3 className="text-base font-semibold mb-1">Předat materiál</h3>
        <p className="text-sm text-gray-500 mb-4">
          {item.name} — k dispozici {item.marketingQuantity} ks
        </p>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm text-red-700">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Oddělení *</label>
          <input
            type="text"
            list="dept-suggestions"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="např. Recepce, PET/CT, Klientský servis…"
            className="w-full border rounded px-3 py-2 text-sm"
            autoFocus
          />
          <datalist id="dept-suggestions">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Množství *</label>
          <input
            type="number"
            min={1}
            max={item.marketingQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Předávám…" : "Předat"}
          </button>
        </div>
      </form>
    </div>
  );
}
