# spec-v1673 — Independent review of the state-practice tools (v1389 to v1399)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1672](spec-v1672.md).

A reviewer ran the 56 California, New York, New Jersey and Texas libs in `lib/*-v1389.js` to `lib/*-v1399.js` on edge
inputs. Fourteen defects are fixed. (There are no `lib/*-v1300.js` to `-v1388.js` files: those specs corrected the
prior-authorization ledger.)

| Tool | Input | Was | Now |
|---|---|---|---|
| `nj-civil-commitment-clock` | voluntary discharge request Saturday 1:00 am | "discharged by Monday 1:00 am", about 23 hours early | the end of Monday, the next working day: "whichever is longer" now compares the working day's end with the 48 hours |
| `calosha-wildfire-smoke` | 400 ug/m3 | AQI 649 by EPA's 2024 breakpoints: respirators required | AQI 420 by 5141.1 Appendix A(d), which the rule says the employer "shall use" (read on dir.ca.gov October 20, 2026): voluntary N95s |
| `minor-self-consent` | TX 17 or CA 16, general care, grounds blank | "A parent or guardian consents" | names the unassessed grounds (active duty, living apart with own finances; 6922) that could let the minor consent |
| `lib/state-calendar.js` `parseDate` | "0020-01-01" | year 20, later 1920 through `Date.UTC` (a 104 eligibility "reached on 1923") | not a date: years outside 1900 to 2100 are refused for every state tool |
| `ca-np-103-104-tracker` | 12,000 hours, years since blank | "About 0 of the 3 years" | asks for the years since the transition ended: hours give no date |
| `nursing-home-staffing-check` | 3.496 hours per resident; aide hours above total | "3.5, under 3.5"; "Meets" with aides at 30 against 3.5 | 3.496; refused |
| `reportable-condition-urgency` | 24-hour report across the November 1 clock change | 25 h on the clock | 24 real hours |
| `calosha-outdoor-heat` | prior average 85.04F | "85F, so 95F is less than 10F above it" | 85.04F |
| `ca-apot-calculator` | 1,799 of 1,999 within 30 minutes | "(90%)" beside "does not meet" | 89.995% |
| `tx-sa-forensic-exam-window` | referral blank | "with no referral" | "no referral entered" |
| `nurse-license-training-requirements` | every course current | flagged for ever: a completed course was "due" | the next course is scheduled, not due |
| `ca-eoloa-timeline`, `ny-maid-timeline` | a second request before the first; a prescription before the steps | negative hours; a fill time before the steps | refused (NY confirmations may come in either order) |
| `tx-workplace-violence-plan-audit` | a facility with no security staff or no direct-care physician | "Missing: 1" | a "not required here" choice for the two conditional members |

## Proof

`test/unit/review-fixes-v1389-v1399.test.js`.
