// spec-v808 §2: renderer for hrs-aki — the 2024 ADQI/ICA diagnostic criteria for
// hepatorenal syndrome with acute kidney injury (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The four required
// criteria sit under one heading; the three findings that USED to exclude the diagnosis sit
// under a second heading that says plainly they no longer do.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hrs-aki-v808.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies criteria to findings already gathered. It does not start terlipressin, albumin or dialysis.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hrs-aki'(root) {
    note(root, 'All four criteria are required. Note what changed in 2024: the 48-hour albumin challenge is no longer a prerequisite, and proteinuria, microhematuria and an abnormal renal ultrasound no longer exclude the diagnosis.');
    root.appendChild(el('h2', { text: 'All four required' }));
    root.appendChild(checkField('Cirrhosis with ascites', 'hrs-cirrhosis'));
    root.appendChild(checkField('Creatinine up 0.3 mg/dL or more in 48 h, or 50 percent or more from a baseline in the past week, or urine output 0.5 mL/kg/h or less for 6 h or more', 'hrs-aki'));
    root.appendChild(checkField('No improvement within 24 hours of adequate volume resuscitation, where clinically indicated', 'hrs-novolume'));
    root.appendChild(checkField('No strong evidence for an alternative explanation as the primary cause', 'hrs-noalt'));
    root.appendChild(el('h2', { text: 'These no longer exclude the diagnosis (they did under the 2015 rule)' }));
    root.appendChild(checkField('Proteinuria above 500 mg per day', 'hrs-protein'));
    root.appendChild(checkField('Microhematuria above 50 red cells per high power field', 'hrs-heme'));
    root.appendChild(checkField('Abnormal renal ultrasound', 'hrs-us'));
    const ids = ['hrs-cirrhosis', 'hrs-aki', 'hrs-novolume', 'hrs-noalt', 'hrs-protein', 'hrs-heme', 'hrs-us'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hrsAki({
        cirrhosisWithAscites: checked('hrs-cirrhosis'),
        akiPresent: checked('hrs-aki'),
        noImprovementAfterVolume: checked('hrs-novolume'),
        noAlternativeCause: checked('hrs-noalt'),
        proteinuria: checked('hrs-protein'),
        microhematuria: checked('hrs-heme'),
        abnormalUltrasound: checked('hrs-us'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria met', value: `${r.criteriaMet}/4` },
      ]);
      if (r.note2015) note(o, r.note2015);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
