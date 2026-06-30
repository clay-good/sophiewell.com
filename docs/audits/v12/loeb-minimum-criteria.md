# v12 audit - loeb-minimum-criteria

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Loeb M, Bentley DW, Bradley S, et al. Development of minimum criteria for the initiation of antibiotics in residents of long-term-care facilities: results of a consensus conference. Infect Control Hosp Epidemiol. 2001;22(2):120-124. The 5-site minimum-criteria set cross-verified byte-for-byte against the Minnesota DOH card AND the Missouri DHSS quick-reference chart (>= 2 independent sources, spec-v97).

`lib/ltcga-v181.js loebMinimumCriteria()` is a categorical, site-branched minimum-criteria determination. Group G, Class A.

## Source-governance notes
- Class A: the Loeb 2001 citation is a journal reference and names no ISSUER_PATTERN acronym; no docs/citation-staleness.md row required.
- Sites: UTI without indwelling catheter, UTI with indwelling catheter, lower respiratory tract (5 paths), skin & soft tissue, and fever with an unknown focus. The "Fever" threshold (> 37.9 C / 100 F or >= 1.5 C / 2.4 F above baseline) is the clinician-applied criterion, matching both field sources.

## Boundary worked examples added
- UTI-without-catheter: the acute-dysuria sufficient path is MET; fever alone NOT MET; fever + 1 localizing flips to MET.
- UTI-with-catheter any-1-of-4; respiratory all 5 paths (temp >102 + cough/RR; fever + cough + one of pulse/RR/rigors/delirium; afebrile-COPD; afebrile-non-COPD + RR/delirium; new-infiltrate); skin purulent-or->=2-signs; fever-unknown fever + (delirium or rigors).

## Edge-input handling notes
- Output is categorical (MET / NOT MET + named satisfied criteria + blocking gap); no numeric score, no numeric leak. No site, or a site with no finding checked -> valid:false fallback; no false "met" from incomplete input (spec-v59 fuzz pass).
- Posture: stewardship decision support for initiation only - it neither orders nor withholds antibiotics and names no agent, dose, route, or duration; the prescriber and local protocol decide (spec-v50 §3, spec-v11 §5.3, spec-v100 §2 clause 5).
