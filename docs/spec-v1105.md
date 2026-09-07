# spec-v1105 — the guard was in the adapter, so the page never got it

[spec-v1103](spec-v1103.md) found a refusal written in a *renderer*, which meant
only the browser had it, and wrote that down as rule 18: **a guard in a renderer
is a guard for one surface.** This is the same rule from the third side. The
guard was in the **adapter**, so only agents had it — and the page said the
thing the rule was written to prevent.

## `snakebite-severity` printed five examinations nobody performed

`mcp/adapters/enviro-v111.js` has marked all six body systems `required` since
[spec-v1073](spec-v1073.md), and its own summary says it in words:

> Every system is required: an unexamined system is not a system scored 0.

`lib/enviro-v111.js` read a missing sub-score as `0` anyway, and the browser
goes through the library:

```
snakebiteSeverity({ local: 2 })
  -> "SSS 2/20: lower third of the 0-20 range (minimal-mild)
      (pulmonary 0, cardiovascular 0, local wound 2, GI 0, hematologic 0, CNS 0)"
```

Five system examinations stated as findings (rule 11), in the **identical
sentence** a complete examination with five normal systems produces. This is the
`masld-criteria` shape from [spec-v1104](spec-v1104.md) — two very different
clinical states rendered the same way — and the tile named in the programme map
as the one still open.

**And the control could not say otherwise.** The six selects were built from
`SUB_OPTS`, which starts at `0`, so the tile *opened* reading
`SSS 0/20: no envenomation findings scored` for a snakebite patient nobody had
touched. That is rule 8, and it is why the library fix alone would not have been
enough: with no empty option, the guard would never have been reachable from the
page — the mistake [spec-v1078](spec-v1078.md) found on the NIH Stroke Scale.

Both halves are fixed. The SSS is a **sum**, so a partial one is a floor:

| Reading | Footed? |
|---|---|
| upper third (severe), ≥ 14 | no — it rules in, and the unexamined systems cannot lower it (rule 13) |
| lower and middle thirds | yes — *"a floor, not a severity reading — scored from 1 of the 6 body systems, and the unexamined ones can only raise it"* |
| *"no envenomation findings scored"* | now requires all six to have been examined |

The per-system list prints `pulmonary not examined` where it used to print
`pulmonary 0`, and the tier sentence says the rule rather than repeating the
roll-call — one paragraph, not two.

## `cauchy-frostbite`, next door, and an option that meant two things

The frostbite grade is `Math.max` of three findings, so a finding not yet made
can only **raise** it and every grade below 4 is a floor. Grade 1 printed
*"no amputation, no sequela"* with the day-2 bone scan and blisters outstanding
— a prognosis, given before the tests it depends on.

Writing the footnote turned up why it had not been written before. The bone-scan
select offered **four** options where the adapter declares **five**, because one
of them read:

> Not done / normal uptake

Those are not the same answer. A normal scan is a finding that does not upgrade
the grade; an undone one is no finding at all. **While they shared an option, no
honest disclosure was possible** — the tile could not tell the reader which of
the two it had been told. The select now offers both, matching the five values
the adapter has always accepted, and the blister select gained a *"Not
recorded"* option.

With that the grade discloses what is outstanding, on `not-done` and on an
omitted key alike, and stays quiet at grade 4, which is the ceiling.

This one **discloses rather than refuses**: on day 0 there are no day-2 findings
at all, so refusing would break the ordinary case to catch the defective one
(rule 12).

## The gate this wave did not build

`test/unit/mcp-enum-values.test.js` asks that *every value an agent may pass is
a value the tool offers* — it computes each declared value and checks the tile
answers. It cannot see the other direction, which is the one that was wrong
here: **a `values` list the on-screen picklist does not offer.** Four real
agent-facing bugs were found by hand in that direction once before, and this is
the fifth.

Recorded rather than built because the check needs the rendered DOM and belongs
with the other catalog sweeps rather than in the unit chain. It is the next
thing this programme should do.
