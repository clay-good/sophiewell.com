# spec-v85.md — Advanced Clinical Calculators: program charter, the deepening doctrine, and the CI/CD maintenance contract

> Status: **PROPOSED (2026-06-16).** Charter spec — **zero tiles of its own.**
> v85 is the umbrella for a **fourteen-spec program** ([spec-v86](spec-v86.md)
> through [spec-v99](spec-v99.md)) that deepens the bedside/critical-care surface of
> the catalog into the **advanced clinical** computations a physician reaches for in
> the ICU, the resuscitation bay, the oncology suite, the cath lab, the PFT lab, the
> dialysis unit, and the subspecialty clinic. It adds **no tile** by itself; it
> defines the doctrine every feature-spec tile obeys (§2), the home groups (§3 — no
> new group is created), the roster (§4), the data strategy (§5), and the **build &
> maintenance / CI-CD contract** (§6) that says exactly how each tile is built,
> gated, and kept current as guidelines revise.
>
> The program runs in **two waves**, each independently shippable:
> - **Wave 1 — advanced bedside/critical-care** ([v86](spec-v86.md)–[v89](spec-v89.md)):
>   toxicology decision rules, hemodynamics/ICU physiology, endocrine & oncologic
>   emergencies, and the rheumatology/hepatology/perioperative opener. **+13 tiles,
>   366 → 379.**
> - **Wave 2 — specialty depth** ([v90](spec-v90.md)–[v99](spec-v99.md)):
>   cardiology/ECG, pulmonary-function, nephrology, hepatology/GI disease activity,
>   heme/onc prognosis, neurology outcome scales, psychiatry rating scales,
>   perioperative risk prediction, net-new pediatrics, and ID/critical-care/burns
>   decision rules. **+53 tiles, 379 → 432.**
>
> Catalog effect at v85 close: **366 tiles, unchanged.** The program as a whole
> ([v86–v99](spec-v99.md)) takes the catalog **366 → 432 (+66)**.
>
> Wave-2 collision note: a full-catalog sweep (including Group N, Pediatrics &
> Neonatal) found that the pediatric/neonatal surface is already deep — `finnegan`,
> `ballard`, `downes`, `bhutani-bilirubin`, `pecarn-head`, `pecarn-cspine`,
> `pecarn-iai` already ship. [v98](spec-v98.md) was accordingly trimmed to the four
> genuinely-absent pediatric rules, and [v99](spec-v99.md) swapped the existing
> `pecarn-cspine` for `saps-ii`. The roster (§4) reflects the verified, post-sweep
> deltas.
>
> Every prior spec (v4 through v84) remains in force. No runtime network call,
> no AI, no ETL — the [spec-v29](spec-v29.md) §3 one-line test and the
> [spec-v59](spec-v59.md) output-safety contract govern every tile added here.
> This program advances, and is bounded by, the
> [MDCalc-parity scope statement](scope-mdcalc-parity.md): it is the actionable
> subset of advanced clinical calculators that meet the four scope rules
> (actionable, cited, deterministic, in-audience).

## 1. Why this program exists

The catalog is strong on the **clinician at the bedside** — early-warning scores,
acid-base, renal, sepsis, sedation/pain, trauma, VTE/bleeding, pneumonia, peds, OB
— and on the **revenue-cycle** surface the [spec-v77](spec-v77.md) program built.
Where it is still thin is the **advanced, subspecialty** layer the *physician*
computes when the patient is sick or the question is specialist: the Swan-Ganz
hemodynamics on a cardiogenic-shock patient, the toxicology decision rules at 2
a.m., the carboplatin dose for tomorrow's chemo, the QRS axis off the 12-lead, the
GOLD stage off the spirometry, the KDIGO heat-map off the eGFR and albuminuria, the
MDS prognosis off the marrow, the modified Rankin at the stroke follow-up, the
HAM-D in the psych eval, the Gupta cardiac risk in pre-op clinic.

A clinician can Google "what is the Calvert formula." They cannot Google the answer
to the question in front of them — *"target AUC 5, Cockcroft-Gault GFR 96, what
carboplatin dose and do I cap the GFR at 125?"*, *"SV1 28 mm plus RV5 22 mm — does
this meet Sokolow-Lyon for LVH?"*, *"eGFR 38 with a UACR of 340 — what KDIGO risk
category?"* Each is a **deterministic computation** over a handful of inputs and a
small set of published thresholds. They are exactly the shape this catalog is built
for, and they are the highest-leverage, least-Googleable tools a physician can carry
on a phone. This program builds them.

### Design pivot, stated plainly

This is a **deepening of an existing surface, not a pivot of mission**. The
[nurse-first intent](spec-v62.md) governs what we *deepen*; it has never meant
excluding the physician-facing advanced layer that sits one rung above the bedside
score. The advanced clinical tiles serve the same audience the catalog already
serves — they are the calculators the resident, intensivist, cardiologist,
nephrologist, oncologist, neurologist, psychiatrist, and anesthesiologist use on the
same shift the nurse uses NEWS2 and the drip-rate tool. v85 invests in that layer
because it is underbuilt relative to its real-world value, and because every one of
these tiles passes the same determinism bar as a creatinine-clearance calculator.

## 2. The suite doctrine (binding on every v86–v99 tile)

Every tile added by this program MUST satisfy all of the following. A feature spec
that cannot meet a clause for a given tile must either redesign the tile or drop
it — not relax the doctrine.

1. **One-line test ([spec-v29](spec-v29.md) §3).** Inputs in, a deterministic
   number / band / decision out. No AI, no network, no server. Works fully offline
   through the service worker like every other tile.

2. **Input-driven, never a browsable index.** Where a computation needs a lab value,
   a hemodynamic measurement, a target AUC, a joint count, or an ECG voltage, the
   tile accepts that value **as an input** and computes from it. The program ships
   **no new bundled dataset** (§5): there is no labs database, no AIS dictionary, no
   drug-pricing file. The few large published *constant tables* a handful of tiles
   need (the GLI-2012 spirometry coefficients, the Lund-Browder region percentages,
   the IPSS-R cytogenetic risk groups) are compiled into the compute module as fixed
   constants, not served as a browsable corpus.

3. **Output-safety contract ([spec-v59](spec-v59.md)).** No tile may emit `NaN`,
   `Infinity`, `Invalid Date`, or a silently-wrong number. Every compute function
   joins the [`test/unit/fuzz-tools.test.js`](../test/unit/fuzz-tools.test.js)
   harness on import; zero non-finite leaks is a merge gate. Square roots, logarithms
   (DAS28, NAFLD-FS, the resistance equations), and the `atan2` in `ecg-axis` guard
   their domains and return a surfaced `valid:false` fallback rather than a `NaN`.

4. **Primary published sources only ([spec-v48](spec-v48.md) / [spec-v54](spec-v54.md)
   / [spec-v61](spec-v61.md) citation rule).** Each tile ships an inline `Citation`
   naming the original derivation paper or society guideline, a `citationUrl`
   (DOI-preferred), and an `accessed` date. A threshold that a society revises on a
   calendar (an ADA hyperglycemic-crisis cutoff, a EULAR DAS28 band, a GOLD/KDIGO
   stage, an AHA Kawasaki criterion, a NICE refeeding criterion, the 2023
   Duke-ISCVID endocarditis criteria) is a **revisable guideline value** with a row
   in [`docs/citation-staleness.md`](citation-staleness.md) and a documented review
   cadence per §6. No secondary commentary, no folk-knowledge constants.

5. **Quote the source's interpretation; never author treatment advice in Sophie's
   voice ([spec-v11](spec-v11.md) §5.3).** Every tile renders the clinical posture
   note ([spec-v50](spec-v50.md) §3): it surfaces the computation and the source's
   own per-band interpretation, attributed to the cited authority and the user's
   inputs. It does not adjudicate the case, order the intervention, or replace the
   clinician's judgment and local protocol. High-stakes dosing tiles
   (`calvert-carboplatin`) add: *confirm against your institutional protocol and a
   second check.*

6. **The [spec-v11](spec-v11.md) audit floor.** Every tile ships ≥3 boundary worked
   examples in its unit test (including the band-flip cases), a cross-implementation
   differential within 0.5% for continuous outputs (or one category for ordinal
   scores), reviewed edge-input handling, and a [spec-v11](spec-v11.md) audit log in
   [`docs/audits/v12/`](audits/v12). The worked example in `META` renders verbatim on
   the page and is pinned by the `example-correctness` sweep.

7. **Mobile-first, single-thumb ([spec-v72](spec-v72.md)).** Every tile fits the
   44px touch-target and no-horizontal-scroll contract. Inputs are numeric where
   possible (numeric keypad), and the show-your-work derivation
   ([spec-v48](spec-v48.md) `<dl>` block) reads top-to-bottom on a phone with no
   sideways-scrolling table. A clinician at the bedside can run any of these
   one-handed.

## 3. Home groups — no new group

Unlike the [spec-v77](spec-v77.md) billing program, which introduced Group B, this
program **creates no new group**. The advanced clinical tiles are members of the
families the catalog already curates, and they cross-link to their near-neighbors:

| Tile family | Spec | Home group | Sits beside |
|---|---|---|---|
| Toxicology decision rules | v86 | `G` Clinical Scoring & Risk | `ciwa`, `cows`, `acetaminophen-nomogram` (F), `co-cn-antidote` (I) |
| Hemodynamics / ICU physiology | v87 | `E` Clinical Math & Conversions | `cao2-do2`, `oxygenation-index`, `driving-pressure`, `vis` |
| DKA/HHS, tumor lysis | v88 | `G` Clinical Scoring & Risk | `burch-wartofsky`, `kdigo-aki`, `anion-gap-dd` (E) |
| Carboplatin dosing | v88 | `F` Medication & Infusion | `iron-ganzoni`, `weight-dose`, `cockcroft-gault` (E) |
| DAS28, King's College, ASA-PS, Surgical Apgar | v89 | `G` Clinical Scoring & Risk | `rcri`, `ariscat`, `meld-childpugh`, `apfel` |
| Cardiology computations & ECG | v90 | `E`/`G` | `qtc-suite`, `sgarbossa`, `map`, hemodynamic-suite (v87) |
| Pulmonary function & chronic respiratory | v91 | `E`/`G` | `aa-pf-suite`, `rox`, `curb-65`, `smart-cop` |
| Nephrology: CKD staging, proteinuria, dialysis | v92 | `E`/`G` | `egfr-suite`, `fena-feurea`, `kdigo-aki`, `ttkg` |
| Hepatology & GI disease activity | v93 | `G` | `meld-childpugh`, `fib4`, `apri`, `ranson-bisap` |
| Heme/onc prognosis | v94 | `G` | `anc`, `khorana`, `four-ts`, `isth-dic` |
| Neurology outcome scales & grading | v95 | `G` | `nihss`, `ich-score`, `hunt-hess-wfns`, `four-score` |
| Psychiatry rating scales | v96 | `G` | `phq9`, `gad7`, `cssrs`, `gds15` |
| Perioperative risk prediction | v97 | `G` | `rcri`, `ariscat`, `lemon`, `apfel` |
| Pediatrics (net-new rules) | v98 | `G` | `pews`, `alvarado-pas`, `nigrovic`, `pelod2`, `pecarn-head` (N) |
| ID / critical-care / burns decision rules | v99 | `G` | `curb-65`, `sirs`, `burn-fluid` (I), `icu-nutrition-target` (F) |

Each feature spec states its group per tile and moves on; no existing tile changes
group, and the home/topic-hub group cards are unchanged.

## 4. The roster (what each feature spec ships)

**Wave 1 — advanced bedside/critical-care:**

| Spec | Theme | Tiles | Δ | Total |
|---|---|---|---|---|
| **[v86](spec-v86.md)** | Toxicology decision rules | `serotonin-toxicity`, `salicylate-toxicity`, `toxic-alcohol` | +3 | 369 |
| **[v87](spec-v87.md)** | Hemodynamics & ICU physiology | `hemodynamic-suite`, `mechanical-power`, `dead-space` | +3 | 372 |
| **[v88](spec-v88.md)** | Endocrine & oncologic emergencies | `dka-hhs`, `calvert-carboplatin`, `tls-cairo-bishop` | +3 | 375 |
| **[v89](spec-v89.md)** | Rheum, hepatology & perioperative opener | `das28`, `kings-college`, `asa-ps`, `surgical-apgar` | +4 | 379 |

**Wave 2 — specialty depth:**

| Spec | Theme | Tiles | Δ | Total |
|---|---|---|---|---|
| **[v90](spec-v90.md)** | Cardiology computations & ECG | `ecg-axis`, `lvh-criteria`, `timi-stemi`, `duke-treadmill`, `cardiac-power-output`, `aortic-valve-area` | +6 | 385 |
| **[v91](spec-v91.md)** | Pulmonary function & chronic respiratory | `gold-spirometry`, `bode-index`, `gap-ipf`, `predicted-spirometry`, `mmrc-dyspnea` | +5 | 390 |
| **[v92](spec-v92.md)** | Nephrology: CKD staging, proteinuria, dialysis | `ckd-staging`, `uacr-upcr`, `ktv-urr`, `mehran-cin`, `ckd-epi-cystatin` | +5 | 395 |
| **[v93](spec-v93.md)** | Hepatology & GI disease activity | `nafld-fibrosis`, `glasgow-imrie`, `truelove-witts`, `harvey-bradshaw`, `mayo-uc`, `milan-criteria` | +6 | 401 |
| **[v94](spec-v94.md)** | Heme/onc prognosis | `hscore-hlh`, `ipss-r-mds`, `flipi`, `mascc`, `sokal-cml` | +5 | 406 |
| **[v95](spec-v95.md)** | Neurology outcome scales & grading | `mrs`, `gose`, `hoehn-yahr`, `spetzler-martin`, `house-brackmann`, `midas` | +6 | 412 |
| **[v96](spec-v96.md)** | Psychiatry rating scales | `hamd`, `hama`, `madrs`, `mdq`, `ybocs`, `pcl5` | +6 | 418 |
| **[v97](spec-v97.md)** | Perioperative risk prediction | `gupta-mica`, `gupta-respiratory-failure`, `arozullah-pneumonia`, `el-ganzouri`, `pospom` | +5 | 423 |
| **[v98](spec-v98.md)** | Pediatrics (net-new rules) | `kawasaki-criteria`, `kocher-criteria`, `pim3`, `catch-head` | +4 | 427 |
| **[v99](spec-v99.md)** | ID / critical-care / burns decision rules | `duke-endocarditis`, `pitt-bacteremia`, `saps-ii`, `lund-browder`, `refeeding-risk` | +5 | 432 |

**Program total: +66 tiles, 366 → 432.** Each spec is independently shippable and
independently reviewable; they may land in any order, and the program is valuable
even if only a few ship. Each feature spec re-states its own running catalog count in
its acceptance criteria; the totals above are the intended end state if all fourteen
land. The running counts assume the specs ship in numeric order; if they land out of
order, the implementing spec uses the then-current `UTILITIES.length` and its own
delta, and the catalog-truth gate (§6) enforces agreement.

### Deliberate non-duplication with what exists

The program **extends**, never shadows, the existing clinical cluster. Each feature
spec lists its own near-neighbors; representative ones: `toxic-alcohol` (v86) applies
the fomepizole-indication rule on top of the gap that `osmolal-gap` (E) computes;
`hemodynamic-suite` (v87) and `cardiac-power-output` (v90) consume a cardiac output
the user enters and feed the DO₂ that `cao2-do2` (E) computes; `ckd-epi-cystatin`
(v92) is the cystatin-C companion to the creatinine-only `egfr` (E) already shipped;
`nafld-fibrosis` (v93) joins `fib4`/`apri` as a third non-invasive fibrosis estimate;
`mrs` (v95) is the outcome scale the `nihss` patient is followed with;
`pecarn-head`/`pecarn-cspine` (v98/v99) are the pediatric companions to the adult
`cthr`/`nexus-cspine`. None re-implements an existing tile.

## 5. Data strategy (the bundle stays light)

Per doctrine clause 2, **this program bundles no new dataset.** Every value a tile
needs is either a user input (a lab, a pressure, a voltage, a joint count, a target
AUC) or a **small set of published constants compiled into the compute module
itself**. Most are tiny (the EXTRIP thresholds, the Cairo-Bishop cutoffs, the DAS28
coefficients, the Surgical Apgar point table, the Mehran point weights, the IPSS-R
risk groups). A few are larger published constant tables — the **GLI-2012 spirometry
reference coefficients** (`predicted-spirometry`, v91), the **IPSS-R cytogenetic
risk groups** (`ipss-r-mds`, v94), and the **Lund-Browder age-adjusted body-region
percentages** (`lund-browder`, v99) — and these are still compiled constants the
compute reads, **not** a `data/` directory and **not** a browsable index. No `data/` directory is added or modified by this program.
Where a constant is revisable, it is dated and ledger-tracked per §6 clause 4.

## 6. Build & maintenance: the CI/CD contract

The user-facing promise ([scope-mdcalc-parity §7](scope-mdcalc-parity.md)) is "the
result you got Monday is the result you get Friday." That promise is kept by
machinery, not vigilance. This section is the operational contract: how each tile is
**built**, **gated**, and **kept current**. Every feature spec's "CI/CD &
maintenance" subsection instantiates it.

### 6.1 The build pipeline (`npm run build`)

A new tile is a `lib/<module>.js` compute export + a `views/group-vNN.js` renderer +
an `app.js` `UTILITIES` row + a `lib/meta.js` `META` entry. `npm run build` then,
with no per-tile configuration:

- emits `dist/` (the deployed bundle) with `BUILD_HASH` stamping;
- pre-renders one static `/tools/<id>/index.html` per live tile
  (`scripts/build-tool-pages.mjs`), classifying it as a `MedicalCalculator` by
  default (the allowlist guard from [spec-v76](spec-v76.md) rejects any tile-id list
  that names a non-catalog id);
- regenerates `sitemap.xml`, the topic/hub pages (`build-topic-pages.mjs`), and the
  service-worker shell precache (the [spec-v75](spec-v75.md)/[spec-v84](spec-v84.md)
  full-shell contract, guarded by `sw-shell.test.js`);
- rebuilds `sbom.json`/`sbom.md` (a changed source file legitimately changes the SBOM
  serialNumber — commit it, it is not churn).

No tile in this program needs a build-script change beyond the `UTILITIES` row the
builder already parses.

### 6.2 The merge gates (`npm run lint` + `npm run test` + `npm run test:e2e`)

Every tile must pass, with no exceptions and no skips:

| Gate | What it enforces for a new tile |
|---|---|
| `eslint` | style/parse; note eslint carries **no** no-unused/no-undef rule here, so prune verification also uses `node --check` + grep |
| `grep-check.mjs` | catalog-count strings agree across README/index/package |
| `check-output-safety.mjs` | no raw `.toFixed()`/interpolation that can surface `NaN` |
| `check-citations.mjs` | every guideline acronym matching `ISSUER_PATTERN` has a `docs/citation-staleness.md` row (the §6.3 trigger) |
| `check-catalog-truth.mjs` | the **13 enforced catalog-count surfaces** all equal `UTILITIES.length` |
| `test/unit/fuzz-tools.test.js` | the module is in `MODULES`; **zero non-finite leaks** across fuzzed inputs (domain guards on √, ln, atan2, division) |
| `a11y-check.mjs` | heading order, labels, contrast for the new renderer |
| Playwright `all-tools` / `smoke` | the route boots and renders for the new id |
| Playwright `example-correctness` (chromium) | the `META` worked example renders **verbatim** — flake-prone under CPU load, CI `retries:2`; rerun isolated to confirm |
| Playwright `mobile-no-hscroll` + `mobile-touch-targets` | 320px no horizontal scroll; 44px targets |
| `data:verify` (`verify-integrity.mjs`) | unchanged — no `data/` touched |

The **definition of done** for a tile is: all gates green, the
[spec-v11](spec-v11.md) audit log present, the `META` example pinned, and the catalog
count bumped on **all** catalog-truth surfaces in the same change.

### 6.3 Maintenance classes & the staleness machinery

Every constant a tile uses is classified, and the class decides the maintenance
obligation:

- **Class A — stable formula / fixed coefficient.** A published equation or point
  table that does not change on a calendar: Calvert 1989, Sokolow-Lyon 1949, DAS28
  coefficients, the Surgical Apgar bands, the hexaxial ECG geometry, Daugirdas Kt/V,
  the continuity equation. **No staleness row.** It can only change if the source
  paper is retracted/superseded, which the citation review (below) catches.
- **Class B — revisable guideline threshold.** A cutoff a society republishes on a
  calendar: ADA hyperglycemic-crisis thresholds, EULAR DAS28 bands, GOLD spirometry
  stages, KDIGO CKD categories, AHA Kawasaki criteria, NICE refeeding criteria,
  ESC/ERS PVR threshold, the 2023 Duke-ISCVID endocarditis criteria, the FDA
  carboplatin GFR cap. **Each gets a `docs/citation-staleness.md` row** naming the
  source, the **edition/year in force**, the `accessed` date, and a **review cadence**
  (default: annual for ADA/GOLD/NICE Standards-of-Care-style documents; on-publication
  for the rest). `check-citations.mjs` already fails the build if a class-B acronym
  lacks a row; this program extends the obligation to name the edition and cadence.
- **Class C — dated regulatory/payment constant.** Out of scope for this clinical
  program; it is the billing program's `pa-staleness-ledger.json` mechanism
  ([spec-v77](spec-v77.md) §2 clause 3) and is not used here.

**Proposed CI addition (one-time, program-level):** a scheduled monthly CI job
(`scripts/check-citation-cadence.mjs`, new) that reads `docs/citation-staleness.md`,
and for each **Class B** row whose `accessed` date is older than its declared review
cadence, **warns** (annotates the run, does not block) so the maintainer reviews
whether a newer edition exists. This converts "remember to check GOLD every year"
into a calendar-driven prompt, consistent with the [spec-v5](spec-v5.md) §2 no-live-
feed rule (it checks *our own dated rows*, not an external feed). The job is a
warn-only annotation, never an auto-edit — a guideline update is always a reviewed,
audited maintainer change.

### 6.4 The update workflow when a guideline revises

When a Class B source publishes a new edition, the maintainer change is small and
bounded, and the formula tiles are untouched:

1. Edit the single constant (or threshold table) in the `lib/<module>.js` compute.
2. Update the tile's `META` citation `accessed` date and the
   `docs/citation-staleness.md` row (edition in force + new `accessed`).
3. Re-run the [spec-v11](spec-v11.md) audit log for that tile (the worked example may
   move a band edge — update the `META` example and its `docs/audits/v12/<id>.md`).
4. Run the full gate set (§6.2); the `example-correctness` sweep pins the new example.

Class A tiles never enter this workflow — their math is fixed; only their citation is
periodically re-verified for retraction/supersession in the routine README-stats /
citation pass.

## 7. Files touched (charter only)

```
docs/spec-v85.md                 (this file)
docs/spec-v86.md … spec-v99.md   (the fourteen feature specs)
```

The charter writes **no code**. It creates no group, no `lib/` module, no renderer,
and no catalog row. The one **proposed** new CI script
(`scripts/check-citation-cadence.mjs`, §6.3) is authored by the first wave-2 feature
spec that introduces a Class B constant ([v90](spec-v90.md) or whichever lands
first), not here. README / CHANGELOG / `scope-mdcalc-parity.md` catalog-count edits
happen **per feature spec as it ships**, not here — at v85 close the catalog is still
366 and nothing is built.

## 8. Acceptance criteria

v85 is "accepted" as a charter when:

- The doctrine in §2 and the CI/CD contract in §6 are the cited contract in every
  v86–v99 spec (each links back to "[spec-v85](spec-v85.md) §2" and "§6").
- The roster in §4, the no-new-data strategy in §5, and the maintenance classes in
  §6.3 are the agreed program shape, or are amended here before a feature spec
  implements against them.
- The home-group placements in §3 are reserved; no feature spec introduces a new
  group letter.
- No code, no tile, no catalog-count change ships under v85; `UTILITIES.length` stays
  **366** and all catalog-truth surfaces ([spec-v46](spec-v46.md)) are untouched.

## 9. Out of scope for the whole program (v85–v99)

- **No browsable clinical reference indexes.** No bundled labs database, no AIS
  dictionary, no searchable drug-pricing file. The [spec-v29](spec-v29.md) §3
  "reference-table dressed as a tool" prohibition holds: the program ships
  **calculators and decision rules**, never lookup tables.
- **No AI-generated or "smart" diagnostic helpers**, no single-center unreplicated
  scores, no copyrighted/licensed instruments (e.g. MoCA, SLUMS) — restated from
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md). Each feature spec confirms the
  instruments it ships are public-domain or free-to-use and names any it deliberately
  excludes for licensing.
- **No auto-disposition or order-set generation.** Every tile reports the band and
  the source's stated interpretation; the treat/dialyze/transplant-refer/dose/admit
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md)
  §5.3).
- **No continuous-feed dependencies.** Where a constant is revisable, it is a dated,
  ledger-tracked value the user can override, monitored by the §6.3 cadence job, not
  a live feed ([spec-v5](spec-v5.md) §2 no-ETL rule).
- **No discredited instruments.** The Done salicylate nomogram is excluded
  ([spec-v86](spec-v86.md) §6); the program ships current recommendations instead.
