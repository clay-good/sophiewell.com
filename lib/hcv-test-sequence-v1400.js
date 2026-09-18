// spec-v1400: the hepatitis C testing sequence.
//
// Sources:
//   CDC. Testing for HCV infection: an update of guidance for clinicians and laboratorians. MMWR
//     Morb Mortal Wkly Rep. 2013;62(18):362-365. PMID 23657112.
//   Schillie S, Wester C, Osborne M, Wesolowski L, Ryerson AB. CDC Recommendations for Hepatitis C
//     Screening Among Adults - United States, 2020. MMWR Recomm Rep. 2020;69(2):1-17. PMID 32271723.
//
//   antibody nonreactive                   no HCV antibody detected
//   antibody reactive, RNA detected        current HCV infection
//   antibody reactive, RNA not detected    no current HCV infection (past, resolved infection, or a
//                                          false-positive antibody -- only a different antibody
//                                          assay tells them apart, and rarely needs to)
//   antibody reactive, RNA not done        RNA NEEDED: a reactive antibody alone is not a diagnosis
//
// THE READING THIS TILE PREVENTS: a reactive antibody read as current infection. Some 15 to 45% of
// people infected clear the virus on their own and stay antibody-positive. Until RNA is back the tile will not say whether
// there is an infection at all.
//
// A recent exposure changes the nonreactive branch: antibody can take weeks to appear, so an early
// infection is found by RNA testing (or by repeating the antibody later), not by a single
// nonreactive antibody.
//
// Pure: no DOM, no clock, no network.

export const HCV_NOTE = 'CDC testing sequence for hepatitis C. A reactive antibody means infection at some time, not necessarily now; HCV RNA decides whether there is a current infection. A reactive antibody with RNA not detected is no current infection: a past infection that has resolved, or a false-positive antibody. After a possible exposure in the past 6 months, test for RNA or repeat the antibody later, because antibody can lag. CDC (2020) recommends screening every adult at least once and every pregnant person in each pregnancy. It interprets the results entered and is not a diagnosis.';

export const ANTIBODY = [
  { value: 'reactive', text: 'Reactive' },
  { value: 'nonreactive', text: 'Nonreactive' },
];
export const RNA = [
  { value: 'detected', text: 'Detected' },
  { value: 'not-detected', text: 'Not detected' },
  { value: 'not-done', text: 'Not done yet' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function hcvTestSequence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.antibody)) {
    return { valid: false, message: 'Enter the HCV antibody result, reactive or nonreactive.' };
  }
  if (isBlank(o.rna)) {
    return { valid: false, message: 'Enter the HCV RNA result, or mark it not done. A blank is not "not detected".' };
  }
  if (isBlank(o.recentExposure)) {
    return { valid: false, message: 'Answer whether there was a possible exposure in the past 6 months. It decides whether a nonreactive antibody can be trusted.' };
  }
  const recent = o.recentExposure === 'yes';

  let r;
  if (o.antibody === 'nonreactive') {
    if (o.rna === 'detected') {
      r = { interpretation: 'current-seronegative', bandLabel: 'Current infection, antibody not yet formed', band: 'HCV RNA detected with a nonreactive antibody: current HCV infection, most often early infection before antibody appears, or in a person who is immunocompromised.', nextStep: 'Link to care for evaluation and treatment. Repeat the antibody later to document seroconversion.', abnormal: true };
    } else if (recent && o.rna === 'not-done') {
      r = { interpretation: 'window', bandLabel: 'No antibody detected; early infection not excluded', band: 'HCV antibody nonreactive after a possible exposure in the past 6 months. Antibody can take weeks to appear, so this does not exclude an early infection.', nextStep: 'Test for HCV RNA now, or repeat the antibody later. RNA testing is how an early infection is found.', abnormal: false };
    } else {
      r = { interpretation: 'no-antibody', bandLabel: 'No HCV antibody detected', band: 'HCV antibody nonreactive: no HCV antibody detected.', nextStep: recent ? 'RNA was not detected, so there is no evidence of current infection. With ongoing risk, repeat testing periodically.' : 'No further HCV testing is needed now. With ongoing risk, repeat testing periodically.', abnormal: false };
    }
  } else if (o.antibody === 'reactive') {
    if (o.rna === 'detected') {
      r = { interpretation: 'current', bandLabel: 'Current HCV infection', band: 'HCV antibody reactive and HCV RNA detected: current HCV infection.', nextStep: 'Link to care for evaluation and curative treatment; counsel on reducing transmission.', abnormal: true };
    } else if (o.rna === 'not-detected') {
      r = { interpretation: 'no-current', bandLabel: 'No current HCV infection', band: 'HCV antibody reactive with HCV RNA not detected: no current HCV infection. This is either a past infection that has resolved or a false-positive antibody.', nextStep: recent ? 'After a possible exposure in the past 6 months, repeat the RNA test, because the virus can be intermittently undetectable early on.' : 'No treatment is needed. A different antibody assay distinguishes past infection from a false-positive antibody, if that matters. The antibody stays reactive after cure or clearance, so future screening needs RNA.', abnormal: false };
    } else {
      r = { interpretation: 'rna-needed', bandLabel: 'HCV RNA needed', band: 'HCV antibody reactive, RNA not done yet. A reactive antibody alone is not a diagnosis: it shows exposure at some time, and many people with antibody have cleared the virus.', nextStep: 'Order HCV RNA, ideally as a reflex on the same specimen. Only RNA says whether there is a current infection.', abnormal: true };
    }
  } else {
    return { valid: false, message: 'Choose reactive or nonreactive for the HCV antibody.' };
  }

  return {
    valid: true,
    ...r,
    screeningNote: 'CDC 2020: screen every adult 18 or older at least once, and every pregnant person during each pregnancy, except where the HCV positivity rate is under 0.1%.',
    postureNote: 'Decision support, not a verdict. Risk history and liver tests decide what the results mean for this patient.',
    note: HCV_NOTE,
  };
}
