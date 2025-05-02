// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Check if user is authenticated for protected routes
  if (!token && request.nextUrl.pathname.startsWith('/dashfuck')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users from auth pages to dashboard
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const dashboardUrl = new URL('/dashfuck', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// middleware.ts
export const config = {
  matcher: ['/dashfuck/:path*', '/login', '/register', '/reset-password'],
};