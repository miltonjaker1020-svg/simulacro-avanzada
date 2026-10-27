import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Bienvenido a BidHub
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Plataforma de subastas en línea para artículos de colección. Regístrate, publica tus artículos y participa en subastas.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/auctions"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Ver Subastas
          </Link>
          <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900">
            Registrarse <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
