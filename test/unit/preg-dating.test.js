// spec-v629 wave 13: deterministic pregnancy-dating composition (lib/preg-dating.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pregnancyDating } from '../../lib/preg-dating.js';

test('full example: LMP + CRL + ultrasound date (matches META example)', () => {
  const r = pregnancyDating({ lmpIso: '2025-12-23', crlMm: 50, ultrasoundDateIso: '2026-03-12' });
  assert.equal(r.lmpEdd, '2026-09-29');       // Naegele: LMP + 280
  assert.equal(r.crlGaWeeks, 11);             // Robinson-Fleming at CRL 50 mm
  assert.equal(r.crlGaRemainderDays, 5);      // 11w 5d
  assert.equal(r.crlEdd, '2026-09-26');
  assert.equal(r.discordanceDays, 3);         // LMP GA vs CRL GA at the same date
  assert.equal(r.trimester, 1);
  assert.equal(r.redateThreshold, 7);
  assert.equal(r.discordant, false);          // 3 <= 7, within accepted limit
});

test('deterministic: no clock dependence, so repeated calls are identical', () => {
  const a = pregnancyDating({ lmpIso: '2025-12-23', crlMm: 50, ultrasoundDateIso: '2026-03-12' });
  const b = pregnancyDating({ lmpIso: '2025-12-23', crlMm: 50, ultrasoundDateIso: '2026-03-12' });
  assert.deepEqual(a, b);
});

test('LMP only: reports EDD, no clock-based GA or discordance', () => {
  const r = pregnancyDating({ lmpIso: '2025-12-23' });
  assert.equal(r.lmpEdd, '2026-09-29');
  assert.equal(r.crlGaWeeks, undefined);
  assert.equal(r.discordanceDays, undefined);
});

test('CRL only (no ultrasound date): GA is reported, EDD is not (needs the date)', () => {
  const r = pregnancyDating({ crlMm: 50 });
  assert.equal(r.crlGaWeeks, 11);
  assert.equal(r.crlGaRemainderDays, 5);
  assert.equal(r.crlEdd, undefined);          // never clock-derived
  assert.equal(r.lmpEdd, undefined);
});

test('CRL as a numeric string round-trips (DOM contract)', () => {
  const r = pregnancyDating({ crlMm: '50' });
  assert.equal(r.crlGaWeeks, 11);
});

test('null when nothing computable is supplied', () => {
  assert.equal(pregnancyDating({}), null);
  assert.equal(pregnancyDating(), null);
  assert.equal(pregnancyDating({ ultrasoundDateIso: '2026-03-12' }), null); // date alone
  // spec-v1728: a CRL that WAS entered but is not usable is refused, not null.
  assert.match(pregnancyDating({ crlMm: 0 }).message, /between 1 and 120 mm/);
});

test('malformed date throws (surfaced as COMPUTE_ERROR by the MCP layer)', () => {
  assert.throws(() => pregnancyDating({ lmpIso: 'not-a-date' }), RangeError);
});

test('implausible CRL is out of the dating range: no crl output, no overflow', () => {
  // An absurd CRL (past the Robinson-Fleming range) must never overflow the date
  // math into a non-finite value. spec-v1728: it used to be dropped as if it had
  // not been entered; it is refused by name now, before any date math runs.
  const r = pregnancyDating({ lmpIso: '2025-12-23', crlMm: 1e308, ultrasoundDateIso: '2026-03-12' });
  assert.equal(r.valid, false);
  assert.match(r.message, /between 1 and 120 mm\. Check the value entered\.$/);
  assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
  assert.equal(pregnancyDating({ crlMm: 5000 }).valid, false);
});

// spec-v1738: an ultrasound dated on or before the LMP is refused, not dated and called discordant.
test('an ultrasound date not after the LMP is refused', () => {
  const r = pregnancyDating({ lmpIso: '2026-03-12', crlMm: 50, ultrasoundDateIso: '2025-12-23' });
  assert.equal(r.valid, false);
  assert.match(r.message, /not after the last menstrual period/);
  assert.equal(pregnancyDating({ lmpIso: '2025-12-23', crlMm: 50, ultrasoundDateIso: '2026-03-12' }).discordant, false);
});
