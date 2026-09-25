// spec-v1494: Kotlow's classification of ankyloglossia by free tongue length.
//
// Sources, read 2026-09-25:
//   Kotlow LA. Ankyloglossia (tongue-tie): a diagnostic and treatment quandary. Quintessence Int.
//     1999;30(4):259-262 (the original).
//   Classes as tabulated in Cureus 2026 (PMC13202495), Table 1: "The free tongue length is measured
//     from the insertion of the lingual frenum to the tip of the tongue ... Class I Mild 12-16 mm;
//     Class II Moderate 8-11 mm; Class III Severe 3-7 mm; Class IV Complete <3 mm."
//   Laryngoscope 2025 (PMC12913740): studies using the scale defined a short lingual frenulum as "a
//     length of free tongue <= 16 mm (Kotlow class >= I)".
//
// The classes are whole-mm ranges; a length between two of them is reported as between, not rounded.
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const CLASSES = [
  { cls: 'Class I', sev: 'mild', lo: 12, hi: 16 },
  { cls: 'Class II', sev: 'moderate', lo: 8, hi: 11 },
  { cls: 'Class III', sev: 'severe', lo: 3, hi: 7 },
];

export function kotlowAnkyloglossia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([['the free tongue length', o.length, 0, 40, 'mm']]);
  if (fault) return { valid: false, message: fault };
  const mm = Number(o.length);
  const notes = [
    'Measure from the insertion of the lingual frenum to the tip of the tongue.',
    'The class grades the length alone; how the tongue moves and feeds or speaks decides whether to treat.',
  ];
  const note = 'Kotlow LA, Quintessence Int 1999; classes as tabulated in Cureus 2026. It grades the frenum; the decision to release it is a clinical one.';
  const res = (label, band, abnormal) => ({ valid: true, lengthMm: mm, abnormal, band, bandLabel: label, notes, note });
  if (mm > 16) return res('Not short (over 16 mm)', `Free tongue length ${mm} mm: over 16 mm, not a short frenum by Kotlow's classes.`, false);
  if (mm < 3) return res('Class IV, complete', `Kotlow Class IV (complete ankyloglossia): free tongue length ${mm} mm, under 3 mm.`, true);
  const hit = CLASSES.find((c) => mm >= c.lo && mm <= c.hi);
  if (hit) return res(`${hit.cls}, ${hit.sev}`, `Kotlow ${hit.cls} (${hit.sev} ankyloglossia): free tongue length ${mm} mm, in the ${hit.lo} to ${hit.hi} mm range.`, true);
  const above = CLASSES.find((c) => mm < c.lo && mm > c.lo - 1);
  const below = CLASSES[CLASSES.indexOf(above) + 1];
  return res(`Between ${above.cls} and ${below.cls}`, `Free tongue length ${mm} mm falls between Kotlow ${above.cls} (${above.lo} to ${above.hi} mm) and ${below.cls} (${below.lo} to ${below.hi} mm); the classes are stated in whole millimeters.`, true);
}
