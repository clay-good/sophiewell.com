// spec-v57: renderers for the 14 brief-screener / decision-rule / triage-score
// tiles. One module, same input/render pattern as the rest of the codebase:
// every input has a real <label for> (a11y-check passes), no innerHTML, no
// network, no storage. Nullable numeric outputs route through fmt() (spec-v53
// §3.2). Screeners are decision support, not a diagnosis; each renders a brief
// note to that effect.

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as S from '../lib/scoring-v5.js';
import { META } from '../lib/meta.js';
import { renderDerivation, updateDerivationSteps } from '../lib/derivation.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
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
// 0..max integer select with a short prompt label.
function scaleField(label, id, max) {
  const opts = [];
  for (let i = 0; i <= max; i += 1) opts.push({ value: String(i), text: String(i) });
  return selectField(label, id, opts);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { return Number(document.getElementById(id).value); }
function str(id) { return document.getElementById(id).value; }
function chk(id) { return document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) { return el('ul', {}, items.filter(Boolean)); }
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
function note(root, text) { root.appendChild(el('p', { class: 'muted', text })); }
function screenerNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Screening / decision support, not a diagnosis. Interpret with the full clinical picture and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 phq2-gad2 ---------------------------------------------------
  'phq2-gad2'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Over the last 2 weeks, how often bothered by... (0 not at all, 1 several days, 2 more than half, 3 nearly every day)' }));
    root.appendChild(scaleField('Little interest or pleasure in doing things', 'pg-d1', 3));
    root.appendChild(scaleField('Feeling down, depressed, or hopeless', 'pg-d2', 3));
    root.appendChild(scaleField('Feeling nervous, anxious, or on edge', 'pg-a1', 3));
    root.appendChild(scaleField('Not being able to stop or control worrying', 'pg-a2', 3));
    const o = out(); root.appendChild(o);
    wire(['pg-d1', 'pg-d2', 'pg-a1', 'pg-a2'], () => safe(o, () => {
      const r = S.phq2Gad2({ d1: val('pg-d1'), d2: val('pg-d2'), a1: val('pg-a1'), a2: val('pg-a2') });
      o.appendChild(list([
        li(`PHQ-2 total: ${fmt(r.phq2, { fallback: '--' })} / 6`),
        li(r.phqBand, r.phqPositive ? 'warn' : null),
        li(`GAD-2 total: ${fmt(r.gad2, { fallback: '--' })} / 6`),
        li(r.gadBand, r.gadPositive ? 'warn' : null),
      ]));
    }));
    screenerNote(root);
  },

  // ----- 2.2 audit-full --------------------------------------------------
  'audit-full'(root) {
    const q = [
      'How often do you have a drink containing alcohol?',
      'How many drinks on a typical drinking day?',
      'How often do you have 6 or more drinks on one occasion?',
      'How often unable to stop drinking once started?',
      'How often failed to do what was expected because of drinking?',
      'How often needed a first drink in the morning?',
      'How often had guilt or remorse after drinking?',
      'How often unable to remember the night before?',
    ];
    q.forEach((label, i) => root.appendChild(scaleField(label, `af-${i + 1}`, 4)));
    root.appendChild(selectField('Have you or someone been injured due to your drinking?', 'af-9', [
      { value: '0', text: 'No (0)' }, { value: '2', text: 'Yes, but not in the last year (2)' }, { value: '4', text: 'Yes, during the last year (4)' },
    ]));
    root.appendChild(selectField('Has a relative/friend/doctor been concerned or suggested cutting down?', 'af-10', [
      { value: '0', text: 'No (0)' }, { value: '2', text: 'Yes, but not in the last year (2)' }, { value: '4', text: 'Yes, during the last year (4)' },
    ]));
    const ids = Array.from({ length: 10 }, (_, i) => `af-${i + 1}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.auditFull({ items: ids.map(val) });
      o.appendChild(list([
        li(`AUDIT total: ${fmt(r.total, { fallback: '--' })} / 40`),
        li(r.band, r.total >= 8 ? 'warn' : null),
      ]));
    }));
    note(root, 'Complements the briefer AUDIT-C. Zones: low risk 0-7, hazardous 8-15, harmful 16-19, likely dependence 20+.');
    screenerNote(root);
  },

  // ----- 2.3 dast10 ------------------------------------------------------
  dast10(root) {
    const q = [
      'Have you used drugs other than those required for medical reasons?',
      'Do you abuse more than one drug at a time?',
      'Are you ALWAYS able to stop using drugs when you want to? (reverse-scored)',
      'Have you had blackouts or flashbacks as a result of drug use?',
      'Do you ever feel bad or guilty about your drug use?',
      'Does your spouse or parents ever complain about your drug use?',
      'Have you neglected your family because of drug use?',
      'Have you engaged in illegal activities to obtain drugs?',
      'Have you had withdrawal symptoms when you stopped taking drugs?',
      'Have you had medical problems as a result of your drug use?',
    ];
    q.forEach((label, i) => root.appendChild(checkField(label, `dt-${i + 1}`)));
    const ids = Array.from({ length: 10 }, (_, i) => `dt-${i + 1}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.dast10({ items: ids.map(chk) });
      o.appendChild(list([
        li(`DAST-10 total: ${fmt(r.total, { fallback: '--' })} / 10`),
        li(r.band, r.total >= 3 ? 'warn' : null),
      ]));
    }));
    note(root, 'Item 3 is reverse-scored (a "No" answer scores 1).');
    screenerNote(root);
  },

  // ----- 2.4 gds15 -------------------------------------------------------
  gds15(root) {
    const q = [
      'Are you basically satisfied with your life?',
      'Have you dropped many of your activities and interests?',
      'Do you feel that your life is empty?',
      'Do you often get bored?',
      'Are you in good spirits most of the time?',
      'Are you afraid that something bad is going to happen to you?',
      'Do you feel happy most of the time?',
      'Do you often feel helpless?',
      'Do you prefer to stay at home rather than going out?',
      'Do you feel you have more problems with memory than most?',
      'Do you think it is wonderful to be alive now?',
      'Do you feel pretty worthless the way you are now?',
      'Do you feel full of energy?',
      'Do you feel that your situation is hopeless?',
      'Do you think that most people are better off than you?',
    ];
    root.appendChild(el('p', { class: 'muted', text: 'Check the box for a "Yes" answer to each item.' }));
    q.forEach((label, i) => root.appendChild(checkField(`${i + 1}. ${label}`, `gd-${i + 1}`)));
    const ids = Array.from({ length: 15 }, (_, i) => `gd-${i + 1}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.gds15({ items: ids.map(chk) });
      o.appendChild(list([
        li(`GDS-15 total: ${fmt(r.total, { fallback: '--' })} / 15`),
        li(r.band, r.total >= 5 ? 'warn' : null),
      ]));
    }));
    note(root, 'Age-appropriate alternative to PHQ-9 in older adults (fewer somatic confounders).');
    screenerNote(root);
  },

  // ----- 2.5 ottawa-knee -------------------------------------------------
  'ottawa-knee'(root) {
    root.appendChild(checkField('Age >=55 years', 'ok-age55'));
    root.appendChild(checkField('Isolated tenderness of the patella', 'ok-patellar'));
    root.appendChild(checkField('Tenderness at the head of the fibula', 'ok-fibular'));
    root.appendChild(checkField('Inability to flex the knee to 90 degrees', 'ok-flex'));
    root.appendChild(checkField('Inability to bear weight 4 steps (immediately and in the ED)', 'ok-weight'));
    const o = out(); root.appendChild(o);
    wire(['ok-age55', 'ok-patellar', 'ok-fibular', 'ok-flex', 'ok-weight'], () => safe(o, () => {
      const r = S.ottawaKnee({ age55: chk('ok-age55'), patellarTender: chk('ok-patellar'), fibularHeadTender: chk('ok-fibular'), cannotFlex90: chk('ok-flex'), cannotBearWeight: chk('ok-weight') });
      o.appendChild(list([li(r.band, r.xrayIndicated ? 'warn' : null)]));
    }));
    note(root, 'Companion to the Ottawa Ankle Rule. Highly sensitive for clinically significant knee fracture.');
    screenerNote(root);
  },

  // ----- 2.6 nexus-chest -------------------------------------------------
  'nexus-chest'(root) {
    root.appendChild(checkField('Abnormal chest x-ray', 'nc-cxr'));
    root.appendChild(checkField('Distracting painful injury', 'nc-distract'));
    root.appendChild(checkField('Chest-wall, sternal, or thoracic-spine tenderness', 'nc-tender'));
    root.appendChild(checkField('Age >60 years', 'nc-age60'));
    root.appendChild(checkField('Rapid deceleration mechanism', 'nc-decel'));
    root.appendChild(checkField('Intoxication', 'nc-intox'));
    root.appendChild(checkField('Altered alertness / mental status', 'nc-altered'));
    const o = out(); root.appendChild(o);
    wire(['nc-cxr', 'nc-distract', 'nc-tender', 'nc-age60', 'nc-decel', 'nc-intox', 'nc-altered'], () => safe(o, () => {
      const r = S.nexusChest({ abnormalCxr: chk('nc-cxr'), distractingInjury: chk('nc-distract'), chestWallTender: chk('nc-tender'), age60: chk('nc-age60'), rapidDecel: chk('nc-decel'), intoxication: chk('nc-intox'), alteredAlertness: chk('nc-altered') });
      o.appendChild(list([li(r.band, r.imagingIndicated ? 'warn' : null)]));
    }));
    screenerNote(root);
  },

  // ----- 2.7 sfsr --------------------------------------------------------
  sfsr(root) {
    root.appendChild(el('p', { class: 'muted', text: 'San Francisco Syncope Rule (CHESS):' }));
    root.appendChild(checkField('C - History of congestive heart failure', 'sf-chf'));
    root.appendChild(checkField('H - Hematocrit <30%', 'sf-hct'));
    root.appendChild(checkField('E - Abnormal ECG', 'sf-ecg'));
    root.appendChild(checkField('S - Shortness of breath', 'sf-sob'));
    root.appendChild(checkField('S - Systolic BP <90 mmHg at triage', 'sf-sbp'));
    const o = out(); root.appendChild(o);
    wire(['sf-chf', 'sf-hct', 'sf-ecg', 'sf-sob', 'sf-sbp'], () => safe(o, () => {
      const r = S.sfsr({ chf: chk('sf-chf'), hctLow: chk('sf-hct'), ecgAbnormal: chk('sf-ecg'), sob: chk('sf-sob'), sbpLow: chk('sf-sbp') });
      o.appendChild(list([li(r.band, r.highRisk ? 'warn' : null)]));
    }));
    note(root, 'Sensitivity varies across external validations; apply with clinical judgement.');
    screenerNote(root);
  },

  // ----- 2.8 canadian-syncope --------------------------------------------
  'canadian-syncope'(root) {
    root.appendChild(checkField('Predisposition to vasovagal symptoms (-1)', 'cs-vaso'));
    root.appendChild(checkField('History of heart disease (+1)', 'cs-heart'));
    root.appendChild(checkField('Any SBP reading <90 or >180 mmHg (+2)', 'cs-sbp'));
    root.appendChild(checkField('Troponin >99th percentile (+2)', 'cs-trop'));
    root.appendChild(checkField('Abnormal QRS axis (<-30 or >100 deg) (+1)', 'cs-axis'));
    root.appendChild(checkField('QRS duration >130 ms (+1)', 'cs-qrs'));
    root.appendChild(checkField('QTc >480 ms (+2)', 'cs-qtc'));
    root.appendChild(checkField('ED diagnosis of vasovagal syncope (-2)', 'cs-dxvaso'));
    root.appendChild(checkField('ED diagnosis of cardiac syncope (+2)', 'cs-dxcardiac'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['canadian-syncope']);
    if (deriv) root.appendChild(deriv);
    const ids = ['cs-vaso', 'cs-heart', 'cs-sbp', 'cs-trop', 'cs-axis', 'cs-qrs', 'cs-qtc', 'cs-dxvaso', 'cs-dxcardiac'];
    wire(ids, () => safe(o, () => {
      const inputs = { vasovagalPredisp: chk('cs-vaso'), heartDisease: chk('cs-heart'), sbpExtreme: chk('cs-sbp'), tropElevated: chk('cs-trop'), abnormalAxis: chk('cs-axis'), qrsProlonged: chk('cs-qrs'), qtcProlonged: chk('cs-qtc'), edxVasovagal: chk('cs-dxvaso'), edxCardiac: chk('cs-dxcardiac') };
      const r = S.canadianSyncope(inputs);
      o.appendChild(list([
        li(`Canadian Syncope score: ${fmt(r.score, { fallback: '--' })}`),
        li(r.band, r.score >= 1 ? 'warn' : null),
      ]));
      if (deriv) updateDerivationSteps(deriv, META['canadian-syncope'], inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.9 edacs -------------------------------------------------------
  edacs(root) {
    root.appendChild(field('Age (years)', 'ed-age', { placeholder: 'e.g. 50' }));
    root.appendChild(checkField('Male', 'ed-male'));
    root.appendChild(checkField('Known CAD or >=3 risk factors (age 18-50 only)', 'ed-risk'));
    root.appendChild(checkField('Diaphoresis (+3)', 'ed-diaph'));
    root.appendChild(checkField('Pain radiates to arm/shoulder/neck/jaw (+5)', 'ed-radiate'));
    root.appendChild(checkField('Pain occurred/worsened with inspiration (-4)', 'ed-insp'));
    root.appendChild(checkField('Pain reproduced by palpation (-6)', 'ed-palp'));
    root.appendChild(el('p', { class: 'muted', text: 'ADP gate:' }));
    root.appendChild(checkField('Ischemic ECG changes', 'ed-ecg'));
    root.appendChild(checkField('Troponin positive at 0 h', 'ed-trop0'));
    root.appendChild(checkField('Troponin positive at 2 h', 'ed-trop2'));
    const o = out(); root.appendChild(o);
    wire(['ed-age', 'ed-male', 'ed-risk', 'ed-diaph', 'ed-radiate', 'ed-insp', 'ed-palp', 'ed-ecg', 'ed-trop0', 'ed-trop2'], () => safe(o, () => {
      const r = S.edacs({ age: val('ed-age'), male: chk('ed-male'), riskOrCad: chk('ed-risk'), diaphoresis: chk('ed-diaph'), painRadiates: chk('ed-radiate'), painInspiration: chk('ed-insp'), painPalpation: chk('ed-palp'), ecgIschemic: chk('ed-ecg'), trop0Pos: chk('ed-trop0'), trop2Pos: chk('ed-trop2') });
      o.appendChild(list([
        li(`EDACS score: ${fmt(r.score, { fallback: '(enter age)' })}`),
        li(r.band, r.lowRisk ? null : 'warn'),
      ]));
    }));
    note(root, 'EDACS-ADP low-risk requires score <16 AND non-ischemic ECG AND negative 0/2-h troponins. Complements HEART.');
    screenerNote(root);
  },

  // ----- 2.10 years-pe ---------------------------------------------------
  'years-pe'(root) {
    root.appendChild(checkField('Clinical signs of DVT', 'yp-dvt'));
    root.appendChild(checkField('Hemoptysis', 'yp-hemo'));
    root.appendChild(checkField('PE is the most likely diagnosis', 'yp-likely'));
    root.appendChild(field('D-dimer (ng/mL, FEU)', 'yp-ddimer', { placeholder: 'e.g. 400' }));
    const o = out(); root.appendChild(o);
    wire(['yp-dvt', 'yp-hemo', 'yp-likely', 'yp-ddimer'], () => safe(o, () => {
      const r = S.yearsPe({ dvtSigns: chk('yp-dvt'), hemoptysis: chk('yp-hemo'), peMostLikely: chk('yp-likely'), dDimer: val('yp-ddimer') });
      o.appendChild(list([
        li(`YEARS items: ${fmt(r.itemCount, { fallback: '--' })} / 3; D-dimer threshold: ${fmt(r.threshold, { fallback: '--' })} ng/mL`),
        li(r.band, r.excluded ? null : 'warn'),
      ]));
    }));
    note(root, 'The variable D-dimer threshold (1000 with 0 items, 500 with >=1 item) is the whole point of YEARS.');
    screenerNote(root);
  },

  // ----- 2.11 feverpain --------------------------------------------------
  feverpain(root) {
    root.appendChild(checkField('Fever in the last 24 hours', 'fp-fever'));
    root.appendChild(checkField('Purulence (pus on tonsils)', 'fp-pus'));
    root.appendChild(checkField('Attended rapidly (<=3 days of symptom onset)', 'fp-attend'));
    root.appendChild(checkField('Severely Inflamed tonsils', 'fp-inflamed'));
    root.appendChild(checkField('No cough or coryza', 'fp-nocough'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.feverpain);
    if (deriv) root.appendChild(deriv);
    wire(['fp-fever', 'fp-pus', 'fp-attend', 'fp-inflamed', 'fp-nocough'], () => safe(o, () => {
      const inputs = { fever: chk('fp-fever'), purulence: chk('fp-pus'), attendRapid: chk('fp-attend'), inflamedTonsils: chk('fp-inflamed'), noCough: chk('fp-nocough') };
      const r = S.feverpain(inputs);
      o.appendChild(list([
        li(`FeverPAIN score: ${fmt(r.total, { fallback: '--' })} / 5`),
        li(r.band, r.total >= 4 ? 'warn' : null),
      ]));
      if (deriv) updateDerivationSteps(deriv, META.feverpain, inputs);
    }));
    note(root, 'Complements Centor/McIsaac. NICE NG84 endorses FeverPAIN for antibiotic decisions.');
    screenerNote(root);
  },

  // ----- 2.12 stone-score ------------------------------------------------
  'stone-score'(root) {
    root.appendChild(selectField('Sex', 'st-sex', [{ value: 'female', text: 'Female (0)' }, { value: 'male', text: 'Male (+2)' }]));
    root.appendChild(selectField('Timing (onset to presentation)', 'st-timing', [
      { value: 'gt24', text: '>24 h (0)' }, { value: '6to24', text: '6-24 h (+1)' }, { value: 'lt6', text: '<6 h (+3)' },
    ]));
    root.appendChild(checkField('Origin: non-black race (+3)', 'st-nonblack'));
    root.appendChild(selectField('Nausea / vomiting', 'st-nausea', [
      { value: 'none', text: 'None (0)' }, { value: 'nausea', text: 'Nausea alone (+1)' }, { value: 'vomiting', text: 'Vomiting (+2)' },
    ]));
    root.appendChild(checkField('Erythrocytes: microscopic hematuria present (+3)', 'st-hematuria'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['stone-score']);
    if (deriv) root.appendChild(deriv);
    wire(['st-sex', 'st-timing', 'st-nonblack', 'st-nausea', 'st-hematuria'], () => safe(o, () => {
      const inputs = { sex: str('st-sex'), timing: str('st-timing'), nonBlack: chk('st-nonblack'), nausea: str('st-nausea'), hematuria: chk('st-hematuria') };
      const r = S.stoneScore(inputs);
      o.appendChild(list([
        li(`STONE score: ${fmt(r.score, { fallback: '--' })} / 13`),
        li(r.band, r.score >= 10 ? 'warn' : null),
      ]));
      if (deriv) updateDerivationSteps(deriv, META['stone-score'], inputs);
    }));
    note(root, 'CT-reduction decision support: a high score with no red flags makes an uncomplicated ureteral stone likely.');
    screenerNote(root);
  },

  // ----- 2.13 iss-rts ----------------------------------------------------
  'iss-rts'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Injury Severity Score - three highest AIS region scores (0-6 each):' }));
    root.appendChild(scaleField('Highest AIS region', 'ir-ais1', 6));
    root.appendChild(scaleField('2nd highest AIS region', 'ir-ais2', 6));
    root.appendChild(scaleField('3rd highest AIS region', 'ir-ais3', 6));
    root.appendChild(el('p', { class: 'muted', text: 'Revised Trauma Score physiology:' }));
    root.appendChild(field('GCS (3-15)', 'ir-gcs', { placeholder: 'e.g. 14' }));
    root.appendChild(field('Systolic BP (mmHg)', 'ir-sbp', { placeholder: 'e.g. 120' }));
    root.appendChild(field('Respiratory rate (/min)', 'ir-rr', { placeholder: 'e.g. 18' }));
    const o = out(); root.appendChild(o);
    wire(['ir-ais1', 'ir-ais2', 'ir-ais3', 'ir-gcs', 'ir-sbp', 'ir-rr'], () => safe(o, () => {
      const r = S.issRts({ ais1: val('ir-ais1'), ais2: val('ir-ais2'), ais3: val('ir-ais3'), gcs: val('ir-gcs'), sbp: val('ir-sbp'), rr: val('ir-rr') });
      o.appendChild(list([
        li(`ISS: ${fmt(r.iss, { fallback: '--' })} / 75`),
        li(r.issBand, r.majorTrauma ? 'warn' : null),
        li(`Revised Trauma Score (RTS): ${fmt(r.rts, { fallback: '(enter vitals)' })} / 7.84`),
      ]));
    }));
    note(root, 'ISS: any region AIS=6 forces ISS 75. Companion to the MGAP/GAP/BIG trauma tiles.');
    screenerNote(root);
  },

  // ----- 2.14 sipa -------------------------------------------------------
  sipa(root) {
    root.appendChild(field('Age (years, 4-16 validated)', 'sp-age', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Heart rate (bpm)', 'sp-hr', { placeholder: 'e.g. 140' }));
    root.appendChild(field('Systolic BP (mmHg)', 'sp-sbp', { placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    wire(['sp-age', 'sp-hr', 'sp-sbp'], () => safe(o, () => {
      const r = S.sipa({ ageYears: val('sp-age'), hr: val('sp-hr'), sbp: val('sp-sbp') });
      o.appendChild(list([
        li(`Shock index (HR/SBP): ${fmt(r.shockIndex, { fallback: '(enter HR & SBP)' })}`),
        r.cutoff != null ? li(`Age-adjusted elevated cutoff: ${r.cutoff}`) : null,
        li(r.band, r.elevated ? 'warn' : null),
      ]));
    }));
    note(root, 'Distinct from the adult shock index: the elevated cutoff is age-banded (1.22 / 1.0 / 0.9 for 4-6 / 7-12 / 13-16 yr).');
    screenerNote(root);
  },
};
