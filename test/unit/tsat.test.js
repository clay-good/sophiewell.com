// spec-v55 §2.3: transferrin saturation + iron-studies pattern.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tsat } from '../../lib/clinical-v6.js';

test('tsat low: iron 50 / TIBC 400 -> 12.5%', () => {
  const r = tsat({ ironUgDl: 50, tibcUgDl: 400 });
  assert.equal(r.tsat, 12.5);
  assert.match(r.pattern, /iron-deficient/);
});

test('tsat absolute iron deficiency: low TSAT + low ferritin', () => {
  const r = tsat({ ironUgDl: 30, tibcUgDl: 450, ferritinNgMl: 10 });
  assert.equal(r.tsat, 6.7);
  assert.match(r.pattern, /absolute iron deficiency/);
});

test('tsat functional: low TSAT + normal ferritin', () => {
  const r = tsat({ ironUgDl: 40, tibcUgDl: 300, ferritinNgMl: 200 });
  assert.match(r.pattern, /functional iron deficiency/);
});

test('tsat normal range: iron 100 / TIBC 300 -> 33.3%', () => {
  const r = tsat({ ironUgDl: 100, tibcUgDl: 300 });
  assert.equal(r.tsat, 33.3);
  assert.match(r.pattern, /within the usual reference range/);
});

test('tsat overload pattern: TSAT > 50%', () => {
  const r = tsat({ ironUgDl: 200, tibcUgDl: 300 });
  assert.match(r.pattern, /overload/);
});

test('tsat rejects impossible input', () => {
  assert.throws(() => tsat({ ironUgDl: 50, tibcUgDl: 0 }), /tibcUgDl/);
});
