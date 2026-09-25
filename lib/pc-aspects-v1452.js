// spec-v1452: posterior circulation ASPECTS (pc-ASPECTS), the 10-point read of early ischemic
// change in the posterior circulation.
//
// Sources, read 2026-09-24:
//   Puetz V, Sylaja PN, Coutts SB, et al. Extent of hypoattenuation on CT angiography source
//     images predicts functional outcome in patients with basilar artery occlusion. Stroke
//     2008;39(9):2485-2490 -- the original (not open access; DOI confirmed via Crossref).
//   Lu WZ, Lin HA, Bai CH, Lin SF, Barboza MA. Posterior circulation acute stroke prognosis early
//     CT scores in predicting functional outcomes: a meta-analysis. PLoS One 2021;16(2):e0246906
//     (PMC7886215). The weights: "each side of the cerebellum (1 point), occipital lobe (1 point),
//     thalamus (1 point), pons (2 point), and midbrain (2 point)". Its conclusion: "PC-ASPECTS of <7
//     was the most reasonable cut-offs", with high heterogeneity across the pooled studies.
//   Garg R, Biller J. Neuroimaging predictors of clinical outcome in acute basilar artery
//     occlusion. Front Neurol 2017;8:293 (PMC5474464), tabulating Puetz: "1 point is subtracted for
//     early ischemic changes in the thalami, occipital cortex, and cerebellar hemispheres; and 2
//     points are subtracted if changes are present bilaterally. Additionally, 2 points are
//     subtracted for early ischemic changes in the pons or midbrain." On CTA source images the
//     original dichotomized "from 0 to 7 and 8 to 10"; "Patients with a score of 8-10 were more
//     likely (RR, 12.1; 95% CI, 1.7-84.9) to have a good clinical outcome".
//   Puetz V, et al. AJNR 2009;30:1877 (PMC7051302), same group: "pc-ASPECTS score of 0 indicates
//     ischemic changes in the midbrain, pons, and bilateral thalami, posterior circulation
//     territories, and cerebellar hemispheres"; pc-ASPECTS on CTA source images "(r = 0.75; P < .001)
//     but not NCCT (r = 0.29; P = .063) correlated with pc-ASPECTS on follow-up scans".
//
// Weights sum to 10: 2 thalami + 2 cerebellar hemispheres + 2 PCA territories (1 each) + midbrain 2
// + pons 2. Every region must be read as affected or unaffected: unlike a checkbox, a blank is
// never taken as a normal region, and no partial score is shown. Pure: no DOM, no clock, no network.

export const PCAS_READ = [
  { value: 'unaffected', text: 'No early ischemic change' },
  { value: 'affected', text: 'Early ischemic change' },
];

// [input key, reader-facing name, points subtracted]
export const PCAS_REGIONS = [
  ['leftThalamus', 'left thalamus', 1],
  ['rightThalamus', 'right thalamus', 1],
  ['leftCerebellum', 'left cerebellar hemisphere', 1],
  ['rightCerebellum', 'right cerebellar hemisphere', 1],
  ['leftPca', 'left PCA territory (occipital lobe)', 1],
  ['rightPca', 'right PCA territory (occipital lobe)', 1],
  ['midbrain', 'midbrain', 2],
  ['pons', 'pons', 2],
];

const pick = (v) => (PCAS_READ.some((x) => x.value === v) ? v : null);

export function pcAspects(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const affected = [];
  let lost = 0;
  for (const [key, name, pts] of PCAS_REGIONS) {
    const v = pick(o[key]);
    if (!v) missing.push(name);
    else if (v === 'affected') { affected.push(name); lost += pts; }
  }
  if (missing.length) {
    return {
      valid: false,
      message: `Choose early ischemic change or none for every region; still needed: ${missing.join(', ')}. A blank region is not read as normal.`,
    };
  }

  const score = 10 - lost;
  const low = score <= 7;
  const where = affected.length ? `early ischemic change in the ${affected.join(', ')}` : 'no early ischemic change in any region';
  const range = low
    ? 'in the 0 to 7 group, which the original study on CT angiography source images linked to a lower chance of a good outcome'
    : 'in the 8 to 10 group, which the original study on CT angiography source images linked to a higher chance of a good outcome';

  const notes = [
    'Scoring: 10 minus 1 point for each thalamus, cerebellar hemisphere and PCA territory with early ischemic change, and minus 2 points each for the midbrain and the pons.',
    'The original dichotomy (8 to 10 against 0 to 7) was drawn on CT angiography source images in basilar artery occlusion; a patient scoring 8 to 10 was more likely to have a good outcome (relative risk 12.1, 95% CI 1.7 to 84.9).',
    'On non-contrast CT the read is harder because of posterior fossa artifact: in the same group\'s later study, the non-contrast CT score did not correlate significantly with the follow-up infarct (r 0.29) while the CT angiography source image score did (r 0.75).',
    'A 2021 meta-analysis found lower baseline scores associated with unfavorable outcome, with below 7 the most reasonable cutoff, and high heterogeneity between studies.',
  ];

  return {
    valid: true,
    abnormal: low,
    score,
    affected: affected.length,
    band: `pc-ASPECTS ${score}/10, ${where}: ${range}.`,
    bandLabel: `${score}/10`,
    regions: affected.length ? affected.join(', ') : 'none',
    notes,
    note: 'Puetz V et al, Stroke 2008; weights as tabulated by Lu WZ et al, PLoS One 2021, and by Garg R and Biller J, Front Neurol 2017. '
      + 'The score measures the extent of early ischemic change; it does not by itself decide reperfusion treatment, which stays with the stroke team and local protocol.',
  };
}
