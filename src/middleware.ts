import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zplwxcrerblnrgkaxexz.supabase.co').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key').trim();

  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    if (process.env.ENABLE_ADMIN_AUTH === 'true') {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isLoginPage = request.nextUrl.pathname === '/admin/login';
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

      if (isAdminRoute && !isLoginPage && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }

      if (isLoginPage && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.error('Middleware Supabase Auth check error:', err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
