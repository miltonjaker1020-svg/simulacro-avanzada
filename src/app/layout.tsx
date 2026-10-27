import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BidHub - Plataforma de Subastas",
  description: "Plataforma fullstack de subastas en línea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
