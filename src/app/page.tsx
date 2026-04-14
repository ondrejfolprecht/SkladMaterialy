"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Item, ItemFormData } from "@/lib/types";
import ItemTable from "@/components/ItemTable";
import ItemForm from "@/components/ItemForm";
import TransferDialog from "@/components/TransferDialog";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Transfer dialog state
  const [transferItem, setTransferItem] = useState<Item | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: tab === "archived" ? "archived" : "active",
        search,
        sort,
        order,
      });
      const res = await fetch(`/api/items?${params}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, sort, order]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Collect unique department names for suggestions
  const knownDepartments = useMemo(() => {
    const depts = new Set<string>();
    for (const item of items) {
      for (const t of item.transfers || []) {
        depts.add(t.department);
      }
    }
    return Array.from(depts).sort();
  }, [items]);

  function handleSort(field: string) {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
  }

  function openNew() {
    setEditingItem(null);
    setShowForm(true);
  }

  function openEdit(item: Item) {
    setEditingItem(item);
    setShowForm(true);
  }

  async function handleSave(data: ItemFormData) {
    const url = editingItem
      ? `/api/items/${editingItem.id}`
      : "/api/items";
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = "Chyba při ukládání.";
      try {
        const body = await res.json();
        message = body.errors?.join(", ") || body.error || message;
      } catch {}
      throw new Error(message);
    }

    setShowForm(false);
    setEditingItem(null);
    fetchItems();
  }

  function openTransfer(item: Item) {
    setTransferItem(item);
  }

  async function handleTransfer(department: string, quantity: number) {
    if (!transferItem) return;

    const res = await fetch(`/api/items/${transferItem.id}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department, quantity }),
    });

    if (!res.ok) {
      let message = "Chyba při předávání.";
      try {
        const body = await res.json();
        message = body.errors?.join(", ") || body.error || message;
      } catch {}
      throw new Error(message);
    }

    setTransferItem(null);
    fetchItems();
  }

  async function handleStock(item: Item) {
    if (
      !confirm(
        `Naskladnit „${item.name}" — ${item.orderedQuantity} ks do skladu marketingu?`
      )
    )
      return;

    await fetch(`/api/items/${item.id}/stock`, { method: "POST" });
    fetchItems();
  }

  async function handleDelete(item: Item) {
    if (
      !confirm(
        `Opravdu trvale smazat „${item.name}"? Tato akce je nevratná.`
      )
    )
      return;

    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Sklad tiskovin</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nová položka
        </button>
      </div>

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
            Aktivní
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
          placeholder="Hledat dle názvu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Načítám…</div>
        ) : (
          <ItemTable
            items={items}
            onEdit={openEdit}
            onTransfer={openTransfer}
            onStock={handleStock}
            onDelete={handleDelete}
            sort={sort}
            order={order}
            onSort={handleSort}
            isArchive={tab === "archived"}
          />
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onArchive={async (item) => {
            await fetch(`/api/items/${item.id}/archive`, { method: "POST" });
            setShowForm(false);
            setEditingItem(null);
            fetchItems();
          }}
        />
      )}

      {/* Transfer dialog */}
      {transferItem && (
        <TransferDialog
          item={transferItem}
          departments={knownDepartments}
          onConfirm={handleTransfer}
          onCancel={() => setTransferItem(null)}
        />
      )}
    </main>
  );
}
