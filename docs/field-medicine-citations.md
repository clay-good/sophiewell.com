# Field Medicine Citations and Worked Examples

Per spec-v3 section 6.8. This file is the dedicated catalog of every
Group I (Field Medicine) clinical reference and calculator with the
original publication citation, the public dataset where applicable,
and the worked-example test case that drives both the unit test and
the "Test with example" button on each utility view.

This file is parallel to `docs/clinical-citations.md`. The inline
citations on each utility view (rendered by `renderMetaBlock` from
`lib/meta.js`) are the load-bearing trust feature; this file is the
catalog.

## Per-utility citations and worked examples

### Utility 64 - Pediatric Weight-to-Dose Calculator

Citation: FDA labeling for each medication (DailyMed). Standard
prehospital pediatric resuscitation literature. AHA PALS 2020
guidelines for cardiac-arrest dosing.

Worked example: 10 kg patient + epinephrine IV/IO (0.01 mg/kg) ->
0.1 mg dose.

Worked example: 200 kg patient + epinephrine IV/IO -> 1 mg
(per-dose cap applied).

Worked example: 1 kg patient + atropine (0.02 mg/kg, min 0.1 mg) ->
0.1 mg (minimum applied).

### Utility 65 - Adult Cardiac Arrest Drug Reference

Citation: AHA Emergency Cardiovascular Care 2020 guidelines (numeric
reference values only; AHA flowcharts are not reproduced).

Source: `data/aha-reference/aha-reference.json`.

Reference rows include epinephrine 1 mg IV/IO every 3-5 min,
amiodarone 300 mg IV/IO bolus then 150 mg, lidocaine 1-1.5 mg/kg
IV/IO, magnesium 1-2 g IV for torsades, sodium bicarbonate 1 mEq/kg
for TCA toxicity.

### Utility 66 - Pediatric Cardiac Arrest Drug Reference

Citation: AHA PALS 2020 guidelines (numeric reference only).

Source: `data/aha-reference/aha-reference.json`.

Reference rows: epinephrine 0.01 mg/kg IV/IO max 1 mg every 3-5 min;
amiodarone 5 mg/kg IV/IO max 300 mg; lidocaine 1 mg/kg IV/IO
alternative.

### Utility 67 - Defibrillation Energy Calculator

Citation: AHA ECC 2020 guidelines defibrillation energy ranges.

Worked examples:
- Adult biphasic VF/pVT: 120-200 J (manufacturer specific); 200 J if unknown.
- Adult monophasic VF/pVT: 360 J.
- Pediatric VF/pVT, 20 kg first shock: 2 J/kg = 40 J.
- Pediatric VF/pVT, 20 kg subsequent shock: 4 J/kg = 80 J.
- Adult unstable narrow regular SVT cardioversion: 50-100 J synchronized.
- Adult unstable AFib cardioversion: 120-200 J synchronized.
- Adult unstable monomorphic VT cardioversion: 100 J synchronized.
- Pediatric cardioversion 20 kg first: 0.5 J/kg = 10 J synchronized.

### Utility 68 - Cincinnati Prehospital Stroke Scale

Citation: Kothari RU, Pancioli A, Liu T, Brott T, Broderick J.
Cincinnati Prehospital Stroke Scale: reproducibility and validity.
Acad Emerg Med. 1997;4(9):986-990.

Worked example: facial droop = 1, arm drift = 0, abnormal speech = 0
-> POSITIVE (1 of 3 abnormal).

### Utility 69 - FAST and BE-FAST Stroke Assessment

Citation (FAST): Kleindorfer DO, et al. Designing a message for
public stroke education using the FAST mnemonic. Stroke.
2007;38(10):2864-2868.

Citation (BE-FAST): Aroor S, Singh R, Goldstein LB. BE-FAST:
reducing the proportion of strokes missed using the FAST mnemonic.
Stroke. 2017;48(2):479-481.

Worked example: face = 1 -> FAST POSITIVE.

Worked example: balance = 1 -> BE-FAST POSITIVE.

### Utility 70 - Trauma Triage Decision Tool (CDC)

Citation: CDC. Guidelines for Field Triage of Injured Patients.
MMWR Recommendations and Reports. Current edition.

Source: `data/field-triage/guidelines.json`.

Worked example: GCS less than or equal to 13 (Step 1) -> highest-level
trauma center.

Worked example: amputation proximal to wrist or ankle (Step 2) ->
highest-level trauma center.

Worked example: high-risk MVC mechanism (Step 3) -> consider trauma
center, agency-protocol decision.

### Utility 71 - START Adult MCI Triage

Citation: Super G, et al. START: Simple Triage and Rapid Treatment.
Newport Beach Fire Department / Hoag Hospital, 1983. Public-domain
MCI triage protocol.

Source: `data/mci-triage/algorithms.json`.

Worked examples:
- Walks -> Minor (green).
- Apnea persists after airway repositioning -> Expectant (black).
- Breathing returns after airway repositioning -> Immediate (red).
- RR over 30 -> Immediate (red).
- Absent radial pulse or capillary refill over 2s -> Immediate (red).
- Cannot follow simple commands -> Immediate (red).
- All checks pass -> Delayed (yellow).

### Utility 72 - JumpSTART Pediatric MCI Triage

Citation: Romig LE. JumpSTART pediatric MCI triage tool. CHOC
Children's Hospital. Public-domain pediatric variant of START.

Source: `data/mci-triage/algorithms.json`.

Worked examples:
- Walks -> Minor (green).
- Apnea persists after 5 rescue breaths -> Expectant (black).
- Breathing returns after 5 rescue breaths -> Immediate (red).
- RR outside 15-45 -> Immediate (red).
- All checks pass -> Delayed (yellow).

### Utility 73 - Burn Surface Area Calculator

Citation: Lund CC, Browder NC. The estimation of areas of burns.
Surg Gynecol Obstet. 1944;79:352-358 (Lund-Browder chart).

Citation: Wallace AB. The exposure treatment of burns. Lancet.
1951 (Rule of Nines, attribution).

Worked example (Rule of Nines): anterior trunk only -> 18 percent TBSA.

Worked example (Lund-Browder): head 5, arm-left 4, leg-right 9 ->
18 percent TBSA.

### Utility 74 - Burn Fluid Resuscitation Calculator

Citation (Parkland): Baxter CR, Shires T. Physiological response to
crystalloid resuscitation of severe burns. Ann N Y Acad Sci.
1968;150(3):874-894.

Citation (Modified Brooke): Reiss E, et al. Fluid replacement in
severe burns. Original Brooke modified to 2 mL/kg/percent BSA.

Worked example: 70 kg, 20 percent TBSA, hour 0 ->
- Parkland 5600 mL over 24h, 2800 mL in first 8h, 2800 mL over the
  subsequent 16h.
- Brooke 2800 mL over 24h, 1400 mL in first 8h, 1400 mL over the
  subsequent 16h.

Worked example: same patient at hour 2 since injury -> remaining
2100 mL over the next 6h of the first-8h window (350 mL/hr) for
Parkland; 1050 mL (175 mL/hr) for Brooke.

### Utility 75 - Hypothermia Staging Reference

Citation: Wilderness Medical Society practice guidelines.

Source: `data/environmental/environmental.json`.

Bands:
- Mild (32-35 C / 90-95 F): shivering present, tachycardia, alert.
- Moderate (28-32 C / 82-90 F): decreased mentation, bradycardia,
  atrial dysrhythmias.
- Severe (below 28 C / 82 F): coma, fixed pupils, ventricular
  dysrhythmias, asystole. Treat as potentially viable until rewarmed.

### Utility 76 - Heat Illness Staging Reference

Citation: Wilderness Medical Society practice guidelines.

Source: `data/environmental/environmental.json`.

Bands:
- Heat exhaustion: core typically below 40 C; profuse sweating;
  mental status preserved.
- Heat stroke: core typically 40 C or higher; CNS dysfunction;
  sweating may be absent or present.

### Utility 77 - Pediatric ETT Size Calculator

Citation: Standard pediatric airway formulas. Cuffed: age/4 + 3.5.
Uncuffed: age/4 + 4. Depth at the lip = 3 x tube size in cm.

Worked example: age 4, uncuffed -> 5.0 mm size, 15 cm depth.

Worked example: age 4, cuffed -> 4.5 mm size, 13.5 cm depth.

Worked example: age 8, uncuffed -> 6.0 mm size, 18 cm depth.

### Utility 78 - APGAR

Citation: Apgar V. A proposal for a new method of evaluation of the
newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.

Implemented as Group G utility 49; the Field Medicine audience tag
was added per spec-v3 5.2 with no new code.

### Utility 79 - Toxidrome Reference

Citation: CDC Agency for Toxic Substances and Disease Registry
(ATSDR) toxicological profiles. Standard medical toxicology
literature (Goldfrank's, Tintinalli, NLM/NIH).

Source: `data/toxidromes/toxidromes.json`.

Six toxidromes: cholinergic, anticholinergic, sympathomimetic,
opioid, sedative-hypnotic, serotonergic. Each with signs, common
causes, and antidote / management notes.

### Utility 80 - Naloxone Dosing and Re-Dosing Calculator

Citation: Naloxone HCl FDA labeling (DailyMed). CDC Opioid Overdose
Prevention guidance (current edition).

Worked examples:
- Adult IV: initial 0.4-2 mg, repeat q2-3 min.
- Adult intranasal: 4 mg per spray (1 spray each nostril).
- Pediatric 20 kg IV: 2 mg (capped at adult dose).
- Pediatric 10 kg IV: 1 mg.
- Synthetic opioids (fentanyl analogs): higher cumulative doses may
  be required per CDC guidance.

### Utility 81 - EMS Documentation Helper

Citation: Templated workflow tool. No clinical citations. Specific
EMS agency documentation requirements govern.

Source: `data/workflow/ems-runtypes.json`.

Nine run types: cardiac arrest, motor vehicle accident, stroke,
overdose, fall, syncope, seizure, respiratory distress, OB / labor
and delivery. Each carries a 7-10 item PCR documentation checklist.

## Field tag on existing utilities

The following existing Group E, F, and G utilities carry the
`field` audience tag per spec-v3 5.2. No new citations; their
existing citations in `docs/clinical-citations.md` continue to
apply.

Glasgow Coma Scale (48), NIH Stroke Scale (57), Drip Rate (41),
Weight-Based Dose (42), Concentration-to-Rate (43), Pediatric
Vital Signs by Age (50), Common Lab Reference Ranges (51), ABG
Interpretation Walkthrough (52), Wells PE (53), MAP (30), P/F Ratio
(40), Anion Gap (31), Corrected Sodium for Hyperglycemia (33),
Pediatric Dose Safety Bounds (44), Anticoagulation Reversal (46),
High-Alert Medication Reference (47), APGAR (49), Mallampati (59).

## Maintenance

When a Group I utility's formula or reference value changes:

1. Update the constant in `lib/field.js` (or the bundled data file).
2. Update the worked example in this file.
3. Update the matching unit test in `test/unit/field.test.js`.
4. Update the `example` payload in `lib/meta.js` so the in-site
   "Test with example" button shows the new expected output.
5. Note the change in `CHANGELOG.md` per the spec-v2 stability
   commitments.
