// spec-v884: the Eat, Sleep, Console function-based care approach for neonatal opioid withdrawal.
//
// Sources:
//   Grossman MR, Berkwitt AK, Osborn RR, et al. An initiative to improve the quality of care of
//   infants with neonatal abstinence syndrome. Pediatrics. 2017;139(6):e20163360.
//   Young LW, Ounpraseuth ST, Merhar SL, et al. Eat, Sleep, Console approach or usual care for
//   neonatal opioid withdrawal. N Engl J Med. 2023;388(25):2326-2337.
//
//   Three functional questions, asked of the infant as it is now:
//     EAT      can it feed adequately, or is feeding limited by withdrawal?
//     SLEEP    does it sleep an hour or more after a feed, or is sleep limited by withdrawal?
//     CONSOLE  can it be consoled within about ten minutes with caregiver support?
//
//   Any one of the three failing prompts a review and escalation of non-pharmacologic care.
//   Pharmacologic treatment is considered only when an infant still cannot eat, sleep or be
//   consoled DESPITE maximized non-pharmacologic care.
//
// IT IS NOT A SCORE, AND THAT IS WHY THIS TILE EXISTS. Nothing is added up, there is no total and
// no threshold. It is three functional questions and a care-first pathway, and it is not
// interchangeable with a Finnegan score: one medicates on a number, the other on function.
//
// NON-PHARMACOLOGIC CARE IS THE INTERVENTION, NOT A PRELIMINARY. Rooming-in, parental presence,
// holding, a quiet low-light room, feeding on cue and skin-to-skin contact are the treatment, and
// medication is considered only after they are maximized.
//
// THE FAILURE HAS TO BE ATTRIBUTABLE TO WITHDRAWAL. A hungry infant who will not settle, or one
// that is unwell for another reason, is not an item failure, and looking for the other reason is
// part of the assessment.
//
// Pure: no DOM, no clock, no network.

export const ESC_NOTE = 'Eat, Sleep, Console is a function-based approach to caring for an infant with neonatal opioid withdrawal (Grossman and colleagues, Pediatrics, 2017; the multicenter trial by Young and colleagues, New England Journal of Medicine, 2023). Three functional questions are asked of the infant as it is now: whether it can feed adequately, whether it sleeps an hour or more after a feed, and whether it can be consoled within about ten minutes with caregiver support. Any one of them failing prompts a review and escalation of non-pharmacologic care, and pharmacologic treatment is considered only when an infant still cannot eat, sleep or be consoled despite that care being maximized. Three things about the approach are worth stating plainly. It is not a score: nothing is added up, there is no total and no threshold, and it is not interchangeable with a Finnegan score, since one medicates on a number and the other on function. Non-pharmacologic care is the intervention rather than a preliminary, so rooming-in, parental presence, holding, a quiet low-light room, feeding on cue and skin-to-skin contact are the treatment and medication is considered only after they are maximized. And an item failure has to be attributable to withdrawal, so a hungry infant who will not settle, or one unwell for another reason, is not a failure, and looking for that other reason is part of the assessment. It records three functional observations against a published approach. It does not decide whether to give medication.';

export const ITEMS = [
  { key: 'eat', text: 'Eating: feeding is limited by withdrawal' },
  { key: 'sleep', text: 'Sleeping: sleeps less than an hour after a feed, because of withdrawal' },
  { key: 'console', text: 'Consoling: cannot be consoled within about ten minutes with caregiver support' },
];

export const CARE_MEASURES = [
  { key: 'roomingIn', text: 'Rooming-in with a parent or caregiver present' },
  { key: 'holding', text: 'Holding, or skin-to-skin contact' },
  { key: 'quietEnvironment', text: 'A quiet, low-light environment' },
  { key: 'feedingOnCue', text: 'Feeding on cue, with a supported feeding plan' },
  { key: 'clusteredCare', text: 'Clustered care, so the infant is disturbed less' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const pick = (list, o) => list.filter((i) => on(o[i.key]));

export function eatSleepConsole(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const failing = pick(ITEMS, o);
  const care = pick(CARE_MEASURES, o);
  const careMaximized = care.length === CARE_MEASURES.length;
  const otherCause = on(o.otherCauseSuspected);

  const status = failing.length === 0
    ? 'all-three'
    : otherCause
      ? 'other-cause'
      : careMaximized
        ? 'consider-medication'
        : 'escalate-care';

  const failingText = failing.map((i) => i.key).join(', ');

  const action = {
    'all-three': 'The infant is eating, sleeping and consoling. Continue the non-pharmacologic care that is producing that, and reassess with the next care encounter.',
    'escalate-care': `Not meeting ${failing.length === 1 ? 'one item' : `${failing.length} items`}: ${failingText}. ${CARE_MEASURES.length - care.length} of the ${CARE_MEASURES.length} listed care measures ${CARE_MEASURES.length - care.length === 1 ? 'is' : 'are'} not recorded as in place. Review and escalate non-pharmacologic care first, then reassess.`,
    'consider-medication': `Not meeting ${failing.length === 1 ? 'one item' : `${failing.length} items`}: ${failingText}, with every listed non-pharmacologic measure recorded as in place. This is the point at which the approach says pharmacologic treatment is considered, by the team caring for the infant.`,
    'other-cause': `Not meeting ${failing.length === 1 ? 'one item' : `${failing.length} items`}: ${failingText}, but another cause is suspected. An item failure counts only when it is attributable to withdrawal, and the other cause is what to pursue first.`,
  }[status];

  // The reason the tile exists, on every result.
  const notAScoreNote = 'This is not a score. Nothing is added up, there is no total and no threshold. It is three functional questions, and it is not interchangeable with a Finnegan score: one medicates on a number, the other on function.';

  const careFirstNote = 'Non-pharmacologic care is the intervention, not a preliminary. Rooming-in, parental presence, holding, a quiet low-light room, feeding on cue and clustered care are the treatment, and medication is considered only after they are maximized.';

  const attributionNote = 'An item counts as failing only when the failure is attributable to withdrawal. A hungry infant who will not settle, or one unwell for another reason, is not a failure, and looking for that other reason is part of the assessment.';

  const missingCareNote = failing.length && !careMaximized
    ? `Not recorded as in place: ${CARE_MEASURES.filter((m) => !care.includes(m)).map((m) => m.text.toLowerCase()).join('; ')}.`
    : null;

  const parentNote = failing.length && !on(o.roomingIn)
    ? 'Rooming-in with a caregiver present is the measure with the largest effect in this approach, and it is not recorded here.'
    : null;

  const recordedNote = `Recorded: ${failing.length} of ${ITEMS.length} items not met, ${care.length} of ${CARE_MEASURES.length} care measures in place.`;

  const scopeNote = 'This records three functional observations against a published approach. It does not decide whether to give medication.';

  return {
    valid: true,
    status,
    failing: failing.map((i) => i.text),
    careInPlace: care.map((i) => i.text),
    careMaximized,
    action,
    recordedNote,
    notAScoreNote,
    careFirstNote,
    attributionNote,
    missingCareNote,
    parentNote,
    scopeNote,
    abnormal: status === 'consider-medication' || status === 'escalate-care',
    bandLabel: {
      'all-three': 'Eating, sleeping and consoling',
      'escalate-care': 'Escalate non-pharmacologic care',
      'consider-medication': 'Care maximized; medication considered',
      'other-cause': 'Another cause suspected',
    }[status],
    band: action,
    detail: 'Three functional questions: can the infant feed adequately, does it sleep an hour or more after a feed, and can it be consoled within about ten minutes with caregiver support. Any one failing prompts review and escalation of non-pharmacologic care. Pharmacologic treatment is considered only when an infant still cannot eat, sleep or be consoled despite that care being maximized.',
    note: ESC_NOTE,
  };
}
