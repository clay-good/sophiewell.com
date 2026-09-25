# spec-v1462 — ICANS: a domain left out is not a negative finding

Found by the same blank-select probe as [spec-v1460](spec-v1460.md).

## What was wrong

The ICANS grade is the worst of five domains. On the agent surface, the level of consciousness,
seizure and raised-ICP domains are optional. An agent that sent only an ICE score of 10 got **"No
ICANS (ICE 10 and no consciousness, seizure, motor, or raised-ICP findings)"**. That sentence
reports three findings nobody entered. (The page was not affected: its selects always hold a
visible choice.)

## The fix

The grade from the entered domains stands, because a missing domain can only raise it. The band
now names what was left out: "No ICANS from what was entered (ICE 10). No level of consciousness,
seizure or raised ICP finding was entered; any of them can only raise the grade." At grade 4 nothing can
raise it, so no note is added. With every domain entered, the original sentence is unchanged. The
earlier blank-ICE handling from spec-v1095 is untouched.

## Tests

`test/unit/icans.test.js`: an ICE-only input discloses all three domains, one missing domain is
named alone, a fully entered input keeps the original band, and grade 4 adds nothing.
