# spec-v823 — 2015 Criteria (Neuromyelitis Optica Spectrum)

## What this gives you

Enter the antibody status, the core clinical characteristics and the MRI findings; get
whether the 2015 international consensus criteria are met, on the rule the antibody selects.

## §1 Two rules, not one

**With AQP4-IgG** — at least **one** core clinical characteristic, a positive test by the
best available method, and exclusion of alternative diagnoses.

**Without AQP4-IgG, or with unknown status** — at least **two different** core
characteristics, of which at least one must be optic neuritis, acute myelitis *with a
longitudinally extensive lesion*, or area postrema syndrome; the additional MRI requirement
satisfied for each characteristic that carries one; and exclusion of alternative diagnoses.

The six core characteristics: optic neuritis; acute myelitis; area postrema syndrome; acute
brainstem syndrome; symptomatic narcolepsy or acute diencephalic syndrome with NMOSD-typical
lesions; symptomatic cerebral syndrome with NMOSD-typical lesions.

## §2 The asymmetry is the point

A single episode of longitudinally extensive transverse myelitis in a seropositive patient
**is** NMOSD. The identical presentation in a seronegative patient **is not** — the
seronegative rule needs two different core characteristics.

A tool applying one rule to both would diagnose NMOSD in seronegative patients on evidence
the consensus panel deliberately judged insufficient. And this is a diagnosis where being
wrong runs both ways: several multiple-sclerosis disease-modifying therapies make NMOSD
worse, so over- and under-diagnosis each carry harm.

So the antibody is a three-way select sitting first in the form — it chooses the rule, not
just one tick — and when only one core characteristic is present the tile says explicitly
that it would have sufficed with a positive antibody and does not without one.

**Unknown counts as negative.** An untested or still-pending AQP4-IgG follows the
seronegative rule, and that is the default when no status is supplied. Tested.

## §3 Two further places the seronegative rule is stricter than it looks

**Myelitis qualifies only when longitudinally extensive.** Short-segment myelitis is still a
core characteristic and still counts toward the two, but it cannot be the *qualifying* one.
Two core characteristics where neither qualifies does not meet the criteria, and the tile
names that rather than returning a bare fail.

**The MRI requirement applies per characteristic, not once.** Each of optic neuritis,
myelitis, area postrema syndrome and brainstem syndrome carries its own, and every one
present must have its own satisfied. Those requirements belong to the seronegative arm only
and are not demanded on the seropositive one — also tested, since demanding them there would
be a different way of collapsing the two rules into one.

## §4 Sourcing (spec-v97 gate)

- Wingerchuk DM, Banwell B, Bennett JL, et al. International consensus diagnostic criteria
  for neuromyelitis optica spectrum disorders. *Neurology.* 2015;85(2):177-189.
- Both arms, the six core characteristics and the four MRI requirements were corroborated
  across two independent sources before encoding.

## §5 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not start or stop immunotherapy.

Catalog 1614 → 1615.
