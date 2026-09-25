// spec-v1450: Cognard classification of intracranial dural arteriovenous fistulas (DAVF).
//
// Sources, read 2026-09-25:
//   Cognard C, Gobin YP, Pierot L, et al. Cerebral dural arteriovenous fistulas: clinical and
//     angiographic correlation with a revised classification of venous drainage. Radiology
//     1995;194(3):671-680 (PubMed 7862961) -- the classification.
//   The types, stated identically in two open reviews (J Cerebrovasc Endovasc Neurosurg
//     2022;24(3):203, PMC9537653; 2023;25(2):117, PMC10318241): I drainage into a sinus with
//     antegrade flow; IIa into a sinus, sinus reflux only; IIb into a sinus, cortical vein reflux
//     only; IIa+b sinus and cortical vein reflux; III direct drainage into a cortical vein without
//     venous ectasia; IV with venous ectasia; V drainage into spinal perimedullary veins.
//   Risk (PMC9537653): "DAVFs without CVD (Borden type I, Cognard type I, IIa) have benign natural
//     history"; "The presence of CVD (Borden types II and III, Cognard types IIb-V) indicates an
//     aggressive feature with an annual incidence of hemorrhage of 8% and non-hemorrhagic
//     neurological deficit of 6-15%"; "Rebleeding rate in DAVFs with CVD reaches up to 35%".
//
// The type is derived from the angiographic findings. Pure: no DOM, no clock, no network.

export const COGNARD_DRAINAGE = [
  { value: 'sinus', text: 'Into a dural sinus' },
  { value: 'cortical', text: 'Directly into a cortical vein' },
  { value: 'spinal', text: 'Into spinal perimedullary veins' },
];
export const COGNARD_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const WORDS = {
  I: 'drainage into a sinus with antegrade flow',
  IIa: 'drainage into a sinus with reflux into the sinus only',
  IIb: 'drainage into a sinus with reflux into cortical veins only',
  'IIa+b': 'drainage into a sinus with reflux into the sinus and cortical veins',
  III: 'direct drainage into a cortical vein, without venous ectasia',
  IV: 'direct drainage into a cortical vein, with venous ectasia',
  V: 'drainage into spinal perimedullary veins',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function cognardDavf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const drainage = pick(COGNARD_DRAINAGE, o.drainage);
  if (!drainage) return { valid: false, message: 'Choose where the fistula drains: a sinus, a cortical vein directly, or spinal perimedullary veins.' };
  let type;
  if (drainage === 'sinus') {
    const sinusReflux = pick(COGNARD_YES_NO, o.sinusReflux);
    const corticalReflux = pick(COGNARD_YES_NO, o.corticalReflux);
    const missing = [];
    if (!sinusReflux) missing.push('retrograde flow within the sinus');
    if (!corticalReflux) missing.push('reflux into cortical veins');
    if (missing.length) return { valid: false, message: `For sinus drainage, answer ${missing.join(' and ')}.` };
    if (sinusReflux === 'yes' && corticalReflux === 'yes') type = 'IIa+b';
    else if (corticalReflux === 'yes') type = 'IIb';
    else if (sinusReflux === 'yes') type = 'IIa';
    else type = 'I';
  } else if (drainage === 'cortical') {
    const ectasia = pick(COGNARD_YES_NO, o.ectasia);
    if (!ectasia) return { valid: false, message: 'For direct cortical drainage, answer whether there is venous ectasia.' };
    type = ectasia === 'yes' ? 'IV' : 'III';
  } else {
    type = 'V';
  }
  const cvd = !(type === 'I' || type === 'IIa');
  return {
    valid: true,
    abnormal: cvd,
    type,
    corticalVenousDrainage: cvd,
    band: `Cognard type ${type}: ${WORDS[type]}. ${cvd
      ? 'Cortical venous drainage is present, the aggressive group (about 8% annual hemorrhage in the source review).'
      : 'No cortical venous drainage: the group with a benign natural history.'}`,
    bandLabel: `Type ${type}`,
    notes: [
      cvd
        ? 'With cortical venous drainage, the review reports a non-hemorrhagic neurological deficit rate of 6% to 15% a year and rebleeding up to 35%; whether symptoms are present may refine the risk further.'
        : 'Types I and IIa correspond to Borden type I.',
    ],
    note: 'Cognard C et al, Radiology 1995; types and risk as given in two open reviews (J Cerebrovasc Endovasc Neurosurg 2022 and 2023). The type does not choose the treatment.',
  };
}
