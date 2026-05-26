import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const protectedPaths = ['/dashboard', '/crm', '/outreach', '/analytics', '/revenue', '/settings']
        const isProtected = protectedPaths.some(p => pathname.startsWith(p))
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/crm/:path*',
    '/outreach/:path*',
    '/analytics/:path*',
    '/revenue/:path*',
    '/settings/:path*',
  ],
}
