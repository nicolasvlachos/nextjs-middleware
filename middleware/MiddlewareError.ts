/**
 * A custom error that you can use for extending other custom
 * errors/exceptions that you may throw from within your middleware.
 * That way it will be easier to catch middleware specific thrown errors
 */
export class MiddlewareError extends Error{}
