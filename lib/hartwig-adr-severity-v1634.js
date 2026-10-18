// spec-v1634 tool 3: severity level of an adverse drug reaction (Hartwig and Siegel).
//
// Source: Hartwig SC, Siegel J, Schneider PJ. Preventability and severity assessment in reporting adverse drug
// reactions. Am J Hosp Pharm. 1992;49:2229-2232. Read, on the owner's rule of October 17, 2026 that a verified
// reprint is a source, in three open reprints that print the same seven levels word for word:
//   PMC9126153 (2022, CC BY-NC; "Reprinted from Steven C Hartwig, Jerry Siegel ... by permission of Oxford
//   University Press"), PMC11162198 (2024 review, CC BY 4.0, Table 9) and PMC12633994 (2025, Table 3).
//   Level 1  an ADR occurred but required no change in treatment with the suspected drug.
//   Level 2  the suspected drug was held, discontinued or otherwise changed; no antidote or other treatment;
//            no increase in length of stay.
//   Level 3  the drug was held, discontinued or changed, and/or an antidote or other treatment was required;
//            no increase in length of stay.
//   Level 4  (a) any level 3 ADR that increased the length of stay by at least 1 day, or (b) the ADR was the
//            reason for admission.
//   Level 5  any level 4 ADR that required intensive medical care.
//   Level 6  the ADR caused permanent harm.  Level 7  the ADR directly or indirectly led to death.
//   Mild = levels 1 and 2; moderate = 3 and 4; severe = 5, 6 and 7.
// The level definitions are restated in this tool's words; the reprints carry the table itself.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const QUESTIONS = [
  ['death', 'led directly or indirectly to death'],
  ['permanentHarm', 'caused permanent harm'],
  ['intensiveCare', 'needed intensive medical care'],
  ['longerStay', 'added at least 1 day to the stay'],
  ['admission', 'was the reason for admission'],
  ['drugChanged', 'meant the suspected drug was held, stopped or changed'],
  ['treatment', 'needed an antidote or other treatment'],
];
const BAND = (l) => (l <= 2 ? 'mild' : l <= 4 ? 'moderate' : 'severe');
const NOTE = 'Hartwig and Siegel (1992), as reprinted with the same seven levels in three open papers. A reporting scale for how much an adverse reaction affected care, not a judgment of cause or preventability.';

export function hartwigAdrSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = QUESTIONS.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no').map(([, q]) => q);
  if (missing.length) return { valid: false, message: `Answer yes or no for whether the reaction ${missing.join('; ')}: an unanswered question is not a no.` };
  const y = (k) => o[k] === 'yes';
  const notes = [];
  let level; let why;
  const base3 = y('drugChanged') || y('treatment');
  const level4 = (base3 && y('longerStay')) || y('admission');
  if (y('death')) { level = 7; why = 'it led to death'; }
  else if (y('permanentHarm')) { level = 6; why = 'it caused permanent harm'; }
  else if (level4 && y('intensiveCare')) { level = 5; why = 'a level 4 reaction that needed intensive medical care'; }
  else if (level4) { level = 4; why = y('admission') ? 'it was the reason for admission (level 4b)' : 'a level 3 reaction that added at least 1 day to the stay (level 4a)'; }
  else if (y('treatment')) { level = 3; why = 'an antidote or other treatment was needed, with no added stay'; }
  else if (y('drugChanged')) { level = 2; why = 'the suspected drug was held, stopped or changed, with no other treatment and no added stay'; }
  else { level = 1; why = 'no change in treatment with the suspected drug was needed'; }
  if (y('intensiveCare') && level < 5) notes.push('Intensive care was marked, but the scale defines level 5 as a level 4 reaction (a longer stay after a treatment change, or the reason for admission) that needed intensive care, so it does not raise the level here. Check the answers.');
  if (y('longerStay') && !base3 && !y('admission') && level < 6) notes.push('A longer stay was marked with no treatment change or other treatment; level 4a is a level 3 reaction that lengthened the stay, so it does not apply.');
  const band = BAND(level);
  notes.push('Bands: mild for levels 1 and 2, moderate for 3 and 4, severe for 5 to 7.');
  return {
    valid: true, level, severity: band,
    band: `Hartwig and Siegel level ${level} (${band}): ${why}.`,
    bandLabel: `Level ${level}, ${band}`, abnormal: level >= 5, notes, note: NOTE,
  };
}
