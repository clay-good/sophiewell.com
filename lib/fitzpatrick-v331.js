// spec-v331: Fitzpatrick skin phototype (I-VI). Classifies constitutive skin color by its
// sunburn/tan response to UV, which stratifies photosensitivity, skin-cancer risk, and
// phototherapy/laser dosing. The catalog carries many dermatology severity tiles (PASI,
// EASI, SCORAD, SCORTEN, DLQI, UAS7) but had no Fitzpatrick phototype ("fitzpatrick" was
// absent). "fitzpatrick" / "skin type" / "phototype" routed to nothing.
//
// HIGH-STAKES: this reports the PHOTOTYPE the clinician has determined, NOT a diagnosis or a
// treatment order (spec-v11 §5.3). The laser/phototherapy settings and sun-protection plan
// stay with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Fitzpatrick TB. The validity and practicality of sun-reactive skin types I through
//     VI. Arch Dermatol. 1988;124(6):869-871 (the six-phototype scale).
//   - DermNet / StatPearls reproductions of the same I-VI sunburn/tan descriptions.
//
// Phototypes (by response to UV):
//   I  : always burns, never tans (pale white; often blond/red hair, blue eyes, freckles).
//   II : usually burns, tans minimally (fair white).
//   III: sometimes burns, tans gradually and uniformly (darker white / cream).
//   IV : burns minimally, tans well (light brown / olive).
//   V  : rarely burns, tans darkly and easily (brown).
//   VI : never burns, deeply pigmented (dark brown to black).

const TYPES = {
  I: { roman: 'I', text: 'Fitzpatrick type I — always burns, never tans. Pale white skin, often with blond or red hair, blue eyes, and freckles. Highest photosensitivity and UV / skin-cancer risk.', highRisk: true },
  II: { roman: 'II', text: 'Fitzpatrick type II — usually burns, tans minimally. Fair white skin. High photosensitivity.', highRisk: true },
  III: { roman: 'III', text: 'Fitzpatrick type III — sometimes burns, then tans gradually and uniformly. Darker white / cream skin.', highRisk: false },
  IV: { roman: 'IV', text: 'Fitzpatrick type IV — burns minimally, tans well. Light brown or olive skin.', highRisk: false },
  V: { roman: 'V', text: 'Fitzpatrick type V — rarely burns, tans darkly and easily. Brown skin.', highRisk: false },
  VI: { roman: 'VI', text: 'Fitzpatrick type VI — never burns, deeply pigmented. Dark brown to black skin.', highRisk: false },
};

const NOTE = 'Fitzpatrick skin phototype (Fitzpatrick 1988) classifies constitutive skin color by its sunburn/tan response to UV. I: always burns, never tans. II: usually burns, tans minimally. III: sometimes burns, tans gradually. IV: burns minimally, tans well. V: rarely burns, tans darkly. VI: never burns, deeply pigmented. Lower types (I-II) have the highest photosensitivity and UV / skin-cancer risk; higher types are less UV-sensitive but note that pigmented skin can still develop skin cancer and photodamage. Used to guide sun protection, phototherapy starting dose, and laser settings. This reports the phototype, not a diagnosis or a treatment order.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };

// input:
//   type: 'I' .. 'VI' (case-insensitive; also accepts 1-6)
export function fitzpatrick(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Fitzpatrick skin type (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    type: t.roman,
    highRisk: t.highRisk,
    abnormal: t.highRisk,
    bandLabel: `Fitzpatrick type ${t.roman}`,
    band: t.text,
    note: NOTE,
  };
}
