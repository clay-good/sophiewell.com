# spec-v66.md — Complete the `abg` compensation analysis: expected HCO₃ for respiratory acidosis and alkalosis (Boston rules)

> Status: **IMPLEMENTED (2026-06-10). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `abg` acid-base interpreter
> ([`lib/clinical.js`](../lib/clinical.js) `abgInterpret()`) already predicts the
> expected **PaCO₂** for the two *metabolic* primaries (Winter's formula for
> metabolic acidosis; the 0.7 rule for metabolic alkalosis) but predicted **no
> expected HCO₃** for the two *respiratory* primaries — it labeled respiratory
> acidosis/alkalosis and stopped. v66 adds the **Boston rules** (Narins &
> Emmett, *Medicine* 1980) expected-HCO₃ bands (acute and chronic) for both
> respiratory primaries, so the interpreter can now flag a superimposed
> metabolic process for *every* primary disorder, not just the metabolic two.
> The renderer is unchanged — it already prints `result.compensation`
> generically — so this is a pure compute + documentation change. Every prior
> spec (v4 through v65) remains in force; v66 adds no runtime network call, no
> AI, and no new tile.

## 1. Thesis

Compensation analysis is the point of an ABG interpreter: the primary disorder
is the easy half, and the clinically decisive half is "is the secondary
(compensatory) change *appropriate*, or is there a second, superimposed acid-base
process?" The `abg` tile answered that question for metabolic primaries — Winter's
formula gives the expected PaCO₂ for a metabolic acidosis, and a measured PaCO₂
outside the predicted band signals a concurrent respiratory disorder — but it
**did not answer it for respiratory primaries**. A respiratory acidosis (e.g.
COPD exacerbation, opioid hypoventilation) and a respiratory alkalosis (e.g.
salicylate toxicity, sepsis, anxiety) were each correctly labeled, then left
without an expected-HCO₃ band, so the user had no anchor to decide whether the
metabolic side was compensating appropriately or whether a second process was
present. The prior [audit log](audits/v11/abg.md) recorded this directly:
`pH 7.25 / PaCO2 60 / HCO3 26 → Respiratory acidosis (acute; uncompensated)` —
labeled, but no expected band.

The fix is the **Boston rules**, the canonical, deterministic, source-stable
quantification of renal compensation for respiratory disorders. They are pure
arithmetic over the measured PaCO₂ and the 24 mEq/L HCO₃ reference, with no new
input and no clinical judgment encoded — exactly the kind of bedside arithmetic
the catalog exists to make exact.

## 2. The change

### `abg` — add the respiratory-primary expected-HCO₃ bands

For a **respiratory acidosis** (pH < 7.35, PaCO₂ > 45):

```
expected HCO3 (acute)   = 24 + 0.10 × (PaCO2 − 40)
expected HCO3 (chronic) = 24 + 0.35 × (PaCO2 − 40)
```

For a **respiratory alkalosis** (pH > 7.45, PaCO₂ < 35):

```
expected HCO3 (acute)   = 24 + 0.20 × (PaCO2 − 40)
expected HCO3 (chronic) = 24 + 0.40 × (PaCO2 − 40)
```

`(PaCO2 − 40)` is positive for acidosis and negative for alkalosis, so the single
`24 + k × (PaCO2 − 40)` form yields the correct upward/downward HCO₃ adaptation in
both directions. The compute returns both endpoints with a one-line reading: HCO₃
above the chronic value suggests an added metabolic **alkalosis**, below the acute
value an added metabolic **acidosis** (and the mirror image for alkalosis). The
metabolic branches are byte-for-byte unchanged.

- **Citation:** Boston rules per Narins RG, Emmett M. *Simple and mixed acid-base
  disorders: a practical approach.* Medicine (Baltimore) 1980;59(3):161-187, with
  the same coefficients tabulated in Berend K, de Vries APJ, Gans ROB.
  *Physiological approach to assessment of acid-base disturbances.* N Engl J Med
  2014;371:1434-1445. Both are fixed journal articles (not revisable guideline
  documents), so — like the existing Winter (Albert 1967) and Berlin (Ranieri
  2012) citations on this tile — they carry no `docs/citation-staleness.md` row
  and do not trip the `check-citations` guideline-issuer rule.
- **Group / audiences / specialties:** unchanged (`abg` stays in its current
  group; critical-care / pulmonology / respiratory-therapy specialties).
- **Inputs / output shape:** unchanged. The new text rides on the existing
  optional `compensation` line; the renderer ([`views/group-g.js`](../views/group-g.js)
  `abg()`) needs no edit because it already does `if (r.compensation) …`.

## 3. Robustness

- The compute stays pure. `pH`, `paco2`, and `hco3` are validated through
  [`lib/num.js`](../lib/num.js) `num()` (pH 6-8; PaCO₂/HCO₃ reject negatives), so a
  missing / non-finite input throws before the compensation branch runs and the
  renderer's `safe()` wrapper catches it. The new branches do only multiplication
  and addition over already-validated finite numbers and route every displayed
  value through `r1()`; no `NaN`/`Infinity` can reach the DOM
  ([spec-v53](spec-v53.md) §3 / [spec-v59](spec-v59.md) §2.6).
- The coefficients (0.10 / 0.35 / 0.20 / 0.40) are dimensionless physiologic
  constants from a fixed 1980 reference, not a revisable guideline value, so no
  staleness ledger row is added and the [spec-v54](spec-v54.md)/[spec-v60](spec-v60.md)
  citation contract is satisfied by the inline citation.
- No output that existed before v66 changes: the two metabolic-primary strings,
  the A-a gradient, and the P/F ratio are untouched, so the
  `example-correctness` numeric sweep and the META example (`pH 7.30 / 30 / 14`,
  metabolic acidosis) still pass unchanged.

## 4. Files touched

```
docs/spec-v66.md            (this file)
lib/clinical.js             (abgInterpret: +2 respiratory-primary compensation branches)
lib/meta.js                 (abg citation: + Boston rules / Narins & Emmett 1980)
docs/audits/v11/abg.md      (spec-v11 audit re-run: respiratory boundary examples + cross-impl differential)
test/unit/clinical.test.js  (+2 boundary tests: respiratory acidosis & alkalosis expected HCO3)
README.md                   (acid-base note in the relevant section)
CHANGELOG.md                (Unreleased: v66 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `abgInterpret()` returns a Boston-rules expected-HCO₃ `compensation` string for
  both respiratory acidosis and respiratory alkalosis, reproducing the acute and
  chronic endpoints (PaCO₂ 60 → 26 acute / 31 chronic; PaCO₂ 28 → 21.6 acute /
  19.2 chronic) within rounding.
- The metabolic-primary outputs, A-a gradient, and P/F ratio are unchanged; the
  META example still renders "Metabolic acidosis with appropriate respiratory
  compensation."
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement (`check-catalog-truth` +
  `grep-check` clean).
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness (clinical.js
  already enrolled) with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v66 with a +0 catalog delta.

## 6. Out of scope for v66

- **No acute-vs-chronic auto-selection.** The tile cannot know clinical
  chronicity from a single gas, so it presents *both* the acute and chronic
  expected-HCO₃ endpoints and the rule for reading a measured HCO₃ against them;
  it does not declare the disorder acute or chronic for the patient.
- **No automated mixed-disorder diagnosis.** The compensation line states the
  general rule ("HCO₃ above the chronic value suggests an added metabolic
  alkalosis"); it does not emit a definitive "you have a triple disorder" verdict,
  matching the existing metabolic branches, which likewise report the expected
  band without diagnosing the patient.
- **No new input, no new tile, no change to any other tile's output.** v66
  completes one existing calculator's compensation logic and nothing else; the
  delta-gap (`anion-gap-dd`), Winter (`winters`), and base-deficit
  (`acid-base-deficit`) tiles are unchanged.
