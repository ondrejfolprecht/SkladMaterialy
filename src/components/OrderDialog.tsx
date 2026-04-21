"use client";

import { useState } from "react";
import { Material } from "@/lib/types";

interface Props {
  material: Material;
  onConfirm: (quantity: number, orderedAt: string) => Promise<void>;
  onCancel: () => void;
}

export default function OrderDialog({ material, onConfirm, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [quantity, setQuantity] = useState(0);
  const [orderedAt, setOrderedAt] = useState(today);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (quantity <= 0) errs.push("Množství musí být kladné číslo.");
    if (!orderedAt) errs.push("Zadejte datum zadání do tisku.");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onConfirm(quantity, orderedAt);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepodařilo se vytvořit objednávku.";
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-24 z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm">
        <h3 className="text-base font-semibold mb-1">Nová objednávka</h3>
        <p className="text-sm text-gray-500 mb-4">{material.name}</p>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm text-red-700">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Množství *</label>
            <input
              type="number"
              min={1}
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Datum zadání do tisku
            </label>
            <input
              type="date"
              value={orderedAt}
              onChange={(e) => setOrderedAt(e.target.value)}
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
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Objednat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
