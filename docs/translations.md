# Translations: how review works

Tenant Tools shows a translation to residents only after a fluent community reviewer checks it (AGENTS.md §14). Machine or draft translations are never shown to residents.

## What can be translated

- The rules guide (`/rights`): page text, rule cards, heat, deposit, and eviction cards, and "Where to get help".
- Notice templates in Spanish, Hindi, and Polish (`notice.<issue>.<stage>`).
- The notice builder note that says a notice is shown in English (`builder.notice_not_reviewed`).

Each string has a key, its English source, and a status:

| Status | Who sees it |
| --- | --- |
| (empty) | No one. English is shown. |
| `draft` | Reviewers only, in preview: `/rights?lang=es&preview=drafts`. |
| `reviewed` | Residents. |

If the English changes later, the translation stops showing until someone reviews it again. The spreadsheet marks these rows `needs_update: yes`.

## For a maintainer

```bash
bun run translations export es translations-es.csv
```

Send the CSV to the reviewer. It opens in Google Sheets, Excel, or LibreOffice.

When it comes back:

```bash
bun run translations import es translations-es.csv
bun run translations check
bun run test
```

The import checks every row. If any row has a problem, nothing is changed and the problems are listed. Then open a pull request with the updated `src/data/i18n/catalog.es.json`.

## For a reviewer

1. Change only the `translation`, `status`, and `note` columns. Do not change `key`, `context`, or `english`.
2. Keep every placeholder exactly as it is: `[ADDRESS]`, `[START DATE]`, `{date}`, `{rate}`, and so on.
3. Use short sentences and common words. Many readers are new to the language.
4. Do not add names, phone numbers, or unit numbers.
5. When a line is correct, set `status` to `reviewed`. If you are not sure, leave it as `draft` and write why in `note`.
6. To see drafts in place, open `/rights?lang=es&preview=drafts`.

## Current state (October 2026)

- Spanish rules guide: 78 lines drafted, 0 reviewed. Residents who open `/rights?lang=es` see English and a link to the City's official Spanish RLTO summary.
- Notice templates: 0 reviewed. The Spanish, Hindi, and Polish text in `src/data/notice/issues/*.ts` is an unreviewed draft. Part of it was drafted by AI in PR #158. It is not shown to residents. A resident who chooses Spanish, Hindi, or Polish gets the English notice and a note that says so. The note is in English until its own translation is reviewed.
- The drafts stay in the issue files so reviewers can start from them. The export puts each one in the `translation` column with status `draft`. When a reviewer marks a notice `reviewed`, residents see the catalog text, not the issue-file text.
