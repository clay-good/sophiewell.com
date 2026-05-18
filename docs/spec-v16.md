# spec-v16.md — neurology/stroke, heme-onc, endocrine, advanced GI/hepatology (25 tiles)

> Status: proposed (2026-05-18). v16 is the fifth catalog-growth
> spec after [spec-v12](spec-v12.md), [spec-v13](spec-v13.md),
> [spec-v14](spec-v14.md), and [spec-v15](spec-v15.md). It rounds
> out the first parity-tranche with 25 tiles across stroke /
> intracranial hemorrhage scoring, lymphoma and MDS prognosis,
> hepatocellular carcinoma staging, hyperglycemic emergencies and
> thyroid storm, and inflammatory-bowel and advanced-hepatology
> scoring.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v16 amends no hard rule from v10/v11/v12/v13/v14/v15. Catalog
> growth: at v15 close 278 tiles; at v16 close 303 tiles.
>
> v16 closes the v12 → v16 tranche. At v16 close, sophiewell.com
> carries **303 audited, deterministic, citable, login-less
> clinical tools** — the first 125-tile increment toward the
> 400–600-tile parity target in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).

## 1. Why v16 exists

v12–v15 covered general internal medicine, peri-operative,
critical care, OB, peds, and trauma. v16 fills the remaining
specialty gaps that bedside clinicians and hospitalists hit:

1. **Stroke / ICH outcome scoring** — ICH score, FUNC, Hunt-Hess,
   WFNS, modified Fisher, ASPECTS, DRAGON, THRIVE.
2. **Heme-onc prognosis** — IPI (DLBCL), FLIPI (FL), MIPI (MCL),
   Sokal (CML), IPSS-R (MDS), BCLC (HCC).
3. **Endocrine emergencies** — Burch-Wartofsky (thyroid storm),
   ADA diabetes diagnostic thresholds, DKA criteria, HHS criteria,
   HOMA-IR.
4. **Advanced GI / hepatology** — Mayo Score (UC), Truelove-Witts
   (severe UC), Harvey-Bradshaw (Crohn's), NAFLD Fibrosis Score,
   Glasgow-Imrie (pancreatitis severity), IADPSG GDM criteria
   (deferred from v15 §8).

Each meets the v12 §1 criteria (frequency × stability × audit
feasibility).

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md),
[spec-v13 §2](spec-v13.md), [spec-v14 §2](spec-v14.md), and
[spec-v15 §2](spec-v15.md). v16 specifically defers:

- **CDAI (Crohn's Disease Activity Index)** — requires 7-day
  patient-recorded diary; better as a patient-facing companion
  tile. Harvey-Bradshaw (the clinician-only simplification) is
  shipped instead in v16.
- **PASI / EASI / DLQI** — dermatology indices; defer to a
  derm bundle.
- **DAS28 / CDAI-RA / SDAI** — rheumatology; defer to a rheum
  bundle.
- **Sharp / van der Heijde scoring** — imaging-based; defer.
- **TNM staging** — large reference table per cancer type; a
  TNM-reference bundle is planned separately.
- **MELD-Plus** — limited adoption; MELD / MELD-Na / MELD 3.0
  already shipped in [meld-childpugh](../lib/meta.js).
- **Hepatorenal syndrome (HRS-AKI) ICA-AKI criteria** — defer to
  a renal-criteria bundle that ships with KDIGO-CKD staging.
- **TOAST stroke classification** — qualitative typology; better
  as a reference tile.

## 3. The 25 tiles

### 3.1 Stroke & intracranial hemorrhage

#### 3.1.1 `ich-score` — Intracerebral Hemorrhage Score

- **Citation:** Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley
  GT, Johnston SC. *The ICH score: a simple, reliable grading
  scale for intracerebral hemorrhage.* Stroke 2001;32(4):891-897.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** GCS (3–4 = 2 / 5–12 = 1 / 13–15 = 0), ICH volume
  (≥30 cm³ = 1 / <30 = 0), IVH yes/no (1/0), infratentorial
  origin (1/0), age ≥80 (1/0).
- **Output:** 0–6; 30-day mortality bands per Hemphill 2001
  Table 4 (0: 0%; 1: 13%; 2: 26%; 3: 72%; 4: 97%; ≥5: 100%).

#### 3.1.2 `func` — FUNC Score (ICH functional outcome)

- **Citation:** Rost NS, Smith EE, Chang Y, Snider RW, Chanderraj
  R, Schwab K, et al. *Prediction of functional outcome in
  patients with primary intracerebral hemorrhage: the FUNC score.*
  Stroke 2008;39(8):2304-2309.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as ich-score.
- **Inputs:** ICH volume (<30 = 4; 30–60 = 2; ≥60 = 0), age
  (<70 = 2; 70–79 = 1; ≥80 = 0), ICH location (lobar = 2;
  deep = 1; infratentorial = 0), GCS (≥9 = 2; ≤8 = 0), pre-ICH
  cognitive impairment (no = 1; yes = 0).
- **Output:** 0–11; probability of functional independence at
  90 days per Rost 2008 Table 4.

#### 3.1.3 `hunt-hess` — Hunt-Hess SAH Grade

- **Citation:** Hunt WE, Hess RM. *Surgical risk as related to
  time of intervention in the repair of intracranial aneurysms.*
  J Neurosurg 1968;28(1):14-20.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`,
  `critical-care`, `surgery`.
- **Inputs:** 5-row picker (I asymptomatic / minimal headache;
  II moderate-to-severe headache, nuchal rigidity; III drowsy,
  confused, mild focal deficit; IV stuporous, moderate-to-
  severe hemiparesis; V deep coma, decerebrate posturing).
- **Output:** Grade I–V plus the Hunt-Hess 1968 surgical-
  mortality bands.

#### 3.1.4 `wfns` — WFNS SAH Grade

- **Citation:** Teasdale GM, Drake CG, Hunt W, et al. *A
  universal subarachnoid hemorrhage scale: report of a committee
  of the World Federation of Neurosurgical Societies.* J Neurol
  Neurosurg Psychiatry 1988;51(11):1457.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as hunt-hess.
- **Inputs:** GCS (15 / 13–14 without deficit / 13–14 with
  deficit / 7–12 / 3–6 → I / II / III / IV / V).
- **Output:** Grade I–V; mortality and outcome bands quoted in
  the interpretation block from the WFNS 1988 derivation.

#### 3.1.5 `fisher-sah` — Modified Fisher SAH Grade

- **Citation:** Frontera JA, Claassen J, Schmidt JM, et al.
  *Prediction of symptomatic vasospasm after subarachnoid
  hemorrhage: the modified Fisher scale.* Neurosurgery 2006;
  59(1):21-27. (Original Fisher: Fisher CM, Kistler JP, Davis JM.
  *Relation of cerebral vasospasm to subarachnoid hemorrhage
  visualized by computerized tomographic scanning.* Neurosurgery
  1980;6(1):1-9.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as hunt-hess.
- **Inputs:** Picker for the four modified-Fisher categories
  based on cisternal blood thickness and IVH presence.
- **Output:** Grade 0–4 plus symptomatic-vasospasm rates per
  Frontera 2006 Table 3.

#### 3.1.6 `aspects` — Alberta Stroke Program Early CT Score

- **Citation:** Barber PA, Demchuk AM, Zhang J, Buchan AM.
  *Validity and reliability of a quantitative computed tomography
  score in predicting outcome of hyperacute stroke before
  thrombolytic therapy.* Lancet 2000;355(9216):1670-1674.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `radiology`,
  `emergency-medicine`.
- **Inputs:** Picker for each of 10 MCA territory regions (C, L,
  IC, I, M1–M6) — present/absent early ischemic change. Start at
  10, subtract one per affected region.
- **Output:** 0–10; ≤7 associated with worse functional outcome
  and higher hemorrhage risk with IV tPA (Barber 2000 §Results;
  ASTER and ESCAPE trial endorsements cited).

#### 3.1.7 `dragon` — DRAGON Score (post-tPA outcome)

- **Citation:** Strbian D, Meretoja A, Ahlhelm FJ, et al.
  *Predicting outcome of IV thrombolysis-treated ischemic stroke
  patients: the DRAGON score.* Neurology 2012;78(6):427-432.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** Dense MCA / early infarct on CT (1 each; 2 if
  both), pre-stroke mRS >1 (1), Age (≥80 = 2; 65–79 = 1;
  <65 = 0), Glucose >144 (1), Onset to treatment >90 min (1),
  baseline NIHSS (>15 = 3; 10–15 = 2; 5–9 = 1; ≤4 = 0).
- **Output:** 0–10; probability of good 3-month outcome
  (mRS 0–2) and miserable outcome (mRS 5–6) per Strbian 2012
  Figure 2.

#### 3.1.8 `thrive` — THRIVE Score

- **Citation:** Flint AC, Cullen SP, Faigeles BS, Rao VA. *Predicting
  long-term outcome after endovascular stroke treatment: the
  totaled health risks in vascular events score.* AJNR Am J
  Neuroradiol 2010;31(7):1192-1196.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as dragon.
- **Inputs:** NIHSS (≤10 = 0; 11–20 = 2; 21+ = 4), age (≤59 = 0;
  60–79 = 1; ≥80 = 2), comorbidities (HTN, DM, AFib; 1 each).
- **Output:** 0–9; probability of good outcome (mRS 0–2) per
  Flint 2010 Table 3.

### 3.2 Heme-onc prognosis

#### 3.2.1 `ipi-dlbcl` — International Prognostic Index (DLBCL)

- **Citation:** The International Non-Hodgkin's Lymphoma
  Prognostic Factors Project. *A predictive model for aggressive
  non-Hodgkin's lymphoma.* N Engl J Med 1993;329(14):987-994.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Age >60 (1), Stage III or IV (1), elevated LDH (1),
  ECOG performance status ≥2 (1), >1 extranodal site (1).
- **Output:** 0–5; low / low-intermediate / high-intermediate /
  high risk with 5-year OS per IPI 1993 Table 3.

#### 3.2.2 `flipi` — FLIPI (Follicular Lymphoma IPI)

- **Citation:** Solal-Céligny P, Roy P, Colombat P, et al.
  *Follicular Lymphoma International Prognostic Index.* Blood
  2004;104(5):1258-1265.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Age ≥60, Ann Arbor stage III/IV, hemoglobin
  <12 g/dL, ≥5 nodal areas, elevated LDH.
- **Output:** 0–1 low, 2 intermediate, ≥3 high; 5- and 10-year
  OS per Solal-Céligny 2004 Table 3.

#### 3.2.3 `mipi` — Mantle Cell Lymphoma IPI

- **Citation:** Hoster E, Dreyling M, Klapper W, et al. *A new
  prognostic index (MIPI) for patients with advanced-stage mantle
  cell lymphoma.* Blood 2008;111(2):558-565.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Age (years), ECOG performance status, LDH (ratio
  to ULN), WBC.
- **Formula:** MIPI = [0.03535 × age] + [0.6978 × (ECOG > 1)] +
  [1.367 × log₁₀(LDH/ULN)] + [0.9393 × log₁₀(WBC)].
- **Output:** Score with cutoffs: <5.7 low / 5.7–6.2 intermediate
  / ≥6.2 high.

#### 3.2.4 `sokal-cml` — Sokal Score for CML

- **Citation:** Sokal JE, Cox EB, Baccarani M, et al. *Prognostic
  discrimination in "good-risk" chronic granulocytic leukemia.*
  Blood 1984;63(4):789-799.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Age (years), spleen size below costal margin (cm),
  platelet count, peripheral blast %.
- **Formula:** exp [0.0116 × (age − 43.4) + 0.0345 × (spleen −
  7.51) + 0.188 × ((platelets/700)² − 0.563) + 0.0887 × (blasts
  − 2.10)].
- **Output:** Numeric Sokal; <0.8 low / 0.8–1.2 intermediate /
  >1.2 high risk.

#### 3.2.5 `ipss-r` — Revised IPSS for MDS

- **Citation:** Greenberg PL, Tuechler H, Schanz J, et al.
  *Revised international prognostic scoring system for
  myelodysplastic syndromes.* Blood 2012;120(12):2454-2465.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Cytogenetic risk (very good / good / intermediate /
  poor / very poor → 0 / 1 / 2 / 3 / 4), bone marrow blasts (≤2%
  = 0; >2–<5% = 1; 5–10% = 2; >10% = 3), hemoglobin (≥10 = 0;
  8–<10 = 1; <8 = 1.5), absolute neutrophil count (≥0.8 = 0;
  <0.8 = 0.5), platelet count (≥100 = 0; 50–<100 = 0.5; <50 = 1).
- **Output:** Sum 0–10; very low / low / intermediate / high /
  very high; median survival per Greenberg 2012 Table 6.

#### 3.2.6 `bclc` — BCLC Staging for HCC

- **Citation:** Llovet JM, Brú C, Bruix J. *Prognosis of
  hepatocellular carcinoma: the BCLC staging classification.*
  Semin Liver Dis 1999;19(3):329-338. Updated: Reig M, Forner A,
  Rimola J, et al. *BCLC strategy for prognosis prediction and
  treatment recommendation: The 2022 update.* J Hepatol 2022;
  76(3):681-693.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hepatology`,
  `gastroenterology`, `surgery`.
- **Inputs:** Tumor characteristics (single ≤2 cm vs single
  >2 cm vs ≤3 nodules ≤3 cm vs multinodular vs portal invasion
  / extrahepatic spread), liver function (Child-Pugh class —
  links to the shipped `meld-childpugh` tile), performance
  status (ECOG — links to v12 `ecog-karnofsky`).
- **Output:** BCLC stage 0 / A / B / C / D plus the 2022-update
  treatment recommendation quoted as `interpretation` per
  spec-v11 §5.

### 3.3 Endocrine emergencies & diagnostic thresholds

#### 3.3.1 `burch-wartofsky` — Burch-Wartofsky Thyroid Storm

- **Citation:** Burch HB, Wartofsky L. *Life-threatening
  thyrotoxicosis. Thyroid storm.* Endocrinol Metab Clin North Am
  1993;22(2):263-277.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `critical-care`,
  `emergency-medicine`.
- **Inputs:** Temperature (5–30 by 5°F bands), CNS effects (none
  to coma; 0 / 10 / 20 / 30), GI-hepatic (0 / 10 / 20),
  tachycardia (0 / 5 / 10 / 15 / 20 / 25), CHF (0 / 5 / 10 / 15),
  atrial fibrillation (0 / 10), precipitant history (0 / 10).
- **Output:** Sum; ≥45 = thyroid storm likely; 25–44 = impending;
  <25 unlikely (Burch 1993 Table 1).

#### 3.3.2 `ada-dm-dx` — ADA Diabetes Diagnostic Thresholds

- **Citation:** American Diabetes Association. *Classification
  and Diagnosis of Diabetes: Standards of Care in Diabetes —
  2024.* Diabetes Care 2024;47(Suppl 1):S20-S42.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `nursing-general`,
  `pharmacy`.
- **Inputs:** Fasting plasma glucose (mg/dL), 2-hr OGTT (mg/dL),
  HbA1c (%), random glucose (mg/dL) with classic-symptoms flag.
- **Output:** Normal / prediabetes / diabetes per ADA 2024
  Table 2.2 thresholds (FPG ≥126 / OGTT ≥200 / HbA1c ≥6.5 /
  random ≥200 with symptoms; intermediate "prediabetes" thresholds
  100–125 / 140–199 / 5.7–6.4).

#### 3.3.3 `dka-criteria` — DKA Diagnostic Criteria

- **Citation:** Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN.
  *Hyperglycemic crises in adult patients with diabetes.*
  Diabetes Care 2009;32(7):1335-1343.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `critical-care`,
  `emergency-medicine`, `pediatrics`.
- **Inputs:** Plasma glucose (>250 = yes), arterial pH, serum
  bicarbonate, urinary ketones / serum β-hydroxybutyrate, anion
  gap (calculated; links to shipped `anion-gap` tile).
- **Output:** DKA yes/no plus severity (mild pH 7.25–7.30, HCO₃
  15–18 / moderate pH 7.00–7.24, HCO₃ 10–14 / severe pH <7.00,
  HCO₃ <10) per Kitabchi 2009 Table 1.

#### 3.3.4 `hhs-criteria` — HHS Diagnostic Criteria

- **Citation:** same as `dka-criteria`.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** same as `dka-criteria`.
- **Inputs:** Plasma glucose, plasma osmolality, arterial pH,
  serum bicarbonate, mental status.
- **Output:** HHS yes/no per Kitabchi 2009 Table 1 (glucose
  >600, effective osm >320, pH >7.30, HCO₃ >18, minimal
  ketonuria, altered mental status). Ships side by side with
  DKA; the combined card surfaces the comparison.

#### 3.3.5 `homa-ir` — HOMA-IR Insulin Resistance

- **Citation:** Matthews DR, Hosker JP, Rudenski AS, Naylor BA,
  Treacher DF, Turner RC. *Homeostasis model assessment: insulin
  resistance and beta-cell function from fasting plasma glucose
  and insulin concentrations in man.* Diabetologia 1985;28(7):
  412-419.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `nursing-general`.
- **Inputs:** Fasting glucose (mg/dL), fasting insulin (µU/mL).
- **Formula:** HOMA-IR = (fasting insulin × fasting glucose) /
  405.
- **Output:** HOMA-IR value; >2.5 suggests insulin resistance
  in published US/UK cohorts (caveat: thresholds vary by
  population; documented in interpretation).

### 3.4 Advanced GI / hepatology

#### 3.4.1 `mayo-uc` — Mayo Score (UC severity)

- **Citation:** Schroeder KW, Tremaine WJ, Ilstrup DM.
  *Coated oral 5-aminosalicylic acid therapy for mildly to
  moderately active ulcerative colitis. A randomized study.*
  N Engl J Med 1987;317(26):1625-1629.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`.
- **Inputs:** Stool frequency (0–3), rectal bleeding (0–3),
  endoscopy (0–3), physician global assessment (0–3).
- **Output:** 0–12; <3 remission, 3–5 mild, 6–10 moderate, >10
  severe (Schroeder 1987). Partial Mayo (omits endoscopy):
  0–9 with the same proportional bands, surfaced as a toggle.

#### 3.4.2 `truelove-witts` — Truelove-Witts Criteria for Severe UC

- **Citation:** Truelove SC, Witts LJ. *Cortisone in ulcerative
  colitis; final report on a therapeutic trial.* BMJ 1955;
  2(4947):1041-1048.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`.
- **Inputs:** ≥6 bloody stools/day plus any of: HR >90, temp
  >37.8°C, hemoglobin <10.5 g/dL, ESR >30 mm/h.
- **Output:** Severe UC yes/no (Truelove-Witts 1955; ECCO 2022
  guideline endorses the cutoffs unchanged).

#### 3.4.3 `harvey-bradshaw` — Harvey-Bradshaw Index (Crohn's)

- **Citation:** Harvey RF, Bradshaw JM. *A simple index of Crohn's-
  disease activity.* Lancet 1980;1(8167):514.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`.
- **Inputs:** General well-being (0–4), abdominal pain (0–3),
  number of liquid stools/day (each 1 point, no cap), abdominal
  mass (0/1/2/3), complications (each 1 point: arthralgia,
  uveitis, erythema nodosum, aphthous ulcers, pyoderma
  gangrenosum, anal fissure, new fistula, abscess).
- **Output:** Sum; <5 remission, 5–7 mild, 8–16 moderate,
  >16 severe.

#### 3.4.4 `nafld-fs` — NAFLD Fibrosis Score

- **Citation:** Angulo P, Hui JM, Marchesini G, et al. *The NAFLD
  fibrosis score: a noninvasive system that identifies liver
  fibrosis in patients with NAFLD.* Hepatology 2007;45(4):846-
  854.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hepatology`, `gastroenterology`,
  `endocrinology`.
- **Inputs:** Age, BMI, diabetes/IFG (yes/no), AST/ALT ratio,
  platelet count, albumin.
- **Formula:** −1.675 + 0.037×age + 0.094×BMI + 1.13×IFG/DM −
  0.013×platelets − 0.66×albumin + 0.99×AST/ALT.
- **Output:** Score with cutoffs: <−1.455 rules out advanced
  fibrosis; >0.676 rules in advanced fibrosis; −1.455 to 0.676
  indeterminate.

#### 3.4.5 `glasgow-imrie` — Glasgow-Imrie Pancreatitis Severity

- **Citation:** Blamey SL, Imrie CW, O'Neill J, Gilmour WH, Carter
  DC. *Prognostic factors in acute pancreatitis.* Gut 1984;25(12):
  1340-1346.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `surgery`,
  `emergency-medicine`, `critical-care`.
- **Inputs:** PaO₂ <60 mmHg (1), Age >55 (1), WBC >15×10⁹/L (1),
  Calcium <8 mg/dL (1), Urea >45 mg/dL (1), LDH >600 U/L (1),
  Albumin <3.2 g/dL (1), Glucose >180 mg/dL (1).
- **Output:** 0–8; ≥3 within 48 h = severe pancreatitis
  (Blamey 1984). Sophie ships side-by-side with the existing
  [ranson-bisap](../lib/meta.js) so the clinician sees all
  three scoring systems in one place.

#### 3.4.6 `iadpsg` — IADPSG GDM Criteria

- *(Deferred from v15 §8; included here for completeness of the
  v12 → v16 tranche.)*
- **Citation:** International Association of Diabetes and
  Pregnancy Study Groups Consensus Panel. *International
  association of diabetes and pregnancy study groups
  recommendations on the diagnosis and classification of
  hyperglycemia in pregnancy.* Diabetes Care 2010;33(3):676-682.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `endocrinology`.
- **Inputs:** 75-g 2-h OGTT values: fasting, 1-h, 2-h.
- **Output:** GDM diagnosed if ≥1 value exceeds (fasting 92 /
  1-h 180 / 2-h 153). Ships side by side with v15
  `carpenter-coustan` so the clinician selects per local
  protocol; the combined card surfaces the comparison and the
  HAPO Study 2008 derivation context.

## 4. Group-home assignments

| Group label                       | New v16 tiles                                                                                                                                                                                            | Count |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| Clinical Scoring & Risk (`G`)     | ich-score, func, hunt-hess, wfns, fisher-sah, aspects, dragon, thrive, ipi-dlbcl, flipi, ipss-r, bclc, burch-wartofsky, ada-dm-dx, dka-criteria, hhs-criteria, mayo-uc, truelove-witts, harvey-bradshaw, glasgow-imrie, iadpsg | 21    |
| Clinical Math & Conversions (`E`) | mipi, sokal-cml, homa-ir, nafld-fs                                                                                                                                                                       | 4     |

21 + 4 = 25.

## 5. Per-tile shipping contract

Inherits [spec-v12 §5](spec-v12.md) verbatim.

## 6. Sequencing

- **Wave 16-0** — this spec doc.
- **Wave 16-1 (ICH / SAH grading)** — ich-score, func, hunt-hess,
  wfns, fisher-sah.
- **Wave 16-2 (ischemic stroke imaging+outcome)** — aspects,
  dragon, thrive.
- **Wave 16-3 (lymphoma IPIs)** — ipi-dlbcl, flipi, mipi.
- **Wave 16-4 (CML + MDS + HCC)** — sokal-cml, ipss-r, bclc.
- **Wave 16-5 (endocrine emergencies)** — burch-wartofsky,
  ada-dm-dx, dka-criteria, hhs-criteria, homa-ir.
- **Wave 16-6 (IBD severity)** — mayo-uc, truelove-witts,
  harvey-bradshaw.
- **Wave 16-7 (NAFLD + pancreatitis + GDM annex)** — nafld-fs,
  glasgow-imrie, iadpsg.
- **Wave 16-8 (tranche closeout)** — CHANGELOG, 278 → 303,
  audit-coverage 100%, and the v12 → v16 tranche-closeout note
  in [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md)
  noting 125 audited tiles added across 5 specs.

## 7. Acceptance criteria

Same as [spec-v13 §7](spec-v13.md). Catalog target 278 → 303.

Additionally at v16 close (the v12 → v16 tranche close):

- README catalog count updated 178 → 303 in `index.html` meta
  description, JSON-LD, OG card generator, and the audience hubs
  under `dist/for/`.
- A new short section in
  [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) notes
  that the first 125-tile increment landed across spec-v12 through
  spec-v16, with the cadence rationale in §3 of that doc
  preserved.
- The five audience hubs under `dist/for/` re-render with the
  new tiles slotted into each audience's set per
  `META[id].specialties` ∩ audience mapping.
- The eight topic pages under `dist/topics/` re-link
  automatically; the VTE topic, the GI-bleed topic, the stroke
  topic, and the sepsis / ICU topic each gain internal links to
  the new tiles in this tranche.

## 8. Out of scope

Already enumerated in §2. v16 also defers:

- **TNM staging tiles** per cancer type — large reference; a
  dedicated TNM-reference spec is planned.
- **Per-cancer EBC, Cancer-Specific Survival nomograms** —
  closed-coefficient models (MSKCC, ACOSOG) — defer.
- **NIH stroke-trial inclusion checklists (NINDS, ECASS)** —
  procedure checklists, better surfaced as audit reference.
- **Sepsis-3 SOFA-trajectory delta-SOFA scoring** — qualitative
  use of shipped SOFA.
- **VITT (vaccine-induced thrombosis) scoring** — pandemic-era
  niche.
- **Light's criteria** — already shipped as `lights`.

## 9. Quick reference

| Id                | Visible name                                              | Group |
|-------------------|-----------------------------------------------------------|-------|
| `ich-score`       | Intracerebral Hemorrhage Score                            | G     |
| `func`            | FUNC Score (ICH outcome)                                  | G     |
| `hunt-hess`       | Hunt-Hess SAH Grade                                       | G     |
| `wfns`            | WFNS SAH Grade                                            | G     |
| `fisher-sah`      | Modified Fisher SAH Grade                                 | G     |
| `aspects`         | Alberta Stroke Program Early CT Score                     | G     |
| `dragon`          | DRAGON Score (post-tPA outcome)                           | G     |
| `thrive`          | THRIVE Score                                              | G     |
| `ipi-dlbcl`       | International Prognostic Index (DLBCL)                    | G     |
| `flipi`           | FLIPI (Follicular Lymphoma)                               | G     |
| `mipi`            | Mantle Cell Lymphoma IPI                                  | E     |
| `sokal-cml`       | Sokal Score for CML                                       | E     |
| `ipss-r`          | Revised IPSS for MDS                                      | G     |
| `bclc`            | BCLC Staging for HCC                                      | G     |
| `burch-wartofsky` | Burch-Wartofsky Thyroid Storm                             | G     |
| `ada-dm-dx`       | ADA Diabetes Diagnostic Thresholds                        | G     |
| `dka-criteria`    | DKA Diagnostic Criteria                                   | G     |
| `hhs-criteria`    | HHS Diagnostic Criteria                                   | G     |
| `homa-ir`         | HOMA-IR Insulin Resistance                                | E     |
| `mayo-uc`         | Mayo Score (UC severity)                                  | G     |
| `truelove-witts`  | Truelove-Witts (severe UC)                                | G     |
| `harvey-bradshaw` | Harvey-Bradshaw Index (Crohn's)                           | G     |
| `nafld-fs`        | NAFLD Fibrosis Score                                      | E     |
| `glasgow-imrie`   | Glasgow-Imrie Pancreatitis Severity                       | G     |
| `iadpsg`          | IADPSG GDM Criteria                                       | G     |

Total: 25 tiles. Catalog 278 → 303 at v16 close.

## 10. Tranche close (v12 → v16): 125 audited tiles

At v16 close, the v12 → v16 tranche delivers 125 new audited,
deterministic, citable tiles on top of the v11-audited 178 — a
303-tile catalog. The breakdown:

| Spec     | Theme                                                | New tiles | Cumulative |
|----------|------------------------------------------------------|-----------|------------|
| v11      | (correctness audit of the original 178; baseline)    | 0         | 178        |
| v12      | High-priority bedside-medicine (NEWS2, PESI, GBS, FIB-4, etc.) | 25 | 203 |
| v13      | ICU & critical-care scoring                          | 25        | 228        |
| v14      | Pre-op, anticoag, OSA, recovery, DAPT                | 25        | 253        |
| v15      | Obstetrics, pediatrics, trauma & EMS                 | 25        | 278        |
| v16      | Neuro/stroke, heme-onc, endocrine, advanced GI/hep   | 25        | 303        |

The remaining road to the
[docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) target of
400–600 tiles is committed but not pre-scoped. Future spec
increments (v17+) will pick the next adjacent bundles —
rheumatology (DAS28, ACR/EULAR classification), neonatology
(Sarnat HIE, Bell NEC, NRP timeline), advanced peds-ICU (PRISM,
PIM), nephrology criteria (KDIGO-CKD staging, HRS-AKI),
dermatology (PASI, EASI), psychiatry expanded (PCL-5, C-SSRS,
ASRS, MDQ), advanced cardiology (BRUE, Brugada criteria,
Vereckei aVR), and additional EMS / field-medicine variants
(SALT triage) — once the v12–v16 tranche is fully shipped and
audited.

Per [scope-mdcalc-parity §3](scope-mdcalc-parity.md), cadence is
5–20 audited tiles per month. The v12 → v16 tranche of 125 tiles
is, at that cadence, a 6–25 month commitment. Faster is
unsustainable; slow is fine; the audit floor is non-negotiable.
