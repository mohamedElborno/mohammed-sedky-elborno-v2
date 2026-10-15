// The pen path of the logo, in the logo's own coordinates (see logo-art.ts).
// The centerlines were traced from the artwork (thinned and simplified), and
// the loader reveals the real shapes through a mask that follows them.
//
// The sequence follows how the name is written: محمد, then صدقي, then
// البورنو. Inside each word the pen moves right to left and the dots are put
// in right after the letter they belong to.

/** Width of the pen in the reveal mask: a little wider than the letter strokes. */
export const PEN_WIDTH = 14;
/** Radius of the circle that reveals a diamond dot. */
export const DOT_REVEAL_RADIUS = 9;

export type Point = readonly [number, number];

export type PenItem =
  | { kind: "stroke"; points: Point[] }
  | { kind: "dot"; x: number; y: number }
  | { kind: "word" }; // a longer pause between words

const stroke = (...points: Point[]): PenItem => ({ kind: "stroke", points });
const dot = (x: number, y: number): PenItem => ({ kind: "dot", x, y });
const WORD: PenItem = { kind: "word" };

export const SEQUENCE: PenItem[] = [
  // محمد
  stroke([442.3, 24.5], [442.3, 5], [462.3, 5], [462.3, 24.5], [442.3, 24.5]),
  stroke([442.3, 24.5], [300.3, 25.3]),
  stroke([407.3, 24.8], [407.3, 44.3]),
  stroke([442.3, 24.5], [442.3, 44.5], [241, 44.5], [240.7, 25], [225.8, 24.2]),
  stroke([280.5, 44.5], [280.3, 25], [260.8, 24.5], [260.5, 44.3]),
  WORD,

  // صدقي
  stroke([405, 84.3], [405.3, 104], [422, 104], [425, 101], [425, 64.3], [318.5, 64.8], [318, 104], [383.5, 104]),
  stroke([405, 84.3], [318.3, 84.3]),
  stroke([318, 84.3], [298.3, 84.3], [298.3, 69]),
  stroke([298.3, 84.3], [278.5, 84.3], [278, 64.8], [263.5, 64]),
  stroke([278.3, 84], [232.5, 84.3]),
  stroke([240.8, 44.3], [183.5, 44.5]),
  stroke([182.5, 45], [182, 64.3], [212.5, 64.3]),
  dot(206.8, 24.7),
  dot(188.5, 24.7),
  stroke([212.8, 44.8], [212.5, 84.3], [163.3, 83.8], [162.3, 80.3], [162.3, 64.3], [143, 64.8], [142.3, 82], [141.8, 83.5], [139.3, 84.3], [8, 84.3], [5.5, 83.5], [5, 80.8], [0, 76]),
  stroke([122.3, 64.3], [5.8, 64.5], [0, 70.8], [0, 85.3]),
  dot(90.5, 104),
  dot(72.3, 104),
  WORD,

  // البورنو
  stroke([462.3, 44.5], [462.3, 143.8]),
  stroke([442.3, 64.3], [442.3, 143.5]),
  stroke([441.8, 143.5], [300.5, 143.8], [300.5, 126], [301.8, 124], [331.3, 124], [331.3, 143.5]),
  stroke([423, 128.8], [423, 143.8]),
  dot(381.1, 163.6),
  stroke([331.3, 143.8], [330.5, 163], [300.5, 163.8]),
  stroke([280.8, 128.5], [280, 163], [260.8, 163.8]),
  stroke([260.8, 128.8], [260.8, 142.5], [259.5, 143.8], [169, 143.8], [169, 125.8], [170, 124], [199.5, 124], [199.5, 143.5]),
  dot(233.2, 108.8),
  stroke([199.5, 143.8], [199.5, 160.8], [198.5, 163.3], [169, 163.8]),
];

export const strokeToPath = (points: Point[]) =>
  points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
