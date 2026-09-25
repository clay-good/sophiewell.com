// spec-v1481: Basic Periodontal Examination (BPE), the periodontal screen, beside the 2017 staging and
// grading that follows it.
//
// Source, read 2026-09-25: Preshaw PM. Detection and diagnosis of periodontal conditions amenable to
//   prevention. BMC Oral Health. 2015;15 Suppl 1:S5 (doi:10.1186/1472-6831-15-S1-S5, PMC4580822).
//   Table 1, "Basic Periodontal Examination (BPE) scoring codes":
//     0 No pockets > 3.5 mm, no calculus/overhangs, no bleeding after probing (black band completely
//       visible); 1 as 0 but bleeding after probing; 2 no pockets > 3.5 mm, but supra- or subgingival
//       calculus/overhangs; 3 probing depth 3.5-5.5 mm (black band partially visible, a pocket of
//       4-5 mm); 4 probing depth > 5.5 mm (black band entirely within the pocket, 6 mm or more);
//       * furcation involvement, recorded with the number (for example 3*). "The highest score is
//       recorded for each sextant."
//   Text: "For patients with periodontitis (indicated by code 3 or code 4 of CPI/BPE/PSR), then more
//     detailed periodontal charting is recommended. For a patient with any code 4 score, then full
//     periodontal charting should be performed to obtain a pre-treatment record (6 sites per tooth)."
//
// A sextant left blank is not a code 0: the highest code is taken over the sextants entered, and the
// answer says how many that was while a blank one could still raise it. Pure: no DOM, no clock.

export const BPE_CODES = [
  { value: '0', text: '0: no pocket over 3.5 mm, no calculus, no bleeding' },
  { value: '1', text: '1: bleeding after probing' },
  { value: '2', text: '2: calculus or an overhang' },
  { value: '3', text: '3: pocket 3.5 to 5.5 mm (black band partly visible)' },
  { value: '4', text: '4: pocket over 5.5 mm (black band hidden)' },
];
export const BPE_SEXTANTS = [
  { key: 'ur', label: 'upper right' },
  { key: 'ua', label: 'upper anterior' },
  { key: 'ul', label: 'upper left' },
  { key: 'll', label: 'lower left' },
  { key: 'la', label: 'lower anterior' },
  { key: 'lr', label: 'lower right' },
];

const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes';
const MEANING = {
  0: 'no pocket over 3.5 mm, calculus or bleeding',
  1: 'bleeding after probing, with no pocket over 3.5 mm',
  2: 'calculus or an overhang, with no pocket over 3.5 mm',
  3: 'a pocket of 3.5 to 5.5 mm',
  4: 'a pocket over 5.5 mm',
};

export function bpePeriodontal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const scored = [];
  const blank = [];
  for (const s of BPE_SEXTANTS) {
    const v = o[s.key];
    if (BPE_CODES.some((c) => c.value === String(v))) scored.push({ ...s, code: Number(v) });
    else blank.push(s.label);
  }
  if (!scored.length) return { valid: false, message: 'Choose the code for at least one sextant: the BPE records the highest code in each of six.' };

  const highest = Math.max(...scored.map((s) => s.code));
  const furcation = truthy(o.furcation);
  const code = `${highest}${furcation ? '*' : ''}`;
  const where = scored.filter((s) => s.code === highest).map((s) => s.label);
  const perio = highest >= 3;

  const notes = [];
  if (highest === 4) notes.push('Any code 4 calls for full periodontal charting, six sites per tooth, as a pre-treatment record.');
  else if (highest === 3) notes.push('A code 3 indicates periodontitis, and more detailed periodontal charting is recommended.');
  if (furcation) notes.push('Furcation involvement (*) is recorded with the code.');
  if (blank.length && highest < 4) {
    notes.push(`No code was entered for ${blank.length} of the 6 sextants (${blank.join(', ')}); a higher code there would raise this.`);
  }
  notes.push('The BPE is a screen. When it indicates periodontitis, the full assessment, and then staging and grading, follow.');

  return {
    valid: true,
    highest,
    code,
    abnormal: perio,
    sextantsScored: scored.length,
    band: `Highest BPE code ${code}: ${MEANING[highest]}, in the ${where.join(' and ')} sextant${where.length === 1 ? '' : 's'}${perio ? '; this indicates periodontitis' : ''}.`,
    bandLabel: `BPE ${code}`,
    notes,
    note: 'Basic Periodontal Examination codes and the charting that follows them, as stated in Preshaw PM, BMC Oral Health 2015. It screens; it does not diagnose, and treatment is a clinical decision.',
  };
}
