# spec-v1694 — A build gate is a dated claim, so date it

> Status: **SHIPPED (2026-11-07)**. No tile. One finder, one data file, one guard; the last of today's
> run of gate re-tests ([v1689](spec-v1689.md), [v1690](spec-v1690.md), [v1691](spec-v1691.md),
> [v1692](spec-v1692.md), [v1693](spec-v1693.md)).

## The problem today exposed

A build gate's reason is a claim about a URL on a date: "the publisher returned a bot check on October
19, 2026", "optn.transplant.hrsa.gov refused the request", "not open access". Those sentences then get
read by the next session as properties of the *document*, and nothing re-checks them. Today three of
them were wrong, in three different ways:

| Gate | Recorded | Actually |
|---|---|---|
| WHO hand hygiene manual | "bot-check page from WHO IRIS" | Downloads in one call. `WebFetch` gets 403, curl with a browser user-agent gets 200 and a 34-page PDF. **One fetcher was being refused, not the document.** |
| WHO GHE DALY methods | "was not read" | Freely published on WHO's own CDN. |
| ACMG carrier screening | "not open access" | The 2021 practice resource is in PMC. |
| OPTN KDPI/EPTS | "optn.transplant.hrsa.gov refused the request" | That host no longer serves the site at all: 301 to `hrsa.gov/optn`. **The recorded reason pointed at a domain that could only ever refuse.** |

Three tools and one correction came out of simply re-trying. The gates had been sitting since October
because nothing told anyone to look again.

## And one gate that a status code would get wrong in the other direction

QualityNet answers **200** for the Hospital OQR Specifications Manual page. It is a 5.7 KB
single-page-application shell whose only links are its own bundle, favicon and stylesheet. A probe that
reported status alone would mark that gate open and send someone looking for a document that is not in
the response.

## What shipped

**`data/build-gates.json`** — one row per gated tool: the source, the URL the claim is about, a `kind`
(`publisher-paywall`, `priced-publication`, `waf-blocked`, `script-rendered`, `not-yet-published`,
`policy-unsettled`, `date-conditioned`, `dropped`), the status last seen, and a note saying what was
actually found. Fifteen rows, carrying today's evidence.

**`scripts/probe-build-gates.mjs`** — re-probes every row and prints the status beside the recorded one,
calling out what changed. It is a **finder**: it asserts nothing, fails nothing, and is deliberately
**not** in `npm run lint` or `npm test`, because it is the only script here that needs the network to
tell the truth. It makes two judgments a status code cannot:

- `readsAsShell` — a small HTML body whose only links are its own bundle is reported as "script shell,
  no document", which is the QualityNet shape.
- `movedHost` — a redirect that changes host is reported as a move, which is the OPTN shape.

It prints the warning that matters most: **a changed status is not permission to build.** It means the
document can be fetched; it still has to be read and the tool written against it.

**`test/unit/build-gates.test.js`** — eight cases. Every row complete with a known kind; a row with no
URL is one of the kinds that cannot have one; **every tool in the generated `docs/unbuilt-tools.md` has
a row**; a row for a tool no longer in that index must say what it still describes, so it cannot
outlive its gate; and the two judgment functions, including that a PDF is never a shell and a page over
20 KB is not one either.

## A gap the guard found immediately

`tpa-eligibility` is unbuilt — 0 of 9 tasks — and **does not appear in `docs/unbuilt-tools.md`**. That
index is generated from the tool headings in `docs/spec-*.md`, and this tool is specified only as an
openspec change with no spec-v document, so the index cannot see it. The index's own blurb says "Across
every spec", which is true and also narrower than it reads. The gate row records this; widening the
generator to walk `openspec/changes/` is a separate change, because that page is byte-asserted by its
own test.

## How to use it

```
node scripts/probe-build-gates.mjs              # every row
node scripts/probe-build-gates.mjs --tool kdri-kdpi
node scripts/probe-build-gates.mjs --offline    # print what is recorded, fetch nothing
```

Run it when picking up gated work, before trusting any sentence about a source. When it reports a
change, read the document, build the tool, and update the row with what the probe found.
