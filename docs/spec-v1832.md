# spec-v1832 — Keep the drive, not the grep

> Status: **SHIPPED (2026-11-26)**: the blank-as-zero question becomes a **gated finder** with 41 judged
> rows, replacing a 162-line grep that nobody could act on. Re-driven after this session's hundred-odd new
> guards, it finds nothing new. 1 new finder, 1 gate, no library change. The catalog stays 2,390.

## A grep that could only be read, never run

`probe-blank-coercions` has looked for one source shape since [spec-v1040](spec-v1040.md):

```js
const n = Number(v); return Number.isFinite(n) ? n : null;
```

`Number('')` is 0 and 0 is finite, so that returns **0 for a value nobody entered**, and every
`if (x === null)` guard downstream stops firing. It found four real defects when it was written — and it
prints **162** source lines, its own header telling you to read them rather than fix them in bulk, because
most are a clamp on a rating item whose floor is 0 anyway.

[spec-v1733](spec-v1733.md) answered the question properly by **driving** it instead: blank each field on
the page's path, enter 0 in it, compare. That drive found the one defect the greps had buried
(`allowed-amount` applying a blank cost-share term as zero without a word) — and then it was gone, because
a drive run once is a drive nobody runs again.

## The drive, kept

`probe-blank-as-zero` is that measurement with a ledger and a gate. It drives **3,681** filled number
fields; **77** read a blank exactly as an entered 0; **41** of those also move the answer away from the
worked example with nothing on screen saying the value was not given.

Those 41 are judged, and the reasons group into six shapes rather than forty-one sentences — which is the
point of writing them down, because it makes the three that are *not* like the others visible:

| Reason | Fields |
|---|---|
| a **count** of things present, where none is a real answer | PBAC clots and pads, the dental surface counts, fingertip units, headache days |
| an **amount** in money or units | the billing and cost-share fields |
| a body **area** or fraction | Lund-Browder regions |
| a **dose** of a drug not taken | the levodopa equivalents |
| a reading that **lost a clause** ([spec-v1196](spec-v1196.md)) | `pk-suite`, `fena-feurea`, `vent-sbt-peep` |
| the reading **names what it assessed** | `modified-marshall`'s FiO2 and creatinine |

The last two shapes are the ones to watch: a volume of distribution, a plasma sodium and an FiO2 **cannot
be zero**, and they are here only because the tool drops the lines that need them or says which systems it
scored. A field of that kind that does neither is the spec-v1040 defect, and now it fails a test.

`o2-cylinder-duration`'s flow carries the owner decision of 2026-11-17
([spec-v1759](spec-v1759.md)) that four other finders also record, so the ledger says that rather than
re-deciding it.

## Why the grep stays

It reads source rather than behavior, so it sees the shape in code a worked example never reaches. It stays
a report, and its header now points at the drive that holds the line.
