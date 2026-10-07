# PRO readiness (October 2026)

Status of Chicago's proposed **Protecting Renters Ordinance (PRO)** and what Building Ledger must change if it becomes law.

Last reviewed: 2026-10-07. Information only. Not legal advice.

---

## 1) Where it stands

| Date | Event |
| --- | --- |
| 2026-06-29 | PRO introduced to City Council. Sent to the Committee on Housing and Real Estate. |
| 2026-07-15 | Alternative ordinance **FAIR** (Fair and Accountable Illinois Rental Ordinance) introduced. |
| 2026-09-16 | Housing Committee advanced a PRO **substitute**, 12-9. Just cause for non-renewal and related relocation payments were removed. |
| 2026-09-17 | Zoning Committee advanced FAIR, 12-6. |
| 2026-09-23 | Full Council vote deferred. |
| 2026-09-29 | Full Council vote deferred again. |
| 2026-10-14 | Next scheduled City Council meeting. |

- The introduced PRO text says most of it takes effect **January 1, 2027**, with rental registry sign-up due **January 15, 2027**. The substitute may change these dates.
- This review used the **introduced** text (June 2026). The September 16 substitute was not reviewed line by line.
- FAIR text was not reviewed. Press reports say FAIR shares most RLTO updates with PRO (deposit cap, repair-and-deduct, retaliation, lockouts). It has no Tenant Bill of Rights, no new bureau, a smaller registry, and allows some move-in fees.

Machine-readable status: `src/data/rules/proposals.json`.

---

## 2) How the app is prepared

Rules now live in versioned data: `src/data/rules/chicago/rlto_provisions.json`.

- Each provision has one or more **versions**.
- `status: "law"` versions are shown to residents on the dates they cover.
- `status: "proposed"` versions hold the PRO text we expect. They are **never shown to residents**.
- A `law` version with a future `start_date` shows as "Starting <date>: …" until that date, then replaces the old text.
- RLTO timeline dates (for example, "14 days after first written notice") use the version in effect **on the notice date**, so older records keep the old rule.
- `getPendingRuleChanges()` in `src/data/rules.ts` lists every proposed version with its `app_impact` note.
- `tests/rules.test.ts` simulates passage and checks the switch-over by date.

---

## 3) What PRO would change in this app

Only provisions that touch Building Ledger features are tracked. Fees, just cause, and relocation payments are out of scope (no issue type uses them).

| Provision | Current RLTO | PRO (introduced text) | App impact when law |
| --- | --- | --- | --- |
| Where to send notices | 5-12-090: landlord discloses owner or manager name and address. | 5-12-090(c): landlord gives a notice address. If none, tenant may use the usual way: hand, email, text, or mail. | Update first next-step detail and 311 guidance. |
| Repair request period | 5-12-110: 14 days after written request. | Still 14 days. Relettered to 5-12-110(d), (e). Higher repair-and-deduct limit. Licensed professional required. | Section label only. App does not show dollar limits. |
| Essential services | 5-12-110(f): 24 and 72 hours after written notice. | 5-12-110(g). Adds internet service if the lease says the landlord provides it. | Section label. Consider an "internet" quick fact. |
| Landlord entry | 5-12-050: at least two days' notice. | 48 hours. Landlord must keep a way to enter for repairs. | None. Entry notices already say 48 hours. |
| Retaliation | 5-12-150 and the Illinois Landlord Retaliation Act. | Adds social media complaints and organizing (leaflets, common spaces). One-year presumption in city law. | Consider a short note on the building-wide message step. |
| Security deposit | 5-12-080: 45-day return; interest-bearing account. | Cap of one month's rent. Two business days to answer a written request for deposit information. Interest account rule removed. | Review the deposit interest card. |
| Lockouts | 5-12-160. | Adds internet to protected services. Higher fines. | Add "internet shut off" quick fact. |
| Rental registry | None. | 5-12-175: public, searchable registry with the repair contact. | Link to registry search for "who gets this notice". Never store owner names. |
| Bureau of Rental Housing Services | None. | 2-44-200: receives 311 RLTO complaints. | 311 stays the next normal step. Update category name when published. |
| Tenant Bill of Rights | None. | 5-12-035: right to organize, repair, withhold rent as allowed. | No feature change. |

---

## 4) When PRO (or FAIR) passes

1. Get the **final** ordinance text from the City Clerk. Do not use the introduced text.
2. In `rlto_provisions.json`, for each tracked provision:
   - Compare the `proposed` version with the final text. Fix wording and sections.
   - Set `status` to `"law"` and `start_date` to the effective date.
   - Set `end_date` on the old `law` version to the same date.
   - Remove `proposal_id` only if no longer useful. Keep `app_impact` until the change ships.
3. Do the "App impact" work in section 3 that applies.
4. Update `proposals.json`: status, history, and final effective dates.
5. Update `last_reviewed`, `src/data/rules/CHANGELOG.md`, and `CHANGELOG.md`.
6. Run `bun run typecheck` and `bun run test`.

If FAIR passes instead, add its versions with `proposal_id: "chicago.fair_2026"` and follow the same steps.

If neither passes, set the proposed versions to `"withdrawn"` or remove them.

---

## 5) Safety notes

- Residents never see proposed rules. A bill in committee is not law.
- Rule text stays literal and calm. No fines or penalty amounts are shown.
- Cards that mention holding back rent or paying for repairs always tell residents to talk to legal aid first (AGENTS.md §6.3).
- A registry link must not add owner or manager names to Building Ledger records.

---

## Sources

- [Protecting Renters Ordinance page (City of Chicago)](https://www.chicago.gov/city/en/depts/doh/provdrs/renters/svcs/protecting-renters-ordinance.html)
- [PRO text as introduced, June 2026 (City Clerk attachment)](https://occprodstoragev1.blob.core.usgovcloudapi.net/matterattachmentspublic/64229515-0ddc-4f75-b72e-39d938a33745.pdf)
- [RLTO Summary, English, revised December 2023 (City of Chicago)](https://www.chicago.gov/content/dam/city/depts/doh/RLTO/RLTO%20Summary_2023_EN_FINAL.pdf)
- [PRO issue summary with substitute changes (Chicago Association of REALTORS)](https://chicagorealtor.com/advocacy/advocacy-resources/protecting-renters-ordinance-pro-issue-summary/)
- [Two competing bills head to full City Council (Block Club Chicago, 2026-09-17)](https://blockclubchicago.org/2026/09/17/how-far-should-city-go-to-protect-renters-2-competing-bills-head-to-full-city-council/)
- [Dueling renter protection ordinances (WBEZ, 2026-07-27)](https://www.wbez.org/housing/2026/07/27/renters-protection-ordinances-mayor-brandon-johnson-aldermanic-opponents-dueling-versions-chicago-city-council)
- [Illinois Landlord Retaliation Act (Public Act 103-0831)](https://www.ilga.gov/Legislation/publicacts/view/103-0831)
