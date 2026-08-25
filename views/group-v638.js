// spec-v638 §2: renderer for takayasu-acr-eular-2022 — the 2022 ACR/EULAR
// Takayasu Arteritis Classification Criteria (Clinical Scoring & Risk, Group G).
// The large-vessel-vasculitis companion to gca-acr-eular-2022 (group-v148.js).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note the tile frames a computed classification, not
// a diagnosis or a treat/escalate order in Sophie's voice. Both absolute
// requirements gate scoring; until they are checked the tile reports that the
// criteria are not yet applicable rather than scoring a partial total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/takayasu-v638.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification is the cited criteria set’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a scan or chart on its own. Classification criteria are built to standardize study cohorts, not to diagnose an individual; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'takayasu-acr-eular-2022'(root) {
    note(root, '2022 ACR/EULAR Takayasu arteritis classification (Grayson 2022): apply only after a medium/large-vessel-vasculitis diagnosis with mimics excluded, and only when BOTH absolute requirements hold — age ≤ 60 at diagnosis and imaging evidence of vasculitis. Ten weighted items then sum to 0–19; ≥ 5 classifies as Takayasu arteritis.');
    root.appendChild(checkField('Absolute requirement — age ≤ 60 years at diagnosis', 'tak-age'));
    root.appendChild(checkField('Absolute requirement — evidence of vasculitis on imaging (angiography, ultrasound, or PET of the aorta or branch arteries)', 'tak-imaging'));
    root.appendChild(checkField('Female sex (+1)', 'tak-female'));
    root.appendChild(checkField('Angina or ischemic cardiac pain (+2)', 'tak-angina'));
    root.appendChild(checkField('Arm or leg claudication (+2)', 'tak-claud'));
    root.appendChild(checkField('Vascular bruit — aorta, carotid, subclavian, axillary, brachial, renal, or iliofemoral (+2)', 'tak-bruit'));
    root.appendChild(checkField('Reduced pulse in upper extremity — axillary, brachial, or radial (+2)', 'tak-pulse'));
    root.appendChild(checkField('Carotid artery abnormality — reduced/absent carotid pulse or carotid tenderness (+2)', 'tak-carotid'));
    root.appendChild(checkField('Arm systolic blood-pressure difference ≥ 20 mmHg (+1)', 'tak-bp'));
    root.appendChild(checkField('Symmetric involvement of paired arteries — carotid, subclavian, or renal (+1)', 'tak-symmetric'));
    root.appendChild(checkField('Abdominal aorta involvement with renal or mesenteric involvement (+3)', 'tak-abdo'));
    root.appendChild(selectField('Number of affected arterial territories (of nine: thoracic aorta, abdominal aorta, mesenteric, L/R carotid, L/R subclavian, L/R renal)', 'tak-terr', [
      { value: 'none', text: 'None' },
      { value: 'one', text: 'One territory (+1)' },
      { value: 'two', text: 'Two territories (+2)' },
      { value: 'three', text: 'Three or more territories (+3)' },
    ]));
    const ids = ['tak-age', 'tak-imaging', 'tak-female', 'tak-angina', 'tak-claud', 'tak-bruit', 'tak-pulse', 'tak-carotid', 'tak-bp', 'tak-symmetric', 'tak-abdo', 'tak-terr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.takayasuAcrEular2022({
        ageEntry: chk('tak-age'), imagingEntry: chk('tak-imaging'), female: chk('tak-female'),
        angina: chk('tak-angina'), claudication: chk('tak-claud'), bruit: chk('tak-bruit'),
        reducedPulse: chk('tak-pulse'), carotid: chk('tak-carotid'), bpDiff: chk('tak-bp'),
        symmetric: chk('tak-symmetric'), abdoAorta: chk('tak-abdo'), territories: selVal('tak-terr'),
      });
      if (r.applicable === false) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/19` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
