/*
 * One JSON line for Workers Logs when a request fails. It has the route pattern
 * ("/buildings/[id]"), never the URL: paths hold building addresses and query strings can hold keys.
 */
export const failureLogLine = ({
  route,
  method,
  status,
  error,
}: {
  route: string;
  method: string;
  status: number;
  error?: unknown;
}) =>
  JSON.stringify({
    message: "request failed",
    route,
    method,
    status,
    ...(error === undefined
      ? {}
      : { error: (error instanceof Error ? `${error.name}: ${error.message}` : String(error)).slice(0, 200) }),
  });
