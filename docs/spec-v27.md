# spec-v27.md — Endocrine, rheumatology & osteoporosis completers (25 tiles)

> Status: proposed (2026-05-19). v27 is the sixteenth catalog-
> growth spec and the **third 25-tile slice of the v25–v28
> tranche**. It adds 25 tiles closing the endocrine / metabolic,
> rheumatologic / autoimmune, and bone-health surfaces that
> v12–v26 only partially addressed: ACR/EULAR classification
> criteria across the major rheumatologic disease families,
> osteoporosis (FRAX, T- / Z-score interpretation, GIOP-FRAX),
> primary aldosteronism case-detection, adrenal-incidentaloma
> work-up (ENSAT / NIH), pheochromocytoma post-test probability,
> diabetes-risk pre-screening (FINDRISC, ADA-risk-test), thyroid-
> nodule risk (ATA 2015 sonographic pattern), Cushing case-
> detection thresholds, and the most commonly used bedside
> insulin / fluid arithmetic that survived earlier prioritisation.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v27 amends no hard rule from v10–v26. Catalog growth: at v26
> close 553 tiles; at v27 close **578 tiles**.

## 1. Why v27 exists

Endocrinology and rheumatology are the two outpatient specialties
that depend most heavily on **classification criteria** — explicit
weighted scoring rules whose deterministic application defines
trial eligibility, payer coverage of biologic therapy, and
registry inclusion. Earlier specs shipped a few high-frequency
items (HOMA-IR, EAG, ADA-DM, Burch-Wartofsky, IADPSG, Carpenter-
Coustan, DAS28-CRP, CDAI-RA, SDAI-RA, SLEDAI-2K, BASDAI, ASDAS-
CRP, Marburg HS for chest pain). v27 closes the highest-frequency
remaining items and lands the osteoporosis surface, which is
heavily used in primary care and entirely missing from the
v12–v26 catalogue.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v27
specifically defers:

- **Disease-activity composite indices not yet validated outside
  derivation cohort** (e.g., PROMIS-29 disease-specific cuts).
- **Sjögren ultrasound scoring** beyond the OMERACT consensus
  surface in §3.2 (single-center modifications remain out).
- **Bone-density treatment-decision algorithms** beyond the AACE /
  Endocrine-Society T-score thresholds in §3.3 (FRAX-driven
  treatment thresholds vary by country; v27 ships the U.S. NOF /
  Endocrine-Society cuts only).
- **Adrenal venous-sampling interpretation thresholds.** Defer
  to a dedicated AVS spec.
- **Pituitary-incidentaloma work-up.** Defer to a future endocrine
  imaging tranche.

## 3. The 25 tiles

### 3.1 Rheumatology classification criteria

#### 3.1.1 `acr-eular-2010-ra` — ACR/EULAR 2010 RA classification criteria

- **Citation:** Aletaha D, Neogi T, Silman AJ, et al. *2010 Rheumatoid Arthritis Classification Criteria: an American College of Rheumatology / European League Against Rheumatism collaborative initiative.* Arthritis Rheum 2010;62(9):2569-2581.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Joint involvement (0–5), serology (RF / ACPA, 0–3), acute-phase reactants (0–1), symptom duration (0–1).
- **Output:** Definite RA if ≥6/10 in a patient with ≥1 synovitis joint not better explained by another disease.

#### 3.1.2 `acr-eular-2019-sle` — ACR/EULAR 2019 SLE classification criteria

- **Citation:** Aringer M, Costenbader K, Daikh D, et al. *2019 European League Against Rheumatism / American College of Rheumatology Classification Criteria for Systemic Lupus Erythematosus.* Arthritis Rheumatol 2019;71(9):1400-1412.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `nephrology`, `internal-medicine`.
- **Inputs:** ANA entry criterion (≥1:80) plus 7 clinical and 3 immunologic domains with weighted items.
- **Output:** Classify if ANA-positive AND ≥10 weighted points with at least one clinical criterion.

#### 3.1.3 `acr-eular-2015-gout` — ACR/EULAR 2015 gout classification criteria

- **Citation:** Neogi T, Jansen TLTA, Dalbeth N, et al. *2015 Gout Classification Criteria: an American College of Rheumatology / European League Against Rheumatism collaborative initiative.* Arthritis Rheumatol 2015;67(10):2557-2568.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Entry (≥1 episode peripheral / bursal swelling), sufficient (MSU crystals), 8 weighted clinical / lab / imaging items.
- **Output:** Score ≥8 classifies as gout. Banner: classification ≠ diagnosis; MSU-crystal demonstration remains gold standard.

#### 3.1.4 `acr-2016-fibromyalgia` — 2016 revised ACR fibromyalgia diagnostic criteria

- **Citation:** Wolfe F, Clauw DJ, Fitzcharles MA, et al. *2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria.* Semin Arthritis Rheum 2016;46(3):319-329.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `internal-medicine`, `family-medicine`, `psychiatry`.
- **Inputs:** Widespread Pain Index (WPI 0–19), Symptom Severity Scale (SSS 0–12), generalized-pain criterion (4 of 5 regions), symptoms ≥3 mo.
- **Output:** FM if WPI ≥7 AND SSS ≥5, OR WPI 4–6 AND SSS ≥9, AND generalized pain AND duration ≥3 mo.

#### 3.1.5 `asas-axspa` — ASAS classification criteria for axial spondyloarthritis

- **Citation:** Rudwaleit M, van der Heijde D, Landewé R, et al. *The development of Assessment of SpondyloArthritis international Society classification criteria for axial spondyloarthritis (part II): validation and final selection.* Ann Rheum Dis 2009;68(6):777-783.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** Chronic back pain ≥3 mo with onset <45 y plus imaging arm (sacroiliitis on imaging + ≥1 SpA feature) OR clinical arm (HLA-B27 + ≥2 SpA features).
- **Output:** Classify as axSpA if either arm is satisfied.

#### 3.1.6 `caspar-psa` — CASPAR criteria (psoriatic arthritis)

- **Citation:** Taylor W, Gladman D, Helliwell P, et al. *Classification criteria for psoriatic arthritis: development of new criteria from a large international study.* Arthritis Rheum 2006;54(8):2665-2673.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `dermatology`, `internal-medicine`.
- **Inputs:** Inflammatory articular disease entry + 5 weighted items (current psoriasis 2 / personal or family history 1, psoriatic nail dystrophy, RF-negative, dactylitis, juxta-articular new bone formation).
- **Output:** Score ≥3 classifies as PsA.

#### 3.1.7 `acr-eular-2016-sjogren` — 2016 ACR/EULAR Sjögren classification criteria

- **Citation:** Shiboski CH, Shiboski SC, Seror R, et al. *2016 American College of Rheumatology / European League Against Rheumatism classification criteria for primary Sjögren's syndrome.* Arthritis Rheumatol 2017;69(1):35-45.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `ophthalmology`, `oral-medicine`.
- **Inputs:** Five weighted items (labial-gland focus score ≥1, anti-SSA positive, ocular-staining score ≥5 or van Bijsterveld ≥4, Schirmer ≤5 mm/5 min, unstimulated salivary flow ≤0.1 mL/min). Entry: ≥1 sicca symptom; exclusions per the 2016 criteria.
- **Output:** Classify if score ≥4 after entry / exclusions applied.

#### 3.1.8 `acr-eular-2013-ssc` — 2013 ACR/EULAR systemic-sclerosis classification

- **Citation:** van den Hoogen F, Khanna D, Fransen J, et al. *2013 classification criteria for systemic sclerosis: an American College of Rheumatology / European League Against Rheumatism collaborative initiative.* Arthritis Rheum 2013;65(11):2737-2747.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `rheumatology`, `pulmonology`, `dermatology`.
- **Inputs:** Sufficient (proximal skin thickening MCPs) OR additive weighted items (skin distal to MCPs, fingertip lesions, telangiectasias, abnormal nailfold capillaries, ILD/PAH, Raynaud, SSc-specific autoantibodies).
- **Output:** Classify if total ≥9.

> Note: 2017 ACR/EULAR IIM (idiopathic inflammatory myopathies)
> is deferred to a future tranche; v27 closes the high-frequency
> classification surface.

### 3.2 OMERACT & rheumatology imaging consensus

#### 3.2.1 `omeract-bus-ra` — OMERACT 7-joint ultrasound scoring (rheumatoid arthritis)

- **Citation:** Backhaus M, Ohrndorf S, Kellner H, et al. *Evaluation of a novel 7-joint ultrasound score in daily rheumatologic practice: a pilot project.* Arthritis Rheum 2009;61(9):1194-1201.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `musculoskeletal-radiology`.
- **Inputs:** Per-joint synovitis / tenosynovitis / erosion in 7 joints by grey-scale and power-Doppler.
- **Output:** Composite synovitis / tenosynovitis / erosion totals per OMERACT.

### 3.3 Osteoporosis

#### 3.3.1 `frax-major` — FRAX major-osteoporotic and hip fracture probability (US)

- **Citation:** Kanis JA, Johnell O, Oden A, Johansson H, McCloskey E. *FRAX and the assessment of fracture probability in men and women from the UK.* Osteoporos Int 2008;19(4):385-397; WHO FRAX U.S. tool, current revision.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `family-medicine`, `internal-medicine`, `obstetrics-gynecology`, `geriatrics`.
- **Inputs:** Age, sex, weight, height, prior fracture, parental hip fracture, smoking, glucocorticoid use, rheumatoid arthritis, secondary osteoporosis, alcohol ≥3 units/day, femoral-neck BMD or T-score.
- **Output:** 10-year probability of major osteoporotic fracture and hip fracture. Banner: U.S. NOF/Endocrine-Society treatment thresholds (≥3% hip, ≥20% MOF) printed for reference; do not author treatment recommendation.

#### 3.3.2 `giop-frax` — Glucocorticoid-Induced Osteoporosis FRAX adjustment

- **Citation:** Kanis JA, Johansson H, Oden A, McCloskey EV. *Guidance for the adjustment of FRAX according to the dose of glucocorticoids.* Osteoporos Int 2011;22(3):809-816.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `endocrinology`, `internal-medicine`.
- **Inputs:** FRAX MOF and hip probability, daily prednisone-equivalent dose band (<2.5 / 2.5–7.5 / >7.5 mg/day).
- **Output:** Adjusted FRAX MOF and hip per the Kanis 2011 multipliers.

#### 3.3.3 `bmd-t-z-interp` — BMD T-score / Z-score interpretation (WHO / ISCD)

- **Citation:** World Health Organization. *Assessment of fracture risk and its application to screening for postmenopausal osteoporosis.* WHO Technical Report Series 843; 1994. ISCD 2019 Official Positions, current edition.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `rheumatology`, `family-medicine`, `geriatrics`.
- **Inputs:** Patient age, sex, menopausal status, BMD site (lumbar spine, total hip, femoral neck, 1/3 radius), T-score, Z-score.
- **Output:** WHO categorisation (normal / osteopenia / osteoporosis / severe osteoporosis); for premenopausal women and men <50, Z-score interpretation per ISCD ("below expected range" when Z ≤ −2.0).

### 3.4 Adrenal & catecholamine

#### 3.4.1 `aldosterone-renin-screen` — Primary-aldosteronism case-detection (ARR / aldosterone-renin ratio)

- **Citation:** Funder JW, Carey RM, Mantero F, et al. *The Management of Primary Aldosteronism: Case Detection, Diagnosis, and Treatment: an Endocrine Society Clinical Practice Guideline.* J Clin Endocrinol Metab 2016;101(5):1889-1916.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `nephrology`, `cardiology`.
- **Inputs:** Plasma aldosterone (ng/dL), plasma renin (ng/mL/h activity, or mIU/L direct), units toggle, interfering-medication flags.
- **Output:** ARR with units-normalised result. Banner: positive screen at ARR ≥20–30 with aldosterone ≥10 ng/dL (lab-dependent); list interfering medications per the Endocrine-Society 2016 table.

#### 3.4.2 `ensat-adrenal-incidentaloma` — ENSAT / NIH / Endocrine-Society adrenal-incidentaloma work-up bundle

- **Citation:** Fassnacht M, Tsagarakis S, Terzolo M, et al. *European Society of Endocrinology Clinical Practice Guideline on the management of adrenal incidentalomas, in collaboration with the European Network for the Study of Adrenal Tumors.* Eur J Endocrinol 2023;189(1):G1-G42.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `radiology`.
- **Inputs:** Imaging characteristics (size, attenuation in HU on non-contrast CT, washout), hormonal screening (1-mg DST, plasma / urinary metanephrines, ARR if hypertensive), prior malignancy.
- **Output:** Likelihood category (benign adenoma / indeterminate / suspicious for ACC or pheo / metastasis) and the recommended hormonal-screen set per the 2023 ESE / ENSAT bundle.

#### 3.4.3 `pheo-pretest` — Pheochromocytoma post-test probability via plasma free metanephrines

- **Citation:** Lenders JWM, Duh QY, Eisenhofer G, et al. *Pheochromocytoma and Paraganglioma: an Endocrine Society Clinical Practice Guideline.* J Clin Endocrinol Metab 2014;99(6):1915-1942.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `hypertension`.
- **Inputs:** Plasma free metanephrines result (vs upper-limit), normetanephrine result, sampling-position note (supine vs seated).
- **Output:** Likelihood band keyed to the Endocrine-Society 2014 operating characteristics; banner on supine-sampling and interfering-drug list.

#### 3.4.4 `cushing-screen` — Cushing-syndrome case-detection (Endocrine-Society 2008 / 2021 update)

- **Citation:** Nieman LK, Biller BMK, Findling JW, et al. *The diagnosis of Cushing's syndrome: an Endocrine Society Clinical Practice Guideline.* J Clin Endocrinol Metab 2008;93(5):1526-1540. (Reaffirmed in 2021 Pituitary Society consensus.)
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** 1-mg DST cortisol, late-night salivary cortisol, 24-h urinary free cortisol.
- **Output:** Per-test concordance summary; "abnormal screen if ≥2 tests abnormal" banner per 2008 guideline.

### 3.5 Diabetes / metabolic risk

#### 3.5.1 `findrisc` — Finnish Diabetes Risk Score

- **Citation:** Lindström J, Tuomilehto J. *The diabetes risk score: a practical tool to predict type 2 diabetes risk.* Diabetes Care 2003;26(3):725-731.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `family-medicine`, `internal-medicine`, `endocrinology`, `public-health`.
- **Inputs:** Age band, BMI band, waist band, physical-activity, daily fruit/veg intake, antihypertensive use, prior hyperglycemia, family history of diabetes.
- **Bands:** <7 low / 7–11 slightly elevated / 12–14 moderate / 15–20 high / >20 very high 10-yr T2D risk.

#### 3.5.2 `ada-risk-test` — ADA Type-2 Diabetes Risk Test

- **Citation:** Bang H, Edwards AM, Bomback AS, et al. *Development and validation of a patient self-assessment score for diabetes risk.* Ann Intern Med 2009;151(11):775-783; ADA web tool current revision.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `family-medicine`, `internal-medicine`, `endocrinology`, `public-health`.
- **Inputs:** Age, sex, family history, hypertension, physical-activity, race / ethnicity flag, BMI band.
- **Bands:** ≥5 = elevated risk → recommend HbA1c / FPG / OGTT.

#### 3.5.3 `dka-anion-gap-trajectory` — DKA anion-gap closure / β-hydroxybutyrate-resolution monitor

- **Citation:** Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. *Hyperglycemic crises in adult patients with diabetes.* Diabetes Care 2009;32(7):1335-1343. ADA 2024 Standards of Care.
- **Group:** Bedside Math (`F`).
- **Specialties:** `endocrinology`, `internal-medicine`, `critical-care`, `emergency-medicine`.
- **Inputs:** Sequential Na, K, Cl, HCO₃, β-OHB time-points.
- **Output:** Anion gap and (when available) β-OHB trajectory; banner per ADA 2024 resolution thresholds.

#### 3.5.4 `iv-insulin-titration-table` — IV-insulin-titration reference for hyperglycemic crisis

- **Citation:** Goldberg PA, Siegel MD, Sherwin RS, et al. *Implementation of a safe and effective insulin infusion protocol in a medical intensive care unit.* Diabetes Care 2004;27(2):461-467.
- **Group:** Bedside Math (`F`).
- **Specialties:** `endocrinology`, `internal-medicine`, `critical-care`.
- **Inputs:** Current BG, prior BG, current insulin rate, glucose trend.
- **Output:** Suggested rate-change band from the Goldberg / Yale protocol. Banner: local-protocol substitution if hospital uses a different titration table.

### 3.6 Thyroid

#### 3.6.1 `ata-2015-thyroid-nodule` — ATA 2015 thyroid-nodule sonographic-pattern risk

- **Citation:** Haugen BR, Alexander EK, Bible KC, et al. *2015 American Thyroid Association Management Guidelines for Adult Patients with Thyroid Nodules and Differentiated Thyroid Cancer.* Thyroid 2016;26(1):1-133.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `radiology`.
- **Inputs:** Nodule composition, echogenicity, shape, margins, echogenic foci, size (cm).
- **Bands:** Benign / very low / low / intermediate / high suspicion, with FNA size cutoffs per the 2015 ATA Figure 2.

> Note: TI-RADS (`ti-rads-acr`) is already shipped (v19/v20).
> ATA 2015 is the complementary pattern-based scheme widely used
> alongside ACR TI-RADS; v27 lands ATA explicitly.

> Note: thyroid-storm composite (`burch-wartofsky`) is already
> shipped at v19. v27 does not duplicate.

#### 3.6.2 `ata-2017-pregnancy-thyroid` — ATA 2017 thyroid-in-pregnancy reference cutoffs

- **Citation:** Alexander EK, Pearce EN, Brent GA, et al. *2017 Guidelines of the American Thyroid Association for the Diagnosis and Management of Thyroid Disease During Pregnancy and the Postpartum.* Thyroid 2017;27(3):315-389.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `obstetrics`, `endocrinology`, `family-medicine`, `internal-medicine`.
- **Inputs:** Trimester, TSH (mIU/L), free-T4 (or total-T4 with 1.5× non-pregnant range), TPO-Ab status.
- **Output:** Categorisation (euthyroid / subclinical hypothyroidism / overt hypothyroidism / hyperthyroidism / isolated hypothyroxinemia) per ATA 2017 trimester-specific reference ranges, with the population-specific-reference-range banner.

### 3.7 Metabolic-syndrome & adrenal-function adjuncts

#### 3.7.1 `metsyn-ncep-atp3` — NCEP ATP III metabolic-syndrome criteria

- **Citation:** Grundy SM, Cleeman JI, Daniels SR, et al. *Diagnosis and management of the metabolic syndrome: an American Heart Association / National Heart, Lung, and Blood Institute Scientific Statement.* Circulation 2005;112(17):2735-2752.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `endocrinology`, `family-medicine`, `internal-medicine`.
- **Inputs:** Waist circumference (sex-specific cut), triglycerides ≥150 mg/dL or on treatment, HDL <40 (M) / <50 (F) or on treatment, BP ≥130/85 or on treatment, fasting glucose ≥100 or on treatment.
- **Output:** Metabolic syndrome if ≥3 of 5 criteria met.

#### 3.7.2 `cosyntropin-stim` — ACTH (cosyntropin / Synacthen) stimulation-test interpretation

- **Citation:** Bornstein SR, Allolio B, Arlt W, et al. *Diagnosis and Treatment of Primary Adrenal Insufficiency: an Endocrine Society Clinical Practice Guideline.* J Clin Endocrinol Metab 2016;101(2):364-389.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `endocrinology`, `critical-care`, `internal-medicine`.
- **Inputs:** Baseline cortisol, 30- and 60-min cortisol after 250 µg cosyntropin, assay type (Roche/Abbott vs older RIA — banner-only).
- **Output:** Adrenal-insufficiency band per the Endocrine-Society 2016 cut (peak cortisol <18 µg/dL ≈ <500 nmol/L on older assays; assay-specific lower thresholds on newer monoclonal immunoassays). Banner: print the assay-caveat verbatim.

#### 3.7.3 `insulin-tdd-start` — Weight-based starting insulin total daily dose (basal-bolus)

- **Citation:** Umpierrez GE, Hellman R, Korytkowski MT, et al. *Management of Hyperglycemia in Hospitalized Patients in Non-Critical Care Setting: an Endocrine Society Clinical Practice Guideline.* J Clin Endocrinol Metab 2012;97(1):16-38.
- **Group:** Bedside Math (`F`).
- **Specialties:** `endocrinology`, `internal-medicine`, `hospital-medicine`.
- **Inputs:** Weight (kg), age band (≥70 vs <70), renal function (eGFR), insulin-naïve vs known T1D / T2D, current outpatient TDD.
- **Output:** Suggested starting TDD per the Umpierrez 2012 ladder (0.2–0.5 u/kg/day depending on age / renal / category), and the 50:50 basal:prandial split. Banner: defer to local hypoglycemia-bundle pathway.

## 4. Group homes

- Clinical Criteria & Diagnostic Bundles (`H`): §3.1.1–§3.1.8,
  §3.3.3, §3.4.1, §3.4.2, §3.4.4, §3.6.1, §3.6.2, §3.7.1, §3.7.2.
- Clinical Scoring & Risk (`G`): §3.2.1, §3.3.1, §3.3.2, §3.4.3,
  §3.5.1, §3.5.2.
- Bedside Math (`F`): §3.5.3, §3.5.4, §3.7.3.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Additional v27 audit
requirements:

- **Classification ≠ diagnosis.** Every §3.1 ACR/EULAR tile
  carries the user-visible banner: "Classification criteria
  are designed for cohort homogeneity in clinical trials and
  registries. They are not diagnostic criteria. A patient with
  the disease may not meet classification criteria, and meeting
  classification criteria does not by itself establish the
  diagnosis."

- **FRAX edition pinning.** §3.3.1 and §3.3.2 record the FRAX
  algorithm revision date and the U.S. population-reference data
  the calculator is keyed to. WHO / FRAX-tool revisions are
  enrolled as re-audit triggers per
  [docs/operations.md](operations.md).

- **Endocrine-Society guideline pinning.** §3.4.1, §3.4.2,
  §3.4.3, §3.4.4 record the guideline year. Future Endocrine-
  Society or ESE revisions trigger re-audit.

- **ARR units transparency.** §3.4.1 requires explicit unit
  toggle (PRA ng/mL/h vs direct-renin mIU/L). The result screen
  prints the formula keyed to the units selected so the reader
  can verify the math.

- **No treatment authoring.** §3.3.1 banner enumerates the
  U.S. NOF / Endocrine-Society treatment thresholds verbatim but
  does not author "treat / do not treat" in Sophie's voice.

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v26    | 553 | +25 |
| **v27**| **578** | **+25** |

## 7. What ships next in the tranche

- **v28** — Toxicology, envenomation, antimicrobial dosing & ID
  completers (closer of the v25–v28 tranche).
