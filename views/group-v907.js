// spec-v907 §2: renderer for vod-sos — which published definition of hepatic veno-occlusive
// disease / sinusoidal obstruction syndrome a post-transplant picture meets (Clinical Scoring &
// Risk, Group G).
//
// All three definitions are reported side by side. Where they part, neither is offered as the
// answer.
//
// The weight-gain options are written out as literals rather than mapped from the library,
// because scripts/lib/option-labels.mjs reads this file statically and cannot follow a .map().

import { el, clear } from '../lib/dom.js';
import * as V from '../lib/vod-sos-v907.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vod-sos'(root) {
    numField(root, 'Days since transplant', 'vs-days');

    root.appendChild(el('h2', { text: 'Findings' }));
    checkField(root, 'Bilirubin at or above 2 mg/dL', 'vs-bilirubinatleasttwo');
    checkField(root, 'Hepatomegaly or right upper quadrant pain of liver origin', 'vs-hepatomegalyorruqpain');
    checkField(root, 'Painful hepatomegaly', 'vs-painfulhepatomegaly');
    checkField(root, 'Ascites', 'vs-ascites');

    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'vs-weightgain', text: 'Weight gain from baseline' }));
    const sel = el('select', { id: 'vs-weightgain' });
    sel.appendChild(el('option', { value: 'none', text: 'No weight gain above 2% of baseline' }));
    sel.appendChild(el('option', { value: 'over2', text: 'Weight gain above 2% but not above 5% of baseline' }));
    sel.appendChild(el('option', { value: 'over5', text: 'Weight gain above 5% of baseline' }));
    wrap.appendChild(sel);
    root.appendChild(wrap);

    root.appendChild(el('h2', { text: 'Beyond day 21 only' }));
    checkField(root, 'Hemodynamic or ultrasound evidence of veno-occlusive disease', 'vs-hemodynamicorultrasoundevidence');
    checkField(root, 'Histologically proven', 'vs-histologicallyproven');

    const ids = ['vs-days', 'vs-bilirubinatleasttwo', 'vs-hepatomegalyorruqpain', 'vs-painfulhepatomegaly',
      'vs-ascites', 'vs-weightgain', 'vs-hemodynamicorultrasoundevidence', 'vs-histologicallyproven'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = V.vodSos({
        daysSinceTransplant: val('vs-days'),
        bilirubinAtLeastTwo: checked('vs-bilirubinatleasttwo'),
        hepatomegalyOrRuqPain: checked('vs-hepatomegalyorruqpain'),
        painfulHepatomegaly: checked('vs-painfulhepatomegaly'),
        ascites: checked('vs-ascites'),
        weightGain: val('vs-weightgain'),
        hemodynamicOrUltrasoundEvidence: checked('vs-hemodynamicorultrasoundevidence'),
        histologicallyProven: checked('vs-histologicallyproven'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const d of r.definitions) note(o, `${d.name}: ${d.met ? 'met' : 'not met'}. ${d.why}`);
      note(o, r.bilirubinNote);
      note(o, r.lateOnsetNote);
      note(o, r.severityNote);
      note(o, r.pediatricNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This checks recorded findings against three published definitions. It does not diagnose, and it does not decide on treatment.' }));
  },
};
