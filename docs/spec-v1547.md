# spec-v1547 — First-referral hospital: ETAT triage, shock fluids, glucose, and oxygen

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four new tiles and two modes on existing tiles. For the district hospital's outpatient door and
children's ward.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| ETAT16 | WHO. *Updated guideline: paediatric emergency triage, assessment and treatment: care of critically-ill children.* 2016. ISBN 978-92-4-151021-9 | All rights reserved |
| PB13 | WHO. *Pocket book of hospital care for children*, 2nd ed. 2013 | All rights reserved |
| OX16 | WHO. *Oxygen therapy for children: a manual for health workers.* 2016. ISBN 978-92-4-154955-4 | All rights reserved |
| PD24 | WHO. *Guideline on management of pneumonia and diarrhoea in children up to 10 years.* 2024 | CC BY-NC-SA 3.0 IGO |

The 2005 ETAT course manual was not read; PB13 carries its triage content.

## Conflicts

| # | Item | Older | Newer | Rule |
|---|---|---|---|---|
| C1 | Fluid bolus in shock | PB13 Chart 7: 20 mL/kg as fast as possible, repeat 10–20 mL/kg | ETAT16 rec 2.4 (after the FEAST trial): only when **all three** signs are present; 10–20 mL/kg over 30–60 minutes | ETAT16 supersedes; one sentence names PB13 |
| C2 | Shock in severe acute malnutrition | PB13 Chart 8: 15 mL/kg over 1 hour | ETAT16: 10–15 mL/kg over the first hour | Implement ETAT16; show the PB13 weight table as a check |
| C3 | SpO2 threshold for oxygen | PB13, ETAT16: below 90% | OX16: 90% or below at altitude up to 2,500 m; 87% or below may be used above 2,500 m | **Edition switch** with altitude as a required input for OX16 |
| C4 | Nasal flow, older children | OX16: 1–4 L/min | ETAT16 rec 1.3: 2–4 L/min | Show both, labelled |

---

## 1. `etat-triage` — Emergency Triage of a Sick Child at Hospital (WHO ETAT)

**Question.** Does this child need emergency treatment now, priority assessment, or can they wait in
the queue?

**Inputs (three-state each).** Emergency signs (ABCD): obstructed or absent breathing; central
cyanosis; severe respiratory distress; shock (cold hands **with** capillary refill over 3 seconds
**and** a weak, fast pulse); coma (AVPU "P" or "U") or convulsing now; in a child with diarrhea,
severe dehydration (two of lethargy, sunken eyes, very slow skin pinch, unable to drink or drinks
poorly). Priority signs (PB13's "3TPR-MOB"): tiny infant under 2 months; temperature very high;
trauma or another urgent surgical condition; severe pallor; poisoning; severe pain; respiratory
distress; restless, continuously irritable, or lethargic; referral marked urgent; malnutrition
(visible severe wasting); edema of both feet or face; major burns.

**Logic (PB13 pp. 2–6, Chart 2).** Any emergency sign → **emergency** (treat now; draw blood glucose,
malaria test, hemoglobin). Else any priority sign → **priority** (front of the queue). Else → **non
urgent**. When an emergency sign is present, the tile stops asking priority signs, as the chart
says.

**Output.** Category and the matching treatment tiles in order: airway and oxygen (tile 4), shock
fluids (tile 2), glucose (tile 3), convulsions (`imci-prereferral-injectables` diazepam), and the
malnutrition modifications.

**Edges and traps.** "Temperature very high" has **no number** in PB13; the tile does not invent
one and asks the sign as the chart does. Shock needs all three signs together; one or two is not
shock (feeds tile 2). An emergency is printed even if other signs are unassessed; "non urgent" is
printed only when every sign is assessed absent.

**Overlap.** `start-triage` and `jumpstart-triage` are mass-casualty; `pews` scores inpatient
deterioration; `field-triage` is prehospital. None is ETAT.

## 2. `etat-shock-fluids` — Should This Child Get a Fluid Bolus? (WHO ETAT 2016)

**Question.** Should this child get a rapid fluid bolus, and how much?

**Inputs.** Cold extremities; capillary refill over 3 seconds; weak and fast pulse (each three-state,
required); severe acute malnutrition (yes / no, required); severe anemia (hemoglobin below 5 g/dL or
hematocrit below 15%; value or yes / no); severe dehydration from diarrhea (yes / no); weight (kg,
required for volumes).

**Logic (ETAT16 recs 2.1–2.6, pp. 2–3).**

- **One or two signs only → no rapid infusion.** Maintenance fluids; prioritize and reassess within
  1 hour. The rec 2.2 list prints as a warning: rapid fluid is particularly harmful without shock in
  severe febrile illness, severe pneumonia, severe malaria, meningitis, severe malnutrition, severe
  anemia, heart failure with pulmonary edema, congenital heart disease, kidney failure, and DKA.
- **All three → shock:** isotonic crystalloid 10–20 mL/kg over 30–60 minutes; reassess; if still in
  shock, a further 10 mL/kg over 30 minutes. Stop if there are signs of fluid overload, heart
  failure, or neurological deterioration.
- **Shock with severe anemia:** blood transfusion as early as possible; other IV fluid for
  maintenance only.
- **Shock with severe acute malnutrition:** 10–15 mL/kg over the first hour. If better, oral or
  nasogastric maintenance only. If not better after 1 hour, blood 10 mL/kg slowly over at least 3
  hours. Detail (fluid choice, the ReSoMal step) in `sam-emergency-fluids`.
- **Severe dehydration** with diarrhea follows Plan C (`imci-ors-plan`); ETAT16 did not re-address
  it, and the tile says so.

**Output.** Bolus yes or no, mL and minutes at the entered weight, the reassessment instruction, and
the stop signs.

**Overlap.** `peds-resus` covers PALS-type resuscitation; linked, with a note that the two advise
differently on boluses and this tile is for settings following WHO.

## 3. `who-child-hypoglycemia` — Low Blood Sugar in a Child: Threshold and 10% Glucose Dose (WHO)

**Question.** Is this child's blood glucose low by WHO's threshold, and how much 10% glucose?

**Inputs.** Blood glucose (mmol/L or mg/dL; or "cannot measure"); severe acute malnutrition (yes /
no, required); weight (kg) or age; conscious and able to swallow (yes / no).

**Logic (PB13 Chart 10, p. 16).** Treat if glucose is **below 2.5 mmol/L (45 mg/dL)** in a
well-nourished child, **below 3 mmol/L (54 mg/dL)** with severe malnutrition, or if glucose cannot be
measured. **10% glucose 5 mL/kg IV rapidly.** Band check column: under 2 months (under 4 kg) 15 mL;
2–<4 months (4–<6 kg) 25 mL; 4–<12 months (6–<10 kg) 40 mL; 1–<3 years (10–<14 kg) 60 mL; 3–<5 years
(14–<19 kg) 80 mL. Recheck at 30 minutes and repeat if still low. Making 10% from 50%: 1 part plus 4
parts sterile water, or 1 part plus 9 parts 5% glucose. No IV: a level teaspoon of sugar moistened
under the tongue, repeated every 10–20 minutes. Able to swallow: breast milk, or 30–50 mL of milk or
sugar water (4 level teaspoons, 20 g, in 200 mL) (CB14 p. 18).

**Output.** Low or not, the mL of 10% glucose at the weight, how to make it, and the recheck time.

**Edges.** The neonatal threshold and the 2 mL/kg neonatal bolus are different and live in
`newborn-hypoglycemia` (spec-v1559); this tile refuses under 2 months and links there.

**Overlap.** `hypoglycemia-level` (ADA adult levels) and `gir` (neonatal infusion rate) are
different questions.

## 4. `who-child-oxygen` — When to Start Oxygen in a Child, and What Flow (WHO)

**Question.** Does this child need oxygen, and through what device at what flow?

**Inputs.** SpO2 % (or "no oximeter"); edition ("ETAT 2016" / "Oxygen therapy manual 2016",
required); altitude above 2,500 m (yes / no, required for the manual); other emergency signs
besides respiratory distress (three-state); age group (newborn / infant / older child); without an
oximeter: central cyanosis, unable to drink because of breathing difficulty, severe lower chest
indrawing, respiratory rate 70 or more, grunting with every breath in a young infant, depressed
mental state (three-state each).

**Logic.**

- **ETAT16 recs 1.1–1.5:** respiratory distress only → oxygen below 90%. Other emergency signs →
  oxygen below 94%. Stop when no emergency signs remain and SpO2 is 90% or more on room air. Nasal
  prongs 0.5–1 L/min for newborns, 1–2 L/min infants, 2–4 L/min older children, or a face mask
  above 4 L/min, aiming for 94% or more. Above 4 L/min by nasal route for more than 1–2 hours needs
  heated humidification.
- **OX16 recs 3–5:** oxygen at SpO2 **90% or below** up to 2,500 m; **87% or below** may be used above
  2,500 m; during resuscitation with emergency signs, below 94%. Standard nasal flow 1–4 L/min for
  older children.
- **No oximeter (PB13 p. 312):** any listed clinical sign → give oxygen.

**Output.** Oxygen yes or no, the threshold used and its edition, the device and flow range, and
when to stop.

**Edges.** SpO2 90 exactly: yes under OX16 ("90% or below"), no under ETAT16 ("below 90%"). This is
the one-glyph conflict the edition switch exists for; it is a named test.

**Overlap.** `home-oxygen` (adult long-term criteria), `nasal-o2-fio2` (FiO2 estimate) and
`o2-cylinder-duration` are linked, not duplicated. The cylinder tile answers the follow-on question.

## 5. Mode on `maint-fluids` — WHO Pocket Book maintenance

**Why a mode, not a tile.** `maint-fluids` already computes Holliday-Segar. WHO differs only above
20 kg.

**Logic (PB13 §10.2, p. 304).** 100 mL/kg for the first 10 kg, 50 mL/kg for the next 10 kg, then
**25 mL/kg** for each further kg (Holliday-Segar uses 20). Add 10% for each 1 °C of fever (PB13
rectal convention). The mode prints the two advisory lines: do not give 5% glucose alone; IV
maintenance is half-normal saline with 5–10% glucose. At 26 kg the two methods give 1,650 vs 1,620
mL per day, a test case.

## 6. Mode on `peds-weight-dose` — WHO Pocket Book weight bands

**Why a mode.** `peds-weight-dose` computes mg/kg. PB13 Annex 2 prints the same drugs in five weight
bands (3–<6, 6–<10, 10–<15, 15–<20, 20–29 kg) "to avoid calculation errors", and some drugs are
marked "calculate the exact dose" with the bands as a fallback.

**Logic.** A "WHO Pocket Book bands" mode prints the band dose beside the computed mg/kg dose for
the drugs the research read: amoxicillin (25 and 40 mg/kg), ampicillin, gentamicin, ceftriaxone
(80 mg/kg daily; meningitis 50 mg/kg twice daily or 100 mg/kg daily), benzylpenicillin,
paracetamol, ibuprofen, iron syrup, and tetracycline for cholera. Drugs marked "calculate the exact
dose" (digoxin, chloramphenicol, aminophylline) show only the computed dose and the note.

**Trap.** PB13's BSA formula extracts without its square root sign; the existing `bsa` tile covers
BSA, and this mode does not re-implement it.

## Tests

`test/unit/etat.test.js`: each emergency sign alone; shock needs all three; the ETAT fluid ladder at
10 kg; SAM shock at 10 kg; glucose thresholds 2.4/2.5 and 2.9/3.0 mmol/L with the SAM switch; the
SpO2 90 and 87 edges under both editions; the maintenance mode at 10, 20, 21, and 26 kg.

## Staleness

ETAT16, PB13 and OX16 *low*. A revised Pocket Book would replace PB13 rows.
