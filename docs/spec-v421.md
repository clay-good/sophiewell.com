# spec-v421.md — SUN anterior chamber cell grade (uveitis) tile

> Status: **SHIPPED (2026-07-18).** Builds the `sun-ac-cell` tile — the SUN (Standardization of Uveitis
> Nomenclature) anterior chamber cell grade, grades 0/0.5+/1+/2+/3+/4+, used to record anterior-chamber
> inflammation in uveitis. Catalog **1272 → 1273**, group G.

## Why

The catalog's ophthalmology tiles (Shaffer gonioscopy angle grade) had no SUN anterior chamber cell grade,
the standard way anterior-chamber inflammation is recorded in uveitis. `SUN anterior chamber cells` /
`anterior chamber cell grade` routed to nothing. This fills that ophthalmology gap.

## What it does

The clinician picks the grade (from the cell count observed at the slit lamp); the tile reports the grade and
its defining cell-count range.

- `lib/sun-ac-cell-v421.js` — pure grade → cell-count range, the SUN anterior chamber cell scale (cells
  counted in a 1 mm by 1 mm slit-lamp beam field). **0:** less than 1 cell. **0.5+:** 1 to 5. **1+:** 6 to
  15. **2+:** 16 to 25. **3+:** 26 to 50. **4+:** more than 50. Accepts the grades plus the bare numbers and
  `trace` (for 0.5+).
- `views/group-v421.js` (RV421) — one select (dom `sun-cell`), real `<label for>`.
- `lib/meta.js` — SUN Working Group 2005 (Am J Ophthalmol) citation + accessed date + grouped bands. No
  citation-staleness row (`SUN` is not in the check-citations issuer pattern).
- 7 worked-example unit tests + fuzz registration; synonym entry (v142 → v143); corpus → 1273.

**HIGH-STAKES:** it reports the grade from the cell count the clinician has observed, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). It grades anterior chamber cells
(inflammatory activity), a separate scale from anterior chamber flare; the uveitis-management decision stays
with the ophthalmology team.

## Sourcing (spec-v97)

- **Citation:** Jabs DA, Nussenblatt RB, Rosenbaum JT; Standardization of Uveitis Nomenclature (SUN) Working
  Group. Standardization of uveitis nomenclature for reporting clinical data. Results of the First
  International Workshop. *Am J Ophthalmol.* 2005;140(3):509-516.
- Cross-verified against ophthalmology / uveitis references reproducing the same <1 (0) / 1-5 (0.5+) / 6-15
  (1+) / 16-25 (2+) / 26-50 (3+) / >50 (4+) cell-count grouping.

## Verification

Lint (all catalog-truth surfaces at 1273), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade 1+ renders "6 to 15 cells," the other grades flip to their ranges; the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects from the observed count; it does not examine the eye, grade
anterior chamber flare (the companion scale), or recommend treatment. The MCP adapter + golden-probe
promotion follow in a separate wave.
