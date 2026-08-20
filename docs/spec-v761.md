# spec-v761.md — The dropdown and the tile must say the same number

> Status: **SHIPPED (2026-08-20).** Test only. No behavior change. Catalog stays **1564**.

## Why

`lib/query-compute.js` answers 21 tiles inline, so the search listbox shows a value **before** the
reader opens anything. Selecting that row routes to the tile with the parsed inputs prefilled, and
the tile computes the number again from those inputs.

Two computations of one number, on two surfaces, with nothing asserting they agree.

They did not agree, and it was live. `queryCompute` returns values in each field's **canonical**
unit, but a unit select pre-selects the US-customary option (spec-v283), so:

```
crcl 72F 68 kg cr 1.4
  listbox   38.99 mL/min
  tile      17.69 mL/min
```

Two different numbers for one question, neither labelled, no gate. [spec-v754](spec-v754.md) fixed
the cause; this pins it shut.

## What it does

One probe per template. Route each one, and assert the tile reproduces the template's own primary
`value`.

**It compares `value`, not the display string.** Comparing every number in the listbox text sounds
equivalent and is not — it pulls digits out of labels (`A1c` → `1`) and formula notation (`4-2-1`)
and out of the *inputs* the tile has no reason to echo back. The first cut of this test reported
three disagreements that were all artifacts of exactly that. `value` is the one number the template
asserts; the tile has to reproduce it. Tolerance is a rounding step, because the surfaces format
differently (`60` vs `60.0`, `24-28` vs `24.0 to 28.0`).

A template with no probe here is a template with no agreement check, so the test also fails when a
probe stops firing — adding a template without a probe cannot pass silently.

## Verified to have teeth

A gate that passes proves nothing until it fails on the bug it exists for. With
`resetUnitsToCanonical` disabled, it reports:

| tile | listbox | tile |
|---|---|---|
| `cockcroft-gault` | 38.99 | **17.69** |
| `bmi` | 24.7 | **17359.7** |

## Where it lives

- `test/integration/inline-compute-agreement.spec.js` — new. Chromium only, same rationale as the
  other whole-catalog sweeps.

## Proof

- 21 templates, all agreeing. ~27s.
- Negative-tested against the original defect, above.
