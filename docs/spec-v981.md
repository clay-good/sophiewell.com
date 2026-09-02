# spec-v981 — spec-v979 fixed the ledger and left the citations

## What was still wrong

A source URL lives in **two** places. `pa-staleness-ledger.json` carries each authority's canonical
URL. Every `pa-lint` rule carries its own copy inside the `citation` string in `lib/pa/rules.js` —
and **that second copy is the one a reader clicks in the report.**

spec-v979 corrected 18 dead ledger URLs. The rule citations kept the dead ones. **133 of them.**

So the fix reached the ledger and not the reader: a biller following a citation out of a
prior-auth finding still landed on the Cigna, Humana, IBX, BCBS Louisiana or Florida Medicaid page
that had already been established as gone.

It was not visible from the ledger either. A ledger row lists **two** rule ids while a payer has
around **twenty** rules, so comparing each source against the rules it names found 15 of the 133.

## The invariant

> **Every URL in a rule's citation must be one the ledger knows.**

Either the source's `url`, or one of that source's new **`alsoCited`** entries — further pages on
the same authority that individual rules link to, like Aetna's obesity-surgery and genetic-testing
Clinical Policy Bulletins beside its general precertification page.

The rule needs no rule-to-source mapping, which is exactly why it holds where the ledger's own
`rules` array did not. Two things follow:

1. A corrected URL cannot be corrected in one place only.
2. **The ledger becomes the complete registry of every URL a reader can click in a pa-lint
   report**, so the monthly link check now covers **91** rather than 84 — the seven that were
   cited by rules and known to nothing were all alive, but nothing had ever checked them.

`scripts/check-pa-rule-citations.mjs` is **offline** — a string comparison — so unlike the network
link check it belongs in `npm run lint`, where drift is caught before it is pushed rather than at
the start of the next month.

## Proof

| Check | Result |
| --- | --- |
| rule citations rewritten to the corrected URL | **133** across 7 payer/agency addresses |
| rule-citation URLs unknown to the ledger | 7 → **0** (registered as `alsoCited`, all verified alive) |
| URLs the monthly link check fetches | 84 → **91** |
| pa-lint golden reports re-seeded | 46, and every changed line is a URL |
| `test/unit/pa-rule-citations.test.js` | 5 pass, including the live ruleset against the live ledger |
| negative test | reverting one URL, and dropping one `alsoCited` list, each fail by name |

## The lesson worth keeping

A fix that updates a value in the place it is *stored* has not landed until it reaches the place it
is *shown*. spec-v979 measured 84 links, corrected 18, published a passing report — and the reader
still saw the old ones. **Find the second copy before claiming the first one is fixed.**

## Files

New: `scripts/check-pa-rule-citations.mjs`, `test/unit/pa-rule-citations.test.js`, this file.
Changed: `lib/pa/rules.js` (133 citations), `pa-staleness-ledger.json` (`alsoCited` on three rows),
its generated `lib/pa/staleness-ledger.js`, `scripts/check-pa-source-urls.mjs` (fetch `alsoCited`),
`package.json` (lint chain), `docs/pa-maintenance.md`, the 46 pa-lint golden reports.
