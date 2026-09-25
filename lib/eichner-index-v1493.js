// spec-v1493: the Eichner index of occlusal support, beside the Kennedy classification.
//
// Sources, read 2026-09-25:
//   Eichner K. Uber eine Gruppeneinteilung der Luckengebisse fur die Prothetik. Dtsch Zahnarztl Z.
//     1955;10:1831-1834 (the original).
//   The groups as stated in J Nutr Health Aging 2018 (PMC12880510): "Class A contains 4 support zones;
//     which means there is a minimum of one tooth in contact between the maxilla and the mandible in
//     both the pre-molar and molar regions in each side. Class B contains 3 (B1), 2 (B2) or 1 (B3)
//     support zones, or support in the anterior area only (B4). In class C, there are no antagonist
//     contacts."
//   The subgroups as tabulated in J Oral Rehabil 2026 (PMC13168836): A1 all teeth present; A2 missing
//     teeth in one arch; A3 missing teeth in both arches; C1 few teeth in both arches; C2 teeth in one
//     arch only; C3 completely edentulous.
//
// Derived from the number of posterior support zones and, where it decides, one more finding.
// Pure: no DOM, no clock.

export const ZONES = [
  { value: '4', text: '4: premolar and molar contact on both sides' },
  { value: '3', text: '3 zones' },
  { value: '2', text: '2 zones' },
  { value: '1', text: '1 zone' },
  { value: '0', text: '0: no premolar or molar contact' },
];
export const MISSING = [
  { value: 'none', text: 'No teeth missing' },
  { value: 'one', text: 'Teeth missing in one arch' },
  { value: 'both', text: 'Teeth missing in both arches' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const ARCHES = [
  { value: 'both', text: 'Teeth in both arches, not in contact' },
  { value: 'one', text: 'Teeth in one arch only' },
  { value: 'none', text: 'Edentulous' },
];

const TEXT = {
  A1: 'four support zones with all teeth present',
  A2: 'four support zones with teeth missing in one arch',
  A3: 'four support zones with teeth missing in both arches',
  B1: 'three posterior support zones',
  B2: 'two posterior support zones',
  B3: 'one posterior support zone',
  B4: 'contact in the anterior region only',
  C1: 'teeth in both arches without any contact between them',
  C2: 'teeth in one arch only',
  C3: 'completely edentulous',
};
const pick = (v, list) => (list.some((x) => x.value === v) ? v : null);

export function eichnerIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const zones = pick(o.zones, ZONES);
  if (!zones) return { valid: false, message: 'Choose the number of posterior support zones in contact (0 to 4).' };
  let g;
  if (zones === '4') {
    const m = pick(o.missing, MISSING);
    if (!m) return { valid: false, message: 'Choose whether teeth are missing in neither, one or both arches.' };
    g = { none: 'A1', one: 'A2', both: 'A3' }[m];
  } else if (zones !== '0') {
    g = `B${4 - Number(zones)}`;
  } else {
    const ant = pick(o.anterior, YES_NO);
    if (!ant) return { valid: false, message: 'Choose whether the anterior teeth are in contact.' };
    if (ant === 'yes') g = 'B4';
    else {
      const a = pick(o.arches, ARCHES);
      if (!a) return { valid: false, message: 'Choose whether there are teeth in both arches, one arch or neither.' };
      g = { both: 'C1', one: 'C2', none: 'C3' }[a];
    }
  }
  const cls = g[0];
  return {
    valid: true,
    group: g,
    abnormal: cls !== 'A',
    band: `Eichner ${g}: ${TEXT[g]}. ${cls === 'A' ? 'Class A: occlusal support in all four zones.' : cls === 'B' ? 'Class B: occlusal support partly lost.' : 'Class C: no contact between the arches.'}`,
    bandLabel: `Eichner ${g}`,
    notes: [
      'The four support zones are the premolar and molar regions on each side; a zone counts when at least one tooth in it meets an opposing tooth.',
      'The studies differ on which restorations count: one counts fixed restorations, another leaves out bridge pontics and implant crowns.',
    ],
    note: 'Eichner K, Dtsch Zahnarztl Z 1955; groups as stated in J Nutr Health Aging 2018 and J Oral Rehabil 2026. It describes occlusal support; it does not decide treatment.',
  };
}
