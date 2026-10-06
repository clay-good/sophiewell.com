// spec-v1549 tool 2: F-100 and RUTF amounts. F-100 at 2.2 and 10 kg, the lower-row rule, RUTF 2023 vs the
// 2014 table at 5.0 kg, the 12.0 kg edge, the sachet default, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f100RutfAmount as f } from '../../lib/f100-rutf-amount-v1549.js';

test('F-100: 2.2 kg 55-80 mL, 10 kg 250-365 mL per feed', () => {
  assert.equal(f({ weight: '2.2', phase: 'f100' }).bandLabel, '55-80 mL per feed');
  assert.equal(f({ weight: '10', phase: 'f100' }).bandLabel, '250-365 mL per feed');
  assert.match(f({ weight: '4.5', phase: 'f100' }).notes[0], /4\.4 kg row/);
  assert.match(f({ weight: '12', phase: 'f100' }).notes[0], /Above 10 kg/);
});

test('outpatient RUTF, WHO 2023: 6.0 kg is 1.8-2.22 sachets; the 2014 table beside it', () => {
  const r = f({ weight: '6.0', phase: 'outpatient', sachet: '500' });
  assert.equal(r.bandLabel, '1.8-2.22 sachets a day');
  assert.match(r.notes.join(' '), /IMCI 2014 table, which predates the 2023 range and gives more, says 2\.5 sachets a day \(18 a week\)/);
  assert.match(f({ weight: '5.0', phase: 'outpatient', sachet: '500' }).bandLabel, /^1\.5-1\.85 sachets/);
  assert.match(f({ weight: '12.0', phase: 'outpatient', sachet: '500' }).notes.join(' '), /5 sachets a day \(35 a week\); it leaves 11\.9-12\.0 kg/);
});

test('transition and reduced phases, and a blank sachet energy', () => {
  assert.match(f({ weight: '6', phase: 'transition', sachet: '500' }).band, /100-135 kcal\/kg\/day/);
  assert.match(f({ weight: '6', phase: 'reduced', sachet: '500' }).band, /100-130 kcal\/kg\/day/);
  assert.match(f({ weight: '6', phase: 'outpatient' }).notes[0], /No sachet energy was entered/);
});

test('refusals', () => {
  assert.equal(f({ phase: 'f100' }).valid, false);
  assert.equal(f({ weight: '6' }).valid, false);
  assert.equal(f({ weight: '6', phase: 'outpatient', sachet: '50' }).valid, false);
});
