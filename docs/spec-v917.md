# spec-v917 — "The time out" is one phase of three

## Why

`surgical safety checklist`, `time out` and `sign out` were all zero-hit across the 1698 tile
names. The catalog scored perioperative risk eight different ways and held nothing for the
checklist itself.

## What it does

| Phase | Moment | Items |
| --- | --- | --- |
| Sign In | before induction of anesthesia, with at least the nurse and the anesthetist | 7 |
| Time Out | before skin incision, with the nurse, the anesthetist and the surgeon | 5 |
| Sign Out | before the patient leaves the operating room | 5 |

Each item is recorded when it has been done **or does not apply**.

## The three things it is for

**It names the incomplete phase, not a percentage.** A checklist that is 90% done is 90% done in
a particular place, and the result says which. "Sign Out incomplete" is a different fact from
"15 of 17".

**Sign Out is the phase that goes missing.** The whole checklist is routinely called "the time
out" — and Sign Out is where the instrument, sponge and needle counts sit, where specimens are
read back with the patient's name, and where the concerns recovery needs are said aloud. That
line prints on every result, complete or not.

**Each phase has a moment.** A phase carried out at a different moment is not that phase, and
ticking it afterwards is not doing it. The source expects it read aloud by a single coordinator
and expects local adaptation — it is a prompt for something spoken, not a form.

Item labels are neutral topic labels rather than the published wording, and the result says so.

## Files

New: `lib/who-surgical-checklist-v917.js`, `views/group-v917.js`,
`mcp/adapters/who-surgical-checklist-v917.js`, `test/unit/who-surgical-checklist.test.js`, this
file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

The adapter builds its 17 fields from the exported `PHASES` rather than restating them, so the
phase a field belongs to cannot drift out of step with the renderer.

## Sourcing

WHO Guidelines for Safe Surgery 2009, cross-checked against the outcome report (Haynes 2009,
*N Engl J Med*), which lists the same three phases and their moments. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1698 → 1699.
