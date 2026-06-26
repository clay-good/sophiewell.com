# spec-v154.md — Function, falls & palliative performance: Berg Balance, Timed Up & Go, Tinetti POMA, and Palliative Performance Scale (+4 tiles)

> Status: **SHIPPED (2026-06-26).** Feature spec of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds **4**
> deterministic performance/function instruments that fill a confirmed gap — the
> catalog has fall-*risk* prediction (`morse-falls`, `hendrich-ii`) and frailty
> screens, but **no performance-based mobility/balance measure**, and palliative
> care has `ecog-karnofsky` but **not the Palliative Performance Scale** that
> gates hospice eligibility. None duplicates a live tile.
>
> Catalog effect at v154 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v153) remains in force. v154 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Item scoring and bands are re-fetched and cross-verified
> to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Falls and functional decline are assessed by performance-based measures, not just
risk scores. The four below complete that axis: the Berg Balance Scale and Tinetti
POMA (the two standard balance/gait batteries), the Timed Up & Go (the single most
used bedside mobility screen, with the CDC STEADI threshold), and the Palliative
Performance Scale — the hospice-eligibility functional anchor distinct from
ECOG/Karnofsky. Each is a bounded item sum or a thresholded measure.

## 2. What v154 adds (4 tiles)

### 2.1 `berg-balance` — Berg Balance Scale (BBS)

- **Citation:** Berg K, Wood-Dauphinee S, Williams JI, Maki B. Measuring balance in
  the elderly: validation of an instrument. *Can J Public Health.* 1992;83 Suppl
  2:S7-11.
- **citationUrl:** (PMID 1468055 — verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `physical-medicine-rehabilitation`, `physical-therapy`, `geriatrics`.
- **Inputs:** **14 functional tasks** each scored **0–4** (sit-to-stand, standing
  unsupported, transfers, turning, single-leg stance, etc.).
- **Output:** **BBS 0–56** = sum; reports the total with the common interpretive
  strata (**0–20 high fall risk / wheelchair-bound, 21–40 walking with assistance,
  41–56 independent**) and the **<45 increased fall-risk** flag. Class A.

### 2.2 `tug` — Timed Up & Go (TUG)

- **Citation:** Podsiadlo D, Richardson S. The Timed "Up & Go": a test of basic
  functional mobility for frail elderly persons. *J Am Geriatr Soc.*
  1991;39(2):142-148.
- **citationUrl:** https://doi.org/10.1111/j.1532-5415.1991.tb01616.x (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `geriatrics`, `physical-therapy`, `emergency-medicine`.
- **Inputs:** the measured time in **seconds** to rise from a chair, walk 3 m, turn,
  return, and sit.
- **Output:** the time with the published fall-risk thresholds — **≥12 s (CDC
  STEADI)** flags increased fall risk; the **≥13.5 s** community-dwelling cutoff is
  also surfaced. Class A. A single-value thresholded measure (parallels
  `compartment-delta-pressure`); the input is finite-checked.

### 2.3 `tinetti-poma` — Tinetti Performance-Oriented Mobility Assessment

- **Citation:** Tinetti ME. Performance-oriented assessment of mobility problems in
  elderly patients. *J Am Geriatr Soc.* 1986;34(2):119-126.
- **citationUrl:** https://doi.org/10.1111/j.1532-5415.1986.tb05480.x (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `physical-therapy`, `physical-medicine-rehabilitation`.
- **Inputs:** the **balance** sub-items (0–16) and the **gait** sub-items (0–12).
- **Output:** **POMA 0–28** = balance + gait, with bands **<19 high fall risk,
  19–23 moderate, ≥24 low fall risk**; both sub-scores are reported. Class A.

### 2.4 `pps` — Palliative Performance Scale (PPSv2)

- **Citation:** Anderson F, Downing GM, Hill J, et al. Palliative Performance Scale
  (PPS): a new tool. *J Palliat Care.* 1996;12(1):5-11. (PPSv2 — Victoria Hospice
  Society, 2001.)
- **citationUrl:** https://doi.org/10.1177/082585979601200102 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `palliative`, `oncology`, `geriatrics`.
- **Inputs:** the five PPS columns read **left-to-right with leftward priority** —
  ambulation, activity & evidence of disease, self-care, oral intake, and level of
  consciousness.
- **Output:** the **PPS level 0%–100% in 10% decrements** per the source's
  read-leftward rule, with the standard prognostic framing (lower PPS → shorter
  survival; the hospice-eligibility context). Class A — a deterministic
  input→level mapping ([spec-v100](spec-v100.md) §2 classification clarification).
  Near-neighbor: `ecog-karnofsky` — both kept, cross-linked.

## 3. Per-tile robustness

- **Berg, Tinetti POMA, PPS** are deterministic input→score/level mappings over
  bounded selects; every combination resolves to exactly one defined band/level (no
  `undefined`/`NaN`). The **PPS read-leftward rule** is the chief correctness risk
  and is implemented as a documented priority order, unit-tested where two columns
  disagree.
- **TUG** guards its single numeric input (finite, non-negative); a blank/non-finite
  time renders a surfaced `valid:false` fallback rather than a spurious threshold
  flag.
- **Berg/Tinetti sub-score independence** is asserted (the total must equal the sum
  of the documented sub-items, and the band boundaries 20/21, 40/41 for Berg and
  18/19, 23/24 for POMA are exercised).
- All four render the [spec-v50](spec-v50.md) §3 posture note (a performance
  observation, not a prognosis order) and defer the disposition (hospice referral,
  PT plan, fall-prevention bundle) to the clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all four are **Class A** — fixed published
  instruments cited by journal/authors; none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/function-v154.js` module (`bergBalance`, `tug`, `tinettiPoma`, `pps`), added
  to `fuzz-tools.test.js` `MODULES` (TUG explicitly fuzzed for the numeric-threshold
  path; the classification tiles asserted to resolve to a defined band for every
  combination). Renderers live in the new `views/group-v154.js`; its `RV154` export
  is spread into `app.js` `RENDERERS`. The catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v154.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups G/E; import group-v154 RV154 into RENDERERS)
lib/function-v154.js                     (new module: bergBalance, tug, tinettiPoma, pps)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to ecog-karnofsky, morse-falls, hendrich-ii, cfs)
views/group-v154.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/berg-balance.test.js, tug.test.js, tinetti-poma.test.js, pps.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/function-v154.js to MODULES)
docs/audits/v12/berg-balance.md, tug.md, tinetti-poma.md, pps.md                 (spec-v11 audit logs)
docs/scope-post-parity.md                (catalog ledger; advance the v150 running count)
CHANGELOG.md                             (Unreleased: v154 entry, +4)
README.md, package.json                  (catalog count + spec-progression line -> v154)
```

## 6. Acceptance criteria

v154 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **Berg
  44/45 fall-risk flip**, a **TUG at exactly 12 s STEADI threshold**, a **Tinetti
  18/19 boundary**, and a **PPS read-leftward case where two columns disagree**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- TUG guards its numeric input; the classification tiles resolve every combination
  to one defined band/level; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 4 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v154 with the +4 delta.

## 7. Out of scope for v154

- **No FIM (Functional Independence Measure)** — its item text is copyrighted; the
  Barthel Index (`barthel`) already covers weighted ADL ([spec-v150](spec-v150.md)
  §2).
- **No automatic disposition** — each tile reports the score/level and the source's
  interpretation; hospice referral, PT plan, and fall-prevention orders stay with
  the clinician.
- **No `ecog-karnofsky` re-implementation** — that tile stands; `pps` is the
  distinct palliative functional anchor, cross-linked.
