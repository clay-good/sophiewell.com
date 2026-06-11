# spec-v67.md — Complete the `acid-base-deficit` over-rapid-correction warning: the hypernatremia (cerebral-edema) ceiling

> Status: **IMPLEMENTED (2026-06-11). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `acid-base-deficit` calculator
> ([`lib/clinical-v6.js`](../lib/clinical-v6.js) `acidBaseDeficit()`) computes a
> **signed** sodium deficit — positive when a hyponatremic patient must be
> raised, negative (a free-water deficit) when a hypernatremic patient must be
> lowered — but fired an over-rapid-correction warning in only **one** direction:
> it flagged raising a chronic hyponatremia by >8 mEq/L/24h (osmotic
> demyelination) and stayed silent on the mirror case. v67 adds the symmetric
> **hypernatremia** ceiling: lowering a chronic hypernatremia by >10 mEq/L/24h
> risks cerebral edema. The renderer is unchanged in structure — it already
> renders an optional `warn` row — so this is a pure compute + one mirror render
> row. Every prior spec (v4 through v66) remains in force; v67 adds no runtime
> network call, no AI, and no new tile.

## 1. Thesis

The whole point of a sodium-deficit estimate at the bedside is that the *rate*
of correction is dangerous in **both** directions, not just one. Raising a
chronic hyponatremia too fast (>8 mEq/L/24h) causes osmotic demyelination
syndrome; lowering a chronic hypernatremia too fast (>10 mEq/L/24h) causes
cerebral edema. The two ceilings are the canonical Adrogué-Madias limits and sit
symmetrically on either side of normal. The tile already encoded the first and
already computes a *signed* deficit that is negative precisely when the patient
is hypernatremic — so it had every input needed to flag the second case, yet
warned only on hyponatremia. A nurse planning to bring a Na of 165 down to 145
saw a `-naDeficit` number and no caution at all, the exact asymmetry that the
[audit log](audits/v11/acid-base-deficit.md) recorded: "Fires an
over-rapid-correction warning when correcting a *hyponatremic* patient by
>8 mEq/L" — one direction only.

The fix is the **Adrogué-Madias hypernatremia ceiling**: a fixed, deterministic
≤10 mEq/L/24h limit, pure arithmetic over the already-validated `measuredNa` and
`targetNa`, with no new input and no clinical judgment encoded.

## 2. The change

### `acid-base-deficit` — add the hypernatremia over-rapid-correction warning

```
hyponatremiaWarn  = measuredNa < 135 && (targetNa  − measuredNa) > 8   (existing)
hypernatremiaWarn = measuredNa > 145 && (measuredNa − targetNa)  > 10  (new)
```

The two guards are mutually exclusive (a patient cannot be both <135 and >145),
so only one warning can fire and neither path changes the other's output. The
hypernatremia message states the ceiling and the consequence ("Lowering Na by
more than 10 mEq/L in 24 h risks cerebral edema; limit the rate.") in the same
shape as the existing osmotic-demyelination message.

- **Citation:** unchanged. Adrogué HJ, Madias NE. *Hypernatremia.* N Engl J Med
  2000;342(20):1493-1499 — the journal article *already cited* on this tile is
  itself the hypernatremia reference (the companion *Hyponatremia* paper is
  342(21):1581-1589). Both are fixed journal articles, not revisable guideline
  documents, so — like every other citation on this tile — no
  `docs/citation-staleness.md` row is added and the `check-citations`
  guideline-issuer rule is not tripped.
- **Group / audiences / specialties:** unchanged.
- **Inputs / output shape:** unchanged inputs. The new text rides on a second
  optional `warn` row; the renderer ([`views/group-v7.js`](../views/group-v7.js)
  `acid-base-deficit()`) gains one mirror line, `r.hypernatremiaWarn ? {…} :
  null`, exactly like the existing `hyponatremiaWarn` row.

## 3. Robustness

- The compute stays pure. `weightKg`, `measuredHco3`, `targetHco3`, `measuredNa`,
  and `targetNa` are validated through [`lib/num.js`](../lib/num.js) `num()`
  (Na 90-200), so a missing / non-finite input throws before the warning branch
  runs and the renderer's `safe()` wrapper catches it. The new branch does only a
  comparison over already-validated finite numbers; no `NaN`/`Infinity` can reach
  the DOM.
- The 10 mEq/L/24h coefficient is a dimensionless physiologic ceiling from a
  fixed 2000 reference, not a revisable guideline value, so no staleness ledger
  row is added and the citation contract is satisfied by the existing inline
  citation.
- No output that existed before v67 changes: TBW, the bicarbonate deficit, the
  sodium deficit, and the hyponatremia warning are untouched, so the
  `example-correctness` numeric sweep and the META example (Na 120→135, a
  hyponatremia case where `hypernatremiaWarn` is `null`) still pass unchanged.

## 4. Files touched

```
docs/spec-v67.md                       (this file)
lib/clinical-v6.js                     (acidBaseDeficit: + hypernatremiaWarn branch + comment)
views/group-v7.js                      (acid-base-deficit: + mirror warn row)
docs/audits/v11/acid-base-deficit.md   (audit re-run: hypernatremia boundary examples)
test/unit/acid-base-deficit.test.js    (+2 boundary tests: hypernatremia warn + exactly-10 no-warn)
README.md                              (cheat-sheet row notes the two-way warning)
CHANGELOG.md                           (Unreleased: v67 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `acidBaseDeficit()` returns a `hypernatremiaWarn` string when measured Na >145
  and the drop exceeds 10 mEq/L/24h (Na 160→145 → warn), and `null` at the
  boundary (Na 155→145, a drop of exactly 10 → no warn) and whenever Na ≤145.
- The hyponatremia warning, TBW, and both deficit values are unchanged; the META
  example still renders "Na deficit 630 mEq" with the hyponatremia warning only.
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement.
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness
  (clinical-v6.js already enrolled) with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v67 with a +0 catalog delta.

## 6. Out of scope for v67

- **No acute-vs-chronic auto-selection.** The 8 and 10 mEq/L/24h ceilings are the
  chronic-correction limits; the tile cannot know chronicity from a single set of
  labs, so it presents the conservative ceiling and the consequence, exactly as
  the hyponatremia branch already does. It does not declare the disorder acute or
  chronic for the patient.
- **No rate planner.** The tile reports the deficit and the over-rapid-correction
  ceilings; the `corrected-sodium` / Adrogué-Madias rate planner owns the actual
  infusion-rate computation, unchanged here.
- **No new input, no new tile, no change to any other tile's output.** v67
  completes one existing calculator's safety logic and nothing else.
