// spec-v1556 tool 5: Lonomia caterpillar contact: severity and antivenom (Brazil).
//
// Source: Brasil, Ministério da Saúde. Guia de Vigilância em Saúde, 6th ed. revised, vol. 3, 2024 (CC
// BY-NC-SA 4.0, facts restated; owner decision D3), "Acidentes por lepidópteros" and Quadro 5 (p. 1145,
// adapted from FUNASA 2001). Read October 6, 2026: mild, local signs only, no bleeding, normal clotting, no
// antivenom; moderate, local signs or not, abnormal clotting time, no bleeding or only skin or mucosal, 5
// vials of SALon; severe, abnormal clotting time with internal (visceral) bleeding, risk of death, 10 vials.
// Contact without bleeding or clotting abnormality: observe with laboratory checks for the first 24 hours,
// and give antivenom if bleeding or a clotting abnormality appears.
//
// Pure: no DOM, no clock.

export const CLOT_OPTIONS = [{ value: 'normal', text: 'Normal' }, { value: 'abnormal', text: 'Abnormal (prolonged or incoagulable)' }];
export const BLEED_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'skin', text: 'Skin or mucosa only' },
  { value: 'internal', text: 'Internal (visceral) bleeding' },
];

const NOTE = 'This follows Brazil\'s Guia de Vigilância em Saúde (2024), Quadro 5 (Lonomia, mainly southern Brazil). Vial counts are for Brazilian public antivenom.';

export function brazilLonomiaAntivenom(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const clot = CLOT_OPTIONS.find((x) => x.value === o.clotting);
  const bleed = BLEED_OPTIONS.find((x) => x.value === o.bleeding);
  if (!clot) return { valid: false, message: 'Choose the clotting time result: normal or abnormal. The class turns on it.' };
  if (!bleed) return { valid: false, message: 'Choose the bleeding: none, skin or mucosa only, or internal.' };
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (bleed.value === 'internal') return out('Severe Lonomia contact (internal bleeding, risk of death): 10 vials of SALon.', 'Severe: 10 vials', true);
  if (clot.value === 'abnormal') return out('Moderate Lonomia contact (abnormal clotting time, no internal bleeding): 5 vials of SALon.', 'Moderate: 5 vials', true);
  if (bleed.value === 'skin') {
    notes.push('Bleeding with a normal clotting time is not one of the printed classes: repeat the clotting test now.');
    return out('Skin or mucosal bleeding with a normal clotting time: not classed by Quadro 5. Repeat the clotting test; an abnormal result makes it moderate (5 vials).', 'Repeat the clotting test', true);
  }
  notes.push('If bleeding or a clotting abnormality appears in that time, give antivenom.');
  return out('Mild Lonomia contact (local signs only, normal clotting, no bleeding): no antivenom. Observe with clotting tests for the first 24 hours.', 'Mild: observe 24 h', false);
}
