# spec-v1209 — the clamp that turns an impossible grade into a normal one

`boundsAdvisory` and `inputFault` refuse a value nobody could have measured.
`clampInt(v, lo, hi)` does the opposite, in silence: it moves the value to the
nearest legitimate one and answers as if that is what was entered.

Nineteen call sites across five library modules, and the helper itself is
copy-pasted five times — which is how it got this far without being looked at
(the drift this repo keeps finding; see
[spec-v1201](spec-v1201.md)).

Two of the eleven functions were on `probe-unguarded-sibling`'s residue list at
[spec-v1206](spec-v1206.md), and the clamp is why: it *looks* like a guard.

## What a reader or an agent could actually reach

Being honest about reach is the point of this program, so the eleven functions
split in two and only the first half is a live defect. Ten of the graded inputs
render as a **select** in the browser and carry an **enum** in the agent schema,
so no one could have entered a value off the scale. Those fixes are
defence-in-depth; they change nothing anybody could see.

These four were reachable — a free number field on the page and an unconstrained
number in the agent schema — and each is verified before and after on the agent
surface:

| tile | entered | said before | direction |
| --- | --- | --- | --- |
| `isth-bat` | one bleeding domain graded 9999 | *ISTH-BAT 4 — at or above the ≥ 4 adult male threshold: abnormal bleeding score* | alarming |
| `sic-score` | SOFA total 9999 | *SIC 6/6 … SIC criteria MET* | alarming |
| `modified-marshall` | PaO2 9999 mmHg | *no organ failure among the systems entered* | **reassuring** |
| `cdai-crohns` | 7-day abdominal-pain sum 9999 | scored 21, the item's maximum, with no word | reassuring |

`isth-bat` is the one to sit with: all **fourteen** of its domain grades are free
number fields on the page, and one of them alone crosses the diagnostic
threshold. A grade of 9999 is not severe bleeding — it is not a grade.

## Four tests asserted the harmful behaviour

The clamp was not an oversight anybody had missed. It was **pinned**:

```js
test('each subscore clamps to its published maximum (max total 20)', () => {
  const r = snakebiteSeverity({ pulmonary: 9, cardiovascular: 9, local: 9, ... });
  assert.equal(r.total, 20);
});
```

That is the severest envenomation the scale defines, asserted as the correct
reading of a subscore that is not on the scale. Three more said the same for
`uceis`, `ctsi-balthazar` and `lake-louise-ams`. All four now assert the refusal,
and each keeps a sibling test that the **top of the real scale still scores** —
where a guard stops is the half that goes wrong quietly.

## `gradeFault`, and why it is not `inputFault`

`inputFault` answers "enter it" and "check it" in one pass. That is right for a
function whose only fallback is a field list, and wrong for one whose fallback is
a sentence worth keeping: `mrcSumScore` says *"Grade all 12 muscle groups (six
movements, left and right) 0-5"*, which no per-field *"Enter shoulderL."*
improves on.

So `lib/num.js` gains `gradeFault`, which **skips a blank** instead of reporting
it. That keeps [spec-v1207](spec-v1207.md)'s rule intact from the other side: the
caller's own missing-value branch still runs first, and a reader who left a field
blank is asked for it rather than told the value they did enter is out of range.

Both helpers now build their sentence in one place, so they cannot drift — the
mistake this file exists to stop making, and the one spec-v1201 made when it
recommended `rangeFault` and wrote `inputFault` instead.

Every bound is the scale's own definition or arithmetic, never a clinical
judgment ([spec-v1189](spec-v1189.md)): MRC is 0-5, the Balthazar grade is A-E,
seven days of a 0-3 daily grade cannot exceed 21, a SOFA total is 0-24.

## The unit trap, again

`modifiedMarshall` reads FiO2 as a **percent**. `BOUNDS.fio2` is `0.21-1` as a
**fraction**, so applying it directly would have refused every legitimate value
the field takes — [spec-v1205](spec-v1205.md)'s lesson exactly, and the reason
`BOUNDS.wbc` once refused every CPIS leukocyte count. The same physical claim
stated in this field's unit is 21-100, and a test pins both ends.

## Where this leaves the finder

First, the probe did not notice. Its watched-guard list did not contain
`gradeFault`, so it went on printing two rows this wave had fixed — which is
precisely what the instruction above that list says will happen ("add to this
list, not to a copy of it"). The name is now on it.

With that corrected, **5 modules and 6 functions**, from 6 and 6 — and the count
moved in both directions, which is the part worth saying:

- `mrcSumScore` and `modifiedMarshall` are **gone**: fixed, the two rows this
  wave set out to drain.
- `kfre` and `ufrDialysis` are **new**. Not new defects — `nephro-v127.js` had no
  function calling any watched guard until this wave put one in `rifleAki` and
  `akinAki`, so the module was never comparable and its siblings were never
  asked about.

A guard arriving in a module is what makes that module's unguarded siblings
visible. The reach grew, so a flat count would have understated the work
([spec-v1202](spec-v1202.md)).

## Proof

Lint (19 gates), **13,536** unit tests (27 new) and 448 MCP tests pass. The four
reachable readings are verified before and after through `computeCalculator`, and
`isth-bat` through the browser.
