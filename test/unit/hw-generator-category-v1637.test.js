// spec-v1637 tool 24: Table 1 to 40 CFR 262.13, with each boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hwGeneratorCategory } from '../../lib/hw-generator-category-v1637.js';

const c = (acuteKg, nonAcuteKg, residueKg = 0, subpartP = 'pharmaceuticals-under-subpart-p') => hwGeneratorCategory({ acuteKg, nonAcuteKg, residueKg, subpartP }).category;

test('the acute boundary: exactly 1 kg is not large, 1.01 kg is', () => {
  assert.equal(c(1, 0), 'very small quantity generator');
  assert.equal(c(1.01, 0), 'large quantity generator');
});

test('the non-acute boundaries: 100 kg is very small, over 100 is small, 1,000 kg is large', () => {
  assert.equal(c(0, 100), 'very small quantity generator');
  assert.equal(c(0, 100.5), 'small quantity generator');
  assert.equal(c(0, 999.9), 'small quantity generator');
  assert.equal(c(0, 1000), 'large quantity generator');
});

test('the cleanup residue boundary: 100 kg is not large, over 100 kg is', () => {
  assert.equal(c(0, 0, 100), 'very small quantity generator');
  assert.equal(c(0, 0, 100.1), 'large quantity generator');
});

test('the more stringent category governs, and every driver is named', () => {
  const r = hwGeneratorCategory({ acuteKg: 2, nonAcuteKg: 1500, residueKg: 0, subpartP: 'pharmaceuticals-under-subpart-p' });
  assert.deepEqual([r.category, r.drivers.length, r.rank], ['large quantity generator', 2, 2]);
  assert.equal(c(1, 500), 'small quantity generator');
});

test('subpart P: what each answer says about the all-in count', () => {
  const p = hwGeneratorCategory({ acuteKg: 0, nonAcuteKg: 50, residueKg: 0, subpartP: 'pharmaceuticals-under-subpart-p' });
  assert.match(p.note, /Add the pharmaceuticals back in/);
  const all = hwGeneratorCategory({ acuteKg: 0, nonAcuteKg: 50, residueKg: 0, subpartP: 'pharmaceuticals-counted-above' });
  assert.match(all.note, /remains under 262\.14/);
  assert.match(hwGeneratorCategory({ acuteKg: 3, nonAcuteKg: 50, residueKg: 0, subpartP: 'pharmaceuticals-counted-above' }).note, /manages its hazardous waste pharmaceuticals under subpart P/);
  assert.match(p.note, /nicotine patches, gums and lozenges are not P075/);
});

test('zero must be entered, not assumed', () => {
  assert.match(hwGeneratorCategory({ nonAcuteKg: 50, residueKg: 0, subpartP: 'pharmaceuticals-under-subpart-p' }).message, /^Enter the acute hazardous waste/);
  assert.match(hwGeneratorCategory({ acuteKg: 0, nonAcuteKg: 50, subpartP: 'pharmaceuticals-under-subpart-p' }).message, /^Enter the residues/);
  assert.match(hwGeneratorCategory({ acuteKg: 0, nonAcuteKg: 50, residueKg: 0 }).message, /^Choose whether hazardous waste pharmaceuticals/);
  assert.equal(hwGeneratorCategory({ acuteKg: -1, nonAcuteKg: 50, residueKg: 0, subpartP: 'pharmaceuticals-under-subpart-p' }).valid, false);
});
