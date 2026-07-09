// spec-v258 §2: renderers for the acute & primary-care decision rules — the Canadian
// CT Head Rule, the San Francisco Syncope Rule (CHESS), and the McIsaac score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/decision-rules-v258.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'canadian-ct-head'(root) {
    note(root, 'Canadian CT Head Rule: for minor head injury (GCS 13-15 with witnessed LOC / amnesia / disorientation). CT recommended if any high- or medium-risk criterion is present. Near-neighbors: pecarn-head, nexus-cspine, gcs.');
    note(root, 'High-risk criteria (need for neurosurgical intervention):');
    root.appendChild(check('GCS < 15 at 2 h post-injury', 'cch-gcs2h'));
    root.appendChild(check('Suspected open or depressed skull fracture', 'cch-skull'));
    root.appendChild(check('Any sign of basal skull fracture (hemotympanum, raccoon eyes, CSF oto/rhinorrhea, Battle sign)', 'cch-basal'));
    root.appendChild(check('>= 2 episodes of vomiting', 'cch-vomit'));
    root.appendChild(check('Age >= 65 years', 'cch-age65'));
    note(root, 'Medium-risk criteria (clinically important brain injury on CT):');
    root.appendChild(check('Retrograde amnesia >= 30 min before impact', 'cch-amnesia'));
    root.appendChild(check('Dangerous mechanism (pedestrian struck, occupant ejected, fall > 3 ft / 5 stairs)', 'cch-mechanism'));
    const o = out(); root.appendChild(o);
    wire(['cch-gcs2h', 'cch-skull', 'cch-basal', 'cch-vomit', 'cch-age65', 'cch-amnesia', 'cch-mechanism'], () => safe(o, () => {
      render(o, M.canadianCtHead({
        gcs2h: chk('cch-gcs2h'), skullFracture: chk('cch-skull'), basalFracture: chk('cch-basal'),
        vomiting: chk('cch-vomit'), age65: chk('cch-age65'),
        retrogradeAmnesia: chk('cch-amnesia'), dangerousMechanism: chk('cch-mechanism'),
      }), 'Criteria');
    }));
    postureNote(root);
  },
  'sf-syncope'(root) {
    note(root, 'San Francisco Syncope Rule — CHESS mnemonic. Any one positive => high risk for a serious 7-day outcome; all negative => low risk. Near-neighbors: canadian-syncope, rose-syncope, egsys.');
    root.appendChild(check('C — history of Congestive heart failure', 'sfs-chf'));
    root.appendChild(check('H — Hematocrit < 30%', 'sfs-hct'));
    root.appendChild(check('E — abnormal ECG (new change or any non-sinus rhythm)', 'sfs-ecg'));
    root.appendChild(check('S — Shortness of breath', 'sfs-sob'));
    root.appendChild(check('S — triage Systolic BP < 90 mmHg', 'sfs-sbp'));
    const o = out(); root.appendChild(o);
    wire(['sfs-chf', 'sfs-hct', 'sfs-ecg', 'sfs-sob', 'sfs-sbp'], () => safe(o, () => {
      render(o, M.sfSyncope({
        chf: chk('sfs-chf'), hct30: chk('sfs-hct'), abnormalEcg: chk('sfs-ecg'),
        dyspnea: chk('sfs-sob'), sbp90: chk('sfs-sbp'),
      }), 'CHESS');
    }));
    postureNote(root);
  },
  'mcisaac'(root) {
    note(root, 'McIsaac score = Centor (4 criteria) + age adjustment (3-14 +1, 15-44 0, >= 45 -1). Maps -1..5 to group A strep probability and a testing strategy. Near-neighbors: centor, feverpain.');
    root.appendChild(numInput('Age (years)', 'mci-age', { min: '0', max: '120' }));
    root.appendChild(check('Temperature > 38 C', 'mci-fever'));
    root.appendChild(check('Absence of cough', 'mci-cough'));
    root.appendChild(check('Tender anterior cervical adenopathy', 'mci-adeno'));
    root.appendChild(check('Tonsillar swelling or exudate', 'mci-exudate'));
    const o = out(); root.appendChild(o);
    wire(['mci-age', 'mci-fever', 'mci-cough', 'mci-adeno', 'mci-exudate'], () => safe(o, () => {
      render(o, M.mcisaacScore({
        age: val('mci-age'), fever: chk('mci-fever'), absentCough: chk('mci-cough'),
        adenopathy: chk('mci-adeno'), exudate: chk('mci-exudate'),
      }), 'McIsaac');
    }));
    postureNote(root);
  },
};
