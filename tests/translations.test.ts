import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createTranslator,
  fillVars,
  getCatalog,
  lookupTranslation,
  resolveNoticeTemplate,
  sourceHash,
  type Catalog,
} from "../src/lib/i18n/translate";
import { collectSourceStrings } from "../src/lib/i18n/sources";
import { checkCatalog, exportTranslationCsv, importTranslationCsv, parseCsv, placeholdersOf } from "../src/lib/i18n/workflow";
import { buildNoticeText, createInitialFormState } from "../src/components/noticeBuilder/logic";
import { heatIssue } from "../src/data/notice/issues/heat";

const onDate = "2026-10-07";
const sources = collectSourceStrings(onDate);
const catalog = (entries: Catalog["entries"]): Catalog => ({ lang: "es", entries });

describe("translation lookup", () => {
  it("shows reviewed text, hides drafts unless previewing, and hides stale text", () => {
    const english = "Print or save as PDF";
    const reviewed = catalog({ k: { text: "Imprimir", status: "reviewed", source_hash: sourceHash(english) } });
    const draft = catalog({ k: { text: "Imprimir", status: "draft", source_hash: sourceHash(english) } });
    const stale = catalog({ k: { text: "Imprimir", status: "reviewed", source_hash: sourceHash("Print") } });
    assert.equal(lookupTranslation(reviewed, "k", english)?.text, "Imprimir");
    assert.equal(lookupTranslation(draft, "k", english), null);
    assert.equal(lookupTranslation(draft, "k", english, { includeDrafts: true })?.text, "Imprimir");
    assert.equal(lookupTranslation(stale, "k", english), null);
  });

  it("fills variables after choosing the text", () => {
    assert.equal(fillVars("Date: {date}. {missing}", { date: "7 oct 2026" }), "Date: 7 oct 2026. {missing}");
  });

  it("never shows the Spanish drafts to residents", () => {
    const resident = createTranslator("es");
    assert.equal(resident.t("rights.title", "Chicago tenant rules: short guide"), "Chicago tenant rules: short guide");
    assert.equal(resident.stats().shown, 0);
    const reviewer = createTranslator("es", { preview: true });
    assert.equal(reviewer.t("rights.title", "Chicago tenant rules: short guide"), "Reglas para inquilinos de Chicago: guía corta");
    assert.equal(reviewer.stats().drafts, 1);
  });
});

describe("saved catalogs", () => {
  it("match their English sources and placeholders", () => {
    for (const lang of ["es", "hi", "pl"]) {
      const saved = getCatalog(lang);
      assert.ok(saved, lang);
      assert.deepEqual(checkCatalog(saved, sources), [], lang);
    }
  });

  it("have a Spanish draft for every rules guide string", () => {
    const es = getCatalog("es");
    assert.ok(es);
    const guideKeys = sources.filter((source) => !source.key.startsWith("notice.")).map((source) => source.key);
    assert.deepEqual(guideKeys.filter((key) => !es.entries[key]), []);
    assert.ok(Object.values(es.entries).every((entry) => entry.status === "draft"));
  });
});

describe("notice templates", () => {
  it("use a reviewed catalog translation when one matches the current English", () => {
    const english = heatIssue.notices.A.en;
    assert.equal(resolveNoticeTemplate("heat", "A", "es", "old", english), "old");
    assert.equal(resolveNoticeTemplate("heat", "A", "en", undefined, english), undefined);
    const state = { ...createInitialFormState(new Date("2026-10-07T12:00:00")), language: "es", simpleEnglish: false, building: "2400 W Wabansia" };
    // No reviewed Spanish notice is in the catalog yet, so the issue file's Spanish text is used.
    assert.ok(buildNoticeText(state, heatIssue).startsWith("Hola"));
  });
});

describe("translation spreadsheet", () => {
  it("parses quoted cells, new lines, and a byte order mark", () => {
    assert.deepEqual(parseCsv('﻿a,b\r\n"x, ""y""","line 1\nline 2"\r\n'), [
      ["a", "b"],
      ['x, "y"', "line 1\nline 2"],
    ]);
  });

  it("exports every source with existing notice translations as drafts", () => {
    const csv = exportTranslationCsv(sources, catalog({}));
    const rows = parseCsv(csv);
    assert.equal(rows.length, sources.length + 1);
    const notice = rows.find((row) => row[0] === "notice.heat.A");
    assert.ok(notice);
    assert.equal(notice[4], "draft");
    assert.ok(notice[3].startsWith("Hola"));
  });

  const row = (key: string, translation: string, status: string, english?: string) => {
    const source = sources.find((entry) => entry.key === key);
    return [key, "ctx", english ?? source?.english ?? "", translation, status, "", ""]
      .map((value) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value))
      .join(",");
  };
  const header = "key,context,english,translation,status,needs_update,note";

  it("imports reviewed lines with the review date", () => {
    const csv = [header, row("rights.print", "Imprimir o guardar como PDF", "reviewed")].join("\n");
    const result = importTranslationCsv(csv, sources, catalog({}), "2026-10-07");
    assert.ok(result.ok);
    assert.deepEqual(result.catalog.entries["rights.print"], {
      text: "Imprimir o guardar como PDF",
      status: "reviewed",
      source_hash: sourceHash("Print or save as PDF"),
      reviewed_on: "2026-10-07",
    });
  });

  it("rejects the whole file when any line is wrong", () => {
    const bad = [
      header,
      row("rights.print", "Imprimir", "reviewed"),
      row("no.such.key", "x", "draft", "x"),
      row("rights.date", "Fecha", "reviewed"),
      row("rights.back", "Volver", "approved"),
      row("rights.intro", "", "draft"),
      row("rights.title", "Llame al 773-555-0100", "draft"),
      row("rights.section.rlto", "Reglas", "draft", "Changed English"),
    ].join("\n");
    const result = importTranslationCsv(bad, sources, catalog({}), "2026-10-07");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errors.length, 6);
      assert.ok(result.errors.some((error) => error.includes("unknown key")));
      assert.ok(result.errors.some((error) => error.includes("placeholders must match")));
      assert.ok(result.errors.some((error) => error.includes("phone")));
      assert.ok(result.errors.some((error) => error.includes("Do not edit the english column")));
    }
  });

  it("removes a translation when its status is cleared", () => {
    const existing = catalog({ "rights.print": { text: "Imprimir", status: "draft", source_hash: sourceHash("Print or save as PDF") } });
    const result = importTranslationCsv([header, row("rights.print", "", "")].join("\n"), sources, existing, "2026-10-07");
    assert.ok(result.ok && !result.catalog.entries["rights.print"] && result.counts.removed === 1);
  });

  it("finds placeholders of both kinds", () => {
    assert.deepEqual(placeholdersOf("Hi [ADDRESS], on {date} and [START DATE]."), ["[ADDRESS]", "[START DATE]", "{date}"]);
  });
});
