# spec-v837 — MASLD and MetALD Criteria (2023 nomenclature)

## What this gives you

Enter the steatosis, the metabolic measurements and the alcohol intake; get which steatotic
liver disease category applies.

The catalog already had `nafld-fibrosis`, `bard-score` and `hepatic-steatosis-index` — the
fibrosis tools of the NAFLD era. The framework that *replaced* NAFLD in 2023 was missing.

## §1 The categories

**SLD** (steatotic liver disease) is the umbrella.

| | |
|---|---|
| **MASLD** | steatosis + ≥1 of five cardiometabolic criteria, alcohol below the MetALD band |
| **MetALD** | the same, with **140–350 g/week** (female) or **210–420 g/week** (male) |
| **ALD** | alcohol above that band |
| **Cryptogenic SLD** | steatosis, no cardiometabolic criterion, no other cause |

**The five criteria**, any one of which suffices: adiposity by BMI or waist; fasting glucose
≥100 mg/dL, HbA1c ≥5.7%, or type 2 diabetes; BP ≥130/85 or antihypertensive treatment;
triglycerides ≥150 or lipid-lowering treatment; HDL ≤40 (M) / ≤50 (F) or lipid-lowering
treatment.

## §2 The change is not the name

NAFLD was a diagnosis of **exclusion** — significant alcohol had to be ruled out before it
could be given. MASLD is a **positive** diagnosis, made on steatosis plus metabolic
dysfunction.

And drinking above the threshold no longer makes the diagnosis disappear: it makes it
**MetALD**, a named category that did not exist before 2023. A tool still applying NAFLD logic
reports "not NAFLD" for a patient who now has a named disease, and drops them.

So when a case lands in the MetALD band, the tile says exactly that — that under the old
nomenclature this patient would have been excluded from a fatty-liver diagnosis altogether.

## §3 Two thresholds that are not one number

**The BMI cut is ancestry-specific**: ≥25 generally, ≥23 in those of Asian ancestry. A BMI of
24 meets the criterion under one and not the other, and the tile says so at exactly those
values.

**The HDL cut is sex-specific**: ≤40 mg/dL in males, ≤50 in females. An HDL of 45 meets it in
a woman and not in a man.

Waist thresholds vary by ancestry **and** sex — and the Japanese figures invert the usual sex
ordering (85 cm male, 90 cm female), which a tool assuming "men higher" would get backwards.
Tested.

## §4 The alcohol bands are per week

140–350 and 210–420 **g/week** are the published figures. The daily numbers widely quoted are
approximations of them, so the field asks for grams per week and the result says so. A female
intake of 200 g/week is MetALD; the same 200 g/week in a male is still MASLD.

## §5 Sourcing (spec-v97 gate)

- Rinella ME, Lazarus JV, Ratziu V, et al. A multisociety Delphi consensus statement on new
  fatty liver disease nomenclature. *J Hepatol.* 2023;79(6):1542-1556 — the categories and the
  alcohol bands taken from the consensus statement itself.
- The five cardiometabolic criteria with every threshold were corroborated separately, since
  the consensus paper carries them in a figure rather than in text.

## §6 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not stage fibrosis or direct treatment.

Catalog 1628 → 1629.
