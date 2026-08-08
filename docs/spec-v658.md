# spec-v658.md — ISGLS bile leak grade

> Status: **SHIPPED (2026-08-07).** Builds the `isgls-bile-leak` tile. Catalog **1488 → 1489**, group G.

## Why

The third International Study Group surgical-complication grade in the cluster, joining the ISGPS pancreatic
fistula grade (`isgps-popf`, v656) and the ISGLS post-hepatectomy liver failure grade (`isgls-phlf`, v657). Bile
leakage is a defining complication of hepatobiliary and pancreatic surgery.

## What it does

A decision-logic classifier.

**Defining gate:** a bile leak is a drain fluid bilirubin concentration **≥ 3× the serum bilirubin
concentration on or after postoperative day 3**, OR the need for radiologic or operative intervention for
biliary collections or bile peritonitis. If the gate is not met, there is no bile leak.

Given the gate, the grade is set by clinical impact (most severe wins):

| Grade | Definition |
| --- | --- |
| C | requires relaparotomy |
| B | requires a change in clinical management (percutaneous drainage, ERCP/stent) but manageable without relaparotomy, OR a Grade A leak persisting > 1 week |
| A | no or little change in clinical management |

The boundary is relaparotomy specifically: radiologic/endoscopic reintervention stays in B; only a return to
the operating room crosses into C.

## Scope (spec-v11 §5.3)

Grades a documented drain-bilirubin result and the postoperative course; read with the surgical team.

## Files

- `lib/isgls-bile-leak-v658.js` — `isglsBileLeak()`, `ISGLS_BILE_NOTE`.
- `views/group-v658.js` (RV658) — a bile-gate checkbox + relaparotomy and management-change checkboxes;
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/isgls-bile-leak-v658.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/isgls-bile-leak.test.js` — 7 tests (gate not met, Grade A, Grade B, most-severe-wins, Grade C
  alone, feature-without-gate, required gate).
- `docs/spec-v658.md` (this file).

## Sourcing (spec-v97)

Koch M, Garden OJ, Padbury R, et al. Bile leakage after hepatobiliary and pancreatic surgery: a definition and
grading of severity by the International Study Group of Liver Surgery. *Surgery.* 2011;149(5):680-688 (PMID
21316725). A source-verification subagent confirmed the gate (drain bilirubin **≥ 3×** serum — inclusive — on/
after POD 3, or need for intervention), the A/B/C definitions including the Grade-A-persisting-beyond-1-week
upgrade to B, and that Grade C is defined specifically by the need for relaparotomy.
