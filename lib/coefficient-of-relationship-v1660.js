// spec-v1660 tool 5: coefficient of relationship and inbreeding for a consanguineous couple (Wright).
//
// Source: Wright S. Coefficients of inbreeding and relationship. Am Nat 1922;56:330-338, read October 19, 2026
// in the public-domain copy at archive.org (jstor-2456273): the coefficient of inbreeding is a sum over
// "every line by which the parents are connected, each line tracing back from the sire to a common ancestor
// and thenceforward to the dam, and passing through no individual more than once"; "If the ancestor (A) is
// not inbred, the component for the given path is simply (1/2)^(n+n'+1) where n and n' are the number of
// generations from sire and dam respectively to the ancestor"; and F is "the departure from the amount of
// homozygosis under random mating toward complete homozygosis". The relationships below are lists of
// (n, n') paths, so their F is computed from that rule, never typed: first cousins two paths of (2, 2), F =
// 1/16. With an allele frequency q, the affected frequency in the offspring is q² + F·q(1 − q).
//
// Pure: no DOM, no clock, no network.

import { probability, oneIn } from './bayes-table.js';

// [value, label, paths as [n, n'] through each non-inbred common ancestor]
export const RELATIONSHIPS = [
  ['half-siblings', 'Half-siblings', [[1, 1]]],
  ['uncle-niece', 'Uncle and niece, or aunt and nephew', [[1, 2], [1, 2]]],
  ['double-first-cousins', 'Double first cousins', [[2, 2], [2, 2], [2, 2], [2, 2]]],
  ['first-cousins', 'First cousins', [[2, 2], [2, 2]]],
  ['first-cousins-once-removed', 'First cousins once removed', [[2, 3], [2, 3]]],
  ['half-first-cousins', 'Half first cousins', [[2, 2]]],
  ['second-cousins', 'Second cousins', [[3, 3], [3, 3]]],
];

// The picker's options: each relationship, then the reader's own paths.
export const RELATIONSHIP_OPTIONS = [...RELATIONSHIPS.map(([value, text]) => ({ value, text })), { value: 'custom', text: 'Enter the paths' }];

const frac = (x) => {
  const d = Math.round(1 / x);
  return Math.abs(1 / d - x) < 1e-12 ? `1/${d}` : String(Number(x.toPrecision(4)));
};

// "2, 2" per line: generations from each partner to a common, non-inbred ancestor.
export function parsePaths(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length !== 2 || !c.every((x) => /^\d+$/.test(x)) || c.some((x) => Number(x) < 1 || Number(x) > 20)) return { error: `Line ${i + 1} needs the generations from each partner to the common ancestor, 1 to 20, such as 2, 2.` };
    out.push([Number(c[0]), Number(c[1])]);
  }
  return { paths: out };
}

export function coefficientOfRelationship(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let paths;
  let label;
  if (o.relationship === 'custom') {
    const p = parsePaths(o.paths);
    if (p.error) return { valid: false, message: p.error };
    if (!p.paths.length) return { valid: false, message: 'Enter one line per path to a common ancestor: the generations from each partner.' };
    paths = p.paths;
    label = 'The paths entered';
  } else {
    const rel = RELATIONSHIPS.find((x) => x[0] === o.relationship);
    if (!rel) return { valid: false, message: 'Choose the relationship, or choose to enter the paths.' };
    [, label, paths] = rel;
  }
  const F = paths.reduce((s, [n, m]) => s + 0.5 ** (n + m + 1), 0);
  const r = 2 * F;
  const notes = [`${paths.length} path${paths.length === 1 ? '' : 's'}: ${paths.map(([n, m]) => `(1/2)^(${n}+${m}+1)`).join(' + ')} = ${frac(F)}.`];
  if (String(o.alleleFrequency ?? '').trim() !== '') {
    const q = probability('the allele frequency', o.alleleFrequency);
    if (q.message) return { valid: false, message: q.message };
    const aff = q.value ** 2 + F * q.value * (1 - q.value);
    notes.push(`With allele frequency ${Number(q.value.toPrecision(4))}: affected q² + F·q(1 − q) = ${Number(aff.toPrecision(4))} (${oneIn(aff)}), against q² = ${Number((q.value ** 2).toPrecision(4))} (${oneIn(q.value ** 2)}) without the relationship.`);
  } else {
    notes.push('Choose an allele frequency for a recessive condition to see its risk to the offspring with and without the relationship.');
  }
  return {
    valid: true, inbreeding: F, relationship: r, abnormal: false,
    band: `${label}: inbreeding coefficient of the child F = ${frac(F)}; coefficient of relationship of the couple r = ${frac(r)}.`,
    bandLabel: `F = ${frac(F)}`,
    notes,
    note: 'Wright\'s rule for common ancestors who are not themselves inbred. A relationship not listed needs its paths entered; the tool does not guess them.',
  };
}
