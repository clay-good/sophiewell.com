# v12 audit - bickerstaff

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Odaka M, Yuki N, Yamada M, et al. Bickerstaff's brainstem encephalitis: clinical features of 62 cases and a subgroup associated with Guillain-Barre syndrome. Brain. 2003;126(Pt 10):2279-2290 (re-fetched; the Brain full text is paywalled, so the criteria sentence was verified against the abstract plus the Practical Neurology 2013 review and the Frontiers / PMC reproductions; the spectrum framework is Wakerley BR, Uncini A, Yuki N. Nat Rev Neurol 2014;10:537-544).

`lib/neuro-v122.js bickerstaff()` is a diagnostic checklist, not a score. The
required core is progressive, relatively symmetric external ophthalmoplegia AND
ataxia (developing within ~4 weeks) PLUS altered consciousness OR hyperreflexia (one
of the two central features suffices). A positive serum anti-GQ1b IgG antibody, a
brainstem MRI lesion, and CSF albuminocytologic dissociation are SUPPORTIVE only --
never required (seronegative cases are recognized). Class A (fixed diagnostic
checklist; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- core met via altered consciousness -> consistent.
- core met via hyperreflexia (the alternative central feature) -> consistent.
- ophthalmoplegia + ataxia without a central feature -> criteria not met.
- supportive features alone (GQ1b / MRI / CSF, no core) -> not consistent.
- supportive features named when the core is met.
- scalar fuzz arg -> valid not-consistent verdict, never throws.

## Cross-implementation differential
- Reference: the Odaka 2003 operational rule (ophthalmoplegia + ataxia by 4 weeks +
  disturbed consciousness OR hyperreflexia) is matched. SOURCE GOVERNANCE: anti-GQ1b
  IgG is supportive, never required -- the tile does NOT gate the verdict on antibody
  positivity (the antibody is positive in ~two-thirds; MRI abnormal in ~one-third).
  There is no consensus validated gold-standard criteria set, so the tile frames the
  determination as a research/classification reading and names the GQ1b spectrum link
  to Miller Fisher syndrome and GBS. The "2012 definite/probable" and newer spectrum
  proposals are deliberately NOT merged into the Odaka 2003 / Wakerley 2014 framing.
  Match. PASS.

## Edge-input handling notes
- Four core booleans (ophthalmoplegia, ataxia, consciousness, hyperreflexia) and
  three supportive booleans; the core short-circuits to not-consistent when any
  required limb is missing. A scalar fuzz arg yields a valid not-consistent verdict,
  never throws.

## A11y / keyboard notes
- Seven labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
