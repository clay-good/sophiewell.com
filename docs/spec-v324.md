# spec-v324.md — Wexner (Cleveland Clinic) fecal incontinence score tile

> Status: **SHIPPED (2026-07-15).** Builds the `wexner` tile — the Wexner / Cleveland Clinic fecal
> incontinence severity score (0–20). Catalog **1175 → 1176**, group G.

## Why

The catalog had no fecal-incontinence severity score ("wexner" had zero corpus hits; the only "fecal
incontinence" mentions were in the unrelated FAST dementia staging). The Wexner score is the most widely
used fecal-incontinence severity instrument. `wexner` / `fecal incontinence score` routed to nothing.

## What it does

The clinician (or patient) sets the frequency of each of the five items; the tile sums them into the 0–20
score.

- `lib/wexner-v324.js` — pure inputs → total. Five items (incontinence to solid stool, liquid stool, gas;
  wears a pad; lifestyle alteration), each on a 0–4 frequency scale (0 never; 1 rarely, < 1/month; 2
  sometimes, ≥ 1/month & < 1/week; 3 usually, ≥ 1/week & < 1/day; 4 always, ≥ 1/day). Total 0 (perfect
  continence) to 20 (complete incontinence). A total ≥ 9 is flagged as the commonly cited (not fixed)
  threshold for clinically significant incontinence.
- `views/group-v324.js` (RV324) — five selects, real `<label for>`.
- `lib/meta.js` — Jorge & Wexner 1993 citation + accessed date + bands. No citation-staleness row (the
  Dis Colon Rectum citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v45 → v46); corpus → 1176.

**HIGH-STAKES:** it reports the cited severity score from the frequencies entered, never a diagnosis or a
treatment order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

- **Citation:** Jorge JMN, Wexner SD. Etiology and management of fecal incontinence. *Dis Colon Rectum.*
  1993;36(1):77-97 (the original Cleveland Clinic Incontinence Score). Cross-verified against reproductions
  (ScienceDirect, Pathway.md) of the same five items and the 0 (never) to 4 (daily) frequency scale.
- The five items, the 0–4 frequency anchors, and the 0–20 total are as originally published; there is no
  single official severity cut-point, so the ≥ 9 threshold is presented as "commonly cited," not fixed.

## Verification

Lint (all catalog-truth surfaces at 1176), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (0, 2, 3, 1, 1) renders "score 7 of 20," and the tile does not scroll horizontally at
320px.

## Out of scope

The tile sums the frequencies entered; it does not diagnose incontinence, assign a management plan, or
compute other instruments (St. Mark's/Vaizey, FISI). The MCP adapter + golden-probe promotion follow in a
separate wave.
