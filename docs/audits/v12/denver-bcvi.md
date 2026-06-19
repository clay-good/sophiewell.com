# v12 audit - denver-bcvi

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Burlew CC, Biffl WL, Moore EE, et al. J Trauma Acute Care Surg. 2012;72(2):330-337.

`lib/traumaclass-v109.js denverBcvi()` flags CT-angiography screening for blunt
cerebrovascular injury if ANY of the six signs/symptoms or six high-energy-
mechanism risk factors is present, naming the criteria that flagged. Class B
(documentation-only docs/citation-staleness.md row; the citation does not match
the issuer pattern).

## Boundary worked examples added
- no criterion -> screening not indicated.
- band flip: one sign/symptom flips no-screen -> CTA.
- a risk factor alone also flags screening.
- multiple positives are counted and named (plural).

## Cross-implementation differential
- Reference: the six signs/symptoms (arterial hemorrhage, bruit < 50, expanding
  hematoma, focal deficit, deficit incongruous with head CT, stroke) and six risk
  factors (LeFort II/III, cervical-spine fracture, basilar/carotid-canal, DAI +
  GCS < 6, near-hanging, seatbelt sign) cross-verified against the EAST/SCC best-
  practice guideline (PMC6206718) and the Burlew 2012 table. The 2012 set is
  distinguished from the later "augmented" expansions. Match. PASS.

## Edge-input handling notes
- a screening aid, not an imaging order; any-positive logic is bounded.

## A11y / keyboard notes
- Labeled checkboxes grouped under signs/symptoms and risk-factor headings;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
