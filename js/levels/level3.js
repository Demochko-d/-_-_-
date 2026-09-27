"use strict";
// Уровень автоматически находится загрузчиком по имени файла level3.js.
GameApp.levels.level3 = {
  ...GameApp.levels.level1,
  id: "level3",
  order: 3,
  name: "Поздний час",
  reward: 90,
  waves: [
    { type: "brute", count: 2, delay: 2, side: "left", storm: true },
    { type: "runner", count: 5, delay: 5, side: "left", storm: false },
    { type: "runner", count: 5, delay: 6, side: "right", storm: false },
    { type: "brute", count: 1, delay: 3, side: "left", storm: false },
    { type: "splitter", count: 2, delay: 6, side: "left", storm: false },
    { type: "ninja", count: 2, delay: 14, side: "left", storm: true },
    { type: "ninja", count: 2, delay: 9, side: "left", storm: false },
    { type: "splitter", count: 1, delay: 5, side: "right", storm: true },
    { type: "runner", count: 3, delay: 5, side: "left", storm: false },
    { type: "runner", count: 2, delay: 0, side: "right", storm: false },
    { type: "ninja", count: 1, delay: 8, side: "right", storm: true },
    { type: "ninja", count: 3, delay: 8, side: "left", storm: true },
    { type: "runner", count: 12, delay: 2, side: "left", storm: false },
    { type: "splitter", count: 4, delay: 10, side: "left", storm: true },
    { type: "runner", count: 4, delay: 7, side: "right", storm: false },
    { type: "brute", count: 2, delay: 8, side: "left", storm: false },
    { type: "runner", count: 3, delay: 4, side: "left", storm: false },
    { type: "runner", count: 4, delay: 3, side: "left", storm: false },
    { type: "splitter", count: 2, delay: 9, side: "left", storm: true },
  ],
  spawn: { interval: GameApp.config.game.spawn.interval }
};
