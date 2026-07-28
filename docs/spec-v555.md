# spec-v555.md — THI (Tinnitus Handicap Inventory) tile

> Status: **SHIPPED (2026-07-28).** Builds the `thi` tile. Catalog **1404 → 1405**, group G.

## Why

`thi`, `thi-25` and `tinnitus` were all zero-hit. The `handicap`/`dhi` hits belong to the **Dizziness**
Handicap Inventory — a sibling in design, not a duplicate. The two measure different symptoms, and a patient
can score high on one and zero on the other.

## What it does

25 items, each answered **Yes (4) / Sometimes (2) / No (0)**. Total 0-100.

| Score | Grade |
| --- | --- |
| 0-16 | 1 — Slight or no handicap |
| 18-36 | 2 — Mild handicap |
| 38-56 | 3 — Moderate handicap |
| 58-76 | 4 — Severe handicap |
| 78-100 | 5 — Catastrophic handicap |

## The two rules a plausible implementation breaks

**1. Every total is even, which is why the bands have one-point gaps.** 17, 37, 57 and 77 are
**unreachable** — every item contributes 0, 2 or 4, and a sum of even numbers is even. A band table with
holes in it looks like an off-by-one to tidy away, and rewriting it as 0-17 / 18-37 / … would misrepresent
the source while changing nothing for any real patient. Asked what band a score of 17 falls in, the correct
answer is that **17 cannot occur**. The lib exports `ODD_TOTALS_UNREACHABLE` so the property is testable
rather than asserted only in a comment.

**2. The subscales are deliberately not computed — a finding, not an omission.** The instrument is usually
*described* as having functional, emotional and catastrophic subscales, so the natural move is to derive
them. Two independent renderings of the item-to-subscale map **disagree on four items** (3, 9, 14, 18) and
do not even agree on the shape of the split — one gives 13/7/5, against a published structure described as
11/9/5. The primary text could not be obtained to adjudicate. Emitting subscores would mean picking one map
on no authority and presenting three numbers a reader would take as the instrument's own. Per spec-v97 the
lib computes only what is double-confirmed — the total and the five grades — and `subscalesReported: false`
says so in the result.

## A provenance note

The 25 items are **Newman and colleagues 1996**; the five severity grades are a **separate British working
group published in 2001**. Both are double-confirmed, but they are different publications, and the result
says so rather than letting a reader attribute the grades to the questionnaire's own authors.

## Scope (spec-v11 §5.3)

It measures **self-reported handicap** — how much tinnitus is affecting this person's life. It does **not**
measure the tinnitus itself: it is not a loudness match, a pitch match, or a masking level, and correlates
only loosely with all of them, so a quiet tinnitus can produce a catastrophic score and a loud one a slight
score. It does not diagnose the cause. It does **not** detect the findings that make tinnitus urgent rather
than chronic — unilateral or pulsatile tinnitus, sudden hearing loss, and associated neurological signs all
need assessment *regardless of the score*, and a low score does not make them benign. Several items overlap
heavily with depression and anxiety, which are common alongside tinnitus and are not what this measures. It
does not select treatment.

## Files

- `lib/thi-v555.js` — `thi()`, `THI_ITEMS`, `THI_OPTIONS`, `THI_MAX`, `ODD_TOTALS_UNREACHABLE`.
- `views/group-v555.js` (RV555) — 25 selects under an **h2**; the intro explains the unreachable gaps.
- `mcp/adapters/thi-v555.js` — wave 380.
- `test/unit/thi.test.js` — 14 tests, including one asserting every reachable total is even.
- `docs/spec-v555.md` (this file).

## Sourcing (spec-v97)

Two independent reproductions of the form agree on the item set, the response values and every band
boundary; they differ only in trivial wording (e.g. "make you feel confused" vs "make you confused").

- Newman CW, Jacobson GP, Spitzer JB. Development of the Tinnitus Handicap Inventory. *Arch Otolaryngol Head
  Neck Surg.* 1996;122(2):143-148.
- McCombe A, Baguley D, Coles R, McKenna L, McKinney C, Windle-Taylor P. Guidelines for the grading of
  tinnitus severity. *Clin Otolaryngol Allied Sci.* 2001;26(5):388-393.
