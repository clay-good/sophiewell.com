// spec-v862 MCP adapter: the M-CHAT-R/F toddler autism screen in lib/mchat-v862.js. The dom keys
// mirror the browser renderer (views/group-v862.js) and META['mchat-rf'].example.
//
// Items are named by topic rather than by the instrument's wording; scoring is positional.
// Items 2, 5 and 12 are reverse-scored. Clinical domain.

import { mchatScore } from '../../lib/mchat-v862.js';

export default [
  {
    id: 'mchat-rf',
    summary: 'Scores the M-CHAT-R/F toddler autism screen over its twenty items, for children between 16 and 30 months. A total of 0 to 2 is low risk. A TOTAL OF 3 TO 7 IS MEDIUM RISK AND IS AN INSTRUCTION TO ADMINISTER THE FOLLOW-UP, not a referral and not a pass: referring every child who scores 3 over-refers heavily, and discharging them misses the children the instrument exists to find. On the Follow-Up, 2 or more is a positive screen. A TOTAL OF 8 OR MORE IS HIGH RISK AND BYPASSES THE FOLLOW-UP, referring immediately. THREE ITEMS ARE REVERSE-SCORED — on items 2, 5 and 12 the at-risk answer is yes, and on the other seventeen it is no. A negative screen does not rule out autism. It does not diagnose autism and no total replaces a diagnostic evaluation.',
    compute: mchatScore,
    fields: [
      { dom: 'mc-age', arg: 'ageMonths', kind: 'number', required: false, label: 'Age', unit: 'months' },
      { dom: 'mc-i1', arg: 'item1', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 1. Looks across the room when you point at something' },
      { dom: 'mc-i2', arg: 'item2', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 2. Any concern that the child might not hear well (reverse-scored: yes is the at-risk answer)' },
      { dom: 'mc-i3', arg: 'item3', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 3. Pretend or imaginative play' },
      { dom: 'mc-i4', arg: 'item4', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 4. Likes climbing on things' },
      { dom: 'mc-i5', arg: 'item5', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 5. Unusual repeated finger movements near the eyes (reverse-scored: yes is the at-risk answer)' },
      { dom: 'mc-i6', arg: 'item6', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 6. Points to ask for something' },
      { dom: 'mc-i7', arg: 'item7', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 7. Points to show you something interesting' },
      { dom: 'mc-i8', arg: 'item8', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 8. Interest in other children' },
      { dom: 'mc-i9', arg: 'item9', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 9. Brings things over to show you' },
      { dom: 'mc-i10', arg: 'item10', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 10. Responds when you call their name' },
      { dom: 'mc-i11', arg: 'item11', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 11. Smiles back when you smile' },
      { dom: 'mc-i12', arg: 'item12', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 12. Upset by everyday noises (reverse-scored: yes is the at-risk answer)' },
      { dom: 'mc-i13', arg: 'item13', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 13. Walks' },
      { dom: 'mc-i14', arg: 'item14', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 14. Looks you in the eye while you are interacting' },
      { dom: 'mc-i15', arg: 'item15', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 15. Copies what you do' },
      { dom: 'mc-i16', arg: 'item16', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 16. Looks where you are looking when you turn to look' },
      { dom: 'mc-i17', arg: 'item17', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 17. Tries to get you to watch them' },
      { dom: 'mc-i18', arg: 'item18', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 18. Understands what you tell them to do' },
      { dom: 'mc-i19', arg: 'item19', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 19. Checks your reaction to something new' },
      { dom: 'mc-i20', arg: 'item20', kind: 'enum', values: ['', 'yes', 'no'], required: false, label: 'Item 20. Likes movement activities' },
      { dom: 'mc-followup', arg: 'followUp', kind: 'number', required: false, label: 'Follow-Up score, if the Follow-Up has been administered' },
    ],
  },
];
