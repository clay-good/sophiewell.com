// spec-v1444: Kanavel's four cardinal signs of pyogenic flexor tenosynovitis.
//
// Sources, read 2026-09-24:
//   Kanavel AB. Infections of the Hand. Philadelphia: Lea & Febiger; 1912 -- the four signs.
//   The signs and their limits, from open reports: "exquisite tenderness over the course of the
//     sheath; resting flexed posture of the finger; pain on extending the finger; and fusiform
//     swelling of the whole finger"; high sensitivity but limited specificity individually; "only
//     about 54% of patients demonstrate all 4 signs" (Cureus 2025, PMC11954652). "Clinical
//     examination alone has not been shown to have consistent accuracy for identifying PFT"; a
//     positive predictive value of only 62.7% to 72.7% for each sign (Hand 2021, PMC10035092,
//     citing Kennedy et al).
//
// Every sign is required: a count read from blanks as "absent" would understate. Pure: no DOM.

export const KANAVEL_YES_NO = [
  { value: 'yes', text: 'Present' },
  { value: 'no', text: 'Absent' },
];

const SIGNS = [
  ['flexed', 'resting flexed posture of the finger'],
  ['swelling', 'fusiform swelling of the whole finger'],
  ['tenderness', 'tenderness along the flexor tendon sheath'],
  ['passive', 'pain on passive extension'],
];

export function kanavelSigns(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const present = [];
  for (const [key, label] of SIGNS) {
    if (o[key] !== 'yes' && o[key] !== 'no') missing.push(label);
    else if (o[key] === 'yes') present.push(label);
  }
  if (missing.length) {
    return { valid: false, message: `Examine for every sign: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed.` };
  }
  const n = present.length;
  const band = n === 4
    ? 'All 4 Kanavel signs present: the classic picture of pyogenic flexor tenosynovitis.'
    : n === 0
      ? 'No Kanavel signs present.'
      : `${n} of 4 Kanavel signs present (${present.join('; ')}).`;
  const notes = [
    'Only about half of confirmed cases show all four signs, so fewer than four does not exclude flexor tenosynovitis.',
    'Each sign alone is sensitive but not specific (positive predictive value about 63% to 73% per sign); clinical examination alone has not proved consistently accurate.',
  ];
  return {
    valid: true,
    abnormal: n > 0,
    count: n,
    band,
    bandLabel: `${n} of 4`,
    notes,
    note: 'Kanavel AB, Infections of the Hand, 1912; the signs\' limits from open reports (Cureus 2025; Hand 2021). The count describes the examination; it does not diagnose or exclude infection.',
  };
}
