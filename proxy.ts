import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Role-based access control
const roleAccess: Record<string, string[]> = {
  admin: [
    "/admin",
    "/api/admin",
  ],
  shop_manager: [
    "/admin/products",
    "/admin/categories",
    "/admin/gift-types",
    "/admin/orders",
    "/api/admin/products",
    "/api/admin/categories",
    "/api/admin/gift-types",
    "/api/admin/orders",
  ],
  decor_manager: [
    "/admin/event-types",
    "/admin/decor-packages",
    "/admin/decor-bookings",
    "/api/admin/event-types",
    "/api/admin/decor-packages",
    "/api/admin/decor-bookings",
  ],
  rider: [
    "/rider",
    "/api/rider",
  ],
  decor_staff: [
    "/decor-staff",
    "/api/decor-staff",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/shop",
    "/products",
    "/decor",
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/api/auth",
    "/api/products",
    "/api/gift-types",
    "/api/event-types",
    "/api/decor-packages",
    "/api/product-categories",
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token) {
    // API routes return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Redirect to login for pages
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - check role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const userRole = token.role as string;

    if (userRole !== "admin" && userRole !== "ADMIN") {
      // Check specific role access
      const hasAccess = Object.entries(roleAccess).some(([role, paths]) => {
        if (userRole?.toLowerCase() === role) {
          return paths.some((path) => pathname.startsWith(path));
        }
        return false;
      });

      if (!hasAccess) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Rider routes
  if (pathname.startsWith("/rider") || pathname.startsWith("/api/rider")) {
    const userRole = (token.role as string)?.toLowerCase();
    if (userRole !== "rider" && userRole !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Decor staff routes
  if (
    pathname.startsWith("/decor-staff") ||
    pathname.startsWith("/api/decor-staff")
  ) {
    const userRole = (token.role as string)?.toLowerCase();
    if (
      userRole !== "decor_staff" &&
      userRole !== "decor_manager" &&
      userRole !== "admin"
    ) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
