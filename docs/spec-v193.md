# spec-v193.md — Infectious disease & community-acquired-pneumonia severity: modified Duke criteria, the Pneumonia Severity Index, and SMART-COP (+3 tiles)

> Status: **PROPOSED (2026-06-30).** Second feature spec of the **Acute Triage &
> Specialty Severity** program ([spec-v192](spec-v192.md) §1.1), implementing the
> **infectious-disease / CAP-severity** cluster. Adds **3** deterministic
> instruments that fill a confirmed gap: the catalog carries SIRS, qSOFA, CURB-65,
> SOFA, and the DECAF COPD-exacerbation score, but not the endocarditis criteria,
> the Pneumonia Severity Index (PORT), or the SMART-COP prediction of intensive
> respiratory/vasopressor support. None duplicates a live tile (all three checked
> absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v193 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no admission, antibiotic, or ICU order in
> Sophie's voice**). **Every criterion, point weight, and risk band is re-fetched
> and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

Two of the most consequential ID decisions — is this endocarditis, and how sick
is this pneumonia — rest on fixed criteria and point scores the catalog is
missing. v193 ships the modified Duke criteria (definite / possible / rejected
endocarditis), the Pneumonia Severity Index (the PORT class that guides the
admit-vs-discharge decision), and SMART-COP (which flags the patient who will need
intensive respiratory or vasopressor support). Each is a transparent criteria set
or point score — auditable, unit-tested at every class boundary — and each is
decision support, **never an admission, antibiotic, or ICU order**.

## 2. What v193 adds (3 tiles)

### 2.1 `duke-criteria` — Modified Duke Criteria for Infective Endocarditis

- **Citation:** Li JS, Sexton DJ, Mick N, et al. Proposed modifications to the Duke
  criteria for the diagnosis of infective endocarditis. *Clin Infect Dis.*
  2000;30(4):633-638. (The tile notes the 2023 Duke-ISCVID update by Fowler VG, et
  al. *Clin Infect Dis.* 2023.)
- **citationUrl:** https://doi.org/10.1086/313753
- **Group:** G (clinical classification). **Specialties:** `infectious-disease`,
  `cardiology`, `internal-medicine`.
- **Inputs:** the **major criteria** (typical blood cultures / persistent
  bacteremia; endocardial involvement on echo or a new regurgitant murmur) and the
  **minor criteria** (predisposition, fever ≥ 38 °C, vascular phenomena,
  immunologic phenomena, microbiologic evidence not meeting a major criterion),
  entered as counts/toggles.
- **Output:** **definite / possible / rejected** endocarditis by the rule
  (2 major, or 1 major + 3 minor, or 5 minor = definite; 1 major + 1 minor, or
  3 minor = possible), naming which criteria were met and stating that the criteria
  support — but do not replace — the clinical diagnosis. Class A. Cross-links the
  sepsis / bacteremia tiles.

### 2.2 `psi-port` — Pneumonia Severity Index (PORT)

- **Citation:** Fine MJ, Auble TE, Yealy DM, et al. A prediction rule to identify
  low-risk patients with community-acquired pneumonia. *N Engl J Med.*
  1997;336(4):243-250.
- **citationUrl:** https://doi.org/10.1056/NEJM199701233360402
- **Group:** G. **Specialties:** `infectious-disease`, `pulmonology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** the demographic (age, sex, nursing-home residence), comorbidity
  (neoplastic, liver, heart failure, cerebrovascular, renal), exam (altered mental
  status, RR ≥ 30, SBP < 90, temp < 35 or ≥ 40 °C, pulse ≥ 125), and laboratory /
  imaging (pH < 7.35, BUN ≥ 30 mg/dL, sodium < 130, glucose ≥ 250, hematocrit < 30,
  PaO₂ < 60, pleural effusion) variables, each with its published weight.
- **Output:** the **total points** mapped to the **PORT risk class I–V** with the
  associated 30-day mortality and the outpatient-vs-inpatient guidance
  *(band edges verified at implementation, [spec-v97](spec-v97.md))*, naming the
  contributors. Class A. Cross-links `curb-65`.

### 2.3 `smart-cop` — SMART-COP (intensive respiratory / vasopressor support)

- **Citation:** Charles PGP, Wolfe R, Whitby M, et al. SMART-COP: a tool for
  predicting the need for intensive respiratory or vasopressor support in
  community-acquired pneumonia. *Clin Infect Dis.* 2008;47(3):375-384.
- **citationUrl:** https://doi.org/10.1086/589754
- **Group:** G. **Specialties:** `infectious-disease`, `pulmonology`,
  `critical-care`, `emergency-medicine`.
- **Inputs:** the SMART-COP variables with their age-adjusted thresholds — low
  Systolic BP (2), Multilobar infiltrates (1), low Albumin (1), high Respiratory
  rate (1), Tachycardia (1), Confusion (1), low Oxygen (2, age-adjusted), and low
  arterial pH (2).
- **Output:** the **score** mapped to the risk of needing intensive respiratory or
  vasopressor support (low / moderate / high / very high *(bands verified at
  implementation, [spec-v97](spec-v97.md))*), naming the contributors and stating
  that the O₂ and RR thresholds are age-adjusted. Class A. Cross-links `psi-port`
  and `curb-65`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The point
  sums clamp their inputs to the published ranges before banding; a blank required
  field renders a complete-the-fields fallback rather than a partial class read as
  complete.
- **`smart-cop` applies the age-adjusted O₂ and RR thresholds explicitly** (the
  under-50 vs 50-and-over cut-points), so the score is never computed against the
  wrong threshold ([spec-v59](spec-v59.md) output-safety).
- **`duke-criteria` renders the "support, not replace, the clinical diagnosis"
  framing as first-class output.**
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the class boundaries.
- **These classify and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors an admission, antibiotic,
  or ICU order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed criteria sets /
  point scores, each cited by journal + authors. The implementing session confirms
  the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at
  build time and adds a `docs/citation-staleness.md` row only if a society issuer
  matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/idseverity-v193.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v193.js`; its `RV193` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 3**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `infectious-disease`,
  `cardiology`, `internal-medicine`, `pulmonology`, `emergency-medicine`,
  `critical-care` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v193.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v193 RV193 into RENDERERS)
lib/idseverity-v193.js                   (new: dukeCriteria, psiPort, smartCop)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to curb-65)
views/group-v193.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/duke-criteria.test.js, psi-port.test.js, smart-cop.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/idseverity-v193.js to MODULES)
docs/audits/v12/*.md                     (3 spec-v11 audit logs)
docs/scope-acute-triage-severity.md      (record the v193 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v193 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids are absent.
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Duke
  definite-vs-possible pair**, a **PSI class boundary crossing (e.g., III → IV)**,
  and a **SMART-COP example using the age-adjusted O₂ threshold**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v193 with the +3 delta.

## 7. Out of scope for v193

- **No admission / disposition order** — PSI and SMART-COP stratify severity; the
  admit-vs-discharge and ICU decisions stay with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No antibiotic selection** — the tiles quantify severity; empiric therapy stays
  with the clinician and local antibiogram.
- **No echo interpretation** — `duke-criteria` consumes the echo finding as an
  input; it does not read the study.
