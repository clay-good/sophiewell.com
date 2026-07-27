// spec-v511 MCP wave: adapter for the CRAFFT adolescent substance-use screen in lib/crafft-v511.js.
// The dom keys mirror the browser renderer (views/group-v511.js) and META['crafft'].example: cf-q1 .. cf-q6
// map to the lib args q1 .. q6. Every item is an enum 'no' / 'yes' and all six are in the example, so all six
// are required for every caller - which is correct for a screen: a partial CRAFFT has no total, and an
// unanswered item is not a no. The example scores 3; that number and the cut point of 2 are carried by the
// result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/crafft-v511.js';

const YES_NO = ['no', 'yes'];

export default [
  {
    id: 'crafft',
    summary: 'The CRAFFT, the six-item adolescent substance-use screen: Car, Relax, Alone, Forget, Family or friends, Trouble. One point per yes, total 0 to 6, and 2 or more is the validated positive cut point meaning further assessment is warranted. It is a screen, not a diagnosis: a positive score does not establish a substance use disorder and a negative score does not exclude one. The CAR question asks about riding with an impaired driver, a risk worth addressing whatever the total is. The score is not an indication for drug testing, for a treatment referral, or for disclosure to a parent or guardian.',
    compute: C.crafft,
    fields: C.CRAFFT_ITEMS.map((item, i) => ({
      dom: `cf-q${i + 1}`,
      arg: `q${i + 1}`,
      kind: 'enum',
      values: YES_NO,
      label: `${item.letter}. ${item.text}`,
    })),
  },
];
