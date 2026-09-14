# spec-v1251 — the envelope probe recognizes reassuring conclusions

The envelope probe prioritizes the most dangerous suspect: an impossible input
that produces a reassuring answer. Its classifier already recognized phrases
such as “normal,” “low risk,” and “remission,” but four known conclusions found
in spec-v1231 stayed in the unranked remainder:

- “safe for outpatient management”;
- “no lung injury”;
- “not in the high-risk band”;
- “Low (in-hospital mortality < 1%).”

Those exact shapes now count as reassuring. Inline self-tests also prove that
“not safe for outpatient management” and an unrelated “low oxygen saturation”
do not match, preserving the classifier's leading-negation and context rules.

LIPI exposed a second classifier edge after spec-v1250 documented its two common
count conventions in agent metadata. The probe saw “×10⁹/L” inside that example
text and assigned a unit-specific WBC envelope, even though the field explicitly
says either shared unit is valid. Fields labeled “same unit” now stay outside
that mapping, alongside other ratios and converted values.

A unit test runs the real probe, pins the first queue at zero, and confirms LIPI
is absent. Reach moves from 396 mapped / 368 testable fields to 395 / 367, with
0 mis-mapped and 28 lacking a usable example. This changes probe reach and
prioritization only; no calculator, formula, threshold, citation, or catalog
count changed.
