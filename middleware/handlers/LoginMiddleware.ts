import { Middleware } from "@/middleware/middleware.types";
import { MiddlewareError } from "@/middleware/MiddlewareError";
import Auth from "@/auth";
import { NextResponse } from "next/server";

class InvalidLoginUrlError extends MiddlewareError {
	constructor(value?: string, ...args: any[]) {
		super(...args)
		this.name = "InvalidLoginURL"
		this.message = value ?? `The redirected URL was invalid`
		Error.captureStackTrace(this, InvalidLoginUrlError)
	}
}

export class SignatureDecodingError extends MiddlewareError {
	constructor(value?: string, ...args: any[]) {
		super(...args)
		this.name = "CorruptedSignaturePayload"
		this.message = value ?? `The signature could not be decoded.`

		Error.captureStackTrace(this, SignatureDecodingError)
	}
}

class UnauthorizedError extends MiddlewareError {
	constructor(value?: string, ...args: any[]) {
		super(...args)
		this.name = "UnauthorizedError"
		this.message = value ?? `Unauthorized`

		Error.captureStackTrace(this, UnauthorizedError)
	}
}

const handle: Middleware = async (request, response) => {

	const { searchParams } = request.nextUrl;

	const requiredQueryParameters = ['signature', 'client_key', 'token'];
	const missingParameters = requiredQueryParameters.filter(parameter => !searchParams.has(parameter));

	if (missingParameters.length > 0) {

		throw new InvalidLoginUrlError();
	}

	try {
		const signature = Buffer.from(searchParams.get('signature') as string, 'base64').toString()
		const signatureURL = decodeURIComponent(signature);
		const authRequest = await Auth.validateSignature(signatureURL);
		if(authRequest.success === false && authRequest.authenticated === false){
			throw new UnauthorizedError();
		}
		return NextResponse.redirect(new URL('SOME_URL'))
	}
	catch(error) {
		throw new SignatureDecodingError();
	}
}

export const LoginMiddleware = handle;
