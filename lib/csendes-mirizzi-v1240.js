// spec-v1240: the Csendes classification of Mirizzi syndrome -- types I to V, derived from two
// things the surgeon or endoscopist can actually see: whether the stone has eroded into the bile
// duct, and how much of the duct's circumference it has taken.
//
// Sources:
//   Csendes A, Diaz JC, Burdiles P, Maluenda F, Nava O. Mirizzi syndrome and cholecystobiliary
//   fistula: a unifying classification. Br J Surg. 1989;76(11):1139-1143. PMID 2597969 -- types I-IV.
//   Beltran MA, Csendes A, Cruces KS. The relationship of Mirizzi syndrome and cholecystoenteric
//   fistula: validation of a modified classification. World J Surg. 2008;32(10):2237-2243.
//   PMID 18587614 -- type V, and its Va / Vb split.
//
// The types:
//   I    external compression of the bile duct by a stone impacted in the infundibulum or cystic
//        duct. No fistula. This is Mirizzi's original description.
//   II   cholecystobiliary fistula involving LESS THAN ONE THIRD of the bile duct circumference.
//   III  cholecystobiliary fistula involving up to TWO THIRDS of the circumference.
//   IV   cholecystobiliary fistula with complete destruction of the entire duct wall.
//   Va   any of I-IV WITH a cholecystoenteric fistula, without gallstone ileus.
//   Vb   the same, with gallstone ileus.
//
// TYPE V IS NOT A SIXTH RUNG, IT IS A SECOND AXIS. Csendes' own wording is "any of the existing
// types I-IV with a cholecystoenteric fistula". A patient recorded only as "type V" has not been
// told how much bile duct is left, which is the question the biliary reconstruction turns on. This
// tile therefore reports the base type and the type V modifier together, and says so.
//
// TYPE I IS THE MINORITY. In Csendes' 219-patient series the distribution was 11% type I, 41% type
// II, 44% type III, 4% type IV -- so in roughly five cases out of six the stone had ALREADY eroded
// into the duct. The mental model of Mirizzi as "a stone pressing on the duct" describes the least
// common form. The tile prints this on the type I answer, where it is most likely to mislead.
//
// Pure: no DOM, no clock, no network.

export const CSENDES_NOTE = 'The Csendes classification (Csendes 1989, with type V added by Beltran 2008) sorts Mirizzi syndrome by what the impacted stone has done to the bile duct: type I is external compression with the duct intact, and types II to IV are a cholecystobiliary fistula taking less than a third, up to two thirds, or the whole of the duct circumference. Type V is not a higher type but a second finding -- a cholecystoenteric fistula on top of any of I to IV, Vb if there is gallstone ileus. The fraction of duct wall that survives is what the reconstruction turns on, so a case recorded only as "type V" has left that question unanswered. This reports the type from the findings entered; it is not a diagnosis and not an operative plan.';

export const CSENDES_FISTULA_EXTENT = [
  { value: 'none', type: 'I', text: 'No fistula - the duct is compressed from outside by the impacted stone' },
  { value: 'under-third', type: 'II', text: 'Fistula involving less than one third of the duct circumference' },
  { value: 'up-to-two-thirds', type: 'III', text: 'Fistula involving up to two thirds of the duct circumference' },
  { value: 'entire-wall', type: 'IV', text: 'Fistula with complete destruction of the duct wall' },
];

const BY_VALUE = new Map(CSENDES_FISTULA_EXTENT.map((e) => [e.value, e]));

const TYPE_TEXT = {
  I: 'external compression of the bile duct by a stone impacted in the infundibulum or cystic duct, with the duct wall intact',
  II: 'a cholecystobiliary fistula taking less than one third of the bile duct circumference',
  III: 'a cholecystobiliary fistula taking up to two thirds of the bile duct circumference',
  IV: 'a cholecystobiliary fistula with the entire duct wall destroyed',
};

// Csendes 1989, 219 patients.
export const CSENDES_SERIES = { I: 11, II: 41, III: 44, IV: 4 };

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function csendesMirizzi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.fistula == null ? '' : String(o.fistula).trim();
  if (raw === '') {
    return {
      valid: false,
      message: 'Say whether there is a cholecystobiliary fistula, and if there is, how much of the bile duct circumference it involves.',
    };
  }
  const extent = BY_VALUE.get(raw);
  if (!extent) {
    return {
      valid: false,
      message: 'The fistula extent must be one of: none, under-third, up-to-two-thirds, entire-wall.',
    };
  }

  const base = extent.type;
  const enteric = on(o.cholecystentericFistula);
  const ileus = on(o.gallstoneIleus);
  const modifier = enteric ? (ileus ? 'Vb' : 'Va') : null;
  const reported = modifier ? `${modifier} on a type ${base} duct` : `${base}`;

  const band = modifier
    ? `Csendes type ${modifier} on a type ${base} bile duct: a cholecystoenteric fistula${ileus ? ' with gallstone ileus' : ' without gallstone ileus'}, on top of ${TYPE_TEXT[base]}.`
    : `Csendes type ${base}: ${TYPE_TEXT[base]}.`;

  // The point of reporting both halves rather than the letter alone.
  const modifierNote = modifier
    ? `Type ${modifier} says there is a cholecystoenteric fistula. It does not say how much bile duct is left, and that is the question the biliary reconstruction turns on -- which is why this reads as type ${modifier} on a type ${base} duct rather than as type V alone.`
    : null;

  // Gallstone ileus ticked without a cholecystoenteric fistula is not type Vb; it is an input that
  // has not been used, and a silently dropped input reads as a bug.
  const ileusWithoutFistula = !enteric && ileus
    ? 'Gallstone ileus was recorded but no cholecystoenteric fistula was. Type V is defined by the fistula, so the ileus alone does not make this a type Vb; the a-versus-b split only applies once the enteric fistula is there.'
    : null;

  const prevalenceNote = base === 'I'
    ? `Type I is the least common form. In Csendes' original 219-patient series it was ${CSENDES_SERIES.I}% of cases against ${CSENDES_SERIES.II}% type II and ${CSENDES_SERIES.III}% type III -- in roughly five cases out of six the stone had already eroded into the duct. "A stone pressing on the duct" is the picture most people carry and the one they will meet least often.`
    : null;

  const wallNote = base === 'IV'
    ? 'With the whole duct wall gone there is nothing left to repair over, which is what separates type IV from types II and III.'
    : null;

  return {
    valid: true,
    type: base,
    modifier,
    reported,
    entericFistula: enteric,
    gallstoneIleus: ileus,
    abnormal: base === 'IV' || Boolean(modifier),
    bandLabel: `Csendes type ${modifier || base}`,
    band,
    modifierNote,
    ileusWithoutFistula,
    prevalenceNote,
    wallNote,
    note: CSENDES_NOTE,
  };
}
