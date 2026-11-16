# spec-v1740 — A negative that cannot be negative, read as zero

> Status: **SHIPPED (2026-11-16)**: 38 tools. The catalog stays 2,387.

The earlier sign-flip finder (spec-v1727) only drove OPTIONAL fields. This drives every numeric field: enter the
worked example's value as a negative, and keep the fields where the answer is byte-identical to entering 0. That
is a silent clamp. Most clamps run toward the band a 0 sits in, which is often the reassuring one.

| Before (examples) | Tool |
|---|---|
| ST deviation -10: "low risk, 99% 5-year survival" | `duke-treadmill` |
| length of stay -3: "LACE 0-4: low risk" | `lace` |
| APACHE II or SOFA negative: "low nutritional risk" | `nutric`, `mnutric` |
| beta-hydroxybutyrate -6: "criteria not met" | `dka-hhs` |
| salicylate level negative: "no EXTRIP criterion met" | `salicylate-toxicity` |
| fever duration -6: "Fever 0 days" | `kawasaki-criteria` |
| estimated blood loss negative: the best 3 points | `surgical-apgar` |

65 rows across 38 tools were fixed the same way: `gradeFault([[label, value, 0, HI]])` before the clamp, in the
function's own refusal shape, with HI the function's own existing bound or `Infinity`. Where that bound already
existed as a silent clamp (Kawasaki 60 days, MAGGIC EF 90, SCORE2 HDL 5 mmol/L, MESA HDL 200 mg/dL, SCORAD
extent 100, PUSH items, SAPS II FiO2 1), a value past it is now refused rather than pulled back. The others:
`bard-score`, `bishop`, `bode-index`, `bronchiectasis-bsi`, `cardiac-power-output`, `faced-bronchiectasis`,
`gap-ipf`, `geneva-original`, `glasgow-imrie`, `hospital-score`, `hscore-hlh` (ferritin, fibrinogen),
`lvh-criteria`, `mehran-cin`, `mesa-chd`, `mods`, `mtp-tracker`, `news2`, `norton-push`, `nosas-score`, `pim3`,
`saps-ii` (FiO2, urine output), `scorad`, `score2`, `score2-op`, `smart-cop`, `snappe-ii`, `tls-cairo-bishop`,
`wells-pe-geneva`, `apap-24h-max` (its adapter and page skipped a negative row as a source not taken).

Kept valid: 0 wherever it is a real reading (PIM3 SBP 0 is cardiac arrest, CAC 0, urine 0, fever day 0). Two
rows are signed by definition and stay accepted: POP-Q point Ba (it runs from -3) and the aortic-root Z score.
`bard-score` now also refuses an entered 0 BMI, AST or ALT (its envelopes start at 1); before, 0 read as blank.

Pages: `hospital-score`, `lace` and `salicylate-toxicity` needed a refusal branch in their view; the rest already
showed one.

Tests: one spec-v1740 case in each tool's own unit test file. Three tests that pinned the clamp were rewritten
(`lvh-criteria` voltages, `mtp-tracker`, `norton-push`).

Finder: `/tmp/probes/neg-clamp.mjs`-style sweep (negated example value answering exactly like 0, excluding fields
with no effect at all). After the fix it reports only the two signed fields.

Follow-up: `pim3` also clamped an SBP above 300 down to 300 without a word; 300 is the page's maximum and
`BOUNDS.sbp`'s ceiling, so it is refused now. Its overflow test drives the predictor through base excess instead.
Still open: PIM3's base excess has no envelope (1e9 answers); it is signed, so it needs a sourced range.
