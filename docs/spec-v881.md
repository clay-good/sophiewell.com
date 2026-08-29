# spec-v881 — 25-hydroxyvitamin D level interpretation

## What this gives you

Both published readings of the level, side by side, and no pick between them.

## §1 Two frameworks, two answers

| | |
|---|---|
| **Institute of Medicine (2011)** | Below 12 ng/mL is deficiency. **20 ng/mL meets the needs of at least 97.5% of the population** for bone health |
| **Endocrine Society (2011)** | Below 20 ng/mL deficiency · 21–29 insufficiency · 30 and above sufficiency |

They disagree between **20 and 29 ng/mL** — adequate under one, insufficient under the other.

## §2 The word "deficient" depends on which framework you use

This is why the tile exists. It prints both readings on every result and says explicitly when they
disagree, rather than quoting one number as *the* threshold. That follows the spec-v97 posture
used in spec-v865: where published bodies differ, the tile shows the difference instead of
resolving it.

## §3 The 20 ng/mL figure is a population reference, not an individual target

It was derived to cover 97.5% of people for bone health. It is routinely read as a personal
cutoff, which is not what it is. On every result.

## §4 The 2024 Endocrine Society guideline recommends against routine testing in healthy adults

It found no threshold that reliably guides supplementation in people without an indication — so
for many levels, the most defensible reading is that the test should not have been sent. On every
result.

## §5 The assay varies

Total 25-hydroxyvitamin D moves with vitamin D binding protein and between laboratories, so a
value near a threshold does not separate cleanly from the value on the other side. Printed when
the entered level is within 3 ng/mL of any threshold.

Levels are accepted in ng/mL or nmol/L; the conversion and the fact that the published thresholds
are written in ng/mL are both stated when nmol/L is used.

## §6 Sourcing (spec-v97 gate)

- Institute of Medicine. *Dietary Reference Intakes for Calcium and Vitamin D.* National Academies
  Press; 2011.
- Demay MB, Pittas AG, Bikle DD, et al. *Vitamin D for the Prevention of Disease: an Endocrine
  Society Clinical Practice Guideline.* J Clin Endocrinol Metab. 2024;109(8):1907-1947.

Neither issuer is in the tracked-issuer pattern, so no `docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It reads a number against published thresholds. It does not
diagnose deficiency, and it does not decide whether to supplement.

Catalog 1671 → 1672.
