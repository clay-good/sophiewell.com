# spec-v716.md — DMFT caries index

> Status: **SHIPPED (2026-08-13).** Builds the `dmft-caries` tile. Catalog **1546 → 1547**, group G.

## Why

Second tile in the dentistry vein. The DMFT index is the classic summary measure of lifetime
dental caries experience and a clean deterministic count. Pairs with BEWE (erosive wear).

## What it does

```
DMFT = D (decayed) + M (missing due to caries) + F (filled)   permanent teeth
```

Range 0–32. Population caries-severity levels (by mean DMFT, WHO oral-health methodology):

| Mean DMFT | Level |
| --- | --- |
| 0.0–1.1 | very low |
| 1.2–2.6 | low |
| 2.7–4.4 | moderate |
| 4.5–6.5 | high |
| ≥ 6.6 | very high |

For an individual, DMFT is a count; the level gives population-severity context.

## Posture (spec-v97)

A descriptive caries-experience measure, not a treatment plan; the severity levels are
population context, not an individual diagnosis. It supports rather than replaces the clinical
dental examination.

## Files

- `lib/dmft-caries-v716.js` — `dmftCaries()`, `DMFT_NOTE`.
- `views/group-v716.js` (RV716) — three count inputs (D, M, F); a11y-checked.
- `mcp/adapters/dmft-caries-v716.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + levels, related (bewe). Cross-linked with `bewe`.
- `test/unit/dmft-caries.test.js` — 5 tests (D+M+F, worked example 6, caries-free, severity
  levels, validation incl. sum > 32).
- `docs/spec-v716.md` (this file).

## Sourcing (spec-v97)

Klein H, Palmer CE, Knutson JW. Studies on dental caries. *Public Health Rep.* 1938;53:751-765
(origin of the DMF index). The DMFT = D + M + F definition and the very-low/low/moderate/high/
very-high mean-DMFT severity bands (per the World Health Organization oral-health survey
methodology) were confirmed across a BMC Oral Health survey and a J Int Oral Health review, which
agree. The citation names the DMF-index origin to avoid a guideline-issuer acronym in the
`citation` field.
