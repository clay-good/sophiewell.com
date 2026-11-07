// spec-v1697 tool 1: ACMG/AMP variant class from the evidence codes a curator applied, by three published
// methods side by side.
//
//   (a) Richards S, et al. Genet Med 2015;17:405-424, Table 5: the combining rules, counted at each code's
//       applied strength ("some criteria listed as one weight can be moved to another weight using
//       professional judgment"). A modified strength is written the ClinGen SVI way, CODE_Strength.
//   (b) Tavtigian SV, et al. Hum Mutat 2020;41:1734-1737, Tables 2 and 3: supporting 1, moderate 2,
//       strong 4, very strong 8 points (negative for benign); Pathogenic >= 10, Likely pathogenic 6 to 9,
//       uncertain 0 to 5, Likely benign -1 to -6, Benign <= -7. BA1 is not scored.
//   (c) Tavtigian SV, et al. Genet Med 2018;20:1054-1060: odds of pathogenicity = 350^(points / 8),
//       posterior = odds x prior / ((odds - 1) x prior + 1), prior 0.10.
//
// Gene- and disease-specific ClinGen specifications are not applied. Code descriptions are paraphrased in a
// few words, never copied (the 2015 paper is not openly licensed).
//
// Pure: no DOM, no clock, no network.

import { probability } from './bayes-table.js';

const STRENGTH = {
  supporting: { key: 'supporting', label: 'Supporting', suffix: 'Supporting', points: 1 },
  moderate: { key: 'moderate', label: 'Moderate', suffix: 'Moderate', points: 2 },
  strong: { key: 'strong', label: 'Strong', suffix: 'Strong', points: 4 },
  veryStrong: { key: 'veryStrong', label: 'Very strong', suffix: 'VeryStrong', points: 8 },
};

// Every 2015 code, its direction, its default (Richards) weight, and a few-word paraphrase.
export const CODES = [
  ['PVS1', 'veryStrong', 'predicted loss-of-function variant where loss of function causes disease'],
  ['PS1', 'strong', 'same amino acid change as a known pathogenic variant'],
  ['PS2', 'strong', 'confirmed de novo'],
  ['PS3', 'strong', 'functional studies show a damaging effect'],
  ['PS4', 'strong', 'more common in affected people than controls'],
  ['PM1', 'moderate', 'mutational hot spot or critical functional domain'],
  ['PM2', 'moderate', 'absent or extremely rare in population databases'],
  ['PM3', 'moderate', 'in trans with a pathogenic variant (recessive)'],
  ['PM4', 'moderate', 'protein length change'],
  ['PM5', 'moderate', 'new missense at a residue with a known pathogenic missense'],
  ['PM6', 'moderate', 'assumed de novo'],
  ['PP1', 'supporting', 'cosegregates with disease in a family'],
  ['PP2', 'supporting', 'missense in a gene with little benign missense variation'],
  ['PP3', 'supporting', 'computational evidence of a deleterious effect'],
  ['PP4', 'supporting', 'phenotype highly specific for the gene'],
  ['PP5', 'supporting', 'reputable source reports pathogenic'],
  ['BA1', 'standAlone', 'allele frequency above 5%'],
  ['BS1', 'strong', 'allele frequency greater than expected for the disorder'],
  ['BS2', 'strong', 'seen in a healthy adult where full penetrance is expected early'],
  ['BS3', 'strong', 'functional studies show no damaging effect'],
  ['BS4', 'strong', 'does not segregate with disease'],
  ['BP1', 'supporting', 'missense where truncating variants cause disease'],
  ['BP2', 'supporting', 'in trans or cis with a pathogenic variant, against the model'],
  ['BP3', 'supporting', 'in-frame change in a repeat without known function'],
  ['BP4', 'supporting', 'computational evidence of no impact'],
  ['BP5', 'supporting', 'found in a case with another molecular cause'],
  ['BP6', 'supporting', 'reputable source reports benign'],
  ['BP7', 'supporting', 'synonymous with no predicted splice impact'],
].map(([code, weight, gist]) => ({ code, weight, gist, benign: code[0] === 'B' }));

const BY_CODE = new Map(CODES.map((c) => [c.code, c]));
const TOKEN = /(PVS1|PS[1-4]|PM[1-6]|PP[1-5]|BA1|BS[1-4]|BP[1-7])(?:[ _-]*(very[ _-]*strong|strong|moderate|supporting|stand[ _-]*alone))?/gi;

function strengthKey(word) {
  const w = word.toLowerCase().replace(/[ _-]/g, '');
  if (w === 'verystrong') return 'veryStrong';
  if (w === 'standalone') return 'standAlone';
  return w;
}

// parseCodes('PVS1\nPM2_Supporting') -> { codes: [{ code, strength, modified }] } or { message }.
export function parseCodes(raw, { otherBenignWeights = false } = {}) {
  const s = String(raw ?? '');
  if (!s.trim()) return { message: 'Enter the evidence codes applied, one per line, for example PVS1 or PS3_Moderate.' };
  const leftover = s.replace(TOKEN, ' ').replace(/[\s,;]+/g, '');
  if (leftover) return { message: `The list holds text that is not an ACMG/AMP code. Use the 2015 codes (PVS1, PS1 to PS4, PM1 to PM6, PP1 to PP5, BA1, BS1 to BS4, BP1 to BP7), each optionally followed by _Supporting, _Moderate, _Strong or _VeryStrong.` };
  const out = [];
  const seen = new Set();
  for (const m of s.matchAll(TOKEN)) {
    const def = BY_CODE.get(m[1].toUpperCase());
    if (seen.has(def.code)) return { message: `${def.code} is listed twice; apply each code once, at one strength.` };
    seen.add(def.code);
    const key = m[2] ? strengthKey(m[2]) : def.weight;
    if (def.code === 'BA1') {
      if (key !== 'standAlone') return { message: 'BA1 is a stand-alone criterion in the 2015 rules and takes no other strength here.' };
      out.push({ ...def, strength: 'standAlone', modified: false });
      continue;
    }
    if (key === 'standAlone') return { message: `Only BA1 is stand-alone; ${def.code} takes supporting, moderate, strong or very strong.` };
    if (def.benign) {
      if (key === 'veryStrong') return { message: `${def.code} cannot be applied at very strong: the point system has no very strong benign weight other than BA1.` };
      if (key === 'moderate' && !otherBenignWeights) return { message: `${def.code}_Moderate: the 2015 rules move a benign code only between supporting and strong. Tick that a gene-specific specification allows a moderate benign weight to use it.` };
    }
    out.push({ ...def, strength: key, modified: key !== def.weight });
  }
  return { codes: out };
}

export function notation(c) {
  return c.modified ? `${c.code}_${STRENGTH[c.strength].suffix}` : c.code;
}

// Richards 2015 Table 5 at applied strengths. Returns the first rule met in each direction.
function richards(codes) {
  const n = { pvs: 0, ps: 0, pm: 0, pp: 0, ba: 0, bs: 0, bp: 0, bm: 0 };
  for (const c of codes) {
    if (c.benign) {
      if (c.strength === 'standAlone') n.ba++;
      else if (c.strength === 'strong') n.bs++;
      else if (c.strength === 'moderate') n.bm++;
      else n.bp++;
    } else if (c.strength === 'veryStrong') n.pvs++;
    else if (c.strength === 'strong') n.ps++;
    else if (c.strength === 'moderate') n.pm++;
    else n.pp++;
  }
  let path = null;
  if (n.pvs === 1 && (n.ps >= 1 || n.pm >= 2 || (n.pm === 1 && n.pp === 1) || n.pp >= 2)) path = { cls: 'Pathogenic', rule: 'Pathogenic (i)' };
  else if (n.ps >= 2) path = { cls: 'Pathogenic', rule: 'Pathogenic (ii)' };
  else if (n.ps === 1 && (n.pm >= 3 || (n.pm === 2 && n.pp >= 2) || (n.pm === 1 && n.pp >= 4))) path = { cls: 'Pathogenic', rule: 'Pathogenic (iii)' };
  else if (n.pvs === 1 && n.pm === 1) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (i)' };
  else if (n.ps === 1 && (n.pm === 1 || n.pm === 2)) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (ii)' };
  else if (n.ps === 1 && n.pp >= 2) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (iii)' };
  else if (n.pm >= 3) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (iv)' };
  else if (n.pm === 2 && n.pp >= 2) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (v)' };
  else if (n.pm === 1 && n.pp >= 4) path = { cls: 'Likely pathogenic', rule: 'Likely pathogenic (vi)' };
  let ben = null;
  if (n.ba >= 1) ben = { cls: 'Benign', rule: 'Benign (i)' };
  else if (n.bs >= 2) ben = { cls: 'Benign', rule: 'Benign (ii)' };
  else if (n.bs === 1 && n.bp >= 1) ben = { cls: 'Likely benign', rule: 'Likely benign (i)' };
  else if (n.bp >= 2) ben = { cls: 'Likely benign', rule: 'Likely benign (ii)' };
  return { n, path, ben };
}

export function pointsClass(points) {
  if (points >= 10) return 'Pathogenic';
  if (points >= 6) return 'Likely pathogenic';
  if (points >= 0) return 'Uncertain significance';
  if (points >= -6) return 'Likely benign';
  return 'Benign';
}

// Tavtigian 2018: odds = 350^(points / 8); posterior from the prior.
export function posterior(points, prior = 0.1) {
  const odds = 350 ** (points / 8);
  return (odds * prior) / ((odds - 1) * prior + 1);
}

const sig4 = (x) => Number(x.toPrecision(4));

export function acmgVariantClassify(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const other = o.otherBenignWeights === true || o.otherBenignWeights === 'true';
  const parsed = parseCodes(o.codes, { otherBenignWeights: other });
  if (parsed.message) return { valid: false, message: parsed.message };
  const codes = parsed.codes;
  let prior = 0.1;
  const priorRaw = String(o.prior ?? '').trim();
  if (priorRaw) {
    const p = probability('the prior probability of pathogenicity', priorRaw);
    if (p.message) return { valid: false, message: p.message };
    if (p.value <= 0 || p.value >= 1) return { valid: false, message: 'The prior must be above 0 and below 1; the published framework uses 0.10.' };
    prior = p.value;
  }

  const { n, path, ben } = richards(codes);
  const hasPath = codes.some((c) => !c.benign);
  const hasBen = codes.some((c) => c.benign);
  let richardsClass;
  let richardsWhy;
  if (path && ben) { richardsClass = 'Uncertain significance'; richardsWhy = `the criteria conflict: ${path.rule} and ${ben.rule} are both met`; }
  else if (path) { richardsClass = path.cls; richardsWhy = `rule ${path.rule}`; }
  else if (ben) { richardsClass = ben.cls; richardsWhy = `rule ${ben.rule}`; }
  else if (hasPath && hasBen) { richardsClass = 'Uncertain significance'; richardsWhy = 'the criteria conflict: codes point both ways and no rule is met'; }
  else { richardsClass = 'Uncertain significance'; richardsWhy = 'no combining rule is met'; }

  const scored = codes.filter((c) => c.strength !== 'standAlone');
  const points = scored.reduce((s, c) => s + (c.benign ? -1 : 1) * STRENGTH[c.strength].points, 0);
  const ba1 = n.ba > 0;
  const ptsClass = pointsClass(points);
  const post = posterior(points, prior);
  const written = codes.map(notation);

  const notes = [
    `Codes as applied: ${written.join(', ')}.`,
    ...codes.map((c) => `${notation(c)}: ${c.gist}${c.strength === 'standAlone' ? ' (stand-alone)' : ` (${STRENGTH[c.strength].label.toLowerCase()}, ${c.benign ? '-' : '+'}${STRENGTH[c.strength].points} point${STRENGTH[c.strength].points === 1 ? '' : 's'})`}.`),
    `2015 rules (Richards Table 5): ${richardsClass}, ${richardsWhy}.`,
    ba1
      ? `Points (Tavtigian 2020): BA1 is not scored in the point system; the other codes total ${points} (${ptsClass}).`
      : `Points (Tavtigian 2020): ${points}, ${ptsClass}.`,
    `Posterior probability of pathogenicity (Tavtigian 2018): ${sig4(post)} at a prior of ${sig4(prior)}; odds of pathogenicity 350^(${points}/8) = ${sig4(350 ** (points / 8))}.`,
  ];
  const flags = [];
  if (!ba1 && richardsClass !== ptsClass) flags.push(`The two methods disagree: the 2015 rules give ${richardsClass} and the points give ${ptsClass}.`);
  if (path && (path.rule === 'Pathogenic (ii)' || path.rule === 'Likely pathogenic (i)')) {
    flags.push(`Tavtigian 2018 found ${path.rule} inconsistent with the Bayesian framework: two strong codes reach a posterior of ${sig4(posterior(8))}, inside the likely pathogenic range, while very strong with moderate reaches ${sig4(posterior(10))}, above the 0.99 pathogenic threshold.`);
  }
  if (ba1 && hasPath) flags.push(`BA1 is not scored, so the points (${points}) and the posterior (${sig4(post)}) count only the other codes and leave the stand-alone benign evidence out; they are not a classification of this variant. The 2015 rules read BA1 beside pathogenic evidence as a conflict.`);
  if (n.pvs >= 2) flags.push('Table 5 has no rule for two very strong codes; the 2015 class reads only the combinations the table lists.');
  const pm2 = codes.find((c) => c.code === 'PM2');
  if (n.pvs >= 1 && pm2 && pm2.strength === 'supporting') {
    flags.push('ClinGen\'s PM2 recommendation (approved September 4, 2020) lowered PM2 to supporting and states that one very strong code with one supporting code reaches Likely pathogenic (posterior 0.988), a combination Table 5 does not list.');
  }
  if (points === 6 && prior === 0.1) {
    flags.push(`Tavtigian 2020 treats the prior as just above 0.10 (0.102 is given), so 6 points meets the 0.90 likely pathogenic threshold; at exactly 0.10 the posterior is ${sig4(post)}, and at 0.102 it is ${sig4(posterior(6, 0.102))}.`);
  }
  if (path && ben === null && hasBen) {
    flags.push(`Benign code(s) ${codes.filter((c) => c.benign).map(notation).join(', ')} meet no benign rule, so the 2015 class stands; some laboratories read any opposing code as a conflict.`);
  }

  const fired = path && !ben ? path.rule : ben && !path ? ben.rule : null;
  const richardsLine = fired ? `2015 rules: ${fired}` : `2015 rules: ${richardsClass}, as ${richardsWhy}`;
  const pointsLine = ba1 ? 'points: BA1 not scored' : `points ${points}: ${ptsClass}`;
  return {
    valid: true,
    richardsClass,
    richardsRule: fired,
    points,
    pointsClass: ptsClass,
    posterior: sig4(post),
    prior: sig4(prior),
    codesWritten: written,
    abnormal: false,
    band: `${richardsLine}; ${pointsLine}; posterior ${sig4(post)}.`,
    bandLabel: richardsClass,
    notes: [...notes, ...flags],
    note: 'This combines only the codes entered, at the strengths entered. Gene- and disease-specific ClinGen specifications are not applied, and no class here is a final interpretation.',
  };
}
