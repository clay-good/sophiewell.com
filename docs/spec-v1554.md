# spec-v1554 — HIV: staging, advanced disease, cotrimoxazole, cryptococcal screening, infant testing, and ARV bands

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Seven tiles. The catalog's HIV tiles are exposure and US tools (`npep-2025`, `hiv-pep-occupational`,
`prep`, `vacs-index`). Two tiles here carry the program's highest volatility and are built last.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| SURV26 | WHO. *Consolidated guidance for national routine surveillance: updated HIV case definitions.* July 2026, Annex 1 (clinical staging, adapted from 2016) | CC BY-NC-SA 3.0 IGO |
| AHD25 | WHO. *Guidelines on the management of advanced HIV disease.* December 2025 | CC BY-NC-SA 3.0 IGO |
| HIV21 | WHO. *Consolidated guidelines on HIV prevention, testing, treatment, service delivery and monitoring.* 2021 | CC BY-NC-SA 3.0 IGO |
| HIVCM25 | WHO. *Updated recommendations on HIV clinical management.* December 2025 | CC BY-NC-SA 3.0 IGO |
| CRYPTO22 | WHO. *Guidelines for diagnosing, preventing and managing cryptococcal disease.* 2022 | CC BY-NC-SA 3.0 IGO |
| ARV26 | WHO. *Optimal antiretroviral dosing guidance: paediatric populations.* May 6, 2026, corrigendum June 18, 2026, doi:10.2471/B09711 | CC BY-NC-SA 3.0 IGO |

The 2007 staging booklet is "All rights reserved"; SURV26 restates the same list under CC and is the
source used.

## Changes the research found against common assumptions

- **Advanced HIV disease is now CD4 200 or less** (it was below 200), and clinical stage is a
  fallback only where CD4 testing is unavailable (AHD25).
- **Pediatric ARV bands changed in 2026:** 10–<15 and 15–<20 kg replaced 10–<14 and 14–<20.
- **Zidovudine was removed** from infant prophylaxis in 2025.
- **Pediatric cotrimoxazole is dosed by weight band**; the age table often quoted is in no current
  source and is not built.

---

## 1. `who-hiv-staging` — WHO Clinical Stage of HIV (Adults, Adolescents and Children)

**Question.** Which WHO clinical stage do this person's conditions put them in?

**Inputs.** Age group: 15 years or more / under 15 (required); a checklist of every condition in
SURV26 Annex 1 for that group, each three-state; for children under 5, WHZ and MUAC (optional, from
`who-growth-zscore`); hemoglobin, neutrophils, platelets (optional).

**Logic.** The **highest stage** with any condition present. Stage lists as in SURV26 Annex 1, encoded
in full for both age groups (adults: stage 2 includes moderate unexplained weight loss under 10%,
recurrent respiratory infections, herpes zoster, angular cheilitis, recurrent oral ulcers, papular
pruritic eruption, fungal nail infection, seborrheic dermatitis; stage 3 includes severe weight loss
over 10%, chronic diarrhea over 1 month, persistent fever over 1 month, persistent oral candidiasis,
oral hairy leukoplakia, pulmonary TB, severe bacterial infections, acute necrotizing ulcerative
stomatitis, gingivitis or periodontitis, and unexplained anemia below 8 g/dL, neutropenia below
0.5 × 10⁹/L or thrombocytopenia below 50 × 10⁹/L; stage 4 the AIDS-defining list; the child lists
with their growth criteria). Regional additions (talaromycosis in Asia, rectovaginal fistula in
southern Africa, reactivated trypanosomiasis in Latin America) are included and labelled.

**Output.** The stage, the conditions that set it, and, where CD4 is not available, that stage 3 or 4
counts as advanced HIV disease (tile 2).

**Stage 1 is printed only when every listed condition is assessed absent.** "Not assessed" items
cap the answer at "at least stage N".

**Traps.** Adult stage 3 "severe bacterial infections" include pneumonia; the child stage 4 recurrent
severe bacterial infections exclude pneumonia. Persistent fever: SURV26 gives no temperature for
adults (2007 said above 37.6 °C); children above 37.5 °C.

## 2. `who-advanced-hiv` — Is This Advanced HIV Disease, and What Package Applies? (WHO 2025)

**Inputs.** Age (years); CD4 (cells/mm³, or "not available"); WHO stage (from tile 1, if no CD4); for
under 5s: on ART more than 1 year and clinically stable (yes / no).

**Logic (AHD25).** 5 years or more: **CD4 200 or less**. No CD4 available: stage 3 or 4 at
presentation (conditional). **Under 5: all children have advanced disease at presentation, unless on
ART for more than a year and clinically stable.**

**Output.** Yes or no, and the package with each trigger (AHD25 table): TB screening for all; CrAg
screening at CD4 below 100 (strong) or below 200 (conditional), adults and adolescents only;
cotrimoxazole below 350 or stage 3–4 (tile 3); TPT for all (3HP preferred); rapid ART start
(deferred if meningitis symptoms).

**Edge.** CD4 exactly 200 is advanced disease under 2025 and was not under 2021; the answer says so.

## 3. `who-cotrimoxazole` — Cotrimoxazole Prophylaxis: Who Gets It and the Dose by Weight (WHO 2026)

**Inputs.** Age; weight (kg, for children); living with HIV / HIV-exposed infant; CD4; WHO stage;
malaria or severe bacterial infection prevalence high (yes / no, required for adults); active TB;
on ART and stable, suppressed (for stopping).

**Eligibility (HIV21 §6.3).** Adults: stage 3 or 4 and/or **CD4 350 or less**; in high malaria or
bacterial-infection settings, regardless of CD4. Children and adolescents with HIV: all (priority
under 5, stage 3–4 or CD4 350 or less); continue into adulthood in high-prevalence settings; may stop
at 5 years or more in low-prevalence settings if stable, suppressed 6 months, CD4 over 350.
HIV-exposed infants: from 4–6 weeks until HIV is excluded after breastfeeding ends. Anyone with
active TB: regardless of CD4.

**Dose, once daily (ARV26 Table 6).**

| Formulation | 3 to under 6 kg | 6 to under 10 | 10 to under 15 | 15 to under 20 | 20 to under 25 | 25 to under 35 |
|---|---|---|---|---|---|---|
| Suspension 200/40 mg per 5 mL | 2.5 mL | 5 mL | 5 mL | 10 mL | 10 mL | — |
| Dispersible 100/20 mg | 1 | 2 | 2 | 4 | 4 | — |
| Scored 400/80 mg | — | ½ | ½ | 1 | 1 | 2 |
| Scored 800/160 mg | — | — | — | ½ | ½ | 1 |

Adults: 800/160 mg once daily (inferred from the 25–<35 column and AHD25's text; stated as such).
Q-TIB (isoniazid 300 + cotrimoxazole 800/160 + pyridoxine 25) prints as an alternative for PLHIV on
TPT.

## 4. `crag-screen-fluconazole` — Cryptococcal Antigen Screening and Fluconazole (WHO)

**Inputs.** Age (years, required; not for children under 10); CD4; CrAg result (positive / negative
/ not available); meningitis symptoms; weight (kg, for adolescents).

**Logic (AHD25; CRYPTO22).** Screen before starting or restarting ART at **CD4 below 100** (strong);
may be considered **below 200**. No routine screening under 10 years. **CrAg positive → assess for
meningitis, lumbar puncture if feasible.** Positive without meningitis → pre-emptive fluconazole
**800–1,200 mg/day for adults, 12 mg/kg/day for adolescents, for 2 weeks**, then consolidation
(**800 mg/day adults**, 6–12 mg/kg/day to a maximum of 800 mg for children and adolescents, **8
weeks**) and maintenance (200 mg/day adults, 6 mg/kg/day adolescents). No screening available:
fluconazole prophylaxis at CD4 below 100, and consider below 200.

**Trap.** AHD25's executive summary misprints the conditional threshold as "above 200"; its body says
below 200, which the tile uses. The prophylaxis dose was not extracted; the tile prints the
prophylaxis recommendation without a dose until read.

## 5. `infant-hiv-test-schedule` — When Is the Next HIV Test Due for an HIV-Exposed Infant? (WHO)

**Inputs.** Infant age (weeks or months, required); breastfeeding (yes / no) and date stopped; results
so far (birth NAT, 4–6 week NAT, 9-month NAT, antibody tests).

**Logic (HIV21 Fig. 2.7, Box 2.5).** Consider NAT at birth (0–2 days). NAT at **4–6 weeks**. NAT at
**9 months** for every exposed infant, even after earlier negatives. **Final antibody test at 18
months, or 3 months after breastfeeding ends, whichever is later.** Positive NAT: start ART now and
repeat NAT to confirm; if the second is negative, a third before stopping ART. Point-of-care NAT is
recommended under 18 months. Over 18 months an antibody test diagnoses infection.

**Output.** The next test, its type, and its due date from the birth date.

## 6. `infant-arv-prophylaxis` — Infant HIV Prophylaxis: Risk Group and Nevirapine Dose (WHO 2025) — built late, high volatility

**Inputs.** Mother's ART duration at delivery; maternal viral load in the 4 weeks before delivery;
HIV acquired in pregnancy or breastfeeding; mother first identified after delivery; breastfeeding;
infant age and weight.

**Logic (HIVCM25 §4.1.1).** **High risk** if the mother had under 4 weeks of ART at delivery, a viral
load over 1,000 copies/mL in the 4 weeks before delivery, acquired HIV in pregnancy or breastfeeding,
or was identified after delivery. Not high risk: **6 weeks of nevirapine** (dolutegravir or
lamivudine alternatives). High risk: **3 drugs for 6 weeks**, abacavir/lamivudine plus dolutegravir
preferred; then, if breastfeeding, a single drug until maternal suppression or weaning. Zidovudine
is no longer an option.

**Nevirapine prophylaxis doses (ARV26 Table 5):** birth to 4 weeks 1.5 mL daily of 10 mg/mL; 4–6
weeks ½ × 50 mg or 1.5 mL; 6 weeks–6 months ½ or 2 mL; 6–9 months ½ or 3 mL; 9–24 months 1 or 4 mL.
Lamivudine and dolutegravir alternatives by weight band. **Prophylaxis doses differ from treatment
doses**; the tile prints "prophylaxis" on every line.

## 7. `who-pediatric-arv-dose` — Pediatric ARV Doses by Weight (WHO 2026) — built last, highest volatility

**Inputs.** Weight (kg, required); age (weeks, required; neonatal tables under 4 weeks); regimen and
formulation; on rifampicin (yes / no).

**Bands (ARV26 Tables 1–3, 7).** 3 to under 6, 6 to under 10, 10 to under 15, 15 to under 20, 20 to
under 25 kg (pediatric tablets); 25 to under 35 kg (adult tablets). Once-daily rows as read:
abacavir/lamivudine/dolutegravir 60/30/5 dispersible 1 / 3 / 4 / 5 / 6 (from 4 weeks and 3 kg; not in
neonates); abacavir/lamivudine 120/60 dispersible ½ / 1½ / 2 / 2½ / 3, then adult 600/300 × 1;
dolutegravir 5 mg dispersible 1 / 3 / 4 / 5 / 6; dolutegravir 10 mg scored ½ / 1½ / 2 / 2½ / 3;
dolutegravir 50 mg film-coated from 20 kg; TLD from 30 kg. Twice-daily rows read with confidence:
lopinavir/ritonavir 100/25 tablets and 40/10 granules, zidovudine/lamivudine 60/30 (treatment only).
With rifampicin, dolutegravir twice daily at the same counts, continued 2 weeks after rifampicin
ends. Neonates (term, 2 kg or more): 0–<2 weeks abacavir/lamivudine 120/60 ¼ tablet and
dolutegravir 5 mg 1 tablet every other day; 2–<4 weeks the same daily.

**Not built.** The abacavir/lamivudine **twice-daily** row did not extract unambiguously (a
corrigendum touched it); excluded until read from the page image.

**Build condition.** This tile ships only with the edition date in its title line, a *high* staleness
row (6-month review), and a band snapshot test. If the owner prefers, it is deferred entirely and the
tile links to WHO's published table instead; spec-v1564 records the decision.

## Tests

`test/unit/who-hiv.test.js`: staging picks the highest stage and caps on unassessed items; CD4 200 and
201; the under-5 exception; every cotrimoxazole band edge; CrAg thresholds 99/100 and 199/200 and the
under-10 refusal; the EID due dates including the "whichever is later" rule; the high-risk
definitions; ARV band edges and the rifampicin doubling.

## Staleness

SURV26 *low*. AHD25, HIVCM25 *moderate*. ARV26 *high*.
