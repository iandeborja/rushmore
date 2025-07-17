import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is accessing a protected route
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/play") || 
                           req.nextUrl.pathname.startsWith("/friends") ||
                           req.nextUrl.pathname.startsWith("/history");
    
    // If accessing setup-username page, allow it
    if (req.nextUrl.pathname.startsWith("/setup-username")) {
      return NextResponse.next();
    }
    
    // If user is authenticated but doesn't have a username and is accessing a protected route
    if (req.nextauth.token && isProtectedRoute) {
      // We'll check username in the component itself since we can't easily access it here
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/play/:path*", "/friends/:path*", "/history/:path*", "/setup-username/:path*"]
}; 