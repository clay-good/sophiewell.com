# spec-v106.md — VTE workup algorithms: PEGeD, 4PEPS, Bova, Hestia, original Geneva, and the Constans UE-DVT score (+6 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 2 — Emergency / trauma / toxicology /
> environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)). Adds **6**
> deterministic venous-thromboembolism workup instruments that fill confirmed gaps.
> None duplicates a live tile.
>
> Catalog effect at v106 close: **458 + 6 = 464 tiles** (Wave 1 closed at 458).
>
> Every prior spec (v4 through v105) remains in force. v106 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog already carries the front-line VTE pretest tools (`wells-pe`,
`wells-dvt`, `perc`, ` years-algorithm`, the Wells/Geneva combined tile) and the
prognostic `psi`/`pesi`/`simplified-pesi` set, but six standard VTE-workup
instruments are absent, and each occupies a distinct decision point in the
pathway:

- **No PEGeD tile.** The 2019 graduated-D-dimer rule, which ties the D-dimer
  threshold (500, 1000) to a three-tier clinical pretest probability and safely
  avoids imaging, is reachable nowhere.
- **No 4PEPS tile.** The 13-item weighted pretest score that selects which
  D-dimer strategy (no test / age-adjusted / 1000-cutoff / image) applies is
  absent.
- **No Bova Score.** The 30-day complication risk score for *normotensive,
  confirmed* PE — the intermediate-risk stratifier — has no tile.
- **No Hestia Criteria.** The 11-item checklist that gates outpatient PE
  treatment (any positive item excludes home management) is missing.
- **No original Geneva Score.** The pre-Wells, fully objective pretest model
  (clinical + ABG + chest film) is absent, and is still used where a non-implicit
  rule is wanted.
- **No upper-extremity DVT pretest tool.** The Constans score, the only validated
  pretest probability for UE-DVT, has no tile.

Each is a published, deterministic instrument a clinician already uses; v106
brings them onto the page and opens Wave 2.

## 2. What v106 adds (6 tiles)

### 2.1 `peged` — PEGeD graduated D-dimer rule

- **Citation:** Kearon C, de Wit K, Parpia S, et al. Diagnosis of pulmonary
  embolism with d-dimer adjusted to clinical probability. *N Engl J Med.*
  2019;381(22):2125-2134.
- **citationUrl:** https://doi.org/10.1056/NEJMoa1909159
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `nursing-ed`.
- **Inputs:** the clinical pretest probability tier (low / moderate / high, by
  Wells categorization) and the measured D-dimer (ng/mL FEU).
- **Output:** a **PE-excluded vs imaging-needed** verdict — low C-PTP with
  D-dimer < 1000 → excluded; moderate C-PTP with D-dimer < 500 → excluded; high
  C-PTP always images — naming the tier and the threshold that applied. Class A
  (fixed 2019 rule).

### 2.2 `4peps` — 4-Level Pulmonary Embolism Clinical Probability Score

- **Citation:** Roy PM, Friou E, Germeau B, et al. Derivation and validation of a
  4-level clinical pretest probability score for suspected pulmonary embolism to
  safely decrease imaging testing. *JAMA Cardiol.* 2021;6(6):669-677.
- **citationUrl:** https://doi.org/10.1001/jamacardio.2021.0064
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `nursing-ed`.
- **Inputs:** the 13 weighted items (age band, sex, chronic respiratory disease,
  heart rate < 80, chest pain + dyspnea, prior VTE, syncope, immobility/surgery,
  pain on deep palpation + unilateral edema, O₂ saturation, and the
  PE-most-likely-diagnosis judgment) — positive/negative each.
- **Output:** the **total** (can be negative through high) mapped to the **four
  probability tiers** (very low / low / moderate / high), each selecting a
  D-dimer strategy (no test / D-dimer < 1000 / age-adjusted / direct imaging),
  naming the tier and selected strategy. Class A.

### 2.3 `bova-pe` — Bova Score (complications in normotensive PE)

- **Citation:** Bova C, Sanchez O, Prandoni P, et al. Identification of
  intermediate-risk patients with acute symptomatic pulmonary embolism. *Eur
  Respir J.* 2014;44(3):694-703.
- **citationUrl:** https://doi.org/10.1183/09031936.00006114
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `critical-care`,
  `nursing-ed`.
- **Inputs:** systolic BP 90–100 mmHg (2), elevated cardiac troponin (2), RV
  dysfunction on echo/CT (2), and heart rate ≥ 110 (1).
- **Output:** the **total (0–7)** mapped to the published **stages I (0–2) / II
  (3–4) / III (> 4)** with the stated 30-day PE-related complication and mortality
  framing, naming the stage. Class A. Cross-links `simplified-pesi`.

### 2.4 `hestia` — Hestia criteria for outpatient PE treatment

- **Citation:** Zondag W, Mos ICM, Creemers-Schild D, et al. Outpatient treatment
  in patients with acute pulmonary embolism: the Hestia Study. *J Thromb
  Haemost.* 2011;9(8):1500-1507.
- **citationUrl:** https://doi.org/10.1111/j.1538-7836.2011.04388.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `nursing-ed`,
  `nursing-er`.
- **Inputs:** the 11 checklist items (hemodynamic instability, thrombolysis/
  embolectomy need, active bleeding, O₂ to keep saturation > 90% > 24 h, PE on
  anticoagulation, severe pain needing IV analgesia > 24 h, medical/social reason
  for admission > 24 h, creatinine clearance < 30 mL/min, severe liver
  impairment, pregnancy, documented HIT history) — each yes/no.
- **Output:** a **single positive item → not a home-treatment candidate**
  verdict; all-negative → eligible per the rule, naming which item(s) flagged.
  Class A. Cross-links `simplified-pesi` and `bova-pe`.

### 2.5 `geneva-original` — Geneva Score (original)

- **Citation:** Wicki J, Perneger TV, Junod AF, Bounameaux H, Perrier A. Assessing
  clinical probability of pulmonary embolism in the emergency ward: a simple
  score. *Arch Intern Med.* 2001;161(1):92-97.
- **citationUrl:** https://doi.org/10.1001/archinte.161.1.92
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `nursing-ed`.
- **Inputs:** the original objective items — age band, prior VTE, recent surgery,
  heart rate band, PaCO₂ bands, PaO₂ bands, and the chest-radiograph findings
  (band atelectasis, elevated hemidiaphragm) — weighted per the paper.
- **Output:** the **total** mapped to the published **low / intermediate / high**
  pretest probability bands, naming the band. Class A. Cross-links the existing
  Wells/Revised-Geneva tiles as the predecessor objective model.

### 2.6 `constans-uedvt` — Constans score for upper-extremity DVT

- **Citation:** Constans J, Salmi LR, Sevestre-Pietri MA, et al. A clinical
  prediction score for upper extremity deep venous thrombosis. *Thromb Haemost.*
  2008;99(1):202-207.
- **citationUrl:** https://doi.org/10.1160/TH07-08-0485
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `internal-medicine`, `emergency-medicine`, `nursing-ed`.
- **Inputs:** venous material in the affected limb (central line/pacemaker) (+1),
  localized pain (+1), unilateral pitting edema (+1), and an other-diagnosis at
  least as plausible (−1).
- **Output:** the **total (−1 to +3)** mapped to the published **low (≤ 0) /
  intermediate (1) / high (2–3)** pretest probability bands, naming the band.
  Class A.

## 3. Per-tile robustness

- **All six are bounded criteria/threshold logic.** Each sums weighted items (or,
  for `peged`/`hestia`, applies a threshold/any-positive rule), clamps the total
  to its published range, and names which items/thresholds were counted. They flow
  through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- **`constans-uedvt` carries a signed item** (the −1 alternative-diagnosis term);
  the total is allowed negative and the band logic keys on the signed sum, not its
  absolute value, mirroring the signed-value handling elsewhere in the program.
- **`peged` and `4peps` are strategy selectors, not just scores** — each renders
  the *selected D-dimer strategy* for the resolved tier so the output is
  actionable; partial inputs (tier without D-dimer, or vice versa) render a
  complete-the-fields fallback rather than a verdict from a missing value.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment or imaging order in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** — each cites a
  fixed derivation paper (NEJM, JAMA Cardiol, Eur Respir J, J Thromb Haemost, Arch
  Intern Med, Thromb Haemost) by **journal + authors**, not an issuing society, so
  none trips `ISSUER_PATTERN` and **none gets a `docs/citation-staleness.md` row.**
- **Module & gates (§6.2):** the compute module is **`lib/vte-v106.js`** (exports
  `peged`, `fourPeps`, `bovaPe`, `hestia`, `genevaOriginal`, `constansUedvt`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite
  leaks). The renderer module is **`views/group-v31.js`** (the first Wave-2
  renderer module, continuing the `group-vNN` sequence past `group-v25`); its
  `RV31` export is added to the `app.js` `RENDERERS` spread. Each `META` example is
  pinned by the chromium `example-correctness` sweep; the catalog count moves on
  all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px
  touch-target checks pass for `views/group-v31.js`.

## 5. Files touched

```
docs/spec-v106.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v31 renderers (RV31) into RENDERERS)
lib/vte-v106.js                          (new module: peged, fourPeps, bovaPe, hestia, genevaOriginal, constansUedvt)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to wells-pe, perc, simplified-pesi, years-algorithm)
views/group-v31.js                       (new renderer module: 6 renderers)
docs/clinical-citations.md               (+6 rows for the six sources)
test/unit/peged.test.js, 4peps.test.js, bova-pe.test.js, hestia.test.js, geneva-original.test.js, constans-uedvt.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/vte-v106.js to MODULES)
docs/audits/v12/peged.md, 4peps.md, bova-pe.md, hestia.md, geneva-original.md, constans-uedvt.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 458 -> 464; Wave 2 progress in the running ledger)
CHANGELOG.md                             (Unreleased: v106 entry, +6)
README.md, package.json                  (catalog count 458 -> 464; spec-progression line -> v106)
```

## 6. Acceptance criteria

v106 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all six ids are absent (`peged`, `4peps`, `bova-pe`, `hestia`,
  `geneva-original`, `constans-uedvt`).
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  including a **band-flip per tile** (PEGeD: D-dimer crossing 1000 at low C-PTP;
  4PEPS: a total crossing the moderate→high boundary; Bova: total crossing 4 into
  stage III; Hestia: one positive item flipping eligible→ineligible; original
  Geneva: total crossing into the high band; Constans: the −1 term flipping
  intermediate→low), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; `constans-uedvt`
  handles the signed total correctly; partial inputs render a complete-the-fields
  fallback.
- No Class B tile in this spec → **no `docs/citation-staleness.md` row** (all six
  cite journal + authors).
- `UTILITIES.length` is **464** (or the then-current live count + 6 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v106 with the +6 catalog delta.

## 7. Out of scope for v106

- **No D-dimer assay parsing or unit auto-detection** — `peged`/`4peps` take the
  clinician's numeric D-dimer and tier; the tile states the FEU assumption rather
  than converting assay units.
- **No imaging or anticoagulation order** — each tile reports the rule's verdict/
  band and the source's stated strategy; the image/treat/admit decision stays with
  the clinician and local protocol.
- **No duplication of the existing Wells/Revised-Geneva/PERC tiles** — `peged`
  *consumes* a Wells-style tier; `geneva-original` is the predecessor objective
  model. Cross-linked, all kept (different jobs).
