import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const { pathname } = request.nextUrl

  // If token has error, redirect to login to force re-authentication
  if (token?.error === "RefreshAccessTokenError") {
    return NextResponse.redirect(new URL('/', request.url))
  }

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
