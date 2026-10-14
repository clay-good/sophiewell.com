// spec-v1640 tool 9: what the codeine and tramadol labels state for an age, a procedure and a CYP2D6
// status. The label statements only; the guideline rows the spec pairs with them are not built (see
// docs/spec-v1640.md, Build status).
//
// Sources, re-read October 13, 2026 (DailyMed):
//   Codeine sulfate tablets, Hikma (NDA 022402; set id 010905f9-3bcb-4b50-9fe8-a3ad0010f14c, version 25).
//   Tramadol hydrochloride tablets, Amneal (set id 67919c2c-2f8a-4bbb-bef5-0cd6c1e63a16, version 51; no
//   current Ultram label is on DailyMed).
//   Both labels, section 4: contraindicated for "All children younger than 12 years of age" and for
//     "Post-operative management in children younger than 18 years of age following tonsillectomy and/or
//     adenoidectomy" (the tramadol label prints "all" and "postoperative"; each is quoted as printed).
//   Both, section 5.6: "Avoid the use of ... in adolescents 12 to 18 years of age who have other risk
//     factors that may increase their sensitivity to the respiratory depressant effects of [the drug]
//     unless the benefits outweigh the risks. Risk factors include conditions associated with
//     hypoventilation, such as postoperative status, obstructive sleep apnea, obesity, severe pulmonary
//     disease, neuromuscular disease, and concomitant use of other medications that cause respiratory
//     depression."
//   Both, section 5.6: "individuals who are ultra-rapid metabolizers should not use" the drug.
//   Both, section 5.6: "Breastfeeding is not recommended during treatment".
//   Neither label states an action for a poor, intermediate or normal metabolizer.
//
// A decider, not a dose tool. The risk factors of section 5.6 are shown as text and are not inputs.
// Age is read in completed years, so "12 to 18 years of age" runs to the day before the 19th birthday.
// Combination products (with acetaminophen) carry their own labels and are not rows.
//
// Pure: no DOM, no network. `now` is read only to check that each label edition still stands.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'codeine', text: 'Codeine sulfate tablets', product: 'Codeine Sulfate Tablets', setId: '010905f9-3bcb-4b50-9fe8-a3ad0010f14c', brand: 'codeine sulfate (Hikma)', under12: 'All children younger than 12 years of age', postop: 'Post-operative management in children younger than 18 years of age following tonsillectomy and/or adenoidectomy', hypo: 'hypoventilation, such as', breast: 'Breastfeeding' },
  { value: 'tramadol', text: 'Tramadol hydrochloride tablets', product: 'tramadol hydrochloride tablets', setId: '67919c2c-2f8a-4bbb-bef5-0cd6c1e63a16', brand: 'tramadol hydrochloride (Amneal)', under12: 'all children younger than 12 years of age', postop: 'postoperative management in children younger than 18 years of age following tonsillectomy and/or adenoidectomy', hypo: 'hypoventilation such as', breast: 'breastfeeding' },
];
export const PROCEDURES = [
  { value: 'after-tonsillectomy-or-adenoidectomy', text: 'Yes: pain after tonsillectomy or adenoidectomy' },
  { value: 'another-use', text: 'No: another use' },
];
export const STATUSES = [
  { value: 'ultrarapid', text: 'Ultra-rapid metabolizer' },
  { value: 'normal', text: 'Normal (extensive) metabolizer' },
  { value: 'intermediate', text: 'Intermediate metabolizer' },
  { value: 'poor', text: 'Poor metabolizer' },
  { value: 'status-not-known', text: 'Not known (not genotyped)' },
];
const POSTURE = 'These are the label\'s statements for the entries above. Section 4 lists other contraindications that are not inputs here. It is not advice for a particular patient.';
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

export function opioidCyp2d6PediatricCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const d = pick(DRUGS, o.drug);
  if (!d) return { valid: false, message: 'Choose codeine or tramadol. The single-ingredient tablet labels are the ones read.' };
  const f = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const age = Math.floor(Number(o.age));
  const child = age < 18;
  const proc = pick(PROCEDURES, o.procedure);
  if (age >= 12 && child && !proc) return { valid: false, message: 'Choose whether the use is pain after tonsillectomy or adenoidectomy. The label contraindicates that use under 18 years of age.' };
  const st = pick(STATUSES, o.status);
  if (age >= 12 && !st) return { valid: false, message: 'Choose the CYP2D6 metabolizer status, or "Not known". The label has a statement for ultra-rapid metabolizers.' };
  const lr = labelRow(d.setId, now, table);
  const labelLinks = [{ text: `${d.text} label on DailyMed`, url: lr.url }];
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelLinks, band: `The ${d.brand} label statements are withheld: ${lr.why}. Read sections 4 and 5.6 of the current label.`, bandLabel: 'Withheld', notes: [] };

  const applies = []; const notes = [];
  const under12 = age < 12;
  const postop = child && !!proc && proc.value === 'after-tonsillectomy-or-adenoidectomy';
  const um = !!st && st.value === 'ultrarapid';
  const teen = age >= 12 && age <= 18;
  if (under12) { applies.push('under-12'); notes.push(`Applies. Section 4: contraindicated for "${d.under12}".`); }
  else notes.push(`Does not apply at this age. Section 4: contraindicated for "${d.under12}".`);
  if (postop) { applies.push('post-tonsillectomy-under-18'); notes.push(`Applies. Section 4: contraindicated for "${d.postop}".`); }
  else if (!under12) notes.push(`Does not apply${child ? ' to the use entered' : ' at this age'}. Section 4: contraindicated for "${d.postop}".`);
  if (um) { applies.push('ultra-rapid'); notes.push(`Applies at any age. Section 5.6: "individuals who are ultra-rapid metabolizers should not use ${d.product}."`); }
  else if (st && st.value === 'status-not-known') notes.push(`The status is not known. Section 5.6: "individuals who are ultra-rapid metabolizers should not use ${d.product}."`);
  else if (st) notes.push(`The label states no action for ${st.value === 'normal' ? 'a normal' : st.value === 'poor' ? 'a poor' : 'an intermediate'} metabolizer. Its statement is for ultra-rapid metabolizers, who "should not use ${d.product}."`);
  if (teen && !postop) { applies.push('age-12-to-18-statement'); notes.push(`Section 5.6, ages 12 to 18: "Avoid the use of ${d.product} in adolescents 12 to 18 years of age who have other risk factors that may increase their sensitivity to the respiratory depressant effects of ${d.value} unless the benefits outweigh the risks."`, `The label's risk factors: "conditions associated with ${d.hypo} postoperative status, obstructive sleep apnea, obesity, severe pulmonary disease, neuromuscular disease, and concomitant use of other medications that cause respiratory depression." They are not inputs here.`); }
  notes.push(`Section 5.6 also says: "${d.breast} is not recommended during treatment with ${d.product}".`, 'Age is read in completed years.', `Label: ${lr.edition}.`, POSTURE);

  const ci = under12 || postop;
  const band = ci ? `Contraindicated by the label: ${under12 ? 'younger than 12 years of age' : 'under 18 after tonsillectomy or adenoidectomy'}.`
    : um ? 'Not contraindicated by age or procedure, but the label says ultra-rapid metabolizers should not use it.'
      : teen ? 'Not contraindicated by age or procedure. The label has an "avoid" statement for ages 12 to 18 with other risk factors.'
        : 'No age, procedure or ultra-rapid statement of the label applies to these entries.';
  return { valid: true, withheld: false, drug: d.value, age, applies, labelLinks, flag: ci ? 'contraindicated' : um ? 'ultra-rapid-should-not-use' : teen ? 'avoid-with-risk-factors' : 'no-statement-applies', abnormal: ci || um, band, bandLabel: `${d.value === 'codeine' ? 'Codeine' : 'Tramadol'}, age ${age}`, notes };
}
