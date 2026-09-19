# spec-v1403 — the input no surface supplies

A library can read an argument that neither the page nor the agent tool ever sends. Whatever
branch sits behind it then decides the answer for everyone who could not say it. Four tools did.

| tool | argument read | what nobody could say | was | now |
|---|---|---|---|---|
| `uiss-rcc` | `nodePositive`, `metastatic` | the cancer has spread | a localized tier and its 5-year survival for N1 or M1 disease | a required **Disease extent** field; a blank is asked (see [spec-v279](spec-v279.md)) |
| `ireton-jones` | `obese` | the patient is obese, when height is blank | "not obese": the −609 kcal/day term silently dropped | the spontaneous form asks for the height |
| `ireton-jones` | — (a blank `sex`) | the sex, through the agent tool | read as male, +244 kcal/day | the ventilated form asks for the sex |
| `minor-self-consent` | `married`, `confined` | a married Texas minor; a child in a TDCJ facility | a married pregnant minor got "a parent consents" | printed as a state note (see [spec-v1395](spec-v1395.md)) |

The Ireton-Jones worked example relied on the blank sex (1823 = 1784 − 605 + 400 + **244**). It now
names the sex and the ventilated form explicitly. The page preselects both, so its answers are
unchanged; the agent tool is asked.

## The energy equations had no envelope

Checking the Ireton-Jones height on the page, a height of 170 typed with the unit left on inches
(432 cm) produced *"BMI 4.3"* and an energy figure. No function in `lib/nutrition-energy-v152.js`
checked an envelope: Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Penn State, and Ireton-Jones
all computed from a 432 cm height or an 800 kg weight. `probe-envelope-unbounded` could not see it,
because the Ireton-Jones example uses the ventilated form, which has no height. Each now checks the
`weightKg` and `heightM` envelopes `lib/bounds.js` already declares, after its own missing-value
branch.

## An optional sex, answered as one sex

The Ireton-Jones sex default had two more copies, found by running each worked example with the sex
blank, male, and female:

| tool | blank read as | what it moved |
|---|---|---|
| `ewgsop2` | male | the grip, mass, and index cutoffs: a woman's 20 kg grip was "low strength" against 27 instead of normal against 16 |
| `masld-criteria` | female | the HDL cut (50, not 40) and the MetALD alcohol band (140–350 g/week, not 210–420) |

Both now ask for a blank sex (EWGSOP2 after its own range checks), and both adapters mark `sex`
required. The page preselects a sex, so its answers are unchanged. The tests had leaned on the
defaults and now pass the sex each call was silently getting.

`test/unit/optional-sex-not-defaulted.test.js` is the gate: for every tool whose adapter leaves `sex`
optional (17 today), where male and female answer differently, a blank must not answer exactly like
either. It fails on the old EWGSOP2 code, and it fails if its reach falls under 10 tools.

## The finder

`scripts/probe-unsupplied-input.mjs` compares the keys each compute function reads with the
arguments its adapter declares. It is a finder, not a gate: it prints two accepted rows
(`peds-bmi-percentile` also takes weight and height in place of the BMI; `spetzler-ponce` also takes
a Spetzler-Martin grade in place of the class), and its reach: 1,346 of 1,763 compute functions are
read directly, 21 reshape their input with `toArgs`, and 396 delegate or wrap and are not read.
