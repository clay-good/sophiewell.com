// spec-v1037: the tiles that answer without a field the agent surface requires.
//
// A debt ledger, not a list of approvals -- the same shape as
// empty-form-ledger.js. It was seeded from the sweep that found these: clear
// exactly one field that mcp/fields.js marks `required`, leave the worked
// example in place everywhere else, and see whether the tile still answers. An
// agent omitting that input gets MISSING_INPUT and no number.
//
// Seventy-five tiles answered. Sixty-one have been fixed since, across
// spec-v1037 to spec-v1047. These 15 are what is left -- every one of them
// category 3 -- and each carries the reason it is there, because a bare id is a
// list of tiles somebody once looked at rather than a list of decisions.
//
// Each line is one of three things:
//
//   1. The browser should ask, and does not yet.
//   2. The `required` declaration is wrong, and the AGENT surface is refusing
//      input it could answer from. Fixing the declaration is also a fix.
//   3. A genuine exception: the tile answers about what IS entered, and says so.
//
// The gate's job while this drains is to stop NEW ones. Adding a line needs a
// sentence in the pull request saying which of the three it is.
export const ANSWERS_WITHOUT_A_REQUIRED_FIELD = new Set([
  // --- 3: a sum over things that are either present or absent. A blank drug is
  // a drug not running; a blank dose is a dose not given. The total is about
  // what was entered, and the per-item breakdown shows it.
  "anticholinergic-burden",
  "anticholinergic-risk-scale",
  "apap-24h-max",
  "iv-osmolarity",
  "mtp-tracker",
  "norepi-equiv",
  "vis",

  // --- 3: a partial score that states its own footing. Each of these prints
  // how many components it scored ("Scored from 9 of 10 items", "7 of 8 items
  // assessed"), which is the honest answer to a form one lab short, and each
  // refuses the reassuring band while a component is missing (spec-v1006).
  "bard-score",
  "ciwa",
  "glasgow-imrie",
  "hscore-hlh",
  "lrinec",
  // spec-v1078 puts mnihss here for the same reason, and by the same route. Its
  // eleven items were sliders, so spec-v1073 declared them `required` on the
  // agent surface -- the only safe call while the library read an unrated item
  // as a zero. The library now tells absent from zero and states its footing,
  // so with one item cleared the tile reads "mNIHSS 11 of 31: moderate stroke
  // ... Scored from 10 of 11 items; each unrated item can only raise the
  // total". That is the rule-in direction on a monotone scale, which is a
  // better answer than a refusal, so the browser keeps it and the declaration
  // stays strict for callers who cannot see a form.
  "mnihss",

  // spec-v1047 moved wat-1 into this group. It used to be here because its
  // items were sliders and could not be blank; now they can, and with one item
  // cleared it reads "WAT-1 4 of 12: iatrogenic withdrawal present ... Scored
  // from 9 of 10 items". That is the rule-in direction on a monotone scale,
  // stated with its own footing -- the same reason ciwa is on this list.
  "wat-1",

  // --- 3: a one-way conversion answering the direction it has a number for.
  // With a pump rate entered and the ordered dose blank it prints the delivered
  // dose and nothing about the other direction (spec-v1038).
  "oxytocin-titration",

  // --- 3: modifier-order puts the modifiers it was given in claim order. With
  // the first blank and the second filled it orders the one it has, which is an
  // answer about what was entered.
  "modifier-order",

]);
