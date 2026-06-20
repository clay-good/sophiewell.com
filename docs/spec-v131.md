# spec-v131.md — Urology: renal mass, stones, torsion: CAPRA, R.E.N.A.L. nephrometry, PADUA renal, S.T.O.N.E., ROKS, and TWIST (+6 tiles)

> Status: **SHIPPED PARTIAL (2026-06-20).** Feature spec of the
> [spec-v100](spec-v100.md) MDCalc Parity Completion program, **Wave 5** (GI /
> hepatology / nephrology / acid-base / urology). Scoped **6** deterministic
> renal-mass, kidney-stone, and testicular-torsion instruments that complete the
> urology cluster begun in v130; **5 shipped, 1 (`roks-stone-recurrence`)
> DEFERRED** — see the amendment below. None duplicates a live tile.
>
> Catalog effect (as shipped): **579 + 5 = 584 tiles** — the Wave 5 end state.
> (The original draft assumed 577 + 6 = 583, written before the standalone
> spec-v149 EMS parity landed 3 tiles ahead of v131; the live count was 579 at
> v131 start. The program's running count carries a known off-by-one, so the
> catalog-truth gate is the source of truth: live `UTILITIES.length` + delta.)
>
> **Amendment (2026-06-20) — ROKS deferred.** `roks-stone-recurrence` is **not
> shipped**. Its 2-/5-/10-year probability formula is published, but the
> per-variable **points** that feed it exist only in a graphical nomogram (Figure
> 2A of Rule 2014, JASN 25:2878, and the revised Rule 2019, Mayo Clin Proc
> 94:248); the papers publish hazard ratios, **not** a numeric point table or the
> points-scaling constant. The points cannot be transcribed exactly from open
> sources without measuring pixel positions off the figure. Shipping
> reverse-engineered coefficients in a clinical tool is the failure mode this
> program already refused once (`gwtg-hf`, [spec-v102](spec-v102.md)). The id is
> **reserved**; ROKS ships only when an institutional source for the coefficient
> appendix becomes available. v131 therefore closes **Wave 5 at +5** (579 → 584).
>
> Every prior spec (v4 through v130) remains in force. v131 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

> **Collision rename recorded.** The renal-mass PADUA score ships as **`padua-renal`**
> to avoid colliding with the existing VTE **`padua`** (Padua Prediction Score). The
> two are unrelated instruments; `padua-renal` does **not** replace or shadow `padua`,
> and v131 cross-links neither into the other ([spec-v100](spec-v100.md) §4 collision
> audit).

## 1. Thesis

v130 established the prostate cluster; the renal-mass complexity scores, the stone
instruments, and the torsion rule that round out a urology workflow are still absent:

- **There is no CAPRA score** — the 0–10 prostate-cancer recurrence-risk score
  (companion to v130's `damico-prostate-risk`).
- **There is no R.E.N.A.L. nephrometry score** — the standard anatomic-complexity
  score for a renal mass facing nephron-sparing surgery.
- **There is no PADUA renal score** — the parallel renal-mass complexity score (shipped
  as `padua-renal`, distinct from the VTE `padua`).
- **There is no S.T.O.N.E. nephrolithometry** — the PCNL stone-free prediction score.
- **There is no ROKS** — the recurrence-of-kidney-stone score (2/5/10-yr).
- **There is no TWIST score** — the testicular-workup-for-ischemia-and-suspected-
  torsion score, an ED point-of-care rule.

Each is a published, deterministic instrument; v131 completes Wave 5's urology cluster
and the wave.

## 2. What v131 adds (6 tiles)

### 2.1 `capra-score` — CAPRA score

- **Citation:** Cooperberg MR, Pasta DJ, Elkin EP, et al. The University of California,
  San Francisco Cancer of the Prostate Risk Assessment score: a straightforward and
  reliable preoperative predictor of disease recurrence after radical prostatectomy.
  *J Urol.* 2005;173(6):1938-1942.
- **citationUrl:** https://doi.org/10.1097/01.ju.0000158155.33890.e7
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `oncology`, `internal-medicine`.
- **Inputs:** age, PSA (banded), Gleason primary/secondary patterns, clinical T stage,
  and percent of positive biopsy cores.
- **Output:** the **CAPRA total (0–10)** with the published recurrence-risk bands (0–2
  low; 3–5 intermediate; 6–10 high). Class A. Cross-links (v130)
  `damico-prostate-risk` and `gleason-grade-group`.

### 2.2 `renal-nephrometry` — R.E.N.A.L. nephrometry score

- **Citation:** Kutikov A, Uzzo RG. The R.E.N.A.L. nephrometry score: a comprehensive
  standardized system for quantitating renal tumor size, location and depth. *J Urol.*
  2009;182(3):844-853.
- **citationUrl:** https://doi.org/10.1016/j.juro.2009.05.035
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `interventional-radiology`, `oncology`.
- **Inputs:** Radius (tumor size), Exophytic/endophytic, Nearness to collecting
  system, Anterior/posterior, and Location relative to polar lines — each scored per
  the published table.
- **Output:** the **R.E.N.A.L. total (4–12) plus the a/p/x suffix**, with the
  complexity bands (4–6 low; 7–9 moderate; 10–12 high). Class A. **Near-neighbor:**
  (v131) `padua-renal` — cross-linked, both kept (parallel systems).

### 2.3 `padua-renal` — PADUA renal score

- **Citation:** Ficarra V, Novara G, Secco S, et al. Preoperative aspects and
  dimensions used for an anatomical (PADUA) classification of renal tumours in patients
  who are candidates for nephron-sparing surgery. *Eur Urol.* 2009;56(5):786-793.
- **citationUrl:** https://doi.org/10.1016/j.eururo.2009.07.040
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `interventional-radiology`, `oncology`.
- **Inputs:** longitudinal and rim location, exophytic rate, renal-sinus and
  urinary-collecting-system involvement, and tumor size — each scored per the
  published table.
- **Output:** the **PADUA total** with the complexity-risk bands per the source.
  Class A. **Rename note:** ships as `padua-renal`; the VTE `padua` is a separate,
  unrelated tile and is not affected. Cross-links `renal-nephrometry`.

### 2.4 `stone-nephrolithometry` — S.T.O.N.E. nephrolithometry

- **Citation:** Okhunov Z, Friedlander JI, George AK, et al. S.T.O.N.E. nephrolithometry:
  novel surgical classification system for kidney calculi. *Urology.*
  2013;81(6):1154-1159.
- **citationUrl:** https://doi.org/10.1016/j.urology.2012.10.083
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `interventional-radiology`.
- **Inputs:** Stone size, Tract length, Obstruction, Number of involved calices, and
  Essence (density) — each scored per the published table.
- **Output:** the **S.T.O.N.E. total (5–13)** with the PCNL stone-free-likelihood
  reading (higher = lower stone-free probability). Class A. Cross-links the existing
  `stone-score` and (v131) `roks-stone-recurrence`.

### 2.5 `roks-stone-recurrence` — ROKS (recurrence of kidney stone) — **DEFERRED, NOT SHIPPED**

> **Deferred (2026-06-20).** See the amendment in the status block. The nomogram
> points are not recoverable from open sources; only hazard ratios are published.
> Implementing this would require fabricating the points-scaling, which the
> program refuses (the `gwtg-hf` precedent). The id is reserved.


- **Citation:** Rule AD, Lieske JC, Li X, et al. The ROKS nomogram for predicting a
  second symptomatic stone episode. *J Am Soc Nephrol.* 2014;25(12):2878-2886.
- **citationUrl:** https://doi.org/10.1681/ASN.2013091011
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `nephrology`, `internal-medicine`.
- **Inputs:** age, sex, race, prior symptomatic/asymptomatic stones, family history,
  and stone characteristics (composition, location, imaging findings).
- **Output:** the **2-, 5-, and 10-year probability of a second symptomatic stone** via
  the published nomogram coefficients. Class A. **Near-neighbor:** `stone-score` —
  cross-linked, both kept.

### 2.6 `twist-score` — TWIST score (testicular torsion)

- **Citation:** Barbosa JA, Tiseo BC, Barayan GA, et al. Development and initial
  validation of a scoring system to diagnose testicular torsion in children. *J Urol.*
  2013;189(5):1859-1864.
- **citationUrl:** https://doi.org/10.1016/j.juro.2012.10.056
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `emergency-medicine`, `pediatrics`.
- **Inputs:** testicular swelling (2), hard testis (2), absent cremasteric reflex (1),
  nausea/vomiting (1), and high-riding testis (1).
- **Output:** the **TWIST total (0–7)** with the published risk tiers (0–2 low; 3–4
  intermediate; 5–7 high), naming the components that scored. Class A. Cross-links the
  pediatric/ED rules.

## 3. Per-tile robustness

- **`capra-score`, `renal-nephrometry`, `padua-renal`, `stone-nephrolithometry`, and
  `twist-score` are bounded ordinal/threshold logic.** Each sums published per-component
  points, clamps the total to its defined range, and names which components scored;
  blank components are reported as not-assessed rather than scored 0, mirroring the
  v97/v126 blank-handling pattern. All flow through the [spec-v59](spec-v59.md) fuzz
  harness. Each consumes inputs and computes a score/class — not a browsable reference
  table ([spec-v100](spec-v100.md) §2).
- **`roks-stone-recurrence` guards its nomogram math.** The logistic/nomogram
  coefficients are applied with an overflow-safe form so the 2/5/10-yr probabilities are
  bounded to 0–1; a blank required variable yields a surfaced `valid:false` fallback,
  never a probability from `NaN`.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** (fixed point tables and
  nomogram coefficients) — **no** `docs/citation-staleness.md` row. The citations name
  the **journal and authors** (J Urol/Cooperberg, Kutikov-Uzzo, and Barbosa, Eur Urol/
  Ficarra, Urology/Okhunov, J Am Soc Nephrol/Rule), **not** a society acronym, so none
  trips the `ISSUER_PATTERN` staleness gate.
- **Build & gates (§6.1/§6.2):** `lib/uro-v131.js` (computes `capraScore`,
  `renalNephrometry`, `paduaRenal`, `stoneNephrolithometry`, `roksStoneRecurrence`,
  `twistScore`) is added to `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite
  leaks, with the ROKS nomogram explicitly fuzzed for overflow); the renderer is
  `views/group-v131.js` with its `RV131` export added to the `app.js` `RENDERERS`
  spread. Each `META` example is pinned by the chromium `example-correctness` sweep;
  the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v131.js`.
- **Wave-close note:** with v131 Wave 5 is complete at **583** tiles (539 → 583, +44);
  `scope-mdcalc-parity.md` records the wave delta in the running ledger.

## 5. Files touched

```
docs/spec-v131.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v131 renderers into RENDERERS)
lib/uro-v131.js                          (new module: capraScore, renalNephrometry, paduaRenal, stoneNephrolithometry, roksStoneRecurrence, twistScore)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to damico-prostate-risk, gleason-grade-group, stone-score)
views/group-v131.js                      (new renderer module: 6 renderers; RV131 export)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/capra-score.test.js, renal-nephrometry.test.js, padua-renal.test.js, stone-nephrolithometry.test.js, roks-stone-recurrence.test.js, twist-score.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/uro-v131.js to MODULES)
docs/audits/v12/capra-score.md, renal-nephrometry.md, padua-renal.md, stone-nephrolithometry.md, roks-stone-recurrence.md, twist-score.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 577 -> 583; record Wave 5 complete, 539 -> 583, +44)
CHANGELOG.md                             (Unreleased: v131 entry, +6; Wave 5 close note)
README.md, package.json                  (catalog count 577 -> 583; spec-progression line -> v131)
```

## 6. Acceptance criteria

v131 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent — **`padua-renal` is confirmed distinct from the existing VTE
  `padua`**, which is untouched.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including a
  **CAPRA 2→3 low/intermediate boundary flip**, a R.E.N.A.L. 6→7 low/moderate flip with
  the a/p/x suffix, a PADUA-renal complexity-band case, an S.T.O.N.E. 5–13 worked total,
  a ROKS 2/5/10-yr probability, and a **TWIST 4→5 intermediate/high flip** — a
  [spec-v11](spec-v11.md) audit log each, and a passing [spec-v29](spec-v29.md) §3
  check.
- The ordinal scores clamp to their ranges and treat blanks as not-assessed;
  `roks-stone-recurrence` guards its nomogram and bounds probabilities to 0–1; partial
  inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **583** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree;
  `scope-mdcalc-parity.md` records Wave 5 complete (539 → 583, +44).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v131 with the +6 catalog delta and the Wave 5 close note.

## 7. Out of scope for v131

- **No CT/ultrasound image parsing** — the clinician enters the nephrometry/stone
  anatomic findings, biopsy data, and exam findings; no image feed.
- **No auto-surgery, auto-PCNL, or auto-orchiopexy order** — each tile reports the
  score/risk and the source's stated interpretation; the management decision (and any
  emergent torsion decision) stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
- **`padua-renal` does not replace the VTE `padua`** — the two are unrelated
  instruments kept side by side; no existing tile changes.
