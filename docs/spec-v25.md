# spec-v25.md — AJCC TNM 8th-edition staging bundle (25 tiles)

> Status: proposed (2026-05-19). v25 is the fourteenth catalog-
> growth spec and the **opener of the v25–v28 tranche** (the
> fourth 100-tile increment after v12–v16, v17–v20, and
> v21–v24). It adds 25 tiles covering **AJCC Cancer Staging
> Manual 8th edition TNM staging** for the highest-frequency
> primary solid-tumor sites.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v25 amends no hard rule from v10–v24. Catalog growth: at v24
> close 503 tiles; at v25 close **528 tiles**.
>
> v25 opens the v25–v28 tranche. The tranche, when closed at
> v28, will carry sophiewell.com to **603 audited, deterministic,
> citable, login-less clinical tools** — comfortably inside the
> 400–600-tile parity window in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) and at
> the threshold of the long-horizon commitment.

## 1. Why v25 exists

Cancer staging is the single highest-frequency clinical-decision
input in oncology, and AJCC TNM 8 (effective 1 January 2018) is
the active reference for every U.S. cancer registry, every NCCN
treatment-pathway entry condition, and every modern trial
eligibility statement. Prior specs shipped *prognostic* indices
(IPI, FLIPI, MIPI, IPSS-R/M, ISS / R-ISS / R2-ISS, BCLC,
NCCN-IPI). v25 ships the **TNM substrate** those indices
presuppose.

Selection follows the v12 §1 criteria. The 25 sites in v25 are
chosen by U.S. incidence × bedside-frequency × source-stability:
each site is among the top 30 incident cancers in SEER and has a
TNM definition that has not been amended outside of AJCC's
formal 8th-edition errata.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v25
specifically defers:

- **AJCC 9th-edition site staging** (rolling release, by site;
  not yet superseding 8th edition for any site at the v25-close
  audit date). Each AJCC-9 site release is enrolled as a re-
  audit trigger per [docs/operations.md](operations.md).
- **Pediatric staging systems** (Wilms COG, neuroblastoma INRG,
  rhabdomyosarcoma IRS, retinoblastoma IRSS). Defer to v26 or
  a dedicated peds-onc spec.
- **Hematologic malignancy staging** (Ann Arbor, Lugano,
  ISS / R-ISS / R2-ISS, Rai / Binet). Already shipped in
  v12–v24.
- **CNS tumor staging.** WHO CNS5 is grade-based, not TNM-based,
  and ships separately when audited.
- **Treatment-selection trees keyed off TNM** (NCCN, ESMO).
  v25 ships staging, not therapy choice.

## 3. The 25 tiles

Every tile takes T, N, M categories (and the site-specific
modifiers listed) and emits the AJCC anatomic / prognostic
stage group per the 8th-edition tables. All tiles cite *AJCC
Cancer Staging Manual, 8th edition. Amin MB, Edge SB, Greene FL,
et al., editors. Springer; 2017* in addition to the site chapter
listed.

### 3.1 Thoracic

#### 3.1.1 `tnm8-lung-nsclc` — NSCLC TNM 8 (Chapter 36)

- **Citation:** Goldstraw P, Chansky K, Crowley J, et al. *The IASLC Lung Cancer Staging Project: Proposals for Revision of the TNM Stage Groupings in the Forthcoming (Eighth) Edition of the TNM Classification for Lung Cancer.* J Thorac Oncol 2016;11(1):39-51.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `thoracic-surgery`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T (T1a–T4 with size thresholds 1/2/3/4/5/7 cm and invasion descriptors), N (N0–N3), M (M0, M1a, M1b, M1c).
- **Output:** Anatomic stage group (Occult, 0, IA1–IA3, IB, IIA, IIB, IIIA, IIIB, IIIC, IVA, IVB).

#### 3.1.2 `tnm8-lung-sclc` — SCLC TNM 8 (Chapter 37)

- **Citation:** Nicholson AG, Chansky K, Crowley J, et al. *The IASLC Lung Cancer Staging Project: Proposals for the Revision of the Clinical and Pathologic Staging of Small Cell Lung Cancer in the Forthcoming Eighth Edition.* J Thorac Oncol 2016;11(3):300-311.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** Same TNM substrate as NSCLC, applied to SCLC histology.
- **Output:** Anatomic stage group; banner cross-references VA-LS / ES limited-vs-extensive descriptor still in common use.

#### 3.1.3 `tnm8-esophagus` — Esophageal & EGJ TNM 8 (Chapter 16)

- **Citation:** Rice TW, Ishwaran H, Ferguson MK, et al. *Cancer of the Esophagus and Esophagogastric Junction: An Eighth Edition Staging Primer.* J Thorac Oncol 2017;12(1):36-42.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `thoracic-surgery`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T, N, M, histology (squamous vs adenocarcinoma), grade, location (squamous only); separate clinical (cTNM), pathologic (pTNM), and post-neoadjuvant (ypTNM) ladders.
- **Output:** Stage group per the three separate 8th-edition tables.

### 3.2 GI

#### 3.2.1 `tnm8-gastric` — Gastric TNM 8 (Chapter 17)

- **Citation:** In H, Solsky I, Palis B, Langdon-Embry M, Ajani J, Sano T. *Validation of the 8th edition of the AJCC TNM staging system for gastric cancer using the National Cancer Database.* Ann Surg Oncol 2017;24(12):3683-3691.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgical-oncology`, `gastroenterology`, `medical-oncology`.
- **Inputs:** T, N, M; separate cTNM / pTNM / ypTNM ladders.
- **Output:** Stage group per AJCC 8 tables.

#### 3.2.2 `tnm8-colorectal` — Colon & rectum TNM 8 (Chapter 20)

- **Citation:** Weiser MR. *AJCC 8th Edition: Colorectal Cancer.* Ann Surg Oncol 2018;25(6):1454-1455.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `colorectal-surgery`, `gastroenterology`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T (T1–T4b), N (N0–N2b, including tumor deposits), M (M1a, M1b, M1c).
- **Output:** Stage group (0, I, IIA–IIC, IIIA–IIIC, IVA–IVC).

#### 3.2.3 `tnm8-anal-canal` — Anal-canal TNM 8 (Chapter 21)

- **Citation:** Welton ML, Steele SR, Goodman KA, et al. *AJCC Cancer Staging Manual, 8th edition*, Anus chapter (Chapter 21).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `colorectal-surgery`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T (size + invasion), N, M.
- **Output:** Stage group I–IV per AJCC 8.

#### 3.2.4 `tnm8-pancreas` — Pancreatic adenocarcinoma TNM 8 (Chapter 28)

- **Citation:** Kamarajah SK, Burns WR, Frankel TL, Cho CS, Nathan H. *Validation of the AJCC 8th edition staging system for pancreatic adenocarcinoma using the National Cancer Database.* HPB (Oxford) 2017;19(11):975-981.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgical-oncology`, `gastroenterology`, `medical-oncology`.
- **Inputs:** T (size 2/4 cm thresholds), N (number of positive nodes: 0 / 1–3 / ≥4), M.
- **Output:** Stage group IA–IV.

#### 3.2.5 `tnm8-hcc` — Hepatocellular carcinoma TNM 8 (Chapter 22)

- **Citation:** Kamarajah SK, Frankel TL, Sonnenday C, Cho CS, Nathan H. *Critical evaluation of the American Joint Commission on Cancer (AJCC) 8th edition staging system for patients with hepatocellular carcinoma (HCC).* J Surg Oncol 2018;117(4):644-650.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `surgical-oncology`, `medical-oncology`.
- **Inputs:** T (single ≤2/>2/with vascular invasion; multifocal; major-vessel invasion), N, M.
- **Output:** Stage group IA–IVB. Banner cross-references prognostic algorithms in [BCLC](bclc) and [Milan-HCC](milan-hcc).

#### 3.2.6 `tnm8-cholangio-intrahepatic` — Intrahepatic cholangiocarcinoma TNM 8 (Chapter 23)

- **Citation:** Spolverato G, Bagante F, Weiss M, et al. *Comparative performances of the 7th and the 8th editions of the AJCC staging system for intrahepatic cholangiocarcinoma.* J Surg Oncol 2017;115(6):696-703.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `surgical-oncology`, `medical-oncology`.
- **Inputs:** T (solitary ± vascular invasion, multifocal, periductal invasion), N, M.
- **Output:** Stage I–IV per AJCC 8.

#### 3.2.7 `tnm8-gallbladder` — Gallbladder TNM 8 (Chapter 24)

- **Citation:** Shindoh J, de Aretxabala X, Aloia TA, et al. *Tumor location is a strong predictor of tumor progression and survival in T2 gallbladder cancer: an international multicenter study.* Ann Surg 2015;261(4):733-739; AJCC 8.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgical-oncology`, `hepatology`, `medical-oncology`.
- **Inputs:** T (with T2a peritoneal-side vs T2b hepatic-side split new in 8), N, M.
- **Output:** Stage I–IV per AJCC 8.

### 3.3 Genitourinary

#### 3.3.1 `tnm8-prostate` — Prostate TNM 8 (Chapter 58)

- **Citation:** Buyyounouski MK, Choyke PL, McKenney JK, et al. *Prostate cancer — major changes in the American Joint Committee on Cancer eighth edition cancer staging manual.* CA Cancer J Clin 2017;67(3):245-253.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `radiation-oncology`, `medical-oncology`.
- **Inputs:** T, N, M, PSA, Grade Group (1–5).
- **Output:** Anatomic stage and prognostic stage group I–IVB.

#### 3.3.2 `tnm8-bladder` — Urinary bladder TNM 8 (Chapter 62)

- **Citation:** Magers MJ, Lopez-Beltran A, Montironi R, Williamson SR, Kaimakliotis HZ, Cheng L. *Staging of bladder cancer.* Histopathology 2019;74(1):112-134.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T (Ta, Tis, T1, T2a/b, T3a/b, T4a/b), N (N0–N3), M (M1a, M1b).
- **Output:** Stage group 0a, 0is, I, II, IIIA, IIIB, IVA, IVB.

#### 3.3.3 `tnm8-kidney` — Renal-cell carcinoma TNM 8 (Chapter 60)

- **Citation:** Kim SP, Alt AL, Weight CJ, et al. *Independent validation of the 2010 American Joint Committee on Cancer TNM classification for renal cell carcinoma.* J Urol 2011;185(6):2035-2039; AJCC 8 errata.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `medical-oncology`.
- **Inputs:** T (size 4/7/10 cm thresholds, perinephric / sinus fat, vein invasion, beyond Gerota), N, M.
- **Output:** Stage group I–IV.

### 3.4 Gynecologic (AJCC 8 staging follows the FIGO classification in effect at the time of each chapter)

#### 3.4.1 `tnm8-cervix` — Cervical TNM 8 (Chapter 51)

- **Citation:** Bhatla N, Berek JS, Cuello Fredes M, et al. *Revised FIGO staging for carcinoma of the cervix uteri.* Int J Gynaecol Obstet 2019;145(1):129-135; AJCC 8 plus 2018 FIGO update.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gynecologic-oncology`, `radiation-oncology`.
- **Inputs:** T (size + invasion + parametrial / pelvic / adjacent extension), N (with N1 imaging vs pathologic distinction), M.
- **Output:** FIGO 2018 stage + AJCC 8 stage group.

#### 3.4.2 `tnm8-endometrium` — Endometrial TNM 8 (Chapter 53)

- **Citation:** Berek JS, Matias-Guiu X, Creutzberg C, et al. *FIGO staging of endometrial cancer: 2023*; AJCC 8 published table (1988/2009 FIGO substrate).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gynecologic-oncology`, `radiation-oncology`.
- **Inputs:** T (myometrial invasion %, cervical-stromal invasion, serosal / adnexal / vaginal / pelvic invasion), N, M.
- **Output:** Stage group I–IVB per AJCC 8 (1988 FIGO substrate). Banner notes the 2023 FIGO molecular-classification update is *not* applied (separate v26+ candidate).

#### 3.4.3 `tnm8-ovary` — Ovarian / fallopian tube / primary peritoneal TNM 8 (Chapter 55)

- **Citation:** Prat J, FIGO Committee on Gynecologic Oncology. *Staging classification for cancer of the ovary, fallopian tube, and peritoneum.* Int J Gynaecol Obstet 2014;124(1):1-5; AJCC 8.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gynecologic-oncology`, `medical-oncology`.
- **Inputs:** T (with IC1/2/3 substaging on capsule, surface, cytology), N (pelvic / para-aortic), M (M1a pleural cytology, M1b parenchymal).
- **Output:** Stage IA–IVB.

#### 3.4.4 `tnm8-vulva` — Vulvar TNM 8 (Chapter 49)

- **Citation:** Olawaiye AB, Cuello MA, Rogers LJ. *Cancer of the vulva: 2021 update.* Int J Gynaecol Obstet 2021;155(Suppl 1):7-18; AJCC 8.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gynecologic-oncology`, `radiation-oncology`.
- **Inputs:** T, N (number, size, fixed/ulcerated nodes), M.
- **Output:** Stage I–IVB per AJCC 8.

### 3.5 Breast & skin

#### 3.5.1 `tnm8-breast` — Breast cancer TNM 8 (Chapter 48)

- **Citation:** Giuliano AE, Connolly JL, Edge SB, et al. *Breast cancer — major changes in the American Joint Committee on Cancer eighth edition cancer staging manual.* CA Cancer J Clin 2017;67(4):290-303.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `breast-surgery`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T, N, M, ER, PR, HER2, histologic grade, Oncotype DX score (if available for cT1-2 N0 ER+).
- **Output:** Anatomic stage **and** clinical / pathologic prognostic stage per the AJCC 8 prognostic-stage tables. Banner: "Prognostic stage may differ from anatomic stage — the user-visible result lists both."

#### 3.5.2 `tnm8-melanoma` — Cutaneous melanoma TNM 8 (Chapter 47)

- **Citation:** Gershenwald JE, Scolyer RA, Hess KR, et al. *Melanoma staging: Evidence-based changes in the American Joint Committee on Cancer eighth edition cancer staging manual.* CA Cancer J Clin 2017;67(6):472-492.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `surgical-oncology`, `medical-oncology`.
- **Inputs:** T (Breslow thickness with new 0.8 mm threshold + ulceration), N (number of nodes, microscopic / clinically detected, in-transit / satellite / microsatellite), M (with LDH modifier 0, 1).
- **Output:** Stage 0, IA, IB, IIA, IIB, IIC, IIIA–IIID, IV.

> Note: Merkel-cell carcinoma (AJCC 8 Chapter 46) is deferred to
> a future tranche; v25 focuses on the top-by-incidence cutaneous
> tile (melanoma).

### 3.6 Head & neck (8th edition split HPV+ vs HPV− oropharyngeal, the largest single change in the edition)

#### 3.6.1 `tnm8-oropharynx-hpv-pos` — HPV-positive (p16+) oropharyngeal TNM 8 (Chapter 10)

- **Citation:** O'Sullivan B, Huang SH, Su J, et al. *Development and validation of a staging system for HPV-related oropharyngeal cancer by the International Collaboration on Oropharyngeal cancer Network for Staging (ICON-S): a multicentre cohort study.* Lancet Oncol 2016;17(4):440-451.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `head-and-neck-surgery`, `radiation-oncology`, `medical-oncology`.
- **Inputs:** T, N (clinical: contralateral / size; pathologic: number of positive nodes), M.
- **Output:** Clinical stage I–IV and pathologic stage I–IV per AJCC 8.

#### 3.6.2 `tnm8-oropharynx-hpv-neg` — HPV-negative (p16−) oropharyngeal & oral-cavity TNM 8 (Chapters 10–11)

- **Citation:** Lydiatt WM, Patel SG, O'Sullivan B, et al. *Head and Neck cancers — major changes in the American Joint Committee on Cancer eighth edition cancer staging manual.* CA Cancer J Clin 2017;67(2):122-137.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `head-and-neck-surgery`, `radiation-oncology`, `medical-oncology`.
- **Inputs:** T (with new depth-of-invasion modifier ≤5 / 5–10 / >10 mm), N (with extranodal extension modifier), M.
- **Output:** Stage 0–IVC.

#### 3.6.3 `tnm8-larynx` — Laryngeal TNM 8 (Chapter 14)

- **Citation:** Amin MB, Edge SB, Greene FL, et al. *AJCC Cancer Staging Manual, 8th edition*, Larynx chapter (Chapter 14).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `head-and-neck-surgery`, `radiation-oncology`, `medical-oncology`.
- **Inputs:** T (subsite: supraglottic / glottic / subglottic), N (with ENE modifier), M.
- **Output:** Stage 0–IVC.

### 3.7 Endocrine & soft tissue

#### 3.7.1 `tnm8-thyroid-dtc` — Differentiated thyroid (papillary / follicular) TNM 8 (Chapter 73)

- **Citation:** Tuttle RM, Haugen B, Perrier ND. *Updated American Joint Committee on Cancer / Tumor-Node-Metastasis Staging System for Differentiated and Anaplastic Thyroid Cancer (Eighth Edition): What Changed and Why?* Thyroid 2017;27(6):751-756.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `head-and-neck-surgery`, `medical-oncology`.
- **Inputs:** Age <55 vs ≥55, T, N, M.
- **Output:** Stage I–IVB per AJCC 8 (age-pivoted ladder).

#### 3.7.2 `tnm8-thyroid-anaplastic` — Anaplastic thyroid TNM 8 (Chapter 73)

- **Citation:** Tuttle RM, Haugen B, Perrier ND, op. cit.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `head-and-neck-surgery`, `medical-oncology`.
- **Inputs:** T, N, M (all anaplastic = at minimum stage IVA in AJCC 8).
- **Output:** Stage IVA / IVB / IVC.

#### 3.7.3 `tnm8-soft-tissue-sarcoma-trunk` — Soft-tissue sarcoma of trunk / extremities TNM 8 (Chapter 41)

- **Citation:** Tanaka K, Ozaki T. *New TNM classification (AJCC 8th edition) of bone and soft tissue sarcomas.* Jpn J Clin Oncol 2019;49(2):103-107.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgical-oncology`, `orthopedic-oncology`, `medical-oncology`, `radiation-oncology`.
- **Inputs:** T (size 5 / 10 / 15 cm thresholds), N, M, FNCLCC histologic grade.
- **Output:** Stage IA, IB, II, IIIA, IIIB, IV.

## 4. Group homes

- Clinical Scoring & Risk (`G`): all 25 tiles.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Additional v25 audit
requirements:

- **Edition pinning.** Every v25 tile records the AJCC edition
  ("AJCC 8 (2017 / effective 1 Jan 2018)") and the specific
  chapter number. A future AJCC-9 release for the same site
  triggers a re-audit rather than silent drift. The user-visible
  banner reads: "Staging is keyed to AJCC Cancer Staging Manual
  8th edition (effective 1 Jan 2018). If your registry has
  migrated to a later edition for this site, verify the stage
  group against your registry's edition."

- **Site-specific modifier transparency.** Tiles whose stage
  group depends on a non-TNM modifier (HPV status, age,
  PSA / Grade Group for prostate, ER / PR / HER2 / grade for
  breast, LDH for melanoma, ENE for head-and-neck, FNCLCC grade
  for STS) print every modifier on the result screen verbatim
  from the AJCC table. No modifier is silently defaulted.

- **Clinical / pathologic / post-neoadjuvant separation.**
  Esophageal, breast, gastric, prostate, and other sites with
  separate cTNM / pTNM / ypTNM ladders ship as a single tile
  whose top-level toggle selects ladder; ladders are not collapsed.

- **No prognostic / therapy overlay.** v25 tiles emit the AJCC
  stage group only. Cross-references to BCLC, NCCN-IPI, etc., are
  *links*, not embedded outputs.

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v24    | 503 | +25 |
| **v25**| **528** | **+25** |

## 7. What ships next in the tranche

- **v26** — Pediatric & neonatal completers (Apgar, Silverman-
  Andersen, Downes RDS, Kramer dermal icterus, Finnegan NAS, Bell
  NEC stage, Papile IVH, ICROP retinopathy of prematurity,
  Phoenix sepsis 2024, Holliday-Segar maintenance fluids,
  Broselow weight estimate, ETT-size formula, modified Yale
  Observation Scale, Centor-McIsaac peds, ALPS, peds-DKA cerebral-
  edema risk, peds pre-op ASA-PS guidance, peds-trauma score
  components not yet shipped, peds-onc INRG / IRS / IRSS, etc.).
- **v27** — Endocrine / rheumatology / osteoporosis completers
  (FRAX, GIOP FRAX, ACR/EULAR 2010 RA, 2019 SLE, 2015 gout, 2016
  fibromyalgia, ASAS axSpA, CASPAR PsA, ACR 2016 Sjögren,
  OMERACT BUS, ACR osteoarthritis, ENSAT adrenal incidentaloma,
  primary-aldosteronism screening thresholds, DUTCH cortisol-
  rhythm reference, Z- / T-score interpretation, FRAX major-
  osteoporotic vs hip).
- **v28** — Toxicology, envenomation, antimicrobial dosing & ID
  completers (lithium-toxicity bands, methotrexate-rescue level-
  time, digoxin-Fab dosing, TCA-toxicity ECG decision, opioid-
  overdose pediatric naloxone dosing, beta-blocker / CCB tox,
  CroFab dosing, ED-direct rabies post-exposure, tetanus-prophylaxis
  decision, vancomycin AUC/MIC dosing, aminoglycoside
  pharmacokinetic dosing, β-lactam allergy de-labeling PEN-FAST,
  C. difficile severity ATLAS / IDSA-2021, SOFT-ID / acute
  cholangitis Tokyo, MEDS sepsis prognosis).

Each future tranche follows the v11 audit floor and v12
shipping contract.
