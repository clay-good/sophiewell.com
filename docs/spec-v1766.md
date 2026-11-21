# spec-v1766 — A survivable value just inside an envelope, refused by a narrower cap

> Status: **SHIPPED (2026-11-21)**: about 60 tools. The catalog stays 2,387.

specs v1764 and v1765 found tools refusing survivable values with an older cap of their own, by grep. The new
`scripts/probe-envelope-inside.mjs` asks directly: for each mapped field it drives 97% of the envelope's ceiling and,
where a floor applies, 103% of its floor, and lists every tool that refuses with a range sentence. On the lab and
vital-sign envelopes it listed 126 values in about 75 tools.

**Widened (103 rows):** each cap now reads `BOUNDS.<key>`. Among them: APACHE II (temperature 20 -> 13 C, heart rate
300 -> 600, pH 6.5 -> 6.3, sodium, potassium 12 -> 15, creatinine 25 -> 75, WBC 200 -> 2,000), PELOD-2, pSOFA, KDIGO
(creatinine 20/30 -> 75), ABCD2 and ABCD3-I and CHARGE-AF (blood pressure), sodium correction, corrected anion gap,
DKA resolution (glucose 2,000 -> 3,000, pH 6.5 -> 6.3), rate-pressure product (its product check 200,000 -> 300,000
so the widened inputs can answer), CROP, Rome ECOPD, and a dozen creatinine, platelet and potassium caps in dosing
tools. Scoring bands, points, clamps and a source's own rules are unchanged.

**Kept (23 rows), each with a reason:** neonatal tools (Bhutani, phototherapy: the AAP curves cover neonates), pediatric
models validated in a range (Schwartz eGFR, SIPA, PIM3), guideline categories (BP categories), the FMCSA driver
examination, a target or reference rather than a measurement (free-water deficit's target sodium, home oxygen's
resting PaO2), and output checks that refuse a result outside its own scale (aMAP, FEUA over 200%, a negative
corrected potassium or metabolic rate). R factor's "ALT" field is the lab's upper limit of normal, now left out of
the map (`OWN_RANGE`).

Not in scope: weight, age, height and BMI rows, which are mostly a tool's validated population (an adult formula
refusing 206 g, an age of 126 past the oldest verified human).

Tests: `test/unit/inside-envelope-v1766-{a,b}.test.js`; seven tests that pinned old caps now pin the envelope.

Follow-up (same day): 11 page fields still declared an HTML limit narrower than the library now accepts (heart rate
400 on OASIS, LODS, REMS, CART and the hemodynamic suite; mitral stenosis 20-250; gastric-emptying glucose 1,500;
compartment diastolic 250; OASIS temperature 20; PIM3 base excess 50), so the page flagged a value it answered. Each
now holds the envelope.
