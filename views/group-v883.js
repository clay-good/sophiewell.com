// spec-v883 §2: renderer for ipmn-fukuoka — the international consensus Fukuoka tiers for
// branch-duct IPMN (Clinical Scoring & Risk, Group G).
//
// The worrisome-means-ultrasound sentence prints on every result, because the two tiers are
// routinely read as the same recommendation.

import { el, clear } from '../lib/dom.js';
import * as I from '../lib/ipmn-fukuoka-v883.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `ip-${key.toLowerCase()}`;

export const renderers = {
  'ipmn-fukuoka'(root) {
    note(root, 'Two tiers, two different recommendations. A worrisome feature calls for endoscopic ultrasound, not an operation.');

    root.appendChild(el('h2', { text: 'High-risk stigmata' }));
    for (const s of I.HIGH_RISK_STIGMATA) checkField(root, s.text, domId(s.key));

    root.appendChild(el('h2', { text: 'Worrisome features' }));
    for (const s of I.WORRISOME_FEATURES) checkField(root, s.text, domId(s.key));

    const all = [...I.HIGH_RISK_STIGMATA, ...I.WORRISOME_FEATURES];
    const ids = all.map((s) => domId(s.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const s of all) args[s.key] = checked(domId(s.key));
      const r = I.ipmnFukuoka(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.bothTiersNote) note(o, r.bothTiersNote);
      if (r.sizeNote) note(o, r.sizeNote);
      if (r.jaundiceNote) note(o, r.jaundiceNote);
      note(o, r.tierNote);
      note(o, r.measurementNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This sorts findings already recorded into published tiers. It does not decide whether to operate.' }));
  },
};
