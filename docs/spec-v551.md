# spec-v551.md — iRECIST time-point response tile

> Status: **SHIPPED (2026-07-28).** Builds the `irecist` tile — time-point response for trials testing
> immunotherapeutics. Catalog **1400 → 1401**, group G.

## Why

`irecist` was zero-hit while `recist` was already in the catalog — a **companion gap**, and the most useful
kind: iRECIST exists precisely *because* RECIST 1.1 gets one case wrong.

Immunotherapy can produce **pseudoprogression**: immune-cell infiltration transiently enlarges lesions, or
makes undetectable lesions detectable, and a deep and durable response follows. Under RECIST 1.1 that first
scan is progressive disease, full stop — and any PD permanently precludes a later CR, PR or SD. iRECIST
changes exactly that.

## The four rules, each of which inverts or extends RECIST 1.1 knowledge

**1. Progression is never assigned on a single scan; iCPD is unreachable without a prior iUPD.** The first
assessment meeting RECIST 1.1 progression criteria is **iUPD** (unconfirmed). Confirmation requires a
further assessment **at least 4 weeks and no more than 8 weeks** later. The lib enforces this structurally
rather than by warning — a test sweeps all 24 category combinations and asserts iCPD never appears without
a prior iUPD.

**2. The bar resets.** If the confirmatory scan shows shrinkage **against baseline** meeting iCR, iPR or iSD,
the iCPD criteria are *not* considered met: that response **is** assigned, and iUPD must occur again from
nadir and then be confirmed before iCPD can be reached. The source states the contrast outright — *unlike
RECIST 1.1, where any PD precludes later CR, PR or SD*. iUPD may therefore be assigned **multiple times** so
long as iCPD is never confirmed.

**3. No change from iUPD is still iUPD.** Confirmation requires **further** increase, not persistence.
Treating the confirmatory scan as a yes/no on "is the disease still progressed?" would convert every
stable-but-enlarged patient into confirmed progression — the precise failure mode iRECIST was written to
prevent.

**4. New lesions do not automatically mean progression, and are never added to the baseline target sum.**
Up to five, no more than two per organ, are recorded as **NLT**; everything else as **NLNT**. Folding them
into the sum of measures of the original target lesions would inflate that sum and manufacture the very
progression iRECIST treats as provisional. NLNT alone can drive iUPD or iCPD without any lesion meeting NLT
criteria.

## The confirmation thresholds are deliberately not uniform

| Category | What confirms iCPD |
| --- | --- |
| Target | Further increase in sum of measures of **at least 5 mm** |
| Non-target | **Any** further increase — explicitly *need not* meet criteria for unequivocal PD |
| New lesions | NLT sum up ≥5 mm, **or** any NLNT increase, **or** additional new lesions |

Plus: RECIST 1.1 progression in a category that had **not** previously progressed also confirms iCPD.

The four are separate fields for this reason. Collapsing them into one "did it get worse?" question would
apply the 5 mm bar where the source does not put it, and would miss confirmations the source counts. A test
asserts the target route mentions 5 mm and the non-target route does not.

## Scope (spec-v11 §5.3)

A **data-collection and analysis standard for clinical trials**. The source says so directly: it describes
what data are to be collected, submitted and analysed, and all decisions about continuing or stopping
therapy rest with the patient and their health care provider. The tile does **not** decide whether to
continue treatment past iUPD — and the source's own condition for permitting that, that the patient be
**clinically stable**, is a clinical judgment it cannot make and does not attempt. It does not measure
lesions, does not determine whether a new lesion is malignant rather than artefactual, and does not compute
best overall response across time points.

## Files

- `lib/irecist-v551.js` — `irecist()`, `TARGET_RESPONSES`, `NON_TARGET_RESPONSES`, `CONFIRMATION_WINDOW`,
  `CONFIRMATION_THRESHOLDS`.
- `views/group-v551.js` (RV551) — three **h2** sections: this assessment, the preceding assessment, and the
  confirmation questions with their differing thresholds in the labels.
- `mcp/adapters/irecist-v551.js` — wave 376.
- `test/unit/irecist.test.js` — 21 tests, weighted to the four rules above.
- `docs/spec-v551.md` (this file).

## Sourcing (spec-v97)

Categories, thresholds and the reset rule re-fetched, never recalled — transcribed from the guideline
manuscript itself (text extracted from the RECIST working group's own PDF), with the numerics independently
reproduced by trial protocols quoting the criteria verbatim:

- Seymour L, Bogaerts J, Perrone A, et al. iRECIST: guidelines for response criteria for use in trials
  testing immunotherapeutics. *Lancet Oncol.* 2017;18(3):e143-e152.
