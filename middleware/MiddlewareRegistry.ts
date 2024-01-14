import { Registry } from "@/middleware/middleware.types";
import { LoginMiddleware } from "@/middleware/handlers/LoginMiddleware";
import { RequiredCookiesMiddleware } from "@/middleware/handlers/RequiredCookiesMiddleware";
import { MiddlewareErrorHandler } from "@/middleware/MiddlewareErrorHandler";

// Define MiddlewareRegistry as an instance of Registry
const MiddlewareRegistry: Registry = {
	// Define groups of middleware that can be applied together
	groups: {
		auth: [
			LoginMiddleware,
			RequiredCookiesMiddleware
		]
	},
	// Define individual routes with specific middleware configurations
	routes: [
		{
			// Match routes by using a regex or a string
			match: /\/auth\/login/,
			// Specify the http methods for the middleware to match
			methods: ["GET", "POST"],
			// Define the route specific middleware
			middleware: [
				LoginMiddleware,
			],
			// Set the priority for the middleware to be executed
			priority: "group",
			// Apply defined middleware groups
			applyGroups: ["auth"]
		}
	],
	// Define any default middleware (empty array indicates no default middleware)
	default: [],
	// Define a handler for middleware errors
	onError: MiddlewareErrorHandler
}

export default MiddlewareRegistry;