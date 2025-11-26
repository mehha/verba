export type DotPoint = {
  id: number
  x: number
  y: number
}

export type DotPuzzle = {
  id: string
  name: string
  width: number
  height: number
  points: DotPoint[]
  description?: string
}

export const CAT_PUZZLE: DotPuzzle = {
  id: 'cat',
  name: 'Kass (detailsem)',
  width: 400,
  height: 400,
  description: 'Kassipoeg teravate kõrvade ja sabaga. Ühenda 1 → 24.',
  points: [
    { id: 1, x: 120, y: 260 },
    { id: 2, x: 130, y: 230 },
    { id: 3, x: 140, y: 200 },
    { id: 4, x: 150, y: 170 },
    { id: 5, x: 160, y: 140 },
    { id: 6, x: 175, y: 100 }, // vasak kõrv
    { id: 7, x: 190, y: 140 },
    { id: 8, x: 205, y: 100 }, // parem kõrv
    { id: 9, x: 220, y: 140 },
    { id: 10, x: 235, y: 170 },
    { id: 11, x: 245, y: 200 },
    { id: 12, x: 255, y: 230 },
    { id: 13, x: 265, y: 260 },
    { id: 14, x: 255, y: 300 },
    { id: 15, x: 240, y: 340 },
    { id: 16, x: 215, y: 360 },
    { id: 17, x: 185, y: 350 },
    { id: 18, x: 160, y: 360 },
    { id: 19, x: 135, y: 340 },
    { id: 20, x: 120, y: 310 },
    { id: 21, x: 110, y: 285 },
    { id: 22, x: 100, y: 310 }, // saba algus
    { id: 23, x: 90, y: 290 },
    { id: 24, x: 80, y: 270 }, // sabatipp
  ],
}

export const FISH_PUZZLE: DotPuzzle = {
  id: 'fish',
  name: 'Kala',
  width: 400,
  height: 400,
  description: 'Ühenda 1 → 18, et tekiks lihtne kala koos sabaga.',
  points: [
    { id: 1, x: 140, y: 210 },
    { id: 2, x: 170, y: 180 },
    { id: 3, x: 210, y: 160 },
    { id: 4, x: 250, y: 160 },
    { id: 5, x: 290, y: 180 },
    { id: 6, x: 320, y: 210 },
    { id: 7, x: 330, y: 240 },
    { id: 8, x: 320, y: 270 },
    { id: 9, x: 290, y: 300 },
    { id: 10, x: 250, y: 320 },
    { id: 11, x: 210, y: 320 },
    { id: 12, x: 170, y: 300 },
    { id: 13, x: 140, y: 270 },
    { id: 14, x: 110, y: 240 },
    { id: 15, x: 90, y: 220 }, // saba tipp ülemine
    { id: 16, x: 70, y: 240 }, // saba tipp keskmine
    { id: 17, x: 90, y: 260 }, // saba tipp alumine
    { id: 18, x: 110, y: 240 },
  ],
}

export const HOUSE_PUZZLE: DotPuzzle = {
  id: 'house',
  name: 'Maja',
  width: 400,
  height: 400,
  description: 'Lihtne maja katuse ja uksega. Ühenda 1 → 16.',
  points: [
    { id: 1, x: 120, y: 320 },
    { id: 2, x: 120, y: 220 },
    { id: 3, x: 200, y: 140 },
    { id: 4, x: 280, y: 220 },
    { id: 5, x: 280, y: 320 },
    { id: 6, x: 120, y: 320 },
    { id: 7, x: 170, y: 320 }, // uks
    { id: 8, x: 170, y: 260 },
    { id: 9, x: 220, y: 260 },
    { id: 10, x: 220, y: 320 },
    { id: 11, x: 140, y: 240 }, // aken
    { id: 12, x: 160, y: 240 },
    { id: 13, x: 160, y: 260 },
    { id: 14, x: 140, y: 260 },
    { id: 15, x: 140, y: 240 },
    { id: 16, x: 120, y: 320 }, // tagasi algusesse
  ],
}

export const ROCKET_PUZZLE: DotPuzzle = {
  id: 'rocket',
  name: 'Raketa',
  width: 400,
  height: 400,
  description: 'Raketa terava ninaga ja külgtiibadega. Ühenda 1 → 14.',
  points: [
    { id: 1, x: 200, y: 80 },
    { id: 2, x: 240, y: 140 },
    { id: 3, x: 240, y: 220 },
    { id: 4, x: 270, y: 250 },
    { id: 5, x: 240, y: 280 },
    { id: 6, x: 240, y: 340 },
    { id: 7, x: 210, y: 370 },
    { id: 8, x: 190, y: 370 },
    { id: 9, x: 160, y: 340 },
    { id: 10, x: 160, y: 280 },
    { id: 11, x: 130, y: 250 },
    { id: 12, x: 160, y: 220 },
    { id: 13, x: 160, y: 140 },
    { id: 14, x: 200, y: 80 },
  ],
}

export const PUZZLES: DotPuzzle[] = [CAT_PUZZLE, FISH_PUZZLE, HOUSE_PUZZLE, ROCKET_PUZZLE]
