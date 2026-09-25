// spec-v1441: Wellens syndrome -- the precordial T-wave pattern of critical LAD stenosis.
//
// Sources, read 2026-09-24:
//   de Zwaan C, Bar FW, Wellens HJ. Characteristic electrocardiographic pattern indicating a critical
//     stenosis high in left anterior descending coronary artery in patients admitted because of
//     impending myocardial infarction. Am Heart J 1982;103(4 Pt 2):730-736 -- the description.
//   Rhinehardt J, Brady WJ, Perron AD, Mattu A. Electrocardiographic manifestations of Wellens'
//     syndrome. Am J Emerg Med 2002;20(7):638-643 (abstract, PubMed 12442245): "T-wave changes plus
//     a history of anginal chest pain without serum marker abnormalities; patients lack Q waves and
//     significant ST-segment elevation; such patients show normal precordial R-wave progression. The
//     natural history of Wellens' syndrome is anterior wall acute myocardial infarction."
//   The criteria as commonly listed (World J Cardiol 2023, PMC10600782): isoelectric or minimally
//     elevated (< 1 mm) ST segment; no precordial Q waves; deeply inverted or biphasic T waves in
//     V2-V3, possibly extending to V1-V6; pattern present in the pain-free state; preserved
//     precordial R-wave progression; recent angina; "normal or elevated serum cardiac markers".
//   Type A biphasic, type B deeply inverted, type B about 75% of cases (Clin Case Rep 2025,
//     PMC12067551). "there is not a consensus on whether cardiac biomarkers must be within normal
//     limits", and the pattern "can later instead meet ST-elevation myocardial infarction (STEMI)
//     criteria" (Clin Pract Cases Emerg Med 2025, PMC12342681). The same pattern has been reported
//     with right coronary or circumflex stenosis, and with normal coronaries (pseudo-Wellens).
//
// Every finding is required: the pattern is a conjunction, and a blank Q-wave or R-wave answer read as
// "normal" would call the pattern met. Pure: no DOM, no clock, no network.

export const WELLENS_T = [
  { value: 'biphasic', text: 'Biphasic in V2-V3 (type A)' },
  { value: 'deep', text: 'Deeply and symmetrically inverted in V2-V3 (type B)' },
  { value: 'neither', text: 'Neither' },
];
export const WELLENS_ST = [
  { value: 'minimal', text: 'Isoelectric or elevated less than 1 mm' },
  { value: 'elevated', text: 'Elevated 1 mm or more' },
];
export const WELLENS_R = [
  { value: 'preserved', text: 'Preserved' },
  { value: 'poor', text: 'Poor' },
];
export const WELLENS_MARKERS = [
  { value: 'normal', text: 'Normal' },
  { value: 'mild', text: 'Mildly elevated' },
  { value: 'marked', text: 'Clearly elevated' },
];
export const WELLENS_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function wellensCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = {
    t: pick(WELLENS_T, o.tWave),
    st: pick(WELLENS_ST, o.st),
    q: pick(WELLENS_YES_NO, o.qWaves),
    r: pick(WELLENS_R, o.rProgression),
    angina: pick(WELLENS_YES_NO, o.angina),
    painFree: pick(WELLENS_YES_NO, o.painFree),
    markers: pick(WELLENS_MARKERS, o.markers),
  };
  const labels = { t: 'the T-wave pattern', st: 'the ST segment', q: 'precordial Q waves', r: 'R-wave progression', angina: 'recent anginal chest pain', painFree: 'whether the tracing was taken pain-free', markers: 'the cardiac markers' };
  const missing = Object.keys(f).filter((k) => f[k] === null).map((k) => labels[k]);
  if (missing.length) {
    return { valid: false, message: `Answer every finding: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. The pattern is a conjunction, so a blank cannot count as normal.` };
  }

  const fails = [];
  if (f.t === 'neither') fails.push('no biphasic or deeply inverted T waves in V2-V3');
  if (f.st === 'elevated') fails.push('ST elevation of 1 mm or more (read it against STEMI criteria instead)');
  if (f.q === 'yes') fails.push('precordial Q waves');
  if (f.r === 'poor') fails.push('poor R-wave progression');
  if (f.angina === 'no') fails.push('no recent anginal chest pain');
  if (f.painFree === 'no') fails.push('the tracing was not taken in the pain-free state');
  if (f.markers === 'marked') fails.push('clearly elevated cardiac markers');

  const notes = [];
  if (f.markers === 'mild') {
    notes.push('Mildly elevated markers: Rhinehardt 2002 described the syndrome without marker abnormalities, other criteria lists allow normal or elevated markers, and a 2025 review found no consensus. This tool counts it and says so.');
  }
  const type = f.t === 'biphasic' ? 'A' : f.t === 'deep' ? 'B' : null;
  const met = fails.length === 0;
  if (!met) notes.push('Not meeting these criteria does not rule out an acute coronary syndrome.');
  notes.push('The natural history is anterior wall myocardial infarction, and a Wellens tracing can progress to meet STEMI criteria.');
  notes.push('The same pattern has been reported with right coronary or circumflex stenosis, and with normal coronaries (pseudo-Wellens).');

  return {
    valid: true,
    // Not meeting the criteria because of ST elevation or clearly raised markers is not reassuring.
    abnormal: met || f.st === 'elevated' || f.markers === 'marked',
    met,
    type,
    fails,
    band: met
      ? `Meets the Wellens criteria, type ${type}: the precordial T-wave pattern associated with critical proximal LAD stenosis.`
      : `Does not meet the Wellens criteria: ${fails.join('; ')}.`,
    bandLabel: met ? `Wellens type ${type}` : 'Criteria not met',
    notes,
    note: 'de Zwaan C et al, Am Heart J 1982; Rhinehardt J et al, Am J Emerg Med 2002. A pattern-recognition aid for a tracing already in hand, not a rule-out for acute coronary syndrome.',
  };
}
