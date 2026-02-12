export const buildAccessQuery = ({
  accessKey,
  stewardKey,
}: {
  accessKey?: string | null;
  stewardKey?: string | null;
}) => {
  const keyParam = accessKey ? `key=${encodeURIComponent(accessKey)}` : "";
  const stewardParam = stewardKey ? `stewardKey=${encodeURIComponent(stewardKey)}` : "";
  return [keyParam, stewardParam].filter(Boolean).join("&");
};

export const buildLinkSuffix = (query: string) => (query ? `?${query}` : "");
