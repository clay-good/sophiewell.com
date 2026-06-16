# spec-v98.md — Pediatrics: Kawasaki criteria, Kocher septic-hip, PIM3 mortality, and the CATCH head-CT rule (+4 tiles)

> Status: **PROPOSED (2026-06-16).** Ninth feature spec (wave 2) of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **4**
> deterministic pediatric decision rules and prognostic scores that fill confirmed
> gaps **after** an exhaustive check against the existing Pediatrics & Neonatal
> group (`N`) and the pediatric scores already in Group G. None duplicates a live
> tile.
>
> Catalog effect at v98 close: **423 + 4 = 427 tiles.**
>
> Every prior spec (v4 through v97) remains in force. v98 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine and the
> [spec-v85](spec-v85.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

> **Scope correction recorded.** An earlier draft of this spec proposed
> `finnegan-nas`, `new-ballard`, `downes`, `bhutani-bilirubin`, and `pecarn-head`.
> A full-catalog sweep found all five **already shipped** in Group N
> (`finnegan`, `ballard`, `downes`, `bhutani-bilirubin`, `pecarn-head`), along with
> `pecarn-cspine`, `pecarn-iai`, `neo-phototherapy`, `silverman-andersen`,
> `qbl-pph`, `rhig-dose`, and more. The pediatric/neonatal surface is already deep;
> v98 ships only the **genuinely-absent** rules below and cross-links the existing
> ones. The implementing session MUST re-run the §6.2 catalog-truth check before
> adding any row.

## 1. Thesis

The catalog's pediatric surface is broad — Group N carries the neonatal and
procedural tiles (`ballard`, `finnegan`, `bhutani-bilirubin`, `downes`,
`neo-phototherapy`, `pecarn-head`, `pecarn-cspine`, `pecarn-iai`), and Group G
carries the pediatric clinical scores (`pews`, `peds-gcs`, `alvarado-pas`,
`nigrovic`, `rochester`/`philadelphia`/`boston-febrile`/`step-by-step`, `westley`,
`pram-asthma`, `pelod2`, `psofa`, `sipa`). Four standard pediatric instruments are
nonetheless absent:

- **Kawasaki disease has no diagnostic-criteria tile** — the AHA classic-vs-
  incomplete algorithm a clinician runs on the febrile child is reachable nowhere
  in the catalog.
- **The septic hip has no Kocher tile** — the four-predictor rule that separates
  septic arthritis from transient synovitis and drives the joint-aspiration
  decision is a clean, validated probability rule.
- **Pediatric ICU mortality has PELOD-2 and pSOFA but not PIM3** — the admission
  mortality model used across PICUs for benchmarking and risk adjustment.
- **Pediatric head injury has PECARN but not CATCH** — the Canadian rule is the
  validated alternative (different inclusion and risk factors), and the catalog
  already ships parallel rules elsewhere (`cthr`, `nexus-chest`, `nexus-cspine`).

Each is a published, deterministic instrument a clinician already uses; v98 brings
them onto the page and cross-links the pediatric tiles that already exist.

## 2. What v98 adds (4 tiles)

### 2.1 `kawasaki-criteria` — Kawasaki disease diagnostic criteria (classic + incomplete)

- **Citation:** McCrindle BW, Rowley AH, Newburger JW, et al. Diagnosis,
  Treatment, and Long-Term Management of Kawasaki Disease: A Scientific Statement
  for Health Professionals From the American Heart Association. *Circulation.*
  2017;135(17):e927-e999.
- **citationUrl:** https://doi.org/10.1161/CIR.0000000000000484
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `pediatric-cardiology`, `pediatric-emergency`,
  `nursing-peds`.
- **Inputs:** fever duration (days), the five principal clinical features
  (bilateral non-exudative conjunctivitis, oral mucosal changes, cervical
  lymphadenopathy ≥1.5 cm, extremity changes, polymorphous rash); and — for the
  incomplete pathway — CRP (mg/dL), ESR (mm/hr), and the supplementary laboratory
  criteria (anemia for age, platelets ≥450,000 after day 7, albumin ≤3.0 g/dL,
  elevated ALT, WBC ≥15,000, urine WBC ≥10/hpf).
- **Output:** **classic Kawasaki** (fever ≥5 days **plus ≥4** of the five principal
  features), or the **incomplete-Kawasaki** determination via the AHA algorithm
  (prolonged fever + 2–3 features → CRP/ESR gate → ≥3 supplementary lab criteria or
  positive echo). The output shows which features/criteria were met. Class B (AHA
  statement is revisable → `docs/citation-staleness.md` row).

### 2.2 `kocher-criteria` — Kocher criteria (septic arthritis vs transient synovitis of the pediatric hip)

- **Citation:** Kocher MS, Zurakowski D, Kasser JR. Differentiating between septic
  arthritis and transient synovitis of the hip in children: an evidence-based
  clinical prediction algorithm. *J Bone Joint Surg Am.* 1999;81(12):1662-1670.
- **citationUrl:** https://doi.org/10.2106/00004623-199912000-00002
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-orthopedics`, `pediatric-emergency`,
  `emergency-medicine`, `pediatrics`.
- **Inputs:** four predictors — non-weight-bearing on the affected side; oral
  temperature > 38.5 °C; ESR > 40 mm/hr; serum WBC > 12,000 cells/µL.
- **Output:** the **count of predictors present (0–4)** with the cited predicted
  probability of septic arthritis (≈ <0.2% for 0, ≈ 3% for 1, ≈ 40% for 2, ≈ 93%
  for 3, ≈ 99% for 4), framed as joint-aspiration decision support. Class A.

### 2.3 `pim3` — Paediatric Index of Mortality 3

- **Citation:** Straney L, Clements A, Parslow RC, et al. Paediatric index of
  mortality 3: an updated model for predicting mortality in pediatric intensive
  care. *Pediatr Crit Care Med.* 2013;14(7):673-681.
- **citationUrl:** https://doi.org/10.1097/PCC.0b013e31829760cf
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`, `nursing-picu`, `pediatrics`.
- **Inputs:** the PIM3 admission variables — systolic blood pressure, pupillary
  reactions to light, FiO₂ × PaO₂ ratio, base excess, mechanical ventilation in the
  first hour, elective admission, recovery from surgery/procedure, cardiac bypass,
  high-risk and low-risk diagnosis flags.
- **Output:** the **predicted probability of death (%)** via the published PIM3
  logistic equation, shown with the contributing terms. Class A (fixed regression
  coefficients). Companion to `pelod2` and `psofa` (organ-dysfunction scores) —
  PIM3 is the admission *mortality* model; cross-linked, all kept. Robustness: the
  logistic `1/(1+e^-x)` is overflow-guarded.

### 2.4 `catch-head` — CATCH rule (CT for childhood minor head injury)

- **Citation:** Osmond MH, Klassen TP, Wells GA, et al (Pediatric Emergency
  Research Canada). CATCH: a clinical decision rule for the use of computed
  tomography in children with minor head injury. *CMAJ.* 2010;182(4):341-348.
- **citationUrl:** https://doi.org/10.1503/cmaj.091421
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-emergency`, `emergency-medicine`, `nursing-ed`.
- **Inputs:** the high-risk factors (GCS < 15 at 2 h, suspected open/depressed
  skull fracture, worsening headache, irritability on exam) and medium-risk factors
  (basal-skull-fracture signs, large boggy scalp hematoma, dangerous mechanism).
- **Output:** "**CT head indicated**" if any high- or medium-risk factor is present
  (high-risk → neurosurgical-intervention need; medium-risk → brain injury on CT),
  else "**CT may be deferred**," naming the factor that fired. Class A. The
  **alternative** to the existing `pecarn-head` (Group N) rule — different inclusion
  and factors; cross-linked, both kept, mirroring the catalog's parallel
  `cthr`/`nexus-chest` decision rules.

## 3. Per-tile robustness

- **`kocher-criteria` and `catch-head` are boolean/threshold logic** with no
  arithmetic; they still flow through the [spec-v59](spec-v59.md) fuzz harness to
  confirm no `undefined` reaches the DOM, and each names the predictor/factor that
  fired so the determination is auditable.
- **`pim3` guards its logistic.** The `1/(1+e^-x)` is computed with an overflow-safe
  form; SBP / FiO₂·PaO₂ / base-excess inputs are range-clamped; a blank required term
  renders "(enter all PIM3 variables)" rather than a probability from `NaN`.
- **`kawasaki-criteria` gates the incomplete pathway** on the fever-duration and
  CRP/ESR thresholds before evaluating the supplementary lab criteria, and refuses a
  verdict on a partially-entered lab panel (shows "incomplete — enter CRP/ESR").
- All four render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v85](spec-v85.md) §6 contract:

- **Maintenance classes (§6.3):** `kocher-criteria`, `pim3`, and `catch-head` are
  **Class A** (fixed derivation papers / regression coefficients) — no
  `docs/citation-staleness.md` row; their citations are re-verified for
  retraction/supersession only in the routine citation pass. `kawasaki-criteria` is
  **Class B** (the AHA scientific statement is revisable) — it gets a
  `docs/citation-staleness.md` row naming the 2017 AHA edition in force, the
  `accessed` date, and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job authored in [spec-v90](spec-v90.md).
- **Gates (§6.2):** `lib/peds-v98.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks, with the PIM3 logistic explicitly fuzzed for
  overflow); each tile's `META` worked example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces** in the same change; a11y, mobile-no-hscroll, and 44px touch-target
  checks pass for `views/group-v24.js`.
- **Update workflow (§6.4):** if the AHA revises the Kawasaki statement, the
  maintainer edits the criteria constants in `lib/peds-v98.js`, updates the `META`
  `accessed` date and the staleness row, re-runs the `kawasaki-criteria` audit log,
  and re-pins the example. The Class-A tiles never enter that workflow.

## 5. Files touched

```
docs/spec-v98.md                         (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v24 renderers into RENDERERS)
lib/peds-v98.js                          (new module: kawasakiCriteria, kocherCriteria, pim3, catchHead)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to pecarn-head, pecarn-cspine, pecarn-iai, alvarado-pas, pelod2, psofa, pews)
views/group-v24.js                       (new renderer module: 4 renderers)
docs/citation-staleness.md               (+ row: kawasaki-criteria AHA 2017 statement)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/kawasaki-criteria.test.js, kocher-criteria.test.js, pim3.test.js, catch-head.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/peds-v98.js to MODULES)
docs/audits/v12/kawasaki-criteria.md, kocher-criteria.md, pim3.md, catch-head.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 423 -> 427; append to the running ledger)
CHANGELOG.md                             (Unreleased: v98 entry, +4)
README.md, package.json                  (catalog count 423 -> 427; spec-progression line -> v98)
```

## 6. Acceptance criteria

v98 is fully shipped when:

- The implementing session has **re-run the §6.2 catalog-truth/collision check** and
  confirmed all four ids are absent from the live catalog (the five duplicates from
  the earlier draft stay out).
- All 4 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples (including the
  Kocher 0–4 probability gradient, the PIM3 logistic worked example, the CATCH
  high-vs-medium-risk fire, and classic-vs-incomplete Kawasaki), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `pim3` guards its logistic against overflow; partial inputs render the
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `kawasaki-criteria` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **427** (or live count + 4 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v98 with the +4 catalog delta.

## 7. Out of scope for v98

- **The already-shipped pediatric/neonatal tiles** (`finnegan`, `ballard`, `downes`,
  `bhutani-bilirubin`, `pecarn-head`, `pecarn-cspine`, `pecarn-iai`,
  `neo-phototherapy`, `silverman-andersen`) are **not** re-implemented; v98
  cross-links them.
- **No growth-percentile / CDC-WHO chart tiles** — a reference dataset, out per
  [spec-v29](spec-v29.md) §3.
- **No auto-CT order or auto-aspiration decision** — `catch-head` and
  `kocher-criteria` report the rule's risk/probability; the imaging and procedure
  decisions stay with the clinician.
- **No molecular/echo-derived inputs** — `kawasaki-criteria` takes the clinician's
  feature and lab determinations and the echo-positive flag; it does not parse an
  echo report.
