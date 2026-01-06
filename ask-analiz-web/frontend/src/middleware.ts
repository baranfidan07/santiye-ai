import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './utils/supabase/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Update Supabase session (refresh cookies if needed)
    const { response: supabaseResponse } = await updateSession(request);

    // 2. Handle i18n routing
    const response = intlMiddleware(request);

    // 3. Helper to copy Set-Cookie headers from Supabase response to Intl response
    // ensuring authentication cookies persist through the redirect/rewrite
    const supabaseCookies = supabaseResponse.headers.getSetCookie();

    if (supabaseCookies.length > 0) {
        supabaseCookies.forEach(cookie => {
            // Check if this cookie is already set? Just append.
            response.headers.append('Set-Cookie', cookie);
        });
    }

    return response;
}

export const config = {
    // Match only internationalized pathnames
    // Match all pathnames except for
    // - /api, /_next, /_vercel routes
    // - /auth routes (for OAuth callbacks)
    // - files with extensions (e.g. favicon.ico)
    matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)', '/(tr|en)/:path*']
};
