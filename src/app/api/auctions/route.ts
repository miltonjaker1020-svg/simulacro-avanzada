import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { checkAndUpdateAuctionStatus } from "@/lib/auction-helpers";

export async function GET(request: Request) {
  try {
    // Update expired auctions
    await checkAndUpdateAuctionStatus();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, alias: true },
        },
        category: true,
        bids: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Get auctions error:", error);
    return NextResponse.json({ error: "Error al obtener subastas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, initialPrice, minIncrement, endDate, categoryId } = body;

    if (!title || !description || !initialPrice || !minIncrement || !endDate || !categoryId) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const initialPriceNum = parseFloat(initialPrice);
    const minIncrementNum = parseFloat(minIncrement);

    if (initialPriceNum <= 0 || minIncrementNum <= 0) {
      return NextResponse.json({ error: "Los precios deben ser mayores a cero" }, { status: 400 });
    }

    const endDateObj = new Date(endDate);
    const now = new Date();
    const hoursDiff = (endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1 || hoursDiff > 168) {
      return NextResponse.json({ error: "La fecha de cierre debe ser entre 1 hora y 7 días" }, { status: 400 });
    }

    // Check if user has more than 5 active auctions
    const activeAuctionsCount = await prisma.auction.count({
      where: {
        sellerId: session.userId,
        status: "ACTIVA",
      },
    });

    if (activeAuctionsCount >= 5) {
      return NextResponse.json({ error: "No puedes tener más de 5 subastas activas" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        initialPrice: initialPriceNum,
        minIncrement: minIncrementNum,
        currentPrice: initialPriceNum,
        endDate: endDateObj,
        categoryId,
        sellerId: session.userId,
        status: "ACTIVA",
      },
      include: {
        seller: true,
        category: true,
      },
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (error) {
    console.error("Create auction error:", error);
    return NextResponse.json({ error: "Error al crear subasta" }, { status: 500 });
  }
}
