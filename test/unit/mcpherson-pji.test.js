// spec-v1427: McPherson staging of periprosthetic joint infection (Coughlan & Taylor 2020, Tables 1-2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mcphersonPji as mph, MPH_SYSTEMIC, MPH_CRITICAL, MPH_LOCAL } from '../../lib/mcpherson-pji-v1427.js';

const allNo = () => Object.fromEntries([...MPH_SYSTEMIC, ...MPH_CRITICAL, ...MPH_LOCAL].map((f) => [f.key, 'no']));

test('every factor answered no is stage I/A/1', () => {
  const r = mph({ type: 'I', ...allNo() });
  assert.equal(r.complete, true);
  assert.equal(r.bandLabel, 'I/A/1');
  assert.equal(r.band, 'McPherson stage I/A/1: early postoperative infection in an uncompromised host with an uncompromised limb.');
});

test('host grade follows the count: 0 A, 1 to 2 B, more than 2 C', () => {
  const base = { type: 'II', ...allNo() };
  assert.equal(mph({ ...base }).host, 'A');
  assert.equal(mph({ ...base, diabetes: 'yes' }).host, 'B');
  assert.equal(mph({ ...base, diabetes: 'yes', nicotine: 'yes' }).host, 'B');
  assert.equal(mph({ ...base, diabetes: 'yes', nicotine: 'yes', age80: 'yes' }).host, 'C');
});

test('any one critical factor makes the host C by itself', () => {
  for (const f of MPH_CRITICAL) {
    const r = mph({ type: 'III', ...allNo(), [f.key]: 'yes' });
    assert.equal(r.host, 'C', f.key);
    assert.match(r.notes[0], /Host grade C on its own/);
  }
});

test('limb grade follows the count: 0 is 1, 1 to 2 is 2, more than 2 is 3', () => {
  const base = { type: 'III', ...allNo() };
  assert.equal(mph({ ...base }).limb, '1');
  assert.equal(mph({ ...base, fistula: 'yes', incisions: 'yes' }).limb, '2');
  assert.equal(mph({ ...base, fistula: 'yes', incisions: 'yes', vascular: 'yes' }).limb, '3');
});

test('the worked example needs no other answers: C and 3 are already the top grades', () => {
  const r = mph({ type: 'III', ivdu: 'yes', fistula: 'yes', abscess: 'yes', longInfection: 'yes' });
  assert.equal(r.complete, true);
  assert.equal(r.band, 'McPherson stage III/C/3: late chronic infection in a significantly compromised host with a significantly compromised limb.');
});

test('a blank is not a no: unanswered factors give the range the grade could be', () => {
  const r = mph({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.complete, false);
  assert.equal(r.host, 'A to C');
  assert.equal(r.limb, '1 to 3');
  assert.match(r.band, /answer the remaining factors/);
  const one = { type: 'I', ...allNo() }; delete one.diabetes;
  const s = mph(one);
  assert.equal(s.host, 'A to B');
  assert.match(s.notes.join(' '), /1 host factor is not answered/);
  const crit = { type: 'I', ...allNo() }; delete crit.cd4;
  assert.equal(mph(crit).host, 'A to C');
});

test('three systemic factors fix C even with others blank', () => {
  const r = mph({ type: 'II', diabetes: 'yes', nicotine: 'yes', alcoholism: 'yes', ...Object.fromEntries(MPH_LOCAL.map((f) => [f.key, 'no'])) });
  assert.equal(r.host, 'C');
  assert.equal(r.complete, true);
});

test('every answer carries the validation caveat; a missing type is refused', () => {
  assert.ok(mph({ type: 'I', ...allNo() }).notes.some((n) => /not been validated/.test(n)));
  assert.equal(mph({}).valid, false);
  assert.match(mph({ type: 'IV' }).message, /infection type/);
  assert.equal(mph(null).valid, false);
});
