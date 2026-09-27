"use strict";
// Level 2 использует ту же арену. Для изменения сложности редактируйте только этот список волн.
GameApp.levels.level2 = {
  ...GameApp.levels.level1,
  id: "level2",
  order: 2,
  name: "Обеденый сон",
  reward: 70,
  waves: [
    { type: "runner", count: 1, delay: 3, side: "right", storm: true },
    { type: "runner", count: 8, delay: 4, side: "left", storm: false },
    { type: "runner", count: 4, delay: 5, side: "right", storm: false },
    { type: "brute", count: 2, delay: 7, side: "left", storm: false },
    { type: "splitter", count: 1, delay: 19, side: "left", storm: true },
    { type: "runner", count: 3, delay: 7, side: "right", storm: false },
    { type: "brute", count: 1, delay: 12, side: "right", storm: true },
    { type: "brute", count: 1, delay: 9, side: "left", storm: true },
    { type: "brute", count: 2, delay: 12, side: "left", storm: false },
    { type: "brute", count: 1, delay: 12, side: "left", storm: false },
    { type: "runner", count: 3, delay: 7, side: "left", storm: false },
    { type: "runner", count: 2, delay: 5, side: "right", storm: false },
    { type: "splitter", count: 1, delay: 9, side: "right", storm: true },
    { type: "splitter", count: 3, delay: 10, side: "left", storm: true },
    { type: "runner", count: 3, delay: 1, side: "left", storm: false },
    { type: "brute", count: 3, delay: 18, side: "left", storm: true }
  ],
  spawn: { interval: GameApp.config.game.spawn.interval }
};
