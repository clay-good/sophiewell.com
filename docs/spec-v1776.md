# spec-v1776 — Every remaining build gate, re-probed and dated

> Status: **SHIPPED (2026-11-23)**. No tool changed; the catalog stays 2,390.

Eight tools are specified and not built, and `docs/unbuilt-tools.md` quotes each spec's own reason. A reason
is a claim about a URL on a date, so `scripts/probe-build-gates.mjs` re-asks all fourteen rows of
`data/build-gates.json` (the eight, plus the gates on parts of tools that did ship). Today's run:

**No change: every probed gate answers exactly as recorded on November 7.** Four rows have nothing to probe
at all -- a rule FDA has not published, a policy vacated in February 2026 and not yet replaced, a reader
that waits for the 2027 exports it is meant to read, and one tool dropped on FDA's own enforcement notice.

Two rows are now dated with a second route tried, so the next session does not spend the same time:

| Tool | What was tried today, beyond the recorded probe |
|---|---|
| `aminoglycoside-initial-dose` | **Europe PMC**, an index independent of PubMed Central. Still one open restatement of Hull and Sarubbi's elimination constant (PMC7915939) and none of the volume of distribution, so the two-source rule that unblocked [spec-v1772](spec-v1772.md) is still unmet. The one open paper that evaluates the "Hull-Sarubbi table" (PMC4140707) evaluates the DOSING TABLE, not the equations. |
| `ed-throughput-measures` | **The Federal Register's API**, which is open and scriptable. The CY2024 OPPS final rule names both measures in full -- "Median Time from ED Arrival to ED Departure for Discharged ED Patients (OP-18)" and "Left Without Being Seen (OP-22)" -- while declining to add them to the Rural Emergency Hospital program, and no rule since mentions either. A rule that NAMES a measure does not SPECIFY it: the numerator, denominator and exclusions are in the OQR manual. |

A third row was chased the same way and also holds. `westgard-multirule-three-level` wanted two open sources
**defining** 2of3-2s, 3-1s, 6-x and 9-x; the closest, PMC11654237, defines 3-1s exactly ("three consecutive
control results are greater than the +/- 1SD and are on the same side of the mean"), calls 2of3-2s only "a
variant of the 2-2s rule", and never mentions 6-x or 9-x. One partial source is not two full ones.

Every index and route available here was used: PubMed Central, Europe PMC (an independent index of the same
open corpus), the Federal Register's API, and direct fetches of the publishing hosts. The eight are not
waiting on another search.

`probedOn` in `data/build-gates.json` now reads 2026-11-23, and `test/unit/build-gates.test.js` still holds
the rows against the unbuilt index, so a row cannot outlive the tool it gates.

## What each of the eight actually needs

| Tool | Needs |
|---|---|
| `epts-score` | `epts_mapping_table.pdf`, downloaded by hand. hrsa.gov answers 403 to every automated client tried (curl, the build's fetcher, and a third kind today). |
| `ed-throughput-measures` | the Hospital OQR Specifications Manual, downloaded by hand from QualityNet. |
| `aminoglycoside-initial-dose` | Hull and Sarubbi 1976 / Sarubbi and Hull 1978, or a second open source printing both coefficients. |
| `warfarin-maintenance-adjust` | Van Spall 2012 (owner decision of 2026-10-18 keeps this gated). |
| `compound-interstate-share` | an FDA final rule or an updated standard MOU. Neither exists yet. |
| `340b-rebate-model-clock` | the revised 340B rebate model, after the February 2026 vacatur. |
| `patient-pa-record-reader` | real prior-authorization exports, which exist from January 1, 2027. |
| `fluoride-supplement-schedule` | nothing: it is dropped, because FDA's October 2025 enforcement notices conflict with the schedule's 6-months-to-3-years cell. |

Four of the eight are waiting on a document behind a host that refuses scripted clients or a publisher's
paywall; two are waiting on a federal rule to exist; one is waiting on a date; one is closed.
