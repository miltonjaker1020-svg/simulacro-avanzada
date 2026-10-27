import Link from "next/link";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                BidHub
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/auctions" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Subastas
                </Link>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/auctions/create" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Crear Subasta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
