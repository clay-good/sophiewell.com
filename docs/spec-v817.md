# spec-v817 — ICHD-3 Criteria (Trigeminal Neuralgia)

## What this gives you

Tick the pain history; get a met / not-met answer against ICHD-3 section 13.1.

Trigeminal neuralgia was a zero-hit word in this catalog — the fourth headache-family gap
this run, after cluster headache, migraine and medication overuse.

## §1 The criteria

- **A** — recurrent paroxysms of **unilateral** facial pain in one or more trigeminal
  divisions, **with no radiation beyond**, fulfilling B and C.
- **B** — pain has **all three**: lasting a fraction of a second to 2 minutes; severe
  intensity; electric shock-like, shooting, stabbing or sharp.
- **C** — **precipitated by innocuous stimuli** within the affected distribution.
- **D** — not better accounted for by another ICHD-3 diagnosis.

## §2 The two errors, which have the same root

Both come from reading this like the migraine criteria.

**Criterion B is *all three*, not *at least two*.** ICHD-3 uses "at least two of four" in 1.1
Migraine without aura and "all of the following" here — same book, same structure on the
page, different rule. Two of three is not trigeminal neuralgia. The section heading in the
form says "all three are required", and when only some are ticked the tile names the ones
still missing rather than returning a bare fail.

**The trigger in criterion C is mandatory.** ICHD-3 is explicit: attacks may be, or appear,
spontaneous, *but there must be a history or finding of pain provoked by innocuous stimuli*.
Purely spontaneous paroxysmal facial pain does not meet 13.1 however textbook everything
else looks — and that is precisely the case where a tool that treated the trigger as
optional would wave it through. When the trigger is the only thing standing in the way, the
tile says so by name; when the pain characteristics are also incomplete it stays quiet,
because then the trigger is not the story. Both behaviors are tested.

## §3 What this deliberately does not claim

ICHD-3 subclassifies trigeminal neuralgia by cause — classical, secondary, idiopathic — and
by whether there is concomitant continuous pain.

**Those are not computed here.** The distinctions turn on MRI findings and on an underlying
disease, neither of which is a history item this tile takes; and the publisher's own
subsection hierarchy for them is presented inconsistently, with MS-attributed trigeminal
neuralgia nested under *classical* where it belongs to *secondary*. Guessing a hierarchy
whose source contradicts itself would be worse than not offering one. A test asserts the
result carries no etiologic label.

## §4 Sourcing (spec-v97 gate)

- Headache Classification Committee of the International Headache Society (IHS). *The
  International Classification of Headache Disorders, 3rd edition.* Cephalalgia.
  2018;38(1):1-211 — section 13.1, taken verbatim from the Society's own free full text,
  including the notes that make criterion C mandatory.

## §5 Posture

Decision support, not a verdict. It applies criteria to a history already taken. It does not
start carbamazepine or refer for a procedure.

Catalog 1608 → 1609.
