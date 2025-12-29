import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    // Match all pathnames except for
    // - /api, /_next, /_vercel routes
    // - /auth routes (for OAuth callbacks)
    // - files with extensions (e.g. favicon.ico)
    matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)', '/(tr|en)/:path*']
};
