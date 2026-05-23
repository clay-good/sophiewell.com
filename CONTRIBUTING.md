# Contributing to Sophie Well

Sophie Well is public infrastructure for bedside math. Every change
should reinforce that posture. This document captures the process by
which Sophie evolves.

## What kind of changes Sophie accepts

Sophie accepts contributions that:

1. **Add a deterministic tile** that consumes at least one user input
   and produces a computed output, citing a peer-reviewed primary
   source. See [docs/spec-v29.md](docs/spec-v29.md) for the scope
   test and [docs/spec-v11.md](docs/spec-v11.md) for the citation /
   audit-log requirement.
2. **Improve an existing tile** by tightening a citation, widening
   accepted unit inputs (see [docs/spec-v47.md](docs/spec-v47.md)),
   adding a derivation block (see [docs/spec-v48.md](docs/spec-v48.md)),
   or fixing a boundary worked example.
3. **Improve the developer surface**: tests, CI checks, build steps,
   documentation, audits.
4. **Improve accessibility**: AAA contrast, keyboard navigation,
   screen-reader labels, focus management.

Sophie rejects contributions that:

- Add a third-party network call, third-party script, login,
  account, paywall, telemetry, analytics, error reporting, cookie,
  or AI / LLM integration. These are explicitly forbidden by the
  commitments in [docs/spec-v50.md](docs/spec-v50.md) and the
  automated checks under `scripts/check-commitments.mjs` and
  `scripts/grep-check.mjs`.
- Add a tile whose math is not deterministic or whose citation is
  not a peer-reviewed primary source.
- Add a tile that recommends a treatment, an order, or a disposition.
  Sophie computes; it does not prescribe.

## How to add a new tile

1. Write a one-page spec wave doc under `docs/spec-vN.md` (or a
   wave-N section in an existing spec). Cite the primary source.
   List the worked examples that will pin the boundaries.
2. Implement the scoring / computation in `lib/scoring-v4.js` (or
   the appropriate lib module). Add unit tests in
   `test/unit/<tile>.test.js` covering the spec-v11 §3.2 boundary
   set plus rejection of invalid inputs.
3. Add the META entry in [lib/meta.js](lib/meta.js) with citation,
   specialties, audiences, the prefilled worked example, and the
   interpretation bands per spec-v11 §5.
4. Add the renderer in the appropriate `views/group-*.js` using
   the standard input helpers (no `innerHTML`; the grep-check
   forbids it).
5. Append the tile to `UTILITIES` in [app.js](app.js).
6. Add an audit log at `docs/audits/v11/<tile-id>.md`.
7. Update `README.md`, `package.json`'s `description`, the close-line
   in `docs/scope-mdcalc-parity.md`, and the index-page surfaces.
   The catalog-truth check (spec-v46) will fail CI if any drift.
8. Add a CHANGELOG entry under `## [Unreleased]` describing what
   shipped, what changed, and the new `UTILITIES.length`.

Before opening a PR, run `npm run release:check` locally. This is the
same gate that runs in CI.

## How to add or change a commitment

A commitment is a guarantee Sophie makes to its users about its own
posture. They are listed in [docs/spec-v50.md](docs/spec-v50.md) §3
and on the public [/commitments/](https://sophiewell.com/commitments/)
page.

Adding a commitment:

1. Append a new §3.N section to spec-v50 with the public text and
   the enforcement paragraph.
2. Land the corresponding automated check in `scripts/`. The check
   must be wired into either `npm run lint` or `npm run test` and
   must fail CI on the violation it describes.
3. Append the commitment to the COMMITMENTS array in
   `scripts/build-commitments-page.mjs`.
4. The CHANGELOG entry must describe both the new commitment and
   the check that enforces it.

Changing an existing commitment requires amending spec-v50 by name
in the same PR that changes the check. Removing or weakening a
commitment is a fork-level decision and should be discussed in an
issue before any code is written.

## How to file a defect against a commitment

If you have found a way to violate one of Sophie's commitments
without tripping CI - for example, a localStorage write the
allowlist misses, an analytics vendor not in the deny list, or a
network call the CSP does not block - file an issue at
[github.com/clay-good/sophiewell.com/issues](https://github.com/clay-good/sophiewell.com/issues)
with the title prefix `commitment-bypass:`. Include the smallest
example that demonstrates the bypass and the commitment number
(see spec-v50 §3.N) that is being violated. These issues are
treated as security-class defects.

## License

Sophie Well is MIT-licensed. By contributing you agree that your
contribution is also MIT-licensed. Sophie does not require a CLA.
The MIT license is itself a commitment (spec-v50 §3.8); changing
it requires amending spec-v50.

## Maintainership

Sophie aims for a bus factor &ge; 3: at least three people with
merge rights to the canonical repository. This is a goal, not
currently enforced. If you would like to take on a maintainer role,
open an issue describing the surface (clinical citations, build
infrastructure, accessibility, etc.) you would like to own.
