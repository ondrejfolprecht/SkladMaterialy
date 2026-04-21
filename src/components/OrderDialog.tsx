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
    if (quantity <= 0) errs.push("Mno\u017estv\u00ed mus\u00ed b\u00fdt kladn\u00e9 \u010d\u00edslo.");
    if (!orderedAt) errs.push("Zadejte datum zad\u00e1n\u00ed do tisku.");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onConfirm(quantity, orderedAt);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepoda\u0159ilo se vytvo\u0159it objedn\u00e1vku.";
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-24 z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm">
        <h3 className="text-base font-semibold mb-1">Nov\u00e1 objedn\u00e1vka</h3>
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
            <label className="block text-sm font-medium mb-1">Mno\u017estv\u00ed *</label>
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
              Datum zad\u00e1n\u00ed do tisku
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
              Zru\u0161it
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Ukl\u00e1d\u00e1m\u2026" : "Objednat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
