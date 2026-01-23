import heatRuleData from "./rules/chicago/heat.json";
import rltoSummaryData from "./rules/chicago/rlto_summary.json";
import depositRatesData from "./rules/chicago/security_deposit_interest_rates.json";
import evictionRuleData from "./rules/cook/eviction_enforcement.json";

type RuleSource = {
  title: string;
  url: string;
};

type RuleCard = {
  id: string;
  title: string;
  summary: string;
  details?: string[];
  sources: RuleSource[];
  jurisdiction: string;
  lastReviewed: string;
};

type HeatRule = {
  jurisdiction: string;
  rule_id: string;
  last_reviewed: string;
  sources: RuleSource[];
  effective_periods: Array<{
    start_date: string;
    end_date: string | null;
    heat_season?: { start: string; end: string };
    minimum_indoor_temperature?: Array<{ from: string; to: string; temp_f: number }>;
    notes?: string;
  }>;
};

type RltoRule = {
  jurisdiction: string;
  rule_id: string;
  last_reviewed: string;
  sources: RuleSource[];
  effective_periods: Array<{
    start_date: string;
    end_date: string | null;
    rlto_summary_pdf?: Record<string, string>;
    notes?: string;
  }>;
};

type DepositRatesRule = {
  jurisdiction: string;
  rule_id: string;
  last_reviewed: string;
  sources: RuleSource[];
  rates_by_year: Record<string, number>;
  units: string;
  notes?: string;
};

type EvictionRule = {
  jurisdiction: string;
  rule_id: string;
  last_reviewed: string;
  sources: RuleSource[];
  statements: Array<{ text: string; notes?: string }>;
};

const heatRule = heatRuleData as HeatRule;
const rltoRule = rltoSummaryData as RltoRule;
const depositRule = depositRatesData as DepositRatesRule;
const evictionRule = evictionRuleData as EvictionRule;

const getLatestRateYear = () => {
  const years = Object.keys(depositRule.rates_by_year)
    .map((year) => Number(year))
    .filter((year) => !Number.isNaN(year))
    .sort((a, b) => b - a);
  return years[0];
};

const formatHeatSeason = (heatSeason?: { start: string; end: string }) => {
  if (!heatSeason) {
    return "Heat season dates are listed in the city guidance.";
  }
  return `Heat season runs ${heatSeason.start} to ${heatSeason.end}.`;
};

const formatHeatTemps = (temps?: Array<{ from: string; to: string; temp_f: number }>) => {
  if (!temps || temps.length === 0) {
    return [];
  }
  return temps.map((range) => `${range.temp_f}°F from ${range.from} to ${range.to}`);
};

const heatPeriod = heatRule.effective_periods[0];
const heatDetails = formatHeatTemps(heatPeriod?.minimum_indoor_temperature);

const latestRateYear = getLatestRateYear();
const latestRate = latestRateYear ? depositRule.rates_by_year[String(latestRateYear)] : null;
const rateDetails = Object.entries(depositRule.rates_by_year)
  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
  .slice(0, 3)
  .map(([year, rate]) => `${year}: ${rate}% per year`);

const rltoPeriod = rltoRule.effective_periods[0];

export const generalRuleCards: RuleCard[] = [
  {
    id: rltoRule.rule_id,
    title: "RLTO summary (Chicago)",
    summary: rltoPeriod?.rlto_summary_pdf?.en
      ? "The city publishes a plain-language RLTO summary PDF."
      : "The city publishes an RLTO summary.",
    details: rltoPeriod?.start_date
      ? [`Summary effective date: ${rltoPeriod.start_date}.`]
      : undefined,
    sources: rltoRule.sources,
    jurisdiction: rltoRule.jurisdiction,
    lastReviewed: rltoRule.last_reviewed,
  },
];

export const issueRuleCards: Record<string, RuleCard[]> = {
  heat: [
    {
      id: heatRule.rule_id,
      title: "Heat minimum temperatures",
      summary: formatHeatSeason(heatPeriod?.heat_season),
      details: heatDetails,
      sources: heatRule.sources,
      jurisdiction: heatRule.jurisdiction,
      lastReviewed: heatRule.last_reviewed,
    },
  ],
  deposit: [
    {
      id: depositRule.rule_id,
      title: "Security deposit interest rates",
      summary: latestRateYear && latestRate !== null
        ? `Latest published rate: ${latestRate}% per year (${latestRateYear}).`
        : "The city publishes annual interest rates for security deposits.",
      details: rateDetails.length > 0 ? rateDetails : undefined,
      sources: depositRule.sources,
      jurisdiction: depositRule.jurisdiction,
      lastReviewed: depositRule.last_reviewed,
    },
  ],
  lockout: [
    {
      id: evictionRule.rule_id,
      title: "Eviction enforcement",
      summary: evictionRule.statements[0]?.text ?? "Only the sheriff can carry out an eviction with a court order.",
      details: evictionRule.statements[0]?.notes ? [evictionRule.statements[0].notes] : undefined,
      sources: evictionRule.sources,
      jurisdiction: evictionRule.jurisdiction,
      lastReviewed: evictionRule.last_reviewed,
    },
  ],
};

export const getRuleCardsForIssue = (issueId?: string) => {
  const issueCards = issueId ? issueRuleCards[issueId] ?? [] : [];
  return [...generalRuleCards, ...issueCards];
};
