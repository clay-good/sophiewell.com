// spec-v884 MCP adapter: Eat, Sleep, Console in lib/eat-sleep-console-v884.js. The dom keys
// mirror the browser renderer (views/group-v884.js) and META['eat-sleep-console'].example.
//
// There is no total to return. Pass the items NOT met and the care measures in place.
// Clinical domain.

import { eatSleepConsole } from '../../lib/eat-sleep-console-v884.js';

export default [
  {
    id: 'eat-sleep-console',
    summary: 'Records the three Eat, Sleep, Console observations for an infant in neonatal opioid withdrawal, and says what follows. The questions are whether the infant can feed adequately, whether it sleeps an hour or more after a feed, and whether it can be consoled within about ten minutes with caregiver support. Any one failing prompts review and escalation of non-pharmacologic care; pharmacologic treatment is considered only when an infant still cannot eat, sleep or be consoled despite that care being maximized. IT IS NOT A SCORE: nothing is added up, there is no total and no threshold, and it is NOT interchangeable with a Finnegan score, since one medicates on a number and the other on function. NON-PHARMACOLOGIC CARE IS THE INTERVENTION, NOT A PRELIMINARY. AN ITEM COUNTS ONLY WHEN THE FAILURE IS ATTRIBUTABLE TO WITHDRAWAL.',
    compute: eatSleepConsole,
    fields: [
      { dom: 'esc-eat', arg: 'eat', kind: 'boolean', required: false, label: 'Eating: feeding is limited by withdrawal (functional item)' },
      { dom: 'esc-sleep', arg: 'sleep', kind: 'boolean', required: false, label: 'Sleeping: sleeps less than an hour after a feed, because of withdrawal (functional item)' },
      { dom: 'esc-console', arg: 'console', kind: 'boolean', required: false, label: 'Consoling: cannot be consoled within about ten minutes with caregiver support (functional item)' },
      { dom: 'esc-othercausesuspected', arg: 'otherCauseSuspected', kind: 'boolean', required: false, label: 'Another cause for the difficulty is suspected (an item counts only when the failure is attributable to withdrawal)' },
      { dom: 'esc-roomingin', arg: 'roomingIn', kind: 'boolean', required: false, label: 'Rooming-in with a parent or caregiver present (non-pharmacologic care)' },
      { dom: 'esc-holding', arg: 'holding', kind: 'boolean', required: false, label: 'Holding, or skin-to-skin contact (non-pharmacologic care)' },
      { dom: 'esc-quietenvironment', arg: 'quietEnvironment', kind: 'boolean', required: false, label: 'A quiet, low-light environment (non-pharmacologic care)' },
      { dom: 'esc-feedingoncue', arg: 'feedingOnCue', kind: 'boolean', required: false, label: 'Feeding on cue, with a supported feeding plan (non-pharmacologic care)' },
      { dom: 'esc-clusteredcare', arg: 'clusteredCare', kind: 'boolean', required: false, label: 'Clustered care, so the infant is disturbed less (non-pharmacologic care)' },
    ],
  },
];
