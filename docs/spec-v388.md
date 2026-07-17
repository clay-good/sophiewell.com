# spec-v388.md — Brodsky tonsil grading scale tile

> Status: **SHIPPED (2026-07-17).** Builds the `brodsky-tonsil` tile — the Brodsky grading scale for
> palatine tonsil size (grades 0-4). Catalog **1239 → 1240**, group G.

## Why

The catalog carries the airway / sleep tiles (Mallampati was removed; STOP-BANG, Epworth, Cormack-Lehane
remain) but not the Brodsky scale — the most validated grading of tonsillar hypertrophy, central to the
assessment of pediatric sleep-disordered breathing and the need for tonsillectomy. `brodsky` / `tonsil
size grade` routed to nothing. Found on a fresh ENT/neurosurgery classification sweep (re-confirming that
"catalog saturated" is always premature at 1240 tiles).

## What it does

The clinician picks the grade; the tile reports the grade, its oropharyngeal-width description, and
whether it is an obstructive (grade 3-4) size.

- `lib/brodsky-tonsil-v388.js` — pure grade → description. **0:** within the tonsillar fossa (no
  obstruction). **1:** <25% of the oropharyngeal width. **2:** 25-50%. **3:** 50-75% — flagged
  (obstructive). **4:** >75% ("kissing tonsils") — flagged (obstructive). Accepts 0-4.
- `views/group-v388.js` (RV388) — one select (dom `brodsky-grade`), real `<label for>`.
- `lib/meta.js` — Brodsky 1989 (Pediatr Clin North Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v109 → v110); corpus → 1240.

**HIGH-STAKES:** it reports the Brodsky grade the clinician has determined on exam, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Grades 3-4 are the classically
"obstructive" sizes, but the management decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Brodsky L. Modern assessment of tonsils and adenoids. *Pediatr Clin North Am.*
  1989;36(6):1551-1569 (the 0-4 scale by percentage of the oropharyngeal width).
- Cross-verified against ENT / sleep-medicine references reproducing the same 0 (in the fossa) / 1 (<25%)
  / 2 (25-50%) / 3 (50-75%) / 4 (>75%) grading and the non-obstructive (0-2) vs obstructive (3-4) split.

## Verification

Lint (all catalog-truth surfaces at 1240), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 3 renders the flagged "50-75% / obstructive" description, grade 0 flips to "within the
tonsillar fossa", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not grade adenoids, assess the airway, or
recommend tonsillectomy. The MCP adapter + golden-probe promotion follow in a separate wave.
