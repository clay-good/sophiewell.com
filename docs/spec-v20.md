# spec-v20.md — psych & cognition, geriatrics, rheumatology, dermatology, toxicology, surgical risk (25 tiles)

> Status: proposed (2026-05-18). v20 is the ninth catalog-growth
> spec and the **closer of the v17–v20 tranche** (the second
> 100-tile increment after v12–v16). It adds 25 tiles across
> **cognition & psychiatric scales** (MMSE, MoCA, Hamilton-D,
> Hamilton-A, MDQ, C-SSRS structure, ASRS v1.1, Y-BOCS, PCL-5),
> **geriatric function** (Clinical Frailty Scale, ECOG, KPS),
> **rheumatology disease activity** (DAS28-CRP, CDAI-RA, SDAI,
> BASDAI, ASDAS-CRP, SLEDAI-2K), **dermatology severity** (PASI,
> EASI, SCORTEN), **toxicology nomograms** (Rumack-Matthew
> acetaminophen, Done salicylate — shipped with explicit
> historical-caveat banner), and **surgical risk** (P-POSSUM,
> Surgical Apgar).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v20 amends no hard rule from v10–v19. Catalog growth: at v19
> close 378 tiles; at v20 close **403 tiles**.
>
> v20 closes the v17→v20 tranche. At v20 close, sophiewell.com
> carries **403 audited, deterministic, citable, login-less
> clinical tools** — the first 225-tile increment toward the
> 400–600-tile parity target in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).

## 1. Why v20 exists

v12–v19 covered the highest-frequency adult-medicine, ICU,
peri-op, OB / peds / trauma, neuro / onc / endo / GI, cardiology,
pulmonology, and nephrology surfaces. v20 is the cross-specialty
catch-up: the tiles every primary-care, psychiatry, rheumatology,
dermatology, geriatrics, toxicology, anesthesia, and general-
surgery clinician asks for that no prior spec naturally housed.
Each meets the v12 §1 criteria (clinical frequency × source
stability × audit feasibility) and is on at least one major
society or guideline short-list.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v20
specifically defers:

- **HAM-D-17 only.** v20 ships the original 17-item HAM-D and
  the 14-item HAM-A. HAM-D-21 / GRID-HAMD are deferred.
- **MADRS, BDI-II, PSS-10.** Licensing constraints; defer until
  copyright clearance documented.
- **WAIS / WMS / RBANS.** Proprietary neuropsych batteries; out
  of scope per [scope-mdcalc-parity §4](scope-mdcalc-parity.md).
- **Sharp / van der Heijde, mTSS, US7.** Imaging-driven rheum
  scoring; defer to an imaging-rheum bundle.
- **DLQI / CDLQI.** Patient-reported dermatology; ships in a
  future derm bundle once licensing path is documented.
- **Rumack-Matthew co-ingestants / extended-release adjustment.**
  The base 4-hour nomogram ships; extended-release-APAP guidance
  varies by RG; banner directs to Poison Control.
- **Done nomogram clinical recommendation.** Done is now
  considered unreliable for clinical decision-making; v20 ships
  it **with an explicit reference-only banner** ("Done nomogram
  is no longer recommended for clinical decisions; the AACT 2007
  consensus recommends clinical assessment + salicylate level
  trend"). Implementation is reference, not decision support.

## 3. The 25 tiles

### 3.1 Cognition

#### 3.1.1 `mmse` — Mini-Mental State Examination

- **Citation:** Folstein MF, Folstein SE, McHugh PR. *"Mini-mental state": a practical method for grading the cognitive state of patients for the clinician.* J Psychiatr Res 1975;12(3):189-198.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `geriatric-medicine`, `neurology`, `psychiatry`, `family-medicine`.
- **Inputs:** 11 sub-tasks across orientation (10), registration (3), attention/calculation (5), recall (3), language (8), praxis (1). Sum 0–30.
- **Bands (education-adjusted):** ≥24 normal; 19–23 mild impairment; 10–18 moderate; ≤9 severe. Crum 1993 norms shipped as adjunct.
- **Note:** Copyright status — PAR holds rights since 2001; v20 ships an UI-reference reproduction with proper attribution and links out to PAR for purchase; full item text loaded from a single license-flag controlled source per [docs/legal.md](legal.md).

#### 3.1.2 `moca` — Montreal Cognitive Assessment

- **Citation:** Nasreddine ZS, Phillips NA, Bédirian V, et al. *The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment.* J Am Geriatr Soc 2005;53(4):695-699.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `geriatric-medicine`, `neurology`, `psychiatry`.
- **Inputs:** 30-point composite (visuospatial/executive 5, naming 3, attention 6, language 3, abstraction 2, delayed recall 5, orientation 6); +1 for ≤12 yr education.
- **Bands:** ≥26 normal; 18–25 MCI; 10–17 moderate; <10 severe.
- **Note:** Free-use registered-clinician requirement (MoCA Cognition); tile ships as scoring + interpretation. Test-form distribution remains via mocacognition.com.

### 3.2 Mood, anxiety, suicide, OCD, ADHD, PTSD

#### 3.2.1 `ham-d` — Hamilton Depression Rating Scale (17-item)

- **Citation:** Hamilton M. *A rating scale for depression.* J Neurol Neurosurg Psychiatry 1960;23:56-62.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`, `family-medicine`.
- **Inputs:** 17 clinician-rated items (variable 0–2 or 0–4 each). Sum 0–52.
- **Bands:** 0–7 none; 8–13 mild; 14–18 moderate; 19–22 severe; ≥23 very severe.

#### 3.2.2 `ham-a` — Hamilton Anxiety Rating Scale (14-item)

- **Citation:** Hamilton M. *The assessment of anxiety states by rating.* Br J Med Psychol 1959;32(1):50-55.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`, `family-medicine`.
- **Inputs:** 14 items each 0–4. Sum 0–56.
- **Bands:** ≤17 mild; 18–24 moderate; 25–30 severe; ≥31 very severe.

#### 3.2.3 `mdq` — Mood Disorder Questionnaire (Hirschfeld 2000)

- **Citation:** Hirschfeld RMA, Williams JBW, Spitzer RL, et al. *Development and validation of a screening instrument for bipolar spectrum disorder: the Mood Disorder Questionnaire.* Am J Psychiatry 2000;157(11):1873-1875.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`, `family-medicine`, `internal-medicine`.
- **Inputs:** 13 yes/no symptom items + 1 co-occurrence item + 1 functional-impairment item.
- **Positive screen:** ≥7 of 13 + co-occurrence yes + impairment moderate/serious.

#### 3.2.4 `c-ssrs-structure` — Columbia-Suicide Severity Rating Scale (structure)

- **Citation:** Posner K, Brown GK, Stanley B, et al. *The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults.* Am J Psychiatry 2011;168(12):1266-1277.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `psychiatry`, `emergency-medicine`, `family-medicine`.
- **Inputs:** Ideation severity (1–5), ideation intensity sub-items, behavior (preparatory acts, aborted/interrupted/actual attempt, suicide), worst-point lifetime severity.
- **Output:** Risk stratification per Columbia Lighthouse Project Triage Mapping (low / moderate / high / imminent). Tile ships the screener structure with the standard FDA "Suicidality Classification" mapping; full clinician training resources linked.
- **Note:** Use is free per cssrs.columbia.edu; tile preserves attribution per the C-SSRS use policy.

#### 3.2.5 `asrs-v1-1` — Adult ADHD Self-Report Scale v1.1 screener

- **Citation:** Kessler RC, Adler L, Ames M, et al. *The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population.* Psychol Med 2005;35(2):245-256.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`, `family-medicine`.
- **Inputs:** Part A 6 screener items (each 0–4); response thresholds per scoring template Q1-3 ≥2, Q4-6 ≥3.
- **Positive screen:** ≥4 of 6 Part A items at threshold.

#### 3.2.6 `y-bocs` — Yale-Brown Obsessive-Compulsive Scale

- **Citation:** Goodman WK, Price LH, Rasmussen SA, et al. *The Yale-Brown Obsessive Compulsive Scale: I. Development, use, and reliability.* Arch Gen Psychiatry 1989;46(11):1006-1011.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`.
- **Inputs:** 10 items (5 obsessions, 5 compulsions), each 0–4. Sum 0–40.
- **Bands:** 0–7 subclinical; 8–15 mild; 16–23 moderate; 24–31 severe; 32–40 extreme.

#### 3.2.7 `pcl-5` — PTSD Checklist for DSM-5

- **Citation:** Weathers FW, Litz BT, Keane TM, Palmieri PA, Marx BP, Schnurr PP. *The PTSD Checklist for DSM-5 (PCL-5).* National Center for PTSD; 2013. Bovin MJ, et al. *Psychometric Properties of the PTSD Checklist for DSM-5 in Veterans.* Psychol Assess 2016;28(11):1379-1391.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `psychiatry`, `family-medicine`, `emergency-medicine`.
- **Inputs:** 20 items each 0–4 (cluster B 1–5, C 6–7, D 8–14, E 15–20). Sum 0–80.
- **Bands:** Provisional PTSD if cluster threshold met (≥1 B / ≥1 C / ≥2 D / ≥2 E at ≥2) AND total ≥31–33.

### 3.3 Geriatric function

#### 3.3.1 `clinical-frailty-scale` — Rockwood Clinical Frailty Scale

- **Citation:** Rockwood K, Song X, MacKnight C, et al. *A global clinical measure of fitness and frailty in elderly people.* CMAJ 2005;173(5):489-495. Version 2.0: Rockwood K, Theou O. *Using the Clinical Frailty Scale in Allocating Scarce Health Care Resources.* Can Geriatr J 2020;23(3):254-259.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatric-medicine`, `critical-care`, `internal-medicine`, `family-medicine`.
- **Inputs:** 9-level ordinal: 1 very fit → 9 terminally ill.
- **Output:** CFS 1–9 with per-level description.

#### 3.3.2 `ecog` — ECOG Performance Status

- **Citation:** Oken MM, Creech RH, Tormey DC, et al. *Toxicity and response criteria of the Eastern Cooperative Oncology Group.* Am J Clin Oncol 1982;5(6):649-655.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `palliative-care`, `internal-medicine`.
- **Inputs:** 6-level ordinal 0–5.
- **Output:** ECOG 0–5 with per-level description.

#### 3.3.3 `kps` — Karnofsky Performance Status

- **Citation:** Karnofsky DA, Burchenal JH. *The clinical evaluation of chemotherapeutic agents in cancer.* In: MacLeod CM, ed. *Evaluation of Chemotherapeutic Agents.* Columbia University Press; 1949:191-205.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `palliative-care`, `internal-medicine`.
- **Inputs:** 11-level ordinal 0–100 in 10-point increments.
- **Output:** KPS 0–100 with per-level description.

### 3.4 Rheumatology disease activity

#### 3.4.1 `das28-crp` — DAS28-CRP

- **Citation:** Wells G, Becker JC, Teng J, et al. *Validation of the 28-joint Disease Activity Score (DAS28) and European League Against Rheumatism response criteria based on C-reactive protein.* Ann Rheum Dis 2009;68(6):954-960.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** Tender joint count (28), swollen joint count (28), CRP (mg/L), patient global VAS (0–100).
- **Formula:** DAS28-CRP = 0.56·√TJC + 0.28·√SJC + 0.36·ln(CRP+1) + 0.014·VAS + 0.96.
- **Bands:** <2.6 remission; 2.6–3.2 low; >3.2–5.1 moderate; >5.1 high.

#### 3.4.2 `cdai-ra` — Clinical Disease Activity Index (RA)

- **Citation:** Aletaha D, Smolen J. *The Simplified Disease Activity Index (SDAI) and the Clinical Disease Activity Index (CDAI): a review of their usefulness and validity in rheumatoid arthritis.* Clin Exp Rheumatol 2005;23(5 Suppl 39):S100-S108.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** TJC28, SJC28, patient global (0–10), evaluator global (0–10).
- **Formula:** CDAI = TJC + SJC + PtG + EvG (0–76).
- **Bands:** ≤2.8 remission; 2.9–10 low; 10.1–22 moderate; >22 high.

#### 3.4.3 `sdai-ra` — Simplified Disease Activity Index (RA)

- **Citation:** Smolen JS, Breedveld FC, Schiff MH, et al. *A simplified disease activity index for rheumatoid arthritis for use in clinical practice.* Rheumatology 2003;42(2):244-257.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** TJC28, SJC28, PtG (0–10), EvG (0–10), CRP (mg/dL).
- **Formula:** SDAI = TJC + SJC + PtG + EvG + CRP.
- **Bands:** ≤3.3 remission; 3.4–11 low; 11.1–26 moderate; >26 high.

#### 3.4.4 `basdai` — Bath Ankylosing Spondylitis Disease Activity Index

- **Citation:** Garrett S, Jenkinson T, Kennedy LG, Whitelock H, Gaisford P, Calin A. *A new approach to defining disease status in ankylosing spondylitis: the Bath Ankylosing Spondylitis Disease Activity Index.* J Rheumatol 1994;21(12):2286-2291.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `rheumatology`.
- **Inputs:** 6 VAS items (0–10): fatigue, axial pain, joint pain, enthesitis, morning stiffness severity, morning stiffness duration.
- **Formula:** BASDAI = (Q1+Q2+Q3+Q4 + (Q5+Q6)/2) / 5.
- **Threshold:** ≥4 = active disease (ASAS-EULAR biologic threshold).

#### 3.4.5 `asdas-crp` — Ankylosing Spondylitis Disease Activity Score (CRP)

- **Citation:** Lukas C, Landewé R, Sieper J, et al. *Development of an ASAS-endorsed disease activity score (ASDAS) in patients with ankylosing spondylitis.* Ann Rheum Dis 2009;68(1):18-24.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** Back pain VAS (0–10), morning stiffness VAS, patient global VAS, peripheral pain/swelling VAS, CRP (mg/L).
- **Formula:** ASDAS-CRP = 0.121·back pain + 0.058·duration of morning stiffness + 0.110·PtG + 0.073·peripheral + 0.579·ln(CRP+1).
- **Bands:** <1.3 inactive; 1.3–2.1 low; 2.1–3.5 high; >3.5 very high.

#### 3.4.6 `sledai-2k` — SLE Disease Activity Index 2000

- **Citation:** Gladman DD, Ibañez D, Urowitz MB. *Systemic lupus erythematosus disease activity index 2000.* J Rheumatol 2002;29(2):288-291.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `nephrology`, `dermatology`.
- **Inputs:** 24 weighted descriptors (e.g., seizure 8, psychosis 8, organic brain 8, visual 8, cranial nerve 8, lupus headache 8, CVA 8, vasculitis 8, arthritis 4, myositis 4, urinary casts 4, hematuria 4, proteinuria 4, pyuria 4, rash 2, alopecia 2, mucosal 2, pleurisy 2, pericarditis 2, low complement 2, anti-dsDNA 2, fever 1, thrombocytopenia 1, leukopenia 1).
- **Output:** Sum 0–105; ≥6 = clinically meaningful activity (ACR / EULAR).

### 3.5 Dermatology severity

#### 3.5.1 `pasi` — Psoriasis Area and Severity Index

- **Citation:** Fredriksson T, Pettersson U. *Severe psoriasis — oral therapy with a new retinoid.* Dermatologica 1978;157(4):238-244.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `rheumatology`.
- **Inputs:** Four body regions (head 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4) × area (0–6) × (erythema + induration + desquamation each 0–4).
- **Formula:** PASI = Σregion (weighting × area × (E + I + D)). Range 0–72.
- **Bands:** <5 mild; 5–10 moderate; >10 severe. PASI-75/90/100 are clinical-trial response metrics.

#### 3.5.2 `easi` — Eczema Area and Severity Index

- **Citation:** Hanifin JM, Thurston M, Omoto M, Cherill R, Tofte SJ, Graeber M. *The eczema area and severity index (EASI): assessment of reliability in atopic dermatitis.* Exp Dermatol 2001;10(1):11-18.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `allergy-immunology`.
- **Inputs:** Four body regions × area (0–6) × (erythema + induration/papulation + excoriation + lichenification each 0–3).
- **Formula:** EASI = Σregion (weighting × area × (E + I + Ex + L)); region weights as PASI. Range 0–72.
- **Bands:** 0 clear; 0.1–1.0 almost clear; 1.1–7 mild; 7.1–21 moderate; 21.1–50 severe; >50 very severe.

#### 3.5.3 `scorten` — SCORTEN (Stevens-Johnson / TEN mortality)

- **Citation:** Bastuji-Garin S, Fouchard N, Bertocchi M, Roujeau JC, Revuz J, Wolkenstein P. *SCORTEN: a severity-of-illness score for toxic epidermal necrolysis.* J Invest Dermatol 2000;115(2):149-153.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `critical-care`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** 7 binary criteria each 1 point: age ≥40, HR ≥120, malignancy, BSA detached ≥10%, BUN >28 mg/dL, glucose >252 mg/dL, bicarbonate <20 mEq/L. Range 0–7.
- **Bands:** 0–1 mortality 3.2%; 2 12.1%; 3 35.3%; 4 58.3%; ≥5 >90%.

### 3.6 Toxicology nomograms

#### 3.6.1 `rumack-matthew` — Acetaminophen toxicity nomogram

- **Citation:** Rumack BH, Matthew H. *Acetaminophen poisoning and toxicity.* Pediatrics 1975;55(6):871-876. Modified treatment line: Smilkstein MJ, Knapp GL, Kulig KW, Rumack BH. *Efficacy of oral N-acetylcysteine in the treatment of acetaminophen overdose.* N Engl J Med 1988;319(24):1557-1562.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `medical-toxicology`, `pediatrics`.
- **Inputs:** Time since acute ingestion (4–24 h), serum acetaminophen (μg/mL).
- **Rule:** Treatment line = 150 μg/mL at 4 h, decaying exponentially with t1/2 = 4 h; values on or above the line → start NAC. Single time-point ingestion only.
- **Banner:** "Applies to single acute ingestion of immediate-release APAP, time-known, sample drawn ≥4 h post-ingestion, ≤24 h post-ingestion. Co-ingestants, extended-release APAP, unknown-time, repeat-supratherapeutic, and chronic use are out of scope — contact Poison Control."

#### 3.6.2 `done-salicylate` — Done salicylate nomogram (reference only)

- **Citation:** Done AK. *Salicylate intoxication: significance of measurements of salicylate in blood in cases of acute ingestion.* Pediatrics 1960;26:800-807.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `medical-toxicology`, `emergency-medicine`, `pediatrics`.
- **Inputs:** Time since acute ingestion (h), serum salicylate (mg/dL).
- **Rule:** Asymptomatic / mild / moderate / severe band by Done original Figure 1.
- **Banner (mandatory):** "The Done nomogram is **no longer recommended** for clinical decision-making. The AACT 2007 consensus recommends clinical assessment + trend of repeated salicylate levels. This tile is shipped as a historical reference; treatment decisions should follow current Poison Control / AACT guidance."

### 3.7 Surgical risk

#### 3.7.1 `p-possum` — Portsmouth POSSUM

- **Citation:** Prytherch DR, Whiteley MS, Higgins B, Weaver PC, Prout WG, Powell SJ. *POSSUM and Portsmouth POSSUM for predicting mortality.* Br J Surg 1998;85(9):1217-1220.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `general-surgery`, `anesthesiology`, `geriatric-medicine`.
- **Inputs:** 12 physiological variables (age, cardiac signs, respiratory signs, BP, pulse, GCS, Hb, WCC, urea, Na, K, ECG) + 6 operative variables (operative severity, multiple procedures, total blood loss, peritoneal soiling, malignancy, CEPOD urgency).
- **Formula:** Logistic regression with coefficients from primary Tables 4–5. Output predicted in-hospital mortality (%).

#### 3.7.2 `surgical-apgar` — Surgical Apgar Score

- **Citation:** Gawande AA, Kwaan MR, Regenbogen SE, Lipsitz SA, Zinner MJ. *An Apgar score for surgery.* J Am Coll Surg 2007;204(2):201-208.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `general-surgery`, `anesthesiology`, `critical-care`.
- **Inputs:** Estimated blood loss (4 bands), lowest mean arterial pressure (4 bands), lowest heart rate (5 bands). Sum 0–10.
- **Bands:** 0–4 high risk; 5–6 intermediate; 7–8 low; 9–10 very low — 30-day major complication / death.

## 4. Group homes

- Patient-Reported Symptom Indices (`I`): §3.1.1, §3.1.2, §3.2.1, §3.2.2, §3.2.3, §3.2.5, §3.2.6, §3.2.7, §3.4.4.
- Clinical Criteria & Diagnostic Bundles (`H`): §3.2.4, §3.6.1, §3.6.2.
- Clinical Scoring & Risk (`G`): §3.3.1, §3.3.2, §3.3.3, §3.4.1, §3.4.2, §3.4.3, §3.4.5, §3.4.6, §3.5.1, §3.5.2, §3.5.3, §3.7.1, §3.7.2.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). For tiles with
copyright / licensing constraints (MMSE, MoCA, C-SSRS, PCL-5,
ASRS, Y-BOCS), the audit additionally records the per-tile
licensing status and the citation of the use-policy section of
the rights-holder's distribution page; user-visible content
quotes only what the rights-holder publishes free-to-display.

For toxicology nomograms (§3.6.1, §3.6.2), the audit
additionally records the mandatory banners verbatim, and the
v11 audit log includes a Poison Control disclaimer block per
[docs/legal.md](legal.md).

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v19    | 378 | +25 |
| **v20**| **403** | **+25** |

## 7. What ships after v20

The v17–v20 tranche closes here. The next tranche (v21 onward)
will target:

- **Imaging-driven scoring bundles** — TIMI risk index for STEMI,
  ASPECTS variants, RAPID core/penumbra interpretation, PI-RADS
  v2.1 reference, LI-RADS, Bosniak 2019, BI-RADS, Lung-RADS,
  TI-RADS, Fleischner pulmonary-nodule rules.
- **Pediatric-specific extensions** — PRISM III, PIM-3, Schwartz
  height-velocity, Holliday-Segar refinements, Down syndrome
  growth curves, pediatric ECG normal values.
- **Field medicine and global health** — MUAC, SAM/MAM
  classification, IMCI integrated management, Wallace burn rule
  for children, drowning Szpilman.
- **Patient-decoder expansion** — additional EOB / MSN
  patient-literacy surfaces, claims-status decoders, drug-tier
  decoders.

Each future tranche follows the same v11 audit floor and v12
shipping contract. At v20 close, sophiewell.com is **403 tiles
of audited, deterministic, citable, login-less clinical
software** — well into the 400–600-tile parity window in
[docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md), and on
track to complete the long-horizon commitment as audit-cadence
allows.
