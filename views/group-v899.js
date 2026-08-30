// spec-v899 §2: renderer for periop-bridging — periprocedural anticoagulant interruption and
// bridging (Clinical Scoring & Risk, Group G).
//
// The default-is-not-to-bridge sentence prints on every result, because bridging was routine for
// years and the habit outlives the evidence.

import { el, clear } from '../lib/dom.js';
import * as B from '../lib/periop-bridging-v899.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
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
  'periop-bridging'(root) {
    note(root, 'The default is not to bridge. A direct oral anticoagulant is never bridged, whatever the risk.');

    root.appendChild(el('h2', { text: 'The anticoagulant' }));
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'What the patient takes', 'pb-agent', [
      { value: 'doac', text: 'A direct oral anticoagulant' },
      { value: 'warfarin', text: 'Warfarin' },
    ]);

    root.appendChild(el('h2', { text: 'The procedure' }));
    selectField(root, 'Bleeding risk of the procedure', 'pb-procedurerisk', [
      { value: 'minimal', text: 'Minimal bleeding risk: many dental, dermatologic, ophthalmic and endoscopic procedures' },
      { value: 'low', text: 'Low bleeding risk' },
      { value: 'high', text: 'High bleeding risk' },
    ]);

    root.appendChild(el('h2', { text: 'The patient' }));
    selectField(root, 'Thrombotic risk', 'pb-thromboticrisk', [
      { value: 'low', text: 'Low or moderate thrombotic risk' },
      { value: 'high', text: 'High thrombotic risk: a mechanical mitral valve, a stroke or venous thromboembolism within 3 months, or an equivalent' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['pb-agent', 'pb-procedurerisk', 'pb-thromboticrisk'], () => safe(o, () => {
      const r = B.periopBridging({
        agent: val('pb-agent'),
        procedureRisk: val('pb-procedurerisk'),
        thromboticRisk: val('pb-thromboticrisk'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.minimalNote) note(o, r.minimalNote);
      if (r.inrNote) note(o, r.inrNote);
      note(o, r.doacNote);
      if (r.resumeNote) note(o, r.resumeNote);
      note(o, r.defaultNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published guidance to a drug, a procedure risk and a thrombotic risk already characterized. It does not prescribe, and it does not set an interruption schedule.' }));
  },
};
