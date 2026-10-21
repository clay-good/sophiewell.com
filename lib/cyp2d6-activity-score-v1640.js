// spec-v1640 tool 2: the CYP2D6 activity score with copy numbers and tandems, by CPIC's tables (owner
// decision 12, October 15, 2026).
//
// Each allele as reported (*4, *10x2, *1x≥3, *36+*10) is a row in CPIC's allele table with its own
// activity value; a copy number is never multiplied here, so an allele and copy number CPIC does not
// list (*17x3) is refused. The pair is matched in CPIC's CYP2D6 rules, which give the score and the
// phenotype. When the report says a duplication is present without saying which allele carries it,
// both assignments are worked out and shown, and the result says the report does not decide between
// them. CPIC's table, not the 2020 consensus paper, is the source of each value: CPIC moved *9 and *41
// to 0.25 in November 2022.
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicIndex, footer, findAllele, matchRule } from './cpic-tables.js';

export const DUPLICATION = [
  { value: 'no', text: 'No duplication reported, or the report names the copy number' },
  { value: 'unknown', text: 'A duplication is reported, but not which allele' },
];
const NOTE = 'CPIC\'s activity value for each allele as reported, and CPIC\'s phenotype for the pair. It does not call alleles or copy number from raw data, and it does not say what to prescribe.';

function scorePair(ix, a, b) {
  const rule = matchRule(ix, 'CYP2D6', [a.value, b.value]);
  return rule ? { score: rule.score, phenotype: rule.result, desc: ix.str(rule.desc) } : null;
}

export function cyp2d6ActivityScore(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const ix = cpicIndex(db, now);
  if (!ix.ok) return { valid: false, message: `${ix.why} Use the phenotype printed on the lab report.` };
  const raw = [o.allele1, o.allele2].map((x) => String(x ?? '').trim());
  if (!raw[0] || !raw[1]) return { valid: false, message: 'Enter both CYP2D6 alleles as the lab report prints them. A blank allele is not read as *1.' };
  const dup = String(o.duplication ?? 'no').trim() || 'no';
  if (dup !== 'no' && dup !== 'unknown') return { valid: false, message: 'Say whether a duplication is reported without naming the allele.' };
  const rows = [];
  for (const name of raw) {
    const a = findAllele(ix, 'CYP2D6', name);
    if (!a) return { valid: false, message: `CPIC lists no activity value for CYP2D6 "${name}". A copy number counts only where CPIC lists that allele with it (for example *1x2, *4x2, *10x2, *1x≥3).` };
    rows.push(a);
  }
  const unassigned = rows.find((a) => !a.value);
  if (unassigned) return { valid: false, message: `CPIC has not assigned an activity value to CYP2D6 ${unassigned.name}, so no score is given.` };
  const base = { valid: true, gene: 'CYP2D6', edition: ix.edition };
  const line = (a) => `${a.name}: ${a.fn || 'no function assigned'}, activity value ${a.value}.`;
  if (dup === 'unknown') {
    if (rows.some((a) => /x/.test(a.name))) return { valid: false, message: 'An allele entered already names its copy number; choose "No duplication reported, or the report names the copy number".' };
    const options = [];
    for (const i of [0, 1]) {
      const dupd = findAllele(ix, 'CYP2D6', `${rows[i].name}x2`);
      const pair = i === 0 ? [dupd, rows[1]] : [rows[0], dupd];
      const label = pair.every(Boolean) ? `${pair[0].name}/${pair[1].name}` : `${i === 0 ? `${rows[0].name}x2/${rows[1].name}` : `${rows[0].name}/${rows[1].name}x2`}`;
      const s = pair.every(Boolean) && pair.every((a) => a.value) ? scorePair(ix, pair[0], pair[1]) : null;
      options.push({ diplotype: label, ...(s ? { activityScore: s.score === 'n/a' ? null : s.score, phenotype: s.phenotype } : { activityScore: null, phenotype: null }) });
    }
    const notes = [line(rows[0]), line(rows[1]), ...options.map((x) => (x.phenotype ? `If the duplication is on ${x.diplotype.includes(`${rows[0].name}x2`) ? rows[0].name : rows[1].name}: ${x.diplotype}, ${x.activityScore === null ? 'no activity score' : `activity score ${x.activityScore}`}, ${x.phenotype}.` : `${x.diplotype}: CPIC lists no activity value for that duplicated allele.`)),
      'The report does not say which allele is duplicated, so it does not decide between these.', footer(ix)];
    const same = options.every((x) => x.phenotype && x.phenotype === options[0].phenotype && x.activityScore === options[0].activityScore);
    return { ...base, options, ambiguous: !same, flag: same ? 'phenotype' : 'ambiguous-duplication',
      band: same ? `CYP2D6 ${rows[0].name}/${rows[1].name} with a duplication: ${options[0].activityScore === null ? 'no activity score' : `activity score ${options[0].activityScore}`}, ${options[0].phenotype}, whichever allele is duplicated.` : `CYP2D6 ${rows[0].name}/${rows[1].name} with a duplication: ${options.map((x) => (x.phenotype ? `${x.diplotype} ${x.activityScore === null ? '' : `${x.activityScore} `}(${x.phenotype})` : `${x.diplotype} not listed`)).join(' or ')}. The report does not say which.`,
      bandLabel: same ? options[0].phenotype : 'Depends on which allele', notes, note: NOTE };
  }
  const s = scorePair(ix, rows[0], rows[1]);
  const notes = [line(rows[0]), line(rows[1])];
  if (!s) {
    notes.push('CPIC has no rule for this pair of values.', footer(ix));
    return { ...base, activityScore: null, phenotype: null, flag: 'no-rule', band: `CYP2D6 ${rows[0].name}/${rows[1].name}: CPIC has no rule for this pair.`, bandLabel: 'No CPIC rule', notes, note: NOTE };
  }
  if (s.desc) notes.push(`CPIC: "${s.desc}"`);
  notes.push(footer(ix));
  const score = s.score === 'n/a' ? null : s.score;
  return { ...base, activityScore: score, phenotype: s.phenotype, flag: s.phenotype === 'Indeterminate' ? 'indeterminate' : 'phenotype',
    band: `CYP2D6 ${rows[0].name}/${rows[1].name}: ${score ? `activity score ${score}, ` : ''}${s.phenotype}.`, bandLabel: s.phenotype, notes, note: NOTE };
}
