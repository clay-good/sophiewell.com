# spec-v1049 — Thirteen links into nothing

The repository is public now. Every relative link in a markdown file is one a reader clicks on
GitHub, and a dead one is a 404 with the project's name on it.

Nothing checked them. `check-source-urls` and the monthly link check are both about **external**
citation URLs; the docs cross-link **each other** 6,341 times and no gate had ever looked. Thirteen
were dead.

## Two kinds

**A file that moved** — two CHANGELOG entries naming test files later folded into others
(`drip.test.js` → `clinical.test.js`, `cthr.test.js` → `decision-rules-v258.test.js`), three tile
links written as bare slugs that shipped under different ids (`bclc` → `bclc-hcc`, `milan-hcc` →
`milan-criteria`, `bhutani-nomogram` → `bhutani-bilirubin`), and one link to a spec page that was
never written (`spec-v116.md`). Each is repointed, with a note saying the name changed.

**A file that was deleted while a document went on describing it.** `docs/spec-v10.md` still told
the reader:

> The deterministic classifier and routing table (`lib/artifact-detect.js`, `lib/artifact-route.js`,
> `lib/artifact-handoff.js`) **remain in the tree** as reusable pure-function modules for any future
> clinical-input surface.

All three were deleted. Nothing recorded it, and the note went on promising a reader they were there
— with working-looking links — until the sweep found the links pointing at nothing. The sentence now
carries a dated correction, and `spec-v7.md` and `spec-v49.md` reference the removed modules as code
text rather than as links.

## The gate

`scripts/check-doc-internal-links.mjs`, in the lint chain. It resolves the file part of every
relative markdown link and fails on any that is not there; anchors, `http(s):` and `mailto:` are
skipped. Verified by adding a link to a spec that does not exist and watching it fail.

Note the sibling, and the reason for the longer name: **`check-doc-links.mjs` already existed**
(spec-v1004) and checks the *external* URLs in the same documents — over the network, monthly,
warn-only. I wrote this one straight over it, and only found out because
`test/unit/doc-links.test.js` failed on a missing export. The lesson is the ordinary one: a file
whose name is the obvious name for what you are writing very likely already does something. Read
before writing.

## Why this belongs in the lint chain rather than on a cadence

A dead internal link is the cheapest possible signal that **a document has outlived its code**. That
failure mode already has a name in this project — `docs/spec-v1005.md` found two licensing tests
named by two documents a year after the tests were deleted — and a link is the one form of it a
machine can check in under a second. It should fail on the commit that creates it, not a month later
in a report.
