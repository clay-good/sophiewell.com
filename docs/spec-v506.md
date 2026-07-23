# spec-v506.md — Jerger tympanogram type tile

> Status: **SHIPPED (2026-07-23).** Builds the `jerger-tympanogram` tile — the Jerger classification of
> tympanogram shapes, types A / As / Ad / B / C. Catalog **1356 → 1357**, group G.

## Why

Tympanometry was uncovered **entirely**: `tympanogram`, `tympanometry`, `audiogram`, `middle ear`, and
`jerger` were all zero-hit. The catalog's only otology tile is `sade-retraction` (tympanic-membrane
retraction), a different measurement. Tympanometry is a routine office and school-screening test in both
pediatrics and ENT, and its result is reported as a Jerger type.

## What it does

The clinician or audiologist reads the type off the tracing; the tile reports the type and its shape
description.

- `lib/jerger-tympanogram-v506.js` — pure type → description, the five Jerger types, by peak pressure and peak
  compliance. **A:** normal peak, normal pressure and compliance. **As:** shallow peak, reduced compliance (a
  stiff system). **Ad:** deep peak, abnormally high compliance. **B:** flat, no identifiable peak. **C:** peak
  at significantly negative pressure. Input is case-insensitive (`as`, `AD`, `c` all resolve).
- `views/group-v506.js` (RV506) — one select (dom `jerger-type`), real `<label for>`.
- `lib/meta.js` — Jerger 1970 (Arch Otolaryngol) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v226 → v227); corpus → 1357.

**HIGH-STAKES:** it reports the type read from the tracing, never a diagnosis, a hearing-loss severity, or a
decision about tube placement ([spec-v11](spec-v11.md) §5.3). The classic cause associations are stated
**descriptively** — a type never establishes a cause on its own. Type B in particular is deliberately written
to name *both* readings (effusion at a normal ear-canal volume; perforation or a patent tube at a large volume)
rather than asserting one, and a unit test pins that both appear.

## Sourcing (spec-v97)

- **Citation:** Jerger J. Clinical experience with impedance audiometry. *Arch Otolaryngol.*
  1970;92(4):311-324. The citation URL is a PubMed term search.
- Cross-verified against audiology references reproducing the same A / As / Ad / B / C shapes with the same
  peak-pressure and compliance descriptions.

## Verification

Lint (all catalog-truth surfaces at 1357), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type B renders the flat-tracing description with both canal-volume readings, and As/Ad flip on
compliance; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type read; it does not measure static admittance, ear-canal volume, or gradient, and it
does not grade hearing loss. Numeric tympanometric values and the audiogram itself are separate builds. The MCP
adapter + golden-probe promotion follow in the next wave (331).
