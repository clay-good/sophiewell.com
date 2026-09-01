# spec-v955 — The number I wrote went stale the same day

## The finding

spec-v949 rewrote the README's Proof line to say **"1,592 of the 1,706 link straight through to
the source paper"**. spec-v954 then linked nine more tiles, and nothing complained. The
sentence was wrong within hours of being written, by the author of both changes.

The catalog size is gated on twelve surfaces because this repo has been here before — the
README once claimed 1,145 calculators against a catalog of 1,564. The rule those gates encode
is *a visible number and a surface here, in the same change, or it will drift.* This second
number was added without one.

## What changed

Corrected to **1,601**, and `check-catalog-truth.mjs` now derives it from `META` and fails on a
mismatch, alongside the catalog size, the Wells worked example and the group labels it already
holds.

Two details the check has to get right, both of them the reason a hand-count drifts:

- a tile with a **two-paper `citationUrls` list** links straight through as much as one with a
  single link, so it counts once, not twice and not zero times;
- the **twelve tiles that link a PubMed search** (spec-v943) do not link straight through to
  anything, and the sentence names them separately. The check counts them separately too, and
  fails if that number moves without the sentence moving.

It reads `META` rather than `dist/`, so it runs in `npm run lint` without a build on disk.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-catalog-truth.mjs` | clean — **README source-link count 1601 matches** |
| the same, with the README back at 1,592 | `README says 1592 tiles link straight through to the source paper; META has 1601` |
| built pages carrying "Read the source" | 1,601 |
| built pages carrying "Search PubMed for this source" | 12 |
| `npm run lint`, `npm run build` | clean |
