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

export const getCookieValue = (request: Request, cookieName: string) => {
  const cookieHeader = request.headers.get("cookie") || "";
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(cookieName.length + 1);
  return value ? decodeURIComponent(value) : null;
};

export const getRequestKey = (
  request: Request,
  headerName: string,
  queryParam: string,
  url?: URL,
  cookieName?: string
) => {
  const headerValue = request.headers.get(headerName);
  if (headerValue) {
    return headerValue;
  }

  const resolvedUrl = url ?? new URL(request.url);
  const queryValue = resolvedUrl.searchParams.get(queryParam);
  if (queryValue) {
    return queryValue;
  }

  if (cookieName) {
    return getCookieValue(request, cookieName);
  }

  return null;
};

export const parseJsonBody = async <T>(request: Request, fallback: T): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return fallback;
  }
};
