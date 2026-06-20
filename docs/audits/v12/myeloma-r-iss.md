# v12 audit - myeloma-r-iss

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Palumbo A, Avet-Loiseau H, Oliva S, et al. Revised International Staging System for multiple myeloma: a report from International Myeloma Working Group. J Clin Oncol. 2015;33(26):2863-2869.

`lib/onc-v134.js myelomaRIss()` recomputes the ISS from beta2M + albumin, then returns the R-ISS stage (I-III) using serum LDH and high-risk iFISH. Class B (IMWG working-group definition) - carries a docs/citation-staleness.md row (documentation only; the spelled-out "International Myeloma Working Group" does not match the issuer acronym set, so the row is not gate-forced).

## Source-governance / definition note
- The compute recomputes ISS internally rather than trusting a pre-entered stage, so the R-ISS chain cannot desync (spec-v134 §3).
- Stage I = ISS I AND normal LDH AND no high-risk iFISH (del(17p), t(4;14), t(14;16)); 5-yr OS ~82%.
- Stage III = ISS III AND (high LDH OR high-risk iFISH); 5-yr OS ~40%.
- Stage II = all others; 5-yr OS ~62%.

## Boundary worked examples added
- ISS I with all-normal -> R-ISS I; adding high LDH alone, or high-risk iFISH alone, flips ISS I to R-ISS II; ISS III without a risk feature stays R-ISS II; ISS III + (LDH or iFISH) -> R-ISS III.

## Edge-input handling notes
- Any blank lab or unanswered flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs + two labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
