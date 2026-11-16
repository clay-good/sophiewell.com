# spec-v1752 — Saturations the envelope map hid

> Status: **SHIPPED (2026-11-16)**: a new arithmetic envelope, two finder blind spots closed, 4 tools. The catalog
> stays 2,387.

A sweep drove bounded percentages to 150. fullPIERS read an oxygen saturation of 150% as "0% probability of adverse
maternal outcome ... under 10%", and ISARIC 4C scored it as normal.

`lib/bounds.js` gains `spo2` (0 to 100%): a saturation is the share of hemoglobin carrying oxygen, so this needs
no recorded extreme. Mapping it exposed two more blind spots in `scripts/lib/envelope-map.mjs`'s exclusion list:

| Term | What it hid |
|---|---|
| `ratio`, unbounded | it matched inside "satuRATIOn", so every "Oxygen saturation" field was excluded; now `\bratio\b` |
| `\bair\b`, `room ` | "SpO2 on room air" is a blood saturation, not the air or room temperature those terms were written for |

| Tool | Field | Before |
|---|---|---|
| `fullpiers` | SpO2 | 150% scored its lowest-risk band |
| `isaric-4c-mortality` | SpO2 on room air | 150% scored 0 points |
| `panc3` | hematocrit | 750% met the hematocrit item |
| `ecmo-titration` | PaCO2, hemoglobin | a PaCO2 of 2,000 and a hemoglobin of 250 g/dL set a sweep and a DO2 |

The last two use envelopes that already existed; the finder simply could not see their labels. Reach is 1,057
fields, and the finder reports 0.

Tests: `test/unit/spo2-envelope-v1752.test.js`.
