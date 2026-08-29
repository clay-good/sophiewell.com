// spec-v851: the Rassi score for death in chronic Chagas heart disease.
//
// Source:
//   Rassi A Jr, Rassi A, Little WC, et al. Development and validation of a risk score for
//   predicting death in Chagas' heart disease. N Engl J Med. 2006;355(8):799-808.
//
//   NYHA class III or IV                                       5
//   Cardiomegaly on chest radiograph                           5
//   Segmental or global wall-motion abnormality on echo        3
//   Nonsustained ventricular tachycardia on 24-hour Holter     3
//   Low QRS voltage on the ECG                                 2
//   Male sex                                                   2
//   Total 0 to 20.
//
//   0-6    low            10 percent 10-year mortality
//   7-11   intermediate   44 percent
//   12-20  high           84 percent
//
// THERE IS NO EJECTION FRACTION IN IT. A reader arriving from any other cardiomyopathy score
// will look for one and not find it. The model carries ventricular function as two coarse
// terms instead - cardiomegaly on a CHEST RADIOGRAPH and a BINARY wall-motion abnormality on
// echo - because it was derived where those were the tests actually available, and it was
// validated as it stands. Substituting an ejection fraction for either term is not this score.
//
// LOW RISK HERE IS A 10 PERCENT CHANCE OF BEING DEAD IN TEN YEARS, in a cohort whose mean age
// was 47. The band names are relative to this disease, not to a general population.
//
// MALE SEX IS A TERM IN THE MODEL, worth 2 points. It is unusual and it is deliberate.
//
// IT PREDICTS ALL-CAUSE DEATH - not sudden death specifically, and not the need for a
// defibrillator, a pacemaker or transplantation.
//
// Pure: no DOM, no clock, no network.

export const RASSI_NOTE = 'The Rassi score (Rassi A Jr, Rassi A, Little WC, et al, New England Journal of Medicine 2006;355(8):799-808) predicts death in chronic Chagas heart disease from six findings. Class III or IV symptoms score 5, an enlarged heart on the chest radiograph scores 5, a segmental or global wall-motion abnormality on echocardiography scores 3, nonsustained ventricular tachycardia on a 24-hour Holter scores 3, low QRS voltage on the ECG scores 2 and male sex scores 2, for a total of 0 to 20. A total of 0 to 6 is the low band, with 10 percent mortality at ten years; 7 to 11 is intermediate, at 44 percent; and 12 to 20 is high, at 84 percent. Two things about it are worth knowing. There is no ejection fraction in the model. It carries ventricular function as two coarser terms instead, an enlarged heart on the chest radiograph and a yes-or-no wall-motion abnormality on echocardiography, because it was derived where those were the tests available, and it was validated as it stands; substituting an ejection fraction for either term is not this score. And the low band is not a reassuring one. A 10 percent chance of being dead in ten years, in a group whose average age was 47, is what low means here; the names are relative to this disease rather than to a general population. The score predicts death from any cause. It does not predict sudden death specifically and it does not select a defibrillator, a pacemaker or transplantation. It reports a published score and the published mortality figures that go with it.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const ITEMS = [
  { arg: 'nyhaClass34', points: 5, name: 'class III or IV symptoms' },
  { arg: 'cardiomegaly', points: 5, name: 'an enlarged heart on the chest radiograph' },
  { arg: 'wallMotion', points: 3, name: 'a wall-motion abnormality on echocardiography' },
  { arg: 'nsvt', points: 3, name: 'nonsustained ventricular tachycardia on Holter' },
  { arg: 'lowVoltage', points: 2, name: 'low QRS voltage on the ECG' },
  { arg: 'maleSex', points: 2, name: 'male sex' },
];

const BANDS = [
  { max: 6, label: 'low', mortality: 10 },
  { max: 11, label: 'intermediate', mortality: 44 },
  { max: 20, label: 'high', mortality: 84 },
];

export function rassiChagas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = ITEMS.filter((it) => truthy(o[it.arg]));
  const score = scored.reduce((sum, it) => sum + it.points, 0);
  const band = BANDS.find((b) => score <= b.max);

  // The error this tile exists to prevent: the model has no ejection fraction, and the
  // absence reads as an omission.
  const noEfNote = 'There is no ejection fraction in this score. It carries ventricular function as two coarser terms instead - an enlarged heart on the chest radiograph and a yes-or-no wall-motion abnormality on echocardiography - because it was derived where those were the tests available, and it was validated that way. Substituting an ejection fraction for either term is not this score.';

  // The band name is relative to this disease. Printed with its figure every time.
  const bandMeaningNote = `${band.label.charAt(0).toUpperCase()}${band.label.slice(1)} here means about ${band.mortality} percent mortality at ten years${band.label === 'low' ? ', in a group whose average age was 47. It is a band of this disease, not a reassuring number' : ''}.`;

  const sexNote = truthy(o.maleSex)
    ? 'Male sex is a scored term in this model, worth 2 points. That is unusual among risk scores and it is deliberate.'
    : null;

  const scopeNote = 'The score predicts death from any cause. It does not predict sudden death specifically, and it does not select a defibrillator, a pacemaker or transplantation.';

  return {
    valid: true,
    score,
    riskLabel: band.label,
    mortalityTenYear: band.mortality,
    items: scored.map((it) => it.name),
    noEfNote,
    bandMeaningNote,
    sexNote,
    scopeNote,
    abnormal: band.label !== 'low',
    bandLabel: `${band.label} risk`,
    band: `Rassi score ${score} of 20 — ${band.label} risk, about ${band.mortality} percent mortality at ten years.`,
    detail: 'Class III or IV symptoms score 5, an enlarged heart on the chest radiograph 5, a wall-motion abnormality on echocardiography 3, nonsustained ventricular tachycardia on Holter 3, low QRS voltage 2 and male sex 2. A total of 0 to 6 is low at 10 percent ten-year mortality, 7 to 11 is intermediate at 44 percent, and 12 to 20 is high at 84 percent.',
    note: RASSI_NOTE,
  };
}
