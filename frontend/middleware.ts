import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')
  const { pathname } = request.nextUrl

  // Rediriger vers / (login) si pas de token et essaie d'accéder au dashboard
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rediriger vers /dashboard si connecté et essaie d'accéder à / ou /register
  if ((pathname === '/' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/', '/register'],
}
