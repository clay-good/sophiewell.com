# spec-v1004 — The monthly link check reported into a log nobody opened

## The finding

spec-v1002 found twelve dead source links in the prior-auth ledger. The uncomfortable part is that
`scripts/check-pa-source-urls.mjs` had been finding them all along: it runs on the first of every
month, it is warn-only, and its output goes to a workflow log. **The links had been dead for
months and the check had been reporting it, correctly, to nobody.**

Warn-only is still right. A publisher's bad afternoon must not fail a build for a reason unrelated
to the change under test — spec-v999 measured that exactly, three consecutive runs producing three
different phantom failures. The defect is not the severity. It is that the report had no reader.

And one surface had no check at all: the documents. `docs/legal.md` cited NADAC at a
`data.medicaid.gov` dataset path that has since moved, and nothing would ever have said so.

## What changed

**The report reaches a person.** The monthly job now captures both link checks, writes them to the
run's job summary, and — if either reports a `DEAD` row — opens a GitHub issue titled *"chore: dead
source links found by the monthly check"*, or comments on it if it is already open. The workflow
gains `issues: write` for exactly that. Negative-tested against captured output from a clean run
and from the run that found the twelve: clean files no issue, dirty files one.

**The documents are checked.** `scripts/check-doc-links.mjs` sweeps every external link in the
living documentation — README, CONTRIBUTING, SECURITY, CHANGELOG and the non-frozen `docs/*.md`.
`docs/spec-v*.md` are deliberately excluded: they are records of what was true when written, and
rewriting a link inside one would falsify the record.

It reuses the four-verdict shape spec-v979 established, because these need four different
responses — and getting the distinctions right is what makes the report worth reading:

- **BLOCKED** is a bot wall. `cdc.gov`, `medicaid.gov` and `securityheaders.com` answer a script
  with 403 and a browser normally.
- **MOVED** is only reported when the destination is *materially* different. A trailing slash the
  server adds, a fragment the server never sees (`sophiewell.com/#wells-pe` → `sophiewell.com/`),
  and GitHub bouncing an anonymous fetch through `/login?return_to=<the original>` are all the same
  page. The first pass reported nine MOVED rows; six of them were these, and calling them
  relocations is how a report becomes noise.
- **DEAD** believes 404 and 410 at once and retries everything else three times first.

## What it found

One dead link, now fixed: `docs/legal.md` cites NADAC at `medicaid.gov/medicaid/nadac`. Three real
relocations updated so the reader lands in one hop — DailyMed's index, the Mozilla Observatory
(moved to `developer.mozilla.org`), and the CMS coverage database search page, which
`docs/pa-maintenance.md` carried twice.

Final state: **29 ok, 1 moved, 1 blocked, 0 dead** of 31 links. The one MOVED is
`modelcontextprotocol.io` redirecting to its own docs, which is a home page doing what home pages
do, not a broken reference.

## Proof

Ten unit tests pin the pure half — every verdict, all three not-really-moved cases, the URL
extractor, the skip list, and that no `docs/spec-v*.md` is ever scanned.
