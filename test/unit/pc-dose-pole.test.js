// spec-v1562 tool 1: WHO mass treatment doses. Every praziquantel and ivermectin pole edge, the 140 cm
// ivermectin gap, the age rows, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcDosePole as p } from '../../lib/pc-dose-pole-v1562.js';

test('praziquantel pole: 94 / 110 / 125 / 138 / 150 / 160 / 178 cm', () => {
  for (const [h, label] of [['93.9', 'Below the pole'], ['94', '1 tablet'], ['109.9', '1 tablet'], ['110', '1½ tablets'], ['125', '2 tablets'], ['138', '2½ tablets'], ['150', '3 tablets'], ['159.9', '3 tablets'], ['160', '4 tablets'], ['177.9', '4 tablets'], ['178', '5 tablets']]) {
    assert.equal(p({ drug: 'pzq', height: h }).bandLabel, label, h);
  }
  assert.match(p({ drug: 'pzq', height: '140' }).band, /2½ tablets of 600 mg \(1,500 mg\)/);
});

test('ivermectin pole: 90 / 120 / 141 / above 159 cm, with the 140 cm gap read as 2 tablets', () => {
  for (const [h, label] of [['89.9', 'Not eligible'], ['90', '1 tablet'], ['119.9', '1 tablet'], ['120', '2 tablets'], ['140.5', '2 tablets'], ['141', '3 tablets'], ['159', '3 tablets'], ['159.5', '4 tablets']]) {
    assert.equal(p({ drug: 'ivm', height: h }).bandLabel, label, h);
  }
  assert.match(p({ drug: 'ivm', height: '140' }).notes.join(' '), /140 cm in no band/);
  assert.match(p({ drug: 'ivm', height: '150' }).notes.join(' '), /Loa loa/);
});

test('by age: albendazole, mebendazole and DEC', () => {
  assert.equal(p({ drug: 'alb', age: '0.9' }).bandLabel, 'Under 12 months');
  assert.equal(p({ drug: 'alb', age: '1' }).bandLabel, '200 mg');
  assert.equal(p({ drug: 'alb', age: '2' }).bandLabel, '400 mg');
  assert.equal(p({ drug: 'mbd', age: '1' }).bandLabel, '500 mg');
  assert.equal(p({ drug: 'dec', age: '1.9' }).bandLabel, 'Not eligible');
  assert.equal(p({ drug: 'dec', age: '2' }).bandLabel, '100 mg');
  assert.equal(p({ drug: 'dec', age: '5.9' }).bandLabel, '100 mg');
  assert.equal(p({ drug: 'dec', age: '6' }).bandLabel, '200 mg');
  assert.equal(p({ drug: 'dec', age: '15' }).bandLabel, '200 mg');
  assert.equal(p({ drug: 'dec', age: '15.5' }).bandLabel, '300 mg');
  assert.match(p({ drug: 'dec', age: '30' }).notes.join(' '), /only where onchocerciasis is absent/);
});

test('refusals', () => {
  assert.equal(p({ height: '120' }).valid, false);
  assert.match(p({ drug: 'pzq' }).message, /height/);
  assert.match(p({ drug: 'dec' }).message, /age/);
  assert.equal(p({ drug: 'ivm', height: '300' }).valid, false);
  assert.equal(p().valid, false);
});
