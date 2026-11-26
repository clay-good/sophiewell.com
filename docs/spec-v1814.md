# spec-v1814 — The gap owned on one path and not on another

> Status: **SHIPPED (2026-11-26)**: a new finder asks a question that needs no judgement, and four
> calculators answer it badly. The Cairo-Bishop TLS grade, the 6CIT referral band and the visceral
> leishmaniasis regimen now name what they were never told; the 6CIT's own worked example stops being a
> partial administration. The finder is gated at zero behind 14 read rows, as the 24th. 4 library files,
> 3 tests. The catalog stays 2,390.

## A question with no judgement in it

Every other finder in this family asks whether a tile **should** own a gap, and every row needs a reading.
[spec-v1813](spec-v1813.md) found `lf-mda-regimen` by accident: one of seven scalings of its other inputs
happened to reach the branch where its disclosure was lost. So this one asks what the tile has already
answered for itself:

> with one field left blank, does the tile own the gap in **some** configurations of the others and answer
> without owning it in the rest?

If it does, the tile's own code says the reader is owed a word about that field, and some path does not pay.
There is no clinical judgement in the row: the two readings differ only in the other fields' values, and
the field is missing in both.

**The care is in one extra clause.** Without it the report is 278 rows and nearly all of them are a tile
being right twice: a monotone score states its total as a floor — *"CPIS at least 6/12 on what was entered:
the oxygenation is not stated, and each can only add points"* — and drops that sentence once the entered
items alone cross the cutoff, because then the missing one cannot change the reading. So a silent
configuration counts only where some value of the missing field would still have moved the verdict **there**.
That is 22 rows, and eight of them were defects.

## What it found

| Tool | The reading that did not pay |
|---|---|
| `tls-cairo-bishop` | **Grade III** announced with the creatinine undrawn, where above 6x ULN is grade IV |
| `sixcit` | **"8 of 28 — consider referral"** with a task unadministered, where the score can only rise |
| `visceral-leishmaniasis-2026` | **Paromomycin with miltefosine** with the pregnancy question unanswered |
| `gvhd-grade` | Nothing: it says *"liver not staged"* and the vocabulary did not know the word |

**`tls-cairo-bishop`** already computed the list of end-organ criteria nobody entered, and
[spec-v1696](spec-v1696.md) wrote the sentence — on the *laboratory*-TLS branch. The branch that announces
the **grade** never used it, and the grade is the **highest** of the three end-organ criteria, so one never
entered can only raise it. One clause, on the branch that says the number.

**`sixcit`**'s floor was held back to the normal range. [spec-v1115](spec-v1115.md) reasoned that the score
is monotone, so only the *reassuring* reading waits — but 8-9 is "consider referral" and 10 or more is
"refer", so the **milder of the two actions** was being read from a subset in the same way. Only the top
band is settled, because nothing can raise a total past it. Fixing that exposed something else: the tile's
**worked example omitted one of the three graded tasks**, so the example itself was a partial
administration and its published answer became *"at least 8"*. The example now administers all three.

**`visceral-leishmaniasis-2026`** read an unanswered *"pregnant or breastfeeding"* as **not pregnant** and
said nothing, while recommending the regimen pregnancy excludes, because miltefosine is teratogenic. The
contraception note beside it answers a different question. This is `lf-mda-regimen` again, one spec later,
which is the argument for the finder.

## What it did not find, and one row it was right to leave

Fourteen rows are read and judged, and three reasons cover them. Two are **limits of the method**, worth
writing down because they will recur: `saysGap` matches a gap sentence anywhere in the reading, so a tile
with several optional inputs owns **one** of them in a configuration while being silent about **another** —
`newborn-hypoglycemia-who`'s owning reading names the *weight*, not the unit. And `verdictKey` falls back to
the band when a tile carries no classification field, kept deliberately by
[spec-v1239](spec-v1239.md) — so `metabolic-syndrome`, whose band enumerates the criteria it met, looks like
a verdict moving when the verdict is the same word, PRESENT.

The third is a real and correct silence, and `gardner-robertson` is the one to read.
[spec-v1095](spec-v1095.md) decided it deliberately and wrote the reason in the code: only the
**serviceable** reading carries the missing-measure sentence, because a non-serviceable class already rests
on a measure that was taken and the missing one can only confirm it. The class could be poorer still; the
serviceable-or-not call the instrument exists for cannot change. A finder's row is not a licence to overturn
a decision someone has already made and explained — it is a reason to go and read it.
