# spec-v1058 — The runtime the architecture document denied

`docs/architecture.md` is what a contributor reads to understand how this thing runs. It said:

> All computation runs in the main thread. The two Web-Worker tiles from earlier specs … were
> retired … **no Web Workers remain at runtime.**

One does. The prior-authorization packet linter (`pa-lint`, spec-v52) offers optional on-device OCR,
and `lib/pa/ocr.js` opens with the opposite claim in its own header:

> Posture (spec-v50 §3): **OCR runs entirely in a Web Worker in the tab.**

Both were written by people who were right at the time. The architecture note was true when spec-v10
retired the two Web-Worker tiles; spec-v52 added a worker back eighteen months later and nobody
returned to the paragraph that said there were none.

## The bigger half

The false sentence is the visible symptom. The real gap is that **the whole subsystem is absent from
the architecture document** — fourteen modules under `lib/pa/`, three vendored libraries doing
extraction (`pdfjs`, `mammoth`, `tesseract.js`), roughly 9 MB of lazily-loaded WASM, and the one
runtime path in the product that is not "a formula and a citation". A reader reasoning about
threading, the CSP, or the offline story would have had no idea it existed, and would have been told
it did not.

It now has a section of its own, stating the three properties that keep it inside the posture the
rest of the site holds — **lazy** (nothing loads until a file is dropped; the OCR engine not until
the user asks for it), **same-origin** (worker, WASM core and language data all under `/vendored/`,
admitted by `script-src 'self' 'wasm-unsafe-eval'` and nothing else), and **on-device** (the document
never leaves the tab, which is what lets the tile accept a patient's paperwork at all).

## Why this one has no gate

The other three documentation defects this session were mechanically checkable — a dead link
(spec-v1049), an anchor naming no heading (spec-v1050), a published promise with no check behind it
(spec-v1051). *"No Web Workers remain at runtime"* is a claim about the shape of the system, and I am
not going to pretend a regex can hold it.

What can be checked, and now is: every file name in the document's prose resolves. Sixteen distinct
names, all present. That is a weaker property than truth, and worth saying so plainly rather than
implying the section is guarded.

## The rule

**A document that asserts an absence goes stale silently.** "There are no X" is true until someone
adds an X, and the person adding it is reading the code, not the paragraph three documents away that
promised there weren't any. When adding something the architecture forbids, search the docs for the
prohibition — it is faster than the review that will not happen.
