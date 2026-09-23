export const portfolioOptions = [
  {
    id: "continuum",
    label: "Main management company",
    description: "Buildings with the main management and maintenance contacts.",
  },
  {
    id: "other",
    label: "Other company",
    description: "Buildings with different management or maintenance contacts.",
  },
] as const;

export type PortfolioId = (typeof portfolioOptions)[number]["id"];
