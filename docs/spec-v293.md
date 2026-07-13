# spec-v293.md — v14 synonym batch: second cross-domain gap sweep

> Status: **BUILT (2026-07-13).** Follow-on to [spec-v291](spec-v291.md), re-running its
> golden-set sweep methodology over the domains that sweep did not cover. One data file
> (`data/synonyms.json`, v13 → v14) + six golden-set probes. No code, no catalog change.

## Why

The [spec-v291](spec-v291.md) sweep covered electrolytes, tox, renal, heme, OB, acid-base,
and screening. This sweep probed 66 nurse-phrased queries across the remaining major
domains — peds, cardio/hemodynamics, pulm/vent, ID, onc, nutrition, geriatrics,
ortho/trauma, burns, psych, endocrine, neuro, GI/hepatology, anesthesia/periop, palliative,
wounds/lines, dialysis, vascular — and surfaced six queries where the right tile existed but
the query mis-routed (the rest were already correct or genuine catalog gaps, not routing
gaps).

## What shipped

Six synonym fixes (v13 → v14), each vetted to route the tile first and pinned by a new
golden-set probe:

| Query | Now routes to | Previously led |
|---|---|---|
| "post op nausea risk" | apfel | rutgeerts (Crohn's endoscopy score) |
| "pre op cardiac risk" | rcri | score2-op (older-persons CV risk) |
| "cellulitis vs nec fasc" | lrinec | garden-classification |
| "phlebitis scale" / "iv site phlebitis" | vip-extravasation | abbey-pain |
| "c diff severity" | atlas-cdi | cpsss (a stroke scale) |
| "insulin sliding scale" | insulin-correction | ranked 4th (top-3 miss) |

PONV keeps both tiles reachable: the synonym leads with Apfel; Koivuranta stays an accepted
alternate in the probe and still ranks for "postoperative nausea". Preoperative cardiac risk
accepts `gupta-mica` and `goldman-cardiac-risk` as alternates.

## Non-gaps the sweep confirmed

Most probes already routed correctly (westley for croup, scai-shock, berlin-ards,
pbw-ardsnet, duke-endocarditis, tls-cairo-bishop, morse-falls/hendrich-ii, braden,
gustilo-anderson, burch-wartofsky, dka-hhs, west-haven-he, maddrey-lille, asa-ps, lemon,
palliative-prognostic-index, bwat, ktv-urr, abi, and more).

Genuine *catalog* gaps (no tile exists) were noted, not forced into synonyms: FAST dementia
staging (Reisberg — hospice eligibility), chemotherapy emetogenicity risk, benzodiazepine
dose conversion, concussion return-to-play staging, AV-fistula maturation (rule of 6s),
Seddon–Sunderland nerve-injury grading, and cosyntropin-stimulation interpretation. Several
of these live behind spec-v97 sourcing questions; none blocks this batch.

## Verification

Golden set 86 → 92, all top-3; synonym guards green on v14 (79 → 85 entries); unit suite,
`test:mcp`, lint, and build all pass.
