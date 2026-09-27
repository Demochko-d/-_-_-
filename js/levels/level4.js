"use strict";
// Уровень автоматически находится загрузчиком по имени файла level4.js.
GameApp.levels.level4 = {
  ...GameApp.levels.level1,
  id: "level4",
  order: 4,
  name: "Неспокойная ночь",
  reward: 120,
  waves: [
    { type: "runner", count: 7, delay: 2, side: "left", storm: true },
    { type: "runner2", count: 3, delay: 1, side: "left", storm: true },
    { type: "brute", count: 2, delay: 5, side: "left", storm: false },
    { type: "ninja", count: 1, delay: 6, side: "left", storm: false },
    { type: "runner", count: 8, delay: 4, side: "right", storm: true },
    { type: "runner2", count: 3, delay: 10, side: "right", storm: true },
    { type: "brute", count: 1, delay: 14, side: "right", storm: true },
    { type: "ninja", count: 3, delay: 11, side: "left", storm: false },
    { type: "runner", count: 5, delay: 3, side: "left", storm: false },
    { type: "splitter", count: 4, delay: 13, side: "left", storm: true },
    { type: "runner2", count: 3, delay: 15, side: "left", storm: false },
    { type: "runner2", count: 1, delay: 2, side: "right", storm: false },
    { type: "runner2", count: 3, delay: 6, side: "left", storm: false },
    { type: "brute", count: 1, delay: 8, side: "left", storm: false },
    { type: "brute", count: 1, delay: 8, side: "left", storm: false },
    { type: "brute", count: 1, delay: 9, side: "right", storm: false },
    { type: "runner", count: 15, delay: 4, side: "left", storm: true },
    { type: "runner2", count: 2, delay: 0, side: "right", storm: false },
  ]
};
