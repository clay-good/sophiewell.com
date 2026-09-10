# spec-v1225 — arithmetic has no opinion about physiology

The serum-chemistry identities in `lib/clinical.js` and `lib/clinical-v4.js` take
two or three numbers and subtract them. Each validated its inputs with
`num(name, v)` and no ceiling, so the formula ran on whatever arrived:

| tile | impossible input | what it printed |
| --- | --- | --- |
| `anion-gap` | sodium 2000 mEq/L | Anion gap 1876 |
| `anion-gap-dd` | sodium 2000 mEq/L | *"AG acidosis with concurrent metabolic alkalosis"* |
| `corrected-calcium` | albumin 70 g/dL | **−44.8 mg/dL** |
| `corrected-sodium` | glucose 20000 mg/dL | sodium 448.4 / 607.6 mEq/L |
| `corrected-ca-na` | both of the above | both of the above |
| `osmolal-gap` | sodium 2000 mEq/L | a calculated osmolality over 4000 mOsm/kg |
| `winters` | HCO3 600 mEq/L | expected PaCO2 **906–910 mmHg** |
| `abg` | HCO3 600 mEq/L | a primary disorder and a compensation note |

`corrected-calcium` is the one to remember. A **negative serum calcium**, printed
as the answer: an impossible input produced an impossible *output*, which is the
shape spec-v1181 recorded on `cdai-crohns`.

## The cross-surface half

Several of these tiles were **already advising in the browser**. `adviseAll` in
`views/group-e.js` calls `boundsAdvisory` on the same values, from the same
table, and prints the sentence beside the result. The library did not, so an
agent calling `compute_calculator` got `{"anionGap": 1876}` with nothing beside
it — the gap spec-v1205 named, seen from the library side rather than the
renderer side.

## The fix

Each `num()` call now carries the envelope `lib/bounds.js` has published since
spec-v53. `num` already throws a reader-facing `RangeError` that the renderer's
`safe()` wrapper prints as ordinary text, so nothing about the surfacing changed
— only that there is now something to surface.

Every bound is `BOUNDS`'. **No clinical number is decided in this wave.** Each
field's unit was checked against the envelope's own first (spec-v1205: an
envelope is a claim about a quantity *in a unit*) — the calcium and albumin
fields arrive canonicalised to mg/dL and g/dL by `unitField`, and the anion-gap
sodium and chloride are mEq/L, which is the mmol/L the table means.

Three label names were also made readable, since a message nobody could read is
not a refusal: `albuminGdl` had been rendering as *"albumin gdl must be a
number."*

## What was deliberately left

`abgInterpret`'s pH stays on the caller's own 6–8 rather than moving to
`BOUNDS.pH` (6.5–8). `readable('pH')` renders it **"p H"**, and a wave about
making a refusal readable should not ship one that is not. The two envelopes
differ by 0.5 at one end; the label is tracked separately.

## Ledger

`scripts/probe-envelope-unbounded.mjs`: **109 fields / 61 calculators → 94 / 54**
(spec-v1224 took it from 116 / 68). The probe's first section — the rows whose
impossible value produced a *reassuring* reading — has stood at zero since
spec-v1211 and is unchanged.
