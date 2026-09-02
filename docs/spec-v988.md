# spec-v988 — Seven tiles whose source was reachable all along

## The finding

`data/citation-url-backlog.json` is the frozen, shrink-only list of tiles that name a dated
source but give the reader no way to reach it. It held **19**. Seven of those nineteen cite a
paper that PubMed indexes today:

| Tile | Paper the citation names | PMID |
| --- | --- | --- |
| `pbw-ardsnet` | ARDS Network. N Engl J Med. 2000;342:1301-8 | 10793162 |
| `mtp-tracker` | Holcomb (PROPPR). JAMA. 2015;313(5):471-82 | 25647203 |
| `vip-extravasation` | Jackson A. Nurs Times. 1998;94(4):68-71 | 9510815 |
| `field-triage` | Newgard. J Trauma Acute Care Surg. 2022;93(2):e49-e60 | 35475939 |
| `bsa`, `bw-bsa-suite` | Mosteller RD. N Engl J Med. 1987;317(17):1098 | 3657876 |
| `bsa`, `bw-bsa-suite` | Du Bois 1916, reprinted Nutrition. 1989;5(5):303-11 | 2520314 |
| `qtc` | Fridericia 1920, reprinted Ann Noninvasive Electrocardiol. 2003;8(4):343-51 | 14516292 |
| `qtc` | Sagie (Framingham). Am J Cardiol. 1992;70:797-801 | 1519533 |

Backlog **19 → 12**; tiles that link straight through to their source **1,620 → 1,627**.

## The part that was not bookkeeping

Four of the seven links passed `check-citation-links` — the paper is there — and **failed
`check-citation-agreement`**, which asks the second question: does the link open the paper the
citation *names*? It was right to fail all four, and each failure was a defect in the citation
string rather than in the link:

- **`bsa`, `bw-bsa-suite`, `qtc`.** Three of these sources are pre-PubMed (Du Bois 1916,
  Fridericia 1920). What MEDLINE carries is a **later verbatim reprint**, and a reader who
  clicked "Du Bois 1916" would have landed on a 1989 *Nutrition* record. The fix is not to
  suppress the link but to **say what the link opens**: each citation now names the reprint and
  its year and pages beside the original.
- **`field-triage`.** The citation was written corporate-style — "American College of Surgeons
  Committee on Trauma. National Guideline for the Field Triage of Injured Patients. 2021." — with
  no author, journal or pages, so nothing in it matched the record. The guideline *was* published
  as a peer-reviewed paper. The citation now leads with that paper and keeps the ACS stewardship
  and MMWR-supersession note in parentheses.

The general rule this makes explicit, and the reason a reprint is not a shortcut: **a link is
allowed to open a different printing of a paper, but only if the citation says so.** Anything
else asks the reader to reconcile a 1916 citation with a 1989 record on their own.

## The twelve that remain, and why

`blood-compat`, `cao2-do2`, `cci-platelet`, `corrected-phenytoin`, `ecmo-titration`, `em-time`,
`lab-interpret`, `minute-ventilation`, `norton-push`, `o2-cylinder-duration`, `retic-index`,
`start-triage`. Every one cites a **book, a society standard, a proprietary code set or an
unindexed local protocol**: Marino's *ICU Book*, the AABB Technical Manual, Hillman & Finch,
AMA CPT, ELSO guidance, Egan's, the 1983 Newport Beach START protocol. None has a paper behind
it, so none can gain a link without changing what the tile cites.

## Proof

- `node scripts/check-citations.mjs` — clean; "12 dated citations still unlinked" (was 19).
- `node scripts/check-catalog-truth.mjs` — clean; the README's source-link count is gated and
  now reads 1,627.
- `node scripts/check-citation-links.mjs` — every link resolves.
- `node scripts/check-citation-agreement.mjs` — clean, 0 known disagreements, with the four
  failures above fixed rather than waived. `KNOWN_DISAGREEMENTS` stays empty.

## Out of scope

`data/clinical/formulas.json` carries a second, short-form copy of the Du Bois citation. It is a
generated internal register, not a reader-facing link, and re-stamping it would drag dozens of
unrelated `data/**` manifests into this change (see CONTRIBUTING). Left alone deliberately.
