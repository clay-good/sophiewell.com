# spec-v1815 — A finder at zero with no gate

> Status: **SHIPPED (2026-11-26)**: six finders that already report zero become gates, taking
> `test/unit/finder-ledgers.test.js` from 24 to 30; and the e2e lane stops failing on an Ubuntu mirror
> change. No library file changed. The catalog stays 2,390.

## The one state nobody notices changing

A finder with rows gets read, and a finder with a judged ledger fails a test. A finder at **zero** with
neither is the quiet case: the vein was closed, the report is one line of prose, and nobody runs it again —
so the next regression prints a row into a file no one opens. Six of the catalog's 37 finders were in that
state:

| Finder | What a row would mean |
|---|---|
| `probe-impossible-changes-nothing` | an impossible value changed nothing in the reading |
| `probe-impossible-dates` | February 30th or 25:00 still answered |
| `probe-impossible-reads-as-absent` | an impossible value read as "not entered", unsaid |
| `probe-message-promises` | a field a tile names in its own refusal and then answers without |
| `probe-missing-list-reach` | a refusal that lists some inputs while others move the verdict unnamed |
| `probe-envelope-unbounded` | a value ten times past a ceiling `lib/bounds.js` already declares |

None of them needs a ledger — there is nothing to judge at zero — so they are gated for the other half of
the test: **a row appearing at all fails**. Each one's `isFinding` is read from the `console.log` that
prints a row rather than guessed, which matters: five indent their rows and `probe-impossible-dates` prints
tab-separated columns at the left margin, so the indent rule the other five share would have made it blind.
Both directions were negative-tested, by making `probe-impossible-dates` report every date it drives and by
printing one fake row from `probe-message-promises`.

## And the lane that failed on a mirror

The e2e lane failed on `main` with a 404 for `libasound2t64 1.2.11-1ubuntu0.5`.
`playwright install --with-deps` installs the versions in the **runner image's** apt index, and the Ubuntu
archive keeps only the current point release — so once a new one is published the pinned one is gone, and
every push fails on a mirror change rather than a code change. That is the same failure mode the
`ubuntu-24.04` pin exists to stop, arriving by another route. `sudo apt-get update` runs first now, in both
lanes.
