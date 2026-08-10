// spec-v695: Manning Criteria for irritable bowel syndrome (IBS).
//
// An older, symptom-count rule for IBS; a companion to the Rome IV criteria already in the
// catalog. Source:
//   Manning AP, Thompson WG, Heaton KW, Morris AF. Towards positive diagnosis of the
//   irritable bowel. Br Med J. 1978;2(6138):653-654. (PMID 698649.)
//
// Six symptoms, each present/absent (count 0-6):
//   Onset of pain linked to more frequent bowel movements
//   Looser stools associated with the onset of pain
//   Pain relieved by passage of stool
//   Noticeable abdominal bloating (distension)
//   Sensation of incomplete evacuation more than 25% of the time
//   Passage of mucus with stool (diarrhea with mucus) more than 25% of the time
//
// Meeting >= 3 of the 6 supports a diagnosis of IBS, PROVIDED alarm/red-flag features are
// absent (weight loss, bleeding, anemia, onset > 50, family history of GI cancer, etc.).
// The more symptoms present, the more likely IBS.
//
// Pure: no DOM, no clock, no network.

export const MANNING_NOTE = 'Manning Criteria for irritable bowel syndrome (Manning AP, Thompson WG, Heaton KW, Morris AF, Br Med J 1978;2(6138):653-654). A symptom-count rule that counts six features, each present or absent: onset of pain linked to more frequent bowel movements, looser stools with the onset of pain, pain relieved by passing stool, noticeable abdominal bloating, a sensation of incomplete evacuation more than a quarter of the time, and passage of mucus with stool more than a quarter of the time. Meeting three or more of the six supports a diagnosis of IBS, and more symptoms make IBS more likely; sensitivity is roughly 63 to 90 percent and specificity roughly 70 to 93 percent. It applies only when alarm features are absent - weight loss, rectal bleeding, anemia, a first onset after about age 50, nocturnal symptoms, or a family history of colorectal cancer or inflammatory bowel disease all warrant investigation first. It supports rather than replaces clinical judgment and does not by itself exclude organic disease.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const ITEMS = [
  { key: 'painFrequentBm', label: 'pain with more frequent stools' },
  { key: 'painLooserStool', label: 'looser stools with pain' },
  { key: 'painRelievedByStool', label: 'pain relieved by defecation' },
  { key: 'bloating', label: 'abdominal bloating' },
  { key: 'incompleteEvac', label: 'incomplete evacuation >25%' },
  { key: 'mucus', label: 'mucus per rectum >25%' },
];

export function manningIbs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let count = 0;
  const factors = [];
  for (const it of ITEMS) {
    if (truthy(o[it.key])) { count += 1; factors.push(it.label); }
  }

  const likely = count >= 3;
  return {
    valid: true,
    score: count,
    tier: likely ? 'likely' : 'less-likely',
    abnormal: likely,
    factors,
    bandLabel: `Manning ${count} of 6`,
    band: `Manning ${count} of 6 — IBS ${likely ? 'likely' : 'less likely'} (>= 3, if no alarm features).`,
    detail: likely
      ? 'Three or more criteria met: supports IBS provided alarm features are absent. More symptoms make IBS more likely.'
      : 'Fewer than three criteria met: IBS is less supported by this rule.',
    note: MANNING_NOTE,
  };
}
