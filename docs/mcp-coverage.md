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

## Tool surface — four tools (mcp-discovery)

spec-v183 §2.2 fixed a **three-tool** dispatch surface (`list_calculators`,
`describe_calculator`, `compute_calculator`). The `mcp-discovery` change
re-opens that fence for one addition: a fourth, read-only, deterministic
`find_calculator`. It ranks the exposed calculators by a plain-language query
using the same reviewed resolver the browser prompt bar uses
(`resolvePromptRanked` in `lib/prompt.js` + the `data/synonyms.json` table) — no
model, no per-tile tool flood. `list_calculators` keeps its exact substring
semantics; the other three tools are byte-untouched. This is a tool-surface
change, not a coverage change: the adapter count below is unaffected.

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
directly; no custom `formatResult` is needed. (`hear` in
`lib/eddecision-v107.js` and the two `lib/ltcga-v181.js` long-term-care
infection-surveillance tiles — `mcgeer-criteria`, `loeb-minimum-criteria` — were
parked in this wave and adapted later in the fifty-third wave.)

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

**Parked in this wave, adapted in the fifty-third:** `pasi`, `easi`, and `dlqi`
(`lib/derm-v151.js`) build their input object from per-region / per-item field
groups; `kawasaki-criteria` and `catch-head`
(`lib/peds-v98.js`) collect variable-length principal / risk-factor **arrays**;
and `wagner-dfu` / `university-texas-dfu`
(`lib/suites-v155.js`) then carried no `META.example` to round-trip.
`peds-bmi-percentile` exposes BMI directly rather than the browser's
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

## Twenty-first wave — 1 module

This slice exposes the **4 myeloid-neoplasm / transplant prognostic scores** of
`lib/myeloid-prognosis-v199.js` — MIPSS70 for transplant-age primary
myelofibrosis, GIPSS (genetically inspired), MYSEC-PM for secondary
myelofibrosis survival, and the Sorror HCT-CI transplant comorbidity index. This
brings the exposed total to **462 calculators across 101 modules**. Most items
are boolean risk flags; MIPSS70's HMR-mutation count, GIPSS's karyotype, and
HCT-CI's hepatic and pulmonary severity are ordinal enums mirroring the renderer
selects, and MYSEC-PM takes a numeric age.

## Twenty-second wave — 1 module

This slice exposes the **4 critical-care severity / acid-base instruments** of
`lib/critcare-severity-v200.js` — OASIS (Oxford Acute Severity of Illness
Score), LODS (Logistic Organ Dysfunction System), the delta gap / delta ratio,
and the APPS score for ARDS outcome. This brings the exposed total to **466
calculators across 102 modules**. OASIS and LODS take worst-24h physiology as
numbers plus mechanical-ventilation and prothrombin boolean flags; delta gap's
albumin correction and reference-gap overrides are optional numbers.

## Twenty-third wave — 1 module

This slice exposes the **5 hepatology / GI-bleed instruments** of
`lib/hepatology-gibleed-v201.js` — the Glasgow-Blatchford upper-GI-bleed score,
CLIF-C AD (acute decompensation, pre-ACLF), the Hepamet fibrosis score, the CLIP
HCC prognostic score, and Agile 3+ (FibroScan advanced-fibrosis probability).
This brings the exposed total to **471 calculators across 103 modules**. Labs and
vitals pass as numbers; Glasgow-Blatchford's urea-unit and sex, Hepamet/Agile
sex, and CLIP's Child-Pugh and morphology are categorical enums mirroring the
renderer selects, with the usual boolean clinical flags.

## Twenty-fourth wave — 1 module

This slice exposes the **MECKI score** of `lib/cvrisk-engines-v202.js` — a
CPET-anchored 2-year prognostic model for systolic heart failure from
hemoglobin, sodium, LVEF, percent-predicted peak VO₂, VE/VCO₂ slope, and
MDRD-eGFR. This brings the exposed total to **472 calculators across 104
modules**. All six inputs are numbers through the default `makeToArgs`.

## Twenty-fifth wave — 1 module

This slice exposes the **3 perioperative / TIA-risk instruments** of
`lib/periop-frailty-v203.js` — the Duke Activity Status Index (DASI) with its
peak-VO₂ estimate, the ABCD3-I early-stroke-after-TIA score, and the SORT 30-day
postoperative-mortality model. This brings the exposed total to **475 calculators
across 105 modules**. DASI is a 12-item boolean panel; ABCD3-I's clinical feature
and SORT's ASA class and urgency are ordinal enums mirroring the renderer
selects, with numeric ages, pressures, and durations.

## Twenty-sixth wave — 1 module

This slice exposes the **5 nephrology / fluid-and-electrolyte instruments** of
`lib/nephro-fluids-v204.js` — the calcium/creatinine clearance ratio (CCCR),
maximum allowable blood loss (ABL), electrolyte-free water clearance (EFWC),
TmP/GFR (renal phosphate threshold), and the urinary-calcium assessment. This
brings the exposed total to **480 calculators across 106 modules**. Labs and
volumes pass as numbers; ABL's patient category and the urine-calcium tool's
mode, age band, and sex are enums mirroring the renderer selects.

## Twenty-seventh wave — 1 module

This slice exposes the **5 pulmonary / COPD / sleep instruments** of
`lib/pulm-copd-v205.js` — the COPD Assessment Test (CAT), the LENT
malignant-pleural-effusion prognostic score, the ADO and DOSE COPD mortality
indices, and the Sleep Apnea Clinical Score (SACS). This brings the exposed
total to **485 calculators across 107 modules**. CAT's eight items are 0–5
numeric symptom scores; LENT's ECOG and tumor type and the ADO/DOSE mMRC grade
are ordinal enums mirroring the renderer selects.

## Twenty-eighth wave — 1 module

This slice exposes the **4 TBI / stroke prognostic instruments** of
`lib/tbi-stroke-v206.js` — the Essen Stroke Risk Score, the Rotterdam and
Marshall head-CT classifications, and the FUNC score for functional independence
after primary ICH. This brings the exposed total to **489 calculators across 108
modules**. Rotterdam's cistern status, Marshall's mass-lesion axis, and FUNC's
ICH location are ordinal / categorical enums mirroring the renderer selects, with
the usual boolean risk flags.

## Twenty-ninth wave — 1 module

This slice exposes the **3 resuscitation / early-warning instruments** of
`lib/resus-trauma-v207.js` — the BLS/ALS Termination-of-Resuscitation rules, the
Rapid Emergency Medicine Score (REMS), and the Cardiac Arrest Risk Triage (CART)
score. This brings the exposed total to **492 calculators across 109 modules**.
The TOR rule set is an enum; every other TOR input is a boolean arrest fact, and
REMS and CART take plain numeric vitals.

## Thirtieth wave — 1 module

This slice exposes the **4 nutrition / maternal-fetal instruments** of
`lib/nutrition-maternal-v208.js` — the neonatal ponderal index, the sFlt-1/PlGF
preeclampsia biomarker ratio, the GLIM malnutrition criteria, and the Subjective
Global Assessment (SGA). This brings the exposed total to **496 calculators
across 110 modules**. sFlt-1/PlGF phase, GLIM's weight-loss and low-BMI
severities, and the SGA rating are enums mirroring the renderer selects.

## Thirty-first wave — 1 module

This slice exposes the **2 cardiology risk engines** of
`lib/cardiology-risk-v209.js` — the HCM Risk-SCD 5-year sudden-cardiac-death
model and the CHARGE-AF 5-year incident-atrial-fibrillation model. This brings
the exposed total to **498 calculators across 111 modules**. Every clinical flag
is a boolean and the remaining inputs are plain numeric measurements.

## Thirty-second wave — 1 module

This slice exposes the **SPAN-100 index** of `lib/stroke-prognosis-v210.js` — a
simple acute-ischemic-stroke prognostic index summing age and NIHSS. This brings
the exposed total to **499 calculators across 112 modules**. Both inputs are
numbers through the default `makeToArgs`.

## Thirty-third wave — 1 module

This slice exposes the **4 hematology-oncology risk instruments** of
`lib/heme-onc-risk-v211.js` — the EUTOS score for chronic myeloid leukemia, the
IMPROVEDD and COMPASS-CAT VTE risk scores, and the ELN 2022 AML genetic-risk
stratification. This brings the exposed total to **503 calculators across 113
modules**. EUTOS takes two numeric inputs; IMPROVEDD, COMPASS-CAT, and ELN 2022
are boolean item panels.

## Thirty-fourth wave — 1 module

This slice exposes the **2 hepatology fibrosis / portal-hypertension
instruments** of `lib/hep-fibrosis-portal-v212.js` — King's Score for significant
fibrosis / cirrhosis and the Baveno VII non-invasive rules for clinically
significant portal hypertension and varices. This brings the exposed total to
**505 calculators across 114 modules**. Both take plain numeric labs and a
liver-stiffness measurement.

## Thirty-fifth wave — 1 module

This slice exposes the **5 acute-injury / ED decision instruments** of
`lib/acute-injury-v213.js` — the HEART Pathway early-discharge rule, the Ottawa
Heart Failure Risk Scale, Light's criteria for pleural exudate/transudate, and
the Baux and revised-Baux burn-mortality scores. This brings the exposed total
to **510 calculators across 115 modules**. The HEART Pathway and Ottawa scale are
boolean item panels; Light's criteria and the Baux scores take numeric labs /
measurements plus an inhalation-injury boolean. (The HEART Pathway and Ottawa
`META.example` checkbox fields were normalized from `''` to `'0'` — both leave
the box unchecked in the tile, but only `'0'` satisfies the flat boolean input
contract the MCP round-trip enforces.)

## Thirty-sixth wave — 1 module

This slice exposes the **7 cardiology risk scores** of
`lib/cardiology-risk-v214.js` — the APPLE, CAAP-AF, ATLAS, HATCH, and MB-LATER
atrial-fibrillation ablation/progression scores and the Canada ACS (C-ACS) and
ACTION ICU acute-coronary scores. This brings the exposed total to **517
calculators across 116 modules**. Every clinical item is a boolean; CAAP-AF,
ATLAS, MB-LATER, and ACTION ICU add a few numeric measurements. (Their
checkbox `META.example` fields were normalized from `''` to `'0'`, the same
behavior-preserving fix as wave 35.)

## Thirty-seventh wave — 1 module

This slice exposes the **7 risk scores** of `lib/risk-scores-v215.js` — the DLCN
and Simon Broome familial-hypercholesterolemia criteria, the PADIT
cardiac-device-infection score, the GRIm-Score and LIPI immunotherapy/lung
prognostic indices, and the ONKOTEV and PROTECHT cancer-associated-VTE scores.
This brings the exposed total to **524 calculators across 117 modules**. The
DLCN, PADIT, and PROTECHT ordinal selects carry numeric-string point values
(modeled as enums); the rest are numeric labs and boolean flags, with the same
`'' → '0'` checkbox-example normalization as waves 35–36.

## Thirty-eighth wave — 1 module

This slice exposes the **7 hematology prognostic instruments** of
`lib/heme-prognostic-v216.js` — the WPSS (MDS), MD Anderson CLL index, PIT
(PTCL), PRIMA-PI (follicular lymphoma), Durie-Salmon myeloma stage, lymphocyte
doubling time, and the Talcott febrile-neutropenia risk groups. This brings the
exposed total to **531 calculators across 118 modules**. The WPSS, MDACC, and
Durie-Salmon ordinal selects carry numeric-string point values (modeled as
enums); the rest are numeric labs and boolean flags.

## Thirty-ninth wave — 1 module

This slice exposes the **7 stroke / neuro-vascular risk scores** of
`lib/stroke-risk-v217.js` — the Canadian TIA Score, the ASTRAL and PLAN
ischemic-stroke outcome scores, the SOAR stroke-mortality score, the SITS-SICH
post-thrombolysis hemorrhage score, and the VASOGRADE and Ogilvy-Carter
aneurysmal-SAH grading scales. This brings the exposed total to **538
calculators across 119 modules**. SOAR, SITS-SICH, and VASOGRADE ordinal selects
carry numeric-string values (modeled as enums); the rest are numeric vitals/labs
and boolean flags.

## Fortieth wave — 1 module

This slice exposes the **7 ED decision instruments** of
`lib/ed-decision-v218.js` — the FAINT syncope score, the NEXUS Head CT rule, the
HANDOC and DENOVA endocarditis-echo scores, the 2018 ICM prosthetic-joint-
infection definition, and the AIR and Adult Appendicitis scores. This brings the
exposed total to **545 calculators across 120 modules**. HANDOC aetiology, AIR
rebound, and AAS guarding are ordinal selects (numeric-string enums); the rest
are numeric labs and boolean flags.

## Forty-first wave — 1 module

This slice exposes the **7 metabolic / hepatic indices** of
`lib/metabolic-hepatic-v219.js` — the ADA and Cambridge diabetes-risk scores,
the lipid accumulation product, the visceral adiposity index, the conicity
index, the AST/ALT (De Ritis) ratio, and the GGT-to-platelet ratio. This brings
the exposed total to **552 calculators across 121 modules**. The Cambridge
family-history and smoking selects carry numeric-string values (modeled as
enums); the rest are numeric labs / anthropometry and boolean flags.

## Forty-second wave — 1 module

This slice exposes the **6 hepatology prognostic instruments** of
`lib/hepatology-prognosis-v220.js` — the FIPS post-TIPS mortality score, the
ALBI-PLT varices-risk score, D'Amico cirrhosis staging, the aMAP HCC-risk score,
the NACSELD-ACLF organ-failure count, and the FibroQ fibrosis index. This brings
the exposed total to **558 calculators across 122 modules**. All inputs are
numeric labs plus a few boolean clinical flags.

## Forty-third wave — 1 module

This slice exposes the **7 pulmonary risk instruments** of
`lib/pulmonary-risk-v221.js` — the simplified revised Geneva PE score, the SCAP
and CORB severe-CAP scores, the RESP respiratory-ECMO-survival score, the ILD-GAP
and du Bois IPF prognostic scores, and the Collins pneumothorax-volume estimate.
This brings the exposed total to **565 calculators across 123 modules**. The RESP
and ILD-GAP ordinal selects carry numeric-string point values (modeled as enums,
including RESP's negative-point options); the rest are numeric measurements and
boolean flags.

## Forty-fourth wave — 1 module

This slice exposes the **7 rheumatology classification / severity instruments**
of `lib/rheum-classification-v222.js` — the 2017 EULAR/ACR myositis and 2012
EULAR/ACR PMR criteria, the Bohan & Peter criteria, the 2013 ACR/EULAR
systemic-sclerosis criteria, the modified Rodnan skin score, the 2016 ACR/EULAR
Sjogren criteria, and ESSPRI. This brings the exposed total to **572 calculators
across 124 modules**. The IIM age band and SSc skin/fingertip selects are
numeric-string enums; mRSS takes 17 optional 0–3 site grades; the rest are
boolean criteria and 0–10 patient scales.

## Forty-fifth wave — 1 module

This slice exposes the **7 dermatology instruments** of `lib/dermatology-v223.js`
— UAS7 (chronic urticaria), HiSCR and Hurley staging (hidradenitis
suppurativa), POEM (atopic eczema), ALDEN (SJS/TEN drug causality), PEST
(psoriatic-arthritis screen), and the weighted Glasgow 7-point checklist. This
brings the exposed total to **579 calculators across 125 modules**. ALDEN's five
causality axes are numeric-string enums (including negative-point options); POEM
takes seven 0–4 symptom scores; the rest are counts and boolean items.

## Forty-sixth wave — 1 module

This slice exposes the **7 neurology instruments** of `lib/neurology-v224.js` —
ID Migraine, the ONLS neuropathy limitation scale, the END-IT
autoimmune-encephalitis-status score, the Engel and ILAE epilepsy-surgery outcome
classifications, the Salzburg NCSE consensus criteria, and the Dizziness Handicap
Inventory. This brings the exposed total to **586 calculators across 126
modules**. The ONLS, END-IT, Engel, and Salzburg selects carry numeric-string
values (modeled as enums); the rest are boolean items and counts.

## Forty-seventh wave — 1 module

This slice exposes the **7 obstetrics/gynecology instruments** of
`lib/obgyn-v225.js` — the Nugent score and Amsel criteria (bacterial vaginosis),
the modified Ferriman-Gallwey hirsutism score, the PBAC menstrual-bleeding chart,
the Thompson neonatal-HIE score, the Menopause Rating Scale, and the
Blatt-Kupperman index. This brings the exposed total to **593 calculators across
127 modules**. Nugent's three morphotype selects are numeric-string enums; the
symptom/grade panels are numeric 0-N scores and the Amsel items are booleans.

## Forty-eighth wave — 1 module

This slice exposes the **6 nephrology / fluid-and-electrolyte instruments** of
`lib/nephrology-v226.js` — the Watson total-body-water estimate, the
Salazar-Corcoran creatinine clearance for obesity, the estimated plasma volume
status (ePVS), the furosemide stress test, the fractional excretion of
bicarbonate, and the pH-corrected serum potassium. This brings the exposed total
to **599 calculators across 128 modules**. All inputs are numeric labs /
anthropometry plus a couple of boolean flags.

## Forty-ninth wave — 1 module

This slice exposes the **6 cross-specialty instruments** of `lib/mixed-v227.js`
— the ICBD 2014 and ISG 1990 Behcet-disease criteria, the BATT prehospital-TXA
score, the Denver ED Trauma Organ Failure score, the Emergency Transfusion
Score, and the WHO 2009 dengue classification. This brings the exposed total to
**605 calculators across 129 modules**. BATT, Denver, and ETS take a few numeric
vitals; every other input is a boolean criterion.

## Fiftieth wave — 1 module

This slice exposes the **5 microcytic-anemia RBC discrimination indices** of
`lib/mixed-v228.js` — the England & Fraser discriminant function and the Sirdah,
RDW, Srivastava, and Ehsani indices, each screening beta-thalassemia trait
versus iron-deficiency anemia from routine CBC parameters. This brings the
exposed total to **610 calculators across 130 modules**. All inputs are numeric.

## Fifty-first wave — 1 module

This slice exposes the **4 CBC-derived indices** of `lib/hematology-v229.js` —
the absolute eosinophil count (AEC), the neutrophil-to-lymphocyte ratio (NLR),
the platelet-to-lymphocyte ratio (PLR), and the systemic immune-inflammation
index (SII). This brings the exposed total to **614 calculators across 131
modules**. All inputs are numeric.

## Fifty-second wave — 28 modules

This slice adapts the entire **spec-v230 through spec-v257 subspecialty-depth
program** in one pass: 28 `lib` modules contributing **109 calculators** across
inflammation indices, coagulation, cranial/anthropometric estimators, derm /
pain / ophthalmology / echo scores, GI-surgery and rehab / geriatric batteries,
environmental-exposure indices, ENT-sleep, sports-MSK, heme-derm, IBD, pediatric
tox, wound ID, renal-pulmonary, ob-gyn, cardiometabolic, ortho-spine, radiology
measurement, ENT-uro-psych, mixed risk scores, rheumatology criteria, and dive
medicine. This brings the exposed total to **723 calculators across 159
modules**. Inputs are flat scalars, checkbox booleans (optional, defaulting to
unchecked), and a handful of string enums (sex, WBGT setting, TIMI vessel).

## Fifty-third wave — deferral cleanup (9 modules, +14)

This slice clears the deferral backlog: the fourteen tiles earlier waves parked
because they needed a bespoke `toArgs`, a variable-length array input, or a
`META.example` that had not yet been written. All fourteen now round-trip against
the same fixed contract, bringing the exposed total to **737 calculators across
160 modules**:

- **`neuro-v118` — `phases`**, **`eddecision-v107` — `hear`**,
  **`suites-v155` — `wagner-dfu` / `university-texas-dfu`**: previously deferred
  only because they carried no `META.example`; the examples exist now and the
  flat enum/number inputs map straight through the default `toArgs`.
- **`derm-v151` — `pasi` / `easi` / `dlqi`**: the per-region / per-item field
  groups are named with the arg the lib reads (`headE`, `headArea`, `q1`…), so
  they still use the DEFAULT `toArgs`; absent regions default to 0 in the lib.
- **`periop-v97` — `pospom`**, **`gi-v126` — `ses-cd`**,
  **`peds-v98` — `kawasaki-criteria` / `catch-head`**: variable-length array
  inputs (comorbidity list, per-segment endoscopic arrays, principal /
  supplementary / risk-factor key arrays) rebuilt from flat scalar / boolean
  fields by a bespoke `toArgs` (the `drug-burden-index` precedent), keeping the
  agent contract flat. Keys are read from each lib's own list so the schema
  cannot drift from the model.
- **`ltcga-v175` — `doloplus-2`**: the 10 behavioral items map through the
  default `toArgs` with the arg names the lib expects.
- **`ltcga-v181` — `mcgeer-criteria` / `loeb-minimum-criteria`** (new module):
  site-branched surveillance / stewardship definitions. The adapter exposes the
  site enum plus the deduped union of every criterion key across all sites as
  flat booleans; the compute function reads only the selected site's findings.

## Fifty-fourth wave — the foundational core (11 modules, +111)

The largest single slice: the original bedside-math and clinical-scoring core
that predates the spec-numbered modules. It adapts `lib/clinical.js` and
`lib/clinical-v4.js` … `lib/clinical-v8.js` (Group E clinical math — BMI, BSA,
MAP, anion gap and its delta-delta, corrected calcium / sodium, A-a gradient,
eGFR / MDRD / Cockcroft-Gault, QTc, P/F and the oxygenation suites, shock index,
FENa / FEUrea, FIB-4 / APRI / ROX / VIS, the sodium-correction and free-water
planners, the hematology / oxygenation / renal bedside indices, and the Group F
drip / dose / infusion math — CPP, weight-based peds dosing, anticoagulation
reversal, APAP ceiling, ICU nutrition, O2 cylinder duration, neonatal feeding,
oxytocin titration), `lib/scoring-v4.js` and `lib/scoring-v6.js` (trauma triage
MGAP / GAP / BIG, ICU titration, the PECARN pediatric rules, and the neonatal
assessment set — Ballard, Finnegan, Silverman-Andersen, Downes, Bhutani, QBL,
AAP phototherapy), and `lib/medication-v4.js` / `lib/medication-v5.js` (steroid /
benzodiazepine equivalents, renal antibiotic dosing, TPN macronutrients, the AGS
Beers screen, and the high-alert protocol math — heparin nomogram, vancomycin
AUC, aminoglycoside, Rumack-Matthew, digoxin, local-anesthetic max, MgSO4,
PCA pump, sugammadex, ketamine / propofol, pediatric fluids). `rosendaal-ttr`
joins its home module `lib/gaps-v185.js`. This brings the exposed total to **848
calculators across 170 modules**.

Patterns used:

- **Composite wrappers** where a tile reports several formulas side by side
  (BSA Du Bois + Mosteller; the eGFR, oxygenation, shock-index, body-weight, and
  FENa/FEUrea suites; anion-gap delta-delta; the dual-direction infusion and
  oxytocin conversions): the adapter's `compute` calls the two or three pure lib
  functions over the shared arg object and returns them under one result.
- **Data-table args read from the shipped `data/` shards** (steroid / benzo
  equivalence, renal-antibiotic dosing): the adapter passes the same JSON table
  the site loads, so the equivalence coefficients are never re-typed.
- **Array-rebuilding `toArgs`** (Ballard's two six-element maturity arrays; the
  Beers medication / comorbidity lists) built from flat per-item fields with the
  key sets read from each lib's own tables (the `drug-burden-index` precedent).
- **Self-describing result enrichment**: a handful of results echo an input, a
  unit constant, or a formula coefficient (the CKD-EPI `1.73m^2` unit, the Katz
  1.6 / Hillier 2.4 sodium factors, the 4-2-1 maintenance-fluid tier breakdown,
  the ISF `1800`/`1500` rule constant, the `h`/`m` split of a duration) so every
  documented numeric fact appears in the JSON — the same numeric-round-trip
  contract the browser tile satisfies through its richer rendered DOM.

Two tiles in these modules are intentionally left unexposed: `minute-ventilation`
(its example text `… target PaCO2 is 24/min` contains the substring `PaCO2`,
which the shared numeric extractor reads as a spurious `2` the compute cannot own
without fabricating a value) and `vasopressor` (its example dose is expressed
per-kg but the default drug row is dosed per-minute, so a deterministic flat
round-trip is ambiguous). Both are covered by the unit tests and stay in the
not-yet-adapted set.

## Fifty-fifth wave — the Group G bedside scoring core in lib/clinical.js (+8)

The eight classic bedside instruments whose pure computes live in
`lib/clinical.js` beside the wave-54 math: GCS, APGAR, ABG interpretation
(primary disorder + Winter / Boston compensation, with the optional A-a and P/F
oxygenation add-on), Wells PE, Wells DVT, CHA2DS2-VASc, HAS-BLED, and the
13-item NIHSS. dom keys mirror `views/group-g.js` (which are also the
`META.example.fields` keys), so every example round-trips unchanged. The
checkbox criteria are optional booleans (an unchecked box and an absent input
score identically); the NIHSS items are optional numbers because the lib —
like the tile's default-0 sliders — treats an unscored item as 0. `chads` uses
the self-describing enrichment pattern: its result echoes the two doubled
point weights (age >= 75 and prior stroke/TIA each score 2) so the "2"s the
score's own name documents appear in the JSON. Brings the exposed total to
**856 calculators across 170 modules** (no new module — `lib/clinical.js` was
already adapted in wave 54).

## Fifty-sixth wave — the Group G ED decision core in lib/scoring-v4.js (+14)

The fourteen emergency-decision tiles rendered by `views/group-g.js` whose pure
computes live in `lib/scoring-v4.js`: TIMI, GRACE, HEART, PERC, the paired
Wells PE + revised Geneva, CURB-65, PSI/PORT, the paired qSOFA + SOFA,
MELD-3.0 + Child-Pugh, Ranson + BISAP, Centor + McIsaac, Wells DVT + Caprini,
Bishop, and Alvarado + PAS. Patterns:

- **Composite wrappers** for the six side-by-side tiles: the adapter computes
  both instruments from the one shared arg object (`wells-pe-geneva`,
  `qsofa-sofa`, `meld-childpugh`, `ranson-bisap`, `centor` + McIsaac,
  `alvarado-pas`); `wells-dvt-caprini` reuses the pure `lib/clinical.js` Wells
  DVT compute beside the Caprini summed-points band.
- **Nested-group rebuild** for Ranson: the lib takes two boolean groups
  (admission / 48-hour); the wrapper rebuilds them from the flat args.
- **Graded selects as enums** coerced to numbers (`to: Number`): HEART's five
  0/1/2 components, the six SOFA organ grades (an unsupplied grade scores 0,
  like the tile's defaults), GRACE's Killip class.
- **Self-describing enrichment**: `perc` echoes its three numeric criterion
  cutoffs (50 / 100 / 95), `curb-65` echoes the age-65 cutoff its name
  documents, `meld-childpugh` echoes the albumin input (the "3.0" in the
  example's "MELD-3.0" label), and `wells-pe-geneva` lists each fired Wells
  criterion with its documented point weight.

Brings the exposed total to **870 calculators across 170 modules** (no new
module — `lib/scoring-v4.js` was already adapted in wave 54).

## Fifty-seventh wave — the ICU bedside / early-warning cluster in lib/scoring-v4.js (+12)

The twelve ICU-assessment and ward early-warning tiles: NEWS2 and MEWS (vital
signs banded per parameter; temperature in canonical Celsius, the browser
unit-selector companion omitted per the wave-54 convention), SIRS, Killip
class, MODS (Marshall), the sedation-agitation pair RASS + SAS/Riker, the
delirium trio CAM-ICU + ICDSC + 4AT, and the behavioral pain pair CPOT + BPS.
All single-instrument adapters over the pure lib computes; the graded
selects (Killip, RASS, SAS, AMT4/attention, CPOT, BPS) map as enums coerced
to numbers, and every example round-trips because the lib band strings carry
the documented cutoff constants (the "Table 2" / "cutoff >= 4" / "-2 to 0"
numerals the examples cite). Brings the exposed total to **882 calculators
across 170 modules**.

## Fifty-eighth wave — cognition, withdrawal, sleep, and periop assessment in lib/scoring-v4.js (+10)

Mini-Cog (word recall + clock draw; the result echoes the 5-point maximum the
example's "4/5" documents), CIWA-Ar, COWS (both take the pre-graded per-item
points the scoring sheets define), Epworth, STOP-BANG, the Berlin OSA
questionnaire (three-category logic with the per-category counts in the
result), Apfel PONV, modified Aldrete, LEMON (with the 3-3-2 subtotal), and
White-Song fast-track (score plus the no-domain-below-1 gate). Brings the
exposed total to **892 calculators across 170 modules**.

The five psychometric screeners in this module (`phq9`, `gad7`, `auditc`,
`cage`, `epds`) stay unexposed for a structural reason: they render through
the shared `lib/screener.js` machinery, which prefills from the config's
`exampleAnswers` and has no `META.example` / example-reset contract, so there
is no example to round-trip through the gate. Exposing them needs a dedicated
pass that authors `META.example` payloads and threads the screener tiles into
the example-correctness sweep's scenario allowlist — deferred, recorded here.

## Fifty-ninth wave — GI-bleed / readmission / comorbidity / performance status in lib/scoring-v4.js (+12)

The GI-bleed severity trio Glasgow-Blatchford, Rockall (with the pre-endoscopy
flag), and AIMS65, plus the Oakland lower-GI-bleed safe-discharge score; the
alcoholic-hepatitis pair Maddrey DF + Lille (composite wrapper computing both
from one lab panel, bilirubin in mg/dL); the two Canadian imaging rules
(`cthr`, `ccsr`) exposed at the collapsed any-criterion boolean granularity
their `META.example` already uses (the compute takes only the reduced
`highRisk` / `mediumRisk` / `lowRisk` / `canRotate45` booleans, so the browser
tile's per-criterion checkboxes are an input-side convenience the compute never
sees); the readmission pair HOSPITAL + LACE; the Charlson Comorbidity Index
(bespoke `toArgs` rebuilding the lib's `items` object from the flat comorbidity
booleans and threading `ageYears` — the drug-burden-index precedent); and the
Clinical Frailty Scale plus the coupled ECOG / Karnofsky performance-status
picker. Brings the exposed total to **904 calculators across 170 modules**.

## Sixtieth wave — the VTE / anticoagulation bleeding and risk cluster in lib/scoring-v4.js (+14)

The PE-severity pair PESI + sPESI and the Padua inpatient-VTE score; the four
anticoagulation bleeding-risk scores ATRIA, ORBIT, HEMORR2HAGES, and IMPROVE-
Bleeding (the last with its banded age / renal-failure enums and a fractional
weighted total); the IMPROVE-VTE prophylaxis score; the cancer-VTE Khorana
score; the VTE-recurrence pair DASH (with its -2 hormone item) and HERDOO2;
the two hematology instruments 4Ts (HIT pretest probability) and the ISTH
overt-DIC score (with its required underlying-disorder gate); and the DAPT
score for extended dual-antiplatelet therapy. All single-instrument adapters;
the banded categoricals (IMPROVE-Bleeding age/renal, Khorana site, ISTH
platelet/marker/PT/fibrinogen, DAPT age) map as enums the lib reads as strings,
and the 4Ts domains as 0-2 numbers. Brings the exposed total to **918
calculators across 170 modules**.

## Sixty-first wave — the obstetric / maternal cluster in lib/scoring-v4.js (+6)

The Biophysical Profile (five 0-or-2 components as booleans), the ACOG
severe-feature preeclampsia criteria, the HELLP triad (with the optional
platelet-nadir Mississippi class as a non-required number that the example's
empty field round-trips), the two GDM diagnostic panels Carpenter-Coustan
(100-g 3-hour OGTT) and IADPSG (75-g 2-hour OGTT), and the Modified Early
Obstetric Warning Score (vitals banded green/yellow/red with the AVPU enum and
0-3 pain score; temperature in canonical Celsius). Brings the exposed total to
**924 calculators across 170 modules**.

## Sixty-second wave — the pediatric fever / sepsis and respiratory cluster in lib/scoring-v4.js (+10)

The four febrile-infant rules Rochester, Philadelphia, Boston, and Step-by-Step
(the first three are all-criteria-met boolean checklists whose result reports
the met/total counts; Step-by-Step is a sequential decision tree returning the
risk tier and the step that fired), the Yale Observation Scale, the Westley
croup score, the two pediatric asthma scores PRAM and PASS, the pediatric GCS
(with its age-band verbal-scale enum), and the Nigrovic Bacterial Meningitis
Score. The non-uniform ordinal selects (YOS 1/3/5, Westley and PRAM per-item
maxima) map as enums coerced to numbers so each carries its point value
directly. Brings the exposed total to **934 calculators across 170 modules**.

## Sixty-third wave — the falls-risk and neuro-assessment cluster in lib/scoring-v4.js (+8)

The three fall-risk scores Braden (pressure injury), Morse Fall Scale, and
Hendrich II (the last two mix weighted booleans with ordinal-aid/gait/get-up
enums), the non-ICU CAM delirium screen, the ICH Score (with its 30-day
mortality band), the aneurysmal-SAH Hunt-Hess + WFNS grading pair, the modified
NIHSS, and the FOUR coma score. The CAM and mNIHSS examples carry empty
`fields` objects (all inputs default false/0), so every one of those adapter
fields is declared optional and the empty example round-trips. Brings the
exposed total to **942 calculators across 170 modules**.

## Sixty-fourth wave — the pediatric / ICU pain, sedation, and withdrawal scales in lib/scoring-v4.js (+10)

The behavioral pain scales FLACC, PAINAD, NIPS, and CRIES; the neonatal N-PASS
(five signed -2..+2 items yielding separate pain and sedation scores, with the
preterm gestational-age pain adjustment); the single-item sedation ordinals
POSS and SBS; the COMFORT-B behavioral sedation scale; and the two withdrawal
instruments WAT-1 and SOS. All flat numeric-input adapters over the pure lib
computes (the ordinal items, including the signed N-PASS and negative SBS
levels, are plain numbers the lib validates). Brings the exposed total to
**952 calculators across 170 modules**.

## Sixty-fifth wave — the prehospital stroke scales, ADLs, and C-SSRS in lib/scoring-v4.js (+9)

The four stroke field scales CPSS, LAMS, RACE, and ROSIER (ROSIER's plus/minus
items are booleans, the rest are ordinal numbers), the two-stage GUSS
post-stroke dysphagia screen (later consistency subtests gated until the prior
stage scores 5), the three functional-status indices Barthel, Lawton IADL, and
Katz ADL, and the Columbia-Suicide Severity Rating Scale Screener (seven yes/no
questions banded no / low / moderate / high risk). The ROSIER and C-SSRS
examples write their unchecked booleans as the literal string `"false"`, which
the shared boolean coercion accepts, so both round-trip. Brings the exposed
total to **961 calculators across 170 modules**.

## Sixty-sixth wave — the pulmonary / CAP-severity cluster in lib/scoring-v4.js (+6)

HACOR (NIV-failure prediction), the Berlin ARDS definition (four boolean
criteria plus an optional PaO2/FiO2 grade - the P/F inputs are non-required so
the example's empty fields round-trip), the Murray Lung Injury Score, SMART-COP
(age-driven tachypnea and oxygenation thresholds), CRB-65, and the ATS/IDSA
2019 severe-CAP major/minor criteria. Brings the exposed total to **967
calculators across 170 modules**.

## Sixty-seventh wave — the nutrition-risk and Ottawa-rule cluster in lib/scoring-v4.js (+6)

The four nutrition-risk screens NUTRIC, mNUTRIC, NRS-2002 (its two graded
selects map as number-coerced enums), and MUST, plus the two Ottawa decision
rules for imaging - the Ottawa Ankle/Foot Rules and the Ottawa SAH Rule (whose
exclusion criterion short-circuits the rule to inapplicable). Brings the
exposed total to **973 calculators across 170 modules**.

## Sixty-eighth wave — the workflow / wound / transfusion cluster in lib/scoring-v4.js (+7)

The DRIP drug-resistant-pneumonia score, the ABC massive-transfusion score,
NPIAP 2016 pressure-injury staging and the paired Norton + PUSH wound tools,
the VIP + INS peripheral-IV complication grading, and ABO/Rh blood-product
compatibility (recipient and product enums). This drains the last adaptable
Group-G tiles in `lib/scoring-v4.js` (the PECARN IAI rule was already exposed
in wave 54).

One tile in this module stays unexposed and is recorded as such: `aldrete-padss`
has an empty `META.example.fields` `{}` whose expected result ("Aldrete 10 /
PADSS 10") comes from the browser tile's default-2 sliders; a flat compute over
the empty input object scores 0/0, so the round-trip cannot honor the documented
value without fabricating defaults the adapter contract does not inject. The
underlying Aldrete computation is already exposed as the standalone `aldrete`
tile (wave 58). Brings the exposed total to **979 calculators across 170
modules**.

## Sixty-ninth wave — the group-v5 diagnostic ratios and staging tiles in lib/clinical-v5.js (+7)

Wave 54 adapted only the sodium/fluid/ventilation subset of `lib/clinical-v5.js`;
this wave appends the remaining `views/group-v5.js` tiles that share the module:
Light's criteria (pleural exudate/transudate), the Mentzer index, the SAAG, the
drug-induced-liver-injury R-factor, KDIGO AKI staging (optional urine-output and
RRT inputs left non-required), the modified Sgarbossa criteria, and the
AVPU-to-GCS crosswalk (a positional-string lib call wrapped so the flat `lvl`
enum maps onto it). No new module - append-only to the existing adapter. Brings
the exposed total to **986 calculators across 170 modules**.

## Seventieth wave — the flat prehospital / MCI triage screens in lib/field.js (+4, new module)

The first genuinely new lib module this batch (`lib/field.js`, registered in
`mcp/catalog.js`): the Cincinnati Prehospital Stroke Scale, FAST / BE-FAST (its
`fast(answers, opts)` compute is wrapped to always score the extended BE-FAST
item set), and the START (adult) and JumpSTART (pediatric) mass-casualty triage
algorithms (their airway/rescue-breath enums map `na` to `undefined` via a
per-field `to` transform). Brings the exposed total to **990 calculators across
171 modules**.

The rest of `lib/field.js` is deferred to a dedicated pass: the trauma
`field-triage` tile reads variable criterion keys from a shipped `data/` shard
(data-driven, not a fixed field list), and the burn / airway / drug-dose tiles
(`bsa_burn`'s rule-of-nines region array, `burn-fluid`, `peds-ett`, `naloxone`,
`peds-weight-dose`) take array inputs or recipe-table lookups needing a bespoke
`toArgs`.

## Seventy-first wave — the environmental-emergency decision tiles in lib/scoring-v4.js (+2)

The Swiss accidental-hypothermia staging + rewarming pathway (Durrer 2003) and
the heat-illness severity + cooling algorithm (Bouchama 2002 / WMS 2019), both
rendered by `views/group-i.js` but computed in `lib/scoring-v4.js`. Append-only.
This is the true completion of the adaptable `lib/scoring-v4.js` tiles (only the
default-slider-dependent `aldrete-padss` remains deferred). Brings the exposed
total to **992 calculators across 171 modules**.

## Seventy-second wave — the pediatric / adult severity scores in lib/scoring-v6.js (+6)

Wave 54 adapted only the neonatal subset of `lib/scoring-v6.js`; this wave
appends the `views/group-v10.js` severity scores that share the module: PELOD-2
and pSOFA (age-banded pediatric organ dysfunction), the Burch-Wartofsky thyroid-
storm scale and ARISCAT postoperative-pulmonary score (both point-encoded
selects entered as their point values), APACHE II (twelve raw acute-physiology
variables + age/chronic-health points), and the Braden Q pediatric pressure-
injury scale. Append-only. Brings the exposed total to **998 calculators across
171 modules**.

## Seventy-third wave — the remaining group-v5 clinical scores in lib/clinical-v5.js (+3)

The last three `views/group-v5.js` tiles that share `lib/clinical-v5.js`: the
Revised Cardiac Risk Index (perioperative), the Pediatric Early Warning Score
(its three subscale dom keys are the capitalized `Behavior` / `Cardiovascular` /
`Respiratory`), and the ABCD2 post-TIA stroke-risk score. Append-only. Brings
the exposed total to **1001 calculators across 171 modules**.

## Seventy-fourth wave — the deterministic ICU workflow tiles in lib/scoring-v4.js (+3)

The three `views/group-h.js` / `views/group-g.js` monitoring tiles whose compute
is a pure function of its inputs: the Lung Injury Prediction Score (LIPS), the
massive-transfusion-protocol ratio tracker, and the Bristol Stool Form Scale
(with its optional abdominal-girth trend, timestamps passed as strings).
Append-only. The remaining group-h tiles are deferred: the clock/timer tiles
(`ews-escalation`, `restraint-timer`, `sepsis-bundle-clock`, `code-blue-clock`,
`device-day-counter`) compute from wall-clock timestamps, and `vent-sbt-peep`'s
example encodes a checkbox as the non-boolean string `"on"`; both need a
dedicated pass. Brings the exposed total to **1004 calculators across 171
modules**.

## Seventy-fifth wave — the ID / critical-care criteria in lib/idcrit-v99.js (+4, new module)

A new lib module (`lib/idcrit-v99.js`, registered in `mcp/catalog.js`): the
modified Duke endocarditis rule (its major/minor criterion arrays rebuilt from
flat per-criterion booleans, the key sets read from the lib's own
`DUKE_MAJOR_CRITERIA` / `DUKE_MINOR_CRITERIA` tables so the schema cannot
drift - the kawasaki / mcgeer precedent), the Pitt Bacteremia Score, SAPS II
(17 physiologic / categorical variables banded to a predicted-mortality
percentage), and the NICE refeeding-syndrome risk criteria. The fifth tile in
this module, `lund-browder`, stays deferred: it takes a variable-length
per-region burn-fraction object needing its own bespoke `toArgs`. Brings the
exposed total to **1008 calculators across 172 modules**.

## Seventy-sixth wave — the group-v9 screening / decision instruments in lib/scoring-v5.js (+14, new module)

A new lib module (`lib/scoring-v5.js`, registered in `mcp/catalog.js`): the
ultra-brief PHQ-2/GAD-2, the full AUDIT, DAST-10, and GDS-15 screens, the Ottawa
Knee and NEXUS Chest imaging rules, the San Francisco and Canadian syncope
rules, EDACS, the YEARS PE algorithm, FeverPAIN, the STONE ureteral-stone score,
combined ISS + RTS trauma scoring, and the pediatric age-adjusted shock index
(SIPA). AUDIT, DAST-10, and GDS-15 take a fixed-length `items` array rebuilt
from the flat per-question fields by a bespoke `toArgs` that defaults absent
items, so the reverse-scored questions (DAST-10 item 3, the GDS-15
positive-worded items) score correctly. Brings the exposed total to **1022
calculators across 173 modules**.

## Seventy-seventh wave — the cardiovascular 10-year risk engines in lib/scoring-v4.js (+2)

The ASCVD Pooled Cohort Equations (race-stratified) and the AHA PREVENT 2023
(race-free) 10-year total-CVD risk models, both rendered by `views/group-g.js`
and computed in `lib/scoring-v4.js`. Append-only. Each echoes its 10-year
horizon (and PREVENT its age) so the documented facts in the interpretive
example text round-trip alongside the computed risk percentage. Brings the
exposed total to **1024 calculators across 173 modules**.

## Seventy-eighth wave — the flat burn / airway / drug-dose recipes in lib/field.js (+4)

Appends the four `views/group-i.js` tiles in `lib/field.js` whose recipe / table
lookups the lib performs internally from flat inputs: burn-resuscitation fluid
(Parkland + modified Brooke), the pediatric ETT size / depth formulas, the
naloxone dosing reference (population + route enums), and weight-based pediatric
resuscitation dosing (a medication-recipe enum). Append-only. The remaining
`lib/field.js` tiles stay deferred: `field-triage` reads variable criterion keys
from a shipped `data/` shard, and `bsa_burn` takes a variable-length rule-of-
nines region array. Brings the exposed total to **1028 calculators across 173
modules**.

## Seventy-ninth wave — the restraint-reassessment timer in lib/scoring-v4.js (+1)

The `views/group-h.js` restraint-reassessment timer (42 CFR 482.13): its cadence
banners (renewal q4h, nursing q15 min, physician face-to-face within 1 h) are
constants that round-trip, and its next-due ISO fields are a pure function of
the entered order timestamp (zero `Date.now()`). The datetime input is passed as
an ISO string. Append-only. The sibling clock tiles stay deferred:
`ews-escalation` and `sepsis-bundle-clock` report a timezone-shifted ISO
due-time (datetime-local input -> UTC output) whose hour digits the interpretive
example cites, so they cannot round-trip through the numeric contract (they sit
on the e2e example-correctness scenario-only allowlist for the same reason);
`code-blue-clock` and `device-day-counter` each read the wall clock. Brings the
exposed total to **1029 calculators across 173 modules**.

## Eightieth wave — Naegele's rule in lib/clinical.js (+1)

The `views/group-e.js` estimated-due-date tile (last menstrual period + 280
days). The lib also reports a current gestational age computed against today's
date; that field is wall-clock dependent, so the adapter returns only the
deterministic due date (the gestational-age reading stays a browser-only
convenience). Append-only. Brings the exposed total to **1030 calculators across
173 modules**.

## Eighty-first wave — the Lund-Browder burn %TBSA in lib/idcrit-v99.js (+1)

The `views/group-v25.js` Lund-Browder burn tile, deferred in wave 75 for its
per-region fraction object: a bespoke `toArgs` rebuilds the age band and the
`{ region: fraction }` map from the flat `lb-age` / `lb-<region>` fields, the
region key set read from the lib's `LB_REGION_LIST` table so the schema cannot
drift (the Duke / kawasaki precedent). Append-only. Brings the exposed total to
**1031 calculators across 173 modules**.

## Eighty-second wave — the burn %TBSA estimator in lib/field.js (+1)

The `views/group-i.js` `bsa_burn` tile, deferred in wave 70 for its method-
branched region arrays: a bespoke `toArgs` builds either the Rule-of-Nines
`{ region: checked }` selection (keys read from the lib's `RULE_OF_NINES_ADULT`
table) or the Lund-Browder `{ region: percent }` map, and the compute dispatches
on the method. Append-only. Brings the exposed total to **1032 calculators across
173 modules**.

## Eighty-third wave — the ventilator SBT readiness + ARDSnet PEEP tile in lib/scoring-v4.js (+1)

The `views/group-h.js` `vent-sbt-peep` tile, deferred at the wave-82 close only
because its `META.example` filled the awake/cooperative checkbox with the DOM
literal `'on'` — a value `applyExample` never checks (it honors `'1'`/`true`) and
that `mcp/fields.js` `isBoolLike` rejects, so the browser example rendered "SBT
not ready" against an "all 5 criteria met" expected string and the MCP round-trip
could not validate. The example now uses `'1'`, which fixes the browser render
and makes the checkbox bool-like. The adapter wraps the pure `ventSbtPeep` to
echo two self-describing counts (`criteriaTotal` / `criteriaMet`) so the
documented "All 5 criteria met" round-trips — the five criteria labels carry the
threshold digits (150 / 8 / 0.5) but not the count. Append-only. Brings the
exposed total to **1033 calculators across 173 modules**.

This again closes the routinely-adaptable catalog: the remaining unexposed
clinical tiles are all structurally out of reach of the single-source round-trip
contract and are recorded as deferred - tiles whose compute lives inline in the
view with no pure `lib` function (`nexus-cspine`, `tb-testing`, `lab-interpret`,
`insulin-drip`), wall-clock-dependent tiles (`due-date`'s gestational age,
`preg-dating`, `code-blue-clock`, `device-day-counter`, and the timezone-shifted
`ews-escalation` / `sepsis-bundle-clock`), empty-`{}`-example tiles that depend
on the browser's default field values (`opioid-mme`, `aldrete-padss`), the
`PaCO2`-substring extractor collision of `minute-ventilation`, the
per-kg/per-minute-ambiguous `vasopressor`, the data-shard-driven `field-triage`,
the `lib/screener.js` config tiles with no `META.example` (`phq9`, `gad7`,
`auditc`, `cage`, `epds`), and the pure static reference cards
(`co-cn-antidote`, `tetanus`, `rabies-pep`, `bbp-exposure`, `sti-screening`).

## Eighty-fourth wave — the measured (timed-urine) creatinine clearance in lib/renal-v277.js (+1)

The first exposure from the SESSION-33 composite-index / lab-ratio program
(spec-v267 through spec-v277). `measured-crcl` is the direct
C = (U x V) / P clearance from a timed urine collection — `(urine creatinine x
urine volume) / (serum creatinine x collection time in minutes)` — the measured
counterpart to the Cockcroft-Gault estimate the catalog already exposes. The
pure `measuredCrcl` compute is a bounded four-number formula that routes through
`lib/num.js`; its `band` string already carries both example numbers (the
100 mL/min result and the 24-hour collection window), so the documented example
round-trips through the default `makeToArgs` with no custom `toArgs` or
`formatResult`. New adapter module registered in `mcp/catalog.js`. Brings the
exposed total to **1034 calculators across 174 modules**.

## Eighty-fifth wave — the RDW-to-platelet ratio in lib/fibrosis-v275.js (+1)

`rpr` (spec-v275) is the non-invasive liver-fibrosis marker
`RDW (%) / platelet count (10^9/L)` (Chen 2013) — a higher ratio marks more
advanced fibrosis. The pure `rpr` compute is a bounded two-number ratio through
`lib/num.js`; its `bandLabel` carries the 0.16 example result and its `note`
carries the ~0.1 derivation cutoff, so the example round-trips through the
default `makeToArgs`. New adapter module registered in `mcp/catalog.js`. Brings
the exposed total to **1035 calculators across 175 modules**.

## Eighty-sixth wave — the Buzby Nutritional Risk Index in lib/nutrition-v276.js (+1)

`nri` (spec-v276) is the VA-TPN Nutritional Risk Index
`1.519 x albumin (g/L) + 41.7 x (current weight / usual weight)` (Buzby) — a
lower value marks greater perioperative nutritional risk (bands >100 none,
97.5-100 mild, 83.5-97.5 moderate, <83.5 severe). Bounded three-number compute
through `lib/num.js`; its `bandLabel` carries the 96.5 example result, so the
example round-trips through the default `makeToArgs`. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1036 calculators
across 176 modules**.

## Eighty-seventh wave — the albumin-to-globulin ratio in lib/proteins-v274.js (+1)

`agr` (spec-v274) is the albumin-to-globulin ratio
`albumin / (total protein - albumin)`, both in g/dL — a lower value is less
favorable (typical range ~1.1-2.5, context-dependent). Bounded two-number
compute through `lib/num.js`; the result echoes both the 1.33 ratio and the
derived globulin of 3 g/dL, so the example round-trips through the default
`makeToArgs`. New adapter module registered in `mcp/catalog.js`. Brings the
exposed total to **1037 calculators across 177 modules**.

## Eighty-eighth wave — the TyG-BMI insulin-resistance surrogate in lib/metabolic-v273.js (+1)

`tyg-bmi` (spec-v273) is the adiposity-enhanced insulin-resistance surrogate
`ln[(fasting triglycerides x fasting glucose) / 2] x BMI`, lipids/glucose in
mg/dL (Er 2016; TyG core Simental-Mendia 2008) — a higher value marks greater
insulin resistance (no universal cut-point). Bounded three-number compute
through `lib/num.js`; its `bandLabel` carries the 223.07 example result, so the
example round-trips through the default `makeToArgs`. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1038 calculators
across 178 modules**.

## Eighty-ninth wave — the waist-to-height ratio in lib/anthro-v272.js (+1)

`whtr` (spec-v272) is the waist-to-height ratio `waist / height` (Ashwell) — a
value at or above the 0.5 boundary marks increased central-adiposity risk.
Bounded two-number ratio through `lib/num.js`; its `bandLabel` carries the 0.53
example result and its `note` carries the 0.5 boundary, so the example
round-trips through the default `makeToArgs`. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1039 calculators across 179
modules**.

## Ninetieth wave — the Castelli Risk Indices in lib/lipids-v271.js (+1)

`castelli-index` (spec-v271) returns Castelli Risk Index-I (total cholesterol /
HDL) and Risk Index-II (LDL / HDL), all in mg/dL — higher ratios mark a more
atherogenic profile. Bounded three-number compute through `lib/num.js`; the
result echoes both the 4 (RI-I) and 2.6 (RI-II) example ratios, so the example
round-trips through the default `makeToArgs`. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1040 calculators across 180
modules**.

## Ninety-first wave — the Cardiometabolic Index in lib/adiposity-v270.js (+1)

`cmi` (spec-v270) is the Cardiometabolic Index `(triglycerides / HDL) x
waist-to-height ratio`, lipids in mg/dL (Wakabayashi 2015) — a higher value
marks a worse cardiometabolic profile (no universal cut-point). Bounded
four-number compute through `lib/num.js`; its `bandLabel` carries the 1.59
example result, so the example round-trips through the default `makeToArgs`. New
adapter module registered in `mcp/catalog.js`. Brings the exposed total to
**1041 calculators across 181 modules**.

## Ninety-second wave — the METS-IR insulin-resistance surrogate in lib/metabolic-v269.js (+1)

`mets-ir` (spec-v269) is the fasting-insulin-free insulin-resistance surrogate
`(ln[(2 x fasting glucose) + fasting triglycerides] x BMI) / ln(HDL-C)`,
glucose/TG/HDL in mg/dL and BMI in kg/m^2 (Bello-Chavolla 2018) — a higher value
marks greater insulin resistance (no universal cut-point). Bounded four-number
compute through `lib/num.js`; its `bandLabel` carries the 37.44 example result,
so the example round-trips through the default `makeToArgs`. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1042 calculators
across 182 modules**.

## Ninety-third wave — the HALP score in lib/inflam-v267.js (+1)

`halp-score` (spec-v267) is the combined nutrition / inflammation / immune-reserve
marker `hemoglobin (g/L) x albumin (g/L) x absolute lymphocyte count (10^9/L) /
platelet count (10^9/L)` (Chen 2015) — unlike neutrophil-based ratios, a LOWER
HALP marks a worse profile (cohort-specific cutoff). Bounded four-number compute
through `lib/num.js`; its `bandLabel` carries the 44.8 example result, so the
example round-trips through the default `makeToArgs`. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1043 calculators
across 183 modules**.

## Ninety-fourth wave — the Advanced Lung Cancer Inflammation Index in lib/inflam-v268.js (+1)

`ali-index` (spec-v268) is the combined nutrition / inflammation marker
`BMI (kg/m^2) x serum albumin (g/dL) / neutrophil-to-lymphocyte ratio (ANC/ALC)`
(Jafri 2013) — a higher value is more favorable, so a LOWER value marks a worse
profile (cohort-specific cutoff). Bounded four-number compute through
`lib/num.js`; its `bandLabel` carries the 33.3 example result, so the example
round-trips through the default `makeToArgs`. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1044 calculators across 184
modules** — completing the exposure of the SESSION-33 composite-index / lab-ratio
program (spec-v267 through spec-v277).

## Ninety-fifth wave — the Phoenix Sepsis Score in lib/peds-sepsis-v278.js (+1)

`phoenix-sepsis` (spec-v278) is the 2024 SCCM/JAMA international-consensus
organ-dysfunction score that now DEFINES pediatric sepsis: four organ systems —
respiratory (0-3), cardiovascular (0-6), coagulation (0-2), neurologic (0-2) —
sum to a 0-13 total. In a child with suspected/confirmed infection, total >= 2 =
sepsis and a cardiovascular sub-score >= 1 = septic shock. The compute takes the
worst value per system through `lib/num.js`; age is the only required input and
every organ-system value is optional (a blank field is "not measured" and scores
no points). Its `band` carries the `Phoenix Sepsis Score 8/13` example result, so
the example round-trips through the default `makeToArgs`. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1045 calculators
across 185 modules** — opening MCP exposure of the SESSION-36 advanced prognostic
/ classification program (spec-v278 through spec-v281).

## Ninety-sixth wave — resected-RCC prognosis in lib/rcc-prognosis-v279.js (+2)

`leibovich-rcc` and `uiss-rcc` (spec-v279) are the two surgically-resected renal-
cell-carcinoma prognosis instruments. The Leibovich progression score
(Leibovich 2003, clear-cell RCC) sums five pathology factors to an additive
0-11 recurrence-risk total (low 0-2 / intermediate 3-5 / high >= 6); its `detail`
carries the `8/11` example result, so the example round-trips through the default
`makeToArgs`. The UCLA Integrated Staging System (UISS; Zisman 2001/2002, Patard
2004 validation) maps 1997 TNM stage + Fuhrman grade + ECOG into low /
intermediate / high tiers for LOCALIZED (N0M0) disease only — its categorical
example (`high risk`) round-trips through the band text, and the node-positive /
metastatic branch is intentionally out of scope (routed to imdc-rcc / mskcc-rcc).
New adapter module registered in `mcp/catalog.js`. Brings the exposed total to
**1047 calculators across 186 modules**.

## Ninety-seventh wave — rheumatology function & case definition in lib/rheum-fn-v280.js (+2)

`haq-di` and `asas-axspa` (spec-v280) are the two rheumatology function /
case-definition instruments. The Health Assessment Questionnaire Disability Index
(HAQ-DI; Fries 1980) averages 8 functional-category scores (each 0-3, with an
aids/help adjustment) into a 0-3 index, computable once >= 6 of 8 categories are
answered; its `detail` carries the `2/3` example, so the example round-trips
through the default `makeToArgs`. The ASAS classification criteria for axial
spondyloarthritis (Rudwaleit 2009) evaluate the entry gate plus the imaging /
clinical arms over 11 boolean SpA features; its categorical example (`MEETS the
ASAS axial-SpA classification`) round-trips through the band text. Because both
tiles have their own completeness / arm gates, no single field is marked required
(the lib's own guard fires). New adapter module registered in `mcp/catalog.js`.
Brings the exposed total to **1049 calculators across 187 modules**.

## Ninety-eighth wave — hepatocellular-carcinoma surveillance in lib/hcc-surveillance-v281.js (+2)

`galad-hcc` and `toronto-hcc-risk` (spec-v281) are the two HCC surveillance /
detection instruments. The GALAD score (Johnson 2014) evaluates a logistic
linear predictor Z over Gender, Age, AFP-L3, AFP, and DCP; its `z`/`detail`
carry the `5.58` example, so the example round-trips through the default
`makeToArgs`. The Toronto HCC Risk Index (THRI; Sharma 2017) sums age, sex,
etiology, and platelet-band points to a 0-366 total (low < 120 / medium 120-240 /
high > 240); its `detail` carries the `347/366` example. Every input is required
(each compute needs the full set). New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1051 calculators across 188
modules** — completing MCP exposure of the SESSION-36 advanced prognostic /
classification program (spec-v278 through spec-v281; all 7 tiles now
deterministic agent tools).

## Ninety-ninth wave — acute & primary-care decision rules in lib/decision-rules-v258.js (+3)

`canadian-ct-head`, `sf-syncope`, and `mcisaac` (spec-v258) are three acute /
primary-care decision rules whose pure computes had not yet been adapted. The
Canadian CT Head Rule and the San Francisco Syncope Rule (CHESS) are all-boolean
criteria rules whose `band` names the fired criteria — the example text
(criteria labels with their embedded thresholds) round-trips through the band.
The McIsaac score is the age-corrected Centor for streptococcal pharyngitis; its
`band` carries the `McIsaac 3 ... ~28-35%` example, and age is the only required
input. Every criterion is a boolean coerced by the default `toBool`. New adapter
module registered in `mcp/catalog.js`. Brings the exposed total to **1054
calculators across 189 modules** — opening MCP exposure of the SESSION-32
subspecialty-depth program (spec-v258 onward), whose pure-compute tiles a prior
audit had missed.

## One-hundredth wave — pneumonia severity / drug-resistance risk in lib/pneumonia-risk-v260.js (+3)

`a-drop`, `drip-score`, and `shorr` (spec-v260) are three pneumonia risk scores.
A-DROP (JRS CAP severity) is a 0-5 criteria count; DRIP scores drug-resistant-
pathogen risk (>= 4 = high); the Shorr score predicts MRSA pneumonia (> 30%
prevalence = high). All three are all-boolean weighted counts whose `band`
carries the example total (`3 of 5`, `DRIP 4`, `Shorr 6`), so each example round-
trips through the default `makeToArgs` / `toBool`. No field is individually
required. New adapter module registered in `mcp/catalog.js`. Brings the exposed
total to **1057 calculators across 190 modules**.

## One-hundred-first wave — acute-abdomen / emergency-surgery risk in lib/acute-abdomen-v261.js (+3)

`ripasa`, `pulp`, and `emergency-surgery-score` (spec-v261) are three acute-
abdomen / emergency-surgery risk scores. RIPASA is a weighted 0-16 appendicitis
probability (>= 7.5 cutoff); PULP is a 0-18 perforated-peptic-ulcer mortality
score; ESS is a 0-29 emergency-general-surgery 30-day-mortality predictor. Each
mixes boolean criteria with a few enum bands (demographics / ASA / WBC / transfer)
that default in the compute when omitted, so the examples (`RIPASA 7.5`, `PULP 9`,
`ESS 13`) round-trip through the default `makeToArgs`; no field is individually
required. New adapter module registered in `mcp/catalog.js`. Brings the exposed
total to **1060 calculators across 191 modules**.

## One-hundred-second wave — pediatric acute-care scores in lib/pediatric-acute-v262.js (+3)

`lab-score`, `chalice`, and `egami` (spec-v262) are three pediatric acute-care
scores. The Lab-score (0-9) stratifies serious bacterial infection in young
febrile children (>= 3 high risk); CHALICE recommends a head CT if any of 14
criteria is present; the Egami score (0-6) predicts IVIG resistance in Kawasaki
disease (>= 3 high risk). Each mixes boolean criteria with CRP/PCT enum bands
that default in the compute when omitted, so the examples (`Lab-score 4 of 9`,
`CHALICE positive ... 1 of 14`, `Egami 3 of 6`) round-trip through the default
`makeToArgs`; no field is individually required. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1063 calculators across 192
modules**.

## One-hundred-third wave — respiratory / maternal acute scores in lib/respiratory-maternal-v263.js (+3)

`mulbsta`, `ottawa-copd`, and `sepsis-obstetrics-score` (spec-v263) are three
acute-care scores. MuLBSTA (0-20) predicts 90-day viral-pneumonia mortality;
the Ottawa COPD Risk Scale (0-16) predicts short-term serious outcomes in acute
COPD exacerbation; the Sepsis in Obstetrics Score (0-28) predicts ICU admission
(>= 6 high risk). The first two mix booleans with a smoking enum; SOS is eight
physiologic band enums that default to `normal` when omitted. Each example
(`MuLBSTA 12`, `Ottawa COPD 5`, `SOS 6`) round-trips through the default
`makeToArgs`; no field is individually required. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1066 calculators across 193
modules**.

## One-hundred-fourth wave — the ABC massive-transfusion score in lib/massive-transfusion-v265.js (+1)

`abc-transfusion-score` (spec-v265) is the Assessment of Blood Consumption score:
a 0-4 boolean count (penetrating mechanism, SBP <= 90, HR >= 120, positive FAST)
where a total >= 2 predicts massive transfusion in trauma. Its `band` carries the
`ABC 2 of 4` example, so it round-trips through the default `makeToArgs` / `toBool`;
no field is individually required. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1067 calculators across 194
modules**.

## One-hundred-fifth wave — the SSIGN RCC score in lib/rcc-prognosis-v266.js (+1)

`ssign-score` (spec-v266) is the Mayo SSIGN score (Stage, Size, Grade, Necrosis):
a 0-17 model for cancer-specific survival in clear-cell RCC over pT stage,
regional nodes, distant metastasis, tumor size, Fuhrman grade, and coagulative
necrosis. Each factor is an enum band that defaults to its 0 value when omitted;
the `band` carries the `SSIGN 7 of 17 ... ~57.7% (score 7-9) 5-year` example, so
it round-trips through the default `makeToArgs`. No field is individually
required. New adapter module registered in `mcp/catalog.js`. Brings the exposed
total to **1068 calculators across 195 modules** — completing MCP exposure of the
SESSION-32 subspecialty-depth program (spec-v258 through spec-v266): every pure-
compute tile a prior audit had missed is now a deterministic agent tool.

## One-hundred-sixth wave — the AABB restrictive transfusion threshold in lib/transfusion-v292.js (+1)

`transfusion-threshold` (spec-v292) is the AABB 2023 restrictive transfusion
threshold decision aid: given a hemoglobin (g/dL) and a patient population it
reports the population's threshold (7 g/dL stable adults/children, 7.5 cardiac
surgery, 8 orthopedic surgery or preexisting cardiovascular disease) and whether
the value sits below it, with a first-class "no numeric recommendation" output
for acute coronary syndrome. Hemoglobin and population are required (both appear
in the example); the symptomatic checkbox is optional. Its `band` carries the
"below the 7 g/dL AABB restrictive threshold" example, so it round-trips through
the default `makeToArgs` / `toBool` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`. Brings the exposed total to **1069 calculators
across 196 modules** — the first tile of the spec-v285-v291 search program's
surfaced catalog gap.

## One-hundred-seventh wave — the NEXUS c-spine rule extracted to a lib fn (+1)

`nexus-cspine` (the NEXUS low-risk cervical-spine criteria, Hoffman JR et al.
NEJM 2000) was previously an inline-compute renderer with no pure lib function,
so the pure-adapter sweep had deferred it (wave-82 note). Its compute is now
extracted verbatim into `nexusCspine()` in `lib/field.js` (the group-i renderer
imports it and renders the same band string byte-for-byte), so it exposes on the
existing `lib/field.js` adapter set. Five booleans; imaging is NOT required only
when all five low-risk criteria are met. Its META.example (all five met) carries
no numeric fact, so the round-trip check passes on the band text. Brings the
exposed total to **1070 calculators across 196 modules** — the first of the
inline-compute deferrals reclaimed by a deliberate lib extraction rather than the
append-only adapter recipe.

## One-hundred-eighth wave — the TST interpretation extracted to a lib fn (+1)

`tb-testing` (the TST / Mantoux tuberculin-skin-test interpretation) was an
inline-compute renderer with an async IGRA reference list, so the pure-adapter
sweep had deferred it. Its per-patient TST interpretation (induration >= the
risk-stratified 5 / 10 / 15 mm cutoff = positive, CDC/ATS) is now extracted into
`tbTstInterpret()` in the new `lib/tb-testing.js`, and the group-j renderer
computes it synchronously (the IGRA data-file list still appends after load, so
the final DOM is unchanged). New adapter module registered in `mcp/catalog.js`.
The IGRA reference list is a static dataset lookup and stays view-only. Brings
the exposed total to **1071 calculators across 197 modules**.

## One-hundred-ninth wave — minute-ventilation, unblocking the PaCO2 matcher collision (+1)

`minute-ventilation` already had a pure lib fn (`clinical-v8.js minuteVentilation`);
it was deferred only because its META.example expected string read "...target
PaCO2 is 24/min", and the numeric-fact extractor pulls the "2" out of "PaCO2" as a
spurious fact that the JSON result (V̇E 7.2, rate 24) cannot satisfy. The expected
is reworded to "...rate to reach the target is 24/min" — the real facts (7.2, 24)
still appear in both the browser render and the JSON, so the e2e sweep and the MCP
round-trip both pass, without the phantom "2". Adapter appended to the existing
`clinical-v8.js` set; V̇E = RR x Vt, plus alveolar ventilation (with IBW) and the
rate to a target PaCO2. Brings the exposed total to **1072 calculators across 197
modules**.

## One-hundred-forty-sixth wave — the Hinchey classification of acute diverticulitis in lib/hinchey-v321.js (+1)

`hinchey` (spec-v321) applies the original Hinchey classification of perforated
diverticulitis: given the stage, it reports the stage (I-IV) and its standard definition.
`stage` is an enum (`kind: 'enum'`, values I/II/III/IV; the compute also accepts arabic
1-4) — the single input the renderer exposes. The example sets stage III; its expected text
is the stage definition (roman-graded, no numeric facts), so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("diverticulitis stage") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1110 calculators across 226 modules**.

## One-hundred-forty-fifth wave — the Clavien-Dindo classification of surgical complications in lib/clavien-dindo-v320.js (+1)

`clavien-dindo` (spec-v320) applies the Clavien-Dindo classification of surgical
complications: given the grade, it reports the grade (I / II / IIIa / IIIb / IVa / IVb / V)
and its standard definition. `grade` is an enum (`kind: 'enum'`) — the single input the
renderer exposes. The example sets grade IIIa; its expected text is the grade definition
(letter-graded, no numeric facts), so it round-trips through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("clavien dindo") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1109 calculators across 225 modules**.

## One-hundred-forty-fourth wave — the CCS angina grade in lib/ccs-angina-v319.js (+1)

`ccs-angina` (spec-v319) applies the Canadian Cardiovascular Society grading of angina
pectoris: given the class, it reports the class (I-IV) and its standard definition.
`grade` is an enum (`kind: 'enum'`, the select values 1/2/3/4; the compute also accepts
roman I-IV) — the single input the renderer exposes. The example sets grade 2; its band
carries the "2" example number, so it round-trips through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("ccs angina") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1108 calculators across 224 modules**.

## One-hundred-forty-third wave — the Los Angeles (LA) classification of erosive esophagitis in lib/la-esophagitis-v318.js (+1)

`la-esophagitis` (spec-v318) applies the Los Angeles classification of erosive (reflux)
esophagitis: given the endoscopic grade, it reports the grade (A-D) and its standard
definition. `grade` is an enum (`kind: 'enum'`, values A/B/C/D) — the single input the
renderer exposes. The example sets grade B; its band carries the "5 mm" example number,
so it round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("erosive esophagitis grade") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1107 calculators across 223 modules**.

## One-hundred-forty-second wave — the CDI severity classification (2017 IDSA/SHEA) in lib/cdi-severity-v317.js (+1)

`cdi-severity` (spec-v317) applies the 2017 IDSA/SHEA Clostridioides difficile infection
severity criteria: given the WBC, serum creatinine, and any fulminant finding, it reports
non-severe, severe, or fulminant. `wbc` and `creatinine` are numbers (`kind: 'number'`),
each optional at the field level (the compute itself requires both when no fulminant
finding is checked, and returns valid:false otherwise); `hypotension`, `ileus`, and
`megacolon` are booleans — any one classifies fulminant and overrides the labs. The
example sets WBC 18000 + creatinine 1.2 (a WBC-driven severe case); its band carries the
"18000", "15,000", "1.2", and "1.5" example numbers, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("clostridioides difficile severity") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1106 calculators across 222 modules**.

## One-hundred-forty-first wave — the GOLD ABE assessment tool (COPD group A/B/E) in lib/gold-abe-v316.js (+1)

`gold-abe` (spec-v316) applies the 2023 GOLD ABE assessment tool: given the symptom
burden (mMRC and/or CAT) and the past-12-month exacerbation history, it reports the
COPD group A, B, or E. Two axes: "more symptoms" if mMRC >= 2 or CAT >= 10; "high
exacerbation risk" (group E) if >= 2 moderate exacerbations or >= 1 leading to hospital
admission. `mmrc`, `cat`, and `moderateExacerbations` are numbers (`kind: 'number'`),
each optional (the compute treats an absent mMRC/CAT as not-entered — at least one is
required by the compute itself — and defaults the exacerbation count to 0);
`hospitalizedExacerbation` is a boolean. The example sets mMRC 2 + one moderate
exacerbation (a group-B case); its band carries the "mMRC 2" and "1 moderate
exacerbation" example numbers, so it round-trips through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("copd group") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1105 calculators across 221 modules**.

## One-hundred-fortieth wave — the 2015 revised Jones criteria (acute rheumatic fever) in lib/jones-v315.js (+1)

`jones-criteria` (spec-v315) applies the 2015 AHA revised Jones criteria: given the
population risk tier, episode type, group-A-strep evidence, and the manifestations
present, it reports whether the criteria are met, met-but-needs-strep-evidence, or
not met. `riskPopulation` and `episode` are enums; the rest are booleans (`kind:
'bool'`), each optional (the compute defaults each to false). The example sets gas +
carditis + polyarthritis (a 2-major low-risk initial case that is met); its band
carries the "2 major" example number, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("acute rheumatic fever") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1104 calculators across 220
modules**.

## One-hundred-thirty-ninth wave — the Deauville 5-point score (PET response, lymphoma) in lib/deauville-v314.js (+1)

`deauville-score` (spec-v314) is the FDG-PET metabolic-response companion to the Ann
Arbor / Lugano anatomic staging tile: given the 5-point uptake score (1-5) it reports
the score, its uptake description, and the Lugano interpretation (1-2 negative, 4-5
positive, 3 by clinical context). The single `score` field is an enum (1-5),
required (the compute throws without it). The compute's `band` carries the "score 4
-> positive" example, so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("deauville score") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1103 calculators across 219 modules**.

## One-hundred-thirty-eighth wave — the acute cholecystitis diagnosis (Tokyo Guidelines TG18) in lib/cholecystitis-dx-v313.js (+1)

`cholecystitis-diagnosis` (spec-v313) is the fourth and final adapter of the TG18
biliary quartet (cholangitis + cholecystitis, each with a diagnosis and a severity
grade). It classifies a presentation as definite / suspected / not-met from three
TG18 categories (A local signs, B systemic signs, C imaging). Suspected: one item in
A + one in B. Definite: one item in A + one in B + C. All 6 fields are booleans
(`kind: 'bool'`), each optional (the compute defaults each to false, and only strict
boolean `true` fires). The example sets ccd-murphy + ccd-fever (a suspected case);
its expected text carries no numbers, so the round-trip is trivial through the
default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("acute cholecystitis diagnosis") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1102
calculators across 218 modules**.

## One-hundred-thirty-seventh wave — the acute cholangitis diagnosis (Tokyo Guidelines TG18) in lib/cholangitis-dx-v312.js (+1)

`cholangitis-diagnosis` (spec-v312) is the diagnostic companion to the wave-135
severity grade: it classifies a presentation as definite / suspected / not-met from
three TG18 categories (A systemic inflammation, B cholestasis, C imaging). Suspected:
one item in A + one in B or C. Definite: one item in each of A, B, and C. All 6
fields are booleans (`kind: 'bool'`), each optional (the compute defaults each to
false, and only strict boolean `true` fires). The example sets cgd-fever +
cgd-jaundice (a suspected case); its expected text carries no numbers, so the
round-trip is trivial through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("acute cholangitis
diagnosis") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1101 calculators across 217 modules**.

## One-hundred-thirty-sixth wave — the acute cholecystitis severity grade (Tokyo Guidelines TG18) in lib/cholecystitis-v311.js (+1)

`cholecystitis-severity` (spec-v311) is the companion to the wave-135 acute
cholangitis grade: it grades acute cholecystitis on the Tokyo Guidelines TG18/TG13
scale — Grade III (severe) if any one of six new-onset organ dysfunctions, Grade II
(moderate) if any one (not two) of four cholecystitis-specific moderate criteria,
Grade I (mild) otherwise. All 10 fields are booleans (`kind: 'bool'`), each optional
(the compute defaults each to false, and only strict boolean `true` fires). The
example sets only `cc-duration`, whose `band`/`note` carry the "> 72 h" example
number, so it round-trips through the default `makeToArgs` (which maps '1' -> true)
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("acute cholecystitis severity") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1100 calculators across 216
modules**.

## One-hundred-thirty-fifth wave — the acute cholangitis severity grade (Tokyo Guidelines TG18) in lib/cholangitis-v310.js (+1)

`cholangitis-severity` (spec-v310) grades acute cholangitis on the Tokyo Guidelines
TG18/TG13 severity scale: Grade III (severe) if any one of six new-onset organ
dysfunctions, Grade II (moderate) if any two of five moderate criteria, Grade I
(mild) otherwise. All 11 fields are booleans (`kind: 'bool'`), each optional (the
compute defaults each to false, and only strict boolean `true` fires a criterion).
The example sets only `chol-hepatic`, whose `band`/`note` carry the "PT-INR > 1.5"
example number, so it round-trips through the default `makeToArgs` (which maps '1'
-> true) with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("acute cholangitis severity") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1099 calculators across 215
modules**.

## One-hundred-thirty-fourth wave — the acute GVHD grade (modified Glucksberg) in lib/gvhd-v309.js (+1)

`gvhd-grade` (spec-v309) grades acute graft-versus-host disease on the modified
Glucksberg overall grade: given the skin, liver, and GI organ stages (0-4 each) it
reports the overall grade (0-IV). The three `*Stage` fields are enums (0-4), all
optional (each defaults to 0). The compute's `band` carries the "liver stage 2 ->
grade III" example, so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("graft versus host disease grading") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1098 calculators across 214
modules**.

## One-hundred-thirty-third wave — the graduated return-to-learn (concussion) strategy in lib/concussion-rtl-v308.js (+1)

`concussion-rtl` (spec-v308) is the graduated return-to-learn ladder after a
sport-related concussion, the school companion to `concussion-rts`: given the RTL
step (1-4) it returns the mental activity, the activity at that step, and the goal.
The single `step` field is a required enum over the 4 steps; the compute's `band`
carries the "Step 3 of 4" example, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("return to learn concussion") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1097
calculators across 213 modules**.

## One-hundred-thirty-second wave — the diabetic macular edema (DME) severity in lib/dme-v307.js (+1)

`dme-severity` (spec-v307) grades diabetic macular edema on the International
Clinical scale (Wilkinson 2003, the companion to ICDR): given whether retinal
thickening / hard exudates are present in the posterior pole and their location
relative to the fovea, it reports the level (absent / mild / moderate / severe =
center-involving). `present` is a boolean and `location` is an enum; both are
optional (present false is "apparently absent"). The compute's `band` carries the
"Severe DME" example, so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("diabetic macular edema severity") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1096 calculators across 212
modules**.

## One-hundred-thirty-first wave — the ASTCT ICANS neurotoxicity grade in lib/icans-v306.js (+1)

`icans-grade` (spec-v306) grades ICANS neurotoxicity on the ASTCT consensus (Lee
2019) after immune-effector-cell / CAR-T therapy: given the ICE score, level of
consciousness, seizure, motor, and raised-ICP findings, it reports the grade (1-4)
as the most severe of the five domains. `ice` is a number, `loc` / `seizure` /
`icp` are enums, `motor` is a boolean; all are optional (nothing set is grade 0).
The compute's `band` carries the "grade 3 of 4" example, so it round-trips through
the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("car t neurotoxicity grade") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1095
calculators across 211 modules**.

## One-hundred-thirtieth wave — the ASTCT cytokine release syndrome grade in lib/crs-v305.js (+1)

`crs-grade` (spec-v305) grades cytokine release syndrome on the ASTCT consensus
(Lee 2019) after immune-effector-cell / CAR-T therapy: given the fever, hypotension
level, and hypoxia level it reports the grade (1-4) as the more severe of the two
axes. `fever` is a boolean; `hypotension` and `hypoxia` are enums; all are optional
(none set is grade 0). The compute's `band` carries the "grade 3 of 4" example, so
it round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("cytokine release syndrome
grade") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1094 calculators across 210 modules**.

## One-hundred-twenty-ninth wave — the 1-mg overnight dexamethasone suppression test in lib/dst-v304.js (+1)

`dexamethasone-suppression` (spec-v304) interprets the 1-mg overnight DST: given
the post-dexamethasone 8 am serum cortisol and its unit, it compares against the
suppression cutoff (1.8 µg/dL / 50 nmol/L) and reports normal suppression (below)
or a failure to suppress (at or above, consistent with possible Cushing syndrome or
autonomous cortisol secretion). `cortisol` is a required number; `unit` is an
optional enum (µg/dL default, or nmol/L); the compute's `band` carries the "3 µg/dL
/ 1.8" example, so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("cushing screening") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1093 calculators across 209 modules**.

## One-hundred-twenty-eighth wave — the Ring & Messmer anaphylaxis grade in lib/anaphylaxis-v303.js (+1)

`anaphylaxis-grade` (spec-v303) reports the Ring & Messmer (1977) severity grade of
an anaphylactic reaction: given the grade (I-IV) it returns the clinical features
(I cutaneous only; II moderate multi-organ; III life-threatening collapse/
bronchospasm; IV cardiac/respiratory arrest) and the life-threatening flag (grades
III-IV). The single `grade` field is a required enum over the 4 grades; the
compute's `band` carries the "grade III" example, so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("anaphylaxis severity grading") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1092
calculators across 208 modules**.

## One-hundred-twenty-seventh wave — the Instability Severity Index Score (ISIS) in lib/isis-v302.js (+1)

`isis-shoulder` (spec-v302) sums six preoperative factors for anterior shoulder
instability (age ≤20 = 2, competitive = 2, contact/overhead = 1, hyperlaxity = 1,
Hill-Sachs on AP = 2, glenoid loss of contour = 2; max 10) and flags a score >6 as
high recurrence risk after an arthroscopic Bankart repair. Each field is a boolean
factor (all optional; none checked is 0). The compute's `band` carries the "8 of 10
/ >6" example, so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("shoulder instability recurrence risk") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1091 calculators across 207
modules**.

## One-hundred-twenty-sixth wave — the diabetic retinopathy severity (ICDR scale) in lib/dr-severity-v301.js (+1)

`icdr-retinopathy` (spec-v301) grades diabetic retinopathy on the International
Clinical Diabetic Retinopathy (ICDR) scale: given the dilated-fundus findings it
reports the grade (1-5) as the highest-severity level whose criteria are met
(PDR > severe-NPDR 4-2-1 rule > moderate > mild > none). Each field is a boolean
finding; `dr-vb` (venous beading) is the required example field, the rest default
to false. The compute's `band` carries the "grade 4" example, so it round-trips
through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("diabetic retinopathy severity")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1090 calculators across 206 modules**.

## One-hundred-twenty-fifth wave — the AVF maturation "Rule of 6s" in lib/av-fistula-v300.js (+1)

`avf-rule-of-6s` (spec-v300) checks arteriovenous-fistula maturation against the
2006 KDOQI Rule of 6s: given the internal fistula blood flow, vein inner diameter,
and vein depth it reports which of the three thresholds are met (flow ≥ 600 mL/min,
diameter ≥ 6 mm, depth ≤ 6 mm) and whether all three are satisfied. `flow`,
`diameter`, and `depth` are the three required number fields; the compute's `band`
carries the "700 / 7 / 4 vs 600 / 6 / 6" example, so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("fistula maturation rule of 6s") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1089 calculators across 205 modules**.

## One-hundred-twenty-fourth wave — the cosyntropin (ACTH) stimulation test interpretation in lib/cosyntropin-v299.js (+1)

`cosyntropin-stim` (spec-v299) interprets the peak stimulated serum cortisol
(30 or 60 min after 250 µg cosyntropin): given the value and its unit it compares
against the standard-immunoassay threshold (18 µg/dL / 500 nmol/L) and reports a
normal adrenal response or a value below threshold suggestive of adrenal
insufficiency, with an LC-MS/MS caveat. `cortisol` is a required number; `unit` is
an optional enum (µg/dL default, or nmol/L); the compute's `band` carries the
"22 µg/dL / 18" example, so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("cosyntropin stimulation test") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1088 calculators across 204
modules**.

## One-hundred-twenty-third wave — the graduated return-to-sport (concussion) strategy in lib/concussion-rts-v298.js (+1)

`concussion-rts` (spec-v298) is the graduated return-to-sport ladder after a
sport-related concussion: given the RTS step (1-6) it reports the exercise
strategy, the activity at that step, the goal, and the consensus progression
gates (Steps 4-6 begin only after full symptom resolution; a written HCP
determination of readiness is required before unrestricted return to sport). The
single `step` field is a required enum over the 6 steps; the compute's `band`
carries the "Step 4" example, so it round-trips through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("concussion return to sport") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1087 calculators across
203 modules**.

## One-hundred-twenty-second wave — the Seddon-Sunderland nerve-injury classification in lib/nerve-injury-v297.js (+1)

`seddon-sunderland` (spec-v297) classifies a peripheral nerve injury: given the
Sunderland grade (I-V) it reports the disrupted structures, the Seddon equivalent,
the expected recovery, and whether surgical repair is typically required (grades
IV-V). The single `grade` field is a required enum over the 5 grades; the compute's
`band` carries the "Sunderland grade IV" example, so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("seddon sunderland") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1086 calculators
across 202 modules**.

## One-hundred-twenty-first wave — the benzodiazepine dose-equivalence converter in lib/benzo-equiv-v296.js (+1)

`benzodiazepine-equivalence` (spec-v296) converts a source benzodiazepine and dose
to its oral-diazepam equivalent and a target-drug dose under BOTH the VA/DoD 2021
and Ashton 2002 systems. Source, dose, and target all appear in the example, so all
three fields are required; the `band` carries the "2 mg lorazepam" example, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("benzodiazepine
equivalence") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1085 calculators across 201 modules**.

## One-hundred-twentieth wave — the Reisberg Global Deterioration Scale tile in lib/gds-v295.js (+1)

`global-deterioration-scale` (spec-v295) is the GDS, the global cognitive/functional
staging companion to FAST: given the most appropriate global stage (1-7) it
reports the published stage label and clinical characteristics and, at stage 5 and
beyond, flags that the patient can no longer survive without assistance. The single
`stage` field is a required enum over the 7 stages; the compute's `band` carries
the "GDS stage 5" example, so it round-trips through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("global deterioration scale") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1084 calculators across 200
modules**.

## One-hundred-nineteenth wave — the FAST dementia staging tile in lib/fast-dementia-v294.js (+1)

`fast-dementia` (spec-v294) is the Functional Assessment Staging Tool: given the
highest consecutive FAST stage reached (1-5, 6a-6e, 7a-7f) it reports the
published functional descriptor and, at stage 7a and beyond, the Medicare dementia
hospice-eligibility context. The single `stage` field is a required enum over the
16 stage codes; the compute's `band` carries the "FAST stage 7a" example, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("fast dementia staging")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1083 calculators across 199 modules**.

## One-hundred-eighteenth wave — the AUDIT-C and CAGE alcohol screens (+2)

`auditc` (three items 0-4, total 0-12; >= 4/3 risky) and `cage` (four yes/no
items 0-1, total 0-4; >= 2 significant) follow the same screener recipe over the
exported AUDITC_CONFIG / CAGE_CONFIG via `scoreScreener` / `bandFor`; maxScore
echoed (12 / 4); examples added and allowlisted for the e2e (renderScreener).
This completes the named screener batch (phq9 / gad7 / epds / auditc / cage).
Brings the exposed total to **1082 calculators across 198 modules**.

## One-hundred-seventeenth wave — the EPDS perinatal depression screen (+1)

`epds` (Edinburgh Postnatal Depression Scale) follows the same screener recipe
over the exported `EPDS_CONFIG` (ten items each 0-3, total 0-30; 0-9 low
likelihood, 10-12 possible, 13+ likely depression). maxScore (30) echoed; example
added (config exampleAnswers -> 7 = Low likelihood) and allowlisted for the e2e.
Completes the renderScreener screener batch (phq9 / gad7 / epds). Brings the
exposed total to **1080 calculators across 198 modules**.

## One-hundred-sixteenth wave — the GAD-7 anxiety screen (+1)

`gad7` follows the exact phq9 recipe over the exported `GAD7_CONFIG` (seven items
each 0-3, total 0-21, minimal/mild/moderate/severe bands) via
`scoreScreener` / `bandFor`; maxScore (21) echoed; example added (config
exampleAnswers -> 7 = Mild anxiety) and allowlisted for the e2e (renderScreener
radios). Brings the exposed total to **1079 calculators across 198 modules**.

## One-hundred-fifteenth wave — the PHQ-9 depression screen (+1)

`phq9` scores the nine PHQ-9 items (each 0-3) over the exported `PHQ9_CONFIG`
(items + severity bands) via the generic `scoreScreener` / `bandFor` compute
(lib/screener.js) — all pre-existing. The adapter echoes maxScore (27) so the "of
27" denominator is in the JSON and the round-trip does not lean on the "PHQ-9" 9.
It renders via the generic renderScreener (radio inputs), so its new example is
added to the e2e SCENARIO_ONLY allowlist (the numeric sweep can't select radios;
the mcp round-trip + scoring-v4 unit tests cover the math). A validated screening
tool, not a diagnosis. Brings the exposed total to **1078 calculators across 198
modules** — the first of the renderScreener-based screeners (gad7 / epds follow
the same recipe).

## One-hundred-fourteenth wave — the plain-language lab-value interpreter (+1)

`lab-interpret` classifies entered lab values (CBC, CMP, lipid panel, A1C, TSH)
against published reference ranges. Its `interpretLab` / `interpretLabs` compute
and the 25-analyte reference tables already existed (lib/lab-interpret.js) — the
"free-text parsing" that had deferred it was a misread; the inputs are plain
numeric analyte fields. The adapter mirrors the renderer dom keys
(`lab-<analyteId>`, `lab-sex`, `lab-pregnant`) and interprets whichever analytes
are supplied as a batch. No lib or view change. New adapter module registered in
`mcp/catalog.js`. Brings the exposed total to **1077 calculators across 198
modules**.

## One-hundred-thirteenth wave — bidirectional vasopressor dose/rate math (+1)

`vasopressor` converts between an infusion dose and pump rate. Its
`vasopressorRateMlHr` / `vasopressorDose` computes already existed
(medication-v4.js) and the drug->units map is the shipped vasopressor shard. It
was deferred for the per-kg/per-min unit ambiguity — resolved by reading each
drug's units from the shard (vasopressin's units/min treated as mcg/min for the
math, as the renderer does) and requiring a weight only for mcg/kg/min drugs.
**En route, corrected a genuine inconsistency in the tile's shipped META.example:
it labeled a 0.1 mcg/kg/min x 70 kg = 6.56 mL/hr scenario as "Norepinephrine",
but norepinephrine is dosed in mcg/min in the shard — the mcg/kg/min math is
dopamine's, so the drug is now `dopamine` and vp-drug is set explicitly.** The
tile is added to the e2e example-correctness allowlist (its "70 kg" is an
input-only fact the output never echoes, and the drug select is async-populated).
Brings the exposed total to **1076 calculators across 197 modules**.

## One-hundred-twelfth wave — single-medication opioid MME (+1)

`opioid-mme` computes CDC 2022 morphine-milligram-equivalents. Its `mmeTotal`
compute already existed (medication-v4.js), and the CDC conversion factors are the
shipped `mme-factors/mme.json` shard (read the same single-source way as the
steroid / benzo / renal-dosing tables in this adapter, never re-typed). The
browser tile sums a variable number of add/remove rows (an empty-`{}` example,
e2e-allowlisted); the adapter exposes a single-medication MME (drug enum from the
shard, mg/dose, doses/day) and the example now carries `morphine 30 mg x 6/day =
180 MME`. The compute echoes the CDC 50 / 90 MME/day breakpoints. Brings the
exposed total to **1075 calculators across 197 modules**.

## One-hundred-eleventh wave — ACS field triage, via a prefix-stripping toArgs (+1)

`field-triage` (ACS 2021 National Field Triage) was deferred as "data-shard
variable keys" — the browser renders its criteria checkboxes from a data file. But
the decision logic in `field.js fieldTriage` keys off a FIXED criterion set (the
four step arrays), so it exposes cleanly: a bespoke toArgs strips the `ft-`
renderer prefix off each checked criterion into the flat `answers` object the
compute reads, and the twenty booleans are none-required (check whichever apply).
Its existing META.example (`ft-gcs-le-13` → Step 1) round-trips. No lib or view
change. Brings the exposed total to **1074 calculators across 197 modules**.

## One-hundred-tenth wave — the Aldrete + PADSS recovery scores (+1, composite)

`aldrete-padss` shows two side-by-side post-anesthesia recovery scores (modified
Aldrete and PADSS) that share one input panel, each already a pure lib fn
(`scoring-v4.js aldrete` / `padss`). It was deferred because its META.example was
`{}` (relying on the browser rangeField default of 2 per item), which gives an
MCP call no inputs to compute from. The example now carries the ten explicit
component values, and a composite adapter returns both scores (each lib fn
destructures only its own five items). No lib or view change. Brings the exposed
total to **1073 calculators across 197 modules**.

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
- `phases`

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
- `pospom`

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
- `ses-cd`

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
- `rosendaal-ttr`

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
- `doloplus-2`

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

### lib/ltcga-v181.js
- `mcgeer-criteria`
- `loeb-minimum-criteria`

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
- `hear`
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
- `wagner-dfu`
- `university-texas-dfu`

### lib/peds-v98.js
- `kocher-criteria`
- `pim3`
- `kawasaki-criteria`
- `catch-head`

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
- `pasi`
- `easi`
- `dlqi`

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

### lib/myeloid-prognosis-v199.js
- `mipss70`
- `gipss`
- `mysec-pm`
- `hct-ci`

### lib/critcare-severity-v200.js
- `oasis`
- `lods`
- `delta-gap`
- `apps-ards`

### lib/hepatology-gibleed-v201.js
- `glasgow-blatchford`
- `clif-c-ad`
- `hepamet-fibrosis`
- `clip-hcc`
- `agile-3plus`

### lib/cvrisk-engines-v202.js
- `mecki`

### lib/periop-frailty-v203.js
- `dasi`
- `abcd3-i`
- `sort-mortality`

### lib/nephro-fluids-v204.js
- `cccr`
- `max-allowable-blood-loss`
- `efw-clearance`
- `tmp-gfr`
- `urine-calcium-cr`

### lib/pulm-copd-v205.js
- `cat-copd`
- `lent-score`
- `ado-index`
- `dose-index`
- `sacs-osa`

### lib/tbi-stroke-v206.js
- `essen-stroke-risk`
- `rotterdam-ct`
- `marshall-ct`
- `func-score`

### lib/resus-trauma-v207.js
- `tor-rule`
- `rems`
- `cart-score`

### lib/nutrition-maternal-v208.js
- `ponderal-index`
- `sflt1-plgf`
- `glim-malnutrition`
- `sga-nutrition`

### lib/cardiology-risk-v209.js
- `hcm-risk-scd`
- `charge-af`

### lib/stroke-prognosis-v210.js
- `span-100`

### lib/heme-onc-risk-v211.js
- `eutos`
- `improvedd`
- `compass-cat`
- `eln-2022-aml`

### lib/hep-fibrosis-portal-v212.js
- `king-score`
- `baveno-vii`

### lib/acute-injury-v213.js
- `heart-pathway`
- `ottawa-heart-failure`
- `light-criteria`
- `baux-score`
- `revised-baux`

### lib/cardiology-risk-v214.js
- `apple-score`
- `caap-af-score`
- `atlas-score`
- `hatch-score`
- `mb-later-score`
- `canada-acs-risk-score`
- `action-icu-score`

### lib/risk-scores-v215.js
- `dlcn-fh-score`
- `simon-broome-fh`
- `padit-score`
- `grim-score`
- `lipi`
- `onkotev-score`
- `protecht-score`

### lib/heme-prognostic-v216.js
- `wpss-mds`
- `mdacc-cll-index`
- `pit-ptcl`
- `prima-pi`
- `durie-salmon`
- `lymphocyte-doubling-time`
- `talcott-febrile-neutropenia`

### lib/stroke-risk-v217.js
- `canadian-tia-score`
- `astral-score`
- `soar-score`
- `plan-score`
- `sits-sich`
- `vasograde`
- `ogilvy-carter`

### lib/ed-decision-v218.js
- `faint-score`
- `nexus-head-ct`
- `handoc-score`
- `denova-score`
- `icm-pji-2018`
- `air-score`
- `adult-appendicitis-score`

### lib/metabolic-hepatic-v219.js
- `ada-diabetes-risk-test`
- `cambridge-diabetes-risk`
- `lipid-accumulation-product`
- `visceral-adiposity-index`
- `conicity-index`
- `ast-alt-ratio`
- `ggt-platelet-ratio`

### lib/hepatology-prognosis-v220.js
- `fips-score`
- `albi-plt`
- `damico-cirrhosis-stage`
- `amap-score`
- `nacseld-aclf`
- `fibroq`

### lib/pulmonary-risk-v221.js
- `simplified-revised-geneva`
- `scap-score`
- `corb-score`
- `resp-score`
- `ild-gap`
- `du-bois-ipf`
- `pneumothorax-volume`

### lib/rheum-classification-v222.js
- `iim-eular-acr-2017`
- `pmr-eular-acr-2012`
- `bohan-peter`
- `acr-eular-2013-systemic-sclerosis`
- `mrss-modified-rodnan-skin-score`
- `acr-eular-2016-sjogren`
- `esspri`

### lib/dermatology-v223.js
- `uas7`
- `hiscr`
- `hurley-stage`
- `poem`
- `alden`
- `pest`
- `glasgow-7-point-checklist`

### lib/neurology-v224.js
- `id-migraine`
- `onls`
- `end-it-score`
- `engel-classification`
- `ilae-surgical-outcome`
- `salzburg-ncse-criteria`
- `dhi`

### lib/obgyn-v225.js
- `nugent-score`
- `amsel-criteria`
- `ferriman-gallwey`
- `pbac-hmb`
- `thompson-hie`
- `menopause-rating-scale`
- `kupperman-index`

### lib/nephrology-v226.js
- `watson-tbw`
- `salazar-corcoran`
- `epvs`
- `furosemide-stress-test`
- `fe-bicarbonate`
- `corrected-potassium-ph`

### lib/mixed-v227.js
- `icbd-2014-behcet`
- `isg-1990-behcet`
- `batt`
- `denver-ed-tof`
- `ets`
- `who-dengue-2009`

### lib/mixed-v228.js
- `england-fraser-index`
- `sirdah-index`
- `rdw-index`
- `srivastava-index`
- `ehsani-index`

### lib/hematology-v229.js
- `aec`
- `nlr`
- `plr`
- `sii`

### lib/inflam-v230.js
- `lmr`
- `siri`
- `piv`
- `crp-albumin-ratio`

### lib/prognostic-v231.js
- `naples-prognostic-score`
- `nmr`
- `far`

### lib/coagscore-v232.js
- `villalta`
- `sic`

### lib/estimators-v233.js
- `evans-index`
- `fohr`
- `age-adjusted-d-dimer`
- `deurenberg-body-fat`

### lib/dermscore-v234.js
- `masi`
- `salt-score`
- `napsi`
- `vancouver-scar-scale`

### lib/painscore-v235.js
- `dn4-neuropathic-pain`
- `lanss-pain-scale`
- `roland-morris-disability`
- `neck-disability-index`

### lib/ophtho-v236.js
- `spherical-equivalent`
- `vertex-distance`
- `percent-tissue-altered`
- `randleman-erss`

### lib/cardioecho-v237.js
- `romhilt-estes`
- `wilkins-score`
- `mitral-valve-area-pht`
- `aortic-dvi`
- `rate-pressure-product`

### lib/anthro-v238.js
- `relative-fat-mass`
- `body-roundness-index`
- `navy-body-fat`
- `egdr`

### lib/gisurg-v239.js
- `bonacini-cds`
- `guci`
- `mannheim-peritonitis-index`
- `boey-score`

### lib/rehab-v240.js
- `esas-symptom-assessment`
- `rivermead-mobility-index`
- `six-minute-walk-predicted`
- `quickdash`

### lib/geri-v241.js
- `groningen-frailty-indicator`
- `short-physical-performance-battery`
- `osteoporosis-self-assessment-tool`
- `five-times-sit-to-stand`

### lib/environ-v242.js
- `heat-index`
- `humidex`
- `wind-chill`
- `wbgt`

### lib/entsleep-v243.js
- `nose-scale`
- `rfs-reflux-finding`
- `no-apnea-score`
- `sleep-efficiency`

### lib/sportsmsk-v244.js
- `lysholm-knee-score`
- `marx-activity-rating`
- `foot-posture-index`
- `bess-balance-error`

### lib/hemederm-v245.js
- `shine-lal-index`
- `green-king-index`
- `percent-platelet-recovery`
- `ihs4`

### lib/ibd-v246.js
- `sccai`
- `pucai`
- `bbps-boston`
- `simplified-aih`

### lib/pedstox-v247.js
- `pediatric-trauma-score`
- `bind-score`
- `widmark-bac`
- `povoc-ponv`

### lib/woundid-v248.js
- `absi-burn`
- `sinbad-score`
- `atlas-cdi`
- `increment-cpe`

### lib/renalpulm-v249.js
- `renal-failure-index`
- `feua`
- `bronchodilator-response`
- `integrative-weaning-index`

### lib/obgyn-v250.js
- `pearl-index`
- `robinson-crl-dating`
- `carpreg-ii`
- `malinas-score`

### lib/cardiometab-v251.js
- `corrected-timi-frame-count`
- `tpe-qt-ratio`
- `spise`
- `atherogenic-index-of-plasma`

### lib/orthospine-v252.js
- `insall-salvati-ratio`
- `torg-pavlov-ratio`
- `meyerding-spondylolisthesis`
- `beighton-hypermobility`

### lib/radmeasure-v253.js
- `nascet-carotid-stenosis`
- `helsinki-ct-score`
- `genant-vertebral-fracture`
- `testicular-volume`

### lib/enturopsych-v254.js
- `reflux-symptom-index`
- `lund-mackay`
- `bladder-outlet-obstruction-index`
- `fagerstrom-ftnd`

### lib/riskscores-v255.js
- `vcss`
- `pen-fast`
- `harris-hip-score`
- `koivuranta-ponv`

### lib/rheumcrit-v256.js
- `mases-enthesitis`
- `mmt8-myositis`
- `intubation-difficulty-scale`
- `crop-index`

### lib/dive-v257.js
- `maximum-operating-depth`
- `equivalent-air-depth`
- `oxygen-toxicity-units`

### lib/clinical.js
- `unit-converter`
- `bmi`
- `bsa`
- `map`
- `anion-gap`
- `corrected-calcium`
- `corrected-sodium`
- `aa-gradient`
- `egfr`
- `cockcroft-gault`
- `pack-years`
- `qtc`
- `pf-ratio`
- `corrected-ca-na`
- `aa-pf-suite`
- `egfr-suite`
- `drip-rate`
- `weight-dose`
- `conc-rate`
- `gcs`
- `apgar`
- `abg`
- `wells-pe`
- `wells-dvt`
- `chads`
- `hasbled`
- `nihss`
- `due-date`

### lib/clinical-v4.js
- `anion-gap-dd`
- `osmolal-gap`
- `winters`
- `shock-index`
- `bw-bsa-suite`
- `fena-feurea`
- `maint-fluids`
- `qtc-suite`
- `fib4`
- `apri`
- `rox`
- `vis`

### lib/clinical-v5.js
- `sodium-correction`
- `free-water-deficit`
- `pbw-ardsnet`
- `rsbi`
- `corrected-anion-gap`
- `iron-ganzoni`
- `lights`
- `mentzer`
- `saag`
- `r-factor`
- `kdigo-aki`
- `sgarbossa`
- `avpu-gcs`
- `rcri`
- `pews`
- `abcd2`

### lib/clinical-v6.js
- `anc`
- `retic-index`
- `tsat`
- `cci-platelet`
- `ldl-calc`
- `eag-a1c`
- `cao2-do2`
- `oxygenation-index`
- `driving-pressure`
- `ttkg`
- `urine-anion-gap`
- `acid-base-deficit`
- `schwartz-egfr`

### lib/clinical-v7.js
- `urine-output`
- `ebv-mabl`
- `corrected-phenytoin`
- `burn-uop-target`
- `fluid-balance`
- `gir`
- `potassium-deficit`
- `magnesium-replacement`
- `calcium-replacement`
- `iv-osmolarity`
- `carb-insulin-bolus`
- `rhig-dose`
- `peds-transfusion-volume`

### lib/clinical-v8.js
- `cerebral-perfusion-pressure`
- `peds-dose`
- `anticoag-reversal`
- `infusion-time-remaining`
- `enteral-free-water`
- `apap-24h-max`
- `icu-nutrition-target`
- `vte-prophylaxis-dose`
- `norepi-equiv`
- `o2-cylinder-duration`
- `neonatal-feeding-volume`
- `oxytocin-titration`
- `minute-ventilation`

### lib/scoring-v4.js
- `mgap`
- `gap`
- `big`
- `insulin-correction`
- `electrolyte-replacement`
- `crrt-dose`
- `ecmo-titration`
- `pecarn-head`
- `pecarn-iai`
- `pecarn-cspine`
- `timi`
- `grace`
- `heart`
- `perc`
- `wells-pe-geneva`
- `curb-65`
- `psi`
- `qsofa-sofa`
- `meld-childpugh`
- `ranson-bisap`
- `centor`
- `wells-dvt-caprini`
- `bishop`
- `alvarado-pas`
- `news2`
- `mews`
- `sirs`
- `killip`
- `mods`
- `rass`
- `sas-riker`
- `cam-icu`
- `icdsc`
- `4at`
- `cpot`
- `bps`
- `mini-cog`
- `ciwa`
- `cows`
- `epworth`
- `stop-bang`
- `berlin-osa`
- `apfel`
- `aldrete`
- `lemon`
- `white-song`
- `gbs`
- `rockall`
- `aims65`
- `oakland`
- `maddrey-lille`
- `cthr`
- `ccsr`
- `hospital-score`
- `lace`
- `charlson`
- `cfs`
- `ecog-karnofsky`
- `pesi`
- `spesi`
- `padua`
- `atria-bleeding`
- `orbit-bleeding`
- `hemorr2hages`
- `improve-bleeding`
- `improve-vte`
- `khorana`
- `dash-vte`
- `herdoo2`
- `four-ts`
- `isth-dic`
- `dapt-score`
- `bpp`
- `acog-severe-pre`
- `hellp`
- `carpenter-coustan`
- `iadpsg`
- `meows`
- `rochester`
- `philadelphia`
- `boston-febrile`
- `step-by-step`
- `yos`
- `westley`
- `pram-asthma`
- `pass-asthma`
- `peds-gcs`
- `nigrovic`
- `braden`
- `morse-falls`
- `hendrich-ii`
- `cam`
- `ich-score`
- `hunt-hess-wfns`
- `mnihss`
- `four-score`
- `flacc`
- `painad`
- `nips`
- `npass`
- `cries`
- `poss`
- `comfort-b`
- `wat-1`
- `sbs`
- `sos`
- `cpss`
- `lams`
- `race`
- `rosier`
- `guss`
- `barthel`
- `lawton-iadl`
- `katz-adl`
- `cssrs`
- `hacor`
- `berlin-ards`
- `lis-murray`
- `smart-cop`
- `crb65`
- `ats-idsa-cap`
- `nutric`
- `mnutric`
- `nrs2002`
- `must-nutrition`
- `ottawa-ankle`
- `ottawa-sah`
- `drip`
- `abc-mtp`
- `npiap-staging`
- `norton-push`
- `vip-extravasation`
- `blood-compat`
- `hypothermia-rewarm`
- `heatstroke-decision`
- `lips`
- `mtp-tracker`
- `bristol-girth`
- `ascvd`
- `prevent`
- `restraint-timer`
- `vent-sbt-peep`

### lib/scoring-v6.js
- `ballard`
- `finnegan`
- `silverman-andersen`
- `downes`
- `bhutani-bilirubin`
- `qbl-pph`
- `neo-phototherapy`
- `pelod2`
- `psofa`
- `burch-wartofsky`
- `ariscat`
- `apache2`
- `braden-q`

### lib/medication-v4.js
- `steroid-equiv`
- `benzo-equiv`
- `abx-renal`
- `tpn-macro`
- `beers-check`
- `opioid-mme`
- `vasopressor`

### lib/medication-v5.js
- `heparin-nomogram`
- `vanc-auc`
- `aminoglycoside`
- `acetaminophen-nomogram`
- `digoxin`
- `local-anesthetic-max`
- `mgso4-preeclampsia`
- `pca-pump`
- `sugammadex`
- `ketamine-propofol`
- `peds-fluid-deficit`
- `peds-resus`
- `conc-percent`

### lib/field.js
- `cincinnati`
- `fast`
- `start-triage`
- `jumpstart-triage`
- `burn-fluid`
- `peds-ett`
- `naloxone`
- `peds-weight-dose`
- `bsa_burn`
- `nexus-cspine`
- `field-triage`

### lib/idcrit-v99.js
- `duke-endocarditis`
- `pitt-bacteremia`
- `saps-ii`
- `refeeding-risk`
- `lund-browder`
- `aldrete-padss`
- `phq9`
- `gad7`
- `epds`
- `auditc`
- `cage`

### lib/scoring-v5.js
- `phq2-gad2`
- `audit-full`
- `dast10`
- `gds15`
- `ottawa-knee`
- `nexus-chest`
- `sfsr`
- `canadian-syncope`
- `edacs`
- `years-pe`
- `feverpain`
- `stone-score`
- `iss-rts`
- `sipa`
- `measured-crcl`
- `rpr`
- `nri`
- `agr`
- `tyg-bmi`
- `whtr`
- `castelli-index`
- `cmi`
- `mets-ir`
- `halp-score`
- `ali-index`
- `phoenix-sepsis`
- `leibovich-rcc`
- `uiss-rcc`
- `haq-di`
- `asas-axspa`
- `galad-hcc`
- `toronto-hcc-risk`
- `canadian-ct-head`
- `sf-syncope`
- `mcisaac`
- `a-drop`
- `drip-score`
- `shorr`
- `ripasa`
- `pulp`
- `emergency-surgery-score`
- `lab-score`
- `chalice`
- `egami`
- `mulbsta`
- `ottawa-copd`
- `sepsis-obstetrics-score`
- `abc-transfusion-score`
- `ssign-score`

### lib/transfusion-v292.js
- `transfusion-threshold`

### lib/fast-dementia-v294.js
- `fast-dementia`

### lib/gds-v295.js
- `global-deterioration-scale`

### lib/benzo-equiv-v296.js
- `benzodiazepine-equivalence`

### lib/nerve-injury-v297.js
- `seddon-sunderland`

### lib/concussion-rts-v298.js
- `concussion-rts`

### lib/cosyntropin-v299.js
- `cosyntropin-stim`

### lib/av-fistula-v300.js
- `avf-rule-of-6s`

### lib/dr-severity-v301.js
- `icdr-retinopathy`

### lib/isis-v302.js
- `isis-shoulder`

### lib/anaphylaxis-v303.js
- `anaphylaxis-grade`

### lib/dst-v304.js
- `dexamethasone-suppression`

### lib/crs-v305.js
- `crs-grade`

### lib/icans-v306.js
- `icans-grade`

### lib/dme-v307.js
- `dme-severity`

### lib/concussion-rtl-v308.js
- `concussion-rtl`

### lib/gvhd-v309.js
- `gvhd-grade`

### lib/cholangitis-v310.js
- `cholangitis-severity`

### lib/cholecystitis-v311.js
- `cholecystitis-severity`

### lib/cholangitis-dx-v312.js
- `cholangitis-diagnosis`

### lib/cholecystitis-dx-v313.js
- `cholecystitis-diagnosis`

### lib/deauville-v314.js
- `deauville-score`

### lib/jones-v315.js
- `jones-criteria`

### lib/gold-abe-v316.js
- `gold-abe`

### lib/cdi-severity-v317.js
- `cdi-severity`

### lib/la-esophagitis-v318.js
- `la-esophagitis`

### lib/ccs-angina-v319.js
- `ccs-angina`

### lib/clavien-dindo-v320.js
- `clavien-dindo`

### lib/hinchey-v321.js
- `hinchey`

### lib/tb-testing.js
- `tb-testing`

### lib/lab-interpret.js
- `lab-interpret`

## Not yet adapted

Every other catalog calculator is **not-yet-adapted**. Reason: incremental
rollout — subsequent waves extend coverage module by module against the same
contract. The Group A/B billing and coding tiles (`clinical: false`) are
out of scope for the first wave (spec-v183 §7) and are eligible only in a later
wave. No proprietary/licensed instrument is ever exposed (it is not in the
catalog to begin with; spec-v100 §8 exclusions are inherited).
