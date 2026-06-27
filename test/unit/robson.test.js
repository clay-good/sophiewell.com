// spec-v156 2.4: Robson Ten-Group Classification System (Robson 2001; WHO 2015).
// A deterministic input -> group mapping. The two structural properties the spec
// requires are asserted here: MUTUAL EXCLUSIVITY (no valid input combination maps
// to two groups, guaranteed by single-valued routing) and TOTALITY (every valid
// combination maps to exactly one of the ten groups).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { robson } from '../../lib/rheum-ob-v156.js';

const PARITY = ['nullipara', 'multipara'];
const PREV = ['no', 'yes'];
const ONSET = ['spontaneous', 'induced', 'prelabor-cs'];
const PRES = ['cephalic', 'breech', 'transverse-oblique'];
const FET = ['single', 'multiple'];
const GEST = ['term', 'preterm'];
const VALID_GROUPS = new Set(['1', '2a', '2b', '3', '4a', '4b', '5', '6', '7', '8', '9', '10']);

test('tile example: nullipara, induced, single cephalic, term -> Group 2a', () => {
  const r = robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'induced' });
  assert.equal(r.valid, true);
  assert.equal(r.group, '2a');
  assert.ok(r.band.startsWith('Robson Group 2a '));
  assert.match(r.band, /Nulliparous, single cephalic, term, induced labor/);
});

test('the single-cephalic-term, no-previous-CS split (groups 1 to 4)', () => {
  assert.equal(robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'spontaneous' }).group, '1');
  assert.equal(robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'prelabor-cs' }).group, '2b');
  assert.equal(robson({ parity: 'multipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'spontaneous' }).group, '3');
  assert.equal(robson({ parity: 'multipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'induced' }).group, '4a');
  assert.equal(robson({ parity: 'multipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'prelabor-cs' }).group, '4b');
});

test('the special-condition groups 5 to 10 take precedence over onset/parity', () => {
  // Group 5: previous CS, single cephalic, term; any onset/parity.
  assert.equal(robson({ parity: 'multipara', previousCs: 'yes', fetuses: 'single', presentation: 'cephalic', gestation: 'term', onset: 'spontaneous' }).group, '5');
  // Group 6 / 7: single breech by parity.
  assert.equal(robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'single', presentation: 'breech', gestation: 'term', onset: 'spontaneous' }).group, '6');
  assert.equal(robson({ parity: 'multipara', previousCs: 'yes', fetuses: 'single', presentation: 'breech', gestation: 'preterm', onset: 'induced' }).group, '7');
  // Group 8: multiple pregnancy, regardless of presentation/gestation.
  assert.equal(robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'multiple', presentation: 'breech', gestation: 'preterm', onset: 'spontaneous' }).group, '8');
  // Group 9: transverse/oblique lie.
  assert.equal(robson({ parity: 'multipara', previousCs: 'yes', fetuses: 'single', presentation: 'transverse-oblique', gestation: 'term', onset: 'spontaneous' }).group, '9');
  // Group 10: single cephalic preterm.
  assert.equal(robson({ parity: 'nullipara', previousCs: 'yes', fetuses: 'single', presentation: 'cephalic', gestation: 'preterm', onset: 'spontaneous' }).group, '10');
});

test('TOTALITY + MUTUAL EXCLUSIVITY: every valid combination maps to exactly one of the ten groups', () => {
  let combos = 0;
  for (const parity of PARITY) {
    for (const previousCs of PREV) {
      for (const onset of ONSET) {
        for (const presentation of PRES) {
          for (const fetuses of FET) {
            for (const gestation of GEST) {
              combos += 1;
              const r = robson({ parity, previousCs, onset, presentation, fetuses, gestation });
              assert.equal(r.valid, true, `combo should be valid: ${JSON.stringify({ parity, previousCs, onset, presentation, fetuses, gestation })}`);
              assert.ok(VALID_GROUPS.has(r.group), `combo mapped to an undefined group ${r.group}`);
              assert.ok(!/NaN|undefined/.test(r.band));
            }
          }
        }
      }
    }
  }
  assert.equal(combos, 2 * 2 * 3 * 3 * 2 * 2); // 144 full enumeration
});

test('an incomplete combination renders a surfaced complete-the-fields fallback', () => {
  assert.equal(robson({}).valid, false);
  assert.match(robson({}).message, /parity|presentation|fetuses|gestational/);
  // term single cephalic no-previous-CS needs onset; without it -> fallback.
  const noOnset = robson({ parity: 'nullipara', previousCs: 'no', fetuses: 'single', presentation: 'cephalic', gestation: 'term' });
  assert.equal(noOnset.valid, false);
  assert.match(noOnset.message, /onset/);
});
