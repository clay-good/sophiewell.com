# spec-v69.md — Make the `digoxin` subtherapeutic ("below target") threshold indication-aware (rate-control floor 0.8, not the HF 0.5)

> Status: **IMPLEMENTED (2026-06-11). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `digoxin` calculator
> ([`lib/medication-v5.js`](../lib/medication-v5.js) `digoxin()`) interprets a
> measured level against an **indication-specific** target — `0.5-0.9 ng/mL` for
> heart failure, `0.8-2.0 ng/mL` for AF rate control — and prints that target
> string. But its "below target" test was hardcoded to a single bound (`< 0.5`,
> the HF floor) for **both** indications, so a rate-control level in the
> half-open interval `[0.5, 0.8)` fell through to the "within" branch and
> rendered "within 0.8-2.0 ng/mL (rate control)" — flatly contradicting the
> target string the same function printed one line above. v69 derives an
> indication-aware lower threshold (`0.5` HF / `0.8` rate control) from the
> existing `indication` input. The renderer is unchanged — it consumes
> `levelInterp` as a generic string — so this is a pure compute fix plus the
> missing rate-control test. Every prior spec (v4 through v68) remains in force;
> v69 adds no runtime network call, no AI, and no new tile.

## 1. Thesis

The point of a drug-level interpreter is that "below / within / above target" is
read against *this patient's* target, and digoxin's target is not one number — it
is one band for heart failure (0.5-0.9 ng/mL, the ACC/AHA/HFSA 2022 HF target)
and a different, higher band for atrial-fibrillation rate control (0.8-2.0 ng/mL,
the long-standing therapeutic range). The tile already encoded both bands: the
`indication` input is committed by [spec-v56](spec-v56.md) §2.5, the compute
prints the correct `target` string for each, and the renderer dropdown
([`views/group-v8.js`](../views/group-v8.js)) offers "AF rate control
(0.8-2.0 ng/mL)" explicitly. The high tail (>2.0 toxic) and the HF over-target
tail (>0.9) were both handled. Only the **subtherapeutic ("below")** tail was
wrong: it tested `levelNgMl < 0.5` for every indication.

The consequence is a self-contradiction, not a near-miss. For `indication: 'af'`
a measured 0.6 or 0.7 ng/mL is below the 0.8 floor the tile itself prints, yet the
tile reported it as **"within 0.8-2.0 ng/mL (rate control)"** — telling a nurse a
subtherapeutic rate-control level was in range. A subtherapeutic digoxin level
under rate control is unambiguously meaningful (under-controlled rate), so this
was never intentional one-sided scope; it was a threshold that disagreed with the
function's own printed target. This is the same class as
[spec-v66](spec-v66.md)/[v67](spec-v67.md)/[v68](spec-v68.md): an existing
compute whose interpretation logic diverged from its own committed values,
fixable with pure threshold logic over an existing input.

## 2. The change

### `digoxin` — derive the "below" floor from the indication

```
target    = indication === 'hf' ? '0.5-0.9 ng/mL (HF)' : '0.8-2.0 ng/mL (rate control)'   (unchanged)
targetLow = indication === 'hf' ? 0.5 : 0.8                                                (new)

  level > 2.0                        → toxic range (both indications)        (unchanged)
  hf && level > 0.9                  → above the HF target                   (unchanged)
  level < targetLow                  → below {target}                        (0.5 → indication-aware)
  else                               → within {target}                       (unchanged)
```

The HF path is byte-for-byte unchanged: `targetLow` is `0.5` for HF, so every HF
level produces exactly the prior string. Only the rate-control "below" boundary
moves, from an effective `0.5` to the `0.8` the tile already advertises. The
`[0.5, 0.8)` rate-control zone now correctly reads "below" instead of "within".

- **Citation:** none added. The `0.8` floor is the lower bound of the
  `0.8-2.0 ng/mL` rate-control range this function and the renderer label already
  commit to — this is a self-consistency fix (like [spec-v68](spec-v68.md)
  aligning `ttkg` to its own published threshold), not a new clinical judgment.
  The tile's META citation (ACC/AHA/HFSA 2022 HF guideline) and its
  `docs/citation-staleness.md` row are unchanged.
- **Group / audiences / specialties:** unchanged.
- **Inputs / output shape:** unchanged. The same `levelInterp` string field is
  returned; only the threshold that selects "below" vs "within" changes. The
  renderer needs no edit.

## 3. Robustness

- The compute stays pure. `crCl`, `levelNgMl`, `ageYears`, and `hoursPostDose`
  are validated through [`lib/num.js`](../lib/num.js) `num()` (level 0-20), so a
  non-finite input throws before the band logic runs and the renderer's `safe()`
  wrapper catches it. `targetLow` is one of two literal constants; the branch is
  a comparison over already-validated finite numbers; no `NaN`/`Infinity` can
  reach the DOM ([spec-v53](spec-v53.md) §3 / [spec-v59](spec-v59.md) §2.6).
- The two thresholds (`0.5` HF, `0.8` rate control) are fixed therapeutic-range
  bounds, not revisable guideline values, so no staleness ledger row is added and
  the [spec-v54](spec-v54.md)/[spec-v60](spec-v60.md) citation contract is
  satisfied by the existing inline citation.
- No HF output changes (the 0.5 floor is preserved for HF), and the toxic (>2.0)
  and HF over-target (>0.9) branches are untouched, so the `example-correctness`
  numeric sweep is unaffected.

## 4. Files touched

```
docs/spec-v69.md            (this file)
lib/medication-v5.js        (digoxin: indication-aware targetLow + comment)
docs/audits/v11/digoxin.md  (spec-v11 re-audit: rate-control below/within boundary)
test/unit/digoxin.test.js   (+3 tests: af 0.7 below, af 0.9 within, hf 0.7 still within)
README.md                   (dosing & infusion cheat-sheet note on the two-band reading)
CHANGELOG.md                (Unreleased: v69 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `digoxin()` with `indication: 'af'` labels a level of 0.7 ng/mL as "below
  0.8-2.0 ng/mL (rate control)" (not "within"), and a level of 0.9 ng/mL as
  "within 0.8-2.0 ng/mL (rate control)."
- Every HF output is unchanged: `indication: 'hf'` with level 0.7 still reads
  "within 0.5-0.9 ng/mL (HF)"; the >0.9 above-target and >2.0 toxic branches are
  byte-for-byte identical.
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement.
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness
  (medication-v5.js already enrolled) with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v69 with a +0 catalog delta.

## 6. Out of scope for v69

- **No rate-control over-target band.** Unlike HF (where >0.9 is above target but
  below toxic), the rate-control range runs to 2.0 ng/mL, the same value as the
  toxic threshold, so there is no distinct "above rate-control target but
  non-toxic" zone to add. The band stays below / within / toxic.
- **No new input, no new tile, no change to the maintenance-dose guidance.** v69
  fixes one threshold in one calculator's level interpretation and nothing else;
  the renal/age-categorical dose guidance and the timing warning are untouched.
