// spec-v641 §2: renderer for egpa-acr-eular-2022 — the 2022 ACR/EULAR
// Classification Criteria for Eosinophilic Granulomatosis with Polyangiitis
// (Clinical Scoring & Risk, Group G). The fifth and final 2022 ACR/EULAR
// vasculitis tile, completing the set (group-v148/v638/v639/v640.js).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two items
// carry NEGATIVE weights (cANCA/PR3, hematuria); the labels show the sign. No
// absolute-requirement gate: the items sum directly. Note the two contrasts with
// GPA/MPA in the note: eosinophilia is +5 here (not -4), and the threshold is >= 6.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/egpa-v641.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification is the cited criteria set’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a scan, lab, or biopsy on its own. Classification criteria are built to standardize study cohorts, not to diagnose an individual; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'egpa-acr-eular-2022'(root) {
    note(root, '2022 ACR/EULAR eosinophilic-granulomatosis-with-polyangiitis classification (Grayson 2022): apply only after a small/medium-vessel-vasculitis diagnosis with mimics excluded. Seven weighted items sum to a range of -4 to +14; ≥ 6 classifies as EGPA. Note two contrasts with GPA/MPA: eosinophilia is the heaviest POSITIVE item here (+5), and the threshold is ≥ 6 (one higher). Two items are negative (cANCA/PR3, hematuria). Companion tiles: gpa-acr-eular-2022, mpa-acr-eular-2022.');
    root.appendChild(checkField('Maximum blood eosinophil count ≥ 1 x10^9/L (+5)', 'egpa-eos'));
    root.appendChild(checkField('Obstructive airway disease (+3)', 'egpa-airway'));
    root.appendChild(checkField('Nasal polyps (+3)', 'egpa-polyps'));
    root.appendChild(checkField('Extravascular eosinophilic-predominant inflammation (+2)', 'egpa-extra'));
    root.appendChild(checkField('Mononeuritis multiplex or motor neuropathy not due to radiculopathy (+1)', 'egpa-mono'));
    root.appendChild(checkField('Positive cANCA or anti-PR3 antibody (-3)', 'egpa-canca'));
    root.appendChild(checkField('Hematuria (-1)', 'egpa-hematuria'));
    const ids = ['egpa-eos', 'egpa-airway', 'egpa-polyps', 'egpa-extra', 'egpa-mono', 'egpa-canca', 'egpa-hematuria'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.egpaAcrEular2022({
        eosinophilia: chk('egpa-eos'), airwayObstruction: chk('egpa-airway'), nasalPolyps: chk('egpa-polyps'),
        extravascularEos: chk('egpa-extra'), mononeuritis: chk('egpa-mono'), cAncaPr3: chk('egpa-canca'),
        hematuria: chk('egpa-hematuria'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/14` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
