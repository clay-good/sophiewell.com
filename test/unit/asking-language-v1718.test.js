// spec-v1718: the predicate `partial-answer-safety.spec.js` uses to tell a tile that DECLINED from a
// tile that answered. The sweep it serves samples one tile in N, so it can be green for months while
// this is wrong; these assertions are what actually holds it.
//
// The risk the end anchor carries is over-exemption, and no end-to-end sweep can see it: a pattern that
// excuses too much makes the gate quiet, not red. Both directions are pinned here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { saysIncomplete } from '../lib/asking-language.js';

test('a tile that opens on an imperative is asking, not answering', () => {
  assert.equal(saysIncomplete('Score the exudate amount 0 to 3.'), true);
  assert.equal(saysIncomplete('Answer all 4 yes/no factors.'), true);
  assert.equal(saysIncomplete('Enter the donor age in whole years.'), true);
  assert.equal(saysIncomplete('A systolic pressure is required.'), true);
  // The house writes this one 59 times across lib/ and the gate had never heard it.
  assert.equal(saysIncomplete('Say whether there is a ventricular conduction abnormality.'), true);
  assert.equal(saysIncomplete('Grade the regurgitant jet.'), true);
});

test('the house envelope refusal is a refusal, whichever number it quotes', () => {
  // lib/num.js `inputFault` and `rangeFault`, reaching seventeen library files.
  assert.equal(saysIncomplete('The systolic pressure must be between 60 and 300 mmHg. Check the value entered.'), true);
  assert.equal(saysIncomplete('The diastolic pressure is not below the systolic. Check the values entered.'), true);
  assert.equal(saysIncomplete('Line 3: 60 is outside the range of MS-DRG relative weights. Check the value entered.'), true);
});

test('a real answer is never excused, and neither is a warning printed ABOVE one', () => {
  assert.equal(saysIncomplete('Helsinki CT score 5 -- higher predicted mortality.'), false);
  assert.equal(saysIncomplete('KDPI 67%; KDRI 1.17 (scaled to the median 2025 donor).'), false);
  assert.equal(saysIncomplete('Creatinine clearance 54 mL/min.'), false);
  // `stage` and `check` are deliberately not imperatives here: a real answer opens on them.
  assert.equal(saysIncomplete('Stage 3 hypertension: should not be qualified.'), false);
  // spec-v1203: lib/critcare-severity-v200.js prints this sentence and then the answer. The reading does
  // not END on it, which is the only reason the end anchor is safe to carry.
  assert.equal(
    saysIncomplete('The sodium 200 is outside 80 to 180. Check the value entered -- this is not a missing measurement. SAPS II 42, predicted mortality 25.6%.'),
    false,
  );
});

test('the house writes that refusal in one place, so the end anchor matches what it produces', () => {
  const num = readFileSync(new URL('../../lib/num.js', import.meta.url), 'utf8');
  assert.match(num, /Check the value entered\.`/, 'lib/num.js still ends its range refusal this way');
  // Any library that declines with this sentence must put it last, or the sweep will read the refusal as
  // an answer. The one file that does not is critcare, which answers afterwards on purpose.
  const dir = new URL('../../lib/', import.meta.url);
  const offenders = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(new URL(f, dir), 'utf8');
    for (const m of src.matchAll(/Check the values? entered([^`'"\n]*)/g)) {
      const tail = m[1].trim();
      if (tail && tail !== '.' && f !== 'critcare-severity-v200.js' && f !== 'clinical.js') offenders.push(`${f}: ...${tail}`);
    }
  }
  assert.deepEqual(offenders, [], 'a refusal with text after the house sentence would not match the end anchor');
});
