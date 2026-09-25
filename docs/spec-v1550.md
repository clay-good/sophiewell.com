# spec-v1550 — Anemia and micronutrients: hemoglobin cutoffs, vitamin A, deworming, iron

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four tiles. The catalog has iron-deficit and thalassemia-index tools but **no anemia definition
tile at all**; `who-anemia-hb` is the highest-value tile in this spec.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| HB24 | WHO. *Guideline on haemoglobin cutoffs to define anaemia in individuals and populations.* 2024 (IRIS 10665/376196). Supersedes the 2011 cutoffs | CC BY-NC-SA 3.0 IGO |
| VA11 | WHO. *Guideline: vitamin A supplementation in infants and children 6–59 months.* 2011 | All rights reserved |
| SAM99 | WHO. *Management of severe malnutrition.* 1999 (Table 10, vitamin A treatment) | All rights reserved |
| PB13 | WHO. *Pocket book of hospital care for children.* 2013 (§6.4 and Annex 2, measles vitamin A) | All rights reserved |
| STH17 | WHO. *Guideline: preventive chemotherapy to control soil-transmitted helminth infections.* 2017 | CC BY-NC-SA 3.0 IGO |
| FE16 | WHO. *Guideline: daily iron supplementation in infants and children.* 2016; and the companion for adult women and adolescent girls | All rights reserved |
| ANC16 | WHO. *Recommendations on antenatal care for a positive pregnancy experience.* 2016 (A.2.1, A.2.2) | All rights reserved |
| LBW22 | WHO. *Recommendations for care of the preterm or low-birth-weight infant.* 2022 (A.10a) | CC BY-NC-SA 3.0 IGO |

---

## 1. `who-anemia-hb` — Is This Hemoglobin Anemic? WHO 2024 Cutoffs With Altitude and Smoking

**Question.** Is this hemoglobin anemic for the person's age, sex, and pregnancy stage, and how
severe, after WHO's altitude and smoking adjustments?

**Inputs.** Hemoglobin (g/L or g/dL, both offered; range 20–250 g/L; required); group (required, no
default): child 6–23 months; 24–59 months; 5–11 years; girl 12–14; boy 12–14; woman 15–65 not
pregnant; man 15–65; pregnant, first / second / third trimester. Elevation of residence (m, 0–4,999;
optional, blank means not adjusted and the answer says so). Smoking (non-smoker / smoker, amount
unknown / under 10 a day / 10–19 / more than 20; optional, same rule).

**Logic (HB24 Tables 2–5).**

- **Anemia if below** (g/L): 6–23 months 105; 24–59 months 110; 5–11 years 115; 12–14 years (girls
  and boys) 120; women 120; men 130; pregnancy first trimester 110, second 105, third 110. These are
  5th percentiles.
- **Severity (below the cutoff):**

  | Group | Mild | Moderate | Severe |
  |---|---|---|---|
  | 6–23 months | 95 to below 105 | 70 to below 95 | below 70 |
  | 24–59 months | 100 to below 110 | 70 to below 100 | below 70 |
  | 5–11 years | 110 to below 115 | 80 to below 110 | below 80 |
  | 12–14 years, women | 110 to below 120 | 80 to below 110 | below 80 |
  | Men | 110 to below 130 | 80 to below 110 | below 80 |
  | Pregnancy, first and third trimester | 100 to below 110 | 70 to below 100 | below 70 |
  | Pregnancy, second trimester | 95 to below 105 | 70 to below 95 | below 70 |

  HB24 prints integer ranges (95–104); the tile compares the raw value against the thresholds, so
  104.5 is mild, not "between rows". Stated in one sentence.
- **Elevation adjustment** (Table 4), subtracted from the measured Hb: under 500 m 0; 500–999 m 4;
  1,000–1,499 8; 1,500–1,999 11; 2,000–2,499 14; 2,500–2,999 18; 3,000–3,499 21; 3,500–3,999 25;
  4,000–4,499 29; 4,500–4,999 33 g/L. The table is used as printed; HB24's formula
  (0.0056384 × elevation + 0.0000003 × elevation²) is shown as the source of the table. Above 2,500
  m, HB24 says adjustments may need local tailoring; the answer says so.
- **Smoking adjustment** (Table 5): amount unknown 3; under 10 a day 3; 10–19 a day 5; more than 20 a
  day 6 g/L. **Exactly 20 a day is in no row**; the tile applies HB24's formula
  (0.4565n − 0.0078n²) at n = 20 and says why. Elevation and smoking adjustments add.

**Output.** Adjusted Hb, the cutoff, anemic or not, severity, and each adjustment applied. The g/dL
and g/L forms are both printed.

**Edges.** Refuses under 6 months and over 65 years (not defined in HB24). A value entered as 11.2
with the unit set to g/L is refused as implausible ("did you mean g/dL?"), because 11.2 g/L is
outside the range: the 10-fold unit slip is the main error.

**Overlap.** `tsat`, `iron-ganzoni`, `mentzer` and the thalassemia indices answer what follows once
anemia is found. HIV staging (spec-v1554) uses its own 8 g/dL threshold.

## 2. `vitamin-a-dose-child` — Vitamin A Dose for a Child: Routine, Measles, or Eye Signs (WHO)

**Question.** What vitamin A dose, and how many doses, for this child and reason?

**Inputs.** Age (months, required); reason: routine supplementation / measles / persistent diarrhea
(IMCI treatment) / eye signs of deficiency (xerophthalmia) (required); on RUTF (yes / no); a vitamin A
dose in the past month (yes / no); supplementation program in this area (yes / no, for routine).

**Logic.**

- **Routine (VA11 Table 1):** 6–11 months **100,000 IU** once; 12–59 months **200,000 IU** every 4–6
  months. VA11 recommends it where night blindness affects 1% or more of 24–59 month olds or low
  serum retinol affects 20% or more; the tile asks whether a program exists rather than computing
  prevalence. CB14 gives the same doses every 6 months. Not under 6 months.
- **Measles (PB13 §6.4, Annex 2):** under 6 months **50,000 IU**; 6–11 months **100,000 IU**; 1–5
  years **200,000 IU**; **once a day for 2 days**. With eye signs of deficiency, a **third dose 2–4
  weeks** after the second.
- **Eye signs of deficiency (SAM99 Table 10):** day 1, day 2, and at least 2 weeks later: under 6
  months 50,000; 6–12 months 100,000; over 12 months 200,000 IU.
- **Holds:** no routine or IMCI dose within 1 month of a previous dose or to a child on RUTF (CB14).
  Measles and xerophthalmia treatment is given regardless of a recent routine dose (PB13 says
  "unless already adequately treated for this illness").

**Output.** IU per dose, the number of doses and their days, and the capsule count (Annex 2: 200,000
IU capsule ½ or 1; 100,000 IU capsule 1 or 2; 50,000 IU capsule 1, 2 or 4).

**Edges.** Ages 5.9/6.0, 11.9/12.0 months. The 6–11 vs 6–12 month wording differs between VA11 and
SAM99; each reason uses its own source's band.

## 3. `deworming-dose-who` — Deworming Dose and Frequency (WHO Preventive Chemotherapy)

**Inputs.** Age (months or years, required); pregnant (yes / no), trimester; local helminth
prevalence: under 20% / 20–50% / over 50% / unknown (required).

**Logic (STH17 p. 13).** Albendazole **400 mg** or mebendazole **500 mg**, single dose, for children
12–23 months, 24–59 months, and school age; **albendazole 200 mg (half dose) under 24 months.**
Annual where prevalence is 20% or more; twice a year where it is over 50%. Also for non-pregnant
adolescent girls and women of reproductive age. Pregnant women: only after the first trimester, and
only where hookworm or whipworm prevalence is 20% or more **and** anemia is 40% or more. "Unknown"
prevalence gives the dose and no frequency. Under 12 months: not covered, refused.

**Overlap.** `pc-dose-pole` (spec-v1562) covers the mass drug administration context with height
poles; this tile is the individual dose.

## 4. `iron-supplement-who` — Preventive Iron and Iron-Folic Acid Doses (WHO)

**Inputs.** Group (required): child 6–23 months / 24–59 months / 5–12 years / non-pregnant woman or
adolescent girl / pregnant woman / preterm or low-birth-weight infant on breast milk; weight (kg, for
the preterm row); area anemia prevalence 40% or more (yes / no / unknown); hemoglobin (optional, for
pregnancy); on RUTF (yes / no).

**Logic.**

- **Children (FE16):** 6–23 months **10–12.5 mg elemental iron** daily; 24–59 months **30 mg**; 5–12
  years **30–60 mg**; for 3 consecutive months a year, where anemia prevalence is 40% or more. Salt
  equivalents print (for 30 mg: 150 mg ferrous sulfate heptahydrate, 90 mg ferrous fumarate, 250 mg
  ferrous gluconate).
- **Women and adolescent girls:** 30–60 mg daily for 3 months a year where prevalence is 40% or more.
- **Pregnancy (ANC16 A.2.1, A.2.2):** 30–60 mg elemental iron plus 400 µg folic acid daily; or 120 mg
  iron plus 2.8 mg folic acid weekly where daily is not acceptable and anemia prevalence is under
  20%. Hemoglobin below 110 g/L in pregnancy: 120 mg iron daily until it normalizes.
- **Preterm or low birth weight (LBW22 A.10a):** 2–4 mg/kg/day for infants fed breast milk, once
  feeding is established; mg computed from weight.
- **Holds:** no iron to a child on RUTF (CB14). This is **prevention**; treatment of anemia follows
  the IMCI iron bands in `imci-oral-drug-bands` or a clinician.

**Not built.** CB14's iron treatment table by weight extracted partly garbled; its rows in
`imci-oral-drug-bands` must be re-read from the page image before that tile ships (spec-v1546 build
note). The 2016 guideline's malaria-area caveats were not read in detail; the tile prints that
WHO pairs iron with malaria prevention and treatment where malaria is endemic.

## Tests

`test/unit/anemia-micronutrients.test.js`: every Hb cutoff and severity edge by group; elevation at
499/500 and 2,499/2,500 m; smoking at 19, 20, 21; the g/L vs g/dL guard; vitamin A by reason and age
edge; the RUTF and recent-dose holds; deworming half dose at 23 vs 24 months; iron by group.

## Staleness

HB24 *low* (new 2024). VA11, FE16, ANC16 *low*, with ANC nutrition recommendations known to have
been updated in 2020–2021 (multiple micronutrients, vitamin D), not read; review before build.
