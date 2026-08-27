# spec-v820 — ICHD-3 Criteria (SUNCT and SUNA)

## What this gives you

Enter the attack history; get whether ICHD-3 section 3.3 is met, and which subtype — SUNCT
or SUNA.

This completes the trigeminal autonomic cephalalgias in this catalog: `cluster-headache-ichd3`
(3.1), `indomethacin-headache-ichd3` (3.2 and 3.4), and now 3.3.

## §1 The criteria

- **A** — at least 20 attacks fulfilling B–D.
- **B** — moderate or severe unilateral head pain, orbital / supraorbital / temporal or other
  trigeminal distribution, lasting **1–600 seconds**, as single stabs, series of stabs, or in
  a saw-tooth pattern.
- **C** — at least **one** ipsilateral cranial autonomic symptom or sign.
- **D** — frequency of at least one a day.
- **E** — not better accounted for by another ICHD-3 diagnosis.

**3.3.1 SUNCT** — both conjunctival injection *and* lacrimation.
**3.3.2 SUNA** — only one of those two, or neither.

## §2 The criterion that does *not* match its siblings

Cluster headache and paroxysmal hemicrania both word criterion C as *"either or both of: at
least one autonomic sign, **or** a sense of restlessness or agitation"*. Section 3.3 does
not. **Here an autonomic sign is required and restlessness is no substitute.**

That asymmetry is easy to miss precisely because the three sections sit beside each other and
read almost identically. A tool that carried the 3.1 wording across would grant criterion C
to patients who do not meet it. When restlessness is recorded and no autonomic sign is, the
tile says so rather than failing silently.

## §3 The duration ladder, where the units change

| | Attack duration | Frequency |
|---|---|---|
| **3.3 SUNCT/SUNA** | **1–600 seconds** | ≥1/day |
| 3.2 Paroxysmal hemicrania | 2–30 minutes | >5/day |
| 3.1 Cluster headache | 15–180 minutes | ≤8/day |

Ten minutes is the ceiling here, and one second is the floor. When an entered duration
overshoots it, the tile names the two diagnoses whose windows it would fall in instead.

## §4 The subtype is a pair of signs, not a severity

SUNCT requires **both** conjunctival injection and tearing. One of them, or neither, is SUNA.

This is not a gradient. A patient with florid tearing and no conjunctival injection is
**SUNA**, not a mild SUNCT — so the two signs get their own heading in the form, apart from
the other five, and when exactly one is present the tile says why that makes it SUNA.

## §5 Sourcing (spec-v97 gate)

- Headache Classification Committee of the International Headache Society (IHS). *The
  International Classification of Headache Disorders, 3rd edition.* Cephalalgia.
  2018;38(1):1-211 — section 3.3 and the 3.3.1 subsection, read from the Society's free full
  text.
- The 3.3.2 SUNA page would not render its criteria block; its defining criterion (only one
  or neither of conjunctival injection and lacrimation) was confirmed independently before
  being encoded.

## §6 Posture

Decision support, not a verdict. It applies published criteria to a history already taken.
It does not start lamotrigine or arrange imaging.

Catalog 1611 → 1612.
