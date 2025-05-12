// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth-token")?.value;

  

  // Skip auth for public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }
  

  try {
    await jwtVerify(
      token!,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    if(pathname === "/"){
      return NextResponse.redirect(new URL("/dashboard", request.url));
      }

    // Token valid - proceed
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*","/booking/:path*","/cancel/:path*"], // Protect these routes
};
