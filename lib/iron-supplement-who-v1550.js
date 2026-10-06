// spec-v1550 tool 4: preventive iron and iron-folic acid doses (WHO).
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - FE16c: WHO. Guideline: daily iron supplementation in infants and children, 2016 (IRIS 10665/204712; all
//     rights reserved), Tables A-C and remarks: 6-23 months 10-12.5 mg elemental iron (drops or syrup),
//     24-59 months 30 mg, 5-12 years 30-60 mg (tablets or capsules); daily for three consecutive months a year
//     where anemia prevalence in the group is 40% or more; at 20-40%, intermittent regimens can be
//     considered; in malaria-endemic areas, with malaria prevention, diagnosis and treatment (remarks, p. 4: not
//     for a child without access to them; infants only under insecticide-treated nets; no screening needed
//     where anemia is highly prevalent); a child
//     diagnosed with anemia follows national treatment guidelines. Salt equivalents: 10-12.5 mg = 50-62.5 mg
//     ferrous sulfate heptahydrate, 30-37.5 mg ferrous fumarate or 83.3-104.2 mg ferrous gluconate; 30 mg =
//     150, 90 or 250 mg; 30-60 mg = 150-300, 90-180 or 250-500 mg.
//   - FE16w: WHO. Guideline: daily iron supplementation in adult women and adolescent girls, 2016 (IRIS
//     10665/204761): menstruating, non-pregnant, 30-60 mg daily for three consecutive months a year where
//     anemia prevalence is 40% or more.
//   - ANC16: WHO recommendations on antenatal care, 2016, A.2.1 and A.2.2 with remarks: 30-60 mg elemental iron
//     with 0.4 mg folic acid daily (60 mg preferred where 40% or more of pregnant women are anemic); 120 mg
//     iron with 2.8 mg folic acid once weekly if daily iron is not acceptable and anemia prevalence among
//     pregnant women is under 20%; anemia in pregnancy (Hb under 110 g/L in the first and third trimesters,
//     under 105 in the second): 120 mg daily until Hb is 110 g/L or more.
//   - LBW22: WHO recommendations for care of the preterm or low-birth-weight infant, 2022, A.10a: human-milk-
//     fed preterm or low-birth-weight infants not getting iron from another source, 2-4 mg/kg/day once
//     enteral feeds are well established, until iron comes from another source.
//   - CB14: WHO IMCI chart booklet, 2014: no iron for a child with SAM on RUTF (RUTF contains enough iron).
//
// Stated rather than hidden: this is prevention; anemia treatment follows national guidelines.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const GROUP_OPTIONS = [
  { value: 'c6', text: 'Child 6-23 months' },
  { value: 'c24', text: 'Child 24-59 months' },
  { value: 'c5', text: 'Child 5-12 years' },
  { value: 'woman', text: 'Menstruating woman or adolescent girl (not pregnant)' },
  { value: 'pregnant', text: 'Pregnant woman' },
  { value: 'preterm', text: 'Preterm or low-birth-weight infant on breast milk' },
];
export const PREV_OPTIONS = [
  { value: 'ge40', text: '40% or more' },
  { value: '20to40', text: '20% to under 40%' },
  { value: 'lt20', text: 'Under 20%' },
  { value: 'unknown', text: 'Not known' },
];
export const TRIM_OPTIONS = [{ value: '1', text: 'First' }, { value: '2', text: 'Second' }, { value: '3', text: 'Third' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const SALTS = {
  c6: '10-12.5 mg elemental iron = 50-62.5 mg ferrous sulfate heptahydrate, 30-37.5 mg ferrous fumarate or 83.3-104.2 mg ferrous gluconate.',
  c24: '30 mg elemental iron = 150 mg ferrous sulfate heptahydrate, 90 mg ferrous fumarate or 250 mg ferrous gluconate.',
  c5: '30-60 mg elemental iron = 150-300 mg ferrous sulfate heptahydrate, 90-180 mg ferrous fumarate or 250-500 mg ferrous gluconate.',
};
const NOTE = 'This follows WHO\'s iron supplementation guidelines (2016), antenatal care (2016) and preterm care (2022). It is prevention; treat diagnosed anemia by national guidelines.';

export function ironSupplementWho(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = GROUP_OPTIONS.find((x) => x.value === o.group);
  if (!g) return { valid: false, message: 'Choose the group: a child by age, a menstruating woman or girl, a pregnant woman, or a preterm or low-birth-weight infant.' };
  const notes = [];
  const out = (band, label, abnormal = false) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (g.value === 'preterm') {
    const f = inputFault([['the weight', o.weight, 0.3, 6, 'kg']]);
    if (f) return { valid: false, message: f };
    const kg = Number(o.weight);
    notes.push('Not if the infant already gets iron from another source (such as fortified formula).');
    return out(`Elemental iron ${Math.round(2 * kg * 10) / 10}-${Math.round(4 * kg * 10) / 10} mg a day (2-4 mg/kg/day), once enteral feeds are well established, until iron comes from another source.`, '2-4 mg/kg/day');
  }

  if (String(o.weight ?? '').trim() !== '') notes.push('The weight is used only for a preterm or low-birth-weight infant; these doses are fixed.');
  if (g.value.startsWith('c') && o.rutf === 'yes') return out('No iron: a child with severe acute malnutrition on RUTF already gets enough iron from it.', 'No iron on RUTF');
  if (g.value.startsWith('c') && o.rutf !== 'no') notes.push('On RUTF: not entered. A child on RUTF gets no extra iron.');

  const prev = PREV_OPTIONS.find((x) => x.value === o.prevalence);
  if (!prev) return { valid: false, message: 'Choose the anemia prevalence in this group locally (40% or more, 20-40%, under 20%, or not known).' };

  if (g.value === 'pregnant') {
    let anemic = null;
    if (String(o.hb ?? '').trim() !== '') {
      const f = inputFault([['the hemoglobin', o.hb, 30, 200, 'g/L']]);
      if (f) return { valid: false, message: f };
      const tri = TRIM_OPTIONS.find((x) => x.value === o.trimester);
      if (!tri) return { valid: false, message: 'Choose the trimester: the anemia threshold is 105 g/L in the second and 110 g/L otherwise.' };
      anemic = Number(o.hb) < (tri.value === '2' ? 105 : 110);
    }
    if (anemic) return out(`Anemia in pregnancy (Hb ${o.hb} g/L): increase to 120 mg elemental iron a day, with folic acid, until Hb is 110 g/L or more; then back to the standard daily dose.`, '120 mg daily', true);
    if (anemic === null) notes.push('Hemoglobin: not entered. Anemia in pregnancy raises the dose to 120 mg a day.');
    if (o.dailyOk === 'no' && prev.value === 'lt20') return out('Iron 120 mg with folic acid 2.8 mg once a week (daily iron not tolerated, and under 20% of pregnant women here are anemic).', '120 mg weekly');
    if (o.dailyOk === 'no') notes.push('Weekly iron (120 mg with 2.8 mg folic acid) is an option only where under 20% of pregnant women are anemic.');
    return out(`Elemental iron ${prev.value === 'ge40' ? '60' : '30-60'} mg with folic acid 0.4 mg every day of pregnancy${prev.value === 'ge40' ? ' (60 mg preferred where 40% or more of pregnant women are anemic)' : ''}.`, prev.value === 'ge40' ? '60 mg daily' : '30-60 mg daily');
  }

  const dose = { c6: '10-12.5 mg', c24: '30 mg', c5: '30-60 mg', woman: '30-60 mg' }[g.value];
  if (prev.value !== 'ge40') {
    if (prev.value === '20to40' && g.value !== 'woman') notes.push('At 20-40% prevalence, WHO says intermittent iron regimens can be considered.');
    return out(`Daily iron supplementation is recommended where anemia prevalence in this group is 40% or more; here it is ${prev.value === 'unknown' ? 'not known (WHO suggests proxies for a high risk of anemia)' : prev.text.toLowerCase()}. The daily dose would be ${dose} elemental iron.`, 'Not the daily program', false);
  }
  if (SALTS[g.value]) notes.push(SALTS[g.value]);
  else notes.push('30-60 mg elemental iron = 150-300 mg ferrous sulfate heptahydrate, 90-180 mg ferrous fumarate or 250-500 mg ferrous gluconate.');
  if (g.value !== 'woman') {
    notes.push('Where malaria is endemic, iron goes with malaria prevention (insecticide-treated nets, vector control), prompt diagnosis and effective treatment; WHO says a child without access to these should not get oral iron. No anemia screening is needed first where anemia is common.');
    if (g.value === 'c6') notes.push('In a malaria-endemic area, an infant gets iron only if the child sleeps under an insecticide-treated net and any malaria can be treated promptly.');
  }
  const form = { c6: 'drops or syrup', c24: 'drops, syrup or tablets', c5: 'tablets or capsules', woman: 'tablets' }[g.value];
  return out(`Elemental iron ${dose} every day for three consecutive months a year (${form}).`, `${dose} daily`);
}
