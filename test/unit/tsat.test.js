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
  assert.throws(() => tsat({ ironUgDl: 50, tibcUgDl: 0 }), /tibc\sug\sdl/);
});

// spec-v1784: with the iron and TIBC the wrong way round -- iron 450, TIBC 30 -- this reported "TSAT 1500%"
// and offered a hemochromatosis work-up. TIBC is a capacity, so a saturation above 100% means the iron is
// above the capacity to bind it.
test('a saturation above 100% says the iron is above the binding capacity (spec-v1784)', () => {
  const swapped = tsat({ ironUgDl: 450, tibcUgDl: 30 });
  assert.equal(swapped.tsat, 1500);
  assert.match(swapped.pattern, /above the total iron-binding capacity/);
  assert.doesNotMatch(swapped.pattern, /hemochromatosis/);
  // Not refused: the serum iron genuinely can exceed TIBC in acute iron ingestion, and the arithmetic stays.
  assert.notEqual(swapped.valid, false);
  // Exactly 100% is a real saturation, so the overload band still reads as before.
  assert.match(tsat({ ironUgDl: 300, tibcUgDl: 300 }).pattern, /iron-overload pattern/);
  assert.match(tsat({ ironUgDl: 301, tibcUgDl: 300 }).pattern, /above the total iron-binding capacity/);
  // And the ordinary readings are untouched.
  assert.match(tsat({ ironUgDl: 30, tibcUgDl: 450 }).pattern, /TSAT <20%/);
  assert.match(tsat({ ironUgDl: 100, tibcUgDl: 400 }).pattern, /within the usual reference range/);
});
