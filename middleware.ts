import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, updateSession } from "./utils/session";

/**
 * Middleware function to enforce authentication on protected routes.
 * It checks if the user has a valid session. If not, it redirects to the homepage.
 * If a valid session exists, the session is refreshed to extend its expiration.
 *
 * @param {NextRequest} request - The incoming HTTP request object from Next.js.
 * @returns {Promise<NextResponse | void>} - Returns a NextResponse object for redirection or updates the session.
 */
export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith("/protected")) {
    const session = await getSession();

    // If no session is found, redirect to the homepage
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Update the session if it exists and continue
  return updateSession(request);
}

/**
 * Configuration for the middleware to specify which routes it should apply to.
 * The matcher ensures that the middleware is applied to protected routes and API routes.
 *
 * @type {Object}
 * @property {Array<string>} matcher - An array of route patterns where the middleware will be triggered.
 */
export const config = {
  matcher: ["/protected/:path*", "/api/:path*"],
};
