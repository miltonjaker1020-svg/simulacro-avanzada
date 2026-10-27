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
    await checkAndUpdateAuctionStatus(id);

    const bids = await prisma.bid.findMany({
      where: { auctionId: id },
      orderBy: { amount: "desc" },
      include: {
        bidder: {
          select: { alias: true },
        },
      },
    });

    const anonymizedBids = bids.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt,
      bidderAlias: maskAlias(bid.bidder.alias),
    }));

    return NextResponse.json(anonymizedBids);
  } catch (error) {
    console.error("Get bids error:", error);
    return NextResponse.json({ error: "Error al obtener ofertas" }, { status: 500 });
  }
}

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
    const { amount } = body;

    await checkAndUpdateAuctionStatus(id);

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
    });

    if (!auction) {
      return NextResponse.json({ error: "Subasta no encontrada" }, { status: 404 });
    }

    if (auction.status !== "ACTIVA") {
      return NextResponse.json({ error: "Solo se pueden ofertar en subastas activas" }, { status: 400 });
    }

    if (auction.sellerId === session.userId) {
      return NextResponse.json({ error: "No puedes ofertar en tus propias subastas" }, { status: 403 });
    }

    const bidAmount = parseFloat(amount);
    const now = new Date();

    if (auction.bids.length === 0) {
      // First bid
      if (bidAmount < auction.initialPrice) {
        return NextResponse.json({ error: `La oferta debe ser mayor o igual a ${auction.initialPrice}` }, { status: 400 });
      }
    } else {
      const highestBid = auction.bids[0];
      const minRequired = highestBid.amount + auction.minIncrement;
      if (bidAmount < minRequired) {
        return NextResponse.json({ error: `La oferta debe ser mayor o igual a ${minRequired}` }, { status: 400 });
      }
      // Check if user is the highest bidder
      const highestBidFull = await prisma.bid.findFirst({
        where: { auctionId: id },
        orderBy: { amount: "desc" },
        include: { bidder: true },
      });
      if (highestBidFull && highestBidFull.bidderId === session.userId) {
        return NextResponse.json({ error: "No puedes ofertar consecutivamente" }, { status: 400 });
      }
    }

    let newEndDate = auction.endDate;
    const timeLeft = auction.endDate.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (timeLeft <= fiveMinutes) {
      newEndDate = new Date(auction.endDate.getTime() + fiveMinutes);
    }

    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount: bidAmount,
          auctionId: id,
          bidderId: session.userId,
        },
      }),
      prisma.auction.update({
        where: { id },
        data: {
          currentPrice: bidAmount,
          endDate: newEndDate,
        },
      }),
    ]);

    return NextResponse.json({ message: "Oferta realizada correctamente", bid }, { status: 201 });
  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json({ error: "Error al realizar oferta" }, { status: 500 });
  }
}
