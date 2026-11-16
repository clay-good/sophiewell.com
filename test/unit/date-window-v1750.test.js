// spec-v1750: a date outside the house window (1900-2100) or not on the calendar is refused, not used.
// Twelve libraries carried their own copy of a date-time parser with a calendar check and no year window;
// two more read an impossible date as missing or used it as given.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';

const ROWS = [
  ['who-rabies-pep', 'rp-day0'], ['med-admin-window', 'maw-scheduled'], ['med-admin-window', 'maw-actual'],
  ['surgical-prophylaxis-redose', 'spr-start'], ['surgical-prophylaxis-redose', 'spr-incision'],
  ['us-antivenom-dose', 'uad-control'], ['nac-oral-regimen', 'nor-load'], ['fomepizole-schedule', 'fms-last'],
  ['mesna-ifosfamide-schedule', 'mis-start'], ['glucarpidase-dose', 'gcd-last'], ['gcsf-timing-check', 'gtc-chemo'],
  ['gcsf-timing-check', 'gtc-planned'], ['doac-periprocedural-timing', 'dpt-when'], ['imid-rems-fill-window', 'len-start'],
];
for (const [id, dom] of ROWS) {
  test(`${id} ${dom}: 1850 and 30 February are refused; the example answers`, () => {
    const ex = { ...META[id].example.fields };
    assert.notEqual(computeCalculator({ id, inputs: ex }).valid, false, 'example answers');
    const time = String(ex[dom]).slice(10);
    for (const bad of ['1850-06-01', '2026-02-30']) {
      const r = computeCalculator({ id, inputs: { ...ex, [dom]: bad + time } });
      assert.equal(r.valid, false, `${bad}: ${JSON.stringify(r).slice(0, 160)}`);
    }
  });
}
