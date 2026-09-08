# spec-v1120 — two columns nobody looked at, stated as two normal findings

The second pass through [spec-v1118](spec-v1118.md)'s list. Two tiles, and both
are shapes this programme already has names for.

## `crs-grade`: the reading said what it had not been told

The ASTCT cytokine-release-syndrome grade is the **more severe of two columns**,
hypotension and hypoxia, with fever as the floor. Both selects fell through to
`'none'`, and the tile then said so:

> ASTCT CRS grade 1 of 4: fever ≥38°C **without hypotension or hypoxia**.

and at grade 0:

> Does not meet CRS criteria (**no fever, hypotension, or hypoxia**).

Two observations asserted about a patient on CAR-T, where the grade decides
tocilizumab and ICU transfer. Rule 11, on a tile whose whole output is one
sentence.

Because the grade is a **max**, an unstated column can only raise it — so grades
3 and 4 rule in from a subset and are untouched (rule 13), and grades 0 and 1 are
the readings a missing column can undo.

## `truelove-witts`: the fifth "one tile, two gaps, one guarded"

[spec-v1066](spec-v1066.md) fixed this tile. Its comment is exact:

> a systemic criterion nobody measured is not a criterion that is absent. One of
> the four is all that separates severe colitis from moderate

It guarded the four systemic **measurements** and left the rectal-bleeding
**select** beside them alone. Severe acute ulcerative colitis needs *six bloody
stools AND a systemic criterion*, so an unstated bleeding makes severe
unreachable exactly as four unmeasured labs did — and the tile graded
**moderate** for it, ahead of an admission and IV steroids.

The guard's own message asks for it, in as many words:

> Enter the number of stools per day **and whether rectal bleeding is present**.

That is the fifth occurrence of this shape ([spec-v1101](spec-v1101.md)) and the
**fifth tile in six waves whose refusal message named the gap it then walked
past**. The pattern is specific enough to be worth stating: when a guard's
message lists what it needs, the list is a claim, and the code beside it is
usually a subset of that claim.

## Both controls, too

Rule 22 ([spec-v1118](spec-v1118.md)): the guards would have been unreachable
from the page, because all three selects opened on `"None"`. They now open on
*"Not stated"*.

`crs-grade`'s test *"no fever, hypotension, or hypoxia does not meet CRS
criteria"* passed nothing at all, so it was reading two unstated columns as two
made observations — the ninth wave in a row where the suite was pinning the
default rather than the behaviour.
