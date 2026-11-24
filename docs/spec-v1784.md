# spec-v1784 — A saturation of 1500%, and 43 tools that were already right

> Status: **SHIPPED (2026-11-23)**: 1 tool fixed, 6 rows judged, a tenth finder under the ledger gate. The
> catalog stays 2,390.

`scripts/probe-order-swapped.mjs` swaps two values whose order is fixed by definition and keeps the tool
when it still answers. It reported 49 rows and had reported about that many since
[spec-v1737](spec-v1737.md). One is a defect. Forty-three are tools doing exactly what that spec asked for,
and the finder could not tell the difference.

## TSAT 1500%

`tsat` computes a transferrin saturation as serum iron / TIBC x 100. With the two values the wrong way round
-- iron 450 ug/dL, TIBC 30 -- it answered:

> TSAT 1500%: iron-overload pattern; consider hemochromatosis work-up

TIBC is a **capacity**: the total iron-binding capacity is how much iron the transferrin can carry. A
saturation above 100% means the serum iron is above the capacity to bind it, and a reading of 1500% is
almost always a transcription the wrong way round. Offering a work-up for a chronic condition is the wrong
answer to it.

**It is not refused**, and that is deliberate. The serum iron genuinely can exceed TIBC in acute iron
ingestion, and a tool that turned that reading away would be worse than one that states it. So the
arithmetic stays on screen and the sentence says what it means:

> TSAT 1500%: the serum iron is above the total iron-binding capacity, which is the capacity to bind it.
> Check that the iron and TIBC are the right way round and in the same units.

The threshold is 100%, not 99 or 101: a saturation of exactly 100% is a real reading, so iron 300 with TIBC
300 still reads as the iron-overload pattern it did before, and 301 over 300 does not. The claim the
sentence makes is definitional, not clinical -- it says what TIBC is and asks for a check, and names no
condition and no work-up.

Because the right behaviour here is to answer rather than refuse, the row is judged in the finder's ledger
with that reason. The finder's prescribed fix for a number pair is `orderFault`, which refuses; a tool that
answers on purpose has to say why.

## 43 tools the finder could not credit

Date fields are "taken as they come" in that finder, because it cannot know which pairs have an order fixed
by definition -- and most do not. Two completed course dates have none. A notice date and an election date
have one in practice, and a tool should handle an early election by saying so rather than refusing.

So the oracle for a date pair is no longer "the tool still answers" but **the tool answers identically**:

* A swap that **moves** the answer is the tool reading a different chronology and saying so -- "Not yet
  open", "Notice problem", "Does not meet 157.0512". That is the behaviour spec-v1737 was asking for, and
  **43 of the 48 date rows were that**.
* A swap answered **byte for byte the same** is the tool reading the reversed order as the same situation,
  which is the defect shape spec-v1737 found: an ultrasound dated before the last menstrual period, dated
  as usual.

Five rows survive that test, all in `ny-maid-timeline`, and all five are honest for a reason in its cited
source. Public Health Law 2899-f(2) requires the consulting physician's and the mental health professional's
confirmations **before prescribing** and states no order among the four documented steps. So the tool checks
that each is documented and dates only the five-day fill wait from the prescription itself; swapping the
written request with the consulting confirmation is the same situation under the statute as read. They are
judged with that reason.

49 rows become **0 open, 6 judged**, and `probe-order-swapped` joins
`test/unit/finder-ledgers.test.js` -- the tenth finder held to its ledger in both directions.

## The pattern across this session's finders

Four finders have now been narrowed the same way, and the narrowing was always the same discovery: **the
oracle was "did the tool do something", when the question was "did the tool do the right thing".**

| Finder | Old oracle | What it became |
|---|---|---|
| `probe-envelope-inside` | a tool refuses a value inside an envelope | ...and nothing declares the cap ([spec-v1781](spec-v1781.md)) |
| `probe-dated-claims` | a passed date near future-tense words | ...with no later date in the clause, and not in a worked example ([spec-v1782](spec-v1782.md)) |
| `probe-order-swapped` | a swapped pair still answers | ...with an identical answer, for dates |
| `probe-undeclared-cap` | a cap exists and nothing declares it | ...and it is the tool's own, not a shared envelope (spec-v1781) |

Each of those rules is a claim that certain rows are honest, which is why spec-v1782's gate drives a
narrowed finder at a date where it must still find something. A finder that reports nothing is indeterminate
between a clean catalog and a rule that is too wide.
