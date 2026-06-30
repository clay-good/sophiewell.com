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
