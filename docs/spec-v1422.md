# spec-v1422 — Lawrence and Botte classification of proximal fifth metatarsal fractures

From the classification-gap queue. The foot had fracture systems for the midfoot
(`lisfranc-myerson`) and hindfoot (`sanders-calcaneal`, `hawkins-talar`) and the rule that orders
the film (`ottawa-ankle`, which includes the base of the fifth metatarsal), but nothing that names
the zone of the fracture it finds.

## Sources

- Lawrence SJ, Botte MJ, *Foot Ankle* 1993;14:358-365 (DOI confirmed via Crossref, PubMed
  8406253): the three zones.
- Torg JS et al, *J Bone Joint Surg Am* 1984;66:209-214 (PubMed 6693447): the zone 3 subtypes.
- Caruso B, Chin K, *Classifications in Brief: Lawrence and Botte Classification of Fifth
  Metatarsal Fractures*, Clin Orthop Relat Res 2025;483:1260-1263 (open access, PMC12190035),
  read 2026-09-24:

| zone | fracture | share | healing potential (original) |
|---|---|---|---|
| 1 | tuberosity avulsion | 93% | excellent |
| 2 | Jones fracture, metaphyseal-diaphyseal junction | 4% | good |
| 3 | diaphyseal stress fracture | 3% | variable |

Zone 3 by Torg: I acute (narrow line without fibrosis), II delayed union (widened line,
intramedullary sclerosis), III symptomatic nonunion (canal obliterated by sclerotic bone).

## Behavior

The zone comes from where the fracture sits; zone 3 also needs the fracture-line finding, which
sets the Torg type. A Torg entry for zone 1 or 2 is not used, and the answer says so. Every answer
carries the zone's share and original healing potential, and the reliability data: interrater
kappa 0.537 and 0.66, rising to 0.705 and 0.83 when zones 2 and 3 were merged. No treatment is
given; the review advises against relying on the zones to standardize care.

## Tests

`test/unit/lawrence-botte-5th-mt.test.js`: each location's zone and exact band; the three Torg
types; a Torg entry outside zone 3; the share, healing and reliability notes; refusals.
