# spec-v1053 — What the page says and what the app says

I had spent the session auditing this catalog through test harnesses. This one came from opening it
in a browser and reading the screen.

## A regression I had shipped

`intubation-difficulty-scale` opened saying:

> Rate the operators beyond the first and the alternative techniques used: the total is the sum of
> the items, so one left blank is not an item scoring zero.

That is spec-v1044's guard working exactly as designed — and it was firing on the tile's **own worked
example**, which fills only two of the four numeric items. The tile had stopped demonstrating itself.

The fix is the rule the guard exists to enforce: **a typed 0 still means zero.** A first-attempt
intubation by one operator with no alternative technique *is* zero of each, so the example now says
so. Every other tile spec-v1044 touched was checked the same way; this was the only one.

Two things about how it was found are worth keeping.

**`example-correctness` did not catch it.** The documented numbers (2, and the range 1-5) were
satisfied by the values sitting in the *input boxes* — the same fallback that hid `lab-interpret` in
spec-v1048. A sweep that reads inputs when the output comes up short can be satisfied by a tile that
renders no answer at all.

**Nine tiles were changed and I verified nine tiles.** The verification was "does the guard fire on a
blank field", not "does the example still work". The guard's own suite passed; the tile was broken.

## Two surfaces, two sentences

The pre-rendered page at `/tools/wells-pe/` prints the documented `expected` string verbatim. It said:

> Wells PE total 4.5 (PE-likely group, moderate probability).

The app prints:

> Wells PE total: 4.5 (Moderate probability)

Both are true of 4.5 — the two-tier model calls >4 *PE-likely*, the three-tier model calls 2-6
*moderate* — but a reader who arrives from a search engine, or who has JavaScript off, is told
something the app never says. The README quoted the same sentence as *"what you get"*.

All three now say what the tile prints. This is the wells-pe instance of a general fact: **the
`expected` string is not documentation, it is published copy** on the surface most readers reach
first.

## What did not turn up

The same probe across all 1,699 examples — a band word the `expected` uses and the rendered answer
never does — found eight, and six were paraphrase rather than contradiction (`ascvd`'s "borderline
to low risk" against "Borderline"; `grace`'s "high risk" against "High (>3%)"). No further
disagreements of substance. Recorded so the probe is not re-run for its own sake.
