# spec-v1432 — three new tools that answered around a blank without saying so

`scripts/probe-omitted-item.mjs` drops one input at a time from each worked example and flags an
answer that moves without asking for the value or saying it is missing. Run over the tools added in
[spec-v1412](spec-v1412.md) through [spec-v1431](spec-v1431.md), it flagged eight fields in four
tools. Three were real, in wording rather than arithmetic:

| tool | blank field | before | now |
|---|---|---|---|
| `blood-4h-window` | minutes since spiking | assumed the full 4 hours silently | "No spiking time was entered, so this assumes the full 4 hours are left." |
| `hvpg` | cause of liver disease | the viral/alcohol caveat, with no word that the cause was blank | "No cause entered; choose it to settle this." |
| `aospine-sacral` | type B fracture line | "No subtype entered." | "...; choose one to refine the type." (house phrasing, so the probe reads it) |

Left as they are, on purpose:

- `blood-4h-window` without a pump rate answers a different, stated question (the slowest rate that
  finishes in time), which is the tool's main use.
- `mcpherson-pji` already shows the grade as a range ("host A to C") and says to answer the
  remaining factors; the probe's vocabulary does not know "answer the remaining", and a grade range
  is the correct reading of an unanswered factor.

Tests: `blood-4h-window.test.js` and `hvpg.test.js` each assert the new sentence appears only when
the field is blank.
