# spec-v12.md — sophiewell.com: the next 25 high-priority clinical tiles

> Status: proposed (2026-05-18). v12 is the first *catalog* spec
> after [spec-v11](spec-v11.md) closed the correctness floor. It
> commits sophiewell.com to add 25 specific clinical-scoring,
> risk-stratification, and clinical-decision tiles whose absence is
> the most-frequently-cited gap between Sophie and MDCalc for
> bedside, hospitalist, ED, and acute-care nursing audiences. Every
> tile in §3 below ships under the [spec-v11](spec-v11.md) audit
> floor: primary citation re-verified, ≥3 boundary worked examples,
> cross-implementation differential within 0.5% (or one category
> for ordinal scores), edge-input handling reviewed, a11y reviewed,
> and a `docs/audits/v11/<tile-id>.md` audit log in PASS or
> PASS-WITH-FIXES state before the tile renders to a user. v12
> obeys [spec-v10](spec-v10.md)'s clinical-first wedge,
> [spec-v10 §2.2](spec-v10.md)'s dependency budget (no new
> dependencies), and [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md)'s
> "eventually complete, never rushed" cadence. Every prior spec
> (v4 through v11) remains in force; v12 adds tiles, it amends no
> hard rule.
>
> Long-horizon framing: v12 is the first 25-tile increment toward
> the 400–600-tile parity target in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md). It is not
> the only increment that will ever ship; it is the next one.

## 1. Why v12 exists

[spec-v10](spec-v10.md) committed Sophie's positioning: the
calculator a clinician pulls up at 2 a.m. — MDCalc without ads,
login, upsell, cookie banner, email capture, or network calls
after first paint. [spec-v11](spec-v11.md) earned the right to
expand by re-verifying every shipped tile against its primary
source. [scope-mdcalc-parity](scope-mdcalc-parity.md) committed
to the long-horizon direction: every clinically-actionable
calculator a healthcare worker would otherwise pull up MDCalc to
find, audited to v11 standards, ad-free and login-free forever.

v12 is the first concrete down payment on that commitment.

The 25 tiles in §3 below were selected by three criteria, in
order:

1. **Clinical frequency.** Each tile drives a decision a
   front-line clinician makes most shifts: admit-vs-discharge
   from the ED, escalate-vs-watch on the floor, transfuse-vs-wait
   for a GI bleeder, image-vs-discharge a head injury, refer-vs-
   reassure a fibrosis result, stratify mortality risk for an MI,
   risk-rank a medical inpatient for VTE prophylaxis. None of the
   25 is niche; every one of them appears on every major
   internal-medicine, hospitalist, ED, and ICU short-list of
   essential bedside calculators.
2. **Source stability.** Each tile's primary citation is a
   peer-reviewed paper or society derivation that has been stable
   on decade timescales. Wells PE from 2000 is still the same
   Wells PE; Charlson from 1987 is still the same Charlson. v12
   does not pick tiles whose formula churns annually.
3. **Audit feasibility under the v11 floor.** Each tile has at
   least three boundary worked examples derivable by hand from
   the primary source, and an independent reference
   implementation (peer-reviewed online calculator, textbook
   worked example, or hand computation) the auditor can use for
   the §3.3 cross-implementation differential.

v12 does **not** pick tiles by "what MDCalc lists first on its
homepage" — Sophie's audience is broader than MDCalc's (nurses,
EMS, billers, educators) and v12's order reflects clinical-
frequency from the audience side, not the marketing side.

## 2. Non-goals

- **No new dependencies.** The [spec-v10 §2.2](spec-v10.md)
  dependency budget is unspent and remains so. Every tile in §3
  ships in pure browser JavaScript with no new npm package, no
  new font, no new web font, no new icon library.
- **No model in the loop.** Per [scope-mdcalc-parity §1
  item 3](scope-mdcalc-parity.md), every tile is a deterministic
  pure function of inputs. No "smart" suggestions, no LLM-
  generated interpretation, no probabilistic outputs that are not
  in the source paper.
- **No tile that authors a treatment recommendation in Sophie's
  voice.** Per [spec-v11 §5.3](spec-v11.md), Sophie may quote the
  per-band interpretation a primary source publishes; Sophie may
  not invent one.
- **No live data dependency.** Per [spec-v5](spec-v5.md), no tile
  in v12 reads a remote URL at render time.
- **No tile whose only source is a single-center single-paper
  validation without independent replication.** Per
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md). The 25 tiles
  in §3 each have multiple independent validations or are
  guideline-endorsed.
- **No removal of any currently-shipping tile.** v12 is purely
  additive. The home grid grows from 178 → 203 tiles.
- **No new audience chips, no new specialty rail, no new
  navigation surface.** The [spec-v11 §4](spec-v11.md) specialty-
  named group labels and the [spec-v11 §4.3](spec-v11.md)
  `META[id].specialties` array are the only filtering surfaces
  v12 uses.

## 3. The 25 tiles

Each tile below specifies: a stable id, a visible name, the
primary citation, the v11 specialty-group home (§4), the input
fields with units, the formula or scoring procedure, the band /
output structure, a worked example, and the `interpretation`
band table when the primary source publishes per-band guidance
per [spec-v11 §5](spec-v11.md). The shipping contract in §5
applies uniformly to every tile.

### 3.1 Inpatient deterioration & early warning

#### 3.1.1 `news2` — National Early Warning Score 2

- **Primary citation:** Royal College of Physicians. *National
  Early Warning Score (NEWS) 2: Standardising the assessment of
  acute-illness severity in the NHS — Updated report of a working
  party.* London: RCP, 2017.
- **Group home:** Clinical Scoring & Risk
  (`G`; [spec-v11 §4.1](spec-v11.md)).
- **`META[id].specialties`:** `nursing-general`, `emergency-medicine`,
  `critical-care`, `pulmonology`.
- **Inputs (all required unless noted):**
  - Respiratory rate (breaths/min, integer 0–60).
  - SpO₂ (%, integer 50–100) **plus** a binary toggle for "Scale 2
    (hypercapnic / chronic Type II respiratory failure)" per
    RCP 2017 §3.4.
  - "On supplemental oxygen?" toggle (yes/no).
  - Systolic BP (mmHg, integer 40–280).
  - Pulse (beats/min, integer 20–250).
  - Consciousness: A / C / V / P / U (ACVPU per RCP 2017 §3.6;
    "New confusion" = C, scored equal to V/P/U for triggering).
  - Temperature (°C, decimal 30.0–43.0).
- **Scoring:** Per RCP 2017 Table 1. Aggregate score 0–20. Any
  single parameter scoring 3 triggers the "red score" pathway
  regardless of aggregate.
- **Output:** Aggregate score, individual parameter scores, and
  the RCP 2017 Table 2 clinical-response trigger band: Low (0),
  Low-medium (1–4 with no single 3), Medium (single parameter
  score of 3, OR aggregate 5–6), High (≥7).
- **`interpretation` bands** (`sourceQuoted: true`, source =
  RCP 2017 Table 2):
  - `0` — Minimum 12-hourly. Continue routine monitoring.
  - `1–4` — Minimum 4–6-hourly. Registered nurse assesses
    whether escalation is required.
  - `single parameter scoring 3` — Minimum 1-hourly. Urgent
    review by clinician with competencies in acute illness.
  - `≥5` — Minimum 1-hourly. Urgent review; consider continuous
    monitoring; consider critical-care review.
  - `≥7` — Continuous monitoring. Emergency assessment by
    critical-care team; usually transfer to higher-acuity area.
- **Worked example (mid-range):** RR 22, SpO₂ 95 on room air,
  SBP 108, HR 102, A, T 37.8 → RR 2 + SpO₂ 1 + air 0 + SBP 1 +
  HR 1 + A 0 + T 0 = **5** → Medium / urgent review.

#### 3.1.2 `mews` — Modified Early Warning Score

- **Primary citation:** Subbe CP, Kruger M, Rutherford P, Gemmel
  L. *Validation of a modified Early Warning Score in medical
  admissions.* QJM 2001;94(10):521-526.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `nursing-general`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** SBP, HR, RR, temperature, AVPU (4-level). No SpO₂
  or supplemental-oxygen field; that is the v12 distinction from
  NEWS2 and is documented inline.
- **Scoring:** Per Subbe 2001 Table 1; aggregate 0–14.
- **Output:** Aggregate score plus per-parameter rows.
- **`interpretation` bands** (Subbe 2001 §Results): MEWS ≥5
  associated with increased risk of death, ICU admission, and
  HDU admission. Sophie ships the four-band split exactly as
  Subbe 2001 Table 2 reports it (0–2, 3, 4, ≥5).
- **Why MEWS *and* NEWS2:** UK / international hospitals use
  NEWS2; US sites that have not converted still teach MEWS. v12
  ships both rather than picking a winner.

### 3.2 Venous thromboembolism risk & severity

#### 3.2.1 `pesi` — Pulmonary Embolism Severity Index

- **Primary citation:** Aujesky D, Obrosky DS, Stone RA, et al.
  *Derivation and validation of a prognostic model for pulmonary
  embolism.* Am J Respir Crit Care Med 2005;172(8):1041-1046.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `pulmonology`, `emergency-medicine`,
  `cardiology`, `critical-care`.
- **Inputs:** Age (years), sex (M/F), history of cancer,
  history of heart failure, history of chronic lung disease,
  pulse ≥110, SBP <100, RR ≥30, temperature <36°C, altered
  mental status, SaO₂ <90% on room air.
- **Scoring:** Age in years + 30 (cancer) + 10 (HF) + 10 (CLD)
  + 20 (pulse) + 30 (SBP) + 20 (RR) + 20 (temp) + 60 (AMS) +
  20 (SaO₂) + 10 (male sex).
- **Output:** Total score and one of five risk classes (I ≤65,
  II 66–85, III 86–105, IV 106–125, V >125) with the Aujesky
  2005 Table 4 30-day mortality range per class.
- **`interpretation` bands** (Aujesky 2005 Table 4): I 0.0–1.6%,
  II 1.7–3.5%, III 3.2–7.1%, IV 4.0–11.4%, V 10.0–24.5%.

#### 3.2.2 `spesi` — Simplified Pulmonary Embolism Severity Index

- **Primary citation:** Jiménez D, Aujesky D, Moores L, et al.
  *Simplification of the pulmonary embolism severity index for
  prognostication in patients with acute symptomatic pulmonary
  embolism.* Arch Intern Med 2010;170(15):1383-1389.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `pulmonology`, `emergency-medicine`,
  `cardiology`.
- **Inputs:** Age >80, cancer history, chronic cardiopulmonary
  disease, HR ≥110, SBP <100, SaO₂ <90%.
- **Scoring:** One point per yes.
- **Output:** sPESI 0 → low risk; ≥1 → not-low risk; Jiménez
  2010 Table 3 30-day all-cause mortality (low 1.0%, not-low
  10.9%).

#### 3.2.3 `padua` — Padua Prediction Score for VTE in medical inpatients

- **Primary citation:** Barbar S, Noventa F, Rossetto V, et al.
  *A risk assessment model for the identification of
  hospitalized medical patients at risk for venous
  thromboembolism: the Padua Prediction Score.* J Thromb Haemost
  2010;8(11):2450-2457.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `hematology`, `nursing-general`,
  `geriatrics`.
- **Inputs:** Active cancer (3), prior VTE (3), reduced mobility
  (3), known thrombophilia (3), recent trauma/surgery (2), age
  ≥70 (1), heart and/or respiratory failure (1), acute MI or
  ischemic stroke (1), acute infection / rheumatologic disorder
  (1), BMI ≥30 (1), ongoing hormonal treatment (1).
- **Scoring:** Sum of weights.
- **Output:** Padua score; threshold ≥4 = high risk for VTE per
  Barbar 2010 §Results; band guidance quoted from Barbar 2010
  Table 4 (no prophylaxis 0.3% 90-day VTE; prophylaxis-eligible
  high-risk 11.0% if untreated).

### 3.3 Upper and lower GI bleeding

#### 3.3.1 `gbs` — Glasgow-Blatchford Bleeding Score

- **Primary citation:** Blatchford O, Murray WR, Blatchford M. *A
  risk score to predict need for treatment for upper-
  gastrointestinal haemorrhage.* Lancet 2000;356(9238):1318-1321.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `gastroenterology`,
  `emergency-medicine`, `hematology`.
- **Inputs:** BUN (mg/dL or mmol/L; converter inline per the
  existing [unit-converter](../lib/meta.js) tile pattern),
  hemoglobin (g/dL or g/L, separate weighting for men and
  women per Blatchford 2000 Table 1), SBP, pulse ≥100, melena,
  recent syncope, hepatic disease, cardiac failure.
- **Scoring:** Per Blatchford 2000 Table 1; range 0–23.
- **Output:** Score plus the Blatchford 2000 §Results "0 = low
  risk for needing intervention; can be considered for outpatient
  management" cutoff. NICE CG141 (2012) endorses outpatient
  management at GBS = 0 — Sophie cites Blatchford 2000 as
  primary and NICE as the guideline endorsement of the cutoff.

#### 3.3.2 `rockall` — Rockall Score (Post-endoscopy, complete)

- **Primary citation:** Rockall TA, Logan RFA, Devlin HB, Northfield
  TC. *Risk assessment after acute upper gastrointestinal
  haemorrhage.* Gut 1996;38(3):316-321.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `gastroenterology`,
  `emergency-medicine`.
- **Inputs:** Age (<60 / 60–79 / ≥80), shock (none / tachycardia
  HR≥100 / hypotension SBP<100), comorbidity tier (none / CHF or
  IHD / renal or hepatic failure or metastatic CA), endoscopic
  diagnosis (Mallory-Weiss or no lesion / all other / upper GI
  malignancy), stigmata of recent hemorrhage (clean base or dark
  spot / blood, adherent clot, or visible/spurting vessel).
- **Scoring:** Per Rockall 1996 Table 1; range 0–11.
- **Output:** Score plus Rockall 1996 Figure 2 rebleed/mortality
  rates by score, quoted in the interpretation block.
- **Pre-endoscopy variant:** A toggle exposes the "pre-endoscopy"
  Rockall (omits endoscopic diagnosis and stigmata; range 0–7).
  This is the Vreeburg 1999 / NICE CG141 endorsed clinical pre-
  endoscopy use; cited under `interpretation.sourceCitation`
  rather than the primary `META.citation`.

#### 3.3.3 `aims65` — AIMS65 Score for Upper GI Bleeding Mortality

- **Primary citation:** Saltzman JR, Tabak YP, Hyett BH, Sun X,
  Travis AC, Johannes RS. *A simple risk score accurately
  predicts in-hospital mortality, length of stay, and cost in
  acute upper GI bleeding.* Gastrointest Endosc 2011;74(6):1215-
  1224.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `gastroenterology`,
  `emergency-medicine`.
- **Inputs:** Albumin <3.0 g/dL (A), INR >1.5 (I), altered mental
  status (M), SBP ≤90 mmHg (S), age >65 (65).
- **Scoring:** One point per criterion; range 0–5.
- **Output:** Score plus Saltzman 2011 Table 4 in-hospital
  mortality bands.

#### 3.3.4 `oakland` — Oakland Score for Safe Discharge in Lower GI Bleeding

- **Primary citation:** Oakland K, Jairath V, Uberoi R, et al.
  *Derivation and validation of a novel risk score for safe
  discharge after acute lower gastrointestinal bleeding: a
  modelling study.* Lancet Gastroenterol Hepatol 2017;2(9):635-
  643.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `gastroenterology`,
  `emergency-medicine`.
- **Inputs:** Age, sex, prior LGIB admission, DRE findings
  (blood vs no blood), HR, SBP, hemoglobin.
- **Scoring:** Per Oakland 2017 Table 2; range 0–35.
- **Output:** Score plus the Oakland 2017 ≤8 cutoff: "safe for
  outpatient management" (95% probability of safe discharge);
  endorsed by BSG 2019 guideline.

### 3.4 Hepatology & liver fibrosis

#### 3.4.1 `fib4` — FIB-4 Index for Liver Fibrosis

- **Primary citation:** Sterling RK, Lissen E, Clumeck N, et al.
  *Development of a simple noninvasive index to predict
  significant fibrosis in patients with HIV/HCV coinfection.*
  Hepatology 2006;43(6):1317-1325.
- **Group home:** Clinical Math & Conversions
  (`E`; the formula is arithmetic with a published cutoff).
- **`META[id].specialties`:** `hepatology`, `gastroenterology`,
  `infectious-disease`.
- **Inputs:** Age (years), AST (U/L), ALT (U/L), platelet count
  (×10⁹/L or ×10³/µL — convertible inline).
- **Formula:** FIB-4 = (age × AST) / (platelets × √ALT).
- **Output:** Numeric FIB-4 plus Sterling 2006 cutoffs (<1.45
  rules out advanced fibrosis NPV 90%; >3.25 rules in advanced
  fibrosis PPV 65%; 1.45–3.25 indeterminate).
- **Worked example:** Age 55, AST 60, ALT 40, platelets
  150×10⁹/L → FIB-4 = (55 × 60) / (150 × √40) = 3300 / 948.7 =
  **3.48** → rules in advanced fibrosis.

#### 3.4.2 `apri` — AST to Platelet Ratio Index

- **Primary citation:** Wai CT, Greenson JK, Fontana RJ, et al.
  *A simple noninvasive index can predict both significant
  fibrosis and cirrhosis in patients with chronic hepatitis C.*
  Hepatology 2003;38(2):518-526.
- **Group home:** Clinical Math & Conversions (`E`).
- **`META[id].specialties`:** `hepatology`, `gastroenterology`,
  `infectious-disease`.
- **Inputs:** AST (U/L), AST upper limit of normal (U/L; default
  40, editable per local lab), platelet count.
- **Formula:** APRI = [(AST / AST_ULN) × 100] / platelets
  (×10⁹/L).
- **Output:** Numeric APRI plus Wai 2003 cutoffs (>0.7 predicts
  significant fibrosis; >1.0 predicts cirrhosis; WHO 2014 HCV
  guideline endorses these cutoffs for resource-limited
  settings).

#### 3.4.3 `maddrey-lille` — Maddrey Discriminant Function + Lille Model

- **Primary citation (Maddrey DF):** Maddrey WC, Boitnott JK,
  Bedine MS, et al. *Corticosteroid therapy of alcoholic
  hepatitis.* Gastroenterology 1978;75(2):193-199.
- **Primary citation (Lille):** Louvet A, Naveau S, Abdelnour M,
  et al. *The Lille model: a new tool for therapeutic strategy in
  patients with severe alcoholic hepatitis treated with
  steroids.* Hepatology 2007;45(6):1348-1354.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `hepatology`, `gastroenterology`,
  `critical-care`.
- **Inputs (DF):** Patient PT (sec), control PT (sec),
  bilirubin (mg/dL).
- **Formula (DF):** DF = 4.6 × (patient PT − control PT) +
  bilirubin.
- **DF cutoff:** ≥32 = severe alcoholic hepatitis (Maddrey
  1978 §Results).
- **Inputs (Lille):** Age, albumin (g/L), creatinine (mg/dL),
  bilirubin day 0 (mg/dL), bilirubin day 7 (mg/dL), prothrombin
  time (sec).
- **Formula (Lille):** Per the Louvet 2007 equation; range 0–1.
  Cutoff ≥0.45 predicts non-response to steroids (6-month
  survival ~25% vs ~85%).
- **Output:** Both scores side by side. The combined card is
  one tile because Lille is only interpretable in the context of
  steroid therapy initiated on a DF ≥32 patient.

### 3.5 Imaging decision rules

#### 3.5.1 `cthr` — Canadian CT Head Rule

- **Primary citation:** Stiell IG, Wells GA, Vandemheen K, et al.
  *The Canadian CT Head Rule for patients with minor head
  injury.* Lancet 2001;357(9266):1391-1396.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `emergency-medicine`, `neurology`,
  `surgery`.
- **Inputs:** High-risk (need for neurosurgical intervention):
  GCS <15 at 2 h post-injury, suspected open/depressed skull
  fracture, any sign of basal skull fracture, ≥2 episodes of
  vomiting, age ≥65. Medium-risk (clinically important brain
  injury on CT): retrograde amnesia ≥30 min, dangerous mechanism.
- **Output:** Recommended (CT) / not recommended (CT) per the
  Stiell 2001 algorithm. The rule applies only to GCS 13–15
  blunt head injury with witnessed LOC, definite amnesia, or
  witnessed disorientation; exclusion criteria are surfaced
  before scoring per Stiell 2001 §Methods.

#### 3.5.2 `ccsr` — Canadian C-Spine Rule

- **Primary citation:** Stiell IG, Wells GA, Vandemheen KL, et
  al. *The Canadian C-Spine Rule for radiography in alert and
  stable trauma patients.* JAMA 2001;286(15):1841-1848.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `emergency-medicine`, `surgery`,
  `neurology`.
- **Inputs:** High-risk (any → image): age ≥65, dangerous
  mechanism, paresthesias in extremities. Low-risk (any → safe
  to assess range of motion): simple rear-end MVC, sitting
  position in ED, ambulatory at any time, delayed onset of neck
  pain, absence of midline c-spine tenderness. Range of motion:
  able to actively rotate neck 45° left and right.
- **Output:** Imaging recommended / not recommended per the
  Stiell 2001 algorithm. Sophie ships side-by-side with
  [nexus-cspine](../lib/meta.js) so the clinician sees both
  rules' recommendations on the same screen.

#### 3.5.3 `pecarn-head` — PECARN Pediatric Head Injury Rule

- **Primary citation:** Kuppermann N, Holmes JF, Dayan PS, et al.
  *Identification of children at very low risk of clinically-
  important brain injuries after head trauma: a prospective
  cohort study.* Lancet 2009;374(9696):1160-1170.
- **Group home:** Pediatrics & Neonatal
  (`N`; [spec-v11 §4.1](spec-v11.md)).
- **`META[id].specialties`:** `pediatrics`, `emergency-medicine`,
  `neurology`.
- **Inputs:** Age <2 vs ≥2 (rule branches). For <2: GCS, palpable
  skull fracture, AMS, LOC ≥5 sec, severe mechanism, occipital/
  parietal/temporal scalp hematoma, not acting normally per
  parent. For ≥2: GCS, signs of basal skull fracture, AMS, LOC
  any, vomiting, severe mechanism, severe headache.
- **Output:** ciTBI risk tier per Kuppermann 2009 Figure 2 /
  Figure 3: <0.02%, 0.9%, or 4.4% (age <2); <0.05%, 0.9%, or
  4.3% (age ≥2). Recommendation language is quoted verbatim
  from the Kuppermann 2009 algorithm boxes.

#### 3.5.4 `ottawa-ankle` — Ottawa Ankle Rules

- **Primary citation:** Stiell IG, Greenberg GH, McKnight RD,
  Nair RC, McDowell I, Worthington JR. *A study to develop
  clinical decision rules for the use of radiography in acute
  ankle injuries.* Ann Emerg Med 1992;21(4):384-390.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `emergency-medicine`, `surgery`.
- **Inputs:** Pain in malleolar zone with: tenderness at
  posterior edge / tip of lateral malleolus (distal 6 cm),
  tenderness at posterior edge / tip of medial malleolus
  (distal 6 cm), inability to bear weight 4 steps both
  immediately and in the ED. Pain in midfoot zone with:
  tenderness at base of 5th metatarsal, tenderness at navicular,
  inability to bear weight.
- **Output:** Ankle x-ray indicated / foot x-ray indicated / no
  imaging per the Stiell 1992 algorithm. The rule is for
  patients ≥18; PERC of the Ottawa Ankle Rule for children
  (Plint 1999) is referenced in the audit log but not
  implemented in v12 (deferred — separate tile in a future
  spec).

#### 3.5.5 `ottawa-sah` — Ottawa Subarachnoid Hemorrhage Rule

- **Primary citation:** Perry JJ, Stiell IG, Sivilotti MLA, et
  al. *Clinical decision rules to rule out subarachnoid
  hemorrhage for acute headache.* JAMA 2013;310(12):1248-1255.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `emergency-medicine`, `neurology`.
- **Inputs:** Age ≥40, neck pain or stiffness, witnessed LOC,
  onset during exertion, thunderclap headache (peak intensity
  within 1 second), limited neck flexion on exam.
- **Output:** Any positive → cannot rule out SAH, further
  workup indicated; all negative → rule out SAH per Perry 2013
  §Results (100% sensitivity in the derivation cohort).
- **Exclusion criteria** (surfaced before scoring): new
  neurologic deficit, prior aneurysm/SAH/brain tumor, recurrent
  headaches identical in pattern, age <15. The rule does not
  apply outside these criteria.

### 3.6 Readmission & care-transition risk

#### 3.6.1 `hospital-score` — HOSPITAL Score for Potentially Avoidable 30-Day Readmissions

- **Primary citation:** Donzé J, Aujesky D, Williams D, Schnipper
  JL. *Potentially avoidable 30-day hospital readmissions in
  medical patients: derivation and validation of a prediction
  model.* JAMA Intern Med 2013;173(8):632-638.
- **Group home:** Workflow & Documentation
  (`H`; [spec-v11 §4.1](spec-v11.md)).
- **`META[id].specialties`:** `nursing-general`, `geriatrics`,
  `palliative`.
- **Inputs:** Hemoglobin <12 g/dL (1), discharge from oncology
  service (2), sodium <135 mEq/L (1), any procedure during
  hospitalization (1), index admission type (elective = 0,
  urgent = 1), number of admissions in past year (0 / 1 / 2 /
  3-4 / ≥5 → 0 / 0 / 0 / 2 / 5), length of stay ≥5 days (2).
- **Scoring:** Sum 0–13.
- **Output:** Score plus Donzé 2013 Table 4 30-day readmission
  rate bands (low 0–4: 5.8%, intermediate 5–6: 11.9%, high ≥7:
  22.8%).

#### 3.6.2 `lace` — LACE Index for Readmission

- **Primary citation:** van Walraven C, Dhalla IA, Bell C, et
  al. *Derivation and validation of an index to predict early
  death or unplanned readmission after discharge from hospital
  to the community.* CMAJ 2010;182(6):551-557.
- **Group home:** Workflow & Documentation (`H`).
- **`META[id].specialties`:** `nursing-general`, `geriatrics`,
  `palliative`.
- **Inputs:** Length of stay (days, scored on a 7-band table),
  Acute (emergent) admission yes/no, Charlson Comorbidity Index
  (links to the `charlson` tile below), Emergency visits in 6
  months prior.
- **Scoring:** Per van Walraven 2010 Table 3; range 0–19.
- **Output:** Score plus the van Walraven 2010 30-day
  death-or-readmission rate band quoted in the interpretation
  block.

### 3.7 Comorbidity, frailty & performance

#### 3.7.1 `charlson` — Charlson Comorbidity Index (age-adjusted)

- **Primary citation:** Charlson ME, Pompei P, Ales KL, MacKenzie
  CR. *A new method of classifying prognostic comorbidity in
  longitudinal studies: development and validation.* J Chronic
  Dis 1987;40(5):373-383. Age adjustment: Charlson ME, Szatrowski
  TP, Peterson J, Gold J. *Validation of a combined comorbidity
  index.* J Clin Epidemiol 1994;47(11):1245-1251.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `nursing-general`, `geriatrics`,
  `oncology`, `palliative`.
- **Inputs:** 19 comorbidity flags weighted 1, 2, 3, or 6
  (per Charlson 1987 Table 3) plus age band (1 point per
  decade ≥50 per Charlson 1994).
- **Output:** Total score plus Charlson 1987 Table 4 10-year
  mortality estimate by score (0: 12%, 1–2: 26%, 3–4: 52%,
  ≥5: 85%).

#### 3.7.2 `cfs` — Clinical Frailty Scale

- **Primary citation:** Rockwood K, Song X, MacKnight C, et al.
  *A global clinical measure of fitness and frailty in elderly
  people.* CMAJ 2005;173(5):489-495.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `geriatrics`, `palliative`,
  `nursing-general`, `oncology`.
- **Inputs:** A 9-row picker (CFS 1 = very fit through CFS 9 =
  terminally ill) with the Rockwood 2005 / Dalhousie 2020
  v2 descriptors rendered inline. Sophie ships the v2 (2020)
  wording exactly per the Dalhousie public PDF; the citation
  records both 2005 derivation and 2020 v2 wording source.
- **Output:** CFS level (1–9) plus the canonical descriptor.
- **`interpretation` bands:** Per CSHA / Rockwood 2005 outcomes
  table — 5-year mortality / institutionalization estimates by
  level.

#### 3.7.3 `ecog-karnofsky` — ECOG Performance Status + Karnofsky Performance Status

- **Primary citation (ECOG):** Oken MM, Creech RH, Tormey DC, et
  al. *Toxicity and response criteria of the Eastern Cooperative
  Oncology Group.* Am J Clin Oncol 1982;5(6):649-655.
- **Primary citation (Karnofsky):** Karnofsky DA, Burchenal JH.
  *The clinical evaluation of chemotherapeutic agents in cancer.*
  In: MacLeod CM, ed. Evaluation of Chemotherapeutic Agents.
  New York: Columbia University Press; 1949:191-205.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `oncology`, `palliative`,
  `geriatrics`, `nursing-general`.
- **Inputs:** Two coupled pickers (ECOG 0–5 and KPS 100–0 in
  steps of 10) with the descriptors per the primary sources.
  The standard ECOG↔KPS crosswalk (Buccheri 1996, Oncology) is
  surfaced as informational with its own citation; selecting
  one auto-fills the other but the user may override.
- **Output:** Both scales rendered side by side with the
  source's descriptor text.

### 3.8 Cardiology

#### 3.8.1 `killip` — Killip Classification

- **Primary citation:** Killip T, Kimball JT. *Treatment of
  myocardial infarction in a coronary care unit. A two-year
  experience with 250 patients.* Am J Cardiol 1967;20(4):457-464.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `cardiology`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** A four-row radio picker:
  - I: No signs of heart failure.
  - II: Rales / S3 gallop / elevated jugular venous pressure.
  - III: Acute pulmonary edema.
  - IV: Cardiogenic shock (hypotension, oliguria, cold extremities).
- **Output:** Class I–IV plus the Killip 1967 in-hospital
  mortality band (I 6%, II 17%, III 38%, IV 81% in the original
  cohort; the GUSTO-I 1995 contemporary cohort is cited as a
  secondary reference under `interpretation.sourceCitation`).
- **Why a standalone tile:** Killip class is already an input
  to the existing [grace](../lib/meta.js) tile (`gr-killip`).
  Shipping it as its own tile lets a clinician look up the
  class definition without entering the full GRACE flow, and
  also lets [stemi](../lib/meta.js)-adjacent workflows reference
  it without code duplication.

### 3.9 Critical care

#### 3.9.1 `sirs` — SIRS Criteria

- **Primary citation:** Bone RC, Balk RA, Cerra FB, et al.
  *Definitions for sepsis and organ failure and guidelines for
  the use of innovative therapies in sepsis. The ACCP/SCCM
  Consensus Conference Committee.* Chest 1992;101(6):1644-1655.
- **Group home:** Clinical Scoring & Risk (`G`).
- **`META[id].specialties`:** `critical-care`,
  `emergency-medicine`, `nursing-general`,
  `infectious-disease`.
- **Inputs:** Temperature (>38°C or <36°C), heart rate (>90),
  respiratory rate (>20 or PaCO₂ <32), WBC (>12 or <4 ×10⁹/L
  or >10% bands).
- **Output:** Count of criteria met (0–4). ≥2 = SIRS per Bone
  1992. Sepsis-3 (Singer 2016, JAMA) is referenced inline: SIRS
  is no longer the preferred sepsis-screen criterion; qSOFA and
  the full SOFA are. Sophie cites Sepsis-3 explicitly so a
  clinician using SIRS sees the context.
- **Why SIRS is still shipped:** Some inpatient EWS triggers
  and hospital protocols still encode SIRS thresholds; a
  clinician auditing a CDS trigger needs to compute SIRS
  exactly as the local protocol does. Sophie ships the
  definition with the Sepsis-3 context so neither rule is
  hidden.

## 4. Group-home assignments

Per the [spec-v11 §4.1](spec-v11.md) specialty-named groups, the
25 tiles distribute as:

| Group label                       | New v12 tiles                                                                                    | Count |
|-----------------------------------|--------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | news2, mews, pesi, spesi, padua, gbs, rockall, aims65, oakland, maddrey-lille, cthr, ccsr, ottawa-ankle, ottawa-sah, charlson, cfs, ecog-karnofsky, killip, sirs | 19 |
| Clinical Math & Conversions (`E`) | fib4, apri                                                                                       | 2     |
| Workflow & Documentation (`H`)    | hospital-score, lace                                                                             | 2     |
| Pediatrics & Neonatal (`N`)       | pecarn-head                                                                                      | 1     |

`pecarn-head` is the only peds tile; the rest are adult-medicine
calculators, consistent with v12's "first 25" framing. Subsequent
spec increments are expected to skew more pediatric and more EMS
to balance the catalog.

Every tile also carries a `META[id].specialties` array per
[spec-v11 §4.3](spec-v11.md) so the prompt ranker
([lib/prompt.js](../lib/prompt.js)) can surface a tile from a
specialty-keyword search.

## 5. Per-tile shipping contract

Every tile in §3 ships under all of the following gates. The
gates are non-negotiable per [spec-v11](spec-v11.md); v12 does
not relax any of them.

1. **`docs/audits/v11/<tile-id>.md` exists** in PASS or
   PASS-WITH-FIXES state before the tile renders to a user.
   `scripts/audit-skeleton.mjs <tile-id>` generates the
   pre-filled template.
2. **Primary citation re-verified** against the source listed
   in §3. The citation string in `META[id].citation` quotes
   the author, journal, year, volume, issue, and page range
   per [spec-v9 §4.2](spec-v9.md) and is ≤300 chars.
3. **At least 3 boundary worked examples.** Low edge of input,
   mid-range typical clinical value, high edge of input. The
   "low" example is rendered as the tile's empty-state
   `META[id].example` per [spec-v9](spec-v9.md). The "mid" and
   "high" examples ship as unit-test assertions under
   `test/unit/<tile-id>.test.js`.
4. **Cross-implementation differential within 0.5%** for
   numeric outputs, or one category for ordinal outputs.
   Reference implementation named in the audit log.
5. **Edge-input handling reviewed** per the
   [spec-v11 §3.1.4](spec-v11.md) checklist: out-of-range
   inputs rejected inline with a clear message, units labeled
   prominently, optional inputs default to a "not provided"
   value matching the source, the example value is clinically
   plausible.
6. **A11y + keyboard pass** per
   [spec-v11 §3.1.5](spec-v11.md): screen-reader labels match
   visible labels, error states announced, "Reset to example"
   reachable by keyboard, tab order matches visual order.
   `npm run test:a11y` clean after the tile is added.
7. **`interpretation` block present iff the primary source
   publishes per-band guidance** per
   [spec-v11 §5](spec-v11.md). `sourceQuoted: true` is
   mandatory; band text ≤200 chars; no forbidden Sophie-
   authored phrasing per
   [test/unit/meta-interpretation.test.js](../test/unit/meta-interpretation.test.js).
8. **`META[id].specialties` populated** with values from the
   closed vocabulary in [spec-v11 §4.3](spec-v11.md). New
   vocabulary values require a one-line amendment to v11; v12
   does not introduce any.
9. **The tile's renderer is a pure function** of its DOM
   inputs. No fetch, no setTimeout-based animation that
   blocks the result, no service-worker dependency.
10. **CHANGELOG `### Added` entry** under the Unreleased
    section names the tile, the citation, the audit log, and
    the example. Per
    [docs/release.md](release.md), the entry is the
    user-visible contract for the addition.
11. **Sitemap entry** generated by
    `scripts/build-sitemap.mjs`. Per
    [scripts/build-sitemap.mjs](../scripts/build-sitemap.mjs)
    behavior, this is automatic from `UTILITIES`.
12. **Pre-rendered tool page** under `dist/tools/<id>/` by
    `scripts/build-tool-pages.mjs`. Automatic from `UTILITIES`.
13. **OG card** under `dist/og/<id>.png` by
    `scripts/build-og-images.mjs`. Automatic from `UTILITIES`.

`npm run release:check` (lint + test + sbom + build) must pass
on every PR that lands a tile.

## 6. Sequencing

v12 ships in waves, one PR per wave. The order matches §3's
clinical-stakes framing (the highest-volume bedside scores
first), not §4.1's group order.

- **Wave 12-0**: this spec doc, no code. Adds `docs/spec-v12.md`
  to the spec hierarchy; updates [README.md](../README.md)'s
  "Catalog snapshot" section to note v12 is in flight.
- **Wave 12-1 (early-warning bundle)**: `news2`, `mews`. Two
  tiles, one PR. Shared `views/<group-g-additions>.js` renderer
  pattern.
- **Wave 12-2 (VTE bundle)**: `pesi`, `spesi`, `padua`.
- **Wave 12-3 (GI-bleed bundle)**: `gbs`, `rockall`, `aims65`,
  `oakland`.
- **Wave 12-4 (hepatology bundle)**: `fib4`, `apri`,
  `maddrey-lille`.
- **Wave 12-5 (imaging-decision bundle)**: `cthr`, `ccsr`,
  `pecarn-head`, `ottawa-ankle`, `ottawa-sah`.
- **Wave 12-6 (readmission bundle)**: `hospital-score`, `lace`.
- **Wave 12-7 (comorbidity-frailty-performance bundle)**:
  `charlson`, `cfs`, `ecog-karnofsky`.
- **Wave 12-8 (cardiology + critical-care)**: `killip`, `sirs`.
- **Wave 12-9 (closeout)**: CHANGELOG summary, v12 marked
  complete, `scripts/audit-coverage.mjs` re-run (target 203/203
  audited at v12 close), README catalog count updated from 178
  → 203 in `index.html` meta description, JSON-LD, OG card
  generator, and the audience hubs under `dist/for/`.

Each wave is a single commit (or a tight stack) and lands the
audit log, the renderer, the unit tests, the META block, the
CHANGELOG entry, and any guard-test updates together. No tile
lands without its audit log.

Bundling is by clinical adjacency, not group letter, because
auditors gain efficiency from running boundary examples through
related sources in the same sitting (e.g., the GI-bleed bundle
shares the GBS / Rockall / AIMS65 / Oakland clinical workflow;
the imaging-decision bundle shares the ED chief-complaint
framing).

## 7. Acceptance criteria

v12 is shippable when **all** of the following hold:

1. All 25 §3 tiles render correctly on the home grid under
   their §4 group home with the §3 visible name.
2. Every §3 tile has a `docs/audits/v11/<tile-id>.md` audit
   log in PASS or PASS-WITH-FIXES state.
3. `scripts/audit-coverage.mjs` reports 203/203 (100%) with
   the per-group breakdown reflecting the additions.
4. `npm run lint`, `npm run test`, `npm run build`,
   `npm run test:e2e` (where Playwright is available) all
   pass.
5. CHANGELOG documents every tile under an Unreleased
   `### Added` heading, citing each primary source.
6. The home grid `<title>` / `<meta description>` / OG copy
   updates from "178 calculators..." → "203 calculators...";
   JSON-LD count auto-derived from `UTILITIES.length` via
   [scripts/build-ld.mjs](../scripts/build-ld.mjs).
7. The sitemap regenerates without manual intervention.
8. Every audience hub under `dist/for/` continues to render
   the correct tiles for its audience; in particular the
   nurses-and-clinicians hub gains all 25 new tiles by way of
   their `META[id].specialties` ∩ audience-mapping in
   [scripts/build-hub-pages.mjs](../scripts/build-hub-pages.mjs).
9. The eight topic pages under `dist/topics/` re-link
   automatically; any topic page (e.g., the VTE topic) that
   should grow new internal links to the new tiles is updated
   in the same wave PR.
10. No regression in the existing 178 tiles. The v11 audit
    logs remain PASS or PASS-WITH-FIXES. No tile is removed.

## 8. Out of scope (deliberate)

v12 explicitly does **not** include the following, even though
some are clinically high-value. They are deferred to subsequent
spec increments per [scope-mdcalc-parity](scope-mdcalc-parity.md)'s
"eventually complete, never rushed" cadence.

- **Killip's GRACE companion is already shipped**;
  TIMI risk score variants for NSTEMI vs STEMI subtypes are
  not split — the existing [timi](../lib/meta.js) tile is
  retained as-is.
- **APACHE II / SAPS II / SAPS 3** — ICU mortality scoring.
  Audit-floor cost is high (each carries 12+ inputs and
  multiple lab values with normalization rules); deferred to
  a dedicated ICU-scoring spec.
- **Berlin ARDS criteria** — definitional rather than
  predictive; will ship alongside a dedicated mechanical-
  ventilation tile bundle.
- **NIH-CC / RIFLE / AKIN AKI staging** —
  [kdigo-aki](../lib/meta.js) already ships; the legacy
  criteria are reference-only and lower priority.
- **DAS28 / CDAI / Harvey-Bradshaw / Mayo score** —
  rheumatology and IBD activity indices. Sophie's audience
  weighting (front-line ED + hospitalist + nursing) places
  these lower for the *first* 25; they are firmly on the
  long-horizon list.
- **FRAX, STS, EuroSCORE II, MELD-Plus** — proprietary or
  closed-coefficient models. Sophie ships only when the
  derivation paper publishes the full coefficient set.
- **Cormack-Lehane grading** — an observational scale, not a
  calculator; better as a reference image in a clinical-
  reference tile.
- **Pediatric Asthma Severity Score (PRAM), Bacterial
  Meningitis Score (Nigrovic), FeverPAIN, Tisdale QT-risk
  score** — high-value, deferred to a "next 25" wave so v12
  stays focused on adult medicine and the highest-frequency
  pediatric imaging decision (PECARN head).
- **A specialty chip rail** — still deferred per
  [spec-v11 §4.2](spec-v11.md). v12 adds 25 entries to the
  existing `META[id].specialties` array but does not surface
  a new filter.
- **A `/specialty/<name>` hub page family** — deferred. The
  five existing audience hubs already absorb the additions.

## 9. What v12 promises and does not promise

- v12 **promises** that on completion, sophiewell.com hosts
  203 deterministic, citable, login-less, in-browser clinical
  tools — every one of them audited against its primary source
  by a named auditor and shipped with a public audit log.
- v12 **promises** that every one of the 25 new tiles is
  reachable from the home grid, the prompt ranker, the audience
  hub for nurses-and-clinicians (and EMS / educator hubs where
  applicable), and a permalink under `/tools/<id>/`.
- v12 **promises** that none of the existing 178 tiles
  regresses. The home grid count goes up; nothing is removed.
- v12 **does not promise** speed. The audit floor is
  deliberately slow per [spec-v11 §9](spec-v11.md) and
  [scope-mdcalc-parity §3](scope-mdcalc-parity.md). At a
  sustainable solo-developer cadence of 5–20 audited tiles per
  month, 25 tiles span roughly 2–5 months. Faster is
  unsustainable.
- v12 **does not promise** that no future error will ever
  ship. It promises the same pipeline v11 committed to (audit
  log → CI guard → CHANGELOG `### Fixed`) catches them faster
  than discovering them in the wild.
- v12 **does not promise** that the 25 tiles are the only
  next 25 — they are *a* high-priority next 25. The maintainer
  reserves the right to substitute a tile if a clinical
  consultation, a new validation, or a regulatory change
  renders a different tile higher-priority. Substitutions are
  documented in the wave PR.

## 10. Glossary of new tile ids (quick reference)

| Id                | Visible name                                              | Group |
|-------------------|-----------------------------------------------------------|-------|
| `news2`           | NEWS2 — National Early Warning Score 2                    | G     |
| `mews`            | MEWS — Modified Early Warning Score                       | G     |
| `pesi`            | PESI — Pulmonary Embolism Severity Index                  | G     |
| `spesi`           | sPESI — Simplified PESI                                   | G     |
| `padua`           | Padua Prediction Score (VTE in medical inpatients)        | G     |
| `gbs`             | Glasgow-Blatchford Bleeding Score                         | G     |
| `rockall`         | Rockall Score (pre- and post-endoscopy)                   | G     |
| `aims65`          | AIMS65 — Upper GI Bleeding Mortality                      | G     |
| `oakland`         | Oakland Score — Lower GI Bleeding Safe Discharge          | G     |
| `fib4`            | FIB-4 Index for Liver Fibrosis                            | E     |
| `apri`            | APRI — AST to Platelet Ratio Index                        | E     |
| `maddrey-lille`   | Maddrey DF + Lille Model (alcoholic hepatitis)            | G     |
| `cthr`            | Canadian CT Head Rule                                     | G     |
| `ccsr`            | Canadian C-Spine Rule                                     | G     |
| `pecarn-head`     | PECARN Pediatric Head Injury Rule                         | N     |
| `ottawa-ankle`    | Ottawa Ankle Rules                                        | G     |
| `ottawa-sah`      | Ottawa SAH Rule                                           | G     |
| `hospital-score`  | HOSPITAL Score for 30-Day Readmission                     | H     |
| `lace`            | LACE Index for Readmission                                | H     |
| `charlson`        | Charlson Comorbidity Index (age-adjusted)                 | G     |
| `cfs`             | Clinical Frailty Scale                                    | G     |
| `ecog-karnofsky`  | ECOG + Karnofsky Performance Status                       | G     |
| `killip`          | Killip Classification                                     | G     |
| `sirs`            | SIRS Criteria (with Sepsis-3 context)                     | G     |

Total: 25 new tiles. Catalog 178 → 203 at v12 close.
