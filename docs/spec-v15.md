# spec-v15.md — obstetrics, pediatrics, trauma & EMS (25 tiles)

> Status: proposed (2026-05-18). v15 is the fourth catalog-growth
> spec after [spec-v12](spec-v12.md), [spec-v13](spec-v13.md), and
> [spec-v14](spec-v14.md). It adds 25 tiles aimed at obstetric
> triage, pediatric acute care (especially febrile-infant
> evaluation, croup, asthma severity, and PECARN imaging-decision
> companions to v12), trauma scoring, and EMS-field severity.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v15 amends no hard rule from v10/v11/v12/v13/v14. Catalog growth:
> at v14 close 253 tiles; at v15 close 278 tiles.

## 1. Why v15 exists

v12–v14 skew adult medicine. v15 deliberately corrects the
balance: 6 OB tiles, 11 pediatric tiles, 8 trauma / EMS tiles.

1. **Obstetrics** — Biophysical Profile, New Ballard gestational-
   age estimator, ACOG severe-feature preeclampsia checklist,
   HELLP criteria, Carpenter-Coustan GDM criteria, IADPSG GDM
   criteria. These are the highest-volume obstetric triage
   decisions on labor-and-delivery and high-risk OB clinics.
2. **Pediatric febrile-infant evaluation** — Rochester,
   Philadelphia, Boston, and Step-by-Step criteria. Each
   represents a different decade and a different country's
   evidence base; ED clinicians comparing across them is the
   single most common pediatric-decision-support request.
3. **Pediatric respiratory & neurologic** — Yale Observation
   Scale, Westley Croup Score, PRAM, Pediatric Asthma Severity
   Score, Pediatric Glasgow Coma Scale, Bacterial Meningitis
   Score (Nigrovic).
4. **Pediatric imaging-decision companions to v12 PECARN-head** —
   PECARN intra-abdominal-injury rule and PECARN c-spine rule.
5. **Trauma scoring** — Injury Severity Score, Revised Trauma
   Score, TRISS, Pediatric Trauma Score, BIG Score, MGAP,
   GAP, ABC score for massive transfusion.

Each meets the v12 §1 criteria.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md),
[spec-v13 §2](spec-v13.md), [spec-v14 §2](spec-v14.md). v15
specifically defers:

- **TASH (Trauma-Associated Severe Hemorrhage)** — closed
  coefficients (German Trauma Society registry-derived); defer
  until the derivation paper is fully reproducible.
- **PRISM III, PIM 2/3 pediatric ICU scoring** — peds-ICU-specific
  spec planned.
- **Sarnat / modified Sarnat HIE staging** — defer to a neonatal-
  encephalopathy bundle.
- **Friedman / Zhang labor curves** — visual nomograms; ship as
  reference images when a `peds-ob-reference` tile spec lands.
- **ATLS algorithm flowchart** — qualitative; better as a
  reference-card tile.
- **SCAT-5 concussion assessment** — multi-step structured
  evaluation; defer to a sports/concussion bundle.
- **Maternal Early Warning Score (MEWS-OB), MEOWS** — emerging
  with multiple regional variants; defer.

## 3. The 25 tiles

### 3.1 Obstetrics

#### 3.1.1 `bpp` — Biophysical Profile

- **Citation:** Manning FA, Platt LD, Sipos L. *Antepartum fetal
  evaluation: development of a fetal biophysical profile.* Am J
  Obstet Gynecol 1980;136(6):787-795.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`.
- **Inputs:** Fetal breathing movements, fetal movements, fetal
  tone, amniotic fluid volume, reactive NST (each 0 or 2).
- **Output:** 0–10; 8–10 normal; 6 equivocal; ≤4 abnormal (Manning
  1980; ACOG Practice Bulletin 145, 2014, cited under
  `interpretation.sourceCitation`).

#### 3.1.2 `ballard` — New Ballard Score for Gestational Age

- **Citation:** Ballard JL, Khoury JC, Wedig K, Wang L, Eilers-
  Walsman BL, Lipp R. *New Ballard Score, expanded to include
  extremely premature infants.* J Pediatr 1991;119(3):417-423.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `obstetrics-gynecology`,
  `nursing-general`.
- **Inputs:** 6 neuromuscular criteria (posture, square window
  wrist, arm recoil, popliteal angle, scarf sign, heel to ear)
  + 6 physical criteria (skin, lanugo, plantar surface, breast,
  eye/ear, genitals) each scored −1 to 5.
- **Output:** Sum and corresponding gestational-age band per
  Ballard 1991 Table 1 (20–44 weeks).

#### 3.1.3 `acog-severe-pre` — ACOG Severe-feature Preeclampsia Checklist

- **Citation:** American College of Obstetricians and
  Gynecologists Task Force on Hypertension in Pregnancy.
  *Hypertension in pregnancy. Report of the American College of
  Obstetricians and Gynecologists' Task Force on Hypertension in
  Pregnancy.* Obstet Gynecol 2013;122(5):1122-1131. Re-affirmed
  ACOG Practice Bulletin 222, 2020.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`,
  `emergency-medicine`.
- **Inputs:** SBP ≥160 or DBP ≥110 on two occasions ≥4 h apart;
  thrombocytopenia <100; impaired hepatic function (transaminases
  ≥2× normal or persistent severe RUQ/epigastric pain); creatinine
  >1.1 or doubled baseline; pulmonary edema; new cerebral or
  visual disturbances.
- **Output:** Any one feature → severe preeclampsia.

#### 3.1.4 `hellp` — HELLP Syndrome Criteria

- **Citation:** Sibai BM. *The HELLP syndrome (hemolysis, elevated
  liver enzymes, and low platelets): much ado about nothing?* Am
  J Obstet Gynecol 1990;162(2):311-316. (Tennessee classification
  reference: Sibai BM, Ramadan MK, Usta I, Salama M, Mercer BM,
  Friedman SA. Maternal-perinatal outcome in 442 women with HELLP.
  Am J Obstet Gynecol 1993;169(4):1000-1006.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`,
  `hematology`, `emergency-medicine`.
- **Inputs:** Hemolysis (abnormal peripheral smear and/or total
  bilirubin ≥1.2 and/or LDH ≥600), Elevated liver enzymes (AST
  ≥70), Low platelets (<100×10⁹/L).
- **Output:** Complete (all 3) or partial HELLP; Mississippi
  class 1–3 by platelet count (≤50 / 50–100 / 100–150) per
  Mississippi 1999 cited under `interpretation.sourceCitation`.

#### 3.1.5 `carpenter-coustan` — Carpenter-Coustan GDM Criteria

- **Citation:** Carpenter MW, Coustan DR. *Criteria for screening
  tests for gestational diabetes.* Am J Obstet Gynecol 1982;144(7):
  768-773.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `endocrinology`.
- **Inputs:** 100-g 3-h OGTT values: fasting (mg/dL), 1-h, 2-h,
  3-h.
- **Output:** GDM diagnosed if ≥2 values exceed (fasting 95 / 1-h
  180 / 2-h 155 / 3-h 140). Single value abnormal = impaired
  glucose tolerance.

#### 3.1.6 `iadpsg` — IADPSG GDM Criteria

- **Citation:** International Association of Diabetes and Pregnancy
  Study Groups Consensus Panel. *International association of
  diabetes and pregnancy study groups recommendations on the
  diagnosis and classification of hyperglycemia in pregnancy.*
  Diabetes Care 2010;33(3):676-682.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as carpenter-coustan.
- **Inputs:** 75-g 2-h OGTT values: fasting, 1-h, 2-h.
- **Output:** GDM diagnosed if ≥1 value exceeds (fasting 92 / 1-h
  180 / 2-h 153). Ships side by side with `carpenter-coustan` so
  the clinician can choose by local protocol.

### 3.2 Pediatric febrile-infant evaluation

#### 3.2.1 `rochester` — Rochester Criteria (febrile infant)

- **Citation:** Jaskiewicz JA, McCarthy CA, Richardson AC, et al.
  *Febrile infants at low risk for serious bacterial infection —
  an appraisal of the Rochester criteria and implications for
  management.* Pediatrics 1994;94(3):390-396.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `infectious-disease`.
- **Inputs:** Age ≤60 days, term and previously healthy, no
  focal infection on exam, WBC 5–15×10⁹/L, bands ≤1.5×10⁹/L,
  urine WBC ≤10/HPF, stool WBC ≤5/HPF.
- **Output:** All criteria met → low risk for SBI (Jaskiewicz
  1994 §Results).

#### 3.2.2 `philadelphia` — Philadelphia Criteria

- **Citation:** Baker MD, Bell LM, Avner JR. *Outpatient
  management without antibiotics of fever in selected infants.*
  N Engl J Med 1993;329(20):1437-1441.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as rochester.
- **Inputs:** Age 29–60 d, well-appearing, WBC <15×10⁹/L, band:
  neutrophil ratio <0.2, UA <10 WBC/HPF and few bacteria, CSF <8
  WBC/mm³ and Gram-stain negative, chest x-ray clear (if obtained),
  stool studies normal (if diarrhea).
- **Output:** All low-risk → safe outpatient management with no
  empiric antibiotic.

#### 3.2.3 `boston-febrile` — Boston Criteria

- **Citation:** Baskin MN, O'Rourke EJ, Fleisher GR. *Outpatient
  treatment of febrile infants 28 to 89 days of age with
  intramuscular administration of ceftriaxone.* J Pediatr
  1992;120(1):22-27.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as rochester.
- **Inputs:** Age 28–89 d, well-appearing, no focal source on
  exam, WBC <20×10⁹/L, UA <10 WBC/HPF, CSF <10 WBC/mm³, chest
  x-ray clear if obtained.
- **Output:** Eligible for outpatient ceftriaxone management
  (Baskin 1992 §Results).

#### 3.2.4 `step-by-step` — Step-by-Step Approach

- **Citation:** Gomez B, Mintegi S, Bressan S, Da Dalt L, Gervaix
  A, Lacroix L, European Group for Validation of the Step-by-Step
  Approach. *Validation of the "Step-by-Step" approach in the
  management of young febrile infants.* Pediatrics 2016;138(2):
  e20154381.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as rochester.
- **Inputs:** Sequential decision tree: appearance (unwell vs
  well), age (≤21 d), urinalysis abnormal, procalcitonin
  ≥0.5 ng/mL, CRP >20 mg/L or ANC >10×10⁹/L.
- **Output:** Low-risk vs intermediate-risk vs high-risk per
  Gomez 2016 Figure 1.

#### 3.2.5 `yos` — Yale Observation Scale

- **Citation:** McCarthy PL, Sharpe MR, Spiesel SZ, et al.
  *Observation scales to identify serious illness in febrile
  children.* Pediatrics 1982;70(5):802-809.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`.
- **Inputs:** 6 observation items (quality of cry, reaction to
  parents, state variation, color, hydration, response to social
  overtures) each 1/3/5.
- **Output:** 6–30; ≥10 = increased SBI risk; ≥16 = high
  probability (McCarthy 1982 §Results).

### 3.3 Pediatric respiratory & neurologic

#### 3.3.1 `westley` — Westley Croup Score

- **Citation:** Westley CR, Cotton EK, Brooks JG. *Nebulized
  racemic epinephrine by IPPB for the treatment of croup: a
  double-blind study.* Am J Dis Child 1978;132(5):484-487.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`.
- **Inputs:** Level of consciousness (0/5), cyanosis (0/4/5),
  stridor (0/1/2), air entry (0/1/2), retractions (0/1/2/3).
- **Output:** 0–17; <3 mild, 3–7 moderate, 8–11 severe, ≥12
  impending respiratory failure (Westley 1978 §Methods).

#### 3.3.2 `pram-asthma` — PRAM (Pediatric Respiratory Assessment Measure)

- **Citation:** Chalut DS, Ducharme FM, Davis GM. *The Preschool
  Respiratory Assessment Measure (PRAM): a responsive index of
  acute asthma severity.* J Pediatr 2000;137(6):762-768.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `pulmonology`.
- **Inputs:** Suprasternal retractions (0/2), scalene muscle use
  (0/2), air entry (0/1/2/3), wheezing (0/1/2/3), SpO₂ on room
  air (0/1/2).
- **Output:** 0–12; 0–3 mild, 4–7 moderate, 8–12 severe (Chalut
  2000 §Results).

#### 3.3.3 `pass-asthma` — Pediatric Asthma Severity Score

- **Citation:** Gorelick MH, Stevens MW, Schultz TR, Scribano PV.
  *Performance of a novel clinical score, the pediatric asthma
  severity score (PASS), in the evaluation of acute asthma.*
  Acad Emerg Med 2004;11(1):10-18.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as pram-asthma.
- **Inputs:** Wheezing (0/1/2), work of breathing (0/1/2),
  prolonged expiration (0/1/2).
- **Output:** 0–6; 0–1 mild, 2–3 moderate, 4–6 severe.

#### 3.3.4 `peds-gcs` — Pediatric Glasgow Coma Scale

- **Citation:** Reilly PL, Simpson DA, Sprod R, Thomas L. *Assessing
  the conscious level in infants and young children: a paediatric
  version of the Glasgow Coma Scale.* Childs Nerv Syst 1988;4(1):
  30-33. Modified for verbal score: James HE. Neurologic evaluation
  and support in the child with an acute brain insult. Pediatr Ann
  1986;15(1):16-22.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `neurology`, `critical-care`.
- **Inputs:** Eye opening 1–4, age-adjusted verbal response 1–5
  (under 2 / 2–5 / older), motor response 1–6.
- **Output:** 3–15; same severity bands as adult GCS (≤8 severe,
  9–12 moderate, 13–15 mild).

#### 3.3.5 `nigrovic` — Bacterial Meningitis Score (Nigrovic)

- **Citation:** Nigrovic LE, Kuppermann N, Macias CG, et al.
  *Clinical prediction rule for identifying children with
  cerebrospinal fluid pleocytosis at very low risk of bacterial
  meningitis.* JAMA 2007;297(1):52-60.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `infectious-disease`, `neurology`.
- **Inputs:** Positive CSF Gram stain (2), CSF ANC ≥1000/mm³
  (1), CSF protein ≥80 mg/dL (1), peripheral ANC ≥10,000/mm³
  (1), seizure at or before presentation (1).
- **Output:** 0 = very low risk for bacterial meningitis (NPV
  ~99.9%); ≥1 = not low risk; do not discharge.

### 3.4 Pediatric imaging-decision companions

#### 3.4.1 `pecarn-iai` — PECARN Intra-Abdominal Injury Rule

- **Citation:** Holmes JF, Lillis K, Monroe D, et al.
  *Identifying children at very low risk of clinically important
  blunt abdominal injuries.* Ann Emerg Med 2013;62(2):107-116.e2.
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `pediatrics`, `emergency-medicine`, `surgery`.
- **Inputs:** Seven negative findings: no evidence of abdominal
  wall trauma or seat-belt sign; no GCS <14; no abdominal
  tenderness; no vomiting; no thoracic-wall trauma; no complaint
  of abdominal pain; no decreased breath sounds.
- **Output:** All negative → very low risk of clinically
  important IAI (negative predictive value 99.9% per Holmes 2013
  §Results).

#### 3.4.2 `pecarn-cspine` — PECARN Pediatric C-Spine Rule

- **Citation:** Leonard JC, Browne LR, Ahmad FA, et al.
  *Cervical spine injury risk factors in children with blunt
  trauma.* Pediatrics 2019;144(1):e20183221. Updated derivation:
  Leonard JC, Kuppermann N, Olsen C, et al. *Factors associated
  with cervical spine injury in children after blunt trauma.* Ann
  Emerg Med 2011;58(2):145-155.
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `surgery`, `neurology`.
- **Inputs:** Eight risk factors: altered mental status,
  abnormal airway/breathing/circulation, focal neurologic deficit,
  neck pain, torticollis, substantial torso injury, predisposing
  condition, high-risk MVC.
- **Output:** Any → not low-risk; none → low-risk and imaging
  not indicated.

### 3.5 Trauma scoring

#### 3.5.1 `iss` — Injury Severity Score

- **Citation:** Baker SP, O'Neill B, Haddon W Jr, Long WB. *The
  injury severity score: a method for describing patients with
  multiple injuries and evaluating emergency care.* J Trauma
  1974;14(3):187-196.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `emergency-medicine`, `surgery`,
  `critical-care`.
- **Inputs:** AIS (Abbreviated Injury Scale) score (1–6) for
  each of six body regions: head/neck, face, chest, abdomen,
  extremities, external. Sophie ships an AIS quick-reference
  pane but does not bundle the full AIS dictionary (Association
  for the Advancement of Automotive Medicine copyright); user
  enters AIS values they've already assigned.
- **Formula:** Sum of squares of the three highest AIS values
  across the six regions. Any AIS = 6 → ISS = 75 by convention.
- **Output:** 0–75; ≥16 = major trauma.

#### 3.5.2 `rts` — Revised Trauma Score

- **Citation:** Champion HR, Sacco WJ, Copes WS, Gann DS, Gennarelli
  TA, Flanagan ME. *A revision of the Trauma Score.* J Trauma
  1989;29(5):623-629.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `emergency-medicine`, `surgery`,
  `critical-care`, `nursing-general`.
- **Inputs:** GCS, SBP, RR (each binned per Champion 1989 Table
  2 to 0–4).
- **Output:** Coded value (0–7.84) via weighted sum 0.9368×GCS +
  0.7326×SBP + 0.2908×RR.

#### 3.5.3 `triss` — TRISS

- **Citation:** Boyd CR, Tolson MA, Copes WS. *Evaluating trauma
  care: the TRISS method. Trauma Score and the Injury Severity
  Score.* J Trauma 1987;27(4):370-378.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** same as rts.
- **Inputs:** RTS, ISS, age >54, blunt vs penetrating trauma.
- **Formula:** Ps = 1 / (1 + e^(−b)) where b = b₀ + b₁×RTS +
  b₂×ISS + b₃×Age (blunt and penetrating coefficients per
  Boyd 1987).
- **Output:** Probability of survival 0–1.

#### 3.5.4 `peds-trauma` — Pediatric Trauma Score

- **Citation:** Tepas JJ 3rd, Mollitt DL, Talbert JL, Bryant M.
  *The pediatric trauma score as a predictor of injury severity
  in the injured child.* J Pediatr Surg 1987;22(1):14-18.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `surgery`.
- **Inputs:** Weight (>20 / 10–20 / <10 kg → +2/+1/−1), airway
  (normal / maintainable / unmaintainable), SBP (>90/50-90/<50),
  CNS (awake/obtunded or LOC/coma), open wound (none / minor /
  major or penetrating), skeletal (none / closed fx / open or
  multiple fx).
- **Output:** −6 to +12; ≤8 = need for transfer to peds trauma
  center per Tepas 1987 §Results.

#### 3.5.5 `big` — BIG Score (pediatric trauma)

- **Citation:** Borgman MA, Maegele M, Wade CE, Blackbourne LH,
  Spinella PC. *Pediatric trauma BIG score: predicting mortality
  in children after military and civilian trauma.* Pediatrics
  2011;127(4):e892-e897.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** Base deficit, INR, GCS.
- **Formula:** BIG = base deficit + 2.5 × INR + (15 − GCS).
- **Output:** Numeric; threshold ≥16 predicts mortality with
  high sensitivity (Borgman 2011 §Results).

#### 3.5.6 `mgap` — MGAP Trauma Score

- **Citation:** Sartorius D, Le Manach Y, David JS, et al.
  *Mechanism, glasgow coma scale, age, and arterial pressure
  (MGAP): a new simple prehospital triage score to predict mortality
  in trauma patients.* Crit Care Med 2010;38(3):831-837.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `emergency-medicine`, `critical-care`.
- **Inputs:** Mechanism (blunt = 4 / penetrating = 0), GCS
  (3–15), Age <60 (5), SBP (>120 = 5; 60–120 = 3; <60 = 0).
- **Output:** Sum; <18 high risk, 18–22 moderate, 23–29 low
  per Sartorius 2010 Table 3.

#### 3.5.7 `gap` — GAP Trauma Score

- **Citation:** Kondo Y, Abe T, Kohshi K, Tokuda Y, Cook EF,
  Kukita I. *Revised trauma scoring system to predict in-hospital
  mortality in the emergency department: Glasgow Coma Scale, Age,
  and Systolic Blood Pressure score.* Crit Care 2011;15(4):R191.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** same as mgap.
- **Inputs:** GCS (3–15), Age <60 (3), SBP (>120 = 6; 60–120 =
  4; <60 = 0).
- **Output:** Sum; ≤10 high risk, 11–18 moderate, 19–24 low
  per Kondo 2011.

#### 3.5.8 `abc-mtp` — ABC Score for Massive Transfusion

- **Citation:** Nunez TC, Voskresensky IV, Dossett LA, Shinall R,
  Dutton WD, Cotton BA. *Early prediction of massive transfusion
  in trauma: simple as ABC (assessment of blood consumption)?*
  J Trauma 2009;66(2):346-352.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `surgery`, `hematology`,
  `critical-care`.
- **Inputs:** Penetrating mechanism (1), SBP ≤90 (1), HR ≥120
  (1), positive FAST (1).
- **Output:** 0–4; ≥2 = activate massive transfusion protocol
  (sensitivity 75%, specificity 86% per Nunez 2009).

## 4. Group-home assignments

| Group label                       | New v15 tiles                                                                                                                                                                                  | Count |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | bpp, acog-severe-pre, hellp, carpenter-coustan, iadpsg, rochester, philadelphia, boston-febrile, step-by-step, yos, westley, pram-asthma, pass-asthma, peds-gcs, nigrovic, peds-trauma, abc-mtp | 17    |
| Clinical Math & Conversions (`E`) | ballard, iss, rts, triss, big, mgap, gap                                                                                                                                                       | 7     |
| Pediatrics & Neonatal (`N`)       | pecarn-iai, pecarn-cspine                                                                                                                                                                       | 2     |

17 + 7 + 2 = 26 — overcount because `pecarn-iai` and `pecarn-cspine`
are already counted under their explicit Peds home. Correct total
across the 25 tiles below is 25 (the table double-counts deliberately
so each tile appears once under its rendered home; verify against §3
list).

Recounted: §3.1 = 6 + §3.2 = 5 + §3.3 = 5 + §3.4 = 2 + §3.5 = 8 →
26. **Adjust:** drop `iadpsg` from v15 to keep clean 25 — or keep
26 and accept the slight overshoot.

**Decision:** v15 ships 25 tiles. `iadpsg` is dropped from v15 and
deferred to a future v16 endocrine annex (it pairs cleanly with the
v16 ADA diabetes diagnostic thresholds). The §3 narrative above is
authoritative; `iadpsg` is removed from the table below.

Adjusted §3.1 = 5 (drop iadpsg) → §3 total = 25.

| Group label                       | New v15 tiles                                                                                                                                                                | Count |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | bpp, acog-severe-pre, hellp, carpenter-coustan, rochester, philadelphia, boston-febrile, step-by-step, yos, westley, pram-asthma, pass-asthma, peds-gcs, nigrovic, peds-trauma, abc-mtp | 16    |
| Clinical Math & Conversions (`E`) | ballard, iss, rts, triss, big, mgap, gap                                                                                                                                     | 7     |
| Pediatrics & Neonatal (`N`)       | pecarn-iai, pecarn-cspine                                                                                                                                                    | 2     |

16 + 7 + 2 = 25. ✓

## 5. Per-tile shipping contract

Inherits [spec-v12 §5](spec-v12.md) verbatim. No changes.

## 6. Sequencing

- **Wave 15-0** — this spec doc.
- **Wave 15-1 (OB)** — bpp, ballard, acog-severe-pre, hellp,
  carpenter-coustan.
- **Wave 15-2 (febrile infant)** — rochester, philadelphia,
  boston-febrile, step-by-step, yos.
- **Wave 15-3 (peds resp+neuro)** — westley, pram-asthma,
  pass-asthma, peds-gcs, nigrovic.
- **Wave 15-4 (peds imaging decision)** — pecarn-iai,
  pecarn-cspine.
- **Wave 15-5 (trauma scoring)** — iss, rts, triss, peds-trauma,
  big, mgap, gap, abc-mtp.
- **Wave 15-6 (closeout)** — CHANGELOG, 253 → 278, audit-coverage
  100%.

## 7. Acceptance criteria

Same as [spec-v13 §7](spec-v13.md). Catalog target 253 → 278.

## 8. Out of scope

Already enumerated in §2. Also deferred:

- **IADPSG GDM criteria** — moved to a future endocrine-annex
  spec where it pairs with ADA diabetes diagnostic thresholds
  (v16 §3 introduces these).
- **Bell staging for NEC** — needs imaging-grade and surgical
  inputs; defer to a neonatal-GI spec.
- **Modified Sarnat HIE staging** — defer with NEC.
- **Pediatric Early Warning (PEWS) variants** — multiple regional
  PEWS exist; the existing [pews](../lib/meta.js) tile remains
  the canonical version.
- **Field-medicine score variants** — keep the existing
  [field-triage](../lib/meta.js), [start-triage](../lib/meta.js),
  and [jumpstart-triage](../lib/meta.js) tiles canonical; defer
  newer SALT / Sieve variants.
- **TASH score** — see §2.

## 9. Quick reference

| Id                  | Visible name                                            | Group |
|---------------------|---------------------------------------------------------|-------|
| `bpp`               | Biophysical Profile                                     | G     |
| `ballard`           | New Ballard Score (gestational age)                     | E     |
| `acog-severe-pre`   | ACOG Severe-feature Preeclampsia                        | G     |
| `hellp`             | HELLP Syndrome Criteria                                 | G     |
| `carpenter-coustan` | Carpenter-Coustan GDM Criteria                          | G     |
| `rochester`         | Rochester Criteria (febrile infant)                     | G     |
| `philadelphia`      | Philadelphia Criteria (febrile infant)                  | G     |
| `boston-febrile`    | Boston Criteria (febrile infant)                        | G     |
| `step-by-step`      | Step-by-Step Approach (febrile infant)                  | G     |
| `yos`               | Yale Observation Scale                                  | G     |
| `westley`           | Westley Croup Score                                     | G     |
| `pram-asthma`       | PRAM Pediatric Respiratory Assessment                   | G     |
| `pass-asthma`       | Pediatric Asthma Severity Score                         | G     |
| `peds-gcs`          | Pediatric Glasgow Coma Scale                            | G     |
| `nigrovic`          | Bacterial Meningitis Score (Nigrovic)                   | G     |
| `pecarn-iai`        | PECARN Intra-Abdominal Injury Rule                      | N     |
| `pecarn-cspine`     | PECARN Pediatric C-Spine Rule                           | N     |
| `iss`               | Injury Severity Score                                   | E     |
| `rts`               | Revised Trauma Score                                    | E     |
| `triss`             | TRISS                                                   | E     |
| `peds-trauma`       | Pediatric Trauma Score                                  | G     |
| `big`               | BIG Score (pediatric trauma)                            | E     |
| `mgap`              | MGAP Trauma Score                                       | E     |
| `gap`               | GAP Trauma Score                                        | E     |
| `abc-mtp`           | ABC Score for Massive Transfusion                       | G     |

Total: 25 tiles. Catalog 253 → 278 at v15 close.
