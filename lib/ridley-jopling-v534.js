// spec-v534: the Ridley-Jopling classification of leprosy. Zero-hit before this tile: "ridley", "jopling",
// "leprosy", "lepromatous", and "bacillary" across corpus.json, app.js, and lib/meta.js. The `hansen` hits
// are orthopedic eponyms (Winquist-Hansen femoral shaft, Lauge-Hansen ankle), not Hansen disease.
//
// WHOLE-DISEASE GAP: the catalog had no leprosy content of any kind.
//
// A SPECTRUM, NOT A LADDER OF SEVERITY. The five groups are ordered by the patient's CELL-MEDIATED IMMUNE
// RESPONSE to the organism, from high resistance at the tuberculoid pole to none at the lepromatous pole:
//   TT  tuberculoid          high resistance
//   BT  borderline tuberculoid
//   BB  mid-borderline       immunologically unstable
//   BL  borderline lepromatous
//   LL  lepromatous          little or no resistance
// Everything else about a case follows from where it sits: few asymmetric lesions and a positive lepromin
// test at the TT end, many symmetric lesions and a negative lepromin test at the LL end. The borderline
// groups are the unstable middle, and BB in particular is the least stable position on the spectrum.
//
// INDETERMINATE LEPROSY SITS OUTSIDE THE FIVE. The original paper's title is "a five-group system", and
// indeterminate is a pre-spectrum stage in a patient who has not yet mounted a classifiable immune response.
// This tile offers it as a distinct answer rather than forcing it into TT, and says it is outside the
// spectrum. Pure neuritic leprosy is likewise outside these five and is named as out of scope.
//
// **THIS TILE DOES NOT ATTACH A BACTERIAL INDEX NUMBER TO A CLASS, AND THAT IS DELIBERATE.** The BI scale
// itself is unambiguous and is reproduced here. But four independent reproductions of the per-class BI give
// four DIFFERENT answers -- one puts BB at 2+, another at 2-3+, another at 2-4+, another at "2+ or more" --
// partly because some quote the bacterial index of GRANULOMA (tissue) rather than the slit-skin smear BI,
// and those run higher. Per spec-v97, where sources disagree the tile reports only what they agree on: the
// DIRECTION. The BI is negative at the tuberculoid pole, rises across the borderline groups, and is highest
// at the lepromatous pole. Quoting a specific number per class would manufacture a precision the literature
// does not have.
//
// TWO MORE PLACES SOURCES DISAGREE, HANDLED THE SAME WAY:
//   - NERVE INVOLVEMENT IN TT. One source says TT has no neurological damage; three describe a thickened
//     nerve trunk near the lesion. The tile uses wording both support: involvement is limited and localized
//     to the vicinity of the lesion.
//   - THE GRENZ ZONE IN LL. Three sources say a thin Grenz zone is present in LL, one says absent. The
//     majority is used and the minority noted. (The zone is genuinely absent in TT, where the granuloma
//     erodes the epidermis.)
//
// THE WHO OPERATIONAL CLASSIFICATION IS A DIFFERENT SYSTEM AND HAS CHANGED SEVERAL TIMES. Ridley-Jopling is
// a research and histopathologic classification; WHO's paucibacillary/multibacillary split is an operational
// one for choosing treatment duration in the field. The crosswalk is TT and BT to paucibacillary, and BB, BL
// and LL to multibacillary. Under the CURRENT WHO definition a case is multibacillary if there are more than
// five skin lesions, OR any nerve involvement, OR bacilli on a slit-skin smear -- the three are alternatives,
// not requirements, and NERVE INVOLVEMENT ALONE MAKES A CASE MULTIBACILLARY even with few lesions. That last
// point is the one stale references most often get wrong, so the tile states it.
//
// HIGH-STAKES: this classifies a case that has already been diagnosed. It does NOT diagnose leprosy, which
// rests on the cardinal signs and on slit-skin smear and histopathology, and it cannot be assigned from a
// clinical description alone -- the lepromin response and the histology are part of the definition. It is
// not a treatment regimen: multidrug therapy is chosen from the WHO operational class, not from the
// Ridley-Jopling group, and this tile emits no drugs, doses, or durations (spec-v11 section 5.3). It also
// says nothing about leprosy REACTIONS (type 1 reversal and type 2 erythema nodosum leprosum), which are the
// acute events that cause most nerve damage and are managed separately and urgently. Leprosy is curable and
// treatment is free through national programs; a classification is not a reason to delay referral. The
// diagnosis and management stay with the clinician.
//
// GROUPS, AXES, AND THE WHO CROSSWALK RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from sources
// agreeing on each axis reported here:
//   - Ridley DS, Jopling WH. Classification of leprosy according to immunity. A five-group system.
//     Int J Lepr Other Mycobact Dis. 1966;34(3):255-273.
//   - Independent reviews reproducing the same five groups with the same lepromin responses, the same lesion
//     number and symmetry pattern, the same histologic progression from epithelioid granuloma to sheets of
//     foamy macrophages, and the same WHO crosswalk and current WHO operational definition.

export const RJ_GROUPS = [
  {
    value: 'TT',
    label: 'TT (tuberculoid)',
    immunity: 'High cell-mediated resistance.',
    lesions: 'Few lesions, often single, asymmetric: a well-defined hypopigmented plaque with a raised border, dry, hairless, and anesthetic.',
    nerve: 'Nerve involvement is limited and localized to the vicinity of the lesion.',
    lepromin: 'Positive.',
    histology: 'Epithelioid granulomas with Langhans giant cells, ringed by numerous lymphocytes, extending up to the epidermis so no Grenz zone remains.',
    who: 'paucibacillary',
  },
  {
    value: 'BT',
    label: 'BT (borderline tuberculoid)',
    immunity: 'Substantial but incomplete resistance.',
    lesions: 'Few lesions, larger and more numerous than TT, asymmetric, with satellite lesions at the margins.',
    nerve: 'Asymmetric thickening of several nerves, with marked sensory loss.',
    lepromin: 'Positive.',
    histology: 'Epithelioid granulomas, less compact than TT, with moderate lymphocytes; subepidermal infiltration is inconstant.',
    who: 'paucibacillary',
  },
  {
    value: 'BB',
    label: 'BB (mid-borderline)',
    immunity: 'Unstable. This is the least stable position on the spectrum, and untreated cases tend to shift toward one pole.',
    lesions: 'Multiple asymmetric lesions with a characteristic punched-out or inverted-saucer appearance and sloping edges.',
    nerve: 'Inconsistent, and may be symmetric or asymmetric; thickening appears late.',
    lepromin: 'Weakly positive, doubtful, or absent.',
    histology: 'Mixed, ill-defined granulomas with immature epithelioid cells and foamy macrophages; Langhans giant cells are absent and a clear Grenz zone is present.',
    who: 'multibacillary',
  },
  {
    value: 'BL',
    label: 'BL (borderline lepromatous)',
    immunity: 'Little resistance.',
    lesions: 'Many lesions, becoming bilaterally symmetric: hypopigmented macules with indistinct borders progressing to infiltrated plaques and nodules.',
    nerve: 'Widespread nerve trunk thickening.',
    lepromin: 'Doubtful or absent.',
    histology: 'Macrophage granulomas with foamy, lipid-laden macrophages and fewer epithelioid cells; a Grenz zone is present, with onion-skin perineural lamination.',
    who: 'multibacillary',
  },
  {
    value: 'LL',
    label: 'LL (lepromatous)',
    immunity: 'Little or no cell-mediated resistance.',
    lesions: 'Numerous bilaterally symmetric lesions: macules progressing to diffuse infiltration, papules, plaques, and nodules, with sensation preserved early.',
    nerve: 'No thickening early; late symmetric glove-and-stocking anesthesia.',
    lepromin: 'Absent.',
    histology: 'Diffuse sheets of foamy (Virchow) macrophages with epithelioid cells absent and scanty lymphocytes; most sources describe a thin Grenz zone as present, though one describes it as absent.',
    who: 'multibacillary',
  },
];

// Offered as a distinct answer because it is not one of the five.
export const RJ_INDETERMINATE = {
  value: 'I',
  label: 'Indeterminate',
  text: 'Indeterminate leprosy sits OUTSIDE the five-group spectrum: an early stage in a patient who has not yet mounted a classifiable cell-mediated immune response, typically a single vague-edged hypopigmented patch with no acid-fast bacilli demonstrated. Many such lesions resolve without treatment; others evolve into one of the five groups.',
  who: 'grouped with paucibacillary in operational practice',
};

// The Ridley logarithmic bacterial index, reproduced because the SCALE is unambiguous even though the
// per-class values are not. Read with an oil-immersion objective over at least 100 fields.
export const BACTERIAL_INDEX_SCALE = [
  { grade: '0', text: 'No bacilli in 100 fields' },
  { grade: '1+', text: '1 to 10 bacilli in 100 fields' },
  { grade: '2+', text: '1 to 10 bacilli in 10 fields' },
  { grade: '3+', text: '1 to 10 bacilli in an average field' },
  { grade: '4+', text: '10 to 100 bacilli in an average field' },
  { grade: '5+', text: '100 to 1000 bacilli in an average field' },
  { grade: '6+', text: 'More than 1000 bacilli in an average field' },
];

const NOTE = 'The Ridley-Jopling classification (Ridley and Jopling 1966) places leprosy on a five-group spectrum ordered by cell-mediated immune response: TT tuberculoid with high resistance, then BT, BB, BL, and LL lepromatous with little or none. It is a spectrum rather than a ladder of severity, and everything else about a case follows from where it sits, with few asymmetric lesions and a positive lepromin test at the tuberculoid pole and many symmetric lesions and an absent response at the lepromatous pole. Indeterminate leprosy sits outside the five groups as a pre-spectrum stage, and pure neuritic leprosy is likewise outside them. This tile does not attach a bacterial index number to a group, because independent reproductions give different per-group values, partly by quoting the bacterial index of granuloma rather than the slit-skin smear index, so only the direction is reported: negative at the tuberculoid pole, rising across the borderline groups, highest at the lepromatous pole. The Ridley logarithmic index scale itself is unambiguous and is given separately. Sources also disagree about nerve involvement in TT and about the Grenz zone in LL, and the wording here follows what the majority support. The WHO paucibacillary and multibacillary classification is a different, operational system used to choose treatment duration: TT and BT map to paucibacillary and BB, BL, and LL to multibacillary, but under the current WHO definition a case is multibacillary if there are more than five skin lesions, OR any nerve involvement, OR bacilli on a slit-skin smear, and nerve involvement alone makes a case multibacillary even with few lesions, which stale references most often get wrong. This classifies a case that has already been diagnosed. It does not diagnose leprosy, which rests on the cardinal signs with slit-skin smear and histopathology, and it cannot be assigned from a clinical description alone because the lepromin response and the histology are part of the definition. It is not a treatment regimen: multidrug therapy is chosen from the WHO operational class, not from the Ridley-Jopling group. It also says nothing about leprosy reactions, type 1 reversal and type 2 erythema nodosum leprosum, which cause most nerve damage and are managed separately and urgently. Leprosy is curable and treatment is free through national programs, so a classification is never a reason to delay referral.';

// input: group -- 'TT' | 'BT' | 'BB' | 'BL' | 'LL' | 'I' (indeterminate).
export function ridleyJopling(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.group;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose a group: TT, BT, BB, BL, LL, or I (indeterminate).' };
  }
  const key = String(raw).trim().toUpperCase();

  if (key === 'I' || key === 'IND' || key === 'INDETERMINATE') {
    return {
      valid: true,
      group: 'I',
      onSpectrum: false,
      whoClass: RJ_INDETERMINATE.who,
      bacterialIndexScale: BACTERIAL_INDEX_SCALE.slice(),
      bandLabel: 'Indeterminate leprosy (outside the five-group spectrum)',
      band: `${RJ_INDETERMINATE.text} It is ${RJ_INDETERMINATE.who}. No bacterial index value is attached to a group here, because sources disagree on the per-group figures.`,
      note: NOTE,
    };
  }

  const entry = RJ_GROUPS.find((g) => g.value === key);
  if (!entry) {
    return { valid: false, message: 'Group must be TT, BT, BB, BL, LL, or I (indeterminate).' };
  }

  return {
    valid: true,
    group: entry.value,
    onSpectrum: true,
    whoClass: entry.who,
    lepromin: entry.lepromin,
    bacterialIndexScale: BACTERIAL_INDEX_SCALE.slice(),
    bandLabel: `Ridley-Jopling ${entry.label}`,
    band: `${entry.label}. ${entry.immunity} Lesions: ${entry.lesions} Nerves: ${entry.nerve} Lepromin: ${entry.lepromin} Histology: ${entry.histology} Maps to WHO ${entry.who} disease. No bacterial index value is attached to a group here, because sources disagree on the per-group figures; the index is negative at the tuberculoid pole and highest at the lepromatous pole.`,
    note: NOTE,
  };
}
