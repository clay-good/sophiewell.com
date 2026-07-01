# MCP coverage ledger (spec-v183)

This is the honest coverage record for the optional stdio MCP server
(`mcp/server.js`). It lists exactly which catalog calculators are exposed as
deterministic MCP tools. `scripts/check-mcp-catalog.mjs` asserts that the
**Exposed** list below equals the live adapter registry (`mcp/catalog.js`)
exactly — no more, no less — and that each exposed example round-trips.

The MCP coverage count is a **subset** of the catalog and is deliberately
**not** one of the 13 catalog-truth count surfaces (spec-v46): it must never be
conflated with `UTILITIES.length`. The live total is reported at runtime by
`list_calculators` (`"<N> of <M> catalog tiles exposed"`), never hardcoded here.

Adapting the catalog is incremental, module by module, against a fixed contract
(`mcp/fields.js`): an adapter declares only the input schema and two pure mapping
functions; the name, group, specialties, citation, example, and interpretation
are read from `UTILITIES` and `META`, never re-typed.

## First wave (spec-v183) — 4 modules

The proof-of-pattern slice: 21 clinical calculators across 4 `lib` modules, each
with a JSON-Schema input contract, an example that round-trips to its
`META.example.expected`, a citation echoed from `META`, and a clinical-posture
disclaimer.

## Second wave — 4 modules

Coverage extends, module by module against the same fixed contract, with 18 more
clinical calculators across 4 `lib` modules (pulmonary function, hemorrhagic
stroke / SAH / IVH, metabolic / endocrine, and perioperative risk). Two tiles in
these modules are intentionally not adapted: `phases-iph` has no `META.example`
to round-trip, and `pospom` takes a variable-length comorbidity array that needs
a bespoke `toArgs` (deferred). Subset exposure of a module is fine — the ledger
lists exactly which ids are live.

## Third wave — 1 module

Coverage extends with the six one-formula tiles in `lib/oneformula-v167.js`
(mean airway pressure, cerebroplacental ratio, toe-brachial index, stool osmotic
gap, pure-tone average, and the Rutgeerts endoscopic grade), all `clinical:true`
and each with a `META.example` that round-trips. Five are pure numeric formulas;
`rutgeerts` is a categorical i0–i4 grade whose example still round-trips (the
grade digit appears in the result). Brings the exposed total to 45 calculators
across 9 modules.

## Fourth wave — 3 modules

Coverage extends with 15 more clinical calculators across 3 `lib` modules:
atrial-fibrillation stroke-risk and QT-prolongation (`lib/cardio-v101.js` — five
tiles), hematology pretest / risk scores (`lib/heme-v132.js` — five tiles), and
gastroenterology disease-activity / severity indices (`lib/gi-v126.js` — five
tiles). One tile in `lib/gi-v126.js` is intentionally not adapted: `ses-cd`
takes per-segment input arrays (`sumArr`), not the flat `dom→arg→kind` contract
this wave covers. Brings the exposed total to **60 calculators across 12
modules**. The yes/no clinical questions map to enums (the heme `flag()` helper
distinguishes an explicit `no` from a blank), and the banded grades / lab values
map to numbers; every exposed example round-trips to its `META.example.expected`.

## Fifth wave — 7 modules

Coverage extends with 35 more clinical calculators across 7 `lib` modules:
heart-failure risk / HFpEF probability (`lib/cardio-v102.js` — MAGGIC, H2FPEF,
HFA-PEFF, CardShock), wide-complex-tachycardia and syncope-risk algorithms
(`lib/cardio-v104.js` — Brugada, Vereckei, ADD-RS, ROSE, EGSYS, OESIL),
cardiovascular-risk engines (`lib/cvrisk-v103.js` — SCORE2, SCORE2-OP, MESA,
Framingham, Reynolds, non-HDL / remnant), critical-care severity and ICU-weakness
scores (`lib/critcare-v112.js` — MEDS, SIC, CPIS-VAP, lactate clearance, MRC sum
score), dynamic fluid-responsiveness measures (`lib/fluidresp-v113.js` — IVC
variation, PPV/SVV, passive leg raise), hepatology / GI severity and
disease-activity indices (`lib/hepgi-v93.js` — NAFLD Fibrosis Score,
Glasgow-Imrie, Truelove-Witts, Harvey-Bradshaw, Mayo, Milan), and hematology /
oncology prognostic scores (`lib/hemonc-v94.js` — HScore, IPSS-R, FLIPI, MASCC,
Sokal). Brings the exposed total to **95 calculators across 19 modules**. The
CPIS-VAP and Truelove-Witts temperature inputs are entered in degrees Celsius
(the lib reads the canonical Celsius value directly, so the example round-trips
without a unit field); the MRC sum score takes a fixed twelve-key set of
manual-muscle-test grades, each a 0-5 number, not a variable-length array. Every
exposed example round-trips to its `META.example.expected`.

## Sixth wave — 8 modules

Coverage extends with 36 more clinical calculators across 8 `lib` modules:
stroke-triage and cerebrovascular scores (`lib/neuro-v119.js` — CPSSS / C-STAT,
FAST-ED, Boston Criteria v2.0 for CAA, the ISCVT CVT-risk score), seizure /
headache / vertigo bedside instruments (`lib/neuro-v120.js` — STESS, 2HELPS2B,
MESS, POUND, the HINTS exam), neuromuscular prediction and classification
(`lib/neuro-v121.js` — EGRIS, mEGOS, the Brighton GBS case definition, the MGFA
class with MG-ADL), dementia / spasticity / brainstem-encephalitis instruments
(`lib/neuro-v122.js` — the Hachinski ischemic score, the Modified Ashworth grade,
the Bickerstaff checklist), nephrology risk / AKI staging (`lib/nephro-v127.js` —
KFRE, RIFLE, AKIN, the dialysis ultrafiltration rate), renal-physiology formulas
(`lib/renal-v128.js` — FEPO4, FEMg, nPCR, standard Kt/V, electrolyte-free water
clearance), and two urology clusters (`lib/uro-v130.js` — prostate volume, PSA
density / velocity / doubling time, the D'Amico risk group, the Gleason grade
group; `lib/uro-v131.js` — CAPRA, the R.E.N.A.L. and PADUA nephrometry scores,
S.T.O.N.E. nephrolithometry, and the TWIST torsion score). Brings the exposed
total to **131 calculators across 27 modules**. The HINTS exam and the Bickerstaff
checklist are categorical instruments whose number-free examples round-trip
through the band/note text; the R.E.N.A.L. hilar suffix is an empty-string /
`h` enum (the lib treats `'h'` as the hilar flag), and the TWIST yes/no findings
map to booleans the lib `present()` helper coerces. Every exposed example
round-trips to its `META.example.expected`.

## Seventh wave — 8 modules

Coverage extends with 36 more clinical calculators across 8 `lib` modules:
critical-care hemodynamics and ventilation mechanics (`lib/hemodynamics-v87.js` —
the invasive hemodynamic suite, mechanical power of ventilation, physiologic
dead-space fraction), nephrology staging / adequacy / risk (`lib/nephro-v92.js` —
KDIGO CKD staging, spot UACR/UPCR, hemodialysis URR + Daugirdas Kt/V, the Mehran
contrast-nephropathy score, and the 2021 race-free CKD-EPI cystatin estimates),
evidence-based-medicine math (`lib/ebm-v163.js` — Fagan post-test probability, the
2x2 diagnostic table, and ARR / RR / NNT), ophthalmology (`lib/ophtho-v164.js` —
SRK II IOL power, the Snellen / logMAR / decimal visual-acuity converter, and
ocular perfusion pressure), echocardiography (`lib/echo-v158.js` — LV mass index +
geometry, LA volume index, Teichholz LVEF, RVSP / PASP from the TR jet, and E/e'),
rheumatology activity / classification indices (`lib/rheum-v147.js` — CDAI, SDAI,
the 2010 ACR/EULAR RA criteria, SLEDAI-2K, the 2015 ACR/EULAR gout criteria,
CASPAR, and the 2016 revised ACR fibromyalgia criteria), venous-thromboembolism
instruments (`lib/vte-v106.js` — PEGeD, 4PEPS, the Bova score, the Hestia
outpatient gate, the original Geneva score, and the Constans upper-extremity DVT
score), and vascular medicine (`lib/vascular-v105.js` — the ankle-brachial index,
the Rutherford / Fontaine PAD mapping, the SVS WIfI limb-threat stage, and the
logistic EuroSCORE II). Brings the exposed total to **167 calculators across 35
modules**. The Mehran yes/no risk factors map to two-value enums (the lib `onFlag`
helper coerces `'yes'` to true and treats blank or `'no'` as false); the EuroSCORE
II logistic model is evaluated in a saturation-safe form whose mortality clamps to
`[0, 1]` (spec-v140), so the JSON surface never leaks a non-finite value; and the
mechanical-power adapter surfaces the driving-pressure unit in plain ASCII
(`cmH2O`) so the JSON result is self-describing where the rendered tile uses the
subscript `cmH₂O`. Every exposed example round-trips to its `META.example.expected`.

## Eighth wave — 2 modules

Coverage extends with 9 more clinical calculators across 2 `lib` modules:
predictive energy-expenditure equations (`lib/nutrition-energy-v152.js` —
Mifflin-St Jeor and Harris-Benedict resting/basal expenditure, the Katch-McArdle
lean-mass BMR, the Penn State ventilated RMR, and the Ireton-Jones hospitalized
equation), and endocrine / metabolic bedside math (`lib/endo-metab-v161.js` — the
aldosterone-renin ratio primary-aldosteronism screen, the calcium-phosphate
product, the Free Thyroxine Index, and the nitrogen balance). Brings the exposed
total to **176 calculators across 37 modules**. The anthropometrics and labs are
plain numbers; sex, the activity factor, and the Ireton-Jones ventilation mode
are enums; the Ireton-Jones trauma and burn diagnosis modifiers are booleans; and
the ARR renin-assay unit (PRA vs DRC) and the calcium-phosphate input-unit system
(mg/dL vs mmol/L) are enums whose cutoff is never compared across unit systems.
Katch-McArdle accepts either lean body mass directly or weight + body-fat %, so
its three body-composition inputs are all optional. Every exposed example
round-trips to its `META.example.expected`.

## Ninth wave — 8 modules

Coverage extends with **39 more clinical calculators across 8 `lib` modules**,
the "advanced bedside quantitation" and subspecialty staging surface shipped as
tiles in spec-v185 through spec-v192: advanced hemodynamic / metabolic gap-fillers
(`lib/gaps-v185.js`), specialty math (`lib/specialtymath-v186.js` — radiation-
oncology BED/EQD2, echo PISA, LV wall stress, corrected DLCO, VO₂max, a binomial
CI), subspecialty oncology staging (`lib/onc-staging-v187.js` — BCLC, IMDC/MSKCC
RCC, RECIST, mGPS), hematology staging (`lib/heme-staging-v188.js` — Binet, Rai,
Ann Arbor, FLIPI-2, Hasford), hematology risk / comorbidity
(`lib/heme-risk-v189.js` — mSMART, IMPEDE-VTE, SAMe-TT2R2, Elixhauser),
hepatology/GI (`lib/hepgi-v190.js` — PALBI, MELD-Na, Clichy, Rome IV IBS),
dermatology/urology (`lib/dermuro-v191.js` — SCORTEN, AJCC melanoma T, PI-RADS,
Guy's stone score), and primary-care/bedside risk (`lib/risk-v192.js` — FINDRISC,
Grobman VBAC, Marburg Heart Score, ADHERE). Brings the exposed total to **215
calculators across 45 modules**. The flat labs and dimensions are numbers; the
staging axes (ECOG, Child-Pugh, tumor burden, anatomic distribution, dexamethasone
dose, family-history depth, confidence level, PI-RADS zone) are enums; and the
yes/no risk factors are booleans. `rosendaal-ttr` in `lib/gaps-v185.js` is
deliberately **not** adapted: its `series` input is a multi-line textarea of
"date INR" rows (a list of item-values), not the flat `dom→arg→kind` scalar
contract this wave covers. No custom `formatResult` is needed anywhere in the
wave — every exposed example round-trips to its `META.example.expected` through
the default `makeToArgs`.

## Tenth wave — 8 modules

Coverage extends with **34 more clinical calculators across 8 `lib` modules** —
the **Long-Term Care & Geriatric Assessment (LTC-GA)** cluster shipped as tiles
in spec-v173 through spec-v182: cognition & dementia staging
(`lib/ltcga-v173.js` — BIMS, AD8, CDR-SOB), delirium / depression / agitation
(`lib/ltcga-v174.js` — Nu-DESC, DOSS, Cornell CSDD, interRAI ABS, CMAI),
observational pain scales for nonverbal residents (`lib/ltcga-v175.js` — Abbey,
CNPI), falls-risk & physical performance (`lib/ltcga-v176.js` — STRATIFY and the
CDC STEADI battery), frailty & sarcopenia (`lib/ltcga-v177.js` — SARC-F,
SARC-CalF, PRISMA-7, SOF), nutrition-risk & dysphagia (`lib/ltcga-v178.js` —
GNRI, Onodera PNI, CONUT, SNAQ, EAT-10, DETERMINE), medication-burden indices
(`lib/ltcga-v179.js` — ACB, ARS, Drug Burden Index), and continence / caregiver
strain / wound status (`lib/ltcga-v182.js` — Sandvik, ICIQ-UI-SF, MCSI, CSI,
BWAT). Brings the exposed total to **249 calculators across 53 modules**. The
graded questionnaire items and free labs/dimensions are numbers; the yes/no
screening items and the sex axis are enums. Two exposure notes:
`drug-burden-index` uses a bespoke `toArgs` that rebuilds the renderer's
five-row `{dose, minDose}` drug array from flat scalar fields (keeping the agent
contract flat); and `mcgeer-criteria` / `loeb-minimum-criteria`
(`lib/ltcga-v181.js`) are deliberately **not** adapted — their criteria set is
conditional on the selected infection site, so no single fixed JSON Schema
honestly documents the input contract. No custom `formatResult` is needed — every
exposed example round-trips to its `META.example.expected`.

## Exposed

Each id below is live in `mcp/catalog.js`. The gate parses this list.

### lib/tox-v86.js
- `serotonin-toxicity`
- `salicylate-toxicity`
- `toxic-alcohol`

### lib/hep-v124.js
- `albi-grade`
- `meld-xi`
- `forns-index`
- `bard-score`
- `fatty-liver-index`
- `lok-index`

### lib/acidbase-v129.js
- `stewart-sid-sig`
- `base-excess`
- `resp-acidosis-compensation`
- `resp-alkalosis-compensation`
- `met-alkalosis-compensation`
- `urine-osmolal-gap`

### lib/cardio-v90.js
- `ecg-axis`
- `lvh-criteria`
- `timi-stemi`
- `duke-treadmill`
- `cardiac-power-output`
- `aortic-valve-area`

### lib/pulm-v91.js
- `gold-spirometry`
- `bode-index`
- `gap-ipf`
- `predicted-spirometry`
- `mmrc-dyspnea`

### lib/neuro-v118.js
- `modified-fisher`
- `graeb-ivh`
- `bat-score`
- `elapss`

### lib/endo-v136.js
- `homa-ir`
- `quicki`
- `tyg-index`
- `metabolic-syndrome`
- `osteoporosis-prescreen`

### lib/periop-v97.js
- `gupta-mica`
- `gupta-respiratory-failure`
- `arozullah-pneumonia`
- `el-ganzouri`

### lib/oneformula-v167.js
- `mean-airway-pressure`
- `cerebroplacental-ratio`
- `toe-brachial-index`
- `stool-osmotic-gap`
- `pure-tone-average`
- `rutgeerts`

### lib/cardio-v101.js
- `chads2`
- `cha2ds2-va`
- `chads-65`
- `atria-stroke`
- `tisdale-qtc`

### lib/heme-v132.js
- `plasmic-ttp`
- `french-ttp`
- `jaam-dic`
- `ipset-thrombosis`
- `cisne`

### lib/gi-v126.js
- `cdai-crohns`
- `uceis`
- `haps`
- `ctsi-balthazar`
- `modified-marshall`

### lib/cardio-v102.js
- `maggic`
- `h2fpef`
- `hfa-peff`
- `cardshock-score`

### lib/cardio-v104.js
- `brugada-vt`
- `vereckei-avr`
- `add-rs`
- `rose-syncope`
- `egsys`
- `oesil`

### lib/cvrisk-v103.js
- `score2`
- `score2-op`
- `mesa-chd`
- `framingham-cvd`
- `reynolds-risk`
- `non-hdl-remnant`

### lib/critcare-v112.js
- `meds-score`
- `sic-score`
- `cpis-vap`
- `lactate-clearance`
- `mrc-sum-score`

### lib/fluidresp-v113.js
- `ivc-fluid-responsiveness`
- `ppv-svv`
- `passive-leg-raise`

### lib/hepgi-v93.js
- `nafld-fibrosis`
- `glasgow-imrie`
- `truelove-witts`
- `harvey-bradshaw`
- `mayo-uc`
- `milan-criteria`

### lib/hemonc-v94.js
- `hscore-hlh`
- `ipss-r-mds`
- `flipi`
- `mascc`
- `sokal-cml`

### lib/neuro-v119.js
- `cpsss`
- `fast-ed`
- `boston-caa`
- `cvt-risk`

### lib/neuro-v120.js
- `stess`
- `helps2b`
- `mess-first-seizure`
- `pound-migraine`
- `hints`

### lib/neuro-v121.js
- `egris`
- `megos`
- `brighton-gbs`
- `mgfa`

### lib/neuro-v122.js
- `hachinski`
- `modified-ashworth`
- `bickerstaff`

### lib/nephro-v127.js
- `kfre`
- `rifle-aki`
- `akin-aki`
- `ufr-dialysis`

### lib/renal-v128.js
- `fepo4`
- `femg`
- `npcr-pna`
- `std-ktv`
- `efwc`

### lib/uro-v130.js
- `prostate-volume`
- `psa-density`
- `psa-velocity`
- `psa-doubling-time`
- `damico-prostate-risk`
- `gleason-grade-group`

### lib/uro-v131.js
- `capra-score`
- `renal-nephrometry`
- `padua-renal`
- `stone-nephrolithometry`
- `twist-score`

### lib/hemodynamics-v87.js
- `hemodynamic-suite`
- `mechanical-power`
- `dead-space`

### lib/nephro-v92.js
- `ckd-staging`
- `uacr-upcr`
- `ktv-urr`
- `mehran-cin`
- `ckd-epi-cystatin`

### lib/ebm-v163.js
- `fagan-post-test`
- `diagnostic-2x2`
- `nnt-arr`

### lib/ophtho-v164.js
- `iol-power`
- `visual-acuity-converter`
- `ocular-perfusion-pressure`

### lib/echo-v158.js
- `lv-mass-index`
- `la-volume-index`
- `teichholz-lvef`
- `rvsp-pasp`
- `mitral-e-e-prime`

### lib/rheum-v147.js
- `cdai-ra`
- `sdai-ra`
- `acr-eular-2010-ra`
- `sledai-2k`
- `gout-acr-eular-2015`
- `caspar`
- `fibromyalgia-acr-2016`

### lib/vte-v106.js
- `peged`
- `4peps`
- `bova-pe`
- `hestia`
- `geneva-original`
- `constans-uedvt`

### lib/vascular-v105.js
- `abi`
- `rutherford-fontaine`
- `wifi`
- `euroscore2`

### lib/nutrition-energy-v152.js
- `mifflin-st-jeor`
- `harris-benedict`
- `katch-mcardle`
- `penn-state-ree`
- `ireton-jones`

### lib/endo-metab-v161.js
- `arr`
- `calcium-phosphate-product`
- `free-thyroxine-index`
- `nitrogen-balance`

### lib/gaps-v185.js
- `fick-cardiac-output`
- `gorlin`
- `qp-qs`
- `lvot-stroke-volume`
- `vte-bleed`
- `matsuda-index`
- `lean-body-weight`

### lib/specialtymath-v186.js
- `bed-eqd2`
- `pisa-eroa`
- `lv-wall-stress`
- `dlco-correction`
- `vo2max-exercise`
- `proportion-ci`

### lib/onc-staging-v187.js
- `bclc-hcc`
- `imdc-rcc`
- `mskcc-rcc`
- `recist`
- `glasgow-prognostic-score`

### lib/heme-staging-v188.js
- `binet-cll`
- `rai-cll`
- `ann-arbor`
- `flipi-2`
- `hasford-cml`

### lib/heme-risk-v189.js
- `msmart`
- `impede-vte`
- `same-tt2r2`
- `elixhauser`

### lib/hepgi-v190.js
- `palbi`
- `meld-na`
- `clichy`
- `rome-iv-ibs`

### lib/dermuro-v191.js
- `scorten`
- `melanoma-t-stage`
- `pi-rads`
- `guys-stone-score`

### lib/risk-v192.js
- `findrisc`
- `grobman-vbac`
- `marburg-heart-score`
- `adhere-hf`

### lib/ltcga-v173.js
- `bims`
- `ad8`
- `cdr-sob`

### lib/ltcga-v174.js
- `nu-desc`
- `doss`
- `cornell-csdd`
- `interrai-abs`
- `cmai`

### lib/ltcga-v175.js
- `abbey-pain`
- `cnpi`

### lib/ltcga-v176.js
- `stratify`
- `chair-stand-30s`
- `four-stage-balance`
- `functional-reach`
- `gait-speed`
- `steadi-algorithm`

### lib/ltcga-v177.js
- `sarc-f`
- `sarc-calf`
- `prisma-7`
- `sof-frailty-index`

### lib/ltcga-v178.js
- `gnri`
- `pni-onodera`
- `conut`
- `snaq`
- `eat-10`
- `determine`

### lib/ltcga-v179.js
- `anticholinergic-burden`
- `anticholinergic-risk-scale`
- `drug-burden-index`

### lib/ltcga-v182.js
- `sandvik-incontinence`
- `iciq-ui-sf`
- `modified-caregiver-strain-index`
- `caregiver-strain-index`
- `bwat`

## Not yet adapted

Every other catalog calculator is **not-yet-adapted**. Reason: incremental
rollout — subsequent waves extend coverage module by module against the same
contract. The Group A/B billing and coding tiles (`clinical: false`) are
out of scope for the first wave (spec-v183 §7) and are eligible only in a later
wave. No proprietary/licensed instrument is ever exposed (it is not in the
catalog to begin with; spec-v100 §8 exclusions are inherited).
