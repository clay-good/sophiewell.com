# spec-v1645: A result that disagrees with its own band table, and screener answers with no fence

> Status: **SHIPPED (2026-10-19).**

Found by one finder: for every agent-exposed tool with `META.derivation.bands`, 400 random valid-looking
inputs from its MCP input schema, comparing the band the result names with the band its own table gives
the same total (2,276 tools checked).

| Tool | Was | Now |
|---|---|---|
| `nihss` | A total of 16 to 20 printed "Moderate stroke". The tile's interpretation table and derivation bands under it both say 16-20 is "Moderate-to-severe stroke". | The result names the 16-20 band; every edge (4/5, 15/16, 20/21) is tested against META. |
| `phq9`, `gad7`, `epds`, `auditc`, `cage` (agent surface) | Any finite number was summed: PHQ-9 item 1 = 9 returned "Mild depression", CAGE returned 9 of a maximum 4, 1.5 and -1 were accepted. | An answer must be one of the item's own option values (read from the lib config, not restated); anything else is refused with "Item N must be one of ...". |

The browser was not affected by the second defect: it offers only the options.

## Proof

- `test/unit/clinical.test.js`: NIHSS severity matches `META.nihss.derivation.bands` at each edge.
- `test/mcp/rated-items-are-required.test.js`: each screener refuses an over-maximum, a negative and a
  fractional answer and names the options.
- The finder, re-run after the fix, reports nothing.
