// spec-v861 §2: renderer for sea-guideline — the spinal epidural abscess clinical decision
// guideline (Clinical Scoring & Risk, Group G).
//
// The deficit question sits first because it short-circuits the rest of the pathway, and the
// white cell count is asked for only so the tile can say what it does not mean.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sea-guideline-v861.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
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
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `sea-${key.toLowerCase()}`;

export const renderers = {
  'sea-guideline'(root) {
    note(root, 'For a patient who already has spine pain. The classic triad of fever, spine pain and a neurologic deficit appears in only a small minority of confirmed cases, so this pathway does not wait for it.');

    root.appendChild(el('h2', { text: 'First' }));
    checkField(root, 'Any neurologic deficit', 'sea-deficit');

    root.appendChild(el('h2', { text: 'Risk factors' }));
    for (const r of S.RISK_FACTORS) checkField(root, r.text, domId(r.key));

    root.appendChild(el('h2', { text: 'Findings' }));
    checkField(root, 'Fever', 'sea-fever');
    numField(root, 'Sedimentation rate (mm per hour)', 'sea-esr', { min: '0', max: '200', step: '1' });
    numField(root, 'White cell count (thousand per microliter)', 'sea-wbc', { min: '0', max: '200', step: '0.1' });

    const ids = ['sea-deficit', 'sea-fever', 'sea-esr', 'sea-wbc'].concat(S.RISK_FACTORS.map((r) => domId(r.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { deficit: checked('sea-deficit'), fever: checked('sea-fever'), esr: val('sea-esr'), wbc: val('sea-wbc') };
      for (const r of S.RISK_FACTORS) args[r.key] = checked(domId(r.key));
      const res = S.seaGuideline(args);
      if (!res.valid) { note(o, res.message); return; }
      resultRow(o, [{ text: res.band, cls: res.abnormal ? 'warn' : null }]);
      if (res.riskNote) note(o, res.riskNote);
      if (res.deficitNote) note(o, res.deficitNote);
      if (res.noRiskNote) note(o, res.noRiskNote);
      if (res.belowNote) note(o, res.belowNote);
      note(o, res.triadNote);
      if (res.feverNote) note(o, res.feverNote);
      if (res.wbcNote) note(o, res.wbcNote);
      note(o, res.scopeNote);
      note(o, res.detail);
      note(o, res.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This selects patients for imaging. It does not diagnose or exclude a spinal epidural abscess, and no pathway through it replaces the judgment of the clinician at the bedside.' }));
  },
};
