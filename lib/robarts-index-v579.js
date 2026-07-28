// spec-v579: the Robarts Histopathology Index (RHI) for ulcerative colitis. A COMPANION to the Nancy index
// shipped alongside it, and to the endoscopic scores the catalog already had. Nancy is a decision tree that
// emits a single grade; Robarts is a WEIGHTED SUM over four items. The two disagree on real biopsies, and
// choosing between them is a real choice, not a preference.
//
// RHI = 1 x (chronic infiltrate) + 2 x (lamina propria neutrophils) + 3 x (neutrophils in epithelium)
//     + 5 x (erosion or ulceration). Range 0 to 33.
//
// **THE EROSION ITEM HAS FIVE MORPHOLOGIC LEVELS BUT ONLY FOUR DISTINCT VALUES, BECAUSE TWO DESCRIPTORS
// SHARE A SCORE.** "Recovering epithelium with adjacent inflammation" and "probable erosion, focally
// stripped" BOTH score raw 1, contributing 5. The level-to-score map is not injective. An implementation
// that offered a 0-to-4 select for this item -- five levels, five values -- would produce a maximum of 20
// for the item and 38 overall, against the published 15 and 33. This lib carries the five descriptors with
// their true raw values and exports the mapping so the collision is testable.
//
// **THREE OF THE SEVEN GEBOES GRADES ARE SCORED IN THE SOURCE SYSTEM AND CONTRIBUTE NOTHING TO THIS INDEX.**
// Architectural change, eosinophils in the lamina propria, and crypt destruction are all graded 0 to 3 in
// the Geboes score from which the RHI is derived, and every one of their levels contributes 0 here --
// including "severe diffuse architectural abnormality" and "unequivocal crypt destruction". They are
// pathology descriptors, not calculator inputs, and a reader who assumes every Geboes grade feeds the RHI
// will look for four fields that do not exist. This lib names them rather than silently omitting them.
//
// **THE EPITHELIAL-NEUTROPHIL BANDS OVERLAP AND LEAVE A HOLE.** The levels are "under 5 percent of crypts",
// "under 50 percent" and "over 50 percent". Under 5 percent is a strict SUBSET of under 50 percent, so 3
// percent satisfies two levels at once, and EXACTLY 50 percent satisfies neither. This lib takes the LEVEL
// as the input rather than a percentage, because a percentage cannot be mapped onto these bands without
// inventing a rule the source does not contain (spec-v97).
//
// **A CLAIMED ODDITY THAT DOES NOT HOLD, CHECKED RATHER THAN ASSUMED.** It is natural to suppose that a
// weighted sum over four coarse items leaves gaps -- that the total is a sum of one value from each of
// {0,1,2,3}, {0,2,4,6}, {0,3,6,9} and {0,5,10,15} and therefore skips most integers. It does not. Those
// weights make the range FULLY DENSE: every integer from 0 to 33 is attainable, which this lib computes in
// `attainableTotals()` rather than asserting. The property is worth stating precisely because the opposite
// is the intuitive guess.
//
// THRESHOLDS: histological remission is 3 or less, histological response 9 or less. Those belong to the RHI
// and are NOT the Geboes thresholds, which are 2.0 and 3.0 on a differently constructed scale.
//
// HIGH-STAKES: a histologic activity index. It does NOT diagnose ulcerative colitis, and it does not
// separate it from infectious, ischemic or drug-induced colitis or from Crohn colitis, which can all show
// active inflammation on a biopsy. It does not assess dysplasia, which is a separate reading of the same
// slide. It does not measure endoscopic or symptomatic activity, and histologic activity persists in
// patients who look healed endoscopically. It does not select or escalate therapy (spec-v11 section 5.3).
// The decision stays with the gastroenterologist and the pathologist.
//
// ITEMS, WEIGHTS AND THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from a review
// reproducing the already-weighted table and cross-checked against an independent rendering in
// raw-score-times-weight form, which agrees on every level including the shared score:
//   - Mosli MH, Feagan BG, Zou G, et al. Development and validation of a histological index for UC. Gut.
//     2017;66(1):50-58.

export const CHRONIC_INFILTRATE = {
  key: 'chronicInfiltrate', weight: 1, geboes: 'Geboes grade 1',
  levels: [
    { value: 0, text: 'No increase' },
    { value: 1, text: 'Mild but unequivocal increase' },
    { value: 2, text: 'Moderate increase' },
    { value: 3, text: 'Marked increase' },
  ],
};

export const LAMINA_PROPRIA_NEUTROPHILS = {
  key: 'laminaPropriaNeutrophils', weight: 2, geboes: 'Geboes grade 2B',
  levels: [
    { value: 0, text: 'No increase' },
    { value: 1, text: 'Mild but unequivocal increase' },
    { value: 2, text: 'Moderate increase' },
    { value: 3, text: 'Marked increase' },
  ],
};

export const EPITHELIAL_NEUTROPHILS = {
  key: 'epithelialNeutrophils', weight: 3, geboes: 'Geboes grade 3',
  levels: [
    { value: 0, text: 'None' },
    { value: 1, text: 'Under 5 percent of crypts involved' },
    { value: 2, text: 'Under 50 percent of crypts involved' },
    { value: 3, text: 'Over 50 percent of crypts involved' },
  ],
};

// FIVE descriptors, FOUR distinct raw values: the first two non-zero descriptors both score 1.
export const EROSION_ULCERATION = {
  key: 'erosionUlceration', weight: 5, geboes: 'Geboes grade 5',
  levels: [
    { descriptor: '5.0', value: 0, text: 'No erosion, ulceration or granulation tissue' },
    { descriptor: '5.1', value: 1, text: 'Recovering epithelium with adjacent inflammation' },
    { descriptor: '5.2', value: 1, text: 'Probable erosion, focally stripped' },
    { descriptor: '5.3', value: 2, text: 'Unequivocal erosion' },
    { descriptor: '5.4', value: 3, text: 'Ulcer or granulation tissue' },
  ],
};

export const RHI_ITEMS = [CHRONIC_INFILTRATE, LAMINA_PROPRIA_NEUTROPHILS, EPITHELIAL_NEUTROPHILS, EROSION_ULCERATION];

// Graded in the Geboes system the RHI derives from, and contributing nothing here.
export const GEBOES_GRADES_CONTRIBUTING_ZERO = [
  { geboes: 'Geboes grade 0', text: 'Architectural changes, including severe diffuse or multifocal abnormality' },
  { geboes: 'Geboes grade 2A', text: 'Eosinophils in the lamina propria, including a marked increase' },
  { geboes: 'Geboes grade 4', text: 'Crypt destruction, including unequivocal crypt destruction' },
];

export const RHI_MAX = 33;
export const REMISSION_MAX = 3;
export const RESPONSE_MAX = 9;
export const GEBOES_REMISSION = 2.0;
export const GEBOES_RESPONSE = 3.0;

// Every attainable total, computed so density is checkable rather than assumed either way.
export function attainableTotals() {
  const set = new Set();
  for (const a of [0, 1, 2, 3]) {
    for (const b of [0, 2, 4, 6]) {
      for (const c of [0, 3, 6, 9]) {
        for (const d of [0, 5, 10, 15]) set.add(a + b + c + d);
      }
    }
  }
  return [...set].sort((x, y) => x - y);
}

const SHARED_SCORE_TEXT = 'The erosion item has FIVE morphologic descriptors but only FOUR distinct values: "recovering epithelium with adjacent inflammation" and "probable erosion, focally stripped" BOTH score raw 1, contributing 5. The map is not injective, and a five-level select with five values would give a maximum of 38 rather than 33.';

const ZERO_CONTRIBUTORS_TEXT = 'Three Geboes grades are scored in the source system and contribute NOTHING here: architectural change, eosinophils in the lamina propria, and crypt destruction. Every one of their levels contributes 0, including severe architectural abnormality and unequivocal crypt destruction. They are pathology descriptors, not calculator inputs.';

const BAND_OVERLAP_TEXT = 'The epithelial-neutrophil bands overlap and leave a hole: under 5 percent is a strict subset of under 50 percent, so 3 percent satisfies two levels at once, and exactly 50 percent satisfies neither. The LEVEL is taken as the input rather than a percentage, because a percentage cannot be mapped onto these bands without inventing a rule the source does not contain.';

const DENSE_TEXT = `Every integer from 0 to ${RHI_MAX} is attainable. That is worth stating because the intuitive guess is the opposite: a weighted sum over four coarse items looks as though it should leave gaps, and with these particular weights it does not.`;

const THRESHOLD_TEXT = `Histological remission is ${REMISSION_MAX} or less and histological response ${RESPONSE_MAX} or less on the RHI. These are NOT the Geboes thresholds of ${GEBOES_REMISSION} and ${GEBOES_RESPONSE}, which belong to a differently constructed scale.`;

const NOTE = 'The Robarts Histopathology Index (Mosli and colleagues 2017) scores histologic activity in ulcerative colitis as a weighted sum over four items: the chronic inflammatory infiltrate at weight 1, neutrophils in the lamina propria at weight 2, neutrophils in the epithelium at weight 3, and erosion or ulceration at weight 5, giving a range of 0 to 33. It is a companion to the Nancy histological index rather than an alternative spelling of it: Nancy is a decision tree emitting a single grade while Robarts is a weighted sum, and the two disagree on real biopsies. The erosion item has five morphologic descriptors but only four distinct values, because recovering epithelium with adjacent inflammation and probable focally stripped erosion both score raw 1, so the level-to-score map is not injective and a five-level select with five values would give a maximum of 38 rather than 33. Three of the Geboes grades from which the index derives are scored in that system and contribute nothing here: architectural change, eosinophils in the lamina propria, and crypt destruction, every level of which contributes 0, including severe architectural abnormality and unequivocal crypt destruction; they are pathology descriptors rather than calculator inputs, and a reader who assumes every Geboes grade feeds the index will look for fields that do not exist. The epithelial-neutrophil bands overlap and leave a hole, since under 5 percent of crypts is a strict subset of under 50 percent so 3 percent satisfies two levels at once, and exactly 50 percent satisfies neither; the level is therefore taken as the input rather than a percentage, because a percentage cannot be mapped onto these bands without inventing a rule the source does not contain. Every integer from 0 to 33 is attainable, which is worth stating because the intuitive guess is the opposite: a weighted sum over four coarse items looks as though it should leave gaps, and with these weights it does not. Histological remission is 3 or less and response 9 or less on this index, which are not the Geboes thresholds of 2.0 and 3.0 on a differently constructed scale. This is a histologic activity index. It does not diagnose ulcerative colitis and does not separate it from infectious, ischemic or drug-induced colitis or from Crohn colitis, all of which can show active inflammation on a biopsy. It does not assess dysplasia, which is a separate reading of the same slide. It does not measure endoscopic or symptomatic activity, and histologic activity persists in patients who look healed endoscopically. It does not select or escalate therapy.';

function readLevel(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return { missing: true };
  const s = String(raw).trim();
  // The erosion item is addressed by descriptor, because two descriptors share a value.
  if (item.key === 'erosionUlceration') {
    const byDescriptor = item.levels.find((l) => l.descriptor === s);
    if (byDescriptor) return { level: byDescriptor };
    return { bad: true };
  }
  const n = Number(s);
  const level = item.levels.find((l) => l.value === n);
  return level ? { level } : { bad: true };
}

// input: chronicInfiltrate, laminaPropriaNeutrophils, epithelialNeutrophils as 0-3;
//        erosionUlceration as a DESCRIPTOR ('5.0'..'5.4'), because two descriptors share a value.
export function robartsIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = [];
  for (const item of RHI_ITEMS) {
    const read = readLevel(item, o[item.key]);
    if (read.missing) {
      return { valid: false, message: item.key === 'erosionUlceration'
        ? `Choose the erosion or ulceration descriptor (${EROSION_ULCERATION.levels.map((l) => l.descriptor).join(', ')}). ${SHARED_SCORE_TEXT}`
        : `Score every item. Still needed: ${item.key}.` };
    }
    if (read.bad) {
      return { valid: false, message: item.key === 'erosionUlceration'
        ? `The erosion descriptor must be one of: ${EROSION_ULCERATION.levels.map((l) => l.descriptor).join(', ')}.`
        : `${item.key} must be 0, 1, 2 or 3.` };
    }
    scored.push({
      key: item.key,
      weight: item.weight,
      raw: read.level.value,
      descriptor: read.level.descriptor || null,
      text: read.level.text,
      contribution: read.level.value * item.weight,
    });
  }

  const total = scored.reduce((a, s) => a + s.contribution, 0);
  const remission = total <= REMISSION_MAX;
  const response = total <= RESPONSE_MAX;

  return {
    valid: true,
    total,
    max: RHI_MAX,
    items: scored,
    remission,
    response,
    zeroContributingGeboesGrades: GEBOES_GRADES_CONTRIBUTING_ZERO.map((g) => g.geboes),
    bandLabel: `Robarts index ${total} of ${RHI_MAX}`,
    bandText: `Robarts Histopathology Index ${total} of ${RHI_MAX}: ${remission ? 'histological REMISSION' : (response ? 'histological RESPONSE but not remission' : 'neither remission nor response')}. Contributions: ${scored.map((s) => `${s.key} ${s.raw} x${s.weight} = ${s.contribution}`).join(', ')}. ${THRESHOLD_TEXT} ${SHARED_SCORE_TEXT} ${ZERO_CONTRIBUTORS_TEXT} ${BAND_OVERLAP_TEXT} ${DENSE_TEXT} This is a histologic activity index and does not diagnose ulcerative colitis, assess dysplasia, or select therapy.`,
    note: NOTE,
  };
}
