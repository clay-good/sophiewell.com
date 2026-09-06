# spec-v1088 — the footing belonged to the library

Two small things that make the remaining backlog readable.

## NIHSS told one surface and not the other

`nihss` returned `itemsScored`, `itemsTotal` and `complete`, and the browser
turned them into a sentence:

> Scored from 12 of 13 items; each unrated item can only raise the total, so
> treat this as a floor.

An agent reading `severity` got **"Moderate stroke"** and nothing in the words to
say the exam was three-quarters done. The structured fields were there, but they
are only a disclosure to a caller that reads them, and every other tile in this
programme puts the footing in its text. Its own sibling `mnihss` already did.

The sentence now comes from the library, and the view prints it. One source, both
surfaces, and the agent-side probe stopped counting thirteen fields it was right
to flag.

## The backlog, as shapes rather than a number

`scripts/probe-omitted-item.mjs` reads **91 fields across 51 calculators**. That
is a suspect list, and quoting it as a defect count would be wrong: **34 of the 91
name the absence in wording the shared vocabulary does not carry** — "assessed:
renal 2", "mean of 80 surface scores", "no end-organ criterion entered". Those
are tiles being honest in their own words.

The other **57, across 36 calculators**, say nothing at all. Grouped by what the
missing number *is*, because that is what decides the answer:

| Shape | Fields | Judgment |
|---|---|---|
| **A region with no disease in it** — `pasi`, `easi`, `vasi`, `lund-browder`, `scorad`, `mswat` | 13 | ~~0% body surface involved is a real finding, and each of these prints the regions it summed. Likely correct as they stand.~~ **Wrong — see [spec-v1092](spec-v1092.md).** Printing the regions that scored is not the same as saying the total is a floor, and a region nobody examined contributes exactly what a clear one does. `pasi` and `easi` are fixed; the other four are the next wave. |
| **A count** — `pbac-hmb` | 3 | No pads counted yet is the normal state of a chart being filled in. Correct. |
| **A dependent line that disappears** — `corrected-ca-na`, `aa-pf-suite`, `ipss` | 4 | Already ledgered elsewhere; the number is simply not printed. Correct. |
| **A unit conversion** — `peds-weight-conv`, `lab-interpret` | 4 | A converter with one side missing converts nothing. Correct. |
| **Money** — `drg-payment`, `split-shared`, `allowed-amount`, `nsa-cost-share`, `cob-calc`, `anesthesia-units`, `sequestration-adjust` | 10 | A rate or a setting, on arithmetic rather than a clinical rule. Worth reading, low stakes. |
| **Ruling IN** — `phoenix-sepsis` | 6 | The score drops and still meets septic shock: a floor, the safe direction. |
| **Genuinely open** — `pim3`, `midas`, `icans-grade`, `gold-abe`, `preg-dating`, `nen-who-grade`, `ghent-marfan`, `aat-deficiency`, `era-balance`, `niosh-lifting`, `gardner-robertson`, `amsler-krumeich`, `vasopressor`, and the three valve-stage tiles | 17 | **Start here.** `pim3` is the clearest: it prints `\|Base excess\| (0)` as a term of its own regression. |

The valve-stage tiles are worth taking together: `aortic-stenosis-stage`,
`mitral-stenosis-stage` and `aortic-regurgitation-stage` all grade severity from
several echo measurements, and all three drop a measurement without saying so.

## Why the count moved up before it moved down

It read 95 at [spec-v1085](spec-v1085.md) and 104 after
[spec-v1086](spec-v1086.md) — not a regression. Completing the NIHSS worked
example made all thirteen of its items testable where four had been before, so
the probe could finally ask about nine fields it had never reached. Fixing the
footing took it to 91.

**A finder's count is a function of the examples it walks.** A tile whose example
fills four of thirteen fields hides nine questions from it.
