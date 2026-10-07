/** English sources for page text that can be translated. Keys are used by the translation catalogs. */
export const rightsStrings = {
  "rights.title": "Chicago tenant rules: short guide",
  "rights.intro": "Information only. Not legal advice. Rules can change. Check the sources.",
  "rights.date": "Date: {date}",
  "rights.print": "Print or save as PDF",
  "rights.back": "Back to notice builder",
  "rights.section.rlto": "Chicago tenant rules (RLTO)",
  "rights.section.reference": "Heat, deposits, and evictions",
  "rights.starting": "Starting {date}:",
  "help.title": "Where to get help",
  "help.intro": "Information only. Not legal advice. Building Ledger does not share your data with these groups.",
  "help.last_checked": "Last checked: {date}",
} as const;

export type RightsStringKey = keyof typeof rightsStrings;

/** Languages the rights page can show once translations are reviewed. */
export const rightsLanguages = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
] as const;
