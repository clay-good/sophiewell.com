// spec-v146 §2: renderers for the five spinal tumor / trauma classification tiles
// (sins-score, tokuhashi-revised, tomita-score, tlics-score, slic-score). All
// five are Clinical Scoring & Risk (Group G). v146 continues Wave 8 of the
// spec-v100 program and cross-links the neurosurgery cluster (ich-score, nihss)
// and the v144/v145 ortho cluster.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's
// read of the CT/MRI/radiograph and the neurologic exam and COMPUTES a score; it
// is not a no-input reference table. Per the spec-v50 §3 clinical-posture note,
// each tile renders that it frames a computed value, not an operative/radiation/
// brace order in Sophie's voice (spec-v11 §5.3). A blank required component
// renders a complete-the-fields fallback rather than scoring a partial total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spine-v146.js';
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and band are the cited system’s, computed from the findings you entered — the tile takes your read of the imaging and exam, it does not interpret a CT or MRI. The management decision — operate, radiate, brace, refer — stays with the care team and a multidisciplinary spine/oncology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}

export const renderers = {
  // ----- 2.1 sins-score -------------------------------------------------
  'sins-score'(root) {
    note(root, 'SINS (Fisher 2010): oncologic spinal instability from six radiographic/clinical components, total 0–18. 0–6 stable, 7–12 indeterminate, 13–18 unstable; 7–18 warrants a surgical/spine-oncology consult. Near-neighbors: ich-score, nihss.');
    root.appendChild(pickField('Spinal location', 'sins-loc', [
      { value: 'junctional', text: 'Junctional — occiput–C2, C7–T2, T11–L1, L5–S1 (3)' },
      { value: 'mobile', text: 'Mobile spine — C3–C6, L2–L4 (2)' },
      { value: 'semirigid', text: 'Semirigid — T3–T10 (1)' },
      { value: 'rigid', text: 'Rigid — S2–S5 (0)' },
    ]));
    root.appendChild(pickField('Pain', 'sins-pain', [
      { value: 'mechanical', text: 'Mechanical / with loading (3)' },
      { value: 'occasional', text: 'Occasional, non-mechanical (1)' },
      { value: 'none', text: 'Pain-free (0)' },
    ]));
    root.appendChild(pickField('Bone lesion', 'sins-lesion', [
      { value: 'lytic', text: 'Lytic (2)' },
      { value: 'mixed', text: 'Mixed lytic/blastic (1)' },
      { value: 'blastic', text: 'Blastic (0)' },
    ]));
    root.appendChild(pickField('Radiographic spinal alignment', 'sins-align', [
      { value: 'subluxation', text: 'Subluxation / translation (4)' },
      { value: 'deformity', text: 'De novo deformity — kyphosis / scoliosis (2)' },
      { value: 'normal', text: 'Normal alignment (0)' },
    ]));
    root.appendChild(pickField('Vertebral-body collapse', 'sins-collapse', [
      { value: 'over50', text: 'More than 50% collapse (3)' },
      { value: 'under50', text: 'Less than 50% collapse (2)' },
      { value: 'involved', text: 'No collapse but over 50% of the body involved (1)' },
      { value: 'none', text: 'None of the above (0)' },
    ]));
    root.appendChild(pickField('Posterolateral element involvement', 'sins-post', [
      { value: 'bilateral', text: 'Bilateral (3)' },
      { value: 'unilateral', text: 'Unilateral (1)' },
      { value: 'none', text: 'None (0)' },
    ]));
    const ids = ['sins-loc', 'sins-pain', 'sins-lesion', 'sins-align', 'sins-collapse', 'sins-post'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sinsScore({ location: selVal('sins-loc'), pain: selVal('sins-pain'), lesion: selVal('sins-lesion'), alignment: selVal('sins-align'), collapse: selVal('sins-collapse'), posterolateral: selVal('sins-post') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/18` },
        { label: 'Stability', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 tokuhashi-revised ------------------------------------------
  'tokuhashi-revised'(root) {
    note(root, 'Revised Tokuhashi (Tokuhashi 2005): metastatic-spine prognosis from six parameters, total 0–15. A lower total is the worse prognosis: 0–8 < 6 months, 9–11 ≥ 6 months, 12–15 ≥ 1 year. Compute the Karnofsky status with the performance-status tile if needed.');
    root.appendChild(pickField('General condition (Karnofsky)', 'tok-kps', [
      { value: 'poor', text: 'Poor — KPS 10–40 (0)' },
      { value: 'moderate', text: 'Moderate — KPS 50–70 (1)' },
      { value: 'good', text: 'Good — KPS 80–100 (2)' },
    ]));
    root.appendChild(pickField('Extraspinal bone-metastasis foci', 'tok-bone', [
      { value: 'ge3', text: '3 or more (0)' },
      { value: 'mid', text: '1–2 (1)' },
      { value: 'zero', text: '0 (2)' },
    ]));
    root.appendChild(pickField('Metastases in the vertebral body', 'tok-vb', [
      { value: 'ge3', text: '3 or more (0)' },
      { value: 'two', text: '2 (1)' },
      { value: 'one', text: '1 (2)' },
    ]));
    root.appendChild(pickField('Metastases to major internal organs', 'tok-organ', [
      { value: 'unremovable', text: 'Unremovable (0)' },
      { value: 'removable', text: 'Removable (1)' },
      { value: 'none', text: 'No metastases (2)' },
    ]));
    root.appendChild(pickField('Primary site of cancer', 'tok-primary', [
      { value: 'p0', text: 'Lung / osteosarcoma / stomach / bladder / esophagus / pancreas (0)' },
      { value: 'p1', text: 'Liver / gallbladder / unidentified (1)' },
      { value: 'p2', text: 'Other (2)' },
      { value: 'p3', text: 'Kidney / uterus (3)' },
      { value: 'p4', text: 'Rectum (4)' },
      { value: 'p5', text: 'Thyroid / breast / prostate / carcinoid (5)' },
    ]));
    root.appendChild(pickField('Palsy (Frankel)', 'tok-palsy', [
      { value: 'complete', text: 'Complete — Frankel A, B (0)' },
      { value: 'incomplete', text: 'Incomplete — Frankel C, D (1)' },
      { value: 'none', text: 'None — Frankel E (2)' },
    ]));
    const ids = ['tok-kps', 'tok-bone', 'tok-vb', 'tok-organ', 'tok-primary', 'tok-palsy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tokuhashiRevised({ general: selVal('tok-kps'), extraspinalBone: selVal('tok-bone'), vertebralMets: selVal('tok-vb'), organMets: selVal('tok-organ'), primary: selVal('tok-primary'), palsy: selVal('tok-palsy') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/15` },
        { label: 'Prognosis', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tomita-score -----------------------------------------------
  'tomita-score'(root) {
    note(root, 'Tomita (Tomita 2001): surgical-strategy score for spinal metastases from three factors, total 2–10. 2–3 wide/marginal excision, 4–5 marginal/intralesional, 6–7 palliative surgery, 8–10 supportive/terminal care. Near-neighbor: tokuhashi-revised.');
    root.appendChild(pickField('Primary tumor', 'tom-primary', [
      { value: 'slow', text: 'Slow growth — e.g. breast, thyroid, prostate (1)' },
      { value: 'moderate', text: 'Moderate growth — e.g. kidney, uterus (2)' },
      { value: 'rapid', text: 'Rapid growth or unknown primary — e.g. lung, stomach (4)' },
    ]));
    root.appendChild(pickField('Visceral metastases', 'tom-visceral', [
      { value: 'none', text: 'None (0)' },
      { value: 'treatable', text: 'Treatable (2)' },
      { value: 'untreatable', text: 'Untreatable (4)' },
    ]));
    root.appendChild(pickField('Bone metastases', 'tom-bone', [
      { value: 'solitary', text: 'Solitary / isolated (1)' },
      { value: 'multiple', text: 'Multiple (2)' },
    ]));
    const ids = ['tom-primary', 'tom-visceral', 'tom-bone'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tomitaScore({ primary: selVal('tom-primary'), visceral: selVal('tom-visceral'), bone: selVal('tom-bone') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Strategy', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 tlics-score ------------------------------------------------
  'tlics-score'(root) {
    note(root, 'TLICS (Vaccaro 2005): thoracolumbar (T1–L5) injury triage from morphology + neurology + posterior-ligamentous-complex integrity, total 0–10. ≤ 3 nonoperative, 4 indeterminate, ≥ 5 operative. Incomplete cord (3) scores higher than complete (2) by design. Near-neighbor: slic-score.');
    root.appendChild(pickField('Injury morphology', 'tlics-morph', [
      { value: 'compression', text: 'Compression (1)' },
      { value: 'burst', text: 'Burst (2)' },
      { value: 'translation', text: 'Translational / rotational (3)' },
      { value: 'distraction', text: 'Distraction (4)' },
    ]));
    root.appendChild(pickField('Neurologic status', 'tlics-neuro', [
      { value: 'intact', text: 'Intact (0)' },
      { value: 'root', text: 'Nerve root (2)' },
      { value: 'complete', text: 'Complete cord / conus medullaris (2)' },
      { value: 'incomplete', text: 'Incomplete cord / conus medullaris (3)' },
      { value: 'cauda', text: 'Cauda equina (3)' },
    ]));
    root.appendChild(pickField('Posterior ligamentous complex', 'tlics-plc', [
      { value: 'intact', text: 'Intact (0)' },
      { value: 'indeterminate', text: 'Indeterminate / suspected injury (2)' },
      { value: 'disrupted', text: 'Injured / disrupted (3)' },
    ]));
    const ids = ['tlics-morph', 'tlics-neuro', 'tlics-plc'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tlicsScore({ morphology: selVal('tlics-morph'), neuro: selVal('tlics-neuro'), plc: selVal('tlics-plc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Triage', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 slic-score -------------------------------------------------
  'slic-score'(root) {
    note(root, 'SLIC (Vaccaro 2007): subaxial cervical (C3–C7) injury triage from morphology + disco-ligamentous complex + neurology, total 0–10, plus a +1 modifier for continuous cord compression with deficit. ≤ 3 nonoperative, 4 indeterminate, ≥ 5 operative. Near-neighbor: tlics-score.');
    root.appendChild(pickField('Injury morphology', 'slic-morph', [
      { value: 'none', text: 'No abnormality (0)' },
      { value: 'compression', text: 'Compression (1)' },
      { value: 'burst', text: 'Burst (2)' },
      { value: 'distraction', text: 'Distraction — facet perch / hyperextension (3)' },
      { value: 'rotation', text: 'Rotation / translation — facet dislocation, unstable teardrop (4)' },
    ]));
    root.appendChild(pickField('Disco-ligamentous complex', 'slic-dlc', [
      { value: 'intact', text: 'Intact (0)' },
      { value: 'indeterminate', text: 'Indeterminate (1)' },
      { value: 'disrupted', text: 'Disrupted (2)' },
    ]));
    root.appendChild(pickField('Neurologic status', 'slic-neuro', [
      { value: 'intact', text: 'Intact (0)' },
      { value: 'root', text: 'Root injury (1)' },
      { value: 'complete', text: 'Complete cord injury (2)' },
      { value: 'incomplete', text: 'Incomplete cord injury (3)' },
    ]));
    root.appendChild(checkField('Continuous cord compression with ongoing neurologic deficit (+1)', 'slic-ongoing'));
    const ids = ['slic-morph', 'slic-dlc', 'slic-neuro', 'slic-ongoing'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.slicScore({ morphology: selVal('slic-morph'), dlc: selVal('slic-dlc'), neuro: selVal('slic-neuro'), continuousCompression: chk('slic-ongoing') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Triage', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
