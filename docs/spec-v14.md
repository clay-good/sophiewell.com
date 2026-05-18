# spec-v14.md — pre-op risk, anticoagulation & VTE, OSA, recovery (25 tiles)

> Status: proposed (2026-05-18). v14 is the third catalog-growth
> spec after [spec-v12](spec-v12.md) and [spec-v13](spec-v13.md).
> It adds 25 perioperative-and-bleeding tiles: cardiac and
> pulmonary preoperative risk, sleep-disordered-breathing
> screening (load-bearing for anesthesia clearance), PONV /
> recovery scoring, alternative atrial-fibrillation bleeding
> scores, medical-inpatient VTE & bleeding scores, cancer-VTE,
> VTE-recurrence scoring, HIT scoring, ISTH DIC scoring, and
> dual-antiplatelet-therapy duration scoring.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v14 amends no hard rule from v10/v11/v12/v13. Catalog growth:
> at v13 close 228 tiles; at v14 close 253 tiles.

## 1. Why v14 exists

The pre-op clinic, the anticoagulation service, and the
hospital-medicine VTE-prevention workflow are three of the
highest-volume decision surfaces in adult medicine that v12
and v13 did not directly cover. v14 fills them. The 25 tiles
below break into five clinical bundles:

1. **Pre-op cardiac and pulmonary risk** — Gupta MICA, ARISCAT,
   Goldman, Detsky. RCRI is already shipped; v14 adds the
   complementary tools used when RCRI is borderline or for
   post-Roach Goldman audits.
2. **Sleep-disordered breathing** — STOP-BANG, Berlin questionnaire
   for OSA, Epworth Sleepiness Scale. Required by ASA and SAMBA
   pre-op clearance algorithms and by primary-care OSA screening.
3. **Airway, PONV, recovery** — LEMON difficult-airway predictor,
   Apfel PONV score, modified Aldrete recovery score, White-Song
   fast-track recovery score.
4. **AFib bleeding alternatives + medical-inpatient prophylaxis** —
   ATRIA, ORBIT, HEMORR₂HAGES, IMPROVE bleeding, IMPROVE VTE.
5. **Cancer VTE, VTE recurrence, HIT, DIC, DAPT duration** —
   Khorana, DASH, HERDOO2, Vienna prediction model, 4Ts, HEP,
   ISTH DIC, DAPT score, PRECISE-DAPT.

Each meets the v12 §1 criteria (frequency × stability × audit
feasibility).

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md) and
[spec-v13 §2](spec-v13.md). v14 specifically defers:

- **ACS NSQIP universal calculator** — proprietary coefficients
  (American College of Surgeons closed access).
- **POSSUM / P-POSSUM** — physiological/operative scoring requires
  intraoperative variables many sites don't capture; lower
  audience-fit at the bedside.
- **EuroSCORE II, STS Risk Score** — proprietary coefficients.
- **CHADS₂ (legacy)** — superseded by CHA₂DS₂-VASc, already
  shipped.
- **CHA₂DS₂-VA** — gender-neutral 2024 ESC variant; defer pending
  more independent validation cohorts.
- **SAMe-TT₂R₂** — predicts warfarin INR-stability; specific to
  warfarin, declining clinical relevance as DOACs dominate.

## 3. The 25 tiles

### 3.1 Pre-op cardiac / pulmonary risk

#### 3.1.1 `gupta-mica` — Gupta Postop Cardiac Risk (MICA)

- **Citation:** Gupta PK, Gupta H, Sundaram A, et al.
  *Development and validation of a risk calculator for prediction
  of cardiac risk after surgery.* Circulation 2011;124(4):381-387.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `cardiology`, `surgery`.
- **Inputs:** Age, ASA class, functional status (independent /
  partially / totally dependent), creatinine (≤1.5 / >1.5 /
  unknown), procedure type (24 NSQIP categories with published
  β coefficients).
- **Output:** Predicted probability of perioperative MI or
  cardiac arrest using the Gupta 2011 logistic equation.

#### 3.1.2 `ariscat` — ARISCAT (postop pulmonary complication)

- **Citation:** Canet J, Gallart L, Gomar C, et al.
  *Prediction of postoperative pulmonary complications in a
  population-based surgical cohort.* Anesthesiology 2010;113(6):
  1338-1350.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `pulmonology`, `surgery`.
- **Inputs:** Age (<50/51-80/>80; 0/3/16), preop SpO₂ (≥96/91-95/
  ≤90; 0/8/24), respiratory infection in past month (17),
  preop anemia Hb ≤10 g/dL (11), upper-abdominal incision (15),
  thoracic incision (24), surgical duration (<2h/2-3h/>3h;
  0/16/23), emergency procedure (8).
- **Output:** ARISCAT 0–123; low (<26), intermediate (26–44),
  high (≥45) risk per Canet 2010 Table 3.

#### 3.1.3 `goldman-cardiac` — Goldman Cardiac Risk Index

- **Citation:** Goldman L, Caldera DL, Nussbaum SR, et al.
  *Multifactorial index of cardiac risk in noncardiac surgical
  procedures.* N Engl J Med 1977;297(16):845-850.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `cardiology`, `surgery`,
  `geriatrics`.
- **Inputs:** Age >70 (5), MI in past 6 mo (10), S3 gallop or
  JVD (11), aortic stenosis (3), non-sinus rhythm (7), >5 PVCs/min
  (7), poor general condition (3), intraperitoneal / intrathoracic
  / aortic surgery (3), emergency operation (4).
- **Output:** Sum 0–53; class I (0–5), II (6–12), III (13–25),
  IV (≥26) with Goldman 1977 Table 4 mortality and life-
  threatening-complication rates. Sophie ships Goldman next to
  the already-shipped [rcri](../lib/meta.js) tile; documentation
  flags Goldman as the older score with RCRI preferred per
  AHA/ACC 2014 perioperative guidelines.

#### 3.1.4 `detsky-mcri` — Detsky Modified Cardiac Risk Index

- **Citation:** Detsky AS, Abrams HB, McLaughlin JR, et al.
  *Predicting cardiac complications in patients undergoing non-
  cardiac surgery.* J Gen Intern Med 1986;1(4):211-219.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as goldman-cardiac.
- **Inputs:** CAD MI in past 6mo (10) or >6mo (5), Canadian CV
  Class III (10) or IV (20), unstable angina past 3mo (10),
  pulmonary edema past week (10) or ever (5), suspected critical
  AS (20), arrhythmia non-sinus or PACs (5) or >5 PVCs/min (5),
  age >70 (5), emergency surgery (10), poor general medical
  status (5).
- **Output:** 0–120; class I (0–15), II (16–30), III (>30) with
  Detsky 1986 likelihood ratios for cardiac complications.

### 3.2 Sleep-disordered breathing

#### 3.2.1 `stop-bang` — STOP-BANG OSA Screen

- **Citation:** Chung F, Yegneswaran B, Liao P, et al. *STOP
  questionnaire: a tool to screen patients for obstructive sleep
  apnea.* Anesthesiology 2008;108(5):812-821. (BANG extension:
  Chung F, Subramanyam R, Liao P, Sasaki E, Shapiro C, Sun Y.
  *High STOP-Bang score indicates a high probability of obstructive
  sleep apnoea.* Br J Anaesth 2012;108(5):768-775.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `pulmonology`, `nursing-general`,
  `nursing-general`.
- **Inputs:** Snore loudly (S), Tired (T), Observed apnea (O),
  high blood Pressure (P), BMI >35 (B), Age >50 (A), Neck
  circumference >40 cm (N), Gender male (G).
- **Output:** 0–8; 0–2 low risk, 3–4 intermediate, 5–8 high
  risk for moderate-to-severe OSA (Chung 2012 Table 3).

#### 3.2.2 `berlin-osa` — Berlin Questionnaire for OSA

- **Citation:** Netzer NC, Stoohs RA, Netzer CM, Clark K, Strohl
  KP. *Using the Berlin Questionnaire to identify patients at
  risk for the sleep apnea syndrome.* Ann Intern Med 1999;131(7):
  485-491.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `nursing-general`,
  `anesthesiology`.
- **Inputs:** Three categories: (1) snoring; (2) daytime
  somnolence; (3) hypertension or BMI >30. Each category
  scored "high-risk" by criteria-specific rules per Netzer 1999.
- **Output:** High risk if ≥2 categories are high-risk; low risk
  if 0 or 1.

#### 3.2.3 `epworth` — Epworth Sleepiness Scale

- **Citation:** Johns MW. *A new method for measuring daytime
  sleepiness: the Epworth sleepiness scale.* Sleep 1991;14(6):
  540-545.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `psychiatry`, `nursing-general`.
- **Inputs:** Eight scenarios (sitting and reading; watching TV;
  sitting in a public place; passenger in a car for an hour;
  lying down to rest in the afternoon; sitting and talking;
  sitting quietly after lunch; in a car stopped in traffic) each
  scored 0–3.
- **Output:** 0–24; 0–10 normal, 11–14 mild excessive daytime
  sleepiness, 15–17 moderate, 18–24 severe per Johns 1991.

### 3.3 Airway, PONV, recovery

#### 3.3.1 `lemon` — LEMON Difficult Airway Predictor

- **Citation:** Reed MJ, Dunn MJG, McKeown DW. *Can an airway
  assessment score predict difficulty at intubation in the
  emergency department?* Emerg Med J 2005;22(2):99-102.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** Look externally (1), Evaluate 3-3-2 rule (1 per
  failed measurement: 3 fingers mouth opening, 3 fingers
  mentum-hyoid, 2 fingers floor-of-mouth-to-thyroid; up to 3),
  Mallampati ≥III (1), Obstruction (1), Neck mobility limited (1).
- **Output:** 0–8 (sum); higher = more difficult. Sophie ships
  side-by-side with the already-shipped [mallampati](../lib/meta.js)
  tile.

#### 3.3.2 `apfel` — Apfel PONV simplified score

- **Citation:** Apfel CC, Läärä E, Koivuranta M, Greim CA,
  Roewer N. *A simplified risk score for predicting postoperative
  nausea and vomiting: conclusions from cross-validations
  between two centers.* Anesthesiology 1999;91(3):693-700.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `nursing-general`, `surgery`.
- **Inputs:** Female sex (1), nonsmoker (1), history of PONV or
  motion sickness (1), use of postoperative opioids (1).
- **Output:** 0–4; risk of PONV ~10%, 20%, 40%, 60%, 80%
  respectively (Apfel 1999 Table 4).

#### 3.3.3 `aldrete` — modified Aldrete Recovery Score

- **Citation:** Aldrete JA. *The post-anesthesia recovery score
  revisited.* J Clin Anesth 1995;7(1):89-91. (Original: Aldrete
  JA, Kroulik D. *A postanesthetic recovery score.* Anesth Analg
  1970;49(6):924-934.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `nursing-general`.
- **Inputs:** Five domains scored 0–2 each: activity (movement
  of limbs), respiration, circulation (BP within 20%/20-50%/
  >50% of baseline), consciousness, oxygen saturation.
- **Output:** 0–10; ≥9 = ready for discharge from PACU (Aldrete
  1995).

#### 3.3.4 `white-song` — White-Song Fast-Track Score

- **Citation:** White PF, Song D. *New criteria for fast-tracking
  after outpatient anesthesia: a comparison with the modified
  Aldrete's scoring system.* Anesth Analg 1999;88(5):1069-1072.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `nursing-general`.
- **Inputs:** Six domains scored 0–2 each: LOC, physical
  activity, hemodynamic stability, respiratory stability, oxygen
  saturation, postoperative pain, postoperative emesis.
- **Output:** 0–14; ≥12 with no individual score <1 = ready to
  bypass PACU (fast-track).

### 3.4 Atrial-fibrillation bleeding alternatives

#### 3.4.1 `atria-bleeding` — ATRIA Bleeding Score

- **Citation:** Fang MC, Go AS, Chang Y, et al. *A new risk
  scheme to predict warfarin-associated hemorrhage. The ATRIA
  (Anticoagulation and Risk Factors in Atrial Fibrillation)
  Study.* J Am Coll Cardiol 2011;58(4):395-401.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `hematology`, `pharmacy`,
  `geriatrics`.
- **Inputs:** Anemia (3), severe renal disease eGFR <30 (3),
  age ≥75 (2), prior bleeding (1), hypertension (1).
- **Output:** 0–10; 0–3 low, 4 intermediate, 5–10 high annual
  major-bleed risk (0.8% / 2.6% / 5.8% per Fang 2011 Table 3).

#### 3.4.2 `orbit-bleeding` — ORBIT Bleeding Score

- **Citation:** O'Brien EC, Simon DN, Thomas LE, et al. *The
  ORBIT bleeding score: a simple bedside score to assess bleeding
  risk in atrial fibrillation.* Eur Heart J 2015;36(46):3258-
  3264.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `hematology`, `pharmacy`.
- **Inputs:** Hemoglobin <13 male / <12 female or hematocrit
  <40%/<36% (2), age >74 (1), bleeding history (2), renal
  insufficiency eGFR<60 (1), treatment with antiplatelet (1).
- **Output:** 0–7; 0–2 low, 3 intermediate, ≥4 high (annual
  major bleed 2.4% / 4.7% / 8.1% per O'Brien 2015 Table 3).

#### 3.4.3 `hemorr2hages` — HEMORR₂HAGES

- **Citation:** Gage BF, Yan Y, Milligan PE, et al. *Clinical
  classification schemes for predicting hemorrhage: results from
  the National Registry of Atrial Fibrillation (NRAF).* Am Heart
  J 2006;151(3):713-719.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `hematology`, `pharmacy`.
- **Inputs:** Hepatic/Renal (1), EtOH abuse (1), Malignancy (1),
  Older >75 (1), Reduced platelet count/function (1), Rebleeding
  history (2), Hypertension uncontrolled (1), Anemia (1), Genetic
  factors / CYP2C9 variants (1), Excessive fall risk (1), Stroke
  (1).
- **Output:** 0–12; bleed rate per 100 patient-years per Gage
  2006 Table 3.

### 3.5 Medical-inpatient prophylaxis

#### 3.5.1 `improve-bleeding` — IMPROVE Bleeding Risk Score

- **Citation:** Decousus H, Tapson VF, Bergmann JF, et al.
  *Factors at admission associated with bleeding risk in medical
  patients: findings from the IMPROVE investigators.* Chest
  2011;139(1):69-79.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `nursing-general`, `geriatrics`.
- **Inputs:** Active gastroduodenal ulcer (4.5), bleeding 3 mo
  prior (4), platelet count <50 (4), age ≥85 (3.5), hepatic
  failure (2.5), severe renal failure (2.5), ICU admission (2.5),
  central venous catheter (2), rheumatic disease (2), current
  cancer (2), male (1), age 40–84 (1.5), moderate renal failure
  (1).
- **Output:** Sum; ≥7 = high bleeding risk → consider mechanical
  prophylaxis over pharmacologic per Decousus 2011 §Results.

#### 3.5.2 `improve-vte` — IMPROVE VTE Risk Score

- **Citation:** Spyropoulos AC, Anderson FA Jr, FitzGerald G, et
  al. *Predictive and associative models to identify hospitalized
  medical patients at risk for VTE.* Chest 2011;140(3):706-714.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `nursing-general`, `geriatrics`.
- **Inputs:** Prior VTE (3), thrombophilia (2), lower-limb
  paralysis (2), current cancer (2), immobilized ≥7d (1), ICU/CCU
  stay (1), age >60 (1).
- **Output:** 0–12; ≥2 = candidate for prophylaxis; ≥4 = extended-
  duration prophylaxis per Spyropoulos 2011.

### 3.6 Cancer-VTE & VTE-recurrence

#### 3.6.1 `khorana` — Khorana Cancer-VTE Score

- **Citation:** Khorana AA, Kuderer NM, Culakova E, Lyman GH,
  Francis CW. *Development and validation of a predictive model
  for chemotherapy-associated thrombosis.* Blood 2008;111(10):
  4902-4907.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`, `pharmacy`.
- **Inputs:** Site of cancer (very-high-risk e.g. stomach/pancreas
  = 2; high-risk e.g. lung/lymphoma/gyn/bladder/testicular = 1;
  other = 0), platelet count ≥350 (1), Hb <10 or ESA use (1),
  WBC >11 (1), BMI ≥35 (1).
- **Output:** 0–6; 0 low, 1–2 intermediate, ≥3 high (2.5-mo VTE
  rate 0.3% / 2.0% / 6.7%) per Khorana 2008 Table 3.

#### 3.6.2 `dash-vte` — DASH VTE-Recurrence Score

- **Citation:** Tosetto A, Iorio A, Marcucci M, et al. *Predicting
  disease recurrence in patients with previous unprovoked venous
  thromboembolism: a proposed prediction score (DASH).* J Thromb
  Haemost 2012;10(6):1019-1025.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `cardiology`, `pulmonology`.
- **Inputs:** D-dimer abnormal post-anticoagulation (2), Age <50
  (1), Sex male (1), Hormone use at time of initial VTE in women
  (−2).
- **Output:** Sum; ≤1 low (annual recurrence 3.1%), 2 intermediate
  (6.4%), ≥3 high (12.3%) per Tosetto 2012 Table 4.

#### 3.6.3 `herdoo2` — HERDOO2 (women with unprovoked VTE)

- **Citation:** Rodger MA, Le Gal G, Anderson DR, et al.
  *Validating the HERDOO2 rule to guide treatment duration for
  women with unprovoked venous thrombosis: multinational
  prospective cohort management study.* BMJ 2017;356:j1065.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `obstetrics-gynecology`.
- **Inputs:** Hyperpigmentation/edema/redness in either leg (1),
  D-dimer ≥250 µg/L on anticoag (1), BMI ≥30 (1), age ≥65 (1).
- **Output:** 0–4 (women only). 0–1 → low risk; safe to
  discontinue anticoagulation. ≥2 → continue.

#### 3.6.4 `vienna-vte` — Vienna Prediction Model

- **Citation:** Eichinger S, Heinze G, Jandeck LM, Kyrle PA.
  *Risk assessment of recurrence in patients with unprovoked deep
  vein thrombosis or pulmonary embolism: the Vienna prediction
  model.* Circulation 2010;121(14):1630-1636.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hematology`.
- **Inputs:** Sex (M/F), site of index event (proximal DVT / distal
  DVT / PE), D-dimer (ng/mL).
- **Output:** Predicted 12- and 60-month recurrence risk via the
  Eichinger 2010 nomogram formulas.

### 3.7 HIT / DIC

#### 3.7.1 `four-ts` — 4Ts Score for HIT

- **Citation:** Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler
  P, Greinacher A. *Evaluation of pretest clinical score (4 T's)
  for the diagnosis of heparin-induced thrombocytopenia in two
  clinical settings.* J Thromb Haemost 2006;4(4):759-765.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `critical-care`, `pharmacy`.
- **Inputs:** Thrombocytopenia (0–2), Timing of platelet fall
  (0–2), Thrombosis or other sequelae (0–2), oTher causes (0–2).
- **Output:** 0–8; 0–3 low, 4–5 intermediate, 6–8 high pretest
  probability (Lo 2006 Table 2).

#### 3.7.2 `hep-hit` — HEP Score for HIT

- **Citation:** Cuker A, Arepally G, Crowther MA, et al. *The HIT
  Expert Probability (HEP) Score: a novel pre-test probability
  model for heparin-induced thrombocytopenia based on broad
  expert opinion.* J Thromb Haemost 2010;8(12):2642-2650.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as four-ts.
- **Inputs:** 8 weighted clinical features per Cuker 2010 Table 1.
- **Output:** Sum; ≥2 → recommend further HIT workup; sensitivity/
  specificity vs 4Ts surfaced in interpretation.

#### 3.7.3 `isth-dic` — ISTH Overt DIC Score

- **Citation:** Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M.
  *Towards definition, clinical and laboratory criteria, and a
  scoring system for disseminated intravascular coagulation.*
  Thromb Haemost 2001;86(5):1327-1330.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `critical-care`,
  `obstetrics-gynecology`.
- **Inputs:** Platelet count (>100 = 0; 50–100 = 1; <50 = 2),
  fibrin marker (D-dimer / FDP: no increase 0; moderate 2;
  strong 3), prolonged PT (<3s = 0; 3–6s = 1; >6s = 2),
  fibrinogen (>1 g/L = 0; ≤1 = 1).
- **Output:** Sum; ≥5 = overt DIC per Taylor 2001. Underlying-
  disorder gate (must be present) surfaced before scoring.

### 3.8 DAPT duration

#### 3.8.1 `dapt-score` — DAPT Score

- **Citation:** Yeh RW, Secemsky EA, Kereiakes DJ, et al.
  *Development and validation of a prediction rule for benefit
  and harm of dual antiplatelet therapy beyond 1 year after
  percutaneous coronary intervention.* JAMA 2016;315(16):1735-
  1749.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `pharmacy`.
- **Inputs:** Age (<65 = 0; 65–74 = −1; ≥75 = −2), CHF or LVEF
  <30% (2), vein graft PCI (2), MI at presentation (1), prior
  MI or PCI (1), diabetes (1), stent diameter <3mm (1),
  paclitaxel-eluting stent (1), current smoker (1).
- **Output:** −2 to 10; ≥2 favors continuing DAPT >12 mo (Yeh
  2016 §Results).

#### 3.8.2 `precise-dapt` — PRECISE-DAPT Bleeding Score

- **Citation:** Costa F, van Klaveren D, James S, et al.
  *Derivation and validation of the predicting bleeding
  complications in patients undergoing stent implantation and
  subsequent dual antiplatelet therapy (PRECISE-DAPT) score: a
  pooled analysis of individual-patient datasets from clinical
  trials.* Lancet 2017;389(10073):1025-1034.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `pharmacy`, `hematology`.
- **Inputs:** Hemoglobin (g/dL), white blood cell count
  (×10⁹/L), age, creatinine clearance, prior bleeding (yes/no).
- **Output:** PRECISE-DAPT 0–100 via Costa 2017 nomogram; ≥25 →
  short-DAPT recommended (3–6 mo) per Costa 2017.

## 4. Group-home assignments

| Group label                       | New v14 tiles                                                                                                                                                                          | Count |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | gupta-mica, ariscat, goldman-cardiac, detsky-mcri, stop-bang, berlin-osa, epworth, lemon, apfel, aldrete, white-song, atria-bleeding, orbit-bleeding, hemorr2hages, improve-bleeding, improve-vte, khorana, dash-vte, herdoo2, four-ts, hep-hit, isth-dic, dapt-score | 23    |
| Clinical Math & Conversions (`E`) | vienna-vte, precise-dapt                                                                                                                                                                | 2     |

23 + 2 = 25.

## 5. Per-tile shipping contract

Inherits [spec-v12 §5](spec-v12.md) verbatim. No changes.

## 6. Sequencing

- **Wave 14-0** — this spec doc.
- **Wave 14-1 (pre-op cardiac/pulm)** — gupta-mica, ariscat,
  goldman-cardiac, detsky-mcri.
- **Wave 14-2 (sleep)** — stop-bang, berlin-osa, epworth.
- **Wave 14-3 (airway+PONV+recovery)** — lemon, apfel, aldrete,
  white-song.
- **Wave 14-4 (AFib bleeding)** — atria-bleeding, orbit-bleeding,
  hemorr2hages.
- **Wave 14-5 (inpatient bleeding/VTE)** — improve-bleeding,
  improve-vte.
- **Wave 14-6 (cancer-VTE + recurrence)** — khorana, dash-vte,
  herdoo2, vienna-vte.
- **Wave 14-7 (HIT + DIC)** — four-ts, hep-hit, isth-dic.
- **Wave 14-8 (DAPT)** — dapt-score, precise-dapt.
- **Wave 14-9 (closeout)** — CHANGELOG summary, 228 → 253,
  audit-coverage 100%.

## 7. Acceptance criteria

Same as [spec-v13 §7](spec-v13.md), with the catalog target
adjusted from 228 → 253. `npm run lint`, `npm run test`,
`npm run build`, `npm run test:e2e` all green.

## 8. Out of scope

Already enumerated in §2. Also deferred:

- **VTE-BLEED (long-term anticoag bleed)** — DOAC-specific; defer
  to a future anticoag-bleed bundle once Vienna VTE lands.
- **CAPRINI surgical** — already shipped within
  [wells-dvt-caprini](../lib/meta.js).
- **Padua-VTE** — shipped in v12.
- **CHADS-VASC variants (CHA₂DS₂-VA, R₂-CHADS₂)** — emerging
  alternatives; defer.

## 9. Quick reference

| Id                | Visible name                                              | Group |
|-------------------|-----------------------------------------------------------|-------|
| `gupta-mica`      | Gupta Postop Cardiac Risk (MICA)                          | G     |
| `ariscat`         | ARISCAT postop pulmonary risk                             | G     |
| `goldman-cardiac` | Goldman Cardiac Risk Index                                | G     |
| `detsky-mcri`     | Detsky Modified Cardiac Risk Index                        | G     |
| `stop-bang`       | STOP-BANG OSA screen                                      | G     |
| `berlin-osa`      | Berlin Questionnaire (OSA)                                | G     |
| `epworth`         | Epworth Sleepiness Scale                                  | G     |
| `lemon`           | LEMON difficult-airway predictor                          | G     |
| `apfel`           | Apfel PONV simplified score                               | G     |
| `aldrete`         | modified Aldrete recovery score                           | G     |
| `white-song`      | White-Song fast-track recovery                            | G     |
| `atria-bleeding`  | ATRIA Bleeding Score                                      | G     |
| `orbit-bleeding`  | ORBIT Bleeding Score                                      | G     |
| `hemorr2hages`    | HEMORR₂HAGES                                              | G     |
| `improve-bleeding`| IMPROVE Bleeding Risk Score                               | G     |
| `improve-vte`     | IMPROVE VTE Risk Score                                    | G     |
| `khorana`         | Khorana Cancer-VTE Score                                  | G     |
| `dash-vte`        | DASH VTE Recurrence Score                                 | G     |
| `herdoo2`         | HERDOO2 (women)                                           | G     |
| `vienna-vte`      | Vienna Prediction Model                                   | E     |
| `four-ts`         | 4Ts Score for HIT                                         | G     |
| `hep-hit`         | HEP Score for HIT                                         | G     |
| `isth-dic`        | ISTH Overt DIC Score                                      | G     |
| `dapt-score`      | DAPT Score (continuation)                                 | G     |
| `precise-dapt`    | PRECISE-DAPT Bleeding Score                               | E     |

Total: 25 tiles. Catalog 228 → 253 at v14 close.
