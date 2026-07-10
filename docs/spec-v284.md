# spec-v284.md — Unit-toggle stragglers: the 21 metric-only fields join the US-default contract

> Status: **BUILT (2026-07-10).** Companion to [spec-v283](spec-v283.md), which flipped the
> shared unit arrays to a US-customary default and deferred this wave. Presentation only: every
> compute still receives its canonical unit via `unitNum`/`unitNumOpt`; no `lib/meta.js` example
> value, no conversion factor, and no MCP adapter changed. `UTILITIES.length` untouched.

## Why

The spec-v283 audit found 21 numeric fields that predate the spec-v184 toggle rollout and were
still plain metric-labeled inputs — 19 `Weight (kg)` fields and the two core-temperature °C
fields — so a US clinician had to convert lb/°F by hand on exactly the tiles spec-v283 was
supposed to fix. This wave converts all of them to `unitField` toggles, which inherit the
US-customary default (lb, °F) from the tagged shared arrays for free.

## What shipped

Each conversion is the same three-line mechanical recipe: `field('Weight (kg)', id, …)` →
`unitField('Weight', id, WEIGHT_UNITS, …)` (metric qualifier dropped from the label — the select
now says it), the read swapped to `unitNum` (or `unitNumOpt` where the field was optional), and
`<id>-unit` appended to the tile's listener/wire list so toggling recomputes.

| View | Fields (tile) |
|---|---|
| group-e | `bw-kg` (bw-bsa-suite), `es-w` (egfr-suite), `mf-w` (maint-fluids) |
| group-f | `ar-w` (anticoag-reversal), `int-w` (icu-nutrition-target), `vte-w` (vte-prophylaxis-dose) |
| group-v5 | `w` ×3 (sodium-correction, free-water-deficit, iron-ganzoni) |
| group-v7 | `abd-wt` (acid-base-deficit) |
| group-v8 | `hep-wt`, `la-wt`, `kp-wt`, `pfd-wt`, `pr-wt` (heparin-nomogram, local-anesthetic-max, ketamine-propofol, peds-fluid-deficit, peds-resus) |
| group-v10 | `nfv-w` (neonatal-feeding-volume) |
| group-v136 / v149 / v169 | `ost-weight` (osteoporosis-prescreen), `dv-weight` (dose-volume, optional), `cw-wt` (cdc-weight-for-age) |
| group-i (°F) | `hyp-t` (hypothermia-rewarm), `hs-t` (heatstroke-decision) |

Peds/neonatal weights (`pfd-wt`, `pr-wt`, `nfv-w`, `cw-wt`) follow the same lb default the
catalog's existing peds unitField tiles (GIR, peds-bmi-percentile) already present after
spec-v283 — one product-wide rule, metric one click away.

**Reproduction safety.** Every converted field except the optional `dv-weight` is covered by its
tile's `META.example.fields`, so the spec-v283 `applyExample` canonical reset applies on load and
every documented example still reproduces byte-identically — including the two temperature tiles,
where this matters doubly because °F→°C is affine (an empty input under a °F default would read
as −17.8 °C instead of 0 °C had the example not covered the field; both are equally invalid, and
both tiles' examples do cover it). Weight is linear (0 lb → 0 kg), so empty-field guards behave
identically everywhere else.

**Verification.** Full-catalog `example-correctness.spec.js` sweep (all 1,144 examples) green
post-conversion; `unit-toggle.spec.js` gains a spec-v284 equivalence test (heparin bolus entered
as 176.3698 lb reproduces the 80 kg example's 6400 units; hypothermia staging entered as 86 °F
reproduces "HT II at 30 C"); tool-interactions, lint, the 7,557-test unit suite, and the build
are green. MCP untouched (adapters feed `example.fields` straight to the lib computes).

With this wave, **every weight/height/temperature input in the catalog either offers the
US-default unit toggle or is intentionally exempt** (unit-pinned analytes per spec-v231/D5,
US-native `bw-hin` inches / `pw-lb` lb fields, and no-variant inputs).
