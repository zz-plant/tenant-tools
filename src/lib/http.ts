type JsonHeaders = HeadersInit;

export const jsonResponse = (data: unknown, status = 200, headers: JsonHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

export const jsonError = (
  message: string,
  status: number,
  extras: Record<string, unknown> = {},
  headers: JsonHeaders = {}
) => jsonResponse({ error: message, ...extras }, status, headers);

export const getRequestKey = (
  request: Request,
  headerName: string,
  queryParam: string,
  url?: URL
) => {
  const headerValue = request.headers.get(headerName);
  if (headerValue) {
    return headerValue;
  }
  const resolvedUrl = url ?? new URL(request.url);
  return resolvedUrl.searchParams.get(queryParam);
};

export const parseJsonBody = async <T>(request: Request, fallback: T): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return fallback;
  }
};
