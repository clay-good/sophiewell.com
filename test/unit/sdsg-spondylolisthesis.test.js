// spec-v1430: SDSG lumbosacral spondylolisthesis types (Camino Willhuber & Kido 2020).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sdsgSpondylolisthesis as sd } from '../../lib/sdsg-spondylolisthesis-v1430.js';

test('low-grade slips are typed by pelvic incidence at 45 and 60 degrees', () => {
  assert.equal(sd({ slip: 20, pi: 38 }).type, 1);
  assert.equal(sd({ slip: 20, pi: 44.9 }).type, 1);
  assert.equal(sd({ slip: 20, pi: 45 }).type, 2);
  assert.equal(sd({ slip: 20, pi: 60 }).type, 2);
  assert.equal(sd({ slip: 20, pi: 60.1 }).type, 3);
  assert.equal(sd({ slip: '30', pi: '72' }).type, 3);
  assert.equal(sd({ slip: 20, pi: 52 }).band, 'SDSG type 2: low-grade slip with a normal pelvic incidence (45° to 60°).');
  assert.equal(sd({ slip: 20, pi: 52 }).grade, 'low');
});

test('high-grade slips are typed by sacropelvic balance then the plumb line', () => {
  assert.equal(sd({ slip: 60, sacropelvic: 'balanced' }).type, 4);
  assert.equal(sd({ slip: 60, sacropelvic: 'unbalanced', plumb: 'behind' }).type, 5);
  assert.equal(sd({ slip: 60, sacropelvic: 'unbalanced', plumb: 'anterior' }).type, 6);
  assert.equal(sd({ slip: 120, sacropelvic: 'balanced', plumb: 'anterior' }).type, 4);
  assert.equal(sd({ slip: 60, sacropelvic: 'balanced' }).grade, 'high');
  assert.ok(sd({ slip: 60, sacropelvic: 'balanced' }).notes.some((n) => /no number for high pelvic tilt/.test(n)));
  assert.ok(sd({ slip: 60, sacropelvic: 'balanced' }).notes.some((n) => /considerable caution/.test(n)));
});

test('exactly 50% is low grade and says so; 50.1% is high grade', () => {
  const r = sd({ slip: 50, pi: 50 });
  assert.equal(r.grade, 'low');
  assert.ok(r.notes.some((n) => /exactly 50%/.test(n)));
  assert.equal(sd({ slip: 50.1, sacropelvic: 'balanced' }).grade, 'high');
});

test('a pelvic incidence within 5 degrees of a cutoff is flagged', () => {
  assert.ok(sd({ slip: 20, pi: 42 }).notes.some((n) => /measurement error/.test(n)));
  assert.ok(sd({ slip: 20, pi: 64 }).notes.some((n) => /measurement error/.test(n)));
  assert.ok(!sd({ slip: 20, pi: 52 }).notes.some((n) => /measurement error/.test(n)));
  assert.ok(!sd({ slip: 20, pi: 70 }).notes.some((n) => /measurement error/.test(n)));
});

test('imbalance in a low-grade slip is reported, not hidden', () => {
  const r = sd({ slip: 20, pi: 52, sacropelvic: 'unbalanced', plumb: 'anterior' });
  assert.equal(r.type, 2);
  assert.ok(r.notes.some((n) => /Not a clean fit: the pelvis is marked unbalanced and the C7 plumb line/.test(n)));
  assert.ok(!sd({ slip: 20, pi: 52, sacropelvic: 'balanced' }).notes.some((n) => /Not a clean fit/.test(n)));
});

test('missing or impossible inputs are refused', () => {
  assert.match(sd({}).message, /slip of L5 on S1/);
  assert.match(sd({ slip: '  ' }).message, /slip of L5 on S1/);
  assert.equal(sd({ slip: 0, pi: 50 }).valid, false);
  assert.equal(sd({ slip: 250, pi: 50 }).valid, false);
  assert.match(sd({ slip: 20 }).message, /pelvic incidence/);
  assert.equal(sd({ slip: 20, pi: 0 }).valid, false);
  assert.equal(sd({ slip: 20, pi: 150 }).valid, false);
  assert.match(sd({ slip: 60 }).message, /sacropelvic/);
  assert.match(sd({ slip: 60, sacropelvic: 'unbalanced' }).message, /plumb line/);
  assert.equal(sd({ slip: 60, pi: 50 }).valid, false);
});
