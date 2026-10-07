# Organizing features (October 2026)

Features added after reviewing how Chicago tenant unions work, such as the Chicago Union of Tenants (CUT). CUT helps residents form building unions and make joint requests to management. Examples: the Lunt Avenue tenants (about 30 signers, written plan requested in 30 days) and Hilliard Towers (49 signers, plan requested in 10 business days, copies to the alderperson, the mayor, CHA, and HUD).

These features were inferred from public reporting. CUT did not review them.

## Built

| # | Feature | Where | Safety notes |
| --- | --- | --- | --- |
| 1, 2, 4, 16 | Joint repair-plan letter with household count, reply date, and copy-to list | `/buildings/{id}/letter` | No names. Household and report counts under 3 are left out. Firm, factual wording. No threats. Very simple English version. Saved as a "Building-wide message" record. |
| 3 | Reply tracking: "Reply requested by", "Management replied", "Repair date promised" | Record page, "Add a dated fact" | Fixed list, dates only. |
| 7 | "Portal request marked complete, but not fixed" with work order number | Record page; printable building summary | Number is length-limited and checked for phone numbers. |
| 8 | "Resident offered entry for repair or treatment" and "Repair visit was scheduled, but no one came" | Record page; printable building summary | Dates only. |
| 9 | Patterns: records started each month, by issue type, last 6 months | Building dashboard | Counts under 3 show as `<3`. Merged duplicates are not counted. |
| 10 | City lookups: 311 request status, building permit and inspection records, ward lookup | Help sections; record page next to the 311 number | Plain links. No data is sent. |
| 11 | Changes after a repair request: rent increase notice, non-renewal notice, service reduced, eviction or termination notice | Record page | Neutral labels. No accusation. Not shown in the printable building summary, which can go to an inspector. Retaliation card explains the Illinois one-year presumption. |
| 12 | Fair Notice check (30, 60, or 120 days) | Record page, shown for rent increase and non-renewal notices | Runs in the browser. Length of stay and start date are never sent or saved. |
| 13 | Quick exit | Header on every page | Clears key and session cookies, leaves for a neutral site, and replaces the current history entry. Browser history is not erased. |
| 15 | Printable short guide to Chicago tenant rules | `/rights` | Rules in effect today only. Proposals are never shown. Prints source URLs. |
| 18 | Where to get help: hotlines, legal aid, tenant unions | Builder help panel, record page, `/rights` | Referral information only. Tenant unions note says to talk to legal aid before changing how rent is paid (AGENTS.md §6.3). |

## Not built

| # | Suggestion | Reason |
| --- | --- | --- |
| 5 | Separate key for an organizing committee | The ledger holds no committee-only content, so a new key tier adds risk without a clear use. Needs an access design decision. |
| 6 | Member roster or one-on-one tracking | A leaked roster is a retaliation list. Conflicts with AGENTS.md §3. |
| 14 | Chinese notices | Needs reviewed translations (AGENTS.md §14). Ready to add once a community reviewer is available. |
| 17 | Show all next steps at once | AGENTS.md §6.1 requires unlockable steps. |
| 19 | Same-owner view across buildings | Needs a key that covers several buildings. Needs an access design decision. |
| 20 | Publicly naming the landlord | Conflicts with AGENTS.md §1.2 and §7 (no naming, no public shaming, no landlord directory). |

## Sources

- [Block Club Chicago: Lunt Avenue tenants unionize (2023-11-30)](https://blockclubchicago.org/2023/11/30/rogers-park-tenants-unionize-to-push-landlord-to-fix-unlivable-pest-infestations-mold-and-leaks/)
- [South Side Weekly: Hilliard Towers tenants](https://southsideweekly.com/for-hilliard-towers-tenants-numbers-is-power/)
- [South Side Weekly: "Just Get to Know Your Neighbors"](https://southsideweekly.com/just-get-to-know-your-neighbors/)
- [City of Chicago: Fair Notice Ordinance](https://www.chicago.gov/city/en/depts/doh/provdrs/renters/svcs/know-your-rights--fair-notice-ordinance.html)
