// spec-v216 §2: renderers for the hematology prognostic scores and staging
// systems — WPSS, MDACC CLL index, PIT, PRIMA-PI, Durie-Salmon, lymphocyte
// doubling time, and Talcott febrile-neutropenia groups. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the treatment decision to the
// clinician and the patient (spec-v11 §5.3) — these stage / stratify prognosis.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heme-prognostic-v216.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The treatment decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'wpss-mds'(root) {
    note(root, 'WPSS (Malcovati 2007): WHO category + karyotype + transfusion requirement (0-6). Very low 0, low 1, intermediate 2, high 3-4, very high 5-6. Near-neighbors: ipss-r, myeloma-iss.');
    root.appendChild(select('WHO category', 'wpss-cat', [['0', 'RA / RARS / isolated del(5q) (0)'], ['1', 'RCMD / RCMD-RS (1)'], ['2', 'RAEB-1 (2)'], ['3', 'RAEB-2 (3)']]));
    root.appendChild(select('Karyotype', 'wpss-karyo', [['0', 'Good (0)'], ['1', 'Intermediate (1)'], ['2', 'Poor (2)']]));
    root.appendChild(check('Regular transfusion requirement (+1)', 'wpss-tx'));
    const o = out(); root.appendChild(o);
    wire(['wpss-cat', 'wpss-karyo', 'wpss-tx'], () => safe(o, () => {
      const r = M.wpssMds({ whoCategory: val('wpss-cat'), karyotype: val('wpss-karyo'), transfusion: chk('wpss-tx') });
      render(o, r, 'WPSS', `${r.score}`);
    }));
    postureNote(root);
  },
  'mdacc-cll-index'(root) {
    note(root, 'MDACC CLL index (Wierda 2007): age, beta-2-microglobulin band, ALC, male, Rai III-IV, >= 3 nodal groups (0-9). Low <= 3, intermediate 4-7, high >= 8. Near-neighbors: cll-ipi, binet.');
    root.appendChild(num('Age (years)', 'mdacc-age', { min: '0' }));
    root.appendChild(select('Beta-2-microglobulin', 'mdacc-b2m', [['0', '< upper limit of normal (0)'], ['1', '1-2x ULN (1)'], ['2', '> 2x ULN (2)']]));
    root.appendChild(num('Absolute lymphocyte count (×10⁹/L)', 'mdacc-alc', { min: '0' }));
    root.appendChild(check('Male sex (+1)', 'mdacc-male'));
    root.appendChild(check('Rai stage III-IV (+1)', 'mdacc-rai'));
    root.appendChild(check('>= 3 involved nodal groups (+1)', 'mdacc-nodal'));
    const o = out(); root.appendChild(o);
    wire(['mdacc-age', 'mdacc-b2m', 'mdacc-alc', 'mdacc-male', 'mdacc-rai', 'mdacc-nodal'], () => safe(o, () => {
      const r = M.mdaccCll({ age: val('mdacc-age'), b2mBand: val('mdacc-b2m'), alc: val('mdacc-alc'), male: chk('mdacc-male'), raiAdvanced: chk('mdacc-rai'), nodalHigh: chk('mdacc-nodal') });
      render(o, r, 'MDACC', `${r.score}`);
    }));
    postureNote(root);
  },
  'pit-ptcl'(root) {
    note(root, 'Prognostic Index for PTCL-U (Gallamini 2004): one point each for age > 60, LDH > normal, ECOG >= 2, marrow involvement (0-4). Groups 1-4. Near-neighbors: flipi, nccn-ipi.');
    root.appendChild(check('Age > 60 years (+1)', 'pit-age'));
    root.appendChild(check('LDH above normal (+1)', 'pit-ldh'));
    root.appendChild(check('ECOG performance status >= 2 (+1)', 'pit-ecog'));
    root.appendChild(check('Bone-marrow involvement (+1)', 'pit-marrow'));
    const o = out(); root.appendChild(o);
    wire(['pit-age', 'pit-ldh', 'pit-ecog', 'pit-marrow'], () => safe(o, () => {
      const r = M.pitPtcl({ ageOver60: chk('pit-age'), ldhHigh: chk('pit-ldh'), ecog2: chk('pit-ecog'), marrow: chk('pit-marrow') });
      render(o, r, 'PIT group', `${r.group}`);
    }));
    postureNote(root);
  },
  'prima-pi'(root) {
    note(root, 'PRIMA-PI (Bachy 2018): beta-2-microglobulin and marrow involvement. Low = B2M <= 3 without marrow; intermediate = B2M <= 3 with marrow; high = B2M > 3. Near-neighbors: flipi, nccn-ipi.');
    root.appendChild(num('Beta-2-microglobulin (mg/L)', 'prima-b2m', { min: '0' }));
    root.appendChild(check('Bone-marrow involvement', 'prima-marrow'));
    const o = out(); root.appendChild(o);
    wire(['prima-b2m', 'prima-marrow'], () => safe(o, () => {
      const r = M.primaPi({ b2m: val('prima-b2m'), marrow: chk('prima-marrow') });
      render(o, r, 'PRIMA-PI', r.group);
    }));
    postureNote(root);
  },
  'durie-salmon'(root) {
    note(root, 'Durie-Salmon staging (Durie 1975): stage from hemoglobin, calcium, bone lesions, and M-protein burden; subclass A/B by creatinine. Near-neighbors: myeloma-iss, myeloma-r-iss.');
    root.appendChild(num('Hemoglobin (g/dL)', 'ds-hb', { min: '0' }));
    root.appendChild(num('Serum calcium (mg/dL)', 'ds-ca', { min: '0' }));
    root.appendChild(num('Number of lytic bone lesions', 'ds-lesions', { min: '0' }));
    root.appendChild(select('M-protein burden', 'ds-mprot', [['0', 'Low (IgG < 5, IgA < 3 g/dL; urine BJ < 4 g/24h)'], ['1', 'Intermediate'], ['2', 'High (IgG > 7, IgA > 5 g/dL; urine BJ > 12 g/24h)']]));
    root.appendChild(num('Serum creatinine (mg/dL)', 'ds-cr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ds-hb', 'ds-ca', 'ds-lesions', 'ds-mprot', 'ds-cr'], () => safe(o, () => {
      const r = M.durieSalmon({ hemoglobin: val('ds-hb'), calcium: val('ds-ca'), boneLesions: val('ds-lesions'), mProtein: val('ds-mprot'), creatinine: val('ds-cr') });
      render(o, r, 'Stage', r.stage);
    }));
    postureNote(root);
  },
  'lymphocyte-doubling-time'(root) {
    note(root, 'Lymphocyte doubling time (Molica 1987): LDT = interval × ln(2) / ln(ALC2 / ALC1). A doubling time <= 12 months predicts a worse CLL prognosis. Near-neighbors: cll-ipi, psa-doubling-time.');
    root.appendChild(num('Earlier absolute lymphocyte count (×10⁹/L)', 'ldt-alc1', { min: '0' }));
    root.appendChild(num('Later absolute lymphocyte count (×10⁹/L)', 'ldt-alc2', { min: '0' }));
    root.appendChild(num('Interval between counts (months)', 'ldt-int', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ldt-alc1', 'ldt-alc2', 'ldt-int'], () => safe(o, () => {
      const r = M.ldt({ alc1: val('ldt-alc1'), alc2: val('ldt-alc2'), intervalMonths: val('ldt-int') });
      render(o, r, 'LDT (months)', r.months !== undefined ? `${r.months}` : '');
    }));
    postureNote(root);
  },
  'talcott-febrile-neutropenia'(root) {
    note(root, "Talcott's rules (Talcott 1988): Group I inpatient; II outpatient with comorbidity; III outpatient with uncontrolled cancer; IV outpatient, no comorbidity, controlled cancer = low risk. Near-neighbors: mascc, cisne.");
    root.appendChild(check('Inpatient at onset of fever', 'tal-inpt'));
    root.appendChild(check('Outpatient with serious concurrent comorbidity', 'tal-comorb'));
    root.appendChild(check('Outpatient with uncontrolled / progressive cancer', 'tal-cancer'));
    const o = out(); root.appendChild(o);
    wire(['tal-inpt', 'tal-comorb', 'tal-cancer'], () => safe(o, () => {
      const r = M.talcott({ inpatient: chk('tal-inpt'), comorbidity: chk('tal-comorb'), uncontrolledCancer: chk('tal-cancer') });
      render(o, r, 'Talcott group', r.group);
    }));
    postureNote(root);
  },
};
