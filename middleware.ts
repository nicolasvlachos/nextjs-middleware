import { NextRequest, NextResponse } from "next/server";
import { MiddlewareResolver } from "@/middleware/MiddlewareResolver";
import MiddlewareRegistry from "@/middleware/MiddlewareRegistry";


export async function middleware( request: NextRequest ) {
	
	let response = NextResponse.next();
	/**
	 * Sometimes I have a strange problem that the middleware won't fire for
	 * every page refresh.
	 */
	response.headers.append("x-middleware-cache", "no-cache");
	/**
	 * The response is being passed on to all defined middleware.
	 */
	return await MiddlewareResolver(MiddlewareRegistry, request, response);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)'
	],
}