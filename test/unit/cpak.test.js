// spec-v1447: CPAK (MacDessi 2021, Bone Joint J, PMC7954147).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpak } from '../../lib/cpak-v1447.js';

test('aHKA = MPTA - LDFA and JLO = MPTA + LDFA', () => {
  const r = cpak({ mpta: 86, ldfa: 89 });
  assert.equal(r.ahka, -3);
  assert.equal(r.jlo, 175);
});

test('the nine cells, rows by JLO and columns by aHKA', () => {
  const cells = [
    [86, 89, 'I'], [88, 88, 'II'], [89, 86, 'III'],
    [88, 92, 'IV'], [90, 90, 'V'], [92, 88, 'VI'],
    [90, 94, 'VII'], [93, 93, 'VIII'], [95, 90, 'IX'],
  ];
  for (const [m, l, t] of cells) assert.equal(cpak({ mpta: m, ldfa: l }).type, t, `${m}/${l}`);
});

test('the neutral bands are inclusive at +/-2 and +/-3', () => {
  assert.equal(cpak({ mpta: 89, ldfa: 91 }).type, 'V'); // aHKA -2, JLO 180
  assert.equal(cpak({ mpta: 91, ldfa: 89 }).type, 'V'); // aHKA +2
  assert.equal(cpak({ mpta: 88.5, ldfa: 88.5 }).type, 'V'); // JLO 177
  assert.equal(cpak({ mpta: 91.5, ldfa: 91.5 }).type, 'V'); // JLO 183
  assert.equal(cpak({ mpta: 88.4, ldfa: 88.4 }).type, 'II'); // JLO 176.8
});

test('missing and implausible angles are refused', () => {
  assert.match(cpak({}).message, /MPTA\) and the lateral distal femoral angle/);
  assert.equal(cpak({ mpta: 870, ldfa: 89 }).valid, false);
});
