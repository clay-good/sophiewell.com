# v11 audit - guss

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Trapl M, Enderle P, Nowotny M, Teuschl Y, Matz K, Dachenhausen A, Brainin M. *Dysphagia bedside screening for acute-stroke patients: the Gugging Swallowing Screen.* Stroke. 2007;38(11):2948-2952. Two-stage bedside screen. Stage 1 preliminary (5 binary items: vigilance, voluntary cough/throat-clear, saliva swallow successful, no drooling, no voice change) gates stage 2; total 0-5. Stage 2 direct swallowing at three consistencies (semisolid -> liquid -> solid), each subtest 0-5 (deglutition 0-2 + no involuntary cough 0-1 + no drooling 0-1 + no voice change 0-1); each subtest must score 5 to advance to the next consistency. Total 0-20. Bands per Trapl 2007 Table 3: 20 slight/no, 15-19 slight, 10-14 moderate, 0-9 severe dysphagia.

`lib/scoring-v4.js guss()` validates each binary / 0-2 item, enforces all three gating rules (stage 1 -> stage 2; semisolid -> liquid; liquid -> solid), and returns the gated total, per-stage subtotals, the Trapl 2007 band, a per-band diet recommendation, and a `gated` array naming subtests skipped by the gating rules.

## Boundary examples added

- Perfect (tile example, all items max) -> 20, "slight / no dysphagia", `gated: []`.
- Stage 1 = 4 -> total 4, severe; gated: `semisolid, liquid, solid` (stage 1 < 5 ends the screen).
- Stage 1 = 5, semisolid = 4 -> total 9, severe (lower upper-edge of severe band); gated: `liquid, solid`.
- Stage 1 = 5, semisolid = 5, liquid = 4 -> total 14, moderate (upper edge of moderate band); gated: `solid`.
- Stage 1 = 5, semisolid = 5, liquid = 5, solid = 4 -> total 19, slight (upper edge of slight band); `gated: []`.
- Stage 1 = 5, semisolid = 5, liquid = 0 -> total 10, moderate (lower edge of moderate band); gated: `solid`.
- Stage 1 = 5, semisolid = 5, liquid = 5, solid = 0 -> total 15, slight (lower edge of slight band); `gated: []`.
- All-zero -> total 0, severe, all three subtests gated.

## Cross-implementation differential

- Reference: Trapl 2007 Table 2 (gating rules) and Table 3 (band cutoffs). The 5-to-proceed gate at each step is the defining feature of the GUSS form; the four bands (20, 15-19, 10-14, 0-9) are quoted in the published GUSS implementation guide.
- Sophie result: a stage-1 score of 4 returns `total: 4` with the stage-2 subtests reported as 0 and named in `gated`. PASS against the Trapl 2007 gating rule.
- The 10 / 15 / 20 band-boundary cross-checks pass exactly.

## Edge-input handling notes

- Non-integer, out-of-range (vigilance > 1, swallow > 2, cough > 1), and missing keys throw.
- The function does not auto-fill subtests skipped by gating; those subtests are still validated against their value ranges (the user may have filled them in from a prior attempt) — but their value does not contribute to the total when gated.

## A11y / keyboard notes

- Three section headings (Stage 1, Stage 2 Semisolid, Stage 2 Liquid, Stage 2 Solid) followed by 17 labeled range inputs; all Tab-reachable; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
