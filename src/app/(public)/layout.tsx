import Link from "next/link";

export default function PublicLayout({
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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 text-sm">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2026 BidHub. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
