"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [catRes, aucRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/auctions"),
      ]);
      const catData = await catRes.json();
      const aucData = await aucRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
      setAuctions(Array.isArray(aucData) ? aucData : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        setNewCategory({ name: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancelAuction = async (id: string) => {
    const reason = prompt("Motivo de cancelación (mínimo 5 caracteres):");
    if (!reason || reason.length < 5) return;
    try {
      const res = await fetch(`/api/auctions/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationReason: reason }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Gestión de Categorías</h2>
        <form onSubmit={handleCreateCategory} className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4">
          <input
            type="text"
            placeholder="Nombre"
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descripción"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Crear
          </button>
        </form>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat: any) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cat.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Moderación de Subastas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auctions.map((auction: any) => (
                <tr key={auction.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{auction.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{auction.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${auction.currentPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {auction.status === 'ACTIVA' && (
                      <button
                        onClick={() => handleCancelAuction(auction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
