import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require the user to be logged in
const PROTECTED_PREFIXES = [
  '/home',
  '/search',
  '/messages',
  '/chat',
  '/notifications',
  '/profile',
  '/property',
  '/user',
  '/saved',
  '/add-post',
  '/edit-post',
  '/call',
  '/payment',
  '/wallet',
  '/premium',
  '/settings',
  '/about',
  '/help',
  '/terms',
  '/privacy',
]

// Auth pages — redirect away if already logged in
const AUTH_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/verify',
  '/welcome',
  '/get-started',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.has('sb_logged_in')

  // ─── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname === '/admin') {
      const secret = process.env.ADMIN_SECRET
      if (!secret || request.nextUrl.searchParams.get('key') !== secret) {
        return new NextResponse(null, { status: 404 })
      }
      return NextResponse.next()
    }
    // Other admin pages: admin auth is localStorage-based (client handles redirects)
    return NextResponse.next()
  }

  // ─── Protected main routes ────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── Auth routes (redirect away if logged in) ─────────────────
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|placeholder).*)',
  ],
}
