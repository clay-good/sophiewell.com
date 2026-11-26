# spec-v1826 — Three quantities, three different answers

> Status: **SHIPPED (2026-11-26)**: no code changed, and that is the finding. The last three quantities on
> `probe-unguarded-sibling`'s wanted list were taken as far as the sources allow: one is **closed and needed
> no fence**, one is a **real exposure with no citable extreme**, and one **prints an impossible figure** and
> would need a number chosen rather than cited. The searches are recorded so nobody repeats them. The
> catalog stays 2,390.

## Why a spec for three non-findings

[spec-v1731](spec-v1731.md) listed the quantities `lib/bounds.js` could not refuse.
[spec-v1823](spec-v1823.md) took the total cholesterol and the CRP from case-report extremes;
[spec-v1825](spec-v1825.md) took the urine creatinine from CDC's own reportable range. Three were left, and
a list that says only "needs a source" invites the next reader to run the same searches and reach the same
dead ends — which is the cost [spec-v1817](spec-v1817.md) measured when a residue was *described* rather than
written down.

## FEV1 percent predicted: closed, and it needed no fence

`gold-spirometry`, `bode-index`, `bronchiectasis-bsi` and `faced-bronchiectasis` give the **identical
reading** at 80%, 160% and 999999%:

> Obstruction present (FEV1/FVC 0.6 < 0.70); GOLD 1 — mild (FEV1 >= 80% predicted)

Because every one of those instruments has an **open-ended top band** — GOLD 1 is "≥ 80%", BODE's is
"≥ 65%", FACED's "> 50%", BSI's "≥ 50%". An absurd value lands in the same band as a normal one and scores
the same points. **There is no wrong answer to fix**, only an uncaught typo, and an envelope would be a
fence against the typo rather than against a wrong reading.

No individual maximum is published either: group means reach about **122%** in swimmers, and supra-normal
values appear in **14%** of an elite cohort measured against GLI, but no extreme is reported. So the
quantity comes off the list as answered, not deferred.

## The QRS amplitude: the one real exposure, and no source for it

`ecg-axis` reads a net lead-I deflection of 999999 mm as:

> Mean QRS axis 0 deg: **normal axis** (-30 deg to +90 deg)

where the worked example reads 50.2 degrees. The arctangent is correct for the numbers given — but unlike
the spirometry tools, **the answer moves**, and it moves *toward* normal. A single mistyped amplitude
silently normalizes the axis.

A fence would need the highest R-wave amplitude the literature reports at standard calibration (10 mm/mV),
and that was not found. It is the one row here worth a reader's time, and it is named as such in the
finder's note rather than left in a list of six.

## The ABC/2 diameters: an impossible figure, and a number nobody has published

`ich-volume-abc2` reads:

> ICH volume **5,999,994 mL** by ABC/2 — meets the ICH-score >= 30 mL threshold

A head holds about **1,180 to 1,761 mL** (a 19-subject MRI validation series, mean 1,504 ± 169), so the
figure is six thousand skulls of blood. But the stroke literature reports **thresholds**, not extremes — 25
mL generally life-threatening, above 50 mL poor outcome, 60 mL with a GCS under 8 over 90% 30-day mortality,
89.5 mL for lobar hemorrhage in a 533-patient cohort — and no maximum volume.

So a ceiling here would be a number **chosen rather than cited**, which is what
[spec-v1206](spec-v1206.md) and [spec-v1797](spec-v1797.md) both forbid: a fence picked for plausibility and
dressed as an envelope is an obfuscated literal. The intracranial volume is the figure to start from when
someone sources it properly, and the note says so.

## What is actually left

The chronological **age in months** (`corrected-age`), which is the borrowed-envelope trap — `ageYears × 12`
is an envelope for a different quantity. Everything else on spec-v1731's list is either fenced or answered.
