# spec-v1032 — The guard was reading the wrong live region

## What CI caught

Three tests in `no-impossible-number.spec.js` failed on the spec-v1027 run:

```
Expected substring: "too large or too small"
Received string:    "Cardiac power output Infinity W: above the 0.6 W
                     cardiogenic-shock threshold (Fincke 2004)."
```

That sentence is the one `lib/output-guard.js` exists to prevent — a clinical reading of a number
that does not exist. The guard was running. It was reporting nothing to do.

## Why

`guardNonFinite` scanned `body.querySelector('[aria-live]')` — **the first** live region in the tool
body. That was the results region on every tile in the catalog, until spec-v1009 added a second one:
the out-of-range field warning, which is polite, live, and sits *above* the results. From then on
the guard read the warning, found no `Infinity` in it (there never is one), and returned — while the
answer below it stated the impossible number with full confidence.

The warning and the guard were built four specs apart, each correct alone. What broke was an
assumption neither of them wrote down: that a tool body has exactly one live region.

## The fix

The scan iterates every `[aria-live]` in the body and replaces the contents of any that carries a
non-finite number. No coupling to the warning's id, and no ordering assumption left to break the
next time something polite is added to a tile.

`test/unit/output-guard-live-regions.test.js` builds a body with a decoy live region above a
results region holding `Infinity`, and fails if only the first is scanned. Verified by reverting the
selector: the test fails, and passes again on the fix.

## The rule

`docs/gate-self-review.md` already says a gate that reports clean while its defect is present is
worse than no gate. This is a new way to get there: **the gate looked at the wrong element** because
the page grew a second one of that kind. When a change adds an element of a kind something else
selects by role, attribute, or position, search for the selectors that will now match it. The three
tests that caught this were, once again, not the ones I ran after the change that broke it.
