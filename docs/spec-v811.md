# spec-v811 — Gold Coast Criteria (ALS diagnosis, 2020)

## What this gives you

Mark the motor findings region by region and get a met / not-met answer against the 2020
Gold Coast criteria for ALS.

`alsfrs-r` has been here for a long time — it measures how far ALS has progressed. Nothing
here answered the question that comes first. This is the plain axis gap: severity present,
diagnosis absent.

## §1 The rule

All three are required:

1. **Progressive motor impairment**, documented by history or repeated clinical assessment,
   preceded by normal motor function.
2. **Either** upper- *and* lower-motor-neuron dysfunction in at least one body region, *with
   both in that same region*, **or** lower-motor-neuron dysfunction in at least two body
   regions.
3. **Investigations excluding other diseases.**

Body regions: bulbar, cervical, thoracic, lumbosacral.

## §2 Why the inputs are per-region and not two counts

Requirement 2 is region-bound on both limbs, and that is easy to lose.

Upper-motor-neuron signs in the bulbar region with lower-motor-neuron signs in the
lumbosacral region satisfy **neither** limb — the first needs the two findings *together* in
one region, the second needs LMN in *two*. A tool that tracked "how many UMN regions" and
"how many LMN regions" separately would report that patient as meeting the criteria.

So the tile takes eight checkboxes rather than two counts, and when it sees exactly that
near-miss it says so by name instead of returning a bare "not met". A unit test pins it.

## §3 There are no certainty categories

Gold Coast **abolished** definite / probable / possible ALS. Those belonged to the revised
El Escorial and Awaji frameworks, and the consortium dropped them on the grounds that they
increased uncertainty for patients and clinicians and cost sensitivity. A multicentre
comparison: Gold Coast **92%**, revised El Escorial **88.6%**, Awaji **90.3%**.

The answer here is met or not met. A test asserts the result carries no certainty label, so
the older framework cannot leak back in.

## §4 Sourcing (spec-v97 gate)

- Shefner JM, Al-Chalabi A, Baker MR, et al. A proposal for new diagnostic criteria for ALS.
  *Clin Neurophysiol.* 2020;131(8):1975-1978. — the criteria, from the 2019 Gold Coast
  consortium of the IFCN and WFN.
- Recent developments in consensus diagnostic criteria for ALS (PMC11840527) — independently
  reproduces the three requirements verbatim, confirms the categories were abolished, and
  gives the sensitivity comparison.

Two independent sources agree on the wording of all three requirements.

## §5 Posture

Decision support, not a verdict. It applies criteria to findings already gathered. It does
not make the diagnosis and it does not order the investigations that requirement 3 depends
on — which is the requirement doing most of the work.

Catalog 1602 → 1603.
