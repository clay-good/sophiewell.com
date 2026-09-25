# spec-v1546 — IMCI and iCCM treatment: fluid plans, dose bands, and the CHW chart

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four tiles. The classifications are spec-v1545; this is what the chart says to give.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| CB14 | WHO. *IMCI chart booklet.* 2014 (pp. 12–21 treatment pages; dose tables re-checked against page images) | All rights reserved |
| ICCM11 | WHO/UNICEF. *Caring for the sick child in the community*: chart booklet and participant manual. 2011. ISBN 978-92-4-154804-5 | All rights reserved |
| ICCM20 | WHO. *Caring for the sick child in the community: adaptation for high HIV or TB settings.* Chart booklet. 2020. ISBN 978-92-4-001736-8 | CC BY-NC-SA 3.0 IGO |
| PD24 | WHO. *Guideline on management of pneumonia and diarrhoea in children up to 10 years.* 2024 | CC BY-NC-SA 3.0 IGO |
| PB13 | WHO. *Pocket book of hospital care for children*, 2nd ed. 2013 (Chart 11, Annex 2) | All rights reserved |
| MAL26 | WHO. *WHO guidelines for malaria*, 10 September 2026. doi:10.2471/B09879 | CC BY-NC-SA 3.0 IGO |

## Conflicts

| # | Item | Older | Newer | Rule |
|---|---|---|---|---|
| C1 | Zinc for diarrhea | CB14: 20 mg tablet, ½ tablet (10 mg) at 2–<6 months, 1 tablet (20 mg) at 6 months or more, **14 days**. ICCM11: same doses, **10 days** | PD24 rec 3c: **5 mg daily**, up to 14 days, extended to children up to 10 years (conditional, low certainty) | **Edition switch**: "IMCI chart 2014", "iCCM chart 2011", "WHO guideline 2024" |
| C2 | Artemether-lumefantrine bands | CB14: 5–<10 kg 1 tablet; 10–<14 kg 1; 14–<19 kg 2 | MAL26: 5–<15 kg 1 tablet (20/120 mg); 15–<25 kg 2; plus a new under-5 kg band | MAL26 supersedes; the oral-drug tile routes antimalarials to `act-weight-band-dose` and prints the 14 vs 15 kg difference |
| C3 | IM artesunate | CB14: 2.4 mg/kg for all | MAL26: 3 mg/kg under 20 kg, 2.4 mg/kg at 20 kg or more | MAL26 supersedes; routed to `severe-malaria-artesunate-dose` |
| C4 | Rectal artesunate | CB14: 50 mg and 200 mg suppositories by age band | WHO 2017 information note: 100 mg suppositories, one up to 10 kg, two up to 20 kg | Routed to `rectal-artesunate-prereferral` (spec-v1551) |
| C5 | Rectal diazepam, 0.5 mg/kg | CB14 age/weight bands (0.5 / 1.0 / 1.5 / 2.0 mL of 10 mg in 2 mL) | PB13 Chart 9 and Annex 2 print two further band sets for the same mg/kg | Compute 0.5 mg/kg (0.1 mL/kg of 10 mg in 2 mL); show the band of the chart the user names |
| C6 | Plan B table vs cholera job aid | CB14 bands (below) | GTFCC 2024 prints different bands for the same 75 mL/kg | This tile implements CB14; cholera uses `cholera-rehydration-plan` (spec-v1560) |

---

## 1. `imci-ors-plan` — ORS Plans A, B and C: How Much Fluid for a Child With Diarrhea (WHO)

**Question.** How much ORS or IV fluid does this child need, and over what time?

**Inputs.** Plan (A / B / C, or passed from `imci-diarrhea-classify`; required); weight (kg,
required for B and C; B allows age as fallback); age (months, required); for Plan C: can start IV now
(yes / no), IV available within 30 minutes (yes / no), trained to use a nasogastric tube (yes / no),
child can drink (yes / no); severe acute malnutrition (yes / no, required: it blocks Plan C).

**Logic.**

- **Plan A (CB14 p. 19):** after each loose stool, up to 2 years 50–100 mL, 2 years or more
  100–200 mL; give 2 ORS packets to take home; zinc per the edition switch in tile 2. (ICCM11 says
  at least half a cup after each loose stool.)
- **Plan B (CB14 p. 19):** ORS over 4 hours ≈ weight × 75 mL. If weight is unknown, by age:
  up to 4 months (under 6 kg) 200–450 mL; 4–<12 months (6–<10 kg) 450–800 mL; 12 months–<2 years
  (10–<12 kg) 800–960 mL; 2–<5 years (12–19 kg) 960–1,600 mL. Give more if the child wants more.
  Reassess at 4 hours.
- **Plan C (CB14 p. 20; PB13 Chart 11):** Ringer's lactate (or normal saline) 100 mL/kg: **under
  12 months, 30 mL/kg over 1 hour then 70 mL/kg over 5 hours; 12 months or more, 30 mL/kg over 30
  minutes then 70 mL/kg over 2½ hours.** Repeat the first 30 mL/kg once if the radial pulse is
  still very weak. ORS about 5 mL/kg/hour once the child can drink. Reassess an infant at 6 hours,
  a child at 3 hours. No IV: refer if IV is available within 30 minutes; else nasogastric (or oral)
  ORS 20 mL/kg/hour for 6 hours (120 mL/kg), reassessing every 1–2 hours; else refer urgently.
  Observe 6 hours after rehydration.

**Output.** Volumes in mL and rates in mL/h per phase, the reassessment clock, and for Plan B the
×75 figure alongside the band. PB13's banded Plan C volumes are shown as a check column.

**Edges and traps.** **Severe acute malnutrition blocks Plan C**; the tile refuses and links
`sam-emergency-fluids`. The Plan C timing flips at age 12 months, not at a weight. Weight 19 kg or
more is off the Plan B table; the ×75 rule still applies and is shown alone.

**Overlap.** `peds-fluid-deficit` (percentage deficit plus Holliday-Segar) and `maint-fluids` answer
different questions; linked.

## 2. `imci-oral-drug-bands` — Home Drug Doses by Weight or Age for Children 2–59 Months (WHO IMCI)

**Question.** How many tablets or how many mL of each IMCI home drug for this child?

**Inputs.** Drug (required); weight (kg) or age (months), weight preferred; edition (for zinc only).

**Bands (CB14 pp. 12–15, 19).** Every band is encoded as printed; the top band is closed on some
drugs ("14–19 kg") and open on others ("14–<19 kg"), and 19 kg or more is outside the chart.

| Drug | Schedule | 2–<12 mo (4–<10 kg) | 12 mo–<3 y (10–<14 kg) | 3–<5 y (14–19 kg) |
|---|---|---|---|---|
| Amoxicillin 250 mg tablet, or 250 mg in 5 mL | twice daily, 5 days | 1 tablet / 5 mL | 2 / 10 mL | 3 / 15 mL |
| Paracetamol 100 mg or 500 mg | every 6 h, fever 38.5 °C or more or ear pain | 2 mo–<3 y (4–<14 kg): 1 × 100 mg or ¼ × 500 mg | | 3–<5 y (14–<19 kg): 1½ × 100 mg or ½ × 500 mg |
| Iron syrup, ferrous fumarate 100 mg in 5 mL (20 mg/mL elemental) | daily, 14 days (not with RUTF) | 2–<4 mo (4–<6 kg) 1.00 mL; 4–<12 mo (6–<10 kg) 1.25 mL | 2.00 mL | 2.5 mL |
| Iron/folate tablet (ferrous sulfate 200 mg + folate 250 µg) | daily, 14 days | — | ½ | ½ |

Other rows:

- **Cotrimoxazole prophylaxis** (from 4–6 weeks, once daily): under 6 months, syrup (40/200 mg in
  5 mL) 2.5 mL or 1 pediatric tablet (20/100 mg); 6 months–<5 years, 5 mL, or 2 pediatric
  tablets, or ½ adult tablet (80/400 mg). **Superseded for HIV care** by the 2026 weight bands in
  `who-cotrimoxazole-prophylaxis` (spec-v1554); this row prints that link.
- **Ciprofloxacin** for dysentery, 15 mg/kg twice daily for 3 days: under 6 months ½ × 250 mg
  (or ¼ × 500 mg); 6 months–<5 years 1 × 250 mg (or ½ × 500 mg).
- **Zinc**, edition switch C1: CB14 ½ × 20 mg (2–<6 months) or 1 × 20 mg (6 months or more), 14
  days; ICCM11 the same for 10 days; PD24 5 mg daily. PD24 does not name a tablet strength, so the
  2024 output is mg only.
- **Vitamin A** routes to `vitamin-a-dose-child` (spec-v1550).
- **Mebendazole** 500 mg once if 1 year or older, no dose in 6 months, and hookworm or whipworm is
  a local problem; an action line, not a band.
- **Salbutamol inhaler** 100 µg per puff with a spacer: 2 puffs, up to 3 times 15 minutes apart,
  before classifying wheeze.
- **Antimalarials** route to `act-weight-band-dose` (C2).
- **Cholera** (2 years or more, 10–19 kg): CB14 leaves the drug to the national program; route to
  `cholera-rehydration-plan`.

**Output.** Tablets or mL per dose, how often, how many days, and the total to hand the caregiver.
The achieved mg/kg shows beside amoxicillin, because a 4 kg child on 250 mg twice daily gets 62.5
mg/kg per dose and PD24 states the dose as at least 40 mg/kg per dose. Weight and age in different
bands: weight wins, and the answer says so.

**Overlap.** `peds-dose`, `peds-weight-dose` and `weight-dose` compute mg/kg; this tile gives the
band the chart prints, which is what the health worker was trained on.

## 3. `imci-prereferral-injectables` — Pre-Referral Injections and Suppositories for Children 2–59 Months (WHO IMCI)

**Question.** What volume of each first dose does this child get before referral?

**Inputs.** Drug (required); weight (kg) or age (months).

**Bands (CB14 p. 17, image-checked).**

Antibiotics, four bands:

| Band | Ampicillin 50 mg/kg (500 mg vial + 2.1 mL water = 500 mg in 2.5 mL) | Gentamicin 7.5 mg/kg (40 mg/mL, 2 mL vial) |
|---|---|---|
| 2–<4 mo (4–<6 kg) | 1 mL | 0.5–1.0 mL |
| 4–<12 mo (6–<10 kg) | 2 mL | 1.1–1.8 mL |
| 12 mo–<3 y (10–<14 kg) | 3 mL | 1.9–2.7 mL |
| 3–<5 y (14–19 kg) | 5 mL | 2.8–3.5 mL |

IM quinine (10 mg/kg of the salt), five **age** bands:

| Band | 150 mg/mL | 300 mg/mL |
|---|---|---|
| 2–<4 mo | 0.4 mL | 0.2 mL |
| 4–<12 mo | 0.6 mL | 0.3 mL |
| 12 mo–<2 y | 0.8 mL | 0.4 mL |
| 2–<3 y | 1.0 mL | 0.5 mL |
| 3–<5 y | 1.2 mL | 0.6 mL |

The antibiotics split at 3 years and the antimalarials at 2 years, so the two tables are never
merged. The research read weight ranges for the antibiotic bands only; the quinine table is used by
age, and a weighed child gets the computed 10 mg/kg volume with the band shown beside it. Gentamicin is printed as a range; the tile prints the range and the 7.5 mg/kg
exact volume at the entered weight. If referral is impossible, the chart repeats ampicillin every 6
hours and says the dose may be increased 4-fold for suspected meningitis. No quinine under 4 months
in low-malaria-risk areas.

- **Rectal diazepam** for convulsions: 0.5 mg/kg = 0.1 mL/kg of 10 mg in 2 mL, computed (C5); the
  CB14 band (0.5 / 1.0 / 1.5 / 2.0 mL) printed beside it.
- **Artesunate** (IM and rectal) routes to spec-v1551 (C3, C4).

**Output.** Volume, route, and what to write on the referral note.

## 4. `iccm-chw-sick-child` — Community Health Worker Sick Child Chart: Refer or Treat at Home (WHO/UNICEF iCCM)

**Question.** Should the community health worker refer this child urgently, or treat at home, and
with what?

**Inputs.** Age (months, 2–<60); cough and its days; diarrhea (3 or more loose stools in 24 h) and
its days; blood in stool; fever and its days; lives in a malaria area; malaria rapid test (positive
/ negative / not done); convulsions; not able to drink or feed anything; vomits everything; chest
indrawing; breaths per minute (if cough); unusually sleepy or unconscious; MUAC color (red / yellow
/ green, 6 months or more); swelling of both feet; edition ("iCCM 2011" / "iCCM 2020 high HIV or TB
settings"); for 2020: the child has HIV, household TB contact. Each sign three-state.

**Logic (ICCM11 pp. 4–7; ICCM20 pp. 7–9).**

- **Danger signs → refer urgently:** cough 14 days or more; diarrhea 14 days or more; blood in stool;
  fever 7 days or more; convulsions; not able to drink or feed anything; vomits everything; chest
  indrawing; unusually sleepy or unconscious; red MUAC; swelling of both feet. **2020 adds:** HIV
  plus any other illness; yellow MUAC in a child with HIV.
- **Pre-referral** (ICCM11): rectal artesunate 100 mg (1 suppository at 2 months–<3 years, 2 at
  3–<5 years) for fever with convulsions, unusual sleepiness, not able to drink, or vomiting
  everything; first dose of AL for other danger signs with fever; first dose of amoxicillin 250 mg
  (1 tablet at 2–<12 months, 2 at 12 months–<5 years) for chest indrawing or fast breathing.
- **Treat at home when there is no danger sign:** diarrhea under 14 days without blood → ORS and
  zinc for 10 days (½ tablet at 2–<6 months, 1 tablet at 6 months–<5 years); fever under 7 days in a
  malaria area → rapid test, and if positive AL twice daily for 3 days (1 tablet at 2 months–<3
  years, 6 in total; 2 tablets at 3–<5 years, 12 in total); fast breathing (50 or more at 2–<12
  months; 40 or more at 12 months–<5 years) → amoxicillin 250 mg twice daily for 5 days (1 tablet,
  10 in total; 2 tablets, 20 in total); yellow MUAC → feeding counselling and supplementary feeding.
  Follow up in 3 days.
- A negative rapid test with fever has no drug; the chart says to advise and follow up.

**Output.** Refer or treat; the drug, tablets per dose, and **total tablets to hand over** (the
number a CHW counts out); the follow-up day.

**Edges and traps.** The chart doses AL by **age only**, unlike MAL26's weight bands; the tile says
so and links `act-weight-band-dose` for a weighed child. ICCM11 prints no zinc tablet strength
(20 mg is usual; the tile states it as the common strength, not the chart's). Chest indrawing is a
danger sign here even though PD24 allows community treatment where a program adopts it; a required
input asks whether the national program has, and prints the PD24 path only if yes. ICCM11 gives
only the red MUAC limit (under 115 mm); the yellow limits come from WHO 2023 via
`wasting-classify`.

## Tests

`test/unit/imci-treatment.test.js`: every band edge of every drug; Plan C at 11.9 and 12.0 months;
SAM blocks Plan C; zinc changes with the edition; the AL and artesunate routes print the
supersession sentence; the iCCM danger-sign list for both editions; total tablet counts; empty and
one-field-short forms give no dose.

## Staleness

CB14 and ICCM11 *low*; PD24 *moderate*; MAL26 rows are owned by spec-v1551's *high* row.
