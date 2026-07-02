// spec-v203 §2: renderers for the perioperative, fracture, cerebrovascular &
// frailty risk instruments — DASI, ABCD3-I, Edmonton Frail Scale, SORT, and
// Garvan. Group G. Shipped one tile at a time; closes the Deep Subspecialty
// Quantitation program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the surgery / anticoagulation /
// imaging / bone-therapy / disposition decision to the clinician and the patient
// (spec-v11 §5.3) — these estimate risk and screen, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/periop-frailty-v203.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function numField(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(sel);
  return wrap;
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate is the cited source’s, computed from the inputs you enter. The surgical, anticoagulation, imaging, and bone-therapy decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.5 dasi ------------------------------------------------------------
  dasi(root) {
    note(root, 'Duke Activity Status Index (Hlatky 1989): a 12-item self-report functional-capacity questionnaire. Affirmative activities are summed by their METs weights (max 58.2); peak VO₂ = 0.43 × DASI + 9.6 and METs = VO₂ / 3.5. < 4 METs marks poor functional capacity. Near-neighbors: rcri, mets-activity. Check every activity the patient can do:');
    const items = [
      ['dasi-selfcare', 'Take care of self (eat, dress, bathe, toilet) — 2.75'],
      ['dasi-walkindoors', 'Walk indoors — 1.75'],
      ['dasi-walkblocks', 'Walk 1–2 blocks on level ground — 2.75'],
      ['dasi-stairs', 'Climb a flight of stairs or walk up a hill — 5.5'],
      ['dasi-run', 'Run a short distance — 8'],
      ['dasi-lightwork', 'Light housework (dusting, dishes) — 2.7'],
      ['dasi-modwork', 'Moderate housework (vacuum, carry groceries) — 3.5'],
      ['dasi-heavywork', 'Heavy housework (scrub floors, move furniture) — 8'],
      ['dasi-yardwork', 'Yardwork (rake, mow) — 4.5'],
      ['dasi-sexual', 'Sexual relations — 5.25'],
      ['dasi-modrec', 'Moderate recreation (golf, bowling, dancing) — 6'],
      ['dasi-strenuous', 'Strenuous sports (swimming, tennis, skiing) — 7.5'],
    ];
    for (const [id, label] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.dasi({
        selfCare: chk('dasi-selfcare'), walkIndoors: chk('dasi-walkindoors'), walkBlocks: chk('dasi-walkblocks'),
        stairs: chk('dasi-stairs'), run: chk('dasi-run'), lightWork: chk('dasi-lightwork'), moderateWork: chk('dasi-modwork'),
        heavyWork: chk('dasi-heavywork'), yardWork: chk('dasi-yardwork'), sexual: chk('dasi-sexual'),
        moderateRec: chk('dasi-modrec'), strenuous: chk('dasi-strenuous'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DASI', value: `${r.score}` }, { label: 'METs', value: `${r.mets}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 abcd3-i ---------------------------------------------------------
  'abcd3-i'(root) {
    note(root, 'ABCD3-I score (Merwick 2010): the imaging-augmented refinement of ABCD² for early stroke risk after TIA — the ABCD² items plus dual TIA within 7 days (+2), ipsilateral ≥ 50% carotid stenosis (+2), and abnormal DWI (+2), total 0–13. Strata: low 0–3, medium 4–7, high 8–13. Near-neighbors: abcd2, nihss.');
    root.appendChild(numField('Age (years)', 'abcd3i-age', { min: '0' }));
    root.appendChild(numField('Systolic BP (mmHg)', 'abcd3i-sbp', { min: '30' }));
    root.appendChild(numField('Diastolic BP (mmHg)', 'abcd3i-dbp', { min: '10' }));
    root.appendChild(selectField('Clinical features', 'abcd3i-clinical', [
      { value: 'weakness', text: 'Unilateral weakness (+2)' },
      { value: 'speech', text: 'Speech disturbance without weakness (+1)' },
      { value: 'other', text: 'Other (0)' },
    ]));
    root.appendChild(numField('TIA duration (minutes)', 'abcd3i-dur', { min: '0' }));
    root.appendChild(checkField('Diabetes (+1)', 'abcd3i-dm'));
    root.appendChild(checkField('Dual TIA — a second TIA within 7 days (+2)', 'abcd3i-dual'));
    root.appendChild(checkField('Ipsilateral ≥ 50% carotid stenosis (+2)', 'abcd3i-carotid'));
    root.appendChild(checkField('Abnormal DWI on MRI (+2)', 'abcd3i-dwi'));
    const o = out(); root.appendChild(o);
    const ids = ['abcd3i-age', 'abcd3i-sbp', 'abcd3i-dbp', 'abcd3i-clinical', 'abcd3i-dur', 'abcd3i-dm', 'abcd3i-dual', 'abcd3i-carotid', 'abcd3i-dwi'];
    wire(ids, () => safe(o, () => {
      const r = M.abcd3i({
        age: val('abcd3i-age'), sbp: val('abcd3i-sbp'), dbp: val('abcd3i-dbp'), clinical: val('abcd3i-clinical'), durationMinutes: val('abcd3i-dur'),
        diabetes: chk('abcd3i-dm'), dualTia: chk('abcd3i-dual'), carotidStenosis: chk('abcd3i-carotid'), dwiAbnormal: chk('abcd3i-dwi'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ABCD3-I', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.1 sort-mortality --------------------------------------------------
  'sort-mortality'(root) {
    note(root, 'Surgical Outcome Risk Tool (Protopapa 2014): a preoperative 30-day-mortality estimate from six routine variables — ASA physical status, urgency, high-risk specialty (GI / thoracic / vascular), surgical severity, cancer, and age. logit = −7.366 + weighted terms; mortality = 1/(1+e^−logit). Near-neighbors: rcri, possum, surgical-apgar.');
    root.appendChild(selectField('ASA physical status', 'sort-asa', [
      { value: 'I', text: 'I (0)' },
      { value: 'II', text: 'II (0)' },
      { value: 'III', text: 'III (+1.411)' },
      { value: 'IV', text: 'IV (+2.388)' },
      { value: 'V', text: 'V (+4.081)' },
    ]));
    root.appendChild(selectField('Urgency', 'sort-urgency', [
      { value: 'elective', text: 'Elective (0)' },
      { value: 'expedited', text: 'Expedited (+1.236)' },
      { value: 'urgent', text: 'Urgent (+1.657)' },
      { value: 'immediate', text: 'Immediate (+2.452)' },
    ]));
    root.appendChild(numField('Age (years)', 'sort-age', { min: '0' }));
    root.appendChild(checkField('High-risk specialty — GI, thoracic, or vascular (+0.712)', 'sort-highrisk'));
    root.appendChild(checkField('Surgical severity major / complex (+0.381)', 'sort-major'));
    root.appendChild(checkField('Cancer / malignancy (+0.667)', 'sort-cancer'));
    const o = out(); root.appendChild(o);
    const ids = ['sort-asa', 'sort-urgency', 'sort-age', 'sort-highrisk', 'sort-major', 'sort-cancer'];
    wire(ids, () => safe(o, () => {
      const r = M.sort({ asa: val('sort-asa'), urgency: val('sort-urgency'), age: val('sort-age'), highRiskSpecialty: chk('sort-highrisk'), majorComplex: chk('sort-major'), cancer: chk('sort-cancer') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SORT', value: `${r.score}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
