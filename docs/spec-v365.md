# spec-v365.md — Prague C&M criteria (Barrett esophagus) tile

> Status: **SHIPPED (2026-07-16).** Builds the `prague-barrett` tile — the Prague C&M criteria for the
> endoscopic grading of Barrett's esophagus. Catalog **1216 → 1217**, group G.

## Why

The catalog has GI-endoscopy tiles (Forrest, Rutgeerts, LA esophagitis, the Tokyo biliary set) but no
Barrett's-extent grading. The Prague C&M criteria are the standardized endoscopic measure of the
circumferential (C) and maximal (M) extent of a Barrett's segment, used in every Barrett's endoscopy
report. `prague criteria` / `prague c m` / `barrett esophagus length` routed to nothing.

## What it does

The endoscopist enters the circumferential (C) and maximal (M) extent in cm above the GEJ; the tile
reports the Prague notation and the traditional short-/long-segment descriptor, and validates that M ≥ C.
A numeric compute.

- `lib/prague-barrett-v365.js` — **C** = circumferential extent, **M** = maximal extent (including the
  longest tongue), both cm above the gastroesophageal junction; **M ≥ C** enforced. Reports `Prague C_
  M_` and the traditional short-segment (M < 3 cm) / long-segment (M ≥ 3 cm) descriptor. Guards
  non-numeric, implausible (0–25 cm), and M < C inputs.
- `views/group-v365.js` (RV365) — two number inputs (dom `pr-c`, `pr-m`), real `<label for>`.
- `lib/meta.js` — Sharma et al. 2006 (Gastroenterology) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v86 → v87); corpus → 1217.

**HIGH-STAKES:** it reports the Prague notation from the extents the endoscopist has measured, never a
diagnosis (Barrett's requires biopsy-confirmed intestinal metaplasia), a dysplasia grade, or a
surveillance-interval order ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
gastroenterologist (surfaced in the tile note). The Prague system is the measurement itself; the older
3 cm short/long-segment split is reported as a secondary, traditional descriptor only.

## Sourcing (spec-v97)

- **Citation:** Sharma P, Dent J, Armstrong D, et al. The development and validation of an endoscopic
  grading system for Barrett's esophagus: the Prague C & M criteria. *Gastroenterology.*
  2006;131(5):1392-1399.
- Cross-verified against GI-endoscopy references reproducing C = circumferential extent, M = maximal
  extent (both cm above the GEJ), with M ≥ C by definition.

## Verification

Lint (all catalog-truth surfaces at 1217), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: C 2 / M 5 renders "Prague C2 M5 … long-segment", entering M < C shows the "M must be at least as
long as C" guard, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile reports the extent notation; it does not perform endoscopy, confirm intestinal metaplasia, grade
dysplasia, or set a surveillance interval. The MCP adapter + golden-probe promotion follow in a separate
wave.
