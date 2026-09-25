# spec-v1495 — Oral Health Assessment Tool (OHAT)

A nursing screen of the mouth for residents and inpatients who cannot self-report: eight items, each healthy (0), changes (1) or unhealthy (2), totaled out of 16. The published form's item descriptors are not reproduced; each item is rated on the three named levels.

## Inputs

Eight optional selects: lips, tongue, gums and tissues, saliva, natural teeth, dentures, oral cleanliness, dental pain.

## What it does

The total, and the items rated unhealthy or with changes, by name. A partial form says how many items it was scored from, that an item not rated can only raise the total, and does not call the mouth healthy on the items it lacks. Nothing rated is asked for.

## Sources

Chalmers JM et al. Aust Dent J 2005;50(3):191-199. Items and scoring as stated in J Nutr Health Aging 2021 (PMC12876686) and BMC Oral Health 2026 (PMC12977401).

## Tests

`test/unit/ohat-oral-health.test.js`: the worked example, the categories, blanks and bounds.
