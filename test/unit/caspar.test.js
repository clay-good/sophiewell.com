// spec-v147 2.6: CASPAR psoriatic-arthritis classification (Taylor 2006). Entry
// condition + >=3 of max 6 points. Current psoriasis is the only 2-point item.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caspar } from '../../lib/rheum-v147.js';

test('entry condition not met -> criteria not applicable', () => {
  const r = caspar({ psoriasis: 'current', nail: true });
  assert.equal(r.valid, true);
  assert.equal(r.applicable, false);
  assert.equal(r.abnormal, false);
});

test('tile example: current psoriasis (2) + nail (1) = 3 -> CASPAR-positive', () => {
  const r = caspar({ entry: true, psoriasis: 'current', nail: true });
  assert.equal(r.applicable, true);
  assert.equal(r.score, 3);
  assert.equal(r.bandLabel, 'Psoriatic arthritis (CASPAR-positive)');
  assert.equal(r.abnormal, true);
});

test('history psoriasis is 1 point, not 2: family (1) + nail (1) = 2 -> not classified', () => {
  const r = caspar({ entry: true, psoriasis: 'family', nail: true });
  assert.equal(r.score, 2);
  assert.equal(r.bandLabel, 'Not classified');
  assert.equal(r.abnormal, false);
});

test('threshold flip: 2 not classified, 3 classified', () => {
  assert.equal(caspar({ entry: true, psoriasis: 'none', nail: true, rfNegative: true }).bandLabel, 'Not classified'); // 2
  assert.equal(caspar({ entry: true, psoriasis: 'none', nail: true, rfNegative: true, dactylitis: true }).bandLabel, 'Psoriatic arthritis (CASPAR-positive)'); // 3
});

test('ceiling 6: current psoriasis (2) + all four 1-point items', () => {
  const r = caspar({ entry: true, psoriasis: 'current', nail: true, rfNegative: true, dactylitis: true, juxtaBone: true });
  assert.equal(r.score, 6);
});

test('entry met but psoriasis status unset -> complete-the-fields', () => {
  const r = caspar({ entry: true, nail: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /psoriasis status/);
});
