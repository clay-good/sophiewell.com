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

Established across spec-v1006 through spec-v1041, after a catalog sweep found
tools answering forms with nothing in them. The whole program, its specs and the
checks that hold it are mapped in
[incomplete-input-program.md](incomplete-input-program.md). Six rules, in the order they are
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

**An alarm from nothing is not the safe direction.** "May rule in, never rule
out" says which direction is *safer*, not that the alarming answer may be
invented. An untouched MEOWS calling an obstetric rapid-response team, or a
Mini-Cog reporting a positive dementia screen on a patient who was never asked
to recall a word, is a false answer that costs a real response (spec-v1036).

**A guard against a missing value guards against one SHAPE of missing value.**
`Number('')` and `Number(null)` are both `0`, which is finite — so a guard
written as `Number.isFinite(Number(v))` stops working the day a renderer starts
sending `null` instead of `''`. Five deliberate missing-input guards had been
silently disabled this way, by the very change that made their renderers
blank-aware. Write both: `isBlank(v) || !Number.isFinite(Number(v))`
(spec-v1040).

A further rule governs values that *are* given: a number outside the range its own
field declares, or beyond the billion no quantity here reaches, is named above
the answer rather than silently computed from (spec-v1009 through spec-v1012).

### What holds these now

Four browser-side sweeps run on every push. Three ask what a tile does with
nothing: `no-answer-from-nothing-sweep` clears every field,
`required-field-agreement` clears exactly one that the agent surface calls
required, and `clock-dependent` renders each tile twice a year apart. The fourth,
`no-impossible-number`, catches a stated `NaN` or `Infinity`. Each carries a
ledger of legitimate exceptions, and each was verified by reintroducing the
defect it looks for.
