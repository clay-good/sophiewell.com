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

## The finder

`scripts/probe-unsupplied-input.mjs` compares the keys each compute function reads with the
arguments its adapter declares. It is a finder, not a gate: it prints two accepted rows
(`peds-bmi-percentile` also takes weight and height in place of the BMI; `spetzler-ponce` also takes
a Spetzler-Martin grade in place of the class), and its reach: 1,346 of 1,763 compute functions are
read directly, 21 reshape their input with `toArgs`, and 396 delegate or wrap and are not read.
