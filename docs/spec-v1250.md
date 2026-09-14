# spec-v1250 — LIPI accepts either consistent count unit

The Lung Immune Prognostic Index derives dNLR as `ANC / (WBC - ANC)`. The units
cancel, so `7` and `9` in ×10⁹/L must produce the same answer as `7,000` and
`9,000` in cells/µL.

The tile already asked readers to use the same unit, but its local numeric
readers capped both counts at `1,000`. That silently made the promise false:
the ×10⁹/L pair computed while the equivalent cells/µL pair was refused.

This change removes only that unit-specific upper ceiling. It keeps the existing
requirements that both values be finite and nonnegative and that WBC exceed
ANC. The browser and MCP labels now state the shared-unit contract and give both
common conventions as examples.

Verification covers all three public layers:

- unit tests prove the two equivalent pairs return identical result objects and
  that a negative count is still named and refused;
- a browser test enters the cells/µL pair and observes dNLR `3.5` and LIPI `2`;
- an MCP test computes the same cells/µL pair through the agent surface.

No formula, threshold, prognostic band, citation, or catalog count changed.
