// spec-v1557 tool 1: WHO 2018 rabies PEP. Each category and history, the immunocompromised rule, RIG ceilings,
// the day-7 deadline, schedule dates, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoRabiesPep as r } from '../../lib/who-rabies-pep-v1557.js';

const B = { category: 'III', prior: 'none', immuno: 'no', weight: '20', rig: 'human', day0: '2026-10-05' };

test('category I: no PEP', () => {
  assert.equal(r({ ...B, category: 'I' }).bandLabel, 'No PEP');
});

test('never vaccinated: category II vaccine only, category III vaccine plus RIG, with dates', () => {
  const two = r({ ...B, category: 'II' });
  assert.equal(two.bandLabel, 'Vaccine, no RIG');
  assert.doesNotMatch(two.notes.join(' '), /IU/);
  const three = r(B);
  assert.equal(three.bandLabel, 'Vaccine + RIG');
  assert.match(three.band, /day 0 \(October 5, 2026\), day 3 \(October 8, 2026\) and day 7 \(October 12, 2026\)/);
  assert.match(three.band, /one day from day 14 to 28 \(October 19, 2026 to November 2, 2026\)/);
  assert.match(three.band, /day 21 \(October 26, 2026\)/);
});

test('RIG: 20 IU/kg human or 40 IU/kg equine as a ceiling, never after day 7', () => {
  const h = r(B).notes.join(' ');
  assert.match(h, /at most 20 IU\/kg, 400 IU for 20 kg\. That is a ceiling, not a target/);
  assert.match(h, /not after day 7 from the first vaccine dose \(October 12, 2026\)/);
  const e = r({ ...B, rig: 'equine' }).notes.join(' ');
  assert.match(e, /at most 40 IU\/kg, 800 IU for 20 kg/);
  assert.match(e, /No skin test before equine RIG/);
  assert.match(r({ ...B, rig: 'none' }).notes.join(' '), /give the vaccine anyway/);
  assert.match(r({ ...B, rig: 'mab' }).notes.join(' '), /dose by the product label/);
  assert.match(r({ ...B, weight: '' }).notes.join(' '), /No weight was entered/);
});

test('an unknown history is treated as none and keeps RIG', () => {
  const u = r({ ...B, prior: 'unknown' });
  assert.equal(u.bandLabel, 'Vaccine + RIG');
  assert.match(u.band, /treated as never vaccinated/);
});

test('previously vaccinated: vaccine only, never RIG; a complete PEP under 3 months: wound care only', () => {
  const p = r({ ...B, prior: 'prior' });
  assert.equal(p.bandLabel, 'Vaccine, no RIG');
  assert.match(p.band, /1-site ID on day 0 \(October 5, 2026\) and day 3 \(October 8, 2026\); 4-site ID on day 0 only; or 1-site IM on day 0 and day 3/);
  assert.doesNotMatch(p.notes.join(' '), /IU\/kg/);
  const rec = r({ ...B, prior: 'recent' });
  assert.equal(rec.bandLabel, 'Wound care only');
});

test('immunocompromised: full course plus RIG in category II and even when previously vaccinated', () => {
  for (const prior of ['none', 'prior', 'recent']) {
    const x = r({ ...B, category: 'II', prior, immuno: 'yes' });
    assert.equal(x.bandLabel, 'Full course + RIG', prior);
    assert.match(x.notes.join(' '), /at most 20 IU\/kg/);
  }
  assert.match(r({ ...B, immuno: 'yes' }).band, /one day from day 21 to 28 \(October 26, 2026 to November 2, 2026\)/);
});

test('the stop rule and late presentation', () => {
  const n = r(B).notes.join(' ');
  assert.match(n, /stays healthy for 10 days from the bite/);
  assert.match(n, /even if it happened months or years ago/);
});

test('refusals', () => {
  for (const k of ['category', 'prior', 'immuno']) assert.equal(r({ ...B, [k]: '' }).valid, false, k);
  assert.equal(r({ ...B, day0: '2026-02-30' }).valid, false);
  assert.equal(r({ ...B, weight: '0.1' }).valid, false);
  assert.equal(r({ ...B, rig: 'goat' }).valid, false);
  assert.equal(r().valid, false);
});
