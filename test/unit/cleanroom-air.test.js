// spec-v1630 tools 16 and 17: FDA's air classification table, and air changes with CDC's clearance times.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanroomClassCheck as cr, CLASSES, SOURCE as FDA } from '../../lib/cleanroom-class-check-v1630.js';
import { roomAirChanges as ra, SOURCE as CDC } from '../../lib/room-air-changes-v1630.js';

test('cleanroom: the table is FDA\'s Table 1, row for row', () => {
  assert.deepEqual(CLASSES.map((c) => [c.perFt3, c.iso, c.perM3, c.activeAir, c.settlingPlate]), [
    [100, 5, 3520, 1, 1], [1000, 6, 35200, 7, 3], [10000, 7, 352000, 10, 5], [100000, 8, 3520000, 100, 50],
  ]);
});

test('cleanroom: a count at the limit meets the class; one above it does not', () => {
  assert.equal(cr({ countUnit: 'm3', count: 3520 }).isoClassMet, 5);
  assert.equal(cr({ countUnit: 'm3', count: 3521 }).isoClassMet, 6);
  assert.equal(cr({ countUnit: 'm3', count: 3520000 }).isoClassMet, 8);
  const above = cr({ countUnit: 'm3', count: 3520001 });
  assert.deepEqual([above.isoClassMet, above.abnormal, above.bandLabel], [null, true, 'Above ISO 8']);
});

test('cleanroom: the count is compared in the unit entered, not converted', () => {
  // 100 per cubic foot is 3,531 per cubic meter by conversion, which would miss the table's 3,520.
  assert.equal(cr({ countUnit: 'ft3', count: 100 }).isoClassMet, 5);
  assert.equal(cr({ countUnit: 'ft3', count: 101 }).isoClassMet, 6);
  assert.equal(cr({ countUnit: 'm3', count: 3531 }).isoClassMet, 6);
});

test('cleanroom: a microbial sample is at, under or over the level for the intended class', () => {
  const r = cr({ countUnit: 'm3', count: 3521, intendedClass: '5', activeAir: 1, settlingPlate: 0 });
  assert.deepEqual([r.particleMeetsIntended, r.activeAirAgainst, r.settlingPlateAgainst, r.abnormal], [false, 'at', 'under', true]);
  assert.match(r.notes.join(' '), /should normally yield no microbiological contaminants/);
  const over = cr({ countUnit: 'ft3', count: 100, intendedClass: '7', activeAir: 11, settlingPlate: 5 });
  assert.deepEqual([over.particleMeetsIntended, over.activeAirAgainst, over.settlingPlateAgainst, over.abnormal], [true, 'over', 'at', true]);
  assert.match(cr({ countUnit: 'm3', count: 100, activeAir: 3 }).message, /Choose the intended class/);
  assert.match(cr({ countUnit: 'm3', count: 100, intendedClass: '9' }).message, /ISO 5, 6, 7 or 8/);
  assert.match(cr({ count: 100 }).message, /per m³ or per ft³/);
  assert.match(cr({ countUnit: 'm3', count: 100 }).note, /USP <797>/);
});

test('air changes: CDC Table B.1, every row, to the whole minute', () => {
  const table = [[2, 138, 207], [4, 69, 104], [6, 46, 69], [8, 35, 52], [10, 28, 41], [12, 23, 35], [15, 18, 28], [20, 14, 21], [50, 6, 8]];
  for (const [ach, t99, t999] of table) {
    const r = ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: ach, volume: 60 });
    assert.equal(r.ach, ach);
    // The published 99.9% figure for 12 air changes (35) is 34.54 rounded up, so compare unrounded.
    assert.equal(Math.round((Math.log(100) / r.ach) * 60), t99, `99% at ${ach}`);
    assert.equal(Math.round((Math.log(1000) / r.ach) * 60), t999, `99.9% at ${ach}`);
  }
  const twelve = ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240, length: 12, width: 10, height: 10 });
  assert.deepEqual([twelve.ach, twelve.volume, twelve.minutes99, twelve.minutes999], [12, 1200, 23, 34.5]);
});

test('air changes: metric inputs, mixed units and a reader\'s requirement', () => {
  assert.equal(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 600, volume: 1800 }).ach, 20);
  assert.match(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 600, volume: 0 }).message, /room volume/);
  const m = ra({ airflowUnit: 'm3h', roomUnit: 'm', airflow: 600, volume: 30, requiredAch: 30 });
  assert.deepEqual([m.ach, m.airflowNeeded, m.belowRequirement, m.abnormal], [20, 900, true, true]);
  // 240 CFM into 1,200 cubic feet entered as cubic meters (1 ft³ = 0.028316846592 m³).
  const mixed = ra({ airflowUnit: 'cfm', roomUnit: 'm', airflow: 240, volume: 1200 * 0.028316846592, requiredAch: 12 });
  assert.deepEqual([mixed.ach, mixed.belowRequirement], [12, false]);
  // No requirement entered: nothing is applied.
  assert.equal(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240, volume: 1200 }).belowRequirement, undefined);
});

test('air changes: units are required, and the room is a volume or three dimensions, not both', () => {
  assert.match(ra({ roomUnit: 'ft', airflow: 240, volume: 1200 }).message, /airflow unit/);
  assert.match(ra({ airflowUnit: 'cfm', airflow: 240, volume: 1200 }).message, /room unit/);
  assert.match(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240 }).message, /room volume, or its length, width and height/);
  assert.match(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240, volume: 1200, height: 10 }).message, /not both/);
  assert.match(ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240, length: 12, width: 10 }).message, /room height/);
  const plain = ra({ airflowUnit: 'cfm', roomUnit: 'ft', airflow: 240, volume: 1200 });
  assert.match(plain.note, /empty room with no aerosol-generating source and assume perfect mixing/);
  // CDC's room-by-room table is a reprint under permission. Since the owner's rule of October 17, 2026 (reprints
  // count), its isolation-room figures are shown as a cited reference point, never applied as a requirement.
  assert.match(plain.notes.join(' '), /Table B\.2.*isolation room.*12 total air changes per hour.*0\.01 in\. water gauge \(2\.5 Pa\)/);
  assert.match(plain.notes.join(' '), /not applied here/);
});

test('both source pages are under the page watch', () => {
  assert.equal(FDA.route, 'B'); assert.match(FDA.source.url, /^https:\/\/www\.fda\.gov\//);
  assert.equal(CDC.route, 'B'); assert.match(CDC.source.url, /^https:\/\/www\.cdc\.gov\//);
});
