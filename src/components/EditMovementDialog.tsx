"use client";

import { useState } from "react";
import { Material, Movement } from "@/lib/types";

interface Props {
  material: Material;
  movement: Movement;
  departments: string[];
  onConfirm: (data: {
    department: string;
    quantity: number;
    movedAt: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function EditMovementDialog({
  material,
  movement,
  departments,
  onConfirm,
  onCancel,
}: Props) {
  const [department, setDepartment] = useState(movement.department);
  const [quantity, setQuantity] = useState(movement.quantity);
  // movedAt from API is ISO string; input[type=date] needs YYYY-MM-DD
  const initialDate = new Date(movement.movedAt).toISOString().slice(0, 10);
  const [movedAt, setMovedAt] = useState(initialDate);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Max qty = current stock + quantity returned by this movement
  const maxQuantity = material.currentStock + movement.quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (!department.trim()) errs.push("Zadejte oddělení.");
    if (quantity <= 0) errs.push("Množství musí být kladné.");
    if (quantity > maxQuantity) errs.push(`Max. ${maxQuantity} ks.`);

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onConfirm({
        department: department.trim(),
        quantity,
        movedAt,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepodařilo se uložit změny.";
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
        <h3 className="text-base font-semibold mb-1">Upravit pohyb</h3>
        <p className="text-sm text-gray-500 mb-4">
          {material.name} — k dispozici včetně tohoto pohybu {maxQuantity} ks
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
            list="dept-suggestions-edit"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            autoFocus
          />
          <datalist id="dept-suggestions-edit">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Množství *</label>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Datum</label>
          <input
            type="date"
            value={movedAt}
            onChange={(e) => setMovedAt(e.target.value)}
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
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit změny"}
          </button>
        </div>
      </form>
    </div>
  );
}
