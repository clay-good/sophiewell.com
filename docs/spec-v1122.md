# spec-v1122 — six organ systems, and one point that mattered in one place

Two more off [spec-v1118](spec-v1118.md)'s list, and they are the two ends of how
narrow a fix should be.

## `qsofa-sofa`: a sepsis score, and the reason every earlier probe missed it

An empty call returned:

```json
{ "qsofa": { "score": 0, "band": "Low mortality risk by qSOFA" },
  "sofa":  { "score": 0, "band": "Low (~10% mortality)" } }
```

**The qSOFA half was right all along.** Its three inputs are checkboxes, and an
unticked box is a real "no" (rule 4) — three negative bedside observations really
are a qSOFA of 0.

The SOFA half was not. Its six organ systems are graded selects that opened on
`"0"`, and `Number(n) || 0` read an ungraded system as a system graded and found
undysfunctional. Six of them came back *"Low (~10% mortality)"*.

**One tile, two halves, one of them correct** — and the correct half is why this
survived. Its result has no top-level `band`: the two scores are nested under
`qsofa` and `sofa`, so every probe in this programme that reads
`result.band ?? result.bandLabel` saw an empty string and moved on.
`scoring-select-probe` reads the *controls*, which is a different question, and
that is what turned it up.

The fix is the usual one: the score is a sum of non-negative grades, so the
higher bands rule in from a subset (rule 13) and only *"Low"* waits.

### And the reader that would have made the fix pointless

The view reads its selects with `nv(id)`, which is `Number(value)` — and
`Number('')` is **0**. Adding a *"Not graded"* option alone would have sent a
grade of zero to a guard testing for a blank, and the guard would never have
fired. The SOFA selects now read through `nvOrNull`.

That is rule 7 from [spec-v1040](spec-v1040.md), reached from the other
direction: *a guard against a missing value is a guard against one shape of
missing value*, and **the reader decides which shape it gets.** Rule 22 says a
guard needs a control that can express the state; this says it also needs a
reader that does not flatten it on the way.

## `startback`: one point, and only one place it matters

The STarT Back tool is eight checkboxes and one graded item — how bothersome the
back pain has been, worth 1 point for *"very much"* or *"extremely"*. That item
fell through to *"not at all"*.

The first instinct is the fix this programme has applied twenty times: withhold
the reassuring reading whenever the graded item is unstated. **It would be
wrong.** The eight checkboxes are real answers, and one point can only cross a
boundary in one place — a total of exactly 3 is low risk and 4 is not:

| total | can the missing point change the tier? |
|---|---|
| 0-2 | no — still low |
| **3** | **yes — low becomes medium** |
| 4+ | no — already past low |

So the tile withholds at 3 and answers everywhere else. Rule 12's test is *is the
missing value expected to be there* — and its corollary, which this wave is the
clearest example of: **refusing where the missing value cannot change the answer
breaks the ordinary case to catch a defect that is not present.**

This is the same narrowing [spec-v1119](spec-v1119.md) had to make on
`glim-malnutrition`, and the second time in four waves the sharper question —
*does this missing value change THIS reading?* — has produced a smaller and
better fix than *is something missing?*
