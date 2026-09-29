export type IssueOption = {
  id: string;
  label: string;
  notices: Record<string, Record<string, string>>;
  /** Very simple English, one text per notice stage (A first notice, B follow-up, C final reminder). */
  simple: {
    A: string;
    B: string;
    C: string;
  };
};
