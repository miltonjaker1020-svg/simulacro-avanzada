import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import crypto from "crypto";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No hay refresh token" }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Refresh token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.refreshTokenHash) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    if (tokenHash !== user.refreshTokenHash) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return NextResponse.json({ message: "Token renovado correctamente" });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Error al renovar token" }, { status: 500 });
  }
}
