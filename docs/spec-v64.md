# spec-v64.md — `calcium-replacement`: the IV-calcium dose, elemental-calcium, and gluconate↔chloride-equivalence calculator

> Status: **SHIPPED (2026-06-10). Catalog 333 → 334.**
> One new bedside tile, `calcium-replacement`, closing the single electrolyte
> the [spec-v29](spec-v29.md) `electrolyte-replacement` ladder omits. Compute in
> [`lib/clinical-v7.js`](../lib/clinical-v7.js) `calciumReplacement()`, renderer
> in [`views/group-v11.js`](../views/group-v11.js), META + citation-staleness
> row, a spec-v11 audit log, 5 unit tests, and the spec-v59 object-aware fuzz
> harness (clinical-v7.js is already enrolled). Every prior spec (v4 through v63)
> remains in force; v64 adds no runtime network call and no AI.

## 1. Thesis

The catalog computes potassium, magnesium, and phosphate replacement
(`electrolyte-replacement`, [spec-v29](spec-v29.md)) and corrects calcium for
albumin (`corrected-calcium`), but it does not compute an **IV calcium dose** —
and calcium is the one electrolyte where the *form* of the salt is itself a
documented, dangerous source of error. Calcium gluconate 10% and calcium
chloride 10% are **not interchangeable gram-for-gram**: per gram of salt,
calcium chloride carries ~273 mg (13.6 mEq) of elemental calcium and calcium
gluconate ~93 mg (4.65 mEq), so chloride delivers roughly **three times** the
elemental calcium of gluconate. A "1 g calcium" order that does not name the
salt — or that is filled with the wrong salt — is a real bedside / code-cart
error. Calcium is given in exactly the high-acuity moments where that error is
most costly: hyperkalemia (ACLS membrane stabilization), symptomatic
hypocalcemia, citrate toxicity in massive transfusion, and calcium-channel-
blocker overdose.

`calcium-replacement` is the §3 calculator that removes the confusion: given a
salt and a dose, it returns the **elemental calcium delivered** (mg and mEq),
the 10%-solution **volume**, and the **equivalent dose of the other salt** that
delivers the same elemental calcium — plus the standard adult dose for the
selected indication, each with the route/rate/precaution caveats. It states the
dose; it does not write the order (the `regulatory.js` / dosing-tile posture).

## 2. The tile

### `calcium-replacement` — IV calcium dose, elemental calcium, gluconate↔chloride
- **Citation:** AHA ACLS 2020 (Panchal AR, et al. *Circulation* 2020;142:S366-S468)
  for the hyperkalemia membrane-stabilization calcium; elemental-calcium content
  per USP / product labeling (calcium chloride 10% = 27.3 mg / 1.36 mEq per mL;
  calcium gluconate 10% = 9.3 mg / 0.465 mEq per mL).
- **citationUrl:** https://doi.org/10.1161/CIR.0000000000000916
- **Group:** Dosing / electrolyte (`F`). **Audiences:** `clinicians`,
  `educators`. **Specialties:** ICU / ED nursing, critical care, pharmacy.
- **Inputs:** calcium product (gluconate 10% / chloride 10%), dose in grams of
  salt, and the indication (hyperkalemia / symptomatic hypocalcemia / citrate
  toxicity).
- **Output:** the elemental calcium delivered (mg + mEq), the 10%-solution
  volume (mL), the **equivalent dose of the other salt** (g + mL) for the same
  elemental calcium, the standard adult dose for the indication, and the
  precaution note (slow IV push on a monitor; calcium chloride sclerosing —
  central line preferred; do not co-administer with bicarbonate or phosphate;
  caution in digoxin toxicity). **Near-neighbors:** `electrolyte-replacement`
  (K / Mg / Phos — complementary, no calcium) and `corrected-calcium` (albumin
  correction, not dosing) — both cross-linked.

## 3. Robustness

- The compute is pure: `product` is gated first (an unknown / non-string product
  returns `null` — no throw, no `NaN`), then `doseGrams` is validated through
  [`lib/num.js`](../lib/num.js) `num({min:0, max:100})`, so a missing / non-finite
  / out-of-range dose throws a `TypeError`/`RangeError` that the renderer's
  `safe()` wrapper catches. Every interpolated number routes through
  `fmt()`/`fmtInt()`/`fmtNum()`; no `NaN`/`Infinity`/`undefined` reaches the DOM
  ([spec-v53](spec-v53.md) §3 / [spec-v59](spec-v59.md) §2.6). `clinical-v7.js`
  is already in the fuzz harness, so the new export is covered on import.
- The dated constants (the gluconate/chloride elemental-calcium content and the
  ACLS hyperkalemia dose) are anchored to a guideline issuer (AHA), so per the
  [spec-v54](spec-v54.md)/[spec-v60](spec-v60.md) citation contract the META
  carries an `accessed` date and a `docs/citation-staleness.md` row, guarded by
  the `check-citations` CI gate.
- The tile renders the explicit "planning estimate, not an order — verify against
  local protocol and an independent double-check" notice, consistent with the
  other dosing tiles ([spec-v62](spec-v62.md) posture).

## 4. Files touched

```
docs/spec-v64.md                  (this file)
app.js                            (+1 UTILITIES row: calcium-replacement, Group F)
lib/clinical-v7.js                (new export: calciumReplacement)
views/group-v11.js                (calcium-replacement renderer)
lib/meta.js                       (META entry w/ citation + citationUrl + accessed + related; +calcium-replacement in electrolyte-replacement's related list)
docs/citation-staleness.md        (+1 row: calcium-replacement, AHA ACLS + USP)
docs/audits/v11/calcium-replacement.md   (spec-v11 audit log)
test/unit/calcium-replacement.test.js    (5 unit tests, >=3 boundary worked examples)
index.html, package.json, README.md, docs/scope-mdcalc-parity.md   (catalog 333 -> 334 across all catalog-truth surfaces)
CHANGELOG.md                      (Unreleased: v64 entry, +1)
```

## 5. Acceptance criteria

- `calcium-replacement` is present: a `META[id]` entry with an inline cited
  output, a `citationUrl`, an `accessed` date, and a `citation-staleness.md`
  row; >=3 boundary worked examples in its unit test (incl. the unknown-product
  null path and the impossible-dose throw); a [spec-v11](spec-v11.md) audit log;
  and it passes [spec-v29](spec-v29.md) §3 (input → computed output).
- `UTILITIES.length` is **334** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree (`check-catalog-truth` + `grep-check` clean).
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite / `Invalid Date` leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v64 with the +1 delta.

## 6. Out of scope for v64

- **No calcium-channel-blocker / hyperkalemia *protocol* engine.** v64 computes
  the calcium dose, elemental content, and salt equivalence; it does not encode a
  full hyperkalemia bundle (insulin/dextrose, beta-agonist, bicarbonate, K
  removal) or a CCB-overdose algorithm. Those are multi-drug protocols, not a
  single deterministic calculator.
- **No weight-based pediatric calcium dosing table.** The adult elemental-calcium
  arithmetic and the salt equivalence are weight-independent; a peds mg/kg dosing
  ladder is a separate, larger piece of work and is deferred.
- **No change to `electrolyte-replacement` or `corrected-calcium`** — v64 adds a
  sibling, it does not modify the existing tiles' output.
