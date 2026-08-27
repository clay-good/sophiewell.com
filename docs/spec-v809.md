# spec-v809 — Forrest Classification (Bleeding Peptic Ulcer)

## What this gives you

Pick what the endoscopist sees at the base of a bleeding peptic ulcer and get back the
Forrest class, its rebleeding risk, and whether endoscopic hemostasis is indicated.

The catalog already scores upper GI bleeding three ways — `gbs` before endoscopy, `rockall`
and `aims65` for outcome. What it did not have is the endoscopic finding those scores are
partly built on. Rockall awards points for exactly these stigmata; until now a reader could
compute Rockall on this site without any tool here telling them what "visible vessel" means
or what it implies.

**The reason this is worth a tile rather than a wall chart: the classes are not an ordered
ladder.** A non-bleeding visible vessel (IIa) rebleeds more often than an oozing ulcer (Ib)
— roughly 43–50% against 10–27% untreated. Ranked by roman numeral, the risk comes out
backwards. The tile states that in the result, not just in the citation.

## §1 The classification

| Class | Finding | Risk | Rebleeding, untreated | Endoscopic therapy |
|---|---|---|---|---|
| Ia | Spurting arterial bleeding | High | ~55–60% | Indicated |
| Ib | Oozing, no visible vessel | High | ~10–27% | Indicated |
| IIa | Non-bleeding visible vessel | High | ~43–50% | Indicated |
| IIb | Adherent clot, resists washing | Intermediate | ~22–33% | **Equivocal** |
| IIc | Flat pigmented spot | Low | ~7–10% | Not indicated |
| III | Clean ulcer base | Low | <~5% | Not indicated |

Two deliberate choices:

- **The rebleeding figures are ranges.** Published untreated rates for the same class differ
  substantially between series. The tile reports the span rather than picking one study's
  number and presenting it as *the* rate.
- **IIb returns "equivocal", not a recommendation.** Trials of endoscopic therapy for an
  adherent clot reach conflicting conclusions and the 2021 ACG guideline does not come down
  either way. That is the finding. Rounding it to "treat" or "don't treat" would invent a
  recommendation no source makes.

## §2 Shape

One `select`, six literal options, one class out. The options are written out individually
rather than generated in a loop, because the tool-page builder resolves option *text* only
from literal markup — a loop would leave the pre-rendered pages printing `iia`.

`lib/forrest-classification-v809.js` is pure: no DOM, no clock, no network. Input is
normalized (`IIa`, `ii-a`, `iia` all resolve); anything unrecognized is refused rather than
guessed at.

## §3 Sourcing (spec-v97 gate)

- Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in gastrointestinal bleeding.
  *Lancet.* 1974;2(7877):394-397. — the original stigmata classes.
- Laine L, Barkun AN, Saltzman JR, Martel M, Leontiadis GI. ACG Clinical Guideline: Upper
  Gastrointestinal and Ulcer Bleeding. *Am J Gastroenterol.* 2021;116(5):899-917.
  (PMID 33929377.) — which stigmata get treated, and the adherent-clot equivocation.

Two independent sources agree on the class definitions, on Ia/Ib/IIa as the group that gets
endoscopic therapy, on IIb being unsettled, and on IIc/III being managed with acid
suppression alone.

## §4 Posture

Decision support, not a verdict. The tile describes a finding already made at endoscopy. It
does not perform or withhold hemostasis, and it does not choose between clips, cautery and
injection — beyond carrying the guideline's point that epinephrine should not be used alone.

Catalog 1600 → 1601.
