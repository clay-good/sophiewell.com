// spec-v1454: the Powers ratio for anterior atlanto-occipital dissociation, from two midsagittal
// distances on a lateral radiograph or CT, with the basion-dens interval as an optional second
// measurement.
//
// Sources, read 2026-09-24:
//   Powers B, Miller MD, Kramer RS, Martinez S, Gehweiler JA Jr. Traumatic anterior atlanto-occipital
//     dislocation. Neurosurgery 1979;4(1):12-17 -- the original (not open access).
//   Rojas CA, Bertozzi JC, Martinez CR, Whitlow J. Reassessment of the craniocervical junction: normal
//     values on CT. AJNR Am J Neuroradiol 2007;28(9):1819-1823 (PMC8134200). It states the method:
//       "We calculated the Powers ratio by dividing the distance between the tip of the basion to the
//        spinolaminar line of the atlas by the distance from the tip of the opisthion to the midpoint
//        of the posterior aspect of the anterior arch of C1"
//     and the thresholds: "It is considered normal when the value is less than 1." Its Table 1, from
//     200 adults aged 20 to 40 on MDCT (normal value = the maximum for 97.5% of the population):
//       Powers ratio   MDCT normal < 0.9    plain radiograph normal < 1.0
//       BDI            MDCT normal < 8.5 mm plain radiograph normal < 12.0 mm
//       BAI            MDCT "Not reliable"  plain radiograph normal < 12.0 mm
//     Limits, verbatim: the ratio "is only sensitive in the evaluation of anterior atlanto-occipital
//     dissociation. A posterior dissociation or vertical distraction injury could result in a normal
//     value"; the opisthion "was only identifiable in 56% to 84% of patients" on lateral radiographs;
//     the spinolaminar line "is not present in congenital nonfusion of the posterior arches of the
//     atlas"; radiograph sensitivity "between 33% and 60%"; interexaminer reliability 0.87 (BDI 0.84).
//
// The basion-axial interval is left out: it is a signed distance whose lower normal bound this source
// does not state, and the source found it not reliable on CT.
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const POWERS_MODALITY = [
  { value: 'radiograph', text: 'Lateral radiograph' },
  { value: 'ct', text: 'CT (midsagittal reformat)' },
];

// Upper normal limits from Rojas 2007 Table 1: the ratio, and the basion-dens interval in mm.
const LIMIT = {
  radiograph: { ratio: 1.0, bdi: 12.0, where: 'on a plain radiograph' },
  ct: { ratio: 0.9, bdi: 8.5, where: 'on CT' },
};
const MAX_MM = 100;

const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function powersRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bcFault = inputFault([['basion to C1 spinolaminar line distance', o.bc, null, MAX_MM, 'mm']]);
  if (bcFault) return { valid: false, message: bcFault.startsWith('Enter') ? 'Enter the distance from the basion to the spinolaminar line of C1 (BC) in mm.' : bcFault };
  const oaFault = inputFault([['opisthion to C1 anterior arch distance', o.oa, null, MAX_MM, 'mm']]);
  if (oaFault) return { valid: false, message: oaFault.startsWith('Enter') ? 'Enter the distance from the opisthion to the anterior arch of C1 (OA) in mm.' : oaFault };
  const modality = POWERS_MODALITY.some((x) => x.value === o.modality) ? o.modality : null;
  if (!modality) return { valid: false, message: 'Choose whether the distances were measured on a lateral radiograph or on CT: the normal limits differ.' };

  let bdi = null;
  if (!blank(o.bdi)) {
    const bdiFault = inputFault([['basion-dens interval', o.bdi, null, MAX_MM, 'mm']]);
    if (bdiFault) return { valid: false, message: bdiFault };
    bdi = Number(String(o.bdi).trim());
  }

  const bc = Number(String(o.bc).trim());
  const oa = Number(String(o.oa).trim());
  // Read at the two decimals the reader sees, so a printed 0.90 is never called "below 0.9".
  const ratio = Math.round((bc / oa) * 100) / 100;
  const lim = LIMIT[modality];
  const above = ratio >= lim.ratio;
  const r = fmt(ratio);

  let band;
  if (ratio >= 1) {
    band = `Powers ratio ${r}: at or above 1, outside the normal range and consistent with anterior atlanto-occipital dissociation.`;
  } else if (above) {
    band = `Powers ratio ${r}: below 1, but at or above the CT normal value of 0.9, so above the range found in normal adults on CT.`;
  } else {
    band = `Powers ratio ${r}: below the normal limit of ${lim.ratio.toFixed(1)} ${lim.where}; this does not exclude a posterior or vertical distraction injury.`;
  }

  const notes = [];
  let bdiAbove = null;
  if (bdi === null) {
    notes.push('No basion-dens interval was entered; the ratio is read on its own.');
  } else {
    bdiAbove = bdi >= lim.bdi;
    notes.push(bdiAbove
      ? `Basion-dens interval ${bdi} mm: at or above the normal limit of ${lim.bdi} mm ${lim.where}.`
      : `Basion-dens interval ${bdi} mm: below the normal limit of ${lim.bdi} mm ${lim.where}.`);
    if (bdiAbove !== above) notes.push('The ratio and the basion-dens interval disagree; recheck the landmarks and read the two together.');
  }
  notes.push('The ratio is only sensitive to anterior dissociation: a posterior dissociation or a vertical distraction injury can give a normal value.');
  if (modality === 'radiograph') {
    notes.push('On lateral radiographs the opisthion was identifiable in only 56% to 84% of patients, and the ratio detected anterior dissociation in 33% to 60%.');
  } else {
    notes.push('The CT normal values come from 200 adults aged 20 to 40, and the Powers ratio itself showed no significant difference between CT and plain radiographs.');
  }
  notes.push('The spinolaminar line of C1 is absent in congenital nonfusion of the posterior arches of the atlas, and the ratio cannot then be measured.');

  return {
    valid: true,
    abnormal: above,
    ratio,
    bdi,
    bdiAbove,
    band,
    bandLabel: `Powers ratio ${r}`,
    notes,
    note: 'Powers B et al, Neurosurgery 1979; method, limits and normal values as tabulated by Rojas CA et al, AJNR Am J Neuroradiol 2007 (Table 1; interexaminer reliability 0.87 for the ratio, 0.84 for the basion-dens interval). '
      + 'The ratio is one measurement of the craniocervical junction; it is not a diagnosis, and it does not choose the treatment.',
  };
}
