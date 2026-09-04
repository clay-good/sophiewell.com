# spec-v1031 — The worked example was all zeros

## What the tile showed

Every calculator opens pre-filled with a worked example — the README sells it as the way to *"see
the expected format before you type over it."* Forty-seven of them ship an example whose every field
is `0`, which demonstrates no format at all and lands the tile on its most reassuring band. So the
tile opened saying:

| Tile | Opening line, before anyone had entered anything |
| --- | --- |
| `ottawa-sah` | Rule out SAH by Ottawa SAH Rule: all six criteria negative |
| `nigrovic` | very low risk for bacterial meningitis (NPV ~99.9%) |
| `pecarn-cspine` | LOW risk; cervical-spine imaging not indicated |
| `pecarn-iai` | very low risk of clinically important IAI |
| `step-by-step` | Step-by-Step: LOW risk |
| `cpss` | negative screen (0 of 3 abnormal) |
| `lams` / `race` | LVO is less likely |
| `wat-1` | WAT-1 0 of 12: no significant withdrawal |

Each of those is a decision: don't image, don't admit, don't activate the stroke pathway, don't
adjust the wean. None of them is wrong as arithmetic — a form of negatives really does score zero.
They are wrong as an **opening screen**, because a reader who glances at a tile before filling it in
sees the rule-out their patient has not earned.

This is the sibling of the `no-answer-from-nothing` program, arriving from the other direction. That
program asked what a tile does with a field nobody filled in. This one asks what a tile *displays*
when the example itself says nothing.

## The fix

Nine examples now describe a patient:

- `ottawa-sah` — a 52-year-old with a thunderclap headache and neck stiffness → *cannot rule out.*
- `nigrovic` — CSF ANC ≥1000 with protein ≥80 → *NOT low risk; do not discharge.*
- `pecarn-cspine` — neck pain after a high-risk collision → *imaging warranted.*
- `pecarn-iai` — seat-belt sign, tenderness, vomiting → *consider imaging.*
- `step-by-step` — an abnormal urinalysis → *HIGH risk.*
- `cpss`, `lams`, `race` — a real hemiparesis → *positive screen / LVO likely.*
- `wat-1` — loose stools, tremor, yawning, a 4-minute recovery → *withdrawal present.*

Every `expected` string was taken from the library's own output rather than written by hand, and
`example-correctness` checks each of them end to end.

## Still open

Thirty-eight all-zero examples remain, listed by the probe in this spec's commit message. They are
lower-stakes bands (`4at`, `cpot`, `flacc`, `stop-bang`, `atria-bleeding`, the Ottawa ankle rule and
so on), but the same argument applies to each, and each needs a hand-picked patient — a worked
example cannot be derived from a band table (see `docs/spec-v1013.md` and the lede program's rule
about deriving meaning from bands). The next wave takes the pain and delirium scales.
