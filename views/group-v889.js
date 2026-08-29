// spec-v889 §2: renderer for home-oxygen — the qualifying criteria for long-term home oxygen
// therapy (Clinical Scoring & Risk, Group G).
//
// The room-air-and-stable condition prints on every result, because a qualifying number obtained
// the wrong way is the commonest reason a prescription does not hold up.

import { el, clear } from '../lib/dom.js';
import * as H from '../lib/home-oxygen-v889.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
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

const domId = (key) => `ho-${key.toLowerCase()}`;

export const renderers = {
  'home-oxygen'(root) {
    note(root, 'A resting measurement, taken on room air, with the patient clinically stable. All three matter before the number does.');

    root.appendChild(el('h2', { text: 'The measurement' }));
    numField(root, 'Arterial oxygen tension, mmHg', 'ho-pao2', { min: '10', max: '200', step: '1' });
    numField(root, 'Oxygen saturation, percent', 'ho-spo2', { min: '40', max: '100', step: '1' });
    checkField(root, 'Taken on room air', 'ho-roomair');
    checkField(root, 'Taken while the patient is clinically stable', 'ho-clinicallystable');

    root.appendChild(el('h2', { text: 'Supporting findings' }));
    note(root, 'These matter only in the borderline range: a tension of 56 to 59 mmHg, or a saturation of 89 percent.');
    for (const s of H.SUPPORTING_FINDINGS) checkField(root, s.text, domId(s.key));

    const ids = ['ho-pao2', 'ho-spo2', 'ho-roomair', 'ho-clinicallystable']
      .concat(H.SUPPORTING_FINDINGS.map((s) => domId(s.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        pao2: val('ho-pao2'),
        spo2: val('ho-spo2'),
        roomAir: checked('ho-roomair'),
        clinicallyStable: checked('ho-clinicallystable'),
      };
      for (const s of H.SUPPORTING_FINDINGS) args[s.key] = checked(domId(s.key));
      const r = H.homeOxygen(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.borderlineNote) note(o, r.borderlineNote);
      note(o, r.conditionsNote);
      note(o, r.exertionNote);
      note(o, r.evidenceNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a measurement already taken. It does not prescribe oxygen, and it does not determine coverage.' }));
  },
};
