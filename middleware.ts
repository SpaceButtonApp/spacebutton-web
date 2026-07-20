import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    const key = request.nextUrl.searchParams.get('key')
    if (!key || key !== process.env.ADMIN_SECRET) {
      return NextResponse.notFound()
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/login',
}
