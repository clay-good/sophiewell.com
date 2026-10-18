// spec-v1634 tool 22: Drug Interaction Probability Scale (DIPS).
//
// Source: Horn JR, Hansten PD, Chan LN. Proposal for a new tool to evaluate drug interaction cases. Ann
// Pharmacother. 2007;41:674-680 (not open). Built on the owner's rule of October 17, 2026 that a verified reprint
// is a source. The points for every answer were read in three open papers that print the full table with identical
// values: McGrane IR et al. Ment Health Clin 2021 (PMC8463003), Fan W et al. Anticancer Drugs 2024 (PMC10720802)
// and van Dijk LMM et al. Neuropediatrics 2024 (PMC11383621); the spec also lists Li Y et al. J Int Med Res 2023
// (PMC10467403). Bands: doubtful under 2, possible 2 to 4, probable 5 to 8, highly probable over 8 (PMC5605837,
// PMC11383621, PMC10712123). One case report (PMC10712123) scored "no" on alternative causes as 0; every full
// table gives +1, which is used.
//   Q1-Q4, Q10: yes +1, no -1. Q5: yes +1, no -2. Q6: yes +2, no -1. Q7 (alternative causes): yes -1, no +1.
//   Q8, Q9: yes +1, no 0. Unknown or not applicable: 0. With no dechallenge, Q5 is unknown and Q6 is skipped.
// Questions are the site's own short labels; the authors' wording is not reproduced.
//
// Pure: no DOM, no clock, no network.

export const ANSWERS = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'unknown', text: 'Unknown or not applicable' },
];
export const QUESTIONS = [
  ['reports', 'Previous credible reports of this interaction in humans', 1, -1],
  ['precipitant', 'Consistent with known properties of the precipitant drug', 1, -1],
  ['object', 'Consistent with known properties of the object drug', 1, -1],
  ['timeCourse', 'Consistent with the known or reasonable time course', 1, -1],
  ['dechallenge', 'Remitted on stopping the precipitant, object drug unchanged', 1, -2],
  ['rechallenge', 'Reappeared on restarting the precipitant', 2, -1],
  ['alternatives', 'Reasonable alternative causes for the event', -1, 1],
  ['levels', 'Object drug levels consistent with the interaction', 1, 0],
  ['objective', 'Other objective evidence of the effect on the object drug', 1, 0],
  ['doseResponse', 'Greater with a higher precipitant dose, or less with a lower one', 1, -1],
];
const NOTE = 'The Drug Interaction Probability Scale (Horn 2007), with the points as printed in three open reprints that agree. It grades how well one case supports an interaction; it is not a list of which drugs interact.';
const BAND = (s) => (s > 8 ? 'highly probable' : s >= 5 ? 'probable' : s >= 2 ? 'possible' : 'doubtful');

export function dipsInteraction(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ok = (v) => v === 'yes' || v === 'no' || v === 'unknown';
  const noDechallenge = o.dechallenge === 'unknown';
  const missing = QUESTIONS.filter(([k]) => !(k === 'rechallenge' && noDechallenge) && !ok(o[k])).map(([, q]) => q);
  if (missing.length) return { valid: false, message: `Answer each question (unknown counts as an answer); still unanswered: ${missing.length}.` };
  const notes = [];
  const lines = [];
  let score = 0;
  for (const [k, label, yes, no] of QUESTIONS) {
    if (k === 'rechallenge' && noDechallenge) { lines.push(`${label}: skipped, no dechallenge`); continue; }
    const p = o[k] === 'yes' ? yes : o[k] === 'no' ? no : 0;
    score += p;
    lines.push(`${label}: ${o[k]} (${p > 0 ? '+' : ''}${p})`);
  }
  if (noDechallenge && ok(o.rechallenge) && o.rechallenge !== 'unknown') notes.push('With no dechallenge the scale skips the rechallenge question, so that answer is not counted.');
  notes.push(`Points: ${lines.join('; ')}.`);
  notes.push('Bands: doubtful under 2, possible 2 to 4, probable 5 to 8, highly probable over 8.');
  const band = BAND(score);
  return {
    valid: true, score, category: band,
    band: `DIPS score ${score}: ${band} drug interaction.`,
    bandLabel: `${score}, ${band}`, abnormal: score >= 5, notes, note: NOTE,
  };
}
