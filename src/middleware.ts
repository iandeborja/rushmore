import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Only protect the setup-username page to ensure users have usernames
    if (req.nextUrl.pathname.startsWith("/setup-username")) {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require auth for setup-username page
        if (req.nextUrl.pathname.startsWith("/setup-username")) {
          return !!token;
        }
        // Allow all other pages without auth
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/setup-username/:path*"]
}; 