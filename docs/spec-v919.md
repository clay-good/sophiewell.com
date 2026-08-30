# spec-v919 — The outcome changes nothing, and the page proves it

## Why

`just culture` was zero-hit across the 1700 tile names. It is the framework most hospitals say
they run their event reviews on, and the catalog had nothing for it.

## What it does

| Behavior | Response |
| --- | --- |
| **Human error** — an inadvertent slip, lapse or mistake | **Console** the person, and examine the system: process, procedure, training, design, environment |
| **At-risk** — a choice whose risk was not seen or was believed justified | **Coach**: change the incentives, increase situational awareness |
| **Reckless** — conscious disregard of a substantial, unjustifiable risk | **Disciplinary action**, whatever the outcome |
| Knowingly caused harm | **Outside this model** — local policy, and where it applies, the law |

## The design choice

The page **asks for the outcome and then reports that it changed nothing.**

Human error that ended in a death returns *Console, and examine the system* — the same result as
human error that harmed nobody — with the outcome named and the sentence "It did not change the
answer above, and that is deliberate." Reckless behavior that harmed nobody still returns
*Disciplinary action*.

Collecting an input in order to visibly discard it is unusual. It is the point here: judging by
outcome is what this model exists to replace, and a page that simply omitted the outcome would
not confront that.

Two other things print on every result:

- **Console is a response, not the absence of one.** Human error is where the system gets
  examined, and that is where the work is.
- **A repeat of the same at-risk choice after coaching** asks whether the coaching and the
  incentives around it changed anything, *before* escalating — because escalating on the second
  event because it ended badly is outcome-based judgment under another name. The repeat flag
  moves no other behavior, and the tests pin that.

## Files

New: `lib/just-culture-v919.js`, `views/group-v919.js`, `mcp/adapters/just-culture-v919.js`,
`test/unit/just-culture.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Marx 2001, cross-checked against the AHRQ Patient Safety Network primer on Culture of Safety,
which carries the same three behaviors and the same three responses. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1700 → 1701.
