import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Panel Admin</h2>
        </div>
        <nav className="mt-8">
          <Link href="/admin" className="block px-4 py-2 hover:bg-gray-700">
            Dashboard
          </Link>
          <Link href="/" className="block px-4 py-2 hover:bg-gray-700">
            Volver al sitio
          </Link>
        </nav>
      </div>
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}
