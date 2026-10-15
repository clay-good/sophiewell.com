// spec-v1640 tool 3: a CYP2D6 activity score adjusted for an inhibitor, by the rule the CPIC opioid
// guideline states (owner decision 12, October 15, 2026).
//
// CPIC Guideline for CYP2D6, OPRM1 and COMT Genotypes and Select Opioid Therapy, Clin Pharmacol Ther
// 2021;110(4):888-896 (PMC8249478), re-read October 15, 2026: "For patients on strong CYP2D6 inhibitors,
// the CYP2D6 activity score is adjusted to 0 and the predicted phenotype is a poor metabolizer. For
// patients who are on moderate CYP2D6 inhibitors, the activity score is multiplied by 0.5 and then
// converted to the predicted phenotype". The rule is guideline prose, not in CPIC's database, so it is a
// dated value with a page watch (route B). The phenotype bands are the consensus definitions of Caudle et
// al., Clin Transl Sci 2020 (PMC6951851): 0 poor; above 0 and under 1.25 intermediate; 1.25 to 2.25
// normal; above 2.25 ultrarapid.
//
// The rule is not general: the 2023 CPIC serotonin reuptake inhibitor guideline (PMC10564324, re-read
// October 15, 2026) says "Consensus approaches for adjusting CYP2D6, CYP2C19, or CYP2B6 predicted
// phenotypes in the presence of inhibitors or inducers have not been established". Every result prints
// that sentence and says the adjusted score is for codeine, tramadol and hydrocodone only. The strength of
// the inhibitor is the reader's input: no drug is classified here. There is no inducer option (the
// guideline: "There does not appear to be any clinically relevant induction of CYP2D6 activity by any
// medications").
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { datedValue } from './dated-data.js';

export const DATED_PHENOCONVERSION = {
  'cpic-opioid-cyp2d6-inhibitor': { edition: 'CPIC opioid guideline (2021)', validThrough: '2027-10-15', route: 'B', readOn: '2026-10-15', source: { label: 'CPIC Guideline for CYP2D6, OPRM1, and COMT Genotypes and Select Opioid Therapy (2021)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8249478/' }, values: { strong: 0, moderate: 0.5 } },
};
export const STRENGTHS = [
  { value: 'none', text: 'None' },
  { value: 'weak', text: 'Weak inhibitor' },
  { value: 'moderate', text: 'Moderate inhibitor' },
  { value: 'strong', text: 'Strong inhibitor' },
];
const EXAMPLES = 'FDA\'s examples (not a complete list): strong CYP2D6 inhibitors bupropion, fluoxetine, paroxetine, quinidine and terbinafine; moderate ones abiraterone, cinacalcet, duloxetine, lorcaserin, mirabegron and rolapitant.';
const SSRI = 'The 2023 CPIC serotonin reuptake inhibitor guideline: "Consensus approaches for adjusting CYP2D6, CYP2C19, or CYP2B6 predicted phenotypes in the presence of inhibitors or inducers have not been established".';
const NOTE = 'The CPIC opioid guideline\'s rule, applied to the score and the inhibitor strength you entered. It is stated for codeine, tramadol and hydrocodone, not for other CYP2D6 drugs, and the inhibitor\'s strength is yours to judge (FDA\'s list gives examples, not a complete list).';

const band = (x) => (x === 0 ? 'Poor Metabolizer' : x < 1.25 ? 'Intermediate Metabolizer' : x <= 2.25 ? 'Normal Metabolizer' : 'Ultrarapid Metabolizer');
const show = (x) => Number(x.toFixed(3)).toString();

export function cyp2d6Phenoconversion(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the CYP2D6 activity score', o.activityScore, 0, 8, '']]);
  if (f) return { valid: false, message: f };
  const score = Number(o.activityScore);
  if (Math.abs(score * 4 - Math.round(score * 4)) > 1e-9) return { valid: false, message: 'Enter the activity score from the report or the activity-score tool; CYP2D6 scores step by 0.25.' };
  const strength = String(o.inhibitor ?? '').trim();
  if (!STRENGTHS.some((s) => s.value === strength)) return { valid: false, message: 'Choose the strength of the CYP2D6 inhibitor the patient takes, or none.' };
  const v = datedValue('cpic-opioid-cyp2d6-inhibitor', 'moderate', now instanceof Date ? now : undefined, DATED_PHENOCONVERSION);
  if (v.expired) return { valid: false, message: `The ${v.edition} rule is past its check date. Read the rule in ${v.source.label} and apply it by hand.` };
  const before = band(score);
  let after = score; let rule;
  if (strength === 'strong') { after = 0; rule = 'Strong inhibitor: the guideline sets the activity score to 0, a poor metabolizer.'; }
  else if (strength === 'moderate') { after = score * v.value; rule = `Moderate inhibitor: the guideline multiplies the score by 0.5 (${show(score)} × 0.5 = ${show(after)}) and converts it to a phenotype.`; }
  else rule = strength === 'weak' ? 'Weak inhibitor: the guideline states a rule for strong and moderate inhibitors only, so the score is not changed.' : 'No inhibitor: the score is not changed.';
  const ph = band(after);
  const notes = [`Genotype: activity score ${show(score)}, ${before}.`, rule, `Adjusted: activity score ${show(after)}, ${ph}.`];
  const offGrid = Math.abs(after * 4 - Math.round(after * 4)) > 1e-9;
  if (offGrid) notes.push(`${show(after)} is not a score in CPIC's tables, which step by 0.25, so CPIC recommendations keyed by score do not apply to it; the phenotype band does.`);
  notes.push('The adjusted score is for the opioid guideline\'s drugs: codeine, tramadol and hydrocodone.', EXAMPLES, SSRI, `Rule: ${v.source.label}.`);
  return { valid: true, genotypeScore: score, genotypePhenotype: before, adjustedScore: Number(show(after)), adjustedPhenotype: ph, offGrid, changed: ph !== before,
    abnormal: ph !== before, flag: ph !== before ? 'phenoconverted' : 'unchanged', labelLinks: [{ text: v.source.label, url: v.source.url }],
    band: `Adjusted CYP2D6 activity score ${show(after)}: ${ph}${ph !== before ? ` (genotype alone: ${show(score)}, ${before})` : ', unchanged from the genotype'}.`, bandLabel: ph, notes, note: NOTE };
}
