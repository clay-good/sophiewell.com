// spec-v1561 tool 8: lymphedema stage (1-7) of a leg or arm in lymphatic filariasis (Dreyer).
//
// Source: Dreyer G, Addiss D, Dreyer P, Noroes J. Lymphoedema staff manual: treatment and prevention of
// problems associated with lymphatic filariasis. WHO/CDS/CPE/CEE/2001.26a (IRIS 10665/67224; all rights
// reserved, facts restated). Read October 6, 2026, pp. 9-13: stage each side separately, the foot and leg
// together, by the highest stage present; stage only after recovery from an acute attack (usually 30 days).
// 1: swelling reversible overnight. 2: not reversible overnight. 3: shallow skin folds. 4: knobs (bumps,
// lumps). 5: deep skin folds. 6: mossy foot. 7: unable to do routine daily activities independently. The
// stages apply to legs and arms, not breast or genitals; the authors say the scheme still needs field
// testing. WHO's grades (p. 9): I mostly pitting, reversible on elevation; II mostly non-pitting, not
// reversible; III elephantiasis (gross volume increase with dermatosclerosis and papillomatous lesions).
//
// Stated rather than hidden: a feature left blank is not assessed, so the stage is "at least". The WHO
// grade crosswalk is given only where it is clean (stage 1 is grade I; stage 2 and above are grade II or
// III); grade III is described, not assigned.
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const FOLD_OPTIONS = [
  { value: 'none', text: 'No skin folds' },
  { value: 'shallow', text: 'Shallow skin folds' },
  { value: 'deep', text: 'Deep skin folds' },
];

const NOTE = 'This follows the WHO lymphoedema staff manual (Dreyer, 2001). Its authors note the 7 stages still need field testing.';
const known = (v) => v === 'yes' || v === 'no';

export function filarialLymphedemaStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!known(o.attack)) return { valid: false, message: 'Choose whether there has been an acute attack in the last 30 days: staging waits until recovery.' };
  if (!known(o.reversible)) return { valid: false, message: 'Choose whether the swelling goes down overnight.' };
  const out = (band, label, abnormal, notes) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const crosswalk = 'WHO grades: I mostly pitting and reversible on elevation; II mostly non-pitting, not reversible; III elephantiasis (gross volume, hardened skin, papillomatous lesions).';

  if (o.attack === 'yes') return out('Do not stage yet: an acute attack in the last 30 days makes staging inaccurate. Treat the attack and stage after recovery, usually 30 days later.', 'Stage after recovery', true, []);
  if (o.reversible === 'yes') {
    const extra = [];
    if (o.folds === 'shallow' || o.folds === 'deep' || o.knobs === 'yes' || o.mossy === 'yes' || o.daily === 'yes') extra.push('Folds, knobs, a mossy foot or disability belong to stages 3 to 7, where swelling does not go down overnight: check the overnight answer.');
    return out('Stage 1: swelling that goes down overnight (WHO grade I).', 'Stage 1', true, [...extra, crosswalk, 'Repeated acute attacks make lymphedema progress.']);
  }

  const features = [
    ['daily', o.daily === 'yes', known(o.daily), 7, 'unable to manage daily activities independently'],
    ['mossy', o.mossy === 'yes', known(o.mossy), 6, 'a mossy foot'],
    ['deep', o.folds === 'deep', !!o.folds, 5, 'deep skin folds'],
    ['knobs', o.knobs === 'yes', known(o.knobs), 4, 'knobs'],
    ['shallow', o.folds === 'shallow', !!o.folds, 3, 'shallow skin folds'],
  ];
  const hit = features.find(([, yes]) => yes);
  const stage = hit ? hit[3] : 2;
  const what = hit ? hit[4] : 'swelling that does not go down overnight, with no folds, knobs or mossy foot';
  const open = features.filter(([, , isKnown, s]) => !isKnown && s > stage).map(([, , , , t]) => t);
  const uniq = [...new Set(open.map((t) => (t.includes('skin folds') ? 'skin folds' : t)))];
  const notes = [];
  if (uniq.length) notes.push(`Not assessed: ${uniq.join(', ')}. The stage could be higher.`);
  notes.push(crosswalk);
  if (stage >= 5) notes.push('Expect entry lesions between the toes and in the folds: wash, dry and treat them to prevent acute attacks.');
  if (stage === 7) notes.push('Needs help from family and the health system.');
  return out(`${uniq.length ? 'At least stage' : 'Stage'} ${stage}: ${what}.`, `${uniq.length ? 'At least stage' : 'Stage'} ${stage}`, true, notes);
}
