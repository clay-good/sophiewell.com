// spec-v702: Edinburgh Claudication Questionnaire.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { edinburghClaudication } from '../../lib/edinburgh-claudication-v702.js';

// The four character criteria met, calf pain, not at ordinary pace -> definite, grade I.
const DEFINITE = { painOnWalking: true, painAtRest: false, painUphillHurry: true, reliefWithin10: true, painOrdinaryPace: false, painSite: 'calf' };

test('classic pattern -> definite claudication, grade I', () => {
  const r = edinburghClaudication(DEFINITE);
  assert.equal(r.valid, true);
  assert.equal(r.code, 'definite');
  assert.equal(r.grade, 'I');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /definite claudication, grade I/);
});

test('pain at ordinary pace makes it grade II', () => {
  const r = edinburghClaudication({ ...DEFINITE, painOrdinaryPace: true });
  assert.equal(r.code, 'definite');
  assert.equal(r.grade, 'II');
});

test('thigh/buttock-only pain -> atypical', () => {
  const r = edinburghClaudication({ ...DEFINITE, painSite: 'thigh-buttock' });
  assert.equal(r.code, 'atypical');
  assert.equal(r.grade, 'I');
});

test('any character criterion failing -> not claudication', () => {
  assert.equal(edinburghClaudication({ ...DEFINITE, painAtRest: true }).code, 'not-claudication');   // pain at rest
  assert.equal(edinburghClaudication({ ...DEFINITE, painUphillHurry: false }).code, 'not-claudication');
  assert.equal(edinburghClaudication({ ...DEFINITE, reliefWithin10: false }).code, 'not-claudication');
  assert.equal(edinburghClaudication({ ...DEFINITE, painOnWalking: false }).code, 'not-claudication');
});

test('criteria met but non-vascular distribution -> not claudication, no grade', () => {
  const r = edinburghClaudication({ ...DEFINITE, painSite: 'other' });
  assert.equal(r.code, 'not-claudication');
  assert.equal(r.grade, null);
  assert.equal(r.abnormal, false);
});

test('pain site is required', () => {
  assert.equal(edinburghClaudication({ painOnWalking: true }).valid, false);
  assert.equal(edinburghClaudication({ painOnWalking: true }).field, 'painSite');
});
