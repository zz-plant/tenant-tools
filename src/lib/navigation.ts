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

export type GroupTool = {
  href: string;
  label: string;
  /** Label in the row of tool links near the top of the dashboard on phones. */
  short: string;
  note: string;
};

/** The building dashboard's Group tools. Canvass, notice contacts, and steward tools are for stewards only. */
export const buildGroupTools = (buildingId: string, isSteward: boolean): GroupTool[] => {
  const base = buildBuildingDashboardUrl({ buildingId });
  return [
    { href: `${base}/meeting`, label: "Meeting report", short: "Meeting report", note: "One page for your next tenant meeting." },
    { href: `${base}/letter`, label: "Joint letter", short: "Joint letter", note: "One repair letter, signed with a household count." },
    { href: `${base}/311`, label: "Group 311 day", short: "311 day", note: "Plan a day when neighbors call 311 together." },
    { href: `${base}/export`, label: "Printable summary", short: "Printable summary", note: "Every record, for an inspector or legal aid." },
    { href: "/rights", label: "Your rights", short: "Your rights", note: "A short printable guide to Chicago tenant rules." },
    ...(isSteward
      ? [
          { href: `${base}/canvass`, label: "Canvass tally", short: "Canvass", note: "Count doors knocked. Counts only." },
          { href: `${base}/contacts`, label: "Who to send notices to", short: "Who to send notices to", note: "Owner, manager, and notice address." },
          { href: "/steward", label: "Steward tools", short: "Steward tools", note: "Keys, exports, and emergency wipe." },
        ]
      : []),
  ];
};
