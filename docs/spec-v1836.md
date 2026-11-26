# spec-v1836 — The key is never an improvement

> Status: **SHIPPED (2026-11-26)**: **114** agent-surface range refusals stop naming a field by its `dom`
> key and name it the way the page does. 1 file, 1 test. No library or catalog change; the catalog stays
> 2,390.

## A cap that sent a tenth of the catalog to the dom

[spec-v1248](spec-v1248.md) set the rule — `lymphocyte-doubling-time` must say *"Earlier absolute lymphocyte
count"*, never `"ldt-alc1"` — and [spec-v1798](spec-v1798.md) moved it into `validateInputs` so declaring a
range could not quietly replace a named refusal with an anonymous one. It carried one escape hatch: *a long
label is no use in a sentence, so the key stands in above sixty characters.*

Sixty characters is a tenth of the declared fields. `niss` told an agent:

> `"ni-a2" must be from 1 to 6; got 999999.`

where the control on the page reads **"Second-highest AIS (1-6; a partial total is reported as a floor)"**.
The reader has no way to find `ni-a2` anywhere, which is the whole defect spec-v1248 named — reintroduced
by the fallback meant to avoid an unreadable sentence.

## The rule the repo already had

**A field names its quantity in the first clause of its label; the rest is explanation.** That is
[spec-v1800](spec-v1800.md)'s rule, written for `scripts/lib/quantity-name.mjs` when a fibrinogen field's
later clause pulled it onto the triglyceride envelope. Applied here it fits **every** declared field inside
the cap:

| | |
|---|---|
| before | `"ni-a2" must be from 1 to 6; got 999999.` |
| after | `Second-highest AIS must be from 1 to 6; got 999999.` |

1,896 declared fields name themselves now and **none** falls back to the dom. The cap on a *clause* is
looser than the cap on a whole label — 80 rather than 60 — because a clause is already the short form:
`cauti-nhsn`'s is *"Consecutive calendar days the indwelling catheter has been in place"*, 67 characters
and perfectly readable, where its full label runs to 107. The longest message the change produces is 110
characters.

The dom remains for a field with no label at all, which is the only case where there is nothing better.

## How it surfaced

Not from a finder. Driving every field out of range and asking whether the refusal shares a word with the
label the reader sees returned 135 rows, and **133 of them are acronym expansions** — the control says
"BMI" and the refusal says "body mass index", "eGFR" against "estimated GFR", "ESR" against "erythrocyte
sedimentation rate". Those are an improvement, not a defect, and a word-overlap test cannot tell them from
the two that were real. The two were `niss`'s pair, and they led to the other 112.
