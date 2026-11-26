# spec-v1807 — The guard that ran after the question

> Status: **SHIPPED (2026-11-26)**: 14 more fields stop answering a value the reader entered with "Enter
> it", taking [spec-v1806](spec-v1806.md)'s strong category from **82 to 68**. Two of them already had the
> right check — it ran one branch too late. No tool's arithmetic changed; the catalog stays 2,390.

The second wave of the same shape, and it is where the codemod stops being the whole answer. Sorting the
remaining 82 rows by what blocks the mechanical fix:

| Shape | Rows | Why the codemod cannot take it |
|---|---|---|
| a loose `== null` guard | 12 | the pattern matched only `=== null` — widened, and these are fixed |
| the function **destructures** its parameter | ~10 libraries | there is no `o` for a generated `o.field` to read |
| the right check exists, **one branch too late** | 5 | nothing to insert; the fix is ordering |
| no missing-value guard at all | 4 | there is no branch to insert before |

## The guard that ran after the question

Two of them are worth reading, because the check was already written and already correct:

```js
const a = pos(age);                 // pos() nulls anything at or below zero
if (a == null) {
  return { valid: false, band: 'Enter the patient age (years) to compute the 4PEPS total.' };
}
const ageFault = boundsAdvisory('ageYears', a);     // never sees a negative
if (ageFault) return { valid: false, band: ageFault };
```

`4peps` has had the age envelope since it was written. It never fires for a **negative** age, because `pos`
turns that into the same null a blank gives and the branch above answers first. `nac-dosing` is identical
with a weight. In both, the envelope is now asked **of the raw value, before the question** — so the reader
who typed -999999 is told the range instead of being asked for the number they just gave.

## The loop closed on itself again

Adding the lymphocyte-percentage range to `hodgkin-ips` created a cap of 0 to 100 that nothing declared, and
`probe-undeclared-cap` — gated at zero since [spec-v1801](spec-v1801.md) — said so on the next run. It is
declared. That is the third time this session a fix in one finder's territory has handed work to another's,
and it is the system working: a guard the library keeps is a range the agent surface should state.

## And the codemod went wrong the same way twice

[spec-v1806](spec-v1806.md) recorded one insertion landing in the wrong function. It happened again in the
same file, and the same gate caught it: `hodgkin-ips`'s albumin, hemoglobin, white-cell and lymphocyte
fields went into `cllIpi`, which sits above it in `lib/lymphoma-v135.js`, and
`probe-unsupplied-input` failed with *"cll-ipi reads albumin, hgb, wbc, lymphCount, lymphPct, which no
surface supplies."*

Twice is a pattern, and the lesson is about the **fallback** rather than the regex: when the generator could
not resolve a tool's compute function it fell back to the camelCase of the tool id, and a fallback that
guesses will sometimes guess a function that exists and is wrong. The block is placed by hand, and a check
over all 64 inserted blocks confirms every `o.field` is an argument its own tool declares.
