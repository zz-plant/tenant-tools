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

export const buildBuildingDashboardUrl = ({
  buildingId,
  accessKey,
  stewardKey,
}: {
  buildingId: string;
  accessKey?: string | null;
  stewardKey?: string | null;
}) => {
  const query = buildAccessQuery({ accessKey, stewardKey });
  return `/buildings/${encodeURIComponent(buildingId)}${buildLinkSuffix(query)}`;
};

export const buildSubmissionDetailsUrl = ({
  submissionId,
  accessKey,
  stewardKey,
}: {
  submissionId: string;
  accessKey?: string | null;
  stewardKey?: string | null;
}) => {
  const query = buildAccessQuery({ accessKey, stewardKey });
  return `/submissions/${encodeURIComponent(submissionId)}${buildLinkSuffix(query)}`;
};
