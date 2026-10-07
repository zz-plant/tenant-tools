import heatRuleData from "./rules/chicago/heat.json";
import rltoProvisionsData from "./rules/chicago/rlto_provisions.json";
import rltoSummaryData from "./rules/chicago/rlto_summary.json";
import depositRatesData from "./rules/chicago/security_deposit_interest_rates.json";
import evictionRuleData from "./rules/cook/eviction_enforcement.json";
import proposalsData from "./rules/proposals.json";
import { formatDate, formatTimelineDate } from "../lib/dateUtils";
import { englishTranslate, type Translate } from "../lib/i18n/translate";

/*
 * Rule data for "Help and sources". Information only, not legal advice.
 *
 * Provisions in rlto_provisions.json have versions. Residents see only a version with
 * status "law" whose dates cover the day they are looking. A "law" version that starts
 * later shows as "Starting <date>". A "proposed" version (pending legislation, such as
 * PRO) is never shown to residents. See src/data/rules/README.md.
 */

export type RuleSource = {
  title: string;
  url: string;
};

export type RuleCard = {
  id: string;
  title: string;
  section?: string;
  summary: string;
  details?: string[];
  /** A passed change that starts after the viewing date. Never a proposal. */
  upcoming?: { startDate: string; summary: string; details?: string[] };
  sources: RuleSource[];
  jurisdiction: string;
  lastReviewed: string;
};

export type RuleVersionStatus = "law" | "proposed" | "withdrawn";

export type RuleTiming = {
  amount: number;
  unit: "days" | "hours";
  label: string;
};

export type NoticeTier = { id: string; label: string; days: number };

export type RuleVersion = {
  status: RuleVersionStatus;
  /** Required when status is "proposed". Matches an id in proposals.json. */
  proposal_id?: string;
  /** `YYYY-MM-DD`. null means in effect before this pack began tracking it. */
  start_date: string | null;
  /** `YYYY-MM-DD`, exclusive. null means no end date. */
  end_date: string | null;
  section: string;
  summary: string;
  details: string[];
  /** Time counted from the first written notice. Shown as a timeline date. */
  timing?: RuleTiming;
  /** Notice periods that depend on how long the tenant has lived in the unit (Fair Notice). */
  notice_tiers?: NoticeTier[];
  source_ids: string[];
  /** Maintainer note: what to change in the app when this version becomes law. */
  app_impact?: string;
};

export type RuleProvision = {
  id: string;
  title: string;
  /** Issue ids that show this rule in "Help and sources". */
  issues: string[];
  /** Issue ids that add this rule's timing to the issue timeline. */
  milestone_issues?: string[];
  versions: RuleVersion[];
};

export type RuleProvisionPack = {
  jurisdiction: string;
  rule_id: string;
  last_reviewed: string;
  sources: Array<RuleSource & { id: string }>;
  provisions: RuleProvision[];
};

export type RuleProposal = {
  id: string;
  name: string;
  jurisdiction: string;
  status: string;
  introduced: string;
  proposed_effective_date: string | null;
  text_reviewed: string;
  history: Array<{ date: string; event: string }>;
  next_event?: { date: string; event: string };
  sources: RuleSource[];
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
    exceptions?: string[];
    notes?: string;
  }>;
};

type RltoSummaryRule = {
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
const rltoSummaryRule = rltoSummaryData as RltoSummaryRule;
const depositRule = depositRatesData as DepositRatesRule;
const evictionRule = evictionRuleData as EvictionRule;

export const rltoProvisionPack = rltoProvisionsData as RuleProvisionPack;
export const ruleProposals = (proposalsData as { proposals: RuleProposal[] }).proposals;

const todayIso = () => formatDate(new Date());

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Adds whole days to a `YYYY-MM-DD` date in UTC, so the result never shifts by time zone. */
const addDaysIso = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

// ---------- Versioned provisions ----------

/** True when a "law" version covers `onDate` (`YYYY-MM-DD`). */
export const isVersionInEffect = (version: RuleVersion, onDate: string) =>
  version.status === "law" &&
  (version.start_date === null || version.start_date <= onDate) &&
  (version.end_date === null || onDate < version.end_date);

/** The "law" version in effect on `onDate`. The latest start date wins if two overlap. */
export const selectVersionInEffect = (provision: RuleProvision, onDate: string) =>
  provision.versions
    .filter((version) => isVersionInEffect(version, onDate))
    .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""))[0];

/** The next "law" version that starts after `onDate`. Proposals are never returned. */
export const selectUpcomingVersion = (provision: RuleProvision, onDate: string) =>
  provision.versions
    .filter((version) => version.status === "law" && version.start_date !== null && version.start_date > onDate)
    .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""))[0];

const resolveSources = (pack: RuleProvisionPack, versions: Array<RuleVersion | undefined>) => {
  const byId = new Map(pack.sources.map((source) => [source.id, source]));
  const seen = new Set<string>();
  const sources: RuleSource[] = [];
  versions.forEach((version) => {
    version?.source_ids.forEach((id) => {
      const source = byId.get(id);
      if (source && !seen.has(source.url)) {
        seen.add(source.url);
        sources.push({ title: source.title, url: source.url });
      }
    });
  });
  return sources;
};

/** Card for one provision on `onDate`, or null when no law version is in effect or upcoming. */
const buildProvisionCard = (pack: RuleProvisionPack, provision: RuleProvision, onDate: string): RuleCard | null => {
  const current = selectVersionInEffect(provision, onDate);
  const upcoming = selectUpcomingVersion(provision, onDate);
  const shown = current ?? upcoming;
  if (!shown) {
    return null;
  }
  return {
    id: `${pack.rule_id}.${provision.id}`,
    title: provision.title,
    section: shown.section,
    summary: current ? current.summary : `This rule starts on ${formatTimelineDate(upcoming?.start_date ?? "")}.`,
    details: current && current.details.length > 0 ? current.details : undefined,
    upcoming: upcoming?.start_date
      ? {
          startDate: upcoming.start_date,
          summary: upcoming.summary,
          details: upcoming.details.length > 0 ? upcoming.details : undefined,
        }
      : undefined,
    sources: resolveSources(pack, [current, upcoming]),
    jurisdiction: pack.jurisdiction,
    lastReviewed: pack.last_reviewed,
  };
};

const isCard = (card: RuleCard | null): card is RuleCard => Boolean(card);

/** Cards for every provision that applies to the issue on `onDate`. Pure, so it can be tested with any pack. */
export const buildProvisionCards = (pack: RuleProvisionPack, issueId: string, onDate: string): RuleCard[] =>
  pack.provisions
    .filter((provision) => provision.issues.includes(issueId))
    .map((provision) => buildProvisionCard(pack, provision, onDate))
    .filter(isCard);

export type NoticeMilestone = { label: string; date: string; ruleId: string };

/**
 * Date the RLTO timing for this issue runs out, counted from the first written notice.
 * Uses the rule version in effect on the notice date. Returns null when no rule applies.
 */
export const buildNoticeMilestone = (
  pack: RuleProvisionPack,
  issueId: string | undefined,
  firstNoticeDate: string | undefined
): NoticeMilestone | null => {
  if (!issueId || !firstNoticeDate || !isoDatePattern.test(firstNoticeDate)) {
    return null;
  }
  for (const provision of pack.provisions) {
    if (!provision.milestone_issues?.includes(issueId)) {
      continue;
    }
    const timing = selectVersionInEffect(provision, firstNoticeDate)?.timing;
    if (!timing) {
      continue;
    }
    const days = timing.unit === "hours" ? Math.ceil(timing.amount / 24) : timing.amount;
    return {
      label: timing.label,
      date: addDaysIso(firstNoticeDate, days),
      ruleId: `${pack.rule_id}.${provision.id}`,
    };
  }
  return null;
};

export const getNoticeMilestone = (issueId: string | undefined, firstNoticeDate: string | undefined) =>
  buildNoticeMilestone(rltoProvisionPack, issueId, firstNoticeDate);

/** Fair Notice periods in effect on `onDate`, with the section and sources to cite. */
export const getFairNoticeRule = (onDate: string = todayIso()) => {
  const provision = rltoProvisionPack.provisions.find((entry) => entry.id === "fair_notice");
  const version = provision ? selectVersionInEffect(provision, onDate) : undefined;
  if (!version?.notice_tiers?.length) {
    return null;
  }
  return {
    section: version.section,
    tiers: version.notice_tiers,
    sources: resolveSources(rltoProvisionPack, [version]),
  };
};

/** Every RLTO provision in effect or passed on `onDate`, for the printable rights page. */
export const getAllProvisionCards = (onDate: string = todayIso()): RuleCard[] =>
  rltoProvisionPack.provisions.map((provision) => buildProvisionCard(rltoProvisionPack, provision, onDate)).filter(isCard);

export type PendingRuleChange = {
  provisionId: string;
  title: string;
  section: string;
  summary: string;
  details: string[];
  appImpact: string;
  proposal: RuleProposal | undefined;
};

/** Maintainer view of proposed changes and what each would change in the app. Not for resident UI. */
export const getPendingRuleChanges = (pack: RuleProvisionPack = rltoProvisionPack): PendingRuleChange[] =>
  pack.provisions.flatMap((provision) =>
    provision.versions
      .filter((version) => version.status === "proposed")
      .map((version) => ({
        provisionId: provision.id,
        title: provision.title,
        section: version.section,
        summary: version.summary,
        details: version.details,
        appImpact: version.app_impact ?? "",
        proposal: ruleProposals.find((proposal) => proposal.id === version.proposal_id),
      }))
  );

// ---------- Heat ordinance and reference cards ----------

/** Text and date format for reference cards. English by default; the rights page passes a translator. */
export type CardLocalizer = { t: Translate; locale: string };

const englishLocalizer: CardLocalizer = { t: englishTranslate, locale: "en-US" };

/** English sources for reference card text. Keys are used by the translation catalogs. */
export const referenceStrings = {
  "ref.heat.title": "Chicago heat rule",
  "ref.heat.season": "Heat season is {season}.",
  "ref.heat.season_range": "{start} to {end}",
  "ref.heat.in_season": "It is heat season now.",
  "ref.heat.off_season": "It is not heat season now.",
  "ref.heat.season_unknown": "Heat season dates are listed in the city guidance.",
  "ref.heat.minimum": "At least {temp}°F from {from} to {to}.",
  "ref.deposit.title": "Security deposit interest rates",
  "ref.deposit.latest": "Latest published rate: {rate}% per year ({year}).",
  "ref.deposit.unknown": "The city publishes annual interest rates for security deposits.",
  "ref.deposit.rate": "{year}: {rate}% per year",
  "ref.eviction.title": "Eviction enforcement",
  "ref.eviction.fallback": "Only the sheriff can carry out an eviction with a court order.",
  "ref.rlto_summary.title": "RLTO summary (Chicago)",
  "ref.rlto_summary.summary":
    "The City publishes a short summary of tenant and landlord rules. Landlords must attach it to each lease.",
  "ref.rlto_summary.since": "Summary in effect since {date}.",
} as const;

type ReferenceKey = keyof typeof referenceStrings;
// A value that ends with a period ("8:30 a.m.") before the sentence's own period would print "..".
const ref = (localizer: CardLocalizer, key: ReferenceKey, vars?: Record<string, string | number>) =>
  localizer.t(key, referenceStrings[key], vars).replace(/\.\.(?=\s|$)/g, ".");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Intl output can hold narrow no-break spaces. Plain spaces print and copy the same everywhere.
const plainSpaces = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

/** "09-15" -> "September 15" in English, or the locale's form, such as "15 de septiembre". */
const formatMonthDay = (monthDay: string, locale = "en-US") => {
  const [month, day] = monthDay.split("-").map(Number);
  if (locale === "en-US") {
    return `${monthNames[month - 1]} ${day}`;
  }
  return plainSpaces(
    new Date(Date.UTC(2001, month - 1, day)).toLocaleDateString(locale, { month: "long", day: "numeric", timeZone: "UTC" })
  );
};

/** "22:30" -> "10:30 PM" in English, or the locale's form. */
const formatClockTime = (time: string, locale = "en-US") => {
  const [hours, minutes] = time.split(":").map(Number);
  if (locale === "en-US") {
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }
  return plainSpaces(
    new Date(Date.UTC(2001, 0, 1, hours, minutes)).toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    })
  );
};

/** "2026-10-07" -> "Oct 7, 2026" in English, or the locale's short form. */
export const formatDateForLocale = (isoDate: string, locale = "en-US") =>
  locale === "en-US"
    ? formatTimelineDate(isoDate)
    : plainSpaces(
        new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      );

const heatPeriod = heatRule.effective_periods[0];

/** True when `onDate` (`YYYY-MM-DD`) falls in heat season. The season wraps over the new year. */
export const isInHeatSeason = (onDate: string = todayIso()) => {
  const season = heatPeriod?.heat_season;
  if (!season || !isoDatePattern.test(onDate)) {
    return false;
  }
  const monthDay = onDate.slice(5);
  return monthDay >= season.start || monthDay <= season.end;
};

const buildHeatSeasonLabel = (localizer: CardLocalizer) =>
  heatPeriod?.heat_season
    ? ref(localizer, "ref.heat.season_range", {
        start: formatMonthDay(heatPeriod.heat_season.start, localizer.locale),
        end: formatMonthDay(heatPeriod.heat_season.end, localizer.locale),
      })
    : "";

const buildHeatMinimumLines = (localizer: CardLocalizer) =>
  (heatPeriod?.minimum_indoor_temperature ?? []).map((range) =>
    ref(localizer, "ref.heat.minimum", {
      temp: range.temp_f,
      from: formatClockTime(range.from, localizer.locale),
      to: formatClockTime(range.to, localizer.locale),
    })
  );

export const heatSeasonLabel = buildHeatSeasonLabel(englishLocalizer);

/** "At least 68°F from 8:30 AM to 10:30 PM." for each time range. */
export const heatMinimumLines = buildHeatMinimumLines(englishLocalizer);

/** English heat exceptions with their translation keys. */
export const heatExceptions = (heatPeriod?.exceptions ?? []).map((text, index) => ({ key: `ref.heat.exception.${index}`, text }));

const heatCard = (onDate: string, localizer: CardLocalizer = englishLocalizer): RuleCard => {
  const season = buildHeatSeasonLabel(localizer);
  return {
    id: heatRule.rule_id,
    title: ref(localizer, "ref.heat.title"),
    summary: season
      ? `${ref(localizer, "ref.heat.season", { season })} ${ref(localizer, isInHeatSeason(onDate) ? "ref.heat.in_season" : "ref.heat.off_season")}`
      : ref(localizer, "ref.heat.season_unknown"),
    details: [
      ...buildHeatMinimumLines(localizer),
      ...heatExceptions.map((exception) => localizer.t(exception.key, exception.text)),
    ],
    sources: heatRule.sources,
    jurisdiction: heatRule.jurisdiction,
    lastReviewed: heatRule.last_reviewed,
  };
};

// ---------- Other cards ----------

const getLatestRateYear = () =>
  Object.keys(depositRule.rates_by_year)
    .map((year) => Number(year))
    .filter((year) => !Number.isNaN(year))
    .sort((a, b) => b - a)[0];

const depositInterestCard = (localizer: CardLocalizer = englishLocalizer): RuleCard => {
  const latestRateYear = getLatestRateYear();
  const latestRate = latestRateYear ? depositRule.rates_by_year[String(latestRateYear)] : null;
  const rateDetails = Object.entries(depositRule.rates_by_year)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .slice(0, 3)
    .map(([year, rate]) => ref(localizer, "ref.deposit.rate", { year, rate }));
  return {
    id: depositRule.rule_id,
    title: ref(localizer, "ref.deposit.title"),
    summary:
      latestRateYear && latestRate !== null
        ? ref(localizer, "ref.deposit.latest", { rate: latestRate, year: latestRateYear })
        : ref(localizer, "ref.deposit.unknown"),
    details: rateDetails.length > 0 ? rateDetails : undefined,
    sources: depositRule.sources,
    jurisdiction: depositRule.jurisdiction,
    lastReviewed: depositRule.last_reviewed,
  };
};

/** English eviction statement and note, with their translation keys. */
export const evictionStrings = {
  statement: { key: "ref.eviction.statement", text: evictionRule.statements[0]?.text ?? "" },
  note: { key: "ref.eviction.note", text: evictionRule.statements[0]?.notes ?? "" },
};

const evictionCard = (localizer: CardLocalizer = englishLocalizer): RuleCard => ({
  id: evictionRule.rule_id,
  title: ref(localizer, "ref.eviction.title"),
  summary: evictionStrings.statement.text
    ? localizer.t(evictionStrings.statement.key, evictionStrings.statement.text)
    : ref(localizer, "ref.eviction.fallback"),
  details: evictionStrings.note.text ? [localizer.t(evictionStrings.note.key, evictionStrings.note.text)] : undefined,
  sources: evictionRule.sources,
  jurisdiction: evictionRule.jurisdiction,
  lastReviewed: evictionRule.last_reviewed,
});

const rltoSummaryCard = (onDate: string, localizer: CardLocalizer = englishLocalizer): RuleCard => {
  const period =
    rltoSummaryRule.effective_periods.find(
      (entry) => entry.start_date <= onDate && (entry.end_date === null || onDate < entry.end_date)
    ) ?? rltoSummaryRule.effective_periods[0];
  return {
    id: rltoSummaryRule.rule_id,
    title: ref(localizer, "ref.rlto_summary.title"),
    summary: ref(localizer, "ref.rlto_summary.summary"),
    details: period?.start_date
      ? [ref(localizer, "ref.rlto_summary.since", { date: formatDateForLocale(period.start_date, localizer.locale) })]
      : undefined,
    sources: rltoSummaryRule.sources,
    jurisdiction: rltoSummaryRule.jurisdiction,
    lastReviewed: rltoSummaryRule.last_reviewed,
  };
};

const issueSpecificCards: Record<string, (onDate: string) => RuleCard[]> = {
  heat: (onDate) => [heatCard(onDate)],
  deposit: () => [depositInterestCard()],
  lockout: () => [evictionCard()],
};

/** Heat, deposit interest, eviction, and RLTO summary cards on a date, for the printable rights page. */
export const getReferenceRuleCards = (onDate: string = todayIso(), localizer: CardLocalizer = englishLocalizer): RuleCard[] => {
  const date = isoDatePattern.test(onDate) ? onDate : todayIso();
  return [heatCard(date, localizer), depositInterestCard(localizer), evictionCard(localizer), rltoSummaryCard(date, localizer)];
};

/**
 * Rule cards for an issue on a date (`YYYY-MM-DD`, default today): issue rules first,
 * then RLTO rules for the issue, then the RLTO summary.
 */
export const getRuleCardsForIssue = (issueId?: string, onDate: string = todayIso()): RuleCard[] => {
  const date = isoDatePattern.test(onDate) ? onDate : todayIso();
  const issueCards = issueId ? issueSpecificCards[issueId]?.(date) ?? [] : [];
  const provisionCards = issueId ? buildProvisionCards(rltoProvisionPack, issueId, date) : [];
  return [...issueCards, ...provisionCards, rltoSummaryCard(date)];
};
