/*
 * Translation review workflow (AGENTS.md §14).
 *
 *   bun run translations export es translations-es.csv   Write a spreadsheet for reviewers.
 *   bun run translations import es translations-es.csv   Check it and update the catalog.
 *   bun run translations check                          Check all catalogs.
 *
 * Reviewers change only the "translation", "status", and "note" columns.
 * Status "reviewed" means a fluent community reviewer checked the text. Only reviewed text is
 * shown to residents. "draft" is shown only in reviewer preview (/rights?lang=es&preview=drafts).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { collectSourceStrings } from "../src/lib/i18n/sources";
import { checkCatalog, exportTranslationCsv, importTranslationCsv } from "../src/lib/i18n/workflow";
import type { Catalog } from "../src/lib/i18n/translate";

const languages = ["es", "hi", "pl"];
const catalogPath = (lang: string) => new URL(`../src/data/i18n/catalog.${lang}.json`, import.meta.url);
const readCatalog = (lang: string): Catalog => JSON.parse(readFileSync(catalogPath(lang), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const [command, lang, file] = process.argv.slice(2);
const sources = collectSourceStrings(today);

const fail = (message: string) => {
  console.error(message);
  process.exit(1);
};

if (command === "export") {
  if (!lang || !languages.includes(lang)) fail(`Choose a language: ${languages.join(", ")}`);
  const csv = exportTranslationCsv(sources, readCatalog(lang));
  if (file) {
    writeFileSync(file, "﻿" + csv);
    console.log(`Wrote ${sources.length} rows to ${file}.`);
  } else {
    process.stdout.write(csv);
  }
} else if (command === "import") {
  if (!lang || !languages.includes(lang) || !file) fail("Usage: import <lang> <file.csv>");
  const result = importTranslationCsv(readFileSync(file, "utf8"), sources, readCatalog(lang), today);
  if (!result.ok) {
    fail(["The catalog was not changed. Fix these rows:", ...result.errors].join("\n"));
  } else {
    writeFileSync(catalogPath(lang), JSON.stringify(result.catalog, null, 2) + "\n");
    console.log(`Updated ${lang}: ${result.counts.reviewed} reviewed, ${result.counts.draft} draft, ${result.counts.removed} removed.`);
  }
} else if (command === "check") {
  const problems = languages.flatMap((code) => checkCatalog(readCatalog(code), sources).map((problem) => `${code} ${problem}`));
  if (problems.length > 0) fail(problems.join("\n"));
  console.log("All catalogs match their English sources.");
} else {
  fail("Commands: export <lang> [file], import <lang> <file>, check");
}
