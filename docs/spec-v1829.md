# spec-v1829 — The ceiling already in the regex

> Status: **SHIPPED (2026-11-26)**: `denial-next-step` stops answering a reason code of 999999 by asking for
> the code, because the code's own **format** bounds it. The "entered, and asked for again" category goes
> from **9 to 8**. 1 library file, 1 adapter, 1 test. The catalog stays 2,390.

## Not every ceiling is a clinical judgement

[spec-v1819](spec-v1819.md) read the last rows of this category and set the remainder aside as wanting "a
sourced clinical ceiling" — the rule [spec-v1206](spec-v1206.md) sets, and the right rule for a basophil
percentage or a Breslow thickness. It was the wrong rule for one of them.

A **claim adjustment reason code** is one to three digits. The tool enforces that *one line below* the
guard it was re-asking from:

```js
if (!/^\d{1,3}$/.test(code)) return { valid: false, message: 'Enter the claim adjustment reason code as its number (for example, 50).' };
```

So 999 is the top of the format and 999999 is not a code at all. That is arithmetic about a **format**, not
a judgement about a patient, and it needed no source: it was already written in the regex. The reader who
typed 999999 was told to *"enter the claim adjustment reason code as its number"* — the sentence an empty
box gets — while the tool knew perfectly well what was wrong with it.

Both surfaces state 0 to 999 now, as a whole number, and the three cases separate properly:

| Input | Before | Now |
|---|---|---|
| `1000`, `999999` | "Enter the … code as its number" | "must be between 0 and 999" |
| `50.5` | the same ask | "must be a whole number" |
| `abc` | the ask | **the ask**, which is right — no range describes "abc" |

The group prefix is still stripped first, so `CO-50` reads as 50.

## What this says about the other eight

They were classed together and they are not alike. The test to apply is **"is the bound already written
somewhere in this tool?"** — in a regex, a reader's literal, a label's parenthetical — before asking whether
it needs a source. Five of the eight state their range in the refusal itself and are correct as they stand;
`dose-index` wants a yearly exacerbation count and an FEV1 percent predicted, and
[spec-v1826](spec-v1826.md) settled that the FEV1 half has no published maximum and needs none. The
exacerbation count is the one that genuinely wants a source.
