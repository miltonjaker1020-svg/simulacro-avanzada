import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cancellationReason } = body;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { bids: true },
    });

    if (!auction) {
      return NextResponse.json({ error: "Subasta no encontrada" }, { status: 404 });
    }

    if (auction.status !== "ACTIVA") {
      return NextResponse.json({ error: "Solo se pueden cancelar subastas activas" }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const isSeller = auction.sellerId === session.userId;

    if (!isAdmin && !isSeller) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (isSeller && !isAdmin) {
      // Seller can only cancel if no bids
      if (auction.bids.length > 0) {
        return NextResponse.json({ error: "No puedes cancelar una subasta con ofertas" }, { status: 400 });
      }
    }

    if (isAdmin) {
      if (!cancellationReason || cancellationReason.length < 5) {
        return NextResponse.json({ error: "El motivo debe tener al menos 5 caracteres" }, { status: 400 });
      }
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: {
        status: "CANCELADA",
        cancellationReason: isAdmin ? cancellationReason : "Cancelada por el vendedor",
      },
    });

    return NextResponse.json({ message: "Subasta cancelada correctamente", auction: updatedAuction });
  } catch (error) {
    console.error("Cancel auction error:", error);
    return NextResponse.json({ error: "Error al cancelar subasta" }, { status: 500 });
  }
}
