# spec-v349.md — Fazekas scale (white matter hyperintensities) tile

> Status: **SHIPPED (2026-07-16).** Builds the `fazekas-wmh` tile — the Fazekas scale for white matter
> hyperintensities on brain MRI (PVH + DWMH, each 0–3). Catalog **1200 → 1201**, group G.

## Why

The catalog carries the Marshall CT (traumatic brain injury) classification and many stroke scores but
had no Fazekas rating — the standard visual scale for age-related / small-vessel-disease white matter
change, one of the most frequently reported findings on brain MRI. `fazekas scale` / `white matter
hyperintensity grade` routed to nothing.

## What it does

The radiologist picks the periventricular (PVH) and deep white matter (DWMH) grades, each 0–3; the tile
reports both grades, their descriptions, the combined total (0–6), and a warn flag when either region
reaches grade 2 (confluent burden).

- `lib/fazekas-v349.js` — two grades → descriptions + combined total. **PVH:** 0 absent, 1 caps / thin
  lining, 2 smooth halo, 3 irregular extension into deep white matter. **DWMH:** 0 absent, 1 punctate
  foci, 2 beginning confluence, 3 large confluent areas. Guards each grade to an integer 0–3.
- `views/group-v349.js` (RV349) — two selects (dom `fz-pvh`, `fz-dwmh`), real `<label for>`.
- `lib/meta.js` — Fazekas 1987 citation + accessed date + grouped bands. No citation-staleness row (the
  AJR citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v70 → v71); corpus → 1201.

**HIGH-STAKES:** it reports the Fazekas grades the radiologist has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). WMH burden is interpreted in the
clinical context (age, vascular risk, cognition); the grade alone is not a diagnosis of small vessel
disease or dementia, and the interpretation stays with the clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Fazekas F, Chawluk JB, Alavi A, Hurtig HI, Zimmerman RA. MR signal abnormalities at 1.5
  T in Alzheimer's dementia and normal aging. *AJR Am J Roentgenol.* 1987;149(2):351-356 (the scale).
- Cross-verified against neuroradiology references (Radiopaedia / stroke-imaging reviews) reproducing
  the same PVH and DWMH 0–3 definitions (FLAIR is the preferred sequence).

## Verification

Lint (all catalog-truth surfaces at 1201), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (PVH 2 / DWMH 2) renders the "smooth halo + beginning confluence, combined 4 of 6"
warn description, grade 0 / 0 flips to the "absent" normal description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the two grades the radiologist selects; it does not read imaging, segment the white
matter, or convert the burden into a diagnosis or a cognitive prognosis. The MCP adapter + golden-probe
promotion follow in a separate wave.
