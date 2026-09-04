# spec-v1030 — The build failed because of the calendar

## What happened

spec-v1028 was committed on 2026-09-03. Its CI build started at 00:09 UTC on the 4th, and the
**"The build must be idempotent"** job failed with 1,721 changed lines:

```
-  <url><loc>https://sophiewell.com/tools/vcss/</loc><lastmod>2026-09-03</lastmod>…
+  <url><loc>https://sophiewell.com/tools/vcss/</loc><lastmod>2026-09-04</lastmod>…
```

Nothing in the change touched a page. `scripts/build-sitemap.mjs` stamped `new Date()` into every
URL, so the committed sitemap and the rebuilt one differ whenever the two builds fall on opposite
sides of midnight UTC. Every push in that window fails, and the failure names the sitemap rather
than the clock.

This is spec-v993's rule reaching a second file: **never diff a value the environment stamps.**
There it was the corpus manifest's `gzipBytes`, measured with the local zlib. Here it is a date.

## Why the obvious fixes do not work

| Fix | Why not |
| --- | --- |
| Exclude `sitemap.xml` from the diff | Drops the only check that the sitemap is reproducible |
| Stamp the HEAD commit date | At build time git reports the *previous* commit; CI rebuilding the commit that carries the file reports the new one. Same failure, more machinery |
| Per-URL `git log -1 -- <source>` | Identical boundary problem, plus 1,700 git calls |

## The fix

`<lastmod>` is gone. A sitemap that claims all 1,704 URLs changed today, every build, was never
true — `docs/spec-seo.md` already listed the undifferentiated stamp as a weakness, and crawlers
discount a `lastmod` that is not reliably accurate. Without it the file changes when the **URL set**
changes, which is the only thing the generator actually knows.

`test/unit/sitemap-has-no-clock.test.js` fails if a date returns to the file. It was verified by
putting one back: the assertion fires and names this page.

## The rule

**A file that a build writes and a gate diffs must be a pure function of the repository.** If a
generator wants to write today's date, that is a decision about what the file *means*, and it makes
the file unreviewable by diff. Check for this when adding a generator, not when a red main branch
points at a file nobody edited.
