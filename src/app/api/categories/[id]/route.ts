import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    // Check if category has auctions
    const categoryWithAuctions = await prisma.category.findUnique({
      where: { id },
      include: { auctions: true },
    });

    if (categoryWithAuctions && categoryWithAuctions.auctions.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría con subastas asociadas" },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 });
  }
}
