# v12 audit - das28

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Prevoo MLL, et al. Modified disease activity scores that include twenty-eight-joint counts. Arthritis Rheum. 1995;38(1):44-48 (DAS28-ESR); Wells G, et al. Ann Rheum Dis. 2009;68(6):954-960 (DAS28-CRP); EULAR disease-activity cutoffs.

`lib/rheum-periop-v89.js das28()` computes the DAS28-ESR or DAS28-CRP rheumatoid-arthritis disease-activity score from the 28-joint tender and swollen counts, the inflammatory marker for the selected form, and the patient global health VAS. DAS28-ESR = 0.56·√TJC28 + 0.28·√SJC28 + 0.70·ln(ESR) + 0.014·GH; DAS28-CRP = 0.56·√TJC28 + 0.28·√SJC28 + 0.36·ln(CRP+1) + 0.014·GH + 0.96. The EULAR band (remission < 2.6, low ≤ 3.2, moderate ≤ 5.1, high > 5.1) is applied to the unrounded score. The two forms are not interchangeable; the output labels which was computed.

## Boundary worked examples added
- TJC 8, SJC 4, ESR 30, GH 50 -> DAS28-ESR 5.22, high activity.
- TJC 2, SJC 1, CRP 10, GH 20 -> DAS28-CRP 3.18 (raw 3.175 <= 3.2), low activity.
- TJC 0, SJC 0, ESR 5, GH 0 -> 1.13, remission; CRP form all-zero -> 0.96, remission.
- TJC 5, SJC 3, ESR 15, GH 40 -> 4.19, moderate.

## Cross-implementation differential
- Reference: hand computation. 0.56·√8 + 0.28·√4 + 0.70·ln(30) + 0.014·50 = 1.58392 + 0.56 + 2.38084 + 0.70 = 5.22476 -> 5.22. Sophie matches. PASS.

## Edge-input handling notes
- Joint counts clamp to 0–28 (never negative under the root); ESR must be > 0 for ln(ESR); ln(CRP+1) is defined for CRP ≥ 0. A blank count, marker, or VAS renders the complete-the-fields fallback rather than a NaN. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Five labeled numeric inputs, one labeled select (marker form); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
