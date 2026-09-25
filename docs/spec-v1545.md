# spec-v1545 — The sick child, 2 to 59 months: the IMCI assessment boxes

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Six tiles: one per IMCI assessment box, then a combined assessment that chains them. Treatments
(fluid plans and dose bands) are spec-v1546; the malnutrition box is spec-v1548.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| CB14 | WHO. *Integrated Management of Childhood Illness: chart booklet.* March 2014. ISBN 978-92-4-150682-3. The only WHO chart for 2–59 months; no later revision exists (checked September 25, 2026) | All rights reserved |
| PD24 | WHO. *Guideline on management of pneumonia and diarrhoea in children up to 10 years of age.* 2024. ISBN 978-92-4-010341-2 | CC BY-NC-SA 3.0 IGO |
| PB13 | WHO. *Pocket book of hospital care for children*, 2nd ed. 2013. ISBN 978-92-4-154837-3 | All rights reserved |

## Conventions for every tile here

- **Age bands.** "2 months up to 12 months" means 2 ≤ age < 12; "12 months up to 5 years" means
  12 ≤ age < 60. Age 60 months or more is outside IMCI; PD24 made no recommendation for 5–9 years,
  so the tiles refuse and say so.
- **General danger signs** (CB14 p. 1): not able to drink or breastfeed; vomits everything;
  convulsions (this illness); lethargic or unconscious; convulsing now. Each module takes them as
  one three-state input, "any general danger sign", with the list as help text. The combined tile
  (6) asks each one.
- **Temperature** is axillary (CB14 says rectal reads about 0.5 °C higher). Site input per
  spec-v1540 §4.4.

## Conflicts

| # | Item | CB14 (2014) | PD24 (2024) | Rule |
|---|---|---|---|---|
| C1 | Chest indrawing, no danger sign | Pneumonia: oral amoxicillin 5 days at a facility | Same (strong); community treatment by CHWs *suggested* where programs support it (conditional) | Implement CB14; print the PD24 community note |
| C2 | Amoxicillin duration, fast breathing | 5 days; 3 days possible in low-HIV settings | "Three or five days"; 3 in low-HIV settings | Same rule; HIV-prevalence setting is a required input |
| C3 | No pulse oximeter | Not addressed | Facility workers: suspect hypoxemia with head nodding, nasal flaring, grunting, or breathing 20 or more above the age cutoff | Add as an optional branch, labelled 2024 |
| C4 | Paracetamol trigger | Box text says "high fever (≥ 38.5 °C)"; drug table says "> 38.5 °C" | — | Use "38.5 °C or more" and say the booklet uses both |

---

## 1. `imci-cough-pneumonia` — Fast Breathing and Pneumonia in Children 2–59 Months (WHO IMCI)

**Question.** Does this child with cough or difficult breathing have severe pneumonia or very severe
disease, pneumonia, or a cough or cold?

**Inputs.** Age (months, 2–<60, required); respiratory rate counted over 1 full minute (0–150,
required); chest indrawing (three-state, required); stridor in a calm child (three-state,
required); any general danger sign (three-state, required); SpO2 % (optional, 50–100); wheeze
(optional; if present, the chart re-counts after up to three rapid-acting bronchodilator trials 15
to 20 minutes apart, so the tile asks for the post-bronchodilator count); HIV-exposed or infected
(optional; changes the chest-indrawing action); cough 14 days or more, or recurrent wheeze
(optional; adds a TB or asthma referral); HIV-prevalence setting (high / low, required only for
duration); no oximeter and facility worker: head nodding, nasal flaring, grunting (optional, C3).

**Logic (CB14 p. 2).** Fast breathing is **50 or more at 2–<12 months, 40 or more at 12–<60
months.**

- Any danger sign, or stridor in a calm child → **severe pneumonia or very severe disease** (pink):
  first dose of antibiotic, refer urgently. SpO2 below 90% → refer.
- Else chest indrawing or fast breathing → **pneumonia** (yellow): oral amoxicillin, 5 days (3 days
  possible for fast breathing without indrawing in low-HIV settings); an HIV-exposed or infected
  child with chest indrawing gets a first dose and referral; follow up in 3 days.
- Else → **cough or cold** (green): soothing remedy; follow up in 5 days if not improving.
- **C3 branch (PD24, facility, no oximeter):** any of head nodding, nasal flaring, grunting, or a
  count 20 or more above the age cutoff (70 or more at 2–<12 months; 60 or more at 12–<60 months,
  arithmetic stated as ours) → "suspected hypoxemia: the 2024 guideline says treat as severe".

**Output.** Classification, color word, the count and its cutoff, actions, and follow-up day.

**Edges.** Rate 49/50/51 at 11 months; 39/40/41 at 12 months; age 11.9 vs 12.0 months; SpO2 89/90.
A green row needs indrawing, stridor and danger signs all assessed absent.

**Overlap.** `peds-vitals` gives normal ranges; `pews` scores inpatient deterioration.
This is the IMCI decision. `centor`, `heckerling-pneumonia` and `psi` are adult or other
instruments.

## 2. `imci-diarrhea-classify` — Dehydration, Persistent Diarrhea and Dysentery in Children 2–59 Months (WHO IMCI)

**Question.** How dehydrated is this child with diarrhea, and is it persistent diarrhea or
dysentery?

**Inputs.** Lethargic or unconscious; restless or irritable; sunken eyes (each three-state); drinking
(not able or drinks poorly / drinks eagerly, thirsty / normal); skin pinch (goes back very slowly,
over 2 seconds / slowly / immediately); days of diarrhea (0–60); blood in the stool (three-state);
another severe classification present (yes / no; changes the Plan C action).

**Logic (CB14 p. 3).**

- Two or more of {lethargic or unconscious, sunken eyes, not able to drink or drinks poorly, skin
  pinch very slow} → **severe dehydration** (pink): Plan C; or, with another severe
  classification, refer with ORS sips on the way.
- Else two or more of {restless or irritable, sunken eyes, drinks eagerly, skin pinch slow} →
  **some dehydration** (yellow): Plan B and zinc.
- Else → **no dehydration** (green): Plan A and zinc.
- 14 days or more: with any dehydration → **severe persistent diarrhea** (treat dehydration first,
  refer); without → **persistent diarrhea** (feeding advice, multivitamin and minerals including
  zinc for 14 days, follow up in 5 days).
- Blood in stool → **dysentery**: ciprofloxacin 15 mg/kg twice daily for 3 days, follow up in 3
  days. PD24 keeps antibiotics for dysentery and names ceftriaxone 50–80 mg/kg daily for 3 days as
  second line.

**Output.** Up to three classifications at once (dehydration, persistent, dysentery), each with its
plan, linking to `imci-ors-plan` (spec-v1546). A child with severe acute malnutrition gets a
warning that Plan C does not apply (PB13 Chart 2) and a link to `sam-emergency-fluids`.

**Edges.** Exactly 14 days is persistent ("14 days or more"). "Sunken eyes" appears on both lists;
it counts once, toward whichever list is being tested.

**Overlap.** `clinical-dehydration-scale` (Goldman) is a different instrument with different items;
`peds-fluid-deficit` is percentage arithmetic. Both are listed as related.

## 3. `imci-fever-classify` — Fever, Malaria Risk and Measles in Children 2–59 Months (WHO IMCI)

**Question.** How should this child with fever be classified, given the malaria risk where they live
and any test result, and does measles have complications?

**Inputs.** Fever (by history, feels hot, or axillary 37.5 °C or more; the gate); malaria risk (high /
low / none and no travel; **required, no default**); any general danger sign; stiff neck; malaria
test (positive / negative / not available); another obvious cause of fever; fever every day for more
than 7 days; measles now or within 3 months; if measles: clouding of the cornea, deep or extensive
mouth ulcers, pus draining from the eye, mouth ulcers (each three-state).

**Logic (CB14 p. 4).**

- **High or low malaria risk:** danger sign or stiff neck → **very severe febrile disease** (first
  dose of an antimalarial and an antibiotic, prevent low blood sugar, paracetamol if 38.5 °C or
  more, refer). Else test positive → **malaria**. Else test negative, or another cause → **fever:
  no malaria**.
- **Who is tested:** every febrile child in high risk; in low risk only when there is no obvious
  other cause. No test available: high risk → malaria; low risk with no obvious cause → malaria.
- **No malaria risk and no travel:** danger sign or stiff neck → very severe febrile disease
  (antibiotic, no antimalarial); else **fever**, follow up in 2 days.
- Fever every day for more than 7 days → refer for assessment (added to any row).
- **Measles** (now or within 3 months): danger sign, corneal clouding, or deep or extensive mouth
  ulcers → **severe complicated measles**; pus from the eye or mouth ulcers → **measles with eye
  or mouth complications**; else **measles**. All three give vitamin A (dose from
  `vitamin-a-dose-child`, spec-v1550).

**Output.** The fever row and the measles row, with actions. The antimalarial links to
`act-weight-band-dose` (spec-v1551).

**Overlap.** `who-severe-malaria` applies WHO's laboratory-based severe malaria definition;
`measles-case-def` is the surveillance case definition. This is the IMCI triage decision.

## 4. `imci-ear-problem` — Ear Problem in Children 2–59 Months (WHO IMCI)

**Inputs.** Tender swelling behind the ear; pus seen draining; days of discharge; ear pain (each
three-state or number, required).

**Logic (CB14 p. 5).** Tender swelling behind the ear → **mastoiditis** (refer). Else pus draining
under 14 days, or ear pain → **acute ear infection** (amoxicillin 5 days, paracetamol, dry the ear by
wicking). Else pus draining 14 days or more → **chronic ear infection** (wicking and topical
quinolone drops for 14 days). Else → **no ear infection**.

**Edges.** Ear pain with no pus is acute. Discharge duration left blank blocks the acute/chronic
split.

**Overlap.** `aom-criteria` applies AAP diagnostic criteria, a different framework.

## 5. `imci-hiv-status` — HIV Status Classification for a Child Not in HIV Care (WHO IMCI)

**Inputs.** Mother's test (positive / negative / unknown); child's virological test (positive /
negative / not done); child's antibody test (positive / negative / not done); age (months);
breastfeeding now, or stopped less than 6 weeks ago (yes / no).

**Logic (CB14 p. 8; SYI19 p. 4 for the unknown row).** Rules are applied in this order:

1. Positive virological test at any age, or positive antibody test at 18 months or older →
   **confirmed HIV infection** (refer for ART; cotrimoxazole).
2. Mother positive and the child's virological test negative while breastfeeding or within 6 weeks
   of stopping, or the child not tested; or a positive antibody test under 18 months → **HIV
   exposed** (cotrimoxazole prophylaxis; virological test).
3. Negative test in the mother, or in the child after the exposure window → **HIV infection
   unlikely**.
4. No test for mother or child → **HIV status unknown** (offer testing).

**Edges.** Age 17.9 vs 18.0 months; 5 vs 6 weeks after weaning. Order matters: a negative antibody
test in a breastfeeding child of a positive mother is not "unlikely".

**Note.** CB14's antiretroviral dose tables are superseded (dolutegravir-based since 2019) and are
not built. Current ARV doses are spec-v1554.

## 6. `imci-sick-child` — IMCI Sick Child Assessment, 2–59 Months (WHO)

**Question.** Across all IMCI boxes, what are this child's classifications, and does any of them
mean urgent referral?

**Design.** Asks the general danger signs one by one, then the main symptoms (cough, diarrhea,
fever, ear problem), then always checks malnutrition (via `wasting-classify`, spec-v1548), anemia,
HIV status, and immunization and vitamin A status. It reuses the libraries of tiles 1–5 and of
`wasting-classify`; it adds no logic of its own except:

- **Any general danger sign → very severe disease** (pink), with the pre-referral steps, before any
  other box (CB14 p. 1).
- **Anemia (CB14 p. 7):** severe palmar pallor → **severe anemia** (refer); some pallor →
  **anemia** (iron 14 days unless on RUTF; mebendazole if 1 year or older and none in 6 months;
  follow up in 14 days); none → **no anemia**. Too thin for a tile of its own, so it lives here.
- **Summary:** every classification with its color; the single most urgent action first; and the
  earliest follow-up day across all rows.

**Build last** in this spec, after tiles 1–5 and `wasting-classify` exist, because its correctness
is theirs.

## Tests

`test/unit/imci-sick-child.test.js`: every row of every box; respiratory rate and age edges; the
14-day edges; the order of the HIV rules; the malaria-risk input has no default (an empty value
refuses); each conflict row; an empty form and each one-sign-short form return "incomplete",
never a green row.

## Staleness

CB14 *low* volatility (unchanged since 2014) but flagged: PD24 has already changed its pneumonia and
diarrhea parts, and WHO may republish. Review every 12 months.
