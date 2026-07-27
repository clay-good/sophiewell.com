// spec-v511: the CRAFFT score, the six-item adolescent substance-use screen. The catalog already carries the
// adult screens (CAGE, AUDIT, DAST) but "crafft" was zero-hit across the corpus and app.js, so the
// adolescent-specific one was missing.
//
// Six yes/no questions, one point each, total 0-6. Two or more is the validated positive cut point.
// The letters are the mnemonic: Car, Relax, Alone, Forget, Family/Friends, Trouble.
//
// HIGH-STAKES: this is a SCREEN, not a diagnosis. A positive score means further assessment is indicated, not
// that a substance use disorder is present; a negative score does not exclude one, and it does not exclude
// risk from riding with an impaired driver, which the CAR question asks about regardless of the adolescent's
// own use (spec-v11 section 5.3). It is not an indication for drug testing, for a referral to treatment, or
// for disclosure to a parent or guardian: adolescent confidentiality rules vary by jurisdiction and the
// screen does not decide them. The next step stays with the clinician and the adolescent.
//
// ITEMS AND CUT POINT RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Knight JR, Shrier LA, Bravender TD, Farrell M, Vander Bilt J, Shaffer HJ. A new brief screen for
//     adolescent substance abuse. Arch Pediatr Adolesc Med. 1999;153(6):591-596.
//   - Adolescent-medicine references reproducing the same six questions, one point each, and the same
//     positive cut point of 2.

export const CRAFFT_ITEMS = [
  { letter: 'C', text: 'Have you ever ridden in a CAR driven by someone (including yourself) who was high or had been using alcohol or drugs?' },
  { letter: 'R', text: 'Do you ever use alcohol or drugs to RELAX, feel better about yourself, or fit in?' },
  { letter: 'A', text: 'Do you ever use alcohol or drugs while you are by yourself, or ALONE?' },
  { letter: 'F', text: 'Do you ever FORGET things you did while using alcohol or drugs?' },
  { letter: 'F', text: 'Do your FAMILY or FRIENDS ever tell you that you should cut down on your drinking or drug use?' },
  { letter: 'T', text: 'Have you ever gotten into TROUBLE while you were using alcohol or drugs?' },
];

const POSITIVE_AT = 2;

const NOTE = 'The CRAFFT (Knight and colleagues 1999) scores six yes/no questions one point each, total 0 to 6. A score of 2 or more is the validated positive cut point and indicates that further assessment is warranted. It is a screen, not a diagnosis: a positive score does not establish a substance use disorder and a negative score does not exclude one. The CAR question asks about riding with an impaired driver, which is a risk to address whatever the total is. The score is not an indication for drug testing, for a treatment referral, or for disclosure to a parent or guardian; adolescent confidentiality rules vary by jurisdiction and this screen does not decide them.';

function readAnswer(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === 'yes' || v === true || v === 1 || v === '1') return 1;
  if (v === 'no' || v === false || v === 0 || v === '0') return 0;
  return NaN;
}

// input:
//   q1 .. q6: 'yes' or 'no' (all six required), in CRAFFT_ITEMS order.
export function crafft(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (let i = 1; i <= CRAFFT_ITEMS.length; i += 1) vals.push(readAnswer(o[`q${i}`]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Answer all six questions yes or no.' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each answer must be yes or no.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const positive = total >= POSITIVE_AT;
  const text = positive
    ? `CRAFFT ${total} of 6: at or above the positive cut point of 2. Further assessment of substance use is warranted.`
    : `CRAFFT ${total} of 6: below the positive cut point of 2. A negative screen does not exclude a substance use problem.`;

  return {
    valid: true,
    total,
    positive,
    bandLabel: `CRAFFT ${total} of 6`,
    band: text,
    note: NOTE,
  };
}
