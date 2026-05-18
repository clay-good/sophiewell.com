# spec-v13.md — ICU & critical-care scoring (25 tiles)

> Status: proposed (2026-05-18). v13 is the second catalog-growth
> spec after [spec-v12](spec-v12.md). It adds 25 critical-care
> tiles: ICU mortality scoring, sedation and delirium screening,
> ICU pain assessment, nutritional risk, ventilation / lung-injury
> scoring, vasoactive-drug load, and severe-CAP scoring. Every tile
> ships under the [spec-v11](spec-v11.md) audit floor and the
> [spec-v12 §5](spec-v12.md) per-tile shipping contract; v13 amends
> none of v10's positioning rules, v11's correctness rules, or
> v12's shipping gates.
>
> v13 obeys [spec-v10 §2.2](spec-v10.md)'s dependency budget (no
> new dependencies), [scope-mdcalc-parity](scope-mdcalc-parity.md)'s
> "eventually complete, never rushed" cadence (5–20 audited tiles
> per month, sustainable solo cadence), and the
> [spec-v11 §4](spec-v11.md) specialty-named groups. Catalog
> growth: at v12 close 203 tiles; at v13 close 228 tiles.

## 1. Why v13 exists

ICU and step-down units are the highest-acuity environment in
which Sophie's "calculator a clinician pulls up at 2 a.m."
positioning matters most. v12 picked the highest-frequency
*bedside-medicine* tiles; v13 picks the highest-frequency
*critical-care* tiles. The 25 tiles below cover:

1. **ICU mortality scoring** — APACHE II, SAPS II, MODS, LODS.
   These drive admission triage decisions, mortality
   benchmarking for QI, and "is this patient sicker than
   yesterday?" trajectory reads.
2. **Sedation, delirium, and pain** — RASS, SAS, CAM-ICU,
   ICDSC, 4AT, CPOT, BPS. These are recorded q-shift on every
   ventilated patient under the SCCM PADIS 2018 guidelines;
   their absence is the single most common gap clinicians ask
   Sophie to fill.
3. **Nutrition** — NUTRIC, mNUTRIC, NRS-2002, MUST. Required
   on admission by ASPEN/SCCM 2016 guidelines.
4. **Ventilation / lung injury** — ROX index, HACOR, Berlin
   ARDS criteria, Murray Lung Injury Score, LIPS.
5. **Vasoactive load** — VIS for peri-shock dose tracking.
6. **Severe CAP** — SMART-COP, CRB-65, ATS/IDSA 2019 severe-
   CAP checklist, DRIP score. CURB-65 and PSI are already
   shipped; these are the inpatient-triage extensions.

Each meets the §1 v12 selection criteria: clinical frequency
(every shift, every ICU bed), source stability (decade-old or
guideline-pinned), and audit feasibility (≥3 worked examples
derivable from the source).

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md): no new
dependencies, no model in the loop, no Sophie-authored treatment
recommendations, no live data, no proprietary closed-coefficient
scores, no removal of existing tiles. v13 adds tiles; it amends
no hard rule.

Specifically excluded from v13 (deferred to later specs):

- **SAPS 3, MPM II/III** — alternative ICU mortality scores with
  closed coefficients (SAPS 3) or rarely-used (MPM). SAPS II is
  representative.
- **APACHE III, APACHE IV** — proprietary coefficients (Cerner).
- **TISS-28 nursing workload, TISS-10** — workload measures, not
  bedside-actionable.
- **PIM2 / PIM3, PRISM III** — pediatric ICU mortality; planned
  for a future peds-ICU spec.
- **Brescia-COVID / 4C Mortality / ISARIC** — COVID-specific
  pandemic-era scores; sources stable enough but audience-fit
  weak in steady state.
- **APACHE II Knaus chronic-health categories** — embedded in
  the APACHE II tile rather than as a separate tile.

## 3. The 25 tiles

### 3.1 ICU mortality scoring

#### 3.1.1 `apache2` — APACHE II

- **Citation:** Knaus WA, Draper EA, Wagner DP, Zimmerman JE.
  *APACHE II: A severity of disease classification system.*
  Crit Care Med 1985;13(10):818-829.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `emergency-medicine`,
  `nursing-general`.
- **Inputs:** 12 acute physiology variables (temperature, MAP,
  HR, RR, oxygenation [A-a if FiO₂≥0.5 else PaO₂], arterial pH,
  Na, K, Cr [×2 if ARF], Hct, WBC, GCS), age band (≤44 / 45–54
  / 55–64 / 65–74 / ≥75), and Knaus chronic health category
  (severe organ insufficiency or immunocompromised: +5 if
  nonoperative or emergency postop, +2 if elective postop).
- **Scoring:** Sum APS (each variable scored 0–4 per Knaus 1985
  Table 1) + age points + chronic-health points. Range 0–71.
- **Output:** Score plus Knaus 1985 Table 2 predicted hospital
  mortality (logit model: ln(R/(1-R)) = -3.517 + 0.146 × APACHE
  II + diagnostic-category coefficient + post-emergency-surgery
  coefficient). Sophie ships the score and the published
  band-rate table; the full logit equation is rendered in the
  References region for diagnostic categories the user supplies.
- **Worked example:** Postop sepsis, T 39.5°C, MAP 60, HR 130,
  RR 28, PaO₂ 65 on FiO₂ 0.5, pH 7.32, Na 148, K 5.8, Cr 2.0
  ARF, Hct 32, WBC 18, GCS 13, age 68, immunocompromised on
  chemo → APS 24 + age 5 + chronic 2 = **31** → ~73% predicted
  mortality (nonoperative).

#### 3.1.2 `saps2` — SAPS II

- **Citation:** Le Gall JR, Lemeshow S, Saulnier F. *A new
  Simplified Acute Physiology Score (SAPS II) based on a
  European/North American multicenter study.* JAMA
  1993;270(24):2957-2963.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `emergency-medicine`.
- **Inputs:** 12 physiologic variables (age, HR, SBP, temp,
  PaO₂/FiO₂ if ventilated, urine output, BUN, WBC, K, Na,
  HCO₃, bilirubin, GCS), type of admission
  (scheduled-surgical / medical / unscheduled-surgical), and
  three underlying-disease flags (AIDS, metastatic cancer,
  hematologic malignancy).
- **Scoring:** Per Le Gall 1993 Table 3; range 0–163.
- **Output:** Score plus predicted mortality via the published
  logit: logit = -7.7631 + 0.0737 × SAPS II + 0.9971 ×
  ln(SAPS II + 1). Sophie computes both the score and the
  predicted mortality.

#### 3.1.3 `mods` — Multiple Organ Dysfunction Score

- **Citation:** Marshall JC, Cook DJ, Christou NV, Bernard GR,
  Sprung CL, Sibbald WJ. *Multiple Organ Dysfunction Score: a
  reliable descriptor of a complex clinical outcome.* Crit Care
  Med 1995;23(10):1638-1652.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`.
- **Inputs:** 6 organ-system variables scored 0–4 each:
  respiratory (PaO₂/FiO₂), renal (Cr), hepatic (bilirubin),
  cardiovascular (pressure-adjusted heart rate, PAR = HR ×
  RAP/MAP), hematologic (platelets), neurologic (GCS).
- **Scoring:** Sum 0–24.
- **Output:** Score plus Marshall 1995 Table 4 mortality bands
  (0: <5%; 9–12: ~25%; 13–16: ~50%; 17–20: ~75%; 21–24: ~100%).

#### 3.1.4 `lods` — Logistic Organ Dysfunction System

- **Citation:** Le Gall JR, Klar J, Lemeshow S, et al. *The
  Logistic Organ Dysfunction System.* JAMA 1996;276(10):802-810.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`.
- **Inputs:** 6 organ-system domains (neuro, cardio, renal,
  pulm, hem, hepatic) scored 0/1/3/5 per Le Gall 1996 Table 2.
- **Scoring:** Sum 0–22; predicted mortality via the LODS
  logit (β coefficients in the source paper).
- **Output:** Score plus predicted-mortality percentage.

### 3.2 Sedation & delirium

#### 3.2.1 `rass` — Richmond Agitation-Sedation Scale

- **Citation:** Sessler CN, Gosnell MS, Grap MJ, et al. *The
  Richmond Agitation-Sedation Scale: validity and reliability in
  adult intensive care unit patients.* Am J Respir Crit Care
  Med 2002;166(10):1338-1344.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`,
  `anesthesiology`, `psychiatry`.
- **Inputs:** 10-row picker −5 (unarousable) to +4 (combative)
  with the canonical descriptors from Sessler 2002 Table 1.
- **Output:** RASS level (−5 to +4) and the level's descriptor.
- **`interpretation` block:** SCCM PADIS 2018 (Devlin J, Crit
  Care Med 2018;46(9)) light-sedation target band (−2 to 0).

#### 3.2.2 `sas-riker` — Riker Sedation-Agitation Scale

- **Citation:** Riker RR, Picard JT, Fraser GL. *Prospective
  evaluation of the Sedation-Agitation Scale for adult critically
  ill patients.* Crit Care Med 1999;27(7):1325-1329.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`.
- **Inputs:** 7-row picker 1 (unarousable) to 7 (dangerous
  agitation) with the Riker 1999 descriptors.
- **Output:** SAS 1–7 and descriptor. Ships side by side with
  `rass` so a unit using either scale finds Sophie.

#### 3.2.3 `cam-icu` — Confusion Assessment Method for the ICU

- **Citation:** Ely EW, Inouye SK, Bernard GR, et al.
  *Delirium in mechanically ventilated patients: validity and
  reliability of the Confusion Assessment Method for the ICU
  (CAM-ICU).* JAMA 2001;286(21):2703-2710.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`,
  `psychiatry`.
- **Inputs:** Four-feature algorithm: (1) acute onset or
  fluctuating course; (2) inattention (Attention Screening
  Examination — letters or pictures, ≥2 errors); (3) altered
  level of consciousness (RASS ≠ 0); (4) disorganized
  thinking (4-item question set + command).
- **Output:** CAM-ICU positive (1 + 2 + either 3 or 4) /
  negative. Sophie renders the decision tree visually.

#### 3.2.4 `icdsc` — Intensive Care Delirium Screening Checklist

- **Citation:** Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik
  Y. *Intensive Care Delirium Screening Checklist: evaluation of
  a new screening tool.* Intensive Care Med 2001;27(5):859-864.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`.
- **Inputs:** 8 binary items (altered LOC, inattention,
  disorientation, hallucination/delusion/psychosis,
  psychomotor agitation/retardation, inappropriate speech/mood,
  sleep/wake disturbance, symptom fluctuation) scored 0/1 each.
- **Output:** Total 0–8; ≥4 = delirium (Bergeron 2001 §Results).

#### 3.2.5 `4at` — 4AT delirium screen

- **Citation:** MacLullich AMJ, Shenkin SD, Goodacre S, et al.
  *The 4 'A's Test for detecting delirium in acute medical
  patients (4AT): a diagnostic accuracy study.* Health Technol
  Assess 2019;23(40):1-194.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`,
  `emergency-medicine`, `psychiatry`.
- **Inputs:** Alertness (0/4), AMT4 4-item cognition (0/1/2),
  Attention months-of-year-backwards (0/1/2), Acute change /
  fluctuating course (0/4).
- **Scoring:** Sum 0–12; ≥4 suggests delirium; 1–3 suggests
  cognitive impairment without delirium (MacLullich 2019).

### 3.3 ICU pain

#### 3.3.1 `cpot` — Critical-Care Pain Observation Tool

- **Citation:** Gélinas C, Fillion L, Puntillo KA, Viens C,
  Fortier M. *Validation of the Critical-Care Pain Observation
  Tool in adult patients.* Am J Crit Care 2006;15(4):420-427.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`.
- **Inputs:** Four behaviors (facial expression 0–2; body
  movement 0–2; muscle tension 0–2; ventilator compliance OR
  vocalization 0–2).
- **Scoring:** 0–8; ≥3 considered "unacceptable pain"
  (Gélinas 2006).

#### 3.3.2 `bps` — Behavioral Pain Scale

- **Citation:** Payen JF, Bru O, Bosson JL, et al. *Assessing
  pain in critically ill sedated patients by using a behavioral
  pain scale.* Crit Care Med 2001;29(12):2258-2263.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`.
- **Inputs:** Facial expression (1–4), upper limb movements
  (1–4), compliance with ventilator (1–4).
- **Scoring:** 3–12; >5 considered "unacceptable pain"
  (Payen 2001).

### 3.4 Nutrition risk

#### 3.4.1 `nutric` — NUTRIC Score

- **Citation:** Heyland DK, Dhaliwal R, Jiang X, Day AG.
  *Identifying critically ill patients who benefit the most from
  nutrition therapy: the development and initial validation of a
  novel risk assessment tool.* Crit Care 2011;15(6):R268.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-general`,
  `pharmacy`.
- **Inputs:** Age, APACHE II, SOFA, number of comorbidities,
  days hospital to ICU, IL-6.
- **Scoring:** 0–10; ≥6 = high risk (Heyland 2011 §Methods).

#### 3.4.2 `mnutric` — modified NUTRIC (IL-6 omitted)

- **Citation:** Rahman A, Hasan RM, Agarwala R, Martin C,
  Day AG, Heyland DK. *Identifying critically-ill patients who
  will benefit most from nutritional therapy: further validation
  of the "modified NUTRIC" nutritional risk assessment tool.*
  Clin Nutr 2016;35(1):158-162.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as NUTRIC.
- **Inputs/scoring:** as NUTRIC but IL-6 omitted (since IL-6 is
  rarely available); range 0–9, ≥5 = high risk.

#### 3.4.3 `nrs2002` — Nutrition Risk Screening 2002

- **Citation:** Kondrup J, Rasmussen HH, Hamberg O, Stanga Z.
  *Nutritional risk screening (NRS 2002): a new method based on
  an analysis of controlled clinical trials.* Clin Nutr
  2003;22(3):321-336.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-general`, `geriatrics`, `pharmacy`.
- **Inputs:** Severity of disease (0–3), nutritional status
  (0–3), age ≥70 (+1).
- **Output:** Total ≥3 = at risk for malnutrition (ESPEN 2003
  endorsement).

#### 3.4.4 `must-nutrition` — Malnutrition Universal Screening Tool

- **Citation:** BAPEN. *The 'MUST' Explanatory Booklet.* British
  Association for Parenteral and Enteral Nutrition; 2003 (reprinted
  with minor revisions). Tool derived by Elia M et al. on behalf
  of the MAG/BAPEN Working Group.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-general`, `geriatrics`.
- **Inputs:** BMI (0–2), unplanned weight loss in past 3–6
  months (0–2), acute disease effect (0/2).
- **Output:** 0 low / 1 medium / ≥2 high risk.

### 3.5 Ventilation & lung injury

#### 3.5.1 `rox` — ROX Index (HFNC failure)

- **Citation:** Roca O, Caralt B, Messika J, et al. *An index
  combining respiratory rate and oxygenation to predict outcome
  of nasal high-flow therapy.* Am J Respir Crit Care Med
  2019;199(11):1368-1376.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `pulmonology`,
  `emergency-medicine`.
- **Inputs:** SpO₂ (%), FiO₂ (decimal), respiratory rate.
- **Formula:** ROX = (SpO₂/FiO₂) / RR.
- **Output:** Index value plus Roca 2019 cutoffs at 2/6/12 hours
  post-HFNC initiation: ≥4.88 (2 h), ≥4.88 (6 h), ≥4.88 (12 h)
  predicts HFNC success; <2.85 / <3.47 / <3.85 predicts failure.

#### 3.5.2 `hacor` — HACOR Score (NIV failure)

- **Citation:** Duan J, Han X, Bai L, Zhou L, Huang S. *Assessment
  of heart rate, acidosis, consciousness, oxygenation, and
  respiratory rate to predict noninvasive ventilation failure in
  hypoxemic patients.* Intensive Care Med 2017;43(2):192-199.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `pulmonology`,
  `emergency-medicine`.
- **Inputs:** HR, pH, GCS, PaO₂/FiO₂, RR (each scored per the
  Duan 2017 table).
- **Output:** HACOR 0–25 at 1 hour of NIV. >5 predicts failure
  with high specificity (Duan 2017 §Results).

#### 3.5.3 `berlin-ards` — Berlin ARDS Criteria

- **Citation:** ARDS Definition Task Force, Ranieri VM, Rubenfeld
  GD, et al. *Acute Respiratory Distress Syndrome: The Berlin
  Definition.* JAMA 2012;307(23):2526-2533.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `pulmonology`.
- **Inputs:** Timing (≤1 week of insult), chest imaging
  (bilateral opacities), origin (not fully explained by cardiac
  failure / fluid overload), PaO₂/FiO₂ on PEEP ≥5.
- **Output:** ARDS yes/no plus severity (mild 200–300; moderate
  100–200; severe ≤100).

#### 3.5.4 `lis-murray` — Lung Injury Score (Murray)

- **Citation:** Murray JF, Matthay MA, Luce JM, Flick MR. *An
  expanded definition of the adult respiratory distress syndrome.*
  Am Rev Respir Dis 1988;138(3):720-723.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `pulmonology`,
  `cardiology` (ECMO referral).
- **Inputs:** Chest radiograph quadrants (0–4), hypoxemia score
  by PaO₂/FiO₂ (0–4), PEEP (0–4), compliance (0–4).
- **Output:** Average of the four components; 0 = no injury,
  0.1–2.5 = mild–moderate, >2.5 = severe (ECMO consideration
  per ELSO 2017 guidelines, cited under
  `interpretation.sourceCitation`).

#### 3.5.5 `lips` — Lung Injury Prediction Score

- **Citation:** Gajic O, Dabbagh O, Park PK, et al. *Early
  identification of patients at risk of acute lung injury: evaluation
  of lung injury prediction score in a multicenter cohort study.*
  Am J Respir Crit Care Med 2011;183(4):462-470.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `emergency-medicine`,
  `pulmonology`.
- **Inputs:** Predisposing conditions (shock 2, aspiration 2,
  sepsis 1, pneumonia 1.5, high-risk surgery 1.5, high-risk
  trauma 2) plus modifiers (alcohol abuse 1, obesity BMI>30 1,
  hypoalbuminemia 1, chemotherapy 1, FiO₂ >0.35 or >4 L/min 2,
  tachypnea RR>30 1.5, SpO₂ <95% 1, acidosis pH<7.35 1.5,
  diabetes mellitus −1).
- **Output:** LIPS; ≥4 high risk for ALI/ARDS development.

### 3.6 Vasoactive load

#### 3.6.1 `vis` — Vasoactive-Inotropic Score

- **Citation:** Gaies MG, Gurney JG, Yen AH, et al. *Vasoactive-
  inotropic score as a predictor of morbidity and mortality in
  infants after cardiopulmonary bypass.* Pediatr Crit Care Med
  2010;11(2):234-238.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `cardiology`, `pediatrics`,
  `anesthesiology`.
- **Inputs:** Doses (mcg/kg/min unless noted) of dopamine,
  dobutamine, epinephrine (×100), norepinephrine (×100),
  vasopressin (units/kg/min × 10000), milrinone (×10).
- **Formula:** VIS = dopamine + dobutamine + 100×epi +
  100×norepi + 10×milrinone + 10000×vaso. Sophie also surfaces
  the simpler "Inotrope Score" (IS = dopamine + dobutamine +
  100×epi) per Wernovsky 1995 in the same view.
- **Output:** VIS numeric; band-rate mortality risk from Gaies
  2010 Table 2.

### 3.7 Severe CAP triage

#### 3.7.1 `smart-cop` — SMART-COP

- **Citation:** Charles PGP, Wolfe R, Whitby M, et al. *SMART-COP:
  a tool for predicting the need for intensive respiratory or
  vasopressor support in community-acquired pneumonia.* Clin
  Infect Dis 2008;47(3):375-384.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `infectious-disease`,
  `emergency-medicine`.
- **Inputs:** SBP <90 (2), Multilobar (1), Albumin <3.5 (1),
  RR (age-adjusted threshold) (1), Tachycardia ≥125 (1),
  Confusion (1), Oxygenation low (age-adjusted) (2), Arterial
  pH <7.35 (2).
- **Output:** SMART-COP 0–11; ≥3 indicates need for intensive
  respiratory/vasopressor support; ≥5 = high risk.

#### 3.7.2 `crb65` — CRB-65

- **Citation:** Lim WS, van der Eerden MM, Laing R, et al.
  *Defining community acquired pneumonia severity on presentation
  to hospital: an international derivation and validation study.*
  Thorax 2003;58(5):377-382.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `infectious-disease`,
  `emergency-medicine`.
- **Inputs:** Confusion, RR ≥30, SBP <90 or DBP ≤60, age ≥65.
- **Output:** CRB-65 0–4; mortality bands per Lim 2003 (0:
  1.2%; 1–2: 8.2%; 3–4: 31.4%). Ships next to the existing
  [curb-65](../lib/meta.js) tile for sites without BUN at
  presentation.

#### 3.7.3 `ats-idsa-cap` — ATS/IDSA Severe CAP criteria (2019)

- **Citation:** Metlay JP, Waterer GW, Long AC, et al.
  *Diagnosis and Treatment of Adults with Community-acquired
  Pneumonia. An Official Clinical Practice Guideline of the
  American Thoracic Society and Infectious Diseases Society of
  America.* Am J Respir Crit Care Med 2019;200(7):e45-e67.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `infectious-disease`,
  `emergency-medicine`, `critical-care`.
- **Inputs:** Major criteria (septic shock requiring vasopressors;
  respiratory failure requiring mechanical ventilation) and 9
  minor criteria (RR ≥30, PaO₂/FiO₂ ≤250, multilobar infiltrates,
  confusion/disorientation, uremia BUN ≥20, leukopenia WBC <4,
  thrombocytopenia plt <100, hypothermia <36°C, hypotension
  requiring aggressive fluid resuscitation).
- **Output:** ≥1 major OR ≥3 minor → severe CAP / ICU admission
  per ATS/IDSA 2019 Table 1.

#### 3.7.4 `drip` — DRIP score (drug-resistant pneumonia)

- **Citation:** Webb BJ, Dascomb K, Stenehjem E, Vikram HR,
  Agrwal N, Sakata K, Williams K, Bockorny B, Bagavathy K, Mirza
  S, Metersky M, Dean NC. *Derivation and Multicenter Validation
  of the Drug Resistance in Pneumonia Clinical Prediction Score.*
  Antimicrob Agents Chemother 2016;60(5):2652-2663.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `pulmonology`,
  `emergency-medicine`, `pharmacy`.
- **Inputs:** Major risk factors (antibiotic use last 60 days,
  long-term care residence, tube feeding, prior MDR isolate; ×2
  each) and minor (hospitalization last 60 days, chronic
  pulmonary disease, poor functional status, gastric acid
  suppression, wound care, MRSA colonization; ×1 each).
- **Output:** DRIP 0–17; ≥4 = high risk for DRP (Webb 2016
  §Results); endorsed by 2019 ATS/IDSA for risk-adjusted empiric
  selection.

## 4. Group-home assignments

| Group label                       | New v13 tiles                                                                                                                    | Count |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | apache2, saps2, mods, lods, rass, sas-riker, cam-icu, icdsc, 4at, cpot, bps, nutric, mnutric, nrs2002, must-nutrition, hacor, berlin-ards, lis-murray, lips, smart-cop, crb65, ats-idsa-cap, drip | 23    |
| Clinical Math & Conversions (`E`) | rox, vis                                                                                                                          | 2     |

23 + 2 = 25.

## 5. Per-tile shipping contract

Inherits [spec-v12 §5](spec-v12.md) verbatim. The 13-point gate
applies unchanged: audit log in PASS state, primary citation
re-verified ≤300 chars, ≥3 boundary worked examples, cross-
implementation differential ≤0.5% (or one category for ordinal
scores), edge-input handling reviewed, a11y + keyboard pass,
`interpretation` block iff source publishes per-band guidance,
`META[id].specialties` in the closed vocabulary, pure-function
renderer, CHANGELOG `### Added` entry, sitemap + tool-page + OG
generated automatically, `npm run release:check` green.

## 6. Sequencing

v13 ships in waves, one PR per wave, clinical-adjacency bundles:

- **Wave 13-0** — this spec doc.
- **Wave 13-1 (ICU mortality)** — apache2, saps2, mods, lods.
- **Wave 13-2 (sedation+delirium)** — rass, sas-riker, cam-icu,
  icdsc, 4at.
- **Wave 13-3 (pain)** — cpot, bps.
- **Wave 13-4 (nutrition)** — nutric, mnutric, nrs2002,
  must-nutrition.
- **Wave 13-5 (ventilation+lung injury)** — rox, hacor,
  berlin-ards, lis-murray, lips.
- **Wave 13-6 (pressors)** — vis.
- **Wave 13-7 (severe CAP)** — smart-cop, crb65, ats-idsa-cap,
  drip.
- **Wave 13-8 (closeout)** — CHANGELOG summary, catalog count
  203 → 228, audit-coverage 100% at v13 close.

## 7. Acceptance criteria

v13 ships when:

1. All 25 §3 tiles render on the home grid under §4 groups.
2. Every §3 tile has `docs/audits/v11/<tile-id>.md` PASS or
   PASS-WITH-FIXES.
3. `scripts/audit-coverage.mjs` reports 228/228 (100%).
4. `npm run lint`, `npm run test`, `npm run build`,
   `npm run test:e2e` all pass.
5. CHANGELOG documents every tile under Unreleased `### Added`.
6. Home meta description, JSON-LD, OG: 203 → 228.
7. Sitemap + tool pages + OG images + audience hubs regenerate
   automatically.
8. No regression in the existing 203 tiles.

## 8. Out of scope

Already enumerated in §2. v13 also defers:

- **Status-epilepticus scoring (STESS, EMSE)** — neurology;
  planned for the v16 neuro bundle.
- **CARDS / CALIPSO / NEWS-COVID** — pandemic-era; audience-fit
  weak.
- **Sepsis-induced coagulopathy (SIC) score** — heme-onc spec.
- **ACOG / SOGC obstetric-ICU scoring** — OB-specific; v15.

## 9. Quick reference

| Id                | Visible name                                        | Group |
|-------------------|-----------------------------------------------------|-------|
| `apache2`         | APACHE II                                           | G     |
| `saps2`           | SAPS II                                             | G     |
| `mods`            | Multiple Organ Dysfunction Score                    | G     |
| `lods`            | Logistic Organ Dysfunction System                   | G     |
| `rass`            | Richmond Agitation-Sedation Scale                   | G     |
| `sas-riker`       | Riker Sedation-Agitation Scale                      | G     |
| `cam-icu`         | CAM-ICU                                             | G     |
| `icdsc`           | Intensive Care Delirium Screening Checklist         | G     |
| `4at`             | 4AT delirium screen                                 | G     |
| `cpot`            | Critical-Care Pain Observation Tool                 | G     |
| `bps`             | Behavioral Pain Scale                               | G     |
| `nutric`          | NUTRIC Score                                        | G     |
| `mnutric`         | modified NUTRIC                                     | G     |
| `nrs2002`         | NRS 2002                                            | G     |
| `must-nutrition`  | MUST nutrition screen                               | G     |
| `rox`             | ROX Index                                           | E     |
| `hacor`           | HACOR (NIV failure)                                 | G     |
| `berlin-ards`     | Berlin ARDS criteria                                | G     |
| `lis-murray`      | Murray Lung Injury Score                            | G     |
| `lips`            | Lung Injury Prediction Score                        | G     |
| `vis`             | Vasoactive-Inotropic Score                          | E     |
| `smart-cop`       | SMART-COP                                           | G     |
| `crb65`           | CRB-65                                              | G     |
| `ats-idsa-cap`    | ATS/IDSA Severe CAP criteria (2019)                 | G     |
| `drip`            | DRIP score (drug-resistant pneumonia)               | G     |

Total: 25 tiles. Catalog 203 → 228 at v13 close.
