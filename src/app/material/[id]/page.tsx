"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Material, MaterialFormData } from "@/lib/types";
import { formatDate } from "@/lib/helpers";
import MaterialForm from "@/components/MaterialForm";
import MovementDialog from "@/components/MovementDialog";
import OrderDialog from "@/components/OrderDialog";

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "movements">("orders");

  // Dialog states
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const fetchMaterial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/materials/${id}`);
      if (!res.ok) {
        setMaterial(null);
        return;
      }
      const data = await res.json();
      setMaterial(data);
    } catch {
      setMaterial(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  const knownDepartments = useMemo(() => {
    const depts = new Set<string>();
    for (const m of material?.movements || []) {
      depts.add(m.department);
    }
    return Array.from(depts).sort();
  }, [material]);

  async function handleSave(data: MaterialFormData) {
    const res = await fetch(`/api/materials/${id}`, {
      method: "PUT",
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

    setShowEditForm(false);
    fetchMaterial();
  }

  async function handleArchive() {
    await fetch(`/api/materials/${id}/archive`, { method: "POST" });
    setShowEditForm(false);
    fetchMaterial();
  }

  async function handleDelete() {
    if (!confirm("Opravdu trvale smazat tento materi\u00e1l? Tato akce je nevratn\u00e1."))
      return;

    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    router.push("/");
  }

  async function handleStock(orderId: number) {
    if (!confirm("Naskladnit tuto objedn\u00e1vku?")) return;

    await fetch(`/api/materials/${id}/orders/${orderId}/stock`, {
      method: "POST",
    });
    fetchMaterial();
  }

  async function handleNewOrder(quantity: number, orderedAt: string) {
    const res = await fetch(`/api/materials/${id}/orders`, {
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

    setShowOrderDialog(false);
    fetchMaterial();
  }

  async function handleNewMovement(department: string, quantity: number) {
    const res = await fetch(`/api/materials/${id}/movements`, {
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

    setShowMovementDialog(false);
    fetchMaterial();
  }

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="text-center text-gray-400 py-12">Na\u010d\u00edt\u00e1m\u2026</div>
      </main>
    );
  }

  if (!material) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="text-center text-gray-400 py-12">Materi\u00e1l nenalezen.</div>
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline text-sm"
          >
            Zp\u011bt na p\u0159ehled
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/")}
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Zp\u011bt na p\u0159ehled
      </button>

      {/* Material info card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{material.name}</h1>
            <p className="text-sm text-gray-500">
              {material.category || "Bez kategorie"}
              {material.supplier && ` \u2022 ${material.supplier}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upravit
            </button>
            {material.status === "Ukon\u010deno" && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50"
              >
                Smazat
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">Sklad</span>
            <span className="font-semibold text-lg">{material.currentStock} ks</span>
          </div>
          <div>
            <span className="text-gray-500 block">Odh. spot\u0159eba/m\u011bs</span>
            <span className="font-medium">
              {material.estimatedMonthlyUsage != null
                ? `${material.estimatedMonthlyUsage} ks`
                : "\u2013"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Odh. v\u00fdrobn\u00ed lh\u016fta</span>
            <span className="font-medium">
              {material.estimatedLeadDays != null
                ? `${material.estimatedLeadDays} dn\u00ed`
                : "\u2013"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Pr\u016fm. skute\u010dn\u00e1 lh\u016fta</span>
            <span className="font-medium">
              {material.avgActualLeadDays != null
                ? `${material.avgActualLeadDays} dn\u00ed`
                : "\u2013"}
            </span>
          </div>
        </div>

        {material.note && (
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
            {material.note}
          </div>
        )}

        <div className="mt-3">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              material.status === "Aktivn\u00ed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {material.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Objedn\u00e1vky ({material.orders?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "movements"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pohyby ({material.movements?.length || 0})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Objedn\u00e1vky</h2>
            <button
              onClick={() => setShowOrderDialog(true)}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              + Nov\u00e1 objedn\u00e1vka
            </button>
          </div>
          {material.orders && material.orders.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Zad\u00e1no
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Mno\u017estv\u00ed
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Stav
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Naskladn\u011bno
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    V\u00fdrobn\u00ed lh\u016fta
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {material.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(order.orderedAt)}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {order.quantity.toLocaleString("cs-CZ")} ks
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                          order.status === "V tisku"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatDate(order.stockedAt)}</td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {order.actualLeadDays != null
                        ? `${order.actualLeadDays} dn\u00ed`
                        : "\u2013"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {order.status === "V tisku" && (
                        <button
                          onClick={() => handleStock(order.id)}
                          className="text-purple-600 hover:underline text-xs"
                        >
                          Naskladnit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">
              \u017d\u00e1dn\u00e9 objedn\u00e1vky.
            </div>
          )}
        </div>
      )}

      {activeTab === "movements" && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Pohyby</h2>
            <button
              onClick={() => setShowMovementDialog(true)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              disabled={material.currentStock <= 0}
            >
              + P\u0159edat
            </button>
          </div>
          {material.movements && material.movements.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Datum
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Odd\u011blen\u00ed
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Mno\u017estv\u00ed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {material.movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(movement.movedAt)}</td>
                    <td className="px-4 py-2 font-medium">{movement.department}</td>
                    <td className="px-4 py-2 text-right">
                      {movement.quantity.toLocaleString("cs-CZ")} ks
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">
              \u017d\u00e1dn\u00e9 pohyby.
            </div>
          )}
        </div>
      )}

      {/* Edit form modal */}
      {showEditForm && (
        <MaterialForm
          material={material}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
          onArchive={() => handleArchive()}
        />
      )}

      {/* Order dialog */}
      {showOrderDialog && (
        <OrderDialog
          material={material}
          onConfirm={handleNewOrder}
          onCancel={() => setShowOrderDialog(false)}
        />
      )}

      {/* Movement dialog */}
      {showMovementDialog && (
        <MovementDialog
          material={material}
          departments={knownDepartments}
          onConfirm={handleNewMovement}
          onCancel={() => setShowMovementDialog(false)}
        />
      )}
    </main>
  );
}
