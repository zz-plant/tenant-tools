export const buildAccessQuery = () => "";

export const buildLinkSuffix = (query: string) => (query ? `?${query}` : "");

export const buildBuildingDashboardUrl = ({
  buildingId,
}: {
  buildingId: string;
  accessKey?: string | null;
  stewardKey?: string | null;
}) => {
  const query = buildAccessQuery();
  return `/buildings/${encodeURIComponent(buildingId)}${buildLinkSuffix(query)}`;
};

export const buildSubmissionDetailsUrl = ({
  submissionId,
}: {
  submissionId: string;
  accessKey?: string | null;
  stewardKey?: string | null;
}) => {
  const query = buildAccessQuery();
  return `/submissions/${encodeURIComponent(submissionId)}${buildLinkSuffix(query)}`;
};
