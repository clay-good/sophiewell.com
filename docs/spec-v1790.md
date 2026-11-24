# spec-v1790 — The developer's name for it, in the reader's answer

> Status: **SHIPPED (2026-11-24)**: 1 finder added, 12 tools fixed, 41 left as its backlog. No arithmetic
> changed; the catalog stays 2,390.

`free-water-deficit` told a reader:

> Implied Na drop 30 mEq/L/24h exceeds the 10 mEq/L/24h ceiling; **extend replaceOverHours or raise
> targetNa**.

The two boxes they had just filled in are labelled "Replace over" and "Target Na". `spadi` refused with
"Unrecognized: **painWorst**", where the item reads "Pain at its worst". `nems` asked for
"**basicMonitoring**". The reader is sent to fix a name they have never seen, by a tool whose whole promise
is plain language.

[spec-v1015](spec-v1015.md) fixed this family once, when a nurse was shown
`weightKg out of range [0.3, 500]` -- "a refusal in the words of a stack trace, from the tool that is
supposed to be the plain-language one". That fixed the SHAPE of the sentence, and `readable()` in
`lib/num.js` keeps it fixed for every caller that passes through it. **A message assembled from a table's
`key` never touches it.** And no gate caught these, because `scripts/check-tile-copy.mjs` scans `views/` for
house vocabulary on screen while the refusals are written in `lib/`.

## The finder

`scripts/probe-identifier-in-refusal.mjs`. For each tool, every field in turn is given a value no scale
accepts, dropped entirely, and set to a quarter and four times its example value -- the first two reach the
"Unrecognized" and "Still needed" branches, and the third reaches a note a tool adds when a valid value is
aggressive, which is how `free-water-deficit`'s sentence appears at all.

A row is a reading whose prose contains one of that tool's **own argument names**, where the name is
camelCase. That restriction is what keeps the finder honest: an interior capital cannot be ordinary English,
and it cannot be an instrument's published notation either. `mest-c` prints "M (Mesangial hypercellularity)"
and `nih-cpsi` prints "q1a" -- both are the published names, and neither is reported. Only a result's PROSE
is read, never its keys: `{"weightKg": 70}` names an identifier without showing one to anybody, and reading
the whole JSON reported 597 rows of nothing.

First run: **175 refusals across 45 tools.**

## Batch one, and two overreaches on the way

The item tables almost always carry the reader's wording already, under `text` or `name`, and `thwaites` has
always printed it: `bad.map((a) => a.feature.text)`. Twelve tools now do the same. Two attempts went wrong
first, and both are worth recording because both would have shipped quietly:

**A blanket `.key` → `.text` rewrite broke three files.** `heaven-criteria`'s items carry `name` (short) as
well as `text` (the full criterion sentence, a paragraph per item); `robarts-index`'s carry neither, and its
adapter labels every item by its Geboes grade, which the item does carry. And `mest-c`'s keys are **M, E, S,
T, C** -- the instrument's own notation, already printed as "M (Mesangial hypercellularity)". The rewrite
replaced all three with `undefined`, which the runtime check caught before anything was committed.

**A generic camelCase spacer mangled an acronym.** `sle-2019-eular-acr` listed its counted items as
"musculoskeletal:jointInvolvement (+6), sleAntibodies:dsDnaOrSm (+6)", and spacing the keys turned that into
"ds dna or sm". That is exactly what [spec-v1785](spec-v1785.md) recorded when `readable()` met prose: an
acronym is not a run of words. It now carries the criteria's published names --
"SLE-specific antibodies: anti-dsDNA or anti-Sm antibody".

Seven tests asserted the old wording, each testing that the refusal NAMES the item. The intent is unchanged
and the expected name is now the reader's: `/otherCauses is blank/` became
`/other causes for thrombocytopenia is blank/`.

## The backlog

**169 refusals across 41 tools**, all the same shape. Two kinds remain:

* the list is built away from the message (`const bad = read.filter(...).map((r) => r.i.key)`, joined
  further down), so the fix is at the construction site;
* the message is a shape this batch did not touch -- `twstrs-severity` has an "Out of range:
  shoulderElevation (0 to 3)" line beside the "Still needed" one the batch fixed.

Each needs the same judgement the three broken files needed: which property on this table is the reader's
word for the item, and is the key already the instrument's own notation. That is a read per file, not a
codemod, which is why this ships as a finder with a batch rather than a sweep.
