# spec-v107.md — ED decision rules & resuscitation: HEAR, New Orleans head, GO-FAR, and MACOCHA (+4 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 2 — Emergency / trauma / toxicology /
> environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)). Adds **4**
> deterministic emergency-department decision rules and resuscitation-risk scores
> that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v107 close: **463 + 4 = 467 tiles** (v106 closed at 463, not the
> 464 originally projected — spec-v102 deferred `gwtg-hf`, leaving the running count
> one below the program projection; the §6 acceptance "live count + 4" governs).
> Shipped via `lib/eddecision-v107.js` + `views/group-v32.js` (`RV32`); cross-links
> resolved to live ids (`heart`/`edacs`/`timi`, `pecarn-head`/`catch-head`,
> `apache2`/`qsofa-sofa`) since `canadian-ct-head`/`timi-nstemi` are not in the catalog.
>
> Every prior spec (v4 through v106) remains in force. v107 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog carries the chest-pain (`heart`, `edacs`), head-CT (`canadian-ct-head`,
`pecarn-head`), and ICU-physiology (`qsofa-sofa`, `apache2`) clusters, but four
standard ED/resuscitation rules sit in the gaps between them:

- **No HEAR score.** The troponin-free subset of HEART (History + ECG + Age +
  Risk) used as a very-low-risk pre-troponin gate is absent; the catalog has
  `heart` but not its biomarker-free precursor.
- **No New Orleans Head Trauma Criteria.** The 7-item rule for whether a
  GCS-15 minor-head-injury patient needs CT — the higher-sensitivity companion to
  the Canadian CT Head rule already shipped — is missing.
- **No GO-FAR score.** The pre-arrest probability of good-neurologic-outcome
  survival after in-hospital cardiac arrest, used in code-status conversations,
  has no tile.
- **No MACOCHA score.** The ICU difficult-intubation predictor (patient +
  pathology + operator factors) is absent; the catalog has airway anatomy tools
  but not this validated ICU risk score.

Each is a published, deterministic instrument a clinician already uses; v107
brings them onto the page.

## 2. What v107 adds (4 tiles)

### 2.1 `hear` — HEAR Score (HEART minus troponin)

- **Citation:** Moumneh T, Sun BC, Baecker A, et al. Identifying patients with
  low risk of acute coronary syndrome without troponin testing: validation of the
  HEAR score. *Eur J Emerg Med.* 2021;28(4):292-298; building on the HEART score
  (Six 2008).
- **citationUrl:** https://doi.org/10.1097/MEJ.0000000000000792
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `nursing-ed`.
- **Inputs:** the four HEAR domains scored 0–2 each — History (slightly/
  moderately/highly suspicious), ECG (normal / nonspecific repolarization /
  significant ST deviation), Age (< 45 / 45–64 / ≥ 65), and Risk factors
  (0 / 1–2 / ≥ 3 or atherosclerotic disease).
- **Output:** the **total (0–8)** with the very-low-risk flag (HEAR ≤ 1, the
  published rule-out band), naming the band. Class A. Cross-links the existing
  `heart` tile as the troponin-inclusive successor.

### 2.2 `new-orleans-head` — New Orleans Head Trauma Criteria

- **Citation:** Haydel MJ, Preston CA, Mills TJ, Luber S, Blaudeau E, DeBlieux
  PMC. Indications for computed tomography in patients with minor head injury. *N
  Engl J Med.* 2000;343(2):100-105.
- **citationUrl:** https://doi.org/10.1056/NEJM200007133430204
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`, `nursing-er`.
- **Inputs:** the 7 criteria — headache, vomiting, age > 60, drug/alcohol
  intoxication, persistent anterograde amnesia (short-term memory deficit),
  visible trauma above the clavicle, and seizure — each yes/no. Applies only to
  GCS-15 minor head injury (stated as the entry condition).
- **Output:** a **CT-indicated if any positive vs no-CT-needed** verdict, naming
  which criterion/criteria flagged. Class A. Cross-links the existing
  `canadian-ct-head` tile (the higher-specificity companion).

### 2.3 `go-far` — GO-FAR Score (good-outcome survival after IHCA)

- **Citation:** Ebell MH, Jang W, Shen Y, Geocadin RG (for the Get With the
  Guidelines–Resuscitation Investigators). Development and validation of the
  Good Outcome Following Attempted Resuscitation (GO-FAR) score. *JAMA Intern
  Med.* 2013;173(20):1872-1878.
- **citationUrl:** https://doi.org/10.1001/jamainternmed.2013.10037
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `internal-medicine`, `nursing-icu`.
- **Inputs:** the weighted pre-arrest variables — neurologically intact/minimal
  deficit at admission, major trauma, acute stroke, metastatic/hematologic cancer,
  septicemia, medical noncardiac diagnosis, hepatic insufficiency, admitted from
  a skilled-nursing facility, hypotension/hypoperfusion, renal/respiratory
  insufficiency, pneumonia, and age bands.
- **Output:** the **point total** mapped to the published **probability-of-good-
  neurologic-survival categories** (above average / average / low / very low),
  naming the category. Class A.

### 2.4 `macocha` — MACOCHA Score (ICU difficult intubation)

- **Citation:** De Jong A, Molinari N, Terzi N, et al. Early identification of
  patients at risk for difficult intubation in the intensive care unit:
  development and validation of the MACOCHA score in a multicenter cohort study.
  *Am J Respir Crit Care Med.* 2013;187(8):832-839.
- **citationUrl:** https://doi.org/10.1164/rccm.201210-1851OC
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `anesthesiology`, `emergency-medicine`,
  `nursing-icu`.
- **Inputs:** the 7 weighted factors — Mallampati III/IV (5), obstructive
  sleep-apnea syndrome (2), reduced cervical mobility (1), limited mouth opening
  < 3 cm (1), coma (1), severe hypoxemia < 80% (1), and non-anesthesiologist
  operator (1).
- **Output:** the **total (0–12)** with the difficult-intubation-risk framing
  (higher = greater risk; ≥ 3 in the original cohort flags elevated risk), naming
  the contributing factors. Class A.

## 3. Per-tile robustness

- **All four are bounded criteria/threshold logic.** `hear`, `go-far`, and
  `macocha` sum weighted items and clamp the total to the published range;
  `new-orleans-head` applies an any-positive rule. Each names which items were
  counted and flows through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.
- **`new-orleans-head` states its entry condition** (GCS 15) in the rendered
  derivation; it is a rule-out aid, not a substitute for clinical judgment in the
  non-GCS-15 patient, and the posture note says so.
- **`go-far`'s category mapping is exact** — the point total maps to the four
  published outcome categories by fixed cut-points; a blank required input renders
  a complete-the-fields fallback rather than a category from a partial total.
- All four render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a CT order, an intubation plan, or a
  code-status recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3) —
  `go-far` carries the explicit note that the score informs, never decides, a
  goals-of-care discussion.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all four tiles are **Class A** — each cites a
  fixed derivation paper (Eur J Emerg Med, NEJM, JAMA Intern Med, AJRCCM) by
  **journal + authors**, not an issuing society, so none trips `ISSUER_PATTERN`
  and **none gets a `docs/citation-staleness.md` row.**
- **Module & gates (§6.2):** the compute module is **`lib/eddecision-v107.js`**
  (exports `hear`, `newOrleansHead`, `goFar`, `macocha`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks). The
  renderer module is **`views/group-v32.js`**; its `RV32` export is added to the
  `app.js` `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v32.js`.

## 5. Files touched

```
docs/spec-v107.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v32 renderers (RV32) into RENDERERS)
lib/eddecision-v107.js                   (new module: hear, newOrleansHead, goFar, macocha)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to heart, edacs, canadian-ct-head, pecarn-head)
views/group-v32.js                       (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows for the four sources)
test/unit/hear.test.js, new-orleans-head.test.js, go-far.test.js, macocha.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/eddecision-v107.js to MODULES)
docs/audits/v12/hear.md, new-orleans-head.md, go-far.md, macocha.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 464 -> 468; Wave 2 progress in the running ledger)
CHANGELOG.md                             (Unreleased: v107 entry, +4)
README.md, package.json                  (catalog count 464 -> 468; spec-progression line -> v107)
```

## 6. Acceptance criteria

v107 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all four ids are absent (`hear`, `new-orleans-head`, `go-far`, `macocha`).
- All 4 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  including a **band-flip per tile** (HEAR: total crossing 1 into the
  not-very-low band; New Orleans: one positive criterion flipping no-CT→CT; GO-FAR:
  total crossing a category cut-point; MACOCHA: total crossing 3 into elevated
  risk), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; partial inputs
  render a complete-the-fields fallback.
- No Class B tile in this spec → **no `docs/citation-staleness.md` row** (all four
  cite journal + authors).
- `UTILITIES.length` is **468** (or the then-current live count + 4 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v107 with the +4 catalog delta.

## 7. Out of scope for v107

- **No auto-CT, auto-intubation, or auto-resuscitation order** — each tile reports
  the rule's verdict/score and the source's stated interpretation; the image/
  airway/code-status decision stays with the clinician and local protocol.
- **No HEART duplication** — `hear` is the pre-troponin subset; `heart` (live)
  adds the troponin. Cross-linked, both kept.
- **No replacement of `canadian-ct-head`/`pecarn-head`** — `new-orleans-head` is a
  distinct, higher-sensitivity adult rule; the clinician selects the rule that
  fits the patient and local protocol.
