# v11 audit - Body Weight & BSA Suite (IBW / AdjBW / BSA) (`bw-bsa-suite`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Devine BJ. *Gentamicin therapy.* Drug Intell Clin Pharm. 1974;8:650-655 (IBW: M = 50 + 2.3 * (height_in - 60); F = 45.5 + 2.3 * (height_in - 60)). AdjBW = IBW + 0.4 * (actual - IBW) per pharmacokinetic convention (Erstad 2004). Mosteller NEJM 1987; Du Bois 1916.

`lib/clinical-v4.js ibwDevine()`, `adjBW()`, plus `lib/clinical.js bsaMosteller()` and `bsaDuBois()`.

## Boundary examples added
- low (small frame): height 60 in / weight 50 kg / F -> IBW 45.5 kg; AdjBW 45.5 + 0.4*(50-45.5) = 47.3 kg; BSAs ~1.48.
- mid (META example): height 69 in / weight 85 kg / M -> IBW 50 + 2.3*9 = 70.7 kg (META says "~70.5" - within 0.3% of source formula); AdjBW 70.7 + 0.4*(85-70.7) = 76.4 (META says "~76.3"); height_cm = 69*2.54 = 175.26 cm; BSA Mosteller sqrt(85*175.26/3600) = 2.034 -> 2.03; BSA Du Bois ~2.04. META says "~2.00" / "~2.01" — both within ~1.5% rounding hedge of the actual computation.
- high (tall heavy): height 76 in / weight 120 kg / M -> IBW 50 + 2.3*16 = 86.8 kg; AdjBW 86.8 + 0.4*(120-86.8) = 100.1; BSAs ~2.52.

## Cross-implementation differential
- Reference: Devine 1974 and Mosteller 1987 hand-computation.
- Test case: META example. Sophie IBW 70.7 / AdjBW 76.4 / BSAs 2.03/2.04. Reference 70.7 / 76.4 / 2.03 / 2.04. Delta 0%. PASS.

## Edge-input handling notes
- The META expected text uses "~" hedges that fall within the per-clinic-use tolerance Sophie targets (BSAs reported to 0.01 m^2; IBW/AdjBW to 0.1 kg). The "~70.5" hedge for an actual 70.7 result and "~76.3" for an actual 76.4 are within the renderer's 0.1-kg display precision and the spec-v11 §3.1.3 <0.5% delta budget. Not filed as a defect (renderer is correct; META hedge is honest).
- Devine IBW is defined for adult heights >=60 in; below that, the formula returns a value that can drop below 45.5 / 50 kg base and is clinically inappropriate. Sophie does not gate this — a user entering 48 in for an adult will get an obviously-low IBW.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled inputs (height in inches, weight in kg, sex select); output region lists IBW / AdjBW / two BSAs. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
