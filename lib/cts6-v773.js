// spec-v773: CTS-6 clinical diagnostic score for carpal tunnel syndrome.
//
// Source:
//   Graham B, Regehr G, Naglie G, Wright JG. Development and validation of
//   diagnostic criteria for carpal tunnel syndrome. J Hand Surg Am.
//   2006;31(6):919-924. (PMID 16843150.)
//
// Six weighted findings, summed (maximum 26.0):
//   Numbness predominantly or exclusively in the median nerve territory  3.5
//   Nocturnal numbness                                                   4.0
//   Thenar atrophy and/or weakness                                       5.0
//   Positive Phalen test                                                 5.0
//   Loss of 2-point discrimination                                       4.5
//   Positive Tinel sign                                                  4.0
//
// Interpretation: a total above 12 corresponds to roughly an 80 percent
// probability of carpal tunnel syndrome; a total above 5 to roughly 25 percent.
//
// Pure: no DOM, no clock, no network.

export const CTS6_NOTE = 'CTS-6, the six-item clinical diagnostic score for carpal tunnel syndrome (Graham B, Regehr G, Naglie G, Wright JG, J Hand Surg Am 2006;31(6):919-924). It sums six weighted findings: numbness mainly in the median nerve territory (3.5), numbness at night (4), thenar atrophy or weakness (5), a positive Phalen test (5), loss of 2-point discrimination (4.5), and a positive Tinel sign (4), for a maximum of 26. A total above 12 corresponds to roughly an 80 percent probability of carpal tunnel syndrome and a total above 5 to roughly 25 percent. It estimates the probability of a clinical diagnosis; it is not a nerve conduction study, not a severity grade, and not an order for splinting, injection or surgery.';

const ITEMS = [
  { arg: 'medianNumbness', points: 3.5, text: 'numbness mainly in the median nerve territory' },
  { arg: 'nocturnalNumbness', points: 4, text: 'numbness at night' },
  { arg: 'thenarAtrophy', points: 5, text: 'thenar atrophy or weakness' },
  { arg: 'phalen', points: 5, text: 'positive Phalen test' },
  { arg: 'twoPointLoss', points: 4.5, text: 'loss of 2-point discrimination' },
  { arg: 'tinel', points: 4, text: 'positive Tinel sign' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function cts6(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const factors = [];
  for (const it of ITEMS) {
    if (truthy(o[it.arg])) { total += it.points; factors.push(`${it.text} (${it.points})`); }
  }
  total = Math.round(total * 10) / 10;

  let tier, label, probability;
  if (total > 12) { tier = 'high'; label = 'high likelihood of carpal tunnel syndrome'; probability = 'about 80%'; }
  else if (total > 5) { tier = 'intermediate'; label = 'intermediate likelihood'; probability = 'about 25% at a score just above 5, rising with the total'; }
  else { tier = 'low'; label = 'lower likelihood'; probability = 'below about 25%'; }

  const shown = Number.isInteger(total) ? String(total) : total.toFixed(1);

  return {
    valid: true,
    score: total,
    tier,
    abnormal: total > 12,
    factors,
    probability,
    bandLabel: `CTS-6 ${shown} of 26`,
    band: `CTS-6 ${shown} of 26 — ${label}.`,
    detail: 'Weights: median-territory numbness 3.5, nocturnal numbness 4, thenar atrophy or weakness 5, positive Phalen test 5, loss of 2-point discrimination 4.5, positive Tinel sign 4. Maximum 26. Above 12 is roughly an 80 percent probability; above 5 is roughly 25 percent.',
    note: CTS6_NOTE,
  };
}
