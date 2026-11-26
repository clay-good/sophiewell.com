# spec-v1831 — Zero, and a gate to keep it there

> Status: **SHIPPED (2026-11-26)**: the last two rows of the "entered, and asked for again" category are
> closed with numbers the tool was already using, and the category — **225 rows when the programme opened**
> — is gated at zero. 1 library file, 1 adapter, 1 gate. The catalog stays 2,390.

## The last two were never waiting on a source

[spec-v1819](spec-v1819.md) set `dose-index` aside as wanting "a sourced clinical ceiling" for its yearly
exacerbation count, and [spec-v1826](spec-v1826.md) established that the FEV1 percent predicted beside it
has no published maximum to source. Both readings were about the wrong thing. The tool's own readers are:

```js
const fev1 = numIn(o.fev1, 0, 200);
const exac = numIn(o.exacerbations, 0, 100);
```

Both bounds were already written, two lines above the guard that said `0, Infinity` and let an FEV1 of
999999 fall through to a refusal that lists four fields and names none of them as the problem. Nothing here
is invented or sourced: 0-200 and 0-100 are the tool's own working limits, now stated in the refusal and
declared on the agent surface.

That is the third spec in a row where the answer was **already in the file** — a regex in
[spec-v1829](spec-v1829.md), a refusal sentence in [spec-v1830](spec-v1830.md), a reader's literal here —
after the rows had been classified as needing an owner. The test is worth keeping:

> **Is the bound already written somewhere in this tool?** A regex, a reader's literal, a label's
> parenthetical, a sibling tool's version of the same rule. Ask that before asking whether it needs a source.

## 225 to zero

The category is the one [spec-v1806](spec-v1806.md) opened: a field that answers a value the reader
**entered** with the sentence an empty box gets, so retyping it produces the same words. It ran 225 → 35 →
21 → 12 → 9 → 8 → 2 → **0** across sixteen specs, and the last six of those took their numbers from the
tools themselves.

It is gated now, on the **strong** half of the report only. The weak half — 120 fields whose refusal *does*
state its range and happens to share that sentence with the blank case — is a reading list, and correctly
so: a reader who types 999999 and is told "from 1 to 365" has been told what is wrong.

Negative-tested by loosening `dose-index`'s FEV1 guard back to `Infinity`, which fails the gate.
