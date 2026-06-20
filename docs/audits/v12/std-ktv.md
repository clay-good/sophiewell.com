# v12 audit - std-ktv

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Leypoldt JK, Jaber BL, Zimmerman DL. Hemodial Int. 2003;7(2):138-143 (the FHN fixed-volume standard-Kt/V form, the 10080 minutes-per-week constant, the eKt/V-in-the-denominator variant, and the Tattersall conversion cross-read against the Standardized Kt/V references and KDOQI 2015; the spKt/V 1.4 / 240 min / 3x example -> 2.18 was recomputed and verified).

`lib/renal-v128.js stdKtv()` computes eKt/V = spKt/V x time / (time + 35) (Tattersall,
minutes) then stdKt/V = (10080 x (1 - e^-eKtV) / time) / ((1 - e^-eKtV)/eKtV +
10080/(sessions x time) - 1). Class A (journal+author citation; KDOQI/FHN are not in
ISSUER_PATTERN -- no docs/citation-staleness.md row).

## Boundary worked examples added
- spKt/V 1.4, 240 min, 3/wk -> 2.18/week, eKt/V 1.22 (meets >= 2.1 target).
- spKt/V 1.2, 240 min, 3/wk -> 2.00/week (below target) -- the boundary companion.
- a more frequent schedule (6 vs 3 sessions) raises the weekly standard Kt/V.
- overflow-safe under an extreme spKt/V; missing inputs / scalar -> valid:false.

## Source-governance note
- The canonical FHN form divides the first denominator term by eKt/V (not spKt/V, the
  superseded 2006 variant). The eKt/V conversion uses Tattersall C=35 (arterial/AVF)
  to match the published FHN method; the Daugirdas rate conversion agrees to within
  0.002 of stdKt/V at 4-hour sessions. The 2.1/week weekly target is KDOQI 2015 (the
  recommended target is 2.3 with 2.1 the minimum); the tile flips on 2.1.
- denom is guarded (> 0 and finite) before the division; the result is checked finite.

## Edge-input handling notes
- pos() guards spKt/V, session minutes, and sessions/week; ekt > 0 by construction so
  the (1 - e^-eKtV)/eKtV term never divides by zero. Band classified on the rounded
  weekly value.

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
