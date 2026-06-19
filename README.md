<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>492 deterministic healthcare calculators tuned to the nurse on shift.</strong><br>
  Free forever. No servers, no accounts, no telemetry, no AI, no network call after first paint.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="docs/spec-v29.md">Scope &amp; audience</a> ·
  <a href="https://sophiewell.com/commitments/">8 commitments</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

Deterministic healthcare utilities, free forever, no servers, no accounts.

sophiewell.com is a single-page static website built for the **nurse on
shift** — primarily ICU and acute-care RN (CCRN / PCCN), then ED RN
(CEN), then floor / med-surg RN, then OR / PACU RN, then L&D / NICU RN —
with every relevant tile still served to doctors, pharmacists, RTs,
billers, coders, and EMS providers. It is, in posture, MDCalc with no
ads, no login, no upsell, no cookie banner, no email capture, and no
network call after first paint. Everything runs in the browser. There
is no AI of any kind. The data sources are public, bundled with the
page, and refreshed on a schedule. The site costs nothing to operate
beyond the domain renewal, so it can be free forever. The product
thesis, in one sentence: **MDCalc, but free, login-less, ad-less,
offline-capable, with a catalog tuned to the nurse on shift**
(see [docs/spec-v29.md](docs/spec-v29.md)). The one-line scope test:
a tile must consume at least one user input and produce a computed
output; "searchable lookup of static facts" does not qualify. See
[docs/spec-v10.md](docs/spec-v10.md) for the audience and
dependency-budget commitments and
[docs/spec-v29.md](docs/spec-v29.md) for the nurse-first pivot
and the v29 catalog ledger. At v112 close the catalog is 492
deterministic tiles — every one of them computes from at least
one user input. The catalog reached its present size on two tracks.
**New tiles:** spec-v63 added the operations counterpart to the bedside
surface — a shared regulatory-deadline engine ([lib/deadline.js](lib/deadline.js))
and five calculators (Medicare appeal-level deadlines, claim timely-filing,
the 2021 E/M Medical-Decision-Making level, the prior-authorization decision
clock, and the 60-day overpayment clock); spec-v64 added `calcium-replacement`,
the IV-calcium / elemental-calcium / gluconate↔chloride converter that closes
the one electrolyte the K/Mg/Phos `electrolyte-replacement` ladder omitted; and
spec-v65 added three bedside-physiology calculations a nurse still does on
scratch paper (`o2-cylinder-duration`, `minute-ventilation`, and
`cerebral-perfusion-pressure`, CPP = MAP − ICP). **Zero-new-tile hardening
(spec-v63 Part A, spec-v66 → spec-v76):** correctness fixes that aligned each
printed band to what the code actually computes — `abg` Boston-rules
compensation, the symmetric over-rapid-correction warning in
`acid-base-deficit`, the `ttkg` renal-wasting threshold, the indication-aware
`digoxin` floor, the `sas-riker` light-sedation goal band, and the reachable
`psi` Risk Class I — alongside denial→next-step ops routing, CFR-checklist
document generators, and a run of accessibility / rendering / offline repairs
(44px touch targets, theme-tracked `color-scheme`, a working SPA skip-link, a
complete-shell service-worker precache, and a guarded tool-page discovery
allowlist). Per-wave detail lives in the [CHANGELOG](CHANGELOG.md) and the spec
docs ([spec-v62](docs/spec-v62.md) through [spec-v76](docs/spec-v76.md), with the
offline shell precache finished in [spec-v84](docs/spec-v84.md) — every local
asset `index.html` loads is now precached, guarded so the list cannot drift).
**Advanced clinical calculators (spec-v85 program):** the
[spec-v85](docs/spec-v85.md) charter opens a fourteen-spec program that deepens
the physician-facing critical-care / subspecialty layer one rung above the
bedside score, under a binding doctrine (one-line determinism, no new bundled
dataset, primary-source citations, the output-safety contract) and a CI/CD
maintenance contract (build pipeline, merge gates, Class A/B staleness
machinery). Its first feature spec, [spec-v86](docs/spec-v86.md), ships three
deterministic toxicology decision rules — `serotonin-toxicity` (Hunter
criteria), `salicylate-toxicity` (EXTRIP hemodialysis indication), and
`toxic-alcohol` (ethanol-corrected osmolar gap + AACT fomepizole indication).
[spec-v87](docs/spec-v87.md) follows with three critical-care physiology
calculators in Group E — `hemodynamic-suite` (the PA-catheter cardiac-index /
SVR / PVR resistance suite, PVR reported in both dynes·s·cm⁻⁵ and Wood units per
ESC/ERS 2022), `mechanical-power` (the Gattinoni simplified power of
ventilation with the >17 J/min VILI-risk flag), and `dead-space` (the
Bohr-Enghoff Vd/Vt fraction with the EtCO₂-surrogate caveat).
[spec-v88](docs/spec-v88.md) adds three high-acuity endocrine/oncology
calculators — `dka-hhs` (the ADA hyperglycemic-crisis classification: DKA vs
HHS with mild/moderate/severe DKA grading, plus the computed anion gap and
effective serum osmolality, Group G), `calvert-carboplatin` (the AUC-based
carboplatin dose by the Calvert formula with the FDA estimated-GFR cap at 125
mL/min shown as a visible substitution, Group F), and `tls-cairo-bishop` (the
Cairo-Bishop tumor-lysis-syndrome laboratory/clinical grading with the
25%-change-from-baseline branch and the corrected-calcium criterion, Group G).
[spec-v89](docs/spec-v89.md) closes **Wave 1** of the spec-v85 program with four
subspecialty calculators (all Group G) — `das28` (the DAS28-ESR/DAS28-CRP
rheumatoid-arthritis disease-activity score with the EULAR
remission/low/moderate/high bands, the catalog's first rheumatology tile),
`kings-college` (the King's College Criteria for transplant referral in
acetaminophen-induced acute liver failure, with the pH limb, the three-part
coagulopathy/renal/encephalopathy limb, and the Bernal lactate modification),
`asa-ps` (the ASA Physical Status classification I–VI with the E-modifier rules
enforced), and `surgical-apgar` (the Gawande intraoperative 0–10 outcome score,
distinct from the neonatal Apgar).
[spec-v90](docs/spec-v90.md) opens **Wave 2** with six cardiology / ECG
computations — `ecg-axis` (the mean frontal-plane QRS axis by hexaxial `atan2`
geometry, with the all-isoelectric `(0,0)` input surfaced as "indeterminate
axis" rather than a spurious 0°, Group E), `lvh-criteria` (the Sokolow-Lyon and
Cornell ECG-LVH voltage criteria with the sex-specific Cornell threshold, Group
G), `timi-stemi` (the Morrow 2000 TIMI risk score for STEMI with the 30-day
mortality band, Group G), `duke-treadmill` (the Mark 1987 exercise-test
prognosis with the cited five-year survival, Group E), `cardiac-power-output`
(the Fincke `CPO = MAP×CO/451` watts with the <0.6 W cardiogenic-shock
threshold, Group E), and `aortic-valve-area` (the continuity-equation valve area
with the dimensionless index and the ASE/EACVI 2017 + 2020 ACC/AHA severity
bands, Group E). As the first Wave-2 spec it also authors the spec-v85 §6.3
warn-only monthly `scripts/check-citation-cadence.mjs` job, which annotates (but
never blocks) when a calendar-tracked Class-B citation row is overdue for
re-verification.
[spec-v91](docs/spec-v91.md) continues Wave 2 with five pulmonary-function /
chronic-respiratory computations that fill the gap beside the catalog's *acute*
respiratory surface (`aa-pf-suite`, `rox`, `curb-65`, `smart-cop`) —
`gold-spirometry` (the GOLD spirometric COPD grade off post-bronchodilator
`FEV1/FVC < 0.70` and FEV1 %predicted, Group G), `bode-index` (the Celli 2004
multidimensional COPD prognosis 0–10 with the 4-year survival quartile, Group G),
`gap-ipf` (the Ley 2012 GAP index for idiopathic pulmonary fibrosis with the
cannot-perform-DLCO limb and stage mortality, Group G), `predicted-spirometry`
(the GLI-2012 LMS predicted FEV1/FVC/ratio + lower limit of normal from compiled
coefficient/spline constants, Group E), and `mmrc-dyspnea` (the Bestall 1999
modified MRC dyspnea grade 0–4 that feeds BODE and the GOLD ABE assessment, Group
G).
[spec-v92](docs/spec-v92.md) continues Wave 2 with five nephrology computations
that close the **chronic / procedural** renal gap beside the catalog's existing
filtration / injury / dosing surface (`egfr-suite`, `fena-feurea`, `kdigo-aki`,
`cockcroft-gault`) — `ckd-staging` (the KDIGO 2024 CKD G×A risk heat-map cell
from eGFR and UACR, Group G), `uacr-upcr` (the spot urine albumin/protein-to-
creatinine ratios with the estimated 24-hour excretion and the KDIGO A-stage,
Group E), `ktv-urr` (the hemodialysis adequacy URR + Daugirdas second-generation
single-pool Kt/V against the KDOQI targets, Group E), `mehran-cin` (the Mehran
2004 contrast-induced-nephropathy risk score with the CIN / dialysis bands, Group
G), and `ckd-epi-cystatin` (the 2021 race-free CKD-EPI cystatin-C / combined /
creatinine eGFR, Group E).
The new `pa-lint` tile in spec-v52 consumes
dropped files instead of form fields and produces a
deterministic findings report, the first instance of the
`shape: 'document-linter'` tile shape. Catalog-truth invariants
([docs/spec-v46.md](docs/spec-v46.md)) fail CI on any drift
between `UTILITIES.length` and the public marketing copy.
Sophie's eight posture commitments
([docs/spec-v50.md](docs/spec-v50.md)) — no ads, no login, no
telemetry, no third-party fetch, no AI, no cookies, no paid
tier, MIT-licensed forever — are listed at
[/commitments/](https://sophiewell.com/commitments/) and
enforced by automated checks on every commit. Scoring tiles
expose a collapsed "where does this come from?" derivation block
([docs/spec-v48.md](docs/spec-v48.md)) — 126 carry one today —
with the verbatim source formula, study cohort, limits of
validity, and a live per-input contribution list whose component
sums are cross-checked in CI against the tile's own scoring
function.

## The problem

Bedside math — drug dose, drip rate, anion gap, eGFR adjustment,
sepsis-bundle clock, restraint re-check, Braden re-score —
lives in published clinical literature and institutional protocols.
The nurse on shift, the resident at 3 a.m., the medic in the
ambulance, and the pharmacist verifying a renal dose all reach
for the same calculators and arrive at the same number from the
same inputs. Existing options are paywalled, ad-laden, login-
gated, account-tied, or quietly telemetered — every one of which
adds friction to a 30-second decision at the bedside.

The meta-problem is that the workers who would benefit most from
fast, free, deterministic math are the ones least likely to have
a paid app handy at the moment they need it.

## The solution

Take the public datasets and the published clinical formulas, ship them to
the browser, do the lookups and math locally, and never phone home. A
single static page, a Content Security Policy that forbids outbound network
connections, and a service worker that caches the page for offline use.

## Quick start

Visit https://sophiewell.com. Save the page for offline use if desired. To
run locally, clone the repository and run `npm run dev`, which starts a
zero-dependency static server on http://localhost:4173 that applies the
production security headers. Any static file server will also work.

## How it works and how to use it

Since the spec-v29 nurse-first prune the catalog has grown one
reviewable spec at a time to **492** deterministic calculators
(the full per-version history is in [CHANGELOG.md](CHANGELOG.md)
and `docs/spec-v*.md`; the most recent bedside additions are
summarized in the cheat sheets below). They organize across the
bedside-shift surfaces a nurse, doctor, pharmacist, RT, EMS
provider, biller-coder, or educator actually reaches for. Every
tile takes at least one user input and produces a computed
output; searchable indexes of static facts are explicitly out of
scope (see [docs/spec-v29.md §3](docs/spec-v29.md) and
[docs/spec-v10.md §2.3](docs/spec-v10.md)). Tiles that sit in the
same clinical workflow cross-link: a "Related tools" row —
present across most of the catalog ([spec-v61](docs/spec-v61.md)
§2 A2) — puts the sibling a nurse reaches for next: `wells-pe` →
`perc` / `pesi` / `years-pe`, `cockcroft-gault` → the renal-dosing
tools, one tap away, with every link verified in CI to resolve to
a real tile.

**Clinical math & conversions** covers BMI, BSA suite, MAP /
pulse pressure / shock index, anion gap with delta-delta,
corrected Ca / Na, osmolal gap, A-a gradient and P/F suite,
Winter's formula, eGFR suite (CKD-EPI 2021 / MDRD / Cockcroft-
Gault), FENa / FEUrea, maintenance fluids (4-2-1), QTc suite,
pregnancy dating, pack-years, the universal unit converter,
sodium-correction planner (Adrogue-Madias), free water deficit,
predicted body weight + ARDSnet tidal volume, and RSBI.
**Medication & infusion** covers drip rate, weight-based dose,
concentration-to-rate, pediatric dose bounds, insulin drip,
anticoagulant reversal, opioid MME (CDC 2022), steroid and
benzodiazepine equivalence, antibiotic renal-dose adjustment,
vasopressor dose-to-rate (with VIS / Wernovsky IS), TPN
macronutrient, iron deficit (Ganzoni), and the v29 nursing-
shift additions for insulin correction, electrolyte
replacement ladders, CRRT dose, ECMO titration, and the MTP
ratio tracker.
**Clinical scoring & risk** covers GCS, APGAR, NIHSS / mNIHSS,
Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, TIMI, GRACE, HEART,
PERC, Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 / Child-
Pugh, Ranson / BISAP, Centor / McIsaac, Caprini, Bishop,
Alvarado / PAS, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog,
CIWA-Ar, COWS, ASCVD PCE, PREVENT 2023, Light's criteria,
Mentzer index, SAAG, R-factor liver injury, KDIGO AKI, ICH
Score, Hunt-Hess / WFNS, plus modified Sgarbossa, revised
cardiac risk index, PEWS / NEWS2 / NEWS2-escalation, every
v17-v28 risk-score tile, and the v29 bedside nursing screens
(Braden, Morse, Hendrich II, RASS, BPS, CPOT, ICDSC, CAM,
CAM-ICU, Aldrete / PADSS).
**Clinical criteria & diagnostic bundles** packages NPIAP
pressure-injury staging, Norton / PUSH wound assessment, the
VIP / INS extravasation criteria, ABO / Rh blood-product
compatibility, and the v17-v28 diagnostic bundles.
**Workflow & templates** carries the patient-visit generators
that survive v29 (appeal letter, HIPAA Right of Access, HIPAA
authorization, ROI request, discharge instructions, specialty-
visit questions, the wallet-card generator, and the SBAR
handoff template), plus the v29 nursing-shift workflow timers:
restraint timer, sepsis-bundle clock, code-blue clock, device-
day counter, Bristol / abdominal-girth tracker, and the vent
SBT readiness / ARDSnet PEEP-FiO2 ladder.
**Field medicine** covers NEXUS / Canadian C-Spine, CDC Field
Triage, START / JumpSTART, peds-weight-dose, burn surface area
and fluid resuscitation (Parkland / modified Brooke),
pediatric ETT sizing, naloxone dosing, the EMS documentation
helper, and the AVPU / GCS quick reference.
**Public health & infectious disease** covers tetanus
prophylaxis, rabies PEP, bloodborne pathogen exposure, TB
testing interpretation, and STI screening intervals. **Billing
& coding** is now sparse — the time-based E/M code selector,
the NDC 10 ↔ 11 digit converter, and the HIPAA 60-day breach
clock. Every static index (ICD-10-CM, HCPCS, CPT, NDC, POS,
modifier, revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS,
RxNorm, NDC↔RxNorm) was retired in spec-v29 wave 29-2 §2.1;
use your EHR, CMS, FDA, or NUBC source instead.

The user flow is simple: type what you need into the hero search
("wells PE", "CHA2DS2-VASc", "ICD-10", "magnesium replacement") or
follow one of the static browse links below it, enter input,
read output. The hero consults a hand-curated synonym table
(`data/synonyms.json`, spec-v7 section 3.2) before falling back to
fuzzy matching, and shows a one-line breadcrumb explaining why a
tile is recommended. (The spec-v7 §3.1 patient-artifact dropzone was
retired in the 2026-05-18 clinical-staff-first pivot; the
deterministic classifier under `lib/artifact-*.js` is retained for
possible future reuse on a clinical-input surface, but the home view
no longer wears it.) Every utility opens with its
inputs pre-filled from a worked example so the empty state is never
empty (a "Reset to example" link restores them after editing), and
the References region at the bottom shows the formula citation or
dataset stamp the result came from (spec-v9). Calculator state is
encoded in the URL hash so any view can be bookmarked or shared as
a permalink.

All computation happens in the browser. For the full picture, see
[docs/architecture.md](docs/architecture.md).

### Bedside-math cheat sheet (spec-v55 additions)

The thirteen Group-E calculators added in spec-v55, with the formula a nurse or
RT would otherwise run on scratch paper. Every denominator is guarded (a bad
input shows a `(…)` fallback, never a non-finite number), and each ships its
primary citation inline on the tile.

| Tile | Formula / output | Reaches for it |
|---|---|---|
| `anc` | WBC × (segs% + bands%) ÷ 100 → ANC + CTCAE grade | neutropenic-precautions / fever-emergency call |
| `retic-index` | retic% × (Hct ÷ 45) ÷ maturation factor → RPI | hypo- vs hyper-proliferative anemia |
| `tsat` | iron ÷ TIBC × pct → saturation + pattern | gating IV iron; absolute vs functional deficiency |
| `cci-platelet` | (Δplt × BSA) ÷ dose → CCI | platelet refractoriness on the transfusion service |
| `ldl-calc` | Friedewald + NIH/Sampson side by side | LDL when TG is high or LDL is low |
| `eag-a1c` | 28.7 × A1c − 46.7 → mg/dL and mmol/L | translating A1c to an average glucose |
| `cao2-do2` | (1.34·Hb·SaO₂) + (0.0031·PaO₂); ×CO×10 | O₂ content and delivery in shock |
| `oxygenation-index` | (FiO₂ · MAP · pct) ÷ PaO₂ → OI / OSI | PALICC-2 pediatric-ARDS severity |
| `driving-pressure` | plateau − PEEP; Vt ÷ ΔP → compliance | lung-protective ≤15 cmH₂O target |
| `ttkg` | (uK÷pK) ÷ (uOsm÷pOsm), with validity guard | hypo-/hyperkalemia renal work-up |
| `urine-anion-gap` | uNa + uK − uCl → sign | non-gap acidosis: GI loss vs RTA |
| `acid-base-deficit` | 0.5·wt·ΔHCO₃; TBW·ΔNa → deficits | planning replacement, with two-way over-rapid-Na warning (ODS up / cerebral edema down) |
| `schwartz-egfr` | 0.413 × height ÷ SCr → eGFR | pediatric renal dosing (ages 1–18) |

### Dosing & infusion cheat sheet (spec-v56 additions)

The thirteen Group-F medication/infusion calculators added in spec-v56. Each is
dosing decision-support, not a prescription, and renders the standing "verify
against institutional protocol and a current reference" notice. Two tiles
**refuse** outside their validity window rather than mislead.

| Tile | Output | Reaches for it |
|---|---|---|
| `heparin-nomogram` | weight-based bolus/rate + Raschke aPTT step | titrating the heparin drip |
| `vanc-auc` | first-order two-level AUC24/MIC vs 400–600 | dosing vancomycin with pharmacy |
| `aminoglycoside` | extended-interval dose + CrCl interval | once-daily gent/tobra/amikacin |
| `acetaminophen-nomogram` | Rumack-Matthew line → NAC or not (4–24 h only) | timed APAP level in the ED |
| `digoxin` | renal/age maintenance + level vs indication target (HF 0.5–0.9; AF rate-control 0.8–2.0 ng/mL) | starting/checking digoxin |
| `local-anesthetic-max` | mg/kg ceiling vs absolute cap → mg + mL | max safe local before LAST |
| `mgso4-preeclampsia` | load + maintenance mL/h, renal-halved default | the MgSO₄ drip on L&D |
| `pca-pump` | lockout-derived hourly max + limit check | programming a PCA safely |
| `sugammadex` | dose by depth of block on actual weight | reversing rocuronium in PACU |
| `ketamine-propofol` | initial dose + mL + re-dose increment | drawing up procedural sedation |
| `peds-fluid-deficit` | 4-2-1 maintenance + deficit schedule | the dehydrated peds admission |
| `peds-resus` | 10–20 mL/kg bolus, cardiac/DKA caution | the PALS fluid bolus |
| `conc-percent` | % ⇄ mg/mL ⇄ ratio | reading a crash-cart label (1:1000 = 1 mg/mL) |

### Screeners & decision-rule cheat sheet (spec-v57 additions)

The fourteen Group-G instruments added in spec-v57. Each is screening / decision
support, not a diagnosis. Two surface a **conditional threshold** so the user
sees why the determination flipped.

| Tile | Output | Reaches for it |
|---|---|---|
| `phq2-gad2` | PHQ-2 / GAD-2 totals, ≥3 positive flag | pre-gate before the full PHQ-9 / GAD-7 |
| `audit-full` | AUDIT 0–40, WHO zones at 8/16/20 | full alcohol-use screen beyond AUDIT-C |
| `dast10` | DAST-10 0–10 severity band | drug-use screen (item 3 reverse-scored) |
| `gds15` | GDS-15 0–15 depression band | depression in older adults (vs PHQ-9) |
| `ottawa-knee` | x-ray indicated vs deferrable | the knee that may not need a film |
| `nexus-chest` | chest imaging indicated vs deferrable | blunt chest trauma, avoiding CT |
| `sfsr` | CHESS high-risk vs low-risk | syncope disposition (7-day outcome) |
| `canadian-syncope` | score −3…+11, 30-day risk band | structured syncope risk |
| `edacs` | EDACS score + ADP low-risk gate | accelerated chest-pain disposition |
| `years-pe` | item count → 500/1000 D-dimer cutoff | PE rule-out without automatic CTPA |
| `feverpain` | 0–5, strep likelihood + antibiotic plan | sore throat antibiotic decision |
| `stone-score` | 0–13 ureteral-stone probability | flank pain, reducing CT |
| `iss-rts` | ISS 0–75 (+ major-trauma flag), RTS | trauma severity scoring |
| `sipa` | shock index vs age-banded cutoff | pediatric trauma triage |

### Neonatal, maternal & ICU cheat sheet (spec-v58 additions)

The twelve neonatal / maternal / pediatric-and-adult-ICU scores added in
<!-- catalog-truth:historical -->
spec-v58, closing the 50-tile expansion begun in v55 (255 → 307). Each is a
published instrument a bedside nurse already assigns by hand. Three apply
**age- or gestational-age-banded cutoffs** automatically and show the active
band; three neonatal scores and `braden-q` state their **direction**
(higher-vs-lower = worse) explicitly so a cross-reading nurse cannot invert it.

| Tile | Output | Reaches for it |
|---|---|---|
| `ballard` | maturity score → GA = 24 + 0.4 × score, ±2 wk | NICU/nursery gestational-age assignment |
| `finnegan` | modified NAS total, ≥8 / ≥12 trend bands | neonatal abstinence rescoring |
| `silverman-andersen` | 0–10, higher = worse | neonatal respiratory severity |
| `downes` | 0–10, mild/moderate/severe | neonatal respiratory distress |
| `bhutani-bilirubin` | Bhutani risk zone + AAP-2022 photo threshold | hour-specific bilirubin / phototherapy gate |
| `qbl-pph` | quantitative blood loss + CMQCC risk tier | L&D obstetric-hemorrhage bundle |
| `pelod2` | 0–33, age-banded MAP/creatinine | pediatric organ-dysfunction |
| `psofa` | 0–24, age-adjusted CV/renal | pediatric SOFA companion to adult |
| `burch-wartofsky` | <25 / 25–44 / ≥45 thyroid-storm bands | endocrine-emergency decision support |
| `ariscat` | low / intermediate / high PPC risk | postoperative pulmonary risk |
| `apache2` | 0–71 + approximate ICU mortality band | ICU severity-of-illness |
| `braden-q` | 7–28, lower = worse, at-risk ≤16 | pediatric pressure-injury risk |

### Medication-safety, electrolyte/fluid & OB/peds cheat sheet (spec-v61 additions)

Twelve bedside computations a nurse otherwise does by hand — the v61 wave
(307 → 319). Each computes an output from input (passes the
[spec-v29](docs/spec-v29.md) §3 one-line test), ships its primary citation
inline with a DOI, and renders an explicit **"estimate / verify per local
protocol and an independent double-check"** note on every dosing/replacement
tile: the order stays with the clinician and the pharmacy.

| Tile | Output | Reaches for it |
|---|---|---|
| `urine-output` | mL/kg/hr + KDIGO oliguria/AKI bands | hourly Foley check |
| `gir` | glucose infusion rate (mg/kg/min), 4–8 target | NICU dextrose titration |
| `ebv-mabl` | estimated blood volume + max allowable blood loss | OR/L&D transfusion threshold |
| `corrected-phenytoin` | albumin-corrected level (Sheiner-Tozer) + ESRD variant | "low" level in hypoalbuminemia |
| `potassium-deficit` | coarse total-body K deficit (mEq) + repletion caveats | hypokalemia repletion planning |
| `magnesium-replacement` | banded MgSO₄ dose by severity | hypomagnesemia repletion |
| `rhig-dose` | RhIG vials from Kleihauer-Betke % (÷30, round, +1) | post-positive-KB L&D |
| `peds-transfusion-volume` | weight-based PRBC volume (mL), 10–15 mL/kg band | neonatal/peds transfusion |
| `iv-osmolarity` | estimated mOsm/L + ~900 peripheral-vs-central flag | PN line-route decision |
| `burn-uop-target` | hourly UOP target (mL/hr) you titrate LR to | burn resuscitation |
| `fluid-balance` | net I&O (mL) + % body weight, >10% overload flag | end-of-shift handoff tally |
| `carb-insulin-bolus` | meal + correction bolus (units), shown separately | carb-counting mealtime dose |

The wave also added **related-tool links** (`META[id].related`, rendered as a
"Related tools" row in the citation block — e.g. `wells-pe` → `perc` / `pesi` /
`years-pe`). The rollout is now complete: a single reviewable `RELATED_BACKFILL`
map (spec-v61 A2) carries the linking across the catalog — **314 curated
sibling clusters**, grouped by clinical family — with every link verified in CI
to resolve to a real tile and each list capped at four siblings so the row never
crowds the result at 320px.
The wave also added a **"Copy link"** affordance next to "Copy all" that copies the
deep link (hash-state already encodes the inputs), so a populated calculation
can be handed to a colleague with no new persistence and no network. The shared
printable template ([lib/print.js](lib/print.js), with its "No data was sent or
stored" footer) now also covers the **SBAR handoff** and **code-blue summary**
tiles (spec-v61 A6), so a nurse can print a structured handoff or a code
timeline straight from the tile.

**Interpretation-band parity (spec-v61 A8).** Every backfilled score now shows a
source-anchored "Per source:" band block under its citation — the verbatim
meaning of the number from the instrument's own paper, not Sophie's phrasing.
The pass raised `META[id].interpretation` coverage from 150 to 196 of the
catalog's scores, covering the recent bedside scores plus classics
(APGAR, qSOFA, MELD,
Ranson, Alvarado, AUDIT-C, ASCVD/PREVENT, KDIGO-AKI, ARISCAT, APACHE II, Braden
Q, and more). The bands are authored as one reviewable merge map in
[lib/meta.js](lib/meta.js) and render through the shared `renderMetaBlock` with
zero per-view wiring; a CI guard ([test/unit/meta-interpretation.test.js](test/unit/meta-interpretation.test.js))
pins every band to `sourceQuoted: true`, a non-empty `sourceCitation`, ≤200
chars, and no Sophie-authored phrasing. A second invariant in the same guard
requires every tile that carries discrete `derivation.bands` (a score with named
result cut-points) to also carry an interpretation block, so the "where the
number comes from" and "what it means per source" displays cannot drift apart;
continuous-mortality scores (`pelod2`, `psofa`) omit discrete bands and stay out
of the rule. The final tile to satisfy this was `pews` (Brighton PEWS), whose
interpretation restates its Monaghan-2005 escalation thresholds.

**Opt-in input persistence (spec-v61 A7).** Tiles with numeric/choice inputs
show a **"Remember my inputs on this device"** toggle in the references block,
**off by default**. When a nurse opts in, that tile's values are written to
`localStorage` ([lib/input-persist.js](lib/input-persist.js)) so reopening it
next shift skips re-entering constants. Only `number`/`range`/`checkbox`/`radio`
inputs and `<select>` values are stored — free-text and `<textarea>` are never
persisted, so a name, allergy, or clinical note cannot reach storage. The two
keys (`sw-remember`, `sw-saved-inputs`) are string literals on the
[storage allowlist](scripts/storage-allowlist.json) enforced by
`check-commitments`; unchecking the toggle erases both. Remembered values fill
fields a deep link did not set and win over the example. Nothing leaves the
device — the CSP still blocks every network egress.

**Unit toggles & chart-ready copy (spec-v61 A4/A3).** The Group E clinical-math
tiles now meet the nurse in her own units. `bmi`, `bsa`, and `cockcroft-gault`
carry a per-field unit `<select>` (weight kg⇄lb, height m/cm⇄in, creatinine
mg/dL⇄µmol/L) driven by the existing [lib/unit-convert.js](lib/unit-convert.js)
converters; each option converts to the canonical unit *before* the formula
runs, so the math is untouched and — because the canonical unit is always the
default — every documented example and deep-link hash reproduces a calculation
byte-identically. The input+select row wraps, so it never forces horizontal
scrolling on the narrowest phones. Alongside, the multi-output tiles build their results as `{label, value, units}`
items and render a **"Copy results"** button that pastes clean
`Label: Value Units` lines via [lib/clipboard.js](lib/clipboard.js)
`formatCopyAll` — a chart-ready paste instead of a scraped `innerText` blob.
The labeled copy covers the Group E math tiles (`bsa`, `anion-gap`,
`corrected-sodium`, `aa-gradient`), the five 2+-numeric-output v61 bedside tiles
(`ebv-mabl`, `peds-transfusion-volume`, `rhig-dose`, `fluid-balance`,
`carb-insulin-bolus`), the six multi-output Group V5 lab / clinical-math tiles
(`sodium-correction`, `free-water-deficit`, `iron-ganzoni`, `pbw-ardsnet`,
`lights`, `corrected-anion-gap`), the three Group F medication / infusion tiles
(`drip-rate`, `tpn-macro`, `insulin-correction`, the latter two folding their
headline total into the copied list as `anion-gap-dd` does), and — through the
same shared `resultRow` helper — the three Group I field-medicine tiles
(`burn-fluid`, `peds-ett`, `naloxone`, where `burn-fluid` folds the Parkland and
Modified-Brooke schedules into one copyable block) and the five Group V7
oxygenation / renal-acid / lipid tiles (`ldl-calc`, `cao2-do2`,
`oxygenation-index`, `driving-pressure`, `acid-base-deficit`, each emitting
two-to-four computed numeric results) — exactly the values a nurse or medic
pastes into a transfusion, I&O, electrolyte-correction, ventilator, pump, TPN,
insulin, burn-resuscitation, airway, lipid, or oxygen-delivery chart, with
on-screen text byte-identical to the prior hand-built list. All twenty-six are
pinned by
[test/integration/unit-toggle.spec.js](test/integration/unit-toggle.spec.js)
(alternate-unit parity, example-prefill parity, the labeled-copy affordance, and
a 320px no-overflow assertion).

The A4 weight toggle then rolled out to the dosing tiles. The helpers were
extracted to [lib/field-units.js](lib/field-units.js) and a **kg⇄lb** toggle
added to every weight-bearing dosing tile in Group F (`weight-dose`,
`conc-rate`, `vasopressor`, `crrt-dose`, `ecmo-titration`) and the twelve v61
bedside tiles (`urine-output`, `gir`, `ebv-mabl`, `potassium-deficit`,
`peds-transfusion-volume`, `burn-uop-target`, `fluid-balance`) — so a US nurse
who weighs a patient in pounds skips the hand-conversion before a weight-based
dose, infusion rate, or hourly urine-output check. The converter feeds the
canonical kg value to both the formula and the `boundsAdvisory()` plausibility
note, so result and advisory match the kg entry exactly; the cross-group
lb-parity test in `unit-toggle.spec.js` pins it. The A1 derivation tail is being
worked down one verified wave at a time (the additive screeners `sirs`, `apfel`,
and `aims65`; then the ED scores `feverpain`, `canadian-syncope`, and
`stone-score`; then `padua`, `epworth`, and `nrs2002`; then the 0-2-per-sign
bedside scores `apgar`, `silverman-andersen`, and `downes`; then the PE-prognosis
scores `pesi` and `spesi` with the pediatric `nigrovic` meningitis score; then the
GI-bleed risk family `gbs`, `rockall`, and `oakland` (the first banded-weight
wave, each band encoded as a `points` callback); then the ICU-prognosis additive
indices `nutric`, `mnutric`, and `mods`; then the specialty point scales
`burch-wartofsky`, `ariscat`, and `braden-q`; then the high-value scores `hacor`,
`vis`, and `charlson`; then the array-scored screeners `audit-full`, `dast10`, and
`gds15` (their reverse-scored items made explicit); then the pediatric/neonatal
bedside scales `nips`, `cries`, and `peds-gcs`; then the age-banded pediatric
organ-dysfunction scores `pelod2` and `psofa`; then `apache2` (the APACHE II
adult-ICU severity score, twelve banded variables); then `mnihss` (the modified
NIHSS stroke scale); then `finnegan` (the modified Finnegan neonatal-abstinence
score) — 112
additive scores now carry a derivation whose component sums are cross-checked in
CI, within the 126 that carry a derivation block in all (the spec-v62 A5
named-formula tiles add a substituted-formula line instead of a component sum)). The A3
labeled copy then extended to the six multi-output Group V5 lab / clinical-math
tiles (wave 2), the three Group F medication / infusion tiles (wave 3), the
three Group I field-medicine tiles (wave 4), and the five Group V7 oxygenation /
renal-acid / lipid tiles (wave 5) above — completing the multi-numeric rollout;
the remaining hand-built lists (single value plus an interpretation line,
unit-conversion / dose-time utilities, and workflow checklists) keep the
universal "Copy all".

### ICU-infusion, med-surg & OB/neonatal cheat sheet (spec-v62 Part B)

Nine bedside computations across two waves, plus the conversion of the catalog's
last two static reference tables into calculators (Part C). Wave 1 shipped seven
unambiguous tiles; wave 2 added the two pinned-constant tiles — `norepi-equiv`
(Kotani 2023 norepinephrine-equivalent factors) and `neo-phototherapy` (AAP-2022
phototherapy + exchange-transfusion curves). This takes the catalog
<!-- catalog-truth:historical -->
to 328 (a net +9 from the prior wave).
Every tile is a pure `lib/clinical-v8.js` function, validated through
[lib/num.js](lib/num.js) (so a zero/non-finite/out-of-range input throws a
caught `TypeError`/`RangeError`, never a `NaN`), fuzz-covered by the spec-v59
object-aware harness, and ships its primary citation inline with a DOI. Every
dosing/reversal tile renders the explicit **"planning estimate, not an order —
verify against local protocol and an independent double-check"** notice.

| Tile | Output | Reaches for it |
|---|---|---|
| `infusion-time-remaining` | time-to-empty (hh:mm) + the inverse rate-to-last-N-hours | "when do I hang the next bag?" |
| `enteral-free-water` | free water in formula (mL/day) + flush-to-goal (mL, per shift) | the "free-water flush q6h" order |
| `apap-24h-max` | 24-hour acetaminophen total vs the selected ceiling, over-flag | hidden combination-product overdose |
| `icu-nutrition-target` | energy (kcal/day) + protein (g/day) target ranges | ASPEN/SCCM feeding target |
| `vte-prophylaxis-dose` | enoxaparin dose + interval, CrCl <30 reduction flagged | VTE prophylaxis/treatment dosing |
| `neonatal-feeding-volume` | total daily + per-feed volume (mL) | NICU/postpartum feed setup |
| `oxytocin-titration` | mU/min ⇄ mL/hr both directions | every L&D titration step |

**Part C — the last two static tables, now calculators.** `peds-dose` went from
a fixed per-kg table to a **weight-driven quick-dose panel** (each drug computed
to actual mg at the entered weight with the per-dose cap applied and flagged),
and `anticoag-reversal` went from an agent table to a **weight/INR-driven
reversal-dose calculator** (4F-PCC Kcentra INR-band dosing with the 100 kg
dosing-weight cap, idarucizumab 5 g, andexanet ANNEXA-4, protamine
1 mg/100 units max 50 mg). Both keep their ids and permalinks, both now pass the
[spec-v29](docs/spec-v29.md) §3 one-line test — and removing the two
`lookup-table` blocks also retired the **last two horizontally-scrolling tables**
in the catalog, so the 320px no-horizontal-scroll sweep now has no `table-scroll`
region left to guard on a clinical tile.

**Part A depth pass — landed in waves on the existing tiles (no count change).**
A1 (serial/trend mode, `lib/trend.js`) is wired onto the early-warning family
(`news2`, `mews`, `pews`), the hemoglobin-drop tiles (`gbs`, `oakland`), and
`sodium-correction`. A2 (the source-anchored "next step" action field,
`META[id].actions`) is seeded on `kdigo-aki`, `ciwa`, and `cows`. A5 (the
**substituted-formula derivation** — the published equation with the user's own
numbers plugged in and the arithmetic carried through) is **complete** across all
nine named formula tiles: `cockcroft-gault`, `corrected-sodium`, `aa-gradient`,
`osmolal-gap`, `winters`, `fena-feurea`, `egfr`, `drip-rate`, and `burn-fluid`.
Each substituted line is guarded at both the author layer (returns `null` on any
missing / non-finite / non-positive input) and the render layer (refuses any
string carrying a `NaN`/`Infinity`/`undefined` token), so a bad input can never
reach the panel. A4 (the **SI⇄conventional lab toggle**, the v61 per-field
`<select>` mechanism) is rolling out wave-by-wave: wave 1 wired glucose, BUN,
calcium, and albumin toggles onto the Group E correction tiles (`corrected-calcium`,
`corrected-sodium`, `corrected-ca-na`, `osmolal-gap`); wave 2 extended the albumin
toggle to the anion-gap and ascites tiles (`anion-gap`, `anion-gap-dd`, `saag`),
preserving the optional-albumin empty-check; wave 3 added a magnesium
(mg/dL ⇄ mmol/L) toggle to `magnesium-replacement`; and **wave 4 (the final
wave) completed the rollout** — bilirubin (mg/dL ⇄ µmol/L) on the hepatic and
neonatal tiles (`meld-childpugh`, `maddrey-lille`, `bhutani-bilirubin`,
`psofa`, `neo-phototherapy`), lactate on `pelod2`, and ionised/total calcium on
the three CRRT citrate fields (`crrt-dose`). The canonical compute unit is
always the default option, so every documented example and deep link stays
byte-identical (the example-correctness e2e sweep proves it). Lactate and the
CRRT calcium fields are **SI-canonical** (mmol/L is the compute unit, so mmol/L
is the default and the conventional mg/dL alternate converts up) — the inverse
layout of the conventional-default analytes. A4 is now complete for every
lab-input field with a real consumer; phosphate has none (its only candidate,
`electrolyte-replacement`, carries a polymorphic level field whose unit follows
the K/Mg/phosphate selector, so a fixed toggle does not fit).

A3 (the **reverse-solve / target mode**) has shipped on both safety-critical
sodium correction tiles: `sodium-correction` and `free-water-deficit` now compute
a **ceiling-capped max-safe rate** — when the requested schedule would move Na
faster than the published ceiling (8 mEq/L/24 h chronic / 10 acute for raising,
10 for lowering), each surfaces the rate that hits *exactly* the ceiling and flags
it, so the reverse-solve never silently displays an over-ceiling infusion rate.
A3 is **closed for the qualifying tiles**: the spec admits a reverse-solve only
where the inverse is single-valued, and the remaining named tiles do not qualify
(`insulin-drip` is an example-only sliding-scale verifier; `heparin-nomogram` is
the Raschke step table, already aPTT-target-seeking; `vasopressor`/`conc-rate`
already carry the dose⇄rate inverse).

With wave 4 the A4 lab-toggle rollout is complete, and with it **spec-v62 Part A
is fully shipped** (A1 trend, A2 action, A3 reverse-solve, A4 lab toggles, A5
substituted derivation). See [docs/spec-v62.md](docs/spec-v62.md).

### Operations depth: deadlines, denial routing & document linting (spec-v63)

The ops surface (billing, coding, regulatory, patient-admin) used to *state* a
rule; it now *computes* the clock the rule sets, *routes* a denial, and
*validates* the document against the rule's required elements. v63 has two parts:
Part B added five ops calculators (above), and Part A is a **zero-tile depth
pass** that deepens the existing ops tiles the same way spec-v62 deepened the
bedside tiles.

**The shared primitive — `lib/deadline.js` (OA1).** Before v63 the catalog could
compute exactly one regulatory deadline (`breach-clock`) and had **no business-day
or federal-holiday math at all**. `deadline()` is pure UTC-midnight arithmetic —
no local-timezone drift — over calendar **or** federal business days:

```
deadline({ anchor, days, basis, now, rollForward })
   anchor (ISO string | Date)                              now (pin "today")
        │  parseIsoStrict — rejects 2026-13-40                  │
        ▼  (calendar)            (business)                     ▼
   addCalendarDaysUtc      addBusinessDaysUtc ── skip Sat/Sun + 5 U.S.C. 6103
        │                        │   holidays (fixed + floating, federal
        │   rollForward?         │   weekend observance, Dec-31 NYE edge)
        ▼                        ▼
   { deadline, daysElapsed, daysRemaining, pastDue, basis, anchor }
```

`breach-clock` was re-pointed onto the engine's date primitives, byte-identical
(regression-pinned). Every Part B deadline tile and the OA2 routing run through
this one audited path.

| Capability | Where | What it does |
|---|---|---|
| **OA2** denial → next-step routing | `lib/coding-v5.js` `DENIAL_ROUTES`; `views/group-v63.js` | 8 plain-language denial categories → meaning, *appealable?*, the next step, and the tile to open next — each line cited (42 CFR 405/424/411, CMS manuals). Appealable denials compute the level-1 redetermination deadline via OA1. **Input-driven decision, not a CARC/RARC index** — no code list ships. |
| **OA3** generator completeness linting | `lib/regulatory.js` `lintGenerator`; `lib/print.js` `renderCompleteness` | Each document generator is checked against its CFR required-element checklist; every element renders present / **MISSING** with its anchor. `hipaa-auth` → 45 CFR 164.508(c); `hipaa-roa` → 164.524; `appeal-letter` → 42 CFR 405.944(b); breach notice → 164.404(c). The v52 `pa-lint` linter pattern, at small scale. |
| **OA4** inline provenance + freshness | `pa-staleness-ledger.json`; `scripts/check-pa-staleness.mjs` | The non-PA ops constants (federal holidays, appeal deadlines, AIC thresholds, timely-filing basis, CMS-0057-F windows, 2021 E/M edition, 60-day overpayment rule) are now staleness-tracked rows (`ruleFamily: "ops-v63"`, empty `rules`) guarded by the same CI gate as the PA ruleset. |
| **OA5** workflow chaining | `lib/meta.js` `RELATED_BACKFILL` | The ops related-tool chain: denial → `appeal-deadline` → `appeal-letter`; PA → `pa-turnaround` → `pa-lint`; breach → `breach-clock` → `overpayment-60day`; `em-mdm` ↔ `em-time`. Every generator already emits paste-ready / printable output with the "No data was sent or stored" footer. |

Design decision: OA2 and OA3 are **decisions and validations, not directories**.
A denial category is an input the user already has (off their EOB); a completeness
finding checks the user's own document. Neither ships anything browsable or
searchable, so neither reopens the [spec-v29](docs/spec-v29.md) §3 code/payer-index
retirement. And every ops output still carries the `regulatory.js` posture — it
surfaces the regulatory **date or level** and cites the rule; it never decides
whether a breach/overpayment occurred, whether an appeal will succeed, or whether
a service is covered.

### Calcium replacement: the salt the K/Mg/Phos ladder omits (spec-v64)

The `electrolyte-replacement` ladder doses potassium, magnesium, and phosphate;
calcium is the one electrolyte where the *form of the salt is itself the error*.
Calcium gluconate 10% and calcium chloride 10% are **not interchangeable
gram-for-gram** — and calcium is given in exactly the moments (hyperkalemia,
symptomatic hypocalcemia, citrate toxicity, CCB overdose) where the wrong salt
or an unnamed "1 g calcium" order is most costly. `calcium-replacement`
(`lib/clinical-v7.js` `calciumReplacement()`) computes the confusion away:

| Per 1 g of salt (10%) | Elemental Ca | mEq | Volume |
|---|---|---|---|
| Calcium **gluconate** | ~93 mg | 4.65 | 10 mL |
| Calcium **chloride** | ~273 mg | 13.6 | 10 mL |

So **1 g calcium chloride ≈ 2.94 g calcium gluconate** for the same elemental
calcium (≈3×). Given a salt + dose, the tile returns the elemental calcium (mg +
mEq), the volume, and the **equivalent dose of the other salt**, plus the
standard adult dose for the indication and the precaution notes (slow IV push on
a monitor; chloride is sclerosing — central line preferred; never in the same
line as bicarbonate or phosphate; caution in digoxin toxicity). Dosing is
anchored to AHA ACLS 2020; elemental content to USP / product labeling. It states
the dose; it does not write the order. See [docs/spec-v64.md](docs/spec-v64.md).

### Bedside physiology a nurse still does on paper (spec-v65)

A render-tree and near-neighbor audit against the live catalog found three
deterministic, source-anchored calculations an ICU/ED/floor nurse performs on a
routine shift that no existing tile computed. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test (input → computed output), is a
pure `lib/clinical-v8.js` function fuzz-covered by the spec-v59 harness, and
renders the explicit **"planning estimate — verify against the device / monitor
and local protocol"** notice. This takes the catalog to 337.

| Tile | Formula | Output | Reaches for it |
|---|---|---|---|
| `o2-cylinder-duration` | usable L = (gauge − residual) × cylinder factor; min = usable ÷ flow | usable O₂ (L), time-to-residual (hh:mm), and the inverse max-flow for a target transport time | "will this tank make it to CT and back?" |
| `minute-ventilation` | V̇E = RR × Vt; V̇A subtracts ~2.2 mL/kg IBW dead space; target rate = RR × PaCO₂/target | minute & alveolar ventilation (L/min) and the RR to reach a target PaCO₂ | every ventilator CO₂ adjustment |
| `cerebral-perfusion-pressure` | CPP = MAP − ICP (MAP from SBP/DBP when not measured) | CPP (mmHg) with the BTF-2017 60–70 band and a negative-CPP critical flag | every neuro-ICU hourly flowsheet |

The three are deliberately distinct from their near-neighbors and cross-linked
to them: `o2-cylinder-duration` is the **gas** analog of the IV-bag
`infusion-time-remaining`; `minute-ventilation` is the **gas-exchange** calc the
mechanics tiles (`driving-pressure`, `pbw-ardsnet`, `rsbi`) do not cover; and
`cerebral-perfusion-pressure` extends `map` (which computes MAP from blood
pressure but never subtracts ICP). Cylinder factors (D 0.16 / E 0.28 / M 1.56 /
G 2.41 / H-K 3.14 L/psi) are physical constants of the cylinder geometry; the
ventilation math is anchored to Marino's *ICU Book*; CPP and its target band to
the Brain Trauma Foundation 2017 guideline (Carney N, *Neurosurgery*
2017;80(1):6-15). A gauge at/below the safe residual flags "swap now" rather
than rendering a negative duration, and a negative CPP (ICP > MAP) is surfaced
with an explicit critical-low flag, never hidden. See
[docs/spec-v65.md](docs/spec-v65.md).

### Cardiology & ECG cheat sheet (spec-v90, Wave 2 of the spec-v85 program)

Six deterministic cardiology / ECG computations that fill confirmed gaps in the
catalog's cardiology surface (it had `qtc-suite`, `sgarbossa`, `map`, and the
spec-v87 hemodynamics, but none of these six). Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/cardio-v90.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
band — none reads a waveform or auto-disposes. This takes the catalog to 385.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `ecg-axis` | mean axis = atan2(net aVF, net lead I); lead I = 0°, aVF = +90° (orthogonal) | axis in degrees + quadrant (normal −30..+90, LAD −30..−90, RAD +90..+180, extreme −90..−180); `(0,0)` → indeterminate, never 0° | every wide-QRS / axis read |
| `lvh-criteria` | Sokolow-Lyon SV1 + max(RV5,RV6) ≥ 35 mm; Cornell SV3 + RaVL > 28 mm (M) / > 20 mm (F) | each voltage sum against its threshold, met/not-met, sex-correct Cornell cutoff | LVH on the 12-lead |
| `timi-stemi` | Morrow weighted 0–14 point sum over nine bedside variables | score + 30-day mortality band (0 → 0.8% … >8 → 35.9%) | STEMI risk at presentation |
| `duke-treadmill` | DTS = exercise time − (5 × ST dev) − (4 × angina index) | score + band (low ≥ +5, moderate −10..+4, high ≤ −11) + cited 5-yr survival (99/95/79%) | post-exercise-test prognosis |
| `cardiac-power-output` | CPO = (MAP × CO) / 451 watts | CPO (W) with the < 0.6 W cardiogenic-shock threshold flagged | the shock companion to `hemodynamic-suite` |
| `aortic-valve-area` | AVA = (π·(LVOT_d/2)² × LVOT_VTI) / AV_VTI | area (cm²) + dimensionless index + severity (mild > 1.5, moderate 1.0–1.5, severe < 1.0); AV_VTI = 0 guarded | continuity-equation AS severity |

The two ill-defined inputs are domain-guarded so no non-finite value reaches the
DOM (spec-v59): `ecg-axis` surfaces the all-isoelectric `(0,0)` complex as an
"indeterminate axis" rather than a spurious 0° or `NaN`, and `aortic-valve-area`
guards division by `AV_VTI = 0`. Five are **Class A** fixed instruments (hexaxial
geometry; the 1949/1985 voltage thresholds; the Morrow 2000 weights; the Mark
1987 coefficients; the constant 451) with no staleness row; `aortic-valve-area`
is **Class B** — its ASE/EACVI 2017 + 2020 ACC/AHA severity cutoffs carry a
[citation-staleness](docs/citation-staleness.md) row and are the first subject of
the new `scripts/check-citation-cadence.mjs` warn-only monthly job. See
[docs/spec-v90.md](docs/spec-v90.md).

### Pulmonary function & chronic respiratory disease cheat sheet (spec-v91, Wave 2 of the spec-v85 program)

Five deterministic pulmonary computations that fill the **chronic** gap beside
the catalog's *acute* respiratory surface (`aa-pf-suite`, `rox`, `curb-65`,
`smart-cop`). These are the PFT-lab and the COPD/ILD-clinic standards: the GOLD
spirometric grade, the BODE COPD prognosis, the GAP index for IPF, the GLI-2012
predicted-spirometry reference, and the mMRC dyspnea scale that feeds the first
two. Each passes the [spec-v29](docs/spec-v29.md) §3 one-line test, is a pure
`lib/pulm-v91.js` function fuzz-covered by the spec-v59 harness, and quotes the
cited source's own grade / band / mortality. This takes the catalog to 390.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `gold-spirometry` | obstruction when post-bronchodilator FEV1/FVC < 0.70; grade off FEV1 %predicted | grade 1 (≥ 80%), 2 (50–79%), 3 (30–49%), 4 (< 30%); no grade without obstruction; ratio entered or computed from volumes (FVC > 0 guard) | spirometric COPD severity |
| `bode-index` | BMI (≤ 21 = 1) + obstruction (FEV1%) + dyspnea (mMRC) + exercise (6MWD), 0–10 | total + per-variable derivation + 4-yr survival quartile (0–2 ~80%, 3–4 ~67%, 5–6 ~57%, 7–10 ~18%) | COPD multidimensional prognosis |
| `gap-ipf` | Gender (M = 1) + Age (> 65 = 2, > 60 = 1) + FVC% + DLCO% (cannot perform = 3) | stage I (0–3), II (4–5), III (6–8) with cited 1/2/3-yr mortality | IPF bedside prognosis |
| `predicted-spirometry` | GLI-2012 LMS: M = exp(a0 + a1·lnH + a2·lnA + ethnicity + spline); LLN = 5th pct | predicted FEV1/FVC/ratio + LLN by age/height/sex/ethnicity; % predicted + above/below-LLN from a measured value | every PFT report read |
| `mmrc-dyspnea` | single integer grade 0–4 (Bestall 1999 descriptors) | grade + descriptor; feeds BODE and the GOLD ABE assessment | standalone dyspnea grade |

Grade inputs are clamped to their published range (`mmrc-dyspnea` and the mMRC
that `bode-index` consumes accept only 0–4; `gap-ipf` treats "cannot perform"
DLCO as a first-class 3-point state, never a blank). `gold-spirometry` and
`predicted-spirometry` guard every division/`ln` domain so a zero/blank input
surfaces "(complete the fields)" rather than a `NaN`/`Infinity`. The GLI-2012
coefficient + spline sets are **compiled module constants** (`lib/gli-2012-data.js`,
spec-v85 §5 — not a `data/` dataset), transcribed from the published GLI lookup
table; the 40-yr/175-cm Caucasian-male predicted FEV1 (4.08 L) / FVC (5.05 L) /
FEV1/FVC (0.81) and their LLNs reproduce the published reference values. Three
tiles are **Class A** fixed instruments (Celli 2004, Ley 2012, Bestall 1999);
`gold-spirometry` (GOLD 2024, annual) and `predicted-spirometry` (GLI-2012,
on-publication) are **Class B** and carry [citation-staleness](docs/citation-staleness.md)
rows read by `scripts/check-citation-cadence.mjs`. See
[docs/spec-v91.md](docs/spec-v91.md).

### Nephrology: CKD staging, proteinuria ratios, dialysis adequacy, contrast-nephropathy risk & cystatin-C eGFR cheat sheet (spec-v92, Wave 2 of the spec-v85 program)

Five deterministic nephrology computations that close the **chronic / procedural**
renal gap beside the catalog's existing filtration / injury / dosing surface
(`egfr-suite`, `fena-feurea`, `kdigo-aki`, `cockcroft-gault`). These are the
nephrology-clinic and dialysis-unit standards: the KDIGO G×A risk heat-map, the
spot albumin/protein ratios, hemodialysis adequacy, the Mehran contrast-risk
score, and the race-free cystatin-C eGFR. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/nephro-v92.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
cell / ratio / target / band / estimate. This takes the catalog to 395.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `ckd-staging` | eGFR → G-stage (G1 ≥ 90 … G5 < 15) × UACR → A-stage (A1 < 30, A2 30–300, A3 > 300 mg/g) | KDIGO heat-map cell with the prognosis colour (green low → red very high); e.g. eGFR 38 + UACR 340 → G3b/A3 → very high | place an eGFR + UACR in the CKD risk grid |
| `uacr-upcr` | ratio (mg/g) = analyte (mg/dL) / urine Cr (mg/dL) × 1000 | UACR/UPCR + estimated 24-h excretion + KDIGO A-stage; urine-Cr = 0 guarded; mg/dL↔mg/L toggle | spot proteinuria off a single specimen |
| `ktv-urr` | URR = (1 − post/pre) × 100%; spKt/V = −ln(R − 0.008·t) + (4 − 3.5·R)·UF/W | URR + single-pool Kt/V against the KDOQI targets (≥ 65%, ≥ 1.2); ln-domain + pre-BUN guards; URR alone on partial input | hemodialysis adequacy each session |
| `mehran-cin` | hypotension 5 + IABP 5 + CHF 5 + age > 75 = 4 + anemia 3 + diabetes 3 + contrast 1/100 mL + eGFR (2/4/6) | total + band (≤ 5 low … ≥ 16 very high) with the cited CIN / dialysis risk | contrast-nephropathy risk pre-procedure |
| `ckd-epi-cystatin` | 2021 race-free CKD-EPI cystatin-C / combined / creatinine equations | eGFRcys, eGFRcr-cys (confirmatory) and eGFRcr side by side; cystatin/creatinine > 0 guarded; eGFRcys alone on a missing creatinine | confirmatory eGFR near a decision threshold |

The two-axis `ckd-staging` is band-mapping over ordinal axes (it accepts the
A-category directly when no numeric UACR is given and never emits an unlabeled
cell), and `uacr-upcr` shares its A-stage cutoffs so the two agree. Every
division (`uacr-upcr` urine creatinine, `ktv-urr` pre-BUN), logarithm (`ktv-urr`
domain `R − 0.008·t > 0`), and power term (`ckd-epi-cystatin` cystatin/creatinine
bases) is domain-guarded so a zero/blank input surfaces a labeled fallback rather
than a `NaN`/`Infinity`. Four tiles are **Class A** fixed instruments (the ratio
math, the Daugirdas Kt/V, the 2004 Mehran weights, the 2021 CKD-EPI coefficients);
`ckd-staging` (KDIGO 2024, on-publication) is **Class B** and carries a
[citation-staleness](docs/citation-staleness.md) row read by
`scripts/check-citation-cadence.mjs`. See [docs/spec-v92.md](docs/spec-v92.md).

### Hepatology & GI disease activity: NAFLD fibrosis, Glasgow-Imrie pancreatitis, Truelove-Witts, Harvey-Bradshaw, Mayo UC & Milan criteria cheat sheet (spec-v93, Wave 2 of the spec-v85 program)

Six deterministic hepatology & GI disease-activity instruments that close the
catalog's **liver/gut** gap beside the existing chronic-liver and pancreatitis
spine (`meld-childpugh`, `fib4`, `apri`, `ranson-bisap`, `maddrey-lille`). These
are the disease-*activity* and fibrosis instruments a hepatology and GI clinic
score constantly: the NAFLD-specific non-invasive fibrosis estimate, the parallel
UK/European pancreatitis severity score, the two ulcerative-colitis activity
indices, the Crohn's index, and the HCC transplant-eligibility criterion. Each
passes the [spec-v29](docs/spec-v29.md) §3 one-line test, is a pure
`lib/hepgi-v93.js` function fuzz-covered by the spec-v59 harness, and quotes the
cited source's own band / class / index / criterion. This takes the catalog to 401.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `nafld-fibrosis` | NFS = −1.675 + 0.037·age + 0.094·BMI + 1.13·(IFG/DM) − 0.013·platelets − 0.66·albumin + 0.99·(AST/ALT) | score + band: < −1.455 excludes advanced fibrosis, > 0.676 indicates it, between is indeterminate; ALT = 0 guarded | NAFLD-specific fibrosis triage beside FIB-4/APRI |
| `glasgow-imrie` | PANCREAS at 48 h, 1 point each (PaO₂, age, WBC, Ca, urea, LDH, albumin, glucose) | total 0–8, severe ≥ 3; blank item is "not assessed", and the count of items scored is shown | the UK/European alternative to Ranson/BISAP |
| `truelove-witts` | ≥ 6 bloody stools/day plus ≥ 1 systemic criterion (temp, HR, Hgb, ESR) | mild / moderate / severe, naming which systemic criteria are met | acute UC severity at the admit decision |
| `harvey-bradshaw` | wellbeing + pain + liquid stools/day + abdominal mass + complications | total HBI, bands: remission < 5, mild 5–7, moderate 8–16, severe > 16 | Crohn's disease activity in clinic |
| `mayo-uc` | full Mayo (0–12) = stool + bleeding + PGA + endoscopy; partial Mayo (0–9) omits endoscopy | banded score with the form labeled, so a partial score is never read against full-score bands | UC activity in trials and follow-up |
| `milan-criteria` | single tumor ≤ 5 cm OR ≤ 3 nodules each ≤ 3 cm, AND no macrovascular invasion AND no extrahepatic spread | within / exceeds, naming the failing limb | HCC transplant-eligibility screen beside MELD |

The one guarded domain is `nafld-fibrosis`'s AST/ALT division — a blank/zero ALT
surfaces a labeled fallback rather than a `NaN`/`Infinity` term; the other five
are point-table or decision logic. `glasgow-imrie` never lets a partial 48-hour
panel masquerade as a complete low score, `truelove-witts` reports a near-miss as
the band it actually falls in, `mayo-uc` keys the partial-vs-full fallback on the
endoscopy subscore, and `milan-criteria` guards a zero count / missing size. All
six are **Class A** fixed published derivations (Angulo 2007, Blamey/Imrie 1984,
Truelove & Witts 1955, Harvey-Bradshaw 1980, Schroeder 1987, Mazzaferro 1996), so
**none carries a [citation-staleness](docs/citation-staleness.md) row** — their
citations name journals and authors, not a recurring guideline issuer. See
[docs/spec-v93.md](docs/spec-v93.md).

### Hematology & oncology prognosis: HScore, IPSS-R, FLIPI/IPI, MASCC & Sokal/ELTS cheat sheet (spec-v94, Wave 2 of the spec-v85 program)

Five deterministic heme/onc prognostic scores that close the catalog's
**malignancy-prognosis** gap beside the existing heme bedside cluster (`anc`,
`khorana`, `four-ts`, `isth-dic`, `tls-cairo-bishop`). These are the scores an
oncologist or hematologist computes to stratify a new diagnosis and set the
survival expectation: the weighted diagnostic score for reactive HLH, the MDS
prognosis index, the two lymphoma five-factor indices, the febrile-neutropenia
disposition index, and the two at-diagnosis CML risk formulas. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/hemonc-v94.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
band / category / index. This takes the catalog to 406.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `hscore-hlh` | nine weighted items (max 337): immunosuppression, temperature, organomegaly, cytopenia lineages, ferritin, triglyceride, fibrinogen, AST, marrow hemophagocytosis | HScore + HLH probability from the published curve; ≥ 169 best discriminates (Se 93%, Sp 86%) | reactive HLH/MAS diagnosis |
| `ipss-r-mds` | cytogenetic group + marrow blast % + Hgb + platelets + ANC, weighted 0–10 | category very low → very high with the cited median survival and time to 25% AML evolution | MDS prognosis at diagnosis |
| `flipi` | FLIPI: age > 60, stage III/IV, Hgb < 12, > 4 nodal areas, LDH↑. IPI: age > 60, stage III/IV, ECOG ≥ 2, LDH↑, > 1 extranodal site | FLIPI 0–5 (low/int/high) + IPI 0–5 (low/low-int/high-int/high), each with cited survival | follicular & aggressive lymphoma risk |
| `mascc` | burden 5/3/0 + no hypotension 5 + no COPD 4 + solid/no fungal 4 + no dehydration 3 + outpatient 3 + age < 60 2 (max 26) | total + LOW risk ≥ 21 (outpatient/oral candidate); reports the index only | febrile-neutropenia disposition |
| `sokal-cml` | Sokal RR = exp[0.0116·(age−43.4) + 0.0345·(spleen−7.51) + 0.188·((plt/700)²−0.563) + 0.0887·(blasts−2.10)]; ELTS = 0.0025·(age/10)³ + 0.0615·spleen + 0.1052·blasts + 0.4104·(plt/1000)^−0.5 | Sokal banded < 0.8 / 0.8–1.2 / > 1.2 and ELTS banded ≤ 1.5680 / ≤ 2.2185 / > | CML risk at diagnosis |

The load-bearing guarded domains are in `sokal-cml`: the ELTS `(platelets/1000)^−0.5`
term divides by the platelet count (a zero/negative platelet surfaces a labeled
fallback), and the Sokal `exp()` overflows to `Infinity` for an extreme age/platelet
input — surfaced as a finite null, never an `Infinity` term. The other four are
point-table logic; `mascc` reports the index only, not the admission decision, and
`ipss-r-mds` ships the clinical/cytogenetic IPSS-R, not the molecular IPSS-M. All
five are **Class A** fixed published derivations (Fardet 2014, Greenberg 2012,
Solal-Céligny 2004 / IPI 1993, Klastersky 2000, Sokal 1984 / Pfirrmann 2016), so
**none carries a [citation-staleness](docs/citation-staleness.md) row**. See
[docs/spec-v94.md](docs/spec-v94.md).

### Neurology outcome & grading: modified Rankin, GOS-E, Hoehn-Yahr, Spetzler-Martin, House-Brackmann & MIDAS cheat sheet (spec-v95, Wave 2 of the spec-v85 program)

The catalog's neurology surface was **acute-onset, not longitudinal**: a
clinician could compute the NIHSS at presentation, the ICH 30-day mortality risk,
the SAH grade, the coma score, and the post-TIA stroke risk — but nothing for the
*next visit*. These six fill that gap: the stroke-trial functional-outcome
endpoint, the TBI outcome at six months, the Parkinson stage at clinic, the AVM
surgical-risk grade, the facial-nerve recovery grade, and the migraine-disability
band. They are ordinal selectors and bounded-integer sums (no division, root, or
log except none at all), pure `lib/neuro-v95.js` functions fuzz-covered by the
spec-v59 harness, each quoting the cited source's own descriptor and band.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `mrs` | single 7-point ordinal grade 0 (no symptoms) → 6 (dead) | descriptor + **good outcome (0–2)** vs poor outcome (3–6) dichotomy | the stroke-trial functional-outcome endpoint |
| `gose` | 8-category structured-interview TBI outcome 1–8 | descriptor + **legacy GOS 1–5 mapping** (3/4 → severe, 5/6 → moderate, 7/8 → good recovery) | TBI outcome at follow-up |
| `hoehn-yahr` | original stages 1–5; modified scale adds 0, 1.5, 2.5 half-steps | stage descriptor + which scale variant (original vs modified) | Parkinson stage at the movement-disorders clinic |
| `spetzler-martin` | size (1–3) + eloquence (0–1) + deep venous (0–1) = grade I–V; supplemented adds age (1–3) + unruptured (0–1) + diffuse (0–1) | grade I–V with surgical-risk band + supplemented Lawton-Young total (2–10) and the component derivation | AVM surgical-risk grade before operating |
| `house-brackmann` | single 6-grade selector I (normal) → VI (total paralysis) | per-grade gross / at-rest / motion descriptor | facial-nerve function after Bell's palsy / resection |
| `midas` | sum of five prior-3-month disability questions | grade I (0–5) / II (6–10) / III (11–20) / IV (≥ 21); ancillary frequency/intensity reported, not scored | migraine disability in a headache clinic |

`mrs`, `gose`, `hoehn-yahr`, and `house-brackmann` are arithmetic-free ordinal
selectors — an out-of-range or blank selection surfaces a labeled `valid:false`
fallback, never a wrong band; the GOS-E↔GOS map is validated both directions.
`spetzler-martin` clamps the core grade to 1–5 and the supplemented total to 2–10
by construction and surfaces the derivation; `midas` coerces blanks to 0, clamps
each day-count to the 92-day window, and excludes the ancillary items from the
sum. All six are **Class A** fixed ordinal definitions (van Swieten 1988, Wilson
1998, Hoehn-Yahr 1967, Spetzler-Martin 1986 / Lawton-Young 2010, House-Brackmann
1985, Stewart 2001), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. See
[docs/spec-v95.md](docs/spec-v95.md).

### Psychiatry: the clinician-rated severity scales one rung above the screeners (spec-v96, +6 → 418)

The catalog already carried the brief, validated **self-report screeners** a nurse
or primary-care clinician hands a patient: `phq9` and `gad7`, `cssrs` for suicide
risk, `gds15`, `epds`, and `auditc`. What it had **no** tile for is the layer
above the screen — the **clinician-rated rating scales** that *measure* severity
and track change on treatment. A `phq9` is what the patient says; the HAM-D is
what the clinician rates. [spec-v96](docs/spec-v96.md) ships six, all Group G,
pure `lib/psych-v96.js` functions fuzz-covered by the spec-v59 harness.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `hamd` | 17 clinician-rated items, mixed anchors (items 1–3, 7–11, 15: 0–4; 4–6, 12–14, 16–17: 0–2) | total 0–52 + band (none 0–7 / mild 8–16 / moderate 17–23 / severe ≥ 24) | rating depression severity at intake and at week 6 |
| `hama` | 14 items, each 0–4 | total 0–56 + band (mild ≤ 17 / mild-mod 18–24 / mod-severe 25–30 / severe ≥ 31) | the clinician-rated anxiety standard beside `gad7` |
| `madrs` | 10 items, each 0–6 (sensitive to change) | total 0–60 + band (normal 0–6 / mild 7–19 / moderate 20–34 / severe ≥ 35) | deciding whether an antidepressant is working |
| `mdq` | three-gate boolean: ≥ 7 of 13 symptoms YES **and** co-occurrence **and** moderate/serious impairment | positive/negative screen, **naming the failing gate** on a near-miss | bipolar-spectrum screen the catalog was missing |
| `ybocs` | 10 items, each 0–4 (1–5 obsessions, 6–10 compulsions) | total 0–40 + subtotals + band (subclinical 0–7 … extreme 32–40) | the OCD severity standard, intake and follow-up |
| `pcl5` | 20 items, each 0–4, DSM-5 clusters B/C/D/E | total 0–80, provisional screen framed as the **source's range (≥ 31–33)**, B/C/D/E tallies (item ≥ 2) | patient-rated PTSD severity + provisional screen |

The summed scales (`hamd`/`hama`/`madrs`/`ybocs`/`pcl5`) **refuse a band from a
partially-completed instrument** (spec-v57): a blank item renders "(complete all N
items)" and no band — an unanswered item is not a zero — and an out-of-range item
yields a labeled `valid:false` rather than a silently-wrong sum. `mdq` is a fixed
three-gate rule, never positive on the symptom count alone, and the `pcl5` cutoff
is quoted as the published **range**, not a single hard threshold the catalog
invents. All six are **Class A** (fixed published item weights and author-defined
bands: Hamilton 1959/1960, Montgomery-Åsberg 1979, Hirschfeld 2000, Goodman 1989,
Blevins 2015), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. The copyrighted/licensed
instruments (MoCA, SLUMS, BDI-II) are **excluded** for licensing. See
[docs/spec-v96.md](docs/spec-v96.md).

### Perioperative risk: the probability and the score, one rung above the screen (spec-v97, +5 → 423)

The catalog's pre-op surface was strong on the **screening indices** a clinician
runs in clinic — `rcri` (a Lee *class*), `ariscat` (pulmonary-complication risk),
`lemon` (a difficult-airway *screen*), `apfel` (PONV), plus the spec-v89 `asa-ps`
and `surgical-apgar`. What it lacked is the layer above: the **published
regression equations** that return an actual *predicted probability* rather than a
risk class, and the **validated weighted indices** an anesthesiologist reaches for
on a high-stakes case. [spec-v97](docs/spec-v97.md) ships five, all Group G, pure
`lib/periop-v97.js` functions fuzz-covered by the spec-v59 harness.

| id | Shape | Formula / rule | Output | Companion to |
|---|---|---|---|---|
| `gupta-mica` | logistic probability | `risk = 1/(1+e^−x)`, `x = −5.25 + 0.02·age + ASA + functional + creatinine + procedure` (Circulation 2011) | predicted % MI / cardiac arrest + the linear-predictor derivation | the `rcri` Lee *class* |
| `gupta-respiratory-failure` | logistic probability | `x = −1.7397 + ASA + sepsis + functional + emergency + procedure` (Chest 2011); endpoint = vent > 48 h or reintubation | predicted % respiratory failure + derivation | `ariscat` |
| `arozullah-pneumonia` | weighted index → class | sum of fixed point weights; BUN is **U-shaped** (low *and* high add points) | total → class 1–5 with the cited pneumonia rate (0.2% … 15.3%) | `ariscat` |
| `el-ganzouri` | weighted index → threshold | 7 airway factors, each 0/1/2 (mouth opening & prognathism cap at 1) | total 0–12, **≥ 4** difficult-laryngoscopy flag | the `lemon` screen |
| `pospom` | point score → mortality | age band + 15 comorbidities + procedure category | total → published predicted in-hospital mortality (SDC 3, verbatim) | `rcri`, `asa-ps`, `surgical-apgar` |

Two design points keep these honest. **The Gupta logistic link is
overflow-guarded**: the linear predictor `x` is clamped to `[−40, 40]` before
`e^−x`, so even a fuzzed `1e9` age returns a finite probability in `[0, 100]`,
never `NaN`/`Infinity` — and every categorical input is validated against its
fixed enum (an out-of-enum value surfaces `valid:false`, never a silent `NaN`).
**The point tables are transcribed, not approximated**: the Gupta coefficients
were cross-checked against two independent reproductions of the source models, and
the entire POSPOM age / 15-comorbidity / 24-procedure point system *and* its
points→mortality lookup were transcribed verbatim from the paper's Supplemental
Digital Content 3 and spot-verified against the source. All five are **Class A**
(fixed regression coefficients / published point tables: Gupta 2011 ×2, Arozullah
2001, el-Ganzouri 1996, Le Manach 2016), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. The proprietary ACS-NSQIP
universal Surgical Risk Calculator is **excluded** — it is a hosted model, not a
fixed published equation. See [docs/spec-v97.md](docs/spec-v97.md).

### Pediatrics: the four standard rules the deep neonatal surface still lacked (spec-v98, +4 → 427)

The catalog's pediatric surface was already broad — Group N carries the neonatal
and procedural tiles (`ballard`, `finnegan`, `bhutani-bilirubin`, `downes`,
`neo-phototherapy`, `pecarn-head`, `pecarn-cspine`, `pecarn-iai`), and Group G the
pediatric clinical scores (`pews`, `peds-gcs`, `alvarado-pas`, `nigrovic`, the
febrile-infant rules, `westley`, `pram-asthma`, `pelod2`, `psofa`). A full-catalog
sweep (the first draft proposed five tiles that turned out **already shipped**)
left exactly four genuinely-absent standard instruments. [spec-v98](docs/spec-v98.md)
ships them, all Group G, pure `lib/peds-v98.js` functions fuzz-covered by the
spec-v59 harness.

| id | Shape | Rule | Output | Companion to |
|---|---|---|---|---|
| `kawasaki-criteria` | criteria + algorithm | classic = fever ≥ 5 d + ≥ 4 of 5 principal features; the AHA **incomplete-KD** algorithm gates on CRP/ESR then ≥ 3 supplementary lab criteria or a positive echo (Circulation 2017) | classic / incomplete / not-met, naming the features met | `pews` |
| `kocher-criteria` | 4 predictors → probability | non-weight-bearing, temp > 38.5 °C, ESR > 40, WBC > 12,000 (J Bone Joint Surg Am 1999) | count 0–4 → predicted septic-arthritis probability (< 0.2% … 99.6%) | `pews` |
| `pim3` | logistic probability | the fixed Straney 2013 equation (SBP linear **and** squared term, pupils, FiO₂·PaO₂, base excess, ventilation, recovery, diagnosis risk) | predicted % death + the logit derivation, overflow-guarded | `pelod2`, `psofa` |
| `catch-head` | high/medium-risk factors | any high-risk (GCS < 15 at 2 h, open/depressed fracture, worsening headache, irritability) or medium-risk (basal-fracture signs, boggy hematoma, dangerous mechanism) factor (CMAJ 2010) | CT indicated / may be deferred, naming the factor that fired | `pecarn-head` (the alternative rule) |

`pim3` uses the **published Straney 2013 coefficients — not the PIM3-anz13 registry
recalibration** that also circulates — cross-verified against two independent
reproductions; its logistic is clamped before `e^−x` so a fuzzed `1e9` input still
returns a finite probability in `[0, 100]`. `kawasaki-criteria` is **Class B** (the
AHA statement is revisable → a [citation-staleness](docs/citation-staleness.md)
row); the other three are **Class A**. No growth-percentile chart tile (a dataset,
out per [spec-v29](docs/spec-v29.md) §3); no auto-CT / auto-aspiration order.
See [docs/spec-v98.md](docs/spec-v98.md).

### ID, critical care & burns: closing the spec-v85 program (spec-v99, +5 → 432)

The catalog had the acute-infection and critical-care *triage* tools (`curb-65`,
`sirs`, `qsofa-sofa`, `smart-cop`, `apache2`) and the burn-*resuscitation*
calculator (`burn-fluid`, which *takes* %TBSA as an input), but five standard
ID/critical-care/burns instruments were absent. [spec-v99](docs/spec-v99.md) ships
them — the **tenth and final feature spec of Wave 2** — all Group G, pure
`lib/idcrit-v99.js` functions fuzz-covered by the spec-v59 harness, **closing the
spec-v85 Advanced Clinical Calculators program at 432 tiles (+66 across the ten <!-- catalog-truth:historical -->
feature specs v86 through v99).**

| id | Shape | Rule | Output | Companion to |
|---|---|---|---|---|
| `duke-endocarditis` | major/minor criteria | definite = 2 major / 1 major + 3 minor / 5 minor; possible = 1 major + 1 minor / 3 minor (2023 Duke-ISCVID) | definite / possible / rejected, with the counts | `qsofa-sofa` |
| `pitt-bacteremia` | weighted score | temperature band + hypotension (2) + ventilation (2) + cardiac arrest (4) + mental status (0/1/2/4) (Ann Intern Med 2004) | total 0–14, **≥ 4** high-mortality-risk | `qsofa-sofa`, `apache2` |
| `saps-ii` | 17-variable score → mortality | banded points → `logit = −7.7631 + 0.0737·SAPS + 0.9971·ln(SAPS+1)` (JAMA 1993) | SAPS II points + predicted hospital mortality % | `apache2` |
| `lund-browder` | age-adjusted area sum | per-region burned fraction × the age-adjusted %TBSA; adult Rule of Nines computed independently | %TBSA + the Rule-of-Nines cross-check | `burn-fluid` (consumes the %TBSA) |
| `refeeding-risk` | NICE major/minor criteria | high risk if 1 major (BMI < 16, loss > 15%, > 10 d negligible intake, low K/Mg/PO₄) or 2 minor (CG32) | high risk / not high risk, naming the criteria | `icu-nutrition-target` |

Two correctness anchors. **`saps-ii` is transcribed and calibration-checked**: the
17-variable point bands were cross-verified against MDCalc and ClinCalc (a corrupted
"+1" urine-output band in one reproduction was rejected in favor of the correct
"+4"), and the worked 64-point case → **75.3%** matches the published ClinCalc
calibration; the mortality logistic and `ln(SAPS+1)` are domain-guarded.
**`lund-browder` sums to exactly 100% at every age band** (cross-verified against
the Joint Trauma System adult/pediatric charts); region fractions clamp to `[0, 1]`
and a > 100% total is **flagged, not silently capped**. `duke-endocarditis` (2023
Duke-ISCVID) and `refeeding-risk` (NICE CG32) are **Class B** with
[citation-staleness](docs/citation-staleness.md) rows; the other three are
**Class A**. See [docs/spec-v99.md](docs/spec-v99.md).

### MDCalc parity completion: the cardiology / vascular / lipid surface (spec-v100 program, Wave 1: spec-v101 → spec-v105, +25 → 457, **complete**; Wave 2 complete: spec-v106 → 463, spec-v107 → 467, spec-v108 → 473, spec-v109 → 478, spec-v110 → 483, spec-v111 → 487, **+30 → 487**; Wave 3 (Critical care & pulmonary): spec-v112 → 492, **+5 so far**)

With the spec-v85 program complete, [spec-v100](docs/spec-v100.md) charters the
**MDCalc Parity Completion** program — a roadmap that closes the remaining gaps
against the instruments a clinician expects to find — and opens **Wave 1**
(cardiology / electrophysiology / vascular / lipids). **Wave 1 is now complete**:
five feature specs shipped (432 → 457, +25 — one below the projected +26 because
spec-v102 deferred `gwtg-hf`), all under the same determinism /
primary-source-citation / output-safety doctrine, each tile fuzz-covered by the
spec-v59 harness:

- **[spec-v101](docs/spec-v101.md) (+5 → 437)** — atrial-fibrillation stroke-risk
  and QT instruments beside the existing combined `chads` view: `chads2` (Gage
  2001 + NRAF stroke-rate table), `cha2ds2-va` (2024 ESC, sex point removed),
  `chads-65` (2020 CCS/CHRS pathway), `atria-stroke` (Singer 2013), `tisdale-qtc`
  (inpatient QT-prolongation risk). `lib/cardio-v101.js`.
- **[spec-v102](docs/spec-v102.md) (+4 → 441)** — heart-failure prognosis, HFpEF
  likelihood, and cardiogenic-shock mortality: `maggic` (Pocock 2013, with the
  age×EF / SBP×EF interactions and the 0–50 mortality lookup), `h2fpef` (Reddy
  2018), `hfa-peff` (2019 ESC HFA, **Class B**), `cardshock-score` (Harjola 2015).
  `lib/cardio-v102.js`. The proposed `gwtg-hf` was **deferred, not shipped** — its
  per-band point table could not be verified from a reachable primary source, and
  this catalog does not ship fabricated scoring weights.
- **[spec-v103](docs/spec-v103.md) (+6 → 447)** — the **CV-risk & prevention
  engines** below, which *complement, never replace,* the existing `ascvd`
  (Pooled Cohort) and `prevent` tiles. Each cross-links them and states its
  derivation population so the clinician picks the right engine for the patient.
  `lib/cvrisk-v103.js` + `views/group-v28.js`.
- **[spec-v104](docs/spec-v104.md) (+6 → 453)** — **ECG arrhythmia, aortic &
  syncope decision rules** beside the existing `ecg-axis` / `lvh-criteria` tiles:
  the two wide-complex-tachycardia step algorithms (`brugada-vt`, `vereckei-avr`),
  the `add-rs` aortic-dissection pretest score with the optional D-dimer rule-out
  note, and the three ED syncope instruments (`rose-syncope`, `egsys`, `oesil`).
  All six **Class A**. `lib/cardio-v104.js` + `views/group-v29.js`. Detailed below.
- **[spec-v105](docs/spec-v105.md) (+4 → 457, closes Wave 1)** — **peripheral-artery
  and cardiac-surgery risk**: `abi` (the ankle-brachial index with the five PAD
  bands, Group E), the `rutherford-fontaine` PAD-stage mapper, the `wifi` SVS
  limb-threat classification, and the `euroscore2` cardiac-surgery mortality engine.
  Adds the `vascular-surgery` specialty. `lib/vascular-v105.js` +
  `views/group-v30.js`. Detailed below.

| id | Group | Model | Output | Class |
|---|---|---|---|---|
| `score2` | G | SCORE2 (ESC 2021, age 40–69): sex-specific LP on centered age/SBP/TC/HDL (mmol/L)/smoking → `1 − S0^exp(LP)`, then the per-region cloglog recalibration | 10-yr fatal + non-fatal CVD risk %, ESC age-banded category, by European risk region | **B** |
| `score2-op` | G | SCORE2-OP (ESC 2021, age ≥ 70): adds diabetes, centered at 73 / 150 / 6 / 1.4, `1 − S0^exp(LP − mean)` + recalibration | 10-yr CVD risk %, ESC category | **B** |
| `mesa-chd` | G | MESA (McClelland 2015): penalized Cox on raw mg/dL factors; with-CAC adds `0.2743·ln(Agatston+1)` | 10-yr CHD risk % **with and without** coronary calcium | A |
| `framingham-cvd` | G | Framingham general CVD (D'Agostino 2008): sex-specific Cox on ln-transformed predictors | 10-yr general-CVD risk % + **vascular age** | A |
| `reynolds-risk` | G | Reynolds (Ridker 2007 women / 2008 men): adds hsCRP + parental MI history | 10-yr CVD risk % | A |
| `non-hdl-remnant` | E | non-HDL = TC − HDL; remnant = TC − HDL − LDL (Varbo 2013) | atherogenic non-HDL + remnant cholesterol, unit preserved | A |

Two correctness anchors. **Coefficients were re-fetched, never recalled** (the
spec-v97 rule): the SCORE2 / SCORE2-OP region tables are a compiled constant
transcribed from the published *Eur Heart J* 2021 supplement and cross-verified
against the CRAN `RiskScorescvd` source — the implementation **reproduces the two
ESC published worked examples exactly** (a 50-year-old smoker, SBP 140, TC 5.5,
HDL 1.3 mmol/L lands at 5.9% in a low-risk region and 14.0% in a very-high-risk
region for men; 4.2% and 13.7% for women), and the Framingham and Reynolds engines
reproduce their papers' worked cases. **Every logistic/Cox exponent is clamped to an
overflow-safe range and every `ln()` term is domain-guarded**, so the spec-v59 fuzz
harness sees zero non-finite leaks; an unrecognized SCORE2 region returns a surfaced
fallback rather than reading `undefined` coefficients, and an implausible negative
remnant (LDL + HDL > TC) is flagged rather than printed. `score2` / `score2-op` are
**Class B** with [citation-staleness](docs/citation-staleness.md) rows (ESC region
recalibration); the other four are **Class A**.

#### spec-v104 — ECG arrhythmia, aortic & syncope (+6 → 453)

The catalog had the `ecg-axis` and `lvh-criteria` ECG tiles but none of the
bedside criteria an ED physician uses to *call* a wide-complex tachycardia, screen
for aortic dissection, or risk-stratify syncope. spec-v104 fills that gap with six
published, deterministic instruments — two boolean step algorithms, one category
count, and three point/criterion scores:

| id | Group | Rule | Output |
|---|---|---|---|
| `brugada-vt` | G | Brugada 1991 four-step VT-vs-SVT algorithm | first positive of (no RS in any precordial lead → R-S > 100 ms → AV dissociation → V1-2 & V6 morphology) ⇒ **VT**; all-negative ⇒ SVT with aberrancy |
| `vereckei-avr` | G | Vereckei 2008 lead-aVR four-step algorithm | first positive of (initial R → initial r/q > 40 ms → notch on negative-onset downstroke → vi/vt ≤ 1) ⇒ **VT**; all-negative ⇒ supraventricular |
| `add-rs` | G | Rogers 2011 Aortic Dissection Detection Risk Score | category count 0–3 (predisposing / pain / exam) → low / intermediate / high, **+ optional ADD-RS-D D-dimer < 500 ng/mL rule-out note** for ADD-RS ≤ 1 |
| `rose-syncope` | G | Reed 2010 ROSE rule (BRACES + bradycardia) | **any** of 7 criteria positive ⇒ high risk (1-month serious outcome / death) |
| `egsys` | G | Del Rosso 2008 EGSYS cardiac-syncope probability | signed-weight sum −2 to +12; **score ≥ 3 suggests cardiac syncope** |
| `oesil` | G | Colivicchi 2003 OESIL risk score | point sum 0–4 → published 12-month mortality (0 / 0.8 / 19.6 / 34.7 / 57.1 %) |

**Source-governs correction (the spec-v97 rule, applied to the prose this time).**
The spec-v104 draft described EGSYS with "syncope during effort *or* supine (3)" as
one item and the two −1 terms as scored on *absence*. Verification against the
primary Del Rosso 2008 paper **and** MDCalc found both wrong: effort (+3) and
supine (+2) are **separate items with distinct weights**, and the precipitating-
factors / autonomic-prodrome terms score −1 when **present** (they argue toward
reflex syncope). The implementation follows the source — true range **−2 to +12**
(the positive weights sum to the universally-cited maximum of 12), not the draft's
−2 to +10 — and the deviation is logged in `docs/audits/v12/egsys.md`. The boolean
step rules return a defined verdict on a fully-negative input; `egsys` bounds its
signed sum and `oesil` / `add-rs` index fixed lookups by a clamped total, so the
spec-v59 fuzz harness sees zero non-finite leaks. All six citations name a journal
+ authors (the ADD-RS title's "guideline-based" phrasing names no society acronym),
so all six are **Class A** — no citation-staleness rows.

#### spec-v105 — vascular & cardiac surgery (+4 → 457, closes Wave 1)

The catalog had no peripheral-artery-disease bedside math and no cardiac-surgery
mortality engine. spec-v105 adds the four instruments a vascular or cardiac surgeon
reaches for, and **closes Wave 1** of the spec-v100 program:

| id | Group | Model | Output | Class |
|---|---|---|---|---|
| `abi` | E | ankle systolic (higher of DP/PT) ÷ higher brachial systolic, per leg (Aboyans 2012) | ABI per leg; lower index governs; bands > 1.40 non-compressible / 1.00–1.40 normal / 0.91–0.99 borderline / 0.41–0.90 mild-mod PAD / ≤ 0.40 severe | A |
| `rutherford-fontaine` | G | Rutherford category 0–6 ↔ Fontaine stage I–IV mapping (Rutherford 1997) | the category/stage pair + chronic-limb-ischemia interpretation | **B** |
| `wifi` | G | SVS WIfI Wound/Ischemia/foot-Infection grade triple against the Mills 2014 64-cell expert-panel grid | clinical stage 1–4 (very low → high 1-yr amputation risk) | **B** |
| `euroscore2` | G | EuroSCORE II logistic `e^y/(1+e^y)`, y = −5.324537 + Table 6 multivariate β (Nashef 2012) | predicted in-hospital cardiac-surgery mortality % + risk tier | A |

**Two correctness anchors, both re-fetched, never recalled (the spec-v97 rule).**
(1) The **EuroSCORE II age coefficient is 0.0285181** — the Nashef 2012 *Eur J
Cardiothorac Surg* Table 6 multivariate value. The spec draft carried 0.0666354,
which is the legacy logistic **EuroSCORE I** age coefficient; compiling it would
over-estimate every prediction. The 30-coefficient block was transcribed verbatim
and cross-verified against two independent sources; the model **reproduces the
published worked example exactly** (a 70-year-old dialysis-dependent woman with
insulin diabetes, COPD, NYHA III, CCS-4, poor LV, and a recent MI for isolated
elective CABG gives y = −2.126358 → **10.66%**). The on-dialysis coefficient is
*lower* than CrCl ≤ 50 without dialysis — a published quirk of the model, reproduced
rather than "corrected." (2) The **WIfI grid is the amputation-risk table**, not the
separate revascularization-benefit table; all 64 cells were cross-verified across two
reproductions. **`abi` guards its brachial divisor for > 0** (a blank/zero brachial
returns a surfaced fallback, never `ankle/0`) and reads the band off the rounded
ratio so the shown index matches its band; **`euroscore2` clamps its logistic
exponent to [−40, 40]** so an extreme fuzzed input returns a probability in [0, 1]
rather than `Infinity`. `rutherford-fontaine` and `wifi` are **Class B** with
[citation-staleness](docs/citation-staleness.md) rows (SVS reporting/classification
standards, on-publication cadence); `abi` and `euroscore2` are **Class A**.

#### spec-v106 — VTE workup algorithms (+6 → 463, opens Wave 2)

Wave 2 of the spec-v100 program turns to **emergency / triage** surface. The
catalog already carried the front-line VTE pretest tools (`wells-pe`, `wells-dvt`,
`perc`, `years-pe`) and the prognostic `pesi` / `spesi` set, but six standard
venous-thromboembolism workup instruments — each occupying a distinct decision
point in the pathway — were absent. spec-v106 adds them, all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `peged` | G | Kearon 2019 graduated D-dimer: 3-tier Wells C-PTP × a probability-graduated D-dimer threshold | low C-PTP excluded if D-dimer < 1000, moderate if < 500, high always images (ng/mL FEU) | A |
| `4peps` | G | Roy 2021 13-item weighted pretest score (−5…+21) | four tiers (very low / low / moderate / high), each selecting a D-dimer strategy (no test / < 1000 / age-adjusted / direct imaging) | A |
| `bova-pe` | G | Bova 2014 score for normotensive confirmed PE: sBP 90–100 (2), troponin (2), RV dysfunction (2), HR ≥ 110 (1) | total 0–7 → Stage I/II/III with 30-day complication & PE-mortality framing | A |
| `hestia` | G | Zondag 2011 11-item outpatient-eligibility checklist | any single positive item ⇒ not a home-treatment candidate; all-negative ⇒ eligible | A |
| `geneva-original` | G | Wicki 2001 fully objective pre-Wells model (clinical + ABG + chest film), total 0–16 | low 0–4 (~10% PE) / intermediate 5–8 (~38%) / high ≥ 9 (~81%) | A |
| `constans-uedvt` | G | Constans 2008 upper-extremity-DVT pretest: venous material (+1), localized pain (+1), unilateral edema (+1), alternative diagnosis (−1) | signed total −1…+3 → low ≤ 0 / intermediate 1 / high 2–3 | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
across the primary paper + MDCalc / a clinical reference.** The 4PEPS item weights
(age < 50 −2 / 50–64 −1, chronic respiratory disease −1, HR < 80 −1, chest pain +
dyspnea +1, male +2, estrogen +2, prior VTE +2, syncope +2, immobility +2, SpO₂ <
95% +3, calf pain/edema +3, PE most likely +5) and the four tier cutoffs were
transcribed verbatim; the original Geneva ABG bands are encoded in **both kPa and
the rounded mmHg conversions** (PaCO₂ < 36 mmHg / < 4.8 kPa +2, PaO₂ < 48.7 mmHg /
< 6.5 kPa +4, …) because the Wicki paper reports SI units. `peged` and `4peps` are
**strategy selectors**: a missing tier or D-dimer renders a complete-the-fields
fallback rather than a verdict from a missing value. `constans-uedvt` carries the
signed −1 term and keys its band on the signed sum, not its absolute value. Every
total is clamped to its published range and the band is read off the clamped value,
so the spec-v59 fuzz harness sees zero non-finite leaks. All six citations name a
journal + authors (NEJM, JAMA Cardiol, Eur Respir J, J Thromb Haemost, Arch Intern
Med, Thromb Haemost) — none trips the issuer pattern, so all six are **Class A**
with no citation-staleness rows. `lib/vte-v106.js` + `views/group-v31.js`.

#### spec-v107 — ED decision rules & resuscitation (+4 → 467)

Wave 2 continues with four standard **emergency-department decision rules and
resuscitation-risk scores** that sit in the gaps between the chest-pain
(`heart`, `edacs`), head-CT (`pecarn-head`, `catch-head`), and ICU-physiology
(`apache2`, `qsofa-sofa`) clusters already in the catalog. spec-v107 adds them,
all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `hear` | G | Moumneh 2021 HEAR — the troponin-free HEART subset: History + ECG + Age + Risk factors, each 0/1/2 | total 0–8; **HEAR ≤ 1** is the very-low-risk pre-troponin band (~0.4% 30-day MACE) | A |
| `new-orleans-head` | G | Haydel 2000 New Orleans Criteria: 7 items in GCS-15 minor blunt head injury | **any single positive ⇒ head CT**; 100% sensitive, low specificity (flags any CT finding) | A |
| `go-far` | G | Ebell 2013 GO-FAR: pre-arrest CPC-1 good-outcome probability after in-hospital arrest; neuro-intact −15, comorbidity/age add | total −15…+76 → ≤ −6 above average (> 15%) / −5…13 average (3–15%) / 14–23 low (1–3%) / ≥ 24 very low (< 1%) | A |
| `macocha` | G | De Jong 2013 MACOCHA: ICU difficult-intubation factors — Mallampati III/IV (5), OSA (2), cervical (1), mouth < 3 cm (1), coma (1), SpO₂ < 80% (1), non-anesthesiologist (1) | total 0–12; **≥ 3** flags elevated risk (sens 73%, NPV 98%) | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc.** The notable catch was GO-FAR: the "−15 to 11"
figure quoted by some secondary sources is the **per-variable point spread, not the
total-score range** (−15…+76), and the `≥ 24` "very low" band is reachable only
because MDCalc treats the admission/comorbidity items as **independent additive
rows** (no mutual-exclusivity enforcement) — shipping the category cut-points
without reconciling that contradiction would have mis-banded high scores. `hear` and
`go-far` require the numeric age and render a complete-the-fields fallback when it is
missing; every total is clamped to its published range and the band is read off the
clamped value, so the spec-v59 fuzz harness sees zero non-finite leaks. All four
citations name a journal + authors (Eur J Emerg Med, NEJM, JAMA Intern Med, AJRCCM)
— none trips the issuer pattern, so all four are **Class A** with no
citation-staleness rows. `go-far` carries the explicit posture that the score
informs, never decides, a goals-of-care discussion. `lib/eddecision-v107.js` +
`views/group-v32.js`.

#### spec-v108 — Trauma severity scores & decision rules (+6 → 473)

Wave 2 continues with six standard **trauma severity scores and decision rules**.
The catalog carried `iss-rts` (ISS + Revised Trauma Score) and `abc-mtp` (the ABC
massive-transfusion rule), but the benchmark outcome model, the modern severity
index, the two massive-transfusion probability tools, the pupil-adjusted GCS, and
the chest-CT rule-out were all absent. spec-v108 adds them — `triss` and `niss` in
Group E, the rest in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `triss` | E | Boyd 1987 TRISS (MTOS coefficients): Ps = 1/(1+e^−b), b from coded RTS, ISS, age index, blunt/penetrating set | **probability of survival %**; band-flips between coefficient sets on the same inputs | A |
| `niss` | E | Osler 1997 NISS: sum of squares of the three worst AIS, **any region** | up to 75; any AIS 6 forces 75; NISS ≥ 16 = major trauma | A |
| `tash-score` | G | Yücel 2006 TASH: weighted Hb/BE/SBP/HR + FAST/pelvis/femur/sex | total 0–31 → logistic **P(mass transfusion)** = 1/(1+e^−(−4.9+0.3·TASH)) | A |
| `rabt-score` | G | Joseph 2018 RABT: shock index > 1, pelvic fracture, penetrating, FAST | total 0–4; **≥ 2** predicts massive transfusion (sens 84%, spec 77%) | A |
| `gcs-pupils` | G | Brennan 2018 GCS-P: GCS total − pupil reactivity penalty (0/1/2) | index **1–15** (penalty cannot drop it below 1) | A |
| `nexus-chest-ct` | G | Rodriguez 2015 NEXUS Chest CT: 7 criteria in blunt thoracic trauma | **all negative ⇒ defer CT**; any positive ⇒ CT may be indicated | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc.** The TRISS blunt/penetrating coefficient sets
shipped are the **MTOS-1995 revision** values MDCalc serves (the literal 1987 paper
published a smaller first set) — the citation names both. The TASH logistic sign is
`−4.9 + 0.3·TASH` (rejecting the `−0.3` transcription variants some secondary
sources carry), reproducing the published ~50% anchor near a total of 16, and the
additive max is 31 (MDCalc) rather than the abstract's 28. `triss` and `tash-score`
clamp their logistic exponent to a finite range so a fuzz-extreme ISS or TASH total
resolves to a finite probability rather than `Infinity`; `niss` clamps each AIS and
applies the AIS-6 → 75 convention; `gcs-pupils` bounds the index to 1–15. All six
citations name a journal + authors (J Trauma, World J Surg, J Neurosurg, PLoS Med)
— none trips the issuer pattern, so all six are **Class A** with no
citation-staleness rows. `lib/trauma-v108.js` + `views/group-v33.js`.

#### spec-v109 — Trauma classification & soft-tissue infection (+5 → 478)

Wave 2 continues with five standard **trauma-classification and soft-tissue-
infection decision rules**. The catalog carried the trauma-physiology scores
(`iss-rts`, `triss`, the massive-transfusion tools) and the skin-infection
disposition surface, but the screening, grading, and salvage instruments below
were absent. spec-v109 adds them, all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `denver-bcvi` | G | Burlew 2012 Expanded Denver Criteria: 6 signs/symptoms + 6 high-energy-mechanism risk factors for blunt cerebrovascular injury | **any single positive ⇒ CT angiography screening**; none met ⇒ not indicated | B |
| `aast-organ-injury` | G | Kozar 2018 AAST Organ Injury Scale: spleen/liver/kidney decision tree, worst anatomic finding + the 2018 vascular rule | **AAST grade I–V**, the higher of the anatomic and vascular-rule grade | B |
| `mangled-extremity` | G | Johansen 1990 MESS: skeletal energy + limb ischemia (×2 if > 6 h) + shock + age | total ~2–14; **≥ 7** historically associated with amputation | A |
| `lrinec` | G | Wong 2004 LRINEC: CRP/WBC/Hb/Na/creatinine/glucose banded | total 0–13 → low ≤ 5 / intermediate 6–7 / **high ≥ 8**; ≥ 6 raises suspicion | A |
| `alt-70` | G | Raff 2017 ALT-70: Asymmetry 3, Leukocytosis 1, Tachycardia 1, age ≥ 70 = 2 | total 0–7 → ≤ 2 unlikely / 3–4 indeterminate / **≥ 5 cellulitis likely** | A |

**Criteria re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc / RadioGraphics / EAST guideline.** The
notable transcription catches: the AAST 2018 **contained-vs-extending vascular
rule** is grade-specific per organ (spleen contained IV / beyond V; liver and
kidney contained III / beyond IV) — `aast-organ-injury` walks it as a per-organ
decision tree (the anatomic-finding select rebuilds when the organ changes), not
a browsable atlas, and returns the higher of the anatomic and vascular grade. The
MESS **ischemia-time doubling** raises the ceiling from 11 to 14 and is applied
before summing; `mangled-extremity` renders that it doubled. The LRINEC CRP
threshold is **150 mg/L = 15 mg/dL** (the most common unit-confusion error), and
the probability bands (≤ 5 / 6–7 / ≥ 8) are distinct from the ≥ 6 suspicion
cutoff. `denver-bcvi` and `aast-organ-injury` are **Class B** — the EAST/society
screening criteria and the periodically-revised AAST scales each carry a
`docs/citation-staleness.md` row (documentation-only: the citations name a journal
+ authors, not an issuer acronym, so the row is not gate-forced but records the
edition in force); the other three are **Class A**. None authors a CTA,
debridement, antibiotic, or amputation order — the `mangled-extremity` posture note
states explicitly that the score informs, never dictates, the salvage decision.
`lib/traumaclass-v109.js` + `views/group-v34.js`.

#### spec-v110 — Toxicology dosing & dialysis decisions (+5 → 483)

Wave 2 continues with five standard **poison-center / ED toxicology dosing and
dialysis-decision tools**. The catalog carried the `acetaminophen-nomogram`
treatment line and the `serotonin-toxicity` / `salicylate-toxicity` /
`toxic-alcohol` decision rules, but the high-frequency *dosing* math a clinician
does by hand at the bedside was absent. spec-v110 adds it — the four dosing
instruments in Group F (Medication & Infusion), the dialysis decision in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `digifab-dosing` | F | Smith 1982 / product label: vials by amount ingested (mg × 0.8 / 0.5), steady-state level (level × weight / 100), or empiric | **whole vials, rounded up**, formula shown | A |
| `nac-dosing` | F | Prescott 1979 three-bag (150/50/100 mg/kg) or Bateman 2014 two-bag SNAP (200/100 mg/kg), dosing weight capped at 110 kg | **per-bag mg + durations**, cap applied & shown | A |
| `hiet-dosing` | F | Engebretsen 2011: bolus 1 unit/kg, infusion 1 unit/kg/hr → **10 unit/kg/hr ceiling** | **bolus + infusion units**, entered rate clamped to the ceiling | A |
| `tca-bicarbonate` | F | Boehnert 1985: QRS ≥ 100 ms seizures, ≥ 160 ms ventricular arrhythmias | **risk band + 1–2 mEq/kg bolus**, target pH 7.45–7.55 | A |
| `lithium-extrip` | G | Decker 2015 EXTRIP: life-threatening features / renal + level > 4.0 / level > 5.0 / confusion / slow clearance | **ECTR recommended / suggested / not indicated**, firing limb named | B |

**Every dosing tile renders the high-stakes second-check caveat** (the spec-v100
§2 clause-5 requirement): the tile computes the figure, but the indication,
timing, and route stay with the clinician, poison center, and local protocol.
**Formulas re-fetched, never recalled (the spec-v97 rule).** Two source-governance
catches: (1) the NAC **110-kg dosing-weight cap** is a `Math.min` that clamps a
120-kg patient's bag doses to the 110-kg values (16500 / 5500 / 11000 mg on the
three-bag regimen) and the band says so; (2) `lithium-extrip` follows the EXTRIP
**source over the spec prose** — the spec draft put the "expected time to a level
< 1.0 mmol/L exceeds 36 h" limb in the *recommended* set, but Decker 2015 places
it (with level > 5.0 and confusion) in the **suggested** set, so the tile does
too. `lithium-extrip` is **Class B** (a `docs/citation-staleness.md` row records
the EXTRIP 2015 edition in force); the four dosing tiles are **Class A**.
`lib/tox-v110.js` + `views/group-v35.js`.

#### spec-v111 — Environmental & wilderness medicine (+4 → 487, **Wave 2 complete**)

Wave 2 **closes** with four standard **environmental / wilderness-medicine
severity scores and classifications**. The catalog carried the
`hypothermia-rewarm` Swiss-staging tile, but the reference severity grading for
four common exposures was reachable nowhere. All four home in **Group I (EMS &
Field)**, cross-linked from Clinical Scoring (Group G):

| id | Rule | Output | Class |
|---|---|---|---|
| `lake-louise-ams` | Roach 2018 Lake Louise AMS: four symptoms (headache, GI, fatigue, dizziness) each 0–3 | **total 0–12 + headache-required gate**, mild 3–5 / moderate 6–9 / severe 10–12 | A |
| `szpilman-drowning` | Szpilman 1997 decision tree on cough / auscultation / edema / hypotension / arrest | **grade Rescue/1–6/Dead + original-series mortality** (0 → 93%) | B |
| `snakebite-severity` | Dart 1996 SSS: six body-system subscores (pulmonary, CV, local, GI, heme, CNS) | **total 0–20, continuous index** with per-system breakdown | A |
| `cauchy-frostbite` | Cauchy 2001: day-0 topography + day-2 bone scan + day-2 blisters | **grade 1–4 + amputation/sequelae prognosis**, most-severe finding governs | A |

**Three source-governance catches** (the spec-v97 re-fetch rule): (1)
`lake-louise-ams` enforces the **headache-required gate** — a total ≥ 3 *without*
a headache does **not** diagnose AMS, and the 2018 revision dropped the sleep
item (so the score is 0–12, not the legacy 0–15); (2) `snakebite-severity`
follows the **source over the spec prose** — Dart 1996 validated the SSS as a
*continuous* severity index and defines **no** fixed minimal/moderate/severe
total-score cutoffs (the 0–3/4–7/≥8 bands circulated online belong to a
different modified 7-system instrument), so the tile reports the continuous total
and labels its descriptor as a *relative* reading of the 0–20 range; (3)
`cauchy-frostbite` Grade-4 prognosis is **"functional sequelae"** per the NEJM
2022 reproduction of Cauchy's table, not the unverified "general/systemic"
paraphrase. `szpilman-drowning` is **Class B** (a `docs/citation-staleness.md`
row records the Szpilman 1997 edition in force); the other three are **Class A**.
Each tile renders the spec-v50 §3 field-posture note: it grades severity and
frames mortality / amputation risk to inform triage and transport, it does not
author a descent, antivenom, debridement, or amputation order.
`lib/enviro-v111.js` + `views/group-v36.js`. **This closes Wave 2 of the
spec-v100 program (457 → 487, +30).**

#### spec-v112 — ICU mortality & sepsis-coagulopathy (+5 → 492, **Wave 3 opens**)

Wave 3 (Critical care & pulmonary) **opens** with five standard bedside
instruments. The catalog carried the ICU *admission-severity* models (`apache2`,
`saps-ii`) and the sepsis-*triage* tools (`sirs`, `qsofa-sofa`, `curb-65`), but
the front-door sepsis-mortality, sepsis-coagulopathy, ventilator-pneumonia,
resuscitation-endpoint, and ICU-weakness instruments were reachable nowhere. Four
home in **Clinical Scoring & Risk (Group G)**; `lactate-clearance` is a **Group E**
clinical-math tile:

| id | Rule | Output | Class |
|---|---|---|---|
| `meds-score` | Shapiro 2003 MEDS: nine weighted items (terminal illness 6; tachypnea/hypoxia, shock, plt < 150k, bands > 5%, age > 65 each 3; LRI, nursing-home, AMS each 2) | **total 0–27 + 28-day mortality band** (very low → very high, ~0.9 → ~50%) | A |
| `sic-score` | Iba 2019 ISTH SIC: platelet + PT-INR + total SOFA (capped at 2) | **total 0–6, SIC met when ≥ 4 AND platelet+INR subscore ≥ 3** | A |
| `cpis-vap` | Pugin 1991 modified CPIS: temperature, leukocytes (+band-form bonus), secretions, oxygenation, radiograph, culture (+Gram-stain bonus) | **total 0–12, > 6 suggests VAP** | A |
| `lactate-clearance` | Nguyen 2004: (initial − repeat) / initial × 100 | **% clearance, ≥ 10% favorable**, guarded denominator | A |
| `mrc-sum-score` | De Jonghe 2002 MRC sum: six movements graded bilaterally (12 groups) each 0–5 | **sum 0–60, < 48 = ICU-acquired weakness, < 36 severe** | A |

**Three source-governance catches** (the spec-v97 re-fetch rule, three research
agents cross-verifying each point table against ≥ 2 independent sources): (1)
`sic-score` enforces the **platelet + PT-INR subscore floor of ≥ 3** (not the ≥ 2
a first reading assumed) — so the SOFA item alone can never diagnose SIC; (2)
`cpis-vap` uses the **Pugin band-forms ≥ 50%** leukocyte bonus, not MDCalc's
absolute "≥ 500" rendering, and the **ARDS exclusion** on the oxygenation item is
load-bearing; (3) `mrc-sum-score` grades elbow **flexion** (two secondary sources
transcribe "extension" in error) and the ICU-acquired-weakness threshold is
strictly **< 48**. `lactate-clearance` **guards division by zero** (initial must
be > 0) and reports a rising lactate as a correctly-signed negative clearance,
never `NaN`/`Infinity`. All five are **Class A** (fixed point weights /
thresholds / arithmetic), so none forces a `docs/citation-staleness.md` row. Each
renders the spec-v50 §3 clinical-posture note: it frames risk or likelihood, it
does not author a resuscitation, anticoagulation, ventilator, sedation, or
weaning order. `lib/critcare-v112.js` + `views/group-v37.js`. **This opens Wave 3
of the spec-v100 program (487 → 492, +5).**

### Billing & reimbursement: what Medicare pays, whether the line survives, how the visit codes, what the drug bills, what the patient owes, and whether the claim is clean (spec-v77 → spec-v83, program complete)

The catalog has always been strong on the clinician at the bedside and competent
on the operations clock (appeal/timely-filing/PA deadlines, the 2021 E/M
selectors). What it lacked is the math a revenue-cycle professional redoes for
every claim and **cannot Google**: what a line will actually pay, after every
reduction. [spec-v77](docs/spec-v77.md) charters a six-spec billing & coding
program and a new home group — **Group B "Billing & Reimbursement"** —
governed by the same determinism bar as a creatinine-clearance calculator.
[spec-v78](docs/spec-v78.md) ships the first feature: the **MPFS reimbursement
engine**, five calculators ([lib/billing-v78.js](lib/billing-v78.js),
[views/group-b.js](views/group-b.js)). Catalog 337 -> 342.

The Medicare allowable for one professional line is not a lookup — it is a
computation, then a chain of reductions applied in a fixed order. The engine
encodes the order once and each tile states where it sits:

```
   rvu-payment            mppr               bilateral-pay      multi-surgeon-pay   sequestration-adjust
   ───────────            ────               ─────────────      ─────────────────   ────────────────────
   [wRVU·wGPCI            100% of the        modifier 50 by     16% assistant /     2% of the program-
  + peRVU·peGPCI    ─▶    highest line,  ─▶  BILAT SURG     ─▶  62.5% co-surgeon ─▶ payment portion
  + mpRVU·mpGPCI]         50% each           indicator          / team by report   (after cost-share),
     × CF                 subsequent         (150/100/200%)                          never the cost-share
   = allowed (NF & F)     (endoscopy:        or a hard          gated 0/9 =          = net Medicare check
   + site differential     base rule)        not-payable gate   not payable
```

Worked anchor (hand-checked to the cent): CPT **99214**, National Average GPCI
(1/1/1), CY2026 conversion factor **$32.7442** → non-facility
`(1.92 + 1.5 + 0.13) × 32.7442 = $116.24`, facility
`(1.92 + 0.69 + 0.13) × 32.7442 = $89.72`, site-of-service differential
`(1.5 − 0.69) × 1 × 32.7442 = $26.52`. Money is **integer cents end-to-end**,
formatted once at the render edge through `fmt()` — no float `toFixed` leak, zero
`NaN`/`Infinity` by construction (the [spec-v59](docs/spec-v59.md) safety
contract). Indicators **gate, they do not guess**: every indicator-0/9 path is a
hard "not payable / does not apply" message, never a silent $0.

Indicator cheat sheet (the values a coder reads off the MPFS Relative Value File;
entered into the tile, per doctrine clause 2):

| Indicator | 0 | 1 | 2 | 3 | 9 |
|---|---|---|---|---|---|
| **BILAT SURG** (`bilateral-pay`) | mod 50 not payable | 150% of the pair | already bilateral, 100% | each side full, 200% | concept n/a |
| **ASST/CO/TEAM SURG** (`multi-surgeon-pay`) | not separately payable | payable with documentation | payable | — | concept n/a |
| **MULT PROC** (`mppr`) | no reduction | — | standard 100/50/50 | special (endoscopy/imaging) | concept n/a |

Design decisions, all inside the [spec-v77](docs/spec-v77.md) §2 doctrine and
recorded in the [spec-v78](docs/spec-v78.md) implementation notes: the GPCI
triplets, RVU shards, and dated conversion factor are consumed from the
**existing `data/mpfs` corpus** (already generated by `scripts/build-data.mjs`)
rather than a duplicate `data/gpci` dataset, and every one is **overridable** so
the tool never fails for a code or locality off the bundle (and the CF override
models a percent-of-Medicare contract); the MPFS policy **indicators are a
labeled user input** rather than bundled, keeping the bundle light and avoiding
shipping potentially-stale values; the five dated constants are
ledger-tracked (`pa-staleness-ledger.json` ruleFamily `billing-v78`); and the
tiles classify as schema.org `WebPage` like the existing `em-time` / `ndc-convert`
billing tiles.

**[spec-v79](docs/spec-v79.md) ships the program's second feature: claim edits &
modifier logic** ([lib/billing-v79.js](lib/billing-v79.js)), five decision engines
for the question v78 doesn't answer — *will this line deny, and which modifier
unlocks it?* Catalog **342 → 347**. Where v78 is arithmetic, v79 is adjudication:
each tile is a clean input → decision, and **indicators gate, never guess**. Per
doctrine clause 2 **no NCCI PTP edit file and no MUE value table ship** — the
indicator/value is a labeled user input, so the tool can never be silently stale.

```
  ncci-ptp           mue-check          modifier-x-selector   global-period         modifier-order
  ────────           ─────────          ───────────────────   ─────────────         ──────────────
  Col-1 vs Col-2;    units vs MUE by    most-specific of      surgery date + GLOB   re-sequence ≤4:
  modifier ind.:     MAI: 1 cut/split,  XE>XS>XP>XU, else     DAYS → in/out of      pricing modifiers
  0 hard bundle,     2 ABSOLUTE (never  59 fallback, else     the 000/010/090       FIRST, then
  1 NCCI-assoc.      pays), 3 review.   refuse (no basis).    package → 24/58/78/   informational;
  modifier may       w/ docs. payable   CMS prefers the       79 (post-op) or 57/   flag LT+RT, 26+TC,
  bypass, 9 not      vs at-risk units.  specific X over 59.    25 (pre-op), or       dup, multi-asst.
  an active edit.                                             bundled (not payable).
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`ncci-ptp` 11042/97597 indicator 1 + modifier 59 → *bypass permitted, 59 is
NCCI-associated*; `mue-check` 4 units vs MUE 1, **MAI 2** → *1 payable, 3 at risk,
absolutely non-payable — do not appeal as a units error*; `global-period` surgery
2026-01-01, **090**, follow-up 2026-02-01 unrelated E/M → *inside the window
2025-12-31 … 2026-04-01, modifier 24* (UTC calendar math reused from
[lib/deadline.js](lib/deadline.js), day-0 = surgery, boundary day **inside**);
`modifier-order` `59 26 RT` → *claim order `26 59 RT`* (26 pricing leads).

Decision cheat sheet (the indicators a coder reads off the CMS edit files and
enters, per doctrine clause 2):

| Indicator | Meaning | Tile |
|---|---|---|
| **PTP 0 / 1 / 9** | no modifier permitted / NCCI-associated modifier may bypass / not an active edit | `ncci-ptp` |
| **MAI 1 / 2 / 3** | claim-line cut (rescuable) / date-of-service **absolute** / date-of-service reviewable w/ docs | `mue-check` |
| **X{EPSU}** | XE encounter · XS structure · XP practitioner · XU unusual — most specific wins; 59 only if none fits | `modifier-x-selector` |
| **GLOB DAYS** | 000 day-of-service · 010 minor 10-day · 090 major 90-day (+1 preop) · XXX/YYY/ZZZ/MMM no fixed window | `global-period` |
| **post-op / pre-op mods** | 24 unrelated E/M · 58 staged · 78 return-to-OR · 79 unrelated · 57/25 decision-for-surgery | `global-period` |

`lib/billing-v79.js` is in the [spec-v59](docs/spec-v59.md) fuzz harness alongside
`lib/billing-v78.js` (every export throw-safe and banned-token-free across the
object-aware matrix), its five decision constants are ledger-tracked under
ruleFamily `billing-v79`, and all ten v78/v79 Group B tiles carry a
`docs/audits/v12/` audit log.

**[spec-v80](docs/spec-v80.md) ships the program's third feature: E/M & time-based
coding, completed** ([lib/billing-v80.js](lib/billing-v80.js)), six engines that
finish a surface the catalog only half-covered. The office `em-time` / `em-mdm`
tiles do 99202–99215; the AMA's 2023 overhaul extended the same 2-of-3 MDM grid to
**every** setting, and the time-unit codes (critical care, prolonged services,
therapy minutes, anesthesia) are each pure input → output band math. Catalog
**347 → 353**. Setting and payer/rule forks are **explicit, never inferred** — no
tile silently assumes Medicare or office.

```
  em-mdm-2023        critical-care-time   split-shared         prolonged-services    therapy-units        anesthesia-units
  ───────────        ──────────────────   ────────────         ──────────────────    ─────────────        ────────────────
  2-of-3 MDM →       net min (− proc):    substantive part:    AMA 99417/99418 vs    Medicare 8-min:      (base + time/15
  setting code:      <30 not crit care,   >½ time OR the MDM    Medicare G2212/G0316  8-22=1, 23-37=2,     + modifying) × CF;
  inpt 99221-33,     30-74 = 99291,       → who BILLS + FS;     — AMA floor = prim.   38-52=3, 53-67=4     AA/QZ 100%, QK/QY/
  ED 99281-85,       then 99292 ×N per     NPP pays 85% of      min+15, Medicare =    (cumulative) vs     QX 50%, AD flat 3
  SNF 99304-10,      +30 min (104→×1,      the fee schedule.    max+15 (higher) →     AMA Rule of Eights  base units. The one
  home 99341-50.     134→×2). subtract     2024 CMS rule.       99205 75 vs 89 min.   (per-service) —     fee NOT on the RVU
  office → em-mdm.   the procedure time.                        each unit +15 min.    diverge at remndrs.  formula.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`em-mdm-2023` ED, Moderate MDM (problems & data reach Moderate, risk limits) →
**99284**; `critical-care-time` 104 net minutes → **99291 + 99292 ×1**;
`split-shared` physician 20 of 35 min → *physician bills, modifier FS, 100%*;
`prolonged-services` Medicare 99205 at 90 min → **G2212 ×1** (Medicare floor 89;
the AMA 99417 floor is 75 — the error this prevents); `therapy-units` 50
cumulative minutes → **3 units**; `anesthesia-units` 5 base + 60 min (4 time
units) + 1 modifying = **10 units × $22 = $220**, QK 50% = **$110**.

E/M & time-unit cheat sheet (what the tile turns into a code/units):

| Tile | Input | Output |
|---|---|---|
| `em-mdm-2023` | setting + 2-of-3 MDM (SF/Low/Mod/High) | the setting-specific code (99221–99350) + the limiting element |
| `critical-care-time` | net critical-care minutes | nothing <30 · 99291 for 30–74 · 99291 + 99292 ×N |
| `split-shared` | time split **or** who did the MDM | which provider bills · modifier **FS** · 100% (MD) vs **85%** (NPP) |
| `prolonged-services` | primary code + payer + total time | **99417/99418** (AMA) vs **G2212/G0316** (Medicare), units at +15 min |
| `therapy-units` | total min (Medicare) or per-service (RoE) | billable units + where the two rules **diverge** |
| `anesthesia-units` | base + time + mod + CF + direction | total units · (units × CF) · the medical-direction % |

`lib/billing-v80.js` joins the fuzz harness, its dated constants (the anesthesia
CF, the prolonged thresholds, the medical-direction percentages, the CPT E/M
edition) are ledger-tracked under ruleFamily `billing-v80`, and all six tiles
carry a `docs/audits/v12/` audit log — sixteen Group B audit logs in all. One
implementation note (recorded in the [spec-v80](docs/spec-v80.md) status):
`prolonged-services` ships the **physician** add-ons; the clinical-staff
99415/99416 path is deferred rather than shipped with an unverifiable threshold.
The last program spec ([v83](docs/spec-v83.md) claim integrity & facility
payment) has now shipped, closing the program at a 366 state (337 → 366, +29).

**[spec-v81](docs/spec-v81.md) ships the program's fourth feature: drug & infusion
billing** ([lib/billing-v81.js](lib/billing-v81.js)), three engines for the place
claims hemorrhage money and trigger audits. The HCPCS billing unit is almost never
the milligrams given; the JW/JZ discarded-drug rules are mandatory and error-prone;
and the 96360–96379 infusion hierarchy makes the primary code depend on the
*timeline*, not the drug. Catalog **353 → 356**. The vial-type fork is a **hard
gate** — a multi-dose vial **refuses** JW, it is not merely warned.

```
  ndc-hcpcs-units                drug-wastage                       infusion-hierarchy
  ───────────────                ────────────                       ──────────────────
  dose ÷ billing-unit size,      single-dose vial: administered     ONE initial per encounter,
  rounded per the rule           on one line + discarded with JW;   by the CMS HIERARCHY not
  (up/nearest/down):             zero waste → JZ (req. 2023-07-01). the clock — chemo > therap.
  35 mg ÷ 10 mg/unit = 3.5       multi-dose → JW REFUSED.           > hydration; infusion > push.
  → 4 units (flagged not a       admin + JW must total the units    <16-min infusion → IV push.
  clean multiple).               drawn. + least-waste vial search.  rest = seq/concurrent/+hr/push.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`ndc-hcpcs-units` 35 mg ÷ 10 mg/unit = **3.5 → 4 billing units** (rounded up, not a
clean multiple); `drug-wastage` 35 mg from a 50 mg single-dose vial (10 mg unit) →
**4 administered + 1 discarded (JW)** of **5** units drawn; `infusion-hierarchy`
chemo + therapeutic + hydration → chemo infusion is the initial **96413** (by
hierarchy, not chronology), therapeutic sequential **96367**, hydration **96361**.

Drug & infusion cheat sheet (what the tile turns into units/codes):

| Tile | Input | Output |
|---|---|---|
| `ndc-hcpcs-units` | dose + unit · billing-unit size · rounding | billing units · exact ratio · **not-a-clean-multiple** flag |
| `drug-wastage` | vial size · dose · unit · vial type (± sizes) | administered + **JW** units · **JZ** verdict · multi-dose **refusal** · least-waste vials |
| `infusion-hierarchy` | per-administration list (type, minutes) | the single **initial** code + every add-on role (seq/concurrent/+hour/push) |

`lib/billing-v81.js` joins the fuzz harness, its dated constants (the JZ-required
date, the 16-minute infusion/push floor, the 96360–96379 hierarchy ordering) are
ledger-tracked under ruleFamily `billing-v81`, and all three tiles carry a
`docs/audits/v12/` audit log — nineteen Group B audit logs in all. The tiles
compose with the existing `ndc-convert` (a digit-format converter, a different job)
and `mme-factors` without shadowing them; all are retained and cross-linked.

**[spec-v82](docs/spec-v82.md) ships the program's fifth feature: patient
responsibility & coordination of benefits** ([lib/billing-v82.js](lib/billing-v82.js)),
four engines that compute what the *patient* owes (spec-v78 computes what the *payer*
pays). These are the numbers on the statement the patient actually reads — pure
arithmetic billing offices routinely get wrong. They land in **Group C "Patient Bill
& Insurance Tools"** beside the appeal/deadline generators. Catalog **356 → 360**.
Money is integer cents end-to-end; the protection/network gate is **hard**, not the
patient-favorable default.

```
  medicare-cost-share        cob-calc                       allowed-amount             nsa-cost-share
  ───────────────────        ────────                       ──────────────             ──────────────
  Part B: deductible then    secondary payment + patient    charge − allowed =         protected service →
  20% of the allowed.        residual under ONE named       contractual WRITE-OFF;     cost-share capped at
  Part A: $1,736 ded +       method: lesser-of /            patient owes cost-share    the in-network amount
  $434/day (61-90) +         come-out-whole / non-          on the ALLOWED, not the    off the QPA; balance
  $868/day (LRD).            duplication / MSP — never      charge. In-network →       billing PROHIBITED.
  SNF: $217/day (21-100).    silently picked.               balance bill PROHIBITED.   Non-protected → refused.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`medicare-cost-share` Part B $500 approved → **$283 deductible + 20% of $217 ($43.40)
= $326.40**, Medicare pays **$173.60**; `cob-calc` lesser-of (primary left a $120
balance, secondary would pay $400) → secondary pays **$120**, patient residual **$0**;
`allowed-amount` charge $1,000 / allowed $600 in-network → **$400 write-off**, patient
**$200**, payer **$400** (balance billing the gap prohibited); `nsa-cost-share`
protected emergency, QPA $800, 20% → patient **$160**, plan **$640**, **$200**
prohibited balance bill.

Patient-bill cheat sheet (what the tile turns the claim into):

| Tile | Input | Output |
|---|---|---|
| `medicare-cost-share` | Part A/B/SNF + the dated CMS amounts | deductible + coinsurance the **patient** owes, before Medigap |
| `cob-calc` | primary allowed/paid · secondary allowed/would-pay · method | secondary payment + **patient residual** under the named method |
| `allowed-amount` | charge · allowed · benefit · in-network? | **write-off** + patient responsibility + payer pay · balance-bill flag |
| `nsa-cost-share` | service category · QPA · benefit | capped cost-share + **prohibited balance bill**, or a hard refusal |

`lib/billing-v82.js` joins the fuzz harness (zero non-finite leaks), shares the
integer-cents `dollarsToCents` with `lib/billing-v78.js`, and its dated CY2026 CMS
cost-sharing constants (the Part A/B deductibles, the day-banded and SNF coinsurance,
the 20% Part B share) are ledger-tracked under ruleFamily `billing-v82`. All four
tiles carry a `docs/audits/v12/` audit log. The deductible-before-coinsurance ordering
is encoded once and tested at the partial-deductible boundary — the case practices
miscompute.

**[spec-v83](docs/spec-v83.md) ships the program's sixth and final feature: claim
integrity & facility payment** ([lib/billing-v83.js](lib/billing-v83.js)), six engines
that close two gaps at once. Four **validators** catch a bad identifier or an
out-of-balance remittance *before* the clearinghouse rejects it; two **facility
pricers** compute the UB-04 institutional side (IPPS DRG, OPPS APC) the professional
spec-v78 engine does not touch. Catalog **360 → 366** — and with it the spec-v77
billing & coding program is **complete: 337 → 366 (+29)**. The validators verify
**format/structure only** (never enrollment, entitlement, or clinical correctness) and
say so on the tile; the pricers read the bundled `data/drg` / `data/apc` relative
weights but take every dated rate as an input, so they price any DRG/APC off-bundle.

```
  npi-validate          mbi-validate         icd10-validate        era-balance
  ────────────          ────────────         ──────────────        ───────────
  Luhn (ISO 7812) over  11-char CMS position grammar, structure +     billed = paid +
  80840 + the 9 digits; grammar; excluded   the required 7th       Σ(CO/PR/OA/PI);
  recompute & SHOW the  letters S,L,O,I,B,Z; char; placeholder X.   residual to the
  check digit, so a     names the FIRST      "denies for           cent; Σ PR = the
  transposition shows.  offending position.  specificity" flag.    patient balance.

  drg-payment (IPPS)                          apc-payment (OPPS)
  ──────────────────                          ──────────────────
  weight × wage-adjusted base (operating +    weight × conversion factor × wage;
  capital); post-acute transfer → per-diem    status-indicator packaging (N → $0);
  (first day doubled, capped at the full DRG).multiple-procedure discount on status-T.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`npi-validate` **1234567893** → valid, recomputed Luhn check digit **3** (a transposed
final digit is caught with the expected digit shown); `mbi-validate` **1EG4-TE5-MK73** →
valid against all **11** positions; `icd10-validate` **M54.5** → valid structure (and
`S52.5` flagged incomplete when a 7th character is required); `era-balance` billed
**$200** − paid **$120** − CO **$50** − PR **$30** = **$0** residual, patient owes **$30**;
`drg-payment` weight **1.5** × wage-adjusted base **$6,500** = **$9,750** (a 2-day
transfer at GMLOS 5 → **$5,850**); `apc-payment` two status-T procedures at CF **$87**
→ **$870** + **$174** (the second discounted **50%**), a packaged status-N line **$0**,
total **$1,044**.

Claim-integrity & facility cheat sheet (what the tile turns the claim into):

| Tile | Input | Output |
|---|---|---|
| `npi-validate` | a 10-digit NPI, or a 9-digit base | valid/invalid + the **recomputed check digit**, or the generated 10th digit |
| `mbi-validate` | an MBI string | valid/invalid + the **first offending position & rule** (incl. excluded letters) |
| `icd10-validate` | an ICD-10-CM code (± 7th-char-required) | structural validity + the **missing-7th-character / specificity** flag |
| `era-balance` | billed · paid · CO/PR/OA/PI | balances? + the exact **residual** + the **Σ PR** patient balance to post |
| `drg-payment` | DRG weight · operating/capital base · wage · transfer | base DRG payment + the **per-diem transfer** reduction + add-ons |
| `apc-payment` | APC lines (weight, status) · CF · wage · discount | per-line + total, with **packaging** and the **multiple-procedure discount** |

`lib/billing-v83.js` joins the fuzz harness (zero non-finite leaks), all money is
integer cents, and its dated constants (the IPPS operating/capital base rates, the OPPS
conversion factor, the MBI grammar/excluded-letter set) are ledger-tracked under
ruleFamily `billing-v83`. All six tiles carry a `docs/audits/v12/` audit log — the
final entries in a complete Group B of twenty-five billing & reimbursement engines.

## System design and architecture overview

The application is one HTML file, one CSS file, one JavaScript module set,
a service worker, and a data folder of sharded JSON. There is no backend.
The browser receives static files from the same origin and runs everything
locally. Data shards are loaded only when a utility that needs them is
opened. The service worker pre-caches the application shell on first load and
caches data shards on first access, keyed to the build hash so new
deployments invalidate old caches cleanly. The
application has zero runtime dependencies. A weekly CI job runs the data
refresh pipeline and opens a pull request with any updated data. For the
long version, see [docs/architecture.md](docs/architecture.md).

```
            BUILD TIME (CI)                          RUNTIME (browser, offline-capable)
 ┌───────────────────────────────┐         ┌──────────────────────────────────────────┐
 │ public datasets (CMS, FDA,    │         │  index.html  +  styles.css  +  app.js      │
 │ AMA, NPPES, …)                │         │        │                                   │
 │        │  scripts/build-data  │         │        ▼                                   │
 │        ▼                      │  ship   │   router (URL hash)  ──►  tile view        │
 │  sharded JSON  + SHA-256      │ ──────► │        │                     │             │
 │  manifests (data/)            │  static │        ▼                     ▼             │
 │        │  scripts/build       │  files  │   lazy-load data shard   pure compute      │
 │        ▼                      │         │   (verified vs manifest)  (lib/*.js)       │
 │  dist/  (492 tool pages,      │         │        │                     │             │
 │  OG cards, sitemap, SBOM)     │         │        ▼                     ▼             │
 └───────────────────────────────┘         │   service worker cache    result + cite   │
                                            │   (keyed to build hash)                    │
   CSP: connect-src 'self'  ───────────────►│   NO outbound network · local-only · NO AI │
                                            └──────────────────────────────────────────┘
```

The trust boundary is the CSP `connect-src 'self'` directive: once the static
shell is served, the page cannot open a network connection, so user input
physically cannot leave the device. Everything below the router is a pure
function of (URL hash + bundled data); there is no mutable server state, no
session, and nothing to log.

### Build output & the CI gate chain

`npm run build` is deterministic: same inputs → same `dist/` (the build hash is
content-addressed). One build emits **449 HTML pages** plus the supporting
assets:

| Output | Count | Source |
|--------|------:|--------|
| Pre-rendered tool pages (`dist/tools/<id>/`) | 492 | `scripts/build-tool-pages.mjs` |
| Audience hub pages (`dist/for/<audience>/`) | 6 | `scripts/build-hub-pages.mjs` |
| Topic pages + `/topics/` index | 8 + 1 | `scripts/build-topic-pages.mjs` |
| `/commitments/` | 1 | `scripts/build-commitments-page.mjs` |
| SPA shell (`dist/index.html`) | 1 | copied + LD-stamped |
| **Total HTML** | **449** | — |
| OG card PNGs (`dist/og/`) | 446 | `scripts/build-og-images.mjs` |
| Sitemap URLs (`sitemap.xml`) | 454 | `scripts/build-sitemap.mjs` |

Nothing ships unless it survives the gate chain. `npm run lint` is ESLint
followed by seven custom static checks, each enforcing one invariant; any
failure is a non-zero exit that blocks the merge:

| Gate (`scripts/`) | Invariant it enforces |
|-------------------|-----------------------|
| `grep-check.mjs` | no banned tokens (em-dashes in tests, stale counts, AI/telemetry strings) |
| `check-output-safety.mjs` | no view interpolates unescaped user input into the DOM |
| `check-citations.mjs` | every tile is cited; guideline-issuer tiles carry an accessed-date + a staleness-ledger row |
| `check-catalog-truth.mjs` | the catalog count (463) is identical across all 13 surfaces; no orphan/removed-tile ids |
| `check-commitments.mjs` | storage allowlist + AI/auth deny + license + CSP are intact |
| `check-pa-staleness.mjs` | every PA rule is source-anchored and within its freshness window |
| `audit-pa.mjs` | the 46 PA-linter fixtures still reproduce their committed golden reports |

`npm run test` adds the 4,332-test unit suite, the a11y check, and dataset
integrity verification; `npm run test:e2e` runs the Playwright suite against
real Chromium/Firefox/WebKit — including a full-catalog 320 px no-horizontal-
scroll sweep over every SPA route **and** every one of the 463 pre-rendered
static pages, so a tile can never ship mobile overflow undetected.

### Repository layout

```
index.html          single-page shell (hero-search combobox + static browse-by-category nav, tile mount)
styles.css          one stylesheet (responsive; no horizontal scroll — enforced catalog-wide at 320px in CI)
app.js              router, hero-search wiring, view wiring, the UTILITIES catalog
                    (492 tiles — the single source of truth; zero runtime deps)
sw.js               service worker — precache shell, cache shards by build hash
theme.js            light/dark theme toggle (writes only sw-theme, allowlisted)
lib/input-persist.js opt-in "remember my inputs" (off by default; numbers only)
lib/                pure compute modules, one per tile family
  ├─ data.js        same-origin data loader (per-URL promise cache)
  ├─ meta.js        per-tile citation / example / source-stamp metadata
  ├─ clinical*.js   clinical math / scoring / criteria
  └─ pa/            the prior-auth linter: extract · classify · payer · rules ·
                    engine · report · docx · staleness  (spec-v52)
views/              per-group view renderers (group-*.js, pa-lint.js)
data/               sharded public datasets + SHA-256 manifests (46 datasets)
scripts/            build-*, check-* (catalog-truth, output-safety, citations,
                    commitments, PA staleness), audit-* — the CI gate chain
docs/               specs (spec-v4 onward) + per-tile v11/v12 audit logs +
                    citation-staleness ledger +
                    architecture / threat-model / …
test/               unit/ (node:test) · integration/ (Playwright) · fixtures/
dist/               build output (492 tool pages, OG cards, sitemap, SBOM)
```

### Discovery: how a query finds the right tool among 492

With 492 tiles, search quality *is* the product — a tool you cannot find does
not exist. Discovery is deterministic and offline (no fuzzy-match service, no
embedding model, no AI). The home `#hero-search` combobox builds its dropdown
from two complementary rankers, both pure functions of the typed query:

```
type into #hero-search
          │
          ├─► searchUtilities() ── fast name/id ranker (exact / prefix /
          │     (the dropdown list)   substring / word-boundary over every
          │                           tile's name + id) → ranked top 12
          │
          └─► resolvePrompt() ───── the synonym + phrasing resolver below;
                (surfaced first)     its single best tile is hoisted to the
                                     top of the list so patient phrasing that
                                     shares no token with a tile name still
                                     wins ("they denied it" → appeal-letter,
                                     "kidney function" → egfr).
```

`resolvePrompt` ([lib/prompt.js](lib/prompt.js)) runs the query through three
ordered passes and returns the single best tile id or `null`:

```
query ─► normalizePhrase (lowercase, strip punctuation, collapse spaces)
          │
          ▼
   ① synonym table ── data/synonyms.json: hand-curated patient phrasing
          │            ("they denied it" ► appeal-letter). Exact/substring,
          │            audience-aware. Hit ► return {why:'synonym'}.
          ▼ miss
   ② token ranker ── rankTiles(): score every tile by the rubric below,
          │            keep the best if it clears the threshold.
          ▼ miss
   ③ edit-distance retry ── re-run the synonym table allowing one typo
                            (withinOneEdit) ► return {why:'synonym-edit-distance'}.
```

The ranker scores each tile against a transparent, unit-tested rubric
(`RANKER_RUBRIC`); the highest score wins, and nothing surfaces below the
threshold (so a weak partial match returns `null` rather than a wrong tool):

| Signal | Weight | Where it comes from |
|---|---|---|
| Exact query phrase in the tile **name** | +10 | `name` |
| Exact query phrase in the **description** | +5 | `desc` |
| Per-token match in the **name** | +3 | tokenized `name` |
| Per-token match in the **description** | +1 | tokenized `desc` |
| Per-token match in an **audience / tag / specialty** | +1 | `audiences` + `tags` + `specialties` |
| Audience-aligned with the active audience | +2 | the `#a=` deep-link audience (nurse-first by default) |
| Audience-misaligned | −2 | — |
| **Surfacing threshold** | **3** | a result must score ≥ 3 |

**Design decisions.** (1) Curated synonyms run *first* because patient phrasing
("my labs are weird") rarely shares tokens with a clinical tile name
(`lab-interpret`); the ranker handles the long tail of clinician/biller queries.
(2) `specialties` and `tags` are weighted +1 — they are *boosters and
tie-breakers*, not primary routes: a lone specialty hit (+1) sits below the
threshold (3), so "nephrology" surfaces `egfr` only when it also matches the
name/description, never on the tag alone. That keeps the specialty backfill
(every clinical tile now carries specialty tags, via `SPECIALTIES_BACKFILL` in
[lib/meta.js](lib/meta.js)) from flooding results with loose tag-only matches.
(3) The whole
path is pure and deterministic, so it is exhaustively unit-tested
([test/unit/prompt.test.js](test/unit/prompt.test.js)) — including the audience
alignment and the specialty tie-break — and adds no network call.

### Provenance and citation integrity (spec-v54 design, spec-v60 completion)

A login-less, AI-free calculator earns trust only if the nurse can see, on the
tile, exactly which published source produced the number — and tell whether that
source is current. spec-v54 defined the invariants; spec-v60 built the machinery
(the gate, the ledger, and the `citationAccessed` convention) and extended it
across the full 492-tile catalog, pinning the last three unpinned "current
edition" phrases and re-verifying every guideline tile against its latest known
edition. Three invariants make that auditable, each enforced by the
`check-citations.mjs` lint gate (in the `npm run lint` chain) over all 492 tiles:

| Invariant | Rule | Enforcement |
|---|---|---|
| **Inline** | every `clinical: true` tile has a non-empty `META[id].citation` | gate rule 1 (every clinical tile, 0 off-tile) |
| **Well-formed** | no bare URL in citation text (URLs live in `citationUrl`); `citationUrl` parses as `https://` | gate rules 2–3 |
| **Current — or justified-stale** | a guideline-issuer citation carries an `accessed` date **and** a staleness-ledger row; no unpinned "current edition" phrase | gate rules 4–5 (the guideline-issuer tiles) |

```
META[id].citation  ──►  check-citations.mjs  ──►  guideline-issuer?  ──► needs accessed + ledger row
   (lib/meta.js)         (case-sensitive /\b(CDC|KDIGO|AGS|ACC|         │
                          AHA|ATS|IDSA|ESC|WHO|AAP|ACOG|SAMHSA|         ▼
                          NICE)\b|Joint Commission/)         docs/citation-staleness.md
                                                             (shipped vs latest edition + justification)
```

The ledger ([docs/citation-staleness.md](docs/citation-staleness.md)) is the
one-file answer to "is Sophie current?": one row per guideline tile naming the
**edition shipped**, the **latest known edition**, the **accessed** date, and a
**justification** wherever the two differ. Two examples of a *justified* gap:
KDIGO AKI staging is deliberately kept at the 2012 edition because the 2024 KDIGO
update governs CKD evaluation, not AKI staging; the 2013 ACC/AHA Pooled Cohort
Equations (`ascvd`) are retained as the still-widely-charted instrument while the
race-free 2024 AHA PREVENT model ships separately as the `prevent` tile.

**Design decision — no build-time link checker.** URL *syntax* is verified
statically; URL *liveness* is a human step at the quarterly source pull, stamped
via `citationAccessed`. Fetching every DOI at build time would be a network call,
which the dependency/network budget (spec-v10, spec-v50 §3) forbids. The
gate's pure detector is unit-tested with one negative fixture per rule, and a
Playwright pin ([test/integration/citations.spec.js](test/integration/citations.spec.js))
confirms a long-DOI tile renders its inline citation and wraps — no horizontal
scroll — at 320px.

### Show your work: source-anchored derivations (spec-v48)

A citation tells the nurse *where* a number comes from; a derivation shows *how
this number* was built from the inputs in front of her. Every wired score tile
carries a collapsed **"Where does this come from?"** block
([docs/spec-v48.md](docs/spec-v48.md)) that, on each input change, re-renders the
formula, the original study population, the limits of validity, a verbatim source
quote, and a live `Your inputs` list whose per-input contributions sum to the
score. Coverage has been backfilled in small reviewable waves (the running count
is in the feature summary above and in [CHANGELOG.md](CHANGELOG.md)).

The block is pure data. `META[id].derivation` declares it; `lib/derivation.js`
renders it with no `innerHTML` and no third-party deps:

```js
META.gbs.derivation = {
  formula: 'Glasgow-Blatchford = sum of weighted markers (0-23): …',
  components: [
    // a fixed integer weight …
    { inputKey: 'melena', label: 'Melena present', points: 1 },
    // … or a (value, allInputs) callback for banded / sex- / age- /
    //   cross-input weights (here hemoglobin is scored by sex):
    { inputKey: 'hgbGdl', label: 'Hemoglobin (g/dL)',
      points: (v, inputs) => hgbBand(v, inputs.sex) },
  ],
  bands: [ /* total → interpretation */ ],
  population: '…', units: { /* one entry per inputKey */ }, validity: '…',
  source: 'Blatchford O, et al. Lancet. 2000;360:1318-1321.', // verbatim citation
};
```

A `points` value is either a fixed integer weight or a `(value, inputs) => number`
callback. The callback form is what lets a single uniform renderer express banded
thresholds (Glasgow-Blatchford, Oakland, MODS), sex-specific cutoffs (GBS
hemoglobin), severity dominance (Charlson), reverse-scored items (DAST-10,
GDS-15), and age-banded cutoffs (PELOD-2, pSOFA) without bespoke per-tile render
code — each callback sees the whole input object, not just its own field.

```
input change ─► updateDerivationSteps(detailsEl, META[id], inputs)
                    │  per component:  pts = points(inputs[inputKey], inputs)
                    ▼
                Your inputs:   +pts — label (input: value)   × N
                Total: Σ pts   →   band
                    ▲
   CI cross-check (test/unit/derivation.test.js):
       re-sum the SAME components and assert  Σ pts === scoringFn(inputs)
       across boundary cases, for every wired tile
```

**The guarantee that makes it trustworthy.** The on-screen breakdown and the
headline score come from two independent code paths — the derivation `components`
(metadata in `lib/meta.js`) and the tile's scoring function (`lib/*.js`). A unit
suite ([test/unit/derivation.test.js](test/unit/derivation.test.js)) re-sums the
components for every wired tile across boundary cases and asserts the total equals
the live score, and a units-coverage guard asserts every `inputKey` is documented.
So the "show your work" panel **cannot silently drift** from the number the nurse
acts on: a mis-transcribed weight, or a shared scoring table changing under a
copied band, fails CI. Non-finite inputs route through `fmt()` (spec-v59), so a
blank or impossible field renders an em-dash — never `NaN` — in the breakdown.

## The Prior-Auth Packet Linter (`pa-lint`)

`pa-lint` (spec-v52) is the catalog's first `document-linter` tile: instead
of form fields it consumes dropped files (PDF / DOCX / TXT) and produces a
deterministic findings report. It checks the *procedural completeness* of a
prior-authorization packet — is the member ID present, is the ordering NPI
Luhn-valid, is a clinical note attached, does an inpatient Aetna,
UnitedHealthcare, Anthem, Cigna, Humana, HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, or BCBS Alabama request carry a
discharge plan — **not** clinical
coverage criteria, which are the reviewer's judgment.
Everything runs in the browser; the packet never leaves the tab.

The pipeline is a pure, byte-deterministic function of the input bytes
(spec-v52 §4.10): the same packet always yields the same report, which is
what makes the golden-fixture CI gate possible.

```
 drop files (PDF/DOCX/TXT/scanned-PDF/image)
        │
        ▼
 ┌──────────────┐   pdf.js / mammoth.js (vendored, no network)
 │   ingest     │── extract text, SHA-256 each file
 └──────┬───────┘   scanned PDF / image? → "Run on-device OCR" button →
        │           tesseract.js (vendored, lazy, same-origin, in-worker)
        │           → text → re-run pipeline   (spec-v52 §4.3.1)
        ▼
 ┌──────────────┐   lib/pa/extract.js  → codes, dates, NPIs, POS, signatures
 │   extract    │   lib/pa/classify.js → per-document role (clinical-note,
 └──────┬───────┘                         imaging-report, lab-result, …)
        ▼
 ┌──────────────┐   lib/pa/payer.js → one bucket: cms-medicare-ffs |
 │ detect payer │     cms-medicare-advantage | medicaid | medicaid-ca |
 └──────┬───────┘     medicaid-ny | medicaid-tx | medicaid-fl | medicaid-oh |
        ▼               medicaid-il | medicaid-wa | medicaid-ga | medicaid-nc |
        ▼               medicaid-pa | medicaid-mi | medicaid-nj | medicaid-az |
        ▼               medicaid-in |
        ▼               aetna | uhc | anthem | cigna |
        ▼               humana | hcsc | highmark | florida-blue | bcbsm |
        ▼               blue-shield-ca | ibx | carefirst | bcbsnc | horizon |
        ▼               bcbst | bcbsma | bcbsal | bcbssc | arkbcbs | bluekc |
        ▼               bcbsmn | bcbsla | hmsa | commercial | unknown
 ┌──────────────┐   lib/pa/rules.js → 876 rules, each a pure check(bundle).
 │  run engine  │   Overlay rules self-gate on the detected payer and
 └──────┬───────┘   vacuously pass off-bucket.
        ▼
 ┌──────────────┐   lib/pa/report.js → severity-sorted findings + evidence
 │ build report │   Three downloads, all built in-tab:
 └──────────────┘     • full JSON   • PHI-redacted JSON   • DOCX (§4.6/§4.7)
```

Severities follow spec-v52 §4.4: `block` (packet cannot be reviewed as-is),
`flag` (likely denial / RFI), `info` (nice-to-have), `pass`. A finding never
guarantees an approval or a denial — it reports only what the ruleset checks.

### Ruleset at a glance (876 rules)

| Family            | Count | Scope                                                        | Ledger source              |
|-------------------|-------|--------------------------------------------------------------|----------------------------|
| `R-PA-NNN`        | 60    | §4.5.1 core, payer-agnostic completeness (IDs, codes, NPI, dates, signatures, PHI minimization) | AMA CPT / CMS HCPCS / ICD-10-CM / POS / NCCI / NPPES |
| `R-PA-CMS-NNN`    | 25    | §4.5.2 Medicare FFS DME / oxygen / PAP / mobility            | CMS IOM 100-08, NCD/LCD     |
| `R-PA-MA-NNN`     | 15    | §4.5.3 Medicare Advantage                                    | CMS MA 422                  |
| `R-PA-MCD-NNN`    | 10    | §4.5.4 Medicaid state-agnostic core                          | Medicaid core              |
| `R-PA-RAD-NNN`    | 5     | §4.5.5 radiology / advanced imaging                          | ACR Appropriateness        |
| `R-PA-INF-NNN`    | 5     | §4.5.5 infusion / biologics                                  | FDA labeling               |
| `R-PA-SURG-NNN`   | 5     | §4.5.5 surgery (conservative trial, imaging, ASA, consent)   | Surgical-indication policy  |
| `R-PA-BH-NNN`     | 5     | §4.5.5 behavioral health (DSM-5-TR, LOC, risk)               | DSM-5-TR                   |
| `R-PA-GEN-NNN`    | 5     | §4.5.5 genetic testing                                       | NCCN / ACMG                |
| `R-PA-AETNA-NNN`  | 20    | §4.5.7 Aetna commercial overlay — the first named-payer set  | `aetna-precert`            |
| `R-PA-UHC-NNN`    | 20    | §4.5.8 UnitedHealthcare commercial overlay — the second named-payer set | `uhc-precert`   |
| `R-PA-ANTHEM-NNN` | 20    | §4.5.9 Anthem BCBS / Elevance commercial overlay — the third named-payer set | `anthem-precert` |
| `R-PA-CIGNA-NNN`  | 20    | §4.5.10 Cigna commercial overlay — the fourth named-payer set | `cigna-precert`            |
| `R-PA-HUMANA-NNN` | 20    | §4.5.11 Humana commercial overlay — the fifth named-payer set | `humana-precert`           |
| `R-PA-HCSC-NNN`   | 20    | §4.5.12 HCSC / Blue Cross Blue Shield (IL/TX/MT/NM/OK) — the sixth named-payer set | `hcsc-precert` |
| `R-PA-HIGHMARK-NNN` | 20  | §4.5.13 Highmark / Blue Cross Blue Shield (PA/WV/DE/NY) — the seventh named-payer set | `highmark-precert` |
| `R-PA-FLBLUE-NNN` | 20  | §4.5.14 Florida Blue / GuideWell (Blue Cross and Blue Shield of Florida) — the eighth named-payer set | `floridablue-precert` |
| `R-PA-BCBSM-NNN` | 20  | §4.5.15 BCBSM / Blue Cross Blue Shield of Michigan (+ Blue Care Network) — the ninth named-payer set | `bcbsm-precert` |
| `R-PA-BSCA-NNN` | 20  | §4.5.16 Blue Shield of California — the tenth named-payer set | `blueshieldca-precert` |
| `R-PA-IBX-NNN` | 20  | §4.5.17 Independence Blue Cross (southeastern PA / Philadelphia) — the eleventh named-payer set | `ibx-precert` |
| `R-PA-CAREFIRST-NNN` | 20 | §4.5.18 CareFirst BlueCross BlueShield (MD / DC / Northern VA) — the twelfth named-payer set | `carefirst-precert` |
| `R-PA-BCBSNC-NNN` | 20 | §4.5.19 Blue Cross Blue Shield of North Carolina (Blue Cross NC) — the thirteenth named-payer set | `bcbsnc-precert` |
| `R-PA-HORIZON-NNN` | 20 | §4.5.20 Horizon Blue Cross Blue Shield of New Jersey — the fourteenth named-payer set | `horizon-precert` |
| `R-PA-BCBST-NNN` | 20 | §4.5.21 Blue Cross Blue Shield of Tennessee — the fifteenth named-payer set | `bcbst-precert` |
| `R-PA-BCBSMA-NNN` | 20 | §4.5.22 Blue Cross Blue Shield of Massachusetts — the sixteenth named-payer set | `bcbsma-precert` |
| `R-PA-BCBSAL-NNN` | 20 | §4.5.23 Blue Cross Blue Shield of Alabama — the seventeenth named-payer set | `bcbsal-precert` |
| `R-PA-BCBSSC-NNN` | 20 | §4.5.24 Blue Cross Blue Shield of South Carolina — the eighteenth named-payer set | `bcbssc-precert` |
| `R-PA-ARKBCBS-NNN` | 20 | §4.5.25 Arkansas Blue Cross and Blue Shield — the nineteenth named-payer set | `arkbcbs-precert` |
| `R-PA-BLUEKC-NNN` | 20 | §4.5.26 Blue Cross and Blue Shield of Kansas City — the twentieth named-payer set | `bluekc-precert` |
| `R-PA-BCBSMN-NNN` | 20 | §4.5.27 Blue Cross and Blue Shield of Minnesota — the twenty-first named-payer set | `bcbsmn-precert` |
| `R-PA-BCBSLA-NNN` | 20 | §4.5.28 Blue Cross and Blue Shield of Louisiana — the twenty-second named-payer set | `bcbsla-precert` |
| `R-PA-HMSA-NNN` | 20 | §4.5.29 HMSA / Blue Cross Blue Shield of Hawaii — the twenty-third named-payer set | `hmsa-precert` |
| `R-PA-MCAL-NNN` | 20 | §4.5.30 Medi-Cal (California Medicaid) — first per-state Medicaid overlay | `medi-cal-precert` |
| `R-PA-MCNY-NNN` | 20 | §4.5.31 New York State Medicaid | `ny-medicaid-precert` |
| `R-PA-MCTX-NNN` | 20 | §4.5.32 Texas Medicaid | `tx-medicaid-precert` |
| `R-PA-MCFL-NNN` | 20 | §4.5.33 Florida Medicaid | `fl-medicaid-precert` |
| `R-PA-MCOH-NNN` | 20 | §4.5.34 Ohio Medicaid | `oh-medicaid-precert` |
| `R-PA-MCIL-NNN` | 20 | §4.5.35 Illinois Medicaid | `il-medicaid-precert` |
| `R-PA-MCWA-NNN` | 20 | §4.5.36 Washington Apple Health (Medicaid) | `wa-medicaid-precert` |
| `R-PA-MCGA-NNN` | 20 | §4.5.37 Georgia Medicaid | `ga-medicaid-precert` |
| `R-PA-MCNC-NNN` | 20 | §4.5.38 North Carolina Medicaid | `nc-medicaid-precert` |
| `R-PA-MCPA-NNN` | 20 | §4.5.40 Pennsylvania Medicaid (Medical Assistance / PROMISe / HealthChoices) | `pa-medicaid-precert` |
| `R-PA-MCMI-NNN` | 20 | §4.5.41 Michigan Medicaid (MDHHS / CHAMPS / Healthy Michigan Plan) | `mi-medicaid-precert` |
| `R-PA-MCNJ-NNN` | 20 | §4.5.42 New Jersey Medicaid (DMAHS / NJ FamilyCare / NJMMIS) | `nj-medicaid-precert` |
| `R-PA-MCAZ-NNN` | 20 | §4.5.43 Arizona Medicaid (AHCCCS / AHCCCS Complete Care / AHCCCS Online) | `az-medicaid-precert` |
| `R-PA-MCIN-NNN` | 20 | §4.5.44 Indiana Medicaid (FSSA / OMPP / Healthy Indiana Plan / IHCP) | `in-medicaid-precert` |
| `R-PA-OPD-NNN` | 1 | §4.5.2.1 CMS Hospital OPD Prior Authorization — the first **real** bundled PA-list membership test | `cms-opd-pa-list` |

The twenty-three commercial overlays (§4.5.7 Aetna, §4.5.8 UnitedHealthcare, §4.5.9
Anthem, §4.5.10 Cigna, §4.5.11 Humana, §4.5.12 HCSC, §4.5.13 Highmark, §4.5.14
Florida Blue, §4.5.15 BCBSM, §4.5.16 Blue Shield of California, §4.5.17
Independence Blue Cross, §4.5.18 CareFirst, §4.5.19 Blue Cross NC, §4.5.20
Horizon, §4.5.21 BCBS Tennessee, §4.5.22 BCBS Massachusetts, §4.5.23 BCBS
Alabama, §4.5.24 BCBS South Carolina, §4.5.25 Arkansas BCBS, §4.5.26 BCBS
Kansas City, §4.5.27 BCBS Minnesota, §4.5.28 BCBS Louisiana, §4.5.29 HMSA)
are each keyed to a single named payer and ship 20 rules
apiece. They are deliberately structurally parallel — same families, same
severities — so a packet linted under any one payer is auditable against the
others. The payer-specific routing names differ where each payer actually differs
(Aetna's CPB / NME; UHC's Provider Portal / Optum; Anthem's Availity ICR /
Carelon / Blue Distinction Centers; Cigna's CignaforHCP / eviCore / Express
Scripts / LifeSOURCE; Humana's Availity / CenterWell / National Transplant
Network; HCSC's Availity / Prime Therapeutics / Blue Distinction Centers;
Highmark's Availity / Provider Resource Center / Blue Distinction Centers; Florida
Blue's Availity / provider portal / Blue Distinction Centers; BCBSM's Availity /
Blue Care Network / Blue Distinction Centers; Blue Shield of California's Availity
/ provider connection / Blue Distinction Centers; Independence Blue Cross's
Availity / PEAR portal / Blue Distinction Centers; CareFirst's CareFirst Direct /
iEXchange / Blue Distinction Centers; Blue Cross NC's Blue e / Availity / Blue
Distinction Centers; Horizon's NaviNet / Availity / Blue Distinction Centers;
BCBST's Availity / BlueAccess / Blue Distinction Centers; BCBSMA's Provider
Central / Availity / Blue Distinction Centers; BCBSAL's ProviderAccess / Availity
/ Blue Distinction Centers; BCBSSC's My Insurance Manager / Availity / Blue
Distinction Centers; Arkansas Blue Cross's AHIN / Availity / Blue Distinction
Centers; Blue KC's Availity / Blue KC provider portal / Blue Distinction Centers;
BCBSMN's Availity / provider portal / Blue Distinction Centers; BCBSLA's
iLinkBlue / Availity / Blue Distinction Centers; HMSA's HHIN / Blue Distinction
Centers —
both Humana's and HCSC's
imaging programs are named generically since the vendor names collide with a
barred AI-vendor substring, spec-v50 §3.6). The first five are the largest
commercial / MA plans by national PA volume; HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, BCBS Alabama, BCBS South Carolina,
Arkansas BCBS, BCBS Kansas City, BCBS Minnesota, BCBS Louisiana, and HMSA are
the eighteen
largest independent Blue Cross Blue Shield licensees and the first of the §9
"Blues plans by state" candidates. Two same-state pairs are deliberately
disambiguated by precedence: Blue Shield of California vs. Anthem Blue Cross of
California, and Independence Blue Cross (southeastern PA) vs. Highmark (western
PA) — in each case the `anthem` / `highmark` bucket is checked first. A third
collision is handled by anchor choice, not order: `bcbsm` (Michigan) is a
substring of `bcbsma` (Massachusetts), so the Massachusetts bucket anchors on the
spelled-out plan name and never the bare acronym:

| Rules     | Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of CA / IBX / CareFirst / Blue Cross NC / Horizon / BCBST / BCBSMA / BCBSAL / BCBSSC / Arkansas / Blue KC / BCBSMN / BCBSLA / HMSA |
|-----------|-------------------------------------------------------------------------|
| 001–005   | Coverage criteria, supporting records, submission channel, prior-auth-list stub, questionnaire / advance notification / auth-before-service |
| 006–010   | Review *modes*: concurrent / continued-stay, advanced-imaging site-of-care, expedited urgency, objective evidence / surgery site-of-care, J-code NDC |
| 011–015   | Step therapy, bariatric / specialty-drug diagnosis, genetic-testing program, retrospective review, DME written order |
| 016–020   | DME or behavioral-health LOC, transplant Centers-of-Excellence / Blue Distinction routing, experimental-service evidence, appeal reference, out-of-network gap |

Every overlay rule self-gates on `bundle.payer === '<payer>'` and vacuously
passes on any other packet, so the 135 non-commercial rules, the twenty-three
20-rule commercial overlays, the fourteen per-state Medicaid overlays, and the
CMS OPD prior-auth-list rule coexist
without false positives — a Medicare FFS
packet never trips a Humana rule, and vice versa. Each rule's
source URL is tracked in
[pa-staleness-ledger.json](pa-staleness-ledger.json) and re-verified on the
§4.5.6 maintenance cadence; `npm run lint` fails CI on any ledger ↔ ruleset
drift, and `scripts/audit-pa.mjs` diffs the full pipeline output against
forty-six committed golden reports so any rule, extractor, or classifier change
that moves a byte is caught.

**The first real PA-list membership test (`R-PA-OPD-001`, §4.5.2.1).** Until wave
52-45, every "is the requested service on the payer's prior-auth list?" rule
(`R-PA-053` and the per-overlay `-004` rules) shipped *vacuous* — it passed with a
pointer because no list was bundled. Wave 52-45 flips that for one real list: the
[CMS Hospital Outpatient Department (OPD) Prior Authorization](https://www.cms.gov/research-statistics-data-and-systems/monitoring-programs/medicare-ffs-compliance-programs/prior-authorization-and-pre-claim-review-initiatives/prior-authorization-certain-hospital-outpatient-department-opd-services)
required-services CPT list, bundled by category in
[`lib/pa/cms-opd-pa-list.js`](lib/pa/cms-opd-pa-list.js) (blepharoplasty,
botulinum toxin, panniculectomy, rhinoplasty, vein ablation, cervical fusion with
disc removal, implanted spinal neurostimulators, facet joint interventions). The
rule does a genuine CPT-membership test: a **Medicare FFS hospital-outpatient**
(POS 22 / 19) packet requesting a listed service **without a Unique Tracking
Number (UTN)** flags (Medicare requires the OPD authorization and the UTN on the
claim before the service is furnished); an office-based (POS 11) service, a
non-listed CPT, or a non-Medicare-FFS payer self-gate it off. The CMS list is a
single, federally published, stable source — the cleanest first list to bundle —
and is re-verified on the §4.5.6 cadence (`cms-opd-pa-list` in the ledger). It is
the template the remaining `-004` rules follow as their payer lists are bundled.

**Payer detection is first-match-wins, in a deliberate order.** The buckets
are nested — "Aetna Medicare Advantage" is *both* an MA plan and an Aetna plan —
so `lib/pa/payer.js` checks them in a fixed precedence and stops at the first
anchor hit. This is the cheat sheet:

```
 1. cms-medicare-advantage   "medicare advantage", "mapd", "humana gold plus", …
 2. medicaid-ca              "medi-cal", "denti-cal", "california medicaid"
 3. medicaid-ny              "new york state medicaid", "nys medicaid", "emedny"
 4. medicaid-tx              "texas medicaid", "tmhp"
 5. medicaid-fl              "florida medicaid", "statewide medicaid managed care"
 6. medicaid-oh              "ohio medicaid", "ohio department of medicaid"
 7. medicaid-il              "illinois medicaid", "hfs medicaid"
 8. medicaid-wa              "washington apple health", "apple health", "washington medicaid"
 9. medicaid-ga              "georgia medicaid", "gammis"
10. medicaid-nc              "north carolina medicaid", "nc medicaid", "nctracks"
11. medicaid-pa              "pennsylvania medicaid", "pa medicaid", "pennsylvania medical assistance", "healthchoices"
12. medicaid-mi              "michigan medicaid", "mi medicaid", "healthy michigan plan", "champs"
13. medicaid-nj              "new jersey medicaid", "nj medicaid", "nj familycare", "njmmis"
14. medicaid-az              "arizona medicaid", "az medicaid", "ahcccs", "arizona health care cost containment"
15. medicaid-in              "indiana medicaid", "healthy indiana plan", "indiana health coverage programs", "ihcp"
16. medicaid                 "medicaid", "masshealth", "chip", "state medicaid", …
17. cms-medicare-ffs         "medicare part a/b", "noridian", "palmetto gba", …
18. aetna                    "aetna"
19. uhc                      "unitedhealthcare", "optumrx", "umr", "oxford health"
20. anthem                   "anthem", "elevance"
21. cigna                    "cigna", "evernorth"
22. humana                   "humana", "centerwell"
23. hcsc                     "blue cross [and] blue shield of il/tx/mt/nm/ok", "hcsc"
24. highmark                 "highmark"
25. florida-blue             "florida blue", "guidewell", "bcbs of florida"
26. bcbsm                    "blue cross [and] blue shield of michigan", "bcbsm", "blue care network"
27. blue-shield-ca           "blue shield of california", "blue shield of ca"
28. ibx                      "independence blue cross", "independence administrators", "ibx"
29. carefirst                "carefirst", "care first"
30. bcbsnc                   "blue cross [and] blue shield of north carolina", "blue cross nc", "bcbsnc"
31. horizon                  "horizon blue cross", "horizon bcbs", "horizon healthcare services"
32. bcbst                    "blue cross [and] blue shield of tennessee", "bcbst"
33. bcbsma                   "blue cross [and] blue shield of massachusetts", "bcbs of massachusetts"
34. bcbsal                   "blue cross [and] blue shield of alabama", "bcbsal"
35. bcbssc                   "blue cross [and] blue shield of south carolina", "bcbssc"
36. arkbcbs                  "arkansas blue cross [and blue shield]", "arkansas bcbs"
37. bluekc                   "blue cross [and] blue shield of kansas city", "blue kc"
38. bcbsmn                   "blue cross [and] blue shield of minnesota", "blue cross of minnesota"
39. bcbsla                   "blue cross [and] blue shield of louisiana", "bcbsla"
40. hmsa                     "hmsa", "hawaii medical service association", "blue cross blue shield of hawaii"
41. commercial               "blue cross", "blue shield", "kaiser", "tricare"
42. unknown                  (no anchor hit)
```

Government lines of business win first so an MA or Medicaid packet never routes
to a commercial overlay on a stray brand string. **Per-state Medicaid** buckets
(2–15: `medicaid-ca` / `-ny` / `-tx` / `-fl` / `-oh` / `-il` / `-wa` / `-ga` /
`-nc` / `-pa` / `-mi` / `-nj` / `-az` / `-in`) are checked before the generic
`medicaid` bucket (16), so a named program (Medi-Cal, "Texas Medicaid", eMedNY,
"Florida Medicaid", "Ohio Medicaid", "Illinois Medicaid", "Apple Health", GAMMIS,
NCTracks, PROMISe / HealthChoices, CHAMPS / Healthy Michigan Plan, NJ FamilyCare /
NJMMIS, AHCCCS / AHCCCS Complete Care, Healthy Indiana Plan / IHCP)
routes to its overlay
while a state-agnostic Medicaid packet falls through to the generic bucket — and
the §4.5.4 Medicaid core (`R-PA-MCD-*`) keeps firing on every state bucket via
the `isMedicaid()` predicate, so the core and the per-state overlay compose on
the same packet. The hyphen in `medi-cal` is load-bearing: it prevents a false
match on the common word "medical"; the state-Medicaid buckets are also
deliberately disjoint from their same-state Blues commercial buckets
(`medicaid-fl` vs. `florida-blue`, `medicaid-il` vs. `hcsc`/BCBS-of-Illinois,
`medicaid-nc` vs. `bcbsnc`/Blue-Cross-NC, `medicaid-pa` vs.
`highmark`/`ibx`/Pennsylvania-Blues, `medicaid-mi` vs. `bcbsm`/BCBS-of-Michigan,
`medicaid-nj` vs. `horizon`/Horizon-BCBS-NJ, `medicaid-in` vs.
`anthem`/Anthem-BCBS-Indiana —
each pair unit-tested; Arizona / `medicaid-az` has no modeled same-state Blues,
so its `ahcccs` anchor needs no such disambiguation). Indiana's `medicaid-in`
also deliberately omits the bare tokens `hip` and `in medicaid` as anchors — they
would false-match "hip replacement" and "enrolled in medicaid" respectively — so
it anchors only on `indiana medicaid` / `healthy indiana plan` / `ihcp` (both edge
cases unit-tested). The
named-commercial buckets (18–40) sit above the generic `commercial` fall-through
(41) and match only *unambiguous* anchors, so independent Blues licensees that
aren't yet modeled (Premera, Regence, Wellmark, Excellus, Capital BlueCross) stay
in `commercial` rather than being misrouted. Two same-state pairs are
disambiguated purely by order: `anthem` (bucket 20) is checked before
`blue-shield-ca` (27), so "Anthem Blue Cross of California" routes to Anthem, not
Blue Shield of California; and `highmark` (24) is checked before `ibx` (28), so a
western-Pennsylvania Highmark packet never routes to the Philadelphia-region
Independence Blue Cross overlay.
Horizon's `'horizon'` bucket (31) matches only the disambiguated brand anchors
(`horizon blue cross` / `horizon bcbs` / `horizon healthcare services`), never
the bare common word `horizon`. A substring collision is handled by anchor choice
rather than order: `bcbsm` (Michigan, bucket 26) is a prefix of `bcbsma`
(Massachusetts, bucket 33), so the Massachusetts bucket anchors only on the
spelled-out plan name and the `bcbs of massachusetts` short form — never the bare
`bcbsma` acronym, which would otherwise be swallowed by Michigan. The same applies
to `bcbsmn` (Minnesota, bucket 38), which also anchors only on its spelled-out
name.
A per-packet majority vote
(`detectPacketPayer`) aggregates multi-document bundles, with ties broken by
this same order.

**Design decisions baked into the linter.** (1) *Deterministic, not
probabilistic* — the linter is a pure function of input bytes, so the same
packet always yields the same report; this is what makes a golden-fixture CI
gate possible and is the opposite of the LLM-on-top-of-rules direction the
PA-automation SaaS vendors took (spec-v52 §1.1). (2) *Self-gating overlays* —
adding a payer is additive: a new bucket plus a prefix → ledger-source map,
never an edit to an existing rule, so the 876-rule set grows without
regression risk. (3) *Procedural completeness only* — the linter never
asserts medical necessity; it checks whether the mechanically-detectable
pieces a reviewer needs are present, which keeps it on the right side of the
"not medical advice" line. (4) *OCR is an input adapter, not the substrate*
(spec-v52 §4.3.1) — a scanned PDF or image can be turned into text with
**optional, user-triggered, on-device** OCR (tesseract.js, vendored), but OCR
only does what a human typist would; the deterministic rule engine still makes
every determination. The engine is **lazy** (~9 MB, loaded only on the user's
click, so idle weight is unchanged), runs **in-worker and same-origin** (no
network, no AI service, the image never leaves the tab), and is **upstream of
the audited surface** (the golden fixtures feed the engine text directly, so
determinism is preserved). The one cost is a narrow CSP relaxation —
`script-src 'self' 'wasm-unsafe-eval'` — which permits same-origin WebAssembly
compilation and nothing else (no general `eval`, no third-party origin;
`connect-src 'self'` is unchanged).

## Deterministic logic versus LLM usage

The product uses zero LLM inference and zero AI *service* of any kind. All
operations are deterministic functions over public datasets and published
formulas. There is no model in the loop, no embedding, no inference call, no API
key, and no network call to any AI vendor. If a future sibling project explores
AI-driven workflows, it will be a separate, clearly labeled product.
sophiewell.com itself never calls a language model.

The one nuance is the `pa-lint` tile's **optional, on-device OCR**
(spec-v52 §4.3.1): tesseract.js is a local, offline, deterministic
text-extraction kernel — not an LLM and not a cloud-AI vendor (the
`check-commitments.mjs` "no AI" deny-list targets OpenAI/Anthropic/onnxruntime/…,
none of which appears here). It runs entirely in the browser tab, fetches
nothing off-origin, and only converts a scan's pixels into the text a human
would otherwise type. It is an input adapter to the deterministic engine, not a
decision-maker — so the "deterministic, not probabilistic" posture is intact.

## Stability commitments

The site is stable and predictable by design. These commitments are hard
rules, not soft preferences.

- **No A/B testing, ever.** Every user sees the same version of every
  utility. A clinician who used a calculator on Monday and got one result,
  then got a slightly different result on Tuesday because they were in a
  treatment group, would correctly stop trusting the site.
- **No feature flags visible to users.** No "experimental" toggle, no
  "beta" feature. If something is on the site, it is for everyone.
- **No tracking.** No analytics script, no tracking pixel, no heatmap, no
  session replay, no error reporter, no third-party telemetry. The CSP
  enforces this with `connect-src 'self'`. The site never logs user-agent
  strings or IP addresses.
- **No notifications, no email capture.** The site never asks for an
  email address, never displays a notification permission request, never
  shows a "Sign up for updates" form. There is no newsletter and no
  account system, because there are no accounts.
- **Versioned releases.** Every release is tagged with a semantic version
  and described in [CHANGELOG.md](CHANGELOG.md), linked from the footer.

## CLI reference

| Command                  | Description                                                       |
|--------------------------|-------------------------------------------------------------------|
| `npm run dev`            | Serve the directory locally on http://localhost:4173 (set `SERVE_ROOT=dist` to preview the pre-rendered hubs/topics/tool pages as production serves them) |
| `npm run build`          | Copy static files into `dist/` for deployment                     |
| `npm test`               | Run the full test suite (unit, a11y, grep, data integrity)        |
| `npm run test:unit`      | Run Node's built-in unit tests (4,332 tests)                      |
| `npm run test:e2e`       | Build `dist/`, then run Playwright integration tests against real browsers — incl. a full-catalog 320px no-horizontal-scroll sweep over both the SPA routes and the 492 pre-rendered static tool pages, the hub/topic/commitments pages, and the citation-wrap pin |
| `npm run test:a11y`      | Run accessibility checks on every utility view                    |
| `npm run lint`           | ESLint + the CI gate chain: grep-check, output-safety, citation-integrity, catalog-truth, commitments, PA staleness, PA audit |
| `npm run data:refresh`   | Re-fetch and re-shard every public dataset                        |
| `npm run data:verify`    | Verify shard SHA-256 hashes against the manifests                 |
| `npm run sbom`           | Regenerate the CycloneDX SBOM (`sbom.json`, `sbom.md`)            |
| `npm run release:check`  | One-shot pre-release gate: lint + test + sbom + build             |
| `npm run clean`          | Remove `dist/` and other build artifacts                          |

## Safety guarantees

- The application makes no outbound network requests at runtime. This is
  the hard guarantee: the CSP `connect-src 'self'` directive means user
  input physically cannot leave the device, so nothing below is a privacy
  trade-off, only a convenience-vs-clean-slate choice that stays on-device.
- The application is read-only with respect to all bundled data.
- By default the application writes nothing to `localStorage`,
  `sessionStorage`, cookies, or IndexedDB. A fresh visit leaves all four
  empty, which the integration test suite asserts (`smoke.spec.js`).
- Exactly two **opt-in** features may write to `localStorage`, and only to
  an allowlisted set of **string-literal** keys enforced by
  `scripts/check-commitments.mjs` against `scripts/storage-allowlist.json`
  (spec-v50 §3.4) and re-verified at runtime by `no-network.spec.js`:
  - the light/dark **theme** preference (`sw-theme`), written only when the
    user toggles the theme; and
  - the spec-v61 **"Remember my inputs on this device"** toggle
    (`sw-remember`, `sw-saved-inputs`), off by default. When enabled it
    stores **numeric/choice inputs only** (`number`/`range`/`checkbox`/
    `radio` and `<select>`); free-text (`type=text`/`search`) and
    `<textarea>` are never persisted, so a name, allergy, or clinical note
    cannot reach storage. Unchecking the toggle erases both keys.
- There are no cookies, no `sessionStorage`, and no IndexedDB at any time;
  the service worker's Cache Storage holds only the site's own static
  shell files, keyed to the build hash.
- Clinical input is processed in memory and (unless the opt-in toggle is on)
  discarded when the page is closed.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, and the
  `Function` constructor are banned by the ESLint config and a grep
  check; the `el()` DOM helper throws on any attempt to set raw HTML.
- A CycloneDX SBOM (`sbom.json`, `sbom.md`) is regenerated on every
  build and ships with the site, hashing every runtime asset and source
  module with SHA-256 plus a per-build buildId.

## Limitations

- The Field Medicine layer reproduces only the *numeric facts* (drug
  doses, intervals, energy levels, weight ranges) from AHA ACLS/PALS/BLS
  guidelines, with attribution to the AHA guideline edition. AHA
  algorithm flowcharts are *not* reproduced. The Broselow-Luten
  color-band system is *not* bundled (licensed by Vital Signs); the
  pediatric dose calculator works in straight kilograms instead. See
  [docs/field-medicine-citations.md](docs/field-medicine-citations.md).
- Static code indexes (ICD-10-CM, HCPCS, CPT, NDC, POS, modifier,
  revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS, RxNorm,
  NDC↔RxNorm) and reference tables (adult / pediatric lab ranges,
  TDM, tox levels, ISMP high-alert wallet, AHA CPR wallet card,
  NIOSH Pocket Guide, DOT ERG, AGS Beers Criteria, ASA Physical
  Status, Mallampati, Modified Rankin) were retired in spec-v29
  wave 29-2 — Sophie's edge is computation, not indexing. Use your
  EHR, the upstream source, or your institutional protocol.
- The Appointment Prep Question Generator uses deterministic keyword
  matching against a hand-curated bank, not language understanding.
- The site is not medical, legal, or financial advice. It does not
  replace clinician judgment, institutional protocols, professional
  billing review, or legal counsel.
- Clinical calculators are math aids only. Institutional protocols
  govern any clinical decision. Field-medicine utilities additionally
  defer to local protocols and online medical direction.
## Security

Vulnerability reports: see [SECURITY.md](SECURITY.md) for the private
disclosure channel and the threat model summary. The CSP, security
headers, and supply-chain posture (pinned dev deps, SBOM on every
build, integrity-verified data shards) are documented in
[docs/threat-model.md](docs/threat-model.md).

## Documentation

- [docs/spec-v10.md](docs/spec-v10.md) — current positioning spec:
  clinical-first audience, runtime-dependency budget, permanent
  out-of-scope list
- [docs/spec-v11.md](docs/spec-v11.md) — correctness-floor spec:
  per-tile audit protocol, specialty-named groups, optional
  source-quoted `interpretation` field. Audit coverage is **complete
  — 492/492 tiles** carry a committed per-tile audit log
  (`docs/audits/v11/<id>.md` for the pre-v78 catalog;
  `docs/audits/v12/<id>.md` for the tiles added since — the
  spec-v78–v83 billing & coding program, the spec-v85
  advanced-clinical-calculators program (v86–v99), and the
  spec-v100 MDCalc parity-completion program (v101–v107))
  (`node scripts/audit-coverage.mjs`)
- [docs/scope-mdcalc-parity.md](docs/scope-mdcalc-parity.md) —
  long-horizon scope: every actionable clinical calculator a
  healthcare worker would otherwise reach for MDCalc to find,
  shipped slowly at the v11 quality bar
- [docs/spec-v52.md](docs/spec-v52.md) — the `pa-lint` prior-auth packet
  linter: pipeline, the 876-rule ruleset, payer overlays (Aetna +
  UnitedHealthcare + Anthem + Cigna + Humana + HCSC + Highmark + Florida Blue +
  BCBSM + Blue Shield of California + Independence Blue Cross + CareFirst +
  Blue Cross NC + Horizon + BCBS Tennessee + BCBS Massachusetts + BCBS Alabama +
  BCBS South Carolina + Arkansas BCBS + BCBS Kansas City + BCBS Minnesota +
  BCBS Louisiana + HMSA, plus per-state Medicaid overlays for California /
  New York / Texas / Florida / Ohio / Illinois / Washington / Georgia / North
  Carolina / Pennsylvania / Michigan / New Jersey / Arizona / Indiana), the CMS
  Hospital OPD prior-authorization membership test (§4.5.2.1, the first real
  bundled PA-list rule), the optional on-device OCR path (§4.3.1, vendored
  tesseract.js),
  and the byte-determinism / golden-fixture guarantee
- [docs/architecture.md](docs/architecture.md) — runtime architecture,
  data flow, no-backend rationale
- [docs/data-sources.md](docs/data-sources.md) — every bundled dataset
  with canonical URL and refresh cadence
- [docs/clinical-citations.md](docs/clinical-citations.md) — every
  formula and scoring system with citations
- [docs/citation-staleness.md](docs/citation-staleness.md) — the spec-v54
  staleness ledger: every guideline tile's shipped vs latest edition,
  accessed date, and justification when deliberately behind
- [docs/field-medicine-citations.md](docs/field-medicine-citations.md) —
  Group I citations, including AHA non-derivation posture
- [docs/legal.md](docs/legal.md) — data sourcing posture, AMA CPT
  handling, attributions
- [docs/accessibility.md](docs/accessibility.md) — WCAG 2.2 AA checklist
- [docs/threat-model.md](docs/threat-model.md) — threats considered and
  the controls that mitigate each
- [docs/stability.md](docs/stability.md) — full stability policy
- [docs/performance.md](docs/performance.md) — performance budget and
  measurement methodology
- [docs/operations.md](docs/operations.md) — data refresh workflow,
  manifest format, integrity verification
- [docs/release.md](docs/release.md) — Cloudflare Pages release runbook
- [docs/deployment.md](docs/deployment.md) — deployment configuration
- [CHANGELOG.md](CHANGELOG.md) — every release with date, version, and
  user-visible changes
- [SECURITY.md](SECURITY.md) — vulnerability disclosure policy



