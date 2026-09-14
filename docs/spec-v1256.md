# spec-v1256 — ROX accepts only published timepoints

ROX uses one success cutoff at each published measurement window and distinct
failure cutoffs at 2, 6, and 12 hours after high-flow nasal cannula starts. The
timepoint stays optional when every published window gives the same verdict.

When a timepoint was entered, however, the function accepted any finite number:
values at or below 2 used the 2-hour cutoff, values through 6 used the 6-hour
cutoff, and every larger value used the 12-hour cutoff. An entry such as 3 or
`999,999` therefore produced a result labeled with an unpublished hour while
using a published cutoff chosen by silent bucketing.

The core now accepts only 2, 6, or 12 when the optional timepoint is present.
The browser uses a select with those three choices plus “Not stated,” and the
MCP schema exposes the same enumeration. Unit, browser, and MCP tests cover the
three valid choices, an invalid direct call, and an invalid agent call.

`scripts/probe-impossible-changes-nothing.mjs` now reports 0 fields. Omission
still works exactly as spec-v1131 defines: ROX asks for the hour only when the
published timepoint can change the interpretation. No cutoff, risk statement,
citation, or catalog count changed.
