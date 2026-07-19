# spec-v435.md — Van Herick angle grade tile

> Status: **SHIPPED (2026-07-19).** Builds the `van-herick` tile — the Van Herick grade of the peripheral
> anterior chamber angle, grades 0/1/2/3/4. Catalog **1286 → 1287**, group G.

## Why

The catalog's ophthalmology tiles (Shaffer gonioscopy angle grade, SUN anterior chamber grades) had no Van
Herick grade — the standard slit-lamp estimate of angle-closure risk. `van herick` / `anterior chamber angle
grade` routed to nothing. This fills that ophthalmology gap and companions the Shaffer grade.

## What it does

The clinician picks the grade; the tile reports the grade and its PACD:CT description.

- `lib/van-herick-v435.js` — pure grade → description, by the ratio of the peripheral anterior chamber depth
  (PACD) to the corneal thickness (CT). **0:** PACD = 0, angle closed. **1:** < 1/4 CT, closure likely. **2:**
  1/4 CT, closure possible. **3:** 1/4 to 1/2 CT, closure unlikely. **4:** at least 1 CT, wide open. Accepts
  0-4.
- `views/group-v435.js` (RV435) — one select (dom `vh-grade`), real `<label for>`.
- `lib/meta.js` — Van Herick 1969 (Am J Ophthalmol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v156 → v157); corpus → 1287.

**HIGH-STAKES:** it reports the grade the clinician has estimated at the slit lamp, never a diagnosis of
angle-closure, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Gonioscopy remains the
reference standard; the management decision stays with the ophthalmology team.

## Sourcing (spec-v97)

- **Citation:** Van Herick W, Shaffer RN, Schwartz A. Estimation of width of angle of anterior chamber.
  Incidence and significance of the narrow angle. *Am J Ophthalmol.* 1969;68(4):626-629.
- Cross-verified against ophthalmology / optometry references reproducing the same closed (0) to wide-open (4)
  PACD:CT grading.

## Verification

Lint (all catalog-truth surfaces at 1287), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "angle closure possible," the other grades flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not perform gonioscopy, examine the eye, or diagnose
angle-closure. The MCP adapter + golden-probe promotion follow in a separate wave.
