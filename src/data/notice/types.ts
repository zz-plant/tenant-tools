export type IssueOption = {
  id: string;
  label: string;
  /**
   * Notice text by stage, then language. `en` is Standard English. Other languages are unreviewed
   * drafts kept for reviewers (docs/translations.md). Residents see only reviewed catalog text.
   */
  notices: Record<string, Record<string, string>>;
  /** Very simple English, one text per notice stage (A first notice, B follow-up, C final reminder). */
  simple: {
    A: string;
    B: string;
    C: string;
  };
};
