// spec-v96 §2: renderers for the six psychiatry rating-scale tiles
// (hamd, hama, madrs, mdq, ybocs, pcl5).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// hamd/hama/madrs/ybocs/pcl5 are summed-item instruments rendered as a vertical
// stack of labeled numeric item inputs; a blank item withholds the severity band
// (spec-v96 §3). mdq is a three-gate boolean screen (13 yes/no symptom items +
// co-occurrence + impairment level). Each tile renders the spec-v50 §3 clinical
// posture note and quotes the cited source's own band / cutoff -- none authors a
// diagnosis or management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/psych-v96.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', 'numeric');
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
function optNum(id) {
  const n = document.getElementById(id);
  return n && n.value !== '' ? Number(n.value) : null;
}
function selVal(id) { return document.getElementById(id).value; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a diagnosis. The score, band, and cutoff are the cited source’s; these instruments measure severity or screen — the diagnosis and any care decision stay with the clinician and a structured interview.' }));
}

// Append N labeled numeric item inputs (each 0..max) under `prefix-1` ... and
// return the wire-up id list. `labels` is a 1:1 array of item descriptors.
function addItems(root, prefix, labels, max) {
  const ids = [];
  labels.forEach((lab, i) => {
    const id = `${prefix}-${i + 1}`;
    root.appendChild(field(`${i + 1}. ${lab} (0–${max})`, id, { min: 0, max, placeholder: '0' }));
    ids.push(id);
  });
  return ids;
}
function readItems(ids) { return ids.map((id) => optNum(id)); }
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const HAMD_LABELS = [
  'Depressed mood', 'Feelings of guilt', 'Suicide', 'Insomnia: early',
  'Insomnia: middle', 'Insomnia: late', 'Work and activities', 'Retardation',
  'Agitation', 'Anxiety (psychic)', 'Anxiety (somatic)', 'Somatic symptoms (GI)',
  'Somatic symptoms (general)', 'Genital symptoms', 'Hypochondriasis',
  'Loss of weight', 'Insight',
];
const HAMD_MAX = [4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 2, 2, 2, 4, 2, 2];
const HAMA_LABELS = [
  'Anxious mood', 'Tension', 'Fears', 'Insomnia', 'Intellectual (cognitive)',
  'Depressed mood', 'Somatic (muscular)', 'Somatic (sensory)',
  'Cardiovascular symptoms', 'Respiratory symptoms', 'Gastrointestinal symptoms',
  'Genitourinary symptoms', 'Autonomic symptoms', 'Behaviour at interview',
];
const MADRS_LABELS = [
  'Apparent sadness', 'Reported sadness', 'Inner tension', 'Reduced sleep',
  'Reduced appetite', 'Concentration difficulties', 'Lassitude',
  'Inability to feel', 'Pessimistic thoughts', 'Suicidal thoughts',
];
const YBOCS_LABELS = [
  'Time occupied by obsessions', 'Interference from obsessions',
  'Distress from obsessions', 'Resistance to obsessions',
  'Control over obsessions', 'Time spent on compulsions',
  'Interference from compulsions', 'Distress from compulsions',
  'Resistance to compulsions', 'Control over compulsions',
];
const PCL5_LABELS = [
  'Repeated disturbing memories', 'Repeated disturbing dreams',
  'Reliving the experience (flashbacks)', 'Upset at reminders',
  'Physical reactions to reminders', 'Avoiding memories/thoughts/feelings',
  'Avoiding external reminders', 'Trouble remembering the event',
  'Negative beliefs about self/others/world', 'Blaming self or others',
  'Strong negative feelings', 'Loss of interest in activities',
  'Feeling distant or cut off', 'Trouble feeling positive emotions',
  'Irritability or angry outbursts', 'Risky or self-destructive behaviour',
  'Being superalert or watchful', 'Feeling jumpy or easily startled',
  'Difficulty concentrating', 'Trouble falling or staying asleep',
];

const MDQ_SYMPTOMS = [
  'Felt so good or hyper others thought you were not normal',
  'So irritable you shouted or started fights',
  'Felt much more self-confident than usual',
  'Got much less sleep than usual and did not miss it',
  'Much more talkative or spoke faster than usual',
  'Thoughts raced or you could not slow your mind',
  'Easily distracted so you had trouble concentrating',
  'Much more energy than usual',
  'Much more active or did many more things than usual',
  'Much more social or outgoing than usual',
  'Much more interested in sex than usual',
  'Did things unusual for you or that others thought excessive/risky',
  'Spending money got you or your family into trouble',
];
const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

export const renderers = {
  // ----- 2.1 hamd --------------------------------------------------------
  'hamd'(root) {
    const ids = [];
    HAMD_LABELS.forEach((lab, i) => {
      const id = `hamd-${i + 1}`;
      root.appendChild(field(`${i + 1}. ${lab} (0–${HAMD_MAX[i]})`, id, { min: 0, max: HAMD_MAX[i], placeholder: '0' }));
      ids.push(id);
    });
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hamd({ items: readItems(ids) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const severe = r.bandLabel === 'moderate' || r.bandLabel === 'severe';
      resultRow(o, [
        { text: r.band, cls: severe ? 'warn' : null },
        { label: 'HAM-D total (0–52)', value: String(r.total) },
        { label: 'Severity band', value: `${r.bandLabel} (${r.range})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 hama --------------------------------------------------------
  'hama'(root) {
    const ids = addItems(root, 'hama', HAMA_LABELS, 4);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hama({ items: readItems(ids) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const severe = r.bandLabel === 'moderate to severe' || r.bandLabel === 'severe';
      resultRow(o, [
        { text: r.band, cls: severe ? 'warn' : null },
        { label: 'HAM-A total (0–56)', value: String(r.total) },
        { label: 'Severity band', value: `${r.bandLabel} (${r.range})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 madrs -------------------------------------------------------
  'madrs'(root) {
    const ids = addItems(root, 'madrs', MADRS_LABELS, 6);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.madrs({ items: readItems(ids) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const severe = r.bandLabel === 'moderate' || r.bandLabel === 'severe';
      resultRow(o, [
        { text: r.band, cls: severe ? 'warn' : null },
        { label: 'MADRS total (0–60)', value: String(r.total) },
        { label: 'Severity band', value: `${r.bandLabel} (${r.range})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mdq ---------------------------------------------------------
  'mdq'(root) {
    const ids = [];
    MDQ_SYMPTOMS.forEach((lab, i) => {
      const id = `mdq-s${i + 1}`;
      root.appendChild(selectField(`${i + 1}. ${lab}`, id, YESNO));
      ids.push(id);
    });
    root.appendChild(selectField('Did several of these happen during the same period?', 'mdq-cooccur', YESNO));
    root.appendChild(selectField('How much of a problem did this cause?', 'mdq-impair', [
      { value: 'none', text: 'No problem' },
      { value: 'minor', text: 'Minor problem' },
      { value: 'moderate', text: 'Moderate problem' },
      { value: 'serious', text: 'Serious problem' },
    ]));
    const o = out(); root.appendChild(o);
    const allIds = [...ids, 'mdq-cooccur', 'mdq-impair'];
    wire(allIds, () => safe(o, () => {
      const r = M.mdq({
        symptoms: ids.map((id) => selVal(id)),
        coOccurrence: selVal('mdq-cooccur'),
        impairment: selVal('mdq-impair'),
      });
      resultRow(o, [
        { text: r.band, cls: r.positive ? 'warn' : null },
        { label: 'Symptoms endorsed', value: `${r.yesCount} of 13` },
        { label: 'Screen', value: r.positive ? 'positive (all 3 gates)' : 'negative' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 ybocs -------------------------------------------------------
  'ybocs'(root) {
    const ids = addItems(root, 'ybocs', YBOCS_LABELS, 4);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ybocs({ items: readItems(ids) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const severe = r.bandLabel === 'moderate' || r.bandLabel === 'severe' || r.bandLabel === 'extreme';
      resultRow(o, [
        { text: r.band, cls: severe ? 'warn' : null },
        { label: 'Y-BOCS total (0–40)', value: String(r.total) },
        { label: 'Obsessions / compulsions', value: `${r.obsession}/20 · ${r.compulsion}/20` },
        { label: 'Severity band', value: `${r.bandLabel} (${r.range})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 pcl5 --------------------------------------------------------
  'pcl5'(root) {
    const ids = addItems(root, 'pcl5', PCL5_LABELS, 4);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.pcl5({ items: readItems(ids) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.atCutoff ? 'warn' : null },
        { label: 'PCL-5 total (0–80)', value: String(r.total) },
        { label: 'Provisional cutoff (≥ 31–33)', value: r.atCutoff ? 'at or above' : 'below' },
        { label: 'Clusters (B/C/D/E ≥ 2)', value: `${r.clusters.B}/${r.clusters.C}/${r.clusters.D}/${r.clusters.E}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
