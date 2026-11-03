import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: Do NOT redirect to login based on the backend refresh-token cookie here.
// That cookie is httpOnly and set on the backend domain, so the Next.js
// middleware server never receives it. Authentication is enforced client-side
// by ProtectedRoute, which reads the access token from localStorage.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/vehicles/:path*", "/bookings/:path*", "/me/:path*"],
};
