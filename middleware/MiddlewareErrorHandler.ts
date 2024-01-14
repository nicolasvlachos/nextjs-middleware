import { ErrorHandler } from "@/middleware/middleware.types";
import { NextResponse } from "next/server";

export const MiddlewareErrorHandler: ErrorHandler = (error, request, response) => {

	if(error instanceof Error){

		const loginURL = process.env.NEXT_PUBLIC_LOGIN_URL as string;
		return NextResponse.redirect(loginURL)
	}
	else {
		return NextResponse.next()
	}
}