# spec-v190.md — Hepatology & GI advanced indices: PALBI grade, MELD-Na, the Clichy acute-liver-failure criteria, and the Rome IV IBS criteria (+4 tiles)

> Status: **SHIPPED (2026-07-01).** Advances the long-horizon
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment. Adds **4**
> deterministic hepatology / GI instruments, **each verified absent by a direct
> scan of `app.js`** (zero id / name / keyword hits): the catalog carries
> `albi-grade`, `meld-3.0`, `maddrey-lille`, `fib4`, `apri`, `nafld-fibrosis`, the
> UGI-bleeding scores, and the IBD activity indices, but not the platelet-augmented
> ALBI grade, the sodium-augmented MELD, the Clichy ALF transplant criteria, or the
> Rome IV diagnostic criteria for IBS.
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v190 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no transplant-referral or diagnosis order in
> Sophie's voice**). **Every coefficient, grade boundary, and criterion is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

Four deterministic hepatology / GI instruments the catalog is missing: the
**PALBI** grade (which adds the platelet count to ALBI for a finer HCC / cirrhosis
liver-function grade), **MELD-Na** (the sodium-augmented waitlist mortality score
that preceded and underlies MELD 3.0), the **Clichy criteria** (the French ALF
transplant criteria, a complement to the live King's College criteria), and the
**Rome IV** diagnostic criteria for irritable bowel syndrome. Each is a transparent
formula or criteria set — auditable, unit-tested at every boundary — and each is
decision support, **never a referral or diagnosis order**.

## 2. What v190 adds (4 tiles)

### 2.1 `palbi` — Platelet-Albumin-Bilirubin (PALBI) Grade

- **Citation:** Liu PH, Hsu CY, Hsia CY, et al. ALBI and PALBI grade predict
  survival for HCC across treatment modalities. *J Gastroenterol Hepatol.*
  2017;32(4):879-886.
- **citationUrl:** https://doi.org/10.1111/jgh.13608
- **Group:** E (clinical math). **Specialties:** `hepatology`, `oncology`,
  `gastroenterology`.
- **Inputs:** serum bilirubin, albumin, and platelet count. Computes the **PALBI
  linear predictor** (the published log-transformed weighted sum) and maps it to
  **grade 1 / 2 / 3** *(verify the coefficients and grade cut-points at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **PALBI score and grade**, naming the inputs; the tile notes PALBI
  refines the live `albi-grade` by adding thrombocytopenia (a portal-hypertension
  marker). Class A. Cross-links `albi-grade` and `bclc-hcc` ([spec-v187](spec-v187.md)).

### 2.2 `meld-na` — MELD-Na (sodium-augmented MELD)

- **Citation:** Kim WR, Biggins SW, Kremers WK, et al. Hyponatremia and mortality
  among patients on the liver-transplant waiting list. *N Engl J Med.*
  2008;359(10):1018-1026.
- **citationUrl:** https://doi.org/10.1056/NEJMoa0801209
- **Group:** E. **Specialties:** `hepatology`, `gastroenterology`, `transplant`.
- **Inputs:** bilirubin, INR, creatinine, and serum sodium. Computes the **MELD(i)**
  then **MELD-Na = MELD + 1.32·(137 − Na) − [0.033·MELD·(137 − Na)]**, with sodium
  bounded to 125–137 and the same lab-flooring conventions as MELD *(verify the
  bounds at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **MELD-Na score**, naming the inputs; the tile notes its
  relationship to the live `meld-3.0` (which further adds albumin and a sex
  adjustment) and that dialysis fixes creatinine per the UNOS rule. Class A.
  Cross-links `meld-3.0`.

### 2.3 `clichy` — Clichy Criteria for Acute Liver Failure

- **Citation:** Bernuau J, Goudeau A, Poynard T, et al. Multivariate analysis of
  prognostic factors in fulminant hepatitis B. *Hepatology.* 1986;6(4):648-651.
- **citationUrl:** https://doi.org/10.1002/hep.1840060417
- **Group:** G (clinical classification). **Specialties:** `hepatology`,
  `transplant`, `critical-care`.
- **Inputs:** the presence of hepatic encephalopathy (confusion or coma), the
  **factor V level** (< 20% if age < 30, < 30% if age ≥ 30), and age. The criteria
  are **met** when encephalopathy is present with the age-specific factor-V
  threshold crossed *(verify the thresholds at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** **criteria met / not met**, naming the factor-V threshold used;
  framed as a **transplant-referral / evaluation** indicator complementary to the
  live `kings-college` criteria, not a listing decision. Class A. Cross-links
  `kings-college`.

### 2.4 `rome-iv-ibs` — Rome IV Diagnostic Criteria for Irritable Bowel Syndrome

- **Citation:** Lacy BE, Mearin F, Chang L, et al. Bowel disorders.
  *Gastroenterology.* 2016;150(6):1393-1407.
- **citationUrl:** https://doi.org/10.1053/j.gastro.2016.02.031
- **Group:** G. **Specialties:** `gastroenterology`, `internal-medicine`,
  `primary-care`.
- **Inputs:** recurrent abdominal pain **on average ≥ 1 day/week in the last 3
  months** (with symptom onset ≥ 6 months prior), associated with ≥ 2 of: related
  to defecation, associated with a change in stool frequency, associated with a
  change in stool form. Plus the predominant-stool-pattern selector for the subtype
  (IBS-C / IBS-D / IBS-M / IBS-U).
- **Output:** **criteria met / not met** for IBS and, when met, the **subtype**,
  naming the components; the tile states the criteria assume alarm features are
  absent and do not replace the exclusion of organic disease. Class A. Cross-links
  the GI activity tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** PALBI and
  MELD-Na floor / bound their labs per the published conventions before the
  log / weighted sums; Clichy applies the age-branched factor-V threshold; Rome IV
  encodes the Boolean rule exactly; outside the valid domain each tile renders a
  complete-the-fields fallback, never a `NaN`/`Infinity`.
- **`meld-na` bounds sodium to 125–137 before the correction** so an extreme value
  cannot distort the score — the [spec-v59](spec-v59.md) output-safety contract.
- **`clichy` and `rome-iv-ibs` carry their scope limits in the rendered output**
  (transplant *referral* not listing; organic disease *not excluded*).
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the lab bounds and grade boundaries.
- **These grade, score, and classify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a referral or diagnosis
  order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed formulas /
  criteria sets, each cited by journal + authors. The implementing session confirms
  the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at
  build time and adds a `docs/citation-staleness.md` row only if a society issuer
  matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/hepgi-v190.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v190.js`; its `RV190` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hepatology`,
  `gastroenterology`, `oncology`, `transplant`, `critical-care`,
  `internal-medicine`, `primary-care` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v190.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v190 RV190 into RENDERERS)
lib/hepgi-v190.js                        (new: palbi, meldNa, clichy, romeIvIbs)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to albi-grade, meld-3.0, kings-college, bclc-hcc)
views/group-v190.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/palbi.test.js, meld-na.test.js, clichy.test.js, rome-iv-ibs.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hepgi-v190.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+4; record the v190 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v190 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent (as verified at draft).
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **PALBI
  grade-boundary crossing**, a **MELD-Na with a hyponatremia adjustment**, a
  **Clichy age-branched factor-V pair**, and a **Rome IV met-vs-not pair with a
  subtype**.
- Every compute is finite-guarded (including the sodium bound and the log domains),
  routes through `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz
  harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v190 with the +4 delta.

## 7. Out of scope for v190

- **No transplant listing** — `clichy` and `meld-na` inform referral / prioritization
  discussions; the listing and allocation decisions stay with the transplant center
  and the allocation authority ([spec-v11](spec-v11.md) §5.3).
- **No IBS diagnosis in isolation** — `rome-iv-ibs` reports the criteria; excluding
  organic disease and alarm features stays with the clinician.
