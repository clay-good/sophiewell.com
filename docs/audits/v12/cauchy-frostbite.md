# v12 audit - cauchy-frostbite

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Cauchy E, Chetaille E, Marchand V, Marsigny B. Wilderness Environ Med. 2001;12(4):248-255 (re-fetched; the four-grade table cross-read from the NEJM 2022 Table 1 reproduction and the NATO position paper).

`lib/enviro-v111.js cauchyFrostbite()` maps the day-0 lesion topography, the
day-2 bone-scan uptake, and the day-2 blisters each to a grade level and returns
the most severe (1-4) with the published amputation/sequelae prognosis. Class A.

## Boundary worked examples added
- topography alone: distal phalanx -> grade 2 (soft-tissue amputation).
- band flip: a bone-scan finding (absent carpal-tarsal uptake) upgrades grade 2
  -> grade 4 (limb amputation).
- no lesion -> grade 1, no amputation.
- hemorrhagic blisters on the digit upgrade a distal-phalanx lesion -> grade 3.
- carpal-tarsal topography -> grade 4 (limb amputation).

## Cross-implementation differential
- Reference: the four-grade topography / bone-scan / blister table cross-verified
  against the NEJM 2022 reproduction and the NATO position paper.
- SOURCE-GOVERNANCE: Grade-4 prognosis is "functional sequelae" per the NEJM 2022
  reproduction, NOT the unverified "general/systemic sequelae" paraphrase; that
  wording was deliberately not adopted. Grade-3 topography is the
  intermediate-AND-proximal phalanx (not proximal only). Match. PASS.

## Edge-input handling notes
- a day-0/day-2 prognosis grade carrying the spec-v50 §3 posture note; a missing
  topography returns a complete-the-fields fallback (bone scan and blisters
  default to the no-finding limb).

## A11y / keyboard notes
- Three labeled selects (topography / bone scan / blisters); output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
