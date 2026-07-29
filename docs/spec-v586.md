# spec-v586 — Up-to-seven criteria (HCC liver transplant, Metroticket)

## What this gives you

Whether a patient with hepatocellular carcinoma is within the up-to-seven criteria, alongside their Milan
status from the same inputs — and an explicit statement of the condition the criterion depends on that
nobody can measure before transplant.

## Why it exists

The catalog documented this gap against itself. `milan-criteria` has shipped since spec-v93, and its own note
says the criterion it reports "is not a listing decision (MELD allocation, downstaging, **UCSF/extended
criteria** and center policy all apply)". Those extended criteria were not in the catalog.

## The rule

**Largest tumor diameter in cm + number of tumors ≤ 7**, with no gross vascular invasion and no extrahepatic
spread. Reported 5-year survival within: **71.2%**.

## The three things worth knowing

**The criterion depends on something unmeasurable at decision time.** It applies "in the absence of
microvascular invasion" — and microvascular invasion **cannot be assessed before transplant**. Imaging shows
only *gross* vascular invasion; biopsy cannot exclude it because of sampling bias. The published survival
describes patients who turned out *on the explant* not to have had it. The tile asks only what is knowable
and refuses to treat "no microvascular invasion" as a satisfied input.

**"Seven" adds centimeters to a count.** It is an exchange rate between size and number, not a limit on
either:

| Tumors | Largest | Sum | |
|---|---|---|---|
| 1 | 6 cm | 7 | within |
| 4 | 3 cm | 7 | within |
| 1 | 6.5 cm | 7.5 | beyond |

**Only the largest tumor's size counts.** Every other tumor contributes 1 by being counted, however large.
Three tumors of 4.9/4.8/4.7 cm score identically to three of 4.9/0.5/0.5 cm. Total tumor burden is not what
this measures — the tile does not accept the other diameters.

## Milan is fully contained within up-to-seven

Every Milan-eligible patient satisfies up-to-seven (a single 5 cm tumor gives 6; three 3 cm tumors give 6),
so up-to-seven can only **add** candidates. The containment is asserted **by enumeration** over every
Milan-eligible size-and-count combination, not by claim.

## UCSF is deliberately not computed (spec-v97)

Its published renderings diverge on whether the nodule limit is two or three, and on whether the size
thresholds are strict or inclusive. A divergent cell is reported, not guessed.

## Scope (spec-v11 §5.3)

Reports a criterion, **not** a listing decision. Candidacy also depends on MELD allocation and exception
points, on response to downstaging or bridging therapy, on organ availability and on center policy. It does
not stage HCC, does not read imaging, and does not choose between transplantation, resection, ablation and
locoregional therapy.

## Source

- Mazzaferro V, Llovet JM, Miceli R, et al. *Lancet Oncol.* 2009;10(1):35-43.

## Files

`lib/up-to-seven-v586.js`, `views/group-v586.js`, `mcp/adapters/up-to-seven-v586.js` (wave 411),
`test/unit/up-to-seven.test.js`. Catalog 1435 → 1436; MCP 1372 → 1373.
