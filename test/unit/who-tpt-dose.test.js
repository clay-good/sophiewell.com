// spec-v1553 tool 4: WHO TPT tablets by weight band. Table 4 cells, the age splits, the misprinted cell,
// 1HP's age floor, 4R's child gap and the specialist floor.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoTptDose as r } from '../../lib/who-tpt-dose-v1553.js';

test('part 1 cells', () => {
  assert.match(r({ regimen: '6H', weight: '20', age: '6' }).band, /isoniazid 100 mg dispersible 2 tablets/);
  assert.match(r({ regimen: '6H', weight: '70', age: '40' }).band, /isoniazid 300 mg 1\.25 tablets/);
  assert.match(r({ regimen: '3HR', weight: '10', age: '2' }).band, /75\/50 mg dispersible FDC 2 tablets/);
  assert.match(r({ regimen: '4R', weight: '32', age: '12' }).band, /rifampicin 150 mg 3 capsules/);
});

test('part 2 cells and age splits', () => {
  assert.match(r({ regimen: '3HP', weight: '4', age: '0.1' }).band, /isoniazid 100 mg dispersible 0\.6 tablets \(6 mL of suspension\) \+ rifapentine 150 mg dispersible 0\.5 tablets \(5 mL/);
  assert.match(r({ regimen: '3HP', weight: '4', age: '0.3' }).band, /0\.7 tablets \(7 mL/);
  assert.match(r({ regimen: '3HP', weight: '8', age: '0.4' }).band, /isoniazid 100 mg dispersible 1 tablet /);
  assert.match(r({ regimen: '3HP', weight: '8', age: '0.5' }).band, /isoniazid 100 mg dispersible 1\.5 tablets/);
  const adult = r({ regimen: '3HP', weight: '45', age: '30' });
  assert.ok(adult.notes.some((x) => /300\/300 mg FDC 3 tablets/.test(x)));
  assert.ok(adult.notes.some((x) => /isoniazid toxicity/.test(x)));
  assert.match(r({ regimen: '6Lfx', weight: '55', age: '30' }).band, /levofloxacin 250 mg 3 tablets/);
});

test('the misprinted 6H cell gives tablets only', () => {
  const x = r({ regimen: '6H', weight: '5', age: '0.5' });
  assert.match(x.band, /0\.5 tablets,/);
  assert.ok(x.notes.some((s) => /5 mL/.test(s)));
});

test('limits', () => {
  assert.equal(r({ regimen: '1HP', weight: '50', age: '12' }).bandLabel, 'Not under 13 years');
  assert.match(r({ regimen: '1HP', weight: '50', age: '13' }).band, /isoniazid 300 mg 1 tablet \+ rifapentine 300 mg 2 tablets/);
  assert.equal(r({ regimen: '1HP', weight: '22', age: '14' }).bandLabel, 'No dose at this weight');
  assert.equal(r({ regimen: '4R', weight: '20', age: '6' }).bandLabel, 'No dose at this weight');
  assert.equal(r({ regimen: '3HP', weight: '3', age: '0.1' }).bandLabel, 'Specialist');
  assert.equal(r({ regimen: '6H', weight: '3.5', age: '0.1' }).bandLabel, 'No weight band');
  assert.ok(r({ regimen: '4R', weight: '60', age: '30' }).notes.some((s) => /alafenamide|TAF/.test(s)));
});

test('refusals', () => {
  assert.equal(r({ weight: '20', age: '5' }).valid, false);
  assert.equal(r({ regimen: '3HP', age: '5' }).valid, false);
  assert.equal(r({ regimen: '3HP', weight: '20' }).valid, false);
});
