# spec-v1424 — AOSpine sacral classification

From the classification-gap queue. The catalog had the older Denis zones for the sacrum
(`denis-sacral`), the AO Spine thoracolumbar system (`ao-spine-tl`) and the pelvic ring
(`young-burgess`), and not the AOSpine system written for the sacrum itself.

## Sources

- Vaccaro AR et al, *J Bone Joint Surg Am* 2020;102:1454-1463 (PubMed 32816418, DOI confirmed via
  Crossref): the original description and reliability study.
- Camino-Willhuber G, Urrutia J, *Classifications in Brief: The AOSpine Sacral Classification
  System*, Clin Orthop Relat Res 2022;480:2182-2186 (open access, PMC9556097), read 2026-09-24.
  Types, modifiers and reliability come from its text; subtype labels from its Figs. 1-3:

| type | where it runs | subtypes |
|---|---|---|
| A | below the sacroiliac joints | A1 coccygeal/compression or ligamentous avulsion; A2 nondisplaced transverse; A3 displaced transverse |
| B | unilateral vertical, facet attached to the medial sacrum | B1 central (spinal canal); B2 transalar; B3 transforaminal |
| C | L5-S1 facet, spinopelvic dissociation | C0 nondisplaced U-type variant; C1 U-type variant without posterior pelvic instability; C2 bilateral complete B without transverse; C3 displaced U-type |

Modifiers: N0-N3 (neurologic), M1 soft tissue, M2 metabolic bone disease, M3 anterior ring, M4
sacroiliac joint.

## Behavior

The **type** is derived from where the fracture runs, and the **subtype** from the pattern question
for that type only (patterns for other types are ignored). A type without a pattern is a valid
answer, marked "No subtype entered", because the review finds the type reliable (interobserver
kappa 0.68 to 0.75) and the subtype not (0.51 to 0.58 independently) and recommends against using
the system for subtypes. C0 and C1 have no separating finding beyond their figure labels, so the C
patterns are those labels. A blank neurologic status is reported, never read as N0. Notes carry the
undefined displacement threshold (A2/A3, C0/C3), the untested modifiers, and the unclear alar plus
transverse case. No treatment is given.

## Tests

`test/unit/aospine-sacral.test.js`: all ten subtypes; an off-type pattern ignored; the modifier
code and band; a blank N reported; the caveat notes; the refusals.
