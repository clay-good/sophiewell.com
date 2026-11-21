# spec-v1767 — A 350 kg patient in adult dosing tools

> Status: **SHIPPED (2026-11-21)**: 4 tools widened, 25 kept. The catalog stays 2,387.

`lib/bounds.js` allows a weight up to 500 kg, and hospitals do treat patients of 300 to 450 kg. Twenty-nine adult
tools refused 350 kg. Widening a weight cap is safe only where the dose cannot grow past the label's maximum, so each
was read at 350, 450 and 500 kg:

| Widened to 500 kg | What holds the dose |
|---|---|
| `ltbi-regimen-dosing` (was 250) | CDC maximums: isoniazid 300 mg daily or 900 mg weekly, rifampin 600 mg, rifapentine 900 mg |
| `thrombolytic-dose` (was 300) | alteplase at most 90 mg (stroke) or 100 mg (MI, PE); tenecteplase 25 or 50 mg |
| `neostigmine-reversal-dose` (was 300) | the label's "0.07 mg/kg or 5 mg, whichever is less" |
| `gcsf-timing-check` (was 300) | pegfilgrastim is a flat 6 mg |

**Kept (25):** a per-kilogram dose with no ceiling would print an unbounded number (rapid-sequence drugs, fomepizole,
glucarpidase, rasburicase, dantrolene, ivermectin, dimercaprol, the vancomycin maintenance and guideline lines,
gentamicin and tobramycin on actual weight, NAC above 109 kg, the deferoxamine rate); the equation was derived in far
lighter people (6-minute walk, OST, Widmark, KDRI, Chatelut carboplatin); or the field is an ideal body weight
(minute ventilation, theophylline). Refusing is the safe answer there until a source gives an obesity rule.

Tests: `test/unit/heavy-weight-v1767.test.js` (every widened dose stays at or under its cap; kept tools still refuse).
