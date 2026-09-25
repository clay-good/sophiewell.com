// spec-v1488: the Nordland-Tarnow classification of interdental papilla loss, beside the Jemt index.
//
// Sources, read 2026-09-25:
//   Nordland WP, Tarnow DP. A classification system for loss of papillary height. J Periodontol.
//     1998;69(10):1124-1126 (the original).
//   Classes as tabulated in Clin Oral Investig 2026 (PMC13451298), Table 1: "Normal: the interdental
//     papilla fills the embrasure space to the apical extent of the interdental contact point / area.
//     Class I: the tip of the interdental papilla is located between the interdental contact point and
//     the most coronal extent of the cemento-enamel junction (CEJ) (space present but interproximal CEJ
//     is not visible). Class II: the tip of the interdental papilla is located at or apical to the
//     interdental CEJ, but coronal to the apical extent of the facial CEJ (interproximal CEJ is
//     visible). Class III: the tip of the interdental papilla is located even or apical to the facial
//     CEJ."
//
// The class is derived from three landmark findings, asked in order. Pure: no DOM, no clock.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const CLASSES = {
  Normal: 'the papilla fills the embrasure up to the contact point',
  'Class I': 'the papilla tip lies between the contact point and the interproximal cementoenamel junction, which is not visible',
  'Class II': 'the papilla tip lies at or apical to the interproximal cementoenamel junction, but coronal to the facial cementoenamel junction',
  'Class III': 'the papilla tip lies level with or apical to the facial cementoenamel junction',
};
const yn = (v) => (v === 'yes' || v === 'no' ? v : null);

export function nordlandTarnowPapilla(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const space = yn(o.space);
  const interCej = yn(o.interproximalCej);
  const facial = yn(o.facialCej);
  if (!space) return { valid: false, message: 'Choose whether there is a space between the papilla tip and the contact point.' };
  let cls;
  if (space === 'no') {
    if (interCej === 'yes' || facial === 'yes') return { valid: false, message: 'Choose again: a papilla that fills the embrasure leaves no cementoenamel junction visible.' };
    cls = 'Normal';
  } else if (!interCej) {
    return { valid: false, message: 'Choose whether the interproximal cementoenamel junction is visible.' };
  } else if (interCej === 'no') {
    if (facial === 'yes') return { valid: false, message: 'Choose again: a tip at or below the facial cementoenamel junction leaves the interproximal junction visible.' };
    cls = 'Class I';
  } else if (!facial) {
    return { valid: false, message: 'Choose whether the papilla tip is level with or apical to the facial cementoenamel junction.' };
  } else {
    cls = facial === 'yes' ? 'Class III' : 'Class II';
  }
  return {
    valid: true,
    class: cls,
    abnormal: cls !== 'Normal',
    band: `Nordland-Tarnow ${cls}: ${CLASSES[cls]}.`,
    bandLabel: cls,
    notes: [
      'The three landmarks are the contact point, the interproximal cementoenamel junction and the facial cementoenamel junction.',
      'Where there is no contact point, as in a diastema, the classes cannot be applied as written.',
    ],
    note: 'Nordland WP, Tarnow DP, J Periodontol 1998; classes as tabulated in Clin Oral Investig 2026. It describes the papilla; it does not decide treatment.',
  };
}
