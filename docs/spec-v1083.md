# spec-v1083 — two instruments on one tile

The last two entries on [spec-v1079](spec-v1079.md)'s straightforward list are
not single instruments, and that changes the fix.

`norton-push` carries the Norton pressure-injury risk score **and** the PUSH
wound-healing score. `vip-extravasation` carries the Visual Infusion Phlebitis
scale **and** the INS infiltration grade. In both cases the two halves are scored
independently — a nurse runs Norton on any patient and PUSH only when there is a
wound to measure; a cannula site can be graded for phlebitis without an
infiltration grade and the other way round.

So an all-or-nothing refusal would be wrong. This is
[spec-v1045](spec-v1045.md)'s panel shape: **answer with the halves you have.**

## What they said untouched

| | |
|---|---|
| `norton-push` | Norton **20 of 20 (low risk)**; PUSH **0 of 17** |
| `vip-extravasation` | **VIP 0: No signs of phlebitis**; INS 0: No symptoms |

A patient at no pressure-injury risk with a healed wound, and a clean cannula
site, before anyone had looked at any of it.

The two halves reach that from opposite ends, which is why the sliders needed
different treatment: Norton's five items rest at **4**, their best, while PUSH's
three and both VIP/INS scales rest at **0**, theirs. One control convention, two
directions, same reassurance.

## Neither half discloses a partial

Worth stating because the earlier waves often could. On both halves a partial sum
reads the *reassuring* way — Norton's downward (fewer points than the patient
has, but on an inverted scale that is more risk, so it reads alarming, and
[spec-v1036](spec-v1036.md) forbids inventing that too), and PUSH's downward as a
smaller wound. So each half is all-or-nothing **within itself**, while the tile
as a whole reports whichever halves it has.

```
Norton 14 of 20 (at risk); PUSH not scored: measure length x width band,
exudate amount, tissue type (an unmeasured parameter left at 0 reads as a
closed wound).
```

`vip-extravasation` keeps its action banners on the half that *was* graded: a VIP
of 4 still raises "remove cannula and resite" even with the INS grade absent.

## Both worked examples opened on the reassuring reading

`norton-push` was the clearest instance yet — the most reassuring value available
on **both** halves at once (Norton every item at its best, PUSH every parameter
at 0). A tile whose whole purpose is spotting pressure injury opened on a patient
who has none. It now shows reduced mobility and activity, occasional
incontinence, and an existing sacral wound to track: Norton 14 "at risk", PUSH 11.

`vip-extravasation` was 0 and 0. A clean site is the commonest real finding, so
this is the softer call that `apgar` was — but it demonstrates none of the
grading, and this tile's value is its action thresholds. It now opens at VIP 3,
which is where "remove cannula and resite" fires.

## What holds it

An assertion per tile covering both halves present, each half alone, and neither
— including that a **graded** 0 still reports a clean site, which is the reading
that has to survive.

## The lesson

> **"Which instrument is this?" comes before "what does a blank mean?"** Two
> scores sharing a tile share a control convention and nothing else. Treating the
> page as one instrument would have refused a Norton score because nobody had a
> wound to measure.
