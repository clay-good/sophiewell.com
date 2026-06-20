# v12 audit - boston-caa

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Charidimou A, Boulouis G, Frosch MP, et al. The Boston criteria version 2.0 for cerebral amyloid angiopathy: a multicentre, retrospective, MRI-neuropathology diagnostic accuracy study. Lancet Neurol. 2022;21(8):714-725 (re-fetched; the Lancet full text returned header-only, so the verbatim category logic was cross-read across two independent authoritative reproductions, which agreed).

`lib/neuro-v119.js bostonCaa()` grades diagnostic certainty: Definite (full
postmortem, severe CAA) / Probable with supporting pathology (biopsy or evacuated-
hematoma specimen showing CAA) / Probable / Possible. The in-vivo categories
require age >= 50, a compatible presentation (spontaneous lobar ICH, transient
focal neurological episodes, or cognitive impairment/dementia), and the absence of
any deep hemorrhagic lesion. v2.0's signal addition is the non-hemorrhagic
white-matter feature (severe centrum-semiovale enlarged perivascular spaces > 20,
or a WMH multispot pattern). Probable = >= 2 strictly lobar hemorrhagic lesions
(lobar ICH, microbleeds, or siderosis foci) OR 1 lobar lesion + 1 white-matter
feature; Possible = 1 lobar lesion OR 1 white-matter feature. Class B (a revisable
consensus diagnostic definition; documentation-only docs/citation-staleness.md row
-- the citation names the journal, not an issuing society, so no ISSUER_PATTERN
trip).

## Boundary worked examples added
- full postmortem -> Definite CAA (pathology outranks MRI).
- biopsy / evacuated-hematoma specimen -> Probable CAA with supporting pathology.
- two lobar hemorrhagic lesions in vivo -> Probable CAA.
- one lobar lesion plus a white-matter feature -> Probable CAA.
- one lobar lesion alone -> Possible CAA (the probable-vs-possible band-flip).
- a white-matter feature alone -> Possible CAA (v2.0 non-hemorrhagic path).
- a deep hemorrhagic lesion excludes the lobar-restricted categories.
- age under 50 or missing presentation -> not classifiable in vivo.
- no qualifying lesion and no white-matter feature -> Criteria not met.
- scalar fuzz arg -> valid result, never throws.

## Cross-implementation differential
- Reference: the four-category logic is verbatim-confirmed across two independent
  reproductions of the Lancet Neurology source. The deep-hemorrhagic-lesion
  exclusion and the two white-matter features (CSO-PVS > 20, WMH-multispot) are
  the v2.0 differentiators from v1.5; both reproductions agree on the >2 lobar OR
  (1 lobar + 1 WM) probable rule and the 1 lobar OR 1 WM possible rule. The tile
  reports "Criteria not met" rather than inventing a category when a deep lesion,
  a missing age/presentation, or no qualifying marker is present. Match. PASS.

## Edge-input handling notes
- Pathology paths (postmortem / specimen) take precedence over the in-vivo MRI
  categories. The lobar-lesion count is rounded and clamped to 0-2 (>= 2). No
  arithmetic that can overflow; a scalar / non-object fuzz arg returns a valid
  string category, never throws.

## A11y / keyboard notes
- Two labeled selects and four labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
