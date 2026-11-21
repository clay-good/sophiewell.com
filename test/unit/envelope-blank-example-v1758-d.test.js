// spec-v1758: fields left blank in each worked example were never driven past
// their lib/bounds.js envelope. Each case below enters one such field just past
// the ceiling (refused) and at an in-range value (still answered).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivIronCourse } from '../../lib/iv-iron-course-v1633.js';
import { mraPotassiumDoseCheck } from '../../lib/mra-potassium-dose-check-v1632.js';
import { chemoOrganLabelDose } from '../../lib/chemo-organ-label-dose-v1635.js';
import { vancInitialDose } from '../../lib/vanc-initial-dose-v1631.js';
import { surgicalProphylaxisRedose } from '../../lib/surgical-prophylaxis-redose-v1636.js';
import { pgxLabelDoseLimit } from '../../lib/pgx-label-dose-limit-v1640.js';
import { pedsWarfarinNomogram } from '../../lib/peds-warfarin-nomogram-v1634.js';
import { passiveImmunizationDose } from '../../lib/passive-immunization-dose-v1636.js';
import { lamotrigineTitrationCalendar } from '../../lib/lamotrigine-titration-calendar-v1633.js';
import { labelTitrationCalendar } from '../../lib/label-titration-calendar-v1633.js';
import { flumazenilLadder } from '../../lib/flumazenil-ladder-v1636.js';
import { digoxinLabelDose } from '../../lib/digoxin-label-dose-v1631.js';
import { chelationDose } from '../../lib/chelation-dose-v1636.js';
import { basalInsulinSwitch } from '../../lib/basal-insulin-switch-v1633.js';
import { aminoglycosideLabelRenal } from '../../lib/aminoglycoside-label-renal-v1631.js';

const NOW = new Date('2026-11-21T12:00:00Z');

// [name, compute, worked-example args, field, just past the ceiling, in range]
// spec-v1763: bound widened (source in lib/bounds.js): creatinine and bilirubin rows.
const CASES = [
  ['iv-iron-course hb', ivIronCourse, { regimen: 'injectafer-ida', weightKg: '70' }, 'hb', '25.5', '12'],
  ['iv-iron-course height (cm)', ivIronCourse, { regimen: 'injectafer-ida', weightKg: '70' }, 'heightCm', '251', '170'],
  ['iv-iron-course hematocrit', ivIronCourse, { regimen: 'injectafer-ida', weightKg: '70' }, 'hematocrit', '76', '35'],
  ['mra-potassium-dose-check eGFR', mraPotassiumDoseCheck, { mode: 'eplerenone-adjust', potassium: '5.7', currentDose: '50-daily' }, 'egfr', '201', '60'],
  ['mra-potassium-dose-check creatinine', mraPotassiumDoseCheck, { mode: 'eplerenone-adjust', potassium: '5.7', currentDose: '50-daily' }, 'creatinine', '75.5', '1.2'],
  ['chemo-organ-label-dose direct bilirubin', chemoOrganLabelDose, { drug: 'doxorubicin', bilirubin: '2' }, 'directBilirubin', '76', '1'],
  ['chemo-organ-label-dose creatinine', chemoOrganLabelDose, { drug: 'doxorubicin', bilirubin: '2' }, 'creatinine', '75.5', '1.2'],
  ['vanc-initial-dose age', vancInitialDose, { population: 'adult', weight: '70', crcl: '100', loadPerKg: '25', targetAuc: '500' }, 'ageYears', '131', '40'],
  ['surgical-prophylaxis-redose ideal body weight', surgicalProphylaxisRedose, { agent: 'cefazolin', patient: 'adult', weightKg: '85', startTime: '2026-10-18T07:30', incisionTime: '2026-10-18T07:55' }, 'ibwKg', '501', '70'],
  ['pgx-label-dose-limit weight', pgxLabelDoseLimit, { drug: 'tetrabenazine', status: 'poor', dailyDose: '62.5', singleDose: '25' }, 'weight', '501', '30'],
  ['peds-warfarin-nomogram weight', pedsWarfarinNomogram, { phase: 'maintenance', inr: '1.7', doseMg: '5' }, 'weightKg', '501', '25'],
  ['passive-immunization-dose age', passiveImmunizationDose, { product: 'varizig', weight: '15' }, 'age', '131', '6'],
  ['lamotrigine-titration-calendar weight', lamotrigineTitrationCalendar, { regimen: 'ir-bipolar', comed: 'neither', startDate: '2026-10-12' }, 'weightKg', '501', '70'],
  ['label-titration-calendar weight', labelTitrationCalendar, { preset: 'varenicline', startDate: '2026-10-12' }, 'weightKg', '501', '70'],
  ['flumazenil-ladder weight', flumazenilLadder, { indication: 'suspected-overdose', patient: 'adult', dosesGiven: '2' }, 'weight', '501', '70'],
  ['digoxin-label-dose age', digoxinLabelDose, { ageGroup: 'over-10', leanWeight: '70', weightUnit: 'kg', loadMcgPerKg: '10', creatinineClearance: '55' }, 'patientAge', '131', '60'],
  ['chelation-dose creatinine', chelationDose, { regimen: 'succimer-lead', weight: '20' }, 'creatinine', '75.5', '0.6'],
  ['basal-insulin-switch weight', basalInsulinSwitch, { to: 'lantus', from: 'nph', frequency: 'twice', totalUnits: '50' }, 'weightKg', '501', '80'],
  ['aminoglycoside-label-renal lean weight', aminoglycosideLabelRenal, { drug: 'gentamicin', severity: 'serious', weight: '60', basis: 'actual', creatinine: '2' }, 'leanWeight', '501', '55'],
];

for (const [name, fn, base, field, past, ok] of CASES) {
  test(`spec-v1758 ${name}: refused just past the envelope, answered in range`, () => {
    const bad = fn({ ...base, [field]: past }, NOW);
    assert.equal(bad.valid, false, `${field}=${past} should be refused`);
    assert.match(bad.message, /plausible|range|above/i);
    const good = fn({ ...base, [field]: ok }, NOW);
    assert.notEqual(good.valid, false, `${field}=${ok} should answer: ${good.message}`);
    const blank = fn({ ...base, [field]: '' }, NOW);
    assert.notEqual(blank.valid, false, `a blank ${field} should still answer: ${blank.message}`);
  });
}
