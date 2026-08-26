# spec-v784.md — Griffith algorithm (VT vs SVT)

> Status: **SHIPPED (2026-08-26).** Builds the `griffith-vt` tile. Catalog **1575 → 1576**,
> group G.

## Why

The catalog had `brugada-vt` and `vereckei-avr` — both of which work by **hunting for
features of VT**. Griffith is the third member of that family and the one that runs the
other way: it **assumes VT** and only steps away when the QRS is a textbook bundle branch
block. Having only the two same-direction algorithms left the family lopsided.

## What it does

Pick which bundle branch pattern the QRS resembles, then tick the features present.

| Pattern | SVT with aberrancy requires |
| --- | --- |
| Right bundle (V1 mainly positive) | **both**: rSR′ in V1; RS in V6 with the R taller than the S |
| Left bundle (V1 mainly negative) | **all three**: rS or QS in V1 and V2; delay to the S nadir < 70 ms; an R wave in V6 with no Q wave |

**Anything short of all of them is called VT.** The tile names which criterion was missing,
because "VT" here means "did not meet the block criteria," not "found a VT feature."

**Worked example:** right bundle pattern with rSR′ in V1 but no qualifying V6 complex → **VT
by default**, missing "RS in V6 with R taller than S."

## Posture (spec-v97)

Reported sensitivity for VT is about **94%** and specificity about **40%**. That asymmetry is
the design, not a defect: a VT answer here is a safe default rather than a positive finding,
and right ventricular outflow tract tachycardias are known to be misread as SVT by this rule.
An unstable wide-complex tachycardia is treated as VT and cardioverted **regardless of any
algorithm**; the tile classifies a tracing and orders nothing.

## Files

- `lib/griffith-vt-v784.js` — `griffithVt()`, `GRIFFITH_NOTE`.
- `views/group-v784.js` (RV784) — a pattern select plus the morphology checkboxes for both branches under h2 headings; a11y-checked.
- `mcp/adapters/griffith-vt-v784.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both branch rules, performance, related (brugada-vt, vereckei-avr).
- `test/unit/griffith-vt.test.js` — 7 tests (empty defaults to VT, both right-bundle criteria, one missing names it, all three left-bundle criteria, two of three is still VT, branch independence, invalid pattern).
- `docs/spec-v784.md` (this file).

## Sourcing (spec-v97)

Griffith MJ, Garratt CJ, Mounsey P, Camm AJ. *Lancet.* 1994;343(8894):386-388 (PMID 7905552).
The right-bundle pair, the left-bundle triad including the 70 ms S-nadir threshold, and the
default-to-VT rule were confirmed against two independent descriptions, which stated the
criteria in nearly identical words. The ~94% / ~40% sensitivity and specificity figures come
from the published reappraisal of wide-complex-tachycardia algorithms and are labeled as
reported performance rather than as part of the rule.
