# spec-v894 — Acute tryptase rise

## What this gives you

Whether an acute tryptase clears the bar that *this* patient's baseline sets — and the bar itself,
in ng/mL.

## §1 The rule

`acute > (1.2 × baseline) + 2 ng/mL` supports mast cell activation.

## §2 It is a rise, not a threshold

This is why the tile exists. The bar moves with the patient: a baseline of 5 needs an acute above
8; a baseline of 25 needs an acute above 32. So an acute value **inside** the laboratory reference
range can meet the rule, and one **above** that range can fail it. A reader arrives holding one
number and a reference interval, and neither is what the rule uses. On every result.

## §3 Both levels are required, and the tile refuses without them

There is no rule to apply to a single value. The tile says that in the refusal rather than
computing something misleading from one number.

## §4 The timing is part of the test

The acute sample is drawn roughly **30 minutes to 4 hours** after the reaction; the baseline at
least **24 hours** after everything has settled. A baseline drawn too early is not a baseline —
and because the bar is a multiple of it, an inflated baseline raises the bar the comparison has to
clear. On every result.

## §5 A tryptase that does not rise does not exclude anaphylaxis

It frequently fails to rise in food-triggered reactions, and anaphylaxis is a clinical diagnosis
never withheld pending a level. Printed on every result that does not meet the rule.

## §6 A persistently raised baseline is a different question

Above **20 ng/mL** it is a minor criterion for systemic mastocytosis; hereditary
alpha-tryptasemia raises it too. Neither is what this rule measures, and the tile says so when
the entered baseline is above that line.

## §7 Sourcing (spec-v97 gate)

- Valent P, Akin C, Arock M, et al. *Definitions, criteria and global classification of mast cell
  disorders.* Int Arch Allergy Immunol. 2012;157(3):215-225.
- Valent P, Akin C, Bonadonna P, et al. *Proposed diagnostic algorithm for patients with suspected
  mast cell activation syndrome.* J Allergy Clin Immunol Pract. 2019;7(4):1125-1133.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §8 Posture

Decision support, not a verdict. It computes a published comparison from two levels already
drawn. It does not diagnose anaphylaxis, and it does not diagnose a mast cell disorder.

Catalog 1683 → 1684.
