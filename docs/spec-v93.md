# spec-v93.md — Hepatology & GI disease activity: NAFLD fibrosis, Glasgow-Imrie pancreatitis, Truelove-Witts, Harvey-Bradshaw, Mayo UC, and Milan criteria (+6 tiles)

> Status: **SHIPPED (2026-06-16).** Wave 2 feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **6**
> deterministic hepatology & GI disease-activity instruments that fill confirmed
> gaps in the catalog's liver/gut surface: the non-invasive NAFLD fibrosis estimate,
> the modified Glasgow (Imrie) pancreatitis severity score, the Truelove & Witts and
> Mayo classifications for ulcerative colitis, the Harvey-Bradshaw index for Crohn's
> disease activity, and the Milan criteria for HCC liver-transplant eligibility. The
> catalog ships `meld-childpugh`, `fib4`, `apri`, `ranson-bisap`, and `maddrey-lille`
> but none of these six — the disease-activity and fibrosis instruments every
> hepatology and gastroenterology clinic runs. None duplicates an existing tile.
>
> Catalog effect at v93 close: **395 + 6 = 401 tiles.**
>
> Every prior spec (v4 through v92) remains in force. v93 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine and the
> [spec-v85](spec-v85.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog already carries the chronic-liver and pancreatitis spine —
[`meld-childpugh`](../app.js) for transplant/mortality staging, `fib4` and `apri`
as non-invasive fibrosis surrogates, `ranson-bisap` for acute-pancreatitis
severity, and `maddrey-lille` for alcoholic-hepatitis prognosis. What it does **not**
carry is the disease-*activity* layer the hepatologist and gastroenterologist
actually score in clinic and on the ward:

- **NAFLD has its own fibrosis triage rule, and it is not FIB-4 or APRI.** The NAFLD
  Fibrosis Score (Angulo 2007) is the instrument validated specifically in the NAFLD
  population, combining age, BMI, glucose status, the AST/ALT ratio, platelets, and
  albumin into a single index with published advanced-fibrosis cutoffs. It joins
  `fib4`/`apri` as a third, NAFLD-specific non-invasive estimate — not a replacement.

- **Acute pancreatitis severity is scored two ways, and the catalog has only one.**
  `ranson-bisap` carries Ranson/BISAP; the modified Glasgow (Imrie) score is the
  parallel UK/European standard, an eight-item 48-hour score (the PANCREAS mnemonic)
  where ≥3 predicts severe disease. A clinician should be able to run the alternative
  at the bedside, not recall which lab crosses which SI threshold.

- **IBD disease activity is the daily currency of GI clinic and the catalog has none
  of it.** Truelove & Witts (1955) classifies acute ulcerative-colitis severity and
  still drives the admit/IV-steroid decision; the Mayo score (and its endoscopy-free
  partial form) is the standard UC activity index in trials and follow-up; the
  Harvey-Bradshaw index is the simplified Crohn's disease activity measure. Three
  published, reproducible instruments that a gastroenterologist computes constantly
  and that are entirely absent.

- **Transplant eligibility for HCC is a fixed criterion, not a judgment call.** The
  Milan criteria (Mazzaferro 1996) define which hepatocellular-carcinoma burden is
  *within* the transplant-listing window — a single tumor ≤ 5 cm or ≤ 3 nodules each
  ≤ 3 cm, with no macrovascular invasion and no extrahepatic spread. It sits beside
  `meld-childpugh` as the eligibility companion to the mortality score.

Each is a published, deterministic instrument a physician already uses; v93 brings
them onto the page.

## 2. What v93 adds (6 tiles)

### 2.1 `nafld-fibrosis` — NAFLD Fibrosis Score

- **Citation:** Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis score: a
  noninvasive system that identifies liver fibrosis in patients with NAFLD.
  *Hepatology.* 2007;45(4):846-854.
- **citationUrl:** https://doi.org/10.1002/hep.21496
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** age (years), BMI (kg/m²), impaired fasting glucose or diabetes
  (yes/no), AST (U/L), ALT (U/L), platelet count (×10⁹/L), albumin (g/dL).
- **Output:** the **NAFLD Fibrosis Score**,
  `NFS = −1.675 + 0.037·age + 0.094·BMI + 1.13·(IFG/DM) − 0.013·platelets − 0.66·albumin + 0.99·(AST/ALT)`,
  shown as a `<dl>` derivation, with the published bands: **< −1.455 excludes
  advanced fibrosis (F0–F2)**; **> 0.676 indicates advanced fibrosis (F3–F4)**;
  values **between the two cutoffs are indeterminate**. The output names the band and
  quotes the source's interpretation. **Class A** — a fixed published equation.
  Cross-links [`fib4`](../app.js) and [`apri`](../app.js) as the companion
  non-invasive fibrosis estimates.

### 2.2 `glasgow-imrie` — modified Glasgow (Imrie) pancreatitis severity

- **Citation:** Blamey SL, Imrie CW, O'Neill J, et al. Prognostic factors in acute
  pancreatitis. *Gut.* 1984;25(12):1340-1346.
- **citationUrl:** https://doi.org/10.1136/gut.25.12.1340
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `general-surgery`, `critical-care`,
  `emergency-medicine`.
- **Inputs (at 48 hours; the PANCREAS mnemonic):** **P**aO₂ < 8 kPa (60 mmHg);
  **A**ge > 55 years; **N**eutrophils — WBC > 15 ×10⁹/L; **C**alcium < 2 mmol/L;
  **R**enal — urea > 16 mmol/L; **E**nzymes — LDH > 600 IU/L; **A**lbumin < 32 g/L;
  **S**ugar — glucose > 10 mmol/L.
- **Output:** **one point each (0–8)**; **≥ 3 predicts severe pancreatitis**. The
  output renders the eight-item checklist with each item's met/not-met state, the
  total, and the severity verdict with the source's interpretation. **Class A** — a
  fixed point table. Cross-links [`ranson-bisap`](../app.js) as the parallel acute-
  pancreatitis severity score.

### 2.3 `truelove-witts` — Truelove & Witts severity for acute ulcerative colitis

- **Citation:** Truelove SC, Witts LJ. Cortisone in ulcerative colitis; final report
  on a therapeutic trial. *BMJ.* 1955;2(4947):1041-1048.
- **citationUrl:** https://doi.org/10.1136/bmj.2.4947.1041
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** stools per day; rectal bleeding (none / present); temperature (°C);
  heart rate (bpm); hemoglobin (g/dL); ESR (mm/h).
- **Output:** the **mild / moderate / severe** classification. **Severe = ≥ 6 bloody
  stools per day PLUS at least one of** temperature > 37.8 °C, heart rate > 90 bpm,
  hemoglobin < 10.5 g/dL, or ESR > 30 mm/h; **mild** is < 4 stools/day with minimal
  systemic disturbance; **moderate** is the intermediate band. The output names the
  band, lists which systemic-toxicity criteria are met, and quotes the source's
  interpretation. **Class A** — a fixed classification rule.

### 2.4 `harvey-bradshaw` — Harvey-Bradshaw Index (Crohn's disease activity)

- **Citation:** Harvey RF, Bradshaw JM. A simple index of Crohn's-disease activity.
  *Lancet.* 1980;1(8167):514.
- **citationUrl:** https://doi.org/10.1016/s0140-6736(80)92767-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** general wellbeing (0 very well – 4 terrible); abdominal pain (0 none –
  3 severe); number of liquid/soft stools per day (count); abdominal mass (0 none, 1
  dubious, 2 definite, 3 definite and tender); complications (1 point each:
  arthralgia, uveitis, erythema nodosum, aphthous ulcers, pyoderma gangrenosum, anal
  fissure, new fistula, abscess).
- **Output:** the **total HBI**, with the published bands: **remission < 5; mild
  5–7; moderate 8–16; severe > 16**. The output names the band and quotes the
  source's interpretation. **Class A** — a fixed point table.

### 2.5 `mayo-uc` — Mayo Score / partial Mayo for ulcerative colitis

- **Citation:** Schroeder KW, Tremaine WJ, Ilstrup DM. Coated oral 5-aminosalicylic
  acid therapy for mildly to moderately active ulcerative colitis. *N Engl J Med.*
  1987;317(26):1625-1629.
- **citationUrl:** https://doi.org/10.1056/NEJM198712243172603
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`.
- **Inputs:** stool-frequency subscore (0–3); rectal-bleeding subscore (0–3);
  physician global assessment (0–3); endoscopy subscore (0–3, **optional**).
- **Output:** the **full Mayo score (0–12)** when all four subscores are entered, or
  the **partial Mayo score (0–9)** when the endoscopy subscore is omitted, with the
  remission / mild / moderate / severe bands and a label that states which form was
  computed. The output renders the subscore breakdown and quotes the source's
  interpretation. **Class A** — a fixed point table; the partial-Mayo fallback is a
  defined sub-instrument, not an approximation.

### 2.6 `milan-criteria` — Milan criteria for HCC liver-transplant eligibility

- **Citation:** Mazzaferro V, Regalia E, Doci R, et al. Liver transplantation for the
  treatment of small hepatocellular carcinomas in patients with cirrhosis. *N Engl J
  Med.* 1996;334(11):693-699.
- **citationUrl:** https://doi.org/10.1056/NEJM199603143341104
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `transplant`, `oncology`.
- **Inputs:** number of HCC nodules; size of the largest nodule (cm); sizes of the
  other nodules (cm); macrovascular invasion (yes/no); extrahepatic spread (yes/no).
- **Output:** **"within Milan criteria"** when **a single tumor ≤ 5 cm OR ≤ 3
  nodules each ≤ 3 cm**, **AND** no macrovascular invasion **AND** no extrahepatic
  spread; otherwise **"exceeds Milan criteria,"** naming which limb failed (size/count
  vs. invasion vs. spread). The output quotes the source's eligibility interpretation
  and carries the explicit caveat that it reports the criterion only, not a listing
  decision (§7). **Class A** — a fixed eligibility rule. Cross-links
  [`meld-childpugh`](../app.js) as the mortality-score companion.

## 3. Per-tile robustness

- **`nafld-fibrosis` guards its arithmetic.** The score is a linear combination, but
  the AST/ALT ratio divides by ALT — a blank/zero ALT returns a surfaced
  `valid:false` ("ALT required and must be > 0"), never a `NaN` or `Infinity` term.
  The platelet and albumin terms are range-clamped via `lib/num.js`; the derivation
  `<dl>` shows each weighted term so a clinician can audit the total. No square root
  or logarithm is involved, but the guarded division is exercised by the
  [spec-v59](spec-v59.md) fuzz harness alongside the rest.

- **`glasgow-imrie` is boolean threshold logic** over eight 48-hour values; each item
  is a single comparison against a fixed cutoff, so the only failure mode is a blank
  input. A blank item is rendered as "not assessed" and **does not** silently count
  as zero toward the total — the output states how many of the eight items were
  scored so a partial 48-hour panel never masquerades as a complete low score.

- **`truelove-witts` clamps and surfaces the severe-definition branch.** The severe
  classification requires the bloody-stool count **plus** a systemic criterion; the
  tile lists exactly which systemic criteria were met, so the verdict is auditable and
  a near-miss (≥ 6 bloody stools but no systemic toxicity) is reported as the band it
  actually falls in, not rounded up.

- **`harvey-bradshaw` and `mayo-uc` clamp every subscore** to its published range
  via `lib/num.js`; an out-of-range entry is clamped and the clamp is surfaced. The
  Mayo **partial-vs-full fallback** keys on whether the endoscopy subscore is present:
  omitted → partial Mayo (0–9) with its own bands; present → full Mayo (0–12). The
  rendered label always states which instrument produced the number, so a partial
  score is never read against the full-score bands.

- **`milan-criteria` is pure decision logic** with one numeric comparison per limb;
  it guards against a nodule count of zero or a missing largest-size by returning a
  surfaced "size and count required" rather than a vacuous "within." The
  size/count limb is evaluated as the documented OR (single ≤ 5 cm **or** ≤ 3 each
  ≤ 3 cm) and the invasion/spread limbs as hard AND-gates.

- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's per-band interpretation; none authors a treatment or listing recommendation
  in Sophie's voice ([spec-v11](spec-v11.md) §5.3). Every compute function uses
  `lib/num.js` and joins the [spec-v59](spec-v59.md) `fuzz-tools` harness on import,
  with zero non-finite leaks as a merge gate.

## 4. CI/CD & maintenance

All six tiles are **Class A** under the [spec-v85](spec-v85.md) §6.3 maintenance
taxonomy: each is a **stable, fixed published derivation** — the Angulo 2007 NFS
regression coefficients, the Imrie 1984 eight-item point table, the Truelove-Witts
1955 classification thresholds, the Harvey-Bradshaw 1980 index, the Schroeder 1987
Mayo subscores, and the Mazzaferro 1996 size/count rule. None is a society threshold
that revises on a calendar.

Consequently **no tile in v93 carries a `docs/citation-staleness.md` row**, and none
trips the `check-citations.mjs` `ISSUER_PATTERN` gate (the citations name journals and
the original authors, not a recurring guideline issuer). This is the correct
classification, not an omission.

Class A status does **not** mean "never reviewed." Per [spec-v85](spec-v85.md) §6.3
and §6.4, every Class A citation is **periodically re-verified for retraction or
supersession** in the routine README-stats / citation pass — the standing check that
the source paper still stands and has not been withdrawn or replaced by a corrected
derivation. That review is the **only** maintenance these tiles need; their math is
fixed and they never enter the §6.4 guideline-update workflow (which exists for
Class B threshold revisions).

Build and gating follow the [spec-v85](spec-v85.md) §6.2 gate table verbatim:

- the new module is added to `test/unit/fuzz-tools.test.js` `MODULES` (zero
  non-finite leaks across fuzzed inputs — the `nafld-fibrosis` AST/ALT division is the
  one guarded domain);
- the `META` worked example for each tile renders **verbatim** on the page and is
  pinned by the **`example-correctness`** sweep (chromium-only, flake-prone under CPU
  load, CI `retries:2` — rerun isolated to confirm);
- `check-catalog-truth.mjs` enforces the **13 catalog-count surfaces** all equal
  `UTILITIES.length = 401`, and `grep-check.mjs` confirms the count strings agree
  across README/index/package;
- `a11y-check.mjs`, `mobile-no-hscroll`, `mobile-touch-targets`, and the `all-tools` /
  `smoke` Playwright routes cover the new renderers;
- `data:verify` is unchanged — v93 touches no `data/` directory ([spec-v85](spec-v85.md)
  §5).

## 5. Files touched

```
docs/spec-v93.md                         (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v19 renderers into RENDERERS)
lib/hepgi-v93.js                         (new module: nafldFibrosis, glasgowImrie, trueloveWitts, harveyBradshaw, mayoUc, milanCriteria)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to meld-childpugh, fib4, apri, ranson-bisap)
views/group-v19.js                       (new renderer module: 6 renderers; NFS derivation, Imrie/HBI checklists, Truelove-Witts criteria, Mayo subscores + partial toggle, Milan limbs)
docs/clinical-citations.md               (+6 rows for the hepatology/GI disease-activity sources)
test/unit/nafld-fibrosis.test.js         (new; ≥3 boundary worked examples incl. the −1.455 and 0.676 cutoffs and the ALT-zero guard)
test/unit/glasgow-imrie.test.js          (new; ≥3 incl. the ≥3 severe threshold and a partial-panel case)
test/unit/truelove-witts.test.js         (new; ≥3 incl. the severe definition and a near-miss into moderate)
test/unit/harvey-bradshaw.test.js        (new; ≥3 incl. each band edge)
test/unit/mayo-uc.test.js                (new; ≥3 incl. partial vs full Mayo and a band flip)
test/unit/milan-criteria.test.js         (new; ≥3 incl. single-5cm vs 3×3cm edges and an invasion-fail case)
test/unit/fuzz-tools.test.js             (add lib/hepgi-v93.js to MODULES)
docs/audits/v12/nafld-fibrosis.md, glasgow-imrie.md, truelove-witts.md, harvey-bradshaw.md, mayo-uc.md, milan-criteria.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 395 -> 401; append to the running ledger)
CHANGELOG.md                             (Unreleased: v93 entry, +6)
README.md, package.json                  (catalog count 395 -> 401; spec-progression line -> v93)
```

No `docs/citation-staleness.md` row is needed — all six tiles are Class A (§4).

## 6. Acceptance criteria

v93 is fully shipped when:

- All 6 tiles in §2 are live in their stated group (`G`) with a `META[id]` entry, an
  inline primary citation + `citationUrl` + `accessed`, ≥ 3 boundary worked examples
  in the unit test (including the band-flip and guard cases below), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 scope
  check.
- `nafld-fibrosis` computes the NFS, places a value below **−1.455** in the
  excludes-advanced-fibrosis band, a value above **0.676** in the advanced-fibrosis
  band, and a between-cutoffs value as indeterminate; a blank/zero ALT returns the
  surfaced guard rather than a non-finite score.
- `glasgow-imrie` totals the eight items at one point each and flags **severe at
  ≥ 3**, and a partial panel reports how many items were scored.
- `truelove-witts` returns **severe** only for **≥ 6 bloody stools/day plus ≥ 1
  systemic criterion** (temp > 37.8 °C, HR > 90, Hgb < 10.5 g/dL, ESR > 30),
  naming the met criteria, and returns mild/moderate otherwise.
- `harvey-bradshaw` returns remission (< 5), mild (5–7), moderate (8–16), and severe
  (> 16) at the stated edges.
- `mayo-uc` returns the **full Mayo (0–12)** with all four subscores and the
  **partial Mayo (0–9)** when endoscopy is omitted, labeling which form was computed
  and applying the matching bands.
- `milan-criteria` returns "within" for a single tumor ≤ 5 cm **and** for ≤ 3 nodules
  each ≤ 3 cm, returns "exceeds" when a count/size, macrovascular-invasion, or
  extrahepatic-spread limb fails, and names the failing limb.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All six tiles are Class A; **no `docs/citation-staleness.md` row** is added, and
  `check-citations.mjs` passes without one (§4).
- `UTILITIES.length` is **401** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) — the 13 enforced count surfaces and the README/index/
  package count strings — agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v93 with the **+6** catalog delta (395 → 401).

## 7. Out of scope for v93

- **No endoscopic-image or UCEIS scoring.** `mayo-uc` accepts the physician's
  endoscopy *subscore* as an input; it does not grade an image, and the UCEIS and
  other image-derived endoscopic indices are not in this spec. ([spec-v29](spec-v29.md)
  §3 — the tile computes from an entered value, it is not an image reader.)
- **No biopsy substitute claim.** `nafld-fibrosis` is a non-invasive **triage
  estimate** in the indeterminate-zone tradition of FIB-4/APRI; the tile reports the
  source's band interpretation and does not claim to replace liver biopsy or
  elastography.
- **No transplant-listing decision.** `milan-criteria` reports eligibility **per the
  Milan criteria only**. Listing is a multidisciplinary decision involving MELD
  allocation, downstaging protocols, UCSF/extended criteria, and center policy; the
  tile does not adjudicate it ([spec-v11](spec-v11.md) §5.3, [spec-v85](spec-v85.md)
  §9 no-auto-disposition).
- **No treatment recommendation.** The IBD activity tiles report the band and the
  source's stated interpretation; the admit / IV-steroid / biologic / surgery decision
  stays with the clinician and local protocol.
