// spec-v869 §2: renderer for eortc-msg-ifd — the EORTC/MSGERC consensus definitions of invasive
// fungal disease (Clinical Scoring & Risk, Group G).
//
// The research-definition sentence prints on every result, and the "possible is not a treatment
// category" sentence prints whenever the case lands there, because that is the tier acted on as
// though it were a diagnosis.

import { el, clear } from '../lib/dom.js';
import * as F from '../lib/eortc-msg-ifd-v869.js';
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

const domId = (key) => `ifd-${key.toLowerCase()}`;

export const renderers = {
  'eortc-msg-ifd'(root) {
    note(root, 'Research definitions, written so that trials can be compared. They do not decide whether a patient is treated.');

    root.appendChild(el('h2', { text: 'Proven disease' }));
    checkField(root, 'Fungal invasion shown by histopathology, cytopathology or direct microscopy from a normally sterile site, or a culture from a normally sterile site', 'ifd-provenevidence');

    root.appendChild(el('h2', { text: 'Host factors' }));
    for (const h of F.HOST_FACTORS) checkField(root, h.text, domId(h.key));

    root.appendChild(el('h2', { text: 'Clinical features' }));
    for (const c of F.CLINICAL_FEATURES) checkField(root, c.text, domId(c.key));

    root.appendChild(el('h2', { text: 'Mycological evidence' }));
    for (const m of F.MYCOLOGICAL_EVIDENCE) checkField(root, m.text, domId(m.key));

    const groups = [F.HOST_FACTORS, F.CLINICAL_FEATURES, F.MYCOLOGICAL_EVIDENCE];
    const ids = ['ifd-provenevidence'].concat(...groups.map((g) => g.map((i) => domId(i.key))));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { provenEvidence: checked('ifd-provenevidence') };
      for (const g of groups) for (const i of g) args[i.key] = checked(domId(i.key));
      const r = F.eortcMsgIfd(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.present);
      if (r.missingNote) note(o, r.missingNote);
      if (r.provenNote) note(o, r.provenNote);
      if (r.possibleNote) note(o, r.possibleNote);
      if (r.probableNote) note(o, r.probableNote);
      if (r.hostNote) note(o, r.hostNote);
      note(o, r.researchNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published research definitions to findings already recorded. It does not decide whether to start antifungal treatment.' }));
  },
};
