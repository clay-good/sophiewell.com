# spec-v1010 — The bounds the site already knew, applied where they were missing

## The finding

spec-v1009 made a declared range do something: type a value outside it and the tool says so above
the answer. That fix is only as good as what the fields declare, and its own closing paragraph
named the gap — 1,391 inputs declared a `min`, only 463 declared a `max`.

The bounds did not need inventing. The site already states them; it just does not state them
consistently. Systolic blood pressure is capped at 300 mmHg on nine tiles and uncapped on twelve
others. Hemoglobin is capped at 25 g/dL on four and uncapped on twelve. Age in years is capped on
31 tiles and uncapped on 69.

Same quantity, same unit, same site, two different answers to "is 3007 a plausible number".

## The rule

For each quantity **and unit** — an HDL in mmol/L is not an HDL in mg/dL — where at least **two**
tiles declare a bound and others do not, the missing field takes the bound the site already uses.
Three constraints keep it conservative:

- **Widest wins.** Where tiles disagree, the most permissive bound is used: age takes 130, not the
  20 a pediatric tile declares or the 69 that is SCORE2's model domain.
- **Nothing is ever narrowed.** A field that already declares a bound keeps it. This only fills in
  absences.
- **Two declarers minimum.** One tile's number is that tile's opinion; two is the house's.

That gives **132 maximums and 63 minimums** across 16 quantity groups: age, hemoglobin, systolic
BP, heart rate, respiratory rate, hematocrit, sodium, BMI, GCS, total and HDL cholesterol,
creatinine, albumin, AST/ALT, INR, arterial pH, and the DAS28 joint counts.

## Proof

- Every documented worked example was checked against the bound about to be added **before** any
  edit: no example value falls outside a new bound, so no tile opens flagging its own example.
- `example-fills` (every documented example is in its field when the tile opens), the sharded
  `example-correctness` sweep, `unit-toggle`, `deep-link-round-trip`, `declared-ranges`,
  `no-impossible-number` and the 28-minute indiscriminate-interaction sweep all pass, as does the
  full lint chain.
- One backfilled field (`alb`) shares an id with a unit-toggle field on other tiles; the edited one
  is a plain `g/dL` input and the added `min: 0` holds in either unit. `unit-toggle` covers it.

## Left open

This closes the gap only where the site had already made up its mind twice. A quantity that appears
on one tile only, or that no tile bounds at all, still accepts anything — a respiratory rate is now
capped because one tile capped it and ten did not, but a quantity nobody capped stays open. Those
are per-tile clinical judgments and want a clinician's eye rather than a script's.
