// spec-v135 §2: renderers for the five lymphoma / CLL prognostic-index tiles --
// r-ipi, nccn-ipi, gelf-criteria, hodgkin-ips, cll-ipi -- all in Clinical
// Scoring & Risk (Group G), beside flipi and ipss-r-mds.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an outcome
// group / score, not management (spec-v11 §5.3). Each compute surfaces a
// complete-the-fields fallback rather than a bad group; the yes/no selects carry
// a blank leading option so a partial entry is reported as not-assessed, not
// silently scored 0 (lib/lymphoma-v135.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lymphoma-v135.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The outcome group or score is the cited instrument’s, computed from the values you entered. The diagnosis and the management decision — treatment line, treat-versus-observe, chemotherapy choice — stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

export const renderers = {
  // ----- 2.1 r-ipi ------------------------------------------------------
  'r-ipi'(root) {
    note(root, 'Revised IPI for DLBCL (Sehn 2007): counts the five standard IPI factors — age >60, LDH above normal, Ann Arbor stage III–IV, ≥2 extranodal sites, ECOG ≥2 — and collapses the 0–5 count into three R-CHOP-era groups. Very good = 0 (4-yr PFS/OS ~94%), Good = 1–2 (~80% / ~79%), Poor = 3–5 (~53% / ~55%). Cross-links the NCCN-IPI.');
    root.appendChild(selectField('Age > 60?', 'ripi-age', YN));
    root.appendChild(selectField('Serum LDH above normal?', 'ripi-ldh', YN));
    root.appendChild(selectField('Ann Arbor stage III–IV?', 'ripi-stage', YN));
    root.appendChild(selectField('≥ 2 extranodal sites?', 'ripi-extra', YN));
    root.appendChild(selectField('ECOG performance status ≥ 2?', 'ripi-ecog', YN));
    const o = out(); root.appendChild(o);
    wire(['ripi-age', 'ripi-ldh', 'ripi-stage', 'ripi-extra', 'ripi-ecog'], () => safe(o, () => {
      const r = M.rIpi({ ageOver60: selVal('ripi-age'), ldhHigh: selVal('ripi-ldh'), stageAdvanced: selVal('ripi-stage'), extranodal2: selVal('ripi-extra'), ecog2: selVal('ripi-ecog') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'R-IPI', value: `${r.count} of 5 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 nccn-ipi ---------------------------------------------------
  'nccn-ipi'(root) {
    note(root, 'NCCN-IPI for DLBCL (Zhou 2014): a banded, rituximab-era IPI. Age >40–60 = 1, >60–75 = 2, >75 = 3; LDH normalized ratio >1–3× = 1, >3× = 2; stage III–IV = 1; ECOG ≥2 = 1; major-site extranodal (marrow, CNS, liver/GI, lung) = 1. Total 0–8 → low (0–1), low-int (2–3), high-int (4–5), high (6–8). 5-yr OS ~96 / 82 / 64 / 33%. Cross-links the R-IPI.');
    root.appendChild(field('Age (years)', 'nccn-age', { step: '1', min: 0, placeholder: 'e.g. 70' }));
    root.appendChild(field('LDH normalized ratio (measured ÷ upper limit of normal)', 'nccn-ldh', { step: '0.1', min: 0, placeholder: 'e.g. 2.5' }));
    root.appendChild(selectField('Ann Arbor stage III–IV?', 'nccn-stage', YN));
    root.appendChild(selectField('ECOG performance status ≥ 2?', 'nccn-ecog', YN));
    root.appendChild(selectField('Extranodal disease in a major site (marrow, CNS, liver/GI, lung)?', 'nccn-extra', YN));
    const o = out(); root.appendChild(o);
    wire(['nccn-age', 'nccn-ldh', 'nccn-stage', 'nccn-ecog', 'nccn-extra'], () => safe(o, () => {
      const r = M.nccnIpi({ age: optNum('nccn-age'), ldhRatio: optNum('nccn-ldh'), stageAdvanced: selVal('nccn-stage'), ecog2: selVal('nccn-ecog'), extranodalMajor: selVal('nccn-extra') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'NCCN-IPI', value: `${r.total} of 8 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 gelf-criteria ----------------------------------------------
  'gelf-criteria'(root) {
    note(root, 'GELF high-tumor-burden criteria for follicular lymphoma (Brice 1997): a treat-versus-watch flag. High tumor burden is met if ANY ONE — mass >7 cm; ≥3 nodal sites each >3 cm; B symptoms; symptomatic splenomegaly; pleural/peritoneal effusion; cytopenia (Hgb <10 g/dL or platelets <100 ×10⁹/L); leukemic phase (>5.0 ×10⁹/L circulating cells). Complements the FLIPI; cross-linked.');
    root.appendChild(field('Largest nodal/extranodal mass (cm)', 'gelf-mass', { step: '0.1', min: 0, placeholder: 'e.g. 8' }));
    root.appendChild(selectField('≥ 3 nodal sites each > 3 cm?', 'gelf-nodal', YN));
    root.appendChild(selectField('Systemic (B) symptoms?', 'gelf-bsymp', YN));
    root.appendChild(selectField('Symptomatic splenomegaly?', 'gelf-spleen', YN));
    root.appendChild(selectField('Pleural or peritoneal effusion?', 'gelf-effusion', YN));
    root.appendChild(field('Hemoglobin (g/dL)', 'gelf-hgb', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    root.appendChild(field('Platelet count (×10⁹/L)', 'gelf-plt', { step: '1', min: 0, placeholder: 'e.g. 220' }));
    root.appendChild(selectField('Leukemic phase (> 5.0 ×10⁹/L circulating malignant cells)?', 'gelf-leuk', YN));
    const o = out(); root.appendChild(o);
    wire(['gelf-mass', 'gelf-nodal', 'gelf-bsymp', 'gelf-spleen', 'gelf-effusion', 'gelf-hgb', 'gelf-plt', 'gelf-leuk'], () => safe(o, () => {
      const r = M.gelfCriteria({ maxMassCm: optNum('gelf-mass'), nodalSites3cm: selVal('gelf-nodal'), bSymptoms: selVal('gelf-bsymp'), splenomegaly: selVal('gelf-spleen'), effusion: selVal('gelf-effusion'), hgb: optNum('gelf-hgb'), platelet: optNum('gelf-plt'), leukemicPhase: selVal('gelf-leuk') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GELF', value: r.highTumorBurden ? 'High burden (met)' : 'Low burden (not met)' }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 hodgkin-ips ------------------------------------------------
  'hodgkin-ips'(root) {
    note(root, 'Hasenclever IPS for advanced Hodgkin lymphoma (Hasenclever & Diehl 1998): seven adverse factors, one each — albumin <4 g/dL, hemoglobin <10.5 g/dL, male sex, age ≥45, stage IV, WBC ≥15 ×10⁹/L, lymphocytopenia (<600/µL or <8% of WBC). Each factor lowers 5-yr freedom from progression ~7–8% (~84% at 0 down to ~42% at ≥5). Cross-links FLIPI and the R-IPI.');
    root.appendChild(field('Serum albumin (g/dL)', 'hips-alb', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'hips-hgb', { step: '0.1', min: 0, placeholder: 'e.g. 10' }));
    root.appendChild(selectField('Male sex?', 'hips-male', YN));
    root.appendChild(field('Age (years)', 'hips-age', { step: '1', min: 0, placeholder: 'e.g. 48' }));
    root.appendChild(selectField('Ann Arbor stage IV?', 'hips-stage', YN));
    root.appendChild(field('WBC (×10⁹/L)', 'hips-wbc', { step: '0.1', min: 0, placeholder: 'e.g. 16' }));
    root.appendChild(field('Lymphocyte count (cells/µL)', 'hips-lymphct', { step: '1', min: 0, placeholder: 'e.g. 500' }));
    root.appendChild(field('Lymphocytes (% of WBC)', 'hips-lymphpct', { step: '0.1', min: 0, placeholder: 'e.g. 7' }));
    const o = out(); root.appendChild(o);
    wire(['hips-alb', 'hips-hgb', 'hips-male', 'hips-age', 'hips-stage', 'hips-wbc', 'hips-lymphct', 'hips-lymphpct'], () => safe(o, () => {
      const r = M.hodgkinIps({ albumin: optNum('hips-alb'), hgb: optNum('hips-hgb'), male: selVal('hips-male'), age: optNum('hips-age'), stage4: selVal('hips-stage'), wbc: optNum('hips-wbc'), lymphCount: optNum('hips-lymphct'), lymphPct: optNum('hips-lymphpct') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Hodgkin IPS', value: `${r.count} of 7` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cll-ipi ----------------------------------------------------
  'cll-ipi'(root) {
    note(root, 'CLL-IPI (International CLL-IPI Working Group 2016): a weighted score. TP53 del(17p)/mutation = 4; IGHV unmutated = 2; β2-microglobulin >3.5 mg/L = 2; advanced clinical stage (Rai I–IV / Binet B–C) = 1; age >65 = 1. Total 0–10 → low (0–1), intermediate (2–3), high (4–6), very high (7–10). 5-yr OS ~93 / 79 / 63 / 23%. Cross-links FLIPI.');
    root.appendChild(selectField('TP53 abnormality — del(17p) and/or TP53 mutation?', 'cll-tp53', YN));
    root.appendChild(selectField('IGHV unmutated?', 'cll-ighv', YN));
    root.appendChild(selectField('Serum β2-microglobulin > 3.5 mg/L?', 'cll-b2m', YN));
    root.appendChild(selectField('Advanced clinical stage (Rai I–IV / Binet B–C)?', 'cll-stage', YN));
    root.appendChild(selectField('Age > 65?', 'cll-age', YN));
    const o = out(); root.appendChild(o);
    wire(['cll-tp53', 'cll-ighv', 'cll-b2m', 'cll-stage', 'cll-age'], () => safe(o, () => {
      const r = M.cllIpi({ tp53: selVal('cll-tp53'), ighvUnmutated: selVal('cll-ighv'), b2mHigh: selVal('cll-b2m'), stageAdvanced: selVal('cll-stage'), ageOver65: selVal('cll-age') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CLL-IPI', value: `${r.total} of 10 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
