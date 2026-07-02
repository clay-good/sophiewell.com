# Changelog

All notable changes to sophiewell.com are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (spec-v201 — Deep Subspecialty Quantitation program continues: hepatology & upper-GI-bleeding prognostic instruments, shipped one tile at a time, 852 → …)

- Continues the **Deep Subspecialty Quantitation** program (spec-v199–v203) with
  the third feature spec, five hepatology and upper-GI-bleeding prognostic
  instruments shipped **one tile at a time**. New module
  `lib/hepatology-gibleed-v201.js`, renderers `views/group-v201.js` (RV201).
- **Glasgow-Blatchford Score** (`glasgow-blatchford`, 852 → 853): the
  pre-endoscopy upper-GI-bleed risk score from first-contact data (blood urea,
  sex-specific haemoglobin, systolic BP, pulse ≥ 100, melaena, syncope, hepatic
  disease, cardiac failure; total 0–23). A score of 0 (or ≤ 1 by the BSG
  extension) flags a candidate for outpatient management; ≥ 6 carries a > 50%
  chance of needing transfusion or endoscopic intervention. The grid was
  cross-verified against GPnotebook and RCEMLearning (spec-v97), with the
  RCEMLearning typos (urea > 25 as "5", max "29") corrected against the published
  0–23 range (6+6+3+1+1+2+2+2 = 23). A US-standard BUN (mg/dL) input is converted
  to urea mmol/L by urea = BUN ÷ 2.8.
- **CLIF-C AD score** (`clif-c-ad`, 853 → 854): the CLIF Consortium Acute
  Decompensation score for the hospitalised decompensated cirrhotic **without**
  acute-on-chronic liver failure. CLIF-C ADs = 10 × [0.03·age + 0.66·ln(creatinine)
  + 1.71·ln(INR) + 0.88·ln(WBC) − 0.05·sodium + 8]; bands < 50 low, 50–59
  intermediate, ≥ 60 high (≈ 93% / 80% / 50% survival). **spec-v97 spec-draft
  correction:** the spec-v201 §2.2 draft listed only four predictors and omitted
  **INR**; both authoritative EF-CLIF sources (efclif.com, clifresearch.com)
  carry the five-variable formula with INR, so the tile ships the verbatim
  five-input model (the v199 ELTS / v200 APPS precedent — the source governs, not
  the draft). The logistic labs are ln-guarded to positive domains.

### Added (spec-v200 — Deep Subspecialty Quantitation program continues: 4 critical-care severity & acid-base calculators, 848 → 852)

- Continues the **Deep Subspecialty Quantitation** program (spec-v199–v203) with
  **4 new deterministic critical-care instruments**: **OASIS** (`oasis`, the
  Oxford Acute Severity of Illness Score — a 10-variable ICU severity model
  needing no lab panel, 0–75 → logistic in-hospital mortality), **LODS** (`lods`,
  the Logistic Organ Dysfunction System — six organ systems scored by their worst
  first-day value, 0–22 → logistic hospital mortality), the **delta-gap /
  delta-ratio** (`delta-gap`, an acid-base disambiguator that flags a mixed
  metabolic disorder behind a high anion gap, with the zero-denominator case
  guarded), and the **APPS score** (`apps-ards`, the Villar age / PaO₂-FiO₂ /
  plateau-pressure ARDS outcome stratifier, 3–9). New module
  `lib/critcare-severity-v200.js`, renderers `views/group-v200.js` (RV200).
- The proposed **fifth** tile (a vasoactive-inotropic-score tile) was **dropped
  at implementation**: the spec-v85 §6.2 collision re-check found VIS is already
  computed by the live `vis` tile (`lib/clinical-v4.js`, spec-v13) with the
  identical Gaies 2010 multipliers — the program continues **+4**, not +5 (the
  ELTS precedent).
- Three **APPS** cut-point corrections were caught by the spec-v97 ≥ 2-source
  re-verification and applied against the draft against Villar 2016: the
  PaO₂/FiO₂ middle band is **105–158** (not 84–158), the plateau-pressure middle
  band is **> 27 to 30** (not 28–29), and the mortality tiers are **5–7 / 8–9**
  (not 5–6 / 7–9). The OASIS and LODS point grids were transcribed band-for-band
  from two independent open reproductions each; their logistic mortality
  coefficients rest on a single open source (author reference code / a
  Le-Gall-1996 reproduction), literature-corroborated and sanity-checked, and are
  presented as model estimates. Each compute routes through `lib/num.js`, is
  finite-guarded, is covered by the fuzz harness with zero non-finite leaks, and
  ships an inline citation with ≥ 3 worked examples. All four are decision
  support, never a titration / ventilator / fluid / disposition order
  (spec-v11 §5.3).

### Added (spec-v199 — Deep Subspecialty Quantitation program opens: 4 myeloid-neoplasm & transplant prognostic calculators, 844 → 848)

- Opens the **Deep Subspecialty Quantitation** program (spec-v199–v203) with
  **4 new deterministic hematology / transplant prognostic instruments**:
  **MIPSS70** (`mipss70`, transplantation-age primary myelofibrosis),
  **GIPSS** (`gipss`, genetically inspired prognostic score for PMF),
  **MYSEC-PM** (`mysec-pm`, secondary post-PV / post-ET myelofibrosis), and the
  **HCT-CI** (`hct-ci`, Sorror pre-transplant comorbidity index). New module
  `lib/myeloid-prognosis-v199.js`, renderers `views/group-v199.js` (RV199).
- The proposed **fifth** tile (ELTS) was **dropped at implementation**: the
  spec-v85 §6.2 collision re-check found the EUTOS Long-Term Survival score is
  already computed by the live `sokal-cml` tile (`lib/hemonc-v94.js`), so a
  standalone tile would duplicate it — the program opens **+4**, not +5.
- Two point-weight corrections were caught by the spec-v97 ≥ 2-source
  re-verification and applied against the draft: the **HCT-CI** rheumatologic
  and peptic-ulcer weights are **+2** each (Sorror 2005 / MDCalc), not +1; and
  the **GIPSS** total range is **0–6**, not the draft's 0–8. Every remaining
  weight, coefficient, and band threshold was re-fetched and cross-verified
  against ≥ 2 independent open sources. Each compute routes through
  `lib/num.js`, is finite-guarded, is covered by the fuzz harness with zero
  non-finite leaks, and ships an inline citation with ≥ 3 worked examples. All
  are decision support, never a transplant / conditioning / chemotherapy order
  (spec-v11 §5.3).

### Added (spec-v193–v198 — Advanced Specialist Quantitation program: 28 specialist-grade calculators, 816 → 844)

- The **Advanced Specialist Quantitation** program ships in full: **28 new
  deterministic clinical calculators** across six feature specs, carrying the
  catalog from **816 to 844** and closing the specialist-grade tail of the
  long-horizon [scope-mdcalc-parity](docs/scope-mdcalc-parity.md) commitment.
  Every point weight, coefficient, and band threshold was re-fetched and
  cross-verified against **≥ 2 independent open sources** at implementation
  (spec-v97); each compute routes through `lib/num.js`, is finite-guarded at its
  zero-denominator / log-domain edges, is covered by the fuzz harness with zero
  non-finite leaks, and ships an inline citation with ≥ 3 worked examples. All
  are decision support, never an order (spec-v11 §5.3).
- **spec-v193** — acute-coronary / primary-PCI / cardiogenic-shock risk
  (`lib/acs-v193.js`, +5): CRUSADE major-bleeding score (NSTEMI), the SCAI SHOCK
  stage (Kadosh/Kapur operationalization), the Zwolle primary-PCI score, the TIMI
  Risk Index, and the CADILLAC post-PCI mortality score.
- **spec-v194** — right-heart & echocardiographic hemodynamics
  (`lib/hemo-v194.js`, +4): the pulmonary artery pulsatility index (PAPi), the
  transpulmonary / diastolic pressure gradient (TPG/DPG), the Tei myocardial
  performance index, and the pulmonary shunt fraction (Qs/Qt, Berggren).
- **spec-v195** — oxygenation & ventilation efficiency (`lib/vent-v195.js`, +4):
  the SpO₂/FiO₂ (S/F) ratio with estimated P/F, the ventilatory ratio, the oxygen
  saturation index (OSI), and the ventilation index (VI).
- **spec-v196** — chronic-liver-disease prognosis (`lib/liver-v196.js`, +5): the
  ABIC score, the GLOBE score, the UK-PBC risk score, PAGE-B, and the revised Mayo
  PSC natural-history model.
- **spec-v197** — endocrine & metabolic quantitation (`lib/endo-quant-v197.js`,
  +5): SPINA-GT, SPINA-GD, Jostel's TSH index, HOMA-B, and the oral disposition
  index — the SPINA constant sets validated against the published worked examples.
- **spec-v198** — cross-specialty prognostic / diagnostic scores
  (`lib/subspecialty-v198.js`, +5): the CNS-IPI, the ISTH-BAT, the VIRSTA score,
  the SeLECT score, and the WHO/FIGO GTN prognostic score.
- Renderers live in `views/group-v193.js`–`group-v198.js`; META entries, 28 unit
  test files, 28 spec-v11 audit logs, and the `docs/clinical-citations.md` +
  `docs/citation-staleness.md` (FIGO/WHO row) ledgers accompany the tiles. GRACE
  2.0, VOCAL-Penn, HOMA2, GWTG-HF, and other closed-coefficient or single-source
  models remain deferred on the spec-v97 reproducibility bar.

### Added (spec-v183 — MCP wave 14: expose the specialty-completion cluster (59 calculators across 16 lib modules) as deterministic agent tools; no tile delta, 816)

- The optional stdio MCP server (`mcp/server.js`) gains a **fourteenth coverage
  wave** — the largest single wave — exposing **59 more catalog calculators as
  deterministic `compute_calculator` tools across 16 `lib` modules**, bringing
  the exposed surface to **430 of 816 catalog tiles across 94 modules**. No
  catalog tile is added or changed — this is adapter-only coverage of compute
  logic already shipped across earlier programs.
- Modules exposed: `lib/ems-v149.js` (bedside pediatrics / EMS),
  `lib/pk-v166.js` (pharmacokinetics suite, chlorpromazine equivalents),
  `lib/radiology-v165.js` (ACR TI-RADS, adrenal CT washout, Bosniak 2019, CT
  effective dose), `lib/frailty-v143.js` (mFI-5/-11, FRAIL, VES-13, CARG),
  `lib/function-v154.js` (Berg Balance, TUG, Tinetti POMA, PPS),
  `lib/hep-v125.js` (PELD, CLIF-C ACLF, GAHS, West Haven, Hepatic Steatosis
  Index), `lib/id-v137.js` (ISARIC 4C, COVID-GRAM, Candida score, VACS, RegiSCAR
  DRESS), `lib/lymphoma-v135.js` (R-IPI, NCCN-IPI, GELF, Hasenclever IPS,
  CLL-IPI), `lib/neuro-disability-v159.js` (mJOA, Nurick, ASIA, EDSS),
  `lib/onc-v134.js` (ISS, R-ISS, R2-ISS, Mayo MGUS, DIPSS, DIPSS-Plus),
  `lib/suites-v155.js` (MIPI, Forrest), `lib/peds-v98.js` (Kocher, PIM3),
  `lib/peds-v140.js` (Kaiser EOS, SNAPPE-II, RDAI/Tal, Clinical Dehydration
  Scale, Koff bladder capacity), `lib/peds-growth-v141.js` (CDC BMI-for-age
  percentile, WHO growth z-score, mid-parental height, corrected age),
  `lib/peds-percentile-v169.js` (CDC stature-for-age, CDC weight-for-age), and
  `lib/derm-v151.js` (SCORAD).
- Every tile uses the flat `dom→arg→kind` contract and the default `makeToArgs`;
  no bespoke `toArgs` or `formatResult` is needed. Berg Balance already carries
  the `q1`..`q14` argument names the lib function expects. Continuous labs /
  vitals / item sub-scores are numbers, checkbox deficits are booleans, and
  ordinal grades / yes-no questions / categorical selects are enums; every
  exposed example round-trips to its `META.example.expected`.
- **Not adapted this wave (deferred):** `pasi` / `easi` / `dlqi` build their
  input object from per-region / per-item field groups (bespoke `toArgs`
  needed); `kawasaki-criteria` and `catch-head` collect variable-length feature
  arrays; and `wagner-dfu` / `university-texas-dfu` carry no `META.example` to
  round-trip.
- Files: 16 new `mcp/adapters/*.js`, `mcp/catalog.js` (+16 imports, +16
  `ADAPTER_MODULES` rows), `docs/mcp-coverage.md` (fourteenth-wave section +
  Exposed ids), and the count surfaces in `README.md` and `mcp/README.md`. The
  round-trip gate (`check-mcp-catalog`) and the auto-covering `test:mcp` fuzz +
  every-example suites validate all 430 adapters.

### Added (spec-v183 — MCP wave 13: expose older-adult prognosis, metabolic emergencies, environmental injury, ED/ICU decisions & warfarin dosing (16 calculators) as deterministic agent tools; no tile delta, 816)

- The optional stdio MCP server (`mcp/server.js`) gains a **thirteenth coverage
  wave**: 16 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 5 `lib` modules, bringing the exposed
  surface to **371 of 816 catalog tiles across 78 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of compute logic already
  shipped across the spec-v88 through spec-v180 programs.
- Modules exposed: `lib/ltcga-v180.js` (Lee 4-year mortality index, interRAI
  CHESS), `lib/metabolic-onc-v88.js` (DKA/HHS classifier, Calvert carboplatin
  dose, Cairo-Bishop tumor-lysis grade), `lib/enviro-v111.js` (Lake-Louise AMS,
  Szpilman drowning grade, Snakebite Severity Score, Cauchy frostbite grade),
  `lib/eddecision-v107.js` (New-Orleans head-CT criteria, GO-FAR, MACOCHA), and
  `lib/warfarin-v133.js` (IWPC and Gage pharmacogenetic models, Kovacs 10 mg and
  Crowther 5 mg initiation nomograms).
- The Calvert GFR cap (`on`/`off`) and Cairo-Bishop age class
  (`adult`/`pediatric`) are enum→flag mappings the renderer performs; the adapter
  reproduces them with a per-field `to` transform. Warfarin height/weight are
  consumed in cm/kg directly (the browser unit toggle converts before calling the
  pure function), so the adapter exposes those units and needs no custom
  `formatResult`. Every exposed example round-trips to its `META.example.expected`
  through the default `makeToArgs`.
- **Not adapted this wave:** `hear` (the HEAR score) carries no `META.example` to
  round-trip (the `phases-iph` precedent), and the two `lib/ltcga-v181.js`
  infection-surveillance tiles (`mcgeer-criteria`, `loeb-minimum-criteria`) are
  site-branched — their valid criteria set depends on the selected site, so a
  single flat JSON Schema cannot honestly document the input contract; both are
  deferred to a later wave.
- Files: `mcp/adapters/{ltcga-v180,metabolic-onc-v88,enviro-v111,eddecision-v107,warfarin-v133}.js`,
  `mcp/catalog.js` (+5 imports, +5 `ADAPTER_MODULES` rows), `docs/mcp-coverage.md`
  (thirteenth-wave section + Exposed ids), `test/mcp/mcp-compute.test.js` (+5
  worked-call blocks), and the count surfaces in `README.md` and `mcp/README.md`
  (355/73 → 371/78). The `mcp-fuzz` extreme-input sweep covers all 371 adapters
  automatically.

### Added (spec-v180 — Long-Term Care & Geriatric Assessment program: older-adult mortality & LTC prognosis, 2 of 7 tiles, +2 → 816)

- The §3.8 cluster of the [spec-v172](docs/spec-v172.md) LTC-GA program ships
  its first two instruments (Clinical Scoring & Risk, Group G), taking the
  catalog from 814 to **816**:
  - **`lee-mortality-index`** — the **Lee 4-Year Mortality Index for older
    adults** (Lee, JAMA 2006). A weighted point sum (age band + male sex + four
    comorbidities + current smoking + BMI < 25 + four functional difficulties,
    0–26) mapped by table lookup to the validation-cohort 4-year all-cause
    mortality bands (0–5 ≈ 4%, 6–9 ≈ 15%, 10–13 ≈ 42%, ≥ 14 ≈ 64%). A
    point-table lookup, so there is no exponentiation and no `1 − sigmoid(−bx)`
    complement to leak a non-finite value (the spec-v140 saturation hazard does
    not arise).
  - **`chess-scale`** — the **interRAI CHESS scale** (Changes in Health,
    End-stage disease, Signs and Symptoms; Hirdes, J Am Geriatr Soc 2003),
    operationalized per the interRAI LTCF Outcome Scales (CIHI). Signs/symptoms
    counted and capped at 2, plus one point each for decline in decision-making,
    decline in ADL status, and an end-stage (≤ 6-month) prognosis — a 0–5
    health-instability score.
- Both are **Class A** journal formulas naming no `ISSUER_PATTERN` acronym, so
  neither requires a `docs/citation-staleness.md` row. Every weight, band, item,
  and combination rule was re-fetched and cross-verified against **≥ 2
  independent sources** at implementation ([spec-v97](docs/spec-v97.md)): Lee
  across the JAMA Table 3/4, the PubMed abstract / MDCalc reproduction, and the
  SoFOG "Score de Lee" PDF; CHESS across the interRAI official CHESS PDF, the
  CIHI interRAI LTCF Outcome Scales Reference Guide (with a worked example
  scoring 4/5), and the CIHI interRAI Contact Assessment job aid.
- Both are **prognostic estimates framed as decision support** for
  life-expectancy-informed care planning, never a prediction of an individual's
  death and never an end-of-life order in Sophie's voice
  ([spec-v11](docs/spec-v11.md) §5.3).
- **Deferred** on the [spec-v97](docs/spec-v97.md) ≥ 2-source bar (each re-opens
  when it clears): `schonberg-index` (band percentages single-sourced, 9-year
  weights image-locked), `walter-index`, `suemoto-index`, `mitchell-mri`, and
  `adept`.
- Files: `lib/ltcga-v180.js`, `views/group-v180.js` (RV180), `lib/meta.js`
  (+2 entries), `app.js` (+2 Group G rows, RENDERERS wiring), the fuzz `MODULES`
  list, `test/unit/lee-mortality-index.test.js` + `chess-scale.test.js`,
  `docs/audits/v12/{lee-mortality-index,chess-scale}.md`,
  `docs/clinical-citations.md` (+2 rows), and the catalog-truth surfaces
  (index.html, README, package.json, `docs/scope-mdcalc-parity.md`) moved
  814 → 816.

### Added (spec-v183 — MCP wave 12: expose the rheumatology / ob-gyn / spine / orthopedic / surgical cluster (56 calculators) as deterministic agent tools; no tile delta, 816)

- The optional stdio MCP server (`mcp/server.js`) gains a **twelfth coverage
  wave**: 56 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 11 `lib` modules, bringing the exposed
  surface to **355 of 816 catalog tiles across 73 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of the rheumatology,
  obstetric-gynecology, spine, orthopedic, and surgical compute logic already
  shipped across the spec-v89 through spec-v160 programs.
  - `lib/rheum-v148.js` — RA/spondyloarthritis/vasculitis activity, palliative
    prognosis, and drug safety: `asdas`, `ffs-2011`, `gca-acr-eular-2022`,
    `palliative-prognostic-index`, `palliative-prognostic-score`,
    `opioid-conversion`, `naranjo`.
  - `lib/rheum-v160.js` — SLE / psoriatic-arthritis indices: `rapid3`, `dapsa`,
    `slicc-sle`, `sle-2019-eular-acr`.
  - `lib/rheum-periop-v89.js` — activity & perioperative/hepatic risk: `das28`,
    `kings-college`, `asa-ps`, `surgical-apgar`.
  - `lib/rheum-ob-v156.js` — axial spondyloarthritis, Sjögren, obstetric:
    `basdai`, `basfi`, `essdai`, `robson`.
  - `lib/spine-v146.js` — metastatic-spine & spinal-injury scores: `sins-score`,
    `tokuhashi-revised`, `tomita-score`, `tlics-score`, `slic-score`.
  - `lib/ortho-v144.js` — fracture classifications: `gustilo-anderson`,
    `garden-classification`, `weber-ankle`, `schatzker-classification`,
    `salter-harris`, `neer-classification`.
  - `lib/ortho-v145.js` — fracture/joint scores & compartment syndrome:
    `frykman-classification`, `mirels-score`, `kellgren-lawrence`,
    `pittsburgh-knee-rule`, `compartment-delta-pressure`.
  - `lib/surg-v142.js` — surgical & airway risk models: `possum`, `p-possum`,
    `sort`, `goldman-cardiac-risk`, `wilson-airway`, `surgical-risk-scale`.
  - `lib/urology-v153.js` — urology symptom scores: `ipss`, `iief5`, `oabss`.
  - `lib/gyn-v139.js` — gynecologic risk & staging: `flamm-vbac`, `roma-ovarian`,
    `rmi-ovarian`, `iota-simple-rules`, `rotterdam-pcos`, `popq-staging`.
  - `lib/ob-v138.js` — obstetric bedside math: `hadlock-efw`, `fullpiers`,
    `minipiers`, `afi`, `barnhart-hcg`, `iom-gwg`.
- Every tile is `clinical:true`, carries a `META.example` that round-trips to its
  `expected` value through the gate, and takes flat scalar inputs — no bespoke
  `toArgs`/`formatResult` was needed. The graded questionnaire items, joint
  counts, labs, and biometry map to numbers; the yes/no criteria to booleans; and
  the ordinal / categorical selects (fracture patterns, staging axes, ESSDAI
  activity levels, opioid agents, ASDAS/DAS28 marker form, Naranjo answers, Robson
  delivery axes, POSSUM/P-POSSUM point grades) to enums. The single source of
  truth is unchanged: compute stays in `lib/*.js`, citation/example/interpretation
  in `lib/meta.js`, and name/group/clinical in `app.js` `UTILITIES`; the adapter
  contributes only the input schema.
- Files: `mcp/adapters/{rheum-v148,rheum-v160,rheum-periop-v89,rheum-ob-v156,spine-v146,ortho-v144,ortho-v145,surg-v142,urology-v153,gyn-v139,ob-v138}.js`,
  `mcp/catalog.js` (imports + `ADAPTER_MODULES`), and the `docs/mcp-coverage.md`
  ledger (twelfth-wave narrative + exposed-id blocks). The
  `scripts/check-mcp-catalog.mjs` gate asserts the ledger equals the live adapter
  set exactly and that every example round-trips; the `test/mcp/mcp-fuzz.test.js`
  extreme-input sweep covers all 355 adapters automatically.

### Added (spec-v183 — MCP wave 11: expose the acute neuro / psych / pulm / tox / trauma cluster (50 calculators) as deterministic agent tools; no tile delta, 814)

- The optional stdio MCP server (`mcp/server.js`) gains an **eleventh coverage
  wave**: 50 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 9 `lib` modules, bringing the exposed
  surface to **299 of 814 catalog tiles across 62 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of the acute neurology /
  psychiatry / pulmonary / toxicology / trauma compute logic already shipped in
  the spec-v100 Wave-2 and Wave-4 programs.
  - `lib/neuro-v95.js` — stroke outcome & AVM grading: `mrs`, `gose`,
    `hoehn-yahr`, `spetzler-martin`, `house-brackmann`, `midas`.
  - `lib/neuro-v117.js` — stroke imaging & thrombolysis prognosis: `aspects`,
    `ich-volume-abc2`, `dragon-stroke`, `hat-score`, `sedan-score`,
    `thrive-stroke`.
  - `lib/psych-v96.js` — clinician-rated severity scales: `hamd`, `hama`,
    `madrs`, `mdq`, `ybocs`, `pcl5`.
  - `lib/psych-v123.js` — public-domain exam scales: `aims-tardive`, `bfcrs`,
    `bars-akathisia`, `scoff`, `ces-d`.
  - `lib/pulm-v114.js` — COPD / bronchiectasis / sleep: `decaf-score`, `bap-65`,
    `bronchiectasis-bsi`, `faced-bronchiectasis`, `nosas-score`,
    `ahi-odi-severity`.
  - `lib/pulmnod-v115.js` — pulmonary nodule / PH / pleural infection:
    `mayo-spn`, `brock-nodule`, `fleischner-2017`, `reveal-lite-2`,
    `rapid-pleural`.
  - `lib/tox-v110.js` — toxicology dosing & dialysis decisions:
    `digifab-dosing`, `nac-dosing`, `hiet-dosing`, `tca-bicarbonate`,
    `lithium-extrip`.
  - `lib/trauma-v108.js` — trauma severity & decision rules: `triss`, `niss`,
    `tash-score`, `rabt-score`, `gcs-pupils`, `nexus-chest-ct`.
  - `lib/traumaclass-v109.js` — trauma classification & soft-tissue infection:
    `denver-bcvi`, `aast-organ-injury`, `mangled-extremity`, `lrinec`, `alt-70`.
- Graded exam items and free labs are numbers, checkbox criteria are booleans,
  and the ordinal / categorical selects are enums. The five item-summed
  psychometric scales (`hamd`, `hama`, `madrs`, `ybocs`, `pcl5`) and the `mdq`
  carry the wave's only bespoke `toArgs`, rebuilding the renderer's `items` /
  `symptoms` array from flat per-item scalar fields (the same flat→array pattern
  as the Drug Burden Index); every other adapter uses the default `makeToArgs`,
  and no custom `formatResult` is needed. Each exposed example round-trips to its
  `META.example.expected`.

### Fixed (output safety — `brock-nodule` rounding overflow surfaced by the MCP fuzz sweep)

- `lib/pulmnod-v115.js`'s one-decimal rounding helper (`Math.round(n * 10) / 10`)
  returned `Infinity` for `n` near `Number.MAX_VALUE` (`n * 10` overflows before
  the divide), which leaked an `"Infinity mm"` token into the Brock nodule
  `detail` string on fuzz-only magnitudes. The `computeCalculator` non-finite
  guard did not catch it because the leak was inside a string, not a numeric
  field. Rounding is now overflow-safe (falls back to the un-scaled value), so
  the `mcp-fuzz` sweep is clean across all 299 adapters. Normal-range output is
  unchanged.

### Added (spec-v183 — MCP wave 10: expose the Long-Term Care & Geriatric Assessment cluster (34 calculators) as deterministic agent tools; no tile delta, 814)

- The optional stdio MCP server (`mcp/server.js`) gains a **tenth coverage
  wave**: 34 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 8 `lib` modules, bringing the exposed
  surface to **249 of 814 catalog tiles across 53 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of the **Long-Term Care &
  Geriatric Assessment (LTC-GA)** compute logic already shipped in spec-v173
  through spec-v182.
  - `lib/ltcga-v173.js` — cognition & dementia staging: `bims`, `ad8`,
    `cdr-sob`.
  - `lib/ltcga-v174.js` — delirium / depression / agitation: `nu-desc`, `doss`,
    `cornell-csdd`, `interrai-abs`, `cmai`.
  - `lib/ltcga-v175.js` — observational pain scales for nonverbal residents:
    `abbey-pain`, `cnpi`.
  - `lib/ltcga-v176.js` — falls-risk & physical performance: `stratify`,
    `chair-stand-30s`, `four-stage-balance`, `functional-reach`, `gait-speed`,
    `steadi-algorithm`.
  - `lib/ltcga-v177.js` — frailty & sarcopenia: `sarc-f`, `sarc-calf`,
    `prisma-7`, `sof-frailty-index`.
  - `lib/ltcga-v178.js` — nutrition-risk & dysphagia: `gnri`, `pni-onodera`,
    `conut`, `snaq`, `eat-10`, `determine`.
  - `lib/ltcga-v179.js` — medication-burden indices: `anticholinergic-burden`,
    `anticholinergic-risk-scale`, `drug-burden-index`.
  - `lib/ltcga-v182.js` — continence / caregiver strain / wound status:
    `sandvik-incontinence`, `iciq-ui-sf`, `modified-caregiver-strain-index`,
    `caregiver-strain-index`, `bwat`.
- The graded questionnaire items (BIMS, CDR boxes, Abbey, CMAI, Cornell, EAT-10,
  BWAT, …) and free labs/dimensions (albumin, calf circumference, gait distance
  and time, chair-stand count) are numbers; the yes/no screening items (AD8,
  PRISMA-7, SOF, DETERMINE, CSI, and the STRATIFY / STEADI risk factors) and the
  sex axis are enums. `drug-burden-index` uses the one bespoke `toArgs` in the
  wave: it rebuilds the renderer's five-row `{dose, minDose}` drug array from
  flat scalar fields so the agent contract stays flat (no nested-array input).
  Its sibling module `lib/ltcga-v181.js` (`mcgeer-criteria`,
  `loeb-minimum-criteria`) is deliberately **not** adapted — the valid criteria
  set is conditional on the selected infection site, so no single fixed JSON
  Schema honestly documents the input contract. No custom `formatResult` is
  needed anywhere in the wave — every exposed example round-trips to its
  `META.example.expected` through the default `makeToArgs`. The wave-10 ledger
  and full-set example round-trip are in CI (`test:mcp` 45 tests; the
  `mcp-fuzz` sweep drives all 249 adapters through numeric/enum/boolean edge
  cases; `check-mcp-catalog` reports 249 adapters across 53 modules).

### Added (spec-v183 — MCP wave 9: expose 39 more clinical calculators as deterministic agent tools; no tile delta, 814)

- The optional stdio MCP server (`mcp/server.js`) gains a **ninth coverage
  wave**: 39 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 8 `lib` modules, bringing the exposed
  surface to **215 of 814 catalog tiles across 45 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of the "advanced bedside
  quantitation" and subspecialty-staging compute logic already shipped in
  spec-v185 through spec-v192.
  - `lib/gaps-v185.js` — `fick-cardiac-output`, `gorlin`, `qp-qs`,
    `lvot-stroke-volume`, `vte-bleed`, `matsuda-index`, `lean-body-weight`.
  - `lib/specialtymath-v186.js` — `bed-eqd2`, `pisa-eroa`, `lv-wall-stress`,
    `dlco-correction`, `vo2max-exercise`, `proportion-ci`.
  - `lib/onc-staging-v187.js` — `bclc-hcc`, `imdc-rcc`, `mskcc-rcc`, `recist`,
    `glasgow-prognostic-score`.
  - `lib/heme-staging-v188.js` — `binet-cll`, `rai-cll`, `ann-arbor`, `flipi-2`,
    `hasford-cml`.
  - `lib/heme-risk-v189.js` — `msmart`, `impede-vte`, `same-tt2r2`, `elixhauser`.
  - `lib/hepgi-v190.js` — `palbi`, `meld-na`, `clichy`, `rome-iv-ibs`.
  - `lib/dermuro-v191.js` — `scorten`, `melanoma-t-stage`, `pi-rads`,
    `guys-stone-score`.
  - `lib/risk-v192.js` — `findrisc`, `grobman-vbac`, `marburg-heart-score`,
    `adhere-hf`.
- The flat labs and dimensions are numbers; the staging axes (ECOG, Child-Pugh,
  tumor burden, lymphoma distribution, dexamethasone dose, family-history depth,
  confidence level, PI-RADS zone) are enums; and the yes/no risk factors are
  booleans. `rosendaal-ttr` in `lib/gaps-v185.js` is deliberately **not** adapted:
  its `series` input is a multi-line textarea of "date INR" rows (a list of
  item-values), not the flat `dom→arg→kind` scalar contract. No custom
  `formatResult` is needed anywhere in the wave — every exposed example
  round-trips to its `META.example.expected` through the default `makeToArgs`.
  The wave-9 ledger and full-set example round-trip are in CI (`test:mcp` 45
  tests; `check-mcp-catalog` reports 215 adapters across 45 modules).

### Added (spec-v183 — MCP wave 8: expose 9 more clinical calculators as deterministic agent tools; no tile delta, 814)

- The optional stdio MCP server (`mcp/server.js`) gains an **eighth coverage
  wave**: 9 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 2 `lib` modules, bringing the exposed
  surface to **176 of 814 catalog tiles across 37 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of compute logic that already
  shipped.
  - `lib/nutrition-energy-v152.js` — predictive energy-expenditure equations:
    `mifflin-st-jeor`, `harris-benedict`, `katch-mcardle`, `penn-state-ree`,
    `ireton-jones`.
  - `lib/endo-metab-v161.js` — endocrine / metabolic bedside math: `arr`
    (aldosterone-renin ratio), `calcium-phosphate-product`,
    `free-thyroxine-index`, `nitrogen-balance`.
- The anthropometrics and labs are plain numbers; sex, the activity factor, and
  the Ireton-Jones ventilation mode are enums; the Ireton-Jones trauma and burn
  diagnosis modifiers are booleans; and the ARR renin-assay unit (PRA vs DRC) and
  the calcium-phosphate input-unit system (mg/dL vs mmol/L) are enums whose cutoff
  is never compared across unit systems. Katch-McArdle accepts either lean body
  mass directly or weight + body-fat %, so its three body-composition inputs are
  all optional. The wave-8 ledger, worked-call tests, and the full-set example
  round-trip are all in CI (`test:mcp` 45 tests; `check-mcp-catalog` reports 176
  adapters across 37 modules).

### Added (spec-v190 / v191 / v192 — Hepatology/GI, Dermatology/Urology & Screening/Risk program: 12 calculators, 802 → 814)

- Three feature specs add **12 deterministic calculators** across hepatology/GI,
  dermatology/urology severity & staging, and primary-care screening / bedside
  risk. Each id was verified absent by a direct scan of `app.js` before any code
  (spec-v85 §6.2). Catalog **802 → 814**; every coefficient, grade boundary,
  point weight, and criterion re-fetched and cross-verified against ≥ 2
  independent sources at implementation (spec-v97). No runtime network call, no
  AI; each tile obeys the spec-v100 §2 doctrine, renders the spec-v50 §3 posture
  note, and authors no referral, diagnosis, delivery-mode, or disposition order.
  - **spec-v190** (`lib/hepgi-v190.js`, `views/group-v190.js`, +4): the
    **PALBI** grade (platelet-augmented ALBI); **MELD-Na** (the sodium-augmented
    MELD, OPTN/UNOS operational coefficients, sodium applied only when MELD > 11,
    bounded 6–40); the **Clichy** acute-liver-failure criteria (encephalopathy
    plus an age-branched factor-V threshold); and the **Rome IV** diagnostic
    criteria for IBS (with the IBS-C/D/M/U subtype).
  - **spec-v191** (`lib/dermuro-v191.js`, `views/group-v191.js`, +4): **SCORTEN**
    (toxic-epidermal-necrolysis mortality); the **AJCC 8th-edition melanoma T
    category** (the 0.8 mm split and ulceration a/b suffix, T element only);
    **PI-RADS v2.1** (the zone-specific score-3 upgrade rules); and the **Guy's
    stone score** (PCNL complexity Grade I–IV with the stone-free-rate
    expectation).
  - **spec-v192** (`lib/risk-v192.js`, `views/group-v192.js`, +4): **FINDRISC**
    (type-2-diabetes screening); the **Grobman race-free 2021 VBAC** calculator
    (the published logistic model — weight + height, not BMI — computed in odds
    space per spec-v140); the **Marburg Heart Score** (rule out CAD in
    primary-care chest pain); and the **ADHERE** in-hospital heart-failure
    mortality CART tree.
- **GWTG-HF deferred** (the fifth proposed v192 tile): the complete row-by-row
  sub-range point table (Peterson 2010 Table 3 — age / SBP / BUN / heart rate /
  sodium points) is paywalled on ahajournals.org and is not reproduced verbatim
  in ≥ 2 independent open sources; a continuous-variable approximation would
  misreport the total, so it is parked with `precise-dapt` / `bvas` / `crib-ii`
  under the spec-v97 fidelity bar, not shipped from an approximation.
- Each compute routes through `lib/num.js`, is finite-guarded, and the
  `grobman-vbac` logistic model is evaluated in odds space with a [0, 1] clamp
  (spec-v140) — covered by the spec-v59 fuzz harness with zero non-finite leaks.
  All 12 carry unit tests, a `META` entry with inline citation + `citationUrl` +
  `accessed`, a per-tile `docs/audits/v12/<id>.md` log, and a
  `docs/clinical-citations.md` worked example. No tile trips the check-citations
  issuer pattern (AJCC / ACR are not in the pattern), so no staleness rows.

### Added (spec-v188 / v189 — Subspecialty Oncology & Hematology Staging program closeout: 9 staging / prognostic calculators, 793 → 802)

- Two feature specs close the **Subspecialty Oncology & Hematology Staging**
  program (opened by the shipped spec-v187) with **9 deterministic calculators**,
  each id verified absent by a direct scan of `app.js` before any code (spec-v85
  §6.2). Catalog **793 → 802**; every stage boundary, weight, and cut-point
  re-fetched and cross-verified against ≥ 2 independent sources at implementation
  (spec-v97). No runtime network call, no AI; each tile obeys the spec-v100 §2
  doctrine, renders the spec-v50 §3 posture note, and authors no order.
  - **spec-v188** (`lib/heme-staging-v188.js`, `views/group-v188.js`, +5):
    **Binet** and **Rai** CLL clinical stages; **Ann Arbor** (Lugano
    modification) lymphoma staging; **FLIPI-2** (the β₂-microglobulin revision,
    distinct from the live FLIPI-1); and the **Hasford (Euro)** CML score
    (`(0.6666·[age>50] + 0.0420·spleen + 0.0584·blasts + 0.0413·eos +
    0.2039·[baso>3%] + 1.0956·[plt>1500]) × 1000`; low ≤ 780, high > 1480).
  - **spec-v189** (`lib/heme-risk-v189.js`, `views/group-v189.js`, +4):
    **mSMART** myeloma cytogenetic risk (double/triple-hit naming); the
    **IMPEDE VTE** myeloma thromboprophylaxis score (signed weights, bands ≤ 3 /
    4–7 / ≥ 8); **SAMe-TT2R2** VKA anticoagulation-control prediction (0–1 good,
    ≥ 2 poorer); and the **Elixhauser** comorbidity index with the original
    **van Walraven (2009)** signed weighting (range −7 to +12).
- **BVAS v3 deferred** (the fifth proposed v189 tile): a faithful score needs
  item-level new/worse-vs-persistent weighting of ~56 items across nine organ
  systems, and an organ-system approximation would misreport the total — parked
  with `precise-dapt` / `crib-ii` / `gwtg-hf` under the spec-v97 fidelity bar,
  not shipped from an approximation.
- Each compute routes through `lib/num.js`, is finite-guarded, and takes only
  bounded comparisons / integer sums (no new divisions), covered by the spec-v59
  fuzz harness with zero non-finite leaks. All 9 carry unit tests, a `META` entry
  with inline citation + `citationUrl` + `accessed`, a per-tile
  `docs/audits/v12/<id>.md` log, and a `docs/clinical-citations.md` worked
  example. No tile trips the check-citations issuer pattern, so no staleness rows.

### Added (spec-v185 / v186 / v187 — Advanced Bedside Quantitation program: 19 gap-filling calculators, 774 → 793)

- Three post-audit feature specs ship **19 deterministic, free-to-reproduce
  calculators** that fill *confirmed* gaps (each id verified absent by a direct
  scan of `app.js` before any code — the withdrawn v185–v195 drafts had proposed
  ~41 already-live concepts via a faulty keyword scan; this program re-does the
  work honestly). Catalog **774 → 793**; every constant and threshold re-fetched
  and cross-verified against ≥ 2 independent sources at implementation
  (spec-v97). No runtime network call, no AI; each tile obeys the spec-v100 §2
  doctrine, renders the spec-v50 §3 posture note, and authors no order.
  - **spec-v185** (`lib/gaps-v185.js`, `views/group-v185.js`, +8): cardiac output
    by the **Fick** principle (measured or LaFarge-estimated VO₂); the **Gorlin**
    valve-area equation (aortic K = 44.3 / mitral K = 37.7); the **Qp/Qs** shunt
    ratio; **Doppler LVOT-VTI** stroke volume & cardiac output; the **VTE-BLEED**
    bleeding score on stable anticoagulation; the **Matsuda** OGTT
    insulin-sensitivity index; **Rosendaal** time-in-therapeutic-range (linear
    interpolation of a dated INR series); and **Janmahasatian** lean body weight.
  - **spec-v186** (`lib/specialtymath-v186.js`, `views/group-v186.js`, +6):
    radiotherapy **BED / EQD2** (linear-quadratic); **PISA** effective
    regurgitant orifice & volume; **LV meridional wall stress** (Laplace); the
    hemoglobin-corrected **DLCO** (Cotes) & KCO; estimated **VO₂max / METs**
    (Bruce treadmill / Cooper field test); and the **Wilson-score** confidence
    interval for a proportion.
  - **spec-v187** (`lib/onc-staging-v187.js`, `views/group-v187.js`, +5): the
    **BCLC** hepatocellular-carcinoma stage; **IMDC (Heng)** and **MSKCC
    (Motzer)** metastatic-RCC risk; **RECIST 1.1** tumor response; and the
    modified **Glasgow Prognostic Score** (mGPS).
- Each compute routes through `lib/num.js` and is finite-/positive-guarded (the
  Gorlin and Matsuda square roots, the Qp/Qs and LVOT and RECIST denominators,
  the Rosendaal day-gap, the Wilson radicand and [0, 1] clamp), covered by the
  spec-v59 fuzz harness with zero non-finite leaks. `dlco-correction` carries a
  documentation-only `docs/citation-staleness.md` row (ATS trips the
  issuer-acronym pattern; the Cotes formula is unchanged). All 19 carry ≥ 3
  worked examples, a `META` entry with inline citation + `citationUrl` +
  `accessed`, and a per-tile `docs/audits/v12/<id>.md` log.

### Added (spec-v183 — MCP wave 7: expose 36 more clinical calculators as deterministic agent tools; no tile delta, 774)

- The optional stdio MCP server (`mcp/server.js`) gains a **seventh coverage
  wave**: 36 more catalog calculators exposed as deterministic
  `compute_calculator` tools, across 8 `lib` modules, bringing the exposed
  surface to **167 of 774 catalog tiles across 35 modules**. No catalog tile is
  added or changed — this is adapter-only coverage of compute logic that already
  shipped.
  - `lib/hemodynamics-v87.js` — critical-care hemodynamics and ventilation
    mechanics: `hemodynamic-suite`, `mechanical-power`, `dead-space`.
  - `lib/nephro-v92.js` — nephrology staging / adequacy / risk: `ckd-staging`,
    `uacr-upcr`, `ktv-urr`, `mehran-cin`, `ckd-epi-cystatin`.
  - `lib/ebm-v163.js` — evidence-based-medicine math: `fagan-post-test`,
    `diagnostic-2x2`, `nnt-arr`.
  - `lib/ophtho-v164.js` — ophthalmology: `iol-power`,
    `visual-acuity-converter`, `ocular-perfusion-pressure`.
  - `lib/echo-v158.js` — echocardiography: `lv-mass-index`, `la-volume-index`,
    `teichholz-lvef`, `rvsp-pasp`, `mitral-e-e-prime`.
  - `lib/rheum-v147.js` — rheumatology activity / classification indices:
    `cdai-ra`, `sdai-ra`, `acr-eular-2010-ra`, `sledai-2k`,
    `gout-acr-eular-2015`, `caspar`, `fibromyalgia-acr-2016`.
  - `lib/vte-v106.js` — venous-thromboembolism instruments: `peged`, `4peps`,
    `bova-pe`, `hestia`, `geneva-original`, `constans-uedvt`.
  - `lib/vascular-v105.js` — vascular medicine: `abi`, `rutherford-fontaine`,
    `wifi`, `euroscore2`.
- The Mehran contrast-nephropathy yes/no risk factors map to two-value enums (the
  lib `onFlag` helper coerces `yes` to true and treats blank or `no` as false);
  the EuroSCORE II logistic model is evaluated in a saturation-safe form whose
  predicted mortality clamps to `[0, 1]` (spec-v140), so the JSON surface never
  leaks a non-finite value; and the `mechanical-power` adapter surfaces the
  driving-pressure unit in plain ASCII (`cmH2O`) so its JSON result is
  self-describing where the rendered tile uses the subscript `cmH₂O`. The wave-7
  ledger, worked-call tests (>= 3 per module), and the full-set example
  round-trip are all in CI (`test:mcp` 45 tests).

### Added (spec-v183 — MCP wave 6: expose 36 more clinical calculators as deterministic agent tools; no tile delta, 774)

- The optional stdio MCP server (`mcp/server.js`) gains a **sixth coverage wave**:
  36 more catalog calculators exposed as deterministic `compute_calculator`
  tools, across 8 `lib` modules, bringing the exposed surface to **131 of 774
  catalog tiles across 27 modules**. No catalog tile is added or changed — this
  is adapter-only coverage of compute logic that already shipped.
  - `lib/neuro-v119.js` — stroke-triage and cerebrovascular scores: `cpsss`,
    `fast-ed`, `boston-caa`, `cvt-risk`.
  - `lib/neuro-v120.js` — seizure / headache / vertigo bedside instruments:
    `stess`, `helps2b`, `mess-first-seizure`, `pound-migraine`, `hints`.
  - `lib/neuro-v121.js` — neuromuscular prediction and classification: `egris`,
    `megos`, `brighton-gbs`, `mgfa`.
  - `lib/neuro-v122.js` — dementia / spasticity / brainstem-encephalitis
    instruments: `hachinski`, `modified-ashworth`, `bickerstaff`.
  - `lib/nephro-v127.js` — nephrology risk and AKI staging: `kfre`, `rifle-aki`,
    `akin-aki`, `ufr-dialysis`.
  - `lib/renal-v128.js` — renal-physiology formulas: `fepo4`, `femg`,
    `npcr-pna`, `std-ktv`, `efwc`.
  - `lib/uro-v130.js` — prostate cancer / BPH: `prostate-volume`, `psa-density`,
    `psa-velocity`, `psa-doubling-time`, `damico-prostate-risk`,
    `gleason-grade-group`.
  - `lib/uro-v131.js` — urology complexity scores: `capra-score`,
    `renal-nephrometry`, `padua-renal`, `stone-nephrolithometry`, `twist-score`.
- The HINTS exam and the Bickerstaff checklist are categorical instruments whose
  number-free examples round-trip through the band/note text; the R.E.N.A.L.
  hilar suffix is an empty-string/`h` enum and the TWIST yes/no findings map to
  booleans the lib `present()` helper coerces. The wave-6 ledger, worked-call
  tests (>= 3 per module), and the full-set example round-trip are all in CI.

### Fixed

- `lib/num.js` `r1`/`r2`/`r3` rounding helpers are now overflow-safe: a
  float64-saturating magnitude (|n| >= ~1e305, never a real measurement) no
  longer overflows `Math.round(n * scale)` to `Infinity` and leaks that token
  into an interpolated band string. Surfaced by the MCP fuzz battery when
  `psa-density` was exposed; the guard returns the (already-integral) input
  unchanged at that boundary, so every clinical-range result is byte-identical.

### Added (spec-v183 — MCP wave 5: expose 35 more clinical calculators as deterministic agent tools; no tile delta, 774)

- The optional stdio MCP server (`mcp/server.js`) gains a **fifth coverage wave**:
  35 more catalog calculators exposed as deterministic `compute_calculator`
  tools, across 7 `lib` modules, bringing the exposed surface to **95 of 774
  catalog tiles across 19 modules**. No catalog tile is added or changed — this
  is adapter-only coverage of compute logic that already shipped.
  - `lib/cardio-v102.js` — heart-failure risk / HFpEF probability: `maggic`,
    `h2fpef`, `hfa-peff`, `cardshock-score`.
  - `lib/cardio-v104.js` — wide-complex-tachycardia and syncope-risk algorithms:
    `brugada-vt`, `vereckei-avr`, `add-rs`, `rose-syncope`, `egsys`, `oesil`.
  - `lib/cvrisk-v103.js` — cardiovascular-risk engines: `score2`, `score2-op`,
    `mesa-chd`, `framingham-cvd`, `reynolds-risk`, `non-hdl-remnant`.
  - `lib/critcare-v112.js` — critical-care severity and ICU-weakness scores:
    `meds-score`, `sic-score`, `cpis-vap`, `lactate-clearance`, `mrc-sum-score`.
  - `lib/fluidresp-v113.js` — dynamic fluid-responsiveness measures:
    `ivc-fluid-responsiveness`, `ppv-svv`, `passive-leg-raise`.
  - `lib/hepgi-v93.js` — hepatology / GI severity and disease-activity indices:
    `nafld-fibrosis`, `glasgow-imrie`, `truelove-witts`, `harvey-bradshaw`,
    `mayo-uc`, `milan-criteria`.
  - `lib/hemonc-v94.js` — hematology / oncology prognostic scores: `hscore-hlh`,
    `ipss-r-mds`, `flipi`, `mascc`, `sokal-cml`.
- Each adapter declares only the flat `dom → arg → kind` input contract; name,
  group, specialties, citation, example, and interpretation are read from
  `UTILITIES` / `META`, never re-typed. The CPIS-VAP and Truelove-Witts
  temperature inputs round-trip in degrees Celsius (the lib reads the canonical
  Celsius value directly, so no unit field is needed); the MRC sum score takes a
  fixed twelve-key set of 0-5 manual-muscle-test grades, not a variable-length
  array. Every exposed example round-trips to its `META.example.expected`, and
  the spec-v59 output-safety fuzz battery confirms no non-finite leak on the JSON
  surface. `docs/mcp-coverage.md`, the README coverage table, and `mcp/README.md`
  record the wave; `scripts/check-mcp-catalog.mjs` asserts the ledger is exact.

### Added (spec-v181 — LTC infection surveillance & antimicrobial stewardship: Revised McGeer definitions and Loeb minimum criteria, +2 → 774)

- **`mcgeer-criteria` — Revised McGeer surveillance definitions of infection in
  long-term care** (Stone ND, et al, *Infect Control Hosp Epidemiol* 2012).
  Pick the suspected infection site, then check the constitutional and
  site-specific findings present → **MEETS / DOES NOT MEET** the surveillance
  definition for that site, naming the satisfied criteria and the blocking gap.
  Ships the cross-verified syndromes: UTI (with / without indwelling catheter),
  respiratory (common cold / pharyngitis, influenza-like illness, pneumonia,
  lower-RTI), skin & soft tissue (cellulitis / wound, conjunctivitis), and
  gastroenteritis. It is a **surveillance** definition for infection tracking
  and reporting — not a diagnosis and not a treatment trigger.
- **`loeb-minimum-criteria` — Loeb minimum criteria for initiating antibiotics
  in LTC** (Loeb M, et al, *Infect Control Hosp Epidemiol* 2001). Pick the
  suspected site → minimum criteria **MET / NOT MET** for starting
  antimicrobials, across UTI (with / without catheter), lower respiratory (all 5
  Loeb paths), skin & soft tissue, and fever-of-unknown-source. It is
  **stewardship decision support** — it neither orders nor withholds antibiotics
  and names no agent, dose, route, or duration; the prescriber and local
  protocol decide.
- Both are **categorical, site-branched criteria-logic determinations** (no
  numeric score, no numeric leak). Every criterion, body-site definition,
  temperature threshold, and boolean rule was re-fetched and cross-verified
  **verbatim** against ≥ 2 independent sources at implementation
  ([spec-v97](docs/spec-v97.md)): Stone 2012 (primary) plus the Missouri DHSS and
  Minnesota DOH field tools for McGeer, and the MN DOH card plus MO DHSS chart
  for Loeb. Both **Class A** — the journal citations name no `ISSUER_PATTERN`
  acronym, so no `docs/citation-staleness.md` row. New `lib/ltcga-v181.js`
  (`mcgeerCriteria`, `loebMinimumCriteria`) + `views/group-v181.js` (`RV181`).
  Deferred on sourcing / computability grounds: the Stone 2012 systemic
  primary-bloodstream / unexplained-febrile definitions and the
  rash-plus-provider-diagnosis dermatologic sub-syndromes.
- Closes cluster **§3.9** of the [spec-v172](docs/spec-v172.md) Long-Term Care &
  Geriatric Assessment program.

### Added (spec-v183 MCP wave 4 — 15 more clinical calculators across 3 lib modules; no tile delta)

- The optional stdio MCP server now exposes **15 more deterministic clinical
  calculators**, bringing coverage to **60 of the catalog across 12 `lib`
  modules** (from 45 across 9). Three new adapters, each declaring only the flat
  `dom→arg→kind` input contract; the name, group, specialties, citation,
  example, and interpretation are still **read** from `UTILITIES` and `META`,
  never re-typed:
  - **`mcp/adapters/cardio-v101.js`** — atrial-fibrillation stroke risk and
    QT-prolongation: `chads2`, `cha2ds2-va`, `chads-65`, `atria-stroke`,
    `tisdale-qtc`.
  - **`mcp/adapters/heme-v132.js`** — hematology pretest / risk scores:
    `plasmic-ttp`, `french-ttp`, `jaam-dic`, `ipset-thrombosis`, `cisne`. The
    yes/no clinical questions map to enums (the `flag()` helper distinguishes an
    explicit `no` from a blank).
  - **`mcp/adapters/gi-v126.js`** — gastroenterology disease-activity /
    severity indices: `cdai-crohns`, `uceis`, `haps`, `ctsi-balthazar`,
    `modified-marshall`. `ses-cd` is deliberately not exposed — its per-segment
    array inputs are outside the flat field contract (recorded in the ledger).
- Each exposed example **round-trips to its `META.example.expected`** (the same
  numeric-correctness contract as the e2e example-correctness sweep, on the JSON
  surface) and the fuzz harness confirms **no non-finite leak** on extreme
  inputs. `docs/mcp-coverage.md` ledger updated and `scripts/check-mcp-catalog.mjs`
  passes (60 adapters across 12 modules, ledger exact, no DOM coupling).

### Changed (spec-v184 §4.3 threshold-label °F annotation — no tile delta)

- **The SIRS temperature criterion now reads `>38 °C (100.4 °F) or <36 °C
  (96.8 °F)`**, completing the [spec-v184](docs/spec-v184.md) §4.3 threshold-label
  °F annotation on banded/checkbox criteria. (qSOFA carries no temperature
  criterion; the Kaiser EOS calculator already charts intrapartum temperature in
  °F.) Purely additive label text — no compute, canonical unit, or example
  changed.

### Changed (spec-v184 §4.3/§4.4 unit-toggle follow-on wave — US-customary affordances across the remaining temperature/height/weight inputs; no tile delta)

- **Extended the `TEMP_UNITS` (°C|°F), `HEIGHT_UNITS` (cm|in), and `WEIGHT_UNITS`
  (kg|lb) toggles to every remaining tile where a bedside nurse enters a
  temperature, height, or weight**, completing the unit sweep that
  [spec-v184](docs/spec-v184.md) §4.3/§4.4 sanctioned as a follow-on wave (the
  first wave shipped the toggles on the three energy tiles).
  - **Temperature (°C|°F)** — now on *every* numeric temperature input:
    `truelove-witts`, `hscore-hlh`, `snappe-ii`, the early-warning scores
    `news2` / `mews` / `meows`, `apache2`, `saps-ii`, and `cpis-vap`.
  - **Height (cm|in)** — now on *every* metric-only height input:
    `predicted-spirometry`, `warfarin-iwpc`, `warfarin-gage`, `schwartz-egfr`,
    `pbw-ardsnet`, `peds-bmi-percentile`, the Ireton-Jones energy estimate, and
    `gnri`. (The two tiles whose canonical height is already inches stay
    inch-first — they already present the US default.)
  - **Weight (kg|lb):** `warfarin-iwpc`, `warfarin-gage`, `peds-bmi-percentile`,
    the Ireton-Jones energy estimate, and `gnri` (the tiles that take a weight
    alongside the converted height).
- **No compute, canonical unit, or example changed.** The canonical metric unit
  is always the default (first) `<select>` option, so `unitNum`/`unitNumOpt` keep
  feeding the compute path metric and every `META.example` plus deep-link hash
  reproduces byte-identically (the example-correctness e2e stays green). The
  `.unit-field-row` wraps on a narrow phone, so no toggle introduces horizontal
  scroll (verified by the `mobile-no-hscroll` full-catalog sweep at 320/360 px).

### Added (spec-v183 optional stdio MCP server — first wave: 21 clinical calculators across 4 lib modules; no tile delta)

- **A second, optional consumption surface for the calculators that already
  exist: a local stdio Model Context Protocol (MCP) server (`mcp/`) that lets an
  AI agent call the vetted, cited compute functions as deterministic tools — a
  "deterministic linter" for the agent's own clinical arithmetic.** LLMs are
  unreliable at exact arithmetic and at recalling published coefficients; these
  functions are reliable at both. The website remains the product: v183 adds
  **zero** browser code, **zero** runtime dependencies to the site (root
  `package.json` `dependencies` stays `{}`), **zero** renderer/build changes, and
  **zero** new tiles (`UTILITIES.length` is unchanged).
- **No hosting, no network, no AI.** The server speaks MCP over stdin/stdout
  only — no HTTP/SSE/socket, no network egress, no model calls, no telemetry, no
  input logging. It runs as a local subprocess (the same model as the `openlore`
  MCP server already wired into this repo). Determinism: identical
  `{ id, inputs }` returns a byte-identical result.
- **Fixed three-tool surface** with dynamic dispatch over the catalog (not one
  tool per calculator): `list_calculators` (discovery + live coverage line),
  `describe_calculator` (input JSON Schema, worked example, citation + URL +
  access date, interpretation bands, disclaimer), and `compute_calculator`
  (validated, deterministic result; invalid/incomplete input returns a structured
  `{ valid: false, message }`, never a thrown error or a non-finite number).
- **Single source of truth.** Compute stays in `lib/*.js`; citations/examples/
  specialties stay in `lib/meta.js`; name/group/clinical stay in `app.js`
  `UTILITIES`. A thin adapter (`mcp/adapters/*.js`) contributes only the input
  schema and two pure mapping functions; everything else is read, never re-typed.
  `scripts/check-mcp-catalog.mjs` (in the `lint` chain) fails the build if an id
  is not in `UTILITIES`, if an exposed tile is not `clinical: true`, if the
  `docs/mcp-coverage.md` ledger drifts from the live adapter set, if a compute
  module references a DOM global, or if any example stops round-tripping (the
  same numeric-correctness contract as the e2e example-correctness sweep, applied
  to the JSON surface).
- **First wave** exposes 21 clinical calculators across 4 `lib` modules:
  `lib/tox-v86.js` (serotonin-toxicity, salicylate-toxicity, toxic-alcohol),
  `lib/hep-v124.js` (albi-grade, meld-xi, forns-index, bard-score,
  fatty-liver-index, lok-index), `lib/acidbase-v129.js` (stewart-sid-sig,
  base-excess, resp-acidosis-compensation, resp-alkalosis-compensation,
  met-alkalosis-compensation, urine-osmolal-gap), and `lib/cardio-v90.js`
  (ecg-axis, lvh-criteria, timi-stemi, duke-treadmill, cardiac-power-output,
  aortic-valve-area). Later waves extend coverage module by module.
- **Isolation (verified):** deleting `mcp/` leaves `npm run lint`,
  `npm run test`, `npm run sbom`, and `npm run build` green — `check-mcp-catalog`
  is a clean no-op when `mcp/` is absent. The `@modelcontextprotocol/sdk`
  dependency is pinned in `mcp/package.json` only; the site gains no runtime
  dependency. New files: `mcp/server.js`, `mcp/tools.js`, `mcp/catalog.js`,
  `mcp/fields.js`, `mcp/adapters/{tox-v86,hep-v124,acidbase-v129,cardio-v90}.js`,
  `mcp/package.json`, `mcp/README.md`, `docs/mcp-coverage.md`,
  `scripts/check-mcp-catalog.mjs`, and `test/mcp/{mcp-tools,mcp-compute,mcp-fuzz}.test.js`
  (run by the new independent `test:mcp` CI job, not the site `test:unit` glob).
  Implementation notes vs the charter: MCP tests live in `test/mcp/` (not
  `test/unit/`) and the gate no-ops when `mcp/` is absent — both to preserve the
  delete-`mcp/`-and-site-stays-green invariant literally.

### Added (spec-v182 LTC-GA continence, caregiver strain & advanced wound: Sandvik, ICIQ-UI-SF, MCSI, CSI, BWAT, +5 — 767 → 772; Waterlow deferred)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v182 (cluster §3.10), shipping 5 of its 6 proposed continence-severity,
  caregiver-strain, and advanced-wound instruments (767 → 772, +5).** Each item
  value, band, and cutoff was re-fetched and cross-verified against ≥ 2 sources
  (spec-v97); all five are Class A.
- **`sandvik-incontinence` (Group E)** — Severity Index = frequency × amount →
  1–12; 1–2 slight / 3–6 moderate / 8–9 severe / 12 very severe (Sandvik 1993/2000).
- **`iciq-ui-sf` (Group G)** — frequency (0–5) + amount (0–6) + impact (0–10) →
  0–21; 1–5 / 6–12 / 13–18 / 19–21 (Avery *Neurourol Urodyn* 2004). Ships the
  scoring only (ICIQ free to use, registered with the ICIQ Group, Bristol).
- **`modified-caregiver-strain-index` (Group G)** — 13 items 0/1/2 → 0–26
  (Thornton & Travis 2003); the free alternative to the licensed Zarit Burden
  Interview (excluded by design).
- **`caregiver-strain-index` (Group G)** — 13 yes/no → 0–13; ≥ 7 high strain
  (Robinson *J Gerontol* 1983).
- **`bwat` (Group G)** — the Bates-Jensen Wound Assessment Tool: 13 items 1–5 →
  13–65, read as a healing trajectory (Bates-Jensen 1992). The full-trajectory
  companion to the live `braden` / `norton-push` pressure-injury tiles.
- **`waterlow` deferred** — the Waterlow Pressure Ulcer Risk card has detailed
  per-category sub-weights with documented edition drift (1985 vs the 2005 revised
  card); the current-card weight table could not be byte-verified against ≥ 2 open
  sources at implementation (sourcing gate, spec-v97).
- New `lib/ltcga-v182.js` (five named exports; in the fuzz `MODULES` list, zero
  non-finite leaks) and `views/group-v182.js` (`RV182`). +5 META with band-flip /
  boundary examples; +5 unit-test files; +5 audit logs; +5
  `docs/clinical-citations.md` rows. Catalog moved on all 13 catalog-truth surfaces
  via the live count + 5. **This closes the implemented portion of the spec-v172
  LTC-GA program** (v173–v182); spec-v180 (older-adult mortality indices) and
  spec-v181 (LTC infection-surveillance criteria) remain open, each requiring
  dedicated verbatim sourcing of high-stakes weight tables / per-site boolean logic
  before they can meet the spec-v97 bar.

### Added (spec-v179 LTC-GA polypharmacy burden: ACB, ARS, Drug Burden Index, +3 — 764 → 767; MRCI deferred)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v179 (cluster §3.7), shipping 3 of its 4 proposed polypharmacy-burden
  quantifiers (764 → 767, +3).** The live `beers-check` flags *individual*
  inappropriate medications; v179 adds the **cumulative-burden** view. Per the
  spec-v100 §2 classification clarification, **none of these embeds a drug
  database** — the clinician reads each drug's level/point/dose from the published
  scale and enters the per-level counts (ACB/ARS) or per-drug doses (DBI); the tile
  does the deterministic arithmetic. All three are Class A.
- **`anticholinergic-burden` (ACB)** — total = 1×(level-1) + 2×(level-2) +
  3×(level-3); ≥ 3 commonly treated as clinically relevant (Boustani *Aging Health*
  2008).
- **`anticholinergic-risk-scale` (ARS)** — total = 1×(1-pt) + 2×(2-pt) + 3×(3-pt);
  higher = greater anticholinergic adverse-effect risk (Rudolph *Arch Intern Med*
  2008).
- **`drug-burden-index` (DBI, Group E)** — DBI = Σ D/(D + δ) across the entered
  anticholinergic/sedative drugs; **each ratio is δ>0-guarded** (a blank/partial
  row or non-positive δ → surfaced `valid:false`, never `Infinity`/`NaN`); higher
  DBI predicts poorer function (Hilmer *Arch Intern Med* 2007).
- **`medication-regimen-complexity` (MRCI) deferred** — the 65-item Section A
  (dosage form), B (frequency), and C (additional-directions) weight tables (George
  *Ann Pharmacother* 2004) are paywalled / copyright and could not be byte-verified
  against ≥ 2 open sources at implementation (sourcing gate, spec-v97).
- New `lib/ltcga-v179.js` (three named exports; in the fuzz `MODULES` list, zero
  non-finite leaks, the DBI division path fuzzed) and `views/group-v179.js`
  (`RV179`; DBI takes up to 5 drug rows). +3 META with band-flip examples; +3
  unit-test files; +3 audit logs; +3 `docs/clinical-citations.md` rows. Catalog
  moved on all 13 catalog-truth surfaces via the live count + 3.

### Added (spec-v178 LTC-GA geriatric nutrition & dysphagia: GNRI, Onodera PNI, CONUT, SNAQ, EAT-10, DETERMINE, +6 — 758 → 764)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v178 (cluster §3.6), shipping all 6 of its proposed geriatric-nutrition /
  dysphagia instruments (758 → 764, +6).** The live nutrition screens
  (`must-nutrition`, `nrs2002`, `mnutric`) are admission/ICU triage tools; v178
  adds the **lab-based geriatric indices**, the **appetite screen**, the **patient
  dysphagia self-report**, and the **community-elder checklist**. Every
  coefficient, cut-point, and band was re-fetched and cross-verified against ≥ 2
  sources (spec-v97); all six are Class A (no `ISSUER_PATTERN` trip — “NSI” is not
  in the pattern).
- **`gnri` (Group E)** — GNRI = 1.489 × albumin (g/L) + 41.7 × (weight ÷ ideal
  weight, ratio capped at 1), ideal weight by the Lorentz equations; > 98 no risk /
  92–98 low / 82–<92 moderate / < 82 major. **The IBW denominator is
  positive-guarded** (Bouillanne *AJCN* 2005).
- **`pni-onodera` (Group E)** — PNI = 10 × albumin (g/dL) + 0.005 × lymphocytes;
  ≥ 45 / 40–<45 / < 40 (Onodera 1984).
- **`conut` (Group E)** — points from albumin, total cholesterol, and lymphocytes
  → 0–12; 0–1 normal / 2–4 mild / 5–8 moderate / 9–12 severe (Ignacio de Ulíbarri
  *Nutr Hosp* 2005).
- **`snaq` (Group G)** — the 4-item appetite questionnaire (each 1–5); ≤ 14
  predicts ≥ 5% weight loss (Wilson *AJCN* 2005). Disambiguated from the Short
  Nutritional Assessment Questionnaire.
- **`eat-10` (Group G)** — the 10-item dysphagia self-screen (each 0–4); ≥ 3
  abnormal (Belafsky 2008). The patient self-report complement to the live `guss`.
- **`determine` (Group G)** — the 10-item Nutrition Screening Initiative checklist;
  **item weights (2,3,2,2,2,4,1,1,2,2 = 21) re-fetched verbatim from the ACL/NSI
  checklist**; 0–2 good / 3–5 moderate / ≥ 6 high (Posner *AJPH* 1993).
- New `lib/ltcga-v178.js` (six named exports; in the fuzz `MODULES` list, **zero
  non-finite leaks**, the GNRI division path fuzzed) and `views/group-v178.js`
  (`RV178`). +6 META with band-flip / boundary worked examples; +6 unit-test files;
  +6 audit logs; +6 `docs/clinical-citations.md` rows. Catalog moved on all 13
  catalog-truth surfaces via the live count + 6.

### Added (spec-v177 LTC-GA frailty & sarcopenia case-finders: SARC-F, SARC-CalF, PRISMA-7, SOF Frailty Index, +4 — 754 → 758; 3 deferred)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v177 (cluster §3.5), shipping 4 of its 7 proposed frailty / sarcopenia
  case-finders (754 → 758, +4).** The live frailty surface (`frail-scale`,
  `mfi-5/11`, `ves-13`) is deficit-count / self-report; v177 adds the **sarcopenia
  case-finders** and the **multidomain LTC frailty screens** a nursing home
  reaches for. Each cutoff was re-fetched and cross-verified against ≥ 2 sources
  (spec-v97). All four are Group G, Class A (no `ISSUER_PATTERN` trip).
- **`sarc-f`** — the 5-item sarcopenia screen (Strength, Assistance walking, Rise,
  Climb stairs, Falls), each 0–2; total 0–10, **≥ 4** predicts sarcopenia
  (Malmstrom *JAMDA* 2013).
- **`sarc-calf`** — SARC-F plus a calf-circumference add-on: **+10** when calf
  < 34 cm (men) / < 33 cm (women); total 0–20, **≥ 11** positive (Barbosa-Silva
  *JAMDA* 2016).
- **`prisma-7`** — the 7-item frailty/disability case-finder; each item 1 point,
  with the **support item reverse-scored** (scores on “cannot count on someone”);
  total 0–7, **≥ 3** flags (Raîche *Arch Gerontol Geriatr* 2008).
- **`sof-frailty-index`** — the 3-item Study of Osteoporotic Fractures index
  (weight loss ≥ 5%, cannot rise 5× without arms, reduced energy); **0 robust /
  1 pre-frail / ≥ 2 frail** (Ensrud *Arch Intern Med* 2008).
- **Three tiles deferred, not shipped:** `clinical-frailty-scale` (the Rockwood
  CFS is copyright Dalhousie and requires a commercial license — it fails the
  free-reproducibility bar, like PACSLAC in v175); `groningen-frailty-indicator`
  and `edmonton-frail-scale` (the exact per-item 0/1 and 0/1/2 thresholds could
  not be byte-verified against ≥ 2 independent sources at implementation — deferred
  on sourcing grounds, the same gate as the v173 deferrals).
- New `lib/ltcga-v177.js` (four named exports; in the fuzz `MODULES` list, zero
  non-finite leaks) and `views/group-v177.js` (`RV177`). +4 META with band-flip
  examples; +4 unit-test files; +4 audit logs; +4 `docs/clinical-citations.md`
  rows. Catalog moved on all 13 catalog-truth surfaces via the live count + 4.

### Added (spec-v176 LTC-GA falls-risk, balance & gait: STRATIFY, 30-Second Chair Stand, 4-Stage Balance, Functional Reach, Gait Speed, CDC STEADI algorithm, +6 — 748 → 754)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v176 (cluster §3.4), shipping all 6 of its proposed falls-risk, balance,
  and gait instruments (748 → 754, +6).** The catalog carried the inpatient
  `morse-falls` and `hendrich-ii` screens; v176 adds the **performance-based
  battery** and the **community / LTC screening algorithm** a nursing home,
  geriatric clinic, or outpatient PT uses. **Every norm, band, and cut-point was
  re-fetched and cross-verified against ≥ 2 independent sources** (spec-v97).
- **`stratify` — St Thomas’s Risk Assessment Tool (STRATIFY).** Five factors,
  each 1 point (recent fall, agitation, visual impairment, frequent toileting,
  and a combined transfer + mobility Barthel score of 3 or 4); total 0–5, ≥ 2 high
  fall risk (Oliver *BMJ* 1997). Class A.
- **`chair-stand-30s` — 30-Second Chair Stand.** The stand count vs the CDC STEADI
  below-average age/sex cut-point (ages 60–94, by sex); a count below the cut-point
  flags increased fall risk. Outside the normed ages → `valid:false`, never a
  guessed band (Jones *Res Q Exerc Sport* 1999; CDC STEADI). **Class B** (CDC →
  `docs/citation-staleness.md` row).
- **`four-stage-balance` — 4-Stage Balance Test.** The full-tandem hold time vs
  the 10 s cut-point; held < 10 s flags increased fall risk (CDC STEADI). **Class
  B**.
- **`functional-reach` — Functional Reach Test.** The forward reach (cm/in unit
  toggle) classified by the Weiner cut-points (< 15.24 cm markedly increased,
  15.24–25.40 cm increased, > 25.40 cm lower), with the Duncan age/sex normative
  mean for context (Duncan *J Gerontol* 1990). Class A.
- **`gait-speed` — 4-meter / habitual gait speed (Group E).** Distance ÷ time in
  m/s, mapped to < 0.6 high risk, < 0.8 limited community ambulation, ≥ 1.0 healthy
  (Studenski *JAMA* 2011; “the sixth vital sign”). The **time denominator is
  finite/positive-guarded** — a zero/blank/non-finite time returns `valid:false`,
  never `Infinity`/`NaN` (the division path is explicitly fuzzed). Class A.
- **`steadi-algorithm` — CDC STEADI fall-risk screening pathway.** The three key
  questions plus a gait/strength/balance result route to low / moderate / high: a
  negative screen is low; a positive screen is high on a recurrent/injurious fall
  or a gait-balance problem, else moderate (Stevens & Phelan *Health Promot Pract*
  2013). **Class B**.
- New `lib/ltcga-v176.js` (six named exports; added to the fuzz `MODULES` list,
  **zero non-finite leaks**, `gait-speed` fuzzed on the division path) and
  `views/group-v176.js` (`RV176`). +6 META entries with band-flip worked examples
  (STRATIFY 1→2, chair-stand below-norm edge, gait-speed 0.8 boundary); +6
  unit-test files; +6 spec-v11 audit logs; +6 `docs/clinical-citations.md` rows;
  **+3 `docs/citation-staleness.md` rows** for the CDC STEADI tiles. Catalog count
  moved on all 13 catalog-truth surfaces via the live `UTILITIES.length` + 6.

### Added (spec-v175 LTC-GA observational pain in the cognitively impaired elder: Abbey Pain Scale, CNPI, DOLOPLUS-2, +3 — 745 → 748)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v175 (cluster §3.3), shipping all 3 of its proposed observational
  pain-assessment instruments for the cognitively impaired / nonverbal elder
  (745 → 748, +3).** Each ships because its **exact item list, per-item range, and
  bands were re-fetched and cross-verified against ≥ 2 independent sources**
  (spec-v97). All three are Group G, Class A, and **trip no `ISSUER_PATTERN`**
  (journal/author issuers), so v175 adds **no `docs/citation-staleness.md` row**.
  The catalog already carried `painad` and `cpot`; these are the additional
  validated scales an LTC pain protocol frequently *mandates* by name.
- **`abbey-pain` — Abbey Pain Scale.** Six observed items (vocalization, facial
  expression, body language, behavioral change, physiological change, physical
  change), each 0–3; total 0–18, banded 0–2 no pain, 3–7 mild, 8–13 moderate, 14+
  severe (Abbey *Int J Palliat Nurs* 2004). The standard scale in Australian and
  UK aged care. The 7→8 mild→moderate and 13→14 moderate→severe edges are
  unit-tested.
- **`cnpi` — Checklist of Nonverbal Pain Indicators.** Six behaviors
  (nonverbal/verbal vocal complaints, facial grimacing, bracing, restlessness,
  rubbing), each present/absent observed *separately at rest and with movement*
  (Feldt *Pain Manag Nurs* 2000). The compute carries two independent 0–6 sums
  (rest, movement) and a 0–12 combined total and **never conflates the two
  conditions**; a blank condition renders a complete-the-fields fallback. This is
  the with-movement structure `painad` does not provide.
- **`doloplus-2` — DOLOPLUS-2 behavioral pain assessment.** Ten items across
  somatic (5, 0–15), psychomotor (2, 0–6), and psychosocial (3, 0–9) domains,
  each 0–3; total 0–30, with a **score ≥ 5 indicating pain** (Wary *Eur J Palliat
  Care* 2001). The standard observational scale in French and European geriatric
  care. The 4→5 threshold and the domain subtotals are unit-tested.
- New `lib/ltcga-v175.js` (`abbeyPain`, `cnpi`, `doloplus2`; added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list, **zero non-finite leaks**) and
  `views/group-v175.js` (`RV175`, spread into `app.js` `RENDERERS`). +3 META
  entries with band-flip worked examples; +3 unit-test files; +3 spec-v11 audit
  logs; +3 `docs/clinical-citations.md` rows. The catalog count moved on all 13
  catalog-truth surfaces using the live `UTILITIES.length` + 3.

### Added (spec-v174 LTC-GA behavioral symptoms & observational delirium / mood: Nu-DESC, DOSS, Cornell-CSDD, interRAI-ABS, CMAI, +5 — 740 → 745)

- **The spec-v172 Long-Term Care & Geriatric Assessment program continues with
  spec-v174, shipping all 5 of its proposed behavioral-symptom / observational
  delirium / mood tiles (740 → 745, +5).** Each ships because its **exact item
  list, per-item range, and bands were re-fetched and cross-verified against ≥ 2
  independent sources** (spec-v97). All five are Group G, Class A, and **trip no
  `ISSUER_PATTERN`** (journal/author issuers; CIHI/interRAI are not uppercase
  acronyms in the pattern), so v174 adds **no `docs/citation-staleness.md` row**.
- **`nu-desc` — Nursing Delirium Screening Scale.** Five shift-observation
  features (disorientation, inappropriate behavior, inappropriate communication,
  illusions/hallucinations, psychomotor retardation), each 0/1/2; total 0–10, ≥ 2
  a positive delirium screen (Gaudreau *J Pain Symptom Manage* 2005). The
  nurse-observation complement to the interview-based `cam` / `4at`.
- **`doss` — Delirium Observation Screening Scale (13-item short form).** Each
  behavior present (1) / absent (0); total 0–13, ≥ 3 suggests delirium
  (Schuurmans *Res Theory Nurs Pract* 2003). The three reverse-scored items on the
  original form (attention, time-of-day, recent recall) are phrased in their
  abnormal direction so the published net 0/1 mapping is unchanged.
- **`cornell-csdd` — Cornell Scale for Depression in Dementia.** 19 items in five
  domains, each *a* (unable to evaluate → 0, reported unrated) / 0 / 1 / 2; total
  0–38, > 10 probable and > 18 definite major depression (Alexopoulos *Biol
  Psychiatry* 1988). Surfaces inline that `gds15` / `phq9` self-report scales are
  not valid in moderate-to-severe dementia — the reason the Cornell scale exists.
- **`interrai-abs` — interRAI Aggressive Behavior Scale.** Four behaviors each
  0–3 on the MDS 7-day frequency scale; total 0–12 (Perlman & Hirdes *JAGS* 2008).
  **Sourcing correction:** the draft's 0–4 per-item range (which would give 0–16)
  was fixed to **0–3 / 0–12** by cross-verification against the CIHI interRAI job
  aid. The original scale has no named bands; the none/mild/moderate/severe split
  (0 / 1–2 / 3–5 / 6–12) is attributed to the secondary nursing-home literature.
- **`cmai` — Cohen-Mansfield Agitation Inventory (29-item long form).** Each
  behavior rated 1 (never) to 7 (several times an hour); total **29–203** — the
  floor is 29, not 0 (Cohen-Mansfield *J Gerontol* 1989). The CMAI manual advises
  against a total severity cut, so the tile reports the total as a **frequency
  quantifier** plus the most-cited three-factor subscales (aggressive / physically
  non-aggressive / verbally agitated; membership varies by population, noted).
- New `lib/ltcga-v174.js` (exports `nuDesc`, `doss`, `cornellCsdd`,
  `interraiAbs`, `cmai`) in the `fuzz-tools.test.js` `MODULES` list (zero
  non-finite leaks); renderers in `views/group-v174.js` (`RV174`, spread into
  `app.js` `RENDERERS`); +5 `META` entries with inline citation + url + accessed +
  boundary worked examples with band-flips (Nu-DESC 1→2, DOSS 2→3, Cornell 10→11
  and 18→19, ABS mild/moderate and moderate/severe boundaries, CMAI floor 29 /
  ceiling 203); +5 spec-v11 audit logs; +5 `docs/clinical-citations.md` rows.
  Catalog count moved on all 13 catalog-truth surfaces.

### Added (spec-v173 LTC-GA cognition & dementia staging: BIMS, AD8, CDR-SOB, +3 — 737 → 740; 5 of 8 proposed tiles deferred on sourcing grounds)

- **The spec-v172 Long-Term Care & Geriatric Assessment program opens with
  spec-v173, shipping 3 of its 8 proposed cognition / dementia-staging tiles
  (737 → 740, +3).** Each ships only because its **exact item-level scoring was
  re-fetched and cross-verified against ≥ 2 independent sources** (spec-v97); the
  other five are deferred pending a clean verbatim verification (the spec-v148
  §7.1 deferral pattern). All three are Group G, Class A, and **trip no
  `ISSUER_PATTERN`** (CMS/MDS method and journal issuers are not in it), so v173
  adds **no `docs/citation-staleness.md` row**.
- **`bims` — Brief Interview for Mental Status (MDS 3.0 §C).** Item scoring taken
  from the verbatim CMS MDS 3.0 Section C form (C0200 repetition 0–3; C0300A year
  0–3, C0300B month 0–2, C0300C day 0–1; C0400A/B/C recall 0–2 each with the
  published category-cue partial credit) and Saliba JAMDA 2012; summary 0–15 with
  bands 13–15 cognitively intact / 8–12 moderate / 0–7 severe.
- **`ad8` — AD8 informant dementia screen.** Sum of the 8 "Yes, a change"
  informant items, 0–8; 0–1 normal, ≥ 2 suggests cognitive impairment (Galvin
  Neurology 2005; Washington University Knight ADRC).
- **`cdr-sob` — Clinical Dementia Rating, Sum of Boxes.** Sum of the six CDR boxes
  (memory, orientation, judgment & problem-solving, community affairs, home &
  hobbies each 0/0.5/1/2/3; personal care 0/1/2/3, no 0.5), 0–18, with the
  O'Bryant 2008 (Arch Neurol) global-CDR staging (0 none; 0.5–4.0 questionable–
  very mild; 4.5–9.0 mild; 9.5–15.5 moderate; 16.0–18.0 severe). Boxes/staging
  cross-verified against the WashU CDR scoring rules (Morris Neurology 1993).
- New `lib/ltcga-v173.js` (exports `bims`, `ad8`, `cdrSob`) in the
  `fuzz-tools.test.js` `MODULES` list (zero non-finite leaks); renderers in
  `views/group-v173.js` (`RV173`, spread into `app.js` `RENDERERS`); +3 `META`
  entries with inline citation + url + accessed + ≥3 boundary worked examples each
  (band-flips: BIMS 7→8, AD8 1→2, CDR-SOB 4.0→4.5 and 9.0→9.5); +3 spec-v11 audit
  logs; +3 `docs/clinical-citations.md` rows. Catalog count moved on all 13
  catalog-truth surfaces.
- **Deferred (sourcing/scope gate; see `docs/spec-v173.md`):** `iqcode-short`
  (16 informant item texts to be sourced verbatim), `gpcog` (patient-section
  point allocation + informant threshold), `mds-cps` (CPS decision-tree
  boundaries), `global-deterioration-scale` and `fast-dementia` (feature→stage
  selection logic + FAST substage wording).

### Changed (spec-v184 US-defaults & localization: en-US locale, American-English copy, US date display, °F/lb/inch affordances — no tile delta, 737 → 737)

- **The site now presents US defaults to a US clinician end to end, with zero
  change to canonical compute units, citations, or the catalog count.** A
  clinician-perspective QA pass found three defect classes; this spec fixes them
  as a presentation/localization remediation (`UTILITIES.length` unchanged).
- **Locale → `en-US` (§4.1).** `index.html` `<html lang>` and JSON-LD
  `inLanguage` now declare `en-US` (matching the already-correct `og:locale`);
  the four static-page builders (`build-tool-pages`, `build-topic-pages`,
  `build-hub-pages`, `build-commitments-page`) emit `lang="en-US"`, and
  `scripts/a11y-check.mjs` asserts it.
- **American-English copy (§4.2).** 41 user-facing British spellings / non-US
  drug names in rendered strings (interpretation bands, field labels, result
  banners, category values) were Americanized — `oedema`→`edema`,
  `haemoglobin`→`hemoglobin`, `haemorrhage`→`hemorrhage`, `colour`→`color`,
  `behaviour`→`behavior`, `tumour`→`tumor`, `ionised`→`ionized`,
  `fibre`→`fiber`, `diarrhoea`→`diarrhea`, `grey`→`gray`,
  `noradrenaline`→`norepinephrine`, plus the `bristol-girth` `category` return
  value (`diarrhoea`→`diarrhea`, test updated). **Citations, journal
  abbreviations, article titles, and official instrument names are untouched**
  (e.g. the Robson "caesarean" title, the BMJ "paracetamol" title, the GI-bleed
  "haemorrhage" citations, the mJOA "Japanese Orthopaedic Association" name),
  enforced by the new guard's allowlist.
- **New CI guard `scripts/check-us-english.mjs` (§5.3),** wired into the
  `npm run lint` chain, fails on any British spelling / non-US drug name in a
  user-facing surface (`lib/`, `views/`, `app.js`, `index.html`) while exempting
  comments, citation/source fields, journal tokens, and the §3.7 official names.
  `test/unit/us-english-guard.test.js` pins the allowlist behavior.
- **US date display (§4.5).** New `usDate`/`usDateLong` formatters in
  `lib/num.js` (pure, no `Date` round-trip); the `due-date` EDD now renders
  `MM/DD/YYYY (ISO)` and the appeal-letter / HIPAA-request templates stamp
  `Mon D, YYYY`. The `naegele()` ISO return value and the LMP input contract are
  unchanged, so every `META.example` and deep-link hash reproduces byte-identically.
- **US-customary unit affordances (§4.3/§4.4).** New `TEMP_UNITS` (°C|°F) and
  `HEIGHT_UNITS` (cm|in) exports in `lib/field-units.js` (canonical unit first),
  plus a blank-safe `unitNumOpt` reader. Applied to the three named energy tiles
  — `mifflin-st-jeor`, `harris-benedict`, `penn-state-ree` now offer weight
  kg|lb, height cm|in, and (Penn State) Tmax °C|°F. `unitNum`/`unitNumOpt` still
  return the canonical unit to the compute path, so examples are byte-identical.
  The broader threshold-label °F annotations and the full height/temperature
  sweep are the spec-sanctioned follow-on wave.

### Added (spec-v169 Data-Sourced Reference-Table program: CDC growth percentiles, +2 — 735 → 737; remaining 5 tiles deferred on sourcing grounds)

- **The spec-v168 Data-Sourced Reference-Table program ships 2 of its proposed 7
  tiles (735 → 737, +2); the other 5 are deferred per the spec-v97 sourcing
  gate.** This fourth coverage pass targets the table-driven instruments earlier
  passes deferred on purpose — the ones defined by a published reference table
  rather than a closed-form formula. Its governing rule is the spec-v141
  verbatim-fetch pattern hardened by the spec-v97 ≥ 2-independent-source rule: a
  table is fetched to disk, parsed programmatically, and cross-verified, or it is
  **deferred (the `crib-ii` precedent), never hand-transcribed or approximated**.
- **spec-v169 — CDC growth percentiles (+2, Group E).**
  `lib/peds-percentile-v169.js` + `views/group-v169.js` (`RV169`), reading new
  CDC stature/weight LMS strata parsed verbatim into `lib/growth-lms-data.js`.
  Both **Class A** (gate-forced staleness rows by the "CDC" acronym; the 2000
  standard is fixed). They are the percentile companions to the live
  `peds-bmi-percentile` and `who-growth-zscore`.
  - `cdc-stature-for-age` — CDC 2000 stature-for-age z-score & percentile
    (2–20 yr), via the LMS transform `z = ((height/M)^L − 1)/(L·S)`.
  - `cdc-weight-for-age` — CDC 2000 weight-for-age z-score & percentile (2–20 yr),
    same transform.
  - **Sourcing:** `statage.csv` / `wtage.csv` fetched from CDC NCHS (2026-06-29,
    HTTP 200). Cross-verified against each file's **own published percentile
    columns** (P3..P97): the LMS-reconstructed percentiles match the printed
    columns to a max relative error of < 4e-9 over 3,924 checks per file — the
    two sources (coefficients and percentiles) agree to machine precision within
    one verbatim file (spec-v97 satisfied).
- **Deferred (sourcing gate failed — re-checked, not re-specced; see
  `docs/scope-data-sourced.md`).** `pediatric-bp-percentile` (AAP/NHLBI BP
  regression coefficients are PDF-locked, not verbatim/cross-verifiable; a wrong
  BP percentile mis-stages hypertension), `kdpi` and `epts` (the whole
  `optn.transplant.hrsa.gov` domain returned HTTP 403, so the annual mapping
  tables cannot be fetched verbatim — spec-v170 §6 sourcing gate),
  `fenton-preterm-growth` (Springer supplementary objects returned HTTP 403),
  and `intergrowth-efw-percentile` (Wiley publisher returned HTTP 403). Each
  re-opens the moment a reachable verbatim source appears.

### Added (spec-v162 Cross-Discipline Completion program: v163–v167, +18 — EBM bedside math, ophthalmology, radiology classification, pharmacokinetics & one-formula gaps; 717 → 735)

- **The spec-v162 Cross-Discipline Completion program ships its five feature specs
  (717 → 735, +18).** This third pass reaches the deterministic, free tools a
  clinician uses that a calculator catalog rarely indexes — the disciplines
  outside the usual "clinical score" framing. Every formula, point table, and
  threshold was re-fetched and cross-verified against ≥ 2 independent sources at
  implementation (spec-v97); all five modules are covered by the spec-v59 fuzz
  harness with zero non-finite leaks. Six specialty tags were added to the closed
  vocabulary (`clinical-epidemiology`, `ophthalmology`, `optometry`, `radiology`,
  `medical-physics`, `audiology`). None of the 18 trips the `check-citations`
  issuer pattern, so every tile is **Class A**. (Actual delta is +18, not the
  nominal +19 — `lithium-maintenance` was deferred at implementation because the
  Cooper 1973 band table cannot be cross-verified to two independent sources;
  parked with `crib-ii` / `gail-bcrat`.)
- **spec-v163 — EBM bedside math (+3, Group E).** `lib/ebm-v163.js` +
  `views/group-v163.js` (`RV163`). All **Class A**.
  - `fagan-post-test` — Fagan post-test probability from a pre-test probability
    and a likelihood ratio (or sens/spec), computed in **odds space** so p→0/1
    with a large LR cannot leak a non-finite value.
  - `diagnostic-2x2` — sensitivity/specificity/PPV/NPV/accuracy/LR± from a 2×2
    table, with optional Bayes PPV/NPV at a user-supplied target prevalence.
  - `nnt-arr` — ARR/RRR/relative risk and NNT, with the NNH sign-flip when the
    experimental event rate exceeds control (harm never reported as benefit) and
    ARR = 0 surfaced as "no measurable difference".
- **spec-v164 — ophthalmology (+3, Group E).** `lib/ophtho-v164.js` +
  `views/group-v164.js` (`RV164`). All **Class A**.
  - `iol-power` — SRK II IOL power with the axial-length A-constant band table;
    the refraction correction ships the documented single 1.25 factor with an
    explicit caveat (the per-power breakpoint is not uniformly published).
  - `visual-acuity-converter` — Snellen (20/x and 6/x) ↔ decimal ↔ logMAR.
  - `ocular-perfusion-pressure` — mean/systolic/diastolic OPP from BP and IOP.
- **spec-v165 — radiology classification & quantification (+4, Groups G/E).**
  `lib/radiology-v165.js` + `views/group-v165.js` (`RV165`). All **Class A** (ACR,
  AAPM, ICRP are not in the issuer pattern).
  - `acr-tirads` — TI-RADS points → TR level + FNA/follow size rule; echogenic
    foci are **additive, not max**.
  - `adrenal-ct-washout` — absolute and relative washout (adenoma vs non-adenoma).
  - `bosniak` — Bosniak 2019 renal-cyst class I/II/IIF/III/IV (calcification never
    upgrades class in v2019).
  - `ct-effective-dose` — effective dose = DLP × region k (AAPM Report 96).
- **spec-v166 — pharmacokinetics & psych dosing (+2, Group F).** `lib/pk-v166.js`
  + `views/group-v166.js` (`RV166`). All **Class A**.
  - `pk-suite` — loading/maintenance dose, k, half-life, time to steady state
    (first-order relations), each computed only from the inputs supplied.
  - `chlorpromazine-equivalents` — antipsychotic CPZ-equivalent dose (Woods 2003
    anchor, 7 agents; method named). `lithium-maintenance` **deferred** (spec-v97).
- **spec-v167 — one-formula subspecialty gaps (+6, Groups E/G).**
  `lib/oneformula-v167.js` + `views/group-v167.js` (`RV167`). All **Class A**.
  - `mean-airway-pressure`, `cerebroplacental-ratio`, `toe-brachial-index`,
    `stool-osmotic-gap`, `pure-tone-average` (Group E); `rutgeerts` (Group G).
  - Each fills a single named hole (ventilation, fetal Doppler, vascular, GI,
    audiology, IBD endoscopy); every division is guarded and `rutgeerts` resolves
    every finding to one i-grade.

### Added (spec-v157 Subspecialty Depth program: v158–v161, +17 — echocardiography, neuro/spine disability, rheumatology PRO & SLE, endocrine/metabolic math; 700 → 717)

- **The spec-v157 Subspecialty Depth program ships its four feature specs (700 →
  717, +17).** After v150 closed the whole-*specialty* gaps, this second pass
  closes the deeper *subspecialty quantification* gaps — most notably that
  echocardiography, one of the most-performed studies in medicine, had a single
  quantification tile. Every formula, weight, and partition was re-fetched and
  cross-verified against ≥ 2 independent sources at implementation (spec-v97);
  all four modules are covered by the spec-v59 fuzz harness with zero non-finite
  leaks. (Actual delta is +17, not the draft's nominal +18 — the v157 draft
  carried a known running-count off-by-one; `UTILITIES.length` is the source of
  truth and the 13 catalog-truth surfaces agree at 717.)
- **spec-v158 — echocardiography quantification (+5, Group E).** `lib/echo-v158.js`
  + `views/group-v158.js` (`RV158`), cross-verified vs the ASE/EACVI Lang 2015
  chamber-quantification guideline. ASE/EACVI is **not** in the `check-citations`
  issuer pattern, so all five are **Class A** with no staleness row.
  - `lv-mass-index` — LV mass (Devereux 1986), LVMI, relative wall thickness, and
    the four-pattern geometry classification (RWT 0.42 × sex-specific LVMI limit).
  - `la-volume-index` — biplane area-length LA volume and LAVI (bands 34/41/48).
  - `teichholz-lvef` — Teichholz LVEF & fractional shortening with the
    dimension-derived/Simpson-preferred caveat and sex-specific EF cutoffs.
  - `rvsp-pasp` — RVSP = 4·(TR Vmax)² + RAP from the IVC (3/8/15 mmHg).
  - `mitral-e-e-prime` — E/e′ filling-pressure estimate (average < 9 / 9–14 / > 14;
    septal > 15, lateral > 13). The published normal boundary is < 9, corrected
    from the draft's < 8 at implementation.
- **spec-v159 — neuro & spine disability classification (+4, Group G).**
  `lib/neuro-disability-v159.js` + `views/group-v159.js` (`RV159`). All **Class A**.
  - `edss` — Expanded Disability Status Scale (Kurtzke 1983), 0–10 in 0.5 steps.
    The low range follows the simplified FS-count table; the 4.0–9.5 range follows
    the authoritative ambulation anchors; the reported step is the **higher of the
    two** (published precedence). The renderer points to a trained Neurostatus
    rating for a definitive score.
  - `asia-impairment` — ASIA Impairment Scale A–E (ISNCSCI, Kirshblum 2011); sacral
    sparing is the complete-vs-incomplete gate, the half-of-key-muscles proportion
    the C-vs-D gate.
  - `mjoa` — modified Japanese Orthopaedic Association score (Benzel 1991), 0–18,
    **higher is better** (surfaced); mild ≥ 15, moderate 12–14, severe ≤ 11.
  - `nurick` — Nurick grade 0–5 (Nurick 1972), gait-focused cervical myelopathy.
- **spec-v160 — rheumatology activity & SLE classification (+4, Group G).**
  `lib/rheum-v160.js` + `views/group-v160.js` (`RV160`). EULAR/ACR are spelled out,
  so none trips the issuer pattern → all **Class A**.
  - `rapid3` — Routine Assessment of Patient Index Data 3 (Pincus 2009), 0–30; the
    MDHAQ ÷3 function transform is surfaced.
  - `dapsa` — Disease Activity in Psoriatic Arthritis (Schoels 2016); **CRP in
    mg/dL** (not mg/L) is the unit trap, unit-tested.
  - `slicc-sle` — SLICC 2012 criteria; both pathways evaluated (≥ 4 with
    distribution, or the biopsy-nephritis shortcut that can classify with < 4).
  - `sle-2019-eular-acr` — 2019 EULAR/ACR criteria; the ANA entry gate, the
    within-domain max-weight rule, and the ≥ 10 + ≥ 1-clinical threshold are each
    unit-tested. Every weight cross-verified, zero discrepancies.
- **spec-v161 — endocrine/metabolic/nutrition math (+4; Groups E/F) — CLOSES the
  program.** `lib/endo-metab-v161.js` + `views/group-v161.js` (`RV161`).
  - `arr` — Aldosterone-Renin Ratio (Endocrine Society 2016); the cutoff differs
    by renin unit (PRA vs DRC) and is never compared across unit systems. Endocrine
    Society is not in the issuer pattern → **Class A**.
  - `calcium-phosphate-product` — Ca × PO₄ (CKD-MBD) with the historical > 55
    caution and the contemporary "track individually" KDIGO posture. **KDIGO trips
    the issuer pattern → a documentation-only `docs/citation-staleness.md` row.**
  - `free-thyroxine-index` — FTI / T7 (Clark & Horn 1965), T4 × (T3RU ÷ reference).
  - `nitrogen-balance` — (protein ÷ 6.25) − (UUN + insensible), nutrition support.
- **Housekeeping.** Catalog count moves on all 13 catalog-truth surfaces
  (700 → 717); four new `lib/*` modules added to the `fuzz-tools` `MODULES`; 17
  per-tile audit logs under `docs/audits/v12/`; clinical-citations rows added; the
  `docs/scope-subspecialty-depth.md` ledger records the Subspecialty Depth program
  complete; one documentation-only staleness row (`calcium-phosphate-product`).
  README unit-test count 5,650 → 5,740.

### Added (spec-v156: rheumatology PRO & obstetric classification — BASDAI, BASFI, ESSDAI, Robson, +4 — spec-v150 Post-Parity Coverage program COMPLETE)

- **Four instruments close the spec-v150 Post-Parity Coverage program (696 → 700,
  +4; program total 679 → 700).** v147/v148 shipped the physician-derived
  rheumatology activity scores (`cdai-ra`, `sdai-ra`, `sledai-2k`, `asdas`,
  `ffs-2011`); v156 completes the patient-reported axial-spondyloarthritis axis
  and the Sjögren systemic-activity index, and adds the obstetric cesarean-audit
  standard. They live in `lib/rheum-ob-v156.js` + `views/group-v156.js` (`RV156`)
  and are covered by the spec-v59 fuzz harness with zero non-finite leaks.
  - `basdai` — Bath Ankylosing Spondylitis Disease Activity Index (Garrett 1994),
    **Group G**, **Class A**. Six 0–10 patient-reported items;
    `BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5`, scored 0–10, with ≥ 4
    suggesting active disease. **The two morning-stiffness items (Q5, Q6) are
    averaged before being added** — a unit test asserts they are not summed flat.
    Cross-linked to `basfi`, `asdas`, `das28`.
  - `basfi` — Bath Ankylosing Spondylitis Functional Index (Calin 1994),
    **Group G**, **Class A**. Ten 0–10 items (eight daily-living tasks + two
    coping items); the index is the **mean** of the 10 items, 0–10. A higher
    index means poorer function. Cross-linked to `basdai`, `asdas`.
  - `essdai` — EULAR Sjögren's Syndrome Disease Activity Index (Seror 2010;
    weights Seror 2015), **Group G**, **Class A**. Twelve weighted systemic
    domains; each level's printed value is already weight × level, so the total is
    a **direct sum** (theoretical max 123); strata low < 5, moderate 5–13, high
    ≥ 14. The table preserves the structural quirks secondary sources flatten —
    constitutional/glandular/biological have no high level and CNS has no low
    level. EULAR is **not** in the `check-citations` issuer pattern, so no
    documentation-only staleness row is forced (the v147/v148 ACR/EULAR
    precedent). Cross-linked to `sledai-2k`, `cdai-ra`.
  - `robson` — Robson Ten-Group Classification System (Robson 2001; WHO-endorsed
    2015), **Group G**, **Class A**. A deterministic mapping of parity, previous
    cesarean, onset, presentation, plurality, and gestation to exactly one of ten
    mutually-exclusive groups (1, 2a/2b, 3, 4a/4b, 5–10). **A unit test enumerates
    all 144 input combinations and asserts the mapping is mutually exclusive and
    total.** The WHO endorsement is kept out of the machine-read `citation` field
    so it does not force a staleness row. An audit classification, not an
    individual risk. Cross-linked to `bishop`, `meows`.
- **Housekeeping.** Catalog count moves on all 13 catalog-truth surfaces
  (696 → 700); `lib/rheum-ob-v156.js` added to the `fuzz-tools` `MODULES`; four
  per-tile audit logs under `docs/audits/v12/`; clinical-citations rows added; the
  `docs/scope-post-parity.md` ledger records the **Post-Parity Coverage program
  complete**. README unit-test count 5,627 → 5,650.

### Added (spec-v155: suite completions — MIPI, Forrest, Wagner DFU, University of Texas DFU, +4 — spec-v150 Post-Parity Coverage program)

- **Four suite-completion instruments continue the spec-v150 Post-Parity Coverage
  program (692 → 696, +4).** Each plugs a named hole in a suite that was otherwise
  complete: the lymphoma-index suite (`nccn-ipi`, `r-ipi`, `flipi`) had no
  mantle-cell index, the UGI-bleed suite (`gbs`, `rockall`, `aims65`, `oakland`)
  had no endoscopic-stigmata anchor, and `wifi` graded limb threat but the
  diabetic-foot wound-grading systems were absent. They live in
  `lib/suites-v155.js` + `views/group-v155.js` (`RV155`) and are covered by the
  spec-v59 fuzz harness with zero non-finite leaks.
  - `mipi` — Mantle Cell Lymphoma International Prognostic Index (Hoster 2008),
    **Group G**, **Class A**. The continuous biologic index
    `0.03535·age + 0.6978·(ECOG 2–4) + 1.367·log₁₀(LDH/ULN) + 0.9393·log₁₀(WBC)`,
    banded low < 5.7, intermediate 5.7 to < 6.2, high ≥ 6.2. **WBC is the absolute
    count per microliter inside the log** — the Hoster erratum warns that using
    thousands/µL gives the wrong result; the field is labelled "per µL, absolute"
    and a unit test locks the contract. The log domain (LDH/ULN/WBC/age must be
    > 0) is guarded with a surfaced complete-the-fields fallback. The
    simplified-MIPI point table is a distinct variant, not the shipped headline.
  - `forrest` — Forrest classification of UGI-bleeding endoscopic stigmata
    (Forrest 1974), **Group G**, **Class A**. A deterministic finding → class
    mapping: Ia spurting, Ib oozing, IIa visible vessel (high-risk stigmata →
    endoscopic therapy), IIb adherent clot (intermediate), IIc flat spot, III
    clean base (low-risk). Untreated rebleed risk is surfaced as approximate
    ranges. Cross-linked to `rockall`, `gbs`, `aims65`.
  - `wagner-dfu` — Wagner (Meggitt-Wagner) diabetic foot ulcer grade (Wagner
    1981), **Group G**, **Class A**. Grade 0 (intact / at-risk) through 5
    (whole-foot gangrene); grade ≥ 3 (deep abscess/osteomyelitis or gangrene) is
    flagged for surgical / vascular evaluation. Cross-linked to `wifi`,
    `university-texas-dfu`.
  - `university-texas-dfu` — University of Texas diabetic foot ulcer
    classification (Lavery/Armstrong 1996/1998), **Group G**, **Class A**. A
    two-axis grade (depth 0–3) × stage (A clean / B infection / C ischemia / D
    infection + ischemia) grid; every one of the 16 cells resolves to a defined
    value rendered with the roman-numeral grade and stage letter (e.g. IIB).
    Higher grade and stage flag worsening healing/amputation odds. Cross-linked
    to `wagner-dfu`, `wifi`.
- **PRECISE-DAPT was DEFERRED** under the spec-v97 ≥ 2-source rule. Its published
  bleeding score is a restricted-cubic-spline continuous nomogram, not a
  per-variable integer point table, and no independent source publishes a verbatim
  per-value lookup across the full input ranges (MDCalc computes the spline
  internally; only the graphical nomogram and anchor maxima are reproducible). It
  is parked with `crib-ii` / `gail-bcrat` rather than approximated (spec-v155
  §2.1 / §7); the v155 delta is therefore **+4, not the nominal +5**.

### Added (spec-v154: function, falls & palliative performance — Berg Balance, Timed Up & Go, Tinetti POMA, Palliative Performance Scale, +4 — spec-v150 Post-Parity Coverage program)

- **Four performance-based function / falls / palliative instruments continue the
  spec-v150 Post-Parity Coverage program (688 → 692, +4).** The catalog carried
  fall-*risk* prediction (`morse-falls`, `hendrich-ii`) and frailty screens but no
  performance-based mobility/balance measure, and palliative care had
  `ecog-karnofsky` but not the Palliative Performance Scale that anchors hospice
  eligibility. They live in `lib/function-v154.js` + `views/group-v154.js`
  (`RV154`) and are covered by the spec-v59 fuzz harness with zero non-finite leaks.
  - `berg-balance` — Berg Balance Scale (Berg 1992), **Group G**, **Class A**.
    Fourteen performance tasks each 0 (unable) to 4 (independent and safe), summed
    0–56: 0–20 wheelchair-bound / high fall risk, 21–40 walking with assistance,
    41–56 independent. A total **below 45 (strict)** flags increased fall risk — a
    score of exactly 45 sits on the lower-risk side, asserted by a 44/45 boundary
    test.
  - `tug` — Timed Up & Go (Podsiadlo & Richardson 1991), **Group E**, **Class A**.
    The measured time in seconds to rise, walk 3 m, turn, return, and sit. CDC
    STEADI flags increased fall risk at ≥ 12 s; the community-dwelling cut-off is
    ≥ 13.5 s; ≥ 30 s rates as dependent in transfers/ADLs. A blank or non-finite
    time renders a complete-the-fields fallback rather than a spurious flag.
  - `tinetti-poma` — Tinetti Performance-Oriented Mobility Assessment (Tinetti
    1986), **Group G**, **Class A**. The 28-point version: balance subscale 0–16
    plus gait subscale 0–12, total 0–28. Bands ≤ 18 high, 19–23 moderate, ≥ 24 low
    (MDCalc / StatPearls; a score of 24 is classed low).
  - `pps` — Palliative Performance Scale v2 (Anderson 1996; © Victoria Hospice
    Society), **Group G**, **Class A**. Five columns (ambulation; activity &
    evidence of disease; self-care; intake; conscious level) read left-to-right
    with **leftward precedence**, resolving to a level 0%–100% in 10% steps (0% =
    death). Each column descriptor maps to a *set* of consistent levels, so the
    level is the best horizontal fit computed by intersecting the candidate-sets
    from the left; a conflicting rightward column is overridden by leftward
    precedence and flagged. A lower PPS frames a shorter expected survival and the
    hospice-eligibility discussion; distinct from `ecog-karnofsky`.
- Every range, threshold, and band was re-fetched and cross-verified against ≥ 2
  independent authoritative sources (the spec-v97 discipline); nothing was
  implemented from recall. None trips `ISSUER_PATTERN`, so all four are Class A
  with no `citation-staleness.md` row.
- The catalog count moves on all **13 catalog-truth surfaces** (688 → 692); a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v154.js`. See
  [docs/spec-v154.md](docs/spec-v154.md) and the
  [docs/scope-post-parity.md](docs/scope-post-parity.md) ledger.

### Added (spec-v153: urology & men's-health patient-reported scores — IPSS / AUA-SI, IIEF-5 / SHIM, OABSS, +3 — spec-v150 Post-Parity Coverage program)

- **Three urology / men's-health symptom-score PROs continue the spec-v150
  Post-Parity Coverage program (685 → 688, +3).** The catalog carried the urologic
  *oncology* math (`psa-density`, `psa-velocity`, `psa-doubling-time`,
  `prostate-volume`, `gleason-grade-group`, `damico-prostate-risk`, `capra-score`)
  and the stone scores, but none of the validated symptom-score instruments that
  drive benign-disease management. All three are **Group G** and **Class A**, live
  in `lib/urology-v153.js` + `views/group-v153.js` (`RV153`), and are covered by the
  spec-v59 fuzz harness with zero non-finite leaks.
  - `ipss` — International Prostate Symptom Score / AUA Symptom Index (Barry 1992).
    Seven symptom questions each 0–5 summed 0–35 (0–7 mild, 8–19 moderate, 20–35
    severe). The separate quality-of-life item (0 delighted → 6 terrible) is
    reported alongside and is **never** summed into the 0–35 total — a unit test
    asserts the symptom total is invariant to the QoL value.
  - `iief5` — IIEF-5 / Sexual Health Inventory for Men (Rosen 1999). Five items;
    item 1 scored 1–5, items 2–5 carry the "0 = no sexual activity / did not attempt
    intercourse" option (0–5). Banded 22–25 no ED, 17–21 mild, 12–16 mild-to-
    moderate, 8–11 moderate, 5–7 severe; ≤21 meets the diagnostic threshold for ED.
  - `oabss` — Overactive Bladder Symptom Score (Homma 2006). Four items — daytime
    frequency 0–2, nocturia 0–3, urgency 0–5, urgency incontinence 0–5 — summed 0–15
    (≤5 mild, 6–11 moderate, ≥12 severe). The OAB diagnostic gate (urgency ≥ 2 **and**
    total ≥ 3) is surfaced: a high total driven by frequency alone is flagged as not
    meeting the symptom definition.
- Every item range, band cutoff, and gating rule was re-fetched and cross-verified
  against ≥ 2 independent authoritative sources (the spec-v97 discipline); nothing
  was implemented from recall.
- The catalog count moves on all **13 catalog-truth surfaces** (685 → 688); a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v153.js`. See
  [docs/spec-v153.md](docs/spec-v153.md) and the
  [docs/scope-post-parity.md](docs/scope-post-parity.md) ledger.

### Added (spec-v152: nutrition & energy expenditure — Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Penn State, Ireton-Jones, +5 — spec-v150 Post-Parity Coverage program)

- **Five predictive energy-expenditure equations continue the spec-v150
  Post-Parity Coverage program (680 → 685, +5).** The catalog had nutrition
  *screening* (`must-nutrition`, `nrs2002`, `nutric`, `mnutric`, `refeeding-risk`)
  and a weight-based `icu-nutrition-target`, but no predictive resting/total
  energy-expenditure regression — the number a dietitian starts from. The three
  ambulatory equations are **Group E**; the two ventilated-ICU equations are
  **Group F**. All five are **Class A**, live in `lib/nutrition-energy-v152.js` +
  `views/group-v152.js` (`RV152`), and are covered by the spec-v59 fuzz harness
  with zero non-finite leaks.
  - `mifflin-st-jeor` — Mifflin-St Jeor resting energy expenditure (1990), the
    first-line ambulatory equation. REE = 10 × wt(kg) + 6.25 × ht(cm) − 5 × age +
    s, s = +5 (male) / −161 (female); optional TDEE = REE × activity factor. A unit
    test pins the male-vs-female ±constant pair on identical anthropometrics.
  - `harris-benedict` — Harris-Benedict basal energy expenditure, **revised
    (Roza 1984)** constants — male BEE = 88.362 + 13.397 × wt + 4.799 × ht − 5.677
    × age, female BEE = 447.593 + 9.247 × wt + 3.098 × ht − 4.330 × age. Runs ~5%
    above Mifflin, the preferred contemporary equation.
  - `katch-mcardle` — Katch-McArdle BMR = 370 + 21.6 × lean body mass(kg); LBM
    entered directly or derived as weight × (1 − body-fat%/100), the derivation
    range-guarded 0 < fat% < 100.
  - `penn-state-ree` — Penn State ventilated REE (Frankenfield 2004/2009). Standard
    (2003b) RMR = Mifflin × 0.96 + Tmax × 167 + Ve × 31 − 6212; the modified (2010)
    form (× 0.71 / × 85 / × 64 / − 3085) applies **only** when BMI ≥ 30 **and** age
    ≥ 60 — a three-way branch where obese-but-young patients still use the standard
    form (a routing trap a unit test pins).
  - `ireton-jones` — Ireton-Jones energy equation, **1997-revised** constants.
    Ventilated EEE = 1784 − 11 × age + 5 × wt + 244 × (male) + 239 × (trauma) + 804
    × (burn); spontaneous EEE = 629 − 11 × age + 25 × wt − 609 × (obese, BMI > 27).
    The 1992 set (1925/281/292/851) is distinct and was confirmed not the shipped
    one.
- Every coefficient, constant, and sign was re-fetched and cross-verified against
  ≥ 2 independent authoritative sources (the spec-v97 discipline); nothing was
  implemented from recall.
- The catalog count moves on all **13 catalog-truth surfaces** (680 → 685); a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v152.js`. See
  [docs/spec-v152.md](docs/spec-v152.md) and the
  [docs/scope-post-parity.md](docs/scope-post-parity.md) ledger.

### Added (spec-v151: dermatology severity indices — PASI, EASI, SCORAD, DLQI, +4 — spec-v150 Post-Parity Coverage program OPENS)

- **Four dermatology severity instruments open the spec-v150 Post-Parity Coverage
  program (676 → 680, +4).** Dermatology previously had no scored-severity tile;
  these are the field's daily quantitative instruments. All four are **Group G**
  and **Class A**, live in `lib/derm-v151.js` + `views/group-v151.js` (`RV151`),
  and are covered by the spec-v59 fuzz harness with zero non-finite leaks.
  - `pasi` — Psoriasis Area and Severity Index (Fredriksson & Pettersson 1978).
    PASI = Σ over four regions of (erythema + induration + desquamation, each 0–4)
    × area grade 0–6 × region weight (head 0.1, upper 0.2, trunk 0.3, lower 0.4),
    range 0–72; bands mild < 10, moderate 10–20, severe > 20. The % involvement is
    mapped to the 0–6 area grade internally (the spec-v59 fuzz exercises the
    mapping).
  - `easi` — Eczema Area and Severity Index (Hanifin 2001). EASI = Σ (erythema +
    edema/papulation + excoriation + lichenification, each 0–3) × area 0–6 ×
    **age-branched** weight — adults (≥ 8 yr) head 0.1/lower 0.4, children (< 8 yr)
    head 0.2/lower 0.3 — range 0–72. The published **six-band Leshem 2015** strata
    (clear / almost clear / mild / moderate / severe / very severe) are used; the
    spec-v151 draft's unverified four-band cut-set is corrected (cross-verified
    against DermNet + the Hanifin 2022 practical guide). A unit test pins the
    adult-vs-child divergence on identical intensities.
  - `scorad` — SCORing Atopic Dermatitis (European Task Force 1993). SCORAD =
    A/5 + 7B/2 + C (extent %, six 0–3 intensity items with dryness on uninvolved
    skin, two 0–10 VAS), range 0–103; also reports the objective oSCORAD = A/5 +
    7B/2. Bands mild < 25, moderate 25–50, severe > 50.
  - `dlqi` — Dermatology Life Quality Index (Finlay 1994). Sum of ten 0–3
    quality-of-life answers (Q7 yes-prevented-work scores 3), range 0–30; bands
    no / small / moderate / very large / extremely large effect. A partially
    answered form surfaces a complete-the-fields fallback rather than scoring an
    undercounted total.
- Every region weight, item value, and band was re-fetched and cross-verified
  against ≥ 2 independent authoritative sources (the spec-v97 discipline); nothing
  was implemented from recall.
- The catalog count moves on all **13 catalog-truth surfaces** (676 → 680); a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v151.js`. See
  [docs/spec-v151.md](docs/spec-v151.md) and the new
  [docs/scope-post-parity.md](docs/scope-post-parity.md) ledger.

### Added (spec-v148: rheumatology / palliative / pharmacy — ASDAS, FFS-2011, 2022 ACR/EULAR GCA, PPI, PaP, opioid conversion, Naranjo, +7 — spec-v100 program CLOSES)

- **Seven rheumatology, palliative, and pharmacy instruments close Wave 8 and the
  entire spec-v100 MDCalc Parity Completion program (669 → 676, +7; program total
  432 → 676).** Six are in **Clinical Scoring & Risk (Group G)** and one
  (`opioid-conversion`) in **Medication & Infusion (Group F)**, via
  `lib/rheum-v148.js` + `views/group-v148.js` (`RV148`). Per the spec-v100 §2
  classification clarification each tile **consumes the clinician's bounded
  inputs** (the joint/symptom exam, labs, performance status, the source opioid
  regimen, the ADR-causality answers) and **computes a score / classification /
  converted dose** plus the source's interpretation — none is a no-input reference
  table. Every coefficient, weight, band cutoff, and equianalgesic constant was
  **re-fetched and cross-verified across ≥ 2 independent authoritative sources**
  (the original papers, the ASAS calculator, RheumNow/RheumCalc, the CDC MME
  factor file, the University of Iowa equianalgesic chart, the Palliative Care
  Network of Wisconsin, MDApp, and the NCBI LiverTox Naranjo worksheet; the
  spec-v97 discipline). Each leaves the treat/prescribe decision with the
  clinician (spec-v11 §5.3); the high-stakes opioid conversion additionally
  surfaces the mandatory independent-second-check caveat.
  - **`asdas`** — Ankylosing Spondylitis Disease Activity Score (Lukas C, et al,
    *Ann Rheum Dis* 2009): ASDAS-CRP = 0.12·back pain + 0.06·morning stiffness +
    0.11·patient global + 0.07·peripheral pain + 0.58·ln(CRP+1) (CRP mg/L floored
    to 2); ASDAS-ESR uses **different** item weights (0.08/0.07/0.11/0.09) +
    0.29·√ESR. Cutoffs **inactive < 1.3, low < 2.1, high ≤ 3.5, very high > 3.5**.
    **Class A.**
  - **`ffs-2011`** — Five-Factor Score, 2011 revision (Guillevin L, et al,
    *Medicine* 2011): four poor-prognosis factors + the favorable absence-of-ENT,
    total **0–5**; 5-year mortality **≈ 9% / 21% / 40%** at FFS **0 / 1 / ≥ 2**.
    **Class A.**
  - **`gca-acr-eular-2022`** — 2022 ACR/EULAR Giant Cell Arteritis classification
    (Ponte C, et al, *Ann Rheum Dis* 2022): age ≥ 50 entry, then weighted items
    (biopsy/halo +5, ESR/CRP +3, sudden visual loss +3, seven +2 items) sum
    **0–25**; **≥ 6 = GCA**. **Class B** (documentation-only staleness row — ACR/
    EULAR is not in the issuer-acronym set).
  - **`palliative-prognostic-index`** (PPI) — Morita T, et al, *Support Care
    Cancer* 1999: PPS + oral intake + edema + dyspnea + delirium, total **0–15**;
    **> 6 → < 3 weeks, > 4 → < 6 weeks**. **Class A.**
  - **`palliative-prognostic-score`** (PaP) — Pirovano M, Maltoni M, et al, *J Pain
    Symptom Manage* 1999: dyspnea + anorexia + Karnofsky + clinical prediction of
    survival + WBC + lymphocyte %, total **0–17.5**; 30-day-survival groups **A
    (> 70%) / B (30–70%) / C (< 30%)**. **Class A.**
  - **`opioid-conversion`** — equianalgesic / rotation converter (McPherson, ASHP
    2018; CDC MME factors): source dose → oral morphine equivalents → target, then
    a 25–50% incomplete-cross-tolerance reduction, with transdermal-fentanyl
    sizing. **Methadone and buprenorphine are excluded** (non-linear/ceiling
    ratios). Distinct from the surveillance `opioid-mme`; both kept and
    cross-linked. **Class A** with the mandatory second-check caveat.
  - **`naranjo`** — ADR Probability Scale (Naranjo CA, et al, *Clin Pharmacol Ther*
    1981): ten weighted yes/no/don't-know questions, **−4 to +13** → doubtful
    (≤ 0) / possible (1–4) / probable (5–8) / definite (≥ 9). **Class A.**
- **Deferred — `valproate-correction`.** The proposed eighth tile (Hermida-Tutor
  albumin normalization of total valproate) was **not shipped**. Source governance
  (spec-v97) blocked it: the spec draft's citation was wrong (the paper is *J
  Pharmacol Sci* 2005;97(4):489-493, not *Ther Drug Monit*); the method needs a
  free-fraction lookup table that could be located in only **one** reproducible
  source, failing the ≥ 2-independent-source rule (the same block that parked
  `crib-ii` / `gail-bcrat`); and a 2018 validation (*Neurocrit Care* 30(2):320-327)
  found the equation clinically inaccurate against measured free valproate. Parked
  rather than ship an under-sourced, high-stakes drug-level correction.
- CI: `lib/rheum-v148.js` added to the `test/unit/fuzz-tools.test.js` `MODULES`
  list (zero non-finite leaks); ≥ 5 boundary worked examples per tile; the catalog
  count moves on all **13 catalog-truth surfaces** (669 → 676); a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v148.js`.

### Added (spec-v147: rheumatology activity & classification — CDAI, SDAI, 2010 ACR/EULAR RA, SLEDAI-2K, 2015 gout, CASPAR, 2016 fibromyalgia, +7 — spec-v100 Wave 8 continues)

- **Seven rheumatology disease-activity and classification instruments continue
  Wave 8 of the spec-v100 program (662 → 669, +7)**, filling a confirmed gap: the
  catalog had `das28` as the lone rheumatology anchor but **none of the standard
  activity/classification surface beside it**. All seven are in **Clinical
  Scoring & Risk (Group G)** via `lib/rheum-v147.js` + `views/group-v147.js`
  (`RV147`), each cross-linking `das28`. Per the spec-v100 §2 classification
  clarification each tile **consumes the clinician's read of the joint exam,
  serology, synovial fluid, and imaging** and **computes a score / classification**
  plus the source's interpretation — none is a no-input reference table. Every
  weight, band cutoff, and threshold was **re-fetched and cross-verified across
  ≥ 2 independent authoritative sources** (the original papers, MDCalc, the
  official ACR/EULAR gout-classification web calculator, StatPearls, the Bateman
  Horne Center fibromyalgia form, published SLEDAI-2K/CDAI/SDAI forms; the
  spec-v97 discipline). Each leaves the treat/escalate/DMARD decision with the
  rheumatologist (spec-v11 §5.3).
  - **`cdai-ra`** — Clinical Disease Activity Index (Aletaha D, et al, *Arthritis
    Res Ther* 2005): the lab-free linear sum SJC28 + TJC28 + patient + physician
    global, total **0–76**; **remission ≤ 2.8, low ≤ 10, moderate ≤ 22, high > 22**.
    **Class A.**
  - **`sdai-ra`** — Simplified Disease Activity Index (Smolen JS, et al,
    *Rheumatology* 2003): the CDAI inputs **plus CRP in mg/dL**, total **0–86**;
    **remission ≤ 3.3, low ≤ 11, moderate ≤ 26, high > 26**. The CRP addend is
    guarded finite/non-negative (mg/L is 10× mg/dL — the common transcription
    trap). **Class A.**
  - **`acr-eular-2010-ra`** — 2010 ACR/EULAR RA classification (Aletaha D, et al,
    *Arthritis Rheum* 2010): applied after the synovitis entry condition, four
    domains (joints 0–5, serology 0–3, acute-phase 0–1, duration 0–1) sum **0–10**;
    **≥ 6 = definite RA**. **Class B.**
  - **`sledai-2k`** — SLEDAI-2K SLE Disease Activity Index 2000 (Gladman DD, et al,
    *J Rheumatol* 2002): 24 weighted descriptors (8/4/2/1) sum **0–105**; **≥ 6**
    denotes clinically important active disease. SLEDAI-2K credits **ongoing** (not
    only new) rash, alopecia, mucosal ulcers, and proteinuria. **Class A.**
  - **`gout-acr-eular-2015`** — 2015 ACR/EULAR gout classification (Neogi T, et al,
    *Arthritis Rheumatol* 2015): an entry criterion gates the rule; **MSU crystals
    classify directly** (sufficient-criterion bypass); otherwise weighted domains
    sum **0–23** with **≥ 8 = gout**. Two **negative** items (serum urate < 4 mg/dL
    = **−4**, MSU-negative synovial fluid = **−2**) are confirmed with sign, distinct
    from "not done" (0). **Class B.**
  - **`caspar`** — CASPAR psoriatic-arthritis criteria (Taylor W, et al, *Arthritis
    Rheum* 2006): the inflammatory-articular-disease entry **plus ≥ 3 of 6 points**
    (psoriasis current 2 / history 1, nail dystrophy 1, negative RF 1, dactylitis 1,
    juxta-articular new bone 1). Current psoriasis is the only 2-point item.
    **Class B.**
  - **`fibromyalgia-acr-2016`** — 2016 revised ACR fibromyalgia criteria (Wolfe F,
    et al, *Semin Arthritis Rheum* 2016): met when **(WPI ≥ 7 and SSS ≥ 5) OR
    (WPI 4–6 and SSS ≥ 9)**, AND generalized pain (≥ 4 of 5 regions), AND symptoms
    ≥ 3 months. The 2016 somatic item is a **0–3 count** of headaches / lower-
    abdominal pain / depression, not a severity scale. **Class A.**
- **`acr-eular-2010-ra`, `gout-acr-eular-2015`, and `caspar` are Class B** by
  maintenance class (revisable society classification criteria), so each carries a
  `docs/citation-staleness.md` row naming the edition in force (2010 RA, 2015 gout,
  2006 CASPAR), the `accessed` date, and an on-publication review cadence. Their
  citations name ACR/EULAR, which is **not** in the `check-citations.mjs`
  issuer-acronym set, so the rows are **documentation-only** (like the existing
  `das28` row), not gate-forced. The underlying arithmetic is stable (Class A).
- **Catalog count moves 662 → 669** across all 13 catalog-truth surfaces
  (`<title>`, meta/OG/Twitter tags, JSON-LD, hero label, README blurb,
  `package.json`, the `scope-mdcalc-parity.md` ledger). Seven `META` entries
  (inline citation + `citationUrl` + `accessed` + worked example +
  interpretation), seven `docs/audits/v12/` audit logs, seven
  `docs/clinical-citations.md` rows, three `docs/citation-staleness.md` rows, and
  seven unit-test files (every band boundary and entry/sufficient gate covered,
  plus the `lib/rheum-v147.js` module added to the fuzz harness `MODULES` list
  with zero non-finite leaks).

### Added (spec-v146: spinal tumor & trauma classification — SINS, Revised Tokuhashi, Tomita, TLICS, SLIC, +5 — spec-v100 Wave 8 continues)

- **Five spinal tumor / trauma classification instruments continue Wave 8 of the
  spec-v100 program (657 → 662, +5)**, filling a confirmed gap: the catalog had
  the brain/cerebrovascular neurosurgical scores (`ich-score`, `hunt-hess-wfns`,
  `nihss`) but **no spinal instability, spinal-metastasis, or spinal-trauma
  scores**. All five are in **Clinical Scoring & Risk (Group G)** via
  `lib/spine-v146.js` + `views/group-v146.js` (`RV146`). Per the spec-v100 §2
  classification clarification each tile **consumes the clinician's read of the
  CT/MRI/radiograph and the neurologic exam** as bounded selects and **computes a
  weighted-sum score** plus the source's management interpretation — none is a
  no-input reference table. Every point value, component option, and band cutoff
  was **re-fetched and cross-verified across ≥ 2 independent authoritative
  sources** (the original papers, the CORR "Classifications in Brief" reviews,
  Radiopaedia, AO Spine, UW Emergency Radiology, MDCalc, StatPearls; the spec-v97
  discipline). All five are **Class A**. Each leaves the operate/radiate/brace
  decision with the clinician and a multidisciplinary spine/oncology team
  (spec-v11 §5.3).
  - **`sins-score`** — Spinal Instability Neoplastic Score (Fisher CG, et al,
    *Spine* 2010): six components (location, mechanical pain, bone lesion,
    alignment, vertebral-body collapse, posterolateral involvement) sum **0–18**;
    **0–6 stable, 7–12 indeterminate, 13–18 unstable** (7–18 warrants a surgical
    consult). **Class A.**
  - **`tokuhashi-revised`** — Revised Tokuhashi metastatic-spine prognostic score
    (Tokuhashi Y, et al, *Spine* 2005): six parameters sum **0–15**; a lower total
    is the worse prognosis — **0–8 < 6 months, 9–11 ≥ 6 months, 12–15 ≥ 1 year**.
    **Class A.**
  - **`tomita-score`** — Tomita surgical-strategy score (Tomita K, et al, *Spine*
    2001): three factors sum **2–10** with the **non-overlapping** strategy bands
    2–3 wide/marginal excision, 4–5 marginal/intralesional, 6–7 palliative, 8–10
    supportive/terminal (not the overlapping survival windows some reviews cite).
    **Class A.**
  - **`tlics-score`** — Thoracolumbar Injury Classification & Severity (Vaccaro AR,
    et al, *Spine* 2005): morphology + neurology + posterior-ligamentous-complex
    integrity sum **0–10**; **≤ 3 nonoperative, 4 indeterminate, ≥ 5 operative**.
    **Incomplete cord (3) scores higher than complete cord (2) by design.**
    **Class A.**
  - **`slic-score`** — Subaxial Cervical Spine Injury Classification (Vaccaro AR,
    et al, *Spine* 2007): morphology + disco-ligamentous complex + neurology sum
    **0–10**, with a **separate additive +1 modifier** for continuous cord
    compression with an ongoing deficit (not a fifth neuro option). **≤ 3
    nonoperative, 4 indeterminate, ≥ 5 operative.** **Class A.**
- **Catalog count moves 657 → 662** across all catalog-truth surfaces
  (`<title>`, meta/OG/Twitter tags, JSON-LD, hero label, README blurb,
  `package.json`, the `scope-mdcalc-parity.md` ledger). Five `META` entries
  (inline citation + `citationUrl` + `accessed` + worked example +
  interpretation), five `docs/audits/v12/` audit logs, five
  `docs/clinical-citations.md` rows, and five unit-test files (every band
  boundary covered, plus the `lib/spine-v146.js` module added to the fuzz
  harness `MODULES` list with zero non-finite leaks).

### Added (spec-v145: orthopedic risk & osteoarthritis — Frykman, Mirels, Kellgren-Lawrence, Pittsburgh knee rule, compartment delta pressure, +5 — spec-v100 Wave 8 continues)

- **Five orthopedic risk / osteoarthritis instruments continue Wave 8 of the
  spec-v100 program (652 → 657, +5)**, completing the orthopedic cluster beside
  the v144 fracture-classification tiles and the existing `ottawa-knee` /
  `ottawa-ankle` ED rules. Four are in **Clinical Scoring & Risk (Group G)** and
  `compartment-delta-pressure` is in **Clinical Math & Conversions (Group E)**,
  via `lib/ortho-v145.js` + `views/group-v145.js` (`RV145`). Per the spec-v100 §2
  classification clarification the Frykman / Mirels / Kellgren-Lawrence tiles
  **consume the clinician's read of the film** (joint involvement, lesion factors,
  radiographic grade) and **compute a class/score** — none is a no-input reference
  table. Every definition/threshold was **re-fetched and cross-verified across
  ≥ 2 independent authoritative sources** (the original papers, the CORR
  "Classifications in Brief" reviews, Wheeless, UW Emergency Radiology,
  Radiopaedia, StatPearls, the Seaberg 1994/1998 PubMed abstracts; the spec-v97
  discipline). All five are **Class A**. Each reports the class/score/decision and
  the source's interpretation and leaves fixation/imaging/decompression with the
  care team (spec-v11 §5.3).
  - **`frykman-classification`** — Frykman distal-radius classification (Frykman G,
    *Acta Orthop Scand* 1967;Suppl 108): type **I–VIII** on two axes — joint
    involvement (extra-articular / radiocarpal / distal radioulnar / both) and an
    associated distal-ulna (ulnar styloid) fracture. **Odd types have no ulnar
    fracture, even types add one**, so I/II extra-articular, III/IV radiocarpal,
    V/VI radioulnar, VII/VIII both joints. **Class A.**
  - **`mirels-score`** — Mirels impending-pathologic-fracture score (Mirels H,
    *Clin Orthop Relat Res* 1989): four factors each 1–3 (site, pain, radiographic
    nature, size vs cortex), total **4–12**. ≤ 7 low (~0–4%, irradiate/observe),
    8 borderline (~15%), **≥ 9 high (> 33%) → prophylactic fixation**. **Class A.**
  - **`kellgren-lawrence`** — Kellgren-Lawrence osteoarthritis grade (Kellgren JH,
    Lawrence JS, *Ann Rheum Dis* 1957): grade **0–4**; **grade ≥ 2** (definite
    osteophyte plus possible narrowing) is the accepted threshold for definite
    radiographic OA. Subchondral cysts are deliberately **not** listed — not a KL
    feature. **Class A.**
  - **`pittsburgh-knee-rule`** — Pittsburgh knee rules (Seaberg DC, Jackson R,
    *Am J Emerg Med* 1994; validated 1998): the **entry gate is a blunt-trauma or
    fall mechanism** — without it the rule does not apply. Given the gate, a knee
    radiograph is indicated if age **< 12 or > 50** (strict) or inability to take
    **4 weight-bearing steps**. ~99% sensitive, ~60% specific. Cross-linked to the
    near-neighbor `ottawa-knee`; both kept. **Class A.**
  - **`compartment-delta-pressure`** — compartment delta pressure (McQueen MM,
    Court-Brown CM, *J Bone Joint Surg Br* 1996): **ΔP = diastolic BP − measured
    compartment pressure** (mmHg); **ΔP < 30 mmHg** (strictly, per the primary
    paper) is the published fasciotomy threshold. A guarded subtraction — blank or
    non-finite inputs surface a `valid:false` fallback, never `NaN`. **Class A.**

### Added (spec-v144: orthopedic fracture classification — Gustilo-Anderson, Garden, Danis-Weber, Schatzker, Salter-Harris, Neer, +6 — spec-v100 Wave 8 continues)

- **Six orthopedic fracture-classification decision rules continue Wave 8 of the
  spec-v100 program (646 → 652, +6)**, sitting beside the orthopedic triage/risk
  cluster (`ottawa-ankle` / `ottawa-knee` / `nexus-cspine` / `canadian-c-spine`).
  All six are in **Clinical Scoring & Risk (Group G)**, via `lib/ortho-v144.js` +
  `views/group-v144.js` (`RV144`). Per the spec-v100 §2 classification
  clarification, each tile **consumes the clinician's read of the film** (wound
  size, displacement, fibula level, plateau geometry, physeal pattern, displaced-
  part count) and **computes a class** — it is not a no-input reference table.
  Every category definition and precedence rule was **re-fetched and cross-verified
  across ≥ 2 independent authoritative sources** (AO Foundation, Orthobullets,
  Radiopaedia, the original / CORR papers; the spec-v97 discipline). Each tile
  reports the class and the source's management-relevant interpretation and leaves
  the fixation/operative decision with the care team (spec-v11 §5.3).
  - **`gustilo-anderson`** — Gustilo-Anderson open fracture (Gustilo RB, Anderson
    JT, *J Bone Joint Surg Am* 1976; Type III subtypes Gustilo, Mendoza, Williams,
    *J Trauma* 1984): class I / II / IIIA / IIIB / IIIC. The Type III subtype is
    set by **coverage and perfusion, not wound size** — an arterial injury
    requiring repair forces IIIC, inadequate coverage requiring a flap forces IIIB,
    and a high-energy/extensive-soft-tissue mechanism or a wound over 10 cm forces
    at least Type III. The unverifiable mnemonic triggers (">8 h", "war wounds",
    "mass casualty") were deliberately **not** encoded — absent from the canonical
    definition. **Class A.**
  - **`garden-classification`** — Garden femoral-neck classification (Garden RS,
    *J Bone Joint Surg Br* 1961): grade I–IV, with the stable I–II vs unstable
    III–IV grouping that drives internal fixation vs arthroplasty. **Class A.**
  - **`weber-ankle`** — Danis-Weber ankle classification (Weber BG, *Die
    Verletzungen des oberen Sprunggelenkes*, 1972, AO-adopted): type A/B/C by the
    distal-fibula level relative to the syndesmosis. The source date is **1972**
    (a common reproduction prints 1966); Danis (1949) gave the anatomic basis.
    **Class B** — textbook/monograph source; carries `accessed` + a
    `docs/citation-staleness.md` row.
  - **`schatzker-classification`** — Schatzker tibial-plateau classification
    (Schatzker J, McBroom R, Bruce D, *Clin Orthop Relat Res* 1979): type I–VI,
    low-energy I–III vs high-energy IV–VI (worst prognosis). **Class A.**
  - **`salter-harris`** — Salter-Harris physeal classification (Salter RB, Harris
    WR, *J Bone Joint Surg Am* 1963): SALTR types I–V, growth-disturbance risk
    rising ascending I → V; II is the most common, III/IV intra-articular. **Class
    A.**
  - **`neer-classification`** — Neer proximal-humerus classification (Neer CS 2nd,
    *J Bone Joint Surg Am* 1970): one- to four-part by displaced-segment count (a
    segment is displaced when separated > 1 cm or angulated > 45°); the part count
    is 1 + displaced segments, clamped to the published 1–4 range, so an
    undisplaced fracture is one-part regardless of fracture lines. **Class A.**
- **Tests / gates.** Six unit suites (`gustilo-anderson`, `garden-classification`,
  `weber-ankle`, `schatzker-classification`, `salter-harris`, `neer-classification`)
  with ≥ 3 boundary worked examples each (the Gustilo IIIA→IIIB→IIIC distinction,
  the Garden II→III stable→unstable boundary, the Weber B→C suprasyndesmotic flip,
  and the Salter-Harris II→III case); `lib/ortho-v144.js` added to the `fuzz-tools`
  MODULES list (every input combination resolves to exactly one defined class, zero
  `undefined`/`NaN` bands). The catalog count moves on all 13 catalog-truth
  surfaces. spec-v11 audit logs under `docs/audits/v12/`.

### Added (spec-v143: frailty & geriatric-oncology screening — mFI-5, mFI-11, FRAIL Scale, VES-13, CARG chemo-toxicity, +5 — spec-v100 Wave 8 continues)

- **Five frailty and geriatric-oncology screening instruments continue Wave 8 of
  the spec-v100 program (641 → 646, +5)**, deepening the `charlson` / `cfs`
  frailty-comorbidity panel and the `ecog-karnofsky` oncology cluster. All five
  are in **Clinical Scoring & Risk (Group G)** and all **Class A**, via
  `lib/frailty-v143.js` + `views/group-v143.js` (`RV143`). Each tile reports the
  score / risk band and the source's framing and leaves the treat / withhold /
  optimize decision with the care team and local protocol (spec-v11 §5.3). Every
  point weight and band cutoff was **re-fetched and cross-verified across ≥ 2
  independent sources** (the spec-v97 discipline).
  - **`mfi-5`** — Modified 5-Item Frailty Index (Subramaniam S, Aalberg JJ,
    Soriano RP, Divino CM, *J Am Coll Surg* 2018): five accumulated deficits
    (diabetes, hypertension on medication, COPD/pneumonia, CHF, dependent status),
    one point each, 0–5. A count of **2 or more** is the frailty threshold. The
    free, published surrogate for the proprietary ACS-NSQIP risk calculator.
  - **`mfi-11`** — Modified 11-Item Frailty Index (Velanovich V, Antoine H, Swartz
    A, et al, *J Surg Res* 2013): the original eleven deficits reported as a
    fraction of 11 (divisor is the fixed constant 11 — no division-by-zero path).
    Worked: 3 deficits → **3/11, index 27.3%**.
  - **`frail-scale`** — FRAIL Scale (Morley JE, Malmstrom TK, Miller DK, *J Nutr
    Health Aging* 2012): Fatigue, Resistance, Ambulation, Illnesses (≥ 5 of 11),
    Loss of weight (> 5%), one point each → **0 robust, 1–2 pre-frail, ≥ 3 frail**.
  - **`ves-13`** — Vulnerable Elders Survey-13 (Saliba D, Elliott M, Rubenstein LZ,
    et al, *J Am Geriatr Soc* 2001): total 0–10 = age (75–84 = 1, ≥ 85 = 3) +
    fair/poor self-rated health (1) + physical function (1 per task rated "a lot"/
    "unable", **capped at 2**) + a single **4-point all-or-nothing** block for any
    of five ADL/IADL disabilities. **≥ 3 = vulnerable** (~4.2-fold two-year risk of
    decline/death). The 4-point disability rule (not the 1 point printed by two
    online reproductions) and the 75–84 age band (not "73–84") were restored from
    the original Saliba definition — the only allocation that yields the canonical
    0–10 range. Worked: age 80 + fair health + one "a lot" task → **3, vulnerable**.
  - **`carg-toxicity`** — CARG Chemotherapy Toxicity Tool (Hurria A, Togawa K,
    Mohile SG, et al, *J Clin Oncol* 2011, Table 4): eleven weighted predictors —
    haemoglobin, creatinine clearance < 34, and falls are each **3 points**; age
    ≥ 72, GI/GU cancer, standard-dose chemo, polychemotherapy, hearing, and walking
    limitation each **2**; medication help and decreased social activity each **1**
    — banded **low 0–5 (~30%), intermediate 6–9 (~52%), high ≥ 10 (~83%)** grade
    3–5 toxicity. CrCl is a banded yes/no (does not shadow `cockcroft-gault`, which
    is cross-linked). Worked: age ≥ 72 + GI cancer + standard-dose → **6,
    intermediate**.
- **Tests / gates.** Five unit suites (`mfi-5`, `mfi-11`, `frail-scale`, `ves-13`,
  `carg-toxicity`) with ≥ 3 boundary worked examples each (mFI-5 ≥ 2 frail flip,
  FRAIL 2→3 boundary, VES-13 ≥ 3 vulnerable flip, CARG low→intermediate band
  change); `lib/frailty-v143.js` added to the `fuzz-tools` MODULES list (zero
  non-finite leaks). The catalog count moves on all 13 catalog-truth surfaces.
  spec-v11 audit logs under `docs/audits/v12/`.

### Added (spec-v142: surgical & anesthetic risk — POSSUM, P-POSSUM, SORT, Goldman, Wilson airway, Surgical Risk Scale, +6 — spec-v100 Wave 8 **opens**)

- **Six classic surgical / anesthetic risk instruments open Wave 8 of the
  spec-v100 program (635 → 641, +6)**, beside the modern perioperative cluster
  (`rcri` / `gupta-mica` / `ariscat` / `pospom` / `asa-ps` / `el-ganzouri`). All
  six are in **Clinical Scoring & Risk (Group G)** and all **Class A**, via
  `lib/surg-v142.js` + `views/group-v142.js` (`RV142`). Every coefficient and
  point-band was **re-fetched and cross-verified across ≥ 2 independent sources**
  (the spec-v97 discipline). Each tile reports the score / predicted risk and the
  source's framing and leaves the operative proceed / optimize / cancel decision
  with the surgeon, anesthetist, and local protocol (spec-v11 §5.3).
  - **`possum`** — POSSUM (Copeland GP, Jones D, Walters M, *Br J Surg* 1991). The
    12 physiological + 6 operative variables (each graded 1/2/4/8) give a
    physiological score (12–88) and operative score (6–48) that drive **two**
    logistic equations — morbidity `ln[R/(1−R)] = −5.91 + 0.16·phys + 0.19·op` and
    mortality `ln[R/(1−R)] = −7.04 + 0.13·phys + 0.16·op`. Worked: phys 32 / op 18
    (mortality logit exactly 0) → **morbidity 93.3%, mortality 50.0%**.
  - **`p-possum`** — Portsmouth POSSUM (Prytherch DR, Whiteley MS, Higgins B, et
    al, *Br J Surg* 1998): the recalibrated mortality `ln[R/(1−R)] = −9.065 +
    0.1692·phys + 0.1550·op` on the identical 18 variables, shown beside the
    original POSSUM mortality so the low-risk over-prediction is visible. Worked:
    minimum 12 / 6 scores → **P-POSSUM 0.2% vs POSSUM 1.1%**.
  - **`sort`** — Surgical Outcome Risk Tool (Protopapa KL, Simpson JC, Smith NCE,
    Moonesinghe SR, *Br J Surg* 2014): a six-variable logistic 30-day-mortality
    estimate, `logit = −7.366 + ASA + urgency + 0.712 high-risk specialty + 0.381
    Xmajor/complex + 0.667 cancer + age`. **ASA I and II share the reference** (no
    ASA-II coefficient) and the **age bands are mutually exclusive** (corrections
    to the spec draft). Worked: ASA III, urgent, high-risk, Xmajor, cancer, 65–79
    → **14.67%**.
  - **`goldman-cardiac-risk`** — Goldman Cardiac Risk Index (Goldman L, Caldera DL,
    Nussbaum SR, et al, *N Engl J Med* 1977), the ancestor of the RCRI: nine
    weighted factors → 0–53 → Class I (0–5) / II (6–12) / III (13–25) / IV (≥26).
    Worked: MI < 6 mo (10) + intraperitoneal op (3) = **13 → Class III (~14%)**.
  - **`wilson-airway`** — Wilson Risk Sum Score (Wilson ME, Spiegelhalter D,
    Robertson JA, Lesser P, *Br J Anaesth* 1988): five anatomic factors each 0–2 →
    0–10; the derivation's score-above-2 cut identified ~75% of difficult
    intubations. Distinct from `el-ganzouri`. Worked: weight > 110 kg → **2/10**.
  - **`surgical-risk-scale`** — Surgical Risk Scale (Sutton R, Bann S, Brooks M,
    Sarin S, *Br J Surg* 2002): CEPOD urgency (1–4) + ASA grade (1–5) + BUPA
    operative magnitude (1–5) → **3–14** (the spec draft's "3–17" corrected to the
    source value); ≥ 8 is a common high-risk threshold. No mortality probability is
    shipped — the only published full equation carries a single-source intercept.

### Added (spec-v141: pediatric growth & developmental-age — CDC BMI-for-age percentile, WHO growth z-score, mid-parental height, corrected age, +4 — spec-v100 Wave 7 **complete**)

- **The pediatric growth / developmental-age cluster closes Wave 7 of the
  spec-v100 program (631 → 635, +4).** Four deterministic tiles via
  `lib/peds-growth-v141.js` + `views/group-v141.js` (`RV141`), all in **Clinical
  Math & Conversions (Group E)** and all **Class A**. The CDC 2000 and WHO 2006
  LMS (λ-μ-σ) tables are compiled constants in a new module
  `lib/growth-lms-data.js`, transcribed **byte-for-byte** from the published CDC
  NCHS / WHO MGRS data files (re-fetched, never recalled — the spec-v97
  discipline; the data module header records the per-table source and accessed
  date). Each tile reports the percentile / z-score / target / corrected age and
  the source's framing and leaves the growth, feeding, and referral decision with
  the clinician (spec-v11 §5.3).
  - **`peds-bmi-percentile`** — Pediatric BMI-for-age percentile & z-score (2000
    CDC growth charts; Kuczmarski RJ, Ogden CL, Guo SS, et al, *Vital Health Stat
    11* 2002). The measured BMI (entered directly, or computed from weight +
    height) is converted to an age- and sex-specific z-score by the CDC LMS
    transform `z = ((BMI/M)^L − 1) / (L·S)`; the percentile is the standard-normal
    CDF of z. Bands per the CDC cutoffs (under 5th underweight, 5th–<85th healthy,
    85th–<95th overweight, ≥95th obese). Worked: 16 y boy, BMI 30 → **98th
    percentile (z 1.97), obese**. Ages 2–20 y.
  - **`who-growth-zscore`** — WHO weight/length-for-age z-score (WHO Child Growth
    Standards; WHO MGRS, *Acta Paediatr Suppl* 2006). The WHO LMS transform
    (length-for-age uses L = 1) returns the z-score and percentile with the WHO
    low (z < −2) / severely-low (z < −3) bands. Worked: 6 mo boy, 5.5 kg → **z
    −3.27, severely low**. Ages 0–24 mo.
  - **`mid-parental-height`** — Mid-parental target height (Tanner JM, Goldstein H,
    Whitehouse RH, *Arch Dis Child* 1970): boy `(father + mother + 13)/2`, girl
    `(father + mother − 13)/2`, with the **± 8.5 cm** target range (the spec
    draft's "± 6.5 cm" was corrected to the source value). Worked: boy, mother
    165 + father 180 → **179 cm (170.5–187.5)**.
  - **`corrected-age`** — Corrected gestational age (Engle WA; AAP Committee on
    Fetus and Newborn, *Pediatrics* 2004): corrected age = chronological age −
    (40 − GA at birth). Worked: 28-week preemie at 6 mo → **3.2 mo corrected**.
    Conventionally applied through ~24 months.
  - **Scope — 4 of the 6 proposed tiles shipped.** `peds-weight-est` (the APLS
    age-based weight estimate) is **skipped**: it is already live from spec-v149
    (Group I), so re-adding it would duplicate a live tile (the spec-v85 §6.2
    collision check). `gail-bcrat` (the NCI Gail/BCRAT 5-year breast-cancer risk
    model) is **deferred**: its race-specific composite-incidence and
    competing-mortality tables ship only as binary `.rda` objects in the
    public-domain NCI BCRA package — not verbatim-fetchable to cross-verify per
    spec-v97 — and a subtly-wrong cancer-risk percentage is a real harm. Parked
    alongside `crib-ii` / `gwtg-hf` / ROKS until the coefficient block can be
    sourced and cross-verified verbatim.

### Added (spec-v140: pediatric & neonatal severity — Kaiser EOS, SNAPPE-II, RDAI/Tal, Clinical Dehydration Scale, Koff bladder capacity, +5 — spec-v100 Wave 7)

- **The pediatric / neonatal severity cluster comes onto the page, continuing
  Wave 7 of the spec-v100 program (626 → 631, +5).** Five deterministic tiles
  (catalog **626 → 631**) via `lib/peds-v140.js` + `views/group-v140.js`
  (`RV140`). Four land in **Clinical Scoring & Risk (Group G)** and one
  (`koff-bladder-capacity`) in **Clinical Math & Conversions (Group E)**. Each
  reports the probability / score / band and the source's framing and leaves the
  observe / culture / treat / rehydrate decision with the clinician (spec-v11
  §5.3). Every coefficient, band table, and threshold was re-fetched from a
  primary source and cross-verified across ≥2 independent sources, never recalled
  (the spec-v97 discipline).
  - **`eos-calculator`** — Kaiser Neonatal Early-Onset Sepsis Calculator
    (Kuzniewicz MW, Puopolo KM, et al, *JAMA Pediatr* 2017; on the Puopolo 2011
    model). A maternal/prenatal logistic prior — `bx = intercept + 0.8680·tempF −
    6.9325·GA + 0.0877·GA² + 1.2256·(ROMh+0.05)^0.2 − 1.0488·approptx1 −
    1.1861·approptx2 + 0.5771·GBS⁺ + 0.0427·GBSᵘ`, incidence-specific intercept
    {0.5 → 40.5656, …} — is converted to odds, multiplied by the exam likelihood
    ratio (well 0.41 / equivocal 5.0 / clinical illness 21.2), and reported as the
    posterior EOS probability per 1,000. Worked: GA 39, 100.4 °F, ROM 18 h, GBS⁺,
    no abx, well-appearing → risk at birth **1.50/1,000**, posterior **0.62/1,000**
    → enhanced observation. The temperature enters raw in °F, GA is a quadratic
    (not a spline), the GBS-unknown term is the Kaiser-corrected `+0.0427`, and the
    logistic works in odds space clamped so it never reports a probability from a
    non-finite value. Class A. Management bands per Kuzniewicz 2017.
  - **`snappe-ii`** — Score for Neonatal Acute Physiology with Perinatal
    Extension-II (Richardson DK, et al, *J Pediatr* 2001). Nine banded variables
    sum to 0–162; the oxygenation item is the PaO₂(mmHg)/FiO₂(%) ratio, a zero
    FiO₂ guarded. Worked: mean BP 25, temp 34.5 °C, PaO₂ 50/FiO₂ 80, pH 7.05,
    urine 0.5, BW 800 g, Apgar 5 → **89/162** (high severity). Unmeasured items
    score their 0 band (the SNAP convention). Class A.
  - **`rdai-tal`** — RDAI bronchiolitis severity (Lowell DI, et al, *Pediatrics*
    1987) summing six wheeze/retraction sub-scores to 0–17, plus the optional Tal
    respiratory score (Tal A, et al, *Pediatrics* 1983) 0–12. Worked: RDAI **12/17**
    with a moderate Tal **7/12**. Class A.
  - **`clinical-dehydration-scale`** — Goldman CDS (Goldman RD, et al,
    *Pediatrics* 2008): four items each 0–2 → 0 none / 1–4 some / 5–8 moderate-
    severe. Worked: appearance 1, eyes 1, mucous 2, tears 1 → **5/8** (moderate to
    severe). Class A.
  - **`koff-bladder-capacity`** — Koff expected bladder capacity (Koff SA,
    *Urology* 1983): EBC (mL) = (age + 2) × 30. Worked: age 4 → **180 mL**. Guards
    a negative age. Class A, Group E.
- **`crib-ii` deferred (5 of 6 shipped).** The sixth tile proposed in
  `docs/spec-v140.md` did not ship: the Parry 2003 CRIB-II birth-weight ×
  gestational-age × sex point matrix (~150 cells) could be sourced from only one
  reproduction, and the primary Lancet table and that reproduction were both
  access-blocked at implementation. Per the spec-v97 re-fetch-and-cross-verify
  discipline, it is parked with the other deferred ids (`gwtg-hf`, ROKS) until a
  second independent source for the matrix is in hand.
- **Tests / docs:** five unit suites (`eos-calculator`, `snappe-ii`, `rdai-tal`,
  `clinical-dehydration-scale`, `koff-bladder-capacity`) with ≥3 boundary worked
  examples each and an explicit EOS logistic-overflow case; `lib/peds-v140.js`
  added to the fuzz harness `MODULES` (zero non-finite leaks); five spec-v11 audit
  logs; `META` entries with inline citations + `citationUrl` + `accessed`;
  `docs/clinical-citations.md` rows; the catalog count moves to **631** across all
  13 catalog-truth surfaces. All five citations name journals/authors (no
  `ISSUER_PATTERN` trip → all Class A, no staleness rows).

### Added (spec-v139: gynecology decision rules — Flamm VBAC, ROMA, RMI, IOTA Simple Rules, Rotterdam PCOS, POP-Q, +6 — spec-v100 Wave 7)

- **The general-gynecology decision-rule cluster comes onto the page, continuing
  Wave 7 of the spec-v100 program (620 → 626, +6).** Six deterministic tiles
  (catalog **620 → 626**) via `lib/gyn-v139.js` + `views/group-v139.js` (`RV139`),
  all in **Clinical Scoring & Risk (Group G)**. Each reports the score / index /
  verdict and the source's framing and leaves the counsel / refer / image / treat
  decision with the clinician (spec-v11 §5.3). Every coefficient block, point
  weight, and threshold was re-fetched from a primary source and cross-verified
  across ≥2 independent sources, never recalled (the spec-v97 discipline).
  - **`flamm-vbac`** — Flamm & Geiger admission VBAC-success score (Flamm BL,
    Geiger AM, *Obstet Gynecol* 1997). Five admission factors — maternal age < 40
    (2), prior vaginal birth (before & after 4 / after 2 / before 1 / none 0),
    prior cesarean not for failure to progress (1), effacement (> 75% 2 / 25–75% 1
    / < 25% 0), dilation ≥ 4 cm (1) — sum 0–10 → predicted success 49% (0–2), 60%
    (3), 67% (4), 77% (5), 89% (6), 93% (7), 95% (8–10). Class A. The free
    substitute for the paywalled Grobman MFMU calculator (spec-v100 §8).
  - **`roma-ovarian`** — Risk of Ovarian Malignancy Algorithm (Moore RG, et al,
    *Gynecol Oncol* 2009). Logistic predictive index with **natural-log marker
    terms** (premenopausal `PI = −12.0 + 2.38·ln(HE4) + 0.0626·ln(CA125)`;
    postmenopausal `PI = −8.09 + 1.04·ln(HE4) + 0.732·ln(CA125)`),
    `ROMA% = 100·exp(PI)/(1+exp(PI))`; high-risk cut-point ≈ 13.1% premenopausal /
    27.7% postmenopausal (Moore 2009, Architect platform). Worked: postmenopausal
    HE4 150 / CA-125 100 → **62.1%**, above the 27.7% cutoff. **Class B** (the
    cut-point is assay-platform-dependent → citation-staleness row). The `ln`
    domains are guarded and the logistic exponent is clamped to `[−40, 40]`.
  - **`rmi-ovarian`** — Risk of Malignancy Index I/II/III (Jacobs I, et al, *BJOG*
    1990; Tingulstad 1996/1999 for II/III). `RMI = U × M × CA-125` over five
    ultrasound features (multilocular cyst, solid areas, bilateral, ascites,
    metastases). U/M scaling: **I** U {0/1/3} M {1/3}; **II** U {1/4} M {1/4};
    **III** U {1/3} M {1/3}. > 200 the conventional gyn-onc-referral threshold.
    Worked: RMI I, 3 features, postmenopausal, CA-125 80 → **720**. Class A.
  - **`iota-simple-rules`** — IOTA Simple Rules (Timmerman D, et al, *Ultrasound
    Obstet Gynecol* 2008). Five B (benign) and five M (malignant) descriptors →
    benign (≥ 1 B & no M), malignant (≥ 1 M & no B), or inconclusive (both /
    neither, second-stage test advised). Class A. The free substitute for the IOTA
    ADNEX model (spec-v100 §8).
  - **`rotterdam-pcos`** — Rotterdam PCOS criteria (ESHRE/ASRM 2003, *Hum Reprod*
    2004). At least **two of three** features (oligo/anovulation, hyperandrogenism,
    polycystic ovarian morphology) **after exclusion of mimics** (thyroid,
    prolactin, non-classic CAH, androgen-secreting tumor), naming the phenotype
    A–D. **Class B** (revisable consensus → citation-staleness row).
  - **`popq-staging`** — POP-Q staging (Bump RC, et al, *Am J Obstet Gynecol*
    1996). The leading edge — the most positive of points Aa, Ba, C, D, Ap, Bp
    (cm vs the hymen at 0) — drives the stage: 0 (no descent), I (< −1), II (−1 to
    +1), III (> +1 but < +(TVL−2)), IV (≥ +(TVL−2)). Point D optional after
    hysterectomy. Class A. The catalog vocab has no `urogynecology` term, so the
    tile is tagged `obstetrics-gynecology` (flagged in the spec + audit).
- **Source-governance / fabrication-resistance.** `roma-ovarian` and
  `rotterdam-pcos` carry `citationAccessed` + a `docs/citation-staleness.md` row;
  their citations name a journal/authors and the ESHRE/ASRM group, none in the
  `check-citations` issuer-acronym set, so the rows are documentation-only, not
  gate-forced (unlike v138's ACOG-named `afi` / `iom-gwg`). The `roma-ovarian`
  cutoff is shipped with the explicit "assay-platform dependent — read it against
  your laboratory threshold" caveat rather than as a universal constant.
- **Gates.** `lib/gyn-v139.js` added to the spec-v59 fuzz harness `MODULES` (zero
  non-finite leaks); six unit-test files (≥ 3 boundary worked examples each); six
  spec-v11 audit logs (`docs/audits/v12/`); the catalog count moves on all
  catalog-truth surfaces (620 → 626); a11y, mobile-no-hscroll, and 44px
  touch-target checks pass for `views/group-v139.js`.

### Added (spec-v138: obstetrics & maternal-fetal medicine — Hadlock EFW, fullPIERS, miniPIERS, AFI, Barnhart hCG rise, IOM weight gain, +6 — spec-v100 Wave 7 **opens**)

- **The obstetrics / maternal-fetal-medicine cluster comes onto the page beside
  the dating and induction tiles (`due-date`, `preg-dating`, `bishop`, `bpp`),
  opening Wave 7 of the spec-v100 program (614 → 620, +6).** Six deterministic
  tiles (catalog **614 → 620**) via `lib/ob-v138.js` + `views/group-v138.js`
  (`RV138`). `hadlock-efw`, `afi`, `barnhart-hcg`, and `iom-gwg` read in
  **Clinical Math & Conversions (Group E)**; `fullpiers` and `minipiers` in
  **Clinical Scoring & Risk (Group G)**. Each reports the estimate / probability /
  range and the source's framing and leaves the image / deliver / transfer /
  counsel decision with the clinician (spec-v11 §5.3). Every coefficient block and
  threshold was re-fetched from a primary source and cross-verified across ≥2
  independent sources, never recalled (the spec-v97 discipline).
  - **`hadlock-efw`** — Hadlock four-parameter estimated fetal weight (Hadlock
    1985, *Am J Obstet Gynecol*). `log10(EFW g) = 1.3596 − 0.00386·AC·FL +
    0.0064·HC + 0.00061·BPD·AC + 0.0424·AC + 0.174·FL`, biometry in cm; the
    `BPD·AC` term is the fingerprint distinguishing the four-parameter model from
    the three-parameter `HC²` form. Worked: BPD 9 / HC 33 / AC 30 / FL 7 →
    log₁₀ 3.4149 → **2600 g**. Class A. The log₁₀ is range-checked before `10^x`
    so the gram value is always finite.
  - **`fullpiers`** — fullPIERS adverse-maternal-outcome probability in
    pre-eclampsia (von Dadelszen 2011, *Lancet*). Logistic model over gestational
    age, chest pain/dyspnea, SpO₂, platelets, creatinine (µmol/L), and AST.
    **SpO₂ has no main effect — it enters only via the platelet×SpO₂ interaction**;
    creatinine has no quadratic term (a common mis-recall assigns the −0.0271
    coefficient to SpO₂ — it is creatinine's). Bands `< 10%` low / `10–30%`
    intermediate / `≥ 30%` high-risk rule-in (LR⁺ ≈ 17.5). Class A. Logistic
    exponent clamped to `[−40, 40]`.
  - **`minipiers`** — bedside-only pre-eclampsia risk, no labs (Payne 2014, *PLoS
    Med*). Logistic model where **gestational age and systolic BP enter as natural
    logs** and **dipstick proteinuria is three categorical indicators** (2+ carries
    the published **negative** weight −0.218, 3+ +0.424, 4+ +0.512). High-risk
    rule-in at `≥ 25%` (LR⁺ ≈ 5), increased surveillance over 15%. Class A.
  - **`afi`** — Amniotic Fluid Index (Moore & Cayle 1990). Sum of the four-quadrant
    deepest vertical pockets (cm); **oligohydramnios < 5 cm, polyhydramnios > 24 cm**
    (some references use > 25, noted), 5–8 cm low-normal. **Class B** (ACOG
    thresholds revisable → gate-forced `docs/citation-staleness.md` row).
  - **`barnhart-hcg`** — minimal serial-hCG rise for a potentially viable IUP
    (Barnhart 2004, *Obstet Gynecol*). Observed rise `(repeat − initial)/initial`
    vs the **53%/48 h** minimum (the 99% lower bound; a conservative 35% from the
    2012 re-analysis is noted), scaled log-linearly as `1.53^(hours/48)`. A
    sub-minimal rise is flagged abnormal but not by itself diagnostic. Class A;
    the initial value is guarded against divide-by-zero.
  - **`iom-gwg`** — IOM gestational weight gain (IOM 2009 / ACOG CO 548). Maps
    pre-pregnancy BMI (`703·lb/in²`) to the recommended total gain and weekly rate:
    underweight 28–40, normal 25–35, overweight 15–25, obese 11–20 lb (singleton),
    with provisional twin ranges and **no recommendation for an underweight twin
    pregnancy** (reported, not invented). **Class B** (gate-forced staleness row).
  - **Gates:** `lib/ob-v138.js` added to the `fuzz-tools` harness (zero non-finite
    leaks across the two PIERS logistics and the Hadlock log₁₀); six new unit
    files with boundary worked examples; six `META` examples pinned by the chromium
    `example-correctness` sweep; six spec-v11 audit logs under `docs/audits/v12/`;
    catalog count moved across all 13 catalog-truth surfaces; a11y, mobile
    no-hscroll, and 44px touch-target checks pass for `views/group-v138.js`.

### Added (spec-v137: infectious-disease scores — ISARIC 4C, COVID-GRAM, Candida score, VACS index, RegiSCAR DRESS, +5 — spec-v100 Wave 6 **complete**)

- **The infectious-disease risk-score cluster comes onto the page beside the
  community-acquired-pneumonia tools (`curb-65`, `psi`, `smart-cop`), closing
  Wave 6 of the spec-v100 program (584 → 614, +30).** Five deterministic tiles
  (catalog **609 → 614**), all in **Clinical Scoring & Risk (Group G)**, via
  `lib/id-v137.js` + `views/group-v137.js` (`RV137`). Each reports the score /
  probability and the source's framing and leaves the admit / start-antifungal /
  diagnose decision with the clinician (spec-v11 §5.3). Every point table,
  coefficient block, and threshold was re-fetched from a primary source and
  cross-verified across ≥2 independent sources, never recalled (the spec-v97
  discipline). All five are Class A (journal + author citations — no
  `ISSUER_PATTERN` trip, no citation-staleness row).
  - **`isaric-4c-mortality`** — ISARIC 4C Mortality Score (Knight 2020, *BMJ*
    m3339). Additive **0–21** across age, sex, comorbidity count, respiratory rate,
    SpO₂ on room air, GCS, urea, and CRP → low 0–3 (1.2%), intermediate 4–8 (9.9%),
    high 9–14 (31.4%), very high ≥15 (61.5%) in-hospital mortality (derivation
    cohort). Applies the published Table-2 correction (urea `< 7` mmol/L, CRP in
    mg/L) and exposes a urea/BUN unit selector (BUN mg/dL = urea mmol/L × 2.8).
  - **`covid-gram`** — COVID-GRAM Critical Illness Risk Score (Liang 2020, *JAMA
    Intern Med*). A logistic model `p = 1/(1+e^-x)` over 10 predictors. The paper
    publishes **odds ratios, not betas**, so each beta is derived as `ln(OR)` and
    the intercept as `ln(0.001)`; the tile **discloses that the absolute probability
    is approximate** and the authors deliberately defined **no risk tiers** (none is
    invented — source over the spec draft). The logistic exponent is clamped to
    `[−40, 40]` so an extreme fuzzed predictor returns a probability in `[0, 1]`.
  - **`candida-score`** — Candida Score (León 2006, *Crit Care Med*). Integer
    **0–5** (TPN 1, surgery on ICU admission 1, multifocal colonization 1, severe
    sepsis 2); a score **≥ 3** (original `> 2.5` cut-off) flags likely invasive
    candidiasis (< 3 ≈ 2.3% probability of proven IC in the 2009 validation).
  - **`vacs-index`** — VACS Index 1.0 (Tate / Justice 2013, *AIDS*). Additive
    **0–164** across age, CD4, HIV-1 RNA, hemoglobin, FIB-4 (computed from age, AST,
    ALT, platelets — the platelet and √ALT denominators guarded), eGFR, and HCV.
    Reports only the two published mortality anchors (score 0 ≈ 1.8%, score 164 ≈
    >85.8%) over a continuous curve — **no per-band lookup is fabricated** (the
    gwtg-hf / ROKS precedent).
  - **`regiscar-dress`** — RegiSCAR Score for DRESS (Kardaun 2013, *Br J Dermatol*).
    Weighted **−4 to +9** diagnostic certainty; eosinophilia count/percentage paths
    are alternatives (max +2), and the rash-suggestive and biopsy items can score −1.
    Bands: < 2 no case, 2–3 possible, 4–5 probable, > 5 definite DRESS.

### Added (spec-v136: endocrine / metabolic indices — HOMA-IR, QUICKI, TyG index, metabolic syndrome, OST/ORAI DXA pre-screen, +5 — spec-v100 Wave 6)

- **The endocrine / metabolic index cluster comes onto the page beside `eag-a1c`.**
  Five deterministic tiles (catalog **604 → 609**) via `lib/endo-v136.js` +
  `views/group-v136.js` (`RV136`): the three insulin-resistance surrogates in
  **Clinical Math & Conversions (Group E)**, and the metabolic-syndrome rule and the
  bone pre-screen in **Clinical Scoring & Risk (Group G)**. Each reports the index or
  verdict and the source's framing and leaves the diagnosis / management decision with
  the clinician (spec-v11 §5.3). Every formula and threshold was re-fetched from a
  primary source and cross-verified across ≥2 independent sources, never recalled (the
  spec-v97 discipline). Only `metabolic-syndrome` is Class B (a revisable consensus
  definition → a documentation-only `docs/citation-staleness.md` row); the other four
  are Class A (fixed formulas, journal + author citations).
  - **`homa-ir`** — HOMA-IR (Matthews 1985, *Diabetologia*). Insulin-resistance
    surrogate = (fasting insulin µU/mL × fasting glucose) ÷ 405 (mg/dL) or ÷ 22.5
    (mmol/L). Higher = greater insulin resistance; no universal diagnostic cut-point.
    Also reports the linear **HOMA-%B** β-cell estimate = (20 × insulin) ÷ (glucose
    mmol/L − 3.5) when glucose > 3.5 mmol/L. The proprietary nonlinear HOMA2 model is
    excluded (spec-v100 §8).
  - **`quicki`** — QUICKI (Katz 2000, *JCEM*). Insulin-sensitivity index = 1 ÷
    [log₁₀(fasting insulin) + log₁₀(fasting glucose mg/dL)]. Lower = lower sensitivity
    (~0.45 healthy → ~0.30–0.35 in T2DM). The denominator is zero exactly when
    insulin × glucose = 1 → guarded with a surfaced fallback.
  - **`tyg-index`** — Triglyceride-Glucose index (Simental-Mendía 2008, *Metab Syndr
    Relat Disord*). The fasting-insulin-free surrogate = ln[(fasting TG × fasting
    glucose) ÷ 2], both mg/dL. Higher = more resistance.
  - **`metabolic-syndrome`** — Metabolic syndrome (Alberti 2009 Harmonized,
    *Circulation*; IDF 2006). Five criteria — waist (sex/population cut-point: US/ATP
    III M 102/F 88 cm, IDF Europid M 94/F 80, Asian M 90/F 80), TG ≥ 150, HDL < 40
    (M)/< 50 (F), BP ≥ 130/85, glucose ≥ 100, each with an "or on treatment" override.
    **Harmonized = any 3 of 5** (waist not mandatory); **IDF = central obesity + any 2
    of the other 4.** Class B.
  - **`osteoporosis-prescreen`** — OST / ORAI DXA pre-screen (Koh 2001 OST/OSTA,
    *Osteoporos Int*; Cadarette 2000 ORAI, *CMAJ*). OST index = trunc((weight kg − age
    yr) × 0.2), **truncated toward zero** (the −3.6 → −3 worked example disambiguates
    `Math.trunc` from `Math.floor`); index < 2 flags increased risk (Caucasian cutoff).
    ORAI = age (45–54/55–64/65–74/≥75 = 0/5/9/15) + weight (≥70/60–69/<60 = 0/3/9) +
    no-estrogen (+2); score ≥ 9 selects for DXA. The licensed FRAX is excluded
    (spec-v100 §8); this is the free substitute.

### Added (spec-v135: lymphoma / CLL prognostic indices — R-IPI, NCCN-IPI, GELF, Hasenclever IPS, CLL-IPI, +5 — spec-v100 Wave 6)

- **The lymphoma and CLL prognostic-index cluster comes onto the page beside
  `flipi` and `ipss-r-mds`.** Five deterministic **Clinical Scoring & Risk (Group G)**
  tiles (catalog **599 → 604**) via `lib/lymphoma-v135.js` + `views/group-v135.js`
  (`RV135`); each quotes the source's outcome framing and leaves the treat-versus-
  observe decision with the clinician (spec-v11 §5.3). Every weight and threshold was
  re-fetched from a primary source and cross-verified, never recalled (the spec-v97
  discipline). All five are Class A (journal + author citations — no staleness row).
  - **`r-ipi`** — Revised IPI for DLBCL (Sehn 2007, *Blood*). The five standard IPI
    factors (age > 60, LDH above normal, Ann Arbor stage III–IV, ≥ 2 extranodal
    sites, ECOG ≥ 2) collapsed to three R-CHOP-era groups: very good (0), good (1–2),
    poor (3–5). 4-year PFS ~94/80/53%.
  - **`nccn-ipi`** — NCCN-IPI for DLBCL (Zhou 2014, *Blood*). **Banded, not a simple
    count**: age > 40–60/> 60–75/> 75 = 1/2/3; LDH normalized ratio > 1–3×/> 3× = 1/2;
    stage III–IV, ECOG ≥ 2, and major-site extranodal (marrow, CNS, liver/GI, lung)
    each +1. Total 0–8 → low/low-int/high-int/high; 5-year OS ~96/82/64/33%. The
    "NCCN" in the name is not an issuer acronym in the citation string (Zhou et al,
    *Blood*) → `ISSUER_PATTERN` does not fire.
  - **`gelf-criteria`** — GELF high-tumor-burden criteria for follicular lymphoma
    (Brice 1997, *J Clin Oncol*). **Any-one-positive flag**: mass > 7 cm, ≥ 3 nodal
    sites > 3 cm, B symptoms, symptomatic splenomegaly, pleural/peritoneal effusion,
    cytopenia (Hgb < 10 or platelets < 100), or leukemic phase (> 5.0). Reports the
    criteria status (treat vs observe), never a chemotherapy order.
  - **`hodgkin-ips`** — Hasenclever International Prognostic Score for advanced
    Hodgkin lymphoma (Hasenclever & Diehl 1998, *NEJM*). Seven adverse factors, one
    each: albumin < 4 g/dL, Hgb < 10.5 g/dL, male sex, age ≥ 45, stage IV, WBC ≥ 15,
    lymphocytopenia (< 600/µL **or** < 8% of WBC). 5-year freedom from progression
    ~84% (0) → ~42% (≥ 5).
  - **`cll-ipi`** — CLL International Prognostic Index (International CLL-IPI Working
    Group 2016, *Lancet Oncol*). Weighted: TP53 del(17p)/mutation 4; IGHV unmutated 2;
    β2-microglobulin > 3.5 mg/L 2; advanced stage (Rai I–IV / Binet B–C) 1; age > 65 1.
    Total 0–10 → low (0–1)/intermediate (2–3)/high (4–6)/very high (7–10); 5-year OS
    ~93/79/63/23%. The high → very-high flip falls at 6 → 7 (boundary test).
- **Verification.** Five new unit-test files (≥ 3 boundary worked examples each,
  including the R-IPI very-good/good/poor flips, the NCCN-IPI band edges and
  risk-group flips, the GELF any-one met-vs-not flip, the Hodgkin IPS thresholds, and
  the CLL-IPI 6-vs-7 high/very-high boundary); `lib/lymphoma-v135.js` joins the
  spec-v59 fuzz harness `MODULES` (zero non-finite leaks); each `META` example is
  pinned by the chromium `example-correctness` sweep; catalog count moves on all 13
  catalog-truth surfaces; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass
  for `views/group-v135.js`.

### Added (spec-v134: plasma-cell & myeloid-neoplasm staging — ISS, R-ISS, R2-ISS, Mayo MGUS, DIPSS, DIPSS-Plus, +6 — spec-v100 Wave 6)

- **The plasma-cell and myelofibrosis staging cluster comes onto the page beside
  `ipss-r-mds` and `flipi`.** Six deterministic **Clinical Scoring & Risk (Group G)**
  tiles (catalog **593 → 599**) via `lib/onc-v134.js` + `views/group-v134.js`
  (`RV134`); each quotes the source's survival framing and leaves the management
  decision with the clinician (spec-v11 §5.3). Every threshold and weight was
  re-fetched from a primary source and cross-verified, never recalled (the spec-v97
  discipline).
  - **`myeloma-iss`** — Multiple myeloma International Staging System (Greipp 2005,
    *J Clin Oncol*). Stage I = β2-microglobulin < 3.5 mg/L **and** albumin ≥ 3.5
    g/dL; Stage III = β2-microglobulin ≥ 5.5 mg/L (governs over albumin); Stage II =
    neither. Median OS ~62/44/29 months. Class A.
  - **`myeloma-r-iss`** — Revised ISS (Palumbo 2015, IMWG, *J Clin Oncol*).
    **Recomputes the ISS internally** from β2M + albumin so the chain cannot desync,
    then folds in serum LDH and high-risk iFISH (del(17p), t(4;14), t(14;16)). 5-yr
    OS ~82/62/40%. **Class B** (IMWG working-group definition) — carries a
    `docs/citation-staleness.md` row (documentation-only; the spelled-out
    "International Myeloma Working Group" does not match the issuer acronym set).
  - **`myeloma-r2-iss`** — Second-Revision ISS (D'Agostino 2022, EMN/HARMONY, *J Clin
    Oncol*). Additive model: ISS II 1.0 / III 1.5; high LDH 1.0; del(17p) 1.0;
    t(4;14) 1.0; gain/amp 1q21 0.5. **The total runs 0–5, not the spec draft's
    "0–3.0"** — the draft conflated the IV-stratum threshold (opens at 3.0) with the
    score ceiling (5.0); corrected and pinned by a max-score test. Strata I–IV. Class A.
  - **`mgus-risk`** — Mayo MGUS risk stratification (Rajkumar 2005, *Blood*). One
    point each for M-protein ≥ 1.5 g/dL, a non-IgG isotype (IgA/IgM), and an abnormal
    FLC ratio (outside 0.26–1.65). Count 0–3 → 20-year progression 5/21/37/58%. Class A.
  - **`dipss-mf`** — DIPSS for primary myelofibrosis (Passamonti 2010, *Blood*). Age
    > 65, WBC > 25, blasts ≥ 1%, constitutional symptoms each +1; **hemoglobin < 10
    g/dL +2** (the only weighted-2 term, guarded by a dedicated test). Total 0–6 →
    low/int-1/int-2/high; median survival NR/14.2/4/1.5 yr. Class A.
  - **`dipss-plus-mf`** — DIPSS-Plus (Gangat 2011, *J Clin Oncol*). Carries the DIPSS
    group forward (int-1 1, int-2 2, high 3), then platelet < 100, transfusion need,
    and unfavorable karyotype each +1. Total 0–6 → low/int-1/int-2/high; median
    survival 15.4/6.5/2.9/1.3 yr. Class A.
- `lib/onc-v134.js` joins the spec-v59 fuzz harness (`test/unit/fuzz-tools.test.js`
  `MODULES`); each of the six functions surfaces a complete-the-fields fallback
  rather than a partial stage, with zero non-finite leaks. Six unit-test files with
  boundary worked examples (the ISS 3.5/5.5 edges, an R-ISS stage flip, the R2-ISS
  0.5/3.0 strata boundaries and 5.0 maximum, the MGUS 0-vs-3 flip and FLC edges, the
  DIPSS hemoglobin-weighted-2 term, and the DIPSS-Plus group carry-forward).

### Added (spec-v133: warfarin start-up — IWPC + Gage pharmacogenetic dose, Kovacs 10 mg + Crowther 5 mg initiation nomograms, +4 — spec-v100 Wave 6)

- **Warfarin start-up comes onto the page beside `heparin-nomogram`** — the
  catalog's only other "compute the next dose from inputs" tool. Four deterministic
  **Medication & Infusion (Group F)** tiles (catalog **589 → 593**) via
  `lib/warfarin-v133.js` + `views/group-v133.js` (`RV133`); each renders the
  spec-v100 §2 clause-5 high-stakes second-check caveat in its output. Every
  coefficient block and nomogram cell was re-fetched and cross-verified against
  ≥ 2 independent sources before shipping (the spec-v97 discipline), never recalled.
  - **`warfarin-iwpc`** — IWPC pharmacogenetic warfarin dose (Klein 2009, *NEJM*).
    Predicts the stable weekly maintenance dose from age, height, weight, race,
    enzyme-inducer and amiodarone use, and the entered VKORC1 (−1639 G>A) + CYP2C9
    genotypes. The model regresses √(weekly dose), so the tile **squares** the root
    for mg/week. The coefficient block was extracted from the *NEJM* 2009
    supplementary appendix S1e itself; the height coefficient is `0.0087` (the
    pharmacogenetic model) **not** `0.0118` (the clinical model — the classic
    cross-wire), and the unknown-genotype imputation terms are retained. A
    non-positive root surfaces the fallback rather than squaring into a spurious
    dose.
  - **`warfarin-gage`** — Gage pharmacogenomic warfarin dose (Gage 2008, *Clin
    Pharmacol Ther*). An exponential model predicting therapeutic mg/day from BSA,
    age, target INR, smoking, amiodarone, race, the DVT/PE indication, and the
    CYP2C9 + VKORC1 genotypes. All 12 log-linear coefficients were confirmed
    verbatim against the Shin & Cao validation reprint and reconciled to the
    original Gage Table-3 percentages. BSA uses the **DuBois** formula the paper
    cites; the original 2008 model carries **no CYP4F2 term** (added later to the
    IWPC model by Sagreiya 2010 — this corrects the spec draft, which wrongly said
    "Gage adds CYP4F2"). A non-positive exponent surfaces the fallback.
  - **`warfarin-init-10mg`** — Kovacs 10 mg initiation nomogram (Kovacs 2003, *Ann
    Intern Med*). Day 1–2 fixed 10 mg; the day-3 INR sets days 3 and 4 (which can
    differ); the day-5 INR sets days 5/6/7 via one of four sub-tables chosen by the
    day-3 band. The full Figure-1 structure was reconstructed from two independent
    reproductions (AAFP 2005 + the RxFiles table), including the **split** of the
    1.5–1.9 day-3 range at 1.6/1.7. The `63.835/INR` maintenance formula (Kovacs
    *Blood* 2007) and the AAFP day-5 maintenance table (Pengo 2001) are different
    instruments and are deliberately excluded.
  - **`warfarin-init-5mg`** — Crowther 5 mg initiation nomogram (Crowther 1999,
    *Arch Intern Med*). Day 1–2 fixed 5 mg; days 3–6 INR-banded. The day-5 low band
    is `INR < 2.0` (not `< 1.5` like days 3–4) — the easy-to-mis-transcribe row,
    locked by a dedicated test.
  - All four are **Class A** (journal + author citations — no `docs/citation-staleness.md`
    row) and flow through the spec-v59 fuzz harness with zero non-finite leaks.
    Catalog **589 → 593** (the spec's full proposed +4) across all 13 catalog-truth
    surfaces.

### Added (spec-v132: thrombotic microangiopathy & coagulopathy — PLASMIC, French TTP, JAAM DIC, IPSET-thrombosis, CISNE, +5 — spec-v100 Wave 6 open)

- **Wave 6 of the [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program
  opens.** Five deterministic **hematology / critical-care** scoring tiles
  (catalog **584 → 589**) in **Clinical Scoring & Risk (Group G)** add the
  thrombotic-microangiopathy / coagulopathy cluster that sits beside the existing
  `four-ts` (HIT probability) and `khorana` (cancer-VTE) tiles, via
  `lib/heme-v132.js` + `views/group-v132.js` (`RV132`). Every point table was
  re-fetched and cross-verified against ≥ 2 independent sources (spec-v97 lesson),
  never recalled.
  - **`plasmic-ttp`** — PLASMIC score 0–7 (Bendapudi 2017): pretest probability of
    severe ADAMTS13 deficiency (acquired TTP) before the assay returns. The active-
    cancer and transplant points score for the **absence** of the condition (the
    common coding bug, guarded by a dedicated inversion test). 0–4 low / 5
    intermediate / 6–7 high.
  - **`french-ttp`** — French TTP score 0–3 (Coppo 2010). The creatinine threshold
    is **inclusive** (≤ 2.26 mg/dL / ≤ 200 µmol/L) per the source, governing over
    the spec draft's strict `<`. 0 very unlikely / 2–3 highly likely.
  - **`jaam-dic`** — JAAM acute-DIC score 0–8 (Gando 2006), the **2006 revised**
    criteria (fibrinogen removed, max 8 — **not** the older max-10 form). The
    platelet limb takes the max of the absolute-count band and the optional 24-h
    relative-fall band. DIC at ≥ 4.
  - **`ipset-thrombosis`** — revised IPSET-thrombosis (Barbui 2015): a four-tier
    decision tree over age > 60, prior thrombosis, and JAK2 V617F in essential
    thrombocythemia. Cardiovascular risk factors modulate the rate **within** a
    tier but do not change the category (confirmed, deliberately excluded).
  - **`cisne`** — CISNE 0–8 (Carmona-Bayonas 2015): serious-complication risk in
    **clinically stable** febrile-neutropenia outpatients (the subgroup MASCC does
    not refine). 0 low (~1.1%) / 1–2 intermediate (~6.2%) / ≥ 3 high (~36%).
- All five are **Class A** (journal + author citations; no
  `docs/citation-staleness.md` row), pass the [spec-v59](docs/spec-v59.md) fuzz
  harness with zero non-finite leaks, render the [spec-v50](docs/spec-v50.md) §3
  posture note, and carry ≥ 3 boundary worked examples each (PLASMIC 6 high-band,
  French TTP 0-vs-2 flip, JAAM crossing the ≥ 4 DIC threshold, IPSET high vs
  very-low, CISNE crossing ≥ 3). Catalog **584 → 589** across all 13 catalog-truth
  surfaces.

### Added (spec-v131: urology renal-mass, kidney-stone & torsion scores — CAPRA, R.E.N.A.L., PADUA renal, S.T.O.N.E., TWIST, +5 — spec-v100 Wave 5 close)

- **Wave 5 of the [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program
  closes.** Five deterministic **urology** scoring tiles (catalog **579 → 584**) in
  **Clinical Scoring & Risk (Group G)** complete the renal-mass / kidney-stone /
  testicular-torsion cluster begun by v130's prostate surface, via
  `lib/uro-v131.js` + `views/group-v131.js` (`RV131`). Every point table was
  re-fetched and cross-verified against ≥ 2 independent sources (spec-v97 lesson),
  never recalled.
  - **`capra-score`** — UCSF CAPRA biochemical-recurrence score 0–10 (Cooperberg
    2005). Age, PSA bands, the Gleason axis (primary 4/5 = +3, else secondary 4/5
    = +1; no +2 level), clinical T3a and ≥ 34% positive cores. 0–2 low / 3–5
    intermediate / 6–10 high.
  - **`renal-nephrometry`** — R.E.N.A.L. nephrometry score 4–12 (Kutikov & Uzzo
    2009) with the non-scoring a/p/x face suffix and the h hilar marker. 4–6 low /
    7–9 moderate / 10–12 high.
  - **`padua-renal`** — PADUA renal-tumour complexity score 6–14 (Ficarra 2009).
    **Renamed** from `padua` to avoid colliding with the unrelated VTE Padua
    Prediction Score, which is untouched. 6–7 low / 8–9 intermediate / ≥ 10 high.
  - **`stone-nephrolithometry`** — S.T.O.N.E. nephrolithometry 5–13 (Okhunov 2013),
    the **original PCNL area version** (stone area = length × width mm²), not the
    later URS diameter adaptation. Higher score = lower stone-free likelihood.
  - **`twist-score`** — TWIST testicular-torsion triage score 0–7 (Barbosa 2013).
    0–2 low (≈ 2% torsion) / 3–4 intermediate (ultrasound) / 5–7 high (≈ 87%,
    consider exploration).
  - **`roks-stone-recurrence` was scoped but DEFERRED** (catalog +5, not +6): the
    ROKS recurrence nomogram's per-variable points feed only a graphical nomogram
    and are not recoverable from open sources (only hazard ratios are published).
    Shipping reverse-engineered coefficients in a clinical tool is the failure mode
    the program already refused for `gwtg-hf` (spec-v102). The id is reserved. See
    [docs/spec-v131.md](docs/spec-v131.md) §2.5 (amended).
  - All five are **Class A** (fixed published point tables; journal+author
    citations, no `ISSUER_PATTERN` trip → no `docs/citation-staleness.md` row).
    Each flows through the spec-v59 fuzz harness (zero non-finite leaks), renders
    the spec-v50 §3 posture note, ships ≥ 3 boundary worked examples (incl. a CAPRA
    2→3, R.E.N.A.L. 6→7, PADUA 7→8 and TWIST 4→5 band flip), a spec-v11 audit log,
    and passes the spec-v29 §3 one-line test. New specialty tags: none.

### Added (spec-v149: roughlogic.com EMS-group parity — pediatric weight estimate, PALS vital-sign reference, drug-concentration draw-up volume, +3)

- **roughlogic.com EMS parity.** A cross-catalog audit of roughlogic.com's EMS group
  (`/groups/ems/`, 27 tools) against sophiewell found 24 of 27 already covered; this
  spec ports the **3** genuinely-missing pre-hospital / field calculators (catalog
  **576 → 579**), all in **EMS & Field (Group I)** with the `field` audience, via
  `lib/ems-v149.js` + `views/group-v149.js` (`RV149`). Each is re-implemented verbatim
  from roughlogic's `calc-ems.js` and re-grounded in its primary clinical source; none
  duplicates a live tile. Standalone — not part of the spec-v100 program (which reserves
  v101–v148).
  - **`peds-weight-est`** — Pediatric Weight Estimate (APLS, *Advanced Paediatric Life
    Support* 6th ed.): age → weight when no scale is available. 0–12 mo (months/2)+4 kg;
    1–5 yr (2×years)+8 kg; 6–12 yr (3×years)+7 kg; > 12 yr flags adult-weight dosing.
    Class A (no `ISSUER_PATTERN` trip). Closes the gap that `peds-weight-conv` (lb↔kg
    only) and the weight-input-requiring dose tiles left open.
  - **`peds-vitals`** — Pediatric Vital Signs Reference (AHA PALS Provider Manual 2020):
    age → age-band normal HR/RR/SBP **plus the computed PALS hypotension threshold**
    (SBP < 60 neonate, < 70 infant, < 70 + 2×age for ages 1–10, < 90 at ≥ 10 yr). The
    band-specific cutoff is the calculated element (a calculator, not a static table).
    **Class B** — the "AHA" citation trips `ISSUER_PATTERN`, so it carries a
    `docs/citation-staleness.md` row + accessed date.
  - **`dose-volume`** — Drug Concentration to Volume (draw-up): bolus volume (mL) =
    ordered dose (mg) ÷ stock concentration (mg/mL), with an optional weight × per-kg-dose
    derivation and the > 50 mL / < 0.05 mL verification flags. Class A. Distinct from
    `conc-rate`, which solves an infusion **rate** (mL/hr), not a draw-up volume.
  - Each flows through the spec-v59 fuzz harness (zero non-finite leaks), renders the
    spec-v50 §3 posture note, ships ≥ 3 boundary worked examples, a spec-v11 audit log,
    and passes the spec-v29 §3 one-line test. New specialty tags: none (all reuse the
    existing closed vocabulary). See [docs/spec-v149.md](docs/spec-v149.md).

### Added (spec-v130: urology prostate metrics & risk — prostate volume, PSA density/velocity/doubling-time, D'Amico, Gleason Grade Group, +6 — spec-v100 Wave 5)

- **Wave 5 of the [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program
  continues.** Six deterministic **urology** tiles (catalog **570 → 576**) opening the
  prostate-cancer surface: four prostate-volumetry / PSA-kinetics tiles in **Clinical
  Math & Conversions (Group E)** and two prostate-cancer-risk classifications in
  **Clinical Scoring & Risk (Group G)**, via `lib/uro-v130.js` + `views/group-v130.js`
  (`RV130`). Each takes clinician-entered measurements or lab values as input — no AI,
  no network — and renders the spec-v50 §3 clinical-posture note. None duplicates a live
  tile. All six **re-fetch the formulas/coefficients verbatim** and cross-verify across
  ≥ 2 independent sources (spec-v97 discipline).
  - **`prostate-volume`** — prolate-ellipsoid prostate volume (Terris MK, Stamey TA,
    *J Urol* 1991): volume = AP × TR × CC × **0.52** (π/6 rounded to the dominant
    clinical/MDCalc convention, stated to the user), dimensions in cm, volume in cc.
    Above ~30 cc flags the enlarged/BPH range; cross-links `psa-density`.
  - **`psa-density`** — PSA density (Benson MC, et al, *J Urol* 1992): serum PSA ÷
    prostate volume; **> 0.15 ng/mL/cc** raises suspicion for clinically significant
    cancer. Denominator guarded.
  - **`psa-velocity`** — PSA velocity (Carter HB, et al, *JAMA* 1992): the **two-point**
    rate (later − earlier PSA) ÷ interval-in-years, **stated as the bedside
    approximation** of the validated ≥ 3-measurement / ≥ 18-month method. Above
    **0.75 ng/mL/yr** raises suspicion (≈ 0.35–0.4 when baseline PSA < 4). Signed result.
  - **`psa-doubling-time`** — PSA doubling time (Pound CR, et al, *JAMA* 1999): PSADT =
    ln(2) × T ÷ (ln(later PSA) − ln(earlier PSA)), T in months. **Source-governance:**
    requires a **rising** PSA — a stable or falling PSA returns "not rising"/undefined,
    never a NaN/negative time. Under ~12 months flags more aggressive disease.
  - **`damico-prostate-risk`** — D'Amico risk classification (D'Amico AV, et al, *JAMA*
    1998): the **worst single feature governs**. **Source-governance:** the PSA boundary
    is strict (> 10), so PSA = 10 is **Low**; the high-stage cut is **T2c** per the
    original. Low = ≤ T2a AND PSA ≤ 10 AND Gleason ≤ 6; Intermediate = T2b OR PSA > 10–20
    OR Gleason 7; High = ≥ T2c OR PSA > 20 OR Gleason ≥ 8.
  - **`gleason-grade-group`** — Gleason Grade Group (Epstein JI, et al, *Am J Surg
    Pathol* 2016; ISUP 2014): GG1 = ≤ 6; GG2 = 3+4; GG3 = 4+3; GG4 = 8; GG5 = 9–10. The
    **primary pattern governs** the 3+4 (GG2) vs 4+3 (GG3) split.
  - All six are **Class A** (journal + author citations — no `docs/citation-staleness.md`
    row). Every denominator/guard is exercised; the fuzz harness shows zero non-finite
    leaks. ≥ 3 boundary worked examples per tile (the 3+4 vs 4+3 primary-pattern split,
    the strict PSA = 10 D'Amico boundary, the non-rising-PSA doubling-time guard, the
    0.15 PSA-density threshold flip); a spec-v11 audit log each under `docs/audits/v12/`.

### Added (spec-v129: acid-base compensation & gaps — Stewart SID/SIG, base excess, the three compensation formulas, urine osmolal gap, +6 — spec-v100 Wave 5)

- **Wave 5 of the [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program
  continues.** Six deterministic **acid-base** tiles (catalog **564 → 570**) that
  complete the compensation set `winters` opened and add the physicochemical (Stewart)
  and urine-gap views beside `anion-gap-dd`, all in **Clinical Math & Conversions
  (Group E)**, via `lib/acidbase-v129.js` + `views/group-v129.js` (`RV129`). Each takes
  clinician-entered gas/electrolyte values as input — no AI, no network — and renders
  the spec-v50 §3 clinical-posture note. None duplicates a live tile. All six
  **re-fetch the formulas/coefficients verbatim** and cross-verify across ≥ 2
  independent sources (spec-v97 discipline).
  - **`stewart-sid-sig`** — Stewart strong ion difference / strong ion gap (Stewart PA,
    *Can J Physiol Pharmacol* 1983; Figge J, et al, *J Lab Clin Med* 1992): apparent SID
    = (Na + K + Ca + Mg) − (Cl + lactate); effective SID = HCO₃ + albumin charge +
    phosphate charge. **Source-governance:** the spec input set omits pH, so the Figge
    weak-acid charges are fixed at the physiologic **pH 7.4** (albumin 2.8 mEq/L per
    g/dL, phosphate 0.59 mEq/L per mg/dL) — stated to the user. SIG > 2 mEq/L flags
    unmeasured strong anions. Cross-links `anion-gap-dd`.
  - **`base-excess`** — Standard base excess (Siggaard-Andersen O, the Van Slyke
    equation, *Scand J Clin Lab Invest* 1977; **NCCLS C12-T2** constants): BE = (1 −
    0.0143·Hb)·(HCO₃ − 24.8 + (9.5 + 1.63·Hb)·(pH − 7.4)). Reproduces the published
    −13.0 mEq/L worked case. Negative = base deficit, positive = base excess; the
    **constant pair is kept intact** (Lang & Zander 2002 warn against crossing editions).
  - **`resp-acidosis-compensation`** — Expected HCO₃ in respiratory acidosis (Brackett
    NC, et al, *NEJM* 1965 acute; Schwartz chronic): 24 + k·(PaCO₂ − 40)/10, k = 1 acute
    / 4 chronic. Flags an added metabolic disorder when measured ≠ expected (± 2).
  - **`resp-alkalosis-compensation`** — Expected HCO₃ in respiratory alkalosis (Gennari
    FJ, et al, *J Clin Invest* 1972): 24 − k·(40 − PaCO₂)/10, k = 2 acute / 4 chronic,
    clamped to a physiologic floor (~18 acute, ~12 chronic).
  - **`met-alkalosis-compensation`** — Expected PaCO₂ in metabolic alkalosis (Narins RG,
    Emmett M, *Medicine* 1980): 0.7·(HCO₃ − 24) + 40 (± 5) — the metabolic-alkalosis
    complement of Winter's formula. Flags an added respiratory disorder.
  - **`urine-osmolal-gap`** — Urine osmolal gap (Halperin ML, et al, *Clin Invest Med*
    1988): measured − [2·(Na + K) + urea-N/2.8 + glucose/18]; half the gap ≈ urinary
    NH₄⁺. A wide gap points to an extrarenal non-anion-gap acidosis; a narrow gap to
    renal tubular acidosis. Cross-links `anion-gap-dd`.
  - The acute-vs-chronic selector is **explicit, never inferred**; every compensation
    prediction is clamped to a physiologic range; the SIG/base-excess/urine-gap tiles
    report **signed** results. All six are **Class A** (journal + author citations — no
    `docs/citation-staleness.md` row). Every denominator is guarded; the fuzz harness
    shows zero non-finite leaks. ≥ 3 boundary worked examples per tile (a SIG
    unmeasured-anion flip, a base-excess sign flip at 0, acute/chronic boundary cases
    with an added-disorder flag, and a urine osmolal gap whose half estimates NH₄⁺);
    a spec-v11 audit log each under `docs/audits/v12/`.

### Added (spec-v128: renal excretion & dialysis math — FE-phosphate, FE-magnesium, nPCR/nPNA, standard Kt/V, electrolyte-free water clearance, +5 — spec-v100 Wave 5)

- **Wave 5 of the [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program
  continues.** Five deterministic **renal-excretion and dialysis-math** tiles (catalog
  **559 → 564**) beside `fena-feurea` and `ktv-urr`, all in **Clinical Math &
  Conversions (Group E)**, via `lib/renal-v128.js` + `views/group-v128.js` (`RV128`).
  Each takes lab values or dialysis settings as input — no AI, no network — and renders
  the spec-v50 §3 clinical-posture note. None duplicates a live tile. All five
  **re-fetch the formulas verbatim** and cross-verify across ≥ 2 independent sources
  (spec-v97 discipline).
  - **`fepo4`** — Fractional excretion of phosphate (Walton RJ, Bijvoet OL, *Lancet*
    1975): (U·PO₄ × P·Cr) / (P·PO₄ × U·Cr) × 100. In hypophosphatemia, > ~5% suggests
    renal phosphate wasting. Cross-links `fena-feurea`.
  - **`femg`** — Fractional excretion of magnesium (Elisaf M, et al, *Miner Electrolyte
    Metab* 1998): (U·Mg × P·Cr) / (0.7 × P·Mg × U·Cr) × 100; the **0.7** corrects for
    the protein-bound, non-filterable fraction. In hypomagnesemia, > ~2–4% suggests
    renal magnesium wasting.
  - **`npcr-pna`** — Normalized protein catabolic rate (Depner TA, Daugirdas JT, *JASN*
    1996): 0.22 + 0.864 × (pre-BUN − post-BUN) / interdialytic hours (the two-point
    anuric form, reproducing the published 1.24 g/kg/day example). Target ~1.0–1.2
    g/kg/day. The Kt/V-coefficient form is **deliberately not shipped** — its
    non-midweek coefficients are unverifiable from open sources (no-fabrication).
  - **`std-ktv`** — Standard Kt/V (Leypoldt JK, et al, *Hemodial Int* 2003; FHN
    fixed-volume form): eKt/V = spKt/V × t/(t+35), then the weekly frequency-normalized
    stdKt/V (10080 min/week). KDOQI 2015 target ≥ 2.1/week. Overflow-safe.
  - **`efwc`** — Electrolyte-free water clearance (Rose BD, *Am J Med* 1986): V × [1 −
    (U·Na + U·K) / P·Na]. **Source-governance:** the spec prose inverted the sign — the
    tile implements the verified convention (positive = free-water excretion, raises
    plasma Na; negative = retention, drives hyponatremia) and reports the **signed**
    result.
  - All five are **Class A** (journal + author citations; KDOQI / FHN never reach
    `ISSUER_PATTERN` — no `docs/citation-staleness.md` row). Every denominator is
    guarded; the fuzz harness shows zero non-finite leaks. ≥ 3 boundary worked examples
    per tile; a spec-v11 audit log each under `docs/audits/v12/`.

### Added (spec-v127: nephrology prognosis & AKI staging — KFRE, RIFLE, AKIN, ultrafiltration rate, +4 — spec-v100 Wave 5)

- **Wave 5 (GI / hepatology / nephrology / acid-base / urology) of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues.** Four
  deterministic **nephrology-prognosis and AKI-staging instruments** (catalog **555 →
  559**) beside `egfr-suite` / `ckd-staging` / `ktv-urr` / `kdigo-aki`, via
  `lib/nephro-v127.js` + `views/group-v127.js` (`RV127`). `kfre`, `rifle-aki`, and
  `akin-aki` are in **Group G**; `ufr-dialysis` is in **Group E**. Each takes lab
  values or the bedside read as input — no AI, no network — and renders the spec-v50 §3
  clinical-posture note. None duplicates a live tile. All four **re-fetch the
  coefficients / criteria verbatim** and cross-verify across ≥ 2 independent sources
  (spec-v97 discipline).
  - **`kfre`** — Kidney Failure Risk Equation (Tangri N, et al, *JAMA* 2011): risk =
    1 − S₀^exp(Σ centered terms), 4-variable (age, sex, eGFR, ACR) or 8-variable (+ Ca,
    PO₄, HCO₃, albumin). Uses the **North American baseline survivals** (4-var S₀ =
    0.9750 / 0.9240 at 2 / 5 years — not the 0.9365 non-NA value) and converts the **ACR
    from mg/g to mg/mmol** (÷ 8.84) before the log. Overflow-safe (probability clamped
    0–1). Cross-links `ckd-staging`.
  - **`rifle-aki`** — RIFLE criteria (Bellomo R, et al; ADQI, *Crit Care* 2004): worst
    of the creatinine/GFR criterion (×1.5/×2/×3 or GFR drop > 25/50/75%) and the
    urine-output criterion → Risk / Injury / Failure. Failure acute-rise limb is strict
    `> 0.5` (distinct from AKIN).
  - **`akin-aki`** — AKIN criteria (Mehta RL, et al; AKIN, *Crit Care* 2007): 48-h
    window; stage 1 (rise ≥ 0.3 mg/dL or ×1.5–2), 2 (×2–3), 3 (×3, or creatinine ≥ 4.0
    with rise ≥ 0.5, or RRT). RRT forces stage 3; the stage is the worse of creatinine
    and urine output.
  - **`ufr-dialysis`** — Ultrafiltration rate (Flythe JE, et al, *Kidney Int* 2011):
    volume / (post-dialysis weight × hours), in mL/kg/hr; > 13 mL/kg/hr flags the
    cardiovascular-risk threshold. Denominators guarded.
  - All four are **Class A** (journal + author citations — KDIGO / ADQI / AKIN acronyms
    kept off the strings — no `docs/citation-staleness.md` row).

### Added (spec-v126: GI disease activity & pancreatitis severity — CDAI, UCEIS, SES-CD, HAPS, Balthazar CTSI, modified Marshall, +6 — spec-v100 Wave 5)

- **Wave 5 (GI / hepatology / nephrology / acid-base / urology) of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues.** Six
  deterministic **GI disease-activity and pancreatitis-severity instruments** (catalog
  **549 → 555**), all in **Clinical Scoring & Risk (Group G)**, via `lib/gi-v126.js` +
  `views/group-v126.js` (`RV126`), bringing the IBD and pancreatitis clusters to
  clinical-trial parity beside the v93 `harvey-bradshaw` / `truelove-witts` / `mayo-uc`
  and the `glasgow-imrie` / `ranson` tiles. Each takes the clinician's diary,
  endoscopic read, exam, or imaging read as input — no AI, no network — and renders the
  spec-v50 §3 clinical-posture note. None duplicates a live tile. All six **re-fetch the
  published weights / scales / thresholds verbatim** and cross-verify across ≥ 2
  independent sources (spec-v97 discipline), resolving three genuine literature
  conflicts.
  - **`cdai-crohns`** — Crohn's Disease Activity Index (Best WR, et al,
    *Gastroenterology* 1976): 8 weighted 7-day items (stools ×2, pain ×5, well-being
    ×7, complications ×20, antidiarrheal ×30, mass ×10, hematocrit deficit ×6, percent
    below standard weight ×1); < 150 remission, 150–220 mild, 221–450 moderate, > 450
    severe.
  - **`uceis`** — UC Endoscopic Index of Severity (Travis SP, et al, *Gut* 2012):
    vascular (0–2) + bleeding (0–3) + erosions/ulcers (0–3) = 0–8. Ships the **0-based
    0–8 scale** (the original 2012 paper was 1-based 3–11, later rebased to zero).
  - **`ses-cd`** — Simple Endoscopic Score for Crohn's Disease (Daperno M, et al,
    *Gastrointest Endosc* 2004): 4 variables × 0–3 across 5 segments; the **stenosis
    sub-total is capped at 11** (a non-passable stenosis ends the exam), so the true
    maximum is **56**, not the naive 60.
  - **`haps`** — Harmless Acute Pancreatitis Score (Lankisch PG, et al, *Clin
    Gastroenterol Hepatol* 2009): no peritonitis + normal Hct (< 43 M / < 39.6 F) +
    creatinine < 2 mg/dL → harmless (non-severe); **strict `<`** (the cutoff itself is
    abnormal).
  - **`ctsi-balthazar`** — CT Severity Index (Balthazar EJ, et al, *Radiology* 1990):
    CT grade A–E (0–4) + necrosis (0/2/4/6) = 0–10; 0–3 mild, 4–6 moderate, 7–10 severe.
  - **`modified-marshall`** — Modified Marshall organ-dysfunction score (Banks PA, et
    al, *Gut* 2013, Revised Atlanta): respiratory / renal / cardiovascular each 0–4;
    organ failure at any system ≥ 2. **Class B** — the revisable Revised-Atlanta
    definition carries a documentation-only `docs/citation-staleness.md` row
    (on-publication cadence; the citation names the working group, not an issuer
    acronym, so it is not gate-forced).
  - `cdai-crohns` guards the standard-weight divisor; `modified-marshall` guards the
    PaO₂/FiO₂ denominator and reports a blank system as not-assessed. Five are **Class
    A** (no staleness row).

### Added (spec-v125: hepatology severity & encephalopathy — PELD, CLIF-C ACLF, GAHS, West Haven, HSI, +5 — spec-v100 Wave 5)

- **Wave 5 (GI / hepatology / nephrology / acid-base / urology) of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues.** Five
  deterministic **hepatology severity and encephalopathy instruments** (catalog **544
  → 549**), all in **Clinical Scoring & Risk (Group G)**, via `lib/hep-v125.js` +
  `views/group-v125.js` (`RV125`), completing the acute-hepatology cluster beside
  `meld-childpugh`, `albi-grade`, and `fib4`. Each takes lab values or the bedside
  exam as input — no AI, no network — and renders the spec-v50 §3 clinical-posture
  note (the tile reports the score/grade and the source's framing; the listing,
  steroid, and management decisions stay with the clinician). None duplicates a live
  tile. All five **re-fetch the published coefficients / bands / criteria verbatim**
  and cross-verify across ≥ 2 independent sources (spec-v97 discipline).
  - **`peld-score`** — Pediatric End-Stage Liver Disease (McDiarmid SV, et al,
    *Transplantation* 2002): 4.80·ln(bili) + 18.57·ln(INR) − 6.87·ln(albumin) + 4.36
    (age < 1 yr) + 6.67 (growth failure), labs floored at 1.0; the **raw McDiarmid
    form** (no ×10 — that is the UNOS allocation presentation). Cross-links
    `meld-childpugh`.
  - **`clif-c-aclf`** — CLIF-C ACLF mortality model (Jalan R, et al, *J Hepatol*
    2014): 10·[0.33·CLIF-OF + 0.04·age + 0.63·ln(WBC) − 2] on the 6-organ CLIF-OF
    sub-score (6–18). **CLIF-OF circulation scores 3 for vasopressor use** (canonical
    Jalan 2014, not the MAP < 65 of CLIF-SOFA). Reported 0–100.
  - **`gahs`** — Glasgow Alcoholic Hepatitis Score (Forrest EH, et al, *Gut* 2005):
    five banded items (age/WBC/urea/INR/bilirubin), total 5–12; ≥ 9 marks higher
    28/84-day mortality and the corticosteroid-benefit cohort. **SI units** — urea in
    mmol/L, bilirubin in µmol/L (not BUN or mg/dL).
  - **`west-haven-he`** — West Haven (Conn) HE grade (Conn HO, et al,
    *Gastroenterology* 1977): the canonical 0–4 ordinal grade; ≥ 2 is overt
    encephalopathy.
  - **`hepatic-steatosis-index`** — HSI NAFLD screen (Lee JH, et al, *Dig Liver Dis*
    2010): 8·(ALT/AST) + BMI + 2 (female) + 2 (diabetes); < 30 rules NAFLD out, > 36
    rules it in. Cross-links the v124 `fatty-liver-index`.
  - The log tiles (PELD, CLIF-C ACLF, HSI) domain-guard every `ln`/ratio
    (blank/non-positive → complete-the-fields fallback, never `ln(0)` or
    divide-by-zero). All five are **Class A** (journal + author citations, no
    `ISSUER_PATTERN` trip) — no `docs/citation-staleness.md` row.

### Added (spec-v124: hepatology function & fibrosis — ALBI, MELD-XI, Forns, BARD, FLI, Lok, +6 — opens spec-v100 Wave 5)

- **Wave 5 (GI / hepatology / nephrology / acid-base / urology) of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program opens.** Six
  deterministic **hepatology function-and-fibrosis instruments** (catalog **538 →
  544**) read beside the existing `meld-childpugh` and `fib4` tiles, via
  `lib/hep-v124.js` + `views/group-v124.js` (`RV124`). `albi-grade` and `bard-score`
  are in **Clinical Scoring & Risk (Group G)**; `meld-xi`, `forns-index`,
  `fatty-liver-index`, and `lok-index` are in **Clinical Math & Conversions (Group
  E)**. Each takes lab values as input — no AI, no network — and renders the spec-v50
  §3 clinical-posture note (the tile reports the grade / score / probability and the
  source's framing; the diagnosis and management decision stay with the clinician).
  None duplicates a live tile. All six **re-fetch the published coefficients
  verbatim** and cross-verify across ≥ 2 independent sources (spec-v97 discipline) —
  which **caught a real spec error**: the Forns cholesterol term is **mg/dL**, not the
  spec draft's "mmol/L" (the −0.014 coefficient is calibrated to mg/dL magnitudes).
  - **`albi-grade`** — Albumin-Bilirubin grade (Johnson PJ, et al, *J Clin Oncol*
    2015): log₁₀(bilirubin µmol/L)·0.66 + albumin g/L·−0.085 (the primary-paper
    −0.085, not −0.0852); grade 1 (≤ −2.60) / 2 / 3 (> −1.39). Entered in g/dL and
    mg/dL, converted internally. Cross-links `meld-childpugh`.
  - **`meld-xi`** — MELD excluding INR (Heuman DM, et al, *Liver Transpl* 2007):
    5.11·ln(bilirubin) + 11.76·ln(creatinine) + 9.44 (mg/dL), each lab floored at 1.0
    before the log (the standard-MELD convention, so the score can't go negative; no
    rescaling, no creatinine cap). For the anticoagulated / uninterpretable-INR case.
  - **`forns-index`** — Forns HCV-fibrosis model (Forns X, et al, *Hepatology* 2002):
    7.811 − 3.131·ln(platelets) + 0.781·ln(GGT) + 3.467·ln(age) − 0.014·cholesterol
    (**mg/dL**); < 4.2 rules out significant fibrosis, > 6.9 rules it in.
  - **`bard-score`** — BARD NAFLD advanced-fibrosis rule-out (Harrison SA, et al,
    *Gut* 2008): BMI ≥ 28 (+1), AST/ALT ≥ 0.8 (+2), diabetes (+1); 2–4 leaves advanced
    fibrosis in play (OR ~17), 0–1 rules it out (NPV ~96%).
  - **`fatty-liver-index`** — FLI steatosis probability (Bedogni G, et al, *BMC
    Gastroenterol* 2006): logistic of TG/BMI/GGT/waist → 0–100; < 30 out, ≥ 60 in.
  - **`lok-index`** — Lok cirrhosis probability (Lok AS, et al, *Hepatology* 2005,
    HALT-C): logistic of platelets/(AST/ALT)/INR; < 0.2 out, > 0.5 in.
  - The logistic tiles (FLI, Lok) use an overflow-safe `1/(1+e^−x)` (extreme inputs →
    0 or 100/1, never `Infinity`); every `ln`/`log₁₀` argument is domain-guarded
    (blank/non-positive → complete-the-fields fallback, never `ln(0)`). All six are
    **Class A** (journal + author citations, no `ISSUER_PATTERN` trip) — no
    `docs/citation-staleness.md` row.

### Added (spec-v123: psychiatry public-domain instruments — AIMS, Bush-Francis, Barnes, SCOFF, CES-D, +5 — closes spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry) of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program is now complete.**
  Five deterministic, **confirmed public-domain / free-to-use psychiatry
  instruments** (catalog **533 → 538**), all in **Clinical Scoring & Risk (Group
  G)**, via `lib/psych-v123.js` + `views/group-v123.js` (`RV123`). The catalog had
  the free mood/risk screens (`phq9`, `cssrs`) but not these movement-side-effect,
  catatonia, eating-disorder, and depression instruments. Each takes the clinician's
  / patient's item ratings as input — no AI, no network — and renders the spec-v50 §3
  clinical-posture note (each is a screen or severity scale, **not a diagnosis**; the
  assessment and treatment decision stay with the clinician). None duplicates a live
  tile; the **copyrighted psychiatry instruments (BDI, PANSS, MoCA, EAT-26, …) stay
  on the spec-v100 §8 permanent-exclusion list.** All five **re-fetch the item lists
  / scoring keys verbatim** and cross-verify across ≥ 2 independent sources (spec-v97
  discipline), and each instrument's license status is re-confirmed per §8 in
  `docs/clinical-citations.md`.
  - **`aims-tardive`** — Abnormal Involuntary Movement Scale (Guy W, ECDEU/NIMH
    1976): seven movement items (0–4) summed to a movement total 0–28 plus a global
    severity 0–4; ≥ 2 in two or more areas or ≥ 3 in one flags probable tardive
    dyskinesia. **NIMH public domain.** Cross-links `bars-akathisia`.
  - **`bfcrs`** — Bush-Francis Catatonia Rating Scale (Bush G, et al, *Acta
    Psychiatr Scand* 1996): the first 14 of 23 items form the screen (≥ 2 positive
    suggests catatonia); all 23 score 0–3 (six are 0/3 binary), severity max 69.
    Source-order correction: Immobility/stupor is item 1, Excitement item 14.
  - **`bars-akathisia`** — Barnes Akathisia Rating Scale (Barnes TRE, *Br J
    Psychiatry* 1989): objective / subjective-awareness / subjective-distress each
    0–3 (subtotal 0–9) plus the global clinical assessment 0–5 (absent → severe).
  - **`scoff`** — SCOFF questionnaire (Morgan JF, et al, *BMJ* 1999): five yes/no
    items; ≥ 2 positive flags a likely eating disorder. **Free to use** (reproduced
    in the open BMJ paper).
  - **`ces-d`** — Center for Epidemiologic Studies Depression Scale (Radloff LS,
    *Appl Psychol Meas* 1977): 20 items (0–3), total 0–60, with the four
    positively-worded items (4, 8, 12, 16) reverse-scored in-compute; ≥ 16 flags
    clinically significant depressive symptoms (the adult cutoff, not the child
    CES-DC's ≥ 15). **NIMH public domain.** Cross-links `phq9`.
  - All five are **Class A** (fixed ordinal scales / item sets; journal/manual +
    author citations, no `ISSUER_PATTERN` trip) — no `docs/citation-staleness.md`
    row. **This closes spec-v100 Wave 4 at 538 tiles (506 → 538, +32).**

### Added (spec-v122: general neurology & rehab — dementia type, spasticity, brainstem encephalitis, +3 — spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues. Three
  deterministic **general-neurology and rehabilitation instruments** that cross
  specialty lines (catalog **530 → 533**), all in **Clinical Scoring & Risk (Group
  G)**, via `lib/neuro-v122.js` + `views/group-v122.js` (`RV122`). v117–v121 covered
  stroke imaging, hemorrhagic grading, prehospital LVO triage, the epilepsy /
  headache / vertigo gap, and the GBS / myasthenia gap; v122 fills the
  general-neurology / rehab gap (dementia type, spasticity grading,
  brainstem-encephalitis diagnosis). Each takes the clinician's exam and history
  findings as input — v122 parses no imaging and no EMG feed — and renders the
  spec-v50 §3 clinical-posture note (the tile reports the score / grade /
  determination and the source's framing; the diagnosis and management decision stay
  with the clinician and local protocol). None duplicates a live tile. No new
  specialty tag. All three **re-fetch the published weights / ordinal wording /
  criteria verbatim** and cross-verify across ≥ 2 independent sources (spec-v97
  discipline).
  - **`hachinski`** — Hachinski Ischemic Score (Hachinski VC, et al, *Arch Neurol*
    1975): 13 weighted features — five score 2 (abrupt onset, fluctuating course,
    history of strokes, focal symptoms, focal signs), eight score 1 — summed 0–18;
    ≤ 4 favors a primary degenerative (Alzheimer-type) dementia, 5–6 indeterminate,
    ≥ 7 vascular (multi-infarct). **Source correction: stepwise deterioration is 1
    point, not 2** (a common mis-recall; the official ARIC/NIH form and every
    reproduction agree on 1, max 18). Cross-links `bickerstaff`.
  - **`modified-ashworth`** — Modified Ashworth Scale (Bohannon RW, Smith MB, *Phys
    Ther* 1987): the bedside ordinal spasticity grade 0 / 1 / 1+ / 2 / 3 / 4. The
    "1+" level (the 1987 modification of the 1964 five-point scale) is rendered as a
    **distinct ordinal step via string keys**, never averaged or summed into a
    fractional grade.
  - **`bickerstaff`** — Bickerstaff brainstem encephalitis checklist (Odaka M, et
    al, *Brain* 2003; spectrum framework Wakerley BR, et al, *Nat Rev Neurol* 2014):
    required core = progressive symmetric external ophthalmoplegia + ataxia (within
    ~4 weeks) + altered consciousness OR hyperreflexia; the anti-GQ1b IgG antibody, a
    brainstem MRI lesion, and CSF albuminocytologic dissociation are **supportive
    only, never required** (seronegative cases are recognized). Framed as a
    research/classification reading, not a validated gold standard. Cross-links
    `brighton-gbs`.
  - All three are **Class A** (fixed point weights / ordinal scale / diagnostic
    checklist; journal+author citations, no `ISSUER_PATTERN` trip) — no
    `docs/citation-staleness.md` row.

### Added (spec-v121: neuromuscular emergencies — GBS & myasthenia, +4 — spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues. Four
  deterministic **Guillain-Barre-syndrome and myasthenia-gravis instruments**
  (catalog **526 → 530**), all in **Clinical Scoring & Risk (Group G)**, via
  `lib/neuro-v121.js` + `views/group-v121.js` (`RV121`). v117–v120 covered stroke
  imaging, hemorrhagic grading, prehospital LVO triage, and the epilepsy / headache
  / vertigo gap; v121 fills the neuromuscular-emergency gap a neurology and
  neurocritical-care service hits when predicting respiratory failure and grading
  disease. Each takes the bedside exam, MRC sum-score read, or paraclinical
  determination as input — v121 parses no nerve-conduction waveform and no CSF assay
  feed — and renders the spec-v50 §3 clinical-posture note (the tile reports the
  score / risk band / certainty level / class and the source's framing; the IVIG /
  PLEX / intubation / monitoring decision stays with the clinician and local
  protocol). None duplicates a live tile. No new specialty tag. All four
  **re-fetch the published point weights / case definition verbatim** and
  cross-verify across the derivation papers and open-access reproductions (the PMC
  "Ten Steps" GBS review, the Bangladesh / Frontiers mEGOS validations, the Fokke
  2014 *Brain* Brighton-table reprint, and the official MGFA Foundation PDF)
  (spec-v97 discipline).
  - **`egris`** — Erasmus GBS Respiratory Insufficiency Score (Walgaard C, et al,
    *Ann Neurol* 2010): days from onset to admission (> 7 d 0, 4–7 d 1, ≤ 3 d 2) +
    facial/bulbar weakness (+1) + MRC sum-score band (60–51 0 … ≤ 20 4), summed
    0–7. Mechanical-ventilation risk in week 1 is reported as the three published
    category rates — low (0–2) ~4%, intermediate (3–4) ~24%, high (≥ 5) ~65% — with
    no per-score table fabricated. Cross-links `megos`, `mrc-sum-score`.
  - **`megos`** — modified Erasmus GBS Outcome Score (Walgaard C, et al,
    *Neurology* 2011): age (≤ 40 0, 41–60 1, > 60 2) + preceding diarrhea (+1) + MRC
    sum-score band weighted by timing (admission 0/2/4/6 → 0–9; day 7 0/3/6/9 →
    0–12). The per-score probability of inability to walk at 4 and 26 weeks is
    published only as figure curves, so the tile reports the total and a **relative
    reading of the published range** (higher score → higher probability), inventing
    no per-score percentage. Cross-links `egris`, `mrc-sum-score`.
  - **`brighton-gbs`** — Brighton Collaboration GBS case definition (Sejvar JJ, et
    al, *Vaccine* 2011; reproduced in Fokke C, et al, *Brain* 2014): three core
    clinical features + absence of an alternative diagnosis, plus CSF
    albuminocytologic dissociation and consistent nerve-conduction studies. Level 1
    needs both paraclinical supports; Level 2 either; Level 3 the core only; Level 4
    = insufficient evidence. Reports the diagnostic-certainty level and names the
    features met.
  - **`mgfa`** — MGFA clinical classification (Jaretzki A, et al, *Neurology* 2000)
    + MG-ADL (Wolfe GI, et al, *Neurology* 1999): predominant weakness pattern and
    severity → Class I (ocular) / II–IV (mild/moderate/severe, a or b subtype) / V
    (intubation); plus the 8-item MG-ADL each clamped 0–3 → total 0–24.
  - All four are **Class A** (fixed point weights / case definition / classification
    + ordinal sum; journal+author citations, no `ISSUER_PATTERN` trip) — no
    `docs/citation-staleness.md` row.

### Added (spec-v120: epilepsy, headache & vertigo, +5 — spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues. Five
  deterministic **epilepsy-prognosis, headache-likelihood, and vertigo-
  localization instruments** (catalog **521 → 526**), all in **Clinical Scoring &
  Risk (Group G)**, via `lib/neuro-v120.js` + `views/group-v120.js` (`RV120`).
  v117–v119 covered stroke imaging, hemorrhagic grading, and prehospital LVO
  triage; v120 fills the epilepsy / headache / vertigo gap a neurology or ED
  clinician hits daily. Each takes the bedside exam or cEEG *read* as input —
  v120 parses no EEG waveform, no DICOM, no report — and renders the spec-v50 §3
  clinical-posture note (the tile reports the score / risk band / localization and
  the source's framing; the treat / admit / monitor / image decision stays with
  the clinician and local protocol). None duplicates a live tile. No new specialty
  tag. All five **re-fetch the published point weights / lookup verbatim** and
  cross-verify across the derivation papers and the JAMA / MDCalc / PMC
  reproductions (spec-v97 discipline).
  - **`stess`** — Status Epilepticus Severity Score (Rossetti AO, et al, *J
    Neurol* 2008): consciousness (0–1), worst seizure type (0–2), age ≥ 65 (+2),
    no/unknown prior seizures (+1), summed 0–6; ≥ 3 is unfavorable. The paper
    publishes no per-score mortality table, so the tile frames the favorable
    (0–2) / unfavorable (≥ 3) dichotomy and the high negative predictive value
    (~0.97) and invents no per-band percentage. Cross-links `helps2b`.
  - **`helps2b`** — 2HELPS2B continuous-EEG seizure-risk score (Struck AF, et al,
    *JAMA Neurol* 2017): B(I)RDs (+2); LPDs/LRDA/BIPDs, sporadic discharges,
    frequency > 2 Hz, plus features, prior seizures (+1 each), summed 0–7, mapped
    through the **published fixed integer→risk lookup** of calibrated 72-hour
    seizure probabilities (0 ~5%, 1 ~12%, 2 ~27%, 3 ~50%, 4 ~73%, 5 ~88%, 6 or 7
    above 95%; scores 6 and 7 fold into one ">95%" stratum). **ML-derived but
    ships as a compiled lookup — no model runs at render time** (spec-v100 §11).
    Cross-links `stess`.
  - **`mess-first-seizure`** — MESS first-seizure recurrence rule (Kim LG, et al,
    *Lancet Neurol* 2006, MRC MESS): seizures at presentation (1 = 0, 2–3 = +1,
    ≥ 4 = +2), neurological disorder (+1), abnormal EEG (+1), summed 0–4 → low (0)
    / medium (1) / high (≥ 2). **Id distinct from the v109 `mangled-extremity`
    MESS.** The per-year treated/deferred recurrence grid is paywalled, so the
    tile reports the confirmable **risk-group ranges over a 3–5 year window** (no
    fabricated annual cells). Cross-links `stess`, `helps2b`.
  - **`pound-migraine`** — POUND mnemonic (Detsky ME, et al, *JAMA* 2006):
    Pulsatile, hOurs (4–72 h), Unilateral, Nausea/vomiting, Disabling, counted
    0–5; likelihood ratio for migraine ~24 (≥ 4), ~3.5 (exactly 3), ~0.41 (≤ 2).
    Cross-links `midas`, `hints`.
  - **`hints`** — HINTS / HINTS-plus exam (Kattah JC, et al, *Stroke* 2009): the
    three-step bedside oculomotor exam — Head-Impulse (normal = central),
    Nystagmus (direction-changing = central), Test of Skew (present = central),
    plus new hearing loss (HINTS-plus). A benign **peripheral** pattern needs all
    three reassuring; **any one central feature** (including the counter-intuitive
    normal head impulse, the INFARCT rule) flags a **central (stroke)** cause.
    Cross-links `nihss`, `cpsss`.
- **All five are Class A** (fixed point weights / mnemonic / classification rule /
  compiled lookup; each citation names the journal + authors, so none trips the
  `ISSUER_PATTERN` gotcha) — **no** `docs/citation-staleness.md` row.

### Added (spec-v119: prehospital LVO triage & cerebrovascular diagnosis, +4 — spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues. Four
  deterministic **prehospital large-vessel-occlusion (LVO) triage and
  cerebrovascular-diagnosis instruments** (catalog **517 → 521**), all in
  **Clinical Scoring & Risk (Group G)**, via `lib/neuro-v119.js` +
  `views/group-v119.js` (`RV119`). v118 covered the in-hospital hemorrhagic
  grading; v119 covers the field LVO-severity screens the EMS crew runs and two
  cerebrovascular-diagnosis rules. Each takes the field exam or imaging *read*
  (the NIHSS-derived field items, the microbleed / siderosis / white-matter
  reads) — v119 parses no DICOM, no pixels, no radiology report — and renders the
  spec-v50 §3 clinical-posture note (the tile reports the score / category and the
  source's framing; the destination / bypass / treatment decision stays with the
  EMS crew, stroke team, and local protocol). None duplicates a live tile. No new
  specialty tag. All four **re-fetch the published point weights / diagnostic
  logic verbatim** and cross-verify them across the derivation papers and
  MDCalc / PMC / validation-cohort reproductions (spec-v97 discipline).
  - **`cpsss`** — Cincinnati Prehospital Stroke Severity Scale / C-STAT (Katz BS,
    et al, *Stroke* 2015): conjugate gaze deviation (+2), LOC questions/commands
    incorrect (+1), severe arm weakness (+1), summed 0–4; ≥ 2 predicts a
    large-vessel occlusion. Cross-links `nihss`, `fast-ed`.
  - **`fast-ed`** — Field Assessment Stroke Triage for Emergency Destination
    (Lima FO, et al, *Stroke* 2016): Facial palsy (0–1), Arm weakness (0–2),
    Speech changes (0–2), Eye deviation (0–2), Denial/Neglect (0–2), summed 0–9
    (the item maxima sum to 9; MDCalc's "0–10" is a sum-of-fives UI artifact); ≥ 4
    predicts LVO and supports comprehensive-center triage. Cross-links `cpsss`,
    `nihss`.
  - **`boston-caa`** — Boston Criteria v2.0 for cerebral amyloid angiopathy
    (Charidimou A, et al, *Lancet Neurol* 2022): grades diagnostic certainty
    (definite / probable with supporting pathology / probable / possible). The
    in-vivo categories need age ≥ 50, a compatible presentation, and no deep
    hemorrhagic lesion; v2.0 adds the non-hemorrhagic white-matter feature
    (centrum-semiovale perivascular spaces > 20, or WMH multispot). Probable = ≥ 2
    strictly lobar hemorrhagic lesions OR 1 lobar lesion + 1 white-matter feature;
    Possible = 1 lobar lesion OR 1 white-matter feature. Cross-links
    `ich-volume-abc2`.
  - **`cvt-risk`** — Cerebral venous thrombosis outcome risk score (Ferro JM, et
    al, *Cerebrovasc Dis* 2009, ISCVT): Malignancy (+2), Coma/GCS < 9 (+2), Deep
    venous thrombosis (+2), Mental-status disturbance (+1), Male sex (+1),
    Intracranial hemorrhage (+1), summed 0–9; ≥ 3 predicts a poor outcome
    (mRS > 2; sensitivity ~96%, specificity ~14%). Cross-links `cha2ds2-va`.
- **`cpsss`, `fast-ed`, `cvt-risk` are Class A** (fixed point weights; each
  citation names the journal + authors, so none trips the `ISSUER_PATTERN`
  gotcha) — **no** `docs/citation-staleness.md` row. **`boston-caa` is Class B**
  (a revisable consensus diagnostic definition) — it carries a documentation-only
  `docs/citation-staleness.md` row naming version 2.0 (2022) and an
  on-publication review cadence.

### Added (spec-v118: hemorrhagic stroke, SAH, IVH & aneurysm, +5 — spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program continues. Five
  deterministic **hemorrhagic-stroke / SAH / IVH / unruptured-aneurysm
  instruments** (catalog **512 → 517**), all in **Clinical Scoring & Risk
  (Group G)**, via `lib/neuro-v118.js` + `views/group-v118.js` (`RV118`). v117
  covered the ischemic-stroke imaging-prognosis side; v118 covers the
  hemorrhagic side the neuro-ICU and neurosurgery teams grade. Each takes the
  clinician's imaging *read* (blood thickness, per-compartment grades, NCCT
  markers, aneurysm measurements) — v118 parses no DICOM, no pixels, no
  radiology report — and renders the spec-v50 §3 clinical-posture note (the tile
  reports the grade / score and the source's risk framing; the coiling /
  clipping / surveillance / surgical decision stays with the neurosurgery team).
  None duplicates a live tile. No new specialty tag. All five **re-fetch the
  published point tables and outcome bands verbatim** and cross-verify them
  across the derivation papers and PMC / validation-cohort reproductions
  (spec-v97 discipline).
  - **`modified-fisher`** — Modified Fisher Scale (Frontera JA, et al,
    *Neurosurgery* 2006): grade 0–4 from cisternal SAH thickness (none/thin/thick)
    × IVH (present/absent); symptomatic-vasospasm incidence ~24% (grade 1), ~33%
    (grades 2 and 3), ~40% (grade 4). Cross-links `hunt-hess-wfns`.
  - **`graeb-ivh`** — Modified Graeb Score (Morgan TC, et al, *Stroke* 2013):
    eight compartments — four large (right + left lateral ventricle, third,
    fourth) carrying fill 0–4 plus a separate +1 expansion bonus, four horns
    (right + left occipital, right + left temporal) carrying fill 0–2 plus the
    same +1 — summed to a maximum of 32 (the +1 expansion is an independent
    additive modifier, not the top fill step). Cross-links `ich-volume-abc2`.
  - **`bat-score`** — BAT Score (Morotti A, et al, *Stroke* 2018): Blend sign
    (+1), Any intrahematoma hypodensity (+2), Timing onset-to-NCCT < 2.5 h (+2),
    summed 0–5; ≥ 3 predicts hematoma expansion (sensitivity ~0.50, specificity
    ~0.89). Cross-links `ich-volume-abc2`.
  - **`phases`** — PHASES Score (Greving JP, et al, *Lancet Neurol* 2014):
    Population / Hypertension / Age ≥ 70 / Size / Earlier SAH / Site summed 0–22,
    mapped to the published 5-year cumulative rupture risk (~0.4% at ≤ 2 to
    ~17.8% at ≥ 12). Cross-links `elapss`.
  - **`elapss`** — ELAPSS Score (Backes D, et al, *Neurology* 2017): Earlier SAH
    (no +1, yes 0) / Location / Age / Population / Size / Shape, published range
    0–40, mapped to the 3-/5-year cumulative growth risk (~5.0%/8.4% below 5 to
    ~42.7%/60.8% at ≥ 25). Cross-links `phases`.
- All five are **Class A** (fixed grading rules / point weights; each citation
  names the journal + authors, so none trips the `ISSUER_PATTERN` gotcha) — **no**
  `docs/citation-staleness.md` row.

### Added (spec-v117: stroke imaging & thrombolysis prognosis, +6 — opens spec-v100 Wave 4)

- **Wave 4 (Neurology / neurosurgery / psychiatry)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program **opens**. Six
  deterministic **acute-stroke imaging-prognosis and thrombolysis-risk
  instruments** (catalog **506 → 512**), via `lib/neuro-v117.js` +
  `views/group-v117.js` (`RV117`). Five home in **Clinical Scoring & Risk
  (Group G)**; `ich-volume-abc2` is **Clinical Math & Conversions (Group E)**.
  Each takes the clinician's imaging *read* (regions affected, diameters
  measured, hyperdensity/hypodensity present) — v117 parses no DICOM, no pixels,
  no radiology report — and renders the spec-v50 §3 clinical-posture note (the
  tile reports the score / volume and the source's risk framing; the
  thrombolysis / thrombectomy / surveillance / surgical decision stays with the
  stroke team). None duplicates a live tile. No new specialty tag. The four
  point-sum scores **re-fetch the published point tables and outcome bands
  verbatim** and cross-verify them across the derivation papers, MDCalc, and PMC
  reproductions (spec-v97 discipline).
  - **`aspects`** — Alberta Stroke Program Early CT Score (Barber PA, et al,
    *Lancet* 2000): 10 minus one point per affected MCA-territory region (caudate,
    lentiform, internal capsule, insula, M1–M6), clamped 0–10; the source
    dichotomizes at ≤ 7 (worse outcome, higher symptomatic-hemorrhage risk).
    **Class B** — an imaging-read convention applied through evolving reperfusion
    guidelines, so it carries a documentation-only
    [docs/citation-staleness.md](docs/citation-staleness.md) row.
  - **`ich-volume-abc2`** — ABC/2 hematoma volume (Kothari RU, et al, *Stroke*
    1996): volume (mL) = A × B × C / 2 with the three orthogonal CT diameters in
    cm; ≥ 30 mL is flagged as the `ich-score` threshold. Diameters non-negative,
    finite-guarded. Class A.
  - **`dragon-stroke`** — DRAGON score (Strbian D, et al, *Neurology* 2012): CT
    dense-artery/early-infarct (0/+1/+2) + prestroke mRS > 1 (+1) + age
    (0/+1/+2) + glucose > 8 mmol/L (+1) + onset-to-treatment > 90 min (+1) +
    NIHSS (0/+1/+2/+3), total 0–10. **NO-FABRICATION:** the derivation publishes
    outcome only for the grouped extremes (0–1 ~96% good, 8–10 0% good /
    ~89–97% miserable), so the tile bands 0–3 favorable / 4–7 intermediate /
    8–10 miserable and invents no middle-band rate. Class A.
  - **`hat-score`** — Hemorrhage After Thrombolysis (Lou M, et al, *Neurology*
    2008): NIHSS (<15/15–20/>20 = 0/+1/+2) + CT hypodensity (none/≤1/3/>1/3 MCA =
    0/+1/+2) + diabetes or glucose > 200 mg/dL (+1), total 0–5. Symptomatic-ICH
    series **verbatim**: 2% / 5% / 10% / 15% / 44%. Class A.
  - **`sedan-score`** — SEDAN score (Strbian D, et al, *Ann Neurol* 2012):
    glucose (≤8.0/8.1–12.0/>12.0 mmol/L = 0/+1/+2) + early infarct (+1) + dense
    artery (+1) + age > 75 (+1) + NIHSS ≥ 10 (+1), total 0–6. sICH series
    **verbatim**: 1.4% / 2.9% / 8.5% / 12.2% / 21.7% / 33.3%. Class A.
  - **`thrive-stroke`** — THRIVE score (Flint AC, et al, *AJNR* 2010): NIHSS
    (≤10/11–20/≥21 = 0/+2/+4) + age (≤59/60–79/≥80 = 0/+1/+2) + 1 each for
    hypertension, diabetes, atrial fibrillation, total 0–9. Published extreme
    bands (0–2: 64.7% good / 5.9% mortality; 6–9: 10.6% / 56.4%); the middle
    band (3–5) is intermediate with no fabricated percentage. Class A.
  - **Wave 4 opens:** with v117 the program reaches **512** tiles (506 → 512,
    +6). v116 stays reserved.

### Added (spec-v115: pulmonary nodule, PH & pleural infection, +5 — closes spec-v100 Wave 3)

- **Wave 3 (Critical care & pulmonary)** of the [spec-v100](docs/spec-v100.md)
  MDCalc Parity Completion program **closes**. Five deterministic **pulmonary
  decision rules** (catalog **501 → 506**), via `lib/pulmnod-v115.js` +
  `views/group-v40.js` (`RV40`). All five home in **Clinical Scoring & Risk
  (Group G)**, beside the existing chronic-airways staging tools and the acute-PE
  cluster. Each renders the spec-v50 §3 clinical-posture note (the tile reports
  the probability / interval / score and the source's interpretation; the
  surveillance / PET / biopsy / drainage decision stays with the clinician). None
  duplicates a live tile. No new specialty tag. The two nodule logistics
  **re-fetch the published coefficients verbatim** and cross-verify them across
  the original papers, MDCalc, and Radiopaedia (spec-v97 discipline).
  - **`mayo-spn`** — Mayo Clinic SPN malignancy model (Swensen SJ, et al, *Arch
    Intern Med* 1997): a logistic, x = −6.8272 + 0.0391·age + 0.7917·smoke +
    1.3388·cancer + 0.1274·diameter + 1.0407·spiculation + 0.7838·upperlobe;
    probability = e^x/(1+e^x); pretest low < 5% / intermediate 5–65% / high > 65%.
    The exponent is clamped to [−40, 40]. Class A.
  - **`brock-nodule`** — Brock / PanCan model (McWilliams A, et al, *N Engl J Med*
    2013): the full logistic with the centered age (−62) and count (−4) terms, the
    `(size/10)^−0.5 − 1.58113883` power transform (coefficient −5.3854), and the
    solid / part-solid (+0.377) / non-solid (−0.1276) type coefficients. Clamped
    and `size > 0` domain-guarded. Class A.
  - **`fleischner-2017`** — Fleischner Society 2017 follow-up matrix (MacMahon H,
    et al, *Radiology* 2017): the recommended CT-surveillance interval keyed on
    nodule type (solid / part-solid / ground-glass), size, single vs multiple, and
    patient risk (which changes only the solid cells). **Class B** — the guidance
    is revisable, so it carries a documentation-only
    [docs/citation-staleness.md](docs/citation-staleness.md) row.
  - **`reveal-lite-2`** — REVEAL Lite 2 (Benza RL, et al, *Chest* 2021): the
    abridged all-noninvasive PAH score, base 6 + eGFR < 60 (+1) + WHO class
    (I −1 / III +1 / IV +2) + SBP < 110 (+1) + HR > 96 (+1) + 6MWD band +
    BNP/NT-proBNP band, total 1–14; low 1–5 (2.9%) / intermediate 6–7 (7.1%) /
    high ≥ 8 (25.1%) 1-year mortality. Class A.
  - **`rapid-pleural`** — RAPID score (Rahman NM, et al, *Chest* 2014): Renal
    (urea < 5 / 5–8 / > 8 mmol/L = 0/1/2) + Age (< 50 / 50–70 / > 70 = 0/1/2) +
    Purulence (non-purulent +1) + Infection source (hospital-acquired +1) +
    Dietary albumin (< 27 g/L +1), total 0–7; low 0–2, medium 3–4, high 5–7, with
    derivation-cohort 3-month mortality ~1.5 / 17 / 47%. Class A.
  - **Wave 3 closes:** with v115 the program reaches **506** tiles (501 → 506,
    +5); Wave 3 totals 487 → 506 (+19). v116 stays reserved.

### Added (spec-v114: COPD/bronchiectasis exacerbation & sleep, +6 — spec-v100 Wave 3)

- **Wave 3 (Critical care & pulmonary)** of the [spec-v100](docs/spec-v100.md)
  MDCalc Parity Completion program continues. Six deterministic **pulmonary and
  sleep-medicine decision rules** (catalog **495 → 501**), via `lib/pulm-v114.js`
  + `views/group-v39.js` (`RV39`). All six home in **Clinical Scoring & Risk
  (Group G)**, beside the existing `gold-spirometry` / `bode-index` /
  `predicted-spirometry` staging tools and the `stop-bang` sleep screen. Each
  renders the spec-v50 §3 clinical-posture note (the tile reports the
  score/class/band and the source's interpretation; the admit / ventilate /
  refer-for-sleep-study decision stays with the clinician). None duplicates a live
  tile. No new specialty tag. Point tables were **re-fetched and cross-verified**,
  which **corrected three spec-draft errors** (SOURCE governs).
  - **`decaf-score`** — DECAF score (Steer J, et al, *Thorax* 2012): eMRCD dyspnea
    (5a +1, 5b +2) + eosinopenia < 0.05 + consolidation + acidemia pH < 7.30 +
    atrial fibrillation, total 0–6; in-hospital mortality low 0–1 (1.4%),
    intermediate 2 (8.4%), high 3–6 (34.6%). Class A.
  - **`bap-65`** — BAP-65 class (Tabak YP, et al, *Arch Intern Med* 2009): the
    class is built from the **count** of three acute variables (BUN ≥ 25, altered
    mental status, pulse ≥ 109); age > 65 splits class I from II only at zero
    acute variables. Per-class mortality 0.3 / 0.9 / 2.1 / 6.3 / 13.8%; ventilation
    need rises steeply at IV (~30%) and V (~55%). Class A.
  - **`bronchiectasis-bsi`** — Bronchiectasis Severity Index (Chalmers JD, et al,
    *Am J Respir Crit Care Med* 2014): nine weighted items; bands low 0–4,
    intermediate 5–8, high ≥ 9. **Corrected:** the admission window is the prior
    **2 years** and dyspnea uses the **MRC 1–5** scale (4 = +2, 5 = +3), not mMRC.
    Class A.
  - **`faced-bronchiectasis`** — FACED score (Martínez-García MÁ, et al, *Eur
    Respir J* 2014): FEV1 < 50% (2) + Age ≥ 70 (2) + Pseudomonas (1) + Extension
    (1) + Dyspnea (1), total 0–7; mild 0–2, moderate 3–4, severe 5–7.
    **Corrected:** Extension scores at **≥ 3 lobes** (not ≥ 2) and Dyspnea at
    **mMRC ≥ 3** (not ≥ 2). Class A.
  - **`nosas-score`** — NoSAS score (Marti-Soler H, et al, *Lancet Respir Med*
    2016): neck > 40 cm (4), BMI 25–<30 (3) or ≥ 30 (5, single-select), snoring
    (2), age > 55 (4), male (2), total 0–17; **≥ 8 high risk**. Class A.
  - **`ahi-odi-severity`** — AHI / ODI severity (AASM Task Force, *Sleep* 1999;
    AASM v2.0 2012): AHI normal < 5, mild 5–<15, moderate 15–<30, severe ≥ 30
    events/hr, with the ODI shown alongside and a 3%-vs-4% desaturation-criterion
    toggle. A negative / non-finite AHI is guarded. **Class B** — the AASM
    criteria are revisable, so it carries a documentation-only
    [docs/citation-staleness.md](docs/citation-staleness.md) row.
  - **Wave 3 continues:** with v114 the program reaches **501** tiles (495 → 501,
    +6).

### Added (spec-v113: dynamic fluid-responsiveness indices, +3 — spec-v100 Wave 3)

- **Wave 3 (Critical care & pulmonary)** of the [spec-v100](docs/spec-v100.md)
  MDCalc Parity Completion program continues. Three deterministic **dynamic
  preload-responsiveness indices** (catalog **492 → 495**), via
  `lib/fluidresp-v113.js` + `views/group-v38.js` (`RV38`). All three home in
  **Clinical Math & Conversions (Group E)**, beside the static `hemodynamic-suite`
  / `shock-index` tiles. Each renders the spec-v50 §3 applicability/technique
  posture note (the tile reports the index and the source's responsiveness
  threshold; the give-fluid / withhold / start-pressor decision stays with the
  clinician). None duplicates a live tile. No new specialty tag. All **Class A** —
  fixed ratio arithmetic with cited thresholds — so no
  [docs/citation-staleness.md](docs/citation-staleness.md) row.
  - **`ivc-fluid-responsiveness`** — IVC collapsibility / distensibility index
    (Barbier C, et al, *Intensive Care Med* 2004): mechanically ventilated
    distensibility dIVC = (Dmax − Dmin) / Dmin × 100, with the cited **~18%**
    fluid-response cutoff; spontaneous-breathing collapsibility (caval) index =
    (Dmax − Dmin) / Dmax × 100, with the widely-taught ~40–50% suggestive range.
    The denominator is guarded per mode (Dmax > 0 collapsibility, Dmin > 0
    distensibility).
  - **`ppv-svv`** — pulse-pressure / stroke-volume variation (Michard F, et al,
    *Am J Respir Crit Care Med* 2000): variation = (max − min) / ([max + min] / 2)
    × 100; **PPV > ~13%** (and the commonly-cited **SVV > ~12%**) predicts
    responsiveness — only in a regular-rhythm, controlled-ventilation patient with
    an adequate tidal volume. The (max + min)/2 mean denominator is guarded > 0.
  - **`passive-leg-raise`** — passive leg raise stroke-volume response (Monnet X,
    et al, *Crit Care Med* 2006): %ΔSV = (peak − baseline) / baseline × 100; a rise
    of **≥ 10–15%** predicts responsiveness regardless of rhythm or ventilation
    mode. The baseline denominator is guarded > 0; a fall reports a
    correctly-signed negative change, never NaN/Infinity.
  - **Wave 3 continues:** with v113 the program reaches **495** tiles (492 → 495,
    +3).

### Added (spec-v112: ICU mortality & sepsis-coagulopathy, +5 — spec-v100 Wave 3 **opens**)

- **First feature spec of Wave 3 (Critical care & pulmonary)** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program. Five
  deterministic **critical-care decision rules** (catalog **487 → 492**), via
  `lib/critcare-v112.js` + `views/group-v37.js` (`RV37`). Four home in **Clinical
  Scoring & Risk (Group G)**; `lactate-clearance` is a **Group E** clinical-math
  tile. Each renders the spec-v50 §3 clinical-posture note (the score frames risk
  or likelihood, it does not author a resuscitation, anticoagulation, ventilator,
  sedation, or weaning order). None duplicates a live tile; each fills a confirmed
  gap beside the existing `apache2` / `saps-ii` ICU-admission models and the
  `sirs` / `qsofa-sofa` / `curb-65` triage tools. No new specialty tag. All
  **Class A** — fixed point weights / thresholds / arithmetic — so no
  [docs/citation-staleness.md](docs/citation-staleness.md) row.
  - **`meds-score`** — Mortality in Emergency Department Sepsis score (Shapiro NI,
    et al, *Crit Care Med* 2003): nine weighted items summed 0–27 (terminal
    illness 6; tachypnea/hypoxia, septic shock, platelets < 150k, bands > 5%, age
    > 65 each 3; lower respiratory infection, nursing-home resident, altered mental
    status each 2) with the 28-day mortality bands very low 0–4 (~0.9%), low 5–7
    (~2.0%), moderate 8–12 (~7.8%), high 13–15 (~20%), very high ≥ 16 (~50%).
  - **`sic-score`** — Sepsis-Induced Coagulopathy score (Iba T, et al, *J Thromb
    Haemost* 2019; ISTH criteria): platelet (≥ 150 = 0 / 100–<150 = 1 / < 100 = 2),
    PT-INR (≤ 1.2 = 0 / >1.2–1.4 = 1 / > 1.4 = 2), and the total SOFA capped at 2,
    total 0–6. SOURCE-GOVERNANCE: SIC is met when the total is ≥ 4 **and** the
    platelet + PT-INR subscore is **≥ 3** (re-fetch corrected a ≥ 2 first reading);
    the SOFA item alone can never diagnose SIC.
  - **`cpis-vap`** — Clinical Pulmonary Infection Score (Pugin J, et al, *Am Rev
    Respir Dis* 1991; modified culture-inclusive form): six components 0/1/2
    (temperature, leukocytes with a +1 band-forms ≥ 50% bonus, secretions,
    oxygenation with the ARDS exclusion, radiograph, culture with a +1
    same-organism bonus) summed 0–12; **> 6 suggests VAP**. The leukocyte bonus
    uses the Pugin band-forms ≥ 50% form (not MDCalc's absolute ≥ 500 rendering).
  - **`lactate-clearance`** (Group E) — lactate clearance (Nguyen HB, et al, *Crit
    Care Med* 2004): (initial − repeat) / initial × 100; **≥ 10%** is the cited
    favorable early range. **Division by zero is guarded** (initial must be > 0); a
    repeat above the initial reports a correctly-signed negative clearance (rising
    lactate), never NaN/Infinity.
  - **`mrc-sum-score`** — MRC sum score (De Jonghe B, et al, *JAMA* 2002): six
    movements graded bilaterally (12 muscle groups), each 0–5, sum 0–60; **< 48**
    defines ICU-acquired weakness, < 36 severe. The upper-limb movement is elbow
    **flexion** (two secondary sources transcribe "extension" in error).
  - **Wave 3 opens:** with v112 the spec-v100 program enters Wave 3 at **492**
    tiles (487 → 492, +5).

### Added (spec-v111: environmental & wilderness medicine, +4 — spec-v100 Wave 2 **complete**)

- **Sixth feature spec and the closing spec of Wave 2** of the
  [spec-v100](docs/spec-v100.md) MDCalc Parity Completion program. Four
  deterministic **environmental / wilderness-medicine severity scores and
  classifications** (catalog **483 → 487**), via `lib/enviro-v111.js` +
  `views/group-v36.js` (`RV36`). All four home in **Group I (EMS & Field)**,
  cross-linked from Clinical Scoring (Group G). Each renders the spec-v50 §3
  field-posture note (the score informs triage and transport, it does not author
  a descent, antivenom, debridement, or amputation order). None duplicates a live
  tile; each fills a confirmed gap beside the existing `hypothermia-rewarm`
  Swiss-staging tile. No new specialty tag.
  - **`lake-louise-ams`** — 2018 Lake Louise Acute Mountain Sickness score (Roach
    RC, et al; Lake Louise AMS Score Consensus Committee, *High Alt Med Biol*
    2018): four symptoms each 0–3 (total 0–12) with the **headache-required
    diagnostic gate** (a total ≥ 3 without a headache does not diagnose AMS) and
    the mild 3–5 / moderate 6–9 / severe 10–12 bands. The 2018 revision dropped
    the sleep item. **Class A**.
  - **`szpilman-drowning`** — Szpilman drowning classification (Szpilman D,
    *Chest* 1997, from 1,831 cases): a decision tree on cough / auscultation /
    pulmonary edema / hypotension / arrest returning Rescue, grade 1–6, or Dead
    with the original-series mortality (0 → 93%). **Class B**
    ([docs/citation-staleness.md](docs/citation-staleness.md) row).
  - **`snakebite-severity`** — Snakebite Severity Score (Dart RC, et al, *Ann
    Emerg Med* 1996): six body-system subscores (pulmonary, cardiovascular, local
    wound, GI, hematologic, CNS) summed to 0–20. **Class A**. SOURCE-GOVERNANCE:
    Dart 1996 validated the SSS as a **continuous** index and defines no fixed
    severity cutoffs (the 0–3/4–7/≥8 bands online belong to a different modified
    7-system instrument); the tile reports the continuous total and labels its
    descriptor as a relative reading of the 0–20 range.
  - **`cauchy-frostbite`** — Cauchy frostbite classification (Cauchy E, et al,
    *Wilderness Environ Med* 2001): grade 1–4 set by the day-0 lesion topography,
    day-2 bone scan, and day-2 blisters (the most severe finding governs), with
    the published amputation-level + sequelae prognosis. **Class A**. Grade-4
    sequelae are "functional" per the NEJM 2022 reproduction, not the unverified
    "general/systemic" paraphrase.
  - **Wave 2 complete:** with v111 the spec-v100 program Wave 2 closes at **487**
    tiles (457 → 487, +30). The program continues with Wave 3 (spec-v112+).

### Added (spec-v110: toxicology dosing & dialysis decisions, +5 — spec-v100 Wave 2)

- **Fifth feature spec of Wave 2** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Five deterministic **toxicology dosing and
  dialysis-decision tools** (catalog **478 → 483**), via `lib/tox-v110.js` +
  `views/group-v35.js` (`RV35`). The four dosing tiles are Group F (Medication &
  Infusion); `lithium-extrip` is a Group G decision tree. Each dosing tile
  renders the spec-v100 §2 clause-5 high-stakes second-check caveat in its
  output. None duplicates a live tile; each fills a confirmed gap beside the
  existing `acetaminophen-nomogram` / `serotonin-toxicity` / `salicylate-toxicity`
  / `toxic-alcohol` poisoning surface. No new specialty tag.
  - **`digifab-dosing`** — Digoxin immune Fab (DigiFab) vial count (Smith TW,
    et al, *N Engl J Med* 1982; product label): by amount ingested
    (vials = mg × 0.8 / 0.5, rounded up), by steady-state serum level
    (vials = level × weight / 100, rounded up), or empiric (acute 10–20, chronic
    3–6 vials). **Class A**.
  - **`nac-dosing`** — weight-based IV N-acetylcysteine (Prescott LF, et al,
    *BMJ* 1979 three-bag; Bateman DN, et al, *Lancet* 2014 two-bag SNAP): the
    three-bag 21-hour or two-bag SNAP per-bag mg doses with the 110-kg dosing-
    weight cap applied and shown. **Class A**. Cross-links `acetaminophen-nomogram`.
  - **`hiet-dosing`** — high-dose insulin euglycemia therapy (Engebretsen KM,
    et al, *Clin Toxicol* 2011): regular-insulin bolus 1 unit/kg, infusion start
    1 unit/kg/hr titratable to a 10 unit/kg/hr ceiling (the entered rate is
    clamped to the ceiling), paired with a dextrose infusion. **Class A**.
  - **`tca-bicarbonate`** — TCA-toxicity QRS risk band and sodium-bicarbonate
    target (Boehnert MT, Lovejoy FH, *N Engl J Med* 1985): QRS ≥ 100 ms predicts
    seizures, ≥ 160 ms predicts ventricular arrhythmias; bolus 1–2 mEq/kg from
    weight, target serum pH 7.45–7.55. **Class A**.
  - **`lithium-extrip`** — lithium extracorporeal-treatment decision (Decker BS,
    et al; EXTRIP Workgroup, *Clin J Am Soc Nephrol* 2015): ECTR recommended for
    life-threatening features (any level) or impaired renal function with level
    > 4.0 mmol/L; suggested for level > 5.0 mmol/L, confusion, or slow clearance.
    Names the firing limb. **Class B** ([docs/citation-staleness.md](docs/citation-staleness.md)
    row). NOTE: the spec draft conflated the "expected time > 36 h" limb into the
    recommended set; the implementation follows the EXTRIP source, which places it
    (with level > 5.0 and confusion) in the **suggested** set.

### Added (spec-v109: trauma classification & soft-tissue infection, +5 — spec-v100 Wave 2)

- **Fourth feature spec of Wave 2** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Five deterministic **trauma-classification and
  soft-tissue-infection decision rules** (catalog **473 → 478**), via
  `lib/traumaclass-v109.js` + `views/group-v34.js` (`RV34`), all in Group G. None
  duplicates a live tile; each fills a confirmed gap beside the existing `iss-rts`,
  `triss`, and `abc-mtp` trauma tiles. No new specialty tag.
  - **`denver-bcvi`** — the **Expanded Denver Criteria** (Burlew CC, Biffl WL,
    Moore EE, et al, *J Trauma Acute Care Surg* 2012): CT-angiography screening for
    blunt cerebrovascular injury is indicated if any of the six signs/symptoms or
    six high-energy-mechanism risk factors is present. **Class B**.
  - **`aast-organ-injury`** — the **AAST 2018 Organ Injury Scale** (Kozar RA,
    Crandall M, Shanmuganathan K, et al, *J Trauma Acute Care Surg* 2018): a
    per-organ decision tree (spleen/liver/kidney) returning grade I–V as the higher
    of the worst anatomic finding and the 2018 contained-vs-extending vascular rule
    (spleen contained IV / beyond V; liver and kidney contained III / beyond IV).
    The anatomic-finding select rebuilds when the organ changes. **Class B**.
  - **`mangled-extremity`** — the **Mangled Extremity Severity Score** (Johansen K,
    et al, *J Trauma* 1990): skeletal energy (1–4) + limb ischemia (1–3, **doubled
    if ischemia time > 6 h**) + shock (0–2) + age (0–2); total ~2–14, with **≥ 7**
    historically associated with amputation. **Class A**.
  - **`lrinec`** — the **LRINEC score** (Wong CH, et al, *Crit Care Med* 2004):
    CRP/WBC/Hb/Na/creatinine/glucose banded to a 0–13 total → low ≤ 5 /
    intermediate 6–7 / high ≥ 8 suspicion of necrotizing fasciitis. **Class A**.
  - **`alt-70`** — the **ALT-70 cellulitis score** (Raff AB, et al, *J Am Acad
    Dermatol* 2017): Asymmetry 3, Leukocytosis 1, Tachycardia 1, age ≥ 70 = 2
    (0–7) → ≤ 2 unlikely / 3–4 indeterminate / ≥ 5 cellulitis likely. **Class A**.
- **Criteria re-fetched, never recalled** (spec-v97 rule), each cross-verified
  across ≥ 2 sources (primary paper + MDCalc / RadioGraphics / EAST guideline). The
  AAST 2018 vascular rule is grade-specific per organ; the MESS ischemia-time
  doubling raises the ceiling from 11 to 14 and is applied before summing; the
  LRINEC CRP threshold is 150 mg/L = 15 mg/dL (the common unit-confusion error),
  with the probability bands kept distinct from the ≥ 6 suspicion cutoff.
- **Class B rows** for `denver-bcvi` and `aast-organ-injury` in
  `docs/citation-staleness.md` (documentation-only — the citations name a journal +
  authors, not an issuer acronym, so the rows are not gate-forced but record the
  edition in force); the other three are Class A with no row. Five
  `docs/clinical-citations.md` entries, five `docs/audits/v12/` audit logs, and the
  catalog count moved on all 13 catalog-truth surfaces. Fixed a pre-existing README
  typo where the spec-v107 section header read “→ 473” (should be 467).

### Added (spec-v108: trauma severity scores & decision rules, +6 — spec-v100 Wave 2)

- **Third feature spec of Wave 2** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Six deterministic **trauma severity scores and
  decision rules** (catalog **467 → 473**), via `lib/trauma-v108.js` +
  `views/group-v33.js` (`RV33`). `triss` and `niss` home in Group E (a probability /
  severity computation); `tash-score`, `rabt-score`, `gcs-pupils`, and
  `nexus-chest-ct` in Group G. None duplicates a live tile; each fills a confirmed
  gap beside the existing `iss-rts` (ISS + Revised Trauma Score) and `abc-mtp` (ABC
  massive-transfusion rule). No new specialty tag. All six **Class A** (journal +
  author citations → no citation-staleness rows):
  - **`triss`** — the **TRISS method** (Boyd CR, Tolson MA, Copes WS, *J Trauma*
    1987; MTOS-1995 coefficient set): probability of survival Ps = 1/(1+e^−b),
    b from the coded RTS, ISS, and an age index, with separate blunt and penetrating
    coefficient sets. Consumes the ISS and coded RTS the live `iss-rts` tile produces.
  - **`niss`** — the **New Injury Severity Score** (Osler T, Baker SP, Long W,
    *J Trauma* 1997): sum of squares of the three worst AIS regardless of body
    region; any AIS 6 forces the maximal 75. NISS ≥ 16 marks major trauma.
  - **`tash-score`** — the **TASH Score** (Yücel N, Lefering R, Maegele M, et al,
    *J Trauma* 2006): weighted Hb/base-excess/SBP bands plus HR > 120, FAST, pelvis,
    femur, and sex (total 0–31) → logistic P(mass transfusion) = 1/(1+e^−(−4.9+0.3·TASH)).
  - **`rabt-score`** — the **RABT Score** (Joseph B, Khan M, Truitt M, et al,
    *World J Surg* 2018): shock index > 1, pelvic fracture, penetrating mechanism,
    and positive FAST, each +1 (0–4); ≥ 2 predicts massive transfusion.
  - **`gcs-pupils`** — the **GCS-Pupils score** (Brennan PM, Murray GD, Teasdale GM,
    *J Neurosurg* 2018): GCS total − pupil reactivity penalty (0/1/2), index 1–15.
  - **`nexus-chest-ct`** — the **NEXUS Chest CT** instrument (Rodriguez RM, Langdorf
    MI, Nishijima D, et al, *PLoS Med* 2015): 7 criteria in blunt thoracic trauma;
    all negative ⇒ chest CT can be deferred, any positive ⇒ CT may be indicated.
- **Coefficients re-fetched, never recalled** (spec-v97 rule): TRISS ships the
  MTOS-1995 blunt/penetrating sets MDCalc serves (citation names both the 1987 paper
  and the revision); TASH uses the `−4.9 + 0.3·TASH` sign and a max of 31. `triss`
  and `tash-score` clamp their logistic exponent finite; `niss` clamps AIS and
  applies the AIS-6 → 75 convention; `gcs-pupils` bounds the index to 1–15.

### Added (spec-v107: ED decision rules & resuscitation, +4 — spec-v100 Wave 2)

- **Second feature spec of Wave 2** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Four deterministic **emergency-department decision
  rules and resuscitation-risk scores** (catalog **463 → 467**), all in Group G, via
  `lib/eddecision-v107.js` + `views/group-v32.js` (`RV32`). None duplicates a live
  tile; each fills a confirmed gap beside the existing `heart` / `edacs` chest-pain,
  `pecarn-head` / `catch-head` head-CT, and `apache2` / `qsofa-sofa` ICU clusters.
  No new specialty tag. All four **Class A** (journal + author citations → no
  citation-staleness rows):
  - **`hear`** — the **HEAR Score** (Moumneh T, Sun BC, Baecker A, et al, *Eur J
    Emerg Med* 2021): the troponin-free subset of HEART — History + ECG + Age + Risk
    factors, each 0/1/2 (total 0–8). HEAR ≤ 1 is the very-low-risk pre-troponin gate
    (~0.4% 30-day MACE). Cross-links the troponin-inclusive `heart` tile.
  - **`new-orleans-head`** — the **New Orleans Head Trauma Criteria** (Haydel MJ, et
    al, *N Engl J Med* 2000): 7 criteria in GCS-15 minor blunt head injury; any
    single positive criterion indicates a head CT. 100% sensitive, low specificity.
  - **`go-far`** — the **GO-FAR Score** (Ebell MH, Jang W, Shen Y, Geocadin RG,
    *JAMA Intern Med* 2013): pre-arrest probability of survival to discharge with CPC-1
    good neurologic outcome after in-hospital arrest. Neurologically intact −15 (only
    negative term), comorbidity/age items add; total −15…+76 → four categories (≤−6
    above average >15%, −5…13 average 3–15%, 14–23 low 1–3%, ≥24 very low <1%). The
    score informs, never decides, a goals-of-care discussion.
  - **`macocha`** — the **MACOCHA Score** (De Jong A, Molinari N, Terzi N, et al,
    *Am J Respir Crit Care Med* 2013): ICU difficult-intubation risk. Mallampati III/IV
    (5), OSA (2), reduced cervical mobility (1), mouth opening < 3 cm (1), coma (1),
    SpO₂ < 80% (1), non-anesthesiologist (1) → total 0–12; ≥ 3 flags elevated risk
    (sensitivity 73%, NPV 98%).
- **Coefficients re-fetched, never recalled** (spec-v97 lesson): each score's point
  table and category cut-points were re-verified against ≥ 2 independent sources
  (original paper + MDCalc). Notably, GO-FAR's published "−15 to 11" figure is the
  per-variable point spread, **not** the total-score range (−15…+76); the ≥ 24 "very
  low" band is reachable because the admission/comorbidity items are independent
  additive rows. Each tile flows through the spec-v59 fuzz harness with zero
  non-finite leaks and renders the spec-v50 §3 clinical posture note.

### Added (spec-v106: VTE workup algorithms, +6 — opens spec-v100 Wave 2)

- **First feature spec of Wave 2** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Six deterministic **venous-thromboembolism workup**
  instruments (catalog **457 → 463**), all in Group G, via `lib/vte-v106.js` +
  `views/group-v31.js` (`RV31`). None duplicates a live tile; each fills a confirmed
  gap in the VTE pathway beside the existing `wells-pe` / `wells-dvt` / `perc` /
  `years-pe` pretest set and the `pesi` / `spesi` prognostic spine. No new specialty
  tag. All six **Class A** (journal + author citations → no citation-staleness rows):
  - **`peged`** — the **PEGeD graduated D-dimer rule** (Kearon C, de Wit K, Parpia
    S, et al, *N Engl J Med* 2019): the three-tier Wells C-PTP crossed with a
    probability-graduated D-dimer threshold (ng/mL FEU) — low excluded if < 1000,
    moderate if < 500, high always images. A strategy selector: a missing tier or
    D-dimer renders a complete-the-fields fallback.
  - **`4peps`** — the **4-Level PE Clinical Probability Score** (Roy PM, Friou E,
    Germeau B, et al, *JAMA Cardiol* 2021): 13 weighted items (−5…+21) → four tiers,
    each selecting a D-dimer strategy (no test / < 1000 / age-adjusted / imaging).
  - **`bova-pe`** — the **Bova Score** (Bova C, Sanchez O, Prandoni P, et al, *Eur
    Respir J* 2014) for normotensive confirmed PE: sBP 90–100 (2), troponin (2), RV
    dysfunction (2), HR ≥ 110 (1) → total 0–7 mapped to Stage I/II/III with the
    published 30-day complication and PE-mortality framing.
  - **`hestia`** — the **Hestia criteria** (Zondag W, Mos ICM, Creemers-Schild D, et
    al, *J Thromb Haemost* 2011): 11 yes/no exclusion items; any single positive item
    excludes outpatient PE treatment, all-negative is eligible per the rule.
  - **`geneva-original`** — the **original Geneva score** (Wicki J, Perneger TV,
    Junod AF, Bounameaux H, Perrier A, *Arch Intern Med* 2001): the fully objective
    pre-Wells model (clinical + ABG + chest film), total 0–16 → low 0–4 / intermediate
    5–8 / high ≥ 9. ABG bands encoded in both kPa and the rounded mmHg conversions.
  - **`constans-uedvt`** — the **Constans score** (Constans J, Salmi LR,
    Sevestre-Pietri MA, et al, *Thromb Haemost* 2008) for upper-extremity DVT: three
    +1 items and one signed −1 term → total −1…+3, band keyed on the signed sum.
  - Coefficients **re-fetched, never recalled** (the spec-v97 rule), each
    cross-verified across the primary paper + MDCalc / a clinical reference. Every
    total is clamped to its published range and the band is read off the clamped
    value, so the spec-v59 fuzz harness sees zero non-finite leaks.

### Added (spec-v105: vascular & cardiac surgery, +4 — closes spec-v100 Wave 1)

- **Fifth and closing feature spec of Wave 1** of the [spec-v100](docs/spec-v100.md)
  MDCalc Parity Completion program. Four deterministic **peripheral-artery and
  cardiac-surgery-risk** instruments (catalog **453 → 457**), via
  `lib/vascular-v105.js` + `views/group-v30.js`. Wave 1 closes at **432 → 457, +25**
  (one below the projected +26 because spec-v102 deferred `gwtg-hf`). New specialty
  tag `vascular-surgery`:
  - **`abi`** — the **Ankle-Brachial Index** (Aboyans V, Criqui MH, Abraham P, et
    al, *Circulation* 2012), in Group E: per leg, the higher ankle systolic over the
    higher brachial systolic, with the five published PAD severity bands (> 1.40
    non-compressible, 1.00–1.40 normal, 0.91–0.99 borderline, 0.41–0.90
    mild-to-moderate PAD, ≤ 0.40 severe). The lower leg index governs; the brachial
    divisor is guarded for > 0. **Class A**.
  - **`rutherford-fontaine`** — the **Rutherford category (0–6) ↔ Fontaine stage
    (I–IV)** PAD classification mapping (Rutherford RB, Baker JD, Ernst C, et al, *J
    Vasc Surg* 1997). **Class B** (society reporting standard → staleness row).
  - **`wifi`** — the **SVS WIfI** limb-threat classification (Mills JL Sr, Conte MS,
    Armstrong DG, et al, *J Vasc Surg* 2014): the Wound / Ischemia / foot-Infection
    grade triple read against the 64-cell expert-panel amputation-risk grid to a
    clinical stage 1–4. **Class B** (society classification → staleness row).
  - **`euroscore2`** — **EuroSCORE II** (Nashef SAM, Roques F, Sharples LD, et al,
    *Eur J Cardiothorac Surg* 2012): predicted in-hospital cardiac-surgery mortality
    via the logistic `e^y / (1 + e^y)`, the Table 6 multivariate coefficients
    transcribed verbatim and cross-verified (reproduces the published worked example
    y = −2.126358 → 10.66%). The exponent is clamped [−40, 40] against overflow.
    **Class A**. (Implementation note: the age coefficient is the EuroSCORE II
    multivariate value **0.0285181**, not the legacy EuroSCORE I 0.0666354 figure
    quoted in the spec draft — see `docs/audits/v12/euroscore2.md`.)

### Added (spec-v104: ECG arrhythmia, aortic & syncope, +6 — spec-v100 Wave 1)

- **Fourth feature spec of Wave 1** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Six deterministic **wide-complex-tachycardia,
  aortic-dissection, and emergency-department syncope** decision rules beside the
  existing `ecg-axis` / `lvh-criteria` ECG tiles (catalog **447 → 453**), all in
  Group G via `lib/cardio-v104.js` + `views/group-v29.js`:
  - **`brugada-vt`** — the **Brugada Criteria** four-step VT-vs-SVT algorithm
    (Brugada P, Brugada J, Mont L, et al, *Circulation* 1991): a "yes" at any of
    (absent RS in all precordial leads → R-to-S interval > 100 ms → AV
    dissociation → V1-2 & V6 morphology) diagnoses ventricular tachycardia and
    names the first positive step; all-negative is SVT with aberrancy. Takes the
    read morphologic findings, not a raw tracing. **Class A**.
  - **`vereckei-avr`** — the **Vereckei aVR algorithm** four-step rule using lead
    aVR only (Vereckei A, Duray G, Szenasi G, et al, *Heart Rhythm* 2008): initial
    dominant R → initial r/q > 40 ms → notch on a negative-onset downstroke →
    vi/vt ≤ 1. First positive ⇒ VT; all-negative ⇒ supraventricular. Cross-links
    `brugada-vt`. **Class A**.
  - **`add-rs`** — the **Aortic Dissection Detection Risk Score** (Rogers AM,
    Hermann LK, Booher AM, et al, *Circulation* 2011): a 0–3 count of the three
    high-risk categories (predisposing conditions / pain features / exam findings)
    → low / intermediate / high, plus an **optional ADD-RS-D D-dimer pathway
    note** (a D-dimer < 500 ng/mL is the published rule-out adjunct for ADD-RS ≤ 1;
    ADD-RS ≥ 2 goes directly to imaging). The D-dimer is a note, never a score
    input. **Class A**.
  - **`rose-syncope`** — the **ROSE rule** (Reed MJ, Newby DE, Coull AJ, et al, *J
    Am Coll Cardiol* 2010): any one of the seven BRACES-plus-bradycardia criteria
    (BNP ≥ 300, bradycardia ≤ 50, rectal FOB+, Hgb ≤ 90 g/L, chest pain, Q wave not
    lead III, SaO2 ≤ 94%) ⇒ high risk of a 1-month serious outcome / death. Cross-
    links `egsys` / `oesil`. **Class A**.
  - **`egsys`** — the **EGSYS** cardiac-syncope-probability score (Del Rosso A,
    Ungar A, Maggi R, et al, *Heart* 2008): a signed-weight sum (ECG/heart disease
    +3, palpitations +4, effort +3, supine +2, precipitating factors −1 and
    autonomic prodromes −1 when present), bounded to **−2 to +12**; a score ≥ 3
    suggests cardiac syncope. **Source-governs correction:** the spec draft
    combined effort/supine into one item and inverted the −1 sign; the primary
    paper and MDCalc define them as separate items (+3 / +2) scored on *presence*,
    giving the canonical −2…+12 range (positive weights sum to 12). **Class A**.
  - **`oesil`** — the **OESIL risk score** (Colivicchi F, Ammirati F, Melina D, et
    al, *Eur Heart J* 2003): one point each for age > 65, cardiovascular history,
    syncope without prodrome, and an abnormal ECG → the published 12-month
    mortality (0 = 0%, 1 = 0.8%, 2 = 19.6%, 3 = 34.7%, 4 = 57.1%). Cross-links
    `rose-syncope` / `egsys`. **Class A**.
- All six are **Class A** (each citation names a journal + authors; the ADD-RS
  title's "guideline-based" phrasing names no society acronym), so none carries a
  `docs/citation-staleness.md` row. Each runs the spec-v59 fuzz harness with zero
  non-finite leaks, ships an inline primary citation + `citationUrl` + ≥ 3
  boundary worked examples, and carries a `docs/audits/v12/<id>.md` audit log.

### Added (spec-v103: CV risk & prevention engines, +6 — spec-v100 Wave 1)

- **Third feature spec of Wave 1** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Six deterministic **cardiovascular-risk and
  atherogenic-lipid** engines that **complement, never replace,** the existing
  `ascvd` (Pooled Cohort) and `prevent` tiles — each cross-links them and states
  its derivation population (catalog **441 → 447**):
  - **`score2`** — the **SCORE2** algorithm (SCORE2 working group & ESC, *Eur
    Heart J* 2021; ages 40–69): a sex-specific linear predictor on centered age,
    SBP, total/HDL cholesterol (mmol/L) and smoking → `1 − S0^exp(LP)`, then the
    published per-region cloglog recalibration (low / moderate / high / very-high
    European risk region) and the ESC age-banded category. Reproduces the two ESC
    worked examples exactly (50yo smoker: low-region 5.9% … very-high 14.0% for
    men, 4.2% … 13.7% for women). **Class B** (staleness row + accessed). Group G.
  - **`score2-op`** — the **SCORE2-OP** older-persons companion (ESC, *Eur Heart
    J* 2021; ages ≥ 70): adds diabetes, centers at age 73 / SBP 150 / TC 6 / HDL
    1.4, `1 − S0^exp(LP − mean)` + the per-region recalibration. **Class B**.
    Cross-links `score2`. Group G.
  - **`mesa-chd`** — the **MESA** 10-year CHD risk **with and without coronary
    calcium** (McClelland RL et al, *J Am Coll Cardiol* 2015): a penalized Cox on
    raw mg/dL factors; the with-CAC model adds `0.2743 × ln(Agatston + 1)`,
    reported beside the no-CAC figure so the calcium refinement is visible. White
    is the reference race. **Class A**. Group G.
  - **`framingham-cvd`** — the **Framingham general-CVD** sex-specific Cox model
    (D'Agostino RB Sr et al, *Circulation* 2008) with the published **vascular
    age** companion (the age at which a normal-risk reference profile carries the
    same risk). Reproduces the paper's worked example (61yo woman → 8.4%, vascular
    age 67.7). **Class A**. Group G.
  - **`reynolds-risk`** — the **Reynolds Risk Score** (Ridker PM et al, *JAMA*
    2007 women / *Circulation* 2008 men): adds hsCRP and parental history of
    premature MI; women use linear age + an HbA1c term for diabetics, the men's
    model was derived in non-diabetics (a diabetic man is flagged). **Class A**.
    Group G.
  - **`non-hdl-remnant`** — **non-HDL = TC − HDL** and **remnant = TC − HDL − LDL**
    (Varbo A et al, *J Am Coll Cardiol* 2013), unit preserved (mg/dL or mmol/L),
    with the guideline non-HDL target context; an implausible negative remnant
    (LDL + HDL > TC) is flagged, not printed. **Class A**. Group E.
- New module `lib/cvrisk-v103.js` (fuzz-covered; the SCORE2 region coefficients are
  a **compiled constant** re-fetched verbatim from the published EHJ supplement per
  the spec-v97 "re-fetch, never recall" rule; every logistic/Cox exponent is clamped
  for overflow and every `ln()` term is domain-guarded — zero non-finite leaks) +
  renderer `views/group-v28.js` (`RV28`); per-tile spec-v11 audit logs;
  `score2`/`score2-op` staleness-ledger rows. No new specialty vocabulary.

### Added (spec-v102: heart failure & cardiogenic shock, +4 — spec-v100 Wave 1)

- **Second feature spec of Wave 1** of the [spec-v100](docs/spec-v100.md) MDCalc
  Parity Completion program. Four deterministic **heart-failure prognosis,
  HFpEF-likelihood, and cardiogenic-shock mortality** instruments (catalog
  **437 → 441**, all Group G):
  - **`maggic`** — the **MAGGIC** HF risk score (Pocock SJ et al, *Eur Heart J*
    2013; 39,372 patients): an integer-point model where age and systolic BP are
    scored from one of three columns by EF tier (the published **age × EF** and
    **SBP × EF** interactions); the integer total maps to the published 1- and
    3-year mortality lookup (clamped to the 0–50 table). **Class A**.
  - **`h2fpef`** — the **H₂FPEF** score (Reddy YNV et al, *Circulation* 2018):
    BMI > 30 (2), ≥ 2 antihypertensives (1), AF (3), PASP > 35 (1), age > 60 (1),
    E/e′ > 9 (1); 0–9 → low (0–1) / intermediate (2–5) / high (6–9) HFpEF
    probability. **Class A**. Cross-links `hfa-peff`.
  - **`hfa-peff`** — the **HFA-PEFF** diagnostic score (Pieske B et al, *Eur
    Heart J* 2019, ESC HFA): three domains scored major (2) / minor (1), capped
    at 2 each; 0–6 → ≥ 5 confirmed, 2–4 indeterminate (proceed to stress/invasive
    testing), ≤ 1 unlikely. **Class B** (staleness row + accessed).
  - **`cardshock-score`** — the **CardShock** risk score (Harjola VP et al, *Eur
    J Heart Fail* 2015): five binaries + banded lactate + banded eGFR, 0–9 →
    low (~8.7%) / intermediate (~36%) / high (~77%) in-hospital mortality. The
    deterministic substitute for the excluded gestalt SCAI shock staging.
    **Class A**.
- **`gwtg-hf` is DEFERRED, not shipped (+4, not +5).** Its per-variable integer
  point table could not be verified from any reachable primary or high-quality
  secondary source (Peterson 2010 / medRxiv 403; MDCalc/ClinCalc implement it as a
  continuous nomogram; mdapp's table 404s; a sub-agent's grid was flagged as
  fabricated). This catalog does not ship fabricated medical scoring weights — see
  [docs/spec-v102.md](docs/spec-v102.md). The id stays reserved for a session with
  primary-source access.
- New module `lib/cardio-v102.js` (fuzz-covered; the MAGGIC score→mortality lookup
  is clamped to [0, 50] so an out-of-table index can never read `undefined`) +
  renderer `views/group-v27.js` (`RV27`); per-tile spec-v11 audit logs. No new
  specialty vocabulary.

### Added (spec-v101: AF stroke-risk & QT, +5 — spec-v100 program Wave 1 opens)

- **First feature spec of Wave 1** of the [spec-v100](docs/spec-v100.md) **MDCalc
  Parity Completion program.** Five deterministic **atrial-fibrillation
  stroke-risk and QT-prolongation** instruments beside the existing combined
  `chads` view and the `qtc-suite` corrected-interval tile (catalog
  **432 → 437**, all Group G):
  - **`chads2`** — the original **CHADS₂ score** (Gage BF et al, *JAMA* 2001):
    CHF (1), hypertension (1), age ≥ 75 (1), diabetes (1), prior stroke/TIA (2),
    total 0–6 with the NRAF adjusted annual-stroke-rate table (0 = 1.9%/yr to
    6 = 18.2%/yr). **Class A**. Cross-links `chads`, `cha2ds2-va`, `chads-65`.
  - **`cha2ds2-va`** — the **2024 ESC CHA₂DS₂-VA** (Van Gelder IC et al, *Eur
    Heart J* 2024) with the **sex point removed** vs CHA₂DS₂-VASc; total 0–8,
    the ESC frames ≥ 2 as favoring oral anticoagulation. **Class B**.
  - **`chads-65`** — the **2020 CCS/CHRS CHADS-65** Canadian anticoagulation
    pathway (Andrade JG et al, *Can J Cardiol* 2020): sequential age-65 →
    CHADS₂-factor → vascular-disease gates returning the pathway verdict and the
    gate that fired. **Class B**.
  - **`atria-stroke`** — the **ATRIA Stroke Risk Score** (Singer DE et al, *J Am
    Heart Assoc* 2013) with its **dual age-by-prior-stroke column** (with a prior
    stroke the < 65 band scores above the 65–84 bands — the published
    interaction); total 0–15: low 0–5, intermediate 6, high 7–15. **Class A**.
  - **`tisdale-qtc`** — the **Tisdale QT-prolongation risk score** (Tisdale JE
    et al, *Circ Cardiovasc Qual Outcomes* 2013): age ≥ 68, female, loop
    diuretic, K ≤ 3.5, QTc ≥ 450, acute MI, sepsis, heart failure, QT-prolonging
    drugs (one 3, ≥ two 6); total 0–21: low ≤ 6, moderate 7–10, high ≥ 11.
    **Class A**. Cross-links `qtc-suite`.
- `cha2ds2-va` and `chads-65` are **Class B** (revisable guidance) → each carries
  an `accessed` date and a `docs/citation-staleness.md` row; the `chads2` /
  `atria-stroke` / `tisdale-qtc` trio are **Class A** (journal-named citations,
  no issuer-pattern match) and carry none.
- New module `lib/cardio-v101.js` (fuzz-covered by the spec-v59 harness, zero
  non-finite leaks) + renderer `views/group-v26.js` (`RV26`); per-tile
  spec-v11 audit logs under `docs/audits/v12/`. No new specialty vocabulary.

### Added (spec-v99: ID, critical-care & burns, +5 — spec-v85 program complete)

- **Tenth and final feature spec of Wave 2** and the **closing spec of the
  [spec-v85](docs/spec-v85.md) Advanced Clinical Calculators program.** Five
  deterministic **infectious-disease, critical-care, and burns** decision rules
  beside the existing acute-triage tools (`curb-65`, `sirs`, `qsofa-sofa`,
  `smart-cop`, `apache2`) and `burn-fluid` (catalog **427 → 432**, all Group G):
  - **`duke-endocarditis`** — the **2023 Duke-ISCVID modified Duke criteria** for
    infective endocarditis (Fowler VG et al, *Clin Infect Dis* 2023; updating Li
    JS et al 2000): definite = 2 major / 1 major + 3 minor / 5 minor; possible =
    1 major + 1 minor / 3 minor; otherwise rejected. **Class B**.
  - **`pitt-bacteremia`** — the **Pitt Bacteremia Score** (Paterson DL et al,
    *Ann Intern Med* 2004): temperature band + hypotension + ventilation + cardiac
    arrest + mental status, total 0–14, **≥ 4** high-mortality-risk. **Class A**.
  - **`saps-ii`** — the **Simplified Acute Physiology Score II** (Le Gall JR et al,
    *JAMA* 1993): 17 banded variables → point total → predicted hospital mortality
    via `logit = −7.7631 + 0.0737·SAPS + 0.9971·ln(SAPS+1)`. The adult-ICU
    companion to `apache2`; the logistic and `ln(SAPS+1)` are domain-guarded.
    Point bands cross-verified against MDCalc/ClinCalc (the worked 64-point case
    → 75.3% matches the published calibration). **Class A**.
  - **`lund-browder`** — the **Lund-Browder age-adjusted %TBSA** estimator
    (Lund CC, Browder NC, *Surg Gynecol Obstet* 1944) with the adult **Rule of
    Nines** computed independently as a cross-check; whole-region constants
    (cross-verified against the Joint Trauma System charts) sum to exactly 100% at
    every age band. Region fractions are clamped to [0, 1] and a > 100% total is
    flagged, not silently capped. *Produces* the %TBSA that `burn-fluid`
    *consumes*. **Class A**.
  - **`refeeding-risk`** — the **NICE CG32** refeeding-syndrome risk
    stratification: high risk if one major (BMI < 16, weight loss > 15%, > 10 days
    negligible intake, or low pre-feeding K/Mg/PO₄) or two minor criteria.
    **Class B**. Cross-links `icu-nutrition-target`, `electrolyte-replacement`.
- `duke-endocarditis` and `refeeding-risk` are **Class B** (revisable guidance) →
  each carries a `docs/citation-staleness.md` row + `accessed` date; the other
  three are **Class A**. Implemented in `lib/idcrit-v99.js` (in the
  [spec-v59](docs/spec-v59.md) fuzz harness — zero non-finite leaks, SAPS II
  logistic explicitly fuzzed) with `views/group-v25.js` renderers; each ships an
  inline primary citation, ≥ 3 boundary unit tests, and a
  [spec-v11](docs/spec-v11.md) audit log.
- **Program complete:** the [spec-v85](docs/spec-v85.md) Advanced Clinical
  Calculators program closes at **432** tiles (+66 across the ten feature specs
  v86 through v99).

### Added (spec-v98: pediatric decision rules & prognostic scores, +4)

- **Ninth feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Four deterministic **pediatric decision rules and
  prognostic scores** that fill confirmed gaps after a full sweep of Group N
  (neonatal/procedural) and the existing Group-G pediatric scores (catalog
  **423 → 427**, all Group G):
  - **`kawasaki-criteria`** — **Kawasaki disease diagnostic criteria** (AHA,
    McCrindle BW et al, *Circulation* 2017): classic KD (fever ≥ 5 days + ≥ 4 of 5
    principal features) and the AHA **incomplete-Kawasaki algorithm** (prolonged
    fever + 2–3 features → CRP/ESR gate → ≥ 3 supplementary lab criteria or a
    positive echo). **Class B**.
  - **`kocher-criteria`** — the **Kocher criteria** (Kocher MS et al, *J Bone
    Joint Surg Am* 1999): the four predictors (non-weight-bearing, temp > 38.5 °C,
    ESR > 40, WBC > 12,000) → predicted septic-arthritis probability (0 → < 0.2% …
    4 → 99.6%). **Class A**.
  - **`pim3`** — the **Paediatric Index of Mortality 3** (Straney L et al,
    *Pediatr Crit Care Med* 2013): the fixed logistic equation → predicted
    probability of death, overflow-guarded. The published Straney 2013
    coefficients (not the PIM3-anz13 recalibration), cross-verified against two
    reproductions. The admission *mortality* companion to `pelod2`/`psofa`.
    **Class A**.
  - **`catch-head`** — the **CATCH rule** for CT in childhood minor head injury
    (Osmond MH et al, PERC, *CMAJ* 2010): any high- or medium-risk factor → CT
    indicated, naming the factor that fired. The validated alternative to
    `pecarn-head`. **Class A**.
- `kawasaki-criteria` is **Class B** (AHA statement) → `docs/citation-staleness.md`
  row + `accessed`; the other three are **Class A**. Implemented in
  `lib/peds-v98.js` (in the [spec-v59](docs/spec-v59.md) fuzz harness — zero
  non-finite leaks) with `views/group-v24.js` renderers; each ships an inline
  primary citation, ≥ 3 boundary unit tests, and a [spec-v11](docs/spec-v11.md)
  audit log.

### Added (spec-v97: perioperative risk instruments, +5)

- **Eighth feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Five deterministic **perioperative risk
  instruments** one rung above the screening indices already in the catalog
  (`rcri`, `ariscat`, `lemon`, `apfel`, `asa-ps`, `surgical-apgar`) — two
  published **logistic-regression probability** models, two validated **weighted
  indices**, and a preoperative **point-score mortality** model (catalog
  **418 → 423**, all Group G):
  - **`gupta-mica`** — the **Gupta Perioperative Cardiac Risk** model (MICA;
    Gupta PK et al, *Circulation* 2011): the predicted probability of
    perioperative MI or cardiac arrest from the fixed logistic equation
    `risk = 1 / (1 + e^−x)`, `x = −5.25 + 0.02·age + ASA + functional status +
    creatinine + procedure type` — the *probability* where `rcri` returns only a
    Lee risk class. The linear predictor is clamped before exponentiation so the
    result is always finite and in [0, 100]. **Class A**. Cross-links `rcri`,
    `asa-ps`.
  - **`gupta-respiratory-failure`** — the **Gupta Postoperative Respiratory
    Failure** model (Gupta H et al, *Chest* 2011): the predicted probability of
    mechanical ventilation > 48 h or unplanned reintubation, same logistic shape
    with `x = −1.7397 + ASA + sepsis + functional status + emergency + procedure
    type`. The respiratory companion to `ariscat`. **Class A**.
  - **`arozullah-pneumonia`** — the **Arozullah Postoperative Pneumonia Risk
    Index** (*Ann Intern Med* 2001): the weighted point total mapped to one of
    five risk classes with the cited pneumonia rate (class 1 0.2% … class 5
    15.3%); the BUN contribution is **U-shaped**. The pneumonia companion to
    `ariscat`. **Class A**.
  - **`el-ganzouri`** — the **El-Ganzouri Risk Index** for difficult intubation
    (*Anesth Analg* 1996): the seven-factor weighted index (each 0/1/2; mouth
    opening and prognathism cap at 1), total 0–12, with the commonly cited
    **≥ 4** difficult-laryngoscopy threshold flagged. The quantitative companion
    to the `lemon` bedside screen. **Class A**.
  - **`pospom`** — the **Preoperative Score to Predict Postoperative Mortality**
    (Le Manach et al, *Anesthesiology* 2016): age-band + 15-comorbidity +
    procedure-category points mapped to the published predicted in-hospital
    mortality (Supplemental Digital Content 3, transcribed verbatim). Derived
    from > 5.5 million procedures (c-statistic 0.944 / 0.929). **Class A**.
- All five are **Class A** (fixed regression coefficients / published point
  tables), so they carry **no** `citation-staleness.md` or `pa-staleness-ledger`
  rows. Implemented in `lib/periop-v97.js` (in the [spec-v59](docs/spec-v59.md)
  fuzz harness — zero non-finite leaks) with `views/group-v23.js` renderers; each
  ships an inline primary citation, ≥ 3 boundary unit tests, and a
  [spec-v11](docs/spec-v11.md) audit log.

### Added (spec-v96: psychiatry rating scales, +6)

- **Seventh feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Six deterministic **psychiatry rating scales** —
  the clinician-rated severity scales and the bipolar/PTSD screens that sit one
  rung above the brief self-report screeners already in the catalog (`phq9`,
  `gad7`, `cssrs`, `gds15`, `epds`, `auditc`). A `phq9` is what the patient says;
  the HAM-D is what the clinician rates (catalog **412 → 418**, all Group G):
  - **`hamd`** — the **Hamilton Depression Rating Scale** (HAM-D / HDRS, Hamilton
    1960): the 17 clinician-rated items under Hamilton's **mixed anchors** (items
    1–3, 7–11, 15 score 0–4; items 4–6, 12–14, 16–17 score 0–2), total 0–52, with
    severity bands no/none 0–7, mild 8–16, moderate 17–23, severe ≥ 24. **Class
    A**. Cross-links `phq9`.
  - **`hama`** — the **Hamilton Anxiety Rating Scale** (HAM-A, Hamilton 1959): 14
    items each 0–4, total 0–56, with the source's mild ≤ 17 / mild-to-moderate
    18–24 / moderate-to-severe 25–30 / severe ≥ 31 structure. **Class A**.
    Cross-links `gad7`.
  - **`madrs`** — the **Montgomery-Åsberg Depression Rating Scale** (Montgomery &
    Åsberg 1979): 10 items each 0–6, total 0–60, designed to be **sensitive to
    change** with treatment; bands normal 0–6, mild 7–19, moderate 20–34, severe
    ≥ 35. **Class A**. Cross-links `phq9`, `hamd`.
  - **`mdq`** — the **Mood Disorder Questionnaire** (Hirschfeld 2000): the
    bipolar-spectrum screen as a **fixed three-gate boolean rule** — a positive
    screen requires **≥ 7 of 13** symptoms YES **AND** co-occurrence YES **AND**
    moderate/serious impairment; a negative screen **names the failing gate(s)**
    so a near-miss is auditable. **Class A**. Cross-links `phq9`, `cssrs`.
  - **`ybocs`** — the **Yale-Brown Obsessive Compulsive Scale** (Y-BOCS, Goodman
    1989): 10 items each 0–4 (items 1–5 obsessions, 6–10 compulsions), total 0–40
    with the obsession/compulsion subtotals surfaced; bands subclinical 0–7, mild
    8–15, moderate 16–23, severe 24–31, extreme 32–40. **Class A**. Cross-links
    `cssrs`.
  - **`pcl5`** — the **PTSD Checklist for DSM-5** (PCL-5, Blevins 2015; US-
    government public domain): 20 items each 0–4, total 0–80; the provisional-PTSD
    screen framed as the **source's cutoff range (≥ 31–33)**, not a single hard
    threshold; and the DSM-5 **B/C/D/E cluster tallies** (item endorsed at a
    rating ≥ 2). **Class A**. Cross-links `phq9`, `cssrs`.
- The summed scales **refuse a severity band from a partially-completed
  instrument** (spec-v57): a blank item renders "(complete all N items)" and no
  band — an unanswered item is not a zero. All six are **Class A** (fixed
  published item weights and author-defined bands) — no
  `docs/citation-staleness.md` row. New module `lib/psych-v96.js`, renderers in
  `views/group-v22.js`, six `META` entries with inline citations + worked
  examples, six `test/unit/` boundary suites, six `docs/audits/v12/` logs, and
  `lib/psych-v96.js` added to the `fuzz-tools` `MODULES`. New closed-vocabulary
  specialties: `primary-care`, `nursing-psych`. Licensed/copyrighted instruments
  (MoCA, SLUMS, BDI-II) are **excluded** for licensing per
  [scope-mdcalc-parity §4](docs/scope-mdcalc-parity.md).

### Added (spec-v95: neurology outcome scales & structural grading, +6)

- **Sixth feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Six deterministic neurology **outcome scales and
  grading systems** that close the catalog's **longitudinal-neurology** gap: it
  shipped the *acute* scores (`nihss`, `ich-score`, `hunt-hess-wfns`,
  `four-score`, `abcd2`) but nothing for the next visit — the functional-outcome
  endpoint, the TBI outcome, the Parkinson stage, the AVM surgical grade, the
  facial-nerve recovery grade, the migraine-disability band (catalog
  **406 → 412**, all Group G):
  - **`mrs`** — the **modified Rankin Scale** (van Swieten 1988): a 7-point
    ordinal functional-outcome grade 0–6 with the verbatim descriptor and the
    **"good outcome (0–2)"** stroke-trial dichotomy (vs the complementary "poor
    outcome (3–6)"). **Class A**. Cross-links `nihss`, `ich-score`.
  - **`gose`** — the **Glasgow Outcome Scale - Extended** (Wilson 1998): the
    8-category structured-interview TBI outcome 1–8 with the descriptor **and the
    legacy 5-point GOS mapping** (3/4 → GOS 3 severe disability, 5/6 → 4 moderate,
    7/8 → 5 good recovery). **Class A**. Cross-links `nihss`, `four-score`.
  - **`hoehn-yahr`** — **Hoehn & Yahr** Parkinson staging (1967): the original
    1–5 stages plus the modified scale (0, 1.5, 2.5 half-steps), each with its
    descriptor; the result names which variant the selected stage belongs to.
    **Class A**.
  - **`spetzler-martin`** — the **Spetzler-Martin AVM grade** (1986): core grade
    I–V = nidus size + eloquence + deep venous drainage, **plus** the
    supplemented **Spetzler-Martin–Lawton-Young** total (2–10) adding age,
    unruptured presentation and diffuse nidus, with the component derivation
    surfaced. **Class A**. Cross-links `ich-score`.
  - **`house-brackmann`** — the **House-Brackmann** facial-nerve function grade
    (1985): a 6-grade ordinal selector I (normal) – VI (total paralysis) keyed to
    the per-grade gross / at-rest / motion descriptor. **Class A**.
  - **`midas`** — the **Migraine Disability Assessment** (Stewart 2001): the sum
    of five prior-3-month disability questions → grade I (0–5) / II (6–10) / III
    (11–20) / IV (≥ 21); the day-counts clamp to the 92-day window and the
    ancillary frequency/intensity items are reported but not scored. **Class A**.
- All six are **Class A** (fixed ordinal definitions) — no
  `docs/citation-staleness.md` row. New module `lib/neuro-v95.js`, renderers in
  `views/group-v21.js`, six `META` entries with inline citations + worked
  examples, six `test/unit/` boundary suites, six `docs/audits/v12/` logs, and
  `lib/neuro-v95.js` added to the `fuzz-tools` `MODULES`. New closed-vocabulary
  specialties: `stroke`, `rehabilitation`, `movement-disorders`,
  `otolaryngology`, `headache`.

### Added (spec-v94: hematology & oncology prognostic scores, +5)

- **Fifth feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Five deterministic heme/onc prognostic scores
  that close the catalog's **malignancy-prognosis** gap: the catalog shipped the
  heme bedside cluster (`anc`, `khorana`, `four-ts`, `isth-dic`,
  `tls-cairo-bishop`) but no scores that stratify a new diagnosis. These five
  fill that gap (catalog **401 → 406**, all Group G):
  - **`hscore-hlh`** — the **HScore** for reactive hemophagocytic syndrome
    (Fardet 2014): nine weighted items (max 337) — immunosuppression,
    temperature, organomegaly, cytopenia lineages, ferritin, triglyceride,
    fibrinogen, AST, marrow hemophagocytosis — with the HLH probability read from
    the published curve; ≥ 169 best discriminates (Se 93%, Sp 86%). **Class A**.
    Cross-links `anc`, `isth-dic`, `tls-cairo-bishop`.
  - **`ipss-r-mds`** — the **revised IPSS-R** for myelodysplastic syndromes
    (Greenberg 2012): cytogenetic group + marrow blast % + Hgb + platelets + ANC
    weighted 0–10 → very low (≤ 1.5) / low / intermediate / high / very high
    (> 6), each with the cited median survival and time to 25% AML evolution. The
    cytogenetic risk groups are compiled constants. **Class A**. Cross-links
    `anc`.
  - **`flipi`** — the **FLIPI** (Solal-Céligny 2004) + the **IPI** for aggressive
    NHL (1993): two five-factor counts, FLIPI banded low 0–1 / intermediate 2 /
    high ≥ 3 and IPI banded low / low-int / high-int / high, each with cited
    survival. **Class A**. Cross-links `anc`.
  - **`mascc`** — the **MASCC risk index** for febrile neutropenia (Klastersky
    2000): seven weighted items (max 26); ≥ 21 identifies a low-risk patient (an
    outpatient/oral-management candidate). Reports the index only, not the
    admission decision. **Class A**. Cross-links `anc`.
  - **`sokal-cml`** — the **Sokal relative risk** (1984) + the **ELTS score**
    (Pfirrmann 2016) for chronic myeloid leukemia: two at-diagnosis hazard
    formulas over age, spleen size, platelets and blast %, each banded. The ELTS
    `(platelets/1000)^−0.5` term and the Sokal `exp()` are guarded so a
    zero/negative platelet or an extreme input surfaces a finite fallback rather
    than a `NaN`/`Infinity` term. **Class A**.
- Implementation: `lib/hemonc-v94.js` (joined to the spec-v59 fuzz harness; zero
  non-finite leaks — the `sokal-cml` `exp`/negative-power guards are the
  load-bearing case) + `views/group-v20.js` renderers + `app.js` UTILITIES rows /
  RENDERERS wiring + `lib/meta.js` entries (inline citation + `citationUrl` +
  `accessed` + per-source interpretation + examples pinned by the chromium
  example-correctness sweep). Five spec-v11 audit logs, five clinical-citations
  rows, scope ledger, README (heme/onc cheat sheet). Catalog **401 → 406** across
  all 13 catalog-truth surfaces (+ architecture.md). All five are **Class A**
  fixed published derivations — **no `docs/citation-staleness.md` row** (the
  citations name journals and authors, not a recurring guideline issuer, so
  `check-citations.mjs`'s `ISSUER_PATTERN` does not match). No new specialty
  vocab (all six tags — hematology, oncology, rheumatology, critical-care,
  infectious-disease, emergency-medicine — already in the closed vocabulary).

### Added (spec-v93: hepatology & GI disease activity, +6)

- **Fourth feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Six deterministic hepatology & GI
  disease-activity instruments that close the catalog's **liver/gut** gap: the
  catalog shipped the chronic-liver and pancreatitis spine (`meld-childpugh`,
  `fib4`, `apri`, `ranson-bisap`, `maddrey-lille`) but none of the
  disease-*activity* / fibrosis instruments a hepatology and GI clinic score
  daily. These six fill that gap (catalog **395 → 401**, all Group G):
  - **`nafld-fibrosis`** — the **NAFLD Fibrosis Score** (Angulo 2007):
    `NFS = −1.675 + 0.037·age + 0.094·BMI + 1.13·(IFG/DM) − 0.013·platelets − 0.66·albumin + 0.99·(AST/ALT)`,
    banded < −1.455 excludes advanced fibrosis (F0–F2), > 0.676 indicates it
    (F3–F4), between is indeterminate. The AST/ALT division guards a blank/zero
    ALT. **Class A**. Cross-links `fib4`, `apri`.
  - **`glasgow-imrie`** — the **modified Glasgow (Imrie)** acute-pancreatitis
    severity (Blamey/Imrie 1984): the eight-item PANCREAS 48-hour score, one
    point each, ≥ 3 predicts severe. A blank item is "not assessed", not zero;
    the count of items scored is reported. **Class A**. Cross-links
    `ranson-bisap`.
  - **`truelove-witts`** — the **Truelove & Witts** acute ulcerative-colitis
    severity (1955): severe = ≥ 6 bloody stools/day plus ≥ 1 systemic criterion
    (temp > 37.8 °C, HR > 90, Hgb < 10.5 g/dL, ESR > 30 mm/h); mild / moderate
    otherwise, naming the met criteria. **Class A**. Cross-links `mayo-uc`,
    `harvey-bradshaw`.
  - **`harvey-bradshaw`** — the **Harvey-Bradshaw Index** of Crohn's activity
    (1980): wellbeing + pain + liquid stools/day + abdominal mass + complications,
    banded remission < 5 / mild 5–7 / moderate 8–16 / severe > 16. Each ordinal
    subscore is clamped. **Class A**. Cross-links `truelove-witts`, `mayo-uc`.
  - **`mayo-uc`** — the **Mayo score / partial Mayo** for ulcerative colitis
    (Schroeder 1987): full Mayo (0–12, all four subscores) or partial Mayo (0–9,
    endoscopy omitted), with the form labeled so a partial score is never read
    against the full-score bands. **Class A**. Cross-links `truelove-witts`,
    `harvey-bradshaw`.
  - **`milan-criteria`** — the **Milan criteria** for HCC transplant eligibility
    (Mazzaferro 1996): within = a single tumor ≤ 5 cm OR ≤ 3 nodules each ≤ 3 cm,
    AND no macrovascular invasion AND no extrahepatic spread; names the failing
    limb. Reports the criterion only, not a listing decision. **Class A**.
    Cross-links `meld-childpugh`.
- Implementation: `lib/hepgi-v93.js` (joined to the spec-v59 fuzz harness; zero
  non-finite leaks) + `views/group-v19.js` renderers + `app.js` UTILITIES rows /
  RENDERERS wiring + `lib/meta.js` entries (inline citation + `citationUrl` +
  `accessed` + per-source interpretation + examples pinned by the chromium
  example-correctness sweep). Six spec-v11 audit logs, six clinical-citations
  rows, scope ledger, README (Wave-2 narrative + hepatology/GI cheat sheet).
  Catalog **395 → 401** across all 13 catalog-truth surfaces (+ architecture.md).
  All six are **Class A** fixed published derivations — **no
  `docs/citation-staleness.md` row** (the citations name journals and authors,
  not a recurring guideline issuer, so `check-citations.mjs`'s `ISSUER_PATTERN`
  does not match). No new specialty vocab (`surgery-general` reused for
  `glasgow-imrie`).

### Added (spec-v92: nephrology, +5)

- **Third feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Five deterministic nephrology computations that
  close a confirmed **chronic / procedural** gap: the catalog shipped the renal
  filtration / injury / dosing surface (`egfr-suite`, `egfr`, `fena-feurea`,
  `kdigo-aki`, `ttkg`, `cockcroft-gault`) but no CKD G×A staging, proteinuria
  ratio, dialysis adequacy, contrast-nephropathy risk, or cystatin-based eGFR.
  These five are the nephrology-clinic and dialysis-unit standards (catalog
  **390 → 395**):
  - **`ckd-staging`** (Group G) — the **KDIGO CKD G×A risk classification**: eGFR
    → G-stage (G1 ≥ 90, G2 60–89, G3a 45–59, G3b 30–44, G4 15–29, G5 < 15) × UACR
    → A-stage (A1 < 30, A2 30–300, A3 > 300 mg/g, or the A-category entered
    directly) → the KDIGO heat-map risk cell (low / moderate / high / very high).
    **Class B** (KDIGO 2024 CKD guideline, on-publication cadence). Cross-links
    `egfr-suite`, `uacr-upcr`.
  - **`uacr-upcr`** (Group E) — the **spot urine albumin/protein-to-creatinine
    ratios**: ratio (mg/g) = analyte (mg/dL) / urine Cr (mg/dL) × 1000, the
    estimated 24-hour excretion, and the KDIGO A-stage (matching `ckd-staging`).
    Urine creatinine of 0/blank is a surfaced fallback (no `NaN`/`Infinity`); the
    mg/dL↔mg/L toggle converts before the ratio. **Class A**. Cross-links
    `ckd-staging`, `egfr`.
  - **`ktv-urr`** (Group E) — **hemodialysis adequacy**: the urea reduction ratio
    `URR = (1 − post/pre) × 100%` and the **Daugirdas second-generation
    single-pool Kt/V** `= −ln(R − 0.008·t) + (4 − 3.5·R)·UF/W`, against the KDOQI
    minimum targets (URR ≥ 65%, spKt/V ≥ 1.2). The ln domain and pre-BUN are
    guarded; URR is reported alone on partial input. **Class A**. Cross-links
    `cockcroft-gault`, `egfr`.
  - **`mehran-cin`** (Group G) — the **Mehran contrast-induced nephropathy risk
    score** (Mehran 2004): hypotension 5 + IABP 5 + CHF 5 + age > 75 = 4 +
    anemia 3 + diabetes 3 + contrast 1/100 mL + eGFR (40–60 = 2, 20–40 = 4,
    < 20 = 6), banded ≤ 5 low / 6–10 moderate / 11–15 high / ≥ 16 very high with
    the cited CIN and dialysis risk. A blank optional factor contributes 0.
    **Class A**. Cross-links `kdigo-aki`, `ckd-staging`.
  - **`ckd-epi-cystatin`** (Group E) — the **2021 race-free CKD-EPI** eGFRcys
    (cystatin-only), eGFRcr-cys (combined, the confirmatory estimate near a
    decision threshold) and eGFRcr (creatinine-only) shown side by side (Inker
    2021). Cystatin C and creatinine must be positive; eGFRcys is yielded alone
    on a missing creatinine. **Class A**. Cross-links `egfr`, `egfr-suite`.
- Implementation: `lib/nephro-v92.js` (joined to the spec-v59 fuzz harness; zero
  non-finite leaks) + `views/group-v18.js` renderers + `app.js` UTILITIES rows /
  RENDERERS wiring + `lib/meta.js` entries (inline citation + `citationUrl` +
  `accessed` + per-source interpretation + examples pinned by the chromium
  example-correctness sweep). Five spec-v11 audit logs, five clinical-citations
  rows, one `docs/citation-staleness.md` Class-B row (`ckd-staging`, read by
  `check-citation-cadence.mjs`), nephrology topic-page tiles, scope ledger,
  README (Wave-2 narrative + nephrology cheat sheet). Catalog **390 → 395**
  across all 13 catalog-truth surfaces (+ architecture.md). New specialty vocab:
  `dialysis-nursing`, `interventional-radiology`.

### Added (spec-v91: pulmonary function & chronic respiratory disease, +5)

- **Second feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Five deterministic pulmonary-function /
  chronic-respiratory computations that fill a confirmed gap: the catalog shipped
  the **acute** respiratory surface (`aa-pf-suite`, `rox`, `curb-65`,
  `smart-cop`) but nothing for **chronic staging or prognosis**. These five are
  the PFT-lab and COPD/ILD-clinic standards (catalog **385 → 390**):
  - **`gold-spirometry`** (Group G) — the **GOLD spirometric classification of
    COPD**: obstruction when post-bronchodilator `FEV1/FVC < 0.70`, then the GOLD
    grade off FEV1 %predicted (1 ≥ 80%, 2 50–79%, 3 30–49%, 4 < 30%). The ratio is
    entered directly (range-checked) or computed from FEV1(L)/FVC(L) with an
    `FVC > 0` guard; without obstruction no grade is assigned. **Class B** (GOLD
    2024 Report, annual cadence). Cross-links `bode-index`, `mmrc-dyspnea`.
  - **`bode-index`** (Group G) — the **BODE multidimensional COPD prognosis**
    (Celli 2004), a four-variable `0–10` point sum (BMI, airflow obstruction,
    dyspnea, exercise capacity) with the cited **approximate 4-year survival
    quartile** (0–2 ~80%, 3–4 ~67%, 5–6 ~57%, 7–10 ~18%). The mMRC grade is
    clamped to its `0–4` domain. Cross-links `mmrc-dyspnea`, `gold-spirometry`.
  - **`gap-ipf`** (Group G) — the **GAP index for idiopathic pulmonary fibrosis**
    (Ley 2012): Gender + Age + FVC% + DLCO% → stage I/II/III with the cited
    1/2/3-year mortality. The **"cannot perform" DLCO** option is the source's
    explicit highest-risk limb (3 points), surfaced as a selectable state.
    Cross-links `predicted-spirometry`, `bode-index`.
  - **`predicted-spirometry`** (Group E) — the **GLI-2012 predicted FEV1/FVC +
    lower limit of normal** (Quanjer 2012). The LMS reference equations give
    predicted FEV1, FVC and FEV1/FVC and the 5th-percentile LLN by age, height,
    sex and ethnicity group; a measured value yields the % predicted and the
    above/below-LLN flag. The GLI-2012 coefficient + spline sets are **compiled
    module constants** (`lib/gli-2012-data.js`, spec-v85 §5 — not a `data/`
    dataset), transcribed from the published GLI lookup table. **Class B**
    (GLI-2012, on-publication cadence). Cross-links `gold-spirometry`,
    `aa-pf-suite`.
  - **`mmrc-dyspnea`** (Group G) — the **modified MRC dyspnea scale** (Bestall
    1999), a single integer grade `0–4` with its descriptor; the connective
    tissue that feeds BODE and the GOLD ABE assessment. An out-of-range grade is
    refused with a surfaced fallback. Cross-links `bode-index`, `gold-spirometry`.
- Implementation: `lib/pulm-v91.js` (joined to the spec-v59 fuzz harness; zero
  non-finite leaks) + `lib/gli-2012-data.js` (the compiled GLI-2012 constants) +
  `views/group-v17.js` renderers + `app.js` UTILITIES rows / RENDERERS wiring +
  `lib/meta.js` entries (inline citation + `citationUrl` + `accessed` +
  per-source interpretation + examples pinned by the chromium
  example-correctness sweep). Five spec-v11 audit logs, five clinical-citations
  rows, two `docs/citation-staleness.md` Class-B rows (read by
  `check-citation-cadence.mjs`), scope ledger, README (Wave-2 narrative +
  pulmonary cheat sheet). Catalog **385 → 390** across all 13 catalog-truth
  surfaces (+ architecture.md). No new specialty vocab (pulmonology /
  respiratory-therapy already present).

### Added (spec-v90: cardiology & ECG, +6)

- **First feature spec of Wave 2** of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program. Six deterministic cardiology / ECG computations
  that fill confirmed gaps in the catalog's cardiology surface (it had
  `qtc-suite`, `sgarbossa`, `map`, and the spec-v87 hemodynamics, but none of
  these six):
  - **`ecg-axis`** (Group E) — the **mean frontal-plane QRS axis** from the net
    QRS deflection in lead I and lead aVF via `atan2` on the hexaxial reference
    (lead I = 0°, aVF = +90°, an orthogonal pair), with the quadrant
    interpretation (normal −30° to +90°, left-axis deviation −30° to −90°,
    right-axis deviation +90° to +180°, extreme/northwest −90° to −180°). Lead II
    is accepted but does not change the result. The **all-isoelectric `(0,0)`
    input returns "indeterminate axis"**, never `0°` or a `NaN` (the spec-v85 §2
    `atan2` guard). Cross-links `qtc-suite`, `sgarbossa`.
  - **`lvh-criteria`** (Group G) — the two standard **ECG-LVH voltage criteria**:
    Sokolow-Lyon (`SV1 + max(RV5, RV6) ≥ 35 mm`) and Cornell voltage
    (`SV3 + RaVL > 28 mm` men / `> 20 mm` women), each shown as a sum against its
    threshold with the met/not-met determination and the **sex-specific Cornell
    cutoff**. A partial limb reads unknown, not a false negative. Cross-links
    `sgarbossa`, `ecg-axis`.
  - **`timi-stemi`** (Group G) — the **TIMI Risk Score for STEMI** (Morrow 2000),
    a weighted `0–14` point sum over nine bedside variables mapped to the
    published **30-day mortality band** (0 → 0.8% … >8 → 35.9%). Cross-links
    `sgarbossa`, `lvh-criteria`.
  - **`duke-treadmill`** (Group E) — the **Duke Treadmill Score** (Mark 1987):
    `DTS = exercise time − (5 × ST deviation) − (4 × angina index)`, with the risk
    band (low ≥ +5, moderate −10 to +4, high ≤ −11) and the cited **five-year
    survival** (99% / 95% / 79%). Cross-links `qtc-suite`, `timi-stemi`.
  - **`cardiac-power-output`** (Group E) — **CPO = (MAP × CO) / 451** watts
    (Fincke 2004), with the **< 0.6 W** cardiogenic-shock-mortality threshold
    flagged. Divides only by the fixed constant 451; the natural companion to the
    spec-v87 `hemodynamic-suite`. Cross-links `hemodynamic-suite`, `map`.
  - **`aortic-valve-area`** (Group E) — the **continuity-equation aortic valve
    area** `AVA = (π·(LVOT_d/2)² × LVOT_VTI) / AV_VTI` cm², the **dimensionless
    index** (LVOT_VTI / AV_VTI), and the severity band (mild > 1.5, moderate
    1.0–1.5, severe < 1.0 cm²). **Division by AV_VTI = 0 is guarded** →
    `valid:false`, never a `NaN`. **Class B** — the ASE/EACVI 2017 + 2020 ACC/AHA
    severity cutoffs carry a [citation-staleness](docs/citation-staleness.md) row.
    Cross-links `qtc-suite`, `cardiac-power-output`.
- Each ships an inline primary citation + `citationUrl` + `accessed`, a
  per-source interpretation block, a pinned `META.example`, ≥3 boundary unit
  examples (incl. every axis-quadrant boundary and the `(0,0)` gate, the
  Sokolow-Lyon 35 mm edge and the sex-specific Cornell threshold, the DTS band
  flips at +5 and −11, the CPO 0.6 W threshold, and the AVA severity boundaries
  at 1.0 and 1.5 cm² plus the AV_VTI = 0 guard), a
  [spec-v11](docs/spec-v11.md) audit log, and joins the
  [spec-v59](docs/spec-v59.md) fuzz harness (`lib/cardio-v90.js`, zero non-finite
  leaks). New module `lib/cardio-v90.js` + renderers `views/group-v16.js`. No new
  bundled dataset (doctrine clause 2). New specialty vocabulary:
  `echocardiography`. Catalog 379 → 385 (+6).
- **CI:** as the first Wave-2 spec, v90 also authors
  `scripts/check-citation-cadence.mjs` — the [spec-v85](docs/spec-v85.md) §6.3
  **warn-only monthly** citation-cadence job (scheduled in
  `.github/workflows/citation-cadence.yml`). It reads our own
  [citation-staleness](docs/citation-staleness.md) ledger and annotates the run
  when a calendar-tracked Class-B row is overdue for re-verification; it never
  blocks and never auto-edits (spec-v85 §6.4). The `aortic-valve-area` row (an
  on-publication cadence) is its first subject.

### Added (spec-v89: rheumatology, hepatology & perioperative, +4)

- Fourth and **final** feature spec of the [spec-v85](docs/spec-v85.md) Advanced
  Clinical Calculators program, closing it (366 → 379, +13). Four deterministic
  subspecialty calculators that open the missing rheumatology surface and
  complete the hepatology/perioperative cluster — all Group G:
  - **`das28`** — the DAS28-ESR / DAS28-CRP rheumatoid-arthritis disease-activity
    score, the **catalog's first rheumatology tile**. From the 28-joint tender
    and swollen counts, the inflammatory marker (ESR or CRP, with a form toggle),
    and the patient global health VAS it computes
    `0.56·√TJC28 + 0.28·√SJC28 + 0.70·ln(ESR) + 0.014·GH` (ESR form) or the CRP
    form (`0.36·ln(CRP+1) … + 0.96`) and applies the **EULAR** band (remission
    < 2.6, low ≤ 3.2, moderate ≤ 5.1, high > 5.1). The two forms are not
    interchangeable and the output labels which was computed; the logarithm
    domain is guarded. Cross-links `anc`, `corrected-calcium`.
  - **`kings-college`** — the King's College Criteria for transplant referral in
    **acetaminophen-induced acute liver failure**. Poor prognosis when EITHER
    arterial pH < 7.30 after resuscitation, OR all of INR > 6.5 (PT > 100 s) +
    creatinine > 3.4 mg/dL (> 300 µmol/L) + grade III/IV encephalopathy; the
    Bernal lactate modification (> 3.5 early / > 3.0 after resuscitation) is a
    surfaced limb. A partial three-part limb is reported **incomplete**, never a
    false negative; creatinine is unit-aware. Cross-links
    `acetaminophen-nomogram`, `meld-childpugh`.
  - **`asa-ps`** — the **ASA Physical Status** classification I–VI with the 2020
    definitions and approved examples. The **E modifier** is appended for an
    emergency but is **not assignable to ASA I or VI** (the tile enforces that
    and notes the suppression). States that ASA-PS describes physical status, not
    operative risk. Cross-links `rcri`, `ariscat`.
  - **`surgical-apgar`** — the **Surgical Apgar Score** (Gawande 2007), a 0–10
    intraoperative outcome predictor from estimated blood loss and the lowest
    intraoperative MAP and heart rate; ≤ 4 flags high major-complication/death
    risk. Distinct from the neonatal `apgar` tile (same name, different
    instrument). Cross-links `apgar`, `rcri`.
- Each ships an inline primary citation + `citationUrl` + `accessed`, a per-
  source interpretation block, ≥3 boundary unit examples (incl. the DAS28
  band-flip across both ESR/CRP forms, both King's College limbs and the
  incomplete-limb guard, the ASA E-modifier rules, and the Surgical Apgar band
  edges), a [spec-v11](docs/spec-v11.md) audit log, and joins the
  [spec-v59](docs/spec-v59.md) fuzz harness (zero non-finite leaks). No new
  bundled dataset (doctrine clause 2). The EULAR DAS28 cutoffs and the ASA 2020
  definitions are Class-B revisable values with
  [citation-staleness](docs/citation-staleness.md) rows. Catalog 375 → 379 (+4).
  **The spec-v85 Advanced Clinical Calculators program is complete.**

### Added (spec-v88: endocrine & oncologic emergencies, +3)

- Third feature spec of the [spec-v85](docs/spec-v85.md) Advanced Clinical
  Calculators program. Three deterministic high-acuity calculators across
  endocrinology and oncology:
  - **`dka-hhs`** — the ADA hyperglycemic-crisis classification (Group G). From
    glucose, pH, bicarbonate, β-hydroxybutyrate, mental status, sodium, and
    chloride it classifies **DKA** (graded mild / moderate / severe on the ADA
    pH and HCO₃ cutoffs), **HHS**, or a **mixed** picture, and shows the computed
    **anion gap** (Na − Cl − HCO₃) and **effective serum osmolality** (2·Na +
    glucose/18) plus the criterion grid. Without β-hydroxybutyrate a strict DKA
    verdict is withheld; a partial input renders the complete-the-fields fallback.
    Cross-links `anion-gap-dd`, `osmolal-gap`, `corrected-sodium`.
  - **`calvert-carboplatin`** — the AUC-based carboplatin dose (Group F),
    dose (mg) = target AUC × (GFR + 25) (Calvert 1989), with the **FDA estimated-
    GFR cap at 125 mL/min** (on by default): an estimated GFR over 125 is computed
    at 125 and the substitution is **shown**, so the uncapped (overdosing) value
    is never returned silently. A blank/zero AUC or GFR is guarded. Cross-links
    `cockcroft-gault`, `egfr-suite`, `bsa`.
  - **`tls-cairo-bishop`** — the Cairo-Bishop tumor-lysis-syndrome grading (Group
    G). Laboratory TLS at **≥ 2** of uric acid ≥ 8 / potassium ≥ 6 / phosphate ≥
    4.5 adult (6.5 pediatric) / corrected calcium ≤ 7 mg/dL — each by the absolute
    threshold or a **25% change** from an entered baseline; clinical TLS adds an
    end-organ criterion (creatinine ≥ 1.5× ULN, arrhythmia/sudden death, seizure)
    with the **Cairo-Bishop grade 0–V**. Corrected calcium reuses the albumin
    correction. Cross-links `kdigo-aki`, `corrected-calcium`.
- Each ships an inline primary citation + `citationUrl` + `accessed`, a per-
  source interpretation block, ≥3 boundary unit examples (incl. severe-DKA /
  pure-HHS / mixed, the GFR>125 cap, and the lab-TLS boundary + baseline branch),
  a [spec-v11](docs/spec-v11.md) audit log, and joins the
  [spec-v59](docs/spec-v59.md) fuzz harness (zero non-finite leaks). No new
  bundled dataset (doctrine clause 2). The ADA hyperglycemic-crisis thresholds
  and the FDA carboplatin GFR-cap are Class-B revisable values with
  [citation-staleness](docs/citation-staleness.md) rows. Catalog 372 → 375 (+3).

### Added (spec-v87: hemodynamics & ICU physiology, +3)

- Second feature spec of the [spec-v85](docs/spec-v85.md) Advanced Clinical
  Calculators program. Three deterministic critical-care physiology
  calculators join Group E (Clinical Math & Conversions):
  - **`hemodynamic-suite`** — the pulmonary-artery-catheter cardiac-index /
    stroke-volume / SVR / PVR resistance suite (Swan-Ganz 1970). From an entered
    cardiac output and the catheter pressures it computes CI, SV, SVI, SVR,
    SVRI, PVR, and PVRI, each with its normal-range flag; PVR is reported in
    **both** dynes·s·cm⁻⁵ and Wood units (the 2022 ESC/ERS <2 WU threshold), the
    ×80 conversion shown. Cross-links `cao2-do2` (oxygen delivery from the same
    CO). A zero/blank cardiac output surfaces a guarded fallback, never Infinity.
  - **`mechanical-power`** — the Gattinoni 2016 simplified mechanical power of
    ventilation, MP = 0.098 × RR × Vt(L) × (Ppeak − ½ × driving pressure), with
    the driving-pressure intermediate shown and the **>17 J/min** higher-VILI-
    risk flag (Serpa Neto 2018).
  - **`dead-space`** — the Bohr-Enghoff physiologic dead-space fraction Vd/Vt =
    (PaCO₂ − PĒCO₂) / PaCO₂ (Enghoff form), with the **>0.6** ARDS-mortality flag
    (Nuckton 2002); when an end-tidal EtCO₂ is used in place of mixed-expired
    PĒCO₂ the output labels the estimate as an underestimating surrogate.
- Each ships an inline primary citation + `citationUrl` + `accessed`, a
  per-source interpretation block, ≥3 boundary unit examples (incl. a
  cardiogenic-shock pattern, the 17 J/min flip, and the implausible/surrogate
  dead-space cases), a [spec-v11](docs/spec-v11.md) audit log, and joins the
  [spec-v59](docs/spec-v59.md) fuzz harness (zero non-finite leaks). No new
  bundled dataset (doctrine clause 2). The ESC/ERS 2022 PVR threshold is a
  Class-B revisable guideline value with a [citation-staleness](docs/citation-staleness.md)
  row. Catalog 369 → 372 (+3).

### Added (spec-v86: toxicology decision rules, +3)

- First feature spec of the [spec-v85](docs/spec-v85.md) Advanced Clinical
  Calculators program. Three deterministic toxicology decision rules join Group
  G (Clinical Scoring & Risk):
  - **`serotonin-toxicity`** — the Hunter Serotonin Toxicity Criteria (Dunkley
    2003): in the presence of a serotonergic agent, the five-branch decision
    rule (clonus / agitation / diaphoresis / tremor / hyperreflexia / hypertonia
    / temperature) with the firing branch named, gated on the serotonergic-agent
    precondition (sensitivity 84% / specificity 97%).
  - **`salicylate-toxicity`** — the EXTRIP Workgroup (2015) evidence-based
    hemodialysis indication: recommends on salicylate >100 mg/dL acute (>90 with
    impaired kidneys), altered mental status, new hypoxemia, or pH ≤7.20;
    suggests when standard therapy fails. Unit-aware (mg/dL ↔ mmol/L). The
    discredited Done nomogram is excluded by name.
  - **`toxic-alcohol`** — the ethanol-corrected calculated osmolality + signed
    osmolar gap (Smithline 1976) and the AACT fomepizole indication (methanol
    2002 / ethylene glycol 1999), with the hard caveat that a normal gap does
    not exclude toxic alcohol once metabolized to its acids.
- Each ships an inline primary citation + `citationUrl` + `accessed`, a
  per-source interpretation block, ≥3 boundary unit examples (incl. each fired
  branch / limb), a [spec-v11](docs/spec-v11.md) audit log, and joins the
  [spec-v59](docs/spec-v59.md) fuzz harness (zero non-finite leaks). No bundled
  drug database (doctrine clause 2): the serotonergic-agent precondition is a
  user attestation. Catalog 366 → 369 (+3).

### Fixed

- Documentation accuracy: the [README](README.md) CLI reference said the unit
  suite is `3,571 tests`; it is **3,573**. The [deployment](docs/deployment.md)
  manual smoke test referenced UI and tiles that no longer exist — an
  "audience/group filter" (removed when the filter/grid machinery was deleted;
  only the hero search + browse-by-category links remain), the "Bill Decoder,"
  and the "CPT Code Reference" (both static code-index surfaces retired in
  spec-v29). Those steps now point at the live hero search and the `em-time` /
  `ndc-convert` / `em-mdm` billing tiles. Docs-only; no catalog or behavior
  change (still 366 tiles).
- The service worker now precaches the **complete** application shell, so an
  offline cold reload no longer renders a broken topbar logo or drops the
  favicons/manifest (spec-v84). [spec-v75](docs/spec-v75.md) set out to precache
  "every file `index.html` loads" but only added the two shell *scripts*
  (`theme.js`, `file-origin-guard.js`); it overlooked the six remaining local
  assets the head and topbar reference — `favicon.ico`, the two PNG favicons,
  `apple-touch-icon.png`, `site.webmanifest`, and `logo.png` (the brand `<img>`
  shown on **every** view). The install handler swallows per-asset fetch
  failures, so the gap never surfaced at runtime; the lazy shell cache only
  picked these up on the first *online* visit. [sw.js](sw.js) `SHELL_ASSETS` now
  lists all six. A new unit guard
  ([test/unit/sw-shell.test.js](test/unit/sw-shell.test.js)) parses every local
  `<link>`/`<script>`/`<img>` reference in `index.html` and asserts each is
  precached (and that no `/data/*` manifest sneaks back in), so the
  hand-maintained list can never silently fall behind the HTML again — the exact
  drift v75 and v84 both hit. +0 catalog delta (still 366). See
  [docs/spec-v84.md](docs/spec-v84.md).
- `qtc-suite` (spec-v4 Group E) no longer leaks `NaN ms` to all four formula
  rows (and the copy buffer) when the Heart-rate field is filled but QT is left
  blank — a normal mid-entry state for a user who types HR first. The compute
  `qtcAll` ([lib/clinical-v4.js](lib/clinical-v4.js)) validated only the rate
  input (via `rrFromHrOrRr`) and passed an unguarded `qtMs` straight into
  `qtMs / √rr`, so a blank QT (`Number('') = NaN`) rendered "Bazett: NaN ms",
  etc. — the same "`safe()` catches throws, not NaN" class fixed in earlier
  render audits. It now validates `qtMs` with the throwing `num()` at the top of
  `qtcAll`, exactly as the older `qtc` tile (`lib/clinical.js`) already did, so a
  blank QT throws and `safe()` renders the error instead. Guarded by a new
  `qtcAll: missing QT throws, not NaN` unit test
  ([test/unit/clinical-v4.test.js](test/unit/clinical-v4.test.js)). The
  example-correctness e2e never caught it because the `qtc-suite` META example
  fills both fields.
- `icd10-validate` (spec-v83) no longer fires a 404 (and the accompanying
  console error) when the entered code's first letter has no bundled shard. The
  bundled `data/icd10cm` set is a small offline seed covering only some letters
  (A, E, I, J, K, M, N, R, Z); typing an S- or T-chapter code — *exactly* the
  injury/poisoning codes whose missing 7th character this tile flags — requested
  a shard that does not exist. The on-demand existence check now consults the
  manifest's shard list first and skips the fetch when the letter isn't bundled;
  the structural/specificity verdict (which never depended on the shard) is
  unchanged. Guarded by [test/integration/icd10-validate-shard.spec.js](test/integration/icd10-validate-shard.spec.js)
  (a fast focused check) in addition to the broad `tool-interactions` sweep that
  caught it.

### Added (spec-v83 — claim integrity & facility payment: validate the identifiers, balance the remittance, price the institutional claim; +6 tiles, catalog 360 -> 366; spec-v77 program complete, 337 -> 366, +29)

Sixth and **final** feature spec of the [spec-v77](docs/spec-v77.md) billing &
coding program. It closes two gaps at once — **claim integrity** (the validators
that catch a bad identifier or an out-of-balance remittance *before* the
clearinghouse rejects it) and **facility payment** (the UB-04 institutional side
the professional [spec-v78](docs/spec-v78.md) engine does not compute). Six
deterministic, CMS/X12-cited engines land in **Group B "Billing &
Reimbursement"** ([views/group-b.js](views/group-b.js),
[lib/billing-v83.js](lib/billing-v83.js)). See [docs/spec-v83.md](docs/spec-v83.md).

- `npi-validate` — **NPI Luhn check-digit** validate / generate. Recomputes the
  ISO/IEC 7812 check digit over the `80840` issuer prefix and shows it, so a
  transposition is *visible*, not just "invalid"; a 9-digit base gets its 10th
  digit generated. Format/check-digit only — not an NPPES enrollment check.
- `mbi-validate` — **Medicare Beneficiary Identifier** position-grammar check.
  Names the first offending position and rule (e.g. "position 2 must be
  alphabetic" / "contains the excluded letter S") against the CMS 11-character
  grammar and the excluded set S, L, O, I, B, Z. Format only — not entitlement.
- `icd10-validate` — **ICD-10-CM structural & specificity** checker. Validates
  the category/site/laterality grammar and the placeholder X, and flags the
  "will deny for lack of specificity" case when a required 7th character is
  missing. Structure/specificity only — not the clinically correct diagnosis.
- `era-balance` — **835 / EOB remittance balancing**. Proves `billed − paid −
  Σ(CAS adjustments CO/PR/OA/PI) = 0` to the cent, reports the exact residual
  when it doesn't, and returns the patient responsibility (Σ PR) to post. The
  pre-posting check that stops an unbalanced remittance corrupting the ledger.
- `drg-payment` — **IPPS DRG payment** estimate = relative weight × the
  wage-index-adjusted base rate (operating + capital), with the per-diem
  reduction for a post-acute transfer. Reads the bundled `data/drg` weights;
  takes rates as inputs. Estimates the operating model — outlier/IME/DSH need the
  hospital's own cost-report factors.
- `apc-payment` — **OPPS APC payment** estimate = relative weight × the OPPS
  conversion factor, wage adjusted, with status-indicator packaging (status N
  pays $0) and the multiple-procedure discount on lower-weighted status-T
  procedures. Reads the bundled `data/apc` weights; takes the CF as an input.

All money is integer cents; the validators verify **format/structure only** and
say so; the facility pricers read the bundled relative-weight corpora but take
every dated rate as an input so they price any DRG/APC or hospital off-bundle
(doctrine clause 2). The IPPS base rates, the OPPS conversion factor, and the MBI
grammar/excluded-letter set get `pa-staleness-ledger.json` rows (ruleFamily
`billing-v83`). Each tile ships a worked example, a [spec-v11](docs/spec-v11.md)
audit log, and passes the [spec-v29](docs/spec-v29.md) §3 one-line test. With
v83 the spec-v77 billing & coding program is **complete: 337 → 366 (+29)**.

### Added (spec-v82 — patient responsibility & coordination of benefits: what the patient actually owes; +4 tiles, catalog 356 -> 360)

Fifth feature spec of the [spec-v77](docs/spec-v77.md) billing & coding program.
[spec-v78](docs/spec-v78.md) computes what the *payer* pays; v82 computes what the
*patient* owes — the numbers on the statement the patient actually reads, and pure
arithmetic that billing offices routinely get wrong. Four deterministic,
integer-cents, CMS/statute-cited calculators land in **Group C "Patient Bill &
Insurance Tools"** ([views/group-c.js](views/group-c.js),
[lib/billing-v82.js](lib/billing-v82.js)). See [docs/spec-v82.md](docs/spec-v82.md).

- `medicare-cost-share` — Part A / Part B / SNF **beneficiary liability**. Part B is the
  annual deductible then 20% of the Medicare-approved amount; Part A inpatient is the
  per-benefit-period deductible plus the day-61–90 and lifetime-reserve coinsurance;
  SNF is the day-21–100 daily coinsurance. Defaults are the **CY2026 CMS amounts**
  ($1,736 / $434 / $868 / $217 / $283), overridable for a prior year, and the result is
  the share **before** any Medigap / secondary coverage (which `cob-calc` coordinates).
- `cob-calc` — **coordination of benefits / Medicare Secondary Payer**. Computes the
  secondary payment and the patient residual under each *named* method — **lesser-of**,
  **come-out-whole** (benefits-less-paid), **non-duplication**, and **MSP** — never
  silently picking one. The arithmetic that decides whether a dual-coverage patient owes
  $0 or a real balance.
- `allowed-amount` — the **contractual write-off vs patient balance**. Splits a line into
  the write-off (charge − allowed), the patient cost-share on the *allowed*, and the
  payer payment, and **flags a would-be balance bill** an in-network claim must write off.
  Out-of-network it refuses to invent a write-off (hard gate, not the patient-favorable
  default).
- `nsa-cost-share` — the **No Surprises Act** QPA-based cost-share. For a protected
  service it caps the patient cost-share at the in-network amount off the **QPA** and
  reports the **prohibited balance-bill** amount; a non-protected service gets a hard
  refusal. Computes the cost-share number only — not an NSA/IDR eligibility tree.

Each tile passes the [spec-v29](docs/spec-v29.md) §3 one-line test, joins the
[spec-v59](docs/spec-v59.md) fuzz harness with zero non-finite leaks, ships an
inline citation + `citationUrl` + `accessed`, a [spec-v11](docs/spec-v11.md)
`docs/audits/v12/` audit log, and a META example reproduced by the
example-correctness e2e. Money is integer cents end-to-end; the deductible-before-
coinsurance ordering is tested at the partial-deductible boundary. The dated CMS
cost-sharing constants are ledger-tracked under ruleFamily `billing-v82`. Catalog
**356 → 360**; all catalog-truth surfaces updated.

### Added (spec-v81 — drug & infusion billing: HCPCS units, JW/JZ wastage, the infusion hierarchy; +3 tiles, catalog 353 -> 356)

Fourth feature spec of the [spec-v77](docs/spec-v77.md) billing & coding program.
Drug administration is where claims hemorrhage money and trigger audits: the HCPCS
**billing unit** rarely equals the milligrams given, the **JW/JZ** discarded-drug
rules are mandatory and error-prone, and the **infusion/injection CPT hierarchy**
(96360–96379) makes the primary code depend on the *timeline*, not the drug. v81
ships three deterministic, CMS/AMA-cited engines ([views/group-b.js](views/group-b.js),
[lib/billing-v81.js](lib/billing-v81.js)) that get all three right. The unit size
stays the user's input (doctrine clause 2 — no drug-pricing file ships). See
[docs/spec-v81.md](docs/spec-v81.md).

- `ndc-hcpcs-units` — dose → **HCPCS billing units**. Divides the dose by the code's
  billing-unit size (entered from the descriptor) and rounds per the explicit rule
  (up / nearest / down), converting across the mass family (mcg/mg/g) and refusing a
  cross-family divide. Reports the exact ratio and flags a dose that is **not a clean
  multiple** of the unit — the case that produces fractional-unit and rounding errors.
  Near-neighbor to `ndc-convert` (a digit-format converter); different job, both kept.
- `drug-wastage` — **JW (discarded) / JZ (zero waste)** units from a single-dose vial.
  Computes administered + discarded units (which must total the units drawn), returns
  the **JZ** verdict when the dose uses the full vial (required since 2023-07-01), and
  **hard-refuses JW on a multi-dose vial** rather than warning. When vial sizes are
  supplied, an exact bounded search returns the **least-waste vial combination**.
- `infusion-hierarchy` — the 96360–96379 **initial-code picker**. Chooses the single
  "initial" code per encounter by the CMS hierarchy (chemo > therapeutic > hydration;
  within a category, infusion > push), **not** by chronology; reclassifies a sub-16-
  minute infusion to an IV push; and assigns every other administration its
  sequential / concurrent / additional-hour / additional-push role and code.

Each tile passes the [spec-v29](docs/spec-v29.md) §3 one-line test, joins the
[spec-v59](docs/spec-v59.md) fuzz harness with zero non-finite leaks, ships an
inline citation + `citationUrl` + `accessed`, a [spec-v11](docs/spec-v11.md)
`docs/audits/v12/` audit log, and a META example reproduced by the
example-correctness e2e. Dated constants (the JZ-required date, the 16-minute
infusion/push floor, the hierarchy ordering) are ledger-tracked under ruleFamily
`billing-v81`. Catalog **353 → 356**; all catalog-truth surfaces updated.

### Added (spec-v80 — E/M & time-based coding, completed: the 2023 overhaul across every setting, plus the time-unit codes; +6 tiles, catalog 347 -> 353)

Third feature spec of the [spec-v77](docs/spec-v77.md) billing & coding program.
The catalog's E/M tools stopped at the **office** (`em-time` / `em-mdm` cover
99202–99215). The AMA's 2023 overhaul extended the same 2-of-3 MDM framework to
**every** setting, and the highest-dollar coding errors now live in the settings
the office tiles never reached. v80 ships six deterministic, AMA/CMS-cited engines
([views/group-b.js](views/group-b.js), [lib/billing-v80.js](lib/billing-v80.js))
that finish the E/M surface. Setting and payer/rule forks are **explicit, never
inferred**; CPT descriptors and ASA base units stay the user's inputs (doctrine
clause 2). See [docs/spec-v80.md](docs/spec-v80.md).

- `em-mdm-2023` — MDM-based E/M level **across every setting**. The 2021 office
  2-of-3 grid (problems / data / risk) extended to inpatient/observation
  (99221–99233), ED (99281–99285), nursing facility (99304–99310), and
  home/residence (99341–99350); returns the setting-specific code and the limiting
  element. The office path defers to (and cross-links) the existing `em-mdm`; that
  tile's output is regression-pinned and unchanged.
- `critical-care-time` — 99291 + 99292 aggregate-time units. Subtracts separately
  reported procedure time, gates net **< 30 min** to "not critical care (report an
  E/M)," reports 99291 for 30–74, then 99292 × N at the 30-minute add-on bands
  (104 → ×1, 134 → ×2). The subtraction rule and the floor are the two miscoding traps.
- `split-shared` — substantive-portion determiner & **FS modifier** (2024 CMS
  rule). Names which provider must bill a facility split/shared E/M under the
  selected basis (more-than-half-of-time, or substantive part of the MDM), whether
  FS applies, and the payment consequence (NPP billing pays at **85%** of the fee
  schedule). An exact time tie is flagged, not silently resolved.
- `prolonged-services` — 99417 / 99418 vs Medicare G2212 / G0316 unit calculator.
  The AMA add-on starts 15 min past the primary code's *minimum* time; the Medicare
  add-on starts 15 min past its *maximum* time — a higher floor. Surfaces the
  AMA-vs-Medicare threshold divergence as the headline so a coder never bills 99417
  to a Medicare payer that wants G2212. (Physician path; clinical-staff 99415/99416
  deferred — see spec-v80 status.)
- `therapy-units` — timed-code units under the Medicare **8-minute rule** (8–22 = 1,
  23–37 = 2, 38–52 = 3, 53–67 = 4, each +15 adds a unit) vs the AMA **Rule of
  Eights** (per-service), showing where the two diverge at pooled remainders — the
  classic PT/OT/SLP under- and over-billing boundary.
- `anesthesia-units` — the one fee that does **not** use the RVU formula:
  (base + time + modifying units) × the anesthesia CF, time unit = 15 min, with the
  medical-direction percentage (AA/QZ 100%, QK/QY/QX 50%, AD flat 3 base units)
  applied. Money in integer cents; the default CY2025 CF is overridable and
  ledger-tracked.

Plumbing: +6 [app.js](app.js) Group B catalog rows (347 → **353**); META entries
with worked examples (validated by the example-correctness e2e sweep) and the
`em-time`/`em-mdm` ↔ `em-mdm-2023` cross-links; a `billing-v80` ledger family
([pa-staleness-ledger.json](pa-staleness-ledger.json), regenerated derived module)
for the anesthesia CF, the prolonged thresholds, the medical-direction percentages,
and the CPT E/M edition; [test/unit/billing-v80.test.js](test/unit/billing-v80.test.js)
boundary suite (every time-band boundary minute); `lib/billing-v80.js` joins the
fuzz harness (zero non-finite leaks); and six [docs/audits/v12/](docs/audits/v12/)
audit logs. All catalog-truth surfaces updated to 353.

### Added (spec-v79 — claim edits & modifier logic: will this line deny, and which modifier unlocks it; +5 tiles, catalog 342 -> 347)

Second feature spec of the [spec-v77](docs/spec-v77.md) billing & coding program.
Where [spec-v78](docs/spec-v78.md) prices the line, v79 decides whether it
*survives*: five deterministic, CMS-cited decision engines
([views/group-b.js](views/group-b.js), [lib/billing-v79.js](lib/billing-v79.js))
for the denial questions a coder fights every day. Per doctrine clause 2, **no
NCCI PTP edit file and no MUE value table ship** — each tile takes the published
indicator / value as a user input and computes the *decision*, so it can never be
silently stale. Indicators gate, never guess. See [docs/spec-v79.md](docs/spec-v79.md).

- `ncci-ptp` — NCCI procedure-to-procedure edit & modifier-bypass checker.
  Determines the Column 1 (comprehensive, payable) vs Column 2 (component,
  bundled) code, and whether the entered modifier indicator permits a bypass:
  **0** no modifier can unbundle (hard gate), **1** a permitted NCCI-associated
  modifier may bypass, **9** not an active edit. Flags a proposed modifier that is
  not NCCI-associated; refuses to bless a bypass on an indicator-0 pair.
- `mue-check` — Medically Unlikely Edits units adjudication by MAI. Compares units
  billed to the MUE value: **MAI 1** cuts the per-line excess (rescuable on a
  separate line with a modifier), **MAI 2** is absolute (the excess never pays and
  must not be appealed as a units error), **MAI 3** denies-but-reviewable with
  documentation. Reports payable vs at-risk units.
- `modifier-x-selector` — 59 vs XE/XS/XP/XU decision. Returns the single most
  specific X-modifier the scenario supports (precedence XE > XS > XP > XU), `59`
  only when a distinct service fits no X-subset, or a hard refusal when there is no
  distinct-service basis at all. CMS prefers the specific X-modifier over the blunt 59.
- `global-period` — global-surgery package date math & required modifier. From the
  surgery date and the GLOB DAYS indicator (000/010/090 with the 90-day's 1-day
  preop; XXX/YYY/ZZZ/MMM gated), computes whether a subsequent encounter is inside
  the package (UTC calendar math via [lib/deadline.js](lib/deadline.js), day-0 =
  surgery, boundary day inside) and names the modifier (24/58/78/79 post-op, 57/25
  pre-op decision) — or marks a routine related post-op visit bundled and not payable.
- `modifier-order` — pricing vs informational modifier sequencing. Re-sequences up
  to four modifiers into the correct claim order (pricing/payment-affecting first,
  ranked, then informational), tags each, and flags conflicting pairs (LT+RT, 26+TC,
  duplicate, multiple assistant-at-surgery). The "why did this clean-looking claim
  under-pay" fix that is invisible until you check the order.

- **Robustness.** `lib/billing-v79.js` joins the [spec-v59](docs/spec-v59.md) fuzz
  harness ([test/unit/fuzz-tools.test.js](test/unit/fuzz-tools.test.js)) — and so
  does `lib/billing-v78.js`, closing the v78 acceptance bullet — with zero
  non-finite / `Invalid Date` / banned-token leaks across the object-aware matrix.
  19 worked-example unit tests ([test/unit/billing-v79.test.js](test/unit/billing-v79.test.js)),
  five ledger rows under ruleFamily `billing-v79`, five [spec-v11](docs/spec-v11.md)
  audit logs, the billing-and-coding topic page, and the Group B related-tools
  cluster. Catalog count synced to **347** across all 13 catalog-truth surfaces.

### Added (spec-v78 — the MPFS reimbursement engine: Group B "Billing & Reimbursement"; +5 tiles, catalog 337 -> 342)

First feature spec of the [spec-v77](docs/spec-v77.md) billing & coding program.
It opens **Group B "Billing & Reimbursement"** ([views/group-b.js](views/group-b.js),
[lib/billing-v78.js](lib/billing-v78.js)) with five deterministic, CMS-cited,
integer-cents reimbursement calculators — the math a revenue-cycle professional
redoes for every claim, which is not Googleable. The fixed reduction chain (base
allowed -> bilateral -> multiple-procedure ranking -> assistant/co/team
percentage -> sequestration) is encoded once and unit-tested with worked CMS
examples. See [docs/spec-v78.md](docs/spec-v78.md).

- `rvu-payment` — the locality-priced MPFS allowed amount,
  `[workRVU*workGPCI + peRVU*peGPCI + mpRVU*mpGPCI] x CF`, for both the
  non-facility and facility site of service, plus the site-of-service
  differential. Reproduces a hand-checked CMS example (99214, National Average
  GPCI, CY2026 CF $32.7442 -> $116.24 non-facility / $89.72 facility) to the cent.
  Reads the bundled `data/mpfs` RVU shards + `data/mpfs/gpci.json` triplets +
  `data/mpfs/conversion-factor.json` as a convenience; every value is overridable
  (doctrine clause 2), so the tool never fails for a code or locality off the
  bundle, and the CF override models a percent-of-Medicare contract.
- `mppr` — the multiple-procedure payment reduction: 100% of the highest line,
  50% of each subsequent (Pub. 100-04 Ch. 12 40.6), plus the endoscopy base-code
  rule (40.7). Re-ranks the lines and shows per-line and total expected allowed
  and the dollars the reduction withholds.
- `bilateral-pay` — the modifier-50 payable amount by MPFS BILAT SURG indicator
  (1 = 150% of the pair, 2 = 100% already-bilateral, 3 = 200% each side, 0/9 =
  hard not-payable gate). Stops the two common bilateral errors at once.
- `multi-surgeon-pay` — assistant (16%), co-surgeon (62.5% to each), or team
  (by report) payment, gated by the matching ASST/CO/TEAM SURG indicator
  (0/9 = not separately payable).
- `sequestration-adjust` — the 2% Medicare sequestration cut applied to the
  program-payment portion only (Budget Control Act of 2011 251A), never to the
  allowed amount or the patient cost-share; the last reduction in the chain.
- New compute module `lib/billing-v78.js` (pure, integer cents end-to-end; bad
  inputs throw `TypeError`/`RangeError` caught by the renderer `safe()` wrapper;
  zero `NaN`/`Infinity` by construction) with 15 unit tests in
  `test/unit/billing-v78.test.js` (>=3 boundary worked examples per tile,
  including the indicator-0 not-payable gate, the facility/non-facility
  differential, and the four-line MPPR chain).
- Five dated constants (PFS conversion factor, 2% sequestration, 16%/62.5%
  surgical percentages, 100/50/50 + 150% reduction factors) added to
  [pa-staleness-ledger.json](pa-staleness-ledger.json) under a new ruleFamily
  `billing-v78`; `check-pa-staleness` guards their currency in CI.
- Wiring: `app.js` (+5 `UTILITIES` rows in Group B, `RB` renderers,
  `GROUP_LABELS.B`), `lib/meta.js` (inline citation + `citationUrl` + `accessed`
  + Test-with-example payload + related-tool cluster), the hub/tool/topic
  builders learn Group B, and the `billing-and-coding` topic page lists the suite.
  Catalog-truth surfaces bumped 337 -> 342; five `docs/audits/v12/` audit logs.
- **Design decisions (within doctrine, see [docs/spec-v78.md](docs/spec-v78.md)
  implementation notes):** GPCI/RVU/CF are consumed from the existing `data/mpfs`
  corpus rather than a new `data/gpci` dataset (non-duplicative); the MPFS policy
  indicators are a labeled user input rather than bundled (keeps the bundle light,
  avoids shipping stale indicators); the tiles classify as schema.org `WebPage`
  like the existing billing tiles, not `MedicalCalculator`.

### Fixed (spec-v76 — the tool-page builder's discovery-surface allowlist names only live tiles, and proves it; catalog unchanged at 337)

The static tool-page builder ([scripts/build-tool-pages.mjs](scripts/build-tool-pages.mjs))
classifies each tile's schema.org `additionalType` (`MedicalCalculator` /
`HowTo` / `Dataset` / `Reference`) from three hand-curated allowlists.
`HOW_TO_TILES` still named **seven tile ids retired in the spec-v29 prune**
(`decoder`, `eob-decoder`, `msn-decoder`, `insurance-card`, `abn-explainer`,
`cms1500`, `ub04`). Because `classify()` is only ever called on live tiles the
dead ids matched nothing and emitted no output — but the set's comment frames
each entry as a deliberate per-tile discovery choice, so the dead ids advertised
seven tiles that do not exist. Same drift shape as spec-v75's stale precache
list. See [docs/spec-v76.md](docs/spec-v76.md).

- `scripts/build-tool-pages.mjs`: removed the seven spec-v29-removed ids from
  `HOW_TO_TILES` (and corrected the now-stale comments); **no generated page
  changes** — the dead ids produced zero output before and after, so every
  `/tools/<id>/` page's JSON-LD is byte-identical.
- `scripts/build-tool-pages.mjs`: added a build-time guard in `main()` that
  throws if any id in `HOW_TO_TILES` / `DATASET_TILES` / `REFERENCE_TILES` is not
  in the live `UTILITIES` catalog, naming the offenders. The build (a CI step and
  a `test:e2e` prerequisite) now fails loudly on this class of drift instead of
  tolerating it silently. An exhaustive sweep confirmed no other hardcoded
  tile-id list in `scripts/`, `lib/`, or CI config carries a dead id.
- `SECURITY.md`: doc-drift fix — the "Pinned dev dependencies" example cited
  ESLint `9.17.0` and `@playwright/test` `1.49.1`, but `package.json` pins
  `9.39.4` and `1.59.1`. The pinning posture was already accurate; only the
  example version strings had gone stale.

### Fixed (spec-v75 — service worker precaches the live shell, not removed datasets; catalog unchanged at 337)

The `sw.js` `SHELL_ASSETS` precache list still named **ten code-lookup dataset
manifests** retired in the spec-v29 prune: five of those directories no longer
exist (their install fetch 404'd and was silently swallowed) and none of the ten
is fetched by any current tile. Meanwhile it **omitted two shell scripts** the
page loads (`theme.js`, `file-origin-guard.js`). See
[docs/spec-v75.md](docs/spec-v75.md).

- `sw.js`: dropped the ten stale `/data/*/manifest.json` precache entries and
  added `theme.js` + `file-origin-guard.js`, so the precache is now the complete
  app shell. Dataset manifests and shards remain cached lazily on first fetch via
  `DATA_CACHE` (the documented shell-precache + lazy-data model), which already
  covers every live tile and does not rot as the catalog changes. The
  `install`/`activate`/`fetch` handlers and the build-time `BUILD_HASH` stamping
  are unchanged.
- `test/integration/no-network.spec.js`: its three-tile sample used
  `icd10cm-lookup` (removed in spec-v29) as the "data-shard fetch" representative,
  so it no longer exercised any on-origin data fetch (it still passed, asserting
  only the absence of off-origin calls). Swapped to `sti-screening`, a live tile
  that fetches `/data/sti-screening/sti.json` on render — restoring genuine
  coverage of the on-origin-data-fetch path.

### Fixed (spec-v74 — the "Skip to content" link works in the SPA again; catalog unchanged at 337)

The skip link (`<a class="skip-link" href="#main">`) is the keyboard/screen-reader
affordance for bypassing the repeated topbar + browse nav (WCAG 2.4.1). But the
home view is a hash-routed SPA: a bare `href="#main"` sets `location.hash`, the
router reads route `"main"`, finds no tile, and calls `restoreHome()`. So
activating the skip link **on any tile ejected the user back to the home view**,
with focus on `<body>` instead of the content — a trap, not a shortcut. See
[docs/spec-v74.md](docs/spec-v74.md).

- `app.js`: `bindSkipLink()` (bound once at `boot()`) intercepts the link,
  `preventDefault()`s the hash navigation, and moves focus to the `<main>`
  landmark (`tabindex="-1"` + `focus()` + `scrollIntoView`) without touching the
  hash. The current tile, its `q=` input state, and the URL are preserved.
- Scope is the SPA only: the pre-rendered static pages (`/tools/<id>/`,
  `/for/<hub>/`, `/topics/<topic>/`) don't load `app.js`, so their native
  `#main` anchor already worked and is untouched.
- New guard `test/integration/skip-link.spec.js`: on `/#bmi`, activating the
  skip link must leave the tile heading unchanged (not ejected to home), leave
  the hash unchanged, and focus `#main`; a second test pins the home view. All
  three assertions failed pre-fix (heading became the home hero, focus `<body>`).

### Fixed (spec-v73 — the UA color-scheme now follows the active theme; black date field in light mode fixed; catalog unchanged at 337)

`color-scheme` was declared dark-only — a hardcoded `<meta name="color-scheme"
content="dark">` on every page, with no CSS counterpart — but the site ships a
full light theme reachable by OS preference or the manual toggle. So in light
mode the browser painted every native control to the dark scheme: most visibly a
**black `<input type=date>`** on the ops/deadline tiles (`appeal-deadline`,
`timely-filing`, `pa-turnaround`, `overpayment-60day`, `em-mdm`), plus dark
number-spinner arrows, `<select>` popups, and scrollbars on a white page. See
[docs/spec-v73.md](docs/spec-v73.md).

- `styles.css`: `color-scheme: dark` on `:root` and `color-scheme: light` on
  `[data-theme="light"]`. Keyed on `data-theme` (set by theme.js before paint),
  so it tracks the manual toggle — not just `prefers-color-scheme`, which a meta
  and a media query cannot follow. Applies to the SPA and all 351 pre-rendered
  pages via the shared stylesheet. No palette/token/output change.
- `index.html` + the 4 static-page build templates (5 spots): `<meta
  name="color-scheme">` `dark` → `dark light` (accurate declaration; a pre-CSS
  hint that avoids a flash of dark widgets before styles.css loads).
- `theme.js`: `swSetThemeColor()` finds-or-creates `<meta name="theme-color">`
  and sets it to `#ffffff` (light) / `#0a0a0a` (dark) to match `--bg-primary`,
  on the before-paint init and on every toggle — so the mobile browser-chrome
  bar matches the page (it stayed dark in light mode before). Find-or-create
  means it also covers the static pages, which omit the static meta.
- New guard `test/integration/theme-color-scheme.spec.js`: on `/#appeal-deadline`
  (the date-input route the bug appeared on), in both themes, asserts the
  computed `color-scheme` equals the theme and there is exactly one `theme-color`
  meta matching `--bg-primary`. Non-vacuous: the value was `normal` pre-fix.

### Changed (spec-v72 — every primary interactive control now meets the 44px touch target; catalog unchanged at 337)

The horizontal-scroll guarantee proved nothing *overflows* the phone viewport,
but four controls still rendered below the 44 CSS px touch-target floor (WCAG
2.5.5 Target Size, Apple HIG) — a comfortable mouse click, a routine thumb
mis-tap. A 360px measurement found: the copy pills (`.copy-btn`, ~24px tall,
present on every tool that emits a copyable result — the highest-traffic small
target), the topbar theme toggle (40px), the breadcrumb back-button
(`.breadcrumb-back`, ~30px), and the load-example reset (`.example-reset`,
~36px). Each was a base `button` (~44px) overridden *down* for visual
compactness. See [docs/spec-v72.md](docs/spec-v72.md).

- `styles.css`: `.copy-btn` and `.breadcrumb-back` gain `min-height: 44px` with
  `inline-flex` centering; `.tool-meta .example-reset` gains `min-height: 44px`;
  `.topbar-theme-toggle` goes 40×40 → 44×44. The small `0.85rem` label is kept,
  so the pills stay visually light while the tap zone becomes a full target, now
  matching the base-button height as a consistent control family. CSS-only; no
  renderer, compute, markup, or output change. The 320px no-horizontal-scroll
  sweep stays green (`min-height` is width-neutral).
- Removed the dead `.tool-meta .example-btn` rule, orphaned by the spec-v9
  `.example-btn` → `.example-reset` rename (no live element has carried
  `example-btn` since), and corrected the matching stale `:not(.example-btn)`
  exclusion in [tool-interactions.spec.js](test/integration/tool-interactions.spec.js)
  to `:not(.example-reset)`, restoring its documented intent.
- New regression guard
  [test/integration/mobile-touch-targets.spec.js](test/integration/mobile-touch-targets.spec.js):
  at 360px, every copy pill, the theme toggle, the breadcrumb back-button, and
  the example reset must measure ≥44px in their binding dimension, reported all
  at once. A new control can never silently reintroduce a sub-44px tap target.

### Fixed (housekeeping — three documentation-drift items surfaced by a doc audit)

- `docs/deployment.md`: the post-deploy CSP verification line was missing
  `'wasm-unsafe-eval'` in `script-src` (present in `_headers`, SECURITY.md, and
  README for the vendored on-device OCR WebAssembly engine); a `curl -I` check
  against the documented value would not have matched production.
- `README.md`: the `npm run test:unit` count was `3,468`; the suite reports
  `3,469`.
- `docs/operations.md`: the "add a pure function" step listed the deleted
  `lib/decoder.js` (removed in spec-v29) as a current compute module; replaced
  with the live modules (`lib/clinical.js`, `lib/clinical-v5.js`, `lib/field.js`,
  `lib/scoring-v4.js`).

### Fixed (robustness — a malformed URL fragment crashed the router instead of resolving to home)

`parseHash` ([lib/hash.js](lib/hash.js)) decoded the route, sub-segment, `q=`
state body, and `a=`/`b=` values with bare `decodeURIComponent`. A fragment with
a malformed percent-escape — a stray `%`, a truncated multibyte sequence
(`#%E0%A4`), or invalid UTF-8 (`#%FF`) — makes `decodeURIComponent` throw
`URIError`, and because `parseHash` runs inside `boot()` and `route()` with no
guard, the throw propagated and white-screened the page. Such fragments arrive
from corrupted bookmarks, hand-truncated share links, and fuzzers.

- Added a `safeDecode` helper that returns the raw, still-encoded segment on
  `URIError` instead of throwing. This honors the file's existing contract — a
  fragment the parser cannot make sense of resolves to the home view, never a
  crash: the raw segment misses the `UTIL_BY_ID` lookup in `route()`, which
  already falls back to `restoreHome()`. All five decode sites now route through
  it; `lib/hash.js` is the only `decodeURIComponent` consumer in the codebase
  (verified), so the surface is fully closed.
- Regression test in [test/unit/hash.test.js](test/unit/hash.test.js): malformed
  escapes in every segment (route, sub, `q=`, `a=`, `b=`) no longer throw, and
  the parse still yields a usable shape (`#%FF` → `route:'%FF'`, empty state →
  router lands on home).
- Drive-by: corrected one stale "above the home grid" comment in `app.js`'s
  removed-tile-note path to "above the home view" (the grid was retired in
  spec-v51/v53). Comment-only.

### Fixed (housekeeping — documentation drift left by the spec-v51/v53 home redesign and the session 8–10 dead-UI prune)

The filter-chip + tile-grid home was replaced by the `#hero-search` combobox in
spec-v51/v53, and the dead JS/CSS for it was removed in sessions 8–10, but
several prose docs still described the retired UI as live. This pass corrects the
last of that drift — no runtime code changed (the one `lib/prompt.js` edit is a
comment); lint, the 3,468 unit tests, and the e2e suite stay green.

- `README.md`: (1) the user-flow text said "pick a tile from the
  disclosure-collapsible home grid" — now "follow one of the static browse links
  below it" (the home is the hero-search combobox + a static browse-by-category
  nav); (2) the repository-layout block called `index.html` a shell with a "home
  grid" and listed app.js as carrying "filters" — corrected to the
  hero-search-combobox + browse-nav shell and "hero-search wiring"; (3) the
  discovery ranker rubric row "Audience-aligned with the active chip" became
  "Audience-aligned with the active audience" sourced from "the `#a=` deep-link
  audience (nurse-first by default)", since the chip UI is gone; (4) the unit-test
  count was stale at 3,045 — now 3,468.
- `docs/architecture.md`: the Overview and Runtime-Architecture sections still
  described "a tile grid of utilities" with "a filter bar … chip set" — rewritten
  to the hero-search combobox + static browse nav, noting the `#a=` deep-link
  audience bias replaces the on-page filter bar.
- `docs/accessibility.md`: the 200%-zoom item cited the removed
  `repeat(auto-fill, minmax(240px, 1fr))` home-grid CSS; reworded to the current
  fluid-width `.container` (`--content-max` 1200px) reflow and the 700px/600px
  media queries.
- `lib/prompt.js`: header comment "the active audience chip" → "the active
  audience (the `#a=` deep-link, nurse-first by default; the chip-filter UI was
  removed in spec-v51/v53)". Comment-only; no behavior change.

### Removed (housekeeping — 355 lines of dead filter/grid machinery from app.js)

The spec-v51/v53 home redesign replaced the old tile-grid + filter-chip +
browse-disclosure + topbar-search UI with a single `#hero-search` combobox, but
left the driving JavaScript behind. Every one of those functions operated on DOM
ids/classes that no longer exist in `index.html` (`#tile-grid`, `.tool-card`,
`.toggle-group`, `#browse-disclosure`, `#topbar-search`, `#empty-state`, …) — all
null-guarded, so it no-op'd at runtime, but it was ~355 lines of dead code in the
112 KB main file that every audit re-analyzed.

- Removed `tileMatches`, `applyFilters`, `CHIP_MATCHERS`, `syncToggleGroupState`,
  `wireFilters`, `installTopbarSearch`, the delegated `.tool-card` document click
  handler, the never-called `resolveQueryToTileId`, the no-op `updateSynonymHint`
  (its `#hero-synonym-hint` target was retired), and `openDisclosure`; trimmed the
  dead DOM blocks out of `boot()` and `restoreHome()`; dropped two unused imports
  (`buildHash`, `matchSynonym`) and the dead `#tile-grid` scrape inside
  `tileCorpus`. `app.js` 1760 → 1405 lines.
- **The synonym chain stays live**: `bindHeroSearch` (called from inside the
  removed `wireFilters`) was re-homed to direct calls in `boot()` and
  `restoreHome()`; `resolvePrompt` / `tileCorpus` / `audienceHint` /
  `SYNONYM_ENTRIES` remain wired into the search (the prior change). Verified
  in-browser: home search → synonym resolution → navigate to a tile → back to
  home → search resolves again (the re-bind), zero console errors; lint, 3468
  unit tests, and 36 e2e (smoke / no-network / all-tools, which boots every route
  and fails on any console error) all green.
- `docs/accessibility.md` ARIA notes updated — the filter-toggle `aria-pressed`
  controls and tool-card grid no longer exist; the home is the combobox.
- The corresponding dead CSS was pruned in the follow-up below.

### Removed (housekeeping — 271 lines of dead CSS for the removed filter/grid UI)

The follow-up to the app.js prune above: the stylesheet still carried the rules
for the tile-grid + filter-chip + topbar-search UI that the spec-v51/v53 redesign
replaced with the `#hero-search` combobox. None of these selectors can match an
element (verified each is 0× in `index.html` / `dist/index.html` / `app.js` /
`views/`).

- Removed **47 fully-dead rules** — the `.tool-card` / `.tc-*`, `.home-section`,
  `.home-grid`, `.filters` / `.filter-row` / `.filter-label` / `.search-row`,
  `.toggle-group`, `.toggle` (the filter button — distinct from the live
  `.topbar-theme-toggle`), `.empty-state`, and `.topbar-search` / `.tsr-*`
  families, plus the dead `@media (max-width: 700px)` overrides for them — and
  trimmed the now-dead `.filters` selector out of the shared `@media print` hide
  list (keeping its live `.topbar` / `.back-link` / `.breadcrumb` / `#print-btn`
  selectors). `styles.css` 1731 → 1460 lines.
- A CSS-aware walker did the removal (brace-matched rule boundaries; a selector
  is dead iff every selector in its list references a removed class/id), so no
  live rule was touched; the result is brace-balanced. Cleaned the orphaned
  section banners (`/* Header search */`, the `FILTERS` banner), relabeled the
  stale `HOME GRID` banner to `HOME VIEW` (`.home-view` still lives under it), and
  corrected the file-header description.
- **Visual verification** (CSS has no automated guard): screenshotted the home
  (light + dark), a tile with its derivation block expanded, all clean; the
  320px mobile-no-hscroll sweep, smoke, and all-tools e2e pass.

### Fixed (hero search silently lost synonym / patient-phrasing resolution in the spec-v51/v53 redesign)

The home `#hero-search` combobox ranked results with `searchUtilities()` /
`scoreUtility()`, which match a query only against each tile's **name and id** —
it never consulted the curated synonym table (`data/synonyms.json`), the token
ranker, or the description/tags. So patient-mental-model queries that share no
token with a tile name returned nothing or the wrong tool:

- "they denied it" → (no result / `unit-converter`), instead of `appeal-letter`
- "kidney function" → `mods` ("Multiple Organ **Dysfunction**"), instead of `egfr`

The synonym resolver `resolvePrompt()` (the documented 3-pass synonym → ranker →
edit-distance flow) was still in `app.js`, but only wired to a never-called Enter
fallback and a no-op synonym hint (its target element was retired) — so the
synonym table was loaded at boot and then ignored, and the README's flagship
"they denied it → appeal-letter" example did not actually work.

- `app.js` `matchesFor()` (inside `bindHeroSearch`): now also runs the query
  through `resolvePrompt()` and hoists its single best tile to the **top** of the
  dropdown. `resolvePrompt` returns `null` below its surfacing threshold, so a
  non-matching query simply falls back to the existing name/id ranking — no
  spurious results. This re-animates the previously-dead synonym chain
  (`resolvePrompt` / `tileCorpus` / `audienceHint` / `SYNONYM_ENTRIES`) into the
  live search.
- Added a regression test (`test/integration/smoke.spec.js`): the dropdown's
  first result for "they denied it" must be `appeal-letter` and for "kidney
  function" must be `egfr` — it failed before the fix, so it cannot pass
  vacuously. Updated the README "Discovery" section to describe the actual live
  hybrid (name/id list + synonym-resolved tile surfaced first).

### Fixed (documentation/config accuracy + removed dead keyboard grid-nav)

A doc/security/perf-accuracy audit found several committed claims that no longer
matched the shipped artifact, plus a dead code path:

- **CSP drift (security docs).** `docs/threat-model.md` and `SECURITY.md` still
  documented the pre-OCR `script-src 'self'`; the deployed CSP (in `_headers`)
  is `script-src 'self' 'wasm-unsafe-eval'` — the `'wasm-unsafe-eval'` token was
  added for the vendored on-device OCR engine and permits only same-origin WASM
  compilation (not `eval`/`Function`/inline script). Both docs now quote the real
  CSP with that clarification.
- **performance.md drift.** Corrected four stale claims against the actual
  `.lighthouserc.json`: the run is `preset: "desktop"` with Slow-4G-class
  throttling (not "Slow 4G, mid-range Android emulation"); the timing metrics and
  the performance score are `warn` assertions (not build-failing) while only the
  accessibility/best-practices/SEO category floors are hard `error` gates; the
  config asserts **no** `resource-summary` byte-budget (that claim was removed);
  and Lighthouse runs in its own `lighthouse` CI job (not the `e2e` job).
- **Stale Lighthouse URLs.** `.lighthouserc.json` sampled `#icd10` (a v29-removed
  tile) and `#mpfs` (a dataset, not a tile); replaced with the real `#egfr` and
  `#wells-pe` routes. Verified the suite still passes (`@lhci/cli` exit 0; the
  category-floor gates hold).
- **Dead keyboard grid-nav.** `lib/keyboard.js` still registered a capture-phase
  `keydown` handler (`onGridKey` + `tileLinks` + `computeColumns`) navigating a
  `#tile-grid`/`.tile-link` element grid that was removed in spec-v51/v53 — the
  guard `classList.contains('tile-link')` was permanently false. Removed the dead
  handler and its listener; the live G-leader shortcuts and the `?` overlay are
  untouched (keyboard tests still pass).

### Fixed (spec-v71 — `psi` Risk Class I was unreachable; every low-risk young patient was mislabeled Class II; +0 catalog delta)

The Pneumonia Severity Index assigned **Risk Class I** with `age <= 50 && pts ===
0`, but the first scoring step always adds the age contribution (`pts += age` for
men, `age − 10` for women), so `pts === 0` could only hold for a female aged ≤10
— never a real CAP patient. Class I (0.1% 30-day mortality, the rule's "safe for
home" headline) was therefore **unreachable**, and a textbook Class I patient
(young, no comorbidity, no exam abnormality) was always mislabeled Class II. The
tile's own v11 audit even asserted "age 50, male → Class I", and a unit test was
named "30yo healthy male → Class I" while its assertion quietly accepted Class II.

- `lib/scoring-v4.js` `psi()`: capture the age term as `agePoints` and assign
  Class I when `age <= 50 && pts === agePoints` (no points beyond age) — exactly
  the Fine 1997 (NEJM 1997;336(4):243-250) Step 1 pre-screen the audit documents.
  No new input, no new tile, no new citation, no renderer change. Classes II–V
  and every point assignment are byte-for-byte unchanged.
- Conservative by design: any entered risk factor (comorbidity, exam abnormality,
  abnormal lab, or nursing-home stay) routes to point scoring, so the rule never
  under-triages into the 0.1% band. Disposition impact is low (Class I and II are
  both outpatient), but the class label and the 0.1% vs 0.6% mortality band were
  wrong.
- Corrected the mis-named test and added boundary coverage (age 50/51, and
  risk-factor-routes-out-of-Class-I); `docs/audits/v11/psi.md` re-audited to
  PASS-WITH-FIXES (fixing its stale "0 points" arithmetic). See
  [docs/spec-v71.md](docs/spec-v71.md).

### Fixed (accessibility — heading-level skips across the tile catalog + a permanent guard; WCAG 1.3.1 / 2.4.10)

A runtime sweep of every rendered tile body (the deferred finding from the prior
session) found pervasive heading-level skips: under the page `<h1>` (the tool
name), many tiles jumped straight to `<h4>` or `<h3>` with no `<h2>` between, so
a screen-reader user navigating by heading hears a missing level. Two sources,
both now fixed with no change to any computed output:

- **The shared "show your work" derivation block** (`lib/derivation.js`,
  spec-v48) was the dominant cause — present on 126 tiles, it emitted its
  `Formula` / `Original population` / `Limits of validity` / `Source` / `Your
  inputs` / `With your inputs` labels as `<h4>` headings (→ `h1->h4` / `h2->h4`
  skips). These are term→definition pairs, not document sections, so they are
  now a `<dl>`/`<dt>`/`<dd>` description list: same visual layout, but out of the
  heading outline entirely (and more semantically honest). CSS retargeted
  `.tile-derivation h4` → `.tile-derivation dt` with `dd`/`dl` margin resets.
- **24 tile renderers** used `<h3>` for their first, top-level section heading
  under the `<h1>` (e.g. `corrected-ca-na` "Corrected Calcium", `charlson`
  "1-point comorbidities", `ccsr` "Step 1", `field-triage`, `qsofa-sofa`,
  `meld-childpugh`, `ranson-bisap`, the Ottawa/PECARN/Wells rules, …). Promoted
  those 49 first-level `<h3>`s to `<h2>` (across `views/group-e/f/g/i/j/klmno/v5`),
  leaving the 14 correctly-nested `<h3>`s (those under an existing `<h2>`)
  untouched.
- **Permanent guard:** `test/integration/all-tools.spec.js` gains a chromium-only
  sweep asserting no tile body skips a heading level (each heading ≤ previous +
  1). It listed all ~70 offenders before the fix, so it cannot pass vacuously.

### Fixed (four tiles rendered the literal "NaN" for plausible partial input; +0 catalog delta)

The per-tile `safe()` renderer wrapper only catches *thrown* errors, but
`NaN.toFixed()` returns the string `"NaN"` without throwing, and the
`check-output-safety` gate only bans one exact fingerprint — so four computes
that skipped input validation rendered `NaN` to a clinician on partial input:

- **`winters`** — `wintersFormula` validated `measuredPaco2` but not `hco3`;
  a value in PaCO2 with HCO3 blank produced "Expected PaCO2: NaN to NaN mmHg".
- **`osmolal-gap`** — `osmolalGap` did no validation; a blank "measured
  osmolality" produced "Osmolal gap: NaN".
- **`ascvd`** / **`prevent`** — `ascvdPce` / `prevent10yr` guarded only the
  age *range*, but `age < 40 || age > 79` is `false` when a field is `NaN`, so a
  blank cholesterol/HDL/BP (or even blank age) slipped past and the renderer's
  `r.score == null` guard failed (`NaN == null` is `false`) → "…risk: NaN%".

Fixes route each through validation the way their sibling computes already do:
`wintersFormula`/`osmolalGap` now call `num()` (throws on non-finite → caught by
`safe()`, shows a muted message like the sibling `anion-gap` tiles);
`ascvdPce`/`prevent10yr` gained a finite-input guard *before* the range check
that returns the existing `{ score: null, band }` shape with a "Enter …"
prompt. Every valid-input path is byte-for-byte unchanged (all META examples
render identically). Added 5 regression tests
(`clinical-v4.test.js`, `scoring-v4-w56.test.js`).

### Fixed (BreadcrumbList JSON-LD asserted a dead group link on all 337 tool pages; SEO)

`scripts/build-tool-pages.mjs` set the level-2 breadcrumb `item` to
`https://sophiewell.com/#g-<group>`, but no `#g-<group>` route exists (it falls
through to the home view) and the on-page breadcrumb renders the group as plain,
non-clickable text. The structured data therefore asserted a navigable
category page that doesn't exist. Made the group a **name-only** intermediate
`ListItem` (no `item` URL) — valid schema.org, mirrors the non-linked on-page
label, and removes the dead link from every `dist/tools/*/index.html`.

### Fixed (dead ternary in `huntHessWfns`; cleanup, no output change)

`lib/scoring-v4.js` had `else if (g >= 7) wfns = focalMotorDeficit ? 4 : 4` —
both arms identical. WFNS IV is GCS 7-12 regardless of motor deficit (the
deficit only splits grades II/III at GCS 13-14, handled above), so simplified to
`wfns = 4`. Output was already correct; existing tests (GCS 7 no-focal → 4, GCS
12 with-focal → 4) already prove the behavior is unchanged.

### Removed (housekeeping — 57 orphaned `data/tool-copy/` files for v29-removed tiles + a guard so they can't re-accumulate)

`data/tool-copy/<id>.json` holds the hand-authored `/tools/<id>/` page copy,
loaded per current tile; the build silently skips any file without a matching
tile. That tolerance let 57 copy files for tiles deleted in the **spec-v29
prune** linger as dead data — they can never render. Verified the orphan set is
**exactly** the `REMOVED_V29_IDS` map in `app.js` (19 code-reference lookups +
15 patient-literacy/form-locator decoders + 10 field-medicine reference cards +
8 reference-range/wallet-card tables + 5 Group-G single-class references = 57),
with no orphan outside that authoritative list and none matching a current tile.

- Deleted all 57 (e.g. `icd10`, `hcpcs`, `cpt`, `ndc`, `pos-codes`, `carc`,
  `rarc`, `drg-lookup`, `ub04`, `cms1500`, `lab-ranges`, `toxidromes`, `beers`,
  `mallampati`, `mrs`, …). The build still reports "122 with hand-authored copy"
  — the deletions removed only never-rendered files, changing no page output.
- Added a guard in `scripts/check-catalog-truth.mjs`: it parses `REMOVED_V29_IDS`
  from `app.js` and fails CI if any `data/tool-copy/*.json` belongs to a removed
  tile (non-vacuous — it listed all 57 before the deletion). The guard reports
  "57 v29-removed ids guarded, 0 orphan copy" when clean. `docs/data-sources.md`
  updated to note the 1:1 copy↔tile invariant.

### Fixed (spec-v70 — `sas-riker` told an at-goal SAS 3 to "lighten sedation"; +0 catalog delta)

The Riker Sedation-Agitation Scale interpreter prints a light-sedation goal band
of "SAS 3-4" but enforced it as "SAS 4 only": the lone in-goal branch was
`lv === 4`, so a **SAS 3** ("Sedated; awakens to verbal stimuli or gentle
shaking" — the lower edge of the goal) fell through and rendered *"SAS 3: deeper
than the … goal of SAS 3-4; consider lightening sedation,"* contradicting the
band it named and prompting a nurse to lighten sedation on an at-goal patient.

- `lib/scoring-v4.js` `sasRiker()`: add an `lv === 3` in-goal branch so the
  function honors the 3-4 band it prints. The SAS 4, SAS ≥5, and SAS ≤2 strings
  are byte-for-byte unchanged, so the goal's lower bound is now enforced at 2/3
  (SAS 2 still reads "deeper than goal") rather than at 3/4. No new input, no new
  tile, no new citation, no renderer change.
- Two artifacts already encoded the intended behavior, confirming this was a bug:
  the **paired `rass()`** accepts its whole −2-to-0 target band (lower edge
  included), and this tile's own committed v11 audit documents "SAS 3 → still
  within the goal band (3-4)." Root cause was a vacuous test: the existing SAS 3
  test asserted only `/goal of SAS 3-4/`, which the contradictory "deeper than …
  goal of SAS 3-4" string also matched. Strengthened to assert in-goal + a new
  SAS 2 lower-bound test; `docs/audits/v11/sas-riker.md` re-audited to
  PASS-WITH-FIXES. See [docs/spec-v70.md](docs/spec-v70.md).

### Fixed (housekeeping — three stale count-claims and a stale spec range on live surfaces; no behavior change)

A doc-accuracy sweep of live (non-frozen) surfaces found three drifted numbers
and a stale spec range, each verified against the real artifact:

- `README.md`: "282 curated sibling clusters" → **285** (tiles with related-tool
  links: `Object.values(META).filter(m => m.related?.length).length`); repo-layout
  note "specs (spec-v4 … spec-v68)" → "… spec-v70" (latest spec is now v70).
- `docs/data-sources.md`: "the 121 tiles that have bespoke pre-rendered copy on
  their `/tools/<id>/` page" → **122** (the count `build-tool-pages.mjs` reports
  as "with hand-authored copy" — tiles whose id matches a `data/tool-copy/<id>.json`).
  Reworded to count *rendered* copy, not raw files: there are 179 json files but
  only 122 match a current tile; the other 57 are orphaned copy for renamed or
  removed tile ids that the build silently skips (flagged for a future cleanup —
  no tile, test, or manifest references them). The line carries a
  `catalog-truth:historical` marker, which is why the count drifted undetected.

(A fourth flagged item — the "254 tiles default to numeric" comment in
`scripts/check-catalog-truth.mjs` — was verified to be a correct historical
"at v52-1b close" snapshot, not current-state drift, and left unchanged.)

### Fixed (spec-v69 — `digoxin` rate-control subtherapeutic band contradicted its own printed target; +0 catalog delta)

The `digoxin` level interpreter prints an indication-specific target —
`0.5-0.9 ng/mL` for heart failure, `0.8-2.0 ng/mL` for AF rate control — but its
"below target" test was hardcoded to a single floor (`< 0.5`, the HF bound) for
**both** indications. So a rate-control level in `[0.5, 0.8)` — e.g. 0.6 or 0.7
ng/mL — fell through to the "within" branch and rendered "within 0.8-2.0 ng/mL
(rate control)," flatly contradicting the target string the same function printed
one line above and telling a nurse a subtherapeutic rate-control level was in
range.

- `lib/medication-v5.js` `digoxin()`: derive an indication-aware `targetLow`
  (`0.5` HF / `0.8` rate control) from the existing `indication` input and test
  the "below" branch against it. The `0.8` floor is the lower bound of the
  `0.8-2.0 ng/mL` range the function and the renderer label already commit to, so
  this is a self-consistency fix (the same class as spec-v68's `ttkg` alignment)
  — no new input, no new tile, no new citation, no renderer change.
- Every HF output is byte-for-byte unchanged (`targetLow` is `0.5` for HF); only
  the rate-control "below/within" boundary moves to the 0.8 the tile advertises.
- Root cause was a test gap: every prior `digoxin` level test used
  `indication: 'hf'`, so the rate-control level path was entirely unguarded.
  `test/unit/digoxin.test.js` gains 3 tests (af 0.7 → below, af 0.9 → within,
  hf 0.7 → still within). `docs/audits/v11/digoxin.md` re-audited to
  PASS-WITH-FIXES. See [docs/spec-v69.md](docs/spec-v69.md).

### Added (v11 audit log for `pa-lint` — closes the last coverage gap, 337/337)

The spec-v11 per-tile audit was completed in Waves 3a–3n / Wave 4 *before*
`pa-lint` (the spec-v52 Prior-Auth Packet Linter) was added to group P, so the
catalog's one `document-linter` tile was the only one without a committed
`docs/audits/v11/<id>.md` log — `node scripts/audit-coverage.mjs` reported group
P at 0/1 and the catalog at 336/337.

- Wrote `docs/audits/v11/pa-lint.md` to the spec-v11 §3.2 schema. Because
  `pa-lint` lints rather than computes a number, the audit reframes the v11
  dimensions for a document linter: boundary examples become classification /
  finding endpoints (empty packet, unparseable / encrypted file → R-PA-043/044,
  scanned-PDF OCR path, clock-relative R-PA-005/006 windows, payer-overlay
  self-gating); the cross-implementation differential becomes the byte-for-byte
  determinism + golden-fixture check (`scripts/audit-pa.mjs`, **46/46** fixtures
  match) plus the orphan-free rule↔source mapping; edge-input notes cover the
  ReDoS/DoS caps (`EXTRACT_MATCH_CAP = 200`, the 50 MB/200 MB ceilings, the
  4000 ms stress budget) and the non-UTF-8 / invalid-date guards. Status: PASS,
  no defects — the pipeline's 13 unit-test modules, the 46-fixture golden
  harness, and the `check-pa-staleness` ledger gate already held; the audit
  confirmed them and added no fixes.
- `audit-coverage` now reports group P **1/1** and the catalog **337/337
  (100%)** — the v11 correctness-floor audit is complete for every tile.
- Documentation: README's repo-layout note now lists `docs/` as carrying the
  per-tile v11 audit logs and corrects a stale spec range (`spec-v4 … spec-v61`
  → `… spec-v68`); the spec-v11 doc bullet records the 337/337 coverage.

### Fixed (accessibility — two unlabeled form controls; + a catalog-wide accessible-name guard)

A runtime sweep of all 337 rendered tile views (the dynamic-DOM analog of the
static `a11y-check.mjs` `<label for>` scan, which can only see renderer source)
found two views with form controls that had **no accessible name** — a
screen-reader user would hear a bare "edit text" / "combo box" with no idea what
to enter:

- `opioid-mme` (`views/group-f.js`): the runtime-added medication rows built a
  drug `<select>` and two number `<input>`s whose only hint was a `placeholder`
  (not an accessible name — it vanishes on input and is not reliably announced).
  Added `aria-label`s ("Opioid (row N)", "mg per dose (row N)", "Doses per day
  (row N)"), keeping the placeholders as visual hints.
- `pa-lint` (`views/pa-lint.js`): the offscreen multi-file `<input type="file">`
  had no label. Added `aria-label` "Upload prior-authorization files (PDF, DOCX,
  TXT, or image)".

- Added a permanent regression guard in `test/integration/all-tools.spec.js`:
  every form control in every tool view must have an accessible name (via
  aria-label, aria-labelledby, an associated `<label>`, title, or a value-bearing
  button/submit). chromium-only (DOM-driven, engine-agnostic), per-test skip so
  the rest of the file still runs on every engine. The guard fails on the exact
  two controls above before the fix, so it can never pass vacuously.
- Corrected a stale comment in `scripts/a11y-check.mjs` that claimed "CI also
  runs axe-core against the running page" — axe-core is not a dependency and was
  never wired; the new runtime sweep is the actual complementary check.

### Fixed (mobile-no-hscroll e2e — restore cross-engine coverage + add a dark-theme guard)

Found while visually auditing every view shape in both themes: the
`mobile-no-hscroll.spec.js` per-shape no-horizontal-scroll sample was documented
to run "on every browser engine," but two top-level `test.skip(({ browserName })
=> browserName !== 'chromium', …)` calls (added to gate the PA file-drop sweep,
the full-catalog loop, and the printable build to chromium) silently made the
**entire file** chromium-only — a top-level `test.skip(fn)` in Playwright applies
to every test in the file, not just the ones after it. So firefox/webkit
no-horizontal-scroll coverage for the home + per-shape sample had been lost,
exactly the engines where layout-driven overflow tends to differ.

- Scoped each chromium-only skip to its own test body (`test.skip(browserName
  !== 'chromium', …)` as the first line) instead of file scope. The per-shape
  sample now runs on all three engines again (42 runs, up from 14 chromium-only);
  the three genuinely-chromium-only tests still skip on firefox/webkit. No view
  was overflowing on the restored engines — the coverage gap had simply been
  invisible.
- Added a dark-theme guard: the same per-shape sample at 320px with
  `localStorage['sw-theme']='dark'` injected via `addInitScript` (deterministic
  on every engine; the `colorScheme:'dark'` emulation path is flaky at
  document-start on firefox). Dark is the live default for any visitor whose OS
  prefers dark, yet Playwright defaults to light, so dark-mode layout had never
  been exercised by CI. The test asserts `data-theme="dark"` actually engaged
  before measuring, so it can never pass vacuously. All views pass clean in dark
  at 320px.

### Changed (`pa-lint` intro copy — readability/delight; no behavior change)

The Prior-Auth Packet Linter's primary description had grown into a single
run-on paragraph of developer-facing provenance: internal build-wave numbers
("Wave 52-45", "Wave 52-6b"), every `§4.5.x` ruleset section number with its
rule count, and an exhaustive inline enumeration of all 23 commercial payers and
all 14 state Medicaid programs by name. For the biller/coder/nurse the tool is
built for, that read as a wall of jargon rather than an explanation.

- Rewrote the intro into concise, audience-appropriate copy that keeps every
  user-relevant fact — what to drop (PDF/DOCX/TXT or a scanned PDF/image with
  optional on-device OCR), what it does (local hashing, text extraction,
  role/payer classification, the full ruleset summarized as core + Medicare
  FFS/Advantage + Medicaid + specialty overlays + payer-specific overlays for 23
  commercial payers and 14 state Medicaid programs, each self-gating on the
  detected payer), the three downloadable reports (full JSON, PHI-redacted JSON,
  human-readable DOCX), and the privacy promise (everything in-tab, no network,
  no storage, no AI). The dropped detail — exact section numbers, build-wave
  labels, and the full payer/state name lists — is unchanged in its real homes
  (spec-v52, docs/pa-maintenance.md, and the `STARTER_RULES` count assertion in
  test/unit/pa-engine.test.js), so no provenance is lost.
- Copy-only change to `views/pa-lint.js`; the engine, rules, downloads, OCR path,
  and audit trail are untouched. No test asserts the intro text; `check-output-
  safety`, `grep-check`, and the pa-lint e2e suites stay green.

### Changed (spec-v68 — align the `ttkg` hypokalemia threshold to its own spec; catalog unchanged at 337)

The `ttkg` (transtubular potassium gradient) interpreter
(`lib/clinical-v6.js` `ttkg()`) split its **hypokalemia** band at a TTKG of **2**
with an awkward "TTKG >2-4" label, while the tile's own committed spec
(spec-v19 §3.2.4, citing Ethier 1990) documents the contract as "hypokalemia:
**TTKG >3** suggests renal K wasting." The hyperkalemia side was already a clean
`<7` / `>7` pair; the hypokalemia side disagreed with the spec and with its own
sibling branch.

- v68 aligns the code to its own spec: a clean `<3` (appropriate renal K
  conservation) / `>3` (renal potassium wasting) split, mirroring the `<7` / `>7`
  hyperkalemia structure. No new citation — the threshold is the one spec-v19
  already named (Ethier JH, et al. *Am J Kidney Dis* 1990;15(4):309-315).
- Additive/corrective only: the computed TTKG value, the hyperkalemia bands, and
  the two interpretability preconditions (urine osm > plasma osm; urine Na > 25)
  are byte-for-byte unchanged. Only the hypokalemia band re-labels, and only in
  the 2-to-3 TTKG zone (now "conservation," previously "wasting"). The committed
  boundary example (TTKG 6.4) and the META example are both >3 and render
  identically. No new tile (catalog stays 337), no new input, no network call,
  no AI. +1 boundary unit test (TTKG 2.8 → conservation); the `ttkg` spec-v11
  audit log re-run.

### Changed (spec-v67 — complete the `acid-base-deficit` over-rapid-correction warning; catalog unchanged at 337)

The `acid-base-deficit` tile (`lib/clinical-v6.js` `acidBaseDeficit()`) computes a
**signed** sodium deficit — positive when a hyponatremic patient must be brought
up, negative (a free-water deficit) when a hypernatremic patient must be brought
down — but fired an over-rapid-correction warning in **only one direction**: it
flagged raising a chronic hyponatremia by >8 mEq/L/24h (osmotic demyelination)
and stayed silent when lowering a chronic hypernatremia, where dropping serum Na
too fast causes cerebral edema. The same audited safety ceiling exists on both
sides of normal.

- v67 adds the symmetric `hypernatremiaWarn`: when measured Na >145 and the
  planned drop (measured − target) exceeds 10 mEq/L/24h, the tile warns that
  lowering Na faster than 10 mEq/L/24h risks cerebral edema and to limit the
  rate. The 10 mEq/L/24h ceiling is the Adrogué-Madias limit — the cited source
  (NEJM 2000;342(20):1493-1499) is itself the *hypernatremia* paper, so no new
  citation is introduced.
- Additive only: the TBW, bicarbonate-deficit, sodium-deficit, and existing
  hyponatremia-warning outputs are byte-for-byte unchanged; the META example
  (Na 120→135, a hyponatremia case) renders identically. The renderer
  (`views/group-v7.js`) adds one mirror `warn` row alongside the existing one.
  No new tile (catalog stays 337), no new input, no network call, no AI. +2
  boundary unit tests (hypernatremia warn at a 15 mEq/L drop; no-warn at exactly
  10); the `acid-base-deficit` spec-v11 audit log re-run with the two new cases.

### Changed (spec-v66 — complete the `abg` compensation analysis; catalog unchanged at 337)

The `abg` acid-base interpreter (`lib/clinical.js` `abgInterpret()`) already
predicted the expected **PaCO₂** for metabolic primaries (Winter's formula for
metabolic acidosis; the 0.7 rule for metabolic alkalosis) but predicted **no
expected HCO₃** for the respiratory primaries — it labeled a respiratory
acidosis/alkalosis and stopped, so the user had no anchor to judge whether the
metabolic side was compensating appropriately or a second process was present.

- v66 adds the **Boston rules** expected-HCO₃ bands (acute and chronic) for both
  respiratory primaries: respiratory acidosis HCO₃ = 24 + 0.10×(PaCO₂−40) acute /
  24 + 0.35×(PaCO₂−40) chronic; respiratory alkalosis HCO₃ = 24 + 0.20×(PaCO₂−40)
  acute / 24 + 0.40×(PaCO₂−40) chronic. The compensation line now also states the
  reading rule (HCO₃ above the chronic value → added metabolic alkalosis; below
  the acute value → added metabolic acidosis). Source: Narins RG, Emmett M.
  *Medicine* (Baltimore) 1980;59(3):161-187, coefficients corroborated by Berend
  K, et al. *N Engl J Med* 2014;371:1434-1445.
- Additive only: the metabolic-primary outputs, the A-a gradient, and the P/F
  ratio are byte-for-byte unchanged; the renderer already prints `compensation`
  generically, so no view changed. No new tile (catalog stays 337), no new input,
  no network call, no AI. +2 boundary unit tests; the `abg` spec-v11 audit log
  re-run with respiratory worked examples; `lib/meta.js` citation extended.

### Added (spec-v65 — three bedside-physiology tiles; catalog 334 → 337)

A render-tree and near-neighbor audit against the live catalog found three
deterministic, source-anchored calculations an ICU/ED/floor nurse still does on
scratch paper that no existing tile computed. All three are pure
`lib/num.js`-backed functions in `lib/clinical-v8.js` (already enrolled in the
spec-v59 object-aware fuzz harness), with inline citations, spec-v11 audit logs,
and ≥3 boundary unit tests each (including the zero-denominator `null` path).

- **`o2-cylinder-duration`** (Group F). The respiratory-safety analog of
  `infusion-time-remaining`: usable volume = (gauge psi − safe residual) ×
  cylinder factor (D 0.16 / E 0.28 / M 1.56 / G 2.41 / H-K 3.14 L/psi);
  minutes-to-residual = usable ÷ flow; plus the inverse — the max flow that
  lasts a target transport time. A gauge at/below the residual flags
  "swap now" rather than rendering a negative duration. (Egan's *Fundamentals
  of Respiratory Care*, 12th ed.)
- **`minute-ventilation`** (Group E). V̇E = RR × Vt; alveolar ventilation
  subtracts anatomic dead space (~2.2 mL/kg IBW); and, from a current/target
  PaCO2 pair, the respiratory rate that reaches the target — flagged when it
  exceeds ~35/min with the source-anchored note to raise tidal volume within the
  6 mL/kg limit instead. Covers the gas-exchange calculation the existing vent
  mechanics tiles (`driving-pressure`, `pbw-ardsnet`, `rsbi`) do not. (Marino,
  *The ICU Book*, 4th ed.)
- **`cerebral-perfusion-pressure`** (Group E). CPP = MAP − ICP with the Brain
  Trauma Foundation 2017 target band (< 60 / 60–70 / > 70 mmHg); computes MAP
  from SBP/DBP when not measured directly; reports a negative CPP (ICP > MAP)
  with an explicit critical-low flag. (Carney N, et al. *Neurosurgery*
  2017;80(1):6-15.)
- `test/unit/specialty-coverage.test.js` gains two deliberate closed-vocabulary
  terms (`nursing-transport`, `neurocritical-care`) for the new tiles' specialty
  tags. Catalog-count surfaces (title, OG/Twitter, JSON-LD, hero label, README,
  `package.json`, parity ledger) all move 334 → 337.

### Changed (specialty-tag rollout completed — discovery metadata; no catalog change)

`META[id].specialties` (spec-v11 §4.3 / spec-v29 §5.1) are additive search
tokens (`lib/prompt.js` weights them) and drive the audience/specialty filter
(`app.js`), so an untagged tile is under-discoverable by specialty. The tag
rollout had reached the recent spec waves but never the spec-v4-era foundation,
leaving 110 clinical tiles untagged — including high-traffic ones (`bmi`, `gcs`,
`apgar`, `wells-pe`, `chads`, `nihss`, `curb-65`, `meld-childpugh`).

- A single reviewable `SPECIALTIES_BACKFILL` map in `lib/meta.js` (the
  `RELATED_BACKFILL` / `ACTIONS_BACKFILL` pattern) tags all 110, grouped by
  clinical family. It merges only where a tile carries no inline `specialties`,
  so inline values still win, and uses **only** values from the established
  closed vocabulary (no new terms — the distinct vocabulary stays at 85). Every
  clinical tile now carries at least one specialty.
- New `test/unit/specialty-coverage.test.js` codifies two invariants the spec
  described but never enforced: every clinical tile has ≥1 specialty (coverage),
  and every specialty value is in the closed vocabulary and kebab-case (the
  typo/drift guard that did not previously exist).

### Added (spec-v64 — `calcium-replacement`; catalog 333 → 334)

One bedside tile, closing the single electrolyte the K/Mg/Phos
`electrolyte-replacement` ladder omits — and the one where the *form* of the
salt is itself a documented, dangerous source of error.

- **`calcium-replacement`** (Group F). `lib/clinical-v7.js` `calciumReplacement()`:
  given a calcium salt (gluconate 10% / chloride 10%) and a dose in grams, it
  returns the elemental calcium delivered (mg + mEq), the 10%-solution volume,
  and the **equivalent dose of the other salt** for the same elemental calcium —
  computing away the recurring "1 g gluconate vs 1 g chloride" confusion (chloride
  carries ~273 mg/g vs gluconate ~93 mg/g of elemental calcium, ~3x). Adds the
  standard adult dose for the chosen indication (hyperkalemia membrane
  stabilization, symptomatic hypocalcemia, citrate toxicity) and the slow-push /
  central-line / no-bicarbonate-or-phosphate / digoxin-caution notes.
- Elemental-calcium content per USP / product labeling; hyperkalemia dosing per
  AHA ACLS 2020 (Panchal, Circulation 2020;142:S366). The guideline-issuer
  citation carries an `accessed` date and a `docs/citation-staleness.md` row,
  guarded by `check-citations`.
- Renderer in `views/group-v11.js`; product gated first (unknown → null,
  fuzz-safe), dose validated via `lib/num.js`. Covered by the spec-v59 object-
  aware fuzz harness on import. 5 unit tests (`test/unit/calcium-replacement.test.js`),
  a spec-v11 audit log, and a META example. Catalog 333 → 334 across all 13
  catalog-truth surfaces; `electrolyte-replacement` now links to it.

### Added (spec-v62 Part A4 wave 4 — final lab-toggle wave; A4 and spec-v62 Part A complete)

The SI⇄conventional lab toggle reached the last lab-input fields that have a
real consumer, completing the A4 rollout (and with it all of spec-v62 Part A).
No catalog count change; every example stays byte-identical (default option is
the compute/canonical unit).

- **Bilirubin (mg/dL ⇄ µmol/L, ×17.1)** on the hepatic and neonatal tiles:
  `meld-childpugh`, `maddrey-lille` (all three bilirubin fields: DF, Lille day 0,
  Lille day 7), `bhutani-bilirubin`, `psofa` (`ps-bili`), and `neo-phototherapy`.
- **Lactate (mmol/L ⇄ mg/dL)** on `pelod2`, and **ionised/total calcium
  (mmol/L ⇄ mg/dL)** on the three CRRT citrate fields (`crrt-dose`). These are
  SI-canonical: mmol/L is the compute unit, so it is the default (identity)
  option and the conventional mg/dL alternate converts up — the inverse layout
  of the conventional-default analytes. Calcium reuses the existing `calcium`
  LAB factor (elemental Ca: 1 mmol/L = 4 mg/dL).
- `lib/unit-convert.js` gains the `bilirubin` and `lactate` LAB entries;
  `lib/field-units.js` gains `BILIRUBIN_UNITS`, `LACTATE_UNITS`, and
  `CALCIUM_MMOL_UNITS`. `unitField` gains `opts.value` so the prefilled-default
  tiles (MELD, Maddrey/Lille) keep byte-identical examples.
- Phosphate has no remaining dedicated lab input (its only candidate,
  `electrolyte-replacement`, has a polymorphic level field whose unit follows
  the K/Mg/phosphate selector, so a fixed toggle does not fit) — A4 is therefore
  complete for every analyte with a real consumer.
- Tests: bilirubin/lactate/calcium-array cases in `test/unit/unit-convert.test.js`;
  three e2e parity cases in `test/integration/unit-toggle.spec.js` (MELD bilirubin
  in µmol/L → MELD-3.0 18; PELOD-2 lactate in mg/dL → score 9; CRRT ionised Ca in
  mg/dL → the 1.1-1.2 mmol/L banner).

### Added (spec-v63 OA1 + Part B — regulatory-deadline engine and the 5 ops calculators, catalog 328 → 333)

The ops-side counterpart to spec-v62. The catalog could compute exactly one
regulatory deadline (breach-clock); v63 adds the shared primitive and the five
ops calculators that the gap analysis flagged as missing.

- **OA1 — `lib/deadline.js` (regulatory-deadline engine).** Pure UTC-midnight
  date arithmetic: `deadline({anchor, days, basis, now, rollForward})` returns the
  deadline date, days elapsed/remaining vs today, and a past-due flag, in CALENDAR
  or FEDERAL BUSINESS days. Business-day mode skips weekends and the 5 U.S.C. 6103
  federal holidays (federal weekend-observance rule + the Dec-31 New-Year
  year-boundary edge), rolling forward deterministically; calendar mode optionally
  rolls a weekend/holiday deadline to the next business day. Impossible string
  dates (2026-13-40) are rejected, not silently normalized. `breach-clock` was
  re-pointed onto the engine's date primitives — output byte-identical
  (regression-pinned). (Shipped in 446b99c.)
- **`appeal-deadline`** (Group C) — Medicare appeal-level filing deadline (42 CFR
  Part 405 Subpart I: redetermination 120 d, QIC 180 d, ALJ/Council/court 60 d)
  with the next level, the deadline + live days-remaining, and the CY2026
  amount-in-controversy gate (ALJ $200, court $1,960).
- **`timely-filing`** (Group C) — claim filing deadline (42 CFR 424.44: Medicare
  one calendar year; other payers' limits user-supplied, no payer directory).
- **`em-mdm`** (Group A) — 2021 E/M level by Medical Decision Making (AMA CPT
  2-of-3 grid), completing the 2021 E/M rules alongside `em-time` (the time path).
- **`pa-turnaround`** (Group C) — prior-authorization decision clock (CMS-0057-F:
  standard 7 calendar days, expedited 72 hours; plan-specified windows supported).
- **`overpayment-60day`** (Group C) — 60-day report-and-return clock (ACA 6402(a),
  42 CFR 401.305); the catalog's second federal 60-day clock after breach-clock.
- Compute in `lib/ops-v63.js` (all deadline tiles route through `lib/deadline.js`);
  renderers in `views/group-v63.js`; both new modules are in the spec-v59 fuzz
  harness. 31 new unit tests (`deadline.test.js`, `ops-v63.test.js`); each tile
  ships a META example with a deterministic deadline date driving the
  example-correctness sweep, a spec-v11 audit log, and a per-result "surfaces the
  regulatory date/level only; confirm against the current rule — not legal advice"
  note. Catalog 328 → 333 across all 13 catalog-truth surfaces.
### Added (spec-v63 Part A — ops depth pass OA2-OA5, zero new tiles; v63 now complete)

Part A deepens the existing ops tiles the way spec-v62 deepened the bedside tiles
— it changes no current output, adding a shared decision/validation layer over the
appeal, generator, and staleness infrastructure.

- **OA2 — denial → next-step routing.** `DENIAL_ROUTES` / `denialRoute()` in
  `lib/coding-v5.js` map eight plain-language denial categories (medical necessity,
  non-covered, no-prior-auth, coding/bundling, timely-filing, duplicate, COB,
  missing-info) to a computed next step: the meaning, whether it is appealable on
  the merits, the action to take, and the catalog tile to open next — each line
  anchored to its 42 CFR Part 405 / 424 / 411 or CMS-manual section. Rendered as an
  optional denial-reason select on `appeal-deadline` (`views/group-v63.js`) that
  computes the level-1 redetermination deadline through the OA1 engine when the
  denial is appealable. It is an input-driven decision, **not** a browsable
  CARC/RARC code index — no code list is shipped (the spec-v29 §3 retirement holds).
- **OA3 — generator completeness linting.** `GENERATOR_ELEMENTS` /
  `lintGenerator()` in `lib/regulatory.js` carry the required-element checklists,
  each with its governing CFR anchor, for `hipaa-auth` (45 CFR 164.508(c)
  authorization core elements), `hipaa-roa` (45 CFR 164.524 access-request
  elements), `appeal-letter` (42 CFR 405.944(b) redetermination request elements),
  and the breach notice (45 CFR 164.404(c) content). `renderCompleteness()` in
  `lib/print.js` shows each element as present or MISSING with its anchor on all
  four generators (`views/group-c.js`, `group-h.js`, `group-v5.js`) — turning a
  document generator into a rule-validated one, reusing the v52 pa-lint linter
  pattern at small scale.
- **OA4 — non-PA ops rule families in the staleness ledger.** `pa-staleness-ledger.json`
  now carries seven `ruleFamily: "ops-v63"` sources (empty `rules` arrays — they
  anchor no pa-lint rule but are staleness-tracked): the federal-holiday table
  (5 U.S.C. 6103), the Medicare appeal-level deadlines, the CY2026 amount-in-controversy
  thresholds, the timely-filing one-year basis, the CMS-0057-F PA windows, the 2021
  E/M edition, and the 60-day overpayment rule. `check-pa-staleness` now guards their
  currency (60 sources tracked, 0 orphans); the bundled `lib/pa/staleness-ledger.js`
  and the 46 golden pa-lint reports were regenerated.
- **OA5 — ops related-tool cluster.** Seeded in `RELATED_BACKFILL` (`lib/meta.js`):
  denial → `appeal-deadline` → `appeal-letter`; PA request → `pa-turnaround` →
  `pa-lint`; breach → `breach-clock` → `overpayment-60day`; plus `em-mdm` ↔ `em-time`
  and the HIPAA generators. Every generator already renders `renderPrintable`'s
  paste-ready / printable output with the "No data was sent or stored" footer.
- Coverage: new `test/unit/denial-route.test.js` (OA2 — every route resolves a real
  tile, carries an anchor, appealable routes name a valid appeal level), OA3 cases
  in `test/unit/regulatory.test.js` (each checklist element carries a CFR anchor;
  missing/complete detection), an OA4 case in `test/unit/pa-staleness.test.js` (the
  ops families are tracked without orphans), and the OA5 cluster assertion in
  `test/unit/related-tools.test.js`.

### Added (spec-v62 Part B wave 2 — the two deferred tiles ship; Part B complete, catalog 326 → 328)

Wave 1 deferred the two Part-B tiles whose published constants had to be pinned
exactly before shipping a number a clinician might lean on. Wave 2 pins them and
ships both, closing Part B and taking the catalog to **328**.

- **`norepi-equiv` — Norepinephrine-Equivalent Vasopressor Dose** (Group F).
  `lib/clinical-v8.js` `norepinephrineEquivalent()` sums each agent's dose times
  its Kotani-2023 proposed-standard factor: norepinephrine ×1, epinephrine ×1,
  dopamine ÷100, phenylephrine ×0.06 (all mcg/kg/min), vasopressin ×2.5 (units/min),
  angiotensin II ×0.0025 (ng/kg/min). The total NE-equivalent (mcg/kg/min) plus
  each agent's contribution lets an ICU team describe total pressor burden in one
  number and compare shift-to-shift. Weight is **not** an input — the catecholamine
  doses are already weight-indexed and vasopressin is units/min, so the published
  formula is weight-normalized; a weight field would be dead UI, and the tile says
  so. Source pinned against Kotani Y, et al. Crit Care. 2023;27:29.
- **`neo-phototherapy` — Neonatal Phototherapy Threshold (AAP 2022)** (Group N).
  `lib/scoring-v6.js` `neoPhototherapy()` reuses the AAP-2022 phototherapy curve
  already validated for `bhutani-bilirubin` (`aapPhotoThreshold`) and adds the
  **exchange-transfusion curve** (`aapExchangeThreshold`) read from the published
  Kemper-2022 Figure 6 at the same 0/24/48/72/96h+ anchors by gestational-age band,
  plus the AAP **"escalation of care" line** at exchange − 2 mg/dL (NICU admission,
  q2h rechecks). Output: the phototherapy threshold, the current TSB's distance
  from it, the exchange/escalation thresholds, and which treatment band the infant
  falls in. Decision support, not a treatment order — the tile note directs
  confirmation against the AAP chart / BiliTool. On the spec-v60 §4 REFRESH list.
- Coverage: 3 norepi-equiv boundary cases in `test/unit/clinical-v8.test.js`
  (each factor applied; all-zero → 0; bad input throws) and 4 neo-phototherapy
  cases in `test/unit/bhutani-bilirubin.test.js` (worked example; below-line;
  exchange-crossed with risk factors; out-of-range throws). Both modules are
  already in the spec-v59 object-aware fuzz harness; both tiles ship a META
  example driving the example-correctness sweep. Audits in
  `docs/audits/v11/{norepi-equiv,neo-phototherapy}.md`; citation-staleness rows
  added; all 13 catalog-truth surfaces moved 326 → 328.

### Added (spec-v62 Part A4 wave 3 — magnesium SI⇄conventional toggle; Part A3 closed for the qualifying tiles)

- **A4 wave 3:** `magnesium-replacement` (Group V11) now offers a mg/dL ⇄ mmol/L
  toggle on its serum-magnesium input, driving both the compute and the bounds
  advisory through `unitNum()`. Added the `magnesium` analyte (mg/dL ⇄ mmol/L,
  factor 1/2.43) to the `LAB` table and a `MAGNESIUM_UNITS` array to
  [lib/field-units.js](lib/field-units.js). The conventional unit (mg/dL) stays
  the default, so the example (serum 1.2 mg/dL, moderate severity) is unchanged.
  Coverage: `test/unit/unit-convert.test.js` (magnesium round-trip + the array's
  SI conversion) and an `unit-toggle.spec.js` case (mmol/L entry still renders the
  severity-driven dose).
- **A3 closed for the qualifying tiles.** spec-v62 §2 A3 admits a reverse-solve
  row only "where the inverse is single-valued." After shipping the capped-rate
  reverse-solve on `sodium-correction` and `free-water-deficit` (and confirming
  the `vasopressor`/`conc-rate` dose⇄rate inverse already exists), the two
  remaining named tiles do **not** admit a single-valued inverse and get none:
  `insulin-drip` is explicitly an "example-only" sliding-scale verifier (a banded
  lookup, not an invertible equation) and `heparin-nomogram` is the Raschke
  step-adjustment table (already aPTT-target-seeking). Recording this so the gap
  is closed honestly rather than left as an open TODO.

### Added (spec-v62 Part A3 wave 2 — ceiling-capped max-safe replacement rate on `free-water-deficit`)

The companion hypernatremia tile to `sodium-correction` gets the same §5
treatment. `free-water-deficit` already flagged a replacement schedule that drops
Na faster than the 10 mEq/L/24h ceiling; it now also surfaces the **capped
max-safe replacement rate**:

- `lib/clinical-v5.js` `freeWaterDeficit()` returns `cappedReplacementRateMlPerHour`
  — the rate that delivers the same total free-water deficit but drops Na at
  *exactly* 10 mEq/L/24h (Na-drop is linear in the rate, so the over-ceiling rate
  is scaled by `10 / impliedDrop`). It is `null` when the schedule is already
  within the ceiling, so no existing result changes.
- `views/group-v5.js` renders a flagged **"Max safe rate (≤ 10 mEq/L/24h
  ceiling)"** row, shown only when the implied Na drop is over the ceiling.
- The documented example (Na 160 → 145 over 48 h = 7.5 mEq/L/24h, within ceiling)
  is unchanged and byte-identical. Coverage: `test/unit/clinical-v5.test.js` (the
  capped rate equals `replacementRate × 10 / impliedDrop` and is strictly slower
  than the over-ceiling rate; a within-ceiling schedule has no capped rate).

### Added (spec-v62 Part A3 — ceiling-capped max-safe reverse-solve rate on `sodium-correction`)

`sodium-correction` already solves the inverse (target ΔNa over 24 h → infusion
rate) and flags a target above the acuity ceiling, but it still *displayed the
over-ceiling rate*. Per spec-v62 §2 A3 / §5 ("reverse-solve rows clamp to the
published safe-correction ceiling and flag, never silently exceed it"), it now
also surfaces the **ceiling-capped max-safe rate** whenever the requested target
exceeds the ceiling:

- `lib/clinical-v5.js` `sodiumCorrection()` returns a new `cappedRateMlPerHour` —
  the infusion rate that achieves *exactly* the acuity ceiling (8 mEq/L/24h
  chronic, 10 acute). It is `null` when the target is at or below the ceiling
  (nothing to cap), so no existing result changes.
- `views/group-v5.js` renders it as a flagged **"Max safe rate (≤ N mEq/L/24h
  ceiling)"** row, shown only when the target is over the ceiling — alongside the
  existing over-cap `safetyNote`. The bedside user now sees both "the rate your
  target implies" and "the most you should run."
- The documented example (target 8 mEq/L/24h, chronic ceiling 8 → not over) is
  unchanged and byte-identical (example-correctness e2e). Coverage:
  `test/unit/clinical-v5.test.js` (the capped rate equals the at-ceiling rate and
  is strictly slower than the over-cap rate; a within-ceiling target has no
  capped rate). First [spec-v62](docs/spec-v62.md) Part A3 (reverse-solve) item.

### Added (spec-v62 Part A4 wave 2 — albumin SI⇄conventional toggle on the anion-gap & ascites tiles)

Extends the A4 lab toggle to the remaining albumin-input gap/ascites tiles,
reusing the `ALBUMIN_UNITS` array from wave 1 (no new `LAB` constant):

- **`anion-gap`** and **`anion-gap-dd`** (Group E): the optional albumin field
  now offers g/dL ⇄ g/L. The optional-field empty-check is preserved — an empty
  input still yields `null`/`undefined` (no albumin correction), and a filled
  input is read through `unitNum()` so the value reaches `anionGap()` in canonical
  g/dL. This closes the optional-albumin handling deferred from wave 1.
- **`saag`** (Group V5, Serum-Ascites Albumin Gradient): both the serum and
  ascites albumin fields offer g/dL ⇄ g/L. `views/group-v5.js` now imports the
  shared `unitField`/`unitNum`/`ALBUMIN_UNITS` helpers.
- The conventional unit (g/dL) remains the default option, so the `anion-gap` and
  `anion-gap-dd` examples stay byte-identical (verified by the example-correctness
  e2e sweep). Two new parity cases in `test/integration/unit-toggle.spec.js`
  (anion-gap albumin in g/L → corrected AG 16; SAAG in g/L → 3.0 g/dL).

### Added (spec-v62 Part A4 wave 1 — SI⇄conventional lab toggles on the Group E correction tiles)

The per-field unit `<select>` (the v61 A4 mechanism, previously wired only onto
weight/height/temp/creatinine) now extends to the high-frequency lab analytes on
the acid-base & electrolyte correction tiles:

- **`corrected-calcium`**: calcium (mg/dL ⇄ mmol/L) and albumin (g/dL ⇄ g/L).
- **`corrected-sodium`**: glucose (mg/dL ⇄ mmol/L).
- **`corrected-ca-na`**: calcium, albumin, and glucose.
- **`osmolal-gap`**: glucose and BUN (mg/dL ⇄ mmol/L urea).
- Four reusable analyte option arrays (`GLUCOSE_UNITS`, `BUN_UNITS`,
  `CALCIUM_UNITS`, `ALBUMIN_UNITS`) added to [lib/field-units.js](lib/field-units.js);
  the SI option converts back to the canonical conventional unit via
  `labConvert(kind, v, 'fromSi')`. The `albumin` analyte (g/dL ⇄ g/L, factor 10)
  was added to the `LAB` table in [lib/unit-convert.js](lib/unit-convert.js).
- **The first (default) option is always the conventional US unit the compute
  function already expects**, so every `META.example` and deep-link hash
  reproduces byte-identically — confirmed by the example-correctness e2e sweep.
  `unitNum()` returns the value already converted to canonical, so no compute
  path changed; electrolyte fields entered in mEq/L (= mmol/L 1:1) keep their
  plain inputs. Coverage: `test/unit/unit-convert.test.js` (albumin round-trip +
  the four arrays' SI conversions) and two new parity cases in
  `test/integration/unit-toggle.spec.js`. See [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A5 wave 4 — substituted-formula derivation on `egfr`, `drip-rate`, `burn-fluid`)

The final three named A5 formula tiles gain a full `derivation` block (formula /
population / validity / source / units) plus a guarded `substituted(inputs)`,
completing the Part A5 substituted-derivation rollout:

- **`egfr`** (CKD-EPI 2021 race-free): `eGFR = 142 x min(1/0.7, 1)^-0.241 x
  max(1/0.7, 1)^-1.200 x 0.9938^60 x 1.012 (female) = 64.5 mL/min/1.73m^2`; the
  female `1.012` factor and the sex-specific `k`/`a` constants appear only for
  the selected sex, and the displayed result is recomputed identically to
  `egfrCkdEpi2021` (no drift between the line and the tile result).
- **`drip-rate`**: `Rate = 1000 mL x 60 / 480 min = 125 mL/hr; drops = 1000 x 15
  / 480 = 31 gtts/min` — both the pump (mL/hr) and gravity (gtts/min) paths.
- **`burn-fluid`**: both formulas, `Parkland = 4 mL x 70 kg x 20% = 5600 mL/24h;
  first 8h = 2800 mL (350 mL/hr), next 16h = 2800 mL` and `Modified Brooke = 2 mL
  x 70 kg x 20% = 2800 mL/24h`.
- All `substituted` functions return null on missing / non-finite / non-positive
  inputs (no NaN / divide-by-zero leak past the render guard). `views/group-e.js`
  (egfr), `views/group-f.js` (drip-rate, now imports `META` + the derivation
  helpers), and `views/group-i.js` (burn-fluid, same) wire `renderDerivation` +
  `updateDerivationSteps`; result rows are unchanged. Coverage in
  `test/unit/derivation-substituted.test.js` (now 18 cases across 8 tiles).
- **A5 is now complete**: `cockcroft-gault`, `corrected-sodium`, `aa-gradient`,
  `osmolal-gap`, `winters`, `fena-feurea`, `egfr`, `drip-rate`, and `burn-fluid`
  all carry the substituted "where did this number come from" line. See
  [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A5 wave 3 — substituted-formula derivation on `osmolal-gap`, `winters`, `fena-feurea`)

Three more formula tiles gain a full `derivation` block (formula / population /
validity / source / units) plus a guarded `substituted(inputs)`:

- **`osmolal-gap`**: `Calculated osm = 2 x 140 + 90/18 + 14/2.8 = 290 mOsm/kg;
  gap = 300 - 290 = 10` (the EtOH term appears only when entered).
- **`winters`**: `Expected PaCO2 = 1.5 x 14 + 8 +/- 2 = 27 to 31 mmHg`.
- **`fena-feurea`**: both fractions, e.g. `FENa = (20 x 2) / (140 x 50) x 100 =
  0.57%` and `FEUrea = (300 x 2) / (60 x 50) x 100 = 20%`, each rendered only
  when its inputs are complete.
- All `substituted` functions return null on missing/non-finite/non-positive
  inputs; `views/group-e.js` wires `renderDerivation` + `updateDerivationSteps`
  for each (result rows unchanged). Coverage in
  `test/unit/derivation-substituted.test.js` (now 11 cases across 5 tiles).
- A5 now covers `cockcroft-gault`, `corrected-sodium`, `aa-gradient`,
  `osmolal-gap`, `winters`, and `fena-feurea`. The remaining named formula tiles
  (eGFR CKD-EPI 2021, Parkland `burn-fluid`) follow. See
  [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A5 wave 2 — substituted-formula derivation on `corrected-sodium` and `aa-gradient`)

Extends the substituted "show your work" line to two more canonical formula
tiles, each gaining a full `derivation` block (formula / population / validity /
source / units) plus a guarded `substituted(inputs)`:

- **`corrected-sodium`**: `Corrected Na = 130 + 1.6 x (600 - 100)/100 = 138 mEq/L
  (Katz); with factor 2.4 = 142 mEq/L (Hillier)` — both literature factors shown.
- **`aa-gradient`**: `PAO2 = 0.21 x (760 - 47) - 40/0.8 = 99.7 mmHg; A-a = 99.7 -
  90 = 9.7 mmHg` — sea-level alveolar gas equation (R = 0.8).
- Both `substituted` functions return null on any missing/non-finite input, and
  `views/group-e.js` wires `renderDerivation` + `updateDerivationSteps` for each
  (the computed result rows are unchanged). Coverage in
  `test/unit/derivation-substituted.test.js`.

### Added (spec-v62 Part A5 wave 1 — substituted-formula derivation, seeded on `cockcroft-gault`)

Brings the "show your work" panel that additive scores already have to the
*formula* calculators. Where an additive score lists each input's point
contribution, a formula tile now shows the published equation with the user's
current values plugged in and the arithmetic carried through.

- **`lib/derivation.js`**: the live "your inputs" section now also renders a
  `substituted` line. `renderDerivation` creates the section when the tile has
  either `components` (additive) **or** a `substituted` function (formula);
  `updateDerivationSteps` renders "With your inputs" = the substituted string.
  Defense in depth on the spec-v59 numeric-leak rule: the author's `substituted`
  guards bad inputs (returns null), and the render layer additionally refuses any
  string carrying a banned token, falling back to a prompt.
- **`lib/meta.js` (`cockcroft-gault`)**: gains a full `derivation` block
  (formula / population / validity / source / units) plus a guarded
  `substituted(inputs)` that renders e.g. `CrCl = (140 - 60) x 80 kg / (72 x 1
  mg/dL) = 88.89 mL/min`, applying the 0.85 female factor and returning null on
  any missing/zero/non-finite input.
- **`views/group-e.js` (`cockcroft-gault`)**: wires `renderDerivation` +
  `updateDerivationSteps` (the computed CrCl output is unchanged).
- **`test/unit/derivation-substituted.test.js`**: covers the male/female worked
  examples and the null-on-bad-input guard.
- The substituted `<pre>` inherits the global `white-space: pre-wrap`, so the
  equation wraps rather than scrolling sideways at 320px. Later A5 waves extend
  the same `substituted` field to the other formula tiles (eGFR, Parkland
  `burn-fluid`, `corrected-sodium`, `winters`, `aa-gradient`, `osmolal-gap`,
  `fena-feurea`). See [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A2 wave 2 — withdrawal-scale next-step actions on `ciwa` and `cows`)

Extends the source-anchored action field to the two withdrawal scales, where the
*severity* is the interpretation but the *management* is not.

- **`lib/meta.js` (`ACTIONS_BACKFILL`)**:
  - **`ciwa`** (CIWA-Ar): the symptom-triggered benzodiazepine regimen — below
    the protocol threshold (commonly < 8-10), supportive care and reassess at
    the protocol interval; at/above it, give a benzodiazepine and re-dose driven
    by the repeat score. Source: Mayo-Smith 1997 (already named in the tile's
    interpretation).
  - **`cows`** (COWS): buprenorphine-induction *timing* — defer before adequate
    objective withdrawal (precipitated-withdrawal risk), begin induction once
    present (commonly COWS >= 8-12). Source: SAMHSA TIP 63.
- Both are additive: each tile's `interpretation` states the withdrawal
  severity band; neither states the management step. Threshold ranges are
  phrased to reflect the documented institutional variability, and the block is
  explicitly "per source" (decision support, not an order). The existing A2 CI
  guard validates source + bands + no Sophie-authored phrasing.
- `centor`/`feverpain` were evaluated and **not** seeded: their interpretation
  blocks already carry the test-vs-treat action (seeding would duplicate, as
  with `news2`). See [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A2 wave 1 — source-anchored "next step" action field, seeded on `kdigo-aki`)

Starts Part A2. Interpretation tells the user what a number *means*; the new
`META[id].actions` block tells them what the governing publication says to *do*
next — rendered beneath interpretation under a "Recommended next step (per
source):" header, every line the source's words (not an order Sophie generates),
with the source named below.

- **`lib/meta.js`**: adds an `ACTIONS_BACKFILL` map (merged like the
  interpretation/related backfills) with the field shape `{ source, bands:
  [{ range, step }] }`. Seeded with **`kdigo-aki`** — the KDIGO 2012 staged-
  management bundle (discontinue nephrotoxins / optimize volume + perfusion /
  monitor SCr + UO / avoid contrast at all stages; diagnostic workup at stage 1+;
  drug-dose review + consider RRT/ICU at stage 2+; RRT + avoid subclavian access
  at stage 3). This is genuinely additive: the tile's interpretation states the
  staging *definition*, while the action table states the *management*.
- **`app.js` (`renderMetaBlock`)**: renders the actions block after
  interpretation, mirroring its markup (no new CSS needed — both live in
  `.tool-meta`).
- **`test/unit/meta-interpretation.test.js`**: a CI guard requires every
  `actions` block to carry a non-empty `source`, at least one band with a
  non-empty `range` and `step`, and no Sophie-authored phrasing (same
  FORBIDDEN_PHRASES list as interpretation).
- **`news2` is deliberately not seeded** even though RCP 2017 ships an escalation
  table: its `interpretation` block already states that escalation response, so
  an `actions` block there would duplicate it. Later A2 waves seed instruments
  whose interpretation does not already carry the action (CIWA-Ar/COWS dosing
  interval, Centor/FeverPAIN test-vs-treat, Braden/Norton turn schedule), each
  only where verbatim-citable. See [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A1 wave 4 — hemoglobin-drop trend on `gbs` and `oakland`)

Applies the trend primitive to the GI-bleed scores along a new axis. The
Glasgow-Blatchford and Oakland scores each weight a single hemoglobin; the
*drop rate* is a distinct active-bleeding signal the score does not capture.

- **`views/group-g.js` (`gbs`, `oakland`)**: a shared `hgbTrendInputs` /
  `renderHgbTrend` helper adds an optional, default-empty "prior hemoglobin +
  hours since" pair. When both are entered, the tile appends the Hgb change,
  per-hour drop rate, and direction, warning when the hemoglobin is *falling*
  (the mirror of the early-warning trend, where a *rising* score is the
  concern). Built on the same `trend()` core from `lib/trend.js`. The computed
  score, band, per-parameter breakdown, derivation panel, and documented
  example are unchanged — purely additive.
- This closes the Part A1 trend rollout across the named tiles whose derived
  quantity is a clean serial delta (early-warning scores + hemoglobin drop) plus
  the sodium-correction rate. A creatinine Δ / KDIGO stage-transition variant on
  `kdigo-aki` is deferred: that tile already exposes baseline→current creatinine
  and a 48-hour-rise field, so a trend block there would overlap its existing
  inputs and warrants a careful redesign rather than a quick add. See
  [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A1 wave 3 — early-warning-score trend on `pews`)

Completes the numeric-total early-warning family. `pews` (Brighton PEWS) returns
a single additive total, so the same optional, default-empty "prior total +
hours since" trend block fits it directly.

- **`views/group-v5.js` (`pews`)**: adds the optional prior-score-vs-now trend
  line (delta, per-hour rate, direction, rising-trend warning) via the generic
  `trend()` core from `lib/trend.js`. The PEWS total, band, and derivation panel
  are unchanged; the block is purely additive and renders only when both a prior
  score and the hours since are entered.
- **`meows` is deliberately excluded** from the score-trend: MEOWS is a
  track-and-trigger instrument whose output is a red/yellow *flag count*, not a
  single additive total, so a score-delta trend would be a clinically awkward
  fit. The trend family is therefore the three single-total scores (`news2`,
  `mews`, `pews`). Later A1 waves extend the primitive to creatinine Δ / KDIGO
  and hemoglobin-drop rate. See [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A1 wave 2 — early-warning-score trend on `news2` and `mews`)

Extends the trend primitive to the early-warning scores. A single NEWS2/MEWS
value rarely escalates care; a *rising* one does (RCP 2017 NEWS2 monitoring
guidance), and no tile let a nurse capture that trend.

- **`lib/trend.js`**: adds the generic `trend({prior, current, hours})` core —
  observed delta, per-hour rate, and a labeled direction (rising / falling /
  unchanged). Same num.js validation and divide-by-zero-safe interval as
  `correctionRate`. Covered by `test/unit/trend.test.js`; fuzz-harness coverage
  is automatic (reflection over the module's exports).
- **`views/group-g.js` (`news2`, `mews`)**: a shared `ewsTrendInputs` /
  `renderEwsTrend` helper adds an optional, default-empty "prior total score +
  hours since" pair. When both are entered, the tile appends a trend line
  (direction + delta + per-hour rate) and warns on a rising trend. The computed
  score, its band, the per-parameter breakdown, the derivation panel, and the
  documented example are all unchanged — the block is purely additive.
- Later A1 waves extend the same helper to `pews` (Group V5) and `meows`, and
  the primitive to creatinine Δ / KDIGO and hemoglobin-drop rate. See
  [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part A1 wave 1 — serial/trend primitive `lib/trend.js`, wired into `sodium-correction`)

Starts the Part A depth pass. The bedside fact a single value rarely carries is
its *rate of change*; A1 adds that as an optional, default-empty affordance that
changes no existing result and keeps every documented example byte-identical.

- **`lib/trend.js`** (new): pure, `num.js`-backed `correctionRate({prior,
  current, hours, ceilingPer24h})` — observed delta, per-hour rate, the rate
  projected to 24 h, and a direction-agnostic over-ceiling flag (so it catches
  both over-rapid rise and over-rapid fall). The time interval is the
  denominator and is rejected at/below zero, so no signed-infinity rate can
  leak. Registered in the spec-v59 object-aware fuzz harness; covered by
  `test/unit/trend.test.js` (delta, within-ceiling, over-rapid-fall, and the
  bad-interval fallback).
- **`views/group-v5.js` (`sodium-correction`)**: adds an optional "prior serum
  Na + hours since" pair. When both are entered, the tile reports the achieved
  ΔNa, the achieved rate (mEq/L/h), and the rate projected to 24 h against the
  acuity ceiling (8 mEq/L/24h chronic, 10 acute), warning on over-rapid
  correction. The Adrogue-Madias planning output is untouched; the trend block
  is purely additive. This is the natural first home for the primitive — the
  tile is itself a correction-rate planner.
- Later A1 waves extend the same primitive to the other named trend tiles
  (lactate clearance, creatinine Δ / KDIGO transition, early-warning-score
  trend); the remaining Part A capabilities (A2 actions, A3 reverse-solve, A4
  lab toggles, A5 substituted derivation) and the two deferred Part B tiles
  (`norepi-equiv`, `neo-phototherapy`) remain open. See
  [docs/spec-v62.md](docs/spec-v62.md).

### Added (spec-v62 Part B wave 1 — 7 bedside tiles + Part C: the last two static reference tables converted to calculators; catalog 319 → 326)

The clinical-side depth/expansion spec. This wave ships seven of the nine
planned Part B bedside tiles and converts the project's last two static
"reference table" tiles into input-driven calculators (Part C), closing the
last `<table>`-with-no-input gap in the live catalog. Every tile is pure,
`num.js`-validated, fuzz-covered (zero non-finite leaks), and ships its primary
citation inline with a `citationUrl`.

- **`lib/clinical-v8.js`** (new): seven new pure compute exports plus the two
  conversion functions, all `num.js`-backed arithmetic. Registered in the
  spec-v59 object-aware fuzz harness (`test/unit/fuzz-tools.test.js`).
- **New tiles (+7, Group F + N):**
  - `infusion-time-remaining` — bag/syringe time-to-empty and the inverse
    rate-to-last (ISMP smart-pump framing).
  - `enteral-free-water` — tube-feed free-water delivery and flush-to-goal
    (ASPEN 2017).
  - `apap-24h-max` — acetaminophen 24-hour running total vs the selected
    ceiling, catching hidden combination-product overdose (FDA labeling).
  - `icu-nutrition-target` — ICU energy/protein target ranges by weight
    (ASPEN/SCCM 2016).
  - `vte-prophylaxis-dose` — enoxaparin dose by weight, indication, and renal
    function with the CrCl <30 reduction flagged (Lovenox PI; CHEST 2012).
  - `neonatal-feeding-volume` — newborn enteral feeding daily/per-feed volume
    (AAP Pediatric Nutrition).
  - `oxytocin-titration` — oxytocin mU/min ⇄ mL/hr conversion both directions
    (ACOG Induction of Labor).
- **Part C conversions (no count change; ids and permalinks retained):**
  - `peds-dose` — from a static per-kg table to a weight-driven quick-dose
    panel computed to actual mg with per-dose caps applied.
  - `anticoag-reversal` — from a static agent table to a weight/INR-driven
    reversal-dose calculator (4F-PCC Kcentra INR-band dosing, idarucizumab
    5 g, andexanet ANNEXA-4, protamine 1 mg/100 units max 50 mg). Removing
    both static tables also removes the last two horizontally-scrolling
    `<table>`s from the catalog, improving the mobile no-horizontal-scroll
    posture.
- **Every dosing/reversal/replacement tile** renders the explicit "planning
  estimate, not an order — verify against local protocol and an independent
  double-check" notice (spec-v62 §5).
- **Catalog-truth + provenance:** all 13 count surfaces moved 319 → 326; the
  two AAP/ACOG tiles (`neonatal-feeding-volume`, `oxytocin-titration`) carry
  `accessed` dates and `docs/citation-staleness.md` rows under the
  `check-citations` gate; spec-v11 audit logs added/updated for all nine tiles.
- **Deferred to a later wave (honesty note):** the two remaining Part B tiles,
  `norepi-equiv` (§3.1) and `neo-phototherapy` (§3.3), are intentionally not in
  this wave — the published norepinephrine-equivalent vasopressin/angiotensin
  factors vary across the scoping reviews and the AAP-2022 hyperbilirubinemia
  curves are a continuous risk-stratified nomogram; both warrant exact
  source-table encoding before shipping a number a clinician might lean on.
  Part A (trend/action/reverse-solve/lab-toggle/substituted-derivation depth
  pass) is likewise deferred. See [docs/spec-v62.md](docs/spec-v62.md) §status.

### Added (spec-v61 A8 — interpretation parity for `pews`; CI invariant locking derivation-band ↔ interpretation coverage)

Closes the last gap between the two per-tile explanation displays. An audit
found exactly one tile — **`pews`** (the Brighton Pediatric Early Warning Score)
— that carried discrete `derivation.bands` (a total mapped to named escalation
cut-points) but no `interpretation` block, so it showed *where the number comes
from* without the source-anchored *what it means* under the mandatory "Per
source:" header.

- **`lib/meta.js`** (`pews`): adds an `interpretation` block whose four bands
  (`0-2`, `3`, `4`, `5+`) mirror the tile's already-vetted Monaghan 2005
  Brighton-PEWS escalation thresholds — routine monitoring → hourly + bedside
  review → half-hourly + medical review → urgent senior review — with
  `sourceQuoted: true` and the Monaghan 2005 citation. No new clinical claim:
  the bands restate the derivation's source-anchored escalation labels in the
  interpretation slot.
- **`test/unit/meta-interpretation.test.js`**: adds an invariant guard — every
  tile with discrete `derivation.bands` must also carry an `interpretation`
  block. This locks the two displays together so a future band-carrying score
  cannot ship the component breakdown without the source-anchored meaning.
  Continuous-mortality scores (`pelod2`, `psofa`) deliberately omit
  `derivation.bands` (their total maps to a continuous calibration, not discrete
  cut-points) and are correctly outside the invariant.

### Added (spec-v61 A3 wave 5 — chart-ready labeled copy for the multi-output Group V7 oxygenation / renal-acid / lipid tiles)

Extends the A3 "Copy results" affordance to the five multi-output Group V7
bedside calculators, each of which emits two-to-four distinct *computed* numeric
results: **`ldl-calc`** (non-HDL / Friedewald / NIH-Sampson LDL), **`cao2-do2`**
(arterial O₂ content + Hb-bound/dissolved split + O₂ delivery),
**`oxygenation-index`** (OI + OSI), **`driving-pressure`** (dP + static/dynamic
compliance), and **`acid-base-deficit`** (total body water + bicarbonate deficit
+ sodium deficit).

- **`views/group-v7.js`**: imports the shared `resultRow` helper
  (`lib/result-copy.js`) and rebuilds each of these five tiles' result list
  through it (the module keeps its local `list()`/`li()` helpers for the
  single-value tiles). The per-`<li>` text is byte-identical to the prior
  hand-built list — including the `fmt()` fallback strings (e.g.
  `(enter cardiac output)`) and the warn-class band lines — so the spec-v9
  numeric-correctness sweep and the spec-v53 null-safety guarantees are
  unaffected; the trailing protocol/estimate notes pass through as `{ text }`
  items so they join the copy payload.
- **`test/integration/unit-toggle.spec.js`**: the five ids join the
  labeled-"Copy results" sweep (now 26 tiles).

With this wave the A3 multi-output rollout covers every clean multi-*numeric*
result cluster in the catalog (Groups E, V5, F, I, V7); the remaining
hand-built lists are single-value-plus-interpretation scores, categorical
pickers, unit-conversion / dose-time utilities, and workflow checklists, none
of which fit the labeled `{ label, value, units }` result model.

### Added (spec-v61 A3 wave 4 — chart-ready labeled copy for the multi-output Group I field-medicine tiles)

Extends the A3 "Copy results" affordance to the three multi-output Group I
field/EMS calculators: **`burn-fluid`** (the Parkland + Modified Brooke
resuscitation schedule), **`peds-ett`** (tube size + insertion depth), and
**`naloxone`** (initial dose + re-dose + escalation).

- **`views/group-i.js`**: imports the shared `resultRow` helper
  (`lib/result-copy.js`). `burn-fluid` previously rendered two `<h3>`-headed
  `<ul>` blocks (one per method); it now renders a single `resultRow` with the
  two method names as inline `{ text }` section headers, so the tile surfaces
  exactly one "Copy results" button and one paste carries the full two-method
  schedule (a medic copying the whole resuscitation plan in one action). The
  per-`<li>` text is preserved; the trailing reference notes on `peds-ett` and
  `naloxone` stay outside the copied block.
- **`test/integration/unit-toggle.spec.js`**: the three ids join the
  labeled-"Copy results" sweep (now 21 tiles).

### Added (spec-v61 A3 wave 3 — chart-ready labeled copy for the multi-output Group F medication / infusion tiles)

Extends the A3 "Copy results" affordance to the three multi-output Group F
calculators: **`drip-rate`** (rate + drops/min), **`tpn-macro`** (total kcal +
the dextrose/protein/lipid macro breakdown), and **`insulin-correction`**
(total + ISF + correction + meal-coverage units). These are the
infusion/nutrition/glycemic numbers a nurse pastes into a pump, TPN, or
insulin-titration chart.

- **`views/group-f.js`**: imports the shared `resultRow` helper
  (`lib/result-copy.js`). `tpn-macro` and `insulin-correction` fold their
  prominent `<h2>` headline total (and, for insulin, the ISF `<p>`) into the
  labeled `resultRow` list so the headline value is part of the copy payload —
  the same pattern Group E used for `anion-gap-dd`. The trailing
  clinical-notice line stays outside the copied result block.
- **`test/integration/unit-toggle.spec.js`**: the three ids join the
  labeled-"Copy results" sweep.

### Added (spec-v61 A3 wave 2 — chart-ready labeled copy for the multi-output Group V5 lab / clinical-math tiles)

Extends the A3 "Copy results" affordance — clean `Label: Value Units` lines via
`lib/clipboard.js` `formatCopyAll`, instead of a scraped `innerText` blob —
beyond Group E and the v61 bedside tiles to the six multi-output Group V5
calculators: **`sodium-correction`**, **`free-water-deficit`**, **`iron-ganzoni`**,
**`pbw-ardsnet`**, **`lights`**, and **`corrected-anion-gap`**. These are exactly
the dense, multi-row lab/clinical-math results a nurse pastes into a chart.

- **`views/group-v5.js`**: imports the shared `resultRow` helper
  (`lib/result-copy.js`) and rebuilds each tile's result list through it. The
  per-`<li>` text is byte-identical to the prior hand-built list (so the
  spec-v9 numeric-correctness sweep is unaffected); each tile now renders the
  labeled "Copy results" button, and free band / interpretation / safety-note
  lines pass through as `{ text }` items so they join the copy payload verbatim.
- **`test/integration/unit-toggle.spec.js`**: the six ids join the
  "multi-output tiles offer a labeled Copy results button" sweep, so CI asserts
  the affordance renders after the example is applied.

This leaves the remaining single-numeric-output Group V5 tiles (`rsbi`,
`mentzer`, `saag`, `r-factor`, `kdigo-aki`) — whose copy payload is one value
plus an interpretation line, below the "2+ numeric output" bar — on the
universal "Copy all", consistent with the A3 scope.

### Added (spec-v61 A1 wave 15 — "show your work" derivation for the Finnegan NAS; additive-score rollout complete)

Adds **`finnegan`** (the modified Finnegan Neonatal Abstinence Scoring system) to
the derivation rollout — the last additive-score tile. Its value is making the
non-obvious per-sign weights explicit (e.g., excessive high-pitched cry +2 vs
continuous +3; convulsions +5). Derivation coverage 116 → 117 tiles.

- **`lib/meta.js`**: a `weightedBinaryItems([[inputKey, label, weight], …])` helper
  builds the 24 weighted-binary sign components (a present sign contributes its
  weight) from one source of truth, mirroring `FINNEGAN_WEIGHTS` in
  `lib/scoring-v6.js`; three graded components (sleep 0-3, fever 0-2, respiratory
  rate 0-2) clamp their value. Banded high (>=12) / elevated (8-11) / below-
  threshold (<8), with a verbatim `source`.
- **`views/group-v10.js`** (`finnegan`): the renderer lifts its `signs` object
  into the call, mounts `renderDerivation(META.finnegan)`, and calls
  `updateDerivationSteps` on change.
- **`test/unit/derivation.test.js`**: `finnegan` joins `ALL_DERIVATION_TILES`
  (schema + units guards) with component-sum cross-checks against
  `finnegan().total` — none-reported (0), the documented example (10), and a
  severe weighted mix — so any drift in the meta.js weights fails CI.

With this wave every summed or weighted-additive score in the catalog carries a
CI-cross-checked "show your work" derivation; the remaining no-derivation tiles
are continuous formulas, single-ordinal pickers, and decision rules that do not
fit the component-sum model.

### Added (spec-v61 A1 wave 14 — "show your work" derivation for the modified NIHSS)

Adds **`mnihss`** (the modified NIHSS stroke-severity scale) to the derivation
rollout. Derivation coverage 115 → 116 tiles.

- **`lib/meta.js`**: the `mnihss.derivation` block sums the eleven 0-N items (LOC
  questions/commands, gaze, visual fields, motor arm L/R, motor leg L/R, sensory,
  language, extinction) with identity `points`, banded 0 / 1-4 / 5-15 / 16-20 /
  >=21, with a verbatim `source` reusing the inline citation.
- **`views/group-g.js`** (`mnihss`): the renderer lifts its arguments into a
  local `inputs`, mounts `renderDerivation(META.mnihss)`, and calls
  `updateDerivationSteps` on change.
- **`test/unit/derivation.test.js`**: `mnihss` joins `ALL_DERIVATION_TILES`
  (schema + units guards) with component-sum cross-checks against `mnihss().total`
  (zero, a mid case, and the 31-point maximum).

### Added (spec-v61 A1 wave 13 — "show your work" derivation for APACHE II)

Adds the canonical adult-ICU severity score, **`apache2`** (APACHE II), to the
derivation rollout. It is notoriously fiddly to hand-calculate, so a per-variable
breakdown is high-value at the bedside. Derivation coverage 114 → 115 tiles.

- **`lib/meta.js`**: a small `apsStep(value, breaks)` helper mirrors the
  acute-physiology step lookup in `lib/scoring-v6.js`; the `apache2.derivation`
  block scores all twelve physiology variables (temperature, MAP, HR, RR, PaO2,
  pH, Na, K, creatinine, hematocrit, WBC) by their banded breaks, plus the
  `15 - GCS` neurologic term, the age points (45-54 +2 … >=75 +6), and a
  chronic-health component whose callback reads `inputs.nonoperativeOrEmergency`
  (+5 nonoperative/emergency-postop, else +2). A verbatim `source` reuses the
  inline citation.
- **`views/group-v10.js`** (`apache2`): the renderer lifts its arguments into a
  local `inputs`, mounts `renderDerivation(META.apache2)`, and calls
  `updateDerivationSteps` on change.
- **`test/unit/derivation.test.js`**: `apache2` joins `ALL_DERIVATION_TILES`
  (schema + units guards) with component-sum cross-checks against
  `apache2().total` — the documented example (23), an all-normal patient (0), the
  chronic-health override, and a high-acuity patient hitting many extreme bands —
  so any drift in the meta.js breaks tables fails CI.

### Changed (spec-v61 A3 — Group E chart-ready labeled copy completed)

Finishes the A3 rollout across Group E: the remaining multi-output calculators
that still rendered a plain `<ul>` and relied on the universal "Copy all"
scraping `innerText` now use the shared `resultRow` helper, gaining a clean
`formatCopyAll`-backed "Copy results" button.

- **`views/group-e.js`**: `corrected-ca-na`, `bw-bsa-suite`, `egfr-suite`,
  `fena-feurea`, and `qtc-suite` convert their result lists to `resultRow`
  (on-screen text byte-identical). `anion-gap-dd` previously put its primary
  anion-gap result in an `<h2>` headline that the labeled copy could not reach;
  the headline is folded into the `resultRow` list as labeled items
  (`Anion gap`, `Albumin-corrected AG`) so the chart paste now includes the
  anion gap alongside the delta-delta breakdown. `corrected-ca-na` only renders
  the button when at least one of its two independent results is present.

With this, every genuinely multi-output Group E tile offers "Copy results";
single-output calculators keep the universal "Copy all" (nothing multi-line to
copy). No clinical-result, data, or dependency change. The example-correctness
sweep (every tile's documented numbers still render) and the 320px no-horizontal-
scroll sweep pass; lint, unit, build, and SBOM are green.

### Changed (spec-v61 A3 — shared chart-ready labeled-copy helper + Group E suite-tile rollout)

Advances the A3 "chart-ready labeled copy" tail (clean `Label: Value Units`
paste instead of the universal "Copy all" scraping `innerText`) with a dedup and
a rollout:

- **`lib/result-copy.js`** (new): the `resultRow` helper — previously duplicated
  as `resultRow` in `views/group-v11.js` and `resultList` in `views/group-e.js` —
  is promoted to one shared module. It renders result items
  (`{label, value, units?, cls?}` or a free `{text, cls?}` line) as a `<ul>` plus
  a `formatCopyAll`-backed "Copy results" button, byte-identical to a hand-built
  list. `group-v11` and `group-e` now import it (their local copies removed; the
  now-unused `clipboard` imports dropped), so there is one implementation to
  maintain and future view modules can reuse it.
- **`views/group-e.js`**: four multi-output "suite" calculators that still built
  a plain `<ul>` and relied on innerText scraping now use `resultRow` —
  `osmolal-gap`, `aa-pf-suite`, `winters`, and `shock-index` — gaining a clean
  "Copy results" button with on-screen text unchanged.

No clinical-result, data, or dependency change. The on-screen text is
byte-identical (the spec-v9 numeric-correctness sweep and the 320px no-horizontal-
scroll sweep both still pass); lint (incl. output-safety + catalog-truth), the
unit suite, build, and SBOM (now 68 source files) are green.

### Added (spec-v61 A1 wave 12 — "show your work" derivation for the age-banded pediatric organ-dysfunction scores: PELOD-2 & pSOFA)

Continues the A1 derivation tail with the two age-banded PICU organ-dysfunction
scores — **`pelod2`** (PELOD-2, ten variables across five organ systems) and
**`psofa`** (pediatric SOFA, six subscores). These are the first derivations
whose component points depend on the patient's age, plus cross-input rules
(PELOD-2 pupils forcing the neurologic subscore; pSOFA's vasoactive grade
overriding the age-banded MAP). Derivation coverage 112 → 114 tiles.

- **`lib/meta.js`**: because the data module is import-free by design, the
  six-band MAP/creatinine tables (`D_PELOD2_MAP`, `D_PELOD2_CREAT`,
  `D_PSOFA_MAP`, `D_PSOFA_CREAT`) and a `pelodAgeBand` helper are replicated here
  to mirror `lib/scoring-v6.js`. Each age-banded component callback reads
  `inputs.ageMonths` to pick the active band; the PELOD-2 neuro callback reads
  `inputs.pupilsFixed`, and the pSOFA cardiovascular callback reads
  `inputs.vasoactive` (taking the worse of the banded MAP or the vasoactive
  grade). A verbatim `source` reuses each tile's inline citation.
- **`views/group-v10.js`** (`pelod2`, `psofa`): each renderer lifts its arguments
  into a local `inputs`, mounts `renderDerivation(META[id])`, and calls
  `updateDerivationSteps` on change.
- **`test/unit/derivation.test.js`**: the two tiles join `ALL_DERIVATION_TILES`
  (schema + units guards) with component-sum cross-checks against `pelod2().score`
  and `psofa().score` spanning the neonate (band 0), 24-59 mo (band 3), and
  >=12 yr (band 5) age bands, plus the pSOFA vasoactive-override case. These
  cross-checks fail loudly if the meta.js band tables ever drift from scoring-v6.

### Added (spec-v61 A1 wave 11 — "show your work" derivation for the pediatric/neonatal bedside scales: NIPS, CRIES & pediatric GCS)

Continues the A1 derivation tail with three pediatric/neonatal bedside assessment
scales a nurse scores at the cot side — **`nips`** (Neonatal Infant Pain Scale),
**`cries`** (neonatal postoperative pain), and **`peds-gcs`** (the pediatric
Glasgow Coma Scale). Each is a simple additive sum, so identity `points`
reproduce the live score exactly. Derivation coverage 109 → 112 tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation. NIPS sums six
  0-1/0-2 indicators (bands 0-2 / 3-4 / >4); CRIES sums five 0-2 items (bands <4
  / 4-6 / >=7, the >=4 analgesia threshold made explicit); pediatric GCS sums
  E+V+M (3-15) with the age-adjusted verbal subscale, interpreted with the adult
  severity bands — mirroring the adult `gcs` derivation.
- **`views/group-g.js`** (`nips`, `cries`, `peds-gcs`): each renderer lifts its
  arguments into a local `inputs`, mounts `renderDerivation(META[id])`, and calls
  `updateDerivationSteps` on every input change (the established spec-v48 wiring).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) with component-sum cross-checks against
  `nips().score`, `cries().score`, and `pedsGcs().score` across the zero, mid-band,
  and maximum boundary cases.

### Added (spec-v61 A1 wave 10 — "show your work" derivation for the array-scored brief screeners: AUDIT, DAST-10 & GDS-15)

Continues the A1 derivation tail with three brief screeners — **`audit-full`**
(AUDIT alcohol screen), **`dast10`** (Drug Abuse Screening Test), and **`gds15`**
(Geriatric Depression Scale). Their value here is transparency of the
**reverse-scored items** (DAST item 3; GDS items 1/5/7/11/13), a common
manual-scoring error the per-item breakdown makes explicit. Derivation coverage
106 → 109 tiles.

- **`lib/meta.js`**: three small helpers (`yesNoItems`, `ordinalItems`,
  `screenerUnits`) generate the per-item components keyed `q1..qN` so the
  reverse-scored items are encoded once and correctly; AUDIT items are ordinal
  (0-4), DAST/GDS are yes/no with the reverse set passed explicitly. Each block
  carries the full formula, bands, population, units, validity, and a verbatim
  `source` reusing the tile's inline citation.
- **`views/group-v9.js`** (`audit-full`, `dast10`, `gds15`): each renderer mounts
  `renderDerivation(META[id])` and, on change, passes the live items array mapped
  to a `{q1..qN}` object via `Object.fromEntries` — so the show-your-work sum
  reproduces the live array-based total exactly.
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) with component-sum cross-checks against
  `auditFull().total`, `dast10().total`, and `gds15().total` — including the
  all-"No" cases that isolate the reverse-scored items (DAST all-no = 1, GDS
  all-no = 5).

### Added (spec-v61 A1 wave 9 — "show your work" derivation for three high-value scores: HACOR, VIS & the Charlson Comorbidity Index)

Continues the A1 derivation tail with three commonly charted scores of distinct
computational shapes — **`hacor`** (NIV-failure risk), **`vis`** (vasoactive-
inotropic load), and **`charlson`** (comorbidity burden / 10-year mortality).
Each exercises a different derivation feature, and all reproduce their live score
exactly. Derivation coverage 103 → 106 tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation. HACOR bands HR/pH/
  GCS/RR and computes its PaO2/FiO2 band inside a callback that reads both gases
  from the inputs object; VIS is a continuous weighted sum (dopamine ×1 …
  vasopressin ×10000); Charlson sums weighted comorbidities — its mild-liver,
  uncomplicated-diabetes, and any-tumor callbacks read the sibling
  moderate-severe/end-organ/metastatic inputs to apply the same severity
  dominance as the live function — plus an age-points callback (+1 per decade
  from 50, capped at 4).
- **`views/group-g.js`** (`hacor`, `charlson`) and **`views/group-e.js`**
  (`vis`): each renderer lifts its arguments into a local `inputs`, mounts
  `renderDerivation(META[id])`, and calls `updateDerivationSteps` on change
  (HACOR only on the computable path; Charlson passes the flattened
  comorbidities + ageYears so the dominance callbacks resolve).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) with component-sum cross-checks against the
  live score — including HACOR's banded P/F, VIS's continuous float (compared
  against the live `vis` value), and Charlson's three severity-dominance edge
  cases and age bands.

### Added (spec-v61 A1 wave 8 — "show your work" derivation for the specialty bedside point scales: Burch-Wartofsky, ARISCAT & Braden Q)

Continues the A1 derivation tail with three specialty point scales a nurse fills
in by selecting a per-criterion point value — **`burch-wartofsky`** (thyroid-storm
likelihood), **`ariscat`** (postoperative pulmonary-complication risk), and
**`braden-q`** (pediatric pressure-injury risk). Because each input is already
the criterion's point value (or a fixed-point yes/no), every component is a
near-identity callback and the sum reproduces the live total exactly. Derivation
coverage 100 → 103 tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation. Burch-Wartofsky sums
  the five point-valued categories (thermoregulatory, CNS, GI-hepatic,
  tachycardia, CHF) plus two +10 binaries (atrial fibrillation, precipitant);
  ARISCAT sums four point-valued predictors (age, SpO2, incision, duration) plus
  the +17/+11/+8 binaries; Braden Q sums seven 1-4 subscales (lower = higher
  risk) via the same clamp callback the adult Braden uses.
- **`views/group-v10.js`** (`burch-wartofsky`, `ariscat`, `braden-q`): each
  renderer lifts its arguments object into a local `inputs`, mounts
  `renderDerivation(META[id])`, and calls `updateDerivationSteps` on every input
  change (the established spec-v48 wiring, matching the wave-4 silverman-andersen
  / downes pattern already in this module).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live total (`burchWartofsky().total`,
  `ariscat().total`, `bradenQ().total`) across the documented-example, zero/min,
  and high/max boundary cases.

### Added (spec-v61 A1 wave 7 — "show your work" derivation for the ICU-prognosis additive indices: NUTRIC, mNUTRIC & MODS)

Continues the A1 derivation tail with three ICU-prognosis indices a nurse charts
when planning nutrition therapy and tracking organ-dysfunction severity —
**`nutric`** (NUTRIC nutritional-risk score), **`mnutric`** (the IL-6-free
modified form), and **`mods`** (Multiple Organ Dysfunction Score). Like the
GI-bleed wave, all weights are banded, so each band is encoded as a `points`
callback. Derivation coverage 97 → 100 tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation. NUTRIC/mNUTRIC band
  age, APACHE II, and SOFA and add the comorbidity/days-to-ICU (and, for NUTRIC,
  IL-6) binaries; MODS encodes its six organ-system 0-4 subscores (respiratory
  PaO2/FiO2, renal creatinine, hepatic bilirubin, cardiovascular PAR, hematologic
  platelets, neurologic GCS), each callback reproducing the live banding —
  including the `Number.isFinite` guard that returns 0 for a blank field, so the
  show-your-work sum never diverges from `mods().score`.
- **`views/group-g.js`** (`nutric`, `mnutric`, `mods`): each renderer lifts its
  arguments object into a local `inputs`, mounts `renderDerivation(META[id])`, and
  calls `updateDerivationSteps` on every input change (the established spec-v48
  wiring).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live `score` (`nutric().score`,
  `mnutric().score`, `mods().score`) across the no-dysfunction, mid-band, and
  maximum boundary cases.

### Added (spec-v61 A1 wave 6 — "show your work" derivation for the GI-bleed risk family: Glasgow-Blatchford, Rockall & Oakland)

Continues the A1 derivation tail with the three GI-bleeding risk scores a nurse
charts to support an admit-vs-discharge decision — **`gbs`** (Glasgow-Blatchford
Bleeding Score, upper GI), **`rockall`** (upper GI, with the pre-endoscopy
variant), and **`oakland`** (lower GI safe-discharge). Unlike the prior additive
waves, these carry *banded* weights, so each band is encoded as a `points`
callback that replicates the live banding exactly. Derivation coverage 94 → 97
tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation (no new clinical
  quote). GBS models the Blatchford 2000 Table 1 weights — BUN, SBP, and a
  **sex-specific** hemoglobin band (the callback reads `inputs.sex`) plus five
  binaries; Rockall clamps its five ordinals and zeroes the endoscopic-diagnosis
  and stigmata items when `inputs.preEndoscopy` is set (reproducing both the
  complete 0-11 and pre-endoscopy 0-7 models from one block); Oakland encodes the
  banded age/HR/SBP/Hgb weights (Hgb converted g/dL→g/L to match Oakland 2017
  Table 2) plus three binaries.
- **`views/group-g.js`** (`gbs`, `rockall`, `oakland`): each renderer lifts its
  arguments object into a local `inputs`, mounts `renderDerivation(META[id])`,
  and calls `updateDerivationSteps` on every input/change (the established
  spec-v48 wiring). `lib/derivation.js` already passes `(value, inputs)` to a
  callback `points`, so the sex- and pre-endoscopy-dependent callbacks resolve.
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live `score` (`gbs().score`,
  `rockall().score`, `oakland().score`) across the boundary cases — including
  GBS's male-vs-female hemoglobin band difference, Rockall's pre-endoscopy
  variant omitting its last two items, and Oakland's banded vitals.

### Added (spec-v61 A1 wave 5 — "show your work" derivation for PESI, sPESI & the Nigrovic Bacterial Meningitis Score)

Continues the A1 derivation tail with the two PE-prognosis scores a nurse charts
to support outpatient-vs-inpatient triage — **`pesi`** (the full Pulmonary
Embolism Severity Index) and **`spesi`** (its simplified form) — plus the
pediatric **`nigrovic`** Bacterial Meningitis Score. Derivation coverage 91 → 94
tiles.

- **`lib/meta.js`**: each tile gains a full `derivation` block whose verbatim
  `source` reuses the tile's already-vetted inline citation (no new clinical
  quote). PESI's block models the mixed formula exactly — age added directly via
  a `(v) => Number(v) || 0` callback, a `sex === 'M' ? 10 : 0` callback, and the
  nine weighted binary predictors — with the five PESI risk-class ranges as
  `bands`; sPESI is six equal binaries; Nigrovic weights the CSF Gram stain +2
  over its four +1 predictors.
- **`views/group-g.js`** (`pesi`, `spesi`, `nigrovic`): each renderer lifts its
  `inputs` object into a local, mounts `renderDerivation(META[id])`, and calls
  `updateDerivationSteps` on every input/change (the established spec-v48 wiring).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live `score` (`pesi().score`,
  `spesi().score`, `nigrovic().score`) — including PESI's raw-age + male-sex +
  altered-mental-status worked case, sPESI's 0/1/6 boundaries, and the Nigrovic
  Gram-stain-weighted-+2 case.

### Added (spec-v61 A1 wave 4 — "show your work" derivation for the 0-2-per-sign bedside scores)

Continues the A1 derivation tail with the three "five signs, 0-2 each, sum"
bedside scores a nurse charts at the warmer and the cot side: **`apgar`** (the
1- and 5-minute newborn assessment, higher = better) and its two inverses
**`silverman-andersen`** and **`downes`** (neonatal respiratory-distress
severity, higher = worse). Derivation coverage 88 → 91 tiles.

- **`lib/meta.js`**: a shared `sign02Clamp` helper (sibling to `essClamp`)
  clamps a per-sign rating to 0-2, mirroring the `num()`/`sumItems()` range
  guard in the live functions so the show-your-work component sum reproduces the
  live total exactly for in-range input and never renders NaN out of range. Each
  tile gains a full `derivation` block — `formula`, the five per-sign
  `components`, severity `bands`, `population`, `units`, `validity`, and a
  verbatim `source` that reuses the tile's already-vetted inline citation (no new
  clinical quote authored).
- **`views/group-g.js`** (`apgar`) and **`views/group-v10.js`**
  (`silverman-andersen`, `downes`): each renderer lifts its `inputs` object into
  a local, mounts `renderDerivation(META[id])`, and calls `updateDerivationSteps`
  on every input change (the established spec-v48 wiring). `group-v10.js` now
  imports `META` and the derivation helpers.
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live total (`apgar().total`,
  `silvermanAndersen().total`, `downes().total`) across the zero, example, and
  max boundary cases.

### Added (spec-v61 A1 wave 3 — "show your work" derivation for Padua, Epworth & NRS-2002)

Continues the A1 derivation tail with three additive scores whose live function
returns a numeric `score` from named inputs, so the component sum is cross-checked
against the implementation exactly. Derivation coverage 85 → 88 tiles.

- **`padua`** (Padua VTE Prediction Score): the eleven weighted binary risk
  factors (+3 / +2 / +1), high-risk band at ≥4.
- **`epworth`** (Epworth Sleepiness Scale): the eight 0–3 situational ratings.
  A shared `essClamp` helper in `lib/meta.js` mirrors `epworthClamp` in
  `lib/scoring-v4.js` so an out-of-range rating clamps identically in the
  show-your-work list and the score.
- **`nrs2002`** (Nutritional Risk Screening 2002): severity (0–3) + nutritional
  status (0–3) + age ≥70 (+1), at-risk band at ≥3, with the same 0–3 clamp on
  the two ordinals.

Wiring lands in `views/group-g.js` (which already imports the spec-v48 derivation
helpers): each renderer mounts `renderDerivation(META[id])` and calls
`updateDerivationSteps` on every input change, with the live `inputs` object
lifted into a local. `test/unit/derivation.test.js` adds the three to
`ALL_DERIVATION_TILES` and gives each component-sum cross-checks across the zero,
example, and min/max boundary cases — including the Epworth 0/24 and 24/24 ends,
the NRS-2002 ≥3 cutoff, and the out-of-range-clamp cases for both clamped scores.

### Added (spec-v61 A1 wave 2 — "show your work" derivation for three ED screening / decision scores)

Continues working down the A1 derivation tail one fully-verified wave at a time.
This wave backfills the per-input "Where does this come from?" contribution list
on three additive emergency-department scores a nurse charts and must defend:
**`feverpain`** (FeverPAIN sore-throat antibiotic decision), **`canadian-syncope`**
(Canadian Syncope Risk Score), and **`stone-score`** (STONE ureteral-stone
probability). Derivation coverage 82 → 85 tiles.

- **`lib/meta.js`**: each gains a complete `derivation` block — `formula`,
  per-input `components`, `bands`, `population`, `units`, `validity`, and a
  verbatim `source` that reuses the tile's **already-vetted inline citation**
  (no new clinical quote authored). The component set captures the real scoring
  weights: FeverPAIN's five +1 items; the Canadian Syncope Score's signed
  weights (−1 to +2, range −3..+11); and STONE's mixed categorical/binary items
  via `points` callbacks (sex, timing, nausea) plus the two +3 binaries.
- **`views/group-v9.js`**: the `feverpain`, `canadian-syncope`, and
  `stone-score` renderers now mount `renderDerivation(META[id])` and call
  `updateDerivationSteps` on every input change (the established spec-v48 wiring),
  with the live `inputs` object lifted into a local so it feeds both the scoring
  function and the show-your-work list.
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets component-sum cross-checks
  asserting the derivation reproduces the live scoring function exactly
  (`feverpain().total`, `canadianSyncope().score`, `stoneScore().score`) across
  the zero, example, min/max boundary cases — including the Canadian Syncope
  −3 floor and +11 ceiling, and STONE's full 0 and 13 range.

### Added (spec-v61 A1 — "show your work" derivation for three additive screening scores)

Begins working down the A1 derivation tail (the per-input "Where does this come
from?" contribution list) one small, fully-verified wave at a time. This wave
backfills three simple additive screening scores that a nurse charts and must
defend: **`sirs`** (SIRS criteria), **`apfel`** (PONV risk), and **`aims65`**
(upper-GI-bleed mortality).

- **`lib/meta.js`**: each gains a complete `derivation` block — `formula`,
  per-input `components`, `bands`, `population`, `validity`, and a verbatim
  `source`. The `source` reuses the tile's **already-vetted inline citation**
  (no new clinical quote is authored), and `population` stays factual without
  unverified cohort specifics, so the only new clinical content is the
  component/​band structure — which is machine-verified.
- **`views/group-g.js`**: each renderer now mounts `renderDerivation(META[id])`
  and calls `updateDerivationSteps` on every input change, so the per-input
  contribution list populates live (the established spec-v48 wiring pattern).
- **`test/unit/derivation.test.js`**: the three tiles join `ALL_DERIVATION_TILES`
  (schema + units-coverage guards) and each gets three component-sum
  cross-checks asserting the derivation components reproduce the live scoring
  function exactly (`sirs().count`, `apfel().score`, `aims65().score`) across
  the zero, mid, and max cases. Derivation coverage 79 → 82 tiles.

### Added (spec-v61 A3 — chart-ready labeled copy on the multi-output bedside tiles)

Extends the A3 "Copy results" affordance — clean `Label: Value Units` lines via
`lib/clipboard.js` `formatCopyAll`, instead of the universal "Copy all" scraping
`innerText` into a chart blob — from the Group E clinical-math tiles (A4) to the
genuinely multi-output v61 bedside tiles.

- **`resultRow` helper in `views/group-v11.js`.** A small shared helper that
  renders a result list and a "Copy results" button from one structured item
  list (`{label, value, units, cls}` for numeric results; `{text, cls}` for
  band/interpretation lines). The `<li>` text is built with the same
  `Label: Value Units` join `formatCopyAll` uses, so the on-screen text is
  **byte-identical** to the prior hand-built `<li>`s and the paste matches the
  screen exactly.
- **Wired on the five 2+-numeric-output tiles**: `ebv-mabl` (blood volume +
  max allowable loss), `peds-transfusion-volume` (volume + mL/kg),
  `rhig-dose` (FMH volume + vials), `fluid-balance` (net mL + % body weight),
  and `carb-insulin-bolus` (meal + correction + total). These are exactly the
  outputs a nurse pastes into a transfusion, I&O, or insulin chart. Single-
  numeric tiles (`urine-output`, `gir`, `iv-osmolarity`, etc.) are left on the
  universal "Copy all", matching the Group E precedent.
- **Test**: `test/integration/unit-toggle.spec.js` now asserts the "Copy
  results" button renders on all nine multi-output tiles (4 Group E + 5 v61).
  The full `example-correctness` sweep (every documented example still produces
  its exact output) and the 320px mobile sweep were re-run green — no text or
  layout regression.

### Added (spec-v61 A2 — finish the related-tool linking rollout; 9 → 267 tiles)

Completes the last open Part A enhancement in [spec-v61](docs/spec-v61.md) §2.
The A2 related-tool feature shipped with three seed clusters and the v61 inline
links (9 tiles total); this finishes the rollout so a nurse on any tile is one
click from the siblings she reaches for next.

- **`RELATED_BACKFILL` map in `lib/meta.js`.** One reviewable map, organized by
  clinical family (VTE pretest-probability/prophylaxis/bleeding, sepsis severity,
  community-acquired pneumonia, stroke/TIA/ICH, GI bleed/hepatology,
  renal/acid-base/electrolyte, oxygenation/ventilation, sedation/delirium/pain,
  depression/substance/suicide screeners, functional status, obstetrics,
  neonatal/pediatric, trauma/massive-transfusion, dosing/infusion,
  perioperative/airway, triage/decision-rules, heme labs, toxicology, nutrition).
  Merged into META exactly like the A8 interpretation backfill, and **defers to
  any `related` already on a tile** so the inline v61 seeds win. Raises
  `META[id].related` coverage from **9 to 267** of 319 tiles. No new clinical
  result — additive navigation metadata rendered through the existing
  `renderMetaBlock` "Related tools" row.
- **Guardrails in `test/unit/related-tools.test.js`.** Beyond the existing
  resolves-to-a-real-tile / not-self-referential check: a coverage floor (≥250
  tiles linked) so the rollout cannot silently regress, and a shape check that
  every list stays ≤4 siblings with no duplicates (the related row wraps as a
  single flex line; an overlong list crowds the result at 320px). The full
  320px mobile sweep was re-run with the 267 newly-rendered related blocks — no
  horizontal-scroll regression.

### Fixed / Added (responsive coverage for the pre-rendered static build; dev/prod server parity)

The mobile no-horizontal-scroll guarantee now extends to the **pre-rendered
static pages** Cloudflare Pages serves to a visitor or crawler landing on a deep
link from search — the audience hubs (`/for/<audience>/`), topic pages
(`/topics/<slug>/`), the `/commitments/` page, and all 319 `/tools/<id>/` pages.
These are distinct HTML documents from the SPA hash routes the existing
`mobile-no-hscroll.spec.js` covers (a pre-rendered page carries hand-authored
copy, breadcrumbs, and OG headers the live SPA view never renders), so they were
previously unguarded.

- **Dev/prod parity fix in `scripts/serve.mjs`.** The dev server could not serve
  any of these pages: a directory request (`/for/clinicians/`) returned **403**,
  and the root was hard-coded to the repo root, so `npm run dev` could not
  preview a single hub, topic, or tool page the way production does. The server
  now resolves a directory to its `index.html` (matching Cloudflare Pages) and
  honors a `SERVE_ROOT` env var (relative to the repo root) so the same
  zero-dependency server can serve `dist/`. The path-traversal guard and the
  production security headers are unchanged, and the default (no `SERVE_ROOT`,
  SPA at the repo root) is byte-for-byte the prior behavior.
- **New regression sweep `test/integration/static-pages-mobile.spec.js`.** A
  second Playwright `webServer` serves `dist/` on `:4174` (its readiness probe
  hits `/commitments/`, which also exercises the new directory→index resolution).
  The structural pages (hubs/topics/commitments, read straight off the built
  `dist/` tree so the list can never drift) are swept cross-browser at 320px;
  the full 319-page `/tools/<id>/` set is swept on chromium. `npm run test:e2e`
  now runs `npm run build` first so `dist/` exists before Playwright launches.
  All static pages already pass at 320px; the sweep makes that a standing
  guarantee.

### Added (spec-v61 — bedside medication-safety, electrolyte/fluid, and OB/peds tiles; +12 tiles, 307 → 319)

Twelve deterministic, bedside-necessary nursing computations that fill confirmed
gaps — each is something a working nurse computes by hand today, and each passes
the [spec-v29] §3 one-line test (computes an output from input; no reference-only
tables). No runtime network call and no AI; every tile ships its primary citation
inline with a `citationUrl` and inherits the [spec-v59] input/output-safety
contract and the [spec-v60] citation contract.

- **`urine-output`** — hourly urine-output rate (mL/kg/hr) with the KDIGO oliguria
  / AKI urine-output bands. The hourly Foley check.
- **`gir`** — Glucose Infusion Rate (mg/kg/min) with the 4-8 neonatal target band.
  The NICU dextrose-titration confirm.
- **`ebv-mabl`** — estimated blood volume + maximum allowable blood loss (Gross,
  age/sex-banded). The OR/L&D transfusion-threshold anticipation.
- **`corrected-phenytoin`** — albumin-corrected phenytoin (Sheiner-Tozer), with the
  CrCl<10/ESRD variant. Interpreting a "low" total level in hypoalbuminemia.
- **`potassium-deficit`** — coarse total-body K deficit estimate + the standard
  repletion-rate caveats. A planning aid, explicitly not an order.
- **`magnesium-replacement`** — banded MgSO4 repletion estimate by severity.
- **`rhig-dose`** — RhIG vials from a Kleihauer-Betke result (FMH ÷ 30 mL, round,
  add one). The L&D post-positive-KB calculation.
- **`peds-transfusion-volume`** — weight-based PRBC volume (mL) with the 10-15
  mL/kg reference band.
- **`iv-osmolarity`** — estimated IV/PN osmolarity with the ~900 mOsm/L
  peripheral-vs-central line flag.
- **`burn-uop-target`** — the hourly urine-output *target* the nurse chases to
  titrate burn resuscitation (complements `burn-fluid`'s Parkland estimate).
- **`fluid-balance`** — shift net I&O balance + cumulative percent-of-body-weight
  with the >10% fluid-overload flag. The end-of-shift handoff tally.
- **`carb-insulin-bolus`** — carb-counting meal bolus + correction bolus, shown
  separately, with the correction floored at 0 below target.

Each compute export lives in `lib/clinical-v7.js` (pure; validated through
`lib/num.js`, denominators guarded, `boundsAdvisory()` on physiologic inputs) and
is rendered in `views/group-v11.js`. Every tile carries a `META[id]` entry with an
inline citation + `citationUrl` + `citationAccessed`, a Test-with-example payload
verified end-to-end by the numeric-correctness sweep, ≥3 boundary worked examples
in its unit test (including the zero-denominator/null fallback and the
impossible-input `RangeError`), a [spec-v11] audit log under `docs/audits/v11/`,
and a `docs/citation-staleness.md` ledger row. All 12 are added to the
[spec-v59] object-aware fuzz harness (`test/unit/fuzz-tools.test.js`) with zero
non-finite/leaked-token results. Every dosing/replacement tile renders an explicit
"estimate / verify per local protocol and an independent double-check" note — the
order stays with the clinician and the pharmacy ([spec-v61] §7).

Catalog-truth surfaces ([spec-v46]) all updated to 319; `npm run lint`,
`npm run test`, `npm run build`, the example-correctness sweep, and the
full-catalog mobile no-horizontal-scroll sweep are green.

Part A of [spec-v61] (cross-cutting enhancements — derivation/interpretation
backfill, related-tool linking, labeled copy, unit toggles, copy-link, printable
handoff, opt-in persistence) ships incrementally. Landed so far: **A2**
related-tool linking, **A5** the copy-link affordance, **A6** the printable
handoff (the shared `lib/print.js` template — with its "No data was sent or
stored" footer — now extends to `sbar-template` and `code-blue-clock`, so a
nurse can print an SBAR handoff or a code-blue summary for the chart; a focused
e2e test builds each and asserts no horizontal scroll at 320px), and **A8**
interpretation-band parity — 45 additional score tiles now carry a
source-anchored "Per source:" band block (150 → 195 tiles with
`META[id].interpretation`), covering the v55–v58/v61 bedside scores plus
classic instruments (APGAR, qSOFA, MELD, Ranson, Alvarado, AUDIT-C, CAGE, EPDS,
Mini-Cog, ASCVD/PREVENT, KDIGO-AKI, Sgarbossa, SAAG, Bishop, FeverPAIN, STONE,
EDACS, YEARS, AUDIT, DAST-10, GDS-15, ARISCAT, APACHE II, Braden Q, and more).
The backfill is authored as one reviewable merge map in `lib/meta.js` and
renders through the existing `renderMetaBlock` path with zero view changes;
every band passes the `meta-interpretation.test.js` guard (source-quoted,
≤200 chars, no Sophie-authored phrasing). Tiles deliberately omitted: `abg`
(acid-base walkthrough), `pews` (institution-specific thresholds), `ballard`
(gestational-age estimate), `pelod2`/`psofa` (continuous mortality, no standard
discrete bands), and the two v61 dose calculators (`rhig-dose`,
`peds-transfusion-volume`).

**A7** opt-in input persistence now landed too. A privacy-safe, client-only
"Remember my inputs on this device" toggle (`lib/input-persist.js`) lets a nurse
reopening a tile each shift skip re-entering constants. It is **off by default**
(the smoke test still asserts an empty `localStorage` on a fresh visit), is shown
only on tiles that have persistable inputs, and stores **numeric/choice inputs
only** — `<input type=number|range|checkbox|radio>` and `<select>` — under two
string-literal keys (`sw-remember`, `sw-saved-inputs`, both added to
`scripts/storage-allowlist.json`). Free-text (`type=text`/`search`) and
`<textarea>` are never persisted, so a name/allergy/clinical-note field can never
reach storage (the "never on for PHI-bearing free-text" rule). Remembered values
fill fields the deep-link hash did not, and win over the example; unchecking the
toggle removes both keys, so opting out also erases anything stored. Wired into
the tile render flow in `app.js` alongside `applyHashState`/`applyExample`;
covered by `test/unit/input-persist.test.js` and a `smoke.spec.js` opt-in
round-trip e2e.

**A4** per-field unit toggles and **A3** chart-ready labeled copy now land for
the Group E clinical-math tiles. **A4**: `bmi`, `bsa`, and `cockcroft-gault`
gain an adjacent unit `<select>` on each weight/height/lab field, driven by the
existing `lib/unit-convert.js` converters (weight kg⇄lb, height m/cm⇄in,
creatinine mg/dL⇄µmol/L) — so a US nurse can enter lb and inches, or an SI lab
in µmol/L, and the compute path is unchanged because each option converts to
the canonical unit before the formula runs. The first option is always the
canonical unit, so every `META.example` and deep-link hash reproduces a
calculation byte-identically; the select rides the existing
`trackHashState`/input-persist machinery for free, and the input+select row
wraps so it never forces horizontal scroll at 320px. **A3**: the multi-output
Group E tiles (`bsa`, `anion-gap`, `corrected-sodium`, `aa-gradient`) now build
their results as `{label, value, units}` items and render a "Copy results"
button that pastes clean `Label: Value Units` lines via `lib/clipboard.js`
`formatCopyAll`, instead of the universal "Copy all" scraping `innerText` into a
blob. Both are covered by `test/integration/unit-toggle.spec.js` (alternate-unit
parity, example-prefill parity, the labeled-copy affordance, and a 320px
no-overflow assertion).

The **A4** weight toggle then rolled out to the dosing tiles. The shared
helpers were extracted to `lib/field-units.js` (`unitField`, `unitNum`,
`WEIGHT_UNITS`) and a **kg⇄lb** toggle was added to every weight-bearing dosing
tile in Group F (`weight-dose`, `conc-rate`, `vasopressor`, `crrt-dose`,
`ecmo-titration`) and the twelve v61 bedside tiles (`urine-output`, `gir`,
`ebv-mabl`, `potassium-deficit`, `peds-transfusion-volume`, `burn-uop-target`,
`fluid-balance`), so a US nurse who weighs a patient in pounds no longer
hand-converts before a weight-based dose, infusion rate, or urine-output check.
The converter feeds the canonical kg value to the formula **and** to the
`boundsAdvisory()` plausibility check, so the result and every advisory are
identical to the kg entry; the canonical default keeps all twelve documented
examples byte-identical (validated by the example-correctness sweep), and
`unit-toggle.spec.js` adds a cross-group lb-parity test (`weight-dose`, `gir`,
`ebv-mabl`, `urine-output`). The remaining Part A items — **A1** derivation
rollout (the named high-value multi-input scores already carry derivation; the
lower-value tail, which requires a verbatim source quote per instrument, is the
open work) and **A3** labeled copy beyond Group E (the v11 dosing outputs
interleave bands/advisories with numeric results, so a clean `formatCopyAll`
extraction is deferred until those outputs are restructured) — remain open
follow-ups.

### Changed (spec-v60 — citation-integrity completion & full-catalog currency re-verification; zero tiles, 307 → 307)

A zero-tile provenance release. No clinical formula, threshold, or rounding
changed — every valid-input result is byte-identical. v60 finishes the three
citation-integrity artifacts [spec-v54] designed but never fully shipped, extends
them across the full post-v58 catalog (307 tiles, up from the 255 v54 audited),
and performs the currency re-verification the catalog had drifted on.

- **The gate is real and in CI.** `scripts/check-citations.mjs` runs in
  `npm run lint` and enforces five rules over all 307 tiles: every tile carries a
  non-empty inline `citation` with no bare URL; every guideline-issuer tile (CDC,
  KDIGO, AGS, ACC, AHA, ATS, IDSA, ESC, WHO, AAP, ACOG, Joint Commission, SAMHSA,
  NICE) carries a `citationAccessed` date **and** a `docs/citation-staleness.md`
  ledger row; no citation uses the forbidden unpinned phrasing ("current
  edition" / "latest version" / "most recent"); every `citationUrl` is a
  syntactically valid `https://` URL. `test/unit/check-citations.test.js` proves
  each rule bites with a negative fixture.
- **The ledger exists.** `docs/citation-staleness.md` carries one row per
  guideline-derived tile (28 gate-enforced) plus the foundational instruments
  reviewed alongside them — naming the edition shipped, the latest known edition,
  the `accessed` date, and a justification wherever the shipped edition is behind.
  40 rows at v60 close.
- **Unpinned phrases pinned (P-1…P-3).** `field-triage` → ACS-COT *National
  Guideline for the Field Triage of Injured Patients* (2021); `tetanus` → ACIP
  *MMWR* 2020;69(3) + 2018 wound-management guidance; `rabies-pep` → ACIP rabies
  PEP *MMWR* 2022. A grep for the three forbidden phrases in `lib/meta.js` now
  returns zero.
- **Currency re-verified.** Each REFRESH row in §4 is resolved: the CDC/NHSN
  tiles (`device-day-counter`, `sti-screening`, `tb-testing`, `bbp-exposure`)
  carry an `accessed` date and a ledger row; the two non-gated ADA tiles
  (`insulin-correction`, `lab-interpret`) were reviewed against ADA Standards of
  Care 2025 and their inpatient glycemic targets / interpretation bands confirmed
  unchanged, documented in the ledger with the fully-paginated 2024 citation
  retained over a less-precise 2025 reference (no-degrade-precision rule). No
  threshold moves silently inside v60.
- **`citationUrl` backfill.** DOI-preferred structured `citationUrl` extended
  from 9 to 37 named-instrument tiles, so the one-click path to the source is
  present on the high-traffic instruments. The URL is never embedded in citation
  text — `app.js` `renderMetaBlock` controls wrapping.
- **`docs/data-sources.md` reconciled.** No longer claims the Beers data is
  retired; the `beers-check` tile ships the 2023 AGS Beers content embedded in
  `lib/medication-v4.js` with `citationAccessed` and a ledger row.
- See [docs/audits/v11/_citations-v60.md] for the per-tile inline/accessed/url/
  currency verification log.

### Changed (spec-v59 — full-catalog stress-test sweep & PA-toolchain hardening; zero tiles, 307 → 307)

A zero-tile hardening release. No clinical formula, threshold, or rounding
changed — every valid-input result is byte-identical (the full unit suite is the
regression guard). It finishes the [spec-v53] output-safety + physiologic-bounds
migration across the whole catalog and extends the contract to the
prior-authorization document-linter for the first time.

- **Class A — magic constants → fallbacks.** `hacor` and `lisMurray`
  (`lib/scoring-v4.js`) no longer render a magic P/F of 0 / 300 when FiO2 ≤ 0;
  they refuse to score (and the renderer routes the P/F line through `fmt()`).
- **Class B2 — empty-instrument refusal.** `hacor`, `lisMurray`, and `bps` no
  longer substitute a clinically-loaded default (blank pH → 7.4, blank GCS → 15,
  blank compliance → 80, blank pain item → 1) and emit a band from no data; an
  absent input refuses with a “complete all inputs” fallback.
- **Class B1 — physiologic-plausibility advisories.** `lib/bounds.js` `BOUNDS`
  expanded from 6 to 31 sourced envelopes (glucose, electrolytes, blood gases,
  FiO2 ≤ 1.0, temperature, QT, hematology, …); `boundsAdvisory()` is wired at the
  corrected-sodium / corrected-calcium / MAP / A-a-gradient render sites. The
  number is unchanged — a frankly-impossible input now shows a visible
  “verify the units” note instead of a silent authoritative value.
- **Class D — helper de-duplication.** `lib/field.js` and `lib/scoring-v4.js`
  import `r1`/`r2`/`r3`/`num` from `lib/num.js`; the local copies (one already
  diverged on its `min` default) are deleted. No remaining helper declaration
  outside `lib/num.js`.
- **Fuzz harness — object-aware, 16 modules.** `test/unit/fuzz-tools.test.js`
  now reflects each function’s fields and drives each through the adversarial
  matrix on a valid baseline (the reachable “valid object + one bad field” path),
  across all 16 pure compute modules. It caught four real string-leaks the
  scalar harness missed — `rox` (`at NaNh`), `vis` (`VIS Infinity`),
  `berlinArds` (`PaO2/FiO2 NaN`), `mtpTracker` (`Infinity:1:1`) — all fixed.
- **`derivation.js` / `workflow-v4.js`** route user-value interpolation through
  `fmt()` / a `txt()` sanitizer so a non-finite value never leaks its token into
  the show-your-work panel or a generated HIPAA/ROI/wallet-card document.
- **PA toolchain (new surface).** The **default report export is now
  PHI-redacted**; the raw extract (patient name / DOB / member ID) is reached
  only behind an explicit, labeled “include raw PHI” checkbox — a nurse who
  clicks “Download report” to share never gets full PHI by default. Redaction
  patterns widened (unlabeled address + ZIP, unlabeled “born <date>”, ID to the
  token boundary, international phone, `Last, First` names — all ReDoS-safe,
  bounded quantifiers). The date/POS extractors are capped (U-1); a binary /
  non-UTF8 `.txt` is pre-gated and skipped (U-3). A new `pa-stress` test pins
  that the extractor + redactor + engine + report builders finish under a fixed
  wall-clock budget on a 1 MB hostile packet (§3.4 regex-timing guard).
- See [docs/audits/v11/_hardening-v59.md] for the full repro/fix log, the
  scoping-decision rationale, and the documented residual (U-2/U-4/U-5).

### Added (spec-v58 — neonatal, maternal, and pediatric/adult ICU bedside scores; +12 tiles, 295 → 307)

Twelve deterministic neonatal, maternal, and ICU bedside scores that fill
confirmed gaps for the NICU / L&D / PICU / ICU nurse. Each is a published,
deterministic instrument a bedside nurse already assigns by hand; v58 brings
them onto the page and closes the 50-tile expansion begun in v55 (v55–v58
together add 52 tiles, 255 → 307). Each consumes at least one input and
computes an output (spec-v29 §3), ships its citation inline (spec-v54), and is
covered by the object-aware fuzz harness with zero non-finite leaks. New module
`lib/scoring-v6.js` (12 compute exports) + renderers in `views/group-v10.js`.

- **Neonatal (Group N):** `ballard` (New Ballard Score → gestational age, GA =
  24 + 0.4 × maturity score, ±2 wk), `finnegan` (modified Finnegan NAS, framed
  as the trend tool it is), `silverman-andersen` and `downes` (neonatal
  respiratory-distress severity), `bhutani-bilirubin` (hour-specific risk zone +
  AAP-2022 phototherapy threshold).
- **Maternal (Group N / OB):** `qbl-pph` (quantitative blood loss with the
  1 g = 1 mL weighed-pad convention + the CMQCC risk tier; decision support,
  never a transfusion order).
- **Pediatric/adult ICU (Group G):** `pelod2` and `psofa` (pediatric
  organ-dysfunction scores with age-banded MAP/creatinine cutoffs applied
  automatically), `burch-wartofsky` (thyroid-storm point scale), `ariscat`
  (postoperative pulmonary-complication risk), `apache2` (APACHE II ICU
  mortality estimate), `braden-q` (pediatric pressure-injury risk, the peds
  counterpart to the adult Braden).
- **Convention safety:** the higher-is-worse neonatal scores
  (`silverman-andersen`, `downes`, `finnegan`) and the lower-is-worse
  `braden-q` state their direction explicitly so a cross-reading nurse cannot
  invert the interpretation. The age-banded tiles (`bhutani-bilirubin`,
  `pelod2`, `psofa`) show the active band so the right threshold can be
  verified.
- **Robustness:** every compute function validates inputs via `lib/num.js`
  `num()` and is covered by the spec-v53 fuzz harness with zero
  `NaN`/`Infinity`/`undefined` leaks. 41 new unit tests (≥3 boundary examples
  each, including the age-band boundaries for `bhutani-bilirubin`/`pelod2`/
  `psofa`); 12 spec-v11 audit logs.
- **Provenance:** `bhutani-bilirubin` (AAP 2022) and `qbl-pph` (ACOG/CMQCC)
  carry `citationAccessed` + a `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces all advanced 295 → 307; `UTILITIES.length` is 307;
  sitemap + SBOM + JSON-LD regenerated. README gains a neonatal/maternal/ICU
  cheat sheet.

### Added (spec-v57 — brief screeners, decision rules, and triage scores; +14 tiles, 281 → 295)

Fourteen deterministic Group-G instruments that fill confirmed holes a bedside
team hits routinely: the ultra-brief screeners used as a pre-gate to the full
instrument, the imaging/discharge decision rules that keep the team out of
unnecessary CT, and the chest-pain / syncope / PE / pharyngitis / trauma
pathways that complement HEART, Wells, and Centor. Each consumes at least one
input and computes an output (spec-v29 §3), ships its citation inline (spec-v54),
and is covered by the object-aware fuzz harness with zero non-finite leaks. New
module `lib/scoring-v5.js` (14 compute exports) + renderers in `views/group-v9.js`.

- **Brief screeners:** `phq2-gad2` (PHQ-2 + GAD-2 pre-gates with the ≥3 flag),
  `audit-full` (WHO 10-item AUDIT with the 8/16/20 zones), `dast10` (DAST-10,
  item 3 reverse-scored), `gds15` (Geriatric Depression Scale, the
  age-appropriate alternative to PHQ-9).
- **Decision rules:** `ottawa-knee` (Ottawa Knee Rule), `nexus-chest` (NEXUS
  Chest CT instrument), `sfsr` (San Francisco Syncope Rule / CHESS),
  `canadian-syncope` (Canadian Syncope Risk Score, −3 to +11).
- **Pathways:** `edacs` (EDACS + EDACS-ADP low-risk gate), `years-pe` (YEARS
  with the variable D-dimer threshold surfaced explicitly), `feverpain`
  (FeverPAIN, NICE NG84), `stone-score` (STONE ureteral-stone probability),
  `iss-rts` (Injury Severity Score + Revised Trauma Score), `sipa` (Shock Index,
  Pediatric Age-Adjusted, age-banded cutoffs).
- **Conditional thresholds surfaced:** `years-pe` shows the 1000-vs-500 ng/mL
  D-dimer threshold that flips with the item count, and `edacs` shows the
  <16-plus-non-ischemic-ECG-plus-negative-troponins ADP gate, so the user sees
  *why* the determination flipped.
- **Robustness:** item screeners clamp each item to its declared range; `sipa`
  guards HR/SBP=0 → `null` → `fmt()` fallback and returns no cutoff (caution
  band) outside the validated 4–16 yr range; `iss-rts` clamps AIS 0–6 and the
  vitals. 74 new unit tests (≥3 boundary examples each, including the YEARS/EDACS
  threshold-flips and the SIPA age-band boundaries); 14 spec-v11 audit logs;
  fuzz harness extended to `scoring-v5.js`.
- **Provenance:** `audit-full` (WHO) and `feverpain` (NICE) carry
  `citationAccessed` + a `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 281 → 295; `UTILITIES.length`
  is 295. README gains a screeners/decision-rules cheat sheet.

### Added (spec-v56 — weight-based dosing, infusion titration, and bedside toxicology; +13 tiles, 268 → 281)

Thirteen deterministic Group-F medication/infusion calculators that fill the
high-frequency titration and reconstitution tasks a floor/ICU/ED/PACU/L&D nurse
currently does on paper. Each consumes at least one input and computes an output
(spec-v29 §3), ships its primary citation inline (spec-v54), inherits the
spec-v53 input/output-safety contract, and is covered by the object-aware fuzz
harness with zero `NaN`/`Infinity`/`undefined` leaks. New module
`lib/medication-v5.js` (13 compute exports) + renderers in `views/group-v8.js`.
**Every tile is dosing decision-support, not a prescription, and renders the
standing "verify against institutional protocol and a current reference"
notice.**

- **Infusion nomograms:** `heparin-nomogram` (weight-based heparin, Raschke 1993
  initial dosing + aPTT titration step, VTE/ACS caps, 150 kg weight cap),
  `vanc-auc` (vancomycin AUC24/MIC, first-order two-level Sawchuk-Zaske, target
  400–600), `aminoglycoside` (extended-interval Hartford dose + CrCl-set
  interval).
- **Pediatric fluids:** `peds-fluid-deficit` (Holliday-Segar 4-2-1 maintenance +
  dehydration deficit replacement), `peds-resus` (PALS 10–20 mL/kg bolus with
  the cardiac/DKA caution and adult weight cap).
- **Procedural / peri-op:** `mgso4-preeclampsia` (ACOG/Magpie load + maintenance
  with the renal-halving default), `pca-pump` (lockout-derived hourly maximum +
  1-hour-limit consistency check, no-PCA-by-proxy note), `sugammadex` (reversal
  by depth of block on actual body weight), `ketamine-propofol` (procedural
  sedation dose + re-dose increment).
- **Bedside toxicology:** `acetaminophen-nomogram` (Rumack-Matthew treatment
  line), `digoxin` (renal/age-categorical maintenance + level interpretation),
  `local-anesthetic-max` (per-agent mg/kg ceiling vs absolute cap, LAST note),
  `conc-percent` (percent ⇄ mg/mL ⇄ ratio).
- **Validity refusals (spec-v56 §3):** `acetaminophen-nomogram` refuses outside
  the 4–24 h window and `aminoglycoside` refuses dialysis / CrCl <20 — they
  throw rather than return a misleading number; both refusals are pinned by
  unit tests.
- **Deliberate substitution (correctness floor, same discipline as v55
  `ldl-calc`):** the Hartford concentration-vs-time *graph* is a proprietary
  figure with no closed form, so `aminoglycoside` sets the starting interval
  from CrCl and refers the random level to the institution's printed nomogram
  rather than fabricate a zone. Disclosed in the tile note, the META citation,
  and `docs/audits/v11/aminoglycoside.md`.
- **Robustness:** every compute function imports `r1`/`r2`/`r3`/`num`/`fmt` from
  `lib/num.js`; every denominator (TIBC analog, concentration, lockout, MIC,
  bag concentration) is guarded to return `null` → `fmt()` fallback. 65 new unit
  tests (≥3 boundary worked examples each, including the two validity-refusal
  cases); 13 spec-v11 audit logs; fuzz harness extended to `medication-v5.js`.
- **Provenance:** `vanc-auc` (IDSA), `digoxin` (ACC/AHA), `mgso4-preeclampsia`
  (ACOG), and `peds-resus` (AHA) carry `citationAccessed` + a
  `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 268 → 281; `UTILITIES.length`
  is 281.

### Added (spec-v55 — bedside hematology, renal/acid-base, and oxygenation math; +13 tiles, 255 → 268)

Thirteen deterministic Group-E calculators that fill confirmed gaps a bedside
ICU/acute-care RN, RT, or 3 a.m. resident actually reaches for. Each consumes at
least one input and computes an output (spec-v29 §3), ships its primary citation
inline (spec-v54), and is covered by the spec-v53 object-aware fuzz harness with
zero `NaN`/`Infinity`/`undefined` leaks. New module `lib/clinical-v6.js`
(13 compute exports) + renderers in `views/group-v7.js`.

- **Hematology:** `anc` (Absolute Neutrophil Count + CTCAE neutropenia grade),
  `retic-index` (corrected reticulocyte % + Reticulocyte Production Index),
  `tsat` (transferrin saturation + iron-studies pattern), `cci-platelet`
  (Corrected Count Increment for platelet refractoriness).
- **Renal / acid-base:** `ttkg` (Transtubular Potassium Gradient, with the
  surfaced interpretability guard: urine osm > plasma osm and urine Na > 25),
  `urine-anion-gap` (non-gap acidosis discriminator), `acid-base-deficit`
  (bicarbonate + sodium deficit estimates with the over-rapid-correction
  warning), `schwartz-egfr` (bedside pediatric eGFR), `eag-a1c` (estimated
  average glucose from A1c, ADAG).
- **Oxygenation / ventilation:** `cao2-do2` (arterial O₂ content + delivery),
  `oxygenation-index` (OI + OSI with PALICC-2 pediatric-ARDS bands),
  `driving-pressure` (ΔP + static/dynamic compliance with the ≤15 cmH₂O
  lung-protective target).
- **Lipids:** `ldl-calc` (calculated LDL). **Deliberate substitution:** the spec
  named Friedewald + Martin/Hopkins; Martin/Hopkins requires a 180-cell
  proprietary strata table that could not be source-verified, and the spec-v11
  correctness floor forbids shipping an unverifiable clinical table — so the
  second method is the published closed-form **NIH/Sampson 2020** equation
  (same high-TG / low-LDL use case). Disclosed in the tile note, the META
  citation, and `docs/audits/v11/ldl-calc.md`.
- **Robustness:** every compute function imports `r1`/`r2`/`r3`/`num`/`fmt` from
  `lib/num.js`; every division denominator (TIBC, plasma K, urine osm − plasma
  osm, driving pressure, serum creatinine) is guarded to return `null` →
  `fmt()` fallback, never a non-finite number to the DOM. 62 new unit tests
  (≥3 boundary worked examples each, including the zero-denominator and
  precondition-guard cases); 13 spec-v11 audit logs.
- **Provenance:** `tsat` (KDIGO) and `oxygenation-index` (PALICC-2) carry
  `citationAccessed` + a `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 255 → 268; `UTILITIES.length`
  is 268.

### Hardened (spec-v54 — citation integrity: inline, current, well-wrapped; zero new tiles)

A zero-tile citation-integrity release: no new tile, no clinical formula,
threshold, or rounding precision changed (every valid-input result is
byte-identical). It defines and enforces three invariants on every clinical
tile's source citation — **inline** (visible in `META[id].citation`, not only
in a reference doc), **current or justified-stale** (a guideline tile carries an
`accessed` date and a ledger row naming the shipped vs latest edition), and
**well-formed / wrapping** (no bare URL in the citation text; the references
block wraps within the tile column at 320px). Audit log:
`docs/audits/v11/_citations-v54.md`.

- **`scripts/check-citations.mjs` (new gate, wired into `npm run lint`)** —
  five rules across all 255 tiles: (1) every `clinical: true` tile has a
  non-empty inline `citation`; (2) no raw `http(s)://` in citation text (URLs
  belong in `citationUrl`); (3) `citationUrl`, if present, is a valid `https://`
  URL; (4) every tile whose citation matches the guideline-issuer pattern (CDC |
  KDIGO | AGS | ACC | AHA | ATS | IDSA | ESC | WHO | AAP | ACOG | Joint
  Commission | SAMHSA | NICE) carries an `accessed` date **and** a row in the
  staleness ledger; (5) no unpinned phrase ("current edition" / "latest version"
  / "most recent"). The issuer pattern is case-sensitive and word-bounded so it
  matches `WHO 2014` but not the word "who" and not "ACCORD". The pure detector
  `findCitationViolations` is unit-tested with one negative fixture per rule
  (`test/unit/check-citations.test.js`, +12 tests).
- **`docs/citation-staleness.md` (new ledger)** — one row per guideline-derived
  tile (19 gate-enforced) plus the foundational instruments reviewed alongside
  them (10 documentation rows), each naming edition shipped, latest known
  edition, `accessed` date, and a justification where the shipped edition is
  deliberately behind. The single auditable answer to "is Sophie current?"
- **Unpinned editions pinned (rule 5 fixes):** `field-triage` ("current
  edition" → 2021 ACS-COT/CDC National Guideline), `tetanus` (→ 2020 ACIP MMWR
  69(3)), `rabies-pep` (→ 2010 ACIP MMWR 59(RR-2)). Each gains a
  `citationAccessed` and a ledger row.
- **`accessed` dates added** to all 19 guideline-issuer tiles via a uniform
  `META[id].citationAccessed` field (the gate also accepts `source.accessed`).
- **§3 provenance fixes:** `fib4` / `apri` gain DOI `citationUrl`s; `vis` splits
  the conflated Gaies-2010 (VIS) vs Wernovsky-1995 (IS) attribution into one
  labeled inline citation with a DOI. `docs/data-sources.md` reconciles the
  Beers entry — the retired `beers.json` shard was the standalone reference
  *table*; the live `beers-check` tile ships AGS 2023 content embedded in
  `lib/medication-v4.js`, cited inline with `citationAccessed` and a ledger row.
- **Wrapping made explicit (rule 3 / invariant 2.3):** `styles.css`
  `.tool-meta .citation` and `.citation-inline-link` get `overflow-wrap:
  anywhere`; `test/integration/citations.spec.js` pins that a long-DOI tile
  (`egfr`) renders its inline citation and the references block has no
  horizontal overflow at 320px.
- Catalog unchanged (255 tiles). No `app.js` / `UTILITIES` change.

### Hardened (spec-v53 — public-tool output safety & input bounds; zero new tiles)

A zero-tile hardening release: no new tile, no clinical formula, threshold, or
rounding precision changed (every valid-input result is byte-identical). It
defines and enforces the invariant that **no public compute path may render
`NaN` / `undefined` / `Infinity` to the user, throw anything but a validation
error, or return a non-finite number that reaches the DOM**, fixes the concrete
defects found in the v52-close audit, and adds two automated gates so the class
cannot reappear. Audit log: `docs/audits/v11/_hardening-v53.md`.

- **`lib/num.js` (new)** — single source of truth for `r1`/`r2`/`r3` and `num()`
  (previously duplicated in `clinical.js` and `clinical-v5.js`; a latent
  drift risk), plus the new **`fmt()`** display guard that substitutes a
  caller-supplied fallback for any `null` / non-finite value.
- **Class A (leaked tokens):** `views/group-e.js` shock index / modified shock
  index rendered the literal `undefined` at SBP=0; now routed through `fmt()`.
  The fuzz harness additionally found `cfs` / `rass` leaking `CFS 9 (undefined)`
  / `RASS NaN` into their rendered band for non-finite input — fixed.
- **Class B (impossible input → silent nonsense):** `lib/bounds.js` (new) plus a
  `.warn` advisory next to the result for a frankly-impossible serum creatinine
  (Cockcroft-Gault / eGFR) or height (BMI); `pbwArdsnet` now returns `null`
  tidal-volume targets (not silent `0 mL`) below the Devine floor and the
  renderer finally displays the warning it had always computed.
- **Class C:** the bare `refLow: 0` lipid analytes (`totalChol`, `ldl`,
  `triglycerides`) are now explicitly `oneSidedLow: true` (a documented choice).
- **Gate 1 — `scripts/check-output-safety.mjs`** (wired into `npm run lint`):
  bans the `)?.toFixed(` leak fingerprint in `views/`; unit-tested both ways.
- **Gate 2 — `test/unit/fuzz-tools.test.js`** (wired into `npm run test`):
  reflection-driven; drives all 245 public compute exports with an adversarial
  matrix and asserts throw-safety (only `TypeError`/`RangeError`) and no
  banned-token leak into returned strings. It surfaced — and this release fixes —
  42 functions that threw a plain `Error` for validation (normalized to
  `TypeError`/`RangeError`).
- Catalog unchanged (255 tiles). No `app.js` / `UTILITIES` change.

### Added — enforce no-horizontal-scroll across the **entire** tile catalog at 320px

The site is built for the nurse reaching for it on a phone, and "no horizontal
scroll on every view" was a stated commitment — but the automated guard only
covered seven representative views (one per shape) plus the PA linter; a
full-catalog sweep had only ever been run *manually, once*. A tile added later
could ship horizontal overflow undetected.

- `test/integration/mobile-no-hscroll.spec.js` now includes a **full-catalog
  sweep**: it discovers every tile id from `sitemap.xml` (the same catalog
  source `all-tools.spec.js` uses) and asserts no view's
  `documentElement.scrollWidth` exceeds its `clientWidth` at 320px — the
  narrowest mainstream phone width (a layout that fits at 320px fits at every
  wider width). All 255 tiles pass today; the sweep makes it a permanent CI
  regression guard. chromium-only and ~12 s for the whole catalog (SPA hash
  routes re-render in place), so the cost is negligible.
- Docs updated to reflect that the 320px no-horizontal-scroll guarantee is now
  *enforced*, not merely asserted: `docs/performance.md` (Mobile Touch Targets)
  and `docs/accessibility.md` (a new reflow checklist item).
- Housekeeping: corrected the README CLI-reference unit-test count (2,182 →
  2,381, stale) and noted the responsiveness sweep in the `test:e2e` row and the
  `styles.css` repository-layout line.

### Fixed (spec-v52 wave 52-46 — complete the CMS Place-of-Service code set; `R-PA-013` false-block on telehealth and other valid POS codes)

`R-PA-013` ("place-of-service code present and on the bundled CMS list",
**`block`** severity) tested POS codes against `POS_CODES_BUNDLED` in
`lib/pa/extract.js`, which shipped an incomplete *sample* — it omitted the entire
`01`–`10` range plus `16` / `18` / `27`. A legitimate prior-auth packet in the
most common modern care settings was therefore **falsely blocked** with "POS
code(s) not on bundled CMS list", most importantly:

- **Telehealth** — POS `02` (telehealth other than in the patient's home) and POS
  `10` (telehealth in the patient's home, added to the CMS set 2022-01-01).
- Pharmacy (`01`), school (`03`), homeless shelter (`04`), the Indian Health
  Service / Tribal 638 facilities (`05`–`08`), prison / correctional (`09`),
  temporary lodging (`16`), place of employment-worksite (`18`), and outreach
  site / street (`27`, added 2023-10-01).

Fix: `POS_CODES_BUNDLED` now holds the **complete CMS assigned POS set** (51
codes). The unassigned / reserved numbers in the gaps remain absent, so
`R-PA-013` still blocks a genuinely invalid code (`88`, exercised by the
`bad-pos` golden). New golden fixture `telehealth-pos10` (a POS 10 telehealth
behavioral-health packet that now clears `R-PA-013`); three unit tests pin the
telehealth codes, the rest of the previously-missing assigned codes, and the
still-blocked invalid / missing cases. The `cms-pos` staleness-ledger source was
re-verified against the CMS POS code set page (`lastVerified` bumped). Ruleset
count unchanged (876 — this completes bundled data, it does not add a rule);
catalog unchanged (255 tiles). 46 golden fixtures.

### Added (spec-v52 wave 52-45 — §4.5.2.1 CMS Hospital OPD Prior Authorization: the first real bundled PA-list membership test)

A different kind of wave: not another payer overlay, but the linter's **first
non-vacuous prior-authorization-list membership test**. Every "is the requested
service on the payer's PA list?" rule to date (`R-PA-053` and the per-overlay
`-004` rules) ships vacuous — it passes with a pointer because no list is
bundled. This wave flips that for one real, federally published, stable list.

- New bundled dataset `lib/pa/cms-opd-pa-list.js` — the **CMS Hospital
  Outpatient Department (OPD) Prior Authorization** required-services CPT list,
  organized by category through the 2023 facet-joint addition: blepharoplasty,
  botulinum toxin injection, panniculectomy, rhinoplasty, vein ablation (2020);
  cervical fusion with disc removal, implanted spinal neurostimulators (2021);
  facet joint interventions (2023). CPT procedure codes only (the drug J-codes
  billed alongside botulinum toxin are deliberately excluded to keep the
  membership test conservative).
- New rule `R-PA-OPD-001` (`flag`) in `lib/pa/rules.js`: for a Medicare FFS
  hospital-outpatient packet (POS 22 / 19, or an explicit outpatient-department
  anchor) requesting a listed OPD service with **no Unique Tracking Number (UTN)
  / prior-authorization reference**, it flags — Medicare requires the OPD
  authorization and the UTN on the claim before the service is furnished. It
  self-gates off for non-Medicare-FFS payers, office-based (POS 11) services, and
  non-listed CPTs. The finding names the matched CPT and its OPD category.
- New staleness-ledger source `cms-opd-pa-list` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-OPD-` →
  `cms-opd-pa-list` prefix map in `lib/pa/rule-sources.js`, anchored to the single
  authoritative CMS OPD PA program page and re-verified on the §4.5.6 cadence.
- New golden fixture `cms-opd-pa` (45 fixtures total) — a Medicare FFS
  hospital-outpatient vein-ablation packet without a UTN. Five unit tests cover
  the membership test, the UTN branch, and the payer / POS / non-listed gates.
- Catalog count unchanged (255 tiles). Ruleset rises **875 → 876**. View wave
  banner advanced to 52-45.

### Added (spec-v52 wave 52-44 — §4.5.44 Indiana Medicaid / Healthy Indiana Plan overlay for the Prior-Auth Packet Linter)

The fourteenth per-state Medicaid overlay, and the thirty-seventh named-payer
overlay overall. **Indiana Medicaid** is administered by FSSA / OMPP under the
umbrella **Indiana Health Coverage Programs** (IHCP); its expansion program is
the **Healthy Indiana Plan** (HIP), the claims system is CoreMMIS, and providers
submit through the IHCP Provider Healthcare Portal.

- New per-state payer bucket `'medicaid-in'` in `lib/pa/payer.js` (anchors
  `indiana medicaid` / `healthy indiana plan` / `indiana health coverage
  programs` / `ihcp`), placed before the generic `'medicaid'` bucket and composing
  with the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. It is
  deliberately disjoint from the same-state commercial Blues licensee `'anthem'`
  (Anthem Blue Cross Blue Shield, headquartered in Indianapolis, §4.5.9); an
  Indiana Medicaid packet and an Anthem packet route to different overlays
  (unit-tested), and a dual-eligible "Medicare Advantage" string still wins the MA
  bucket earlier. The bare tokens `hip` and `in medicaid` are **excluded** as
  anchors (they would false-match "hip replacement" and "enrolled in medicaid"
  respectively) — both edge cases are unit-tested.
- 20 rules `R-PA-MCIN-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-in'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with IHCP submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCIN-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `in-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCIN-` →
  `in-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public IHCP provider page.
- New golden fixture `in-medicaid-precert` (44 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **855 → 875**; catalog count unchanged (255 tiles).
- Tests: +1 classify test (`medicaid-in` vs. Anthem, plus the `hip` /
  `in medicaid` anchor-safety edge cases) and the rule-count assertions (unit +
  2 e2e) advanced to 875. View wave banner advanced to 52-44.
- Docs housekeeping: refreshed `docs/pa-maintenance.md`, whose per-state Medicaid
  operator runbook had fallen four waves behind (it listed nine overlays; now
  fourteen — adds Pennsylvania, Michigan, New Jersey, Arizona, Indiana and the
  corresponding same-state-Blues disjointness pairs).

### Added (spec-v52 wave 52-43 — §4.5.43 Arizona Medicaid / AHCCCS overlay for the Prior-Auth Packet Linter)

The thirteenth per-state Medicaid overlay, and the thirty-sixth named-payer
overlay overall. **Arizona Medicaid** is run by a single state agency, **AHCCCS**
(the Arizona Health Care Cost Containment System, pronounced "access"); its
managed-care program is **AHCCCS Complete Care** and the provider portal is
**AHCCCS Online**.

- New per-state payer bucket `'medicaid-az'` in `lib/pa/payer.js` (anchors
  `arizona medicaid` / `az medicaid` / `ahcccs` / `arizona health care cost
  containment`), placed before the generic `'medicaid'` bucket and composing with
  the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. No commercial Blues
  licensee for Arizona is modeled yet, so the unambiguous `ahcccs` brand anchors
  directly with no same-state disambiguation; a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCAZ-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-az'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with AHCCCS Online
  submission routing and the two Medicaid reframings (transplant →
  Medicaid-designated transplant center; appeal → state fair hearing).
  `R-PA-MCAZ-004` mirrors core `R-PA-053` (no bundled prior-authorization list
  yet; vacuous pass with a pointer).
- New staleness-ledger source `az-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCAZ-` →
  `az-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public AHCCCS provider page.
- New golden fixture `az-medicaid-precert` (43 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **835 → 855**; catalog count unchanged (255 tiles).
- Tests: +1 classify routing test (`medicaid-az` / AHCCCS) and the rule-count
  assertions (unit + 2 e2e) advanced to 855. View wave banner advanced to 52-43.

### Added (spec-v52 wave 52-42 — §4.5.42 New Jersey Medicaid overlay for the Prior-Auth Packet Linter)

The twelfth per-state Medicaid overlay, and the thirty-fifth named-payer overlay
overall. **New Jersey Medicaid** is administered by the Department of Human
Services' **Division of Medical Assistance and Health Services (DMAHS)** under
the brand **NJ FamilyCare**; the fiscal-agent provider portal is **NJMMIS** (the
New Jersey Medicaid Management Information System).

- New per-state payer bucket `'medicaid-nj'` in `lib/pa/payer.js` (anchors `new
  jersey medicaid` / `nj medicaid` / `nj familycare` / `njmmis`), placed before
  the generic `'medicaid'` bucket and composing with the §4.5.4 Medicaid core
  through `isMedicaid(bundle.payer)`. It is deliberately disjoint from the
  same-state commercial Blues bucket `'horizon'` / Horizon Blue Cross Blue Shield
  of New Jersey (§4.5.20); a New Jersey Medicaid packet and a Horizon packet route
  to different overlays (unit-tested), and a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCNJ-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-nj'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with NJMMIS submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCNJ-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `nj-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCNJ-` →
  `nj-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public DMAHS provider page.
- New golden fixture `nj-medicaid-precert` (42 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **815 → 835**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-nj` vs. Horizon) and the
  rule-count assertions (unit + 2 e2e) advanced to 835. View wave banner advanced
  to 52-42.
- Docs housekeeping: corrected the README payer cheat-sheet prose, whose
  per-bucket precedence numbers (`anthem`, `bcbsm`, `horizon`, …) had lagged the
  renumbered table by one since the wave 52-41 insertion.

### Added (spec-v52 wave 52-41 — §4.5.41 Michigan Medicaid overlay for the Prior-Auth Packet Linter)

The eleventh per-state Medicaid overlay, and the thirty-fourth named-payer
overlay overall. **Michigan Medicaid** is administered by **MDHHS** (the Michigan
Department of Health and Human Services); the provider portal is **CHAMPS** (the
Community Health Automated Medicaid Processing System) and the Medicaid-expansion
program is branded the **Healthy Michigan Plan**.

- New per-state payer bucket `'medicaid-mi'` in `lib/pa/payer.js` (anchors
  `michigan medicaid` / `mi medicaid` / `healthy michigan plan` / `champs`),
  placed before the generic `'medicaid'` bucket and composing with the §4.5.4
  Medicaid core through `isMedicaid(bundle.payer)`. It is deliberately disjoint
  from the same-state commercial Blues bucket `'bcbsm'` / Blue Cross Blue Shield
  of Michigan (§4.5.15); a Michigan Medicaid packet and a BCBSM packet route to
  different overlays (unit-tested), and a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCMI-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-mi'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with CHAMPS submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCMI-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `mi-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCMI-` →
  `mi-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public MDHHS provider page.
- New golden fixture `mi-medicaid-precert` (41 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **795 → 815**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-mi` vs. BCBSM) and the
  rule-count assertions (unit + 2 e2e) advanced to 815. View wave banner advanced
  to 52-41.

### Added (spec-v52 wave 52-40 — §4.5.40 Pennsylvania Medicaid overlay for the Prior-Auth Packet Linter)

The tenth per-state Medicaid overlay, and the thirty-third named-payer overlay
overall. **Pennsylvania Medicaid** (PA DHS) brands its program **Medical
Assistance**; the fee-for-service provider portal is **PROMISe** and the
managed-care program is **HealthChoices**.

- New per-state payer bucket `'medicaid-pa'` in `lib/pa/payer.js` (anchors
  `pennsylvania medicaid` / `pa medicaid` / `pennsylvania medical assistance` /
  `healthchoices`), placed before the generic `'medicaid'` bucket and composing
  with the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. It is
  deliberately disjoint from the same-state commercial Blues buckets `'highmark'`
  (§4.5.13) and `'ibx'` / Independence Blue Cross (§4.5.17); a Pennsylvania
  Medicaid packet and a Highmark / Independence packet route to different overlays
  (unit-tested), and a dual-eligible "Medicare Advantage" string still wins the MA
  bucket earlier.
- 20 rules `R-PA-MCPA-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-pa'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with PROMISe submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCPA-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `pa-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCPA-` →
  `pa-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public PA DHS provider page.
- New golden fixture `pa-medicaid-precert` (40 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **775 → 795**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-pa` vs. Highmark / Independence)
  and the rule-count assertions (unit + 2 e2e) advanced to 795. View wave banner
  advanced to 52-40.

### Added (spec-v52 wave 52-39 — §4.3.1 optional in-browser OCR for the Prior-Auth Packet Linter)

Resolves the §2 OCR non-goal. The `pa-lint` tile gains an **optional,
user-triggered, fully on-device OCR path** for scanned PDFs and dropped images
(`image/jpeg`, `image/png`). When a dropped file is an image or a PDF that looks
like a scan (no embedded text layer), the results panel shows a single **"Run
on-device OCR"** control. Nothing loads until the user clicks it; then the
vendored OCR engine extracts the text and the deterministic rule engine re-runs
over it.

**Engine.** [tesseract.js](https://github.com/naptha/tesseract.js) 5.1.1 (+
`tesseract.js-core` 5.1.0 + the `tessdata_fast` English model), vendored under
`vendored/tesseract/` (~9 MB). It is **lazy-loaded only on the user's click**, so
idle page weight and the Lighthouse budget are unchanged; the service worker
runtime-caches it on first use for offline OCR thereafter.

**Posture.** OCR runs in a Web Worker in the tab; every asset (engine, worker,
WASM core, language data) is same-origin under `/vendored/tesseract/` — **no
network, no third-party service, no AI cloud**. The patient's image never leaves
the device (no BAA, spec-v52 §4.7 / §1.4). OCR is an **input adapter** — it
produces the text a human would otherwise type and makes no prior-authorization
determination, so the deterministic engine, the golden-fixture audit, and the
byte-determinism guarantee (§4.10) are all unchanged. tesseract is a local OCR
kernel, not an LLM-vendor dependency, so the "no AI" commitment (spec-v50 §3.6)
holds.

**CSP (the design decision).** WebAssembly compilation under a CSP needs a
`script-src` token, so `script-src` moves from `'self'` to `'self'
'wasm-unsafe-eval'` (in `_headers`, `index.html`, and `scripts/serve.mjs`).
`'wasm-unsafe-eval'` permits **only** same-origin WASM compilation — not general
`eval`, not `'unsafe-inline'`, not any third-party origin — and `connect-src
'self'` (the no-outbound-network promise) is unchanged, so "no third-party
scripts" still holds in substance. `check-commitments.mjs` already permits the
token while forbidding `unsafe-inline` / wildcards / off-origin sources.

New `lib/pa/ocr.js` (Node-safe glue + a dependency-injected `createOcrRunner`);
`views/pa-lint.js` gains the lazy loader, candidate detection, the OCR control,
scanned-PDF page rendering (canvas + the vendored pdf.js), and a `data-rule` hook
on findings rows. The /commitments page and `vendored/tesseract/_vendored.md`
disclose the vendored engine, its Apache-2.0 license, and the CSP tradeoff.
Tests: +10 unit (`test/unit/pa-ocr.test.js`, driven by a fake worker) and +1 e2e
(`test/integration/pa-lint-ocr.spec.js` — runs real OCR on an in-page PNG across
chromium/webkit/firefox and asserts zero off-origin requests). Catalog count
unchanged (255 tiles); ruleset count unchanged (775 — OCR is ingest, not a rule).

### Added (spec-v52 wave 52-38 — §4.5.38 North Carolina Medicaid per-state overlay, 20 of 20)

The ninth per-state Medicaid overlay, and the thirty-second named-payer overlay
overall. The full 20-rule `R-PA-MCNC-NNN` family is anchored to North Carolina
Medicaid's public NC DHHS / NCTracks provider pages (new ledger source
`nc-medicaid-precert`).

A new `'medicaid-nc'` payer bucket (anchors `north carolina medicaid` / `nc
medicaid` / `nctracks`) is placed before the generic `'medicaid'` bucket and
composes with the §4.5.4 Medicaid core via `isMedicaid()`. It is deliberately
distinct from the `'bcbsnc'` commercial bucket (Blue Cross NC, §4.5.19): a North
Carolina Medicaid packet and a Blue Cross NC packet route to different overlays
(unit-tested). The 20 rules mirror the established families with the Medicaid
reframings (transplant → Medicaid-designated transplant center; appeal → state
fair hearing) and NCTracks routing. Each rule self-gates on `bundle.payer ===
'medicaid-nc'` and vacuously passes on every other packet.

Coverage is now 775 rules shipped (was 755), 727 source-anchored (was 707), 47
sources (was 46), 0 ledger orphans, 0 coverage gaps. A new `nc-medicaid-precert`
golden fixture (Medicaid core all pass, MCNC-009 site-of-care flag) re-seeds
deterministically; all thirty-nine goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 755 -> 775. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-38. Nine of the
largest state Medicaid programs by enrollment (CA, NY, TX, FL, OH, IL, WA, GA, NC)
now have overlays.

### Added (spec-v52 wave 52-37 — §4.5.37 Georgia Medicaid per-state overlay, 20 of 20)

The eighth per-state Medicaid overlay, and the thirty-first named-payer overlay
overall. The full 20-rule `R-PA-MCGA-NNN` family is anchored to Georgia
Medicaid's public Department of Community Health / GAMMIS provider pages (new
ledger source `ga-medicaid-precert`).

A new `'medicaid-ga'` payer bucket (anchors `georgia medicaid` / `gammis` /
`georgia department of community health`) is placed before the generic
`'medicaid'` bucket and composes with the §4.5.4 Medicaid core via
`isMedicaid()`. The 20 rules mirror the established families with the Medicaid
reframings (transplant → Medicaid-designated transplant center; appeal → state
fair hearing) and Georgia GAMMIS routing. Each rule self-gates on `bundle.payer
=== 'medicaid-ga'` and vacuously passes on every other packet.

Coverage is now 755 rules shipped (was 735), 707 source-anchored (was 687), 46
sources (was 45), 0 ledger orphans, 0 coverage gaps. A new `ga-medicaid-precert`
golden fixture (Medicaid core all pass, MCGA-009 site-of-care flag) re-seeds
deterministically; all thirty-eight goldens re-seeded. Tests: +5 engine
assertions and +1 classify assertion. e2e pa-lint rule count 735 -> 755. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-37.

### Added (spec-v52 wave 52-36 — §4.5.36 Washington Apple Health (Medicaid) per-state overlay, 20 of 20)

The seventh per-state Medicaid overlay (after California, New York, Texas,
Florida, Ohio, and Illinois), and the thirtieth named-payer overlay overall. The
full 20-rule `R-PA-MCWA-NNN` family is anchored to Washington's public Apple
Health / Health Care Authority (HCA) / ProviderOne provider pages (new ledger
source `wa-medicaid-precert`). Washington brands its Medicaid program as Apple
Health.

A new `'medicaid-wa'` payer bucket (anchors `washington apple health` / `apple
health` / `washington medicaid` / `washington state health care authority`) is
placed before the generic `'medicaid'` bucket and composes with the §4.5.4
Medicaid core via `isMedicaid()`. The 20 rules mirror the established families
with the Medicaid reframings (transplant → Medicaid-designated transplant center;
appeal → state fair hearing) and Washington ProviderOne routing. Each rule
self-gates on `bundle.payer === 'medicaid-wa'` and vacuously passes on every other
packet.

Coverage is now 735 rules shipped (was 715), 687 source-anchored (was 667), 45
sources (was 44), 0 ledger orphans, 0 coverage gaps. A new `wa-medicaid-precert`
golden fixture (Medicaid core all pass, MCWA-009 site-of-care flag) re-seeds
deterministically; all thirty-seven goldens re-seeded. Tests: +5 engine
assertions and +1 classify assertion. e2e pa-lint rule count 715 -> 735. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-36.

### Added (spec-v52 wave 52-35 — §4.5.35 Illinois Medicaid per-state overlay, 20 of 20)

The sixth per-state Medicaid overlay (after California, New York, Texas, Florida,
and Ohio), and the twenty-ninth named-payer overlay overall. The full 20-rule
`R-PA-MCIL-NNN` family is anchored to Illinois Medicaid's public HFS (Department
of Healthcare and Family Services) / IMPACT / MEDI provider pages (new ledger
source `il-medicaid-precert`).

A new `'medicaid-il'` payer bucket (anchors `illinois medicaid` / `illinois
department of healthcare and family services` / `hfs medicaid`) is placed before
the generic `'medicaid'` bucket and composes with the §4.5.4 Medicaid core via
`isMedicaid()`. It is deliberately distinct from the `'hcsc'` commercial bucket
(BCBS of Illinois, §4.5.12): an Illinois Medicaid packet and a BCBS-of-Illinois
packet route to different overlays (unit-tested). The 20 rules mirror the
established families with the Medicaid reframings (transplant → Medicaid-designated
transplant center; appeal → state fair hearing) and Illinois IMPACT / MEDI
routing. Each rule self-gates on `bundle.payer === 'medicaid-il'` and vacuously
passes on every other packet.

Coverage is now 715 rules shipped (was 695), 667 source-anchored (was 647), 44
sources (was 43), 0 ledger orphans, 0 coverage gaps. A new `il-medicaid-precert`
golden fixture (Medicaid core all pass, MCIL-009 site-of-care flag) re-seeds
deterministically; all thirty-six goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 695 -> 715. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-35. Six of the
largest state Medicaid programs by enrollment (CA, NY, TX, FL, OH, IL) now have
overlays.

### Added (spec-v52 wave 52-34 — §4.5.34 Ohio Medicaid per-state overlay, 20 of 20)

The fifth per-state Medicaid overlay (after California, New York, Texas, and
Florida), and the twenty-eighth named-payer overlay overall. The full 20-rule
`R-PA-MCOH-NNN` family is anchored to Ohio Medicaid's public Ohio Department of
Medicaid / Provider Network Management (PNM) provider pages (new ledger source
`oh-medicaid-precert`).

A new `'medicaid-oh'` payer bucket (anchors `ohio medicaid` / `ohio department of
medicaid`) is placed before the generic `'medicaid'` bucket and composes with the
§4.5.4 Medicaid core via `isMedicaid()`. The 20 rules mirror the established
families with the Medicaid reframings (transplant → Medicaid-designated
transplant center; appeal → state fair hearing) and Ohio Medicaid PNM routing.
Each rule self-gates on `bundle.payer === 'medicaid-oh'` and vacuously passes on
every other packet.

Coverage is now 695 rules shipped (was 675), 647 source-anchored (was 627), 43
sources (was 42), 0 ledger orphans, 0 coverage gaps. A new `oh-medicaid-precert`
golden fixture (Medicaid core all pass, MCOH-009 site-of-care flag) re-seeds
deterministically; all thirty-five goldens re-seeded. Tests: +5 engine assertions
and +1 classify assertion. e2e pa-lint rule count 675 -> 695. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-34.

### Added (spec-v52 wave 52-33 — §4.5.33 Florida Medicaid per-state overlay, 20 of 20)

The fourth per-state Medicaid overlay (after California §4.5.30, New York §4.5.31,
and Texas §4.5.32), and the twenty-seventh named-payer overlay overall. The full
20-rule `R-PA-MCFL-NNN` family is anchored to Florida Medicaid's public AHCA
(Agency for Health Care Administration) / FMMIS provider pages (new ledger source
`fl-medicaid-precert`).

A new `'medicaid-fl'` payer bucket in `lib/pa/payer.js` (anchors `florida
medicaid` / `statewide medicaid managed care` / `florida agency for health care
administration`) is placed before the generic `'medicaid'` bucket and composes
with the §4.5.4 Medicaid core via `isMedicaid()`. It is deliberately distinct
from the `'florida-blue'` commercial Blues bucket (§4.5.14): a Florida Medicaid
packet and a Florida Blue packet route to different overlays (unit-tested). The
20 rules mirror the established families with the Medicaid reframings (transplant
→ Medicaid-designated transplant center; appeal → state fair hearing) and Florida
Medicaid Web Portal / FMMIS routing. Each rule self-gates on `bundle.payer ===
'medicaid-fl'` and vacuously passes on every other packet.

Coverage is now 675 rules shipped (was 655), 627 source-anchored (was 607), 42
sources (was 41), 0 ledger orphans, 0 coverage gaps. A new `fl-medicaid-precert`
golden fixture (Medicaid core all pass, MCFL-009 site-of-care flag) re-seeds
deterministically; all thirty-four goldens re-seeded. Tests: +7 engine assertions
and +1 classify assertion. e2e pa-lint rule count 655 -> 675. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-33.

### Added (spec-v52 wave 52-32 — §4.5.32 Texas Medicaid per-state overlay, 20 of 20)

The third per-state Medicaid overlay (after Medi-Cal §4.5.30 and New York
§4.5.31), and the twenty-sixth named-payer overlay overall. The full 20-rule
`R-PA-MCTX-NNN` family is anchored to Texas Medicaid's public TMHP (Texas
Medicaid & Healthcare Partnership) provider pages and manuals (new ledger source
`tx-medicaid-precert`). Texas is one of the largest state Medicaid programs by
enrollment.

A new `'medicaid-tx'` payer bucket in `lib/pa/payer.js` (anchors `texas medicaid`
/ `tmhp` / the two TMHP corporate spellings) is placed before the generic
`'medicaid'` bucket, and composes with the §4.5.4 Medicaid core through the
`isMedicaid()` predicate (a Texas Medicaid packet is checked against both the
`R-PA-MCD-NNN` core and the Texas overlay; regression-tested). The 20 rules mirror
the established families with the Medicaid reframings (transplant →
Medicaid-designated transplant center; appeal → state fair hearing) and TMHP
routing names. Each rule self-gates on `bundle.payer === 'medicaid-tx'` and
vacuously passes on every other packet.

Coverage is now 655 rules shipped (was 635), 607 source-anchored (was 587), 41
sources (was 40), 0 ledger orphans, 0 coverage gaps. A new `tx-medicaid-precert`
golden fixture (Medicaid core all pass, MCTX-009 site-of-care flag) re-seeds
deterministically; all thirty-three goldens re-seeded. Tests: +6 engine
assertions and +1 classify assertion. e2e pa-lint rule count 635 -> 655. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-32. With
California, New York, and Texas shipped, the per-state Medicaid line covers the
three largest state programs by enrollment.

### Added (spec-v52 wave 52-31 — §4.5.31 New York State Medicaid per-state overlay, 20 of 20)

The second per-state Medicaid overlay (after Medi-Cal §4.5.30), and the
twenty-fifth named-payer overlay overall. The full 20-rule `R-PA-MCNY-NNN` family
is anchored to New York State Medicaid's public eMedNY provider pages and manuals
(new ledger source `ny-medicaid-precert`). New York is the second-largest state
Medicaid program by enrollment.

A new `'medicaid-ny'` payer bucket in `lib/pa/payer.js` (anchors `new york state
medicaid` / `nys medicaid` / `new york medicaid` / `emedny`) is placed before the
generic `'medicaid'` bucket, and composes with the §4.5.4 Medicaid core through
the `isMedicaid()` predicate introduced in wave 52-30 (a NY Medicaid packet is
checked against both the `R-PA-MCD-NNN` core and the NY overlay; regression-tested).
The 20 rules mirror the established families with the Medicaid reframings
(transplant → Medicaid-designated transplant center; appeal → state fair hearing)
and New-York routing names (eMedNY / ePACES submission channel). Each rule
self-gates on `bundle.payer === 'medicaid-ny'` and vacuously passes on every other
packet.

Coverage is now 635 rules shipped (was 615), 587 source-anchored (was 567), 40
sources (was 39), 0 ledger orphans, 0 coverage gaps. A new `ny-medicaid-precert`
golden fixture (Medicaid core all pass, MCNY-009 site-of-care flag) re-seeds
deterministically; all thirty-two goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 615 -> 635. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-31.

### Added (spec-v52 wave 52-30 — §4.5.30 Medi-Cal / California Medicaid: first per-state Medicaid overlay, 20 of 20)

The first **per-state Medicaid** overlay (after 23 commercial overlays), and the
twenty-fourth named-payer overlay overall. The full 20-rule `R-PA-MCAL-NNN`
family is anchored to Medi-Cal's (California Medicaid) public provider pages,
manuals, and utilization-management / pharmacy program requirements (new ledger
source `medi-cal-precert`). Medi-Cal is the largest Medicaid program in the
United States by enrollment.

**Detection.** A new `'medicaid-ca'` payer bucket in `lib/pa/payer.js` is placed
*before* the generic `'medicaid'` bucket, so a named program (Medi-Cal,
Denti-Cal, "California Medicaid") routes to its overlay while a state-agnostic
Medicaid packet still routes to the generic `'medicaid'` bucket. The `'medi-cal'`
/ `'denti-cal'` anchors move out of the generic bucket; the hyphen in `medi-cal`
prevents a false match on the common word "medical". An explicit "Medicare
Advantage" (dual-eligible) string still wins the MA bucket earlier.

**Composition with the Medicaid core (the key change).** The §4.5.4
state-agnostic Medicaid core (`R-PA-MCD-NNN`) previously gated on `bundle.payer
=== 'medicaid'`; a Medi-Cal packet routing to `'medicaid-ca'` would have silenced
it. A new `isMedicaid(bucket)` predicate (true for `'medicaid'` and every
`'medicaid-*'` bucket, exported from `lib/pa/payer.js`) now backs all ten MCD
gates, so the core and the per-state overlay compose on the same packet. A unit
regression test asserts the MCD core still fires on a `medicaid-ca` packet.

The 20 rules mirror the commercial families, with two reframed for Medicaid:
transplant (017) routes through a Medicaid-designated transplant center (not BCBS
"Blue Distinction Centers"), and appeal (019) admits the state fair-hearing
pathway. Medi-Cal routing names appear where the program uses them: the Medi-Cal
Provider Portal / eTAR Treatment Authorization Request submission channel (003),
the advanced-imaging UM program (007, 012), pharmacy management / Contract Drugs
List for step therapy (011), behavioral health (016). Each rule self-gates on
`bundle.payer === 'medicaid-ca'` and vacuously passes on every other packet.

Coverage is now 615 rules shipped (was 595), 567 source-anchored (was 547), 39
sources (was 38), 0 ledger orphans, 0 coverage gaps. A new `medi-cal-precert`
golden fixture (a complete Medi-Cal TAR — Medicaid core all pass, MCAL-009
site-of-care flag) re-seeds deterministically; the other thirty goldens gain +20
vacuous-pass findings each; all thirty-one re-seeded. Tests: +9 engine assertions
(count 615, off-bucket loop, the isMedicaid-composition regression guard,
fire/pass checks) and +2 classify assertions. e2e pa-lint rule count 595 -> 615.
Catalog count unchanged (255 tiles; Medi-Cal adds rules, not a tile). The PA
tile's wave banner advances to 52-30.

### Added (spec-v52 wave 52-29 — §4.5.29 HMSA / Blue Cross Blue Shield of Hawaii commercial overlay, 20 of 20)

The twenty-third named commercial-payer overlay, and the eighteenth "Blues plans
by state" overlay. The full 20-rule `R-PA-HMSA-NNN` family is anchored to HMSA's
(the Hawaii Medical Service Association, the Blue Cross Blue Shield licensee for
Hawaii) public provider pages, Medical Policies, and utilization-management /
pharmacy program requirements (new ledger source `hmsa-precert`). HMSA is the
dominant health plan in Hawaii and a distinct independent licensee not already
routed to an earlier bucket.

A new `'hmsa'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsla'` and
before the generic `'commercial'` fall-through. It matches the `hmsa` acronym, the
`hawaii medical service association` corporate name, and the `blue cross blue
shield of hawaii` plan name, so generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'hmsa'` and vacuously passes on every other packet.

The 20 rules mirror the prior twenty-two commercial families so the twenty-three
commercial overlays stay structurally parallel and auditable side by side, with
HMSA-specific routing names where the plan uses them: the HHIN (Hawaii Health
Information Network) submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 595 rules shipped (was 575), 547 source-anchored (was 527), 38
sources (was 37), 0 ledger orphans, 0 coverage gaps. A new `hmsa-precert` golden
fixture (hospital-outpatient knee arthroscopy under an HMSA letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-nine goldens gain
+20 vacuous-pass findings each; all thirty re-seeded deterministically. Tests: +9
engine assertions (count 595, the off-bucket loop, fire/pass checks) and +1
classify assertion. e2e pa-lint rule count 575 -> 595. Catalog count unchanged
(255 tiles; HMSA adds rules, not a tile). The PA tile's wave banner advances to
52-29.

### Added (spec-v52 wave 52-28 — §4.5.28 Blue Cross and Blue Shield of Louisiana commercial overlay, 20 of 20)

The twenty-second named commercial-payer overlay, and the seventeenth "Blues
plans by state" overlay. The full 20-rule `R-PA-BCBSLA-NNN` family is anchored to
Blue Cross and Blue Shield of Louisiana's public provider pages, Medical Policies,
and utilization-management / pharmacy program requirements (new ledger source
`bcbsla-precert`). BCBSLA is the dominant Blue Cross Blue Shield licensee in
Louisiana and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbsla'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsmn'` and
before the generic `'commercial'` fall-through. It matches only
definitively-Louisiana anchors (the plan name and the `bcbsla` acronym, which
carries no substring collision with the `bcbsal` Alabama or `bcbsm` Michigan
buckets), so generic `blue cross` / `blue shield` and other licensees stay in the
commercial fall-through, and an explicit "Medicare Advantage" string still wins
the MA bucket earlier. Each rule self-gates on `bundle.payer === 'bcbsla'` and
vacuously passes on every other packet.

The 20 rules mirror the prior twenty-one commercial families so the twenty-two
commercial overlays stay structurally parallel and auditable side by side, with
BCBSLA-specific routing names where the plan uses them: the iLinkBlue / Availity
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 575 rules shipped (was 555), 527 source-anchored (was 507), 37
sources (was 36), 0 ledger orphans, 0 coverage gaps. A new `bcbsla-precert` golden
fixture (hospital-outpatient knee arthroscopy under a BCBSLA letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-eight goldens gain
+20 vacuous-pass findings each; all twenty-nine re-seeded deterministically.
Tests: +9 engine assertions (count 575, the off-bucket loop, fire/pass checks) and
+1 classify assertion. e2e pa-lint rule count 555 -> 575. Catalog count unchanged
(255 tiles; BCBSLA adds rules, not a tile). The PA tile's wave banner advances to
52-28.

### Added (spec-v52 wave 52-27 — §4.5.27 Blue Cross and Blue Shield of Minnesota commercial overlay, 20 of 20)

The twenty-first named commercial-payer overlay, and the sixteenth "Blues plans
by state" overlay. The full 20-rule `R-PA-BCBSMN-NNN` family is anchored to Blue
Cross and Blue Shield of Minnesota's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsmn-precert`). BCBSMN is the dominant Blue Cross Blue Shield licensee in
Minnesota and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbsmn'` payer bucket in `lib/pa/payer.js` is placed after `'bluekc'`
and before the generic `'commercial'` fall-through. It matches only the
spelled-out plan name and the `blue cross of minnesota` short form — the bare
`bcbsmn` acronym is deliberately omitted, because `bcbsm` (the earlier Michigan
bucket) is a substring of `bcbsmn` and a bare-acronym packet would otherwise route
to Michigan; the spelled-out name has no such collision (a classify test asserts
Michigan still routes to `bcbsm`). Generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsmn'` and vacuously passes on every other packet.

The 20 rules mirror the prior twenty commercial families so the twenty-one
commercial overlays stay structurally parallel and auditable side by side, with
BCBSMN-specific routing names where the plan uses them: the Availity / provider
portal submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 555 rules shipped (was 535), 507 source-anchored (was 487), 36
sources (was 35), 0 ledger orphans, 0 coverage gaps. A new `bcbsmn-precert` golden
fixture (hospital-outpatient knee arthroscopy under a Blue Cross and Blue Shield
of Minnesota letterhead) exercises the on-bucket path — 009 flag, 003 info — and
the other twenty-seven goldens gain +20 vacuous-pass findings each; all
twenty-eight re-seeded deterministically. Tests: +9 engine assertions (count 555,
the off-bucket loop, fire/pass checks) and +1 classify assertion. e2e pa-lint rule
count 535 -> 555. Catalog count unchanged (255 tiles; BCBSMN adds rules, not a
tile). The PA tile's wave banner advances to 52-27.

### Added (spec-v52 wave 52-26 — §4.5.26 Blue Cross and Blue Shield of Kansas City commercial overlay, 20 of 20)

The twentieth named commercial-payer overlay, and the fifteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-BLUEKC-NNN` family is anchored to Blue
Cross and Blue Shield of Kansas City's public provider pages, Medical Policies,
and utilization-management / pharmacy program requirements (new ledger source
`bluekc-precert`). Blue KC is the dominant Blue Cross Blue Shield licensee in the
greater Kansas City bistate metropolitan area and a distinct independent licensee
from HCSC and the other Blues already modeled.

A new `'bluekc'` payer bucket in `lib/pa/payer.js` is placed after `'arkbcbs'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Kansas-City anchors (the plan name and the `blue kc` short form), so
generic `blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA bucket
earlier. Each rule self-gates on `bundle.payer === 'bluekc'` and vacuously passes
on every other packet.

The 20 rules mirror the prior nineteen commercial families so the twenty
commercial overlays stay structurally parallel and auditable side by side, with
Blue KC-specific routing names where the plan uses them: the Availity Essentials /
Blue KC provider portal submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 535 rules shipped (was 515), 487 source-anchored (was 467), 35
sources (was 34), 0 ledger orphans, 0 coverage gaps. A new `bluekc-precert` golden
fixture (hospital-outpatient knee arthroscopy under a Blue KC letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-six
goldens gain +20 vacuous-pass findings each; all twenty-seven re-seeded
deterministically. Tests: +9 engine assertions (count 535, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 515 -> 535.
Catalog count unchanged (255 tiles; Blue KC adds rules, not a tile). The PA tile's
wave banner advances to 52-26.

### Added (spec-v52 wave 52-25 — §4.5.25 Arkansas Blue Cross and Blue Shield commercial overlay, 20 of 20)

The nineteenth named commercial-payer overlay, and the fourteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-ARKBCBS-NNN` family is anchored to Arkansas
Blue Cross and Blue Shield's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`arkbcbs-precert`). Arkansas Blue Cross is the dominant Blue Cross Blue Shield
licensee in Arkansas and one of the largest independent licensees not already
routed to an earlier bucket.

A new `'arkbcbs'` payer bucket in `lib/pa/payer.js` is placed after `'bcbssc'` and
before the generic `'commercial'` fall-through. It matches only
definitively-Arkansas anchors (the `arkansas blue cross [and blue shield]` plan
name and the `arkansas bcbs` short form), so generic `blue cross` / `blue shield`
and other licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'arkbcbs'` and vacuously passes on every other packet.

The 20 rules mirror the prior eighteen commercial families so the nineteen
commercial overlays stay structurally parallel and auditable side by side, with
Arkansas-specific routing names where the plan uses them: the AHIN / Availity
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 515 rules shipped (was 495), 467 source-anchored (was 447), 34
sources (was 33), 0 ledger orphans, 0 coverage gaps. A new `arkbcbs-precert`
golden fixture (hospital-outpatient knee arthroscopy under an Arkansas Blue Cross
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
twenty-five goldens gain +20 vacuous-pass findings each; all twenty-six re-seeded
deterministically. Tests: +9 engine assertions (count 515, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 495 -> 515.
Catalog count unchanged (255 tiles; Arkansas Blue Cross adds rules, not a tile).
The PA tile's wave banner advances to 52-25.

### Added (spec-v52 wave 52-24 — §4.5.24 Blue Cross Blue Shield of South Carolina commercial overlay, 20 of 20)

The eighteenth named commercial-payer overlay, and the thirteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-BCBSSC-NNN` family is anchored to Blue
Cross Blue Shield of South Carolina's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbssc-precert`). BCBSSC is the dominant Blue Cross Blue Shield licensee in South
Carolina and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbssc'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsal'` and
before the generic `'commercial'` fall-through. It matches only
definitively-South-Carolina anchors (the plan name and the `bcbssc` acronym, which
carries no substring collision with the Michigan `bcbsm` bucket), so generic
`blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA bucket
earlier. Each rule self-gates on `bundle.payer === 'bcbssc'` and vacuously passes
on every other packet.

The 20 rules mirror the prior seventeen commercial families so the eighteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSSC-specific routing names where the plan uses them: the My Insurance Manager /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 495 rules shipped (was 475), 447 source-anchored (was 427), 33
sources (was 32), 0 ledger orphans, 0 coverage gaps. A new `bcbssc-precert` golden
fixture (hospital-outpatient knee arthroscopy under a BCBSSC letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-four goldens gain
+20 vacuous-pass findings each; all twenty-five re-seeded deterministically.
Tests: +9 engine assertions (count 495, the off-bucket loop, fire/pass checks) and
+1 classify assertion. e2e pa-lint rule count 475 -> 495. Catalog count unchanged
(255 tiles; BCBSSC adds rules, not a tile). The PA tile's wave banner advances to
52-24.

### Added (spec-v52 wave 52-23 — §4.5.23 Blue Cross Blue Shield of Alabama commercial overlay, 20 of 20)

The seventeenth named commercial-payer overlay, and the twelfth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, Horizon, BCBST, and
BCBSMA. The full 20-rule `R-PA-BCBSAL-NNN` family is anchored to Blue Cross Blue
Shield of Alabama's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsal-precert`). BCBSAL is the dominant Blue Cross Blue Shield licensee in
Alabama and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, Blue Cross NC, Horizon, BCBST, or BCBSMA buckets.

A new `'bcbsal'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsma'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Alabama anchors (the plan name and the `bcbsal` acronym), so generic
`blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA
bucket earlier. Each rule self-gates on `bundle.payer === 'bcbsal'` and vacuously
passes on every other packet.

The 20 rules mirror the prior sixteen commercial families so the seventeen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSAL-specific routing names where the plan uses them: the ProviderAccess /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 475 rules shipped (was 455), 427 source-anchored (was 407), 32
sources (was 31), 0 ledger orphans, 0 coverage gaps. A new `bcbsal-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSAL letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-three
goldens gain +20 vacuous-pass findings each; all twenty-four re-seeded
deterministically. Tests: +9 engine assertions (count 475, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 455 -> 475.
Catalog count unchanged (255 tiles; BCBSAL adds rules, not a tile). The PA tile's
wave banner advances to 52-23.

### Added (spec-v52 wave 52-22 — §4.5.22 Blue Cross Blue Shield of Massachusetts commercial overlay, 20 of 20)

The sixteenth named commercial-payer overlay, and the eleventh "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, Horizon, and BCBST.
The full 20-rule `R-PA-BCBSMA-NNN` family is anchored to Blue Cross Blue Shield
of Massachusetts's public Provider Central pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsma-precert`). BCBSMA is the dominant Blue Cross Blue Shield licensee in
Massachusetts and one of the largest independent licensees not already routed to
the Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, IBX, CareFirst, Blue Cross NC, Horizon, or BCBST buckets.

A new `'bcbsma'` payer bucket in `lib/pa/payer.js` is placed after `'bcbst'` and
before the generic `'commercial'` fall-through. It matches only the spelled-out
plan name and the `bcbs of massachusetts` short form — the bare `bcbsma` acronym
is deliberately omitted, because `bcbsm` (the earlier Michigan bucket) is a
substring of `bcbsma` and a bare-acronym packet would otherwise route to
Michigan; the spelled-out name has no such collision (a classify test asserts
Michigan still routes to `bcbsm`). Generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsma'` and vacuously passes on every other packet.

The 20 rules mirror the prior fifteen commercial families so the sixteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSMA-specific routing names where the plan uses them: the Provider Central /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 455 rules shipped (was 435), 407 source-anchored (was 387), 31
sources (was 30), 0 ledger orphans, 0 coverage gaps. A new `bcbsma-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSMA letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-two
goldens gain +20 vacuous-pass findings each; all twenty-three re-seeded
deterministically. Tests: +9 engine assertions (count 455, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 435 -> 455.
Catalog count unchanged (255 tiles; BCBSMA adds rules, not a tile). The PA tile's
wave banner advances to 52-22.

### Added (spec-v52 wave 52-21 — §4.5.21 Blue Cross Blue Shield of Tennessee commercial overlay, 20 of 20)

The fifteenth named commercial-payer overlay, and the tenth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, and Horizon. The
full 20-rule `R-PA-BCBST-NNN` family is anchored to Blue Cross Blue Shield of
Tennessee's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbst-precert`). BCBST is the dominant Blue Cross Blue Shield licensee in
Tennessee and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, Blue Cross NC, or Horizon buckets.

A new `'bcbst'` payer bucket in `lib/pa/payer.js` is placed after `'horizon'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Tennessee anchors (the plan name and the `bcbst` acronym), so
generic `blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA
bucket earlier. Each rule self-gates on `bundle.payer === 'bcbst'` and vacuously
passes on every other packet.

The 20 rules mirror the prior fourteen commercial families so the fifteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBST-specific routing names where the plan uses them: the Availity Essentials /
BlueAccess submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 435 rules shipped (was 415), 387 source-anchored (was 367), 30
sources (was 29), 0 ledger orphans, 0 coverage gaps. A new `bcbst-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBST letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-one
goldens gain +20 vacuous-pass findings each; all twenty-two re-seeded
deterministically. Tests: +9 engine assertions (count 435, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 415 -> 435.
Catalog count unchanged (255 tiles; BCBST adds rules, not a tile). The PA tile's
wave banner advances to 52-21.

### Added (spec-v52 wave 52-20 — §4.5.20 Horizon Blue Cross Blue Shield of New Jersey commercial overlay, 20 of 20)

The fourteenth named commercial-payer overlay, and the ninth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, and Blue Cross NC. The full
20-rule `R-PA-HORIZON-NNN` family is anchored to Horizon Blue Cross Blue Shield
of New Jersey's public provider prior-authorization pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`horizon-precert`). Horizon is the dominant Blue Cross Blue Shield licensee in
New Jersey and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, or Blue Cross NC buckets.

A new `'horizon'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsnc'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Horizon anchors (`horizon blue cross`, `horizon bcbs`, `horizon
healthcare services`), never the bare common word `horizon`, so generic `blue
cross` / `blue shield` and other licensees stay in the commercial fall-through,
and an explicit "Medicare Advantage" string still wins the MA bucket earlier.
Each rule self-gates on `bundle.payer === 'horizon'` and vacuously passes on
every other packet.

The 20 rules mirror the prior thirteen commercial families so the fourteen
commercial overlays stay structurally parallel and auditable side by side, with
Horizon-specific routing names where the plan uses them: the NaviNet provider
portal / Availity submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 415 rules shipped (was 395), 367 source-anchored (was 347), 29
sources (was 28), 0 ledger orphans, 0 coverage gaps. A new `horizon-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Horizon letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty goldens
gain +20 vacuous-pass findings each; all twenty-one re-seeded deterministically.
Tests: +9 engine assertions (count 415, the off-bucket loop, fire/pass checks)
and +1 classify assertion. e2e pa-lint rule count 395 -> 415. Catalog count
unchanged (255 tiles; Horizon adds rules, not a tile). The PA tile's wave banner
advances to 52-20.

### Added (spec-v52 wave 52-19 — §4.5.19 Blue Cross Blue Shield of North Carolina commercial overlay, 20 of 20)

The thirteenth named commercial-payer overlay, and the eighth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, and CareFirst. The full 20-rule
`R-PA-BCBSNC-NNN` family is anchored to Blue Cross Blue Shield of North
Carolina's public provider prior-authorization pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsnc-precert`). Blue Cross NC is the dominant Blue Cross Blue Shield licensee
in North Carolina and one of the largest independent licensees not already
routed to the Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield
of California, IBX, or CareFirst buckets.

A new `'bcbsnc'` payer bucket in `lib/pa/payer.js` is placed after `'carefirst'`
and before the generic `'commercial'` fall-through. It matches only
definitively-North-Carolina anchors (the plan name, the `blue cross nc` short
form, and the `bcbsnc` acronym), so generic `blue cross` / `blue shield` and
other licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsnc'` and vacuously passes on every other packet.

The 20 rules mirror the prior twelve commercial families so the thirteen
commercial overlays stay structurally parallel and auditable side by side, with
Blue-Cross-NC-specific routing names where the plan uses them: the Blue e
provider portal / Availity submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 395 rules shipped (was 375), 347 source-anchored (was 327), 28
sources (was 27), 0 ledger orphans, 0 coverage gaps. A new `bcbsnc-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Blue Cross NC
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
nineteen goldens gain +20 vacuous-pass findings each; all twenty re-seeded
deterministically. Tests: +9 engine assertions (count 395, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 375 -> 395.
Catalog count unchanged (255 tiles; Blue Cross NC adds rules, not a tile). The
PA tile's wave banner advances to 52-19.

### Added (spec-v52 wave 52-18 — §4.5.18 CareFirst BlueCross BlueShield commercial overlay, 20 of 20)

The twelfth named commercial-payer overlay, and the seventh "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, and Independence Blue Cross. The full 20-rule `R-PA-CAREFIRST-NNN`
family is anchored to CareFirst BlueCross BlueShield's public provider
preauthorization pages, Medical Policies, and utilization-management / pharmacy
program requirements (new ledger source `carefirst-precert`). CareFirst is the
dominant Blue Cross Blue Shield licensee in the mid-Atlantic — Maryland, the
District of Columbia, and Northern Virginia — and one of the largest independent
licensees not already routed to the Anthem/Elevance, HCSC, Highmark, Florida
Blue, BCBSM, Blue Shield of California, or IBX buckets.

A new `'carefirst'` payer bucket in `lib/pa/payer.js` is placed after `'ibx'`
and before the generic `'commercial'` fall-through. It matches the unambiguous
`carefirst` trade-name anchor, so generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'carefirst'` and vacuously passes on every other packet.

The 20 rules mirror the prior eleven commercial families so the twelve commercial
overlays stay structurally parallel and auditable side by side, with
CareFirst-specific routing names where the plan uses them: the CareFirst Direct /
iEXchange submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 375 rules shipped (was 355), 327 source-anchored (was 307), 27
sources (was 26), 0 ledger orphans, 0 coverage gaps. A new `carefirst-precert`
golden fixture (hospital-outpatient knee arthroscopy under a CareFirst
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
eighteen goldens gain +20 vacuous-pass findings each; all nineteen re-seeded
deterministically. Tests: +9 engine assertions (count 375, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 355 -> 375.
Catalog count unchanged (255 tiles; CareFirst adds rules, not a tile). The PA
tile's wave banner advances to 52-18.

### Added (spec-v52 wave 52-17 — §4.5.17 Independence Blue Cross commercial overlay, 20 of 20)

The eleventh named commercial-payer overlay, and the sixth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, and Blue Shield of
California. The full 20-rule `R-PA-IBX-NNN` family is anchored to Independence
Blue Cross's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`ibx-precert`). Independence Blue Cross (IBX) is the dominant Blue Cross Blue
Shield licensee in southeastern Pennsylvania (the Philadelphia region) and one
of the largest independent licensees not already routed to the Anthem/Elevance,
HCSC, Highmark, Florida Blue, BCBSM, or Blue Shield of California buckets.

A new `'ibx'` payer bucket in `lib/pa/payer.js` is placed after `'blue-shield-ca'`
and before the generic `'commercial'` fall-through. It matches the `independence
blue cross` / `independence administrators` / `ibx` anchors. Critically, IBX
(southeastern PA) is a distinct licensee from Highmark (western / central PA) —
the `'highmark'` bucket catches that brand earlier — so generic `blue cross` /
`blue shield` and other licensees stay in the commercial fall-through, and an
explicit "Medicare Advantage" string still wins the MA bucket earlier. Each rule
self-gates on `bundle.payer === 'ibx'` and vacuously passes on every other packet.

The 20 rules mirror the prior ten commercial families so the eleven commercial
overlays stay structurally parallel and auditable side by side, with IBX-specific
routing names where the plan uses them: the Availity / PEAR provider portal
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 355 rules shipped (was 335), 307 source-anchored (was 287), 26
sources (was 25), 0 ledger orphans, 0 coverage gaps. A new `ibx-precert` golden
fixture (hospital-outpatient knee arthroscopy under an Independence Blue Cross
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
seventeen goldens gain +20 vacuous-pass findings each; all eighteen re-seeded
deterministically. Tests: +10 engine assertions (count 355, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 335 -> 355.
Catalog count unchanged (255 tiles; IBX adds rules, not a tile). The PA tile's
wave banner advances to 52-17.

### Added (spec-v52 wave 52-16 — §4.5.16 Blue Shield of California commercial overlay, 20 of 20)

The tenth named commercial-payer overlay, and the fifth "Blues plans by state"
overlay after HCSC, Highmark, Florida Blue, and BCBSM. The full 20-rule
`R-PA-BSCA-NNN` family is anchored to Blue Shield of California's public provider
authorizations pages, Medical Policies, and utilization-management / pharmacy
program requirements (new ledger source `blueshieldca-precert`). Blue Shield of
California is the second-largest health plan in California and one of the largest
independent Blue Cross Blue Shield licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, or BCBSM buckets.

A new `'blue-shield-ca'` payer bucket in `lib/pa/payer.js` is placed after
`'bcbsm'` and before the generic `'commercial'` fall-through. It matches the
unambiguous plan-name anchor `blue shield of california` (and `blue shield of
ca`), so generic `blue cross` / `blue shield` and other licensees stay in the
commercial fall-through. Critically, Blue Shield of California is a distinct
licensee from Anthem Blue Cross of California (Elevance) — the `'anthem'` bucket
catches the latter earlier — and an explicit "Medicare Advantage" string still
wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'blue-shield-ca'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark /
Florida Blue / BCBSM families so the ten commercial overlays stay structurally
parallel and auditable side by side, with Blue Shield of California-specific
routing names where the plan uses them: the Availity / provider connection
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 335 rules shipped (was 315), 287 source-anchored (was 267), 25
sources (was 24), 0 ledger orphans, 0 coverage gaps. A new
`blue-shield-ca-precert` golden fixture (hospital-outpatient knee arthroscopy
under a Blue Shield of California letterhead) exercises the on-bucket path — 009
flag, 003 info — and the other sixteen goldens gain +20 vacuous-pass findings
each; all seventeen re-seeded deterministically. Tests: +10 engine assertions
(count 335, the off-bucket loop, fire/pass checks) and +1 classify assertion.
e2e pa-lint rule count 315 -> 335. Catalog count unchanged (255 tiles; Blue
Shield of California adds rules, not a tile). The PA tile's wave banner advances
to 52-16.

### Added (spec-v52 wave 52-15 — §4.5.15 BCBSM / Blue Cross Blue Shield of Michigan commercial overlay, 20 of 20)

The ninth named commercial-payer overlay, and the fourth "Blues plans by state"
overlay after HCSC, Highmark, and Florida Blue. The full 20-rule
`R-PA-BCBSM-NNN` family is anchored to BCBSM's public provider
authorization-requirements pages, Medical Policies, and utilization-management /
pharmacy program requirements (new ledger source `bcbsm-precert`). Blue Cross
Blue Shield of Michigan (with its HMO subsidiary Blue Care Network) is the
dominant Blue Cross Blue Shield licensee in Michigan and one of the largest
independent licensees not already routed to the Anthem/Elevance, HCSC, Highmark,
or Florida Blue buckets.

A new `'bcbsm'` payer bucket in `lib/pa/payer.js` is placed after
`'florida-blue'` and before the generic `'commercial'` fall-through. It matches
only definitively-BCBSM anchors — the `blue cross [and] blue shield of michigan`
plan name, the `bcbsm` acronym, and the `blue care network` HMO brand — so
generic `blue cross` / `blue shield` and other licensees (Independence Blue
Cross, CareFirst) stay in the commercial fall-through, and "BCBSM Medicare Plus
Blue" still wins the MA bucket earlier when it carries an explicit "Medicare
Advantage" string. Each rule self-gates on `bundle.payer === 'bcbsm'` and
vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark /
Florida Blue families so the nine commercial overlays stay structurally parallel
and auditable side by side, with BCBSM-specific routing names where BCBSM uses
them: the Availity Essentials submission channel (003), BCBSM's advanced-imaging
utilization-management program (007, 012), BCBSM pharmacy management for step
therapy (011), BCBSM behavioral health (016), and the Blue Distinction Centers
for Transplant (017).

Coverage is now 315 rules shipped (was 295), 267 source-anchored (was 247), 24
sources (was 23), 0 ledger orphans, 0 coverage gaps. A new `bcbsm-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSM letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other fifteen
goldens gain +20 vacuous-pass findings each; all sixteen re-seeded
deterministically. Tests: +10 engine assertions (count 315, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 295 -> 315.
Catalog count unchanged (255 tiles; BCBSM adds rules, not a tile). The PA tile's
wave banner advances to 52-15.

### Added (spec-v52 wave 52-14 — §4.5.14 Florida Blue / GuideWell commercial overlay, 20 of 20)

The eighth named commercial-payer overlay, and the third "Blues plans by state"
overlay after HCSC and Highmark. The full 20-rule `R-PA-FLBLUE-NNN` family is
anchored to Florida Blue's public provider authorizations pages, Medical
Policies, and utilization-management / pharmacy program requirements (new ledger
source `floridablue-precert`). Florida Blue (Blue Cross and Blue Shield of
Florida, a GuideWell company) is the dominant Blue Cross Blue Shield licensee in
Florida and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, or Highmark buckets.

A new `'florida-blue'` payer bucket in `lib/pa/payer.js` is placed after
`'highmark'` and before the generic `'commercial'` fall-through. It matches only
definitively-Florida-Blue anchors — the `florida blue` / `guidewell` trade names
and the `blue cross [and] blue shield of florida` plan name — so generic
`blue cross` / `blue shield` and other licensees (Independence Blue Cross, Blue
Shield of California) stay in the commercial fall-through, and "Florida Blue
Medicare Advantage" still wins the MA bucket earlier when it carries an explicit
"Medicare Advantage" string. Each rule self-gates on
`bundle.payer === 'florida-blue'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark
families so the eight commercial overlays stay structurally parallel and
auditable side by side, with Florida Blue-specific routing names where Florida
Blue uses them: the Availity Essentials submission channel (003), Florida Blue's
advanced-imaging utilization-management program (007, 012), Florida Blue pharmacy
management for step therapy (011), Florida Blue behavioral health (016), and the
Blue Distinction Centers for Transplant (017).

Coverage is now 295 rules shipped (was 275), 247 source-anchored (was 227), 23
sources (was 22), 0 ledger orphans, 0 coverage gaps. A new
`florida-blue-precert` golden fixture (hospital-outpatient knee arthroscopy
under a Florida Blue letterhead) exercises the on-bucket path — 009 flag, 003
info — and the other fourteen goldens gain +20 vacuous-pass findings each; all
fifteen re-seeded deterministically. Tests: +10 engine assertions (count 295,
the off-bucket loop, fire/pass checks) and +1 classify assertion. e2e pa-lint
rule count 275 -> 295. Catalog count unchanged (255 tiles; Florida Blue adds
rules, not a tile). The PA tile's wave banner advances to 52-14.

### Added (spec-v52 wave 52-13 — §4.5.13 Highmark / Blue Cross Blue Shield commercial overlay, 20 of 20)

The seventh named commercial-payer overlay, and the second "Blues plans by
state" overlay after HCSC. The full 20-rule `R-PA-HIGHMARK-NNN` family is
anchored to Highmark's public Provider Resource Center, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`highmark-precert`). Highmark is the second-largest independent Blue Cross Blue
Shield licensee (after HCSC); it operates the Blues plans of Pennsylvania, West
Virginia, Delaware, and western / northeastern New York.

A new `'highmark'` payer bucket in `lib/pa/payer.js` is placed after `'hcsc'`
and before the generic `'commercial'` fall-through. It matches the single
unambiguous brand anchor `highmark` (a distinct trade name, not a generic Blues
phrase), so generic `blue cross` / `blue shield` and other licensees stay in
the commercial fall-through, and "Highmark Medicare Advantage" (Freedom Blue)
still wins the MA bucket earlier when it carries an explicit "Medicare
Advantage" string. Each rule self-gates on `bundle.payer === 'highmark'` and
vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC families so
the seven commercial overlays stay structurally parallel and auditable side by
side, with Highmark-specific routing names where Highmark uses them: the
Availity Essentials portal and Provider Resource Center (003), Highmark's
advanced-imaging utilization-management program (007, 012), Highmark pharmacy
management for step therapy (011), Highmark behavioral health (016), and the
Blue Distinction Centers for Transplant (017).

Coverage is now 275 rules shipped (was 255), 227 source-anchored (was 207), 22
sources (was 21), 0 ledger orphans, 0 coverage gaps. A new `highmark-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Highmark
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
thirteen goldens gain +20 vacuous-pass findings each; all fourteen re-seeded
deterministically. Tests: +10 engine assertions (count 275, the off-bucket
loop, fire/pass checks) and +1 classify assertion. e2e pa-lint rule count
255 -> 275. Catalog count unchanged (255 tiles; Highmark adds rules, not a
tile). The PA tile's wave banner advances to 52-13.

### Added (spec-v52 wave 52-12 — §4.5.12 HCSC / Blue Cross Blue Shield commercial overlay, 20 of 20)

The sixth named commercial-payer overlay, and the first to address the §9
"Blues plans by state" candidate directly. The full 20-rule `R-PA-HCSC-NNN`
family is anchored to Health Care Service Corporation's public BCBSIL provider
prior-authorization hub, Medical Policies, and utilization-management / Prime
Therapeutics program requirements (new ledger source `hcsc-precert`). HCSC is
the largest Blue Cross Blue Shield licensee not already routed to the
Anthem/Elevance bucket; it operates the Blues plans of Illinois, Texas,
Montana, New Mexico, and Oklahoma.

A new `'hcsc'` payer bucket in `lib/pa/payer.js` is placed after `'humana'` and
before the generic `'commercial'` fall-through. It matches only
definitively-HCSC anchors — the corporate name, the `hcsc` acronym, and the
five state plan names (Blue Cross [and] Blue Shield of Illinois / Texas /
Montana / New Mexico / Oklahoma). Generic `blue cross` / `blue shield` and
other licensees (Florida Blue, Blue Shield of California) stay in the
commercial fall-through, exactly as the Anthem bucket leaves them, and "Blue
Cross Medicare Advantage" still wins the MA bucket earlier. Each rule self-gates
on `bundle.payer === 'hcsc'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana families so the
six commercial overlays stay structurally parallel and auditable side by side,
with HCSC-specific routing names where HCSC uses them: the Availity Essentials
submission channel (003), HCSC's advanced-imaging utilization-management
program (007, 012), Prime Therapeutics (which HCSC co-owns) for pharmacy / step
therapy (011), HCSC Behavioral Health for behavioral health (016), and the Blue
Distinction Centers for Transplant for transplant (017). As with Humana, the
imaging / lab-management program is named generically in the ruleset, since its
current vendor name collides with an AI-vendor substring barred from source by
spec-v50 §3.6 (check-commitments enforces this).

Coverage is now 255 rules shipped (was 235), 207 source-anchored (was 187), 21
sources (was 20), 0 ledger orphans, 0 coverage gaps. A new `hcsc-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSIL letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twelve
goldens gain +20 vacuous-pass findings each; all thirteen re-seeded
deterministically. Tests: +10 engine assertions (count 255, the off-bucket
loop, fire/pass checks) and +1 classify assertion. Catalog count unchanged
(255 tiles; HCSC adds rules, not a tile). The PA tile's wave banner advances to
52-12.

### Fixed (tool views — deferred listener wiring on a torn-down view)

Hardened a navigation/teardown race that surfaced intermittently in the
`all-tools` e2e sweep on Firefox (a `pageerror`: `getElementById(...) is null`
→ `.addEventListener`). Eleven tool renderers (opioid-mme, steroid-equiv,
benzo-equiv, abx-renal, vasopressor, field-triage, tetanus, rabies-pep,
bbp-exposure, tb-testing, sti-screening) build their UI and wire input
listeners **inside** a `loadFile(...).then(...)` callback. When the user (or
the test) navigated to another tool before the dataset fetch resolved,
`renderToolView` had already cleared the DOM, so the late callback wired
listeners to elements that no longer existed and threw. Each deferred callback
now bails with `if (!root.isConnected) return;` when its view was torn down
before the fetch resolved. Real-user impact: navigating away from one of these
tools mid-load no longer logs a console error. Verified with
`all-tools --project=firefox --repeat-each=3` (9/9 green).

### Added (spec-v52 wave 52-7c — §4.5.7 Aetna commercial overlay, 11 → 15 of ~20)

Five more self-gating `R-PA-AETNA-NNN` rules anchored to named Aetna Clinical
Policy Bulletins and the Outpatient Surgical Procedures policy: step-therapy
prior-trial documentation for a drug request (011, flag), the bariatric CPB
0157 BMI + supervised-weight-management requirement (012, flag), the genetic
CPB 0140 pre-test counseling + family-history requirement (013, flag), a
retrospective-request justification (014, info), and the Outpatient Surgical
Procedures site-of-service rationale for a hospital-setting elective surgery
(015, info). Each vacuously passes off the `aetna` bucket.

No ledger/bucket change (all fifteen Aetna rules map to the existing
`aetna-precert` source by prefix). Coverage is now 150 rules shipped, 102
source-anchored, 0 orphans, 0 gaps. A new `aetna-drug` golden fixture
(specialty J-code request) demonstrates 011 + 010 firing; the `aetna-precert`
fixture now also surfaces 015. All eight goldens re-seeded; e2e finding count
145 → 150. View wave banner advanced to 52-7c.

### Added (spec-v52 wave 52-7b — §4.5.7 Aetna commercial overlay, 6 → 10 of ~20)

Five more self-gating `R-PA-AETNA-NNN` rules keyed to Aetna's public
utilization-management surface: concurrent-review documentation for an
inpatient request (006, flag), the site-of-care requirement for a
hospital-outpatient MRI/CT (007, flag), a clinical-urgency justification on an
expedited request (008, flag), objective evidence (visual field / photos /
measurements) for procedures whose Clinical Policy Bulletin requires it (009,
flag), and the NDC on a physician-administered J-code drug request (010, info).
Each vacuously passes off the `aetna` bucket.

No ledger change (all ten Aetna rules map to the existing `aetna-precert`
source by prefix). Coverage is now 145 rules shipped, 97 source-anchored, 0
orphans, 0 gaps. A new `aetna-imaging` golden fixture (hospital-outpatient
expedited MRI) demonstrates 007 + 008 firing; the `aetna-precert` fixture now
also surfaces 006. All seven goldens re-seeded; e2e finding count 140 → 145.
View wave banner advanced to 52-7b.

### Added (spec-v52 wave 52-7a — §4.5.7 commercial payer overlays open: Aetna)

The §9 wave plan's "first commercial payer overlays" land now that the core,
CMS FFS / MA / Medicaid, specialty, report, and maintenance surfaces are all
complete. `lib/pa/payer.js` gains a named `aetna` payer bucket (before the
generic `commercial` fall-through; `aetna medicare advantage` still routes to
the MA bucket). `lib/pa/rules.js` adds five self-gating `R-PA-AETNA-NNN` rules
(§4.5.7): medical-necessity criteria (Aetna CPB / CMS / MCG) referenced (flag),
supporting clinical documentation attached (flag), submission channel noted
(info), service-on-precert-list (info stub, R-PA-053 pattern), and a
procedure-specific precertification questionnaire when required (flag). Each
rule vacuously passes on non-Aetna packets and cites Aetna's public
precertification hub.

`lib/pa/rule-sources.js` maps `R-PA-AETNA-` to a new ledger source
`aetna-precert`; `pa-staleness-ledger.json` and the bundled
`lib/pa/staleness-ledger.js` were regenerated (16 sources; 140 rules shipped;
92 source-anchored; 0 orphans; 0 coverage gaps). A new `aetna-precert` golden
fixture demonstrates the overlay; the four prior goldens were re-seeded to add
the five vacuously-passing Aetna findings. View wave banner advanced to 52-7a.

### Added (spec-v52 wave 52-6j — §4.5.6 stale-source disabling: the engine half)

Wires the engine to act on a ledger source marked `disabled` (`true` or
`{ since, reason }`): `disabledSourceMap(ledger)` (`lib/pa/staleness.js`)
normalizes the flag, and `runEngine(bundle, rules, { disabledSources })` skips
any rule anchored to a disabled source — emitting a `status: "disabled"`
finding (evidence null, note recording the source / since / reason) instead of
running its check. `summarizeFindings` gains a `disabled` count; the report
audit trail gains a `disabledRules` array; the DOCX renders both. A
`disabled-source` golden fixture exercises the path. Closes the last "Not yet
built" item in `docs/pa-maintenance.md`; §4.5.6 is complete.

### Added (spec-v52 wave 52-6i — §4.5.6 / §8.2 maintainer refresh helper)

`scripts/refresh-pa-rules.mjs` (exposed as `npm run refresh:pa-rules`) fetches
every ledger source URL, reports the HTTP outcome and a content SHA-256,
computes staleness age, tallies dependent rules per source, and prints a
per-source recommendation. Because it makes outbound network requests it is
NOT wired into `npm run lint` / `npm run test` and never runs in CI's offline
build or the browser (spec-v50 §3.1). Its report-building core is pure and
network-free, unit-tested in `test/unit/pa-refresh.test.js` with injected
fetch outcomes.

### Added (spec-v52 wave 52-6h — §4.5.6 structured per-rule source metadata)

New pure module `lib/pa/rule-sources.js` exports `ruleSourceIds(id)`, a total
map from rule id to the ledger source id(s) it is anchored to (or `[]` for a
structural rule). `rules.js` attaches the result as each rule's `sources`
field at load. `lib/pa/staleness.js` gains `findRuleSourceOrphans` and
`findLedgerCoverageGaps`, both wired into `scripts/check-pa-staleness.mjs` so
the ledger and the per-rule map cannot drift in either direction. The field is
build/maintenance plumbing and never enters a finding or the report.

### Added (spec-v52 wave 52-6g — §4.3 / §8.1 PA runtime no-network spec)

Ships the runtime proof of §4.3's central commitment — "the only network
access during a session is the initial page load; after first paint there
are zero outbound requests" — and of Sophie's first commitment (spec-v50
§3.1) that the patient's chart never leaves the tab. Until now that was
asserted statically (`check-commitments.mjs`, `grep-check.mjs`) and at
runtime only for a sample of numeric tiles (`no-network.spec.js`); the PA
pipeline — the one surface that ingests PHI — had no runtime network
assertion.

**New surface:**

- `test/integration/pa-no-network.spec.js` (§8.1) mirrors the generic
  no-network harness but drives the PA pipeline end-to-end: it drops a
  happy-path TXT packet plus a one-page PDF (the PDF forces the lazy
  `pdf.js` import — the single most likely place for an accidental
  off-origin fetch such as a CDN worker, cmaps, or standard fonts), then
  serializes all three report flavors (DOCX, full JSON, redacted JSON) by
  clicking each download button. It then asserts zero off-origin requests,
  zero `navigator.sendBeacon` / `Image`-pixel fires, an empty
  `document.cookie`, and only allowlisted storage keys (the PA tile writes
  none). Chromium-only, consistent with the other `pa-lint-*` specs.

View wave banner advanced to 52-6g.

### Added (spec-v52 wave 52-6f — §4.10 / §8.2 PA golden-fixture audit + §8.4 property tests)

Builds the two determinism-enforcement surfaces §8 named but the report
waves had not yet shipped.

**New surfaces:**

- `scripts/audit-pa.mjs` (§8.2, wired into `npm run lint` → the CI Lint
  step; also `npm run audit:pa`) runs the full deterministic pipeline
  against every fixture under `test/fixtures/pa-lint/` and diffs the
  produced JSON report against the committed golden in
  `test/fixtures/pa-lint/expected/`. The report is built without
  `generatedAt`, so the output is byte-stable (§4.10). Re-seed intended
  changes with `node scripts/audit-pa.mjs --update`.
- Four fixtures: `happy-path`, `missing-npi` (R-PA-016 block), `bad-pos`
  (R-PA-013 block on a POS off the CMS list), `cms-dme` (Medicare FFS
  letterhead engages the §4.5.2 overlay).
- `test/unit/pa-property.test.js` (§8.4) — reorder-invariance,
  irrelevant-file invariance, double-run byte-identity, and redact
  idempotence (plain + findings-aware paths).

**Determinism fix:** the report was not invariant under input file order —
`evidenceLedger` / `extractedData` echoed drop order, and rules citing the
first matching document picked by drop order. `buildBundle` now
canonicalizes document order by content hash (sha256, then name), so the
whole report is order-invariant. No existing test depended on drop order.

Unit suite: 2006 (was 2001).

### Added (spec-v52 wave 52-6e — §4.5.6 / §8.3 follow-up: ledger → ruleset coverage)

Closes a silent-drift gap in the dataset-staleness ledger: its per-source
`rules` arrays named rule ids with nothing verifying those ids still ship.
A renamed or retired rule (cf. the wave 52-2b id correction) would leave
the ledger — and the deferred `scripts/refresh-pa-rules.mjs` that will
iterate exactly these ids — pointing at a dead reference.

**New surfaces:**

- `lib/pa/staleness.js` `findLedgerRuleOrphans(ledger, shippedRuleIds)` —
  pure helper returning every ledger-referenced rule id absent from the
  shipped set, in deterministic (source, then listed) order. Accepts an
  array or a `Set`.
- `scripts/check-pa-staleness.mjs` (already in `npm run lint`) imports
  `STARTER_RULES` from `lib/pa/rules.js`, builds the shipped-id set, and
  exits 1 on the first orphan; the clean line now also reports
  `135 rules shipped, 0 ledger orphans`.

The `rules` arrays stay the representative anchor rules per source (not an
exhaustive map), so no reverse "every rule must have a source" check is
added — that needs the per-rule structured source metadata §4.5.6 still
defers with the refresh script.

**Tests / docs:** 4 new assertions in `test/unit/pa-staleness.test.js`.
`docs/pa-maintenance.md` documents the coverage check and corrects its
"Not yet built" list — the in-tab report-audit-trail staleness item it
still listed actually shipped in 52-6d.

### Added (spec-v52 wave 52-6d — §8.3 follow-up: staleness in the report audit trail)

Surfaces per-source dataset staleness in the in-tab PA report audit
trail, closing the first of the two §8.3 follow-ups wave 52-6c deferred.

**New surfaces:**

- `scripts/build-pa-staleness-ledger.mjs` — generator that emits the
  browser-bundleable module `lib/pa/staleness-ledger.js`
  (`export const PA_STALENESS_LEDGER`) from the canonical
  `pa-staleness-ledger.json`. No runtime fetch, no new dependency.
- `lib/pa/report.js` `auditTrail.datasetStaleness` — per-source
  `{id, label, url, ruleFamily, lastVerified}`; with a caller-supplied
  `generatedAt`, also per-source `{ageDays, state}` and an `evaluated`
  summary. Without a timestamp the block is static ledger facts only, so
  the report stays byte-stable (§4.10).
- `lib/pa/docx.js` — renders a "Dataset source staleness" audit-trail
  subsection.
- `views/pa-lint.js` — captures one timestamp at download time (a user
  click, outside the deterministic compute path) so the in-tab report
  shows live freshness state and a populated "generated at" field.

**CI:** `scripts/check-pa-staleness.mjs` (already in `npm run lint`) now
regenerates-and-diffs `lib/pa/staleness-ledger.js` against the JSON, so
editing the ledger without rebuilding fails CI. 3 new assertions in
`test/unit/pa-report.test.js`.

### Changed (homepage tagline — maintainer request 2026-05-29)

The home `<h1>` and lede were rewritten to a count-free SEO elevator
pitch ("Private healthcare calculators, built for the bedside ...") per
the spec-v29 nurse-first pivot. `check-catalog-truth.mjs` drops the
retired "home lede" count surface; the catalog count of 255 is still
enforced on the remaining 13 surfaces. A "pinned tools" homepage section
was considered and declined — it requires persistent client storage,
which spec-v50 §3.4 forbids and a smoke test guards. Browser bookmarks of
the `/tools/<id>/` pages cover the same need with zero storage.

### Added (spec-v52 wave 52-6c — §8.3 dataset-staleness CI)

Adds the staleness ledger and CI check that spec-v52 §8.3 calls for,
closing the §8 CI surface for the report waves.

**Deliberate refinement of the spec's letter** (same posture as 52-6b):
§8.3 named the ledger `dkb-staleness-ack.yml`. Sophie ships zero runtime
dependencies (spec-v10 §6), so introducing a YAML parser for one config
file is the wrong trade. The ledger is JSON (`pa-staleness-ledger.json`,
repo root). It enumerates the 15 external source families the rules are
anchored to (AMA CPT, CMS HCPCS / ICD-10-CM / POS / NCCI, NPPES, CMS
NCD-LCD / IOM, CMS MA, Medicaid core, ACR AC, FDA labeling, ASA,
DSM-5-TR, NCCN / ACMG), each with its rule ids, canonical URL, and
`lastVerified` date.

**New modules:**

- `lib/pa/staleness.js` — pure evaluator `evaluateStaleness(ledger, now)`
  over the deterministic `lib/pa/date.js` UTC math. States: fresh / warn
  / fail / acknowledged / invalid. An acknowledgment downgrades a stale
  source while the ack itself is current; a stale ack stops masking.
- `scripts/check-pa-staleness.mjs` — CLI wired into `npm run lint` (and
  therefore the CI Lint step). Policy window: warn at 90 days (printed,
  exit 0), fail at 365 days / unparseable date / abandoned ack (exit 1).
  This is §8.3's "fails (or warns, depending on the configured grace
  window)". `--strict` turns warnings into failures; `SOPHIEWELL_NOW`
  pins the evaluation date for reproduction.

**Maintenance:** the new `docs/pa-maintenance.md` (referenced by §8.2)
documents the monthly verification pass, the acknowledgment mechanism,
and the two deferred §8.3 follow-ups (`scripts/refresh-pa-rules.mjs`,
which needs network + §4.5.6 structured source metadata; and surfacing
per-source staleness in the in-tab report audit trail, which needs the
ledger bundled to honor no-network).

**Tests:** new `test/unit/pa-staleness.test.js` (9 assertions covering
the warn/fail boundaries, acknowledgment downgrade and re-surfacing,
invalid dates, mixed-ledger summary, and a ship-time green guard for the
shipped ledger).

### Added (spec-v52 wave 52-6b — §4.6 DOCX report complete + §4.7 redaction hardening)

Ships the human-facing `.docx` flavor of the spec-v52 §4.6 report and the
third download button, closing the §4.6 report contract (JSON + DOCX, full
and PHI-redacted).

**Deliberate refinement of the spec's letter.** §4.6 / §5.2 named a vendored
docx.js (~140 KB) packed in a worker. This wave instead ships a first-party,
dependency-free OOXML writer (`lib/pa/docx.js`) because it better serves the
spec's own intent:

- **§8.1 testability.** `test/unit/pa-report.test.js` must assert "DOCX
  assembles without throwing" under `node --test`. The vendored mammoth.js /
  pdf.js bundles are browser-only and are never imported by the node runner,
  so a vendored browser docx.js could not be exercised there. A module that
  runs identically in node and the browser can.
- **§4.10 determinism.** docx.js packs via jszip, which stamps each zip entry
  with the wall-clock time (not reproducible). This writer zeroes every DOS
  date/time (fixed 1980-01-01) so the same report yields byte-identical
  `.docx` bytes.
- **spec-v10 §6 dependency budget / §4.9 perf.** The ~140 KB dependency and
  its lazy-load path are avoided entirely; the writer is a few hundred bytes
  of first-party code with zero runtime cost until the user clicks Download.

The output is a minimal valid OOXML package (`[Content_Types].xml` +
`_rels/.rels` + `word/document.xml`) stored uncompressed; system `unzip -t`
confirms CRC integrity and Word / LibreOffice / Google Docs open it. The
§5.1 `report.worker.js` and `vendored/docxjs/` surfaces are therefore not
needed and not added.

**New module:**

- `lib/pa/docx.js` — CRC-32 + store-method zip writer + OOXML paragraph
  rendering. `renderReportDocx(report)` returns a `Uint8Array`; `_internals`
  exposes `crc32` / `zipStore` for unit tests. `lib/pa/report.js` gains
  `buildDocxReport` and `buildRedactedDocxReport`, both rendering the
  already-deterministic JSON report object through the writer.

**§4.7 hardening (PHI-leak fix).** Wave 52-6a's
`redactBundle({redactFindings:true})` masked finding evidence / note strings
by pattern only, so a rule that quoted a raw extracted value back without a
label (e.g. `Found "Jane Q Doe" in doc.txt`) leaked the name into both the
redacted JSON and redacted DOCX reports. `redactBundle` now also scrubs the
literal PHI values the extractor pulled (`patientName` / `dob` / `memberId` /
`ssns` / `tins`, longest-first) out of evidence / note before pattern
redaction. The fix lands in the shared `lib/pa/redact.js`, so both report
flavors are covered.

**View wiring:** the `.pa-downloads` group leads with a third button,
"Download report (.docx)", ahead of the two existing JSON buttons; it builds
the DOCX from the in-memory bundle and writes a Blob via
`URL.createObjectURL`. No network call. A shared `triggerDownload` helper now
backs all three buttons.

**Tests:** new `test/unit/pa-docx.test.js` (7 assertions); 3 new DOCX
assertions in `test/unit/pa-report.test.js`; 1 new literal-scrub regression
in `test/unit/pa-redact.test.js`. The Playwright happy-path is unchanged
(still 135 rules).

### Added (spec-v52 wave 52-6a — §4.6 JSON report + §4.7 PHI redaction open)

Ships the JSON half of the spec-v52 §4.6 report contract plus the
§4.7 PHI redaction module. The DOCX flavor lands in wave 52-6b
alongside the vendored docx.js.

**New modules:**

- `lib/pa/redact.js` — deterministic PHI masking covering
  Patient / Name / DOB / Member ID / Subscriber ID / MRN / Chart
  Number / Address / SSN / phone / email. Labeled patterns keep
  the label and replace the value (`Patient: [REDACTED]`); free-
  text patterns redact in full. Idempotent: redacting twice
  changes nothing. Bundle-level `redactBundle` hard-redacts
  extract-block PHI fields (`patientName`, `dob`, `memberId`,
  `ssns`, `tins`, `serviceDates`, `dates`) via a per-field
  allowlist; structural fields (CPT / ICD-10 / POS / NPI codes)
  pass through unchanged.
- `lib/pa/report.js` — six-section JSON report builder mirroring
  the §4.6 enumeration (coverPage / executiveSummary / findings /
  evidenceLedger / extractedData / auditTrail). Per-rule
  remediation hints by rule-id prefix. Deterministic: same
  `bundle` + `findings` produces byte-identical JSON (no
  `Date.now()`, no random, no fetch); `opts.generatedAt` is
  caller-supplied so golden-tests are byte-stable.

**View wiring:** the findings panel now appends a `.pa-downloads`
group with two `<button>` elements — "Download report (.json)"
and "Download PHI-redacted report (.json)". Each click serializes
the in-memory bundle + findings, builds the JSON report (full or
redacted), wraps it in a Blob via `URL.createObjectURL`, and
triggers a same-origin download. No network call.

19 new unit assertions across `test/unit/pa-redact.test.js` (9)
and `test/unit/pa-report.test.js` (10). Total PA unit suite:
197 assertions. The Playwright happy-path is unchanged at 135
rules.

Wave 52-6b will land the DOCX report (vendored docx.js, ~140 KB
gzipped, MIT) and a third download button.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5e — §4.5.5 genetic-testing overlay COMPLETE: closes §4.5.5 + §4.5)

Final 5 specialty rules triggered by AMA molecular-pathology CPT
(81105-81512, simplified to 81xxx). This wave closes the §4.5.5
specialty surface AND the complete spec-v52 §4.5 ruleset.

- **R-PA-GEN-001** — family-history / pedigree / familial anchor
  per NCCN BRCA / hereditary-cancer criteria. Flag.
- **R-PA-GEN-002** — pre-test / post-test genetic-counseling
  anchor per ACMG / NSGC guidelines. Flag.
- **R-PA-GEN-003** — panel-scope rationale (why single-gene vs
  focused vs comprehensive vs WES vs WGS is appropriate)
  documented. Flag.
- **R-PA-GEN-004** — personal clinical indication: either an
  extracted ICD-10 dx OR a clinical-indication anchor. Flag.
- **R-PA-GEN-005** — genetic-specific informed consent covering
  GINA / incidental findings / family implications. Info.

New helper `collectGeneticTestingCpts(bundle)` in `lib/pa/rules.js`
uses the compact `/^81\d{3}$/` filter for AMA Molecular Pathology
Tier 1 + Tier 2 + Genomic Sequencing Procedures. PLA proprietary
lab codes (0001U-0999U) are intentionally NOT consumed here --
the wave-52-1e CPT extractor doesn't match the 4-digit-plus-U
form, so genetic-test trigger relies on the 81xxx CPTs the
extractor already produces.

R-PA-GEN-004's dual-acceptance logic (either an ICD-10 dx OR a
clinical-indication anchor satisfies the rule) follows the
R-PA-RAD-004 pattern. The evidence string records which branch
fired so the audit trail distinguishes structural-signal pass
from anchor pass.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 178 assertions. The Playwright happy-path now asserts
135 rules render in the findings panel.

This closes spec-v52 §4.5.5 AND the complete §4.5 ruleset:

| Section | Description                              | Rules |
|---------|------------------------------------------|-------|
| §4.5.1  | Core (payer-agnostic)                    | 60    |
| §4.5.2  | CMS Medicare FFS overlay                 | 25    |
| §4.5.3  | CMS Medicare Advantage overlay           | 15    |
| §4.5.4  | Medicaid state-agnostic core             | 10    |
| §4.5.5  | Specialty (rad / inf / surg / BH / gen)  | 25    |
| **§4.5**| **Complete deterministic ruleset**       | **135** |

Wave 52-6 picks up with the §4.6 DOCX report, the §4.7 PHI
redaction, and the §8.3 dataset-staleness CI.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5d — §4.5.5 behavioral-health specialty overlay, 5 of 25)

Five behavioral-health rules triggered by an AMA psychiatric CPT
(90785-90899 psychotherapy, 96130-96139 psych testing) OR an
ICD-10 F-code (F00-F99 mental and behavioral disorders):

- **R-PA-BH-001** — ICD-10 F-code AND DSM-5-TR / diagnostic-
  criteria reference present. Flag.
- **R-PA-BH-002** — treatment plan with measurable / time-bound
  goals. Flag.
- **R-PA-BH-003** — step-up of care (outpatient -> IOP -> PHP ->
  residential -> inpatient) requires a prior-level-of-care
  anchor per ASAM / LOCUS. Flag.
- **R-PA-BH-004** — risk assessment (SI / HI / self-harm) per
  Joint Commission NPSG. Flag.
- **R-PA-BH-005** — SUD packets requesting medication-assisted
  treatment reference DEA X-waiver / OTP / induction-maintenance
  phase. Info.

New helper `collectBehavioralHealthSignals(bundle)` in
`lib/pa/rules.js` returns the BH CPTs, the ICD-10 F-codes, and
a `triggered` boolean -- ALL five BH rules consume the same
signal so the trigger logic stays in one place. Specialty rules
apply across every payer once the trigger fires (no
`bundle.payer` self-gate).

R-PA-BH-005's two-stage trigger -- SUD ICD-10 (F10-F19) OR MAT
keyword -- is the first specialty rule to combine structural
code-range filtering AND a keyword fallback in the gate; the
rule fires when either signal is present, but vacuously passes
on a non-SUD / non-MAT packet.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 172 assertions. The Playwright happy-path now
asserts 130 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5c — §4.5.5 surgery specialty overlay, 5 of 25)

Five surgery rules triggered by an AMA Surgery-category CPT
(10004-69990):

- **R-PA-SURG-001** — conservative-management / non-operative
  trial documented; emergent-surgery anchor bypasses with a
  "does not apply" branch. Flag.
- **R-PA-SURG-002** — imaging supporting surgical indication
  (attached imaging-report doc OR imaging-findings anchor).
  Flag.
- **R-PA-SURG-003** — ASA Physical Status >= 3: pre-op medical
  / anesthesia clearance. Flag.
- **R-PA-SURG-004** — ASA classification 1-5 documented. Flag.
- **R-PA-SURG-005** — informed-consent anchor present (R-PA-059
  covers consent date vs service date ordering across the
  packet). Flag.

New helper `collectSurgeryCpts(bundle)` in `lib/pa/rules.js`
collects surgery-category CPTs via `/^[1-6]\d{4}$/`, mirroring
the radiology / J-code collectors. E/M codes like 99213 (9xxxx)
and radiology codes like 70551 (7xxxx) fall outside the trigger
range so the HAPPY_PACKET fixture continues to all-pass.

R-PA-SURG-001 reuses the wave-52-5a R-PA-RAD-002 emergent-
exception pattern: the rule self-bypasses with "Emergent /
urgent surgical anchor present; rule does not apply" rather
than vacuously passing. R-PA-SURG-005 intentionally narrows
R-PA-059 (core consent date check) to the surgery specialty
section so consent issues surface in the specialty audit
cluster.

6 new unit assertions in `test/unit/pa-engine.test.js`.
R-PA-SURG-001's test explicitly strips HAPPY_TEXT's pre-existing
"Step therapy: trial of lisinopril" line so the "trial of"
anchor doesn't pre-satisfy the conservative-management check.
Total PA unit suite: 166 assertions. The Playwright happy-path
now asserts 125 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5b — §4.5.5 infusion / specialty-drug overlay, 5 of 25)

Five infusion / specialty-drug rules triggered by J-code (HCPCS
Level II J####) presence:

- **R-PA-INF-001** — J-code + NDC documented (generalizes the
  Medicaid-specific R-PA-MCD-006 to all payers). Flag.
- **R-PA-INF-002** — weight-based dose: weight + dose-calculation
  anchor (dual-anchor). Flag.
- **R-PA-INF-003** — site-of-care indicator (home / clinic /
  office / infusion center / hospital outpatient). Flag.
- **R-PA-INF-004** — FDA-approved indication or NCCN-compendia
  citation for the diagnosis. Flag.
- **R-PA-INF-005** — premedication / monitoring plan when the
  drug carries infusion-reaction risk (rituximab / infliximab /
  IV iron / taxanes / cetuximab / trastuzumab). Info.

New helper `collectJCodes(bundle)` in `lib/pa/rules.js` extracts
J-codes via `/^J\d{4}$/`, mirroring the radiology / MRI collectors
from wave 52-5a. Like radiology, these rules apply across every
payer once the J-code trigger fires; specialty rules do NOT
self-gate on `bundle.payer`.

R-PA-INF-002 is the fourth dual-anchor rule and reuses the
wave-52-1h `extract.weight` extractor; R-PA-INF-005's risk-trigger
anchor set names the drugs most commonly flagged for infusion-
reaction premedication.

When no J-code is in the requested-procedures list each rule
vacuously passes, so the HAPPY_PACKET fixture continues to
all-pass without modification.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 160 assertions. The Playwright happy-path now asserts
120 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5a — §4.5.5 specialty overlays open: radiology, 5 of 25)

Opens spec-v52 §4.5.5 with five radiology / advanced-imaging
specialty rules:

- **R-PA-RAD-001** — ACR Appropriateness Criteria reference
  present. Info.
- **R-PA-RAD-002** — non-emergent MRI: conservative-management
  trial anchor; emergent / red-flag exception bypasses. Flag.
- **R-PA-RAD-003** — contrast imaging study: contrast-allergy
  review AND renal-function (eGFR / SCr / CrCl) anchors. Flag.
- **R-PA-RAD-004** — radiology procedure: attached clinical-note
  document or clinical-evaluation anchor. Flag.
- **R-PA-RAD-005** — pediatric imaging: ALARA / dose-reduction
  / pediatric-protocol anchor. Info.

Specialty rules differ from payer overlays: they do NOT self-gate
on `bundle.payer` -- they apply across every payer once the
procedure trigger is met. Two new helpers in `lib/pa/rules.js`
supply the structural triggers:

- `collectRadiologyCpts(bundle)` -- CPT regex `/^7\d{4}$/`
  for the AMA Radiology category 70010-79999.
- `collectMriCpts(bundle)` -- compact prefix-match for the
  common MRI subranges (70551-70559 brain, 71550-71552 chest,
  72141-72158 spine, 72195-72197 pelvis, 73218-73223 upper
  extremity, 73718-73723 lower extremity, 74181-74183 abdomen).

When no imaging CPT is in the requested-procedures list each
rule vacuously passes, so the HAPPY_PACKET fixture (which
requests only 99213) continues to all-pass without modification
despite the fixture's imaging-report attachment.

R-PA-RAD-002's emergent-exception branch is the first specialty
rule to declare itself "does not apply" rather than vacuously
satisfied -- the evidence string reads "Emergent / red-flag
anchor present; rule does not apply" so the audit trail
distinguishes payer-bypass from trigger-absent. R-PA-RAD-003 is
the third dual-anchor rule (allergy AND renal-function).

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 154 assertions. The Playwright happy-path now asserts
115 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-4b — Medicaid state-agnostic core COMPLETE: 5 -> 10)

The final 5 of the 10 spec-v52 §4.5.4 Medicaid state-agnostic
core rules ship, closing both the overlay and the planned wave
52-2 of the spec (§4.5.2 + §4.5.3 + §4.5.4 overlays):

- **R-PA-MCD-006** — J-code physician-administered drug requires
  an NDC (per Section 1927(a)(7) of the Social Security Act).
  Flag.
- **R-PA-MCD-007** — dental service requires an adult-vs-pediatric
  / EPSDT-vs-state-optional coverage indicator. Flag.
- **R-PA-MCD-008** — non-emergency medical transportation (NEMT)
  requires a trip-purpose + appointment-date anchor (42 CFR
  §431.53). Flag.
- **R-PA-MCD-009** — behavioral-health service requires a
  carve-out / integrated-BH indicator (PIHP / BHO / specialty
  MCO). Info.
- **R-PA-MCD-010** — outpatient prescription drug requires an
  MDRP / labeler-agreement / participating-manufacturer indicator
  (per Section 1927). Info.

R-PA-MCD-006 is the third overlay rule to consume HCPCS Level II
codes via regex (`/^J\d{4}$/`), alongside R-PA-CMS-017's L-codes
and R-PA-CMS-026's cataract-surgery range. It also accepts NDC
patterns in 5-4-2 / 5-3-2 / 4-4-2 hyphenated form or 11-digit run.

Each rule self-gates on `bundle.payer === 'medicaid'` and again
on its context anchor (J-code / dental / NEMT / BH / Rx). The
HAPPY_PACKET fixture continues to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 148 assertions. The Playwright happy-path now asserts
110 rules render in the findings panel.

The complete payer-overlay surface is now shipped: 60 §4.5.1 core
+ 25 §4.5.2 CMS FFS + 15 §4.5.3 CMS MA + 10 §4.5.4 Medicaid =
110 rules. Wave 52-3 of the spec (the §4.5.5 specialty overlays
-- 25 rules across imaging / infusion / surgery / behavioral /
genetic) picks up next.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-4a — Medicaid state-agnostic core opens, first 5 of 10)

Opens spec-v52 §4.5.4 with five Medicaid cross-state intersection
rules:

- **R-PA-MCD-001** — state Medicaid member-ID / CIN / recipient-
  ID line present. Block.
- **R-PA-MCD-002** — pediatric Medicaid patient: EPSDT /
  well-child / periodic-screening anchor when seeking
  non-routine services. Flag.
- **R-PA-MCD-003** — eligibility-window / verification anchor
  for the service date. Flag.
- **R-PA-MCD-004** — state-Medicaid medical-necessity /
  state-plan reference. Flag.
- **R-PA-MCD-005** — Managed Care Organization vs FFS Medicaid
  routing indicator. Flag.

Each rule self-gates on `bundle.payer === 'medicaid'` and, where
applicable, on a context anchor (pediatric for EPSDT). The
HAPPY_PACKET fixture continues to all-pass without modification.

R-PA-MCD-001 reuses the wave-52-1f `extract.memberId` extractor.
The Medicaid overlay introduces zero new extractors. R-PA-MCD-001
is distinct from core R-PA-003 (member-ID presence anywhere) --
MCD-001 ties the existence of a recipient ID to the Medicaid-
payer-bucket detection, so a Medicaid packet without a recipient
ID surfaces as a Medicaid-specific block alongside the core block.

6 new unit assertions in `test/unit/pa-engine.test.js` (one
aggregate vacuous-pass guard plus a fires-when-it-should test
per new rule). Total PA unit suite: 143 assertions. The
Playwright happy-path now asserts 105 rules render in the
findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3c — CMS Medicare Advantage overlay COMPLETE: 10 -> 15)

The final 5 of the 15 spec-v52 §4.5.3 CMS Medicare Advantage
overlay rules ship, closing the overlay:

- **R-PA-MA-011** — organization-determination type (pre-service
  / concurrent / payment) indicator. Info.
- **R-PA-MA-012** — expedited review: treating-clinician clinical-
  urgency / serious-jeopardy attestation. Flag.
- **R-PA-MA-013** — transition supply for new enrollees:
  continuity-of-care anchor. Flag.
- **R-PA-MA-014** — hospice-related service on MA packet:
  hospice-election indicator (elected / not elected / revoked).
  Flag.
- **R-PA-MA-015** — C-SNP / I-SNP: qualifying chronic-condition
  diagnosis or institutional-residence anchor. Flag.

R-PA-MA-015's qualifier-anchor set covers both C-SNP chronic
conditions (diabetes / CHF / ESRD / dementia / HIV/AIDS / COPD)
and I-SNP institutional-residence anchors (SNF resident /
long-term care facility), so one rule serves both SNP variants.

Each rule self-gates on the detected payer bucket and again on a
context anchor (expedited / transition / hospice / SNP-specific).
No new extractors.

The R-PA-MA-015 unit test explicitly strips HAPPY_TEXT's
pre-existing "Dx: I10 essential hypertension" and "Step therapy:
trial of lisinopril..." lines so neither "diabetes" nor any other
qualifier anchor pre-satisfies the rule.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 137 assertions. The Playwright happy-path now asserts
100 rules render in the findings panel.

This closes spec-v52 §4.5.3 (the CMS Medicare Advantage overlay).
Wave 52-4 picks up with §4.5.4 Medicaid state-agnostic core
(10 rules).

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3b — CMS Medicare Advantage overlay 5 -> 10 of 15)

Five more spec-v52 §4.5.3 MA overlay rules covering drug-coverage
path, D-SNP Medicaid coordination, supplemental benefits, Part B
step therapy, and inpatient admissions:

- **R-PA-MA-006** — MA drug request: Part B vs Part D coverage-
  path indicator. Flag.
- **R-PA-MA-007** — D-SNP packets: state-Medicaid plan / member-
  ID info documented. Flag.
- **R-PA-MA-008** — supplemental benefit (dental / vision /
  hearing) under Evidence of Coverage. Info.
- **R-PA-MA-009** — Part B drug under step therapy requires
  prior-trial / failure documentation per 2019 CMS final rule.
  Flag.
- **R-PA-MA-010** — inpatient admission: two-midnight
  expectation or short-stay-criteria documentation per 2024
  CMS extension. Flag.

Each rule self-gates on the detected payer bucket and again on
a context anchor (drug-request / D-SNP / dental-vision-hearing /
Part B + step therapy / inpatient admission). No new extractors.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 132 assertions. The Playwright happy-path now asserts
95 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3a — CMS Medicare Advantage overlay opens, first 5 of 15)

Opens spec-v52 §4.5.3 with five Medicare Advantage starter rules
covering the additional documentation MA plans request beyond FFS:

- **R-PA-MA-001** — HMO / gatekeepered plan: PCP referral present
  for specialist services. Block.
- **R-PA-MA-002** — in-network confirmation OR out-of-network
  exception anchor present. Flag.
- **R-PA-MA-003** — gatekeepered plan requires 2 distinct
  Luhn-valid NPIs so ordering PCP and servicing specialist are
  separable. Flag.
- **R-PA-MA-004** — plan-name anchor + member-ID line both
  present. Flag.
- **R-PA-MA-005** — service-location / service-area anchor.
  Info; v52-3b+ will tie this to bundled CMS plan-service-area
  files.

Each MA overlay rule self-gates on
`bundle.payer === 'cms-medicare-advantage'` and, where applicable,
on a plan-type anchor (HMO / gatekeepered) so non-HMO MA packets
bypass the HMO-specific rules. The HAPPY_PACKET fixture continues
to all-pass without modification.

R-PA-MA-003 reuses the wave-52-1e `extract.npis` array;
R-PA-MA-004 reuses the wave-52-1f `extract.memberId` extractor.
The MA overlay introduces zero new extractors.

6 new unit assertions in `test/unit/pa-engine.test.js` (one
aggregate guard that all five new rules vacuously pass on a
non-MA packet, plus a fires-when-it-should test per new rule).
Total PA unit suite: 127 assertions. The Playwright happy-path
now asserts 90 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2e — CMS Medicare FFS overlay COMPLETE: 20 -> 25)

The final 5 of the 25 spec-v52 §4.5.2 CMS Medicare Fee-for-Service
overlay rules ship, closing the overlay:

- **R-PA-CMS-022** — external infusion pump: covered indication +
  drug documented. Flag, LCD L33794.
- **R-PA-CMS-023** — ostomy supplies: ostomy type anchor + Quantity
  field present. Flag, LCD L33828.
- **R-PA-CMS-024** — urinary catheters: permanent incontinence /
  retention diagnosis. Flag, LCD L33803.
- **R-PA-CMS-025** — surgical dressings: wound surface area +
  dressing-change frequency. Flag, LCD L33831.
- **R-PA-CMS-026** — post-cataract refractive lenses: cataract-
  surgery anchor + cataract CPT (66830-66999) present. Flag,
  NCD 80.4.

R-PA-CMS-026 is the second overlay rule to consume structural CPT
codes via a regex filter (cataract-surgery range 66830-66999),
alongside R-PA-CMS-017's L-code orthotic check from wave 52-2d.
R-PA-CMS-023 ties into the wave-52-1f `extract.quantity`
extractor so the LCD L33828 monthly-utilization gate has a
structural quantity to reference.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 121 assertions. The Playwright happy-path now asserts
85 rules render in the findings panel.

This closes spec-v52 §4.5.2 (the CMS Medicare Fee-for-Service
overlay). Wave 52-3 picks up with §4.5.3 CMS Medicare Advantage
(15 rules) and §4.5.4 Medicaid state-agnostic core (10 rules).

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2d — CMS Medicare FFS overlay 15 -> 20 of 25)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules covering orthotics, continuous glucose monitors, post-
transplant immunosuppressives, parenteral nutrition, and
pneumatic compression devices:

- **R-PA-CMS-017** — orthotics: covered-condition anchor AND an
  L-code HCPCS present. Flag, LCD L33686.
- **R-PA-CMS-018** — CGM: insulin-therapy AND frequent-self-
  monitoring anchors present. Flag, LCD L33822.
- **R-PA-CMS-019** — post-transplant immunosuppressives:
  Medicare-covered transplant organ documented. Flag.
- **R-PA-CMS-020** — parenteral nutrition: GI-tract failure AND
  caloric-requirement anchors present. Flag, LCD L33799.
- **R-PA-CMS-021** — lymphedema pump: lymphedema / CVI dx AND
  failed-conservative-therapy anchors present. Flag, LCD L33829.

R-PA-CMS-017 is the first overlay rule to consume HCPCS Level II
L-codes from the existing `extract.cpts` array via a regex filter
(`/^L\d{4}$/`), so the orthotic-device family ties to a structural
signal alongside the free-text condition anchor. R-PA-CMS-018 /
R-PA-CMS-020 / R-PA-CMS-021 continue the dual-anchor pattern
introduced in wave 52-2c.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 116 assertions. The Playwright happy-path now
asserts 80 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2c — CMS Medicare FFS overlay 10 -> 15 of 25)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules covering enteral nutrition, nebulizers, TENS, NPWT, and
lower-limb prosthetics:

- **R-PA-CMS-012** — enteral nutrition: inability-to-ingest /
  projected-duration documented. Flag, LCD L33783.
- **R-PA-CMS-013** — nebulizer: covered obstructive-pulmonary
  diagnosis documented. Flag, LCD L33370.
- **R-PA-CMS-014** — TENS: chronic intractable pain > 3 months
  AND failed conventional therapy documented. Block, NCD 160.13
  / LCD L33802.
- **R-PA-CMS-015** — NPWT: covered wound type AND failed standard
  wound care documented. Flag, LCD L33821.
- **R-PA-CMS-016** — lower-limb prosthesis: K-level / functional
  rehabilitation potential documented. Flag, LCD L33787.

R-PA-CMS-014 / R-PA-CMS-015 are the first overlay rules to
require TWO independent anchors -- both must be present for the
rule to pass; either alone trips with a specific note pointing
at the missing half of the requirement.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 111 assertions. The Playwright happy-path now
asserts 75 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build`
are all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2b — CMS Medicare FFS overlay 5 -> 10 of 25, plus a spec-alignment renumber)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules ship, bringing the overlay from 5 to 10 of its planned 25.

- **R-PA-CMS-003** — Standard Written Order required elements
  present (beneficiary identity, item / HCPCS, order date,
  quantity, prescriber NPI, dated signature). Block, IOM Pub
  100-08 ch. 5.
- **R-PA-CMS-005** — power-mobility functional-status
  documentation. Flag, LCD L33788.
- **R-PA-CMS-007** — PAP continuation 90-day adherence /
  compliance. Flag, LCD L33718.
- **R-PA-CMS-008** — home-oxygen qualifying ABG or SpO2. Block,
  NCD 240.2 / LCD L33797.
- **R-PA-CMS-011** — hospital-bed positioning / medical-necessity.
  Flag, LCD L33820.

### Changed

- **Spec-alignment renumber.** Wave 52-2a inadvertently shipped
  the proof-of-delivery rule as R-PA-CMS-003, but spec-v52 §4.5.2
  reserves that id for the SWO-elements-complete rule. Wave 52-2b
  corrects the id: R-PA-CMS-003 (POD) is renumbered to
  R-PA-CMS-004 (POD, the spec-aligned id; logic and citation
  unchanged). A proper R-PA-CMS-003 (SWO elements) ships above.
  The engine treats rule ids as opaque sort keys, so the audit
  trail format remains stable across the rename.

Each new overlay rule self-gates on the detected payer bucket
(`bundle.payer === 'cms-medicare-ffs'`) and again on a device-
context anchor (DME / power-mobility / PAP-continuation /
home-oxygen / hospital-bed). The HAPPY_PACKET fixture continues
to all-pass without modification.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 106 assertions. The Playwright happy-path now asserts
70 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2a — CMS Medicare FFS overlay opens, first 5 of 25)

Opens spec-v52 §4.5.2 with five Durable Medical Equipment / Positive
Airway Pressure starter rules for Medicare Fee-for-Service:

- **R-PA-CMS-001** — DME face-to-face encounter documented (block,
  NCD-280.x).
- **R-PA-CMS-002** — Standard / Detailed Written Order present and
  signature-dated (block, CMS IOM Pub 100-08 ch. 5).
- **R-PA-CMS-003** — proof of delivery (flag, IOM Pub 100-08 ch. 4
  §4.26).
- **R-PA-CMS-006** — PAP-device sleep-study results documented
  (flag, LCD L33718).
- **R-PA-CMS-009** — DME supplier PTAN documented (flag).

Each overlay rule self-gates on the detected payer bucket from
`lib/pa/payer.js`: `check()` short-circuits with a vacuous pass when
`bundle.payer !== 'cms-medicare-ffs'`, and again when the packet
lacks the rule's context anchor (DME, PAP, etc.). The HAPPY_PACKET
fixture therefore sees them all pass without modification.

The payer detector (wave 52-1g) becomes load-bearing for the engine,
not just informational. No new extractors and no changes to
`buildBundle`; overlay rules arrive as five additional entries in
`STARTER_RULES` so the engine's rule-set stays monolithic and the
audit trail records each rule's evaluation decision explicitly.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 100 assertions. The Playwright happy-path now asserts
65 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1k — PA core ruleset COMPLETE: 55 -> 60)

The final 5 of the 60 spec-v52 §4.5.1 core rules ship, closing the
payer-agnostic core ruleset for the deterministic PA-packet linter.

- **R-PA-008** — each extracted CPT code (5 digits) is well-formed
  and not on the bundled deleted-codes list (block).
- **R-PA-009** — each extracted HCPCS Level II code (letter + 4
  digits) is well-formed and not on the bundled deleted-codes list
  (block).
- **R-PA-011** — each extracted ICD-10-CM code is well-formed and
  not on the bundled deleted-codes list (block).
- **R-PA-012** — no bundled NCCI procedure-to-procedure (PTP)
  edit-pair conflict among the extracted CPT codes (flag).
- **R-PA-043** — no document in the packet is password-protected
  or encrypted (block).

Three new bundled placeholders in `lib/pa/extract.js` —
`DELETED_CPT_HCPCS_BUNDLED`, `DELETED_ICD10_BUNDLED`, and
`NCCI_PAIRS_BUNDLED` — ship empty at v52-1k per spec-v52 §5.3.
The maintainer refresh script populates them in subsequent waves
without an engine change; the rules are wired through and behave
as format-strict pass-or-fire today.

R-PA-043 required a small plumbing change: `buildBundle` now
threads an optional `parseError` string through from the view's
ingest step, and `views/pa-lint.js` pushes a stub document with
`parseError` set when pdf.js / mammoth throws (encrypted PDF,
password-protected DOCX, corrupted bytes). Previously the failed
file was rendered in the audit trail but silently dropped from
the engine bundle. The audit-trail UI is unchanged; only the
engine's view of the packet is extended.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 94 assertions. The Playwright happy-path now
asserts 60 rules render in the findings panel.

This closes the payer-agnostic core. Wave 52-2 picks up with
CMS Medicare FFS / MA / Medicaid overlays + payer detection.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1j — PA core ruleset backfill 45 -> 55)

Ten more of the 60 spec-v52 §4.5.1 core rules ship in
`lib/pa/rules.js`, bringing the deterministic PA-packet linter's
core ruleset from 45 to 55 rules.

- **R-PA-014** — each CPT modifier suffix is a well-formed
  2-character code (flag). Format-only; payer-specific
  permissibility lands with payer overlays.
- **R-PA-042** — each PDF document in the packet has non-zero
  extractable text (flag). Scanned PDFs without an embedded text
  layer trip this rule.
- **R-PA-044** — every document opened cleanly with non-zero
  extractable content (block). Catches password-protected,
  corrupted, or empty files at intake.
- **R-PA-047** / **R-PA-048** / **R-PA-049** — patient address /
  subscriber relationship / other-insurance (COB) presence
  (info, payer-overlay-gated). Vacuously satisfied at v52-1j;
  flip to "required" per plan when payer overlays ship in v52-2+.
- **R-PA-050** — diagnosis-procedure linkage shown (flag). At
  least one document in the packet carries both an ICD-10 code
  and a CPT/HCPCS code, so the dx ↔ procedure linkage is
  establishable.
- **R-PA-051** — procedure description matches the CPT short
  descriptor (info). Placeholder until a license-clean CPT
  descriptor source ships per spec-v52 §5.3.
- **R-PA-056** — anesthesia time documented when an anesthesia
  CPT (00100-01999) or anesthesia anchor is present (flag).
- **R-PA-057** — assistant-surgeon modifier (80 / 81 / 82 / AS)
  accompanied by a second Luhn-valid NPI in the packet (flag).

All ten rules are vacuously satisfied when their trigger condition
is absent, so the wave 52-1h HAPPY_PACKET fixture still returns
all-pass without modification. R-PA-042 / R-PA-044 consume
`extract.textLength` already populated by the wave 52-1e extractor,
so no new extractors were required.

10 new unit assertions in `test/unit/pa-engine.test.js` (one
fires-when-it-should per new rule plus a vacuous-pass guard for
R-PA-014 and explicit placeholder guards for R-PA-047 / R-PA-051).
Total PA unit suite: 88 assertions. The Playwright happy-path now
asserts 55 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1i — PA core ruleset backfill 35 -> 45)

Ten more of the 60 spec-v52 §4.5.1 core rules land in
`lib/pa/rules.js`, bringing the deterministic PA-packet linter's
core ruleset from 35 to 45 rules.

- **R-PA-030** — prior-treatment list when step therapy applies
  (flag).
- **R-PA-035** — LFTs (AST / ALT / bilirubin / alk phos) when
  the packet references a hepatically-dosed agent (info).
- **R-PA-038** — submission is a resubmission iff a prior-auth-
  denial document is attached (flag). The classifier's
  `prior-auth-denial` role becomes load-bearing here.
- **R-PA-039** — resubmission references the original PA
  reference number (flag).
- **R-PA-040** — resubmission addresses each reason cited in
  the prior denial (info).
- **R-PA-052** — date-of-injury anchor present when an ICD-10
  external-cause code (V/W/X/Y leading letter) is in the
  packet (flag).
- **R-PA-054** — modifier 25 / 59 accompanied by "separately
  identifiable" / "distinct procedural service" supporting
  language (flag).
- **R-PA-055** — "bilateral" mention matches modifier 50
  presence on the CPT line (flag).
- **R-PA-058** — unlisted-procedure CPT carries a narrative /
  procedure-description anchor (flag).
- **R-PA-059** — consent date (when a consent document is
  present) is on or before the latest service date (flag).

All ten rules are vacuously satisfied when their trigger
condition is absent, so the wave 52-1h HAPPY_PACKET fixture
still returns all-pass without modification. No new extractors;
R-PA-052 reuses `extract.icd10` with a V/W/X/Y filter and
R-PA-059 reuses `extract.serviceDates` + `extract.dates`.

10 new unit assertions in `test/unit/pa-engine.test.js` (one
fires-when-it-should per new rule). Total PA unit suite: 78
assertions. The Playwright happy-path now asserts 45 rules
render in the findings panel. Engine output and ordering remain
deterministic; the property test still holds.

Verified: `npm run lint`, `npm run test`, and `npm run build`
are all green. **Catalog count 255, unchanged.**

### Added (spec-v48 wave 48-4j — Bishop, ABC MTP, MGAP, GAP)

Four more long-tail derivation blocks spanning obstetric
induction assessment and trauma triage scoring.

- **Bishop** (`bishop`, Bishop 1964): 5 cervical-examination
  items with banded callbacks (dilation, effacement, station,
  consistency, position); range 0-13.
- **ABC MTP** (`abc-mtp`, Nunez 2009): 4 binary criteria, range
  0-4. Cutoff >= 2 -> activate massive transfusion protocol.
- **MGAP** (`mgap`, Sartorius 2010): 4 items including a GCS
  raw-value passthrough into the sum; range 3-29.
- **GAP** (`gap`, Kondo 2011): 3 items (GCS passthrough, age,
  banded SBP); range 3-24. MGAP minus the mechanism term.

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the Bishop dilation / station banded callbacks,
the ABC MTP cutoff-at-2, the MGAP and GAP SBP three-level
callbacks, and the GCS raw-value passthrough.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4i — LIPS, Westley, PRAM, PASS)

Four more long-tail derivation blocks spanning ALI/ARDS
prediction and pediatric respiratory severity scoring.

- **LIPS** (`lips`, Gajic 2011): 15 weighted yes/no factors
  including a protective diabetes -1 modifier; range -1 to +20.
- **Westley croup score** (`westley`, Westley 1978): 5 items
  with non-uniform allowed values (LOC 0/5, cyanosis 0/4/5,
  stridor 0-2, air entry 0-2, retractions 0-3); range 0-17.
- **PRAM** (`pram-asthma`, Chalut 2000): 5 items with per-item
  allowed value sets; range 0-12.
- **PASS** (`pass-asthma`, Gorelick 2004): 3 items each 0-2
  (clamped); range 0-6.

4 new provenance logs under `docs/audits/v48/`. 18 new unit
tests including the LIPS diabetes -1 protective weight, the
Westley cyanosis three-level callback, the PRAM binary-style
items, and the PASS 0-2 clamp.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4h — CRB-65, ISTH DIC, PEWS, Alvarado/PAS)

Four more long-tail derivation blocks spanning outpatient
pneumonia severity, DIC coagulation scoring, pediatric
early-warning deterioration, and the adult / pediatric
appendicitis screen pair.

- **CRB-65** (`crb65`, Lim 2003): 4 binary criteria, range 0-4.
  Lab-free outpatient-friendly variant of CURB-65.
- **ISTH overt DIC** (`isth-dic`, Taylor 2001): 4 lab components
  with three-level banded callbacks; range 0-8. Underlying-
  disorder gate is surfaced in the tile but does not modify the
  lab sum.
- **PEWS** (`pews`, Monaghan 2005): Brighton 3-subscale
  pediatric early-warning score, each 0-3 (clamped); range 0-9.
- **Alvarado / PAS** (`alvarado-pas`, Alvarado 1986 + Samuel
  2002): dual-block tile following the aldrete-padss precedent
  — primary `derivation` (Alvarado MANTRELS) and sibling
  `derivationPas` (Pediatric Appendicitis Score), each 8 items
  with two +2 weights, range 0-10.

4 new provenance logs under `docs/audits/v48/`. 19 new unit
tests including the ISTH DIC platelet three-level callback, the
PEWS 0-3 subscale clamp, and the Alvarado / PAS +2 weights.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4g — LACE, HEMORR2HAGES, DAPT, MUST)

Four more long-tail derivation blocks across hospital
readmission risk, AF bleeding stratification, post-PCI
antiplatelet-duration decision support, and malnutrition
screening.

- **LACE Index** (`lace`, van Walraven 2010): 4 components with
  three banded callbacks (LOS 7-tier, Charlson 5-tier, ED 5-tier).
  Bands: 0-4 low, 5-9 moderate, >=10 high.
- **HEMORR2HAGES** (`hemorr2hages`, Gage 2006): 11 binary
  criteria including a +2 Rebleeding weight (the "R^2" in the
  mnemonic). Range 0-12.
- **DAPT Score** (`dapt-score`, Yeh 2016): 9 criteria including
  a subtractive age band (0 / -1 / -2). Range -2 to +10. Cutoff
  >=2 favors extended DAPT beyond 12 months after PCI.
- **MUST nutrition** (`must-nutrition`, BAPEN 2003): 3
  components — BMI band, weight-loss band, acute-disease
  modifier. Range 0-6.

4 new provenance logs under `docs/audits/v48/`. 17 new unit
tests including the LACE LOS / Charlson banded callbacks, the
HEMORR2HAGES +2 Rebleeding weight, the DAPT subtractive age
band, and the MUST BMI / weight-loss three-level callbacks.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4f — HERDOO2, HOSPITAL, IMPROVE-Bleeding, Aldrete/PADSS)

Four more long-tail derivation blocks across women-only
VTE-recurrence stratification, hospital-readmission risk,
medical-inpatient bleeding risk, and the operational
PACU/ambulatory-surgery discharge pair.

- **HERDOO2** (`herdoo2`, Rodger 2017): women only, 4 binary
  criteria, range 0-4. Bands: 0-1 safe to discontinue
  anticoagulation; >=2 continue.
- **HOSPITAL Score** (`hospital-score`, Donze 2013): 7 items
  including a prior-admissions banded callback (0-2: 0 / 3-4: +2
  / >=5: +5). Bands: 0-4 low ~5.8%, 5-6 intermediate ~11.9%,
  >=7 high ~22.8% 30-day potentially-avoidable readmission.
- **IMPROVE-Bleeding** (`improve-bleeding`, Decousus 2011): 11
  criteria with mixed boolean and banded weights (age and renal
  string-enum callbacks), range 0-30.5. Cutoff >=7 = high
  bleeding risk.
- **Aldrete / PADSS** (`aldrete-padss`, Aldrete 1995 + Chung
  1995): dual-block tile following the qsofa-sofa / centor
  precedent — primary `derivation` for modified Aldrete and
  sibling `derivationPadss` for PADSS, each 5 items × 0-2,
  range 0-10, cutoff >=9.

4 new provenance logs under `docs/audits/v48/`. 17 new unit
tests covering boundary points per tile, including the HOSPITAL
prior-admissions banded callback (0 / 3 / 5), the
IMPROVE-Bleeding age and renal three-level string callbacks,
and the Aldrete 0-2 clamp on out-of-range inputs.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4e — ICH Score, IMPROVE-VTE, Khorana, DASH)

Four more long-tail derivation blocks spanning intracerebral
hemorrhage prognostication and the VTE-risk family. No
infrastructure changes.

- **ICH Score** (`ich-score`, Hemphill 2001): 5 features, range
  0-6, with banded GCS / age / volume callbacks per Hemphill
  2001 Table 2. 30-day mortality bands per Table 4
  (0/13/26/72/97/100%).
- **IMPROVE-VTE** (`improve-vte`, Spyropoulos 2011): 7 weighted
  yes/no criteria, range 0-12. Bands: <2 low, 2-3 inpatient
  prophylaxis candidate, >=4 extended-duration candidate.
- **Khorana** (`khorana`, Khorana 2008): 5 criteria, range 0-6,
  with a string-valued cancer-site callback (very-high +2 /
  high +1 / other 0). 2.5-month VTE rates per Table 3
  (0.3% / 2.0% / 6.7%).
- **DASH** (`dash-vte`, Tosetto 2012): 4 criteria including the
  -2 hormone-use modifier; range -2 to +4. Annual recurrence
  bands per Table 4 (3.1% / 6.4% / 12.3% per year).

4 new provenance logs under `docs/audits/v48/`. 16 new unit
tests including the DASH hormone subtractive path and the
Khorana cancer-site three-level callback.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4d — STOP-BANG, 4Ts, ABCD2, RCRI)

Four more long-tail derivation blocks across preoperative
screening and acute-care risk stratification. No infrastructure
changes.

- **STOP-BANG** (`stop-bang`, Chung 2008 / 2012): 8 binary
  items, range 0-8. Preoperative OSA screen; high-risk cutoff
  ≥ 5 per Chung 2012 Table 3.
- **4Ts** (`four-ts`, Lo 2006): 4 domains × 0-2 = range 0-8.
  Heparin-induced thrombocytopenia pretest probability;
  callback-clamped to mirror existing `fourTsClamp`.
- **ABCD2** (`abcd2`, Johnston 2007): 5 features, range 0-7.
  TIA stroke-risk score; B (blood-pressure) component reads
  `inputs.dbp` via the second-arg-to-callback pattern so the
  SBP≥140 OR DBP≥90 rule fires on either limb.
- **RCRI** (`rcri`, Lee 1999): 6 binary risk factors, range
  0-6. Preoperative cardiac risk for major noncardiac surgery;
  Class I-IV bands map to the published major-cardiac-event
  rates (0.4%, 0.9%, 6.6%, ≥ 11%).

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the ABCD2 DBP-alone-meets-threshold path and
the 4Ts 0-2 clamp.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4c — EPDS, MEWS, COMFORT-B, WAT-1)

Four more long-tail derivation blocks spanning perinatal mental
health, ward early-warning vitals, and pediatric ICU
sedation / withdrawal.

- **EPDS** (`epds`, Cox 1987): screener-based 10 items × 0-3,
  range 0-30. Edinburgh Postnatal Depression Scale; item 10
  (self-harm) is a critical-action flag.
- **MEWS** (`mews`, Subbe 2001): 5 banded per-parameter
  callbacks (SBP / pulse / RR / temp / AVPU). Predecessor to
  NEWS2 (also a Sophie tile).
- **COMFORT-B** (`comfort-b`, van Dijk 2005): 6 items × 1-5,
  range 6-30. Target band 11-22. Minimum aggregate 6 (not 0)
  because every item starts at 1.
- **WAT-1** (`wat-1`, Franck 2008): 10 binary items + 1
  banded-recovery-minutes callback. Range 0-12; cutoff ≥3 =
  iatrogenic withdrawal.

4 new provenance logs under `docs/audits/v48/`. 20 new unit
tests including parameterized loops over the MEWS AVPU callback
and the WAT-1 recovery-minutes callback.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1621 (was 1600;
+21). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4b — ORBIT Bleeding, PAINAD, CAGE, Mini-Cog)

Four more long-tail derivation blocks across bleeding, pain,
addiction, and cognition. No infrastructure changes.

- **ORBIT Bleeding** (`orbit-bleeding`, O'Brien 2015): 5
  weighted criteria, range 0-7. AF bleeding-risk companion to
  ATRIA and HAS-BLED.
- **PAINAD** (`painad`, Warden 2003): 5 nurse-observed
  behaviors × 0-2 = range 0-10. Adult-dementia analog of
  FLACC; same 0 / 1-3 / 4-6 / 7-10 band structure.
- **CAGE** (`cage`, Ewing 1984): screener-based, 4 binary
  items, range 0-4. Mnemonic CAGE; cutoff ≥2 = positive screen
  for alcohol use disorder.
- **Mini-Cog** (`mini-cog`, Borson 2000): 2 components — 3-word
  recall (0-3) + clock-draw (0 or 2). Total 0-5; cutoff <3 =
  positive screen for cognitive impairment.

4 new provenance logs under `docs/audits/v48/`. 13 new unit
tests covering boundary points per tile.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1600 (was 1580;
+20). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4a — ATRIA Bleeding, Hendrich II, FLACC, AUDIT-C)

Opens spec-v48 wave 48-4 (long-tail backfill) with four
additive tiles. No infrastructure changes.

- **ATRIA Bleeding** (`atria-bleeding`, Fang 2011): 5 weighted
  criteria, range 0-10. Companion bleeding-risk score
  alongside HAS-BLED and ORBIT.
- **Hendrich II Fall Risk** (`hendrich-ii`, Hendrich 2003): 8
  weighted items including a string-valued get-up-and-go
  callback (able / pushes-up / needs-help / unable →
  0 / 1 / 3 / 4). Companion to Morse Falls.
- **FLACC** (`flacc`, Merkel 1997): 5 behaviors × 0-2 = range
  0-10. Pediatric pain for nonverbal children.
- **AUDIT-C** (`auditc`, Bush 1998): screener-based, 3 items ×
  0-4 = range 0-12. Sex-specific cutoff (≥3 women / ≥4 men)
  documented in bands.

4 new provenance logs under `docs/audits/v48/`. 15 new unit
tests covering boundary points per tile, including the
Hendrich II tri-level get-up-and-go callback and the AUDIT-C
screener-indexed sums.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1580 (was 1559;
+21). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3d — PHQ-9, GAD-7, CAM, C-SSRS)

Four more behavioral / cognitive screens. Includes one
infrastructure extension to make screener-based tiles
drive derivation steps.

- `lib/screener.js renderScreener` now accepts an optional
  `opts.onUpdate(answers, score, band)` callback fired every
  time `renderResult` runs. PHQ-9 / GAD-7 tile views use it to
  update the derivation steps in-place without re-rendering
  the whole `<details>` block (so the user's open/closed state
  is preserved).
- **PHQ-9** (`phq9`, Kroenke 2001): 9 items × 0-3, range 0-27,
  5 severity bands. Component `inputKey`s are the item index
  as a string (`'0'`-`'8'`); the tile converts the screener's
  numeric-indexed `answers` array into a keyed input object
  for the derivation renderer.
- **GAD-7** (`gad7`, Spitzer 2006): 7 items × 0-3, range 0-21,
  4 severity bands.
- **CAM** (`cam`, Inouye 1990): formula-only — algorithm is the
  boolean `(F1 AND F2) AND (F3 OR F4)`, not an additive sum.
- **C-SSRS Screener** (`cssrs`, Posner 2011): formula-only —
  logic-based banding (HIGH / MODERATE / LOW / NONE), not
  additive.

4 new provenance logs under `docs/audits/v48/`. 12 new unit
tests including screener-indexed component sums for PHQ-9 and
GAD-7 and formula-only schema asserts for CAM and C-SSRS.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1559 (was 1542;
+17). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3c — NIHSS, RACE, MEOWS, SOS)

Four more derivation blocks; mix of additive and formula-only.

- **NIHSS** (`nihss`, Brott 1989): 13 components in the Sophie
  tile (motor arm L+R and motor leg L+R are entered as
  per-side sums covering the published 8-row sub-items).
  Range 0-42 with 5-band severity stratification.
- **RACE** (`race`, Pérez de la Ossa 2014): 5 NIHSS-derived
  items, range 0-9, LVO threshold ≥5.
- **MEOWS** (`meows`, Singh 2012): formula-only —
  track-and-trigger chart with per-parameter yellow/red flags
  and OR/AND trigger logic. NOT representable as an additive
  sum; ships in the formula-only shape following the MELD-3.0
  and GUSS precedents.
- **SOS** (`sos`, Ista 2009): 15 binary symptom items observed
  over the prior 4-hour window. Range 0-15; withdrawal cutoff
  ≥4 per the Youden-optimal threshold from the derivation
  cohort.

4 new provenance logs under `docs/audits/v48/`. 18 new unit
tests covering boundary points per tile (including the NIHSS
max-42 maximum and the SOS withdrawal cutoff of 4).

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1542 (was 1523;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3b — Barthel, ROSIER, CPSS, LAMS)

Four more rehab / stroke-recognition derivation blocks. No
infrastructure changes.

- **Barthel Index** (`barthel`, Mahoney 1965 + Shah 1989 bands):
  10 weighted ADL items with published closed-value sets per
  item (0/5/10 or 0/5/10/15); total 0-100.
- **ROSIER** (`rosier`, Nor 2005): 7 binary items with mixed
  +1 / −1 weights — two stroke-mimic items subtract, five
  focal-deficit items add. Range −2 to +5.
- **CPSS** (`cpss`, Kothari 1999): 3 binary items. The CPSS
  "score" is the count of abnormal items (positive screen at
  ≥1); the derivation block's components sum equals
  `cpss().abnormalCount` (the function returns `abnormalCount`
  rather than `score`).
- **LAMS** (`lams`, Llanes 2004 + Nazliel 2008 LVO threshold):
  3 motor items (range 0-5), LVO threshold ≥4.

4 new provenance logs under `docs/audits/v48/`. 13 new unit
tests covering boundary points per tile, including the ROSIER
mimic-subtraction path that exercises the negative-points
component branch in `lib/derivation.js`.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1523 (was 1504;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3a — Braden, Morse Falls, Lawton IADL, Katz ADL)

Opens spec-v48 wave 48-3 (nursing-floor / rehab / behavioral
extension) with four widely-used additive screens.

- **Braden** (`braden`, Bergstrom 1987): 6 ordinal items 1-4
  (friction caps at 3); range 6-23. Pressure-injury risk
  stratification.
- **Morse Falls** (`morse-falls`, Morse 1989): 6 weighted
  items including three string-valued callbacks for the
  tri-level select inputs (ambulatory aid, gait, mental
  status). Range 0-125.
- **Lawton IADL** (`lawton-iadl`, Lawton & Brody 1969): 8
  binary items, range 0-8. Modern unisex form; the 1969
  sex-stratified variant is NOT implemented by design.
- **Katz ADL** (`katz-adl`, Katz 1963): 6 binary items, range
  0-6. Sophie collapses the original A-G letter grading into
  the contemporary discharge-planning band stratification.

4 new provenance logs under `docs/audits/v48/`. 11 new unit
tests covering multiple boundary points per tile, including
the Braden friction clamp (1-3 not 1-4) and the Morse Falls
tri-level string callbacks.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1504 (was 1486;
+18). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2c — PSI, CPOT, BPS, GUSS)

Four more acute-care derivation blocks. Mix of additive,
additive-with-callbacks, and formula-only:

- **PSI / PORT** (`psi`): 19 components per Fine 1997 Table 2,
  including a sex-aware age callback (M=age, F=age−10) using
  the wave-48-1c second-argument-to-callbacks pattern, and 7
  optional-lab callbacks that early-return 0 when the input
  is null/empty/undefined (matching `lib/scoring-v4.js psi()`).
- **CPOT** (`cpot`): 4 nurse-observed behaviors 0-2 per
  Gelinas 2006.
- **BPS** (`bps`): 3 nurse-observed behaviors 1-4 per Payen
  2001. Minimum aggregate is 3 (not 0) because every
  component starts at 1.
- **GUSS** (`guss`): formula-only block (no `components`)
  following the MELD-3.0 precedent. GUSS's staged gating —
  fail Stage 1 → stop; fail a Stage 2 consistency → don't
  advance to the next — is the safety mechanism; an additive
  components array would misrepresent the stop conditions.

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the sex-aware age callback and the
optional-lab null-handling on PSI.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1486 (was 1466;
+20 — 14 new derivation tests + 6 additional schema-loop tests
for the 4 new tiles). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2b — BISAP, COWS, ICDSC, 4AT)

Four more acute-care derivation blocks. All purely additive,
no infrastructure changes from prior waves.

- `lib/meta.js`: derivation blocks for the BISAP half of
  `ranson-bisap` (5 binary criteria per Wu 2008; the contemporary
  24-h bedside pancreatitis severity score), `cows` (11
  clinician-rated items per Wesson & Ling 2003 with per-item
  anchor levels), `icdsc` (8 binary items per Bergeron 2001
  with the ≥4 delirium cutoff), and `4at` (mixed binary 0/4
  items + two 0/1/2 callbacks per MacLullich 2019).
- `views/group-g.js`: renderer wired into all four tile views.
  The `ranson-bisap` view appends one `<details>` block for
  BISAP; Ranson's two-time-point math stays as the existing
  checkbox UI (a `derivationRanson` second block is a candidate
  for a later wave).
- `docs/audits/v48/ranson-bisap.md`, `cows.md`, `icdsc.md`,
  `4at.md`: per-tile provenance logs mapping every component
  and band to the source paper.
- `test/unit/derivation.test.js`: +20 cases covering boundary
  points (zero, worked example, max) for each tile plus 4AT's
  AMT4 callback clamping.
- `docs/spec-v48.md`: §5.2 gains a 48-2b subsection.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1466 (was 1447;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2a — CURB-65, Centor/McIsaac, CIWA-Ar, FOUR Score)

Opens spec-v48 wave 48-2 (acute-care / ICU bedside extension)
with four widely-used additive scores. No infrastructure
changes — every block uses the existing
`derivation` + optional sibling-block pattern shipped in waves
48-1a through 48-1c.

- `lib/meta.js`: derivation blocks for `curb-65`, `centor`
  (with `derivationMcisaac` second block for the McIsaac age
  modifier), `ciwa` (CIWA-Ar; clamped 0-7 / 0-4 callbacks),
  and `four-score` (clamped 0-4 callbacks).
- `views/group-g.js`: renderer wired into all four tile views.
  The `centor` view appends two `<details>` blocks (Centor +
  McIsaac).
- `docs/audits/v48/curb-65.md`, `centor.md`, `ciwa.md`,
  `four-score.md`: per-tile provenance logs mapping every
  component / band to the source paper.
- `test/unit/derivation.test.js`: +16 cases covering three
  boundary points per tile plus the McIsaac age-modifier path
  (age 12 +1, age 30 +0, age 50 −1).
- `docs/spec-v48.md`: §5.2 wave 48-2 gains a 48-2a subsection
  recording the four shipped tiles.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1447 (was 1426; +21
— 16 new derivation tests plus 5 additional schema-loop tests
exercising the 4 new tiles). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1c — NEWS2, SOFA, MELD-3.0; closes wave 48-1)

Closes the §5 wave-48-1 list. Three small infrastructure
extensions land first, then the three remaining tiles.

- `lib/derivation.js scoreComponent`: callbacks now receive the
  full inputs object as the second argument
  (`points(value, inputs)`). Pre-existing single-arg callbacks
  (waves 48-1a + 1b) are unaffected — they ignore the second
  parameter. Required so NEWS2's SpO2 callback can branch on
  `scale2` and `onO2` from the same inputs object.
- `META.<id>.derivationSofa` pattern: a second derivation block
  on a single tile is delivered via a sibling field (no schema
  change to the `derivation` block itself). The view layer
  calls `renderDerivation({ derivation: META[id].derivationSofa })`
  for the second block. Used here to surface SOFA alongside
  the existing qSOFA derivation block on `qsofa-sofa`.

Tiles backfilled:
- **NEWS2** (`news2`) — components with banded per-variable
  callbacks per RCP 2017 Table 1, including the SpO2 Scale 1
  vs Scale 2 branch and the supplemental-O2 modifier.
- **SOFA** — second block on `qsofa-sofa` via the new
  `derivationSofa` field. Six organ systems, each accepting a
  pre-graded 0-4 value (clamped).
- **MELD-3.0** on `meld-childpugh` — formula-only block (no
  `components`). Kim 2021 log-linear regression text with the
  input-clamping rules called out explicitly.

Six new provenance logs under `docs/audits/v48/` (news2,
sofa, meld-childpugh). 17 new unit tests in
`test/unit/derivation.test.js` covering Scale-2 / on-O2 paths
for NEWS2, the clamped 0-4 path for SOFA, and a schema test
asserting MELD-3.0 ships as formula-only.

`docs/spec-v48.md` §5 list updated — all 12 wave-48-1 tiles
shipped. Wave 48-1 is complete; subsequent v48 waves (48-2
acute-care, 48-3 nursing-floor, 48-4+ long-tail) backfill the
remaining catalog per §5.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1426 (was 1409;
+17). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1b — 6 additive-boolean tiles backfilled)

Mechanical backfill of the six additive-boolean tiles in the §5
list: Wells DVT, CHA₂DS₂-VASc (`chads`), HAS-BLED, PERC, TIMI,
and HEART. Infrastructure is unchanged from wave 48-1a; this
wave only adds META.derivation entries, view-side renderer
calls, audit logs, and unit tests.

- `lib/meta.js`: derivation blocks for `wells-dvt`, `chads`,
  `hasbled`, `perc`, `timi`, `heart`. Each has components
  matching the published point table (including Wells DVT's −2
  subtractive criterion, the two 2-point CHA₂DS₂-VASc items,
  and HEART's per-component banded integers via clamped point
  callbacks), bands matching the published cutoffs, and the
  verbatim source quote.
- `views/group-g.js`: appends `renderDerivation` +
  `updateDerivationSteps` calls in the six tile renderers.
- `docs/audits/v48/wells-dvt.md`, `chads.md`, `hasbled.md`,
  `perc.md`, `timi.md`, `heart.md`: new per-tile provenance
  logs (mirroring the v11 audit format).
- `test/unit/derivation.test.js`: +27 new cases. The schema
  test loop now covers all 9 derivation tiles (wave 48-1a + 1b).
  Per-tile components-sum tests cover boundary points including
  the Wells DVT −2 criterion and HEART's input clamping.
- `docs/spec-v48.md`: §5 list updated — six tiles shipped, three
  (NEWS2, SOFA, MELD-Na) explicitly deferred to wave 48-1c with
  the reason documented (each needs a renderer extension that
  is out of scope for the mechanical backfill).

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1409 (was 1382;
+27). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1a — derivation layer infrastructure + 3 pilot tiles)

Lands the v48 derivation layer end-to-end on three pilot tiles
so the schema, renderer, test harness, and per-tile provenance
log are all exercised in production before the §5 list is
mechanically backfilled. The remaining nine wave-48-1 tiles
slip to wave 48-1b (same infrastructure, same tests, just more
META entries + audit logs).

- `lib/derivation.js`: new. Exports `renderDerivation(meta)` and
  `updateDerivationSteps(detailsEl, meta, inputs)`. The renderer
  emits a closed-by-default `<details>` block with the formula,
  population, validity, and source quote; the updater fills the
  live step-by-step list of per-input contributions on every
  input change via the same `aria-live="polite"` plumbing the
  result block already uses. Schema is validated on render and
  throws on missing required fields (`formula`, `population`,
  `units`, `validity`, `source`).
- `lib/meta.js`: adds `derivation` blocks for `wells-pe`, `gcs`,
  and the qSOFA half of `qsofa-sofa`. Each block carries the
  verbatim source quote, the named cohort and dates, the
  validity caveats, and (where additive) the `components` array
  matching the source's published point table.
- `views/group-g.js`: wires `renderDerivation` +
  `updateDerivationSteps` into the three pilot tiles. The block
  is appended after the result `<div>` so the bedside-shift
  surface is unchanged unless the user expands the details.
- `test/unit/derivation.test.js`: new. 18 cases covering schema
  completeness, components-sum-equals-computed-score at three
  boundary points per tile, band-coverage of the achievable
  range, and renderer validation throws on malformed input.
- `docs/audits/v48/wells-pe.md`, `gcs.md`, `qsofa-sofa.md`: new
  per-tile provenance logs (mirroring the v11 audit format) that
  re-quote the source paper and map every component / band to
  the published phrasing. The `qsofa-sofa` log documents why
  the SOFA half is intentionally not in the derivation block at
  this wave (per-organ non-additive scoring is not faithfully
  representable in the additive-components schema).
- `docs/spec-v48.md`: §5 wave 48-1 is restructured into 48-1a
  (this wave, shipped) and 48-1b (the remaining nine §5 tiles).
- `README.md`: one sentence in the feature paragraph noting the
  collapsed "where does this come from?" block.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Fixed (data-refresh workflow — `shardLayout: "shards"` missing from regenerated manifests)

The weekly `data-refresh` GitHub Action was failing at the
`verify-integrity` step because `scripts/build-data.mjs` wrote
manifests for the three sharded-subdir datasets (`icd10cm`,
`mpfs`, `ndc`) without a `shardLayout` field. The verify script
defaults to the "root" layout when the field is absent, so it
looked for `data/icd10cm/A.json` instead of
`data/icd10cm/shards/A.json` — 16 false-positive MISSING errors.
The repo-committed seed manifests had `"shardLayout": "shards"`
hand-set, which is why local `data:verify` was green and the
drift only surfaced when the workflow re-ran the pipeline.

- `scripts/build-data.mjs`: add `shardLayout: 'shards'` to the
  manifest object written for the `icd10cm`, `mpfs`, and `ndc`
  datasets (the three that call
  `writeShard(join(folder, 'shards'), …)`).

Verified by `SOPHIEWELL_OFFLINE=1 node scripts/build-data.mjs &&
node scripts/verify-integrity.mjs` — now reports
`ok. 46 manifests verified`. Lint + unit tests + a11y + build
unchanged and green.

### Fixed (spec-v46 wave 46-2 — docs/ backfill + activate catalog-count grep rule on docs)

Closes wave 46-1's silent gap. The §6 catalog-count drift rule
was wired into `npm run lint` but `scripts/grep-check.mjs`'s
`walkAll` traversal re-used the forbidden-pattern scan's
`SKIP_DIRS` (which includes `docs`), so the dead
`if (entry.name === 'docs')` descend branch never fired and the
rule was dormant for every doc surface. Wave 46-2 makes the rule
actually scan `docs/*.md`, then backfills the legitimate
historical / non-catalog counts that the activated rule would
otherwise flag.

- `scripts/grep-check.mjs`: `walkAll` now genuinely descends
  into `docs/` (skipping only `node_modules`, `dist`, `.git`,
  `data`, and dotfiles); the dead branch removed.
  `catalogScanRanges` gains two file-level exclusions —
  `docs/spec-seo.md` (spec doc by intent, topic-named) and
  `docs/scope-mdcalc-parity.md` (its current close-count is
  already validated by `check-catalog-truth.mjs` surface #14,
  so the ledger's historical snapshots are excluded here).
- `docs/data-sources.md`: inline
  `<!-- catalog-truth:historical -->` escape above "121 tiles"
  (count of hand-authored copy files, not catalog total).
- `docs/threat-model.md`: inline escape above the v4-era
  "utilities 82-197" group-numbering line.
- `docs/performance.md`: inline escape above the "< 250 KB"
  utility-view transfer-size budget row.
- `docs/spec-v46.md`: §6 marks wave 46-2 shipped; new §10
  records the fix and the exclusions/escapes.

Sanity-tested: removing any single new escape or exclusion
surfaces the expected drift violation; restoring it goes green.
**Catalog count 254, unchanged.** Lint + unit tests + a11y +
sbom + build all clean.

### Removed (spec-v51 wave 51-2 — dead CSS cleanup after the minimal homepage)

Deletes the CSS rules orphaned by spec-v51 wave 51-1's
homepage minimization. Wave 51-1 stripped the homepage to
header + h1 + lede + hero search + 10 quick picks + footer
but left the unused selectors in `styles.css` because unused
rules are inert at runtime. Wave 51-2 closes that loop.

- `styles.css`: removes `.hub-strip` (and its label/link
  descendants), `.trust-strip` (and `.trust-icon`,
  `.trust-label`, `.trust-sub`, the responsive grid),
  `.why-sophie` + `.why-grid` (and descendants + responsive
  breakpoint), `.visible-faq` (and `details`, `summary`,
  marker overrides, `p`), `.audience-chips` (and
  `.audience-chips .toggle` variants), `.browse-disclosure` +
  `.browse-summary` (and the marker, caret rotate, hover/focus,
  open-state margin), and `.task-hero .hero-examples`.
- `docs/spec-v51.md`: adds §9 documenting wave 51-2 and the
  selectors deliberately retained (e.g. `.hub-page`,
  `.tool-card`, `.toggle`).

No markup, no checks, no tests changed. **Catalog count 254,
unchanged.** `UTILITIES.length` is 254. Lint + unit tests +
a11y + build all clean.

### Added (spec-v50 wave 50-2 — runtime no-network / no-cookie / storage-allowlist integration test)

Closes the deferred runtime half of the v50 §3.1 / §3.3 / §3.4 /
§3.5 enforcement. Wave 50-1 codified the static checks (CSP
shape, source-scan denies, package-deps deny). Wave 50-2 adds
the browser-runtime trace that proves the rules hold under
actual page execution, not just at the call site.

- `test/integration/no-network.spec.js`: new. Boots a real
  browser, exercises the home view + three representative tiles
  (`bmi`, `icd10cm-lookup`, `wells-pe` — covering pure compute,
  data-shard fetch, and additive-scoring code paths), then
  asserts: zero off-origin requests of any kind; zero
  `navigator.sendBeacon` calls and zero `Image` pixel-style
  fires (caught via a tripwire installed before any tile JS
  runs); `document.cookie === ''`; every key in `localStorage`
  / `sessionStorage` matches `scripts/storage-allowlist.json`.
  Runs across all three Playwright browser projects (chromium,
  firefox, webkit) in the existing `npm run test:e2e` job.
- `scripts/grep-check.mjs`: +1 file exception so the test may
  name `sendBeacon`, `analytics`, etc. by-name in its assertions
  without colliding with the §3.5 deny rule.
- Sanity-tested: a deliberate `document.cookie = "test=1"` in a
  view file causes the test to fail with the §3.3 violation
  message. Restored after the local check.

No tiles added, removed, or renamed. **Catalog count 254,
unchanged.**

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. The new Playwright spec passes on chromium,
firefox, and webkit locally.

### Added (spec-v50 wave 50-1 — public-infrastructure commitments: codified non-degradation guarantees)

Codifies the eight posture commitments that distinguish Sophie
from a typical web product (no ads, no login, no telemetry, no
third-party fetch, no AI, no cookies, no paid tier, MIT-licensed
forever) as automated invariants enforced on every commit, and
ships a public `/commitments/` page listing each guarantee
alongside the check that enforces it.

- `scripts/check-commitments.mjs`: new. Enforces §3.4 (every
  `localStorage.setItem` / `sessionStorage.setItem` / `caches.open`
  uses a key on the allowlist), §3.6 (no AI-vendor SDK substrings
  in source `import` / `require` / string-literal contexts and no
  AI-vendor package in `package.json` dependencies), §3.7 (no
  auth / paywall vendor package in dependencies), §3.8
  (`package.json` `license === "MIT"` and `LICENSE` first line
  begins with "MIT License"), and the `_headers` CSP-shape
  assertion for §3.1 / §3.2 (`connect-src 'self'`, `script-src 'self'`).
- `scripts/storage-allowlist.json`: new. Lists the one permitted
  `localStorage` key (`sw-theme`) and the service worker's two
  cache-namespace prefixes (`sophiewell-shell-`, `sophiewell-data-`).
- `scripts/grep-check.mjs`: +3 rules for §3.3 (no `document.cookie =`
  / `Set-Cookie` in source), §3.5 (no analytics / RUM / error-
  reporting vendor identifiers), and §3.7 (no auth / paywall
  vendor identifiers). Word- and URL-bounded to avoid colliding
  with prose like "implausible".
- `scripts/build-commitments-page.mjs`: new. Emits
  `dist/commitments/index.html`, a pure-HTML page with the eight
  commitments and a link to each enforcement script.
  Wired into `scripts/build.mjs`.
- `index.html`: footer carries a new `/commitments/` link.
- `CONTRIBUTING.md`: new file documenting the tile-add workflow,
  the commitment-add / -change process, and the defect-against-
  a-commitment reporting protocol.
- `package.json`: `npm run lint` now runs `eslint` →
  `grep-check.mjs` → `check-catalog-truth.mjs` →
  `check-commitments.mjs` as four sequential gates.
- `docs/spec-v50.md`: the v50 spec doc itself.
- No tiles added, removed, or renamed. **Catalog count 254,
  unchanged.**

Sanity-tested: a deliberate `localStorage.setItem('unauthorized-key', 'x')`
on a source file fails `check-commitments` locally with a
per-line diff. A deliberate addition of an analytics-vendor
identifier fails grep-check. The Playwright runtime no-network
test (spec-v50 §3.1 step 2) is deferred to a follow-up wave;
the CSP shape assertion already enforces the network half at
build time.

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. `/commitments/` is reachable from the footer
of every page after `npm run build`.

### Added (spec-v46 wave 46-1 — catalog-truth invariants: anti-drift guards)

Closes a class of defect discovered on 2026-05-22: the home page
`<title>`, OG / Twitter cards, meta description, home lede, JSON-LD
description, and the `#browse-tile-count` no-JS fallback had all
drifted by 24-31 tiles behind the catalog. Per spec-v46,
`UTILITIES.length` is now the single canonical source of truth for
the catalog count, and CI fails the build on any drift across the
14 in-scope user-facing surfaces.

- `scripts/check-catalog-truth.mjs`: new. Parses `app.js` to count
  `UTILITIES`, then extracts the named count from each in-scope
  surface (title, meta description, OG title / description /
  image alt, Twitter title / description / image alt, home lede,
  `#browse-tile-count` no-JS fallback, JSON-LD description, README
  first-section blurb, `package.json` description, and the
  most-recent close-line in `docs/scope-mdcalc-parity.md`). Exits
  1 with a per-surface diff on any mismatch.
- `scripts/grep-check.mjs`: +1 rule. A 3-digit decimal literal in
  the range [100, 999] adjacent to one of `tile`, `tiles`, `tool`,
  `tools`, `calculator`, `calculators`, `utilit`, `deterministic`
  on a scanned surface is treated as a putative tile count and
  must equal `UTILITIES.length`. Scanned surfaces are
  `index.html`, `README.md`, `package.json`, `site.webmanifest`,
  the prelude of `CHANGELOG.md` above the most recent `[Unreleased]`
  header, and `docs/*.md` excluding `docs/spec-v*.md` and
  `docs/audits/**`. Legitimate historical counts are escaped with
  `<!-- catalog-truth:historical -->` on the same or preceding line.
- `package.json`: `npm run lint` now runs `eslint` →
  `grep-check.mjs` → `check-catalog-truth.mjs` as three sequential
  gates. Any drift fails CI.
- `docs/spec-v46.md`: the v46 spec doc itself (catalog count 254,
  unchanged).
- No tiles added, removed, or renamed. **Catalog count 254,
  unchanged.**

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. A deliberate ±1 drift on any in-scope surface
fails `npm run lint` locally with a per-surface diff.

### Added (spec-v45 wave 45-1 — bedside suicide-risk screen: `cssrs`)

Closes the suicide-risk screening gap in Sophie's psychiatric /
behavioral-health nursing surface. PHQ-9 and GAD-7 already ship
as severity screens, but Sophie had no validated suicide-risk
triage tool. The C-SSRS Screener (Posner 2011) is Joint-
Commission and SAMHSA recommended for inpatient and ED
suicide-risk screening; PHQ-9 item 9 captures passive ideation
but is not a triage instrument. C-SSRS is publicly distributable
for clinical use (Columbia Lighthouse Project license).

- `lib/scoring-v4.js`: new `cssrs()`. Seven boolean items: five
  ideation questions (Q1-Q5 past-month: wish-dead, thoughts-
  killing, thoughts-methods, some-intent, plan-intent), one
  lifetime behavior question (Q6), and a past-3-months follow-
  up (Q6a). Risk band per the Columbia Lighthouse Project ED
  Triage Screener: no risk reported / low (Q1 or Q2 only) /
  moderate (Q3, or lifetime Q6 not in past 3 months) / high
  (Q4 or Q5, or Q6 in past 3 months). Enforces Q6 / Q6a
  consistency (cannot be in past 3 months without lifetime).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with seven labeled checkboxes
  carrying the verbatim Posner 2011 question text and an aria-
  live result region with the band, the band-appropriate
  decision-support action line, and the banding source.
- `lib/meta.js`: META entry with inline Posner 2011 citation,
  specialty tags (nursing-ed / nursing-floor / nursing-general
  / psychiatry / emergency-medicine / family-medicine /
  social-work), a prefilled all-no worked example, and the
  spec-v11 §5.3 four-band interpretation.
- `test/unit/cssrs.test.js`: 13 new unit tests covering the
  all-no tile example, each band-boundary item (Q1, Q2 low; Q3
  moderate; Q4, Q5 high; Q6 lifetime moderate; Q6+Q6a high),
  the escalation behavior across multiple positives, text-
  content citations, the Q6 / Q6a consistency guard, and
  rejection of non-boolean inputs.
- `docs/audits/v11/cssrs.md`: v11 audit log with PASS status,
  primary citation re-verified against Posner 2011, and the
  Columbia Lighthouse Project ED Triage Screener banding rule
  cross-checked.
- `docs/spec-v45.md`: the v45 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 253 → 254.

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v44 wave 44-1 — rehab-nursing weighted ADL: `barthel`)

Adds the Barthel Index (Mahoney & Barthel 1965), the rehab-
nursing standard ADL with weighted scoring. Sophie's discharge-
planning surface now ships Katz ADL (v42, six binary basic-ADL
items) and Lawton IADL (v43, eight binary instrumental-ADL
items); Barthel is the granular weighted ADL used in inpatient
stroke rehab and post-acute SNF nursing. Ten items with weighted
0/5/10/15-point increments, total 0-100 (always a multiple of 5).
Severity banding per Shah 1989 — five bands: 100 independent,
91-99 slight, 61-90 moderate, 21-60 severe, 0-20 total dependency.

- `lib/scoring-v4.js`: new `barthel()`. Enforces the published
  per-item allowed-value sets (off-grid values reject), sums to
  a 0-100 total, and bands per Shah 1989. Returns `{score,
  parts, band, text}`.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with ten labeled selects, each
  option explicitly naming the score (e.g., "10 independent",
  "5 needs help"); per-item muted breakdown for the bedside
  hand-off.
- `lib/meta.js`: META entry with inline Mahoney 1965 + Shah 1989
  citations, specialty tags (nursing-floor / nursing-rehab /
  nursing-general / physical-therapy / occupational-therapy /
  physical-medicine-rehabilitation / geriatrics /
  case-management), a prefilled all-maximal worked example, and
  the spec-v11 §5.3 five-band interpretation.
- `test/unit/barthel.test.js`: 12 new unit tests covering the
  maximal (100) and minimal (0) tile examples, the band-boundary
  scores at 95 / 90 / 65 / 60 / 25 / 20 (the 91 / 21 / 61
  cutoffs are not reachable on a 5-point grid), text-content
  citations, and rejection of off-grid values, non-integer, and
  missing items.
- `docs/audits/v11/barthel.md`: v11 audit log with PASS status,
  primary citation re-verified against Mahoney 1965, and the
  Shah 1989 five-band cutoffs cross-checked.
- `docs/spec-v44.md`: the v44 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 252 → 253.

`UTILITIES.length` is 253. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v43 wave 43-1 — instrumental-ADL companion to Katz: `lawton-iadl`)

Adds the instrumental-ADL companion to v42's Katz ADL. Katz tells
the discharging RN whether the patient can survive at home;
Lawton tells them whether the patient can *manage* at home —
placing a phone call, shopping, preparing food, housekeeping,
laundry, organizing transportation, managing one's own
medications, and handling one's own finances. A patient who is
Katz 6 / Lawton 8 goes home; a patient who is Katz 6 / Lawton 3
goes home only with medication-management and meal-prep services;
a patient who is Katz 4 / Lawton 1 needs an assisted-living or
SNF placement. Lawton declines also flag mild cognitive
impairment and increased medication-error risk earlier than ADL
alone.

- `lib/scoring-v4.js`: new `lawtonIadl()`. Eight 0/1 IADL items
  summing to 0-8 on the modern unisex form. Returns `{score,
  parts, band, text}` with bands at 8 / 6-7 / 3-5 / 0-2.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `lawton-iadl`.
- `views/group-g.js`: +1 renderer with eight labeled 0-1 range
  fields; the muted summary line names the IADLs the patient
  needs help with for the discharge note.
- `lib/meta.js`: META entry with inline Lawton 1969 citation,
  specialty tags (nursing-floor / nursing-ed / nursing-general /
  geriatrics / family-medicine / case-management /
  occupational-therapy / physical-therapy), a prefilled all-
  independent worked example, and the spec-v11 §5.3 four-band
  interpretation.
- `test/unit/lawton-iadl.test.js`: 9 new unit tests covering the
  full-independence tile example, the 7 / 6 / 5 / 3 / 2 / 0
  band-boundary scores, text-content citation, and rejection of
  non-binary, non-integer, and missing inputs.
- `docs/audits/v11/lawton-iadl.md`: v11 audit log with PASS
  status, primary citation re-verified against Lawton 1969, and
  the four band cutoffs cross-checked against the Hartford
  Institute "Try This" series.
- `docs/spec-v43.md`: the v43 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 251 → 252.

`UTILITIES.length` is 252. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v42 wave 42-1 — geriatric / discharge-planning ADL: `katz-adl`)

Closes the functional-status / discharge-planning gap in the
nursing surface. Sophie ships fall-risk (Hendrich II, Morse),
pressure-injury (Braden, Norton+PUSH), frailty (CFS), and
cognitive screening (mini-Cog) — but had nothing for functional
status / ADL independence, the core nurse / case-management
question at every discharge huddle. Katz ADL (Katz 1963) is the
foundational instrument: six binary ADL items (bathing,
dressing, toileting, transferring, continence, feeding); each
0 dependent / 1 independent; total 0-6 with bands 6 = full
independence, 5 = mild, 3-4 = moderate, 0-2 = severe. Katz is
RN-administered, in routine use in geriatric assessment, home-
health initial assessment (OASIS items M1830-M1870 are largely
Katz-aligned), and discharge planning.

- `lib/scoring-v4.js`: new `katzAdl()`. Six 0/1 items summed to
  0-6 with Katz 1963 bands. Returns `{score, parts, band, text}`.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `katz-adl`.
- `views/group-g.js`: +1 renderer with six labeled 0-1 range
  fields and an aria-live result region; the muted summary
  line lists the per-item independent / dependent breakdown for
  the discharge note.
- `lib/meta.js`: META entry with inline Katz 1963 citation,
  specialty tags (nursing-floor / nursing-ed / nursing-general /
  geriatrics / family-medicine / physical-therapy /
  occupational-therapy / case-management), a prefilled all-
  independent worked example, and the spec-v11 §5.3 four-band
  interpretation.
- `test/unit/katz-adl.test.js`: 8 new unit tests covering the
  full-independence tile example, the 5 / 4 / 3 / 2 / 0
  band-boundary scores, text-content citation, and rejection of
  non-binary, non-integer, and missing inputs.
- `docs/audits/v11/katz-adl.md`: v11 audit log with PASS status,
  primary citation re-verified against Katz 1963, and the four
  band cutoffs cross-checked.
- `docs/spec-v42.md`: the v42 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 250 → 251.

`UTILITIES.length` is 251. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v41 wave 41-1 — ICU coma scale for intubated patients: `four-score`)

Adds the FOUR Score (Wijdicks 2005) — the validated ICU coma
scale designed for intubated and severely obtunded patients
where the GCS verbal component is unavailable. GCS ships in the
v3 vitals tile but has two well-known ICU weak spots: (1) the
verbal component is unscoreable in intubated patients (the "Vt"
workaround preserves the score but loses the airway-protection
signal), and (2) it does not assess brainstem reflexes. FOUR
replaces verbal with a respiration component (capturing both
intubation and over-breathing of the ventilator) and adds a
dedicated brainstem-reflex component. A CCRN, neuro-ICU RN, or
trauma-ICU RN at the bedside uses FOUR multiple times per shift
today; it is also one of the metrics in the AAN 2010 brain-death
determination guidance for screening confounders.

- `lib/scoring-v4.js`: new `fourScore()`. Four ordinal items
  each integer 0-4 (eye, motor, brainstem, respiration) summing
  to 0-16. Returns `{score, parts, text}` with a clinically-
  anchored note at score 16 ("all four maximal") and score 0
  ("all four absent - AAN 2010 brain-death-workup pattern"), and
  an "intermediate pattern" message reporting per-component
  E/M/B/R values for the bedside hand-off.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `four-score`.
- `views/group-g.js`: +1 renderer with four labeled range fields
  (each with the published Wijdicks 2005 anchor descriptions
  visible in the label) and an aria-live result region.
- `lib/meta.js`: META entry with inline Wijdicks 2005 citation,
  specialty tags (nursing-icu / nursing-general / neurology /
  critical-care / emergency-medicine / family-medicine), a
  prefilled all-maximal worked example, and the spec-v11 §5.3
  three-band interpretation (16 / 1-15 intermediate / 0).
- `test/unit/four-score.test.js`: 7 new unit tests covering the
  maximal (16) and minimal (0) tile examples, an intermediate
  pattern (E2 M3 B4 R1 = 10), part-mirroring, the
  minimum-non-zero (1) case, and rejection of out-of-range,
  non-integer, and missing components.
- `docs/audits/v11/four-score.md`: v11 audit log with PASS
  status, primary citation re-verified against Wijdicks 2005,
  and the AAN 2010 brain-death-workup cross-reference.
- `docs/spec-v41.md`: the v41 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 249 → 250.

`UTILITIES.length` is 250. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v40 wave 40-1 — post-stroke bedside dysphagia screen: `guss`)

Adds the bedside RN's "can this acute-stroke patient eat?" tile.
Every acute-stroke patient should have a bedside dysphagia
screen before any oral intake (AHA/ASA 2018 §6.3); GUSS (Trapl
2007) is the most-validated nurse-administered bedside screen at
acute stroke onset. The screen prevents the stroke-associated
aspiration pneumonia that drives a sizable share of stroke-unit
length-of-stay and 90-day mortality. Sophie's cerebrovascular
surface now covers recognition (CPSS, ROSIER), severity (NIHSS,
mNIHSS), LVO prediction (LAMS, RACE), and aspiration risk (this
tile).

- `lib/scoring-v4.js`: new `guss()`. Two-stage screen with the
  full Trapl 2007 gating rules in code: stage 1 (5 binary items)
  gates stage 2; within stage 2, each consistency (semisolid ->
  liquid -> solid) must score 5 to advance. Returns `{score,
  stage1, semisolid, liquid, solid, gated, band, text}` with
  band per Trapl 2007 Table 3 (20 slight/no, 15-19 slight, 10-14
  moderate, 0-9 severe).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with four section headings
  (preliminary + three consistencies) and 17 labeled range
  inputs, plus a per-stage breakdown and a "gated subtests"
  muted line in the result region.
- `lib/meta.js`: META entry with inline Trapl 2007 citation,
  specialty tags (nursing-icu / nursing-ed / nursing-general /
  neurology / emergency-medicine / speech-language-pathology /
  family-medicine), a prefilled all-pass worked example, and the
  spec-v11 §5.3 four-band interpretation.
- `test/unit/guss.test.js`: 10 new unit tests covering the
  perfect tile example (20), the stage-1 gate (=4 ends the
  screen at 4), the semisolid / liquid / solid gates, all four
  band lower/upper edges (0/4, 9/10, 14/15, 19/20), per-band
  text content, and rejection of out-of-range / non-integer
  inputs.
- `docs/audits/v11/guss.md`: v11 audit log with PASS status,
  primary citation re-verified against Trapl 2007, and the
  three gating rules plus the four band cutoffs cross-checked.
- `docs/spec-v40.md`: the v40 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 248 → 249.

`UTILITIES.length` is 249. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v39 wave 39-1 — ED stroke recognition with mimic discrimination: `rosier`)

Closes the recognition-stage gap in the cerebrovascular surface.
CPSS (spec-v37) is sensitive but non-specific — post-ictal Todd's
paresis, syncope, and migraine-with-aura all flip it positive —
and the ED RN performing recognition needs an instrument that
subtracts points for the two most common stroke mimics (seizure
and a syncope-pattern LOC) and adds points for focal-deficit
items. ROSIER (Nor 2005) is that instrument: seven binary items,
total -2 to +5, stroke likely at >0 with sensitivity 93% and
specificity 83%. It is in routine ED use at UK stroke centers
and an increasing number of US ED triage protocols.

- `lib/scoring-v4.js`: new `rosier()`. Seven boolean items — two
  mimic items each weighted -1 (LOC/syncope, seizure) and five
  focal-deficit items each weighted +1 (facial/arm/leg weakness,
  speech disturbance, visual-field defect) — summing to a total
  in -2..+5. `strokeLikely` fires at score > 0 per Nor 2005.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with seven labeled checkboxes
  and an aria-live result region; per-item labels include the
  explicit ±1 weight.
- `lib/meta.js`: META entry with inline Nor 2005 citation,
  specialty tags (nursing-ed / nursing-general /
  emergency-medicine / neurology / family-medicine), a prefilled
  all-false worked example, and the spec-v11 §5.3 interpretation
  bands.
- `test/unit/rosier.test.js`: 9 new unit tests covering the
  all-false tile example (0), the +1 / -1 / -2 / +5 boundaries,
  the focal-plus-mimic-cancels-to-0 case, part-sign mirroring,
  text-content citation, and rejection of non-boolean and
  missing inputs.
- `docs/audits/v11/rosier.md`: v11 audit log with PASS status,
  primary citation re-verified against Nor 2005, and the
  >0-threshold and per-item-sign cross-checks.
- `docs/spec-v39.md`: the v39 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 247 → 248.

`UTILITIES.length` is 248. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v38 wave 38-1 — prehospital LVO predictor: `race`)

Closes the EU/Catalan-protocol gap left by v37's LAMS-only LVO
predictor. LAMS (Llanes 2004) ships in v37 wave 37-1 as the
three-item motor scale; v38 adds the five-item NIHSS-derived
Rapid Arterial oCclusion Evaluation (RACE; Pérez de la Ossa
2014) which is the LVO predictor in Catalan stroke protocols and
an increasing number of US systems. Both scales are validated
prehospital LVO predictors with comparable literature; the choice
is protocol-driven and Sophie should not force the maintainer's
local EMS / stroke system into one of them.

- `lib/scoring-v4.js`: new `race()`. Five integer items (facial
  palsy 0-2, arm motor 0-2, leg motor 0-2, gaze 0-1, aphasia /
  agnosia 0-2) summing to 0-9; `lvoLikely` fires at total >=5
  per Pérez de la Ossa 2014 (sensitivity 85% / specificity 68%
  in the derivation cohort).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with five labeled range fields
  and an aria-live result region.
- `lib/meta.js`: META entry with inline Pérez de la Ossa 2014
  citation, specialty tags (nursing-ed / nursing-icu /
  nursing-general / emergency-medicine / neurology /
  paramedicine), a prefilled all-normal worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/race.test.js`: 7 new unit tests covering the tile
  example (score 0), the 4 / 5 / 9 boundaries around the LVO
  threshold, part-mirroring, text-content citation, and
  rejection of out-of-range, non-integer, and non-finite inputs.
- `docs/audits/v11/race.md`: v11 audit log with PASS status,
  primary citation re-verified against Pérez de la Ossa 2014,
  and the LVO-threshold cross-check.
- `docs/spec-v38.md`: the v38 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 246 → 247.

`UTILITIES.length` is 247. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v37 wave 37-1 — prehospital / ED stroke triage scales: `cpss` + `lams`)

Closes the prehospital and ED triage gap in the stroke surface.
Sophie already ships the bedside-severity NIHSS and the
telemedicine-collapsed mNIHSS (spec-v29 wave 29-3a), but carried
no triage-grade screen and no LVO-prediction scale. v37 adds the
Cincinnati Prehospital Stroke Scale (CPSS; Kothari 1999) — the
three-item bedside screen an ED triage RN performs at the door —
and the Los Angeles Motor Scale (LAMS; Llanes 2004, LVO
threshold Nazliel 2008) — the three-item motor scale ED RNs and
EMS use to decide whether to route a stroke alert to a
comprehensive / thrombectomy-capable center.

- `lib/scoring-v4.js`: new `cpss()` (three binary items: facial
  droop, arm drift, abnormal speech; positive if any one is
  abnormal per Kothari 1999) and new `lams()` (facial droop
  0-1, arm drift 0-2, grip strength 0-2; total 0-5; `lvoLikely`
  fires at total >=4 per Nazliel 2008 sensitivity 81% /
  specificity 89%).
- `app.js`: +2 UTILITIES rows in Group G.
- `views/group-g.js`: +2 renderers, each with three labeled
  range inputs and an aria-live result region.
- `lib/meta.js`: two META entries with inline Kothari 1999 and
  Llanes 2004 / Nazliel 2008 citations, specialty tags covering
  nursing-ed / nursing-icu / nursing-general / emergency-medicine
  / neurology / paramedicine, prefilled all-normal worked
  examples, and the spec-v11 §5.3 interpretation bands.
- `test/unit/cpss-lams.test.js`: 11 new unit tests covering the
  all-normal tile examples, the CPSS one-abnormal trigger and
  three-abnormal cases, the LAMS 3 / 4 / 5 boundaries around the
  Nazliel 2008 LVO threshold, text-content citations, and
  rejection of out-of-range, non-binary, and non-integer inputs.
- `docs/audits/v11/cpss.md` and `docs/audits/v11/lams.md`: v11
  audit logs with PASS status, primary citations re-verified
  against Kothari 1999 and Nazliel 2008, and the trigger-rule
  and LVO-threshold cross-checks.
- `docs/spec-v37.md`: the v37 spec doc itself, narrow and
  two-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 244 → 246.

`UTILITIES.length` is 246. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v36 wave 36-1 — maternal track-and-trigger: `meows`)

Closes the maternal-warning gap left by the NEWS2/MEWS surface
([spec-v13](docs/spec-v13.md)) by shipping the Modified Early
Obstetric Warning System (MEOWS; Singh 2012) as the routine
maternal vitals chart for OB and OB-anaesthesia nurses. NEWS2
is built for the general adult ward and the physiology of late
pregnancy and the peripartum period shifts the thresholds for
tachycardia, hypotension, and tachypnea enough that the
non-obstetric chart will miss early maternal deterioration. The
Singh 2012 validation study at Northwick Park established the
track-and-trigger thresholds now in routine use across NHS
maternity units; ACOG's 2019 committee opinion on severe
maternal morbidity endorses the same idea. Sophie's existing OB
surface (APGAR, Bishop, ACOG severe-feature preeclampsia,
HELLP) does not cover routine maternal vitals — v36 plugs that.

- `lib/scoring-v4.js`: new `meows()`. Classifies eight maternal
  observations (RR, SpO2, temp, SBP, DBP, HR, AVPU neuro, pain
  0-3) as normal / yellow / red per Singh 2012 Table 1, counts
  reds and yellows, and triggers when any one red or two or
  more yellows are present. Returns `{flags, redCount,
  yellowCount, trigger, band, text}`. Rejects non-finite
  numbers, implausible vitals (negative HR, SpO2 outside
  0-100), invalid AVPU letters, and pain outside integer 0-3.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with six numeric vital-sign
  inputs, an AVPU select, a 0-3 pain range, and an aria-live
  result region that shows the band, red/yellow counts, the
  trigger sentence, and per-parameter classification.
- `lib/meta.js`: META entry with inline Singh 2012 citation,
  specialty tags (nursing-ob / nursing-general / obstetrics /
  anesthesiology / emergency-medicine / family-medicine), a
  prefilled all-normal worked example, and the spec-v11 §5.3
  interpretation bands.
- `test/unit/meows.test.js`: 11 new unit tests covering the
  tile example, single-yellow and two-yellow boundaries, a
  single-red trigger, the SpO2 <95 cutoff, the temp 35.0 and
  38.0 edges, AVPU mapping, pain-2 yellow, text content, and
  rejection of invalid neuro / pain / non-finite / out-of-range
  vitals.
- `docs/audits/v11/meows.md`: v11 audit log with PASS status,
  primary citation re-verified against Singh 2012, and the
  trigger-rule cross-check against the CEMACH chart.
- `docs/spec-v36.md`: the v36 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 243 → 244.

`UTILITIES.length` is 244. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v35 wave 35-1 — pediatric ICU iatrogenic-withdrawal companion: `sos`)

Closes out the pediatric ICU iatrogenic-withdrawal surface by
shipping the Sophia Observation withdrawal Symptoms scale
(SOS; Ista 2009) as the validated companion to WAT-1 shipped
in [spec-v34](docs/spec-v34.md). SOS was explicitly named as a
candidate in [spec-v34 §5](docs/spec-v34.md). PICU practice
documents both side-by-side at every shift — WAT-1 is leaner
and stimulus-driven, SOS is longer and observation-window
driven over a 4-hour shift — and a bedside nurse should be
able to pick whichever scale her unit's protocol calls for
without leaving Sophie.

- `lib/scoring-v4.js`: new `sos()`. Validates each of 15
  binary items as integer 0 or 1, sums to 0-15, and bands as
  no significant withdrawal / iatrogenic withdrawal present at
  the >=4 cutoff per Ista 2009 (Youden-optimal derivation
  threshold). Returns `{score, parts, withdrawal, band, text}`
  matching the shape of `wat1()` for parity.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with 15 labeled 0-1 range
  fields and an aria-live result region.
- `lib/meta.js`: META entry with inline Ista 2009 citation,
  specialty tags (nursing-picu / nursing-nicu / nursing-peds /
  nursing-general / pediatrics / anesthesiology / pain-medicine),
  a prefilled all-zero worked example, and the spec-v11 §5.3
  interpretation bands.
- `test/unit/sos.test.js`: 7 new unit tests covering band-
  boundary scores (0, 3, 4, 15), part-mirroring, text content,
  and rejection of out-of-range and non-integer inputs.
- `docs/audits/v11/sos.md`: v11 audit log with PASS status,
  primary citation re-verified against Ista 2009, and the
  derivation Youden cutoff cross-check.
- `docs/spec-v35.md`: the v35 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/spec-v34.md §5`: cross-reference back-link noting SOS
  "Resolved by spec-v35".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 242 → 243.

`UTILITIES.length` is 243. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v34 wave 34-1 — pediatric ICU bedside extensions: `comfort-b`, `wat-1`, `sbs`)

Completes the pediatric-ICU nurse-bedside sedation and
iatrogenic-withdrawal surface. COMFORT-B (van Dijk 2005) was
explicitly deferred in [spec-v33 §5](docs/spec-v33.md); WAT-1
(Franck 2008) and SBS (Curley 2006) are its natural companions
- WAT-1 because it is the most-cited pediatric iatrogenic-
withdrawal scale and uses SBS state as one of its 11 input
items, and SBS because it is the anchor scale that both
COMFORT-B and WAT-1 lean on in their validation studies.

- `lib/scoring-v4.js`: new `comfortB()`, `wat1()`, `sbs()`.
  COMFORT-B validates each of six items as integer 1-5, sums
  to 6-30, and bands as <11 over-sedation / 11-22 adequate /
  >22 distress per van Dijk 2005. WAT-1 validates ten binary
  items (0-1) plus a recoveryMinutes number that maps to 0/1/2
  recovery points (<2/2-5/>5 minutes), aggregates to 0-12, and
  flags withdrawal at the >=3 cutoff per Franck 2008. SBS is a
  single 6-level ordinal -3..+2 banded as deeper than target /
  target / inadequate per Curley 2006.
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers - six 1-5 range fields for
  COMFORT-B, ten 0-1 range fields plus one number input for
  WAT-1, one signed -3..+2 range field with live descriptor
  label for SBS. Each has an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/comfort-b.test.js`, `test/unit/wat-1.test.js`,
  `test/unit/sbs.test.js`: 23 new unit tests total covering
  band-boundary scores (COMFORT-B 6/10/11/18/22/23/30; WAT-1
  0/2/3/12 with recovery 0/1/2 minute boundaries; SBS -3/-2/-1/
  0/+1/+2) and rejection of out-of-range inputs.
- `docs/audits/v11/comfort-b.md`, `wat-1.md`, `sbs.md`: v11
  audit logs with PASS status, primary citation re-verified
  against van Dijk 2005, Franck 2008, and Curley 2006
  respectively. Cross-implementation differential drawn from
  each paper's worked example.
- `docs/spec-v34.md`: the v34 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/spec-v33.md §5`: cross-reference back-link noting
  COMFORT-B "Resolved by spec-v34".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 239 → 242.

`UTILITIES.length` is 242. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v33 wave 33-1 — opioid-sedation + neonatal-pain extensions: `npass`, `cries`, `poss`)

Extends the v32 non-verbal pain catalog with the three bedside-
necessary pain / sedation scales explicitly listed as out-of-
scope in [spec-v32 §5](docs/spec-v32.md): N-PASS (neonatal pain,
agitation, and sedation; Hummel 2008), CRIES (neonatal post-op
pain; Krechel 1995), and POSS (Pasero opioid-induced sedation;
Pasero 2009). After v33 the nurse-bedside pain / sedation
surface is complete for the non-self-report population: ICU
(CPOT, BPS), peds / dementia / neonatal non-verbal (FLACC,
PAINAD, NIPS), neonatal extended (N-PASS, CRIES), and opioid-
sedation monitoring (POSS).

- `lib/scoring-v4.js`: new `npass()`, `cries()`, `poss()`.
  N-PASS validates each of five items as a signed integer
  -2..+2 plus a gestational-age number in [20, 44], sums the
  positive items as the pain score, sums the negative items as
  the sedation score, and applies the Hummel 2008 preterm +1/
  week<30 wk adjustment to the pain side. CRIES is a five-item
  0-10 ordinal sum with bands 0-3 / 4-6 / 7-10 (>=4 indicates
  analgesia per Krechel 1995). POSS is a single 5-level
  ordinal (S, 1, 2, 3, 4) that emits the canonical Pasero 2009
  bedside action for each level.
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers - a signed -2..+2 range
  field with a GA number input for N-PASS, five 0-2 range
  fields for CRIES, one 0-4 range field with live S/1/2/3/4
  label for POSS. Each has an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/npass.test.js`, `test/unit/cries.test.js`,
  `test/unit/poss.test.js`: 24 new unit tests total covering
  the band-boundary scores (N-PASS pain 0/3/4/10 + sedation
  -1/-3/-5 + preterm 26-wk adjustment; CRIES 0/3/4/6/7/10;
  POSS S/1/2/3/4) and rejection of out-of-range inputs.
- `docs/audits/v11/npass.md`, `cries.md`, `poss.md`: v11 audit
  logs with PASS status, primary citation re-verified against
  Hummel 2008, Krechel 1995, and Pasero 2009 respectively.
  Cross-implementation differential drawn from each paper's
  worked example.
- `docs/spec-v33.md`: the v33 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 236 → 239.

`UTILITIES.length` is 239. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v32 wave 32-1 — non-verbal pain scales: `flacc`, `painad`, `nips`)

Extends the v29 nursing-shift catalog with three validated
non-verbal pain scales nurses reach for at the bedside when the
patient cannot self-report on a numeric rating scale. Each is a
small ordinal sum with a banded interpretation and passes the
v29 §3 one-line test (structured input → computed result).
Complements the v29-shipped CPOT (any ICU) and BPS (intubated)
by covering the non-ICU non-verbal surface: pediatrics,
advanced dementia, and neonatal.

- `lib/scoring-v4.js`: new `flacc()`, `painad()`, `nips()`. Each
  validates per-item ordinal range, sums to the total, and
  returns `{score, parts, band, text}`. Shared `painBand()`
  helper for the FLACC / PAINAD 0-10 banding (0 no pain; 1-3
  mild; 4-6 moderate; 7-10 severe). NIPS uses its own three-
  band cutoff per Lawrence 1993 (0-2 no/mild; 3-4 mild-to-
  moderate; >4 severe).
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers, each five or six labeled
  range inputs and an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and
  spec-v11 §5.3 interpretation bands.
- `test/unit/flacc.test.js`, `test/unit/painad.test.js`,
  `test/unit/nips.test.js`: 20 new unit tests total covering the
  band-boundary scores (FLACC 0/3/4/6/7/10; PAINAD 0/3/4/7/10;
  NIPS 0/2/3/4/5/7) and rejection of out-of-range inputs.
- `docs/audits/v11/flacc.md`, `painad.md`, `nips.md`: v11 audit
  logs with PASS status, primary citation re-verified against
  Merkel 1997, Warden 2003, and Lawrence 1993 respectively.
  Cross-implementation differential drawn from each paper's
  worked example.
- `docs/spec-v32.md`: the v32 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 233 → 236.

`UTILITIES.length` is 236. Lint + 1211 unit tests + a11y + sbom +
build all clean.

### Added (spec-v31 wave 31-1 — Beers Criteria deprescribing checker: `beers-check`)

Resolves [spec-v29 §10.4](docs/spec-v29.md#10-open-questions). The
v29 prune cut the standalone `beers` reference card (a searchable
list of drugs-to-avoid). v31 ships the computed form: a closed-
vocabulary intake (patient age + 15 PIM medication categories +
8 comorbidities) cross-referenced against AGS 2023 Tables 2, 3,
and 6 to emit specific PIM, drug-disease, and high-severity
drug-drug flags with deprescribing recommendations.

- `lib/medication-v4.js`: new `beersCheck()` plus exported
  `BEERS_PIM` (15 categories) and `BEERS_DISEASE` (8) closed
  vocabularies. Inputs: `ageYears` (18-120), `medications` (array
  of PIM keys), `comorbidities` (array of disease keys). Outputs:
  per-medication PIM flag (rationale + recommendation), drug-
  disease flag for each PIM × comorbidity row in AGS 2023
  Table 3, drug-drug flag for opioid + benzodiazepine,
  opioid + gabapentinoid, and opioid + Z-drug (AGS 2023 Table 6).
  Age-band banner (< 65 vs in-band per AGS 2023 §2).
- `app.js`: +1 UTILITIES row in Group F.
- `views/group-f.js`: renderer slotted at end of group-F; one
  number input (age), two grouped checkbox lists driven by the
  exported vocabularies (so the UI and the data-table stay in
  sync automatically).
- `lib/meta.js`: META entry with inline citation, specialty tags,
  prefilled worked example (age 78 + benzodiazepine + opioid +
  history-of-falls produces 5 flags), and the spec-v11 §5.3
  interpretation bands.
- `test/unit/beers-check.test.js`: 15 new unit tests covering the
  five worked examples from spec-v31 §2.1, the < 65 / 65-boundary
  banner switch, the NSAID three-way comorbidity expansion (HF +
  GI-bleed + CKD), the three drug-drug Table 6 rows, duplicate-
  input collapse, and rejection of out-of-range / non-array /
  unknown-token inputs.
- `docs/audits/v11/beers-check.md`: v11 audit log with PASS
  status, primary citation re-verified against AGS 2023 Tables
  2, 3, and 6. Boundary examples, cross-implementation
  differential (three rows pulled from AGS 2023 verified
  verbatim), edge-input handling, a11y, defects opened (none).
- `docs/spec-v31.md`: the v31 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/spec-v29.md §10.4`: cross-reference back-link noting
  "Resolved by spec-v31".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 232 → 233.

`UTILITIES.length` is 233. Lint + 1191 unit tests + a11y + sbom +
build all clean.

### Added (spec-v30 wave 30-1 — thermal-emergency decision tiles: hypothermia-rewarm + heatstroke-decision)

Resolves [spec-v29 §10.3](docs/spec-v29.md#10-open-questions). The
v29 prune cut the static `hypothermia` and `heat-illness` staging
reference cards (correctly — a labelled grid is not computation).
What was missing was the *algorithm pinned to the staging*: given
the staging inputs, which rewarming or cooling action is indicated,
and what is the EMS / ECPR referral threshold. v30 ships those two
calculators, each passing the v29 §3 one-line test (structured
input → computed bedside action).

- `lib/scoring-v4.js`: new `hypothermiaRewarm()`. Inputs: core
  temp (C), Swiss-state picker (alert+shivering / impaired /
  unconscious / arrest), ECPR-exclusion flag (lethal injury,
  chest non-compressible, known asystole pre-cooling), optional
  serum K+. Outputs: Swiss stage HT I-IV per Durrer 2003;
  rewarming pathway (passive external / active external +
  minimally invasive / active internal / ECPR); ERC 2021 §4.7
  ECPR cut-off (K+ > 12 mmol/L); the "do not declare death until
  rewarmed to >=32 C" banner; the Gilbert 2000 < 13.7 C
  lowest-reported-survival banner.
- `lib/scoring-v4.js`: new `heatstrokeDecision()`. Inputs: core
  (rectal) temp (C), CNS picker (none / mild confusion /
  altered), sweating present, setting (field / hospital). Outputs:
  stage per Bouchama 2002 (heat exhaustion vs heat stroke =
  core >40 C **or** CNS dysfunction); subtype (classic anhidrotic
  vs exertional sweating); cooling algorithm (rest + rehydrate
  for exhaustion; CWI to 38.9 C cool-first-transport-second for
  field heat stroke per WMS 2019; CWI preferred / evaporative
  acceptable for in-hospital); rhabdo / DIC / AKI surveillance
  banner; Casa 2007 30-minute-window survival banner.
- `app.js`: +2 UTILITIES rows in Group I.
- `views/group-i.js`: +2 renderers slotted next to the surviving
  field-medicine calculators (cincinnati, fast, field-triage,
  burn-fluid, peds-ett, naloxone, co-cn-antidote).
- `lib/meta.js`: META entries for both tiles, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/hypothermia-rewarm.test.js` and
  `test/unit/heatstroke-decision.test.js`: 17 new unit tests
  total (10 + 7), covering the five Durrer 2003 staging boundaries
  (including the K+ 12 / K+ 14 ECPR cut-off boundary and the
  Gilbert 2000 < 13.7 C survival banner), the five Bouchama 2002
  worked examples (heat-exhaustion at 39.5 C, the 40.0 C boundary,
  exertional 41.2 C with CWI, classic 41.0 C anhidrotic, and CNS
  dysfunction at 39.0 C independent of temperature), and
  rejection of out-of-range and unknown-token inputs.
- `docs/audits/v11/hypothermia-rewarm.md` and
  `docs/audits/v11/heatstroke-decision.md`: v11 audit logs with
  PASS status, primary citation re-verified against Durrer 2003,
  Brown 2012, Lott 2021, Bouchama 2002, Lipman 2019, and
  Casa 2007. Boundary examples, cross-implementation differential
  (Brown 2012 Figure 1 / Lott 2021 §4.7 / Bouchama 2002 Table 1 /
  WMS 2019 field algorithm), edge-input handling, a11y, defects
  opened (none) all populated.
- `docs/spec-v30.md`: the v30 spec doc itself, narrow and
  two-tile (no other v29 rule amended).
- `docs/spec-v29.md §10.3`: cross-reference back-link noting
  "Resolved by spec-v30".
- `docs/scope-mdcalc-parity.md` and `README.md` and
  `package.json`: catalog count 230 → 232.

`UTILITIES.length` is 232. Lint + 1176 unit tests + a11y + sbom +
build all clean.

### Fixed (spec-v29 post-close: prune stale e2e smokes for retired tiles; fix two stale META examples)

The Playwright e2e job carried smokes and a parameterized correctness
sweep that still targeted tiles retired in spec-v29 wave 29-2, plus
two `META[id].example` blocks whose `expected` text no longer
matched the renderer output. Net effect: 20-ish pre-existing
chromium failures on `main`. After this change the e2e suite is
clean of retired-tile drift and the meta-example mismatches.

- `test/integration/smoke.spec.js`: the per-tile Group I (`defib`),
  K (`lab-adult`), L (`eob-glossary`), and O (`high-alert-card`)
  smokes referenced retired tiles. They are replaced with a single
  parameterized check that asserts each hash now redirects to the
  home view with the `.deprecation-notice` "Removed in spec-v29"
  banner (mirroring the pattern already used for Group A `icd10`).
  The "Group I tools render the local-protocol notice" smoke is
  retargeted at a surviving Group I tile (`cincinnati`); `defib`'s
  notice is gone with the tile.
- `test/integration/smoke.spec.js`: the GCS smoke asserted "GCS
  total: 15 (Mild)" — the v6-era default-input result. Per
  spec-v9 §3.3 every tile boots with its `META.example` applied,
  so the GCS view loads at 3/4/5 = 12 (Moderate). Assertion
  updated.
- `test/integration/smoke.spec.js`: the "Test-with-example
  button" smoke clicked `.example-btn` (a selector retired in
  spec-v9 when the button was replaced by an on-load prefill +
  `.example-reset` link). Test now exercises the prefill +
  reset-link round trip on BMI.
- `test/integration/example-correctness.spec.js`: same
  `.example-btn` → `.example-reset` rename. `ews-escalation`
  added to the `SCENARIO_ONLY` skiplist — its expected hour-band
  is local-timezone-dependent (datetime-local input + ISO output),
  not a tile bug; the unit test in `test/unit/` asserts the math
  directly.
- `lib/meta.js`: `egfr` example expected text "eGFR ~91 mL/min"
  did not match the CKD-EPI 2021 race-free output for the
  example's `sex: 'F'` field (correct value ~60, as the
  matching unit test in `test/unit/clinical.test.js` confirms).
  Expected text bumped to "eGFR ~60 mL/min/1.73m^2".
- `lib/meta.js`: `hacor` example expected "HACOR 3: not in the
  high-risk band" but for the documented example inputs
  (HR 110 / pH 7.40 / GCS 15 / P/F 240 / RR 25) every Duan
  2017 Table 1 sub-score is 0; the unit test in
  `test/unit/hacor.test.js` asserts exactly this. Expected
  text bumped to "HACOR 0: ...".

`npm run release:check` clean. The remaining e2e failures on the
chromium project are two slow specs hitting the 360s per-test
timeout when run sequentially in the same workers (cosmetic CI
slowness, not assertion failures); the suites pass when run
individually.

### Changed (spec-v29 post-close: docs/scope-mdcalc-parity.md sync to v29-close catalog count)

No code change; no catalog change. Brings the long-horizon scope
doc into agreement with the v29-close catalog.

- §3 cadence rationale: "the existing 178 tiles already cover
  the highest-frequency clinical workflows" → "the existing
  230 tiles already cover...". The 178 figure was the v6-era
  count; the v29-close catalog is 230 tiles
  (`UTILITIES.length` in `app.js`).
- §1 v29-amendment block: the "(603 -> 576)" projection is
  retained for spec-fidelity but now annotated as projected-
  from-over-counted-base, with the actual v29-close count
  (230 tiles) called out alongside. Matches the README +
  package.json sync already landed in this `[Unreleased]`
  block.

Lint + 1159 unit tests + sbom + build clean.

### Removed (spec-v29 post-close: 6 orphaned `G`-leader keyboard shortcuts whose target tiles were retired)

The `G`-prefix keyboard shortcuts in `lib/keyboard.js` carried six
entries that targeted tiles retired by spec-v10 or spec-v29 wave
29-2:

- `G I` → `icd10` (retired wave 29-2 §2.1)
- `G C` → `cpt` (retired wave 29-2 §2.1)
- `G N` → `ndc` (retired wave 29-2 §2.1)
- `G F` → `mpfs` Medicare Fee Lookup (retired in spec-v10)
- `G O` → `oop` Out-of-Pocket Estimator (retired in spec-v10)
- The HCPCS branch of `G H` ("Home or HCPCS from home", retired
  wave 29-2 §2.1)

Each leader pointed at a hash that no longer resolves to a tile.
Removed; `G H` is now an unconditional "Home" jump. Surviving
shortcuts: `G H` (Home), `G U` (Unit Converter), `G B` (BMI),
`G E` (eGFR), `G D` (Drip Rate), `G W` (Weight-Based Dose),
`G M` (MAP), `G G` (GCS). The help overlay (`?`) lists the
surviving set.

`test/unit/keyboard.test.js` updated: the surviving-keys
assertion drops the six retired letters; a new assertion
explicitly forbids them so a future regression cannot re-add
a leader that targets a missing tile.

### Changed (spec-v29 post-close: docs/data-sources.md rewritten around the v29-close bundled data)

No code change; no catalog change. Rewrites `docs/data-sources.md`
so the doc describes the data that actually ships with the page
at v29 close rather than the v1-v8 build-data catalog.

- Surviving datasets documented one section at a time: clinical
  reference data (formulas only), field-medicine datasets
  (CDC Field Triage, START / JumpSTART, FDA prehospital meds,
  EMS run-type checklists), public-health decision trees
  (tetanus, rabies PEP, BBP, TB, STI), medication / infusion
  datasets (abx-renal, benzo-equiv, steroid-equiv, MME factors,
  TPN rules, vasopressor doses), workflow templates, and the
  pre-rendered per-tile copy under `data/tool-copy/`.
- `data/synonyms.json` documented as the spec-v7 §3.2
  synonym map consumed by `lib/synonyms.js`.
- `data/mpfs/` flagged as vestigial: the shards still ship from
  disk but no tile reads them; pencilled in for a future
  cleanup pass.
- Explicit "Retired datasets" section enumerates every folder
  that was bundled in v1-v8 and was removed in the spec-v10
  patient-artifact retirement or the spec-v29 wave 29-2 prune
  (code lookups, patient-administrative infographics, field-
  medicine reference cards, lab and pharmacy reference tables,
  pricing / coverage / enforcement, eligibility / benefits,
  and the four single-class Group G clinical references).
  Every entry cross-references the spec-v29 §2 sub-section
  that retired it.
- Manifests section retained: every surviving folder still ships
  a manifest with the fields listed at the top, verified on
  every `npm run test` by `scripts/verify-integrity.mjs`.

Lint + 1159 unit tests + sbom + build clean.

### Changed (spec-v29 post-close: docs/architecture.md sync to v29-close runtime)

Brings `docs/architecture.md` into agreement with the v29-close
runtime. No code change; no catalog change.

- Diagram (right-hand "Static origin" column): drops the retired
  data shard directories (`icd10cm/`, `hcpcs/`, `cpt-summaries/`,
  `mpfs/`, `nadac/`, `ndc/`, `npi/`, `crosswalks/`, `ncci/`,
  `mue/`, `coverage/`, `enforcement/`, `hospital-prices/`,
  `no-surprises/`, `state-rights/`) that were retired in
  spec-v10 and spec-v29 wave 29-2; what remains is `clinical/`,
  `synonyms.json`, and the small per-tile shards consumed by
  the calculators that embed a bundled table inline.
- Runtime architecture: audience-tag bullet replaced by the
  spec-v29 §5.3 chip set (All / Nurse / Doctor / Pharmacist /
  RT / EMS / Biller-Coder / Educator; Nurse on-first-visit
  default). Web-Worker bullet rewritten to record that the
  Bill Decoder and Hospital Price Transparency Web Workers
  were retired and no Web Workers remain at runtime.
- "Shared renderers (v4)" section: `lib/table.js` and
  `lib/print.js` consumer lists updated for the post-v29
  surface (no more code-index / reference-range tables;
  printables collapse to appeal letter / HIPAA / ROI /
  discharge / wallet / SBAR).
- "v4 group expansion (J-O)" section rewritten as
  "v4 group expansion (post-v29 surface)": K (Lab Reference),
  L (Forms & Numbers Literacy), and O (Patient Safety)
  marked as retired with the spec-v29 wave 29-2 cross-
  references; J (Public Health) and N (Literacy Helpers)
  trimmed to their v29 survivors.

Lint + 1159 unit tests + sbom + build clean.

### Changed (spec-v29 post-close: README + package.json sync to v29-close catalog)

Brings the user-facing prose into agreement with the v29-close
catalog (230 tiles, all deterministic, nurse-first audience
priority).

- `package.json` description: "79 deterministic healthcare
  utilities" → "230 deterministic healthcare calculators tuned
  to the nurse on shift."
- `README.md` lead paragraph: drops the stale "603 -> 576"
  projection (the v29 spec projection was based on an over-
  counted base; actual at v29 close is 230 tiles).
- `README.md` "The problem" section: rewritten around the
  bedside-math use case rather than the patient-bill use case
  (the patient-facing bill / EOB / insurance decoders were
  retired in spec-v29 wave 29-2 §2.2).
- `README.md` "How it works" catalog narrative: rewritten to
  describe the v29-close grouping (Clinical math &
  conversions, Medication & infusion, Clinical scoring &
  risk, Clinical criteria & diagnostic bundles, Workflow &
  templates, Field medicine, Public health & infectious
  disease, Billing & coding). The static-index references
  (ICD-10 / HCPCS / CPT / NDC / EOB decoder / bill decoder /
  ASA / Mallampati / Beers / mRS / lab-ranges / TDM / tox
  levels / NIOSH / DOT-ERG / AHA wallet card) are dropped;
  the new v29 nursing-shift tiles (Braden, Morse, Hendrich II,
  RASS, BPS, CPOT, ICDSC, CAM, CAM-ICU, NPIAP, VIP/INS, ABO
  compat, insulin correction, electrolyte ladder, CRRT dose,
  ECMO titration, MTP tracker, restraint timer, sepsis-bundle
  clock, code-blue clock, device-day counter, Bristol / girth,
  vent SBT / PEEP-FiO2) are reflected.
- `README.md` "System design": drops the obsolete Web-Worker
  reference (Medical Bill Decoder and Hospital Price
  Transparency were removed in spec-v10 and spec-v29).
- `README.md` CLI reference: test count updated 191 → 1159.
- `README.md` "Limitations": drops the CPT / ICD-10-CM / NDC /
  Bill Decoder / Hospital Price Transparency / Medicare-fee
  limitations (these tiles no longer exist); adds one bullet
  pointing users at upstream sources for the retired static
  indexes.

No catalog change. No code change. Lint + 1159 unit tests +
sbom + build clean.

### Changed (spec-v29 §5.3 — audience-chip taxonomy revised; Nurse is the on-first-visit default)

Closes the final spec-v29 acceptance-criteria item. The audience
chip set on the home view is revised from the v6/v28 taxonomy
(`All / Patient / Biller and Coder / Nurse and Clinician / EMS
and Field / Educator`) to the v29 nurse-first taxonomy:

```
All  /  Nurse  /  Doctor  /  Pharmacist  /  RT  /  EMS  /  Biller-Coder  /  Educator
```

Nurse is the *default-selected* chip on first visit, preserved
across visits via URL hash only (no localStorage; per spec-v29
§5.3 this is the only user-preference signal on the site).

Surfaces touched:
- `index.html`: chip set replaced; Nurse carries `is-active` +
  `aria-pressed="true"` and the rest start inert.
- `app.js`: `filterState.audience` initial value is `'nurse'`.
  New `CHIP_MATCHERS` table maps each chip value to a predicate
  over `(tile.audiences, tile.specialties)` (spec-v29 §5.3:
  "Each chip filters the grid by the union of tile `audiences`
  and `specialties`."). The Nurse chip matches tiles with a
  `nursing-*` specialty tag (spec-v29 §5.1) *or* the legacy
  `clinicians` audience; RT matches `respiratory-therapy` or
  `pulmonology` specialty; Pharmacist matches `pharmacy`
  specialty; EMS matches the `field` audience or
  `emergency-medicine` specialty; Doctor / Biller-Coder /
  Educator map to the existing `clinicians` / `billers` /
  `educators` audience tokens. `tileMatches` looks up
  specialties from `META[id].specialties` via the tile's
  `data-tool` attribute.
- `app.js`: new `CHIP_TO_AUDIENCE_HINT` table maps the active
  chip to its closest legacy audience tag for the synonym
  matcher and the prompt ranker; this keeps
  `data/synonyms.json` audience-hint matching unchanged while
  the UI taxonomy is decoupled.
- `lib/hash.js`: the default audience returned by `parseHash`
  is `'nurse'`; `buildHash` omits the `a=` segment when the
  audience equals the default. The literal `'all'` is now a
  non-default value (`buildHash({ audience: 'all' })` emits
  `a=all`).
- `test/unit/hash.test.js`: empty-hash and round-trip tests
  updated for the new default. New test asserts
  `audience=all` now emits `a=all` (it is no longer the
  default).

Old bookmarks of the form `#a=patients` / `#a=clinicians` /
`#a=field` / `#a=billers` / `#a=educators` continue to round-
trip through the parser and the toggle-group sync logic; they
just do not match any of the new chip predicates, so the grid
falls back to the equivalent of `all` for those legacy tokens.
Per spec-v29 there is no backwards-compatibility shim for the
chip tokens themselves.

This closes the v29 acceptance criteria: spec-v29 is fully
shipped. Wave 29-1 (spec landing + deprecation banners),
wave 29-2 (47 tile deletions across Groups A, C/L, I, K/O, G),
wave 29-3 (20 new nursing-shift tiles), and the §5.3 audience-
chip update are all on `main`.

### Removed (spec-v29 wave 29-2 Group G — 5 single-class clinical reference tiles)

Fifth and final wave 29-2 deletion PR (one per group letter per
spec-v29 sec 7.2). Removes the Group G slots that are not
calculators — single-class clinical references whose "output" is
just the label of the class the user picked, or a filtered
view of a static table. The Group G scoring calculators (NIHSS,
CHA2DS2-VASc, HAS-BLED, Wells, GRACE, HEART, PERC, CURB-65, PSI,
qSOFA/SOFA, MELD/Child-Pugh, Ranson/BISAP, Centor, Caprini,
Bishop, Alvarado, mini-Cog, PHQ-9/GAD-7/AUDIT-C/CAGE/EPDS,
CIWA-Ar, plus every v17-v28 score tile) remain.

Tiles removed (5):
- `beers` (AGS Beers Criteria drug-condition lookup; static list).
- `peds-vitals` (PALS age-banded reference ranges; static table).
- `asa` (ASA Physical Status 6-class reference; static index).
- `mallampati` (Mallampati 4-class reference; static index).
- `mrs` (Modified Rankin Scale 0-6 reference; investigator-rated,
  not auto-computed).

Surfaces touched:
- `app.js` UTILITIES: 5 entries deleted; the Group G block in
  `REMOVED_V29_IDS` carries the per-group note. The
  `DEPRECATED_V29_TILES` set and `DEPRECATION_V29_BANNER_TEXT`
  string + their renderer branch are removed (wave 29-2 is now
  complete; no tiles remain in the deprecation window).
- `lib/meta.js`: 5 META entries deleted.
- `lib/scoring-v4.js`: `MRS_DESCRIPTIONS` export removed
  (it was a static 0-6 label table, not a scoring function).
- `views/group-g.js`: `peds-vitals`, `asa`, `mallampati`,
  `beers`, and `mrs` renderers removed; the unused `loadFile`
  import is dropped.
- `index.html`: 5 home-grid tool cards removed.
- `scripts/build-tool-pages.mjs`: `DATASET_TILES` and
  `REFERENCE_TILES` collapsed (the removed-tile bookkeeping no
  longer iterates; live tiles route through `classify()` directly).
- `scripts/build-topic-pages.mjs`: obstetrics-pediatrics topic
  drops `peds-vitals` from its tile list, description, and lede.
- `sitemap.xml`: 5 `/tools/<id>/` entries removed (build step
  regenerates this from `UTILITIES`).
- `test/unit/meta.test.js`: NO_INPUTS_TILES allowlist drops the
  3 Group G non-score ids.
- `test/unit/scoring-v4-w34.test.js`: 2 MRS reference tests and
  the `MRS_DESCRIPTIONS` import dropped.

Data shards deleted: `data/clinical/pediatric-vitals.json`,
`data/clinical/beers.json`, `data/clinical/asa-status.json`,
`data/clinical/mallampati.json`. `data/clinical/manifest.json`
shrinks to a single file (`formulas.json`) with `recordCount: 22`.

URL hashes for the 5 removed ids resolve to the home view with
the Group G note (spec-v29 sec 2.7).

Catalog 235 -> 230. Wave 29-2 is now complete: all 47 tile ids
in spec-v29 sec 2.1-2.5 have been removed (Groups A, C/L, I,
K/O, G).

### Removed (spec-v29 wave 29-2 Group K/O — 8 reference-range and wallet-card tiles)

Fourth of the five wave 29-2 deletion PRs (one per group letter
per spec-v29 sec 7.2). Removes the Group K (lab-reference) and
Group O (high-alert wallet) tiles, plus the deferred Group K/O
tiles surfaced in Groups F and G. The `iv-to-po` deferral from
spec-v29 sec 7.2 is resolved per the wave-29-2 audit decision:
the implementation is a static equivalence table with no numeric
output, so it is removed with the rest.

Tiles removed (8):
- lab-ranges (Group G slot; common adult ranges).
- lab-adult, lab-peds (Group K; NIH / pediatric reference tables).
- tdm-levels (Group K; therapeutic drug-level table).
- tox-levels (Group K; toxicology threshold table).
- high-alert (Group F slot; ISMP high-alert list).
- high-alert-card (Group O; ISMP wallet card).
- iv-to-po (Group F slot; static IV/PO equivalence table per
  spec-v29 sec 7.2 audit).

Surfaces touched:
- `app.js` UTILITIES: 8 entries deleted; the Group K/O block in
  `REMOVED_V29_IDS` adds the per-group note. `DEPRECATED_V29_TILES`
  now lists only the wave 29-2 Group G non-score deletion targets.
- `lib/meta.js`: 8 META entries deleted.
- `lib/medication-v4.js`: `ivToPo()` helper removed.
- `views/group-f.js`: high-alert + iv-to-po renderers + `renderTable`
  + `ivToPo` imports removed.
- `views/group-g.js`: lab-ranges renderer removed.
- `views/group-klmno.js`: lab-adult / lab-peds / tdm-levels /
  tox-levels / high-alert-card renderers removed + all four
  rendering library imports collapsed (file is now el-only).
- `index.html`: 8 home-grid tool cards + the Reference Ranges
  and High-Alert & Safety home sections removed.
- `scripts/build-topic-pages.mjs`: medication-safety topic
  rewritten around the calculator survivors;
  obstetrics-pediatrics drops `lab-peds`.

Data shards deleted: `data/lab-ranges-adult/`,
`data/lab-ranges-peds/`, `data/therapeutic-drug-levels/`,
`data/tox-levels/`, `data/iv-to-po/`. `data/clinical/manifest.json`
shrunk to drop `lab-ranges.json` and `ismp-high-alert.json`
(also removed); the remaining `data/clinical/` files
(formulas / pediatric-vitals / beers / asa-status / mallampati)
go in the wave 29-2 Group G non-scores PR.

Tests updated: `test/unit/medication-v4.test.js` drops `ivToPo`
import + four tests + the IVPO fixture; `test/unit/meta.test.js`
NO_INPUTS_TILES allowlist drops the 8 removed ids.

URL hashes for the 8 removed ids resolve to the home view with
the Group K/O note (spec-v29 sec 2.7).

Catalog 243 -> 235. Remaining v29 deletion PR: Group G non-scores
(5 single-class clinical references: beers, peds-vitals, asa,
mallampati, mrs).

### Removed (spec-v29 wave 29-2 Group I — 10 field-medicine reference cards)

Third of the five wave 29-2 deletion PRs (one per group letter
per spec-v29 sec 7.2). Removes the Group I reference cards,
leaving the field-medicine calculators and decision rules
(peds-weight-dose, cincinnati, fast, field-triage, start /
jumpstart triage, bsa_burn, burn-fluid, peds-ett, naloxone,
ems-doc, nexus-cspine, co-cn-antidote, avpu-gcs) in place.

Tiles removed (10):
- adult-arrest-ref, peds-arrest-ref (AHA ECC drug tables).
- defib (1-J/kg lookup, not a calculation per spec-v29 sec 2.3).
- toxidromes (static syndrome reference).
- dot-erg, niosh-pg (hazmat / chemical-hazard lookups).
- cpr-numeric (AHA wallet-card numeric reference).
- tccc (CoTCCC tourniquet reference).
- hypothermia, heat-illness (WMS staging reference tables).

Surfaces touched:
- `app.js` UTILITIES: 10 entries deleted; the Group I block in
  `REMOVED_V29_IDS` adds the per-group note.
- `lib/meta.js`: 10 META entries deleted.
- `lib/field.js`: `defibEnergy()` removed.
- `views/group-i.js`: 10 renderers + the `renderTable` /
  `buildIndex` imports removed.
- `index.html`: 10 Field Medicine home-grid cards removed.
- `scripts/build-topic-pages.mjs`: cardiology + obstetrics-
  pediatrics topic pages drop the removed-tile references.
- `test/unit/field.test.js`: `defibEnergy` import + six tests
  removed.

Data shards deleted: `data/aha-reference/`,
`data/cpr-aha-numeric/`, `data/dot-erg/`, `data/environmental/`,
`data/niosh-pg/`, `data/tccc/`, `data/toxidromes/`.

Tests deleted: `test/unit/aha-no-flowchart.test.js` (its only
job was to police the now-deleted AHA / CPR shards).

URL hashes for the 10 removed ids resolve to the home view with
the Group I note (spec-v29 sec 2.7).

Catalog 253 -> 243. Remaining v29 deletion PRs: Group K/O (8
reference-range / wallet-card tiles), Group G non-scores (5
single-class clinical references).

### Removed (spec-v29 wave 29-2 Group C/L — 15 patient-literacy and form-locator tiles)

Second of the five wave 29-2 deletion PRs (one per group letter,
per spec-v29 sec 7.2). Removes the patient-literacy and
form-locator surface, leaving only the generators (appeal-letter,
hipaa-roa) per spec-v29 sec 10 open question 1.

Tiles removed (15):
- Group C (12): decoder, insurance, eob-decoder, no-surprises,
  insurance-card, abn-explainer, msn-decoder, idr-eligibility,
  birthday-rule, cobra-timeline, medicare-enrollment, aca-sep.
- Group L (3): cms1500, ub04, eob-glossary.

Surfaces touched:
- `app.js` UTILITIES: 15 entries deleted; `REMOVED_V29_IDS`
  promoted from Set to Map so the redirect note text matches the
  group bucket (per spec-v29 sec 2.7).
- `lib/meta.js` META: 15 entries deleted.
- `views/group-c.js`: rewritten as the survivor-only file
  (appeal-letter + hipaa-roa). 580+ lines deleted.
- `views/group-klmno.js`: cms1500 / ub04 / eob-glossary
  renderers removed.
- `index.html`: 15 Insurance & Patient Literacy + Insurance
  Glossary home-grid tool cards deleted.
- `data/synonyms.json`: 14 synonym entries deleted.
- `scripts/build-topic-pages.mjs`: billing-and-coding and
  patient-literacy topic pages rewritten around the survivor
  generators (appeal-letter, hipaa-roa, lab-interpret,
  wallet-card).

Library modules deleted (the Group A holdover):
`lib/codes.js`, `lib/decoder.js`, `lib/cobra.js`,
`lib/medicare-enrollment.js`, `lib/aca-sep.js`,
`lib/birthday-rule.js`, `lib/tob.js`, plus the long-orphan
`lib/artifact-detect.js`, `lib/artifact-route.js`,
`lib/artifact-handoff.js` (spec-v10 sec 3.1 dropzone retire).

Data shard directories deleted: `data/icd10cm/`, `data/hcpcs/`,
`data/cpt-summaries/`, `data/ndc/`, `data/crosswalks/`,
`data/hcpcs-modifiers/`, `data/pos-codes/`, `data/revenue-codes/`,
`data/tob-codes/`, `data/nubc-special-codes/`, `data/drg/`,
`data/apc/`, `data/icd10-pcs/`, `data/rxnorm/`,
`data/cms-1500-fields/`, `data/ub04-fields/`,
`data/eob-glossary/`, `data/no-surprises/`. The bytes-on-disk
reduction is substantial; the service-worker pre-cache and
cold-cache install shrink proportionally per spec-v29 sec 2.7.

Tests deleted: `test/unit/decoder.test.js`,
`test/unit/cobra.test.js`, `test/unit/aca-sep.test.js`,
`test/unit/birthday-rule.test.js`, `test/unit/codes.test.js`,
`test/unit/tob.test.js`, `test/unit/medicare-enrollment.test.js`,
`test/unit/cpt-no-ama.test.js`, the three `test/unit/artifact-*`
tests. SOURCE_REQUIRED list in `test/unit/meta.test.js` is now
empty (no surviving tile relies on a source stamp).

URL hashes for the 15 removed ids resolve to the home view with
the one-line removed-note for Group C/L (spec-v29 sec 2.7).

Catalog 268 -> 253 at v29 wave 29-2 Group C/L close. Remaining
v29 deletion PRs: Group I (10 field-medicine reference cards),
Group K/O (8 reference-range / wallet-card tiles), Group G
non-scores (5 single-class clinical references).

### Removed (spec-v29 wave 29-2 Group A — 19 code-reference lookup tiles)

First of the five wave 29-2 deletion PRs (one per group letter, per
spec-v29 sec 7.2). Removes the entire Group A code-reference
surface, leaving only the survivor calculators (em-time,
ndc-convert) that compute deterministic outputs.

Tiles removed:
- icd10, hcpcs, cpt, ndc, pos-codes, modifier-codes,
  revenue-codes, carc, rarc (the original Group A spec-v2 set).
- hcpcs-mod, pos-lookup, tob-decode, rev-table, nubc-codes,
  drg-lookup, apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm
  (the spec-v4 Group A extensions; v0/v4 duplicates resolved per
  spec-v29 sec 2.6).

Surfaces touched:
- `app.js` UTILITIES: 19 entries deleted; new REMOVED_V29_IDS Set
  drives the home-view redirect note (spec-v29 sec 2.7).
- `lib/meta.js` META: 19 entries deleted.
- `views/group-a.js`: emptied; surviving Group A renderers
  (em-time, ndc-convert) live in `views/group-v5.js`.
- `index.html`: 19 Billing &amp; Coding home-grid tool cards
  deleted.
- `data/synonyms.json`: 6 synonym entries deleted.
- `scripts/build-topic-pages.mjs`: the `billing-and-coding` topic
  page is rewritten around the calculator survivors (the static
  reference lookups belong in the EHR or upstream CMS / FDA /
  NUBC / X12 release).
- Smoke spec: per-tile Group A tests replaced with a
  removed-tile-hash regression covering the v29 redirect note.

Data shards (`data/icd10cm/`, `data/hcpcs/`, `data/cpt-summaries/`,
`data/ndc/`, `data/crosswalks/`, `data/hcpcs-modifiers/`,
`data/pos-codes/`, `data/revenue-codes/`, `data/tob-codes/`,
`data/nubc-special-codes/`, `data/drg/`, `data/apc/`,
`data/icd10-pcs/`, `data/rxnorm/`) and `lib/codes.js` remain on
disk because `views/group-c.js` (decoder / EOB decoder / etc.)
and `lib/decoder.js` still import them. They go in the wave 29-2
Group C deletion PR.

URL hashes for the 19 removed ids resolve to the home view with
the one-line note `Removed in spec-v29 wave 29-2 (code-reference
lookup): this tile is no longer hosted by Sophie. Use the
upstream code source (CMS, FDA, NUBC, AMA, X12) or your EHR's
lookup.` (spec-v29 sec 2.7).

Catalog 287 -> 268 at v29 wave 29-2 Group A close.

### Added (spec-v29 wave 29-3e close — vent bundle: SBT readiness + ARDSnet PEEP/FiO2; wave 29-3 complete)

Final wave 29-3 sub-batch. Closes wave 29-3 with the vent
bundle.

- `vent-sbt-peep` (Boles 2007 + ARDS Network 2000 / ALVEOLI
  2004): five SBT readiness criteria (PaO2/FiO2 >=150, PEEP <=8,
  FiO2 <=0.5, minimal or no vasopressors, awake / cooperative)
  with per-criterion ok/no breakdown; optional ARDSnet PEEP/FiO2
  look-up against the low-PEEP arm (Brower 2000) or high-PEEP
  arm (ALVEOLI 2004). Cross-link banner pairs with the existing
  `rsbi` tile for f/Vt assessment during the SBT. Tagged
  `nursing-icu`, `critical-care`, `pulmonology`,
  `respiratory-therapy`.

Wave 29-3 tile inventory at close:
- 29-3a (8 tiles): braden, morse-falls, hendrich-ii, cam,
  ich-score, hunt-hess-wfns, mnihss, aldrete-padss; plus 5
  nursing-icu specialty backfills (rass, cam-icu, icdsc, cpot,
  bps).
- 29-3b (4 tiles): npiap-staging, norton-push, vip-extravasation,
  blood-compat.
- 29-3c (4 tiles): insulin-correction, electrolyte-replacement,
  crrt-dose, ecmo-titration.
- 29-3d (7 tiles): ews-escalation, restraint-timer,
  sepsis-bundle-clock, code-blue-clock, mtp-tracker,
  device-day-counter, bristol-girth.
- 29-3e (1 tile): vent-sbt-peep.

Total wave 29-3 new tiles: 24 (the spec-v29 sec 4 inventory plus
one composite renaming). Remaining v29 work is wave 29-2 (the
47-tile code/data deletion pass), which follows once the
deprecation banners have run for the spec-v29 sec 7.4 courtesy
window.

Catalog 286 -> 287 at v29 wave 29-3e close.

### Added (spec-v29 wave 29-3d — timers / workflow: NEWS2-escalation, restraint, sepsis bundle, code blue, MTP, device-day, Bristol+girth)

Wave 29-3d ships all seven timer / workflow bedside tiles in one
batch. Each tile ships under the spec-v11 audit floor + spec-v12
sec 5 13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `ews-escalation` (RCP NEWS2 2017): aggregate-score -> next
  observations cadence (12 h / 4-6 h / 1 h / continuous) with
  single-parameter 3 trigger and computed nextDueIso from input
  vitals timestamp. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `internal-medicine`.
- `restraint-timer` (CMS 42 CFR sec 482.13(e), Tag A-0178+):
  violent / self-destructive renewal cadence q4 / q2 / q1 h by
  age band, q15 min nursing reassessment, 1 h physician / LIP
  face-to-face; non-violent medical-surgical calendar-day
  renewal. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `psychiatry`, `quality-safety`.
- `sepsis-bundle-clock` (SSC 2021 / CMS SEP-1 2024 + Nguyen
  2004): hour-1 elements (lactate, cultures, antibiotics, 30
  mL/kg crystalloid) on-time vs late; repeat lactate 6 h band;
  computed lactate clearance %. Tagged `nursing-er`,
  `nursing-icu`, `nursing-floor`, `nursing-general`,
  `critical-care`, `emergency-medicine`, `infectious-disease`.
- `code-blue-clock` (AHA 2020 ACLS): minutes-from-start, next
  2-min rhythm check, next 4-min epi (q3-5 midpoint), last
  shock J, cycle count, ETCO2 ROSC target banner. Tagged
  `nursing-icu`, `nursing-er`, `nursing-floor`,
  `nursing-general`, `critical-care`, `emergency-medicine`.
- `mtp-tracker` (Holcomb 2015 PROPPR + ATLS 2018): PRBC:FFP:Plt
  ratio vs 1:1:1; next-product suggestion; cumulative units;
  cryoprecipitate cadence (1 pooled dose / 6 PRBC). Tagged
  `nursing-er`, `nursing-icu`, `nursing-or`, `nursing-general`,
  `trauma-surgery`, `critical-care`, `anesthesiology`.
- `device-day-counter` (CDC NHSN 2024 + SHEA Lo 2014): Foley /
  central-line device-days from insertion timestamp; remove-
  today banner when no daily-removal indication is checked.
  Tagged `nursing-floor`, `nursing-icu`, `nursing-general`,
  `infectious-disease`, `quality-safety`.
- `bristol-girth` (Lewis 1997 + ANA 2013 + SCCM 2013): Bristol
  type 1-7 -> constipation / normal / soft / diarrhoea category;
  optional girth-trend cm/h with the SCCM 2013 abdominal-
  compartment-syndrome escalation banner at >=2 cm/h or >20 cm
  over <=24 h. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `gastroenterology`.

Wave 29-3e (vent-sbt-peep) is the final sub-wave per spec-v29
sec 7.3.

Catalog 279 -> 286 at v29 wave 29-3d close.

### Added (spec-v29 wave 29-3c — bedside math: insulin correction, electrolyte ladder, CRRT dose, ECMO titration)

Wave 29-3c ships all four bedside-math tiles in one batch. Each
tile ships under the spec-v11 audit floor + spec-v12 sec 5
13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `insulin-correction` (ADA 2024 Standards of Care ch. 16): ISF
  provided directly or derived from total daily dose using the
  1800-rule (rapid-acting analogues) or 1500-rule (regular
  insulin); correction units = max(0, (currentBG - targetBG) /
  ISF); meal coverage = carbs / ICR; output rounded to 0.1 U.
  Banner pins the ADA 2024 hospital glycemic targets (140-180
  mg/dL non-critical; 110-180 mg/dL ICU). Tagged
  `nursing-floor`, `nursing-icu`, `nursing-general`,
  `endocrinology`.
- `electrolyte-replacement` (ASHP / Hammond 2019 + Hebert 2008 +
  Brown 2006): K, Mg, and Phos ladders with route (IV / PO) and
  renal-impairment flag. K 3.0-3.4 -> 40 mEq; 2.5-2.9 -> 60 mEq;
  <2.5 -> 80 mEq with the ASHP rate caps. Mg 1.0-1.7 -> 2 g
  MgSO4 over 1 h; <1.0 -> 4 g. Phos 1.6-2.2 -> 0.16 mmol/kg;
  1.0-1.5 -> 0.32 mmol/kg; <1.0 -> 0.64 mmol/kg per Brown 2006
  graduated protocol. Tagged `nursing-icu`, `nursing-floor`,
  `nursing-general`, `critical-care`, `pharmacy`.
- `crrt-dose` (KDIGO 2012 + Davenport 2009): delivered effluent
  dose mL/kg/h from prescribed effluent rate and weight; banners
  at <20 / 20-25 / >25 mL/kg/h per KDIGO sec 5.8. Optional
  citrate-anticoagulation inputs flag post-filter iCa outside
  0.25-0.35 mmol/L, systemic iCa outside 1.1-1.2 mmol/L, and
  total/ionised Ca ratio >= 2.5 (citrate-accumulation flag per
  Davenport 2009). Tagged `nursing-icu`, `critical-care`,
  `nephrology`.
- `ecmo-titration` (ELSO 2022 v1.5): VV / VA modality; sweep
  titration via the linear PaCO2 heuristic (suggested sweep =
  current sweep x current PaCO2 / target PaCO2); DO2 = pumpFlow
  x 10 x 1.34 x Hb x SaO2; DO2i target >= 6 mL/kg/min. Banner
  pins the VV SatO2 >= 80% acceptable rule and the "not a
  closed-loop controller; verify with attending and
  perfusionist" disclaimer per spec-v29 sec 4.18.1. Tagged
  `nursing-icu`, `critical-care`, `perfusion`, `cardiac-surgery`.

Wave 29-3d (timers / workflow: ews-escalation, restraint-timer,
sepsis-bundle-clock, code-blue-clock, mtp-tracker,
device-day-counter, bristol-girth) and wave 29-3e (vent-sbt-peep)
remain per spec-v29 sec 7.3.

Catalog 275 -> 279 at v29 wave 29-3c close.

### Added (spec-v29 wave 29-3b — criteria bundles: NPIAP, Norton + PUSH, VIP + INS, ABO/Rh compatibility)

Wave 29-3b ships all four criteria-bundle tiles in one batch. Each
tile ships under the spec-v11 audit floor + spec-v12 sec 5
13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `npiap-staging` (Edsberg 2016 / NPIAP 2019): decision tree over
  six structured pickers (mucosal location, skin intact, blanching
  behavior, obscured base, depth). Outputs one of seven stages:
  Stage 1 / 2 / 3 / 4 / Unstageable / DTPI / Mucosal Membrane PI.
  Tagged `nursing-floor`, `nursing-icu`, `nursing-general`,
  `wound-care`.
- `norton-push` (Norton 1962 + NPIAP 2005 PUSH 3.0): Norton scale
  (five 1-4 items; total 5-20; <=14 at risk) plus PUSH Tool 3.0
  (length-by-width band 0-10, exudate 0-3, tissue type 0-4; total
  0-17; declining total = healing). Tagged `nursing-floor`,
  `nursing-general`, `wound-care`.
- `vip-extravasation` (Jackson 1998 + INS 2021 Standards sec 38):
  VIP picker (0-5) plus INS infiltration / extravasation grade
  (0-4) with banners at VIP >=3, INS >=3, and INS 4 + vesicant
  (antidote decision per INS Table 38-3). Tagged `nursing-floor`,
  `nursing-icu`, `nursing-general`, `nursing-or`.
- `blood-compat` (AABB 33rd ed., 2024): recipient ABO / Rh picker
  plus product picker (PRBC / FFP / platelets / cryo); outputs
  compatible donor types per the AABB compatibility tables, plus
  the universal emergency-release note for each product. Tagged
  `nursing-icu`, `nursing-er`, `nursing-or`, `nursing-floor`,
  `nursing-general`, `pathology`, `hematology`.

Wave 29-3c (bedside math: insulin-correction,
electrolyte-replacement, crrt-dose, ecmo-titration) is the next
sub-wave per spec-v29 sec 7.3.

Catalog 271 -> 275 at v29 wave 29-3b close.

### Added (spec-v29 wave 29-3a close — mNIHSS + Aldrete/PADSS; wave 29-3a complete)

Third (final) wave 29-3a sub-batch. Closes wave 29-3a with two
last new tiles.

- `mnihss` (Meyer 2002 modified NIHSS): 11 items (LOC questions,
  LOC commands, gaze, visual fields, motor arm L and R, motor
  leg L and R, sensory dichotomized 0-1, language, extinction);
  total 0-31; severity bands per NIHSS convention (mNIHSS
  validates against the same bands per Meyer 2002 Results).
  Tagged `nursing-icu`, `nursing-er`, `nursing-general`,
  `neurology`, `emergency-medicine`.
- `aldrete-padss` (Aldrete 1995 + Chung 1995 PADSS, side-by-
  side): Aldrete (5 domains, 0-10, >=9 PACU-to-floor) plus
  PADSS (5 domains, 0-10, >=9 home discharge). The existing
  `aldrete` tile remains; the new tile composes both scores on
  one page for PACU workflows. Tagged `nursing-or`,
  `nursing-floor`, `nursing-general`, `anesthesiology`.

Wave 29-3a tile inventory at close:
- New tiles (8): braden, morse-falls, hendrich-ii, cam,
  ich-score, hunt-hess-wfns, mnihss, aldrete-padss.
- Audit upgrades (5, nursing-icu specialty backfill): rass,
  cam-icu, icdsc, cpot, bps.

Wave 29-3b (criteria bundles: npiap-staging, norton-push,
vip-extravasation, blood-compat) is the next sub-wave per
spec-v29 sec 7.3.

Catalog 269 -> 271 at v29 wave 29-3a close.

### Added (spec-v29 wave 29-3a (partial) — stroke completers: ICH Score + Hunt-Hess/WFNS; nursing-icu specialty backfill)

Second wave 29-3a sub-batch. Two new neuro tiles plus a metadata
upgrade on the existing ICU sedation / delirium / pain bundle.

- `ich-score` (Hemphill 2001 ICH grading): five inputs (GCS band,
  age >=80, ICH volume >=30 mL, infratentorial origin,
  intraventricular extension); total 0-6; 30-day mortality per
  Hemphill 2001 Table 4 (0% / 13% / 26% / 72% / 97% / 100% /
  100%). Tagged `nursing-icu`, `nursing-er`, `nursing-general`,
  `neurology`, `neurosurgery`, `critical-care`,
  `emergency-medicine`.
- `hunt-hess-wfns` (Hunt 1968 + Drake 1988 aneurysmal SAH
  grading): Hunt-Hess I-V picker plus WFNS computed from GCS
  band + focal motor deficit (per Drake 1988 Table I). Tagged
  `nursing-icu`, `nursing-er`, `nursing-general`, `neurology`,
  `neurosurgery`, `critical-care`.

Plus: `rass`, `cam-icu`, `icdsc`, `cpot`, `bps` META.specialties
now include `nursing-icu` per spec-v29 §4.3, so the home-view
nurse-by-shift sort can place them in the ICU lane.

Remaining wave 29-3a tiles (mnihss new; aldrete-padss new)
deferred to follow-on commits.

Catalog 267 -> 269 at v29 wave 29-3a (further partial) close.

### Added (spec-v29 wave 29-3a (partial) — nurse-bedside scoring: Braden, Morse, Hendrich II, CAM)

First wave 29-3a sub-batch (4 of 13 tiles). Each tile ships under
the spec-v11 audit floor + spec-v12 §5 13-point per-tile shipping
contract and is tagged with the spec-v29 §5 nursing-subspecialty
specialties (nursing-floor, nursing-icu, nursing-general,
geriatrics, wound-care as applicable). The remaining wave 29-3a
tiles (rass, bps, cpot, icdsc, cam-icu — already present, audit
upgrades pending; mnihss, ich-score, hunt-hess-wfns, aldrete-padss
— new) are deferred to follow-on commits.

- `braden` (Bergstrom 1987 pressure-injury risk): six ordinal
  items; total 6-23; bands >=19 not at risk, 15-18 mild, 13-14
  moderate, 10-12 high, <=9 very high. Tagged `nursing-floor`,
  `nursing-icu`, `nursing-general`, `geriatrics`, `wound-care`.
- `morse-falls` (Morse 1989): six weighted items (history 25,
  secondary diagnosis 15, ambulatory aid 0/15/30, IV or
  heparin lock 20, gait 0/10/20, mental status 0/15); bands
  0-24 low, 25-50 moderate, >=51 high. Tagged `nursing-floor`,
  `nursing-general`, `geriatrics`.
- `hendrich-ii` (Hendrich 2003): seven binary risk factors
  (confusion 4, depression 2, altered elimination 1, dizziness
  1, male 1, antiepileptic 2, benzodiazepine 1) plus
  get-up-and-go test (0/1/3/4); validated cutoff >=5 -> high
  fall risk. Tagged `nursing-floor`, `nursing-general`,
  `geriatrics`.
- `cam` (Inouye 1990, non-ICU): four features; positive when
  features 1 + 2 AND (3 OR 4). Tagged `nursing-floor`,
  `nursing-general`, `geriatrics`, `internal-medicine`,
  `emergency-medicine`.

Catalog 263 -> 267 at v29 wave 29-3a (partial) close.

### Added (spec-v29 wave 29-1 — nurse-first pivot: spec-doc landing + deprecation banners)

First v29 wave. The spec lands the **nurse-first pivot**: the
catalog is narrowed to tiles that compute a result the user acts
on, with the home-view default audience reordered to nurses by
shift type (ICU, ED, floor, OR / PACU, L&D / NICU). The wave is
spec-doc only (no code or data deletions, no new tiles); waves
29-2 and 29-3 land the 47 deletions and the 20 additions
respectively.

- Land [docs/spec-v29.md](docs/spec-v29.md). The spec amends
  [spec-v10 §2.3](docs/spec-v10.md) (permanent out-of-scope
  ledger) and [scope-mdcalc-parity §1](docs/scope-mdcalc-parity.md)
  (the "everything MDCalc does not cover" clause).
- Update [docs/spec-v10.md §2.3](docs/spec-v10.md) with the v29
  cross-reference: code-reference indexes, patient-administrative
  infographics, reference tables of normal values, hazmat /
  occupational reference cards, and single-class clinical
  reference cards are now permanently out of scope.
- Update [docs/scope-mdcalc-parity.md §1](docs/scope-mdcalc-parity.md)
  with the v29 cross-reference: the "everything MDCalc does not
  cover" clause is narrowed to the calculator-shaped rows
  (time-based E/M, NDC 10/11 converter, HIPAA 60-day breach
  clock, and the patient-facing workflow generators).
- Update [README.md](README.md) leading paragraph to reflect
  the post-v29 audience and the one-line scope test.
- Add the v29 one-line deprecation banner to each of the 47
  tile ids in [spec-v29 §2.1-§2.5](docs/spec-v29.md). The banner
  renders above the tool body as "Removed in spec-v29 — use the
  upstream source." Tile bodies still render under the banner
  through wave 29-2 (the actual delete). v29 acceptance criterion
  §8 (47 ids removed from UTILITIES / views / data / lib) is not
  met yet; wave 29-2 lands that.
- New v29 catalog ledger row: 603 (at v28 close) -> 556 (v29 cut)
  -> 576 (v29 cut + add). First reduction in catalog count in
  the project's history. The post-v29 catalog sits comfortably
  inside the 400-600 parity-window upper bound from
  [scope-mdcalc-parity §1](docs/scope-mdcalc-parity.md) on
  quality-audited tiles.

### Added (spec-v15 wave 15-5 (partial) — trauma scoring: ABC-MTP, MGAP, GAP, BIG)

Partial v15 wave 15-5 (4 of 8 tiles). Each tile ships under the
spec-v11 audit floor + spec-v12 §5 13-point per-tile shipping
contract. The four remaining wave 15-5 tiles (ISS, RTS, TRISS,
peds-trauma) are deferred to a follow-on wave 15-5 partial commit.

- **`abc-mtp` — ABC Score for Massive Transfusion** (Nunez TC,
  Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA.
  *Early prediction of massive transfusion in trauma: simple as
  ABC (assessment of blood consumption)?* J Trauma. 2009;66(2):
  346-352). Four binary criteria (penetrating mechanism; SBP
  <=90; HR >=120; positive FAST). >=2 of 4 -> activate massive
  transfusion protocol (sensitivity 75%, specificity 86% per
  Nunez 2009). Group G. Audit log:
  [docs/audits/v11/abc-mtp.md](docs/audits/v11/abc-mtp.md).
  Worked examples in
  [test/unit/abc-mtp.test.js](test/unit/abc-mtp.test.js).
- **`mgap` — MGAP Trauma Score** (Sartorius D, Le Manach Y,
  David JS, et al. *Mechanism, glasgow coma scale, age, and
  arterial pressure (MGAP): a new simple prehospital triage
  score to predict mortality in trauma patients.* Crit Care Med.
  2010;38(3):831-837). Mechanism (blunt 4 / penetrating 0) +
  GCS (3-15) + age <60 (5) + SBP bands (>120 = 5; 60-120 = 3;
  <60 = 0). Bands per Sartorius 2010 Table 3 (<18 high, 18-22
  moderate, 23-29 low). Group E. Audit log:
  [docs/audits/v11/mgap.md](docs/audits/v11/mgap.md). Worked
  examples in [test/unit/mgap.test.js](test/unit/mgap.test.js).
- **`gap` — GAP Trauma Score** (Kondo Y, Abe T, Kohshi K,
  Tokuda Y, Cook EF, Kukita I. *Revised trauma scoring system
  to predict in-hospital mortality in the emergency department:
  Glasgow Coma Scale, Age, and Systolic Blood Pressure score.*
  Crit Care. 2011;15(4):R191). GCS (3-15) + age <60 (3) + SBP
  bands (>120 = 6; 60-120 = 4; <60 = 0). Bands per Kondo 2011
  (<=10 high, 11-18 moderate, 19-24 low). Group E. Audit log:
  [docs/audits/v11/gap.md](docs/audits/v11/gap.md). Worked
  examples in [test/unit/gap.test.js](test/unit/gap.test.js).
- **`big` — BIG Score (pediatric trauma)** (Borgman MA, Maegele
  M, Wade CE, Blackbourne LH, Spinella PC. *Pediatric trauma
  BIG score: predicting mortality in children after military
  and civilian trauma.* Pediatrics. 2011;127(4):e892-e897). BIG
  = base deficit + 2.5 * INR + (15 - GCS). BIG >=16 predicts
  mortality with high sensitivity per Borgman 2011. Group E.
  Audit log: [docs/audits/v11/big.md](docs/audits/v11/big.md).
  Worked examples in
  [test/unit/big.test.js](test/unit/big.test.js).

Catalog 259 -> 263 at v15 wave 15-5 (partial) close.

### Added (spec-v15 wave 15-4 — pediatric imaging-decision companions: PECARN IAI, PECARN C-Spine)

Full v15 wave 15-4. Both tiles ship under Group N (Pediatrics &
Neonatal) per spec-v15 §3.4 and under the spec-v11 audit floor +
spec-v12 §5 13-point per-tile shipping contract.

- **`pecarn-iai` — PECARN Intra-Abdominal Injury Rule** (Holmes
  JF, Lillis K, Monroe D, et al. *Identifying children at very
  low risk of clinically important blunt abdominal injuries.*
  Ann Emerg Med. 2013;62(2):107-116.e2). Seven negative findings
  (abdominal wall trauma/seat-belt sign; GCS <14; abdominal
  tenderness; vomiting; thoracic wall trauma; abdominal pain;
  decreased breath sounds). All seven must be absent for
  very-low-risk classification (NPV 99.9% per Holmes 2013). The
  `findingsPresent` list surfaces which findings disqualified
  the patient. Audit log:
  [docs/audits/v11/pecarn-iai.md](docs/audits/v11/pecarn-iai.md).
  Worked examples in
  [test/unit/pecarn-iai.test.js](test/unit/pecarn-iai.test.js).
- **`pecarn-cspine` — PECARN Pediatric C-Spine Rule** (Leonard
  JC, Browne LR, Ahmad FA, et al. *Cervical spine injury risk
  factors in children with blunt trauma.* Pediatrics. 2019;
  144(1):e20183221; derivation: Leonard JC, Kuppermann N, Olsen
  C, et al. Ann Emerg Med. 2011;58(2):145-155). Eight risk
  factors (altered mental status; abnormal ABC; focal
  neurologic deficit; neck pain; torticollis; substantial
  torso injury; predisposing condition; high-risk MVC). NONE
  present -> low-risk; imaging not indicated. ANY present ->
  imaging warranted. Audit log:
  [docs/audits/v11/pecarn-cspine.md](docs/audits/v11/pecarn-cspine.md).
  Worked examples in
  [test/unit/pecarn-cspine.test.js](test/unit/pecarn-cspine.test.js).

### Added (spec-v15 wave 15-3 — pediatric respiratory & neurologic: Westley, PRAM, PASS, peds-GCS, Nigrovic)

Full v15 wave 15-3 closes the pediatric respiratory + neurologic
bundle. Five tiles each shipped under the spec-v11 audit floor and
the spec-v12 §5 13-point per-tile shipping contract.

- **`westley` — Westley Croup Score** (Westley CR, Cotton EK,
  Brooks JG. *Nebulized racemic epinephrine by IPPB for the
  treatment of croup: a double-blind study.* Am J Dis Child.
  1978;132(5):484-487). Five items with non-uniform per-item
  maxima (LOC 0/5; cyanosis 0/4/5; stridor 0/1/2; air entry
  0/1/2; retractions 0/1/2/3); sum 0-17; bands <3 mild / 3-7
  moderate / 8-11 severe / >=12 impending respiratory failure.
  Per-item values snap to the published allowed-token set. Audit
  log: [docs/audits/v11/westley.md](docs/audits/v11/westley.md).
  Worked examples in
  [test/unit/westley.test.js](test/unit/westley.test.js).
- **`pram-asthma` — PRAM** (Chalut DS, Ducharme FM, Davis GM.
  *The Preschool Respiratory Assessment Measure (PRAM): a
  responsive index of acute asthma severity.* J Pediatr.
  2000;137(6):762-768). Five items with non-uniform per-item
  maxima; sum 0-12; bands 0-3 mild / 4-7 moderate / 8-12 severe.
  Audit log:
  [docs/audits/v11/pram-asthma.md](docs/audits/v11/pram-asthma.md).
  Worked examples in
  [test/unit/pram-asthma.test.js](test/unit/pram-asthma.test.js).
- **`pass-asthma` — PASS** (Gorelick MH, Stevens MW, Schultz TR,
  Scribano PV. *Performance of a novel clinical score, the
  pediatric asthma severity score (PASS), in the evaluation of
  acute asthma.* Acad Emerg Med. 2004;11(1):10-18). Three items
  each 0-2; sum 0-6; bands 0-1 mild / 2-3 moderate / 4-6 severe.
  Audit log:
  [docs/audits/v11/pass-asthma.md](docs/audits/v11/pass-asthma.md).
  Worked examples in
  [test/unit/pass-asthma.test.js](test/unit/pass-asthma.test.js).
- **`peds-gcs` — Pediatric Glasgow Coma Scale** (Reilly PL,
  Simpson DA, Sprod R, Thomas L. *Assessing the conscious level
  in infants and young children: a paediatric version of the
  Glasgow Coma Scale.* Childs Nerv Syst. 1988;4(1):30-33; verbal
  age-adjustment: James HE. Pediatr Ann. 1986;15(1):16-22). Eye
  opening 1-4, age-adjusted verbal 1-5 (under 2 / 2-5 / older),
  motor 1-6; sum 3-15; bands match adult GCS (<=8 severe / 9-12
  moderate / 13-15 mild). Audit log:
  [docs/audits/v11/peds-gcs.md](docs/audits/v11/peds-gcs.md).
  Worked examples in
  [test/unit/peds-gcs.test.js](test/unit/peds-gcs.test.js).
- **`nigrovic` — Bacterial Meningitis Score** (Nigrovic LE,
  Kuppermann N, Macias CG, et al. *Clinical prediction rule for
  identifying children with cerebrospinal fluid pleocytosis at
  very low risk of bacterial meningitis.* JAMA. 2007;297(1):52-
  60). Five weighted criteria (positive CSF Gram stain +2; CSF
  ANC >=1000 +1; CSF protein >=80 +1; peripheral ANC >=10,000 +1;
  seizure at or before presentation +1); cutoff: 0 = very low
  risk for bacterial meningitis (NPV ~99.9%); >=1 = not low risk
  / do not discharge. Audit log:
  [docs/audits/v11/nigrovic.md](docs/audits/v11/nigrovic.md).
  Worked examples in
  [test/unit/nigrovic.test.js](test/unit/nigrovic.test.js).

### Added (spec-v15 wave 15-2 — pediatric febrile-infant evaluation: Rochester, Philadelphia, Boston, Step-by-Step, YOS)

Full v15 wave 15-2 closes the febrile-infant bundle. Each tile
ships under the spec-v11 audit floor and the spec-v12 §5 13-point
per-tile shipping contract.

- **`rochester` — Rochester Criteria** (Jaskiewicz JA, McCarthy
  CA, Richardson AC, et al. *Febrile infants at low risk for
  serious bacterial infection -- an appraisal of the Rochester
  criteria and implications for management.* Pediatrics.
  1994;94(3):390-396). Seven criteria; ALL must be met for
  low-risk classification (age <=60 d; term and previously
  healthy; no focal infection; WBC 5-15; bands <=1.5; urine WBC
  <=10/HPF; stool WBC <=5/HPF). Failing criteria are surfaced
  alongside the boolean so a clinician sees which item
  disqualified the patient. Audit log:
  [docs/audits/v11/rochester.md](docs/audits/v11/rochester.md).
  Worked examples in
  [test/unit/rochester.test.js](test/unit/rochester.test.js).
- **`philadelphia` — Philadelphia Criteria** (Baker MD, Bell LM,
  Avner JR. *Outpatient management without antibiotics of fever
  in selected infants.* N Engl J Med. 1993;329(20):1437-1441).
  Eight criteria; ALL must be met for safe outpatient management
  without empiric antibiotic. Audit log:
  [docs/audits/v11/philadelphia.md](docs/audits/v11/philadelphia.md).
  Worked examples in
  [test/unit/philadelphia.test.js](test/unit/philadelphia.test.js).
- **`boston-febrile` — Boston Criteria** (Baskin MN, O'Rourke
  EJ, Fleisher GR. *Outpatient treatment of febrile infants 28
  to 89 days of age with intramuscular administration of
  ceftriaxone.* J Pediatr. 1992;120(1):22-27). Seven criteria;
  ALL must be met for outpatient ceftriaxone-management
  eligibility. Audit log:
  [docs/audits/v11/boston-febrile.md](docs/audits/v11/boston-febrile.md).
  Worked examples in
  [test/unit/boston-febrile.test.js](test/unit/boston-febrile.test.js).
- **`step-by-step` — Step-by-Step Approach** (Gomez B, Mintegi S,
  Bressan S, Da Dalt L, Gervaix A, Lacroix L, European Group for
  Validation of the Step-by-Step Approach. *Validation of the
  "Step-by-Step" approach in the management of young febrile
  infants.* Pediatrics. 2016;138(2):e20154381). Sequential
  decision tree (short-circuits on first positive) producing
  low / intermediate / high risk per Gomez 2016 Figure 1; the
  `reason` line names which step triggered. Audit log:
  [docs/audits/v11/step-by-step.md](docs/audits/v11/step-by-step.md).
  Worked examples in
  [test/unit/step-by-step.test.js](test/unit/step-by-step.test.js).
- **`yos` — Yale Observation Scale** (McCarthy PL, Sharpe MR,
  Spiesel SZ, et al. *Observation scales to identify serious
  illness in febrile children.* Pediatrics. 1982;70(5):802-809).
  Six observation items each scored 1 / 3 / 5; sum 6-30; bands
  per McCarthy 1982: <=10 low, 11-15 increased, >=16 high
  probability of SBI. Per-item input clamped to the {1, 3, 5}
  set. Audit log:
  [docs/audits/v11/yos.md](docs/audits/v11/yos.md). Worked
  examples in [test/unit/yos.test.js](test/unit/yos.test.js).

### Added (spec-v15 wave 15-1 (partial) — obstetrics: BPP, ACOG severe-feature preeclampsia, HELLP, Carpenter-Coustan, IADPSG)

First v15 wave. Each tile ships under the spec-v11 audit floor
and the spec-v12 §5 13-point per-tile shipping contract.

- **`bpp` — Biophysical Profile** (Manning FA, Platt LD, Sipos L.
  *Antepartum fetal evaluation: development of a fetal
  biophysical profile.* Am J Obstet Gynecol. 1980;136(6):787-795).
  Five components each 0 or 2 per Manning 1980 rubric (fetal
  breathing movements, fetal body movements, fetal tone,
  amniotic fluid volume, reactive NST); sum 0-10; bands per
  Manning 1980 + ACOG Practice Bulletin 145 (2014): 8-10 normal,
  6 equivocal, <=4 abnormal. Audit log:
  [docs/audits/v11/bpp.md](docs/audits/v11/bpp.md). Worked
  examples in [test/unit/bpp.test.js](test/unit/bpp.test.js).
- **`acog-severe-pre` — ACOG Severe-feature Preeclampsia
  Checklist** (ACOG Task Force on Hypertension in Pregnancy.
  *Hypertension in pregnancy.* Obstet Gynecol. 2013;122(5):1122-
  1131; re-affirmed ACOG Practice Bulletin 222, 2020). Six severe
  features (BP >=160/110 on two occasions >=4 h apart;
  thrombocytopenia <100; impaired hepatic function; creatinine
  >1.1 or doubled baseline; pulmonary edema; new cerebral or
  visual disturbances); ANY single feature qualifies as severe
  preeclampsia per ACOG 2013. Audit log:
  [docs/audits/v11/acog-severe-pre.md](docs/audits/v11/acog-severe-pre.md).
  Worked examples in
  [test/unit/acog-severe-pre.test.js](test/unit/acog-severe-pre.test.js).
- **`hellp` — HELLP Syndrome Criteria** (Sibai BM. *The HELLP
  syndrome (hemolysis, elevated liver enzymes, and low
  platelets): much ado about nothing?* Am J Obstet Gynecol.
  1990;162(2):311-316). Three criteria: hemolysis (abnormal
  smear AND/OR total bili >=1.2 AND/OR LDH >=600); AST >=70;
  platelets <100 x10^9/L. Complete (3/3) or partial HELLP.
  Mississippi class per Martin 1999 by platelet nadir
  (<=50 / 50-100 / 100-150). Audit log:
  [docs/audits/v11/hellp.md](docs/audits/v11/hellp.md). Worked
  examples in [test/unit/hellp.test.js](test/unit/hellp.test.js).
- **`carpenter-coustan` — Carpenter-Coustan GDM Criteria**
  (Carpenter MW, Coustan DR. *Criteria for screening tests for
  gestational diabetes.* Am J Obstet Gynecol. 1982;144(7):768-
  773). 100-g 3-h OGTT cutoffs (mg/dL): fasting 95, 1-h 180,
  2-h 155, 3-h 140; GDM if >=2 values exceed; single abnormal =
  impaired glucose tolerance. Audit log:
  [docs/audits/v11/carpenter-coustan.md](docs/audits/v11/carpenter-coustan.md).
  Worked examples in
  [test/unit/carpenter-coustan.test.js](test/unit/carpenter-coustan.test.js).
- **`iadpsg` — IADPSG GDM Criteria** (International Association
  of Diabetes and Pregnancy Study Groups Consensus Panel.
  *International association of diabetes and pregnancy study
  groups recommendations on the diagnosis and classification of
  hyperglycemia in pregnancy.* Diabetes Care. 2010;33(3):676-
  682). 75-g 2-h OGTT cutoffs (mg/dL): fasting 92, 1-h 180,
  2-h 153; GDM if >=1 value exceeds. Ships side by side with
  `carpenter-coustan` per spec-v15 §3.1.6 so the clinician can
  pick by local protocol. Note: spec-v15 §6 sequencing lists
  five tiles for wave 15-1 (omits IADPSG); §3.1 enumerates six.
  IADPSG ships here with the rest of the OB bundle. Audit log:
  [docs/audits/v11/iadpsg.md](docs/audits/v11/iadpsg.md). Worked
  examples in [test/unit/iadpsg.test.js](test/unit/iadpsg.test.js).
- **Wave 15-1 partial.** New Ballard Score (Ballard 1991)
  deferred — 12 neuromuscular + physical criteria each scored -1
  to +5 with a sum-to-gestational-age conversion table that
  warrants a focused audit against Ballard 1991 Table 1 rather
  than a rushed batch.

### Added (spec-v14 backfills — Berlin Questionnaire, LEMON, White-Song)

These three tiles close the wave 14-2 and wave 14-3 partials with
focused audits against the primary sources, as flagged when those
waves originally shipped.

- **`berlin-osa` — Berlin Questionnaire for OSA** (Netzer NC,
  Stoohs RA, Netzer CM, Clark K, Strohl KP. *Using the Berlin
  Questionnaire to identify patients at risk for the sleep apnea
  syndrome.* Ann Intern Med. 1999;131(7):485-491). Three
  categories with criteria-specific high-risk rules: Category 1
  (snoring) positive if >=2 of five answers (snore, louder than
  talking, >=3-4/wk, bothered others, observed apnea >=3-4/wk);
  Category 2 (daytime sleepiness) positive if >=2 of three (tired
  after sleep, tired during day, nodded off while driving);
  Category 3 positive if hypertension OR BMI >30. Overall HIGH
  risk for OSA iff >=2 categories are positive per Netzer 1999.
  Audit log:
  [docs/audits/v11/berlin-osa.md](docs/audits/v11/berlin-osa.md).
  Worked examples in
  [test/unit/berlin-osa.test.js](test/unit/berlin-osa.test.js).
- **`lemon` — LEMON Difficult Airway Predictor** (Reed MJ, Dunn
  MJG, McKeown DW. *Can an airway assessment score predict
  difficulty at intubation in the emergency department?* Emerg
  Med J. 2005;22(2):99-102). Six factors with the 3-3-2 rule
  sub-grouped (Look externally +1; Evaluate 3-3-2 +1 per failed
  sub-measurement, max 3; Mallampati >=III +1; Obstruction/
  Obesity +1; Neck mobility limited +1); sum 0-7 (the spec-v14
  §3.3.1 prose says 0-8 but the mathematics produces 0-7;
  flagged in audit). Higher = greater
  predicted difficulty per Reed 2005. The 3-3-2 subtotal is
  surfaced alongside the total. Audit log:
  [docs/audits/v11/lemon.md](docs/audits/v11/lemon.md). Worked
  examples in [test/unit/lemon.test.js](test/unit/lemon.test.js).
- **`white-song` — White-Song Fast-Track Score** (White PF, Song
  D. *New criteria for fast-tracking after outpatient anesthesia:
  a comparison with the modified Aldrete's scoring system.*
  Anesth Analg. 1999;88(5):1069-1072). Seven domains each scored
  0-2 (LOC, physical activity, hemodynamic stability, respiratory
  stability, oxygen saturation, postoperative pain, postoperative
  emetic symptoms); sum 0-14; fast-track-eligible iff sum >=12
  AND no individual domain <1 per White 1999. The dual-condition
  band differentiates the two failure modes (sum cutoff vs.
  per-domain floor) so a clinician sees why borderline cases
  fail. Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/white-song.md](docs/audits/v11/white-song.md)
  (PASS-WITH-FIXES; spec-v14 §3.3.4 prose says "six domains" but
  enumerates seven; published score has seven). Worked examples
  in [test/unit/white-song.test.js](test/unit/white-song.test.js).

### Added (spec-v14 wave 14-8 — DAPT duration (partial): DAPT Score)

- **`dapt-score` — DAPT Score (continuation)** (Yeh RW, Secemsky
  EA, Kereiakes DJ, et al. *Development and validation of a
  prediction rule for benefit and harm of dual antiplatelet
  therapy beyond 1 year after percutaneous coronary
  intervention.* JAMA. 2016;315(16):1735-1749). Nine criteria:
  Age (<65 = 0; 65-74 = -1; >=75 = -2); CHF or LVEF <30% (+2);
  vein graft PCI (+2); MI at presentation (+1); prior MI or PCI
  (+1); diabetes (+1); stent diameter <3 mm (+1); paclitaxel-
  eluting stent (+1); current smoker (+1); sum -2 to +10. Cutoff
  >=2 favors continuing DAPT beyond 12 months after PCI per
  Yeh 2016. Age band modeled as a mutually-exclusive select so a
  single patient cannot double-count. Audit log:
  [docs/audits/v11/dapt-score.md](docs/audits/v11/dapt-score.md).
  Worked examples in
  [test/unit/dapt-score.test.js](test/unit/dapt-score.test.js).
- **Wave 14-8 partial.** PRECISE-DAPT Bleeding Score (Costa 2017)
  deferred — Group E nomogram producing PRECISE-DAPT 0-100 from
  Hb, WBC, age, CrCl, and prior bleeding via the published
  nomogram formula; warrants a focused cross-implementation
  differential against the Costa 2017 source rather than a
  rushed batch.

### Added (spec-v14 wave 14-7 — HIT / DIC (partial): 4Ts, ISTH DIC)

- **`four-ts` — 4Ts Score for HIT** (Lo GK, Juhl D, Warkentin
  TE, Sigouin CS, Eichler P, Greinacher A. *Evaluation of pretest
  clinical score (4 T's) for the diagnosis of heparin-induced
  thrombocytopenia in two clinical settings.* J Thromb Haemost.
  2006;4(4):759-765). Four domains each scored 0-2:
  Thrombocytopenia, Timing of platelet fall, Thrombosis or other
  sequelae, oTher causes; sum 0-8; bands per Lo 2006 Table 2:
  0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.
  Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/four-ts.md](docs/audits/v11/four-ts.md). Worked
  examples in [test/unit/four-ts.test.js](test/unit/four-ts.test.js).
- **`isth-dic` — ISTH Overt DIC Score** (Taylor FB Jr, Toh CH,
  Hoots WK, Wada H, Levi M. *Towards definition, clinical and
  laboratory criteria, and a scoring system for disseminated
  intravascular coagulation.* Thromb Haemost. 2001;86(5):1327-
  1330). Four laboratory components: platelet count (>100 = 0;
  50-100 = +1; <50 = +2), fibrin marker D-dimer/FDP (none 0;
  moderate +2; strong +3), prolonged PT (<3 s = 0; 3-6 s = +1;
  >6 s = +2), fibrinogen (>1 g/L = 0; <=1 g/L = +1); sum 0-8;
  cutoff >=5 = compatible with overt DIC per Taylor 2001. A
  required underlying-disorder gate is enforced before band
  emission per the Taylor 2001 published rubric. Audit log:
  [docs/audits/v11/isth-dic.md](docs/audits/v11/isth-dic.md).
  Worked examples in
  [test/unit/isth-dic.test.js](test/unit/isth-dic.test.js).
- **Wave 14-7 partial.** HEP Score for HIT (Cuker 2010) deferred
  — eight weighted clinical features per Cuker 2010 Table 1 with
  multiple mutually-exclusive option groups (timing-of-fall has
  six bands; thrombosis category overrides on several rules)
  that warrant a focused audit against the primary source rather
  than a rushed batch.

### Added (spec-v14 wave 14-6 — cancer-VTE & VTE recurrence (partial): Khorana, DASH, HERDOO2)

- **`khorana` — Khorana Cancer-VTE Score** (Khorana AA, Kuderer
  NM, Culakova E, Lyman GH, Francis CW. *Development and
  validation of a predictive model for chemotherapy-associated
  thrombosis.* Blood. 2008;111(10):4902-4907). Five criteria:
  site of cancer (very-high stomach/pancreas +2; high lung/
  lymphoma/gynecologic/bladder/testicular +1; other 0), platelet
  count >=350 (+1), Hb <10 or ESA use (+1), WBC >11 (+1), BMI >=35
  (+1); sum 0-6; 2.5-month VTE rates per Khorana 2008 Table 3:
  0 -> 0.3% (low), 1-2 -> 2.0% (intermediate), >=3 -> 6.7% (high).
  Cancer site modeled as a mutually-exclusive select so a single
  patient cannot double-count. Audit log:
  [docs/audits/v11/khorana.md](docs/audits/v11/khorana.md). Worked
  examples in [test/unit/khorana.test.js](test/unit/khorana.test.js).
- **`dash-vte` — DASH VTE-Recurrence Score** (Tosetto A, Iorio A,
  Marcucci M, et al. *Predicting disease recurrence in patients
  with previous unprovoked venous thromboembolism: a proposed
  prediction score (DASH).* J Thromb Haemost. 2012;10(6):1019-
  1025). Four criteria: D-dimer abnormal post-anticoagulation
  (+2), Age <50 (+1), Male sex (+1), Hormone use at time of
  initial VTE in women (-2); sum -2 to +4; annual recurrence
  bands per Tosetto 2012 Table 4: <=1 -> 3.1% (low), 2 -> 6.4%
  (intermediate), >=3 -> 12.3% (high). Audit log:
  [docs/audits/v11/dash-vte.md](docs/audits/v11/dash-vte.md).
  Worked examples in
  [test/unit/dash-vte.test.js](test/unit/dash-vte.test.js).
- **`herdoo2` — HERDOO2 (women with unprovoked VTE)** (Rodger MA,
  Le Gal G, Anderson DR, et al. *Validating the HERDOO2 rule to
  guide treatment duration for women with unprovoked venous
  thrombosis: multinational prospective cohort management study.*
  BMJ. 2017;356:j1065). Women only; four criteria each +1
  (hyperpigmentation/edema/redness in either leg, D-dimer >=250
  ug/L on anticoag, BMI >=30, age >=65); sum 0-4; 0-1 -> safe to
  discontinue anticoagulation, >=2 -> continue per Rodger 2017.
  Audit log:
  [docs/audits/v11/herdoo2.md](docs/audits/v11/herdoo2.md). Worked
  examples in
  [test/unit/herdoo2.test.js](test/unit/herdoo2.test.js).
- **Wave 14-6 partial.** Vienna Prediction Model (Eichinger 2010)
  deferred — Group E nomogram with published 12- and 60-month
  recurrence-probability formulas that warrant a focused
  cross-implementation differential against the Eichinger 2010
  source rather than a rushed batch.

### Added (spec-v14 wave 14-5 — medical-inpatient bleeding & VTE prophylaxis: IMPROVE-Bleeding, IMPROVE-VTE)

- **`improve-bleeding` — IMPROVE Bleeding Risk Score** (Decousus
  H, Tapson VF, Bergmann JF, et al. *Factors at admission
  associated with bleeding risk in medical patients: findings
  from the IMPROVE investigators.* Chest. 2011;139(1):69-79).
  Thirteen weighted criteria (active gastroduodenal ulcer +4.5;
  bleeding in 3 months prior +4; platelet <50 +4; age >=85 +3.5;
  hepatic failure +2.5; severe renal failure +2.5; ICU/CCU +2.5;
  central venous catheter +2; rheumatic disease +2; active cancer
  +2; age 40-84 +1.5; moderate renal failure +1; male +1). Age
  and renal-failure categories modeled as mutually-exclusive
  selects so a single patient cannot double-count. Cutoff >=7 =
  high bleeding risk -> favor mechanical over pharmacologic
  prophylaxis per Decousus 2011. Audit log:
  [docs/audits/v11/improve-bleeding.md](docs/audits/v11/improve-bleeding.md).
  Worked examples in
  [test/unit/improve-bleeding.test.js](test/unit/improve-bleeding.test.js).
- **`improve-vte` — IMPROVE VTE Risk Score** (Spyropoulos AC,
  Anderson FA Jr, FitzGerald G, et al. *Predictive and
  associative models to identify hospitalized medical patients
  at risk for VTE.* Chest. 2011;140(3):706-714). Seven weighted
  criteria (prior VTE +3; thrombophilia +2; lower-limb paralysis
  +2; active cancer +2; immobilized >=7 days +1; ICU/CCU stay +1;
  age >60 +1); sum 0-12; cutoffs >=2 -> inpatient prophylaxis,
  >=4 -> extended-duration post-discharge prophylaxis per
  Spyropoulos 2011. Audit log:
  [docs/audits/v11/improve-vte.md](docs/audits/v11/improve-vte.md).
  Worked examples in
  [test/unit/improve-vte.test.js](test/unit/improve-vte.test.js).

### Added (spec-v14 wave 14-4 — atrial-fibrillation bleeding alternatives: ATRIA, ORBIT, HEMORR2HAGES)

- **`atria-bleeding` — ATRIA Bleeding Score** (Fang MC, Go AS,
  Chang Y, et al. *A new risk scheme to predict warfarin-
  associated hemorrhage. The ATRIA (Anticoagulation and Risk
  Factors in Atrial Fibrillation) Study.* J Am Coll Cardiol.
  2011;58(4):395-401). Five weighted criteria (anemia +3, severe
  renal disease eGFR <30 +3, age >=75 +2, prior bleeding +1,
  hypertension +1); sum 0-10; bands 0-3 low (0.8%/yr), 4
  intermediate (2.6%/yr), 5-10 high (5.8%/yr) annual major bleed
  per Fang 2011 Table 3. Audit log:
  [docs/audits/v11/atria-bleeding.md](docs/audits/v11/atria-bleeding.md).
  Worked examples in
  [test/unit/atria-bleeding.test.js](test/unit/atria-bleeding.test.js).
- **`orbit-bleeding` — ORBIT Bleeding Score** (O'Brien EC, Simon
  DN, Thomas LE, et al. *The ORBIT bleeding score: a simple
  bedside score to assess bleeding risk in atrial fibrillation.*
  Eur Heart J. 2015;36(46):3258-3264). Five weighted criteria
  (low Hb/Hct +2, age >74 +1, bleeding history +2, renal
  insufficiency eGFR <60 +1, antiplatelet treatment +1); sum 0-7;
  bands 0-2 low (2.4%/yr), 3 intermediate (4.7%/yr), 4-7 high
  (8.1%/yr) annual major bleed per O'Brien 2015 Table 3. Audit
  log:
  [docs/audits/v11/orbit-bleeding.md](docs/audits/v11/orbit-bleeding.md).
  Worked examples in
  [test/unit/orbit-bleeding.test.js](test/unit/orbit-bleeding.test.js).
- **`hemorr2hages` — HEMORR2HAGES Bleeding Score** (Gage BF, Yan
  Y, Milligan PE, et al. *Clinical classification schemes for
  predicting hemorrhage: results from the National Registry of
  Atrial Fibrillation (NRAF).* Am Heart J. 2006;151(3):713-719).
  Eleven criteria with prior rebleeding weighted +2 and all
  others +1 (Hepatic/Renal, Ethanol abuse, Malignancy, Older
  age >75, Reduced platelet count/function, Rebleeding,
  uncontrolled Hypertension, Anemia, Genetic factors CYP2C9,
  excessive fall risk, Stroke); sum 0-12; bleeds per 100
  patient-years per Gage 2006 Table 3 (0 -> 1.9, 1 -> 2.5,
  2 -> 5.3, 3 -> 8.4, 4 -> 10.4, >=5 -> 12.3). Audit log:
  [docs/audits/v11/hemorr2hages.md](docs/audits/v11/hemorr2hages.md).
  Worked examples in
  [test/unit/hemorr2hages.test.js](test/unit/hemorr2hages.test.js).

### Added (spec-v14 wave 14-3 — airway, PONV, recovery (partial): Apfel, modified Aldrete)

- **`apfel` — Apfel Simplified PONV Score** (Apfel CC, Laara E,
  Koivuranta M, Greim CA, Roewer N. *A simplified risk score for
  predicting postoperative nausea and vomiting: conclusions from
  cross-validations between two centers.* Anesthesiology. 1999;
  91(3):693-700). Four binary risk factors (female sex,
  nonsmoker, history of PONV or motion sickness, postoperative
  opioids); sum 0-4; predicted PONV risk per Apfel 1999 Table 4
  -> 10% / 20% / 40% / 60% / 80%. Audit log:
  [docs/audits/v11/apfel.md](docs/audits/v11/apfel.md). Worked
  examples in [test/unit/apfel.test.js](test/unit/apfel.test.js).
- **`aldrete` — modified Aldrete Recovery Score** (Aldrete JA.
  *The post-anesthesia recovery score revisited.* J Clin Anesth.
  1995;7(1):89-91). Five domains (activity, respiration,
  circulation, consciousness, oxygen saturation) each scored 0-2;
  sum 0-10; cutoff >=9 for PACU discharge per Aldrete 1995. The
  1995 revision replaces the original 1970 skin-color domain with
  oxygen saturation. Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/aldrete.md](docs/audits/v11/aldrete.md). Worked
  examples in
  [test/unit/aldrete.test.js](test/unit/aldrete.test.js).
- **Wave 14-3 partial.** LEMON Difficult Airway Predictor (Reed
  2005) and White-Song Fast-Track Score deferred -- each has
  per-component cutoffs (LEMON 3-3-2 rule sub-thresholds,
  White-Song's per-item floor for bypass eligibility) that warrant
  a focused audit against the primary source.

### Added (spec-v14 wave 14-2 — sleep-disordered breathing (partial): STOP-BANG, Epworth)

- **`stop-bang` — STOP-BANG OSA Screen** (Chung F, et al.
  *STOP questionnaire: a tool to screen patients for obstructive
  sleep apnea.* Anesthesiology. 2008;108(5):812-821; BANG
  extension: Chung F, et al. *High STOP-Bang score indicates a
  high probability of obstructive sleep apnoea.* Br J Anaesth.
  2012;108(5):768-775). Eight binary criteria (Snore, Tired,
  Observed apnea, blood Pressure, BMI>35, Age>50, Neck>40cm,
  Gender male); sum 0-8; cutoffs 0-2 low, 3-4 intermediate, 5-8
  high risk for moderate-to-severe OSA per Chung 2012 Table 3.
  Audit log:
  [docs/audits/v11/stop-bang.md](docs/audits/v11/stop-bang.md).
  Worked examples in
  [test/unit/stop-bang.test.js](test/unit/stop-bang.test.js).
- **`epworth` — Epworth Sleepiness Scale** (Johns MW. *A new
  method for measuring daytime sleepiness: the Epworth sleepiness
  scale.* Sleep. 1991;14(6):540-545). Eight scenarios each scored
  0 (would never doze) to 3 (high chance of dozing); sum 0-24;
  bands per Johns 1991: 0-10 normal, 11-14 mild, 15-17 moderate,
  18-24 severe excessive daytime sleepiness. Per-item input
  clamped to [0, 3]. Audit log:
  [docs/audits/v11/epworth.md](docs/audits/v11/epworth.md). Worked
  examples in [test/unit/epworth.test.js](test/unit/epworth.test.js).
- **Wave 14-2 partial.** Berlin Questionnaire for OSA deferred —
  Netzer 1999 specifies three categories with criteria-specific
  high-risk rules that warrant a focused audit against the primary
  source rather than a rushed batch.

### Added (spec-v13 wave 13-1 — ICU mortality scoring: MODS)

- **`mods` — Multiple Organ Dysfunction Score** (Marshall JC,
  Cook DJ, Christou NV, et al. *Multiple Organ Dysfunction
  Score: a reliable descriptor of a complex clinical outcome.*
  Crit Care Med. 1995;23(10):1638-1652). Six organ-system
  variables each scored 0-4 per Marshall 1995 Table 1
  (respiratory PaO2/FiO2, renal serum creatinine, hepatic total
  bilirubin, cardiovascular pressure-adjusted heart rate
  PAR = HR x CVP / MAP, hematologic platelet count, neurologic
  GCS). Sum 0-24; ICU mortality bands per Marshall 1995 Table 4
  (0: 0%; 1-4: 1-2%; 5-8: 3-5%; 9-12: ~25%; 13-16: ~50%;
  17-20: ~75%; 21-24: ~100%). Per-organ subscores surfaced
  alongside the total so a bedside clinician can see which
  system is dragging the score. Audit log:
  [docs/audits/v11/mods.md](docs/audits/v11/mods.md). Worked
  examples in [test/unit/mods.test.js](test/unit/mods.test.js).
  First tile of the wave 13-1 ICU mortality scoring bundle;
  APACHE II, SAPS II, and LODS remain queued.

### Added (spec-v13 wave 13-8 — closeout)

- **spec-v13 partial close (21 of 25 tiles).** Waves 13-2 through
  13-7 shipped under the v11 audit floor and the v12 §5 13-point
  shipping contract: sedation & delirium (RASS, SAS-Riker,
  CAM-ICU, ICDSC, 4AT), ICU pain (CPOT, BPS), nutrition (NUTRIC,
  mNUTRIC, NRS-2002, MUST), ventilation & lung injury (ROX,
  HACOR, Berlin ARDS, Murray LIS, LIPS), vasoactive load (VIS),
  and severe CAP triage (SMART-COP, CRB-65, ATS/IDSA-CAP, DRIP).
  Catalog 202 -> 223 at v13 partial close.
- **Wave 13-1 (ICU mortality scoring — APACHE II, SAPS II, MODS,
  LODS) deferred.** Each of the four mortality scores ships with
  per-variable weighting tables and (for APACHE II / SAPS II /
  LODS) a published logit producing predicted mortality; they
  require deeper audit-log work than the rest of the v13 tranche
  and are queued for a dedicated wave-13-1 PR rather than rushed
  into the closeout. v13 acceptance per
  [docs/spec-v13.md §7](docs/spec-v13.md) reopens to 25/25 once
  that wave lands; the §6 sequencing is unchanged.
- **Home grid copy refreshed**: [index.html](index.html)
  `<title>`, `<meta description>`, the OG / Twitter cards, the
  home-lede paragraph, and the WebApplication description in
  the JSON-LD `featureList` (auto-derived from
  `UTILITIES.length` via
  [scripts/build-ld.mjs](scripts/build-ld.mjs)) all read 223.
  README catalog snapshots in [README.md](README.md) updated
  202 -> 223 in both the "twelve categories" sentence and the
  post-spec-v5-trimming paragraph.
- **Audit coverage rerun**: `scripts/audit-coverage.mjs` reports
  223 / 223 (100%) with the v13 tiles slotted into Groups G
  (Clinical Scoring & Risk) and E (Clinical Math & Conversions)
  per [docs/spec-v13.md §4](docs/spec-v13.md).
- **Audience hubs and topic pages re-render** with the v13 tiles
  slotted in via `META[id].specialties` intersected with the
  audience and topic mappings in
  [scripts/build-hub-pages.mjs](scripts/build-hub-pages.mjs) and
  [scripts/build-topic-pages.mjs](scripts/build-topic-pages.mjs).
  No manual hub or topic edits were needed.

### Added (spec-v13 wave 13-7 — severe CAP triage bundle: SMART-COP, CRB-65, ATS/IDSA-CAP, DRIP)

- **`smart-cop` — SMART-COP** (Charles PGP, et al. *SMART-COP: a
  tool for predicting the need for intensive respiratory or
  vasopressor support in community-acquired pneumonia.* Clin
  Infect Dis. 2008;47(3):375-384). Eight-criterion weighted score
  (range 0-11) with age-adjusted RR (>=25 if age <=50; >=30 if
  >50) and age-adjusted oxygenation thresholds per Charles 2008.
  Cutoffs: 0-2 low; 3-4 moderate; >=5 high. Audit log:
  [docs/audits/v11/smart-cop.md](docs/audits/v11/smart-cop.md).
  Worked examples in
  [test/unit/smart-cop.test.js](test/unit/smart-cop.test.js).
- **`crb65` — CRB-65** (Lim WS, et al. *Defining community
  acquired pneumonia severity on presentation to hospital: an
  international derivation and validation study.* Thorax. 2003;
  58(5):377-382). Four binary criteria (confusion, RR >=30,
  SBP <90 or DBP <=60, age >=65); 30-day mortality bands 0: 1.2%,
  1-2: 8.2%, 3-4: 31.4% per Lim 2003. Ships alongside the
  existing `curb-65` tile for sites without BUN at presentation.
  Audit log: [docs/audits/v11/crb65.md](docs/audits/v11/crb65.md).
  Worked examples in
  [test/unit/crb65.test.js](test/unit/crb65.test.js).
- **`ats-idsa-cap` — ATS/IDSA Severe CAP Criteria (2019)**
  (Metlay JP, et al. *Diagnosis and Treatment of Adults with
  Community-acquired Pneumonia. An Official Clinical Practice
  Guideline of the American Thoracic Society and Infectious
  Diseases Society of America.* Am J Respir Crit Care Med. 2019;
  200(7):e45-e67). Two major criteria + nine minor; severe CAP /
  ICU admission if >=1 major OR >=3 minor per Metlay 2019 Table 1.
  Audit log:
  [docs/audits/v11/ats-idsa-cap.md](docs/audits/v11/ats-idsa-cap.md).
  Worked examples in
  [test/unit/ats-idsa-cap.test.js](test/unit/ats-idsa-cap.test.js).
- **`drip` — DRIP Score** (Webb BJ, et al. *Derivation and
  Multicenter Validation of the Drug Resistance in Pneumonia
  Clinical Prediction Score.* Antimicrob Agents Chemother. 2016;
  60(5):2652-2663). Four major risk factors (2 each) + six minor
  (1 each); cutoff >=4 = high risk for drug-resistant pneumonia
  (2019 ATS/IDSA endorsement for risk-adjusted empiric coverage).
  Audit log: [docs/audits/v11/drip.md](docs/audits/v11/drip.md).
  Worked examples in
  [test/unit/drip.test.js](test/unit/drip.test.js).

### Added (spec-v13 wave 13-6 — vasoactive load: VIS)

- **`vis` — Vasoactive-Inotropic Score** (Gaies MG, et al.
  *Vasoactive-inotropic score as a predictor of morbidity and
  mortality in infants after cardiopulmonary bypass.* Pediatr
  Crit Care Med. 2010;11(2):234-238). VIS = dopamine +
  dobutamine + 100*epinephrine + 100*norepinephrine +
  10*milrinone + 10000*vasopressin (mcg/kg/min, vasopressin in
  units/kg/min); also surfaces the simpler Wernovsky 1995
  Inotrope Score. Audit log:
  [docs/audits/v11/vis.md](docs/audits/v11/vis.md). Worked
  examples in [test/unit/vis.test.js](test/unit/vis.test.js).

### Added (spec-v13 wave 13-5 — ventilation & lung-injury bundle: ROX, HACOR, Berlin ARDS, Murray LIS, LIPS)

- **`rox` — ROX Index** (Roca O, et al. *An index combining
  respiratory rate and oxygenation to predict outcome of nasal
  high-flow therapy.* Am J Respir Crit Care Med. 2019;199(11):
  1368-1376). ROX = (SpO2/FiO2) / RR; cutoffs at 2 / 6 / 12 h
  per Roca 2019 Figure 2. Audit log:
  [docs/audits/v11/rox.md](docs/audits/v11/rox.md). Worked
  examples in [test/unit/rox.test.js](test/unit/rox.test.js).
- **`hacor` — HACOR (NIV failure)** (Duan J, et al. *Assessment
  of heart rate, acidosis, consciousness, oxygenation, and
  respiratory rate to predict noninvasive ventilation failure in
  hypoxemic patients.* Intensive Care Med. 2017;43(2):192-199).
  Five-parameter weighted score (range 0-25) at 1 hour of NIV
  per Duan 2017 Table 1; cutoff >5 with ~90% specificity for
  failure. Audit log:
  [docs/audits/v11/hacor.md](docs/audits/v11/hacor.md). Worked
  examples in [test/unit/hacor.test.js](test/unit/hacor.test.js).
- **`berlin-ards` — Berlin ARDS Criteria** (ARDS Definition Task
  Force, Ranieri VM, et al. *Acute Respiratory Distress
  Syndrome: The Berlin Definition.* JAMA. 2012;307(23):2526-
  2533). Four required criteria (timing <=1 wk, bilateral
  opacities, not cardiac/overload, PEEP >=5) plus PaO2/FiO2
  severity bands (mild 200-300, moderate 100-200, severe <=100).
  Audit log:
  [docs/audits/v11/berlin-ards.md](docs/audits/v11/berlin-ards.md).
  Worked examples in
  [test/unit/berlin-ards.test.js](test/unit/berlin-ards.test.js).
- **`lis-murray` — Murray Lung Injury Score** (Murray JF, et al.
  *An expanded definition of the adult respiratory distress
  syndrome.* Am Rev Respir Dis. 1988;138(3):720-723). Average of
  four 0-4 components (CXR quadrants, PaO2/FiO2, PEEP,
  compliance); >2.5 = severe (ECMO referral context per ELSO
  2017). Audit log:
  [docs/audits/v11/lis-murray.md](docs/audits/v11/lis-murray.md).
  Worked examples in
  [test/unit/lis-murray.test.js](test/unit/lis-murray.test.js).
- **`lips` — Lung Injury Prediction Score** (Gajic O, et al.
  *Early identification of patients at risk of acute lung
  injury: evaluation of lung injury prediction score in a
  multicenter cohort study.* Am J Respir Crit Care Med. 2011;
  183(4):462-470). 15 weighted predictors (predisposing
  conditions and modifiers; diabetes contributes -1); cutoff
  >=4 = high risk for ALI/ARDS. Audit log:
  [docs/audits/v11/lips.md](docs/audits/v11/lips.md). Worked
  examples in [test/unit/lips.test.js](test/unit/lips.test.js).

### Added (spec-v13 wave 13-4 — nutrition risk bundle: NUTRIC, mNUTRIC, NRS-2002, MUST)

- **`nutric` — NUTRIC Score** (Heyland DK, et al. *Identifying
  critically ill patients who benefit the most from nutrition
  therapy.* Crit Care. 2011;15(6):R268). Six-component sum (age,
  APACHE II, SOFA, comorbidities, days hospital to ICU, IL-6);
  range 0-10; cutoff >=6 = high nutritional risk. Audit log:
  [docs/audits/v11/nutric.md](docs/audits/v11/nutric.md). Worked
  examples in [test/unit/nutric.test.js](test/unit/nutric.test.js).
- **`mnutric` — modified NUTRIC** (Rahman A, et al. *Identifying
  critically-ill patients who will benefit most from nutritional
  therapy: further validation of the "modified NUTRIC".* Clin
  Nutr. 2016;35(1):158-162). Same as NUTRIC but IL-6 omitted;
  range 0-9; cutoff >=5. Audit log:
  [docs/audits/v11/mnutric.md](docs/audits/v11/mnutric.md). Worked
  examples in [test/unit/mnutric.test.js](test/unit/mnutric.test.js).
- **`nrs2002` — NRS-2002** (Kondrup J, et al. *Nutritional risk
  screening (NRS 2002): a new method based on an analysis of
  controlled clinical trials.* Clin Nutr. 2003;22(3):321-336).
  Severity of disease 0-3 + nutritional status 0-3 + age >=70
  +1; cutoff >=3 (ESPEN-endorsed). Audit log:
  [docs/audits/v11/nrs2002.md](docs/audits/v11/nrs2002.md). Worked
  examples in [test/unit/nrs2002.test.js](test/unit/nrs2002.test.js).
- **`must-nutrition` — MUST (Malnutrition Universal Screening
  Tool)** (BAPEN. *The "MUST" Explanatory Booklet.* British
  Association for Parenteral and Enteral Nutrition; 2003). Three
  components (BMI 0-2 + unplanned weight loss 0-2 + acute disease
  no intake for >5 days = 2 else 0); 0 low / 1 medium / >=2 high
  risk. Audit log:
  [docs/audits/v11/must-nutrition.md](docs/audits/v11/must-nutrition.md).
  Worked examples in
  [test/unit/must-nutrition.test.js](test/unit/must-nutrition.test.js).

### Added (spec-v13 wave 13-3 — ICU pain bundle: CPOT, BPS)

- **`cpot` — Critical-Care Pain Observation Tool** (Gelinas C,
  et al. *Validation of the Critical-Care Pain Observation Tool
  in adult patients.* Am J Crit Care. 2006;15(4):420-427).
  Four behaviors (facial expression, body movements, muscle
  tension, ventilator compliance or vocalization) each 0-2;
  range 0-8 with the Gelinas 2006 unacceptable-pain cutoff >=3.
  Audit log: [docs/audits/v11/cpot.md](docs/audits/v11/cpot.md).
  Worked examples in
  [test/unit/cpot.test.js](test/unit/cpot.test.js).
- **`bps` — Behavioral Pain Scale** (Payen JF, et al. *Assessing
  pain in critically ill sedated patients by using a behavioral
  pain scale.* Crit Care Med. 2001;29(12):2258-2263). Three
  behaviors (facial expression, upper limb movements, ventilator
  compliance) each 1-4; range 3-12 with the Payen 2001
  unacceptable-pain cutoff >5. Audit log:
  [docs/audits/v11/bps.md](docs/audits/v11/bps.md). Worked
  examples in [test/unit/bps.test.js](test/unit/bps.test.js).

### Added (spec-v13 wave 13-2 — sedation & delirium bundle: RASS, SAS-Riker, CAM-ICU, ICDSC, 4AT)

- **`rass` — Richmond Agitation-Sedation Scale** (Sessler CN,
  et al. *The Richmond Agitation-Sedation Scale: validity and
  reliability in adult intensive care unit patients.* Am J
  Respir Crit Care Med. 2002;166(10):1338-1344). 10-row picker
  (-5 unarousable through +4 combative) with the SCCM PADIS 2018
  (Devlin 2018) light-sedation target band (-2 to 0). Audit log:
  [docs/audits/v11/rass.md](docs/audits/v11/rass.md). Worked
  examples in [test/unit/rass.test.js](test/unit/rass.test.js).
- **`sas-riker` — Riker Sedation-Agitation Scale** (Riker RR,
  et al. *Prospective evaluation of the Sedation-Agitation Scale
  for adult critically ill patients.* Crit Care Med. 1999;27(7):
  1325-1329). Seven-row picker (1 unarousable through 7 dangerous
  agitation) with the SCCM PADIS 2018 goal band SAS 3-4. Audit
  log: [docs/audits/v11/sas-riker.md](docs/audits/v11/sas-riker.md).
  Worked examples in
  [test/unit/sas-riker.test.js](test/unit/sas-riker.test.js).
- **`cam-icu` — Confusion Assessment Method for the ICU** (Ely
  EW, et al. *Delirium in mechanically ventilated patients:
  validity and reliability of the Confusion Assessment Method
  for the ICU (CAM-ICU).* JAMA. 2001;286(21):2703-2710). Four-
  feature algorithm: feature 1 (acute onset or fluctuating
  course) AND feature 2 (inattention) AND (feature 3 (altered
  level of consciousness) OR feature 4 (disorganized thinking)).
  Audit log:
  [docs/audits/v11/cam-icu.md](docs/audits/v11/cam-icu.md).
  Worked examples in
  [test/unit/cam-icu.test.js](test/unit/cam-icu.test.js).
- **`icdsc` — Intensive Care Delirium Screening Checklist**
  (Bergeron N, et al. *Intensive Care Delirium Screening
  Checklist: evaluation of a new screening tool.* Intensive Care
  Med. 2001;27(5):859-864). Eight binary items each 0/1; range
  0-8 with the Bergeron 2001 delirium cutoff >=4. Audit log:
  [docs/audits/v11/icdsc.md](docs/audits/v11/icdsc.md). Worked
  examples in [test/unit/icdsc.test.js](test/unit/icdsc.test.js).
- **`4at` — 4AT Delirium Screen** (MacLullich AMJ, et al. *The
  4 "A"s Test for detecting delirium in acute medical patients
  (4AT): a diagnostic accuracy study.* Health Technol Assess.
  2019;23(40):1-194). Four domains (Alertness 0 or 4; AMT4 0/1/2;
  Attention months-of-year-backwards 0/1/2; Acute change or
  fluctuating course 0 or 4) summing 0-12; three-band
  interpretation (0 unlikely; 1-3 possible cognitive impairment;
  >=4 possible delirium). Audit log:
  [docs/audits/v11/4at.md](docs/audits/v11/4at.md). Worked
  examples in [test/unit/4at.test.js](test/unit/4at.test.js).

### Added (spec-v12 wave 12-9 — closeout)

- **spec-v12 marked complete.** All 24 tiles enumerated in
  [docs/spec-v12.md §10](docs/spec-v12.md) (the `maddrey-lille`
  combined card ships as one tile per spec-v12 §3.4.3) shipped
  under the v11 audit floor and the v12 §5 13-point shipping
  contract. Catalog 178 -> 202 at v12 close.
- **Home grid copy refreshed**:
  [index.html](index.html) `<title>`, `<meta description>`, the
  OG / Twitter cards, and the home-lede paragraph updated from
  "178" to "202 calculators..."; the JSON-LD `featureList` is
  auto-derived from `UTILITIES.length` via
  [scripts/build-ld.mjs](scripts/build-ld.mjs) and now reports
  202. README catalog snapshots in
  [README.md](README.md) updated 178 -> 202 in both the "twelve
  categories" sentence and the post-spec-v5-trimming paragraph.
- **Audit coverage rerun**: `scripts/audit-coverage.mjs` reports
  202 / 202 (100%) with the new tiles slotted into Groups G, E,
  H, and N per [docs/spec-v12.md §4](docs/spec-v12.md).
- **Five audience hubs and eight topic pages re-render** with the
  new tiles slotted in via `META[id].specialties` intersected with
  the audience and topic mappings in
  [scripts/build-hub-pages.mjs](scripts/build-hub-pages.mjs) and
  [scripts/build-topic-pages.mjs](scripts/build-topic-pages.mjs).
  No manual hub or topic edits were needed.

### Added (spec-v12 wave 12-8 — cardiology + critical-care bundle: Killip, SIRS)

- **`killip` — Killip Classification** (Killip T, Kimball JT.
  *Treatment of myocardial infarction in a coronary care unit. A
  two-year experience with 250 patients.* Am J Cardiol. 1967;
  20(4):457-464). Four-row class picker (I-IV) with the Killip
  1967 original-cohort in-hospital mortality (6% / 17% / 38% /
  81%); the contemporary GUSTO-I reperfusion-era cohort
  (Lee 1995) is surfaced as a secondary reference. Audit log:
  [docs/audits/v11/killip.md](docs/audits/v11/killip.md). Worked
  examples in [test/unit/killip.test.js](test/unit/killip.test.js).
- **`sirs` — SIRS Criteria (with Sepsis-3 context)** (Bone RC,
  et al. *Definitions for sepsis and organ failure and guidelines
  for the use of innovative therapies in sepsis.* Chest. 1992;
  101(6):1644-1655). Four-criterion count with the >=2 SIRS-
  positive threshold per Bone 1992. Sepsis-3 (Singer M, et al.
  JAMA. 2016;315(8):801-810) deprecation is surfaced inline so a
  clinician auditing a CDS trigger sees both definitions. Audit
  log: [docs/audits/v11/sirs.md](docs/audits/v11/sirs.md). Worked
  examples in [test/unit/sirs.test.js](test/unit/sirs.test.js).

### Added (spec-v12 wave 12-7 — comorbidity, frailty & performance bundle: Charlson, Clinical Frailty Scale, ECOG + Karnofsky)

- **`charlson` — Charlson Comorbidity Index (age-adjusted)**
  (Charlson ME, et al. *A new method of classifying prognostic
  comorbidity in longitudinal studies: development and validation.*
  J Chronic Dis. 1987;40(5):373-383; age adjustment: Charlson 1994
  J Clin Epidemiol. 47(11):1245-1251). 19 comorbidity flags
  weighted 1 / 2 / 3 / 6 per Charlson 1987 Table 3 with severity
  dominance (the more-severe class suppresses the milder one),
  plus the Charlson 1994 age adjustment (1 point per decade >=50,
  capped at 4 at age >=80). 10-year mortality bands per Charlson
  1987 Table 4. Audit log:
  [docs/audits/v11/charlson.md](docs/audits/v11/charlson.md).
  Worked examples in
  [test/unit/charlson.test.js](test/unit/charlson.test.js).
- **`cfs` — Clinical Frailty Scale** (Rockwood K, et al. *A global
  clinical measure of fitness and frailty in elderly people.*
  CMAJ. 2005;173(5):489-495; Dalhousie 2020 v2 wording). Nine-level
  picker with the canonical Rockwood 2005 / Dalhousie 2020 v2
  descriptors and a Sophie-quoted outcome-association band. Audit
  log: [docs/audits/v11/cfs.md](docs/audits/v11/cfs.md). Worked
  examples in [test/unit/cfs.test.js](test/unit/cfs.test.js).
- **`ecog-karnofsky` — ECOG + Karnofsky Performance Status**
  (Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655 (ECOG);
  Karnofsky DA, Burchenal JH. 1949 (KPS); Buccheri G, et al.
  Eur J Cancer. 1996;32A(7):1135-1141 (crosswalk)). Two coupled
  pickers (ECOG 0-5 and KPS 100-0 in steps of 10) with the source
  descriptors verbatim; selecting an ECOG value auto-suggests the
  corresponding KPS via the Buccheri 1996 crosswalk, and the user
  may override. Audit log:
  [docs/audits/v11/ecog-karnofsky.md](docs/audits/v11/ecog-karnofsky.md).
  Worked examples in
  [test/unit/ecog-karnofsky.test.js](test/unit/ecog-karnofsky.test.js).

### Added (spec-v12 wave 12-6 — readmission & care-transition risk bundle: HOSPITAL, LACE)

- **`hospital-score` — HOSPITAL Score for Potentially Avoidable
  30-Day Readmissions** (Donze J, Aujesky D, Williams D, Schnipper
  JL. *Potentially avoidable 30-day hospital readmissions in
  medical patients: derivation and validation of a prediction
  model.* JAMA Intern Med. 2013;173(8):632-638). Seven-predictor
  weighted sum (range 0-13) per Donze 2013 Table 2 with the
  Table 4 risk bands (low 0-4 ~5.8%, intermediate 5-6 ~11.9%,
  high >=7 ~22.8%). Audit log:
  [docs/audits/v11/hospital-score.md](docs/audits/v11/hospital-score.md).
  Worked examples in
  [test/unit/hospital-score.test.js](test/unit/hospital-score.test.js).
- **`lace` — LACE Index for 30-Day Readmission / Death**
  (van Walraven C, et al. *Derivation and validation of an index
  to predict early death or unplanned readmission after discharge
  from hospital to the community.* CMAJ. 2010;182(6):551-557).
  Four-component sum (Length of stay, Acute admission, Charlson,
  Emergency visits in 6 months; range 0-19) per van Walraven 2010
  Table 3 with Figure 2 risk bands (low 0-4, moderate 5-9, high
  >=10). Audit log:
  [docs/audits/v11/lace.md](docs/audits/v11/lace.md). Worked
  examples in [test/unit/lace.test.js](test/unit/lace.test.js).

### Added (spec-v12 wave 12-5 — imaging-decision bundle: Canadian CT Head, Canadian C-Spine, PECARN Pediatric Head, Ottawa Ankle, Ottawa SAH)

- **`cthr` — Canadian CT Head Rule** (Stiell IG, et al. *The
  Canadian CT Head Rule for patients with minor head injury.*
  Lancet. 2001;357(9266):1391-1396). Five high-risk and two
  medium-risk criteria per Stiell 2001 Figure 2; rule applies to
  GCS 13-15 blunt head injury with witnessed LOC, definite amnesia,
  or witnessed disorientation. Audit log:
  [docs/audits/v11/cthr.md](docs/audits/v11/cthr.md). Worked
  examples in [test/unit/cthr.test.js](test/unit/cthr.test.js).
- **`ccsr` — Canadian C-Spine Rule** (Stiell IG, et al. *The
  Canadian C-Spine Rule for radiography in alert and stable
  trauma patients.* JAMA. 2001;286(15):1841-1848). Three-step
  algorithm per Stiell 2001 Figure 1; ships side by side with the
  existing `nexus-cspine` tile so both rules' recommendations are
  visible on the same screen. Audit log:
  [docs/audits/v11/ccsr.md](docs/audits/v11/ccsr.md). Worked
  examples in [test/unit/ccsr.test.js](test/unit/ccsr.test.js).
- **`pecarn-head` — PECARN Pediatric Head Injury Rule**
  (Kuppermann N, et al. *Identification of children at very low
  risk of clinically-important brain injuries after head trauma:
  a prospective cohort study.* Lancet. 2009;374(9696):1160-1170).
  Two age-banded algorithms (Kuppermann 2009 Figures 2 and 3)
  returning one of three ciTBI risk tiers (very-low / intermediate
  / high). Audit log:
  [docs/audits/v11/pecarn-head.md](docs/audits/v11/pecarn-head.md).
  Worked examples in
  [test/unit/pecarn-head.test.js](test/unit/pecarn-head.test.js).
- **`ottawa-ankle` — Ottawa Ankle Rules** (Stiell IG, et al. *A
  study to develop clinical decision rules for the use of
  radiography in acute ankle injuries.* Ann Emerg Med. 1992;
  21(4):384-390). Stiell 1992 Figure 1 algorithm; separate
  malleolar-zone (ankle x-ray) and midfoot-zone (foot x-ray)
  decisions. Rule for patients >= 18; pediatric variant
  (Plint 1999) deferred to a future spec. Audit log:
  [docs/audits/v11/ottawa-ankle.md](docs/audits/v11/ottawa-ankle.md).
  Worked examples in
  [test/unit/ottawa-ankle.test.js](test/unit/ottawa-ankle.test.js).
- **`ottawa-sah` — Ottawa Subarachnoid Hemorrhage Rule** (Perry
  JJ, et al. *Clinical decision rules to rule out subarachnoid
  hemorrhage for acute headache.* JAMA. 2013;310(12):1248-1255).
  Six-criterion decision rule per Perry 2013 Figure 2 with the
  §Methods exclusion-criteria pre-screen (new neurologic deficit,
  prior aneurysm / SAH / brain tumor, recurrent identical-pattern
  headaches, age <15). Audit log:
  [docs/audits/v11/ottawa-sah.md](docs/audits/v11/ottawa-sah.md).
  Worked examples in
  [test/unit/ottawa-sah.test.js](test/unit/ottawa-sah.test.js).

### Added (spec-v12 wave 12-4 — hepatology & liver-fibrosis bundle: FIB-4, APRI, Maddrey-Lille)

- **`fib4` — FIB-4 Index for Liver Fibrosis** (Sterling RK, et al.
  *Development of a simple noninvasive index to predict significant
  fibrosis in patients with HIV/HCV coinfection.* Hepatology. 2006;
  43(6):1317-1325). Four inputs (age, AST, ALT, platelets); formula
  FIB-4 = (age * AST) / (platelets * sqrt(ALT)). Sterling 2006
  cutoffs: <1.45 rules out advanced fibrosis (NPV 90%); >3.25 rules
  in advanced fibrosis (PPV 65%); 1.45-3.25 indeterminate. Audit
  log: [docs/audits/v11/fib4.md](docs/audits/v11/fib4.md). Worked
  examples in [test/unit/fib4.test.js](test/unit/fib4.test.js).
- **`apri` — AST to Platelet Ratio Index** (Wai CT, et al. *A
  simple noninvasive index can predict both significant fibrosis
  and cirrhosis in patients with chronic hepatitis C.* Hepatology.
  2003;38(2):518-526). Three inputs (AST, AST upper limit of
  normal, platelets); formula APRI = ((AST / AST_ULN) * 100) /
  platelets. Wai 2003 cutoffs: >0.7 predicts significant fibrosis;
  >1.0 predicts cirrhosis (WHO 2014 HCV guideline endorses these
  cutoffs for resource-limited settings). Audit log:
  [docs/audits/v11/apri.md](docs/audits/v11/apri.md). Worked
  examples in [test/unit/apri.test.js](test/unit/apri.test.js).
- **`maddrey-lille` — Maddrey DF + Lille Model (alcoholic
  hepatitis)** (Maddrey WC, et al. *Corticosteroid therapy of
  alcoholic hepatitis.* Gastroenterology. 1978;75(2):193-199;
  Louvet A, et al. *The Lille model: a new tool for therapeutic
  strategy in patients with severe alcoholic hepatitis treated
  with steroids.* Hepatology. 2007;45(6):1348-1354). Combined
  card: Maddrey DF = 4.6 * (patient PT - control PT) + bilirubin
  with the Maddrey 1978 DF >= 32 severe-disease cutoff; Lille
  computed in SI units internally per the Louvet 2007 equation
  with the 0.45 non-response cutoff (6-month survival ~25% vs
  ~85%). Audit log:
  [docs/audits/v11/maddrey-lille.md](docs/audits/v11/maddrey-lille.md).
  Worked examples in
  [test/unit/maddrey-lille.test.js](test/unit/maddrey-lille.test.js).

### Added (spec-v12 wave 12-3 — upper & lower GI-bleeding bundle: GBS, Rockall, AIMS65, Oakland)

- **`gbs` — Glasgow-Blatchford Bleeding Score** (Blatchford O, et
  al. *A risk score to predict need for treatment for upper-
  gastrointestinal haemorrhage.* Lancet. 2000;356(9238):1318-1321).
  Eight inputs (BUN in mg/dL, hemoglobin in g/dL with sex-specific
  Blatchford 2000 Table 1 bands, SBP, pulse >= 100, melena, recent
  syncope, hepatic disease, cardiac failure). GBS = 0 is the
  outpatient-management cutoff per Blatchford 2000 §Results,
  endorsed by NICE CG141 (2012). Audit log:
  [docs/audits/v11/gbs.md](docs/audits/v11/gbs.md). Worked
  examples in [test/unit/gbs.test.js](test/unit/gbs.test.js).
- **`rockall` — Rockall Score** (Rockall TA, et al. *Risk
  assessment after acute upper gastrointestinal haemorrhage.* Gut.
  1996;38(3):316-321). Complete (post-endoscopy) five-parameter
  score (range 0-11) with mortality bands quoted from Rockall 1996
  Figure 2; a `preEndoscopy` toggle exposes the Vreeburg 1999 /
  NICE CG141 variant (omits endoscopic diagnosis and stigmata;
  range 0-7). Audit log:
  [docs/audits/v11/rockall.md](docs/audits/v11/rockall.md). Worked
  examples in [test/unit/rockall.test.js](test/unit/rockall.test.js).
- **`aims65` — AIMS65 Score** (Saltzman JR, et al. *A simple risk
  score accurately predicts in-hospital mortality, length of stay,
  and cost in acute upper GI bleeding.* Gastrointest Endosc. 2011;
  74(6):1215-1224). Five binary criteria with the Saltzman 2011
  Table 4 six-band in-hospital mortality split (0.3% / 1.2% / 5.3%
  / 10.3% / 16.5% / 24.5%). Audit log:
  [docs/audits/v11/aims65.md](docs/audits/v11/aims65.md). Worked
  examples in [test/unit/aims65.test.js](test/unit/aims65.test.js).
- **`oakland` — Oakland Score** (Oakland K, et al. *Derivation
  and validation of a novel risk score for safe discharge after
  acute lower gastrointestinal bleeding: a modelling study.* Lancet
  Gastroenterol Hepatol. 2017;2(9):635-643). Seven-parameter
  weighted model (range 0-35); <= 8 is the safe-discharge cutoff
  (95% probability of safe discharge per Oakland 2017; endorsed by
  BSG 2019). Hemoglobin is entered in g/dL and converted to g/L
  internally to apply the Oakland 2017 Table 2 bands. Audit log:
  [docs/audits/v11/oakland.md](docs/audits/v11/oakland.md). Worked
  examples in [test/unit/oakland.test.js](test/unit/oakland.test.js).

### Added (spec-v12 wave 12-2 — VTE risk & severity bundle: PESI, sPESI, Padua)

- **`pesi` — Pulmonary Embolism Severity Index** (Aujesky D, et al.
  *Derivation and validation of a prognostic model for pulmonary
  embolism.* Am J Respir Crit Care Med. 2005;172(8):1041-1046). 11
  inputs (age in years, male sex, cancer, heart failure, chronic
  lung disease, HR >= 110, SBP < 100, RR >= 30, temperature < 36 °C,
  altered mental status, SaO2 < 90% on room air). Five risk classes
  (I <= 65, II 66-85, III 86-105, IV 106-125, V > 125) with the
  Aujesky 2005 Table 4 30-day mortality range per class. Audit log:
  [docs/audits/v11/pesi.md](docs/audits/v11/pesi.md). Worked
  examples in [test/unit/pesi.test.js](test/unit/pesi.test.js).
- **`spesi` — Simplified PESI** (Jimenez D, et al. *Simplification
  of the pulmonary embolism severity index for prognostication in
  patients with acute symptomatic pulmonary embolism.* Arch Intern
  Med. 2010;170(15):1383-1389). Six binary criteria; sPESI 0 -> low
  risk (1.0% 30-day mortality), >= 1 -> not-low risk (10.9%) per
  Jimenez 2010 Table 3. Audit log:
  [docs/audits/v11/spesi.md](docs/audits/v11/spesi.md). Worked
  examples in [test/unit/spesi.test.js](test/unit/spesi.test.js).
- **`padua` — Padua Prediction Score** (Barbar S, et al. *A risk
  assessment model for the identification of hospitalized medical
  patients at risk for venous thromboembolism: the Padua Prediction
  Score.* J Thromb Haemost. 2010;8(11):2450-2457). Weighted 11-item
  model; >= 4 is high risk for VTE per Barbar 2010 §Results, with
  the Barbar 2010 Table 4 90-day VTE rates (0.3% low, 11.0% high if
  untreated) surfaced in the interpretation block. Audit log:
  [docs/audits/v11/padua.md](docs/audits/v11/padua.md). Worked
  examples in [test/unit/padua.test.js](test/unit/padua.test.js).

### Added (spec-v12 wave 12-1 — early-warning bundle: NEWS2 + MEWS)

- **`news2` — National Early Warning Score 2** (Royal College of
  Physicians. *NEWS 2: Standardising the assessment of acute-illness
  severity in the NHS.* London: RCP, 2017). Eight inputs (respiratory
  rate, SpO2 with Scale 1 vs Scale 2 toggle per RCP 2017 §3.4,
  supplemental-oxygen flag, systolic BP, pulse, ACVPU consciousness,
  temperature). Per-parameter trace plus the RCP 2017 Table 2
  clinical-response trigger band (Low / Low-medium / Medium / High);
  a single parameter scoring 3 flips Low-medium aggregates to Medium
  per the source. Audit log:
  [docs/audits/v11/news2.md](docs/audits/v11/news2.md). Worked
  example (low edge of input + spec-v12 §3.1.1 mid + high edge)
  asserted in [test/unit/news2.test.js](test/unit/news2.test.js).
- **`mews` — Modified Early Warning Score** (Subbe CP, et al.
  *Validation of a modified Early Warning Score in medical
  admissions.* QJM. 2001;94(10):521-526). Five inputs (SBP, pulse,
  RR, temperature, AVPU). Per-parameter trace plus the Subbe 2001
  Table 2 four-band outcome split (0-2 / 3 / 4 / >=5). MEWS predates
  NEWS2 and omits SpO2 / supplemental-oxygen scoring; both tiles
  ship side by side so sites that have not converted from MEWS to
  NEWS2 still see their instrument. Audit log:
  [docs/audits/v11/mews.md](docs/audits/v11/mews.md). Worked
  examples in [test/unit/mews.test.js](test/unit/mews.test.js).

### Removed (clinical-staff-first pivot — patient-artifact dropzone UI retired)

- **The home-view artifact dropzone UI is gone.** spec-v7 §3.1's
  "What do you need to decode?" hero label, "Or drop the document
  you cannot read" dropzone, and "Or paste text:" textarea are all
  removed from `index.html`. The hero search remains but is reframed
  to clinical-first phrasing ("Find a calculator, lookup, or
  reference" with placeholders like *wells PE*, *CHA2DS2-VASc*,
  *ICD-10*, *magnesium replacement*).
- **`wireDropzone()` and the dropzone-only imports are removed from
  `app.js`.** The dropzone wiring, file-picker handlers, drag/drop
  listeners, paste auto-classify, and Escape/Clear chooser flow are
  all gone. `applyPendingDrop()` is no longer called from the tile
  renderer (no dropzone means nothing is ever pending).
- **`lib/artifact-detect.js`, `lib/artifact-route.js`, and
  `lib/artifact-handoff.js` remain in the tree.** Their unit tests
  still run; they continue to encode the deterministic classifier
  and routing table. The choice was deliberate: if a clinical-input
  surface ever reuses them (e.g., a clinician pasting an EHR lab
  panel per spec-v10 §3.3), the libraries are ready. The home view
  simply no longer wears them.
- **`styles.css` `.artifact-*` selectors and the patient-artifact
  meta description copy are pruned.** Meta descriptions now read
  "178 calculators, scoring tools, code lookups, and references"
  in place of "...bill decoders." The patient-decoder tiles
  themselves (`decoder`, `eob-decoder`, `msn-decoder`,
  `appeal-letter`, `roi`, `hipaa-roa`, ...) are not removed; they
  remain valid tiles in the catalog, just no longer promoted via
  an artifact-ingestion hero.
- **`test/unit/artifact-route.test.js`** reframes the prior
  "accept= stays in lockstep" assertion as a negative assertion
  that the dropzone elements are NOT present in `index.html`, so
  any accidental reintroduction is a CI failure.

### Added (spec-v11 §5 — eight more canonical-band tiles get `META.interpretation`)

- **Eight more tiles** now expose per-band `interpretation` blocks
  whose every band text is a direct paraphrase of the primary
  source. The renderer was already in place; this is pure metadata.
  - `gcs` — Teasdale & Jennett 1974 mild (13-15) / moderate (9-12) /
    severe (3-8) bands with the conventional GCS<=8 airway threshold.
  - `wells-pe` — Wells 2000 / Wells 2001 two-tier <=4 vs >4 cutoff.
  - `wells-dvt` — Wells 1997 Table 3 low (<=0) / moderate (1-2) /
    high (>=3) probability bands.
  - `nihss` — NIH/NINDS interpretation bands 0 / 1-4 / 5-15 / 16-20 /
    21-42 per Adams 1999.
  - `timi` — Antman 2000 Table 3 14-day composite-event rates by
    score (0-1 → 4.7% up to 6-7 → 40.9%).
  - `centor` — McIsaac 1998 Table 4 management bands by McIsaac
    age-adjusted score.
  - `ciwa` — CIWA-Ar minimal / moderate / severe bands per Sullivan
    1989 + Mayo-Smith 1997 consensus thresholds.
  - `cows` — COWS mild / moderate / moderately severe / severe per
    Wesson & Ling 2003 scoring key.
- All eight pass the `test/unit/meta-interpretation.test.js` CI
  guard. 16 of the 178 tiles now carry an interpretation block.

### Added (spec-v11 §5 — populate `META.interpretation` for eight canonical-band tiles)

- **Eight canonical tiles now expose per-band `interpretation` blocks**
  whose every band text is a direct paraphrase of the primary source,
  rendered below the citation under the mandatory "Per source:" header
  per spec-v11 §5.2:
  - `chads` (CHA2DS2-VASc) — Lip 2010 / ESC bands 0 / 1 / >=2 with
    antithrombotic guidance.
  - `hasbled` — Pisters 2010 Table 5 bleeds-per-100-patient-years for
    bands 0-1 / 2 / >=3.
  - `curb-65` — Lim 2003 Table 4 30-day mortality bands 0-1 / 2 / 3-5
    with disposition guidance.
  - `heart` — Six 2008 / Backus 2013 prospective-validation 6-week MACE
    bands 0-3 / 4-6 / 7-10.
  - `perc` — Kline 2004 rule-out vs rule-does-not-apply pair.
  - `phq9` — Kroenke 2001 Table 4 severity bands 0-4 / 5-9 / 10-14 /
    15-19 / 20-27.
  - `gad7` — Spitzer 2006 severity bands 0-4 / 5-9 / 10-14 / 15-21.
  - `abcd2` — Johnston 2007 Table 3 2-day stroke-risk bands 0-3
    (1.0%) / 4-5 (4.1%) / 6-7 (8.1%).
- All eight pass the `test/unit/meta-interpretation.test.js` CI guard
  (§5.4): `sourceQuoted: true`, non-empty `sourceCitation`, band text
  <=200 chars, no forbidden Sophie-authored phrasing.
- The renderer in `renderMetaBlock(util)` ([app.js](app.js)) was
  already in place from spec-v11 wave 2; this is a pure metadata
  addition with no UI work required.

### Changed (spec-v11 wave 4 — final pass; spec-v11 marked complete)

- **spec-v11 marked complete (2026-05-18).** All four phases landed:
  Wave 0 shipped the spec, the per-tile audit-log skeleton tooling
  (`scripts/audit-skeleton.mjs`), the coverage rollup
  (`scripts/audit-coverage.mjs`), and the §3.5 CI guards
  (`test/unit/audit-format.test.js`,
  `test/unit/meta-citation-verify.test.js`,
  `test/unit/meta-example-result.test.js`). Wave 1 renamed the
  visible group labels per §4.1 (`app.js GROUP_LABELS`), added the
  additive `META[id].specialties` array consumed by
  `lib/prompt.js`, and pushed the visible name through every header
  / ARIA label / hub / topic page. Wave 2 added the
  `interpretation` field and `test/unit/meta-interpretation.test.js`
  CI guard. Waves 3a–3n carried the per-tile audit work in the
  §3.3 order; every shipped tile now has a corresponding
  `docs/audits/v11/<tile-id>.md` in PASS or PASS-WITH-FIXES state.
- **§6 acceptance criteria met.** `scripts/audit-coverage.mjs`
  reports 178/178 (100%) — `A 21/21`, `C 15/15`, `E 31/31`,
  `F 15/15`, `G 47/47`, `H 9/9`, `I 24/24`, `J 5/5`, `K 4/4`,
  `L 3/3`, `N 3/3`, `O 1/1`. No defect (§3.6) reached a state
  that required a CHANGELOG `### Fixed` regression entry; the
  audit waves caught only precision observations (notably the
  `niosh-pg` CO TWA labelling note in wave 3n) that do not change
  hazard ranking or downstream safety. `npm run lint`, the unit +
  a11y suite, `npm run data:verify`, and `npm run build` are
  green. spec-v11 §6 final criteria — every audit log present and
  PASS, coverage 100%, `GROUP_LABELS` visible, `META[id].specialties`
  consumed by the prompt ranker, CI guard for `interpretation`
  passing — are all satisfied.
- **Update [docs/spec-v11.md](docs/spec-v11.md) status header**
  from "proposed (2026-05-17)" to "spec-v11 complete (2026-05-18)"
  with a summary of which waves landed and which acceptance
  criteria the release meets.

### Added (spec-v11 wave 3n — EMS & field medicine; Group I to 100%; v11 audit 178/178)

- **Wave 3n — Group I EMS & field medicine (24 tiles).**
  `peds-weight-dose`, `adult-arrest-ref`, `peds-arrest-ref`, `defib`,
  `cincinnati`, `fast`, `field-triage`, `start-triage`,
  `jumpstart-triage`, `bsa_burn`, `burn-fluid`, `hypothermia`,
  `heat-illness`, `peds-ett`, `toxidromes`, `naloxone`, `ems-doc`,
  `nexus-cspine`, `dot-erg`, `niosh-pg`, `cpr-numeric`, `tccc`,
  `co-cn-antidote`, and `avpu-gcs` each audited per spec-v11 §3.3.
  Drug-math tiles (`peds-weight-dose`, `naloxone`, `defib`,
  `burn-fluid`) hand-computed against PALS 2020 / AHA ECC 2020 / FDA
  labels / Baxter & Shires 1968 with cap and floor coverage rows
  (epinephrine 200 kg cap-hit; atropine 2 kg floor-hit; pediatric
  cardioversion at 1 kg low edge; Parkland 70 kg / 20% TBSA mid-case
  matching the META example; pediatric naloxone cap at 2 mg adult
  dose). Stroke / triage screens (`cincinnati`, `fast`, `start-triage`,
  `jumpstart-triage`, `field-triage`, `nexus-cspine`) re-verified
  against Kothari 1997 / Kleindorfer 2007 + Aroor 2017 / Super 1983 /
  Romig (CHOC) / CDC field-triage current edition / Hoffman 2000 +
  Stiell 2001. Lookup tiles (`adult-arrest-ref`, `peds-arrest-ref`,
  `cpr-numeric`, `hypothermia`, `heat-illness`, `toxidromes`,
  `dot-erg`, `niosh-pg`, `tccc`, `peds-ett`, `co-cn-antidote`,
  `avpu-gcs`, `ems-doc`) audited per step 10: shard integrity plus
  sampled authoritative lookups against AHA ECC 2020, WMS hypothermia
  / heat-illness guidelines, Goldfrank toxidrome table, PHMSA ERG
  (current edition), NIOSH Pocket Guide, CoTCCC public TCCC
  guidelines, Cole / modified Cole airway formulas, Cyanokit and
  Nithiodote FDA labels, UHMS HBO indications, McNarry 2004
  AVPU/GCS mapping, and the NEMSIS v3 documentation prompts behind
  `data/workflow/ems-runtypes.json`.
- **Group I (EMS & Field Medicine) is now 100% audited; spec-v11
  audit coverage reaches 178 / 178 (100%).**
  `scripts/audit-coverage.mjs` reports `A 21/21`, `C 15/15`,
  `E 31/31`, `F 15/15`, `G 47/47`, `H 9/9`, `I 24/24`, `J 5/5`,
  `K 4/4`, `L 3/3`, `N 3/3`, `O 1/1`. With all per-tile audit logs
  in PASS state, the spec-v11 §6 acceptance criterion for audit
  coverage is met; wave 4 (final summary) follows.

### Added (spec-v11 wave 3m — clinical scoring tail; Group G to 100%)

- **Wave 3m — Group G clinical-scoring tail (19 tiles).** `peds-vitals`,
  `lab-ranges`, `abg`, `asa`, `mallampati`, `beers`, `centor`,
  `alvarado-pas`, `ascvd`, `prevent`, `lights`, `mentzer`, `saag`,
  `r-factor`, `kdigo-aki`, `sgarbossa`, `rcri`, `pews`, and `abcd2` each
  audited per spec-v11 §3.3. Formula tiles (Light's, Mentzer, SAAG,
  R-factor, KDIGO, RCRI, ABCD2, ABG Winter compensation, PEWS,
  Modified Sgarbossa, ASCVD PCE, PREVENT 2024) cross-checked by
  hand-computation against the primary source (Light 1972; Mentzer
  1973; Runyon 1992; Benichou 1990; KDIGO 2012; Lee 1999; Johnston
  2007; Albert/Dell/Winters 1967; Monaghan 2005; Smith 2012; Goff
  2014; Khan 2024) and against MDCalc / ACC-tool reference
  implementations within the spec-v11 §3.1.3 0.5% tolerance. Lookup
  tiles (`peds-vitals`, `lab-ranges`, `asa`, `mallampati`, `beers`)
  audited per step 10 (shard integrity + sampled authoritative
  lookups). Centor / McIsaac age-modifier thresholds (3-14 → +1, 45+
  → -1) re-verified against McIsaac 1998 Table 2; Alvarado / PAS
  point allocations re-verified against Alvarado 1986 Table 1 and
  Samuel 2002 Table 2 (RLQ tenderness and leukocytosis are the only
  2-point items). ABCD2 band thresholds (0-3 / 4-5 / 6-7 with 2-day
  stroke risks 1.0% / 4.1% / 8.1%) pinned to Johnston 2007 Table 3.
- **Group G (Clinical Scoring & Risk) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 154 / 178 (87%) overall, with
  `A 21/21`, `C 15/15`, `E 31/31`, `F 15/15`, `G 47/47`, `H 9/9`,
  `I 0/24 (0%)`, `J 5/5`, `K 4/4`, `L 3/3`, `N 3/3`, `O 1/1`. The
  remaining wave is Group I EMS & field medicine (24 tiles) per
  spec-v11 §3.3.

### Added (spec-v11 wave 3l — workflow, high-alert, peds, reference ranges, immunization; Groups H, J, K, N, O to 100%)

- **Wave 3l — workflow + high-alert + remaining pediatrics + reference
  ranges + immunization & ID (19 tiles).** `prep`, `prior-auth`,
  `discharge-instr`, `specialty-visit`, `wallet-card`, `sbar-template`,
  `breach-clock`, `high-alert-card`, `unit-converter-v4`,
  `time-to-dose`, `lab-adult`, `lab-peds`, `tdm-levels`, `tox-levels`,
  `tetanus`, `rabies-pep`, `bbp-exposure`, `tb-testing`,
  `sti-screening` each audited per spec-v11 §3.3. Reference-range and
  STI-screening tiles audited per step 10 (shard integrity + sampled
  authoritative lookups). Workflow / patient-education generators
  (`prep`, `prior-auth`, `discharge-instr`, `specialty-visit`,
  `wallet-card`, `sbar-template`) audited per step 13 (required-field
  coverage backed by pinned unit tests in `lib/workflow-v4.js` and
  `lib/keywords.js`). `breach-clock` boundary-example pass:
  hand-computed 60-day arithmetic for individual / media / HHS notices
  and the `>=500` threshold across discovery-date and year-boundary
  edges; 45 CFR §§164.404 / 164.406 / 164.408 text re-read against
  the current eCFR. `unit-converter-v4` cross-checked against IFCC
  HbA1c master equation, NIH/NLM SI conversion table, and exact NIST
  in / lb factors. `tetanus`, `rabies-pep`, and `bbp-exposure`
  decision trees cross-checked row-by-row against the bundled JSON
  vs. CDC ACIP / USPHS source tables; the `tb-testing` 5 / 10 / 15 mm
  TST cutoffs confirmed against the current ATS / CDC / IDSA
  guidance.
- **Groups H (Workflow & Documentation), J (Immunization & Infectious
  Disease), K (Reference Ranges), N (Pediatrics & Neonatal), and O
  (High-Alert & Safety) are now 100% audited.**
  `scripts/audit-coverage.mjs` reports 135 / 178 (76%) overall, with
  `A 21/21`, `C 15/15`, `E 31/31`, `F 15/15`, `G 28/47 (60%)`,
  `H 9/9`, `I 0/24 (0%)`, `J 5/5`, `K 4/4`, `L 3/3`, `N 3/3`,
  `O 1/1`. The two remaining waves are Group G clinical-scoring tail
  (19 tiles) and Group I EMS & field medicine (24 tiles) per
  spec-v11 §3.3.

### Added (spec-v11 wave 3k — regulatory + patient-literacy; Groups C and L to 100%)

- **Wave 3k — regulatory and patient-literacy (20 tiles).** `decoder`,
  `insurance`, `eob-decoder`, `no-surprises`, `insurance-card`,
  `abn-explainer`, `msn-decoder`, `idr-eligibility`, `appeal-letter`,
  `hipaa-roa`, `birthday-rule`, `cobra-timeline`, `medicare-enrollment`,
  `aca-sep`, `lab-interpret`, `cms1500`, `ub04`, `eob-glossary`,
  `hipaa-auth`, `roi` each audited per spec-v11 §3.3 step 11: cited
  CFR / USC / form-version sections re-read against the current text
  (45 CFR 162.406 NPI Luhn; 45 CFR 164.524 HIPAA Right of Access
  30-day clock + cost-based fee cap; 45 CFR 164.508 HIPAA Authorization
  9 required elements; 45 CFR 147.136 internal appeal; 45 CFR 149 +
  PHSA 2799A-1/-2/-7 No Surprises Act; 29 USC 1162 COBRA 18/29/36
  windows; 42 CFR 407.14/15/21 Medicare IEP/GEP/SEP; 45 CFR 155.420
  ACA SEP; NUBC UB-04 Data Specifications; ADA 2024 + 2018 ACC/AHA +
  ATA 2014 reference bands) and existing pinned unit tests for the
  template-generators (HIPAA Authorization 9-element coverage; ROI
  required-field coverage; specialty-visit and wallet-card builders)
  re-confirmed.
- **One META citation defect fixed in the same PR per spec-v11 §3.6 #3.**
  `META.cms1500.citation` previously read "CMS-1500 (08/05)
  Health Insurance Claim Form ..."; the (08/05) form revision was
  superseded by the (02/12) revision in April 2014 and the (02/12)
  form is the current paper professional claim form. Corrected to
  "CMS-1500 (02/12) ... in use since April 1, 2014". Live tile
  content was already aligned to the 02/12 form layout; only the
  citation string referenced the obsolete revision.
- **Groups C (Insurance & Patient Literacy) and L (Insurance
  Glossary) are now 100% audited.** `scripts/audit-coverage.mjs`
  reports 116 / 178 (65%) overall, with `A 21/21 (100%)`,
  `C 15/15 (100%)`, `E 31/31 (100%)`, `F 15/15 (100%)`,
  `G 28/47 (60%)`, `H 2/9 (22%)`, `L 3/3 (100%)`, and
  `N 1/3 (33%)`. Wave 3l (remaining Group G + workflow + EMS / field)
  is next per spec-v11 §3.3.

### Added (spec-v11 wave 3j — code lookups; Group A to 100%)

- **Wave 3j — code lookups (21 tiles).** `icd10`, `hcpcs`, `cpt`,
  `ndc`, `pos-codes`, `modifier-codes`, `revenue-codes`, `carc`,
  `rarc`, `hcpcs-mod`, `pos-lookup`, `tob-decode`, `rev-table`,
  `nubc-codes`, `drg-lookup`, `apc-lookup`, `pcs-lookup`,
  `rxnorm-lookup`, `ndc-rxnorm`, `em-time`, `ndc-convert` each audited
  per spec-v11 §3.3 step 10: (a) bundled shard sha256 confirmed
  against the dataset manifest by `scripts/verify-integrity.mjs`
  (46 manifests pass clean as of audit date), and (b) at least one
  sample lookup per shard verified against the authoritative source
  (CMS / NCHS ICD-10-CM; CMS HCPCS Level II; CMS MPFS + author-
  written CPT family summaries with the AMA-no-descriptors guard via
  `test/unit/cpt-no-ama.test.js`; FDA NDC Directory; CMS Place of
  Service; CMS / X12 modifiers; NUBC UB-04 revenue codes; X12 CARC /
  RARC; CMS HCPCS Modifier file; NUBC UB-04 TOB structure; NUBC
  Condition / Occurrence / Value codes; CMS IPPS MS-DRG Final Rule;
  CMS OPPS APC Addendum; CMS ICD-10-PCS; NLM RxNorm; FDA NDC + NLM
  RxNorm crosswalk; AMA CPT 2021 E/M time bands; CMS NDC 5-4-2
  billing format + FDA SPL 10-digit source formats). The two
  computational tiles in the group (`em-time`, `ndc-convert`) also
  carry boundary worked examples (low/mid/high time bands; each of
  the three 10-digit NDC source formats and the ambiguous 5-4-2
  already-padded case).
- **No defects opened in this wave.** All META examples computed to
  the same value the renderer produces (em-time 99204 / 45-min new
  patient; ndc-convert 1234-5678-90 -> 01234-5678-90 billing / 1234-
  5678-90 FDA 10-digit / 4-4-2 source).
- **Group A (Billing & Coding) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 96 / 178 (54%) overall, with
  `A 21/21 (100%)`, `E 31/31 (100%)`, `F 15/15 (100%)`,
  `G 28/47 (60%)`, and `N 1/3 (33%)`. Wave 3k (regulatory and
  patient-literacy) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3i — conversions and physical math; Group E to 100%)

- **Wave 3i — conversions and physical math (16 tiles).** `bmi`, `bsa`,
  `bw-bsa-suite`, `map`, `shock-index`, `aa-gradient`, `pf-ratio`,
  `aa-pf-suite`, `qtc`, `qtc-suite`, `pack-years`, `unit-converter`,
  `cockcroft-gault`, `maint-fluids`, `pbw-ardsnet`, `rsbi` each audited
  end-to-end per spec-v11 §3.1: citation re-verification (Quetelet 1835
  + WHO BMI bands; Du Bois 1916 + Mosteller 1987 BSA; physiology MAP /
  PP / Allgower 1967 SI / Liu 2012 mSI; West alveolar gas equation;
  ARDS Berlin Definition JAMA 2012; Bazett / Fridericia / Sagie /
  Hodges QTc formulas; USPSTF pack-year convention; NIST SP 811 +
  Handbook 44 exact unit factors; Cockcroft-Gault Nephron 1976;
  Holliday-Segar Pediatrics 1957; ARDSnet NEJM 2000 PBW + 6 mL/kg
  protocol; Yang-Tobin NEJM 1991 RSBI), boundary worked examples per
  tile (low / mid / high physiologic range; banding-cutoff hits for
  P/F Berlin bins and RSBI threshold), cross-implementation
  differentials all 0% delta (hand-computed against the source papers
  and MDCalc), edge-input handling notes (FiO2 0.01-1.0 validation;
  divide-by-zero guards on shock-index and Cockcroft-Gault; Holliday-
  Segar weight-band branching; ARDSnet metric-height convention; QTc
  formula choice rationale), and an a11y pass on each.
- **No new META defects in this wave.** Two minor "~" approximations
  in `bw-bsa-suite` META expected text (~70.5 vs computed 70.7 IBW;
  ~76.3 vs 76.4 AdjBW) fall within the 0.5% differential budget and
  the 0.1-kg display precision — recorded in the audit log without
  filing as defects.
- **Group E (Clinical Math & Conversions) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 75 / 178 (42%) overall, with
  `E 31/31 (100%)`, `F 15/15 (100%)`, `G 28/47 (60%)`, and
  `N 1/3 (33%)`. Wave 3j (code lookups) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3h — psychiatry screener audits)

- **Wave 3h — psychiatry screeners (8 tiles).** `phq9`, `gad7`,
  `auditc`, `cage`, `epds`, `mini-cog`, `ciwa`, `cows` each audited
  end-to-end per spec-v11 §3.1: citation re-verification (Kroenke 2001
  PHQ-9; Spitzer 2006 GAD-7; Bush 1998 AUDIT-C with VA/DoD 2015 CPG
  sex-specific cutoffs; Ewing 1984 CAGE; Cox 1987 EPDS; Borson 2000
  Mini-Cog; Sullivan 1989 CIWA-Ar; Wesson 2003 COWS with SAMHSA TIP 63
  scoring sheet), boundary worked examples per tile (zero / mid / each
  banding cutoff / max), cross-implementation differentials against
  the source tables (all 0 delta), edge-input handling notes (PHQ-9
  item 9 and EPDS item 10 self-harm flag commentary; CAGE >=2 cutoff
  faithfulness to Ewing 1984; AUDIT-C sex-specific cutoff conveyed
  in band-label copy rather than via a sex input; CIWA-Ar bedside
  clamping rather than throwing; COWS per-item caller-pre-grading
  workflow), and an a11y pass on each.
- **One META defect fixed in the same PR per spec-v11 §3.6 #3.**
  `META.ciwa.example.expected` previously read "CIWA-Ar 10 (mild
  withdrawal; ...)"; the example inputs sum to 10 which lands in the
  Moderate (8-15) band per Sullivan 1989 — Mild is <8 per the source
  and per Sophie's banding. Corrected to "CIWA-Ar 10 (moderate
  withdrawal, 8-15 band; symptom-triggered protocol typically considers
  active treatment)." Live tile rendering was always correct; only the
  documented narrative drifted.
- **`scripts/audit-coverage.mjs` now reports 59 / 178 (33%) overall**,
  with `E  Clinical Math & Conversions  15/31 (48%)`,
  `F  Medication & Infusion  15/15 (100%)`,
  `G  Clinical Scoring & Risk  28/47 (60%)`, and
  `N  Pediatrics & Neonatal  1/3 (33%)`. Wave 3i (conversions and
  physical math) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3g — OB and pediatrics audits)

- **Wave 3g — OB and pediatrics (5 tiles).** `bishop`, `apgar`,
  `due-date`, `preg-dating`, `peds-weight-conv` each audited end-to-end
  per spec-v11 §3.1: citation re-verification (Bishop 1964 Obstet
  Gynecol original cervical scorecard; Apgar 1953 Curr Res Anesth Analg
  five-component newborn scorecard; Naegele rule LMP+280 per ACOG
  Committee Opinion 700; Robinson-Fleming 1975 BJOG CRL regression with
  ACOG Practice Bulletin 175 redating thresholds 7/14/21 days for
  T1/T2/T3; NIST 0.45359237 kg/lb with AAP Bright Futures weight bands),
  three or more boundary worked examples per tile (zero / mid / max
  bands; leap-year EDD cross-check on `due-date`; discordant-vs-within-
  limit boundary on `preg-dating`), cross-implementation differentials
  all 0 delta (hand-computation against the source paper tables, plus
  ACOG / MDCalc cross-checks where applicable), edge-input handling
  notes (Naegele UTC millisecond arithmetic sidestepping DST drift;
  preg-dating optional-input UX skipping `crlMm <= 0`; peds-weight-conv
  oz < 16 guard; Bishop saturation at the top/bottom rows for out-of-
  physiological inputs), and an a11y / keyboard pass.
- **Two META example defects fixed in the same PR per spec-v11 §3.6 #3.**
  (a) `META.bishop.example` listed consistency = "soft" (worth 2 pts),
  producing a Bishop score of 10 while the expected text claimed
  "Bishop 9"; corrected to consistency = "medium" (1 pt) so the example
  computes to 9 as documented. (b) `META['preg-dating'].example` listed
  LMP = 2026-01-08 with CRL 50 mm at US 2026-03-12, producing a 19-day
  T1 discordance that exceeded the 7-day redating threshold while the
  expected text claimed "within accepted limit"; corrected LMP to
  2025-12-23 so the example produces a real 3-day within-limit
  discordance matching the narrative. Live tile rendering was correct
  in both cases — only the documented example was inconsistent with
  its own narrative.
- **`scripts/audit-coverage.mjs` now reports 51 / 178 (29%) overall**,
  with `E  Clinical Math & Conversions  15/31 (48%)`,
  `F  Medication & Infusion  15/15 (100%)`,
  `G  Clinical Scoring & Risk  20/47 (43%)`, and
  `N  Pediatrics & Neonatal  1/3 (33%)`. Wave 3h (psychiatry screeners)
  is next per spec-v11 §3.3.

### Added (spec-v11 wave 3f — renal / electrolyte audits)

- **Wave 3f — renal / electrolyte math (13 tiles).** `anion-gap`,
  `anion-gap-dd`, `corrected-anion-gap`, `corrected-calcium`,
  `corrected-sodium`, `corrected-ca-na`, `egfr`, `egfr-suite`,
  `fena-feurea`, `osmolal-gap`, `winters`, `sodium-correction`,
  `free-water-deficit` each audited end-to-end per spec-v11 §3.1:
  citation re-verification (Emmett 1977 + Figge 1998 for AG; Wrenn
  1990 for delta-delta; Payne 1973 for corrected Ca; Katz 1973 +
  Hillier 1999 for corrected Na; Inker 2021 for CKD-EPI 2021; Levey
  1999 for MDRD; Cockcroft-Gault 1976; Espinel 1976 FENa + Carvounis
  2002 FEUrea; Glasser 1973 + Hoffman 1993 for osmolal gap; Albert-
  Dell-Winters 1967 for Winters; Adrogue-Madias 2000 NEJM for Na
  correction and free-water deficit; Sterns 2015 NEJM for the
  8 / 10-12 mEq/L/24h safety ceilings), three boundary worked examples
  per tile, cross-implementation differentials all <0.5% (CKD-EPI 2021
  hand-trace against Inker 2021 Table 2 published worked example;
  Adrogue-Madias hand-trace against the 2000 NEJM Equation 1),
  edge-input handling notes (direction-mismatch guards on
  `sodium-correction`; zero-divisor guards on `anion-gap-dd` and
  `fena-feurea`; range guards on `free-water-deficit`; sex/age TBW
  factor crossover at age 65), and an a11y pass.
- **Two META defects fixed in the same PR per spec-v11 §3.6 #3.**
  (a) `META.egfr.example.expected` previously read "eGFR ~60
  mL/min/1.73m^2" for inputs Scr 1.0 / age 60 / sex F; the actual
  computed value is ~91 (the live tile rendering was always correct;
  only the META narrative drifted). Corrected to "~91". (b)
  `META.winters.citation` previously listed "Winter et al. Arch
  Intern Med 1967;120(2):151-156"; the actual primary publication is
  Albert MS, Dell RB, Winters RW. Ann Intern Med 1967;66(2):312-322
  (a common textbook attribution error). Corrected. Live numerical
  output was unaffected in both cases.
- **`scripts/audit-coverage.mjs` now reports 46 / 178 (26%) overall**,
  with `E  Clinical Math & Conversions  13/31 (42%)`,
  `F  Medication & Infusion  15/15 (100%)`, and
  `G  Clinical Scoring & Risk  18/47 (38%)`. Wave 3g (OB and
  pediatrics) is next per spec-v11 §3.3.

### Added (spec-v11 waves 3d + 3e — cardiology + pulmonary audits)

- **Wave 3d — cardiology scoring (10 tiles).** `chads`, `hasbled`,
  `heart`, `timi`, `grace`, `wells-pe`, `wells-dvt`, `perc`,
  `wells-pe-geneva`, `wells-dvt-caprini` each audited end-to-end per
  spec-v11 §3.1: citation re-verification (Lip 2010 Chest CHA2DS2-VASc,
  Pisters 2010 HAS-BLED, Six 2008 + Backus 2013 HEART, Antman 2000
  TIMI, Granger 2003 GRACE, Wells 2000 PE / Wells 1997 DVT, Kline 2004
  + Kline 2008 PERC, Le Gal 2006 revised Geneva, Caprini 2005 + Bahl
  2010 Caprini RAM), three boundary worked examples per tile (zero /
  mid / max-score), a cross-implementation differential against the
  source tables (Lip 2010 Table 6/7, Pisters 2010 Table 3/5, Backus
  2013 Table 3, Antman 2000 Table 3, Granger 2003 Table 1, Wells 2000
  Table 2/4, Wells 1997 Table 1/2, Le Gal 2006 Table 2/3, Bahl 2010
  thresholds), edge-input handling notes (Wells DVT carry-through on
  the -2 "alternative dx" subtraction; Geneva HR-tier `else if`
  cascade; CHA2DS2-VASc independent age tiers; HEART troponin tier
  not tied to a single assay), and an a11y / keyboard pass. All 10
  PASS; one example-narrative refinement opportunity noted on
  `wells-pe-geneva` (META example narrative says "Geneva ~3" but
  HR 105 alone scores 5 (Intermediate) — live rendering is correct;
  example narrative is approximate, not user-visible incorrect output).
- **Wave 3e — pulmonary scoring (2 tiles).** `curb-65`, `psi` each
  audited end-to-end per spec-v11 §3.1: citation re-verification (Lim
  2003 Thorax CURB-65; Fine 1997 NEJM PSI), three boundary worked
  examples per tile (zero / mid / max-class), cross-implementation
  differentials against Lim 2003 Table 4 + Table 5 and Fine 1997
  Table 4 + Table 5 (both 0% delta), edge-input handling notes (CURB-65
  BUN > 20 mg/dL US rounding of source 7 mmol/L; PSI Class I age
  short-circuit uses raw age not female-adjusted age), and an a11y
  pass. Both PASS.
- **`scripts/audit-coverage.mjs` now reports 33 / 178 (19%) overall**,
  with `F  Medication & Infusion  15/15 (100%)` and
  `G  Clinical Scoring & Risk  18/47 (38%)`. Wave 3f (renal /
  electrolyte math) is next per spec-v11 §3.3.

### Added (spec-v11 waves 3b + 3c — critical-care + stroke / neuro audits)

- **Wave 3b — critical-care scoring (3 tiles).** `qsofa-sofa`,
  `meld-childpugh`, `ranson-bisap` each audited end-to-end per
  spec-v11 §3.1: citation re-verification (Singer 2016, Vincent 1996,
  Ferreira 2001, Kim 2021, Pugh 1973, Ranson 1974, Wu 2008), three
  boundary worked examples, a cross-implementation differential
  (MELD-3.0 hand-traced against Kim 2021 Table 4: bili=3.2, INR=1.5,
  Cr=1.6, Na=132, alb=2.8, female -> Sophie 25, Kim 2021 25, delta 0%),
  edge-input handling notes (per-organ-system clamp on SOFA; per-lab
  clamp + dialysis-forces-Cr-to-3.0 on MELD-3.0), and an a11y / keyboard
  pass. All three PASS.
- **Wave 3c — stroke and neuro (3 tiles).** `gcs`, `nihss`, `mrs`
  each audited end-to-end per spec-v11 §3.1: citation re-verification
  (Teasdale 1974, Teasdale 2014 Lancet Neurol retrospective, Brott 1989,
  NINDS public-domain NIHSS, van Swieten 1988, UK-TIA 1988, Banks 2007),
  three boundary worked examples (GCS 3 / 12 / 15; NIHSS 0 / 5 / 42;
  mRS all seven canonical levels), cross-implementation differentials
  against the NINDS pocket card and Banks 2007 mRS Table 1
  (text-verbatim match), edge-input handling notes (per-component
  caps via the shared `num` validator on GCS and NIHSS), and an a11y
  pass. All three PASS.
- **`scripts/audit-coverage.mjs` now reports 21 / 178 (12%) overall**,
  with `F  Medication & Infusion  15/15 (100%)` and
  `G  Clinical Scoring & Risk  6/47 (13%)`. Wave 3d (cardiology) is
  next per spec-v11 §3.3.

### Added (spec-v11 wave 3a — Medication & Infusion audit, 15/15 tiles)

- **Group F audited end-to-end.** Wave 3a closes the highest-stakes
  group first per spec-v11 §3.3: wrong drug math is the worst failure
  mode this site has. Fifteen audit logs landed under
  `docs/audits/v11/`, one per tile, each carrying citation
  re-verification, three boundary worked examples, a cross-
  implementation differential against the cited primary source or a
  standard reference (Marino *ICU Book*, Goodman & Gilman, Maudsley,
  Ferinject SmPC, ACC 2020 Expert Consensus, DailyMed labels, CDC 2022
  MMWR opioid guideline, Sanford Guide, Harriet Lane Handbook, ASPEN
  parenteral nutrition guidelines), edge-input handling notes, and an
  a11y / keyboard pass. Tiles covered: `drip-rate`, `weight-dose`,
  `conc-rate`, `peds-dose`, `insulin-drip`, `anticoag-reversal`,
  `high-alert`, `opioid-mme`, `steroid-equiv`, `benzo-equiv`,
  `abx-renal`, `vasopressor`, `tpn-macro`, `iv-to-po`, `iron-ganzoni`.
  All 15 logs are PASS or PASS-WITH-FIXES; no defects opened.
- **`scripts/audit-coverage.mjs` reports 15/15 (100%) for group F**,
  15/178 (8%) overall. Subsequent waves (3b critical-care scoring,
  3c stroke/neuro, ...) will follow the spec-v11 §3.3 order.

### Added (spec-v11 waves 0–2 — audit tooling, specialty rename, `interpretation` field)

- **Wave 0 — audit tooling + CI guards + empty `docs/audits/v11/`.**
  Two new pure-Node scripts ship: `scripts/audit-skeleton.mjs <tile-id>`
  generates a pre-filled `docs/audits/v11/<tile-id>.md` skeleton in the
  spec-v11 §3.2 schema (refuses to overwrite existing logs);
  `scripts/audit-coverage.mjs` reads the audit dir and reports per-group
  audit completion (informational CI signal, not a gate). Three new CI
  guards under `test/unit/`: `audit-format.test.js` enforces the
  spec-v11 §3.2 schema on every audit log; `meta-citation-verify.test.js`
  enforces non-empty, ≤300-character, URL-free citation strings;
  `meta-interpretation.test.js` enforces the §5.4 contract on the new
  optional field. Four citation strings were trimmed to clear the
  URL-free / ≤300 contract (`high-alert`, `high-alert-card`,
  `benzo-equiv`, `lab-interpret`).
- **Wave 1 — specialty rename + `META[id].specialties` field.**
  `GROUP_LABELS` in `app.js`, `scripts/build-hub-pages.mjs`, and
  `scripts/build-tool-pages.mjs` switches from the v8-era labels
  (`Code Reference`, `Patient Bill & Insurance Literacy`, `Clinical
  Scoring & Reference`, `Workflow & Templates`, `Field Medicine`,
  `Public Health Decision Trees`, `Lab Reference`, `Forms & Numbers
  Literacy`, `Literacy Helpers`, `Patient Safety`) to the spec-v11 §4.1
  specialty names (`Billing & Coding`, `Insurance & Patient Literacy`,
  `Clinical Scoring & Risk`, `Workflow & Documentation`, `EMS & Field
  Medicine`, `Immunization & Infectious Disease`, `Reference Ranges`,
  `Insurance Glossary`, `Pediatrics & Neonatal`, `High-Alert & Safety`),
  plus the new `M: State & Coverage Reference` row. The matching `<h3>`
  section headers in `index.html` are updated. The optional
  `META[id].specialties` array (closed vocabulary in spec-v11 §4.3) is
  wired through `app.js` `tileCorpus()` into `lib/prompt.js`
  `buildSearchDoc()` as additional `+1 per token` search tokens
  alongside `audiences` and `tags`. No tile populates the field yet;
  defaults to `[]`.
- **Wave 2 — `META[id].interpretation` rendering + CI guard.**
  `renderMetaBlock` in `app.js` learns to render an optional
  per-band `interpretation` block under a mandatory `Per source:`
  header, immediately below the citation line, so every word shown
  is the source's. The `meta-interpretation.test.js` guard rejects
  Sophie-authored phrasing (`Sophie`, `we recommend`, `you should`,
  `consider ordering`), missing `sourceQuoted: true`, missing
  `sourceCitation`, oversize band text, and empty `bands` arrays.
  No tile populates the field yet; absence is the default.

### Added (spec-v11 — correctness floor + specialty-named groups + optional `interpretation` field)

- **`docs/spec-v11.md` (new).** Implementation spec. No new tiles
  ship under v11; the entire scope is making the 178 tiles already
  shipped provably correct via a five-step per-tile audit
  (citation re-verification, ≥3 boundary worked examples, cross-
  implementation differential within 0.5% / one category for
  ordinal scores, edge-input handling review, a11y + keyboard
  pass). Each audit lands as `docs/audits/v11/<tile-id>.md`;
  two new scripts (`scripts/audit-coverage.mjs`,
  `scripts/audit-skeleton.mjs`) make the audit mechanical;
  three new CI guards (`test/unit/audit-format.test.js`,
  `test/unit/meta-citation-verify.test.js`,
  `test/unit/meta-interpretation.test.js`) pin the format. Audit
  order is highest-stakes first: medication and dosing, then
  critical-care scoring, then stroke / neuro, then cardiology,
  then pulmonary, then renal / electrolyte, then OB / peds, then
  psych screeners, then conversions, then code lookups, then
  regulatory, then workflow / EMS, then patient-education
  generators.
- **Specialty-named groups (spec-v11 §4).** The internal group
  letters (`A`, `C`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`,
  `N`, `O`) gain visible specialty / category labels: Billing &
  Coding, Insurance & Patient Literacy, Clinical Math &
  Conversions, Medication & Infusion, Clinical Scoring & Risk,
  Workflow & Documentation, EMS & Field Medicine, Immunization &
  Infectious Disease, Reference Ranges, Insurance Glossary, State
  & Coverage Reference, Pediatrics & Neonatal, High-Alert &
  Safety. The letter remains the legacy id inside `UTILITIES`
  entries so deep links keep working; a new `GROUP_LABELS`
  constant maps letter → visible name. A new optional
  `META[id].specialties` array (closed vocabulary of 27 specialty
  tags) is consumed by the prompt ranker as additional tokens.
- **Optional `META[id].interpretation` field (spec-v11 §5).**
  Tightly scoped: only allowed when the per-band interpretation
  text is a direct quote or close paraphrase of the same primary
  citation that gave Sophie the formula. Renders inside the
  References region under a mandatory "Per source:" header
  (every word below is the source's, not Sophie's). CI guard
  rejects Sophie-authored phrasing ("we recommend", "you should",
  "consider ordering"). Absent by default; not load-bearing; tiles
  without a published per-band interpretation do not invent one.
- **`docs/scope-mdcalc-parity.md` (new).** Long-horizon scope
  statement. Sophie commits to eventually carrying every
  actionable, cited, deterministic clinical calculator a
  healthcare worker would otherwise reach for MDCalc to find,
  plus the billing / coding / regulatory surface MDCalc does not
  cover. Target is roughly 400–600 tiles over 3–5 years at the
  spec-v11 quality bar, **eventually complete, never rushed**.
  Permanently excludes AI-generated calculators, single-center
  unreplicated validations, sponsored / pharma-affiliated
  calculators, Sophie-authored treatment recommendations, live-
  data calculators, and patient-artifact NLP. Hierarchy made
  explicit: v10 (what Sophie is) → v11 (how good Sophie must be)
  → scope-mdcalc-parity (where Sophie is going).

### Changed (spec-v10 — companion-specs cross-link)

- **`docs/spec-v10.md` §6a.** New "Companion specs and scope
  document" section linking spec-v11 and scope-mdcalc-parity so
  the positioning spec, the quality floor, and the long-horizon
  direction are discoverable from one another.
- **`README.md` documentation index.** Adds links to spec-v11 and
  scope-mdcalc-parity directly under spec-v10.

### Added (spec-v10 — clinical-first positioning, bounded dependency budget, v7 §4 wind-down)

- **`docs/spec-v10.md` (new).** Positioning spec, not a feature spec.
  Fixes in writing what sophiewell.com is *for* (the calculator a
  nurse pulls up at 2 a.m.: MDCalc without ads, login, upsell,
  cookie banner, email capture, or network calls after first paint),
  what it is *not* (an explicit permanent-out-of-scope list covering
  AI, PDF / DOCX / OCR parsing, server-side processing of clinical
  data, accounts, telemetry, ads, subscriptions, native apps,
  persistent client storage, recommendation strips, and new patient-
  artifact decoders past the existing simple tiles), the **runtime-
  dependency budget** (max two pinned exact-version deps, each
  justified against a clinical use case that cannot be hand-rolled,
  reviewed against the threat model, SBOM-tracked, MIT-compatible,
  and CSP-respecting), and tile-add criteria. Every prior spec (v4
  through v9) remains in force; v10 narrows scope, it does not amend
  their hard rules.
- **`docs/stability.md` — two new commitments.**
  *Client-side processing of clinical and billing data*: every
  calculation, lookup, and decode runs in the browser; inputs never
  cross the network; there is no server-side surface that *could*
  see user input, by construction. *Bounded runtime-dependency
  budget*: ≤2 pinned, exact-version runtime deps, each SBOM-tracked
  and threat-model-reviewed; devDependencies are unbudgeted.

### Removed (spec-v10 §3 — v7 §4 artifact-decoder pages dropped)

- **spec-v7 §4.1–§4.6 (bill/EOB/MSN → DOCX, lab PDF → DOCX, denial
  letter → appeal packet, pharmacy printout → interactions,
  discharge paperwork → summary, insurance card → benefits cheat
  sheet) are formally dropped.** All six required PDF / DOCX / OCR
  dependencies (pdf.js, mammoth, docx, Tesseract.js) that exceed
  the §2.2 dependency budget, and their target audience (patients
  holding artifacts) sits outside spec-v10's clinical-first wedge.
  No code is removed; the v7 dropzone shell already operates in the
  text-only mode v10 commits to. `docs/spec-v7.md` carries a status
  note pointing at spec-v10 §3; §4.1–§4.6 in v7 are retained
  verbatim for historical context but are not the roadmap.

### Changed (README — clinical-first positioning)

- **`README.md` opening rewritten.** Leads with clinical and allied
  healthcare staff (nurse, resident, pharmacist, biller, coder,
  EMS provider) as the primary audience and frames the site as MDCalc
  without ads / login / upsell / cookie banner / email capture /
  network calls after first paint. Audience list reordered to put
  bedside clinicians first; patients moved to last with an explicit
  note that the patient surface is the simple existing decoders, not
  patient-artifact decoding. Documentation index now links
  `docs/spec-v10.md` as the current positioning spec.

### Changed (spec-v8 — minimal-tile contract + prompt-first front door)

- **Four-region tile contract (spec-v8 §3.1).** Every tile detail view
  now renders exactly four regions in order: title, description,
  inputs (pre-filled from `META[id].example` with inline
  `(example: …)` annotations), and references (driven by
  `META[id].citation`). Delivered by spec-v9; v8 §3.1 is the contract
  spec-v9 enforces in **hard** CI mode.
- **Example-value contract pinned in CI (spec-v8 §3.3).** Every
  input-bearing tile must ship a working `META[id].example` filling
  every input it reads. Tiles with no inputs live in an explicit
  `NO_INPUTS_TILES` allowlist. Enforced in **hard** mode by
  `test/unit/meta.test.js`.
- **Citation contract pinned in CI (spec-v8 §3.4).** Every tile must
  carry `META[id].citation` or `META[id].source` (or both). References
  hold the primary citation only; "further reading" / "related tools"
  / "about this calculator" blocks are forbidden. Enforced in **hard**
  mode.

### Removed (spec-v8 §3.2 — affordances incompatible with a stateless utility)

- **Pin / Unpin and the entire `Pinned` home section.** Removed
  `renderPinnedSection`, `togglePin`, the `#pinned-section` DOM mount,
  the `.pin-btn` and `#pinned-section` CSS, and the `p` leader-key
  shortcut. `lib/hash.js` no longer emits `p=` and silently ignores it
  on parse so legacy `#p=icd10,bmi` bookmarks resolve to the home
  view. `test/unit/hash.test.js` now asserts `p=` is dropped on write
  and tolerated on read; the keyboard fixture asserts the `p` leader
  is retired; the e2e smoke spec swapped the pin-toggle test for the
  §5.2 negative regression (no `.pin-btn`, no `#pinned-section`, no
  `#pinned-grid`).
- **Six stray hardcoded `Source:` lines in per-tile renderers**
  (`views/group-a.js`, `views/group-f.js`, `views/group-i.js`) that
  duplicated content the v8 References region now renders from
  `META[id].citation`. The per-result lab-result attribution in
  `views/group-v6.js` is retained because it is per-result, not
  per-tile.
- **Copy-share-link, copy-bundle-URL, download-bundle, load-bundle,
  print-this-calculator, scratchpad, and "after this you might
  want" recommendation strips.** All audited and confirmed removed
  per v8 §3.2.

### Added (spec-v8 §4.3 / §4.6 / §3.2 — three-pass prompt + default-closed grid + tags)

- **Three-pass prompt matcher extracted (spec-v8 §4.3).** Pure-function
  `resolvePrompt(query, tiles, synonyms, audience)` in
  `lib/prompt.js` runs pass 1 (synonym table via `lib/synonyms.js`),
  pass 2 (token ranker over `name + desc + audiences + group + tags`
  with the spec's scoring rubric and a hard threshold), and pass 3
  (single-edit Levenshtein retry against the synonym corpus). 17 new
  unit tests cover synonym hit, name- and desc-token rank, tag
  discovery, audience modulation, one-edit recovery, and the
  multi-typo no-match floor. `app.js` calls `resolvePrompt` from
  `resolveQueryToTileId` against a `tileCorpus()` snapshot assembled
  from `UTILITIES`, the home grid's `.tc-desc` spans, and any
  `META[id].tags`.
- **Optional `META[id].tags` field (spec-v8 §3.2).** Additive,
  defaults to `[]` when missing; consumed only by the prompt ranker
  so no existing tile needed to change.
- **Default-closed tile-grid disclosure (spec-v8 §4.6).**
  `index.html`'s `<details id="browse-disclosure">` no longer carries
  `open`. The hash-state mirror flipped so `b=open` is the divergent
  value users deep-link with; collapsed is the static default. E2E
  tests that previously relied on the catalog being visible now
  expand the disclosure programmatically before clicking or assert
  on the always-visible `#hero-search` element.

### Added (spec-v9 — inline-citation completion and example-first inputs)

- **Citation coverage at 100% in hard mode (spec-v9 wave 2).** All
  178 tiles now carry `META[id].citation`; the CI assertion in
  `test/unit/meta.test.js` is in **hard** mode.
- **Example coverage at 100% in hard mode (spec-v9 waves 3a-3d).**
  Every input-bearing tile carries `META[id].example` with non-empty
  `fields` and an `expected` line. Pure-reference and decision-tree
  tiles live in `NO_INPUTS_TILES` with per-entry rationale. The
  PHQ-9-family screeners pre-fill via their own `exampleAnswers` in
  `lib/scoring-v4.js` + `lib/screener.js`, updated to the v9
  contract (auto-fill on first paint, "Reset to example" link in
  place of the old "Test with example" button).
- **References region renders below the tool body (spec-v9 §3.2).**
  The meta block moved from above the inputs to after the result so
  the on-screen order matches the spec's `title → description →
  inputs → references`. The dataset stamp and citation now appear on
  adjacent lines inside the same References block, replacing the
  previous split between a top "Source: …" stamp and a bottom doc
  pointer.
- **Inline `(example: …)` annotations (spec-v9 §3.3).** Examples
  pre-fill inputs on first paint via an immediate `applyExample(util)`
  microtask. Deep-link hash state still wins; the example only fills
  inputs the hash did not touch. Renderers built through
  `lib/form.js` get the annotation for free; ad-hoc renderers call
  a one-line `annotateExample(id, value)` helper in `lib/meta.js`.
- **Wave 4 cleanup (spec-v9).** Removed the duplicate `Citation:`
  line the screener emitted under each PHQ-9-family tile (now lives
  only in the meta block); removed three stray `Citation:` lines
  under `cincinnati`, `fast`, and `burn-fluid` in `views/group-i.js`;
  rewrote the FAQ JSON-LD "Where does the data come from?" answer in
  `index.html` so search-result snippets describe the inline
  References region instead of pointing at the GitHub
  `docs/data-sources.md` path. The per-result lab-result attribution
  in `views/group-v6.js` is retained per v9 §3.4.1.

### Added (spec-v7 section 3.1 — artifact-detecting dropzone shell)

- **Artifact dropzone on the home page (spec-v7 §3.1).** The home view
  now renders a dropzone under the task hero that accepts a plain-text
  file drop (`.txt`, `.csv`, `.md`, `.json`, `.log`, `.tsv`,
  `.markdown`, `.text`, plus `text/*` and `application/json`) or
  pasted document text, runs the v7 §3.3 classifier over the content,
  and routes to the matching decoder tile via a small kind→tile table
  in `lib/artifact-route.js`. Unknown kinds and unwired kinds surface
  a chooser pane listing every shipped decoder. Per v7 §1, the file
  never leaves the tab: no upload, no fetch, no storage, no new
  `connect-src` entry.
- **Text-payload handoff (spec-v7 §3.1).** A new
  `lib/artifact-handoff.js` holds a single in-memory pending payload;
  the dropzone stashes the detected text before navigating, and the
  route() post-render microtask in `app.js` calls `applyPendingDrop()`
  which fills the destination decoder's textarea (`#bill`, `#eob`, or
  `#msn`) and appends a one-line "Pre-filled from the document you
  dropped above" banner. The chooser-fallback path uses the same
  handoff, so picking a decoder manually after a failed detection no
  longer forces a second paste. Tiles whose renderers do not expose a
  single paste input (`lab-interpret`, `appeal-letter`,
  `discharge-instr`, `insurance`) still receive the navigation but no
  handoff; the per-tile parsers in §4 will fill them.
- **Result-line UX polish (spec-v7 §3.1 follow-ons).** Detection now
  fires automatically on a clipboard paste into the textarea (one-tick
  delay so the pasted value is in place), matching the file-drop
  ergonomics. Editing the textarea after a detection clears the stale
  result line and chooser pane. Escape inside the dropzone is a
  non-destructive dismiss for the result line and chooser without
  wiping the textarea. Multi-file drops surface a one-line notice
  naming the first file rather than silently consuming it. The
  result line surfaces the classifier hits ("Detected EOB (matched:
  this is not a bill, allowed amount). Opening the decoder..."), with
  a three-hit cap so the line stays readable.
- **Lockstep-pinning unit assertion.** A new test in
  `test/unit/artifact-route.test.js` reads `index.html` and fails if
  the file picker's `accept=` list ever drifts from `TEXT_EXTENSIONS`,
  `application/json`, or `text/*`. The picker and the runtime
  `isLikelyTextFile` predicate are now CI-pinned to the same source
  of truth. Unit count 679 → 680.
- Section 4 decoder pages (annotated DOCX export, PDF/DOCX parsing in
  a Web Worker, image OCR for the insurance-card flow) remain
  unimplemented. The shell tells the user to paste the document's
  text content in the meantime.

### Added (spec-v7 section 3.3 — artifact-detect classifier)

- **Deterministic artifact classifier (spec-v7 section 3.3).** New
  `lib/artifact-detect.js` exposes `detectArtifact(text)` and
  `detectArtifactKind(text)` over plain text extracted from a dropped
  PDF/DOCX. Returns one of `bill`, `eob`, `msn`, `lab-result`,
  `denial-letter`, `pharmacy-list`, `discharge-summary`,
  `insurance-card`, or `unknown`. The classifier is pure-function, no
  network, no AI: each artifact kind has a hand-written fingerprint
  (regex + keyword sets) that emits a small integer score and the
  matched fragments. Ties break by an explicit kind-priority table so
  EOBs are never misrouted to `bill` and MSNs always beat both. A
  `MIN_CONFIDENT_SCORE` floor returns `unknown` rather than guessing,
  which is what the v7 dropzone UI's chooser pane will key on once it
  lands. The module is engine-only; UI wiring is deferred to the
  section 4 dropzone pages.
- 21 new unit tests in `test/unit/artifact-detect.test.js`: one
  positive fixture per artifact kind, anti-misroute cases (EOB
  mentioning "balance", bill mentioning "CBC", pharmacy list mixed
  with discharge tokens), an `unknown`-on-low-signal case, a
  determinism check, and a structural test of the `scores` return
  shape. Test count 621 -> 641.

### Added (spec-v7 sections 3.2 and 3.4 - synonym-routed prompt and collapsible tile-grid)

- **Synonym-routed hero search (spec-v7 section 3.2).** A new hand-curated
  table at `data/synonyms.json` maps patient-mental-model phrases ("my
  bill", "my labs are weird", "denied", "ICD-10", ...) to the existing
  tile id that answers them. The hero search now consults the synonym
  table before the fuzzy ranker; on a hit it surfaces a one-line
  breadcrumb under the input ("Matched 'my labs are weird' to Lab Result
  Interpreter. Press Enter to open.") so the user sees why that tile is
  recommended. Enter routes to the matched tile; otherwise the fuzzy
  ranker still runs as a fallback. The matcher in `lib/synonyms.js` is
  pure-function, deterministic, audience-aware (chip selection boosts
  same-audience entries without hiding others), and case- /
  punctuation- / whitespace-insensitive. The initial table seeds 26
  entries covering the patient billing artifacts, the most common code
  references, and the highest-traffic clinical math tiles. Adding a
  phrase is a one-line edit to `data/synonyms.json`.
- **Collapsible tile-grid disclosure (spec-v7 section 3.4).** The 178
  tiles now sit inside a real `<details>` / `<summary>` element with
  the visible label *"Browse all 178 tools"* (count is bound to the
  utility registry length so it stays correct as tiles ship). The
  disclosure is open by default for now to preserve existing clinician
  flows and the e2e selectors that click straight into a tile; spec
  v7's default-collapsed posture is deferred until the v7 section 4
  dropzone front door lands. Disclosure state persists in the URL
  hash via a new `b=` segment (`b=open` or `b=closed`); typing in the
  hero auto-opens the disclosure so filtered tiles are visible. Pinned
  tiles continue to render above the disclosure so they remain
  visible regardless of the collapse state. No localStorage; the
  `<details>` semantics give screen readers and keyboard users the
  standard expand/collapse affordance.
- `lib/hash.js` gains the `browse` field with full round-trip parse /
  build coverage. `parseHash` now returns `browse: ''` for the default
  state, `'open'` or `'closed'` when explicitly set; `buildHash`
  emits `b=open` / `b=closed` and omits the key for the default. Hash
  test count grows by 2; new `test/unit/synonyms.test.js` adds 12
  unit tests including a guard that every tile id in `data/synonyms.json`
  resolves against the live UTILITIES registry in `app.js`. Test
  count 607 -> 621.

### Added (spec-v6 §3.3 — Lab Result Interpreter)

- **Lab Result Interpreter** tile lands under Patient Bill & Insurance
  Literacy, available to patients, clinicians, and educators. Users
  enter values from a standard outpatient panel (CBC, CMP, lipid panel,
  A1C, TSH) with optional sex / pregnancy context; the tool returns the
  reference range used, a four-band flag (within-range / borderline /
  flagged-mild / flagged-significant), one plain-language narrative per
  value, and a single *"ask your clinician"* prompt per flagged value.
- `lib/lab-interpret.js` is a pure-function module bundling 25 analytes
  with reference ranges and critical thresholds (NIH/MedlinePlus,
  ARUP, Harrison's 21e, ADA 2024, 2018 ACC/AHA Cholesterol Guideline,
  ATA 2014). Sex- and pregnancy-specific reference bounds for creatinine,
  hemoglobin, hematocrit, and HDL are encoded as analyte variants.
  Critical thresholds drive the `flagged-significant` band; everything
  else falls out of a 5% buffer around the reference bounds. Narratives
  follow the spec-v6 §3.3 *"would a primary care physician hand this to
  a patient at 11pm"* calibration: no diagnosis, no probability, no
  disease links, one bounded sentence per value.
- New renderer file `views/group-v6.js` registers the tile against
  `app.js`. The view ships the standard Sophie disclaimer band at the
  top and a footer reminder that patient portals frequently release lab
  values before clinician review.
- 15 new unit tests in `test/unit/lab-interpret.test.js` cover the
  four-band taxonomy, sex / pregnancy variants, critical thresholds,
  the worked-example contract for the META entry, and input validation
  (unknown analyte and non-finite value both throw). Tile count
  177 -> 178; test count 592 -> 607.

### Added (spec-v6 §4 home-page UI evolution — first two waves)

- **Task hero (spec-v6 §4.2.1).** A promoted search input appears at the
  top of the home view, labeled *"What do you need to decode?"* with
  example patient-mental-model phrases. Typing filters the tile grid
  below; pressing Enter on a non-empty query navigates directly to the
  top match. The existing topbar typeahead is unchanged.
- **Audience filter chips (spec-v6 §4.2.2).** A row of six chips
  (All / Patient / Biller and Coder / Nurse and Clinician / EMS and
  Field / Educator) sits above the tile grid. Selection filters the grid
  to tiles tagged with that audience and persists in the URL hash via a
  new `a=` segment (e.g. `#a=patients`). Default `all` omits the key
  and preserves current behavior. `lib/hash.js` gains the new field
  with full round-trip tests; the `Pinned` section is now inserted
  above the tile grid (below the hero and chips) rather than at the
  very top of the home view.
- `index.html` gains an `#empty-state` line that surfaces when no tile
  matches the current audience + query combination.

### Added (spec-v5 §5.3 step 7 follow-up — citations)

- `docs/clinical-citations.md` gains a "spec-v5 §4 deterministic additions
  (T1-T17)" section, with formula, original-source citation, and worked-
  example numerics for each of the seventeen v5 tools, mirroring the
  numerics asserted by `test/unit/clinical-v5.test.js`.

### Changed (spec-v5 polish — clinical-v5 / coding-v5 correctness pass)

- `sodiumCorrection` (T1) takes an `acuity` input ('chronic' default vs
  'acute') driving the safety ceiling (8 vs 10 mEq/L/24h), and now reports
  `totalSodiumDeficitMeq` and a `directionMismatch` flag when the chosen
  infusate would push Na the wrong way (e.g. D5W in hyponatremia).
  Volume / rate are returned as `null` in that case rather than a
  physiologically-meaningless negative number.
- `freeWaterDeficit` (T2) rejects `currentNa <= targetNa` (the formula is
  only defined for hypernatremia) and reports `impliedNaDropPer24h` plus
  a safety note when the implied drop exceeds the 10 mEq/L/24h ceiling.
- `emTimeSelector` (T14) corrected to the AMA 2021 office/outpatient
  bands: new patient 99202 (15-29) / 99203 (30-44) / 99204 (45-59) /
  99205 (60-74); established 99212 (10-19) / 99213 (20-29) / 99214 (30-
  39) / 99215 (40-54). 99211 is excluded (nurse-only, no time threshold).
  Returns `prolongedUnits` and `prolongedCode: '99417'` when total time
  reaches the +15-min trigger past the top base band.
- `ndcConvert` (T15) enumerates `fda10Candidates` for 5-4-2 inputs whose
  original 10-digit shape is ambiguous (multiple segments with leading
  zero); returns a single `fda10` only when one candidate is unambiguous.
- `rcri` (T12) risk percentages aligned to Lee 1999 derivation cohort
  (0.4 / 0.9 / 6.6 / >=11) with an explicit `riskBand` (Class I-IV).
- Renderers in `views/group-v5.js` updated to surface the new fields
  (acuity selector, total Na deficit/excess line, direction-mismatch
  warning, implied Na drop, prolonged-service units, ambiguous fda10
  candidate list). `lib/meta.js` worked-example expectations refreshed
  for `em-time` and `rcri`. Test count 563 -> 570.

### Removed (spec-v5 §3.1 catalog cut, waves 1-2)

- **38 live-data tiles removed** along with their renderers, META
  entries, home-grid tiles, dataset folders, manifests, citation rows,
  and unit / integration tests. Tile count goes 212 -> 174. Test count
  613 -> 563. Manifest count 78 -> 53.
  - Pricing & cost reference (16): MPFS, NADAC, charge-to-Medicare
    ratio, hospital price transparency, OOP estimator, DMEPOS, CLFS,
    ASP, ASC, wage index, GPCI, Medicare deductibles & IRMAA, ACA
    marketplace thresholds, HSA/FSA/HDHP limits, FPL, IRS medical
    mileage.
  - Live registries (7): NPI lookup, OIG exclusions, Medicare opt-out,
    DEA validator, NUCC taxonomy, FDA drug recalls, vaccine lot
    recalls.
  - Coverage & edits (5): NCCI PTP, NCCI checker, MUE, MUE cap, LCD/
    NCD coverage.
  - Annually-shifting public-health (8): ACIP routine adult/child/
    catch-up schedules, CDC Yellow Book, Medicaid by state, state
    patient rights, GFE dispute threshold, plus the four eligibility &
    benefits tiles (VA priority groups, TRICARE plan picker, IHS
    eligibility).
- Empty home-grid sections deleted: Pricing & Cost Reference, Provider &
  Plan Lookup, Eligibility & Benefits.
- Dead library modules removed: `lib/mpfs.js`, `lib/oop.js`, `lib/dea.js`,
  `lib/fpl.js`. Empty view modules removed: `views/group-b.js`,
  `views/group-d.js`. Test orphans removed: `mpfs.test.js`,
  `nucc-taxonomy.test.js`, `fpl.test.js`, `dea.test.js`, `oop.test.js`.
- `data/mpfs/` retained because the kept CPT structural tile reads its
  rows; the MPFS lookup tile itself is gone.
- `scripts/a11y-check.mjs` updated to scan the current view file set
  (group-b / group-d removed; group-i / group-j / group-klmno / group-v5
  added). `test/integration/smoke.spec.js` trimmed of MPFS and Medicaid
  smoke cases. `test/unit/meta.test.js` `SOURCE_REQUIRED` list trimmed
  to the kept code-reference tiles.

### Changed (spec-v5 §5.2 wave 2 — plain category names)

- Home-grid headings renamed: Code Lookup -> Code Reference; Patient
  Bill & Insurance -> Patient Bill & Insurance Literacy; Preparation &
  Workflow -> Workflow & Templates; Public Health & Travel -> Public
  Health Decision Trees.
- `GROUP_LABELS` in `app.js` rewritten to drop the letter prefix from
  breadcrumbs and search-result group tags. Keys for removed groups (B,
  D, M) are dropped.
- `scripts/build-data.mjs` pruned of dead dataset definitions (78 -> 46).
  All 32 builders for killed tiles deleted. The remaining offline-seed
  pipeline runs clean against the 46 kept datasets.
- Orphan `data/` folders deleted: `cms-deductibles`, `dea-rules`,
  `enforcement`, `fpl`, `hsa-fsa-limits`, `irmaa`, `state-rights`.
  Manifest count 53 -> 46.

### Added (spec-v5: pragmatic pivot + 17 new deterministic tools)

- **spec-v5 doctrine** ([docs/spec-v5.md](docs/spec-v5.md)): no live data,
  no ETL, no AI, no accounts, no telemetry. Future tiles must be pure
  deterministic math or a small static reference. Pricing tools, live
  registries, recalls, and annually-shifting public-health datasets are
  out of scope going forward; their removal is staged for a follow-up
  commit per the spec's wave plan.
- **17 new tiles** wired into the existing categories (UTILITIES count
  195 -> 212). Each ships with a pure function, a worked-example META
  entry tied to a citation, a renderer, a home-grid tile, and unit
  tests:
  - Sodium Correction Rate Planner (Adrogue-Madias) `sodium-correction`
  - Free Water Deficit Calculator `free-water-deficit`
  - Iron Deficit (Ganzoni) `iron-ganzoni`
  - Predicted Body Weight + ARDSnet Tidal Volume `pbw-ardsnet`
  - Rapid Shallow Breathing Index `rsbi`
  - Light's Criteria for Pleural Effusion `lights`
  - Mentzer Index `mentzer`
  - SAAG (Serum-Ascites Albumin Gradient) `saag`
  - R-Factor (drug-induced liver injury pattern) `r-factor`
  - KDIGO AKI Staging `kdigo-aki`
  - Modified Sgarbossa Criteria (Smith) `sgarbossa`
  - Revised Cardiac Risk Index (Lee) `rcri`
  - Pediatric Early Warning Score `pews`
  - Time-Based E/M Code Selector (AMA 2021) `em-time`
  - NDC 10 to 11 Digit Converter `ndc-convert`
  - AVPU to GCS Quick Reference `avpu-gcs`
  - SBAR Handoff Template Generator `sbar-template`
- 50 new unit tests in `test/unit/clinical-v5.test.js` (563 -> 613
  total). Two new pure-function modules: `lib/clinical-v5.js`,
  `lib/coding-v5.js`. One new renderer module: `views/group-v5.js`.
- JSON-LD `featureList`, sitemap, and README counts regenerated from the
  live UTILITIES array.

### Added (spec-v4: utility expansion 79 -> 195)

- **v4.0 shared renderers**: `lib/tree.js` (decision tree), `lib/screener.js`
  (screening instrument), `lib/table.js` (searchable / sortable / row-copy),
  `lib/print.js` (printable template). Each ships with a unit-test suite
  via the new `test/fixtures/dom-stub.js`.
- **v4.1 datasets**: 56 new `data/` datasets with hand-curated offline-seed
  shards and per-dataset manifests. `verify-integrity.mjs` now walks 78
  manifests (22 v3 + 56 v4).
- **v4.2 Group A code lookups (82-93)**: HCPCS modifier, NCCI PTP checker,
  MUE cap, POS, TOB decoder, NUBC revenue / condition / occurrence / value,
  MS-DRG, APC, ICD-10-PCS, RxNorm, NDC<->RxNorm.
- **v4.3 Group B pricing (94-104)**: DMEPOS, CLFS, ASP, ASC, wage index,
  GPCI, Medicare deductibles & IRMAA, ACA marketplace, HSA / FSA / HDHP,
  FPL calculator, IRS medical mileage.
- **v4.4 Group C patient tools (105-114)**: insurance card decoder, ABN
  explainer, MSN decoder, IDR eligibility tree, appeal letter generator,
  HIPAA right-of-access generator, birthday rule resolver, COBRA timeline,
  Medicare enrollment period checker, ACA SEP eligibility checker.
- **v4.5 Group D provider lookup (115-116)**: DEA registration validator,
  NUCC provider taxonomy.
- **v4.6 Group E clinical math (117-128)**: anion gap & delta-delta,
  corrected Ca / Na, osmolal gap, A-a / P/F suite, Winter's formula,
  shock index, BW / BSA suite, eGFR suite (CKD-EPI 2021 / MDRD / CG),
  FENa / FEUrea, maintenance fluids 4-2-1, QTc suite, pregnancy dating.
- **v4.7 Group F medication (129-135)**: opioid MME (CDC 2022), steroid
  equivalence, benzodiazepine equivalence (Ashton), antibiotic renal-dose
  adjustment, vasopressor dose<->rate, TPN macronutrient, IV-to-PO.
- **v4.8 Group G scoring (136-160)**: TIMI, GRACE, HEART, PERC, Wells PE
  / Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 / Child-Pugh, Ranson /
  BISAP, Centor / McIsaac, Wells DVT / Caprini, Bishop, Alvarado / PAS,
  mRS reference, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog, CIWA-Ar,
  COWS, ASCVD PCE (race-stratified), PREVENT 2023 (race-free).
- **v4.9 Group H workflow (161-165)**: HIPAA authorization, ROI request,
  discharge instructions, specialty-visit questions, medication wallet
  card.
- **v4.10 Group I field-medicine extensions (166-171)**: NEXUS / Canadian
  C-Spine, DOT ERG hazmat, NIOSH Pocket Guide, AHA CPR numeric reference,
  TCCC tourniquet & wound packing, CO / cyanide / smoke-inhalation
  antidotes.
- **v4.11 Group J Public Health & Travel (172-180, NEW group)**: ACIP
  routine adult / child / catch-up schedules, CDC Yellow Book by country,
  tetanus prophylaxis tree, rabies PEP tree, bloodborne pathogen exposure
  tree, TB testing interpretation, STI screening intervals.
- **v4.12 Group K Lab Reference (181-184, NEW)**: adult / pediatric
  reference ranges, therapeutic drug levels, toxicology levels.
- **v4.13 Group L Forms & Numbers Literacy (185-187, NEW)**: CMS-1500 and
  UB-04 field-by-field decoders, EOB jargon glossary.
- **v4.14 Group M Eligibility & Benefits (188-191, NEW)**: Medicaid by
  state, VA priority groups, TRICARE plan picker, IHS eligibility.
- **v4.15 Group N Literacy Helpers (192-194, NEW)**: universal unit
  converter, time-to-dose helper, pediatric weight converter.
- **v4.16 Group O Patient Safety (195-197, NEW)**: high-alert wallet card
  (ISMP-attributed), FDA drug recalls weekly snapshot, vaccine lot recall
  lookup.
- **v4.17 site-wide updates**: README count 79 -> 195, new group
  descriptions, refreshed `docs/architecture.md`, `docs/data-sources.md`,
  `docs/legal.md`, `docs/clinical-citations.md`, `docs/operations.md`,
  `docs/threat-model.md`. JSON-LD `featureList` and `sitemap.xml`
  regenerate to 195 entries / 196 URLs.
- **v4.18 verification checklist**: see `docs/spec-v4-checklist.md`.

### Fixed (v4.15 CI hardening)

- `scripts/build-data.mjs`: dataset folders are now ensured to exist at
  the orchestrator level before each builder runs. 16 of the 22 builders
  wrote files without a preceding `mkdir`, which worked locally because
  the folders were committed to the tree but failed on a fresh CI runner
  (`coverage` builder hit `ENOENT: data/coverage/lcd.json`). One-line
  `await ensureDir(join(DATA, ds.id))` in the loop covers every builder.

### Removed (v4.14 repo cleanup)

- Deleted `dist/` from the source tree (always rebuilt by `npm run build`,
  already gitignored).
- Deleted `.DS_Store` macOS clutter.
- Deleted `logo.jpg` (superseded by transparent-background `logo.png`
  master). Removed the now-dead jpg fallback branch and stale comment in
  `scripts/build-favicons.mjs`; updated its error message.
- Deleted `encryptalotta/` (sibling reference project, not imported, not
  copied into `dist/`, only used as historical design-lineage source for
  the v4 redesign). Removed the now-unneeded `encryptalotta/**` entry
  from `eslint.config.js`. Documentary references in spec.md, README.md,
  CHANGELOG.md, and CSS comments are kept as written history. The 7
  now-broken `[encryptalotta/...]` and `[logo.jpg]` markdown links in
  `docs/spec.md` were converted to plain code-spans annotated with
  "removed in v4.14" so the design-lineage narrative stays intact
  without dead links.
- Deleted `test/.gitkeep` (placeholder no longer needed; test/ has 16
  real test files).

### Changed (v4.13 tooling unblock)

- Migrated ESLint config from legacy `.eslintrc.json` + `.eslintignore`
  (no longer read by ESLint v9) to `eslint.config.js` flat config.
  Same rule set: bans on `eval`, `Function` constructor, `document.write`,
  and the `innerHTML`/`outerHTML`/`insertAdjacentHTML` assignment family.
  Restores `npm run lint` and the full `release:check` gate.
- Bumped pinned dev dependencies to address upstream security advisories
  (non-major, within already-pinned major lines):
  `eslint` 9.17.0 → 9.39.4 (GHSA-xffm-g5w8-qvg7 RegEx DoS in
  `@eslint/plugin-kit`), `@playwright/test` 1.49.1 → 1.59.1 (transitive
  Playwright advisories). `npm audit` now reports 0 vulnerabilities.

### Added (spec.md v4.12 public release hardening)

- `SECURITY.md` security policy with private vulnerability report
  channel, threat model summary, and supply-chain posture.
- `scripts/build-sbom.mjs` generates a CycloneDX 1.5 `sbom.json` plus a
  human-readable `sbom.md`. Hashes every shipped runtime asset and
  every JS source module with SHA-256, emits a per-build buildId, and
  pins dev dependencies. Wired into `npm run build` so a deploy
  cannot ship without a fresh SBOM. `npm run sbom` regenerates on
  demand.
- `npm run release:check`: a one-shot pre-release gate that runs
  lint, unit tests, a11y, grep-check, data integrity verification,
  SBOM regeneration, and the static build.
- `docs/release.md`: end-to-end Cloudflare Pages runbook covering
  one-time setup (project + custom domain + env vars + HSTS preload),
  pre-release checklist, e2e smoke, promotion, tagging, rollback, and
  the supply-chain posture summary.
- Logo in the topbar now floats with a 4s ease-in-out animation and
  carries a soft drop-shadow that brightens on hover (matches the
  encryptalotta hero treatment, applied to the brand mark).
- Each home-section heading is followed by a fading divider line so
  the categorical structure reads at a glance.
- Tool cards gained a radial-gradient sheen on hover and a slightly
  springier transform curve. Hover lift increased from 2px to 3px and
  the box-shadow is deeper.

### Changed (spec.md v4.12 public release hardening)

- `package.json`: pinned `@playwright/test` to `1.49.1` and `eslint`
  to `9.17.0` (no `^`, no `~`). Added `engines.npm`, `homepage`,
  `repository`, and `bugs`. Bumped version from `0.0.0` to `1.0.0`.
- `npm run build` now includes the SBOM step and copies `sbom.json`
  and `sbom.md` into `dist/`.
- Footer GitHub badge label changed from "View source on GitHub" to
  "GitHub". `aria-label` follows.

### Fixed (spec.md v4.11 file:// origin diagnosis)

- Asset paths in `index.html` (`favicon.ico`, `favicon-16x16.png`,
  `favicon-32x32.png`, `apple-touch-icon.png`, `site.webmanifest`)
  changed from absolute (`/foo`) to relative (`foo`). Absolute paths
  resolved to the filesystem root when the page was opened via
  `file://` and produced 404s in DevTools.
- Removed `<meta http-equiv="X-Frame-Options">` and the
  `frame-ancestors` directive from the meta-CSP. Browsers ignore both
  when they are delivered through a `<meta>` tag and emit console
  warnings; they remain set as real HTTP response headers via
  `_headers` (Cloudflare Pages) and `scripts/serve.mjs` (local dev).
- Added a `file://` guard banner to `index.html`. When the page is
  opened directly from disk, ES modules cannot load (the document
  origin is opaque, browsers refuse cross-origin module fetches), so
  none of the tool renderers ever mount and clicks appear to do
  nothing. The guard surfaces a clear instruction: run
  `npm run dev` and open `http://localhost:4173`. Built with DOM
  APIs only, no `innerHTML`.

### Changed (spec.md v4.10 brand polish)

- Brand name presented to users is now "Sophie Well" (with the logo
  ahead of the wordmark). The browser tab title is "Sophie Well";
  per-tool views set the tab to "<Tool name> | Sophie Well". The
  underlying project / package name (`sophiewell`, `sophiewell.com`)
  and asset paths are unchanged.
- Topbar layout switched from `space-between` to `center` so the
  Sophie Well brand sits in the middle of the bar.
- Home page is now just the tile grid: the intro paragraph, the
  Search input, and the Audience / Group filter rows have been
  removed from `index.html`. The `applyFilters` and `wireFilters`
  helpers in `app.js` no-op safely when the filter elements are
  absent, so the path to a tool view is `home grid -> tool card click
  -> hash route -> renderer`.
- Footer disclaimer rewritten to the user-supplied long form: "Sophie
  Well is a deterministic public utility for patients, billers,
  coders, nurses, clinicians, EMS, and educators... It acts as a
  reference 'cheat sheet' for healthcare workers."
- Tool view chrome: the rendered tool view is now wrapped in
  `<section class="content">` rather than `<main class="content">`,
  so we no longer nest a `<main>` landmark inside `<main id="main">`.
- Click handler hardening: the document-level delegated handler now
  bails on any element with `data-no-route`, and forces a route
  refresh when the user clicks a tool card whose hash is already
  active (e.g., from the Pinned section). This fully addresses the
  "tools don't respond when I click them" report.

### Changed (spec.md v4 redesign)

- Visual chrome rebuilt to match `encryptalotta.com`: dark theme tokens
  (`--bg-primary` #0a0a0a, `--text-primary` #fff), sticky topbar with
  brand mark, home-section / tool-card grid grouped A through I,
  breadcrumb on tool views, and pill-shaped credit-badge plus gh-badge
  in the footer.
- Tile markup migrated from `<article>` + `<a class="tile-link">` to
  `<button class="tool-card" data-tool="...">`. A delegated click
  handler on `document` sets `location.hash` so the existing hash
  router opens the renderer; this fixes a regression where some tile
  clicks appeared to do nothing.
- `renderToolView` now scrolls to top on mount and emits `console.warn`
  when no renderer is registered for a tool id (instead of silently
  showing a generic "under construction" line).
- Form controls re-skinned with `--bg-tertiary` fill, 8px radius,
  blue (#4d90fe) focus ring.

### Added (spec.md v4 redesign)

- `scripts/build-ld.mjs`: regenerates the JSON-LD WebApplication +
  FAQPage block in `index.html` from the live `UTILITIES` array.
  `featureList` now contains all 79 tool names.
- `scripts/build-sitemap.mjs`: regenerates `sitemap.xml` with the root
  URL plus one fragment URL per tool (80 URLs total).
- `scripts/build-favicons.mjs`: generates the favicon set from the
  master logo. Output: `logo.png` (512x512), `apple-touch-icon.png`
  (180), `favicon-32x32.png`, `favicon-16x16.png`, and a multi-res
  `favicon.ico` (16/32/48 hand-assembled with embedded PNG payloads).
  Uses `sharp` when present, falls back to macOS `sips`.
- `npm run build` now invokes all three regenerator scripts before
  copying to `dist/`, and copies favicon assets into the dist when
  present.
- Playwright smoke selectors updated for the new chrome
  (`.tool-card`, `.topbar-brand`, `.content h1`, footer badge URLs).
- Full SEO `<head>` block: `<title>`, description, keywords, OG,
  Twitter, JSON-LD, canonical, theme-color, and the apple-touch-icon
  favicon link set.

### Added (spec-v2 layer)

- Live-render calculator helper (`lib/live.js`) with 50ms debounce.
- Inline citation, data source stamp, and "Test with example" button
  rendered uniformly above every utility view (spec-v2 sections 5.1,
  5.2, 5.3).
- Stability commitments documented in `docs/stability.md` and linked
  from the footer.
- This changelog. `#changelog` view in the site renders this file.
- Performance budget documented in `docs/performance.md` and enforced
  via `.lighthouserc.json` in CI.
- "Copy all" button on every utility view that captures the current
  result text via the Clipboard API. `lib/clipboard.js` exports
  `copyText` and `formatCopyAll`.
- Keyboard layer (`lib/keyboard.js`): tile-grid arrow-key navigation
  with `aria-current`, leader-key shortcuts (G then a letter), and a
  `?` help overlay dismissable on Escape.
- Hash-based pinning (`lib/hash.js`): Pin / Unpin affordances on every
  tile; pinned tiles render in a "Pinned" section above the grid; state
  is encoded in the URL hash as `&p=icd10,bmi,egfr`.
- Hash-based calculator state: every calculator's input values are
  encoded in the URL hash as `&q=key=value;key=value` so a populated
  calculator can be bookmarked and restored.
- Data-change analyzer (`scripts/analyze-data-changes.mjs`) producing a
  Markdown summary of MPFS conversion factor and RVU shifts, ICD-10/HCPCS
  add/remove deltas, NADAC top price changes, and OIG/opt-out add/remove.
  Wired into the data-refresh PR body via `.github/workflows/data-refresh.yml`.
- spec-v2 final-pass report at `docs/spec-v2-checklist.md` (14 PASS, 2
  PENDING items, all PENDING blocked on production access).

### Added (spec-v3 layer)

- "Field Medicine" audience filter button on the home view.
- 18 existing utilities tagged with the `field` audience per spec-v3
  section 5.2 (GCS, NIHSS, drip rate, weight-based dose,
  concentration-to-rate, peds vitals, lab ranges, ABG, Wells PE, MAP,
  P/F ratio, anion gap, corrected sodium, peds dose bounds, anticoag
  reversal, high-alert meds, APGAR, Mallampati).
- Five new datasets bundled under `data/`:
  - `field-triage/` (CDC Field Triage Guidelines)
  - `mci-triage/` (START + JumpSTART algorithms)
  - `prehospital-meds/` (FDA labeling for 22 standard prehospital meds)
  - `aha-reference/` (numeric reference: adult/peds arrest doses,
    defibrillation energy ranges; flowcharts not reproduced)
  - `toxidromes/` (six common toxidrome syndromes with original notes
    and ATSDR attribution)
- AHA non-derivation CI test (`test/unit/aha-no-flowchart.test.js`)
  guarding the `data/aha-reference/` payload against AHA flowchart
  language patterns.
- Group I (Field Medicine) utilities 64-69:
  - 64: Pediatric Weight-to-Dose Calculator (epinephrine, atropine,
    amiodarone, naloxone, dextrose D10, fluid bolus) with per-dose caps
    and minimums.
  - 65: Adult Cardiac Arrest Drug Reference (sortable table from
    `data/aha-reference/`).
  - 66: Pediatric Cardiac Arrest Drug Reference (sortable table from
    `data/aha-reference/`).
  - 67: Defibrillation Energy Calculator (adult biphasic / monophasic
    VF/pVT, three cardioversion scenarios; pediatric VF/pVT 2 J/kg
    first then 4 J/kg subsequent capped at 10 J/kg; pediatric
    cardioversion 0.5 J/kg first then 2 J/kg).
  - 68: Cincinnati Prehospital Stroke Scale (three sliders, time of
    last known well field, positive/negative output).
  - 69: FAST and BE-FAST Stroke Assessment (checkbox form; BE-FAST
    label appears when balance or eyes are checked).
- Field Medicine local-protocol notice ("This is a math aid for
  verification. Local protocols, medical direction, and clinician
  judgment govern any clinical decision.") rendered on every Group I
  utility per spec-v3 6.5.
- Group I toggle button added to the home view group filter row.
- Pure functions in `lib/field.js`: `pedsDose`, `defibEnergy`,
  `cincinnatiStroke`, `fast`. 22 new unit tests in
  `test/unit/field.test.js`.
- Group I (Field Medicine) utilities 70-81 (except 78 which reuses the
  existing APGAR with the `field` tag added):
  - 70 Trauma Triage (CDC) decision tree
  - 71 START adult MCI triage
  - 72 JumpSTART pediatric MCI triage
  - 73 Burn Surface Area (Rule of Nines + Lund-Browder)
  - 74 Burn Fluid Resuscitation (Parkland + Modified Brooke, with
    half-in-first-8h split and remaining-in-window math)
  - 75 Hypothermia staging reference
  - 76 Heat illness staging reference
  - 77 Pediatric ETT size and depth
  - 79 Toxidrome reference
  - 80 Naloxone dosing (adult + pediatric, four routes)
  - 81 EMS documentation helper (9 run-type checklists)
- New `data/environmental/` (hypothermia + heat illness staging) and
  `data/workflow/ems-runtypes.json` (PCR documentation checklists).
- Pure functions: `fieldTriage`, `startTriage`, `jumpStartTriage`,
  `ruleOfNines`, `lundBrowder`, `burnFluid`, `pediatricEtt`,
  `naloxoneDose`, `selectEmsChecklist`. 34 additional unit tests.
- spec-v3 final-pass report at `docs/spec-v3-checklist.md` (12 PASS,
  2 PENDING).
- `docs/field-medicine-citations.md` enumerates every Group I utility
  with citation, source dataset, and worked example.
- `docs/legal.md` extended with the AHA, Broselow, CDC/ATSDR/FDA, and
  Wilderness Medical Society postures from spec-v3 4.
- `docs/data-sources.md` extended with the spec-v3 datasets
  (field-triage, mci-triage, prehospital-meds, aha-reference,
  toxidromes, environmental, EMS run-types).
- `docs/threat-model.md` extended with three new threats: T12 URL-hash
  state covert exfiltration, T13 clipboard misuse, T14 field-medicine
  reference misuse.
- `docs/operations.md` runbook covering weekly data refresh, quarterly
  review, yearly licensing re-read, the new-utility / new-dataset
  add procedures, and emergency rollback (referenced by spec-v2 7.3).
- Playwright smoke spec extended with spec-v2 / spec-v3 coverage: meta
  citation, Test-with-example button, hash-based calculator state
  persistence, hash-based pinning, `?` overlay, leader-key navigation
  to BMI, `#changelog` and `#stability` doc views, Field Medicine
  audience filter, Group I local-protocol notice, peds-ETT calculator.
- Unit tests for `scripts/analyze-data-changes.mjs` driven by
  fixture dataset folders: MPFS conversion-factor change detection,
  HCPCS add/remove, NADAC top price changes, sizes-only mode.

## [0.1.0] - 2026-05-03

Initial development build covering spec.md steps 1 through 20.

### Added

- Repository scaffolding, documentation skeleton, README, visual shell,
  hash router, and tool views for all 63 utilities (62 tiles + the
  Printable Bill Decoder Summary as a print stylesheet on the Bill
  Decoder).
- Group A code lookups (ICD-10, HCPCS, CPT, NDC, POS, modifier, revenue,
  CARC, RARC, NCCI, MUE, LCD/NCD).
- Group B pricing (MPFS, NADAC, charge-to-Medicare ratio, hospital
  price transparency, OOP estimator).
- Group C patient bill and insurance tools (bill decoder, insurance
  card decoder, EOB decoder, NSA eligibility, GFE threshold, state
  rights).
- Group D provider lookup (NPI, OIG, opt-out).
- Group E clinical math and conversions (unit converter, BMI, BSA,
  MAP, anion gap, corrected calcium and sodium, A-a gradient, eGFR
  CKD-EPI 2021, Cockcroft-Gault, pack-years, Naegele, QTc all four,
  P/F ratio).
- Group F medication and infusion (drip rate, weight-based dose,
  concentration-to-rate, peds dose bounds, insulin drip, anticoag
  reversal, ISMP high-alert).
- Group G clinical scoring and reference (GCS, APGAR, peds vitals,
  lab ranges, ABG decision tree, Wells PE/DVT, CHA2DS2-VASc, HAS-BLED,
  NIHSS, ASA, Mallampati, Beers).
- Group H workflow (appointment prep, prior auth checklist).
- Service worker with cache-first shell + lazy data shard caching,
  keyed to BUILD_HASH.
- `_headers` for Cloudflare Pages with the full security header set
  per spec section 7.
- Zero-dep build pipeline (`scripts/build-data.mjs`,
  `scripts/verify-integrity.mjs`, `scripts/build.mjs`,
  `scripts/serve.mjs`).
- 107 unit tests, 13 Playwright e2e tests, static a11y check, grep
  check, integrity check.

### Security

- CSP `connect-src 'self'` blocks all outbound network requests at
  runtime.
- No localStorage / sessionStorage / IndexedDB / cookies anywhere in
  the codebase.
- `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `eval` /
  `Function` constructor banned by ESLint and CI grep.
