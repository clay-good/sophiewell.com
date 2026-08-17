# spec-v743.md — The lede check was reading 93% of the ledes

> Status: **SHIPPED (2026-08-17).** Copy only. No tile added, no number changed, no catalog
> surface moved. Catalog stays **1564**.

## Why

`scripts/check-lede-copy.mjs` exists because adapter summaries use ALL CAPS to flag things to an
agent skimming a tool description, and the first sentence of that summary is the **lede** on the
tile's page and its line in search results. Emphasis meant for a machine reads as shouting at a
nurse. The gate has been in `npm run lint` since the last round, reporting clean.

It was reading 1,439 of the 1,540 summaries.

The extractor matched `summary: '...'` only. Adapters also write summaries as backtick template
literals (76) and double-quoted strings (25), and every one of those — 6.6% of the catalog — sat
outside the check. `bauer-score` is what it looks like from the reader's side:

> The BAUER SCORE (Bauer and Wedin 1995) and MODIFIED BAUER SCORE (Leithner and colleagues 2008)
> estimate survival after surgery for SKELETAL METASTASES.

Shipped, indexed, and green.

## What changed

| | |
|---|---|
| **Extractor** | Matches all three delimiters. 1,439 → **1,540** summaries seen. |
| **Found** | **30 shouting ledes**, every one of them in the newly-visible files. |
| **Also fixed** | 10 more in already-visible files whose shouted words the stoplist did not name — anatomy and plain adjectives: "a femoral NECK fracture", "a PELVIC RING injury", "an induration is POSITIVE when it meets the cutoff". |
| **Stoplist** | +9 words. `HEAD` deliberately left out: a hyphen is a word boundary, so it would fire on `HEAD-US` and `HEADSS`. |
| **False positive** | A template literal's `${P.CRITERIA...}` is code the reader never sees; the identifier was read as a shouted word. Interpolations are stripped before the check. |

Each of the 40 rewrites is a targeted phrase replacement, not a rewritten sentence, so genuine
acronyms (ARC-HBR, HLH-2004, IGCCCG, RUCAM, ESHRE, qPitt) and every `${...}` survive untouched.
Emphasis deeper in a summary, where only agents read, is left exactly as written.

## Proof

- `test/unit/lede-copy-coverage.test.js` — the gate's extractor must see **every** summary in the
  tree, whatever delimiter it uses, so this hole cannot reopen for a new adapter. A second case
  fails any lede with no lowercase letter in it at all, whatever the stoplist happens to contain.
- Negative-tested twice: re-shouting a backtick summary fails the gate (it did not before), and a
  double-quoted probe file is invisible to the old regex and visible to the new one.
- `npm run lint`, `npm run test:unit` (11,384), `npm run test:mcp` (395), `npm run test:a11y`, and
  `npm run data:verify` all clean. Tier 1 of the search corpus is unchanged at 50.3 KB gzip; only
  Tier 2 (the summary prose) moved.

## The lesson worth keeping

A gate that reports clean is evidence only about what it reads. This one had a precise, documented
rule and an actively-maintained stoplist, and it was silently skipping 101 files — the newest ones,
because the newer adapters are the ones written with template literals. When a check parses source
text, assert its **coverage** separately from its **verdict**.
