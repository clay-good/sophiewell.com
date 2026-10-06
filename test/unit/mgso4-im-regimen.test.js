// spec-v1558 tool 3: magnesium sulfate IM regimen and the next-dose safety check. The two sources' IV rates,
// urine limits (110 and 125 mL in 4 hours), the 16-breath edge, the IM-only and referral regimens, refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mgso4ImRegimen as m } from '../../lib/mgso4-im-regimen-v1558.js';

const M = { source: 'mcpc', regimen: 'ivim' };
const P = { source: 'pcpnc', regimen: 'ivim' };
const OK = { rr: '18', reflex: 'present', urine: '200' };

test('loading: 4 g IV over 5 minutes (MCPC) or 20 minutes (PCPNC), plus 10 g IM', () => {
  const a = m(M);
  assert.match(a.band, /4 g IV over 5 minutes plus 10 g IM to load, then 5 g IM every 4 hours\./);
  assert.match(a.notes[0], /4 g IV \(20 mL of 20%\) over 5 minutes, then promptly 10 g IM, as 5 g \(10 mL of 50%\) with 1 mL of 2% lidocaine/);
  assert.match(m(P).band, /over 20 minutes/);
  assert.match(m(M).notes.join(' '), /calcium gluconate 1 g \(10 mL of 10%\) IV over 3 minutes/);
  assert.match(m(P).notes.join(' '), /over 10 minutes if breathing/);
  assert.match(m(M).notes.join(' '), /MCPC prints it as 50% solution/);
});

test('IM only and loading then referral', () => {
  assert.match(m({ ...P, regimen: 'imonly' }).band, /IM only \(PCPNC\): 10 g IM to load/);
  assert.match(m({ ...M, regimen: 'imonly' }).notes[0], /MCPC prints no IM-only loading/);
  assert.match(m({ ...P, regimen: 'refer' }).notes.join(' '), /refer urgently\. If referral is delayed/);
});

test('urine limit by source: 110 mL holds under MCPC and gives under PCPNC; 125 gives under both', () => {
  assert.equal(m({ ...M, ...OK, urine: '110' }).bandLabel, 'Hold the next dose');
  assert.equal(m({ ...P, ...OK, urine: '110' }).bandLabel, 'Next dose: safe to give');
  assert.equal(m({ ...M, ...OK, urine: '125' }).bandLabel, 'Next dose: safe to give');
  assert.equal(m({ ...M, ...OK, urine: '120' }).bandLabel, 'Next dose: safe to give', '30 mL an hour over 4 hours');
  assert.equal(m({ ...P, ...OK, urine: '100' }).bandLabel, 'Hold the next dose', 'exactly 100 is read as hold');
});

test('breathing: MCPC gives at 16, PCPNC holds at 16; an absent reflex always holds', () => {
  assert.equal(m({ ...M, ...OK, rr: '16' }).bandLabel, 'Next dose: safe to give');
  assert.equal(m({ ...M, ...OK, rr: '15' }).bandLabel, 'Hold the next dose');
  assert.equal(m({ ...P, ...OK, rr: '16' }).bandLabel, 'Hold the next dose');
  assert.equal(m({ ...P, ...OK, rr: '17' }).bandLabel, 'Next dose: safe to give');
  const r = m({ ...M, ...OK, reflex: 'absent' });
  assert.equal(r.bandLabel, 'Hold the next dose');
  assert.match(r.band, /knee reflex absent/);
});

test('a partial check asks for the rest; never "safe" from two of three', () => {
  const x = m({ ...M, rr: '18', reflex: 'present' });
  assert.equal(x.valid, false);
  assert.match(x.message, /Enter the urine over the last 4 hours/);
});

test('refusals', () => {
  assert.equal(m({ regimen: 'ivim' }).valid, false);
  assert.equal(m({ source: 'mcpc' }).valid, false);
  assert.equal(m({ ...M, ...OK, rr: '200' }).valid, false);
  assert.equal(m({ ...M, ...OK, reflex: 'brisk' }).valid, false);
  assert.equal(m().valid, false);
});
