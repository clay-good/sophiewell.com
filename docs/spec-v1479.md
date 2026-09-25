# spec-v1479 — Robinson (Edinburgh) classification of clavicle fractures

The catalog classified the distal third of the clavicle (modified Neer, spec-v1428) but had no
classification for the whole bone. Robinson's classification of 1998, from 1,000 consecutive adult
fractures in Edinburgh, covers the medial fifth, the shaft and the outer fifth. It is the one used in
most recent clavicle studies.

## What it does

Three choices give the type, and a fourth gives the subtype:

| Site | A | B | Subtype |
|---|---|---|---|
| 1, medial fifth | undisplaced | displaced | 1 extra-articular, 2 intra-articular |
| 2, diaphysis | cortical alignment (1 undisplaced, 2 angulated) | displaced (1 simple or wedge comminuted, 2 segmental) | as shown |
| 3, lateral fifth | cortical alignment | displaced | 1 extra-articular, 2 intra-articular |

The answer names the subtype and its definition, and adds the derivation series' prognosis:

- types 1, 2A and 3A usually did well;
- 2B and 3B had more complications of union;
- in 2B, comminution was an added risk factor for delayed union and nonunion.

A lateral fracture also notes that the modified Neer classification subdivides that region by the
coracoclavicular ligaments. Every choice is required; a blank one is asked for, never assumed.

## Sources

- Robinson CM. J Bone Joint Surg Br 1998;80(3):476-484 (the abstract states the prognosis).
- The twelve subtype definitions as tabulated in Int J Environ Res Public Health 2022 (PMC9690708),
  Table 1.

## Tests

`test/unit/robinson-clavicle.test.js`: the worked example (2B2); all twelve subtypes; the prognosis
flags; every blank asked for.
