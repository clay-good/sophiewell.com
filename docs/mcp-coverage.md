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

## Three-hundred-fiftieth wave — the Gray-Weale carotid plaque type in lib/gray-weale-v524.js (+1)

`gray-weale` (spec-v524) maps a B-mode ultrasound appearance to one of the four Gray-Weale echogenicity
types and returns the echolucent/echogenic grouping with it. The enum values are `'1'`-`'4'`; the lib also
accepts roman numerals, but the adapter publishes only the arabic forms so an agent emits one canonical
shape. The field label carries each type's **appearance** rather than the bare numeral, because an agent
choosing a type is describing an image and needs the descriptors, not the ordinal.

The summary leads with the fact that decides whether a caller uses this correctly: **it is a different axis
from the degree of stenosis.** An agent that already has a NASCET percentage must not read this as a second
severity number, and an agent that has this must not report it as a stenosis. The summary also states, twice
over, that plaque type is **not an indication for carotid endarterectomy or stenting** — the trials that
established when to intervene selected on stenosis and symptom status, not echogenicity — because "type 1
echolucent plaque" is exactly the phrase an agent would otherwise turn into a surgical recommendation. The
echolucent-symptomatic association is given at group level with **no stroke rate attached to any type**. New
adapter module registered in `mcp/catalog.js`; its golden probe ("carotid plaque echogenicity type
ultrasound") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1312 calculators across 428 modules**.

### lib/gray-weale-v524.js
- `gray-weale`

## Three-hundred-fifty-first wave — the neonatal SOFA in lib/nsofa-v526.js (+1)

`nsofa` (spec-v526) scores the three nSOFA domains into a total of 0-15 and returns each subscore plus the
computed SpO2/FiO2 ratio.

**`nso-spo2` and `nso-fio2` are deliberately NOT required, and that is the design point of this wave.** The
published respiratory domain scores the ratio **only when the infant is intubated**; a non-intubated infant
scores 0 there regardless of oxygen requirement. Marking the two required would force a caller scoring a
non-intubated infant to supply values the instrument will not look at — worse than useless, because it would
suggest they contribute. The lib requires them exactly when intubation is reported and names what is missing
otherwise.

The FiO2 field is labeled as a **fraction** with a worked example ("0.40 for 40 percent"), because an agent
that sends `40` would compute a ratio a hundred times too small and land the infant in the 8-point row; the
unit is declared so it appears in the published schema description. The summary states the respiratory blind
spot in the instrument's own terms rather than papering over it, and states the validated population
(late-onset sepsis in preterm very-low-birth-weight infants), because "nSOFA 2" is exactly the kind of number
an agent would otherwise carry into a term infant or an early-onset-sepsis case as though it travelled. New
adapter module registered in `mcp/catalog.js`; its golden probe ("neonatal sofa organ dysfunction preterm")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1313 calculators
across 429 modules**.

### lib/nsofa-v526.js
- `nsofa`

## Three-hundred-fifty-second wave — the Wayne index in lib/wayne-index-v527.js (+1)

`wayne-index` (spec-v527) scores the eighteen Wayne items into a signed total and reads it against the
toxic / equivocal / euthyroid bands.

**Every field label carries its options' signed point values, including the negative ones, and that is the
whole design point of this wave.** An agent handed "Palpable thyroid: yes/no" has no way to know that
answering *no* **subtracts three points** rather than adding nothing, and an agent assuming the usual
"absent contributes nothing" convention would systematically inflate every total toward a false positive.
Publishing the signed weights in the schema makes the instrument's actual shape legible to the caller.

**Three items are published as three-way enums, not booleans** — temperature preference, appetite, and
weight — because their alternatives carry opposite signs and cannot both be true, so a pair of booleans would
let an agent assert an impossible combination. The casual pulse is likewise **one** three-band enum, not two
rows, even though the source prints it as two. All eighteen are required: a partial Wayne index has no total,
and because absent findings carry negative weight, an omitted item is **not** equivalent to a negative
answer. The summary states up front that this is a 1959 instrument from before sensitive TSH assays and is
not a substitute for thyroid function tests, because "Wayne index 24, toxic range" is exactly the phrase an
agent would otherwise report as a diagnosis. New adapter module registered in `mcp/catalog.js`; its golden
probe ("wayne index clinical thyrotoxicosis") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1314 calculators across 430 modules**.

### lib/wayne-index-v527.js
- `wayne-index`

## Four-hundred-and-forty-third wave — the EREFS endoscopic reference score in lib/erefs-v618.js (+1)

`erefs` (spec-v618) grades the five endoscopic features of eosinophilic esophagitis. A **whole-concept gap**:
"eosinophilic esophagitis" was zero-hit across `app.js`.

**The proximal and distal esophagus are scored separately: 0 to 9 each, 0 to 18 overall.** Reporting a single
0-to-9 figure as "the EREFS" halves the scale, so the adapter returns both regional scores *and* the total,
and a test asserts one region's score is never presented as the whole.

**The five features have different maxima and are not equally weighted** — edema 1, rings 3, exudates 2,
furrows 2, stricture 1. **Stricture, the most consequential finding, is present-or-absent only**: a test shows
it moves the score by exactly the same single point as edema, while rings can move it by three.

**"The EREFS score" is ambiguous — at least three composites are published from the same five features.** A
full composite (0–18); an *inflammatory* subscore that adds only edema, exudates and furrows and **excludes
rings and stricture**; and a *modified* score that reduces every feature to present-or-absent. All three are
returned, named, and the summary tells a caller never to report a bare number without saying which it is.
Tests pin the distinctions directly — severe rings contribute 6 to the full composite, 0 to the inflammatory
subscore, and 2 to the modified score.

**Two things the tile deliberately does not assert.** The published descriptors for mild, moderate and severe
*rings* differ between renderings and were not double-confirmed, so the four grade labels are carried without
a descriptor for each. And the exudate boundary at exactly 10% is rendered both ways, so the tile states which
it uses and discloses the divergence **at that grade only** — the two renderings agree at every other value.
The furrows range was a genuine 1-versus-1 split (absent/present against absent/mild/severe) that a third
source resolved 2-to-1 in favour of three grades. **No severity band is returned** — none is validated, and
the instrument is used as a trial endpoint by *change* from a patient's own baseline.

**A bug the tests caught before release:** grade 0 is a real grade here, and `Number('')` is 0, so an
unanswered item was being silently graded as absent. The lookup now rejects empty values before coercion, and
a test pins it. New adapter module registered in `mcp/catalog.js`; its golden probe ("erefs endoscopic
reference score eosinophilic esophagitis") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1405 calculators across 521 modules**.

### lib/erefs-v618.js
- `erefs`

## Four-hundred-and-forty-second wave — the WHO oral mucositis scale in lib/who-mucositis-v617.js (+1)

`who-mucositis` (spec-v617) grades oral mucositis 0 to 4. A **whole-concept gap**: "mucositis" and
"stomatitis" were both zero-hit across `app.js`.

**The scale conflates two different axes in one ordinal grade.** Grades 0 to 2 are driven by what the mucosa
*looks like* — soreness and erythema, then ulcers. Grades 2 to 4 are driven by what the patient *can eat* —
solids, then liquids only, then nothing. Grade 2 is the hinge where the axis silently changes, which is why
the tile asks the two questions separately rather than offering one list of five grades.

**Above grade 2 the appearance stops mattering entirely.** A test walks all three appearances at each
restricted intake and asserts they collapse to a *single* grade — the appearance genuinely makes no
difference. Because the grade number hides that, the adapter returns `appearanceIgnored`, and the result text
says the appearance did not affect the grade.

**Extensive ulceration does not raise the grade past 2 if solids are tolerated**, because the *extent* of
ulceration is never scored — only its presence. So a mouth that looks far worse than another can carry the
same grade, and one that looks better can carry a higher one. The summary states plainly that this is not an
anatomic severity measure.

**The definitions say what the patient can tolerate, not why.** Nothing in the grade wording requires the
eating limitation to be attributable to the mucositis, so `intakeUnexplainedByMucosa` is returned when intake
is restricted while the mucosa is recorded as normal. The tile still returns the grade the scale specifies —
the scale is the source — but it does not let that combination pass silently. And **the scale was built for
reporting, not bedside management**: it comes from the 1979 WHO handbook and exists for comparability across
trials. New adapter module registered in `mcp/catalog.js`; its golden probe ("who oral mucositis grade") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1404 calculators
across 520 modules**.

### lib/who-mucositis-v617.js
- `who-mucositis`

## Four-hundred-and-forty-first wave — the Frisen papilledema scale in lib/frisen-v616.js (+1)

`frisen` (spec-v616) grades swelling of the optic nerve head 0 to 5 on fundus appearance. A **whole-concept
gap**: "papilledema", "optic disc" and "intracranial hypertension" were all zero-hit across `app.js`.

**The grade is derived from findings rather than picked from a list, and the cumulative rule is enforced
rather than assumed.** The published wording is literally "features of grade 2 plus...", so a disc cannot be
grade 3 while its halo still shows a temporal gap. Contradictory findings return `grade: null` with
`consistent: false` and a list of `contradictions` — three separate contradiction paths, each with its own
test — and the summary tells a caller **not** to resolve a contradiction by picking the higher grade.

**The temporal gap is the entire difference between grade 1 and grade 2.** A test proves it: the two grades
are produced with identical vessel findings, and only the halo description differs. The tile also gives the
anatomical reason — the temporal border is spared because its axons are of fine caliber — so the gap reads as
a real finding rather than a photographic artefact.

**Grade 3 and grade 4 differ by where the obscured vessel is, not by how much is obscured**: total
obscuration of a portion of a major vessel *as it leaves* the disc against the same finding *on* the disc.
And **grade 4 is defined by an exception — at least one major vessel on the disc must be spared.** If none is
spared it is grade 5. A negative condition inside a severity definition is easy to read past, and it is the
only thing separating the top two grades.

**Partial and total obscuration are not the same thing.** Grade 2 explicitly *permits* partial obscuration of
major vessels; grades 3 and above require *total* obscuration of a portion, and every field label says so.
**The grade does not measure intracranial pressure** — it describes an appearance, a low grade does not
exclude raised pressure, and a test asserts that caveat appears in the result at both ends of the scale. New
adapter module registered in `mcp/catalog.js`; its golden probe ("frisen scale papilledema grading") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1403 calculators
across 519 modules**.

### lib/frisen-v616.js
- `frisen`

## Four-hundred-and-fortieth wave — the AREDS simplified severity scale in lib/areds-v615.js (+1)

`areds` (spec-v615) counts risk factors across both eyes and reads off an approximate five-year risk of
advanced age-related macular degeneration. A **whole-concept gap**: `icdr-retinopathy`, `kwb-retinopathy`,
`rop-stage` and `gass-macular-hole` all ship, and macular degeneration was entirely uncovered — "macular
degeneration" and "drusen" were both zero-hit across `app.js`.

**The scale scores a person, not an eye, but the features are read eye by eye.** Each eye contributes one
factor for large drusen and one for any pigment abnormality, so the total runs 0 to 4. Scoring a single eye
and reporting 0 to 2 is a different instrument, and the summary says so.

**An eye that already has advanced disease is assigned 2 factors outright, and its own drusen and pigment
stop counting** — it has already converted. A test proves the point directly: adding large drusen *and*
pigment to an already-advanced eye changes nothing. The remaining factors come from the fellow, still-at-risk
eye, so the question the scale answers becomes "will the *other* eye convert".

**Intermediate drusen count only when neither eye has large drusen, and only when bilateral** — one factor
for the *person*, never one per eye. The adapter returns `intermediateSuppressed` with a reason when the
answer was yes but the factor did not apply, and a test walks both suppression paths.

**Two states needed explicit handling rather than a silent number.** If *both* eyes are already advanced
there is no at-risk eye, so `fiveYearRiskPercent` comes back `null` — the scale has nothing left to predict.
And in that same state the published rules, applied literally, would total **5**, outside the published 0–4
scale; since the intermediate-drusen rule is about drusen *grading* and an already-converted eye is not
graded, the factor is not added there. That decision is disclosed in the result text rather than clamped
silently, and a test pins both the total of 4 and the stated reason.

**The five-year risk is nowhere near linear** — 0.5%, 3%, 12%, 25%, 50%. The first step multiplies risk about
sixfold and the last two roughly double it, so a reader treating the 0-to-4 count as evenly spaced severity
badly misreads the bottom of the scale; a test asserts the increments are not uniform. New adapter module
registered in `mcp/catalog.js`; its golden probe ("areds simplified severity scale macular degeneration") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1402 calculators
across 518 modules**.

### lib/areds-v615.js
- `areds`

## Four-hundred-and-thirty-ninth wave — the Ocular Trauma Score in lib/ocular-trauma-score-v614.js (+1)

`ocular-trauma-score` (spec-v614) estimates the distribution of visual outcome six months after serious eye
injury. A **whole-concept gap** in an otherwise well-covered eye cluster — `shaffer-angle`, `van-herick` and
the ocular-burn tiles all ship, and there was no prognostic score for eye injury at all.

**The initial visual acuity is the only term that adds; everything else subtracts.** The acuity sets a base
of 60 to 100 and the five findings deduct 23, 17, 14, 11 and 10 — 75 points available against a base that
never exceeds 100. The presenting vision is not one variable among six; it is the whole of the positive side
of the ledger, and a test asserts every acuity term is positive and every finding negative.

**The raw score can fall below the published table, and the adapter reports that instead of patching it.**
Both sources print the lowest band as "0 to 44". But no light perception with globe rupture,
endophthalmitis, retinal detachment and an afferent pupillary defect is **−1**, and all five findings
together give **−15**. Those are reachable, so `ots` comes back `null` with `belowPublishedRange` set —
never clamped to category 1 — the same handling given to the al Naqeeb unclassified region. A test pins
both negative totals, and pins that a raw score of exactly 0 *is* category 1 while −1 is not.

**The output is a probability distribution, not a predicted acuity.** Each category carries five
probabilities for where vision lands at six months, and a test asserts every row sums to exactly 100. The
distributions are wide — category 3 is 44% at 20/40 or better and still 13% at hand movements or worse — so
quoting the category alone throws the result away, and the summary says so.

**Neither extreme is certain**: category 1, the worst, still carries 1% at 20/40 or better, and category 5,
the best, still carries 1% at light perception or hand movements. And **the bands narrow as the prognosis
improves** — 45, 21, 15, 11 and 9 raw points wide — so a single point matters far more near the top of the
scale than near the bottom; a test asserts each band is strictly narrower than the one below it. New adapter
module registered in `mcp/catalog.js`; its golden probe ("ocular trauma score visual prognosis eye injury")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1401 calculators
across 517 modules**.

### lib/ocular-trauma-score-v614.js
- `ocular-trauma-score`

## Four-hundred-and-thirty-eighth wave — the PEDIS classification and score in lib/pedis-v613.js (+1)

`pedis` (spec-v613) grades a diabetic foot ulcer on perfusion, extent, depth, infection and sensation. A
**companion with a different shape**: `sinbad-score` sums to 0–6, `ut-diabetic-foot` (spec-v612) does not sum
at all, and the five-category research classification that does both was missing.

**The grade and the score are off by one, and the published table prints both columns side by side.** Grades
are 1-based — grade 1 means the category is *wholly intact* — while the score contribution is grade minus
one. Adding the grades instead of the scores inflates the total by exactly 5: a minimum ulcer reads **5
instead of 0** and a maximum one **17 instead of 12**. A test asserts the difference is exactly 5 at both
extremes and in between, and the adapter returns `gradeSum` **only so the error is visible** — labelled, in
the summary and in the field docs, as not being the score.

**The five categories do not have the same number of grades, so they are not equally weighted.** Extent,
depth and infection run to four grades and carry 3 points each; perfusion runs to three and carries 2; and
**sensation runs to two and carries only 1**. So the neuropathy that defines the diabetic foot moves the
total by a single point of twelve — a test asserts sensation's ceiling is strictly below every other
category's, rather than pinning a list of numbers.

**PEDIS has two identities**, and the adapter keeps them apart: a research *classification* reported as a
profile (`P2 E3 D3 I2 S2`) and a summed *score* added later by a validation study. Both are returned; a test
asserts the profile follows the published grade numbers while the score follows the offset ones. Extent
carries its explicit measurement rule — largest diameter times the perpendicular second largest, in square
centimetres, an area rather than a length. New adapter module registered in `mcp/catalog.js`; its golden
probe ("pedis classification diabetic foot") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1400 calculators across 516 modules**.

### lib/pedis-v613.js
- `pedis`

## Four-hundred-and-thirty-seventh wave — the University of Texas diabetic foot classification in lib/ut-diabetic-foot-v612.js (+1)

`ut-diabetic-foot` (spec-v612) classifies a diabetic foot ulcer. A **thin-cluster gap**: the catalog carried
`wifi`, which stages limb *threat* in chronic limb-threatening ischemia, and no diabetic foot **ulcer**
classification at all.

**It is a two-dimensional matrix, and a single number cannot express it.** Depth is the grade (0, I, II,
III); infection and ischemia are the stage (A, B, C, D). Four by four is sixteen cells, and the answer is
always a *pair* — "2B", "3D". A test walks all sixteen and asserts every cell is reachable with a distinct
label. The Wagner classification this extends is one-dimensional, so a reader who carries a bare Wagner
grade across has silently dropped the entire infection-and-ischemia axis, and the summary says so.

**Grade 0 does not mean "no problem".** It is a pre-ulcerative *or post-ulcerative* completely
epithelialized lesion — a foot at risk, or a healed ulcer site — and it still carries a stage. A healed ulcer
on an ischemic foot is **0C, not "resolved"**. The warning fires at grade 0 and, a test confirms, nowhere
else.

**One published rendering blurs two rungs of the depth ladder**, writing grade II as reaching "capsule or
bone" — which overlaps grade III and cannot be right. The non-overlapping ladder (II reaches tendon or
capsule *without* palpable bone; III probes to bone) is used, and the blur is disclosed.

**The Wagner grade table is deliberately not reproduced.** Independent renderings of Wagner conflict on
whether its grade 2 involves bone, which is a value disagreement rather than a wording variant (spec-v97), so
Wagner is named as the predecessor and nothing more — a test asserts none of Wagner's grade descriptors leak
into the output. **No outcome percentages are returned** either; the per-cell healing and amputation figures
are single-sourced, so the tile states only the direction both sources agree on — risk rises across *both*
axes, which are therefore read together and never traded against each other. A test scans all sixteen cells
for any percentage and finds none. New adapter module registered in `mcp/catalog.js`; its golden probe
("university of texas diabetic foot ulcer classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1399 calculators across 515 modules**.

### lib/ut-diabetic-foot-v612.js
- `ut-diabetic-foot`

## Four-hundred-and-thirty-sixth wave — the Fried frailty phenotype in lib/fried-frailty-v611.js (+1)

`fried-frailty` (spec-v611) counts the five criteria of the original frailty phenotype. A **predecessor gap
of the clearest kind**: the catalog already carried FOUR instruments derived from or simplified out of this
one — `frail-scale`, `sof-frailty-index`, `prisma-7` and `groningen-frailty-indicator` — and the original was
missing. Every slug spelling returned zero; the `fried` prose hits were all "Friedman" and "Friedewald".

**The grip-strength cut-point rises with BMI: a heavier person must squeeze harder to avoid being called
weak.** A man at BMI 24 or below is weak at 29 kg or less; above 28 he is weak at 32 kg or less. It reads
backwards and it is correct — grip scales with body mass, so a single fixed threshold would call heavy people
strong and light people weak. A test asserts the cut-points are monotonically non-decreasing in BMI for both
sexes, rather than pinning eight numbers and hoping.

**The men's table has four BMI bands but only three distinct cut-points** — 24.1–26 and 26.1–28 both cut at
30 kg. That is not a transcription slip, and a test says so explicitly; the women's table, by contrast, has
four distinct values.

**Slowness is a time over 15 feet, not a speed, and sex enters only through the height threshold.** The times
are identical for both sexes — 7 seconds or more if shorter, 6 or more if taller — and only the boundary
moves, 173 cm for men against 159 cm for women. Published conversions of the same 6 seconds into metres per
second disagree with each other by rounding (0.8 against 0.76), so the adapter keeps the published times and
a test asserts no `m/s` figure appears in the result at all.

**Weight loss has two alternative definitions and either satisfies it** (more than 10 pounds unintentionally
in a year, or a measured loss of 5% or more). **The activity cut-offs are cohort-specific**: the criterion is
the lowest quintile by sex, and the familiar 383 and 270 kcal/week figures are that quintile's values in the
derivation cohort, not universal constants. And **three of the five criteria need equipment or a
questionnaire** — a dynamometer, a timed walk, the Minnesota Leisure Time Activity Questionnaire — which is
precisely why the simplified derivatives already in this catalog exist. New adapter module registered in
`mcp/catalog.js`; its golden probe ("fried frailty phenotype criteria") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1398 calculators across 514 modules**.

### lib/fried-frailty-v611.js
- `fried-frailty`

## Four-hundred-and-thirty-fifth wave — the Edinburgh CT criteria in lib/edinburgh-caa-v610.js (+1)

`edinburgh-caa` (spec-v610) estimates the probability that cerebral amyloid angiopathy caused a lobar
intracerebral hemorrhage already seen on CT. A **companion on a different modality**: `boston-caa` is in the
catalog and needs MRI; this reads the non-contrast CT that has already been done.

**Both versions ship together, because the APOE result is almost never back when the CT is read.** The
original criteria use subarachnoid extension, finger-like projections and the APOE e4 genotype; the
simplified criteria use the two CT findings alone. The adapter returns both, and when APOE is `unknown` the
`original` field is `null` rather than guessed.

**The simplified version can only ever read lower than the original, never higher.** All eight combinations
of the three findings are enumerated in code, not transcribed: exactly three disagree, the original is the
higher category in every one, and **APOE e4 accounts for all three** — with a negative genotype the two
versions always agree. Tests pin each of those three claims separately.

**A widely-repeated restatement describes the original as a count of any two of three findings. It is not a
count.** The derivation paper defines high risk as subarachnoid extension *and* at least one other
predictor, so subarachnoid extension is a **gate**, not one of three interchangeable tokens. The concrete
consequence has its own test: finger-like projections plus APOE e4 *without* subarachnoid extension would be
high risk under the count reading, and is medium under the criteria as published. Where the secondary and
the derivation paper conflict, the tile follows the derivation paper and says so.

**Finger-like projections never count on their own, in either version** — they raise the category only once
subarachnoid extension is present. And there is one disclosed hole: the derivation paper describes low risk
as "when no predictors were present" while its own rule-out criterion is the absence of subarachnoid
extension and APOE e4, which places finger-like projections *alone* in the low group even though a predictor
is present. The simplified criteria settle it as low probability; the tile returns low and discloses the
ambiguity **at that one combination only**, not everywhere. New adapter module registered in
`mcp/catalog.js`; its golden probe ("edinburgh ct criteria amyloid angiopathy") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1397 calculators across 513 modules**.

### lib/edinburgh-caa-v610.js
- `edinburgh-caa`

## Four-hundred-and-thirty-fourth wave — the Hijdra sum score in lib/hijdra-v609.js (+1)

`hijdra` (spec-v609) quantifies blood on the initial CT after subarachnoid hemorrhage. A
**cluster-completion gap**: `fisher-grade`, `modified-fisher` and `ogilvy-carter` all ship, and the
*quantitative* member of that family did not.

**A near-miss worth recording: the "Claassen scale" is not a separate instrument — it *is* the modified
Fisher scale**, which already ships as `modified-fisher`. It was dup-checked, sourced, and rejected before
any file was written. A second eponym is not a second tile.

**It is a sum across fourteen sites, not a grade.** Fisher and modified Fisher assign one ordinal category
to the whole scan; this scores ten cisterns and fissures 0 to 3 each (0 to 30) and four ventricles 0 to 3
each (0 to 12) and adds them, total 0 to 42. The summary says so, because reporting it as a grade is the
obvious error.

**The two halves use the same 0-to-3 range with different anchor definitions.** In a cistern, 1 is "a small
amount of blood" and 2 is "moderately filled". In a ventricle, 1 is "sedimentation of blood in the posterior
part" and 2 is "partly filled". A test pins that **only 0 and 3 mean the same thing in both halves** — and
the two halves are still summed into one total. The adapter therefore carries two distinct field label sets
rather than one shared wording.

**Eight of the ten cisternal sites are paired, so there are only six named structures.** The interhemispheric
fissure and the quadrigeminal cistern are scored once; the lateral part of the sylvian fissure, the basal
part of the sylvian fissure, the suprasellar cistern and the ambient cistern are each scored *twice*, left
and right. Scoring "the sylvian fissure" once silently halves four of the ten sites, and a test shows the
lost points directly.

**No severity band is returned** — the instrument has none, so `band` is always `null`. Study thresholds (19
or below as a limited clot burden, 23 or above as predicting vasospasm) come from single studies rather than
the instrument, so they are stated and not applied (spec-v97). And **which scale is best depends on which
outcome**: modified Fisher led for vasospasm with an area under the curve of 0.78 against 0.68 and 0.62, but
only this score correlated significantly with radiological delayed cerebral ischemia — the ranking flips
between the two endpoints. New adapter module registered in `mcp/catalog.js`; its golden probe ("hijdra sum
score subarachnoid blood") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1396 calculators across 512 modules**.

### lib/hijdra-v609.js
- `hijdra`

## Four-hundred-and-thirty-third wave — the Zulewski clinical score in lib/zulewski-v608.js (+1)

`zulewski` (spec-v608) rates clinical suspicion of hypothyroidism from seven symptoms and five signs. A
**predecessor/successor gap**: the items were "originally chosen by Billewicz", and this score re-derived
which of them still discriminate — so it is that older index rebuilt, not an independent instrument.

**The age correction is the finding, and most reproductions drop it.** One point is added when the patient
is **under 55 years**. The consequence is concrete and the summary states it: a patient under 55 with **no
clinical findings at all scores 1, not 0**, the age point is worth exactly as much as a delayed ankle
reflex, and the true maximum is **13, not the 12 that item tables print**.

**The split in the literature is exact and checkable.** The reproductions that print the twelve-item table
state the maximum as 12 and never mention the correction; the sources that state the correction never print
the item table. The two halves of this instrument are, in practice, published separately, and the adapter
carries both.

**The bands are set on the corrected score**, and the age point alone moves the band at *both* published
boundaries — 2 to 3 and 5 to 6. So dropping the correction is a scoring error, not a rounding detail: it
reads every patient under 55 one point too low, and a test pins both flips. The adapter returns
`uncorrectedScore` and `uncorrectedBand` so the difference is visible rather than implied.

**The three skin items are not the same question.** Dry skin is a patient-reported *symptom*; coarse skin is
a *sign* felt on the hands, forearms and elbows; cold skin is a *sign* read against the examiner's own hands.
Skin is a quarter of the instrument, and collapsing the three loses two of twelve points.

**It does not correlate with TSH.** The score correlates with free T4 and free T3 but not with TSH, the gold
standard for thyroid function testing — so a high score is a reason to *measure* TSH and never a substitute
for it. Predictive values from validation cohorts are single-sourced and are not reported (spec-v97). New
adapter module registered in `mcp/catalog.js`; its golden probe ("zulewski clinical score hypothyroidism")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1395 calculators
across 511 modules**.

### lib/zulewski-v608.js
- `zulewski`

## Four-hundred-and-thirty-second wave — the modified Sartorius score in lib/sartorius-hs-v607.js (+1)

`sartorius-hs` (spec-v607) measures the extent of hidradenitis suppurativa. A **cluster-completion gap**:
`hurley-stage` and `ihs4` were both in the catalog and the third member of that trio was not.

**The published unit is a single anatomical region, and the patient's total is the sum across regions.**
The adapter computes one region: 3 points for the region being involved, plus 1 per nodule, plus 6 per
draining fistula, plus a distance term, plus 9 if the lesions are not separated by normal skin. A regional
score presented as the patient's total is wrong, and the source gives no aggregation rule beyond the sum.

**There is no maximum.** Lesions are counted individually and regions are summed, so the score is unbounded
and a patient with many draining fistulas across several regions can reach the hundreds. Any "x of y"
reading is wrong, and so is normalizing it — the summary says so, and a test drives the score past 200.

**A draining fistula is worth exactly six nodules**, and the test that proves it is the load-bearing one:
six nodules and one fistula produce the identical score. Lesion **type** dominates lesion **count**, so an
implementation that counts "lesions" without separating the two is wrong by a factor of six on the item that
matters most. **The distance term triples at each step** — 1, 3, then 9 — so a single span greater than 10 cm
is worth nine nodules, and it is not a linear measure of size.

**The separation item is the Hurley question in disguise.** "Lesions not separated by normal skin" is the
defining feature of Hurley stage III, and one reproduction of this score states the item directly as 9
points for a Hurley stage III area — the two descriptions are the same criterion, and `hurley-stage` in this
catalog is therefore not independent of this score.

**No severity band is returned, deliberately.** One reproduction gives activity as high above 60 and
moderate between 20 and 60; a comparative review of hidradenitis scores states that no bands are provided
for this system. Under the spec-v97 gate a single-sourced band table is reported, not applied, so `band` is
always `null` and a test asserts it across the range. The score was superseded for being time-consuming in
extensive disease, which is why the IHS4 — also in this catalog — was produced by a Delphi process to give an
easy-to-use formula, and it uses examination findings only, with no patient-reported component. New adapter
module registered in `mcp/catalog.js`; its golden probe ("modified sartorius score hidradenitis") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1394 calculators
across 510 modules**.

### lib/sartorius-hs-v607.js
- `sartorius-hs`

## Four-hundred-and-thirty-first wave — the new Katagiri score in lib/katagiri-v606.js (+1)

`katagiri` (spec-v606) estimates survival in symptomatic skeletal metastasis. A **cluster-completion gap**:
`tokuhashi-revised`, `tomita-score` and `bauer-score` are all in the catalog, and this fourth member — the
only one derived in a cohort treated mostly **non-surgically** — was not.

**The primary-site item is defined by treatability, not by organ, and the same organ appears in two
groups.** Breast and prostate are *slow* growth (0 points) when **hormone-dependent** and *moderate* (2) when
hormone-**independent**; lung is *moderate* (2) when molecularly targeted and *rapid* (3) when it is not. So
naming the organ does not determine the score — it turns on whether the disease still has a treatment that
works, and an implementation that maps organ to group is wrong for the commonest primaries in the series.

**The laboratory item is two tiers of different analytes, not a severity ladder of the same ones.** Abnormal
(1 point) is CRP, LDH or albumin; critical (2 points) is platelets, calcium or bilirubin — **the two tiers
share no analyte**, and a test asserts the intersection is empty. The consequence is directly demonstrated:
**all three abnormal values together score 1, while a single low platelet count scores 2.** Each tier is
any-of, critical outranks abnormal, and the item never reaches 3.

Primary site also carries the single largest weight (3 of 10), more than the visceral or laboratory items.
One-year survival in the **derivation** cohort was 91% at 0-3, 49% at 4-6 and 6% at 7-10 — reported as the
derivation cohort's, since validation cohorts differ. And the 2014 score **added the laboratory item** to a
2005 predecessor, so a score computed without it is the older instrument. New adapter module registered in
`mcp/catalog.js`; its golden probe ("katagiri score skeletal metastasis survival") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1393 calculators across 509 modules**.

### lib/katagiri-v606.js
- `katagiri`

## Four-hundred-and-thirtieth wave — the Harrington classification in lib/harrington-acetabular-v605.js (+1)

`harrington-acetabular` (spec-v605) classifies periacetabular metastatic destruction and the reconstruction
it demands. A **companion on a different bone** to `mirels-score`, already in the catalog: Mirels grades an
impending pathological fracture of a **long bone**; this classifies the **acetabulum**.

**Classes I to III grade bone destruction. Class IV does not, and is not "worse than class III."** Class IV
is defined by the lesion being **solitary and amenable to en-bloc resection with curative intent** — a
statement about the disease *elsewhere in the body* and about the *treatment goal*, not about the acetabulum.
A test asserts the consequence directly: **a solitary resectable lesion in an intact acetabulum is class
IV**, with `destructionOnlyClass` reporting the class I that the destruction ladder alone would have given,
and `assignedByIntent` flagging the override at every level of destruction.

**A widely reproduced rendering re-defines class IV as the most destructive** — "widespread destruction all
the way to the wing of the ilium" — which **inverts its meaning**. Under the original, class IV is not a
hopeless acetabulum but the one patient who might be *cured*. Two renderings disagreed on this and a third,
whose purpose is to restate the original in order to propose an extension, adjudicated it in favour of the
resectability definition.

**Class III, not class IV, is the one described as most challenging to reconstruct** — which follows directly
from class IV not being a destruction level. And **the classes map to named reconstructions rather than
severity bands**: cemented total hip arthroplasty; an anti-protrusion device such as a flanged cup;
acetabuloplasty with large Steinmann pins; a saddle prosthesis after resection. The class states what
operation the bone will accept, and those constructs are reported as 1981-era provenance rather than as a
recommendation. New adapter module registered in `mcp/catalog.js`; its golden probe ("harrington
classification periacetabular metastases") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1392 calculators across 508 modules**.

### lib/harrington-acetabular-v605.js
- `harrington-acetabular`

## Four-hundred-and-twenty-ninth wave — the Bilsky ESCC scale in lib/bilsky-escc-v604.js (+1)

`bilsky-escc` (spec-v604) grades epidural spinal cord compression from spinal metastasis. An **axis gap** in a
cluster the catalog already carries three members of: `sins-score` grades **stability**, and
`tokuhashi-revised`, `tomita-score` and `bauer-score` grade **survival**. None of them grades the **cord**.

**The grades are not numbers and must not be stored as one.** The scale is nominally 4-point but grade 1 is
subdivided into 1a, 1b and 1c, giving labels 0, 1a, 1b, 1c, 2, 3. A test demonstrates the loss directly:
`parseInt` maps **all three** subdivided grades to 1, destroying exactly the distinction the subdivision
exists to draw — while the three carry distinct definitions and distinct ranks. `grade` is returned as a
**string**, with `ordinalRank` exposed separately for sorting only. A "mean ESCC grade" is not a quantity
this scale supports.

**The clinically decisive split sits inside grade 1, not at the numeric middle.** Low grade is 0 through 1c
and high grade is 2 and 3 — so **four of the six grades are low**, and the boundary falls between cord
*abutment* (1c) and cord *compression* (2).

**The scale grades anatomy, not neurology.** In the cited analysis the severity of paralysis was **not**
correlated with the grade: a patient can have grade 3 compression with normal power, and grade 1b can be
severely impaired. Every result carries that caveat.

**The same grade means different things at different spinal levels, and the scale carries no level
information.** At C1-T2 at least half of patients with grade **1b** or worse developed moderate-to-severe
paralysis; at T3-L5 that threshold was **1c**. The level is an optional input and the threshold is reported
separately rather than folded into the grade — a test asserts grade 1b crosses the threshold at C1-T2 and
does not at T3-L5. Finally it is a **single-slice, single-sequence** judgment: axial T2 at the site of most
severe compromise, so a sagittal or CT reading is not this scale's grade. New adapter module registered in
`mcp/catalog.js`; its golden probe ("bilsky escc epidural spinal cord compression grade") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1391 calculators across 507
modules**.

### lib/bilsky-escc-v604.js
- `bilsky-escc`

## Four-hundred-and-twenty-eighth wave — the Bauer scores in lib/bauer-score-v603.js (+1)

`bauer-score` (spec-v603) returns both the Bauer and modified Bauer scores for survival after surgery for
skeletal metastases. A **cluster-completion gap**: `tokuhashi-revised` and `tomita-score` are both in the
catalog and this third widely compared member was not.

**A higher score means a better prognosis.** Every item scores 1 for the *favorable* state — the absence of
something bad, or a favorable histology — and the published bands prove the direction rather than merely
asserting it: 0-1 is under 6 months and the top band is over 12 months. Reading it as a severity scale
inverts the answer completely, and scores in this family do not share a direction.

**The modification removed an item and also moved the bands, and the two versions disagree in exactly two
situations — in opposite directions.** Enumerating all 32 item combinations in a test gives precisely two:

- **No pathological fracture and one other favorable factor** — original scores 2 (palliative surgery),
  modified scores 1 (conservative treatment). **The original is more optimistic.**
- **A fracture present with three favorable factors** — both score 3, but the original says palliative
  surgery and the modification says **excisional** surgery. **The modification is more optimistic.**

So **neither version is systematically more optimistic**, and both disagreements are management-changing.
The exhaustive test asserts there are exactly two disagreement shapes and that they point opposite ways.

**Two of the items are both about the primary tumor and they overlap.** A breast primary scores *both* "not
lung cancer" and "favorable primary"; a colon primary scores only the first; a lung primary scores neither.
Histology therefore carries up to two points — **half the modified scale**.

**The dropped item was dropped for a reason**: pathological fracture predicted worse survival in the
*extremity* group only, not the spine, so the original is not simply the fuller score — the two are tuned to
different anatomy. New adapter module registered in `mcp/catalog.js`; its golden probe ("bauer score skeletal
metastases survival") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1390 calculators across 506 modules**.

### lib/bauer-score-v603.js
- `bauer-score`

## Four-hundred-and-twenty-seventh wave — the Virginia Radiosurgery AVM Scale in lib/vras-v602.js (+1)

`vras` (spec-v602) predicts the outcome of stereotactic radiosurgery for a brain arteriovenous malformation.
A **companion with a different construction** to `pollock-flickinger`, shipped one wave earlier: both answer
the same question about the same malformation, but this is a **0-to-4 ordinal point scale** and that one is a
**continuous formula with no maximum**.

**The scale has five values but only three published outcome bands.** Favorable outcome is reported for 0-1,
for 2, and for 3-4 — so **a 0 and a 1 share the same figure**, as do a 3 and a 4. The scale is *finer than
the evidence behind it*, and distinguishing a 0 from a 1 has no published consequence. The tile reports the
band and never invents a per-score rate.

**Volume is the only graded item and it carries half the scale** (0/1/2 against 1 each for eloquence and
prior hemorrhage). A test asserts the collision this produces: **a 5 cm³ AVM with no eloquence and no
hemorrhage scores 2 — exactly like a 1 cm³ eloquent AVM that has bled.** Their components differ entirely and
the scale cannot tell them apart.

**The volume item saturates at 4 cm³ and the companion's does not.** Above it every malformation scores the
same 2 points, so a 5 cm³ and a 40 cm³ AVM are identical here — while in `pollock-flickinger` volume is
linear and unbounded, and a test asserts those same two are **exactly 3.5 points apart** there, importing the
companion's coefficient to pin the comparison against future drift. `companionVolumeContribution` surfaces
that value.

**The two scales share only volume** — this uses eloquence and prior hemorrhage, the companion uses age and a
location tier — so they can rank two patients in opposite orders and neither converts into the other. And
**"favorable outcome" is a composite of three conditions that must all hold**: obliteration, no
post-treatment hemorrhage, and no permanent symptomatic radiation-induced complication. A rate against it is
not the obliteration rate. New adapter module registered in `mcp/catalog.js`; its golden probe ("virginia
radiosurgery avm scale vras") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1389 calculators across 505 modules**.

### lib/vras-v602.js
- `vras`

## Four-hundred-and-twenty-sixth wave — the Pollock-Flickinger score in lib/pollock-flickinger-v601.js (+1)

`pollock-flickinger` (spec-v601) predicts the outcome of stereotactic radiosurgery for a brain arteriovenous
malformation, in both its original and modified forms. An **axis gap**: `spetzler-ponce` is in the catalog
and grades **microsurgical** risk — a different treatment, a different question, and a different answer for
the same malformation.

**The modification changed no coefficient. It halved the location variable's range.** Both versions are
0.1 × volume + 0.02 × age + **0.3** × location; what changed is that location went from a *three*-tier
variable to a *two*-tier one. A widely circulated rendering gives the modified coefficient as 0.5 — **both
primary abstracts give 0.3**, and 0.3 is applied with the divergence disclosed.

**The modified score is exactly 0.3 lower than the original for every location except frontal and
temporal**, which are tier 0 in both. A test walks every site and asserts the shift is exactly the location
coefficient or exactly zero. Because the outcome bands sit at 1.00, 1.50 and 2.00, **that constant shift can
move a patient a whole band**: an 8 cm³ basal-ganglia AVM at 40 scores 2.2 originally and 1.9 modified — the
difference between a reported **46%** and **64%** obliteration without new deficit. `bandChanged` marks
exactly those patients.

**Intraventricular location has no home in the modified list.** The original names it explicitly in tier 1;
the modified list names hemispheric, corpus callosum and cerebellar for 0 and basal ganglia, thalamus and
brainstem for 1, and never mentions it. `modifiedAvailable` is false and `modified` is null — the source's
hole, reported rather than filled by analogy, with a test asserting it is the only such site.

**The published outcome bands overlap at exactly 2.00** ("1.51 to 2.00" and "2.00 or more"); the higher band
is applied and flagged. And **it is a continuous score, not a grade** — volume and age are unbounded, so
there is no maximum and no "x of y" reading. New adapter module registered in `mcp/catalog.js`; its golden
probe ("pollock flickinger avm radiosurgery score") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1388 calculators across 504 modules**.

### lib/pollock-flickinger-v601.js
- `pollock-flickinger`

## Four-hundred-and-twenty-fifth wave — the original Fisher grade in lib/fisher-grade-v600.js (+1)

`fisher-grade` (spec-v600) grades the appearance of blood on CT after subarachnoid hemorrhage. A
**predecessor gap**: `modified-fisher` is already in the catalog, and the scale it modified was absent.

**The grades are not ordinal for the risk they grade.** Vasospasm risk rises from grade 1 to grade 3, and
**grade 4 does not continue the trend** — grade 3 carries the highest vasospasm risk. A higher Fisher grade
does *not* mean higher vasospasm risk, and every result says so; `carriesHighestVasospasmRisk` marks grade 3
while `outrankedByGradeThree` marks grade 4.

**Grade 4 is defined by location, not by amount, which is why the ordering breaks.** It is intracerebral or
intraventricular blood *with diffuse or no subarachnoid blood* — not "more blood than grade 3" but different
blood in a different compartment. A test asserts the consequence directly: **a speck of intraventricular
blood with no subarachnoid blood at all is grade 4, while thick cisternal clot is grade 3** — the number is
higher and the risk is not. Another test confirms grade 4 is assigned by compartment across *every*
subarachnoid description.

**The same grade 4 covers a speck and a ventricle full of clot** — the documented flaw that motivated the
modified scale. And **the modified scale is not a renumbering**: it adds a grade 0 and splits blood thickness
from intraventricular hemorrhage into two independent axes, so a Fisher 3 is not a modified Fisher 3. The
tile offers no conversion between the scales, and a test asserts none is exposed.

**The 1 mm threshold was measured on 1980-era CT**, where slice thickness, resolution and windowing were
nothing like a modern scanner's — applied as published, with the caveat stated. New adapter module registered
in `mcp/catalog.js`; its golden probe ("fisher grade subarachnoid hemorrhage ct") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1387 calculators across 503 modules**.

### lib/fisher-grade-v600.js
- `fisher-grade`

## Four-hundred-and-twenty-fourth wave — the myxedema coma score in lib/myxedema-coma-v599.js (+1)

`myxedema-coma` (spec-v599) scores the hypothyroid emergency. An **axis companion** to the two thyroid-storm
tiles — `burch-wartofsky` and `jta-thyroid-storm`, the latter shipped one wave earlier: those grade the
*hyper*thyroid emergency, and the *hypo*thyroid one had nothing.

**Two categories are additive sub-checklists and the rest are single graded picks.** Temperature, CNS effects,
gastrointestinal findings and bradycardia are ladders where exactly one option counts. But the cardiovascular
category adds its graded bradycardia pick **to** five independent items, and every metabolic item adds
independently — so **the cardiovascular category alone can contribute 100 points, more than the entire
diagnostic threshold**. Treating either block as a ladder under-scores massively, and tests accumulate each
block item by item to pin the additive behaviour.

**A patient can cross the threshold on non-specific derangement alone.** The five metabolic items —
hyponatremia, hypoglycemia, hypoxemia, hypercarbia, reduced GFR — total 50, and *none* is specific to
hypothyroidism; they occur in most critically ill patients. Those five plus a precipitating event total
**exactly 60**, the diagnostic threshold, and a test asserts that equality. The result reports
`nonSpecificSharePercent` so the composition of a total is visible.

**The diagnostic threshold is agreed at 60 but the middle band's lower edge is not.** The widely reproduced
adapted table gives 25–59 as "supportive" and under 25 as "unlikely"; the primary's own abstract gives 45–59
as "at risk". **A score of 30 is "supportive" under one rendering and "unlikely" under the other** —
`bandsDisagree` fires across that whole interval rather than the tile picking silently.

**The threshold is only about a quarter of the 230-point maximum** — it sounds like a high bar and is not
one. And **it was derived in twenty-one patients** (14 cases, 7 controls), so the quoted 100% sensitivity and
85.7% specificity are stated as fragile rather than settled. New adapter module registered in
`mcp/catalog.js`; its golden probe ("myxedema coma diagnostic score") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1386 calculators across 502 modules**.

### lib/myxedema-coma-v599.js
- `myxedema-coma`

## Four-hundred-and-twenty-third wave — the JTA thyroid-storm criteria in lib/jta-thyroid-storm-v598.js (+1)

`jta-thyroid-storm` (spec-v598) applies the Japan Thyroid Association diagnostic criteria for thyroid storm.
A **companion with a different construction** to `burch-wartofsky`, already in the catalog: the
Burch-Wartofsky Point Scale is a *weighted point scale* read against a threshold, while these are
*categorical combination rules*. The two are the pair used worldwide and are known to disagree.

**Central nervous system manifestations are privileged, and nothing else is.** With a CNS manifestation
present, **one** other feature reaches TS1; without one, **three** are required. A patient with fever and
tachycardia alone is TS2; a patient with delirium and fever alone is TS1. A test holds the feature count
fixed at two and flips only the CNS answer to show the grade change, and a second test walks every pair of
the four non-privileged features to confirm none of them carries that weight.

**TS1 and TS2 are definite and suspected, not mild and severe** — they grade diagnostic *certainty*. A TS2
patient is not less sick; the criteria are less sure.

**TS2 has a second route that is "TS1 without laboratory confirmation".** A patient meeting the TS1 pattern
whose thyroid function tests are unavailable, with clinical evidence of thyroid disease, is TS2 rather than
TS1 — **the same clinical picture drops a grade purely on whether a blood test has come back**. The tile
models that route explicitly and flags it with `viaNoLabsRoute` rather than refusing to compute.

**The heart-failure criterion is severe-level only** (pulmonary edema, rales over more than half the lung
fields, or cardiogenic shock — NYHA IV or Killip III+), so counting mild decompensation over-diagnoses. And
**the exclusion clause is deliberately not mechanical**: the source says an alternative cause warrants
exclusion, then says those same conditions may *themselves trigger* thyroid storm. The tile asks the question
and reports the answer without letting it change the grade. New adapter module registered in
`mcp/catalog.js`; its golden probe ("jta criteria thyroid storm ts1 ts2") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1385 calculators across 501 modules**.

### lib/jta-thyroid-storm-v598.js
- `jta-thyroid-storm`

## Four-hundred-and-twenty-second wave — the PANC 3 score in lib/panc3-v597.js (+1)

`panc3` (spec-v597) predicts severe acute pancreatitis from three items available **at admission**. A
**timing-axis gap** in a cluster the catalog already carries: `ranson-bisap`, `glasgow-imrie` and
`atlanta-pancreatitis` are all present, and the two classical severity scores among them need **48 hours**.
Admission-time prediction is PANC 3's entire reason for existing.

**The rule is all three, not a majority.** The score runs 0-3 and **only a 3 is positive** — this is a
conjunction wearing a score's clothing, and a "2 or more" threshold over-calls severity. A test walks every
two-of-three combination and asserts each one is negative.

**It is a rule-in test, and its sensitivity is the point of failure.** Reported specificity 96-100% against
reported sensitivity 50-75%: a positive result is strong evidence, while **a negative result misses between a
quarter and a half of severe cases**. Using it to send a patient home inverts what the score is good for, so
*every* negative result carries that warning and a test asserts a positive result does not.

**Widely reproduced secondary sources print two of the three units wrong** — hematocrit as "mg/dL" when it is
a percentage with no mass concentration, and BMI as "mg/kg squared" instead of kg/m². The values 44 and 30
are right; those units are not. Every input carries its correct unit inline, and the missing-input message
states them too.

**The reference standard is persistent organ failure, not a score**: organ failure beyond 48 hours graded by
the modified Marshall score — itself in this catalog — so PANC 3 is an admission-time prediction of a
48-hour outcome. And as with the other pancreatitis severity tiles, **amylase and lipase are not inputs**:
hemoconcentration, obesity and a pleural effusion are three unrelated mechanisms, and the enzymes that
diagnose pancreatitis play no part in predicting its severity. New adapter module registered in
`mcp/catalog.js`; its golden probe ("panc 3 score severe acute pancreatitis admission") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1384 calculators across 500 modules**.

### lib/panc3-v597.js
- `panc3`

## Four-hundred-and-twenty-first wave — the Lepine criteria in lib/lepine-v596.js (+1)

`lepine` (spec-v596) classifies a pleural effusion as exudative without a paired serum sample. A **direct
companion** to `heffner`, shipped in spec-v591: both are serum-free two-test rules built from the **same two
measurements** — pleural fluid LDH against the laboratory's serum reference, and pleural fluid cholesterol.

**The two rules use the same two tests with thresholds that move in opposite directions.** Lepine's LDH bar
is **higher** than Heffner's — 0.6 against 0.45 times the serum upper limit, so *harder* to trigger — while
its cholesterol bar is **lower** — 40 against 45 mg/dL, so *easier* to trigger. **Neither rule dominates the
other.** A test proves it in both directions from a single laboratory reference: a cholesterol of 42 is an
exudate by Lepine and a transudate by Heffner, while a pleural LDH of 130 (cutoffs 150 and 112.5) is an
exudate by Heffner and a transudate by Lepine. `disagreementAxis` names which measurement caused it, and a
further test asserts the constants carried for the contrast match the shipped `heffner` lib exactly.

**The trade is specificity, and it is large.** Lepine ran 0.91 sensitive and 0.73 specific against Heffner's
0.93 and 0.58 — about 15 points of specificity for about 2 of sensitivity. Describing Lepine as the
alternative comparable to Light's criteria is therefore a statement about **specificity**, not about overall
superiority, and the tile says so.

**It is an OR rule and the tests do not vote** — one positive classifies the effusion, and reading either
rule as requiring *both* tests would call almost every exudate a transudate. And **it is not actually
serum-free**: the LDH test needs the laboratory's upper limit of normal for serum LDH, a reference value
rather than the patient's blood, but not a fixed number — so the local value is required and no cutoff is
hard-coded. New adapter module registered in `mcp/catalog.js`; its golden probe ("lepine criteria pleural
exudate cholesterol") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1383 calculators across 499 modules**.

### lib/lepine-v596.js
- `lepine`

## Four-hundred-and-twentieth wave — ACEF and ACEF II in lib/acef-v595.js (+1)

`acef` (spec-v595) returns both the ACEF and ACEF II cardiac-surgery mortality risk scores from the same
inputs. The catalog carried perioperative cardiac risk instruments and had neither version; every slug
spelling and filename search returned zero.

**This is a ratio, not a sum of points.** The backbone is **age divided by ejection fraction** — a
dimensionless quantity — with absolute numbers bolted on. There is **no maximum score** and no point
ceiling, so the usual "x of y" framing does not apply and the tile reports no maximum.

**Ejection fraction is a denominator, so the score is nonlinear in it.** Halving the ejection fraction
**doubles** the score: at age 70, an EF of 30 gives 2.33 against 1.17 for an EF of 60. No additive score
behaves this way, and a test pins the exact doubling before rounding.

**The creatinine weight doubles between the versions** — 1 point in the original, 2 in ACEF II — so a value
cannot be carried between them. And **one reproduction of the original prints the operator differently**:
"2.0 mg/dL or more" against "above 2.0", differing only at exactly 2.0. ACEF II is consistently "above", so
that operator is applied to both; `atCreatinineOperatorBoundary` fires at exactly 2.0 and the result states
what the other rendering would give.

**The hematocrit term is continuous and one-sided** — 0.2 for *each* point below 36, and nothing above it.
It is not a threshold flag: a hematocrit of 26 adds 2.0, as much as the creatinine term, and a test asserts
that equality. **The original was derived in elective surgery and has no emergency term**, while ACEF II adds
emergency surgery as its largest single add-on, so an emergency case sets `acefOutsideDerivation` and the
ACEF value is flagged as outside the setting it was built for. New adapter module registered in
`mcp/catalog.js`; its golden probe ("acef score cardiac surgery mortality risk") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1382 calculators across 498 modules**.

### lib/acef-v595.js
- `acef`

## Four-hundred-and-nineteenth wave — the ARC-HBR criteria in lib/arc-hbr-v594.js (+1)

`arc-hbr` (spec-v594) applies the Academic Research Consortium definition of high bleeding risk after
percutaneous coronary intervention. The catalog carried bleeding-risk *scores* (`crusade`, `dapt-score`,
`mehran-cin`) and had no ARC-HBR *definition*.

**The rule is one major or two minor, and a widely used online calculator states it as "at least one
major".** Two minor criteria are worth one major, so a patient with minor criteria alone and no major
criterion **is** at high bleeding risk — and any implementation that only looks for a major criterion reports
that patient as not at risk. `qualifiesOnMinorsAlone` marks exactly those patients, and the warning fires
only for them.

**The same variable appears as both major and minor at different values, so these are not twenty independent
boxes.** Anemia, kidney function, prior bleeding and prior stroke are **banded**: a hemoglobin of 10 is
major, a hemoglobin of 12 in a man is minor, and the same patient cannot be both. Each is asked **once** and
its tier derived, which makes the usual double-counting impossible by construction — tests assert each banded
variable never appears in both lists.

**The anemia minor band is sex-split and the major band is not.** Under 11 g/dL is major for everyone; the
minor band is 11–12.9 for men and 11–11.9 for women. So a hemoglobin of 12.0 is a minor criterion in a man
and **no criterion at all** in a woman — asserted directly.

**There are six different timing windows** — 6 months, 6–12 months, 12 months, any time, 30 days — including
the asymmetry that *spontaneous* intracranial hemorrhage counts at any time while *traumatic* counts only
within 12 months. Carrying one window across the set is the commonest error.

**It is a definition, not a score.** No points, no ranking: it targets an absolute risk of BARC 3–5 bleeding
at or above 4%, or intracranial hemorrhage at or above 1%, at one year. The criteria counts are returned as
provenance for the verdict, never as a severity measure. New adapter module registered in `mcp/catalog.js`;
its golden probe ("arc hbr high bleeding risk criteria pci") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1381 calculators across 497 modules**.

### lib/arc-hbr-v594.js
- `arc-hbr`

## Four-hundred-and-eighteenth wave — the revised Bethesda guidelines in lib/bethesda-v593.js (+1)

`bethesda` (spec-v593) identifies colorectal tumors that should be tested for microsatellite instability. A
**companion with deliberately inverted logic** to `amsterdam-ii`, shipped one wave earlier: Amsterdam II is
an **AND of six** requirements a family must all satisfy; Bethesda is an **OR of five** of which **any one**
triggers testing. They were written to catch the families Amsterdam II misses, and running one without the
other is the commonest way a Lynch family is lost.

**The tumor spectrum is far broader, and that is the point.** Amsterdam II counts five cancers; the Bethesda
spectrum adds stomach, ovarian, pancreas, biliary tract, brain and sebaceous lesions. **A family whose
cancers are gastric and ovarian fails Amsterdam II on spectrum alone and still triggers Bethesda** — the two
tiles will disagree for exactly that family, and a test asserts the spectrum containment that makes it
happen. That disagreement is correct, not a bug.

**There are three different age rules in five criteria, and two criteria have none** — under 50, under 60,
one cancer under 50, and *regardless of age* for criteria 2 and 5. Each criterion carries its own age rule
inline in the tile, because carrying one threshold across the set is the easiest way to get this wrong.

**The 60-year threshold was settled by a vote, not by data.** The revision's own account records that there
was no consensus on whether to include an age criterion at all, and that the participants voted to keep "less
than 60 years". The tile reports it as a convention, and only when that criterion actually fires.

**Criterion 3 uses a pathologist's impression of MSI to decide whether to test for MSI** — "MSI-H histology"
is a morphological judgment, not a laboratory result, so it is a screening step for the screening test. And
**adjacent criteria use different degrees of relative**: criterion 4 is first-degree only, criterion 5 is
first- *or second*-degree.

**Sourcing note (spec-v97):** two renderings disagreed on three cells — whether criterion 1 includes
endometrial cancer, whether criterion 3 carries the under-60 limit, and whether criterion 5 admits
second-degree relatives. A third source, which records the vote and quotes criterion 5 as "first- or
second-degree", resolved all three in favour of the verbatim 2004 text; the dissenting rendering was a
modernized paraphrase, not a competing account of the same text. New adapter module registered in
`mcp/catalog.js`; its golden probe ("revised bethesda guidelines msi testing") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1380 calculators across 496 modules**.

### lib/bethesda-v593.js
- `bethesda`

## Four-hundred-and-seventeenth wave — the Amsterdam II criteria in lib/amsterdam-ii-v592.js (+1)

`amsterdam-ii` (spec-v592) applies the Amsterdam II criteria for Lynch syndrome. The catalog carried breast
and ovarian familial-risk models and had nothing on the Lynch axis: `grep -ci lynch app.js` returned 0.

**All six requirements must be met — it is a conjunction, not a count.** No score, no threshold, no partial
credit: a family meeting five of six **fails**. A test walks every requirement and asserts each one alone
defeats the criteria, and the result never presents five of six as a near miss.

**The "3-2-1" mnemonic omits half the rule, and the part it omits is the part families fail.** It covers
three affected relatives, two successive generations and one diagnosed under 50 — leaving out that **one of
the three must be a first-degree relative of the other two**, that FAP must be excluded, and that tumors must
be **verified by pathological examination**. Three affected *cousins* satisfy "3" and fail the criteria, so
the tile asks the first-degree question separately and puts the three omitted requirements in their own
section.

**The cancer spectrum is closed and shorter than the syndrome.** Only colorectal, endometrium, small
intestine, ureter and renal pelvis count toward the three; a relative with any other cancer contributes
nothing, however strongly the family history suggests Lynch syndrome. The list is the criteria's, not a
summary of which cancers Lynch syndrome causes.

**The predecessor counted colorectal cancer only**, so the same family can meet Amsterdam II and fail
Amsterdam I — both are returned from the same inputs. And **a negative result must not stop an evaluation**:
the Bethesda guidelines exist because these criteria were found too strict, so failing them is not evidence
against Lynch syndrome nor a reason to withhold MMR immunohistochemistry, MSI or germline testing — a caveat
that appears *only* on negative results, as a test asserts. Finally, the commonly quoted sensitivity and
specificity appeared in only one of the two sources checked, so both fields are **always null**. New adapter
module registered in `mcp/catalog.js`; its golden probe ("amsterdam ii criteria lynch syndrome") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1379 calculators across 495
modules**.

### lib/amsterdam-ii-v592.js
- `amsterdam-ii`

## Four-hundred-and-sixteenth wave — the Heffner criteria in lib/heffner-v591.js (+1)

`heffner` (spec-v591) classifies a pleural effusion as exudative **without a paired serum sample**. A
**companion gap**: `light-criteria` is already in the catalog, and Light's criteria require a serum sample
drawn at the same time. Heffner's rules were derived to answer the same question without one.

**"No serum sample needed" is not quite true, and the exception is the LDH test.** Cholesterol and protein
use the pleural fluid alone. The LDH test compares pleural fluid LDH against **0.45 × the laboratory's upper
limit of normal for serum LDH** — a reference value rather than the patient's blood, so no extra sample is
drawn, but **not a fixed number**, because the upper limit differs between laboratories and assays. The tile
requires the local value and defaults nothing; a test shows the *same* pleural LDH classifying differently
under two laboratory references.

**The thresholds are deliberately not the round numbers they resemble.** Protein is **2.9** g/dL, not 3.0.
The LDH multiplier is **0.45**, not the two-thirds Light's criteria use. Each was re-derived for use without
a serum comparison, so "protein over 3" and "LDH over two-thirds" are *different tests*. The tile computes
Light's cutoff from the same reference value for contrast.

**There are two published rules and the number of tests is a choice.** The protein test can be dropped
without loss of accuracy, giving a two-test rule alongside the three-test rule. Both are returned, and
`rulesDisagree` is true **exactly** when protein is the only positive test — asserted in all four
combinations. Which rule a source means by "Heffner's criteria" is often left unstated.

**Any one test is enough; they do not vote**, and **the trade is specificity**: about 98.4% sensitivity
against about 85% specificity, where Light's is far more specific and already misclassifies 15-20% of
transudates. A positive here is weaker evidence of an exudate than a positive Light's result — and both share
the diuretic failure mode. New adapter module registered in `mcp/catalog.js`; its golden probe ("heffner
criteria pleural exudate without serum") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1378 calculators across 494 modules**.

### lib/heffner-v591.js
- `heffner`

## Four-hundred-and-fifteenth wave — the original 1996 Five-Factor Score in lib/ffs-1996-v590.js (+1)

`ffs-1996` (spec-v590) is the original Five-Factor Score for systemic necrotizing vasculitis. A **predecessor
gap**: `ffs-2011`, the revision, has been in the catalog since spec-v148, and the score it revised was
absent.

**The two scores share a name, a range and a band structure — and only one factor.** Both run 0-5 and both
read as 0 / 1 / 2-or-more. But of the five factors only **gastrointestinal involvement** survives unchanged:
cardiomyopathy became cardiac insufficiency, the renal threshold moved and **proteinuria was dropped**,
**CNS involvement was dropped**, and **age over 65** — a demographic variable, not an organ — was added. An
identical number from the two scores does not mean the same thing, and a value cannot be carried between
them. Tests assert exactly one factor survived unchanged and exactly two were dropped.

**The renal threshold moved by only 10 µmol/L, which is enough to cross.** 1996 counts creatinine *above*
140 µmol/L (1.58 mg/dL); the revision counts *at or above* 150. A patient at 145 scores the renal factor here
and not on the revision — the tile detects that window and says so, with the boundaries tested as exclusive
at both ends.

**The successor has a factor that scores for its absence; this one has nothing like it.** In the revision the
*absence* of ENT manifestations scores a point. Every factor here counts something being **present**, so the
inverted item must not be carried across.

**Two things are deliberately withheld or flagged.** `fiveYearMortalityPercent` is **always null**: the
percentages usually quoted alongside "the Five-Factor Score" belong to the 2011 cohort, and the 1996 figures
could not be confirmed from two independent sources, so under the spec-v97 gate none is reported rather than
one being borrowed. And granulomatosis with polyangiitis entered only with the revision's cohort, so
selecting it sets `outsideDerivationCohort`. New adapter module registered in `mcp/catalog.js`; its golden
probe ("five factor score 1996 vasculitis prognosis") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1377 calculators across 493 modules**.

### lib/ffs-1996-v590.js
- `ffs-1996`

## Four-hundred-and-fourteenth wave — the Sternbach criteria in lib/sternbach-v589.js (+1)

`sternbach` (spec-v589) applies the Sternbach criteria for serotonin syndrome. A **predecessor gap**:
`serotonin-toxicity` (the Hunter criteria) is already in the catalog, and the Hunter criteria were built to replace these.

**The superiority of the successor is contested, which is why the predecessor still matters.** The usual
summary is that Hunter is simply better — sensitivity 84% against 75%, specificity 97% against 96%. A
published re-examination points out that the Hunter derivation dataset **overlapped substantially with its
validation data**, so the comparison cannot be upheld as stated, and reports that in that group's own case
series Sternbach missed **10%** of cases against Hunter's **37%**. The tile reports the headline figures *and*
the challenge to them, because "Sternbach is obsolete" is received wisdom rather than a settled finding.

**Three of the four requirements are not symptoms, and one is a negative.** Meeting 3 of 10 features is
*necessary and not sufficient*: the features must have coincided with the addition or increase of a
serotonergic agent, other causes must have been ruled out, and **a neuroleptic must not have been started or
increased** before onset. That last is a hard negative and the one implementations drop — it exists because
neuroleptic malignant syndrome is the differential, so a symptom count that ignores it will label an NMS
patient with serotonin syndrome. A test asserts each of the three defeats all ten features on its own.

**The ten features are mostly non-specific**, which is the known weakness: a patient on an SSRI with a
febrile gastroenteritis can reach 3 of 10 without serotonin toxicity. That is why the exclusion requirement
is load-bearing, and why the successor was built around clonus.

**One reproduction adds an eleventh feature and that can change a verdict.** At least one authoritative
review prints an eleven-item list adding **rigidity**. Because the bar is 3 of N, a patient with rigidity and
exactly two of the ten is positive under that rendering and negative under this one. The ten-item list is
applied, rigidity is asked separately and never counted, and `verdictDependsOnDisputedFeature` fires exactly
when counting it would flip the answer — tested in all four combinations. Finally, the tile is explicit that
**failing these criteria does not exclude serotonin syndrome**. New adapter module registered in
`mcp/catalog.js`; its golden probe ("sternbach criteria serotonin syndrome") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1376 calculators across 492 modules**.

### lib/sternbach-v589.js
- `sternbach`

## Four-hundred-and-thirteenth wave — the ESHRE Bologna criteria in lib/bologna-por-v588.js (+1)

`bologna-por` (spec-v588) applies the ESHRE Bologna criteria for poor ovarian response. A **predecessor
gap** — the inverse of the usual shape, because the *successor* was already here: `poseidon` shipped earlier,
and the POSEIDON classification exists precisely because the Bologna criteria group women with very different
prognoses. The criteria it was built to replace were absent.

**The cut-offs are published as ranges, not numbers.** The consensus defines an abnormal ovarian reserve test
as an antral follicle count under **5 to 7**, or AMH under **0.5 to 1.1 ng/mL**. It does not pick a number.
So the criteria **cannot be computed without a choice the source declined to make**: an antral follicle count
of 6 is abnormal under a cutoff of 7 and normal under a cutoff of 5, and a test asserts that the *same
patient* is a poor responder under one permissible cutoff and not under the other. Both cutoffs are therefore
required inputs, **neither is defaulted**, and any result resting on a value inside the published range sets
`cutoffSensitive` so the fragility is visible rather than implied.

**"At least two of three" has an override that needs only one.** Two episodes of poor response after
*maximal* stimulation are sufficient on their own — but only *in the absence of* advanced maternal age and of
an abnormal ovarian reserve test. An implementation that counts to two and stops calls exactly the group that
clause was written for a non-responder. Both directions are tested: `qualifiedByOverride` for the patient the
override rescues, and `overrideBlocked` for the patient it cannot.

**Two criteria are not what they look like.** The first is not a number — "advanced maternal age (40 or over)
**or any other risk factor** for poor ovarian response" is an open-ended clause with no list attached, so it
is asked as its own input. The second is conditional on the protocol: three or fewer oocytes counts only
after a **conventional** stimulation cycle, and treating any low retrieval as qualifying over-diagnoses poor
response. New adapter module registered in `mcp/catalog.js`; its golden probe ("bologna criteria poor ovarian
response") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1375
calculators across 491 modules**.

### lib/bologna-por-v588.js
- `bologna-por`

## Four-hundred-and-twelfth wave — the quick Pitt bacteremia score in lib/qpitt-v587.js (+1)

`qpitt` (spec-v587) scores five binary items, 0-5, to predict mortality in a patient who already has a
bloodstream infection. A **revised-successor gap**: `pitt-bacteremia` has been in the catalog since spec-v199
and its simplified successor was absent.

**Fever scores nothing. Only hypothermia does.** The temperature item is a single binary — under 36 °C scores
1 and *everything else scores 0* — so a patient at 40.5 °C scores exactly the same as one at 37.0. The
predecessor awarded points for fever as well; the successor dropped that half of the item. Any consumer that
scores "abnormal temperature" is wrong for every febrile patient, and wrong in the direction of
**over**-scoring. A test asserts there is no fever input to answer at all.

**The successor is binary where the predecessor was weighted, over the same five domains.** The Pitt
Bacteremia Score runs 0-14 with cardiac arrest worth 4 and graded mental-status and temperature bands. Here
**cardiac arrest is worth exactly as much as a respiratory rate of 25** — a test asserts the two produce
identical results — so a score cannot be carried between the two.

**The high-risk threshold is only 2 of 5**, across which derivation mortality moved from 8.7% to 57.5%. A
test walks every unordered pair of items and asserts each one reaches it.

**The published mortality ladder stops short.** Predicted 28-day mortality is 3, 9, 22, 45 and 70% for 0, 1,
2, 3 and **"4 or more"** — a score of 5 has no figure of its own. Both 4 and 5 return 70% with
`mortalityFigureLumped` set, so the lumping is visibly the source's rather than an extrapolation. And one
operator diverges between reproductions — the hypotension item as "under 90" or "90 or below" — where the
derivation's own wording governs. New adapter module registered in `mcp/catalog.js`; its golden probe ("quick
pitt bacteremia score mortality") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1374 calculators across 490 modules**.

### lib/qpitt-v587.js
- `qpitt`

## Four-hundred-and-eleventh wave — the up-to-seven criteria in lib/up-to-seven-v586.js (+1)

`up-to-seven` (spec-v586) applies the up-to-seven (Metroticket) criteria for liver transplantation in
hepatocellular carcinoma. A **cluster-completion gap the catalog had documented against itself**:
`milan-criteria` has shipped since spec-v93, and its own note says the criterion it reports "is not a listing
decision (MELD allocation, downstaging, UCSF/extended criteria and center policy all apply)". The extended
criteria it pointed at were not in the catalog.

**The criterion is conditional on something that cannot be measured when the decision is made.** Up-to-seven
as published applies "in the absence of microvascular invasion" — and **microvascular invasion cannot be
assessed before transplant**: imaging shows only *gross* vascular invasion, and biopsy cannot exclude it
because of sampling bias. The published 71.2% five-year survival therefore describes patients who turned out
*on the explant* not to have had it. Applied prospectively, the criterion rests on a condition nobody can
verify at the time of the decision. The tile asks only what is knowable before transplant and states the gap
rather than accepting "no microvascular invasion" as a satisfied input.

**"Seven" is a sum of two different kinds of thing** — the largest tumor's size *in centimeters* plus the
*number* of tumors. That is dimensionally odd on purpose: it is an exchange rate between size and number
rather than a limit on either, so one 6 cm tumor (6 + 1) and four 3 cm tumors (3 + 4) sit at exactly the same
boundary, and a test asserts they do.

**Only the largest tumor's size enters the sum.** Every other tumor contributes 1 by being counted, however
large it is — three tumors of 4.9, 4.8 and 4.7 cm score identically to three of 4.9, 0.5 and 0.5 cm. Total
tumor burden is not what this measures, and the tile does not even accept the other diameters.

**Milan is fully contained within up-to-seven**, so up-to-seven can only *add* candidates, never remove them.
That containment is asserted **by enumeration** over every Milan-eligible size-and-count combination rather
than stated. And **UCSF is deliberately not computed**: its published renderings diverge on whether the
nodule limit is two or three and on whether the size thresholds are strict or inclusive, so under the
spec-v97 gate the divergent cell is reported rather than guessed. New adapter module registered in
`mcp/catalog.js`; its golden probe ("up to seven criteria hcc liver transplant") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1373 calculators across 489 modules**.

### lib/up-to-seven-v586.js
- `up-to-seven`

## Four-hundred-and-tenth wave — the updated RUCAM in lib/rucam-v585.js (+1)

`rucam` (spec-v585) grades the probability that a particular drug or herb caused an episode of liver injury.
An **axis gap**: the catalog carried King's College criteria — a *severity* axis for liver failure — and
nothing on the *causality* axis, which is the question actually asked when a patient on a new drug develops
abnormal liver tests. `grep -ci rucam app.js` returned 0.

**The R ratio picks the scale, and mixed injury is scored on the cholestatic scale.** There are **two**
scoring tables, and which applies is decided *before any item is answered*, by R = (ALT / ALT ULN) ÷ (ALP /
ALP ULN): hepatocellular at R ≥ 5, cholestatic at R ≤ 2, mixed strictly between — and **mixed has no table of
its own**, it borrows the cholestatic one. That is why four laboratory values are required inputs even though
they score nothing.

**The two scales differ in four of seven domains under the same domain names.** Latency windows are longer on
the cholestatic scale (prior exposure 1–90 days against 1–15), the dechallenge windows are 180 days against
30, the dechallenge point ranges are 0 to +2 against −2 to +3, and the risk-factor line differs. The `onset`
and `course` enum keys are *shared*, so **the same key can be worth different points in two cases** — a test
pins the differing windows, and another asserts that a course value from the wrong scale is refused rather
than silently scored.

**Time to onset can exclude the case outright.** Onset before the drug was started, or more than 15 days
(hepatocellular) or 30 days (cholestatic) after it was stopped, returns `excluded: true` and `total: null`.
No total exists; reporting a number there is wrong.

**The two scales do not share a range but do share the bands.** The best reachable total is 14
hepatocellular against 13 cholestatic, yet both are read against the same causality bands, so a "probable" is
not equally hard to reach on the two — `scaleMax` is returned so the total can be read in context. And
**negative points are real and large**: concomitant drugs and an alternative diagnosis each reach −3, so a
case can be argued *out* of causality as well as into it.

**One cell is reconciled rather than recalled.** Two authoritative reproductions render the cholestatic
risk-factor line differently — pregnancy as an extra item, or sharing a line with alcohol. Both state a domain
maximum of +2, which is only consistent with the shared line, so that reading is applied and the divergence
stated. Finally, the tile is explicit that RUCAM grades **causality, not severity**, and that rechallenge is
scored because it sometimes happens, *not* because it is advisable. New adapter module registered in
`mcp/catalog.js`; its golden probe ("rucam drug induced liver injury causality") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1372 calculators across 488 modules**.

### lib/rucam-v585.js
- `rucam`

## Four-hundred-and-ninth wave — the EBMT (Gratwohl) risk score in lib/ebmt-score-v584.js (+1)

`ebmt-score` (spec-v584) sums five pre-transplant factors, 0-7, for allogeneic hematopoietic stem cell
transplantation. A **companion gap**: the catalog already carried `hct-ci`, the Sorror comorbidity index,
which scores the patient's *organ comorbidity*. The EBMT score scores the *disease and the transplant* — age,
stage, timing, donor and sex direction. The two are complementary axes, routinely reported together, and only
one was here.

**One factor silently disappears.** The time-from-diagnosis item "does not apply for patients transplanted in
first complete remission (score 0)". A first-CR patient scores 0 for timing *however long the interval was* —
three years from diagnosis still scores 0 — so the **maximum reachable score in first CR is 6, not 7**, and a
test asserts it. Reading the interval and scoring it unconditionally over-scores exactly the group with the
best prognosis. The tile does not even ask for the interval in first CR.

**The sex item is one-directional.** Only a **female donor into a male recipient** scores. Male donor into
female recipient scores 0, as do both matched combinations. It is one asymmetric direction, not a "sex
mismatch" item, and treating it as mismatch double-counts half the mismatched pairs.

**The donor item has only two published categories** — HLA-identical sibling and unrelated donor. That is the
whole item. **Haploidentical and cord-blood donors have no defined value** in a score that predates both as
routine options; validation studies have applied it in those settings, but the score assigns them no
category, so the tile refuses the input rather than inventing one, and says why.

**A widely reproduced rendering of the timing threshold would leave a hole**: "<12 months = 0, >12 months =
1" leaves an interval of exactly 12 months unclassified. The consistent partition — 12 or less = 0 — is used,
and a test pins exactly 12 months at 0. Plus a disease-specific override hiding inside a generic-looking
three-level item: **severe aplastic anemia always scores 0 for stage**, because the ladder is built from
remission states it does not have. New adapter module registered in `mcp/catalog.js`; its golden probe
("ebmt risk score allogeneic stem cell transplant") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1371 calculators across 487 modules**.

### lib/ebmt-score-v584.js
- `ebmt-score`

## Four-hundred-and-eighth wave — the NAC / Gillmore ATTR stage in lib/nac-attr-stage-v583.js (+1)

`nac-attr-stage` (spec-v583) returns the National Amyloidosis Centre stage for transthyretin cardiac
amyloidosis in **both** its original three-stage form and its 2024 four-stage expansion. A
**revised-successor gap** with neither version present: `grep -ci transthyretin app.js` returned 0.

**Stage 4 is not a tail of stage 3 — it cuts across.** Stage 4 is NT-proBNP ≥ 10,000 ng/L *irrespective of
eGFR*, so a patient with NT-proBNP 12,000 and a perfectly good eGFR of 60 is original stage 2 and expanded
stage 4. The paper counts it: of its 180 stage 4 patients, **65 came from original stage 2** and 115 from
original stage 3. Modelling stage 4 as "stage 3 plus a higher NT-proBNP" silently loses the 65, and a test
asserts exactly that patient. Both stages are reported side by side rather than the newer replacing the
older, because they disagree for a defined and clinically real group.

**The published definition of stage 2 is an OR that literally overlaps stage 3.** The source's own wording is
"stage 2: NT-proBNP >3000 ng/L *or* eGFR <45 ml/min; stage 3: NT-proBNP >3000 ng/L *and* eGFR <45 ml/min" —
every stage 3 patient also satisfies the stage 2 sentence. The intended and universally applied reading is
that stage 2 is the residual, one criterion but not both, with stage 3 taking precedence. That reading is
applied and *stated*, rather than the published wording being presented as unambiguous.

**Stage 2 lumps together two opposite patients** — cardiac-dominant (NT-proBNP over 3000, kidneys fine) and
renal-dominant (eGFR under 45, NT-proBNP at or under 3000). Same label, different clinical picture; the
result names which one it is.

**The 10,000 cut-point is rounded and its sensitivity is about 54%.** The Youden-optimal value was 10,461
ng/L, and it was derived *only* within stage 3 patients. Nearly half the patients who die early are not
flagged, so a stage below 4 is not reassurance.

**Two source holes are reported rather than patched.** The paper never states which eGFR equation was used,
and CKD-EPI and MDRD routinely disagree by several ml/min right at the 45 boundary. And median survival is
returned as **null for stages 1 and 2** on purpose: within 36 months of follow-up a median was reached only
for stage 3 (33.5 months) and stage 4 (22.5 months), so quoting one would be inventing it. NT-proBNP in ng/L
and pg/mL are numerically identical, so no conversion is applied. New adapter module registered in
`mcp/catalog.js`; its golden probe ("nac gillmore stage transthyretin cardiac amyloidosis") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1370 calculators across 486
modules**.

### lib/nac-attr-stage-v583.js
- `nac-attr-stage`

## Four-hundred-and-seventh wave — the HLH-2004 diagnostic criteria in lib/hlh-2004-v582.js (+1)

`hlh-2004` (spec-v582) applies the revised diagnostic guidelines for hemophagocytic lymphohistiocytosis. A
**companion gap on a different axis**: the catalog already carried `hscore-hlh`, which returns a
*probability* of reactive hemophagocytic syndrome in adults. HLH-2004 is a *criteria checklist* from a
pediatric treatment protocol — different construction, different population, different output.

**There are two paths, and the first bypasses the criteria entirely.** Table I reads "The diagnosis HLH can
be established if one of either 1 or 2 below is fulfilled", where 1 is a molecular diagnosis consistent with
HLH. A patient with a confirmed causative mutation **meets the guideline with zero of the eight criteria**.
An implementation that only counts criteria reports that patient backwards, and a test asserts the zero-of-
eight molecular case.

**"No evidence of malignancy" is a ninth bullet, not a ninth criterion.** The primary table prints it in list
(A) alongside the clinical items, but the requirement is five of *eight*. Counting it gives nine and inflates
every total by one. The tool asks it, reports it, and deliberately does not count it — a test asserts the
answer does not move the count, and a second asserts the maximum reachable total is eight.

**The primary gives no fever threshold.** Table I says only "Fever". The 38.5 °C figure carried by many
widely reproduced secondary tables is not in the source, so the tile asks fever as a clinical judgment and
says where the expected number came from rather than silently adopting it.

**Pending is not the same as not met.** NK-cell activity and soluble CD25 are send-out assays that routinely
return days after the question is asked, and NK-cell activity has no universal cutoff — the source defines it
"according to local laboratory reference". With 4 met and 2 pending the tool returns *not yet decided*, not a
negative, because reporting "does not meet HLH-2004" while assays are outstanding is the dangerous error
here: untreated HLH is rapidly fatal.

**Two of the eight are themselves compound** — cytopenias require 2 of 3 lineages (with a separate hemoglobin
threshold for infants under 4 weeks), and the fourth criterion is an OR of triglycerides and fibrinogen — so
the eight criteria are not eight yes/no questions. Every unit conversion used is exact and stated. New
adapter module registered in `mcp/catalog.js`; its golden probe ("hlh 2004 diagnostic criteria hemophagocytic
lymphohistiocytosis") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1369 calculators across 485 modules**.

### lib/hlh-2004-v582.js
- `hlh-2004`

## Four-hundred-and-sixth wave — the Shanghai Score System for Brugada syndrome in lib/shanghai-brugada-v581.js (+1)

`shanghai-brugada` (spec-v581) applies the Shanghai Score System, the diagnostic criteria for Brugada
syndrome, 0 to 9 points across four categories. A **name-collision gap**: the catalog already carried
`brugada-vt`, the algorithm distinguishing ventricular tachycardia from SVT with aberrancy. Same surname,
entirely different clinical question, and the diagnostic score was absent.

**There is a hard gate that is not a score: at least one ECG finding is required.** This is the load-bearing
fact. A patient with an aborted cardiac arrest (3), a first-degree relative with definite Brugada syndrome
(2) and a probable pathogenic mutation (0.5) totals **5.5 points** — well above the 3.5 diagnostic threshold
— and is **still non-diagnostic**, because the ECG category is empty. A test asserts exactly that patient.
Any consumer that sums the categories and reads a band off the total is wrong, and wrong in the direction of
**over-diagnosing** a condition whose management can include an implantable defibrillator.

**The categories take their maximum; they do not sum within themselves.** Within the ECG, clinical-history
and family-history categories only the single highest-scoring item counts — arrest plus nocturnal agonal
respirations plus syncope is 3 for that category, not 6. Only the four categories are added together, which
is why the tool asks one question per category rather than offering a checklist.

**One item is age-conditional and silently disappears.** Atrial flutter or fibrillation without alternative
etiology scores 0.5 **only under 30 years**; at 30 and above the item does not exist and the identical
finding contributes nothing. The tool refuses to compute without an age when that item is selected, and says
so when the age zeroes it.

**Two family-history items are unusual as published**: the definite-Brugada item counts **second-degree**
relatives, and the sudden-death item requires a **negative autopsy** — an absence of finding scored as a
positive input, so an un-autopsied death does not qualify.

**Genotype is deliberately de-weighted** to 0.5, the same as the weakest clinical item and one seventh of a
spontaneous type 1 pattern, and it cannot open the ECG gate. And **the top band does not distinguish
probable from definite** — it is labeled "probable and/or definite" — so the result never reports "definite
Brugada syndrome". This is a diagnostic score, not a risk stratification; whether the diagnosis is met is a
separate question from arrhythmic risk. New adapter module registered in `mcp/catalog.js`; its golden probe
("shanghai score brugada syndrome diagnosis") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1368 calculators across 484 modules**.

### lib/shanghai-brugada-v581.js
- `shanghai-brugada`

## Four-hundred-and-fifth wave — the modified EHRA symptom scale in lib/ehra-af-v580.js (+1)

`ehra-af` (spec-v580) classifies symptom burden in atrial fibrillation. A **companion gap: the missing
axis.** The catalog already carries the AF stroke axis (CHA2DS2-VASc), the bleeding axis (HAS-BLED, ATRIA,
ORBIT) and the recurrence axis (HATCH, APPLE, CAAP-AF, MB-LATER, CHARGE-AF) — and had no **symptom** axis,
which is the one the guideline makes a Class I recommendation to record.

**There is no class 2.** The ladder is 1, **2a**, **2b**, 3, 4 — five levels with a non-numeric label in the
middle. The class must be handled as a **string**: a test demonstrates the loss directly, asserting that 2a
and 2b are distinct classes yet `parseInt` maps both to the same integer. Storing it numerically destroys
exactly the distinction the modification exists to draw.

**2a and 2b share the same objective criterion** — "normal daily activity not affected" — and are separated
*only* by whether the patient is **troubled**. Everywhere else on this scale the discriminator is
**function**; at this one boundary it is **subjective**, deliberately, because that is the boundary the
modification was created to draw. The tool asks it as its own question, and only when activity is
unaffected; a test asserts the troubled answer does *not* move a class already decided by function.

**The six evaluated symptoms are not inputs.** Palpitations, fatigue, dizziness, dyspnea, chest pain and
anxiety are the *domains* the rater weighs; the class depends only on activity impact. A test passes symptom
flags and asserts the class is unchanged.

**It is physician-assessed, not patient-reported** — the guideline states it ignores anxiety, treatment
concerns and medication adverse effects, and that physician and patient assessments frequently diverge. And
**it says nothing about stroke risk**: a completely asymptomatic class 1 patient can carry a high
CHA2DS2-VASc score, which is the most damaging misreading available here. New adapter module registered in
`mcp/catalog.js`; its golden probe ("ehra symptom class atrial fibrillation") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1367 calculators across 483 modules**.

### lib/ehra-af-v580.js
- `ehra-af`

## Four-hundred-and-fourth wave — the Robarts Histopathology Index in lib/robarts-index-v579.js (+1)

`robarts-index` (spec-v579) scores UC histologic activity as a weighted sum, 0-33. A **companion to the
Nancy index** shipped in the previous wave rather than an alternative spelling of it: Nancy is a decision
tree emitting a single grade, Robarts is a weighted sum, and the two disagree on real biopsies.

**The erosion item has five descriptors but only four distinct values.** 5.1 ("recovering epithelium with
adjacent inflammation") and 5.2 ("probable erosion, focally stripped") **both score raw 1** — the
level-to-score map is *not injective*. An agent offering a 0-4 enum for this item would give an item maximum
of 20 and an overall maximum of **38** against the published 15 and 33. The tool therefore addresses the
item **by descriptor**, and a test computes the wrong maximum a naive implementation would report.

**Three Geboes grades are scored in the source system and contribute nothing here.** Architectural change,
lamina propria eosinophils and crypt destruction are each graded 0-3 in Geboes, and *every* level of each
contributes **0** to the RHI — including "severe diffuse architectural abnormality" and "unequivocal crypt
destruction". They are pathology descriptors, not calculator inputs, and are named so an agent does not go
looking for fields that do not exist.

**The epithelial-neutrophil bands overlap and leave a hole**: "<5% of crypts" is a strict *subset* of
"<50%", so 3% satisfies two levels at once, and **exactly 50% satisfies neither**. The tool takes the level,
not a percentage.

**One claimed oddity did not survive checking.** It is natural to suppose a weighted sum over four coarse
items leaves gaps in its range. With these weights it does not — **every integer from 0 to 33 is
attainable**, computed in `attainableTotals()` rather than assumed, and a test asserts all 34. The property
is stated precisely because the intuitive guess is the opposite. New adapter module registered in
`mcp/catalog.js`; its golden probe ("robarts histopathology index uc geboes") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1366 calculators across 482 modules**.

### lib/robarts-index-v579.js
- `robarts-index`

## Four-hundred-and-third wave — the Nancy histological index in lib/nancy-index-v578.js (+1)

`nancy-index` (spec-v578) grades histologic activity in ulcerative colitis 0-4. A **companion gap on a
different axis**: the catalog already has the *endoscopic* UC scores (Mayo subscore, UCEIS) and had no
*histologic* one — and the two diverge in real patients, with histologic remission the stricter target.

**It is not a sum. It is a three-item decision tree in strict priority order** — ulceration, then the
neutrophilic infiltrate, then the chronic infiltrate — and the **first that fires decides the grade**, with
the rest not consulted. Building it additively is wrong in *both* directions: mild findings would accumulate
into a high grade, and an ulcerated biopsy could score below 4 because its other features were unremarkable.
A test asserts a quiet specimen cannot offset ulceration.

**Chronic inflammation is a dead end at grade 1.** However florid the lymphoplasmacytic and eosinophilic
infiltrate, it can **never** push the grade above 1 — it only decides 0 versus 1, and only when neutrophils
and ulcers are both absent. A test sweeps both chronic levels asserting neither exceeds 1.

**The published threshold condition turns out to be structurally guaranteed.** The source defines response
as an index ≤1 "when there are no neutrophils in the epithelium, nor erosions or ulcers" — and because of
the priority order, a grade ≤1 can *only* arise when those are absent. The tool reports the condition
anyway, because applying the same numeric threshold to a score computed some other way **could** reach it
with neutrophils present.

**The denominator is the set of biopsies from the visit — the worst biopsy wins.** A comparative study
instead *averaged* several ratings, an operationally different denominator that will not reproduce this
index. New adapter module registered in `mcp/catalog.js`; its golden probe ("nancy histological index
ulcerative colitis biopsy") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1365 calculators across 481 modules**.

### lib/nancy-index-v578.js
- `nancy-index`

## Four-hundred-and-second wave — MAGIC acute GVHD staging in lib/magic-gvhd-v577.js (+1)

`magic-gvhd` (spec-v577) stages four organs and reads a grade off a pattern table. A **revised-successor
gap**: the catalog ships `gvhd-grade` (Modified Glucksberg), and MAGIC is the consortium standard that
superseded it for data collection and is the grading used in the ruxolitinib registration trials.

**The grade is not a maximum over the organ stages, and treating it as one is the central error.** Stage-3
skin **alone** is grade II; stage-2 lower GI **alone** is grade III. A *lower* organ stage therefore
produces a *higher* overall grade, because the table asks **which** organ is involved rather than how badly.
A test constructs exactly that inversion — a max() implementation would get both cases wrong, in opposite
directions.

**Upper GI has only two states, 0 and 1.** There is no upper-GI stage 2, 3 or 4, so a uniform 0-4 enum per
organ invents three unreachable values (the tool refuses 2, 3 and 4). And in the grade III and IV rules
upper GI appears as a **constraint** — "with stage 0-1 upper GI" — which, since 1 is its maximum, can never
be violated: **upper GI can never by itself drive grade III or IV.**

**Lower-GI stage 4 is qualitative and explicitly overrides stool volume** (severe pain ± ileus, or grossly
bloody stool, *regardless of volume*), so a volume-derived stage could never reach it. The volume criteria
also have **separate adult and pediatric denominators** and two alternative measures within each — volume or
episode count — that can disagree for the same patient, with **no tie-break rule** in the source. That is
why the tool takes the stage rather than a volume.

**Skin stage 4 is a conjunction, not a threshold**: erythroderma >50% BSA **plus** bullae **plus** >5%
desquamation — generalized erythroderma without bullae stays at stage 3. Skin is scored on active erythema
only. New adapter module registered in `mcp/catalog.js`; its golden probe ("magic acute gvhd staging grade")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1364 calculators
across 480 modules**.

### lib/magic-gvhd-v577.js
- `magic-gvhd`

## Four-hundred-and-first wave — the Ablett tetanus classification in lib/ablett-tetanus-v576.js (+1)

`ablett-tetanus` (spec-v576) grades **established** tetanus. A **companion-axis gap**: the catalog's
existing `tetanus` tile is the *prophylaxis decision tree* — wound management and immunization in someone
who does **not** have tetanus. The two never apply to the same patient at the same moment.

**Grade 4 is not a distinct clinical picture — it is grade 3 plus a modifier.** The original defines it
literally as grade 3 *with* severe autonomic instability, so the classification is **three severity levels
and one boolean**, which is why published series report "Ablett III/IV" as a single stratum. The tool takes
the picture as 1-3 and the modifier separately; autonomic instability promotes **only** grade 3, and at
grades 1-2 it is reported without creating a grade 4. Grade 4 cannot be selected directly.

**The vital-sign figures are illustrative, not thresholds — and they are not monotone.** Grade 2 mentions
only ventilatory frequency >30; grade 3 adds pulse >120 *and* raises frequency to >40. A patient with RR 35
and pulse 130 satisfies **neither** row cleanly. Grading is a gestalt judgment over the descriptor set, so
this tool deliberately accepts **no vital signs at all** — deriving a grade from a respiratory rate would
invent a threshold test the classification does not contain. A test passes vital signs and asserts the
result is unchanged.

**It is a descriptor, not a score**: no points, no sum, and no grade 0 — there is no grade for a patient
without tetanus. Grade 1 is the only grade with no numeric criterion. Wording varies between reproductions
of the 1967 original ("no" vs "little or no" dysphagia) while every number is identical, so those are
transcription variants and the tile names the reproduction it quotes. New adapter module registered in
`mcp/catalog.js`; its golden probe ("ablett tetanus severity grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1363 calculators across 479 modules**.

### lib/ablett-tetanus-v576.js
- `ablett-tetanus`

## Four-hundredth wave — the POP scale in lib/peradeniya-op-v575.js (+1)

`peradeniya-op` (spec-v575) grades acute organophosphate poisoning severity from six parameters, maximum 11.
The catalog had no organophosphate content of any kind.

**The heart-rate row has a hole, and it is an interval rather than a single value.** The published levels
are above 60 = 0, 41-60 = 1, and **below 40** = 2 — so everything from 40 up to but not including 41 falls
in none of them. Reading the table as though rates are whole numbers makes it look like a one-value gap; it
is not. Two independent reproductions print it identically, so this is the instrument rather than one
paper's typo, and a bradycardic poisoned patient at 40 is not contrived. The tool **refuses** anything in
the interval and names it.

**The pupil levels overlap on their face** — a pinpoint pupil *is* under 2 mm — so pinpoint takes
**precedence** rather than letting a first-match rule decide.

**Fasciculation is a two-attribute conjunction dressed as a three-level scale.** Generalized **or**
continuous scores 1; **both** scores 2. Intensity is not the axis, so a patient with violent but localized
twitching does not score 2 — and the tool takes the two attributes separately so the conjunction is
structural rather than a judgment call.

**The maximum is 11, not 12.** Five parameters run 0-2 but seizures runs 0-1 only. Assuming six symmetric
items misplaces every band boundary.

**It must be applied before treatment** — atropine reverses miosis and bradycardia, two of the six
parameters — and **it is not a dosing instrument**: atropine titration in these patients is driven by
secretions and oxygenation, not by any score, which is the use this would most damagingly be put to. New
adapter module registered in `mcp/catalog.js`; its golden probe ("peradeniya organophosphorus poisoning
severity scale") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1362 calculators across 478 modules**.

### lib/peradeniya-op-v575.js
- `peradeniya-op`

## Three-hundred-ninety-ninth wave — COMPERA 2.0 in lib/compera-2-v574.js (+1)

`compera-2` (spec-v574) grades up to three variables 1-4 and takes the mean, rounded to the nearest integer.
A **companion and successor at once**: `reveal-lite-2` is in the catalog, and COMPERA 2.0 is the European
counterpart adopted by the 2022 guidelines — which by its own footnote *borrows* REVEAL Lite 2's 6MWD and
BNP cut points, so the two are not independent.

**WHO functional class has only three grades in a four-grade model.** I/II = 1, III = 2, IV = 3. **No
functional class scores 4.** A four-column table whose first row stops at three columns looks like a missing
cell, and "completing" it by mapping class IV to 4 would push every such patient a whole stratum higher. A
test asserts grade 4 is unreachable on that row.

**Three rows have numeric gaps, because the table is written as though every input is an integer.** 6MWD
runs 440-320 then 319-165; NT-proBNP to 649 then from 650; BNP to 199 then from 200. A walk distance of
319.5 m falls in **no** band — and walk distances are routinely recorded to the metre. The tool **refuses**
such a value and names the gap rather than rounding the patient into whichever neighbour is nearer.

**The denominator is the number of variables actually available, not a fixed three.** A patient with two of
three is scorable; treating a missing variable as zero would drag every incomplete patient toward low risk.

**BNP and NT-proBNP are mutually exclusive with a stated precedence — NT-proBNP wins.** They are not two
variables that both count; scoring both would give the peptide axis double the weight of functional class
and walk distance combined.

**The rounding rule differs from the three-stratum model**, which uses banded rounding with different
boundaries — reusing one for the other is the classic error. And **this paper publishes no per-stratum
mortality percentages of its own**, so none is quoted: the circulating four-strata figures come from other
cohorts. New adapter module registered in `mcp/catalog.js`; its golden probe ("compera four stratum
pulmonary hypertension risk") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1361 calculators across 477 modules**.

### lib/compera-2-v574.js
- `compera-2`

## Three-hundred-ninety-eighth wave — the Modified Asthma Predictive Index in lib/mapi-asthma-v573.js (+1)

`mapi-asthma` (spec-v573) fills an axis the catalog lacked entirely: `asthma-control-test`, `childhood-act`,
`pram-asthma` and `pass-asthma` all measure **current** control or severity, and none **predicts** anything.

**This is not a score — it is a two-gate boolean.** Positive requires **both** at least 4 wheezing episodes
in a year **and** either ≥1 major or ≥2 minor criteria. There is no total and no band table, and **criteria
can never substitute for the frequency gate**: a test sets every criterion to yes with 3 episodes and
asserts the result is still negative.

**The change from the original API is a move, not an addition — "API plus food allergy" is wrong.** Allergic
rhinitis was **removed** from the minors and replaced by milk/egg/peanut sensitization; aeroallergen
sensitization was **added** as a third major. Both lists end at three items, but neither is a superset of its
predecessor, because a criterion *left* the instrument. A test asserts rhinitis appears nowhere in the
criteria.

**The two indices use different wheeze denominators.** The original API gates on a 1-to-5 frequency *rating
scale* (stringent ≥3); the mAPI gates on a literal *count* of ≥4 episodes/year. A rating of 3 is not four
episodes. The original also has loose and stringent variants, which is why a quoted "API positive" is
ambiguous; the mAPI has one form.

The eosinophil criterion is **4% or more**, so exactly 4.0% meets it — one secondary source's "greater than
4%" is a loose paraphrase, and the boundary is disclosed at that value. And **the horizon is years, not
months**: the index is applied at ages 1-3 and validated against asthma at ages 6, 8 and 11 in a *high-risk*
cohort, so its positive predictive value is strongly population-dependent. New adapter module registered in
`mcp/catalog.js`; its golden probe ("modified asthma predictive index preschool wheeze") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1360 calculators across 476
modules**.

### lib/mapi-asthma-v573.js
- `mapi-asthma`

## Three-hundred-ninety-seventh wave — the HEAVEN criteria in lib/heaven-criteria-v572.js (+1)

`heaven-criteria` (spec-v572) counts six criteria for a difficult **emergency** airway. A **companion gap**:
`lemon` and `macocha` are in the catalog, and HEAVEN exists precisely because those tools assume a
cooperative, largely elective patient — it is the rapid-sequence-intubation axis of the same question and
includes physiologic as well as anatomic difficulty.

**HEAVEN is a count, not a point score, and it has no band table.** Only **two** figures were ever
published: about 94% first-attempt success with no criteria, and about 43% with five or more. Everything in
between exists in the source papers as a **figure**, never a numeric table. Asked for the success rate at a
count of 3, the correct answer is that none is published — reading a value off a chart and presenting it as
data is exactly the failure this guards against. A test sweeps counts 1-4 asserting `publishedAnchor` is
null and the result says so.

**Four of the six criteria are operator-judgment descriptors, not measurements** — defined with phrases like
"anticipated to interfere" and "suspected". Only the hypoxemia threshold and the pediatric age are
objective, and **obesity is deliberately left undefined with no BMI threshold**, so supplying one replaces
the judgment the instrument asks for.

**"Exsanguination" does not mean bleeding, and the name is actively misleading.** It means *suspected
anemia*, chronic or acute, scored for its effect on safe apnea time. A patient who is not bleeding at all
can meet it; a briskly bleeding patient with a normal hemoglobin may not.

**The criteria are assessed at the moment of laryngoscopy, not on arrival** — effective preoxygenation can
legitimately un-score hypoxemia, so a count taken on arrival is not a HEAVEN count. And **two different
outcomes** have been published against the same criteria (first-pass success; Cormack-Lehane III/IV view),
so a figure quoted without its endpoint is ambiguous. New adapter module registered in `mcp/catalog.js`; its
golden probe ("heaven criteria difficult emergency airway") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1359 calculators across 475 modules**.

### lib/heaven-criteria-v572.js
- `heaven-criteria`

## Three-hundred-ninety-sixth wave — the E-FACED score in lib/e-faced-v571.js (+1)

`e-faced` (spec-v571) scores six items to 9 points for exacerbation risk in bronchiectasis. A
**revised-successor gap**: `faced-bronchiectasis` and `bronchiectasis-bsi` are both in the catalog, and
E-FACED — the exacerbation-augmented successor to FACED by the same authors — was not.

**The successor answers a different question from its predecessor.** FACED predicts **mortality**; E-FACED
predicts **exacerbations**, with essentially unchanged mortality performance. Choosing between them is
choosing the outcome, not taking the newer score.

**The paper's own abstract contradicts its own results section on the added item.** The abstract says the
best cut point was at least **two exacerbations** in the previous year; the results section says at least
**one hospitalization** and builds the model and its table around that. Those are different questions — a
count of any-severity exacerbations against a single severe one. The body describes the actual model
construction, so it governs, and the summary states the discrepancy because an agent that has read only the
abstract will otherwise believe the tool has the wrong item.

**The bands do not carry over from FACED, and a widely copied source gets this wrong.** FACED is 0-7 with
bands 0-2 / 3-4 / 5-7; E-FACED is 0-9 with bands 0-3 / 4-6 / 7-9. At least one widely reproduced secondary
source lists the E-FACED *components* under the FACED *bands*, calling a score of 5 "severe" when E-FACED
calls it moderate. A test constructs exactly that score and asserts the result names the discrepancy — the
live error is much of the reason this tile exists.

**The weighting is uneven: six items but nine points.** Exacerbation, FEV1 and age carry 2 each; Pseudomonas,
extension and dyspnea carry 1 each. New adapter module registered in `mcp/catalog.js`; its golden probe
("e-faced bronchiectasis exacerbation score") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1358 calculators across 474 modules**.

### lib/e-faced-v571.js
- `e-faced`

## Three-hundred-ninety-fifth wave — the New Global Definition of ARDS in lib/global-ards-v570.js (+1)

`global-ards` (spec-v570) applies the 2023/2024 global definition. A **revised-successor gap**: the catalog
already has `berlin-ards`, and this is its successor — adding a **nonintubated** category on high-flow or
noninvasive support and a **resource-limited** category needing neither a blood gas nor positive pressure,
and admitting pulse oximetry and lung ultrasound as evidence.

**Nonintubated ARDS has no severity grading at all.** Mild, moderate and severe exist **only** for intubated
ARDS — there is no such thing as "moderate nonintubated ARDS". A definition that grades one branch invites
grading all of them, so the tool returns `severity: null` outside the intubated branch, and a test sweeps
five nonintubated ratios asserting none produces a grade.

**The resource-limited branch is a terminal dead end, not a milder category.** No PEEP requirement, no
minimum oxygen flow, SpO2:FiO2 only, no severity grade. A patient meeting it has not been shown to be less
sick — only to have been assessed with fewer resources. The tool refuses a PaO2:FiO2 ratio in that branch.

**The saturation ratio is invalid above an SpO2 of 97%, and that is a hard gate.** Above 97% the saturation
sits on the flat part of the dissociation curve and the ratio stops tracking oxygenation, so the tool
**refuses to assess** rather than returning a confident number from a measurement the source excludes. A
test asserts 97 is accepted and 99 is refused.

**Every intubated severity category requires a minimum PEEP of 5 cm H2O** — severity is not read off the
ratio alone. The nonintubated branch has its own floor of HFNO ≥30 L/min or NIV/CPAP ≥5 cm H2O. Both
corrections the source specifies are carried: estimated FiO2 = ambient + 0.03 × L/min, and above 1,000 m the
ratio is multiplied by barometric pressure ÷ 760. New adapter module registered in `mcp/catalog.js`; its
golden probe ("global definition ards 2024 nonintubated") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1357 calculators across 473 modules**.

### lib/global-ards-v570.js
- `global-ards`

## Three-hundred-ninety-fourth wave — GAPP in lib/gapp-v569.js (+1)

`gapp` (spec-v569) grades the metastatic potential of a resected pheochromocytoma or paraganglioma, 0-10. A
**revised-successor gap**: GAPP replaced an earlier scaled score by dropping features that concorded poorly
between observers and adding Ki-67 and a biochemical phenotype, and neither instrument was in the catalog.

**The two histological-pattern features add; they are not alternatives — and the arithmetic proves it.** The
published table lists zellballen 0, large irregular cell nest 1 and pseudorosette 1 as though one is chosen.
But every other category's maximum summed with a *single* pattern point gives **9**, while the same table
states a maximum of **10**. The only reading that reaches 10 is that both features can be present at once,
and an independent summary table lists the pattern maximum as 2. Treating them as mutually exclusive
silently caps the score at 9 and makes a maximum-grade tumor unreachable. A test asserts both the reachable
10 and the counterfactual ceiling of 9.

**The catecholamine term is non-monotonic and looks like a bug.** A **non-functioning** tumor scores 0 — the
same as adrenergic, and *less* than noradrenergic — so a hormonally silent tumor is treated as low risk on
this axis although non-functioning disease is not clinically benign. That is the published ordering and is
not rearranged.

**A biochemical variable sits inside a histopathology grade**, with its definition in a table footnote: the
catecholamine type comes from 24-hour urine fractionated metanephrine and normetanephrine, not the slide, so
an agent given only a pathology report cannot supply it.

**SDHB immunohistochemistry is not part of GAPP** — a modified version adds it and is separate and
unvalidated. And **no grade excludes metastasis**: these tumors metastasize years to decades after
resection, well-differentiated ones included, so a low grade is not a reason to stop surveillance — the
decision this score would most damagingly be misused to settle. New adapter module registered in
`mcp/catalog.js`; its golden probe ("gapp grade pheochromocytoma paraganglioma metastatic") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1356 calculators across 472
modules**.

### lib/gapp-v569.js
- `gapp`

## Three-hundred-ninety-third wave — the Cleveland Clinic (Thakar) score in lib/thakar-aki-v568.js (+1)

`thakar-aki` (spec-v568) estimates the preoperative risk of acute renal failure **requiring dialysis** after
cardiac surgery, 0-17 points.

**The outcome is dialysis-requiring failure, not KDIGO AKI** — the single most important thing to get right
here. Dialysis-requiring failure is far rarer and far more severe than any-stage AKI, which is common after
cardiac surgery, and studies revalidating this score against any-stage AKI are measuring something else. An
agent reporting the output as "risk of AKI" overstates what is predicted by a wide margin.

**The published risk categories stop at 13 while the score runs to 17.** Scores of 14-17 are reachable and
fall outside the published table, so the tool returns `bandAssigned: false` above 13 rather than stretching
the top category — extending a band the source closed would invent a risk estimate for patients the
derivation never described. A test builds a 17 and asserts no band.

**The exact risk percentages are deliberately not reported.** Independent secondary sources disagree (one
gives the 6-8 band as a 7.8-9.5% range and 9-13 as 21.5%, another gives 9.5 and 21.3, and the original
abstract describes the test-set frequency as spanning 0.5-22.1%), the primary table is paywalled, and it
could not be fetched to adjudicate. The score and the four band **boundaries** are consistent and are
reported; a test asserts no percentage appears anywhere in the output.

**Surgery type is counter-intuitive and must not be reordered by invasiveness**: isolated CABG, the
commonest operation, scores 0, while "other cardiac surgery" scores 2 — the same as the far more invasive
CABG plus valve. **Creatinine is stepped and jumps 2 → 5 across one threshold**, a step larger than any
single risk factor, so 0.1 mg/dL of drift near 2.1 can move a patient two bands. New adapter module
registered in `mcp/catalog.js`; its golden probe ("thakar cleveland clinic renal failure cardiac surgery")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1355 calculators
across 471 modules**.

### lib/thakar-aki-v568.js
- `thakar-aki`

## Three-hundred-ninety-second wave — the IGCCCG classification in lib/igcccg-v567.js (+1)

`igcccg` (spec-v567) assigns the prognostic group for metastatic germ cell cancer.

**Seminoma has no poor-prognosis category, and the sixth cell of the grid does not exist.** The source states
outright that no patients with seminoma are classified as poor prognosis. A three-by-two table invites
filling in the missing cell, and letting a seminoma fall through to "poor" would invent a category the
classification refuses to contain. The tool caps seminoma at intermediate, returns `poorCategoryExists:
false`, and a test sweeps every seminoma input path asserting none reaches poor.

**The table mixes all-of and any-of in one classification.** Good prognosis requires **every** criterion
(AND); intermediate and poor are triggered by **any one** marker criterion (OR). Reading the whole table in
a single direction misclassifies both ways — tests pin each direction separately.

**In seminoma the AFP field is a gate, not a graded marker.** A raised AFP does not make a seminoma
higher-risk: by definition the tumor is then a **nonseminoma**. The tool returns
`reclassifyAsNonseminoma: true` rather than a seminoma group. Seminoma also ignores hCG and LDH entirely and
permits any primary site — tests assert a mediastinal primary does not demote a seminoma.

**Units are stated because one is a documented typo.** hCG thresholds are in **IU/L**; a widely used
secondary source prints IU/mL in two rows while quoting the same numbers, and reading it that way is wrong
by a factor of a thousand. LDH is a **multiple** of the local upper limit of normal, not an absolute value.
Markers must be **post-orchiectomy, pre-chemotherapy** — a dedicated study exists showing pre-orchiectomy
values mis-assign the group.

**Two survival vintages with identical group definitions** are both returned, labeled: poor-risk nonseminoma
moved from 48% (1997) to 71% (2021 update) with no change to who falls in the group. New adapter module
registered in `mcp/catalog.js`; its golden probe ("igcccg prognostic group germ cell tumor") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1354 calculators across 470
modules**.

### lib/igcccg-v567.js
- `igcccg`

## Three-hundred-ninety-first wave — the NIH-CPSI in lib/nih-cpsi-v566.js (+1)

`nih-cpsi` (spec-v566) scores three subscales — pain 0-21, urinary 0-10, quality-of-life impact 0-12 —
summed to 0-43.

**Nine numbered questions but thirteen scored items, and both counts are correct.** The literature
universally calls this a 13-item index while the form shows nine questions: Q1 has four yes/no sub-parts and
Q2 has two, so 4 + 2 + 7 = 13. An agent that has met only one of the two counts will think the other
describes a different instrument.

**The per-item ranges are heterogeneous and one item carries ~23% of the total.** Six items are 0-1, two are
0-3, three are 0-5, one is 0-6, and the average-pain rating is 0-10 — worth **ten times** any one yes/no
item. Every field carries its own enum; there is no shared response scale, and a test asserts the exact
range distribution.

**The development paper published no severity bands.** The widely quoted mild 0-14 / moderate 15-29 / severe
30-43 come from a *later* multinational cohort, and the summary attributes them, because an agent that
believes the instrument ships with bands will over-trust them.

**The MGUPI/GUPI is a different instrument**: two extra pain items give a pain subscale of 0-23 and a total
of 0-45, so a total of 44 is impossible here and ordinary there. The two must never be mixed.

Q4 is conditional in wording ("on the days that you had it") but unconditional in scoring, so the tool
requires it and sets `painFrequencyConflict` when Q3 is "never" while Q4 is positive — reporting the
contradiction rather than silently accepting it. New adapter module registered in `mcp/catalog.js`; its
golden probe ("chronic prostatitis symptom index cpsi") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1353 calculators across 469 modules**.

### lib/nih-cpsi-v566.js
- `nih-cpsi`

## Three-hundred-ninetieth wave — the modified NIH lupus nephritis indices in lib/lupus-nephritis-indices-v565.js (+1)

`lupus-nephritis-indices` (spec-v565) scores the 2018 ISN/RPS activity index (0-24, six components) and
chronicity index (0-12, four components). A **revised-successor gap**: these were introduced specifically to
*replace* the A / A-C / C subscripts the 2003 scheme appended to classes III and IV, so a report reading
"Class IV-G (A/C)" is on the superseded scheme.

**Two separate indices that must never be added together.** They measure opposite things — what may still
respond to treatment against what is already scarred — so a combined "36" is meaningless. An agent handed
two numbers from one biopsy will be tempted to sum them; the tool returns separate fields and emits no
total, and a test asserts none exists.

**Only two components are weighted, and only in the activity index.** Fibrinoid necrosis and cellular or
fibrocellular crescents count double. Six components each 0-3 would cap at **18**, and the published maximum
is **24** — the extra 6 is entirely those two terms, which a test asserts arithmetically. The chronicity
index is wholly unweighted.

**Two different 0-3 rubrics coexist inside the same total and are incommensurable.** Glomerular components
are scored by *percentage of glomeruli* (1 = <25%, 2 = 25-50%, 3 = >50%); interstitial inflammation, tubular
atrophy and interstitial fibrosis are scored *mild / moderate / severe*. Identical numeric range, different
question — so each field carries its own rubric rather than sharing one list.

**The denominator is the glomeruli the core actually captured**, so an inadequate biopsy can only *lower*
the glomerular scores, and a low activity index on a sparse core may reflect sampling rather than disease —
a silent failure mode the result states.

**The 2018 and 1984 indices are not interconvertible**: karyorrhexis was separated from fibrinoid necrosis
and merged with neutrophil infiltration, so one original component was split and re-glued to another. Also
"total glomerulosclerosis" means global **and** segmental — a secondary source writing "global" would
undercount chronicity. New adapter module registered in `mcp/catalog.js`; its golden probe ("lupus nephritis
activity chronicity index biopsy") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1352 calculators across 468 modules**.

### lib/lupus-nephritis-indices-v565.js
- `lupus-nephritis-indices`

## Three-hundred-eighty-ninth wave — the PROPKD score in lib/propkd-v564.js (+1)

`propkd` (spec-v564) predicts renal survival in ADPKD from four variables totalling 0-9. A **companion** to
`mayo-adpkd` on a different axis: that stratifies from kidney volume on a scan, this from genotype and
clinical history with no imaging at all, and the two disagree on real patients.

**"PKD2 mutation, 0 points" is an explicit finding, not an absence — the trap a zero-point level invites.**
Scoring 0 for the mutation term *asserts that PKD2 was found*. A patient who has not been genotyped has
**no** PROPKD score, because the variable is missing rather than zero, and defaulting an ungenotyped patient
to the 0-point level would return a low-risk result built on an assertion nobody made. The enum has no
"unknown" or "not tested" member, the tool refuses without a category, and a test asserts no such member
exists. The score is likewise **inapplicable** to patients in whom no PKD1 or PKD2 mutation was found — the
PKD2 level is not a fallback.

**The mutation term supplies up to 4 of the 9 points from one mutually exclusive, non-linear categorical
variable**, so a truncating PKD1 mutation alone reaches the intermediate band before any clinical variable
is counted.

**Both clinical variables are age-gated at 35, and the instrument is weakest in young patients.** A later
analysis notes the score may not help identify rapid progression under 35 unless the patient is *already*
hypertensive and has *already* had urologic complications — so it is least informative in exactly the
patients a clinician most wants to stratify. The optional age argument does not enter the score; it only
attaches that caveat.

The low-risk band runs **0-3**: one widely circulated slide draws the strip starting at 1, which would leave
a score of 0 unbanded, and the paper is followed. The 81.4% NPV and 90.9% PPV are attributed to a separate
review rather than the derivation paper. New adapter module registered in `mcp/catalog.js`; its golden probe
("propkd score renal survival polycystic kidney") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1351 calculators across 467 modules**.

### lib/propkd-v564.js
- `propkd`

## Three-hundred-eighty-eighth wave — the Mayo imaging classification of ADPKD in lib/mayo-adpkd-v563.js (+1)

`mayo-adpkd` (spec-v563) works in two steps, and only the second is arithmetic: a radiologist classifies the
morphology, and only typical (class 1) patients are then subclassified 1A-1E from height-adjusted total
kidney volume and age.

**Class 2 is a terminal dead end, not a route to a low subclass.** Atypical patients receive **no** 1A-1E
subclass at all — the classification explicitly does not risk-stratify them. An agent handed an atypical
patient's volume and age will happily run the formula, and the answer would be a class the instrument
refuses to give. Worse, because atypical disease is often asymmetric or segmental, the computed figure tends
to look falsely **reassuring**. The tool returns `subclassified: false` and stops.

**The morphology class is a descriptor and cannot be inferred.** Nothing in the volume, the height or the
age determines whether a patient is class 1 or class 2, so it is required and never guessed.

**Age sits in a denominator inside an exponent, and the model is not validated below 15.** The published
cut-off table starts there, and the reciprocal exponent makes the estimate increasingly unstable as age
falls. The tool refuses below 15 rather than returning a confident-looking number from the unvalidated end
of the model.

**K = 150 is the published model; a competing K = 130 is a rival parameterization, not a correction.** An
independent validation found the alternative tended to *overestimate* the class. It is named in the summary
so an agent meeting it in the literature knows which model this implements, and it is not applied.

How the volume was measured can shift a whole subclass — the ellipsoid equation overestimated stereologic
volume by about 5.3% on average — so the method is recorded as an input although it does not enter the
arithmetic. New adapter module registered in `mcp/catalog.js`; its golden probe ("mayo imaging
classification adpkd kidney volume") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1350 calculators across 466 modules**.

### lib/mayo-adpkd-v563.js
- `mayo-adpkd`

## Three-hundred-eighty-seventh wave — the Scale for Contraversive Pushing in lib/scp-pushing-v562.js (+1)

`scp-pushing` (spec-v562) scores three sections, each sitting **and** standing, summed — section max 2,
total max 6.

**The total is not the classifier, and thresholding a total is the most natural thing to do with a scored
instrument.** Pusher behavior is diagnosed only when **all three** sections independently clear the
threshold. A patient scoring **4 of 6** with one section at zero is **not** a pusher, while a patient
scoring 1.75 spread across all three **is** — and a test asserts exactly that inversion. The tool returns
section subtotals as first-class values and evaluates every criterion against them, never against the total.

**The point ladders differ between sections and are not equally spaced.** Section A is 0 / 0.25 / 0.75 / 1 —
**there is no 0.5 in section A**. Section B is 0 / 0.5 / 1. Section C is binary. Each field's enum carries
only its own section's values, and a test asserts 0.5 is refused in section A.

**Three named criteria coexist and all three are returned.** They are not a source disagreement to refuse —
they were formalized and named together and answer different questions: Crit_1 (total >0), Crit_2 (every
section >0, the current recommendation), Crit_3 (every section ≥1, Karnath's original and the only one with
no false positives). Reporting one would hide that a patient can be a pusher under the recommended criterion
and not under the original, so the result flags when the criteria disagree.

**A secondary-source error is carried deliberately as a warning.** A widely used rehabilitation-measures
reference states Karnath's criterion as subscores **above 1**; the primary sources say **1 or more**. The
stricter misreading would reclassify every patient scoring exactly 1 in a section. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pusher behaviour scale contraversive pushing stroke") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1349 calculators
across 465 modules**.

### lib/scp-pushing-v562.js
- `scp-pushing`

## Three-hundred-eighty-sixth wave — the SPADI in lib/spadi-v561.js (+1)

`spadi` (spec-v561) scores 13 patient-reported items in two subscales, each 0-10.

**The total is the mean of the two subscale percentages, not the sum of all 13 items over 130.** Thirteen
items on a single 0-10 scale look like one questionnaire, so summing them and dividing by 130 is the obvious
move — and it gives a different, wrong number. The result returns `naiveTotal`, that wrong-but-tempting
computation, alongside the correct total, so an agent can see the two diverge rather than take the
distinction on trust. A test pins a case where they differ (50% vs 38.5%) and one where they coincide.

**The consequence is unequal implicit item weighting.** Five pain items carry half the total and eight
disability items the other half, so one pain item is worth **1.6×** one disability item — a test measures
that ratio directly by moving a single item in each subscale.

**The published missing-data rules diverge, so only complete forms are scored.** One rendering drops an
omitted item from its subscale denominator; another replaces up to two missing values with the subscale
mean. Those are not equivalent and give different totals on the same form, so the tool requires all 13 items
and says in the refusal that the handling of omissions is disputed, rather than reporting a number under an
authority it does not have.

The minimal detectable change of 13 points at 90% confidence is stated as a property of a **change** between
two of the same patient's scores, not of a single score. New adapter module registered in `mcp/catalog.js`;
its golden probe ("spadi shoulder pain disability index") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1348 calculators across 464 modules**.

### lib/spadi-v561.js
- `spadi`

## Three-hundred-eighty-fifth wave — the al Naqeeb aEEG classification in lib/anaqeeb-aeeg-v560.js (+1)

`anaqeeb-aeeg` (spec-v560) sorts the amplitude-integrated EEG into three categories from the upper and lower
margins of the trace. A decision table, not a score — nothing is summed. The catalog had no aEEG content of
any kind.

**The classification is not exhaustive, and an agent will fill the holes if not told.** Two regions of the
input space fall in **no** published category: an upper margin of *exactly* 10 µV (every category requires
strictly above or strictly below 10), and an upper margin below 10 with a lower margin above 5. Both are
reachable from a real measurement. Two thresholds in a three-way classifier look as though they should
partition the plane — they do not. The tool returns `classified: false` with the reason rather than rounding
to the nearest category, because the holes sit exactly where a reader most needs to know the instrument is
silent.

**Seizure activity is a separate flag and is never folded into the amplitude category.** The original scheme
defines seizures *alongside* the classification, not within it, so an infant with a **normal** amplitude and
recorded seizures is **not** thereby moderately abnormal. A test asserts the category is unchanged by the
flag in both directions.

**Sleep-wake cycling is not assessed here at all** — it belongs to the later pattern-based schemes — so its
absence must not be read as normal.

The middle band's lower boundary differs by **one glyph** between the original ("5 µV or below") and an
independent review ("less than 5"). The numbers are identical, so this is a convention rather than a value
disagreement; the original is followed and the divergence is disclosed *only* at a lower margin of exactly
5. And the summary states plainly that this is **not a therapeutic hypothermia eligibility criterion** — the
decision it would most damagingly be misused to settle. New adapter module registered in `mcp/catalog.js`;
its golden probe ("aeeg amplitude classification neonatal encephalopathy") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1347 calculators across 463 modules**.

### lib/anaqeeb-aeeg-v560.js
- `anaqeeb-aeeg`

## Three-hundred-eighty-fourth wave — the Erez pregnancy-specific DIC score in lib/erez-dic-v559.js (+1)

`erez-dic` (spec-v559) scores platelets, the prothrombin time difference and fibrinogen, maximum 52, with 26
or more indicating DIC. A **companion gap**: the catalog already exposes the ISTH and JAAM DIC scores, and
this is a third, pregnancy-specific instrument with different components and a cutoff on a different scale —
**26, not 5** — so the cutoffs must never be carried across.

**The platelet row is non-monotonic and must not be "fixed".** Below 50 scores 1 point while 50-100 scores
2, so the *most* severe thrombocytopenia scores *fewer* points than moderate thrombocytopenia. Two
independent sources print it that way and one names the pattern explicitly as unusual — it is the published
table, not a transcription error. Every instinct says to straighten it into a monotonic ladder, and doing so
would change the score of exactly the sickest patients. A test asserts the row is *not* sorted.

**The prothrombin time input is a difference in seconds, not a ratio and not an INR.** It is the patient
value minus the laboratory control, and the strata are fractions of a second. An agent handed "INR 1.2" or
"PT 14 seconds" and passing either straight through lands in the top stratum and adds **25 unearned
points** — most of the way to the cutoff on its own. This is the single largest error the instrument
invites, so it is stated in the field label, the summary and the result.

**The cutoff is essentially unreachable without one of the two 25-point findings** — a fibrinogen below 3.0
g/L or a PT difference above 1.5 seconds. Everything else on the form totals at most 20, so a falling
platelet count can never reach DIC by that route however far it falls. A test constructs the worst case
without either finding and asserts it lands at 20.

**D-dimer and fibrin degradation products are deliberately absent**, unlike ISTH, because they rise in
normal pregnancy and would false-positive — a design decision, not a gap to fill in. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pregnancy dic score erez obstetric") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1346 calculators across 462
modules**.

### lib/erez-dic-v559.js
- `erez-dic`

## Three-hundred-eighty-third wave — the Ocular Surface Disease Index in lib/osdi-v558.js (+1)

`osdi` (spec-v558) scores 12 patient-reported items over the last week as (sum of scores) x 25 / (number of
questions answered). A **whole-concept gap** — the catalog had no dry-eye content of any kind.

**The denominator is variable and the score is generally not an integer.** Items answered "not applicable"
are excluded from **both** the numerator and the denominator, so the divisor is the number *answered*, not
12. Twelve questions answered with a sum of 5 gives 10.4, and the instrument's own printed grid shows
exactly such fractional values. An agent that divides by a fixed 12, or rounds to a whole number, reports a
different number from the instrument for most patients.

**Because the score is fractional, the integer band rendering is unusable, and the tool uses half-open
intervals.** The bands circulate two ways — intervals (0 to under 13, 13 to under 23, 23 to under 33, 33 and
above) and integer ranges (0-12, 13-22, 23-32, 33+). Under the integer rendering a score of 12.5 or 22.7
falls in **no band**, and such scores are ordinary here rather than contrived. The two agree wherever both
are defined, so this is not a source disagreement to disclose — just a rendering that cannot express a
fractional score. A test scores exactly 12.5 and asserts it still bands.

**Only items 6-12 accept "na"; items 1-5 do not, and the tool refuses it there.** The first section asks
what the patient has *experienced*, which is always answerable; the later sections ask about limitation in
specific activities and discomfort in specific situations, which may genuinely not apply — someone who does
not drive cannot answer about driving at night. This also makes division by zero structurally impossible:
the denominator can never fall below 5.

The instrument itself **prints no numeric cut points** — it encodes the bands graphically only — so the
summary attributes them to the secondary literature rather than to the instrument. New adapter module
registered in `mcp/catalog.js`; its golden probe ("osdi dry eye symptom questionnaire score") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1345 calculators across 461
modules**.

### lib/osdi-v558.js
- `osdi`

## Three-hundred-eighty-second wave — the mSWAT in lib/mswat-v557.js (+1)

`mswat` (spec-v557) measures skin tumor burden in mycosis fungoides and Sezary syndrome: percent body
surface area at weight 1, plus twice the area at weight 2, plus four times the tumor or ulcer area. A
**whole-concept gap** — the catalog had no cutaneous lymphoma content of any kind.

**The score runs 0 to 400, not 0 to 100.** Every input is a percentage of body surface area, so the output
looks like it should be one too. It is not: a body wholly covered in tumor scores 4 × 100. An agent that
caps its expectation at 100 will call an ordinary score of 180 impossible, or will report it as "180 percent
of body surface area" — a different and false claim.

**The three categories are mutually exclusive per unit of skin.** Each square centimetre is counted *once*,
in one category only, so the three percentages sum to at most 100. They are not three independent
measurements of the same skin — and three fields each accepting 0-100 invite exactly that error. The tool
enforces the ceiling.

**The tumor weight is 4 in mSWAT and was 3 in the original SWAT** — that is what the "m" modifies — so a
score quoted from older work without its version is not comparable. Both weights are exposed.

**The two forms use different lesion vocabularies for identical arithmetic.** Erythrodermic patients are
scored as patch / plaque / tumor; nonerythrodermic patients as mild infiltration / moderate infiltration /
tumor. `mswat-erythrodermic` is required because it selects which question is being asked, even though it
does not change the sum.

**There are no severity bands and the tool invents none.** mSWAT is a continuous burden measure whose
published threshold is a *change* from the same patient's baseline — a 50% or greater reduction is a partial
skin response — which belongs to a comparison of two scores, not to one. Asked whether some mSWAT is
"severe", the correct answer is that the instrument publishes no such categories.

A 12-region %BSA reference table circulating with this instrument is **deliberately not implemented**: only
two of its twelve values could be independently confirmed, and the core scoring does not need it, since the
assessor supplies %BSA directly. New adapter module registered in `mcp/catalog.js`; its golden probe ("mswat
skin tumor burden mycosis fungoides") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1344 calculators across 460 modules**.

### lib/mswat-v557.js
- `mswat`

## Three-hundred-eighty-first wave — the Vitiligo Area Scoring Index in lib/vasi-v556.js (+1)

`vasi` (spec-v556) sums, over body regions, the hand units of involvement multiplied by the residual
depigmentation. A **whole-concept gap** — the catalog had no vitiligo content of any kind.

**Depigmentation is a seven-level ordinal ladder, not a free percentage.** Only 0, 10, 25, 50, 75, 90 and
100 are permitted, and the assessor snaps to the nearest *by description* rather than by measuring. An agent
handed "about 60 percent depigmented" must choose 50 or 75, not pass 60. The ladder is deliberately coarse
because the underlying judgment is a visual comparison — accepting an arbitrary percentage would look more
precise while scoring a different instrument. The enum enforces it and a test rejects five plausible
off-ladder values.

**The area unit is patient-relative.** One hand unit is the *patient's own* palm including fingers, defined
as 1% of their body surface area — not a fixed number of square centimetres. The same patch is a different
number of units on a child and a large adult, which is intended: the score is a proportion of that person's
body. The whole body is therefore 100 units, and the tool refuses totals above that.

**The region set diverged, and the tool names the one it implements.** The original used five regions with
upper extremities *including* the axillae and lower extremities *including* the inguinal regions and
buttocks; modern protocols use six *mutually exclusive* regions where upper extremities **exclude** the
hands and lower extremities **exclude** the feet. Under the original five a hand could be counted twice.
This implements the six-region set and returns `regionSet`, because a VASI reported without its region set
is not reproducible.

**T-VASI and F-VASI are different scales and must never share a band table.** Total-body runs 0-100; facial
runs 0-3, because the face is only about 3% of body surface area — so a facial 2 is severe and a total-body
2 is trivial. This computes the total-body score and says so. New adapter module registered in
`mcp/catalog.js`; its golden probe ("vitiligo area scoring index vasi") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1343 calculators across 459 modules**.

### lib/vasi-v556.js
- `vasi`

## Three-hundred-eightieth wave — the Tinnitus Handicap Inventory in lib/thi-v555.js (+1)

`thi` (spec-v555) sums 25 items, each answered yes (4), sometimes (2) or no (0), for a total of 0 to 100,
and assigns one of five published grades. A **companion** to `dhi`, the Dizziness Handicap Inventory — the
two share a design but measure different symptoms, and a patient can score high on one and zero on the
other.

**Every total is even, which is why the published bands have one-point gaps.** The grades are 0-16, 18-36,
38-56, 58-76 and 78-100, so 17, 37, 57 and 77 are **unreachable** — every item contributes 0, 2 or 4, and a
sum of even numbers is even. A band table with holes in it looks like an off-by-one to tidy up. It is not.
Asked what band a score of 17 falls in, the correct answer is that 17 cannot occur, and the adapter exposes
`ODD_TOTALS_UNREACHABLE` so the property is checkable rather than merely asserted.

**The functional/emotional/catastrophic subscales are deliberately not computed, and that is a finding
rather than an omission.** The instrument is usually *described* as having those three subscales, so an
agent will expect them and may try to derive them. It must not: two independent renderings of the
item-to-subscale map disagree on four items (3, 9, 14 and 18) and do not even agree on the shape of the
split — one gives 13/7/5 against a published structure described as 11/9/5 — and the primary text could not
be obtained to adjudicate. Emitting subscores would mean picking one map on no authority and presenting
three numbers a reader would take as the instrument's own, so the tool returns `subscalesReported: false`
and says why.

The grades are also attributed correctly: the 25 items are Newman and colleagues 1996, while the five
severity grades are a separate British working group published in 2001. New adapter module registered in
`mcp/catalog.js`; its golden probe ("tinnitus handicap inventory score grade") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1342 calculators across 458 modules**.

### lib/thi-v555.js
- `thi`

## Three-hundred-seventy-ninth wave — the Global Acne Grading System in lib/gags-v554.js (+1)

`gags` (spec-v554) multiplies a fixed factor for each of six regions by a lesion grade 0-4 and sums the six
products, giving 0 to 44. A **whole-concept gap** — the catalog had no acne content of any kind.

**Each region is graded by its single most severe lesion, never by summing lesion types.** The grade key
reads like an additive checklist (1 comedone, 2 papule, 3 pustule, 4 nodule), so an agent handed "the
forehead has comedones, papules and a nodule" is tempted to return 7. It is 4. Summing lesion types would
roughly triple the score of anyone with mixed disease — which is most patients with acne.

**Chest and upper back are one combined region with a single factor of 3, not two sites.** There are six
regions, not seven. Scoring them separately would take the maximum from 44 to 47 and over-weight truncal
disease against the face, inverting the intent of factors derived from surface area and pilosebaceous-unit
density.

**The published table leaves a score of exactly 39 unassigned, and the tool reports that rather than
patching it.** Severe is printed as 31-38 and very severe as *above* 39, so 39 falls in neither — and 39 is
reachable (a test constructs it). Two independent reproductions print it identically, so this is the
source's own gap, not one publisher's typo, and many tertiary sources silently rewrite the top band as "39
or above" and erase it. The tool returns `bandAssigned: false` with `band: null` at 39 and states what the
primary table prints, because quietly choosing a reading would hide a real ambiguity sitting exactly on the
boundary between the two most severe categories. New adapter module registered in `mcp/catalog.js`; its
golden probe ("global acne grading system severity score") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1341 calculators across 457 modules**.

### lib/gags-v554.js
- `gags`

## Three-hundred-seventy-eighth wave — the PUQE-24 in lib/puqe24-v553.js (+1)

`puqe24` (spec-v553) quantifies nausea and vomiting of pregnancy over the last 24 hours from three items:
hours of nausea, episodes of vomiting, and episodes of retching without bringing anything up.

**The scale has no zero — the total runs 3 to 15, not 0 to 15.** Every item has a minimum of 1 point, the
"not at all" answer, so a woman with no nausea, no vomiting and no retching scores 3. A 0 floor is the
overwhelmingly common shape for a symptom instrument, and assuming it here would read a score of 3 as a mild
symptom burden rather than as the *complete absence* of symptoms, mis-scaling every comparison. The source
says so directly: a value of 3 means no nausea, vomiting or retching, and a lower category would not be
meaningful. The tool rejects an answer of 0 outright and says why.

**The well-being item is not part of the total and runs in the opposite direction.** The form asks the
patient to rate her well-being from 0, the worst possible, to 10, as good as she felt before pregnancy —
higher is *better* there while higher is *worse* on the PUQE score. Summing it would both corrupt the total
and invert the contribution of the one item whose direction disagrees with the rest. It is optional,
reported separately, and a test asserts the total is unchanged across its whole range.

**The bottom-of-scale label diverges between renderings, and the tool discloses it at the boundary.** The
numeric boundaries are identical everywhere (7 and 13); only the name for the lowest range differs. The
instrument's own figure calls 6 or less "mild", while other renderings label 3 separately as "no nausea and
vomiting of pregnancy" and reserve mild for 4-6. This follows the instrument's figure and adds the
alternative reading **only at a total of 3** — the single value where the conventions disagree about what to
call the patient. New adapter module registered in `mcp/catalog.js`; its golden probe ("puqe score nausea
vomiting pregnancy") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1340 calculators across 456 modules**.

### lib/puqe24-v553.js
- `puqe24`

## Three-hundred-seventy-seventh wave — the SNOT-22 in lib/snot22-v552.js (+1)

`snot22` (spec-v552) sums 22 patient-rated items, each 0 to 5 over the past two weeks, for a total of 0 to
110. A **companion** to `lund-mackay` rather than a duplicate: that stages the CT scan, this asks the
patient, and the two correlate poorly with one another by design, so a near-normal CT can accompany a severe
symptom burden and the reverse.

**A score below 8 is not "mild", and an agent will call it mild unless told otherwise.** The stratification
defines mild as 8 to 20 inclusive, moderate as above 20 up to 50, and severe as above 50 — and defines
*nothing* below 8, describing a score in that range as having no clinically significant symptoms. A
three-band scale whose lowest band starts at 8 rather than 0 looks like an off-by-one to fix. It is not:
rounding 0-7 into mild would invent a band the source does not contain and would file a symptom-free patient
alongside one scoring 20. The tool returns a distinct band with `namedBand: false`, and a test pins every
boundary.

**The bands are not part of the instrument.** The 22 items and their anchors are the Washington University
questionnaire, which defines no severity bands at all; the cut points come from a separate 2016
stratification study of 65 patients. The summary says so, because an agent that believes the instrument
ships with bands will over-trust them and will not flag the small derivation sample.

**The form's "most important items" selection is never scored.** It asks the patient to mark up to five
items most affecting their health — a separate checkbox column that is not summed, not weighted, and does
not modify any item's contribution. An agent that up-weighted the marked items would return a number that is
not a SNOT-22 score. The tool records the selection, caps it at five, and a test asserts the total is
unchanged by it.

The MCID of 8.9 is stated as a property of a **comparison** between two scores from the same patient, not of
a single total, since attached to a lone score it would read as a threshold it is not. New adapter module
registered in `mcp/catalog.js`; its golden probe ("snot 22 sinonasal outcome test score") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1339 calculators across 455
modules**.

### lib/snot22-v552.js
- `snot22`

## Three-hundred-seventy-sixth wave — the iRECIST time-point response in lib/irecist-v551.js (+1)

`irecist` (spec-v551) assigns the iRECIST time-point response for trials of immunotherapeutics. A
**companion gap** of the most useful kind: `recist` was already in the catalog, and iRECIST exists precisely
because RECIST 1.1 gets one case wrong — pseudoprogression, where immune-cell infiltration transiently
enlarges lesions before a deep and durable response follows.

**iCPD is not reachable without a prior iUPD, and the tool enforces that structurally.** An agent that knows
RECIST 1.1 will reach for "PD" the moment the sum of measures grows or a new lesion appears. Under iRECIST
that is iUPD, *unconfirmed*, and it takes a further assessment at least 4 weeks and no more than 8 weeks
later to become iCPD. `irecist-prior` is required for exactly this reason, and a test sweeps every category
combination to assert iCPD never appears without it.

**The bar resets, and this is the one rule that inverts RECIST 1.1 knowledge.** Under RECIST 1.1 any
progression permanently precludes a later complete response, partial response or stable disease. Under
iRECIST, shrinkage against baseline after iUPD means the iCPD criteria are *not* met: the response IS
assigned, and iUPD must occur again from nadir before iCPD can be reached. An agent applying its RECIST 1.1
prior here would refuse to assign a response it is required to assign.

**No change from a prior iUPD remains iUPD.** Confirmation requires *further* increase, not persistence —
treating the confirmatory scan as a yes/no on "is it still progressed?" would convert every
stable-but-enlarged patient into confirmed progression, the exact failure mode iRECIST was written to
prevent. And **new lesions are never added to the baseline target sum**: they are recorded separately as
NLT/NLNT, so folding them in would inflate the sum and manufacture the very progression iRECIST treats as
provisional.

The four confirmation fields are kept separate because **the thresholds are not uniform**: at least 5 mm for
target disease, *any* increase for non-target disease (explicitly need not be unequivocal), and for new
lesions a 5 mm NLT increase or any NLNT increase or additional lesions. Collapsing them into one question
would apply the 5 mm bar where the source does not put it. New adapter module registered in
`mcp/catalog.js`; its golden probe ("irecist immunotherapy response pseudoprogression") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1338 calculators across 454
modules**.

### lib/irecist-v551.js
- `irecist`

## Three-hundred-seventy-fifth wave — the GLASS anatomic stage in lib/glass-stage-v550.js (+1)

`glass-stage` (spec-v550) grades the femoropopliteal and infrapopliteal segments of a target arterial path
from 0 to 4 each and looks the pair up in a matrix to give stage I, II or III.

**Grade 0 in both segments is "not applicable", not stage I.** That one cell is the most commonly
mis-tabulated part of the system, and it is exactly the corner a model fills in by symmetry — a five-by-five
matrix whose top-left cell is a hole looks like an omission. It is not. With no significant disease in
either segment there is no target arterial path to stage, and returning stage I there would assert that a
limb with no significant disease is a revascularization target. The tool returns `applicable: false` with
the reason, and a test asserts the band says "NOT stage I" in as many words.

**The inframalleolar modifier is a descriptor and is never an input to the matrix.** The guideline states
outright that it is not considered in the primary stage assignment, so P0, P1 and P2 are appended to the
stage as in "GLASS III, P1". A test asserts that all three modifiers leave the stage unchanged. An agent
that let P2 push the stage upward would be applying a rule the source does not contain.

Severe calcification is a **grade** modifier, not a stage modifier: it raises the affected **segment** grade
by one *before* the matrix lookup, per segment, capped at 4. The result exposes the base grades alongside
the adjusted ones so an agent can see what the adjustment did instead of receiving a number it cannot take
apart.

This is a **companion** to `wifi` and `rutherford-fontaine`, not a replacement for either — those stage the
limb threat and the symptoms, while GLASS grades the anatomic pattern of disease. A limb has all three at
once, and an agent asked "how bad is this limb?" should know the three answer different questions. New
adapter module registered in `mcp/catalog.js`; its golden probe ("glass anatomic stage limb threatening
ischemia") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1337 calculators across 453 modules**.

### lib/glass-stage-v550.js
- `glass-stage`

## Three-hundred-seventy-fourth wave — the POSEIDON classification in lib/poseidon-v549.js (+1)

`poseidon` (spec-v549) stratifies low-prognosis patients in assisted reproduction on two axes, age and
ovarian reserve, into four groups. This wave opens reproductive endocrinology on the MCP surface, which had
no representation at all.

**Only groups 1 and 2 are subdivided, and an agent will invent 3a and 4b if not told otherwise.** The a/b
split by oocyte yield exists only where a prior cycle has happened; groups 3 and 4 are single undivided
groups. A four-group scheme in which exactly two groups split is precisely the shape a language model
smooths into "all four split", so the summary states the asymmetry outright.

**Groups 1 and 2 require a prior conventional-stimulation cycle; groups 3 and 4 do not.** The defining
feature of groups 1 and 2 is an *unexpectedly* poor response, so a patient with adequate reserve who has
never been stimulated is not group 1 or 2 — and is not "group 1 pending" either — but simply unclassifiable
until a cycle has been done. The tool returns `classified: false` with the reason rather than guessing a
group.

**Adequate reserve with 10 or more oocytes is not a POSEIDON group at all.** The classification describes
*low-prognosis* patients, so a normal responder falls outside it and the tool says so. An agent that always
emitted a group would label every patient low-prognosis, inverting the purpose of the scheme.

The two reserve markers are **alternatives**: antral follicle count of 5 or more *and/or* anti-Mullerian
hormone of 1.2 ng/mL or more. Neither field is individually required and the tool refuses only when both are
absent. When both are supplied and disagree, reserve is graded adequate — that is what "and/or" means — and
the result sets `markersDiscordant` so the disagreement is visible instead of being resolved silently, since
discordance is common and decides which half of the scheme applies. New adapter module registered in
`mcp/catalog.js`; its golden probe ("poseidon group low prognosis ivf") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1336 calculators across 452 modules**.

### lib/poseidon-v549.js
- `poseidon`

## Three-hundred-seventy-third wave — patient-prosthesis mismatch in lib/ppm-eoai-v548.js (+1)

`ppm-eoai` (spec-v548) divides the prosthesis effective orifice area by body surface area and grades the
result against the position-specific thresholds.

**`ppm-position` is required and has no default, because the same number grades differently.** An EOAi of
1.0 is entirely **normal** aortic and **moderate** mismatch mitral. An agent assuming aortic — the commoner
case, and the one nearly all the literature is about — would report a mitral patient with moderate mismatch
as having a normal valve. There is no safe default, so the tool refuses to guess.

**Each position carries its own citation, and that is a correction rather than a flourish.** The paper almost
universally cited for patient-prosthesis mismatch (Pibarot and Dumesnil, Heart 2006) contains the aortic
grading and **no mitral moderate/severe grading at all** — it says only that mitral indexed area should
ideally not fall below about 1.2-1.3. The three-tier mitral grading is Magne and colleagues, Circulation
2007. The result returns the per-position source in a `citation` field.

The aortic severe boundary is **disclosed at the boundary**: the cited source puts severe *below* 0.65, so
exactly 0.65 is moderate, while later guideline-aligned tables put it at 0.65 *or below*. The band says so
when the value lands on 0.65 and stays quiet otherwise. **Obesity-specific thresholds are not implemented**
and the summary says why — single-sourced, and applying a lower threshold on one source's authority would
*downgrade* real mismatch in exactly the patients where indexing is most contested. The summary also warns
that the EOA must be the **measured or reference** area, not the labelled valve size, which is a
manufacturing dimension that overstates the opening. New adapter module registered in `mcp/catalog.js`; its
golden probe ("patient prosthesis mismatch indexed orifice area") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1335 calculators across 451 modules**.

### lib/ppm-eoai-v548.js
- `ppm-eoai`

## Three-hundred-seventy-second wave — the AAP BRUE lower-risk criteria in lib/brue-v547.js (+1)

`brue` (spec-v547) applies the seven AAP lower-risk criteria to a qualifying Brief Resolved Unexplained
Event.

**`brue-qualifiesAsBrue` is a gate, not a formality, and the lib stops on it.** BRUE is a diagnosis of
exclusion: if the history or examination explains the episode, the diagnosis is that explanation and the
lower-risk criteria **do not apply**. Answering the gate "no" returns a finished, valid result with
`lowerRisk: null` — deliberately **null rather than false**, because the event was never stratified, and
reporting "not lower-risk" would imply higher-risk when the truth is "not a BRUE at all".

**The seven criteria are conjunctive and there is no score.** Failing any one is higher-risk by definition.
This is the shape an agent most reliably gets wrong on a criteria list: it will want to count how many were
met. The result exposes **no total and no score field**, and returns `failed` plus `failedText` so a caller
reports *which* criterion failed rather than a meaningless fraction.

The prematurity criterion **spells out its inequality**, because published reproductions diverge — three give
"32 weeks or more" and "45 weeks or more", two give "over". At-or-above is used, matching the guideline's
rationale that risk attaches to birth *below* 32 weeks and attenuates *once* 45 weeks postconceptional age is
reached; an infant born at exactly 32w0d is the case to be careful with.

And the asymmetry the summary leads with: **"lower-risk" is not "no risk" and not a discharge order**, and
**"higher-risk" is not a diagnosis and not an admission order**. "Lower-risk BRUE" is exactly the phrase an
agent would otherwise turn into "safe to send home". Two of the seven criteria — concerning history and
concerning examination — are clinical judgements the tool takes as **given** and cannot itself detect, and
child abuse is among the causes an appropriate history and examination must consider. New adapter module
registered in `mcp/catalog.js`; its golden probe ("brue lower risk criteria infant") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1334 calculators across 450 modules**.

### lib/brue-v547.js
- `brue`

## Three-hundred-seventy-first wave — the revised ASRM endometriosis stage in lib/rasrm-stage-v546.js (+1)

`rasrm-stage` (spec-v546) converts a revised ASRM point total into a stage.

**This tool takes a total and returns a stage. It does not score a laparoscopy, and the summary says so
twice.** That is a deliberate scope limit, not an omission. The ASRM point grid could not be verified against
two independent sources — the scoring form is a single copyrighted figure, and the reachable reproductions
are images or single transcriptions. An agent asked to "calculate the ASRM score" from operative findings
must **decline and ask for the total from the completed form**, because a grid assembled from one unverified
transcription would produce authoritative-looking numbers nobody can check.

**The only thing this tool computes is the boundary, so the boundary is stated exactly:** a total of 40 is
stage III; 41 is the first stage IV. That matters because one secondary account, paraphrasing a well-known
criticism of the system, loosely calls a lone finding of complete cul-de-sac obliteration — which scores 40 —
"severe disease". Under the published ranges it sits at the *top of stage III*, and an agent repeating the
loose phrasing would upgrade a stage. A total of **0 returns no stage**, not stage I, since stage I begins at
1. The **1979 AFS ranges are named** (stage III 16-30, IV 31-54) because an agent handed a bare "stage III"
from an older record cannot interpret it without the edition.

The summary leads with the instrument's own weakness rather than burying it: the stage **correlates poorly
with pain and with fertility outcome**. "Stage IV endometriosis" is exactly the phrase an agent would
otherwise convert into a prognosis about pain or conception, and the classification does not support that.
New adapter module registered in `mcp/catalog.js`; its golden probe ("asrm endometriosis stage from score")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1333 calculators
across 449 modules**.

### lib/rasrm-stage-v546.js
- `rasrm-stage`

## Three-hundred-seventieth wave — FIGO PALM-COEIN in lib/palm-coein-v545.js (+1)

`palm-coein` (spec-v545) returns the full TNM-style AUB notation from the nine category values.

**Every category enum has three values, not two: `'0'`, `'1'` and `'?'`.** This is the design point. The
obvious schema is nine booleans, and it would destroy the instrument's central property: PALM-COEIN is
modelled on TNM staging, every category is addressed for every patient, and a category recorded as **absent**
must be distinguishable from one **never assessed**. An agent that has not seen imaging or a coagulation
screen must be able to say so rather than being forced to assert an absence. The result returns an
`unassessed` list so a caller can see exactly which categories are unknown.

**All nine are required, and that is the point rather than an inconvenience** — omitting a category is not
the same as scoring it 0, and the lib refuses a partial classification and says why. **The leiomyoma
secondary tier is conditionally required:** when L is 1, SM versus O must be supplied, because that
distinction carries the clinical weight; the tertiary type is genuinely optional and is omitted from the
notation when absent.

**The edition is stated in every result.** The 2011 and 2018 editions disagree in two ways that change a
case: type 3 leiomyomas sit outside the submucous group in 2011 and inside it from 2018, and
anticoagulant-associated bleeding is AUB-C in 2011 but AUB-I from 2018. Both remain in active use, so an
agent comparing a stored classification against a fresh one must know which edition each used; this tool
implements 2018 and returns `edition: '2018'`. The summary also states that this **does not exclude
malignancy**, because "AUB-M0" is exactly the string an agent could report as reassurance — M0 records that
malignancy was *assessed and not found*, and a classification made before endometrial sampling says nothing
about whether cancer is present. New adapter module registered in `mcp/catalog.js`; its golden probe ("palm
coein abnormal uterine bleeding causes") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1332 calculators across 448 modules**.

### lib/palm-coein-v545.js
- `palm-coein`

## Three-hundred-sixty-ninth wave — NEMS in lib/nems-v544.js (+1)

`nems` (spec-v544) scores the nine NEMS items into a nursing-workload total out of 56.

**The two exclusive pairs are published as three-way enums, not as four booleans, and that is the design
point.** The instrument names nine items, so the obvious schema is nine booleans — and it would be wrong.
Mechanical ventilatory support **excludes** supplementary ventilatory care, and multiple vasoactive drugs
**replaces** the single-drug score. Four booleans would let an agent score 12 + 3 and 12 + 7, reaching **66**
on a scale whose maximum is **56**. Collapsing each pair into one enum makes that unrepresentable.

**The summary gives the arithmetic proof**, because an agent that has read the nine-item list elsewhere may
believe the tool is under-scoring: summing all nine weights gives 66, while 56 is reachable only as
`9 + 6 + 12 + 12 + 6 + 5 + 6` — exactly one item from each exclusive pair. The exclusivity is not an
interpretation; it is the only reading under which the instrument's own stated maximum is achievable.

**The axis warning is the most important line in the summary.** Every other ICU instrument an agent knows —
APACHE, SOFA, SAPS — scores illness severity or mortality. NEMS scores **nursing workload consumed**. An
agent reporting "NEMS 45" as though it meant a critically ill patient has said something the instrument does
not support: a stable ventilated patient on two infusions scores high, and a patient dying of an untreatable
illness may score low. The interventions-in-ICU label also spells out the routine-care exclusion — routine
radiographs, echocardiograms, ECGs, dressings, and line insertion do **not** count, and counting them
inflates a large fraction of ICU patients by five points. New adapter module registered in `mcp/catalog.js`;
its golden probe ("nems icu nursing workload score") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1331 calculators across 447 modules**.

### lib/nems-v544.js
- `nems`

## Three-hundred-sixty-eighth wave — the SAVE score in lib/save-score-v543.js (+1)

`save-score` (spec-v543) sums the SAVE items, applies the published constant, and returns the risk class with
its reported cohort survival.

**The summary states the minus-six constant first, and the result returns it as its own field.** This is the
design point. An agent that sums the published item weights and stops has produced a number **six points too
high**, and because the class boundaries sit at 5, 0, −5 and −10, that shifts most patients a **full risk
class** — typically reporting a better survival than the instrument gives. The result exposes
`componentTotal`, `constant` and `total` separately so the arithmetic is auditable rather than something a
caller has to trust.

**The diagnosis groups and the organ failures are published as independent booleans, not one-of enums.** The
source says "select one or more" for both. Modelling either as a single-choice list would have been the
natural schema shape and would be wrong: myocarditis plus refractory VT scores **+3 and +2**, and liver plus
CNS plus renal failure scores **−9**. Enum-ing them would under-score the most salvageable and the sickest
patients in opposite directions. Every field label carries its **signed** weight, since roughly half subtract
and a caller cannot otherwise sanity-check a total that *falls* as findings accumulate.

The summary gives the **primary source's** class boundaries explicitly — class I is **above** 5, class II is
1 **through** 5 — because a widely used secondary rendering says "5 or above" and mis-assigns a score of
exactly 5; and the range as **−35 to 23**, not the −35 to 17 another secondary source reports. And the
framing: these are **cohort** figures, and the summary says outright that the score is not a tool for
deciding whether to offer ECMO or to withdraw it, because "SAVE class V, 18 percent survival" is precisely
the phrase an agent might otherwise convert into a recommendation against support — in a condition that is
fatal without it, and in a class where patients still survived. New adapter module registered in
`mcp/catalog.js`; its golden probe ("save score veno arterial ecmo survival") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1330 calculators across 446 modules**.

### lib/save-score-v543.js
- `save-score`

## Three-hundred-sixty-seventh wave — the TWSTRS severity subscale in lib/twstrs-severity-v542.js (+1)

`twstrs-severity` (spec-v542) scores the ten TWSTRS severity items out of 35 and returns the excursion
subtotal and the duration contribution separately.

**The tool is named and scoped as one subscale, and the summary says so repeatedly.** The full TWSTRS is 85
points — severity 35, disability 30, pain 20. Only the severity subscale could be verified to the standard
this catalog requires, so an agent asked for "the TWSTRS" must be told it is receiving 35 points of an
85-point instrument; reporting this total as "TWSTRS 20" without the denominator would understate a patient
by more than a factor of two.

**The per-item enum ranges differ, which is what a shared vocabulary would break.** Rotation runs 0-4,
laterocollis and sagittal deviation 0-3, the two shifts **0-1**, sensory tricks 0-2, duration 0-5. A single
0-4 vocabulary across all ten would let an agent send a `4` for a lateral shift, which has only "absent" and
"present". Each field publishes only its own legal values, generated from the lib.

**Duration is doubled, and the label says so in capitals.** It is the only weighted item; an agent reporting
the raw 0-5 rating as its contribution would under-count by up to five points on the item the scale
deliberately emphasises. The result returns `durationRaw` and `durationPoints` separately so the doubling is
auditable rather than buried in a total. **Anterocollis and retrocollis share one field** — mutually
exclusive, since a neck cannot be flexed and extended at once — so there is no way for an agent to score both
and reach 38. New adapter module registered in `mcp/catalog.js`; its golden probe ("twstrs cervical dystonia
severity") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1329
calculators across 445 modules**.

### lib/twstrs-severity-v542.js
- `twstrs-severity`

## Three-hundred-sixty-sixth wave — RACHS-1 in lib/rachs1-v541.js (+1)

`rachs1` (spec-v541) returns the RACHS-1 category with its derivation-cohort mortality and the separate risk
modifiers.

**The tool returns no mortality for category 5, and the summary says why.** The derivation published figures
for categories 1, 2, 3, 4 and 6 and explicitly **none** for 5, because there were too few cases — yet
category 5 sits numerically between two categories that *do* have figures (19.4% and 47.7%). That is exactly
the shape most likely to make an agent interpolate: "it's between 4 and 6, so call it thirty-something
percent". The result returns `mortality: null` with a `mortalityPublished` boolean and the ordering the panel
actually asserted (higher than 4, lower than 6), and nothing else.

**The modifiers are adjusted odds ratios and must not be added to anything.** Age band, prematurity, and
major non-cardiac structural anomaly each *multiply* risk within the model. An agent treating them as points,
or reporting "category 4 plus prematurity equals category 5", would be inventing a scale — so they come back
as a separate `modifiers` list, never folded into the category.

The category comes from the **procedure**, so the field label carries representative procedures per category;
they are explicitly **representative, not exhaustive**, and an unlisted operation should be looked up rather
than matched to the nearest-sounding example. Every band labels the mortality figures **historical** — they
come from a cohort analysed for a 2002 publication and outcomes have improved substantially since, so
reporting "19.4 percent" to a contemporary question would materially overstate current risk. And the framing
that matters most: this is a risk-adjustment tool for comparing **programs and case-mixes**, never designed
to predict one child's outcome, because "RACHS-1 category 6" is exactly the phrase an agent might otherwise
turn into a prognosis for a family. New adapter module registered in `mcp/catalog.js`; its golden probe
("rachs congenital heart surgery risk category") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1328 calculators across 444 modules**.

### lib/rachs1-v541.js
- `rachs1`

## Three-hundred-sixty-fifth wave — the ISHLT cardiac rejection grade in lib/ishlt-rejection-v540.js (+1)

`ishlt-rejection` (spec-v540) maps an endomyocardial biopsy appearance to one of the four revised ISHLT
grades and returns the 1990 grades that collapse into it.

**The enum publishes only the revised R grades, and the lib refuses the 1990 ones with their mapping.** That
refusal is the design point. Both schemes use the numbers 1-4 and they do not mean the same things, so an
agent that reads "grade 3" out of an older pathology report and passes it through has a coin-flip between
1990 grade **3A (which is 2R)** and **3B (which is 3R)** — and those sit on opposite sides of the threshold
that usually decides treatment. Sending `'3A'` returns an explicit "this is a 1990-scheme grade, it maps to
2R" rather than a silent score; sending a bare `'3'` returns "ambiguous between the two schemes".

**The many-to-one mapping is returned, not just applied.** `legacyGrades` lists which old grades collapse
into the reported one, so an agent reconciling a longitudinal record can see that a patient's "1B" three
years ago and "2" last year are **both 1R** today and represent no change, rather than reporting a trend that
does not exist.

**Every band names the two blind spots**, because they are the ones an agent would otherwise paper over: this
grades acute *cellular* rejection only. Antibody-mediated rejection has its own ISHLT pAMR scale using
immunohistochemistry, so a biopsy can be 0R and still show it; and cardiac allograft vasculopathy — the
chronic process that limits long-term survival — is invisible here. **"ISHLT 0R" is not "no rejection".** New
adapter module registered in `mcp/catalog.js`; its golden probe ("ishlt cardiac allograft rejection grade")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1327 calculators
across 443 modules**.

### lib/ishlt-rejection-v540.js
- `ishlt-rejection`

## Three-hundred-sixty-fourth wave — the ISL lymphedema staging in lib/isl-lymphedema-v539.js (+1)

`isl-lymphedema` (spec-v539) returns the ISL stage and the volume-based severity grade together.

**The tool takes two axes and refuses to collapse them.** Stage describes what the tissue has become;
severity grades how much volume the limb has gained. "Stage III lymphedema" and "severe lymphedema" are
different statements that get used interchangeably, and an agent handed only one must not report the other.
Both are required, and both come back separately.

**The stage enum's labels carry the pitting behavior, which is non-monotonic.** Pitting rises from stage I to
stage II and then **falls away again** through late stage II to stage III as fibrosis replaces fluid. An
agent treating "does it pit?" as a severity dial reads stage III backwards and would report an advanced
fibrotic limb as improved — so the advanced stages say "that is fibrosis, not improvement" in their own text.

**`isl-bilateral` is required, and it is not a formality.** The severity grade is an **inter-limb**
comparison, so when both limbs are affected the difference between them understates the disease. An agent
that omitted it would report a falsely reassuring grade on exactly the patients with the most disease; when
it is yes, the band carries the caveat and the result exposes a `bilateral` flag. The severity enum also
includes `none` for an excess at or below 5 percent, because subclinical lymphedema is measurable from about
3 to 5 percent — below the minimal grade — so without that option an agent would be forced to call a
measurably abnormal limb "minimal". New adapter module registered in `mcp/catalog.js`; its golden probe
("isl lymphedema stage swollen limb") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1326 calculators across 442 modules**.

### lib/isl-lymphedema-v539.js
- `isl-lymphedema`

## Three-hundred-sixty-third wave — the NEOS score in lib/neos-v538.js (+1)

`neos` (spec-v538) counts the five NEOS predictors and returns the published probability of poor one-year
functional status.

**The compute result returns `probability: null` for a score of 2 or 3, and that is the design point.** The
derivation published a probability only for 0 or 1 (3%) and 4 or 5 (69%); it pooled groups of twenty patients
or fewer with adjacent scores to avoid unstable estimates, so no figure for 2 or 3 is printed anywhere in it
or in the validation literature. Figures for those scores **do** circulate — an agent asked "what is the
probability for NEOS 3?" will find one and repeat it. So the tool returns an explicit null plus a
`probabilityPublished` boolean and a sentence explaining the omission, which is more useful, and more honest,
than a number nobody published.

The **abnormal-MRI field keeps the source's loose definition** and its label says so: the derivation
classified an MRI as abnormal on the referring physician's opinion, and an agent substituting a specific
radiologic criterion would be scoring a different variable from the one validated. The summary also states
that the score **cannot be computed at presentation** — two predictors require four weeks to have elapsed, so
an agent asked to score a newly admitted patient should say so rather than marking those predictors absent,
which would return a falsely reassuring total. Every band carries the safety frame: a high score identifies a
group with worse average outcomes, is not an individual prediction, and is **not a basis for withdrawing or
limiting treatment** — in a disease where prolonged severe illness is compatible with good recovery over
eighteen to twenty-four months, premature pessimism is the specific harm. New adapter module registered in
`mcp/catalog.js`; its golden probe ("neos score nmdar encephalitis outcome") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1325 calculators across 441 modules**.

### lib/neos-v538.js
- `neos`

## Three-hundred-sixty-second wave — the ALSFRS-R in lib/alsfrs-r-v537.js (+1)

`alsfrs-r` (spec-v537) rates the twelve ALSFRS-R functions into a total of 0-48 and returns the respiratory
subscore with it.

**The summary states the direction first: higher is BETTER**, 48 normal and 0 complete loss. Most scored
instruments an agent meets run the other way, and an agent assuming "higher is worse" would describe a
declining patient as improving — the single most damaging misreading available here.

**Both cutting-food scales are published as fields, but exactly one is ever scored, and neither is marked
required.** `als-hasGastrostomy` is required and **selects** which alternative applies. Marking both cutting
fields required would force a caller to invent a score on a scale that does not apply to their patient, and
scoring both would give a maximum of **52** rather than 48. The lib requires exactly the applicable twelve
and names what is missing; the result reports `cuttingScale` and `cuttingItem` so a caller can see which was
used.

**The summary warns that a bare total is not comparable across versions.** The original ALSFRS had ten items
and a maximum of 40; the revision has twelve and 48. An agent that reads "ALSFRS 40" from an older record and
reports it as this scale's output has turned a normal score into a substantial deficit — every band states
the denominator. It also states what the three respiratory items are **not**: reported symptoms and support
in use, not a vital capacity, so a full 12 of 12 is not reassurance about respiratory function. New adapter
module registered in `mcp/catalog.js`; its golden probe ("alsfrs r als functional rating scale") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1324 calculators across 440
modules**.

### lib/alsfrs-r-v537.js
- `alsfrs-r`

## Three-hundred-sixty-first wave — the Hardman index in lib/hardman-v536.js (+1)

`hardman` (spec-v536) counts the five Hardman factors and returns the index with the original series'
observed mortality and, at three or more, its refutation.

**The summary leads with the refutation, not the score, and that is the entire design point of this
adapter.** The original 1996 finding — that all eight patients with three or more factors died — entered
practice as a rule for **denying surgery**, and it has been repeatedly refuted since. An agent that fetched
"Hardman index 4" and reported "100 percent mortality" would reproduce the exact error the later literature
exists to correct, in the one clinical situation where that error is irreversible: a ruptured abdominal
aortic aneurysm is **fatal without repair**, so a wrongly withheld operation is not a conservative choice.

The compute result therefore **never returns a bare mortality figure**. `originalSeriesMortality` is a
sentence, not a number, and at every score of 3 or more it is accompanied by a `refutation` field carrying
the pooled 77-percent figure and the explicit finding that the index cannot be used as an absolute limit for
denial of surgery. Every band, at every score, states that the index does not identify patients who should be
denied an operation — a unit test walks all six scores and asserts it.

Units are spelled out on the field labels: creatinine as **over 190 micromol/L** with the mg/dL equivalent,
because one secondary source renders it as 180 and because an agent working in mg/dL cannot convert a
threshold it was never given; hemoglobin in both g/dL and g/L. All five are required — this is a count of
factors, so an omitted factor is not the same as an absent one and would silently deflate the index. New
adapter module registered in `mcp/catalog.js`; its golden probe ("hardman index ruptured aortic aneurysm") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1323 calculators
across 439 modules**.

### lib/hardman-v536.js
- `hardman`

## Three-hundred-sixtieth wave — the CaPTHUS score in lib/capthus-v535.js (+1)

`capthus` (spec-v535) sums the five CaPTHUS criteria and reports whether the score predicts single-gland
disease.

**The calcium field label carries both units and says which is which.** The threshold is **12 mg/dL**,
equivalently 3 mmol/L, and the bare number 3 sits next to a score that also runs 0-5. An agent that read the
3 as mg/dL would award the calcium point to essentially every patient with primary hyperparathyroidism and
inflate every score it produced.

**Concordance is its own field, not derived.** Two positive scans pointing at *different* glands score 2, not
3. An agent given only "ultrasound positive" and "sestamibi positive" and left to infer concordance would
over-score exactly the discordant patient the fifth criterion exists to catch; the result exposes a
`discordantScans` flag so a caller can see when that case arises.

**The summary labels the 100 percent as derivation-cohort performance**, because reporting a bare "100
percent positive predictive value" is the single most misleading thing this tool could say — external
validation runs lower and varies. It also states the asymmetry agents get wrong in the *other* direction: the
**negative** predictive value is poor, so a score below 3 does not predict multigland disease, and an agent
reporting "CaPTHUS 1, suggests four-gland hyperplasia" has inverted the instrument. New adapter module
registered in `mcp/catalog.js`; its golden probe ("capthus single gland parathyroid score") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1322 calculators across 438
modules**.

### lib/capthus-v535.js
- `capthus`

## Three-hundred-fifty-ninth wave — the Ridley-Jopling leprosy classification in lib/ridley-jopling-v534.js (+1)

`ridley-jopling` (spec-v534) maps a leprosy case to one of the five Ridley-Jopling groups, or to
indeterminate, and returns the WHO operational crosswalk with it.

**The enum includes `'I'` for indeterminate alongside the five groups**, because indeterminate leprosy sits
*outside* the five-group spectrum. An enum of exactly five would force an agent to file an indeterminate case
as TT, which misstates both the immunology and the prognosis. The result exposes an `onSpectrum` boolean so a
caller can tell the two situations apart.

**The tool returns no per-group bacterial index, and the summary says why.** Four independent reproductions
give four different per-group BI values, partly because some quote the bacterial index of *granuloma* rather
than the slit-skin smear index. Returning any one of them would manufacture a precision the literature does
not have, and an agent would repeat it as fact. What *is* returned is the Ridley logarithmic **scale**, which
is unambiguous, plus the direction across the spectrum.

The summary carries the **current** WHO operational rule rather than just the crosswalk, because the rule has
changed several times and stale references are common: a case is multibacillary if there are more than five
skin lesions, **or** any nerve involvement, **or** bacilli on a smear — alternatives, not requirements — and
**nerve involvement alone makes a case multibacillary** even with few lesions, which is the point most often
gotten wrong and the one that changes treatment duration. The summary also states that the classification
**cannot be assigned from a clinical description alone**, since the lepromin response and the histology are
part of the definition: an agent handed a photograph or a symptom list cannot pick a group and should say so
rather than guessing between BT and BB. New adapter module registered in `mcp/catalog.js`; its golden probe
("ridley jopling leprosy classification") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1321 calculators across 437 modules**.

### lib/ridley-jopling-v534.js
- `ridley-jopling`

## Three-hundred-fifty-eighth wave — the Renal Angina Index in lib/renal-angina-v533.js (+1)

`renal-angina` (spec-v533) multiplies the risk stratum by the injury stratum and reports whether renal angina
is fulfilled.

**The injury enum publishes `'1'`, `'2'`, `'4'`, `'8'` — the tiers double, and there is no 3, 5, 6, or 7.**
An agent that assumed a 1-4 ordinal would send a `3` and get a validation error rather than a silently halved
score, and the error message says the tiers double, because "3 is not a valid injury stratum" would otherwise
read like a bug in the tool.

**The summary says "product, not sum" explicitly** and gives the arithmetic. An agent that adds a risk of 5
and an injury of 8 gets 13 — a number the index cannot produce at all; the true answer is 40, the maximum.
Addition does not merely mis-scale here, it **inverts the conclusion on the sickest patients**. The reachable
set is returned and named: only twelve totals exist, so an agent reporting "RAI 12 out of 40" would badly
understate a value that is in fact the fourth-highest the index can produce. The result exposes `reachable`
so a caller can position the total honestly.

The very-high risk tier's label spells out that it requires ventilation **and** vasoactive support rather
than either, because several secondary sources render it as "or" and that reading promotes every ventilated
child to a 5. The summary frames the index as a **rule-out**, which is what its published performance
supports — a high negative predictive value and a modest positive one — because an agent reporting a positive
RAI as "this child will develop AKI" has overstated the only claim the index makes. New adapter module
registered in `mcp/catalog.js`; its golden probe ("renal angina index predict aki child") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1320 calculators across 436
modules**.

### lib/renal-angina-v533.js
- `renal-angina`

## Three-hundred-fifty-seventh wave — the Columbia FSGS classification in lib/columbia-fsgs-v532.js (+1)

`columbia-fsgs` (spec-v532) takes the six biopsy findings and applies the Columbia precedence order to return
one of five mutually exclusive variants.

**The tool takes findings and returns a variant — it does not accept a variant.** That is the design point.
An agent that already believes it knows the variant has nothing to gain here; the value is entirely in the
precedence order, which is what gets applied wrong by hand. Publishing a "which variant is it?" enum would
have inverted the tool into a lookup table and thrown away the only thing it does.

**The `anyPerihilarSclerosis` field is the one that matters most, and its label says so.** It is not a
finding that selects a variant — it is a **veto** on the tip variant, and it fires even though tip sits
*above* perihilar in the precedence order. An agent reasoning "tip outranks perihilar, so a tip lesion wins"
gets the wrong variant on exactly the biopsies where the distinction is real. The result exposes a
`tipVetoed` flag so a caller can see the veto fired rather than silently receiving a different variant than
it expected.

All six are required, and a "no" is meaningful: the classification is a sequence of exclusions, so an omitted
finding is not the same as an absent one. A biopsy with none of the six defining lesions returns **no
variant** rather than defaulting to NOS. The summary states in the strongest terms the copy allows that this
does **not** distinguish primary from secondary FSGS — that distinction decides whether immunosuppression is
considered, it is made from clinical context and electron microscopy rather than from these five variants,
and it is the single most likely wrong inference an agent would draw from a variant name. New adapter module
registered in `mcp/catalog.js`; its golden probe ("fsgs biopsy variant columbia classification") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1319 calculators across 435
modules**.

### lib/columbia-fsgs-v532.js
- `columbia-fsgs`

## Three-hundred-fifty-sixth wave — the EHIT classification in lib/ehit-v531.js (+1)

`ehit` (spec-v531) maps an ultrasound finding after endovenous thermal ablation to one of the five EHIT
classes and returns the published recommendation attached to it.

**The enum publishes `'Ia'` and `'Ib'` and deliberately omits a bare `'I'`.** The two subclasses carry
identical management, so collapsing them would be tempting — but a bare `I` would let an agent record a class
that no longer exists in the 2021 consensus and silently lose which subclass was seen. The lib rejects `'I'`
and `'1'` with a message naming which is which and stating that **Ib is the original 2006 class I**; that
message is more useful to a caller than a permissive parse. Both the field label and the summary carry that
continuity, because an agent reading an older operative note or radiology report will encounter "EHIT 1" and
must map it to Ib rather than guessing.

**The summary refuses the Lawrence conflation explicitly.** A separate six-level system grades the same
complication, and its levels 1 through 3 **all** collapse into class I here. An agent that reads "level 3" as
"class III" would move a patient who needs no treatment into the therapeutic-anticoagulation band — the
single most consequential error available with this instrument. The per-class recommendations are returned,
because deciding about anticoagulation is the entire point of classifying an EHIT, but each carries its
published strength of evidence and is stated to be a suggestion rather than an order — and class IV's
recommendation is itself "individualize". The tool chooses no agent, dose, or duration. New adapter module
registered in `mcp/catalog.js`; its golden probe ("thrombus after endovenous vein ablation class") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1318 calculators
across 434 modules**.

### lib/ehit-v531.js
- `ehit`

## Three-hundred-fifty-fifth wave — the Vesikari clinical severity score in lib/vesikari-v530.js (+1)

`vesikari` (spec-v530) sums the seven Vesikari items into a total of 0-20 and bands the episode's severity.

**The enum value lists are per-item and two of them are irregular**, which is the design point of this wave.
Five items publish `['0','1','2','3']`; **dehydration** publishes `['0','2','3']` with no `'1'`, and
**treatment** publishes `['0','1','2']` with no `'3'`. A shared 0-3 vocabulary across all seven would let an
agent send a `1` for dehydration — a score the instrument does not define — or a `3` for treatment, which
would push the maximum to 23 and inflate every hospitalized child by a point. Generating the values from the
lib's per-item option lists makes both impossible at the schema layer rather than catching them later.

**The temperature field label says rectal-equivalent and gives the conversion**, because that is the most
common scoring error and an agent handed a chart temperature has no way to know the route mattered: an
axillary 38.5 °C is not a 2-point fever. The summary distinguishes this tool from three neighbors an agent
could otherwise conflate — the Gorelick and Clinical Dehydration scales (current dehydration, not the
episode), the 24-point norovirus modification, and the Schnadower modified score — all of which are called
something close enough to "Vesikari" or "dehydration score" that a caller could pick this one for the wrong
question. New adapter module registered in `mcp/catalog.js`; its golden probe ("vesikari gastroenteritis
severity score") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1317 calculators across 433 modules**.

### lib/vesikari-v530.js
- `vesikari`

## Three-hundred-fifty-fourth wave — the Thwaites diagnostic index in lib/thwaites-v529.js (+1)

`thwaites` (spec-v529) sums the five Thwaites features into a signed total and reports which of two diagnoses
it favors.

**The summary leads with the direction of the cut, and repeats it**, because this is the one score in the
catalog that reads **backwards**: a *low* total favors tuberculous meningitis. An agent applying the usual
"higher means more severe or more likely" heuristic to a Thwaites total does not get a vaguer answer — it
gets the **opposite diagnosis**. The compute result never returns a bare number either: `favors` is a word,
and the band states the direction in prose.

Each field's label carries its **signed** weight, including the **−5** on duration. An agent told only
"duration of illness 6 days or more: yes/no" would have no way to know that answering *yes* moves the score
five points toward tuberculous — the single largest movement any feature can produce, and the opposite of
what "more days of illness" suggests to a naive reader. All five are required: because one weight is
negative, an omitted feature is **not** equivalent to a "no", and a missing duration answer would leave out
the term that most often decides the result. The summary also states the two documented failure modes
(partially treated bacterial meningitis, HIV-positive adults) and the differential the rule cannot see,
because an agent reporting "Thwaites favors tuberculous meningitis" in a patient who has already had
antibiotics is in exactly the situation where the rule is least trustworthy. New adapter module registered in
`mcp/catalog.js`; its golden probe ("tuberculous versus bacterial meningitis score") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1316 calculators across 432 modules**.

### lib/thwaites-v529.js
- `thwaites`

## Three-hundred-fifty-third wave — the Oxford MEST-C classification in lib/mest-c-v528.js (+1)

`mest-c` (spec-v528) maps five IgA-nephropathy biopsy lesion scores to the MEST-C code.

**The result is a code, and the summary says so twice**, because an agent handed five small integers will
reach for a total almost by reflex. MEST-C is reported as its five scores side by side and is **not summed**;
the summed 0-7 grading with grades I-III is a research proposal, not the standard biopsy report. The compute
function returns `code` and a per-lesion breakdown and deliberately exposes **no total field**, so there is
nothing for a caller to add up even if it tried.

**The enum values are the full lesion labels (`'M0'`, `'M1'`, `'T2'`), not bare integers.** That is
deliberate: a bare 0/1/2 vocabulary shared across five fields would let a caller send a T-level to the M
field and have it silently accepted, and "1" means different things on M (binary) and T (0-2). Prefixed
values turn a misrouted score into a validation error rather than a wrong answer, and the lib rejects it by
name. The field labels carry each lesion's **denominator**, because T is a share of *cortical area* and C a
share of *glomeruli* — an agent that swapped them would produce a plausible, wrong code. The M label states
that the threshold is the mesangial hypercellularity **score** above 0.5, not a percentage of glomeruli,
since sources rendering M as a percentage disagree with each other at exactly 50%. New adapter module
registered in `mcp/catalog.js`; its golden probe ("oxford mest c iga nephropathy biopsy") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1315 calculators across 431
modules**.

### lib/mest-c-v528.js
- `mest-c`

## Three-hundred-forty-ninth wave — the Cornell Assessment of Pediatric Delirium in lib/capd-v525.js (+1)

`capd` (spec-v525) sums the eight CAPD observations into a total of 0-32 and compares it to the positive cut
of 9. The adapter's `fields` array is **generated** from the lib's exported `CAPD_ITEMS`, and each field label
embeds **that item's own anchor texts** — because the anchors are reversed by half: items 1-4 score
`never = 4` / `always = 0` and items 5-8 score `never = 0` / `always = 4`. A caller reading a generic "0 to 4"
schema would invert half the instrument and turn a well child into a positive screen, so the label is doing
real safety work here rather than documentation. Each item is an enum (`kind: 'enum'`, values `'0'`-`'4'`) on
dom keys `capd-q1` … `capd-q8` mapping to args `q1` … `q8`; all eight are in `META.example`, so all eight are
required for every caller: a partial CAPD has no total, and an unanswered item is not a zero on either half.
The example totals 12; that number is carried by the result band, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("cornell assessment of pediatric delirium capd") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1311 calculators across 427 modules**.

### lib/capd-v525.js
- `capd`

## Three-hundred-forty-eighth wave — the Scadding sarcoidosis stage in lib/scadding-v523.js (+1)

`scadding` (spec-v523) maps a chest-radiograph appearance to one of the five Scadding stages. The enum
values are the canonical `'0'`, `'I'`, `'II'`, `'III'`, `'IV'`; the lib also accepts `'1'`-`'4'` and
lowercase, but the adapter publishes only the canonical forms so an agent reading the schema emits what the
source uses.

The field label carries **each stage's defining radiographic features**, not just the numeral, because the
distinction that matters most is invisible in the numbering: stage II is adenopathy **with** infiltrates and
stage III is infiltrates **without** adenopathy. An agent handed a bare "0-IV" would have no way to know that
III is not II plus more, and would be likely to read the sequence as a severity ramp. The summary states all
three readings the numbering invites and the tile refuses — not a progression, not a measure of lung
function, not reliable between readers — plus the extrathoracic blind spot, because an agent summarizing
"stage IV sarcoidosis" is exactly where a claim about lung function or prognosis would otherwise get
invented. **No remission percentage is attached to any stage**, only the direction reported across cohorts.
New adapter module registered in `mcp/catalog.js`; its golden probe ("scadding stage sarcoidosis chest xray")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1310 calculators
across 426 modules**.

### lib/scadding-v523.js
- `scadding`

## Three-hundred-forty-seventh wave — the Pediatric Crohn's Disease Activity Index in lib/pcdai-v522.js (+1)

`pcdai` (spec-v522) scores the eleven PCDAI items into a total of 0-100 and bands the activity. The eight
clinical `fields` are **generated** from the lib's exported `PCDAI_ITEMS`, so each label carries that item's
own three option texts. Their enum values are `'0'`, `'5'`, `'10'` — the **point values**, not a 0/1/2
ordinal — because the PCDAI's weights are not uniform and a 0/1/2 ordinal would invite a caller to send a 2
meaning "severe" and have it scored as two points instead of ten.

**The three labs are numbers, not pre-scored enums, and that is deliberate.** The lib applies the published
thresholds itself, which keeps the two facts a caller most often gets wrong out of the caller's hands.
**Hematocrit has no single cut** — the threshold depends on age and sex, so `pcd-hctBand` is a **required**
enum generated from the lib's `HCT_BANDS`, with every band's three thresholds spelled out in its label; a
hematocrit of 34 is 0 points in a girl of 12 and 2.5 in a boy of 12, and asking for the raw value plus the
band is the only way an agent gets that right. **Albumin scores 0/5/10 while hematocrit and ESR score
0/2.5/5**, so publishing the labs as pre-scored enums would hand a caller three "lab" fields that look
interchangeable and are not; the albumin field's label says so outright. The result returns the per-lab
points alongside the total so a caller can show its work. The example scores 35 (moderate to severe); that
number and the activity band are carried by the result band, so it flows through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("pediatric crohn
disease activity index") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1309 calculators across 425 modules**.

### lib/pcdai-v522.js
- `pcdai`

## Three-hundred-forty-sixth wave — the Primary Care PTSD Screen for DSM-5 in lib/pc-ptsd5-v521.js (+1)

`pc-ptsd5` (spec-v521) sums the five PC-PTSD-5 items into a total of 0-5 and reports it against both
published cut points. **The `required` flags encode the instrument's gate, and that is the design point of
this wave.** Only `pcp-trauma` is marked required. The five symptom items are **not**, because when no
traumatic event is reported the source is explicit that the screen is complete with a score of 0 and the five
items are never asked - every one of them refers to "the event(s)". A caller reporting no trauma can
therefore compute a valid, finished, negative result from **one** input instead of being forced to invent
five answers to questions that presuppose a trauma the patient has not reported. When trauma **is** reported,
the lib itself requires all five and names what is missing, so nothing is silently scored as a no. The two
cut points are both reported rather than collapsed into a bare positive/negative: 3 is optimally sensitive, 4
is optimally efficient, and a total of exactly 3 is where they disagree - an agent that needs one answer
should be told which threshold it is applying. Dom keys `pcp-trauma` and `pcp-q1` … `pcp-q5` map to the lib
args `trauma` and `q1` … `q5`. The example scores 4; that number and both cut points are carried by the
result band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("primary care ptsd screen five questions") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1308 calculators across 424
modules**.

### lib/pc-ptsd5-v521.js
- `pc-ptsd5`

## Three-hundred-forty-fifth wave — the Spigelman duodenal-polyposis stage in lib/spigelman-v520.js (+1)

`spigelman` (spec-v520) sums the four Spigelman parameters into a total of 4-12, assigns the stage, and
returns the standard severity reading of that stage. The adapter's `fields` array is **generated** from the
lib's exported `SPIGELMAN_ITEMS`, so each field's label carries that parameter's own point rows. The enum
values are `'1'`, `'2'`, `'3'` with **no zero on any field** — not an omission: the Spigelman table has no
zero row, so once any adenoma is present the lowest reachable total is 4, and stage 0 means no duodenal
adenomas were found at all. A caller that passes 0 gets an explicit invalid result saying so rather than a
silently deflated stage. The **dysplasia** labels carry both the original mild/moderate/severe wording and
the two-tiered low-grade / high-grade equivalent, because a caller reading a modern pathology report will not
find "moderate" in it and would otherwise have to guess which end to map to. Dom keys `spig-number`,
`spig-size`, `spig-histology`, and `spig-dysplasia` map to the lib args `number`, `size`, `histology`, and
`dysplasia`; all four are in `META.example`, so all four are required. The example scores 12 (stage IV); the
total, the stage, and the severity reading are all carried by the result band, so it flows through the
default `makeToArgs` with no custom toArgs. The tool deliberately emits **no surveillance interval**. New
adapter module registered in `mcp/catalog.js`; its golden probe ("spigelman stage duodenal polyposis") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1307 calculators
across 423 modules**.

### lib/spigelman-v520.js
- `spigelman`

## Three-hundred-forty-fourth wave — the Eckardt achalasia symptom score in lib/eckardt-v519.js (+1)

`eckardt` (spec-v519) sums the four achalasia symptoms into a total of 0-12, assigns the stage, and reports
whether the total falls in the remission range. The adapter's `fields` array is **generated** from the lib's
exported `ECKARDT_ITEMS`, so each field's label carries **that item's own option wording** — three items are
scored by **frequency** (none / occasional / daily / at every meal) and the fourth by an **amount in
kilograms** (none / under 5 / 5-10 / over 10). A caller handed one shared set of anchors would be answering
how often the patient lost weight, which is exactly the misread the tile exists to prevent. Dom keys
`eck-dysphagia`, `eck-regurgitation`, `eck-chestPain`, and `eck-weightLoss` map to the lib args of the same
name; all four are in `META.example`, so all four are required for every caller: a partial Eckardt score has
no total. The example scores 8 (stage III); the total, the stage, and the remission reading are all carried
by the result band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("eckardt score achalasia symptoms") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1306 calculators across 422 modules**.

### lib/eckardt-v519.js
- `eckardt`

## Three-hundred-forty-third wave — the Childhood Asthma Control Test in lib/childhood-act-v518.js (+1)

`childhood-act` (spec-v518) sums the four child items and three caregiver items into a total of 0-27 and bands
it. The adapter's `fields` array is **generated** from the lib's exported `CHILD_ITEMS` and `PARENT_ITEMS`,
and the two groups get **different enum value lists** — `'0'`-`'3'` for the child items, `'0'`-`'5'` for the
caregiver items. A single shared enum would let a 4 or 5 through on a child item and silently inflate the
total. Each field label names **who answers it**, because one tool call mixes a child-reported and a
caregiver-reported instrument. Dom keys `cact-c1` … `cact-c4` and `cact-p1` … `cact-p3` map to args `c1` …
`c4` and `p1` … `p3`; all seven are in `META.example`, so all seven are required for every caller: a partial
c-ACT has no total. The example scores 17; that number and both subtotals are carried by the result band, so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("childhood asthma control test for a child") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1305 calculators across 421 modules**.

### lib/childhood-act-v518.js
- `childhood-act`

## Three-hundred-forty-second wave — the Premature Infant Pain Profile in lib/pipp-v517.js (+1)

`pipp` (spec-v517) sums the seven PIPP indicators into a total of 0-21 and reports the contextual subtotal
alongside it. The adapter's `fields` array is **generated** from the lib's exported `PIPP_INDICATORS`, each
field label carrying that indicator's own option texts. Every indicator is an enum (`kind: 'enum'`, values
`'0'`-`'3'`) on dom keys `pp-ga`, `pp-state`, `pp-hr`, `pp-spo2`, `pp-brow`, `pp-squeeze`, `pp-furrow`,
mapping to args of the same short name. All seven are in `META.example`, so all seven are required for every
caller — and that matters more here than on a plain questionnaire: the two contextual indicators are scored
**before** the procedure, so a caller holding only the observed facial and physiologic response does not have
a PIPP at all, and defaulting gestational age or behavioral state to 0 would systematically under-score
exactly the infants the instrument exists to protect. The example totals 13; that number and the contextual
subtotal are carried by the result band, so it flows through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("premature infant pain profile pipp") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1304 calculators
across 420 modules**.

### lib/pipp-v517.js
- `pipp`

## Three-hundred-forty-first wave — the Asthma Control Test in lib/asthma-control-test-v516.js (+1)

`asthma-control-test` (spec-v516) sums the five ACT items into a total of 5-25 and bands it. The adapter's
`fields` array is **generated** from the lib's exported `ACT_ITEMS`, and each field label carries that item's
**own anchor wording** — because `5` means "none of the time" on item 1 and "not at all" on item 2, a generic
1-5 label would lose the instrument. Each item is an enum (`kind: 'enum'`, values `'1'`-`'5'`) on dom keys
`act-q1` … `act-q5` mapping to args `q1` … `q5`. Note the range starts at **1, not 0**: that is the one thing
a caller used to 0-based instruments gets wrong, and the enum makes `0` an invalid value rather than a
silently accepted floor. All five are in `META.example`, so all five are required for every caller: a partial
ACT has no total. The example scores 17; that number and the band are carried by the result band, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("asthma control test act score") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1303 calculators across 419 modules**.

### lib/asthma-control-test-v516.js
- `asthma-control-test`

## Three-hundred-fortieth wave — the Simpson-Angus Scale in lib/simpson-angus-v515.js (+1)

`simpson-angus` (spec-v515) rates ten examination items 0-4 for drug-induced parkinsonism. The adapter's
`fields` array is **generated** from the lib's exported `SAS_ITEMS`, so the renderer, the adapter labels, and
the tests all share one source of item wording. Each item is an enum (`kind: 'enum'`, values `'0'`-`'4'`) on
dom keys `sa-q1` … `sa-q10` mapping to args `q1` … `q10`; all ten are in `META.example`, so all ten are
required for every caller — correct here because the reported figure is a **mean**: an omitted item would
change the denominator silently, which is worse than refusing to answer. The example gives a mean of 0.80 on a
total of 8, and the result band carries **both** numbers deliberately, since quoting the total where a mean is
expected is a ten-fold error. Flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("simpson angus drug induced parkinsonism") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1302 calculators across 418
modules**.

### lib/simpson-angus-v515.js
- `simpson-angus`

## Three-hundred-thirty-ninth wave — the Young Mania Rating Scale in lib/ymrs-v514.js (+1)

`ymrs` (spec-v514) sums the eleven YMRS items into a total of 0-60. The adapter's `fields` array is
**generated** from the lib's exported `YMRS_ITEMS`, so the renderer, the adapter labels, and the per-item
maxima all come from one place. Each item is an enum on dom keys `ym-q1` … `ym-q11` mapping to args `q1` …
`q11`, but **not the same enum**: the seven 0-4 items and the four 0-8 items get their own value lists. That
is the whole point of exposing it — a caller that assumed one shared 0-4 scale would silently cap
irritability, speech, thought content, and disruptive or aggressive behavior at half their real weight, and
each field label carries its own range. All eleven are in `META.example`, so all eleven are required for every
caller. The example totals 24; that number, the 60 ceiling, and the double-weighted subtotal are carried by
the result band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("young mania rating scale ymrs") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1301 calculators across 417 modules**.

### lib/ymrs-v514.js
- `ymrs`

## Three-hundred-thirty-eighth wave — the ASRS v1.1 Part A adult ADHD screener in lib/asrs-v513.js (+1)

`asrs` (spec-v513) applies the ASRS Part A counting rule: six items on one 0-4 scale, but items 1-3 count at
*sometimes* or more and items 4-6 only at *often* or more, with 4 or more counting answers positive. The
adapter's `fields` array is **generated** from the lib's exported `ASRS_ITEMS` and `FREQUENCY_SCALE`, so the
renderer, the adapter labels, and the thresholds all come from one place. Each item is an enum
(`kind: 'enum'`, values `'0'`-`'4'`) on dom keys `as-q1` … `as-q6` mapping to args `q1` … `q6`, and **each
field label states that item's own threshold** — so a caller reading only the tool schema still cannot mistake
the screen for a sum. All six are in `META.example`, so all six are required for every caller: an omitted item
cannot be defaulted here, because the same answer counts on items 1-3 and does not on items 4-6. The example
counts 5 of 6; that number and the raw total are carried by the result band, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("asrs
adult adhd screener part a") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1300 calculators across 416 modules**.

### lib/asrs-v513.js
- `asrs`

## Three-hundred-thirty-seventh wave — the Vaizey (St Marks) fecal incontinence score in lib/vaizey-v512.js (+1)

`vaizey` (spec-v512) sums the four 0-4 frequency rows and the three weighted yes/no rows into a total of 0-24.
The adapter's `fields` array is **generated** from the lib's exported `FREQUENCY_ROWS`, `FREQUENCY_SCALE`, and
`YES_NO_ROWS`, so the renderer, the adapter labels, and the point weights all come from one place. Every field
is an enum (`kind: 'enum'`) on dom keys `vz-solid`, `vz-liquid`, `vz-gas`, `vz-lifestyle`, `vz-pad`,
`vz-meds`, `vz-defer`, each mapping to the lib arg of the same short name; all seven are in `META.example`, so
all seven are required for every caller — correct for a summed instrument, and specifically because an
**unanswered** added row is not a no: omitting `vz-defer` would silently drop 4 points. The example scores 15;
that number, the two subtotals, and the 24 ceiling are carried by the result band, so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("vaizey st marks fecal incontinence score") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1299 calculators across 415 modules**.

### lib/vaizey-v512.js
- `vaizey`

## Three-hundred-thirty-sixth wave — the CRAFFT adolescent substance-use screen in lib/crafft-v511.js (+1)

`crafft` (spec-v511) sums the six CRAFFT items into a total of 0-6 and compares it to the validated positive
cut point of 2. The adapter's `fields` array is **generated** from the lib's exported `CRAFFT_ITEMS`, so the
renderer, the adapter labels, and the tests all share one source of item wording. Each item is an enum
(`kind: 'enum'`, values `'no'` / `'yes'`) on dom keys `cf-q1` … `cf-q6` mapping to args `q1` … `q6`; all six
are in `META.example`, so all six are required for every caller — correct here, because a partial CRAFFT has
no total and an **unanswered** item is not a no. The example scores 3; that number and the cut point are
carried by the result band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("crafft adolescent substance use screen") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1298 calculators across 414
modules**.

### lib/crafft-v511.js
- `crafft`

## Three-hundred-thirty-fifth wave — the Banff acute T cell-mediated rejection grade in lib/banff-tcmr-v510.js (+1)

`banff-tcmr` (spec-v510) reads the Banff category of acute T cell-mediated rejection from the three lesion
scores a pathologist has already assigned: interstitial inflammation (i), tubulitis (t), and intimal arteritis
(v). The adapter's `fields` array is **generated** from the lib's exported `LESIONS`, so the renderer, the
adapter labels, and the tests all share one source of wording. Each score is an enum (`kind: 'enum'`, values
`'0'`-`'3'`) on dom keys `bf-i`, `bf-t`, `bf-v` mapping to args `i`, `t`, `v`; all three are in `META.example`,
so all three are required for every caller — correct here, because the category is a **joint** rule over the
three scores and a missing one changes the answer (a caller who omits `v` cannot be told IIA). The example is
i2 t2 v0, grade IA; the category and the lesion scores are carried by the result band, so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("banff grade t cell mediated rejection tubulitis") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1297 calculators across 413 modules**.

### lib/banff-tcmr-v510.js
- `banff-tcmr`

## Three-hundred-thirty-fourth wave — the Sunnybrook Facial Grading System in lib/sunnybrook-facial-v509.js (+1)

`sunnybrook-facial` (spec-v509) grades facial nerve function on three axes and subtracts: resting symmetry
(points × 5), five voluntary expressions each 1-5 (× 4), and synkinesis on those same expressions (0-3), for a
composite anchored at 0 (complete flaccid paralysis) and 100 (normal symmetry). The adapter's `fields` array is
**generated** from the lib's exported `REST_ITEMS`, `EXPRESSIONS`, `MOVEMENT_SCALE`, and `SYNKINESIS_SCALE`, so
the renderer, the adapter labels, and the tests all share one source of wording. Every field is an enum
(`kind: 'enum'`) on dom keys `sb-rest-eye` / `sb-rest-cheek` / `sb-rest-mouth`, `sb-m1` … `sb-m5`, and `sb-s1`
… `sb-s5`, mapping to args `eye` / `cheek` / `mouth`, `m1` … `m5`, and `s1` … `s5`; all thirteen are in
`META.example`, so all thirteen are required for every caller — correct here, because the composite is a
subtraction across three axes and a partial exam has no composite. The example scores 52; that number and the
0 / 100 anchors are carried by the result band, so it flows through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("sunnybrook facial grading
composite synkinesis") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1296 calculators across 412 modules**.

### lib/sunnybrook-facial-v509.js
- `sunnybrook-facial`

## Three-hundred-thirty-third wave — the Voice Handicap Index-10 in lib/vhi10-v508.js (+1)

`vhi10` (spec-v508) sums the ten VHI-10 items into a total of 0-40 and compares it to the commonly cited
abnormal threshold of 11. The adapter's `fields` array is **generated** from the lib's exported `VHI10_ITEMS`,
so the renderer, the adapter labels, and the tests all share one source of item wording. Each item is an enum
(`kind: 'enum'`, values `'0'`-`'4'`) on dom keys `vhi-q1` … `vhi-q10` mapping to args `v1` … `v10`; all ten are
in `META.example`, so all ten are required for every caller — correct here, because a partial VHI-10 has no
total. The example answers total 18; that number and the 40 ceiling are carried by the result band, so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("voice handicap index vhi 10 score") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1295 calculators across 411 modules**.

> Wave 332 was used by the `hearing-loss-degree` adapter, reverted the same day as a duplicate of the existing
> `pure-tone-average` tile. That wave number is retired rather than reused.

### lib/vhi10-v508.js
- `vhi10`

## Three-hundred-thirty-first wave — the Jerger tympanogram type in lib/jerger-tympanogram-v506.js (+1)

`jerger-tympanogram` (spec-v506) applies the Jerger classification of tympanogram shapes: given the type, it
reports the shape description. `type` is an enum (`kind: 'enum'`, values A/As/Ad/B/C) — the single input the
renderer exposes; the mixed-case two-letter values are what the renderer emits, and the lib uppercases before
lookup so `as` / `AD` also resolve. The example sets type B; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. First
tympanometry tile in the registry. New adapter module registered in `mcp/catalog.js`; its golden probe
("jerger tympanogram type tympanometry") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1294 calculators across 410 modules**.

### lib/jerger-tympanogram-v506.js
- `jerger-tympanogram`

## Three-hundred-thirtieth wave — the METAVIR activity grade (liver biopsy) in lib/metavir-activity-v505.js (+1)

`metavir-activity` (spec-v505) applies the METAVIR necroinflammatory activity grading: given the grade, it
reports the description. `grade` is an enum (`kind: 'enum'`, values A0-A3) — the single input the renderer
exposes, on a dom key (`metavir-activity-grade`) deliberately distinct from the sibling fibrosis tile's
`metavir-stage`. The example sets grade A2; the only numbers in its expected text are the grade labels
themselves, which the result band carries, so it flows through the default `makeToArgs` with no custom toArgs.
Completes the METAVIR pair with `metavir-fibrosis` (wave 329) — a METAVIR read is reported as both together
(for example A2F3). New adapter module registered in `mcp/catalog.js`; its golden probe ("metavir activity
grade necroinflammatory") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1293 calculators across 409 modules**.

### lib/metavir-activity-v505.js
- `metavir-activity`

## Three-hundred-twenty-ninth wave — the METAVIR fibrosis stage (liver biopsy) in lib/metavir-fibrosis-v504.js (+1)

`metavir-fibrosis` (spec-v504) applies the METAVIR histologic staging of liver fibrosis: given the stage, it
reports the histologic description. `stage` is an enum (`kind: 'enum'`, values F0-F4) — the single input the
renderer exposes. The example sets stage F2; the only numbers in its expected text are the stage labels
themselves, which the result band carries, so it flows through the default `makeToArgs` with no custom toArgs.
Complements the already-exposed `fib4`, which estimates the same fibrosis non-invasively. New adapter module
registered in `mcp/catalog.js`; its golden probe ("metavir fibrosis stage liver biopsy") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1292 calculators across 408 modules**.

### lib/metavir-fibrosis-v504.js
- `metavir-fibrosis`

## Three-hundred-twenty-eighth wave — the Simpson grade (meningioma resection) in lib/simpson-meningioma-v503.js (+1)

`simpson-meningioma` (spec-v503) applies the Simpson grade of meningioma resection completeness: given the
grade, it reports the resection description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the
single input the renderer exposes. The example sets grade II; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("simpson grade meningioma resection") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1291 calculators across 407
modules**.

### lib/simpson-meningioma-v503.js
- `simpson-meningioma`

## Three-hundred-twenty-seventh wave — the Norwood scale (male-pattern hair loss) in lib/norwood-hairloss-v502.js (+1)

`norwood-hairloss` (spec-v502) applies the Norwood (Hamilton-Norwood) scale of male-pattern hair loss: given
the stage, it reports the recession / vertex description. `stage` is an enum (`kind: 'enum'`, values I..VII
plus `III vertex`) — the single input the renderer exposes. The example sets stage IV; its expected text
carries no numeric facts (the description is word-only), so it flows through the default `makeToArgs` with no
custom toArgs. Completes the pattern-hair-loss pair with `ludwig-hairloss` (the female pattern). New adapter
module registered in `mcp/catalog.js`; its golden probe ("norwood male pattern hair loss stage") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1290 calculators across 406
modules**.

### lib/norwood-hairloss-v502.js
- `norwood-hairloss`

## Three-hundred-twenty-sixth wave — the Ludwig scale (female-pattern hair loss) in lib/ludwig-hairloss-v501.js (+1)

`ludwig-hairloss` (spec-v501) applies the Ludwig scale of female-pattern hair loss: given the grade, it reports
the crown-thinning description. `grade` is an enum (`kind: 'enum'`, values I/II/III) — the single input the
renderer exposes. The example sets grade II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("ludwig female pattern hair loss grade") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1289 calculators across 405 modules**.

### lib/ludwig-hairloss-v501.js
- `ludwig-hairloss`

## Three-hundred-twenty-fifth wave — the Tegner activity scale (knee) in lib/tegner-activity-v500.js (+1)

`tegner-activity` (spec-v500) applies the Tegner activity scale: given the level, it reports the work / sport
anchors. `level` is an enum (`kind: 'enum'`, values `'0'`-`'10'`) — the single input the renderer exposes.
The example sets level 5; the only number in its expected text is the level itself, which the result band
carries, so it flows through the default `makeToArgs` with no custom toArgs. Completes the Tegner-Lysholm
pair: `lysholm-knee-score` was already exposed, and the two are reported together. New adapter module
registered in `mcp/catalog.js`; its golden probe ("tegner activity scale knee level") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1288 calculators across 404 modules**.

### lib/tegner-activity-v500.js
- `tegner-activity`

## Three-hundred-twenty-fourth wave — the Dorr classification (proximal femoral morphology) in lib/dorr-femur-v499.js (+1)

`dorr-femur` (spec-v499) applies the Dorr classification of proximal femoral bone morphology: given the type,
it reports the cortical / canal description. `type` is an enum (`kind: 'enum'`, values A/B/C) — the single
input the renderer exposes. The example sets type B; the canal-to-calcar cut points in its expected text (0.5,
0.75) are carried by the result band, so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("dorr type proximal femoral morphology") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1287 calculators
across 403 modules**.

### lib/dorr-femur-v499.js
- `dorr-femur`

## Three-hundred-twenty-third wave — the Narakas classification (obstetric brachial plexus palsy) in lib/narakas-obpp-v498.js (+1)

`narakas-obpp` (spec-v498) applies the Narakas classification of obstetric brachial plexus palsy: given the
group, it reports the root-involvement description. `group` is an enum (`kind: 'enum'`, values I/II/III/IV) —
the single input the renderer exposes. The example sets group II; the root labels in its expected text (C5-C7)
are carried verbatim by the result band, so it flows through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("narakas group obstetric brachial plexus
palsy") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1286
calculators across 402 modules**.

### lib/narakas-obpp-v498.js
- `narakas-obpp`

## Three-hundred-twenty-second wave — the Schobinger staging (peripheral AVM) in lib/schobinger-avm-v497.js (+1)

`schobinger-avm` (spec-v497) applies the Schobinger clinical staging of a peripheral arteriovenous
malformation: given the stage, it reports the clinical description. `stage` is an enum (`kind: 'enum'`, values
I/II/III/IV) — the single input the renderer exposes. Because the staging is cumulative, each band names the
stage below it. The example sets stage II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("schobinger stage peripheral arteriovenous malformation") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1285 calculators across 401
modules**.

### lib/schobinger-avm-v497.js
- `schobinger-avm`

## Three-hundred-twenty-first wave — the Lodwick grade (bone lesion aggressiveness) in lib/lodwick-grade-v496.js (+1)

`lodwick-grade` (spec-v496) applies the Lodwick grading of a focal bone lesion: given the grade, it reports the
margin / destruction-pattern description. `grade` is an enum (`kind: 'enum'`, values IA/IB/IC/II/III) — the
single input the renderer exposes; bare `I` is deliberately absent from the enum because it is ambiguous across
IA/IB/IC. The example sets grade IC; its expected text carries no numeric facts (the description is word-only),
so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("lodwick grade bone lesion aggressiveness") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1284 calculators across 400 modules**.

### lib/lodwick-grade-v496.js
- `lodwick-grade`

## Three-hundred-twentieth wave — the Ranawat classification (rheumatoid cervical myelopathy) in lib/ranawat-myelopathy-v495.js (+1)

`ranawat-myelopathy` (spec-v495) applies the Ranawat classification of the rheumatoid cervical spine: given the
class, it reports the neurologic-deficit description. `klass` is an enum (`kind: 'enum'`, values I/II/IIIA/IIIB)
— the single input the renderer exposes; bare `III` is deliberately absent from the enum so the ambulation
split stays explicit. The example sets class IIIA; its expected text carries no numeric facts (the description
is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("ranawat class rheumatoid cervical myelopathy") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1283 calculators across 399
modules**.

### lib/ranawat-myelopathy-v495.js
- `ranawat-myelopathy`

## Three-hundred-nineteenth wave — the INTERMACS profile (advanced heart failure) in lib/intermacs-profile-v494.js (+1)

`intermacs-profile` (spec-v494) applies the INTERMACS profiles of advanced heart failure: given the profile, it
reports the clinical-severity description. `profile` is an enum (`kind: 'enum'`, values 1-7) — the single input
the renderer exposes. The example sets profile 3; the numbers in its expected text are carried by the result
band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("intermacs profile advanced heart failure") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1282 calculators across 398 modules**.

### lib/intermacs-profile-v494.js
- `intermacs-profile`

## Three-hundred-eighteenth wave — the Lown grade (ventricular ectopy) in lib/lown-ectopy-v493.js (+1)

`lown-ectopy` (spec-v493) applies the Lown grading system for ventricular ectopy on an ambulatory ECG
recording: given the grade, it reports the frequency/form description. `grade` is an enum (`kind: 'enum'`,
values 0/1/2/3/4A/4B/5) — the single input the renderer exposes; bare `4` is deliberately absent from the
enum so the 4A/4B split stays explicit. The example sets grade 4B; the numbers in its expected text are
carried by the result band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("lown grade ventricular ectopy holter") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1281 calculators across 397
modules**.

### lib/lown-ectopy-v493.js
- `lown-ectopy`

## Three-hundred-seventeenth wave — the Hattrup-Johnson grade (hallux rigidus) in lib/hattrup-johnson-v492.js (+1)

`hattrup-johnson` (spec-v492) applies the Hattrup-Johnson classification of hallux rigidus (first MTP
osteoarthritis): given the grade, it reports the osteophyte/joint-space description. `grade` is an enum
(`kind: 'enum'`, values I/II/III) — the single input the renderer exposes. The example sets grade II; its
expected text carries no numeric facts (the description is word-only), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("hattrup johnson hallux rigidus grade") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1280 calculators across 395 modules**.

### lib/hattrup-johnson-v492.js
- `hattrup-johnson`

## Three-hundred-sixteenth wave — the Severin classification (DDH radiographic outcome) in lib/severin-ddh-v491.js (+1)

`severin-ddh` (spec-v491) applies the Severin classification: given the group, it reports the hip-congruency
description. `group` is an enum (`kind: 'enum'`, values I..VI) — the single input the renderer exposes. The
example sets group II; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("severin ddh radiographic outcome classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1279 calculators across 395 modules**.

### lib/severin-ddh-v491.js
- `severin-ddh`

## Three-hundred-fifteenth wave — the Ruedi-Allgower classification (tibial pilon fracture) in lib/ruedi-allgower-pilon-v490.js (+1)

`ruedi-allgower-pilon` (spec-v490) applies the Ruedi-Allgower classification: given the type, it reports the
displacement / comminution description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input
the renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("ruedi allgower tibial pilon fracture classification") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1278 calculators across 394 modules**.

### lib/ruedi-allgower-pilon-v490.js
- `ruedi-allgower-pilon`

## Three-hundred-fourteenth wave — the Fernandez classification (distal radius fracture) in lib/fernandez-radius-v489.js (+1)

`fernandez-radius` (spec-v489) applies the Fernandez classification: given the type, it reports the mechanism
description. `type` is an enum (`kind: 'enum'`, values I..V) — the single input the renderer exposes. The
example sets type I; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("fernandez distal radius fracture classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1277 calculators across 393 modules**.

### lib/fernandez-radius-v489.js
- `fernandez-radius`

## Three-hundred-thirteenth wave — the Bigliani classification (acromion morphology) in lib/bigliani-acromion-v488.js (+1)

`bigliani-acromion` (spec-v488) applies the Bigliani classification: given the type, it reports the
acromial-undersurface description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input the
renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("bigliani acromion morphology classification") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1276 calculators across 392 modules**.

### lib/bigliani-acromion-v488.js
- `bigliani-acromion`

## Three-hundred-twelfth wave — the Rockwood classification (acromioclavicular joint injury) in lib/rockwood-ac-v487.js (+1)

`rockwood-ac` (spec-v487) applies the Rockwood classification: given the type, it reports the
ligament-injury / displacement description. `type` is an enum (`kind: 'enum'`, values I..VI) — the single input
the renderer exposes. The example sets type III; its expected text carries the "25% to 100%" fact, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("rockwood acromioclavicular joint injury classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1275 calculators across 391 modules**.

### lib/rockwood-ac-v487.js
- `rockwood-ac`

## Three-hundred-eleventh wave — the Samilson-Prieto grade (shoulder dislocation arthropathy) in lib/samilson-prieto-v486.js (+1)

`samilson-prieto` (spec-v486) applies the Samilson-Prieto classification: given the grade, it reports the
osteophyte-size description. `grade` is an enum (`kind: 'enum'`, values mild/moderate/severe) — the single input
the renderer exposes. The example sets moderate; its expected text carries the "3 to 7 mm" fact, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("samilson prieto shoulder dislocation arthropathy") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1274 calculators across 390 modules**.

### lib/samilson-prieto-v486.js
- `samilson-prieto`

## Three-hundred-tenth wave — the Dejour classification (trochlear dysplasia) in lib/dejour-trochlea-v485.js (+1)

`dejour-trochlea` (spec-v485) applies the Dejour classification: given the type, it reports the
trochlear-morphology description. `type` is an enum (`kind: 'enum'`, values A/B/C/D) — the single input the
renderer exposes. The example sets type B; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("dejour trochlear dysplasia classification") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1273 calculators across 389 modules**.

### lib/dejour-trochlea-v485.js
- `dejour-trochlea`

## Three-hundred-ninth wave — the Barrack grade (femoral cement mantle) in lib/barrack-cement-v484.js (+1)

`barrack-cement` (spec-v484) applies the Barrack classification: given the grade, it reports the
cement-mantle-quality description. `grade` is an enum (`kind: 'enum'`, values A/B/C/D) — the single input the
renderer exposes. The example sets grade C; its expected text carries the "50% to 99%" fact, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("barrack femoral cement mantle grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1272 calculators across 388 modules**.

### lib/barrack-cement-v484.js
- `barrack-cement`

## Three-hundred-eighth wave — the Vancouver classification (periprosthetic femoral fracture) in lib/vancouver-periprosthetic-v483.js (+1)

`vancouver-periprosthetic` (spec-v483) applies the Vancouver classification: given the type, it reports the
location / stem-stability description. `type` is an enum (`kind: 'enum'`, values AG/AL/B1/B2/B3/C) — the single
input the renderer exposes. The example sets type B2; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("vancouver periprosthetic femoral fracture
classification") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1271 calculators across 387 modules**.

### lib/vancouver-periprosthetic-v483.js
- `vancouver-periprosthetic`

## Three-hundred-seventh wave — the Russell-Taylor classification (subtrochanteric fracture) in lib/russell-taylor-subtroch-v482.js (+1)

`russell-taylor-subtroch` (spec-v482) applies the Russell-Taylor classification: given the type, it reports the
piriformis-fossa / lesser-trochanter description. `type` is an enum (`kind: 'enum'`, values IA/IB/IIA/IIB) — the
single input the renderer exposes. The example sets type IA; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("russell taylor subtrochanteric fracture classification") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1270 calculators
across 386 modules**.

### lib/russell-taylor-subtroch-v482.js
- `russell-taylor-subtroch`

## Three-hundred-sixth wave — the Wiltse classification (spondylolisthesis) in lib/wiltse-spondylolisthesis-v481.js (+1)

`wiltse-spondylolisthesis` (spec-v481) applies the Wiltse-Newman-Macnab classification: given the type, it
reports the etiology description. `type` is an enum (`kind: 'enum'`, values I..V) — the single input the
renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("wiltse spondylolisthesis classification") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1269 calculators across 385 modules**.

### lib/wiltse-spondylolisthesis-v481.js
- `wiltse-spondylolisthesis`

## Three-hundred-fifth wave — the Ahlback grade (knee osteoarthritis) in lib/ahlback-knee-oa-v480.js (+1)

`ahlback-knee-oa` (spec-v480) applies the Ahlback classification: given the grade, it reports the
joint-space/attrition description. `grade` is an enum (`kind: 'enum'`, values I..V) — the single input the
renderer exposes. The example sets grade III; its expected text carries the "0 to 5 mm" fact, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("ahlback knee osteoarthritis grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1268 calculators across 384 modules**.

### lib/ahlback-knee-oa-v480.js
- `ahlback-knee-oa`

## Three-hundred-fourth wave — the Spitz classification (esophageal atresia) in lib/spitz-atresia-v479.js (+1)

`spitz-atresia` (spec-v479) applies the Spitz classification: given the group, it reports the birth-weight /
cardiac criteria. `group` is an enum (`kind: 'enum'`, values I/II/III) — the single input the renderer exposes.
The example sets group II; its expected text carries the "1500 g" fact, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("spitz
esophageal atresia classification") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1267 calculators across 383 modules**.

### lib/spitz-atresia-v479.js
- `spitz-atresia`

## Three-hundred-third wave — the Spaulding classification (device reprocessing) in lib/spaulding-classification-v478.js (+1)

`spaulding-classification` (spec-v478) applies the Spaulding classification: given the category, it reports the
required reprocessing. `category` is an enum (`kind: 'enum'`, values critical/semicritical/noncritical) — the
single input the renderer exposes. The example sets semicritical; its expected text carries no numeric facts
(the description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("spaulding device reprocessing classification") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1266 calculators
across 382 modules**.

### lib/spaulding-classification-v478.js
- `spaulding-classification`

## Three-hundred-second wave — the SFU grade (hydronephrosis) in lib/sfu-hydronephrosis-v477.js (+1)

`sfu-hydronephrosis` (spec-v477) applies the SFU grading: given the grade, it reports the dilatation
description. `grade` is an enum (`kind: 'enum'`, values 0-4) — the single input the renderer exposes. The
example sets grade 2; its expected text carries no numeric facts beyond the word-only description, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("sfu hydronephrosis grade") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1265 calculators across 381 modules**.

### lib/sfu-hydronephrosis-v477.js
- `sfu-hydronephrosis`

## Three-hundred-first wave — the Nash-Moe grade (vertebral rotation) in lib/nash-moe-rotation-v476.js (+1)

`nash-moe-rotation` (spec-v476) applies the Nash-Moe grading: given the grade, it reports the
convex-pedicle-position description. `grade` is an enum (`kind: 'enum'`, values 0-4) — the single input the
renderer exposes. The example sets grade 2; its expected text carries no numeric facts beyond the word-only
description, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("nash moe vertebral rotation grade") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1264 calculators across 380 modules**.

### lib/nash-moe-rotation-v476.js
- `nash-moe-rotation`

## Three-hundredth wave — the Glogau classification (photoaging) in lib/glogau-photoaging-v475.js (+1)

`glogau-photoaging` (spec-v475) applies the Glogau classification: given the type, it reports the
photoaging-severity description. `type` is an enum (`kind: 'enum'`, values I..IV) — the single input the
renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("glogau photoaging classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1263 calculators across 379 modules** — the three-hundredth
MCP wave.

### lib/glogau-photoaging-v475.js
- `glogau-photoaging`

## Two-hundred-ninety-ninth wave — the Rastelli classification (complete AVSD) in lib/rastelli-avsd-v474.js (+1)

`rastelli-avsd` (spec-v474) applies the Rastelli classification: given the type, it reports the
bridging-leaflet-morphology description. `type` is an enum (`kind: 'enum'`, values A/B/C) — the single input the
renderer exposes. The example sets type A; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("rastelli complete avsd classification") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1262 calculators across 378 modules**.

### lib/rastelli-avsd-v474.js
- `rastelli-avsd`

## Two-hundred-ninety-eighth wave — the Todani classification (choledochal cyst) in lib/todani-choledochal-v473.js (+1)

`todani-choledochal` (spec-v473) applies the Todani classification: given the type, it reports the
location/shape description. `type` is an enum (`kind: 'enum'`, values I..V) — the single input the renderer
exposes. The example sets type I; its expected text carries no numeric facts (the description is word-only), so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("todani choledochal cyst classification") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1261 calculators across 377 modules**.

### lib/todani-choledochal-v473.js
- `todani-choledochal`

## Two-hundred-ninety-seventh wave — the Yerdel grade (portal vein thrombosis) in lib/yerdel-pvt-v472.js (+1)

`yerdel-pvt` (spec-v472) applies the Yerdel classification: given the grade, it reports the thrombus-extent
description. `grade` is an enum (`kind: 'enum'`, values 1-4) — the single input the renderer exposes. The
example sets grade 2; its expected text carries the "50%" fact, so it flows through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("yerdel portal vein
thrombosis grade") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1260 calculators across 376 modules**.

### lib/yerdel-pvt-v472.js
- `yerdel-pvt`

## Two-hundred-ninety-sixth wave — the Gass staging (macular hole) in lib/gass-macular-hole-v471.js (+1)

`gass-macular-hole` (spec-v471) applies the Gass classification: given the stage, it reports the biomicroscopic
description. `stage` is an enum (`kind: 'enum'`, values 1-4) — the single input the renderer exposes. The
example sets stage 2; its expected text carries the "400 micrometers" fact, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("gass
macular hole staging") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1259 calculators across 375 modules**.

### lib/gass-macular-hole-v471.js
- `gass-macular-hole`

## Two-hundred-ninety-fifth wave — the Larsen grade (rheumatoid arthritis radiographs) in lib/larsen-ra-v470.js (+1)

`larsen-ra` (spec-v470) applies the Larsen radiographic grading: given the grade, it reports the joint-damage
description. `grade` is an enum (`kind: 'enum'`, values 0-5) — the single input the renderer exposes. The
example sets grade 2; its expected text carries no numeric facts beyond the word-only description, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("larsen rheumatoid arthritis radiographic grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1258 calculators across 374 modules**.

### lib/larsen-ra-v470.js
- `larsen-ra`

## Two-hundred-ninety-fourth wave — the Steinbrocker functional class (rheumatoid arthritis) in lib/steinbrocker-ra-v469.js (+1)

`steinbrocker-ra` (spec-v469) applies the Steinbrocker functional classification: given the class, it reports
the functional-capacity description. `cls` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input
the renderer exposes. The example sets class II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("steinbrocker rheumatoid arthritis functional class") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1257 calculators across 373
modules**.

### lib/steinbrocker-ra-v469.js
- `steinbrocker-ra`

## Two-hundred-ninety-third wave — the Brouet classification (cryoglobulinemia) in lib/brouet-cryoglobulinemia-v468.js (+1)

`brouet-cryoglobulinemia` (spec-v468) applies the Brouet classification: given the type, it reports the
clonality / disease-association description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single
input the renderer exposes. The example sets type II; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("brouet cryoglobulinemia classification") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1256 calculators across 372
modules**.

### lib/brouet-cryoglobulinemia-v468.js
- `brouet-cryoglobulinemia`

## Two-hundred-ninety-second wave — the Bromage scale (neuraxial motor block) in lib/bromage-scale-v467.js (+1)

`bromage-scale` (spec-v467) applies the Bromage scale: given the grade, it reports the residual-movement
description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes.
The example sets grade II; its expected text carries no numeric facts (the description is word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("bromage neuraxial motor block scale") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1255 calculators across 371 modules**.

### lib/bromage-scale-v467.js
- `bromage-scale`

## Two-hundred-ninety-first wave — the Judet-Letournel classification (acetabular fracture) in lib/letournel-acetabulum-v466.js (+1)

`letournel-acetabulum` (spec-v466) applies the Judet-Letournel classification: given the pattern, it reports
whether it is elementary or associated and its description. `pattern` is an enum of the ten pattern slugs — the
single input the renderer exposes. The example sets `transverse`; its expected text carries no numeric facts
(the description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("judet letournel acetabular fracture classification")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1254 calculators
across 370 modules**.

### lib/letournel-acetabulum-v466.js
- `letournel-acetabulum`

## Two-hundred-ninetieth wave — the Stamey grade (stress urinary incontinence) in lib/stamey-incontinence-v465.js (+1)

`stamey-incontinence` (spec-v465) applies the Stamey grading: given the grade, it reports the provoking-stress
description. `grade` is an enum (`kind: 'enum'`, values 1/2/3) — the single input the renderer exposes. The
example sets grade 2; its expected text carries no numeric facts beyond the word-only description, so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("stamey stress urinary incontinence grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1253 calculators across 369 modules**.

### lib/stamey-incontinence-v465.js
- `stamey-incontinence`

## Two-hundred-eighty-ninth wave — the Crawford classification (thoracoabdominal aortic aneurysm) in lib/crawford-taaa-v464.js (+1)

`crawford-taaa` (spec-v464) applies the Crawford classification: given the extent, it reports the aortic-segment
description. `extent` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes.
The example sets extent II; its expected text carries no numeric facts (the description is word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("crawford thoracoabdominal aortic aneurysm classification") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1252 calculators across 368 modules**.

### lib/crawford-taaa-v464.js
- `crawford-taaa`

## Two-hundred-eighty-eighth wave — the Waldenstrom staging (Legg-Calve-Perthes) in lib/waldenstrom-perthes-v463.js (+1)

`waldenstrom-perthes` (spec-v463) applies the Waldenstrom radiographic staging: given the stage, it reports the
temporal appearance description. `stage` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the
renderer exposes. The example sets stage II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("waldenstrom perthes radiographic staging") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1251 calculators across 367 modules**.

### lib/waldenstrom-perthes-v463.js
- `waldenstrom-perthes`

## Two-hundred-eighty-seventh wave — the GMFCS level (cerebral palsy gross motor function) in lib/gmfcs-v462.js (+1)

`gmfcs` (spec-v462) applies the Gross Motor Function Classification System: given the level, it reports the
mobility description. `level` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the single input the renderer
exposes. The example sets level III; its expected text carries no numeric facts (the description is word-only),
so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("gmfcs cerebral palsy gross motor function") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1250 calculators across 366 modules**.

### lib/gmfcs-v462.js
- `gmfcs`

## Two-hundred-eighty-sixth wave — the DeBakey classification (aortic dissection) in lib/debakey-v461.js (+1)

`debakey` (spec-v461) applies the DeBakey classification: given the type, it reports the origin / extent
description. `type` is an enum (`kind: 'enum'`, values I/II/IIIa/IIIb) — the single input the renderer exposes.
The example sets type I; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("debakey aortic dissection classification") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1249 calculators across 365 modules**.

### lib/debakey-v461.js
- `debakey`

## Two-hundred-eighty-fifth wave — the Enneking surgical staging (musculoskeletal sarcoma) in lib/enneking-v460.js (+1)

`enneking` (spec-v460) applies the Enneking (MSTS) surgical staging: given the stage, it reports the grade /
compartment / metastasis combination. `stage` is an enum (`kind: 'enum'`, values IA/IB/IIA/IIB/III) — the
single input the renderer exposes. The example sets stage IIB; its expected text carries the G2/T2/M0 facts, so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("enneking musculoskeletal sarcoma surgical staging") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1248 calculators across 364 modules**.

### lib/enneking-v460.js
- `enneking`

## Two-hundred-eighty-fourth wave — the Thompson-Epstein classification (posterior hip dislocation) in lib/thompson-epstein-v459.js (+1)

`thompson-epstein` (spec-v459) applies the Thompson-Epstein classification: given the type, it reports the
associated-fracture description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the single input
the renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("thompson epstein posterior hip dislocation classification") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1247 calculators across 363
modules**.

### lib/thompson-epstein-v459.js
- `thompson-epstein`

## Two-hundred-eighty-third wave — the Boyd-Griffin classification (intertrochanteric fracture) in lib/boyd-griffin-v458.js (+1)

`boyd-griffin` (spec-v458) applies the Boyd-Griffin classification: given the type, it reports the fracture-line
description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The
example sets type II; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("boyd griffin intertrochanteric fracture classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1246 calculators across 362 modules**.

### lib/boyd-griffin-v458.js
- `boyd-griffin`

## Two-hundred-eighty-second wave — the Stulberg classification (Perthes residual deformity) in lib/stulberg-v457.js (+1)

`stulberg` (spec-v457) applies the Stulberg classification: given the class, it reports the sphericity /
congruency description. `cls` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the single input the renderer
exposes. The example sets class III; its expected text carries no numeric facts (the description is word-only),
so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("stulberg perthes residual deformity classification") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1245 calculators across 361 modules**.

### lib/stulberg-v457.js
- `stulberg`

## Two-hundred-eighty-first wave — the Leddy-Packer classification (jersey finger) in lib/leddy-packer-v456.js (+1)

`leddy-packer` (spec-v456) applies the Leddy-Packer classification: given the type, it reports the FDP
retraction / bony-fragment description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input
the renderer exposes. The example sets type II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("leddy packer jersey finger classification") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1244 calculators across 360 modules**.

### lib/leddy-packer-v456.js
- `leddy-packer`

## Two-hundred-eightieth wave — the Nunley-Vertullo classification (midfoot sprain) in lib/nunley-vertullo-v455.js (+1)

`nunley-vertullo` (spec-v455) applies the Nunley-Vertullo classification: given the stage, it reports the
weightbearing-radiograph description. `stage` is an enum (`kind: 'enum'`, values I/II/III) — the single input
the renderer exposes. The example sets stage II; its expected text carries the "1 to 5 mm" diastasis fact, so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("nunley vertullo midfoot sprain classification") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1243 calculators across 359 modules**.

### lib/nunley-vertullo-v455.js
- `nunley-vertullo`

## Two-hundred-seventy-ninth wave — the Bado classification (Monteggia fracture) in lib/bado-v454.js (+1)

`bado` (spec-v454) applies the Bado classification: given the fracture type, it reports the dislocation /
fracture description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer
exposes. The example sets type I; its expected text carries no numeric facts (the description is word-only), so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("bado monteggia fracture classification") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1242 calculators across 358 modules**. (Wave 278,
the Schatzker tile, was reverted before release as a duplicate of the existing `schatzker-classification`
adapter, so this wave is 279.)

### lib/bado-v454.js
- `bado`

## Two-hundred-seventy-seventh wave — the Brooker classification (heterotopic ossification) in lib/brooker-v452.js (+1)

`brooker` (spec-v452) applies the Brooker classification: given the radiographic class, it reports the extent
description. `cls` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The
example sets class II; its expected text carries the "1 cm" gap fact, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("brooker heterotopic ossification classification") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1241 calculators across 357 modules**.

### lib/brooker-v452.js
- `brooker`

## Two-hundred-seventy-sixth wave — the Sade grade (tympanic membrane retraction) in lib/sade-retraction-v451.js (+1)

`sade-retraction` (spec-v451) applies the Sade classification: given the grade, it reports the otoscopy
description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes.
The example sets grade III; its expected text carries no numeric facts (the description is word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("sade tympanic membrane retraction grade") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1240 calculators across 356 modules**.

### lib/sade-retraction-v451.js
- `sade-retraction`

## Two-hundred-seventy-fifth wave — the Reid classification (bronchiectasis) in lib/reid-bronchiectasis-v450.js (+1)

`reid-bronchiectasis` (spec-v450) applies the Reid classification: given the type, it reports the morphology
description. `type` is an enum (`kind: 'enum'`, values cylindrical/varicose/cystic) — the single input the
renderer exposes. The example sets varicose; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("reid bronchiectasis morphology") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1239 calculators across 355 modules**.

### lib/reid-bronchiectasis-v450.js
- `reid-bronchiectasis`

## Two-hundred-seventy-fourth wave — the Fielding-Hawkins (atlantoaxial rotatory subluxation) in lib/fielding-hawkins-v449.js (+1)

`fielding-hawkins` (spec-v449) applies the Fielding-Hawkins classification: given the type, it reports the
displacement description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the
renderer exposes. The example sets type II; its expected numbers (3 to 5 mm) appear in the result band, so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("fielding hawkins atlantoaxial rotatory subluxation") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1238 calculators across 354 modules**.

### lib/fielding-hawkins-v449.js
- `fielding-hawkins`

## Two-hundred-seventy-third wave — the Traynelis (atlanto-occipital dislocation) in lib/traynelis-v448.js (+1)

`traynelis` (spec-v448) applies the Traynelis classification: given the type, it reports the displacement
description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input the renderer exposes. The
example sets type II; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("traynelis atlanto occipital dislocation") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1237 calculators across 353 modules**.

### lib/traynelis-v448.js
- `traynelis`

## Two-hundred-seventy-second wave — the Anderson-Montesano (occipital condyle fracture) in lib/anderson-montesano-v447.js (+1)

`anderson-montesano` (spec-v447) applies the Anderson-Montesano classification: given the type, it reports the
morphology description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input the renderer
exposes. The example sets type III; its expected text carries no numeric facts (the description is word-only),
so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("anderson montesano occipital condyle") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1236 calculators across 352 modules**.

### lib/anderson-montesano-v447.js
- `anderson-montesano`

## Two-hundred-seventy-first wave — the ROP stage (retinopathy of prematurity) in lib/rop-stage-v446.js (+1)

`rop-stage` (spec-v446) applies the ICROP stage: given the stage, it reports the retinal description. `stage`
is an enum (`kind: 'enum'`, values 1/2/3/4/5) — the single input the renderer exposes. The example sets stage
3; its expected text carries no numeric facts beyond the stage label (the description is word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("retinopathy of prematurity stage") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1235 calculators across 351 modules**.

### lib/rop-stage-v446.js
- `rop-stage`

## Two-hundred-seventieth wave — the Revised Atlanta severity (acute pancreatitis) in lib/atlanta-pancreatitis-v445.js (+1)

`atlanta-pancreatitis` (spec-v445) applies the Revised Atlanta classification: given the severity, it reports
the definition. `severity` is an enum (`kind: 'enum'`, values mild/moderately-severe/severe) — the single
input the renderer exposes. The example sets moderately-severe; its expected text carries no numeric facts
(the definition is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("revised atlanta pancreatitis severity") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1234 calculators across 350
modules**.

### lib/atlanta-pancreatitis-v445.js
- `atlanta-pancreatitis`

## Two-hundred-sixty-ninth wave — the McCormick grade (spinal cord function) in lib/mccormick-v444.js (+1)

`mccormick` (spec-v444) applies the McCormick grading scale: given the grade, it reports the functional
description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes.
The example sets grade II; its expected text carries no numeric facts (the description is word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("mccormick spinal cord grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1233 calculators across 349 modules**.

### lib/mccormick-v444.js
- `mccormick`

## Two-hundred-sixty-eighth wave — the Kadish staging (esthesioneuroblastoma) in lib/kadish-v443.js (+1)

`kadish` (spec-v443) applies the Kadish staging: given the stage, it reports the anatomic-extent description.
`stage` is an enum (`kind: 'enum'`, values A/B/C/D) — the single input the renderer exposes. The example sets
stage C; its expected text carries no numeric facts (the description is word-only), so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("kadish esthesioneuroblastoma stage") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1232 calculators across 348 modules**.

### lib/kadish-v443.js
- `kadish`

## Two-hundred-sixty-seventh wave — the Zabramski classification (cerebral cavernous malformation) in lib/zabramski-v442.js (+1)

`zabramski` (spec-v442) applies the Zabramski classification: given the type, it reports the MRI description.
`type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The example
sets type II; its expected text carries no numeric facts (the description is word-only), so it flows through
the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("zabramski cavernous malformation") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1231 calculators across 347 modules**.

### lib/zabramski-v442.js
- `zabramski`

## Two-hundred-sixty-sixth wave — the Borden classification (dural AV fistula) in lib/borden-davf-v441.js (+1)

`borden-davf` (spec-v441) applies the Borden classification: given the type, it reports the venous-drainage
description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input the renderer exposes. The
example sets type II; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("borden dural av fistula") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1230 calculators across 346 modules**.

### lib/borden-davf-v441.js
- `borden-davf`

## Two-hundred-sixty-fifth wave — the Barrow classification (carotid-cavernous fistula) in lib/barrow-ccf-v440.js (+1)

`barrow-ccf` (spec-v440) applies the Barrow classification: given the type, it reports the arterial-supply
description. `type` is an enum (`kind: 'enum'`, values A/B/C/D) — the single input the renderer exposes. The
example sets type A; its expected text carries no numeric facts (the description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("barrow carotid cavernous fistula") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1229 calculators across 345 modules**.

### lib/barrow-ccf-v440.js
- `barrow-ccf`

## Two-hundred-sixty-fourth wave — the Hamada grade (cuff tear arthropathy) in lib/hamada-v439.js (+1)

`hamada` (spec-v439) applies the Hamada classification: given the grade, it reports the radiographic
description. `grade` is an enum (`kind: 'enum'`, values 1/2/3/4/5) — the single input the renderer exposes.
The example sets grade 1; its expected number (6 mm) appears in the result band, so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("hamada cuff tear arthropathy grade") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1228 calculators across 344 modules**.

### lib/hamada-v439.js
- `hamada`

## Two-hundred-sixty-third wave — the Eaton-Littler stage (thumb CMC arthritis) in lib/eaton-littler-v438.js (+1)

`eaton-littler` (spec-v438) applies the Eaton-Littler classification: given the stage, it reports the
radiographic description. `stage` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the
renderer exposes. The example sets stage II; its expected number (2 mm) appears in the result band, so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("eaton littler thumb arthritis stage") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1227 calculators across 343 modules**.

### lib/eaton-littler-v438.js
- `eaton-littler`

## Two-hundred-sixty-second wave — the Goutallier grade (rotator cuff fatty infiltration) in lib/goutallier-v437.js (+1)

`goutallier` (spec-v437) applies the Goutallier classification: given the grade, it reports the fat-vs-muscle
description. `grade` is an enum (`kind: 'enum'`, values 0/1/2/3/4) — the single input the renderer exposes. The
example sets grade 2; its expected text carries no numeric facts beyond the grade label (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("goutallier fatty infiltration grade") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1226 calculators across 342 modules**.

### lib/goutallier-v437.js
- `goutallier`

## Two-hundred-sixty-first wave — the Biffl grade (blunt cerebrovascular injury) in lib/biffl-bcvi-v436.js (+1)

`biffl-bcvi` (spec-v436) applies the Biffl (Denver) grading scale: given the grade, it reports the
angiographic description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the single input the
renderer exposes. The example sets grade III; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("biffl bcvi grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1225 calculators across 341 modules**.

### lib/biffl-bcvi-v436.js
- `biffl-bcvi`

## Two-hundred-sixtieth wave — the Van Herick angle grade in lib/van-herick-v435.js (+1)

`van-herick` (spec-v435) applies the Van Herick grade: given the grade, it reports the PACD:CT description.
`grade` is an enum (`kind: 'enum'`, values 0/1/2/3/4) — the single input the renderer exposes. The example
sets grade 2; its expected fraction (1/4) appears in the result band, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("van
herick angle grade") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1224 calculators across 340 modules**.

### lib/van-herick-v435.js
- `van-herick`

## Two-hundred-fifty-ninth wave — the Pfirrmann disc degeneration grade in lib/pfirrmann-disc-v434.js (+1)

`pfirrmann-disc` (spec-v434) applies the Pfirrmann classification: given the grade, it reports the MRI
description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the single input the renderer
exposes. The example sets grade III; its expected text carries no numeric facts (the description is word-only),
so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("pfirrmann disc degeneration grade") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1223 calculators across 339 modules**.

### lib/pfirrmann-disc-v434.js
- `pfirrmann-disc`

## Two-hundred-fifty-eighth wave — the Modic changes (vertebral endplate MRI) in lib/modic-changes-v433.js (+1)

`modic-changes` (spec-v433) applies the Modic classification: given the type, it reports the T1/T2 signal.
`type` is an enum (`kind: 'enum'`, values 1/2/3) — the single input the renderer exposes. The example sets
type 1; its expected T1/T2 tokens appear in the result band, so it flows through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("modic changes
vertebral endplate") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1222 calculators across 338 modules**.

### lib/modic-changes-v433.js
- `modic-changes`

## Two-hundred-fifty-seventh wave — the Baden-Walker prolapse grade in lib/baden-walker-v432.js (+1)

`baden-walker` (spec-v432) applies the Baden-Walker halfway system: given the grade, it reports the
examination description. `grade` is an enum (`kind: 'enum'`, values 0/1/2/3/4) — the single input the renderer
exposes. The example sets grade 2; its expected text carries no numeric facts beyond the grade label (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("baden walker prolapse grade") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1221 calculators across 337 modules**.

### lib/baden-walker-v432.js
- `baden-walker`

## Two-hundred-fifty-sixth wave — the modified Bell staging (NEC) in lib/bell-nec-v431.js (+1)

`bell-nec` (spec-v431) applies the modified Bell staging: given the stage, it reports the hallmark findings.
`stage` is an enum (`kind: 'enum'`, values IA/IB/IIA/IIB/IIIA/IIIB) — the single input the renderer exposes.
The example sets stage IIA; its expected text carries no numeric facts (the findings are word-only), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("bell staging necrotizing enterocolitis") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1220 calculators across 336 modules**.

### lib/bell-nec-v431.js
- `bell-nec`

## Two-hundred-fifty-fifth wave — the Papile grade (germinal matrix / IVH) in lib/papile-ivh-v430.js (+1)

`papile-ivh` (spec-v430) applies the Papile grading: given the grade, it reports the imaging description.
`grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The example
sets grade III; its expected text carries no numeric facts (the description is word-only), so it flows through
the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("papile intraventricular hemorrhage grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1219 calculators across 335 modules**.

### lib/papile-ivh-v430.js
- `papile-ivh`

## Two-hundred-fifty-fourth wave — the Sarnat staging (neonatal HIE) in lib/sarnat-hie-v429.js (+1)

`sarnat-hie` (spec-v429) applies the Sarnat staging: given the stage, it reports the clinical features. `stage`
is an enum (`kind: 'enum'`, values 1/2/3) — the single input the renderer exposes. The example sets stage 2;
its expected text carries no numeric facts beyond the stage label (the features are word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("sarnat staging neonatal") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1218 calculators across 334 modules**.

### lib/sarnat-hie-v429.js
- `sarnat-hie`

## Two-hundred-fifty-third wave — the MRC muscle-power grade in lib/mrc-power-v428.js (+1)

`mrc-power` (spec-v428) applies the MRC muscle-power grade: given the grade, it reports the examination
description. `grade` is an enum (`kind: 'enum'`, values 0/1/2/3/4/5) — the single input the renderer exposes.
The example sets grade 3; its expected text carries no numeric facts beyond the grade label (the description
is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("mrc muscle power grade") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1217 calculators across 333 modules**.

### lib/mrc-power-v428.js
- `mrc-power`

## Two-hundred-fifty-second wave — the Vaughan Williams antiarrhythmic classification in lib/vaughan-williams-v427.js (+1)

`vaughan-williams` (spec-v427) applies the Vaughan Williams classification: given the class, it reports the
mechanism and representative agents. `cls` is an enum (`kind: 'enum'`, values Ia/Ib/Ic/II/III/IV) — the single
input the renderer exposes. The example sets class III; its expected text carries no numeric facts (the
mechanism and drug names are word-only), so it flows through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("vaughan williams antiarrhythmic") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1216 calculators
across 332 modules**.

### lib/vaughan-williams-v427.js
- `vaughan-williams`

## Two-hundred-fifty-first wave — the Gell and Coombs hypersensitivity classification in lib/gell-coombs-v426.js (+1)

`gell-coombs` (spec-v426) applies the Gell and Coombs classification: given the type, it reports the immune
mechanism and examples. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the
renderer exposes. The example sets type I; its expected text carries no numeric facts (the mechanism is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("gell coombs hypersensitivity") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1215 calculators across 331 modules**.

### lib/gell-coombs-v426.js
- `gell-coombs`

## Two-hundred-fiftieth wave — the vesicoureteral reflux grade (VCUG) in lib/vur-grade-v425.js (+1)

`vur-grade` (spec-v425) applies the International Reflux Study grading of vesicoureteral reflux: given the
grade, it reports the imaging description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the
single input the renderer exposes. The example sets grade III; its expected text carries no numeric facts
(the description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("vesicoureteral reflux grade") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1214 calculators across 330
modules**.

### lib/vur-grade-v425.js
- `vur-grade`

## Two-hundred-forty-ninth wave — the Bethesda System (thyroid cytopathology) in lib/bethesda-thyroid-v424.js (+1)

`bethesda-thyroid` (spec-v424) applies the Bethesda System for Reporting Thyroid Cytopathology: given the
category, it reports its cytologic meaning. `category` is an enum (`kind: 'enum'`, values I/II/III/IV/V/VI) —
the single input the renderer exposes. The example sets category IV; its expected text carries no numeric
facts (the meaning is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("bethesda thyroid category") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1213 calculators across 329
modules**.

### lib/bethesda-thyroid-v424.js
- `bethesda-thyroid`

## Two-hundred-forty-eighth wave — the Marsh-Oberhuber classification (celiac histology) in lib/marsh-oberhuber-v423.js (+1)

`marsh-oberhuber` (spec-v423) applies the modified Marsh (Marsh-Oberhuber) classification: given the type, it
reports the histologic description. `type` is an enum (`kind: 'enum'`, values 0/1/2/3a/3b/3c) — the single
input the renderer exposes. The example sets type 3a; its expected text carries no numeric facts beyond the
type label (the description is word-only), so it flows through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("marsh oberhuber classification") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1212 calculators
across 328 modules**.

### lib/marsh-oberhuber-v423.js
- `marsh-oberhuber`

## Two-hundred-forty-seventh wave — the SUN anterior chamber flare grade (uveitis) in lib/sun-ac-flare-v422.js (+1)

`sun-ac-flare` (spec-v422) applies the SUN anterior chamber flare grade: given the grade, it reports the
flare description. `grade` is an enum (`kind: 'enum'`, values 0/1+/2+/3+/4+) — the single input the renderer
exposes. The example sets grade 2+; its expected text carries no numeric facts beyond the grade label (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("anterior chamber flare grade") is promoted now that
the tile is in the MCP-exposed registry. Completes the SUN cell/flare pair in the exposed registry. Brings the
exposed total to **1211 calculators across 327 modules**.

### lib/sun-ac-flare-v422.js
- `sun-ac-flare`

## Two-hundred-forty-sixth wave — the SUN anterior chamber cell grade (uveitis) in lib/sun-ac-cell-v421.js (+1)

`sun-ac-cell` (spec-v421) applies the SUN anterior chamber cell grade: given the grade, it reports the
defining cell-count range. `grade` is an enum (`kind: 'enum'`, values 0/0.5+/1+/2+/3+/4+) — the single input
the renderer exposes. The example sets grade 1+; its expected numbers (6 to 15 cells) appear in the result
band, so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("anterior chamber cell grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1210 calculators across 326 modules**.

### lib/sun-ac-cell-v421.js
- `sun-ac-cell`

## Two-hundred-forty-fifth wave — the Friedman tongue position (OSA staging) in lib/friedman-tongue-v420.js (+1)

`friedman-tongue` (spec-v420) applies the Friedman tongue position: given the grade, it reports the
visualization description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the
renderer exposes. The example sets grade II; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("friedman tongue position") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1209 calculators across 325 modules**.

### lib/friedman-tongue-v420.js
- `friedman-tongue`

## Two-hundred-forty-fourth wave — the Myer-Cotton grade (subglottic stenosis) in lib/cotton-myer-v419.js (+1)

`cotton-myer` (spec-v419) applies the Myer-Cotton grading of subglottic stenosis: given the grade, it reports
the percent-obstruction description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single
input the renderer exposes. The example sets grade II; its expected text's digits are the 51%/70% band bounds
that the result echoes verbatim, so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("subglottic stenosis grade") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1208 calculators across 324
modules**.

### lib/cotton-myer-v419.js
- `cotton-myer`

## Two-hundred-forty-third wave — the Milch classification (lateral condyle fracture) in lib/milch-condyle-v418.js (+1)

`milch-condyle` (spec-v418) applies the Milch classification of a lateral humeral condyle fracture: given the
type, it reports the groove/stability description. `type` is an enum (`kind: 'enum'`, values I/II) — the
single input the renderer exposes. The example sets type I; its expected text carries no numeric facts (the
description is word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("lateral condyle fracture") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1207 calculators across 323 modules**.

### lib/milch-condyle-v418.js
- `milch-condyle`

## Two-hundred-forty-second wave — the Wassel classification (thumb polydactyly) in lib/wassel-thumb-v417.js (+1)

`wassel-thumb` (spec-v417) applies the Wassel classification of thumb polydactyly: given the type, it reports
the duplication-level description. `type` is an enum (`kind: 'enum'`, values I..VII) — the single input the
renderer exposes. The example sets type IV; its expected text carries no numeric facts (the description is
word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("thumb polydactyly") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1206 calculators across 322 modules**.

### lib/wassel-thumb-v417.js
- `wassel-thumb`

## Two-hundred-forty-first wave — the Russe classification (scaphoid fracture) in lib/russe-scaphoid-v416.js (+1)

`russe-scaphoid` (spec-v416) applies the Russe classification of a scaphoid fracture: given the fracture-line
orientation, it reports the orientation and its stability description. `type` is an enum (`kind: 'enum'`,
values horizontal oblique / transverse / vertical oblique) — the single input the renderer exposes. The
example sets type transverse; its expected text carries no numeric facts (the descriptions are word-only), so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("scaphoid fracture classification") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1205 calculators across 321 modules**.

### lib/russe-scaphoid-v416.js
- `russe-scaphoid`

## Two-hundred-fortieth wave — the Geissler classification (carpal ligament injury) in lib/geissler-carpal-v415.js (+1)

`geissler-carpal` (spec-v415) applies the Geissler arthroscopic classification of an interosseous
carpal-ligament injury: given the grade, it reports the arthroscopic-appearance description. `grade` is an
enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The example sets grade II;
its expected text carries no numeric facts (the grade description is word-only), so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("geissler classification") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1204 calculators across 320 modules**.

### lib/geissler-carpal-v415.js
- `geissler-carpal`

## Two-hundred-thirty-ninth wave — the Mayfield classification (perilunate instability) in lib/mayfield-perilunate-v414.js (+1)

`mayfield-perilunate` (spec-v414) applies the Mayfield classification of progressive perilunar instability:
given the stage, it reports the ligament-disruption description. `stage` is an enum (`kind: 'enum'`, values
I/II/III/IV) — the single input the renderer exposes. The example sets stage III; its expected text carries
no numeric facts (the stage description is word-only), so it flows through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("perilunate instability")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1203 calculators
across 319 modules**.

### lib/mayfield-perilunate-v414.js
- `mayfield-perilunate`

## Two-hundred-thirty-eighth wave — the Seinsheimer classification (subtrochanteric femur fracture) in lib/seinsheimer-subtroch-v413.js (+1)

`seinsheimer-subtroch` (spec-v413) applies the Seinsheimer classification of a subtrochanteric femur
fracture: given the type, it reports the fragment/fracture-line description. `type` is an enum
(`kind: 'enum'`, values I/IIA/IIB/IIC/IIIA/IIIB/IV/V) — the single input the renderer exposes. The example
sets type IIB; its expected text carries no numeric facts (the type description is word-only), so it flows
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("subtrochanteric fracture") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1202 calculators across 318 modules**.

### lib/seinsheimer-subtroch-v413.js
- `seinsheimer-subtroch`

## Two-hundred-thirty-seventh wave — the Myerson classification (Lisfranc injury) in lib/lisfranc-myerson-v412.js (+1)

`lisfranc-myerson` (spec-v412) applies the Myerson classification (a modification of the Hardcastle /
Quenu-Kuss classification) of a Lisfranc (tarsometatarsal) injury: given the type, it reports the
incongruity/displacement description. `type` is an enum (`kind: 'enum'`, values A/B1/B2/C1/C2) — the single
input the renderer exposes. The example sets type B2; its expected text carries no numeric facts (the type
descriptions are word-only), so it flows through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("lisfranc injury") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1201 calculators across 317 modules**.

### lib/lisfranc-myerson-v412.js
- `lisfranc-myerson`

## Two-hundred-thirty-sixth wave — the Levine-Edwards classification (hangman's fracture) in lib/levine-edwards-v411.js (+1)

`levine-edwards` (spec-v411) applies the Levine-Edwards classification of a hangman's fracture: given the
type, it reports the displacement/angulation description. `type` is an enum (`kind: 'enum'`, values
I/II/IIa/III) — the single input the renderer exposes. The example sets type II; its expected text's digits
are the "3 mm" translation threshold that the result echoes verbatim, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("hangman fracture") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1200 calculators across 316 modules**.

## Two-hundred-thirty-fifth wave — the Anderson-D'Alonzo classification (odontoid fracture) in lib/anderson-dalonzo-v410.js (+1)

`anderson-dalonzo` (spec-v410) applies the Anderson-D'Alonzo classification of an odontoid fracture: given
the type, it reports the level description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the
single input the renderer exposes. The example sets type II; its expected text's only digits are the "C2"
level label that the result echoes verbatim, so it flows through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("odontoid fracture") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1199 calculators
across 315 modules**.

## Two-hundred-thirty-fourth wave — the Ideberg classification (glenoid fossa fracture) in lib/ideberg-glenoid-v409.js (+1)

`ideberg-glenoid` (spec-v409) applies the Ideberg classification of a glenoid-fossa fracture: given the
type, it reports the exit-border description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV/V/VI) —
the single input the renderer exposes. The example sets type II; its expected text is the type description
(a roman numeral, no free numeric facts to round-trip), so it flows through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("glenoid fossa
fracture") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1198 calculators across 314 modules**.

## Two-hundred-thirty-third wave — the Meyers-McKeever classification (tibial eminence fracture) in lib/meyers-mckeever-v408.js (+1)

`meyers-mckeever` (spec-v408) applies the Meyers-McKeever classification of a tibial eminence fracture:
given the type, it reports the displacement description. `type` is an enum (`kind: 'enum'`, values
I/II/III/IV) — the single input the renderer exposes. The example sets type II; its expected text is the
type description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("tibial eminence fracture") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1197 calculators across 313 modules**.

## Two-hundred-thirty-second wave — the Steinberg staging (femoral head AVN) in lib/steinberg-avn-v407.js (+1)

`steinberg-avn` (spec-v407) applies the Steinberg staging of femoral-head osteonecrosis: given the stage,
it reports the radiographic description. `stage` is an enum (`kind: 'enum'`, values 0/I/II/III/IV/V/VI) —
the single input the renderer exposes. The example sets stage III; its expected text's digits are the
A/B/C extent thresholds (15, 30) that the result echoes verbatim, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("steinberg staging") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1196 calculators across 312 modules**.

## Two-hundred-thirty-first wave — the Le Fort classification (midface fracture) in lib/le-fort-v406.js (+1)

`le-fort` (spec-v406) applies the Le Fort classification of a midface fracture: given the type, it reports
the fracture-level description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the single input the
renderer exposes. The example sets type II; its expected text is the type description (a roman numeral, no
free numeric facts to round-trip), so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("midface fracture") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1195 calculators across 311
modules**.

## Two-hundred-thirtieth wave — the Savary-Miller classification (reflux esophagitis) in lib/savary-miller-v405.js (+1)

`savary-miller` (spec-v405) applies the modified Savary-Miller classification of reflux esophagitis: given
the grade, it reports the endoscopic description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV/V)
— the single input the renderer exposes. The example sets grade III; its expected text is the grade
description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("savary miller esophagitis") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1194 calculators across 310 modules**.

## Two-hundred-twenty-ninth wave — the Regan-Morrey classification (coronoid process fracture) in lib/regan-morrey-v404.js (+1)

`regan-morrey` (spec-v404) applies the Regan-Morrey classification of a coronoid process fracture: given
the type, it reports the height description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the
single input the renderer exposes. The example sets type II; its expected text's only digits are the "50%"
threshold that the result echoes verbatim, so it flows through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("coronoid process fracture")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1193
calculators across 309 modules**.

## Two-hundred-twenty-eighth wave — the Berndt-Harty classification (osteochondral lesion of the talus) in lib/berndt-harty-v403.js (+1)

`berndt-harty` (spec-v403) applies the Berndt-Harty classification of an osteochondral lesion of the talus:
given the stage, it reports the radiographic description. `stage` is an enum (`kind: 'enum'`, values
I/II/III/IV) — the single input the renderer exposes. The example sets stage III; its expected text is the
stage description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("osteochondral lesion of the talus") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1192 calculators across 308 modules**.

## Two-hundred-twenty-seventh wave — the Lauge-Hansen classification (rotational ankle fracture) in lib/lauge-hansen-v402.js (+1)

`lauge-hansen` (spec-v402) applies the Lauge-Hansen classification of a rotational ankle fracture: given
the mechanism, it reports the injury-sequence description. `mechanism` is an enum (`kind: 'enum'`, values
SA/SER/PAB/PER/PD) — the single input the renderer exposes. The example sets SER; its expected text's only
digits are the stage numbers (1-4) that the result echoes verbatim, so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("ankle fracture mechanism") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1191 calculators across 307 modules**.

## Two-hundred-twenty-sixth wave — the Zargar classification (caustic esophagogastric injury) in lib/zargar-caustic-v401.js (+1)

`zargar-caustic` (spec-v401) applies the modified Zargar endoscopic classification of a caustic /
corrosive esophagogastric injury: given the grade, it reports the endoscopic description. `grade` is an
enum (`kind: 'enum'`, values 0/1/2a/2b/3a/3b/4) — the single input the renderer exposes. The example sets
grade 2b; its expected text's only digits are the grade labels (2a / 2b), which the result echoes, so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("caustic ingestion grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1190 calculators across 306 modules**.

## Two-hundred-twenty-fifth wave — the Nyhus classification (groin hernia) in lib/nyhus-hernia-v400.js (+1)

`nyhus-hernia` (spec-v400) applies the Nyhus classification of a groin hernia: given the type, it reports
the anatomic description. `type` is an enum (`kind: 'enum'`, values I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd) —
the single input the renderer exposes. The example sets type IIIa; its expected text is the type
description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("groin hernia classification") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1189 calculators across 305 modules**.

## Two-hundred-twenty-fourth wave — the Bismuth-Corlette classification (perihilar cholangiocarcinoma) in lib/bismuth-corlette-v399.js (+1)

`bismuth-corlette` (spec-v399) applies the Bismuth-Corlette classification of a perihilar
cholangiocarcinoma: given the type, it reports the ductal-extent description. `type` is an enum
(`kind: 'enum'`, values I/II/IIIa/IIIb/IV) — the single input the renderer exposes. The example sets type
II; its expected text is the type description (a roman numeral, no free numeric facts to round-trip), so it
flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("klatskin tumor type") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1188 calculators across 304 modules**.

## Two-hundred-twenty-third wave — the Carpentier classification (mitral regurgitation) in lib/carpentier-mr-v398.js (+1)

`carpentier-mr` (spec-v398) applies the Carpentier functional classification of mitral regurgitation: given
the type, it reports the mechanism description. `type` is an enum (`kind: 'enum'`, values I/II/IIIa/IIIb) —
the single input the renderer exposes. The example sets type II; its expected text is the type description
(a roman numeral, no free numeric facts to round-trip), so it flows through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("mitral regurgitation
mechanism") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1187 calculators across 303 modules**.

## Two-hundred-twenty-second wave — the El Khoury classification (aortic regurgitation) in lib/el-khoury-ar-v397.js (+1)

`el-khoury-ar` (spec-v397) applies the El Khoury functional classification of aortic regurgitation: given
the type, it reports the mechanism description. `type` is an enum (`kind: 'enum'`, values I/II/III) — the
single input the renderer exposes. The example sets type II; its expected text is the type description (a
roman numeral, no free numeric facts to round-trip), so it flows through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("aortic regurgitation
mechanism") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1186 calculators across 302 modules**.

## Two-hundred-twenty-first wave — the Sievers classification (bicuspid aortic valve) in lib/sievers-bav-v396.js (+1)

`sievers-bav` (spec-v396) applies the Sievers classification of a bicuspid aortic valve: given the type,
it reports the raphe description. `type` is an enum (`kind: 'enum'`, values 0/1/2) — the single input the
renderer exposes. The example sets type 1; its expected text is the type description (a small integer
echoed in the result), so it round-trips through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("bicuspid aortic valve type") is promoted
now that the tile is in the MCP-exposed registry. Brings the exposed total to **1185 calculators across
301 modules**.

## Two-hundred-twentieth wave — the Parks classification (anal fistula) in lib/parks-fistula-v395.js (+1)

`parks-fistula` (spec-v395) applies the Parks classification of an anal fistula: given the type, it
reports the sphincter-relationship description. `type` is an enum (`kind: 'enum'`, the four
sphincter-relationship types) — the single input the renderer exposes. The example sets transsphincteric;
its expected text is the type description (no numeric facts to round-trip), so it flows through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("anal fistula classification") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1184 calculators across 300 modules**.

## Two-hundred-nineteenth wave — the Borrmann classification (gastric cancer) in lib/borrmann-gastric-v394.js (+1)

`borrmann-gastric` (spec-v394) applies the Borrmann classification of advanced gastric cancer: given the
type, it reports the gross-appearance description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV)
— the single input the renderer exposes. The example sets type IV; its expected text is the type
description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("gastric cancer gross morphology") is promoted now that the tile is in the MCP-exposed registry. Brings
the exposed total to **1183 calculators across 299 modules**.

## Two-hundred-eighteenth wave — the Lauren classification (gastric cancer) in lib/lauren-gastric-v393.js (+1)

`lauren-gastric` (spec-v393) applies the Lauren classification of gastric carcinoma: given the type, it
reports the histological description. `type` is an enum (`kind: 'enum'`, values intestinal/diffuse/mixed)
— the single input the renderer exposes. The example sets diffuse; its expected text is the type
description (no numeric facts to round-trip), so it flows through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("gastric cancer histology
type") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1182
calculators across 298 modules**.

## Two-hundred-seventeenth wave — the Hill classification (GE flap valve) in lib/hill-flap-valve-v392.js (+1)

`hill-flap-valve` (spec-v392) applies the Hill classification of the gastroesophageal flap valve: given
the grade, it reports the ridge/valve description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV)
— the single input the renderer exposes. The example sets grade III; its expected text is the grade
description (a roman numeral, no free numeric facts to round-trip), so it flows through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("gastroesophageal flap valve") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1181 calculators across 297 modules**.

## Two-hundred-sixteenth wave — the Hardy classification (pituitary adenoma) in lib/hardy-adenoma-v391.js (+1)

`hardy-adenoma` (spec-v391) applies the Hardy (Hardy-Wilson) two-axis classification of a pituitary
adenoma: given the grade and stage, it reports both. `grade` (0-IV) and `stage` (0/A-E) are both enums —
the two inputs the renderer exposes. The example (grade III, stage C) has both fields, so both adapter
fields are `required: true`; its expected text is the grade/stage description (roman numeral + letter, no
free numeric facts to round-trip), so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("pituitary adenoma sellar grade") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1180 calculators
across 296 modules**.

## Two-hundred-fifteenth wave — the Knosp grade (pituitary adenoma) in lib/knosp-adenoma-v390.js (+1)

`knosp-adenoma` (spec-v390) applies the Knosp grading of cavernous sinus invasion by a pituitary adenoma:
given the grade, it reports the ICA-landmark description. `grade` is an enum (`kind: 'enum'`, values 0-4)
— the single input the renderer exposes. The example sets grade 4; its expected text is the grade
description (a small integer echoed in the result), so it round-trips through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("pituitary
adenoma cavernous sinus grade") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1179 calculators across 295 modules**.

## Two-hundred-fourteenth wave — the Koos grade (vestibular schwannoma) in lib/koos-schwannoma-v389.js (+1)

`koos-schwannoma` (spec-v389) applies the Koos grading of a vestibular schwannoma: given the grade, it
reports the extension/brainstem description. `grade` is an enum (`kind: 'enum'`, values I/II/III/IV) — the
single input the renderer exposes. The example sets grade IV; its expected text is the grade description
(a roman numeral + "fourth ventricle"), so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("vestibular schwannoma
grade") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1178
calculators across 294 modules**.

## Two-hundred-thirteenth wave — the Brodsky tonsil grading scale in lib/brodsky-tonsil-v388.js (+1)

`brodsky-tonsil` (spec-v388) applies the Brodsky grading scale for palatine tonsil size: given the grade,
it reports the oropharyngeal-width description. `grade` is an enum (`kind: 'enum'`, values 0-4) — the
single input the renderer exposes. The example sets grade 3; its expected text quotes the "50-75%" band,
echoed in the result, so it round-trips through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("tonsil size grade") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1177 calculators across 293
modules**.

## Two-hundred-twelfth wave — the Dimeglio clubfoot classification in lib/dimeglio-clubfoot-v387.js (+1)

`dimeglio-clubfoot` (spec-v387) sums the four Dimeglio reducibility parameters (0-4 enums) and the four
bonus features (booleans) into the 0-20 total and grade. The example (4/3/3/3, no bonus → 13, grade III)
sets only the four reducibility params, so those four are `required: true`; all four bonus flags are
`required: false` and default false. Its expected numbers (13, 20) are echoed in the band, so it
round-trips through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("clubfoot classification score") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1176 calculators
across 292 modules**.

## Two-hundred-eleventh wave — the Pirani clubfoot severity score in lib/pirani-clubfoot-v386.js (+1)

`pirani-clubfoot` (spec-v386) sums the six Pirani signs into the midfoot + hindfoot contracture scores
and a 0-6 total. Each of the six signs is an enum (`kind: 'enum'`, values 0 / 0.5 / 1) — the inputs the
renderer exposes. The example (1/1/0.5/1/1/1 → 5.5) sets all six fields, so all six adapter fields are
`required: true`; its expected numbers (5.5, 6, 2.5, 3) are echoed in the band, so it round-trips through
the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("clubfoot severity score") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1175 calculators across 291 modules**.

## Two-hundred-tenth wave — the Schwab & England ADL scale in lib/schwab-england-v385.js (+1)

`schwab-england` (spec-v385) applies the Schwab & England ADL scale: given the level, it reports the
functional-independence description. `percent` is a number-like enum (`kind: 'enum'`, values 0-100 in
steps of 10) — the single input the renderer exposes. The example sets 50; its expected text quotes "50%"
and "half", both echoed in the band, so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("parkinson adl scale") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1174 calculators
across 290 modules**.

## Two-hundred-ninth wave — the Spetzler-Ponce classification (cerebral AVM) in lib/spetzler-ponce-v384.js (+1)

`spetzler-ponce` (spec-v384) applies the Spetzler-Ponce 3-tier classification of a cerebral AVM: given
the class, it reports the Spetzler-Martin-grade grouping and surgical-risk level. `class` is an enum
(`kind: 'enum'`, values A/B/C) — the single input the renderer exposes. The example sets Class C; its
expected text is the class description (roman-numeral SM grades, no free numeric facts to round-trip), so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("AVM 3-tier classification") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1173 calculators across 289 modules**.

## Two-hundred-eighth wave — the Risser sign (skeletal maturity) in lib/risser-sign-v383.js (+1)

`risser-sign` (spec-v383) applies the Risser sign (US grading, 0-5) for skeletal maturity: given the
grade, it reports the ossification description. `grade` is an enum (`kind: 'enum'`, values 0-5) — the
single input the renderer exposes. The example sets grade 5; its expected text is the grade description (a
small integer already echoed in the band), so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("iliac apophysis
skeletal maturity") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1172 calculators across 288 modules**.

## Two-hundred-seventh wave — the Eichenholtz classification (Charcot neuroarthropathy) in lib/eichenholtz-charcot-v382.js (+1)

`eichenholtz-charcot` (spec-v382) applies the (modified) Eichenholtz staging of Charcot neuroarthropathy:
given the stage, it reports the temporal/radiographic description. `stage` is an enum (`kind: 'enum'`,
values 0/1/2/3) — the single input the renderer exposes. The example sets stage 1; its expected text is
the stage description (a small integer already echoed in the band), so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("charcot foot staging") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1171 calculators across 287 modules**.

## Two-hundred-sixth wave — the Winquist-Hansen classification (femoral shaft fracture) in lib/winquist-hansen-v381.js (+1)

`winquist-hansen` (spec-v381) applies the Winquist-Hansen classification of a femoral shaft fracture:
given the type, it reports the comminution/cortical-contact description. `type` is an enum
(`kind: 'enum'`, values 0/I/II/III/IV) — the single input the renderer exposes. The example sets type
III; its expected text quotes the "50%" width/contact thresholds, which the band echoes, so it round-trips
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("femoral shaft comminution") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1170 calculators across 286 modules**.

## Two-hundred-fifth wave — the Young-Burgess classification (pelvic ring injury) in lib/young-burgess-v380.js (+1)

`young-burgess` (spec-v380) applies the Young-Burgess mechanism-based classification of a pelvic ring
injury: given the pattern, it reports the mechanism/stability description. `pattern` is an enum
(`kind: 'enum'`, values LC-I..LC-III / APC-I..APC-III / VS / CM) — the single input the renderer exposes.
The example sets APC-III; its expected text is the pattern description (no free numeric facts to
round-trip), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pelvic ring injury mechanism") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1169 calculators across 285
modules**.

## Two-hundred-fourth wave — the Tile classification (pelvic ring injury) in lib/tile-pelvic-v379.js (+1)

`tile-pelvic` (spec-v379) applies the Tile (AO/Tile) classification of a pelvic ring injury: given the
type, it reports the stability description. `type` is an enum (`kind: 'enum'`, values A/B/C) — the single
input the renderer exposes. The example sets type C; its expected text is the type description (a letter,
no numeric facts to round-trip), so it flows through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("pelvic ring fracture stability") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1168 calculators
across 284 modules**.

## Two-hundred-third wave — the Delbet classification (pediatric femoral neck fracture) in lib/delbet-femoral-neck-v378.js (+1)

`delbet-femoral-neck` (spec-v378) applies the Delbet (Delbet-Colonna) classification of a pediatric
femoral neck fracture: given the type, it reports the anatomic description and the AVN-risk gradient.
`type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The
example sets type I; its expected text is the type description (a roman numeral, no numeric facts to
round-trip), so it flows through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pediatric femoral neck fracture") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1167 calculators across 283
modules**.

## Two-hundred-second wave — the Gartland classification (supracondylar humerus fracture) in lib/gartland-supracondylar-v377.js (+1)

`gartland-supracondylar` (spec-v377) applies the Gartland classification of a pediatric extension-type
supracondylar humerus fracture: given the type, it reports the displacement/hinge description. `type` is
an enum (`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The example sets
type III; its expected text is the type description (a roman numeral, no numeric facts to round-trip), so
it flows through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("supracondylar humerus fracture") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1166 calculators across 282 modules**.

## Two-hundred-first wave — the Denis classification (sacral fracture) in lib/denis-sacral-v376.js (+1)

`denis-sacral` (spec-v376) applies the Denis classification of a sacral fracture: given the zone, it
reports the anatomic/neurologic description. `zone` is an enum (`kind: 'enum'`, values I/II/III) — the
single input the renderer exposes. The example sets zone III; its expected text is the zone description (a
roman numeral, no numeric facts to round-trip), so it flows through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("sacral fracture
zone") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1165
calculators across 281 modules**.

## Two-hundredth wave — the Pipkin classification (femoral head fracture) in lib/pipkin-femoral-head-v375.js (+1)

`pipkin-femoral-head` (spec-v375) applies the Pipkin classification of a femoral head fracture: given the
type, it reports the description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single
input the renderer exposes. The example sets type III; its expected text is the type description (a roman
numeral, no numeric facts), so it round-trips through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("femoral head fracture") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1164 calculators across 280
modules** — the two-hundredth MCP wave.

## One-hundred-ninety-ninth wave — the Pauwels classification (femoral neck fracture) in lib/pauwels-femoral-neck-v374.js (+1)

`pauwels-femoral-neck` (spec-v374) applies the Pauwels classification of a femoral neck fracture: given
the type, it reports the angle/force description. `type` is an enum (`kind: 'enum'`, values I/II/III) —
the single input the renderer exposes. The example sets type III; its expected number (50) is the angle
threshold echoed in the band, so it round-trips through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("femoral neck fracture angle") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1163 calculators
across 279 modules**.

## One-hundred-ninety-eighth wave — the NI-RADS category (head & neck surveillance) in lib/ni-rads-v373.js (+1)

`ni-rads` (spec-v373) applies the NI-RADS categories for post-treatment head-and-neck-cancer surveillance
imaging: given the category, it reports the description. `category` is an enum (`kind: 'enum'`, values
1/2A/2B/3/4) — the single input the renderer exposes. The example sets 3; its expected text is the
category description (the numeral 3, no other numeric facts), so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("neck imaging reporting") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1162 calculators across 278 modules**. Completes the RADS family in the MCP registry.

## One-hundred-ninety-seventh wave — the CAD-RADS 2.0 category (coronary CTA) in lib/cad-rads-v372.js (+1)

`cad-rads` (spec-v372) applies the CAD-RADS 2.0 coronary-CTA categories: given the category, it reports
the stenosis description. `category` is an enum (`kind: 'enum'`, values 0/1/2/3/4A/4B/5) — the single
input the renderer exposes. The example sets 3; its expected numbers (50-69) are the stenosis band echoed
in the compute band, so it round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("coronary cta category") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1161 calculators across 277
modules**.

## One-hundred-ninety-sixth wave — the C-RADS category (CT colonography) in lib/c-rads-v371.js (+1)

`c-rads` (spec-v371) applies the C-RADS colonic categories for a CT colonography: given the category, it
reports the description. `category` is an enum (`kind: 'enum'`, values C0/C1/C2a/C2b/C3/C4) — the single
input the renderer exposes. The example sets C3; its expected text is the category description (the polyp
thresholds 10 and 6-9 are echoed in the band), so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("ct colonography
category") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1160 calculators across 276 modules**.

## One-hundred-ninety-fifth wave — the Hartofilakidis classification (hip dysplasia) in lib/hartofilakidis-ddh-v370.js (+1)

`hartofilakidis-ddh` (spec-v370) applies the Hartofilakidis classification of adult DDH: given the type,
it reports the description. `type` is an enum (`kind: 'enum'`, values A/B/C) — the single input the
renderer exposes. The example sets type B; its expected text is the type description (a letter, no
numeric facts), so it round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("hartofilakidis classification") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1159 calculators across 275
modules**.

## One-hundred-ninety-fourth wave — the Nohria-Stevenson profiles (acute heart failure) in lib/nohria-stevenson-v369.js (+1)

`nohria-stevenson` (spec-v369) derives the Nohria-Stevenson clinical hemodynamic profile (A/B/C/L). It is
a two-field tile: `congestion` (enum dry/wet) and `perfusion` (enum warm/cold), both required (both in
the example). The compute reports the profile and its congestion/perfusion state. The example (wet, cold
-> profile C) round-trips through the default `makeToArgs` with no custom toArgs (its expected text is
the profile description; no numeric facts). New adapter module registered in `mcp/catalog.js`; its golden
probe ("hemodynamic profile heart failure") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1158 calculators across 274 modules**.

## One-hundred-ninety-third wave — the Ross classification (pediatric heart failure) in lib/ross-hf-peds-v368.js (+1)

`ross-hf-peds` (spec-v368) applies the Ross classification of pediatric heart failure: given the class,
it reports the symptom description. `cls` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single
input the renderer exposes. The example sets class III; its expected text is the class description (a
roman numeral, no numeric facts), so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("pediatric heart failure
class") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1157
calculators across 273 modules**.

## One-hundred-ninety-second wave — the Penetration-Aspiration Scale in lib/pas-swallow-v367.js (+1)

`pas-swallow` (spec-v367) applies the Penetration-Aspiration Scale for a swallow study: given the score,
it reports the airway-invasion description and the penetration/aspiration category. `score` is an enum
(`kind: 'enum'`, values 1-8) — the single input the renderer exposes. The example sets score 6; its
expected number (6) round-trips through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("penetration aspiration scale") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1156 calculators across 272
modules**.

## One-hundred-ninety-first wave — the penetrating-neck-trauma zones in lib/neck-zone-v366.js (+1)

`neck-zone` (spec-v366) reports the anatomic zone of the neck (I-III) for penetrating trauma and its
structures at risk. `zone` is an enum (`kind: 'enum'`, values I/II/III) — the single input the renderer
exposes. The example sets Zone II; its expected text is the zone description (a roman numeral, no numeric
facts), so it round-trips through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("penetrating neck trauma zone") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1155 calculators across 271
modules**.

## One-hundred-ninetieth wave — the Prague C&M criteria (Barrett esophagus) in lib/prague-barrett-v365.js (+1)

`prague-barrett` (spec-v365) reports the Prague C&M notation for Barrett esophagus from the
circumferential (C) and maximal (M) extents. It is a two-field NUMERIC tile: `c` and `m` (`kind:
'number'`), both required (both in the example). The compute echoes C and M and reports the notation +
segment descriptor, so the example (C 2, M 5 -> Prague C2 M5) round-trips its numeric facts (2, 5)
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("barrett esophagus length") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1154 calculators across 270 modules**.

## One-hundred-eighty-ninth wave — the Clinical Activity Score (thyroid eye disease) in lib/cas-ted-v364.js (+1)

`cas-ted` (spec-v364) sums the Clinical Activity Score for thyroid eye disease. It is a seven-field
BOOLEAN checklist (each `kind: 'bool'`, left optional so absent items default to false); the compute
returns the total (0-7) and whether CAS >= 3 (active). The example checks three items (CAS 3); its
expected numbers (3, 7) round-trip through the default `makeToArgs` + toBool with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("thyroid eye disease activity") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1153
calculators across 269 modules**.

## One-hundred-eighty-eighth wave — the Shaffer gonioscopy angle grade in lib/shaffer-angle-v363.js (+1)

`shaffer-angle` (spec-v363) applies the Shaffer gonioscopy grading of the anterior chamber angle: given
the grade, it reports the angle-width description. `grade` is an enum (`kind: 'enum'`, values 0-4) — the
single input the renderer exposes. The example sets grade 1; its expected numbers (1, ~10 degrees)
round-trip through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("gonioscopy angle grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1152 calculators across 268 modules**.

## One-hundred-eighty-seventh wave — the Forrester hemodynamic classification in lib/forrester-hemodynamic-v362.js (+1)

`forrester-hemodynamic` (spec-v362) derives the Forrester hemodynamic subset (I-IV) from the cardiac
index and PCWP. It is a two-field NUMERIC tile: `ci` and `pcwp` (`kind: 'number'`), both required (both
in the example). The compute echoes the entered CI and PCWP in the band, so the example (CI 1.8, PCWP 24
-> subset IV) round-trips its numeric facts (1.8, 24, 55.5) through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("hemodynamic subset")
is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1151
calculators across 267 modules**.

## One-hundred-eighty-sixth wave — Tanner staging (Sexual Maturity Rating) in lib/tanner-staging-v361.js (+1)

`tanner-staging` (spec-v361) applies Tanner staging / SMR. Unlike the other tiles in this batch it is a
TWO-field tile: `scale` (enum breast/genital/pubic) and `stage` (enum 1-5), both in the example so both
required. The compute reports the standard description for the selected scale and stage. The example sets
scale breast, stage 2; its expected number (2) round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("sexual maturity
rating") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1150
calculators across 266 modules**.

## One-hundred-eighty-fifth wave — the Keith-Wagener-Barker hypertensive-retinopathy classification in lib/kwb-retinopathy-v360.js (+1)

`kwb-retinopathy` (spec-v360) applies the Keith-Wagener-Barker classification of hypertensive
retinopathy: given the grade, it reports the fundoscopic description. `grade` is an enum (`kind: 'enum'`,
values 1-4) — the single input the renderer exposes. The example sets grade 3; its expected number (3)
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("hypertensive retinopathy grade") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1149 calculators across 265 modules**.

## One-hundred-eighty-fourth wave — the NPIAP pressure injury staging in lib/pressure-injury-stage-v359.js (+1)

`pressure-injury-stage` (spec-v359) applies the NPIAP pressure injury staging: given the stage, it
reports the depth-of-tissue-loss description. `stage` is an enum (`kind: 'enum'`, values 1-4 /
unstageable / dtpi) — the single input the renderer exposes. The example sets Stage 3; its expected
number (3) round-trips through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pressure injury stage") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1148 calculators across 264 modules**.

## One-hundred-eighty-third wave — the Ramsay Sedation Scale in lib/ramsay-sedation-v358.js (+1)

`ramsay-sedation` (spec-v358) applies the Ramsay Sedation Scale: given the level, it reports the
awake/asleep state and the description. `level` is an enum (`kind: 'enum'`, values 1-6) — the single
input the renderer exposes. The example sets level 2; its expected number (2) round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("ramsay sedation scale") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1147 calculators across 263 modules**.

## One-hundred-eighty-second wave — the NYHA functional classification (heart failure) in lib/nyha-class-v357.js (+1)

`nyha-class` (spec-v357) applies the NYHA functional classification of heart failure: given the class, it
reports the symptom-limitation description. `cls` is an enum (`kind: 'enum'`, values I/II/III/IV) — the
single input the renderer exposes. The example sets class III; its expected text is the class description
(the class is a roman numeral), so it round-trips through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("heart failure functional class") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1146
calculators across 262 modules**.

## One-hundred-eighty-first wave — the CEAP classification (chronic venous disease) in lib/ceap-venous-v356.js (+1)

`ceap-venous` (spec-v356) applies the CEAP clinical classification of chronic venous disease: given the
clinical class, it reports the description. `cls` is an enum (`kind: 'enum'`, values C0-C6 incl.
C4a/C4b) — the single input the renderer exposes. The example sets C3; its expected text is the class
description (the class is a C-label), so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("chronic venous disease
class") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1145
calculators across 261 modules**.

## One-hundred-eightieth wave — the Lachman test grade (ACL laxity) in lib/lachman-acl-v355.js (+1)

`lachman-acl` (spec-v355) applies the Lachman test grade of ACL laxity: given the grade, it reports the
anterior-tibial-translation / endpoint description. `grade` is an enum (`kind: 'enum'`, values I/II/III)
— the single input the renderer exposes. The example sets grade II; its expected text is the grade
description (the grade is a roman numeral; the mm range is prose), so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("acl laxity grade") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1144 calculators across 260 modules**.

## One-hundred-seventy-ninth wave — the Tonnis classification (hip osteoarthritis) in lib/tonnis-hip-oa-v354.js (+1)

`tonnis-hip-oa` (spec-v354) applies the Tonnis classification of hip osteoarthritis: given the grade, it
reports the radiographic hip-OA description. `grade` is an enum (`kind: 'enum'`, values 0/1/2/3) — the
single input the renderer exposes. The example sets grade 2; its expected number (2) round-trips through
the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("hip osteoarthritis grade") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1143 calculators across 259 modules**.

## One-hundred-seventy-eighth wave — the Crowe classification (hip dysplasia) in lib/crowe-ddh-v353.js (+1)

`crowe-ddh` (spec-v353) applies the Crowe classification of adult developmental dysplasia of the hip:
given the grade, it reports the femoral-head subluxation description. `grade` is an enum (`kind: 'enum'`,
values I/II/III/IV) — the single input the renderer exposes. The example sets grade III; its expected
text is the grade description (the grade is a roman numeral; the percentage band is prose), so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("hip dysplasia grade") is promoted now that the tile is in the
MCP-exposed registry. Brings the exposed total to **1142 calculators across 258 modules**.

## One-hundred-seventy-seventh wave — the Lansky Play-Performance Scale (pediatric functional status) in lib/lansky-v352.js (+1)

`lansky` (spec-v352) applies the Lansky Play-Performance Scale: given the score, it reports the
play/activity description and the coarse functional band. `score` is an enum (`kind: 'enum'`, the eleven
steps 0/10/.../100) — the single input the renderer exposes. The example sets score 60; its expected
number (60) round-trips through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("pediatric performance status") is promoted now that
the tile is in the MCP-exposed registry. Brings the exposed total to **1141 calculators across 257
modules**.

## One-hundred-seventy-sixth wave — the Goligher classification (internal hemorrhoids) in lib/goligher-hemorrhoids-v351.js (+1)

`goligher-hemorrhoids` (spec-v351) applies the Goligher classification of internal hemorrhoids by degree
of prolapse: given the grade, it reports the prolapse description. `grade` is an enum (`kind: 'enum'`,
values I/II/III/IV) — the single input the renderer exposes. The example sets grade III; its expected
text is the grade description with no numeric facts (the grade is a roman numeral), so it round-trips
through the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("internal hemorrhoid grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1140 calculators across 256 modules**.

## One-hundred-seventy-fifth wave — the Tscherne classification (closed-fracture soft-tissue injury) in lib/tscherne-closed-v350.js (+1)

`tscherne-closed` (spec-v350) applies the Oestern-Tscherne closed-fracture soft-tissue classification:
given the grade, it reports the soft-tissue description. `grade` is an enum (`kind: 'enum'`, values
0/I/II/III, i.e. C0-C3) — the single input the renderer exposes. The example sets grade II; its expected
text is the grade description with no numeric facts (the grade is a roman numeral / C-label), so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("closed fracture soft tissue grade") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1139 calculators across 255 modules**.

## One-hundred-seventy-fourth wave — the Fazekas scale (white matter hyperintensities) in lib/fazekas-v349.js (+1)

`fazekas-wmh` (spec-v349) applies the Fazekas scale. Unlike the other classification tiles in this
batch it is a TWO-field tile: `pvh` (periventricular) and `dwmh` (deep white matter), each an enum
(`kind: 'enum'`, values 0/1/2/3). The compute reports both grades, their descriptions, and the combined
total. The example sets pvh=2, dwmh=2; its expected numbers (2, 2, combined 4 of 6) round-trip through
the default `makeToArgs` with no custom toArgs (the result echoes them in the band text and the
pvh/dwmh/total fields). New adapter module registered in `mcp/catalog.js`; its golden probe ("white
matter hyperintensity grade") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1138 calculators across 254 modules**.

## One-hundred-seventy-third wave — the Strasberg classification (bile duct injury) in lib/strasberg-bdi-v348.js (+1)

`strasberg-bdi` (spec-v348) applies the Strasberg classification: given the type, it reports the
bile-duct-injury description. `type` is an enum (`kind: 'enum'`, values A/B/C/D/E) — the single input
the renderer exposes. The example sets type D; its expected text is the type description with no numeric
facts (the type is a letter), so it round-trips through the default `makeToArgs` with no custom toArgs.
New adapter module registered in `mcp/catalog.js`; its golden probe ("bile duct injury type") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1137
calculators across 253 modules**.

## One-hundred-seventy-second wave — the Herring lateral pillar classification (Perthes) in lib/herring-pillar-v347.js (+1)

`herring-pillar` (spec-v347) applies the Herring lateral pillar classification: given the group, it
reports the lateral-pillar-height description. `group` is an enum (`kind: 'enum'`, values A/B/BC/C,
where BC is the B/C border group) — the single input the renderer exposes. The example sets group C;
its expected "< 50%" round-trips through the default `makeToArgs` with no custom toArgs (the result
echoes the 50 in the band text). New adapter module registered in `mcp/catalog.js`; its golden probe
("lateral pillar perthes") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1136 calculators across 252 modules**.

## One-hundred-seventy-first wave — the Catterall classification (Legg-Calve-Perthes) in lib/catterall-perthes-v346.js (+1)

`catterall-perthes` (spec-v346) applies the Catterall classification: given the group, it reports the
epiphyseal-involvement description. `group` is an enum (`kind: 'enum'`, values I/II/III/IV) — the
single input the renderer exposes. The example sets group III; its expected text is the group
description with no numeric facts (the group is a roman numeral), so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe
("perthes disease group") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1135 calculators across 251 modules**.

## One-hundred-seventieth wave — the Lichtman staging (Kienbock disease) in lib/lichtman-kienbock-v345.js (+1)

`lichtman-kienbock` (spec-v345) applies the Lichtman staging: given the stage, it reports the
radiographic description. `stage` is an enum (`kind: 'enum'`, values I/II/IIIA/IIIB/IV) — the single
input the renderer exposes. The example sets stage IIIB; its expected radioscaphoid angle (> 60
degrees) round-trips through the default `makeToArgs` with no custom toArgs (the result echoes the
angle in the band text). New adapter module registered in `mcp/catalog.js`; its golden probe ("kienbock
disease stage") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1134 calculators across 250 modules**.

## One-hundred-sixty-ninth wave — the Ficat-Arlet staging (femoral head AVN) in lib/ficat-arlet-v344.js (+1)

`ficat-arlet` (spec-v344) applies the Ficat-Arlet staging: given the stage, it reports the radiographic
description. `stage` is an enum (`kind: 'enum'`, values 0/I/II/III/IV) — the single input the renderer
exposes. The example sets stage III; its expected text is the stage description with no numeric facts
(the stage is a roman numeral), so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("avascular necrosis
staging hip") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1133 calculators across 249 modules**.

## One-hundred-sixty-eighth wave — the Sanders classification (calcaneal fracture) in lib/sanders-calcaneal-v343.js (+1)

`sanders-calcaneal` (spec-v343) applies the Sanders classification: given the type, it reports the
CT-fragmentation description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single
input the renderer exposes. The example sets type III; its expected text is the type description with
no numeric facts (the part / fracture-line counts are spelled as words), so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("calcaneal fracture type") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1132 calculators across 248 modules**.

## One-hundred-sixty-seventh wave — the Hawkins classification (talar neck fracture) in lib/hawkins-talar-v342.js (+1)

`hawkins-talar` (spec-v342) applies the Hawkins classification: given the type, it reports the
fracture-pattern description and the classically reported AVN-risk range. `type` is an enum
(`kind: 'enum'`, values I/II/III/IV) — the single input the renderer exposes. The example sets type
III; its expected AVN range (~70-100%) round-trips through the default `makeToArgs` with no custom
toArgs (the result echoes the range in `avnRisk` and the band text). New adapter module registered in
`mcp/catalog.js`; its golden probe ("talar neck fracture type") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1131 calculators across 247 modules**.

## One-hundred-sixty-sixth wave — the Mason-Johnston radial head fracture classification in lib/mason-radial-head-v341.js (+1)

`mason-radial-head` (spec-v341) applies the Mason-Johnston classification: given the type, it reports
the fracture-pattern description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV) — the single
input the renderer exposes. The example sets type III; its expected text is the type description (no
numeric facts), so it round-trips through the default `makeToArgs` with no custom toArgs. New adapter
module registered in `mcp/catalog.js`; its golden probe ("radial head fracture type") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1130 calculators across
246 modules**.

## One-hundred-sixty-fifth wave — the Clark level (melanoma invasion) in lib/clark-level-v340.js (+1)

`clark-level` (spec-v340) applies the Clark level: given the level, it reports the
anatomic-compartment description. `level` is an enum (`kind: 'enum'`, values I/II/III/IV/V) — the
single input the renderer exposes. The example sets level IV; its expected text is the level
description (no numeric facts), so it round-trips through the default `makeToArgs` with no custom
toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("melanoma invasion
level") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to
**1129 calculators across 245 modules**.

## One-hundred-sixty-fourth wave — the Cormack-Lehane laryngoscopy grade in lib/cormack-lehane-v339.js (+1)

`cormack-lehane` (spec-v339) applies the Cormack-Lehane classification: given the grade, it reports
the laryngeal-view description. `grade` is an enum (`kind: 'enum'`, values 1/2/3/4) — the single
input the renderer exposes. The example sets grade 3; its expected text is the grade description (the
grade number already appears in the field value, no other numeric facts), so it round-trips through
the default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("laryngoscopy view grade") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1128 calculators across 244 modules**.

## One-hundred-sixty-third wave — the ICRS cartilage lesion classification in lib/icrs-v338.js (+1)

`icrs-cartilage` (spec-v338) applies the ICRS (International Cartilage Repair Society) classification:
given the grade, it reports the depth-based cartilage-lesion description. `grade` is an enum
(`kind: 'enum'`, values 0/1/2/3/4) — the single input the renderer exposes. The example sets grade 4;
its expected text is the grade description (the grade number already appears in the field value; the
50% depth figures appear only in grades 2/3), so it round-trips through the default `makeToArgs` with
no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("cartilage
lesion depth grade") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1127 calculators across 243 modules**.

## One-hundred-sixty-second wave — the Outerbridge cartilage classification in lib/outerbridge-v337.js (+1)

`outerbridge-cartilage` (spec-v337) applies the Outerbridge classification: given the grade, it
reports the cartilage-damage description. `grade` is an enum (`kind: 'enum'`, values 0/I/II/III/IV) —
the single input the renderer exposes. The example sets grade IV; its expected text is the grade
description (no numeric facts — the 1.5 cm threshold appears only in grades II/III), so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("chondromalacia cartilage grade") is promoted now that the tile
is in the MCP-exposed registry. Brings the exposed total to **1126 calculators across 242 modules**.

## One-hundred-sixty-first wave — the JNET classification (magnifying NBI colorectal) in lib/jnet-v336.js (+1)

`jnet-classification` (spec-v336) applies the JNET (Japan NBI Expert Team) classification: given the
type, it reports its usual histologic correlate. `type` is an enum (`kind: 'enum'`, values
1/2A/2B/3) — the single input the renderer exposes. The example sets type 2B; its expected text is
the type description (no numeric facts), so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("japan nbi
expert team") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1125 calculators across 241 modules**.

## One-hundred-sixtieth wave — the NICE classification (NBI colorectal lesion) in lib/nice-v335.js (+1)

`nice-classification` (spec-v335) applies the NICE (NBI International Colorectal Endoscopic)
classification: given the type, it reports its usual histologic correlate. `type` is an enum
(`kind: 'enum'`, values 1/2/3) — the single input the renderer exposes. The example sets type 3;
its expected text is the type description (the type number already appears in the field value, no
other numeric facts), so it round-trips through the default `makeToArgs` with no custom toArgs. New
adapter module registered in `mcp/catalog.js`; its golden probe ("nbi polyp classification") is
promoted now that the tile is in the MCP-exposed registry. Brings the exposed total to **1124
calculators across 240 modules**.

## One-hundred-fifty-ninth wave — the Kudo pit-pattern classification in lib/kudo-v334.js (+1)

`kudo-pit-pattern` (spec-v334) applies the Kudo pit-pattern classification: given the pit-pattern
type, it reports its usual histologic correlate. `type` is an enum (`kind: 'enum'`, values
I/II/IIIS/IIIL/IV/V) — the single input the renderer exposes. The example sets type V; its expected
text is the type description (no numeric facts), so it round-trips through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("pit
pattern classification") is promoted now that the tile is in the MCP-exposed registry. Brings the
exposed total to **1123 calculators across 239 modules**.

## One-hundred-fifty-eighth wave — the Kikuchi classification (sessile submucosal invasion) in lib/kikuchi-v333.js (+1)

`kikuchi-level` (spec-v333) applies the Kikuchi classification: given the submucosal-invasion level,
it reports the description. `level` is an enum (`kind: 'enum'`, values Sm1/Sm2/Sm3) — the single
input the renderer exposes. The example sets level Sm3; its only numeric fact (~25%) already appears
verbatim in the compute's band string, so it round-trips through the default `makeToArgs` with no
custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("submucosal
invasion depth") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed
total to **1122 calculators across 238 modules**.

## One-hundred-fifty-seventh wave — the Haggitt classification (malignant colorectal polyp) in lib/haggitt-v332.js (+1)

`haggitt-level` (spec-v332) applies the Haggitt classification: given the invasion level, it reports
the description. `level` is an enum (`kind: 'enum'`, values 0/1/2/3/4) — the single input the
renderer exposes. The example sets level 4; its expected text is the level description (the level
number already appears in the field value, no other numeric facts), so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("malignant polyp invasion level") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1121 calculators across 237 modules**.

## One-hundred-fifty-sixth wave — the Fitzpatrick skin phototype in lib/fitzpatrick-v331.js (+1)

`fitzpatrick-skin-type` (spec-v331) applies the Fitzpatrick skin phototype: given the type, it
reports the description. `type` is an enum (`kind: 'enum'`, values I/II/III/IV/V/VI) — the single
input the renderer exposes. The example sets type III; its expected text is the phototype
description (roman-graded, no numeric facts), so it round-trips through the default `makeToArgs`
with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden probe ("skin
phototype") is promoted now that the tile is in the MCP-exposed registry. Brings the exposed total
to **1120 calculators across 236 modules**.

## One-hundred-fifty-fifth wave — the Nottingham Prognostic Index (breast cancer) in lib/nottingham-npi-v330.js (+1)

`nottingham-prognostic-index` (spec-v330) computes the Nottingham Prognostic Index for early
invasive breast cancer: NPI = (0.2 x tumor size in cm) + node stage + grade, with the prognostic
group. `size` is a number (cm); `nodeStage` and `grade` are enums (1/2/3). The example sets size
2.5 + node 2 + grade 2 (NPI 4.5, moderate); its band carries the "4.5" example number, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("nottingham prognostic index") is promoted now that the
tile is in the MCP-exposed registry. Brings the exposed total to **1119 calculators across 235
modules**.

## One-hundred-fifty-fourth wave — the Paris endoscopic classification in lib/paris-classification-v329.js (+1)

`paris-classification` (spec-v329) applies the Paris endoscopic classification of superficial
neoplastic lesions: given the morphologic type, it reports the description. `type` is an enum
(`kind: 'enum'`, values 0-Ip, 0-Is, 0-IIa, 0-IIb, 0-IIc, 0-III) — the single input the renderer
exposes. The example sets 0-IIc; its expected text carries the "0" from the type code, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("polyp morphology") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1118 calculators across 234 modules**.

## One-hundred-fifty-third wave — the Montreal classification of IBD in lib/montreal-ibd-v328.js (+1)

`montreal-ibd` (spec-v328) composes the Montreal IBD phenotype: for Crohn's disease the age
(A), location (L), and behavior (B) axes, or for ulcerative colitis the extent (E) and
severity (S) axes. `disease` is an enum (crohn / uc, defaulting to crohn); the Crohn's/UC
axes are enums; the +L4 and perianal (p) modifiers are booleans. Each field is optional --
the compute requires the relevant axes for the chosen disease. The example sets the Crohn's
A2/L3/B2 axes; its band carries the "17-40" example numbers, so it round-trips through the
default `makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`;
its golden probe ("crohn phenotype") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1117 calculators across 233 modules**.

## One-hundred-fifty-second wave — the ACR LI-RADS v2018 CT/MRI diagnostic categories in lib/li-rads-v327.js (+1)

`li-rads` (spec-v327) applies the ACR LI-RADS v2018 CT/MRI diagnostic categories: given the
category, it reports the descriptor and management. `category` is an enum (`kind: 'enum'`, values
LR-1..LR-5, LR-M, LR-TIV, LR-NC) — the single input the renderer exposes. The example sets LR-3;
its band carries the "3" and "6" (month) example numbers, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its golden
probe ("liver imaging category") is promoted now that the tile is in the MCP-exposed registry.
Brings the exposed total to **1116 calculators across 232 modules**.

## One-hundred-fifty-first wave — the ACR O-RADS US v2022 risk categories in lib/o-rads-v326.js (+1)

`o-rads` (spec-v326) applies the ACR O-RADS US v2022 ovarian-adnexal ultrasound risk categories:
given the category, it reports the descriptor, risk-of-malignancy band, and management. `category`
is an enum (`kind: 'enum'`, values 0/1/2/3/4/5) — the single input the renderer exposes. The
example sets category 4; its band carries the "10" and "50" example numbers, so it round-trips
through the default `makeToArgs` with no custom toArgs. New adapter module registered in
`mcp/catalog.js`; its golden probe ("ovarian mass risk category") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1115 calculators across 231 modules**.

## One-hundred-fiftieth wave — the ACR Lung-RADS v2022 assessment categories in lib/lung-rads-v325.js (+1)

`lung-rads` (spec-v325) applies the ACR Lung-RADS v2022 lung-cancer-screening assessment
categories: given the category, it reports the descriptor and the standard management. `category`
is an enum (`kind: 'enum'`, values 0/1/2/3/4A/4B/4X) — the single input the renderer exposes. The
example sets category 4A; its band carries the "3" (month) and "8" (mm) example numbers, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module registered
in `mcp/catalog.js`; its golden probe ("lung screening category") is promoted now that the tile is
in the MCP-exposed registry. Brings the exposed total to **1114 calculators across 230 modules**.

## One-hundred-forty-ninth wave — the Wexner (Cleveland Clinic) fecal incontinence score in lib/wexner-v324.js (+1)

`wexner` (spec-v324) sums the Wexner / Cleveland Clinic fecal incontinence score: five items
(incontinence to solid stool, liquid stool, gas; wears a pad; lifestyle alteration), each on
a 0-4 frequency scale, for a total of 0-20. `solid`, `liquid`, `gas`, `pad`, and `lifestyle`
are numbers (`kind: 'number'`), each optional (the compute defaults a missing item to 0). The
example sets 0/2/3/1/1 (total 7); its band carries the "7" and "20" example numbers, so it
round-trips through the default `makeToArgs` with no custom toArgs. New adapter module
registered in `mcp/catalog.js`; its golden probe ("fecal incontinence score") is promoted now
that the tile is in the MCP-exposed registry. Brings the exposed total to **1113 calculators
across 229 modules**.

## One-hundred-forty-eighth wave — the Siewert classification of GEJ adenocarcinoma in lib/siewert-v323.js (+1)

`siewert` (spec-v323) applies the Siewert classification of esophagogastric-junction
adenocarcinoma: given the type, it reports the type (I-III) and its standard anatomic
definition. `type` is an enum (`kind: 'enum'`, the select values 1/2/3; the compute also
accepts roman I-III) — the single input the renderer exposes. The example sets type 2; its
band carries the "1" and "2" (cm) example numbers, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("esophagogastric junction adenocarcinoma") is promoted now that the tile is in
the MCP-exposed registry. Brings the exposed total to **1112 calculators across 228 modules**.

## One-hundred-forty-seventh wave — the ACR BI-RADS assessment categories in lib/bi-rads-v322.js (+1)

`bi-rads` (spec-v322) applies the ACR BI-RADS breast-imaging assessment categories: given the
final assessment category, it reports the category (0-6, with 4A/4B/4C), its likelihood-of-
malignancy band, and the standard management. `category` is an enum (`kind: 'enum'`, values
0/1/2/3/4/4A/4B/4C/5/6) — the single input the renderer exposes. The example sets category 4B;
its band carries the "10" and "50" example numbers, so it round-trips through the default
`makeToArgs` with no custom toArgs. New adapter module registered in `mcp/catalog.js`; its
golden probe ("breast imaging category") is promoted now that the tile is in the MCP-exposed
registry. Brings the exposed total to **1111 calculators across 227 modules**.

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

### lib/billing-v83.js (spec-v629: non-clinical waves — administrative disclaimer)
- `npi-validate`
- `mbi-validate`
- `icd10-validate`
- `era-balance`
- `drg-payment`
- `apc-payment`

### lib/billing-v78.js (spec-v629 wave 3: MPFS payment — administrative disclaimer)
- `rvu-payment`
- `bilateral-pay`
- `multi-surgeon-pay`
- `sequestration-adjust`

### lib/billing-v79.js (spec-v629 wave 4: claim-edit engines — administrative disclaimer)
- `ncci-ptp`
- `mue-check`
- `global-period`
- `modifier-order`

### lib/billing-v80.js (spec-v629 wave 5: E&M / time coding — administrative disclaimer)
- `em-mdm-2023`
- `critical-care-time`
- `split-shared`
- `prolonged-services`
- `therapy-units`
- `anesthesia-units`

### lib/billing-v81.js (spec-v629 wave 6: drug / infusion billing — administrative disclaimer)
- `ndc-hcpcs-units`
- `drug-wastage`
- `infusion-hierarchy`

### lib/billing-v82.js (spec-v629 wave 7: patient responsibility / COB — administrative disclaimer)
- `medicare-cost-share`
- `cob-calc`
- `allowed-amount`
- `nsa-cost-share`

### lib/coding-v5.js + lib/ops-v63.js (spec-v629 wave 8: coding — administrative disclaimer)
- `em-time`
- `em-mdm`
- `ndc-convert`

### lib/ops-v63.js + lib/regulatory.js (spec-v629 wave 9: regulatory deadlines — administrative disclaimer)
- `appeal-deadline`
- `timely-filing`
- `pa-turnaround`
- `overpayment-60day`
- `breach-clock`

### lib/unit-convert.js (spec-v629 wave 10: pediatric weight conversion — administrative disclaimer)
- `peds-weight-conv`

### lib/dose-schedule.js (spec-v629 wave 11: next-dose scheduling — administrative disclaimer)
- `time-to-dose`

### lib/insulin-drip.js (spec-v629 wave 12: sliding-scale insulin-drip math — clinical disclaimer)
- `insulin-drip`

### lib/preg-dating.js (spec-v629 wave 13: deterministic pregnancy dating — clinical disclaimer)
- `preg-dating`

### lib/takayasu-v638.js (spec-v638: 2022 ACR/EULAR Takayasu arteritis classification — clinical disclaimer)
- `takayasu-acr-eular-2022`

### lib/gpa-v639.js (spec-v639: 2022 ACR/EULAR granulomatosis with polyangiitis classification — clinical disclaimer)
- `gpa-acr-eular-2022`

### lib/mpa-v640.js (spec-v640: 2022 ACR/EULAR microscopic polyangiitis classification — clinical disclaimer)
- `mpa-acr-eular-2022`

### lib/egpa-v641.js (spec-v641: 2022 ACR/EULAR eosinophilic granulomatosis with polyangiitis classification — clinical disclaimer)
- `egpa-acr-eular-2022`

### lib/yamaguchi-v642.js (spec-v642: Yamaguchi criteria for adult-onset Still disease — clinical disclaimer)
- `yamaguchi-aosd`

### lib/oswestry-v643.js (spec-v643: Oswestry Disability Index — clinical disclaimer)
- `oswestry-odi`

### lib/slums-v644.js (spec-v644: SLUMS cognitive screen — clinical disclaimer)
- `slums`

### lib/cheops-v645.js (spec-v645: CHEOPS pediatric pain scale — clinical disclaimer)
- `cheops`

### lib/mccormack-v646.js (spec-v646: McCormack Load-Sharing Classification — clinical disclaimer)
- `mccormack-lsc`

### lib/schenck-v647.js (spec-v647: Schenck knee-dislocation classification — clinical disclaimer)
- `schenck-knee`

### lib/weiss-v648.js (spec-v648: Weiss system for adrenocortical carcinoma — clinical disclaimer)
- `weiss-adrenal`

### lib/nottingham-grade-v649.js (spec-v649: Nottingham histologic grade for breast cancer — clinical disclaimer)
- `nottingham-grade`

### lib/masaoka-v650.js (spec-v650: Masaoka-Koga thymoma staging — clinical disclaimer)
- `masaoka-koga`

### lib/fnclcc-grade-v651.js (spec-v651: FNCLCC soft-tissue sarcoma grade — clinical disclaimer)
- `fnclcc-grade`

### lib/van-nuys-vnpi-v652.js (spec-v652: USC/Van Nuys Prognostic Index for DCIS — clinical disclaimer)
- `van-nuys-vnpi`

### lib/who-isup-renal-grade-v653.js (spec-v653: WHO/ISUP nucleolar grade for RCC — clinical disclaimer)
- `who-isup-renal-grade`

### lib/peritoneal-cancer-index-v654.js (spec-v654: Peritoneal Cancer Index (Sugarbaker) — clinical disclaimer)
- `peritoneal-cancer-index`

### lib/completeness-cytoreduction-v655.js (spec-v655: Completeness of Cytoreduction score — clinical disclaimer)
- `completeness-cytoreduction`

### lib/isgps-popf-v656.js (spec-v656: ISGPS 2016 postoperative pancreatic fistula grade — clinical disclaimer)
- `isgps-popf`

### lib/isgls-phlf-v657.js (spec-v657: ISGLS post-hepatectomy liver failure grade — clinical disclaimer)
- `isgls-phlf`

### lib/isgls-bile-leak-v658.js (spec-v658: ISGLS bile leak grade — clinical disclaimer)
- `isgls-bile-leak`

### lib/isgps-dge-v659.js (spec-v659: ISGPS delayed gastric emptying grade — clinical disclaimer)
- `isgps-dge`

### lib/pass-pheo-v660.js (spec-v660: PASS pheochromocytoma histologic score — clinical disclaimer)
- `pass-pheo`

### lib/ips-hodgkin-v661.js (spec-v661: IPS advanced Hodgkin lymphoma prognostic score — clinical disclaimer)
- `ips-hodgkin`

### lib/push-tool-v662.js (spec-v662: PUSH tool pressure ulcer scale for healing — clinical disclaimer)
- `push-tool`

### lib/lichtiger-index-v663.js (spec-v663: Lichtiger Index (UC activity) — clinical disclaimer)
- `lichtiger-index`

### lib/diastolic-function-ase-v664.js (spec-v664: ASE 2016 LV diastolic function screen — clinical disclaimer)
- `diastolic-function-ase`

### lib/cleveland-constipation-v665.js (spec-v665: Cleveland Clinic (Wexner) constipation score — clinical disclaimer)
- `cleveland-constipation`

### lib/vhwg-hernia-v666.js (spec-v666: VHWG ventral hernia grade — clinical disclaimer)
- `vhwg-hernia`

### lib/fgsi-v667.js (spec-v667: Fournier's Gangrene Severity Index — clinical disclaimer)
- `fgsi`

### lib/cac-agatston-v668.js (spec-v668: coronary artery calcium (Agatston) score — clinical disclaimer)
- `cac-agatston`

### lib/walter-index-v669.js (spec-v669: Walter Index, 1-year mortality after hospitalization — clinical disclaimer)
- `walter-index`

### lib/ottawa-bowel-prep-v670.js (spec-v670: Ottawa Bowel Preparation Scale — clinical disclaimer)
- `ottawa-bowel-prep`

### lib/acr-eular-boolean-v671.js (spec-v671: ACR/EULAR Boolean RA remission — clinical disclaimer)
- `acr-eular-boolean`

### lib/mda-psoriatic-v672.js (spec-v672: Minimal Disease Activity, psoriatic arthritis — clinical disclaimer)
- `mda-psoriatic`

### lib/heckerling-pneumonia-v673.js (spec-v673: Heckerling pneumonia prediction rule — clinical disclaimer)
- `heckerling-pneumonia`

### lib/osi-onychomycosis-v674.js (spec-v674: Onychomycosis Severity Index — clinical disclaimer)
- `osi-onychomycosis`

### lib/asrm-mania-v675.js (spec-v675: Altman Self-Rating Mania Scale — clinical disclaimer)
- `asrm-mania`

### lib/lund-kennedy-v676.js (spec-v676: Lund-Kennedy endoscopic score — clinical disclaimer)
- `lund-kennedy`

### lib/mcmahon-rhabdo-v677.js (spec-v677: McMahon Score for rhabdomyolysis — clinical disclaimer)
- `mcmahon-rhabdo`

### lib/meld3-v678.js (spec-v678: MELD 3.0 liver-allocation score — clinical disclaimer)
- `meld3`

### lib/gerdq-v679.js (spec-v679: GerdQ reflux disease questionnaire — clinical disclaimer)
- `gerdq`

### lib/kobayashi-kawasaki-v680.js (spec-v680: Kobayashi IVIG-resistance score — clinical disclaimer)
- `kobayashi-kawasaki`

### lib/sano-kawasaki-v681.js (spec-v681: Sano IVIG-resistance score — clinical disclaimer)
- `sano-kawasaki`

### lib/wang-bronchiolitis-v682.js (spec-v682: Wang Bronchiolitis Respiratory Score — clinical disclaimer)
- `wang-bronchiolitis`

### lib/effective-osmolality-v683.js (spec-v683: effective serum osmolality / tonicity — clinical disclaimer)
- `effective-osmolality`

### lib/fractional-excretion-potassium-v684.js (spec-v684: fractional excretion of potassium — clinical disclaimer)
- `fractional-excretion-potassium`

### lib/free-androgen-index-v685.js (spec-v685: Free Androgen Index — clinical disclaimer)
- `free-androgen-index`

### lib/ucsf-hcc-v686.js (spec-v686: UCSF criteria for HCC liver transplant — clinical disclaimer)
- `ucsf-hcc`

### lib/elemental-iron-ingested-v687.js (spec-v687: elemental iron ingested toxic-dose estimator — clinical disclaimer)
- `elemental-iron-ingested`

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

### lib/bi-rads-v322.js
- `bi-rads`

### lib/siewert-v323.js
- `siewert`

### lib/wexner-v324.js
- `wexner`

### lib/lung-rads-v325.js
- `lung-rads`

### lib/o-rads-v326.js
- `o-rads`

### lib/li-rads-v327.js
- `li-rads`

### lib/montreal-ibd-v328.js
- `montreal-ibd`

### lib/paris-classification-v329.js
- `paris-classification`

### lib/nottingham-npi-v330.js
- `nottingham-prognostic-index`

### lib/fitzpatrick-v331.js
- `fitzpatrick-skin-type`

### lib/haggitt-v332.js
- `haggitt-level`

### lib/kikuchi-v333.js
- `kikuchi-level`

### lib/kudo-v334.js
- `kudo-pit-pattern`

### lib/nice-v335.js
- `nice-classification`

### lib/jnet-v336.js
- `jnet-classification`

### lib/outerbridge-v337.js
- `outerbridge-cartilage`

### lib/icrs-v338.js
- `icrs-cartilage`

### lib/cormack-lehane-v339.js
- `cormack-lehane`

### lib/clark-level-v340.js
- `clark-level`

### lib/mason-radial-head-v341.js
- `mason-radial-head`

### lib/hawkins-talar-v342.js
- `hawkins-talar`

### lib/sanders-calcaneal-v343.js
- `sanders-calcaneal`

### lib/ficat-arlet-v344.js
- `ficat-arlet`

### lib/lichtman-kienbock-v345.js
- `lichtman-kienbock`

### lib/catterall-perthes-v346.js
- `catterall-perthes`

### lib/herring-pillar-v347.js
- `herring-pillar`

### lib/strasberg-bdi-v348.js
- `strasberg-bdi`

### lib/fazekas-v349.js
- `fazekas-wmh`

### lib/tscherne-closed-v350.js
- `tscherne-closed`

### lib/goligher-hemorrhoids-v351.js
- `goligher-hemorrhoids`

### lib/lansky-v352.js
- `lansky`

### lib/crowe-ddh-v353.js
- `crowe-ddh`

### lib/tonnis-hip-oa-v354.js
- `tonnis-hip-oa`

### lib/lachman-acl-v355.js
- `lachman-acl`

### lib/ceap-venous-v356.js
- `ceap-venous`

### lib/nyha-class-v357.js
- `nyha-class`

### lib/ramsay-sedation-v358.js
- `ramsay-sedation`

### lib/pressure-injury-stage-v359.js
- `pressure-injury-stage`

### lib/kwb-retinopathy-v360.js
- `kwb-retinopathy`

### lib/tanner-staging-v361.js
- `tanner-staging`

### lib/forrester-hemodynamic-v362.js
- `forrester-hemodynamic`

### lib/shaffer-angle-v363.js
- `shaffer-angle`

### lib/cas-ted-v364.js
- `cas-ted`

### lib/prague-barrett-v365.js
- `prague-barrett`

### lib/neck-zone-v366.js
- `neck-zone`

### lib/pas-swallow-v367.js
- `pas-swallow`

### lib/ross-hf-peds-v368.js
- `ross-hf-peds`

### lib/nohria-stevenson-v369.js
- `nohria-stevenson`

### lib/hartofilakidis-ddh-v370.js
- `hartofilakidis-ddh`

### lib/c-rads-v371.js
- `c-rads`

### lib/cad-rads-v372.js
- `cad-rads`

### lib/ni-rads-v373.js
- `ni-rads`

### lib/pauwels-femoral-neck-v374.js
- `pauwels-femoral-neck`

### lib/pipkin-femoral-head-v375.js
- `pipkin-femoral-head`

### lib/denis-sacral-v376.js
- `denis-sacral`

### lib/gartland-supracondylar-v377.js
- `gartland-supracondylar`

### lib/delbet-femoral-neck-v378.js
- `delbet-femoral-neck`

### lib/tile-pelvic-v379.js
- `tile-pelvic`

### lib/young-burgess-v380.js
- `young-burgess`

### lib/winquist-hansen-v381.js
- `winquist-hansen`

### lib/eichenholtz-charcot-v382.js
- `eichenholtz-charcot`

### lib/risser-sign-v383.js
- `risser-sign`

### lib/spetzler-ponce-v384.js
- `spetzler-ponce`

### lib/schwab-england-v385.js
- `schwab-england`

### lib/pirani-clubfoot-v386.js
- `pirani-clubfoot`

### lib/dimeglio-clubfoot-v387.js
- `dimeglio-clubfoot`

### lib/brodsky-tonsil-v388.js
- `brodsky-tonsil`

### lib/koos-schwannoma-v389.js
- `koos-schwannoma`

### lib/knosp-adenoma-v390.js
- `knosp-adenoma`

### lib/hardy-adenoma-v391.js
- `hardy-adenoma`

### lib/hill-flap-valve-v392.js
- `hill-flap-valve`

### lib/lauren-gastric-v393.js
- `lauren-gastric`

### lib/borrmann-gastric-v394.js
- `borrmann-gastric`

### lib/parks-fistula-v395.js
- `parks-fistula`

### lib/sievers-bav-v396.js
- `sievers-bav`

### lib/el-khoury-ar-v397.js
- `el-khoury-ar`

### lib/carpentier-mr-v398.js
- `carpentier-mr`

### lib/bismuth-corlette-v399.js
- `bismuth-corlette`

### lib/nyhus-hernia-v400.js
- `nyhus-hernia`

### lib/zargar-caustic-v401.js
- `zargar-caustic`

### lib/lauge-hansen-v402.js
- `lauge-hansen`

### lib/berndt-harty-v403.js
- `berndt-harty`

### lib/regan-morrey-v404.js
- `regan-morrey`

### lib/savary-miller-v405.js
- `savary-miller`

### lib/le-fort-v406.js
- `le-fort`

### lib/steinberg-avn-v407.js
- `steinberg-avn`

### lib/meyers-mckeever-v408.js
- `meyers-mckeever`

### lib/ideberg-glenoid-v409.js
- `ideberg-glenoid`

### lib/anderson-dalonzo-v410.js
- `anderson-dalonzo`

### lib/levine-edwards-v411.js
- `levine-edwards`

### lib/lisfranc-myerson-v412.js
- `lisfranc-myerson`

### lib/seinsheimer-subtroch-v413.js
- `seinsheimer-subtroch`

### lib/mayfield-perilunate-v414.js
- `mayfield-perilunate`

### lib/geissler-carpal-v415.js
- `geissler-carpal`

### lib/russe-scaphoid-v416.js
- `russe-scaphoid`

### lib/wassel-thumb-v417.js
- `wassel-thumb`

### lib/milch-condyle-v418.js
- `milch-condyle`

### lib/cotton-myer-v419.js
- `cotton-myer`

### lib/friedman-tongue-v420.js
- `friedman-tongue`

### lib/sun-ac-cell-v421.js
- `sun-ac-cell`

### lib/sun-ac-flare-v422.js
- `sun-ac-flare`

### lib/marsh-oberhuber-v423.js
- `marsh-oberhuber`

### lib/bethesda-thyroid-v424.js
- `bethesda-thyroid`

### lib/vur-grade-v425.js
- `vur-grade`

### lib/gell-coombs-v426.js
- `gell-coombs`

### lib/vaughan-williams-v427.js
- `vaughan-williams`

### lib/mrc-power-v428.js
- `mrc-power`

### lib/sarnat-hie-v429.js
- `sarnat-hie`

### lib/papile-ivh-v430.js
- `papile-ivh`

### lib/bell-nec-v431.js
- `bell-nec`

### lib/baden-walker-v432.js
- `baden-walker`

### lib/modic-changes-v433.js
- `modic-changes`

### lib/pfirrmann-disc-v434.js
- `pfirrmann-disc`

### lib/van-herick-v435.js
- `van-herick`

### lib/biffl-bcvi-v436.js
- `biffl-bcvi`

### lib/goutallier-v437.js
- `goutallier`

### lib/eaton-littler-v438.js
- `eaton-littler`

### lib/hamada-v439.js
- `hamada`

### lib/barrow-ccf-v440.js
- `barrow-ccf`

### lib/borden-davf-v441.js
- `borden-davf`

### lib/zabramski-v442.js
- `zabramski`

### lib/kadish-v443.js
- `kadish`

### lib/mccormick-v444.js
- `mccormick`

### lib/atlanta-pancreatitis-v445.js
- `atlanta-pancreatitis`

### lib/rop-stage-v446.js
- `rop-stage`

### lib/anderson-montesano-v447.js
- `anderson-montesano`

### lib/traynelis-v448.js
- `traynelis`

### lib/fielding-hawkins-v449.js
- `fielding-hawkins`

### lib/reid-bronchiectasis-v450.js
- `reid-bronchiectasis`

### lib/sade-retraction-v451.js
- `sade-retraction`

### lib/brooker-v452.js
- `brooker`

### lib/bado-v454.js
- `bado`

### lib/nunley-vertullo-v455.js
- `nunley-vertullo`

### lib/leddy-packer-v456.js
- `leddy-packer`

### lib/stulberg-v457.js
- `stulberg`

### lib/boyd-griffin-v458.js
- `boyd-griffin`

### lib/thompson-epstein-v459.js
- `thompson-epstein`

### lib/enneking-v460.js
- `enneking`

### lib/debakey-v461.js
- `debakey`

### lib/gmfcs-v462.js
- `gmfcs`

### lib/waldenstrom-perthes-v463.js
- `waldenstrom-perthes`

### lib/crawford-taaa-v464.js
- `crawford-taaa`

### lib/stamey-incontinence-v465.js
- `stamey-incontinence`

### lib/letournel-acetabulum-v466.js
- `letournel-acetabulum`

### lib/bromage-scale-v467.js
- `bromage-scale`

### lib/brouet-cryoglobulinemia-v468.js
- `brouet-cryoglobulinemia`

### lib/steinbrocker-ra-v469.js
- `steinbrocker-ra`

### lib/larsen-ra-v470.js
- `larsen-ra`

### lib/gass-macular-hole-v471.js
- `gass-macular-hole`

### lib/yerdel-pvt-v472.js
- `yerdel-pvt`

### lib/todani-choledochal-v473.js
- `todani-choledochal`

### lib/rastelli-avsd-v474.js
- `rastelli-avsd`

### lib/glogau-photoaging-v475.js
- `glogau-photoaging`

### lib/nash-moe-rotation-v476.js
- `nash-moe-rotation`

### lib/sfu-hydronephrosis-v477.js
- `sfu-hydronephrosis`

### lib/spaulding-classification-v478.js
- `spaulding-classification`

### lib/spitz-atresia-v479.js
- `spitz-atresia`

### lib/ahlback-knee-oa-v480.js
- `ahlback-knee-oa`

### lib/wiltse-spondylolisthesis-v481.js
- `wiltse-spondylolisthesis`

### lib/russell-taylor-subtroch-v482.js
- `russell-taylor-subtroch`

### lib/vancouver-periprosthetic-v483.js
- `vancouver-periprosthetic`

### lib/barrack-cement-v484.js
- `barrack-cement`

### lib/dejour-trochlea-v485.js
- `dejour-trochlea`

### lib/samilson-prieto-v486.js
- `samilson-prieto`

### lib/rockwood-ac-v487.js
- `rockwood-ac`

### lib/bigliani-acromion-v488.js
- `bigliani-acromion`

### lib/fernandez-radius-v489.js
- `fernandez-radius`

### lib/ruedi-allgower-pilon-v490.js
- `ruedi-allgower-pilon`

### lib/severin-ddh-v491.js
- `severin-ddh`

### lib/hattrup-johnson-v492.js
- `hattrup-johnson`

### lib/lown-ectopy-v493.js
- `lown-ectopy`

### lib/intermacs-profile-v494.js
- `intermacs-profile`

### lib/ranawat-myelopathy-v495.js
- `ranawat-myelopathy`

### lib/lodwick-grade-v496.js
- `lodwick-grade`

### lib/schobinger-avm-v497.js
- `schobinger-avm`

### lib/narakas-obpp-v498.js
- `narakas-obpp`

### lib/dorr-femur-v499.js
- `dorr-femur`

### lib/tegner-activity-v500.js
- `tegner-activity`

### lib/ludwig-hairloss-v501.js
- `ludwig-hairloss`

### lib/norwood-hairloss-v502.js
- `norwood-hairloss`

### lib/simpson-meningioma-v503.js
- `simpson-meningioma`

### lib/metavir-fibrosis-v504.js
- `metavir-fibrosis`

### lib/metavir-activity-v505.js
- `metavir-activity`

### lib/jerger-tympanogram-v506.js
- `jerger-tympanogram`

### lib/vhi10-v508.js
- `vhi10`

### lib/sunnybrook-facial-v509.js
- `sunnybrook-facial`

### lib/banff-tcmr-v510.js
- `banff-tcmr`

### lib/crafft-v511.js
- `crafft`

### lib/vaizey-v512.js
- `vaizey`

### lib/asrs-v513.js
- `asrs`

### lib/ymrs-v514.js
- `ymrs`

### lib/simpson-angus-v515.js
- `simpson-angus`

### lib/asthma-control-test-v516.js
- `asthma-control-test`

### lib/pipp-v517.js
- `pipp`

### lib/childhood-act-v518.js
- `childhood-act`

### lib/eckardt-v519.js
- `eckardt`

### lib/spigelman-v520.js
- `spigelman`

### lib/pc-ptsd5-v521.js
- `pc-ptsd5`

### lib/pcdai-v522.js
- `pcdai`

### lib/scadding-v523.js
- `scadding`

### lib/capd-v525.js
- `capd`

### lib/gray-weale-v524.js
- `gray-weale`

### lib/nsofa-v526.js
- `nsofa`

### lib/wayne-index-v527.js
- `wayne-index`

### lib/mest-c-v528.js
- `mest-c`

### lib/thwaites-v529.js
- `thwaites`

### lib/vesikari-v530.js
- `vesikari`

### lib/ehit-v531.js
- `ehit`

### lib/columbia-fsgs-v532.js
- `columbia-fsgs`

### lib/renal-angina-v533.js
- `renal-angina`

### lib/ridley-jopling-v534.js
- `ridley-jopling`

### lib/capthus-v535.js
- `capthus`

### lib/hardman-v536.js
- `hardman`

### lib/alsfrs-r-v537.js
- `alsfrs-r`

### lib/neos-v538.js
- `neos`

### lib/isl-lymphedema-v539.js
- `isl-lymphedema`

### lib/ishlt-rejection-v540.js
- `ishlt-rejection`

### lib/rachs1-v541.js
- `rachs1`

### lib/twstrs-severity-v542.js
- `twstrs-severity`

### lib/save-score-v543.js
- `save-score`

### lib/nems-v544.js
- `nems`

### lib/palm-coein-v545.js
- `palm-coein`

### lib/rasrm-stage-v546.js
- `rasrm-stage`

### lib/brue-v547.js
- `brue`

### lib/ppm-eoai-v548.js
- `ppm-eoai`

### lib/poseidon-v549.js
- `poseidon`

### lib/glass-stage-v550.js
- `glass-stage`

### lib/irecist-v551.js
- `irecist`

### lib/snot22-v552.js
- `snot22`

### lib/puqe24-v553.js
- `puqe24`

### lib/gags-v554.js
- `gags`

### lib/thi-v555.js
- `thi`

### lib/vasi-v556.js
- `vasi`

### lib/mswat-v557.js
- `mswat`

### lib/osdi-v558.js
- `osdi`

### lib/erez-dic-v559.js
- `erez-dic`

### lib/anaqeeb-aeeg-v560.js
- `anaqeeb-aeeg`

### lib/spadi-v561.js
- `spadi`

### lib/scp-pushing-v562.js
- `scp-pushing`

### lib/mayo-adpkd-v563.js
- `mayo-adpkd`

### lib/propkd-v564.js
- `propkd`

### lib/lupus-nephritis-indices-v565.js
- `lupus-nephritis-indices`

### lib/nih-cpsi-v566.js
- `nih-cpsi`

### lib/igcccg-v567.js
- `igcccg`

### lib/thakar-aki-v568.js
- `thakar-aki`

### lib/gapp-v569.js
- `gapp`

### lib/global-ards-v570.js
- `global-ards`

### lib/e-faced-v571.js
- `e-faced`

### lib/heaven-criteria-v572.js
- `heaven-criteria`

### lib/mapi-asthma-v573.js
- `mapi-asthma`

### lib/compera-2-v574.js
- `compera-2`

### lib/peradeniya-op-v575.js
- `peradeniya-op`

### lib/ablett-tetanus-v576.js
- `ablett-tetanus`

### lib/magic-gvhd-v577.js
- `magic-gvhd`

### lib/nancy-index-v578.js
- `nancy-index`

### lib/robarts-index-v579.js
- `robarts-index`

### lib/ehra-af-v580.js
- `ehra-af`

### lib/shanghai-brugada-v581.js
- `shanghai-brugada`

### lib/hlh-2004-v582.js
- `hlh-2004`

### lib/nac-attr-stage-v583.js
- `nac-attr-stage`

### lib/ebmt-score-v584.js
- `ebmt-score`

### lib/rucam-v585.js
- `rucam`

### lib/up-to-seven-v586.js
- `up-to-seven`

### lib/qpitt-v587.js
- `qpitt`

### lib/bologna-por-v588.js
- `bologna-por`

### lib/sternbach-v589.js
- `sternbach`

### lib/ffs-1996-v590.js
- `ffs-1996`

### lib/heffner-v591.js
- `heffner`

### lib/amsterdam-ii-v592.js
- `amsterdam-ii`

### lib/bethesda-v593.js
- `bethesda`

### lib/arc-hbr-v594.js
- `arc-hbr`

### lib/acef-v595.js
- `acef`

### lib/lepine-v596.js
- `lepine`

### lib/panc3-v597.js
- `panc3`

### lib/jta-thyroid-storm-v598.js
- `jta-thyroid-storm`

### lib/myxedema-coma-v599.js
- `myxedema-coma`

### lib/fisher-grade-v600.js
- `fisher-grade`

### lib/pollock-flickinger-v601.js
- `pollock-flickinger`

### lib/vras-v602.js
- `vras`

### lib/bauer-score-v603.js
- `bauer-score`

### lib/bilsky-escc-v604.js
- `bilsky-escc`

### lib/harrington-acetabular-v605.js
- `harrington-acetabular`

### lib/katagiri-v606.js
- `katagiri`

### lib/sartorius-hs-v607.js
- `sartorius-hs`

### lib/zulewski-v608.js
- `zulewski`

### lib/hijdra-v609.js
- `hijdra`

### lib/edinburgh-caa-v610.js
- `edinburgh-caa`

### lib/fried-frailty-v611.js
- `fried-frailty`

### lib/ut-diabetic-foot-v612.js
- `ut-diabetic-foot`

### lib/pedis-v613.js
- `pedis`

### lib/ocular-trauma-score-v614.js
- `ocular-trauma-score`

### lib/areds-v615.js
- `areds`

### lib/frisen-v616.js
- `frisen`

### lib/who-mucositis-v617.js
- `who-mucositis`

### lib/erefs-v618.js
- `erefs`

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
