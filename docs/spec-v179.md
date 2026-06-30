# spec-v179.md — Geriatric pharmacotherapy & polypharmacy burden: ACB, ARS, Drug Burden Index, and Medication Regimen Complexity (+4 tiles)

> Status: **SHIPPED 3 of 4 (2026-06-29).** Seventh implementation spec of the
> spec-v172 LTC-GA program; `anticholinergic-burden` (ACB), `anticholinergic-risk-
> scale` (ARS), and `drug-burden-index` (DBI, Group E) are live — each consumes the
> clinician's per-level counts / per-drug doses per the §2 clarification, not a drug
> database, and the DBI ratio is δ>0-guarded. **Deferred:**
> `medication-regimen-complexity` (MRCI) — the 65-item Section A/B/C weight tables
> are paywalled / copyright and could not be byte-verified against ≥ 2 open sources
> at implementation (sourcing gate, spec-v97). Original draft below.
>
> Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program (§3.7). Adds **4** deterministic geriatric-pharmacotherapy instruments
> that quantify cumulative anticholinergic/sedative burden and medication-regimen
> complexity — the polypharmacy quantifiers an LTC deprescribing review reaches
> for beside the live `beers-check`. None duplicates a live tile.
>
> Catalog effect: **live `UTILITIES.length` + 4** (never a number copied from
> this document — the running counts carry a known off-by-one that the
> catalog-truth gate enforces, per the [spec-v100](spec-v100.md) program
> lessons). If the v172 program ships in order this is the prior spec's count + 4.
>
> Every prior spec (v4 through v178) remains in force. v179 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** — and the [spec-v100](spec-v100.md) §6
> CI/CD contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships
> its primary citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the
> [spec-v50](spec-v50.md) §3 clinical-posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (no dosing/deprescribing order in Sophie's voice).
> **Every weight, level, and coefficient is re-fetched and cross-verified against
> ≥2 independent sources at implementation** ([spec-v97](spec-v97.md)); nothing
> here is implemented from recall.

## 1. Thesis

The catalog flags *individual* potentially inappropriate medications through the
live `beers-check`. What an LTC deprescribing review also needs — and the catalog
does not yet carry — is the **cumulative-burden** view: the patient is on twelve
drugs, three of them definitely anticholinergic and two sedating, on a regimen
that takes nine administration steps a day. v179 ships the four deterministic
instruments that turn a medication list into a single burden number a
pharmacist, prescriber, or nurse can act on.

A framing note that governs all four (the [spec-v100](spec-v100.md) §2
**classification-tile clarification**): these scales are published as **per-drug
lookups** — a table that assigns each named medication an anticholinergic level,
an ARS point value, or a minimum-recommended daily dose. The **tile does not
display that drug database.** It **consumes the clinician's entered medication
list / per-drug levels and computes the cumulative burden** — the summed ACB
total, the summed ARS total, the Drug Burden Index, or the Medication Regimen
Complexity Index. The clinician supplies the per-drug inputs from the published
scale; the tile does the deterministic arithmetic and reports the source's
interpretation. This is exactly the §2 distinction between a reference card
(out of scope, fails [spec-v29](spec-v29.md) §3) and a calculator.

- **ACB** — the Anticholinergic Cognitive Burden scale: count the patient's
  medications at each ACB level (1/2/3) → total = Σ (level × count).
- **ARS** — the Anticholinergic Risk Scale: sum the per-drug ARS points (1/2/3).
- **DBI** — the Drug Burden Index: Σ D/(D + δ) across the patient's
  anticholinergic and sedative medications, a guarded sum of ratios.
- **MRCI** — the Medication Regimen Complexity Index: three weighted sections
  (dosage form, dosing frequency, additional directions) summed.

## 2. What v179 adds (4 tiles)

### 2.1 `anticholinergic-burden` — Anticholinergic Cognitive Burden (ACB) scale

- **Citation:** Boustani M, Campbell N, Munger S, Maidment I, Fox C.
  Impact of anticholinergics on the aging brain: a review and practical
  application. *Aging Health.* 2008;4(3):311-320. (Indiana ACB scale — Campbell N,
  et al; the Aging Brain Care / Indiana University list.)
- **citationUrl:** https://doi.org/10.2217/1745509X.4.3.311
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pharmacy`, `geriatrics`, `nursing-general`, `primary-care`.
- **Inputs:** counts of the patient's current medications at each ACB level —
  level 1 (possible anticholinergic), level 2, and level 3 (definite
  anticholinergic). The clinician reads each drug's level from the published ACB
  list and enters the per-level counts; the tile **consumes those counts**, it
  does not display the ACB drug list itself.
- **Output:** the **total ACB score = Σ (level × count)** with the published
  interpretation — **each point of total ACB is associated with increased
  cognitive/functional decline; a total ≥ 3 is commonly treated as clinically
  relevant** (verify the cut-point at implementation, [spec-v97](spec-v97.md)).
  Class A. Cross-links `beers-check` and `anticholinergic-risk-scale`.

### 2.2 `anticholinergic-risk-scale` — Anticholinergic Risk Scale (ARS)

- **Citation:** Rudolph JL, Salow MJ, Angelini MC, McGlinchey RE. The
  Anticholinergic Risk Scale and anticholinergic adverse effects in older
  persons. *Arch Intern Med.* 2008;168(5):508-513.
- **citationUrl:** https://doi.org/10.1001/archinternmed.2007.106
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pharmacy`, `geriatrics`, `internal-medicine`, `primary-care`.
- **Inputs:** counts of the patient's medications at each ARS point value —
  1-point, 2-point, and 3-point drugs (read from the published ARS list). The
  tile **consumes the per-point counts** the clinician enters; it does not display
  the ARS drug list.
- **Output:** the **summed ARS total** (Σ point × count) with the published
  framing — **a higher total is associated with greater risk of anticholinergic
  adverse effects** (peripheral and central; verify the reported risk bands at
  implementation, [spec-v97](spec-v97.md)). Class A. Cross-links
  `anticholinergic-burden` and `beers-check`.

### 2.3 `drug-burden-index` — Drug Burden Index (DBI)

- **Citation:** Hilmer SN, Mager DE, Simonsick EM, et al. A drug burden index to
  define the functional burden of medications in older people. *Arch Intern Med.*
  2007;167(8):781-787.
- **citationUrl:** https://doi.org/10.1001/archinte.167.8.781
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pharmacy`, `geriatrics`, `internal-medicine`, `primary-care`.
- **Inputs:** for each of the patient's anticholinergic and sedative medications,
  the **daily dose taken (D)** and the **minimum recommended daily dose (δ)** for
  that drug (read from the formulary / published method). The tile **consumes the
  per-drug D and δ** the clinician enters; it does not embed a drug-dose database.
- **Output:** the **Drug Burden Index = Σ D/(D + δ)** summed across the entered
  anticholinergic and sedative medications, with the published interpretation
  (**a higher DBI predicts poorer physical and cognitive function in older
  adults**; verify the reported per-unit effect at implementation,
  [spec-v97](spec-v97.md)). **Each D/(D + δ) division is domain-guarded** — δ
  must be finite and positive and D non-negative; a non-finite or zero/blank δ
  yields a surfaced `valid:false` for that drug, never `Infinity`/`NaN`
  ([spec-v59](spec-v59.md)). Class A. Cross-links `anticholinergic-burden` and
  `opioid-mme` (where the sedative load includes opioids).

### 2.4 `medication-regimen-complexity` — Medication Regimen Complexity Index (MRCI)

- **Citation:** George J, Phun YT, Bailey MJ, Kong DCM, Stewart K. Development and
  validation of the medication regimen complexity index. *Ann Pharmacother.*
  2004;38(9):1369-1376.
- **citationUrl:** https://doi.org/10.1345/aph.1D479
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pharmacy`, `geriatrics`, `nursing-general`, `internal-medicine`.
- **Inputs:** per the patient's medication list, the three MRCI sections —
  **Section A** (dosage form, each form carrying its published weight), **Section
  B** (dosing frequency, each frequency carrying its weight), and **Section C**
  (additional administration directions, each carrying its weight). The clinician
  enters the per-medication form/frequency/direction selections; the tile
  **consumes them and sums the weighted sections**.
- **Output:** the **MRCI total** — Section A + Section B + Section C — an
  **unbounded weighted complexity index** (higher = more complex regimen; verify
  each section's weight table at implementation, [spec-v97](spec-v97.md)), with
  the source's interpretation that greater complexity is associated with poorer
  adherence and medication-administration risk. Class A. Cross-links `beers-check`.

## 3. Per-tile robustness

- **`anticholinergic-burden`, `anticholinergic-risk-scale`, and
  `medication-regimen-complexity` are bounded-by-input weighted sums** — each is
  Σ (published weight × the clinician-entered count/selection). They name the
  contributing levels/points/sections so the user can audit the total. The ACB
  level coefficients (1/2/3), the ARS point values (1/2/3), and the three MRCI
  section weight tables are re-fetched verbatim and cross-verified against ≥2
  sources ([spec-v97](spec-v97.md)); band/cut-point boundaries (the ACB ≥3
  clinically-relevant flip) are unit-tested.
- **`drug-burden-index` is a guarded sum of ratios** — DBI = Σ D/(D + δ). Each
  term's denominator δ is finite- and positive-checked and D is non-negative
  before the division; a non-finite, zero, or blank δ for any drug returns a
  surfaced `valid:false` fallback for that term rather than `Infinity`/`NaN`
  ([spec-v59](spec-v59.md)). The tile names which medications contributed and
  their individual D/(D + δ) terms.
- All four render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote
  **the source's** interpretation; **none authors a deprescribing or dosing order
  in Sophie's voice** — the tile reports the burden number and the source's
  interpretation, and the decision (which drug to stop, dose to reduce, or
  regimen to simplify) **stays with the prescriber/pharmacist and local protocol**
  ([spec-v11](spec-v11.md) §5.3). Each adopts the [spec-v50](spec-v50.md) §3
  posture.
- All four flow through the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**; `drug-burden-index` is explicitly fuzzed for the
  division path (every δ denominator finite/positive).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all four tiles —
  `anticholinergic-burden`, `anticholinergic-risk-scale`, `drug-burden-index`,
  and `medication-regimen-complexity` — are **Class A** (fixed
  formulas/weights cited by journal + authors). The implementing session confirms
  at build time whether any citation issuer trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson); these four are
  journal-published author instruments, so no `docs/citation-staleness.md` row is
  expected — but the build, not this document, is authoritative.
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/ltcga-v179.js` module (`anticholinergicBurden`, `anticholinergicRiskScale`,
  `drugBurdenIndex`, `medicationRegimenComplexity`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list — **`drug-burden-index` is
  explicitly fuzzed for the division path** (zero non-finite leaks). Renderers
  live in the new `views/group-v179.js` module; its `RV179` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the live `UTILITIES.length`
  + 4; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v179.js`.
- **Cross-links:** `anticholinergic-burden` ↔ `anticholinergic-risk-scale` ↔
  `beers-check`; `drug-burden-index` → `anticholinergic-burden` + `opioid-mme`;
  `medication-regimen-complexity` → `beers-check`. All are within-catalog id
  references via `META` (no new tile is implied by a cross-link).

## 5. Files touched

```
docs/spec-v179.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups G/G/E/G; import group-v179 RV179 into RENDERERS)
lib/ltcga-v179.js                        (new module: anticholinergicBurden, anticholinergicRiskScale, drugBurdenIndex, medicationRegimenComplexity)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to beers-check, opioid-mme)
views/group-v179.js                      (new renderer module: 4 renderers, RV179)
docs/clinical-citations.md               (+4 rows for the four sources)
test/unit/anticholinergic-burden.test.js, anticholinergic-risk-scale.test.js, drug-burden-index.test.js, medication-regimen-complexity.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v179.js to MODULES; note drug-burden-index is fuzzed for the division path)
docs/audits/v12/anticholinergic-burden.md, anticholinergic-risk-scale.md, drug-burden-index.md, medication-regimen-complexity.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live + 4; record v179 under the LTC-GA program, §3.7)
CHANGELOG.md                             (Unreleased: v179 entry, +4)
README.md, package.json                  (catalog count live + 4; spec-progression line -> v179)
```

## 6. Acceptance criteria

v179 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent.
- All 4 tiles in §2 are live (groups G/G/E/G) with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, **≥3 boundary worked examples
  each, every example carrying a band-flip / worked-sum** — including an **ACB
  2 → 3 clinically-relevant flip**, a worked **ARS sum across the three point
  levels**, a worked **DBI summing two drugs** (each D/(D + δ) term shown), and a
  worked **MRCI sum across Sections A + B + C** — a [spec-v11](spec-v11.md) audit
  log, and a passing [spec-v29](spec-v29.md) §3 check.
- The §2 **classification-tile clarification holds**: each tile consumes the
  clinician-entered per-drug levels/counts/doses and computes the cumulative
  burden; none displays a static drug-classification database.
- `drug-burden-index` **guards each D/(D + δ) division** (δ finite/positive, D
  non-negative) and surfaces `valid:false` for any guarded term; blank inputs
  render a complete-the-fields fallback for all four.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks; `drug-burden-index` is in the fuzzed
  MODULES set with the division path exercised.
- `UTILITIES.length` is the **live count + 4** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records v179 under the
  [spec-v172](spec-v172.md) LTC-GA program (§3.7).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v179 with the +4 catalog delta.

## 7. Out of scope for v179

- **No STOPP/START** — the STOPP/START criteria are a **≈190-criterion checklist
  with no aggregate score**; they fail [spec-v29](spec-v29.md) §3 /
  [spec-v100](spec-v100.md) §2 (no reproducible single output) and are **excluded
  per [spec-v148](spec-v148.md) §7 and [spec-v172](spec-v172.md) §4**.
- **No Medication Appropriateness Index (MAI)** — the MAI is a per-drug
  **qualitative clinical judgment** (10 questions answered for each medication
  with no reproducible aggregate score); it is not a deterministic calculator and
  is excluded per [spec-v100](spec-v100.md) §2 / [spec-v29](spec-v29.md) §3.
- **No duplication of the full Beers list** — the AGS Beers Criteria PIM surface
  is the live `beers-check`; v179 cross-links it but does not re-embed it.
- **No proprietary drug-classification database** — this spec **does not embed a
  per-drug anticholinergic-level, ARS-point, or minimum-dose database.** The user
  supplies the per-drug levels/points/doses from the published scale; the tile
  performs the deterministic aggregation only. (Bundling and redistributing a
  proprietary drug database would also fail the [spec-v97](spec-v97.md)
  free-reproducibility bar.)
- **No automatic deprescribing or dosing order** — each tile reports the burden
  number and the source's interpretation; the decision stays with the
  prescriber/pharmacist and local protocol ([spec-v11](spec-v11.md) §5.3).
