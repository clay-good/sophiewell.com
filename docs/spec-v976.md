# spec-v976 — Issue and pull-request templates, and a check that keeps them true

## Why

The repository is public. The issue form is now the first thing a stranger reads, and it was a
blank box — so the reports that matter most arrive without the one thing that makes them
actionable.

For Sophie the highest-stakes report is *a calculator disagrees with the source it cites*. That
report is useless without four things: which calculator, what was entered, what came back, and
**where in the source** the right number is. The last one is the hard one. A disagreement between
two published sources is a reason to leave the tool alone (spec-v97), so "the cut-off is 12.3" is
not a report; "Cross 2009, Table 3" is.

## What this adds

Four issue forms, a config, and a pull-request template.

| Form | Asks for |
| --- | --- |
| **A calculator returns the wrong number** | the URL, every input with units, got, expected, and the DOI **plus the table or figure** |
| **Commitment bypass** | which of the eight commitments, the smallest example, and which `scripts/` check should have caught it — the title prefix CONTRIBUTING already documents |
| **Propose a calculator** | every name including the acronym, the derivation paper with the table the numbers are in, and — optionally, and most usefully — what gets misread about it |
| **Something else is broken** | where, what happened, browser |

The wrong-number form says plainly that everything runs in the browser so nothing was sent
anywhere, and asks the reporter not to paste identifiers into a public issue. The
propose-a-calculator form warns about the two mistakes this catalog actually makes — an instrument
already present under another name, and one that is already an *input* of a larger tool.

`config.yml` routes security reports to the private path SECURITY.md requires rather than letting
someone file a vulnerability in public.

The pull-request template asks for **proof, not intention**: *"'Tests pass' is not proof; which
test, and what did it assert that it could not assert before?"* Its checklist carries the one
thing `release:check` cannot do — `npm run test:mobile`, because nothing in the lint or unit gate
lays a page out, and a line too wide to wrap has broken CI twice, an hour after everything local
was green.

## The check

Templates are copies of claims made elsewhere, and a copy drifts here — the README once said 1,145
tiles against a catalog of 1,564, and the citation disclosure had three different names at once.
`scripts/check-issue-templates.mjs` (wired into `npm run lint`) holds four claims in step:

| Claim | Read from |
| --- | --- |
| the commitment-bypass title prefix | the prefix CONTRIBUTING.md documents |
| the private security address | the address SECURITY.md gives, and no form may discuss a vulnerability without routing to it |
| "eight commitments" | the numbered entries of `COMMITMENTS` in `build-commitments-page.mjs` |
| every input field has an `id` | GitHub silently discards an answer without one |

It is deliberately not a YAML parser: it checks the handful of claims that can be wrong in a way a
reader would notice, and a parser dependency bought for that would be a poor trade in a repository
whose whole posture is *no third-party code*.

**Negative-tested.** Renaming the title prefix, changing eight to nine, swapping the address, and
deleting one field's `id` each produce a distinct, named failure.

## Not included

No code of conduct. That is a governance decision for the maintainer to make and sign, not
something to generate.

## Files

New: `.github/ISSUE_TEMPLATE/{config,wrong-number,commitment-bypass,new-calculator,bug}.yml`,
`.github/PULL_REQUEST_TEMPLATE.md`, `scripts/check-issue-templates.mjs`, this file.
Changed: `package.json` (lint chain), `README.md` (links to CONTRIBUTING and SECURITY, and the
wrong-number form).
