// spec-v1636 tool 3: CroFab, Anavip and Anascorp vials, volumes and clocks, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usAntivenomDose, LABELS } from '../../lib/us-antivenom-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const a = (i, t) => usAntivenomDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const got = (r) => [r.vials, r.diluentMl, r.totalVolumeMl];

test('all three label rows answer; a product withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(a({ product: 'anavip', dose: 'first-dose' }, dead(LABELS.anavip.setId)).flag, 'withheld');
  assert.equal(a({ product: 'anavip', dose: 'first-dose' }, dead(LABELS.crofab.setId)).flag, 'dose');
});

test('CroFab: the reader picks within the label range; 18 mL per vial, diluted to 250 mL', () => {
  assert.deepEqual(got(a({ product: 'crofab', dose: 'first-dose', vials: 6 })), [6, 108, 250]);
  assert.deepEqual(got(a({ product: 'crofab', dose: 'first-dose', vials: 12 })), [12, 216, 250]);
  assert.match(a({ product: 'crofab', dose: 'first-dose' }).message, /^Enter the number of vials in this dose.*4 to 6 vials \(the label allows 4 to 12/);
  assert.equal(a({ product: 'crofab', dose: 'first-dose', vials: 3 }).valid, false);
  assert.equal(a({ product: 'crofab', dose: 'repeat-dose', vials: 8 }).valid, false);
  assert.deepEqual(got(a({ product: 'crofab', dose: 'repeat-dose', vials: 4 })), [4, 72, 250]);
  assert.match(a({ product: 'crofab', dose: 'first-dose', vials: 6 }).notes.join(' '), /first 10 minutes at 25 to 50 mL\/hour/);
});

test('CroFab maintenance: 2 vials at control plus 6, 12 and 18 hours', () => {
  const r = a({ product: 'crofab', dose: 'later-dose', vialsBefore: 10, controlTime: '2026-10-12T14:00' });
  assert.deepEqual([...got(r), r.cumulativeVials], [2, 36, 250, 12]);
  assert.deepEqual(r.maintenanceTimes, ['2026-10-12 20:00', '2026-10-13 02:00', '2026-10-13 08:00']);
  assert.equal(a({ product: 'crofab', dose: 'later-dose' }).maintenanceTimes, undefined);
});

test('Anavip: 10 vials, 10 mL each; 4 vials for re-emerging signs; observation to control plus 18 hours', () => {
  assert.deepEqual(got(a({ product: 'anavip', dose: 'first-dose' })), [10, 100, 250]);
  assert.deepEqual(got(a({ product: 'anavip', dose: 'repeat-dose' })), [10, 100, 250]);
  assert.match(a({ product: 'anavip', dose: 'repeat-dose' }).notes[0], /no known maximum/);
  const late = a({ product: 'anavip', dose: 'later-dose', vialsBefore: 20, controlTime: '2026-10-12T14:00' });
  assert.deepEqual([...got(late), late.cumulativeVials, late.observeUntil], [4, 40, 250, 24, '2026-10-13 08:00']);
  assert.match(a({ product: 'anavip', dose: 'first-dose', vials: 6 }).message, /gives 10 vials\. Clear the number of vials, or enter 10/);
});

test('Anascorp: 3 vials in 50 mL over 10 minutes, then one vial at a time; no separate later dose', () => {
  assert.deepEqual(got(a({ product: 'anascorp', dose: 'first-dose' })), [3, 15, 50]);
  const one = a({ product: 'anascorp', dose: 'repeat-dose', vialsBefore: 3 });
  assert.deepEqual([...got(one), one.cumulativeVials], [1, 5, 50, 4]);
  assert.match(one.notes.join(' '), /Infuse over 10 minutes/);
  assert.equal(a({ product: 'anascorp', dose: 'later-dose' }).flag, 'not-in-label');
});

test('nothing is defaulted', () => {
  assert.match(a({}).message, /^Choose the product/);
  assert.match(a({ product: 'crofab' }).message, /^Choose which dose this is/);
  assert.match(a({ product: 'crofab', dose: 'later-dose', controlTime: 'noon' }).message, /^Enter the time initial control was achieved/);
  assert.equal(usAntivenomDose(null, now).valid, false);
});
