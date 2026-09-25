# spec-v1497 — Veau classification of cleft palate

The catalog had no cleft tool. Veau (1931) classes clefts of the palate I to IV by how far they extend.

## Inputs

`vc-palate` (intact, soft palate only, soft and hard palate) and `vc-lip` (through the lip and alveolus: no, one side, both sides); both required.

## What it does

I soft palate only; II soft and hard palate, lip and alveolus intact; III complete unilateral; IV complete bilateral. An intact palate is outside the classes and is refused, as is a complete cleft said to spare the hard palate. A blank is asked for.

## Sources

Veau V. Division palatine. Paris: Masson; 1931. Classes as stated in Laryngoscope 2026 (PMC13569703) and Natl J Maxillofac Surg 2025 (PMC12469169).

## Tests

`test/unit/veau-cleft.test.js`: the worked example, every class, blanks and contradictions.
