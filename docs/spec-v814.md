# spec-v814 — ICHD-3 Criteria (Cluster Headache)

## What this gives you

Enter the attack history; get a met / not-met answer against ICHD-3 section 3.1, and the
episodic or chronic subtype when the bout pattern is known.

The headache cluster here was screeners only — `midas`, `pound-migraine`, `id-migraine`,
all pointed at migraine. Nothing applied a diagnostic criteria set, and cluster headache is
the headache where getting the diagnosis right changes the treatment most sharply.

## §1 The criteria

- **A** — at least 5 attacks fulfilling B–D.
- **B** — severe or very severe unilateral orbital, supraorbital and/or temporal pain
  lasting **15–180 minutes** untreated.
- **C** — *either or both*: at least one **ipsilateral** cranial autonomic sign, **or** a
  sense of restlessness or agitation.
- **D** — frequency between **one every other day and 8 per day**.
- **E** — not better accounted for by another ICHD-3 diagnosis.

Autonomic signs: conjunctival injection and/or tearing; nasal congestion and/or runny nose;
eyelid swelling; forehead and facial sweating; small pupil and/or drooping eyelid.

**3.1.1 Episodic** — ≥2 cluster periods of 7 days to 1 year, separated by pain-free
remissions ≥3 months. **3.1.2 Chronic** — no remission, or remissions <3 months, for ≥1 year.

## §2 The two misreadings it is built to catch

**Criterion C does not require an autonomic sign.** It reads *"either or both"*. A patient
who paces the floor with no lacrimation, no ptosis and no congestion still meets C. A tool
that demanded an autonomic symptom would rule out cluster headache in patients who have it.
When C is carried by restlessness alone, the tile says so explicitly rather than silently
passing. And by the other route, **one** sign suffices — not several.

**Criterion D is a window with a floor, not a severity threshold.** Attacks less often than
one every other day fail it exactly as ten a day do. "Too few" reads like a milder case and
is a failure all the same, so when the frequency misses, the tile says *which side* it
missed on.

Both have unit tests, as do the inclusive bounds (15 and 180 minutes; 0.5 and 8 per day).

## §3 The subtype is withheld until the diagnosis is made

`remissionPattern` is accepted at any time but only resolves to 3.1.1 or 3.1.2 once A–E are
met. Offering "chronic cluster headache" for a history that does not meet the criteria would
name a diagnosis nothing established. Tested.

## §4 Sourcing (spec-v97 gate)

- Headache Classification Committee of the International Headache Society (IHS). *The
  International Classification of Headache Disorders, 3rd edition.* Cephalalgia.
  2018;38(1):1-211 — section 3.1, taken from the Society's own free full text at
  ichd-3.org, including the 3.1.1 and 3.1.2 subpages.
- Independently corroborated on every threshold: ≥5 attacks, 15–180 minutes, the "either or
  both" wording of C, and the one-every-other-day-to-8-per-day window.

Source wording is British (*rhinorrhoea*, *oedema*); the tile's copy is American, as the
house style requires. Quoting a source is not a licence to carry its spelling.

## §5 Posture

Decision support, not a verdict. It applies published criteria to a history already taken.
It does not prescribe oxygen, a triptan or a preventive.

Catalog 1605 → 1606.
