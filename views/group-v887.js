// spec-v887 §2: renderer for hiv-pep-occupational — the occupational HIV post-exposure
// prophylaxis decision (Clinical Scoring & Risk, Group G).
//
// It names no drug and no regimen, deliberately, and says so on every result.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/hiv-pep-occupational-v887.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
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

export const renderers = {
  'hiv-pep-occupational'(root) {
    note(root, 'A decision framework. It names no drug, no dose and no regimen, and prophylaxis should not wait for source testing.');

    root.appendChild(el('h2', { text: 'The exposure' }));
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'What happened', 'pep-exposuretype', [
      { value: 'none', text: 'No exposure of a recognized type' },
      { value: 'percutaneous', text: 'Percutaneous injury: a needlestick or a cut with a sharp object' },
      { value: 'mucous-membrane', text: 'Contact of a mucous membrane with blood or another potentially infectious material' },
      { value: 'non-intact-skin', text: 'Contact of non-intact skin with blood or another potentially infectious material' },
      { value: 'bite-with-blood', text: 'A bite with blood exposure' },
      { value: 'intact-skin', text: 'Contact with intact skin only' },
    ]);
    numField(root, 'Hours since the exposure', 'pep-hourssinceexposure', { min: '0', max: '2000', step: '0.5' });

    root.appendChild(el('h2', { text: 'The source' }));
    selectField(root, 'Source HIV status', 'pep-sourcestatus', [
      { value: 'positive', text: 'Known HIV positive' },
      { value: 'unknown', text: 'Unknown status, or the source cannot be identified' },
      { value: 'negative', text: 'Known HIV negative' },
    ]);
    checkField(root, 'Risk factors for HIV are known in the source', 'pep-sourceriskfactors');

    const ids = ['pep-exposuretype', 'pep-hourssinceexposure', 'pep-sourcestatus', 'pep-sourceriskfactors'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = P.hivPepOccupational({
        exposureType: val('pep-exposuretype'),
        hoursSinceExposure: val('pep-hourssinceexposure'),
        sourceStatus: val('pep-sourcestatus'),
        sourceRiskFactors: checked('pep-sourceriskfactors'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.timingNote) note(o, r.timingNote);
      if (r.noTieringNote) note(o, r.noTieringNote);
      if (r.followUpNote) note(o, r.followUpNote);
      note(o, r.intactSkinNote);
      note(o, r.noDrugNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published decision framework to an exposure already described. It does not prescribe, and it does not replace occupational health review.' }));
  },
};
