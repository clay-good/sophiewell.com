# spec-v867 — WHO severe malaria criteria

## What this gives you

Whether the WHO definition of severe falciparum malaria is met, with the two things about it
that are most often read backwards stated on the result itself.

## §1 Any one of twelve features

For a patient with confirmed *P. falciparum* asexual parasitemia and no other identified cause:

| Feature | Threshold |
|---|---|
| Impaired consciousness | GCS below 11 in adults, Blantyre below 3 in children |
| Prostration | Unable to sit, stand or walk unassisted |
| Multiple convulsions | More than two in 24 hours |
| Acidosis | Base deficit above 8 mEq/L, bicarbonate below 15 mmol/L, or lactate at or above 5 mmol/L |
| Hypoglycemia | Glucose below 40 mg/dL (2.2 mmol/L) |
| Severe malarial anemia | Hemoglobin at or below 5 g/dL (child under 12) or below 7 g/dL (adult), **with** a parasite count above 10,000/µL |
| Renal impairment | Creatinine above 3 mg/dL, or urea above 20 mmol/L |
| Jaundice | Bilirubin above 3 mg/dL **with** a parasite count above 100,000/µL |
| Pulmonary edema | Radiologic, or saturation below 92% on room air with a rate above 30 |
| Significant bleeding | Recurrent or prolonged bleeding, hematemesis, melena |
| Shock | Capillary refill at or above 3 seconds, or systolic pressure below 70 mmHg (child) / 80 mmHg (adult) |
| Hyperparasitemia | Parasitemia above 10% of red cells |

## §2 It is a list, not a score

This is why the tile exists. Any one feature meets the definition; the count above one adds
nothing to it. The tile prints the count because it is useful to see, and says on every result
that the count is descriptive.

## §3 The parasite count does not grade severity

Except as the hyperparasitemia feature itself. Sequestered parasites are not on the film, so a
low peripheral count does **not** exclude severe malaria. This prints on every result, including
the one where nothing has been ticked.

## §4 Two features are conjunctive

Severe malarial anemia and jaundice are each defined together with a parasite density. The
hemoglobin or the bilirubin on its own does not meet either feature. Raised whenever either is
scored.

## §5 Nothing ticked is not "uncomplicated"

A result with no feature reflects only what was entered, and several of the features are
laboratory values that may not have been drawn yet. The tile says so rather than printing a
clearance.

## §6 Sourcing (spec-v97 gate)

- World Health Organization. *WHO Guidelines for Malaria.* Geneva: WHO; 2023 — severe malaria
  definition, carried forward from *Severe malaria.* Trop Med Int Health. 2014;19(Suppl 1):7-131.

WHO is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §7 Posture

Decision support, not a verdict. It applies published criteria to values that have already been
measured. It does not diagnose malaria, and it does not prescribe treatment.

Catalog 1658 → 1659.
