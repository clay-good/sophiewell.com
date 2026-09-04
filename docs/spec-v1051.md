# spec-v1051 — The one commitment sentence nothing was checking

## What the page promises

`/commitments/` opens with this:

> These are the eight guarantees Sophie makes about itself. Each one is a sentence of plain English
> **plus an automated check that fails CI on every commit if the rule is violated.**

I read all eight against the code. Seven hold up — the CSP pins, the cookie and analytics and
auth-vendor deny-lists in `grep-check`, the storage allowlist, the AI-vendor scan, `package.json`
`license === "MIT"`, `LICENSE` beginning "MIT License". Every named check exists and runs in the
lint chain.

The eighth has a second half:

> A small number of vendored third-party libraries under `/vendored/` carry their own permissive
> licenses (Apache-2.0, BSD-2, MIT) and ship from the same origin as the rest of the site.

**Nothing checked that sentence.** A vendored directory could arrive with no `LICENSE` file, or a
copyleft one, or a provenance record naming a license its `LICENSE` text does not match, and the
page would go on telling readers otherwise.

That is the failure `docs/spec-v1005.md` found a year late: two documents naming licensing tests
that had been deleted, while the data they guarded still shipped. This is the same shape one step
earlier — a promise that never had a check rather than one whose check was removed.

## The check

`checkVendoredLicenses()` in `scripts/check-commitments.mjs`, three assertions per directory under
`vendored/`:

1. a `LICENSE` file exists and is not empty;
2. its `_vendored.md` provenance record names a license;
3. that name is on the permissive allowlist **and the LICENSE text agrees with it** — so renaming
   the record without replacing the file fails, which is the way this would actually go wrong during
   an upgrade.

Verified by breaking each in turn: deleting a `LICENSE` (caught), claiming GPL-3.0 (caught, "not on
the permissive allowlist"), and claiming Apache-2.0 over BSD-2 text (caught, "LICENSE text does not
read as apache license 2.0, which _vendored.md claims").

Current state: `mammoth` BSD-2-Clause, `pdfjs` Apache-2.0, `tesseract` Apache-2.0 — all three
consistent, all three now pinned.

## The rule

**A published promise with no check behind it is a claim about the past.** When a document says a
rule is enforced, the cheapest possible audit is to open the thing it names — and the audit is worth
running against every sentence of a page whose whole premise is that the sentences are enforced.
