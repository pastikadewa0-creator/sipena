import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionCookie = req.cookies.get('session')?.value
  const session = await decrypt(sessionCookie)

  // Public routes
  if (pathname.startsWith('/login') || pathname === '/') {
    if (session?.userId) {
      const dest =
        session.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'
      return NextResponse.redirect(new URL(dest, req.nextUrl))
    }
    return NextResponse.next()
  }

  // Semua route lain wajib login
  if (!session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Admin routes → hanya role admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/employee/dashboard', req.nextUrl))
  }

  // Employee routes → hanya role karyawan
  if (pathname.startsWith('/employee') && session.role !== 'karyawan') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|webp)$).*)'],
}
