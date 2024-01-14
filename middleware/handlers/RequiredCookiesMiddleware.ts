import { Middleware } from "@/middleware/middleware.types";

const handle: Middleware = async (request, response) => {

	const cookies = request.cookies;

	const requiredCookies = [
		process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string,
		"lastVerified",
		"user",
		"permissions",
		"token"
	]

	const missingCookies = requiredCookies.filter((cookie: string) => !cookies.has(cookie as string));
	if(missingCookies.length > 0){
		return response;
	}
	return response;
}

export const RequiredCookiesMiddleware = handle;