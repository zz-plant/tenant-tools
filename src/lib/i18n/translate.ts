import catalogEs from "../../data/i18n/catalog.es.json";
import catalogHi from "../../data/i18n/catalog.hi.json";
import catalogPl from "../../data/i18n/catalog.pl.json";

/*
 * Reviewed translations (AGENTS.md §14).
 *
 * Every translatable string has a key and an English source. A catalog entry holds the
 * translation, its status ("draft" or "reviewed"), and a hash of the English it was made from.
 * Residents see a translation only when it is reviewed and the English has not changed since.
 * Otherwise they see English. Drafts are shown only in reviewer preview.
 */

export type TranslationStatus = "draft" | "reviewed";

export type CatalogEntry = {
  text: string;
  status: TranslationStatus;
  source_hash: string;
  reviewed_on?: string;
  note?: string;
};

export type Catalog = { lang: string; entries: Record<string, CatalogEntry> };

export type Vars = Record<string, string | number>;

/** Short, stable hash of the English source (FNV-1a, 32-bit). Detects stale translations. */
export const sourceHash = (text: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

/** "{date}" -> value. Unknown names stay as they are. */
export const fillVars = (text: string, vars: Vars = {}) =>
  text.replace(/\{([a-z_]+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));

const catalogs: Record<string, Catalog> = {
  es: catalogEs as Catalog,
  hi: catalogHi as Catalog,
  pl: catalogPl as Catalog,
};

export const getCatalog = (lang: string): Catalog | null => catalogs[lang] ?? null;

/** The translation to show for `key`, or null when English should be shown. */
export const lookupTranslation = (
  catalog: Catalog | null,
  key: string,
  english: string,
  options: { includeDrafts?: boolean } = {}
) => {
  const entry = catalog?.entries[key];
  if (!entry || !entry.text.trim() || entry.source_hash !== sourceHash(english)) {
    return null;
  }
  if (entry.status === "reviewed" || (options.includeDrafts && entry.status === "draft")) {
    return entry;
  }
  return null;
};

export type Translate = (key: string, english: string, vars?: Vars) => string;

export const englishTranslate: Translate = (_key, english, vars) => fillVars(english, vars);

/**
 * Translator for one page view. `used` reports whether any translated text was shown, so a
 * page can set its language and date format to match.
 */
export const createTranslator = (lang: string, options: { preview?: boolean } = {}) => {
  const catalog = lang === "en" ? null : getCatalog(lang);
  let shown = 0;
  let drafts = 0;
  const t: Translate = (key, english, vars) => {
    const entry = lookupTranslation(catalog, key, english, { includeDrafts: options.preview });
    if (!entry) {
      return fillVars(english, vars);
    }
    shown += 1;
    if (entry.status === "draft") {
      drafts += 1;
    }
    return fillVars(entry.text, vars);
  };
  return {
    t,
    lang,
    stats: () => ({ shown, drafts }),
  };
};

/**
 * Notice template for a language: a reviewed catalog translation of the current English if one
 * exists, otherwise the translation already in the issue file.
 */
export const resolveNoticeTemplate = (
  issueId: string,
  stage: string,
  lang: string,
  existing: string | undefined,
  english: string | undefined
) => {
  if (lang === "en" || !english) {
    return existing;
  }
  const entry = lookupTranslation(getCatalog(lang), `notice.${issueId}.${stage}`, english);
  return entry ? entry.text : existing;
};
