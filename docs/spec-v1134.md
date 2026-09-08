# spec-v1134 — the troponin-free band, from a date of birth

The scoring-select probe was re-run after [spec-v1132](spec-v1132.md), which is
the programme's own instruction: *the last step of any wave that changes a
control is the probe.* Its two-signal list — a select with no empty option, on a
field the adapter does not require, **and** one that moves the answer — came back
with 20 selects across 13 tiles. Three were defects.

## `hear` — the one that matters most

```
hear({ age: 30 })
  HEAR score 0: very low risk (<= 1) -- the troponin-free band associated with
  ~0.4% 30-day MACE.
```

Nothing was entered but an age. The HEAR score is the troponin-free subset of
HEART, and its whole purpose is to identify the chest-pain patient who can be
worked up **without a troponin** — so this is the reassuring reading of a tool
whose reassuring reading skips a blood test.

`pick(table, key, 'h0')` falls back to the first row of each of the three tables,
and in each the first row is the zero-point level: *history slightly suspicious*,
*ECG normal*, *no known risk factors*. The only guard was on the age.

Each item is worth up to 2 against a very-low-risk cut-off of **1**, so a single
ungraded item can move a patient across the line on its own. The sum is monotone,
so the fix is the usual split:

| Reading | What it does now |
| --- | --- |
| above the cut-off | answers — *"HEAR score **at least** 2: not in the very-low-risk band"* (rule 13, as [spec-v1114](spec-v1114.md) refined it: the verdict is exempt, the number under it is not) |
| at or below it | asks — *"grade the history, the ECG and the risk factors … any one of them can put this patient outside the band that skips the troponin"* |

## `mascc` — the two surfaces assumed opposite things

The burden of illness is the one MASCC item that is not a checkbox.

```
agent omits it   -> pick() falls back to 0, the value of "severe"
page renders it  -> select opens on "No or mild symptoms (5)"
```

Same tile, opposite assumption, **five points** either side of the 21-point line
that separates outpatient oral management from admission. Neither surface said
which it had assumed.

The other six items are checkboxes and an unticked box is a real answer (rule 4)
— it says the reassuring feature is absent, which is what scores 0. So the burden
is the only gap, it is worth 0 to 5, and the range decides: both ends below 21
answers *"at least 9: not low risk, which holds whatever the burden turns out to
be"*; both ends at or above answers; straddling asks, and names the range.

## `modified-fisher` — "None" is a finding

```js
const sah = input.sah === 'thin' || input.sah === 'thick' ? input.sah : 'none';
```

Every other value — an unstated one included — became `'none'`, which grades 0 and
prints *"no subarachnoid or intraventricular hemorrhage"* above a vasospasm risk.
That is an assertion about a CT nobody had read. **Grade 0 is a radiologist's
finding, not the absence of one**, which is the same distinction
[spec-v1106](spec-v1106.md) drew for the frostbite bone scan: `normal` and
`not done` share a grade and are not the same statement.

There is no floor to report here — the grade is read off the blood, so with the
blood ungraded there is no partial reading to withhold half of. It asks. And the
renderer never checked `valid`, so it would have printed "grade undefined"
beside the refusal; that is fixed in the same change (rule 22).

## Two tests asserted the defect

Both fixes failed a pre-existing test on the first run:

```
unknown select keys default to the 0 option        (hear)
unknown SAH key defaults to none (grade 0), never throws
```

Each was written for robustness — *this must not throw on a junk key* — and each
encoded, as its assertion, the exact behaviour that made the defect. Robustness is
kept: nothing throws. What changed is that an unrecognised key is now an ungraded
item rather than a reassuring one.

This is [rule 24](incomplete-input-program.md) with a test in place of a comment:
**writing a default down is what makes it feel handled.** A test that asserts the
fallback *value* rather than the fallback *behaviour* is a defect with a green
tick beside it, and it will outlive several people's attempts to notice.
