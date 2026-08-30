// spec-v895: nephrogenic systemic fibrosis risk before a gadolinium-based contrast agent.
//
// Source:
//   American College of Radiology. ACR Manual on Contrast Media, section on nephrogenic systemic
//   fibrosis and gadolinium-based contrast agents.
//
//   The agents are grouped by their association with NSF:
//     Group I    associated with the greatest number of NSF cases.
//     Group II   few or no unconfounded cases; the risk, if any, is so low it may not be
//                distinguishable from zero, even at an eGFR below 30 or on dialysis.
//     Group III  limited data.
//
// THE AGENT GROUP MATTERS MORE THAN THE eGFR, AND THAT IS WHY THIS TILE EXISTS. The blanket rule
// that gadolinium is contraindicated below an eGFR of 30 came from Group I experience and has not
// applied to Group II agents for years, yet it is still applied to them.
//
// DIALYSIS AFTER THE SCAN IS NOT A PREVENTIVE MEASURE. It is not required for a Group II agent,
// and starting dialysis solely to remove contrast has never been shown to prevent NSF.
//
// ACUTE KIDNEY INJURY IS NOT THE SAME RISK STATE AS STABLE CHRONIC DISEASE AT THE SAME eGFR. An
// eGFR computed during an acute injury does not describe a steady state, and the ACR treats
// acute injury as its own category.
//
// THE eGFR IS NOT THE ONLY QUESTION ABOUT GADOLINIUM. Retention, pregnancy and prior reactions
// are separate matters this tile does not address.
//
// Pure: no DOM, no clock, no network.

export const GAD_NOTE = 'The American College of Radiology groups gadolinium-based contrast agents by their association with nephrogenic systemic fibrosis: group I agents are associated with the greatest number of cases, group II agents have few or no unconfounded cases and a risk so low it may not be distinguishable from zero even at an estimated glomerular filtration rate below 30 or on dialysis, and group III agents have limited data. Four things about this are worth stating plainly. The agent group matters more than the filtration rate, because the blanket rule that gadolinium is contraindicated below an eGFR of 30 came from group I experience and has not applied to group II agents for years, yet it is still applied to them. Dialysis after the scan is not a preventive measure: it is not required for a group II agent, and starting dialysis solely to remove contrast has never been shown to prevent the disease. Acute kidney injury is not the same risk state as stable chronic disease at the same filtration rate, since a rate computed during an acute injury does not describe a steady state and the manual treats acute injury as its own category. And the filtration rate is not the only question about gadolinium, because retention, pregnancy and prior reactions are separate matters this does not address. It applies a published grouping to an agent and a filtration rate already known. It does not choose an agent, and it does not authorize a scan.';

export const LOW_EGFR = 30;

export const AGENT_GROUPS = [
  { value: 'group-2', text: 'Group II: gadobenate, gadobutrol, gadoterate, gadoteridol, gadopiclenol' },
  { value: 'group-1', text: 'Group I: gadodiamide, gadopentetate, gadoversetamide' },
  { value: 'group-3', text: 'Group III: gadoxetate' },
  { value: 'unknown', text: 'Not known which agent will be used' },
];

// `short` is what reads correctly mid-sentence; `text` is the picklist wording.
export const RENAL_STATES = [
  { value: 'normal', short: 'stable kidney function at an eGFR of 30 or above', text: 'Stable kidney function, eGFR 30 or above' },
  { value: 'ckd-low', short: 'stable chronic kidney disease at an eGFR below 30', text: 'Stable chronic kidney disease, eGFR below 30' },
  { value: 'dialysis', short: 'a patient on dialysis', text: 'On dialysis' },
  { value: 'aki', short: 'acute kidney injury', text: 'Acute kidney injury' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function gadoliniumNsf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const group = oneOf(AGENT_GROUPS, o.agentGroup, 'unknown');
  const renal = oneOf(RENAL_STATES, o.renalState, 'normal');

  const atRiskRenal = renal !== 'normal';

  const verdict = group === 'unknown'
    ? 'agent-unknown'
    : !atRiskRenal
      ? 'no-heightened-risk'
      : group === 'group-2'
        ? 'group-two-at-risk'
        : group === 'group-1'
          ? 'group-one-at-risk'
          : 'group-three-at-risk';

  const renalText = RENAL_STATES.find((r) => r.value === renal).short;

  const action = {
    'agent-unknown': `The agent group decides this, and it is not entered. With ${renalText}, the answer differs sharply between a group I and a group II agent, which is the whole point of the grouping.`,
    'no-heightened-risk': `With ${renalText}, no group carries a heightened concern for nephrogenic systemic fibrosis.`,
    'group-two-at-risk': `A group II agent, with ${renalText}: the risk of nephrogenic systemic fibrosis, if any, is so low the manual describes it as possibly not distinguishable from zero, even in this setting.`,
    'group-one-at-risk': `A group I agent, with ${renalText}: this is the group associated with the greatest number of cases, and this is the combination the concern was built on.`,
    'group-three-at-risk': `A group III agent, with ${renalText}: data are limited for this group, which is not the same as reassurance and not the same as the group I signal.`,
  }[verdict];

  // The reason the tile exists, on every result.
  const groupOverEgfrNote = `The agent group matters more than the filtration rate. The blanket rule that gadolinium is contraindicated below an eGFR of ${LOW_EGFR} came from group I experience and has not applied to group II agents for years, yet it is still applied to them.`;

  const dialysisNote = renal === 'dialysis'
    ? 'Dialysis after the scan is not a preventive measure. It is not required for a group II agent, and starting dialysis solely to remove contrast has never been shown to prevent the disease. A patient already on a schedule is dialysed on that schedule.'
    : 'Dialysis after the scan has never been shown to prevent this, and is not a reason to give an agent that would otherwise be avoided.';

  const akiNote = renal === 'aki'
    ? 'Acute kidney injury is its own category, not stable disease at the same number. A filtration rate computed during an acute injury does not describe a steady state, so the eGFR alone understates the uncertainty here.'
    : null;

  const screeningNote = group === 'group-2'
    ? 'Because the group II risk is what it is, routine filtration-rate screening before a group II agent is not required by the manual. Local policy may still ask for it.'
    : null;

  const otherQuestionsNote = 'The filtration rate is not the only question about gadolinium. Retention, pregnancy and prior reactions to a contrast agent are separate matters, and this does not address them.';

  const scopeNote = 'This applies a published grouping to an agent and a filtration rate already known. It does not choose an agent, and it does not authorize a scan.';

  return {
    valid: true,
    agentGroup: group,
    renalState: renal,
    verdict,
    atRiskRenal,
    action,
    groupOverEgfrNote,
    dialysisNote,
    akiNote,
    screeningNote,
    otherQuestionsNote,
    scopeNote,
    abnormal: verdict === 'group-one-at-risk' || verdict === 'group-three-at-risk',
    bandLabel: {
      'agent-unknown': 'Agent group not entered',
      'no-heightened-risk': 'No heightened concern',
      'group-two-at-risk': 'Group II, risk possibly not distinguishable from zero',
      'group-one-at-risk': 'Group I, the group the concern was built on',
      'group-three-at-risk': 'Group III, limited data',
    }[verdict],
    band: action,
    detail: `Group I agents are associated with the greatest number of nephrogenic systemic fibrosis cases. Group II agents have few or no unconfounded cases and a risk that may not be distinguishable from zero, even below an eGFR of ${LOW_EGFR} or on dialysis. Group III agents have limited data. The group matters more than the filtration rate.`,
    note: GAD_NOTE,
  };
}
