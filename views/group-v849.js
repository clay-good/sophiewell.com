// spec-v849 §2: renderer for secondary-mitral-regurgitation-stage — the ACC/AHA chronic
// SECONDARY mitral regurgitation stages (Clinical Scoring & Risk, Group G).
//
// Every numeric field carries its CURRENT threshold in its own label, because the previous
// guideline's thresholds were half of these and are still widely read.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/secondary-mitral-regurgitation-stage-v849.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'secondary-mitral-regurgitation-stage'(root) {
    note(root, 'For a structurally normal valve pulled open by the ventricle or the atrium. Severe is an orifice of 0.40 square cm or a volume of 60 mL. The 2014 guideline set those lines at 0.20 and 30, and that band is still commonly read as severe.');

    root.appendChild(el('h2', { text: 'Severity of the leak' }));
    numField(root, 'Effective regurgitant orifice area, severe at 0.40 or more (square cm)', 'smr-ero', { min: '0', max: '3', step: '0.01' });
    numField(root, 'Regurgitant volume, severe at 60 or more (mL per beat)', 'smr-rvol', { min: '0', max: '300', step: '1' });
    numField(root, 'Regurgitant fraction, severe at 50 or more (percent)', 'smr-rf', { min: '0', max: '100', step: '1' });

    root.appendChild(el('h2', { text: 'The ventricle' }));
    numField(root, 'Left ventricular ejection fraction (percent)', 'smr-lvef', { min: '5', max: '85', step: '1' });
    root.appendChild(checkField('Coronary disease or cardiomyopathy with a structurally normal valve', 'smr-sub'));

    root.appendChild(el('h2', { text: 'Jet and symptoms' }));
    root.appendChild(checkField('No more than a small central jet: vena contracta below 0.30 cm', 'smr-small'));
    root.appendChild(checkField('Heart failure symptoms', 'smr-sx'));
    root.appendChild(checkField('Symptoms persist after revascularization and optimized medical therapy', 'smr-tx'));

    const ids = ['smr-ero', 'smr-rvol', 'smr-rf', 'smr-lvef', 'smr-sub', 'smr-small', 'smr-sx', 'smr-tx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.secondaryMitralRegurgitationStage({
        regurgitantOrifice: val('smr-ero'),
        regurgitantVolume: val('smr-rvol'),
        regurgitantFraction: val('smr-rf'),
        ejectionFraction: val('smr-lvef'),
        substrate: checked('smr-sub'),
        smallJet: checked('smr-small'),
        symptoms: checked('smr-sx'),
        therapyOptimized: checked('smr-tx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.supersededNote) note(o, r.supersededNote);
      if (r.noSplitNote) note(o, r.noSplitNote);
      if (r.treatedNote) note(o, r.treatedNote);
      if (r.pending) note(o, r.pending);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.substrateNote) note(o, r.substrateNote);
      note(o, r.secondaryOnlyNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and the severity adjudication stays with the echocardiographer and the heart team.' }));
  },
};
