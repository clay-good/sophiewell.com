<!--
Title: Conventional Commits — type(scope): imperative summary, lowercase, no
trailing period. e.g. fix(citations): the four links that opened the wrong paper
-->

## What was wrong / what was missing

<!-- The old behavior, or why this is needed. Plain language. -->

## What this does

<!-- The new behavior and the mechanism. -->

## Proof it works

<!--
The evidence, not the intention. A failing-then-passing test, before/after
output, repro steps. "Tests pass" is not proof; which test, and what did it
assert that it could not assert before?
-->

## Notes

<!-- Scope limits, follow-ups, anything non-blocking. -->

---

- [ ] `npm run release:check` passes locally — the same gate CI runs.
- [ ] If I touched tile text, a label, a band, a citation label, or CSS:
      `npm run test:mobile` passes. `release:check` never lays a page out, so it
      cannot see a line too wide to wrap; that has broken CI twice, an hour after
      everything local was green.
- [ ] If this adds or changes a calculator: the citation is a peer-reviewed
      primary source, the worked example pins a boundary, and the count surfaces
      are updated (`check-catalog-truth` fails CI if any drift).
- [ ] If this changes a commitment: `docs/spec-v50.md` §3 is amended by name in
      this same PR, and the check that enforces it changed with it.
- [ ] No third-party network call, script, login, account, cookie, analytics, or
      AI integration. These are forbidden by the commitments, not by preference.
