export type ExportAudience = "inspector" | "legal" | "management" | "personal";

const exportAudienceConfigs: Record<
  ExportAudience,
  {
    heading: string;
    includeStage: boolean;
    includeReportCount: boolean;
    includeEvidence: boolean;
    includeTicket: boolean;
    notes: string[];
  }
> = {
  inspector: {
    heading: "Inspector summary",
    includeStage: true,
    includeReportCount: true,
    includeEvidence: true,
    includeTicket: true,
    notes: ["Resident-reported. Not verified.", "Evidence files are stored privately."],
  },
  legal: {
    heading: "Legal aid summary",
    includeStage: true,
    includeReportCount: true,
    includeEvidence: true,
    includeTicket: true,
    notes: ["Resident-reported. Dates are recorded below.", "Evidence files are stored privately."],
  },
  management: {
    heading: "Management summary",
    includeStage: false,
    includeReportCount: false,
    includeEvidence: false,
    includeTicket: false,
    notes: ["Request: Please share a repair plan and timeline."],
  },
  personal: {
    heading: "Personal records summary",
    includeStage: true,
    includeReportCount: true,
    includeEvidence: true,
    includeTicket: true,
    notes: ["Saved for personal records. No names are included."],
  },
};

export type ExportSummaryInput = {
  exportAudience: ExportAudience;
  building: string;
  portfolioLabel: string;
  issueLabel: string;
  zoneLabel: string;
  statusLabel: string;
  stageLabel: string;
  startDate: string;
  reportDate: string;
  daysOpen: number;
  impactCount: number;
  language: string;
  issueDetails: Array<{ key: string; label: string; value: string }>;
  evidence: string;
  ticketDate?: string;
  ticketNumber?: string;
};

export const buildExportSummary = ({
  exportAudience,
  building,
  portfolioLabel,
  issueLabel,
  zoneLabel,
  statusLabel,
  stageLabel,
  startDate,
  reportDate,
  daysOpen,
  impactCount,
  language,
  issueDetails,
  evidence,
  ticketDate,
  ticketNumber,
}: ExportSummaryInput) => {
  const config = exportAudienceConfigs[exportAudience];
  const detailLines = issueDetails
    .map((detail) => {
      if (detail.key === "attachment" && !config.includeEvidence) {
        return null;
      }
      return `- ${detail.label}: ${detail.value}`;
    })
    .filter(Boolean);
  const lines = [
    config.heading,
    "",
    `Building: ${building}`,
    `Portfolio: ${portfolioLabel}`,
    `Issue: ${issueLabel}`,
    `Status: ${statusLabel}`,
    `Zone: ${zoneLabel}`,
    config.includeStage ? `Stage: ${stageLabel}` : null,
    `Start date: ${startDate}`,
    `Report date: ${reportDate}`,
    `Days open: ${daysOpen}`,
    config.includeReportCount ? `Residents reporting: ${impactCount}` : null,
    config.includeEvidence ? `Evidence noted: ${evidence}` : null,
    config.includeTicket && ticketDate ? `311 ticket date: ${ticketDate}` : null,
    config.includeTicket && ticketNumber ? `311 ticket number: ${ticketNumber}` : null,
    `Language: ${language.toUpperCase()}`,
    "",
    "Issue details:",
    ...(detailLines.length > 0 ? detailLines : ["- Not provided"]),
    "",
    "Notes:",
    ...config.notes.map((note) => `- ${note}`),
  ].filter(Boolean);

  return lines.join("\n");
};
