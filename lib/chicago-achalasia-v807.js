// spec-v807: Chicago Classification v4.0 achalasia subtypes.
//
// Source:
//   Yadlapati R, Kahrilas PJ, Fox MR, et al. Esophageal motility disorders on high-
//   resolution manometry: Chicago classification version 4.0. Neurogastroenterol Motil.
//   2021;33(1):e14058. (PMID 33373111.) Achalasia criteria per the accompanying technical
//   review, Khan MA, et al. Neurogastroenterol Motil. 2021;33(7):e14182.
//
// TWO REQUIREMENTS GATE ALL THREE SUBTYPES, and neither is optional:
//   an abnormal median integrated relaxation pressure (IRP), and
//   100% absent peristalsis - every swallow either failed or premature.
//
// With that gate met, the subtype is decided by what the body of the esophagus does:
//   type III  20% or more of swallows premature (spastic), meaning a distal latency under
//             4.5 seconds with a distal contractile integral above 450 mmHg.s.cm
//   type II   panesophageal pressurization in 20% or more of swallows
//   type I    neither - failed peristalsis with no pressurization and no spasm
//
// Spasm defines type III, so it is checked first. The subtype is not cosmetic: it is the
// main thing that separates who does well with pneumatic dilation from who is usually
// offered a myotomy.
//
// Pure: no DOM, no clock, no network.

export const CHICAGO_NOTE = 'The Chicago Classification version 4.0 (Yadlapati R, Kahrilas PJ, Fox MR, et al, Neurogastroenterol Motil 2021;33(1):e14058) sorts achalasia into three subtypes on high-resolution manometry. Two things gate all three and neither is optional: an abnormal median integrated relaxation pressure, meaning the lower esophageal sphincter does not relax, and one hundred percent absent peristalsis, meaning every swallow either fails or is premature. With that gate met, the subtype turns on what the body of the esophagus does. Twenty percent or more of swallows being premature or spastic, a distal latency under 4.5 seconds with a distal contractile integral above 450, is type three. Panesophageal pressurization in twenty percent or more of swallows is type two. Neither of those is type one, failed peristalsis with a quiet esophageal body. Spasm defines type three, so it is looked for first. The subtype matters because it is the main thing separating who tends to do well with pneumatic dilation from who is usually offered a myotomy instead, and type two generally has the best outcomes of the three. It reads a study already performed and reported; it does not interpret tracings and it does not choose a treatment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function chicagoAchalasia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const abnormalIrp = truthy(o.abnormalIrp);
  const absentPeristalsis = truthy(o.absentPeristalsis);
  const spasm = truthy(o.prematureSwallows);
  const pressurization = truthy(o.panesophagealPressurization);

  const missing = [];
  if (!abnormalIrp) missing.push('an abnormal median integrated relaxation pressure');
  if (!absentPeristalsis) missing.push('100% absent peristalsis');

  if (missing.length) {
    return {
      valid: true,
      achalasia: false,
      subtype: null,
      missing,
      abnormal: false,
      bandLabel: 'Achalasia criteria not met',
      band: `Achalasia is not established on these criteria — still needed: ${missing.join(' and ')}. Another motility disorder may still be present, and an isolated abnormal relaxation pressure without absent peristalsis is its own finding rather than achalasia.`,
      detail: 'Both gates are required before any subtype applies: an abnormal median integrated relaxation pressure AND 100% absent peristalsis. Without both, the Chicago Classification points elsewhere, including to esophagogastric junction outflow obstruction.',
      note: CHICAGO_NOTE,
    };
  }

  // Spasm is what defines type III, so it decides first.
  let subtype;
  let reason;
  if (spasm) {
    subtype = 'III';
    reason = '20% or more of swallows are premature (spastic)';
  } else if (pressurization) {
    subtype = 'II';
    reason = 'panesophageal pressurization in 20% or more of swallows, with no spasm';
  } else {
    subtype = 'I';
    reason = 'failed peristalsis with neither pressurization nor spasm';
  }

  return {
    valid: true,
    achalasia: true,
    subtype,
    missing: [],
    bothBodyFeatures: spasm && pressurization,
    abnormal: true,
    bandLabel: `Achalasia type ${subtype}`,
    band: `Achalasia type ${subtype} — ${reason}.${spasm && pressurization ? ' Pressurization was also recorded, but spasm is what defines type III.' : ''}`,
    detail: 'Both gates first: an abnormal median integrated relaxation pressure and 100% absent peristalsis. Then the esophageal body decides. 20% or more premature swallows, a distal latency under 4.5 s with a distal contractile integral above 450, is type III. Panesophageal pressurization in 20% or more of swallows is type II. Neither is type I. Spasm is checked first because it is what defines type III.',
    note: CHICAGO_NOTE,
  };
}
