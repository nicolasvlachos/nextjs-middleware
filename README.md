# Next.js Middleware Handler

This is a simple Next.js implementation for handling multiple route & method specific middleware.

## Disclaimer

I am not a Next.js expert. It's my second week working on Next. So this implementation may not meet or satisfy your needs because I still don't know all the best practices around this framework. But you're free to code it further. There are more implementations out there but this is my approach. Cheers.

## Getting started


```typescript

export async function middleware( request: NextRequest ) {
    let response = NextResponse.next();
    // response.headers.append("x-middleware-cache", "no-cache");
    return await MiddlewareResolver(MiddlewareRegistry, request, response);
}

```

### Middleware registry
The middleware registry is where we define our middleware. It can be done in a stand-alone script or in your ``middleware.ts`` - depends on the number of defined routes. No matter where you define the middleware registry it should implement the ``Registry`` interface.

```typescript

import { Registry } from "@/middleware/middleware.types";
import { LoginMiddleware } from "@/middleware/handlers/LoginMiddleware";
import { RequiredCookiesMiddleware } from "@/middleware/handlers/RequiredCookiesMiddleware";
import { MiddlewareErrorHandler } from "@/middleware/MiddlewareErrorHandler";

// Define MiddlewareRegistry as an instance of Registry
const MiddlewareRegistry: Registry = {
    // Define groups of middleware that can be applied together
    groups: {
        auth: [
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
```

As you can see we can have both pre-defined middleware groups that can be applied on any route and route specific middleware. Sometimes the sequence that all defined the middleware is running is crucial, so you can define the priority that you want for each route. The priority can be either ``group | route``. When the priority is on group all the group middleware will run first. The default ones always run at the end.

### The Error handler
In our ``MiddlewareRegistry`` we have an ``onError`` function that can be an inline one or define a middleware Error handler that will handle all of your edge case scenarios.
```typescript
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
```


### Defining a middleware
In the current structure all the middleware (for readability & maintainability purposes) are in ``middleware/handlers`` folder. There you can define all your middleware. All middleware should use the ``Middleware`` type.

```typescript
import { Middleware } from "@/middleware/middleware.types";
import { MiddlewareError } from "@/middleware/MiddlewareError";

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
        process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string,
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
```
### Response
If no redirect is made from within the middleware or from the Error handler then the response object will be the initial one and can be passed down to all middleware and each middleware can modify the ``Response`` object.

### Redirecting
Sometimes just checking or modifying the response is not enough. We need an immediate redirect. In the case of an unsuccessful check we can throw an ``Error`` and the Error handler can return a ``NextResponse.redirect(new URL('https://google''))``. In case that everything is ok, and we want to just redirect. We can do so by returning a redirect response from within the middleware and exit the middleware execution.

```typescript

const shouldRedirectImmediately = (response: NextResponse) => {
    const codes = [301, 304, 303, 307];
    return codes.includes(response.status);
}
```
...
```typescript
try{
    for (const instance of middleware) {
        response = await instance(request, response);
        if(shouldRedirectImmediately(response)){
            return response;
        }
    }
}
catch(error: unknown){
    return registry.onError(error, request, response);
}

```
