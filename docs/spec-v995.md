# spec-v995 — A licensing guarantee whose enforcement was deleted a year ago

## The finding

Three living documents name automated tests as the proof of this project's content-licensing
posture:

- `docs/legal.md`: *"A CI test (`test/unit/aha-no-flowchart.test.js`) greps the payload for known
  AHA flowchart phrases and fails the build if any match."* and *"The `aha-no-flowchart` test
  enforces this on every commit."*
- `docs/threat-model.md`: *"The CPT non-AMA test (`test/unit/cpt-no-ama.test.js`) and AHA
  non-flowchart test (`test/unit/aha-no-flowchart.test.js`) cover the existing constraints."*
- `docs/operations.md`, in the quarterly maintenance checklist: *"Confirm no AMA descriptors have
  crept into `data/cpt-summaries/summaries.json` (the `test/unit/cpt-no-ama.test.js` check guards
  this automatically)."*

**Neither file exists.** Both were deleted by the spec-v29 wave 29-2 prune, along with the tiles
that consumed them — while `data/aha-reference/`, `data/cpr-aha-numeric/` and
`data/cpt-summaries/` all stayed in the repository and stayed in the shipped bundle. The claim
outlived its proof by about a year, in the two documents a reader would consult to check exactly
this.

The good news, established before anything was changed: **both tests pass on today's data,
unmodified.** The compliance was real; only the enforcement was gone.

## The half neither test had

`numeric-facts-with-attribution` is a status a dataset manifest declares for itself, and the two
tests guarded the two datasets they happened to be written for. Seven datasets declare it, and
**four of the seven carried no attribution and no notes at all** — `benzo-equiv` (Ashton Manual),
`nubc-special-codes` and `revenue-codes` (NUBC manuals), and `tccc` (CoTCCC). That is the one
thing the status is named for.

`test/unit/restricted-source-attribution.test.js` covers the **set**:

1. The datasets declaring the status are exactly the ones the guard lists — a new one fails here
   and has to be added deliberately, after someone reads its payload.
2. Every one of them states what it does and does not reproduce.
3. The two AHA payloads carry none of the published flowchart phrasing.
4. The two tests the licensing documents name by path actually exist.

The four missing manifest notes are added — not invented, but propagated: `docs/legal.md` already
declares this posture for exactly these sources, and the artifact that should carry it did not.
Phrase-matching is applied only to the AHA payloads, where the source text is identifiable.
Inventing "characteristic" NUBC or CoTCCC phrases from memory would be the same defect as encoding
a threshold from recall; those datasets are held by the attribution rule instead.

## Proof

Each of the four assertions was negative-tested against the real tree and fails on exactly the
defect it exists to catch: deleting `tccc`'s notes fails (2); injecting "Begin CPR" into
`cpr-aha-numeric/cpr.json` fails (3); adding a new folder that declares the status fails (1) —
and, since it has no notes either, (2) as well; deleting `cpt-no-ama.test.js` fails (4).

`npm run data:verify` passes: the four manifest edits add a `notes` field and change nothing else.
Running `build-data.mjs` to generate them restamps `fetchDate` and flips `offlineSeed`, so those
two fields were restored by hand — a manifest should not claim a re-verification that did not
happen.
