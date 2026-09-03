# spec-v1027 — The permanence was not the fix

## What CI caught

spec-v1022 corrected the out-of-range warning to the pattern `docs/accessibility.md` describes:
a **polite** live region rather than an assertive `role="alert"`, and `aria-describedby` tying the
message to the field it is about. It also made the element **permanent** — created empty and
`hidden` when the tile renders — on the reasoning that a live region must exist before its content
changes to be announced at all.

That third part broke three suites:

| Suite | What it asserts |
| --- | --- |
| `intro-note` | the explanation sits directly above the results, not inside the live region |
| `answer-said-once` | the answer's heading carries the whole reading after an input changes |
| `deep-link-round-trip` | the tiles that fetch their inputs still answer their own link |

An empty paragraph parked between the hoisted explanation and `#q-results` is exactly what those
three are looking at. Twenty-one tests failed.

## The correction

The warning is created **on demand** again, as spec-v1009 had it, and removed when the value is
fixed. A node inserted *with* its text is announced the same way `role="alert"` is — that is how the
original worked — so the permanence bought little and cost three suites.

What spec-v1022 got right is kept: **polite, not assertive**, and **`aria-describedby` on the
offending input**, appended to whatever the field already had and removed when the value is
corrected.

## What I should have run

The change moved an element next to `#q-results`. Three suites exist whose entire subject is what
sits next to `#q-results`, and I ran none of them — I ran the suites about the *warning* instead.
That is the second time in this program: spec-v1008 shipped a defect because I ran the suites the
change was about rather than the suite that owned the surface it touched.

**The rule that would have caught both: when a change moves DOM, run the suites that assert about
that DOM's neighbours, not the ones that assert about your feature.**

## Proof

`intro-note`, `answer-said-once` and `deep-link-round-trip` — 22 tests — pass. So do
`declared-ranges` (7, updated to expect an absent element rather than a hidden one), `smoke`,
`no-impossible-number` and `no-answer-from-nothing` (80 together), `a11y-check`, and the full lint
chain.
