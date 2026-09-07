# spec-v1104 — a diagnosis of exclusion, without the exclusions

The finder's **third** section, *verdict could change* — 33 fields across 23
calculators, and the bucket [spec-v1098](spec-v1098.md) called *"worth a pass;
not a defect list"*. It was right about most of it, and wrong about two rows —
one of which turned out to be much larger than the row that found it.

## `masld-criteria` reported "no cardiometabolic criterion" about five it had not looked at

The 2023 nomenclature has four categories under steatotic liver disease. Three
of them are reached by something **found**: MASLD by a cardiometabolic criterion
that was met, MetALD and ALD by an alcohol intake that was entered. The fourth,
**cryptogenic SLD**, is defined entirely by **absence** — steatosis with *none*
of the five criteria and no other cause. It is the only one a gap can invent,
and it was the one the tile gave away.

Every criterion is a disjunction of measurements and treatment flags, and each
measurement was read through a helper returning `null` for a blank. So a
criterion **nobody measured** looked exactly like one that had been **measured
and was normal**:

```
masldCriteria({ hepaticSteatosis: true })
  -> "Cryptogenic SLD — hepatic steatosis with no cardiometabolic criterion."

masldCriteria({ hepaticSteatosis: true, bmi: 22, fastingGlucose: 85,
                systolic: 110, diastolic: 70, triglycerides: 90, hdl: 60 })
  -> "Cryptogenic SLD — hepatic steatosis with no cardiometabolic criterion."
```

**The same sentence for a complete normal workup and for a form nobody filled
in.** On screen it came with `Cardiometabolic criteria 0/5`, which reads as five
things checked and found absent. That is rule 11 — *asserting the measurement is
worse than assuming it* — on a whole panel at once.

And the count is monotone: criteria can only be added as labs come back. So
cryptogenic is the *reassuring* reading in the only sense that matters here, and
any one of the five would have moved it to a named disease with its own
surveillance.

## Assessed is not the same as met

The fix separates three states per criterion, where there had been two:

| | means |
|---|---|
| **met** | a limb reached its cut, or its treatment box is ticked |
| **not met** | a limb was observed and did not reach its cut |
| **not assessed** | no limb was observed |

Two decisions inside that, both of which could have gone the other way:

**An unticked treatment box does not assess the measurement beside it.** Rule 4
says a checkbox is a real answer, and it is — *"not on an antihypertensive"* is
an answer about treatment. It is not an answer about the blood pressure. A
ticked box is different: it meets the criterion outright, so it assesses it
either way.

**One limb is enough to call a criterion assessed.** Strictly, a normal BMI with
an unmeasured waist circumference does not exclude central adiposity — that is
the phenotype the waist limb exists for. But a waist circumference is not
routinely recorded and a BMI is, so requiring both would refuse the ordinary
chart to catch the defective one. Rule 12 is the test, and it says no.

## What changed, and what deliberately did not

`masldCriteria` refuses the **cryptogenic** reading alone, naming the criteria
that were not assessed:

> Enter a body mass index or waist circumference, a fasting glucose or HbA1c, a
> blood pressure, a triglyceride level, an HDL cholesterol: cryptogenic SLD
> means steatosis with NONE of the five cardiometabolic criteria, and 5 of them
> have not been assessed. Any one of them would make this MASLD.

The refusal still carries `bmiCut`, `waistCut` and `hdlCut`. Those are derived
from the sex and ancestry alone, so they are right whatever is still missing —
unlike [spec-v1037](spec-v1037.md)'s `smart-cop`, where the absent value was
what *chose* the thresholds and printing a breakdown would have measured
everything against the wrong ones. A reader being asked for five labs should be
told what they will be compared against.

**`SLD of specific etiology` discloses rather than refuses.** A specific other
cause was recorded, so something was ruled *in*; but "no cardiometabolic
criterion" is still a claim about five measurements, so the band now names the
ones not taken and says any of them would also make this MASLD.

**MASLD, MetALD and ALD are untouched.** Rule 13: a reading that already rules
in needs no footing, and the missing criteria cannot lower a count that has
already reached one. `1 of 5 cardiometabolic criteria` stays as it is —
it describes what was met, the tile lists the met criteria by name beside it,
and the number is not graded (one is as diagnostic as five). Recorded here so a
later pass does not re-open it.

## Four existing tests were written against the fabricated reading

The same shape [spec-v1102](spec-v1102.md) found on `nichd-fhr`. *"The BMI cut
is ancestry-specific"* asserted `Cryptogenic SLD` from a call passing a BMI of
24 and nothing else — testing the cut, and incidentally depending on four blank
criteria reading as negative. Each now passes a complete normal panel plus the
value under test, so the assertion is about the cut and cryptogenic is a reading
someone could actually have earned.

## `phoenix-sepsis`: one normal platelet count ruled out sepsis in a child

The probe's row was narrow: dropping the mean arterial pressure moved a child
from **Phoenix 7 — septic shock threshold** to **Phoenix 5 — sepsis threshold**,
because shock turns on the cardiovascular sub-score being 1 or more, and the
whole cardiovascular limb reads `x === null ? 0 : …`.

Reading the tile found the bigger half. Phoenix is a **sum** of nine
organ-system values, so what is entered is a **floor** — and the tile gave the
below-threshold reading from any subset of it:

```
phoenixSepsis({ ageMonths: 60, platelets: 250 })
  -> "Phoenix 0/13 — below the Phoenix >= 2 organ-dysfunction threshold for sepsis"
```

Two readings depend on *not* reaching a threshold, and both are now guarded:

| Reading | Fix | Why |
|---|---|---|
| **below the sepsis threshold** | disclose: *"scored from 2 of 9 organ-system values … the ones still blank can only raise it, so this is a floor and does not rule sepsis out"* | rule 3 |
| **sepsis, not shock** | append: *"Septic shock is not ruled out: the cardiovascular sub-score is 0 and a vasoactive-medication count, a lactate, a mean arterial pressure were not entered"* | rule 13 the other way round — Phoenix ≥ 2 rules sepsis in and needs no footing, but shock is a **second** threshold, and calling it absent is a rule-out of its own |

The headline moves too, not only the paragraph: the label reads
`Phoenix 0 so far — below the threshold on what was entered` rather than
`Phoenix 0 — below sepsis threshold`. That is rule 14, learnt on `isgps-dge`.

**Two things are answers, not gaps.** `support: 'none'` means room air, which
correctly scores no respiratory points, and the fixed-pupils control is a
checkbox (rule 4). The other nine are measurements.

The existing test *"below the sepsis threshold (score 1)"* passed four of the
nine and left five blank — and its assertion survived the fix only because the
new sentence happens to contain the same substring. It now passes a complete
panel, and the partial case has a test of its own.

## The other 32 fields

Read one at a time; none is a defect. Grouped by why:

| Why | Tiles |
|---|---|
| **Names the default in the answer** | `qp-qs` (*"default 98"* on the label), `popq-staging` (*"absent after hysterectomy"*), `ipss` and both `posas` tiles (*"reported separately, not in total"*), `adrenal-ct-washout` (says *relative* or *absolute* washout depending on which it could compute), `nen-who-grade` (*"graded on the Ki-67 index alone"*), `modified-marshall` (*"assessed: renal 2"*) |
| **Refuses to classify already** | `ph-hemodynamics-2022` returns *"Pulmonary hypertension, not yet classified"* without the wedge pressure or the cardiac output |
| **Verdict does not actually move** | `hpa-glaucoma`, `aat-deficiency`, `systemic-mastocytosis`, `nhsn-vae` — the detail line changes, the classification does not |
| **Fixed in an earlier wave** | `aortic-stenosis-stage` ([spec-v1091](spec-v1091.md)), `nhsn-vae` ([spec-v1098](spec-v1098.md)), the two Silness-Löe indices — *means*, not sums, with no direction to disclose ([spec-v1098](spec-v1098.md)) |
| **Absent is the documented meaning** | `hf-ef-classification`: no baseline ejection fraction is how a first measurement presents, and HFimpEF requires a prior one to have improved from |
| **A count where none is the ordinary state** | `intubation-difficulty-scale` — *operators beyond the first* and *alternative techniques used* are zero on a routine intubation, which is what the ledger in `rated-items-are-required.test.js` calls counts rather than grades |
| **The defect, fixed above** | `masld-criteria`, `phoenix-sepsis` |
| **Both readings alarm** | `gardner-robertson` — omitting the speech discrimination gives class III rather than class V, and both are *"not serviceable hearing"* |
| **The probe's substituted value is implausible** | `ghent-marfan` and `igg4-rd-2020` move only when the finder supplies a value that meets the criterion, which is the finder demonstrating that a criterion is a criterion |

With this the finder has no unexplained rows left in any of its three sections.

## What the third bucket was worth

[spec-v1098](spec-v1098.md) called it *"a weaker signal by construction"* and
budgeted a pass rather than a fix list. That held: 30 of 32 rows are correct
behaviour, and writing down *why* for each took longer than the two fixes did.
But the weaker signal still found `phoenix-sepsis`, whose real defect —
ruling out paediatric sepsis from one lab — is larger than anything the
stronger sections turned up in the previous ten waves. **A prioritiser ranks
what to read first; it does not rank what is there.**
