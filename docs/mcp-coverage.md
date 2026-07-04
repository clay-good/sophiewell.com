# MCP coverage ledger (spec-v183)

This is the honest coverage record for the optional stdio MCP server
(`mcp/server.js`). It lists exactly which catalog calculators are exposed as
deterministic MCP tools. `scripts/check-mcp-catalog.mjs` asserts that the
**Exposed** list below equals the live adapter registry (`mcp/catalog.js`)
exactly — no more, no less — and that each exposed example round-trips.

The MCP coverage count is a **subset** of the catalog and is deliberately
**not** one of the 12 catalog-truth count surfaces (spec-v46): it must never be
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

## Eleventh wave — 9 modules

Coverage extends with **50 more clinical calculators across 9 `lib` modules** —
the acute neurology / psychiatry / pulmonary / toxicology / trauma cluster from
the spec-v100 Wave-2/Wave-4 program. It exposes stroke outcome & AVM grading
(`lib/neuro-v95.js` — modified Rankin, GOS-E, Hoehn & Yahr, Spetzler-Martin +
Lawton-Young, House-Brackmann, MIDAS), stroke imaging & thrombolysis prognosis
(`lib/neuro-v117.js` — ASPECTS, ICH volume by ABC/2, DRAGON, HAT, SEDAN,
THRIVE), the clinician-rated psychiatric severity scales (`lib/psych-v96.js` —
HAM-D, HAM-A, MADRS, MDQ, Y-BOCS, PCL-5) and the public-domain exam scales
(`lib/psych-v123.js` — AIMS, Bush-Francis, Barnes akathisia, SCOFF, CES-D),
COPD / bronchiectasis / sleep instruments (`lib/pulm-v114.js` — DECAF, BAP-65,
Bronchiectasis Severity Index, FACED, NoSAS, AHI/ODI band), pulmonary-nodule /
PH / pleural-infection instruments (`lib/pulmnod-v115.js` — Mayo & Brock SPN,
Fleischner 2017, REVEAL Lite 2, RAPID), toxicology dosing & dialysis decisions
(`lib/tox-v110.js` — DigiFab, NAC, HIET, TCA bicarbonate, EXTRIP lithium), and
the trauma severity / classification scores (`lib/trauma-v108.js` — TRISS, NISS,
TASH, RABT, GCS-Pupils, NEXUS Chest CT; `lib/traumaclass-v109.js` — Denver BCVI,
AAST organ injury, MESS, LRINEC, ALT-70). Brings the exposed total to **299
calculators across 62 modules**. The item-summed psychometric scales (HAM-D,
HAM-A, MADRS, Y-BOCS, PCL-5) and the MDQ use a bespoke `toArgs` that rebuilds the
renderer's `items` / `symptoms` array from flat per-item scalar fields (the same
flat→array pattern as the Drug Burden Index), keeping the agent contract flat;
every other adapter uses the default `makeToArgs`. Graded exam items and free
labs are numbers, checkbox criteria are booleans, and the ordinal / categorical
selects are enums. No custom `formatResult` is needed — every exposed example
round-trips to its `META.example.expected`.

## Twelfth wave — 11 modules

Coverage extends with **56 more clinical calculators across 11 `lib` modules** —
the rheumatology / obstetric-gynecology / spine / orthopedic / surgical cluster
from the spec-v138 through spec-v160 program. It exposes rheumatology activity,
prognosis, and drug-safety instruments (`lib/rheum-v148.js` — ASDAS, FFS-2011,
the 2022 ACR/EULAR GCA criteria, the Palliative Prognostic Index and Score, the
opioid equianalgesic converter, Naranjo; `lib/rheum-v160.js` — RAPID3, DAPSA,
the SLICC 2012 and 2019 EULAR/ACR SLE criteria; `lib/rheum-periop-v89.js` —
DAS28, the King's College acetaminophen-ALF criteria, ASA physical status, the
Surgical Apgar Score; `lib/rheum-ob-v156.js` — BASDAI, BASFI, ESSDAI, the Robson
Ten-Group cesarean classification), metastatic-spine and spinal-injury scores
(`lib/spine-v146.js` — SINS, Revised Tokuhashi, Tomita, TLICS, SLIC), fracture
classifications (`lib/ortho-v144.js` — Gustilo-Anderson, Garden, Danis-Weber,
Schatzker, Salter-Harris, Neer; `lib/ortho-v145.js` — Frykman, Mirels,
Kellgren-Lawrence, the Pittsburgh knee rule, compartment ΔP), surgical-risk
models (`lib/surg-v142.js` — POSSUM, P-POSSUM, SORT, the Goldman Cardiac Risk
Index, the Wilson airway score, the Surgical Risk Scale), urology symptom scores
(`lib/urology-v153.js` — IPSS, IIEF-5, OABSS), gynecology risk/staging
(`lib/gyn-v139.js` — Flamm VBAC, ROMA, RMI, the IOTA Simple Rules, the Rotterdam
PCOS criteria, POP-Q staging), and obstetric bedside math (`lib/ob-v138.js` —
Hadlock EFW, fullPIERS, miniPIERS, the amniotic fluid index, the Barnhart
minimal hCG rise, IOM gestational weight gain). Brings the exposed total to **355
calculators across 73 modules**. The graded questionnaire items, joint counts,
labs, and biometry are numbers; the yes/no criteria and screening findings are
booleans; and the ordinal / categorical selects (fracture patterns, staging
axes, ESSDAI activity levels, opioid agents, ASDAS/DAS28 marker form, Naranjo
answers, Robson delivery axes) are enums. The POSSUM and P-POSSUM point grades
are numeric selects the lib range-checks; ASA class and the SORT/Surgical-Risk-
Scale grades are likewise numbers the lib validates against a fixed set. No tile
in the batch is skipped and no custom `formatResult` or `toArgs` is needed —
every exposed example round-trips to its `META.example.expected` through the
default `makeToArgs`.

## Thirteenth wave — 5 modules

Coverage extends with **16 more clinical calculators across 5 `lib` modules** —
older-adult prognosis, metabolic emergencies, environmental injury, ED / ICU
decision instruments, and warfarin dosing. It exposes the LTC-GA Group G
prognosis tiles (`lib/ltcga-v180.js` — the Lee 4-year mortality index and the
interRAI CHESS scale), the metabolic-emergency / oncology trio
(`lib/metabolic-onc-v88.js` — the DKA/HHS classifier, Calvert carboplatin dose,
and the Cairo-Bishop tumor-lysis-syndrome grade), the environmental-emergency
set (`lib/enviro-v111.js` — Lake Louise AMS, the Szpilman drowning grade, the
Snakebite Severity Score, the Cauchy frostbite grade), three of the four ED /
critical-care decision tiles (`lib/eddecision-v107.js` — the New Orleans head-CT
criteria, GO-FAR, and MACOCHA), and the warfarin dosing suite
(`lib/warfarin-v133.js` — the IWPC and Gage pharmacogenetic models and the
Kovacs 10 mg / Crowther 5 mg initiation nomograms). Brings the exposed total to
**371 calculators across 78 modules**. The labs, symptom sub-scores, biometry,
and nomogram protocol day/INR are numbers; the checklist criteria are booleans;
and the ordinal / categorical selects (age bands, mental status, drowning /
frostbite grade axes, VKORC1 / CYP2C9 genotypes, race, and the yes/no
pharmacogenetic questions) are enums. Two enum→flag mappings the renderer
performs — the Calvert GFR cap (`on`/`off`) and the Cairo-Bishop age class
(`adult`/`pediatric`) — are reproduced with a per-field `to` transform. Warfarin
height and weight are consumed by the pure functions in cm / kg (the browser
unit toggles convert before calling), so the adapter exposes them in those units
directly; no custom `formatResult` is needed. **One tile in
`lib/eddecision-v107.js` is intentionally not adapted:** `hear` (the HEAR score)
carries no `META.example` to round-trip (the `phases-iph` precedent). The two
`lib/ltcga-v181.js` long-term-care infection-surveillance tiles
(`mcgeer-criteria`, `loeb-minimum-criteria`) are deferred to a later wave: they
are site-branched, so a faithful schema needs the full per-site criterion set
rather than the flat `dom→arg→kind` contract this wave covers.

## Fourteenth wave — 16 modules

Coverage extends across the specialty-completion surface with **59 more clinical
calculators across 16 `lib` modules**: bedside pediatrics / EMS
(`lib/ems-v149.js`), pharmacology (`lib/pk-v166.js`), diagnostic imaging
(`lib/radiology-v165.js`), frailty & geriatric oncology (`lib/frailty-v143.js`),
functional / fall-risk / performance status (`lib/function-v154.js`), hepatology
(`lib/hep-v125.js`), infectious disease (`lib/id-v137.js`), lymphoma / CLL
prognosis (`lib/lymphoma-v135.js`), neuro-disability grading
(`lib/neuro-disability-v159.js`), plasma-cell / myeloid staging
(`lib/onc-v134.js`), the mantle-cell / Forrest suite (`lib/suites-v155.js`),
pediatric acute severity (`lib/peds-v98.js`, `lib/peds-v140.js`), pediatric
growth (`lib/peds-growth-v141.js`, `lib/peds-percentile-v169.js`), and the
SCORAD dermatology score (`lib/derm-v151.js`). This brings the exposed total to
**430 calculators across 94 modules**. Every tile uses the flat
`dom→arg→kind` contract and the default `makeToArgs`; no bespoke `toArgs` or
`formatResult` is needed — the Berg Balance item scores already carry the
`q1`..`q14` argument names the lib function expects. Continuous labs, vitals, and
item sub-scores are numbers; checkbox deficits (mFI-5/-11, FRAIL, CARG, Kocher,
the PIM3 flags) are booleans; and ordinal grades, yes/no clinical questions, and
categorical selects (TI-RADS descriptors, mJOA/Nurick grades, ISS / DIPSS-group
axes, CLIF organ sub-scores, sex/measure axes) are enums.

**Not adapted this wave (deferred):** `pasi`, `easi`, and `dlqi`
(`lib/derm-v151.js`) build their input object from per-region / per-item field
groups that need a bespoke `toArgs`; `kawasaki-criteria` and `catch-head`
(`lib/peds-v98.js`) collect variable-length principal / risk-factor **arrays**,
not the flat scalar contract; and `wagner-dfu` / `university-texas-dfu`
(`lib/suites-v155.js`) carry no `META.example` to round-trip (the `phases-iph`
precedent). `peds-bmi-percentile` exposes BMI directly rather than the browser's
optional weight/height unit-toggle path — the pure function takes BMI and never
sees the unit inputs (the warfarin height/weight precedent).

## Fifteenth wave — 1 module

The post-parity specialist modules (spec-v193 onward) begin. This slice exposes
the **5 acute-coronary / primary-PCI / cardiogenic-shock risk calculators** of
`lib/acs-v193.js` — the CRUSADE major-bleeding score for NSTEMI, the SCAI SHOCK
stage, the Zwolle primary-PCI early-discharge score, the TIMI Risk Index, and
the CADILLAC post-PCI mortality score. This brings the exposed total to
**435 calculators across 95 modules**. All five use the flat `dom→arg→kind`
contract and the default `makeToArgs`: labs, vitals, and ages are numbers;
heart-failure signs, prior vascular disease, diabetes, arrest, three-vessel
disease, anterior MI, ischemic time, and anemia are booleans; and sex, support
level, Killip class, and post-PCI TIMI flow are enums whose values mirror the
renderer's select options.

## Sixteenth wave — 1 module

This slice exposes the **4 invasive- / echocardiographic-hemodynamics
calculators** of `lib/hemo-v194.js` — the Pulmonary Artery Pulsatility Index
(PAPi), the transpulmonary and diastolic pressure gradients (TPG & DPG), the Tei
myocardial performance index (MPI), and the pulmonary shunt fraction (Qs/Qt).
This brings the exposed total to **439 calculators across 96 modules**. All four
take flat numeric pressures, times, saturations, and tensions through the
default `makeToArgs`; the transpulmonary-gradient tile's dom keys carry the
`tpg-` prefix while its compute function is `pressureGradients`.

## Seventeenth wave — 1 module

This slice exposes the **4 bedside ventilation / oxygenation indices** of
`lib/vent-v195.js` — the SpO₂/FiO₂ (S/F) ratio with an estimated P/F, the
ventilatory ratio (VR), the oxygen saturation index (OSI), and the ventilation
index (VI). This brings the exposed total to **443 calculators across 97
modules**. All four take flat numeric saturations, tensions, pressures, rates,
and a height through the default `makeToArgs`; the ventilatory-ratio tile's sex
axis is the lone enum (it selects the predicted body weight).

## Eighteenth wave — 1 module

This slice exposes the **5 chronic-liver-disease prognostic instruments** of
`lib/liver-v196.js` — the ABIC score for alcoholic hepatitis, the GLOBE score
for PBC transplant-free survival, the UK-PBC risk score, PAGE-B for HCC risk in
chronic hepatitis B, and the revised Mayo PSC natural-history model. This brings
the exposed total to **448 calculators across 98 modules**. Labs, ages, and
ratio-of-normal values pass as numbers through the default `makeToArgs`; PAGE-B
takes a sex enum and the Mayo PSC model a variceal-bleeding boolean.

## Nineteenth wave — 1 module

This slice exposes the **5 quantitative thyroid / beta-cell instruments** of
`lib/endo-quant-v197.js` — SPINA-GT (thyroid secretory capacity), SPINA-GD
(peripheral deiodinase activity), Jostel's TSH index, the HOMA-B steady-state
beta-cell index, and the oral disposition index (DIo). This brings the exposed
total to **453 calculators across 99 modules**. All five take flat numeric
hormone and glucose/insulin values through the default `makeToArgs`; no enums or
booleans are involved.

## Twentieth wave — 1 module

This slice exposes the **5 cross-subspecialty prognostic / assessment
instruments** of `lib/subspecialty-v198.js` — the CNS International Prognostic
Index (CNS-IPI), the ISTH bleeding assessment tool (ISTH-BAT), the VIRSTA score
for infective-endocarditis risk in S. aureus bacteremia, the SeLECT score for
late post-stroke epilepsy, and the WHO/FIGO prognostic score for gestational
trophoblastic neoplasia. This brings the exposed total to **458 calculators
across 100 modules** — the hundredth `lib` module adapted. CNS-IPI and VIRSTA
are boolean item panels; ISTH-BAT scores 14 numeric 0–4 bleeding domains under a
patient-group enum; and SeLECT and FIGO-GTN mix numeric inputs with ordinal
selects whose enum values mirror the renderer.

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

### lib/neuro-v95.js
- `mrs`
- `gose`
- `hoehn-yahr`
- `spetzler-martin`
- `house-brackmann`
- `midas`

### lib/neuro-v117.js
- `aspects`
- `ich-volume-abc2`
- `dragon-stroke`
- `hat-score`
- `sedan-score`
- `thrive-stroke`

### lib/psych-v96.js
- `hamd`
- `hama`
- `madrs`
- `mdq`
- `ybocs`
- `pcl5`

### lib/psych-v123.js
- `aims-tardive`
- `bfcrs`
- `bars-akathisia`
- `scoff`
- `ces-d`

### lib/pulm-v114.js
- `decaf-score`
- `bap-65`
- `bronchiectasis-bsi`
- `faced-bronchiectasis`
- `nosas-score`
- `ahi-odi-severity`

### lib/pulmnod-v115.js
- `mayo-spn`
- `brock-nodule`
- `fleischner-2017`
- `reveal-lite-2`
- `rapid-pleural`

### lib/tox-v110.js
- `digifab-dosing`
- `nac-dosing`
- `hiet-dosing`
- `tca-bicarbonate`
- `lithium-extrip`

### lib/trauma-v108.js
- `triss`
- `niss`
- `tash-score`
- `rabt-score`
- `gcs-pupils`
- `nexus-chest-ct`

### lib/traumaclass-v109.js
- `denver-bcvi`
- `aast-organ-injury`
- `mangled-extremity`
- `lrinec`
- `alt-70`

### lib/rheum-v148.js
- `asdas`
- `ffs-2011`
- `gca-acr-eular-2022`
- `palliative-prognostic-index`
- `palliative-prognostic-score`
- `opioid-conversion`
- `naranjo`

### lib/rheum-v160.js
- `rapid3`
- `dapsa`
- `slicc-sle`
- `sle-2019-eular-acr`

### lib/rheum-periop-v89.js
- `das28`
- `kings-college`
- `asa-ps`
- `surgical-apgar`

### lib/rheum-ob-v156.js
- `basdai`
- `basfi`
- `essdai`
- `robson`

### lib/spine-v146.js
- `sins-score`
- `tokuhashi-revised`
- `tomita-score`
- `tlics-score`
- `slic-score`

### lib/ortho-v144.js
- `gustilo-anderson`
- `garden-classification`
- `weber-ankle`
- `schatzker-classification`
- `salter-harris`
- `neer-classification`

### lib/ortho-v145.js
- `frykman-classification`
- `mirels-score`
- `kellgren-lawrence`
- `pittsburgh-knee-rule`
- `compartment-delta-pressure`

### lib/surg-v142.js
- `possum`
- `p-possum`
- `sort`
- `goldman-cardiac-risk`
- `wilson-airway`
- `surgical-risk-scale`

### lib/urology-v153.js
- `ipss`
- `iief5`
- `oabss`

### lib/gyn-v139.js
- `flamm-vbac`
- `roma-ovarian`
- `rmi-ovarian`
- `iota-simple-rules`
- `rotterdam-pcos`
- `popq-staging`

### lib/ob-v138.js
- `hadlock-efw`
- `fullpiers`
- `minipiers`
- `afi`
- `barnhart-hcg`
- `iom-gwg`

### lib/ltcga-v180.js
- `lee-mortality-index`
- `chess-scale`

### lib/metabolic-onc-v88.js
- `dka-hhs`
- `calvert-carboplatin`
- `tls-cairo-bishop`

### lib/enviro-v111.js
- `lake-louise-ams`
- `szpilman-drowning`
- `snakebite-severity`
- `cauchy-frostbite`

### lib/eddecision-v107.js
- `new-orleans-head`
- `go-far`
- `macocha`

### lib/warfarin-v133.js
- `warfarin-iwpc`
- `warfarin-gage`
- `warfarin-init-10mg`
- `warfarin-init-5mg`

### lib/ems-v149.js
- `peds-weight-est`
- `peds-vitals`
- `dose-volume`

### lib/pk-v166.js
- `pk-suite`
- `chlorpromazine-equivalents`

### lib/radiology-v165.js
- `acr-tirads`
- `adrenal-ct-washout`
- `bosniak`
- `ct-effective-dose`

### lib/frailty-v143.js
- `mfi-5`
- `mfi-11`
- `frail-scale`
- `ves-13`
- `carg-toxicity`

### lib/function-v154.js
- `berg-balance`
- `tug`
- `tinetti-poma`
- `pps`

### lib/hep-v125.js
- `peld-score`
- `clif-c-aclf`
- `gahs`
- `west-haven-he`
- `hepatic-steatosis-index`

### lib/id-v137.js
- `isaric-4c-mortality`
- `covid-gram`
- `candida-score`
- `vacs-index`
- `regiscar-dress`

### lib/lymphoma-v135.js
- `r-ipi`
- `nccn-ipi`
- `gelf-criteria`
- `hodgkin-ips`
- `cll-ipi`

### lib/neuro-disability-v159.js
- `mjoa`
- `nurick`
- `asia-impairment`
- `edss`

### lib/onc-v134.js
- `myeloma-iss`
- `myeloma-r-iss`
- `myeloma-r2-iss`
- `mgus-risk`
- `dipss-mf`
- `dipss-plus-mf`

### lib/suites-v155.js
- `mipi`
- `forrest`

### lib/peds-v98.js
- `kocher-criteria`
- `pim3`

### lib/peds-v140.js
- `eos-calculator`
- `snappe-ii`
- `rdai-tal`
- `clinical-dehydration-scale`
- `koff-bladder-capacity`

### lib/peds-growth-v141.js
- `peds-bmi-percentile`
- `who-growth-zscore`
- `mid-parental-height`
- `corrected-age`

### lib/peds-percentile-v169.js
- `cdc-stature-for-age`
- `cdc-weight-for-age`

### lib/derm-v151.js
- `scorad`

### lib/acs-v193.js
- `crusade`
- `scai-shock`
- `zwolle-pci`
- `timi-risk-index`
- `cadillac-risk`

### lib/hemo-v194.js
- `papi`
- `transpulmonary-gradient`
- `tei-index`
- `shunt-fraction`

### lib/vent-v195.js
- `sf-ratio`
- `ventilatory-ratio`
- `osi-oxygenation`
- `ventilation-index`

### lib/liver-v196.js
- `abic-score`
- `globe-score`
- `uk-pbc-risk`
- `page-b`
- `mayo-psc-risk`

### lib/endo-quant-v197.js
- `spina-gt`
- `spina-gd`
- `jostel-tsh-index`
- `homa-beta`
- `oral-disposition-index`

### lib/subspecialty-v198.js
- `cns-ipi`
- `isth-bat`
- `virsta`
- `select-pse`
- `figo-gtn`

## Not yet adapted

Every other catalog calculator is **not-yet-adapted**. Reason: incremental
rollout — subsequent waves extend coverage module by module against the same
contract. The Group A/B billing and coding tiles (`clinical: false`) are
out of scope for the first wave (spec-v183 §7) and are eligible only in a later
wave. No proprietary/licensed instrument is ever exposed (it is not in the
catalog to begin with; spec-v100 §8 exclusions are inherited).
