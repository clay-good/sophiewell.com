# spec-v1086 — reading the labels

[spec-v1053](spec-v1053.md) ends on a line worth repeating: *"I had spent the
session auditing this catalog through test harnesses. This one came from opening
it in a browser and reading the screen."*

Thirteen waves of this programme were harness-driven. This one is what reading
the screen found.

## A label that lost the half that mattered

The Katz ADL scores six activities 0 or 1, and its label said which was which:

> Bathing **(1 independent / 0 dependent)**

[spec-v1081](spec-v1081.md) converted the sliders to number inputs through a
helper that appends its own range, and stripped the trailing parenthetical to
make room. The reader was left with:

> Bathing **(0-1)**

which is a form asking for a number and not saying what either number means. The
same happened to all eight Lawton IADL items. Every gate passed: the scoring is
right, the values round-trip, the refusals fire. The tile just could not be
filled in correctly by someone reading it.

`scoredItemField` now leaves a label alone when it already ends in a
parenthetical, and the three tiles that were stripping their own labels stopped.
It also removes a stutter that had crept into `guss` and `white-song` — *"…
responsive only to tactile = 0) (0-2)"*.

## Two fixes that were never applied

Reading the labels also turned up that **`apgar` and `white-song` still had
sliders**, four waves after [spec-v1082](spec-v1082.md) said they did not. Their
libraries had been changed to refuse an unassessed sign; their controls had not,
so the refusals could never fire.

The cause was mechanical rather than a misjudgment: the edit converting those two
views was chained behind `check-us-english` with `&&`, the check failed on a
British spelling in a label written moments earlier, and the shell dropped the
edit. Fixing the spelling felt like the resolution, so the skipped edit went
unnoticed.

**Nothing downstream could catch it.** `release:check` passed, the full chromium
suite passed, and the whole-catalog sweeps passed — because they work by clearing
fields, and a slider cannot be cleared. A tile that still has sliders is
invisible to exactly the sweeps that would otherwise notice. The blind spot this
programme was written to describe is the blind spot that hid the half-finished
fix.

Both are converted now, and verified on the page in all three states, including
the one that matters most: five Apgar signs genuinely rated 0 still read
**"Severely depressed"**.

## And the two the survey had listed and I had not done

Re-running the probe as a check rather than as a survey also made plain that two
of [spec-v1079](spec-v1079.md)'s thirteen had never been touched.

`epworth` rendered eight sliders resting at 0, so a form nobody had answered read
**"Epworth 0 of 24: normal daytime sleepiness"**. Same treatment: the eight
situations are asked for, and someone who genuinely never dozes still scores 0
and reads normal.

`meows` was the more interesting one, because it was **half fixed already**.
[spec-v1036](spec-v1036.md) gave its six vitals a blank-aware reader after an
untaken observation set scored red on five parameters and called the obstetric
rapid-response team. The pain score was left out of that set — and the reason it
was left out is that its control was a slider, which has no blank to read. The
slider is gone, so the pain score joins the other six.

Its refusal improved on the way past: it recited all six observations whatever
was actually missing, which was already slightly wrong and would have been wronger
with the pain score unmentioned. It now names the outstanding ones — *"Enter the
pain score:"*, *"Enter oxygen saturation, heart rate:"*.

**The probe now reads 5, from 16.** Two are the GCS pair, deferred by decision in
[spec-v1085](spec-v1085.md); three are `flacc`, `painad` and `nips`, whose worked
examples describe a patient in pain and which match only because the
reassuring-word list contains the severity bands "mild" and "moderate". Nothing
in the survey is open and unaccounted for.

## What this says about the verification I was doing

Every wave since spec-v1078 ran `release:check` and the full chromium e2e, and I
treated a clean pair as proof. For a control change it is not, and cannot be. The
check that would have caught this costs about a minute:

```
does the tile render input[type=range] where a rating is expected?
```

`slider-default-probe.spec.js` already asks a version of it, and re-running that
probe after each wave — rather than only to build the queue — would have flagged
`apgar` and `white-song` immediately. It is now the last step of the recipe in
the programme page rather than a one-off survey, and running it that way is what
turned up `epworth` and `meows` as well.

## The lesson

> **A green suite proves the code you changed works. It does not prove you
> changed the code.** Two of these three tiles passed every gate for four waves
> while doing exactly what the programme was fixing, because the artefact that
> makes them wrong — a control with no empty state — is the one thing the gates
> cannot see.
