import { NextRequest, NextResponse } from "next/server";
import { HttpMethodsType, Middleware, Registry } from "@/middleware/middleware.types";


/**
 * A function to dynamically construct middleware for a given request based on a registry of routes and middleware groups.
 * @param registry
 * @param request
 * @constructor
 */
const MiddlewareConstructor = (registry: Registry, request: NextRequest) => {

	// Extract the requested path and method from the incoming request
	const path = request.nextUrl.pathname;
	const method = request.method;

	// Iterate over all routes defined in the registry
	for (const route of registry.routes) {

		let isMatch = false;

		// If the match pattern is a RegExp, test it against the path
		if (route.match instanceof RegExp) {
			isMatch = route.match.test(path);
		}
		// If the match is a string, check if the path starts with this string
		else {
			isMatch = path.startsWith(route.match);
		}

		// If we have a matched route and the incoming http method is supported
		if (isMatch && route.methods.includes(method as HttpMethodsType)) {

			// Initialize sets to store the middleware that applies to this request
			const middleware = {
				route   : new Set<Middleware>([]),
				group   : new Set<Middleware>([]),
				default : new Set<Middleware>([])
			}

			// Add to the route set all the middleware defined specifically for this route
			if(route.middleware && route.middleware.length > 0){
				route.middleware.forEach(instance => middleware.route.add(instance));
			}

			// Add the middleware for any groups that the route belongs to
			if (route.applyGroups && route.applyGroups.length > 0) {
				route.applyGroups.forEach(group => {
					if (registry.groups[group]) {
						registry.groups[group].forEach(instance => middleware.group.add(instance));
					}
				});
			}

			// Add any default middleware defined in the registry
			if(registry.default && registry.default.length > 0){
				registry.default.forEach(instance => middleware.default.add(instance));
			}

			// Determine the priority of middleware application and return the combined middleware in that order
			if(route.priority === "group"){
				// Group middleware takes priority, followed by route-specific and then default middleware
				return new Set<Middleware>([
					...middleware.group,
					...middleware.route,
					...middleware.default
				])
			}
			else {
				// Route-specific middleware takes priority, followed by group and then default middleware
				return new Set<Middleware>([
					...middleware.route,
					...middleware.group,
					...middleware.default
				])
			}
		}
	}

	// If no specific route matches, return the default middleware
	return registry.default;
}


const shouldRedirectImmediately = (response: NextResponse) => {
	const codes = [301, 304, 303, 307];
	return codes.includes(response.status);
}

/**
 * Running all the middleware. The response is being passed down to each middleware, so it can
 * be manipulated and remain the same instance.
 * @param registry
 * @param request
 * @param response
 * @constructor
 */
export const MiddlewareResolver =  async ( registry: Registry, request: NextRequest, response: NextResponse ): Promise<NextResponse> => {

	/** It can be middlewares because the word itself is uncountable */
	const middleware = MiddlewareConstructor(registry, request);

	try{
		for (const instance of middleware) {
			response = await instance(request, response);
			/*
				When our middleware is executed successfully and no error is thrown (thus the error handler won't
				redirect and exit the middleware), and we want to redirect immediately when a redirect response
				is returned we have to check for the status code for 3xx, so we can directly return the response.
			 */
			if(shouldRedirectImmediately(response)){
				return response;
			}
		}
	}
	catch(error: unknown){
		return registry.onError(error, request, response);
	}
	return response;
};
