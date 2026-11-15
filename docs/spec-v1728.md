# spec-v1728 — A value entered with the wrong sign, read as not entered

> Status: **SHIPPED (2026-11-15)**: fixes to 15 tools and a new finder. The catalog stays 2,387.

spec-v1724 found two answers decided by a sign, with a one-off command. This keeps that sweep as
`scripts/probe-sign-flipped.mjs` and asks two questions of every number field whose worked example is positive:

| Question | Rows | Result |
|---|---|---|
| An optional field set to -x answers exactly like the field left blank | 34 | 13 confirmed on the page, 18 more open to agents; all fixed |
| -x answers exactly like x, at the example AND at a second magnitude (a silent `Math.abs`) | 0 | none; at the example alone 18 matched, all band coincidences (-17 and 17 are both in the lowest BMI band) |

Negative test: on the pre-spec-v1724 `amsler-krumeich` library the finder reports `ak-refraction = -6`; on the
current one it reports nothing.

## Fixed on the page and for agents (7 tools)

The value was dropped, and the answer then asked for it.

| Tool | Field(s) | What happened |
|---|---|---|
| `ktv-urr` | UF volume, session time, post-dialysis weight | "enter UF volume (L), session time (h) and post-dialysis weight" after -3 was typed |
| `ckd-epi-cystatin` | serum creatinine | "enter serum creatinine for the combined estimate" |
| `ecmo-titration` | current and target PaCO2, Hb, SaO2 | a negative target was replaced by the default 40 mmHg; the others read as not entered |
| `midas` | the five questions and both ancillary items | a negative day count read as 0, and a count above 92 (three months) was clamped to 92 |
| `preg-dating` | CRL | a CRL outside 1 to 120 mm was skipped, on the page and for agents |
| `vasopressor` | dose, pump rate | a dose or rate of 0 or below was skipped, on the page and for agents |
| `o2-cylinder-duration` | flow | the view turned a negative flow into 0; the library's own range check now sees it |

## Fixed for agents (8 tools, 18 fields)

On the page these inputs declare `min`, so spec-v1009's range warning already spoke. The agent adapters declared
no range, so an agent's negative value reached the library and read as blank. Each field now declares `min: 0`
(ABI pressures, diagnostic 2x2 prevalence, King's College INR and creatinine, modified Marshall FiO2 and
creatinine, O2 flow, Phoenix ratio, vasoactive count and MAP, the PK suite's Vd, CL, Cp and interval, UDCA
baseline ALP). The agent layer's range message also read "from 0 to undefined" for a one-sided range; it now
says "must be at least 0".

Tests: `test/unit/sign-flipped-fields.test.js` (the library refusals, the agent fences, the MIDAS clamp and the
CRL range).
