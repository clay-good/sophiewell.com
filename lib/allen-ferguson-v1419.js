// spec-v1419: Allen and Ferguson mechanistic classification of subaxial cervical spine injuries.
//
// Sources, read 2026-09-24:
//   Allen BL Jr, Ferguson RL, Lehmann TR, O'Brien RP. A mechanistic classification of closed,
//     indirect fractures and dislocations of the lower cervical spine. Spine 1982;7(1):1-27
//     (PubMed 7071658) -- the original, 165 injuries grouped by presumed injury vector.
//   Bunzel EW, Gendelberg D. Classifications In Brief: The Allen and Ferguson Classification.
//     Clin Orthop Relat Res 2024;482(7):1137-1144 (PMC11219176). Six phylogenies, "compressive
//     flexion, vertical compression, distractive flexion, compressive extension, distractive
//     extension, and lateral flexion"; 21 stages, defined in its Figs. 1-6:
//       CF1 "blunting of the superior aspect of the vertebral body"
//       CF2 "loss of height of vertebrae with further anterior body failure"
//       CF3 "fracture line traversing from the superior to inferior endplates"
//       CF4 "same as compressive flexion subgroup 3 with less than 3 mm of posterior translation"
//       CF5 "further posterior translation of the fracture vertebrae with the body displaced into
//           the neural canal"
//       VC1 "central fracture of either the superior or inferior endplate with a cupping deformity"
//       VC2 "fracture of both endplates"
//       VC3 "fracture line connecting both endplates, with peripheral displacement"
//       DF1 "failure of the PLC ... divergence of the spinous processes, facet subluxation, and
//           anterosuperior wedging of distal vertebra"
//       DF2 "unilateral facet dislocation"
//       DF3 "bilateral facet dislocation with 50% anterior displacement of the vertebral body"
//       DF4 "bilateral facet dislocations with 100% anterior displacement"
//       CE1 "unilateral vertebral arch fracture, and may have rotatory displacement"
//       CE2 "bilaminar fractures, which typically occur at contiguous levels"
//       CE3 "bilateral vertebral arch fractures without body displacement"
//       CE4 "same as ... subgroup 3, with anterior vertebral body displacement"
//       CE5 "bilateral arch fractures with full width of body displacement anteriorly"
//       DE1 "avulsion fracture of the anteroinferior vertebral body or failure of the anterior
//           ligamentous complex"; DE2 adds "posterior displacement of the vertebral body"
//       LF1 "asymmetric compression of the ipsilateral arch and body fracture. No
//           anterior-to-posterior displacement"; LF2 adds "distraction in the AP plane and
//           distraction of contralateral articular processes with ligamentous failure"
//   Neurologic facts from the 1982 series as the review reports them: CF5 "10 of 11" total cord
//   lesions; "all five patients with vertical compression subgroup 3" total cord lesions; DE2 "six
//   of the seven patients" had spinal cord injury. Reliability (its Table 1): interobserver kappa
//   0.34 over all 21 stages and 0.50 over the six phylogenies (Stone 2010), lateral flexion -0.16;
//   0.46 overall (Urrutia 2016). The review "strongly recommend[s] against its use in modern-day
//   practice as a diagnostic or prognostic tool"; it "does not dictate treatment".
//
// This is a decoder: the phylogeny is a mechanism the reader infers from the films, so it cannot
// be derived from a finding without guessing. The reader picks the stage; the tool returns the
// published definition and what the review says about it. Pure: no DOM, no clock, no network.

export const AF_STAGE = [
  { value: 'CF1', text: 'Compressive flexion 1: blunted superior aspect of the body' },
  { value: 'CF2', text: 'Compressive flexion 2: lost height, further anterior body failure' },
  { value: 'CF3', text: 'Compressive flexion 3: fracture line from superior to inferior endplate' },
  { value: 'CF4', text: 'Compressive flexion 4: as 3, under 3 mm posterior translation' },
  { value: 'CF5', text: 'Compressive flexion 5: body displaced back into the canal' },
  { value: 'VC1', text: 'Vertical compression 1: one endplate, central cupping' },
  { value: 'VC2', text: 'Vertical compression 2: both endplates fractured' },
  { value: 'VC3', text: 'Vertical compression 3: fracture joins both endplates, fragments displaced' },
  { value: 'DF1', text: 'Distractive flexion 1: facet subluxation, splayed spinous processes' },
  { value: 'DF2', text: 'Distractive flexion 2: unilateral facet dislocation' },
  { value: 'DF3', text: 'Distractive flexion 3: bilateral facet dislocation, 50% displacement' },
  { value: 'DF4', text: 'Distractive flexion 4: bilateral facet dislocation, 100% displacement' },
  { value: 'CE1', text: 'Compressive extension 1: unilateral vertebral arch fracture' },
  { value: 'CE2', text: 'Compressive extension 2: bilaminar fractures' },
  { value: 'CE3', text: 'Compressive extension 3: bilateral arch fractures, no body displacement' },
  { value: 'CE4', text: 'Compressive extension 4: bilateral arch fractures, body displaced forward' },
  { value: 'CE5', text: 'Compressive extension 5: body displaced forward its full width' },
  { value: 'DE1', text: 'Distractive extension 1: anterior avulsion or anterior ligament failure' },
  { value: 'DE2', text: 'Distractive extension 2: as 1, body displaced back into the canal' },
  { value: 'LF1', text: 'Lateral flexion 1: asymmetric arch and body compression, no displacement' },
  { value: 'LF2', text: 'Lateral flexion 2: as 1, plus contralateral distraction and ligament failure' },
];

const PHYLOGENY = {
  CF: 'compressive flexion',
  VC: 'vertical compression',
  DF: 'distractive flexion',
  CE: 'compressive extension',
  DE: 'distractive extension',
  LF: 'lateral flexion',
};
const STAGES = { CF: 5, VC: 3, DF: 4, CE: 5, DE: 2, LF: 2 };

const DEFINITION = {
  CF1: 'blunting of the superior aspect of the vertebral body',
  CF2: 'loss of vertebral height with further failure of the anterior body',
  CF3: 'a fracture line running from the superior to the inferior endplate',
  CF4: 'the stage 3 fracture with less than 3 mm of posterior translation of the fractured vertebra',
  CF5: 'further posterior translation, with the vertebral body displaced into the spinal canal',
  VC1: 'a central fracture of the superior or inferior endplate with a cupping deformity',
  VC2: 'fracture of both endplates',
  VC3: 'a fracture line joining both endplates, with peripheral displacement that may reach the spinal canal',
  DF1: 'failure of the posterior ligamentous complex, with divergent spinous processes, facet subluxation and anterosuperior wedging of the lower vertebra',
  DF2: 'a unilateral facet dislocation',
  DF3: 'bilateral facet dislocation with 50% anterior displacement of the vertebral body',
  DF4: 'bilateral facet dislocation with 100% anterior displacement',
  CE1: 'a unilateral vertebral arch fracture, sometimes with rotatory displacement',
  CE2: 'bilaminar fractures, typically at contiguous levels',
  CE3: 'bilateral vertebral arch fractures without displacement of the body',
  CE4: 'bilateral vertebral arch fractures with anterior displacement of the body',
  CE5: 'bilateral arch fractures with the body displaced anteriorly its full width',
  DE1: 'an avulsion fracture of the anteroinferior vertebral body or failure of the anterior ligamentous complex, widening the disc space',
  DE2: 'the stage 1 injury with posterior displacement of the vertebral body into the spinal canal',
  LF1: 'asymmetric compression fracture of the arch and body on the side of the bend, without anterior-to-posterior displacement',
  LF2: 'the stage 1 injury with distraction in the AP plane and distraction of the opposite articular processes with ligament failure',
};

const SERIES = {
  CF5: 'In the 1982 series, 10 of 11 compressive flexion stage 5 injuries had a complete cord lesion.',
  VC3: 'In the 1982 series, all five vertical compression stage 3 injuries had a complete cord lesion.',
  DE2: 'In the 1982 series, six of seven distractive extension stage 2 injuries had a spinal cord injury.',
};

export function allenFerguson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const stage = AF_STAGE.some((x) => x.value === o.stage) ? o.stage : null;
  if (!stage) return { valid: false, message: 'Choose the Allen and Ferguson phylogeny and stage read from the films.' };

  const key = stage.slice(0, 2);
  const n = Number(stage.slice(2));
  const name = PHYLOGENY[key];
  const notes = [];
  if (SERIES[stage]) notes.push(SERIES[stage]);
  if (key === 'CE' && (n === 3 || n === 4)) {
    notes.push('The original series had no injuries in compressive extension stages 3 and 4; they were described but not observed.');
  }
  if (key === 'LF') {
    notes.push('Lateral flexion had the worst agreement between readers (kappa -0.16 in Stone 2010) and only five cases in the original series.');
  }
  notes.push('The phylogeny is a presumed mechanism read from plain radiographs. Interobserver agreement was kappa 0.34 across all 21 stages and 0.50 across the six phylogenies (Stone 2010), 0.46 overall (Urrutia 2016).');
  notes.push('The 2024 review strongly recommends against using this classification as a diagnostic or prognostic tool; the AO Spine subaxial classification is now widely considered the standard.');

  return {
    valid: true,
    abnormal: true,
    phylogeny: name,
    stage: n,
    band: `Allen and Ferguson ${name} stage ${n} (of ${STAGES[key]}): ${DEFINITION[stage]}.`,
    bandLabel: `${stage} (${name} ${n})`,
    notes,
    note: 'Allen BL Jr et al, Spine 1982 (165 closed, indirect subaxial injuries); stage definitions as given by Bunzel EW and Gendelberg D, Clin Orthop Relat Res 2024. '
      + 'The classification describes the injury; it does not choose the treatment.',
  };
}
