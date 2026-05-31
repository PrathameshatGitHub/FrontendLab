// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/labs') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('fe_lab_token')?.value;

  // No token -> redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*', '/dashboard/:path*', '/admin', '/vendor', '/dashboard']
};
