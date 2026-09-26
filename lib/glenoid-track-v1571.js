// spec-v1571: the glenoid track, on-track or off-track Hill-Sachs lesion, beside the ISIS score.
//
// Sources, read 2026-09-25:
//   Di Giacomo G, Itoi E, Burkhart SS. Evolving concept of bipolar bone loss and the Hill-Sachs lesion:
//     from "engaging/non-engaging" lesion to "on-track/off-track" lesion. Arthroscopy.
//     2014;30(1):90-98 (the original).
//   Int Orthop 2026 (PMC13525068): "The standard glenoid track width is calculated as 83% of this value
//     (0.83D) ... The defect width (d) is then subtracted from 0.83D to determine the true glenoid track
//     width (0.83D - d)."
//   JSES Int 2026 (PMC13156740): "HSI = Hill-Sachs lesion width + bone bridge to the rotator cuff
//     footprint."
//   JSES Rev Rep Tech 2026 (PMC13054037): the distance to dislocation is "the glenoid track (0.83D - d)
//     minus the Hill-Sachs interval ... off-track HSLs were defined as DTD <=0 mm ... near-track HSLs
//     (defined as 0 mm < DTD <=10 mm) and on-track HSLs (defined as DTD >10 mm)"; glenoid bone loss is
//     d divided by D times 100.
//   Diagnostics 2026 (PMC13464990): a lesion "is classified as off-track when the Hill-Sachs interval
//     exceeds the available track", which leaves a distance of exactly 0 mm on-track.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const r1 = (x) => Math.round(x * 10) / 10;

export function glenoidTrack(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the glenoid width (D)', o.glenoidWidth, 10, 60, 'mm'],
    ['the glenoid defect width (d, 0 if none)', o.defect, 0, 30, 'mm'],
    ['the Hill-Sachs lesion width', o.hsWidth, 0, 50, 'mm'],
    ['the bone bridge to the rotator cuff footprint', o.bridge, 0, 40, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };
  const D = Number(o.glenoidWidth);
  const d = Number(o.defect);
  if (d >= D) return { valid: false, message: 'Enter the defect again: it must be narrower than the glenoid.' };
  const track = r1(0.83 * D - d);
  const hsi = r1(Number(o.hsWidth) + Number(o.bridge));
  const dtd = r1(0.83 * D - d - (Number(o.hsWidth) + Number(o.bridge)));
  const loss = r1((d / D) * 100);
  let label;
  let text;
  if (dtd < 0) { label = 'Off-track'; text = 'off-track, because the Hill-Sachs interval is wider than the glenoid track'; }
  else if (dtd === 0) { label = 'Off-track or on-track (0 mm boundary)'; text = 'exactly at the track edge, so off-track where the cutoff is a distance of 0 mm or less, on-track where a lesion is off-track only when the interval exceeds the track'; }
  else if (dtd <= 10) { label = 'Near-track'; text = 'on-track, and near-track: within 10 mm of the track edge'; }
  else { label = 'On-track'; text = 'on-track, more than 10 mm inside the glenoid track'; }
  return {
    valid: true,
    track,
    hsi,
    dtd,
    glenoidBoneLoss: loss,
    abnormal: dtd <= 10,
    band: `Glenoid track ${track} mm, Hill-Sachs interval ${hsi} mm, distance to dislocation ${dtd} mm: ${text}. Glenoid bone loss ${loss}%.`,
    bandLabel: label,
    notes: [
      'The track is 83% of the glenoid width less the defect; measure both on the same en face view, with the width from the intact contralateral glenoid or a best-fit circle.',
      'The interval is the Hill-Sachs width plus the intact bone bridge between the lesion and the rotator cuff footprint.',
    ],
    note: 'Glenoid track concept (Di Giacomo G et al, Arthroscopy 2014); formulas as stated in Int Orthop 2026 and JSES Int 2026, the near-track band in JSES Rev Rep Tech 2026. It measures bipolar bone loss; the choice of stabilization is a clinical decision.',
  };
}
