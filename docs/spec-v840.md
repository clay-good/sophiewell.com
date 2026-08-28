# spec-v840 — Heart Failure by Ejection Fraction (HFimpEF)

## What this gives you

Enter the current ejection fraction and, where there is one, the baseline; get the category
under the 2021 universal definition.

`h2fpef` and `hfa-peff` estimate whether a patient *has* HFpEF. Nothing here classified heart
failure by ejection fraction at all.

## §1 The categories

| | |
|---|---|
| **HFrEF** | LVEF ≤40% |
| **HFmrEF** | LVEF 41–49% |
| **HFpEF** | LVEF ≥50% |
| **HFimpEF** | baseline ≤40%, **a rise of ≥10 points**, and a current value >40% |

All four require **symptomatic** heart failure.

## §2 HFimpEF is a trajectory with three conditions

This is the part most easily simplified into something wrong. **Crossing 40% is not enough.**
A baseline of 38% improving to 42% clears the line but rises only 4 points — that is HFmrEF,
and the tile says so with the arithmetic. Exactly 10 points qualifies; 9 does not. Tested at
the boundary.

## §3 A single measurement cannot decide it

The same **45%** is HFmrEF in a patient with no prior measurement, and HFimpEF in one whose
baseline was 30%. Same number, different category, different conversation.

Any tool that classifies from one ejection fraction **cannot express HFimpEF at all** and will
quietly return HFmrEF for those patients. So the baseline is a first-class field, and when
there is none the tile says outright that the number cannot settle the question.

## §4 Improved is not recovered

The TRED-HF trial withdrew therapy from patients whose dilated cardiomyopathy had recovered
and saw relapse. **The improvement describes the ejection fraction, not the disease**, and is
not a reason to stop treatment. That is carried on every HFimpEF result and on no other.

## §5 An ejection fraction is not a diagnosis

Every category requires symptomatic heart failure. Given a number and no symptoms, the tile
returns *not classified* and says why, rather than naming a category from the value alone.

## §6 Sourcing (spec-v97 gate)

- Bozkurt B, Coats AJS, Tsutsui H, et al. Universal definition and classification of heart
  failure. *Eur J Heart Fail.* 2021;23(3):352-380 — all four categories, including the
  three-part HFimpEF definition with its 10-point requirement, which a summary reading would
  have collapsed to "crossed 40%".

The European Society of Cardiology is among the issuing societies, so
`docs/citation-staleness.md` carries a row.

## §7 Posture

Decision support, not a verdict. It applies a published classification to measurements already
made. It does not start, change or withdraw any treatment.

Catalog 1631 → 1632.
