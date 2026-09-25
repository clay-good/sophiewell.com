// spec-v1449: Collin classification of massive rotator cuff tears.
//
// Sources, read 2026-09-24:
//   Collin P, Matsumura N, Ladermann A, Denard PJ, Walch G. Relationship between massive chronic
//     rotator cuff tear pattern and loss of active shoulder range of motion. J Shoulder Elbow Surg
//     2014;23(8):1195-1202 -- the classification.
//   Ladermann A, Burkhart SS, Hoffmeyer P, et al. Classification of full-thickness rotator cuff
//     lesions: a review. EFORT Open Rev 2016;1(12):420-430 (PMC5367545): "the rotator cuff is
//     divided into five components: supraspinatus; superior subscapularis; inferior subscapularis;
//     infraspinatus; and teres minor"; "type A, supraspinatus and superior subscapularis tears; type
//     B, supraspinatus and entire subscapularis tears; type C, supraspinatus, superior subscapularis,
//     and infraspinatus tears; type D, supraspinatus and infraspinatus tears; and type E,
//     supraspinatus, infraspinatus, and teres minor tears"; it "subclassifies massive tears" and "has
//     also been linked to function, particularly the maintenance of active elevation".
//
// The type is derived from which of the five components are torn; any other combination fits no
// type and is reported as such. Pure: no DOM, no clock, no network.

export const COLLIN_YES_NO = [
  { value: 'yes', text: 'Torn' },
  { value: 'no', text: 'Intact' },
];

const PARTS = [
  ['ssp', 'supraspinatus'],
  ['ssc', 'superior subscapularis'],
  ['isc', 'inferior subscapularis'],
  ['isp', 'infraspinatus'],
  ['tm', 'teres minor'],
];

// Each type as the exact set of torn components.
const TYPES = {
  A: ['ssp', 'ssc'],
  B: ['ssp', 'ssc', 'isc'],
  C: ['ssp', 'ssc', 'isp'],
  D: ['ssp', 'isp'],
  E: ['ssp', 'isp', 'tm'],
};

export function collinRc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = PARTS.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no').map(([, label]) => label);
  if (missing.length) return { valid: false, message: `Choose torn or intact for every component: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed.` };
  const torn = PARTS.filter(([k]) => o[k] === 'yes').map(([k]) => k);
  const label = (keys) => {
    const names = keys.map((k) => PARTS.find(([p]) => p === k)[1]);
    return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  };
  const key = torn.slice().sort().join(',');
  const type = Object.keys(TYPES).find((t) => TYPES[t].slice().sort().join(',') === key) || null;
  if (!torn.length) {
    return { valid: true, abnormal: false, type: null, band: 'No component torn: nothing to classify.', bandLabel: 'No tear', notes: [], note: NOTE };
  }
  if (!type) {
    return {
      valid: true,
      abnormal: true,
      type: null,
      band: `No Collin type: the torn components (${label(torn)}) match none of the five patterns, each of which is the supraspinatus with one or two of the others.`,
      bandLabel: 'No single type',
      notes: ['Collin types describe massive tears; a smaller tear is described by its size and tendon instead.'],
      note: NOTE,
    };
  }
  return {
    valid: true,
    abnormal: true,
    type,
    band: `Collin type ${type}: massive tear of the ${label(torn)}.`,
    bandLabel: `Type ${type}`,
    notes: ['The pattern has been linked to shoulder function, particularly whether active elevation is kept; the type does not choose the treatment.'],
    note: NOTE,
  };
}

const NOTE = 'Collin P et al, J Shoulder Elbow Surg 2014; types as given in Ladermann A et al, EFORT Open Rev 2016.';
