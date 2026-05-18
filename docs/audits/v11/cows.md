# v11 audit - COWS (opioid withdrawal) (`cows`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wesson DR, Ling W. *The Clinical Opiate Withdrawal Scale (COWS).* J Psychoactive Drugs. 2003;35(2):253-259. Eleven items with mixed point ranges; total 0-48 per the canonical SAMHSA-distributed scoring sheet (the original Wesson/Ling reference allows up to 47 depending on item-range interpretation; the SAMHSA reproduction is the de facto standard). Severity bands: 5-12 mild; 13-24 moderate; 25-36 moderately severe; >36 severe.

`lib/scoring-v4.js cows()` implements verbatim:
- Eleven items: resting pulse, sweating, restlessness, pupil size, joint aches, runny nose/tearing, GI upset, tremor, yawning, anxiety/irritability, gooseflesh skin. Each item's pre-graded value is summed.
- Severity bands match Wesson 2003 / SAMHSA:
  - 0-4: No active withdrawal.
  - 5-12: Mild withdrawal.
  - 13-24: Moderate withdrawal.
  - 25-36: Moderately severe withdrawal.
  - 37-99: Severe withdrawal.

## Boundary examples added
- low: all 0 -> 0; "No active withdrawal".
- mid (META example): 1+2+1+1+2+2+2+1+1+2+0 = 15; "Moderate withdrawal".
- boundary 5 (mild cutoff): 5 -> "Mild withdrawal".
- boundary 13 (moderate cutoff): 13 -> "Moderate withdrawal".
- boundary 25 (moderately severe cutoff): 25 -> "Moderately severe withdrawal".
- boundary 37 (severe cutoff): 37 -> "Severe withdrawal".
- high (realistic max): per-item maxima sum 4+4+5+5+4+4+5+4+4+4+5 = 48 -> "Severe withdrawal" (above the 37 cutoff).

## Cross-implementation differential
- Reference implementation: Wesson 2003 / SAMHSA TIP 63 COWS scoring sheet.
- Test case: META example.
- Sophie result: 15, "Moderate withdrawal".
- Reference result: 15, moderate (13-24 per SAMHSA).
- Delta: 0%. PASS.

## Edge-input handling notes
- Per-item values are *pre-graded* by the caller (consistent with how COWS is used at the bedside: clinician selects the pre-defined option that matches the observation, e.g. "joint aches: mild diffuse discomfort = 1"). Sophie's tile uses number inputs that accept the pre-graded numeric value; per-item options text would be more user-friendly but is intentionally minimal here to match the bedside scoring-sheet workflow.
- `n(x) = Math.max(0, Number(x) || 0)` clamps negatives to 0 (a typo of "-1" becomes 0) but does not cap the per-item maximum on the high side. A future enhancement could enforce per-item max-value clamping, but it is not a scoring defect: a clinician who enters "9" for a 0-5 item produces a wrong number, which is a data-entry error, not a renderer error.
- The band-label copy paraphrases Wesson 2003 / SAMHSA; no Sophie-authored treatment guidance is added (consistent with spec-v11 §5.3).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Eleven labelled number inputs. Tab-reachable in source order. Output region announces total and band. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
