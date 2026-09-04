// spec-v1037: the tiles that answer without a field the agent surface requires.
//
// A debt ledger, not a list of approvals -- the same shape as
// empty-form-ledger.js. It was seeded from the sweep that found these: clear
// exactly one field that mcp/fields.js marks `required`, leave the worked
// example in place everywhere else, and see whether the tile still answers. An
// agent omitting that input gets MISSING_INPUT and no number.
//
// Seventy-five tiles answered. Fifty-seven have been fixed since, across
// spec-v1037 to spec-v1044. These 18 are what is left, and each carries the
// reason it is there, because a bare id is a list of tiles somebody once looked
// at rather than a list of decisions.
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

  // --- 3: a one-way conversion answering the direction it has a number for.
  // With a pump rate entered and the ordered dose blank it prints the delivered
  // dose and nothing about the other direction (spec-v1038).
  "oxytocin-titration",

  // --- 1, blocked on a control change: WAT-1's ten items are SLIDERS, which
  // cannot be blank -- a slider parked at 0 looks like a rating somebody made.
  // The fix is a different control (a select with an unrated option), which
  // takes the field ids into the MCP registry and the example fills with it.
  // See the closing section of docs/spec-v1029.md.
  "wat-1",

  // --- 3: corrected-ca-na is two independent corrections in one tile, and the
  // browser has always printed whichever half it has. spec-v1045 read the
  // declaration against the formula and found the DECLARATION was the defect:
  // every field was required, so an agent holding a sodium and a glucose was
  // refused a corrected sodium. Fixed on the agent side; the browser was right.
  "corrected-ca-na",

  // --- 3: modifier-order puts the modifiers it was given in claim order. With
  // the first blank and the second filled it orders the one it has, which is an
  // answer about what was entered.
  "modifier-order",

  // --- 1: billing tiles that compute money from a blank field. cob-calc
  // refuses without the primary allowed and paid amounts but reads a blank
  // billed charge as $0, and rvu-payment multiplies a blank RVU component by
  // its GPCI and reports a dollar allowance. Each needs the same treatment the
  // clinical tiles got.
  "cob-calc",
  "rvu-payment",
]);
