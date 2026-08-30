# spec-v916 — I-PASS, and the step that gets dropped

## Why

The catalog had SBAR and nothing else for a handoff. `i-pass` was zero-hit across the 1697 tile
names and the slug was free.

## What it does

| | |
| --- | --- |
| **I** | Illness severity — stable, **watcher**, or unstable |
| **P** | Patient summary — summary statement, events leading to admission, hospital course, ongoing assessment, plan |
| **A** | Action list — what is to be done, by when, and by whom |
| **S** | Situation awareness and contingency planning — what to watch for, and what to do if it happens |
| **S** | Synthesis by the receiver — the receiver summarizes it back, asks questions, restates the key actions |

It assembles the handoff, offers it for copying, and reports which parts are blank.

## The three things it is for

**The second S is reported on its own, never as one blank among five.** It is the part that gets
dropped and the part the trial evidence rests on. Four parts filled and no read-back returns
*Not finished* — in those words — rather than "80% complete".

**Watcher is a category, not a hedge.** It names a patient someone is worried about who is not
yet unstable, and it exists so that the worry is handed over rather than left with the person
going home. The result says so whether or not watcher was chosen.

**The mnemonic orders what is said.** It does not shorten it, and it does not replace the
conversation. Nothing entered is sent anywhere or stored.

Whitespace is not content: a synthesis box holding only spaces still reads as not finished. An
unrecognized severity comes back as *not recorded* rather than being passed through to the
assembled text.

## Files

New: `lib/ipass-handoff-v916.js`, `views/group-v916.js`, `mcp/adapters/ipass-handoff-v916.js`,
`test/unit/ipass-handoff.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Starmer 2014 (*N Engl J Med*), the handoff-bundle trial, cross-checked against the I-PASS
mnemonic as published in the AHRQ patient-safety primer on handoffs. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1697 → 1698.
