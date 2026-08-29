# spec-v879 — Cancer cachexia consensus definition

## What this gives you

The stage — precachexia, cachexia, or refractory cachexia — and the reason the percentage of
weight lost never answers the question by itself.

## §1 Three routes into cachexia, any one of them

| |
|---|
| Weight loss **above 5%** over the past six months |
| Body mass index **below 20** with weight loss above 2% |
| **Sarcopenia** with weight loss above 2% |

**Precachexia**: weight loss of 5% or less with anorexia and metabolic change, in a patient who
meets none of the three routes.

**Refractory cachexia**: active catabolism with a cancer not responsive to treatment, a WHO
performance status of 3 or 4, and an expected survival under three months.

## §2 The body mass index moves the threshold

This is why the tile exists. Three percent lost at a BMI of 19 meets the definition; the same
three percent at 30 does not. On every result — and when a weight loss between 2% and 5% arrives
with no BMI entered, the tile says the answer turns on the missing value rather than returning a
flat "not met".

## §3 Cachexia is defined as not fully reversible by nutritional support

That is written into the consensus, and it is why the diagnosis matters rather than the weight
itself. On every result.

## §4 Refractory cachexia is defined by the cancer, not by the weight loss

No amount of weight loss reaches it on its own, and it is the stage in which aggressive
nutritional support is not indicated. When some but not all three refractory features are
recorded, the tile says which is missing; when all three are recorded but the definition of
cachexia is not met, it says refractory cachexia is a stage of cachexia rather than a substitute
for it.

## §5 Sourcing (spec-v97 gate)

- Fearon K, Strasser F, Anker SD, et al. *Definition and classification of cancer cachexia: an
  international consensus.* Lancet Oncol. 2011;12(5):489-495.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §6 Posture

Decision support, not a verdict. It applies a published consensus definition to values already
recorded. It does not decide nutritional or oncologic treatment.

Catalog 1669 → 1670.
