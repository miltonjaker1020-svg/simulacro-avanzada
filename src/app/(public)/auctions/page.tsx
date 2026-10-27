import Link from "next/link";

export default async function AuctionsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auctions`, {
    cache: 'no-store',
  });
  const auctions = await res.json();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Catálogo de Subastas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(auctions) && auctions.map((auction: any) => (
          <Link key={auction.id} href={`/auctions/${auction.id}`} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{auction.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{auction.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Precio actual:</span>
                  <span className="text-lg font-bold text-blue-600">${auction.currentPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    auction.status === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.status}
                  </span>
                  <span className="text-xs text-gray-500">{auction.category?.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
