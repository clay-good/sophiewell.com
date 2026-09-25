// spec-v1486: the Periapical Index (PAI), beside the other dental radiographic indices.
//
// Sources, read 2026-09-25:
//   Orstavik D, Kerekes K, Eriksen HM. The periapical index: a scoring system for radiographic
//     assessment of apical periodontitis. Endod Dent Traumatol. 1986;2(1):20-34 (the original).
//   Scores as stated in Iran Endod J 2018 (PMC5911286): "score 1, normal periapical structure; score 2,
//     minor changes in bone structure; score 3, change in bone structure with some mineral loss;
//     score 4, periodontitis with a well-defined radiolucent area and score 5, severe periodontitis
//     with exacerbated features."
//   Int Endod J 2020 (PMC7894281): "For multirooted teeth, the highest of the PAI scores allocated to
//     the individual roots was used", and PAI scores "were frequently dichotomized to 'healthy' versus
//     'diseased' with a cut-off between PAI 2 and 3".
//
// Up to four roots; a root left blank is not scored. Pure: no DOM, no clock.

export const PAI_SCORES = [
  { value: '1', text: '1: normal periapical structure' },
  { value: '2', text: '2: small changes in bone structure' },
  { value: '3', text: '3: changes in bone structure with some mineral loss' },
  { value: '4', text: '4: periodontitis with a well-defined radiolucent area' },
  { value: '5', text: '5: severe periodontitis with exacerbating features' },
];
export const PAI_ROOTS = ['r1', 'r2', 'r3', 'r4'];

const DESC = {
  1: 'normal periapical structure',
  2: 'small changes in bone structure',
  3: 'changes in bone structure with some mineral loss',
  4: 'periodontitis with a well-defined radiolucent area',
  5: 'severe periodontitis with exacerbating features',
};

export function paiPeriapical(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const roots = PAI_ROOTS.map((k, i) => ({ n: i + 1, v: o[k] }))
    .filter((s) => PAI_SCORES.some((c) => c.value === String(s.v)))
    .map((s) => ({ n: s.n, score: Number(s.v) }));
  if (!roots.length) return { valid: false, message: 'Choose the PAI score (1 to 5) for at least one root.' };
  const tooth = Math.max(...roots.map((s) => s.score));
  const diseased = tooth >= 3;
  const status = diseased ? 'apical periodontitis' : 'healthy';
  const reading = diseased ? 'Apical periodontitis (PAI 3 to 5).' : 'Healthy (PAI 1 or 2).';
  const perRoot = roots.length > 1 ? ` Roots: ${roots.map((s) => `root ${s.n} PAI ${s.score}`).join(', ')}.` : '';
  return {
    valid: true,
    pai: tooth,
    diseased,
    abnormal: diseased,
    band: `PAI ${tooth}: ${DESC[tooth]}. ${reading}${perRoot}`,
    bandLabel: `PAI ${tooth}, ${status}`,
    notes: [
      `Scored from ${roots.length === 1 ? '1 root' : `${roots.length} roots`}. For a multirooted tooth the highest root score is the tooth's score, so a root not entered can only raise it.`,
      'The index is read against reference radiographs; when two scores seem to fit, studies using it assign the higher one.',
    ],
    note: 'Periapical Index (Orstavik D et al, Endod Dent Traumatol 1986); scores as stated in Iran Endod J 2018 and the healthy/diseased cut-off in Int Endod J 2020. It grades a periapical radiograph; it does not diagnose on its own.',
  };
}
