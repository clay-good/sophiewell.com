// spec-v859 §2: renderer for priapism-gas — classifying priapism from the cavernous blood gas
// (Clinical Scoring & Risk, Group G).
//
// The trauma and sickle cell questions do not classify anything. They are asked so the tile can
// answer the two things that are got wrong around them.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/priapism-gas-v859.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'priapism-gas'(root) {
    note(root, 'The cavernous blood gas classifies the episode. A history of perineal or straddle trauma does not, and it is the classic reason an ischemic episode is watched instead of decompressed.');

    root.appendChild(el('h2', { text: 'Cavernous blood gas' }));
    numField(root, 'pO2 from the corpus cavernosum (mmHg)', 'pg-po2', { min: '0', max: '700', step: '1' });
    numField(root, 'pCO2 from the corpus cavernosum (mmHg)', 'pg-pco2', { min: '0', max: '250', step: '1' });
    numField(root, 'pH from the corpus cavernosum', 'pg-ph', { min: '6', max: '8', step: '0.01' });

    root.appendChild(el('h2', { text: 'The episode' }));
    numField(root, 'Hours since the erection began', 'pg-hours', { min: '0', max: '2000', step: '1' });
    selField(root, 'Color duplex, if it has been done', 'pg-flow', [
      ['', 'Not done'],
      ['absent', 'Absent or minimal cavernosal arterial flow'],
      ['normal', 'Normal or high cavernosal arterial flow'],
    ]);
    selField(root, 'Perineal or straddle trauma before it started', 'pg-trauma', [['', 'Not stated'], ['no', 'No'], ['yes', 'Yes']]);
    selField(root, 'Sickle cell disease', 'pg-sickle', [['', 'Not stated'], ['no', 'No'], ['yes', 'Yes']]);

    const ids = ['pg-po2', 'pg-pco2', 'pg-ph', 'pg-hours', 'pg-flow', 'pg-trauma', 'pg-sickle'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = P.priapismGas({
        po2: val('pg-po2'), pco2: val('pg-pco2'), ph: val('pg-ph'),
        hours: val('pg-hours'), flow: val('pg-flow'), trauma: val('pg-trauma'), sickle: val('pg-sickle'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.typeNote);
      if (r.discordantNote) note(o, r.discordantNote);
      if (r.clockNote) note(o, r.clockNote);
      if (r.traumaNote) note(o, r.traumaNote);
      if (r.sickleNote) note(o, r.sickleNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This classifies an episode from measurements already taken. It does not choose a drug, a dose, a shunt, or an embolization, and it is not a substitute for urgent urological assessment.' }));
  },
};
