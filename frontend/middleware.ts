import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/vehicles", "/bookings", "/me"];

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !refreshToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vehicles/:path*", "/bookings/:path*", "/me/:path*"],
};
