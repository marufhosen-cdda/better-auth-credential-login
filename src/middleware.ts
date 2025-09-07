import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // const session = await auth.api.getSession({
    //     headers: request.headers,
    // });
    // console.log("Middleware session:", session);


    // Skip middleware for API routes, auth routes, and static files
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.') // Skip files with extensions
    ) {
        return NextResponse.next();
    }

    const userSession = request.cookies.get('userSession');
    console.log("Middleware userSession cookie:", userSession);

    // Protected routes
    const protectedRoutes = ["/dashboard", "/profile"];
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        try {
            const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || request.nextUrl.origin;

            // Use fetch to check session instead of direct auth import
            const sessionResponse = await fetch(
                `${baseURL}/api/auth/get-session`,
                {
                    headers: {
                        'cookie': request.headers.get('cookie') || '',
                        'user-agent': request.headers.get('user-agent') || '',
                    },
                }
            );

            if (!sessionResponse.ok || sessionResponse.status === 401) {
                // Redirect to auth page with return URL
                const authUrl = new URL("/auth", request.url);
                authUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(authUrl);
            }

            const session = await sessionResponse.json();

            if (!session?.user) {
                const authUrl = new URL("/auth", request.url);
                authUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(authUrl);
            }
        } catch (error) {
            console.error("Middleware session check error:", error);
            // If there's an error checking the session, redirect to auth
            const authUrl = new URL("/auth", request.url);
            authUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(authUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Files with extensions
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
    ],
};