# spec-v100.md — MDCalc Parity Completion: program charter for the calculator catalog's largest expansion

> Status: **PROPOSED (2026-06-17).** Charter spec — **zero tiles of its own.**
> v100 is the umbrella for the project's largest single program: a **forty-eight-spec
> expansion** ([spec-v101](spec-v101.md) through [spec-v148](spec-v148.md)) that closes
> the remaining gap between this catalog and the *actionable subset* of MDCalc's
> calculator surface, then surpasses it. It adds **no tile** by itself; it defines why
> the program exists (§1), re-binds the [spec-v85](spec-v85.md) §2 doctrine and §6
> CI/CD contract that every feature tile already obeys (§2), the home groups (§3 — no
> new group), the roster (§4, detailed in [spec-v100-roster.md](spec-v100-roster.md)),
> the data strategy (§5), the maintenance contract (§6), the **deepening sub-program**
> (§7), the **permanent-exclusion governance list** (§8), and the program-wide
> acceptance criteria (§10).
>
> The program runs in **eight waves**, each a clinical super-domain, each
> independently shippable:
> - **Wave 1 — Cardiology / EP / vascular / lipids** ([v101](spec-v101.md)–[v105](spec-v105.md)): **+26**, 432 → 458.
> - **Wave 2 — Emergency / trauma / toxicology / environmental** ([v106](spec-v106.md)–[v111](spec-v111.md)): **+30**, 458 → 488.
> - **Wave 3 — Critical care & pulmonary** ([v112](spec-v112.md)–[v116](spec-v116.md)): **+19**, 488 → 507.
> - **Wave 4 — Neurology / neurosurgery / psychiatry** ([v117](spec-v117.md)–[v123](spec-v123.md)): **+32**, 507 → 539.
> - **Wave 5 — GI / hepatology / nephrology / acid-base / urology** ([v124](spec-v124.md)–[v131](spec-v131.md)): **+44**, 539 → 583.
> - **Wave 6 — Heme / onc / endocrine / ID** ([v132](spec-v132.md)–[v137](spec-v137.md)): **+30**, 583 → 613.
> - **Wave 7 — OB/GYN / pediatrics / neonatal** ([v138](spec-v138.md)–[v141](spec-v141.md)): **+24**, 613 → 637.
> - **Wave 8 — Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy** ([v142](spec-v142.md)–[v148](spec-v148.md)): **+42**, 637 → 679.
>
> Catalog effect at v100 close: **432 tiles, unchanged.** The program as a whole
> ([v101–v148](spec-v148.md)) takes the catalog **432 → 679 (+247).**
>
> Every prior spec (v4 through v99) remains in force. No runtime network call, no AI,
> no ETL — the [spec-v29](spec-v29.md) §3 one-line test and the [spec-v59](spec-v59.md)
> output-safety contract govern every tile added here. This program advances, and is
> bounded by, the [MDCalc-parity scope statement](scope-mdcalc-parity.md): it is the
> actionable subset of clinical calculators that meet the four scope rules (actionable,
> cited, deterministic, in-audience), with the **permanent-exclusion list (§8)** giving
> the licensing rule operational teeth for the first time.

## 1. Why this program exists

The [spec-v85](spec-v85.md) program (closed at 432 tiles) deepened the advanced
clinical surface — toxicology, hemodynamics, oncology prognosis, ECG, PFTs, dialysis,
the subspecialty scales. With it done, the [project memory](spec-v62.md) recorded the
honest state: *"NO PROPOSED spec remains past v99 — a future session must AUTHOR a NEW
program (fresh scope-mdcalc-parity gap analysis, dump ALL groups A–P first)."* v100 is
that program.

It was authored from a **fresh, eight-domain MDCalc gap sweep**. Eight specialist
research passes (cardiology/EP/vascular, emergency/trauma/tox, critical-care/pulmonary,
neurology/psychiatry, GI/hepatology/nephrology/urology, heme/onc/endocrine/ID,
OB-GYN/pediatrics/neonatal, surgery/anesthesia/ortho/rheum/geriatrics/pharmacy) each
enumerated the standard calculators in its field and cross-referenced them, **by
concept rather than by name**, against all 432 live tiles. The survivors — roughly 247
deterministic, citable, in-audience instruments genuinely absent from the catalog — are
the roster (§4). The sweep also produced two artifacts the catalog did not previously
have in writing: a **deepening backlog** (§7) of existing tiles worth extending, and a
**permanent-exclusion governance list** (§8) of the copyrighted, licensed, and
non-deterministic instruments MDCalc hosts that this catalog will *deliberately never*
ship, with the reason recorded for each.

### What "surpass MDCalc" means here, stated plainly

The goal ([scope §1](scope-mdcalc-parity.md)) is not to match a count; it is to be the
**most complete free, ad-free, login-less, deterministic, cited** calculator catalog a
US healthcare worker can reach. MDCalc carries instruments this catalog will not (the
§8 licensed and gestalt tools). After this program, the catalog carries the *actionable
deterministic subset MDCalc has* plus the billing/coding/regulatory surface MDCalc
lacks. At **679 tiles** it is, on the actionable-and-free axis, the larger catalog —
which is the only axis the [reciprocal commitment](scope-mdcalc-parity.md#7) cares about.

This is the same audience the catalog already serves: the nurse running NEWS2 and the
drip-rate tool on the same shift the resident runs HEART and the intensivist runs SOFA.
The [nurse-first intent](spec-v62.md) governs what we *deepen*; it has never meant
excluding the physician-facing calculators that sit on the same workflow. Every tile
here passes the same determinism bar as a creatinine-clearance calculator.

## 2. Doctrine — re-bound from spec-v85 §2 (binding on every v101–v148 tile)

This program does **not** restate the suite doctrine; it **re-binds it.** Every clause
of [spec-v85 §2](spec-v85.md) applies verbatim to every tile in v101–v148:

1. **One-line test** ([spec-v29](spec-v29.md) §3) — inputs in, a deterministic
   number/band/decision out; works offline; no AI, no network, no server.
2. **Input-driven, never a browsable index.** A lab, a pressure, a fracture finding, a
   biometry value, a joint count is an **input**; the program ships **no new bundled
   dataset** (§5).
3. **Output-safety contract** ([spec-v59](spec-v59.md)) — no `NaN`/`Infinity`/
   `Invalid Date`/silently-wrong number; every compute joins
   [`fuzz-tools.test.js`](../test/unit/fuzz-tools.test.js); √/ln/atan2/exp/division
   guard their domains. This program adds many logistic models (Gupta-style
   `1/(1+e^-x)`), log-ratio indices (FIB-4-style), and LMS z-score transforms (CDC/WHO
   growth) — each is overflow-guarded and returns a surfaced `valid:false` fallback,
   never a probability from `NaN`.
4. **Primary published sources only** ([spec-v48](spec-v48.md)/[spec-v54](spec-v54.md)/
   [spec-v61](spec-v61.md)) — inline `Citation` naming the derivation paper/guideline,
   `citationUrl` (DOI-preferred), `accessed` date; **Class B** revisable thresholds get
   a [`docs/citation-staleness.md`](citation-staleness.md) row (§6.3).
5. **Quote the source's interpretation; never author treatment advice in Sophie's
   voice** ([spec-v11](spec-v11.md) §5.3). Dosing tiles (`nac-dosing`, `hiet-dosing`,
   `digifab-dosing`, `opioid-conversion`, the warfarin nomograms) add the high-stakes
   note: *confirm against your institutional protocol and a second check.*
6. **The spec-v11 audit floor** — ≥3 boundary worked examples (incl. band-flips), a
   cross-implementation differential within 0.5% (continuous) or one category
   (ordinal), reviewed edge-input handling, a [spec-v11](spec-v11.md) audit log in
   [`docs/audits/v12/`](audits/v12); the `META` example renders verbatim and is pinned
   by the `example-correctness` sweep.
7. **Mobile-first, single-thumb** ([spec-v72](spec-v72.md)) — 44px targets, no
   horizontal scroll at 320px, numeric keypad inputs, top-to-bottom `<dl>` derivation.

### One doctrine clarification this program makes explicit

Several waves add **classification tiles** (Gustilo-Anderson, Garden, Weber, Schatzker,
Salter-Harris, Neer, Gleason Grade Group, West Haven, AAST organ-injury, the ACR/EULAR
classification criteria). These are **decision rules, not reference tables**: the
clinician inputs the findings (fracture geometry, biopsy pattern, criteria met) and the
tile computes the resulting class **and renders the source's management-relevant
interpretation for that class**. They pass the [spec-v29](spec-v29.md) §3 one-line test
(consume input, produce computed output) exactly as `kdigo-aki` and `asa-ps` do. A tile
that only *displays* the class definitions with no input is the prohibited reference
table and is **not** in this roster.

## 3. Home groups — no new group

Like [spec-v85](spec-v85.md), this program **creates no new group.** Every tile is a
member of a family the catalog already curates and cross-links its near-neighbors:

| Wave / family | Specs | Home group(s) | Sits beside |
|---|---|---|---|
| Cardiology / EP / vascular / lipids | v101–v105 | `G`, `E` | `chads`, `qtc-suite`, `ascvd`/`prevent`, `lvh-criteria`, `aortic-valve-area` |
| Emergency / trauma / tox / environmental | v106–v111 | `G`, `E`, `F`, `I` | `heart`, `wells-pe`, `iss-rts`, `abc-mtp`, `acetaminophen-nomogram` (F), `hypothermia-rewarm` (I) |
| Critical care & pulmonary | v112–v116 | `G`, `E` | `qsofa-sofa`, `apache2`, `hemodynamic-suite`, `gold-spirometry`, `stop-bang` |
| Neurology / neurosurgery / psychiatry | v117–v123 | `G`, `E` | `nihss`, `ich-score`, `hunt-hess-wfns`, `abcd2`, `phq9`, `cssrs` |
| GI / hep / nephro / acid-base / urology | v124–v131 | `G`, `E` | `meld-childpugh`, `fib4`, `egfr-suite`, `anion-gap-dd`, `stone-score` |
| Heme / onc / endocrine / ID | v132–v137 | `G`, `E`, `F` | `four-ts`, `khorana`, `ipss-r-mds`, `eag-a1c`, `curb-65`, `heparin-nomogram` (F) |
| OB/GYN / pediatrics / neonatal | v138–v141 | `E`, `G`, `N` | `due-date`, `bishop`, `bhutani-bilirubin` (N), `pews`, `peds-weight-conv` (N) |
| Surgery / anes / ortho / rheum / geri / pharm | v142–v148 | `G`, `F`, `E` | `rcri`, `ariscat`, `das28`, `charlson`, `opioid-mme` (F), `corrected-phenytoin` (E) |

Each feature spec states its group per tile and moves on; no existing tile changes
group, and the home/topic-hub group cards are unchanged. (Pediatric tiles are placed in
`N` Pediatrics & Neonatal where the catalog already homes peds tiles, or `G`/`E` where
the score is age-agnostic; each feature spec is explicit.)

## 4. The roster (what each feature spec ships)

The complete per-tile roster — id, name, one-line computation, primary citation, and
Class A/B — lives in **[spec-v100-roster.md](spec-v100-roster.md)**, the working source
of truth backing this charter. Each feature spec (v101+) carries the full per-tile
detail (citation, `citationUrl`, group, specialties, inputs, outputs, robustness) in
the [spec-v99](spec-v99.md) format. The wave/spec map:

| Spec | Theme | Δ | Running total |
|---|---|---|---|
| **v101** | AF, stroke-risk & QT | +5 | 437 |
| **v102** | Heart failure & cardiogenic shock | +5 | 442 |
| **v103** | CV risk & prevention engines | +6 | 448 |
| **v104** | ECG arrhythmia, aortic & syncope | +6 | 454 |
| **v105** | Vascular & cardiac surgery | +4 | 458 |
| **v106** | VTE workup algorithms | +6 | 464 |
| **v107** | ED decision rules & resuscitation | +4 | 468 |
| **v108** | Trauma severity scores | +6 | 474 |
| **v109** | Trauma classification & soft-tissue infection | +5 | 479 |
| **v110** | Toxicology dosing & dialysis decisions | +5 | 484 |
| **v111** | Environmental & wilderness medicine | +4 | 488 |
| **v112** | ICU mortality & sepsis-coagulopathy | +5 | 493 |
| **v113** | Dynamic fluid-responsiveness indices | +3 | 496 |
| **v114** | COPD/bronchiectasis exacerbation & sleep | +6 | 502 |
| **v115** | Pulmonary nodule, PH & pleural infection | +5 | 507 |
| **v116** | *(reserved — folded into v114/v115)* | +0 | 507 |
| **v117** | Stroke imaging & thrombolysis prognosis | +6 | 513 |
| **v118** | Hemorrhagic stroke, SAH, IVH & aneurysm | +5 | 518 |
| **v119** | Prehospital LVO severity & cerebrovascular dx | +4 | 522 |
| **v120** | Epilepsy, headache & vertigo | +5 | 527 |
| **v121** | Neuromuscular: GBS & myasthenia | +4 | 531 |
| **v122** | General neurology & rehab | +3 | 534 |
| **v123** | Psychiatry (public-domain instruments) | +5 | 539 |
| **v124** | Hepatology function & fibrosis | +6 | 545 |
| **v125** | Hepatology severity & encephalopathy | +5 | 550 |
| **v126** | GI disease activity & severity | +6 | 556 |
| **v127** | Nephrology prognosis & AKI staging | +4 | 560 |
| **v128** | Renal excretion & dialysis math | +5 | 565 |
| **v129** | Acid-base compensation & gaps | +6 | 571 |
| **v130** | Urology: prostate metrics & risk | +6 | 577 |
| **v131** | Urology: renal mass, stones, torsion | +6 | 583 |
| **v132** | Thrombotic microangiopathy & coagulopathy | +5 | 588 |
| **v133** | Warfarin dosing & pharmacogenomics | +4 | 592 |
| **v134** | Plasma-cell & myeloid neoplasm staging | +6 | 598 |
| **v135** | Lymphoma prognostic indices | +5 | 603 |
| **v136** | Endocrine & metabolic indices | +5 | 608 |
| **v137** | Infectious-disease scores | +5 | 613 |
| **v138** | Obstetrics & MFM | +6 | 619 |
| **v139** | Gynecology | +6 | 625 |
| **v140** | Pediatric & neonatal severity | +6 | 631 |
| **v141** | Pediatric growth & dosing | +6 | 637 |
| **v142** | Surgical & anesthetic risk | +6 | 643 |
| **v143** | Frailty & geriatric-oncology screening | +5 | 648 |
| **v144** | Orthopedic fracture classification | +6 | 654 |
| **v145** | Orthopedic risk & osteoarthritis | +5 | 659 |
| **v146** | Spinal tumor & trauma classification | +5 | 664 |
| **v147** | Rheumatology activity & classification | +7 | 671 |
| **v148** | Rheum (vasculitis/SpA), palliative & pharmacy | +8 | 679 |

**Program total: +247 tiles, 432 → 679.** v116 is reserved as a spare slot (the sleep
and pleural/nodule tiles fit cleanly into v114/v115); keeping the number reserved avoids
a renumber if a wave-3 tile is later split out. Each spec is independently shippable and
independently reviewable; they may land in any order, and the program is valuable even
if only a few ship. Each feature spec re-states its own running catalog count in its
acceptance criteria; the running totals above assume numeric order. **If specs land out
of order, the implementing spec uses the then-current `UTILITIES.length` plus its own
delta, and the catalog-truth gate (§6) enforces agreement** — exactly the rule
[spec-v85 §4](spec-v85.md) set.

### Collision audit (done at charter time)

All 247 ids were checked against the live catalog and against each other. Three
renames resolve concept-clashes with existing tiles: **`padua-renal`** (renal-mass
PADUA, vs existing `padua` VTE), **`mayo-adhesive`** (Mayo Adhesive Probability, vs
existing `map` MAP), and the split **`mangled-extremity`** (MESS extremity score) /
**`mess-first-seizure`** (MESS seizure-recurrence rule). Each implementing spec re-runs
the [spec-v85 §6.2](spec-v85.md) collision check before shipping, because the catalog
grows under it.

### Deliberate non-duplication with what exists

The program **extends**, never shadows, the existing clusters. Representative pairings:
`chads2`/`cha2ds2-va` are the predecessor and 2024-ESC successor of the existing `chads`
(all cross-linked so the migration is visible in one place); `albi-grade`/`meld-xi` join
`meld-childpugh` as objective liver-function companions; the acid-base compensation
trio (v129) completes the disorder set `winters` opened; `aspects`/`ich-volume-abc2`
feed the inputs the existing `ich-score`/`nihss` consume; `eos-calculator` is the
neonatal-sepsis companion to the febrile-infant rules already shipped; the rheumatology
activity suite (`cdai-ra`/`sdai-ra`) joins the existing `das28`. None re-implements an
existing tile; each feature spec lists its near-neighbors and what makes it distinct.

## 5. Data strategy (the bundle stays light)

Per doctrine clause 2, **this program bundles no new `data/` dataset.** Every value a
tile needs is either a user input or a **small set of published constants compiled into
the compute module**, exactly as [spec-v85 §5](spec-v85.md) established. Most constant
sets are tiny (point weights, threshold tables, logistic coefficients). A handful are
larger published constant tables and are still **compiled constants the compute reads,
not a browsable index and not a `data/` directory**:

- **CDC 2000 and WHO 2006 growth LMS tables** (`peds-bmi-percentile`, `who-growth-zscore`,
  v141) — the L/M/S coefficients by age/sex, sourced from the published CDC/WHO growth
  references, compiled like the [GLI-2012 spirometry constants](../lib/gli-2012-data.js)
  the v91 `predicted-spirometry` tile already ships.
- **SCORE2 / SCORE2-OP risk-region coefficient tables** (v103), **IWPC / Gage warfarin
  pharmacogenetic coefficients** (v133), **EuroSCORE II coefficients** (v105), and the
  **logistic coefficient sets** for `gupta`-style models (MAGGIC, GWTG-HF, fullPIERS,
  EOS, ISARIC-4C, COVID-GRAM) — each a fixed published constant block.

Each is dated and, where the source revises on a calendar (the ESC region tables, the
AAP/CDC references), ledger-tracked per §6.3. No `data/` directory is added or modified
by this program. The single new compiled-constants module the LMS tiles need
(`lib/growth-lms-data.js`, analogous to `lib/gli-2012-data.js`) is authored by whichever
v141 implementation lands, sourced verbatim from the CDC/WHO published tables.

## 6. Build & maintenance: the CI/CD contract

This program **re-binds the [spec-v85 §6](spec-v85.md) contract in full** — the build
pipeline (§6.1), the merge gates (§6.2), the maintenance classes and staleness
machinery (§6.3), and the guideline-update workflow (§6.4). Nothing here changes; this
section records only what is program-specific.

- **Build (§6.1).** A tile is a `lib/<module>.js` compute + a `views/group-vNN.js`
  renderer + an `app.js` `UTILITIES` row + a `lib/meta.js` `META` entry. `npm run build`
  needs no per-tile configuration. **Renderer-module numbering continues the `group-vNN`
  sequence** past the v85 program's last (`group-v25`); each feature spec claims its own
  `group-vNN` module and adds its `RVNN` export to the `app.js` `RENDERERS` spread.
- **Gates (§6.2).** Every new `lib/<module>.js` joins `fuzz-tools.test.js` `MODULES`
  (zero non-finite leaks; the logistic/LMS/log-ratio math explicitly fuzzed for
  overflow). The catalog count moves on **all 13 catalog-truth surfaces** in the same
  change. a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for the new renderer.
- **Maintenance classes (§6.3).** Class A (fixed formula/coefficient) → **no** staleness
  row. Class B (revisable guideline threshold) → a [`docs/citation-staleness.md`](citation-staleness.md)
  row naming the edition in force, the `accessed` date, and a review cadence, monitored
  by the existing [`scripts/check-citation-cadence.mjs`](../scripts/check-citation-cadence.mjs)
  warn-job. The program's Class B tiles are flagged in the roster (§4 /
  [roster](spec-v100-roster.md)); representative ones: `cha2ds2-va`/`chads-65` (ESC/CCS),
  `score2`/`score2-op`/`hfa-peff` (ESC), `wifi`/`rutherford-fontaine` (SVS),
  `aspects` (imaging-read), `modified-marshall` (Revised Atlanta), `metabolic-syndrome`
  (ATP III/IDF), `rotterdam-pcos` (ESHRE/ASRM), `roma-ovarian` (cutoff), `afi`/`iom-gwg`
  (ACOG/IOM), `weber-ankle` (book source), `fleischner-2017` (Fleischner),
  `ahi-odi-severity` (AASM), `lithium-extrip` (EXTRIP), `denver-bcvi`/`aast-organ-injury`
  (society), `szpilman-drowning`. **Watch the `ISSUER_PATTERN` gotcha** ([spec-v92](spec-v92.md)/
  [spec-v94](spec-v94.md) lesson): a citation that names a society acronym (ACC/AHA, ESC,
  KDIGO, NICE, AASM, SVS, FIGO, ACR/EULAR) trips `check-citations.mjs` and **requires** a
  staleness row even for a Class-A formula — phrase Class-A citations to name the
  journal/authors, not the issuing society, when the math is fixed.

The **definition of done** is unchanged from [spec-v85 §6.2](spec-v85.md): all gates
green, the spec-v11 audit log present, the `META` example pinned, the count bumped on all
catalog-truth surfaces in the same change.

## 7. The deepening sub-program (no new tiles)

The gap sweep surfaced a backlog of **existing** tiles worth extending. These are
**deepenings, not new tiles** — they add a mode, a band, a companion output, or a
cross-link to a tile that already ships, and they carry **no catalog-count change.**
They may land interleaved with the feature specs or as their own small specs; each obeys
the [spec-v11](spec-v11.md) audit floor for the changed surface. The backlog (full list
in [roster §"Deepening"](spec-v100-roster.md)):

- `chads` → annual-stroke-rate table + cross-link the new `chads2`/`cha2ds2-va` so the
  CHADS₂ → VASc → 2024-VA migration reads in one place.
- `qtc-suite` → Rautaharju correction + QTc>500 ms / ΔQTc>60 ms flags (feeds `tisdale-qtc`).
- `aortic-valve-area` → dimensionless index (DVI) + low-flow/low-gradient AS flag.
- `ascvd`/`prevent` → ACC/AHA statin-benefit risk-band layer + CAC-modifier nudge (ties
  to the new `mesa-chd`).
- `lvh-criteria` → Cornell product + Romhilt-Estes point score.
- `wells-pe-geneva` → simplified Revised Geneva mode (1 point per item).
- `naloxone` → maintenance-infusion two-thirds rule.
- `fena-feurea` → FE-phosphate / FE-magnesium modes (or the v128 siblings share this math).
- `anion-gap-dd` → delta ratio + expected-compensation cross-check, linking the v129 trio.
- `ktv-urr` → stdKt/V + nPCR outputs (or the v128 siblings).
- `osmolal-gap` → ethanol-input mode + urine-osmolal-gap mode.
- `meld-childpugh` → ALBI grade + MELD-XI surfaced alongside Child-Pugh.
- `mentzer` → sibling discrimination indices (Green-King, Shine-Lal, England-Fraser, RDWI).
- `ldl-calc` → non-HDL + remnant cholesterol outputs.
- `das28` → CDAI/SDAI suite linkage (v147).
- `corrected-phenytoin` → `valproate-correction` companion (v148) + ESRD phenytoin variant.
- `charlson`/`cfs` → frailty/comorbidity panel (mFI-5/mFI-11/FRAIL/VES-13/G8, v143).
- `ecog-karnofsky` → wire Karnofsky into the PPI/PaP palliative cluster (v148).
- `ich-score` → inline ABC/2 volume sub-calc + Graeb/IVH linkage (v117/v118).
- `abcd2` → ABCD3-I extension.
- `gold-spirometry` → GOLD 2024 ABE group axis (mMRC-only; CAT is copyrighted, §8).
- `vent-sbt-peep`/`rsbi` → cuff-leak test + NIF/MIP weaning thresholds.
- `ecmo-titration` → RESP (VV) + SAVE (VA) survival scores.
- `due-date`/`preg-dating` → ACOG redating precedence + best-EDD reconciler.
- `neo-phototherapy`/`bhutani-bilirubin` → AAP 2022 exchange thresholds + B/A ratio.
- `stone-score` → cross-link ROKS + S.T.O.N.E./Guy's PCNL complexity (v131).

## 8. Permanent-exclusion governance list

[scope-mdcalc-parity §4](scope-mdcalc-parity.md) excludes copyrighted, single-center,
sponsored, and non-deterministic instruments. This section gives that rule **operational
teeth**: it names the instruments MDCalc hosts that this catalog **deliberately will
not** ship, and why, so no future session re-proposes one. A feature spec that wants to
ship something on this list must first amend §8 with a documented licensing clearance.

- **Cognition (copyrighted):** MoCA, MMSE, SLUMS, CDR, AD8, FAST/GDS-Reisberg, IQCODE,
  Cornell CSDD. (`mini-cog`, public-domain, already ships.)
- **Movement / MS (license-gated):** MDS-UPDRS (the MDS *prohibits electronic
  implementation* — highest risk), EDSS/Neurostatus, QMG (Mapi), ASIA/ISNCSCI (CC
  BY-NC-ND — the ND clause forbids an interactive derivative).
- **Headache / pain (licensed):** HIT-6, DN4, LANSS, Oswestry ODI, Neck Disability Index.
- **Psychiatry (copyrighted/licensed):** BDI/BDI-II (Pearson), QIDS, LSAS, PANSS (MHS),
  Conners (MHS), ASRS (WHO), EAT-26, CRAFFT, ISI (Mapi), PSQI (no-modification),
  Zung, YMRS. (Public-domain psychiatry instruments — AIMS, BFCRS, BARS, SCOFF, CES-D —
  are *included* in v123.)
- **Pulmonary / sleep (copyrighted):** CAT, ACT, SGRQ, SNOT-22, St George's. (The GOLD
  ABE deepening uses mMRC, which is free.)
- **Bone (licensed coefficients):** FRAX (Sheffield — undisclosed country coefficients),
  Tyrer-Cuzick/IBIS. (OST/ORAI, the free DXA pre-screens, are *included* in v136; the
  public-domain NCI Gail/BCRAT is *included* in v141.)
- **Oncology (proprietary/copyright):** Oncotype DX, MammaPrint, Magee equations,
  RECIST/iRECIST, ACR TI-RADS, Lung-RADS, CTCAE (embeds licensed MedDRA terms).
- **Endocrine:** HOMA2 (Oxford nonlinear model — HOMA-IR/QUICKI, the free linear forms,
  are *included* in v136), FINDRISC (ADA-form), Martin-Hopkins LDL (patented table).
- **Geriatrics / palliative (licensed):** Palliative Performance Scale (Victoria
  Hospice), MNA/MNA-SF (Nestlé), Edmonton Frail Scale, Opioid Risk Tool, SOAPP-R, COMM,
  ACB/ARS anticholinergic scales, Comprehensive Complication Index (CCI®).
- **Surgery / ICU (proprietary):** ACS-NSQIP Surgical Risk Calculator (unpublished
  coefficients — mFI-5/mFI-11 in v143 are the free surrogates), APACHE III/IV (Cerner),
  MPM-III.
- **Urology / GI (licensed):** IPSS/AUA-SI question text, IIEF/SHIM, FibroTest/FibroSure,
  ELF, FibroScan/elastography, KDPI/KDRI (annual OPTN scaling → live-feed, [spec-v5](spec-v5.md)
  §2 violation).
- **OB (paywalled/assay):** Grobman MFMU VBAC (paywalled coefficients — the free Flamm
  score is *included* in v139), IOTA ADNEX (recalibrated, non-reproduced coefficients —
  the free IOTA Simple Rules is *included*), QUiPP, Broselow (the free APLS weight
  formula is *included* in v141), sFlt-1/PlGF (assay echo, not a calculator).
- **Non-deterministic (not a calculator):** methadone conversion (ratio varies up to
  100-fold), buprenorphine conversion (partial-agonist ceiling), corticosteroid taper
  (no consensus algorithm), STOPP/START (190-criterion checklist, no aggregate score),
  the Surprise Question (gestalt), SCAI cardiogenic-shock stages A–E (gestalt staging —
  the deterministic `cardshock-score` in v102 is the substitute).

## 9. Files touched (charter only)

```
docs/spec-v100.md                  (this file)
docs/spec-v100-roster.md           (the curated source-of-truth roster)
docs/spec-v101.md … spec-v148.md   (the forty-eight feature specs)
```

The charter writes **no code.** It creates no group, no `lib/` module, no renderer, and
no catalog row. README / CHANGELOG / `scope-mdcalc-parity.md` catalog-count edits happen
**per feature spec as it ships**, not here — at v100 close the catalog is still **432**
and nothing is built. The one program-level documentation amendment v100 *proposes* is
to [scope-mdcalc-parity §1](scope-mdcalc-parity.md): the steady-state estimate
("400–600 tiles over 3–5 years") is raised to **~600–700**, reflecting that this program
alone takes the catalog to 679 while keeping every §8 exclusion. That edit lands with
the first feature spec that ships, not in the charter.

## 10. Acceptance criteria

v100 is "accepted" as a charter when:

- The §2 doctrine re-binding and the §6 CI/CD re-binding are the cited contract in every
  v101–v148 spec (each links back to "[spec-v100](spec-v100.md) §2 (re-binding
  [spec-v85](spec-v85.md) §2)" and "§6").
- The roster in §4 / [spec-v100-roster.md](spec-v100-roster.md), the no-new-`data/`
  strategy in §5, the deepening backlog in §7, and the **permanent-exclusion list in §8**
  are the agreed program shape, or are amended here before a feature spec implements
  against them.
- The home-group placements in §3 are reserved; no feature spec introduces a new group
  letter.
- The collision audit in §4 (the three renames) is honored by every implementing spec,
  each of which re-runs the [spec-v85 §6.2](spec-v85.md) collision check.
- No code, no tile, no catalog-count change ships under v100; `UTILITIES.length` stays
  **432** and all catalog-truth surfaces ([spec-v46](spec-v46.md)) are untouched.

## 11. Out of scope for the whole program (v101–v148)

- **No browsable clinical reference indexes.** The [spec-v29](spec-v29.md) §3
  "reference-table dressed as a tool" prohibition holds; the §2 clarification draws the
  line for classification tiles (they must consume inputs and compute a class).
- **No copyrighted, licensed, single-center-unreplicated, sponsored, or AI/ML-in-the-loop
  instruments** — enforced by the §8 governance list, restated from
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md). ML-*derived* scores that ship as a
  fixed integer→risk lookup (`helps2b`/2HELPS2B) are deterministic and in scope; a model
  that runs at render time is not.
- **No auto-disposition, auto-dosing, or order-set generation.** Every tile reports the
  band/score/class and the source's stated interpretation; the
  treat/operate/dialyze/admit/refer decision stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3). High-stakes dosing tiles add the second-check note.
- **No continuous-feed dependencies.** Where a constant is revisable, it is a dated,
  ledger-tracked value monitored by the §6.3 cadence job, never a live feed
  ([spec-v5](spec-v5.md) §2). KDPI/KDRI and the other annually-rescaled models are
  excluded for exactly this reason (§8).
- **No new bundled `data/` dataset.** The few large constant tables (CDC/WHO LMS,
  SCORE2 regions, IWPC coefficients) are compiled into the compute modules (§5).
