# spec-v1488 — Nordland-Tarnow papilla loss

The sibling of the Jemt index for papillae between natural teeth: Nordland and Tarnow (1998) class
the loss of papillary height by three landmarks.

## What it does

The class is derived from three questions, asked in order, rather than chosen from a list:

| Space below the contact point? | Interproximal CEJ visible? | Tip at or below the facial CEJ? | Class |
|---|---|---|---|
| no | — | — | Normal |
| yes | no | — | Class I |
| yes | yes | no | Class II |
| yes | yes | yes | Class III |

A blank answer that decides the class is asked for. Answers that contradict the anatomy (a filled
embrasure with a visible junction, or a tip below the facial junction with the interproximal one
hidden) are refused and the reader is asked to choose again.

## Sources

- Nordland WP, Tarnow DP. J Periodontol 1998;69(10):1124-1126.
- Classes as tabulated in Clin Oral Investig 2026 (PMC13451298), Table 1.

## Tests

`test/unit/nordland-tarnow-papilla.test.js`: the worked example, every class, blanks and
contradictions.
