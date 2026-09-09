# spec-v1179 — the option the module ignored

[spec-v1174](spec-v1174.md) declared a platelet ceiling on 18 inputs so the
browser would show its range warning above the answer, and said so in its own
write-up.

**Eight of the eighteen rendered nothing.**

Each view module carries its own copy of `field(label, id, opts)` — the house
convention — and they do not agree about which options they honour:

| Module | honours |
| --- | --- |
| `group-v25.js` | `min`, `max` |
| `group-v124.js` | `min` only |
| `group-v19.js`, `group-v20.js`, `group-e.js` | neither |

`group-v124.js` is the shape exactly: support was added for the option someone
needed at the time. Nothing failed. The option was accepted, ignored, and the
wave's own write-up said the bound was declared — **verified in the library,
assumed in the view.**

So `sokal-cml` still printed, from a platelet count of 20,000:

> Sokal relative risk **3.9512129886066085e+66** (high risk); ELTS 0.92 (low risk)

with no warning on screen. That is [spec-v1012](spec-v1012.md)'s defect, live, at
a magnitude `no-impossible-number.spec.js` never tries — it drives fields to
`1e308`, `-1` and `0`, all of which trip `app.js`'s 1e9 catch-all, so the
exponent is never *silent* and the assertion holds. 20,000 is also the
[spec-v1174](spec-v1174.md) unit confusion again: 20,000/µL **is** 20 ×10⁹/L,
severe thrombocytopenia in CML.

The four helpers honour `max` now, and all eight fields were re-read **on the
page**: bound rendered, warning raised.

## The gate, and the two ways I got it wrong first

`test/unit/field-helpers-honour-max.test.js` reads the source, because the claim
is about the helpers rather than any one tile. Both of its first two versions
were broken, and both failures are worth keeping:

1. **Brace-matching from the wrong brace.** Starting at the first `{` after
   `function` lands on the *default parameter's* `{}` in `opts = {}`, captures
   the signature alone, and reports every module as an offender — including four
   that were correct. The body starts after the parameter list.
2. **Caller detection defeated by a label.** Scoping subjects with
   `field\([^)]*max:` stops at the first `)`, and
   `field('Platelet count (×10⁹/L) — must be > 0', 'sk-plt', { max: 2000 })`
   **has a `)` inside its label.** So the scan missed the option — in the very
   module whose defect the test was written from. Matching the option itself
   needs no paren-balancing and cannot be fooled by punctuation.

The second was caught only by the negative test: removing the fix from
`group-v20.js` left the gate green. **A negative test is the only thing that
distinguishes "nothing is wrong" from "nothing is being looked at."**

## What is ledgered

18 further modules declare a bound their `field()` drops. Two were verified on
the page rather than in the source — the mistake this wave is about:

```
sodium-correction|na    declares { min: 0, max: 200 } -> renders NEITHER
apc-payment|apc-disc    declares { min: 0, max: 100 } -> renders NEITHER
```

They drop `min` as well. This wave fixed only `max`, and only in the four modules
it had itself declared a bound in, because adding `min` support makes a below-min
value start warning on tiles nobody has looked at — a behaviour change, not a
repair.

## Correction to spec-v1174

Its claim that "18 platelet and WBC inputs now declare theirs" was true of the
source and false of the page for eight of them. The library guards in that wave
are unaffected and were tested; it is the browser half that did not land.

## Verification

`npm run release:check` green. The gate asserts its own reach (20+ modules
examined), caps the ledger so it cannot grow into a home, and fails when the fix
is removed from `group-v20.js` or `group-e.js`.
