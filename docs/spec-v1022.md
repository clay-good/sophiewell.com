# spec-v1022 — The warning I added broke the accessibility rule the project already wrote down

## The finding

spec-v1009 put a sentence above the answer when a value is outside the range its field declares.
`docs/accessibility.md` had already said how a message like that behaves here:

> ARIA is used sparingly and correctly… each tool view's result region uses `aria-live="polite"`.
> Validation errors are associated with the input via `aria-describedby` and announced via the live
> region.

The warning did neither. It shipped as a `<p role="alert">` **created on the first offence**, which
is wrong three ways:

- **`role="alert"` is assertive.** It interrupts a screen reader mid-sentence — and it did so again
  on every keystroke while the value stayed out of range, because typing `10000` into a field that
  accepts 300 passes through `1000` on the way.
- **A live region has to exist before its content changes** for the change to be announced at all.
  Creating the element already populated means some screen readers announce nothing.
- **Nothing tied the sentence to the field it was about.** The input was marked `aria-invalid`, but
  a reader arriving at that input by keyboard had no way to hear why.

## The fix

The region is now in the DOM from the moment the tile renders: empty, `hidden`, and
`aria-live="polite"`. When a value goes out of range it is filled and unhidden; when the value is
corrected it is emptied and hidden again. Each offending input gains
`aria-describedby="range-warning"` alongside its `aria-invalid`, and loses it when the value is
fixed — appended to any `aria-describedby` the field already had, never replacing it.

## The bug the fix introduced, and caught

Placing the region at render time put it **below** the answer, because `hoistResults()` moves
`#q-results` to the top of the tool body on its own `setTimeout(0)` — which ran after the
synchronous insert. The old lazy creation had accidentally avoided this by happening later.

The placement now runs in a task registered after the hoist, so it lands above the answer as
spec-v1009 intended, and still long before a reader can type. The existing assertion that the
warning "sits above `#q-results` and outside it" is what caught it.

## Proof

`test/integration/declared-ranges.spec.js` gains a case asserting `aria-live="polite"`, the absence
of `role="alert"`, and that `aria-describedby` appears on the offending input and disappears when
the value is corrected. The four existing per-tile cases now assert the region is *hidden* rather
than absent. `a11y-check`, the 75-test browser sweep across the range, refusal, impossible-number
and smoke suites, and the full lint chain pass.
