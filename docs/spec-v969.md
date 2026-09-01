# spec-v969 — A citation label is a data value, and it broke the phone

## What happened

spec-v964 gave `cdai-ra` and `plr` labelled source links. `npm run lint`, `npm run test:unit`,
`npm run test:mcp` and `npm run build` were all clean; the commit shipped; **an hour later CI
failed both chromium 320px sweeps.**

```
static tool pages with horizontal scroll at 320px:
  - cdai-ra: 361/320
  - plr:     337/320
```

## Why nothing local caught it

`citationUrls` renders **the label as the link text**, so the width of that link is a data value
— it grows with the paper's name. Both citation-link rules forbade it the line breaks its own
spaces offered:

```css
.tool-page .tp-citation-link { white-space: nowrap; word-break: break-word; }
.tool-meta  .citation-link   { display: inline-block; white-space: nowrap; }
```

`word-break` cannot break what `nowrap` will not wrap, and `inline-block` makes the whole label
move as one box. A 37-character label ("Lee 2018 (healthy reference interval)") became a 310px
unbreakable word; a 40-character one became 335px. **This is the same shape as the 2026-07
slash-joined-token failure: a long unbreakable token in tile data, invisible to every gate that
does not lay the page out.** Only the two chromium sweeps do that, and they run in CI.

## The fix

Structural, not cosmetic. The labels are human text with spaces, so let them wrap where the
spaces are, and let a bare URL — the other thing this class renders — break anywhere rather than
push the page sideways:

```css
.tool-page .tp-citation-link { overflow-wrap: anywhere; }
.tool-meta  .citation-link   { overflow-wrap: anywhere; }
```

Five labels were shortened as well (the longest is now 32 characters, down from 40), so the CSS
is a guard rather than the only thing standing between a paper's name and a sideways page.

`citation-link-wrapping.test.js` pins all of it: neither rule may reintroduce `nowrap` or
`inline-block`, both must keep `overflow-wrap`, and no label may exceed 40 characters. That runs
in `npm run test:unit`, where the next person will see it in seconds rather than in an hour.

## Verified

Rebuilt, served, and measured at 320px in a real browser on **twelve** pages carrying labelled
links — `cdai-ra`, `plr`, `ecog-karnofsky`, `corrected-ca-na`, `sepsis-bundle-clock`, `abg`,
`ranson-bisap`, `audit-full`, `ttkg`, `electrolyte-replacement`, `fena-feurea`,
`heatstroke-decision` — on both the pre-rendered page and the in-app route. Every one reports
`scrollWidth 320 / clientWidth 320`, and the document has no element extending past 321px.
Before the fix the same measurement found the offending element by name:
`A.tp-citation-link, right: 359`.

| Check | Result |
| --- | --- |
| pages measured at 320px | 12 static + 2 in-app, **0 overflowing** |
| `citation-link-wrapping.test.js` | 3 pass, new |
| longest citation label | 40 → **32** characters |
| `npm run lint` | clean |
