// spec-v866: the Broset Violence Checklist.
//
// Source:
//   Almvik R, Woods P, Rasmussen K. The Broset Violence Checklist: sensitivity, specificity,
//   and interrater reliability. J Interpers Violence. 2000;15(12):1284-1296.
//
//   Six observed behaviors, each present or absent, one point each:
//     confused, irritable, boisterous, physically threatening, verbally threatening,
//     attacking objects.
//
//     0     the risk of violence is small
//     1-2   the risk is moderate; preventive measures should be taken
//     3+    the risk is very high; preventive measures are required, and a plan for
//           managing an attack should be made
//
// IT PREDICTS THE NEXT 24 HOURS AND ONLY THAT, AND THAT IS WHY THIS TILE EXISTS. It is scored
// on observed behavior now and rescored every shift. A score carried over from yesterday
// describes yesterday.
//
// A SCORE OF 0 IS A SMALL RISK, NOT NO RISK. The published wording says small, deliberately.
//
// THE SCORE IS NOT AN INTERVENTION, AND IT IS NOT A JUSTIFICATION FOR RESTRAINT OR SECLUSION.
// Those have their own legal and clinical standards, which this instrument does not address.
//
// CONFUSION IS SCORED AS OBSERVED BEHAVIOUR, NOT AS A DIAGNOSIS. A disoriented patient scores
// the item whatever the cause.
//
// Pure: no DOM, no clock, no network.

export const BROSET_NOTE = 'The Broset Violence Checklist (Almvik and colleagues, J Interpers Violence, 2000) records six observed behaviors, each scored one point when present: confused, irritable, boisterous, physically threatening, verbally threatening, and attacking objects. A total of 0 means the risk of violence is small; 1 or 2 means the risk is moderate and preventive measures should be taken; 3 or more means the risk is very high, preventive measures are required, and a plan for managing an attack should be made. Four things about it are worth stating plainly. It predicts the next twenty-four hours and only that, so it is scored on what is being observed now and rescored every shift, and a total carried over from a previous shift describes that shift rather than this one. A total of zero is a small risk and not no risk; the published wording says small, deliberately, and it is not a clearance. The score is an observation, not an intervention, and it is never a justification for restraint or seclusion, which have their own legal and clinical standards that this instrument does not address. And the confusion item records observed behavior rather than a diagnosis, so a disoriented patient scores it whatever the cause. It records observed behavior on a published checklist. It does not decide what to do, and it never authorizes restraint or seclusion.';

export const BEHAVIORS = [
  { key: 'confused', text: 'Confused' },
  { key: 'irritable', text: 'Irritable' },
  { key: 'boisterous', text: 'Boisterous' },
  { key: 'physicallyThreatening', text: 'Physically threatening' },
  { key: 'verballyThreatening', text: 'Verbally threatening' },
  { key: 'attackingObjects', text: 'Attacking objects' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function brosetViolence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const present = BEHAVIORS.filter((b) => on(o[b.key]));
  const total = present.length;

  const risk = total >= 3 ? 'very-high' : total >= 1 ? 'moderate' : 'small';

  const action = risk === 'very-high'
    ? `A total of ${total} means the risk of violence is very high. Preventive measures are required, and a plan for managing an attack should be made.`
    : risk === 'moderate'
      ? `A total of ${total} means the risk of violence is moderate. Preventive measures should be taken.`
      : 'A total of 0 means the risk of violence is small.';

  // The reason the tile exists, on every result.
  const windowNote = 'This predicts the next twenty-four hours and only that. It is scored on what is being observed now and rescored every shift, so a total carried over from a previous shift describes that shift rather than this one.';

  const zeroNote = risk === 'small'
    ? 'Small is not none. The published wording says the risk is small, deliberately, and a total of 0 is not a clearance.'
    : null;

  const notRestraintNote = 'The score is an observation, not an intervention. It is never a justification for restraint or seclusion, which have their own legal and clinical standards that this instrument does not address.';

  const confusedNote = on(o.confused)
    ? 'The confusion item records observed behavior rather than a diagnosis. A disoriented patient scores it whatever the cause, and the cause still has to be looked for.'
    : null;

  const presentNote = total
    ? `Scored: ${present.map((b) => b.text.toLowerCase()).join('; ')}.`
    : 'None of the six behaviors was recorded as present.';

  const scopeNote = 'This records observed behavior on a published checklist. It does not decide what to do, and it never authorizes restraint or seclusion.';

  return {
    valid: true,
    total,
    risk,
    present: present.map((b) => b.text),
    action,
    presentNote,
    windowNote,
    zeroNote,
    notRestraintNote,
    confusedNote,
    scopeNote,
    abnormal: total >= 1,
    bandLabel: risk === 'very-high' ? 'Very high risk' : risk === 'moderate' ? 'Moderate risk' : 'Small risk',
    band: action,
    detail: 'Six observed behaviors, one point each: confused, irritable, boisterous, physically threatening, verbally threatening, and attacking objects. A total of 0 is a small risk; 1 or 2 is moderate and preventive measures should be taken; 3 or more is very high, and a plan for managing an attack should be made. It covers the next twenty-four hours.',
    note: BROSET_NOTE,
  };
}
