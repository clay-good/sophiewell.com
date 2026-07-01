# spec-v190.md — Diagnostic lab indices: APRI, Ganzoni iron deficit, absolute neutrophil count, Light's criteria, and the Matsuda insulin-sensitivity index (+5 tiles)

> Status: **PROPOSED (2026-06-30).** Third feature spec of the
> **Acute, Perioperative & Diagnostic Quantitation** program
> ([spec-v188](spec-v188.md) §1.1), implementing the **diagnostic lab-index**
> cluster. Adds **5** deterministic laboratory-derived tools that fill confirmed
> gaps across hepatology, hematology, pulmonology, and endocrinology: the catalog
> carries FIB-4, NAFLD fibrosis, the transferrin-saturation interpreter, and the
> Mentzer index, but not the AST-platelet ratio, the total iron deficit, the
> absolute neutrophil count, the pleural-fluid exudate classifier, or the
> OGTT-derived insulin sensitivity. None duplicates a live tile (all five checked
> absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v190 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis or treatment order in Sophie's
> voice**). **Every coefficient, ratio cut-point, and iron/BSA constant is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

Some of the most-used bedside calculations are single-line laboratory ratios that
turn routine labs into a graded index: the fibrosis estimate from AST and
platelets, the iron a patient is short, the neutrophil count that defines
neutropenia, whether a pleural effusion is an exudate, and how insulin-sensitive a
patient is on an OGTT. v190 ships these five. Each is a transparent formula or
criteria set — auditable, unit-tested at every cut-point — and each is decision
support, **never a diagnosis or a treatment order**.

## 2. What v190 adds (5 tiles)

### 2.1 `apri` — AST to Platelet Ratio Index

- **Citation:** Wai C-T, Greenson JK, Fontana RJ, et al. A simple noninvasive index
  can predict both significant fibrosis and cirrhosis in patients with chronic
  hepatitis C. *Hepatology.* 2003;38(2):518-526.
- **citationUrl:** https://doi.org/10.1053/jhep.2003.50346
- **Group:** E (clinical math). **Specialties:** `hepatology`, `gastroenterology`,
  `internal-medicine`.
- **Inputs:** AST, the AST upper limit of normal (default 40 U/L), and the platelet
  count (×10⁹/L). **APRI = (AST / AST-ULN) × 100 / platelets**.
- **Output:** the **APRI**, banded against the published cut-points (≤ 0.5 unlikely
  significant fibrosis; ≥ 1.0 suggests significant fibrosis; ≥ 2.0 suggests
  cirrhosis *(verify at implementation, [spec-v97](spec-v97.md))*), stating the ULN
  used. Class A. Cross-links `fib4` and the NAFLD fibrosis tile.

### 2.2 `ganzoni-iron-deficit` — Total Iron Deficit (Ganzoni)

- **Citation:** Ganzoni AM. Intravenous iron-dextran: therapeutic and experimental
  possibilities. *Schweiz Med Wochenschr.* 1970;100(7):301-303.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/5413918/
- **Group:** F (specialized dosing). **Specialties:** `hematology`, `nephrology`,
  `gastroenterology`, `pharmacy`.
- **Inputs:** weight (kg), current hemoglobin, target hemoglobin (default 15 g/dL),
  and the iron stores to replace (default 500 mg for adults ≥ 35 kg). **Total iron
  deficit (mg) = weight × (target Hb − actual Hb) × 2.4 + iron stores** *(verify
  the 2.4 factor and store defaults at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **total iron deficit (mg)** naming the target Hb and store value
  used, framed as a replacement estimate, not a specific product dose. Class A.
  Cross-links the transferrin-saturation interpreter.

### 2.3 `anc` — Absolute Neutrophil Count & Neutropenia Grade

- **Citation:** the ANC = WBC × (% segmented neutrophils + % band neutrophils) /
  100; severity grading per the NCI Common Terminology Criteria for Adverse Events
  (CTCAE v5.0) and the standard febrile-neutropenia thresholds.
- **citationUrl:** https://ctep.cancer.gov/protocolDevelopment/electronic_applications/ctc.htm
- **Group:** E. **Specialties:** `hematology`, `oncology`, `infectious-disease`,
  `internal-medicine`.
- **Inputs:** the WBC (×10⁹/L or cells/µL, unit-toggled) and the differential
  percentages of segmented neutrophils and bands. Computes the **ANC**.
- **Output:** the **ANC (cells/µL)**, banded (normal ≥ 1500; mild 1000–1500;
  moderate 500–1000; **severe < 500**; profound < 100 *(verify at implementation,
  [spec-v97](spec-v97.md))*), naming the febrile-neutropenia threshold. Class A.
  The implementing session confirms whether the CTCAE acronym trips
  `ISSUER_PATTERN` and adds a staleness row only if it does. Cross-links the
  Mentzer / anemia tiles.

### 2.4 `light-criteria` — Light's Criteria (pleural effusion exudate vs transudate)

- **Citation:** Light RW, Macgregor MI, Luchsinger PC, Ball WC. Pleural effusions:
  the diagnostic separation of transudates and exudates. *Ann Intern Med.*
  1972;77(4):507-513.
- **citationUrl:** https://doi.org/10.7326/0003-4819-77-4-507
- **Group:** G (clinical classification). **Specialties:** `pulmonology`,
  `internal-medicine`, `emergency-medicine`.
- **Inputs:** pleural and serum protein, pleural and serum LDH, and the serum LDH
  upper limit of normal. The effusion is an **exudate if any one** of: pleural/serum
  protein > 0.5; pleural/serum LDH > 0.6; pleural LDH > two-thirds of the serum LDH
  ULN.
- **Output:** **exudate vs transudate**, naming which of the three criteria were
  met, with the note that Light's criteria are highly sensitive (may misclassify a
  transudate on diuretics as an exudate — consider the serum-effusion albumin
  gradient). Class A. Cross-links the acid-base / fluid-analysis tiles.

### 2.5 `matsuda-index` — Matsuda Insulin Sensitivity Index (OGTT)

- **Citation:** Matsuda M, DeFronzo RA. Insulin sensitivity indices obtained from
  oral glucose tolerance testing: comparison with the euglycemic insulin clamp.
  *Diabetes Care.* 1999;22(9):1462-1470.
- **citationUrl:** https://doi.org/10.2337/diacare.22.9.1462
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** fasting glucose and insulin, plus the mean glucose and mean insulin
  across the OGTT (or the 30/60/90/120-minute values from which the means are
  computed). **Matsuda ISI = 10000 / √(fasting glucose × fasting insulin × mean
  glucose × mean insulin)** *(verify the constant and units at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **Matsuda index**, with the interpretive note that lower values
  indicate greater insulin resistance (a whole-body sensitivity measure
  complementary to the fasting-only HOMA-IR). Class A. Cross-links `homa-ir` and
  `quicki`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  APRI guards platelets > 0 and AST-ULN > 0; Ganzoni guards target > actual Hb;
  ANC guards WBC ≥ 0 and the percentage sum; Light's guards the serum
  denominators; Matsuda guards the radicand > 0 before the square root; outside
  these each tile renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **`matsuda-index` refuses a negative or zero radicand** (the square-root domain
  guard is explicit), the [spec-v59](spec-v59.md) contract on a formula with a
  root.
- **`light-criteria` reports which criterion fired and the false-exudate caveat**,
  so the classification is never read out of clinical context.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the divisor and radicand edges.
- **These index and classify; they are not diagnoses.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a diagnosis or treatment in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed formulas /
  criteria sets, each cited by journal + authors. The `anc` grading references
  CTCAE; the implementing session confirms whether that acronym trips
  `ISSUER_PATTERN` at build time and adds a `docs/citation-staleness.md` row only
  if it matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/labindices-v190.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v190.js`; its `RV190` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hepatology`,
  `gastroenterology`, `internal-medicine`, `hematology`, `nephrology`, `pharmacy`,
  `oncology`, `infectious-disease`, `pulmonology`, `emergency-medicine`,
  `endocrinology` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v190.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v190 RV190 into RENDERERS)
lib/labindices-v190.js                   (new: apri, ganzoniIronDeficit, anc, lightCriteria, matsudaIndex)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to fib4, homa-ir, quicki)
views/group-v190.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/apri.test.js, ganzoni-iron-deficit.test.js, anc.test.js, light-criteria.test.js, matsuda-index.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/labindices-v190.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-acute-periop-quantitation.md  (record the v190 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v190 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **APRI
  crossing the 1.0 and 2.0 cut-points**, a **Ganzoni deficit with the stores term**,
  an **ANC crossing the severe-neutropenia (< 500) threshold**, a **Light's
  exudate-vs-transudate pair**, and a **Matsuda index illustrating insulin
  resistance**.
- Every compute is finite/positive-guarded (including the Matsuda square-root
  domain), routes through `lib/num.js`, and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v190 with the +5 delta.

## 7. Out of scope for v190

- **No diagnosis** — the indices classify and grade; the diagnosis stays with the
  clinician and the full picture ([spec-v11](spec-v11.md) §5.3).
- **No specific iron-product order** — `ganzoni-iron-deficit` reports the total
  deficit; the product, route, and schedule stay with the prescriber.
- **No OGTT protocol automation** — `matsuda-index` computes from entered values;
  it does not run or time the tolerance test.
