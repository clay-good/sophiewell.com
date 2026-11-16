# spec-v1744 — A range only the agents were held to

> Status: **SHIPPED (2026-11-16)**: 19 tools; a new finder, `scripts/probe-adapter-only-bounds.mjs`. The catalog
> stays 2,387.

`mcp/fields.js` refuses an agent's value outside a field's declared `min`/`max` before the library runs. The page
calls the library directly. spec-v1743's Phoenix GCS of 150 ("septic shock" on the page, refused for agents) was
one of these, and every agent-side finder was blind to it because the adapter answered first.

The new finder calls each registry entry's `compute(toArgs(...))` directly, past each declared bound, from the
worked example. It found 103 rows over 1,185 declared bounds; 21 fields were range sliders (they cannot produce the
value) and 50 were number inputs a reader can type into. The page showed its small range warning beside those, and
still answered:

| Before (examples) | Tool |
|---|---|
| a CIWA item of 70 counted as 7; mini-cog words 99 scored 5 of 5 | `ciwa`, `mini-cog` |
| Norton items of 40, a PUSH size score of 100 | `norton-push` |
| a body-region area of 1,000% read as 100% | `pasi`, `easi` |
| an AIS of 60 clamped to 6 and forced NISS 75 | `niss` |
| an FiO2 of 10 divided into the P/F ratio | `berlin-ards` |
| an antivenom dose of 1,000 vials: "Repeat now"; a 1,500 kg weight: "5 vials" | `antivenom-repeat`, `brazil-spider-antivenom` |
| a negative clearance, MAP, prevalence or ALP read as not entered | `pk-suite`, `phoenix-sepsis`, `diagnostic-2x2`, `udca-response`, `modified-marshall`, `kings-college` |

Also `vip-extravasation`, `scorad` (pruritus, sleeplessness), `infant-hiv-test-schedule`, `iron-supplement-who`.
Each library now refuses with `gradeFault` at the adapter's own bounds (whole steps for CIWA, mini-cog, Norton,
PUSH, VIP and INS; not for continuous values or SCORAD's visual-analogue items). `pasi` and `easi` gained a refusal
branch in their view. Eight older tests that pinned a clamp were rewritten.

Left: `o2-cylinder-duration`'s adapter turns a negative flow into 0 inline, but its own validator refuses the
negative first, and the library and the page already refuse it, so no reader reaches it. The remaining finder rows
are range sliders.

Tests: one spec-v1744 case in each tool's own unit test file.
