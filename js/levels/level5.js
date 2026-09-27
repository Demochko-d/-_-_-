"use strict";
// Уровень автоматически находится загрузчиком по имени файла level5.js.
GameApp.levels.level5 = {
  ...GameApp.levels.level1,
  id: "level5",
  order: 5,
  name: "Плохое предчувствие",
  reward: 150,
  waves: [
    { type: "brute", count: 1, delay: 2, side: "left", storm: true },
    { type: "sniper", count: 1, delay: 1, side: "left", storm: false },
    { type: "runner", count: 4, delay: 5, side: "right", storm: false },
    { type: "runner2", count: 7, delay: 10, side: "left", storm: true },
    { type: "brute", count: 2, delay: 11, side: "left", storm: true },
    { type: "brute", count: 2, delay: 4, side: "left", storm: false },
    { type: "sniper", count: 1, delay: 14, side: "right", storm: false },
    { type: "splitter", count: 2, delay: 4, side: "left", storm: false },
    { type: "sniper", count: 3, delay: 4, side: "right", storm: true },
    { type: "ninja", count: 1, delay: 9, side: "left", storm: false },
    { type: "runner", count: 5, delay: 5, side: "right", storm: false },
    { type: "brute", count: 1, delay: 2, side: "left", storm: true },
    { type: "runner2", count: 6, delay: 2, side: "left", storm: false },
    { type: "splitter", count: 1, delay: 3, side: "right", storm: false },
    { type: "sniper", count: 4, delay: 8, side: "left", storm: false },
    { type: "runner2", count: 3, delay: 2, side: "left", storm: false },
    { type: "brute", count: 1, delay: 7, side: "left", storm: true },
    { type: "ninja", count: 2, delay: 7, side: "left", storm: false },
    { type: "runner", count: 10, delay: 1, side: "right", storm: false },
    { type: "brute", count: 1, delay: 5, side: "left", storm: true },
    { type: "splitter", count: 1, delay: 3, side: "left", storm: false },
  ]
};
