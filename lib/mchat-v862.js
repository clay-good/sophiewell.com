// spec-v862: the M-CHAT-R/F toddler autism screen.
//
// Source:
//   Robins DL, Casagrande K, Barton M, Chen CA, Dumont-Mathieu T, Fein D. Validation of the
//   Modified Checklist for Autism in Toddlers, Revised with Follow-up (M-CHAT-R/F). Pediatrics.
//   2014;133(1):37-45.
//
//   Twenty items, screened between 16 and 30 months.
//
//     0-2    low risk       no further action on this screen
//     3-7    MEDIUM risk    administer the Follow-Up; the Follow-Up decides
//     8-20   high risk      BYPASS the Follow-Up and refer now
//
//   On the Follow-Up, 2 or more is a positive screen.
//
// A MEDIUM SCORE IS NEITHER A REFERRAL NOR A PASS, AND THAT IS WHY THIS TILE EXISTS. It is an
// instruction to administer the Follow-Up. Referring every child at 3 over-refers heavily;
// discharging them misses the children the instrument was built to find. The Follow-Up is what
// makes the screen work.
//
// A HIGH SCORE BYPASSES THE FOLLOW-UP. At 8 or more the referral is made now.
//
// THREE ITEMS ARE REVERSE-SCORED. On items 2, 5 and 12 the at-risk answer is yes; on the other
// seventeen it is no. Scoring all twenty the same way is the arithmetic error.
//
// Item wording is not reproduced. Each item is named by its topic; scoring is positional.
//
// Pure: no DOM, no clock, no network.

export const MCHAT_NOTE = 'The M-CHAT-R/F (Robins and colleagues, Pediatrics, 2014) screens toddlers between 16 and 30 months of age for autism spectrum disorder across twenty items. A total of 0 to 2 is low risk and calls for no further action on this screen. A total of 3 to 7 is medium risk, and it is an instruction to administer the Follow-Up interview rather than a referral or a pass: referring every child who scores 3 over-refers heavily, and discharging them misses the children the instrument exists to find. On the Follow-Up, a score of 2 or more is a positive screen and leads to referral for diagnostic evaluation and for early intervention. A total of 8 or more is high risk, and there the Follow-Up is bypassed and the referral is made immediately. Two other things are got wrong. Three of the twenty items are reverse-scored, so on those the at-risk answer is yes while on the other seventeen it is no, and scoring all twenty the same way is a straightforward arithmetic error. And a negative screen does not rule out autism: screening is not diagnosis, surveillance continues at every visit, and a child screened before the second birthday is screened again after it. It scores a screening instrument. It does not diagnose autism, and no total it produces replaces a diagnostic evaluation.';

// Topic labels, not the instrument's wording. Scoring is positional and never derived from text.
export const ITEMS = [
  { n: 1, topic: 'Looks across the room when you point at something' },
  { n: 2, topic: 'Any concern that the child might not hear well', reverse: true },
  { n: 3, topic: 'Pretend or imaginative play' },
  { n: 4, topic: 'Likes climbing on things' },
  { n: 5, topic: 'Unusual repeated finger movements near the eyes', reverse: true },
  { n: 6, topic: 'Points to ask for something' },
  { n: 7, topic: 'Points to show you something interesting' },
  { n: 8, topic: 'Interest in other children' },
  { n: 9, topic: 'Brings things over to show you' },
  { n: 10, topic: 'Responds when you call their name' },
  { n: 11, topic: 'Smiles back when you smile' },
  { n: 12, topic: 'Upset by everyday noises', reverse: true },
  { n: 13, topic: 'Walks' },
  { n: 14, topic: 'Looks you in the eye while you are interacting' },
  { n: 15, topic: 'Copies what you do' },
  { n: 16, topic: 'Looks where you are looking when you turn to look' },
  { n: 17, topic: 'Tries to get you to watch them' },
  { n: 18, topic: 'Understands what you tell them to do' },
  { n: 19, topic: 'Checks your reaction to something new' },
  { n: 20, topic: 'Likes movement activities' },
];

export const REVERSE_ITEMS = ITEMS.filter((i) => i.reverse).map((i) => i.n);

function answer(v) {
  if (v === 'yes' || v === true) return 'yes';
  if (v === 'no' || v === false) return 'no';
  return null;
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mchatScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ageMonths = num(o.ageMonths);
  if (ageMonths !== null && (ageMonths < 0 || ageMonths > 240)) {
    return { valid: false, message: 'The age is outside a plausible range of 0 to 240 months.' };
  }
  const followUp = num(o.followUp);
  if (followUp !== null && (followUp < 0 || followUp > 20)) {
    return { valid: false, message: 'The Follow-Up score is outside its range of 0 to 20.' };
  }

  const answers = ITEMS.map((i) => ({ item: i, value: answer(o[`item${i.n}`]) }));
  const unanswered = answers.filter((a) => a.value === null).map((a) => a.item.n);
  const atRisk = answers.filter((a) => a.value !== null && (a.item.reverse ? a.value === 'yes' : a.value === 'no'));
  const total = atRisk.length;

  const risk = total >= 8 ? 'high' : total >= 3 ? 'medium' : 'low';

  let action;
  let screen = null;
  if (risk === 'high') {
    action = `A total of ${total} is high risk. Bypass the Follow-Up and refer now, for a diagnostic evaluation and for an early intervention eligibility evaluation.`;
    screen = 'positive';
  } else if (risk === 'medium') {
    if (followUp === null) {
      action = `A total of ${total} is medium risk. That is an instruction to administer the Follow-Up, not a referral and not a pass. The Follow-Up decides.`;
    } else if (followUp >= 2) {
      action = `A total of ${total} is medium risk, and the Follow-Up score of ${followUp} is 2 or more, so this is a positive screen. Refer for a diagnostic evaluation and for an early intervention eligibility evaluation.`;
      screen = 'positive';
    } else {
      action = `A total of ${total} is medium risk, and the Follow-Up score of ${followUp} is under 2, so this is a negative screen on this instrument.`;
      screen = 'negative';
    }
  } else {
    action = `A total of ${total} is low risk. No further action is called for on this screen.`;
    screen = 'negative';
  }

  // The band the instrument is most often got wrong on.
  const mediumNote = risk === 'medium'
    ? 'A medium score is neither a referral nor a pass. Referring every child who scores 3 over-refers heavily, and discharging them misses the children the instrument exists to find. The Follow-Up is what makes the screen work.'
    : null;

  const bypassNote = risk === 'high' && followUp !== null
    ? 'The Follow-Up score was entered but is not used. At 8 or more the Follow-Up is bypassed and the referral is made now.'
    : null;

  const reverseTriggered = atRisk.filter((a) => a.item.reverse).map((a) => a.item.n);
  const reverseNote = `Items ${REVERSE_ITEMS.join(', ')} are reverse-scored: on those the at-risk answer is yes, and on the other seventeen it is no. ${reverseTriggered.length ? `Here ${reverseTriggered.length === 1 ? 'item' : 'items'} ${reverseTriggered.length > 1 ? `${reverseTriggered.slice(0, -1).join(', ')} and ${reverseTriggered[reverseTriggered.length - 1]}` : reverseTriggered[0]} scored on that rule.` : 'None of the three scored here.'}`;

  const ageNote = ageMonths === null
    ? 'The age was not entered. The instrument is validated between 16 and 30 months.'
    : ageMonths < 16 || ageMonths > 30
      ? `At ${ageMonths} months this is outside the 16 to 30 month range the instrument was validated in, so the total does not carry its published meaning.`
      : ageMonths < 24 && risk === 'low'
        ? `At ${ageMonths} months the child is under two. A low score before the second birthday is screened again after it.`
        : null;

  const unansweredNote = unanswered.length
    ? `${unanswered.length} of the 20 items ${unanswered.length === 1 ? 'is' : 'are'} unanswered (${unanswered.join(', ')}), and an unanswered item scores nothing. That total is over the ${20 - unanswered.length} items that were answered.`
    : null;

  const negativeNote = screen === 'negative'
    ? 'A negative screen does not rule out autism. Screening is not diagnosis, and surveillance continues at every visit.'
    : null;

  const scopeNote = 'This scores a screening instrument. It does not diagnose autism, and no total it produces replaces a diagnostic evaluation.';

  return {
    valid: true,
    total,
    risk,
    screen,
    action,
    followUp,
    ageMonths,
    answeredCount: 20 - unanswered.length,
    reverseTriggered,
    mediumNote,
    bypassNote,
    reverseNote,
    ageNote,
    unansweredNote,
    negativeNote,
    scopeNote,
    abnormal: risk !== 'low',
    bandLabel: risk === 'high' ? 'High risk' : risk === 'medium' ? 'Medium risk' : 'Low risk',
    band: action,
    detail: 'Twenty items, screened between 16 and 30 months. A total of 0 to 2 is low risk; 3 to 7 is medium risk and calls for the Follow-Up, where 2 or more is a positive screen; 8 or more is high risk and the Follow-Up is bypassed. Items 2, 5 and 12 are reverse-scored.',
    note: MCHAT_NOTE,
  };
}
