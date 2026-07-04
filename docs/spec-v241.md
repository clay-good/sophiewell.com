# spec-v241.md — Geriatric assessment tools: the Groningen Frailty Indicator, the Short Physical Performance Battery, the Osteoporosis Self-assessment Tool, and the five-times sit-to-stand test (+4 tiles → 1046)

> Status: **SHIPPED (2026-07-04).** A geriatrics slice. Adds **4** well-established
> deterministic tools. **Each id was verified absent by a fixed-string scan of the
> extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85 §6.2): the
> catalog carried `sof-frailty-index`, `gait-speed`, `chair-stand-30s`, and
> `osteoporosis-prescreen`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1042 → 1046) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v241 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> scoring rule / formula is re-fetched and cross-verified against ≥2 independent
> open sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v241 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `groningen-frailty-indicator` | Groningen Frailty Indicator | items → 0-15; ≥ 4 frail | Steverink. Gerontologist. 2001 |
| `short-physical-performance-battery` | Short Physical Performance Battery | 3 sub-scores × 0-4 → 0-12 | Guralnik. J Gerontol. 1994 |
| `osteoporosis-self-assessment-tool` | Osteoporosis Self-assessment Tool | (weight − age) × 0.2 | Koh. Osteoporos Int. 2001 |
| `five-times-sit-to-stand` | Five-times sit-to-stand test | time → fall-risk band | Csuka & McCarty. Am J Med. 1985 |

## 3. Source cross-verification (spec-v97)

- **GFI:** 15 items across physical / cognitive / social / psychological domains,
  total 0-15; ≥ 4 frail. Reproduced from Steverink 2001 and Peters 2012.
- **SPPB:** balance + 4-meter gait speed + five chair stands, each 0-4, total 0-12;
  < 10 mobility limitation. Reproduced from Guralnik 1994 and PMC8535355.
- **OST:** (weight kg − age years) × 0.2, truncated; > −1 low, −1 to −4 moderate,
  < −4 high risk. Reproduced from Koh 2001 and APTA.
- **Five-times sit-to-stand:** time for five cycles arms folded; ≥ 12 s increased
  fall risk, ≥ 15 s recurrent-faller risk. Reproduced from Csuka & McCarty 1985 and
  Shirley Ryan AbilityLab.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Counts,
  sub-scores, and times coerce to bounded values; the OST truncates deterministically;
  a blank form yields a bounded score or a "complete the fields" message, never a
  `NaN`.
- **Each tile reports its score / time, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All screen, score, or estimate a value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v241.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v241 RV241 into RENDERERS)
lib/geri-v241.js                         (new: groningen, sppb, ost, fiveTimesSitToStand)
lib/meta.js                              (+4 META entries)
views/group-v241.js                      (new renderer module: 4 renderers)
test/unit/geri-v241.test.js              (new: worked examples)
test/unit/fuzz-tools.test.js             (register geri-v241.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1042 → 1046)
```
