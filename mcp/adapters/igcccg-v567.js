// spec-v567 MCP wave: adapter for the IGCCCG classification in lib/igcccg-v567.js. The dom keys mirror the
// browser renderer (views/group-v567.js) and META['igcccg'].example.
//
// **SEMINOMA HAS NO POOR-PROGNOSIS CATEGORY, AND THE SIXTH CELL OF THE GRID DOES NOT EXIST.** The source
// states outright that no patients with seminoma are classified as poor prognosis. A three-by-two table
// invites filling in the missing cell, and letting a seminoma fall through to "poor" would invent a
// category the classification refuses to contain. The tool caps seminoma at intermediate and returns
// `poorCategoryExists: false`.
//
// **THE TABLE MIXES ALL-OF AND ANY-OF IN ONE CLASSIFICATION.** Good prognosis requires EVERY criterion
// (AND); intermediate and poor are triggered by ANY ONE marker criterion (OR). Reading the whole table in a
// single direction misclassifies both ways.
//
// **SEMINOMA IGNORES hCG AND LDH ENTIRELY, AND ITS AFP FIELD IS A GATE, NOT A GRADED MARKER.** A raised AFP
// does not make a seminoma higher-risk: by definition the tumor is then a NONSEMINOMA. The tool returns
// `reclassifyAsNonseminoma: true` rather than a seminoma group.
//
// **LDH IS A MULTIPLE OF THE LOCAL UPPER LIMIT OF NORMAL**, not an absolute value - a raw LDH in U/L cannot
// be classified without the laboratory's own reference limit.
//
// **hCG IS IN IU/L.** A widely used secondary source prints IU/mL in two rows while quoting the same
// numbers; that is a typo, and reading it as IU/mL is wrong by a factor of one thousand.
//
// **MARKERS MUST BE POST-ORCHIECTOMY AND PRE-CHEMOTHERAPY.** A dedicated study exists showing that
// pre-orchiectomy markers mis-assign the risk group, because markers fall once the primary is removed.
//
// TWO VINTAGES OF SURVIVAL FIGURES, SAME DEFINITIONS. The 1997 original and the 2021 update classify
// patients identically and differ only in outcomes - poor-risk nonseminoma moved from 48 to 71 percent - so
// the tool returns BOTH, labeled, rather than picking one.

import * as I from '../../lib/igcccg-v567.js';

export default [
  {
    id: 'igcccg',
    summary: `The International Germ Cell Consensus Classification (IGCCCG 1997) for METASTATIC germ cell cancer. NONSEMINOMA: GOOD prognosis requires a testis or retroperitoneal primary AND no nonpulmonary visceral metastases AND ALL of AFP below ${I.AFP_INTERMEDIATE} ng/mL, hCG below ${I.HCG_INTERMEDIATE} IU/L, and LDH below ${I.LDH_INTERMEDIATE} times the upper limit of normal. INTERMEDIATE is the same primary and metastasis picture with ANY ONE of AFP ${I.AFP_INTERMEDIATE} to ${I.AFP_POOR}, hCG ${I.HCG_INTERMEDIATE} to ${I.HCG_POOR}, or LDH at least ${I.LDH_INTERMEDIATE} and under ${I.LDH_POOR} times normal. POOR is a mediastinal primary, OR nonpulmonary visceral metastases, OR ANY ONE of AFP above ${I.AFP_POOR}, hCG above ${I.HCG_POOR}, or LDH at or above ${I.LDH_POOR} times normal. SEMINOMA: ANY primary site is permitted, AFP must be NORMAL, and hCG and LDH are IGNORED ENTIRELY; good prognosis is the absence of nonpulmonary visceral metastases and intermediate is their presence. **SEMINOMA HAS NO POOR-PROGNOSIS CATEGORY AT ALL** - the classification states that no patients with seminoma are classified as poor prognosis, so the sixth cell of the grid does not exist and a seminoma must NEVER fall through to poor. **THE TABLE MIXES ALL-OF AND ANY-OF**: good prognosis requires EVERY criterion to be met while intermediate and poor are triggered by ANY ONE marker criterion, and reading the whole table in one direction misclassifies in both directions. **IN SEMINOMA THE AFP IS A GATE, NOT A GRADED MARKER**: a raised AFP does not make a seminoma higher-risk, it means the tumor is by definition a NONSEMINOMA, and the tool returns reclassifyAsNonseminoma rather than a seminoma group. **LDH IS A MULTIPLE OF THE LOCAL UPPER LIMIT OF NORMAL**, not an absolute value, so a raw LDH in units per litre cannot be classified without the laboratory reference limit. **hCG THRESHOLDS ARE IN IU/L**: a widely used secondary source prints IU/mL in two rows while quoting the same numbers, which is a typographic error, and reading it as IU/mL would be wrong by a factor of one thousand. **MARKERS MUST BE POST-ORCHIECTOMY AND PRE-CHEMOTHERAPY**, since a dedicated study showed pre-orchiectomy values mis-assign the risk group. SURVIVAL COMES IN TWO VINTAGES WITH IDENTICAL GROUP DEFINITIONS: the 1997 original gives nonseminoma 92 / 80 / 48 percent and the 2021 update gives 92-94 / 80-83 / 71 percent, the poor-risk figure having changed most; seminoma is 86 and 72 percent in both. The tool returns both, labeled, rather than picking one. This assigns a PROGNOSTIC GROUP for METASTATIC disease, and the groups map onto very different chemotherapy intensities in practice. It does NOT diagnose germ cell cancer, does NOT establish that disease is metastatic, and does NOT distinguish seminoma from nonseminoma, which is a pathologic and serologic determination taken here as an input. It does not select a regimen or a number of cycles, and it does not apply to stage I disease, to relapsed or refractory disease, or to non-germ-cell tumors.`,
    compute: I.igcccg,
    fields: [
      {
        dom: 'igcccg-histology', arg: 'histology', kind: 'enum',
        values: I.HISTOLOGIES.map((h) => h.value), required: true,
        label: `Histology. Gates everything else: seminoma ignores hCG and LDH and has no poor category [${I.HISTOLOGIES.map((h) => `${h.value} = ${h.text}`).join('; ')}]`,
      },
      {
        dom: 'igcccg-npvm', arg: 'nonpulmonaryVisceralMets', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Nonpulmonary visceral metastases. PULMONARY metastases do NOT count for this criterion. In nonseminoma this alone is poor prognosis; in seminoma it alone makes the group intermediate.',
      },
      {
        dom: 'igcccg-primary', arg: 'primarySite', kind: 'enum',
        values: I.PRIMARY_SITES.map((p) => p.value), required: false,
        label: 'NONSEMINOMA ONLY. Primary site; a mediastinal primary is poor prognosis on its own. Seminoma permits ANY primary site, so this is not used for seminoma.',
      },
      {
        dom: 'igcccg-afp', arg: 'afp', kind: 'number', unit: 'ng/mL', required: false,
        label: `NONSEMINOMA ONLY. AFP, post-orchiectomy and pre-chemotherapy. Below ${I.AFP_INTERMEDIATE} good; ${I.AFP_INTERMEDIATE} to ${I.AFP_POOR} intermediate; above ${I.AFP_POOR} poor.`,
      },
      {
        dom: 'igcccg-hcg', arg: 'hcg', kind: 'number', unit: 'IU/L', required: false,
        label: `NONSEMINOMA ONLY. hCG in IU/L, NOT IU/mL, post-orchiectomy and pre-chemotherapy. Below ${I.HCG_INTERMEDIATE} good; ${I.HCG_INTERMEDIATE} to ${I.HCG_POOR} intermediate; above ${I.HCG_POOR} poor.`,
      },
      {
        dom: 'igcccg-ldh', arg: 'ldhMultiple', kind: 'number', unit: 'x upper limit of normal', required: false,
        label: `NONSEMINOMA ONLY. LDH as a MULTIPLE of the local upper limit of normal, not an absolute value. Below ${I.LDH_INTERMEDIATE} good; ${I.LDH_INTERMEDIATE} to under ${I.LDH_POOR} intermediate; ${I.LDH_POOR} or above poor.`,
      },
      {
        dom: 'igcccg-afp-normal', arg: 'afpNormal', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'SEMINOMA ONLY. Whether the AFP is normal. This is a GATE, not a graded marker: a raised AFP means the tumor must be classified as a nonseminoma.',
      },
    ],
  },
];
