// spec-v129 2.1: Stewart SID / strong ion gap (Stewart 1983; Figge 1992).
// apparent SID = (Na + K + Ca + Mg) - (Cl + lactate); effective SID = HCO3 +
// albumin charge (2.8/g/dL) + phosphate charge (0.59/mg/dL) at pH 7.4;
// SIG = SIDa - SIDe; > 2 mEq/L flags unmeasured strong anions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stewartSidSig } from '../../lib/acidbase-v129.js';

test('elevated SIG flags unmeasured anions (unmeasured-anion flip)', () => {
  const r = stewartSidSig({ sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1.0, chloride: 100, lactate: 2, bicarbonate: 14, albumin: 4.0, phosphate: 4 });
  assert.equal(r.valid, true);
  assert.equal(r.sida, 45.4); // 140+4+2.4+1-100-2
  assert.equal(r.side, 27.6); // 14 + 4*2.8 + 4*0.59 = 14+11.2+2.36
  assert.equal(r.sig, 17.8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /unmeasured strong anions/);
});

test('low/negative SIG: no excess unmeasured anions (below threshold)', () => {
  const r = stewartSidSig({ sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1.0, chloride: 110, lactate: 1, bicarbonate: 24, albumin: 4.5, phosphate: 3.5 });
  assert.equal(r.sig, -2.3);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no excess unmeasured strong anions/);
});

test('SIG threshold sits at 2 mEq/L', () => {
  // construct SIDa - SIDe just above 2
  const above = stewartSidSig({ sodium: 140, potassium: 4, calcium: 2, magnesium: 1, chloride: 110, lactate: 1, bicarbonate: 24, albumin: 3, phosphate: 2 });
  // SIDa = 36, SIDe = 24 + 8.4 + 1.18 = 33.58 -> SIG 2.4 -> elevated
  assert.equal(above.sig, 2.4);
  assert.equal(above.abnormal, true);
});

test('any blank required field -> valid:false; scalar -> valid:false', () => {
  assert.equal(stewartSidSig({ sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1, chloride: 100, lactate: 2, bicarbonate: 14, albumin: 4 }).valid, false);
  assert.equal(stewartSidSig(7).valid, false);
});
