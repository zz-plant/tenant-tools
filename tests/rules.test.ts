import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildNoticeMilestone,
  buildProvisionCards,
  getNoticeMilestone,
  getPendingRuleChanges,
  getRuleCardsForIssue,
  isInHeatSeason,
  ruleProposals,
  rltoProvisionPack,
  type RuleProvisionPack,
  type RuleVersion,
} from "../src/data/rules";
import { issueOptions } from "../src/data/noticeData";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
// Issue ids the builder lists, plus issue files it does not list yet.
const knownIssueIds = new Set<string>([...issueOptions.map((issue) => issue.id), "deposit", "lockout"]);
const allVersions = rltoProvisionPack.provisions.flatMap((provision) =>
  provision.versions.map((version) => ({ provision, version }))
);

const clonePack = (): RuleProvisionPack => JSON.parse(JSON.stringify(rltoProvisionPack));

/** Turns the PRO version of a provision into law on `startDate`, the way a maintainer would after passage. */
const enactProposal = (pack: RuleProvisionPack, provisionId: string, startDate: string) => {
  const provision = pack.provisions.find((entry) => entry.id === provisionId);
  assert.ok(provision, `missing provision ${provisionId}`);
  provision.versions.forEach((version: RuleVersion) => {
    if (version.status === "law" && version.end_date === null) {
      version.end_date = startDate;
    }
    if (version.status === "proposed") {
      version.status = "law";
      version.start_date = startDate;
    }
  });
  return pack;
};

const cardText = (cards: ReturnType<typeof getRuleCardsForIssue>) =>
  cards
    .flatMap((card) => [
      card.title,
      card.summary,
      ...(card.details ?? []),
      card.upcoming?.summary ?? "",
      ...(card.upcoming?.details ?? []),
    ])
    .join("\n");

describe("RLTO provision data", () => {
  it("uses known statuses, issues, dates, and sources", () => {
    const sourceIds = new Set(rltoProvisionPack.sources.map((source) => source.id));
    assert.match(rltoProvisionPack.last_reviewed, isoDate);
    for (const { provision, version } of allVersions) {
      assert.ok(["law", "proposed", "withdrawn"].includes(version.status), `${provision.id} status`);
      assert.ok(version.section.trim(), `${provision.id} is missing a section`);
      assert.ok(version.summary.trim(), `${provision.id} is missing a summary`);
      assert.ok(version.source_ids.length > 0, `${provision.id} has no sources`);
      version.source_ids.forEach((id) => assert.ok(sourceIds.has(id), `${provision.id} cites unknown source ${id}`));
      [version.start_date, version.end_date].forEach((date) => {
        if (date !== null) {
          assert.match(date, isoDate, `${provision.id} has a bad date`);
        }
      });
    }
    for (const provision of rltoProvisionPack.provisions) {
      [...provision.issues, ...(provision.milestone_issues ?? [])].forEach((issueId) =>
        assert.ok(knownIssueIds.has(issueId), `${provision.id} lists unknown issue ${issueId}`)
      );
      (provision.milestone_issues ?? []).forEach((issueId) =>
        assert.ok(provision.issues.includes(issueId), `${provision.id} milestone issue ${issueId} has no card`)
      );
    }
  });

  it("links every proposed version to a tracked proposal with an app impact note", () => {
    const proposalIds = new Set(ruleProposals.map((proposal) => proposal.id));
    for (const { provision, version } of allVersions.filter(({ version }) => version.status === "proposed")) {
      assert.ok(version.proposal_id && proposalIds.has(version.proposal_id), `${provision.id} proposal id`);
      assert.ok(version.app_impact?.trim(), `${provision.id} is missing app_impact`);
    }
  });

  it("never has two law versions in effect on the same day", () => {
    for (const provision of rltoProvisionPack.provisions) {
      const laws = provision.versions.filter((version) => version.status === "law");
      laws.forEach((a, indexA) =>
        laws.slice(indexA + 1).forEach((b) => {
          const aEndsBeforeB = a.end_date !== null && b.start_date !== null && a.end_date <= b.start_date;
          const bEndsBeforeA = b.end_date !== null && a.start_date !== null && b.end_date <= a.start_date;
          assert.ok(aEndsBeforeB || bEndsBeforeA, `${provision.id} has overlapping law versions`);
        })
      );
    }
  });

  it("keeps resident text literal and free of pressure or legal claims", () => {
    for (const { provision, version } of allVersions) {
      for (const text of [version.summary, ...version.details]) {
        assert.deepEqual(lintVerySimpleEnglish(text).warnings, [], `${provision.id}: ${text}`);
        assert.ok(text.length <= 220, `${provision.id} has a long sentence block: ${text}`);
      }
    }
  });

  it("tracks the proposals with dated history and sources", () => {
    assert.ok(ruleProposals.some((proposal) => proposal.id === "chicago.pro_2026"));
    for (const proposal of ruleProposals) {
      assert.match(proposal.introduced, isoDate);
      assert.ok(proposal.sources.length > 0, `${proposal.id} has no sources`);
      proposal.history.forEach((entry) => assert.match(entry.date, isoDate));
    }
  });
});

describe("getRuleCardsForIssue", () => {
  it("shows RLTO rules for an issue with their sections", () => {
    const cards = getRuleCardsForIssue("leak", "2026-10-07");
    const repair = cards.find((card) => card.id.endsWith(".repair_request"));
    assert.ok(repair);
    assert.equal(repair.section, "RLTO 5-12-110");
    assert.ok(repair.summary.includes("14 days"));
    assert.ok(cards.some((card) => card.id.endsWith(".retaliation")));
    assert.ok(cards.some((card) => card.id.endsWith(".notice_address")));
  });

  it("never shows proposed rules to residents", () => {
    const issueIds = [...knownIssueIds];
    for (const issueId of issueIds) {
      const cards = getRuleCardsForIssue(issueId, "2026-10-07");
      assert.ok(!cards.some((card) => card.id.endsWith(".rental_registry")), `${issueId} shows the registry`);
      assert.ok(!cards.some((card) => card.id.endsWith(".rental_housing_bureau")), `${issueId} shows the bureau`);
      assert.ok(!cards.some((card) => card.upcoming), `${issueId} shows an upcoming change`);
    }
    assert.ok(!cardText(getRuleCardsForIssue("lockout", "2026-10-07")).includes("internet"));
    assert.ok(!cardText(getRuleCardsForIssue("entry", "2026-10-07")).includes("48 hours"));
  });

  it("links the current RLTO summary, not the 2011 scan", () => {
    const summary = getRuleCardsForIssue("heat", "2026-10-07").find((card) => card.title === "RLTO summary (Chicago)");
    assert.ok(summary);
    const urls = summary.sources.map((source) => source.url);
    assert.ok(urls.some((url) => url.includes("RLTO%20Summary_2023_EN_FINAL.pdf")));
    assert.ok(urls.some((url) => url.includes("RLTO%20Summary_2023_ES-US.pdf")));
    assert.ok(!urls.some((url) => url.includes("RLTOEnglish.pdf")));
  });

  it("says whether it is heat season on the viewing date", () => {
    const inSeason = getRuleCardsForIssue("heat", "2026-10-07")[0];
    const offSeason = getRuleCardsForIssue("heat", "2026-07-01")[0];
    assert.equal(inSeason.title, "Chicago heat rule");
    assert.ok(inSeason.summary.includes("It is heat season now."));
    assert.ok(offSeason.summary.includes("It is not heat season now."));
    assert.ok(inSeason.details?.includes("At least 68°F from 8:30 AM to 10:30 PM."));
    assert.ok(inSeason.details?.includes("At least 66°F from 10:30 PM to 8:30 AM."));
  });
});

describe("isInHeatSeason", () => {
  it("covers September 15 through June 1 across the new year", () => {
    assert.equal(isInHeatSeason("2026-09-14"), false);
    assert.equal(isInHeatSeason("2026-09-15"), true);
    assert.equal(isInHeatSeason("2027-01-10"), true);
    assert.equal(isInHeatSeason("2027-06-01"), true);
    assert.equal(isInHeatSeason("2027-06-02"), false);
    assert.equal(isInHeatSeason("not a date"), false);
  });
});

describe("when a proposal becomes law", () => {
  it("shows the passed change as upcoming, then switches on the start date", () => {
    const pack = enactProposal(clonePack(), "entry_notice", "2027-01-01");

    const entryCard = (onDate: string) =>
      buildProvisionCards(pack, "entry", onDate).find((card) => card.id.endsWith(".entry_notice"));

    const before = entryCard("2026-12-01");
    assert.ok(before);
    assert.ok(before.summary.includes("two days"));
    assert.equal(before.upcoming?.startDate, "2027-01-01");
    assert.ok(before.upcoming?.summary.includes("48 hours"));

    const after = entryCard("2027-01-02");
    assert.ok(after?.summary.includes("48 hours"));
    assert.equal(after?.upcoming, undefined);
  });

  it("shows a brand-new rule only from when it passes, with its start date", () => {
    const pack = enactProposal(clonePack(), "rental_registry", "2027-01-01");

    const before = buildProvisionCards(pack, "leak", "2026-12-01").find((card) => card.id.endsWith(".rental_registry"));
    assert.ok(before);
    assert.equal(before.summary, "This rule starts on Jan 1, 2027.");
    assert.ok(before.upcoming?.summary.includes("register"));

    const after = buildProvisionCards(pack, "leak", "2027-02-01").find((card) => card.id.endsWith(".rental_registry"));
    assert.ok(after?.summary.includes("register"));
  });

  it("counts timeline dates with the rule in effect on the notice date", () => {
    const pack = clonePack();
    const repair = pack.provisions.find((provision) => provision.id === "repair_request");
    assert.ok(repair);
    const law = repair.versions.find((version) => version.status === "law");
    assert.ok(law?.timing);
    law.end_date = "2027-01-01";
    repair.versions.push({
      ...law,
      start_date: "2027-01-01",
      end_date: null,
      timing: { amount: 10, unit: "days", label: "10 days after first written notice" },
    });

    assert.equal(buildNoticeMilestone(pack, "leak", "2026-12-30")?.date, "2027-01-13");
    assert.equal(buildNoticeMilestone(pack, "leak", "2027-01-02")?.date, "2027-01-12");
  });
});

describe("getNoticeMilestone", () => {
  it("counts 14 days for repairs and 24 hours for heat", () => {
    const leak = getNoticeMilestone("leak", "2026-10-01");
    assert.deepEqual(
      { label: leak?.label, date: leak?.date },
      { label: "14 days after first written notice (RLTO 5-12-110)", date: "2026-10-15" }
    );
    assert.equal(getNoticeMilestone("heat", "2026-10-01")?.date, "2026-10-02");
    assert.ok(getNoticeMilestone("heat", "2026-10-01")?.label.startsWith("24 hours"));
  });

  it("crosses month and year ends", () => {
    assert.equal(getNoticeMilestone("pests", "2026-12-25")?.date, "2027-01-08");
  });

  it("returns null when no timing rule applies or the date is missing", () => {
    assert.equal(getNoticeMilestone("entry", "2026-10-01"), null);
    assert.equal(getNoticeMilestone("leak", ""), null);
    assert.equal(getNoticeMilestone("leak", "10/01/2026"), null);
    assert.equal(getNoticeMilestone(undefined, "2026-10-01"), null);
  });
});

describe("getPendingRuleChanges", () => {
  it("lists each proposed change with its proposal and app impact", () => {
    const pending = getPendingRuleChanges();
    assert.ok(pending.length > 0);
    assert.ok(pending.some((change) => change.provisionId === "rental_registry"));
    for (const change of pending) {
      assert.equal(change.proposal?.name, "Protecting Renters Ordinance (PRO)");
      assert.ok(change.appImpact);
    }
  });
});
