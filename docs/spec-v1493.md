# spec-v1493 — Eichner index of occlusal support

Kennedy classes describe the gaps in a partially edentulous arch; Eichner describes what still meets: the occlusal support zones.

## Inputs

`ei-zones` (required, 0-4), then only what decides the group: teeth missing (with 4 zones), anterior contact (with 0), teeth present (with no contact at all).

## What it does

A1-A3 (four zones, by missing teeth), B1-B3 (three to one zone), B4 (anterior contact only), C1-C3 (no contact: teeth in both arches, one arch, none). A blank that decides the group is asked for.

## Sources

Eichner K. Dtsch Zahnarztl Z 1955;10:1831-1834. Groups as stated in J Nutr Health Aging 2018 (PMC12880510) and J Oral Rehabil 2026 (PMC13168836).

## Tests

`test/unit/eichner-index.test.js`: the worked example, every category, blanks and bounds.
