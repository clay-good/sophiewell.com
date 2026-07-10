// spec-v281 §2: renderers for the HCC surveillance & detection tiles — the GALAD
// serum-biomarker score and the Toronto HCC Risk Index (THRI). Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers diagnosis and surveillance planning to
// the hepatology team (spec-v11 §5.3): it reports a probability or a risk category,
// never a diagnosis or a surveillance-interval order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hcc-surveillance-v281.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and surveillance planning stay with the hepatology team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.bandLabel, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'galad-hcc'(root) {
    note(root, 'GALAD score (Johnson 2014) — the serum-biomarker probability that a lesion is HCC, from Gender, Age, AFP-L3, AFP, and DCP (PIVKA-II). Commonly applied at the Z = −0.63 cutoff. Assay units: AFP ng/mL, DCP mAU/mL, AFP-L3 %. Near-neighbors: amap-score, page-b, bclc-hcc.');
    root.appendChild(select('Sex', 'galad-sex', [['male', 'Male'], ['female', 'Female']]));
    root.appendChild(num('Age (years)', 'galad-age', { min: '0', max: '120' }));
    root.appendChild(num('AFP-L3 (%)', 'galad-afpl3', { min: '0', max: '100' }));
    root.appendChild(num('AFP (ng/mL)', 'galad-afp', { min: '0' }));
    root.appendChild(num('DCP / PIVKA-II (mAU/mL)', 'galad-dcp', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['galad-sex', 'galad-age', 'galad-afpl3', 'galad-afp', 'galad-dcp'], () => safe(o, () => {
      render(o, M.galadHcc({
        sex: val('galad-sex'), age: val('galad-age'), afpL3: val('galad-afpl3'),
        afp: val('galad-afp'), dcp: val('galad-dcp'),
      }), 'GALAD Z');
    }));
    postureNote(root);
  },
  'toronto-hcc-risk'(root) {
    note(root, 'Toronto HCC Risk Index (THRI; Sharma 2017) — 10-year HCC risk in cirrhosis from age, sex, etiology, and platelet count (total 0–366). Bands: low < 120 (~3% 10-yr HCC), medium 120–240 (~10%), high > 240 (~32%). Near-neighbors: amap-score, page-b, albi-grade.');
    root.appendChild(num('Age (years)', 'thri-age', { min: '0', max: '120' }));
    root.appendChild(select('Sex', 'thri-sex', [['male', 'Male'], ['female', 'Female']]));
    root.appendChild(select('Cirrhosis etiology', 'thri-etiology', [
      ['hbv', 'HBV (+97)'], ['hcv', 'HCV (+97)'], ['steatohepatitis', 'Steatohepatitis — NAFLD/ALD (+54)'],
      ['other', 'Other (+36)'], ['hcv-svr', 'HCV with SVR (0)'], ['autoimmune', 'Autoimmune — AIH/PBC/PSC (0)'],
    ]));
    root.appendChild(num('Platelet count (×10⁹/L)', 'thri-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['thri-age', 'thri-sex', 'thri-etiology', 'thri-plt'], () => safe(o, () => {
      render(o, M.torontoHccRisk({
        age: val('thri-age'), sex: val('thri-sex'), etiology: val('thri-etiology'), platelets: val('thri-plt'),
      }), 'THRI');
    }));
    postureNote(root);
  },
};
