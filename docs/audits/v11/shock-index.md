# v11 audit - MAP / Pulse Pressure / Shock Index (`shock-index`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Allgower M, Burri C. *Shock index.* Dtsch Med Wochenschr. 1967;92(43):1947-1950 (original shock index = HR / SBP; threshold ~0.9 suggesting shock). Modified shock index (mSI) = HR / MAP per Liu YC et al. Am J Emerg Med. 2012;30(8):1668-1671. Pulse pressure = SBP - DBP (standard). MAP per the same physiology formula audited in [[map]].

`lib/clinical-v4.js`: `pulsePressure()`, `shockIndex()`, `modifiedShockIndex()`. `lib/clinical.js map()` reused.

## Boundary examples added
- low (normal): SBP 120, DBP 80, HR 70 -> MAP 93.3; PP 40; SI 70/120 = 0.58; mSI 70/93.3 = 0.75.
- mid (META example, compensated hemorrhage profile): SBP 120, DBP 80, HR 110 -> MAP 93.3; PP 40; SI 0.92; mSI 1.18.
- high (overt shock): SBP 80, DBP 50, HR 130 -> MAP 60; PP 30; SI 1.63; mSI 2.17.

## Cross-implementation differential
- Reference: Allgower 1967 (SI), Liu 2012 (mSI), physiology textbook (MAP/PP) - all hand-computed.
- Test case: META example. Sophie MAP 93.3 / PP 40 / SI 0.92 / mSI 1.18; reference 93.3 / 40 / 0.917 -> 0.92 / 1.179 -> 1.18. Delta 0%. PASS.

## Edge-input handling notes
- `shockIndex()` returns `null` when SBP <= 0 (division guard) — the renderer surfaces this as "(incomplete inputs)" rather than NaN.
- The Allgower 0.9 threshold is a single bedside heuristic; Sophie reports the raw SI alongside MAP and PP rather than banding into severity to avoid implying a fixed clinical action (per spec-v10 §2.3 / spec-v11 §5.3).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled inputs; output region lists four derived values. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
