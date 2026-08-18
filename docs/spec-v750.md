# spec-v750.md — 17px, and the fieldset that would not shrink

> Status: **SHIPPED (2026-08-18).** Two CSS declarations. No tile added, no number changed.
> Catalog stays **1564**.

## Why

The base font was 16px — the browser default, chosen by nobody. This is read on a phone held
one-handed at arm's length on a ward, and on a shared workstation across a desk. Every size on the
site is expressed in `rem`, so one declaration moves the entire scale together: headings, input
labels, result lines, the pre-rendered tool pages, the hub lists.

## What changed

`html { font-size: 17px }`. That is the whole readability change — about 6% on every piece of text
on the site, with no component rule touched and no layout rewritten.

Raising it surfaced a latent bug. At 17px, `vent-sbt-peep` began side-scrolling at 320px:

> `vent-sbt-peep (scrollWidth 330 > clientWidth 320)`

Not the font. Browsers give `<fieldset>` a UA `min-width: min-content`, which a normal block does
not have — the element refuses to shrink below the widest thing inside it and overflows its parent
instead. That tile groups its inputs in a fieldset containing a select whose longest option reads
`Low-PEEP arm (Brower 2000)`. At 16px the intrinsic width happened to fit; at 17px it did not. The
bug was always there, one long option away from firing on any of the tiles that use a fieldset.

`fieldset { min-width: 0 }` lets it shrink like everything else. The select inside already carried
`max-width: 100%`.

## Proof

- `test/integration/mobile-no-hscroll.spec.js`, `static-pages-mobile.spec.js`, and
  `mobile-touch-targets.spec.js` — **38 cases**, including the whole-catalog 320px sweep and the
  every-tool-page sweep, all passing at 17px. The catalog sweep is what caught the fieldset, and it
  is the standing gate on it.
- `npm run lint`, `npm run test:unit` (11,401), `npm run test:a11y`, and a full `npm run build`
  clean.

## The lesson worth keeping

A global size change is a cheap way to find layout that only fit by luck. Nothing about `<fieldset>`
overflowing its parent was caused by the font; the font just moved one tile past the edge that
several were already sitting on.
