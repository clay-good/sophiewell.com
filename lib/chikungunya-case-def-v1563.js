// spec-v1563 tool 7: chikungunya case definition: acute (suspected or confirmed), atypical, severe acute,
// and chronic (suspected or confirmed).
//
// Source: Ramon-Pardo P, Cibrelus L, Yactayo S, and the Chikungunya expert group. Chikungunya: case
// definitions for acute, atypical and chronic cases. Wkly Epidemiol Rec. 2015;90(33):410-414, Table 1 (IRIS
// 10665/242406; WHO copyright, facts restated). Read October 6, 2026: clinical criterion, fever over 38.5 C
// with joint pain of acute onset (usually incapacitating; under 3 years it shows as inconsolable crying,
// irritability or refusing to move or walk); epidemiological, resident in or visitor to an area with local
// transmission in the last 15 days (suspected case); laboratory, PCR, serology or culture (confirmed).
// Atypical: a laboratory-confirmed clinical case with other organ manifestations. Severe acute: a
// laboratory-confirmed clinical case with dysfunction of at least one organ or system that threatens life
// and needs hospitalization. Suspected chronic: a previous clinical diagnosis with joint symptoms after 12
// weeks from onset; confirmed chronic: plus a positive test.
//
// A criterion left blank is not assessed, so the answer says what could not be decided.
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows the WHO/PAHO chikungunya case definitions (Wkly Epidemiol Rec 2015). They are for surveillance and reporting, not for deciding treatment.';
const k = (v) => v === 'yes' || v === 'no';

export function chikungunyaCaseDef(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const notes = ['Under 3 years, joint pain may show as inconsolable crying, irritability, or refusing to move or walk.'];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (o.chronic === 'yes') {
    if (o.lab === 'yes') return out('Confirmed chronic chikungunya: a previous diagnosis, joint symptoms beyond 12 weeks from onset, and a positive laboratory test.', 'Confirmed chronic', true);
    if (!k(o.lab)) notes.push('Laboratory test: not entered. A positive test would confirm the chronic case.');
    return out('Suspected chronic chikungunya: a previous clinical diagnosis with joint pain, stiffness or swelling beyond 12 weeks from onset.', 'Suspected chronic', true);
  }
  if (!k(o.fever) && !k(o.joint) && !k(o.chronic)) return { valid: false, message: 'Choose at least the fever and joint pain answers, or whether this is a chronic case.' };
  const clinical = o.fever === 'yes' && o.joint === 'yes';
  const clinicalOpen = !clinical && o.fever !== 'no' && o.joint !== 'no';
  if (!clinical) {
    if (clinicalOpen) return out('Not decided: the clinical criterion (fever over 38.5 °C with acute joint pain) is not fully assessed.', 'Not decided', false);
    return out('Does not meet the clinical criterion: fever over 38.5 °C with joint pain of acute onset.', 'Criterion not met', false);
  }
  if (o.lab === 'yes') {
    if (o.severe === 'yes') return out('Severe acute chikungunya: laboratory confirmed, with life-threatening dysfunction of at least one organ or system needing hospitalization.', 'Severe acute', true);
    if (o.atypical === 'yes') return out('Atypical chikungunya: laboratory confirmed, with other manifestations (neurological, cardiovascular, skin, eye, liver, kidney, respiratory or blood).', 'Atypical', true);
    if (!k(o.severe) || !k(o.atypical)) notes.push('Organ dysfunction or other manifestations: not entered. Either would make this a severe acute or atypical case.');
    return out('Confirmed acute chikungunya: the clinical criterion and a positive PCR, serology or culture.', 'Confirmed', true);
  }
  if (o.epi === 'yes') return out('Suspected chikungunya: fever over 38.5 °C, acute joint pain, and residence in or a visit to an area with local transmission in the last 15 days.', 'Suspected', true);
  if (!k(o.epi)) return out('Clinical criterion met; the epidemiological criterion (an area with local transmission in the last 15 days) was not assessed, so not yet a suspected case.', 'Not decided', false);
  return out('Clinical criterion met but no link to an area with local transmission in the last 15 days: not a suspected case by this definition.', 'Clinical only', false);
}
