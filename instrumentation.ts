import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context
) => {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  // Structured server logs are searchable in Vercel Runtime Logs. Do not log
  // query strings, cookies, authorization headers or request bodies.
  console.error(
    JSON.stringify({
      event: "unhandled_request_error",
      message: normalized.message,
      name: normalized.name,
      digest,
      method: request.method,
      path: request.path.split("?", 1)[0],
      route: context.routePath,
      routeType: context.routeType,
      runtime: process.env.NEXT_RUNTIME,
      timestamp: new Date().toISOString(),
    })
  );
};
