import { Middleware } from "@/middleware/middleware.types";
import {MiddlewareError} from "@/middleware/MiddlewareError";

export class MissingCookiesError extends MiddlewareError {
	constructor(value?: string, ...args: any[]) {
		super(...args)
		this.name = "MissingRequiredAuthCookies"
		this.message = value ?? `Some of the cookies required for the authentication/authorization are missing.`

		Error.captureStackTrace(this, MissingCookiesError)
	}
}

const handle: Middleware = async (request, response) => {

	const cookies = request.cookies;

	const requiredCookies = [
		"lastVerified",
		"user",
		"permissions",
		"token"
	]

	const missingCookies = requiredCookies.filter((cookie: string) => !cookies.has(cookie as string));
	if(missingCookies.length > 0){
		throw new MissingCookiesError();
	}
	return response;
}

export const RequiredCookiesMiddleware = handle;