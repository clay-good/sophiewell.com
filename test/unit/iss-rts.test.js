// spec-v57 §2.13: Injury Severity Score + Revised Trauma Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issRts } from '../../lib/scoring-v5.js';

test('AIS 4/3/2 -> ISS 29 major trauma; RTS 7.84 for normal vitals', () => {
  const r = issRts({ ais1: 4, ais2: 3, ais3: 2, gcs: 14, sbp: 120, rr: 18 });
  assert.equal(r.iss, 29); assert.equal(r.majorTrauma, true);
  assert.equal(r.rts, 7.84);
});
test('any AIS = 6 forces ISS 75', () => {
  const r = issRts({ ais1: 6, ais2: 2, ais3: 1, gcs: 15, sbp: 120, rr: 16 });
  assert.equal(r.iss, 75); assert.equal(r.majorTrauma, true);
});
test('minor injury below major-trauma threshold', () => {
  const r = issRts({ ais1: 2, ais2: 1, ais3: 0, gcs: 15, sbp: 130, rr: 16 });
  assert.equal(r.iss, 5); assert.equal(r.majorTrauma, false);
});
test('RTS drops with deranged physiology', () => {
  const r = issRts({ ais1: 5, ais2: 4, ais3: 3, gcs: 5, sbp: 60, rr: 4 });
  // gcs 5 -> code1 (0.9368), sbp 60 -> code2 (1.4652), rr 4 -> code1 (0.2908)
  assert.equal(r.rts, 2.69);
  assert.equal(r.iss, 50);
});
test('rejects out-of-range AIS / vitals', () => {
  assert.throws(() => issRts({ ais1: 7, ais2: 0, ais3: 0, gcs: 15, sbp: 120, rr: 16 }), /ais1/);
  assert.throws(() => issRts({ ais1: 3, ais2: 0, ais3: 0, gcs: 2, sbp: 120, rr: 16 }), /gcs/);
});

test('the anatomic score stands without the physiology (spec-v1064)', () => {
  // Each RTS vital is coded into a band, so a blank systolic pressure was coded
  // as 0 mmHg -- the bottom band -- and the RTS fell from 7.84 to 4.91 beside an
  // unchanged ISS: a worse-looking patient invented by an empty field.
  const noSbp = issRts({ ais1: 5, ais2: 2, ais3: 0, gcs: 14, sbp: null, rr: 18 });
  assert.equal(noSbp.iss, 29);
  assert.equal(noSbp.rts, null);

  const full = issRts({ ais1: 5, ais2: 2, ais3: 0, gcs: 14, sbp: 120, rr: 18 });
  assert.equal(full.iss, 29);
  assert.equal(full.rts, 7.84);
});

// spec-v1754: the Glasgow Coma Scale total takes whole steps 3 to 15. A GCS of
// 12.5 was scored from wherever it fell between the cutoffs; it is refused now.
test('spec-v1754: a fractional GCS is refused; GCS 3, 15 and the worked example answer', () => {
  const EX_V1754 = { ais1: 4, ais2: 3, ais3: 2, gcs: 14, sbp: 120, rr: 18 };
  const said = (gcs) => {
    try {
      const r = issRts({ ...EX_V1754, gcs });
      return r && r.valid === false ? `refused: ${r.message || r.band}` : 'answered';
    } catch (e) { return `refused: ${e.message}`; }
  };
  assert.match(said(12.5), /^refused: .*Glasgow Coma Scale must be a whole number/);
  assert.equal(said(3), 'answered');
  assert.equal(said(15), 'answered');
  assert.equal(said(EX_V1754.gcs), 'answered');
});

// spec-v1755: an AIS region score has no value between its steps; a fraction was squared into the ISS.
test('spec-v1755: issRts refuses a half-step AIS; whole AIS and the worked example answer', () => {
  const ex = { ais1: 4, ais2: 3, ais3: 2, gcs: 14, sbp: 120, rr: 18 };
  assert.equal(issRts(ex).iss, 29);
  assert.throws(() => issRts({ ...ex, ais1: 4.5 }), /whole number/);
  assert.equal(issRts({ ...ex, ais3: 3 }).iss, 34);
});
