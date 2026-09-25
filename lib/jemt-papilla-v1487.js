// spec-v1487: the Jemt papilla index beside a single implant, beside the other dental indices.
//
// Sources, read 2026-09-25:
//   Jemt T. Regeneration of gingival papillae after single-implant treatment. Int J Periodontics
//     Restorative Dent. 1997;17(4):326-333 (the original).
//   Scores as stated in J Clin Med 2026 (PMC13207090): "A score of 0 indicated absence of the papilla;
//     1, less than half of the papilla height present; 2, at least half of the papilla height present
//     but incomplete fill of the interproximal space; 3, complete papilla fill; and 4, hyperplastic
//     papilla tissue. Mesial and distal papillae were scored separately."
//
// The mesial and distal papillae are scored separately and reported separately. Pure: no DOM, no clock.

export const JEMT_SCORES = [
  { value: '0', text: '0: no papilla' },
  { value: '1', text: '1: less than half the papilla height' },
  { value: '2', text: '2: at least half the height, incomplete fill' },
  { value: '3', text: '3: papilla fills the whole proximal space' },
  { value: '4', text: '4: hyperplastic papilla' },
];

const DESC = {
  0: 'no papilla',
  1: 'less than half of the papilla height',
  2: 'at least half of the papilla height, but the proximal space is not filled',
  3: 'the papilla fills the whole proximal space',
  4: 'hyperplastic papilla, in excess of the proximal space',
};
const valid = (v) => JEMT_SCORES.some((c) => c.value === String(v));

export function jemtPapilla(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sides = [['mesial', o.mesial], ['distal', o.distal]].map(([side, v]) => ({ side, score: valid(v) ? Number(v) : null }));
  const given = sides.filter((s) => s.score !== null);
  if (!given.length) return { valid: false, message: 'Choose the Jemt score (0 to 4) for the mesial or distal papilla.' };
  const phrase = (s) => (s.score === null ? `${s.side} papilla not entered` : `${s.side} ${s.score}, ${DESC[s.score]}`);
  const short = (s) => (s.score === null ? `${s.side} not entered` : `${s.side} ${s.score}`);
  const deficient = given.filter((s) => s.score < 3).map((s) => s.side);
  const hyper = given.filter((s) => s.score === 4).map((s) => s.side);
  const parts = [];
  if (deficient.length) parts.push(`Incomplete fill on the ${deficient.join(' and ')} side.`);
  if (hyper.length) parts.push(`Hyperplastic tissue on the ${hyper.join(' and ')} side.`);
  if (!deficient.length && !hyper.length) parts.push(given.length === 2 ? 'Both papillae fill the proximal space.' : 'That papilla fills the proximal space.');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  return {
    valid: true,
    mesial: sides[0].score,
    distal: sides[1].score,
    abnormal: deficient.length > 0 || hyper.length > 0,
    band: `${cap(phrase(sides[0]))}; ${phrase(sides[1])}. ${parts.join(' ')}`,
    bandLabel: `Jemt ${short(sides[0])}, ${short(sides[1])}`,
    notes: [
      'The mesial and distal papillae are scored separately; the index has no combined score.',
      'The index was described for single-tooth implants; the original study followed papillae that regained height after the crown was placed.',
    ],
    note: 'Jemt papilla index (Jemt T, Int J Periodontics Restorative Dent 1997); scores as stated in J Clin Med 2026. It describes the soft tissue; it does not decide treatment.',
  };
}
