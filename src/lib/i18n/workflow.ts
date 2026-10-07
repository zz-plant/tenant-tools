import { getSensitiveContentMessages } from "../validation";
import { sourceHash, type Catalog, type CatalogEntry, type TranslationStatus } from "./translate";
import type { SourceString } from "./sources";

/*
 * Spreadsheet round trip for volunteer reviewers.
 * export: one row per string, with the current translation and its status.
 * import: checks every row, then returns the new catalog. Nothing is written if any row fails.
 */

export const translationCsvColumns = ["key", "context", "english", "translation", "status", "needs_update", "note"] as const;

const csvQuote = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((value) => value.trim()));
};

export const exportTranslationCsv = (sources: SourceString[], catalog: Catalog) => {
  const lines = [translationCsvColumns.join(",")];
  sources.forEach((source) => {
    const entry = catalog.entries[source.key];
    const existing = source.existing?.[catalog.lang];
    const translation = entry?.text ?? existing ?? "";
    const status = entry?.status ?? (existing ? "draft" : "");
    const needsUpdate = entry && entry.source_hash !== sourceHash(source.english) ? "yes" : "";
    lines.push(
      [source.key, source.context, source.english, translation, status, needsUpdate, entry?.note ?? ""]
        .map((value) => csvQuote(value))
        .join(",")
    );
  });
  return lines.join("\r\n") + "\r\n";
};

/** "[ADDRESS]" and "{date}" placeholders must match between English and the translation. */
export const placeholdersOf = (text: string) =>
  [...text.matchAll(/\[[A-Z][A-Z /-]*\]|\{[a-z_]+\}/g)].map((match) => match[0]).sort();

export type ImportResult =
  | { ok: true; catalog: Catalog; counts: { reviewed: number; draft: number; removed: number } }
  | { ok: false; errors: string[] };

export const importTranslationCsv = (
  csv: string,
  sources: SourceString[],
  catalog: Catalog,
  today: string
): ImportResult => {
  const rows = parseCsv(csv);
  const header = rows.shift() ?? [];
  const column = (name: (typeof translationCsvColumns)[number]) => header.indexOf(name);
  const required = ["key", "english", "translation", "status"] as const;
  const missing = required.filter((name) => column(name) === -1);
  if (missing.length > 0) {
    return { ok: false, errors: [`Missing columns: ${missing.join(", ")}`] };
  }

  const sourceByKey = new Map(sources.map((source) => [source.key, source]));
  const entries: Record<string, CatalogEntry> = { ...catalog.entries };
  const errors: string[] = [];
  const counts = { reviewed: 0, draft: 0, removed: 0 };

  rows.forEach((cells, index) => {
    const line = index + 2;
    const key = (cells[column("key")] ?? "").trim();
    const translation = (cells[column("translation")] ?? "").trim();
    const status = (cells[column("status")] ?? "").trim().toLowerCase();
    const english = cells[column("english")] ?? "";
    const note = column("note") === -1 ? "" : (cells[column("note")] ?? "").trim();
    const source = sourceByKey.get(key);
    if (!source) {
      errors.push(`Line ${line}: unknown key "${key}".`);
      return;
    }
    if (english.trim() !== source.english.trim()) {
      errors.push(`Line ${line} (${key}): the English text was changed. Do not edit the english column.`);
      return;
    }
    if (!status) {
      if (entries[key]) {
        delete entries[key];
        counts.removed += 1;
      }
      return;
    }
    if (status !== "draft" && status !== "reviewed") {
      errors.push(`Line ${line} (${key}): status must be "draft", "reviewed", or empty.`);
      return;
    }
    if (!translation) {
      errors.push(`Line ${line} (${key}): translation is empty.`);
      return;
    }
    const expected = placeholdersOf(source.english).join(" ");
    const actual = placeholdersOf(translation).join(" ");
    if (expected !== actual) {
      errors.push(`Line ${line} (${key}): placeholders must match the English. Expected: ${expected || "none"}. Found: ${actual || "none"}.`);
      return;
    }
    const sensitive = getSensitiveContentMessages(translation, { allowBareDigitRuns: true }).filter(
      (message) => !getSensitiveContentMessages(source.english, { allowBareDigitRuns: true }).includes(message)
    );
    if (sensitive.length > 0) {
      errors.push(`Line ${line} (${key}): ${sensitive.join(" ")}`);
      return;
    }
    const previous = entries[key];
    const unchangedReview =
      previous?.status === "reviewed" && status === "reviewed" && previous.text === translation && previous.source_hash === sourceHash(source.english);
    entries[key] = {
      text: translation,
      status: status as TranslationStatus,
      source_hash: sourceHash(source.english),
      ...(status === "reviewed" ? { reviewed_on: unchangedReview && previous.reviewed_on ? previous.reviewed_on : today } : {}),
      ...(note ? { note } : {}),
    };
    counts[status as TranslationStatus] += 1;
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
  return { ok: true, catalog: { lang: catalog.lang, entries: sorted }, counts };
};

/** Problems in a saved catalog: unknown keys, stale English, placeholder mismatches. */
export const checkCatalog = (catalog: Catalog, sources: SourceString[]) => {
  const sourceByKey = new Map(sources.map((source) => [source.key, source]));
  const problems: string[] = [];
  Object.entries(catalog.entries).forEach(([key, entry]) => {
    const source = sourceByKey.get(key);
    if (!source) {
      problems.push(`${key}: no English source with this key.`);
      return;
    }
    if (entry.source_hash !== sourceHash(source.english)) {
      problems.push(`${key}: the English changed after translation. Review it again.`);
    }
    if (placeholdersOf(entry.text).join(" ") !== placeholdersOf(source.english).join(" ")) {
      problems.push(`${key}: placeholders do not match the English.`);
    }
  });
  return problems;
};
