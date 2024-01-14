import { NextRequest, NextResponse } from "next/server";

export type MiddlewareResponse = NextResponse;

export type Middleware = (request: NextRequest, response: NextResponse) => Promise<MiddlewareResponse>;

export interface Groups { [key: string]: Middleware[]; }

export type HttpMethodsType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Route {
	match: RegExp | string;
	middleware: Middleware[];
	methods: HttpMethodsType[];
	priority: "group" | "route";
	applyGroups: Array<keyof Groups>
}

export type ErrorHandler = (error: unknown, request: NextRequest, response: NextResponse) => NextResponse;

export interface Registry {
	groups: Groups;
	routes: Route[];
	default: Middleware[];
	onError: ErrorHandler
}





