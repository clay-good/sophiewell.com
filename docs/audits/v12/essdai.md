# v12 audit - essdai

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Seror R, Ravaud P, Bowman SJ, et al. EULAR Sjögren's syndrome disease activity index: development of a consensus systemic disease activity index for primary Sjögren's syndrome. Ann Rheum Dis. 2010;69(6):1103-1109; domain weights from Seror R, et al. RMD Open. 2015;1:e000022 (ESSDAI user guide), cross-checked against the PMC4613159 reproduction; ≥ 2 sources, spec-v97.

`lib/rheum-ob-v156.js essdai()` computes the EULAR Sjögren's Syndrome Disease
Activity Index — twelve weighted systemic domains. Group G, Class A.

## Source-governance notes
- The weight table is the correctness-critical content and was **re-fetched
  verbatim** from the Seror 2015 user guide and cross-checked against PMC4613159
  (identical tables). Each domain's printed per-level value is already weight ×
  level, so the weighted total is the **direct sum** (theoretical maximum 123).
- Weights: constitutional 3, lymphadenopathy 4, glandular 2, articular 2,
  cutaneous 3, pulmonary 5, renal 5, muscular 6, peripheral nervous system 5,
  central nervous system 5, haematological 2, biological 1.
- STRUCTURAL FACTS that must not be normalized away: **constitutional, glandular,
  and biological have no High level** (they top out at Moderate); **CNS has no Low
  level** (it jumps from None directly to Moderate). The level maps encode this.
- Activity strata: low < 5, moderate 5–13, high ≥ 14.
- **Citation class:** cited to EULAR. EULAR is NOT in the `check-citations`
  ISSUER_PATTERN (CDC|KDIGO|AGS|ACC|AHA|ATS|IDSA|ESC|WHO|AAP|ACOG|SAMHSA|NICE), so
  it does NOT force a `docs/citation-staleness.md` row — the same documentation-only
  treatment as the spec-v147/v148 ACR/EULAR tiles. The spec-v156 §4 claim that
  EULAR trips the pattern is incorrect against the live regex; Class A.

## Boundary worked examples added
- the tile example at the low/moderate 4/5 boundary across two weighted domains
  (articular Moderate +4 + biological Low +1 = 5 → moderate); the exact 4 (low)
  vs 5 (moderate) boundary; the 13 (moderate) vs 18 (high) check; all-blank → a
  valid 0/low (an unselected domain contributes 0, never NaN); an out-of-domain
  level string ignored as no-activity; the published weights and missing-level
  structure asserted intact, theoretical max 123.

## Edge-input handling notes
- An unselected / unknown / out-of-domain activity value contributes 0, never NaN;
  ESSDAI is always valid. Covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- Twelve labelled selects (each offering only the levels its domain defines);
  output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
