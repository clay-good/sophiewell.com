# spec-v745.md — The 663-character opening line, and the 17 pages with nothing worked out

> Status: **SHIPPED (2026-08-17).** Copy only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

Two defects, both on the same set of pages: the tiles with no MCP adapter — the document
builders, the timers, the question flows.

**The lede ran long.** A tool page opens with one sentence saying what the tool does. Where the
sentence came from hand-authored copy and there was no adapter summary to lead with instead, the
page printed the whole thing however long it ran. The smoke-inhalation antidote page opened with
663 characters — an eight-line paragraph, parentheses three deep, standing exactly where the one
line telling the reader what they are looking at belongs. Twenty-seven pages led like that.

**Seventeen pages had no worked example.** The example is the part that makes a page usable: the
inputs on the left, one filled-in run of values on the right, the result underneath. It is built by
joining `META.example.fields` (keyed by DOM id) to the MCP field registry (which carries the
label). A tile with no adapter has no registry, so the join found nothing and the block was left
off — on exactly the pages that most need to show their shape, because a HIPAA authorization form
or an SBAR handoff is nine free-text fields whose expected content is not guessable from the
label.

## What changed

**The lede leads with a clause.** These sentences are built the same way — a clause naming the
tool, then a colon or a dash, then everything it covers — so the cut is already written into the
text. The whole sentence stays in "What this is", one scroll down.

| | |
|---|---|
| Before | *Generate a printable prior-authorization checklist that lines up the data fields most payers request before approving a service: patient demographics, insurance identifiers, the requesting provider's NPI and TIN, the rendering provider when different, the CPT or HCPCS code (with modifiers when…* |
| After | **Generate a printable prior-authorization checklist that lines up the data fields most payers request before approving a service.** |

Longest lede on the site: **663 → 235 characters**.

**The example reads its labels from the view.** Where there is no registry, the label is taken from
the call in `views/*.js` that names the DOM id — four shapes, because the views write fields four
ways: `field('Label', 'id')`, `el('label', { for: 'id', text: 'Label' })`, a `[label, id]` tuple
list built in a loop, and the `f29d`-style aliases. **1,541 → 1,558 pages carry an example.** Free
text is normalized for a table cell: a wallet card's newline-separated medication list becomes
`Lisinopril 10 mg daily; Metformin 500 mg BID`, and a checkbox's stored `on` prints as `Yes`.

The rule from spec-v744 holds here too: **every key must resolve or none of them print**. A partial
join would show some of the values behind a result and quietly drop the rest, which is worse than
showing none. `mppr` is the one tile that still cannot resolve — it builds its row ids at render
time — and it keeps no example, exactly as before.

## Proof

- `test/unit/tool-page-option-labels.test.js` — two new cases. A coverage list naming all 17 tiles,
  asserting every key of each one's example still resolves to a view label. And six label/id
  pairings checked against the view by hand, because **mispairing** is the failure a source-text
  parser produces: reading the label off the call next door pairs a real id with a real label and
  prints a plausible lie.
- `npm run lint`, `npm run test:unit` (11,396), `npm run test:mcp`, `npm run test:a11y`,
  `npm run data:verify`, and a full `npm run build` all clean.

## The lesson worth keeping

Both defects were invisible in aggregate and glaring per page. The lede check reported clean
because every lede *was* one sentence; the example gate reported clean because it counted the joins
that worked. Neither measured the reader's experience of a single page. Sorting all 1,564 pages by
one blunt number — longest first line, missing section — put both at the top in one pass.
