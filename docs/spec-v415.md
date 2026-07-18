# spec-v415.md — Geissler classification (carpal ligament injury) tile

> Status: **SHIPPED (2026-07-18).** Builds the `geissler-carpal` tile — the Geissler arthroscopic
> classification of interosseous carpal-ligament injury, grades I/II/III/IV. Catalog **1266 → 1267**,
> group G.

## Why

The catalog just gained the Mayfield radiographic staging of perilunar instability; its arthroscopic
companion — the Geissler grading of interosseous (scapholunate / lunotriquetral) ligament injury — was still
missing. `geissler` / `scapholunate instability grade` routed to nothing. This is the Mayfield ↔ Geissler
carpal-instability companion-gap (radiographic vs arthroscopic).

## What it does

The clinician picks the grade; the tile reports the grade and its arthroscopic-appearance description.

- `lib/geissler-carpal-v415.js` — pure grade → description. **I:** attenuation/hemorrhage seen from the
  radiocarpal joint; midcarpal alignment still congruent. **II:** added midcarpal incongruency/step-off; the
  gap is not yet wide enough to pass a probe. **III:** incongruency seen from both the radiocarpal and
  midcarpal spaces; a probe passes the interval. **IV:** gross instability; a 2.7 mm arthroscope passes (the
  drive-through sign). Accepts I/II/III/IV and 1-4.
- `views/group-v415.js` (RV415) — one select (dom `gc-grade`), real `<label for>`.
- `lib/meta.js` — Geissler 1996 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v136 → v137); corpus → 1267.

**HIGH-STAKES:** it reports the grade the clinician has determined at arthroscopy, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The management decision stays with the
hand / orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Geissler WB, Freeland AE, Savoie FH, McIntyre LW, Whipple TL. Intracarpal soft-tissue
  lesions associated with an intra-articular fracture of the distal end of the radius. *J Bone Joint Surg
  Am.* 1996;78(3):357-365.
- Cross-verified against hand-surgery / radiology references reproducing the same radiocarpal-attenuation
  (I) / midcarpal-incongruency (II) / probe-passes (III) / arthroscope-passes-drive-through (IV) grading.

## Verification

Lint (all catalog-truth surfaces at 1267), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "midcarpal incongruency," the other grades flip to their descriptions; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the arthroscopy, measure the interval, or
recommend pinning vs repair vs reconstruction. The MCP adapter + golden-probe promotion follow in a separate
wave.
