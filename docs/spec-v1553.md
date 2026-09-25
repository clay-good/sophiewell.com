# spec-v1553 — Tuberculosis: the child decision algorithms, 4-month eligibility, and WHO weight bands

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Six tiles. The catalog's TB tiles are US-based (`tb-testing`, `ltbi-regimen-dosing` from
CDC/NTCA 2020, `ca-adult-tb-risk`); WHO's weight bands, regimens and age limits differ.

## Sources (read in full; the two algorithm figures rendered and read visually)

| Key | Document | Licence |
|---|---|---|
| M5HB | WHO. *Operational handbook on tuberculosis, Module 5: management of TB in children and adolescents.* 2022 (IRIS 10665/352523) | CC BY-NC-SA 3.0 IGO |
| M4DS | WHO. *Operational handbook, Module 4: drug-susceptible TB treatment.* 2022 | CC BY-NC-SA 3.0 IGO |
| M4HB25 | WHO. *Consolidated operational handbook, Module 4: treatment and care.* April 2025 | CC BY-NC-SA 3.0 IGO |
| M1GL | WHO. *Consolidated guidelines, Module 1: TB preventive treatment*, 2nd ed. August 2024 | CC BY-NC-SA 3.0 IGO |
| M1HB | WHO. *Operational handbook, Module 1: TB preventive treatment*, 2nd ed. August 2024 | CC BY-NC-SA 3.0 IGO |
| M2HB | WHO. *Operational handbook, Module 2: systematic screening.* 2021 | CC BY-NC-SA 3.0 IGO |
| HIVCM25 | WHO. *Updated recommendations on HIV clinical management.* December 2025 | CC BY-NC-SA 3.0 IGO |

---

## 1. `who-child-tb-algorithm` — Should This Child Start TB Treatment? WHO Treatment Decision Algorithms A and B

**Question.** For a child under 10 with presumed pulmonary TB and no bacteriological confirmation,
should TB treatment start now?

**Applies to** a symptomatic child under 10 at a health facility, with symptoms for more than 2
weeks (any of cough, fever, poor appetite, weight loss or failure to thrive, fatigue or reduced
playfulness). **Not** for extrapulmonary TB, active case-finding, or asymptomatic contacts
(M5HB §4.3.9.2); the tile refuses those and says why.

**Inputs.** Age (months, required, for the rate cutoffs); heart rate and respiratory rate (per
minute); algorithm: A (chest X-ray available) / B (no X-ray) (required); each scored item as yes /
no, **every item required** (a blank under-states the score); in A, the X-ray features; mWRD or
urine LF-LAM result (positive / negative / not done / pending); close or household TB contact in the
past 12 months (yes / no, required); danger signs; high-risk child (under 2 years, living with HIV,
or severe acute malnutrition).

**Flow (M5HB Fig. 4.4 and 4.5).**

1. Danger signs → stabilize or transfer first (IMCI signs under 5, ETAT signs 5–9 years).
2. High-risk child → straight to the rapid molecular test (plus urine LF-LAM if living with HIV).
   A low-risk child is first treated for the most likely other illness and reviewed at 1–2 weeks;
   the tile says to come back if symptoms persist.
3. Test positive → **treat**.
4. Test negative, not done, or pending, and a TB contact in the past 12 months → **treat** (the score
   is skipped).
5. Otherwise score.

**Scores.**

| Item | A (with X-ray) | B (no X-ray) |
|---|---|---|
| Cough longer than 2 weeks | +2 | +5 |
| Fever longer than 2 weeks | +5 | +10 |
| Lethargy | +3 | +4 |
| Weight loss | +3 | +5 |
| Coughing blood | +4 | +9 |
| Night sweats | +2 | +6 |
| Swollen lymph nodes | +4 | +7 |
| Fast heart rate | +2 | +4 |
| Fast breathing | **−1** | +2 |
| X-ray: cavity | +6 | — |
| X-ray: enlarged lymph nodes | +17 | — |
| X-ray: opacities | +5 | — |
| X-ray: miliary pattern | +15 | — |
| X-ray: effusion | +8 | — |

**Treat if the total is above 10.** Exactly 10 is "do not start; reassess in 1–2 weeks".

**Definitions (M5HB Box 4.9).** Fast heart rate: above 160 under 2 months; above 150 at 2–12 months;
above 140 at 12 months–5 years; above 120 over 5 years. Fast breathing: above 60, 50, 40, 30 for the
same age groups. Both computed from the entered rates. Weight loss: more than 5% below the highest
weight in 3 months, or failure to thrive (weight-for-age or WHZ −2 or below). Fever is scored on its
**duration by history**, not a measured temperature. Nodes: painless cervical, submandibular, or
axillary.

**Output.** Treat or not, the total with each item's points, and the source's performance note
(calibrated to 85% sensitivity; specificity 37% with X-ray, 30% without), so the user knows a "do not
treat" is not a rule-out.

**Worked examples (M5HB Box 4.7, 4.8; tests).** A: cough, lethargy, fast heart rate, normal X-ray =
7, do not treat; weight loss, nodes, opacities = 12, treat. B: cough, 5 days of fever (0) and fast
breathing = 7; cough, weight loss, nodes = 17.

**Traps.** Fast breathing is **negative in A** and positive in B. Children living with HIV use the
same items; there is no separate HIV score. M5HB called the recommendation interim until 2024; no
replacement was found. *Moderate* volatility.

## 2. `tb-4-month-eligibility` — Can This Child Take the 4-Month TB Regimen? (WHO, Non-Severe TB)

**Question.** Can this child or adolescent (3 months to 16 years) with presumed drug-susceptible TB
take 4 months of treatment instead of 6?

**Inputs.** Age (months); weight (kg); setting: "X-ray and bacteriology available" / "no X-ray" / "no
X-ray and no bacteriology" (required); X-ray pattern (intrathoracic nodes without airway
obstruction; disease in one lobe, no cavities, no miliary pattern; uncomplicated effusion; other);
Xpert result (negative / trace / very low / low / medium / high / not done); smear (if no Xpert);
isolated peripheral lymph node TB; mild symptoms (the tile derives this from its components: no
danger or priority signs, no asymmetric persistent wheeze, no extrapulmonary TB other than
peripheral nodes, no severe acute malnutrition, respiratory distress, fever over 39 °C, severe
pallor, restlessness, irritability or lethargy); exclusions: severe acute malnutrition; under 3
months or under 3 kg; TB treated in the past 2 years; suspected drug resistance; severe acute
pneumonia; living with HIV.

**Logic (M5HB Box 5.2, 5.3; §5.2.4–5.2.5).**

- **A. X-ray and bacteriology:** X-ray consistent with non-severe disease **and** Xpert negative,
  trace, very low, or low (or smear-negative) **and** mild symptoms.
- **B. No X-ray:** that bacteriology result and mild symptoms; or isolated peripheral node TB and
  mild symptoms.
- **C. Neither:** isolated peripheral node TB and mild symptoms; or a clinical pulmonary TB
  diagnosis and mild symptoms.
- Any exclusion → 6 months. Living with HIV: "may" be considered (clinician judgement); the tile
  says so and gives no automatic yes.
- **Ethambutol** is added to the intensive phase where HIV prevalence is high (1% or more of pregnant
  women, or 5% or more of people with TB), isoniazid resistance is high, or the child lives with HIV.
- Without an X-ray, review monthly; extend to 6 months if no response at 4.

**Output.** 4 months (2HRZ(E)/2HR) or 6 months, with the reasons, and a link to tile 3's bands.

**Trap.** Xpert "low" is eligible; "medium" or "high" is not.

## 3. `who-tb-fdc-dose` — First-Line TB Tablets by Weight: Child Dispersible and Adult FDCs (WHO)

**Inputs.** Weight (kg, required); age (years); phase (intensive / continuation).

**Children (M5HB Table 5.5).** HRZ 50/75/150 mg dispersible; E 100 mg dispersible; HR 50/75 mg.

| Weight | HRZ (intensive) | E (intensive) | HR (continuation) |
|---|---|---|---|
| 4 to under 8 kg | 1 | 1 | 1 |
| 8 to under 12 | 2 | 2 | 2 |
| 12 to under 16 | 3 | 3 | 3 |
| 16 to under 25 | 4 | 4 | 4 |
| 25 or more | adult tablets | | |

The source notes 7.9 kg is dosed in the 4–<8 kg band. Dissolve in about 50 mL of water and give
within 10 minutes. Target mg/kg (Table 5.3): H 10 (7–15), R 15 (10–20), Z 35 (30–40), E 20 (15–25),
shown as achieved values.

**Adults and children 25 kg or more (M4DS Annex; M4HB25 Annex 4, identical).** HRZE 75/150/400/275
mg; HRE 75/150/275; HR 75/150.

| Weight | 25 to under 30 | 30 to under 35 | 35 to under 50 | 50 to under 65 | 65 or more |
|---|---|---|---|---|---|
| FDC tablets | 2 | 3 | 4 | 4 | 5 |

The 35–<50 and 50–<65 bands both give 4 **as printed**. These are the current bands; the older
30–39 / 40–54 / 55–70 / over 70 set is superseded and not built. Loose-drug rows (H 300, R 300, E
400, Z 400, Z 500) print as a second table for clinics without FDCs. Pyridoxine 0.5–1 mg/kg/day for
children living with HIV and malnourished children.

**HPZM 4-month regimen** (12 years or more, 40 kg or more): H 300, rifapentine 1,200, moxifloxacin
400 mg; Z 1,500–1,600 mg at 40–<65 kg, 2,000 mg at 65 kg or more. Not with CD4 under 100, in
pregnancy, or under 40 kg. A row, not its own tile.

## 4. `who-tpt-dose` — TB Preventive Treatment Options and Tablets by Weight (WHO 2024)

**Question.** Which WHO preventive regimens fit this person, and how many tablets per dose?

**Inputs.** Weight (kg, required); age (years, required: 1HP needs 13 or more); living with HIV; the
ART regimen (for interactions); contact of drug-resistant TB (yes / no).

**Options (M1GL recs 19–21; M1HB Table 3).** 6H or 9H, 3HP, and 3HR (strong); 1HP and 4R
(alternatives); **6 months of levofloxacin** for contacts of MDR or RR-TB. 6H, 3HP, 3HR and 6Lfx at
all ages; **1HP only from 13 years**; 4R has no child formulation (not under 25 kg). HIVCM25 makes
**3HP preferred** for people living with HIV.

**ART interactions (M1HB Table 3).** 3HP and 1HP: not with protease inhibitors, nevirapine,
doravirine, etravirine, or TAF (TDF, efavirenz, dolutegravir, raltegravir allowed). 3HR and 4R: not
with protease inhibitors, nevirapine, doravirine, etravirine; adjust dolutegravir and raltegravir.

**Tablets per dose.** Two band systems, as printed (M1HB Table 4):

- 6H/9H, 4R, 3HR: 4–7.9, 8–11.9, 12–15.9, 16–24.9, 25–29.9, 30–34.9, 35–49.9, 50–64.9, 65 kg or more.
  H 100 dispersible 0.5 / 1 / 1.5 / 2 (to 24.9 kg); H 300 0.5 / 1 / 1 / 1 / 1.25 (from 25 kg); R 150
  2 / 3 / 4 / 4 / 5; R 300 1 / 1.5 / 2 / 2 / 2.5; RH 75/50 dispersible 1 / 2 / 3 / 4; RH 150/75 2 / 3 /
  4 / 4 / 5.
- 3HP, 1HP, 6Lfx: 3–5.9 kg under 3 months; 3–5.9 kg 3 months or more; 6–9.9 kg under 6 months; 6–9.9
  kg 6 months or more; 10–14.9; 15–19.9; 20–24.9; 25–29.9; 30–34.9; 35–39.9; 40–44.9; 45–49.9; 50 kg
  or more. Every row from M1HB Table 4 part 2 is encoded as printed (3HP H 100 0.6 / 0.7 / 1 / 1.5 /
  2.5 / 3 / 4.5 / 4.5 / 6 / 6 / 7.5 / 7.5 / 9; rifapentine 150 0.5 / 0.7 / 1.5 / 1.5 / 2 / 3 / 4 / 4 /
  5 / 6 / 6 / 6 / 6; the 300/300 FDC from 15 kg 1 / 1.5 / 2 / 2.5 / 3 / 3 / 3 / 3; 1HP H 300 1 and P
  300 2 from 25 kg; levofloxacin 100 dispersible, 250 and 500 rows).

**Traps.** M1HB prints the 6H 4–7.9 kg H 100 cell as "0.5 (0.5 mL)", but half a 100 mg tablet at 10
mg/mL is 5 mL: a source misprint. The tile prints tablets only for that cell and a code comment
cites the page. The 300/300 FDC under 50 kg: monitor for isoniazid toxicity (footnote). Infants 3
kg or less: consult a specialist, refused.

**Overlap.** `ltbi-regimen-dosing` is the CDC/NTCA mg/kg tile (no 3HP under 2 years, no 1HP, no 6Lfx).
It stays, labelled US; this tile is WHO. Each links to the other with one line on how they differ.

## 5. `tb-screen-hiv` — TB Symptom Screen for People Living With HIV and Child Contacts (WHO)

**Inputs.** Group: adult or adolescent with HIV / child under 10 with HIV / contact under 15 /
inpatient with HIV (required); current cough, fever, weight loss (or poor weight gain in children),
night sweats; TB contact; CRP (mg/L, optional); on ART (yes / no).

**Logic.** Adults and adolescents with HIV (M1GL rec 10): positive if any of current cough, fever,
weight loss, or night sweats; adjuncts CRP **above 5 mg/L**, chest X-ray, or a rapid molecular test.
Children under 10 with HIV (M2HB): any of cough, fever, poor weight gain, or TB contact. Contacts
under 15: cough, fever, poor weight gain, or X-ray. **Inpatients with HIV where TB prevalence is over
10%: the symptom screen is not suitable; test with a rapid molecular test.** Positive → evaluate for
TB; negative → go to tile 6.

**Output.** Positive or negative, and the screen's accuracy for the group (M2HB Tables 5.1–5.2): on
ART, sensitivity is only **53%**, so a negative screen is weak and the answer says so. CRP is mg/L,
not mg/dL (unit guard).

## 6. `tpt-eligibility-who` — TB Preventive Treatment: Give, Test First, Evaluate, or Defer? (WHO 2024)

**Inputs.** Group: living with HIV / household contact / other risk group (dialysis, anti-TNF,
transplant, silicosis) (required); age (years); screen result (from tile 5); TB infection test (TST,
IGRA or TB antigen skin test: positive / negative / not available); X-ray (normal / abnormal / not
available); contraindications: active or chronic hepatitis, peripheral neuropathy (if isoniazid),
regular heavy alcohol use.

**Logic (M1GL Fig. 1).** Living with HIV: screen; positive → evaluate for TB; negative →
contraindication check. Household contact: screen; positive → evaluate; negative and **under 5 → no
infection test needed** → contraindication check; negative and 5 or older → infection test: positive
or unavailable → X-ray (if not done): abnormal → evaluate, normal or unavailable → contraindication
check; **negative test → no TPT**. Other risk groups → infection test, then as above.
Contraindication present → defer; none → **give TPT**. **Pregnancy and a previous TB episode are not
contraindications.** An infant under 1 year with HIV and no symptoms gets TPT only if a household
contact.

**Output.** The decision, the path taken, and a link to tile 4.

## Tests

`test/unit/who-tb.test.js`: the four M5HB worked examples; exactly 10 vs 11; fast breathing's sign
flip; the contact bypass; each 4-month exclusion; every FDC and TPT band edge; the misprint cell;
1HP at 12 vs 13 years; the screen's inpatient refusal; each TPT pathway branch.

## Staleness

M5HB *moderate* (the algorithm recommendation was marked interim). M4 and M1 *low*.
