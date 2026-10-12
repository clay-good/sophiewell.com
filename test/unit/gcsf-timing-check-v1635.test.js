// spec-v1635 tool 11: filgrastim and pegfilgrastim timing against chemotherapy, from the reference labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gcsfTimingCheck, LABELS } from '../../lib/gcsf-timing-check-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const g = (i, t) => gcsfTimingCheck(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const peg = { product: 'pegfilgrastim', population: 'adult', chemoEnd: '2026-10-12T10:00' };
const fil = { product: 'filgrastim', chemoEnd: '2026-10-12T10:00' };

test('both label rows answer; each product withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(g({ ...peg, planned: '2026-10-13T10:00' }, dead(LABELS.pegfilgrastim.setId)).flag, 'withheld');
  assert.notEqual(g({ ...fil, planned: '2026-10-13T10:00' }, dead(LABELS.pegfilgrastim.setId)).flag, 'withheld');
  assert.equal(g({ ...fil, planned: '2026-10-13T10:00' }, dead(LABELS.filgrastim.setId)).flag, 'withheld');
});

test('pegfilgrastim 23 hours after chemotherapy fails; exactly 24 hours passes', () => {
  const r = g({ ...peg, planned: '2026-10-13T09:00', nextChemo: '2026-11-02T10:00' });
  assert.deepEqual([r.flag, r.allowed, r.earliest], ['too-soon-after', false, '2026-10-13 10:00']);
  const ok = g({ ...peg, planned: '2026-10-13T10:00', nextChemo: '2026-11-02T10:00' });
  assert.deepEqual([ok.flag, ok.allowed, ok.latest, ok.windowExists, ok.doseMg], ['allowed', true, '2026-10-19 10:00', true, 6]);
  // Exactly 14 days before the next cycle is not "between"; one minute later is.
  assert.equal(g({ ...peg, planned: '2026-10-19T10:00', nextChemo: '2026-11-02T10:00' }).flag, 'allowed');
  assert.equal(g({ ...peg, planned: '2026-10-19T10:01', nextChemo: '2026-11-02T10:00' }).flag, 'too-close-to-next');
});

test('pegfilgrastim: a 14-day cycle and a weekly cycle leave no allowed time', () => {
  for (const next of ['2026-10-26T10:00', '2026-10-19T10:00']) {
    const r = g({ ...peg, planned: '2026-10-13T10:00', nextChemo: next });
    assert.deepEqual([r.flag, r.windowExists, r.allowed], ['too-close-to-next', false, false]);
    assert.match(r.band, /leaves no allowed time/);
  }
  // 15 days leaves a single instant.
  assert.equal(g({ ...peg, planned: '2026-10-13T10:00', nextChemo: '2026-10-27T10:00' }).flag, 'allowed');
});

test('a missing next cycle is not reassurance', () => {
  const r = g({ ...peg, planned: '2026-10-14T10:00' });
  assert.deepEqual([r.flag, r.allowed, r.abnormal, r.latest], ['allowed-next-cycle-not-entered', null, true, null]);
  assert.match(r.band, /was not tested/);
});

test('filgrastim: 24 hours after and not within the 24 hours before', () => {
  const next = '2026-10-19T10:00';
  assert.equal(g({ ...fil, planned: '2026-10-13T09:59', nextChemo: next }).flag, 'too-soon-after');
  assert.equal(g({ ...fil, planned: '2026-10-13T10:00', nextChemo: next }).flag, 'allowed');
  assert.equal(g({ ...fil, planned: '2026-10-18T10:00', nextChemo: next }).flag, 'allowed');
  const late = g({ ...fil, planned: '2026-10-18T12:00', nextChemo: next });
  assert.deepEqual([late.flag, late.latest, late.doseMg], ['too-close-to-next', '2026-10-18 10:00', undefined]);
  assert.match(g({ ...fil, planned: '2026-10-11T12:00' }).band, /before this cycle's chemotherapy/);
});

test('pegfilgrastim dose: adults 6 mg at any weight; the pediatric table and its gaps', () => {
  const dose = (population, weight) => g({ ...peg, population, weight, planned: '2026-10-13T10:00', nextChemo: '2026-11-02T10:00' });
  assert.equal(dose('adult', 40).doseMg, 6);
  assert.match(dose('adult', 40).notes.join(' '), /weight table is for pediatric patients only/);
  assert.deepEqual([8, 9.9, 10, 20, 21, 30, 31, 44, 45, 60].map((w) => dose('child', w).doseMg), [0.8, 0.99, 1.5, 1.5, 2.5, 2.5, 4, 4, 6, 6]);
  for (const w of [20.5, 30.5, 44.5]) {
    const r = dose('child', w);
    assert.deepEqual([r.doseMg, r.abnormal, r.flag], [null, true, 'allowed'], String(w));
    assert.match(r.notes.join(' '), /No dose is assigned here/);
  }
  assert.match(dose('child', 44.5).notes.join(' '), /31 kg to 44 kg: 4 mg \(0\.4 mL\) and 45 kg or more: 6 mg/);
});

test('nothing is defaulted', () => {
  assert.match(g({}).message, /^Choose the product/);
  assert.match(g({ product: 'filgrastim' }).message, /^Enter when this cycle's chemotherapy/);
  assert.match(g({ ...fil }).message, /^Enter the planned growth-factor/);
  assert.match(g({ ...fil, planned: '2026-13-01T10:00' }).message, /as a date and time/);
  assert.match(g({ product: 'pegfilgrastim', chemoEnd: '2026-10-12T10:00', planned: '2026-10-13T10:00' }).message, /^Choose adult or pediatric patient/);
  assert.match(g({ ...peg, population: 'child', planned: '2026-10-13T10:00' }).message, /^Enter the weight/);
  assert.match(g({ ...fil, planned: '2026-10-13T10:00', nextChemo: '2026-10-12T10:00' }).message, /must be after/);
  assert.equal(gcsfTimingCheck(null, now).valid, false);
});
