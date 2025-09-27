import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/feed',
  '/profile',
  '/creator',
  '/looprooms'
];

// Define admin routes
const adminRoutes = [
  '/admin'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/waitlist',
  '/contact',
  '/about',
  '/privacy',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('userToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if it's an admin route
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const adminToken = request.cookies.get('adminToken')?.value;
    if (!adminToken && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Check if it's a protected route
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to feed
  if (token && ['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};