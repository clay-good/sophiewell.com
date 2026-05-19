# v11 audit - white-song

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: White PF, Song D. *New criteria for fast-tracking after outpatient anesthesia: a comparison with the modified Aldrete's scoring system.* Anesth Analg. 1999;88(5):1069-1072. Seven domains each scored 0-2: LOC, physical activity, hemodynamic stability, respiratory stability, oxygen saturation, postoperative pain, postoperative emetic symptoms. Sum 0-14. Fast-track-eligible iff score >=12 AND no individual domain scores <1 (the dual-criterion floor in White 1999 prevents a single broken domain from being masked by high scores elsewhere).

Note: spec-v14 §3.3.4 mentions "six domains" in its prose but enumerates seven; the published score in White PF, Song D. Anesth Analg. 1999;88(5):1069-1072 scores seven domains. `lib/scoring-v4.js whiteSong()` implements seven per the source. The audit log surfaces this drift so a future spec-v14 patch can correct the prose.

`whiteSong()` sums the seven 0-2 domain scores after clamping each per-domain value to [0, 2]. The fast-track gate combines the sum cutoff (>=12) with a per-domain floor (every domain >=1); the renderer surfaces both conditions in its band so a clinician sees why borderline cases (e.g., 12/14 with a single 0) fail.

## Boundary examples added
- 14 of 14 (all 2s; tile example) -> fast-track eligible.
- 12 of 14 with all domains >=1 (e.g., five 2s + two 1s) -> fast-track eligible (boundary).
- 12 of 14 with one domain = 0 (e.g., six 2s + one 0) -> NOT fast-track eligible (per-domain floor fails).
- 11 of 14 with all domains >=1 -> NOT fast-track eligible (sum cutoff fails).
- 0 of 14 (all zeros) -> NOT fast-track eligible.
- per-domain clamp: 99 / -1 -> 2 / 0 respectively.

## Cross-implementation differential
- Reference: White 1999 worked through manually.
- Test case: LOC 2, activity 2, hd 2, resp 2, O2 2, pain 2, emesis 0 -> 12 with one domain <1 -> NOT fast-track.
- Sophie result: 12, fast-track-eligible false, band names the per-domain failure.
- Reference: same. PASS.

## Edge-input handling notes
- Per-item clamp to [0, 2] handles slider out-of-range, non-finite, and negative values.
- Band text differentiates the two failure modes (sum <12 vs. per-domain <1) so the user understands which condition failed.

## A11y / keyboard notes
- Seven labeled range inputs (0-2) with live `<output>`; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- spec-v14 §3.3.4 prose says "six domains" but enumerates seven; the published score has seven per White 1999. Flagged for a future spec-v14 patch.

## Status
- PASS-WITH-FIXES
