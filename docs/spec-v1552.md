# spec-v1552 — Malaria prevention and relapse: primaquine, G6PD, IPTp, and seasonal chemoprevention

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four tiles, with chloroquine folded into the vivax tile.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| MAL26 | WHO. *WHO guidelines for malaria*, 10 September 2026, doi:10.2471/B09879 | CC BY-NC-SA 3.0 IGO |
| VFG26 | WHO. *Malaria case management: P. vivax malaria: a field guide.* February 25, 2026 | CC BY-NC-SA 3.0 IGO |
| PQB15 | WHO. *Policy brief on single-dose primaquine as a gametocytocide in P. falciparum malaria.* 2015 | CC BY-NC-SA 3.0 IGO |
| SMC23 | WHO. *Seasonal malaria chemoprevention with SP+AQ in children: a field guide*, 2nd ed. 2023 | CC BY-NC-SA 3.0 IGO |

## Conflicts

| # | Item | Older | Newer | Rule |
|---|---|---|---|---|
| C1 | Single low-dose primaquine exclusions | T15, PQB15: pregnant women, infants under 6 months, women breastfeeding infants under 6 months. MAL25: pregnant women only | MAL26: pregnant women, **infants under 1 month**, women breastfeeding infants under 1 month | MAL26; pin the version |
| C2 | Radical cure age exclusion | MAL26 2015 practical text still says "6 months" | MAL26 2024 recommendation: under 1 month | Use the 2024 recommendation; state the internal inconsistency |
| C3 | Qualitative G6PD non-deficient | VFG26 flowchart: 0.5 mg/kg daily for 14 days only | MAL26 text: 14 days, or 7 days | MAL26; disclose |

---

## 1. `primaquine-single-low-dose` — Single Low-Dose Primaquine to Stop Falciparum Transmission (WHO 2026)

**Question.** What single dose of primaquine goes with the ACT for this patient, and is it
indicated here?

**Inputs.** Weight (kg, required); pregnant (yes / no, required); age (months or "under 1 month");
breastfeeding an infant under 1 month (yes / no, required); low-transmission area (yes / no,
required).

**Logic (MAL26 §5.2.1.3, p. 180; 2026 recommendation).** 0.25 mg/kg base once on day 1 with the ACT,
**in low-transmission areas only**; G6PD testing is not required. **Not recommended in moderate to
high transmission.** Excluded: pregnancy, infants under 1 month, women breastfeeding infants under 1
month.

| Weight | Dose (mg base; 7.5 mg tablet) |
|---|---|
| 5 to under 25 kg (T15: 10 to under 25) | 3.75 mg |
| 25 to under 50 kg | 7.5 mg |
| 50 to 100 kg | 15 mg |

Under 5 kg or over 100 kg: outside the table, refused. MAL26 footnote: dosing under 10 kg is limited
by available tablet sizes. No WHO age-band table exists; none is built.

## 2. `vivax-radical-cure` — Primaquine or Tafenoquine for Vivax Relapse, by G6PD Result (WHO 2026)

**Question.** Given this G6PD result, which regimen to prevent vivax relapse may this patient
receive, and at what dose?

**Inputs (all required, no defaults).** Weight (kg); G6PD test type (semi-quantitative / qualitative
/ none); result (semi-quantitative: above 70% / 30–70% / below 30%; qualitative: deficient /
not deficient); sex; pregnant; breastfeeding an infant under 1 month; age (years; tafenoquine needs 2
or more); blood-stage drug (chloroquine / ACT); in South America (yes / no; tafenoquine is
recommended there only); region for the low-dose option (Indian subcontinent or the Americas: yes /
no).

**Logic (MAL26 §5.2.1.6–5.2.1.7, pp. 196–209; VFG26 flowchart and Table 3).**

- **Primaquine, high total dose 7 mg/kg (2024, strong):** 0.5 mg/kg/day for 14 days, **or** 1
  mg/kg/day for 7 days. The 7-day regimen only with 70% G6PD activity or more (semi-quantitative
  test needed). **Low total dose 3.5 mg/kg** (0.5 mg/kg/day for 7 days, or 0.25 mg/kg/day for 14
  days) "might be used" in the Indian subcontinent and the Americas.
- **By test:**
  - Qualitative, not deficient: primaquine 0.5 mg/kg/day for 14 or 7 days (C3). No tafenoquine, no
    1 mg/kg regimen.
  - Qualitative, deficient: consider **0.75 mg/kg once a week for 8 weeks**, under medical
    supervision.
  - Semi-quantitative above 70%: tafenoquine (if eligible), or primaquine 1 mg/kg × 7 days, or 0.5
    mg/kg × 14 days.
  - 30–70%: no tafenoquine; primaquine 0.5 mg/kg/day for 14 days, or 7 days, "with precautions".
  - Below 30%: 0.75 mg/kg weekly for 8 weeks, supervised.
  - **No test: the tile gives no regimen.** MAL26 makes it a risk-benefit judgement and says
    tafenoquine should not be used; the tile says exactly that. A blank result is never read as
    normal.
- **Women without a quantitative test** are treated as possibly intermediate and given the 14-day
  regimen (MAL26 p. 209).
- **Tafenoquine (2024, conditional; South America; 2 years or more; 70% or more G6PD; with
  chloroquine only; not pregnant or breastfeeding):** over 10 to 20 kg 100 mg (2 × 50 mg
  dispersible); over 20 to 35 kg 200 mg (4 × 50 mg); over 35 kg 300 mg (2 × 150 mg); on day 1 or 2
  of chloroquine. **Exactly 70% is not eligible** (MAL26 p. 196: contraindicated at 70% or below).
- **Exclusions:** pregnancy, infants under 1 month, breastfeeding an infant under 1 month (C2).
- **Chloroquine blood stage (MAL26 §5.2.1.5):** total 25 mg base/kg: 10 mg/kg day 1, 10 mg/kg day 2, 5
  mg/kg day 3.

**Output.** The allowed regimens, mg base per dose (weight × mg/kg), number of doses, total mg/kg,
and the chloroquine course if selected. No adult maximum is stated in MAL26 or VFG26; the tile
invents none and discloses weights over 100 kg.

## 3. `iptp-sp-schedule` — Is an IPTp-SP Dose Due Today? Malaria Prevention in Pregnancy (WHO)

**Inputs.** Gestational age (weeks + days, required); weeks since the last SP dose, or "no previous
dose" (required, explicit); on cotrimoxazole (yes / no, required); sulfa allergy; severe acute
illness; able to take oral medicine; SP-component drug in the last 30 days; folic acid dose
(0.4 mg / 5 mg / none).

**Logic (MAL26 §4.2.1, pp. 103–104).** For all pregnancies in endemic areas: start as early as
possible in the second trimester and **not before week 13**; give at each scheduled antenatal contact
until delivery, **at least one month apart**; aim for at least three doses. Dose: 3 tablets of
500/25 mg (1,500/75 mg), directly observed. **Not given:** before week 13; severe acute illness;
unable to take oral medicine; an SP-component drug in the last 30 days; SP allergy; **any sulfa
drug, including cotrimoxazole**. Folic acid 5 mg a day counteracts SP; 0.4 mg does not. **New in
2026:** DHA-PPQ IPTp for women with HIV is not recommended, so a woman on cotrimoxazole has no IPTp
option in MAL26; the answer says so.

**Output.** Due / not due until [date] / not to be given, with the reason.

**Edges.** 12+6 vs 13+0 weeks; "one month" vs "30 days" both appear, so the tile uses 4 weeks and
says so.

## 4. `smc-spaq-dose` — Seasonal Malaria Chemoprevention Dose (SP + AQ) by Age (WHO)

**Inputs.** Age (months, required); fever or acute illness; on cotrimoxazole; SP, AQ or an ACT in the
last 28 days; allergy (three-state each); weight (optional, for children 60 months or more).

**Logic (SMC23 §2.5.1, p. 3).** 3 to under 12 months: **one** SP 250/12.5 mg tablet plus **three** AQ
75 mg base tablets (SP and AQ on day 1, AQ on days 2 and 3). 12–59 months: one SP 500/25 mg plus three
AQ 150 mg. 60 months or more: no blister pack; by weight SP 25/1.25 mg/kg once, AQ 10 mg/kg daily
for 3 days. Cycles 28 days apart; MAL26 (2022) says 3–4 monthly cycles in shorter seasons, up to 6.
Vomited within 30 minutes: rest 10 minutes, then a replacement dose. Contraindications stop the dose.

**Traps.** The source gives a **whole** 250/12.5 tablet for infants (not a half), and **75 mg** AQ
(no "76.5 mg" appears in any source). MAL26 prefers weight-based dosing where weight is known; the
tile shows the pack and, if weight is entered, the mg/kg achieved.

## Tests

`test/unit/malaria-prevention.test.js`: SLD primaquine band edges and each exclusion; every G6PD
branch including "no test" and exactly 70% and 30%; tafenoquine at 10.0/10.1, 20.0/20.1, 35.0/35.1
kg; IPTp at 12+6 and 13+0 weeks and the 4-week spacing; SMC at 2.9/3.0 and 11.9/12.0 and 59.9/60.0
months.

## Staleness

MAL26 *high*. VFG26 and SMC23 *moderate*.
