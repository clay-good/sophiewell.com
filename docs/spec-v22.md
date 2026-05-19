# spec-v22.md — pediatric-specific extensions: PICU, febrile infant, hyperbilirubinemia, PECARN, pain, growth (25 tiles)

> Status: proposed (2026-05-19). v22 is the eleventh catalog-
> growth spec and the second of the v21–v24 tranche. It adds 25
> tiles across **pediatric ICU severity & organ-failure**
> (PRISM III, PIM-3, pSOFA, p-MODS, PEWS Brighton), **neonatal
> hyperbilirubinemia** (Bhutani nomogram, AAP 2022 phototherapy
> and exchange thresholds, BIND score, bilirubin/albumin
> ratio), **febrile infant & community infection** (Step-by-Step
> already shipped — additionally pediatric UTI prediction rule,
> AAP UTI 2011 prevalence-based decision, Yale Observation
> Scale variants, PIDS/IDSA peds CAP severity), **head & spine
> trauma rules** (PECARN head <2y, PECARN head ≥2y, CHALICE,
> CATCH, Canadian C-spine peds), **pediatric pain & sedation**
> (FLACC, COMFORT-B, Wong-Baker FACES reference, Aldrete
> recovery), **growth & development** (Schwartz height
> velocity, WHO BMI-for-age z-score, Down-syndrome growth
> reference, CDC 2-20 z-score), and **pediatric bedside
> emergencies** (NRP algorithm checkpoints, age-based vitals
> reference).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v22 amends no hard rule from v10–v21. Catalog growth: at v21
> close 428 tiles; at v22 close **453 tiles**.

## 1. Why v22 exists

v15 covered acute pediatric and obstetric tiles; v22 covers the
**pediatric depth** that bedside peds-EM, NICU, PICU, primary-
care pediatrics, and pediatric subspecialty clinicians reach
for that v15 deliberately deferred. The selection follows the
v12 §1 criteria and concentrates on:

1. PICU severity (PRISM III / PIM-3 / pSOFA / p-MODS / PEWS)
   — these drive bed-allocation, escalation, and family
   prognostic conversations every shift.
2. Neonatal hyperbilirubinemia — the AAP 2022 update replaced
   the 2004 framework; bedside tools must match the new
   thresholds.
3. PECARN-family trauma rules — peds-EM standard of care.
4. Pediatric pain assessment — required for every peds inpatient
   shift, every PACU recovery, every procedural-sedation event.
5. Growth & development — Schwartz velocity, WHO/CDC z-scores
   are referenced in every well-child note for at-risk children.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v22
specifically defers:

- **Full WHO growth-curve image rendering.** v22 ships z-score
  computation per WHO/CDC LMS reference tables, not the curve
  plot.
- **Tanner staging.** Patient-facing only; not a decision tile.
- **Pediatric PERC / Wells-PE adaptation.** No validated
  pediatric derivation; defer.
- **Pediatric sepsis Phoenix score (2024).** Ships in a future
  spec once a stable reference implementation is published —
  v22 ships pSOFA + p-MODS as today's standard.
- **CHEOPS / NCCPC-R / r-FLACC variants.** v22 ships canonical
  FLACC and COMFORT-B; variants deferred.

## 3. The 25 tiles

### 3.1 PICU severity & early warning

#### 3.1.1 `prism-iii` — Pediatric Risk of Mortality III

- **Citation:** Pollack MM, Patel KM, Ruttimann UE. *PRISM III: an updated Pediatric Risk of Mortality score.* Crit Care Med 1996;24(5):743-752.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`, `pediatrics`.
- **Inputs:** 17 physiological variables (cardiovascular/neurological, acid-base, chemistry, hematology) weighted per the published table.
- **Output:** PRISM III score + predicted PICU mortality via the published logistic.

#### 3.1.2 `pim-3` — Paediatric Index of Mortality 3

- **Citation:** Straney L, Clements A, Parslow RC, et al. *Paediatric Index of Mortality 3: an updated model for predicting mortality in pediatric intensive care.* Pediatr Crit Care Med 2013;14(7):673-681.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`.
- **Inputs:** SBP, pupillary reaction, FiO2/PaO2 ratio, base excess, mechanical ventilation at admission, elective admission, recovery post-procedure, very-low-risk and high-risk diagnoses.
- **Output:** Predicted in-hospital mortality probability per the original logit.

#### 3.1.3 `psofa` — Pediatric SOFA

- **Citation:** Matics TJ, Sanchez-Pinto LN. *Adaptation and validation of a pediatric sequential organ failure assessment score and evaluation of the sepsis-3 definitions in critically ill children.* JAMA Pediatr 2017;171(10):e172352.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`, `pediatric-emergency-medicine`.
- **Inputs:** Age-adjusted PaO2/FiO2 or SpO2/FiO2, platelets, bilirubin, age-adjusted MAP / vasoactives, GCS, creatinine z-score by age.
- **Output:** pSOFA total 0–24.

#### 3.1.4 `p-mods` — Pediatric Multiple Organ Dysfunction Score

- **Citation:** Graciano AL, Balko JA, Rahn DS, et al. *The Pediatric Multiple Organ Dysfunction Score (P-MODS).* Crit Care Med 2005;33(7):1484-1491.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`.
- **Inputs:** Cardiovascular, respiratory, renal, hepatic, hematologic per the published thresholds (0–4 each).
- **Output:** Sum 0–20.

#### 3.1.5 `pews-brighton` — Brighton Pediatric Early Warning Score

- **Citation:** Monaghan A. *Detecting and managing deterioration in children.* Paediatr Nurs 2005;17(1):32-35.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`.
- **Inputs:** Behavior, cardiovascular, respiratory subscales (0–3 each) + nebulizer / persistent-vomiting modifiers.
- **Output:** PEWS 0–9 with escalation band.

### 3.2 Neonatal hyperbilirubinemia (AAP 2022)

#### 3.2.1 `bhutani-nomogram` — Bhutani hour-specific bilirubin nomogram

- **Citation:** Bhutani VK, Johnson L, Sivieri EM. *Predictive ability of a predischarge hour-specific serum bilirubin for subsequent significant hyperbilirubinemia in healthy term and near-term newborns.* Pediatrics 1999;103(1):6-14.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `neonatology`, `family-medicine`.
- **Inputs:** Age in hours (12–168), total serum bilirubin (mg/dL).
- **Output:** Risk zone (low / low-intermediate / high-intermediate / high) per the published 40th / 75th / 95th percentile curves.

#### 3.2.2 `aap-2022-phototherapy` — AAP 2022 phototherapy threshold

- **Citation:** Kemper AR, Newman TB, Slaughter JL, et al. *Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation.* Pediatrics 2022;150(3):e2022058859.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `neonatology`.
- **Inputs:** Gestational age (≥35 wk), age in hours, hyperbilirubinemia neurotoxicity risk factors (isoimmune, G6PD, sepsis, instability, albumin <3.0).
- **Output:** Phototherapy threshold (mg/dL) per the 2022 Table 1 curves.

#### 3.2.3 `aap-2022-exchange` — AAP 2022 exchange-transfusion threshold

- **Citation:** Kemper AR, Newman TB, Slaughter JL, et al. *AAP CPG Revision 2022.* Pediatrics 2022;150(3):e2022058859.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `neonatology`.
- **Inputs:** Same as §3.2.2.
- **Output:** Escalation-of-care and exchange-transfusion threshold per the 2022 Table 2 curves; B/A ratio escalation rule.

#### 3.2.4 `bind-score` — Bilirubin-Induced Neurologic Dysfunction (BIND) score

- **Citation:** Johnson L, Brown AK, Bhutani VK. *BIND — a clinical score for bilirubin induced neurologic dysfunction in newborns.* Pediatrics 1999;104:746-747 (abstract).
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pediatrics`, `neonatology`.
- **Inputs:** Mental status (0–3), muscle tone (0–3), cry pattern (0–3).
- **Output:** Sum 0–9 with subtle / moderate / severe band.

### 3.3 Febrile infant & community infection

#### 3.3.1 `uti-calc-peds` — UTICalc-style pediatric UTI pre-test (≤2 mo and 2–24 mo)

- **Citation:** Shaikh N, Hoberman A, Hum SW, et al. *Development and validation of a calculator for estimating the probability of urinary tract infection in young febrile children.* JAMA Pediatr 2018;172(6):550-556.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`, `family-medicine`.
- **Inputs:** Age, sex/circumcision, max temperature, race, other source of fever, duration of fever.
- **Output:** Pre-test UTI probability with sample-vs-defer recommendation.

#### 3.3.2 `aap-uti-2011` — AAP 2011 UTI clinical decision (2–24 mo)

- **Citation:** Subcommittee on Urinary Tract Infection. *Urinary Tract Infection: Clinical Practice Guideline for the Diagnosis and Management of the Initial UTI in Febrile Infants and Children 2 to 24 Months.* Pediatrics 2011;128(3):595-610 (reaffirmed 2016).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `family-medicine`.
- **Inputs:** Age, sex/circumcision, fever duration, race, alternate-source-of-fever flag.
- **Output:** Pretest probability threshold + recommended catheterization decision.

#### 3.3.3 `pas-appendicitis` — Pediatric Appendicitis Score (Samuel)

- **Citation:** Samuel M. *Pediatric appendicitis score.* J Pediatr Surg 2002;37(6):877-881.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-emergency-medicine`, `pediatric-surgery`, `pediatrics`.
- **Inputs:** Cough/percussion/hopping tenderness (2), anorexia (1), pyrexia >38°C (1), nausea/emesis (1), RLQ tenderness (2), leukocytosis >10 (1), PMN >75% (1), migration of pain (1). Sum 0–10.
- **Bands:** ≤3 unlikely (discharge with safety-netting); 4–6 possible (observe / image); ≥7 likely (surgical consult).

#### 3.3.4 `tal-bronchiolitis` — Tal score (acute bronchiolitis severity)

- **Citation:** Tal A, Bavilski C, Yohai D, Bearman JE, Gorodischer R, Moses SW. *Dexamethasone and salbutamol in the treatment of acute wheezing in infants.* Pediatrics 1983;71(1):13-18 (modified Tal commonly tabulated; Wang et al. 1992 alt).
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pediatric-emergency-medicine`, `pediatrics`.
- **Inputs:** Respiratory rate (0–3), wheezing (0–3), retractions (0–3), cyanosis / SpO2 (0–3). Sum 0–12.
- **Bands:** ≤5 mild; 6–8 moderate; ≥9 severe.

#### 3.3.5 `pids-idsa-cap-severity` — PIDS/IDSA pediatric CAP severity

- **Citation:** Bradley JS, Byington CL, Shah SS, et al. *The management of community-acquired pneumonia in infants and children older than 3 months of age: clinical practice guidelines by the Pediatric Infectious Diseases Society and the Infectious Diseases Society of America.* Clin Infect Dis 2011;53(7):e25-e76.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`, `pediatric-infectious-disease`.
- **Inputs:** Age-specific tachypnea, retractions, hypoxemia, dehydration, mental status, comorbidities.
- **Output:** Mild / moderate / severe with admission-site recommendation.

### 3.4 Head & spine trauma (PECARN family + adjuncts)

#### 3.4.1 `pecarn-head-under-2` — PECARN head injury rule (<2 yr)

- **Citation:** Kuppermann N, Holmes JF, Dayan PS, et al. *Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study.* Lancet 2009;374(9696):1160-1170.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `pediatrics`, `emergency-medicine`.
- **Inputs:** AMS, scalp hematoma (non-frontal), LOC ≥5 s, severe mechanism, palpable skull fracture, not acting normally per parent.
- **Output:** CT recommended / observation / not recommended per the original algorithm.

#### 3.4.2 `pecarn-head-2-plus` — PECARN head injury rule (≥2 yr)

- **Citation:** Kuppermann N, Holmes JF, Dayan PS, et al. *PECARN head injury rule.* Lancet 2009;374(9696):1160-1170.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `emergency-medicine`.
- **Inputs:** AMS, LOC, vomiting, severe mechanism, severe headache, basilar skull fracture signs.
- **Output:** CT recommended / observation / not recommended.

#### 3.4.3 `chalice` — CHALICE head injury rule (peds)

- **Citation:** Dunning J, Daly JP, Lomas JP, et al. *Derivation of the children's head injury algorithm for the prediction of important clinical events decision rule for head injury in children.* Arch Dis Child 2006;91(11):885-891.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `emergency-medicine`.
- **Inputs:** History (witnessed LOC ≥5 min, amnesia ≥5 min, abnormal drowsiness, ≥3 vomits, suspected NAI, seizure post-injury), examination (GCS <14, suspected skull fracture, tense fontanelle, signs of basilar #, focal neurology, bruise/swelling/laceration ≥5 cm in <1 yr), mechanism (high-speed RTC, fall >3 m, high-velocity impact).
- **Output:** CT recommended if any positive.

#### 3.4.4 `catch` — Canadian Assessment of Tomography for Childhood Head Injury

- **Citation:** Osmond MH, Klassen TP, Wells GA, et al. *CATCH: a clinical decision rule for the use of computed tomography in children with minor head injury.* CMAJ 2010;182(4):341-348.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `emergency-medicine`.
- **Inputs:** High-risk (GCS <15 at 2 h, suspected open/depressed skull fracture, worsening headache, irritability) and medium-risk (basilar skull # signs, large boggy hematoma, dangerous mechanism) criteria.
- **Output:** CT recommended if any high or medium criterion positive.

#### 3.4.5 `canadian-cspine-peds` — Pediatric C-spine clearance rule (Leonard / PECARN derivation reference)

- **Citation:** Leonard JC, Kuppermann N, Olsen C, et al. *Factors associated with cervical spine injury in children after blunt trauma.* Ann Emerg Med 2011;58(2):145-155.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `emergency-medicine`.
- **Inputs:** AMS, focal neuro deficit, neck pain, torticollis, substantial torso injury, predisposing condition, diving / high-risk MVC mechanism.
- **Output:** Imaging recommended if any factor present; otherwise low-risk clearance.

### 3.5 Pediatric pain & sedation

#### 3.5.1 `flacc` — FLACC behavioral pain scale

- **Citation:** Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. *The FLACC: a behavioral scale for scoring postoperative pain in young children.* Pediatr Nurs 1997;23(3):293-297.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pediatrics`, `pediatric-anesthesiology`, `pediatric-emergency-medicine`.
- **Inputs:** Face, Legs, Activity, Cry, Consolability each 0–2.
- **Output:** Sum 0–10 with mild / moderate / severe band.

#### 3.5.2 `comfort-b` — COMFORT Behavior scale

- **Citation:** Ambuel B, Hamlett KW, Marx CM, Blumer JL. *Assessing distress in pediatric intensive care environments: the COMFORT scale.* J Pediatr Psychol 1992;17(1):95-109; van Dijk M, et al. (Behavior modification 2005).
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pediatric-critical-care`, `pediatric-anesthesiology`.
- **Inputs:** Alertness, calmness/agitation, respiratory response, physical movement, facial tension, muscle tone (each 1–5).
- **Output:** Sum 6–30 with under / adequate / over sedation band.

#### 3.5.3 `aldrete-recovery` — Modified Aldrete post-anesthesia recovery score

- **Citation:** Aldrete JA. *The post-anesthesia recovery score revisited.* J Clin Anesth 1995;7(1):89-91.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `pediatric-anesthesiology`, `pacu-nursing`.
- **Inputs:** Activity, respiration, circulation, consciousness, SpO2 (each 0–2).
- **Output:** Sum 0–10; ≥9 supports PACU discharge.

### 3.6 Growth & development

#### 3.6.1 `schwartz-height-velocity` — Schwartz height-velocity z-score

- **Citation:** Tanner JM, Davies PS. *Clinical longitudinal standards for height and height velocity for North American children.* J Pediatr 1985;107(3):317-329.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-endocrinology`, `pediatrics`.
- **Inputs:** Sex, age 1, height 1, age 2, height 2.
- **Output:** cm/yr + z-score vs reference; <-2 SD flags growth-failure work-up.

#### 3.6.2 `who-bmi-z-age` — WHO BMI-for-age z-score (0–19 yr)

- **Citation:** de Onis M, Onyango AW, Borghi E, Siyam A, Nishida C, Siekmann J. *Development of a WHO growth reference for school-aged children and adolescents.* Bull World Health Organ 2007;85(9):660-667.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `family-medicine`, `pediatric-endocrinology`, `public-health`.
- **Inputs:** Sex, age (mo or yr), height, weight.
- **Output:** BMI, BMI z-score and percentile per WHO LMS tables.

### 3.7 Pediatric bedside emergencies

#### 3.7.1 `peds-vitals-reference` — Pediatric age-based vital-sign reference (PALS 2020)

- **Citation:** Topjian AA, Raymond TT, Atkins D, et al. *Part 4: Pediatric Basic and Advanced Life Support: 2020 AHA Guidelines.* Circulation 2020;142(16 Suppl 2):S469-S523.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`, `pediatric-critical-care`.
- **Inputs:** Age band (neonate, infant, toddler, preschool, school-age, adolescent).
- **Output:** Expected HR, RR, SBP-5th-percentile threshold per PALS 2020 Table 1.

## 4. Group homes

- Clinical Scoring & Risk (`G`): §3.1.1–§3.1.5, §3.5.3, §3.6.1, §3.6.2.
- Clinical Criteria & Diagnostic Bundles (`H`): §3.2.1–§3.2.3, §3.3.2, §3.3.3, §3.4.1–§3.4.5, §3.7.1.
- Patient-Reported Symptom Indices (`I`): §3.2.4, §3.5.1, §3.5.2.
- Clinical Scoring & Risk (`G`): §3.3.1.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Pediatric tiles
additionally record:

- The age-range and weight-range boundary the tile is validated
  for, surfaced as a hard input gate (not a soft warning).
- The PALS / NRP / AAP guideline version whose thresholds the
  tile encodes; if the tile is keyed to a guideline (AAP 2022,
  PALS 2020, NRP 8th ed), a version field is preserved in the
  audit log so a future guideline revision triggers a re-audit
  rather than a silent drift.
- For neonatal hyperbilirubinemia tiles, the audit additionally
  records the gestational-age and risk-factor inputs verbatim
  per the AAP 2022 figures.

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v21    | 428 | +25 |
| **v22**| **453** | **+25** |

## 7. What ships after v22

- **v23** — field medicine, global health, environmental
  exposure (MUAC, WHO SAM/MAM, IMCI fast-breathing, peds
  Parkland & Lund-Browder, Szpilman, Lake Louise AMS, HACE
  /HAPE, Swiss hypothermia, frostbite, START / JumpSTART /
  SALT, heat stroke).
- **v24** — patient-decoder expansion + cross-specialty
  completers (EOB/MSN/drug-tier/vaccine decoders, Caprini,
  IMPROVE-DD, Geneva revised, age-adjusted D-dimer, DOAC renal
  dosing, IPI/FLIPI/MIPI/IPSS hem-onc family).
