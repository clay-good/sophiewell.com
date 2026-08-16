# spec-v740.md — Walch Classification of Glenoid Morphology

> Status: **SHIPPED (2026-08-16).** Builds the `walch-glenoid` tile. Catalog **1563 → 1564**, group G.

## Why

The shoulder-classification cluster had the Ideberg glenoid-*fracture* classification but not the
**Walch classification of glenoid morphology** in primary glenohumeral osteoarthritis — a distinct,
widely-used pre-arthroplasty planning classification. A published radiographic/CT method (no
copyright concern).

## What it does

A decision-logic classifier returning a type code **A1, A2, B1, B2, B3, C, or D** from four inputs
(humeral-head position, glenoid retroversion in degrees, concavity, central-erosion severity) plus a
dysplastic flag:

- **A** — centered head: **A1** minor central erosion, **A2** major.
- **B** — posterior subluxation: **B1** no biconcavity/major wear, **B2** biconcave, **B3**
  monoconcave with ≥ 15° retroversion (or ≥ 70% posterior subluxation).
- **C** — dysplastic glenoid retroversion **> 25°** (congenital, not erosion-caused).
- **D** — anterior subluxation or glenoid anteversion (retroversion < 0°).

Subluxation direction is the top-level split (centered → A, posterior → B, anterior → D); D
(anteversion) is checked first so it wins over a dysplastic flag.

## Posture (spec-v97)

A radiographic classification read from CT and imaging; surgical planning stays with the treating
surgeon. Decision support, not a verdict.

## Files

- `lib/walch-glenoid-v740.js` — `walchGlenoid()`, `WALCH_NOTE`.
- `views/group-v740.js` (RV740) — three enum selects + retroversion number + dysplastic checkbox;
  a11y-checked, no innerHTML.
- `mcp/adapters/walch-glenoid-v740.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example (posterior + biconcave + 23° → B2), types + subtypes, related
  (ideberg-glenoid, mason-radial-head).
- `test/unit/walch-glenoid.test.js` — 7 tests (A1/A2, B2, the B3-vs-B1 retroversion gate, C, D and
  its precedence over C, validation).
- `docs/spec-v740.md` (this file).

## Sourcing (spec-v97)

Walch G, Badet R, Boulahia A, Khoury A. Morphologic study of the glenoid in primary glenohumeral
osteoarthritis. *J Arthroplasty.* 1999;14(6):756-760 (types A1, A2, B1, B2, C). Modified by Bercik
MJ, Kruse K, Yalizis M, Gauci MO, Chaoui J, Walch G. *J Shoulder Elbow Surg.* 2016;25(10):1601-1606
(adds B3 and D, refines A2). The top-level subluxation split, the B1/B2/B3 concavity-and-retroversion
distinctions (B3 = monoconcave with ≥ 15° retroversion or ≥ 70% subluxation), the C > 25° dysplastic
retroversion criterion, and the D anteversion/anterior-subluxation addition were source-verified across
the two primary papers and the Evolution-of-the-Walch-Classification review.
