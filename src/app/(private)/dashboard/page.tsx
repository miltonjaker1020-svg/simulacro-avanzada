"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [auctions, setAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionsRes, bidsRes] = await Promise.all([
          fetch("/api/auctions"),
          fetch("/api/bids/mine"),
        ]);
        const auctionsData = await auctionsRes.json();
        const bidsData = await bidsRes.json();
        setAuctions(Array.isArray(auctionsData) ? auctionsData : []);
        setMyBids(Array.isArray(bidsData) ? bidsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Subastas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(auctions) && auctions.slice(0, 6).map((auction: any) => (
            <div key={auction.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{auction.title}</h3>
              <p className="text-sm text-gray-600">Estado: {auction.status}</p>
              <p className="text-sm text-gray-600">Precio: ${auction.currentPrice}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Ofertas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subasta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mi Oferta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myBids.map((bid: any) => (
                <tr key={bid.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.auction?.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bid.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.auction?.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
