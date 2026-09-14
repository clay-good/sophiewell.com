# spec-v1253 — SMART-COP preserves invalid oxygenation inputs

SMART-COP awards one 2-point oxygenation criterion when any of PaO₂, SpO₂, or
P/F crosses its age-adjusted threshold. Any one measurement is sufficient, so
all three fields are optional alternatives.

That optionality hid invalid entries. With the worked example's other two
oxygenation values still present, PaO₂ or SpO₂ at `999,999` was converted to a
normal zero-point contribution and produced exactly the same low-risk answer as
omitting the field. Nothing on either surface said the entered value was lost.

The function now validates every oxygenation value that was entered before it
chooses among the alternatives:

- PaO₂ uses the repository's existing `10–700 mmHg` physiologic envelope;
- SpO₂ uses its arithmetic percentage domain, `0–100%`;
- P/F must be nonnegative, but remains open above because neither SMART-COP nor
  the repository declares an upper domain for the derived ratio.

The browser now renders this refusal instead of a `null` score, and its input
attributes mirror the same domains. Unit, browser, and MCP tests prove an
impossible PaO₂ is named on every surface and that omitting it still allows the
valid SpO₂/P:F alternatives to score.

The impossible-as-absent probe falls from 4 silent fields to 2: POP-Q point D,
whose label explicitly permits absence after hysterectomy, and the deliberately
open upper end of SMART-COP P/F. No scoring threshold, risk band, citation, or
catalog count changed.
