// spec-v1442: Kyoto classification of gastritis score (endoscopic gastric cancer risk).
//
// Source, read 2026-09-24: Hiramatsu T, Kakushima N, Kuribara H, et al. Recent advancement in
// endoscopic diagnosis for risk stratification of gastric cancer. Clin Endosc 2025;58:787-
// (PMC12933536), Table 4 and text:
//   atrophy C0-C1 0, C2-C3 1, O1-O3 2; intestinal metaplasia none 0, antrum 1, corpus and antrum 2;
//   enlarged folds no 0, yes 1; nodularity no 0, yes 1; diffuse redness none (RAC present) 0, mild
//   (RAC partially visible) 1, severe (RAC absent) 2. "The Kyoto score is calculated as the sum of
//   0 to 8 points"; "a Kyoto score of 4 or higher is rated as a risk for GC"; eradication improved the
//   mean score from 3.90 to 2.78 through folds, nodularity and redness "but not atrophy and IM";
//   "because map-like redness appears after eradication, the score may increase with eradication".
//
// Every finding is required. Pure: no DOM, no clock, no network.

export const KYOTO_ATROPHY = [
  { value: '0', text: 'C0-C1' },
  { value: '1', text: 'C2-C3 (closed type)' },
  { value: '2', text: 'O1-O3 (open type)' },
];
export const KYOTO_IM = [
  { value: '0', text: 'None' },
  { value: '1', text: 'Antrum only' },
  { value: '2', text: 'Antrum and corpus' },
];
export const KYOTO_YES_NO = [
  { value: '0', text: 'No' },
  { value: '1', text: 'Yes' },
];
export const KYOTO_REDNESS = [
  { value: '0', text: 'None (regular arrangement of collecting venules present)' },
  { value: '1', text: 'Mild (collecting venules partly visible)' },
  { value: '2', text: 'Severe (collecting venules absent)' },
];

const FIELDS = [
  ['atrophy', 'atrophy', KYOTO_ATROPHY],
  ['im', 'intestinal metaplasia', KYOTO_IM],
  ['folds', 'enlarged folds', KYOTO_YES_NO],
  ['nodularity', 'nodularity', KYOTO_YES_NO],
  ['redness', 'diffuse redness', KYOTO_REDNESS],
];

export function kyotoGastritis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const parts = {};
  for (const [key, label, opts] of FIELDS) {
    const v = o[key] === undefined || o[key] === null ? '' : String(o[key]);
    if (!opts.some((x) => x.value === v)) { missing.push(label); continue; }
    parts[key] = Number(v);
  }
  if (missing.length) {
    return { valid: false, message: `Choose every finding: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed.` };
  }
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  const high = score >= 4;
  const notes = [
    'After eradication, map-like redness can appear and raise the score, and atrophy and intestinal metaplasia do not fall back; read a post-eradication score with that in mind.',
    'The score grades the background mucosa for risk; it does not detect or exclude a cancer.',
  ];
  return {
    valid: true,
    abnormal: high,
    score,
    parts,
    band: `Kyoto score ${score} of 8: ${high ? 'at or above 4, the level rated as a risk for gastric cancer' : 'below 4, the level rated as a risk for gastric cancer'}.`,
    bandLabel: `${score} of 8${high ? ' (4 or more)' : ''}`,
    notes,
    note: 'Kyoto classification of gastritis, as tabulated in Hiramatsu T et al, Clin Endosc 2025 (Table 4): atrophy 0-2, intestinal metaplasia 0-2, enlarged folds 0-1, nodularity 0-1, diffuse redness 0-2.',
  };
}
