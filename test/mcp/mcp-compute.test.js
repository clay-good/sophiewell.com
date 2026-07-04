// spec-v183 §4: worked compute calls (>=3 per first-wave module) plus the
// full-set example round-trip. The round-trip mirrors the e2e
// example-correctness numeric contract on the JSON tool surface.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { META } from '../../lib/meta.js';
import { computeCalculator, listCalculators } from '../../mcp/tools.js';

function ok(id, inputs) {
  const r = computeCalculator({ id, inputs });
  assert.equal(r.valid, true, `${id} should compute: ${r.message || ''}`);
  return r.result;
}

test('lib/tox-v86.js worked calls', () => {
  assert.equal(ok('serotonin-toxicity', { 'st-agent': '1', 'st-spont-clonus': '1' }).meets, true);
  assert.equal(ok('salicylate-toxicity', { 'sal-level': '110', 'sal-unit': 'mgdl', 'sal-type': 'acute' }).levelMgDl, 110);
  const ta = ok('toxic-alcohol', { 'ta-osm': '305', 'ta-na': '140', 'ta-glu': '90', 'ta-bun': '14', 'ta-recent': '1' });
  assert.equal(ta.calcOsm, 290);
  assert.equal(ta.osmolarGap, 15);
});

test('lib/hep-v124.js worked calls', () => {
  assert.equal(ok('albi-grade', { 'al-alb': '3.5', 'al-bili': '1.0' }).grade, 2);
  assert.equal(ok('meld-xi', { 'mx-bili': '2.0', 'mx-creat': '1.5' }).score, 18);
  assert.equal(ok('bard-score', { 'bd-bmi': '30', 'bd-ast': '45', 'bd-alt': '40', 'bd-dm': true }).total, 4);
});

test('lib/acidbase-v129.js worked calls', () => {
  assert.equal(ok('base-excess', { 'be-ph': '7.2', 'be-hco3': '15', 'be-hb': '15' }).be, -13);
  assert.equal(ok('stewart-sid-sig', { 'ss-na': '140', 'ss-k': '4', 'ss-ca': '2.4', 'ss-mg': '1.0', 'ss-cl': '100', 'ss-lac': '2', 'ss-hco3': '14', 'ss-alb': '4.0', 'ss-phos': '4' }).sig, 17.8);
  assert.equal(ok('resp-acidosis-compensation', { 'ra-paco2': '60', 'ra-hco3': '26', 'ra-ch': 'acute' }).expected, 26);
});

test('lib/cardio-v90.js worked calls', () => {
  assert.equal(ok('cardiac-power-output', { 'cp-map': '80', 'cp-co': '5' }).cpo, 0.89);
  assert.equal(ok('ecg-axis', { 'ea-i': '8', 'ea-avf': '6' }).axis, 36.9);
  const ava = ok('aortic-valve-area', { 'av-d': '2.0', 'av-lvti': '20', 'av-avti': '100' });
  assert.equal(ava.ava, 0.63);
  assert.equal(ava.severity, 'severe');
});

test('lib/pulm-v91.js worked calls (wave 2)', () => {
  assert.equal(ok('gold-spirometry', { 'gs-pct': '45', 'gs-ratio': '0.6' }).grade, 3);
  assert.equal(ok('bode-index', { 'bo-bmi': '24', 'bo-pct': '45', 'bo-mmrc': '2', 'bo-6mwd': '300' }).total, 4);
  assert.equal(ok('gap-ipf', { 'gp-sex': 'male', 'gp-age': '68', 'gp-fvc': '60', 'gp-dlco': '40' }).stage, 'II');
  assert.equal(ok('mmrc-dyspnea', { 'md-grade': '2' }).grade, 2);
});

test('lib/neuro-v118.js worked calls (wave 2)', () => {
  assert.equal(ok('modified-fisher', { 'mf-sah': 'thick', 'mf-ivh': true }).grade, 4);
  assert.equal(ok('bat-score', { 'bt-blend': true, 'bt-hypo': true, 'bt-timing': true }).total, 5);
  const graeb = ok('graeb-ivh', {
    'gr-rl': '4', 'gr-rl-exp': true, 'gr-ll': '4', 'gr-ll-exp': true, 'gr-3': '4', 'gr-3-exp': true,
    'gr-4': '4', 'gr-4-exp': true, 'gr-ro': '2', 'gr-ro-exp': true, 'gr-lo': '2', 'gr-lo-exp': true,
    'gr-rt': '2', 'gr-rt-exp': true, 'gr-lt': '2', 'gr-lt-exp': true,
  });
  assert.equal(graeb.total, 32);
});

test('lib/endo-v136.js worked calls (wave 2)', () => {
  assert.equal(ok('homa-ir', { 'hir-insulin': '12', 'hir-glucose': '100', 'hir-unit': 'mgdl' }).value, 2.96);
  assert.equal(ok('quicki', { 'qui-insulin': '12', 'qui-glucose': '100' }).value, 0.3248);
  assert.equal(ok('osteoporosis-prescreen', { 'ost-age': '60', 'ost-weight': '72', 'ost-estrogen': 'no' }).ost, 2);
});

test('lib/periop-v97.js worked calls (wave 2)', () => {
  assert.equal(ok('gupta-mica', { 'mica-age': '65', 'mica-asa': '3', 'mica-func': 'partial', 'mica-creat': 'normal', 'mica-surg': 'intestinal' }).risk, 1.66);
  assert.equal(ok('arozullah-pneumonia', { 'aroz-surg': 'thoracic', 'aroz-age': '60-69', 'aroz-func': 'independent', 'aroz-bun': '8-21', 'aroz-copd': true }).total, 28);
  assert.equal(ok('el-ganzouri', { 'eg-mouth': 'lt-4', 'eg-thyro': '6-6.5', 'eg-mall': '3', 'eg-neck': '80-90', 'eg-prog': 'yes', 'eg-weight': 'under-90', 'eg-history': 'none' }).total, 4);
});

test('lib/cardio-v101.js worked calls (wave 4)', () => {
  assert.equal(ok('chads2', { 'chads2-chf': true, 'chads2-stroke': true }).total, 3);
  assert.equal(ok('cha2ds2-va', { 'va-age': '78', 'va-htn': '1', 'va-vasc': '1' }).total, 4);
  assert.equal(ok('chads-65', { 'c65-age': '58', 'c65-dm': '1' }).verdict, 'oac');
  assert.equal(ok('atria-stroke', { 'atria-age': '80', 'atria-female': '1' }).total, 6);
  assert.equal(ok('tisdale-qtc', { 'tis-k': '1', 'tis-qtc': '1', 'tis-drugs': 'two-plus' }).total, 10);
});

test('lib/heme-v132.js worked calls (wave 4)', () => {
  assert.equal(ok('plasmic-ttp', { 'pl-plt': '18', 'pl-hem': 'yes', 'pl-ca': 'no', 'pl-tx': 'no', 'pl-mcv': '85', 'pl-inr': '1.2', 'pl-cr': '2.4' }).total, 6);
  assert.equal(ok('french-ttp', { 'ft-plt': '22', 'ft-cr': '1.1', 'ft-ana': 'no' }).total, 2);
  assert.equal(ok('jaam-dic', { 'jd-sirs': 'yes', 'jd-plt': '90', 'jd-fdp': '12', 'jd-pt': '1.3' }).total, 4);
  assert.equal(ok('ipset-thrombosis', { 'ip-age': 'yes', 'ip-thr': 'no', 'ip-jak2': 'yes' }).category, 'High');
  assert.equal(ok('cisne', { 'ci-ecog': '2', 'ci-glu': 'no', 'ci-copd': 'yes', 'ci-cv': 'no', 'ci-muc': '0', 'ci-mono': '300' }).total, 3);
});

test('lib/gi-v126.js worked calls (wave 4)', () => {
  assert.equal(ok('cdai-crohns', { 'cd-stools': '20', 'cd-pain': '14', 'cd-well': '7', 'cd-comp': '1', 'cd-anti': true, 'cd-mass': '2', 'cd-hct': '40', 'cd-wt': '60', 'cd-std': '70' }).total, 285);
  assert.equal(ok('uceis', { 'uc-vasc': '2', 'uc-bleed': '3', 'uc-ero': '2' }).total, 7);
  assert.equal(ok('haps', { 'ha-hct': '40', 'ha-creat': '1.0' }).harmless, true);
  assert.equal(ok('ctsi-balthazar', { 'ct-grade': '4', 'ct-necr': '6' }).total, 10);
  assert.equal(ok('modified-marshall', { 'mm-pao2': '200', 'mm-fio2': '100', 'mm-creat': '2.0' }).organFailure, true);
});

test('lib/cardio-v102.js worked calls (wave 5)', () => {
  assert.equal(ok('maggic', { 'mg-age': '70', 'mg-male': '1', 'mg-ef': '30', 'mg-nyha': '3', 'mg-sbp': '120', 'mg-bmi': '24', 'mg-creat': '1.2', 'mg-dm': '1', 'mg-hfdur': '1', 'mg-bb': '1', 'mg-ace': '1' }).total, 28);
  assert.equal(ok('h2fpef', { 'h2-af': '1', 'h2-bmi': '1' }).total, 5);
  assert.equal(ok('hfa-peff', { 'hp-functional': 'major', 'hp-morphological': 'major', 'hp-biomarker': 'minor' }).total, 5);
  assert.equal(ok('cardshock-score', { 'cs-age': '1', 'cs-confusion': '1', 'cs-mi': '1', 'cs-acs': '1', 'cs-ef': '1', 'cs-lactate': '5', 'cs-egfr': '25' }).total, 9);
});

test('lib/cardio-v104.js worked calls (wave 5)', () => {
  assert.equal(ok('brugada-vt', { 'br-rs': '1' }).verdict, 'VT');
  assert.equal(ok('add-rs', { 'add-pre': '1', 'add-pain': '1' }).total, 2);
  assert.equal(ok('egsys', { 'eg-palp': '1', 'eg-auto': '1' }).total, 3);
  assert.equal(ok('oesil', { 'oe-age': '1', 'oe-cv': '1' }).total, 2);
});

test('lib/cvrisk-v103.js worked calls (wave 5)', () => {
  assert.equal(ok('score2', { 's2-age': '50', 's2-sex': '1', 's2-smoke': '1', 's2-sbp': '140', 's2-tc': '5.5', 's2-hdl': '1.3', 's2-region': 'very-high' }).category, 'very-high');
  assert.equal(ok('score2-op', { 'op-age': '75', 'op-sex': '0', 'op-sbp': '150', 'op-tc': '5.5', 'op-hdl': '1.4', 'op-region': 'high' }).risk, 21.6);
  const mesa = ok('mesa-chd', { 'mesa-age': '60', 'mesa-sex': '1', 'mesa-race': 'white', 'mesa-tc': '200', 'mesa-hdl': '50', 'mesa-sbp': '125', 'mesa-cac': '100' });
  assert.equal(mesa.riskWithCac, 7.34);
  assert.equal(mesa.riskNoCac, 4.86);
});

test('lib/critcare-v112.js worked calls (wave 5)', () => {
  assert.equal(ok('sic-score', { 'si-plt': '80', 'si-inr': '1.6', 'si-sofa': '0' }).met, true);
  assert.equal(ok('cpis-vap', { 'cp-temp': '39', 'cp-wbc': '12000', 'cp-sec': 'purulent', 'cp-oxy': 'low', 'cp-cxr': 'diffuse', 'cp-cult': 'none' }).total, 8);
  assert.equal(ok('mrc-sum-score', { 'mr-shl': '4', 'mr-shr': '4', 'mr-ell': '4', 'mr-elr': '4', 'mr-wrl': '4', 'mr-wrr': '4', 'mr-hil': '4', 'mr-hir': '4', 'mr-knl': '4', 'mr-knr': '4', 'mr-anl': '4', 'mr-anr': '4' }).total, 48);
});

test('lib/fluidresp-v113.js worked calls (wave 5)', () => {
  assert.equal(ok('ivc-fluid-responsiveness', { 'iv-mode': 'mechanical', 'iv-dmax': '2.0', 'iv-dmin': '1.6' }).index, 25);
  assert.equal(ok('ppv-svv', { 'pv-mode': 'ppv', 'pv-max': '50', 'pv-min': '40' }).responsive, true);
  assert.equal(ok('passive-leg-raise', { 'plr-base': '60', 'plr-peak': '72' }).valid, true);
});

test('lib/hepgi-v93.js worked calls (wave 5)', () => {
  assert.equal(ok('glasgow-imrie', { 'gi-pao2': '55', 'gi-age': '60', 'gi-wbc': '12', 'gi-ca': '2.2', 'gi-urea': '20', 'gi-ldh': '500', 'gi-alb': '35', 'gi-glu': '12' }).total, 4);
  assert.equal(ok('harvey-bradshaw', { 'hb-wb': '2', 'hb-pain': '2', 'hb-stools': '4', 'hb-mass': '1', 'hb-cx': '1' }).total, 10);
  assert.equal(ok('milan-criteria', { 'mc-n': '1', 'mc-size': '4.5' }).within, true);
});

test('lib/hemonc-v94.js worked calls (wave 5)', () => {
  assert.equal(ok('mascc', { 'ma-burden': 'no-mild', 'ma-hypo': 'yes', 'ma-copd': 'yes', 'ma-tumor': 'yes', 'ma-dehyd': 'yes', 'ma-outpt': 'yes', 'ma-age': 'yes' }).total, 26);
  assert.equal(ok('flipi', { 'fl-age': 'yes', 'fl-stage': 'yes', 'fl-ldh': 'yes', 'fl-hgb': 'no', 'fl-nodal': 'no', 'fl-ecog': 'no', 'fl-extra': 'no' }).valid, true);
  assert.equal(ok('sokal-cml', { 'sk-age': '50', 'sk-spleen': '5', 'sk-plt': '300', 'sk-blasts': '2' }).valid, true);
});

test('lib/neuro-v119.js worked calls (wave 6)', () => {
  assert.equal(ok('cpsss', { 'cp-gaze': true, 'cp-arm': true }).total, 3);
  assert.equal(ok('fast-ed', { 'fe-facial': '1', 'fe-arm': '2', 'fe-speech': '2', 'fe-eye': '0', 'fe-neglect': '0' }).total, 5);
  assert.equal(ok('boston-caa', { 'bc-age': true, 'bc-pres': true, 'bc-lobar': '2' }).category, 'Probable CAA');
  assert.equal(ok('cvt-risk', { 'cv-malig': true, 'cv-coma': true }).total, 4);
});

test('lib/neuro-v120.js worked calls (wave 6)', () => {
  assert.equal(ok('stess', { 'st-con': '1', 'st-sz': '2' }).total, 3);
  assert.equal(ok('helps2b', { 'h2-birds': true, 'h2-sporadic': true }).risk, '50%');
  assert.equal(ok('mess-first-seizure', { 'me-sz': '2' }).group, 'High');
  assert.equal(ok('pound-migraine', { 'po-puls': true, 'po-hours': true, 'po-uni': true, 'po-nausea': true }).total, 4);
  assert.equal(ok('hints', { 'hi-impulse': 'normal' }).category, 'Central (stroke) pattern');
});

test('lib/neuro-v121.js worked calls (wave 6)', () => {
  assert.equal(ok('egris', { 'eg-days': '2', 'eg-fb': true, 'eg-mrc': '3' }).total, 6);
  assert.equal(ok('megos', { 'mg-age': '2', 'mg-diar': true, 'mg-time': 'day7', 'mg-mrc': '3' }).total, 12);
  assert.equal(ok('brighton-gbs', { 'br-weak': true, 'br-aref': true, 'br-mono': true, 'br-noalt': true, 'br-csf': 'dissociation', 'br-ncs': true }).level, 1);
  const mg = ok('mgfa', { 'mf-sev': 'severe', 'mf-sub': 'b', 'mf-talk': '1', 'mf-breath': '2', 'mf-swal': '2' });
  assert.equal(mg.cls, 'IVb');
  assert.equal(mg.adlTotal, 5);
});

test('lib/neuro-v122.js worked calls (wave 6)', () => {
  assert.equal(ok('hachinski', { 'ha-abrupt': true, 'ha-fluct': true, 'ha-stroke': true, 'ha-fsym': true }).total, 8);
  assert.equal(ok('modified-ashworth', { 'ma-grade': '1plus' }).grade, '1+');
  assert.equal(ok('bickerstaff', { 'bi-oph': true, 'bi-atax': true, 'bi-cons': true, 'bi-gq1b': true }).consistent, true);
});

test('lib/nephro-v127.js worked calls (wave 6)', () => {
  const k = ok('kfre', { 'kf-mode': '4', 'kf-age': '60', 'kf-male': true, 'kf-egfr': '30', 'kf-acr': '300' });
  assert.ok(Math.abs(k.risk2 - 0.0332) < 0.001);
  assert.ok(Math.abs(k.risk5 - 0.1001) < 0.001);
  assert.equal(ok('rifle-aki', { 'ri-base': '1.0', 'ri-curr': '2.2' }).className, 'Injury');
  assert.equal(ok('akin-aki', { 'ak-base': '1.0', 'ak-curr': '3.5' }).stage, 3);
  assert.equal(ok('ufr-dialysis', { 'uf-vol': '3.5', 'uf-hr': '3', 'uf-wt': '70' }).ufr, 16.67);
});

test('lib/renal-v128.js worked calls (wave 6)', () => {
  assert.equal(ok('fepo4', { 'fp-up': '30', 'fp-pp': '1.5', 'fp-uc': '60', 'fp-pc': '1.0' }).fe, 33.3);
  assert.equal(ok('femg', { 'fm-um': '2.0', 'fm-pm': '1.2', 'fm-uc': '50', 'fm-pc': '1.0' }).fe, 4.8);
  assert.equal(ok('npcr-pna', { 'np-post': '24', 'np-pre': '70', 'np-hr': '44' }).npcr, 1.12);
  assert.equal(ok('std-ktv', { 'sk-sp': '1.4', 'sk-min': '240', 'sk-n': '3' }).std, 2.18);
  assert.equal(ok('efwc', { 'ef-vol': '2.0', 'ef-una': '20', 'ef-uk': '15', 'ef-pna': '140' }).efwc, 1.5);
});

test('lib/uro-v130.js worked calls (wave 6)', () => {
  assert.equal(ok('prostate-volume', { 'pvol-ap': '4', 'pvol-tr': '5', 'pvol-cc': '4' }).volume, 41.6);
  assert.equal(ok('psa-density', { 'psad-psa': '6', 'psad-vol': '30' }).density, 0.2);
  assert.equal(ok('psa-velocity', { 'psav-psa1': '3', 'psav-psa2': '4.5', 'psav-mo': '12' }).velocity, 1.5);
  assert.equal(ok('psa-doubling-time', { 'psadt-psa1': '4', 'psadt-psa2': '8', 'psadt-mo': '6' }).dt, 6);
  assert.equal(ok('damico-prostate-risk', { 'dam-psa': '6', 'dam-gl': '7', 'dam-stage': 'T1c' }).risk, 'Intermediate');
  assert.equal(ok('gleason-grade-group', { 'gl-pri': '3', 'gl-sec': '4' }).group, 2);
});

test('lib/uro-v131.js worked calls (wave 6)', () => {
  assert.equal(ok('capra-score', { 'capra-age': '60', 'capra-psa': '7', 'capra-gp': '3', 'capra-gs': '4', 'capra-stage': 'T1-T2', 'capra-cores': '20' }).total, 3);
  // R.E.N.A.L. hilar is the '' / 'h' enum: a blank suffix leaves the score unflagged.
  const ren = ok('renal-nephrometry', { 'ren-radius': '2', 'ren-exo': '2', 'ren-near': '2', 'ren-loc': '1', 'ren-ap': 'p', 'ren-hilar': '' });
  assert.equal(ren.total, 7);
  assert.equal(ren.suffix, 'p');
  assert.equal(ok('padua-renal', { 'pad-long': '2', 'pad-exo': '2', 'pad-rim': '1', 'pad-sinus': '1', 'pad-ucs': '1', 'pad-size': '1', 'pad-face': 'a' }).total, 8);
  assert.equal(ok('stone-nephrolithometry', { 'stn-len': '20', 'stn-wid': '20', 'stn-tract': '80', 'stn-obstr': '1', 'stn-cal': '1', 'stn-hu': '800' }).area, 400);
  // TWIST yes/no findings are booleans the lib present() coerces ('1' -> true, '0' -> false).
  assert.equal(ok('twist-score', { 'tw-swell': '1', 'tw-hard': '0', 'tw-crem': '1', 'tw-nv': '1', 'tw-high': '1' }).total, 5);
});

test('lib/hemodynamics-v87.js worked calls (wave 7)', () => {
  const hs = ok('hemodynamic-suite', { 'hs-co': '5', 'hs-hr': '80', 'hs-bsa': '2', 'hs-map': '90', 'hs-cvp': '5', 'hs-mpap': '20', 'hs-pcwp': '10' });
  assert.equal(hs.ci, 2.5);
  assert.equal(hs.sv, 62.5);
  const mp = ok('mechanical-power', { 'mp-rr': '22', 'mp-vt': '420', 'mp-plat': '26', 'mp-peep': '12', 'mp-peak': '32' });
  assert.equal(mp.mechanicalPower, 22.6);
  assert.equal(mp.drivingPressure, 14);
  // The adapter formatResult surfaces the ASCII driving-pressure unit.
  assert.equal(mp.drivingPressureUnit, 'cmH2O');
  assert.equal(ok('dead-space', { 'ds-paco2': '60', 'ds-source': 'peco2', 'ds-eco2': '20' }).ratioPercent, 67);
});

test('lib/nephro-v92.js worked calls (wave 7)', () => {
  const cs = ok('ckd-staging', { 'cs-egfr': '38', 'cs-uacr': '340' });
  assert.equal(cs.gStage, 'G3b');
  assert.equal(cs.aStage, 'A3');
  assert.equal(ok('uacr-upcr', { 'uu-alb': '30', 'uu-cr': '100' }).uacr, 300);
  const kt = ok('ktv-urr', { 'kt-pre': '60', 'kt-post': '18', 'kt-uf': '3', 'kt-time': '4', 'kt-wt': '70' });
  assert.equal(kt.urr, 70);
  assert.equal(kt.ktv, 1.44);
  // The yes/no risk factors map to enums the lib onFlag() helper coerces.
  assert.equal(ok('mehran-cin', { 'me-chf': 'yes', 'me-dm': 'yes', 'me-contrast': '300', 'me-egfr': '30' }).total, 15);
  assert.equal(ok('ckd-epi-cystatin', { 'cc-cys': '1.5', 'cc-cr': '1.1', 'cc-age': '70', 'cc-sex': 'female' }).egfrCys, 40.6);
});

test('lib/ebm-v163.js worked calls (wave 7)', () => {
  assert.equal(ok('fagan-post-test', { 'fagan-mode': 'lr', 'fagan-pretest': '20', 'fagan-lr': '10' }).posttest, 71.4);
  const dx = ok('diagnostic-2x2', { 'dx-tp': '90', 'dx-fp': '10', 'dx-fn': '10', 'dx-tn': '90', 'dx-prev': '5' });
  assert.equal(dx.sens, 90);
  assert.equal(dx.lrPos, 9);
  const nnt = ok('nnt-arr', { 'nnt-cer': '20', 'nnt-eer': '15' });
  assert.equal(nnt.arr, 5);
  assert.equal(nnt.nnt, 20);
});

test('lib/ophtho-v164.js worked calls (wave 7)', () => {
  assert.equal(ok('iol-power', { 'iol-a': '118.4', 'iol-al': '23.5', 'iol-k': '44', 'iol-target': '0' }).power, 20.05);
  const va = ok('visual-acuity-converter', { 'va-mode': 'snellen20', 'va-value': '40' });
  assert.equal(va.decimal, 0.5);
  assert.equal(va.logmar, 0.3);
  assert.equal(ok('ocular-perfusion-pressure', { 'opp-sbp': '120', 'opp-dbp': '80', 'opp-iop': '15' }).meanOpp, 47.2);
});

test('lib/echo-v158.js worked calls (wave 7)', () => {
  assert.equal(ok('lv-mass-index', { 'lvmi-lvidd': '5.2', 'lvmi-pwtd': '1.2', 'lvmi-ivsd': '1.2', 'lvmi-bsa': '2.0', 'lvmi-sex': 'male' }).lvmi, 124.4);
  assert.equal(ok('la-volume-index', { 'lavi-a1': '21', 'lavi-a2': '21', 'lavi-l': '5.0', 'lavi-bsa': '2.0' }).lavi, 37.5);
  const t = ok('teichholz-lvef', { 'teich-lvidd': '5.0', 'teich-lvids': '3.5', 'teich-sex': 'male' });
  assert.equal(t.ef, 57);
  assert.equal(t.fs, 30);
  assert.equal(ok('rvsp-pasp', { 'rvsp-vmax': '2.8', 'rvsp-rap': '8' }).rvsp, 39.4);
  assert.equal(ok('mitral-e-e-prime', { 'ee-e': '90', 'ee-eprime': '6', 'ee-site': 'average' }).ratio, 15);
});

test('lib/rheum-v147.js worked calls (wave 7)', () => {
  assert.equal(ok('cdai-ra', { 'cdai-sjc': '6', 'cdai-tjc': '8', 'cdai-pga': '3', 'cdai-ega': '2' }).score, 19);
  assert.equal(ok('sdai-ra', { 'sdai-sjc': '6', 'sdai-tjc': '8', 'sdai-pga': '3', 'sdai-ega': '2', 'sdai-crp': '1.5' }).score, 20.5);
  assert.equal(ok('acr-eular-2010-ra', { 'acr-entry': '1', 'acr-joints': 'over10', 'acr-serology': 'negative', 'acr-acute': 'normal', 'acr-duration': 'over6' }).score, 6);
  // SLEDAI-2K: arthritis (4) + low complement (2) + increased DNA binding (2) = 8.
  assert.equal(ok('sledai-2k', { 'sle-arthritis': '1', 'sle-complement': '1', 'sle-dna': '1' }).score, 8);
  assert.equal(ok('gout-acr-eular-2015', { 'gout-entry': '1', 'gout-pattern': 'mtp1', 'gout-char': 'c2', 'gout-time': 'recurrent', 'gout-urate': 'u8to10', 'gout-synovial': 'notdone' }).score, 9);
  assert.equal(ok('caspar', { 'caspar-entry': '1', 'caspar-psoriasis': 'current', 'caspar-nail': '1' }).score, 3);
  const fib = ok('fibromyalgia-acr-2016', { 'fib-wpi': '8', 'fib-fatigue': 's2', 'fib-waking': 's2', 'fib-cognitive': 's1', 'fib-headache': '1', 'fib-regions': '4', 'fib-duration': '1' });
  assert.equal(fib.sss, 6);
});

test('lib/vte-v106.js worked calls (wave 7)', () => {
  const pg = ok('peged', { 'pg-tier': 'low', 'pg-dd': 600 });
  assert.equal(pg.excluded, true);
  assert.equal(pg.threshold, 1000);
  assert.equal(ok('4peps', { 'pp-age': 70, 'pp-male': 1, 'pp-vte': 1, 'pp-syn': 1, 'pp-calf': 1, 'pp-pe': 1 }).total, 14);
  const bv = ok('bova-pe', { 'bv-sbp': 1, 'bv-trop': 1, 'bv-rv': 1 });
  assert.equal(bv.total, 6);
  assert.equal(bv.stage, 'III');
  const he = ok('hestia', { 'he-preg': 1 });
  assert.equal(he.positive, 1);
  assert.equal(he.eligible, false);
  assert.equal(ok('geneva-original', { 'gv-age': 85, 'gv-vte': 1, 'gv-surg': 1, 'gv-hr': 110, 'gv-co2': 'low2', 'gv-o2': 'b4' }).total, 14);
  assert.equal(ok('constans-uedvt', { 'co-mat': 1, 'co-pain': 1, 'co-edema': 1 }).total, 3);
});

test('lib/vascular-v105.js worked calls (wave 7)', () => {
  // The lower of the two legs governs; the right leg's 0.90 is the abnormal index.
  const abi = ok('abi', { 'abi-ra': '90', 'abi-la': '120', 'abi-rb': '100', 'abi-lb': '100' });
  assert.equal(abi.governing.value, 0.9);
  assert.equal(abi.abnormal, true);
  const rf = ok('rutherford-fontaine', { 'rf-pic': 'severe-claudication' });
  assert.equal(rf.rutherford, 3);
  assert.equal(rf.fontaine, 'IIb');
  assert.equal(ok('wifi', { 'wifi-w': '2', 'wifi-i': '3', 'wifi-fi': '1' }).stage, 4);
  // EuroSCORE II is a logistic model; the mortality is finite and clamped to [0,1].
  const es = ok('euroscore2', { 'es-age': '70', 'es-female': '1', 'es-ins': '1', 'es-cpd': '1', 'es-nyha': '3', 'es-ccs4': '1', 'es-lv': 'poor', 'es-mi': '1', 'es-renal': 'dialysis', 'es-urg': 'elective', 'es-wt': 'cabg' });
  assert.equal(es.mortality, 10.66);
});

// ---- Wave 10: the Long-Term Care & Geriatric Assessment cluster -------------

test('lib/ltcga-v173.js worked calls (wave 10)', () => {
  assert.equal(ok('bims', { 'bims-rep': '3', 'bims-year': '3', 'bims-month': '2', 'bims-day': '1', 'bims-sock': '2', 'bims-blue': '2', 'bims-bed': '0' }).total, 13);
  assert.equal(ok('ad8', { 'ad8-judgment': 'yes', 'ad8-interest': 'no', 'ad8-repeating': 'yes', 'ad8-learningTool': 'no', 'ad8-dateRecall': 'no', 'ad8-finances': 'no', 'ad8-appointments': 'no', 'ad8-dailyThinking': 'no' }).total, 2);
  assert.equal(ok('cdr-sob', { 'cdr-memory': '1', 'cdr-orientation': '1', 'cdr-judgment': '0.5', 'cdr-community': '1', 'cdr-home': '1', 'cdr-personalCare': '0' }).sob, 4.5);
});

test('lib/ltcga-v174.js worked calls (wave 10)', () => {
  assert.equal(ok('nu-desc', { 'nudesc-disorientation': '1', 'nudesc-behavior': '1', 'nudesc-communication': '0', 'nudesc-illusions': '0', 'nudesc-psychomotor': '0' }).total, 2);
  assert.equal(ok('interrai-abs', { 'abs-verbal': '1', 'abs-physical': '2', 'abs-social': '0', 'abs-resists': '0' }).total, 3);
  // CMAI floor: every behavior rated 1 (never) => 29.
  const cmaiInputs = {};
  for (const k of ['pacing', 'dressing', 'spitting', 'cursing', 'requests', 'repetitive', 'hitting', 'kicking', 'grabbing', 'pushing', 'throwing', 'noises', 'screaming', 'biting', 'scratching', 'trying', 'falling', 'complaining', 'negativism', 'eating', 'hurting', 'handling', 'hiding', 'hoarding', 'tearing', 'mannerisms', 'verbalsex', 'physicalsex', 'restlessness']) cmaiInputs[`cmai-${k}`] = '1';
  assert.equal(ok('cmai', cmaiInputs).total, 29);
});

test('lib/ltcga-v176.js worked calls (wave 10)', () => {
  assert.equal(ok('stratify', { 'stratify-fall': 'yes', 'stratify-agitated': 'yes', 'stratify-visual': 'no', 'stratify-toilet': 'no', 'stratify-transfer': '0', 'stratify-mobility': '0' }).total, 2);
  assert.equal(ok('gait-speed', { 'gait-distance': '4', 'gait-time': '5' }).speed, 0.8);
  assert.equal(ok('four-stage-balance', { 'balance-tandem': '8' }).held, false);
});

test('lib/ltcga-v177.js worked calls (wave 10)', () => {
  assert.equal(ok('sarc-f', { 'sarcf-strength': '1', 'sarcf-walk': '1', 'sarcf-rise': '1', 'sarcf-stairs': '1', 'sarcf-falls': '0' }).total, 4);
  assert.equal(ok('prisma-7', { 'prisma-age': 'yes', 'prisma-male': 'yes', 'prisma-limit': 'yes', 'prisma-help': 'no', 'prisma-home': 'no', 'prisma-support': 'yes', 'prisma-aid': 'no' }).total, 3);
  assert.equal(ok('sof-frailty-index', { 'sof-weight': 'yes', 'sof-rise': 'yes', 'sof-energy': 'no' }).total, 2);
});

test('lib/ltcga-v178.js worked calls (wave 10)', () => {
  assert.equal(ok('conut', { 'conut-albumin': '3.2', 'conut-chol': '150', 'conut-lymph': '1000' }).total, 5);
  assert.equal(ok('pni-onodera', { 'pni-albumin': '4.0', 'pni-lymph': '1500' }).value, 47.5);
  assert.equal(ok('eat-10', { 'eat-1': '1', 'eat-2': '1', 'eat-3': '1', 'eat-4': '0', 'eat-5': '0', 'eat-6': '0', 'eat-7': '0', 'eat-8': '0', 'eat-9': '0', 'eat-10': '0' }).total, 3);
});

test('lib/ltcga-v179.js worked calls (wave 10), including the flat->array Drug Burden Index toArgs', () => {
  assert.equal(ok('anticholinergic-burden', { 'acb-l1': '0', 'acb-l2': '0', 'acb-l3': '1' }).total, 3);
  assert.equal(ok('anticholinergic-risk-scale', { 'ars-p1': '0', 'ars-p2': '1', 'ars-p3': '1' }).total, 5);
  // DBI = 10/(10+5) + 4/(4+4) = 0.667 + 0.5 = 1.17; the adapter rebuilds the
  // two-drug array from four flat scalar fields.
  const dbi = ok('drug-burden-index', { 'dbi-d1': '10', 'dbi-min1': '5', 'dbi-d2': '4', 'dbi-min2': '4' });
  assert.equal(dbi.value, 1.17);
  assert.equal(dbi.drugs, 2);
});

test('lib/ltcga-v182.js worked calls (wave 10)', () => {
  assert.equal(ok('sandvik-incontinence', { 'sandvik-freq': '3', 'sandvik-amount': '2' }).value, 6);
  assert.equal(ok('iciq-ui-sf', { 'iciq-freq': '3', 'iciq-amount': '4', 'iciq-impact': '6' }).total, 13);
  const csiInputs = {};
  for (const [i, k] of ['sleep', 'inconvenient', 'physical', 'confining', 'family', 'plans', 'other', 'emotional', 'upsetting', 'changed', 'work', 'financial', 'overwhelmed'].entries()) csiInputs[`csi-${k}`] = i < 7 ? 'yes' : 'no';
  assert.equal(ok('caregiver-strain-index', csiInputs).total, 7);
});

test('lib/ltcga-v180.js worked calls (wave 13)', () => {
  assert.equal(ok('lee-mortality-index', { 'lee-age': '85plus', 'lee-male': '1', 'lee-chf': '1', 'lee-cancer': '1' }).score, 13);
  assert.equal(ok('lee-mortality-index', { 'lee-age': '85plus', 'lee-male': '1', 'lee-chf': '1', 'lee-cancer': '1' }).mortality, '42%');
  assert.equal(ok('chess-scale', { 'chess-vomit': '1', 'chess-dyspnea': '1', 'chess-cog': '1', 'chess-adl': '1', 'chess-eol': '1' }).score, 5);
});

test('lib/metabolic-onc-v88.js worked calls (wave 13)', () => {
  assert.equal(ok('dka-hhs', { 'dk-glu': '520', 'dk-ph': '6.95', 'dk-hco3': '6', 'dk-bohb': '6', 'dk-mental': 'stupor', 'dk-na': '130', 'dk-cl': '95' }).grade, 'severe');
  // capGfr 'off' passes the raw GFR (60) through: 6 x (60 + 25) = 510 mg.
  assert.equal(ok('calvert-carboplatin', { 'cv-auc': '6', 'cv-gfr': '60', 'cv-cap': 'off' }).dose, 510);
  // The pediatric age class lowers the phosphate threshold to 6.5 (via the enum->bool `to`).
  assert.equal(ok('tls-cairo-bishop', { 'tl-age': 'pediatric', 'tl-ua': '9', 'tl-k': '6.5', 'tl-phos': '7', 'tl-ca': '6', 'tl-cr': '2.4', 'tl-uln': '1.2', 'tl-arr': 'none', 'tl-sz': 'none' }).grade, 2);
});

test('lib/enviro-v111.js worked calls (wave 13)', () => {
  assert.equal(ok('lake-louise-ams', { 'll-head': '2', 'll-gi': '2', 'll-fat': '1', 'll-diz': '1' }).total, 6);
  assert.equal(ok('szpilman-drowning', { 'sz-status': 'breathing', 'sz-ausc': 'pulmonary-edema', 'sz-hypo': '1' }).grade, 4);
  assert.equal(ok('snakebite-severity', { 'ss-pul': '3', 'ss-cv': '3', 'ss-loc': '4', 'ss-gi': '2', 'ss-hem': '1', 'ss-cns': '1' }).total, 14);
  assert.equal(ok('cauchy-frostbite', { 'cf-topo': 'distal-phalanx', 'cf-bone': 'absent-carpal-tarsal' }).grade, 4);
});

test('lib/eddecision-v107.js worked calls (wave 13)', () => {
  assert.equal(ok('new-orleans-head', { 'no-vomit': '1', 'no-age': '1', 'no-head': '1' }).positive, 3);
  assert.equal(ok('go-far', { 'gf-age': '82', 'gf-sepsis': '1', 'gf-resp': '1' }).total, 17);
  assert.equal(ok('macocha', { 'mc-mallampati': '1', 'mc-osa': '1' }).total, 7);
});

test('lib/warfarin-v133.js worked calls (wave 13)', () => {
  // Height/weight are consumed in cm/kg directly (the browser unit toggle is bypassed).
  assert.equal(ok('warfarin-iwpc', { 'iw-age': '65', 'iw-ht': '170', 'iw-wt': '70', 'iw-vk': 'GG', 'iw-cyp': '*1/*1', 'iw-race': 'white', 'iw-ind': 'no', 'iw-amio': 'no' }).weekly, 41.1);
  assert.equal(ok('warfarin-gage', { 'ga-age': '60', 'ga-ht': '175', 'ga-wt': '70', 'ga-inr': '2.5', 'ga-vk': 'GG', 'ga-cyp': '*1/*1', 'ga-amio': 'no', 'ga-smoke': 'no', 'ga-aa': 'no', 'ga-dvt': 'no' }).daily, 6.3);
  assert.equal(ok('warfarin-init-10mg', { 'w10-day': '3', 'w10-inr3': '1.2' }).dose, 15);
  assert.equal(ok('warfarin-init-5mg', { 'w5-day': '3', 'w5-inr': '1.6' }).dose, 5);
});

test('lib/acs-v193.js worked calls (wave 15)', () => {
  assert.equal(ok('crusade', { 'crusade-hct': '35', 'crusade-crcl': '50', 'crusade-hr': '95', 'crusade-sex': 'female', 'crusade-sbp': '85', 'crusade-chf': '1', 'crusade-dm': '1' }).score, 68);
  assert.equal(ok('crusade', { 'crusade-hct': '45', 'crusade-crcl': '130', 'crusade-hr': '60', 'crusade-sex': 'male', 'crusade-sbp': '130' }).score, 1);
  assert.equal(ok('scai-shock', { 'scai-sbp': '80', 'scai-lactate': '3', 'scai-support': 'one' }).stage, 'C');
  assert.equal(ok('scai-shock', { 'scai-sbp': '120', 'scai-lactate': '1', 'scai-support': 'none' }).stage, 'A');
  assert.equal(ok('scai-shock', { 'scai-sbp': '80', 'scai-lactate': '6', 'scai-support': 'none', 'scai-arrest': '1' }).stage, 'E');
  assert.equal(ok('zwolle-pci', { 'zwolle-killip': '3-4', 'zwolle-timi': '0-1', 'zwolle-age': '70', 'zwolle-3vd': '1', 'zwolle-ant': '1', 'zwolle-time': '1' }).score, 16);
  assert.equal(ok('zwolle-pci', { 'zwolle-killip': '1', 'zwolle-timi': '3', 'zwolle-age': '45' }).score, 0);
  assert.equal(ok('timi-risk-index', { 'tri-hr': '100', 'tri-age': '70', 'tri-sbp': '120' }).value, 40.8);
  assert.equal(ok('cadillac-risk', { 'cad-lvef': '30', 'cad-crcl': '50', 'cad-age': '70', 'cad-killip': '2-3', 'cad-timi': '0-2', 'cad-anemia': '1', 'cad-3vd': '1' }).score, 18);
  assert.equal(ok('cadillac-risk', { 'cad-lvef': '55', 'cad-crcl': '80', 'cad-age': '60', 'cad-killip': '1', 'cad-timi': '3' }).score, 0);
});

test('lib/hemo-v194.js worked calls (wave 16)', () => {
  assert.equal(ok('papi', { 'papi-pasp': '40', 'papi-padp': '20', 'papi-rap': '18' }).value, 1.11);
  const g = ok('transpulmonary-gradient', { 'tpg-mpap': '40', 'tpg-padp': '30', 'tpg-pcwp': '20' });
  assert.equal(g.tpg, 20);
  assert.equal(g.dpg, 10);
  assert.equal(ok('tei-index', { 'tei-ivct': '80', 'tei-ivrt': '90', 'tei-et': '250' }).value, 0.68);
  assert.equal(ok('shunt-fraction', { 'shunt-hb': '15', 'shunt-pao2a': '110', 'shunt-sao2': '99', 'shunt-pao2': '95', 'shunt-svo2': '75', 'shunt-pvo2': '40' }).pct, 4.7);
});

test('lib/vent-v195.js worked calls (wave 17)', () => {
  const sf = ok('sf-ratio', { 'sf-spo2': '95', 'sf-fio2': '0.5' });
  assert.equal(sf.sf, 190);
  assert.equal(ok('ventilatory-ratio', { 'vr-ve': '9000', 'vr-paco2': '50', 'vr-height': '175', 'vr-sex': 'male' }).vr, 1.7);
  assert.equal(ok('osi-oxygenation', { 'osi-fio2': '0.6', 'osi-map': '15', 'osi-spo2': '92' }).value, 9.78);
  assert.equal(ok('ventilation-index', { 'vi-rr': '30', 'vi-pip': '30', 'vi-paco2': '50' }).value, 45);
});

test('lib/liver-v196.js worked calls (wave 18)', () => {
  assert.equal(ok('abic-score', { 'abic-age': '50', 'abic-bili': '8', 'abic-creat': '1.0', 'abic-inr': '1.5' }).value, 7.14);
  assert.equal(ok('globe-score', { 'globe-age': '65', 'globe-bili': '1.8', 'globe-alp': '2.5', 'globe-alb': '0.95', 'globe-plt': '120' }).abnormal, true);
  const uk = ok('uk-pbc-risk', { 'ukpbc-alp': '2.0', 'ukpbc-trans': '1.5', 'ukpbc-bili': '1.0', 'ukpbc-alb': '1.1', 'ukpbc-plt': '1.5' });
  assert.equal(uk.r5, 4.7);
  assert.equal(ok('page-b', { 'pageb-age': '65', 'pageb-sex': 'male', 'pageb-plt': '90' }).score, 23);
  assert.equal(ok('mayo-psc-risk', { 'mayopsc-age': '55', 'mayopsc-bili': '5', 'mayopsc-alb': '3.0', 'mayopsc-ast': '120', 'mayopsc-var': '1' }).value, 3.82);
});

test('lib/endo-quant-v197.js worked calls (wave 19)', () => {
  assert.equal(ok('spina-gt', { 'spinagt-tsh': '1', 'spinagt-ft4': '16.5' }).value, 4.7);
  assert.equal(ok('spina-gd', { 'spinagd-ft4': '16.5', 'spinagd-ft3': '4.5' }).value, 25.22);
  const j = ok('jostel-tsh-index', { 'jostel-tsh': '1.5', 'jostel-ft4': '15' });
  assert.equal(j.tshi, 2.42);
  assert.equal(ok('homa-beta', { 'homab-ins': '8', 'homab-glu': '5.0' }).value, 106.7);
  assert.equal(ok('oral-disposition-index', { 'dio-i0': '8', 'dio-i30': '60', 'dio-g0': '90', 'dio-g30': '150' }).value, 0.108);
});

test('lib/subspecialty-v198.js worked calls (wave 20)', () => {
  assert.equal(ok('cns-ipi', { 'cnsipi-age': '1', 'cnsipi-ldh': '1', 'cnsipi-ecog': '1', 'cnsipi-stage': '1' }).score, 4);
  assert.equal(ok('isth-bat', { 'isth-group': 'male', 'isth-epistaxis': '2', 'isth-surgery': '3' }).total, 5);
  assert.equal(ok('virsta', { 'virsta-emboli': '1', 'virsta-valve': '1' }).score, 8);
  const s = ok('select-pse', { 'select-nihss': '4-10', 'select-early': '1', 'select-cortical': '1' });
  assert.equal(s.score, 6);
  assert.equal(ok('figo-gtn', { 'figo-age': '45', 'figo-antecedent': 'term', 'figo-interval': '14', 'figo-hcg': '200000', 'figo-size': '6', 'figo-site': 'liverbrain', 'figo-mets': '10', 'figo-chemo': 'single' }).score, 23);
});

test('lib/myeloid-prognosis-v199.js worked calls (wave 21)', () => {
  assert.equal(ok('mipss70', { 'mipss-hb': '1', 'mipss-wbc': '1', 'mipss-blasts': '1', 'mipss-fibrosis': '1' }).score, 5);
  assert.equal(ok('gipss', { 'gipss-karyo': 'vhr', 'gipss-asxl1': '1' }).score, 3);
  assert.equal(ok('mysec-pm', { 'mysec-age': '65', 'mysec-hb': '1', 'mysec-blasts': '1' }).score, 13.75);
  assert.equal(ok('hct-ci', { 'hct-tumor': '1' }).score, 3);
  // HCT-CI hepatic/pulmonary enums reach the lib scoring path.
  assert.equal(ok('hct-ci', { 'hct-hepatic': 'severe', 'hct-pulmonary': 'moderate' }).score, 5);
});

test('lib/critcare-severity-v200.js worked calls (wave 22)', () => {
  assert.equal(ok('oasis', { 'oasis-preicu': '2', 'oasis-age': '70', 'oasis-gcs': '10', 'oasis-hr': '130', 'oasis-map': '55', 'oasis-rr': '28', 'oasis-temp': '35', 'oasis-urine': '500', 'oasis-vent': '1' }).score, 51);
  assert.equal(ok('lods', { 'lods-gcs': '13', 'lods-hr': '80', 'lods-sbp': '120', 'lods-bun': '30', 'lods-creat': '1.0', 'lods-urine': '1.5', 'lods-wbc': '8', 'lods-plt': '200', 'lods-bili': '1' }).score, 4);
  assert.equal(ok('delta-gap', { 'dg-na': '140', 'dg-cl': '100', 'dg-hco3': '10' }).score, 1.29);
  assert.equal(ok('apps-ards', { 'apps-age': '70', 'apps-pf': '90', 'apps-plateau': '32' }).score, 9);
});

test('lib/hepatology-gibleed-v201.js worked calls (wave 23)', () => {
  assert.equal(ok('glasgow-blatchford', { 'gbs-ureaunit': 'mmol', 'gbs-urea': '12', 'gbs-sex': 'male', 'gbs-hb': '11', 'gbs-sbp': '95', 'gbs-pulse': '1', 'gbs-melena': '1' }).score, 11);
  assert.equal(ok('clif-c-ad', { 'clifad-age': '65', 'clifad-creat': '2.0', 'clifad-inr': '1.6', 'clifad-wbc': '12', 'clifad-na': '128' }).score, 70);
  assert.equal(ok('hepamet-fibrosis', { 'hep-age': '68', 'hep-sex': 'male', 'hep-ast': '90', 'hep-alb': '3.5', 'hep-plt': '120', 'hep-dm': '1' }).score, 0.948);
  assert.equal(ok('clip-hcc', { 'clip-child': 'B', 'clip-morph': 'multi', 'clip-afp': '500', 'clip-pvt': '1' }).score, 4);
  assert.equal(ok('agile-3plus', { 'agile-lsm': '12', 'agile-ast': '50', 'agile-alt': '40', 'agile-plt': '180', 'agile-age': '60', 'agile-sex': 'male', 'agile-dm': '1' }).score, 0.868);
});

test('lib/cvrisk-engines-v202.js worked calls (wave 24)', () => {
  assert.equal(ok('mecki', { 'mecki-hb': '10', 'mecki-na': '132', 'mecki-lvef': '25', 'mecki-ppvo2': '40', 'mecki-veco2': '40', 'mecki-egfr': '45' }).score, 40.7);
});

test('lib/periop-frailty-v203.js worked calls (wave 25)', () => {
  assert.equal(ok('dasi', { 'dasi-selfcare': '1', 'dasi-walkindoors': '1', 'dasi-walkblocks': '1', 'dasi-stairs': '1', 'dasi-lightwork': '1', 'dasi-modwork': '1', 'dasi-yardwork': '1', 'dasi-sexual': '1' }).score, 28.7);
  assert.equal(ok('abcd3-i', { 'abcd3i-age': '65', 'abcd3i-sbp': '150', 'abcd3i-dbp': '92', 'abcd3i-clinical': 'weakness', 'abcd3i-dur': '90', 'abcd3i-dm': '1', 'abcd3i-dual': '1', 'abcd3i-carotid': '1', 'abcd3i-dwi': '1' }).score, 13);
  assert.equal(ok('sort-mortality', { 'sort-asa': 'III', 'sort-urgency': 'urgent', 'sort-age': '70', 'sort-highrisk': '1', 'sort-major': '1', 'sort-cancer': '1' }).score, 14.67);
});

test('lib/nephro-fluids-v204.js worked calls (wave 26)', () => {
  assert.equal(ok('cccr', { 'cccr-uca': '6', 'cccr-sca': '10', 'cccr-scr': '1.0', 'cccr-ucr': '100' }).score, 0.006);
  assert.equal(ok('max-allowable-blood-loss', { 'abl-cat': 'adult-male', 'abl-weight': '70', 'abl-hcti': '42', 'abl-hctf': '30' }).score, 1500);
  assert.equal(ok('efw-clearance', { 'efwc-una': '20', 'efwc-uk': '10', 'efwc-pna': '140', 'efwc-vol': '2000' }).score, 1571.4);
  const t = ok('tmp-gfr', { 'tmp-sp': '1.2', 'tmp-up': '15', 'tmp-scr': '0.09', 'tmp-ucr': '9' });
  assert.equal(t.trp, 0.875);
  assert.equal(ok('urine-calcium-cr', { 'uca-mode': 'spot', 'uca-uca': '30', 'uca-ucr': '100', 'uca-age': 'adult' }).score, 0.3);
});

test('lib/pulm-copd-v205.js worked calls (wave 27)', () => {
  assert.equal(ok('cat-copd', { 'cat-cough': '4', 'cat-phlegm': '3', 'cat-chest': '2', 'cat-breathless': '4', 'cat-activity': '3', 'cat-confidence': '2', 'cat-sleep': '3', 'cat-energy': '3' }).score, 24);
  assert.equal(ok('lent-score', { 'lent-ldh': '1600', 'lent-ecog': '2', 'lent-nlr': '10', 'lent-tumor': 'high' }).score, 6);
  assert.equal(ok('ado-index', { 'ado-age': '72', 'ado-mmrc': '3', 'ado-fev1': '30' }).score, 7);
  assert.equal(ok('dose-index', { 'dose-mmrc': '3', 'dose-fev1': '40', 'dose-smoker': '1', 'dose-exac': '3' }).score, 5);
  assert.equal(ok('sacs-osa', { 'sacs-neck': '42', 'sacs-htn': '1', 'sacs-snore': '1' }).score, 49);
});

test('lib/tbi-stroke-v206.js worked calls (wave 28)', () => {
  assert.equal(ok('essen-stroke-risk', { 'essen-age': '78', 'essen-htn': '1', 'essen-dm': '1', 'essen-pad': '1', 'essen-smoke': '1' }).score, 6);
  assert.equal(ok('rotterdam-ct', { 'rott-cist': 'absent', 'rott-shift': '1', 'rott-ivh': '1' }).score, 6);
  assert.equal(ok('marshall-ct', { 'mar-mass': 'none', 'mar-path': '1', 'mar-shift': '1' }).category, 'IV');
  assert.equal(ok('func-score', { 'func-vol': '20', 'func-age': '60', 'func-loc': 'lobar', 'func-gcs': '14' }).score, 11);
});

test('lib/resus-trauma-v207.js worked calls (wave 29)', () => {
  assert.equal(ok('tor-rule', { 'tor-rule': 'bls' }).met, true);
  assert.equal(ok('tor-rule', { 'tor-rule': 'bls', 'tor-rosc': '1' }).met, false);
  assert.equal(ok('rems', { 'rems-age': '80', 'rems-map': '60', 'rems-hr': '130', 'rems-rr': '30', 'rems-spo2': '88', 'rems-gcs': '10' }).score, 14);
  assert.equal(ok('cart-score', { 'cart-rr': '27', 'cart-hr': '145', 'cart-dbp': '38', 'cart-age': '72' }).score, 43);
});

test('lib/nutrition-maternal-v208.js worked calls (wave 30)', () => {
  assert.equal(ok('ponderal-index', { 'pi-weight': '2200', 'pi-length': '50' }).score, 1.76);
  assert.equal(ok('sflt1-plgf', { 'sflt-ratio': '25', 'sflt-phase': 'late' }).score, 25);
  assert.equal(ok('glim-malnutrition', { 'glim-wl': 'severe', 'glim-intake': '1' }).stage, 2);
  assert.equal(ok('sga-nutrition', { 'sga-rating': 'C' }).rating, 'C');
});

test('lib/cardiology-risk-v209.js worked calls (wave 31)', () => {
  assert.equal(ok('hcm-risk-scd', { 'hcm-age': '40', 'hcm-mwt': '25', 'hcm-la': '45', 'hcm-lvot': '50', 'hcm-nsvt': '1' }).score, 7.35);
  assert.equal(ok('charge-af', { 'charge-age': '65', 'charge-height': '170', 'charge-weight': '80', 'charge-sbp': '130', 'charge-dbp': '80', 'charge-white': '1', 'charge-antihtn': '1' }).score, 3.23);
});

test('lib/stroke-prognosis-v210.js worked calls (wave 32)', () => {
  assert.equal(ok('span-100', { 'span-age': '80', 'span-nihss': '22' }).score, 102);
});

test('lib/heme-onc-risk-v211.js worked calls (wave 33)', () => {
  assert.equal(ok('eutos', { 'eutos-baso': '8', 'eutos-spleen': '12' }).score, 104);
  assert.equal(ok('improvedd', { 'imdd-vte': '1', 'imdd-cancer': '1', 'imdd-ddimer': '1' }).score, 7);
  assert.equal(ok('compass-cat', { 'cc-antihorm': '1', 'cc-diag6mo': '1' }).score, 10);
  assert.equal(ok('eln-2022-aml', { 'eln-npm1': '1' }).category, 'Favorable');
});

test('lib/hep-fibrosis-portal-v212.js worked calls (wave 34)', () => {
  assert.equal(ok('king-score', { 'king-age': '40', 'king-ast': '30', 'king-inr': '1.0', 'king-plt': '200' }).score, 6);
  const b = ok('baveno-vii', { 'bav-lsm': '12', 'bav-plt': '180' });
  assert.equal(b.abnormal, false);
  assert.ok(b.csph.includes('ruled OUT'));
});

test('lib/acute-injury-v213.js worked calls (wave 35)', () => {
  assert.equal(ok('heart-pathway', { 'hp-heart': '2', 'hp-trop0': '0', 'hp-trop3': '0' }).lowRisk, true);
  assert.equal(ok('ottawa-heart-failure', { 'ohf-stroke': '1', 'ohf-intub': '1' }).score, 3);
  assert.equal(ok('light-criteria', { 'lc-pprot': '4.5', 'lc-sprot': '6.0', 'lc-pldh': '300', 'lc-sldh': '200', 'lc-uln': '250' }).exudate, true);
  assert.equal(ok('baux-score', { 'bx-age': '40', 'bx-tbsa': '30' }).score, 70);
  assert.equal(ok('revised-baux', { 'rbx-age': '40', 'rbx-tbsa': '30', 'rbx-inh': '1' }).score, 87);
});

test('lib/cardiology-risk-v214.js worked calls (wave 36)', () => {
  assert.equal(ok('apple-score', { 'apl-age': '1', 'apl-pers': '1', 'apl-egfr': '0', 'apl-la': '0', 'apl-ef': '0' }).score, 2);
  assert.equal(ok('caap-af-score', { 'caap-la': '4.2', 'caap-age': '72', 'caap-aad': '1', 'caap-cad': '1', 'caap-pers': '0', 'caap-female': '1' }).score, 7);
  assert.equal(ok('atlas-score', { 'atl-lavi': '34', 'atl-age': '1', 'atl-np': '0', 'atl-female': '1', 'atl-smoke': '0' }).score, 8);
  assert.equal(ok('hatch-score', { 'htc-htn': '1', 'htc-age': '0', 'htc-stroke': '1', 'htc-copd': '0', 'htc-hf': '0' }).score, 3);
  assert.equal(ok('mb-later-score', { 'mbl-type': '1', 'mbl-male': '1', 'mbl-bbb': '0', 'mbl-la': '1', 'mbl-er': '0' }).score, 3);
  assert.equal(ok('canada-acs-risk-score', { 'cacs-age': '1', 'cacs-killip': '0', 'cacs-sbp': '1', 'cacs-hr': '0' }).score, 2);
  assert.equal(ok('action-icu-score', { 'aic-hr': '105', 'aic-sbp': '120', 'aic-hf': '1' }).score, 11);
});

test('lib/risk-scores-v215.js worked calls (wave 37)', () => {
  assert.equal(ok('dlcn-fh-score', { 'dlcn-fam': '1', 'dlcn-clin': '2', 'dlcn-exam': '6', 'dlcn-ldl': '7.0', 'dlcn-dna': '0' }).score, 14);
  assert.equal(ok('simon-broome-fh', { 'sb-tc': '8.0', 'sb-xanthoma': '1' }).definite, true);
  assert.equal(ok('padit-score', { 'padit-prior': '4', 'padit-age': '55', 'padit-type': '4' }).score, 10);
  assert.equal(ok('grim-score', { 'grim-alb': '3.0', 'grim-nlr': '8', 'grim-ldh': '1' }).score, 3);
  assert.equal(ok('lipi', { 'lipi-anc': '7', 'lipi-wbc': '9', 'lipi-ldh': '1' }).score, 2);
  assert.equal(ok('onkotev-score', { 'onk-khorana': '1', 'onk-mets': '1' }).score, 2);
  assert.equal(ok('protecht-score', { 'prot-site': '2', 'prot-plt': '1', 'prot-plat': '1' }).score, 4);
});

test('lib/heme-prognostic-v216.js worked calls (wave 38)', () => {
  assert.equal(ok('wpss-mds', { 'wpss-cat': '2', 'wpss-karyo': '1', 'wpss-tx': '1' }).score, 4);
  assert.equal(ok('mdacc-cll-index', { 'mdacc-age': '70', 'mdacc-b2m': '2', 'mdacc-alc': '60', 'mdacc-male': '1' }).score, 7);
  assert.equal(ok('pit-ptcl', { 'pit-age': '1', 'pit-ldh': '1' }).score, 2);
  assert.equal(ok('prima-pi', { 'prima-b2m': '2', 'prima-marrow': '1' }).group, 'Intermediate');
  assert.equal(ok('durie-salmon', { 'ds-hb': '7', 'ds-ca': '10', 'ds-lesions': '4', 'ds-mprot': '2', 'ds-cr': '1.0' }).stage, 'IIIA');
  assert.equal(ok('lymphocyte-doubling-time', { 'ldt-alc1': '20', 'ldt-alc2': '40', 'ldt-int': '6' }).months, 6);
  assert.equal(ok('talcott-febrile-neutropenia', { 'tal-inpt': '0', 'tal-comorb': '0', 'tal-cancer': '0' }).group, 'IV');
});

test('lib/stroke-risk-v217.js worked calls (wave 39)', () => {
  assert.equal(ok('canadian-tia-score', { 'ctia-ap': '1', 'ctia-dbp': '1', 'ctia-af': '1' }).score, 8);
  assert.equal(ok('astral-score', { 'ast-age': '75', 'ast-nihss': '10', 'ast-onset': '1' }).score, 27);
  assert.equal(ok('soar-score', { 'soar-sub': '1', 'soar-ocsp': '2', 'soar-age': '1', 'soar-rankin': '0' }).score, 4);
  assert.equal(ok('plan-score', { 'plan-age': '80', 'plan-loc': '1', 'plan-arm': '1' }).score, 15);
  assert.equal(ok('sits-sich', { 'sits-ap': '2', 'sits-nihss': '15', 'sits-glu': '200', 'sits-sbp': '150', 'sits-wt': '80', 'sits-age': '75', 'sits-onset': '1', 'sits-htn': '1' }).score, 10);
  assert.equal(ok('vasograde', { 'vaso-mf': '3', 'vaso-wfns': '2' }).grade, 'Yellow');
  assert.equal(ok('ogilvy-carter', { 'oc-age': '1', 'oc-hh': '1', 'oc-fisher': '1' }).score, 3);
});

test('lib/ed-decision-v218.js worked calls (wave 40)', () => {
  assert.equal(ok('faint-score', { 'fnt-hf': '1', 'fnt-bnp': '1' }).score, 3);
  assert.equal(ok('nexus-head-ct', { 'nx-age': '1' }).ctIndicated, true);
  assert.equal(ok('handoc-score', { 'hd-murmur': '1', 'hd-aet': '1', 'hd-cult': '1' }).score, 3);
  assert.equal(ok('denova-score', { 'dn-dur': '1', 'dn-cult': '1', 'dn-murmur': '1' }).score, 3);
  assert.equal(ok('icm-pji-2018', { 'icm-swbc': '1', 'icm-ad': '1' }).score, 6);
  assert.equal(ok('air-score', { 'air-vomit': '1', 'air-rif': '1', 'air-rebound': '2', 'air-fever': '1', 'air-wbc': '16', 'air-pmn': '86', 'air-crp': '60' }).score, 11);
  assert.equal(ok('adult-appendicitis-score', { 'aas-rlq': '1', 'aas-reloc': '1', 'aas-tender': '1', 'aas-age': '55', 'aas-guard': '4', 'aas-wbc': '15', 'aas-pmn': '84', 'aas-crp': '100' }).score, 19);
});

test('lib/metabolic-hepatic-v219.js worked calls (wave 41)', () => {
  assert.equal(ok('ada-diabetes-risk-test', { 'ada-age': '55', 'ada-bmi': '32', 'ada-male': '1', 'ada-htn': '1' }).score, 6);
  assert.equal(ok('cambridge-diabetes-risk', { 'camb-age': '45', 'camb-bmi': '24', 'camb-fhx': '0', 'camb-smoke': '0' }).probability, 2.97);
  assert.equal(ok('lipid-accumulation-product', { 'lap-wc': '100', 'lap-tg': '2.0' }).value, 70);
  assert.equal(ok('visceral-adiposity-index', { 'vai-wc': '100', 'vai-bmi': '30', 'vai-tg': '2.0', 'vai-hdl': '1.0' }).value, 2.65);
  assert.equal(ok('conicity-index', { 'con-wc': '100', 'con-wt': '80', 'con-ht': '175' }).value, 1.36);
  assert.equal(ok('ast-alt-ratio', { 'aar-ast': '60', 'aar-alt': '30' }).ratio, 2);
  assert.equal(ok('ggt-platelet-ratio', { 'gpr-ggt': '100', 'gpr-uln': '50', 'gpr-plt': '200' }).gpr, 1);
});

// The enum->boolean adapter transform reaches the lib: el-ganzouri prognath and
// elapss earlierSah both map a yes/no select onto a lib boolean.
test('enum->boolean adapter transform reaches the lib (elapss earlierSah)', () => {
  // Use a low, non-saturating profile so the +1 from earlierSah='no' is visible
  // (the documented example saturates the score at the 40-point ceiling).
  const base = { 'el-loc': 'icaAcaAcom', 'el-age': '40', 'el-pop': 'na', 'el-size': '4', 'el-irregular': false };
  const no = ok('elapss', { ...base, 'el-sah': 'no' }).total;
  const yes = ok('elapss', { ...base, 'el-sah': 'yes' }).total;
  assert.notEqual(no, yes);
});

// The acute/chronic select maps to the lib boolean `chronic` arg via the
// adapter `to` transform; confirm both branches differ.
test('enum->boolean adapter transform (acute vs chronic) reaches the lib', () => {
  const acute = ok('resp-acidosis-compensation', { 'ra-paco2': '80', 'ra-hco3': '30', 'ra-ch': 'acute' }).expected;
  const chronic = ok('resp-acidosis-compensation', { 'ra-paco2': '80', 'ra-hco3': '30', 'ra-ch': 'chronic' }).expected;
  assert.notEqual(acute, chronic);
});

test('every exposed example round-trips to its META.example.expected numbers', () => {
  function numericFacts(s) {
    const facts = [];
    const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const value = Number(m[2]);
      if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
      facts.push({ value, raw: m[0], isApprox: !!m[1], rangeEnd: m[3] ? Number(m[3]) : null });
    }
    return facts;
  }
  function near(haystack, f) {
    const tol = f.isApprox ? Math.max(Math.abs(f.value) * 0.15, 1) : Math.max(Math.abs(f.value) * 0.02, 0.05);
    const lo = (f.rangeEnd != null ? Math.min(f.value, f.rangeEnd) : f.value) - tol;
    const hi = (f.rangeEnd != null ? Math.max(f.value, f.rangeEnd) : f.value) + tol;
    return [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0])).some((n) => n >= lo && n <= hi);
  }
  for (const row of listCalculators().calculators) {
    const ex = META[row.id].example;
    const r = computeCalculator({ id: row.id, inputs: ex.fields });
    assert.equal(r.valid, true, `${row.id} example must compute`);
    const ser = JSON.stringify(r.result);
    for (const f of numericFacts(ex.expected)) {
      assert.ok(near(ser, f), `${row.id}: expected number ${f.raw} missing from result`);
    }
  }
});
