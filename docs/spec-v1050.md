# spec-v1050 — The link that looks like it worked

spec-v1049 checked that a markdown link points at a **file** that exists. Two more questions belong
in the same pass, because they are the same reader clicking the same link.

## An anchor that names no heading

`docs/spec-v100.md` linked to `scope-mdcalc-parity.md#7`. The heading is *"## 7. The reciprocal
commitment"*, whose slug is `7-the-reciprocal-commitment`, so the anchor missed — and GitHub does not
say so. It lands the reader at the top of the page. **That is worse than a 404: the link looks like
it worked**, and the reader concludes the section they were promised is not there.

The other one was not a typo. `docs/stability.md` — which ships to the live site under `/docs/` —
told readers:

> The changelog is linked from the footer and viewable in-site at `#changelog`.

(That last part was a live link to an in-site anchor of that name.)

Neither half was true. The in-site `#changelog` route was removed in the minimalist-search pivot, and
the footer links the **repository**, not the changelog. A commitment page was promising a reader a
route that had been gone for months, and the anchor pointing nowhere was the only visible trace. It
now names `CHANGELOG.md` in the public repository, with a dated correction saying what it used to
claim.

## An `npm run` the repo does not define

Eight documents told a contributor to run a script that does not exist — seven of them naming
`check-pa-staleness`, where the repo defines `check:pa-staleness`. A dash where the project uses a
colon, and the reader gets `Missing script`.

That is the failure `CONTRIBUTING.md` was rewritten for once already: **a public repository's
instructions are code that a stranger executes, and nothing was executing them.** Now something is.

## The gate

All three checks are one pass over the same 2,089 markdown files, in the lint chain
(`scripts/check-doc-internal-links.mjs`): the file part of every relative link, the anchor against
the target's heading slugs, and every `npm run <name>` against `package.json` and
`mcp/package.json`. Verified by planting one of each and watching them fail.

The heading slug follows GitHub's rule, which is worth writing down because getting it wrong makes
the check useless in the noisy direction: lowercase, drop anything that is not a word character,
space or hyphen, then turn **each space into its own hyphen**. My first version collapsed runs of
spaces to one hyphen and reported nine false positives — every heading of the form
``### 2.2 `bode-index` — multidimensional COPD prognosis``, where the stripped em-dash leaves two
spaces and the real slug carries two hyphens.
