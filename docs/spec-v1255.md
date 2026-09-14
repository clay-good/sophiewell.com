# spec-v1255 — CPIS validates leukocytes in its declared unit

The Clinical Pulmonary Infection Score reads leukocytes per mm³. Its scoring
bands treat `4,000–11,000/mm³` as normal and values outside that interval as
leukopenia or leukocytosis.

The repository already defines a broad WBC envelope of `0–200 ×10³/µL`, but the
CPIS field could not use those numbers directly. A count per mm³ is numerically
1,000 times the count in ×10³/µL. An earlier review correctly rejected applying
the unconverted ceiling of 200 because it would have refused every ordinary
CPIS count, but the field consequently remained open at both ends.

CPIS now applies the equivalent `0–200,000/mm³` domain explicitly. Counts of
`800/mm³` and `25,000/mm³` still score, as does the `200,000/mm³` boundary;
negative values and values above that ceiling return a named refusal. The
browser field mirrors the converted domain, with unit, browser, and MCP tests
covering the behavior.

`scripts/probe-impossible-changes-nothing.mjs` falls from 2 silent fields to 1.
The remaining ROX timepoint is resolved in [spec-v1256](spec-v1256.md). No CPIS
scoring band, risk threshold, citation, or catalog count changed.
