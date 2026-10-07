import { evictionStrings, getAllProvisionCards, heatExceptions, referenceStrings } from "../../data/rules";
import { helpResourceGroups } from "../../data/helpResources";
import { issueOptions } from "../../data/noticeData";
import { depositIssue } from "../../data/notice/issues/deposit";
import { lockoutIssue } from "../../data/notice/issues/lockout";
import { rightsStrings } from "../../data/i18n/strings";

/*
 * Every string the translation workflow knows about, with its English source.
 * The export command writes these to a spreadsheet. The import command accepts only these keys.
 */

export type SourceString = {
  key: string;
  english: string;
  /** Where the text appears, for reviewers. */
  context: string;
  /** Translation already in the code (notice templates), used when the catalog has none. */
  existing?: Record<string, string>;
};

/** Provision card text in effect today, keyed by provision. */
const provisionSources = (onDate: string): SourceString[] =>
  getAllProvisionCards(onDate).flatMap((card) => {
    const provisionId = card.id.split(".").pop() ?? card.id;
    return [
      { key: `rule.${provisionId}.title`, english: card.title, context: "Rules guide: rule title" },
      { key: `rule.${provisionId}.summary`, english: card.summary, context: "Rules guide: rule summary" },
      ...(card.details ?? []).map((detail, index) => ({
        key: `rule.${provisionId}.detail.${index}`,
        english: detail,
        context: "Rules guide: rule detail",
      })),
    ];
  });

const helpSources = (): SourceString[] =>
  helpResourceGroups.flatMap((group) => [
    { key: `help.${group.id}.title`, english: group.title, context: "Where to get help: group title" },
    ...(group.note ? [{ key: `help.${group.id}.note`, english: group.note, context: "Where to get help: group note" }] : []),
    ...group.items.map((item, index) => ({
      key: `help.${group.id}.item.${index}.description`,
      english: item.description,
      context: `Where to get help: description of ${item.name}`,
    })),
  ]);

const noticeSources = (): SourceString[] =>
  [...issueOptions, depositIssue, lockoutIssue].flatMap((issue) =>
    (["A", "B", "C"] as const)
      .filter((stage) => issue.notices[stage]?.en)
      .map((stage) => {
        const { en, ...existing } = issue.notices[stage];
        return {
          key: `notice.${issue.id}.${stage}`,
          english: en,
          context: `Notice: ${issue.label}, stage ${stage}`,
          existing,
        };
      })
  );

export const collectSourceStrings = (onDate: string): SourceString[] => {
  const seen = new Set<string>();
  return [
    ...Object.entries(rightsStrings).map(([key, english]) => ({ key, english, context: "Rules guide: page text" })),
    ...Object.entries(referenceStrings).map(([key, english]) => ({ key, english, context: "Rules guide: reference card" })),
    ...heatExceptions.map((exception) => ({ key: exception.key, english: exception.text, context: "Rules guide: heat rule" })),
    ...Object.values(evictionStrings)
      .filter((entry) => entry.text)
      .map((entry) => ({ key: entry.key, english: entry.text, context: "Rules guide: eviction card" })),
    ...provisionSources(onDate),
    ...helpSources(),
    ...noticeSources(),
  ].filter((entry) => (seen.has(entry.key) ? false : (seen.add(entry.key), true)));
};
