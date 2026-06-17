// spec-v98 2.4: CATCH rule for CT in childhood minor head injury (Osmond 2010).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catchHead } from '../../lib/peds-v98.js';

test('a high-risk factor -> CT indicated', () => {
  const r = catchHead({ high: ['gcs'] });
  assert.equal(r.indicated, true);
  assert.equal(r.highCount, 1);
  assert.match(r.band, /CT head indicated -- high-risk/);
});

test('a medium-risk factor alone -> CT indicated', () => {
  const r = catchHead({ medium: ['hematoma'] });
  assert.equal(r.indicated, true);
  assert.equal(r.mediumCount, 1);
  assert.match(r.band, /medium-risk/);
});

test('no factors -> CT may be deferred', () => {
  const r = catchHead({});
  assert.equal(r.indicated, false);
  assert.match(r.band, /may be deferred/);
});

test('high-risk wins the band wording when both fire', () => {
  const r = catchHead({ high: ['headache'], medium: ['mechanism'] });
  assert.equal(r.indicated, true);
  assert.match(r.band, /high-risk factor present/);
});
