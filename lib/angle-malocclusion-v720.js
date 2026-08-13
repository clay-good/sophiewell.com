// spec-v720: Angle classification of malocclusion.
//
// Classifies the anteroposterior molar relationship (and, for Class II, the incisor pattern).
// Source:
//   Angle EH. Classification of malocclusion. Dental Cosmos. 1899;41:248-264,350-357. Summary
//   per StatPearls (Orthodontics, Malocclusion) and Pocket Dentistry.
//
// The relationship of the mesiobuccal (MB) cusp of the maxillary first molar to the buccal
// groove of the mandibular first molar:
//   Class I  (neutroclusion) = MB cusp occludes IN the buccal groove
//   Class II (distoclusion)  = MB cusp occludes MESIAL to (in front of) the buccal groove
//       Division 1 = proclined / protruded maxillary incisors
//       Division 2 = retroclined / palatally-inclined maxillary central incisors
//   Class III (mesioclusion) = MB cusp occludes DISTAL to (behind) the buccal groove
//
// Returns the Angle class (and division for Class II). Pure: no DOM, no clock, no network.

export const ANGLE_NOTE = 'Angle classification of malocclusion (Angle EH, Dental Cosmos 1899;41:248-264), based on the relationship of the mesiobuccal cusp of the upper first molar to the buccal groove of the lower first molar. In Class I, or neutroclusion, the cusp occludes in the buccal groove. In Class II, or distoclusion, the cusp occludes mesial to (in front of) the buccal groove; it is subdivided into Division 1 with proclined, protruded upper incisors and Division 2 with retroclined, palatally inclined upper central incisors. In Class III, or mesioclusion, the cusp occludes distal to (behind) the buccal groove. The molar-cusp geometry is definitive: Class II is distoclusion and Class III is mesioclusion (some summaries swap these terms). It describes the occlusal relationship to guide orthodontic assessment and does not by itself prescribe treatment; it supports rather than replaces the orthodontic evaluation and clinical judgment.';

const CLASS_LABEL = {
  I: 'neutroclusion (normal molar relationship)',
  II: 'distoclusion (upper molar forward of the lower)',
  III: 'mesioclusion (upper molar behind the lower)',
};

export function angleMalocclusion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rel = o.molarRelationship;
  let cls;
  if (rel === 'neutroclusion') cls = 'I';
  else if (rel === 'distoclusion') cls = 'II';
  else if (rel === 'mesioclusion') cls = 'III';
  else {
    return { valid: false, code: 'MISSING_INPUT', field: 'molarRelationship', message: 'Select the molar relationship (neutroclusion, distoclusion, or mesioclusion).', note: ANGLE_NOTE };
  }

  let division = null;
  if (cls === 'II') {
    if (o.incisors === 'proclined') division = 1;
    else if (o.incisors === 'retroclined') division = 2;
    else {
      return { valid: false, code: 'MISSING_INPUT', field: 'incisors', message: 'For Class II, select the maxillary incisor pattern (proclined = Division 1, retroclined = Division 2).', note: ANGLE_NOTE };
    }
  }

  const divText = division ? ` Division ${division}` : '';
  const incisorText = division === 1 ? ' with proclined maxillary incisors' : (division === 2 ? ' with retroclined maxillary central incisors' : '');
  return {
    valid: true,
    angleClass: cls,
    division,
    tier: `class-${cls.toLowerCase()}${division ? `-div${division}` : ''}`,
    // Class II or III is a malocclusion by molar relationship; Class I is the normal relationship.
    abnormal: cls !== 'I',
    bandLabel: `Angle Class ${cls}${divText}`,
    band: `Angle Class ${cls}${divText} — ${CLASS_LABEL[cls]}${incisorText}.`,
    detail: 'Class I MB cusp in the buccal groove; Class II mesial to it (Div 1 proclined / Div 2 retroclined incisors); Class III distal to it.',
    note: ANGLE_NOTE,
  };
}
