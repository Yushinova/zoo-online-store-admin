import { NextResponse } from 'next/server';

export function proxy(request) {
  const adminToken = request.cookies.get('adminToken')?.value;
  const adminApiKey = request.cookies.get('adminApiKey')?.value;
  
  const { pathname } = request.nextUrl;

  console.log('Middleware check:', { 
    pathname, 
    hasToken: !!adminToken, 
    hasApiKey: !!adminApiKey 
  });

  // Требуем оба cookies
  if ((!adminToken || !adminApiKey) && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (adminToken && adminApiKey && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};