# spec-v1189 — the range was printed beside the box

[spec-v1183](spec-v1183.md) and [spec-v1184](spec-v1184.md) activated every
bound that had been *written in code* and dropped. This asks the next question,
and asks it where **no clinical judgment is needed**: the repo had already
written the range down, in the label the reader can see.

```
field('GCS (3-15)', 'p2-gcs', { min: 3, max: 15 })   enforced
field('GCS (3-15)', 'ir-gcs', { … })                 NOT
```

The second says **3-15 on screen and accepts 157**. `app.js`'s backstop only
fires at 1e9, so a transposed digit — the commonest data-entry error there is,
and [spec-v1009](spec-v1009.md)'s whole reason for existing — is caught by a
declared bound or by nothing at all.

## What was found

**14 fields showed a range they did not enforce**, out of 280 whose labels name
one. Four were `GCS (3-15)` and four were FiO2 — the two fields spec-v1009 was
written from, where it recorded *"snappe-ii FiO2 1007% → SNAPPE-II 101 of 162,
high illness severity."*

| field | label | enforced |
|---|---|---|
| `mgap-gcs`, `gap-gcs`, `big-gcs`, `ir-gcs` | GCS (3-15) | nothing |
| `fio2` ×2, `sf-fio2`, `oi-fio2` | FiO2 (0-1) / (0.21-1.0) | nothing |
| `as-age`, `pv-age` | Age (40-79) / (30-79) | nothing |
| `ews-total` | Most recent NEWS2 total (0-20) | nothing |
| `apap-h` | Hours since ingestion (4-24 h) | nothing |
| `da-gh` | Patient global health VAS (0–100 mm) | nothing |
| `gs-ratio` | FEV1/FVC ratio (0–1) | nothing |
| `binet-areas` | Involved lymphoid areas (0–5) | floor only |

**Three of them could not have carried a bound at all** — `group-h`'s `f29d`,
`group-v188`'s `num`, and two local `num` closures in `group-g` had no parameter
for one. That is [spec-v1184](spec-v1184.md)'s finding a fifth time: the support
is missing from the helper nobody had looked at. Each gained it here.

The two age bands are the equations' validated range rather than a physiological
limit, and the label is what makes that fair to enforce: ASCVD says `(40-79)`
beside the box, so a reader who types 35 should be told, not silently scored.

## Measured

| | before | after |
|---|---|---|
| labels naming a range | 280 | 280 |
| **showing a range they do not enforce** | **14** | **0** |
| inputs carrying a bound | 2,065 | **2,079** |
| tiles warning about their own example | 0 | **0** |

## From probe to gate

This shipped as a `-probe` finder, found 14, and became a gate the moment the
count reached zero — a finder is for a question, a gate is for a property, and
this is a property now. It can be a gate precisely because the range is not a
number anyone has to decide: it is the number already printed beside the box.

Negative-tested: with the bound removed from `ir-gcs` alone it fails with
`iss-rts: ir-gcs "GCS (3-15)" -> min=null max=null`. Its reach is asserted too
(>2,000 number inputs, >200 labelled ranges), because a sweep that matched no
labels would otherwise pass while saying nothing.

## One thing the gate itself got wrong first

Its range-matching regex contained a literal en dash, because these labels use
both spellings — `GCS (3-15)` with a hyphen, `(0\u2013100 mm)` with an en dash.
`grep-check.mjs` bans a literal en/em dash in source and **failed the build**,
which is the right outcome and was only seen because `release:check`'s exit code
was read directly rather than through a pipe. Rewritten as `\u2013` escapes, and
re-measured afterwards: still 280 labels matched, so the gate did not quietly
lose its reach over the en-dash half of the catalog.

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. The new gate and `declared-bounds-probe.spec.js` both run in a real
browser.
