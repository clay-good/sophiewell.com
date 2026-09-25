# spec-v1562 — Worms and mass drug administration: dose poles, infection intensity, schistosomiasis, filariasis, and hydatid cysts

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Six tiles. Mass drug administration (MDA) is how most people in endemic districts meet these drugs,
and it is dosed by **height**, not weight, with a measuring pole. Two tiles here are community
decisions, not individual ones, and say so in their names.

## Sources (read in full; the dose poles rendered and read visually)

| Key | Document | Licence |
|---|---|---|
| PC06 | WHO. *Preventive chemotherapy in human helminthiasis.* 2006. ISBN 92-4-154710-3. Annex 4, Table A4.1, Figure A4.1 | © WHO 2006 (facts only) |
| STH17 | WHO. *Guideline: preventive chemotherapy to control soil-transmitted helminth infections.* 2017 | CC BY-NC-SA 3.0 IGO |
| HC11 | WHO. *Helminth control in school-age children*, 2nd ed. 2011 (Table 5.1, from WHO TRS 912, 2002) | © WHO 2011 (facts only) |
| SCH22 | WHO. *WHO guideline on control and elimination of human schistosomiasis.* 2022 | CC BY-NC-SA 3.0 IGO |
| ARPZ25 | Merck KGaA. Application to the 2025 WHO Essential Medicines List Expert Committee: arpraziquantel (Tables 1–2) | Manufacturer document (facts) |
| LF17 | WHO. *Guideline: alternative mass drug administration regimens to eliminate lymphatic filariasis.* 2017 | CC BY-NC-SA 3.0 IGO |
| CE25 | WHO. *WHO guidelines for the treatment of patients with cystic echinococcosis.* June 2025 | CC BY-NC-SA 3.0 IGO |

---

## 1. `pc-dose-pole` — Mass Treatment Dose by Height or Age: Praziquantel, Ivermectin, Albendazole, Mebendazole, DEC (WHO)

**Question.** How many tablets does this person get at a mass drug administration?

**Inputs.** Drug (required); height (cm, required for praziquantel and ivermectin); age (years, for
albendazole, mebendazole, DEC); pregnant; breastfeeding within a week of birth; severely ill.

**Praziquantel, 600 mg tablets, at least 40 mg/kg (PC06 Table A4.1):**

| Height | Tablets |
|---|---|
| under 94 cm | not on the pole |
| 94–109 | 1 |
| 110–124 | 1½ |
| 125–137 | 2 |
| 138–149 | 2½ |
| 150–159 | 3 |
| 160–177 | 4 |
| 178 or more | 5 |

**Ivermectin, 3 mg tablets (PC06):** under 90 cm none; **90 to under 120, 1; 120 to under 141, 2; 141
to 159, 3; above 159, 4.** The printed table has gaps at 119–120 and 139–141 cm; the tile uses the
pole figure's cut points (90 / 120 / 141 / 159) as half-open bands and says so.

**By age:** albendazole 200 mg at 12–23 months, 400 mg from 2 years (STH17); mebendazole 500 mg from 12
months; **DEC (100 mg tablets): none under 2 years, 100 mg at 2–5, 200 mg at 6–15, 300 mg over 15.**

**Exclusions.** Ivermectin: under 90 cm (about 15 kg), pregnancy, breastfeeding within a week of birth,
severe illness. Praziquantel: the 2006 pole starts at 94 cm (about 4 years), but **SCH22 treats from 2
years**; under 94 cm the tile says "not on the pole; use a weight-based dose or arpraziquantel (tile
4)".

**Trap.** This pole is **not** the scabies height stick in `scabies-diagnosis-mda`, whose bands differ
(90 / 113 / 139 / 156). Each tile names its scheme on screen and never uses the other's.

## 2. `helminth-intensity` — Worm Infection Intensity From an Egg Count (Kato-Katz and Urine Filtration, WHO)

**Inputs.** Parasite: roundworm (Ascaris) / whipworm (Trichuris) / hookworm / S. mansoni / S.
haematobium (required); eggs per gram of stool, or eggs per 10 mL of urine (required); visible blood in
urine (for S. haematobium).

**Logic (HC11 Table 5.1).**

| Parasite | Light | Moderate | Heavy |
|---|---|---|---|
| Roundworm (eggs/g) | 1–4,999 | 5,000–49,999 | 50,000 or more |
| Whipworm | 1–999 | 1,000–9,999 | 10,000 or more |
| Hookworm | 1–1,999 | 2,000–3,999 | 4,000 or more |
| S. mansoni | 1–99 | 100–399 | 400 or more |
| S. haematobium (eggs/10 mL urine) | 1–49 | — | 50 or more, or visible blood in urine |

HC11 prints the heavy class as "more than 50,000" (and so on) after a moderate class ending at 49,999,
so exactly 50,000 falls in no class. **The tile treats each heavy class as "or more"** and says so; each
boundary is a test. S. haematobium has two classes only, and HC11 prints light as 1–50 and heavy as
over 50; the tile uses 1–49 and 50 or more and states the reading.

**Trap.** Eggs per gram = the slide count × 24 for the standard 41.7 mg template; that multiplier was
not read in this source, so the tile asks for eggs per gram directly and does not convert.

## 3. `schisto-community-treatment` — Community Decision: Schistosomiasis Mass Treatment Frequency (WHO 2022)

**Inputs.** Community prevalence (%, required); method: Kato-Katz / urine filtration / POC-CCA
(required); rounds already given and the response.

**Logic (SCH22 recs 1–3).** **Prevalence 10% or more:** yearly single-dose praziquantel for **everyone
from 2 years**, including adults, pregnant women after the first trimester, and breastfeeding women,
aiming for 75% coverage. **POC-CCA 30% counts as Kato-Katz 10%.** 10% or more with a poor response after
2 yearly rounds: twice a year. **Under 10%:** continue at the same or lower frequency, or test and
treat. Under 2 years: individual clinical decision only.

**Output.** The frequency and who is included. The name and the first line say this is a program
decision for a community, not a treatment decision for one person.

## 4. `arpraziquantel-dose` — Arpraziquantel for Preschool Children With Schistosomiasis (Tablets by Weight)

**Inputs.** Weight (kg, 5–30, required); species: S. mansoni / S. haematobium / both (required); age
(3 months to 6 years).

**Logic (ARPZ25 Tables 1–2).** 150 mg dispersible tablets. **S. mansoni (50 mg/kg):** 5.0–6.9 kg 2;
7.0–9.9 3; 10.0–12.9 4; 13.0–16.9 5; 17.0–22.9 7; 23.0–30.0 9. **S. haematobium (60 mg/kg):** 5.0–5.9
2; 6.0–7.9 3; 8.0–10.9 4; 11.0–13.9 5; 14.0–18.9 7; 19.0–23.9 9; 24.0–30.0 11. **Both species: use the
S. haematobium dose.** Do not split; disperse in water after a meal.

**Build condition.** ARPZ25 is a manufacturer's application, not WHO guidance. The tile ships only after
the European SmPC is read to confirm the bands and the age and weight floors (5 kg from 3 months to 2
years; 8 kg from 2 to 6 years per the EMA summary, not yet read in the SmPC), and after confirming
whether the 2025 Essential Medicines List added it. *High* volatility.

## 5. `lf-mda-regimen` — Which Filariasis Mass Treatment Regimen for This Area and This Person? (WHO 2017)

**Inputs.** Area: onchocerciasis co-endemic (yes / no, required); loiasis co-endemic (yes / no,
**required; never defaulted**, because DEC is dangerous there); program status: not started or fewer
than 4 effective DA rounds / failed a transmission survey despite coverage / resurgence after stopping.
Person: age, height, pregnant, severely ill, history of seizures or neurocysticercosis.

**Logic (LF17 Table 1, Box 1).** No onchocerciasis, no loiasis: **DA** yearly (DEC 6 mg/kg plus
albendazole 400 mg); **IDA** (ivermectin 200 µg/kg plus DEC plus albendazole) preferred in LF17's three
special settings. Onchocerciasis co-endemic: **IA** yearly (ivermectin 150–200 µg/kg plus albendazole);
IDA not used where IA is used. Loiasis co-endemic without prior ivermectin: **albendazole 400 mg twice a
year.** **DEC is contraindicated wherever onchocerciasis or loiasis is co-endemic.** Not eligible: DA,
pregnancy, under 2 years, severely ill; IA and IDA, pregnancy, under 90 cm, severely ill (and in IDA
settings, children 2–4 years and anyone under 90 cm get DA); albendazole alone, first trimester, under
2 years, seizures or neurocysticercosis history.

**Output.** The area's regimen and the person's eligibility, with tablet counts from tile 1. "Effective
round" means 65% or more coverage.

## 6. `cystic-echinococcosis-stage` — Hydatid Cyst of the Liver: WHO Stage and First-Line Treatment (2025)

**Inputs.** Organ (liver / lung / other); ultrasound stage (CE1, CE2, CE3a, CE3b, CE4, CE5, or CL) with
the descriptor shown for each; largest diameter (cm); complicated (yes / no); communication with the
bile ducts; multiple cysts or several organs; facility tier 1–4 (defined on the control); weight (kg).

**Stages (CE25).** CE1 single cyst with a double wall (active); CE2 honeycomb of daughter cysts
(active); CE3a detached inner layer, "water lily" (transitional); CE3b daughter cysts in a solid matrix
(active); CE4 solid "ball of wool" (inactive); CE5 as CE4 with a calcified wall (inactive); CL a simple
cyst without a double wall, **not a CE stage**.

**Liver, uncomplicated (CE25):**

| Stage | Size | First-line |
|---|---|---|
| CE1 or CE3a | under 5 cm | albendazole, any tier |
| CE1 or CE3a | 5–10 cm | PAIR plus albendazole (tier 3–4); not with bile duct communication |
| CE1 or CE3a | over 10 cm | percutaneous treatment, PAIR preferred, plus albendazole (tier 3–4) |
| CE2 or CE3b | 5 cm or less | albendazole alone |
| CE2 or CE3b | over 5 cm | surgery plus albendazole |
| CE4 or CE5 | any | watch and wait |
| Multiple or several organs | any | individualized |

Lung, uncomplicated, under 5 cm: surgery (tier 4), no albendazole beforehand. **Albendazole 10–15
mg/kg/day in 2 doses, up to 400 mg twice daily, with a fatty meal, continuously for 3–6 months**;
imaging at 3–6 months, then yearly for at least 5 years.

**Traps.** CE25's text uses "under 5", "5–10", "over 10" for CE1/CE3a while its figure says "over 5 and
under 10"; a cyst of exactly 5 or 10 cm follows the text, is a test, and the answer says so. Staging
needs trained ultrasound; the tile is for district hospitals and says so in its lede.

## Tests

`test/unit/helminths-mda.test.js`: every pole edge for both drugs including 93/94, 89/90, 119/120,
140/141, 159/160 cm; the age tables; each intensity boundary with the "or more" reading; schisto
community decisions at 9.9/10.0% and the POC-CCA equivalence; arpraziquantel bands; each LF regimen
branch, and DEC refused when loiasis is unassessed; each CE row at 4.9/5.0/10.0/10.1 cm.

## Staleness

PC06, HC11, LF17 *low*. SCH22 *low*. ARPZ25 *high*. CE25 *moderate* (new).
