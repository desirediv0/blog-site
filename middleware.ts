import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    const isAuthPage = pathname.startsWith("/auth");
    const isAdminPage = pathname.startsWith("/admin");
    const isUserPage = pathname.startsWith("/user");
    const isAdminApi = pathname.startsWith("/api/admin");
    const isUserApi = pathname.startsWith("/api/user");

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/user/profile", req.url));
    }

    // Strict admin page protection
    if (isAdminPage) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user/profile", req.url));
      }
    }

    // Strict admin API protection
    if (isAdminApi) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (token.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden - Admin only" },
          { status: 403 }
        );
      }
    }

    // Protect user pages
    if (isUserPage && !token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Protect user APIs
    if (isUserApi && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Note: Banned user check should be done in API routes using getServerSession
    // as we need to fetch user from database to check banned status

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Allow auth pages without token
        if (pathname.startsWith("/auth")) {
          return true;
        }
        // Require token for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/auth/:path*",
    "/user/profile",
    "/api/admin/:path*",
    "/api/user/:path*",
  ],
};
