export const portfolioOptions = [
  {
    id: "continuum",
    label: "Continuum (Yelena + Ivan)",
    description: "Buildings with the Yelena and Ivan contacts.",
  },
  {
    id: "other",
    label: "Other company",
    description: "Buildings with different management or maintenance contacts.",
  },
] as const;

export type PortfolioId = (typeof portfolioOptions)[number]["id"];
