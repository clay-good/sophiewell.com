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

test('lib/hepatology-prognosis-v220.js worked calls (wave 42)', () => {
  assert.equal(ok('fips-score', { 'fips-bili': '3.0', 'fips-cr': '1.2', 'fips-age': '60', 'fips-alb': '3.0' }).value, 1.2);
  assert.equal(ok('albi-plt', { 'ap-bili': '20', 'ap-alb': '40', 'ap-plt': '120' }).score, 4);
  assert.equal(ok('damico-cirrhosis-stage', { 'dam-varices': '1' }).stage, 2);
  assert.equal(ok('amap-score', { 'amap-age': '60', 'amap-bili': '20', 'amap-alb': '40', 'amap-plt': '150', 'amap-male': '1' }).value, 62.1);
  assert.equal(ok('nacseld-aclf', { 'nac-circ': '1', 'nac-renal': '1' }).count, 2);
  assert.equal(ok('fibroq', { 'fq-age': '50', 'fq-ast': '80', 'fq-inr': '1.2', 'fq-alt': '40', 'fq-plt': '150' }).value, 8);
});

test('lib/pulmonary-risk-v221.js worked calls (wave 43)', () => {
  assert.equal(ok('simplified-revised-geneva', { 'sg-hr': '100', 'sg-age': '1', 'sg-malig': '1' }).score, 4);
  assert.equal(ok('scap-score', { 'scap-rr': '1', 'scap-bun': '1' }).score, 14);
  assert.equal(ok('corb-score', { 'corb-conf': '1', 'corb-o2': '1' }).score, 2);
  assert.equal(ok('resp-score', { 'resp-age': '-2', 'resp-mv': '3', 'resp-dx': '3' }).score, 4);
  const ild = ok('ild-gap', { 'ild-sub': '0', 'ild-age': '2', 'ild-fvc': '60', 'ild-dlco': '1', 'ild-male': '1' });
  assert.equal(ild.score, 5);
  assert.equal(ild.stage, 'III');
  assert.equal(ok('du-bois-ipf', { 'db-age': '72', 'db-fvc': '60', 'db-dfvc': '-6' }).score, 31);
  assert.equal(ok('pneumothorax-volume', { 'ptx-a': '2', 'ptx-b': '3', 'ptx-c': '2' }).percent, 37.1);
});

test('lib/rheum-classification-v222.js worked calls (wave 44)', () => {
  assert.equal(ok('iim-eular-acr-2017', { 'iim-age': '2.1', 'iim-pu': '1', 'iim-helio': '1', 'iim-jo1': '1' }).score, 9.8);
  assert.equal(ok('pmr-eular-acr-2012', { 'pmr-stiff': '1', 'pmr-rf': '1' }).score, 4);
  const bp = ok('bohan-peter', { 'bp-weak': '1', 'bp-enz': '1', 'bp-emg': '1', 'bp-rash': '1' });
  assert.equal(bp.count, 3);
  assert.equal(bp.rash, true);
  assert.equal(ok('acr-eular-2013-systemic-sclerosis', { 'ssc-skin': '4', 'ssc-tip': '0', 'ssc-ray': '1', 'ssc-ab': '1' }).score, 10);
  assert.equal(ok('mrss-modified-rodnan-skin-score', { 'mrss-fingersR': '2', 'mrss-fingersL': '2', 'mrss-face': '1', 'mrss-chest': '3' }).score, 8);
  assert.equal(ok('acr-eular-2016-sjogren', { 'sj-focus': '1', 'sj-ssa': '1' }).score, 6);
  assert.equal(ok('esspri', { 'esp-dry': '6', 'esp-fat': '5', 'esp-pain': '4' }).score, 5);
});

test('lib/dermatology-v223.js worked calls (wave 45)', () => {
  assert.equal(ok('uas7', { 'uas-wheal': '10', 'uas-itch': '8' }).score, 18);
  assert.equal(ok('hiscr', { 'hs-bab': '2', 'hs-bnod': '6', 'hs-bfist': '1', 'hs-cab': '1', 'hs-cnod': '2', 'hs-cfist': '1' }).achieved, true);
  assert.equal(ok('hurley-stage', { 'hur-tract': '1' }).stage, 'II');
  assert.equal(ok('poem', { 'poem-itch': '3', 'poem-sleep': '2', 'poem-flake': '2', 'poem-dry': '4' }).score, 11);
  assert.equal(ok('alden', { 'ald-delay': '3', 'ald-present': '0', 'ald-chal': '0', 'ald-dechal': '0', 'ald-not': '3' }).score, 6);
  assert.equal(ok('pest', { 'pest-swollen': '1', 'pest-nail': '1', 'pest-heel': '1' }).score, 3);
  assert.equal(ok('glasgow-7-point-checklist', { 'g7-size': '1', 'g7-color': '1' }).score, 4);
});

test('lib/neurology-v224.js worked calls (wave 46)', () => {
  assert.equal(ok('id-migraine', { 'idm-nausea': '1', 'idm-photo': '1' }).score, 2);
  assert.equal(ok('onls', { 'onls-arm': '2', 'onls-leg': '3' }).score, 5);
  assert.equal(ok('end-it-score', { 'end-enc': '1', 'end-ncse': '1', 'end-img': '1' }).score, 3);
  assert.equal(ok('engel-classification', { 'eng-out': '1' }).engelClass, 'I');
  assert.equal(ok('ilae-surgical-outcome', { 'ilae-days': '2', 'ilae-base': '50' }).ilaeClass, 3);
  assert.ok(ok('salzburg-ncse-criteria', { 'salz-pat': '1', 'salz-evo': '1' }).verdict.startsWith('Definite'));
  assert.equal(ok('dhi', { 'dhi-yes': '10', 'dhi-some': '5' }).score, 50);
});

test('lib/obgyn-v225.js worked calls (wave 47)', () => {
  assert.equal(ok('nugent-score', { 'nug-lacto': '4', 'nug-gard': '4', 'nug-mob': '1' }).score, 9);
  assert.equal(ok('amsel-criteria', { 'ams-disch': '1', 'ams-ph': '1', 'ams-whiff': '1' }).score, 3);
  assert.equal(ok('ferriman-gallwey', { 'fg-lip': '2', 'fg-chin': '2', 'fg-chest': '2', 'fg-thigh': '2' }).score, 8);
  assert.equal(ok('pbac-hmb', { 'pb-mp': '4', 'pb-sp': '5', 'pb-lc': '2' }).score, 130);
  assert.equal(ok('thompson-hie', { 'th-tone': '2', 'th-cons': '2', 'th-post': '2', 'th-resp': '2' }).score, 8);
  assert.equal(ok('menopause-rating-scale', { 'mrs-flush': '3', 'mrs-sleep': '2', 'mrs-depr': '2', 'mrs-irr': '2' }).score, 9);
  assert.equal(ok('kupperman-index', { 'ku-flush': '3', 'ku-ins': '2', 'ku-nerv': '2' }).score, 20);
});

test('lib/nephrology-v226.js worked calls (wave 48)', () => {
  assert.equal(ok('watson-tbw', { 'wt-age': '40', 'wt-ht': '175', 'wt-wt': '80' }).value, 44.5);
  assert.equal(ok('salazar-corcoran', { 'sc-age': '50', 'sc-wt': '120', 'sc-ht': '170', 'sc-scr': '1.2' }).value, 98.3);
  assert.equal(ok('epvs', { 'ep-hct': '40', 'ep-hb': '13' }).value, 4.62);
  const fst = ok('furosemide-stress-test', { 'fst-wt': '70', 'fst-uop': '150' });
  assert.equal(fst.dose, 70);
  assert.equal(fst.progression, true);
  assert.equal(ok('fe-bicarbonate', { 'fe-uhco3': '20', 'fe-phco3': '24', 'fe-pcr': '1.0', 'fe-ucr': '50' }).value, 1.67);
  assert.equal(ok('corrected-potassium-ph', { 'kc-k': '5.4', 'kc-ph': '7.2' }).corrected, 4.2);
});

test('lib/mixed-v227.js worked calls (wave 49)', () => {
  assert.equal(ok('icbd-2014-behcet', { 'icbd-oral': '1', 'icbd-gen': '1', 'icbd-skin': '1' }).score, 5);
  assert.equal(ok('isg-1990-behcet', { 'isg-oral': '1', 'isg-gen': '1', 'isg-eye': '1' }).meets, true);
  assert.equal(ok('batt', { 'batt-age': '70', 'batt-sbp': '80', 'batt-gcs': '14', 'batt-hr': '1' }).score, 7);
  assert.equal(ok('denver-ed-tof', { 'den-hct': '18', 'den-age': '1', 'den-intub': '1' }).score, 6);
  assert.equal(ok('ets', { 'ets-sbp': '85', 'ets-age': '40', 'ets-fluid': '1' }).score, 5);
  assert.equal(ok('who-dengue-2009', { 'dg-abd': '1', 'dg-vom': '1' }).tier, 'dengue with warning signs');
});

test('lib/mixed-v228.js worked calls (wave 50)', () => {
  assert.equal(ok('england-fraser-index', { 'ef-mcv': '65', 'ef-rbc': '5.5', 'ef-hb': '12.5' }).score, -6.4);
  assert.equal(ok('sirdah-index', { 'sd-mcv': '65', 'sd-rbc': '5.5', 'sd-hb': '12.5' }).score, 22);
  assert.equal(ok('rdw-index', { 'rdwi-mcv': '65', 'rdwi-rdw': '14', 'rdwi-rbc': '5.5' }).score, 165.5);
  assert.equal(ok('srivastava-index', { 'sv-mch': '20', 'sv-rbc': '5.5' }).score, 3.6);
  assert.equal(ok('ehsani-index', { 'eh-mcv': '65', 'eh-rbc': '5.5' }).score, 10);
});

test('lib/hematology-v229.js worked calls (wave 51)', () => {
  assert.equal(ok('aec', { 'aec-wbc': '8', 'aec-eos': '12' }).score, 960);
  assert.equal(ok('nlr', { 'nlr-anc': '6', 'nlr-alc': '1.5' }).score, 4);
  assert.equal(ok('plr', { 'plr-plt': '300', 'plr-alc': '1.5' }).score, 200);
  assert.equal(ok('sii', { 'sii-plt': '300', 'sii-anc': '6', 'sii-alc': '1.5' }).score, 1200);
});

test('lib wave 52 (spec-v230 through spec-v257 subspecialty depth) worked calls', () => {
  // inflam-v230
  assert.equal(ok('lmr', { 'lmr-alc': '2.0', 'lmr-amc': '0.5' }).score, 4);
  assert.equal(ok('siri', { 'siri-anc': '4.0', 'siri-amc': '0.5', 'siri-alc': '2.0' }).score, 1);
  assert.equal(ok('piv', { 'piv-anc': '4.0', 'piv-plt': '250', 'piv-amc': '0.5', 'piv-alc': '2.0' }).score, 250);
  assert.equal(ok('crp-albumin-ratio', { 'car-crp': '20', 'car-alb': '4.0' }).score, 5);
  // prognostic-v231
  assert.equal(ok('naples-prognostic-score', { 'nap-alb': '3.5', 'nap-chol': '160', 'nap-nlr': '4.0', 'nap-lmr': '3.0' }).score, 4);
  assert.equal(ok('nmr', { 'nmr-anc': '4.0', 'nmr-amc': '0.5' }).score, 8);
  assert.equal(ok('far', { 'far-fib': '400', 'far-alb': '4.0' }).score, 100);
  // coagscore-v232
  assert.equal(ok('villalta', { 'vil-pain': '2', 'vil-heavy': '2', 'vil-edema': '2', 'vil-ind': '2', 'vil-hyp': '2', 'vil-ect': '2' }).score, 12);
  assert.equal(ok('sic', { 'sic-plt': '2', 'sic-inr': '1', 'sic-sofa': '2' }).score, 5);
  // estimators-v233
  assert.equal(ok('evans-index', { 'ev-frontal': '45', 'ev-skull': '140' }).score, 0.32);
  assert.equal(ok('fohr', { 'fo-frontal': '38', 'fo-occipital': '42', 'fo-bpd': '110' }).score, 0.36);
  assert.equal(ok('age-adjusted-d-dimer', { 'add-age': '75', 'add-dd': '600' }).score, 750);
  assert.equal(ok('deurenberg-body-fat', { 'db-bmi': '30', 'db-age': '40', 'db-sex': 'male' }).score, 29);
  // dermscore-v234
  assert.equal(ok('masi', { 'masi-fA': '4', 'masi-fD': '2', 'masi-fH': '2', 'masi-rmrA': '3', 'masi-rmrD': '2', 'masi-rmrH': '1', 'masi-lmrA': '3', 'masi-lmrD': '2', 'masi-lmrH': '1', 'masi-mA': '2', 'masi-mD': '1', 'masi-mH': '1' }).score, 10.6);
  assert.equal(ok('salt-score', { 'salt-top': '50', 'salt-back': '50', 'salt-right': '50', 'salt-left': '50' }).score, 50);
  assert.equal(ok('napsi', { 'napsi-matrix': '3', 'napsi-bed': '2' }).score, 5);
  assert.equal(ok('vancouver-scar-scale', { 'vss-pig': '1', 'vss-vas': '2', 'vss-pli': '3', 'vss-ht': '2' }).score, 8);
  // painscore-v235
  assert.equal(ok('dn4-neuropathic-pain', { 'dn4-burn': '1', 'dn4-cold': '1', 'dn4-shock': '1', 'dn4-tingle': '1', 'dn4-pins': '1' }).score, 5);
  assert.equal(ok('lanss-pain-scale', { 'lanss-dys': '1', 'lanss-auto': '1', 'lanss-brush': '1' }).score, 15);
  assert.equal(ok('roland-morris-disability', { 'rmdq-count': '14' }).score, 14);
  assert.equal(ok('neck-disability-index', { 'ndi-pain': '2', 'ndi-care': '2', 'ndi-lift': '2', 'ndi-read': '2', 'ndi-head': '2', 'ndi-conc': '2', 'ndi-work': '2', 'ndi-drive': '2', 'ndi-sleep': '2', 'ndi-rec': '2' }).score, 40);
  // ophtho-v236
  assert.equal(ok('spherical-equivalent', { 'se-sph': '2.5', 'se-cyl': '-0.5' }).score, 2.25);
  assert.equal(ok('vertex-distance', { 'vx-power': '5', 'vx-mm': '12' }).score, 5.32);
  assert.equal(ok('percent-tissue-altered', { 'pta-flap': '110', 'pta-abl': '80', 'pta-cct': '550' }).score, 34.5);
  assert.equal(ok('randleman-erss', { 'er-topo': '3', 'er-rsb': '250', 'er-age': '20', 'er-cct': '445', 'er-mrse': '-15' }).score, 18);
  // cardioecho-v237
  assert.equal(ok('romhilt-estes', { 're-volt': '1', 're-stt': '3' }).score, 6);
  assert.equal(ok('wilkins-score', { 'wk-mob': '2', 'wk-thick': '2', 'wk-calc': '2', 'wk-sub': '2' }).score, 8);
  assert.equal(ok('mitral-valve-area-pht', { 'mva-pht': '150' }).score, 1.47);
  assert.equal(ok('aortic-dvi', { 'dvi-lvot': '18', 'dvi-av': '90' }).score, 0.2);
  assert.equal(ok('rate-pressure-product', { 'rpp-hr': '80', 'rpp-sbp': '140' }).score, 11200);
  // anthro-v238
  assert.equal(ok('relative-fat-mass', { 'rfm-height': '170', 'rfm-waist': '90', 'rfm-sex': 'female' }).score, 38.2);
  assert.equal(ok('body-roundness-index', { 'bri-waist': '90', 'bri-height': '170' }).score, 3.93);
  assert.equal(ok('navy-body-fat', { 'navy-sex': 'male', 'navy-height': '70', 'navy-neck': '15', 'navy-waist': '34' }).score, 11.1);
  assert.equal(ok('egdr', { 'egdr-waist': '100', 'egdr-htn': '1', 'egdr-a1c': '8' }).score, 4.34);
  // gisurg-v239
  assert.equal(ok('bonacini-cds', { 'bon-plt': '90', 'bon-ratio': '0.5', 'bon-inr': '1.5' }).score, 10);
  assert.equal(ok('guci', { 'guci-ast': '60', 'guci-uln': '40', 'guci-inr': '1.2', 'guci-plt': '150' }).score, 1.2);
  assert.equal(ok('mannheim-peritonitis-index', { 'mpi-age': '1', 'mpi-female': '1', 'mpi-organ': '1', 'mpi-diffuse': '1', 'mpi-exudate': '6' }).score, 29);
  assert.equal(ok('boey-score', { 'boey-shock': '1', 'boey-delay': '1' }).score, 2);
  // rehab-v240
  assert.equal(ok('esas-symptom-assessment', { 'esas-pain': '5', 'esas-tired': '5', 'esas-drowsy': '5', 'esas-nausea': '5', 'esas-appetite': '5', 'esas-dyspnea': '5', 'esas-depression': '5', 'esas-anxiety': '5', 'esas-wellbeing': '5' }).score, 45);
  assert.equal(ok('rivermead-mobility-index', { 'rmi-count': '10' }).score, 10);
  assert.equal(ok('six-minute-walk-predicted', { 'smwd-sex': 'male', 'smwd-height': '175', 'smwd-age': '60', 'smwd-weight': '80' }).score, 574);
  assert.equal(ok('quickdash', { 'qd-1': '2', 'qd-2': '2', 'qd-3': '2', 'qd-4': '2', 'qd-5': '2', 'qd-6': '2', 'qd-7': '2', 'qd-8': '2', 'qd-9': '2', 'qd-10': '2', 'qd-11': '2' }).score, 25);
  // geri-v241
  assert.equal(ok('groningen-frailty-indicator', { 'gfi-count': '5' }).score, 5);
  assert.equal(ok('short-physical-performance-battery', { 'sppb-balance': '3', 'sppb-gait': '3', 'sppb-chair': '2' }).score, 8);
  assert.equal(ok('osteoporosis-self-assessment-tool', { 'ost-weight': '55', 'ost-age': '70' }).score, -3);
  assert.equal(ok('five-times-sit-to-stand', { 'ftsts-time': '14' }).score, 14);
  // environ-v242
  assert.equal(ok('heat-index', { 'hi-temp': '90', 'hi-rh': '70' }).score, 105.9);
  assert.equal(ok('humidex', { 'hx-temp': '30', 'hx-dew': '20' }).score, 37.6);
  assert.equal(ok('wind-chill', { 'wc-temp': '-10', 'wc-wind': '30' }).score, -19.5);
  assert.equal(ok('wbgt', { 'wbgt-setting': 'outdoor', 'wbgt-nwb': '25', 'wbgt-globe': '35', 'wbgt-dry': '30' }).score, 27.5);
  // entsleep-v243
  assert.equal(ok('nose-scale', { 'nose-cong': '2', 'nose-block': '2', 'nose-breath': '2', 'nose-sleep': '2', 'nose-exert': '2' }).score, 50);
  assert.equal(ok('rfs-reflux-finding', { 'rfs-vent': '2', 'rfs-eryth': '2', 'rfs-vfe': '2', 'rfs-dle': '2' }).score, 8);
  assert.equal(ok('no-apnea-score', { 'na-neck': '41', 'na-age': '50' }).score, 5);
  assert.equal(ok('sleep-efficiency', { 'se-tst': '420', 'se-tib': '480' }).score, 87.5);
  // sportsmsk-v244
  assert.equal(ok('lysholm-knee-score', { 'lys-limp': '5', 'lys-support': '5', 'lys-lock': '15', 'lys-instab': '20', 'lys-pain': '20', 'lys-swell': '10', 'lys-stair': '10', 'lys-squat': '5' }).score, 90);
  assert.equal(ok('marx-activity-rating', { 'marx-run': '4', 'marx-cut': '3', 'marx-dec': '3', 'marx-piv': '2' }).score, 12);
  assert.equal(ok('foot-posture-index', { 'fpi-talar': '1', 'fpi-supra': '1', 'fpi-calc': '1', 'fpi-tn': '1', 'fpi-arch': '1', 'fpi-fore': '1' }).score, 6);
  assert.equal(ok('bess-balance-error', { 'bess-df': '3', 'bess-sf': '3', 'bess-tf': '3', 'bess-dm': '3', 'bess-sm': '3', 'bess-tm': '3' }).score, 18);
  // hemederm-v245
  assert.equal(ok('shine-lal-index', { 'sl-mcv': '70', 'sl-mch': '22' }).score, 1078);
  assert.equal(ok('green-king-index', { 'gk-mcv': '70', 'gk-rdw': '14', 'gk-hb': '11' }).score, 62.4);
  assert.equal(ok('percent-platelet-recovery', { 'ppr-pre': '10', 'ppr-post': '40', 'ppr-bv': '5', 'ppr-tx': '4' }).score, 37.5);
  assert.equal(ok('ihs4', { 'ihs4-nod': '3', 'ihs4-abs': '2', 'ihs4-tun': '1' }).score, 11);
  // ibd-v246
  assert.equal(ok('sccai', { 'sc-day': '2', 'sc-night': '1', 'sc-urg': '1', 'sc-blood': '1', 'sc-well': '1', 'sc-extra': '0' }).score, 6);
  assert.equal(ok('pucai', { 'pu-pain': '5', 'pu-bleed': '10', 'pu-cons': '5', 'pu-num': '10', 'pu-noct': '0', 'pu-act': '5' }).score, 35);
  assert.equal(ok('bbps-boston', { 'bb-right': '2', 'bb-trans': '2', 'bb-left': '2' }).score, 6);
  assert.equal(ok('simplified-aih', { 'aih-auto': '2', 'aih-igg': '1', 'aih-hist': '2', 'aih-viral': '1' }).score, 6);
  // pedstox-v247
  assert.equal(ok('pediatric-trauma-score', { 'pts-wt': '2', 'pts-air': '2', 'pts-sbp': '2', 'pts-cns': '1', 'pts-wound': '2', 'pts-skel': '1' }).score, 10);
  assert.equal(ok('bind-score', { 'bind-ms': '2', 'bind-mt': '2', 'bind-cry': '1' }).score, 5);
  assert.equal(ok('widmark-bac', { 'wid-grams': '56', 'wid-weight': '70', 'wid-hours': '0', 'wid-sex': 'male' }).score, 0.12);
  assert.equal(ok('povoc-ponv', { 'pov-dur': '1', 'pov-age': '1', 'pov-hist': '1' }).score, 3);
  // woundid-v248
  assert.equal(ok('absi-burn', { 'absi-sex': 'female', 'absi-age': '50', 'absi-tbsa': '35', 'absi-inhal': '1', 'absi-ft': '1' }).score, 10);
  assert.equal(ok('sinbad-score', { 'sin-site': '1', 'sin-isch': '1', 'sin-neuro': '1' }).score, 3);
  assert.equal(ok('atlas-cdi', { 'atl-age': '1', 'atl-abx': '2', 'atl-wbc': '1', 'atl-alb': '1', 'atl-cr': '1' }).score, 6);
  assert.equal(ok('increment-cpe', { 'inc-shock': '1', 'inc-pitt': '1' }).score, 9);
  // renalpulm-v249
  assert.equal(ok('renal-failure-index', { 'rfi-una': '10', 'rfi-pcr': '4', 'rfi-ucr': '60' }).score, 0.67);
  assert.equal(ok('feua', { 'feua-uua': '30', 'feua-scr': '1', 'feua-sua': '6', 'feua-ucr': '60' }).score, 8.3);
  assert.equal(ok('bronchodilator-response', { 'bdr-pre': '2.0', 'bdr-post': '2.4', 'bdr-pred': '3.0' }).score, 13.3);
  assert.equal(ok('integrative-weaning-index', { 'iwi-cst': '55', 'iwi-sao2': '97', 'iwi-rsbi': '55' }).score, 97);
  // obgyn-v250
  assert.equal(ok('pearl-index', { 'pi-preg': '2', 'pi-months': '1200' }).score, 2);
  assert.equal(ok('robinson-crl-dating', { 'crl-mm': '30' }).score, 69);
  assert.equal(ok('carpreg-ii', { 'cp-events': '1', 'cp-nyha': '1' }).score, 6);
  assert.equal(ok('malinas-score', { 'mal-par': '1', 'mal-dur': '1', 'mal-con': '1', 'mal-int': '2', 'mal-mem': '1' }).score, 6);
  // cardiometab-v251
  assert.equal(ok('corrected-timi-frame-count', { 'ctfc-frames': '34', 'ctfc-fps': '30', 'ctfc-vessel': 'lad' }).score, 20);
  assert.equal(ok('tpe-qt-ratio', { 'tpe-tpe': '120', 'tpe-qt': '400' }).score, 0.3);
  assert.equal(ok('spise', { 'spise-hdl': '40', 'spise-tg': '150', 'spise-bmi': '30' }).score, 4.6);
  assert.equal(ok('atherogenic-index-of-plasma', { 'aip-tg': '1.7', 'aip-hdl': '1.0' }).score, 0.23);
  // orthospine-v252
  assert.equal(ok('insall-salvati-ratio', { 'is-tendon': '5.0', 'is-patella': '4.0' }).score, 1.25);
  assert.equal(ok('torg-pavlov-ratio', { 'tp-canal': '12', 'tp-body': '17' }).score, 0.71);
  assert.equal(ok('meyerding-spondylolisthesis', { 'my-disp': '14', 'my-width': '40' }).score, 2);
  assert.equal(ok('beighton-hypermobility', { 'bg-f5r': '1', 'bg-f5l': '1', 'bg-thr': '1', 'bg-thl': '1', 'bg-elr': '1' }).score, 5);
  // radmeasure-v253
  assert.equal(ok('nascet-carotid-stenosis', { 'ns-narrow': '3', 'ns-distal': '8' }).score, 62.5);
  assert.equal(ok('helsinki-ct-score', { 'hel-mass': '2', 'hel-ivh': '1', 'hel-cist': '1' }).score, 6);
  assert.equal(ok('genant-vertebral-fracture', { 'ge-loss': '30' }).score, 2);
  assert.equal(ok('testicular-volume', { 'tv-l': '4', 'tv-w': '3', 'tv-h': '2.5' }).score, 21.3);
  // enturopsych-v254
  assert.equal(ok('reflux-symptom-index', { 'rsi-1': '3', 'rsi-2': '3', 'rsi-3': '3', 'rsi-4': '3', 'rsi-5': '3' }).score, 15);
  assert.equal(ok('lund-mackay', { 'lm-maxr': '2', 'lm-aethr': '1', 'lm-omcr': '1', 'lm-maxl': '1' }).score, 6);
  assert.equal(ok('bladder-outlet-obstruction-index', { 'boo-pdet': '80', 'boo-qmax': '10' }).score, 60);
  assert.equal(ok('fagerstrom-ftnd', { 'ftnd-time': '3', 'ftnd-perday': '3' }).score, 6);
  // riskscores-v255
  assert.equal(ok('vcss', { 'vc-pain': '2', 'vc-var': '2', 'vc-edema': '1', 'vc-pig': '1', 'vc-inf': '1' }).score, 7);
  assert.equal(ok('pen-fast', { 'pf-recent': '1', 'pf-anaph': '1' }).score, 4);
  assert.equal(ok('harris-hip-score', { 'hh-pain': '40', 'hh-func': '40', 'hh-def': '4', 'hh-rom': '5' }).score, 89);
  assert.equal(ok('koivuranta-ponv', { 'kv-female': '1', 'kv-prior': '1', 'kv-smoke': '1' }).score, 3);
  // rheumcrit-v256
  assert.equal(ok('mases-enthesitis', { 'ma-cc1r': '1', 'ma-cc1l': '1', 'ma-psisr': '1' }).score, 3);
  assert.equal(ok('mmt8-myositis', { 'mm-neck': '8', 'mm-delt': '8', 'mm-bic': '8', 'mm-wrist': '8', 'mm-gmax': '8', 'mm-gmed': '8', 'mm-quad': '8', 'mm-ankle': '8' }).score, 64);
  assert.equal(ok('intubation-difficulty-scale', { 'ids-attempts': '1', 'ids-cormack': '2' }).score, 2);
  assert.equal(ok('crop-index', { 'crop-cdyn': '50', 'crop-pimax': '30', 'crop-pao2': '80', 'crop-fio2': '0.4', 'crop-paco2': '40', 'crop-rr': '20' }).score, 25.2);
  // dive-v257
  assert.equal(ok('maximum-operating-depth', { 'mod-fo2': '0.32', 'mod-po2': '1.4' }).score, 33.8);
  assert.equal(ok('equivalent-air-depth', { 'ead-depth': '30', 'ead-fo2': '0.32' }).score, 24.4);
  assert.equal(ok('oxygen-toxicity-units', { 'otu-po2': '1.4', 'otu-time': '30' }).score, 48.9);
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

// Wave 53 (deferral cleanup): flat, bespoke-array, and site-branched adapters.
test('lib wave-53 deferral-cleanup worked calls', () => {
  // Flat enum/number pass-through.
  assert.equal(ok('phases', { 'ph-pop': 'finnish', 'ph-htn': true, 'ph-age': '72', 'ph-size': '12', 'ph-sah': true, 'ph-site': 'acaPcomPost' }).total, 18);
  assert.equal(ok('hear', { 'hr-hist': 'h1', 'hr-ecg': 'e1', 'hr-age': '58', 'hr-risk': 'r1' }).total, 4);
  assert.equal(ok('wagner-dfu', { 'wagner-grade': '3' }).grade, 3);
  assert.equal(ok('university-texas-dfu', { 'ut-grade': '2', 'ut-stage': 'B' }).cell, 'IIB');
  assert.equal(ok('doloplus-2', {
    'dolo-complaints': '2', 'dolo-posture': '1', 'dolo-protection': '1', 'dolo-facial': '1', 'dolo-sleep': '0',
    'dolo-washing': '0', 'dolo-mobility': '0', 'dolo-communication': '0', 'dolo-social': '0', 'dolo-behavior': '0',
  }).total, 5);
  // Per-region default toArgs (absent regions default to 0 in the lib).
  assert.equal(ok('pasi', {
    'pasi-head-e': '2', 'pasi-head-i': '2', 'pasi-head-d': '2', 'pasi-head-area': '25',
    'pasi-upper-e': '1', 'pasi-upper-i': '1', 'pasi-upper-d': '1', 'pasi-upper-area': '5',
    'pasi-lower-e': '3', 'pasi-lower-i': '3', 'pasi-lower-d': '3', 'pasi-lower-area': '60',
  }).score, 16.2);
  assert.equal(ok('dlqi', {
    'dlqi-q1': '2', 'dlqi-q2': '1', 'dlqi-q3': '1', 'dlqi-q4': '1', 'dlqi-q5': '1',
    'dlqi-q6': '0', 'dlqi-q7': '0', 'dlqi-q8': '0', 'dlqi-q9': '0', 'dlqi-q10': '0',
  }).score, 6);
  // Bespoke toArgs rebuilds variable-length arrays from flat fields.
  assert.equal(ok('pospom', { 'pospom-age': '70', 'pospom-surg': 'major-gi', 'pospom-cancer': '1' }).total, 30);
  assert.equal(ok('ses-cd', {
    'se-us-il': '2', 'se-uf-il': '2', 'se-af-il': '3', 'se-st-il': '1',
    'se-us-rc': '1', 'se-uf-rc': '1', 'se-af-rc': '2',
  }).total, 12);
  assert.equal(ok('kawasaki-criteria', {
    'kaw-fever': '6', 'kaw-p-conjunctivitis': '1', 'kaw-p-oral': '1', 'kaw-p-lymphadenopathy': '1', 'kaw-p-extremity': '1',
  }).pathway, 'classic');
  assert.equal(ok('catch-head', { 'catch-h-gcs': '1' }).indicated, true);
  // Site-branched: the compute reads only the selected site's findings.
  assert.equal(ok('mcgeer-criteria', { 'mcg-site': 'uti-no-catheter', 'mcg-acuteDysuria': '1', 'mcg-voidedCulture': '1' }).meets, true);
  assert.equal(ok('loeb-minimum-criteria', { 'loeb-site': 'uti-no-catheter', 'loeb-acuteDysuria': '1' }).met, true);
});

test('lib/clinical.js foundational-core worked calls (wave 54)', () => {
  assert.equal(ok('bmi', { w: '70', h: '1.75' }).bmi, 22.9);
  assert.equal(ok('map', { s: '120', d: '80' }), 93.3);
  assert.equal(ok('anion-gap', { na: '140', cl: '100', hco3: '24', alb: '4' }).anionGap, 16);
  // Composite wrappers return each formula under one result object.
  const bsa = ok('bsa', { w: '70', h: '175' });
  assert.equal(bsa.duBois, 1.85);
  assert.equal(bsa.mosteller, 1.84);
  const es = ok('egfr-suite', { 'es-scr': '1.0', 'es-age': '60', 'es-w': '70', 'es-sex': 'M' });
  assert.equal(es.ckdEpi2021, 86.2);
  // Positional convert() wrapper echoes the inputs.
  assert.equal(Math.round(ok('unit-converter', { kind: 'weight', val: '70', from: 'kg', to: 'lb' }).converted), 154);
});

test('lib/clinical-v4/v8 suites and drips worked calls (wave 54)', () => {
  assert.equal(ok('shock-index', { 'si-sbp': '120', 'si-dbp': '80', 'si-hr': '110' }).map, 93.3);
  assert.equal(ok('fena-feurea', { 'fn-una': '20', 'fn-pna': '140', 'fn-ucr': '50', 'fn-pcr': '2.0', 'fu-uu': '300', 'fu-pu': '60' }).feUreaPct, 20);
  // apap ceiling: sum the source products, then compare to the ceiling.
  assert.equal(ok('apap-24h-max', { 'apap-d1': '650', 'apap-n1': '4', 'apap-d2': '325', 'apap-n2': '4', 'apap-d3': '0', 'apap-n3': '0', 'apap-ceiling': '4000' }).totalMg, 3900);
  // o2 cylinder: size letter maps through the lib's tank-factor table.
  assert.equal(ok('o2-cylinder-duration', { 'o2-size': 'E', 'o2-psi': '2000', 'o2-flow': '2', 'o2-res': '200' }).minutesRemaining, 252);
});

test('lib/scoring and medication tables worked calls (wave 54)', () => {
  assert.equal(ok('mgap', { 'mgap-mech': 'blunt', 'mgap-gcs': '15', 'mgap-age': 'lt60', 'mgap-sbp': '120' }).score, 27);
  // Data-table equivalence read from the shipped data/ shard.
  assert.equal(ok('steroid-equiv', { 'st-dose': '5', 'st-from': 'prednisone', 'st-to': 'methylprednisolone' }).equivalentMg, 4);
  assert.equal(ok('benzo-equiv', { 'bz-dose': '10', 'bz-from': 'diazepam', 'bz-to': 'lorazepam' }).equivalentMg, 1);
  // Beers: medication/comorbidity arrays rebuilt from the flat booleans.
  assert.equal(ok('beers-check', { 'bc-age': '78', 'bc-m-benzodiazepine': '1', 'bc-m-opioid': '1', 'bc-c-history-of-falls': '1' }).pimFlags.length, 2);
  // Ballard: two six-element maturity arrays rebuilt from the flat selects.
  assert.equal(ok('ballard', {
    'bl-n1': '3', 'bl-n2': '3', 'bl-n3': '3', 'bl-n4': '3', 'bl-n5': '3', 'bl-n6': '3',
    'bl-p1': '3', 'bl-p2': '3', 'bl-p3': '3', 'bl-p4': '3', 'bl-p5': '3', 'bl-p6': '3',
  }).score, 36);
});

test('lib/clinical.js Group G scoring core worked calls (wave 55)', () => {
  const g = ok('gcs', { eye: '3', verbal: '4', motor: '5' });
  assert.equal(g.total, 12);
  assert.equal(g.severity, 'Moderate');
  assert.equal(ok('apgar', { appearance: '2', pulse: '2', grimace: '2', activity: '2', respiration: '2' }).total, 10);
  // Metabolic acidosis with the Winter-formula compensation window in the note.
  const a = ok('abg', { pH: '7.30', paco2: '30', hco3: '14' });
  assert.equal(a.primary, 'Metabolic acidosis');
  assert.match(a.compensation, /expected PaCO2 27 to 31/);
  // Optional oxygenation inputs add the A-a gradient and P/F ratio.
  const a2 = ok('abg', { pH: '7.30', paco2: '30', hco3: '14', pao2: '90', fio2: '0.5' });
  assert.equal(a2.pfRatio, 180);
  assert.equal(ok('wells-pe', { peLikely: '1', hrOver100: '1' }).total, 4.5);
  const wd = ok('wells-dvt', { tendernessAlongVeins: '1', entireLegSwollen: '1', calfSwellingGt3cm: '1' });
  assert.equal(wd.total, 3);
  assert.equal(wd.category, 'High probability');
  // The -2 alternative-diagnosis item subtracts.
  assert.equal(ok('wells-dvt', { activeCancer: '1', alternativeDxAsLikely: '1' }).total, -1);
  const c = ok('chads', { hypertension: '1', ageGte65: '1', diabetes: '1' });
  assert.equal(c.total, 3);
  assert.equal(c.ageGte75Points, 2);
  assert.equal(ok('hasbled', { hypertension: '1', ageGt65: '1' }).risk, 'Moderate');
  const n = ok('nihss', { '1a': '1', '4': '1', '5': '2', '9': '1' });
  assert.equal(n.total, 5);
  assert.equal(n.severity, 'Moderate stroke');
});

test('lib/scoring-v4.js Group G ED decision core worked calls (wave 56)', () => {
  assert.equal(ok('timi', { 'tm-age': '1', 'tm-rf': '1', 'tm-asa': '1' }).score, 3);
  // GRACE bands: age 70 (75) + HR 95 (15) + SBP 115 (43) + Cr 1.2 (10) + Killip 1 (0).
  assert.equal(ok('grace', { 'gr-age': '70', 'gr-hr': '95', 'gr-sbp': '115', 'gr-cr': '1.2', 'gr-killip': '1' }).score, 143);
  const h = ok('heart', { 'h-hist': '1', 'h-ekg': '0', 'h-age': '1', 'h-rf': '1', 'h-trop': '0' });
  assert.equal(h.score, 3);
  assert.match(h.band, /Low/);
  const p = ok('perc', { 'pc-age': '1' });
  assert.equal(p.score, 1);
  assert.equal(p.cutoffs.ageYears, 50);
  // Composite: Wells alt-dx (3) + HR (1.5) = 4.5; Geneva HR 105 scores 5.
  const wg = ok('wells-pe-geneva', { 'wp-alt': '1', 'wp-hr': '1', 'gv-hr': '105' });
  assert.equal(wg.wells.score, 4.5);
  assert.equal(wg.geneva.score, 5);
  assert.equal(wg.firedWellsPoints.alternativeDxLessLikely, 3);
  const cu = ok('curb-65', { 'cu-conf': '1', 'cu-age': '1' });
  assert.equal(cu.score, 2);
  assert.equal(cu.ageCutoffYears, 65);
  // PSI: age 70 + RR >= 30 (+20) = 90, Class III.
  const psi = ok('psi', { 'ps-age': '70', 'ps-sex': 'M', 'ps-rr': '1' });
  assert.equal(psi.score, 90);
  assert.match(psi.band, /Class III/);
  const qs = ok('qsofa-sofa', { 'q-rr': '1', 'q-am': '1', 's-resp': '1', 's-cv': '1' });
  assert.equal(qs.qsofa.score, 2);
  assert.equal(qs.sofa.score, 2);
  const mc = ok('meld-childpugh', { 'm-bili': '2.0', 'm-inr': '1.5', 'm-cr': '1.3', 'm-na': '135', 'm-alb': '3.0', 'm-sex': 'M', 'cp-asc': 'mild', 'cp-enc': 'none' });
  assert.equal(mc.meld.score, 18);
  assert.equal(mc.childPugh.score, 8);
  assert.match(mc.childPugh.band, /Class B/);
  const rb = ok('ranson-bisap', { 'r-age': '1', 'r-wbc': '1', 'b-bun': '1', 'b-age': '1' });
  assert.equal(rb.ranson.score, 2);
  assert.equal(rb.bisap.score, 2);
  // McIsaac: Centor 4 + age-12 modifier (+1) = 5.
  const ce = ok('centor', { 'ce-exud': '1', 'ce-aden': '1', 'ce-fever': '1', 'ce-cough': '1', 'ce-age': '12' });
  assert.equal(ce.centor.score, 4);
  assert.equal(ce.mcisaac.score, 5);
  assert.equal(ce.mcisaac.ageModifier, 1);
  const wc = ok('wells-dvt-caprini', { 'wd-tender': '1', 'wd-leg': '1', 'wd-calf': '1', 'cap-pts': '5' });
  assert.equal(wc.wellsDvt.total, 3);
  assert.equal(wc.caprini.score, 5);
  assert.match(wc.caprini.band, /High/);
  assert.equal(ok('bishop', { 'bp-d': '3', 'bp-e': '60', 'bp-s': '-1', 'bp-c': 'medium', 'bp-p': 'anterior' }).score, 9);
  const ap = ok('alvarado-pas', { 'a-mig': '1', 'a-anx': '1', 'a-rlq': '1', 'a-wbc': '1', 'p-rlq': '1', 'p-mig': '1', 'p-wbc': '1' });
  assert.equal(ap.alvarado.score, 6);
  assert.equal(ap.pas.score, 4);
});

test('lib/scoring-v4.js ICU bedside / early-warning cluster worked calls (wave 57)', () => {
  // NEWS2: RR 24 (2) + SpO2 93 Scale 1 (2) + on O2 (2) + SBP 100 (2) = 8, high band.
  const n2 = ok('news2', { 'n2-rr': '24', 'n2-spo2': '93', 'n2-o2': '1', 'n2-sbp': '100', 'n2-pulse': '80', 'n2-acvpu': 'A', 'n2-temp': '37.0' });
  assert.equal(n2.score, 8);
  assert.match(n2.band, /High/);
  assert.equal(n2.parts.supplementalO2, 2);
  // MEWS: SBP 85 (1) + pulse 115 (2) + RR 25 (2) + V (1) = 6.
  const me = ok('mews', { 'me-sbp': '85', 'me-pulse': '115', 'me-rr': '25', 'me-temp': '37.0', 'me-avpu': 'V' });
  assert.equal(me.score, 6);
  const si = ok('sirs', { 'sr-temp': '1', 'sr-hr': '1' });
  assert.equal(si.count, 2);
  assert.equal(si.sirsPositive, true);
  const kp = ok('killip', { 'kp-class': '3' });
  assert.equal(kp.inHospitalMortalityPct, 38);
  // MODS: P/F 140 (3) + platelets 60 (2) + GCS 9 (3) = 8.
  const mo = ok('mods', { 'mods-pf': '140', 'mods-cr': '1.0', 'mods-bili': '1.0', 'mods-par': '8', 'mods-plt': '60', 'mods-gcs': '9' });
  assert.equal(mo.score, 8);
  assert.equal(mo.parts.neurologic, 3);
  const rs = ok('rass', { 'rs-level': '-3' });
  assert.equal(rs.level, -3);
  assert.match(rs.band, /deeper than/);
  assert.match(ok('sas-riker', { 'sk-level': '3' }).band, /light-sedation goal/);
  assert.equal(ok('cam-icu', { 'ci-f1': '1', 'ci-f2': '1', 'ci-f4': '1' }).positive, true);
  assert.equal(ok('cam-icu', { 'ci-f1': '1', 'ci-f2': '1' }).positive, false);
  const ic = ok('icdsc', { 'id-a': '1', 'id-b': '1', 'id-c': '1', 'id-d': '1' });
  assert.equal(ic.score, 4);
  assert.equal(ic.delirium, true);
  // 4AT: abnormal alertness (4) + 1 AMT4 error (1) = 5.
  const fa = ok('4at', { 'fa-alert': '1', 'fa-amt': '1', 'fa-att': '0', 'fa-acute': '0' });
  assert.equal(fa.score, 5);
  const cp = ok('cpot', { 'cp-f': '2', 'cp-b': '1', 'cp-m': '1', 'cp-c': '0' });
  assert.equal(cp.score, 4);
  assert.equal(cp.unacceptablePain, true);
  const bp = ok('bps', { 'bp-f': '3', 'bp-u': '2', 'bp-v': '2' });
  assert.equal(bp.score, 7);
  assert.equal(bp.unacceptablePain, true);
});

test('lib/scoring-v4.js cognition / withdrawal / sleep / periop worked calls (wave 58)', () => {
  const mc = ok('mini-cog', { 'mc-w': '2', 'mc-clock': '1' });
  assert.equal(mc.score, 4);
  assert.equal(mc.maxScore, 5);
  assert.match(ok('mini-cog', { 'mc-w': '2', 'mc-clock': '0' }).band, /Positive screen/);
  // CIWA-Ar: 2+2+2+2+1+1 = 10, moderate 8-15 band.
  const cw = ok('ciwa', { 'cw-nau': '2', 'cw-tre': '2', 'cw-swt': '2', 'cw-anx': '2', 'cw-agi': '1', 'cw-tac': '0', 'cw-aud': '0', 'cw-vis': '0', 'cw-hea': '1', 'cw-ori': '0' });
  assert.equal(cw.score, 10);
  assert.match(cw.band, /Moderate/);
  const co = ok('cows', { 'co-pul': '1', 'co-swt': '2', 'co-rest': '1', 'co-pup': '1', 'co-jt': '2', 'co-rn': '2', 'co-gi': '2', 'co-tre': '1', 'co-yaw': '1', 'co-anx': '2', 'co-goose': '0' });
  assert.equal(co.score, 15);
  assert.match(co.band, /Moderate withdrawal/);
  const ep = ok('epworth', { 'ep-read': '2', 'ep-tv': '2', 'ep-pub': '1', 'ep-car': '2', 'ep-lying': '3', 'ep-talk': '0', 'ep-lunch': '2', 'ep-traffic': '0' });
  assert.equal(ep.score, 12);
  assert.match(ep.band, /mild excessive/);
  const sb = ok('stop-bang', { 'sb-s': '1', 'sb-t': '1', 'sb-o': '1', 'sb-p': '1', 'sb-a': '1' });
  assert.equal(sb.score, 5);
  assert.match(sb.band, /high risk/);
  // Berlin: cat1 positive (2 of 5) + cat3 positive (htn) = high risk.
  const bo = ok('berlin-osa', { 'bo-q1': '1', 'bo-q2': '1', 'bo-htn': '1' });
  assert.equal(bo.cat1Positive, true);
  assert.equal(bo.highRisk, true);
  assert.match(ok('apfel', { 'ap-female': '1', 'ap-nonsmoker': '1', 'ap-hx': '1', 'ap-opioid': '1' }).band, /~80%/);
  const al = ok('aldrete', { 'al-act': '2', 'al-resp': '2', 'al-circ': '2', 'al-cons': '2', 'al-o2': '1' });
  assert.equal(al.score, 9);
  assert.equal(al.readyForDischarge, true);
  const le = ok('lemon', { 'le-look': '1', 'le-incisor': '1', 'le-hyoid': '1', 'le-mp': '1' });
  assert.equal(le.score, 4);
  assert.equal(le.threeThreeTwo, 2);
  // White-Song: 13 points but one domain at 0 -> not fast-track eligible.
  const ws = ok('white-song', { 'ws-loc': '2', 'ws-act': '2', 'ws-hd': '2', 'ws-resp': '2', 'ws-o2': '2', 'ws-pain': '2', 'ws-eme': '0' });
  assert.equal(ws.score, 12);
  assert.equal(ws.fastTrackEligible, false);
});

test('lib/scoring-v4.js GI-bleed / readmission / comorbidity / performance worked calls (wave 59)', () => {
  // GBS: BUN 30 (points) + Hgb 11 male (3) + SBP 95 (3) + melena (1) + syncope (2).
  const gb = ok('gbs', { 'gb-bun': '30', 'gb-hgb': '11', 'gb-sex': 'M', 'gb-sbp': '95', 'gb-pulse': '0', 'gb-mel': '1', 'gb-syn': '1', 'gb-hep': '0', 'gb-cf': '0' });
  assert.ok(gb.score > 0);
  assert.equal(gb.parts.syncope, 2);
  // Complete Rockall: age 2 + shock 2 + comorbidity 2 + dx 2 + stigmata 2 = 10.
  const rk = ok('rockall', { 'rk-age': '2', 'rk-shock': '2', 'rk-co': '2', 'rk-dx': '2', 'rk-stig': '2', 'rk-pre': '0' });
  assert.equal(rk.score, 10);
  assert.equal(rk.preEndoscopy, false);
  // Pre-endoscopy variant drops dx + stigmata: 2 + 2 + 2 = 6.
  assert.equal(ok('rockall', { 'rk-age': '2', 'rk-shock': '2', 'rk-co': '2', 'rk-dx': '2', 'rk-stig': '2', 'rk-pre': '1' }).score, 6);
  const am = ok('aims65', { 'am-alb': '1', 'am-inr': '1', 'am-am': '0', 'am-sbp': '0', 'am-age': '1' });
  assert.equal(am.score, 3);
  const ok59 = ok('oakland', { 'ok-age': '35', 'ok-sex': 'F', 'ok-prior': '0', 'ok-dre': '0', 'ok-hr': '65', 'ok-sbp': '165', 'ok-hgb': '17' });
  assert.equal(ok59.score, 0);
  const ml = ok('maddrey-lille', { 'ml-pt': '20', 'ml-ctrl': '12', 'ml-bili': '10', 'ml-age': '50', 'ml-alb': '3.0', 'ml-cr': '0.9', 'ml-b0': '10', 'ml-b7': '6', 'ml-ptl': '20' });
  assert.equal(Math.round(ml.maddrey.df * 10) / 10, 46.8);
  assert.ok(ml.lille.score > 0 && ml.lille.score < 1);
  assert.equal(ok('cthr', { 'ct-hr': '1', 'ct-mr': '0' }).ctRecommended, true);
  assert.equal(ok('cthr', { 'ct-hr': '0', 'ct-mr': '0' }).ctRecommended, false);
  assert.equal(ok('ccsr', { 'cs-hr': '0', 'cs-lr': '1', 'cs-rot': '1' }).imagingRecommended, false);
  assert.equal(ok('ccsr', { 'cs-hr': '0', 'cs-lr': '0', 'cs-rot': '1' }).imagingRecommended, true);
  // HOSPITAL: onc (2) + LOS (2) + hgb (1) = 5, intermediate.
  const hs = ok('hospital-score', { 'hs-hgb': '1', 'hs-onc': '1', 'hs-na': '0', 'hs-proc': '0', 'hs-urg': '0', 'hs-prior': '0', 'hs-los': '1' });
  assert.equal(hs.score, 5);
  assert.match(hs.band, /intermediate/);
  // LACE: LOS 7 (5) + acute (3) + Charlson 2 (2) + ED 1 (1) = 11, high.
  const lc = ok('lace', { 'lc-los': '7', 'lc-acute': '1', 'lc-charlson': '2', 'lc-ed': '1' });
  assert.equal(lc.score, 11);
  assert.match(lc.band, /high risk/);
  // Charlson: MI (1) + CHF (1) + age 75 adjustment (3) = 5.
  const ch = ok('charlson', { 'ch-age': '75', 'ch-mi': '1', 'ch-chf': '1' });
  assert.equal(ch.comorbidity, 2);
  assert.equal(ch.ageAdj, 3);
  assert.equal(ch.score, 5);
  // Severity dominance: end-organ diabetes drops the uncomplicated-diabetes point.
  assert.equal(ok('charlson', { 'ch-age': '40', 'ch-dm': '1', 'ch-dm-end': '1' }).comorbidity, 2);
  const cf = ok('cfs', { 'cf-level': '7' });
  assert.equal(cf.level, 7);
  assert.match(cf.band, /severe frailty/);
  const ek = ok('ecog-karnofsky', { 'ek-ecog': '2', 'ek-kps': '60' });
  assert.equal(ek.ecog, 2);
  assert.equal(ek.kps, 60);
  assert.equal(ek.suggestedKps, 60);
});

test('lib/scoring-v4.js VTE / anticoagulation bleeding + risk worked calls (wave 60)', () => {
  // PESI: age 70 + cancer (30) + HR>=110 (20) = 120, Class IV.
  const pe = ok('pesi', { 'pe-age': '70', 'pe-sex': 'F', 'pe-ca': '1', 'pe-hr': '1', 'pe-sbp': '0', 'pe-rr': '0', 'pe-tmp': '0', 'pe-ams': '0', 'pe-sao2': '0', 'pe-hf': '0', 'pe-cld': '0' });
  assert.equal(pe.score, 120);
  assert.equal(pe.class, 'IV');
  assert.equal(ok('spesi', { 'sp-age80': '1', 'sp-ca': '1', 'sp-ccp': '0', 'sp-hr': '0', 'sp-sbp': '0', 'sp-sao2': '0' }).score, 2);
  // Padua: active cancer (3) + reduced mobility (3) = 6, high risk.
  const pa = ok('padua', { 'pa-ca': '1', 'pa-mob': '1', 'pa-vte': '0', 'pa-thr': '0', 'pa-trauma': '0', 'pa-age': '0', 'pa-hf': '0', 'pa-mi': '0', 'pa-inf': '0', 'pa-bmi': '0', 'pa-horm': '0' });
  assert.equal(pa.score, 6);
  const at = ok('atria-bleeding', { 'at-an': '1', 'at-ag': '1', 'at-rn': '0', 'at-bl': '0', 'at-ht': '0' });
  assert.equal(at.score, 5);
  assert.match(at.band, /high/);
  const ob = ok('orbit-bleeding', { 'ob-hb': '1', 'ob-bh': '1', 'ob-age': '0', 'ob-ri': '0', 'ob-ap': '0' });
  assert.equal(ob.score, 4);
  const hh = ok('hemorr2hages', { 'hh-reb': '1', 'hh-old': '1', 'hh-hr': '0', 'hh-et': '0', 'hh-mal': '0', 'hh-plt': '0', 'hh-htn': '0', 'hh-an': '0', 'hh-gen': '0', 'hh-fall': '0', 'hh-stk': '0' });
  assert.equal(hh.score, 3);
  // IMPROVE-Bleeding: active ulcer (4.5) + age 40-84 (1.5) + severe renal (2.5) = 8.5, high.
  const ib = ok('improve-bleeding', { 'ib-ulcer': '1', 'ib-age': '40-84', 'ib-renal': 'severe', 'ib-bleed3': '0', 'ib-plt': '0', 'ib-hep': '0', 'ib-icu': '0', 'ib-cvc': '0', 'ib-rheum': '0', 'ib-cancer': '0', 'ib-male': '0' });
  assert.equal(ib.score, 8.5);
  assert.equal(ib.highBleedingRisk, true);
  const iv = ok('improve-vte', { 'iv-prior': '1', 'iv-cancer': '1', 'iv-thr': '0', 'iv-para': '0', 'iv-immob': '0', 'iv-icu': '0', 'iv-age60': '0' });
  assert.equal(iv.score, 5);
  // Khorana: very-high site (2) + platelets (1) = 3, high.
  const kh = ok('khorana', { 'kh-site': 'very-high', 'kh-plt': '1', 'kh-hb': '0', 'kh-wbc': '0', 'kh-bmi': '0' });
  assert.equal(kh.score, 3);
  assert.match(kh.band, /high/);
  // DASH: D-dimer (2) + male (1) - hormone (2) = 1, low.
  const da = ok('dash-vte', { 'da-dd': '1', 'da-male': '1', 'da-horm': '1', 'da-age': '0' });
  assert.equal(da.score, 1);
  const hd = ok('herdoo2', { 'hd-legs': '1', 'hd-dd': '1', 'hd-bmi': '0', 'hd-age': '0' });
  assert.equal(hd.score, 2);
  assert.equal(hd.canDiscontinue, false);
  const ft = ok('four-ts', { '4t-thr': '2', '4t-time': '2', '4t-throm': '1', '4t-oth': '1' });
  assert.equal(ft.score, 6);
  assert.match(ft.band, /high/);
  // ISTH DIC: gate met, platelets <50 (2) + strong marker (3) = 5, overt DIC.
  const id = ok('isth-dic', { 'id-gate': '1', 'id-plt': '<50', 'id-fdp': 'strong', 'id-pt': '<3s', 'id-fib': '>1' });
  assert.equal(id.score, 5);
  assert.equal(id.overtDic, true);
  // Gate not met short-circuits.
  assert.equal(ok('isth-dic', { 'id-gate': '0', 'id-plt': '<50', 'id-fdp': 'strong', 'id-pt': '>6s', 'id-fib': '<=1' }).gateNotMet, true);
  // DAPT: CHF (2) + vein graft (2) - age>=75 (2) = 2, favors extended DAPT.
  const dp = ok('dapt-score', { 'dp-age': '>=75', 'dp-chf': '1', 'dp-vgp': '1', 'dp-mi': '0', 'dp-prior': '0', 'dp-dm': '0', 'dp-stent': '0', 'dp-pac': '0', 'dp-smoke': '0' });
  assert.equal(dp.score, 2);
  assert.equal(dp.favorsExtendedDapt, true);
});

test('lib/scoring-v4.js obstetric / maternal cluster worked calls (wave 61)', () => {
  assert.equal(ok('bpp', { 'bp-fb': '1', 'bp-fm': '1', 'bp-ft': '1', 'bp-af': '1', 'bp-nst': '0' }).score, 8);
  const sp = ok('acog-severe-pre', { 'sp-bp': '1', 'sp-plt': '0', 'sp-hep': '0', 'sp-cr': '0', 'sp-pulm': '0', 'sp-neuro': '0' });
  assert.equal(sp.severe, true);
  assert.equal(sp.featuresPresent, 1);
  // Complete HELLP with a platelet nadir of 40 -> Mississippi class 1.
  const hl = ok('hellp', { 'hl-hem': '1', 'hl-ast': '1', 'hl-plt': '1', 'hl-nadir': '40' });
  assert.equal(hl.complete, true);
  assert.equal(hl.mississippiClass, 1);
  // Empty nadir (the example) leaves the class null.
  assert.equal(ok('hellp', { 'hl-hem': '0', 'hl-ast': '0', 'hl-plt': '0', 'hl-nadir': '' }).mississippiClass, null);
  // Carpenter-Coustan: fasting 100 (>=95) and 2-h 160 (>=155) exceed -> 2 -> GDM.
  const cc = ok('carpenter-coustan', { 'cc-f': '100', 'cc-1h': '160', 'cc-2h': '160', 'cc-3h': '120' });
  assert.equal(cc.exceeded, 2);
  assert.equal(cc.gdm, true);
  // IADPSG: fasting 95 (>=92) exceeds -> 1 -> GDM.
  assert.equal(ok('iadpsg', { 'ia-f': '95', 'ia-1h': '160', 'ia-2h': '140' }).gdm, true);
  const mw = ok('meows', { 'mw-rr': '16', 'mw-spo2': '98', 'mw-temp': '37.0', 'mw-sbp': '118', 'mw-dbp': '72', 'mw-hr': '82', 'mw-neuro': 'A', 'mw-pain': '0' });
  assert.equal(mw.trigger, false);
  // A red vital triggers.
  assert.equal(ok('meows', { 'mw-rr': '32', 'mw-spo2': '98', 'mw-temp': '37.0', 'mw-sbp': '118', 'mw-dbp': '72', 'mw-hr': '82', 'mw-neuro': 'A', 'mw-pain': '0' }).trigger, true);
});

test('lib/scoring-v4.js pediatric fever / sepsis + respiratory worked calls (wave 62)', () => {
  // All 7 Rochester criteria met -> low risk.
  const rc = ok('rochester', { 'rc-age': '1', 'rc-term': '1', 'rc-focal': '1', 'rc-wbc': '1', 'rc-bands': '1', 'rc-urine': '1', 'rc-stool': '1' });
  assert.equal(rc.lowRisk, true);
  assert.equal(rc.metCount, 7);
  assert.equal(ok('philadelphia', { 'ph-age': '1', 'ph-well': '1', 'ph-wbc': '1', 'ph-bnr': '1', 'ph-ua': '1', 'ph-csf': '1', 'ph-cxr': '0', 'ph-stool': '1' }).lowRisk, false);
  assert.equal(ok('boston-febrile', { 'bf-age': '1', 'bf-well': '1', 'bf-focal': '1', 'bf-wbc': '1', 'bf-ua': '1', 'bf-csf': '1', 'bf-cxr': '1' }).lowRisk, true);
  // Step-by-Step: age <= 21 days -> high, reason from step 2.
  const ss = ok('step-by-step', { 'ss-unwell': '0', 'ss-age': '1', 'ss-ua': '0', 'ss-pct': '0', 'ss-crp': '0' });
  assert.equal(ss.risk, 'high');
  // Only CRP/ANC positive -> intermediate.
  assert.equal(ok('step-by-step', { 'ss-unwell': '0', 'ss-age': '0', 'ss-ua': '0', 'ss-pct': '0', 'ss-crp': '1' }).risk, 'intermediate');
  // YOS: three items at 5, three at 1 -> 18, high band.
  const yo = ok('yos', { 'yo-cry': '5', 'yo-react': '5', 'yo-state': '5', 'yo-color': '1', 'yo-hydr': '1', 'yo-social': '1' });
  assert.equal(yo.score, 18);
  assert.match(yo.band, /HIGH/);
  // Westley: cyanosis at rest (5) + stridor at rest (2) + severe retractions (3) = 10, severe.
  const wc = ok('westley', { 'wc-loc': '0', 'wc-cyan': '5', 'wc-stri': '2', 'wc-air': '0', 'wc-retr': '3' });
  assert.equal(wc.score, 10);
  assert.match(wc.band, /severe/);
  // PRAM: suprasternal (2) + air entry 3 + wheezing 3 = 8, severe.
  const pr = ok('pram-asthma', { 'pr-supra': '2', 'pr-scal': '0', 'pr-air': '3', 'pr-wheez': '3', 'pr-spo2': '0' });
  assert.equal(pr.score, 8);
  assert.match(pr.band, /severe/);
  const pa = ok('pass-asthma', { 'pa-wh': '2', 'pa-wob': '2', 'pa-exp': '1' });
  assert.equal(pa.score, 5);
  assert.match(pa.band, /severe/);
  // Peds GCS: eye 2 + verbal 2 + motor 4 = 8, severe.
  const pg = ok('peds-gcs', { 'pg-eye': '2', 'pg-verb': '2', 'pg-mot': '4', 'pg-age': 'under-2' });
  assert.equal(pg.score, 8);
  assert.equal(pg.severity, 'severe');
  // Nigrovic: Gram stain (2) alone -> not low risk.
  const ni = ok('nigrovic', { 'ni-gram': '1', 'ni-csf-anc': '0', 'ni-prot': '0', 'ni-anc': '0', 'ni-sz': '0' });
  assert.equal(ni.score, 2);
  assert.equal(ni.veryLowRisk, false);
});

test('lib/scoring-v4.js falls-risk + neuro-assessment worked calls (wave 63)', () => {
  const br = ok('braden', { 'br-sens': '2', 'br-moist': '2', 'br-act': '2', 'br-mob': '2', 'br-nutr': '2', 'br-fric': '2' });
  assert.equal(br.score, 12);
  assert.equal(br.band, 'high risk');
  // Morse: history (25) + impaired gait (20) + furniture aid (30) = 75, high.
  const mf = ok('morse-falls', { 'mf-hist': '1', 'mf-sec': '0', 'mf-aid': 'furniture', 'mf-iv': '0', 'mf-gait': 'impaired', 'mf-ms': 'oriented' });
  assert.equal(mf.score, 75);
  assert.equal(mf.band, 'high');
  // Hendrich II: confusion (4) + unable get-up (4) = 8, high.
  const hii = ok('hendrich-ii', { 'hii-conf': '1', 'hii-gug': 'unable' });
  assert.equal(hii.score, 8);
  assert.equal(hii.highRisk, true);
  assert.equal(ok('cam', { 'cam-f1': '1', 'cam-f2': '1', 'cam-f3': '1' }).positive, true);
  assert.equal(ok('cam', { 'cam-f1': '1', 'cam-f2': '0' }).positive, false);
  // ICH: GCS 5 (1) + age 82 (1) + vol 40 (1) + IVH (1) = 4, 97% mortality.
  const ich = ok('ich-score', { 'ich-gcs': '5', 'ich-age': '82', 'ich-vol': '40', 'ich-infra': '0', 'ich-ivh': '1' });
  assert.equal(ich.score, 4);
  assert.equal(ich.mortality30d, '97%');
  // Hunt-Hess grade III, GCS 13 with focal deficit -> WFNS 3.
  const hh = ok('hunt-hess-wfns', { 'hh-grade': '3', 'hh-gcs': '13', 'hh-focal': '1' });
  assert.equal(hh.huntHess, 3);
  assert.equal(hh.wfns, 3);
  // mNIHSS: gaze 2 + arm-left 4 + language 2 = 8, moderate.
  const mn = ok('mnihss', { 'mn-gaze': '2', 'mn-arm-l': '4', 'mn-lang': '2' });
  assert.equal(mn.total, 8);
  assert.equal(mn.severity, 'moderate stroke');
  const fs = ok('four-score', { 'fs-eye': '2', 'fs-motor': '3', 'fs-brain': '4', 'fs-resp': '3' });
  assert.equal(fs.score, 12);
});

test('lib/scoring-v4.js pediatric / ICU pain, sedation, withdrawal worked calls (wave 64)', () => {
  const fl = ok('flacc', { 'fl-face': '2', 'fl-legs': '1', 'fl-act': '2', 'fl-cry': '2', 'fl-cons': '1' });
  assert.equal(fl.score, 8);
  assert.equal(fl.band, 'severe pain');
  assert.equal(ok('painad', { 'pa-br': '1', 'pa-vo': '1', 'pa-fa': '0', 'pa-bl': '0', 'pa-cons': '0' }).score, 2);
  const ni = ok('nips', { 'ni-face': '1', 'ni-cry': '2', 'ni-br': '1', 'ni-arms': '1', 'ni-legs': '0', 'ni-sta': '0' });
  assert.equal(ni.score, 5);
  assert.match(ni.band, /severe/);
  // N-PASS: three +2 pain items -> raw 6; preterm 27 wk adds 3 -> 9; sedation 0.
  const np = ok('npass', { 'np-cry': '2', 'np-beh': '2', 'np-fac': '2', 'np-ext': '0', 'np-vit': '0', 'np-ga': '27' });
  assert.equal(np.painScore, 9);
  assert.equal(np.pretermAdjust, 3);
  const cr = ok('cries', { 'cr-cry': '2', 'cr-o2': '1', 'cr-vit': '1', 'cr-exp': '1', 'cr-slp': '0' });
  assert.equal(cr.score, 5);
  assert.match(cr.band, /analgesia/);
  const po = ok('poss', { 'po-lvl': '3' });
  assert.equal(po.acceptable, false);
  const cb = ok('comfort-b', { 'cb-alt': '4', 'cb-cal': '4', 'cb-res': '4', 'cb-mov': '4', 'cb-mus': '4', 'cb-fac': '4' });
  assert.equal(cb.score, 24);
  assert.match(cb.band, /inadequate/);
  // WAT-1: three binary items + recovery 6 min (2 points) = 5, withdrawal.
  const w1 = ok('wat-1', { 'w1-ls': '1', 'w1-vo': '1', 'w1-fe': '1', 'w1-sb': '0', 'w1-tr': '0', 'w1-sw': '0', 'w1-um': '0', 'w1-ys': '0', 'w1-st': '0', 'w1-mt': '0', 'w1-rm': '6' });
  assert.equal(w1.score, 5);
  assert.equal(w1.withdrawal, true);
  const sb = ok('sbs', { 'sb-lvl': '-3' });
  assert.equal(sb.score, -3);
  assert.match(sb.band, /deeper than target/);
  const so = ok('sos', { 'so-tac': '1', 'so-tap': '1', 'so-fev': '1', 'so-swe': '1', 'so-agi': '0', 'so-anx': '0', 'so-gri': '0', 'so-sle': '0', 'so-hal': '0', 'so-mot': '0', 'so-hyp': '0', 'so-tre': '0', 'so-vom': '0', 'so-dia': '0', 'so-cry': '0' });
  assert.equal(so.score, 4);
  assert.equal(so.withdrawal, true);
});

test('lib/scoring-v4.js prehospital stroke scales, ADLs, C-SSRS worked calls (wave 65)', () => {
  const cp = ok('cpss', { 'cp-face': '1', 'cp-arm': '0', 'cp-speech': '1' });
  assert.equal(cp.abnormalCount, 2);
  assert.equal(cp.positive, true);
  const lm = ok('lams', { 'lm-face': '1', 'lm-arm': '2', 'lm-grip': '2' });
  assert.equal(lm.score, 5);
  assert.equal(lm.lvoLikely, true);
  const ra = ok('race', { 'ra-face': '2', 'ra-arm': '2', 'ra-leg': '1', 'ra-gaze': '0', 'ra-lang': '0' });
  assert.equal(ra.score, 5);
  assert.equal(ra.lvoLikely, true);
  // ROSIER: two weakness items (+2) minus seizure (-1) = 1, stroke likely.
  const ro = ok('rosier', { 'ro-loc': 'false', 'ro-sez': 'true', 'ro-face': 'true', 'ro-arm': 'true', 'ro-leg': 'false', 'ro-speech': 'false', 'ro-vis': 'false' });
  assert.equal(ro.score, 1);
  assert.equal(ro.strokeLikely, true);
  // GUSS full 20 (all stages passed).
  const gu = ok('guss', { 'gu-vig': '1', 'gu-cgh': '1', 'gu-sw': '1', 'gu-dr': '1', 'gu-vc': '1', 'gu-ssSw': '2', 'gu-ssCg': '1', 'gu-ssDr': '1', 'gu-ssVc': '1', 'gu-liSw': '2', 'gu-liCg': '1', 'gu-liDr': '1', 'gu-liVc': '1', 'gu-soSw': '2', 'gu-soCg': '1', 'gu-soDr': '1', 'gu-soVc': '1' });
  assert.equal(gu.score, 20);
  // Barthel: reduced items -> moderate dependency band.
  const bt = ok('barthel', { 'bt-feed': '5', 'bt-bath': '0', 'bt-groom': '5', 'bt-dress': '5', 'bt-bowel': '10', 'bt-bladder': '10', 'bt-toil': '5', 'bt-trans': '10', 'bt-mob': '10', 'bt-stair': '5' });
  assert.equal(bt.score, 65);
  assert.equal(bt.band, 'moderate dependency');
  const lw = ok('lawton-iadl', { 'lw-tel': '1', 'lw-shop': '0', 'lw-food': '1', 'lw-house': '1', 'lw-laund': '0', 'lw-trans': '1', 'lw-med': '1', 'lw-fin': '1' });
  assert.equal(lw.score, 6);
  const kz = ok('katz-adl', { 'kz-bath': '1', 'kz-dress': '1', 'kz-toil': '0', 'kz-trans': '1', 'kz-cont': '1', 'kz-feed': '1' });
  assert.equal(kz.score, 5);
  // C-SSRS: plan and intent -> high risk band.
  const cs = ok('cssrs', { 'cs-q1': 'true', 'cs-q2': 'true', 'cs-q3': 'true', 'cs-q4': 'true', 'cs-q5': 'true', 'cs-q6': 'false', 'cs-q6a': 'false' });
  assert.equal(cs.band, 'high risk');
});

test('lib/scoring-v4.js pulmonary / CAP-severity worked calls (wave 66)', () => {
  // HACOR: tachycardia + acidosis + low GCS + poor oxygenation + tachypnea.
  const hc = ok('hacor', { 'hc-hr': '130', 'hc-ph': '7.20', 'hc-gcs': '10', 'hc-pao2': '80', 'hc-fio2': '0.8', 'hc-rr': '45' });
  assert.ok(hc.score > 5);
  // Berlin ARDS: all four criteria + P/F 160 -> moderate.
  const ba = ok('berlin-ards', { 'ba-timing': '1', 'ba-bilat': '1', 'ba-not': '1', 'ba-peep': '1', 'ba-pao2': '160', 'ba-fio2': '1.0' });
  assert.equal(ba.ards, true);
  assert.match(ba.severity, /moderate/i);
  // Empty P/F still round-trips to not-met when a criterion is missing.
  assert.equal(ok('berlin-ards', { 'ba-timing': '0', 'ba-bilat': '0', 'ba-not': '0', 'ba-peep': '0', 'ba-pao2': '', 'ba-fio2': '' }).ards, false);
  const lm = ok('lis-murray', { 'lm-quad': '4', 'lm-pao2': '80', 'lm-fio2': '1.0', 'lm-peep': '14', 'lm-comp': '18' });
  assert.ok(lm.score > 2.5);
  // SMART-COP: SBP<90 (2) + pH<7.35 (2) = 4.
  const sc = ok('smart-cop', { 'sc-age': '60', 'sc-sbp': '1', 'sc-multi': '0', 'sc-alb': '0', 'sc-rr': '20', 'sc-pao2': '90', 'sc-spo2': '96', 'sc-pf': '400', 'sc-hr': '0', 'sc-conf': '0', 'sc-ph': '1' });
  assert.equal(sc.score, 4);
  const cr = ok('crb65', { 'cr-conf': '1', 'cr-rr': '0', 'cr-bp': '1', 'cr-age': '1' });
  assert.equal(cr.score, 3);
  // ATS/IDSA: one major criterion -> severe.
  assert.equal(ok('ats-idsa-cap', { 'ai-major-vp': '1', 'ai-major-mv': '0', 'ai-rr': '0', 'ai-pf': '0', 'ai-multi': '0', 'ai-conf': '0', 'ai-bun': '0', 'ai-leuk': '0', 'ai-plt': '0', 'ai-hypo': '0', 'ai-fluid': '0' }).severe, true);
});

test('lib/scoring-v4.js nutrition-risk + Ottawa-rule worked calls (wave 67)', () => {
  // NUTRIC: age 78 (2) + APACHE 30 (3) + SOFA 11 (2) + comorbidities 3 (1) = 8, high.
  const nt = ok('nutric', { 'nt-age': '78', 'nt-apache': '30', 'nt-sofa': '11', 'nt-comorb': '3', 'nt-days': '0', 'nt-il6': '0' });
  assert.equal(nt.score, 8);
  assert.equal(nt.highRisk, true);
  const mn = ok('mnutric', { 'mn-age': '78', 'mn-apache': '30', 'mn-sofa': '11', 'mn-comorb': '3', 'mn-days': '0' });
  assert.ok(mn.score >= 5);
  assert.equal(mn.highRisk, true);
  // NRS-2002: severity 3 + status 1 = 4, at risk.
  const nr = ok('nrs2002', { 'nr-sev': '3', 'nr-nut': '1', 'nr-age': '0' });
  assert.equal(nr.score, 4);
  assert.equal(nr.atRisk, true);
  // MUST: low BMI band (2) + big weight loss (2) = 4, high risk.
  const mu = ok('must-nutrition', { 'mu-bmi': '17', 'mu-wl': '12', 'mu-acute': '0' });
  assert.equal(mu.score, 4);
  assert.match(mu.band, /high/);
  // Ottawa ankle: malleolar pain + lateral tenderness -> ankle x-ray.
  const oa = ok('ottawa-ankle', { 'oa-mp': '1', 'oa-lat': '1', 'oa-med': '0', 'oa-abw': '0', 'oa-fp': '0', 'oa-fmt': '0', 'oa-nav': '0', 'oa-fbw': '0' });
  assert.equal(oa.ankleXray, true);
  // Ottawa SAH: exclusion present -> not applicable.
  assert.equal(ok('ottawa-sah', { 'os-excl': '1', 'os-age': '0', 'os-neck': '0', 'os-loc': '0', 'os-ex': '0', 'os-tc': '0', 'os-flex': '0' }).applicable, false);
  // Ottawa SAH: one criterion, no exclusion -> cannot rule out.
  assert.equal(ok('ottawa-sah', { 'os-excl': '0', 'os-age': '1', 'os-neck': '0', 'os-loc': '0', 'os-ex': '0', 'os-tc': '0', 'os-flex': '0' }).cannotRuleOut, true);
});

test('lib/scoring-v4.js workflow / wound / transfusion worked calls (wave 68)', () => {
  // DRIP: two majors (4) -> high risk.
  const dr = ok('drip', { 'dr-abx': '1', 'dr-ltc': '1', 'dr-tube': '0', 'dr-mdr': '0', 'dr-hosp': '0', 'dr-cpd': '0', 'dr-func': '0', 'dr-ppi': '0', 'dr-wound': '0', 'dr-mrsa': '0' });
  assert.equal(dr.score, 4);
  // ABC: penetrating + SBP<=90 = 2 -> activate MTP.
  const abc = ok('abc-mtp', { 'abc-pen': '1', 'abc-sbp': '1', 'abc-hr': '0', 'abc-fast': '0' });
  assert.equal(abc.score, 2);
  assert.equal(abc.activateMtp, true);
  // NPIAP: non-blanchable erythema on intact skin -> Stage 1.
  const np = ok('npiap-staging', { 'np-muc': '0', 'np-intact': '1', 'np-blanch': 'non-blanchable-erythema', 'np-obs': '0', 'np-depth': 'partial-thickness' });
  assert.match(np.stage, /Stage 1/);
  // Norton: all 3 (physical bad) -> low totals; PUSH from bands.
  const nr = ok('norton-push', { 'nr-pc': '2', 'nr-mc': '2', 'nr-act': '2', 'nr-mob': '2', 'nr-inc': '2', 'pu-lw': '6', 'pu-ex': '2', 'pu-tt': '3' });
  assert.equal(nr.nortonTotal, 10);
  assert.equal(nr.pushTotal, 11);
  // VIP grade 4 -> banner present.
  const ve = ok('vip-extravasation', { 've-vip': '4', 've-ins': '4', 've-ves': '1' });
  assert.equal(ve.vip, 4);
  assert.ok(ve.banners.length > 0);
  // Blood compat: AB+ recipient, PRBC -> all donor types compatible.
  const bc = ok('blood-compat', { 'bc-recip': 'AB+', 'bc-prod': 'prbc' });
  assert.equal(bc.product, 'PRBC');
  assert.ok(bc.compatibleDonors.length >= 4);
});

test('lib/clinical-v5.js group-v5 diagnostic ratios + staging worked calls (wave 69)', () => {
  const li = ok('lights', { pp: '4.0', sp: '6.0', pl: '250', sl: '200', uln: '222' });
  assert.equal(li.proteinRatio, 0.67);
  assert.match(li.classification, /Exudate/);
  const me = ok('mentzer', { mcv: '65', rbc: '6.0' });
  assert.equal(me.index, 10.8);
  const sa = ok('saag', { sa: '3.5', aa: '1.5' });
  assert.equal(sa.saag, 2.0);
  assert.match(sa.classification, /Portal hypertension/);
  const rf = ok('r-factor', { alt: '500', altu: '40', alp: '100', alpu: '120' });
  assert.equal(rf.rFactor, 15);
  assert.equal(rf.pattern, 'Hepatocellular');
  const kd = ok('kdigo-aki', { base: '1.0', cur: '3.5' });
  assert.equal(kd.creatinineRatio, 3.5);
  assert.equal(kd.creatinineStage, 3);
  const sg = ok('sgarbossa', { a: '1' });
  assert.equal(sg.positive, true);
  assert.equal(sg.stThresholdMm, 1);
  const av = ok('avpu-gcs', { lvl: 'P' });
  assert.equal(av.typical, 8);
});

test('lib/field.js prehospital / MCI triage worked calls (wave 70)', () => {
  const ci = ok('cincinnati', { 'cps-face': '1', 'cps-arm': '1', 'cps-speech': '0' });
  assert.equal(ci.total, 2);
  assert.equal(ci.positive, true);
  assert.equal(ci.itemCount, 3);
  assert.equal(ok('fast', { 'fast-face': '1' }).positive, true);
  assert.equal(ok('fast', { 'fast-balance': '0', 'fast-eyes': '0', 'fast-face': '0', 'fast-arms': '0', 'fast-speech': '0' }).positive, false);
  // START: can walk -> Minor.
  assert.match(ok('start-triage', { 'st-walk': '1' }).category, /Minor/);
  // START: not walking, apnea persists after repositioning -> Expectant.
  assert.match(ok('start-triage', { 'st-walk': '0', 'st-breath': '0', 'st-reposition': 'no' }).category, /Expectant/);
  // JumpSTART: child can walk -> Minor.
  assert.match(ok('jumpstart-triage', { 'js-walk': '1' }).category, /Minor/);
  // JumpSTART: not walking, breathing returns after rescue breaths -> Immediate.
  assert.match(ok('jumpstart-triage', { 'js-walk': '0', 'js-breath': '0', 'js-rescue': 'yes' }).category, /Immediate/);
});

test('lib/scoring-v4.js environmental-emergency worked calls (wave 71)', () => {
  const hy = ok('hypothermia-rewarm', { 'hyp-t': '30', 'hyp-s': 'impaired' });
  assert.equal(hy.coreTempC, 30);
  assert.equal(hy.stage, 'HT II');
  const hyIV = ok('hypothermia-rewarm', { 'hyp-t': '24', 'hyp-s': 'arrest' });
  assert.equal(hyIV.stage, 'HT IV');
  const hs = ok('heatstroke-decision', { 'hs-t': '41.2', 'hs-cns': 'mild-confusion', 'hs-sw': '1', 'hs-set': 'field' });
  assert.equal(hs.coreTempC, 41.2);
  assert.equal(hs.subtype, 'exertional');
  assert.match(hs.stage, /heat stroke/i);
  // No sweating -> classic subtype.
  assert.equal(ok('heatstroke-decision', { 'hs-t': '41.5', 'hs-cns': 'altered', 'hs-sw': '0', 'hs-set': 'hospital' }).subtype, 'classic');
});

test('lib/scoring-v6.js pediatric / adult severity worked calls (wave 72)', () => {
  const p2 = ok('pelod2', { 'p2-age': '24', 'p2-gcs': '12', 'p2-lactate': '6', 'p2-map': '50', 'p2-creat': '60', 'p2-pf': '300', 'p2-paco2': '40', 'p2-vent': '1', 'p2-wbc': '5', 'p2-plt': '100' });
  assert.equal(p2.score, 9);
  const ps = ok('psofa', { 'ps-age': '24', 'ps-pf': '250', 'ps-vent': '1', 'ps-plt': '120', 'ps-bili': '1.5', 'ps-map': '50', 'ps-gcs': '13', 'ps-creat': '0.7' });
  assert.equal(ps.score, 7);
  const bw = ok('burch-wartofsky', { 'bw-temp': '15', 'bw-cns': '10', 'bw-gi': '10', 'bw-hr': '15', 'bw-chf': '5', 'bw-afib': '1', 'bw-precip': '1' });
  assert.equal(bw.total, 75);
  const ar = ok('ariscat', { 'ar-age': '3', 'ar-spo2': '8', 'ar-incision': '15', 'ar-duration': '16' });
  assert.equal(ar.total, 42);
  const ap = ok('apache2', { 'ap-temp': '39', 'ap-map': '60', 'ap-hr': '120', 'ap-rr': '30', 'ap-oxy': '65', 'ap-ph': '7.3', 'ap-na': '150', 'ap-k': '5.6', 'ap-creat': '2', 'ap-hct': '48', 'ap-wbc': '18', 'ap-gcs': '13', 'ap-age': '60' });
  assert.equal(ap.total, 23);
  const bq = ok('braden-q', { 'bq-mobility': '2', 'bq-activity': '2', 'bq-sensory': '2', 'bq-moisture': '2', 'bq-friction': '2', 'bq-nutrition': '2', 'bq-perfusion': '2' });
  assert.equal(bq.total, 14);
});

test('lib/clinical-v5.js remaining group-v5 scores worked calls (wave 73)', () => {
  const rc = ok('rcri', { highRiskSurgery: '1', ischemicHeartDisease: '1' });
  assert.equal(rc.count, 2);
  assert.equal(rc.majorCardiacEventRiskPct, 6.6);
  const pw = ok('pews', { Behavior: '2', Cardiovascular: '2', Respiratory: '1' });
  assert.equal(pw.total, 5);
  const ab = ok('abcd2', { age: '70', sbp: '150', dbp: '90', clin: 'weakness', dur: '90', diab: '1' });
  assert.match(ab.interpretation, /7\/7/);
  assert.match(ab.interpretation, /High/);
});

test('lib/scoring-v4.js deterministic ICU workflow worked calls (wave 74)', () => {
  // LIPS: shock (2) + aspiration (2) = 4, high risk.
  const lp = ok('lips', { 'lp-shock': '1', 'lp-asp': '1', 'lp-sep': '0', 'lp-pna': '0', 'lp-surg': '0', 'lp-trauma': '0', 'lp-etoh': '0', 'lp-obese': '0', 'lp-alb': '0', 'lp-chemo': '0', 'lp-fio2': '0', 'lp-tach': '0', 'lp-spo2': '0', 'lp-acid': '0', 'lp-dm': '0' });
  assert.equal(lp.score, 4);
  const mt = ok('mtp-tracker', { 'mtp-prbc': '6', 'mtp-ffp': '4', 'mtp-plt': '1', 'mtp-cryo': '0' });
  assert.equal(mt.ratio, '6:4:1');
  assert.equal(mt.cumulativeUnits, 11);
  const bg = ok('bristol-girth', { 'bg-b': '4' });
  assert.equal(bg.bristolType, 4);
  assert.equal(bg.category, 'normal');
  assert.equal(ok('bristol-girth', { 'bg-b': '7' }).category, 'diarrhea');
});

test('lib/idcrit-v99.js ID / critical-care criteria worked calls (wave 75)', () => {
  // Duke: 2 major criteria -> definite.
  const du = ok('duke-endocarditis', { 'duke-maj-microbiologic': '1', 'duke-maj-imaging': '1' });
  assert.equal(du.majorCount, 2);
  assert.equal(du.verdict, 'definite');
  // Pitt: severe temp (2) + hypotension (2) = 4, high risk.
  const pi = ok('pitt-bacteremia', { 'pitt-temp': 'severe', 'pitt-hypotension': '1', 'pitt-mental': 'alert' });
  assert.equal(pi.total, 4);
  assert.equal(pi.highRisk, true);
  const sa = ok('saps-ii', { 'saps-age': '70', 'saps-hr': '130', 'saps-sbp': '90', 'saps-temp': '38', 'saps-vent': '1', 'saps-pao2': '80', 'saps-fio2': '0.5', 'saps-urine': '0.4', 'saps-bun': '60', 'saps-na': '140', 'saps-k': '4.0', 'saps-hco3': '18', 'saps-bili': '2.0', 'saps-wbc': '15', 'saps-gcs': '12', 'saps-chronic': 'none', 'saps-admit': 'medical' });
  assert.equal(sa.score, 64);
  assert.equal(Math.round(sa.mortality * 10) / 10, 75.3);
  // Refeeding: BMI 15 is a major criterion -> high risk.
  const rf = ok('refeeding-risk', { 'ref-bmi': '15', 'ref-wl': '5', 'ref-days': '2' });
  assert.equal(rf.highRisk, true);
  assert.equal(rf.majorCount, 1);
});

test('lib/scoring-v5.js group-v9 screening / decision worked calls (wave 76)', () => {
  const pg = ok('phq2-gad2', { 'pg-d1': '2', 'pg-d2': '2', 'pg-a1': '1', 'pg-a2': '1' });
  assert.equal(pg.phq2, 4);
  assert.equal(pg.gad2, 2);
  assert.equal(pg.phqPositive, true);
  assert.equal(ok('audit-full', { 'af-1': '4', 'af-2': '4', 'af-3': '2' }).total, 10);
  // DAST-10: two items + reverse-scored item 3 unchecked -> 3.
  const dt = ok('dast10', { 'dt-1': '1', 'dt-2': '1' });
  assert.equal(dt.total, 3);
  assert.equal(dt.maxScore, 10);
  const gd = ok('gds15', { 'gd-2': '1', 'gd-3': '1' });
  assert.equal(gd.total, 7);
  assert.equal(ok('ottawa-knee', { 'ok-age55': '1' }).xrayIndicated, true);
  assert.equal(ok('nexus-chest', { 'nc-cxr': '1' }).imagingIndicated, true);
  assert.equal(ok('sfsr', { 'sf-ecg': '1' }).highRisk, true);
  assert.equal(ok('canadian-syncope', { 'cs-heart': '1', 'cs-trop': '1' }).score, 3);
  const ed = ok('edacs', { 'ed-age': '50', 'ed-male': '1', 'ed-risk': '1', 'ed-diaph': '1' });
  assert.equal(ed.score, 17);
  assert.equal(ed.lowRisk, false);
  assert.equal(ok('years-pe', { 'yp-ddimer': '400' }).excluded, true);
  assert.equal(ok('feverpain', { 'fp-fever': '1', 'fp-pus': '1', 'fp-attend': '1', 'fp-inflamed': '1' }).total, 4);
  assert.equal(ok('stone-score', { 'st-sex': 'male', 'st-timing': 'lt6', 'st-nonblack': '1', 'st-nausea': 'vomiting', 'st-hematuria': '1' }).score, 13);
  const ir = ok('iss-rts', { 'ir-ais1': '4', 'ir-ais2': '3', 'ir-ais3': '2', 'ir-gcs': '14', 'ir-sbp': '120', 'ir-rr': '18' });
  assert.equal(ir.iss, 29);
  assert.equal(ir.rts, 7.84);
  const sp = ok('sipa', { 'sp-age': '5', 'sp-hr': '140', 'sp-sbp': '100' });
  assert.equal(sp.shockIndex, 1.4);
  assert.equal(sp.elevated, true);
});

test('lib/scoring-v4.js cardiovascular risk engines worked calls (wave 77)', () => {
  const as = ok('ascvd', { 'as-age': '55', 'as-tc': '213', 'as-hdl': '50', 'as-sbp': '120', 'as-sex': 'M', 'as-race': 'white' });
  assert.ok(as.pct > 0 && as.pct < 30);
  assert.equal(as.horizonYears, 10);
  const pv = ok('prevent', { 'pv-age': '55', 'pv-tc': '200', 'pv-hdl': '50', 'pv-sbp': '120', 'pv-bmi': '25', 'pv-egfr': '90', 'pv-sex': 'M' });
  assert.ok(pv.pct > 0 && pv.pct < 30);
  assert.equal(pv.ageYears, 55);
  assert.equal(pv.horizonYears, 10);
});

test('lib/field.js burn / airway / drug-dose recipes worked calls (wave 78)', () => {
  const bf = ok('burn-fluid', { 'bf-w': '70', 'bf-bsa': '20', 'bf-h': '0' });
  assert.equal(bf.parkland.total24h, 5600);
  assert.equal(bf.parkland.first8h, 2800);
  assert.equal(bf.brooke.total24h, 2800);
  const pe = ok('peds-ett', { 'pet-age': '4', 'pet-cuffed': 'uncuffed' });
  assert.equal(pe.sizeMm, 5);
  assert.equal(pe.depthCm, 15);
  const nx = ok('naloxone', { 'nx-pop': 'adult', 'nx-route': 'in' });
  assert.match(nx.dose, /4 mg intranasal/);
  const pw = ok('peds-weight-dose', { 'pwd-w': '10', 'pwd-r': 'epinephrine-iv-io' });
  assert.equal(pw.dose, 0.1);
});

test('lib/scoring-v4.js restraint-reassessment timer worked call (wave 79)', () => {
  const rt = ok('restraint-timer', { 'rt-type': 'violent', 'rt-age': '40', 'rt-ts': '2026-05-19T12:00' });
  assert.equal(rt.type, 'violent');
  // The order-relative reassessment is 15 minutes after the order.
  assert.match(rt.nextReassessIso, /:15:/);
  assert.match(rt.banners.join(' '), /482\.13/);
});

test('lib/clinical.js Naegele due-date worked call (wave 80)', () => {
  const dd = ok('due-date', { lmp: '2025-01-01' });
  assert.equal(dd.dueDate, '2025-10-08');
});

test('lib/idcrit-v99.js Lund-Browder burn worked call (wave 81)', () => {
  const lb = ok('lund-browder', { 'lb-age': 'adult', 'lb-head': '1', 'lb-ant-trunk': '1' });
  assert.equal(lb.tbsa, 20);
  assert.equal(lb.ruleOfNines, 25);
});

test('lib/field.js bsa_burn method-branched worked calls (wave 82)', () => {
  // Rule of Nines: anterior trunk alone -> 18%.
  assert.equal(ok('bsa_burn', { 'bb-method': 'nines', 'bb-n-trunk-anterior': '1' }).tbsa, 18);
  // Rule of Nines: head + one arm -> 18%.
  assert.equal(ok('bsa_burn', { 'bb-method': 'nines', 'bb-n-head': '1', 'bb-n-arm-left': '1' }).tbsa, 18);
  // Lund-Browder: entered percents sum.
  assert.equal(ok('bsa_burn', { 'bb-method': 'lund', 'bb-l-head': '7', 'bb-l-anterior-trunk': '13' }).tbsa, 20);
});

test('lib/scoring-v4.js ventilator SBT readiness + ARDSnet PEEP worked calls (wave 83)', () => {
  // All five Boles 2007 criteria met -> SBT ready; the echoed counts round-trip.
  const ready = ok('vent-sbt-peep', { 'vs-pf': '200', 'vs-peep': '6', 'vs-fio2': '0.4', 'vs-awake': '1', 'vs-arm': 'low', 'vs-lf': '0.5' });
  assert.equal(ready.sbtReady, true);
  assert.equal(ready.criteriaTotal, 5);
  assert.equal(ready.criteriaMet, 5);
  // ARDSnet low-PEEP arm at FiO2 0.5 -> PEEP band 8-10.
  assert.equal(ready.suggestedPeep, '8-10');
  // Awake criterion unchecked -> not ready, one criterion short.
  const notReady = ok('vent-sbt-peep', { 'vs-pf': '200', 'vs-peep': '6', 'vs-fio2': '0.4', 'vs-awake': '0', 'vs-arm': 'low', 'vs-lf': '0.5' });
  assert.equal(notReady.sbtReady, false);
  assert.equal(notReady.criteriaMet, 4);
});

test('lib/renal-v277.js worked calls', () => {
  // 1440 mL urine at 100 mg/dL over 24 h, serum Cr 1.0 -> exactly 100 mL/min.
  const crcl = ok('measured-crcl', { 'mcrcl-ucr': '100', 'mcrcl-uvol': '1440', 'mcrcl-scr': '1.0', 'mcrcl-hours': '24' });
  assert.equal(crcl.score, 100);
  assert.equal(crcl.abnormal, false);
  // Halving the serum creatinine doubles the clearance.
  assert.equal(ok('measured-crcl', { 'mcrcl-ucr': '100', 'mcrcl-uvol': '1440', 'mcrcl-scr': '0.5', 'mcrcl-hours': '24' }).score, 200);
  // A reduced clearance flags abnormal (< 60 mL/min).
  const low = ok('measured-crcl', { 'mcrcl-ucr': '50', 'mcrcl-uvol': '720', 'mcrcl-scr': '1.0', 'mcrcl-hours': '24' });
  assert.equal(low.score, 25);
  assert.equal(low.abnormal, true);
});

test('lib/fibrosis-v275.js worked calls', () => {
  // RDW 16% / platelets 100 -> 0.16, at/above the ~0.1 fibrosis cutoff.
  const rpr = ok('rpr', { 'rpr-rdw': '16', 'rpr-plt': '100' });
  assert.equal(rpr.score, 0.16);
  assert.equal(rpr.abnormal, true);
  // A high platelet count drives the ratio below the cutoff.
  const lowr = ok('rpr', { 'rpr-rdw': '13', 'rpr-plt': '260' });
  assert.equal(lowr.score, 0.05);
  assert.equal(lowr.abnormal, false);
});

test('lib/nutrition-v276.js worked calls', () => {
  // Albumin 40 g/L, 60 kg current vs 70 kg usual -> 96.5 (moderate risk).
  const nri = ok('nri', { 'nri-alb': '40', 'nri-current': '60', 'nri-usual': '70' });
  assert.equal(nri.score, 96.5);
  assert.equal(nri.abnormal, true);
  // Weight-stable, higher albumin clears the >100 no-risk band.
  const wellNourished = ok('nri', { 'nri-alb': '45', 'nri-current': '70', 'nri-usual': '70' });
  assert.equal(wellNourished.abnormal, false);
});

test('lib/proteins-v274.js worked calls', () => {
  // Albumin 4.0, total protein 7.0 -> globulin 3.0, A/G 1.33.
  const agr = ok('agr', { 'agr-albumin': '4.0', 'agr-tp': '7.0' });
  assert.equal(agr.score, 1.33);
  assert.equal(agr.globulin, 3);
  assert.equal(agr.abnormal, false);
  // A low albumin with high globulin drives the ratio below 1 (unfavorable).
  const lowAgr = ok('agr', { 'agr-albumin': '2.0', 'agr-tp': '7.0' });
  assert.equal(lowAgr.score, 0.4);
  assert.equal(lowAgr.abnormal, true);
});

test('lib/metabolic-v273.js worked calls', () => {
  // TG 150, glucose 100, BMI 25 -> ln(7500) x 25 = 223.07.
  const tyg = ok('tyg-bmi', { 'tygbmi-tg': '150', 'tygbmi-glucose': '100', 'tygbmi-bmi': '25' });
  assert.equal(tyg.score, 223.07);
  // Higher triglycerides, glucose, and BMI raise the surrogate.
  const higher = ok('tyg-bmi', { 'tygbmi-tg': '250', 'tygbmi-glucose': '120', 'tygbmi-bmi': '30' });
  assert.ok(higher.score > tyg.score);
});

test('lib/anthro-v272.js worked calls', () => {
  // Waist 90 cm / height 170 cm -> 0.53, at/above the 0.5 boundary.
  const whtr = ok('whtr', { 'whtr-waist': '90', 'whtr-height': '170' });
  assert.equal(whtr.score, 0.53);
  assert.equal(whtr.abnormal, true);
  // A leaner waist clears the boundary.
  const lean = ok('whtr', { 'whtr-waist': '70', 'whtr-height': '180' });
  assert.equal(lean.score, 0.39);
  assert.equal(lean.abnormal, false);
});

test('lib/lipids-v271.js worked calls', () => {
  // TC 200, LDL 130, HDL 50 -> RI-I 4 (TC/HDL), RI-II 2.6 (LDL/HDL).
  const c = ok('castelli-index', { 'cast-tc': '200', 'cast-ldl': '130', 'cast-hdl': '50' });
  assert.equal(c.score, 4);
  assert.equal(c.cri2, 2.6);
  // A lower HDL raises both atherogenic ratios.
  const worse = ok('castelli-index', { 'cast-tc': '240', 'cast-ldl': '160', 'cast-hdl': '40' });
  assert.equal(worse.score, 6);
  assert.equal(worse.cri2, 4);
});

test('lib/adiposity-v270.js worked calls', () => {
  // TG 150 / HDL 50 = 3.0, waist 90 / height 170 = 0.529 -> CMI 1.59.
  const cmi = ok('cmi', { 'cmi-tg': '150', 'cmi-hdl': '50', 'cmi-waist': '90', 'cmi-height': '170' });
  assert.equal(cmi.score, 1.59);
  // A higher TG/HDL and larger waist worsen the index.
  const worse = ok('cmi', { 'cmi-tg': '200', 'cmi-hdl': '40', 'cmi-waist': '100', 'cmi-height': '170' });
  assert.ok(worse.score > cmi.score);
});

test('lib/metabolic-v269.js worked calls', () => {
  // FPG 100, TG 150, HDL 50, BMI 25 -> (ln(350) x 25) / ln(50) = 37.44.
  const mi = ok('mets-ir', { 'metsir-fpg': '100', 'metsir-tg': '150', 'metsir-hdl': '50', 'metsir-bmi': '25' });
  assert.equal(mi.score, 37.44);
  // Higher glucose, TG, and BMI with lower HDL raise the surrogate.
  const worse = ok('mets-ir', { 'metsir-fpg': '120', 'metsir-tg': '200', 'metsir-hdl': '40', 'metsir-bmi': '30' });
  assert.ok(worse.score > mi.score);
});

test('lib/inflam-v267.js worked calls', () => {
  // Hgb 140, albumin 40 (g/L), ALC 2.0, platelets 250 -> 44.8.
  const halp = ok('halp-score', { 'halp-hgb': '140', 'halp-alb': '40', 'halp-alc': '2.0', 'halp-plt': '250' });
  assert.equal(halp.score, 44.8);
  // Anemia, hypoalbuminemia, lymphopenia, and thrombocytosis lower HALP (worse).
  const worse = ok('halp-score', { 'halp-hgb': '120', 'halp-alb': '35', 'halp-alc': '1.5', 'halp-plt': '300' });
  assert.ok(worse.score < halp.score);
});

test('lib/inflam-v268.js worked calls', () => {
  // BMI 25, albumin 4.0 (g/dL), ANC 6.0, ALC 2.0 -> NLR 3, ALI 33.3.
  const ali = ok('ali-index', { 'ali-bmi': '25', 'ali-alb': '4.0', 'ali-anc': '6.0', 'ali-alc': '2.0' });
  assert.equal(ali.score, 33.3);
  // Lower BMI/albumin with a higher NLR mark a worse (lower) index.
  const worse = ok('ali-index', { 'ali-bmi': '22', 'ali-alb': '3.0', 'ali-anc': '9.0', 'ali-alc': '1.5' });
  assert.ok(worse.score < ali.score);
});

test('lib/peds-sepsis-v278.js worked calls', () => {
  // 2yo (24 mo), PaO2/FiO2 150 on IMV (resp 2); 1 vasoactive + lactate 6 + MAP 30
  // in the 24-<60 mo band (cardio 4); platelets 80 (coag 1); GCS 10 (neuro 1) -> 8/13.
  const phx = ok('phoenix-sepsis', {
    'phx-age': '24', 'phx-ratiotype': 'pf', 'phx-ratio': '150', 'phx-support': 'imv',
    'phx-vaso': '1', 'phx-lactate': '6', 'phx-map': '30', 'phx-plt': '80', 'phx-gcs': '10',
  });
  assert.equal(phx.score, 8);
  assert.equal(phx.resp, 2);
  assert.equal(phx.cardio, 4);
  assert.equal(phx.sepsis, true);
  assert.equal(phx.shock, true);
  // A well child with no organ dysfunction sits below the sepsis threshold.
  const well = ok('phoenix-sepsis', {
    'phx-age': '36', 'phx-support': 'none', 'phx-vaso': '0', 'phx-lactate': '1',
    'phx-map': '70', 'phx-plt': '250', 'phx-gcs': '15',
  });
  assert.equal(well.score, 0);
  assert.equal(well.sepsis, false);
});

test('lib/rcc-prognosis-v279.js worked calls', () => {
  // pT3-pT4 (+4) + pN0 (0) + <10 cm (0) + grade 4 (+3) + necrosis (+1) = 8/11, high risk.
  const leib = ok('leibovich-rcc', {
    'leib-pt': 'pt3-4', 'leib-n': 'n0', 'leib-size': 'lt10', 'leib-grade': 'g4', 'leib-necrosis': '1',
  });
  assert.equal(leib.score, 8);
  assert.equal(leib.band, 'high');
  // A small, low-grade, node-negative tumor with no necrosis is the low-risk floor.
  const low = ok('leibovich-rcc', {
    'leib-pt': 'pt1a', 'leib-n': 'n0', 'leib-size': 'lt10', 'leib-grade': 'g1-2',
  });
  assert.equal(low.score, 0);
  assert.equal(low.band, 'low');
  // UISS localized: T4 -> high tier regardless of grade/ECOG.
  const uiss = ok('uiss-rcc', { 'uiss-t': 't4', 'uiss-grade': '2', 'uiss-ecog': 'ecog0' });
  assert.equal(uiss.tier, 'high');
  // T1 / grade 1-2 / ECOG 0 is the low tier.
  const uissLow = ok('uiss-rcc', { 'uiss-t': 't1', 'uiss-grade': '1', 'uiss-ecog': 'ecog0' });
  assert.equal(uissLow.tier, 'low');
});

test('lib/rheum-fn-v280.js worked calls', () => {
  // 6 of 8 categories answered; dressing 1 with an aid raises it to 2, so the
  // mean of {2,2,2,2,2,2} = 2.0/3.
  const haq = ok('haq-di', {
    'haq-dressing': '1', 'haq-dressing-aid': '1', 'haq-arising': '2', 'haq-eating': '2',
    'haq-walking': '2', 'haq-hygiene': '2', 'haq-reach': '2',
  });
  assert.equal(haq.score, 2);
  assert.equal(haq.answered, 6);
  // Fewer than 6 answered categories cannot compute.
  const short = computeCalculator({ id: 'haq-di', inputs: { 'haq-dressing': '0', 'haq-arising': '0' } });
  assert.equal(short.valid, false);
  // ASAS clinical arm: entry + HLA-B27 + 2 other features (IBP, psoriasis) -> meets.
  const asas = ok('asas-axspa', {
    'asas-bp': '1', 'asas-age': '1', 'asas-hlaB27': '1', 'asas-ibp': '1', 'asas-psoriasis': '1',
  });
  assert.equal(asas.meets, true);
  // HLA-B27 is the clinical-arm anchor and does not count toward the >= 2 OTHER
  // features, so HLA-B27 + a single other feature does not meet.
  const noMeet = ok('asas-axspa', {
    'asas-bp': '1', 'asas-age': '1', 'asas-hlaB27': '1', 'asas-ibp': '1',
  });
  assert.equal(noMeet.meets, false);
});

test('lib/hcc-surveillance-v281.js worked calls', () => {
  // Male 65, AFP-L3 10%, AFP 100 ng/mL, DCP 200 mAU/mL -> Z 5.58, above the -0.63 cutoff.
  const galad = ok('galad-hcc', {
    'galad-sex': 'male', 'galad-age': '65', 'galad-afpl3': '10', 'galad-afp': '100', 'galad-dcp': '200',
  });
  assert.equal(galad.z, 5.58);
  assert.equal(galad.aboveCutoff, true);
  // THRI: age 65 (+50) + male (+80) + HCV (+97) + platelets 100 (+70) = 347/366, high.
  const thri = ok('toronto-hcc-risk', {
    'thri-age': '65', 'thri-sex': 'male', 'thri-etiology': 'hcv', 'thri-plt': '100',
  });
  assert.equal(thri.score, 347);
  assert.equal(thri.band, 'high');
  // A young female with HCV-SVR and normal platelets sits in the low band.
  const low = ok('toronto-hcc-risk', {
    'thri-age': '40', 'thri-sex': 'female', 'thri-etiology': 'hcv-svr', 'thri-plt': '250',
  });
  assert.equal(low.score, 0);
  assert.equal(low.band, 'low');
});

test('lib/decision-rules-v258.js worked calls', () => {
  // Canadian CT Head: any high-risk criterion -> CT recommended.
  const cch = ok('canadian-ct-head', { 'cch-gcs2h': '1' });
  assert.equal(cch.abnormal, true);
  const cchNeg = ok('canadian-ct-head', {});
  assert.equal(cchNeg.abnormal, false);
  // SF Syncope: any CHESS criterion -> high risk.
  const sfs = ok('sf-syncope', { 'sfs-ecg': '1', 'sfs-sbp': '1' });
  assert.equal(sfs.abnormal, true);
  const sfsLow = ok('sf-syncope', {});
  assert.equal(sfsLow.abnormal, false);
  // McIsaac: age 50 (>= 45, -1) + all four features (+4) = 3.
  const mci = ok('mcisaac', {
    'mci-age': '50', 'mci-fever': '1', 'mci-cough': '1', 'mci-adeno': '1', 'mci-exudate': '1',
  });
  assert.equal(mci.score, 3);
  // Age is required for McIsaac.
  const noAge = computeCalculator({ id: 'mcisaac', inputs: { 'mci-fever': '1' } });
  assert.equal(noAge.valid, false);
});

test('lib/pneumonia-risk-v260.js worked calls', () => {
  // A-DROP: 3 of 5 criteria -> score 3, severe.
  const ad = ok('a-drop', { 'ad-age': '1', 'ad-dehyd': '1', 'ad-orient': '1' });
  assert.equal(ad.score, 3);
  assert.equal(ad.abnormal, true);
  // DRIP: antibiotics (+?) + tube feeding sum to the high-risk 4.
  const drip = ok('drip-score', { 'dr-abx': '1', 'dr-tube': '1' });
  assert.equal(drip.score, 4);
  // Shorr: hospitalization (+2) + ICU (+2) + dementia (+1) + CVD (+1) = 6, high.
  const shorr = ok('shorr', { 'sh-hosp': '1', 'sh-icu': '1', 'sh-dementia': '1', 'sh-cvd': '1' });
  assert.equal(shorr.score, 6);
  assert.equal(shorr.abnormal, true);
});

test('lib/acute-abdomen-v261.js worked calls', () => {
  // RIPASA: 5 symptom/sign criteria + the defaulted demographic bands reach 7.5.
  const rp = ok('ripasa', {
    'rp-rifpain': '1', 'rp-anorexia': '1', 'rp-nausea': '1', 'rp-riftender': '1', 'rp-rebound': '1',
  });
  assert.equal(rp.score, 7.5);
  // PULP: age (+3) + shock (+1) + creatinine (+2) + ASA 3 (+3) = 9.
  const pu = ok('pulp', { 'pu-age': '1', 'pu-shock': '1', 'pu-creat': '1', 'pu-asa': '3' });
  assert.equal(pu.score, 9);
  // ESS: age (+2) + cancer (+3) + vent (+3) + creatinine (+2) + albumin (+1) + WBC high (+2) = 13.
  const es = ok('emergency-surgery-score', {
    'es-age': '1', 'es-cancer': '1', 'es-vent': '1', 'es-creat': '1', 'es-alb': '1', 'es-wbc': 'high',
  });
  assert.equal(es.score, 13);
});

test('lib/pediatric-acute-v262.js worked calls', () => {
  // Lab-score: CRP mid (+2) + PCT mid (+2) = 4, high risk.
  const ls = ok('lab-score', { 'ls-crp': 'mid', 'ls-pct': 'mid' });
  assert.equal(ls.score, 4);
  assert.equal(ls.abnormal, true);
  // CHALICE: any one criterion -> positive (CT recommended).
  const ch = ok('chalice', { 'ch-loc': '1' });
  assert.equal(ch.abnormal, true);
  const chNeg = ok('chalice', {});
  assert.equal(chNeg.abnormal, false);
  // Egami: ALT high (+2) + young age (+1) = 3, high risk of IVIG resistance.
  const eg = ok('egami', { 'eg-alt': '1', 'eg-age': '1' });
  assert.equal(eg.score, 3);
  assert.equal(eg.abnormal, true);
});

test('lib/respiratory-maternal-v263.js worked calls', () => {
  // MuLBSTA: multilobar (+5) + lymphopenia (+4) + current smoker (+3) = 12.
  const mu = ok('mulbsta', { 'mu-multi': '1', 'mu-lymph': '1', 'mu-smoke': 'current' });
  assert.equal(mu.score, 12);
  // Ottawa COPD: hemoglobin < 10 (+3) + HR >= 110 (+2) = 5.
  const ot = ok('ottawa-copd', { 'ot-hb': '1', 'ot-hr': '1' });
  assert.equal(ot.score, 5);
  // SOS: temp band 30-31.9 (+3) + WBC band 25-39.9 (+3) = 6, with the other
  // physiologic bands defaulting to normal.
  const sos = ok('sepsis-obstetrics-score', { 'sos-temp': 't30_319', 'sos-wbc': 'w25_399' });
  assert.equal(sos.score, 6);
  assert.equal(sos.abnormal, true);
});

test('lib/massive-transfusion-v265.js worked calls', () => {
  // ABC: penetrating + SBP <= 90 = 2 -> predicts massive transfusion.
  const abc = ok('abc-transfusion-score', { 'abc-pen': '1', 'abc-sbp': '1' });
  assert.equal(abc.score, 2);
  assert.equal(abc.abnormal, true);
  // A single criterion is below the >= 2 threshold.
  const one = ok('abc-transfusion-score', { 'abc-pen': '1' });
  assert.equal(one.score, 1);
  assert.equal(one.abnormal, false);
});

test('lib/rcc-prognosis-v266.js worked calls', () => {
  // SSIGN: pT3 (+2) + grade 4 (+3) + necrosis present (+2) = 7, with N/M/size
  // defaulting to 0.
  const ss = ok('ssign-score', { 'ss-t': 'pt3', 'ss-grade': 'g4', 'ss-necrosis': 'present' });
  assert.equal(ss.score, 7);
  // A small, low-grade, localized tumor with no necrosis is the 0 floor.
  const low = ok('ssign-score', {
    'ss-t': 'pt1', 'ss-n': 'n0', 'ss-m': 'm0', 'ss-size': 'lt5', 'ss-grade': 'g12', 'ss-necrosis': 'absent',
  });
  assert.equal(low.score, 0);
});

test('lib/scoring-v4.js auditc + cage worked calls', () => {
  // AUDIT-C 2+1+1 = 4 -> positive (risky drinking); max 12.
  const ac = ok('auditc', { 'auditc-0': '2', 'auditc-1': '1', 'auditc-2': '1' });
  assert.equal(ac.score, 4);
  assert.equal(ac.maxScore, 12);
  assert.match(ac.severity, /Positive/);
  // CAGE 2 of 4 -> positive; a single yes is negative.
  const cagePos = ok('cage', { 'cage-0': '1', 'cage-1': '1', 'cage-2': '0', 'cage-3': '0' });
  assert.equal(cagePos.score, 2);
  assert.match(cagePos.severity, /Positive/);
  const cageNeg = ok('cage', { 'cage-0': '1', 'cage-1': '0', 'cage-2': '0', 'cage-3': '0' });
  assert.equal(cageNeg.severity, 'Negative');
});

test('lib/scoring-v4.js epds worked calls', () => {
  // Example answers sum to 7 -> low likelihood (max 30).
  const low = ok('epds', { 'epds-0': '1', 'epds-1': '1', 'epds-2': '1', 'epds-3': '1', 'epds-4': '0', 'epds-5': '1', 'epds-6': '1', 'epds-7': '1', 'epds-8': '0', 'epds-9': '0' });
  assert.equal(low.score, 7);
  assert.equal(low.maxScore, 30);
  assert.equal(low.severity, 'Low likelihood');
  // A total >= 13 flags likely depression.
  const high = ok('epds', { 'epds-0': '2', 'epds-1': '2', 'epds-2': '2', 'epds-3': '2', 'epds-4': '2', 'epds-5': '2', 'epds-6': '1', 'epds-7': '0', 'epds-8': '0', 'epds-9': '0' });
  assert.equal(high.score, 13);
  assert.match(high.severity, /Likely depression/);
});

test('lib/scoring-v4.js gad7 worked calls', () => {
  // Example answers sum to 7 -> mild anxiety (max 21).
  const mild = ok('gad7', { 'gad7-0': '1', 'gad7-1': '1', 'gad7-2': '1', 'gad7-3': '2', 'gad7-4': '0', 'gad7-5': '1', 'gad7-6': '1' });
  assert.equal(mild.score, 7);
  assert.equal(mild.maxScore, 21);
  assert.equal(mild.severity, 'Mild anxiety');
  // All items maxed -> severe.
  const severe = ok('gad7', { 'gad7-0': '3', 'gad7-1': '3', 'gad7-2': '3', 'gad7-3': '3', 'gad7-4': '3', 'gad7-5': '3', 'gad7-6': '3' });
  assert.equal(severe.score, 21);
  assert.equal(severe.severity, 'Severe anxiety');
});

test('lib/scoring-v4.js phq9 worked calls', () => {
  // The documented example answers sum to 7 -> mild depression.
  const mild = ok('phq9', { 'phq9-0': '1', 'phq9-1': '1', 'phq9-2': '1', 'phq9-3': '2', 'phq9-4': '1', 'phq9-5': '0', 'phq9-6': '1', 'phq9-7': '0', 'phq9-8': '0' });
  assert.equal(mild.score, 7);
  assert.equal(mild.maxScore, 27);
  assert.equal(mild.severity, 'Mild depression');
  // All items near-max -> severe band.
  const severe = ok('phq9', { 'phq9-0': '3', 'phq9-1': '3', 'phq9-2': '3', 'phq9-3': '3', 'phq9-4': '3', 'phq9-5': '3', 'phq9-6': '3', 'phq9-7': '3', 'phq9-8': '2' });
  assert.equal(severe.score, 26);
  assert.equal(severe.severity, 'Severe depression');
});

test('lib/scoring-v4.js aldrete-padss composite worked calls', () => {
  // All items at 2 -> both scores at the 10 maximum.
  const max = ok('aldrete-padss', { 'ap-al-act': '2', 'ap-al-resp': '2', 'ap-al-circ': '2', 'ap-al-cons': '2', 'ap-al-o2': '2', 'ap-pd-vs': '2', 'ap-pd-amb': '2', 'ap-pd-nv': '2', 'ap-pd-pain': '2', 'ap-pd-bld': '2' });
  assert.equal(max.aldrete.score, 10);
  assert.equal(max.padss.score, 10);
  assert.equal(max.padss.readyForDischarge, true);
  // A PADSS total below 9 is not yet ready for discharge.
  const low = ok('aldrete-padss', { 'ap-al-act': '2', 'ap-al-resp': '2', 'ap-al-circ': '2', 'ap-al-cons': '2', 'ap-al-o2': '2', 'ap-pd-vs': '1', 'ap-pd-amb': '1', 'ap-pd-nv': '2', 'ap-pd-pain': '2', 'ap-pd-bld': '1' });
  assert.equal(low.padss.score, 7);
  assert.equal(low.padss.readyForDischarge, false);
});

test('lib/clinical-v8.js minute-ventilation worked calls', () => {
  // RR 16 x Vt 450 mL = 7.2 L/min; rate to move PaCO2 60 -> 40 is 16 x 60/40 = 24.
  const r = ok('minute-ventilation', { 'mv-rr': '16', 'mv-vt': '450', 'mv-paco2': '60', 'mv-target': '40' });
  assert.equal(r.minuteVentilationLMin, 7.2);
  assert.equal(r.requiredRate, 24);
  // Without a target, no required rate is computed.
  const noTarget = ok('minute-ventilation', { 'mv-rr': '12', 'mv-vt': '500' });
  assert.equal(noTarget.minuteVentilationLMin, 6);
  assert.equal(noTarget.requiredRate, null);
});

test('lib/lab-interpret.js worked calls', () => {
  // A1C 5.4 is within the ADA 4.0-5.6% range.
  const a1c = ok('lab-interpret', { 'lab-a1c': '5.4' });
  assert.equal(a1c.count, 1);
  assert.equal(a1c.interpretations[0].flag, 'within-range');
  assert.equal(a1c.interpretations[0].refHigh, 5.6);
  // A batch flags each entered analyte independently.
  const batch = ok('lab-interpret', { 'lab-potassium': '6.5', 'lab-glucose': '250' });
  assert.equal(batch.count, 2);
  assert.ok(batch.interpretations.every((i) => i.flag !== 'within-range'));
});

test('lib/medication-v4.js vasopressor worked calls', () => {
  // Dopamine (mcg/kg/min) 0.1 x 70 kg = 7 ug/min / 64 ug/mL x 60 = 6.5625 mL/hr.
  const fwd = ok('vasopressor', { 'vp-drug': 'dopamine', 'vp-w': '70', 'vp-conc': '64', 'vp-dose': '0.1' });
  assert.ok(Math.abs(fwd.rateMlHr - 6.5625) < 1e-6);
  // Norepinephrine (mcg/min) 10 / 16 ug/mL x 60 = 37.5 mL/hr (no weight needed).
  const norepi = ok('vasopressor', { 'vp-drug': 'norepinephrine', 'vp-dose': '10', 'vp-conc': '16' });
  assert.equal(norepi.rateMlHr, 37.5);
  // Reverse: 37.5 mL/hr back to 10 mcg/min.
  const rev = ok('vasopressor', { 'vp-drug': 'norepinephrine', 'vp-rate': '37.5', 'vp-conc': '16' });
  assert.equal(rev.doseFromRate, 10);
});

test('lib/medication-v4.js opioid-mme worked calls', () => {
  // Morphine (factor 1) 30 mg x 6/day = 180 MME.
  const morphine = ok('opioid-mme', { 'mme-drug': 'morphine', 'mme-mg': '30', 'mme-n': '6' });
  assert.equal(morphine.totalMme, 180);
  assert.equal(morphine.cdcJustifyThreshold, 90);
  // Hydromorphone (factor 4) 4 mg x 4/day = 64 MME.
  const hydromorphone = ok('opioid-mme', { 'mme-drug': 'hydromorphone', 'mme-mg': '4', 'mme-n': '4' });
  assert.equal(hydromorphone.totalMme, 64);
});

test('lib/tb-testing.js worked calls', () => {
  // 12 mm at the moderate (10 mm) cutoff is positive.
  const pos = ok('tb-testing', { 'tb-mm': '12', 'tb-risk': '10' });
  assert.equal(pos.positive, true);
  assert.match(pos.band, /12 mm vs cutoff 10 mm -> POSITIVE/);
  // The same 12 mm is negative at the low-risk 15 mm cutoff.
  const neg = ok('tb-testing', { 'tb-mm': '12', 'tb-risk': '15' });
  assert.equal(neg.positive, false);
});

test('lib/field.js field-triage worked calls', () => {
  // Step 1 physiologic criterion -> highest-level trauma center.
  const s1 = ok('field-triage', { 'ft-gcs-le-13': '1' });
  assert.equal(s1.step, 1);
  assert.match(s1.destination, /Highest-level trauma center/);
  // Only a Step 4 special-consideration -> clinical judgment.
  const s4 = ok('field-triage', { 'ft-older-adult': '1' });
  assert.equal(s4.step, 4);
  // No criteria met -> closest facility.
  const none = ok('field-triage', {});
  assert.equal(none.step, 0);
});

test('lib/field.js nexus-cspine worked calls', () => {
  // All five low-risk criteria met -> imaging not required.
  const cleared = ok('nexus-cspine', { 'nx-tender': '1', 'nx-intox': '1', 'nx-alert': '1', 'nx-focal': '1', 'nx-distract': '1' });
  assert.equal(cleared.criteriaMet, 5);
  assert.equal(cleared.imagingRequired, false);
  assert.match(cleared.band, /imaging NOT required/);
  // Any unmet criterion -> imaging required.
  const notCleared = ok('nexus-cspine', { 'nx-tender': '1', 'nx-intox': '1', 'nx-alert': '1', 'nx-focal': '1' });
  assert.equal(notCleared.imagingRequired, true);
});

test('lib/transfusion-v292.js worked calls', () => {
  // Hgb 6.8 in a stable adult is below the 7 g/dL restrictive threshold.
  const below = ok('transfusion-threshold', { 'tt-hb': '6.8', 'tt-pop': 'stable-adult' });
  assert.equal(below.threshold, 7);
  assert.equal(below.belowThreshold, true);
  assert.match(below.band, /below the 7 g\/dL AABB restrictive threshold/);
  // Cardiac surgery carries the verified 7.5 g/dL threshold.
  const cardiac = ok('transfusion-threshold', { 'tt-hb': '7.2', 'tt-pop': 'cardiac-surgery' });
  assert.equal(cardiac.threshold, 7.5);
  // Acute coronary syndrome yields no numeric threshold (never a fabricated number).
  const acs = ok('transfusion-threshold', { 'tt-hb': '6.5', 'tt-pop': 'acute-coronary-syndrome' });
  assert.equal(acs.threshold, null);
  assert.doesNotMatch(acs.band, /\d+(\.\d+)?\s*g\/dL/);
});

test('lib/fast-dementia-v294.js worked calls', () => {
  // Stage 7a flags the Medicare dementia hospice-eligibility context.
  const s7a = ok('fast-dementia', { 'fast-stage': '7a' });
  assert.equal(s7a.stage, '7a');
  assert.equal(s7a.hospiceContext, true);
  assert.match(s7a.band, /FAST stage 7a/);
  assert.match(s7a.band, /hospice-eligibility guideline/);
  // An earlier stage returns its descriptor with no hospice context.
  const s3 = ok('fast-dementia', { 'fast-stage': '3' });
  assert.equal(s3.hospiceContext, false);
  assert.match(s3.descriptor, /Decreased job functioning/);
});

test('lib/gds-v295.js worked calls', () => {
  // Stage 5 flags "can no longer survive without assistance".
  const s5 = ok('global-deterioration-scale', { 'gds-stage': '5' });
  assert.equal(s5.stage, '5');
  assert.equal(s5.needsAssistance, true);
  assert.match(s5.band, /GDS stage 5/);
  assert.match(s5.band, /can no longer survive without some assistance/);
  // A pre-dementia stage returns its label with no assistance flag.
  const s2 = ok('global-deterioration-scale', { 'gds-stage': '2' });
  assert.equal(s2.needsAssistance, false);
  assert.match(s2.stageLabel, /age-associated memory impairment/);
});

test('lib/benzo-equiv-v296.js worked calls', () => {
  // 2 mg lorazepam: 10 mg diazepam (VA/DoD) vs 20 mg (Ashton).
  const r = ok('benzodiazepine-equivalence', { 'bz-source': 'lorazepam', 'bz-dose': '2', 'bz-target': 'diazepam' });
  assert.equal(r.diazepamEquivVaDod, '10');
  assert.equal(r.diazepamEquivAshton, '20');
  assert.match(r.band, /2 mg lorazepam/);
  // Source -> target round trip (alprazolam -> lorazepam).
  const rt = ok('benzodiazepine-equivalence', { 'bz-source': 'alprazolam', 'bz-dose': '2', 'bz-target': 'lorazepam' });
  assert.equal(rt.targetDoseVaDod, '4');
});

test('lib/nerve-injury-v297.js worked calls', () => {
  // Grade IV flags surgical repair (perineurium disrupted).
  const s4 = ok('seddon-sunderland', { 'ni-grade': 'IV' });
  assert.equal(s4.grade, 'IV');
  assert.equal(s4.surgeryLikely, true);
  assert.match(s4.band, /Sunderland grade IV/);
  // Grade I is neurapraxia with no surgery.
  const s1 = ok('seddon-sunderland', { 'ni-grade': 'I' });
  assert.equal(s1.seddon, 'neurapraxia');
  assert.equal(s1.surgeryLikely, false);
});

test('lib/concussion-rts-v298.js worked calls', () => {
  // Step 4 (non-contact drills) requires full symptom resolution first.
  const s4 = ok('concussion-rts', { 'crts-step': '4' });
  assert.equal(s4.step, 4);
  assert.equal(s4.resolutionRequired, true);
  assert.match(s4.band, /Return-to-sport Step 4/);
  // Step 1 (symptom-limited activity) has no resolution/clearance gate.
  const s1 = ok('concussion-rts', { 'crts-step': '1' });
  assert.equal(s1.resolutionRequired, false);
  assert.equal(s1.clearanceRequired, false);
  // Step 5 (full contact) is HCP-clearance gated.
  const s5 = ok('concussion-rts', { 'crts-step': '5' });
  assert.equal(s5.clearanceRequired, true);
});

test('lib/cosyntropin-v299.js worked calls', () => {
  // 22 µg/dL is at/above the 18 µg/dL threshold: normal adrenal response.
  const normal = ok('cosyntropin-stim', { 'csy-cortisol': '22' });
  assert.equal(normal.threshold, 18);
  assert.equal(normal.normal, true);
  assert.match(normal.band, /normal adrenal response/);
  // 12 µg/dL is below threshold: suggestive of adrenal insufficiency.
  const low = ok('cosyntropin-stim', { 'csy-cortisol': '12' });
  assert.equal(low.abnormal, true);
  // nmol/L unit switches to the 500 nmol/L threshold.
  const metric = ok('cosyntropin-stim', { 'csy-cortisol': '520', 'csy-unit': 'nmol/L' });
  assert.equal(metric.threshold, 500);
  assert.equal(metric.normal, true);
});

test('lib/av-fistula-v300.js worked calls', () => {
  // 700 / 7 / 4 meets all three Rule of 6s criteria.
  const all = ok('avf-rule-of-6s', { 'avf-flow': '700', 'avf-diameter': '7', 'avf-depth': '4' });
  assert.equal(all.allMet, true);
  assert.equal(all.metCount, 3);
  assert.match(all.band, /All three Rule of 6s criteria met/);
  // Low flow drops one criterion.
  const low = ok('avf-rule-of-6s', { 'avf-flow': '500', 'avf-diameter': '7', 'avf-depth': '4' });
  assert.equal(low.flowOk, false);
  assert.equal(low.allMet, false);
  assert.equal(low.metCount, 2);
});

test('lib/dr-severity-v301.js worked calls', () => {
  // Venous beading -> severe NPDR (grade 4) via the 4-2-1 rule.
  const severe = ok('icdr-retinopathy', { 'dr-vb': true });
  assert.equal(severe.grade, 4);
  assert.match(severe.name, /Severe NPDR/);
  // Neovascularization -> proliferative DR (grade 5), overriding lesser findings.
  const pdr = ok('icdr-retinopathy', { 'dr-neo': true, 'dr-ma': true });
  assert.equal(pdr.grade, 5);
  assert.equal(pdr.proliferative, true);
});

test('lib/isis-v302.js worked calls', () => {
  // age + competitive + Hill-Sachs + glenoid = 8 -> high recurrence risk (>6).
  const high = ok('isis-shoulder', { 'isis-age': true, 'isis-comp': true, 'isis-hs': true, 'isis-glenoid': true });
  assert.equal(high.total, 8);
  assert.equal(high.highRisk, true);
  assert.match(high.band, /an open procedure/);
  // age + competitive + Hill-Sachs = 6 -> not high risk (cutoff is strict >6).
  const six = ok('isis-shoulder', { 'isis-age': true, 'isis-comp': true, 'isis-hs': true });
  assert.equal(six.total, 6);
  assert.equal(six.highRisk, false);
});

test('lib/anaphylaxis-v303.js worked calls', () => {
  // Grade III is life-threatening; grade I is not.
  const g3 = ok('anaphylaxis-grade', { 'anp-grade': 'III' });
  assert.equal(g3.grade, 'III');
  assert.equal(g3.lifeThreatening, true);
  assert.match(g3.band, /Ring & Messmer grade III/);
  const g1 = ok('anaphylaxis-grade', { 'anp-grade': 'I' });
  assert.equal(g1.lifeThreatening, false);
});

test('lib/dst-v304.js worked calls', () => {
  // 3 µg/dL is at/above the 1.8 cutoff -> failure to suppress.
  const fail = ok('dexamethasone-suppression', { 'dst-cortisol': '3' });
  assert.equal(fail.cutoff, 1.8);
  assert.equal(fail.abnormal, true);
  assert.match(fail.band, /failure to suppress/);
  // 1.2 µg/dL suppresses normally.
  const norm = ok('dexamethasone-suppression', { 'dst-cortisol': '1.2' });
  assert.equal(norm.suppressed, true);
  // nmol/L unit switches to the 50 nmol/L cutoff.
  const metric = ok('dexamethasone-suppression', { 'dst-cortisol': '40', 'dst-unit': 'nmol/L' });
  assert.equal(metric.cutoff, 50);
  assert.equal(metric.suppressed, true);
});

test('lib/crs-v305.js worked calls', () => {
  // Fever + one vasopressor -> ASTCT CRS grade 3 (severe).
  const g3 = ok('crs-grade', { 'crs-fever': true, 'crs-hypotension': 'onevaso' });
  assert.equal(g3.grade, 3);
  assert.equal(g3.severe, true);
  assert.match(g3.band, /ASTCT CRS grade 3 of 4/);
  // The more severe axis wins: no-vaso hypotension (2) + positive-pressure hypoxia (4) -> grade 4.
  const g4 = ok('crs-grade', { 'crs-fever': true, 'crs-hypotension': 'novaso', 'crs-hypoxia': 'pospressure' });
  assert.equal(g4.grade, 4);
  // Fever alone -> grade 1.
  assert.equal(ok('crs-grade', { 'crs-fever': true }).grade, 1);
});

test('lib/icans-v306.js worked calls', () => {
  // ICE 1 -> ASTCT ICANS grade 3 (severe).
  const g3 = ok('icans-grade', { 'icans-ice': '1' });
  assert.equal(g3.grade, 3);
  assert.equal(g3.severe, true);
  assert.match(g3.band, /ICANS grade 3 of 4/);
  // The most severe domain wins: mild ICE 9 but unarousable -> grade 4.
  const g4 = ok('icans-grade', { 'icans-ice': '9', 'icans-loc': 'unarousable' });
  assert.equal(g4.grade, 4);
  // ICE 10, nothing else -> no ICANS (grade 0).
  assert.equal(ok('icans-grade', { 'icans-ice': '10' }).grade, 0);
});

test('lib/dme-v307.js worked calls', () => {
  // Present + involving -> severe, center-involving DME.
  const severe = ok('dme-severity', { 'dme-present': true, 'dme-location': 'involving' });
  assert.equal(severe.name, 'Severe DME');
  assert.equal(severe.centerInvolving, true);
  // Present + distant -> mild.
  const mild = ok('dme-severity', { 'dme-present': true, 'dme-location': 'distant' });
  assert.equal(mild.name, 'Mild DME');
  // Absent.
  const absent = ok('dme-severity', { 'dme-present': false });
  assert.equal(absent.level, 'absent');
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
