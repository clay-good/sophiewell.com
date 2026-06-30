# v12 audit - mcgeer-criteria

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Stone ND, Ashraf MS, Calder J, et al. Surveillance definitions of infections in long-term care facilities: revisiting the McGeer criteria. Infect Control Hosp Epidemiol. 2012;33(10):965-977. The constitutional (Table 2) and per-site syndrome rules cross-verified against the primary paper AND the Missouri DHSS "Updated McGeer Criteria for Infection Surveillance Tool" (>= 2 independent sources, spec-v97).

`lib/ltcga-v181.js mcgeerCriteria()` is a categorical, site-branched surveillance determination. Group G, Class A.

## Source-governance notes
- Class A: the Stone 2012 citation is a journal reference ("Infect Control Hosp Epidemiol") and names no acronym in check-citations ISSUER_PATTERN (CDC/IDSA/ATS/AHA/… — SHEA is not in the pattern), so no docs/citation-staleness.md row is required. Confirmed at build time per the spec-v92/v94 spelled-out-issuer lesson.
- Shipped syndromes (cross-verified): UTI with/without indwelling catheter, respiratory (common cold/pharyngitis, influenza-like illness, pneumonia, lower-RTI), skin & soft tissue (cellulitis/wound, conjunctivitis), and gastrointestinal (gastroenteritis).
- Deferred (spec-v97 free-reproducibility / spec-v172 §4): the Stone 2012 systemic primary-bloodstream / unexplained-febrile-episode definitions (no 2nd independent field source byte-verified) and the dermatologic sub-syndromes that reduce to "rash + a provider's diagnosis" (scabies, oral candidiasis, fungal, HSV, VZV — physician-diagnosis tautologies). Norovirus / C. difficile LabID definitions are laboratory surveillance, not a bedside findings rule.

## Boundary worked examples added
- UTI-without-catheter MEETS (dysuria + positive voided culture) vs DOES NOT MEET (clinical without culture; culture without clinical; the subB fever-plus-1-localizing and subC 2-of-localizing boundaries).
- Pneumonia all-3-required (CXR + >=1 respiratory + >=1 constitutional) and lower-RTI >=2-respiratory boundary; common-cold 2-of boundary; influenza-like fever-plus->=3 boundary; skin pus-or->=4-signs; conjunctivitis any-1; gastroenteritis diarrhea-or-(stool-pathogen-plus-GI-symptom).

## Edge-input handling notes
- Output is categorical (MEETS / DOES NOT MEET + named satisfied criteria + blocking gap); no numeric score, no numeric leak. No site selected, or a site selected with no finding checked -> valid:false complete-the-fields fallback; an unrecognized present-value never counts as present, so no false "meets" escapes (spec-v59 fuzz pass).
- Posture: surveillance definition for tracking/reporting only - not a diagnosis, not a treatment trigger (spec-v50 §3); authors no order in Sophie's voice (spec-v11 §5.3).
