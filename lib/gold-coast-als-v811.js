// spec-v811: Gold Coast criteria for the diagnosis of ALS (Shefner 2020).
//
// Sources:
//   Shefner JM, Al-Chalabi A, Baker MR, et al. A proposal for new diagnostic criteria for
//     ALS. Clin Neurophysiol. 2020;131(8):1975-1978. (The Gold Coast criteria, from the 2019
//     Gold Coast consortium of the IFCN and WFN.)
//   Hannaford A, Vucic S, van den Bos M, et al. Diagnostic accuracy / recent developments in
//     consensus diagnostic criteria for ALS. (Multicentre sensitivity: Gold Coast 92%,
//     revised El Escorial 88.6%, Awaji 90.3%.)
//
// ALL THREE are required:
//   1. progressive motor impairment documented by history or repeated clinical assessment,
//      preceded by normal motor function
//   2. EITHER upper- and lower-motor-neuron dysfunction in at least one body region, WITH
//      BOTH IN THE SAME REGION, OR lower-motor-neuron dysfunction in at least two body regions
//   3. investigations excluding other diseases
//
// Requirement 2 is why this tile takes the regions one at a time rather than two counts.
// "UMN somewhere and LMN somewhere" is NOT the rule. Upper-motor-neuron signs in the bulbar
// region with lower-motor-neuron signs in the lumbosacral region satisfy neither limb: the
// first limb needs them together in one region, and the second limb needs LMN in two. A
// tool that counted UMN regions and LMN regions separately would call that met.
//
// The other thing this tile carries: Gold Coast ABOLISHED the diagnostic certainty
// categories. There is no "definite", "probable" or "possible" ALS here. Those belonged to
// the revised El Escorial and Awaji frameworks, and the consortium's stated reason for
// dropping them is that they increased uncertainty for patients and clinicians and cost
// sensitivity. The answer is met or not met.
//
// Pure: no DOM, no clock, no network.

export const GOLD_COAST_NOTE = 'The Gold Coast criteria (Shefner JM, Al-Chalabi A, Baker MR, et al, Clin Neurophysiol 2020;131(8):1975-1978) diagnose amyotrophic lateral sclerosis when all three of the following hold: progressive motor impairment documented by history or repeated clinical assessment and preceded by normal motor function; either upper- and lower-motor-neuron dysfunction in at least one body region with both in that same region, or lower-motor-neuron dysfunction in at least two body regions; and investigations excluding other diseases. The four body regions are bulbar, cervical, thoracic and lumbosacral. Two points are easy to get wrong. Upper-motor-neuron signs in one region and lower-motor-neuron signs in a different region satisfy neither limb of the second requirement, so the regions have to be considered one at a time rather than counted separately. And the Gold Coast criteria deliberately abolished the definite, probable and possible categories used by the revised El Escorial and Awaji criteria, on the grounds that they increased uncertainty and cost sensitivity; a multicentre comparison put Gold Coast sensitivity at 92 percent against 88.6 percent for revised El Escorial and 90.3 percent for Awaji. The answer is met or not met, and it applies criteria to findings already gathered rather than making the diagnosis.';

const REGIONS = [
  { key: 'bulbar', label: 'bulbar' },
  { key: 'cervical', label: 'cervical' },
  { key: 'thoracic', label: 'thoracic' },
  { key: 'lumbosacral', label: 'lumbosacral' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function goldCoastAls(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const progressive = truthy(o.progressiveMotorImpairment);
  const excluded = truthy(o.otherDiseasesExcluded);

  const regions = REGIONS.map((r) => ({
    label: r.label,
    umn: truthy(o[r.key + 'Umn']),
    lmn: truthy(o[r.key + 'Lmn']),
  }));

  // Limb one: UMN and LMN together IN THE SAME region.
  const bothSameRegion = regions.filter((r) => r.umn && r.lmn).map((r) => r.label);
  // Limb two: LMN in two or more regions, regardless of UMN.
  const lmnRegions = regions.filter((r) => r.lmn).map((r) => r.label);

  const limbOne = bothSameRegion.length >= 1;
  const limbTwo = lmnRegions.length >= 2;
  const distribution = limbOne || limbTwo;

  const met = progressive && distribution && excluded;

  const missing = [];
  if (!progressive) missing.push('documented progressive motor impairment preceded by normal motor function');
  if (!distribution) missing.push('either upper- and lower-motor-neuron dysfunction together in one region, or lower-motor-neuron dysfunction in two regions');
  if (!excluded) missing.push('investigations excluding other diseases');

  // The near-miss worth naming: signs in different regions, which looks like a match and is not.
  const umnRegions = regions.filter((r) => r.umn).map((r) => r.label);
  const splitOnly = !distribution && umnRegions.length > 0 && lmnRegions.length > 0;
  const splitNote = splitOnly
    ? `Upper-motor-neuron dysfunction (${umnRegions.join(', ')}) and lower-motor-neuron dysfunction (${lmnRegions.join(', ')}) are in different regions. That satisfies neither limb: the first needs both in the SAME region, the second needs lower-motor-neuron dysfunction in two.`
    : null;

  let basis = null;
  if (limbOne && limbTwo) basis = `both limbs: upper and lower motor neuron dysfunction together in the ${bothSameRegion.join(' and ')} region${bothSameRegion.length > 1 ? 's' : ''}, and lower motor neuron dysfunction in ${lmnRegions.length} regions`;
  else if (limbOne) basis = `upper and lower motor neuron dysfunction together in the ${bothSameRegion.join(' and ')} region${bothSameRegion.length > 1 ? 's' : ''}`;
  else if (limbTwo) basis = `lower motor neuron dysfunction in ${lmnRegions.length} regions (${lmnRegions.join(', ')})`;

  return {
    valid: true,
    criteriaMet: met,
    distributionMet: distribution,
    sameRegionRegions: bothSameRegion,
    lmnRegionCount: lmnRegions.length,
    basis,
    missing,
    splitNote,
    abnormal: met,
    bandLabel: met ? 'Gold Coast criteria met' : 'Gold Coast criteria not met',
    band: met
      ? `Gold Coast criteria met — all three requirements, on ${basis}.`
      : `Gold Coast criteria not met — still needed: ${missing.join('; ')}.`,
    detail: 'The Gold Coast criteria have no certainty categories. There is no definite, probable or possible ALS here: the revised El Escorial and Awaji frameworks used those, and the consortium dropped them because they increased uncertainty for patients and clinicians and cost sensitivity. A multicentre comparison put Gold Coast sensitivity at 92 percent against 88.6 percent for revised El Escorial and 90.3 percent for Awaji.',
    note: GOLD_COAST_NOTE,
  };
}
