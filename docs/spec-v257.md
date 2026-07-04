# spec-v257.md — Diving / hyperbaric-medicine formulas: the nitrox maximum operating depth, the nitrox equivalent air depth, and the pulmonary oxygen-toxicity units (+3 tiles → 1109, the +100 milestone)

> Status: **SHIPPED (2026-07-04).** A diving / hyperbaric-medicine slice, and the
> tile that closes the **+100 program** (1009 → 1109). Adds **3** well-established
> deterministic formulas. **Each id was verified absent by a fixed-string scan of
> the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 3** (1106 → 1109) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v257 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> compute a depth / exposure value). **Every formula is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)). All are Class A
> with no staleness rows.

## 2. What v257 adds (3 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `maximum-operating-depth` | Nitrox MOD | 10 × (PO2max/FO2 − 1) | dive-medicine standard |
| `equivalent-air-depth` | Nitrox EAD | (depth + 10)·(FN2/0.79) − 10 | dive-medicine standard |
| `oxygen-toxicity-units` | Pulmonary OTU | t·[(PO2 − 0.5)/0.5]^0.83 | Wright/Bardin-Lambertsen |

## 3. Source cross-verification (spec-v97)

- **MOD:** 10 × (PO2max/FO2 − 1) metres; PO2max typically 1.4 working / 1.6
  contingency. Reproduced from Wikipedia and TDI/SDI references.
- **EAD:** (depth + 10) × (FN2/0.79) − 10, FN2 = 1 − FO2. Reproduced from Wikipedia
  and medicalalgorithms.
- **OTU:** t × [(PO2 − 0.5)/0.5]^0.83, 0 when PO2 ≤ 0.5; single-dive limit ~615.
  Reproduced from PMC6881196 and DMAC 35.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Fraction,
  depth, pressure, and time inputs coerce to bounded numbers; the OTU zeroes below
  0.5 ATA; a blank field yields a "complete the fields" message, never a `NaN`.
- **Each tile reports its depth / exposure value and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a depth / exposure value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v257.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v257 RV257 into RENDERERS)
lib/dive-v257.js                         (new: maximumOperatingDepth, equivalentAirDepth, oxygenToxicityUnits)
lib/meta.js                              (+3 META entries)
views/group-v257.js                      (new renderer module: 3 renderers)
test/unit/dive-v257.test.js              (new: worked examples)
test/unit/fuzz-tools.test.js             (register dive-v257.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1106 → 1109)
```
