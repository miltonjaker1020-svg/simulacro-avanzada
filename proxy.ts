import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";

export function proxy(request: NextRequest) {
  const session = getSession();
  // For simplicity in middleware, we'll check cookies
  const accessToken = request.cookies.get("access_token")?.value;
  
  const path = request.nextUrl.pathname;
  
  // Protected routes
  if (path.startsWith("/dashboard") || path.startsWith("/auctions/create")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  // Admin routes
  if (path.startsWith("/admin")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Note: Full role check would require decoding token
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auctions/create/:path*", "/admin/:path*"],
};
