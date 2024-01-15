import { ErrorHandler } from "@/middleware/middleware.types";
import { NextResponse } from "next/server";
import { MissingCookiesError } from "@/middleware/handlers/RequiredCookiesMiddleware";
import { MiddlewareError } from "@/middleware/MiddlewareError";

export const MiddlewareErrorHandler: ErrorHandler = (error, request, response) => {
	if(error instanceof Error){
		const loginURL = process.env.NEXT_PUBLIC_LOGIN_URL as string;
		return NextResponse.redirect(loginURL)
	}
	else if(error instanceof  MissingCookiesError){
		// Do something else
		return NextResponse.redirect("TO_SOME_ROUTE")
	}
	else {
		return NextResponse.next()
	}
}

/**
 * OR YOU COULD USE A SWITCH STATEMENT FOR EASIER ERROR GROUPING
 */

const MiddlewareSwitchErrorHandler: ErrorHandler = (error, request, response) => {

	switch(true){

		case error instanceof MissingCookiesError:
		case error instanceof SomeOtherError:
			//Do something
		case error instanceof MiddlewareError:
			// Do something else
		case error instanceof Error:
			// Do something else

		default:
			return response;
	}
}
