import { NextResponse } from 'next/server';

export function proxy(request) {
  const adminToken = request.cookies.get('adminToken')?.value;
  
  
  const { pathname } = request.nextUrl;

  console.log('Middleware check:', { 
    pathname, 
    hasToken: !!adminToken
  });

  if (!adminToken && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (adminToken && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};