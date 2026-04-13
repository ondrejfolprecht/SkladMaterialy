"use client";

import { useState, useEffect, useCallback } from "react";
import { Item, ItemFormData } from "@/lib/types";
import ItemTable from "@/components/ItemTable";
import ItemForm from "@/components/ItemForm";

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

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: tab === "archived" ? "archived" : "active",
      search,
      sort,
      order,
    });
    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [tab, search, sort, order]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      const body = await res.json();
      throw new Error(body.errors?.join(", ") || "Chyba při ukládání.");
    }

    setShowForm(false);
    setEditingItem(null);
    fetchItems();
  }

  async function handleTransfer(item: Item) {
    if (
      !confirm(
        `Převést zásobu marketingu (${item.marketingQuantity} ks) na recepci?`
      )
    )
      return;

    await fetch(`/api/items/${item.id}/transfer`, { method: "POST" });
    fetchItems();
  }

  async function handleArchive(item: Item) {
    if (!confirm(`Ukončit položku „${item.name}"?`)) return;

    await fetch(`/api/items/${item.id}/archive`, { method: "POST" });
    fetchItems();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
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
            onTransfer={handleTransfer}
            onArchive={handleArchive}
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
        />
      )}
    </main>
  );
}
