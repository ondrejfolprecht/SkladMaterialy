"use client";

import { useState, useEffect } from "react";
import { Material, MaterialFormData, CATEGORIES } from "@/lib/types";

interface Props {
  material?: Material | null;
  onSave: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  onArchive?: (material: Material) => void;
}

export default function MaterialForm({ material, onSave, onCancel, onArchive }: Props) {
  const [form, setForm] = useState<MaterialFormData>({
    name: "",
    category: "",
    supplier: "",
    estimatedLeadDays: null,
    estimatedMonthlyUsage: null,
    note: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (material) {
      setForm({
        name: material.name,
        category: material.category,
        supplier: material.supplier,
        estimatedLeadDays: material.estimatedLeadDays,
        estimatedMonthlyUsage: material.estimatedMonthlyUsage,
        note: material.note,
      });
    }
  }, [material]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const errs: string[] = [];
    if (!form.name.trim()) errs.push("N\u00e1zev je povinn\u00fd.");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepoda\u0159ilo se ulo\u017eit.";
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  }

  function set(field: keyof MaterialFormData, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-12 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold mb-4">
          {material ? "Upravit materi\u00e1l" : "Nov\u00fd materi\u00e1l"}
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
            <label className="block text-sm font-medium mb-1">N\u00e1zev *</label>
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
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">\u2014 vyberte \u2014</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
              Odhadovan\u00e1 v\u00fdrobn\u00ed lh\u016fta (dn\u00ed)
            </label>
            <input
              type="number"
              min={0}
              value={form.estimatedLeadDays ?? ""}
              onChange={(e) =>
                set("estimatedLeadDays", e.target.value ? Number(e.target.value) : null)
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Odhadovan\u00e1 m\u011bs\u00ed\u010dn\u00ed spot\u0159eba (ks)
            </label>
            <input
              type="number"
              min={0}
              value={form.estimatedMonthlyUsage ?? ""}
              onChange={(e) =>
                set("estimatedMonthlyUsage", e.target.value ? Number(e.target.value) : null)
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Pozn\u00e1mka</label>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <div>
            {material && onArchive && material.status !== "Ukon\u010deno" && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Ukon\u010dit materi\u00e1l \u201e${material.name}\u201c?`)) {
                    onArchive(material);
                  }
                }}
                className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50"
              >
                Ukon\u010dit materi\u00e1l
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Zru\u0161it
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Ukl\u00e1d\u00e1m\u2026" : "Ulo\u017eit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
