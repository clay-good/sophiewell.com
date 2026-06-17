// spec-v99 2.1: Modified Duke criteria for infective endocarditis
// (2023 Duke-ISCVID; Fowler 2023 / Li 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dukeEndocarditis } from '../../lib/idcrit-v99.js';

test('2 major criteria -> definite', () => {
  const r = dukeEndocarditis({ major: ['microbiologic', 'imaging'] });
  assert.equal(r.verdict, 'definite');
  assert.match(r.band, /Definite infective endocarditis/);
});

test('1 major + 3 minor -> definite', () => {
  const r = dukeEndocarditis({ major: ['microbiologic'], minor: ['fever', 'vascular', 'predisposition'] });
  assert.equal(r.verdict, 'definite');
});

test('5 minor -> definite', () => {
  const r = dukeEndocarditis({ minor: ['fever', 'vascular', 'predisposition', 'immunologic', 'microbiologic-minor'] });
  assert.equal(r.verdict, 'definite');
});

test('1 major + 1 minor -> possible', () => {
  const r = dukeEndocarditis({ major: ['imaging'], minor: ['fever'] });
  assert.equal(r.verdict, 'possible');
});

test('3 minor -> possible', () => {
  const r = dukeEndocarditis({ minor: ['fever', 'vascular', 'immunologic'] });
  assert.equal(r.verdict, 'possible');
});

test('1 major alone -> rejected (does not reach possible)', () => {
  const r = dukeEndocarditis({ major: ['imaging'] });
  assert.equal(r.verdict, 'rejected');
  assert.match(r.band, /Rejected/);
});
