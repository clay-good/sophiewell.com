// spec-v775 MCP adapter: PFDI-20 in lib/pfdi20-v775.js.
// The dom keys mirror the browser renderer (views/group-v775.js) and META['pfdi20'].example.
// Twenty 0-4 enums in three subscales; each subscale is the mean of its answered items
// times 25. Clinical domain.

import { pfdi20 } from '../../lib/pfdi20-v775.js';

const RATE = ['0', '1', '2', '3', '4'];
const ROWS = [
  ['q1', 'POPDI item 1 - pressure in the lower abdomen (0-4)'],
  ['q2', 'POPDI item 2 - heaviness or dullness in the pelvic area (0-4)'],
  ['q3', 'POPDI item 3 - a bulge seen or felt in the vaginal area (0-4)'],
  ['q4', 'POPDI item 4 - pushing on the vagina or rectum to finish a bowel movement (0-4)'],
  ['q5', 'POPDI item 5 - bladder does not empty completely (0-4)'],
  ['q6', 'POPDI item 6 - pushing up a vaginal bulge to urinate (0-4)'],
  ['q7', 'CRADI item 7 - straining too hard for a bowel movement (0-4)'],
  ['q8', 'CRADI item 8 - bowel does not empty completely (0-4)'],
  ['q9', 'CRADI item 9 - loss of control of well-formed stool (0-4)'],
  ['q10', 'CRADI item 10 - loss of control of loose stool (0-4)'],
  ['q11', 'CRADI item 11 - loss of control of gas (0-4)'],
  ['q12', 'CRADI item 12 - pain with bowel movements (0-4)'],
  ['q13', 'CRADI item 13 - strong urge to have a bowel movement (0-4)'],
  ['q14', 'CRADI item 14 - rectum bulging out with a bowel movement (0-4)'],
  ['q15', 'UDI item 15 - frequent urination (0-4)'],
  ['q16', 'UDI item 16 - leakage linked to urgency (0-4)'],
  ['q17', 'UDI item 17 - leakage with coughing, sneezing or laughing (0-4)'],
  ['q18', 'UDI item 18 - small amounts of leakage (0-4)'],
  ['q19', 'UDI item 19 - difficulty emptying the bladder (0-4)'],
  ['q20', 'UDI item 20 - pain in the lower abdomen or genital area (0-4)'],
];

export default [
  {
    id: 'pfdi20',
    summary: 'PFDI-20 (Barber 2005): short-form Pelvic Floor Distress Inventory. Twenty items rated 0 (symptom absent) to 4 (quite a bit bothered) across POPDI-6 (prolapse), CRADI-8 (colorectal-anal) and UDI-6 (urinary). Each subscale is the mean of its answered items times 25 (0-100); the summary adds the three (0-300). Higher means more distress.',
    compute: pfdi20,
    fields: ROWS.map(([arg, label]) => ({ dom: `pfdi-${arg}`, arg, kind: 'enum', values: RATE, required: false, label })),
  },
];
