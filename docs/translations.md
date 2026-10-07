# Translations: how review works

Building Ledger shows a translation to residents only after a fluent community reviewer checks it (AGENTS.md §14). Machine or draft translations are never shown to residents.

## What can be translated

- The rules guide (`/rights`): page text, rule cards, heat, deposit, and eviction cards, and "Where to get help".
- Notice templates in Spanish, Hindi, and Polish. Reviewed text replaces the text in the issue files.

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
- Notice templates: the Spanish, Hindi, and Polish text in the issue files is still used. It can be exported for review the same way.
