import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { checkAndUpdateAuctionStatus, maskAlias } from "@/lib/auction-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auction = await checkAndUpdateAuctionStatus(id);

    if (!auction) {
      return NextResponse.json({ error: "Subasta no encontrada" }, { status: 404 });
    }

    const fullAuction = await prisma.auction.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, alias: true },
        },
        category: true,
        bids: {
          orderBy: { amount: "desc" },
          include: {
            bidder: {
              select: { alias: true },
            },
          },
        },
      },
    });

    if (!fullAuction) {
      return NextResponse.json({ error: "Subasta no encontrada" }, { status: 404 });
    }

    // Anonymize bids
    const anonymizedBids = fullAuction.bids.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt,
      bidderAlias: maskAlias(bid.bidder.alias),
    }));

    return NextResponse.json({
      ...fullAuction,
      bids: anonymizedBids,
    });
  } catch (error) {
    console.error("Get auction error:", error);
    return NextResponse.json({ error: "Error al obtener subasta" }, { status: 500 });
  }
}

export async function PUT(
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

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { bids: true },
    });

    if (!auction) {
      return NextResponse.json({ error: "Subasta no encontrada" }, { status: 404 });
    }

    if (auction.sellerId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (auction.bids.length > 0) {
      return NextResponse.json({ error: "No se puede editar una subasta con ofertas" }, { status: 400 });
    }

    if (auction.status !== "ACTIVA") {
      return NextResponse.json({ error: "Solo se pueden editar subastas activas" }, { status: 400 });
    }

    const { title, description, initialPrice, minIncrement, endDate, categoryId } = body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (initialPrice) {
      const ip = parseFloat(initialPrice);
      if (ip <= 0) return NextResponse.json({ error: "Precio inicial debe ser mayor a cero" }, { status: 400 });
      updateData.initialPrice = ip;
      updateData.currentPrice = ip;
    }
    if (minIncrement) {
      const mi = parseFloat(minIncrement);
      if (mi <= 0) return NextResponse.json({ error: "Incremento mínimo debe ser mayor a cero" }, { status: 400 });
      updateData.minIncrement = mi;
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      const now = new Date();
      const hoursDiff = (endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 1 || hoursDiff > 168) {
        return NextResponse.json({ error: "La fecha de cierre debe be entre 1 hora y 7 días" }, { status: 400 });
      }
      updateData.endDate = endDateObj;
    }
    if (categoryId) updateData.categoryId = categoryId;

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: updateData,
      include: { seller: true, category: true },
    });

    return NextResponse.json(updatedAuction);
  } catch (error) {
    console.error("Update auction error:", error);
    return NextResponse.json({ error: "Error al editar subasta" }, { status: 500 });
  }
}
