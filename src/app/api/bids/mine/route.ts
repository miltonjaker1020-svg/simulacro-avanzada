import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const bids = await prisma.bid.findMany({
      where: { bidderId: session.userId },
      include: {
        auction: {
          include: {
            category: true,
            seller: {
              select: { name: true, alias: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bids);
  } catch (error) {
    console.error("Get my bids error:", error);
    return NextResponse.json({ error: "Error al obtener ofertas" }, { status: 500 });
  }
}
