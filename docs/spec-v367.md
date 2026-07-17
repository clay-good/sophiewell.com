# spec-v367.md — Penetration-Aspiration Scale (swallow study) tile

> Status: **SHIPPED (2026-07-16).** Builds the `pas-swallow` tile — the Penetration-Aspiration Scale
> (PAS, scores 1–8). Catalog **1218 → 1219**, group G.

## Why

The catalog carries dysphagia *screens* (GUSS, EAT-10) but not the PAS — the standard 8-point ordinal
scale for the depth of airway invasion during a swallow study (videofluoroscopy / FEES), used by
speech-language pathologists. `penetration aspiration scale` / `rosenbek scale` / `pas score` routed to
nothing.

## What it does

The clinician picks the worst airway-invasion score seen on the swallow study; the tile reports the
score, its description, the penetration/aspiration category, and flags aspiration (score 6–8).

- `lib/pas-swallow-v367.js` — pure score → description. **1:** no airway invasion. **2–5:** penetration
  (above / at the vocal folds). **6–8:** aspiration (below the vocal folds) — flagged. **8:** silent
  aspiration (no effort to eject). Accepts 1–8 (string or number).
- `views/group-v367.js` (RV367) — one select (dom `pas-score`), real `<label for>`.
- `lib/meta.js` — Rosenbek et al. 1996 (Dysphagia) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v88 → v89); corpus → 1219.

**HIGH-STAKES:** it reports the PAS score the clinician has determined from the swallow study, never a
diagnosis, a diet/management decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). A single worst-score
per bolus does not capture the whole study; the management decision stays with the speech-language
pathologist and team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Rosenbek JC, Robbins JA, Roecker EB, Coyle JL, Wood JL. A penetration-aspiration scale.
  *Dysphagia.* 1996;11(2):93-98 (the original 8-point scale).
- Cross-verified against speech-language-pathology references reproducing the same 1–8 airway-invasion
  definitions and the penetration (2–5) / aspiration (6–8) grouping.

## Verification

Lint (all catalog-truth surfaces at 1219), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: PAS 6 renders the flagged "below the vocal folds … aspiration" description, PAS 1 flips to the
"does not enter the airway" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the score the clinician selects; it does not read the study, aggregate across boluses, or
recommend a diet. The MCP adapter + golden-probe promotion follow in a separate wave.
