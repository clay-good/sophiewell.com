// spec-v111 §2: renderers for the four environmental / wilderness-medicine
// severity scores and classifications (lake-louise-ams, szpilman-drowning,
// snakebite-severity, cauchy-frostbite). The closing Wave-2 renderer module of
// the spec-v100 program. All four home in Group I (EMS & Field), cross-linked
// from Clinical Scoring (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 field-posture note, each tile renders that it informs triage and
// transport, not definitive management; none authors a descent, antivenom,
// debridement, or amputation order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/enviro-v111.js';
import { resultRow } from '../lib/result-copy.js';

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
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function selNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
// The spec-v50 §3 field-posture note, rendered under each tile's inputs.
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Field severity grading, not a verdict. The score / grade is the cited instrument’s, computed from the findings you entered; it informs triage and transport. The descent, antivenom, debridement, evacuation, and amputation decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
const SYMPTOM_OPTS = (label0, label3) => [
  { value: '0', text: `0 -- ${label0}` },
  { value: '1', text: '1 -- mild' },
  { value: '2', text: '2 -- moderate' },
  { value: '3', text: `3 -- ${label3}` },
];
const SUB_OPTS = (max) => Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), text: String(i) }));

export const renderers = {
  // ----- 2.1 lake-louise-ams --------------------------------------------
  'lake-louise-ams'(root) {
    note(root, 'The 2018 Lake Louise AMS score: four self-reported symptoms, each 0-3. AMS is diagnosed only when the total is 3 or more AND a headache is present, after a recent altitude gain.');
    root.appendChild(selectField('Headache', 'll-head', SYMPTOM_OPTS('none', 'severe, incapacitating')));
    root.appendChild(selectField('Gastrointestinal symptoms', 'll-gi', [
      { value: '0', text: '0 -- good appetite' }, { value: '1', text: '1 -- poor appetite or nausea' },
      { value: '2', text: '2 -- moderate nausea or vomiting' }, { value: '3', text: '3 -- severe nausea/vomiting' },
    ]));
    root.appendChild(selectField('Fatigue / weakness', 'll-fat', SYMPTOM_OPTS('none', 'severe, incapacitating')));
    root.appendChild(selectField('Dizziness / lightheadedness', 'll-diz', SYMPTOM_OPTS('none', 'severe, incapacitating')));
    const o = out(); root.appendChild(o);
    wire(['ll-head', 'll-gi', 'll-fat', 'll-diz'], () => safe(o, () => {
      const r = M.lakeLouiseAms({ headache: selNum('ll-head'), gi: selNum('ll-gi'), fatigue: selNum('ll-fat'), dizziness: selNum('ll-diz') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/12` },
        { label: 'AMS', value: r.amsPresent ? `present (${r.severity})` : 'not diagnosed' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 szpilman-drowning ------------------------------------------
  'szpilman-drowning'(root) {
    note(root, 'Szpilman drowning classification: a bedside decision tree on cough, auscultation, pulmonary edema, hypotension, and arrest, returning a single grade with the original-series mortality.');
    root.appendChild(selectField('Cardiopulmonary status', 'sz-status', [
      { value: 'breathing', text: 'Breathing, has a pulse' },
      { value: 'respiratory-arrest', text: 'Isolated respiratory arrest (pulse present)' },
      { value: 'cardiac-arrest', text: 'Cardiopulmonary arrest' },
      { value: 'dead', text: 'Deceased (submersion > 1 h or postmortem signs)' },
    ]));
    root.appendChild(selectField('Lung auscultation (if breathing)', 'sz-ausc', [
      { value: 'normal', text: 'Normal auscultation' },
      { value: 'rales-some', text: 'Rales in some lung fields' },
      { value: 'pulmonary-edema', text: 'Acute pulmonary edema (rales in all fields)' },
    ]));
    root.appendChild(checkField('Cough present (if auscultation normal)', 'sz-cough'));
    root.appendChild(checkField('Arterial hypotension (if pulmonary edema)', 'sz-hypo'));
    const o = out(); root.appendChild(o);
    wire(['sz-status', 'sz-ausc', 'sz-cough', 'sz-hypo'], () => safe(o, () => {
      const r = M.szpilmanDrowning({ status: selVal('sz-status'), auscultation: selVal('sz-ausc'), cough: chk('sz-cough'), hypotension: chk('sz-hypo') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.label },
        { label: 'Mortality', value: r.mortality },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 snakebite-severity -----------------------------------------
  'snakebite-severity'(root) {
    note(root, 'Snakebite Severity Score: six body-system subscores summed (total 0-20). A continuous severity index -- Dart 1996 defines no fixed minimal/moderate/severe cutoff; higher is more severe.');
    root.appendChild(selectField('Pulmonary system (0-3)', 'ss-pul', SUB_OPTS(3)));
    root.appendChild(selectField('Cardiovascular system (0-3)', 'ss-cv', SUB_OPTS(3)));
    root.appendChild(selectField('Local wound (0-4)', 'ss-loc', SUB_OPTS(4)));
    root.appendChild(selectField('Gastrointestinal system (0-3)', 'ss-gi', SUB_OPTS(3)));
    root.appendChild(selectField('Hematologic system (0-4)', 'ss-hem', SUB_OPTS(4)));
    root.appendChild(selectField('Central nervous system (0-3)', 'ss-cns', SUB_OPTS(3)));
    const o = out(); root.appendChild(o);
    wire(['ss-pul', 'ss-cv', 'ss-loc', 'ss-gi', 'ss-hem', 'ss-cns'], () => safe(o, () => {
      const r = M.snakebiteSeverity({
        pulmonary: selNum('ss-pul'), cardiovascular: selNum('ss-cv'), local: selNum('ss-loc'),
        gi: selNum('ss-gi'), hematologic: selNum('ss-hem'), cns: selNum('ss-cns'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/20` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 cauchy-frostbite -------------------------------------------
  'cauchy-frostbite'(root) {
    note(root, 'Cauchy frostbite classification: the day-0 lesion topography, day-2 bone-scan uptake, and day-2 blisters set a grade (1-4). The grade is the most severe of the three findings.');
    root.appendChild(selectField('Day-0 lesion topography', 'cf-topo', [
      { value: 'none', text: 'No lesion / no cyanosis' },
      { value: 'distal-phalanx', text: 'Distal phalanx' },
      { value: 'intermediate-proximal', text: 'Intermediate / proximal phalanx' },
      { value: 'carpal-tarsal', text: 'Carpal / tarsal (whole hand or foot)' },
    ]));
    root.appendChild(selectField('Day-2 bone scan', 'cf-bone', [
      { value: 'not-done', text: 'Not done / normal uptake' },
      { value: 'hypofixation', text: 'Hypofixation of radiotracer (digit)' },
      { value: 'absent-digit', text: 'Absent uptake in the digit' },
      { value: 'absent-carpal-tarsal', text: 'Absent uptake in the carpal / tarsal area' },
    ]));
    root.appendChild(selectField('Day-2 blisters', 'cf-blist', [
      { value: 'none', text: 'None' },
      { value: 'clear', text: 'Clear / serous blisters' },
      { value: 'hemorrhagic-digit', text: 'Hemorrhagic blisters on the digit' },
      { value: 'hemorrhagic-carpal-tarsal', text: 'Hemorrhagic blisters over the carpus / tarsus' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['cf-topo', 'cf-bone', 'cf-blist'], () => safe(o, () => {
      const r = M.cauchyFrostbite({ topography: selVal('cf-topo'), boneScan: selVal('cf-bone'), blisters: selVal('cf-blist') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: String(r.grade) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
