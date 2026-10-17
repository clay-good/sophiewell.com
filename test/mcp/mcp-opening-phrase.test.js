// A curated phrase a question opens with names its calculator even when a value's label is another
// calculator's name and scores higher in the synonym table: "zosyn, eGFR 40" went to the eGFR calculator
// and "panc 3 ... bmi 32" to BMI (140 phrase-plus-example queries, found October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerQuery } from '../../mcp/tools.js';

for (const [query, tile] of [
  ['zosyn egfr 40', 'abx-renal'],
  ['lovenox dose weight 80 kg, egfr 25', 'vte-prophylaxis-dose'],
  ['panc 3 hematocrit 45, bmi 32, pleural effusion', 'panc3'],
  ['plan score age 70, atrial fibrillation', 'plan-score'],
  ['anion gap closed dka glucose 180, serum bicarbonate 16, venous ph 7.34, anion gap 10', 'dka-resolution'],
  ['gdmt carvedilol 25', 'hf-gdmt-target-percent'],
]) {
  test(`"${query}" goes to ${tile}`, () => {
    const r = answerQuery({ query });
    assert.equal(r.tile, tile, JSON.stringify(r));
  });
}

test('a calculator\'s own phrase at the start still goes to it', () => {
  assert.equal(answerQuery({ query: 'egfr 40' }).tile, 'egfr');
});

test('an opening phrase with no values is a calculator with nothing read, not a miss', () => {
  const r = answerQuery({ query: 'gdmt' });
  assert.equal(r.code, 'NO_VALUES');
  assert.equal(r.tile, 'hf-gdmt-target-percent');
});
