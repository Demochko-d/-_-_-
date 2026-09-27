"use strict";
// Уровень автоматически находится загрузчиком по имени файла level8.js.
GameApp.levels.level8 = {
  ...GameApp.levels.level1,
  id: "level8",
  order: 8,
  name: "12 ночи",
  reward: 250,
  waves: [
    { type: "runner", count: 1, delay: 3, side: "left", storm: false },
    { type: "splitter", count: 1, delay: 4, side: "left", storm: false },
    { type: "brute", count: 1, delay: 5, side: "left", storm: false },
    { type: "gigant", count: 1, delay: 8, side: "left", storm: true },
    { type: "runner", count: 5, delay: 13, side: "right", storm: true },
    { type: "splitter", count: 1, delay: 5, side: "left", storm: false },
    { type: "sniper", count: 2, delay: 2, side: "left", storm: false },
    { type: "runner2", count: 4, delay: 7, side: "left", storm: false },
    { type: "ninja", count: 3, delay: 6, side: "left", storm: false },
    { type: "sniper", count: 2, delay: 1, side: "left", storm: false },
    { type: "gigant", count: 1, delay: 8, side: "left", storm: true },
    { type: "sniper", count: 2, delay: 5, side: "left", storm: false },
    { type: "brute", count: 1, delay: 5, side: "right", storm: false },
    { type: "sniper", count: 8, delay: 7, side: "left", storm: false },
    { type: "runner", count: 8, delay: 3, side: "left", storm: false },
    { type: "gigant", count: 1, delay: 15, side: "left", storm: true },
    { type: "runner2", count: 2, delay: 5, side: "left", storm: false },

  ]
};
