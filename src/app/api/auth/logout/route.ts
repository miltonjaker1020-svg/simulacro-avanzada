import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { refreshTokenHash: null },
    });

    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
  }
}
