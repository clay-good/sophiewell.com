# spec-v70.md — Make `sas-riker` honor its own printed goal band: SAS 3 reads as in-goal, not "deeper than goal"

> Status: **IMPLEMENTED (2026-06-11). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `sas-riker` (Riker
> Sedation-Agitation Scale) interpreter
> ([`lib/scoring-v4.js`](../lib/scoring-v4.js) `sasRiker()`) prints a
> light-sedation goal band of **"SAS 3-4"** but enforced it as **"SAS 4 only"**:
> the only "in-goal" branch was `lv === 4`, so a **SAS 3** fell through to the
> `else` and rendered *"SAS 3: deeper than the … goal of SAS 3-4; consider
> lightening sedation"* — telling the nurse that 3 is deeper than a range that
> explicitly includes 3, and to lighten sedation on a patient already at the
> lower edge of goal. v70 makes the goal branch accept SAS 3 *and* 4, matching
> the band the function already prints and the way the paired `rass()` already
> treats its own -2-to-0 target (lower edge included). The renderer is unchanged.
> Every prior spec (v4 through v69) remains in force; v70 adds no runtime network
> call, no AI, and no new tile.

## 1. Thesis

A sedation-scale interpreter exists to answer one question — "is this patient at
the sedation goal, too deep, or too agitated?" — and it must answer it against
the goal band it itself names. `sasRiker()` names the band correctly ("the …
goal of SAS 3-4") but enforced only its upper value. SAS 3 ("Sedated; awakens to
verbal stimuli or gentle shaking") is the *lower edge* of the SCCM PADIS 2018
light-sedation target, not below it; reporting it as "deeper than goal; consider
lightening sedation" is a direct self-contradiction and clinically wrong — it
would prompt a nurse to lighten sedation on an at-goal patient.

Two independent artifacts already encode the intended behavior, confirming this is
a bug and not deliberate scope:

- The tile's **paired scale** `rass()` ([`lib/scoring-v4.js`](../lib/scoring-v4.js)),
  which [spec-v13](spec-v13.md) §3.2.2 ships "side by side" with SAS, treats its
  target as a *range*: its in-target branch (`lv >= -2`) accepts the entire
  −2-to-0 band including the lower edge. SAS, the explicitly-paired scale, should
  likewise accept its whole printed 3-4 band.
- The tile's own **committed v11 audit** ([audits/v11/sas-riker.md](audits/v11/sas-riker.md))
  records the intended boundary as: "mid: SAS 3 (Sedated) -> **still within the
  goal band (3-4)**." The audit and the code disagreed; the code was wrong.

This is the same class as [spec-v68](spec-v68.md) (align `ttkg` to its own
documented threshold) and [spec-v69](spec-v69.md) (enforce the `digoxin` target
range the function prints): a printed band the branch logic did not enforce,
fixable with pure threshold logic over the existing input.

## 2. The change

### `sas-riker` — accept SAS 3 into the goal branch

```
SAS 4         → calm and cooperative; goal sedation                 (unchanged)
SAS 3   (new) → sedated but within the light-sedation goal of 3-4   (was: "deeper than goal; lighten")
SAS >= 5      → agitated; review sedation/analgesia/delirium        (unchanged)
SAS <= 2      → deeper than the goal of SAS 3-4; consider lightening (unchanged)
```

Only the SAS 3 string changes. The SAS 4 goal string, the SAS ≥5 agitation
string, and the SAS ≤2 "deeper than goal" string are byte-for-byte unchanged, so
the lower bound of the band is now correctly enforced at 2/3 (SAS 2 still reads
"deeper") rather than at 3/4.

- **Citation:** none added. The 3-4 band is the one the function already prints,
  the audit already documents, and SCCM PADIS 2018 (Devlin 2018, already cited on
  the tile) defines as the light-sedation target. This is a self-consistency fix,
  not a new clinical judgment.
- **Group / audiences / specialties:** unchanged.
- **Inputs / output shape:** unchanged. The same `band` string field is returned;
  only the SAS 3 wording changes. The renderer
  ([`views/group-g.js`](../views/group-g.js)) prints `r.band` generically and
  needs no edit.

## 3. Robustness

- The compute stays pure. `level` is clamped to 1-7 (`Math.max(1, Math.min(7,
  …))`) before any band is chosen, so no out-of-range or non-finite value reaches
  the branch logic; the renderer's `safe()` wrapper catches a throw.
- The change is one added `else if` and one string literal; it cannot alter the
  clamped level value, only the SAS 3 interpretation label.
- No output that existed before v70 changes for any SAS other than 3: SAS 1-2 and
  4-7 render byte-identically. The META example (SAS 4, "calm and cooperative;
  goal sedation per Riker 1999") is unaffected, so the `example-correctness`
  sweep passes unchanged.

## 4. Files touched

```
docs/spec-v70.md              (this file)
lib/scoring-v4.js             (sasRiker: SAS 3 in-goal branch + comment)
docs/audits/v11/sas-riker.md  (spec-v11 re-audit: SAS 3 in-goal, SAS 2 lower edge)
test/unit/sas-riker.test.js   (strengthen the SAS 3 test; +1 SAS 2 lower-bound test)
README.md                     (intro spec-progression + spec range -> v70)
CHANGELOG.md                  (Unreleased: v70 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `sasRiker({ level: 3 })` returns a band matching "within the … goal of SAS
  3-4" and NOT matching "deeper than" or "lightening sedation."
- `sasRiker({ level: 2 })` still returns "deeper than … goal of SAS 3-4; consider
  lightening sedation" (lower bound now enforced at 2/3).
- SAS 4, 5-7, and 1-2 outputs are byte-for-byte unchanged; the META example (SAS
  4) renders identically.
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement.
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness
  (scoring-v4.js already enrolled) with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v70 with a +0 catalog delta.

## 6. Out of scope for v70

- **No change to RASS or any other scale.** `rass()` already treats its band as a
  range correctly; v70 brings SAS into line with it and with SAS's own printed
  band, and touches nothing else.
- **No new "lower edge of goal" severity tier.** SAS 3 reads simply as in-goal
  (matching the audit's "still within the goal band"); v70 does not introduce a
  distinct third interpretation tier between in-goal and too-deep.
- **No new input, no new tile, no change to any other tile's output.**
