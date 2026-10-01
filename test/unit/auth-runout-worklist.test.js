// spec-v1502 tool 3, batch: the renewal worklist from a CSV of authorizations.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authRunout, authRunoutWorklist as w } from '../../lib/auth-runout-v1502.js';

const row = (o) => ({ reference: 'A', start_date: '2026-06-01', end_date: '2026-11-30', approved: '4', used: '1', per_dose: '1', interval_days: '56', next_dose: '2026-07-06', lead_days: '14', ...o });

test('each row is the form\'s own calculation, sorted by the submit-by date', () => {
  const rows = [row({ reference: 'late-one', approved: '10', used: '0', end_date: '2026-12-31' }), row({ reference: 'early-one' })];
  const r = w({ authRows: rows });
  assert.equal(r.valid, true);
  const single = authRunout({ startDate: '2026-06-01', endDate: '2026-11-30', approved: '4', used: '1', perDose: '1', intervalDays: '56', nextDose: '2026-07-06', leadDays: '14' });
  assert.equal(r.rows[1].submitBy, single.submitBy, 'the same answer as the form');
  assert.deepEqual(r.order.map((x) => x.reference), ['early-one', 'late-one']);
  assert.match(r.band, /^2 renewals scheduled, the first due /);
});

test('a row that cannot be computed is listed last with its reason, never dropped', () => {
  const r = w({ authRows: [row({ reference: 'bad', used: '' }), row({ reference: 'good' })] });
  assert.deepEqual(r.order.map((x) => x.reference), ['good', 'bad']);
  assert.equal(r.rows[0].status, 'needs correction');
  assert.match(r.rows[0].reason, /^Enter the units or visits used so far/);
  assert.match(r.band, /1 row needs corrected inputs/);
});

test('an as-of date marks renewals already past due; without one, none is', () => {
  const late = w({ authRows: [row()], asOf: '2026-12-10' }); // submit-by is 2026-12-07
  assert.equal(w({ authRows: [row()], asOf: '2026-12-07' }).rows[0].status, 'scheduled', 'due today is not yet late');
  assert.equal(late.rows[0].status, 'past due');
  assert.match(late.band, /1 already past due as of /);
  const none = w({ authRows: [row()] });
  assert.equal(none.rows[0].status, 'scheduled');
  assert.ok(none.notes.some((n) => /No as-of date was entered/.test(n)));
  assert.match(w({ authRows: [row()], asOf: '12/40/2026' }).message, /as-of date/);
  assert.match(w({}).message, /^Load a CSV/);
});
