// spec-v532: the Columbia classification of focal segmental glomerulosclerosis (FSGS). Zero-hit before this
// tile: "fsgs", "dagati", "podocyte", and "collapsing" across corpus.json, app.js, and lib/meta.js. The two
// non-zero probes are false positives read in context: "columbia" is the C-SSRS suicide-severity scale, and
// "perihilar" is the Bismuth-Corlette cholangiocarcinoma tile -- a bile duct, not a glomerulus.
//
// THIS IS NOT A SCORE. It is a decision procedure over five MUTUALLY EXCLUSIVE variants, applied in a fixed
// order of precedence, and the whole value of implementing it is that the order is easy to get wrong by
// hand. The tile therefore takes the FINDINGS and applies the hierarchy, rather than asking the reader to
// name a variant they have already decided on.
//
// THE HIERARCHY, HIGHEST PRECEDENCE FIRST:
//   1 COLLAPSING  at least one glomerulus with segmental or global collapse AND overlying podocyte
//                 hypertrophy and hyperplasia. NO exclusions -- it trumps everything, however much else is
//                 present.
//   2 TIP         at least one segmental lesion in the tip domain (the outer 25 percent of the tuft next to
//                 the origin of the proximal tubule), with the tubular pole identified in the defining
//                 lesion, and with either an adhesion or confluence of podocytes with parietal or tubular
//                 cells. May be cellular or sclerosing.
//   3 CELLULAR    at least one glomerulus with segmental endocapillary hypercellularity occluding lumina,
//                 with or without foam cells and karyorrhexis.
//   4 PERIHILAR   at least one glomerulus with perihilar hyalinosis, with or without sclerosis, AND MORE
//                 THAN 50 PERCENT of the glomeruli bearing segmental lesions show perihilar sclerosis or
//                 hyalinosis.
//   5 NOS         at least one glomerulus with a segmental increase in matrix obliterating the capillary
//                 lumina. A diagnosis of exclusion; may show segmental capillary collapse WITHOUT overlying
//                 podocyte hyperplasia, which is what separates it from the collapsing variant.
//
// **THE TIP VETO IS NOT A RANK COMPARISON, AND THIS IS THE TRAP.** Tip outranks perihilar in the order
// above, yet the tip definition itself says to exclude ANY perihilar sclerosis. So a biopsy with a
// qualifying tip lesion AND perihilar sclerosis anywhere is NOT tip -- it falls through to the next variant
// whose criteria it meets. Implemented as a rank comparison ("tip beats perihilar, so call it tip") this
// gets the wrong answer on exactly the biopsies where the distinction matters. It is encoded here as a hard
// veto and pinned by its own test.
//
// A NOTE ON THE CELLULAR VARIANT: several references add "involving at least 25 percent of the tuft" to the
// cellular definition. That qualifier appears in narrative text rather than in the classification's own
// criteria table, so this tile mentions it as a commonly applied threshold and does NOT enforce it as a
// separate input. Enforcing a criterion the table does not state would make the tile stricter than the
// classification.
//
// HIGH-STAKES: this names a morphologic variant. It does NOT diagnose FSGS, which requires the segmental
// sclerosing lesion in the first place plus exclusion of the many secondary causes -- and the distinction
// between PRIMARY FSGS and a secondary or adaptive FSGS (obesity, reflux, reduced nephron mass, viral, drug)
// is made from clinical context, proteinuria, and electron microscopy showing diffuse foot-process
// effacement, NOT from these five variants. That distinction, not the variant, is what decides whether
// immunosuppression is even considered. The variant carries reported prognostic associations at the group
// level; those are not a prediction for an individual, and this tile attaches no outcome figure to any
// variant. It is not a treatment algorithm (spec-v11 section 5.3). The variants are also scored on the
// tissue sampled, and a tip lesion in particular can be missed on a biopsy with few glomeruli. The
// management decision stays with the clinician.
//
// CRITERIA AND HIERARCHY RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from sources reproducing the
// classification's criteria table and its exclusion columns:
//   - D'Agati VD, Fogo AB, Bruijn JA, Jennette JC. Pathologic classification of focal segmental
//     glomerulosclerosis: a working proposal. Am J Kidney Dis. 2004;43(2):368-382.
//   - Independent reproductions of that table, agreeing on all five inclusion criteria, all four exclusion
//     columns, and the more-than-50-percent perihilar threshold.

export const FSGS_FINDINGS = [
  {
    key: 'collapse',
    text: 'At least one glomerulus with segmental or global collapse AND overlying podocyte hypertrophy and hyperplasia',
    detail: 'Defines the collapsing variant, which takes precedence over every other finding.',
  },
  {
    key: 'tipLesion',
    text: 'At least one segmental lesion in the tip domain, with the tubular pole identified and an adhesion or confluence of podocytes with parietal or tubular cells',
    detail: 'The tip domain is the outer 25 percent of the tuft next to the origin of the proximal tubule. The lesion may be cellular or sclerosing.',
  },
  {
    key: 'anyPerihilarSclerosis',
    text: 'Any perihilar sclerosis anywhere in the biopsy',
    detail: 'This VETOES the tip variant even when a qualifying tip lesion is present. It is not a ranking, it is an exclusion written into the tip definition.',
  },
  {
    key: 'endocapillary',
    text: 'At least one glomerulus with segmental endocapillary hypercellularity occluding lumina, with or without foam cells and karyorrhexis',
    detail: 'Defines the cellular variant. Several references add a threshold of at least 25 percent of the tuft; that qualifier is narrative rather than part of the criteria table, so it is not enforced here.',
  },
  {
    key: 'perihilarMajority',
    text: 'Perihilar hyalinosis or sclerosis in MORE THAN 50 percent of the glomeruli that bear segmental lesions',
    detail: 'Required for the perihilar variant, in addition to at least one glomerulus with perihilar hyalinosis. Strictly more than half, so exactly 50 percent does not qualify.',
  },
  {
    key: 'matrixIncrease',
    text: 'At least one glomerulus with a segmental increase in matrix obliterating the capillary lumina',
    detail: 'Defines the not-otherwise-specified variant, which is a diagnosis of exclusion. May include segmental capillary collapse WITHOUT overlying podocyte hyperplasia.',
  },
];

const VARIANTS = {
  collapsing: {
    name: 'Collapsing',
    text: 'Segmental or global collapse with overlying podocyte hypertrophy and hyperplasia.',
    why: 'The collapsing variant has no exclusions and takes precedence over every other finding present.',
  },
  tip: {
    name: 'Tip',
    text: 'A segmental lesion involving the tip domain, with the tubular pole identified.',
    why: 'Collapsing features are absent and there is no perihilar sclerosis anywhere, so the tip definition is not vetoed.',
  },
  cellular: {
    name: 'Cellular',
    text: 'Segmental endocapillary hypercellularity occluding lumina.',
    why: 'Collapsing and tip are excluded.',
  },
  perihilar: {
    name: 'Perihilar',
    text: 'Perihilar hyalinosis with or without sclerosis, in more than half the glomeruli bearing segmental lesions.',
    why: 'Collapsing, tip, and cellular are excluded.',
  },
  nos: {
    name: 'Not otherwise specified (NOS)',
    text: 'A segmental increase in matrix obliterating the capillary lumina.',
    why: 'A diagnosis of exclusion: none of the other four variants applies.',
  },
};

const NOTE = 'The Columbia classification (D’Agati and colleagues 2004) sorts focal segmental glomerulosclerosis into five mutually exclusive variants applied in a fixed order: collapsing, tip, cellular, perihilar, and not otherwise specified. Collapsing has no exclusions and takes precedence over everything else. The tip variant carries a veto rather than a ranking: a qualifying tip lesion is excluded by ANY perihilar sclerosis in the biopsy, so a biopsy with both is not tip and falls through to the next variant it meets. Cellular requires that tip and collapsing be excluded, perihilar additionally requires more than half the glomeruli bearing segmental lesions to show perihilar sclerosis or hyalinosis, and NOS is the diagnosis of exclusion, distinguished from collapsing by segmental collapse WITHOUT overlying podocyte hyperplasia. Several references add a threshold of at least 25 percent of the tuft to the cellular definition; that qualifier is narrative rather than part of the criteria table, so it is not enforced here. This names a morphologic variant. It does not diagnose FSGS, and it does not distinguish primary FSGS from a secondary or adaptive form arising from obesity, reflux, reduced nephron mass, a virus, or a drug: that distinction is made from clinical context, the degree of proteinuria, and electron microscopy showing diffuse foot-process effacement, and it is what decides whether immunosuppression is even considered, not the variant. The variants carry reported prognostic associations at the group level, which are not a prediction for an individual, so no outcome figure is attached to any variant here. The variants are scored on the tissue sampled, and a tip lesion in particular can be missed on a biopsy with few glomeruli.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: one yes/no per entry in FSGS_FINDINGS.
export function columbiaFsgs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = FSGS_FINDINGS.map((f) => ({ f, v: readBool(o[f.key]) }));
  const missing = read.filter((r) => r.v === null);
  if (missing.length) {
    return { valid: false, message: `Answer every finding. Still needed: ${missing.map((r) => r.f.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v));
  if (bad.length) {
    return { valid: false, message: `Each finding must be yes or no. Unrecognized: ${bad.map((r) => r.f.key).join(', ')}.` };
  }
  const v = Object.fromEntries(read.map((r) => [r.f.key, r.v]));

  // The hierarchy. Order matters, and the tip step is a veto, not a comparison.
  let key = null;
  const tipVetoed = v.tipLesion && v.anyPerihilarSclerosis;
  if (v.collapse) key = 'collapsing';
  else if (v.tipLesion && !v.anyPerihilarSclerosis) key = 'tip';
  else if (v.endocapillary) key = 'cellular';
  else if (v.perihilarMajority) key = 'perihilar';
  else if (v.matrixIncrease) key = 'nos';

  if (!key) {
    return {
      valid: true,
      variant: null,
      variantName: null,
      tipVetoed,
      bandLabel: 'No Columbia variant criteria met',
      band: 'None of the five variants’ defining lesions is present. The Columbia classification sorts a biopsy that already shows focal segmental glomerulosclerosis; if no defining lesion is present, there is nothing here to classify.',
      note: NOTE,
    };
  }

  const entry = VARIANTS[key];
  const vetoNote = tipVetoed
    ? ' A qualifying tip lesion is present but is vetoed by perihilar sclerosis elsewhere in the biopsy, so this is not the tip variant.'
    : '';

  return {
    valid: true,
    variant: key,
    variantName: entry.name,
    tipVetoed,
    bandLabel: `Columbia ${entry.name} variant`,
    band: `${entry.name} variant. ${entry.text} ${entry.why}${vetoNote} This names a morphologic variant; it does not diagnose FSGS and does not distinguish primary from secondary disease.`,
    note: NOTE,
  };
}
