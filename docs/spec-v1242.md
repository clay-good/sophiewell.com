# spec-v1242 — The same artery, described twice

[spec-v1241](spec-v1241.md) built four classifications that each sat beside one already in the
catalog. This is the vascular half of the same idea, and it is the sharpest case of it: three of
these four describe an artery the catalog *already* describes, by a different method, and get a
different answer.

| new tile | its neighbor here | what the reader can get wrong |
| --- | --- | --- |
| `stanford-dissection` | `debakey` | "type B" read as "descending only" |
| `ecst-carotid` | `nascet-carotid-stenosis` | "70% stenosis" is not one finding |
| `rutherford-ali` | `rutherford-fontaine` | "Rutherford 3" is two different limbs |
| `endoleak-type` | — | the numeral read as a rank |

## Stanford: type B does not mean descending only

Stanford asks one question — is the ascending aorta involved? — and everything else about the
dissection is outside the letter. A dissection **involving the arch and sparing the ascending aorta
is a type B**, and a reader who learned type B as "the descending one" is picturing an aorta that is
not the one in front of them. The tile prints the arch involvement separately from the letter, and
prints that sentence only when that is the case.

For a type B it also reports the SVS/STS split — complicated, high-risk uncomplicated, uncomplicated
— because that split, not the letter, is what the management turns on. "Uncomplicated" is worded as
*none of the listed findings was recorded*, which is not a claim that they were looked for.

An empty form is refused. Nothing ticked is not a type B; it is a study that has not said where the
dissection is, and type B is the more reassuring of the two letters to invent.

DeBakey is reported only when the segments entered determine one. DeBakey turns on where the
dissection *starts*, which is a separate observation, so the mapping runs one way: DeBakey I and II
are Stanford A, DeBakey III is Stanford B, and not the reverse.

## ECST: one artery, two numbers, and neither is wrong

Both methods divide the narrowest residual lumen by a denominator, and they pick different ones:

- **NASCET** — the distal internal carotid, beyond the bulb, where the walls are parallel.
- **ECST** — the *estimated original* diameter at the narrowing, a diameter that no longer exists.

ECST's denominator is the larger, so ECST always reads higher, and the gap is not small. On
Rothwell's regression over 1001 angiograms, `ECST = 0.6 × NASCET + 40` — which makes **ECST 70% the
same artery as NASCET 50%**. A trial threshold, a guideline, a referral letter and a radiology report
may each mean a different artery by "70%", and nothing in the number says which produced it.

The tile computes both from one set of measurements and prints the conversion both ways. Two
refusals and a flag:

- A residual lumen wider than the distal ICA is a **negative** NASCET stenosis — a transcription
  error, and arithmetic has no opinion about it ([spec-v1225](spec-v1225.md)).
- A residual lumen wider than the "original" diameter is the same error on the other denominator.
- Denominators the wrong way round (bulb smaller than the distal ICA) still compute, and are flagged
  rather than silently reported.

## Rutherford: the venous signal is the whole answer

IIb and III look alike at the bedside — both have sensory loss and weakness — and they are managed in
**opposite directions**: IIb is a limb to revascularize immediately, III is one where revascularizing
is the wrong operation. What separates them in the published table is whether the **venous** Doppler
signal is audible, which is also the finding most easily left unrecorded, because the arterial signal
is the one everyone reaches for.

So all four findings are required, a blank is not an audible signal, and when an inaudible venous
signal carries the answer past a milder examination the tile says which finding did it and asks for
it to be confirmed.

And it names the other Rutherford. The catalog's `rutherford-fontaine` is the **chronic** category,
0-6, over months; this is I-III over hours. They share an author, a journal and a limb.

## Endoleak: the numbering is not a ladder

Types I and III put systemic pressure straight into the sac; type II is retrograde branch flow and is
usually watched; type IV belongs to the first weeks. **The low-pressure type sits between the two
urgent ones**, so reading I-to-V as a rank of urgency gets the order wrong. The pressure class is
printed beside the numeral.

The tile asks for the *finding* and derives the type, because the classification is about the
mechanism and the mechanism is what the reader has. A type V gets one extra sentence: it is a
diagnosis of exclusion, and a growing sac with no leak seen is often a leak that has not been seen
yet — the finding is that nothing was demonstrated, not that nothing is there.

## On finding these four

The gap scan that found them ran on **single tokens against tile names and detail**, not phrases. The
same scan run with phrases reported Mason, Neer, Hawkins and Sanders as missing; all four have
shipped for months under names like "Mason-Johnston Radial Head Fracture Classification". A phrase
scan produces false gaps at exactly the rate the catalog is well named
([spec-v1062](spec-v1062.md)'s lesson, from the other side).

## Sources

Every citation fetched from NCBI eutils and checked against the sentence written for it.

- Daily PO, et al. Management of acute aortic dissections. *Ann Thorac Surg.* 1970;10(3):237-247. PMID 5458238.
- Lombardi JV, et al. SVS/STS reporting standards for type B aortic dissection. *J Vasc Surg.* 2020;71(3):723-747. PMID 32001058.
- European Carotid Surgery Trialists' Collaborative Group. MRC European Carotid Surgery Trial: interim results. *Lancet.* 1991;337(8752):1235-1243. PMID 1674060.
- Rothwell PM, et al. Equivalence of measurements of carotid stenosis. *Stroke.* 1994;25(12):2435-2439. PMID 7974586.
- White GH, et al. Type III and type IV endoleak. *J Endovasc Surg.* 1998;5(4):305-309. PMID 9867318.
- Rutherford RB, et al. Recommended standards for reports dealing with lower extremity ischemia: revised version. *J Vasc Surg.* 1997;26(3):517-538. PMID 9308598.

Catalog 1,714 → 1,718.
