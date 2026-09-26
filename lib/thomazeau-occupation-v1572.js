// spec-v1572: the Thomazeau occupation ratio of the supraspinatus, beside the Goutallier grade.
//
// Sources, read 2026-09-25:
//   Thomazeau H, Rolland Y, Lucas C, Duval JM, Langlais F. Atrophy of the supraspinatus belly:
//     assessment by MRI in 55 patients with rotator cuff pathology. Acta Orthop Scand.
//     1996;67(3):264-268 (the original).
//   Grades as stated in Cureus 2025 (PMC12145530): "Grade 1, minimal to mild atrophy of supraspinatus
//     muscle, occupation ratio >=60%. Grade 2, moderate atrophy of supraspinatus, occupation ratio
//     40%-59%. Grade 3, severe atrophy of supraspinatus, occupation ratio <40%." The same study showed
//     that a simulated retraction of the tendon lowers the ratio of a muscle that is not atrophic.
//
// The ratio is the muscle's cross-sectional area over the area of the supraspinatus fossa, on the same
// slice. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export function thomazeauOccupation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the supraspinatus muscle cross-sectional area', o.muscle, null, 100, 'cm^2'],
    ['the supraspinatus fossa area', o.fossa, null, 100, 'cm^2'],
  ]);
  if (fault) return { valid: false, message: fault };
  const muscle = Number(o.muscle);
  const fossa = Number(o.fossa);
  if (muscle > fossa * 1.2) return { valid: false, message: 'Enter the areas again: the muscle is outlined inside the fossa, so its area cannot be much larger than the fossa.' };
  const raw = muscle / fossa;
  const ratio = Math.round(raw * 1000) / 1000;
  const pct = Math.round(raw * 1000) / 10;
  let grade;
  let text;
  if (raw >= 0.6) { grade = 'I'; text = 'normal or mild atrophy'; }
  else if (raw >= 0.4) { grade = 'II'; text = 'moderate atrophy'; }
  else { grade = 'III'; text = 'severe atrophy'; }
  return {
    valid: true,
    ratio,
    grade,
    abnormal: grade !== 'I',
    band: `Occupation ratio ${ratio} (${pct}%): Thomazeau grade ${grade}, ${text} of the supraspinatus.`,
    bandLabel: `Thomazeau ${grade}`,
    notes: [
      'Outline the muscle and the fossa on the same oblique sagittal slice, in the same units; the ratio has no units.',
      'A retracted tendon pulls the muscle belly medially and lowers the ratio, so an acute tear can read as more atrophic than it is.',
    ],
    note: 'Thomazeau H et al, Acta Orthop Scand 1996; grades as stated in Cureus 2025. Goutallier grades fatty infiltration of the same muscle; the two are read together.',
  };
}
