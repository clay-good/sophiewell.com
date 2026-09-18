// spec-v1400: the hepatitis B serology interpreter.
//
// Sources:
//   CDC. Interpretation of Hepatitis B Serologic Test Results.
//     https://www.cdc.gov/hepatitis-b/hcp/diagnosis-testing/index.html
//   Conners EE, Panagiotakopoulos L, Hofmeister MG, et al. Screening and Testing for Hepatitis B
//     Virus Infection: CDC Recommendations - United States, 2023. MMWR Recomm Rep. 2023;72(1):1-25.
//     PMID 36893044.
//
//   HBsAg  total anti-HBc  IgM anti-HBc  anti-HBs   reading
//   -      -               .             -          susceptible, never infected
//   -      -               .             +          immune from vaccination
//   -      +               .             +          immune from natural infection
//   +      +               +             -          acute infection
//   +      +               -             -          chronic infection
//   -      +               .             -          ISOLATED anti-HBc: four possibilities
//
// ISOLATED anti-HBc IS NOT IMMUNITY. It can be a resolved infection with waned anti-HBs (the
// commonest), a false-positive anti-HBc (so the person is susceptible), low-level chronic
// infection, or a resolving acute infection. The tile prints all four rather than choosing.
//
// A MARKER NOT DONE IS NOT A NEGATIVE. With anti-HBs not done the tile cannot say "immune", and it
// names what the missing marker would have distinguished.
//
// Pure: no DOM, no clock, no network.

export const HBV_NOTE = 'CDC interpretation of hepatitis B serology. HBsAg shows current infection; total anti-HBc shows infection at some time; IgM anti-HBc shows recent (acute) infection; anti-HBs shows immunity, from vaccination when anti-HBc is negative and from natural infection when it is positive. An isolated anti-HBc has four possible meanings and is not immunity. CDC (2023) recommends screening every adult 18 or older at least once with the triple panel: HBsAg, anti-HBs, and total anti-HBc. It interprets the results entered and is not a diagnosis.';

export const MARKER = [
  { value: 'positive', text: 'Positive' },
  { value: 'negative', text: 'Negative' },
  { value: 'not-done', text: 'Not done' },
];

const ISOLATED = [
  'resolved infection, with anti-HBs that has waned below detection (the most common)',
  'a false-positive anti-HBc, in which case the person is susceptible',
  'low-level chronic infection, with HBsAg below detection',
  'resolving acute infection, after HBsAg has cleared and before anti-HBs appears',
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

function result(key, bandLabel, band, nextStep, abnormal, extra = {}) {
  return { valid: true, interpretation: key, bandLabel, band, nextStep, abnormal, possibilities: [], cannotTell: null, ...extra };
}

export function hbvSerology(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const keys = [['hbsag', 'HBsAg'], ['antiHbc', 'total anti-HBc'], ['igmAntiHbc', 'IgM anti-HBc'], ['antiHbs', 'anti-HBs']];
  const blank = keys.filter(([k]) => isBlank(o[k])).map(([, name]) => name);
  if (blank.length) {
    return { valid: false, message: `Mark each marker positive, negative, or not done: ${blank.join(', ')}. A blank is not a negative result, and reading it as one is how "immune" gets printed on an incomplete panel.` };
  }
  for (const [k, name] of keys) {
    if (!['positive', 'negative', 'not-done'].includes(o[k])) return { valid: false, message: `Choose positive, negative, or not done for ${name}.` };
  }
  const s = o.hbsag;
  const c = o.antiHbc;
  const m = o.igmAntiHbc;
  const a = o.antiHbs;

  const r = interpret(s, c, m, a);
  return {
    ...r,
    screeningNote: 'CDC 2023: screen every adult 18 or older at least once with the triple panel (HBsAg, anti-HBs, total anti-HBc).',
    postureNote: 'Decision support, not a verdict. Vaccination history, exposures, liver tests, and HBV DNA decide what a pattern means for this patient.',
    note: HBV_NOTE,
  };
}

function interpret(s, c, m, a) {
  if (s === 'positive') {
    if (c === 'positive') {
      if (m === 'positive') return result('acute', 'Acute infection', 'HBsAg, total anti-HBc, and IgM anti-HBc positive: acute hepatitis B infection.', 'Check liver tests and HBV DNA; test and vaccinate household and sexual contacts; report as required.', true);
      if (m === 'negative') return result('chronic', 'Chronic infection', 'HBsAg and total anti-HBc positive with IgM anti-HBc negative: chronic hepatitis B infection.', 'Link to care: HBeAg, HBV DNA, liver tests, and evaluation for treatment and liver cancer surveillance; test and vaccinate contacts.', true);
      return result('infected-acute-or-chronic', 'Current infection: acute or chronic?', 'HBsAg and total anti-HBc positive: current hepatitis B infection. Whether it is acute or chronic needs the IgM anti-HBc, which was not done.', 'Order IgM anti-HBc, or repeat HBsAg in 6 months (persistence means chronic infection).', true, { cannotTell: 'acute versus chronic infection' });
    }
    if (c === 'negative') return result('hbsag-only', 'HBsAg positive, anti-HBc negative', 'HBsAg positive with total anti-HBc negative: very early acute infection before antibody appears, or a transiently positive HBsAg shortly after hepatitis B vaccination.', 'Ask about vaccination in the past weeks; repeat HBsAg and anti-HBc, and check HBV DNA.', true);
    return result('infected', 'Current infection', 'HBsAg positive: current hepatitis B infection. Acute versus chronic needs total and IgM anti-HBc, which were not both done.', 'Order total and IgM anti-HBc, and HBV DNA.', true, { cannotTell: 'acute versus chronic infection' });
  }

  if (s === 'not-done') {
    return result('no-hbsag', 'Current infection not assessed', 'HBsAg was not done, so current infection can be neither shown nor excluded by this panel.', 'Order HBsAg. The triple panel (HBsAg, anti-HBs, total anti-HBc) answers all three questions at once.', false, { cannotTell: 'whether there is a current infection' });
  }

  // HBsAg negative.
  if (m === 'positive') {
    return result('resolving-acute', 'Recent infection, HBsAg cleared', 'HBsAg negative with IgM anti-HBc positive: a recent infection in which HBsAg has already cleared (the window period of acute infection).', 'Repeat the panel with anti-HBs in several weeks to confirm recovery; check HBV DNA if there is any doubt.', true);
  }
  if (c === 'positive') {
    if (a === 'positive') return result('immune-natural', 'Immune from natural infection', 'HBsAg negative, total anti-HBc and anti-HBs positive: immune from a past, resolved infection.', 'No vaccination needed. Past infection can reactivate under strong immunosuppression, such as rituximab or chemotherapy.', false);
    if (a === 'negative') {
      return result('isolated-anti-hbc', 'Isolated anti-HBc: four possibilities', 'HBsAg and anti-HBs negative with total anti-HBc positive: isolated anti-HBc. This is not immunity. It has four possible meanings.', 'Check HBV DNA (to find low-level chronic infection) and repeat the panel; if DNA is undetectable, one vaccine dose followed by anti-HBs testing can separate a false-positive anti-HBc from past infection. Consider reactivation risk before immunosuppression.', true, { possibilities: ISOLATED });
    }
    return result('past-infection', 'Past infection; immunity not shown', 'HBsAg negative with total anti-HBc positive: infection at some time, not current by HBsAg. Anti-HBs was not done, so the panel cannot tell a resolved infection with protective antibody from an isolated anti-HBc.', 'Order anti-HBs. If it is negative, this is isolated anti-HBc, which has four possible meanings and is not immunity.', false, { cannotTell: 'immunity after resolved infection versus isolated anti-HBc' });
  }
  if (c === 'negative') {
    if (a === 'positive') return result('immune-vaccine', 'Immune from vaccination', 'HBsAg and total anti-HBc negative with anti-HBs positive: immune from hepatitis B vaccination.', 'No further vaccination needed for most people.', false);
    if (a === 'negative') return result('susceptible', 'Susceptible', 'HBsAg, total anti-HBc, and anti-HBs all negative: never infected and not immune. Susceptible.', 'Vaccinate.', false);
    return result('not-infected-immunity-unknown', 'Never infected; immunity not shown', 'HBsAg and total anti-HBc negative: no current or past infection. Anti-HBs was not done, so the panel cannot tell immunity from vaccination from susceptibility.', 'Check vaccination records, or order anti-HBs; vaccinate if not immune.', false, { cannotTell: 'immunity from vaccination versus susceptibility' });
  }
  // HBsAg negative, total anti-HBc not done.
  if (a === 'positive') return result('anti-hbs-only', 'Anti-HBs positive; source not shown', 'HBsAg negative and anti-HBs positive: immune, but total anti-HBc was not done, so the panel cannot tell immunity from vaccination from immunity after natural infection.', 'Order total anti-HBc if the source matters, for example before immunosuppression.', false, { cannotTell: 'vaccination versus past infection' });
  if (a === 'negative') return result('not-current-unknown-past', 'No current infection; past infection not assessed', 'HBsAg and anti-HBs negative: no current infection and no immunity shown. Total anti-HBc was not done, so the panel cannot tell susceptibility from an isolated anti-HBc.', 'Order total anti-HBc; if it is negative, vaccinate.', false, { cannotTell: 'susceptibility versus isolated anti-HBc' });
  return result('not-current-only', 'No current infection; nothing else assessed', 'HBsAg negative: no current infection by this marker. Neither total anti-HBc nor anti-HBs was done, so past infection and immunity are not assessed.', 'Order total anti-HBc and anti-HBs; together with HBsAg they are the triple panel CDC recommends.', false, { cannotTell: 'past infection, immunity, or susceptibility' });
}
