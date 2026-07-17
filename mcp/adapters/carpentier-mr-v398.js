// spec-v398 MCP wave: adapter for the Carpentier classification of mitral regurgitation in
// lib/carpentier-mr-v398.js. The dom key mirrors the browser renderer (views/group-v398.js) and
// META['carpentier-mr'].example. `type` is an enum (I/II/IIIa/IIIb). The compute reports the type and its
// mechanism description. The example sets type II; its expected text is the type description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/carpentier-mr-v398.js';

export default [
  {
    id: 'carpentier-mr',
    summary: 'Carpentier functional classification of mitral regurgitation (types I/II/IIIa/IIIb), by the motion of the mitral leaflets - the "French correction" (Carpentier 1983), the mitral analog of the El Khoury aortic-regurgitation classification, used to plan mitral-valve repair. I: normal leaflet motion (annular dilatation or leaflet perforation). II: excessive motion - leaflet prolapse or flail (chordal or papillary-muscle rupture or elongation, e.g. myxomatous / Barlow degeneration). IIIa: restricted motion in both systole and diastole (structural, e.g. rheumatic). IIIb: restricted motion in systole only (functional, from papillary-muscle displacement and leaflet tethering). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.carpentierMr,
    fields: [
      { dom: 'carp-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIIa', 'IIIb'], label: 'Carpentier type' },
    ],
  },
];
