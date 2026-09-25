# spec-v1444 — Kanavel signs

Found by the gap finder: `kanavel` and `flexor tenosynovitis` matched nothing. The catalog has
`lrinec` for necrotizing soft-tissue infection and several hand classifications, and nothing for
the bedside exam of a septic flexor sheath.

## Sources, read 2026-09-24

- Kanavel AB, *Infections of the Hand*, 1912: the four cardinal signs.
- Gomes M et al, *Cureus* 2025;17:e79785 (open access, PMC11954652; DOI checked): the signs,
  "high sensitivity" with limited specificity individually, and "only about 54% of patients
  demonstrate all 4 signs".
- Rao V et al, *Hand* 2023;18:320 (open access, PMC10035092; DOI checked): "Clinical examination
  alone has not been shown to have consistent accuracy for identifying PFT", and a positive
  predictive value of 62.7% to 72.7% per sign (citing Kennedy et al).

## Behavior

Four signs, each marked present or absent; an unexamined sign is asked for. The answer counts the
signs and always says that fewer than four does not exclude the infection and that each sign is
sensitive but not specific. It does not diagnose, exclude, or recommend treatment.

## Tests

`test/unit/kanavel-signs.test.js`: the count, the "does not exclude" note, and blanks.
