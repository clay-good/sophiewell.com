// spec-v813: WHO diagnostic criteria for systemic mastocytosis.
//
// Sources:
//   Khoury JD, Solary E, Abla O, et al. The 5th edition of the WHO Classification of
//     Haematolymphoid Tumours: Myeloid and Histiocytic/Dendritic Neoplasms. Leukemia.
//     2022;36(7):1703-1719. (The 2022 criteria; CD30 admitted as an aberrant marker and the
//     KIT criterion widened beyond codon 816.)
//   Systemic Mastocytosis and Other Entities Involving Mast Cells: A Practical Review and
//     Update (PMC9322501) - reproduces the major and four minor criteria with thresholds.
//   Valent P, Akin C, Hartmann K, et al. Updated diagnostic criteria and classification of
//     mast cell disorders: a consensus proposal (PMC8659997) - the hereditary
//     alpha-tryptasemia correction.
//
// The rule: ONE MAJOR PLUS ONE MINOR, or THREE MINOR.
//
// The one genuinely computed piece is the tryptase criterion, and it is where this tile
// earns its place over a printed checklist. Baseline serum tryptase above 20 ng/mL is a
// minor criterion, but in hereditary alpha-tryptasemia the value must first be divided by
// (1 + the number of EXTRA alpha-tryptase gene copies). The consensus worked example: a
// tryptase of 30 ng/mL with one extra copy corrects to 15, and is therefore NOT a minor
// criterion. Reading the raw 30 counts a criterion that the rule does not grant, and at
// three-minor-criteria that single item is the difference between systemic and cutaneous
// mastocytosis.
//
// The criterion is also void in the presence of an associated myeloid neoplasm, and that
// exception is part of the published wording, not a caveat bolted on.
//
// Pure: no DOM, no clock, no network.

export const MASTOCYTOSIS_NOTE = 'The WHO criteria for systemic mastocytosis are met by one major plus one minor criterion, or by three minor criteria. The major criterion is multifocal dense infiltrates of mast cells, at least 15 in aggregates, in bone marrow or another extracutaneous organ. The four minor criteria are: more than 25 percent of mast cells atypical or spindle-shaped; an activating KIT point mutation at codon 816 or another critical region; mast cells aberrantly expressing CD2, CD25 or CD30; and a baseline serum tryptase above 20 nanograms per millilitre in the absence of an associated myeloid neoplasm. The tryptase criterion needs care. In hereditary alpha-tryptasemia the measured value must first be divided by one plus the number of extra alpha-tryptase gene copies, so a tryptase of 30 with one extra copy corrects to 15 and does not meet the criterion. Reading the raw value counts a criterion the rule does not grant, and where three minor criteria are what carries the diagnosis, that single item separates systemic from cutaneous mastocytosis. It applies criteria to results already obtained and it does not order the marrow biopsy or the tryptase genotyping that most of them depend on.';

export const TRYPTASE_THRESHOLD = 20; // ng/mL, strictly greater than
export const MAJOR_CLUSTER_SIZE = 15; // mast cells in aggregates

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function systemicMastocytosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const major = truthy(o.multifocalInfiltrates);

  const tryptase = num(o.tryptase);
  const extraCopies = num(o.extraAlphaCopies) === null ? 0 : num(o.extraAlphaCopies);
  if (tryptase !== null && tryptase < 0) return { valid: false, message: 'Tryptase cannot be negative.' };
  if (extraCopies < 0 || !Number.isInteger(extraCopies)) return { valid: false, message: 'Extra alpha-tryptase gene copies must be a whole number, 0 or more.' };

  const associatedNeoplasm = truthy(o.associatedMyeloidNeoplasm);
  const correctedTryptase = tryptase === null ? null : tryptase / (1 + extraCopies);
  const tryptaseMinor = correctedTryptase !== null && correctedTryptase > TRYPTASE_THRESHOLD && !associatedNeoplasm;

  const minors = [
    { met: truthy(o.atypicalMorphology), text: 'more than 25 percent of mast cells atypical or spindle-shaped' },
    { met: truthy(o.kitMutation), text: 'an activating KIT mutation at codon 816 or another critical region' },
    { met: truthy(o.aberrantMarkers), text: 'aberrant mast cell expression of CD2, CD25 or CD30' },
    { met: tryptaseMinor, text: `baseline serum tryptase above ${TRYPTASE_THRESHOLD} ng/mL` },
  ];
  const minorCount = minors.filter((m) => m.met).length;

  const met = (major && minorCount >= 1) || minorCount >= 3;
  const basis = met
    ? (major && minorCount >= 1
      ? `the major criterion plus ${minorCount} minor criteri${minorCount === 1 ? 'on' : 'a'}`
      : `${minorCount} minor criteria with no major criterion`)
    : null;

  // Say what the correction did, whenever it did anything.
  let tryptaseNote = null;
  if (tryptase !== null && extraCopies > 0) {
    const verdict = tryptaseMinor
      ? 'still above the threshold, so the criterion is met'
      : `at or below the ${TRYPTASE_THRESHOLD} ng/mL threshold, so the criterion is NOT met on the raw value`;
    tryptaseNote = `Hereditary alpha-tryptasemia correction: ${tryptase} divided by ${1 + extraCopies} is ${Number(correctedTryptase.toFixed(2))} ng/mL, ${verdict}.`;
  } else if (tryptase !== null && associatedNeoplasm && tryptase > TRYPTASE_THRESHOLD) {
    tryptaseNote = 'The tryptase criterion applies only in the absence of an associated myeloid neoplasm, so it is not counted here.';
  }

  return {
    valid: true,
    criteriaMet: met,
    majorMet: major,
    minorCount,
    minorsMet: minors.filter((m) => m.met).map((m) => m.text),
    correctedTryptase: correctedTryptase === null ? null : Number(correctedTryptase.toFixed(2)),
    tryptaseMinorMet: tryptaseMinor,
    tryptaseNote,
    basis,
    abnormal: met,
    bandLabel: met ? 'WHO criteria met' : 'WHO criteria not met',
    band: met
      ? `Systemic mastocytosis criteria met — ${basis}.`
      : `Systemic mastocytosis criteria not met — ${major ? 'the major criterion is present but no minor criterion is' : `${minorCount} minor criteri${minorCount === 1 ? 'on' : 'a'} and no major criterion; one major plus one minor, or three minor, are needed`}.`,
    detail: `One major plus one minor criterion, or three minor criteria. Major: multifocal dense mast cell infiltrates, at least ${MAJOR_CLUSTER_SIZE} in aggregates. Minor: more than 25 percent atypical or spindle-shaped morphology; an activating KIT mutation; aberrant CD2, CD25 or CD30; and baseline tryptase above ${TRYPTASE_THRESHOLD} ng/mL absent an associated myeloid neoplasm.`,
    note: MASTOCYTOSIS_NOTE,
  };
}
