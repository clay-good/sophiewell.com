// spec-v1604 tool 3: claims-pct-medicare. A professional line and a DRG line: the professional line
// reprices to its fixture Medicare amount; the DRG line is excluded and counted. Fee schedule rows are
// literal here, so a quarterly data refresh cannot change the expected amounts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claimsPctMedicare, categoryOf } from '../../lib/claims-pct-medicare.js';

const LOCALITIES = [{ state: 'TX', locality: '18', name: 'HOUSTON', workGpci: 1, peGpci: 1.1, mpGpci: 0.9 }];
const ROWS = {
  99214: [{ code: '99214', statusCode: 'A', workRvu: 1.92, peRvuNonFacility: 1.5, peRvuFacility: 0.8, mpRvu: 0.13 }],
  27447: [{ code: '27447', statusCode: 'A', workRvu: 19.6, peRvuNonFacility: 11, peRvuFacility: 11, mpRvu: 4.2 }],
};
const CF = 33.4009;
const mpfs = { status: 'ok', rows: ROWS, localities: LOCALITIES, conversionFactor: CF, edition: 'RVU26D' };
const fee = (w, pe, mp) => Math.round((w * 1 + pe * 1.1 + mp * 0.9) * CF * 100);

test('without the fee schedule it names the professional codes it needs, and only those', () => {
  const r = claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150, 1\n2026-03-05, City Hospital, DRG 470, 21, 25000, 1', locality: 'TX-18' });
  assert.deepEqual(r.needCodes, ['99214']);
});

test('a professional line reprices to its fixture amount; a DRG line is excluded and counted', () => {
  const r = claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150, 2\n2026-03-05, City Hospital, DRG 470, 21, 25000, 1', locality: 'TX 18', mpfs });
  const line = r.rows[0];
  assert.equal(line.medicare, fee(1.92, 1.5, 0.13) * 2);
  assert.equal(r.totals.allowed, 15000);
  assert.equal(r.totals.leftOut, 1);
  assert.match(r.rows[1].reason, /^a facility claim/);
  assert.equal(r.band, `The plan allowed $150.00 where Medicare would pay $${(fee(1.92, 1.5, 0.13) * 2 / 100).toFixed(2)}: ${Math.round(15000 / (fee(1.92, 1.5, 0.13) * 2) * 1000) / 10}% of Medicare, on 1 of 2 claim lines (1 left out).`);
});

test('sums by provider and category are the row sums to the cent; an unrepriceable line is never priced at zero', () => {
  const r = claimsPctMedicare({ claims: ['2026-03-02, Alpha, 99214, 11, 150, 1', '2026-03-03, Alpha, 99214, 22, 120, 1', '2026-03-04, Beta, 27447, 22, 2400, 1, 80', '2026-03-04, Beta, 27447, 22, 2000, 1'].join('\n'), locality: 'TX-18', mpfs });
  const alpha = r.byProvider.find((p) => p.key === 'Alpha');
  assert.deepEqual([alpha.lines, alpha.allowed, alpha.medicare], [2, 27000, fee(1.92, 1.5, 0.13) + fee(1.92, 0.8, 0.13)]);
  const beta = r.byProvider.find((p) => p.key === 'Beta');
  assert.deepEqual([beta.lines, beta.allowed, beta.leftOut], [1, 200000, 1]);
  assert.deepEqual(r.leftOutReasons, [{ reason: 'modifier 80 changes the Medicare amount in a way not modeled here', count: 1 }]);
  assert.equal(r.byCategory.reduce((n, c) => n + c.allowed, 0), r.totals.allowed);
  assert.deepEqual(r.byCategory.map((c) => c.key).sort(), ['Evaluation and management', 'Surgery']);
});

test('blank units are priced as 1 and said; a bad line is refused by name; an unknown locality is named', () => {
  const r = claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150,\n2026-03-02, Alpha, 99214, 11, lots, 1', locality: 'TX-18', mpfs });
  assert.match(r.notes.join(' '), /1 priced line had no units and was priced as 1 unit\./);
  assert.equal(r.rows[1].status, 'invalid');
  assert.match(claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150, 1', locality: 'ZZ-99', mpfs }).message, /^ZZ-99 is not a Medicare physician fee schedule locality\./);
  assert.match(claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150, 1', locality: '' }).message, /^Choose the Medicare locality/);
  assert.match(claimsPctMedicare({ claims: '2026-03-02, Alpha, 99214, 11, 150, 1', locality: 'TX-18', mpfs: { status: 'expired' } }).message, /passed its review date/);
});

test('service categories follow the CPT section ranges', () => {
  assert.deepEqual(['00100', '27447', '71046', '80053', '99214', '90471', 'J1100', '0001F'].map(categoryOf),
    ['Anesthesia', 'Surgery', 'Radiology', 'Pathology and laboratory', 'Evaluation and management', 'Medicine', 'HCPCS Level II', 'Other']);
});
