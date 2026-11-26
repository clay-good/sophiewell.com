#!/usr/bin/env node
// spec-v1723: a value the reader entered, answered with "Enter it".
//
// ACR TI-RADS read a 25 cm diameter through `pos(v, 20)`, which returns null
// above the range -- the same null a blank field gives -- and the answer said
// "Enter the nodule maximum diameter". The HEART pathway did the same with a
// HEART score of 11 (both fixed in spec-v1722). The reader typed a value and was
// told to type one; nothing says what is wrong with it.
//
// Oracle, on the page's path (`compute(toArgs(...))`): set one field of the
// worked example to an impossible value. If the answer is a refusal whose text
// asks the reader to ENTER (or choose) something, and the same text is what the
// tool says with that field left BLANK, then the entered value was read as
// absent. A refusal that names the value's range ("must be between ...") is the
// right answer and is not reported.
//
// THE WEAK HALF WAS CHECKED TOO (spec-v1835, 2026-11-26), and it holds. The strong half -- a refusal that
// names no range at all -- is gated at zero (225 rows when the programme opened). The weak half is the 120
// fields whose refusal DOES state its range and happens to share that sentence with the blank case, and
// spec-v1831 left them as a reading list on the grounds that a reader told "from 1 to 365" has been told
// what is wrong.
//
// That left one question worth asking, because spec-v1830 had just found three tools SAYING "from 1 to
// 365" and ACCEPTING 0.95: does each of the 120 enforce the range its own sentence states? Driven -- parse
// the range out of the refusal, enter a value just outside it -- the answer is yes. Four rows came back
// and all four are the EXTRACTOR reading the wrong numbers:
//
//   glycemia-risk-index   "Time from 54 to 69 mg/dL" is the field's NAME, the glucose band it measures
//   ddi-static-aucr       "no AUC ratio between 0.0001 and 10,000" is about the OUTPUT
//   vanc-initial-dose     "(guideline 400 to 600)" is the GUIDELINE TARGET; the field accepts wider on
//   vanc-continuous-infusion                                            purpose, and says its own rule next
//
// Same mistake as a key that matches a word inside a longer name (spec-v1823's NOT_THE_TOTAL): numbers in
// a label are not the field's range. So the three spec-v1830 fixed were the exceptions, not the first of
// a hundred.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-entered-asked-for.mjs
//   node scripts/probe-entered-asked-for.mjs --id acr-tirads

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const i = process.argv.indexOf('--id');
const onlyId = i > -1 ? process.argv[i + 1] : null;
const IMPOSSIBLE = ['999999', '-999999'];

const said = (e, inputs) => {
  try {
    const raw = e.compute(e.toArgs(inputs));
    if (raw == null) return null;
    if (raw.valid !== false) return { ok: true };
    return { ok: false, text: String(raw.message || raw.band || raw.text || '') };
  } catch { return null; }
};
const asks = (t) => /(^|\. )(Enter|Choose|Select|Add|Provide|Fill in)\b/.test(t) && !/must be|Check the value|plausible range/i.test(t);

const rows = [];
let fields = 0;
for (const [id, e] of REGISTRY) {
  if (onlyId && id !== onlyId) continue;
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex) continue;
  const base = said(e, ex);
  if (!base || !base.ok) continue;
  for (const f of e.fields || []) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (!Object.prototype.hasOwnProperty.call(ex, f.dom)) continue;
    fields += 1;
    const blank = said(e, { ...ex, [f.dom]: '' });
    for (const bad of IMPOSSIBLE) {
      const r = said(e, { ...ex, [f.dom]: bad });
      if (!r || r.ok || !asks(r.text)) continue;
      const sameAsBlank = blank && !blank.ok && blank.text === r.text;
      rows.push({ id, dom: f.dom, bad, text: r.text, sameAsBlank });
      break;
    }
  }
}

rows.sort((p, q) => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0));
const strong = rows.filter((r) => r.sameAsBlank);
console.log(`${rows.length} field(s) answer an impossible value by asking for input; ${strong.length} say exactly what a blank field says.`);
console.log(`Reach: ${fields} numeric fields with a worked example.\n`);
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows)); process.exit(0); }
for (const r of rows) console.log(`  ${r.sameAsBlank ? '=' : ' '} ${r.id}  ${r.dom} = ${r.bad}: ${r.text.slice(0, 120)}`);
