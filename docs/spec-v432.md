# spec-v432.md — Baden-Walker prolapse grade tile

> Status: **SHIPPED (2026-07-18).** Builds the `baden-walker` tile — the Baden-Walker halfway system for
> grading pelvic organ prolapse, grades 0/1/2/3/4. Catalog **1283 → 1284**, group G.

## Why

The catalog had no bedside grading for pelvic organ prolapse — the standard Baden-Walker halfway system.
`baden walker` / `prolapse grade` routed to nothing. This fills that gynecology / urogynecology gap.

## What it does

The clinician picks the grade; the tile reports the grade and its examination description.

- `lib/baden-walker-v432.js` — pure grade → description, the halfway system by the leading edge relative to
  the hymen at maximum strain. **0:** normal position. **1:** halfway to the hymen. **2:** to the hymen. **3:**
  halfway past the hymen. **4:** maximum descent (complete prolapse / procidentia). Accepts 0-4.
- `views/group-v432.js` (RV432) — one select (dom `bw-grade`), real `<label for>`.
- `lib/meta.js` — Baden & Walker 1972 (Clin Obstet Gynecol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v153 → v154); corpus → 1284.

**HIGH-STAKES:** it reports the grade the clinician has determined, never a diagnosis, a treatment decision, or
a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the gynecology / urogynecology
team.

## Sourcing (spec-v97)

- **Citation:** Baden WF, Walker TA. Physical diagnosis in the evaluation of vaginal relaxation. *Clin Obstet
  Gynecol.* 1972;15(4):1055-1069.
- Cross-verified against gynecology / urogynecology references reproducing the same normal (0) /
  halfway-to-hymen (1) / at-hymen (2) / halfway-past-hymen (3) / maximum-descent (4) grading.

## Verification

Lint (all catalog-truth surfaces at 1284), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "descent to the hymen," the other grades flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the patient, apply the POP-Q measurement
system, or recommend management. The MCP adapter + golden-probe promotion follow in a separate wave.
