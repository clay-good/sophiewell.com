# spec-v1254 — SMART-COP refuses impossible ages

SMART-COP uses age to choose between two respiratory-rate and oxygenation
threshold sets. Age is therefore required even though it does not add points
directly.

The function already refused a blank or nonnumeric age, but accepted every
finite number. An age of `-999,999` selected the age-50-or-younger thresholds,
and `999,999` selected the older thresholds. Both produced an ordinary clinical
risk band.

SMART-COP now applies the repository's existing `0–130 years` human envelope
before selecting either threshold set. Its browser field mirrors the same range,
and browser, unit, and MCP tests pin the refusal while preserving valid results
at both boundaries.

`scripts/probe-impossible-changes-nothing.mjs` falls from 3 silent fields to 2,
removing SMART-COP age. No score threshold, risk band, citation, or catalog count
changed.
