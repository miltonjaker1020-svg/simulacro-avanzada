import Link from "next/link";

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auctions/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Subasta no encontrada</div>;
  }
  
  const auction = await res.json();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/auctions" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Volver al catálogo
      </Link>
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-4">{auction.description}</p>
            <div className="space-y-2">
              <p><span className="font-semibold">Categoría:</span> {auction.category?.name}</p>
              <p><span className="font-semibold">Vendedor:</span> {auction.seller?.alias}</p>
              <p><span className="font-semibold">Precio inicial:</span> ${auction.initialPrice}</p>
              <p><span className="font-semibold">Incremento mínimo:</span> ${auction.minIncrement}</p>
              <p><span className="font-semibold">Precio actual:</span> <span className="text-xl font-bold text-blue-600">${auction.currentPrice}</span></p>
              <p><span className="font-semibold">Estado:</span> <span className={`px-2 py-1 rounded-full text-xs ${
                auction.status === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>{auction.status}</span></p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Historial de Ofertas (Anonimizado)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auction.bids && auction.bids.length > 0 ? (
                auction.bids.map((bid: any) => (
                  <div key={bid.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{bid.bidderAlias}</span>
                    <span className="font-semibold">${bid.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay ofertas aún</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
