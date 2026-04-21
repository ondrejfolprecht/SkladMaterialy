"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Material } from "@/lib/types";
import MaterialTable from "@/components/MaterialTable";
import MaterialForm from "@/components/MaterialForm";
import MovementDialog from "@/components/MovementDialog";
import OrderDialog from "@/components/OrderDialog";
import { MaterialFormData } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);

  // Dialog states
  const [transferMaterial, setTransferMaterial] = useState<Material | null>(null);
  const [orderMaterial, setOrderMaterial] = useState<Material | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: tab === "archived" ? "archived" : "active",
        search,
      });
      const res = await fetch(`/api/materials?${params}`);
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Collect unique department names for suggestions
  const knownDepartments = useMemo(() => {
    const depts = new Set<string>();
    for (const mat of materials) {
      for (const m of mat.movements || []) {
        depts.add(m.department);
      }
    }
    return Array.from(depts).sort();
  }, [materials]);

  // Dashboard counts
  const alertCounts = useMemo(() => {
    let red = 0, yellow = 0, green = 0;
    for (const mat of materials) {
      if (mat.alertLevel === "red") red++;
      else if (mat.alertLevel === "yellow") yellow++;
      else if (mat.alertLevel === "green") green++;
    }
    return { red, yellow, green };
  }, [materials]);

  async function handleSave(data: MaterialFormData) {
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = "Chyba p\u0159i ukl\u00e1d\u00e1n\u00ed.";
      try {
        const body = await res.json();
        message = body.errors?.join(", ") || body.error || message;
      } catch {}
      throw new Error(message);
    }

    setShowForm(false);
    fetchMaterials();
  }

  async function handleTransfer(department: string, quantity: number) {
    if (!transferMaterial) return;

    const res = await fetch(`/api/materials/${transferMaterial.id}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department, quantity }),
    });

    if (!res.ok) {
      let message = "Chyba p\u0159i p\u0159ed\u00e1v\u00e1n\u00ed.";
      try {
        const body = await res.json();
        message = body.errors?.join(", ") || body.error || message;
      } catch {}
      throw new Error(message);
    }

    setTransferMaterial(null);
    fetchMaterials();
  }

  async function handleOrder(quantity: number, orderedAt: string) {
    if (!orderMaterial) return;

    const res = await fetch(`/api/materials/${orderMaterial.id}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity, orderedAt }),
    });

    if (!res.ok) {
      let message = "Chyba p\u0159i vytv\u00e1\u0159en\u00ed objedn\u00e1vky.";
      try {
        const body = await res.json();
        message = body.errors?.join(", ") || body.error || message;
      } catch {}
      throw new Error(message);
    }

    setOrderMaterial(null);
    fetchMaterials();
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Sklad tiskovin</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nov\u00fd materi\u00e1l
        </button>
      </div>

      {/* Dashboard strip */}
      {tab === "active" && (
        <div className="flex gap-4 mb-4 text-sm">
          <span>\uD83D\uDD34 {alertCounts.red} kritick\u00e9</span>
          <span className="text-gray-300">|</span>
          <span>\uD83D\uDFE1 {alertCounts.yellow} brzy objednat</span>
          <span className="text-gray-300">|</span>
          <span>\uD83D\uDFE2 {alertCounts.green} v po\u0159\u00e1dku</span>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex border rounded overflow-hidden text-sm">
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-1.5 ${
              tab === "active"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Aktivn\u00ed
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-1.5 ${
              tab === "archived"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Archiv
          </button>
        </div>

        <input
          type="text"
          placeholder="Hledat dle n\u00e1zvu\u2026"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Na\u010d\u00edt\u00e1m\u2026</div>
        ) : (
          <MaterialTable
            materials={materials}
            onNavigate={(id) => router.push(`/material/${id}`)}
            onTransfer={(mat) => setTransferMaterial(mat)}
            onOrder={(mat) => setOrderMaterial(mat)}
            isArchive={tab === "archived"}
          />
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <MaterialForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Transfer/Movement dialog */}
      {transferMaterial && (
        <MovementDialog
          material={transferMaterial}
          departments={knownDepartments}
          onConfirm={handleTransfer}
          onCancel={() => setTransferMaterial(null)}
        />
      )}

      {/* Order dialog */}
      {orderMaterial && (
        <OrderDialog
          material={orderMaterial}
          onConfirm={handleOrder}
          onCancel={() => setOrderMaterial(null)}
        />
      )}
    </main>
  );
}
