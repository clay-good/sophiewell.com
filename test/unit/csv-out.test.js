// The CSV a list tool hands the reader: quoting, and no cell a spreadsheet would run as a formula.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvText } from '../../lib/csv-out.js';
import { supdMeasure } from '../../lib/supd-measure-v1638.js';
import { mtmServiceClock } from '../../lib/mtm-service-clock-v1638.js';
import { partdConcurrentUseMeasures } from '../../lib/partd-concurrent-use-measures-v1638.js';

test('cells are quoted when needed; a formula-looking cell gets an apostrophe; booleans read yes or no', () => {
  assert.equal(csvText(['a', 'b'], [['x, y', 'say "hi"']]), 'a,b\n"x, y","say ""hi"""');
  assert.equal(csvText(['a'], [['=HYPERLINK("x")'], ['+1'], ['-2'], ['@SUM(A1)']]), 'a\n"\'=HYPERLINK(""x"")"\n\'+1\n\'-2\n\'@SUM(A1)');
  assert.equal(csvText(['n', 'ok', 'gap'], [[-3, true, null]]), 'n,ok,gap\n-3,yes,');
});

test('SUPD, the MTM clock and the concurrent-use measures each return their rows as CSV', () => {
  const s = supdMeasure({ measurementYear: 2025, members: 'A, 60, yes', fills: 'A, 2025-01-10, diabetes\nA, 2025-04-10, diabetes' });
  assert.equal(s.csv, 'member,in denominator,reason left out,statin fill,on gap list\nA,yes,,no,yes');
  const m = mtmServiceClock({ contractYear: 2026, asOf: '2026-06-30', enrollees: 'A, 2026-03-01, no, , , 2026-03-10, , 70, no, yes' });
  assert.match(m.csv, /^enrollee,days enrolled,CMR in year,CMR offer due,days left,offer basis,quarters without TMR,in denominator,reason left out\nA,/);
  const c = partdConcurrentUseMeasures({ measurementYear: 2025, members: 'A, 70, yes', fills: 'A, 2025-01-01, 30, oxycodone, opioid' });
  assert.match(c.csv, /^member,COB in denominator/);
  assert.equal(c.csv.split('\n').length, 2);
});

test('the antibiogram and the payer policy diff guard formula-like text the same way', async () => {
  const { antibiogramBuilder } = await import('../../lib/antibiogram-builder-v1636.js');
  const r = antibiogramBuilder({ isolates: 'patient,organism,date,=cmd\nP1,@evil,2026-01-02,S' });
  assert.match(r.csv, /\n'@evil,1,'=cmd,1,1,/);
  const { diffCsv } = await import('../../lib/payer-policy-diff.js');
  assert.equal(diffCsv({ rows: [{ label: 'added', path: '=x', before: '', after: 'a, b', detail: 'say "hi"' }] }), 'change,item,before,after,detail\n"added","\'=x","","a, b","say ""hi"""\n');
});
