// spec-v109 §2: renderers for the five trauma-classification / soft-tissue-
// infection tiles (denver-bcvi, aast-organ-injury, mangled-extremity, lrinec,
// alt-70). The fourth Wave-2 renderer module of the spec-v100 program. All five
// are Group G classification / scoring rules.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage.
// aast-organ-injury is a per-organ decision tree -- the anatomic-finding select
// rebuilds when the organ changes -- not a browsable atlas; mangled-extremity
// applies the ischemia-time doubling; denver-bcvi, lrinec, and alt-70 are bounded
// criteria/threshold logic. Each tile renders the spec-v50 §3 clinical posture
// note and frames its output as the cited rule's class / score / verdict -- none
// authors a CTA, debridement, antibiotic, or amputation order in Sophie's voice
// (spec-v11 §5.3); the decision stays with the clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/traumaclass-v109.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The class, score, and verdict band are the cited rule’s, computed from the inputs you entered. The imaging, surgical, antibiotic, and salvage-vs-amputation decisions stay with the clinician and local protocol.' }));
}
function derivation(root, caption, terms) {
  if (!terms || !terms.length) return;
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, terms.map((t) => {
    const v = typeof t.value === 'number' && Number.isFinite(t.value)
      ? (t.value >= 0 ? `+${t.value}` : String(t.value))
      : '--';
    return el('li', { class: 'muted', text: `${t.label}: ${v}` });
  })));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

// AAST anatomic-finding option lists per organ (label text mirrors the lib
// findings table; value is the base grade). Rebuilt into the select on organ
// change so the tile is a decision tree, not a static atlas.
const AAST_FINDINGS = {
  spleen: [
    { value: '1', text: 'I -- subcapsular hematoma < 10%; laceration < 1 cm; capsular tear' },
    { value: '2', text: 'II -- subcapsular 10-50%; intraparenchymal < 5 cm; laceration 1-3 cm' },
    { value: '3', text: 'III -- subcapsular > 50% or ruptured >= 5 cm; laceration > 3 cm' },
    { value: '4', text: 'IV -- segmental/hilar vessel laceration, > 25% devascularization' },
    { value: '5', text: 'V -- shattered spleen' },
  ],
  liver: [
    { value: '1', text: 'I -- subcapsular hematoma < 10%; laceration < 1 cm; capsular tear' },
    { value: '2', text: 'II -- subcapsular 10-50%; intraparenchymal < 10 cm; laceration 1-3 cm' },
    { value: '3', text: 'III -- subcapsular > 50% or ruptured; intraparenchymal > 10 cm; laceration > 3 cm' },
    { value: '4', text: 'IV -- parenchymal disruption 25-75% of a hepatic lobe' },
    { value: '5', text: 'V -- disruption > 75% of a lobe; juxtahepatic venous injury' },
  ],
  kidney: [
    { value: '1', text: 'I -- subcapsular hematoma and/or contusion without laceration' },
    { value: '2', text: 'II -- perirenal hematoma in Gerota; laceration <= 1 cm, no extravasation' },
    { value: '3', text: 'III -- laceration > 1 cm without collecting-system rupture' },
    { value: '4', text: 'IV -- collecting-system/UPJ injury; segmental vessel; segmental infarction' },
    { value: '5', text: 'V -- main renal artery/vein laceration/avulsion; shattered kidney' },
  ],
};

export const renderers = {
  // ----- 2.1 denver-bcvi ------------------------------------------------
  'denver-bcvi'(root) {
    note(root, 'Screening criteria for blunt cerebrovascular injury. Any single positive sign/symptom or risk factor indicates CT angiography.');
    root.appendChild(el('p', { class: 'muted', text: 'Signs / symptoms of BCVI:' }));
    const signs = [
      ['Arterial hemorrhage from neck, nose, or mouth', 'db-ah'],
      ['Cervical bruit in a patient < 50 years', 'db-br'],
      ['Expanding cervical hematoma', 'db-eh'],
      ['Focal neurologic deficit (TIA, hemiparesis, vertebrobasilar, Horner)', 'db-fd'],
      ['Neurologic exam incongruous with head CT findings', 'db-in'],
      ['Stroke on secondary CT scan', 'db-st'],
    ];
    for (const [label, id] of signs) root.appendChild(checkField(label, id));
    root.appendChild(el('p', { class: 'muted', text: 'High-energy-mechanism risk factors:' }));
    const risks = [
      ['LeFort II or III fracture', 'db-lf'],
      ['Cervical-spine fracture (subluxation, transverse-foramen, or C1-C3)', 'db-cs'],
      ['Basilar skull fracture with carotid-canal involvement', 'db-bc'],
      ['Diffuse axonal injury with GCS < 6', 'db-da'],
      ['Near-hanging with anoxic brain injury', 'db-nh'],
      ['Seatbelt/clothesline injury with cervical swelling, pain, or AMS', 'db-sb'],
    ];
    for (const [label, id] of risks) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = signs.concat(risks).map(([, id]) => id);
    wire(ids, () => safe(o, () => {
      const r = M.denverBcvi({
        arterialHemorrhage: chk('db-ah'), cervicalBruit: chk('db-br'), expandingHematoma: chk('db-eh'),
        focalDeficit: chk('db-fd'), deficitIncongruous: chk('db-in'), strokeOnCt: chk('db-st'),
        lefort: chk('db-lf'), cspineFracture: chk('db-cs'), basilarCarotid: chk('db-bc'),
        daiLowGcs: chk('db-da'), nearHanging: chk('db-nh'), seatbeltSign: chk('db-sb'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Positive criteria', value: String(r.positive) },
        { label: 'CTA screening', value: r.screen ? 'indicated' : 'not indicated' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 aast-organ-injury ------------------------------------------
  'aast-organ-injury'(root) {
    note(root, 'Select the organ, the worst anatomic finding, and any vascular finding. The grade is the higher of the anatomic and the 2018 vascular-rule grade.');
    root.appendChild(selectField('Organ', 'ao-organ', [
      { value: 'spleen', text: 'Spleen' },
      { value: 'liver', text: 'Liver' },
      { value: 'kidney', text: 'Kidney' },
    ]));
    root.appendChild(selectField('Worst anatomic finding', 'ao-find', AAST_FINDINGS.spleen));
    root.appendChild(selectField('Vascular finding (2018 rule)', 'ao-vasc', [
      { value: 'none', text: 'None' },
      { value: 'contained', text: 'Vascular injury / active bleeding contained within the organ' },
      { value: 'beyond', text: 'Active bleeding extending beyond the organ' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = M.aastOrganInjury({ organ: selVal('ao-organ'), finding: Number(selVal('ao-find')), vascular: selVal('ao-vasc') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AAST grade', value: r.gradeRoman },
        { label: 'Set by', value: r.vascularSet ? '2018 vascular rule' : 'anatomic finding' },
      ]);
      note(o, r.note);
    });
    // Rebuild the anatomic-finding options when the organ changes.
    const organSel = document.getElementById('ao-organ');
    if (organSel) {
      organSel.addEventListener('change', () => {
        const findSel = document.getElementById('ao-find');
        if (findSel) {
          clear(findSel);
          for (const opt of (AAST_FINDINGS[organSel.value] || AAST_FINDINGS.spleen)) {
            findSel.appendChild(el('option', { value: opt.value, text: opt.text }));
          }
        }
        run();
      });
    }
    wire(['ao-organ', 'ao-find', 'ao-vasc'], run);
  },

  // ----- 2.3 mangled-extremity ------------------------------------------
  'mangled-extremity'(root) {
    note(root, 'Lower-extremity trauma limb-salvage aid. The ischemia subscore is doubled when the ischemia time exceeds 6 hours.');
    root.appendChild(selectField('Skeletal / soft-tissue injury energy', 'me-sk', [
      { value: '1', text: 'Low energy (stab, simple fracture, civilian GSW) -- 1' },
      { value: '2', text: 'Medium energy (open/multiple fractures, dislocation) -- 2' },
      { value: '3', text: 'High energy (shotgun, military GSW, crush) -- 3' },
      { value: '4', text: 'Very high energy (above + gross contamination, avulsion) -- 4' },
    ]));
    root.appendChild(selectField('Limb ischemia', 'me-isc', [
      { value: '1', text: 'Reduced pulse, normal perfusion -- 1' },
      { value: '2', text: 'Pulseless, paresthesias, diminished cap refill -- 2' },
      { value: '3', text: 'Cool, paralyzed, insensate, numb -- 3' },
    ]));
    root.appendChild(checkField('Ischemia time > 6 hours (doubles the ischemia subscore)', 'me-6h'));
    root.appendChild(selectField('Shock (systolic BP)', 'me-sh', [
      { value: '0', text: 'SBP always > 90 mmHg -- 0' },
      { value: '1', text: 'Transient hypotension -- 1' },
      { value: '2', text: 'Persistent hypotension -- 2' },
    ]));
    root.appendChild(selectField('Age', 'me-age', [
      { value: '0', text: '< 30 years -- 0' },
      { value: '1', text: '30-50 years -- 1' },
      { value: '2', text: '> 50 years -- 2' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['me-sk', 'me-isc', 'me-6h', 'me-sh', 'me-age'], () => safe(o, () => {
      const r = M.mangledExtremity({
        skeletal: Number(selVal('me-sk')), ischemia: Number(selVal('me-isc')),
        ischemiaOver6h: chk('me-6h'), shock: Number(selVal('me-sh')), age: Number(selVal('me-age')),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MESS', value: String(r.total) },
        { label: 'Ischemia doubled', value: r.doubled ? 'yes (> 6 h)' : 'no' },
      ]);
      derivation(o, 'Components:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 lrinec -----------------------------------------------------
  lrinec(root) {
    note(root, 'Six routine labs distinguish necrotizing fasciitis from other soft-tissue infections. A low score does not rule it out.');
    root.appendChild(field('CRP (mg/L)', 'lr-crp', { step: '0.1', min: 0, placeholder: '180' }));
    root.appendChild(field('White blood cell count (x10^3/uL)', 'lr-wbc', { step: '0.1', min: 0, placeholder: '16' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'lr-hb', { step: '0.1', min: 0, max: 25, placeholder: '12' }));
    root.appendChild(field('Sodium (mmol/L)', 'lr-na', { step: '0.1', min: 0, placeholder: '134' }));
    root.appendChild(field('Creatinine (mg/dL)', 'lr-cr', { step: '0.01', min: 0, placeholder: '1.8' }));
    root.appendChild(field('Glucose (mg/dL)', 'lr-glu', { step: '1', min: 0, placeholder: '200' }));
    const o = out(); root.appendChild(o);
    wire(['lr-crp', 'lr-wbc', 'lr-hb', 'lr-na', 'lr-cr', 'lr-glu'], () => safe(o, () => {
      const r = M.lrinec({
        crp: optNum('lr-crp'), wbc: optNum('lr-wbc'), hemoglobin: optNum('lr-hb'),
        sodium: optNum('lr-na'), creatinine: optNum('lr-cr'), glucose: optNum('lr-glu'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'LRINEC', value: String(r.total) },
        { label: 'Risk band', value: r.riskBand },
      ]);
      derivation(o, 'Scored labs (total 0-13):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 alt-70 -----------------------------------------------------
  'alt-70'(root) {
    note(root, 'Distinguishes lower-extremity cellulitis from its mimics (pseudocellulitis).');
    root.appendChild(checkField('Asymmetry (unilateral leg involvement)', 'al-asym'));
    root.appendChild(field('White blood cell count (x10^3/uL)', 'al-wbc', { step: '0.1', min: 0, placeholder: '11' }));
    root.appendChild(field('Heart rate (bpm)', 'al-hr', { min: 0, max: 300, placeholder: '92' }));
    root.appendChild(field('Age (years)', 'al-age', { min: 0, max: 120, placeholder: '72' }));
    const o = out(); root.appendChild(o);
    wire(['al-asym', 'al-wbc', 'al-hr', 'al-age'], () => safe(o, () => {
      const r = M.alt70({ asymmetry: chk('al-asym'), wbc: optNum('al-wbc'), hr: optNum('al-hr'), age: optNum('al-age') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ALT-70', value: String(r.total) },
        { label: 'Assessment', value: r.riskBand },
      ]);
      derivation(o, 'Scored items (total 0-7):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
