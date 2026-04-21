"use client";

import { useState } from "react";
import { Material } from "@/lib/types";

interface Props {
  material: Material;
  departments: string[];
  onConfirm: (department: string, quantity: number) => Promise<void>;
  onCancel: () => void;
}

export default function MovementDialog({
  material,
  departments,
  onConfirm,
  onCancel,
}: Props) {
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState(material.currentStock);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (!department.trim()) errs.push("Zadejte odd\u011blen\u00ed.");
    if (quantity <= 0) errs.push("Mno\u017estv\u00ed mus\u00ed b\u00fdt kladn\u00e9.");
    if (quantity > material.currentStock)
      errs.push(`Max. ${material.currentStock} ks.`);

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setConfirming(true);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      await onConfirm(department.trim(), quantity);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepoda\u0159ilo se p\u0159edat.";
      setErrors([message]);
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-24 z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm">
        <h3 className="text-base font-semibold mb-1">P\u0159edat materi\u00e1l</h3>
        <p className="text-sm text-gray-500 mb-4">
          {material.name} \u2014 k dispozici {material.currentStock} ks
        </p>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm text-red-700">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        {!confirming ? (
          <form onSubmit={handleNext}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Odd\u011blen\u00ed *
              </label>
              <input
                type="text"
                list="dept-suggestions"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="nap\u0159. Recepce, PET/CT, Klientsk\u00fd servis\u2026"
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
              <label className="block text-sm font-medium mb-1">
                Mno\u017estv\u00ed *
              </label>
              <input
                type="number"
                min={1}
                max={material.currentStock}
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
                Zru\u0161it
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pokra\u010dovat
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="bg-gray-50 border rounded p-3 mb-4 text-sm">
              <div className="font-medium mb-2">Zkontrolujte \u00fadaje:</div>
              <div>
                <span className="text-gray-500">Odd\u011blen\u00ed:</span>{" "}
                <strong>{department}</strong>
              </div>
              <div>
                <span className="text-gray-500">Mno\u017estv\u00ed:</span>{" "}
                <strong>{quantity} ks</strong>
              </div>
              <div className="mt-1 text-gray-500 text-xs">
                Po p\u0159ed\u00e1n\u00ed z\u016fstane na sklad\u011b{" "}
                {material.currentStock - quantity} ks
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                Zp\u011bt
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "P\u0159ed\u00e1v\u00e1m\u2026" : "Potvrdit p\u0159ed\u00e1n\u00ed"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
