# spec-v68.md — Align the `ttkg` hypokalemia interpretation threshold to its own spec (Ethier 1990: TTKG >3 = renal K wasting)

> Status: **IMPLEMENTED (2026-06-11). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `ttkg` (transtubular potassium
> gradient) interpreter ([`lib/clinical-v6.js`](../lib/clinical-v6.js) `ttkg()`)
> split its **hypokalemia** band at a TTKG of **2** with an awkward "TTKG >2-4"
> label, but the tile's own committed spec — [spec-v19](spec-v19.md) §3.2.4,
> citing Ethier 1990 — documents the contract as "hypokalemia: **TTKG >3**
> suggests renal K wasting." v68 aligns the code to its own spec: a clean
> `<3` (appropriate conservation) / `>3` (renal wasting) split, structurally
> mirroring the `<7` / `>7` hyperkalemia pair the same function already uses.
> The renderer is unchanged. Every prior spec (v4 through v67) remains in force;
> v68 adds no runtime network call, no AI, and no new tile.

## 1. Thesis

The TTKG is interpreted entirely by where the computed value falls relative to a
context threshold: in a **hyperkalemic** patient an appropriately responding
kidney drives TTKG high (>7), so a low value (<7) flags impaired excretion
(hypoaldosteronism); in a **hypokalemic** patient an appropriately responding
kidney conserves potassium and drives TTKG low, so a high value flags
inappropriate renal wasting. The function encoded the hyperkalemia side cleanly
(`<7` / `>7`) but encoded the hypokalemia side at a threshold of **2** with a
label — "TTKG >2-4" — that named a range without a defined upper edge and
disagreed with the tile's own documented contract.

[spec-v19](spec-v19.md) §3.2.4 (the section that specified this tile) states the
output as: "Hyperkalemia: TTKG <7 suggests hypoaldosteronism; hypokalemia:
**TTKG >3 suggests renal K wasting.**" The implementation used 2. This is a pure
code-vs-spec drift — the fix is to make the code honor the threshold the spec
already published (Ethier JH, Kamel KS, Magner PO, Lemann J Jr, Halperin ML.
*The transtubular potassium concentration in patients with hypokalemia and
hyperkalemia.* Am J Kidney Dis 1990;15(4):309-315), not to introduce a new
clinical judgment.

## 2. The change

### `ttkg` — hypokalemia threshold 2 → 3, clean two-zone label

```
hypokalemia (plasma K < 3.5):
  TTKG < 3  → appropriate renal K conservation (extrarenal loss)   (was < 2)
  TTKG > 3  → renal potassium wasting                              (was ">2-4")
hyperkalemia (plasma K > 5.0):   unchanged
  TTKG < 7  → impaired renal K excretion (e.g. hypoaldosteronism)
  TTKG > 7  → appropriate renal K excretion
```

The hyperkalemia branch, the precondition guards (urine osm > plasma osm; urine
Na > 25 mEq/L), and the computed TTKG value itself are byte-for-byte unchanged.
Only the hypokalemia band string changes, and only in the 2-to-3 TTKG zone, which
now reads as appropriate conservation rather than wasting.

- **Citation:** no new citation. The threshold is the one already named in
  [spec-v19](spec-v19.md) §3.2.4 (Ethier 1990); the tile's META citation
  (Halperin & Kamel, Kidney Int 1998) is unchanged. Neither is a revisable
  guideline document, so no `docs/citation-staleness.md` row is added.
- **Group / audiences / specialties:** unchanged.
- **Inputs / output shape:** unchanged. The band is the same field; only its
  threshold and wording change. The renderer needs no edit.

## 3. Robustness

- The compute stays pure. All five inputs are validated through
  [`lib/num.js`](../lib/num.js) `num()` and the two interpretability
  preconditions return a surfaced `valid:false` guard before any band is set, so
  no `NaN`/`Infinity` can reach the DOM.
- The change is a single threshold constant and two string literals; it cannot
  alter the computed TTKG number, only its interpretation label.
- No output that existed before v68 changes for any TTKG ≤2 or >3 — only the
  2-to-3 zone re-labels. The committed boundary example (TTKG 6.4) and the META
  example (TTKG 6.4, "hypokalemia with renal potassium wasting") are both >3 and
  render identically, so the `example-correctness` sweep passes unchanged.

## 4. Files touched

```
docs/spec-v68.md                (this file)
lib/clinical-v6.js              (ttkg: hypokalemia threshold 2 -> 3, clean label, header note)
docs/audits/v11/ttkg.md         (audit re-run: the spec-aligned 2-3 conservation zone)
test/unit/ttkg.test.js          (+1 test: TTKG 2.8 in hypokalemia reads as conservation)
CHANGELOG.md                    (Unreleased: v68 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `ttkg()` labels a hypokalemic TTKG of 2.8 (between the old and new thresholds)
  as "appropriate renal K conservation," and a TTKG of 6.4 as "renal potassium
  wasting," matching spec-v19 §3.2.4.
- The hyperkalemia bands, the precondition guards, and the computed TTKG value
  are unchanged; the META example still renders "TTKG 6.4 (hypokalemia with renal
  potassium wasting)."
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement.
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness
  (clinical-v6.js already enrolled) with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v68 with a +0 catalog delta.

## 6. Out of scope for v68

- **No three-zone "indeterminate" band.** Some references treat TTKG 2-4 in
  hypokalemia as equivocal. The tile's spec defines a binary contract at 3, and
  v68 honors exactly that contract; it does not introduce a third "indeterminate"
  output, which would be a new clinical-judgment surface beyond the spec.
- **No change to the hyperkalemia side, the preconditions, or the formula.** v68
  aligns one threshold to the documented spec and nothing else.
- **No new input, no new tile, no change to any other tile's output.**
