# spec-v1556 — Latin American envenomation, scorpion stings, and organophosphate atropine

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Seven tiles: five from Brazil's Ministry of Health (the only Latin American source the research
found with severity classes **and** antivenom vial counts), one scorpion grade for South Asia, and one
organophosphate atropine protocol.

## Owner decision before the Brazil tiles are built

Brazil's *Guia de Vigilância em Saúde* is **CC BY-NC-SA 4.0**. As with WHO material, the numbers
(class boundaries and vial counts) are facts and may be restated in our words with citation; the
table text is not copied. The site is free and MIT. This is the same posture as spec-v1540 §6, but it
is a different licensor, so the owner confirms it once. Recorded in spec-v1564.

The Brazilian antivenoms are public-sector products named by type (SABr, SACr, SAEla and so on), not
brands. The tiles use those type names and say the vial counts apply to Brazilian public antivenoms
only. Colombia's 2024 surveillance protocol and Brazil's 2024 identification guide carry **no vial
counts**; Peru's and PAHO's clinical guides were not read.

## Sources

| Key | Document | Licence |
|---|---|---|
| GVS24 | Brasil, Ministério da Saúde. *Guia de Vigilância em Saúde*, 6th ed., revised, vol. 3, 2024: snakebite (Quadro 1, Quadro 6), scorpion (Quadro 3), spider (Quadro 4) and Lonomia (Quadro 5) chapters. Tables adapted from the 2001 FUNASA manual | CC BY-NC-SA 4.0 |
| BAW11 | Bawaskar HS, Bawaskar PH. Scorpion antivenom plus prazosin vs prazosin alone for *Mesobuthus tamulus* sting. *BMJ* 2011;342:c7136 | CC BY-NC |
| EDD08 | Eddleston M et al. Management of acute organophosphorus pesticide poisoning. *Lancet* 2008;371:597–607 (PMC2493390) | Author manuscript |

---

## 1. `brazil-snakebite-antivenom` — Snakebite Severity and Antivenom Vials in Brazil (Ministério da Saúde)

**Question.** For a snakebite in Brazil, what is the Ministry's severity class and how many vials of
which antivenom?

**Inputs.** Type of accident: Bothrops (jararaca) / Lachesis (surucucu) / Crotalus (rattlesnake) /
Micrurus (coral snake) (required); findings, three-state each: local signs discreet / evident swelling
and bruising / intense; skin or mucosal bleeding; severe bleeding; low blood pressure or shock; kidney
failure or no urine; vagal signs (Lachesis: slow heart rate, low blood pressure, diarrhea); paralysis
signs discreet / evident; muscle pain and dark urine discreet / intense; low urine output.

**Logic (GVS24 Quadro 1).**

| Accident | Antivenom type | Mild | Moderate | Severe |
|---|---|---|---|---|
| Bothrops | SABr (or SABL, SABC) | 2–4 | 4–8 | 12 |
| Lachesis | SABL | none by definition | 10 | 20 |
| Crotalus | SACr (or SABC) | 5 | 10 | 20 |
| Micrurus | SAEla | every case treated as potentially severe | | 10 |

Class definitions, paraphrased: **Bothrops** mild = discreet local signs, minor skin or mucosal
bleeding, **or a clotting abnormality alone**; moderate = evident swelling and bruising, bleeding
without systemic compromise; severe = intense local signs, severe bleeding, shock, or kidney failure.
**Lachesis** moderate = local signs with or without bleeding, no vagal signs; severe = intense local
signs, intense bleeding, vagal signs. **Crotalus** mild = discreet paralysis signs, no muscle pain or
dark urine; moderate = evident paralysis with discreet muscle pain or dark urine; severe = evident
paralysis with intense muscle pain or dark urine and low urine output. At least 6 hours of observation
if no signs on arrival. No routine skin test.

**Output.** The class, the vial count or range, the antivenom type, and the observation rule.

**Trap.** A Bothrops bite with a normal-looking limb but an abnormal clotting time is already "mild,
give antivenom". The clotting time comes from tile 2.

## 2. `lee-white-clotting-time` — Lee-White Clotting Time After Snakebite (Brazil)

**Inputs.** Clotting time (whole minutes, 0–60, required); done per protocol (2 glass tubes 13 × 100
mm, 1 mL each, 37 °C water bath, read each minute from minute 5; yes / no).

**Logic (GVS24 Quadro 6).** **9 minutes or less normal; 10–30 prolonged; over 30 incoagulable.**

**Traps.** A different test from the 20WBCT (spec-v1555); never cross-applied. Whole minutes only
(9.5 has no row). The Ministry notes the result varies with blood volume, tilting, and bath
temperature, so "not per protocol" returns the reading with that caveat.

## 3. `brazil-scorpion-antivenom` — Scorpion Sting Severity and Antivenom in Brazil (Tityus)

**Inputs.** Local pain or tingling; one or more of nausea, vomiting, sweating, drooling, agitation,
fast breathing, fast heart rate; one or more of incessant vomiting, heavy sweating, heavy drooling,
prostration, seizure, coma, slow heart rate, heart failure, pulmonary edema, shock (three-state each);
age (years).

**Logic (GVS24 Quadro 3).** **Mild** (local pain and tingling only): no antivenom; lidocaine 2%
without epinephrine locally, or dipyrone 10 mg/kg. **Moderate** (intense local pain plus one or more
of the moderate list): **2–3 vials** SAEsc (or SAAr). **Severe** (moderate signs plus one or more of the
severe list): **4–6 vials**. Children stung: observe 6–12 hours; under 9 years, especially under 7,
carry the higher risk.

## 4. `brazil-spider-antivenom` — Spider Bite Severity and Antivenom in Brazil (Phoneutria, Loxosceles)

**Inputs.** Spider: Phoneutria (armed spider) / Loxosceles (brown spider) / Latrodectus (widow)
(required); signs for the chosen spider (three-state each); age and weight (for prednisone).

**Logic (GVS24 Quadro 4).**

- **Phoneutria:** mild (local pain, swelling, redness, sweating) no antivenom; moderate (intense pain,
  sweating, occasional vomiting, agitation, high blood pressure) **2–4 vials** SAAr; severe (heavy
  sweating, drooling, vomiting, priapism, shock, pulmonary edema) **5–10**.
- **Loxosceles:** mild (spider identified, a nonspecific lesion, no systemic signs) no antivenom;
  moderate (a suggestive or typical lesion, nonspecific systemic signs such as rash or fever, no
  hemolysis) **5 vials** SALox (or SAAr); severe (a typical lesion plus hemolysis) **10**. Moderate and
  severe also get **prednisone 40 mg/day (adults) or 1 mg/kg/day (children) for 5 days**.
- **Latrodectus:** supportive care only and at least 24 hours of observation. **Drug doses are not
  built**: GVS24 prints the child calcium gluconate dose as "1 mg/kg", which looks like a unit error
  against the adult 10–20 mL; it waits for the 2001 FUNASA primary (spec-v1564).

## 5. `brazil-lonomia-antivenom` — Lonomia Caterpillar Contact: Severity and Antivenom (Brazil)

**Logic (GVS24 Quadro 5).** Mild (local signs only, no bleeding, normal clotting): no antivenom;
moderate (abnormal clotting time, bleeding absent or skin and mucosa only): **5 vials** SALon; severe
(abnormal clotting time, internal bleeding, risk of death): **10 vials**. Contact without bleeding or
clotting abnormality: observe with tests for 24 hours. Southern Brazil and neighboring areas; built
last in this spec.

## 6. `scorpion-grade-india` — Indian Red Scorpion Sting Grade (Mesobuthus tamulus)

**Inputs.** Severe local pain with local sweating only; autonomic storm (vomiting, generalized
sweating, drooling, slow heart rate, extra beats, low blood pressure, priapism; or BP over 140/90,
heart rate over 120, cold hands and feet); pulmonary edema (breathing over 24 a minute, crackles at the
lung bases) with cold extremities; low blood pressure with warm extremities (three-state each).

**Logic (BAW11, "Evaluation of clinical grade").** **Grade 1:** severe local pain, mild local swelling
and sweating, no systemic signs. **Grade 2:** autonomic storm. **Grade 3:** cold extremities, fast
heart rate, low or high blood pressure, with pulmonary edema. **Grade 4:** fast heart rate and low
blood pressure, with or without pulmonary edema, with warm extremities.

**Output: the grade only. No prazosin dose.** The regimen comes from one open-label trial, not a
guideline; the paper's stop rule reads "until the extremities were cold", almost certainly a misprint
for warm, and cannot be shipped as written; other regimens seen are from secondary sources. The
Khattabi 2011 consensus classes are blocked (paywalled primary; the abstract's four classes conflict
with a three-class summary); spec-v1564.

## 7. `op-atropine-titration` — Organophosphate Poisoning: Atropine Dose Doubling and Infusion (Eddleston)

**Question.** What is the next atropine bolus, and once the patient is atropinized, what hourly
infusion?

**Inputs.** Adult (required; the protocol is adult-only and the tile refuses children); first bolus
chosen (1, 2, or 3 mg); boluses given so far (a list of mg); latest heart rate, systolic blood
pressure, chest (clear / crackles or wheeze), sweating (yes / no); pupils (optional).

**Logic (EDD08, panel 2).** Give 1–3 mg IV. After 5 minutes, check pulse, blood pressure, pupils,
sweating, and chest. If not improving, **give double the previous dose**, and review every 5 minutes.
Once parameters start improving, stop doubling; similar or smaller doses may follow. **Targets: heart
rate above 80, systolic above 80 mmHg, clear chest.** A fast heart rate is not a reason to stop.
Pupil size is not an early target; very wide pupils suggest too much. **Once stable, infuse 10–20% of
the total dose that achieved stability, per hour.** Supportive targets: systolic above 80, urine above
0.5 mL/kg/hour. EDD08 gives pralidoxime chloride 2 g IV over 20–30 minutes then 0.5–1 g/hour; WHO's
weight-based regimen (30 mg/kg, then 8 mg/kg/hour) was not read in a WHO primary and is not printed.

**Output.** The next bolus in mg, the cumulative total, whether targets are met, and the infusion range
in mg/hour once they are.

**Overlap.** Pairs with `peradeniya-op`, whose own note says it is not a dosing tool; each links the
other.

## Tests

`test/unit/latam-envenomation.test.js`: every Brazil class row and vial count; Bothrops mild on a
clotting abnormality alone; Lee-White at 9 and 10, 30 and 31 minutes; the Lonomia rows; each scorpion
grade; atropine doubling from 2 mg over four steps (2, 4, 8, 16), the stop-doubling rule, and the
10–20% infusion at a 30 mg total; children refused.

## Staleness

GVS24 *low* (unchanged tables since 2001). BAW11 and EDD08 *low*.
