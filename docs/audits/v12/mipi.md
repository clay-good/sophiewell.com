# v12 audit - mipi

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Hoster E, Dreyling M, Klapper W, et al. A new prognostic index (MIPI) for patients with advanced-stage mantle cell lymphoma. Blood. 2008;111(2):558-565 (cross-verified against the Hoster 2008 erratum, MDApp, and Omnicalculator; ≥ 2 sources, spec-v97).

`lib/suites-v155.js mipi()` consumes age, ECOG status, serum LDH, the LDH upper
limit of normal, and the absolute WBC count and computes the continuous biologic
prognostic index with low / intermediate / high bands. Group G, Class A.

## Source-governance notes
- Index = 0.03535·age(yr) + 0.6978·(1 if ECOG 2–4, else 0) + 1.367·log₁₀(LDH/ULN)
  + 0.9393·log₁₀(WBC per µL). All four coefficients confirmed verbatim.
- **WBC is the ABSOLUTE count in cells per microliter inside log₁₀.** The Hoster
  erratum explicitly warns that inserting WBC as counts per 10⁻⁹ L (thousands/µL)
  gives the wrong result — for 8000/µL use log₁₀(8000)=3.903, not log₁₀(8). The
  renderer labels the field "per µL, absolute" and the unit test locks the
  contract (8 → low vs 8000 → intermediate on the otherwise-identical case).
- Bands: low < 5.7, intermediate 5.7 to < 6.2, high ≥ 6.2 — banded on the exact
  index, not the rounded display score.
- The "simplified MIPI" point table (age/ECOG/LDH/WBC scored 0–3 each) is a
  distinct variant; the shipped compute is the continuous biologic index per the
  spec-v155 §2.2 / §7 directive (no simplified-MIPI headline).

## Boundary worked examples added
- tile example age 65 / ECOG 0–1 / LDH 300 / ULN 250 / WBC 8000 → 6.07
  intermediate; the low/intermediate 5.7 boundary (WBC 6400 → 5.696 low vs 6500 →
  5.702 intermediate); a high-band case; the WBC-units contract; the log-domain
  guard (LDH/ULN/WBC/age must be > 0); missing-field fallback.

## Edge-input handling notes
- log₁₀ domain is the chief NaN risk; LDH, ULN, WBC, and age must each be > 0 or
  the tile returns a surfaced valid:false rather than computing log(0)/log(−).
  Each input finite-checked; covered by the spec-v59 fuzz harness, zero
  non-finite leaks.

## A11y / keyboard notes
- One labelled select (ECOG) and four labelled number inputs; output aria-live.
  320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
