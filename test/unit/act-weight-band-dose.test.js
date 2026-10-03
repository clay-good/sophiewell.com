// spec-v1551 tool 1: WHO 2026 ACT weight bands. Every band edge pinned just below and at, so a change to the
// living guideline shows up here as a deliberate edit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actWeightBandDose as act } from '../../lib/act-weight-band-dose-v1551.js';

const dose = (regimen, weight) => act({ regimen, weight: String(weight) }).dose;

// WHO guidelines for malaria, 10 September 2026, pp. 175-178: [regimen, [edge kg, dose below, dose at]].
const EDGES = {
  al: [[5, '5 + 60', '20 + 120'], [15, '20 + 120', '40 + 240'], [25, '40 + 240', '60 + 360'], [35, '60 + 360', '80 + 480']],
  asaq: [[9, '25 + 67.5', '50 + 135'], [18, '50 + 135', '100 + 270'], [36, '100 + 270', '200 + 540']],
  asmq: [[9, '25 + 55', '50 + 110'], [18, '50 + 110', '100 + 220'], [30, '100 + 220', '200 + 440']],
  assp: [[10, '25 mg artesunate daily for 3 days; 250/12.5 mg sulfadoxine-pyrimethamine once, on day 1', '50 mg artesunate daily for 3 days; 500/25 mg sulfadoxine-pyrimethamine once, on day 1'], [25, '50 mg artesunate daily for 3 days; 500/25 mg sulfadoxine-pyrimethamine once, on day 1', '100 mg artesunate daily for 3 days; 1,000/50 mg sulfadoxine-pyrimethamine once, on day 1'], [50, '100 mg artesunate daily for 3 days; 1,000/50 mg sulfadoxine-pyrimethamine once, on day 1', '200 mg artesunate daily for 3 days; 1,500/75 mg sulfadoxine-pyrimethamine once, on day 1']],
  dhappq: [[8, '20 + 160', '30 + 240'], [11, '30 + 240', '40 + 320'], [17, '40 + 320', '60 + 480'], [25, '60 + 480', '80 + 640'], [36, '80 + 640', '120 + 960'], [60, '120 + 960', '160 + 1,280'], [80, '160 + 1,280', '200 + 1,600']],
};

test('every band edge, just below and at', () => {
  for (const [regimen, edges] of Object.entries(EDGES)) {
    for (const [kg, below, at] of edges) {
      assert.equal(dose(regimen, kg - 0.1), below, `${regimen} ${kg - 0.1} kg`);
      assert.equal(dose(regimen, kg), at, `${regimen} ${kg} kg`);
    }
  }
});

test('exactly 80 kg on dihydroartemisinin-piperaquine is read as 80 or more, and the answer says why', () => {
  const r = act({ regimen: 'dhappq', weight: '80' });
  assert.equal(r.dose, '200 + 1,600');
  assert.match(r.notes.join(' '), /leaves exactly 80 kg in no band/);
});

test('under 5 kg: the infant artemether-lumefantrine band, and the stated rule for every other ACT', () => {
  const al = act({ regimen: 'al', weight: '3.2' });
  assert.equal(al.dose, '5 + 60');
  assert.match(al.notes[0], /1:12 infant formulation/);
  const asaq = act({ regimen: 'asaq', weight: '4.9' });
  assert.equal(asaq.dose, undefined);
  assert.match(asaq.band, /same mg\/kg target as for a child of 5 kg/);
  assert.equal(dose('asaq', 5), '25 + 67.5');
});

test('the achieved mg/kg is shown against WHO\'s target and flagged outside it, never changing the dose', () => {
  const r = act({ regimen: 'al', weight: '10' });
  assert.match(r.notes.join(' '), /Artemether total over the course: 12 mg\/kg \(WHO target 5 to 24\)\./);
  const low = act({ regimen: 'dhappq', weight: '24.9' });
  assert.match(low.notes.join(' '), /Piperaquine per day: 19\.3 mg\/kg \(WHO target 20 to 32\), outside the target range/);
  assert.equal(low.dose, '60 + 480');
  assert.match(act({ regimen: 'asmq', weight: '20' }).notes.join(' '), /Mefloquine base per day: 10 mg\/kg/);
});

test('no regimen, a blank weight, artesunate-pyronaridine and an impossible weight are refused', () => {
  assert.match(act({ weight: '20' }).message, /Choose the ACT/);
  assert.equal(act({ regimen: 'al' }).valid, false);
  assert.equal(act({ regimen: 'al', weight: '' }).valid, false);
  assert.match(act({ regimen: 'aspy', weight: '20' }).message, /no weight-band table for artesunate \+ pyronaridine/);
  assert.equal(act({ regimen: 'al', weight: '0.2' }).valid, false);
  assert.equal(act({ regimen: 'al', weight: '151' }).valid, false);
});
