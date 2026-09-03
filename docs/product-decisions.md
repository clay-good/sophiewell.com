# Product decisions

## One calculation explanation

- **Date:** August 23, 2026
- **Status:** Accepted

Every calculator and tool exposes one closed-by-default disclosure named
"How this is calculated." It contains all available methodology and provenance:
the formula or derivation, interpretation guidance, citations, source links,
and dataset version details.

Do not add a separate citation or sources disclosure. Method and evidence
answer the same user question, and splitting them creates duplicate controls
and uncertainty about which one to open.

## No persistent input memory

- **Date:** August 23, 2026
- **Status:** Accepted

Calculator and tool views do not offer device-persistent input storage. Input
state may remain in the URL fragment for reloadable, shareable links, but the
application does not save calculator inputs in `localStorage`,
`sessionStorage`, IndexedDB, cookies, or a server.

This keeps the interface minimal, avoids an extra privacy decision during a
calculation, and preserves the site's client-side privacy model.

## What a tool does with a value it has not been given

- **Date:** September 3, 2026
- **Status:** Accepted

Established across spec-v1006 through spec-v1016, after a catalog sweep found
tools answering forms with nothing in them. Four rules, in the order they are
applied:

**A blank field is a gap, not a zero.** `Number('')` is `0`, so a cleared input
reaches a formula as a measurement of zero unless the reader is written to
return `null`. Every renderer that reads a measurement uses a blank-aware reader
(`nvOrNull` / `optNum` / `unitNumOpt`); a typed `0` still means zero, because a
clinician who enters one is answering.

**A calculation with no inputs is not a result of zero.** An arithmetic tool
asks for what it needs, by the names on its own labels, and says nothing else.
It does not print "0 mL", "0 m²" or a dose.

**An incomplete score may rule in. It must never rule out.** These scores are
monotone: a component adds points or leaves them alone, so a partial total is a
lower bound. The alarming reading stands as soon as the entered values justify
it; the reassuring one waits for the rest, and the refusal names the inputs it
is waiting for.

*Which reading is the reassuring one depends on the direction of the scale.* On
SLUMS a higher score is a better one, so an unscored item can only add points: a
partial total is a ceiling on the severity, and an incomplete exam can be read as
normal but never as impaired. On NIHSS, where higher is worse, it is the other
way round.

**A checkbox or picker is an answer; a blank measurement is a gap.** An
unchecked "positive FAST" is a negative FAST, and a Centor score with nothing
ticked is a real 0. Only the unentered measurements withhold a reading, and only
the reading they could change.

A fifth rule governs values that *are* given: a number outside the range its own
field declares, or beyond the billion no quantity here reaches, is named above
the answer rather than silently computed from (spec-v1009 through spec-v1012).
