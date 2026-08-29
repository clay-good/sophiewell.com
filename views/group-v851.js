// spec-v851 §2: renderer for rassi-chagas — the Rassi death-risk score in chronic Chagas heart
// disease (Clinical Scoring & Risk, Group G).
//
// Each checkbox carries its own point value, and there is deliberately no ejection-fraction
// field: the model does not contain one, and offering the box would invite a substitution the
// score was never validated for.

import { el, clear } from '../lib/dom.js';
import * as R from '../lib/rassi-chagas-v851.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rassi-chagas'(root) {
    note(root, 'Six findings, for a heart already known to be affected by Chagas disease. There is no ejection fraction in this score; it uses the chest radiograph and a yes-or-no wall-motion abnormality instead.');

    root.appendChild(el('h2', { text: 'Findings' }));
    root.appendChild(checkField('Class III or IV symptoms: marked limitation, or symptoms at rest (5 points)', 'rassi-nyha'));
    root.appendChild(checkField('Enlarged heart on the chest radiograph (5 points)', 'rassi-cmeg'));
    root.appendChild(checkField('Segmental or global wall-motion abnormality on echocardiography (3 points)', 'rassi-wma'));
    root.appendChild(checkField('Nonsustained ventricular tachycardia on 24-hour Holter (3 points)', 'rassi-nsvt'));
    root.appendChild(checkField('Low QRS voltage on the ECG (2 points)', 'rassi-lowv'));
    root.appendChild(checkField('Male sex (2 points)', 'rassi-male'));

    const ids = ['rassi-nyha', 'rassi-cmeg', 'rassi-wma', 'rassi-nsvt', 'rassi-lowv', 'rassi-male'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = R.rassiChagas({
        nyhaClass34: checked('rassi-nyha'),
        cardiomegaly: checked('rassi-cmeg'),
        wallMotion: checked('rassi-wma'),
        nsvt: checked('rassi-nsvt'),
        lowVoltage: checked('rassi-lowv'),
        maleSex: checked('rassi-male'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.bandMeaningNote);
      note(o, r.noEfNote);
      if (r.sexNote) note(o, r.sexNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports a published score and the published mortality figures that go with it. It does not select or adjust treatment, and it does not decide who needs a device.' }));
  },
};
