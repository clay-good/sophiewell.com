# spec-v428.md — MRC muscle-power grade tile

> Status: **SHIPPED (2026-07-18).** Builds the `mrc-power` tile — the Medical Research Council (MRC)
> muscle-power grade, grades 0/1/2/3/4/5. Catalog **1279 → 1280**, group G.

## Why

The catalog had the MRC *sum* score (ICU-acquired weakness, 0-60) but not the atomic single-muscle MRC power
grade (0-5) it aggregates — the most common bedside strength grade. `mrc muscle grade` / `muscle power grade`
routed to nothing. This fills that neurology / rehabilitation gap and companions the MRC sum score.

## What it does

The clinician picks the grade; the tile reports the grade and its examination description.

- `lib/mrc-power-v428.js` — pure grade → description, the MRC 0-5 muscle-power scale. **0:** no contraction.
  **1:** a flicker or trace. **2:** active movement with gravity eliminated. **3:** against gravity. **4:**
  against gravity and resistance. **5:** normal power. Accepts 0-5 (grade 4 is sometimes subdivided 4-/4/4+;
  the base grading is reported).
- `views/group-v428.js` (RV428) — one select (dom `mrc-grade`), real `<label for>`.
- `lib/meta.js` — MRC 1976 memorandum / Compston 2010 (Brain) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v149 → v150); corpus → 1280.

**HIGH-STAKES:** it reports the power grade the clinician has elicited, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the clinical decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Medical Research Council. Aids to the Examination of the Peripheral Nervous System.
  Memorandum No. 45. London: HMSO; 1976. Reproduced in Compston A. *Brain.* 2010;133(10):2838-2844.
- Cross-verified against neurology / rehabilitation references reproducing the same no-contraction (0) /
  flicker (1) / gravity-eliminated (2) / against-gravity (3) / against-resistance (4) / normal (5) grading.

## Verification

Lint (all catalog-truth surfaces at 1280), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade 3 renders "active movement against gravity," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects for a single muscle; it does not aggregate across muscle
groups (that is the `mrc-sum-score` tile) or diagnose the cause of weakness. The MCP adapter + golden-probe
promotion follow in a separate wave.
